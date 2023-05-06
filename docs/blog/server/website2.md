# 如何搭建自己的网站（二）

## 一、ubuntu 安装数据库

1.安装

安装：

```
sudo apt-get install mysql-server
```

查看版本：

```
mysql -V
```

查看运行状态：

```
sudo netstat -tap | grep mysql
```

2.寻找初始密码

```
cd /etc/mysql
sudo vim debian.cnf
```

![website2-1](https://zhang.beer:9999/ache/beer/blog/website2-1.png)

3.登录

```
mysql -u debian-sys-maint -p
Enter password: xxxxxxxxxxxxxxxx
```

4.修改密码

```
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'xxxxxx';
```

5.修改远程连接

```
use mysql;
select host,user from user;
update user set host = '%' where user = 'root';
flush privileges;
```

## 二、mybatis 连接数据库

1.新建 demoMybatis 项目

勾选 mybatis、jdbc 等依赖。

2.修改 application.properties 配置文件

可以将这个文件拆成三个，一个是选择启动文件的 application.yml，一个是开发环境 application-dev.yml，一个是生产环境 application-prod.yml，生产环境的 url 将 localhost 替换成远程数据库地址，详细如下：

![website2-2](https://zhang.beer:9999/ache/beer/blog/website2-2.png)

```
spring:
  profiles:
    active: prod
```

```
server:
  port: 8080
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql://82.157.160.30:3306/ache?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=UTC
    driver-class-name: com.mysql.cj.jdbc.Driver
mybatis:
  mapper-locations: classpath:mapping/*Mapper.xml
  type-aliases-package: com.example.demoMybatis.entity
#showSql
logging:
  level:
    com:
      example:
        mapper: debug
```

3.写查询的接口

mapper

![website2-3](https://zhang.beer:9999/ache/beer/blog/website2-3.png)

数据库：

![website2-4](https://zhang.beer:9999/ache/beer/blog/website2-4.png)

测试一下：

![website2-5](https://zhang.beer:9999/ache/beer/blog/website2-5.png)

常规打包

```
mvn clean package
```

常规上传

查找容器

```
docker ps
```

查找镜像

```
docker images
```

kill 容器

```
docker kill CONTAINERID
```

移除容器

```
docker rm CONTAINERID
```

移除镜像

```
docker rmi IMAGEID
```

构建镜像

```
docker build -t my/demo .
```

运行容器

```
docker run -d --name demo -p 8080:8080 my/demo
```

## 三、vue 搜索关键字高亮

```js
const highLight = (allText, keyword) => {
  let Reg = new RegExp(keyword, "ig");
  if (allText) {
    let execRes = Reg.exec(allText.toString()); //得到一个匹配结果的集合，包含关键字出现的索引
    if (execRes) {
      let realword = allText.substr(execRes.index, keyword.length); //根据索引和关键字长度获取原本的真实大小写关键词
      let res = allText.replace(
        Reg,
        `<span style="color: red;">${realword}</span>`
      );
      return res;
    } else return allText;
  } else return allText;
};
```

## 四、成功辽

![website2-6](https://zhang.beer:9999/ache/beer/blog/website2-6.png)
