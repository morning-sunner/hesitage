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

      <!-- 中部三个滑动区域 -->
      <div class="middle-section">
        <!-- 左侧：非遗传承人 -->
        <div class="carousel-wrapper">
          <h3 class="carousel-title">非遗传承人</h3>
          <button class="carousel-btn left-btn" @click="scrollLeft('inheritor')">❮</button>
          <div class="carousel-container" ref="inheritorContainer">
            <div class="carousel-list">
              <div
                v-for="person in inheritors"
                :key="person.id"
                class="carousel-item inheritor-item"
              >
                <div class="item-content">
                  <h4>{{ person.name }}</h4>
                  <p>{{ person.heritage }}</p>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-btn right-btn" @click="scrollRight('inheritor')">❯</button>
        </div>

        <!-- 中间：相关书籍（弹出式） -->
        <div class="center-section">
          <div class="books-card">
            <h3>相关书籍</h3>
            <ul class="books-list">
              <li v-for="book in books" :key="book.id" class="book-item">
                <span class="book-icon">📖</span>
                {{ book.title }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 右侧：相关影视 -->
        <div class="carousel-wrapper">
          <h3 class="carousel-title">相关影视</h3>
          <button class="carousel-btn left-btn" @click="scrollLeft('video')">❮</button>
          <div class="carousel-container" ref="videoContainer">
            <div class="carousel-list">
              <div
                v-for="video in videos"
                :key="video.id"
                class="carousel-item video-item"
              >
                <div class="item-content">
                  <h4>{{ video.title }}</h4>
                  <p>{{ video.director }}</p>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-btn right-btn" @click="scrollRight('video')">❯</button>
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
            {{ item.title }}
          </li>
        </ul>
      </div>

      <!-- 热读书籍 -->
      <div class="content-column">
        <h3 class="column-title">热读书籍</h3>
        <ul class="content-list">
          <li v-for="item in hotBooks" :key="item.id" class="list-item">
            {{ item.title }}
          </li>
        </ul>
      </div>

      <!-- 热门人物 -->
      <div class="content-column">
        <h3 class="column-title">热门人物</h3>
        <ul class="content-list">
          <li v-for="item in hotPeople" :key="item.id" class="list-item">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '../components/NavBar.vue'

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

// 滚动控制
const inheritorContainer = ref<HTMLElement>()
const videoContainer = ref<HTMLElement>()

const scrollLeft = (type: 'inheritor' | 'video') => {
  const container = type === 'inheritor' ? inheritorContainer.value : videoContainer.value
  if (container) {
    container.scrollBy({ left: -200, behavior: 'smooth' })
  }
}

const scrollRight = (type: 'inheritor' | 'video') => {
  const container = type === 'inheritor' ? inheritorContainer.value : videoContainer.value
  if (container) {
    container.scrollBy({ left: 200, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.container {
  position: relative;
}

/* 顶部英雄区 */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
}

.hero-bg {
  position: relative;
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

/* 中部三个滑动区域 */
.middle-section {
  display: flex;
  gap: 30px;
  padding: 40px;
  max-width: 1400px;
  margin: -60px auto 0;
  position: relative;
  z-index: 10;
  align-items: flex-start;
}

.carousel-wrapper {
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
}

.carousel-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a3f35;
  margin: 0 0 15px 0;
  padding: 0 20px;
  text-align: center;
}

.carousel-container {
  overflow: hidden;
  position: relative;
}

.carousel-list {
  display: flex;
  gap: 15px;
  min-width: 100%;
  scroll-behavior: smooth;
}

.carousel-item {
  flex: 0 0 auto;
  width: 120px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(200, 181, 150, 0.1) 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.carousel-item:hover {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.2) 0%, rgba(200, 181, 150, 0.2) 100%);
  transform: translateY(-4px);
}

.item-content h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #4a3f35;
  font-weight: 600;
  word-break: break-word;
}

.item-content p {
  margin: 0;
  font-size: 11px;
  color: #8b5a2b;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(212, 165, 116, 0.7);
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  z-index: 5;
}

.carousel-btn:hover {
  background: rgba(212, 165, 116, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.left-btn {
  left: 5px;
}

.right-btn {
  right: 5px;
}

/* 中间相关书籍卡片 */
.center-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.books-card {
  background: linear-gradient(135deg, #d4a574 0%, #c8956a 100%);
  color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 280px;
}

.books-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.books-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.book-item {
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-item:last-child {
  border-bottom: none;
}

.book-icon {
  flex-shrink: 0;
}

/* 下部三列展示 */
.bottom-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(232, 213, 183, 0.3) 0%, rgba(212, 197, 169, 0.3) 100%);
}

.content-column {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.column-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a3f35;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #d4a574;
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  padding: 12px 0;
  color: #5a4f45;
  font-size: 13px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover {
  color: #3d3328;
  padding-left: 8px;
}

.list-item:last-child {
  border-bottom: none;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .middle-section {
    gap: 20px;
    padding: 30px;
    flex-wrap: wrap;
  }

  .carousel-wrapper {
    flex: 1 1 calc(50% - 10px);
  }

  .center-section {
    flex: 1 1 100%;
  }

  .bottom-section {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .hero-title h1 {
    font-size: 36px;
  }

  .middle-section {
    padding: 20px;
    gap: 15px;
  }

  .carousel-wrapper,
  .center-section {
    flex: 1 1 100%;
  }

  .carousel-item {
    width: 100px;
  }

  .carousel-btn {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .books-card {
    padding: 20px;
  }

  .bottom-section {
    padding: 30px 20px;
  }
}
</style>
