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

## 集群环境准备

1.  **集群规划**

   1. 主机命名

      ```java
      vim /etc/hostname
      
      #编辑内容如下,按序递增命名
      01.com
      
      #重启系统生效
      reboot
      ```

   2. 设置IP

      - 根据分好内网的网络段后,每台都做

        ```java
        #确保只有一个ifcfg文件存在,不然冲突会导致无法重启网络
        vim /etc/sysconfig/network-scripts/ifcfg-eno1
        
        #编辑内容如下(仅ip地址要按序递增命名):
        #网口使用静态协议
        BOOTPROTO=static
        #网口开机自启
        ONBOOT=yes
        #ip地址
        IPADDR=xx.xx.x.xx
        #子网掩码
        NETMASK=xxx.xxx.xxx.xxx
        #网关
        GATEWAY=xx.xx.x.x
        #dns
        DNS1=xx.xx.xx.xx
        
        #重启网络
        systemctl restart network
        ```

   3. 设置ssh端口

      ```java
      # 每台都做
      vim /etc/ssh/sshd_config
         
      #修改内容如下
      Port 22
         
      #重启端口
      systemctl restart sshd
      #检查端口是否启动
      netstat -anp | grep 22
      ```

   4. 配置hosts

      ```java
      # 服务器都要做映射
      vim /etc/hosts
         
      #hosts映射内容如下:
      xx.xx.x.xx 01.com
      xx.xx.x.xx 02.com
      xx.xx.x.xx 03.com
             
       windows本机也要做
      【C:\Windows\System32\drivers\etc\hosts】
      ```

   5. 配置免密登录

      ```
      # 每台都做
      cd /root/.ssh  #确保每台都有这个文件
      ssh-keygen -t rsa  #回车4次
      ssh-copy-id 01.com
      ssh-copy-id 02.com
      ssh-copy-id 03.com
      ```

2. **前置工作**

      1. 下载并上传安装包
         <img src="article/运维/picture/img43.png" alt="图片alt" title="img43.png">
         
         下载完cdh存入第一台服务器的路径:
         
         ```java
         #因为模拟上面官网的地址来离线安装,所以需要确保以下路径存在
         /var/www/html/cdh6/6.3.2/parcels/
         ```
         
         **cm的rpm:**
         <img src="article/运维/picture/img44.png" alt="图片alt" title="img44.png">
         
         下载完cm存入第一台服务器的路径:
         
         ```java
         #因为模拟上面官网的地址来离线安装,所以需要确保以下路径存在
         /var/www/html/cm6/6.3.1/redhat7/yum/RPMS/x86_64/
         ```
         
         密钥文件:
         <img src="article/运维/picture/img45.png" alt="图片alt" title="img45.png">
         
         **下载完密钥存入第一台服务器的路径:**
         
         ```java
         #因为模拟上面官网的地址来离线安装,所以需要确保以下路径存在
         /var/www/html/cm6/6.3.1/
         ```
      
      2. **安装其他依赖包**
      
         ```java
         # 每台服务器都需要做
         
         yum install -y cyrus-sasl-plain cyrus-sasl-gssapi portmap fuse-libs bind-utils libxslt fuse
         yum install -y /lib/lsb/init-functions createrepo deltarpm python-deltarpm
         yum install -y mod_ssl openssl-devel python-psycopg2 MySQL-python
         ```
      
      3. **安装httpd服务和目录生成服务**
      
         ```java
         # 主服务器安装即可
         yum install httpd -y
         yum install createrepo
         ```
      
      4. 关闭防火墙
      
         ```java
         # 每台都要做
         #查看防火墙状态(绿的running表示防火墙开启)
         systemctl status firewalld.service
         
         #执行关闭命令
         systemctl stop firewalld.service
         
         #禁用防火墙开机自启
         systemctl disable firewalld.service
         
         #后续如果需要开启防火墙,可以把所有端口放到ports.txt文件中
         while read port; 
         do
             firewall-cmd --zone=public --add-port=$port/tcp --permanent
         done < ports.txt
         #重载防火墙的配置
         firewall-cmd --reload
         ```
      
      5. **关闭selinux**
      
         ```
         # 每台都要做
         vim /etc/selinux/config
         
         #修改内容如下
         SELINUX=disabled
         
         #重启系统
         reboot
         ```
      
      6. **启动httpd服务和生成目录**
      
         ```java
         # 主服务器启动httpd
         systemctl start httpd.service
         # 启动后,去第一台服务器web页面检查下有没有目录出现
         http://01.com/cm6/6.3.1/redhat7/yum/RPMS/x86_64/
         # 然后在第一台服务器开始生成目录
         cd /var/www/html/cm6/6.3.1/redhat7/yum
         createrepo .
         
         # 去web验证repodata是否存在;
         注意:后续如果www开头的目录文件夹内容有变更，需要删除repodata文件夹后重新repo生成，重启httpd服务, 清除yum缓存, 以在web中生效;
         
         ```
      
      7. **配置本地yum源**
      
         ```java
         # 主服务器配置即可
         cd /etc/yum.repos.d/
         
         vim cloudera-manager.repo
         #配置内容如下
         [cloudera-manager]
         name=Cloudera Manager
         baseurl=http://01.com/cm6/6.3.1/redhat7/yum/
         gpgcheck=0
         enabled=1
         
         #查看yum
         yum list | grep cloudera
         #清除缓存
         yum clean all
         ```
      
      8. **创建linux普通用户**（非必须）
      
         ```java
         # 服务器看情况做
         useradd cloudera-scm
         passwd cloudera-scm
         pwd: test123456
         
         #免密钥登录
         echo "cloudera-scm ALL=(root)NOPASSWD:ALL" >> /etc/sudoers
         
         #测试切换到普通用户
         su - cloudera-scm
         exit
         ```
      
      9. **安装配置MySQL**
      
         ```java
         # 主服务器做
         #设置mysql不校验密钥
         vi /etc/yum.repos.d/mysql-community.repo 
         #编辑内容如下
         gpgcheck=0
         
         #在线安装mysql即可存储cdh的元数据,自动覆盖之前的mariadb
         yum -y install mysql57-community-release-el7-10.noarch.rpm
         yum -y install mysql-community-server
         
         #如果密钥过期,使用以下命令
         rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
         
         # 启动mysql配置
         #启动
         systemctl start mysqld.service
         #查看运行状态
         systemctl status mysqld.service
         
         #查看密码(密码是不规则的krUgnM%1sJg):
         grep "password" /var/log/mysqld.log
         #登录
         mysql -uroot -p
         
         #降低mysql的密码规则强度
         set global validate_password_policy=0;
         set global validate_password_length=1;
         
         #修改密码
         alter user 'root'@'localhost' identified by '123456';
         
         #刷新授权
         flush privileges;
         
         create database scm DEFAULT CHARACTER SET utf8;
         grant all PRIVILEGES on *.* TO 'root'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
         grant all PRIVILEGES on *.* TO 'root'@'localhost' IDENTIFIED BY '123456' WITH GRANT OPTION;
         grant all PRIVILEGES on *.* TO 'root'@'02.com' IDENTIFIED BY '123456' WITH GRANT OPTION;
         
         #刷新授权
         flush privileges;
         
         # 卸载mysql的repo包
         #因为安装了yum repository，以后每次yum都会自动更新，耗费时间，所以卸载掉
         yum -y remove mysql57-community-release-el7-10.noarch
         ```
      
      3. **Linux系统调优**（每台服务器都要执行）
      
         1. **限制swap交换内存**
      
            ```java
            #此参数值越低，就会让Linux系统尽量少用swap虚拟内存分区，多用内存
            echo "vm.swappiness=10" >> /etc/sysctl.conf
            ```
      
         2. **关闭内存页透明化**
      
            ```java
            #这里关闭了动态分配内存;标准的HugePages是系统启动时预先分配内存，运行时不再改变
            echo "echo never > /sys/kernel/mm/transparent_hugepage/defrag" >> /etc/rc.local
            echo "echo never > /sys/kernel/mm/transparent_hugepage/enabled" >> /etc/rc.local
            ```
      
         3. **限制文件打开数和限制进程数**
      
            ```java
            #大数据运行时,会打开大量的文件,需要做一定的限制
            vim /etc/security/limits.conf 
            #添加如下信息
            * hard nofile 65535
            * soft nofile 65535
            * hard  nproc  65535
            * soft  nproc  65535
            ```
      
         4. **划定tcp套接字范围**
      
            ```java
            #避开大数据的端口号
            sudo sysctl -w net.ipv4.ip_local_port_range="10000 65000"
            # 缩短套接字空闲时间
            sudo sysctl -w net.ipv4.netfilter.ip_conntrack_tcp_timeout_time_wait="1"
            ```
      
         5. **时间同步**
      
            ```java
            #设置为CST时区
            timedatectl set-timezone Asia/Shanghai
            
            #查看当前服务器时间
            date
            
            #安装ntp软件
            yum -y install ntp
            #启动并设置开机自启
            systemctl start ntpd
            systemctl enable ntpd
            #设置完成后出现下面的状态就表示成功
            #Created symlink from /etc/systemd/system/multi-user.target.wants/ntpd.service to /usr/lib/systemd/system/ntpd.service.
            
            #定时同步,每10分钟
            crontab -e 
            #编辑内容如下
            */10 * * * * ntpdate time.nist.gov
            ```
      
         6. 扩容目录的逻辑卷（非必须，主要是测试环境）
      
            ```java
            # 测试环境的每台服务器（情况比较特殊，虚拟节点）
            计划：测试环境原/home目录拆500g容量到/root,自留44G,正式环境自行调整
            步骤：
            1打包备份home目录
            	 sudo tar cvf /run/home.tar /home
            2关闭和卸载home目录
                确认系统时钟同步正常后,再进行下面的操作
                先停掉web上的服务,再停掉linux里的所有进程(除了mysql)
                再停掉systemctl stop cloudera-scm-agent（3台）
                再停掉systemctl stop cloudera-scm-server（主节点）
            	 fuser -km /home/
            	 umount /home
            3删除home的lv逻辑卷和数据
            	 sudo lvremove /dev/mapper/centos-home
            4扩展目标目录的容量
            	 sudo lvextend -L +500G /dev/mapper/centos-root
            5扩展目标目录的XFS文件系统
            	 sudo xfs_growfs /dev/mapper/centos-root
            6重建home的lv逻辑卷
            	 sudo lvcreate -L 44G -n/dev/mapper/centos-home
            7重建home的XFS文件系统
            	 sudo mkfs.xfs  /dev/mapper/centos-home
            8将新的逻辑卷关联到/home目录下
            	 sudo mount /dev/mapper/centos-home
            9释放原/home文件
            	 sudo tar xvf /run/home.tar -C /
            10删除原备份
            	 sudo rm -rf /run/home.tar
            11如果DS调度器master启动失败,初始化配置
                cd /opt/apache-dolphinscheduler-3.0.0-bin/tools/bin
                sh upgrade-schema.sh
            
            新增物理磁盘后，需要在步骤4、5前创建pv和扩展vg
            1创建物理卷PV
            sudo pvcreate /dev/sdb
            2扩展扩展卷组VG
            sudo vgextend centos /dev/sdb
            ```

## 搭建CDH平台

1. **安装CM**

   - 安装Server服务

     ```java
     # 主服务器安装即可，基于本地yum源
     yum install -y oracle-j2sdk1.8-1.8.0+update181-1.x86_64
     yum install -y enterprise-debuginfo-6.3.1-1466458.el7.x86_64
     yum install -y cloudera-manager-server-6.3.1-1466458.el7.x86_64
     yum install -y cloudera-manager-server-db-2-6.3.1-1466458.el7.x86_64
     ```

   - 配置Server元数据库

     ```java
     # 主服务器即可
     #上传mysql驱动jar包到以下目录
     cd /opt/cloudera/cm/lib
     
     #创建scm数据库
     create database scm;
     #修改元数据库关键字段为中文编码
     alter table CONFIGS         modify `VALUE` longtext character set utf8 collate utf8_general_ci;
     alter table CONFIGS_AUD     modify `VALUE` longtext character set utf8 collate utf8_general_ci;
     alter table GLOBAL_SETTINGS modify `VALUE` longtext character set utf8 collate utf8_general_ci;
     alter table USER_SETTINGS   modify `VALUE` longtext character set utf8 collate utf8_general_ci;
     alter table AUDITS modify `MESSAGE` longtext character set utf8 collate utf8_general_ci;
     alter table REVISIONS modify `MESSAGE` longtext character set utf8 collate utf8_general_ci;
     
     #执行配置
     /opt/cloudera/cm/schema/scm_prepare_database.sh -h localhost mysql scm root 123456
     
     #查看数据库配置(账密)和日志配置
     cat /etc/cloudera-scm-server/db.properties
     cat /etc/cloudera-scm-server/log4j.properties
     ```

   - 启动Server服务

     ```java
     #开始启动第一台,等待3分钟
     systemctl restart cloudera-scm-server
     #agent一般不用管,会随着scm启动而启动,如果要启动,3台节点都要重启才行
     systemctl restart cloudera-scm-agent
     
     #查看第一台启动状态
     systemctl status cloudera-scm-server
     #查看每台的启动状态
     systemctl status cloudera-scm-agent
     
     #查看scm-server的端口号是否生成,才能证明启动成功
     netstat -anp | grep 7180
     
     #查看server日志
     tail -f /var/log/cloudera-scm-server/cloudera-scm-server.log
     ```

   - 安装CDH主机

     ```java
     # 主服务器，配置本地parcle包
     #必须要在数据库初始化后,再上传cdh6的parcle文件到以下目录中
     /opt/cloudera/parcel-repo
     
     #进入目录,并重命名parcle文件名
     mv CDH-6.3.2-1.cdh6.3.2.p0.1605554-el7.parcel.sha1 CDH-6.3.2-1.cdh6.3.2.p0.1605554-el7.parcel.sha
     ```

2. CDH-WEB页面安装

   1. 登录 http://01.com:7180/cmf/login ,账密都是admin
   2. 登录后先不要安装，返回web首页->点击Cloudera Manager->点击parcle更细频率为1分钟->进入后台 /opt/cloudera/parcel-repo 检查到 .torrent文件,则识别parcle包成功
   3. 回到web页面->群集->添加群集->选择免费cdh->设置群集名称为cluster1->选择主机名 [01-05].com 和端口22->选中扫描到节点->自定义存储库设置为 http://01.com/cm6/6.3.1 ->cdh版本选6.3.2->选中仅安装oracle java->ssh登录,同时连接数为10->安装好后在页面找到 inspect cluster 进入测试网络和端口->查看问题并解决->最后点击了解风险,继续创建主机;

3. **配置Service监控**

   ```java
   # 主服务器 为角色创建目录并授权
   mkdir -p /var/lib/cloudera-host-monitor
   mkdir /var/lib/cloudera-service-monitor
   chown -R cloudera-scm:cloudera-scm /var/lib/cloudera-host-monitor
   chown -R cloudera-scm:cloudera-scm /var/lib/cloudera-service-monitor/
   ```

4. 进入web页面->添加->添加CM Service->开始分配角色:
   Activity Monitor(默认不分配)
   Service Monitor(分配到第一台,监控yarn)
   Host Monitor(分配到第二台,监控服务器运行状况)
   Event Server(分配到第二台,用于事件报警)
   Alert Publisher(分配到第一台,用于特定事件的报警)
   ->审核更改->分配角色的目录

## 安装大数据组件

1. **添加HDFS**

   1. web页面->状态->添加服务->HDFS->第一台(namenode,datanode),第二台(secondaryNamenode,datanode,balancer),第三台(datanode)->安装后，会有一些异常信息,这表示尚未完全启动,需要等待一段时间,然后依次处理如下异常即可:

      ①hdfs权限检查问题: web页面进入HDFS->配置->取消hdfs权限的勾选->保存->重启->重启过时服务->勾选重启客户端配置->立即重启

      ②关闭权限,hdfs群集->配置->hdfs-site->hdfs-site.xml 的 HDFS 服务高级配置代码段（安全阀）->把dfs.permissions.enabled设置为false

      ③关闭safemode模型:

      ```java
      #查看safemode状态
      hdfs dfsadmin -safemode get
      
      #关闭safemode
      hdfs dfsadmin -safemode leave
      
      #创建一个hdfs测试目录,进入hdfs的webui验证
      sudo -u hdfs hdfs dfs -mkdir /test20230517
      ```

      **只有当服务器磁盘严重不够时,以下操作才允许执行!**

      ```java
      #停止HDFS服务
      进入CDH,停止HDFS组件和其它相关组件
      
      #在每台服务器的/home目录,创建新的dn文件夹,更换dn的所属用户和组
      cd /home
      mkdir dn
      chown -R hdfs /home/dn
      chgrp -R hadoop /home/dn
      
      #复制移动数据
      cp -af /dfs/dn/* /home/dn
      
      #修改HDFS配置项
      搜索dfs.datanode.data.dir配置,并替换旧路径为/home/dn,启动HDFS
      启动后用 hdfs fsck /
      再去CDH上进入HDFS的操作,开始重新平衡
      
      #删除原有的目录
      rm -rf /dfs/dn
      ```

2. **添加YARN**

   1. web页面->状态->添加服务->YARN->第一台(resourceManager,nodeManager,jobhistory),第二台(nodeManager),第三台(nodeManager)->使用默认值/yarn/nm->依次处理以下异常信息:

      ①抑制nodeManager无关紧要的警告信息

      ②测试yarn的安装是否有用:

      ```java
      vim /tmp/demo/test01.txt
      #编辑内容如下
        020
        020
      
      #上传到hdfs
      sudo -u hdfs hdfs dfs -put /tmp/demo/test01.txt /test20230517
      
      #运行词频统计
      sudo -u hdfs yarn jar /opt/cloudera/parcels/CDH/jars/hadoop-mapreduce-examples-3.0.0-cdh6.3.2.jar wordcount /test20230517 /output
      
      #查看结果
      sudo -u hdfs hdfs dfs -cat /output/part-r-00011
      ```

3. **添加Zookeeper**

   分配角色(选所有服务器)->如果有异常报警，请等待一段时间完全启动后再刷新看看

4. **添加Hive**

   准备hive的元数据库

   ```java
   # 主服务器 将mysql的jar包放入hive目录下
   cp /opt/cloudera/cm/lib/mysql-connector-java-5.1.47.jar /opt/cloudera/parcels/CDH/lib/hive/lib/
   
   #进入第二台服务器(确保这个路径存在)
   cd /usr/share/java
   #也上传一个jar,然后修改名称(去掉版本)
   mv mysql-connector-java-5.1.47.jar mysql-connector-java.jar
   
   #并在mysql中创建hive数据库
   mysql -uroot -p
   create database hive;
   ```

   进入web->添加->选择依赖hdfs(带zk的那个,感觉每条像镜像)->分配角色:
   Gateway(每台都选,网关), MetaStore server(第二台), HiveServer2(第二台)
   ->设置元数据库mysql,主机用第一台,库名为hive,账户是root.密码是123456->测试连接->审核更改->hive地址 /user/hive/warehouse -> metastore 端口 9083 ->登录HiveServer2 Web UI->验证hive;

   ```java
   #登录
   hive
   
   #写条sql解析指定日期
   select from_unixtime(1583781807, 'yyyy-MM-dd');
   ```

   ```java
   # 设置元数据库hive的字符集为utf8
   
   alter table COLUMNS_V2 modify column COMMENT varchar(256) character set utf8;
   alter table TABLE_PARAMS modify column PARAM_VALUE varchar(4000) character set utf8;
   alter table PARTITION_PARAMS modify column PARAM_VALUE varchar(4000) character set utf8 ;
   alter table PARTITION_KEYS modify column PKEY_COMMENT varchar(4000) character set utf8;
   alter table INDEX_PARAMS modify column PARAM_VALUE varchar(4000) character set utf8;
   ```

   设置hiveserver2的内存大小:
   	cdh页面->配置->HiveServer2 的 Java 堆栈大小（字节）->设置为1个G
   设置hive中的executor和driver内存
   	cdh页面->配置->spark.executor.memory->设置为14个G

5. **添加Oozie**

   ```
   # 将mysql的jar包放入指定目录下,并在mysql中创建oozie数据库
   cp /opt/cloudera/cm/lib/mysql-connector-java-5.1.47.jar /opt/cloudera/parcels/CDH/lib/oozie/lib/
   cp /opt/cloudera/cm/lib/mysql-connector-java-5.1.47.jar /var/lib/oozie/
   
   mysql -uroot -p
   create database oozie character set utf8;;
   ```

   添加服务->选择依赖(有hive的那个)->分配到第二台服务器->选择数据库,主机用第一台,账户是root.密码是123456->测试连接

6. **添加Sqoop**

   1. 添加服务->选择3台节点安装

      ```
      #将mysql的jar包放入sqoop,底层走的MR,所以3台都需要添加jar包
      cp /opt/cloudera/cm/lib/mysql-connector-java-5.1.47.jar /opt/cloudera/parcels/CDH/lib/sqoop/lib/
      ```

   2. 如果其他地方需要用到sqoop绝对路径启动,可以参考下面的方法

      ```
      /opt/cloudera/parcels/CDH-6.3.2-1.cdh6.3.2.p0.1605554/lib/sqoop/bin sudo -u hdfs sqoop import
      ```

7. **添加hue**

   添加服务->选择依赖(有最全的组件的那条)->主机用第一台就行,账户root密码123456->进入hue群集->创建账密admin/admin

   注意: 随着数分人员使用hue,会有很多查询hive表的缓存出现,注意磁盘分配

   ```
   #创建hue的元数据库
   mysql -uroot -p
   create database hue default character set utf8 collate utf8_general_ci;
   ```

   取消hue的导出数据的行数限制:
   	CDH->hue->配置->hue_safety_valve.ini->添加如下后再重启

   ```
   [beeswax]
   download_row_limit = -1
   ```

8. **添加Spark**

   cdh的spark是阉割版,只是计算on yarn,当前无法使用spark sql,但可以先使用spark引擎,在cdh搜索 http://hive.execution.engine 选择引擎为spark,然后重启hive等其它依赖服务
   <img src="article/运维/picture/img46.png" alt="图片alt" title="img46.png">
   
    设置为cluster模式
   
   <img src="article/运维/picture/img47.png" alt="图片alt" title="img47.png">

## 安装DataX

1. **部署Maven**

   主服务器上进行

   ```java
   #上传tar包到下面这个路径
   /opt/software
   #指定解压在opt目录下
   tar xzvf apache-maven-3.8.5-bin.tar.gz -C /opt/
   
   #添加环境变量
   vi  /etc/profile
   export MAVEN_HOME=/opt/apache-maven-3.8.5
   export PATH=${PATH}:${MAVEN_HOME}/bin
   #刷新环境变量
   source /etc/profile
   ```

   ```java
   #进入maven配置文件
   vi /opt/apache-maven-3.8.5/conf/settings.xml
   #把<mirrors>下的<mirror>全部替换为下面的配置
       <mirror>
   		<id>alimaven</id>
   		<name>aliyun maven</name>
   		<url>http://maven.aliyun.com/nexus/content/groups/public/</url>
   		<mirrorOf>central</mirrorOf>
   	</mirror>
   	<mirror>
   		<id>aliyunmaven</id>
   		<mirrorOf>*</mirrorOf>
   		<name>阿里云spring插件仓库</name>
   		<url>https://maven.aliyun.com/repository/spring-plugin</url>
   	</mirror>
   	<mirror> 
   		<id>repo2</id> 
   		<name>Mirror from Maven Repo2</name> 
   		<url>https://repo.spring.io/plugins-release/</url> 
   		<mirrorOf>central</mirrorOf> 
   	</mirror>
   	<mirror>
   		<id>UK</id>
   		<name>UK Central</name>
   		<url>http://uk.maven.org/maven2</url>
   		<mirrorOf>central</mirrorOf>
   	</mirror>
               <mirror>
   		<id>sonatype</id>
   		<name>sonatype Central</name>
   		<url>http://repository.sonatype.org/content/groups/public/</url>
   		<mirrorOf>central</mirrorOf>
   	</mirror>
   	<mirror>
   		<id>jboss-public-repository-group</id>
   		<name>JBoss Public Repository Group</name>
   		<url>http://repository.jboss.org/nexus/content/groups/public</url>
   		<mirrorOf>central</mirrorOf>
   	</mirror>
   	<mirror>
   		<id>CN</id>
   		<name>OSChina Central</name>
   		<url>http://maven.oschina.net/content/groups/public/</url>
   		<mirrorOf>central</mirrorOf>
   	</mirror>
   	<mirror>
   		<id>google-maven-central</id>
   		<name>GCS Maven Central mirror Asia Pacific</name>
   		<url>https://maven-central-asia.storage-download.googleapis.com/maven2/</url>
   		<mirrorOf>central</mirrorOf>
   	</mirror>
       <mirror>
   		<id>confluent</id>
   		<name>confluent maven</name>
   		<url>http://packages.confluent.io/maven/</url>
   		<mirrorOf>confluent</mirrorOf>
   	</mirror>
   ```

2. **部署DataX**

   ```java
   # 每台服务器都要安装
   #上传tar包到下面这个路径
   /opt/software
   #指定解压在opt目录下
   tar xzvf /opt/software/datax.tar.gz -C /opt/
   
   #开始自检(注意加执行权限)
   cd /opt/datax/plugin/reader
   rm -rf ./._*
   cd /opt/datax/plugin/writer
   rm -rf ./._*
   /usr/bin/python /opt/datax/bin/datax.py /opt/datax/job/job.json
   
   #运行取数代码
   sh /opt/datax/job/mysql2ods.sh
   ```

## 安装Seatunnel

```java
#先在第一台节点上传安装包,开始解压缩(后续把2.3.3升级2.3.5)
tar -zxvf /opt/software/apache-seatunnel-2.3.5-bin.tar.gz -C /opt/

#配置集群启动的jvm大小
vi /opt/apache-seatunnel-2.3.5/bin/seatunnel-cluster.sh
    #放在代码块的第一行,不是文件首行噢
    JAVA_OPTS="-Xms2G -Xmx2G"
#配置seatunnel的属性
vi /opt/apache-seatunnel-2.3.5/config/seatunnel.yaml
    interval: 300000
    timeout: 10000
    namespace: /home/tmp/seatunnel/checkpoint_snapshot
    fs.defaultFS: hdfs://10.xx.0.xx:8020
#配置seatunnel的引擎(节点太多时也可以直接写ip范围)
vi /opt/apache-seatunnel-2.3.5/config/hazelcast.yaml
    member-list:
          - 10.xx.0.xx
          - 10.xx.0.xx
          - 10.xx.0.xx
#配置SeaTunnel的引擎服务
vi /opt/apache-seatunnel-2.3.5/config/hazelcast-client.yaml
    cluster-members:
     - 10.xx.0.xx:5801
     - 10.xx.0.xx:5801
     - 10.xx.0.xx:5801
#配置连接器(看情况保留自己喜欢的插件,不喜欢就注释掉)
vi /opt/apache-seatunnel-2.3.5/config/plugin_config
#以前2.3.3要自己把connector-file-hadoop-2.3.5.jar连接器上传到connectors目录,在2.3.5貌似不用

#开始下载连接器
cd /opt/apache-seatunnel-2.3.5/bin
sh ./install-plugin.sh
#如果上面下载慢,参考下面的网站教程
#先安装maven,然后替换$SEATUNNEL HOME}/mvnw为mvn,使用阿里镜像
#https://blog.csdn.net/qq_41865652/article/details/134574104

#上传hive的支持包hive-exec-2.3.9.jar到lib目录
cd /opt/apache-seatunnel-2.3.5/lib


#是否配置上游数据源的驱动,具体要看官网
cd /opt/apache-seatunnel-2.3.5/plugins
mkdir -p ./jdbc/lib/
cd /opt/apache-seatunnel-2.3.5/plugins/jdbc/lib
#上传一下准备好的mysql-connector-java-5.1.47

#把上面第一台的文件,分发给其它节点
cd /opt
scp -r apache-seatunnel-2.3.5/ root@10.xx.0.xx:$PWD
scp -r apache-seatunnel-2.3.5/ root@10.xx.0.xx:$PWD

#每个节点都配环境变量
vi /etc/profile
    export SEATUNNEL_HOME=/opt/apache-seatunnel-2.3.5
    export PATH=$PATH:$SEATUNNEL_HOME/bin
source /etc/profile
#每个节点都创建日志目录
mkdir -p $SEATUNNEL_HOME/logs  
#每个节点都创建快照目录
mkdir -p /home/tmp/seatunnel/checkpoint_snapshot

#启动集群,每个节点都启动
chmod u+x /opt/apache-seatunnel-2.3.5/bin/seatunnel-cluster.sh
nohup $SEATUNNEL_HOME/bin/seatunnel-cluster.sh 2>&1 &
#停止集群
$SEATUNNEL_HOME/bin/stop-seatunnel-cluster.sh
```

## 安装DolphinScheduler

1. 装进程管理工具

   ```
   # 每台服务器都要做
   sudo yum install -y psmisc
   ```

2. 创建用户

   ```
   注：每台服务器都要做,检查/home所属者是root,/home/ds所属者是ds
   #创建账户,并设置密码
   useradd dolphinscheduler
   echo "123" | passwd --stdin dolphinscheduler
   
   #配置sudo免密登录
   sudo echo 'dolphinscheduler  ALL=(ALL)  NOPASSWD: NOPASSWD: ALL' >> /etc/sudoers
   sudo sed -i 's/Defaults    requirett/#Defaults    requirett/g' /etc/sudoers
   
   #登录dolphinscheduler用户,设置密钥
   su dolphinscheduler
   ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   
   注：以下仅在第一台节点操作
   #拷贝公钥到三台节点,确保原用户root也是三台节点免密登录
   ssh-copy-id  01.com
   ssh-copy-id  02.com
   ssh-copy-id  03.com
   #注：如果遇到权限无法拷贝问题，命令前面可以加sudo
   
   #重启
   service sshd restart
   ```

3. 创建元数据库（主服务器执行mysql技术元数据库）

   ```java
   #创建数据库
   set global validate_password_policy=LOW;
   CREATE DATABASE dolphinscheduler DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
   
   #创建用户
   CREATE USER 'dolphinscheduler'@'%' IDENTIFIED BY 'dolphinscheduler';
   #赋予用户权限
   GRANT ALL PRIVILEGES ON dolphinscheduler.* TO 'dolphinscheduler'@'%';
   #刷新权限
   flush privileges;
   ```

4. **解压安装包**

   ```java
   # 主服务器执行
   #下载tar包,上传到/opt/software下面
   https://archive.apache.org/dist/dolphinscheduler/3.0.0/apache-dolphinscheduler-3.0.0-bin.tar.gz
   
   #解压
   cd /opt/software
   tar -xvzf apache-dolphinscheduler-3.0.0-bin.tar.gz -C /opt/
   
   #权限赋予dolphinscheduler用户
   chown -R dolphinscheduler:dolphinscheduler /opt/apache-dolphinscheduler-3.0.0-bin
   ```

5. **上传mysql驱动**

   1. 首先,将mysql-connector-java-8.0.25.jar上传到/opt/apache-dolphinscheduler-3.0.0-bin/

   2. 其次,编写一个cp_mysql.sh脚本(执行权限)

      ```java
      #!/bin/bash
      cp -rf mysql-connector-java-8.0.25.jar api-server/libs/
      cp -rf mysql-connector-java-8.0.25.jar alert-server/libs/
      cp -rf mysql-connector-java-8.0.25.jar master-server/libs/
      cp -rf mysql-connector-java-8.0.25.jar worker-server/libs/
      cp -rf mysql-connector-java-8.0.25.jar tools/libs/
      ```

      授权并执行

      ```
      chmod +x cp_mysql.sh
      ./cp_mysql.sh
      ```

   3. **修改配置文件**

      dolphinscheduler_env.sh

      ```java
      vim /opt/apache-dolphinscheduler-3.0.0-bin/bin/env/dolphinscheduler_env.sh
      
      #1、配置javahome
      export JAVA_HOME=/usr/java/jdk1.8.0_181-cloudera
      
      #2、配置mysql数据库，就是刚才创建的
      export DATABASE=${DATABASE:-mysql}
      export SPRING_PROFILES_ACTIVE=${DATABASE}
      export SPRING_DATASOURCE_URL="jdbc:mysql://01.com:3306/dolphinscheduler?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai"
      export SPRING_JACKSON_TIME_ZONE=${SPRING_JACKSON_TIME_ZONE:-GMT+8}
      export SPRING_DATASOURCE_USERNAME="dolphinscheduler"
      export SPRING_DATASOURCE_PASSWORD="dolphinscheduler"
       
      #3、zk设置 
      export REGISTRY_TYPE=${REGISTRY_TYPE:-zookeeper}
      export REGISTRY_ZOOKEEPER_CONNECT_STRING="01.com:2181,02.com:2181,03.com:2181"
          
      #4、hadoop、hive，环境变量配置，注意：后面要用python、datax时，也要在这里配置
      export HADOOP_HOME=/opt/cloudera/parcels/CDH/lib/hadoop
      export HADOOP_CONF_DIR=/opt/cloudera/parcels/CDH/lib/hadoop/etc/hadoop
      export SPARK_HOME1=/opt/cloudera/parcels/CDH/lib/spark
      export SPARK_HOME2=/opt/cloudera/parcels/CDH/lib/spark
      #export PYTHON_HOME=/opt/module/anaconda3/bin/python
      export JAVA_HOME=/usr/java/jdk1.8.0_181-cloudera
      export HIVE_HOME=/opt/cloudera/parcels/CDH/lib/hive
      #export FLINK_HOME=/opt/soft/flink
      #export DATAX_HOME=/opt/soft/datax/bin/datax.py
      
      export PATH=$HADOOP_HOME/bin:$SPARK_HOME1/bin:$SPARK_HOME2/bin:$JAVA_HOME/bin:$HIVE_HOME/bin:$PATH
      ```

      install_env.sh

      ```java
      vim /opt/apache-dolphinscheduler-3.0.0-bin/bin/env/dolphinscheduler_env.sh
      
      #1、集群地址
      ips="01.com,02.com,03.com"
       
      #2、端口不用动
      sshPort="22"
       
      #3、master
      masters="01.com"   #多台："hadoop102,hadoop103"
       
      #4、dolphinscheduler的默认工作组，集群必须是上面ips中
      workers="01.com:default,02.com:default,03.com:default"
       
      #5、指定alertServer和apiServers的主机
      alertServer="01.com"
      apiServers="01.com"
       
      #6、dolphinscheduler调度器的安装路径，安装在本用户用权限的下的路径。
      installPath="/opt/apache-dolphinscheduler-3.0.0-bin"
       
      #7、部署用户，是dolphinscheduler调度器的启动用户，需要具有sudo的权限，并且配置免密
      deployUser="dolphinscheduler"
      ```

      common.properties

      ```java
      注意:只修改如下内容,不要全覆盖
      
      #一起修改5个文件保持一致
      vim /opt/software/apache-dolphinscheduler-3.0.0-bin/tools/conf/common.properties
          /opt/software/apache-dolphinscheduler-3.0.0-bin/api-server/conf/common.properties
          /opt/software/apache-dolphinscheduler-3.0.0-bin/alert-server/conf/common.properties
          /opt/software/apache-dolphinscheduler-3.0.0-bin/master-server/conf/common.properties
          /opt/software/apache-dolphinscheduler-3.0.0-bin/worker-server/conf/common.properties
      
      # 1、临时文件路径
      data.basedir.path=/tmp/dolphinscheduler
       
      # 2、资源存储位置: HDFS, S3, NONE。
      resource.storage.type=HDFS
       
      # 3、在hdfs的根路径，资源会传到hdfs下面路径上
      resource.upload.path=/dolphinscheduler
       
      # 4、没有开启kerberos就不用管，开启，就如下配置
      # 4.1whether to startup kerberos
      hadoop.security.authentication.startup.state=false
       
      # 4.2java.security.krb5.conf path
      java.security.krb5.conf.path=/opt/krb5.conf
       
      # 4.3login user from keytab username
      login.user.keytab.username=hdfs-mycluster@ESZ.COM
      
      # 4.4login user from keytab path
      login.user.keytab.path=/opt/hdfs.headless.keytab
       
      # 4.5kerberos expire time, the unit is hour
      kerberos.expire.time=2
      
      # 5 操作hdfs的用户
      hdfs.root.user=hdfs
       
      # 6 如果namenode HA 未开启, 指定namenode节点
      fs.defaultFS=hdfs://01.com:8020
      
      # 7 访问yarn，默认不用改变
      resource.manager.httpaddress.port=8088
      
      # 8 yarn的ip配置，根据是否启用ha，分为两种情况
      yarn.resourcemanager.ha.rm.ids=
      yarn.application.status.address=http://01.com:%s/ws/v1/cluster/apps/%s
      yarn.job.history.status.address=http://01.com:19888/ws/v1/history/mapreduce/jobs/%s
      ```

   6. 初始化启动

      ```java
      #用root用户进行初始化(注意/home目录所属者是root,而/home/ds的所属者是ds)
      cd /opt/apache-dolphinscheduler-3.0.0-bin/tools/bin
      sh upgrade-schema.sh
      
      #分发配置文件到从节点,并直接启动(后续用start也可以)
      sh /opt/apache-dolphinscheduler-3.0.0-bin/bin/install.sh
      #如果需要关闭集群用 sh stop-all.sh
      
      #登录
      http://01.com:12345/dolphinscheduler/ui/login
      默认的用户名和密码是 admin/dolphinscheduler123
      ```

## 问题解决

1. 在CDH6.3大数据集群环境中，遇到一台未分配服务的主机执行hdfsdfsadmin命令时出现错误：'FileSystemfile:///isnotanHDFSfilesystem'。原因是core-site.xml和hdfs-site.xml配置文件内容为空。解决方案是将正常工作节点上的这两个配置文件复制到问题主机的/etc/hadoop/conf目录下，从而修复错误。

   - 解决办法如下

     到**/etc/hadoop/conf**目录下，找到有关hadoop的配置文件，可以看到core-site.xml、hdfs-site.xml等配置文件内容为空，所以会报“FileSystem file:/// is not an HDFS file system”这个错了， 现在将其他正常hadoop节点上的core-site.xml、hdfs-site.xml复制到该目录下，即可正常使用。

## 集群免密登录设置

```java
ssh-copy-id  01.com
ssh-copy-id  02.com
ssh-copy-id  03.com
ssh-copy-id  04.com
ssh-copy-id  05.com
```

