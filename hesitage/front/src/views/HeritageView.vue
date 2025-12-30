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
            >
              <!-- 省份项 -->
              <div
                :class="['category-item', { active: selectedProvince === province.id }]"
                @click="toggleProvince(province.id)"
              >
                <span class="category-name">{{ province.name }}</span>
                <span v-if="province.id !== 'all'" class="expand-icon">
                  {{ expandedProvinces.includes(province.id) ? '▼' : '▶' }}
                </span>
                <span class="category-count">{{ province.count }}</span>
              </div>

              <!-- 地级市子项 - 紧贴在省份下方 -->
              <div v-if="selectedProvince === province.id && citiesByProvince[province.id]" class="cities-list">
                <div
                  v-for="city in citiesByProvince[province.id]"
                  :key="city"
                  :class="['city-item', { active: selectedCity === city }]"
                  @click.stop="handleSelectCity(city)"
                >
                  <span class="city-name">{{ city }}</span>
                </div>
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
              @click="handleSelectClass(cls.id)"
              class="heritage-tag"
            >
              {{ cls.name }}
            </el-tag>
          </div>
          <el-button
            v-if="selectedClass || selectedProvince !== 'all' || selectedCity || searchQuery"
            type="danger"
            link
            @click="clearAllFilters"
            class="clear-filters-btn"
          >
            清除所有筛选
          </el-button>
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
            :key="item.id"
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
              <p class="card-location">{{ item.location }}</p>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="fetchHeritageItems"
          />
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div v-if="showDetail && selectedItem" class="modal-overlay" @click="showDetail = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showDetail = false">✕</button>
        
        <div class="detail-grid">
          <!-- 左侧图片 -->
          <div class="detail-img-section">
            <img :src="selectedItem.image" :alt="selectedItem.name" class="detail-image" />
          </div>

          <!-- 右侧信息区域 -->
          <div class="detail-info-section">
            <h2 class="detail-title">{{ selectedItem.name }}</h2>
            
            <div class="info-item">
              <span class="info-label">所在地区：</span>
              <span class="info-value">{{ selectedItem.location }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">项目简介：</span>
              <p class="info-description">{{ selectedItem.description }}</p>
            </div>

            <!-- 地图容器 -->
            <div class="info-item map-item">
              <span class="info-label">地理位置：</span>
              <div ref="mapContainer" class="amap-container"></div>
              <div v-if="mapError" class="map-error">地图加载失败</div>
              
              <!-- 坐标信息 -->
              <div v-if="mapData" class="coordinate-info">
                <p><strong>纬度：</strong> {{ mapData.y.toFixed(6) }}</p>
                <p><strong>经度：</strong> {{ mapData.x.toFixed(6) }}</p>
                <p v-if="mapData.location"><strong>位置：</strong> {{ mapData.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import NavBar from '../components/NavBar.vue'
import { api } from '../utils/api'

declare global {
  interface Window {
    T?: any
  }
}

const route = useRoute()

// 数据
const searchQuery = ref('')
const selectedProvince = ref('all')
const selectedCity = ref('')
const selectedClass = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(9)
const showDetail = ref(false)
const selectedItem = ref<any>(null)
const expandedProvinces = ref<string[]>([])
const heritageItems = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const provinces = ref([
  { id: 'all', name: '全部地区', count: 500 },
  { id: '江苏', name: '江苏', count: 134 },
  { id: '浙江', name: '浙江', count: 102 },
  { id: '上海', name: '上海', count: 35 },
  { id: '安徽', name: '安徽', count: 89 },
])

// 地级市数据
const citiesByProvince = ref<Record<string, string[]>>({
  '江苏': ['南通', '常州', '镇江', '扬州', '泰州', '徐州', '连云港', '淮安', '苏州', '无锡'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州'],
  '上海': ['黄浦', '静安', '徐汇', '长宁', '普陀', '虹口', '杨浦', '浦东'],
  '安徽': ['合肥', '芜湖', '马鞍山', '安庆', '黄山', '阜阳', '六安', '亳州', '池州', '宣城'],
})

const heritageclasses = ref([
  { id: '民间文学', name: '民间文学' },
  { id: '说唱艺曲', name: '说唱艺曲' },
  { id: '体育游艺', name: '体育游艺' },
  { id: '传统技艺', name: '传统技艺' },
  { id: '工艺美术', name: '工艺美术' },
  { id: '传统医药', name: '传统医药' },
  { id: '民俗', name: '民俗' },
  { id: '传统戏剧', name: '传统戏剧' },
  { id: '音乐舞蹈', name: '音乐舞蹈' },
  { id: '风俗节庆', name: '风俗节庆' },
])

// 获取省份统计数据（从数据库）
const fetchProvinceCounts = async () => {
  try {
    const response = await api.get('/heritage/statistics/by-province')
    if (response.success && Array.isArray(response.data)) {
      // response.data 返回数组 [{ province: '江苏', count: 134 }, ...]
      const countMap = new Map<string, number>()
      let totalCount = 0
      
      response.data.forEach((item: any) => {
        const prov = item.province || ''
        const count = parseInt(item.count) || 0
        countMap.set(prov, count)
        totalCount += count
      })
      
      provinces.value = provinces.value.map(province => {
        if (province.id === 'all') {
          return { ...province, count: totalCount }
        }
        return { ...province, count: countMap.get(province.id) || 0 }
      })
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取非遗项目数据
const fetchHeritageItems = async () => {
  try {
    loading.value = true
    const params: Record<string, any> = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    }
    
    // 添加过滤参数
    if (selectedProvince.value !== 'all') {
      params.province = selectedProvince.value
    }
    if (selectedCity.value) {
      params.city = selectedCity.value
    }
    if (selectedClass.value) {
      params.category = selectedClass.value
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const response = await api.get('/heritage', { params })
    
    // api.get 直接返回响应体，不是 { data: 响应体 } 的结构
    if (response.success) {
      // 图片服务器地址
      const imageServer = 'http://47.110.134.147'
      // 转换数据格式以适应现有的模板
      heritageItems.value = response.data.map((item: any) => ({
        id: item.name_cn,
        name: item.name_cn,
        category: item.categorycn || '未分类',
        location: item.place_merged || '未知',
        province: item.provincecn,
        image: item.image_url ? `${imageServer}${item.image_url}` : '/placeholder.png',
        description: item.intro || '暂无描述',
        significance: '国家级非物质文化遗产',
        latitude: item.y,
        longitude: item.x
      }))
      total.value = (response as any).total || 0
    } else {
      ElMessage.error('加载数据失败')
    }
  } catch (error) {
    console.error('获取数据错误:', error)
    ElMessage.error('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

// 初始加载
onMounted(() => {
  // 从 URL 查询参数读取筛选条件
  if (route.query.province) {
    selectedProvince.value = route.query.province as string
  }
  if (route.query.city) {
    selectedCity.value = route.query.city as string
  }
  if (route.query.category) {
    selectedClass.value = route.query.category as string
  }
  
  fetchProvinceCounts()  // 先获取统计数据
  fetchHeritageItems()
})

const topTags = computed(() => {
  const tags = []
  if (selectedProvince.value !== 'all') {
    tags.push(`地区：${selectedProvince.value}`)
  }
  if (selectedCity.value) {
    tags.push(`城市：${selectedCity.value}`)
  }
  if (selectedClass.value) {
    const cls = heritageclasses.value.find((c) => c.id === selectedClass.value)
    if (cls) tags.push(`分类：${cls.name}`)
  }
  if (searchQuery.value) {
    tags.push(`搜索：${searchQuery.value}`)
  }
  return tags
})

// 分页数据 - 由于数据从 API 获取，已经分页，直接使用
const paginatedItems = computed(() => {
  return heritageItems.value
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
  fetchHeritageItems()
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
  currentPage.value = 1
  fetchHeritageItems()
}

const selectItem = (item: any) => {
  selectedItem.value = item
  showDetail.value = true
}

const toggleProvince = (provinceId: string) => {
  if (provinceId === 'all') {
    selectedProvince.value = 'all'
    selectedCity.value = ''
  } else {
    selectedProvince.value = provinceId
    selectedCity.value = ''
  }
  currentPage.value = 1
  fetchHeritageItems()
}

const handleSelectClass = (classId: string) => {
  // 点击已选中的类别时取消选中，否则选中该类别
  selectedClass.value = selectedClass.value === classId ? null : classId
  currentPage.value = 1
  fetchHeritageItems()
}

const handleSelectCity = (city: string) => {
  // 点击已选中的城市时取消选中，否则选中该城市
  selectedCity.value = selectedCity.value === city ? '' : city
  currentPage.value = 1
  fetchHeritageItems()
}

const clearAllFilters = () => {
  // 清除所有筛选条件
  searchQuery.value = ''
  selectedProvince.value = 'all'
  selectedCity.value = ''
  selectedClass.value = null
  currentPage.value = 1
  fetchHeritageItems()
}

// 地图相关变量
const mapContainer = ref<HTMLElement | null>(null)
const mapError = ref(false)
const mapData = ref<any>(null)
let tiandituMap: any = null
let tiandituLoaded = false

// 加载天地图 SDK
const loadTiandituSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.T) {
      tiandituLoaded = true
      resolve()
      return
    }

    // 使用 HTTP 而不是 HTTPS 来避免证书问题
    const script = document.createElement('script')
    script.src = 'http://api.tianditu.com/api?v=4.0&tk=be91f36f4ea2161b0721a5b4f7628a3d'
    script.async = true
    script.onload = () => {
      tiandituLoaded = true
      console.log('天地图 SDK 加载成功')
      resolve()
    }
    script.onerror = (error) => {
      console.error('天地图 SDK 加载失败:', error)
      // 尝试备用地址（如果主地址失败）
      if (script.src.startsWith('http://')) {
        // 不再重试，直接失败
        reject(new Error('天地图 SDK 加载失败'))
      }
    }
    document.head.appendChild(script)
  })
}

// 初始化天地图
const initTiandituMap = async () => {
  try {
    mapError.value = false
    mapData.value = null
    
    if (!mapContainer.value) {
      console.error('地图容器不存在')
      return
    }

    // 确保 SDK 已加载
    if (!tiandituLoaded) {
      await loadTiandituSDK()
    }

    // 等待 DOM 准备好
    await nextTick()

    // 获取选中项的坐标
    if (!selectedItem.value) {
      console.error('未选中项目')
      return
    }

    // 请求坐标数据
    const response = await api.get(`/heritage/coordinates/${encodeURIComponent(selectedItem.value.location)}`)

    if (response.success && response.data) {
      mapData.value = response.data
      const { x, y } = response.data
      
      // 销毁旧的地图实例
      if (tiandituMap) {
        try {
          tiandituMap = null
        } catch (e) {
          console.warn('销毁旧地图失败:', e)
        }
      }

      // 确保容器存在
      if (!mapContainer.value || !window.T) {
        console.error('地图初始化条件不满足')
        mapError.value = true
        return
      }

      // 创建新的地图实例
      try {
        // 清空容器
        mapContainer.value.innerHTML = ''
        
        // 创建天地图实例
        tiandituMap = new window.T.Map(mapContainer.value, {
          center: new window.T.LngLat(x, y),
          zoom: 12
        })
        
        // 添加标记
        setTimeout(() => {
          if (tiandituMap && window.T) {
            try {
              const marker = new window.T.Marker(new window.T.LngLat(x, y))
              tiandituMap.addOverLay(marker)
              console.log('天地图标记添加成功', x, y)
            } catch (e) {
              console.warn('添加标记失败:', e)
            }
          }
        }, 300)
        
      } catch (e) {
        console.error('创建地图实例失败:', e)
        mapError.value = true
      }
    } else {
      mapError.value = true
      console.error('获取坐标失败')
    }
  } catch (error) {
    console.error('地图初始化失败:', error)
    mapError.value = true
  }
}

// 监听 showDetail 变化，当显示详情时初始化地图
watch(showDetail, async (newVal) => {
  if (newVal) {
    // 打开详情时初始化地图
    await nextTick()
    initTiandituMap()
  } else {
    // 关闭详情时销毁地图
    if (tiandituMap) {
      try {
        tiandituMap = null
      } catch (e) {
        console.warn('销毁地图出错:', e)
      }
    }
  }
}, { immediate: false })

// 组件卸载时清理
onBeforeUnmount(() => {
  if (tiandituMap) {
    try {
      tiandituMap = null
    } catch (e) {
      console.warn('组件卸载时销毁地图失败:', e)
    }
  }
})
</script>

<style scoped>
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
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #5a4f45;
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
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
  transition: transform 0.3s ease;
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
  border-radius: 4px;
}

.city-name {
  flex: 1;
}

.category-name {
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

.clear-filters-btn {
  display: block;
  margin-top: 12px;
  width: 100%;
  text-align: center;
  color: #f56c6c;
}

:deep(.clear-filters-btn:hover) {
  color: #dd001b;
  font-weight: 600;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

/* 详情模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  background: rgba(255, 248, 235, 0.95);
  border-radius: 16px;
  padding: 34px;
  width: 100%;
  max-width: 900px;
  position: relative;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid rgba(230, 200, 155, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(139, 69, 19, 0.1);
  border: 1px solid rgba(139, 69, 19, 0.2);
  color: #6d3811;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(139, 69, 19, 0.16);
  transform: scale(1.05);
}

.detail-grid {
  display: flex;
  gap: 36px;
  flex-wrap: nowrap;
  align-items: flex-start;
  min-height: 0;
}

.detail-img-section {
  flex: 0 0 320px;
}

.detail-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(230, 200, 155, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.detail-info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 70vh;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #8b4513;
  margin: 0;
  border-left: 4px solid #d4a574;
  padding-left: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #6d3811;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: #4a3f35;
  line-height: 1.6;
}

.info-description {
  font-size: 14px;
  color: #5a4f45;
  line-height: 1.8;
  margin: 0;
}

.significance {
  background: rgba(212, 165, 116, 0.1);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #d4a574;
}

.map-item {
  margin-top: 12px;
}

.amap-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  border: 1px solid rgba(230, 200, 155, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 10px;
  overflow: hidden;
  min-height: 300px;
  background: #f5f5f5;
}

.map-error {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  border: 1px solid rgba(230, 200, 155, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  color: #c0504d;
  font-size: 14px;
  margin-top: 10px;
}

.coordinate-info {
  margin-top: 12px;
  padding: 12px;
  background: rgba(212, 165, 116, 0.08);
  border-radius: 6px;
  border-left: 3px solid #d4a574;
  font-size: 13px;
}

.coordinate-info p {
  margin: 6px 0;
  line-height: 1.6;
  color: #5a4f45;
}

.coordinate-info strong {
  color: #6d3811;
  font-weight: 600;
}

@media (max-width: 768px) {
  .detail-grid {
    flex-direction: column;
    gap: 20px;
  }

  .detail-img-section {
    flex: none;
    width: 100%;
  }

  .modal-content {
    max-width: 95vw;
    padding: 20px;
  }
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

/* 响应式设计 */
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
}
</style>
