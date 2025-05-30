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
        transformer: (timestamp, lang) =>
        {
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
          { text: "小程序", link: "/blog/vxmp/" },
          { text: "Python", link: "/blog/python/" },
          { text: "Java", link: "/blog/java/" }
        ],
      },
      { text: "GitHub", link: "https://github.com/acheding" },
    ],
    sidebar: {
      "/blog/css/": [
        {
          title: "CSS",
          collapsable: false,
          // collapsed: true,
          sidebarDepth: 2,
          children: ["", "animation", "pseudo-elements", "anchor"],
        },
      ],
      "/blog/vue/": [
        {
          title: "VUE",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            "",
            "gtt",
            "vue3",
            "slot-tooltip",
            "calendar",
            "pc-ph",
            "require-not-defined",
            "directive-outside",
            "load-optimization",
            "pdf-export",
            "gogocode",
            "vuepress",
            "markdown",
          ],
        },
      ],
      "/blog/micro/": [
        {
          title: "微前端",
          collapsable: false,
          sidebarDepth: 2,
          children: ["", "qiankun", "wujie"],
        },
      ],
      "/blog/server/": [
        {
          title: "服务器",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            "",
            "website",
            "website2",
            "interface",
            "ssl",
            "IIS-404",
            "ubuntu-minio",
            "minio-https",
            "mysql-connect",
            "winscp-script",
            "virtual-machine-network",
            "clash-for-linux",
          ],
        },
      ],
      "/blog/vxmp/": [
        {
          title: "小程序",
          collapsable: false, // 左上角大标题“小程序”是否可展开
          sidebarDepth: 2,
          children: ["", "vxmp-register", "vxmp-develop", "random"],
        },
      ],
      "/blog/python/": [
        {
          title: "Python",
          collapsable: false,
          sidebarDepth: 2,
          children: ["", "save-file-faster", "spider-captcha"],
        },
      ],
      "/blog/java/": [
        {
          title: "Java",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            "",
            "translate-name",
            "springboot-cos",
            "springboot-minio",
          ],
        },
      ]
    },
  },
};
