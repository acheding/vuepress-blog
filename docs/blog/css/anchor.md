# 吸顶效果和锚点定位

![anchor](https://zhang.beer:9999/ache/beer/blog/anchor.gif)

这里主要通过监听滚轮使鼠标滑动到某些特定地方，增加 fix-nav 类固定悬浮栏实现吸顶，增加 active 类实现底部横线动画切换。有了滚轮监听，那么锚点定位也并非难事了，点击悬浮栏向函数传进对应内容的 id ，然后计算当前鼠标位置与目标位置之间的距离，给鼠标位置不断增加 1/4 的这个距离，直到距离小于 1 停止，期间给予一定的延时，就会出现动画效果了。关于锚点定位这里写了另外一种简单的实现方式，原生 JS 的 API —— scrollIntoView() 方法或 window.scrollTo()方法（后者可以滚动到指定位置），可以让元素进入视区，通过触发滚动容器的定位实现，其中 behavior 为过渡动画，可以是 “auto”，”instant” 或 “smooth”。默认为 “auto”，block 为最终停止的地方，可以是 “center”，”start” 或 “nearest”。默认为 “center” 。鼠标滑动滚轮到顶部，导航栏自动吸顶，保持不动，滑动到相应内容，导航栏自动切换，点击导航栏，自动平滑到指定内容。

```vue
<template>
  <div style="height: 1200px">
    <div style="height: 300px; width: 100%; background-color: lightpink"></div>
    <div class="nav" :class="{ 'fix-nav': navBarFixed }">
      <div class="outside">
        <div
          class="inside"
          :class="{ active: inside1 }"
          @click="clickPan('content1')"
        >
          <span>内容1导航</span>
        </div>
        <div
          class="inside"
          :class="{ active: inside2 }"
          @click="clickPan('content2')"
        >
          <span>内容2导航</span>
        </div>
      </div>
    </div>
    <div class="content1" id="content1">
      <div
        style="
          height: 300px;
          width: 100%;
          background-color: lightyellow;
          padding-top: 30px;
          text-align: center;
        "
      >
        这是一块内容1
      </div>
    </div>
    <div class="content2" id="content2">
      <div
        style="
          height: 300px;
          width: 100%;
          background-color: lightblue;
          padding-top: 30px;
          text-align: center;
        "
      >
        这是一块内容2
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      inside1: true,
      inside2: false,
      navBarFixed: false,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.watchScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.watchScroll);
  },
  methods: {
    clickPan(position) {
      // document.getElementById(position).scrollIntoView({
      //   behavior: "smooth",
      //   block: "start"
      // });
      const targetElem = document.getElementById(position);
      var targetElemPosition = targetElem.offsetTop - 72;
      if (this.navBarFixed === false && position === "content1") {
        targetElemPosition = targetElemPosition - 1;
      }
      if (this.navBarFixed === false && position === "content2") {
        targetElemPosition = targetElemPosition - 72;
      }
      let scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const step = function () {
        let distance = targetElemPosition - scrollTop;
        scrollTop = scrollTop + distance / 4;
        if (Math.abs(distance) < 1) {
          window.scrollTo(0, targetElemPosition);
        } else {
          window.scrollTo(0, scrollTop);
          setTimeout(step, 30);
        }
      };
      step();
    },
    watchScroll() {
      var scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      var offsetTop = document.querySelector(".content1").offsetTop - 72;
      if (scrollTop >= offsetTop) {
        this.navBarFixed = true;
      } else {
        this.navBarFixed = false;
      }
      if (scrollTop < document.querySelector(".content2").offsetTop - 72) {
        this.inside1 = true;
        this.inside2 = false;
      } else {
        this.inside2 = true;
        this.inside1 = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.outside {
  margin: auto;
  width: 400px;
  height: 100%;
  span {
    position: relative;
  }
  .inside {
    line-height: 70px;
    text-align: center;
    margin: auto;
    width: 200px;
    height: 100%;
    float: left;
    cursor: pointer;
    span::before {
      content: "";
      position: absolute;
      height: 3px;
      top: 47.5px;
      background: #3054eb;
      width: 100%;
      opacity: 0;
      transition: all 0.8s ease;
    }
  }
  .active {
    color: #1890ff;
    span::before {
      opacity: 1;
    }
  }
  .inside:hover {
    color: #1890ff;
  }
}
.fix-nav {
  position: fixed;
  z-index: 1;
  top: 0;
  height: 70px;
  width: 100%;
  font-size: 1.3em;
  background-color: white;
  border-bottom: 2px solid #f2f2f2;
}
.nav {
  height: 70px;
  width: 100%;
  font-size: 1.3em;
  background-color: white;
  border-bottom: 2px solid #f2f2f2;
}
</style>
```
