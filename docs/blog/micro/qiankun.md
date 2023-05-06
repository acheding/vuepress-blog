# qiankun 微前端介绍及实现

## 一、什么是微前端

微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

## 二、核心价值

1.技术栈无关：主框架不限制接入应用的技术栈，微应用具备完全自主权。

2.独立开发、独立部署：微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新。

3.增量升级：在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略。

4.独立运行时：每个微应用之间状态隔离，运行时状态不共享。

## 三、意义

微前端架构旨在解决单体应用在一个相对长的时间跨度下，由于参与的人员、团队的增多、变迁，从一个普通应用演变成一个巨石应用(Frontend Monolith)后，随之而来的应用不可维护的问题。这类问题在企业级 Web 应用中尤其常见。

## 四、qiankun 实现

![qiankun](https://zhang.beer:9999/ache/beer/blog/qiankun.gif)

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

### 最后

同时运行主应用和微应用。

qiankun 官网：<https://qiankun.umijs.org/zh/guide>
