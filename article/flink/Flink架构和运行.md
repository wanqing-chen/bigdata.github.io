### Flink 的 API

Flink 提供了不同级别的抽象，用于开发流处理/批处理应用程序。
    <img src="article/flink/picture/Flink架构图.png" alt="图片alt" title="Flink架构图">

1. 最低级别的抽象提供了**有状态和及时的流处理**。它通过 `Process Function` 嵌入到 `DataStream API` 中。它允许用户自由地处理来自一个或多个流的事件，并提供一致的、容错的状态。此外，用户可以注册事件时间和处理时间的回调，允许程序实现复杂的计算。

2. 在实践中，许多应用程序不需要上述的低级抽象，而是可以针对**核心 API** 进行编程：`DataStream API`（有界/无界流）。这些流畅的 API 提供了数据处理的常见构建块，如各种用户指定的转换、连接、聚合、窗口、状态等。在这些 API 中处理的数据类型在相应的编程语言中被表示为类。低级别的 `Process Function` 与 `DataStream API` 集成，使得可以根据需要使用低级抽象。`DataSet API` 为有界数据集提供了额外的原语，如循环/迭代。

3. `Table API` 是一个以表为中心的声明式 DSL，这些表可能是动态变化的表（当表示流时）。`Table API` 遵循（扩展的）关系模型：表有一个附加的模式（类似于关系数据库中的表），API 提供了类似的操作，如选择、投影、连接、分组、聚合等。`Table API` 程序声明性地定义应该执行什么样的逻辑操作，而不是指定操作代码的确切外观。尽管 `Table API` 可以通过各种类型的用户定义函数进行扩展，但它的表达能力不如核心 API，但使用起来更简洁（需要写的代码更少）。此外，`Table API` 程序还会经过一个优化器，在执行前应用优化规则。用户可以无缝地在表和 `DataStream/DataSet` 之间转换，允许程序将 `Table API` 与 `DataStream` 和 `DataSet API` 结合使用。

4. Flink 提供的最高级别的抽象是 SQL。这种抽象在语义和表达能力上与 `Table API` 类似，但将程序表示为 SQL 查询表达式。SQL 抽象与 `Table API` 紧密交互，SQL 查询可以在 `Table API` 中定义的表上执行。