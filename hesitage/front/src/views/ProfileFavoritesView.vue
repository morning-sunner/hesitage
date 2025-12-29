<template>
  <div class="collection-page">
    <!-- 顶部头部 -->
    <div class="header">
      <h1>个人中心</h1>

      <div class="avatar-area">
        <div class="avatar" @click="onAvatarClick" title="点击上传头像" :class="{ filled: !!avatarUrl }">
          <img v-if="avatarUrl" :src="avatarUrl" alt="用户头像" class="avatar-img" />
          <div v-else class="avatar-icon"></div>

          <div class="avatar-mask">
            <span>{{ avatarUrl ? '更换头像' : '上传头像' }}</span>
          </div>
        </div>

        <div class="avatar-text">{{ avatarUrl ? '点击更换头像' : '添加头像' }}</div>
        <input ref="fileInputRef" class="file-input" type="file" accept="image/*" @change="onFileChange" />
      </div>

      <input v-model="userEmail" type="text" class="username-input" placeholder="xxxxx@xx.com" />
    </div>

    <!-- 导航栏：统一样式 + 左侧返回首页 -->
    <div class="nav">
      <button class="nav-home" type="button" @click="goHome" aria-label="返回首页">← 首页</button>

      <div class="nav-links">
        <router-link to="/profile" class="nav-item" :class="{ active: activeTab === '/profile' }">
          📋 我的资料
        </router-link>

        <router-link to="/profile/edit" class="nav-item" :class="{ active: activeTab === '/profile/edit' }">
          ⭐ 我的收藏
        </router-link>

        <router-link
          to="/profile/settings"
          class="nav-item"
          :class="{ active: activeTab === '/profile/settings' }"
        >
          ⚙️ 设置
        </router-link>
      </div>
    </div>

    <!-- 白底主体 -->
    <div class="page-shell">
      <!-- ✅ 彻底去除隐私影响：永远展示收藏（保留原结构，v-if 永远走 else） -->
      <div v-if="!canShowFavorites" class="privacy-locked">
        <div class="lock-title">收藏已设为不公开</div>
        <div class="lock-desc">你可以在「设置 → 隐私设置」中开启“公开我的收藏”。</div>
        <button class="lock-btn" type="button" @click="goSettings">去设置</button>
      </div>

      <div v-else class="collection-container">
        <!-- 左箭头 -->
        <button
          class="arrow-btn left-arrow"
          :class="{ disabled: !canScrollLeft }"
          :disabled="!canScrollLeft"
          @click="scrollByPage(-1)"
          aria-label="向左翻页"
        >
          ‹
        </button>

        <!-- 横向列表（真正可翻阅） -->
        <div ref="listRef" class="collection-list" @scroll.passive="onListScroll">
          <div v-for="item in items" :key="item.id" class="collection-item">
            <div class="collection-map">
              <!-- ✅ 彻底去除隐私影响：永远走地图逻辑（保留原结构，v-if 永远 false） -->
              <div v-if="!canShowLocation" class="map-fallback">位置信息已隐藏</div>

              <template v-else>
                <div class="map-real" :ref="(el) => setMapEl(item.id, el as HTMLDivElement | null)"></div>
                <div v-if="mapError[item.id]" class="map-fallback">地图加载失败（网络或 Key 问题）</div>
              </template>
            </div>

            <div class="collection-title">{{ item.title }}</div>
            <div class="collection-desc">{{ item.desc }}</div>

            <div class="action-row">
              <button class="collection-btn" @click="goDetail(item)">详情</button>
              <button class="cancel-btn" @click="removeItem(item.id)">取消收藏</button>
            </div>
          </div>
        </div>

        <!-- 右箭头 -->
        <button
          class="arrow-btn right-arrow"
          :class="{ disabled: !canScrollRight }"
          :disabled="!canScrollRight"
          @click="scrollByPage(1)"
          aria-label="向右翻页"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

declare global {
  interface Window {
    AMap?: any
  }
}

type CollectionItem = {
  id: string
  title: string
  desc: string
  center: [number, number]
  markerTitle: string
}

const route = useRoute()
const router = useRouter()
const activeTab = computed(() => route.path)

/** ✅ 彻底去除隐私设置影响：收藏、位置永远可见 */
const canShowFavorites = computed(() => true)
const canShowLocation = computed(() => true)

/** ✅ 仅本页解除 #app 的 max-width/padding 限制（关键） */
const APP_CLASS = 'app-full-bleed'
const BODY_CLASS = 'profile-full-bleed'
function enableFullBleed() {
  document.getElementById('app')?.classList.add(APP_CLASS)
  document.body.classList.add(BODY_CLASS)
}
function disableFullBleed() {
  document.getElementById('app')?.classList.remove(APP_CLASS)
  document.body.classList.remove(BODY_CLASS)
}

/** ====== 邮箱 + 头像落地（localStorage）====== */
const LS_EMAIL_KEY = 'userEmail'
const LS_AVATAR_KEY = 'userAvatar'

const userEmail = ref('')
const avatarUrl = ref<string>('')

const fileInputRef = ref<HTMLInputElement | null>(null)
const onAvatarClick = () => fileInputRef.value?.click()

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件（png/jpg/webp 等）')
    input.value = ''
    return
  }

  const MAX_MB = 2
  if (file.size > MAX_MB * 1024 * 1024) {
    alert(`图片太大（> ${MAX_MB}MB），请换一张更小的头像`)
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    avatarUrl.value = result
    localStorage.setItem(LS_AVATAR_KEY, result)
    input.value = ''
  }
  reader.onerror = () => {
    alert('读取图片失败，请重试')
    input.value = ''
  }
  reader.readAsDataURL(file)
}

// 邮箱落地
watch(userEmail, (val) => localStorage.setItem(LS_EMAIL_KEY, (val || '').trim()))

/** ====== 收藏数据（你后续肯定会替换成真实数据）====== */
const items = ref<CollectionItem[]>([
  {
    id: 'nanjing-paper-cut',
    title: '南京剪纸-工艺美术',
    desc: '江苏省南京市传统美术，国家级非物质文化遗产之一，融合南北剪纸艺术特色……',
    center: [118.796877, 32.041545],
    markerTitle: '南京剪纸发源地',
  },
  {
    id: 'huju',
    title: '沪剧-歌舞戏曲',
    desc: '沪剧，上海市地方传统戏剧，国家级非物质文化遗产之一，具有浓郁的地方特色……',
    center: [121.473701, 31.230416],
    markerTitle: '沪剧发源地（上海）',
  },
  {
    id: 'changxing-baiye-long',
    title: '长兴百叶龙-体育游艺',
    desc: '长兴百叶龙发源于浙江省长兴县林城镇一带，至今已有悠久历史，表演独具特色……',
    center: [119.914145, 30.076516],
    markerTitle: '长兴百叶龙发源地（浙江长兴）',
  },
])

/** ====== 横向翻页 ====== */
const listRef = ref<HTMLDivElement | null>(null)
const cols = ref(3)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function getBaseColsByViewport() {
  const w = window.innerWidth
  if (w >= 1100) return 3
  if (w >= 720) return 2
  return 1
}

function applyCols() {
  const base = getBaseColsByViewport()
  const safe = Math.max(1, Math.min(base, items.value.length || 1))
  cols.value = safe

  if (listRef.value) {
    listRef.value.style.setProperty('--cols', String(cols.value))
    listRef.value.style.setProperty('--gap', '22px')
  }

  refreshMaps()
  updateArrowState()
}

function updateArrowState() {
  const el = listRef.value
  if (!el) return
  const left = el.scrollLeft
  const maxLeft = el.scrollWidth - el.clientWidth
  canScrollLeft.value = left > 2
  canScrollRight.value = maxLeft - left > 2
}

function onListScroll() {
  updateArrowState()
  refreshMaps()
}

function getScrollStepPx() {
  const el = listRef.value
  if (!el) return 0
  const first = el.querySelector<HTMLElement>('.collection-item')
  if (!first) return el.clientWidth

  const styles = getComputedStyle(el)
  const gapStr = styles.gap || (styles as any).columnGap || '0px'
  const gap = Number.parseFloat(gapStr) || 0

  return (first.offsetWidth + gap) * cols.value
}

function scrollByPage(dir: 1 | -1) {
  const el = listRef.value
  if (!el) return
  const step = getScrollStepPx() || el.clientWidth
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
  setTimeout(() => {
    updateArrowState()
    refreshMaps()
  }, 220)
}

/** ====== 高德地图 ====== */
const AMAP_KEY = (import.meta as any).env?.VITE_AMAP_KEY as string | undefined

const mapError = reactive<Record<string, boolean>>({})
const mapEls = new Map<string, HTMLDivElement>()
const mapInstances = new Map<string, any>()

function setMapEl(id: string, el: HTMLDivElement | null) {
  if (!el) {
    mapEls.delete(id)
    return
  }
  mapEls.set(id, el)
}

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

function destroyAllMaps() {
  mapInstances.forEach((m) => {
    try {
      m?.destroy?.()
    } catch {}
  })
  mapInstances.clear()
}

function destroyMap(id: string) {
  try {
    mapInstances.get(id)?.destroy?.()
  } catch {}
  mapInstances.delete(id)
}

function refreshMaps() {
  setTimeout(() => {
    mapInstances.forEach((m) => {
      try {
        m?.resize?.()
      } catch {}
    })
  }, 120)
}

async function initAllMaps() {
  if (!AMAP_KEY) {
    items.value.forEach((it) => (mapError[it.id] = true))
    return
  }

  try {
    await loadAmapScript(AMAP_KEY)
  } catch {
    items.value.forEach((it) => (mapError[it.id] = true))
    return
  }

  const AMap = window.AMap
  if (!AMap) {
    items.value.forEach((it) => (mapError[it.id] = true))
    return
  }

  await nextTick()

  items.value.forEach((it) => {
    const el = mapEls.get(it.id)
    if (!el) return

    destroyMap(it.id)

    try {
      mapError[it.id] = false

      const map = new AMap.Map(el, {
        zoom: 10,
        center: it.center,
        viewMode: '2D',
        resizeEnable: true,
        dragEnable: false,
        scrollWheel: false,
        doubleClickZoom: false,
      })

      const marker = new AMap.Marker({
        position: it.center,
        title: it.markerTitle,
      })
      marker.setMap(map)

      mapInstances.set(it.id, map)
    } catch {
      mapError[it.id] = true
    }
  })

  refreshMaps()
}

/** ====== 操作 ====== */
function goHome() {
  router.push('/')
}
function goSettings() {
  router.push('/profile/settings')
}

const removeItem = async (id: string) => {
  if (!confirm('确定要取消收藏吗？')) return
  destroyMap(id)
  delete mapError[id]
  items.value = items.value.filter((x) => x.id !== id)
  await nextTick()
  applyCols()
  updateArrowState()
}

const goDetail = (item: CollectionItem) => {
  router.push({ path: '/profile/detail', query: { id: item.id } })
}

function onWinResize() {
  applyCols()
}

onMounted(async () => {
  enableFullBleed()

  userEmail.value = localStorage.getItem(LS_EMAIL_KEY) || ''
  avatarUrl.value = localStorage.getItem(LS_AVATAR_KEY) || ''

  await nextTick()

  applyCols()
  updateArrowState()
  await initAllMaps()

  window.addEventListener('resize', onWinResize)
})

onBeforeUnmount(() => {
  disableFullBleed()
  window.removeEventListener('resize', onWinResize)
  destroyAllMaps()
})
</script>

<style scoped>
/* 下面 style 一字不动：保持你原来的样式 */
:global(#app.app-full-bleed) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
:global(body.profile-full-bleed) {
  margin: 0;
  overflow-x: hidden;
  background: #faf6f2;
}

.collection-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.collection-page {
  font-family: "微软雅黑", sans-serif;
  color: #3a2618;
  min-height: 100vh;
  background: radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.85), rgba(250,246,242,1) 55%);
}

/* 顶部 */
.header {
  position: relative;
  height: 190px;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  background: url('/figures/bg-header.jpg') no-repeat center;
  background-size: cover;
  background-color: #f0e6d6;
  border-bottom: 1px solid rgba(224, 208, 184, 0.85);
  padding-top: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 18% 18%, rgba(255,255,255,0.55), rgba(255,255,255,0.18) 55%, rgba(0,0,0,0.08) 100%),
    linear-gradient(180deg, rgba(250,246,242,0.25) 0%, rgba(250,246,242,0.58) 55%, rgba(250,246,242,0.78) 100%);
}
.header h1 {
  position: absolute;
  top: 18px;
  left: 30px;
  font-size: 24px;
  letter-spacing: 1px;
  color: #3a2618;
  border-bottom: 3px solid rgba(194, 158, 109, 0.92);
  padding-bottom: 6px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.65);
}

/* 头像 */
.avatar-area {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed rgba(194, 158, 109, 0.95);
  margin: 0 auto;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.10);
  position: relative;
  overflow: hidden;
}
.avatar.filled { border-style: solid; }
.avatar:hover {
  border-color: #8b4513;
  transform: scale(1.05);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-icon {
  width: 30px;
  height: 30px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c29e6d'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.9;
}
.avatar-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}
.avatar-mask span {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}
.avatar:hover .avatar-mask { opacity: 1; }
.avatar-text {
  color: #6d543a;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
}
.file-input { display: none; }

/* 邮箱输入 */
.username-input {
  position: absolute;
  top: 22px;
  right: 30px;
  width: 230px;
  padding: 9px 12px;
  font-size: 14px;
  border: 1px solid rgba(224, 208, 184, 0.85);
  background-color: rgba(255, 255, 255, 0.72);
  border-radius: 10px;
  outline: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
}
.username-input:focus {
  border-color: rgba(194, 158, 109, 0.95);
  box-shadow: 0 0 0 3px rgba(194, 158, 109, 0.16), 0 8px 18px rgba(0,0,0,0.08);
}

/* ✅ 导航 sticky：统一结构（左按钮 + 中间 tabs） */
.nav {
  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  background: rgba(230, 200, 155, 0.92);
  padding: 10px 12px;
  margin-bottom: 22px;

  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(224, 208, 184, 0.9);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

.nav-home {
  flex: 0 0 auto;
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  color: #5d4037;

  padding: 9px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.nav-home:hover {
  border-color: rgba(194, 158, 109, 0.95);
  background: rgba(255, 255, 255, 0.84);
  transform: translateY(-1px);
}

.nav-links {
  display: flex;
  flex: 1;
  min-width: 0;
}

.nav-item {
  flex: 1;
  text-align: center;
  font-size: 15px;
  color: #5d4037;
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border-bottom: 2px solid transparent;
  padding: 10px 6px;
}

.nav-item.active {
  color: #8b4513;
  font-weight: 800;
  border-bottom: 2px solid rgba(139, 69, 19, 0.9);
}

.nav-item:hover:not(.active) {
  color: #8b4513;
  transform: translateY(-1px);
}

.page-shell {
  width: min(1680px, 96vw);
  margin: 0 auto 60px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.08);
  padding: 20px 18px 24px;
  min-height: calc(100vh - 190px - 62px - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-title {
  font-size: 18px;
  font-weight: 850;
  color: #8b4513;
  margin-bottom: 10px;
}
.lock-desc {
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  line-height: 1.7;
  margin-bottom: 16px;
}
.lock-btn {
  border: none;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 10px;
  background: rgba(139, 69, 19, 0.88);
  color: #fff;
  font-size: 14px;
  font-weight: 750;
  box-shadow: 0 12px 20px rgba(139, 69, 19, 0.16);
}
.lock-btn:hover {
  background: rgba(109, 56, 17, 0.95);
  transform: translateY(-2px);
}

/* 容器 + 箭头 */
.collection-container {
  position: relative;
  padding: 6px 52px;
}

/* 横向列表 */
.collection-list {
  --cols: 3;
  --gap: 22px;

  display: flex;
  gap: var(--gap);
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 12px 6px 14px;
  align-items: stretch;

  scrollbar-width: thin;
  scrollbar-color: rgba(230,200,155,0.9) rgba(0,0,0,0.05);
}
.collection-list::-webkit-scrollbar { height: 8px; }
.collection-list::-webkit-scrollbar-thumb {
  background-color: rgba(230,200,155,0.95);
  border-radius: 999px;
}
.collection-list::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 999px;
}

/* 卡片 */
.collection-item {
  flex: 0 0 calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols));
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(240, 230, 214, 0.95);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  min-width: 260px;
}
.collection-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.10);
  border-color: rgba(230, 200, 155, 0.9);
}

.collection-map {
  width: 100%;
  height: 240px;
  border-radius: 14px;
  border: 1px solid rgba(240, 230, 214, 0.95);
  overflow: hidden;
  position: relative;
  background: rgba(240, 230, 214, 0.75);
  box-shadow: 0 10px 22px rgba(0,0,0,0.08);
  margin-bottom: 12px;
}
.map-real { position: absolute; inset: 0; }
.map-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240, 230, 214, 0.92);
  color: #8b4513;
  font-size: 14px;
  text-align: center;
  padding: 10px;
}

.collection-title {
  font-size: 15px;
  font-weight: 800;
  margin: 8px 0 10px;
  color: #3a2618;
  background: rgba(240, 230, 214, 0.86);
  border: 1px solid rgba(224, 208, 184, 0.8);
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  align-self: center;
}

.collection-desc {
  font-size: 14px;
  color: #6d543a;
  line-height: 1.55;
  opacity: 0.95;
  margin-bottom: 14px;
  flex: 1;
}

.action-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 8px;
}
.collection-btn,
.cancel-btn {
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 650;
  border: 1px solid transparent;
}
.collection-btn {
  background: #8b4513;
  color: #fff;
  box-shadow: 0 10px 18px rgba(139, 69, 19, 0.18);
}
.collection-btn:hover {
  background: #6d3811;
  transform: translateY(-2px);
}
.cancel-btn {
  background: rgba(240, 230, 214, 0.88);
  color: #5d4037;
  border-color: rgba(224, 208, 184, 0.95);
}
.cancel-btn:hover {
  background: rgba(230, 200, 155, 0.92);
  transform: translateY(-2px);
}

/* 左右箭头 */
.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(230, 200, 155, 0.95);
  color: #5d4037;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(0,0,0,0.10);
  display: grid;
  place-items: center;
  z-index: 10;
}
.arrow-btn:hover:not(.disabled) {
  background: #8b4513;
  color: #fff;
  transform: translateY(-50%) scale(1.06);
}
.arrow-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
.left-arrow { left: 6px; }
.right-arrow { right: 6px; }

/* 响应式 */
@media (max-width: 720px) {
  .username-input { right: 16px; width: 200px; }
  .collection-container { padding: 6px 46px; }
}

@media (max-width: 480px) {
  .header { height: 210px; }
  .username-input { top: 150px; right: 20px; width: calc(100% - 40px); }

  .nav { gap: 8px; padding: 10px 10px; }
  .nav-home { padding: 8px 10px; font-size: 12px; }
  .nav-item { font-size: 12px; gap: 2px; padding: 10px 4px; }

  .collection-container { padding: 6px 40px; }
}
</style>
