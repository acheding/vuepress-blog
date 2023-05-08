# 如何向日历中添加日程

1.获取所有日程

```js
const getAllSchedules = async () => {
  let res = await axios.get("calendar/get");
  state.schedules = res.data;
};
```

![calendar-1](https://zhang.beer:9999/ache/beer/blog/calendar-1.png)

2.计算属性同步更新日程

```js
const getSchedules = computed(() => {
  return function (data) {
    let theDay = [];
    state.schedules.find((item) => {
      if (item.date === data.day) {
        theDay.push(item);
      }
    });
    return theDay;
  };
});
```

3.通过 popover 插入日历

```js
<el-calendar v-model="state.value"
    ><template #dateCell="{ data }">
      <el-popover
        placement="top-start"
        trigger="hover"
        v-if="getOneSchedule(data).length"
        width="auto"
      >
        <li v-for="item in getOneSchedule(data)">
          <span>{{ item.event }}</span>
          <span v-if="item.completed" style="margin-left: 8px">—{{ item.completed }}%</span>
        </li>
        <template #reference>
          <div class="hasSchedule">
            {{ data.day.split("-").slice(2).join("") }}
          </div>
        </template>
      </el-popover>
      <div v-else>
        {{ data.day.split("-").slice(2).join("") }}
      </div>
    </template></el-calendar
  >
```

4.伪元素显示有日程的日期

```css
.hasSchedule::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 2px;
  background: #409eff;
  margin-top: 36px;
  margin-left: 0;
}
```

5.最终效果及完整代码如下

![calendar-2](https://zhang.beer:9999/ache/beer/blog/calendar-2.png)

::: details 点击查看代码

```vue
<script setup>
import axios from "axios";
import { computed, onMounted, reactive } from "vue";

const state = reactive({
  schedules: [],
});

onMounted(async () => {
  getAllSchedules();
});

const getAllSchedules = async () => {
  let res = await axios.get("calendar/get");
  state.schedules = res.data;
};

const getOneSchedule = computed(() => {
  return function (data) {
    let theDay = [];
    state.schedules.find((item) => {
      if (item.date === data.day) {
        theDay.push(item);
      }
    });
    return theDay;
  };
});
</script>

<template>
  <el-calendar v-model="state.value"
    ><template #dateCell="{ data }">
      <el-popover
        placement="top-start"
        trigger="hover"
        v-if="getOneSchedule(data).length"
        width="auto"
      >
        <li v-for="item in getOneSchedule(data)">
          <span>{{ item.event }}</span>
          <span v-if="item.completed" style="margin-left: 8px"
            >—{{ item.completed }}%</span
          >
        </li>
        <template #reference>
          <div class="hasSchedule">
            {{ data.day.split("-").slice(2).join("") }}
          </div>
        </template>
      </el-popover>
      <div v-else>
        {{ data.day.split("-").slice(2).join("") }}
      </div>
    </template></el-calendar
  >
</template>

<style scoped lang="scss">
.el-calendar {
  --el-calendar-header-border-bottom: transparent;
  :deep(.el-calendar__header) {
    flex-direction: column;
    height: 56px;
    padding: 0;
  }
  :deep(.el-calendar__body) {
    padding: 0;
    .el-calendar-day {
      height: 56px;
      div {
        height: 100%;
        width: 100%;
        line-height: 40px;
      }
      .hasSchedule::before {
        content: "";
        position: absolute;
        width: 18px;
        height: 2px;
        background: #409eff;
        margin-top: 36px;
        margin-left: 0;
      }
    }
  }
}
</style>
```

:::
