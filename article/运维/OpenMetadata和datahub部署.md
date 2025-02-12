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

