# 数据流 API 简介

- Flink 的数据流 API 能够对流经它们且可以被序列化的任何数据进行流式处理
- Flink 自身的序列化器用于 **基本类型**和**复合类型**

### 可以流式处理什么？

1. **基本类型**
   - 例如字符串（String）、长整型（Long）、整型（Integer）、布尔型（Boolean）、数组（Array）。
2. **复合类型**
   - 元组（Tuples）、POJO（普通 Java 对象）和 Scala 的样例类（Scala case classes）。
3. 对于其他类型，Flink 会退而使用 Kryo 进行序列化。此外，也可以在 Flink 中使用其他序列化器，尤其对 Avro 有很好的支持。

### Java 元组和 POJO

- Flink 原生的序列化器能够对**元组**和 POJO 进行高效操作。

1. **元组**

   - 对于 Java，Flink 定义了从 Tuple0 到 Tuple25 类型。这些元组类型在处理多字段数据时非常方便，例如，Tuple2<String, Integer> 可以用来表示一个包含字符串和整数的二元组，在流式处理中可以用来传递具有两个属性的数据。

     ```java
     Tuple2<String, Integer> person = Tuple2.of("Fred", 35);
     
     // zero based index!  
     String name = person.f0;
     Integer age = person.f1;
     ```

2. POJO（普通 Java 对象） 

   如果满足以下条件，Flink 会将一种数据类型认定为 POJO 类型（并且允许 “按名称” 字段引用）：

   1. **类的可见性与独立性方面**：
      该类必须是公共（public）的，并且是独立的（也就是不能是非静态的内部类）。
   2. **构造函数方面**：
      类需要有一个公共的无参构造函数。
   3. **字段访问方面**：
      类（以及其所有超类）中所有非静态、非瞬态（non-transient）的字段，要么是公共的（且非终态，即非 final），要么具备遵循 JavaBean 中关于 getter 和 setter 命名规范的公共的 getter 和 setter 方法。例如，如果有一个名为 “name” 的字段，那么对应的 getter 方法应该命名为 “getName ()”，setter 方法应该命名为 “setName (String newName)”，只有这样 Flink 才能将该类识别为 POJO 类型，进而在处理数据时可以方便地按照名称来引用这些字段。

3. Flink 的序列化器[支持 POJO 类型的模式演变](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/serialization/schema_evolution/#pojo-types)。

### 流执行环境

- Flink 应用程序都需要一个执行环境，在这个示例中用 “env” 来表示。流式应用程序需要使用 “StreamExecutionEnvironment”（流执行环境）

- 程序中调用的数据流 API（DataStream API）会构建出一个**作业图（job graph）**，该作业图会关联到流执行环境上。当调用 “env.execute ()” 方法时，这个**作业图**会被打包并发送给 “JobManager”（**作业管理器**），作业管理器会对该作业进行**并行化处理**，并将作业的各个部分分配给 **“Task Managers”（任务管理器）**来执行。你作业的每个并行部分都会在一个**任务槽（task slot）**中执行。

  请注意，如果你不调用 execute () 方法，你的应用程序将不会运行。
  <img src="article/flink/picture/distributed-runtime.svg" alt="图片alt" title="Stream-execution图">

### 创建基础数据源的几种方式

1. ```Java
   DataStream<Person> flintstones = env.fromElements(
                   new Person("Fred", 35),
                   new Person("Wilma", 35),
                   new Person("Pebbles", 2));
   ```

2. ```
   DataStream<Person> flintstones = env.fromCollection(people);
   ```

3. ```
   DataStream<String> lines = env.socketTextStream("localhost", 9999);
   ```

4. ```
   DataStream<String> lines = env.readTextFile("file:///path");
   ```

   在实际应用中，最常使用的数据源是那些支持**低延迟**、**高吞吐量**、**并行读取**，**并结合回退和重放功能**（**高性能和容错**的先决条件）的数据源，例如 Apache Kafka、Kinesis 和各类文件系统。REST API（表述性状态转移应用程序编程接口）和数据库也经常用于丰富流数据。
