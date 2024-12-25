# Linux环境安装JDK 

### 步骤如下 
#### 下载对应的 JDK 版本

[JDK下载地址](https://repo.huaweicloud.com/java/jdk/)

#### 上传到对应的服务器目录下，进行解压，命令如下

**tar -zxvf jdk-11_linux-x64_bin.tar.gz  -C /opt/moudle/**

#### 配置环境变量

1. 打开配置文件 vim /etc/profile

2. 在文件末尾追加如下内容

   ```java
   JAVA_HOME=/usr/local/java/jdk文件名  
   CLASSPATH=%JAVA_HOME%/lib:%JAVA_HOME%/jre/lib
   PATH=$PATH:$JAVA_HOME/bin:$JAVA_HOME/jre/bin
   export PATH CLASSPATH JAVA_HOME
   ```

3. 使配置文件生效

   ```java
   source /etc/profile
   ```

4. 检查是否安装成功

   ```java
   java -version
   ```

