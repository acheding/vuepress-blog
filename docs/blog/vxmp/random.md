# 微信小程序随机头像与昵称

::: warning 不通过原因

你好，小程序账号登录功能暂未符合规范要求，请在用户了解体验小程序功能后，再要求用户进行账号登录。

:::

::: tip 官网要求

​3.1.2  小程序所提供的所有服务类目功能，必须在小程序首页得到体现，即在小程序首页必须能直达或者经过 2 次点击到达所有本文档 2（服务类目审核）中提交的服务类目页面；

:::

由于之前小程序设置有注册功能，需要用户输入头像和昵称后方才可以进入首页，频频审核不通过。

仔细阅读官网上的要求后决定重新整改一下，目标是最大程度不改源码。

索性增加一个随机头像昵称的功能，保留原有的输入功能，如果用户不想输入，那就随机给予一个吧，反正我们的需求是拿到 openid 就好。

## 1.获取随机头像

找到了一个很有意思的随机头像网站：[https://api.multiavatar.com](https://api.multiavatar.com)

那下面的路就有两条，第一条就是直接用该网站的头像随机生成提供给用户，第二条就是利用 python 爬取一些头像保存，作为静态资源直接使用。

我选择了第二条。代码也十分简单。

```python

import requests
from time import sleep
from io import BytesIO
import os
from PIL import Image


class Spider:
    def __init__(self):
        self.url = 'https://api.multiavatar.com'
        self.path = r"D:\spiders\随机头像PNG"

    def run(self):
        for i in range(0, 1000):
            whole_url = f"{self.url}/{i}.png"
            try:
                response = requests.get(whole_url)
                if response.status_code == 200:
                    image = Image.open(BytesIO(response.content))
                    image.save(os.path.join(self.path, f"{i}.png"))
                    print(f"第{i}个下载完成")
            except Exception as e:
                sleep(3)
                print(e)
                continue

if __name__ == '__main__':
    spider = Spider()
    spider.run()

```

然后将上传的图片资源上传至 minio 文件服务器，直接通过 URL 使用就可以了，例如：[https://zhang.beer:8888/ache/avatar/0.png](https://zhang.beer:8888/ache/avatar/0.png)。关于 minio 的部署详见这篇博客：

## 2.获取随机昵称

在这里我定义了一个 json 文件，同样的上传至 minio 文件服务器了：[https://zhang.beer:8888/ache/nickname/name.json](https://zhang.beer:8888/ache/nickname/name.json)

只需要随机一个前缀 prefix 拼接随机一个后缀 suffix 即可。

## 3.代码

```js
const randomGenerate = async (call) => {
  if (randomLoading.value) return;
  randomLoading.value = true;
  const avatarUrlOnline = `https://zhang.beer:8888/ache/avatar/${Math.floor(
    Math.random() * 1000
  )}.png`; // 拼接随机头像URL
  const res = await new Promise((resolve) => {
    // 必须得先下载头像到本地临时文件，否则报错
    uni.downloadFile({
      url: avatarUrlOnline,
      success: (r) => resolve(r),
    });
  });
  avatarUrl.value = res.tempFilePath;
  if (!nameJson.value) {
    const res = await uni.request({
      url: "https://zhang.beer:8888/nickname/name.json",
      method: "get",
    });
    nameJson.value = res.data;
  }
  const prefix = nameJson.value.prefix; // 获取所有前缀
  const suffix = nameJson.value.suffix; // 获取所有后缀
  const prefix_index = Math.floor(Math.random() * prefix.length); // 根据随机获取一个前缀
  const suffix_index = Math.floor(Math.random() * suffix.length); // 根据随机获取一个后缀
  const text = prefix[prefix_index] + suffix[suffix_index];
  nickname.value = "";
  let index = 0;
  const typingInterval = setInterval(() => {
    // 打字机效果输入昵称
    if (index < text.length) {
      nickname.value += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
      randomLoading.value = false;
      call(); // 后续操作
    }
  }, 75);
};
```

## 4.效果图

<div align="center">
    <video src="https://zhang.beer:8888/ache/b895100b4131805339fc109db4a57fbb.mp4" autoplay="true" controls="controls" />
</div>

## 5.小程序：计了么

最直观的效果微信搜索**计了么**

​
