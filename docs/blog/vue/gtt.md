# 如何使用 ECharts 绘制甘特图

## What — 什么是甘特图

甘特图（Gantt Chart）又称为横道图、条状图(Bar chart)，由亨利·甘特于 1910 年提出，通过条状图来显示项目，进度，和其他时间相关的系统进展的内在关系随着时间进展的情况。其中，横轴表示时间，纵轴表示项目，甘特图以图示通过项目列表和时间刻度表示出特定项目的顺序与持续时间，具有简单、直观等特点。

## Why — 实现原理

ECharts 是一个使用 JavaScript 实现的开源可视化库，提供直观，交互丰富，可高度个性化定制的数据可视化图表，提供了常规的折线图、柱状图、散点图、饼图、K 线图，用于统计的盒形图，用于地理数据可视化的地图、热力图、线图，用于关系数据可视化的关系图、treemap、旭日图，多维数据可视化的平行坐标，还有用于 BI 的漏斗图，仪表盘，并且支持图与图之间的混搭。但是却唯独没有甘特图，仔细观察之后发现，甘特图与柱状图在图形的构成方式上类似，数据都是条状呈现，只是起点不一样，那能不能通过两条数据的叠加实现改变起点来绘制甘特图呢？

这里使用到了 ECharts 两个重要的属性 —— stack 和 z 。

stack 用于数据堆叠，同个类目轴上系列配置相同的 stack 后，后一个系列的值会在前一个系列的值上相加，堆叠在同一条状数据上，当 stack 不同时，同个类目轴上后一个系列的值则会另起一行/列显示。

![gtt-1](https://zhang.beer:9999/ache/beer/blog/gtt-1.png)

```js
series: [
  {
    name: "数据1",
    type: "bar",
    stack: "总量",
    data: [10, 20, 30, 20, 40],
  },
  {
    name: "数据2",
    type: "bar",
    stack: "总量",
    data: [30, 10, 20, 5, 20],
  },
];
```

![gtt-2](https://zhang.beer:9999/ache/beer/blog/gtt-2.png)

```js
series: [
  {
    name: "数据1",
    type: "bar",
    stack: "总量1",
    data: [10, 20, 30, 20, 40],
  },
  {
    name: "数据2",
    type: "bar",
    stack: "总量2",
    data: [30, 10, 20, 5, 20],
  },
];
```

z 则用于控制图形显示的的堆叠顺序，就像 css 中的 z-index 属性，拥有更高堆叠顺序的元素总是会处于堆叠顺序较低的元素的前面，即 z 值小的会被 z 值大的覆盖。

## How — 如何实现

有了以上的知识铺垫，下面来看看后端传过来的数据格式如何，根据具体情况随机应变。

![gtt-3](https://zhang.beer:9999/ache/beer/blog/gtt-3.png)

可以看到，这一条数据包含 8 个任务，每个任务都只有一种状态，状态的开始时间和结束时间也一并给出，那么就只需要将 stack 都设置相同，同时将开始时间的 z 值设置的比结束时间大，用开始时间覆盖结束时间，即可实现甘特图效果。

另外，细节处理方面，需要注意的是，开始时间和结束时间都需要传一整组数据，在对应的位置赋值，其余位置置空，才能保证开始时间和结束时间位于同一起点达到覆盖效果。同时，将开始时间的条状图设置为背景色，结束时间的条状图边框设置为背景色，这样，便大功告成了。

![gtt-4](https://zhang.beer:9999/ache/beer/blog/gtt-4.png)

```js
props: {
    jobRowData: Object // 查看作业实例当前行
},
data () {
  return {
    chartId: 'ganttChart',
    loading: false,
    noData: false,
    startDate: [],
    endDate: [],
    xDate: '', // x轴标题
    legendData: [], // 图例
    seriesData: [] // 图数据
  }
},
methods: {
  async getData () {
    this.loading = true
    var statusConfig = [{
      status: 'SUBMITTED_SUCCESS',
      statusZH: '提交成功',
      color: '#008800'
    }, {
      status: 'RUNNING_ EXECUTION',
      statusZH: '运行中',
      color: '#fcdb56'
    }, {
      status: 'READY_ PAUSE',
      statusZH: '准备暂停',
      color: '#ff8c00'
    }, {
      status: 'PAUSE',
      statusZH: '暂停',
      color: '#ff4500'
    }, {
      status: 'READY_STOP',
      statusZH: '准备停止',
      color: '#ffcccc'
    }, {
      status: 'STOP',
      statusZH: '停止',
      color: '#fa8072'
    }, {
      status: 'FAILURE',
      statusZH: '失败',
      color: '#3ba1ff'
    }, {
      status: 'SUCCESS',
      statusZH: '成功',
      color: '#69d388'
    }, {
      status: 'NEED_FAULT_TOLERANCE',
      statusZH: '需要容错',
      color: '#a9a9a9'
    }, {
      status: 'KILL',
      statusZH: '终止',
      color: '#cc0000'
    }, {
      status: 'WAITING_THREAD',
      statusZH: '等待线程',
      color: '#a777e9'
    }, {
      status: 'WAITTING_LIVE',
      statusZH: '等待依赖节点完成',
      color: '#e38eff'
    }]
    let res = await getGanttChart.send({}, { processInstanceId: this.jobRowData.id })
    this.loading = false
    if (res.isSuccess) {
      var startTip = []
      for (let item = 0; item < res.data.tasks.length; item++) {
        let taskStatus = res.data.tasks[item].status
        let statusColor = ''
        for (let i in statusConfig) {
          if (taskStatus === statusConfig[i].status) {
            taskStatus = statusConfig[i].statusZH
            statusColor = statusConfig[i].color
          }
        }
        this.legendData[item] = taskStatus
        this.startDate = []
        this.endDate = []
        startTip[item] = res.data.tasks[item].startDate[0] // 获取开始时间，用于tooltip显示
        this.startDate[item] = res.data.tasks[item].startDate[0]// 每一个任务的前面几个时间置空,最后一个时间赋值
        this.endDate[item] = res.data.tasks[item].endDate[0]
        this.seriesData.push({ // 一次传两个数据，用开始时间覆盖结束时间
          name: this.legendData[item],
          type: 'bar',
          cursor: 'pointer',
          barWidth: '40%',
          barMaxWidth: '30px',
          stack: '总量', // 数据堆叠，同个类目轴上系列配置相同的stack值后，后一个系列的值会在前一个系列的值上相加。
          // zlevel: -1, // 用于Canvas分层，不同zlevel值的图形会放置在不同的Canvas中
          itemStyle: {
            normal: {
              borderColor: '#fff',
              color: statusColor
            }
          },
          data: this.endDate
        })
        this.seriesData.push({
          name: this.legendData[item],
          type: 'bar',
          cursor: 'default',
          barWidth: '40%',
          barMaxWidth: '30px',
          stack: '总量',
          itemStyle: {
            normal: {
              color: '#fff'
            }
          },
          // zlevel: -1,
          z: 3, // 控制图形的前后顺序，z值小的会被z值大的覆盖。z相比zlevel优先级更低，而且不会创建新的Canvas
          data: this.startDate
        })
      }
      this.seriesData = Object.values(this.seriesData) // 对象转化成数组
      let tempDate = new Date(res.data.tasks[0].startDate[0]).toLocaleString()
      // 取第一个任务的开始时间戳，转化成日期格式如：2021/9/18 上午10:44:34
      this.xDate = tempDate.substring(0, tempDate.indexOf(' ')) // 去掉空格后的部分
      this.myChart.setOption({
        backgroundColor: '#fff',
        tooltip: {
          show: true, // 提示文字
          formatter: function (param) {
            let tip1 = '任务名称：' + param.name
            let tip2 = '任务状态：' + param.marker + param.seriesName
            let tip3 = '开始时间：' + new Date(startTip[param.dataIndex]).toLocaleString()
            let tip4 = '结束时间：' + new Date(param.value).toLocaleString()
            let tip5 = (param.value - startTip[param.dataIndex]) / 1000
            if (tip5 < 60) {
              tip5 = '持续时间：' + tip5 + '秒'
            } else if (tip5 < 3600) {
              tip5 = '持续时间：' + (tip5 / 60).toFixed(3) + '分钟'
            } else if (tip5 < 86400) {
              tip5 = '持续时间：' + (tip5 / 3600).toFixed(3) + '小时'
            } else {
              tip5 = '持续时间：' + (tip5 / 3600 / 24).toFixed(3) + '天'
            }
            if (param.dataIndex * 2 === param.seriesIndex) { // 开始时间不显示，只显示结束时间的tooltip
              return '<div style="text-align:left">' + tip1 + '</br>' + tip2 + '</br>' + tip3 + '</br>' + tip4 + '</br>' + tip5 + '</div>'
            }
          }
        },
        title: {
          text: '任务状态：',
          textStyle: {
            fontSize: 12,
            fontWeight: 'normal'
          }
        },
        legend: {
          icon: 'circle', // 图标形状
          itemGap: 25, // 图例每项之间的间隔
          itemWidth: 25, // 图标大小
          itemHeight: 10,
          left: 80
        },
        grid: {
          show: false, // 不显示外边框
          right: 90,
          left: 80,
          bottom: 200
        },
        xAxis: {
          type: 'time',
          name: this.xDate,
          axisLabel: {
            color: '#333333', // 坐标轴文字颜色
            formatter: function (param) {
              let date = new Date(param)
              let formatZero = function (num) {
                return (Array(2).join('0') + num).slice(-2)
              }
              let HMS = [formatZero(date.getHours()), formatZero(date.getMinutes()), formatZero(date.getSeconds())]
              return HMS.join(':')
            }
          },
          nameTextStyle: {
            color: '#333333'// 坐标轴末端标题颜色
          },
          splitLine: {
            show: false // 不显示网格线
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9' // 坐标轴颜色
            }
          }
        },
        yAxis: {
          splitLine: {
            show: true, // 显示网格线
            lineStyle: {
              type: 'dashed' // 网格线设置为虚线
            }
          },
          axisTick: {
            show: false // 取消刻度
          },
          axisLine: {
            lineStyle: {
              color: '#fff' // 坐标轴颜色
            }
          },
          axisLabel: {
            margin: 20,
            color: '#333333', // 坐标轴文字颜色
            formatter: function (param) {
              if (param.length > 8) {
                param = param.substring(0, 8) + '\n' + param.substring(8, param.length)
              }
              return param
            }
          },
          data: res.data.taskNames
        },
        series: this.seriesData
      })
    } else {
      this.noData = true
    }
  }
}
```
