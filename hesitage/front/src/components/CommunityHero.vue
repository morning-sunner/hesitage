<template>
  <div class="community-hero">
    <!-- 右上角菜单按钮 -->
    <div class="menu-button" @click="toggleMenu">
      <div class="menu-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 下拉菜单 -->
    <div v-if="showMenu" class="dropdown-menu" @click.stop>
      <div class="menu-item" @click="openModal('rules')">
        <span class="menu-item-icon">📋</span>
        <span class="menu-item-text">比赛规则</span>
      </div>
      <div class="menu-item" @click="openModal('leaderboard')">
        <span class="menu-item-icon">🏅</span>
        <span class="menu-item-text">排行榜</span>
      </div>
      <div class="menu-item" @click="openModal('community')">
        <span class="menu-item-icon">💬</span>
        <span class="menu-item-text">交流社区</span>
      </div>
    </div>

    <!-- 古风背景 -->
    <div class="heritage-bg">
      <div class="decorative-ornament ornament-top-left"></div>
      <div class="decorative-ornament ornament-top-right"></div>
      <div class="decorative-ornament ornament-bottom-left"></div>
      <div class="decorative-ornament ornament-bottom-right"></div>
    </div>

    <!-- 主标题 -->
    <div class="hero-content">
      <div class="badge">UNESCO非遗认证平台</div>
      <h1 class="main-title">
        <span class="title-char">长</span>
        <span class="title-char">三</span>
        <span class="title-char">角</span>
        <br />
        <span class="title-char">文</span>
        <span class="title-char">化</span>
        <span class="title-char">遗</span>
        <span class="title-char">产</span>
      </h1>
      <h2 class="subtitle">知识竞赛平台</h2>
      <p class="description">传承千年文化，展示您的文化底蕴，赢得荣誉与奖励</p>
      
      <!-- 数据统计展示 -->
      <div class="stats-preview">
        <div class="stat-item">
          <span class="stat-number">506</span>
          <span class="stat-label">非遗项目</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">1280+</span>
          <span class="stat-label">传承人</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">50万+</span>
          <span class="stat-label">参与者</span>
        </div>
      </div>

      <!-- 装饰图案 -->
      <div class="fan-decorations">
        <div class="fan fan-1"></div>
        <div class="fan fan-2"></div>
        <div class="fan fan-3"></div>
      </div>
    </div>

    <!-- 开始按钮区域 -->
    <div class="start-section">
      <!-- 模式选择卡片 -->
      <div class="mode-cards">
        <div class="mode-card practice-card" @click="startMode('practice')">
          <div class="mode-icon">📝</div>
          <h3 class="mode-title">练习模式</h3>
          <p class="mode-desc">轻松学习，即时反馈</p>
          <ul class="mode-features">
            <li>✓ 答完立即查看解析</li>
            <li>✓ 随时练习巩固</li>
            <li>✓ 不计入排行榜</li>
          </ul>
          <button class="mode-button practice-button">开始练习</button>
        </div>

        <div class="mode-card challenge-card" @click="startMode('challenge')">
          <div class="mode-icon">🏆</div>
          <h3 class="mode-title">挑战模式</h3>
          <p class="mode-desc">正式比赛，冲击榜单</p>
          <ul class="mode-features">
            <li>🌟 成绩计入排行榜</li>
            <li>🌟 完成后统一评分</li>
            <li>🌟 争夺荣誉称号</li>
          </ul>
          <button class="mode-button challenge-button">开始挑战</button>
        </div>
      </div>

      <div class="difficulty-selector">
        <label>选择难度：</label>
        <select v-model="difficulty" class="difficulty-select" @change="$emit('update:difficulty', difficulty)">
          <option value="easy">初级 (10题)</option>
          <option value="medium">中级 (20题)</option>
          <option value="hard">高级 (25题)</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  difficulty?: string
}

const props = withDefaults(defineProps<Props>(), {
  difficulty: 'easy'
})

const emit = defineEmits<{
  'start-quiz': [mode: 'practice' | 'challenge']
  'update:difficulty': [value: string]
  'open-modal': [type: string]
}>()

const showMenu = ref(false)
const difficulty = ref(props.difficulty)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const openModal = (type: string) => {
  emit('open-modal', type)
  showMenu.value = false
}

const startMode = (mode: 'practice' | 'challenge') => {
  emit('start-quiz', mode)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.community-hero {
  position: relative;
  padding: 60px 20px;
  text-align: center;
  color: #8b6f47;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.heritage-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 50%, #dcc4a8 100%);
  border-radius: 8px;
  opacity: 0.5;
}

.decorative-ornament {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 3px solid rgba(139, 111, 71, 0.2);
  border-radius: 50%;
}

.menu-button {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 100;
}

.menu-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.menu-icon {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-icon span {
  display: block;
  width: 20px;
  height: 3px;
  background: #8b6f47;
  border-radius: 2px;
  transition: all 0.3s;
}

.dropdown-menu {
  position: absolute;
  top: 90px;
  right: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-width: 200px;
  z-index: 99;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #faf8f4;
}

.menu-item-icon {
  font-size: 1.5em;
}

.menu-item-text {
  color: #333;
  font-size: 1em;
  font-weight: 500;
}

.ornament-top-left {
  top: 20px;
  left: 20px;
}

.ornament-top-right {
  top: 20px;
  right: 20px;
}

.ornament-bottom-left {
  bottom: 20px;
  left: 20px;
}

.ornament-bottom-right {
  bottom: 20px;
  right: 20px;
}

.hero-content {
  position: relative;
  z-index: 2;
  margin-bottom: 40px;
}

.main-title {
  font-size: 3.5em;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 4px;
}

.title-char {
  display: inline-block;
  animation: fadeIn 0.5s ease-out;
}

.title-char:nth-child(1) { animation-delay: 0s; }
.title-char:nth-child(2) { animation-delay: 0.1s; }
.title-char:nth-child(3) { animation-delay: 0.2s; }
.title-char:nth-child(5) { animation-delay: 0.4s; }
.title-char:nth-child(6) { animation-delay: 0.5s; }
.title-char:nth-child(7) { animation-delay: 0.6s; }
.title-char:nth-child(8) { animation-delay: 0.7s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle {
  font-size: 2em;
  margin-bottom: 15px;
  color: #c9916f;
  font-weight: bold;
}

.description {
  font-size: 1.1em;
  color: #999;
  margin-bottom: 40px;
}

.fan-decorations {
  position: relative;
  height: 80px;
  margin-top: 20px;
}

.fan {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 3px solid #d4a574;
  border-radius: 40px 0;
  opacity: 0.3;
}

.fan-1 {
  left: 10%;
  transform: rotate(0deg);
  animation: rotate 6s infinite linear;
}

.fan-2 {
  left: 50%;
  transform: translateX(-50%) rotate(120deg);
  animation: rotate 6s infinite linear reverse;
}

.fan-3 {
  right: 10%;
  transform: rotate(240deg);
  animation: rotate 6s infinite linear;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.start-section {
  position: relative;
  z-index: 2;
}

.start-button {
  padding: 18px 50px;
  background: linear-gradient(135deg, #c9916f 0%, #d4a574 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(201, 145, 111, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(201, 145, 111, 0.6);
  background: linear-gradient(135deg, #d4a574 0%, #dbb080 100%);
}

.start-button:active {
  transform: translateY(-1px);
}

.button-text {
  letter-spacing: 2px;
}

.button-icon {
  font-size: 1.3em;
  transition: transform 0.3s;
}

.start-button:hover .button-icon {
  transform: translateX(5px);
}

.button-hint {
  margin-top: 15px;
  color: #999;
  font-size: 0.95em;
}

.difficulty-selector {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 0.9em;
}

.difficulty-select {
  padding: 8px 12px;
  border: 1px solid #d4a574;
  border-radius: 6px;
  background: white;
  color: #8b6f47;
  font-weight: bold;
}

/* 模式选择卡片 */
.mode-cards {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 20px;
}

.mode-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 280px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.practice-card {
  border-color: #67c23a;
}

.practice-card:hover {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%);
}

.challenge-card {
  border-color: #f56c6c;
}

.challenge-card:hover {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fff4e6 0%, #ffe7d9 100%);
}

.mode-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.mode-title {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.mode-desc {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95em;
}

.mode-features {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
}

.mode-features li {
  padding: 8px 0;
  color: #555;
  font-size: 0.9em;
  line-height: 1.6;
}

.mode-button {
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.practice-button {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.practice-button:hover {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
  transform: scale(1.05);
}

.challenge-button {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.challenge-button:hover {
  background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%);
  transform: scale(1.05);
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(212, 165, 116, 0.2);
  color: #c9916f;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: bold;
  margin-bottom: 20px;
  border: 1px solid rgba(212, 165, 116, 0.3);
}

.stats-preview {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2em;
  font-weight: bold;
  color: #c9916f;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9em;
  color: #999;
}

@media (max-width: 768px) {
  .community-hero {
    padding: 40px 20px;
    min-height: 400px;
  }

  .main-title {
    font-size: 2.2em;
  }

  .subtitle {
    font-size: 1.3em;
  }

  .start-button {
    padding: 14px 30px;
    font-size: 1em;
  }

  .menu-button {
    top: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }

  .dropdown-menu {
    top: 75px;
    right: 20px;
    min-width: 180px;
  }
}
</style>
