# Nginx 服务器 SSL 证书安装部署

工具：WinSCP、putty

## 下载证书

- cloud.tencent.com_bundle.crt 证书文件
- cloud.tencent.com_bundle.pem 证书文件
- cloud.tencent.com.key 私钥文件
- cloud.tencent.com.csr CSR 文件

## 上传证书到服务器

通过 WinSCP 将已获取到的 cloud.tencent.com_bundle.crt 或 cloud.tencent.com_bundle.pem 证书文件和 cloud.tencent.com.key 私钥文件从本地目录拷贝到 Nginx 服务器的 /etc/nginx 目录（此处为 Nginx 默认安装目录，请根据实际情况操作）下。

![ssl-1](https://zhang.beer/static/images/ssl-1.png)

## 配置 SSL

以下两种方式都可。

1.第一种方式：先编辑 Nginx 根目录下的 nginx.conf 文件。增加如下内容：

![ssl-2](https://zhang.beer/static/images/ssl-2.png)

而后编辑 nginx 根目录下的 sites-enabled 下的 default 文件，增加如下内容：

![ssl-3](https://zhang.beer/static/images/ssl-3.png)

亲测成功。

2.第二种方式：编辑 nginx 根目录下的 sites-enabled 下的 default 文件。修改内容如下：

```
server {
     #SSL 默认访问端口号为 443
     listen 443 ssl;
     #请填写绑定证书的域名
     server_name cloud.tencent.com;
     #请填写证书文件的相对路径或绝对路径
     ssl_certificate cloud.tencent.com_bundle.crt;
     #请填写私钥文件的相对路径或绝对路径
     ssl_certificate_key cloud.tencent.com.key;
     ssl_session_timeout 5m;
     #请按照以下协议配置
     ssl_protocols TLSv1.2 TLSv1.3;
     #请按照以下套件配置，配置加密套件，写法遵循 openssl 标准。
     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
     ssl_prefer_server_ciphers on;
     location / {
         #网站主页路径。此路径仅供参考，具体请您按照实际目录操作。
         #例如，您的网站主页在 Nginx 服务器的 /etc/www 目录下，则请修改 root 后面的 html 为 /etc/www。
         root html;
         index  index.html index.htm;
     }
 }
```

## 验证并重启 nginx

```
nginx -t
service nginx restart
```
