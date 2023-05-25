# SpringBoot + minio

前面文章中提到 SpringBoot 整合 cos，minio 其实也大同小异。

## 安装依赖

```java
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.2.1</version>
</dependency>
```

## 编写工具类

![springboot-minio](https://zhang.beer/static/images/springboot-minio.png)

### 1.定义 minio 客户端和常量

```java
private static MinioClient minioClient;
private static final String endpoint = "http://xxxxx.xxx:9000";
private static final String bucketName = "xxx";
private static final String accessKey = "xxxxxxxxxx";
private static final String secretKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
private static final String PREFIX = "diary/";
```

### 2.初始化客户端

```java
public static void createClient() {
    log.info(endpoint);
    try {
        minioClient = MinioClient
                .builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### 3.上传图片方法

```java
public static String uploadFile(MultipartFile file) throws Exception {

    createClient();
    InputStream inputStream = file.getInputStream();
    String contentType = file.getContentType();

    String originalPrefix = file.getOriginalFilename(); // 文件原始前缀名
    String originalSuffix = originalPrefix.substring(originalPrefix.lastIndexOf(".")); // 文件原始后缀名
    String fileNamePrefix = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()); // 将上传时间作为新的文件前缀名
    Random random = new Random();
    String objectName = PREFIX + fileNamePrefix + "-" + random.nextInt(10000) + originalSuffix;
    try {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .contentType(contentType)
                        .stream(inputStream, inputStream.available(), -1)
                        .build());
    } catch (Exception e) {
        e.printStackTrace();
    }

    return endpoint + "/" + bucketName + "/" + objectName + ";" + objectName;
}
```

### 4.删除文件方法

```java
public static boolean removeFile(String objectName) throws Exception {
    try {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build());
    } catch (Exception e) {
        e.printStackTrace();
    }
    return true;
}
```
