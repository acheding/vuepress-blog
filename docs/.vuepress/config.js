module.exports = {
  title: "Luminosity Blog",
  description: "An awesome documentation website built with VuePress.",
  base: process.env.BASE_URL || "/vuepress/",
  plugins: [
    ["@vuepress/back-to-top"],
    ["@vuepress/medium-zoom"],
    [
      "@vuepress/last-updated",
      {
        transformer: (timestamp, lang) => {
          const moment = require("moment");
          moment.locale(lang);
          return moment(timestamp).fromNow();
        },
      },
    ],
  ],
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  themeConfig: {
    logo: "/ming.png",
    // displayAllHeaders: true,
    smoothScroll: true,
    lastUpdated: "上次更新",
    nav: [
      { text: "Home", link: "/" },
      {
        text: "Blog",
        items: [
          { text: "CSS", link: "/blog/css/" },
          { text: "VUE", link: "/blog/vue/" },
          { text: "微前端", link: "/blog/micro/" },
          { text: "服务器", link: "/blog/server/" },
          { text: "小程序", link: "/blog/mini/" },
        ],
      },
      { text: "GitHub", link: "https://github.com/fadeache" },
    ],
    sidebar: {
      "/blog/css/": [
        {
          title: "CSS",
          collapsable: false,
          // collapsed: true,
          sidebarDepth: 2,
          children: [
            "",
            "Landscape animation",
            "伪元素实现菜单动画",
            "吸顶效果和锚点定位",
          ],
        },
      ],
      "/blog/vue/": [
        {
          title: "VUE",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            "",
            "如何使用 ECharts 绘制甘特图",
            "Vue3 父子、兄弟组件通信",
            "el-table 表头插入 tooltip 及更换背景色",
            "如何向日历中添加日程",
            "Vue 动态切换 PC 端与移动端",
            "Vue3 ：require is not defined",
            "Vue2 自定义指令监听是否点击元素外部",
            "Vite+Vue3 加载速度优化",
            "Vue 实现 PDF 导出功能",
          ],
        },
      ],
      "/blog/micro/": [
        {
          title: "微前端",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            "",
            "qiankun 微前端介绍及实现",
            "wujie 微前端实现及三种通信方式介绍",
          ],
        },
      ],
      "/blog/server/": [
        {
          title: "服务器",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            "",
            "如何搭建自己的网站",
            "如何搭建自己的网站（二）",
            "开源接口",
            "Nginx 服务器 SSL 证书安装部署",
            "Vite+Vue3+IIS 报错 404",
            "如何在 ubuntu 上搭建 minio",
            "minio 实现 https 访问",
            "SpringBoot + 对象存储（COS）",
            "SpringBoot + minio",
            "ubuntu 重启 MySQL 后无法远程连接",
            "WinSCP 脚本实现将 jar 包一键上传 Ubuntu 并 docker 部署",
          ],
        },
      ],
      "/blog/mini/": [
        {
          title: "小程序",
          collapsable: false, // 左上角大标题“小程序”是否可展开
          sidebarDepth: 2,
          children: ["", "如何注册微信小程序", "如何开发微信小程序"],
        },
      ],
    },
  },
};
