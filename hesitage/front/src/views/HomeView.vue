<template>
  <div class="container">
    <!-- 导航栏 -->
    <NavBar />

    <div class="content-wrapper">

    <!-- 装饰元素 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>
    <img src="/figures/flower.svg" class="decoration-flower" style="top: 80px; right: 50px" alt="装饰花" />

    <!-- 地区选择标签 -->
    <div class="region-tabs">
      <button :class="['region-tab', { active: activeRegion === 'yangtze' }]" @click="activeRegion = 'yangtze'">
        长三角地区
      </button>
      <button
        v-for="province in allProvinces"
        :key="province.id"
        :class="['region-tab', { active: activeRegion === province.id }]"
        @click="activeRegion = province.id"
      >
        {{ province.name }}
      </button>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="bookmark-container">
        <div
          v-for="province in visibleProvinces"
          :key="province.id"
          :class="['bookmark', `bookmark-${province.id}`, { active: activeProvince === province.id }]"
          @click="selectProvince(province.id)"
        >
          <div class="bookmark-title">{{ province.name }}</div>
          <img :src="province.map" :alt="`${province.name}地图`" class="bookmark-map" />
          <div class="bookmark-stats" v-show="activeProvince === province.id">
            <div class="stats-card">
              <div class="stats-numbers">
                <div class="stat-item">
                  <div class="stat-number">{{ province.projectCount }}</div>
                  <div class="stat-label">非遗项目</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ province.worldHeritage }}</div>
                  <div class="stat-label">世界遗产</div>
                </div>
              </div>
              <button class="explore-btn" @click.stop="exploreProvince(province.id)">
                探索{{ province.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- 向下箭头按钮 -->
      <router-link to="/map" class="scroll-down-btn" title="查看地图分布">
        <span class="arrow-icon">↓</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHeritageStore } from '../stores/heritageStore'
import { animateNumber } from '../utils/common'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const heritageStore = useHeritageStore()

const activeRegion = ref('yangtze')
const activeProvince = ref('jiangsu')

const allProvinces = computed(() => heritageStore.getAllProvinces())

const visibleProvinces = computed(() => {
  if (activeRegion.value === 'yangtze') {
    return allProvinces.value
  }
  return allProvinces.value.filter((p) => p.id === activeRegion.value)
})

const selectProvince = (provinceId: string) => {
  activeProvince.value = provinceId
}

const exploreProvince = (provinceId: string) => {
  router.push({
    name: 'map',
    query: { province: provinceId }
  })
}

onMounted(() => {
  activeProvince.value = 'jiangsu'
})
</script>

<style scoped>
/* 主内容区域 */
.main-content {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
  align-items: flex-start;
  min-width:1400px;
  max-width: 100%;
}

/* 书签展示区 */
.bookmark-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  position: relative;
  height: 600px;
  /* max-width: 1400px; */
  width: 100%;
}

.bookmark {
  height: 550px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  position: relative;
  cursor: pointer;
  flex: 0.8;
  transition: flex 0.7s ease-in-out, transform 0.3s;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.bookmark:hover {
  transform: translateY(-5px);
}

.bookmark.active {
  flex: 4;
  transform: translateY(0);
}

.bookmark::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 30px;
  background: rgba(139, 90, 43, 0.8);
  clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
  z-index: 2;
}

.bookmark-map {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 70%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
  pointer-events: none;
}

.bookmark.active .bookmark-map {
  opacity: 0.9;
  pointer-events: auto;
}

.bookmark-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 48px;
  font-weight: bold;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6);
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
  letter-spacing: 8px;
}

.bookmark.active .bookmark-title {
  opacity: 0;
}

.bookmark-stats {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  padding: 0 30px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s ease 0.3s;
  z-index: 3;
}

.bookmark.active .bookmark-stats {
  opacity: 1;
  transform: translateY(0);
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.stats-numbers {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #8b5a2b;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.explore-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #8b5a2b, #a67c52);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.explore-btn:hover {
  background: linear-gradient(135deg, #6d4521, #8b5a2b);
  transform: translateY(-2px);
}

.bookmark-jiangsu {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.6), rgba(255, 159, 64, 0.6));
}

.bookmark-zhejiang {
  background: linear-gradient(135deg, rgba(72, 219, 251, 0.6), rgba(118, 184, 255, 0.6));
}

.bookmark-anhui {
  background: linear-gradient(135deg, rgba(162, 155, 254, 0.6), rgba(181, 131, 250, 0.6));
}

.bookmark-shanghai {
  background: linear-gradient(135deg, rgba(255, 183, 77, 0.6), rgba(255, 143, 64, 0.6));
}

.circle-1 {
  top: 100px;
  right: 100px;
}

.circle-2 {
  bottom: 150px;
  left: 120px;
}

/* 响应式优化 */
@media (max-width: 1024px) {
  .bookmark-container {
    height: 500px;
  }

  .bookmark {
    height: 450px;
  }

  .bookmark-title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .bookmark-container {
    flex-direction: column;
    height: auto;
  }

  .bookmark {
    width: 100%;
    height: 300px;
  }
}
</style>
