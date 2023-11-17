# Markdown 常用语法

## 粗体、斜体、粗斜体

1.**粗体**

```
**粗体**
__粗体__
```

2._斜体_

```
*斜体*
_斜体_
```

3.**_粗斜体_**

```
***粗斜体***
___粗斜体___
*__粗斜体__*
__*粗斜体*__
**_粗斜体_**
_**粗斜体**_
```

## 列表

- 无序列表 1
  - 无序列表 1.1
    - 无序列表 1.1.1
- 无序列表 2
- 无序列表 3

```
- 无序列表 1
  - 无序列表 1.1
    - 无序列表 1.1.1
- 无序列表 2
- 无序列表 3
```

1. 有序列表 1
   1. 有序列表 1.1
      1. 有序列表 1.1.1
2. 有序列表 2
3. 有序列表 3

```
1. 有序列表 1
   1. 有序列表 1.1
      1. 有序列表 1.1.1
2. 有序列表 2
3. 有序列表 3
```

## 引用

> 生命是一团欲望，欲望不能满足便痛苦，满足便无聊。

```
> 生命是一团欲望，欲望不能满足便痛苦，满足便无聊。
```

> 生命是一团欲望，欲望不能满足便痛苦，满足便无聊。
>
> > 人生就在痛苦和无聊之间摇摆。

```
> 生命是一团欲望，欲望不能满足便痛苦，满足便无聊。
>
> > 人生就在痛苦和无聊之间摇摆。
```

## 分割线、删除线、下划线

人间忽晚，山河已秋。

---

桃李不言，下自成蹊。

---

祸不妄至，福不徒来。

```
人间忽晚，山河已秋。

---

桃李不言，下自成蹊。

***

祸不妄至，福不徒来。
```

~~我有自由的灵魂，却没有自由的人生。~~

```
~~我有自由的灵魂，却没有自由的人生。~~
```

<u>除了生病之外，你所感受到的痛苦都是你的价值观带给你的，而非真实存在。</u>

```md
<u>除了生病之外，你所感受到的痛苦都是你的价值观带给你的，而非真实存在。</u>
```

## 链接、图片

<https://github.com/acheding>

[GitHub](https://github.com/acheding)

![图片](https://zhang.beer/static/images/MahjongScorer.jpg)

<div align="center"><img alt="图片" src="https://zhang.beer/static/images/MahjongScorer.jpg" width="430" height="430" ></div>

```md
<https://github.com/acheding>

[GitHub](https://github.com/acheding)

![图片](https://zhang.beer/static/images/MahjongScorer.jpg)

<div align="center">
  <img
    alt="图片"
    src="https://zhang.beer/static/images/MahjongScorer.jpg"
    width="430"
    height="430"
  />
</div>
```

## 表格

| 诗句                             | 作者   |
| -------------------------------- | ------ |
| 小楼一夜听春雨，深巷明朝卖杏花。 | 陆游   |
| 晚来天欲雪，能饮一杯无。         | 白居易 |

```
| 诗句 | 作者 |
| --- | --- |
| 小楼一夜听春雨，深巷明朝卖杏花。 | 陆游 |
| 晚来天欲雪，能饮一杯无。 | 白居易 |
```

| 诗句                             | 作者   |
| :------------------------------- | :----- |
| 小楼一夜听春雨，深巷明朝卖杏花。 | 陆游   |
| 晚来天欲雪，能饮一杯无。         | 白居易 |

```
| 诗句 | 作者 |
| :-- | :-- |
| 小楼一夜听春雨，深巷明朝卖杏花。 | 陆游 |
| 晚来天欲雪，能饮一杯无。 | 白居易 |
```

|                             诗句 |   作者 |
| -------------------------------: | -----: |
| 小楼一夜听春雨，深巷明朝卖杏花。 |   陆游 |
|         晚来天欲雪，能饮一杯无。 | 白居易 |

```
| 诗句 | 作者 |
| --: | --: |
| 小楼一夜听春雨，深巷明朝卖杏花。 | 陆游 |
| 晚来天欲雪，能饮一杯无。 | 白居易 |
```

|               诗句               |  作者  |
| :------------------------------: | :----: |
| 小楼一夜听春雨，深巷明朝卖杏花。 |  陆游  |
|     晚来天欲雪，能饮一杯无。     | 白居易 |

```
| 诗句 | 作者 |
| :-: | :-: |
| 小楼一夜听春雨，深巷明朝卖杏花。 | 陆游 |
| 晚来天欲雪，能饮一杯无。 | 白居易 |
```

## 代码

`app.mount("#app")`

```md
`app.mount("#app")`
```

```js
import { createApp } from "vue";
import App from "./App.vue";
import pinia from "./store";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElIcons from "@element-plus/icons-vue";
import ICON from "./components/common/icon.vue";

const app = createApp(App);
for (const name in ElIcons) {
  app.component(name, ElIcons[name]);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.component("ICON", ICON);

app.mount("#app");
```

````md
```js
import { createApp } from "vue";
import App from "./App.vue";
import pinia from "./store";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElIcons from "@element-plus/icons-vue";
import ICON from "./components/common/icon.vue";

const app = createApp(App);
for (const name in ElIcons) {
  app.component(name, ElIcons[name]);
}

app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.component("ICON", ICON);

app.mount("#app");
```
````

## 键盘

<kbd>Ctrl</kbd>+<kbd>C</kbd> AND <kbd>Ctrl</kbd>+<kbd>V</kbd>

```md
<kbd>Ctrl</kbd>+<kbd>C</kbd> AND <kbd>Ctrl</kbd>+<kbd>V</kbd>
```

## [VuePress 关于 MarkDown 的拓展](https://vuepress.vuejs.org/zh/guide/markdown.html)

### 内部链接

网站内部的链接，将会被转换成 `<router-link>` 用于 SPA 导航。同时，站内的每一个文件夹下的 `README.md` 或者 `index.md` 文件都会被自动编译为 `index.html`，对应的链接将被视为 `/`。

以如下的文件结构为例：

```
.
├─ README.md
├─ foo
│ ├─ README.md
│ ├─ one.md
│ └─ two.md
└─ bar
├─ README.md
├─ three.md
└─ four.md
```

假设你现在在 `foo/one.md` 中：

```md
[Home](/) <!-- 跳转到根部的 README.md -->
[foo](/foo/) <!-- 跳转到 foo 文件夹的 index.html -->
[foo heading](./#heading) <!-- 跳转到 foo/index.html 的特定标题位置 -->
[bar - three](../bar/three.md) <!-- 具体文件可以使用 .md 结尾（推荐） -->
[bar - four](../bar/four.html) <!-- 也可以用 .html -->
```

### Emoji

输入

```
:tada: :100:
```

输出

🎉 💯

你可以在[这个列表](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)找到所有可用的 Emoji。

### 目录

输入

```
[[toc]]
```

输出

[[toc]]

目录（Table of Contents）的渲染可以通过 `markdown.toc` 选项来配置。

### 自定义容器(默认主题)

输入

```
::: tip
这是一个提示
:::

::: warning
这是一个警告
:::

::: danger
这是一个危险警告
:::

::: details
这是一个详情块，在 IE / Edge 中不生效
:::
```

输出

::: tip
这是一个提示
:::

::: warning
这是一个警告
:::

::: danger
这是一个危险警告
:::

::: details
这是一个详情块，在 IE / Edge 中不生效
:::

你也可以自定义块中的标题：

````md
::: danger STOP
危险区域，禁止通行
:::

::: details 点击查看代码

```js
console.log("你好，VuePress！");
```

:::
````

### 代码块中的行高亮

输入

````
``` js {4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

输出

```js {4}
export default {
  data() {
    return {
      msg: "Highlighted!",
    };
  },
};
```

除了单行以外，你也可指定多行，行数区间，或是两者都指定。

- 行数区间: 例如 {5-8}, {3-10}, {10-17}
- 多个单行: 例如 {4,7,9}
- 行数区间与多个单行: 例如 {4,7-13,16,23-27,40}

### 行号

你可以通过配置来为每个代码块显示行号：

```js
module.exports = {
  markdown: {
    lineNumbers: true,
  },
};
```
