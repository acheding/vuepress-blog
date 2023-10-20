# SpringBoot + 对象存储（COS）

前提：腾讯对象存储服务器（COS）已设置成公读私写。

思路：前端上传图片，重新命名上传至腾讯对象存储服务器中，路径、名称则存储到数据库中，需要访问图片的时候前端调用接口，后端返回地址，直接通过这个地址访问对象存储服务器中的图片，删除时则前端传入图片 id 和名称，分别删除数据库中的信息和服务器中图片。

## 导入依赖

```java
<dependency>
    <groupId>com.qcloud</groupId>
    <artifactId>cos_api</artifactId>
    <version>5.6.8</version>
</dependency>
```

## 工具类

```java
package com.example.demomybatis.entity;

import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.region.Region;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

public class TencentCOSUploadFileUtil {
    // 存储桶名称
    private static final String BUCKET_NAME = "xxxx-xxxxxxxxxx";
    //secretId 秘钥id
    private static final String SECRET_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    //SecretKey 秘钥
    private static final String SECRET_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    // 自定义文件夹名称，COS会根据这个路径自动创建对应文件夹
    private static final String PREFIX = "diary/";
    // 访问域名
    public static final String URL = "https:/xxxx-xxxxxxxxxx.cos.ap-beijing.myqcloud.com";
    // 创建COS 凭证
    private static final COSCredentials credentials = new BasicCOSCredentials(SECRET_ID, SECRET_KEY);
    // 配置 COS 区域 就购买时选择的区域
    private static final ClientConfig clientConfig = new ClientConfig(new Region("ap-beijing"));

    public static String uploadfile(MultipartFile file) {
        // 创建 COS 客户端连接
        COSClient cosClient = new COSClient(credentials, clientConfig);
        String fileName = file.getOriginalFilename();
        String fileNamePrefix = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()); // 将上传时间作为文件前缀名
        try {
            String substring = fileName.substring(fileName.lastIndexOf("."));
            File localFile = File.createTempFile(String.valueOf(System.currentTimeMillis()), substring);
            file.transferTo(localFile);
            // 同一时间上传多个就重名了，所以增加随机数
            Random random = new Random();
            fileName = PREFIX + fileNamePrefix + "-" + random.nextInt(10000) + substring;
            PutObjectRequest objectRequest = new PutObjectRequest(BUCKET_NAME, fileName, localFile); // 将文件上传至 COS
            cosClient.putObject(objectRequest);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            cosClient.shutdown();
        }
        // 给前端返回图片访问地址（用于读操作）和文件名(用于删除文件）
        return URL + "/" + fileName + ";" + fileName;
    }

    public static Boolean deletefile(String name) {
        try {
            COSClient cosClient = new COSClient(credentials, clientConfig);
            // 指定要删除的 bucket 和路径
            cosClient.deleteObject(BUCKET_NAME, name);
            // 关闭客户端(关闭后台线程)
            cosClient.shutdown();
        }catch (Exception e) {
            e.printStackTrace();
        }
        return true;
    }
}
```

## controller 层

```java
@PutMapping("add-picture")
    public void addPicture(@RequestParam MultipartFile file) throws IOException {
        String two = TencentCOSUploadFileUtil.uploadfile(file);
        String path = two.substring(0, two.indexOf(";"));
        String name = two.substring(two.indexOf(";") + 1);
        Picture picture = new Picture(null, path, name); // null处为id
        calendarService.addPicture(picture);
    }
```
