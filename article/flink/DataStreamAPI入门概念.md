# Flink DataStream API 入门

- Flink 提供了 DataStream API，用于构建强大的**有状态**流应用程序。它提供了对**状态**和**时间**的细粒度控制，从而可以实现高级事件驱动系统。

  ### 代码设置及解释

  - **执行环境**

    - 第一行设置你的`StreamExecutionEnvironment`。执行环境是你为作业设置属性、创建源并最终触发作业执行的方式。

    ```java
    StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
    ```

  - **创建源**

    - 源的`name`仅用于调试目的，因此如果出现问题，我们将知道错误源自何处

    ```java
    DataStream<Transaction> transactions = env
       .addSource(new TransactionSource())
       .name("transactions");   
    ```

  - **分区事件**
  
    - 使用`DataStream#keyBy`对流进行分区，主要是确保任务由同一个并行任务处理；`process()`调用添加一个操作符，该操作符将一个函数应用于流中的每个分区元素。通常在`keyBy`之后紧接着的操作符

    ```java
    DataStream<Alert> alerts = transactions
       .keyBy(Transaction::getAccountId)
       .process(new FraudDetector())
       .name("fraud-detector");   
    ```
  - **输出结果**

    - 使用`DataStream#keyBy`对流进行分区，主要是确保任务由同一个并行任务处理；`process()`调用添加一个操作符，该操作符将一个函数应用于流中的每个分区元素。通常在`keyBy`之后紧接着的操作符

    ```java
    DataStream<Alert> alerts = transactions
       .keyBy(Transaction::getAccountId)
       .process(new FraudDetector())
       .name("fraud-detector");   
    ```

  - **转换方法实现器**

    - `KeyedProcessFunction`。它的`KeyedProcessFunction#processElement`方法会为每个事件调用。
      本教程的后续步骤将指导你用更有意义的业务逻辑扩展欺诈检测器。
    
    ```java
    class FraudDetector extends KeyedProcessFunction<Long, Transaction, Alert> {
        @Override
        public void processElement(
                Transaction transaction,
                Context context,
                Collector<Alert> collector) throws Exception {
            // 这里实现转换逻辑
        }
    } 
    ```

### Flink 容错状态的原语

- **ValueState**

  - Flink 中最基本的状态类型是`ValueState`，这是一种数据类型，它为其包装的任何变量添加容错能力；
  - `ValueState`是一种键控状态，这意味着它仅在键控上下文中应用的操作符中可用；即在`DataStream#keyBy`之后紧接着的任何操作符。
  - `ValueStateDescriptor`包含有关 Flink 应如何管理变量的元数据。状态应在函数开始处理数据之前注册。正确的钩子是`open()`方法。（即会先执行这个方法，注册状态管理）
  - `ValueState`是一个包装类，类似于 Java 标准库中的`AtomicReference`或`AtomicLong`。它提供了三种与其中内容交互的方法；`update`设置状态，`value`获取当前值，`clear`删除其内容。
  - 请注意，`ValueState<Boolean>`有三种状态，未设置（`null`）、`true`和`false`，因为所有`ValueState`都是可空的

  ```java
  public class FraudDetector extends KeyedProcessFunction<Long, Transaction, Alert> {
  
      private static final long serialVersionUID = 1L;
  
      private transient ValueState<Boolean> flagState;
  
      @Override
      public void open(OpenContext openContext) {
          ValueStateDescriptor<Boolean> flagDescriptor = new ValueStateDescriptor<>(
                  "flag",
                  Types.BOOLEAN);
          flagState = getRuntimeContext().getState(flagDescriptor);
      }
  ```

- **状态有效时间定义**

  - 当状态设置完之后，可以设置一个计时器。

  - 当计时器触发时，通过清除其状态重置标志。

  - 如果标志被清除，计时器应该被取消。要取消计时器，必须记住它设置的时间，而记住意味着状态，所以你将首先创建一个计时器状态以及标志状态。

    - ```java
      private transient ValueState<Long> timerState;
      @Override
      public void open(OpenContext openContext) {
       ValueStateDescriptor<Long> timerDescriptor = new ValueStateDescriptor<>(
                  "timer-state",
                  Types.LONG);
          timerState = getRuntimeContext().getState(timerDescriptor);
      }
      ```

  - `KeyedProcessFunction#processElement`使用包含计时器服务的`Context`调用。计时器服务可用于查询当前时间、注册计时器和删除计时器。有了这个，可以在每次标志设置时设置一个 1 分钟后的计时器，并将时间戳存储在`timerState`中。

    - ```java
      if (transaction.getAmount() < SMALL_AMOUNT) {
          // 将标志设置为true
          flagState.update(true);
      
          // 设置计时器和计时器状态
          long timer = context.timerService().currentProcessingTime() + ONE_MINUTE;
          context.timerService().registerProcessingTimeTimer(timer);
          timerState.update(timer);
      }
      ```

  - 处理时间是系统时钟时间，由运行操作符的机器的系统时钟确定。当计时器触发时，它会调用`KeyedProcessFunction#onTimer`。重写此方法是你实现回调以重置标志的方式。

    - ```java
      public void onTimer(long timestamp, OnTimerContext ctx, Collector<Alert> out) {
          // 1分钟后移除标志
          timerState.clear();
          flagState.clear();
      }
      ```

  - 最后，要取消计时器，你需要删除已注册的计时器并删除计时器状态。你可以将其包装在一个辅助方法中，并调用此方法而不是`flagState.clear()`。

    - ```java
      private void cleanUp(Context ctx) throws Exception {
          // 删除计时器
          Long timer = timerState.value();
          ctx.timerService().deleteProcessingTimeTimer(timer);
      
          // 清理所有状态
          timerState.clear();
          flagState.clear();
      }
      ```

  ### 官网完整代码案例

  ```java
  import org.apache.flink.api.common.functions.OpenContext;
  import org.apache.flink.api.common.state.ValueState;
  import org.apache.flink.api.common.state.ValueStateDescriptor;
  import org.apache.flink.api.common.typeinfo.Types;
  import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
  import org.apache.flink.util.Collector;
  import org.apache.flink.walkthrough.common.entity.Alert;
  import org.apache.flink.walkthrough.common.entity.Transaction;
  
  public class FraudDetector extends KeyedProcessFunction<Long, Transaction, Alert> {
  
      private static final long serialVersionUID = 1L;
  
      private static final double SMALL_AMOUNT = 1.00;
      private static final double LARGE_AMOUNT = 500.00;
      private static final long ONE_MINUTE = 60 * 1000;
  
      private transient ValueState<Boolean> flagState;
      private transient ValueState<Long> timerState;
  
      @Override
      public void open(OpenContext openContext) {
          ValueStateDescriptor<Boolean> flagDescriptor = new ValueStateDescriptor<>(
                  "flag",
                  Types.BOOLEAN);
          flagState = getRuntimeContext().getState(flagDescriptor);
  
          ValueStateDescriptor<Long> timerDescriptor = new ValueStateDescriptor<>(
                  "timer-state",
                  Types.LONG);
          timerState = getRuntimeContext().getState(timerDescriptor);
      }
  
      @Override
      public void processElement(
              Transaction transaction,
              Context context,
              Collector<Alert> collector) throws Exception {
  
          // Get the current state for the current key
          Boolean lastTransactionWasSmall = flagState.value();
  
          // Check if the flag is set
          if (lastTransactionWasSmall != null) {
              if (transaction.getAmount() > LARGE_AMOUNT) {
                  //Output an alert downstream
                  Alert alert = new Alert();
                  alert.setId(transaction.getAccountId());
  
                  collector.collect(alert);
              }
              // Clean up our state
              cleanUp(context);
          }
  
          if (transaction.getAmount() < SMALL_AMOUNT) {
              // set the flag to true
              flagState.update(true);
  
              long timer = context.timerService().currentProcessingTime() + ONE_MINUTE;
              context.timerService().registerProcessingTimeTimer(timer);
  
              timerState.update(timer);
          }
      }
  
      @Override
      public void onTimer(long timestamp, OnTimerContext ctx, Collector<Alert> out) {
          // remove flag after 1 minute
          timerState.clear();
          flagState.clear();
      }
  
      private void cleanUp(Context ctx) throws Exception {
          // delete timer
          Long timer = timerState.value();
          ctx.timerService().deleteProcessingTimeTimer(timer);
  
          // clean up all state
          timerState.clear();
          flagState.clear();
      }
  }
  ```

  