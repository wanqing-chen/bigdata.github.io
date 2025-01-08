## 组件角色分布

| 组件              | 版本号 | 1.com                   | 2.com           | 3.com           | 4.com  | 5.com  | 端口号                                                       |
| ----------------- | ------ | ----------------------- | --------------- | --------------- | ------ | ------ | ------------------------------------------------------------ |
| ssh               |        | ✔                       | ✔               | ✔               | ✔      | ✔      | 22                                                           |
| http              | 2.4    | ✔                       |                 |                 |        |        | 80                                                           |
| CM                | 6.3.1  | ✔                       | ✔               | ✔               | ✔      | ✔      | 7180                                                         |
| NameNode          |        | ✔                       |                 |                 |        |        | 9870                                                         |
| DataNode          | 3.0.0  | ✔                       | ✔               | ✔               | ✔      | ✔      |                                                              |
| SecondNameNode    |        |                         | ✔               |                 |        |        |                                                              |
| ResourceManager   |        | ✔                       |                 |                 |        |        | 8032                                                         |
| NodeManager       |        | ✔                       | ✔               | ✔               | ✔      | ✔      |                                                              |
| JobHistory Server |        | ✔                       |                 |                 |        |        | 19888                                                        |
| Hive(metadtore)   | 2.1.1  |                         | ✔               |                 |        |        | 9083                                                         |
| Hive(hivesql)     |        |                         | ✔               |                 |        |        | 10000                                                        |
| Zookeeper         | 3.4.5  | ✔                       | ✔               | ✔               |        |        |                                                              |
| Sqoop             | 1.4.7  | ✔                       | ✔               | ✔               | ✔      | ✔      |                                                              |
| Oozie             | 5.1.0  |                         | ✔               |                 |        |        |                                                              |
| Hue               | 4.3.0  |                         |                 | ✔               |        |        | 8888                                                         |
| Worker            |        | ✔                       | ✔               | ✔               |        |        |                                                              |
| spark             | 2.4.0  |                         |                 | ✔               |        |        | 8080                                                         |
| 元数据MySQL       | 5.7    | ✔                       |                 |                 |        |        |                                                              |
| 业务MySQL         | 5.7    |                         |                 | ✔               |        |        |                                                              |
| Flink             | 1.17.2 | ✔                       | ✔               | ✔               | ✔      | ✔      | 8085//8081                                                   |
| DolphinScheduler  | 3.0.0  | Master Worker Alert Api | worker          | worker          | worker | worker | 12345                                                        |
| DataX             | 3.0.0  | ✔                       | ✔               | ✔               | ✔      | ✔      |                                                              |
| Doris             | 2.0.3  | FE(leader) BE           | FE(follower) BE | FE(observer) BE | BE     | BE     | FE后台访问端口: 8035 8039 外部访问端口: 9030 8059 BE: 9059 FE_log:9011 |

## CDH集群下线的步骤

1. **Dolphinscheduler**任务全部下线，不然有可能会报错

2. 关闭**Dolphinscheduler**调度器

   ```java
   # 进入对应目录
   cd /opt/apache-dolphinscheduler-3.0.0-bin
   
   # 停止 Dolphinscheduler 集群 
   ./bin/stop-all.sh
   
   # 查看 Dolphinscheduler 集群 状态
   ./bin/status-all.sh
   ```
   
3. 关闭集群所有组件，如下图
   <img src="article/运维/picture/img5.png" alt="图片alt" title="关闭集群所有组件图">

4. 关闭 Cloudera Management Service，如下图
   <img src="article/运维/picture/img6.png" alt="图片alt" title="关闭 Cloudera Management Service图">

5. 关闭CDH中服务端节点，注意只在主节点执行

   ```java
   # 主节点执行
   systemctl stop cloudera-scm-server
   
   # 查看状态
   systemctl status cloudera-scm-server
   ```

6. 关闭CDH中所有客户端节点，注意主节点也要执行

   ```java
   # 所有节点执行
   systemctl stop cloudera-scm-agent
   
   # 查看状态
   systemctl status cloudera-scm-agent
   
   #查看scm-server的端口号是否生成,才能证明启动成功
   netstat -anp | grep 7180
   
   #查看server日志
   tail -f /var/log/cloudera-scm-server/cloudera-scm-server.log
   ```

## 节点机器加入CDH集群

### 一.查看现有主机数量

1. 如下图所示,点击"主机"
   <img src="article/运维/picture/img9.png" alt="图片alt" title="img9.png">

2. 查看现有主机信息
   <img src="article/运维/picture/img10.png" alt="图片alt" title="img10.png">

3. 我们还可以点击"集群"，然后点击"主机"也可以看到现有集群的信息哟~
   <img src="article/运维/picture/img11.png" alt="图片alt" title="img11.png">

### 二.为现有Cloudera Manager集群进行扩容

1. 准备两台机器用来加入现有集群
   <img src="article/运维/picture/img12.png" alt="图片alt" title="img12.png">

2. 如下图所示，点击"主机"
   <img src="article/运维/picture/img13.png" alt="图片alt" title="img13.png">

3. 将节点加入到Cloudera Manger，点击"继续"
   <img src="article/运维/picture/img14.png" alt="图片alt" title="img14.png">

4. 搜索需要添加的主机名
   <img src="article/运维/picture/img15.png" alt="图片alt" title="img15.png">

5. 配置咱们自建的存储库（选择默认就可）
   <img src="article/运维/picture/img16.png" alt="图片alt" title="img16.png">

6. 如果新加入的节点没有安装JDK环境则需要勾选，如下图所示
   <img src="article/运维/picture/img17.png" alt="图片alt" title="img17.png">

7. 配置ssh登录凭据
   <img src="article/运维/picture/img18.png" alt="图片alt" title="img18.png">

8. 等待安装JDK环境
   <img src="article/运维/picture/img19.png" alt="图片alt" title="img19.png">

9. 等待安装JDK环境
   <img src="article/运维/picture/img20.png" alt="图片alt" title="img20.png">

10. Cloudera Manager Agents安装成功
      <img src="article/运维/picture/img21.png" alt="图片alt" title="img21.png">

11. 等待检查主机
    <img src="article/运维/picture/img22.png" alt="图片alt" title="img22.png">

12. 查看主机检查结果
    <img src="article/运维/picture/img23.png" alt="图片alt" title="img23.png">

13. 暂时先忽略主机检查结果，点击"完成"
    <img src="article/运维/picture/img24.png" alt="图片alt" title="img24.png">

14. 主机成功被Cloudera Manager Server管理
    <img src="article/运维/picture/img25.png" alt="图片alt" title="img25.png">

15. 温馨提示 
**Cloudera Manager Server号称可以管理多个CDH集群，因此尽管您根据我上面所描述的操作已经成功将两个节点添加到Cloudera Manager Server了，
但这和现已经存在的"yinzhengjie_hadoop"集群并没有关系，如果我们想要在"yinzhengjie_hadoop"这个集群中使用这新加入的两个节点，您还得继续看第三步**


### 三.将新加入的节点添加到"yinzhengjie_hadoop"集群

1. 如下图所示,点击"集群"，再点击"yinzhengjie_hadoop"集群
   <img src="article/运维/picture/img26.png" alt="图片alt" title="img26.png">

2. 进入到"yinzhengjie_hadoop"集群管理界面后，点击"操作"，再点击"Add Hosts",如下图所示
   <img src="article/运维/picture/img27.png" alt="图片alt" title="img27.png">

3. 选择要添加主机的集群并点击"继续"
   <img src="article/运维/picture/img28.png" alt="图片alt" title="img28.png">

4. 点击"当前管理的主机"，勾选相应的主机并点击"继续"
   <img src="article/运维/picture/img29.png" alt="图片alt" title="img29.png">

5. 等待主机被激活
   <img src="article/运维/picture/img30.png" alt="图片alt" title="img30.png">

6. Parcels包安装完成后点击"继续"
   <img src="article/运维/picture/img31.png" alt="图片alt" title="img31.png">

7. 等待主机检查
   <img src="article/运维/picture/img32.png" alt="图片alt" title="img32.png">

8. 查看主机检查结果
   <img src="article/运维/picture/img33.png" alt="图片alt" title="img33.png">

9. 根据主机检查结果远程到相应的服务器进行调整
   <img src="article/运维/picture/img34.png" alt="图片alt" title="img34.png">

10. 服务器优化完毕后，我们需要重新进行主机检查
       <img src="article/运维/picture/img35.png" alt="图片alt" title="img35.png">

11. 再次查看主机检查结果，之前的异常被消除了
    <img src="article/运维/picture/img36.png" alt="图片alt" title="img36.png">

12. 主机检查完毕后，自行查看版本信息，点击"继续"
    <img src="article/运维/picture/img37.png" alt="图片alt" title="img37.png">

13. 选择模板，如果没有定义模板就直接点击"继续"即可
    <img src="article/运维/picture/img38.png" alt="图片alt" title="img38.png">

14. 等待客户端部署
    <img src="article/运维/picture/img39.png" alt="图片alt" title="img39.png">

15. 客户端部署完毕
    <img src="article/运维/picture/img40.png" alt="图片alt" title="img40.png">

16. 点击集群的"主机"按钮
    <img src="article/运维/picture/img41.png" alt="图片alt" title="img41.png">

17. 查看"yinzhengjie_hadoop"集群现有的主机信息
    <img src="article/运维/picture/img42.png" alt="图片alt" title="img42.png">

18. 配置HDFS高可用推荐阅读：

    [HDFS高可用](https://www.cnblogs.com/yinzhengjie2020/p/12364995.html)



## CDH集群启动的步骤

1. 启动CDH服务端

   ```
   #主节点执行
   systemctl start cloudera-scm-server
   
   # 查看状态
   systemctl status cloudera-scm-server
   ```

2. 启动客户端

   ```java
   # 每台节点都要执行
   systemctl start cloudera-scm-agent
   
   # 查看状态
   systemctl status cloudera-scm-agent
   
   #查看scm-server的端口号是否生成,才能证明启动成功
   netstat -anp | grep 7180
   
   #查看server日志
   tail -f /var/log/cloudera-scm-server/cloudera-scm-server.log
   ```

3. 启动Cloudera Management Service
   <img src="article/运维/picture/img7.png" alt="图片alt" title="启动 Cloudera Management Service图">

4. 启动集群全部组件
   <img src="article/运维/picture/img8.png" alt="图片alt" title="启动集群所有组件图">

5. 启动海豚调度服务

   ```java
   # 进入对应目录
   cd /opt/apache-dolphinscheduler-3.0.0-bin
   
   # 启动 Dolphinscheduler 集群 
   ./bin/start-all.sh
   
   # 查看 Dolphinscheduler 集群 状态
   ./bin/status-all.sh
   ```

6. 海豚调度上线任务

## 问题解决

1. 在CDH6.3大数据集群环境中，遇到一台未分配服务的主机执行hdfsdfsadmin命令时出现错误：'FileSystemfile:///isnotanHDFSfilesystem'。原因是core-site.xml和hdfs-site.xml配置文件内容为空。解决方案是将正常工作节点上的这两个配置文件复制到问题主机的/etc/hadoop/conf目录下，从而修复错误。

   - 解决办法如下

     到**/etc/hadoop/conf**目录下，找到有关hadoop的配置文件，可以看到core-site.xml、hdfs-site.xml等配置文件内容为空，所以会报“FileSystem file:/// is not an HDFS file system”这个错了， 现在将其他正常hadoop节点上的core-site.xml、hdfs-site.xml复制到该目录下，即可正常使用。
