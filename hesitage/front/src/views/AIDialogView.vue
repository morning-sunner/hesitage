<template>
  <div class="ai-dialog-container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 主要内容区域 -->
    <div class="dialog-main">
      <!-- 左侧对话区域 -->
      <div class="dialog-left">
        <!-- 标题区 -->
        <div class="dialog-header">
          <div class="header-icon">📚</div>
          <div class="header-text">
            <h1>非遗知识助手</h1>
            <p>AI智能问答</p>
          </div>
          <button class="new-chat-btn" @click="startNewChat">
            <span>+ 新对话</span>
          </button>
        </div>

        <!-- 对话区域 -->
        <div class="messages-container">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-icon">🤖</div>
            <h2>您好！我是长三角非遗知识助手</h2>
            <p>我可以为您介绍长三角地区的非物质文化遗产知识，包括南京云锦、民曲、苏州园林、龙泉青瓷、徽墨等传统文化。请问有什么可以帮助您的吗？</p>
          </div>

          <!-- 消息列表 -->
          <div v-else class="messages-list">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message', msg.type]"
            >
              <div class="message-avatar">
                <span v-if="msg.type === 'user'">👤</span>
                <span v-else>🤖</span>
              </div>
              <div class="message-content">
                <p>{{ msg.content }}</p>
              </div>
              <div class="message-time">{{ msg.time }}</div>
            </div>
            <div v-if="isLoading" class="message assistant">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 自动滚动到底部 -->
          <div ref="messagesEnd"></div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="input-wrapper">
            <input
              v-model="userInput"
              type="text"
              placeholder="请输入您的问题..."
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              class="message-input"
            />
            <button
              @click="sendMessage"
              :disabled="!userInput.trim() || isLoading"
              class="send-button"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏 -->
      <div class="dialog-right">
        <!-- 推荐问题 -->
        <div class="card suggestions-card">
          <div class="card-header">
            <span class="card-icon">💡</span>
            <h3>推荐问题</h3>
          </div>
          <div class="suggestions-list">
            <button
              v-for="(suggestion, idx) in suggestions"
              :key="idx"
              @click="selectSuggestion(suggestion)"
              class="suggestion-item"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="card stats-card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3>统计信息</h3>
          </div>
          <div class="stats-list">
            <div class="stat-row">
              <span class="stat-label">知识库回答</span>
              <span class="stat-value">50+</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">非遗项目</span>
              <span class="stat-value">506</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">本次对话</span>
              <span class="stat-value">{{ messages.length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">服务时间</span>
              <span class="stat-value">24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import NavBar from '../components/NavBar.vue'
import { useRouter } from 'vue-router'

interface Message {
  type: 'user' | 'assistant'
  content: string
  time: string
}

const router = useRouter()
const userInput = ref('')
const messages = ref<Message[]>([])
const isLoading = ref(false)
const messagesEnd = ref<HTMLElement>()

const suggestions = [
  '什么是非遗文化？',
  '长三角地区有哪些著名的非遗项目？',
  '如何学习和传承非遗文化？',
  '非遗传承人的故事',
  '南京云锦的特点',
  '苏州评弹的发展'
]

// 获取当前时间格式
const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 开始新对话
const startNewChat = () => {
  messages.value = []
  userInput.value = ''
}

// 选择推荐问题
const selectSuggestion = (suggestion: string) => {
  userInput.value = suggestion
  sendMessage()
}

// 自动滚动到最新消息
const scrollToBottom = async () => {
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userInput.value,
    time: getCurrentTime()
  })

  const question = userInput.value
  userInput.value = ''
  isLoading.value = true

  try {
    await scrollToBottom()

    // 调用后端 API
    const response = await fetch('http://localhost:3000/api/ai-dialog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    
    // 添加 AI 响应
    messages.value.push({
      type: 'assistant',
      content: data.answer,
      time: getCurrentTime()
    })
  } catch (error) {
    console.error('Error:', error)
    // 模拟响应（开发环境）
    const mockAnswers: Record<string, string> = {
      '什么是非遗文化？': '非物质文化遗产（非遗）是指各族人民世代相承、与群众生活密切相关的各种传统文化表现形式。长三角地区作为中国文化发达地区，拥有丰富的非遗资源。',
      '长三角地区有哪些著名的非遗项目？': '长三角地区的非遗项目丰富多彩，包括昆曲、苏州评弹、浙江剪纸、杭州龙井茶制作工艺、宣纸制作、徽州木雕、棕编等多个项目。',
      '如何学习和传承非遗文化？': '可以通过参加非遗传承人的课程、参观非遗展览、观看非遗表演、购买非遗产品等方式来学习和支持非遗文化的传承。',
      '非遗传承人的故事': '非遗传承人是非遗文化的守护者，他们通过多年的学习和实践，掌握了传统工艺和技艺，并致力于将这些宝贵的文化遗产传承给下一代。'
    }

    const answer = mockAnswers[question] || '感谢您的提问！这是一个有趣的问题，长三角地区的非遗文化确实有很多值得了解的内容。'
    
    messages.value.push({
      type: 'assistant',
      content: answer,
      time: getCurrentTime()
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
.ai-dialog-container {
  min-width: 1400px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
}

.header-section {
  background: linear-gradient(135deg, #d4a574 0%, #c9916f 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-content p {
  font-size: 1.1em;
  opacity: 0.9;
}

.dialog-main {
  flex: 1;
  padding: 30px 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.dialog-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(to bottom, #fafafa, #ffffff);
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.welcome-icon {
  font-size: 3em;
  margin-bottom: 20px;
}

.welcome-message h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  gap: 10px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  justify-content: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #e3f2fd;
}

.message.assistant .message-avatar {
  background: #f5f5f5;
}

.message-content {
  max-width: 70%;
  padding: 12px 15px;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.6;
}

.message.user .message-content {
  background: #2196f3;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 5px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: bounce 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

.dialog-main {
  flex: 1;
  padding: 30px 20px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ========== 左侧对话区 ========== */
.dialog-left {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 700px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.header-icon {
  font-size: 2em;
}

.header-text {
  flex: 1;
}

.header-text h1 {
  font-size: 1.3em;
  margin: 0;
  color: #333;
  font-weight: bold;
}

.header-text p {
  font-size: 0.85em;
  color: #999;
  margin: 0;
}

.new-chat-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #d4a574;
  color: #c9916f;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
}

.new-chat-btn:hover {
  background: #f5f5f5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.welcome-icon {
  font-size: 3em;
  margin-bottom: 20px;
}

.welcome-message h2 {
  font-size: 1.3em;
  margin-bottom: 10px;
  color: #333;
}

.welcome-message p {
  color: #999;
  max-width: 300px;
  line-height: 1.6;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  justify-content: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #e3f2fd;
}

.message.assistant .message-avatar {
  background: #f5f5f5;
}

.message-content {
  max-width: 60%;
  padding: 12px 15px;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.6;
}

.message.user .message-content {
  background: #2196f3;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75em;
  color: #ccc;
  margin-top: 4px;
}

.message.user .message-time {
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 5px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: bounce 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

.input-section {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  font-family: inherit;
  transition: border-color 0.3s;
}

.message-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.message-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 30px;
  background: #c9916f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: background 0.3s;
}

.send-button:hover:not(:disabled) {
  background: #d4a574;
}

.send-button:disabled {
  background: #bbb;
  cursor: not-allowed;
}

/* ========== 右侧侧边栏 ========== */
.dialog-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.card-icon {
  font-size: 1.5em;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
  font-weight: bold;
}

.suggestions-list {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  padding: 12px 14px;
  background: #f9f9f9;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  text-align: left;
  color: #333;
  transition: all 0.3s;
  line-height: 1.5;
  max-height: 80px;
  overflow-y: auto;
}

.suggestion-item:hover {
  background: #f5e6d3;
  border-color: #d4a574;
  color: #c9916f;
}

.stats-list {
  padding: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
}

.stat-value {
  font-size: 1.2em;
  font-weight: bold;
  color: #c9916f;
}

/* 滚动条美化 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@media (max-width: 1024px) {
  .dialog-main {
    grid-template-columns: 1fr;
  }

  .dialog-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .dialog-main {
    padding: 15px;
    gap: 15px;
  }

  .dialog-left {
    height: 600px;
  }

  .dialog-header {
    flex-wrap: wrap;
  }

  .header-text h1 {
    font-size: 1.1em;
  }

  .message-content {
    max-width: 85%;
  }

  .dialog-right {
    grid-template-columns: 1fr;
  }

  .new-chat-btn {
    flex: 1;
    width: 100%;
  }
}
</style>
