# el-table 表头插入 tooltip 及更换背景色

vue3 中，使用插槽的方式相比 vue2 有所变化。以前 vue2 使用的 slot="xxx" 改成了 v-slot:xxx 或 #xxx ，所以在 element-ui 中使用的 slot-scope="scope" 可以写为 v-slot="scope" 或者 #default="scope"，如果不需要使用 scope 参数的话，写成 #default 也没问题，slot="header"、slot="footer" 可以写为 #header、#footer。表头插入 tooltip 就用到了插槽的方法。

更换表格背景色需要用到 el-table 的 cell-class-name 参数，它是单元格 className 的回调方法，可以自由选择行和列，为某一行或列添加一个带有特殊样式的 class 类。

效果：
![slot](https://zhang.beer/static/images/slot.png)
代码：

```vue
<script setup>
import { reactive } from "vue";

const state = reactive({
  tableData: [
    {
      date: "2016-05-01",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1517 弄",
    },
    {
      date: "2016-05-02",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1518 弄",
    },
    {
      date: "2016-05-03",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1519 弄",
    },
  ],
});
const addColor = ({ rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return "orange";
    }
    if (rowIndex === 1) {
      return "yellow";
    }
    if (rowIndex === 2) {
      return "blue";
    }
  }
};
</script>

<template>
  <el-table
    :data="state.tableData"
    :cell-class-name="addColor"
    style="width: 640px; margin: auto"
  >
    <el-table-column
      label="#"
      type="index"
      align="center"
      width="60"
    ></el-table-column>
    <el-table-column prop="date">
      <template v-slot:header>
        <el-tooltip content="我是一个日期" placement="top-start" effect="light">
          <i class="el-icon-warning-outline"></i>
        </el-tooltip>
        <span>日期</span>
      </template>
    </el-table-column>
    <el-table-column label="姓名" prop="name"></el-table-column>
    <el-table-column label="地址" prop="address" width="220"> </el-table-column>
    <el-table-column label="操作" width="160">
      <template v-slot="scope">
        <el-button type="text" size="small">查看</el-button>
        <el-button type="text" size="small">删除</el-button>
        <el-button type="text" size="small">{{ scope.row.date }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style lang="scss" scoped>
span {
  float: left;
  font-size: 14px;
  font-weight: bold;
  margin-right: 3px;
}
:deep(.orange) {
  padding: 0 8px !important;
  .cell {
    div {
      background: #ff7f31;
      color: #fff;
    }
  }
}
:deep(.yellow) {
  padding: 0 8px !important;
  .cell {
    div {
      background: #ffba32;
      color: #fff;
    }
  }
}
:deep(.blue) {
  padding: 0 8px !important;
  .cell {
    div {
      background: #3288ff;
      color: #fff;
    }
  }
}
</style>
```
