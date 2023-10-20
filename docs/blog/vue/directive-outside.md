# Vue2 自定义指令监听是否点击元素外部

```js
export default {
  directives: {
    focus: {
      inserted: function (el) {
        el.querySelector("input").focus();
      },
      clickOutside: {
        bind(el, binding, vnode) {
          function documentHandler(e) {
            if (el.contains(e.target)) {
              return false;
            }
            // binding.value(e); // 操作
          }
          el.__vueClickOutside__ = documentHandler;
          document.addEventListener("click", documentHandler);
        },
      },
    },
    unbind(el, binding) {
      document.removeEventListener("click", el.__vueClickOutside__);
      delete el.__vueClickOutside__;
    },
  },
};
```
