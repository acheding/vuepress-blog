# Vite+Vue3 加载速度优化

可以考虑从以下几个方面优化。

## 静态资源拆分打包

在常规打包方法下，所有的第三方依赖将会都打包在一个 vendor.js 文件里，首次打开页面时，服务器会先加载这个大文件，导致白屏时间过长。

而我们打包时，事先将依赖拆分成很多小文件各自进行打包，便可以实现异步加载，大大降低加载时长，提升加载效率，减少白屏时间。具体操作如下：

```js
export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000, // 单个模块文件大小限制1000KB
    terserOptions: {
      // 清除代码中console和debugger
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 静态资源拆分
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
```

## nginx 开启 gzip 压缩

gzip 压缩分两种，一种是服务器压缩后传输给浏览器，但是这种方案是请求时服务器实时压缩，比较消耗服务器性能；另外一种就是前端在打包的时候压缩好，服务器做一些相应配置就可以返回压缩包给浏览器，只是打包出来的 dist 体积会偏大，但是不消耗服务器性能。这两种综合起来使用是比较划算的。

```js
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	listen 443 ssl default_server;
	listen [::]:443 ssl default_server;

	root /xxxx/xxxxxx/xxxxx/dist;

	index index.html;

	server_name xxxxx.xxxx;

    gzip on; // 开启服务器实时gzip
    gzip_static on; // 开启静态gz文件返回，如果存在请求以gz结尾的静态文件，则直接返回该文件
    gzip_min_length 1k; // 启用gzip压缩的最小文件，小于设置值的文件将不会压缩
    #gzip_disable "msie6"; // 禁用IE 6 gzip
    gzip_vary on; // 是否在http header中添加Vary: Accept-Encoding，建议开启
    gzip_proxied any; // 对代理文件进行压缩
    gzip_comp_level 9; // gzip 压缩级别，1-9，数字越大压缩的越好，也越占用CPU时间
    gzip_buffers 4 16k; // 设置压缩所需要的缓冲区大小
    gzip_http_version 1.0; // 设置gzip压缩针对的HTTP协议版本
    // 进行压缩的文件类型
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/jpeg image/gif image/png image/svg+xml;

	location / {
		try_files $uri $uri/ /index.html;
	}
}
```

## 部分依赖不打包，引入 cdn 加速

和上面的方法思路一样，减少打包后的文件体积。在没有使用 cdn 加速之前，例如 element-plus、@element-plus/icons-vue、vue、vux、axios、vue-router、echarts 等依赖都会打包，导致 vendor.js 体积很大，影响首屏加载速度。

这个优化则是选择性地将这些第三方依赖不加入打包，部署到线上之后直接引用线上 cdn 地址。

1.首先需要下载一个插件。

```
yarn add rollup-plugin-external-globals -D
```

2.然后在 main.js 文件中使用此插件，进行选择性打包，并在打包时将本地的引用替换成 cdn。这样就可以做到在本地仍然使用依赖，部署线上使用 cdn。

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import externalGlobals from "rollup-plugin-external-globals";

export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      //以下文件不打包
      external: [
        "vue",
        "element-plus",
        "@element-plus/icons-vue",
        "vuex",
        "axios",
        "vue-router",
        "echarts",
      ],
      plugins: [
        // 打包时自动将代码中的引入替换成cdn引入
        externalGlobals({
          vue: "Vue",
          "element-plus": "ElementPlus",
          "@element-plus/icons-vue": "ElementPlusIconsVue",
          vuex: "Vuex",
          axios: "axios",
          "vue-router": "VueRouter",
          echarts: "echarts",
        }),
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
```

3.在 index.html 中进行 cdn 引入。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <script src="https://unpkg.com/vue@3.2.16/dist/vue.global.js"></script>
    <link
      rel="stylesheet"
      href="https://unpkg.com/element-plus@2.1.8/dist/index.css"
    />
    <script src="https://unpkg.com/element-plus@2.1.8/dist/index.full.js"></script>
    <script src="https://unpkg.com/@element-plus/icons-vue@1.1.4/dist/index.iife.min.js"></script>
    <script src="https://unpkg.com/vuex@4.0.2/dist/vuex.global.js"></script>
    <script src="https://unpkg.com/axios@0.24.0/dist/axios.min.js"></script>
    <script src="https://unpkg.com/vue-router@4.1.6/dist/vue-router.global.js"></script>
    <script src="https://unpkg.com/echarts@5.3.0/dist/echarts.min.js"></script>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no"
    />
    <title>Ache</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
  <style></style>
</html>
```
