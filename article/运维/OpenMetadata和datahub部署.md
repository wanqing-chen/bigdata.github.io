## docker修改镜像源

```java
# 修改daemon.json 文件
vim /etc/docker/daemon.json

#修改可以用的镜像源，如下
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io"
    ]
}

# 重修加载文件
sudo systemctl daemon-reload

# 重新启动docker
sudo systemctl restart docker
```

## docker-compose.yml 文件的镜像下载不来解决办法

```
image: docker.getcollate.io/openmetadata/db:1.2.2 
# 改成使用本地镜像如下
image: openmetadata/db:1.2.2 

image: docker.elastic.co/elasticsearch/elasticsearch:8.10.2
# 改成使用本地镜像如下
image: elasticsearch:8.10.2

image: docker.getcollate.io/openmetadata/server:1.2.2
# 改成使用本地镜像如下
image: openmetadata/server:1.2.2

image: docker.getcollate.io/openmetadata/ingestion:1.2.2
# 改成使用本地镜像如下
image: openmetadata/ingestion:1.2.2
```

## docker镜像下载本地方式

```
docker pull docker.1ms.run/openmetadata/server:1.2.2
docker pull docker.1ms.run/openmetadata/ingestion:1.2.2
docker pull docker.1ms.run/openmetadata/db:1.2.2
docker pull docker.1ms.run/elasticsearch:8.10.2
```

## 启动Docker Compose服务

```
docker compose -f docker-compose.yml up --detach  只有第一次使用

#停止服务
docker compose stop
#启动服务
docker compose start
```

## **登录 OpenMetadata**

```
账号：admin	
密码：admin
```

## **登录 datahub**

```
账号：admin	
密码：admin
```

## 设置openmetadata元数据和血缘步骤

### 元数据

参考如下，地址：

```
https://docs.open-metadata.org/latest/connectors/database/hive

https://docs.open-metadata.org/latest/connectors/database/mysql

https://zhuanlan.zhihu.com/p/680208808  （openmetadata部署参考）
```

### 数据血缘

```
# 进入Python的虚拟环境执行 
python3 -m venv env  # 创建虚拟环境
source env/bin/activate # 进入虚拟环境

# 安装 metadata 命令行软件，需与服务端版本1.2.3保持一致
 pip install openmetadata-ingestion==1.2.3
 
# 可能缺少的依赖包
 pip install sqllineage
 
 pip install pyhive
 
 pip install thrift
```

```
# 创建 query_log.csv  内容如下，参考

query_text	database_name	schema_name
select * from ods_u9_base_definevalue_full	default	information_schema
select * from dim_sku_u9_full	default	information_schema
insert into dim_sku_u9_full select * from ods_u9_base_definevalue_full	default	information_schema
```

```
# 创建 query_log_lineage.yaml 内容如下

source:
  type: query-log-lineage
  serviceName: hive_test  #已经成功执行元数据采集的service名
  sourceConfig:
    config:
      type: DatabaseLineage
      queryLogFilePath: ./query_log.csv  #刚才创建的sql语句文件
sink:
  type: metadata-rest
  config: {}
workflowConfig:
  openMetadataServerConfig:
    hostPort: 'http://:8585/api'   #openmetadata的API接口
    authProvider: openmetadata
    securityConfig:
      jwtToken: eyJraWQiOiJHYj   #此令牌可在设置>机器人中查询到
```

```
# 执行 metadata ingest -c query_log_lineage.yml
metadata ingest -c query_log_lineage.yaml
```

```
# 修改镜像源 解决下载过慢的问题
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple openmetadata-ingestion==1.2.2
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

