<template>
  <div class="page-wrapper">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 顶部大背景区域 -->
    <div class="hero-section">
      <div class="hero-bg">
        <img
          src="https://via.placeholder.com/1400x300?text=大美非遗"
          alt="hero"
          class="hero-image"
        />
        <div class="hero-title">
          <h1>大美非遗</h1>
          <p>长三角非物质文化遗产展示平台</p>
        </div>
      </div>
    </div>

    <!-- 主要内容容器 -->
    <div class="main-content-wrapper">
      <div class="main-content">
        <!-- 中部三大板块轮播 -->
        <div class="middle-carousel-section">
          <div class="carousel-container">
            <button class="carousel-btn left-btn" @click="prevPanel">❮</button>
            <button class="carousel-btn right-btn" @click="nextPanel">❯</button>

            <div
              class="carousel-track"
              :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
            >
              <!-- 面板1：非遗传承人 -->
              <div class="carousel-panel">
                <div
                  class="panel-content inheritor-panel"
                  @click="goToInheritorOverview"
                >
                  <h3 class="panel-title">非遗传承人</h3>
                  <div class="inheritor-summary">
                    <p>
                      非遗传承人是非物质文化遗产活态延续的核心主体，
                      他们以技艺、记忆与实践，将传统文化在当代社会中不断传递。
                    </p>
                    <p>
                      长三角地区汇聚了众多国家级、省级代表性传承人，
                      覆盖戏曲、手工技艺、民俗、医药与饮食文化等多个领域，
                      构成了中国非遗保护与传承的重要实践区域。
                    </p>
                  </div>
                  <div class="enter-hint">点击进入非遗传承人专题 →</div>
                </div>
              </div>

              <!-- 面板2：相关书籍 -->
              <div class="carousel-panel">
                <div class="panel-content">
                  <h3 class="panel-title">相关书籍</h3>
                  <div class="items-grid">
                    <div
                      v-for="pdf in pdfFiles"
                      :key="pdf.id"
                      class="panel-item"
                    >
                      <div class="item-content">
                        <div class="item-icon">📚</div>
                        <h4>{{ pdf.book_name }}</h4>
                        <p>下载次数: {{ pdf.download_count || 0 }}</p>
                        <!-- 下载按钮 -->
                        <button 
                          class="download-btn" 
                          @click.stop="downloadPdf(pdf.id)"
                          :disabled="isDownloading(pdf.id)"
                        >
                          {{ isDownloading(pdf.id) ? '下载中...' : '下载 PDF' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 面板3：相关影视 -->
              <div class="carousel-panel">
                <div class="panel-content">
                  <h3 class="panel-title">相关影视</h3>
                  <div class="items-grid">
                    <div
                      v-for="video in videos"
                      :key="video.id"
                      class="panel-item"
                      @click="video.link && openLink(video.link)"
                    >
                      <div class="item-content">
                        <div class="item-icon">🎬</div>
                        <h4>{{ video.title }}</h4>
                        <p>{{ video.director }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="carousel-indicators">
              <button
                v-for="(_, index) in 3"
                :key="index"
                class="indicator"
                :class="{ active: currentIndex === index }"
                @click="goToPanel(index)"
              ></button>
            </div>
          </div>
        </div>

        <!-- 下部三列展示 -->
        <div class="bottom-section">
          <div class="content-column">
            <h3 class="column-title">热播影视</h3>
            <ul class="content-list">
              <li
                v-for="item in hotVideos"
                :key="item.id"
                class="list-item"
                @click="item.link && openLink(item.link)"
              >
                <span class="list-icon">▶️</span>
                {{ item.title }}
              </li>
            </ul>
          </div>

          <div class="content-column">
            <h3 class="column-title">热读书籍</h3>
            <ul class="content-list">
              <li v-for="item in hotBooks" :key="item.id" class="list-item">
                <span class="list-icon">📖</span>
                {{ item.title }}
              </li>
            </ul>
          </div>

          <div class="content-column">
            <h3 class="column-title">热门人物</h3>
            <ul class="content-list">
              <li
                v-for="item in hotPeople"
                :key="item.id"
                class="list-item"
              >
                <span class="list-icon">👤</span>
                {{ item.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import NavBar from '../components/NavBar.vue'
  
  const router = useRouter()
  const API_BASE_URL = 'http://localhost:3000' // Node.js后端地址
  
  // 轮播相关
  const currentIndex = ref(0)
  const nextPanel = () => {
    currentIndex.value = (currentIndex.value + 1) % 3
  }
  const prevPanel = () => {
    currentIndex.value = (currentIndex.value - 1 + 3) % 3
  }
  const goToPanel = (index: number) => {
    currentIndex.value = index
  }
  
  let autoScrollInterval: ReturnType<typeof setInterval>
  const startAutoScroll = () => {
    autoScrollInterval = setInterval(nextPanel, 5000)
  }
  const stopAutoScroll = () => {
    clearInterval(autoScrollInterval)
  }
  
  const goToInheritorOverview = () => {
    router.push({ path: '/Content' })
  }
  
  // PDF文件相关
  const pdfFiles = ref<any[]>([])
  const downloadingIds = reactive(new Set<number>())
  
  // 获取PDF文件列表
  const fetchPdfFiles = async () => {
    try {
      console.log('请求URL:', 'http://localhost:3000/api/pdf/files?limit=6');
      fetch('http://localhost:3000/api/pdf/files?limit=6')
      
      const response = await fetch(`${API_BASE_URL}/api/pdf/files?limit=6`)
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('PDF文件获取成功:', data.data.length, '个项目')
        pdfFiles.value = data.data
      } else {
        console.warn('API返回成功: false', data.message)
        useFallbackData()
      }
    } catch (error) {
      console.error('获取PDF文件列表失败:', error)
      useFallbackData()
    }
  }
  
  // 使用备用数据
  const useFallbackData = () => {
  console.log('使用备用PDF数据')
  pdfFiles.value = [
    { 
      id: 1, 
      book_name: '中国的非物质文化遗产', 
      file_name: '中国的非物质文化遗产（《中国的非物质文化遗产》编写组_ (Z-Library).pdf',
      download_count: 0
    },
    { 
      id: 2, 
      book_name: '和爸妈游中国世界遗产非物质文化遗产名录遗言', 
      file_name: '和爸妈游中国世界遗产非物质文化遗产名录遗言(易磊)(Z-Library).pdf',
      download_count: 0
    },
    { 
      id: 3, 
      book_name: '安徽省非物质文化遗产乡土读本 皖南卷', 
      file_name: '安徽省非物质文化遗产乡土读本 皖南卷(安徽省非物质文_ (Z-Library).pdf',
      download_count: 0
    },
    { 
      id: 4, 
      book_name: '少数民族非遗蓝皮书 中国少数民族非物质文化遗产发展报告', 
      file_name: '少数民族非遗蓝皮书 中国少数民族非物质文化遗产发展报告_ (Z-Library).pdf',
      download_count: 0
    },
    { 
      id: 5, 
      book_name: '新疆非物质文化遗产集锦 第4卷 民俗', 
      file_name: '新疆非物质文化遗产集锦 第4卷 民俗(李季莲主编 e_ (Z-Library).pdf',
      download_count: 0
    },
    { 
      id: 6, 
      book_name: '钱塘记忆 杭州市非物质文化遗产新传播英 技艺卷', 
      file_name: '钱塘记忆 杭州市非物质文化遗产新传播英 技艺卷(杭州_ (Z-Library).pdf',
      download_count: 0
    }
  ]
}
  
  // 检查是否正在下载
  const isDownloading = (id: number) => {
    return downloadingIds.has(id)
  }
  
  // 下载PDF文件
  const downloadPdf = async (bookId: number) => {
    if (isDownloading(bookId)) {
      console.log('该文件已在下载中:', bookId)
      return
    }
  
    try {
      downloadingIds.add(bookId)
      
      console.log('开始下载PDF, ID:', bookId)
      
      // 调用Node.js后端下载接口
      const response = await fetch(`${API_BASE_URL}/api/pdf/download/${bookId}`)
      
      if (!response.ok) {
        let errorMessage = `下载失败 (HTTP ${response.status})`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // 如果响应不是JSON，使用默认错误信息
        }
        
        throw new Error(errorMessage)
      }
      
      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = `book_${bookId}.pdf`
      
      if (contentDisposition) {
        // 尝试从Content-Disposition头中提取文件名
        const match = contentDisposition.match(/filename="(.+?)"/)
        if (match && match[1]) {
          fileName = match[1]
        }
      }
      
      // 获取blob数据
      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log('下载完成:', fileName)
      
      // 更新本地下载次数
      const bookIndex = pdfFiles.value.findIndex(b => b.id === bookId)
      if (bookIndex !== -1) {
        pdfFiles.value[bookIndex].download_count = 
          (pdfFiles.value[bookIndex].download_count || 0) + 1
      }
      
      alert('下载成功！')
      
    } catch (err: any) {
      console.error('下载出错:', err)
      alert(`下载失败: ${err.message}`)
    } finally {
      downloadingIds.delete(bookId)
    }
  }
  
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }
  
  // 组件挂载时获取数据
  onMounted(() => {
    console.log('DetailView组件已挂载，正在获取PDF文件...')
    fetchPdfFiles()
    startAutoScroll()
  })
  
  onUnmounted(() => {
    stopAutoScroll()
  })
  
  /* ===== 其他数据（保持不变） ===== */
  const videos = ref([
    {
      id: 1,
      title: '非遗有新人',
      director: '纪录片',
      link: 'https://www.youtube.com/playlist?list=PLtFDvh1SGFq-t4LEvcTf4MXoxk-pVEFDO'
    },
    {
      id: 2,
      title: '守护非遗之美',
      director: '纪录片',
      link: 'https://tv.cctv.com/2024/12/22/VIDAsjUSrywjoV169gNyOa54241222.shtml'
    },
    {
      id: 3,
      title: '非遗里的中国',
      director: '纪录片',
      link: 'https://tv.cctv.com/2022/12/30/VIDAIxSnFuJtsqzH4HZK9Yc4221230.shtml'
    },
    {
      id: 4,
      title: '我在故宫修文物',
      director: '纪录片',
      link: 'https://www.youtube.com/playlist?list=PLqid5YompiAjYTq8ZBPA4NFdbnrKrWXQM'
    },
    {
      id: 5,
      title: '中华百工',
      director: '纪录片',
      link: 'https://www.youtube.com/playlist?list=PL0eGJygpmOH71cX3W-RxvYYG0_EME-vVz'
    },
    {
      id: 6,
      title: '一百年很长吗',
      director: '纪录片',
      link: 'http://www.docuchina.cn/2020/01/23/VIDAMJfKCVTuU9ivUzhTH0hi200123.shtml'
    }
  ])
  
  const hotVideos = ref([
    {
      id: 1,
      title: '非遗有新人',
      link: 'https://www.youtube.com/playlist?list=PLtFDvh1SGFq-t4LEvcTf4MXoxk-pVEFDO'
    },
    {
      id: 2,
      title: '守护非遗之美',
      link: 'https://tv.cctv.com/2024/12/22/VIDAsjUSrywjoV169gNyOa54241222.shtml'
    },
    {
      id: 3,
      title: '非遗里的中国',
      link: 'https://tv.cctv.com/2022/12/30/VIDAIxSnFuJtsqzH4HZK9Yc4221230.shtml'
    },
    {
      id: 4,
      title: '我在故宫修文物',
      link: 'https://www.youtube.com/playlist?list=PLqid5YompiAjYTq8ZBPA4NFdbnrKrWXQM'
    },
    {
      id: 5,
      title: '中华百工',
      link: 'https://www.youtube.com/playlist?list=PL0eGJygpmOH71cX3W-RxvYYG0_EME-vVz'
    }
  ])
  
  const hotBooks = ref([
    { id: 1, title: '非遗保护的理论探讨' },
    { id: 2, title: '手艺人：湖南失的江南医学' },
    { id: 3, title: '非物质文化遗产论' },
    { id: 4, title: '江苏国家级非遗的文化遗产概览' },
    { id: 5, title: '非遗的活态传承与社区实践' }
  ])
  
  const hotPeople = ref([
    { id: 1, name: '干茜' },
    { id: 2, name: '周笑燕' },
    { id: 3, name: '王屹文' },
    { id: 4, name: '王杨兴' },
    { id: 5, name: '汪美丽' },
    { id: 6, name: '姚建茗' }
  ])
  
  /* 通用打开链接 */
  const openLink = (url: string) => {
    window.open(url, '_blank')
  }
  </script> 

<style scoped>
/* 最重要的修复：添加全屏背景容器 */
.page-wrapper {
  position: relative;
  padding-top: 20px;
  min-width: 1400px;
}

/* 主要内容包装器 - 给背景色 */
.main-content-wrapper {
  flex: 1;
  width: 100%;
  background: linear-gradient(135deg, rgba(232, 213, 183, 0.3) 0%, rgba(212, 197, 169, 0.3) 100%);
}

/* 主要内容区域 - 关键修改：添加width: 100% */
.main-content {
  width: 100%;  /* 添加这一行！确保占据全宽 */
  max-width: 1200px;  /* 限制最大宽度 */
  margin: 0 auto;     /* 居中显示 */
  padding: 0 15px;    /* 添加左右内边距 */
  box-sizing: border-box;
}

/* 顶部英雄区 - 这部分应该全屏显示 */
.hero-section {
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
}

.hero-bg {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

.hero-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #4a3f35;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
  z-index: 2;
}

.hero-title h1 {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 10px 0;
  letter-spacing: 3px;
}

.hero-title p {
  font-size: 16px;
  margin: 0;
  letter-spacing: 2px;
}

/* 中部三大板块轮播 */
.middle-carousel-section {
  width: 100%;
  padding: 40px 0;
  background: linear-gradient(135deg, #f8f3eb 0%, #f0e9dc 100%);
  position: relative;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.carousel-panel {
  flex: 0 0 100%;
  min-height: 380px;
  box-sizing: border-box;
}

.panel-content {
  width: 100%;
  height: 100%;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(139, 90, 43, 0.12);
  border: 1px solid rgba(212, 165, 116, 0.25);
}

.panel-title {
  font-size: 24px;
  font-weight: 600;
  color: #4a3f35;
  margin: 0 0 30px 0;
  padding-bottom: 15px;
  border-bottom: 3px solid #d4a574;
  text-align: center;
  position: relative;
}

.panel-title::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: #8b5a2b;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.panel-item {
  background: rgba(248, 243, 235, 0.8);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.2);
  text-align: center;
}

.panel-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(139, 90, 43, 0.15);
  border-color: rgba(212, 165, 116, 0.4);
  background: white;
}

.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.item-icon {
  font-size: 36px;
  margin-bottom: 5px;
}

.item-content h4 {
  margin: 0;
  font-size: 14px;
  color: #4a3f35;
  font-weight: 600;
  line-height: 1.4;
}

.item-content p {
  margin: 0;
  font-size: 13px;
  color: #8b5a2b;
  opacity: 0.9;
  line-height: 1.4;
}

/* 文件大小和下载次数样式 */
.item-content p:nth-of-type(1) {  /* 文件大小 */
  color: #666;
  font-size: 12px;
}

.item-content p:nth-of-type(2) {  /* 下载次数 */
  color: #d4a574;
  font-size: 12px;
  font-weight: 500;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #d4a574, #c8956a);
  color: white;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 15px rgba(139, 90, 43, 0.3);
  z-index: 10;
}

.carousel-btn:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 20px rgba(139, 90, 43, 0.4);
}

.carousel-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.left-btn {
  left: 0;
}

.right-btn {
  right: 0;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 25px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(212, 165, 116, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator:hover {
  background: rgba(212, 165, 116, 0.7);
  transform: scale(1.2);
}

.indicator.active {
  background: linear-gradient(135deg, #d4a574, #c8956a);
  transform: scale(1.3);
}
/* 非遗传承人专题面板 */
.inheritor-panel {
  cursor: pointer;
  transition: all 0.35s ease;
}

.inheritor-panel:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(139, 90, 43, 0.22);
}

/* 综述文字 */
.inheritor-summary {
  max-width: 720px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.9;
  color: #5a4f45;
  text-align: center;
}

.inheritor-summary p {
  margin-bottom: 14px;
}

/* 进入提示 */
.enter-hint {
  margin-top: 30px;
  font-size: 14px;
  font-weight: 600;
  color: #8b5a2b;
  letter-spacing: 1px;
}



/* 下部三列展示 */
.bottom-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 35px;
  padding: 50px 0;
  width: 100%;
}

.content-column {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.content-column:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(139, 90, 43, 0.15);
}

.column-title {
  font-size: 18px;
  font-weight: 600;
  color: #4a3f35;
  margin: 0 0 25px 0;
  padding-bottom: 15px;
  border-bottom: 2px solid #d4a574;
  position: relative;
}

.column-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: #8b5a2b;
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  padding: 14px 0;
  color: #5a4f45;
  font-size: 14px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-item:hover {
  color: #3d3328;
  padding-left: 12px;
  background: rgba(212, 165, 116, 0.06);
  border-radius: 6px;
}

.list-item:last-child {
  border-bottom: none;
}

.list-icon {
  font-size: 16px;
  opacity: 0.7;
  min-width: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    max-width: 1000px;
    padding: 0 20px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 18px;
  }
  
  .panel-item {
    padding: 18px;
  }
  
  .bottom-section {
    gap: 30px;
  }
}

@media (max-width: 1024px) {
  .hero-title h1 {
    font-size: 36px;
  }
  
  .main-content {
    max-width: 900px;
  }
  
  .carousel-panel {
    min-height: 350px;
  }
  
  .panel-title {
    font-size: 22px;
    margin-bottom: 25px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }
  
  .panel-item {
    padding: 16px;
  }
  
  .item-icon {
    font-size: 32px;
  }
  
  .item-content h4 {
    font-size: 13px;
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .bottom-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  
  .content-column {
    padding: 25px;
  }
}

@media (max-width: 768px) {
  .hero-title h1 {
    font-size: 28px;
  }
  
  .hero-title p {
    font-size: 14px;
  }
  
  .main-content {
    padding: 0 15px;
  }
  
  .middle-carousel-section {
    padding: 30px 0;
  }
  
  .carousel-panel {
    min-height: 320px;
  }
  
  .panel-content {
    padding: 25px;
    border-radius: 14px;
  }
  
  .panel-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 14px;
  }
  
  .panel-item {
    padding: 15px;
  }
  
  .item-icon {
    font-size: 28px;
  }
  
  .item-content h4 {
    font-size: 13px;
  }
  
  .item-content p {
    font-size: 12px;
  }
  
  .carousel-btn {
    width: 38px;
    height: 38px;
    font-size: 15px;
  }
  
  .carousel-indicators {
    margin-top: 20px;
    gap: 10px;
  }
  
  .bottom-section {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 30px 0;
  }
  
  .content-column {
    padding: 22px;
  }
  
  .column-title {
    font-size: 17px;
    margin-bottom: 20px;
  }
  
  .list-item {
    font-size: 14px;
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .hero-title h1 {
    font-size: 24px;
  }
  
  .hero-title p {
    font-size: 13px;
  }
  
  .main-content {
    padding: 0 12px;
  }
  
  .panel-content {
    padding: 20px;
  }
  
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .panel-item {
    padding: 14px;
  }
  
  .item-icon {
    font-size: 26px;
  }
  
  .item-content h4 {
    font-size: 12px;
  }
  
  .item-content p {
    font-size: 11px;
  }
  
  .carousel-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
  
  .content-column {
    padding: 20px;
  }
  
  .list-item {
    font-size: 13px;
  }

  /* 下载按钮样式 */
.download-btn {
  margin-top: 12px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #d4a574, #c8956a);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 140px;
  box-shadow: 0 4px 8px rgba(139, 90, 43, 0.2);
}

.download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #c8956a, #b8845a);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(139, 90, 43, 0.3);
}

.download-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(139, 90, 43, 0.2);
}

.download-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

/* 响应式调整下载按钮 */
@media (max-width: 768px) {
  .download-btn {
    padding: 8px 14px;
    font-size: 13px;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .download-btn {
    padding: 6px 12px;
    font-size: 12px;
    min-width: 100px;
  }
}
  
}
</style>