<template>
  <div class="container">
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
.container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* 顶部英雄区 */
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
  font-size: 56px;
  font-weight: bold;
  margin: 0 0 10px 0;
  letter-spacing: 4px;
}

.hero-title p {
  font-size: 16px;
  margin: 0;
  letter-spacing: 2px;
}

/* 中部三大板块轮播 */
.middle-carousel-section {
  width: 100%;
  padding: 60px 0;
  background: linear-gradient(135deg, #f8f3eb 0%, #f0e9dc 100%);
  position: relative;
}

.carousel-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.carousel-panel {
  flex: 0 0 100%;
  min-height: 450px;
  padding: 0 20px;
  box-sizing: border-box;
}

.panel-content {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(139, 90, 43, 0.15);
  border: 1px solid rgba(212, 165, 116, 0.3);
}

.panel-title {
  font-size: 28px;
  font-weight: 600;
  color: #4a3f35;
  margin: 0 0 40px 0;
  padding-bottom: 20px;
  border-bottom: 4px solid #d4a574;
  text-align: center;
  position: relative;
}

.panel-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: #8b5a2b;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
}

.panel-item {
  background: rgba(248, 243, 235, 0.8);
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  text-align: center;
}

.panel-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(139, 90, 43, 0.2);
  border-color: rgba(212, 165, 116, 0.4);
  background: white;
}

.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.item-icon {
  font-size: 42px;
  margin-bottom: 5px;
}

.item-content h4 {
  margin: 0;
  font-size: 16px;
  color: #4a3f35;
  font-weight: 600;
  line-height: 1.4;
}

.item-content p {
  margin: 0;
  font-size: 14px;
  color: #8b5a2b;
  opacity: 0.9;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #d4a574, #c8956a);
  color: white;
  cursor: pointer;
  font-size: 24px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(139, 90, 43, 0.4);
  z-index: 10;
}

.carousel-btn:hover {
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 12px 30px rgba(139, 90, 43, 0.5);
}

.carousel-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.left-btn {
  left: 10px;
}

.right-btn {
  right: 10px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: rgba(212, 165, 116, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator:hover {
  background: rgba(212, 165, 116, 0.8);
  transform: scale(1.3);
}

.indicator.active {
  background: linear-gradient(135deg, #d4a574, #c8956a);
  transform: scale(1.5);
}

/* 下部三列展示 */
.bottom-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  padding: 80px 40px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(232, 213, 183, 0.3) 0%, rgba(212, 197, 169, 0.3) 100%);
}

.content-column {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
  transition: all 0.4s ease;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.content-column:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 45px rgba(139, 90, 43, 0.2);
}

.column-title {
  font-size: 20px;
  font-weight: 600;
  color: #4a3f35;
  margin: 0 0 30px 0;
  padding-bottom: 18px;
  border-bottom: 3px solid #d4a574;
  position: relative;
}

.column-title::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 80px;
  height: 3px;
  background: #8b5a2b;
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  padding: 16px 0;
  color: #5a4f45;
  font-size: 16px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-item:hover {
  color: #3d3328;
  padding-left: 15px;
  background: rgba(212, 165, 116, 0.08);
  border-radius: 8px;
  padding-left: 20px;
  margin-left: -20px;
  padding-right: 20px;
  margin-right: -20px;
}

.list-item:last-child {
  border-bottom: none;
}

.list-icon {
  font-size: 18px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .carousel-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
  
  .bottom-section {
    max-width: 1200px;
    gap: 40px;
    padding: 60px 30px;
  }
}

@media (max-width: 1024px) {
  .hero-title h1 {
    font-size: 42px;
  }
  
  .carousel-container {
    max-width: 960px;
  }
  
  .carousel-panel {
    min-height: 400px;
  }
  
  .panel-title {
    font-size: 24px;
    margin-bottom: 30px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .panel-item {
    padding: 20px;
  }
  
  .item-icon {
    font-size: 36px;
  }
  
  .carousel-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .bottom-section {
    max-width: 960px;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    padding: 50px 30px;
  }
}

@media (max-width: 768px) {
  .hero-title h1 {
    font-size: 32px;
  }
  
  .hero-title p {
    font-size: 14px;
  }
  
  .middle-carousel-section {
    padding: 40px 0;
  }
  
  .carousel-container {
    max-width: 100%;
    padding: 0 20px;
  }
  
  .carousel-panel {
    min-height: 350px;
    padding: 0 10px;
  }
  
  .panel-content {
    padding: 30px;
    border-radius: 16px;
  }
  
  .panel-title {
    font-size: 20px;
    margin-bottom: 25px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }
  
  .panel-item {
    padding: 18px;
  }
  
  .item-icon {
    font-size: 32px;
  }
  
  .item-content h4 {
    font-size: 14px;
  }
  
  .item-content p {
    font-size: 12px;
  }
  
  .carousel-btn {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  
  .carousel-indicators {
    margin-top: 20px;
  }
  
  .bottom-section {
    max-width: 100%;
    grid-template-columns: 1fr;
    gap: 25px;
    padding: 40px 25px;
  }
  
  .content-column {
    padding: 30px;
  }
}

@media (max-width: 480px) {
  .hero-title h1 {
    font-size: 24px;
  }
  
  .hero-title p {
    font-size: 12px;
  }
  
  .carousel-container {
    padding: 0 15px;
  }
  
  .panel-content {
    padding: 20px;
  }
  
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
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
    font-size: 11px;
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .indicator {
    width: 12px;
    height: 12px;
  }
}
</style>