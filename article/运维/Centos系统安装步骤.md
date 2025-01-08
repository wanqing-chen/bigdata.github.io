## **服务器 Centso7 系统安装文档**

### 制作USB启动盘

```
# 制作软件 rufus
软件官网下载地址：https://rufus.ie/zh/
# 具体制作步骤可参考官网
```

### 系统安装（针对联想服务器）

- U盘插入对应的服务器，开机。F1 进入系统设置，重建 raid 阵列。

- 先清空配置，如下，选择 Clear
  <img src="article/运维/picture/img1.png" alt="图片alt" title="清空配置图">
  
- 开始设置系统的阵列，参考如下
  <img src="article/运维/picture/img2.png" alt="图片alt" title="系统的阵列图">
  
- 保存设置返回系统启动页面，选择F12（多次按）

- 进入 Centos 系统设置页面，其他的保持默认，系统分区需要选择手动分区

- 分区大小，可参考如下规则
  <img src="article/运维/picture/img3.png" alt="图片alt" title="分区设置图">

### 注意事项

1. 如果出现选择的磁盘空闲空间很小和实际空间对应不上，会出现系统分区失败，从而导致系统安装失败。
   <img src="article/运维/picture/img4.png" alt="图片alt" title="分区注意图">
#### 解决办法如下

1. 选择自动分区配置。
2.  我想要额外空间可用
3. 点击完成
4. 选择删除所有空间
5. 保留空间
6. 点击完成
7. 再一次进入磁盘分配页面，选择我要配置分区，解决这个问题。
