<template>
  <div class="map-view-container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- ECharts 地图容器 -->
    <div class="map-wrapper">
      <YtRegionMap ref="mapRef" />
      
      <!-- 左侧工具栏 -->
      <div class="toolbar">
        <div class="toolbar-group">
          <h3>地图工具</h3>
          <button class="toolbar-btn" @click="toggleLabels" :class="{ active: showLabels }" title="切换标签显示">
            <span>🏷️</span> 显示标签
          </button>
          <button class="toolbar-btn" @click="resetMap" title="重置地图视图">
            <span>↺</span> 重置视图
          </button>
        </div>

        <div class="toolbar-group">
          <h3>地区选择</h3>
          <div class="region-list">
            <button
              v-for="region in regions"
              :key="region.id"
              :class="['region-btn', { active: selectedRegion === region.id }]"
              @click="focusRegion(region.id)"
            >
              {{ region.name }}
            </button>
          </div>
        </div>

        <div class="toolbar-group">
          <h3>数据统计</h3>
          <div class="stat-box">
            <div class="stat-item">
              <span class="stat-label">总非遗项目</span>
              <span class="stat-value">45</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">江苏省</span>
              <span class="stat-value">12</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">浙江省</span>
              <span class="stat-value">15</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">安徽省</span>
              <span class="stat-value">8</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">上海市</span>
              <span class="stat-value">10</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <div class="panel-title">长三角非遗概览</div>
        <div class="panel-content">
          <p>长三角地区是中国非遗文化最丰富的区域之一，汇聚了众多传统工艺、民俗文化和表演艺术。</p>
          <p style="margin-top: 10px; font-size: 12px; color: #999;">
            📍 点击左侧区域按钮快速导航<br/>
            🔍 鼠标缩放和拖拽来浏览地图
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import YtRegionMap from '../components/YtRegionMap.vue'

const mapRef = ref()
const showLabels = ref(false)
const selectedRegion = ref('all')

const regions = [
  { id: 'all', name: '全部区域' },
  { id: 'jiangsu', name: '江苏' },
  { id: 'zhejiang', name: '浙江' },
  { id: 'anhui', name: '安徽' },
  { id: 'shanghai', name: '上海' }
]

const regionCoordinates = {
  all: { center: [119.5, 31.5], zoom: 5 },
  jiangsu: { center: [118.8, 32.9], zoom: 7 },
  zhejiang: { center: [120.2, 30.3], zoom: 7 },
  anhui: { center: [117.2, 31.9], zoom: 6 },
  shanghai: { center: [121.5, 31.3], zoom: 9 }
}

function focusRegion(regionId: string) {
  selectedRegion.value = regionId
  const coords = regionCoordinates[regionId as keyof typeof regionCoordinates]
  
  if (mapRef.value?.chart) {
    mapRef.value.chart.dispatchAction({
      type: 'geoRoam',
      componentType: 'geo',
      dx: 0,
      dy: 0
    })
    
    mapRef.value.chart.setOption({
      geo: {
        center: coords.center,
        zoom: coords.zoom
      }
    })
  }
}

function toggleLabels() {
  showLabels.value = !showLabels.value
  if (mapRef.value?.chart) {
    mapRef.value.chart.setOption({
      geo: {
        label: {
          show: showLabels.value
        }
      }
    })
  }
}

function resetMap() {
  focusRegion('all')
  showLabels.value = false
}
</script>

<style scoped>
.map-view-container {
  min-width: 1400px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #faf6f2;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 左侧工具栏 */
.toolbar {
  position: absolute;
  top: 100px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  z-index: 10;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  width: 200px;
}

.toolbar-group {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.toolbar-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.toolbar-group h3 {
  font-size: 13px;
  font-weight: 700;
  color: #3a2618;
  margin: 0 0 10px 0;
  padding: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 6px;
  background: rgba(240, 230, 214, 0.5);
  border: 1px solid rgba(194, 158, 109, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #3a2618;
  font-weight: 600;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(194, 158, 109, 0.2);
  transform: translateY(-1px);
}

.toolbar-btn.active {
  background: rgba(194, 158, 109, 0.3);
  border-color: rgba(194, 158, 109, 0.6);
  color: #8b6f47;
  font-weight: 700;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.region-btn {
  padding: 8px 10px;
  background: rgba(240, 230, 214, 0.5);
  border: 1px solid rgba(194, 158, 109, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #3a2618;
  font-weight: 600;
  transition: all 0.2s ease;
}

.region-btn:hover {
  background: rgba(194, 158, 109, 0.2);
  transform: translateY(-1px);
}

.region-btn.active {
  background: #d4a574;
  border-color: #c9916f;
  color: #fff;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 8px;
  background: rgba(212, 165, 116, 0.1);
  border-radius: 6px;
}

.stat-label {
  color: #666;
  font-weight: 600;
}

.stat-value {
  color: #d4a574;
  font-weight: 700;
  font-size: 14px;
}

/* 右侧信息面板 */
.info-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  z-index: 10;
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #3a2618;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #d4a574;
}

.panel-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.panel-content p {
  margin: 0;
}

/* 滚动条美化 */
.toolbar::-webkit-scrollbar,
.info-panel::-webkit-scrollbar {
  width: 6px;
}

.toolbar::-webkit-scrollbar-track,
.info-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.toolbar::-webkit-scrollbar-thumb,
.info-panel::-webkit-scrollbar-thumb {
  background: rgba(194, 158, 109, 0.5);
  border-radius: 3px;
}

.toolbar::-webkit-scrollbar-thumb:hover,
.info-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(194, 158, 109, 0.8);
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    width: 150px;
    padding: 12px;
  }

  .info-panel {
    width: 200px;
    padding: 12px;
  }

  .toolbar-btn,
  .region-btn {
    font-size: 12px;
    padding: 6px 8px;
  }
}
</style>
