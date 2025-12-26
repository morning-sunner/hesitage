<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

interface HeritageData {
  name: string
  value: number
  coord: [number, number]
}

// resize 处理函数引用，用于正确移除监听器
let resizeHandler: (() => void) | null = null

// 从本地加载地图数据
const loadMapData = async () => {
  try {
    const response = await fetch('/maps/china.geojson')
    const data = await response.json()
    echarts.registerMap('china', data as any)
    console.log('✓ 中国地图数据加载成功')
  } catch (error) {
    console.error('❌ 加载地图数据失败:', error)
  }
}

onMounted(async () => {
  if (!chartContainer.value) return

  // 先加载地图数据
  await loadMapData()

  chart = echarts.init(chartContainer.value)

  // 长三角四省的地理信息和数据
  const ytRegionData = [
    { name: '江苏', value: 12 },
    { name: '浙江', value: 15 },
    { name: '安徽', value: 8 },
    { name: '上海', value: 10 }
  ]

  // 非遗散点数据（示例）
  const heritagePoints = [
    { name: '苏州昆曲', value: [120.595, 31.299, 5] },
    { name: '杭州丝绸', value: [120.155, 30.274, 4] },
    { name: '宣城宣纸', value: [118.757, 30.945, 3] },
    { name: '绍兴越剧', value: [120.583, 30.003, 4] },
    { name: '黄山徽墨', value: [118.307, 30.137, 3] },
    { name: '龙泉青瓷', value: [119.169, 28.031, 3] },
    { name: '上海豫园', value: [121.499, 31.234, 5] },
  ]

  const option = {
    title: {
      text: '长三角非遗分布地图',
      left: 'center',
      top: 20,
      textStyle: {
        color: '#333',
        fontSize: 20,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#c9916f',
      textStyle: {
        color: '#333'
      },
      formatter: (params: any) => {
        if (params.componentSubType === 'scatter') {
          return `<div style="padding: 5px;">${params.name}</div>`
        }
        if (params.componentSubType === 'map') {
          return `<div style="padding: 5px;">${params.name}: ${params.value} 个非遗项目</div>`
        }
        return params.name
      }
    },
    geo: {
      map: 'china',
      roam: true,
      center: [119.5, 31.5],
      zoom: 5,
      label: {
        show: false
      },
      itemStyle: {
        areaColor: '#f0e6d8',
        borderColor: '#a8a8a8'
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e0c899'
        }
      },
      regions: [
        {
          name: '江苏',
          itemStyle: {
            areaColor: '#d4a574',
            borderColor: '#8b6f47'
          }
        },
        {
          name: '浙江',
          itemStyle: {
            areaColor: '#d4a574',
            borderColor: '#8b6f47'
          }
        },
        {
          name: '安徽',
          itemStyle: {
            areaColor: '#d4a574',
            borderColor: '#8b6f47'
          }
        },
        {
          name: '上海',
          itemStyle: {
            areaColor: '#c9916f',
            borderColor: '#8b6f47'
          }
        }
      ]
    },
    series: [
      {
        name: '非遗项目数',
        type: 'map',
        geoIndex: 0,
        data: ytRegionData,
        itemStyle: {
          areaColor: '#d4a574'
        },
        emphasis: {
          itemStyle: {
            areaColor: '#c9916f'
          }
        }
      },
      {
        name: '非遗分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: heritagePoints,
        symbolSize: (val: any) => {
          const size = Array.isArray(val) && val.length >= 3 ? val[2] : 1
          return Math.max(size * 4, 8)
        },
        itemStyle: {
          color: '#c9916f',
          borderColor: '#fff',
          borderWidth: 2,
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            color: '#ff6b6b',
            borderColor: '#fff',
            borderWidth: 3,
            opacity: 1
          }
        },
        label: {
          show: false,
          formatter: '{b}',
          position: 'right'
        }
      }
    ],
    visualMap: {
      min: 0,
      max: 15,
      splitNumber: 5,
      inRange: {
        color: ['#f0e6d8', '#e0c899', '#d4a574', '#c9916f', '#8b6f47']
      },
      textStyle: {
        color: '#333'
      },
      bottom: '20px',
      left: 'center'
    }
  } as echarts.EChartsOption

  chart.setOption(option)

  // 保存 resize 处理函数引用
  resizeHandler = () => {
    chart?.resize()
  }
  
  // 响应窗口变化
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  // 移除事件监听器
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  chart?.dispose()
  chart = null
})

// 更新数据方法
const updateData = (newData: HeritageData[]) => {
  if (!chart) return

  const option = chart.getOption() as any
  if (option.series && Array.isArray(option.series) && option.series[1]) {
    option.series[1].data = newData
    chart.setOption(option)
  }
}

defineExpose({
  updateData,
  chart
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5e6d3 0%, #faf4f0 100%);
}
</style>
