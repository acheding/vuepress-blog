# Landscape animation

<https://zhang.beer/animation>

![animation](https://zhang.beer/static/images/animation.gif)

- 太阳：sun 控制旋转， .sun span 控制光线的伸长与缩短，值得一提的是在这里 box-shadow 比伪元素更好用， 渲染了橙色的阴影，下面给出了代码。
- 山：本体是一个正方形盒子，先旋转 45° ，通过 ::before 和 ::after 延长两边，辅以阴影。
- 云：是通过 5 个大大小小的半圆拼接而成的，设置了快慢两种动画速度。
- 风：使用 span 及其两种伪元素，span 为中间主要部分，::before 为左端弯曲小半圆，::after 为右端小横线。
- 树：也是使用了 span 及其两种伪元素，span 为树根部分，::before 成为了椭圆，::after 成为了阴影线条。
- 风车：两个盒子，一个作为风车的柱子，一个用来固定三片 span 抽象出来的风叶。
  最后通过 js 加减类，实现总体的快慢两种状态。

```css
.sun {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #333;
  border-radius: 50%;
  left: 270px;
  top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: sun_rotate 10s linear infinite;
}
@keyframes sun_rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
.sun span {
  position: absolute;
  display: block;
  height: 2px;
  width: 16px;
  background: #333;
  transform: rotate(calc(var(--i) * 45deg)) translateX(-20px);
  box-shadow: 3px 4px 0 0 var(--color5);
  animation: sun_ray 1s linear infinite;
  animation-delay: calc(var--i) * -0.5s;
}
@keyframes sun_ray {
  0% {
    transform: rotate(calc(var(--i) * 45deg)) translateX(-20px) scaleX(1);
  }
  50% {
    transform: rotate(calc(var(--i) * 45deg)) translateX(-20px) scaleX(0.6);
  }
  100% {
    transform: rotate(calc(var(--i) * 45deg)) translateX(-20px) scaleX(1);
  }
}
```
