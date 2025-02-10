### 什么是 DataStream

DataStream 在使用上与常规 Java 集合类似，但在一些关键方面有所不同。它们是**不可变的**，一旦创建就不能添加或删除元素。你也不能简单地检查其中的元素，只能使用 DataStream API 操作（也称为转换）来处理它们。

### Flink 程序的结构

- 获取执行环境
- 加载/创建初始数据
- 指定对这些数据的转换 
- 指定计算结果的存放位置 
- 触发程序执行

#### 获取执行环境

通过 StreamExecutionEnvironment 上的这些静态方法来获取一个

```java
getExecutionEnvironment（）；
createLocalEnvironment（）；
createRemoteEnvironment（String host，int port，String... jarFiles）；
```

通常，你只需要使用 getExecutionEnvironment（），因为这会根据上下文做出正确的选择：如果你是在 IDE 内部或作为常规 Java 程序执行程序，它将创建一个本地环境，在你的本地机器上执行程序。如果你从程序创建了一个 JAR 文件，并通过命令行调用它，Flink 集群管理器将执行你的 main 方法，getExecutionEnvironment（）将返回一个用于在集群上执行程序的执行环境。

#### 加载/创建初始数据

指定数据源，执行环境有几种方法可以使用各种方法从文件中读取：你可以逐行读取它们，作为 CSV 文件读取，或者使用提供的其他任何源。要仅将文本文件读取为一系列行，可以使用：

```
DataStream<String> text = env.readTextFile（“file:///path/to/file”）；
```

一旦你指定了完整的程序，就需要通过调用 **StreamExecutionEnvironment 上的 execute（）**来触发程序执行。根据 ExecutionEnvironment 的类型，执行将在你的本地机器上进行，或者将你的程序提交到集群上执行。

execute（）方法将等待作业完成，然后返回一个 **JobExecutionResult**，其中包含**执行时间和累加器结果**。

如果你不想等待作业完成，可以通过调用 **StreamExecutionEnvironment 上的 executeAsync（）**来触发异步作业执行。它将返回一个 **JobClient**，你可以通过它与你刚刚提交的作业进行通信。例如，以下是如何使用 executeAsync（）来实现 execute（）的语义。

final JobClient jobClient = env.executeAsync（）；

final JobExecutionResult jobExecutionResult = jobClient.getJobExecutionResult（）.get（）； 关于程序执行的最后一部分对于理解 Flink 操作何时以及如何执行至关重要。所有 Flink 程序都是**惰性执行的**：当程序的 main 方法执行时，**数据加载和转换并不会直接发生。相反，每个操作会被创建并添加到数据流图中**。当通过在执行环境上调用 execute（）显式触发执行时，操作才会真正执行。程序是在本地执行还是在集群上执行，取决于执行环境的类型。

这种惰性求值让你能够构建复杂的程序，Flink 会将其作为**一个整体规划的单元来执行。**





源是程序读取输入的地方。你可以通过使用 **StreamExecutionEnvironment.addSource（sourceFunction）将源附加到程序中**。Flink 提供了一些预先实现好的源函数，但你也可以通过实现 SourceFunction 来编写自己的自定义源（用于非并行源），或者通过实现 **ParallelSourceFunction 接口或扩展 RichParallelSourceFunction（用于并行源）**。

StreamExecutionEnvironment 提供了几种预定义的流源：

基于文件的：

**readTextFile（path） - 逐行读取文本文件，即符合 TextInputFormat 规范的文件，并将它们作为字符串返回。**

**readFile（fileInputFormat，path） - 根据指定的文件输入格式一次性读取文件。**

**readFile（fileInputFormat，path，watchType，interval，pathFilter，typeInfo） - 这是前两个方法内部调用的方法**。它根据给定的 fileInputFormat 读取路径中的文件。根据提供的 watchType，此源可能会定期监控（每 interval 毫秒一次）路径以查找新数据（FileProcessingMode.PROCESS_CONTINUOUSLY），或者一次性处理路径中当前的数据然后退出（FileProcessingMode.PROCESS_ONCE）。使用 pathFilter，用户可以进一步排除要处理的文件。

实现：

在底层，Flink 将文件读取过程拆分为两个子任务，即**目录监控和数据读取**。每个子任务都由一个单独的实体实现。**监控是由一个非并行（并行度 = 1）的任务实现的，而读取是由多个并行运行的任务执行的**。后者的并行度等于**作业的并行度**。单一监控任务的作用是扫描目录（根据 watchType 定期或仅一次），找到要处理的文件，将它们分割成块，并将这些块分配给下游的读取器。读取器是实际读取数据的实体。**每个块仅由一个读取器读取，而一个读取器可以依次读取多个块。**

重要注意事项：

如果 watchType 设置为 FileProcessingMode.PROCESS_CONTINUOUSLY，当文件被修改时，其内容将被重新完全处理。这可能会破坏“恰好一次”的语义，因为在文件末尾追加数据将导致其所有内容被重新处理。

如果 watchType 设置为 FileProcessingMode.PROCESS_ONCE，源将扫描路径一次然后退出，不会等待读取器完成文件内容的读取。当然，读取器将继续读取，直到所有文件内容都被读取完毕。关闭源会导致在此之后不再有检查点。这可能会导致节点故障后的恢复速度变慢，因为作业将从最后一个检查点恢复读取。

基于套接字的：

**socketTextStream - 从套接字读取。元素可以通过分隔符分隔。**

基于集合的：

**fromCollection（Collection） - 从 Java.util.Collection 创建数据流。集合中的所有元素必须是同一种类型。**

**fromCollection（Iterator，Class） - 从迭代器创建数据流。类指定了迭代器返回的元素的数据类型。**

**fromElements（T ...） - 从给定的对象序列创建数据流。所有对象必须是同一种类型。**

**fromParallelCollection（SplittableIterator，Class） - 从迭代器并行创建数据流。类指定了迭代器返回的元素的数据类型。**

**fromSequence（from，to） - 并行生成给定区间内的数字序列。**

自定义：

**addSource - 添加一个新的源函数。例如，要从 Apache Kafka 读取，可以使用 addSource（new FlinkKafkaConsumer<>(...)）**。



### 数据接收器

Java 数据接收器消费 DataStreams 并将它们转发到文件、套接字、外部系统，或者将它们打印出来。Flink 提供了多种内置的输出格式，这些格式封装在 DataStreams 上的操作背后：

**writeAsText（）/ TextOutputFormat - 逐行写入元素作为字符串。字符串是通过调用每个元素的 toString（）方法获得的。**

**writeAsCsv（...）/ CsvOutputFormat - 将元组写入为逗号分隔值文件。行和字段分隔符是可配置的。每个字段的值来自对象的 toString（）方法。**

**print（）/ printToErr（）- 在标准输出/标准错误流上打印每个元素的 toString（）值。可选地，可以提供一个前缀（msg），它将被添加到输出的前面。这可以帮助区分不同的 print 调用。如果并行度大于1，则输出还将被添加上产生输出的任务的标识符。**

writeUsingOutputFormat（）/ FileOutputFormat - 自定义文件输出的方法和基础类。支持自定义的对象到字节的转换。

writeToSocket - 根据 SerializationSchema 将元素写入套接字。

**addSink - 调用自定义的接收器函数。Flink 自带了与其他系统（如 Apache Kafka）的连接器，这些连接器是作为接收器函数实现的。**

对于可靠地、恰好一次地将流写入文件系统，可以使用 FileSink。此外，通过 .addSink（...）方法的自定义实现可以参与 Flink 的检查点机制，以实现恰好一次的语义。

### 执行参数

StreamExecutionEnvironment 包含 ExecutionConfig，它允许为运行时设置特定于作业的配置值。

请参阅[执行配置](https://nightlies.apache.org/flink/flink-docs-master/docs/dev/datastream/execution_configuration/)，以了解大多数参数的说明。以下参数是特定于 DataStream API 的：

setAutoWatermarkInterval（long milliseconds）：设置自动水位线发射的间隔。你可以通过 long getAutoWatermarkInterval（）获取当前值。



### 容错

[状态与检查点](https://nightlies.apache.org/flink/flink-docs-master/docs/learn-flink/fault_tolerance/) 描述了如何启用和配置 Flink 的检查点机制。



### 控制延迟

默认情况下，元素并不是逐个通过网络传输的（这将导致不必要的网络流量），而是被缓冲。缓冲区的大小（实际上是在机器之间传输的）可以在 Flink 配置文件中设置。虽然这种方法对于优化吞吐量很有用，但如果输入流的速度不够快，它可能会导致延迟问题。为了控制吞吐量和延迟，你可以在执行环境（或个别操作符）上使用 env.setBufferTimeout（timeoutMillis）来设置缓冲区填满的最大等待时间。在此时间之后，即使缓冲区未满，也会自动发送缓冲区。此超时的默认值为100毫秒。



**为了最大化吞吐量，可以设置 `setBufferTimeout（-1）`，这将移除超时设置，缓冲区只有在满时才会被刷新**。为了**最小化延迟，可以将超时时间设置为接近0的值（例如5或10毫秒）**。**应避免将缓冲区超时时间设置为0，因为这可能会导致严重的性能下降。**

