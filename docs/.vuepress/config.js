module.exports = {
  title: "Luminosity Blog",
  description: "An awesome documentation website built with VuePress.",
  base: "/vuepress/",
  plugins: [["@vuepress/back-to-top"]],
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
          { text: "CSS", link: "/blog/css/" },
          { text: "VUE", link: "/blog/vue/" },
          { text: "微前端", link: "/blog/micro/" },
          { text: "服务器", link: "/blog/server/" },
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
          children: ["", "animation", "pseudo-elements", "anchor"],
        },
      ],
      "/blog/vue/": [
        {
          title: "VUE",
          collapsable: false,
          sidebarDepth: 3,
          children: [
            "",
            "gtt",
            "vue3",
            "slot",
            "calendar",
            "pc-ph",
            "require",
            "directives",
          ],
        },
      ],
      "/blog/micro/": [
        {
          title: "微前端",
          collapsable: false,
          sidebarDepth: 3,
          children: ["", "qiankun", "wujie"],
        },
      ],
      "/blog/server/": [
        {
          title: "服务器",
          collapsable: false,
          sidebarDepth: 3,
          children: [
            "",
            "website",
            "website2",
            "ssl",
            "IIS",
            "ubuntu-minio",
            "minio-https",
            "springboot-cos",
            "springboot-minio",
            "remote-connect",
          ],
        },
      ],
    },
  },
};
