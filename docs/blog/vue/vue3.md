# Vue3 父子、兄弟组件通信

## 父组件向子组件通信

父组件：Father

```vue
<script setup>
import OneSon from "./oneSon.vue";
import { reactive } from "vue";

const state = reactive({
  fatherData: "I am from Father.",
});
</script>

<template>
  <p>I am Father.</p>
  <OneSon :fatherDataName="state.fatherData"></OneSon>
</template>

<style scoped></style>
```

子组件：OneSon

```vue
<script setup>
import { defineProps } from "vue";

defineProps({
  fatherDataName: String,
});
</script>

<template>
  <p>I am OneSon.</p>
  <p>{{ fatherDataName }}</p>
</template>

<style scoped></style>
```

效果：
![vue3-1](https://zhang.beer/static/images/vue3-1.png)

## 子组件向父组件通信

子组件：OneSon

```vue
<script setup>
import { reactive, defineEmits } from "vue";

const state = reactive({
  sonData: "I am from Son.",
});
const emit = defineEmits(["sonDataName"]);
const emitSonData = () => {
  emit("sonDataName", state.sonData);
};
</script>

<template>
  <p @click="emitSonData">I am OneSon.</p>
</template>

<style scoped></style>
```

父组件：Father

```vue
<script setup>
import OneSon from "./oneSon.vue";
import { reactive } from "vue";
const state = reactive({
  receive: "",
});
const getSonData = (value) => {
  state.receive = value;
};
</script>

<template>
  <p>I am Father.</p>
  <OneSon @sonDataName="getSonData"></OneSon>
  <p>{{ state.receive }}</p>
</template>

<style scoped></style>
```

效果：
![vue3-2](https://zhang.beer/static/images/vue3-2.gif)

## 兄弟组件通信

子组件 1：OneSon

```vue
<script setup>
import { reactive, defineEmits } from "vue";

const state = reactive({
  sonData: true,
});
const emit = defineEmits(["sonDataName"]);
const emitSonData = () => {
  emit("sonDataName", state.sonData);
};
</script>

<template>
  <p @click="emitSonData">I am OneSon.</p>
</template>

<style scoped></style>
```

子组件 2：AnotherSon

```vue
<script setup>
import { reactive, defineExpose } from "vue";

const state = reactive({
  display: false,
});
const showAnotherSon = (val) => {
  state.display = val;
};
const hidden = () => {
  state.display = false;
};
defineExpose({ showAnotherSon });
</script>

<template>
  <p v-if="state.display" @click="hidden()">I am AnotherSon.</p>
</template>

<style scoped></style>
```

父组件：Father

```vue
<script setup>
import OneSon from "./oneSon.vue";
import AnotherSon from "./anotherSon.vue";
import { ref } from "vue";

const anotherSon = ref(null);
const getSonData = (val) => {
  anotherSon.value.showAnotherSon(val);
};
</script>

<template>
  <p>I am Father.</p>
  <OneSon @sonDataName="getSonData"></OneSon>
  <AnotherSon ref="anotherSon"></AnotherSon>
</template>

<style scoped></style>
```

效果：

![vue3-3](https://zhang.beer/static/images/vue3-3.gif)
