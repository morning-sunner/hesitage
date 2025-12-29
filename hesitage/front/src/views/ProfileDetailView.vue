<template>
  <div class="detail-page">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="logo-area" @click="go('/')">
        <div class="logo-circle">
          <span class="logo-text">长三角<br />非遗</span>
        </div>
        <span class="platform-name">长三角非遗平台</span>
      </div>

      <div class="nav-links">
        <a class="nav-link" @click.prevent="go('/')">首页</a>
        <a class="nav-link" @click.prevent="go('/heritage')">非遗文化</a>
        <a class="nav-link" @click.prevent="go('/detail')">匠人书影</a>
        <a class="nav-link" @click.prevent="devSoon()">互动社区</a>
        <a class="nav-link" @click.prevent="go('/chat')">AI对话</a>
      </div>

      <div class="user-area" @click="go('/profile')">
        <img src="/figures/user-avatar.svg" class="user-avatar" alt="用户头像" />
        <span class="user-email">{{ userEmail || 'xxxxx@xx.com' }}</span>
      </div>
    </div>

    <!-- 详情区域 -->
    <div class="detail-container">
      <!-- 标题行 + 返回按钮 -->
      <div class="detail-header">
        <button class="back-btn" @click="router.back()">
          <span class="back-icon">←</span>
          返回
        </button>
        <div class="detail-title">结果详情</div>
      </div>

      <div class="detail-content">
        <div class="detail-img-container">
          <img :src="detail.img" class="detail-img" :alt="detail.name" />
        </div>

        <div class="info-area">
          <div class="info-item">
            <div class="info-label">非遗名称：</div>
            <div class="info-value">{{ detail.name }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">相关信息：</div>
            <div class="info-value">
              <p v-for="(p, idx) in detail.paragraphs" :key="idx" class="p">{{ p }}</p>
            </div>
          </div>

          <div class="info-item map-area">
            <div class="info-label">地理位置：</div>
            <div class="map-wrap">
              <div ref="mapEl" class="map-img"></div>
              <div v-if="mapError" class="map-fallback">
                地图加载失败（可能是网络或 Key 问题）。页面不影响使用。
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部按钮已移除 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

declare global {
  interface Window {
    AMap?: any
  }
}

const route = useRoute()
const router = useRouter()

const userEmail = ref('')
onMounted(() => {
  userEmail.value = localStorage.getItem('userEmail') || ''
})

/**
 * /profile/detail?id=xxx
 */
const id = computed(() => (route.query.id as string) || 'nanjing-paper-cut')

type DetailItem = {
  name: string
  img: string
  center: [number, number]
  paragraphs: string[]
  markerTitle: string
}

const DETAIL_DB: Record<string, DetailItem> = {
  'nanjing-paper-cut': {
    name: '南京剪纸',
    img: '/figures/paper-cut.jpg',
    center: [118.796877, 32.041545],
    markerTitle: '南京剪纸发源地',
    paragraphs: [
      '江苏省南京市传统美术，国家级非物质文化遗产之一。南京剪纸主要流行于江苏省南京及其周边地区，据清代道光年间甘熙所撰的《白下琐言》等史料记载，南京剪纸在明代初年已十分流行。',
      '20世纪50年代，南京民间剪纸生产合作社和民间工艺厂先后成立，制作剪纸并出口外销。南京剪纸的个性特征较为突出，它融北方剪纸的粗放和南方剪纸的细腻为一体，花中有花，题中有题，粗中有细，拙中见灵，艺术形式优美异常。',
      '南京剪纸的传统品种主要包括喜花、斗香花、门笺和包括鞋花在内的刺绣花样等，充分体现出丰富多彩的特色，丰富了中国民间艺术的宝库。',
      '2008年6月7日，剪纸（南京剪纸）经国务院批准列入第二批国家级非物质文化遗产名录。',
    ],
  },
  huju: {
    name: '沪剧',
    img: '/figures/huju.jpg',
    center: [121.473701, 31.230416],
    markerTitle: '沪剧发源地（上海）',
    paragraphs: [
      '沪剧是上海市地方传统戏剧之一，具有浓郁的地方特色。',
      '唱腔以沪语为基础，兼具叙事与抒情特征，题材贴近市民生活。',
      '（你后续可以把这里替换为更完整的资料介绍。）',
    ],
  },
  'changxing-baiye-long': {
    name: '长兴百叶龙',
    img: '/figures/baiye-long.jpg',
    center: [119.914145, 30.076516],
    markerTitle: '长兴百叶龙发源地（浙江长兴）',
    paragraphs: [
      '长兴百叶龙发源于浙江省长兴县林城镇一带，历史悠久，表演独具特色。',
      '其动作、节奏与民俗活动关系密切，体现地域文化与传统审美。',
      '（你后续可以把这里替换为更完整的资料介绍。）',
    ],
  },
}

const DEFAULT_DETAIL = DETAIL_DB['nanjing-paper-cut']!
const detail = computed<DetailItem>(() => DETAIL_DB[id.value] ?? DEFAULT_DETAIL)

// ------- 高德地图加载 -------
const mapEl = ref<HTMLDivElement | null>(null)
let mapInstance: any = null
const mapError = ref(false)

const AMAP_KEY = (import.meta as any).env?.VITE_AMAP_KEY as string | undefined

function loadAmapScript(key: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.AMap) return resolve()

    const exist = document.getElementById('amap-js')
    if (exist) {
      const timer = setInterval(() => {
        if (window.AMap) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
      setTimeout(() => {
        clearInterval(timer)
        reject(new Error('AMap load timeout'))
      }, 8000)
      return
    }

    const s = document.createElement('script')
    s.id = 'amap-js'
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('AMap script load error'))
    document.body.appendChild(s)
  })
}

async function initMap() {
  try {
    mapError.value = false

    if (!AMAP_KEY) {
      mapError.value = true
      return
    }
    if (!mapEl.value) return

    await loadAmapScript(AMAP_KEY)

    const AMap = window.AMap
    if (!AMap) {
      mapError.value = true
      return
    }

    mapInstance?.destroy?.()

    mapInstance = new AMap.Map(mapEl.value, {
      zoom: 12,
      center: detail.value.center,
      viewMode: '2D',
      resizeEnable: true,
    })

    const marker = new AMap.Marker({
      position: detail.value.center,
      title: detail.value.markerTitle,
    })
    marker.setMap(mapInstance)

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], () => {
      mapInstance.addControl(new AMap.ToolBar())
      mapInstance.addControl(new AMap.Scale())
    })
  } catch {
    mapError.value = true
  }
}

onMounted(() => initMap())

watch(
  () => detail.value.center,
  () => initMap(),
  { deep: true }
)

onBeforeUnmount(() => {
  try {
    mapInstance?.destroy?.()
  } catch {}
})

// ------- 导航动作 -------
function go(path: string) {
  router.push(path)
}
function devSoon() {
  alert('互动社区：开发中～')
}
</script>

<style scoped>
.detail-page {
  font-family: "微软雅黑", sans-serif;
  line-height: 1.8;
  color: #3a2618;
  min-height: 100vh;

  width: 100vw;
  position: relative;
  isolation: isolate;
  overflow-x: hidden;

  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.detail-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url('/figures/bg-header.jpg') center / cover no-repeat;

  transform: scale(1.04);
  filter: blur(1.2px) saturate(1.02);
  opacity: 0.95;

  z-index: -2;
  pointer-events: none;
}

.detail-page::after {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 18% 8%,
      rgba(255,255,255,0.45) 0%,
      rgba(255,255,255,0.16) 45%,
      rgba(0,0,0,0.10) 100%),
    linear-gradient(180deg,
      rgba(245,242,234,0.18) 0%,
      rgba(245,242,234,0.50) 55%,
      rgba(245,242,234,0.68) 100%);
  z-index: -1;
  pointer-events: none;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 30px;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-bottom: 2px solid #e6c89b;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #e6c89b;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.6);
}

.logo-text {
  font-size: 11px;
  font-weight: 700;
  color: #5d4037;
  text-align: center;
  line-height: 1.1;
}

.platform-name {
  font-size: 20px;
  font-weight: bold;
  color: #8b4513;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #5d4037;
  font-size: 16px;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
  cursor: pointer;
}

.nav-link:hover {
  color: #8b4513;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #8b4513;
  transition: width 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e6c89b;
}

.user-email {
  color: #5d4037;
}

.detail-container {
  width: min(1400px, 96vw);
  margin: 22px auto;

  background: rgba(255, 248, 235, 0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-radius: 16px;
  padding: 34px;
  box-shadow: 0 14px 34px rgba(0,0,0,0.10);
  border: 1px solid rgba(230, 200, 155, 0.50);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  padding: 10px 12px;

  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(230, 200, 155, 0.55);
  border-radius: 12px;

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.detail-title {
  font-size: 20px;
  font-weight: bold;
  color: #8b4513;
  padding: 6px 10px;
  border-left: 4px solid #c29e6d;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  background: rgba(139, 69, 19, 0.10);
  color: #6d3811;
  border: 1px solid rgba(139, 69, 19, 0.20);

  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(139, 69, 19, 0.16);
  transform: translateY(-1px);
}

.back-icon {
  font-size: 16px;
  line-height: 1;
}

.detail-content {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.detail-img-container {
  flex: 0 0 280px;
}

.detail-img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(230, 200, 155, 0.8);
  box-shadow: 0 10px 22px rgba(0,0,0,0.10);
}

.info-area {
  flex: 1;
  min-width: 300px;
}

.info-item {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.info-label {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  background-color: #7d4821;
  padding: 6px 15px;
  min-width: 120px;
  text-align: center;
  border-radius: 6px;
  margin-right: 15px;
  flex-shrink: 0;
}

.info-value {
  font-size: 16px;
  line-height: 1.9;
  color: #3a2618;
  flex: 1;

  padding: 14px 18px;
  background: rgba(252, 251, 199, 0.30);
  border-radius: 12px;
  border: 1px solid rgba(230, 200, 155, 0.28);
}

.p {
  margin-bottom: 12px;
}

.map-area {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(230, 200, 155, 0.9);
}

.map-wrap {
  position: relative;
  flex: 1;
}

.map-img {
  width: 100%;
  max-width: 760px;
  height: 320px;
  border-radius: 12px;
  border: 1px solid rgba(230, 200, 155, 0.8);
  box-shadow: 0 10px 22px rgba(0,0,0,0.10);
  background: rgba(240, 230, 214, 0.65);
}

.map-fallback {
  margin-top: 10px;
  color: #8b4513;
  font-size: 13px;
}

@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
  }
  .detail-img-container {
    margin: 0 auto;
  }
  .info-item {
    flex-direction: column;
  }
  .info-label {
    margin-bottom: 10px;
    margin-right: 0;
    width: 100%;
  }
  .nav-links {
    gap: 15px;
  }
  .nav-link {
    font-size: 14px;
  }
  .detail-header {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .top-nav {
    padding: 10px 15px;
  }
  .platform-name {
    font-size: 16px;
  }
  .nav-links {
    display: none;
  }
  .detail-container {
    margin: 15px auto;
    padding: 18px;
  }
}
</style>
