# ubuntu 服务器代理

## 下载项目

下载项目

```bash
git clone https://github.com/wanhebin/clash-for-linux.git
```

进入到项目目录，编辑`.env`文件，修改变量`CLASH_URL`的值。

```bash
cd clash-for-linux
vim .env
```

> **注意：** `.env` 文件中的变量 `CLASH_SECRET` 为自定义 Clash Secret，值为空时，脚本将自动生成随机字符串。`CLASH_SECRET`用于登录 UI 界面登录。

## 启动程序

- 进入项目目录

```bash
cd clash-for-linux
```

- 运行启动脚本

```bash
sudo bash start.sh

正在检测订阅地址...
Clash订阅地址可访问！                                      [  OK  ]

正在下载Clash配置文件...
配置文件config.yaml下载成功！                              [  OK  ]

正在启动Clash服务...
服务启动成功！                                             [  OK  ]

Clash Dashboard 访问地址：http://<ip>:9090/ui
Secret：xxxxxxxxxxxxx

请执行以下命令加载环境变量: source /etc/profile.d/clash.sh

请执行以下命令开启系统代理: proxy_on

若要临时关闭系统代理，请执行: proxy_off

```

> **注意：** 执行 `source /etc/profile.d/clash.sh` 命令会重置 `/conf/config.yaml` 文件

```bash
source /etc/profile.d/clash.sh
proxy_on
```

> **注意：** 执行 `source /etc/profile.d/clash.sh` 命令失败：切换 root 用户 或使用 sudo 提权。实在不行可以在当前目录下新建 clash.sh 文件，将 start.sh 中相关代码拷贝其中。

- 检查服务端口

```bash
netstat -tln | grep -E '9090|789.'
tcp        0      0 127.0.0.1:9090          0.0.0.0:*               LISTEN
tcp6       0      0 :::7890                 :::*                    LISTEN
tcp6       0      0 :::7891                 :::*                    LISTEN
tcp6       0      0 :::7892                 :::*                    LISTEN
```

- 检查环境变量

```bash
env | grep -E 'http_proxy|https_proxy'
http_proxy=http://127.0.0.1:7890
https_proxy=http://127.0.0.1:7890
```

- 测试连接

```bash
curl -x http://127.0.0.1:7890 -I https://google.com
```

> **注意：** ping 命令不会使用 http 代理。http 代理只能代理基于 tcp 协议的 http 和 https 协议的流量。ping 命令使用 icmp 协议。

## 修改配置

- UI 端口

```bash
external-controller: '0.0.0.0:8888'
```

> **注意：** mode 修改为 global 会导致代理无效，暂不清楚原因。

## 重启程序

如果需要对 Clash 配置进行修改，请修改 `conf/config.yaml` 文件。然后运行 `restart.sh` 脚本进行重启。

> **注意：**
> 重启脚本 `restart.sh` 不会更新订阅信息。

## 停止程序

- 进入项目目录

```bash
cd clash-for-linux
```

- 关闭服务

```bash
sudo bash shutdown.sh

服务关闭成功，请执行以下命令关闭系统代理：proxy_off

```

```bash
proxy_off
```

然后检查程序端口、进程以及环境变量`http_proxy|https_proxy`，若都没则说明服务正常关闭。

## Clash Dashboard

- 访问 Clash Dashboard

通过浏览器访问 `start.sh` 执行成功后输出的地址，例如：http://192.168.0.1:9090/ui

- 登录管理界面

在`API Base URL`一栏中输入：http://\<ip\>:9090 ，在`Secret(optional)`一栏中输入启动成功后输出的 Secret。

点击 Add 并选择刚刚输入的管理界面地址，之后便可在浏览器上进行一些配置。
