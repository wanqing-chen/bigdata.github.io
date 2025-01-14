## 数据管道与ETL

### 无状态转化

- `map()`和`flatmap()`，这是用于实现无状态转换的基本操作。
- `MapFunction`仅适用于执行一对一转换：对于传入的每个流元素，`map()`将发出一个转换后的元素。否则，您将需要使用`flatmap()`。
- `flatmap()`方法可以发出任意数量的流元素，甚至可以包括零个元素。

### Keyed Streams 

#### keyby()

- 能够根据流的一个属性对流进行分区，这样具有相同属性值的所有事件就可以组合在一起。
- 每次调用 `keyBy` 都会导致网络洗牌，从而重新分区流。一般来说，这个过程是相当昂贵的，因为它涉及到**网络通信**以及**序列化**和**反序列化**。

#### 键的计算 

1. KeySelectors 不仅限于从事件中提取键。相反，它们可以以任何你想要的方式计算键，只要生成的键是确定性的。

   如下

   ```java
   keyBy(enrichedRide -> enrichedRide.startCell);
   keyBy(ride -> GeoUtils.mapToGridCell(ride.startLon, ride.startLat)); 
   ```

#### （隐式）状态

- 当状态涉及到你的应用程序时，你应该考虑状态可能变得多大。当键空间无界时，Flink需要的状态量也是无界的。
  在处理流时，通常更有意义的是考虑在有限窗口上的聚合，而不是在整个流上。

- reduce() 和其他聚合器 

  在上面使用的 `maxBy()` 只是Flink的 `KeyedStreams` 上可用的许多聚合函数中的一个例子。还有一个更通用的 `reduce()` 函数，你可以使用它来实现自己的自定义聚合。

  以下是一些Flink `KeyedStreams` 上可用的聚合函数：

  1. `sum()`：对数值字段进行求和聚合。
  2. `min()`：找出每个键的最小值。
  3. `max()`：找出每个键的最大值。
  4. `minBy()`：根据指定字段找出每个键的最小值。
  5. `maxBy()`：根据指定字段找出每个键的最大值。
  6. `reduce()`：实现自定义聚合逻辑。

  ```
  # 自定义聚合示例：
  keyedStream
      .reduce(new ReduceFunction<Tuple2<Integer, Long>>() {
          @Override
          public Tuple2<Integer, Long> reduce(Tuple2<Integer, Long> value1, Tuple2<Integer, Long> value2) throws Exception {
              return new Tuple2<>(value1.f0, value1.f1 + value2.f1);
          }
      });
  # 在这个例子中，我们使用 reduce() 函数对每个键的值进行累加聚合。
  ```

- 在实际应用中，你可以根据具体需求选择合适的聚合函数，或者使用 `reduce()` 实现自定义聚合逻辑。同时，也要注意状态管理，避免状态过大导致性能问题。

### 有状态转换 

- **本地化**：Flink 状态保存在处理它的机器上，并且可以以内存速度访问。
- **持久性**：Flink 状态是容错的，即它会自动定期进行检查点（checkpointing），并在发生故障时恢复。
- **垂直可扩展性**：Flink 状态可以保存在嵌入式 RocksDB 实例中，通过增加更多本地磁盘来扩展。
- **水平可扩展性**：随着你的集群扩展和缩小，Flink 状态会重新分配。

### 富函数

到目前为止，你已经看到了 Flink 的几个函数接口，包括 `FilterFunction`、`MapFunction` 和 `FlatMapFunction`。这些都是单一抽象方法模式的例子。

对于这些接口中的每一个，Flink 还提供了所谓的“富”变体，例如 `RichFlatMapFunction`，它有一些额外的方法，包括：

- `open(Configuration c)`：在操作符初始化期间只调用一次。这是一个加载一些静态数据或打开到外部服务的连接的机会。
- `close()`：在操作符关闭时调用，用于清理资源。
- `getRuntimeContext()`：提供了访问一系列可能有趣的事情的途径，但最值得注意的是，它是如何创建和访问 Flink 管理的状态。

#### 自定义的状态存储，代码案例参考

```java
private static class Event {
    public final String key;
    public final long timestamp;
    ...
}

public static void main(String[] args) throws Exception {
    StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
  
    env.addSource(new EventSource())
        .keyBy(e -> e.key)
        .flatMap(new Deduplicator())
        .print();
  
    env.execute();
}

public static class Deduplicator extends RichFlatMapFunction<Event, Event> {
    ValueState<Boolean> keyHasBeenSeen;

    @Override
    public void open(Configuration conf) {
        ValueStateDescriptor<Boolean> desc = new ValueStateDescriptor<>("keyHasBeenSeen", Types.BOOLEAN);
        keyHasBeenSeen = getRuntimeContext().getState(desc);
    }

    @Override
    public void flatMap(Event event, Collector<Event> out) throws Exception {
        if (keyHasBeenSeen.value() == null) {
            out.collect(event);
            keyHasBeenSeen.update(true);
        }
    }
}

# ValueState<Boolean> keyHasBeenSeen;
# 请理解这不仅仅代表一个布尔值，而是一个分布式的、分片的键/值存储。
```

### 清除状态

上述示例存在一个潜在问题：如果键空间是无界的会怎样？Flink 会为每个使用的不同键存储一个布尔值实例。如果键的集合是有限的，那么这样做是可行的，但在键集合以无界方式增长的应用中，就需要清除不再需要的键的状态。这是通过调用状态对象上的 `clear()` 方法来完成的，例如：

```java
keyHasBeenSeen.clear();
```

你可能想要在某个键在一定时间内没有活动后执行此操作。当你学习关于事件驱动应用部分中的 `ProcessFunctions` 时，你将看到如何使用计时器（Timers）来实现这一点。

还有一个状态生存时间（TTL）选项，你可以在状态描述符中配置它，以指定何时自动清除旧键的状态。

### 非键控状态 --Non-keyed State

在非键控上下文中使用管理状态也是可能的。这有时被称为操作符状态。涉及的接口有所不同，由于用户定义的函数通常不需要非键控状态，这个特性最常用于源和接收器的实现中。

## Connected Streams

在 Flink 中，当你使用 `connect` 方法将两个流连接起来时，你会得到一个连接流（connected streams）。这个连接流可以应用一个 `RichCoFlatMapFunction`，它有两个方法：`flatMap1` 和 `flatMap2`。这两个方法分别对应于连接流中的两个输入流。Flink 运行时会根据内部的调度和优化，决定何时调用这两个方法，以及从哪个输入流中读取数据。

这里的关键是，你无法控制 `flatMap1` 和 `flatMap2` 被调用的顺序。Flink 会根据内部的逻辑来决定先处理哪个流的数据。这意味着，如果你的业务逻辑依赖于两个流中数据的顺序或者时间戳，你可能会遇到问题，因为 Flink 不能保证两个流中的数据会按照你期望的顺序被处理。

在某些情况下，你可能需要确保两个流中的数据按照特定的顺序被处理。为了解决这个问题，你可以使用 Flink 的 `InputSelectable` 接口来实现自定义操作符。这个接口允许你在一定程度上控制两个输入流的消费顺序。但是，这通常是一个比较复杂的解决方案，只有在你真的需要精确控制数据流顺序时才考虑使用。

总结：

1. Flink 会根据内部逻辑决定 `flatMap1` 和 `flatMap2` 的调用顺序，你无法控制。
2. 如果你的业务逻辑依赖于特定的数据顺序，你可能需要在 Flink 状态中缓冲数据，直到可以正确处理它们。
3. 如果你真的需要控制数据流的顺序，可以考虑使用 `InputSelectable` 接口实现自定义操作符，但这通常是一个复杂的解决方案。