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
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 10px 28px rgba(0,0,0,0.18);
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

.bookmark::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    radial-gradient(120% 80% at 50% 10%, rgba(255,255,255,0.18), transparent 55%),
    linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.28) 100%);
  z-index: 1;
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

/* 更亮、更柔的“雾化光晕”背景：不扎眼、但有层次 */
.bookmark-jiangsu {
  background:
    radial-gradient(900px circle at 25% 22%, rgba(255, 120, 120, 0.28), transparent 58%),
    radial-gradient(800px circle at 78% 76%, rgba(255, 186, 120, 0.22), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(248,249,252,0.55) 100%);
}

.bookmark-zhejiang {
  background:
    radial-gradient(900px circle at 25% 22%, rgba(90, 210, 235, 0.26), transparent 58%),
    radial-gradient(800px circle at 78% 76%, rgba(130, 176, 255, 0.22), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(248,249,252,0.55) 100%);
}

.bookmark-anhui {
  background:
    radial-gradient(900px circle at 25% 22%, rgba(170, 160, 255, 0.26), transparent 58%),
    radial-gradient(800px circle at 78% 76%, rgba(200, 160, 255, 0.22), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(248,249,252,0.55) 100%);
}

.bookmark-shanghai {
  background:
    radial-gradient(900px circle at 25% 22%, rgba(255, 205, 130, 0.26), transparent 58%),
    radial-gradient(800px circle at 78% 76%, rgba(255, 160, 130, 0.20), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(248,249,252,0.55) 100%);
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
/* =========================
   用 PNG 省域轮廓做“GIS 图层遮罩”
   不改DOM/不动布局/不动逻辑
========================= */

.bookmark-map { display: none !important; }


.bookmark::before{
  content:'';
  position:absolute;
  left:50%;
  top:42%;
  width:92%;
  height:86%;
  transform: translate(-50%,-50%);
  pointer-events:none;
  z-index: 1;  /* 在背景之上，内容之下（你的标题/卡片在更高层） */

  /* 省域内部的 WebGIS 感图层 */
  background:
    /* 省域淡填充（避免空） */
    radial-gradient(120% 90% at 30% 25%, rgba(255,255,255,0.55), transparent 60%),
    radial-gradient(90% 80% at 70% 70%, var(--t2, rgba(0,0,0,0.10)), transparent 58%),
    radial-gradient(90% 80% at 35% 70%, var(--t1, rgba(0,0,0,0.08)), transparent 62%),

    /* 点位（POI/采样点） */
    radial-gradient(rgba(0,0,0,0.18) 1px, rgba(0,0,0,0) 1px),

    /* 经纬网格 */
    repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0 1px, rgba(0,0,0,0) 1px 22px),
    repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 1px, rgba(0,0,0,0) 1px 22px),

    /* 等值线 */
    repeating-radial-gradient(circle at 42% 46%,
      rgba(0,0,0,0.10) 0 1px,
      rgba(0,0,0,0) 1px 13px),

    /* 选中扫光（active 时跑一次） */
    linear-gradient(120deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.28) 50%,
      rgba(255,255,255,0) 100%);

  background-size:
    auto,
    auto,
    auto,
    16px 16px,
    100% 22px,
    22px 100%,
    auto,
    240% 100%;

  background-position:
    0 0,
    0 0,
    0 0,
    0 0,
    0 0,
    0 0,
    0 0,
    -140% 0;

  opacity: 0.22;

  /* 省界边缘更“像地图” */
  filter:
    drop-shadow(0 0 1px rgba(0,0,0,0.40))
    drop-shadow(0 12px 22px rgba(0,0,0,0.12));

  transition:
    opacity 420ms cubic-bezier(.2,.9,.2,1),
    transform 720ms cubic-bezier(.2,.9,.2,1);
}

/* 展开后更清晰 + 扫光 */
.bookmark.active::before{
  opacity: 0.55;
  transform: translate(-50%,-50%) scale(1.02);
  animation: gisSweep 1.35s cubic-bezier(.2,.9,.2,1) 1;
}

@keyframes gisSweep{
  from{
    background-position:
      0 0,0 0,0 0,
      0 0,
      0 0,0 0,
      0 0,
      -140% 0;
  }
  to{
    background-position:
      0 0,0 0,0 0,
      0 0,
      0 0,0 0,
      0 0,
      140% 0;
  }
}

/* 内容层级保证不被盖住 */
.bookmark-title { z-index: 2; }
.bookmark-stats { z-index: 3; }
.bookmark::after { z-index: 4; }


.bookmark-jiangsu::before{
  -webkit-mask-image: url('/figures/JS.png');
  mask-image: url('/figures/JS.png');
}
.bookmark-zhejiang::before{
  -webkit-mask-image: url('/figures/ZJ.png');
  mask-image: url('/figures/ZJ.png');
}
.bookmark-anhui::before{
  -webkit-mask-image: url('/figures/AH.png');
  mask-image: url('/figures/AH.png');
}
.bookmark-shanghai::before{
  -webkit-mask-image: url('/figures/SH.png');
  mask-image: url('/figures/SH.png');
}

.bookmark-jiangsu::before,
.bookmark-zhejiang::before,
.bookmark-anhui::before,
.bookmark-shanghai::before{
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.bookmark-jiangsu { --t1: rgba(255,120,120,0.28); --t2: rgba(255,186,120,0.22); }
.bookmark-zhejiang{ --t1: rgba(90,210,235,0.26);  --t2: rgba(130,176,255,0.22); }
.bookmark-anhui    { --t1: rgba(170,160,255,0.26); --t2: rgba(200,160,255,0.22); }
.bookmark-shanghai { --t1: rgba(255,205,130,0.26); --t2: rgba(255,160,130,0.20); }

/* ===== 1) 省域图层整体更大、更明显 ===== */
.bookmark::before{
  /* 省域画层更大（absolute，不会影响布局排布） */
  top: 43% !important;
  width: 96% !important;
  height: 90% !important;

  /* 默认就更明显 */
  opacity: 0.34 !important;

  /* 省界更清晰（多重描边阴影） */
  filter:
    drop-shadow(0 0 1.6px rgba(0,0,0,0.55))
    drop-shadow(0 0 0.9px rgba(255,255,255,0.28))
    drop-shadow(0 18px 36px rgba(0,0,0,0.14)) !important;

  /* ✅ 关键：用变量控制每省的“放大倍率/位置” */
  -webkit-mask-size: auto var(--msy, 200%) !important;
  mask-size: auto var(--msy, 200%) !important;

  -webkit-mask-position: var(--mx, 50%) var(--my, 52%) !important;
  mask-position: var(--mx, 50%) var(--my, 52%) !important;

  -webkit-mask-repeat: no-repeat !important;
  mask-repeat: no-repeat !important;

  -webkit-mask-mode: alpha !important;
  mask-mode: alpha !important;
}

/* 选中时再更明显一点 */
.bookmark.active::before{
  opacity: 0.78 !important;
  transform: translate(-50%,-50%) scale(1.08) !important;
}

/* ===== 2) 针对你这四张“长画布”PNG：单独设放大倍率/位置 ===== */
/* 这些数值是专门为“省域在中间、下方有水印/空白”的图准备的 */

.bookmark-jiangsu  { --msy: 210%; --mx: 50%; --my: 52%; }
.bookmark-zhejiang { --msy: 220%; --mx: 50%; --my: 53%; }
.bookmark-anhui    { --msy: 200%; --mx: 50%; --my: 52%; }

/* 上海通常更小：需要更大倍率 */
.bookmark-shanghai { --msy: 200%; --mx: 50%; --my: 48%; }

</style>
