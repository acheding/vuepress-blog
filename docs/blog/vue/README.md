# 介绍

这里主要介绍 Vue 相关。

包括 Vue2 和 Vue3。

## 什么是 Vue

Vue (发音为 /vjuː/，类似 view) 是一款用于构建用户界面的 JavaScript 框架。它基于标准 HTML、CSS 和 JavaScript 构建，并提供了一套声明式的、组件化的编程模型，帮助你高效地开发用户界面。无论是简单还是复杂的界面，Vue 都可以胜任。

## 核心功能

- 声明式渲染：Vue 基于标准 HTML 拓展了一套模板语法，使得我们可以声明式地描述最终输出的 HTML 和 JavaScript 状态之间的关系。

- 响应性：Vue 会自动跟踪 JavaScript 状态并在其发生变化时响应式地更新 DOM。

## Vue2 和 Vue3 区别

### 双向绑定

Vue2 的双向数据绑定是利⽤ ES5 的⼀个 API ，Object.defineProperty()对数据进⾏劫持 结合 发布订阅模式的⽅式来实现的。'

Vue3 中使⽤了 ES6 的 ProxyAPI 对数据代理，通过 reactive() 函数给每⼀个对象都包⼀层 Proxy，通过 Proxy 监听属性的变化，从⽽ 实现对数据的监控。

这⾥是相⽐于 vue2 版本，使⽤ proxy 的优势如下：

1.defineProperty 只能监听某个属性，不能对全对象监听 可以省去 for in、闭包等内容来提升效率（直接绑定整个对象即可）

2.可以监听数组，不⽤再去单独的对数组做特异性操作,通过 Proxy 可以直接拦截所有对象类型数据的操作，完美⽀持对数组的监听。

::: warning TODO
更新中
:::
