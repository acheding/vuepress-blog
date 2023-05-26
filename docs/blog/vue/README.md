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

Vue2 的双向数据绑定是利⽤ ES5 的⼀个 API ，Object.defineProperty()对数据进⾏劫持，结合发布订阅模式的⽅式来实现的。

Vue3 中使⽤了 ES6 的 ProxyAPI 对数据代理，通过 reactive() 函数给每⼀个对象都包⼀层 Proxy，通过 Proxy 监听属性的变化，从⽽实现对数据的监控。

## 生命周期

| Vue2          | Vue3            |
| :------------ | :-------------- |
| beforeCreate  | setup()         |
| created       | setup()         |
| beforeMount   | onBeforeMount   |
| mounted       | onMounted       |
| beforeUpdate  | onBeforeUpdate  |
| updated       | onUpdated       |
| beforeDestroy | onBeforeUnmount |
| destroyed     | onUnmounted     |
| errorCaptured | onErrorCaptured |

除此之外，Vue3 还新增了 onActivated、onDeactivated 等新的生命周期钩子函数。

## 选项式 API（Options API）与组合式 API（Composition API）

## Vue3 支持碎片（Fragments）

::: warning TODO
更新中
:::
