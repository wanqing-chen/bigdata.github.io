## 处理函数 

### 介绍 

`ProcessFunction` 将**事件处理**与**定时器**和**状态**结合起来，使其成为流处理应用程序的一个强大构建块。这是使用 Flink 创建事件驱动应用程序的基础。它与 `RichFlatMapFunction` 非常相似，但增加了定时器的功能。

要注意的事项：

存在几种类型的 `ProcessFunction` —— 这是一个 `KeyedProcessFunction`，但还有 `CoProcessFunction`、`BroadcastProcessFunction` 等。

`KeyedProcessFunction` 是一种 `RichFunction`。作为一种 `RichFunction`，它可以访问 `open` 和 `getRuntimeContext` 方法，这些方法对于使用托管键控状态是必需的。

需要实现两个回调方法：`processElement` 和 `onTimer`。`processElement` 在每个传入事件时被调用；`onTimer` 在定时器触发时被调用。这些可以是事件时间定时器或处理时间定时器。`processElement` 和 `onTimer` 都提供了一个上下文对象，该对象可以用于与 `TimerService` 交互（以及其他用途）。这两个回调方法也都传递了一个 `Collector`，可以用于发出结果。

### 性能考虑

Flink 提供了针对 RocksDB 优化的 `MapState` 和 `ListState` 类型。在可能的情况下，这些应该被优先使用，而不是使用包含某种集合的 `ValueState` 对象。RocksDB 状态后端可以无需经过（反）序列化过程就向 `ListState` 追加内容，对于 `MapState`，每个键值对都是一个单独的 RocksDB 对象，因此 `MapState` 可以被高效地访问和更新。



### 侧输出

有多种很好的理由希望从 Flink 操作符中获得多个输出流，例如报告：

- 异常
- 格式错误的事件 
- 迟到事件 
- 操作警报，例如外部服务连接超时 

侧输出是一种方便实现这些功能的方式。除了错误报告，侧输出也是实现流的 n 路分流的好方法。



此外，`ProcessFunction` 还可用于许多其他用例，而不仅仅是计算分析。下面的动手练习提供了一个完全不同的示例。

`ProcessFunction` 的另一个常见用例是过期陈旧状态。回想一下“行程与车费练习”，其中使用 `RichCoFlatMapFunction` 来计算一个简单的连接，示例解决方案假设 `TaxiRides` 和 `TaxiFares` 完美匹配，每个 `rideId` 一对一。如果一个事件丢失，同一个 `rideId` 的另一个事件将永远保留在状态中。这可以改用 `KeyedCoProcessFunction` 实现，并使用定时器来检测和清除任何陈旧状态。



