module.exports = {
  title: "Luminosity Blogs",
  description: "An awesome documentation website built with VuePress.",
  plugins: ["@vuepress/back-to-top"],
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  themeConfig: {
    logo: "/ming.png",
    displayAllHeaders: true,
    smoothScroll: true,
    nav: [
      { text: "Home", link: "/" },
      {
        text: "Blog",
        items: [
          { text: "CSS", link: "/blog/css/animation" },
          { text: "VUE", link: "/blog/vue/gtt" },
          { text: "微前端", link: "/blog/micro/qiankun" },
          { text: "服务器", link: "/blog/server/website" },
        ],
      },
      { text: "GitHub", link: "https://github.com/fadeache" },
    ],
    sidebar: {
      "/blog/css/": [
        {
          title: "CSS",
          collapsable: false,
          // collapsed: false,
          sidebarDepth: 3,
          children: ["animation", "pseudo-elements", "anchor"],
        },
      ],
      "/blog/vue/": [
        {
          title: "VUE",
          collapsable: false,
          sidebarDepth: 3,
          children: ["gtt", "vue3", "slot", "calendar", "pc-ph"],
        },
      ],
      "/blog/micro/": [
        {
          title: "微前端",
          collapsable: false,
          sidebarDepth: 3,
          children: ["qiankun", "wujie"],
        },
      ],
      "/blog/server/": [
        {
          title: "服务器",
          collapsable: false,
          sidebarDepth: 3,
          children: ["website", "website2", "ssl"],
        },
      ],
    },
  },
};
