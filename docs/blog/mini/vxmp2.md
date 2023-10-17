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

4.每一轮对局结束后，记录每个人的输赢情况。

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
![vxmp2-1](https://zhang.beer/static/images/vxmp2-1.png)

#### 2.配置开发工具路径

在 HBuilderX 配置微信开发者工具的安装路径：工具-设置-运行配置-小程序运行配置-微信开发者工具路径。
![vxmp2-2](https://zhang.beer/static/images/vxmp2-2.png)

#### 3.开启端口

在微信开发者工具，开启端口：设置-安全设置-服务端口。
![vxmp2-3](https://zhang.beer/static/images/vxmp2-3.png)

#### 4.运行项目

在 HBuilderX 运行项目：运行-运行到小程序模拟器-微信开发者工具。
![vxmp2-4](https://zhang.beer/static/images/vxmp2-4.png)

这时会根据第 2 步配置的路径自动打开微信开发者工具。
![vxmp2-5](https://zhang.beer/static/images/vxmp2-5.png)

至此，前端基础工作准备完成。如果您想写的小程序只有前端静态页面而无需后端服务，那么可以不用继续往下看了，只需要：

- 编写静态页面的代码
- 在微信开发者工具左上角点击登录，点击右上角详情-基本信息-AppId，点击修改为您注册的小程序 ID，点击上传。
  ![vxmp2-8](https://zhang.beer/static/images/vxmp2-8.png)
  - 其中 AppID 获取方式为：进入微信小程序官网[小程序](https://mp.weixin.qq.com/)，找到开发-开发管理-开发设置，在“开发者 ID”下即可获取 AppID(小程序 ID)
- 找到管理-版本管理-开发版本，点击提交审核，待审核通过后将审核版本发布，即可完成小程序开发和发布。

### 后端

工具：IDEA

框架：SpringBoot

数据库：MySQL

#### 1.基础工作

参考之前的博客：[如何搭建自己的网站](../server/website.md)和[如何搭建自己的网站（二）](../server/website2.md)进行服务器的搭建和 jar 包的部署。

#### 2.配置服务器域名

进入微信小程序官网[小程序](https://mp.weixin.qq.com/)，找到开发-开发管理-开发设置，在“开发者 ID”下获取 AppID(小程序 ID)、AppSecret(小程序密钥)并保存下来，后续接口需要使用。继续下滑至“服务器域名”，在 request 合法域名、uploadFile 合法域名、downloadFile 合法域名中填写服务器域名，即第 1 步基础工作中部署的服务器域名。

## 编写代码

### 前端

#### 1.pinia 状态管理库

由于有很多公用的全局的属性和方法，所以将该部分内容都放在 pinia 的全局状态管理库里。

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
      circle: 1, // 第几轮
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

#### 2.注册

![vxmp2-9](https://zhang.beer/static/images/vxmp2-9.png)

#### 3.首页

![vxmp2-10](https://zhang.beer/static/images/vxmp2-10.png)

#### 4.计分

![vxmp2-11](https://zhang.beer/static/images/vxmp2-11.png)

#### 5.记录

![vxmp2-12](https://zhang.beer/static/images/vxmp2-12.png)

#### 6.详情

![vxmp2-13](https://zhang.beer/static/images/vxmp2-13.png)

### 后端

#### 1.建表

使用了两张表，一张用户表 mahjong，一张对局表 room。

![vxmp2-6](https://zhang.beer/static/images/vxmp2-6.png)

    id：用户id
    openid：用户的 openid
    avatar：用户的头像
    nickname：用户的昵称
    roomid：用户当前所在房间
    updateTime: 用户加入房间时间

![vxmp2-7](https://zhang.beer/static/images/vxmp2-7.png)

    id：对局id
    roomid：房间id
    openids：该轮对局的用户的openid
    scores：该轮对局的得分情况
    circle：轮数
    createTime：该轮对局结束时间
    active：游戏是否结束

#### 2.注册

## 最后

感兴趣的朋友可以私聊我获取详细代码。
