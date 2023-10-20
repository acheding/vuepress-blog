# 如何使用 GoGoCode 一键 Vue2 转换 Vue3

## 前言

从今年年初开始，项目开始升级优化，将之前的 Vue2 旧版本整体升级到 Vue3 版本。在重写了几个 Vue 文件后，我发现做的都是一些机械性的工作，效率低且重复性大。于是就试着搜索了一下有没有什么能够批量转换代码格式的工具，发现了阿里的这个基于 AST 的 JavaScript/Typescript/HTML 代码转换工具——GoGoCode。

时间已经过去大半年了，写篇博客记录一下，希望能帮到有需要的朋友。

![gogocode-2](https://zhang.beer/static/images/gogocode-2.png)

[官网](https://gogocode.io/zh)上关于 Vue2 升级 Vue3 大抵有两种方案。第一种介绍了一套 Vue2 升级工具，利用这套工具能够快速地把 Vue2 代码升级到 Vue3。但是过程较为繁琐，出现错误的可能性较大，网上也没有什么详细介绍和成功案例，最主要是我没有成功的运行。第二种则就是普通的转换，利用自己编写的转换规则按部就班转换。所以我选择了第二种，灵活性较大，可以根据各个项目的特点按需要编写转换规则，然后规规矩矩逐个文件代码转换，转换完成之后对比有无错误语法，再运行测试是否有缺陷，比较直观。

## 安装插件

在 VSCode 拓展中搜索 GoGoCode 并安装即可。

在安装完成之后，就可以在需要转换的 Vue2 文件上点击鼠标右键，选择“用 GoGoCode 转换”，即可打开“GoGoCode PlayGround”。

可以看到四块内容，左上方显示的是源码，右上方为可以编辑的转换规则，下方的两块内容则是转换前后代码的对比。

## 操作过程

### 构造实例

调用 $(code, options) 即可将一段代码或一个 ast 节点构造为 GoGoCode 的核心 AST 实例。

其中 code 为需要被实例化的代码或 AST 节点，options 为一个对象，包括 parseOptions、astFragment、isProgram。

| 入参    |              | 说明                                                                                           | 类型                 | 举例                                                               |
| :------ | :----------- | :--------------------------------------------------------------------------------------------- | :------------------- | :----------------------------------------------------------------- |
| code    |              | 需要被实例化的代码或 AST 节点                                                                  | string NodePath Node | 'var a = 1'                                                        |
| options | parseOptions | 解析 js 时，它与 babel/parse 的 options 完全一致<br>解析 html、vue 时需要传入 language         | object               | { plugins: ['jsx'] }<br>{ language: 'html' }<br>{language: 'vue' } |
|         | astFragment  | 需要插入到代码中的 ast 节点                                                                    | Node                 | { content: astNode }                                               |
|         | isProgram    | 是否需要返回完整 ast js 的完整 ast<br>最外层节点是 File 类型<br>html 完整 ast 是 document 类型 | Boolean              | 默认为 true                                                        |

因此，我们可以这样写将 vue2 文件中的代码构造为 AST 实例。

```js
const ast = $(source, { parseOptions: { language: "vue" } });
```

### 获取节点

所有的节点获取操作都会返回一个新的 AST 实例。

#### ast.find

在把代码从字符串解析成 AST 后，我们进入第二步，从一整段代码中精确查找到我们要修改的 AST 节点。

GoGoCode 提供了直观的「用代码找代码」的方式，和 jQuery 查找 DOM 一样，你只需要编写一段代码片段作为「代码选择器」，GoGoCode 就能智能地帮你匹配到源码中和它吻合的片段。

例如我们使用<kbd>.find()</kbd>方法，分别查找 template 和 script 各作为一个整体 ，方便后续操作。

最后用 generate 把节点输出成代码字符串。

```js
function transform(fileInfo, api, options) {
  const $ = api.gogocode;
  const source = fileInfo.source;
  const ast = $(source, { parseOptions: { language: "vue" } });

  const template = ast.find("<template></template>");
  const script = ast.find("<script></script>");

  return ast.generate();
}
```

### 操作节点

将获取到的节点通过编写的规则转换，将是我们的第三步。不过在此之前，我们需要了解一下通配符和<kbd>.replace()</kbd>方法。

#### $_$ 通配符

假设你想在下面代码中挑选出对于变量 a 的声明和初始化语句：

```js
const a = 123;
```

按照之前介绍的，我们只要像下面这么写就可以了：

```js
const aDef = ast.find("const a = 123");
```

但这只能匹配到 const a = 123，对于 const a = 456 就无能为力了，在实际的代码匹配中，我们往往不确定代码的全貌，这时候 GoGoCode 支持使用通配符来做模糊匹配：

```js
const aDef = ast.find("const a = $_$0");
```

有时我们不止需要一个通配符，你可以在代码选择器中书写 $_$0、$_$1、$_$2、$\_$3……达到你的目的。

#### $$$ 通配符

假设有下面的代码：

```js
console.log(a);

console.log(a, b);

console.log(a, b, c);
```

按照之前的写法，我们可以用以下几种选择选择器进行查找。

```js
ast.find(`console.log()`);
ast.find(`console.log($_$0)`);
// 上面两条语句会找到全部三行代码

ast.find(`console.log($_$0, $_$1)`);
// 这条语句会找到前两行代码

ast.find(`console.log($_$0, $_$1, $_$2)`);
// 这条语句只会找到第三行代码
```

可以看出 GoGoCode 的通配符匹配的原则：写得越多，查询限制越大。

如果你想匹配任意数量的同类型节点，GoGoCode 提供了 $$$ 形式的通配符，对于上面不定参数的语句，你可以统一使用 <kbd>ast.find('console.log($$$0)')</kbd> 来匹配。

#### ast.replace

日常我们在编辑器中批量修改代码的时候也会经常使用到「查找\替换」的功能去做一些基本操作，但它们都基于字符串或正则表达式，对于不同的缩进、换行乃至加不加分号都无法兼容，而利用 GoGoCode 的代码选择器特性配合 replace 方法，可以让你以接近字符串替换的形式完成 AST 级别的代码替换操作。

```js
function log(a) {
  console.log(a);
}

function alert(a) {
  alert(a);
}
```

如果我们想给 log 函数改名成 record，用 replace 做非常简单：

```js
ast.replace("function log($$$0) { $$$1 }", "function record($$$0) { $$$1 }");
```

---

现在，我们就可以开始编写规则了。目的是将 vue2 中的语法规则升级为 Vue3 的语法规则，同时将 ui 组件库 element-ui 升级为 element-plus，主要分为以下几部分。

1.插槽。Vue3 中需要在外面包裹上一层 tempplate，写法也由内层的 slot="xxx" 变为外层的 #xxx。

```js
template.replace(
  '<$_$ slot="filter" $$$0>$$$1</$_$>',
  "<template #filter><$_$ $$$0>$$$1</$_$></template>"
);

template.replace(
  '<el-dropdown-menu slot="dropdown" $$$0>$$$1</el-dropdown-menu>',
  "<template #dropdown><el-dropdown-menu $$$0>$$$1</el-dropdown-menu></template>"
);
```

2. el-button type="text" 需要转换为 el-button type="primary" link。

```js
template.replace(
  '<el-button type="text" $$$0>$$$1</el-button>',
  '<el-button type="primary" link $$$0>$$$1</el-button>'
);
```

3.去掉 export default{}。

```js
script.replace("export default {$$$}", "$$$");
```

4.去掉 components、mixins。

```js
script.replace("components:{}", "").replace("mixins:[]", "");
```

5.去掉 props，并将里面的'props:{xxx}'的形式转换为'const props=defineProps({xxx})'的形式。

```js
script.replace("props:{$$$}", "const props=defineProps({$$$})");
```

6.去掉 data、return，并将里面'xxx:yyy'的形式转换为'let xxx=$ref(yyy)'的形式。

```js
script.find("return {}").replace("$_$:$_$", "let $_$=$ref($_$)");
```

7.去掉 conputed，并将里面'xxx(){}'的形式转换为'const xxx=computed(()=>{})'的形式。

```js
script
  .find("computed:{}")
  .replace("$_$(){$$$}", "const $_$=computed(()=>{$$$})");
```

8.去掉 watch，由于 watch 有多种写法：有无 deep、有无 handler，所以这里按顺序都走了一遍。

```js
script
  .find("watch:{}")
  .replace("$_$:{handler($_$){$$$}}", "watch(()=>$_$,($_$)=>{$$$})")
  .replace("$_$:{handler(){$$$}}", "watch(()=>$_$,()=>{$$$})")
  .replace(
    "'$_$':{handler($_$){$$$},deep:true}",
    "watch(()=>$_$,($_$)=>{$$$},{deep:true})"
  )
  .replace("'$_$':{handler($_$){$$$}}", "watch(()=>$_$,($_$)=>{$$$})")
  .replace("$_$($_$){$$$}", "watch(()=>$_$,($_$)=>{$$$})")
  .replace("$_$(){$$$}", "watch(()=>$_$,()=>{$$$})")
  .replace("watch:{$$$}", "$$$");
```

9.去掉 filters，两种写法都走一遍。

```js
script
  .find("filters:{}")
  .replace("$_$:function($_$){$$$}", "const $_$=computed(($_$)=>{$$$})")
  .replace("$_$($_$){$$$}", "const $_$=computed(($_$)=>{$$$})")
  .replace("filters:{$$$}", "$$$");
```

10.去掉 methods，同样有多种可能存在的形式：有无 async、有无参数，按顺序都走一遍。

```js
script
  .find("methods:{}")
  .replace("async $_$($$$0){$$$1}", "const $_$=async($$$0)=>{$$$1}")
  .replace("$_$($$$0){$$$1}", "const $_$=($$$0)=>{$$$1}")
  .replace("async $_$(){$$$}", "const $_$=async()=>{$$$}")
  .replace("$_$(){$$$}", "const $_$=()=>{$$$}")
  .replace("methods:{$$$}", "$$$");
```

10.生命周期的改变。

```js
script
  .replace("created(){$$$}", "onBeforeMount(()=>{$$$})")
  .replace("mounted(){$$$}", "onMounted(()=>{$$$})")
  .replace("beforeUnmount(){$$$}", "onBeforeUnmount(()=>{$$$})")
  .replace("unmounted(){$$$}", "onUnmounted(()=>{$$$})")
  .replace("beforeDestroy(){$$$}", "onBeforeUnmount(()=>{$$$})")
  .replace("destoryed(){$$$}", "onUnmounted(()=>{$$$})");
```

### 成果展示

![gogocode](https://zhang.beer/static/images/gogocode.gif)
