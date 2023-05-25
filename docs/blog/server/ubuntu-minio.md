# 如何在 ubuntu 上搭建 minio

由于腾讯的对象存储服务器（COS）的半年免费试用期已过，所以寻思鼓捣一下 minio，试着在自己的服务器上搭建一套开源的 minio 对象存储系统。

单机部署基本上有以下两种方式。

## 直接安装

最基础的一种单机安装，这里不做过多阐述，可以参考这篇博客：<https://blog.csdn.net/houor/article/details/126686566>

## docker 安装

### 1.查看镜像

```
docker search minIO
```

### 2.拉取 minio 镜像

```
docker pull minio/minio
```

### 3.创建并启动 minio

```
docker run -p 9000:9000 -p 9090:9090 \
 --name minio \
 -d --restart=always \
 -e "MINIO_ACCESS_KEY=minio" \
 -e "MINIO_SECRET_KEY=minio" \
 -v /home/ubuntu/data:/data \
 minio/minio server \
 /data --console-address ":9090" -address ":9000"
```

- \ 用作换行。
- -p 9000:9000 -p 9090:9090 暴露 9000 和 9090 端口，都可以访问。
- --name minio 容器名称。
- -d --restart=always 后台运行，并在容器退出时总是重启容器。
- -e "MINIO_ACCESS_KEY=minio" 账号。（正常账号应该不低于 3 位，密码不低于 8 位，不然容器会启动不成功）
- -e "MINIO_SECRET_KEY=minio" 密码。
- -v /home/ubuntu/data:/data -v 是 docker run 当中的挂载，minio 所上传的文件默认存储在容器的 data 目录下，这里的/home/ubuntu/data:/data 意思就是将容器的/data 目录和宿主机的/home/ubuntu/data 目录做映射，这样在操作文件时，容器里的数据可以同步到服务器中。
  - 假如删除容器，宿主机中挂载的目录是不会删除的。假如没有使用-v 挂载目录，在宿主机的存储位置的文件会被直接删除。
  - 挂载其实就是将容器目录和宿主机目录进行绑定，操作宿主机目录，容器目录也会变化，操作容器目录，宿主机目录也会变化。可以间接理解为数据持久化，防止容器误删，导致数据丢失的情况。
- minio/minio 镜像名称。
- --console-address 指定客户端端口。

### 4.查看容器和镜像

![ubuntu-minio-1](https://zhang.beer/static/images/ubuntu-minio-1.png)

### 5.访问客户端

部署完成之后可以在对应的 IP 端口直接打开 minio 客户端。通过上面设置的账号密码登录。

![ubuntu-minio-2](https://zhang.beer/static/images/ubuntu-minio-2.png)

### 6.创建存储桶

![ubuntu-minio-3](https://zhang.beer/static/images/ubuntu-minio-3.png)

### 7.赋予桶权限

![ubuntu-minio-4](https://zhang.beer/static/images/ubuntu-minio-4.png)

其中 private 是私有读私有写，public 是公有读公有写，custom 为公有读私有写。

设置为 public 或 custom 后就可以通过 IP 端口+桶名+文件名直接在浏览器访问了。

### 8.添加用户

由于我们是管理员账户，所以可以创建其他普通用户和自己一同共享文件存储系统。

![ubuntu-minio-5](https://zhang.beer/static/images/ubuntu-minio-5.png)

可以看到，在创建的时候我们可以为其赋予规则，有默认的几种规则，当然也可以添加自定义规则。

### 9.添加规则

![ubuntu-minio-6](https://zhang.beer/static/images/ubuntu-minio-6.png)

比如这里，我们新建了一个规则，这个规则允许该用户在名为 test 的存储桶下对该桶里的文件进行增删改查，但是也仅限于此桶，他看不到我的其他桶，且无法创建新的桶。
