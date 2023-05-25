# qiankun 微前端介绍及实现

::: tip 官网
<https://qiankun.umijs.org/zh/guide>
:::

## qiankun 的核心设计理念

- 🥄 简单

由于主应用微应用都能做到技术栈无关，qiankun 对于用户而言只是一个类似 jQuery 的库，你需要调用几个 qiankun 的 API 即可完成应用的微前端改造。同时由于 qiankun 的 HTML entry 及沙箱的设计，使得微应用的接入像使用 iframe 一样简单。

- 🍡 解耦/技术栈无关

微前端的核心目标是将巨石应用拆解成若干可以自治的松耦合微应用，而 qiankun 的诸多设计均是秉持这一原则，如 HTML entry、沙箱、应用间通信等。这样才能确保微应用真正具备 独立开发、独立运行 的能力。

## 为什么不是 iframe

为什么不用 iframe，这几乎是所有微前端方案第一个会被 challenge 的问题。但是大部分微前端方案又不约而同放弃了 iframe 方案，自然是有原因的，并不是为了 "炫技" 或者刻意追求 "特立独行"。

如果不考虑体验问题，iframe 几乎是最完美的微前端解决方案了。

iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。但他的最大问题也在于他的隔离性无法被突破，导致应用间上下文无法被共享，随之带来的开发体验、产品体验的问题。

1. url 不同步。浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用。
2. UI 不同步，DOM 结构不共享。想象一下屏幕右下角 1/4 的 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，还要浏览器 resize 时自动居中..
3. 全局上下文完全隔离，内存变量不共享。iframe 内外系统的通信、数据同步等需求，主应用的 cookie 要透传到根域名都不同的子应用中实现免登效果。
4. 慢。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。

其中有的问题比较好解决(问题 1)，有的问题我们可以睁一只眼闭一只眼(问题 4)，但有的问题我们则很难解决(问题 3)甚至无法解决(问题 2)，而这些无法解决的问题恰恰又会给产品带来非常严重的体验问题， 最终导致我们舍弃了 iframe 方案。

## 特性

- 📦 基于 single-spa 封装，提供了更加开箱即用的 API。
- 📱 技术栈无关，任意技术栈的应用均可 使用/接入，不论是 React/Vue/Angular/JQuery 还是其他等框架。
- 💪 HTML Entry 接入方式，让你接入微应用像使用 iframe 一样简单。
- 🛡​ 样式隔离，确保微应用之间样式互相不干扰。
- 🧳 JS 沙箱，确保微应用之间 全局变量/事件 不冲突。
- ⚡️ 资源预加载，在浏览器空闲时间预加载未打开的微应用资源，加速微应用打开速度。
- 🔌 umi 插件，提供了 @umijs/plugin-qiankun 供 umi 应用一键切换成微前端架构系统。

## qiankun 实现

![qiankun](https://zhang.beer/static/images/qiankun.gif)

### 主应用

1.安装 qiankun

只需在主应用安装即可，微应用无需安装。

```
yarn add qiankun
```

2.注册微应用(main.js)

```js
import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { registerMicroApps, start } from "qiankun";

Vue.config.productionTip = false;
Vue.use(ElementUI);

registerMicroApps([
  // 注册应用
  {
    name: "micro", // 微应用的名称
    entry: "//localhost:8087", // 微应用的地址
    container: "#micro-one", // 放置微应用的容器
    activeRule: "/vue", // 匹配逻辑
    props: { data: store.state }, // 向微应用传递的值
  },
]);
start(); // 启动

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
```

当微应用信息注册完之后，一旦浏览器的 url 发生变化，便会自动触发 qiankun 的匹配逻辑，所有 activeRule 规则匹配上的微应用就会被插入到指定的 container 中，同时依次调用微应用暴露出的生命周期钩子。

3.设置主应用路由(router/index.js)

```js
const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
];

const router = new Router({
  mode: "history", // 设置路由模式为 history
  routes,
});
```

4.导航菜单(App.vue)

```vue
<template>
  <div id="app">
    <el-menu :router="true" mode="horizontal" default-active="/">
      <!-- 点击不同的菜单，跳转到对应的路由 -->
      <el-menu-item index="/">主应用</el-menu-item>
      <!-- 此处的"/vue"与注册微应用时的匹配逻辑相对应 -->
      <el-menu-item index="/vue">微应用</el-menu-item>
    </el-menu>
    <router-view />
    <!-- 定义存放微应用的容器 -->
    <div id="micro-one"></div>
  </div>
</template>
```

5.定义 store (store/index.js)

用于存放传递的数据。

```js
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mainData: {},
  },
  mutations: {
    saveMain(state, data) {
      state.mainData = data;
    },
  },
});
```

6.主应用内容(views/main.vue)

```js
methods: {
  emitMain() {
    this.$store.commit("saveMain", this.input); // 点击按钮向 store 中存入input的值
  }
}
```

### 微应用

1.修改端口号与注册微应用时对应(config/index.js)

```js
dev: {
    host: 'localhost',
    port: 8087,
},
```

2.开启应用间的跨域访问(webpack.dev.conf.js)

```js
devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*" // 开启应用间的跨域访问
    }
},
```

3.打包工具增加配置(webpack.base.conf.js)

```js
output: {
    library: "micro",
    libraryTarget: "umd",
},
```

4.定义 store ，同主应用

5.导出相应的生命周期钩子(main.js)

微应用需要在自己的入口 js (通常就是你配置的 webpack 的 entry js) 导出 bootstrap、mount、unmount 三个生命周期钩子，以供主应用在适当的时机调用。

```js
import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

let instance = null;
function render(props = {}) {
  if (props.data) {
    // 将主应用传递的值存放至 store 中
    store.commit("saveMain", props.data.mainData);
  }
  const { container } = props;
  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector("#app") : "#app");
  // 解决微应用的根 id 与其他 DOM 冲突：修改根 id 的查找范围
}

if (!window.__POWERED_BY_QIANKUN__) {
  // 如果是独立运行，则手动调用渲染
  render();
}
if (window.__POWERED_BY_QIANKUN__) {
  // 如果是 qiankun 使用到了，则会动态注入路径
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// 根据 qiankun 的协议需要导出 bootstrap/mount/unmount
export async function bootstrap(props) {
  console.log("micro bootstraped");
}
export async function mount(props) {
  render(props);
  console.log("micro mounted");
}
export async function unmount(props) {
  instance.$destroy();
  console.log("micro unmounted");
}
```

6.设置微应用路由(router/index.js)

```js
const routes = [
  {
    path: "/",
    name: "micro",
    component: Micro,
  },
];

const router = new Router({
  mode: "history",
  base: "/vue", // 此处的"/vue"与注册微应用时的匹配逻辑相对应
  routes,
});
```

7.微应用内容(views/micro.js)

```js
mounted() {
  this.mainData = this.$store.state.mainData; // 取出 store 中存放的来自主应用的值
}
```

::: tip 提示
最后，同时运行主应用和微应用。
:::
