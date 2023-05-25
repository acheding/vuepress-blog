# 伪元素实现菜单动画

![pseudo-elements](https://zhang.beer/static/images/pseudo-elements.gif)

基本思想是固定一个初始类 original ，当选中时通过 :class 动态增加一个 active 的类，在 active 出现或消失时插入过渡动画。

一开始通过 border-bottom 实现菜单选中项底部出现横线，但是后来想要增加动画效果时却不尽如意了，索性全都换成了伪元素 ::before ，作为一个单独的整体书写样式，使用起来十分得心应手。

未选中时，通过 css3 新特性 transform: scale(0) 和 transform-origin: left 使其隐藏并将运动的基点设置为左侧，选中时，令它显示，选中与未选中之间就会出现此消彼长，上一个自右至左消退，下一个自左至右渐进的效果了。

```html
<template>
  <ul>
    <li v-for="(item,index) in list" :key="index">
      <span
        class="original"
        :class="{active:index==isactive}"
        @mouseover="overItem(index)"
      >
        {{item}}
      </span>
    </li>
  </ul>
</template>
<script>
  export default{
      data(){
          return{
              isactive:0;
              list:['这是一个标签1','这是一个标签2','这是一个标签3','这是一个标签4','这是一个标签5',]
          }
      },
      methods:{
          overItem(index){
              this.isactive=index
          }
      }
  }
</script>
<style lang="scss" scoped>
  li {
    list-style: none;
    padding-bottom: 20px;
  }
  .original {
    position: relative;
  }
  .original:hover {
    color: #3054eb;
  }
  .original::before {
    content: "";
    position: absolute;
    height: 3px;
    top: 25px;
    background: #3054eb;
    width: 100%;
    transform: scale(0);
    transform-origin: left;
    transition: transform 0.4s ease-in-out;
  }
  .active {
    color: #3054eb;
  }
  .active::before {
    transform: scale(1);
  }
</style>
```
