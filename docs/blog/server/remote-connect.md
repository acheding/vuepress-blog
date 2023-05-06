# ubuntu 重启 MySQL 后无法远程连接

### idea 报错：

> Cause: org.springframework.jdbc.CannotGetJdbcConnectionException: Failed to obtain JDBC Connection; nested exception is com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure.

> The last packet sent successfully to the server was 0 milliseconds ago. The driver has not received any packets from the server.] with root cause

> java.net.ConnectException: Connection refused: connect

### navicat 报错：

2003-cant connection to mysql server on ‘xx.xxx.xxx.xx’（10061 unknown error）

### 解决过程：

一开始计划是修改 msql 的 max_allowed_packet 设置，修改之后重启 MySQL，结果浏览器接口报 502 错误，以为是服务器 3306 端口被占用，检查了端口显示正常，然后在服务器本地运行 MySQL，发现可以正常运行，说明 MySQL 服务是没问题的，后来本地调试 idea，出现了如上报错，连接数据库失败，猜测可能是远程连接的问题，为了印证猜想，打开 navicat 测试远程连接，结果也报错如上，说明确实是远程连接的问题。于是百度了 navicat 的报错，顺着下文参考文章的解决方法排查了一遍，成功解决。

### 解决方式：

查看配置文件内是否有 bind-address 选项，该选项的值如果为 127.0.0.1，那么，将该值更改为本机 IP 或者 0.0.0.0 或者注释该行。

### 根本原因：

为什么之前几个月一直好好的，重启了一下就开始报错了呢？

bind-address 是 MySQL 用来监听某个单独的 TCP/IP 连接，只能绑定一个 IP 地址，被绑定的 IP 地址可以映射多个网络接口，可以是 IPv4，IPv6 或是主机名，但需要在 MySQL 启动的时候指定(主机名在服务启动的时候解析成 IP 地址进行绑定)。

| 参数         | 应用场景                                                          |
| :----------- | :---------------------------------------------------------------- |
| \*           | 接收所有的 IPv4 或 IPv6 连接请求                                  |
| 0.0.0.0      | 接受所有的 IPv4 地址                                              |
| ::           | 接受所有的 IPv4 或 IPv6 地址                                      |
| IPv4-mapped  | 接受所有的 IPv4 地址或 IPv4 邦定格式的地址（例 ::ffff:127.0.0.1） |
| IPv4（IPv6） | 只接受对应的 IPv4（IPv6）地址                                     |

### 参考文章：

<https://blog.csdn.net/alwaysbefine/article/details/116332945>
