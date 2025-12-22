<template>
  <div class="map-view-container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 地图容器 -->
    <div class="map-wrapper">
      <div ref="mapContainer" id="map" class="mapbox-map"></div>

      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-group">
          <h3>地图工具</h3>
          <button class="toolbar-btn" @click="toggleProvinceLayer" title="切换省份图层">
            <span>🗺️</span> 省份图层
          </button>
          <button class="toolbar-btn" @click="toggleHeritageLayers" title="切换非遗项目">
            <span>🎭</span> 非遗项目
          </button>
        </div>

        <div class="toolbar-group">
          <h3>查询功能</h3>
          <button class="toolbar-btn" @click="startPointQuery" :class="{ active: queryMode === 'point' }">
            <span>📍</span> 点查询
          </button>
          <button class="toolbar-btn" @click="startCircleQuery" :class="{ active: queryMode === 'circle' }">
            <span>⭕</span> 圆形查询
          </button>
        </div>

        <div class="toolbar-group">
          <h3>统计分析</h3>
          <button class="toolbar-btn" @click="showStatistics">
            <span>📊</span> 统计分析
          </button>
        </div>

        <div class="toolbar-group">
          <h3>底图切换</h3>
          <select v-model="currentStyle" @change="changeMapStyle" class="style-select">
            <option value="streets">街道图</option>
            <option value="satellite">卫星图</option>
            <option value="terrain">地形图</option>
            <option value="light">浅色图</option>
            <option value="dark">深色图</option>
          </select>
        </div>
      </div>

      <!-- 左侧面板 - 地区选择 -->
      <div class="left-panel">
        <div class="panel-title">地区选择</div>
        <div class="province-list">
          <button
            v-for="province in provinces"
            :key="province.id"
            :class="['province-btn', { active: selectedProvince === province.id }]"
            @click="filterByProvince(province.id)"
          >
            {{ province.name }}
          </button>
        </div>
      </div>

      <!-- 右侧面板 - 查询结果 -->
      <div class="right-panel" v-if="showResultPanel">
        <div class="panel-title">
          查询结果
          <button class="close-btn" @click="showResultPanel = false">✕</button>
        </div>
        <div class="result-content">
          <div v-if="queryResults.length === 0" class="no-results">
            没有找到相关项目
          </div>
          <div v-else class="results-list">
            <div
              v-for="item in queryResults"
              :key="item.id"
              class="result-item"
              @click="highlightFeature(item)"
            >
              <h4>{{ item.name }}</h4>
              <p class="category">{{ item.category }}</p>
              <p class="location">{{ item.location }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部统计面板 -->
      <div class="bottom-panel" v-if="showStatisticsPanel">
        <div class="panel-title">
          统计分析
          <button class="close-btn" @click="showStatisticsPanel = false">✕</button>
        </div>
        <div class="statistics-content">
          <div class="stat-item">
            <span class="stat-label">总项目数：</span>
            <span class="stat-value">{{ statistics.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">按分类统计：</span>
          </div>
          <div class="category-stats">
            <div v-for="cat in statistics.byCategory" :key="cat.category" class="cat-stat">
              <span>{{ cat.category }}：</span>
              <span class="count">{{ cat.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图信息显示 -->
      <div class="map-info">
        <div class="info-item">
          <span>坐标：</span>
          <span>{{ mapInfo.lng.toFixed(4) }}, {{ mapInfo.lat.toFixed(4) }}</span>
        </div>
        <div class="info-item">
          <span>缩放：</span>
          <span>{{ mapInfo.zoom.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import mapboxgl, { MapMouseEvent } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import NavBar from '../components/NavBar.vue'

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbnlhbmd6aHUiLCJhIjoiY21qZ3gyd3NlMTd1YjNjb3JqNDNyb3Y5eSJ9.eVPOmxIjsx1Zm2DRZSAUqw'

// 定义非遗项目的数据结构类型
interface HeritageItem {
  id: number
  name: string
  category: string
  location: string
  lng: number
  lat: number
}

// 地图实例
let mapInstance: mapboxgl.Map | null = null
const mapContainer = ref<HTMLElement | null>(null)

// 数据
const provinces = ref([
  { id: 'all', name: '全部地区' },
  { id: 'jiangsu', name: '江苏' },
  { id: 'zhejiang', name: '浙江' },
  { id: 'shanghai', name: '上海' },
  { id: 'anhui', name: '安徽' },
])

// 非遗项目数据
const heritageItems = ref<HeritageItem[]>([
  { id: 1, name: '昆曲', category: '传统戏剧', location: '苏州', lng: 120.595, lat: 31.299 },
  { id: 2, name: '苏州园林', category: '传统建筑', location: '苏州', lng: 120.6, lat: 31.3 },
  { id: 3, name: '杭州丝绸', category: '工艺美术', location: '杭州', lng: 120.155, lat: 30.274 },
  { id: 4, name: '宣纸制作', category: '传统技艺', location: '宣城', lng: 118.757, lat: 30.945 },
  { id: 5, name: '越剧', category: '传统戏剧', location: '绍兴', lng: 120.583, lat: 30.003 },
  { id: 6, name: '徽墨制作', category: '传统技艺', location: '黄山', lng: 118.307, lat: 30.137 },
  { id: 7, name: '龙泉青瓷', category: '工艺美术', location: '龙泉', lng: 119.169, lat: 28.031 },
])

// UI 状态
const currentStyle = ref('streets')
const selectedProvince = ref('all')
const queryMode = ref<'point' | 'circle' | null>(null)
const showResultPanel = ref(false)
const showStatisticsPanel = ref(false)
const queryResults = ref<HeritageItem[]>([])

// 地图信息
const mapInfo = ref({
  lng: 120,
  lat: 31,
  zoom: 7,
})

// 统计数据
const statistics = computed(() => {
  const filtered = selectedProvince.value === 'all' 
    ? heritageItems.value 
    : heritageItems.value // 实际应该按省份过滤
  
  const byCategory = [
    { category: '传统戏剧', count: filtered.filter(i => i.category === '传统戏剧').length },
    { category: '工艺美术', count: filtered.filter(i => i.category === '工艺美术').length },
    { category: '传统技艺', count: filtered.filter(i => i.category === '传统技艺').length },
    { category: '传统建筑', count: filtered.filter(i => i.category === '传统建筑').length },
  ]
  
  return {
    total: filtered.length,
    byCategory: byCategory.filter(c => c.count > 0),
  }
})

// 初始化地图
onMounted(() => {
  if (!mapContainer.value) return

  mapInstance = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [120.5, 31.5],
    zoom: 7,
  })

  if (!mapInstance) return

  // 地图加载完成
  mapInstance.on('load', () => {
    if (!mapInstance) return

    // 添加非遗项目源
    if (!mapInstance.getSource('heritage-sites')) {
      mapInstance.addSource('heritage-sites', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: heritageItems.value.map(item => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [item.lng, item.lat],
            },
            properties: {
              id: item.id,
              name: item.name,
              category: item.category,
              location: item.location,
            },
          })),
        },
      } as any)
    }

    // 添加标记层
    if (!mapInstance.getLayer('heritage-points')) {
      mapInstance.addLayer({
        id: 'heritage-points',
        type: 'circle',
        source: 'heritage-sites',
        paint: {
          'circle-radius': 8,
          'circle-color': '#d4a574',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })
    }

    // 添加标签层
    if (!mapInstance.getLayer('heritage-labels')) {
      mapInstance.addLayer({
        id: 'heritage-labels',
        type: 'symbol',
        source: 'heritage-sites',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#5a4f45',
          'text-halo-color': '#fff',
          'text-halo-width': 1,
        },
      })
    }

    // 点击事件
    mapInstance.on('click', 'heritage-points', (e: MapMouseEvent) => {
      if (queryMode.value !== 'point' || !e.features || e.features.length === 0) {
        return
      }
      const feature = e.features[0]
      if (feature && feature.properties) {
        queryResults.value = heritageItems.value.filter(
          item => item.id === (feature.properties as any).id
        )
        showResultPanel.value = true
      }
    })

    // 鼠标悬停效果
    mapInstance.on('mouseenter', 'heritage-points', () => {
      if (mapInstance) {
        mapInstance.getCanvas().style.cursor = 'pointer'
      }
    })
    mapInstance.on('mouseleave', 'heritage-points', () => {
      if (mapInstance) {
        mapInstance.getCanvas().style.cursor = ''
      }
    })
  })

  // 地图移动时更新坐标信息
  mapInstance.on('move', () => {
    if (!mapInstance) return
    const center = mapInstance.getCenter()
    mapInfo.value.lng = center.lng
    mapInfo.value.lat = center.lat
    mapInfo.value.zoom = mapInstance.getZoom()
  })

  mapInstance.scrollZoom.enable()
})

// 组件卸载时销毁地图实例，防止内存泄漏
onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

// 方法
const changeMapStyle = () => {
  const styleMap: Record<string, string> = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    terrain: 'mapbox://styles/mapbox/outdoors-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
  }
  if (mapInstance) {
    const styleUrl = styleMap[currentStyle.value]
    if (styleUrl) {
      mapInstance.setStyle(styleUrl)
      // 监听样式加载完成事件，重新添加数据源和图层
      mapInstance.once('style.load', () => {
        if (!mapInstance) return
        if (!mapInstance.getSource('heritage-sites')) {
          mapInstance.addSource('heritage-sites', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: heritageItems.value.map(item => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [item.lng, item.lat],
                },
                properties: {
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  location: item.location,
                },
              })),
            },
          } as any)
        }
        if (!mapInstance.getLayer('heritage-points')) {
          mapInstance.addLayer({
            id: 'heritage-points',
            type: 'circle',
            source: 'heritage-sites',
            paint: {
              'circle-radius': 8,
              'circle-color': '#d4a574',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
            },
          })
        }
        if (!mapInstance.getLayer('heritage-labels')) {
          mapInstance.addLayer({
            id: 'heritage-labels',
            type: 'symbol',
            source: 'heritage-sites',
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 12,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': '#5a4f45',
              'text-halo-color': '#fff',
              'text-halo-width': 1,
            },
          })
        }
      })
    }
  }
}

const toggleProvinceLayer = () => {
  console.log('切换省份图层')
}

const toggleHeritageLayers = () => {
  if (mapInstance && mapInstance.getLayer('heritage-points')) {
    const visibility = mapInstance.getLayoutProperty('heritage-points', 'visibility')
    mapInstance.setLayoutProperty('heritage-points', 'visibility', visibility === 'visible' ? 'none' : 'visible')
    mapInstance.setLayoutProperty('heritage-labels', 'visibility', visibility === 'visible' ? 'none' : 'visible')
  }
}

const startPointQuery = () => {
  queryMode.value = queryMode.value === 'point' ? null : 'point'
}

const startCircleQuery = () => {
  queryMode.value = queryMode.value === 'circle' ? null : 'circle'
}

const showStatistics = () => {
  showStatisticsPanel.value = !showStatisticsPanel.value
}

const filterByProvince = (provinceId: string) => {
  selectedProvince.value = provinceId
}

const highlightFeature = (item: HeritageItem) => {
  if (mapInstance) {
    mapInstance.flyTo({
      center: [item.lng, item.lat],
      zoom: 12,
    })
  }
}
</script>

<style scoped>
.map-view-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.mapbox-map {
  width: 100%;
  height: 100%;
}

/* 工具栏 */
.toolbar {
  position: absolute;
  top: 100px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 500px;
  overflow-y: auto;
  width: 180px;
}

.toolbar-group {
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.toolbar-group:last-child {
  border-bottom: none;
}

.toolbar-group h3 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #4a3f35;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toolbar-btn {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #5a4f45;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.toolbar-btn:hover {
  background: linear-gradient(135deg, #d4a574 0%, #c8956a 100%);
  color: #fff;
  border-color: #d4a574;
}

.toolbar-btn.active {
  background: linear-gradient(135deg, #d4a574 0%, #c8956a 100%);
  color: #fff;
}

.style-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #5a4f45;
  font-size: 12px;
  cursor: pointer;
}

/* 左侧面板 */
.left-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 160px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #4a3f35;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
}

.province-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.province-btn {
  padding: 8px;
  background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #5a4f45;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.province-btn:hover,
.province-btn.active {
  background: linear-gradient(135deg, #d4a574 0%, #c8956a 100%);
  color: #fff;
  border-color: #d4a574;
}

/* 右侧面板 - 结果 */
.right-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.result-content {
  max-height: 350px;
  overflow-y: auto;
}

.no-results {
  text-align: center;
  color: #999;
  padding: 20px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  padding: 10px;
  background: rgba(212, 165, 116, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.result-item:hover {
  background: rgba(212, 165, 116, 0.2);
  transform: translateX(4px);
}

.result-item h4 {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #4a3f35;
}

.result-item .category,
.result-item .location {
  margin: 0;
  font-size: 11px;
  color: #999;
}

/* 底部统计面板 */
.bottom-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-width: 280px;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #5a4f45;
}

.stat-value {
  font-weight: 600;
  color: #d4a574;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cat-stat {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #5a4f45;
}

.cat-stat .count {
  font-weight: 600;
  color: #d4a574;
}

/* 地图信息 */
.map-info {
  position: absolute;
  bottom: 20px;
  right: 330px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  font-size: 11px;
  color: #5a4f45;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    width: 150px;
    max-height: 400px;
  }

  .left-panel,
  .right-panel,
  .bottom-panel,
  .map-info {
    max-width: 90%;
  }
}
</style>
