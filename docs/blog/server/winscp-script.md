# WinSCP 脚本实现将 jar 包一键上传 Ubuntu 并 docker 部署

## 准备

首先，在 Ubuntu 写一个.sh 脚本用于自动更新 jar 包的 docker 容器和镜像，然后在 Windows 写一个.bat 脚本用于上传 jar 包并运行.sh 脚本。

> deploy.sh

```bash
# Kill容器
docker kill demo

# 删除容器
docker rm demo

# 删除镜像
docker rmi my/demo

# 构建镜像
docker build -t my/demo .

# 运行容器
docker run -d --name demo -p 8080:8080 my/demo
```

其中：

`demo`为容器名

`my/demo`为镜像名

> update.bat

```bash
@echo off

set WINSCP_PATH="E:\WinSCP\WinSCP.com"
set LOCAL_JAR_PATH="D:\xxx\xxx.jar"
set SERVER_ADDRESS=xxx
set SERVER_USERNAME=xxx
set SERVER_PASSWORD=xxx
set SERVER_DESTINATION=/home/ubuntu/xxx

%WINSCP_PATH% /command ^
    "open sftp://%SERVER_USERNAME%:%SERVER_PASSWORD%@%SERVER_ADDRESS%/" ^
    "cd %SERVER_DESTINATION%" ^
    "put %LOCAL_JAR_PATH%" ^
    "call ./deploy.sh" ^
    "exit"
```

其中：

`WINSCP_PATH`为 WinSCP.com 位置

`LOCAL_JAR_PATH`为本地待上传 jar 包位置

`SERVER_ADDRESS`为服务器 IP

`SERVER_USERNAME`为服务器登录用户名

`SERVER_PASSWORD`为服务器登录密码

`SERVER_DESTINATION`为服务器 jar 包上传位置

## 开始

只需要在 Windows 上点击运行 update.bat 脚本，即可一键将本地 jar 包上传至 Ubuntu，并执行更新 docker 的操作。

![winscp-script](https://zhang.beer/static/images/winscp-script.png)
