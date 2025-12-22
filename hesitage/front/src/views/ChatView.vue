<template>
  <div class="container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 装饰元素 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 聊天区域 -->
      <div class="chat-section">
        <div class="chat-header">
          <div class="chat-title">
            <span>🤖</span>
            <span>非遗助手</span>
          </div>
          <button class="new-chat-btn" @click="newChat">+ 新对话</button>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div v-if="messages.length === 0" class="no-messages">
            <p>👋 欢迎使用长三角非遗助手</p>
            <p>我可以为您介绍长三角地区的非遗项目</p>
          </div>
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            <img :src="message.avatar" :alt="`${message.role}头像`" class="message-avatar" />
            <div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.time) }}</div>
            </div>
          </div>
          <div v-if="isTyping" class="typing-indicator show">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- 推荐问题 -->
        <div v-if="messages.length === 0" class="recommended-questions">
          <p>推荐问题：</p>
          <button v-for="question in recommendedQuestions" :key="question" class="question-btn" @click="sendMessage(question)">
            {{ question }}
          </button>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <input
            v-model="inputMessage"
            type="text"
            class="message-input"
            placeholder="输入问题..."
            @keyup.enter="sendMessage(inputMessage)"
          />
          <button class="send-btn" @click="sendMessage(inputMessage)">发送</button>
        </div>
      </div>

      <!-- 统计信息侧边栏 -->
      <div class="stats-sidebar">
        <!-- 非遗概览 -->
        <div class="stats-card">
          <h3>长三角非遗概览</h3>
          <div class="stat-item">
            <span class="stat-label">总项目数</span>
            <span class="stat-value">{{ totalProjects }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">世界遗产</span>
            <span class="stat-value">{{ totalWorldHeritage }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">城市数量</span>
            <span class="stat-value">{{ totalCities }}</span>
          </div>
        </div>

        <!-- 省份排行 -->
        <div class="stats-card">
          <h3>省份项目排行</h3>
          <div class="ranking-list">
            <div v-for="(province, index) in provincesRanking" :key="province.id" class="ranking-item">
              <span class="rank-num">{{ index + 1 }}</span>
              <span class="rank-name">{{ province.name }}</span>
              <span class="rank-value">{{ province.projectCount }}</span>
            </div>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="stats-card">
          <h3>快速导航</h3>
          <router-link to="/" class="link-btn">↖ 返回首页</router-link>
          <router-link to="/map" class="link-btn">📍 地图分布</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { useHeritageStore } from '../stores/heritageStore'

interface Message {
  role: 'user' | 'ai'
  content: string
  avatar: string
  time: Date
}

const heritageStore = useHeritageStore()
const messagesContainer = ref<HTMLElement | null>(null)
const messages = ref<Message[]>([])
const inputMessage = ref('')
const isTyping = ref(false)

const recommendedQuestions = [
  '长三角有哪些世界遗产？',
  '江苏的主要非遗项目是什么？',
  '浙江最著名的非遗是什么？',
  '安徽的徽文化有哪些代表？',
  '上海有哪些非遗项目？'
]

const allProvinces = computed(() => {
  return heritageStore.getAllProvinces()
})

const provincesRanking = computed(() => {
  return [...allProvinces.value].sort((a, b) => b.projectCount - a.projectCount)
})

const totalProjects = computed(() => {
  return allProvinces.value.reduce((sum, p) => sum + p.projectCount, 0)
})

const totalWorldHeritage = computed(() => {
  return allProvinces.value.reduce((sum, p) => sum + p.worldHeritage, 0)
})

const totalCities = computed(() => {
  const citiesSet = new Set<string>()
  allProvinces.value.forEach((p) => {
    p.cities.forEach((city) => citiesSet.add(city))
  })
  return citiesSet.size
})

const sendMessage = async (text: string) => {
  if (!text.trim()) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text,
    avatar: '/figures/user-avatar.svg',
    time: new Date()
  })

  inputMessage.value = ''
  scrollToBottom()

  // 模拟AI回复
  isTyping.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const aiResponse = generateAIResponse(text)
  messages.value.push({
    role: 'ai',
    content: aiResponse,
    avatar: '/figures/ai-avatar.svg',
    time: new Date()
  })

  isTyping.value = false
  scrollToBottom()
}

const generateAIResponse = (userMessage: string): string => {
  const responses: Record<string, string> = {
    '长三角有哪些世界遗产':
      '长三角地区共有6处世界遗产：江苏3处（昆曲、太湖明珠、苏州园林），浙江1处（杭州西湖），安徽2处（黄山、三清山）。这些都是中华文明的瑰宝。',

    '江苏的主要非遗项目是什么':
      '江苏有146项非遗项目，主要包括：昆曲（百戏之祖）、苏州园林、南京云锦、苏绣、秦淮灯会等。其中昆曲已列入联合国非遗名录。',

    '浙江最著名的非遗是什么':
      '浙江有217项非遗项目，最著名的是：龙井茶制作、越剧、龙泉青瓷、杭州丝绸、东阳木雕。浙江非遗数量为长三角之最。',

    '安徽的徽文化有哪些代表':
      '安徽是徽文化发源地，代表项目包括：黄梅戏、徽派建筑、宣纸、徽墨、歙砚、徽州三雕。这些传统工艺体现了徽商文化的精髓。',

    '上海有哪些非遗项目':
      '上海有33项非遗项目，包括：豫园建筑、外滩建筑、石库门建筑、海派文化、本帮菜等。这些反映了海派文化的独特魅力。'
  }

  // 查找匹配的响应
  for (const [key, value] of Object.entries(responses)) {
    if (userMessage.includes(key.substring(0, 6))) {
      return value
    }
  }

  // 默认响应
  return `感谢您的提问！关于"${userMessage}"，我可以为您介绍长三角地区的相关非遗项目。请从省份标签中选择具体地区，我会提供更详细的信息。`
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const newChat = () => {
  messages.value = []
  inputMessage.value = ''
}

onMounted(() => {
  // 初始化时聚焦到输入框
  // 可在此处添加初始化逻辑
})
</script>

<style scoped>
.container {
  min-width: 1400px;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
  position: relative;
  overflow-x: hidden;
  padding-bottom: 40px;
}

/* 头部样式 */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  margin: 20px auto;
  max-width: 1400px;
  width: 100%;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: rgba(139, 90, 43, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  text-align: center;
  border: 3px solid #8b5a2b;
  line-height: 1.2;
}

.logo-text {
  font-size: 22px;
  color: #5a4a3a;
  font-weight: bold;
  letter-spacing: 2px;
}

nav {
  display: flex;
  gap: 40px;
}

nav a {
  color: #5a4a3a;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s;
}

nav a:hover,
nav a.active {
  color: #8b5a2b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #5a4a3a;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* 装饰元素 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 100px;
  right: 100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 150px;
  left: 120px;
}

/* 主内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
}

/* 聊天区域 */
.chat-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  height: 700px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(139, 90, 43, 0.2);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #8b5a2b;
}

.new-chat-btn {
  padding: 8px 20px;
  background: rgba(139, 90, 43, 0.1);
  border: 1px solid #8b5a2b;
  border-radius: 20px;
  color: #8b5a2b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.new-chat-btn:hover {
  background: rgba(139, 90, 43, 0.2);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: rgba(255, 248, 240, 0.5);
  border-radius: 10px;
  margin-bottom: 15px;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(139, 90, 43, 0.3);
  border-radius: 3px;
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.no-messages p {
  font-size: 18px;
  margin: 10px 0;
}

.message {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  animation: fadeIn 0.3s;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, #8b5a2b, #a67c52);
  color: #fff;
  border-bottom-right-radius: 5px;
}

.message.ai .message-content {
  background: #fff;
  color: #333;
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-bottom-left-radius: 5px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  padding: 0 18px;
}

.typing-indicator {
  display: none;
  padding: 15px;
  background: #fff;
  border-radius: 15px;
  width: fit-content;
  border: 1px solid rgba(139, 90, 43, 0.2);
}

.typing-indicator.show {
  display: block;
}

.typing-dots {
  display: flex;
  gap: 5px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5a2b;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 推荐问题 */
.recommended-questions {
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(139, 90, 43, 0.05);
  border-radius: 10px;
}

.recommended-questions p {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.question-btn {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 8px;
  color: #8b5a2b;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s;
}

.question-btn:hover {
  background: rgba(139, 90, 43, 0.1);
  border-color: #8b5a2b;
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid rgba(139, 90, 43, 0.3);
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #8b5a2b;
}

.send-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #8b5a2b, #a67c52);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.send-btn:hover {
  background: linear-gradient(135deg, #6d4521, #8b5a2b);
  transform: translateY(-2px);
}

/* 统计侧边栏 */
.stats-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  color: #8b5a2b;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 2px solid rgba(139, 90, 43, 0.2);
  padding-bottom: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(139, 90, 43, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #999;
  font-size: 14px;
}

.stat-value {
  color: #8b5a2b;
  font-size: 24px;
  font-weight: bold;
}

/* 排行榜 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(139, 90, 43, 0.05);
  border-radius: 8px;
}

.rank-num {
  min-width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5a2b, #a67c52);
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.rank-name {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.rank-value {
  color: #8b5a2b;
  font-weight: bold;
  font-size: 14px;
}

/* 快速链接 */
.link-btn {
  display: block;
  padding: 12px;
  background: rgba(139, 90, 43, 0.1);
  border: 1px solid rgba(139, 90, 43, 0.3);
  border-radius: 8px;
  color: #8b5a2b;
  text-align: center;
  text-decoration: none;
  margin-bottom: 10px;
  transition: all 0.3s;
  font-size: 14px;
}

.link-btn:last-child {
  margin-bottom: 0;
}

.link-btn:hover {
  background: rgba(139, 90, 43, 0.2);
  border-color: #8b5a2b;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .chat-section {
    height: 600px;
  }

  .stats-sidebar {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 15px;
  }

  .chat-section {
    height: 500px;
  }

  .message-content {
    max-width: 100%;
  }

  header {
    flex-direction: column;
    gap: 15px;
  }

  nav {
    gap: 20px;
  }
}
</style>
