# 一键翻译并下划线、中划线、驼峰命名

最近需要大量建表工作，字段名、表名的翻译非常的麻烦，由于之前已经接入过百度翻译的接口，所以昨天下午花了片刻在原翻译接口的基础上优化了一下，只需输入待转换的文本，不限中英文，即可自动翻译并转换成下划线小写、下划线大写、中划线大写、中划线小写、大驼峰、小驼峰格式，方便命名。

![translate-name](https://zhang.beer/static/images/translate-name.png)

## 1.原翻译接口

[百度翻译开放平台](https://fanyi-api.baidu.com/)提供了通用翻译 API 标准版免费调用量 5 万字符/月，高级版免费调用量为 100 万字符/月，个人认证后即可使用通用翻译 API-标准版及高级版。

```java
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;

public class TranslateUtils {
    public static JSONObject translate(@RequestParam String q,
                                       @RequestParam String from,
                                       @RequestParam String to) throws Exception {
        HttpClient httpClient = HttpClients.createDefault();
        URI url = new URIBuilder("https://fanyi-api.baidu.com/api/trans/vip/translate/").setParameter("q", q)
                .setParameter("from", from)
                .setParameter("to", to)
                .setParameter("appid", "xxx") // xxx自行获取
                .setParameter("salt", "xxx")
                .setParameter("sign", DigestUtils.md5Hex(("xxx" + q + "xxx" + "xxx"))).build();
        HttpGet httpGet = new HttpGet(url);
        JSONObject json = new JSONObject();
        try {
            HttpResponse res = httpClient.execute(httpGet);
            if (res.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                String result = EntityUtils.toString(res.getEntity());// 返回json格式：
                json = json.parseObject(result);
            } else {
                throw new Exception("翻译失败！");
            }
        } catch (Exception e) {
            throw new Exception("翻译异常！");
        }
        return json;
    }
}


```

## 2.翻译并命名接口

```java

import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;

public String translate(@RequestParam String q, HttpServletRequest request) throws Exception {
    String ip = IPUtil.getIp(request);
    System.out.println(BaseMethod.getLocalTime() + ":" + ip);
    if (!RateLimiterUtils.isAllowed(ip, 2000)) // 限制一个ip最多只能请求2000次
        return "超出最大请求次数";

    Boolean isEnglish = q.matches("^[a-zA-Z_\\-]+$");
    String dst = "";
    if (isEnglish) { // 判断是否是英文
        dst = q; // 如果是的话直接转换
    } else {
        JSONObject json = TranslateUtils.translate(q, "zh", "en");  // 如果不是的话先翻译
        dst = json.getJSONArray("trans_result").getJSONObject(0).getString("dst");
    }

    String result = "";
    String underscore = "";
    if (dst.matches(".*[_\\s-].*")) {  // 是否包含下划线、中划线、空格
        underscore = dst.replaceAll("[_\\s-]", "_").toLowerCase(); // 如果包含，替换为下划线，并转小写，得到下划线小写格式
    } else { // 如果不包含，那一定是大写字母＋小写字母格式
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < dst.length(); i++) { // 遍历字符串
            char c = dst.charAt(i);
            if (Character.isUpperCase(c)) { // 如果是大写字母
                if (i != 0) {
                    sb.append('_'); // 在大写字母的位置插入入下划线
                }
                sb.append(Character.toLowerCase(c)); // 同时将这个大写字母转成小写字母并插入到下划线后
            } else {
                sb.append(c);
            }
        }
        underscore = sb.toString(); // 同样的，得到下划线小写格式
    }
    result = "<p>" + underscore + "</p>";
    result = result.concat("<p>" + underscore.toUpperCase() + "</p>"); // 得到下划线大写格式
    String hyphen = underscore.replace('_', '-');  // 将所有下划线替换为中划线，得到中划线小写格式
    result = result.concat("<p>" + hyphen + "</p>");
    result = result.concat("<p>" + hyphen.toUpperCase() + "</p>"); // 得到中划线大写格式
    StringBuilder sb = new StringBuilder();
    boolean upperCase = false;
    for (int i = 0; i < underscore.length(); i++) { // 遍历字符串
        char c = underscore.charAt(i);
        if (c == '_') {
            upperCase = true;
        } else {
            if (upperCase) {
                sb.append(Character.toUpperCase(c)); // 将下划线后的字母转成大写字母，并插入到原来下划线的位置
                upperCase = false;
            } else {
                sb.append(c);
            }
        }
    }
    String camelCase = sb.toString();
    result = result.concat("<p>" + camelCase + "</p>"); // 得到首字母小写的驼峰格式
    result = result.concat("<p>" + camelCase.substring(0, 1).toUpperCase() + camelCase.substring(1) + "</p>"); // 得到首字母大写的驼峰格式

    return result;
}

```

## 3.限流接口

```java

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class RateLimiterUtils {
    private static ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    public static boolean isAllowed(String ip, Integer max) {
        AtomicInteger count = requestCounts.computeIfAbsent(ip, k -> new AtomicInteger(0));
        int currentCount = count.incrementAndGet();
        if (currentCount > max) {
            count.decrementAndGet(); // 回退计数器，避免误判
            return false;
        }
        return true;
    }
}


```
