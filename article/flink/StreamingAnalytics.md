## 事件时间和水位线

### Flink时间概念

1. **事件时间**：事件发生的时间，由生成（或存储）事件的设备记录。
2. **摄取时间**：Flink 在摄取事件时记录的时间戳。
3. **处理时间**：你的管道中的特定操作符处理事件的时间。

使用**事件时间**，为了获得可重现的结果。

### 使用事件时间

想要使用事件时间，你还需要提供一个时间戳提取器和水位线生成器，Flink 将使用它们来跟踪事件时间的进展。

### 迟到

迟到是相对于水位线定义的。Watermark(t) 断言流完成到时间 t；任何跟随此水位线的时间戳 ≤ t 的事件都是迟到的。

### 窗口

在进行流处理时，很自然地会想要在流的有界子集上计算聚合分析，以回答以下问题：

- 每分钟的页面浏览量
- 每个用户每周的会话数
- 每个传感器每分钟的最大温度

使用 Flink 计算窗口分析依赖于两个主要的抽象：窗口分配器（Window Assigners），它将事件分配到窗口（必要时创建新的窗口对象），以及窗口函数（Window Functions），它被应用于分配到窗口的事件。

Flink 的窗口 API 还包含了触发器（Triggers）的概念，它决定了何时调用窗口函数，以及驱逐器（Evictors），它可以移除窗口中收集的元素。

**也可以在非键控流上使用窗口，但请记住，在这种情况下，处理将不会并行进行：**

### 窗口分配器

Flink 有几种内置的窗口分配器类型。

- 翻滚时间窗口
  - 每分钟的页面浏览量 
  - TumblingEventTimeWindows.of(Time.minutes(1))
- 滑动时间窗口
  - 每分钟的页面浏览量，每10秒计算一次 
  - SlidingEventTimeWindows.of(Time.minutes(1), Time.seconds(10))
- 会话窗口
  - 每会话的页面浏览量，会话由至少30分钟的间隔来定义
  -  EventTimeSessionWindows.withGap(Time.minutes(30))；时长可以使用 Time.milliseconds(n)、Time.seconds(n)、Time.minutes(n)、Time.hours(n) 和 Time.days(n) 中的一个来指定。

基于时间的窗口分配器（包括会话窗口）都有**事件时间**和**处理时间**两种形式。这两种类型的时间窗口存在显著的权衡。使用**处理时间**窗口时，你必须接受以下限制：

1. 无法正确处理历史数据
2. 无法正确处理乱序数据
3. 结果将是不确定的
4. 但优势在于延迟更低

在使用**基于计数的窗口**时，要记住这些窗口只有在批次完成时才会触发。没有选项可以超时并处理部分窗口，可以通过自定义 Trigger 来自己实现这种行为。

**全局窗口分配器将每个事件（具有相同的键）分配给同一个全局窗口。这仅在您要使用自定义触发器进行自己的自定义窗口时才有用**。

### 窗口函数

三种基本的处理窗口内容的方法

- 作为批次处理，使用一个 ProcessWindowFunction，它将被传递一个包含窗口内容的 Iterable；
- 增量式处理，使用一个 ReduceFunction 或 AggregateFunction，它在每个事件被分配到窗口时被调用；
- 使用两者的组合，即当窗口被触发时，将 ReduceFunction 或 AggregateFunction 的预聚合结果提供给 ProcessWindowFunction。

```java
// 方法三
input
    .keyBy(x -> x.key)
    .window(TumblingEventTimeWindows.of(Time.minutes(1)))
    .reduce((value1, value2) -> value1.value > value2.value ? value1 : value2)
    .process(new MyEfficientMax());

public static class MyEfficientMax extends ProcessWindowFunction<
        SensorReading,                  // input type
        Tuple3<String, Long, Integer>,  // output type
        String,                         // key type
        TimeWindow> {                   // window type
    
    @Override
    public void process(
            String key,
            Context context, 
            Iterable<SensorReading> events,
            Collector<Tuple3<String, Long, Integer>> out) {

        // 由于已经使用 reduce 函数预聚合，events 中只有一个元素
        SensorReading maxEvent = events.iterator().next();
        out.collect(Tuple3.of(key, context.window().getEnd(), maxEvent.value));
    }
}
在这个方法3的示例中，首先使用 reduce 函数对窗口中的数据进行预聚合，找到最大值。然后，ProcessWindowFunction 只需要处理这个预聚合的结果，而不是整个窗口的内容。这样可以显著提高处理效率。
```

分配给窗口的所有事件都必须在键控的 Flink 状态中进行缓冲，直到窗口被触发。这可能会相当昂贵。 我们的 ProcessWindowFunction 被传递了一个 Context 对象，其中包含有关窗口的信息。它的接口如下所示：

```java
public abstract class Context implements java.io.Serializable {
    public abstract W window();
    
    public abstract long currentProcessingTime();
    public abstract long currentWatermark();

    public abstract KeyedStateStore windowState();
    public abstract KeyedStateStore globalState();
}
```

**windowState** 和 **globalState** 是你可以存储每个键、每个窗口，或该键所有窗口的全局每个键信息的地方。例如，如果你想要记录有关当前窗口的某些信息，并在处理后续窗口时使用这些信息，这可能会很有用。

### 迟到事件

默认情况下，使用事件时间窗口时，迟到事件会被丢弃。窗口 API 有两个可选部分，可以让你对这种情况有更多的控制。

你可以安排将原本会被丢弃的事件收集到一个替代的输出流中，使用一种称为侧输出（Side Outputs）的机制。以下是一个示例，展示了这可能是什么样子：

```java
OutputTag<Event> lateTag = new OutputTag<Event>("late"){};

SingleOutputStreamOperator<Event> result = stream
    .keyBy(...)
    .window(...)
    .sideOutputLateData(lateTag)
    .process(...);
  
DataStream<Event> lateStream = result.getSideOutput(lateTag);
```

你还可以指定一个允许迟到的时间间隔，在此期间迟到的事件将继续被分配到适当的窗口（这些窗口的状态将被保留）。默认情况下，每个迟到事件都会导致窗口函数再次被调用（有时被称为迟到触发）。

默认情况下，允许的迟到时间为0。换句话说，水位线之后的元素将被丢弃（或者发送到侧输出）。

```
stream
    .keyBy(...)
    .window(...)
    .allowedLateness(Time.seconds(10))
    .process(...);
```

当允许的迟到时间大于零时，只有那些迟到得如此严重以至于会被丢弃的事件才会被发送到侧输出（如果已配置）。

### 时间窗口与纪元对齐 

仅仅因为你使用了持续一小时的处理时间窗口，并且在12:05启动你的应用程序，并不意味着第一个窗口会在1:05关闭。第一个窗口将只有55分钟长，并在1:00关闭。
