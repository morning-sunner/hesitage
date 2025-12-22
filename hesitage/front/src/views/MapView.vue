<template>
  <div class="container">
    <!-- 头部 -->
    <header>
      <div class="logo">
        <div class="logo-icon">长三角<br />非遗</div>
        <div class="logo-text">长三角非物质文化遗产平台</div>
      </div>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/map" class="active">地图分布</router-link>
        <router-link to="/chat">AI助手</router-link>
      </nav>
      <div class="user-info">
        <img src="/figures/user-avatar.svg" alt="用户头像" class="user-avatar" />
        <span>游客</span>
      </div>
    </header>

    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span>›</span>
      <span>非遗文化</span>
      <span>›</span>
      <span class="current">{{ currentProvince?.name }}</span>
    </div>

    <!-- 装饰元素 -->
    <img src="/figures/flower.svg" class="decoration-flower" style="top: 80px; right: 40px" alt="装饰花" />

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 左侧地图区域 -->
      <div class="map-section">
        <!-- 文化背景介绍 -->
        <div class="cultural-intro">
          <h4>文化背景</h4>
          <p>{{ currentProvince?.culturalBackground }}</p>
        </div>

        <!-- 省份选择 -->
        <div class="province-tabs">
          <button
            v-for="province in allProvinces"
            :key="province.id"
            :class="['province-tab', { active: currentProvince?.id === province.id }]"
            @click="selectProvince(province.id)"
          >
            {{ province.name }}
          </button>
        </div>

        <!-- 地图容器 -->
        <div class="map-container" id="mapContainer">
          <img :src="currentProvince?.map" alt="省份地图" class="map-image" />
        </div>
      </div>

      <!-- 右侧统计区域 -->
      <div class="stats-section">
        <!-- 省份标题 -->
        <div class="province-title-card">
          <h2 class="province-title">{{ currentProvince?.name }}</h2>
        </div>

        <!-- 统计数据 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ currentProvince?.projectCount }}</div>
            <div class="stat-label">非遗项目</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ currentProvince?.worldHeritage }}</div>
            <div class="stat-label">世界遗产</div>
          </div>
        </div>

        <!-- 非遗项目列表 -->
        <div class="heritage-panel">
          <div class="panel-header">
            <div class="panel-title">代表性项目</div>
            <div class="panel-controls">
              <button class="panel-btn" @click="filterCategory = null">全部</button>
              <button class="panel-btn" @click="filterCategory = 'craft'">传统技艺</button>
              <button class="panel-btn" @click="filterCategory = 'art'">传统艺术</button>
            </div>
          </div>
          <div class="heritage-scroll">
            <div class="heritage-items">
              <div v-for="item in filteredHeritage" :key="item.name" class="heritage-item">
                <img :src="item.icon" :alt="item.name" class="item-icon" />
                <div class="item-name">{{ item.name }}</div>
                <div class="item-description">{{ item.description }}</div>
                <span class="item-category">{{ item.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据图表 -->
        <div class="chart-section">
          <div class="chart-card">
            <div class="chart-title">项目类别分布</div>
            <div class="chart-container">
              <div class="pie-chart" :style="{ background: pieChartGradient }">
                <div class="pie-center">
                  <div class="pie-total">{{ currentProvince?.projectCount }}</div>
                  <div class="pie-label">项目总数</div>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-title">城市分布</div>
            <div class="chart-container">
              <div class="bar-chart">
                <div v-for="city in topCities" :key="city.name" class="bar-item">
                  <div class="bar-label">{{ city.name }}</div>
                  <div class="bar-container">
                    <div class="bar" :style="{ width: getBarWidth(city.heritage) + '%' }">
                      <span class="bar-inner-text">{{ city.heritage }}项</span>
                    </div>
                  </div>
                  <div class="bar-value">{{ city.heritage }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回首页按钮 -->
    <router-link to="/" class="back-to-top" title="返回首页">
      <span class="arrow-up">↑</span>
    </router-link>

    <!-- 城市详情卡片 -->
    <div class="card-overlay" :class="{ show: showCard }" @click="showCard = false"></div>
    <div class="city-detail-card" :class="{ show: showCard }">
      <button class="card-close" @click="showCard = false">×</button>
      <h3 class="card-title">{{ selectedCity?.name }}</h3>
      <div class="card-content">
        <p><strong>非遗项目数量：</strong>{{ selectedCity?.heritage }} 项</p>
        <p><strong>简介：</strong>{{ selectedCity?.description }}</p>
      </div>
    </div>

    <!-- 城市提示框 -->
    <div class="city-tooltip" :style="tooltipStyle">{{ tooltipText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHeritageStore } from '../stores/heritageStore'

const route = useRoute()
const heritageStore = useHeritageStore()

const filterCategory = ref<string | null>(null)
const showCard = ref(false)
const selectedCity = ref<any>(null)
const tooltipText = ref('')
const tooltipStyle = ref<any>({ opacity: 0 })
const maxHeritageCount = ref(0)

const currentProvince = computed(() => {
  const id = route.query.province as string || 'jiangsu'
  return heritageStore.getProvinceData(id)
})

const allProvinces = computed(() => heritageStore.getAllProvinces())

const filteredHeritage = computed(() => {
  const heritage = currentProvince.value?.heritage || []
  if (!filterCategory.value) return heritage.slice(0, 5)
  return heritage.filter((item: any) => item.category?.includes(filterCategory.value))
})

const topCities = computed(() => {
  const cities = currentProvince.value?.cityHotspots || []
  const sorted = [...cities].sort((a: any, b: any) => b.heritage - a.heritage)
  maxHeritageCount.value = sorted[0]?.heritage || 1
  return sorted.slice(0, 5)
})

const pieChartGradient = computed(() => {
  const stats = currentProvince.value?.stats || []
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#95a5a6']
  if (stats.length === 0) return 'conic-gradient(#ccc 0deg 360deg)'
  
  const total = stats.reduce((sum: number, s: any) => sum + s.number, 0)
  let degree = 0
  const stops: string[] = []
  
  stats.forEach((stat: any, index: number) => {
    const color = colors[index % colors.length]
    const percentage = (stat.number / total) * 100
    const nextDegree = degree + (percentage / 100) * 360
    stops.push(`${color} ${degree}deg ${nextDegree}deg`)
    degree = nextDegree
  })
  
  return `conic-gradient(${stops.join(', ')})`
})

const selectProvince = (id: string) => {
  window.history.pushState({}, '', `?province=${id}`)
  window.location.reload()
}

const getBarWidth = (count: number) => {
  return (count / maxHeritageCount.value) * 100
}

const showCityDetail = (city: any) => {
  selectedCity.value = city
  showCard.value = true
}

onMounted(() => {
  // 为城市热点添加事件监听
  const mapContainer = document.getElementById('mapContainer')
  if (mapContainer) {
    const hotspots = currentProvince.value?.cityHotspots || []
    
    hotspots.forEach((city: any) => {
      const dot = document.createElement('div')
      dot.className = `city-hotspot hotspot-${city.level}`
      dot.style.top = city.y + '%'
      dot.style.left = city.x + '%'
      
      dot.addEventListener('mouseenter', () => {
        tooltipText.value = `${city.name} (${city.heritage}项)`
        tooltipStyle.value = { opacity: 1 }
      })
      
      dot.addEventListener('mouseleave', () => {
        tooltipStyle.value = { opacity: 0 }
      })
      
      dot.addEventListener('click', () => {
        showCityDetail(city)
      })
      
      mapContainer.appendChild(dot)
    })
  }
})
</script>

<style scoped>
.map-section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cultural-intro {
  background: rgba(255, 248, 235, 0.8);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid #8b5a2b;
}

.cultural-intro h4 {
  margin-bottom: 10px;
  color: #8b5a2b;
}

.cultural-intro p {
  color: #666;
  line-height: 1.6;
}

.province-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.province-tab {
  padding: 12px 50px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid transparent;
  border-radius: 25px;
  font-size: 18px;
  color: #5a4a3a;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.province-tab:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.province-tab.active {
  background: rgba(212, 153, 143, 0.6);
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-color: #8b5a2b;
}

.map-container {
  position: relative;
  width: 100%;
  flex: 1;
  min-width: 800px;
  min-height: 650px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.city-hotspot {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  animation: pulse 2s infinite;
}

.hotspot-low {
  background: rgba(255, 235, 59, 0.8);
}

.hotspot-medium {
  background: rgba(255, 152, 0, 0.8);
}

.hotspot-high {
  background: rgba(244, 67, 54, 0.8);
}

.city-hotspot:hover {
  transform: scale(1.2);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.province-title-card {
  background: rgba(139, 90, 43, 0.1);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
}

.province-title {
  font-size: 32px;
  font-weight: bold;
  color: #8b5a2b;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #8b5a2b;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.heritage-panel {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-title {
  font-size: 20px;
  font-weight: bold;
  color: #8b5a2b;
}

.panel-controls {
  display: flex;
  gap: 10px;
}

.panel-btn {
  padding: 6px 15px;
  background: rgba(139, 90, 43, 0.1);
  border: 1px solid #8b5a2b;
  border-radius: 15px;
  color: #8b5a2b;
  cursor: pointer;
  font-size: 13px;
}

.panel-btn:hover {
  background: rgba(139, 90, 43, 0.2);
}

.heritage-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.heritage-items {
  display: grid;
  gap: 12px;
}

.heritage-item {
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #8b5a2b;
  transition: all 0.3s;
}

.heritage-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.item-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}

.item-name {
  font-weight: bold;
  color: #5a4a3a;
  margin-bottom: 5px;
  font-size: 15px;
}

.item-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.item-category {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(139, 90, 43, 0.15);
  border-radius: 10px;
  font-size: 11px;
  color: #8b5a2b;
  margin-top: 8px;
}

.chart-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 15px;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
  color: #8b5a2b;
  margin-bottom: 15px;
  text-align: center;
}

.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border-radius: 50%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pie-total {
  font-size: 28px;
  font-weight: bold;
  color: #8b5a2b;
}

.pie-label {
  font-size: 12px;
  color: #666;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
}

.bar-item {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 10px;
}

.bar-label {
  min-width: 80px;
  font-size: 14px;
  color: #5a4a3a;
}

.bar-container {
  position: relative;
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15px;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #8b5a2b, #d4998f);
  border-radius: 15px;
  transition: width 0.5s ease-out;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.bar-inner-text {
  color: #fff;
  font-weight: bold;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-value {
  text-align: right;
  font-weight: bold;
  color: #8b5a2b;
  font-size: 15px;
}

.breadcrumb {
  margin: 20px 0;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
}

.breadcrumb a {
  color: #8b5a2b;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb span {
  margin: 0 8px;
}

.breadcrumb .current {
  color: #5a4a3a;
  font-weight: 500;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
  align-items: start;
}

.card-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.card-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.city-detail-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 90%;
  max-width: 600px;
  background: #fff;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s;
}

.city-detail-card.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: auto;
}

.card-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border: none;
  background: #f44336;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.card-close:hover {
  background: #d32f2f;
}

.card-title {
  font-size: 24px;
  color: #8b5a2b;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #8b5a2b;
}

.card-content {
  max-height: 400px;
  overflow-y: auto;
}

.city-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 100;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .chart-section {
    grid-template-columns: 1fr;
  }
}
</style>
