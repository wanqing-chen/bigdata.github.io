# Flink Table API 基础

### 概念

- Apache Flink 提供了一个**统一**的关系型 API——Table API，用于**批处理**和**流处理**，即查询在无界实时流或有界批数据集上以相同的语义执行，并产生相同的结果。

### 代码设置及解释

- 设置`TableEnvironment`环境，指定编写批处理还是流处理应用以及创建源的地方

  ```java
  EnvironmentSettings settings = EnvironmentSettings.inStreamingMode();
  TableEnvironment tEnv = TableEnvironment.create(settings);
  ```

- **注册表**，连接到外部系统，用于读写批处理和流数据。提供了访问存储在外部系统（如数据库、键值存储、消息队列或文件系统）中的数据的途径。提供了将表输出到外部存储系统的功能。根据源和汇的类型，它们支持不同的格式，如 **CSV**、**JSON**、**Avro** 或 **Parquet**。

  ```java
  1. tEnv.executeSql("CREATE TABLE transactions (\n" +
      "    account_id  BIGINT,\n" +
      "    amount      BIGINT,\n" +
      "    transaction_time TIMESTAMP(3),\n" +
      "    WATERMARK FOR transaction_time AS transaction_time - INTERVAL '5' SECOND\n" +
      ") WITH (\n" +
      "    'connector' = 'kafka',\n" +
      "    'topic'     = 'transactions',\n" +
      "    'properties.bootstrap.servers' = 'kafka:9092',\n" +
      "    'format'    = 'csv'\n" +
      ")");
  2. tEnv.executeSql("CREATE TABLE spend_report (\n" +
      "    account_id BIGINT,\n" +
      "    log_ts     TIMESTAMP(3),\n" +
      "    amount     BIGINT\n," +
      "    PRIMARY KEY (account_id, log_ts) NOT ENFORCED" +
      ") WITH (\n" +
      "   'connector'  = 'jdbc',\n" +
      "   'url'        = 'jdbc:mysql://mysql:3306/sql-demo',\n" +
      "   'table-name' = 'spend_report',\n" +
      "   'driver'     = 'com.mysql.jdbc.Driver',\n" +
      "   'username'   = 'sql-demo',\n" +
      "   'password'   = 'demo-sql'\n" +
      ")");
  ```

- **查询** 从 `TableEnvironment` 你可以 `from` 一个输入表读取其行，然后使用 `executeInsert` 将这些结果写入输出表。`report` 函数是你要实现业务逻辑的地方。

  ```java
  Table transactions = tEnv.from("transactions");
  report(transactions).executeInsert("spend_report");
  ```

### 核心概念

- Flink 支持使用**纯 SQL** 或 **Table API** 开发关系型应用程序

- Table API 是一个受 SQL 启发的流畅 DSL，可以用 Java 或 Python 编写，并支持强大的 IDE 集成。就像 SQL 查询一样，Table 程序可以选取所需的字段，并按你的键进行分组。

  ```java
  public static Table report(Table transactions) {
      return transactions.select(
              $("account_id"),
              $("transaction_time").floor(TimeIntervalUnit.HOUR).as("log_ts"),
              $("amount"))
          .groupBy($("account_id"), $("log_ts"))
          .select(
              $("account_id"),
              $("log_ts"),
              $("amount").sum().as("amount"));
  }
  ```

- **用户定义函数， **Flink 包含有限数量的内置函数，有时你需要用用户定义的函数来扩展它。

- **添加窗口**，基于时间的分组称为窗口，Flink 提供灵活的窗口语义。最基本的窗口类型称为 `Tumble` 窗口，它具有固定大小，其桶不重叠。

  ```java
  public static Table report(Table transactions) {
      return transactions
          .window(Tumble.over(lit(1).hour()).on($("transaction_time")).as("log_ts"))
          .groupBy($("account_id"), $("log_ts"))
          .select(
              $("account_id"),
              $("log_ts").start().as("log_ts"),
              $("amount").sum().as("amount"));
  }
  // 这定义了你的应用程序使用基于时间戳列的一小时滚动窗口。
  //因此，时间戳为 2019-06-01 01:23:47 的行被放入 2019-06-01 01:00:00 窗口。
  ```