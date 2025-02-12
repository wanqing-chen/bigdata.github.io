## 第一步网络配置

需要添加虚拟机的外网连接配置ip及端口(NAT模式)，操作流程如下:

<img src="article/运维/picture/img48.png" alt="图片alt" title="img48.png">
<img src="article/运维/picture/img49.png" alt="图片alt" title="img49.png">
<img src="article/运维/picture/img50.png" alt="图片alt" title="img50.png">
<img src="article/运维/picture/img51.png" alt="图片alt" title="img51.png">

注意点：

- 主机端口是本地电脑的空闲端口  例如5507
- 虚拟机端口是指：部署的服务应用的端口号

## 第二步:windows系统配置

配置win系统的入站规则，如下图所示:

<img src="article/运维/picture/img52.png" alt="图片alt" title="img52.png">
<img src="article/运维/picture/img53.png" alt="图片alt" title="img53.png">
<img src="article/运维/picture/img54.png" alt="图片alt" title="img54.png">
<img src="article/运维/picture/img55.png" alt="图片alt" title="img55.png">
<img src="article/运维/picture/img56.png" alt="图片alt" title="img56.png">
<img src="article/运维/picture/img57.png" alt="图片alt" title="img57.png">

## 第三步:检测ip

查看网络ip地址

<img src="article/运维/picture/img58.png" alt="图片alt" title="img58.png">
<img src="article/运维/picture/img59.png" alt="图片alt" title="img59.png">

## 第四步:连接测试

在其他机器上输入http://192.168.0.***:5507/，即可访问成功。