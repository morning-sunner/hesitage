<template>
  <div class="map-view-container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- MapBox 地图容器 -->
    <div class="map-container" ref="mapContainer"></div>

    <!-- 左侧工具栏 -->
    <div class="toolbar">
      <!-- 地图工具 -->
      <div class="toolbar-group">
        <h3>🗺️ 地图工具</h3>
        <button class="toolbar-btn" @click="toggleHeatmap" :class="{ active: showHeatmap }" title="显示/隐藏热力图">
          <span>🔥</span> 热力图
        </button>
        <button class="toolbar-btn" @click="resetMap" title="重置地图视图">
          <span>↺</span> 重置视图
        </button>
      </div>

      <!-- 省份选择 -->
      <div class="toolbar-group">
        <h3>🏘️ 省份选择</h3>
        <div class="province-list">
          <button
            v-for="prov in provinces"
            :key="prov.province"
            :class="['province-btn', { active: selectedProvince === prov.province }]"
            @click="zoomToProvince(prov)"
            :title="`${prov.province} - ${prov.heritage_count}项非遗`"
          >
            <span class="prov-name">{{ prov.province }}</span>
            <span class="prov-count">{{ prov.heritage_count }}</span>
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="toolbar-group">
        <h3>📊 统计信息</h3>
        <div class="stat-box" v-if="selectedProvince && selectedProvinceStat">
          <div class="stat-item">
            <span class="stat-label">{{ selectedProvince }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">非遗项目数</span>
            <span class="stat-value">{{ selectedProvinceStat.heritage_count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">覆盖城市数</span>
            <span class="stat-value">{{ selectedProvinceStat.city_count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缩放级别</span>
            <span class="stat-value">{{ selectedProvinceStat.zoom }}</span>
          </div>
        </div>
        <div v-else class="stat-box">
          <div class="stat-item">
            <span class="stat-label">总非遗项目数</span>
            <span class="stat-value">{{ totalHeritage }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">覆盖省份数</span>
            <span class="stat-value">{{ provinces.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">覆盖城市数</span>
            <span class="stat-value">{{ totalCities }}</span>
          </div>
        </div>
      </div>

      <!-- 热力图说明 -->
      <div class="toolbar-group" v-if="showHeatmap">
        <h3>🌡️ 热力说明</h3>
        <div class="heatmap-legend">
          <div class="legend-item high">
            <span class="legend-color"></span>
            <span class="legend-text">非遗多</span>
          </div>
          <div class="legend-item medium">
            <span class="legend-color"></span>
            <span class="legend-text">非遗中</span>
          </div>
          <div class="legend-item low">
            <span class="legend-color"></span>
            <span class="legend-text">非遗少</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧信息面板 -->
    <div class="info-panel" v-if="hoveredCity">
      <div class="panel-header">
        <h3>{{ hoveredCity.city_name }}</h3>
        <p class="panel-province">{{ hoveredCity.province }}</p>
      </div>
      <div class="panel-content">
        <div class="info-item">
          <span class="info-label">非遗项目数：</span>
          <span class="info-value">{{ hoveredCity.heritage_count }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">涵盖分类：</span>
          <span class="info-value">{{ hoveredCity.category_count }}</span>
        </div>
        <div class="info-item" v-if="hoveredCity.categories">
          <span class="info-label">主要分类：</span>
          <span class="info-value category-list">
            <span v-for="cat in hoveredCity.categories.split('|').slice(0, 3)" :key="cat" class="category-tag">
              {{ cat }}
            </span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">地理坐标：</span>
          <span class="info-value">{{ hoveredCity.center_lng.toFixed(2) }}, {{ hoveredCity.center_lat.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox 配置
mapboxgl.accessToken = 'pk.eyJ1IjoiemhhbmdzdW4iLCJhIjoiY2twdDZ4ZGMwMDEzYzJ1bzBpYWo1NHd6cCJ9.w-v5YZX9zQEg0nHRKz49jQ'

// 响应式数据
const mapContainer = ref(null)
let map = null
const showHeatmap = ref(true)
const selectedProvince = ref(null)
const hoveredCity = ref(null)
const provinces = ref([])
const provinceBounds = ref({})

// 计算属性
const selectedProvinceStat = computed(() => {
  if (!selectedProvince.value) return null
  return provinceBounds.value[selectedProvince.value] || null
})

const totalHeritage = computed(() => {
  return provinces.value.reduce((sum, p) => sum + p.heritage_count, 0)
})

const totalCities = computed(() => {
  return provinces.value.reduce((sum, p) => sum + p.city_count, 0)
})

// 初始化地图
onMounted(async () => {
  // 初始化 Mapbox 地图
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/light-v10',
    center: [120.0, 30.0],
    zoom: 5.5,
    pitch: 0,
    bearing: 0
  })

  // 地图加载完成后添加图层
  map.on('load', async () => {
    // 添加缩放控制器
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // 加载热力图数据
    await loadHeatmapData()

    // 加载省份边界数据
    await loadProvinceBounds()
  })

  // 鼠标移动事件 - 用于悬停城市
  map.on('mousemove', 'heatmap-layer', (e) => {
    if (e.features.length > 0) {
      const feature = e.features[0]
      hoveredCity.value = feature.properties
    }
  })

  map.on('mouseleave', 'heatmap-layer', () => {
    hoveredCity.value = null
  })

  // 点击城市事件
  map.on('click', 'heatmap-layer', (e) => {
    if (e.features.length > 0) {
      const feature = e.features[0]
      const props = feature.properties
      // 跳转到非遗详情页面
      console.log('点击城市:', props.city_name)
    }
  })

  // 鼠标指针样式
  map.on('mouseenter', 'heatmap-layer', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'heatmap-layer', () => {
    map.getCanvas().style.cursor = ''
  })
})

// 加载热力图数据
async function loadHeatmapData() {
  try {
    const response = await fetch('http://localhost:3000/api/spatial/heatmap-data')
    const result = await response.json()

    if (!result.success) {
      console.error('加载热力图数据失败:', result.message)
      return
    }

    // 准备 GeoJSON 数据
    const features = result.data.map(item => ({
      type: 'Feature',
      properties: {
        ...item,
        // 将 count 标准化到 0-100 用于热力图
        intensity: Math.min(item.heritage_count / 5, 100)
      },
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(item.center_lng), parseFloat(item.center_lat)]
      }
    }))

    const geojson = {
      type: 'FeatureCollection',
      features
    }

    // 添加数据源
    map.addSource('heatmap-source', {
      type: 'geojson',
      data: geojson
    })

    // 添加热力图图层
    map.addLayer({
      id: 'heatmap-layer',
      type: 'circle',
      source: 'heatmap-source',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'heritage_count'],
          0, 5,
          50, 30
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'heritage_count'],
          0, '#ffeda0',
          10, '#fed976',
          20, '#fecc5c',
          30, '#fd8d3c',
          40, '#f03b20',
          50, '#bd0026'
        ],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    })

    // 添加标签图层
    map.addLayer({
      id: 'heatmap-labels',
      type: 'symbol',
      source: 'heatmap-source',
      layout: {
        'text-field': ['get', 'heritage_count'],
        'text-size': 12,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#000',
        'text-opacity': 0.8
      }
    })

    console.log('热力图数据加载成功:', features.length)
  } catch (error) {
    console.error('加载热力图数据出错:', error)
  }
}

// 加载省份边界数据
async function loadProvinceBounds() {
  try {
    const response = await fetch('http://localhost:3000/api/spatial/province-bounds')
    const result = await response.json()

    if (!result.success) {
      console.error('加载省份边界失败:', result.message)
      return
    }

    // 保存省份数据和边界信息
    provinces.value = result.data
    result.data.forEach(item => {
      provinceBounds.value[item.province] = item
    })

    console.log('省份边界数据加载成功:', provinces.value)
  } catch (error) {
    console.error('加载省份边界数据出错:', error)
  }
}

// 缩放到指定省份
function zoomToProvince(province) {
  selectedProvince.value = province.province

  // 获取省份边界信息
  const bounds = province.bounds
  const center = province.center
  const zoom = province.zoom

  // 飞到指定位置
  map.flyTo({
    center: center,
    zoom: zoom,
    duration: 1500,
    essential: true
  })
}

// 重置地图
function resetMap() {
  selectedProvince.value = null
  hoveredCity.value = null

  map.flyTo({
    center: [120.0, 30.0],
    zoom: 5.5,
    duration: 1500,
    essential: true
  })
}

// 切换热力图显示
function toggleHeatmap() {
  showHeatmap.value = !showHeatmap.value

  if (map && map.getLayer('heatmap-layer')) {
    map.setLayoutProperty(
      'heatmap-layer',
      'visibility',
      showHeatmap.value ? 'visible' : 'none'
    )
    map.setLayoutProperty(
      'heatmap-labels',
      'visibility',
      showHeatmap.value ? 'visible' : 'none'
    )
  }
}

// 清理资源
onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.map-view-container {
  position: relative;
  width: 100%;
  height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.map-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

/* 工具栏样式 */
.toolbar {
  position: absolute;
  left: 20px;
  top: 80px;
  width: 280px;
  max-height: 80vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 16px;
  overflow-y: auto;
  z-index: 10;
}

.toolbar-group {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.toolbar-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.toolbar-group h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.toolbar-btn {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  text-align: left;
}

.toolbar-btn:hover {
  background: #f5f5f5;
  border-color: #c0a876;
}

.toolbar-btn.active {
  background: #c0a876;
  color: white;
  border-color: #c0a876;
}

/* 省份列表 */
.province-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.province-btn {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.province-btn:hover {
  background: #fafafa;
  border-color: #c0a876;
}

.province-btn.active {
  background: #c0a876;
  color: white;
  border-color: #c0a876;
}

.prov-name {
  font-weight: 500;
}

.prov-count {
  font-size: 12px;
  opacity: 0.8;
}

/* 统计框样式 */
.stat-box {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  color: #c0a876;
  font-weight: 600;
  font-size: 16px;
}

/* 热力图图例 */
.heatmap-legend {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-item.high .legend-color {
  background: #bd0026;
}

.legend-item.medium .legend-color {
  background: #fd8d3c;
}

.legend-item.low .legend-color {
  background: #ffeda0;
}

/* 信息面板样式 */
.info-panel {
  position: absolute;
  right: 20px;
  top: 80px;
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 10;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.panel-header {
  background: linear-gradient(135deg, #c0a876 0%, #a68860 100%);
  color: white;
  padding: 16px;
  border-bottom: 2px solid #8b7355;
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.panel-province {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.panel-content {
  padding: 16px;
  font-size: 13px;
  color: #666;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  line-height: 1.5;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
  margin-right: 8px;
}

.info-value {
  color: #c0a876;
  font-weight: 600;
  text-align: right;
  flex: 1;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-tag {
  display: inline-block;
  background: #fff3e0;
  color: #c0a876;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
}

/* 滚动条美化 */
.toolbar::-webkit-scrollbar {
  width: 6px;
}

.toolbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.toolbar::-webkit-scrollbar-thumb {
  background: rgba(194, 158, 109, 0.5);
  border-radius: 3px;
}

.toolbar::-webkit-scrollbar-thumb:hover {
  background: rgba(194, 158, 109, 0.8);
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    width: 200px;
    left: 10px;
  }

  .info-panel {
    width: 200px;
    right: 10px;
  }

  .toolbar-btn,
  .province-btn {
    font-size: 12px;
    padding: 6px 8px;
  }
}
</style>
