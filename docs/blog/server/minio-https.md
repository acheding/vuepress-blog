# minio 实现 https 访问

由于网站已经安装 SSL 证书实现了 https 访问，但是 minio 下的文件却还是暴露在 http 中的，在 https 网站中访问 http 图片会失败，网上找了一圈发现大都是通过给 minio 安装 SSL 证书的方式，例如这篇博客：<https://blog.csdn.net/abc_cml/article/details/127634593>

比较复杂，那有没有什么比较简单的方式来实现呢？立即推：万能的 nginx 转发大法。

我们只需要在 nginx 配置文件中新暴露一个 SSL 端口，并转发到我们的 http 地址上即可轻松实现 https 访问。如下图：

![minio-https](https://zhang.beer:9999/ache/beer/blog/minio-https.png)

![minio-https-2](https://zhang.beer:9999/ache/beer/blog/minio-https-2.png)
