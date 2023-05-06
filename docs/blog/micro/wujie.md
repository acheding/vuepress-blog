# wujie 微前端实现及三种通信方式介绍

![wujie](https://zhang.beer:9999/ache/beer/blog/wujie.gif)

## 对比

之前介绍过前段时间比较流行的微前端框架 qiankun，虽然实现了微前端的理念，但是也暴露出很多缺点，比如官网上讲到的四点：

- 基于路由匹配，无法同时激活多个子应用，也不支持子应用保活
- 改造成本较大，从 webpack、代码、路由等等都要做一系列的适配
- css 沙箱无法绝对的隔离，js 沙箱在某些场景下执行性能下降严重
- 无法支持 vite 等 ESM 脚本运行

而 wujie 利用 iframe 来实现 js 沙箱能力，有效的解决了上述问题：

- 组件方式来使用微前端：不用注册，不用改造路由，直接使用无界组件，化繁为简
- 一个页面可以同时激活多个子应用：子应用采用 iframe 的路由，不用关心路由占用的问题
- 天然 js 沙箱，不会污染主应用环境：不用修改主应用 window 任何属性，只在 iframe 内部进行修改
- 应用切换没有清理成本：由于不污染主应用，子应用销毁也无需做任何清理工作

## 实现

这里主应用使用了 vue3+vite，子应用使用了 vue2+webpack。

![wujie-code](https://zhang.beer:9999/ache/beer/blog/wujie-code.png)

1.主应用下载依赖(package.json)

```
yarn add wujie-vue3
```

2.主应用注册依赖(main.js)

```js
import WujieVue from "wujie-vue3";
app.use(WujieVue);
```

3.主应用使用 wujie 组件(main.vue)

```vue
<WujieVue name="micro" url="http://localhost:8087"></WujieVue>
```

4.子应用修改跨域(webpack.dev.conf.js)

同 qiankun。如果没有产生跨域，子应用甚至无需修改。

```js
devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*" // 开启应用间的跨域访问

    },

}
```

这样便实现了 wujie 微前端的静态使用，那如何进行主子应用之间数据通信呢？

## 通信方式

先看一下主应用和子应用的代码。

### 主应用

```vue
<script setup>
import { ElMessage } from "element-plus";
import { ref } from "vue";
import wujie from "wujie-vue3";
const input = ref("");
const emitInput = () => wujie.bus.$emit("input", input.value);
const propsMethod = () => {
  ElMessage.success("执行主应用方法成功");
  console.log(
    1111111,
    window.document.querySelector("iframe[name=micro]").contentWindow
      .globalMicroValue
  );
};
wujie.bus.$on("microEmit", (val) => (input.value = val));
window.globalMainValue = "我是主应用全局变量";
</script>

<template>
  <div class="container">
    <h1>main-vue3</h1>
    <el-input v-model="input" size="large" v-on:keyup.enter="emitInput">
      <template #append>
        <el-button @click="emitInput" icon="Promotion"> </el-button>
      </template>
    </el-input>
  </div>
  <div class="container">
    <h1>micro-vue2</h1>
    <WujieVue
      name="micro"
      url="http://localhost:8087"
      :props="{ data: 'propsdata', method: { propsMethod } }"
    >
    </WujieVue>
  </div>
</template>
```

### 子应用

```vue
<template>
  <div class="container">
    <h1>{{ data === "" ? "hi" : data }}</h1>
    <el-button @click="doPropsData">获取父应用通过props传递的值</el-button>
    <el-button @click="doPropsMethod">执行父应用通过props传递的方法</el-button>
    <el-button @click="microEmit">向父应用传值</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: "",
    };
  },
  mounted() {
    window.$wujie.bus.$on("input", (val) => (this.data = val));
    window.globalMicroValue = "我是子应用全局变量";
    console.log(2222222, window.parent.globalMainValue);
  },
  // beforeDestroy ()
  // {
  //   window.$wujie.bus.$off('input')
  // },
  methods: {
    doPropsMethod() {
      window.$wujie.props.method.propsMethod();
    },
    doPropsData() {
      this.data = window.$wujie.props.data;
    },
    microEmit() {
      window.$wujie.bus.$emit("microEmit", "micro data");
    },
  },
};
</script>
```

1.props

通过 props 的方式，主应用既可以向子应用传递主应用的参数，还可以传递主应用的方法。

主应用在 WuJieVue 组件中使用，有点类似于 vue 的 props。具体代码如下：

```vue
<WujieVue
  name="micro"
  url="http://localhost:8087"
  :props="{ data: 'propsdata', method: { propsMethod } }"
>
</WujieVue>
```

子应用则通过如下方式接收：

```js
window.$wujie.props.data;
```

```js
window.$wujie.props.method.propsMethod();
```

2.window

主应用和子应用都可以通过挂载在 window 上定义全局变量的方式相互使用。

主应用定义全局变量：

```js
window.globalMainValue = "我是主应用全局变量";
```

子应用定义全局变量：

```js
window.globalMicroValue = "我是子应用全局变量";
```

主应用使用子应用全局变量，其中 name 为 WuJieVue 中定义的子应用名称：

```js
window.document.querySelector("iframe[name=micro]").contentWindow
  .globalMicroValue;
```

子应用使用主应用全局变量：

```js
window.parent.globalMainValue;
```

3.eventBus

bus 为 wujie 提供的一种去中心化的通信方式，即每个应用都是一个主体，主应用与子应用处于平等地位，主应用和子应用、子应用和子应用都可以通过这种方式方便的进行通信。包括监听、发送、取消监听三种。

```js
// 主应用监听事件
bus.$on("事件名字", function (arg1, arg2, ...) {});
// 主应用发送事件
bus.$emit("事件名字", arg1, arg2, ...);
// 主应用取消事件监听
bus.$off("事件名字", function (arg1, arg2, ...) {});
```

```js
// 子应用监听事件
window.$wujie?.bus.$on("事件名字", function (arg1, arg2, ...) {});
// 子应用发送事件
window.$wujie?.bus.$emit("事件名字", arg1, arg2, ...);
// 子应用取消事件监听
window.$wujie?.bus.$off("事件名字", function (arg1, arg2, ...) {});
```

## 子应用独立运行

如果不想让子应用单独运行，可以改造一下子应用的 main.js 文件，通过全局变量 window.**POWERED_BY_WUJIE**判断该子应用是否是由主应用通过 wujie 启动，如果是，就执行 wujie 子应用的生命周期函数，完成挂载和销毁，如果不是，就不做任何操作，即可避免子应用可以单独打开的情况。

```js
import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(ElementUI);

// new Vue({
//   router,
//   store,
//   render: (h) => h(App),
// }).$mount("#app");

if (window.__POWERED_BY_WUJIE__) {
  let instance;
  window.__WUJIE_MOUNT = () => {
    instance = new Vue({ router, store, render: (h) => h(App) }).$mount("#app");
  };
  window.__WUJIE_UNMOUNT = () => {
    instance.$destroy();
  };
} else {
  // new Vue({ router, store, render: (h) => h(App) }).$mount("#app");
}
```
