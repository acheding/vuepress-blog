# 如何搭建自己的网站

## 购买服务器

首先，得有一台 24 小时无间断运行的服务器，可以选择 Windows 服务器或者 Linux 服务器，Windows 服务器通过 IIS 部署，这个不算复杂，网上可以搜到一大堆教程，本文主要讲述 Ubuntu 服务器下部署 Vue 项目。

## 重置实例密码、设置密钥对

可以选择两种方式去访问服务器，一是通过实例密码，二是通过密钥对。

## 域名购买、备案、解析

买到服务器之后，就拥有属于自己的一片空间了，但是一长串的 IP 不容易记住怎么办，两个办法：① 少熬点儿夜，提高记忆力。② 挑选一个自己喜欢的域名来代替 IP。大陆的域名都是需要备案的，浙江省的备案大概需要一周左右时间审核，如果身份证上地址不是浙江省，则需要另外提供暂住证明。备案通过之后，就可以解析域名了，一个一级域名可以解析出很多二级域名，一个二级域名可以解析出很多三级域名，依次类推，每一个域名都可以绑定一个服务器公网 IP。

## SSL 证书

使用 IP 或者普通域名访问时，浏览器一般都会出现网站不安全的提示，那怎么解决呢，可以使用安装 SSL 证书实现 https 加密访问。可以使用腾讯云的一键安装功能，也可以自己手动安装，详情见另外一篇博客：[Nginx 服务器 SSL 证书安装部署](./Nginx 服务器 SSL 证书安装部署.md)

## 登陆服务器

可以下载 SSH 客户端软件远程登陆服务器实例，如 Putty 等，Port 选 22。
通过第二步重置的实例账号密码登陆，密码输入是不可见的。

## 服务器下载 nginx

1.切换至 root 用户。

```
sudo su root || sudo -s
```

2.下载。

```
apt-get install nginx
```

3.查看 nginx 是否安装成功。

```
nginx -v
```

4.启动 nginx。

```
service nginx start
```

5.验证。

启动后，在网页重输入 IP 地址或域名，即可看到 nginx 的欢迎页面。至此 nginx 安装成功。

## 打包 Vue 项目

```
yarn build || npm run build
```

## 上传项目

上传打包后的 dist 文件至服务器，这里可以下载 FileZilla 等可视化文件传输工具。

## 修改 nginx 配置

```
vim /etc/nginx/sites-enabled/default || vi /etc/nginx/sites-enabled/default
```

进入 nginx 配置文件，点击 <kbd>a</kbd> 或者 <kbd>i</kbd> 进入编辑，修改 server_name 为 IP 或域名，修改 root 为 dist 文件的路径。因为 Vue 为单页面应用，所以刷新之后会报 404，就需要设置重定向一下：try_files $uri $uri/ /index.html 。编辑完后点击 <kbd>esc</kbd>，然后 <kbd>:</kbd><kbd>w</kbd><kbd>q</kbd> 保存退出。

![website-1](https://zhang.beer/static/images/website-1.png)

记得检查一下这个端口号有没有添加到服务器防火墙的规则里。

## 报错处理

```
find / -name error.log
```

寻找 nginx 的报错日志，查看日志，如果出现 “Permission denied” 说明 nginx 权限不够，vim /etc/nginx/nginx.conf 将第一行的 user www-data 修改为 user root 即可。

![website-2](https://zhang.beer/static/images/website-2.png)

## 后端

这个时候前端基本上就完成了，不妨再继续鼓捣一下后端接口。

1.本地下载安装 JDK、JRE、IDEA，配置环境变量。

2.新建 demo 项目，依赖勾选 Spring Web，在 com.example.demo 下创建 controller 文件夹，添加 Java Class，在类外边写上 @RestController 注解，表明它是一个返回字符串的控制器，接着用 @RequestMapping 注解写一个 /hello 请求，运行并打开 localhost:8080/hello 验证一下。

![website-3](https://zhang.beer/static/images/website-3.png)
![website-4](https://zhang.beer/static/images/website-4.png)

3.使用 mvn clean package 命令清理、打包成 jar 文件，在生成的 target 文件夹下。

4.在 Ubuntu 上通过 docker 部署 jar 包，可以在第一步的时候直接购买自带 docker 基础镜像的服务器。同第八步上传 jar 包到服务器指定文件夹，在该文件夹下创建 DockerFile 文件，将以下内容复制至文件中：

```
FROM java:8
MAINTAINER test
ADD demo-0.0.1-SNAPSHOT.jar demo.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","demo.jar"]
```

第一行表示拉取一个 JDK 为 1.8 的 docker 镜像，第二行表示作者名字为 test，第三行表示上传的 jar 包名字以及替换的名字，第四行表示容器暴露的端口，第五行表示容器启动之后启动的命令，即启动 jar 包。

5.构建镜像 docker build -t my/demo .。最后的 . 表示 Dockerfile 文件在当前目录下，my/demo 为构建之后镜像名称。

6.运行容器 docker run -d --name demo -p 8080:8080 my/demo。

7.查看容器 docker ps，查看镜像 docker images。

## 请求接口、配置跨域

可以在后端配置，或者 nginx 中配置，本地需要在 Vue 项目中配置。这里为 Vue3 下的代码。

```vue
<script setup>
import { reactive, onMounted } from "vue";
import axios from "axios";
const state = reactive({
  springBoot: "",
});
onMounted(() => {
  getSpringBoot();
});
const getSpringBoot = async () => {
  let res = await axios.get("/hello");
  state.springBoot = res.data;
};
</script>

<template>
  <h1>{{ state.springBoot }}</h1>
</template>

<style scoped></style>
```

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3333, // 打开的端口号
    open: true, // 运行时打开浏览器
    proxy: {
      "^/hello": {
        target: "http://xx.xxx.xxx.xx:8080/", //接口的前缀
      },
    },
  },
});
```

![website-5](https://zhang.beer/static/images/website-5.png)
