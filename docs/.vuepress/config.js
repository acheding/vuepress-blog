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
            "slot",
            "calendar",
            "pc-ph",
            "require",
            "directives",
            "load-optimization",
            "export-pdf",
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
            "IIS",
            "ubuntu-minio",
            "minio-https",
            "springboot-cos",
            "springboot-minio",
            "remote-connect",
            "winscp-script",
          ],
        },
      ],
      "/blog/mini/": [
        {
          title: "小程序",
          collapsable: false,
          sidebarDepth: 2,
          children: ["", "vxmp", "vxmp2"],
        },
      ],
    },
  },
};
