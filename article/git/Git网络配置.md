### git遇到网络问题

使用Git与GitHub交互时，可能会遇到这样的错误信息：“Failed to connect to github.com port 443 after 21090 ms: Couldn‘t connect to server”。这通常发生在使用VPN后，系统端口号与Git端口号不一致。

##### 解决步骤详解

- **问题定位**

  首先，确认你是否在使用VPN。VPN的使用可能会改变本机的系统端口号，从而影响到Git的正常连接。

- **操作指南**

  a. VPN使用环境下的解决方案

  **查看系统端口号**: 打开“设置 -> 网络和Internet -> 代理”，记录下当前的端口号。

  **设置Git端口号**:

  ```java
  git config --global http.proxy 127.0.0.1:<你的端口号>
  git config --global https.proxy 127.0.0.1:<你的端口号>
  ```

  例如，如果你的端口号是10809，则输入：

  ```java
  git config --global http.proxy 127.0.0.1:10809
  git config --global https.proxy 127.0.0.1:10809
  ```

  **验证设置** (可选):

  ```java
  git config --global -l
  ```

  检查输出，确认代理设置已正确配置。

  **重试Git操作**: 在执行`git push`或`git pull`前，建议在命令行中运行`ipconfig/flushdns`以刷新DNS缓存。

  b. 未使用VPN时的解决方案

  如果你并未使用VPN，但依然遇到端口443连接失败的问题，尝试取消Git的代理设置：
  
  ```java
  git config --global --unset http.proxy
  git config --global --unset https.proxy
  ```
  
  之后重试Git操作，并刷新DNS缓存。

### 总结

讨论了两种常见场景下Git连接GitHub时遇到端口443错误的情况及其解决方法。重点在于检查和调整代理设置，以保证Git可以顺利连接到GitHub。

#### 核心知识点总结表格

| 问题场景    | 解决方法        | 重要命令                                                     |
| ----------- | --------------- | ------------------------------------------------------------ |
| 使用VPN时   | 调整Git代理设置 | git config --global http.proxy, git config --global https.proxy |
| 未使用VPN时 | 取消Git代理设置 | git config --global --unset http.proxy, git config --global --unset https.proxy |

