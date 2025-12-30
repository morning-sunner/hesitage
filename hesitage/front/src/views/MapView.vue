<template>
  <div class="map-container">
    <NavBar />
    <div class="map-wrapper">
      <div id="mapbox-container" ref="mapContainer"></div>

      <div class="toolbar">
        <div class="stat-item" style="font-size: 12px; color: #666; line-height: 1.6;">
          <strong>💡 提示</strong><br>
          双击地图上的城市，<br>
          查看该市的非遗<br>
          类型分布情况
        </div>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;" />
        <button
          style="width: 100%; padding: 6px; margin-top: 8px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; font-size: 13px;"
          @click="resetView"
        >
          重置视图
        </button>
      </div>

      <div class="legend">
        <div class="legend-title">非遗项目数</div>
        <div class="legend-item" v-for="item in legend" :key="item.label">
          <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>

      <div class="info-panel" v-if="hoveredCity">
        <div class="info-title">{{ hoveredCity.name }}</div>
        <div class="info-row"><span>省份：</span>{{ hoveredCity.province }}</div>
        <div class="info-row"><span>非遗数：</span>{{ hoveredCity.count }}</div>
        <div style="margin-top: 8px; padding: 6px; background: #f0f9e8; border-radius: 3px; font-size: 12px; color: #2b8cbe; text-align: center; font-weight: 500;">
          💡 双击查看类型分布
        </div>
      </div>

      <!-- 右侧面板 - 非遗类型分布 -->
      <div class="side-panel" :class="{ active: showModal }">
        <div class="panel-header">
          <h3>{{ selectedCity }} - 非遗类型分布</h3>
          <button class="panel-close" @click="closeModal">✕</button>
        </div>
        <div class="panel-body">
          <div ref="chartContainer" style="width: 100%; height: 100%;"></div>
          <div v-if="categoryLoading" style="text-align: center; padding: 40px; color: #999;">
            加载中...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import mapboxgl from 'mapbox-gl'
import * as echarts from 'echarts'
import 'mapbox-gl/dist/mapbox-gl.css'

// 设置 Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbnlhbmd6aHUiLCJhIjoiY21qZ3gyd3NlMTd1YjNjb3JqNDNyb3Y5eSJ9.eVPOmxIjsx1Zm2DRZSAUqw'

const router = useRouter()
const mapContainer = ref<HTMLDivElement | null>(null)
const mapInstance = ref<mapboxgl.Map | null>(null)
const hoveredCity = ref<{ name: string; province: string; count: number } | null>(null)
const cityData = ref<Array<{ name: string; province: string; count: number }>>([])
const maxCount = ref<number>(0)
const dynamicThresholds = ref<number[]>([])

// ECharts modal 相关
const showModal = ref(false)
const selectedCity = ref('')
const selectedProvince = ref('')
const chartContainer = ref<HTMLDivElement | null>(null)
const categoryLoading = ref(false)

const legend = [
  { threshold: 0, label: '0-20%', color: '#f0f9e8' },
  { threshold: 20, label: '20-40%', color: '#ccebc5' },
  { threshold: 40, label: '40-60%', color: '#a8ddb5' },
  { threshold: 60, label: '60-80%', color: '#7bccc4' },
  { threshold: 80, label: '80-100%', color: '#2b8cbe' }
]

const cityCount = computed(() => cityData.value.length)
const totalCount = computed(() => cityData.value.reduce((sum, c) => sum + c.count, 0))

const colorRamp = ['step', ['get', 'count'], '#f0f9e8', 10, '#ccebc5', 30, '#a8ddb5', 60, '#7bccc4', 100, '#2b8cbe'] as mapboxgl.Expression

const normalizeName = (name: string) => {
  let city = name
    .replace(/^(.*?[省自治区])/, '')
    .replace(/市$/, '')
    .trim()
  return city || name
}

const loadData = async () => {
  const [geoRes, statRes] = await Promise.all([
    fetch('/maps/china-yrd.geojson'),
    fetch('/api/heritage/statistics/by-city')
  ])

  const [geojson, statJson] = await Promise.all([geoRes.json(), statRes.json()])

  if (!statJson.success) {
    throw new Error(statJson.message || '获取市级统计失败')
  }

  const statMap = new Map<string, { province: string; count: number }>()
  statJson.data.forEach((row: { city: string; province: string; count: number }) => {
    const cityName = normalizeName(row.city)
    statMap.set(cityName, { province: row.province, count: Number(row.count) || 0 })
  })

  const enrichedFeatures = geojson.features.map((f: any) => {
    const origName = f.properties.name || ''
    const cityName = normalizeName(origName)
    const stat = statMap.get(cityName)
    return {
      ...f,
      properties: {
        ...f.properties,
        name: cityName || origName,
        name_zh: cityName || origName,
        province: stat?.province || '',
        count: stat?.count || 0
      }
    }
  })

  cityData.value = enrichedFeatures.map((f: any) => ({ name: f.properties.name, province: f.properties.province, count: f.properties.count }))

  const max = Math.max(...cityData.value.map(c => c.count), 1)
  maxCount.value = max
  dynamicThresholds.value = [
    0,
    Math.round(max * 0.2),
    Math.round(max * 0.4),
    Math.round(max * 0.6),
    Math.round(max * 0.8),
    max
  ]

  return { ...geojson, features: enrichedFeatures }
}

const showCategoryChart = async (cityName: string, province: string) => {
  selectedCity.value = cityName
  selectedProvince.value = province
  showModal.value = true
  categoryLoading.value = true

  try {
    const res = await fetch(`/api/heritage/statistics/by-city/categories/${encodeURIComponent(cityName)}/${encodeURIComponent(province)}`)
    const data = await res.json()

    if (!data.success) {
      alert('获取类型数据失败')
      return
    }

    categoryLoading.value = false

    // 延迟渲染图表，确保 DOM 已经加载
    setTimeout(() => {
      if (chartContainer.value) {
        const chart = echarts.init(chartContainer.value)
        const colors = ['#5470c6', '#91419f', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
        const option = {
          color: colors,
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} 项 ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { fontSize: 12 }
          },
          series: [
            {
              name: '非遗类型',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 20,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: data.data.map((item: { category: string; count: number }) => ({
                value: item.count,
                name: item.category
              }))
            }
          ]
        }
        chart.setOption(option)

        // 添加点击事件，跳转到详情页面
        chart.on('click', (params: any) => {
          if (params.data && params.data.name) {
            const category = params.data.name
            // 跳转到非遗列表页面，传递城市、省份和分类参数
            router.push({
              name: 'heritage',
              query: {
                city: selectedCity.value,
                province: selectedProvince.value,
                category: category
              }
            })
            // 关闭侧边栏
            closeModal()
          }
        })

        // 响应式调整
        const resizeObserver = new ResizeObserver(() => {
          chart.resize()
        })
        if (chartContainer.value) {
          resizeObserver.observe(chartContainer.value)
        }
      }
    }, 100)
  } catch (error) {
    console.error('获取分类数据失败:', error)
    alert('获取数据失败')
  }
}

const closeModal = () => {
  showModal.value = false
}

const renderMap = async () => {
  if (!mapContainer.value) return

  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm-zh': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-zh'
        }
      ]
    },
    center: [120, 31],
    zoom: 5.5,
    minZoom: 4,
    maxZoom: 12
  })

  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  map.on('load', async () => {
    const geojson = await loadData()

    map.addSource('yrd-cities', {
      type: 'geojson',
      data: geojson
    })

    map.addLayer({
      id: 'yrd-fill',
      type: 'fill',
      source: 'yrd-cities',
      paint: {
        'fill-color': [
          'step',
          ['get', 'count'],
          '#f0f9e8',
          dynamicThresholds.value[1], '#ccebc5',
          dynamicThresholds.value[2], '#a8ddb5',
          dynamicThresholds.value[3], '#7bccc4',
          dynamicThresholds.value[4], '#2b8cbe'
        ] as mapboxgl.Expression,
        'fill-opacity': 0.65
      }
    })

    map.addLayer({
      id: 'yrd-outline',
      type: 'line',
      source: 'yrd-cities',
      paint: {
        'line-color': '#666',
        'line-width': 0.6
      }
    })

    // 双击事件
    map.on('dblclick', 'yrd-fill', (e: any) => {
      const feature = e.features && e.features[0]
      if (feature) {
        showCategoryChart(feature.properties?.name || '', feature.properties?.province || '')
      }
    })

    map.on('mousemove', 'yrd-fill', (e: any) => {
      const feature = e.features && e.features[0]
      if (feature) {
        map.getCanvas().style.cursor = 'pointer'
        hoveredCity.value = {
          name: feature.properties?.name || '',
          province: feature.properties?.province || '',
          count: feature.properties?.count || 0
        }
      }
    })

    map.on('mouseleave', 'yrd-fill', () => {
      map.getCanvas().style.cursor = ''
      hoveredCity.value = null
    })
  })

  mapInstance.value = map
}

const resetView = () => {
  mapInstance.value?.flyTo({ center: [120, 31], zoom: 5.5, duration: 1200 })
}

onMounted(() => {
  renderMap().catch(err => console.error('地图加载失败', err))
})

onUnmounted(() => {
  mapInstance.value?.remove()
  mapInstance.value = null
})
</script>


<style scoped>
.map-container {
  min-width: 1400px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#mapbox-container {
  width: 100%;
  height: 100%;
}

.toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  max-width: 250px;
}

.stat-item {
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  color: #2b8cbe;
  font-weight: bold;
  font-size: 15px;
}

.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.legend-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: #333;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
  border: 1px solid #ddd;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  min-width: 200px;
}

.info-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #2f3c4f;
}

.info-row {
  font-size: 12px;
  margin-bottom: 4px;
  color: #666;
}

.info-row span {
  font-weight: 500;
  color: #333;
}

/* 右侧面板样式 */
.side-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 380px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.side-panel.active {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.panel-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-close:hover {
  color: #333;
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>

