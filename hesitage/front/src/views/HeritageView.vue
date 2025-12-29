<template>
  <div class="container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 装饰元素 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧侧边栏 -->
      <div class="sidebar">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文化"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-button link @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 分类列表 -->
        <div class="category-list">
          <div class="category-title">按地区分类</div>
          <div class="category-scroll">
            <div
              v-for="province in provinces"
              :key="province.id"
              :class="['category-item', { active: selectedProvince === province.id }]"
              @click="toggleProvince(province.id)"
            >
              <span class="category-name">{{ province.name }}</span>
              <span v-if="province.id !== 'all'" class="expand-icon">
                {{ expandedProvinces.includes(province.id) ? '▼' : '▶' }}
              </span>
              <span class="category-count">{{ province.count }}</span>
            </div>

            <!-- 地级市子项 -->
            <div
              v-if="selectedProvince !== 'all' && citiesByProvince[selectedProvince]"
              class="cities-list"
            >
              <div
                v-for="city in citiesByProvince[selectedProvince]"
                :key="city"
                :class="['city-item', { active: selectedCity === city }]"
                @click.stop="selectedCity = selectedCity === city ? '' : city"
              >
                <span class="city-name">{{ city }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 非遗十大类 -->
        <div class="category-list heritage-classes">
          <div class="category-title">非遗十大类</div>
          <div class="class-tags">
            <el-tag
              v-for="cls in heritageclasses"
              :key="cls.id"
              :type="selectedClass === cls.id ? 'primary' : 'info'"
              @click="selectedClass = selectedClass === cls.id ? null : cls.id"
              class="heritage-tag"
            >
              {{ cls.name }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 顶部标签 -->
        <div class="top-tags">
          <el-tag
            v-for="tag in topTags"
            :key="tag"
            closable
            @close="removeTopTag(tag)"
            class="tag"
          >
            {{ tag }}
          </el-tag>
        </div>

        <!-- 卡片网格 -->
        <div class="card-grid">
          <div
            v-for="item in paginatedItems"
            :key="String(item.id)"
            class="heritage-card"
            @click="selectItem(item)"
          >
            <div class="card-image-wrapper">
              <img :src="item.image" :alt="item.name" class="card-image" />
              <div class="card-overlay">
                <button class="view-btn">查看详情</button>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-name">{{ item.name }}</h3>
              <p class="card-category">{{ item.category }}</p>
              <p class="card-location">
                {{ item.location }}
                <span v-if="item.city">· {{ item.city }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredItems.length"
            layout="prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- 详情弹窗：详情页同款风格 + 高德地图 -->
    <el-dialog
      v-model="showDetail"
      :show-close="false"
      append-to-body
      top="4vh"
      width="min(1400px, 96vw)"
      class="heritage-detail-dialog"
      @closed="onDialogClosed"
    >
      <!-- 自定义头部 -->
      <template #header="{ close }">
        <div class="detail-header">
          <button class="back-btn" @click="close()">
            <span class="back-icon">←</span>
            返回
          </button>
          <div class="detail-title">结果详情</div>
        </div>
      </template>

      <div v-if="selectedItem" class="detail-surface">
        <div class="detail-container">
          <div class="detail-content">
            <div class="detail-img-container">
              <img
                v-if="selectedItem.image"
                :src="selectedItem.image"
                class="detail-img"
                :alt="selectedItem.name"
              />
              <div v-else class="detail-img detail-img-placeholder"></div>
            </div>

            <div class="info-area">
              <div class="info-item">
                <div class="info-label">非遗名称：</div>
                <div class="info-value">{{ selectedItem.name }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">分类：</div>
                <div class="info-value">{{ selectedItem.category }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">地区：</div>
                <div class="info-value">
                  {{ selectedItem.region || selectedItem.location }}
                  <span v-if="!selectedItem.region && selectedItem.city"> · {{ selectedItem.city }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">相关信息：</div>
                <div class="info-value">
                  <p class="p">{{ selectedItem.intro || selectedItem.description || '' }}</p>
                  <p v-if="selectedItem.significance" class="p">{{ selectedItem.significance }}</p>
                </div>
              </div>

              <div class="info-item map-area">
                <div class="info-label">地理位置：</div>

                <div class="map-wrap">
                  <div ref="mapEl" class="map-img"></div>

                  <div v-if="mapError" class="map-fallback">地图加载失败</div>
                  <div v-else-if="!hasCoords(selectedItem)" class="map-fallback">暂无经纬度数据</div>
                  <div v-else-if="!AMAP_KEY" class="map-fallback">缺少高德 Key</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import NavBar from '../components/NavBar.vue'

declare global {
  interface Window {
    AMap?: any
  }
}

/** ====== 后端地址配置 ======
 * 推荐你在 front/.env.development 里加：
 * VITE_API_ORIGIN=http://localhost:3000
 * VITE_API_BASE=/api
 *
 * 这样：
 * - 接口：  http://localhost:3000/api/...
 * - 图片：  http://localhost:3000/uploads/...
 */
const API_ORIGIN = (import.meta as any).env?.VITE_API_ORIGIN as string | undefined
const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || '/api'

function joinUrl(a: string, b: string) {
  const left = a.replace(/\/+$/, '')
  const right = b.replace(/^\/+/, '')
  return `${left}/${right}`
}

function apiUrl(path: string) {
  // path: "/heritage/yrd/xxx"
  const base = API_BASE.startsWith('/') ? API_BASE : `/${API_BASE}`
  const p = path.startsWith('/') ? path : `/${path}`
  if (API_ORIGIN) return joinUrl(API_ORIGIN, `${base}${p}`)
  return `${base}${p}` // 走同源（配合 Vite proxy 时可用）
}

function assetUrl(p?: string | null) {
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  // /uploads/xxx => 拼到后端域名上
  if (API_ORIGIN) return joinUrl(API_ORIGIN, p)
  return p
}


const searchQuery = ref('')
const selectedProvince = ref('all')
const selectedCity = ref('')
const selectedClass = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(9)

const showDetail = ref(false)
const selectedItem = ref<any>(null)

const expandedProvinces = ref<string[]>([])

const provinces = ref([
  { id: 'all', name: '全部地区', count: 500 },
  { id: 'jiangsu', name: '江苏', count: 134 },
  { id: 'zhejiang', name: '浙江', count: 102 },
  { id: 'shanghai', name: '上海', count: 35 },
  { id: 'anhui', name: '安徽', count: 89 },
])

const citiesByProvince = ref<Record<string, string[]>>({
  jiangsu: ['南通', '常州', '镇江', '扬州', '泰州', '徐州', '连云港', '淮安', '苏州', '无锡'],
  zhejiang: ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州'],
  shanghai: ['黄浦', '静安', '徐汇', '长宁', '普陀', '虹口', '杨浦', '浦东'],
  anhui: ['合肥', '芜湖', '马鞍山', '安庆', '黄山', '阜阳', '六安', '亳州', '池州', '宣城'],
})

const heritageclasses = ref([
  { id: '1', name: '民间文学' },
  { id: '2', name: '说唱艺曲' },
  { id: '3', name: '体育游艺' },
  { id: '4', name: '传统技艺' },
  { id: '5', name: '工艺美术' },
  { id: '6', name: '传统医药' },
  { id: '7', name: '民俗' },
  { id: '8', name: '传统戏剧' },
  { id: '9', name: '音乐舞蹈' },
  { id: '10', name: '风俗节庆' },
])

type HeritageItem = {
  id: string | number
  name: string
  category: string
  location: string
  city?: string
  region?: string
  intro?: string
  description?: string
  significance?: string
  image?: string
  lng?: number | string | null
  lat?: number | string | null
  markerTitle?: string
}


const heritageItems = ref<HeritageItem[]>([
  {
    id: 'Ⅳ-28',   
    name: '',   /** 京剧*/
    category: '',        /** 传统戏剧*/
    location: '', /** 上海 */
    region: '', /** 上海市徐汇区 */
    intro: '',
    image: '',
   
  },
])


const topTags = computed(() => {
  const tags: string[] = []
  if (selectedProvince.value !== 'all') {
    const province = provinces.value.find((p) => p.id === selectedProvince.value)
    if (province) tags.push(`地区：${province.name}`)
  }
  if (selectedCity.value) tags.push(`城市：${selectedCity.value}`)
  if (selectedClass.value) {
    const cls = heritageclasses.value.find((c) => c.id === selectedClass.value)
    if (cls) tags.push(`分类：${cls.name}`)
  }
  if (searchQuery.value) tags.push(`搜索：${searchQuery.value}`)
  return tags
})


const filteredItems = computed(() => {
  return heritageItems.value.filter((item) => {
    if (
      selectedProvince.value !== 'all' &&
      item.location !== provinces.value.find((p) => p.id === selectedProvince.value)?.name
    ) return false

    if (selectedCity.value && item.city !== selectedCity.value) return false

    if (selectedClass.value) {
      const selectedClassName = heritageclasses.value.find((c) => c.id === selectedClass.value)?.name
      if (!item.category.includes(selectedClassName || '')) return false
    }

    if (searchQuery.value && !item.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    return true
  })
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const handleSearch = () => {
  currentPage.value = 1
}

const removeTopTag = (tag: string) => {
  if (tag.startsWith('地区：')) {
    selectedProvince.value = 'all'
    selectedCity.value = ''
  } else if (tag.startsWith('城市：')) {
    selectedCity.value = ''
  } else if (tag.startsWith('分类：')) {
    selectedClass.value = null
  } else if (tag.startsWith('搜索：')) {
    searchQuery.value = ''
  }
}

/** ====== ✅ 弹窗 ====== */
type YrdDetailApi = {
  id: string
  name: string
  category: string
  region: string
  intro: string
  lng?: string | number | null
  lat?: string | number | null
  image?: string | null
  image_url?: string | null
}

function toNumber(v: any): number | undefined {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}

async function fetchYrdDetail(id: string): Promise<Partial<HeritageItem> | null> {
  try {
    const url = apiUrl(`/heritage/yrd/${encodeURIComponent(id)}`)
    const resp = await fetch(url)
    const json = await resp.json()

    if (!resp.ok || !json?.success) {
      console.error('fetchYrdDetail failed:', json)
      return null
    }

    const d = (json.data as YrdDetailApi) || null
    if (!d) return null

    const lng = toNumber(d.lng)
    const lat = toNumber(d.lat)
    const imgPath = d.image || d.image_url || ''

    return {
      id: d.id,
      name: d.name,
      category: d.category,
      region: d.region,
      intro: d.intro,
      lng,
      lat,
      image: assetUrl(imgPath),
      markerTitle: d.name,
    }
  } catch (e) {
    console.error('fetchYrdDetail error:', e)
    return null
  }
}

const selectItem = async (item: HeritageItem) => {

  selectedItem.value = {
    ...item,
    image: assetUrl(item.image || ''),
  }
  showDetail.value = true
  currentPage.value = 1


  const detail = await fetchYrdDetail(String(item.id))
  if (detail) {
    selectedItem.value = { ...selectedItem.value, ...detail }
  }
}

const toggleProvince = (provinceId: string) => {
  if (provinceId === 'all') {
    selectedProvince.value = 'all'
    selectedCity.value = ''
  } else {
    selectedProvince.value = provinceId
    selectedCity.value = ''
    const idx = expandedProvinces.value.indexOf(provinceId)
    if (idx >= 0) expandedProvinces.value.splice(idx, 1)
    else expandedProvinces.value.push(provinceId)
  }
  currentPage.value = 1
}

/** ============ 高德地图（弹窗内） ============ */
const mapEl = ref<HTMLDivElement | null>(null)
let mapInstance: any = null
const mapError = ref(false)

const AMAP_KEY = (import.meta as any).env?.VITE_AMAP_KEY as string | undefined

function hasCoords(item: any) {
  const lng = toNumber(item?.lng)
  const lat = toNumber(item?.lat)
  return typeof lng === 'number' && typeof lat === 'number'
}

function destroyMap() {
  try {
    mapInstance?.destroy?.()
  } catch {}
  mapInstance = null
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

async function initMap() {
  try {
    mapError.value = false

    if (!AMAP_KEY) return
    if (!mapEl.value) return
    if (!selectedItem.value || !hasCoords(selectedItem.value)) {
      destroyMap()
      return
    }

    await loadAmapScript(AMAP_KEY)

    const AMap = window.AMap
    if (!AMap) {
      mapError.value = true
      return
    }

    destroyMap()

    const lng = toNumber(selectedItem.value.lng)!
    const lat = toNumber(selectedItem.value.lat)!
    const center: [number, number] = [lng, lat]

    mapInstance = new AMap.Map(mapEl.value, {
      zoom: 12,
      center,
      viewMode: '2D',
      resizeEnable: true,
    })

    const marker = new AMap.Marker({
      position: center,
      title: selectedItem.value.markerTitle || selectedItem.value.name || '标记点',
    })
    marker.setMap(mapInstance)

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], () => {
      mapInstance.addControl(new AMap.ToolBar())
      mapInstance.addControl(new AMap.Scale())
    })

    // 弹窗动画结束后再 resize 一次，避免白板
    setTimeout(() => {
      try {
        mapInstance?.resize?.()
      } catch {}
    }, 50)
  } catch {
    mapError.value = true
  }
}

watch(
  () => showDetail.value,
  async (open) => {
    if (!open) return
    await nextTick()
    await initMap()
  }
)

watch(
  () => [selectedItem.value?.lng, selectedItem.value?.lat],
  async () => {
    if (!showDetail.value) return
    await nextTick()
    await initMap()
  }
)

function onDialogClosed() {
  destroyMap()
  mapError.value = false
}

onBeforeUnmount(() => {
  destroyMap()
})
</script>

<style scoped>
/* 你原样式全部保留（我只补了一个图片占位样式） */
.container {
  position: relative;
  padding-top: 20px;
  min-width: 1400px;
}

.main-content {
  display: flex;
  gap: 30px;
  margin: 30px auto;
  max-width: 1400px;
  padding: 0 40px;
}

/* 左侧侧边栏 */
.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.search-box {
  margin-bottom: 30px;
}

:deep(.search-input .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.category-list {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a3f35;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #d4a574;
}

.category-scroll {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #5a4f45;
  border-radius: 4px;
  padding: 10px 8px;
}

.category-item:hover {
  background-color: rgba(212, 165, 116, 0.1);
  color: #3d3328;
}

.category-item.active {
  background-color: rgba(212, 165, 116, 0.2);
  color: #8b5a2b;
  font-weight: 600;
}

.expand-icon {
  font-size: 12px;
  margin: 0 4px;
}

/* 城市列表 */
.cities-list {
  margin-left: 20px;
  padding-top: 8px;
  border-left: 2px solid #d4a574;
}

.city-item {
  display: flex;
  align-items: center;
  padding: 8px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #5a4f45;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 4px;
}

.city-item:hover {
  background-color: rgba(212, 165, 116, 0.1);
  color: #3d3328;
  padding-left: 12px;
}

.city-item.active {
  background-color: rgba(212, 165, 116, 0.25);
  color: #8b5a2b;
  font-weight: 600;
}

.category-name {
  flex: 1;
}
.city-name {
  flex: 1;
}

.category-count {
  background-color: #d4a574;
  color: #fff;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
}

/* 非遗十大类 */
.heritage-classes {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(200, 181, 150, 0.1) 100%);
}
.class-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.heritage-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}
:deep(.heritage-tag:hover) {
  opacity: 0.8;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
}

/* 顶部标签 */
.top-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  min-height: 30px;
}
.tag {
  background-color: rgba(212, 165, 116, 0.2);
  color: #8b5a2b;
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.heritage-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.heritage-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f0f0f0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.heritage-card:hover .card-image {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.heritage-card:hover .card-overlay {
  opacity: 1;
}

.view-btn {
  background: linear-gradient(135deg, #d4a574 0%, #c8956a 100%);
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: linear-gradient(135deg, #c8956a 0%, #b87f54 100%);
  transform: scale(1.05);
}

.card-info {
  padding: 15px;
}

.card-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #4a3f35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-category {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #8b5a2b;
  background-color: rgba(212, 165, 116, 0.1);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-location {
  margin: 0;
  font-size: 12px;
  color: #999;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  color: #5a4f45;
}

:deep(.el-pagination button:hover),
:deep(.el-pagination .el-pager li:hover) {
  color: #3d3328;
}

/* 装饰元素 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.2) 0%, rgba(212, 165, 116, 0) 70%);
  pointer-events: none;
}
.circle-1 {
  width: 300px;
  height: 300px;
  top: 100px;
  right: 50px;
}
.circle-2 {
  width: 400px;
  height: 400px;
  bottom: 200px;
  left: 100px;
}

/* ======== 弹窗：详情页同款风格 + 背景层 ======== */
:deep(.heritage-detail-dialog) {
  background: transparent;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
  border-radius: 16px;
}
:deep(.heritage-detail-dialog .el-dialog__header) {
  padding: 0;
  margin: 0;
}
:deep(.heritage-detail-dialog .el-dialog__body) {
  padding: 0;
}

.detail-surface {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 16px;
}

.detail-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/figures/bg-header.jpg') center / cover no-repeat;
  transform: scale(1.04);
  filter: blur(1.2px) saturate(1.02);
  opacity: 0.95;
  z-index: -2;
  pointer-events: none;
}

.detail-surface::after {
  content: '';
  position: absolute;
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

.detail-container {
  width: 100%;
  margin: 0;
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
  padding: 14px 18px;

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
  margin-top: 22px;
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

.detail-img-placeholder {
  background: rgba(240, 230, 214, 0.65);
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

@media (max-width: 1024px) {
  .main-content {
    gap: 20px;
    padding: 0 30px;
  }
  .sidebar {
    width: 240px;
  }
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 20px;
    padding: 0 20px;
  }
  .sidebar {
    width: 100%;
  }
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  .card-image-wrapper {
    height: 150px;
  }

  .detail-content {
    flex-direction: column;
  }
  .detail-img-container {
    margin: 0 auto;
    flex: 1;
    width: 100%;
    max-width: 420px;
  }
  .info-item {
    flex-direction: column;
  }
  .info-label {
    margin-bottom: 10px;
    margin-right: 0;
    width: 100%;
  }
  .detail-container {
    padding: 18px;
  }
}
</style>
