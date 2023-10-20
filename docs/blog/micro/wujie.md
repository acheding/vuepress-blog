# wujie 微前端实现及三种通信方式介绍

::: tip 官网
<https://wujie-micro.github.io/doc/>
:::

## 对比

### iframe

采用 iframe 的方案确实可以做到，而且优点非常明显。

> 优点
>
> - 非常简单，使用没有任何心智负担
> - web 应用隔离的非常完美，无论是 js、css、dom 都完全隔离开来

由于其隔离的太完美导致缺点也非常明显

> 缺点
>
> - 路由状态丢失，刷新一下，iframe 的 url 状态就丢失了
> - dom 割裂严重，弹窗只能在 iframe 内部展示，无法覆盖全局
> - web 应用之间通信非常困难
> - 每次打开白屏时间太长，对于 SPA 应用来说无法接受

### single-spa 方案

single-spa 是一个目前主流的微前端技术方案，其主要实现思路：

- 预先注册子应用(激活路由、子应用资源、生命周期函数)
- 监听路由的变化，匹配到了激活的路由则加载子应用资源，顺序调用生命周期函数并最终渲染到容器

乾坤微前端架构则进一步对 single-spa 方案进行完善，主要的完善点：

- 子应用资源由 js 列表修改进为一个 url，大大减轻注册子应用的复杂度
- 实现应用隔离，完成 js 隔离方案 （window 工厂） 和 css 隔离方案 （类 vue 的 scoped）
- 增加资源预加载能力，预先子应用 html、js、css 资源缓存下来，加快子应用的打开速度

总结一下方案的优缺点：

> 优点
>
> - 监听路由自动的加载、卸载当前路由对应的子应用
> - 完备的沙箱方案，js 沙箱做了 SnapshotSandbox、LegacySandbox、ProxySandbox 三套渐进增强方案，css 沙箱做了两套 strictStyleIsolation、experimentalStyleIsolation 两套适用不同场景的方案
> - 路由保持，浏览器刷新、前进、后退，都可以作用到子应用
> - 应用间通信简单，全局注入

> 缺点
>
> - 基于路由匹配，无法同时激活多个子应用，也不支持子应用保活
> - 改造成本较大，从 webpack、代码、路由等等都要做一系列的适配
> - css 沙箱无法绝对的隔离，js 沙箱在某些场景下执行性能下降严重
> - 无法支持 vite 等 ESM 脚本运行

### 无界方案

#### 应用加载机制和 js 沙箱机制

将子应用的 js 注入主应用同域的 iframe 中运行，iframe 是一个原生的 window 沙箱，内部有完整的 history 和 location 接口，子应用实例 instance 运行在 iframe 中，路由也彻底和主应用解耦，可以直接在业务组件里面启动应用。

采用这种方式我们可以获得

> - 组件方式来使用微前端：不用注册，不用改造路由，直接使用无界组件，化繁为简
> - 一个页面可以同时激活多个子应用：子应用采用 iframe 的路由，不用关心路由占用的问题
> - 天然 js 沙箱，不会污染主应用环境：不用修改主应用 window 任何属性，只在 iframe 内部进行修改
> - 应用切换没有清理成本：由于不污染主应用，子应用销毁也无需做任何清理工作

#### 路由同步机制

在 iframe 内部进行 history.pushState，浏览器会自动的在 joint session history 中添加 iframe 的 session-history，浏览器的前进、后退在不做任何处理的情况就可以直接作用于子应用

劫持 iframe 的 history.pushState 和 history.replaceState，就可以将子应用的 url 同步到主应用的 query 参数上，当刷新浏览器初始化 iframe 时，读回子应用的 url 并使用 iframe 的 history.replaceState 进行同步

采用这种方式我们可以获得

> - 浏览器刷新、前进、后退都可以作用到子应用
> - 实现成本低，无需复杂的监听来处理同步问题
> - 多应用同时激活时也能保持路由同步

#### iframe 连接机制和 css 沙箱机制

无界采用 webcomponent 来实现页面的样式隔离，无界会创建一个 wujie 自定义元素，然后将子应用的完整结构渲染在内部

子应用的实例 instance 在 iframe 内运行，dom 在主应用容器下的 webcomponent 内，通过代理 iframe 的 document 到 webcomponent，可以实现两者的互联。

将 document 的查询类接口：getElementsByTagName、getElementsByClassName、getElementsByName、getElementById、querySelector、querySelectorAll、head、body 全部代理到 webcomponent，这样 instance 和 webcomponent 就精准的链接起来。

当子应用发生切换，iframe 保留下来，子应用的容器可能销毁，但 webcomponent 依然可以选择保留，这样等应用切换回来将 webcomponent 再挂载回容器上，子应用可以获得类似 vue 的 keep-alive 的能力.

采用这种方式我们可以获得

> - 天然 css 沙箱
>
>   直接物理隔离，样式隔离子应用不用做任何修改
>
> - 天然适配弹窗问题
>
>   document.body 的 appendChild 或者 insertBefore 会代理直接插入到 webcomponent，子应用不用做任何改造
>
> - 子应用保活
>
>   子应用保留 iframe 和 webcomponent，应用内部的 state 不会丢失
>
> - 完整的 DOM 结构
>
>   webcomponent 保留了子应用完整的 html 结构，样式和结构完全对应，子应用不用做任何修改

#### 通信机制

承载子应用的 iframe 和主应用是同域的，所以主、子应用天然就可以很好的进行通信，在无界我们提供三种通信方式

- props 注入机制
  子应用通过$wujie.props 可以轻松拿到主应用注入的数据

- window.parent 通信机制
  子应用 iframe 沙箱和主应用同源，子应用可以直接通过 window.parent 和主应用通信

- 去中心化的通信机制
  无界提供了 EventBus 实例，注入到主应用和子应用，所有的应用可以去中心化的进行通信

#### 优势

通过上面原理的阐述，我们可以得出无界微前端框架的几点优势：

> - 多应用同时激活在线
>
> 框架具备同时激活多应用，并保持这些应用路由同步的能力
>
> - 组件式的使用方式
>
>   无需注册，更无需路由适配，在组件内使用，跟随组件装载、卸载
>
> - 应用级别的 keep-alive
>
>   子应用开启保活模式后，应用发生切换时整个子应用的状态可以保存下来不丢失，结合预执行模式可以获得类似 ssr 的打开体验
>
> - 纯净无污染
>   - 无界利用 iframe 和 webcomponent 来搭建天然的 js 隔离沙箱和 css 隔离沙箱
>   - 利用 iframe 的 history 和主应用的 history 在同一个 top-level browsing context 来搭建天然的路由同步机制
>   - 副作用局限在沙箱内部，子应用切换无需任何清理工作，没有额外的切换成本
>     性能和体积兼具
>   - 子应用执行性能和原生一致，子应用实例 instance 运行在 iframe 的 window 上下文中，避免 with(proxyWindow){code}这样指定代码执行上下文导致的性能下降，但是多了实例化 iframe 的一次性的开销，可以通过 preload 提前实例化
>   - 体积比较轻量，借助 iframe 和 webcomponent 来实现沙箱，有效的减小了代码量
> - 开箱即用
>
>   不管是样式的兼容、路由的处理、弹窗的处理、热更新的加载，子应用完成接入即可开箱即用无需额外处理，应用接入成本也极低

## 实现

![wujie](https://zhang.beer/static/images/wujie.gif)

这里主应用使用了 vue3+vite，子应用使用了 vue2+webpack。

![wujie-code](https://zhang.beer/static/images/wujie-code.png)

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
