<template>
  <div class="page-wrapper">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 顶部大背景区域 -->
    <div class="hero-section">
      <div class="hero-bg">
        <img src="https://via.placeholder.com/1400x300?text=大美非遗" alt="hero" class="hero-image" />
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
          <div class="carousel-container" ref="carouselContainer">
            <!-- 轮播箭头按钮 -->
            <button class="carousel-btn left-btn" @click="prevPanel">❮</button>
            <button class="carousel-btn right-btn" @click="nextPanel">❯</button>
            
            <!-- 轮播轨道 -->
            <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
              <!-- 面板1：非遗传承人 -->
              <div class="carousel-panel">
                <div class="panel-content">
                  <h3 class="panel-title">非遗传承人</h3>
                  <div class="items-grid">
                    <div
                      v-for="person in inheritors"
                      :key="person.id"
                      class="panel-item"
                    >
                      <div class="item-content">
                        <div class="item-icon">👨‍🎨</div>
                        <h4>{{ person.name }}</h4>
                        <p>{{ person.heritage }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 面板2：相关书籍 -->
              <div class="carousel-panel">
                <div class="panel-content">
                  <h3 class="panel-title">相关书籍</h3>
                  <div class="items-grid">
                    <div
                      v-for="book in books"
                      :key="book.id"
                      class="panel-item"
                    >
                      <div class="item-content">
                        <div class="item-icon">📚</div>
                        <h4>{{ book.title }}</h4>
                        <p>点击查看详情</p>
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
            
            <!-- 轮播指示器 -->
            <div class="carousel-indicators">
              <button
                v-for="(panel, index) in 3"
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
          <!-- 热播影视 -->
          <div class="content-column">
            <h3 class="column-title">热播影视</h3>
            <ul class="content-list">
              <li v-for="item in hotVideos" :key="item.id" class="list-item">
                <span class="list-icon">▶️</span>
                {{ item.title }}
              </li>
            </ul>
          </div>

          <!-- 热读书籍 -->
          <div class="content-column">
            <h3 class="column-title">热读书籍</h3>
            <ul class="content-list">
              <li v-for="item in hotBooks" :key="item.id" class="list-item">
                <span class="list-icon">📖</span>
                {{ item.title }}
              </li>
            </ul>
          </div>

          <!-- 热门人物 -->
          <div class="content-column">
            <h3 class="column-title">热门人物</h3>
            <ul class="content-list">
              <li v-for="item in hotPeople" :key="item.id" class="list-item">
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
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from '../components/NavBar.vue'

// 当前轮播索引
const currentIndex = ref(0)

// 轮播控制
const nextPanel = () => {
  currentIndex.value = (currentIndex.value + 1) % 3
}

const prevPanel = () => {
  currentIndex.value = (currentIndex.value - 1 + 3) % 3
}

const goToPanel = (index: number) => {
  currentIndex.value = index
}

// 自动轮播
let autoScrollInterval: ReturnType<typeof setInterval>

const startAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    nextPanel()
  }, 5000)
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
  }
}

// 非遗传承人
const inheritors = ref([
  { id: 1, name: '张三', heritage: '昆曲' },
  { id: 2, name: '李四', heritage: '皮影戏' },
  { id: 3, name: '王五', heritage: '剪纸' },
  { id: 4, name: '赵六', heritage: '陶瓷' },
  { id: 5, name: '钱七', heritage: '刺绣' },
  { id: 6, name: '孙八', heritage: '书法' },
  { id: 7, name: '周九', heritage: '茶艺' },
])

// 相关书籍
const books = ref([
  { id: 1, title: '非遗保护的理论探讨' },
  { id: 2, title: '手艺人：湖南失的江南医学' },
  { id: 3, title: '非物质文化遗产论' },
  { id: 4, title: '江苏国家级非遗的文化遗产概览' },
  { id: 5, title: '非遗的活态传承与社区实践' },
])

// 相关影视
const videos = ref([
  { id: 1, title: '我在故宫修文物', director: '纪录片' },
  { id: 2, title: '下町的匠人', director: '纪录片' },
  { id: 3, title: '中国手作', director: '纪录片' },
  { id: 4, title: '传承', director: '纪录片' },
  { id: 5, title: '曲曲人百艺', director: '纪录片' },
  { id: 6, title: '天工开物', director: '纪录片' },
])

// 热播影视
const hotVideos = ref([
  { id: 1, title: '我在故宫修文物' },
  { id: 2, title: '下町的匠人' },
  { id: 3, title: '中国手作' },
  { id: 4, title: '传承' },
  { id: 5, title: '曲曲人百艺' },
])

// 热读书籍
const hotBooks = ref([
  { id: 1, title: '非遗保护的理论探讨' },
  { id: 2, title: '手艺人：湖南失的江南医学' },
  { id: 3, title: '非物质文化遗产论' },
  { id: 4, title: '江苏国家级非遗的文化遗产概览' },
  { id: 5, title: '非遗的活态传承与社区实践' },
])

// 热门人物
const hotPeople = ref([
  { id: 1, name: '干茜' },
  { id: 2, name: '周笑燕' },
  { id: 3, name: '王屹文' },
  { id: 4, name: '王杨兴' },
  { id: 5, name: '汪美丽' },
  { id: 6, name: '姚建茗' },
])

// 生命周期
onMounted(() => {
  startAutoScroll()
})

onUnmounted(() => {
  stopAutoScroll()
})
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
}
</style>