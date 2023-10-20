# 如何开发微信小程序

## 前言

因为最近沉迷和朋友们一起下班去打麻将，他们推荐了一个计分的小程序，就不需要每局都转账或者用扑克牌记录了，但是这个小程序不仅打开有广告，各个页面都植入了广告，用起来十分不适。

于是我就心里暗自下定决心，一定要撸一个没有广告的小程序。一周后，这个小程序发布了。

欢迎大家参观和使用我的小程序！小程序名称：**_MahjongScorer_**

![MahjongScorer](https://zhang.beer/static/images/MahjongScorer.jpg)

## 思路

1.注册，获取头像和昵称。已注册的用户直接自动登录。

2.创建房间，扫一扫加入房间或者转发微信好友、群聊，通过点击加入。

3.添加台板以记录每局抽出来的台费（无需台费可忽略）。

4.每一局对局结束后，记录每个人的输赢情况。

5.散场后，将本次游戏所有记录保存至个人历史记录中，解散房间。

6.评价，随机弹出评价页面对此次体验进行评价。

7.特色功能：为方便第 2 步的记录，增加长按语音识别。

## 准备工作

### 前端

工具：HBuilderX、微信开发者工具

框架：uni-app（Vue3）、pinia
由于页面简单，所以没有使用 UI 框架。

附 uni-app 基本项目结构：

```
┌─uniCloud 云空间目录，阿里云为 uniCloud-aliyun，腾讯云为 uniCloud-tcb（详见 uniCloud）
│─components 符合 vue 组件规范的 uni-app 组件目录
│ └─comp-a.vue 可复用的 a 组件
├─hybrid App 端存放本地 html 文件的目录
├─platforms 存放各平台专用页面的目录
├─pages 业务页面文件存放的目录
│ ├─index
│ │ └─index.vue index 页面
│ └─list
│ └─list.vue list 页面
├─static 存放应用引用的本地静态资源（如图片、视频等）的目录，注意：静态资源只能存放于此
├─uni_modules 存放 uni_modules 规范的插件。
├─wxcomponents 存放小程序组件的目录
├─main.js Vue 初始化入口文件
├─App.vue 应用配置，用来配置 App 全局样式以及监听 应用生命周期
├─manifest.json 配置应用名称、appid、logo、版本等打包信息
└─pages.json 配置页面路由、导航条、选项卡等页面类信息
```

#### 1.新建项目

在 HBuilderX 新建项目。
![vxmp-develop-1](https://zhang.beer/static/images/vxmp-develop-1.png)

#### 2.配置开发工具路径

在 HBuilderX 配置微信开发者工具的安装路径：工具-设置-运行配置-小程序运行配置-微信开发者工具路径。
![vxmp-develop-2](https://zhang.beer/static/images/vxmp-develop-2.png)

#### 3.开启端口

在微信开发者工具，开启端口：设置-安全设置-服务端口。
![vxmp-develop-3](https://zhang.beer/static/images/vxmp-develop-3.png)

#### 4.运行项目

在 HBuilderX 运行项目：运行-运行到小程序模拟器-微信开发者工具。
![vxmp-develop-4](https://zhang.beer/static/images/vxmp-develop-4.png)

这时会根据第 2 步配置的路径自动打开微信开发者工具。
![vxmp-develop-5](https://zhang.beer/static/images/vxmp-develop-5.png)

至此，前端基础工作准备完成。如果您想写的小程序只有前端静态页面而无需后端服务，那么可以不用继续往下看了，只需要：

- 编写静态页面的代码
- 在微信开发者工具左上角点击登录，点击右上角详情-基本信息-AppId，点击修改为您注册的小程序 ID，点击上传。
  ![vxmp-develop-8](https://zhang.beer/static/images/vxmp-develop-8.png)
  - 其中 AppID 获取方式为：进入[微信小程序官网](https://mp.weixin.qq.com/)，找到开发-开发管理-开发设置，在“开发者 ID”下即可获取 AppID(小程序 ID)
- 找到管理-版本管理-开发版本，点击提交审核，待审核通过后将审核版本发布，即可完成小程序开发和发布。

### 后端

工具：IDEA

框架：SpringBoot

数据库：MySQL

#### 1.基础工作

参考之前的博客：[如何搭建自己的网站](../server/如何搭建自己的网站.md)和[如何搭建自己的网站（二）](../server/如何搭建自己的网站（二）.md)进行服务器的搭建和 jar 包的部署。

#### 2.配置服务器域名

进入[微信小程序官网](https://mp.weixin.qq.com/)，找到开发-开发管理-开发设置，在“开发者 ID”下获取 AppID(小程序 ID)、AppSecret(小程序密钥)并保存下来，后续接口需要使用。继续下滑至“服务器域名”，在 request 合法域名、uploadFile 合法域名、downloadFile 合法域名中填写服务器域名，即第 1 步基础工作中部署的服务器域名。

## 编写代码

### 前端

<img  src="https://zhang.beer/static/images/vxmp-develop-1.gif" alt="vxmp-develop-1" width="300" height="600">
<img src="https://zhang.beer/static/images/vxmp-develop-12.png" alt="vxmp-develop-2" width="300" height="600">

下面粘贴部分关键代码。

#### 1.pinia 状态管理库

由于有很多公用的全局的属性和方法，所以将该部分内容都放在 pinia 的全局状态管理库里。
::: details 点击查看代码

```js
import { defineStore } from "pinia";

const useUserStore = defineStore("useUserStore", {
  state: () => {
    return {
      info: {
        // 用户信息
        openid: "",
        avatar: "",
        nickname: "",
        roomid: "",
      },
      isLogin: null, // 是否登录，用于判断是否显示登录页
      shareid: "", // 通过二维码或点击分享进入的房间id
      members: [], // 房间的成员
      records: [], // 本次游戏所有对局
      circle: 1, // 第几局
      sumArr: [], // 本次游戏目前总分
      timer: null, // 定时器，在生成房间后 2 秒触发一次监听房间成员的变更
      scene: null, // 场景：区分是否是通过朋友圈进入，朋友圈进入时无法获取openid会导致报错
      qrCode: "", // 房间二维码
      baseURL: "https://xxxxx.xxx/mahjong/", // 后端接口前缀，省去每次调用接口写一大堆前缀
    };
  },
  actions: {
    async updateInfo(data, mode) {}, // 添加用户、修改头像/昵称
		async getOpenid() {}, // 获取用户的openid
		async autoLogin(roomid) {}, // 如果缓存中有用户openid，则直接登录，否则获取用户openid，并存到缓存。
		async getRecords() {}, // 获取本次游戏所有对局
		async getMembers() {}, // 获取房间的成员
		getSum() {}, // 获取本次游戏目前总分
		async updateRoomid(roomid) {}, // 更新当前用户的房间id
		async gameOver() {}, // 结束游戏并解散房间
		setTimer() {}, // 设置定时器获取成员信息变更
});
```

:::

#### 2.注册

注册时，可以点击头像选择头像，不选就是默认头点击昵称输入昵称，昵称不可为空，且最多八个字。

::: details 点击查看代码

```html
<view class="container">
  <view class="avatarUrl">
    <button
      type="balanced"
      open-type="chooseAvatar"
      @chooseavatar="onChooseavatar"
    >
      <image
        :src="avatarUrl"
        class="refreshIcon"
        v-if="avatarUrl !== defaultAvatar"
      ></image>
      <image v-else src="/static/upload-avatar.svg" class="upload"></image>
    </button>
  </view>
  <view class="nickname">
    <input
      maxlength="8"
      type="nickname"
      :value="nickName"
      @blur="bindblur"
      placeholder="点击输入昵称"
      @input="bindinput"
    />
  </view>
  <view class="operation">
    <button class="confirm" @click="onSubmit">保存</button>
    <button v-if="userStore.info.nickname" class="cancel" @click="cancel">
      取消
    </button>
  </view>
</view>
```

:::

#### 3.首页

进入首页，点击自己头像可以修改头像、昵称，点击加号可以将房间分享联系人或群聊，其他用户可以通过点击分享加入房间。

长按加号可以生成台板，用于记录台费，点击台板可以删除台板。

点击扫码加入，可以生成当前房间小程序码，其他用户可通过扫描该小程序码加入房间。

点击开始，跳转到计分面板。点击结束，将会结束对局并解散当前房间，同时对局的得分情况也将保存至“记录”菜单。

::: details 点击查看代码

```js
async generateCode() { // 生成当前房间小程序码
  this.qrLoading = true
  uni.showLoading()
  let roomid = ''
  if (userStore.info.roomid) {
    roomid = userStore.roomid
  } else {
    roomid = md5(userStore.info.openid + new Date().getTime())
    userStore.updateRoomid(roomid)
  }
  let res = await uni.request({
    url: userStore.baseURL + `get-code?roomid=${userStore.info.roomid}`,
    method: 'post',
    responseType: 'arraybuffer',
  })
  userStore.qrCode = 'data:image/PNG;BASE64,' + uni.arrayBufferToBase64(res.data)
  uni.hideLoading()
  this.qrLoading = false
}
```

:::

#### 4.计分

在胜负栏选择胜负，在得分栏输入每个成员的得分。也可以不选择胜负，直接在得分栏输入正/负数。 最后一个成员的得分无需填写，将会根据所有成员得分之和为 0 的规则自动计算。

长按确定按钮可以进行语音识别，将识别出的结果自动填写在得分栏中。语音模板为: 昵称/第 n 个+输/赢/加/减/正/胜/负+多少。

::: details 点击查看代码

```js
startRecording() {
  if (this.isRecording) return;
  this.isRecording = true;
  this.recorderManager.start({
    duration: 60000, // 录音时长，单位为毫秒
    format: "mp3", // 录音格式
  });
  this.recognitionResult = "正在讲话…";
},
stopRecording() {
  if (!this.isRecording) return;
  this.isRecording = false;
  this.recorderManager.stop();
},
async handleRecordingStop(res) {
  let base64code = uni
    .getFileSystemManager()
    .readFileSync(res.tempFilePath, "base64");
  uni.showLoading();
  let rst = await uni.request({
    url: userStore.baseURL + "/translate/voice",
    method: "post",
    data: {
      data: base64code,
      customizationId: "xxxxxxxxxxxxxxxxxxxxx",
    },
    header: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });
  uni.hideLoading();
  if (rst.data.Result) {
    this.recognitionResult = rst.data.Result;
    this.processingData();
  } else {
    this.recognitionResult = "";
    uni.showToast({
      title: "好像什么也没有听到~",
      icon: "none",
    });
  }
},
words2Number(words) { // 将句子转换成数字
  const one2ten = [
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
    "两",
  ];
  const wordArr = words.split("");
  let number = null;
  for (let i = 1; i < 12; i++) {
    if (wordArr.includes(one2ten[i - 1])) {
      number = i < 11 ? i : 2;
      break;
    }
  }
  return number;
},
processingData() {
  // 定义表示赢和输的意思的词及其对应的正负号
  const winKeywords = ["赢", "加", "正", "胜"];
  const loseKeywords = ["输", "减", "负"];
  const indexs = ["第一个", "第二个", "第三个", "第四个", "第五个"];

  // 初始化结果对象
  const result = {};

  // 按照逗号分割文本
  const phrases = this.recognitionResult.split("，");

  // 遍历每个短语
  phrases.forEach((phrase) => {
    let nickname = "";
    let score = 0;
    // 判断短语中是否包含赢和输的意思的词
    const winKeyword = winKeywords.find((keyword) =>
      phrase.includes(keyword)
    );
    if (winKeyword) {
      // 提取昵称和得分
      const data = phrase.split(winKeyword);
      if (data.length === 2) {
        nickname = data[0];
        indexs.forEach((x, i) => {
          if (nickname.includes(x))
            nickname = userStore.members[i].nickname;
        });
        const matchScore = data[1].match(/\d+/g);
        if (matchScore?.length) {
          score = 1 * matchScore[0];
        } else {
          score = this.words2Number(data[1]);
        }
      }
    } else {
      const loseKeyword = loseKeywords.find((keyword) =>
        phrase.includes(keyword)
      );
      if (loseKeyword) {
        // 提取昵称和得分
        const data = phrase.split(loseKeyword);
        if (data.length === 2) {
          nickname = data[0];
          indexs.forEach((x, i) => {
            if (nickname.includes(x))
              nickname = userStore.members[i].nickname;
          });
          const matchScore = data[1].match(/\d+/g);
          if (matchScore?.length) {
            score = -1 * matchScore[0];
          } else {
            score = -1 * this.words2Number(data[1]);
          }
        }
      }
    }
    // 添加到结果对象中
    if (nickname && score) result[nickname] = score;
  });
  if (Object.keys(result).length === 0) {
    uni.showToast({
      title: "没听清~",
      icon: "none",
    });
  } else {
    for (let key in result) {
      userStore.members.forEach((x, i) => {
        if (key.includes(x.nickname) || x.nickname.includes(key)) {
          this.scores[i] = Math.abs(result[key]);
          this.outcomes[i] = result[key] >= 0 ? "+" : "-";
        }
      });
    }
    this.autoWriteLast(); // 自动填写最后一个成员的得分
  }
}
```

:::

#### 5.记录

点击“记录”菜单，可以查看自己所有历史对局，

点击对局可以查看该对局详情。

#### 6.详情

点击头像可以显示昵称。

::: details 点击查看代码

```js
async showUser(record, index) {
  let nickname = ''
  let openid = record.openids.split(',')[index]
  let findUser = this.viewd.find((x) => x.openid === openid)
  if (findUser) {
    nickname = findUser.nickname
  } else {
    let res = await uni.request({
      url: userStore.baseURL + `search-info`,
      method: 'get',
      data: { openid },
    })
    nickname = res.data[0].nickname
    this.viewd.push({ openid, nickname }) // 已经点过的不再调用接口
    console.log(this.viewd)
  }
  uni.showToast({
    title: nickname,
    icon: 'none',
  })
}
```

:::

#### 7.评价

首先在 pages.json 里面引入「评价发布组件」。

```json
"plugins": {
	"wxacommentplugin": {
		"version": "latest",
		"provider": "wx82e6ae1175f264fa"
	}
}
```

如果还未添加插件，则在开发者工具 Console 里点击「添加插件」。
然后就可以在页面的 js 文件里面调用组件接口。

```js
var plugin = requirePlugin("wxacommentplugin");
plugin.openComment({
  success: (res) => {
    console.log("plugin.openComment success", res);
  },
  fail: (res) => {
    console.log("plugin.openComment fail", res);
  },
});
```

可在[微信小程序官网](https://mp.weixin.qq.com/)的功能-体验评价中查看评价。

### 后端

#### 1.建表

使用了两张表，一张用户表 mahjong，一张对局表 room。

![vxmp-develop-6](https://zhang.beer/static/images/vxmp-develop-6.png)

    id：用户id
    openid：用户的 openid
    avatar：用户的头像
    nickname：用户的昵称
    roomid：用户当前所在房间
    updateTime: 用户加入房间时间

![vxmp-develop-7](https://zhang.beer/static/images/vxmp-develop-7.png)

    id：对局id
    roomid：房间id
    openids：该局对局的所有成员的openid
    scores：该局对局的得分情况
    circle：局数
    createTime：该局对局结束时间
    active：游戏是否结束

#### 2.注册

① 前端通过 uni.login 这个请求获取 code，通过该 code（js_code） 结合小程序的 appid、secret 以及 grant_type=authorization_code，调用微信官方接口“https://api.weixin.qq.com/sns/jscode2session”，返回用户的openid。

::: details 点击查看代码

```java
public JSONObject getOpenid(String code) throws Exception {
    String appid = "xxx";
    String secret = "xxx";
    System.out.println("code=" + code);
    HttpClient httpClient = HttpClients.createDefault();
    URI url = new URIBuilder("https://api.weixin.qq.com/sns/jscode2session")
            .setParameter("appid", appid)
            .setParameter("secret", secret)
            .setParameter("js_code", code)
            .setParameter("grant_type", "authorization_code")
            .build();
    HttpGet httpGet = new HttpGet(url);
    JSONObject json = new JSONObject();
    try {
        HttpResponse res = httpClient.execute(httpGet);
        if (res.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            String result = EntityUtils.toString(res.getEntity());// 返回json格式：
            json = json.parseObject(result);
        } else {
            throw new Exception("获取openid失败！");
        }
    } catch (Exception e) {
        throw new Exception("获取openid异常！");
    }
    return json;
}
```

:::

② 在用户填完头像和昵称后，前端发送请求，后端将接收的头像存储至 minio 中并返回头像路径，然后结合 openid、昵称、房间 id 等信息存储到 mahjong 表中。

#### 3.生成当前房间小程序码

先通过 appid、secre、grant_type=client_credential 调用微信官方接口获取 token，然后使用此 token 结合前端传递的当前房间 id，生成当前房间小程序码。

::: details 点击查看代码

```java
public byte[] getCode(String roomid) throws Exception {
    String appid = "xxx";
    String secret = "xxx";
    HttpClient httpClient = HttpClients.createDefault();
    URI tokenURI = new URIBuilder("https://api.weixin.qq.com/cgi-bin/token")
            .setParameter("appid", appid)
            .setParameter("secret", secret)
            .setParameter("grant_type", "client_credential")
            .build();
    HttpGet httpGet = new HttpGet(tokenURI);
    JSONObject json = new JSONObject();
    try {
        HttpResponse res = httpClient.execute(httpGet);
        if (res.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
            json = json.parseObject(EntityUtils.toString(res.getEntity()));
            URI codeURI = new URIBuilder("https://api.weixin.qq.com/wxa/getwxacode")
                    .setParameter("access_token", json.getString("access_token"))
                    .build();
            HttpPost httpPost = new HttpPost(codeURI);
            String body = "{\"path\": \"pages/home/index?roomid=" + roomid + "\"}";
            httpPost.setEntity(new StringEntity(body));
            try {
                HttpResponse rst = httpClient.execute(httpPost);
                if (rst.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                    return EntityUtils.toByteArray(rst.getEntity());
                } else {
                    throw new Exception("获取小程序码失败！");
                }
            } catch (Exception e) {
                throw new Exception("获取小程序码异常！");
            }
        } else {
            throw new Exception("获取token失败！");
        }
    } catch (Exception e) {
        throw new Exception("获取token异常！");
    }
}
```

:::

#### 4.语音识别

使用的是腾讯云的一句话识别，每个月免费 5000 次。前端将录音临时文件转换成 base64 编码传递至后端，结合使用场景 EngSerViceType、语音数据来源 SourceType（0：语音 URL；1：语音数据）、语音 Url、音频格式 VoiceFormat 以及时间戳、热词、自学习模型。

::: details 点击查看代码

```java
public JSONObject voiceTrans(@RequestParam(required = false) String engSerViceType, @RequestParam(required = false) Long sourceType,
                              @RequestParam(required = false) String url, @RequestParam(required = false) String voiceFormat,
                              @RequestParam(required = false) String data, @RequestParam(required = false) String customizationId ) {
    if (engSerViceType == null) engSerViceType = "16k_zh";
    if (sourceType == null) {
        if (url == null) sourceType = 1L;
        else sourceType = 0L;
    }
    if (voiceFormat == null) voiceFormat = "mp3";
    JSONObject json = new JSONObject();
    String result = VoiceUtils.voiceTrans(engSerViceType, sourceType, url, voiceFormat, data, customizationId);
    json = json.parseObject(result);
    return json;
}

public static String voiceTrans(String EngSerViceType, Long SourceType, String Url, String VoiceFormat, String Data, String CustomizationId ) {
    try {
        // 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
        Credential cred = new Credential("xxx", "xxx");
        // 实例化一个http选项，可选的，没有特殊需求可以跳过
        HttpProfile httpProfile = new HttpProfile();
        httpProfile.setEndpoint("asr.ap-beijing.tencentcloudapi.com");
        // 实例化一个client选项，可选的，没有特殊需求可以跳过
        ClientProfile clientProfile = new ClientProfile();
        clientProfile.setHttpProfile(httpProfile);
        // 实例化要请求产品的client对象,clientProfile是可选的
        AsrClient client = new AsrClient(cred, "", clientProfile);
        // 实例化一个请求对象,每个接口都会对应一个request对象
        SentenceRecognitionRequest req = new SentenceRecognitionRequest();
        req.setEngSerViceType(EngSerViceType);
        req.setSourceType(SourceType);
        req.setUrl(Url);
        req.setVoiceFormat(VoiceFormat);
        req.setData(Data);
        req.setWordInfo(1L);
        req.setReinforceHotword(1L);
        req.setCustomizationId(CustomizationId);
        // 返回的resp是一个SentenceRecognitionResponse的实例，与请求对象对应
        SentenceRecognitionResponse resp = client.SentenceRecognition(req);
        // 输出json格式的字符串回包
        return SentenceRecognitionResponse.toJsonString(resp);
    } catch (TencentCloudSDKException e) {
        return e.toString();
    }
}
```

:::

#### 5.添加记录

当一局结束后，将房间 id，所有成员 openid，分数，局数存储至 room 表，并将 active 设置为 1。
先查询 mahjong 表中是否存在此房间 id，如果不存在，说明对局结束，房间已经解散。然后查询 room 表是否存在此房间 id 且 active 等于 1 的对局：① 如果不存在且 circle 等于 1，再判断该房间成员数量和提交的成员数量，如果前者大于后者，说明有新成员加入，此次提交不生效。② 如果不存在且 circle 不等于 1，说明已经不是第一局，房间已经锁定，其他人无法加入，所以不需要判断，提交有效。③ 如果存在且该房间最后一条对局记录的局数小于提交的局数，提交有效。④ 如果存在且该房间最后一条对局记录的局数大于或等于提交的局数，说明已经有人在你提交前提交过了，提交无效。

::: details 点击查看代码

```java
public String addRecord(Room record) {
    String openids = record.getOpenids();
    Integer circle = record.getCircle();
    List<Room> records = mahjongMapper.searchRecords(openids);
    List<Mahjong> mahjong = mahjongMapper.searchInfo("", record.getRoomid());
    if (mahjong.isEmpty()) {
        return "对局已结束";
    } else {
        if (records.isEmpty()) {
            if (circle == 1) {
                if (mahjong.size() > record.getOpenids().split(",").length) {
                    return "有新成员加入";
                }
            }
            mahjongMapper.addRecord(record);
            return "true";
        } else {
            if (records.get(records.size() - 1).getCircle() < circle) {
                mahjongMapper.addRecord(record);
                return "true";
            } else {
                return "其他成员已提交";
            }
        }
    }

}
```

:::

#### 6.结束游戏

前端将此次游戏所有成员 openid、所有对局的 id、总分、以及房间 id 传递给后端，后端所做的工作依次为：
① 通过 mahjongMapper.gameOver(openids)，遍历 openids，将 mahjong 表中 openid 与之相等的用户房间 id 清空。
② 通过 mahjongMapper.setActive(ids)，遍历所有对局 id，将 room 表中 id 与之相等的对局的 active 设置为 0。
③ 通过 mahjongMapper.addRecord(record)，将总分作为一条对局记录添加至 room 表中，其中 circle 等于-1，active 等于 0。

::: details 点击查看代码

```java
public void gameOver(String[] openids, String[] ids, String scores, String roomid) {
    mahjongMapper.gameOver(openids);
    mahjongMapper.setActive(ids);
    SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    simpleDateFormat.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
    String createTime = simpleDateFormat.format(new Date());
    Room record = new Room(null, String.join(",", ids), String.join(",", openids), scores, -1, createTime, 0);
    mahjongMapper.addRecord(record);
}
```

:::

#### 7.查询历史记录

这个接口逻辑写的有点草率，后续可以优化。

先通过个人 openid 查询 room 表与之相关且 circle 等于-1 的历史记录，
然后查询 mahjong 表中所有用户信息，遍历历史记录，遍历用户信息，
将历史记录的 openid 等于用户信息的 openid 的用户头像提取出来，与历史记录一并返回。

::: details 点击查看代码

```java
public List searchHistory(String openid) {
    List<Room> records = mahjongMapper.searchHistory(openid);

    List<Mahjong> mahjongs = mahjongMapper.searchAllInfo();

    for (Room record : records) {
        String[] openids = record.getOpenids().split(",");
        String avatars = "";
        String avatar = "";

        for (String id : openids) {
            avatar = "";
            for (Mahjong mahjong: mahjongs)
            {
                if(mahjong.getOpenid().equals(id)){
                    avatar = mahjong.getAvatar();
                    break;
                }
            }
            avatars += avatar + ',';
        }
        record.setAvatars(avatars.substring(0, avatars.length() - 1));
    }
    return records;
}
```

:::

## 最后

感兴趣的朋友可以私聊我获取详细代码。
