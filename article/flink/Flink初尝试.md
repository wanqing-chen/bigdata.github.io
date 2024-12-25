# Flink 初体验

### 步骤如下

1. [下载 Flink 的最新二进制版本](https://flink.apache.org/downloads.html) 然后解压缩归档

   ```java
   tar -xzf flink-*.tgz
   ```

2. 启动和停止本地集群

   ```java
   1. /bin/start-cluster.sh   (启动)
   2. /bin/stop-cluster.sh    (停止)
   ```

3. 检查启动状态

   ```java
   ps aux | grep flink
   ```

4. 提交 Flink 作业

   ```
   ./bin/flink run examples/streaming/WordCount.jar
   ```

5. 查看日志来验证输出

   ```
   tail log/flink-*-taskexecutor-*.out
   ```


### 注意事项

- 当 Flink 成功部署之后，可以打开 Flink 的[Web UI](http://localhost:8081/)来监控集群和正在运行的作业的状态。
- Flink 目录信息
  -  bin/目录包含flink二进制文件以及管理各种作业和任务的几个 bash 脚本
  -  conf/目录包含配置文件，包括Flink 配置文件
  -  examples/目录包含可与 Flink 一起使用的示例应用程序
- Flink 的 WebUI **无法打开解决办法**
  - vim config.yaml 进入 Flink 的配置文件，修改 **rest.address**和**rest.bind-address** 其默认值是 **localhost** 改为 **0.0.0.0** 重新启动Flink程序即可访问WebUI。

### Flink任务执行结果

1. WordCount-Flink执行流程图

<img src="article/flink/picture/countword-Flink执行流程图.png" alt="图片alt" title="WordCount-Flink执行流程图">

- Flink 有两个运算符。第一个是源运算符，它从集合源读取数据。第二个运算符是转换运算符，它聚合单词计数

2. WordCount-Flink执行流程图

<img src="article/flink/picture/wordcount作业执行的时间线.png" alt="图片alt" title="WordCount-作业执行的时间线">

- 作业执行的时间线