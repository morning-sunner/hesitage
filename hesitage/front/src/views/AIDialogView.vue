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
          <div class="header-left">
            <div class="header-icon">📚</div>
            <div class="header-text">
              <h1>非遗助手</h1>
              <p>欢迎使用长三角非遗知识助手</p>
            </div>
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
        <!-- 对话历史 -->
        <div class="card history-card">
          <div class="card-header">
            <span class="card-icon">📜</span>
            <h3>对话历史</h3>
          </div>
          <div class="history-list">
            <div
              v-for="(session, idx) in chatSessions"
              :key="session.id"
              :class="['history-item', { active: currentSessionId === session.id }]"
              @click="switchSession(session.id)"
            >
              <div class="history-item-content">
                <div class="history-title">{{ session.title }}</div>
                <div class="history-info">
                  <span class="history-time">{{ session.time }}</span>
                  <span class="history-count">{{ session.messages.length }}条消息</span>
                </div>
              </div>
              <button 
                v-if="chatSessions.length > 1"
                @click.stop="deleteSession(session.id)" 
                class="delete-session-btn"
                title="删除对话"
              >
                🗑️
              </button>
            </div>
            <div v-if="chatSessions.length === 0" class="empty-history">
              暂无对话历史
            </div>
          </div>
        </div>

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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import { useRouter } from 'vue-router'

interface Message {
  type: 'user' | 'assistant'
  content: string
  time: string
}

interface ChatSession {
  id: string
  title: string
  time: string
  messages: Message[]
}

const router = useRouter()
const userInput = ref('')
const messages = ref<Message[]>([])
const isLoading = ref(false)
const messagesEnd = ref<HTMLElement>()

// 会话管理
const chatSessions = ref<ChatSession[]>([])
const currentSessionId = ref<string>('')

// 从localStorage加载历史记录
onMounted(() => {
  const saved = localStorage.getItem('ai_chat_sessions')
  if (saved) {
    try {
      chatSessions.value = JSON.parse(saved)
      if (chatSessions.value.length > 0) {
        // 加载最新的会话
        const latestSession = chatSessions.value[0]
        if (latestSession) {
          currentSessionId.value = latestSession.id
          messages.value = [...latestSession.messages]
        }
      } else {
        // 创建新会话
        createNewSession()
      }
    } catch (e) {
      console.error('加载历史记录失败:', e)
      createNewSession()
    }
  } else {
    createNewSession()
  }
})

// 监听消息变化，自动保存
watch(() => messages.value, () => {
  saveCurrentSession()
}, { deep: true })

// 创建新会话
const createNewSession = () => {
  const newSession: ChatSession = {
    id: Date.now().toString(),
    title: '新对话',
    time: new Date().toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    messages: []
  }
  chatSessions.value.unshift(newSession)
  currentSessionId.value = newSession.id
  messages.value = []
  saveSessions()
}

// 切换会话
const switchSession = (sessionId: string) => {
  const session = chatSessions.value.find(s => s.id === sessionId)
  if (session) {
    currentSessionId.value = sessionId
    messages.value = [...session.messages]
  }
}

// 删除会话
const deleteSession = (sessionId: string) => {
  if (!confirm('确定要删除这个对话吗？')) return
  
  const index = chatSessions.value.findIndex(s => s.id === sessionId)
  if (index !== -1) {
    chatSessions.value.splice(index, 1)
    
    // 如果删除的是当前会话
    if (currentSessionId.value === sessionId) {
      if (chatSessions.value.length > 0) {
        const firstSession = chatSessions.value[0]
        if (firstSession) {
          switchSession(firstSession.id)
        }
      } else {
        createNewSession()
      }
    }
    
    saveSessions()
  }
}

// 保存当前会话
const saveCurrentSession = () => {
  const currentSession = chatSessions.value.find(s => s.id === currentSessionId.value)
  if (currentSession) {
    currentSession.messages = [...messages.value]
    
    // 更新会话标题（使用第一条用户消息）
    if (messages.value.length > 0) {
      const firstUserMsg = messages.value.find(m => m.type === 'user')
      if (firstUserMsg) {
        currentSession.title = firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '')
      }
    }
    
    saveSessions()
  }
}

// 保存所有会话到localStorage
const saveSessions = () => {
  try {
    localStorage.setItem('ai_chat_sessions', JSON.stringify(chatSessions.value))
  } catch (e) {
    console.error('保存历史记录失败:', e)
  }
}

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
  createNewSession()
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
/* ========== 容器样式 ========== */
.ai-dialog-container {
  min-width: 1400px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
}

.dialog-main {
  flex: 1;
  padding: 30px 40px;
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
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.header-icon {
  font-size: 2em;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5e6d3 0%, #faf4ed 100%);
  border-radius: 50%;
}

.header-text {
  flex: 1;
}

.header-text h1 {
  font-size: 1.4em;
  margin: 0 0 4px 0;
  color: #333;
  font-weight: bold;
}

.header-text p {
  font-size: 0.85em;
  color: #999;
  margin: 0;
}

.new-chat-btn {
  padding: 8px 18px;
  background: transparent;
  border: 2px solid #d4a574;
  color: #c9916f;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
}

.new-chat-btn:hover {
  background: #c9916f;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 145, 111, 0.3);
}


/* ========== 消息区域 ========== */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafafa;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.welcome-icon {
  font-size: 4em;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.welcome-message h2 {
  font-size: 1.5em;
  margin-bottom: 12px;
  color: #333;
  font-weight: bold;
}

.welcome-message p {
  color: #666;
  max-width: 400px;
  line-height: 1.8;
  font-size: 0.95em;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  justify-content: flex-end;
}

.message.user .message-avatar {
  order: 2;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
}

.message.assistant .message-avatar {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.message-content {
  max-width: 65%;
  padding: 14px 18px;
  border-radius: 16px;
  word-wrap: break-word;
  line-height: 1.7;
  font-size: 0.95em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message.user .message-content {
  background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  border: 1px solid #f0f0f0;
}

.message-time {
  font-size: 0.7em;
  color: #bbb;
  margin-top: 6px;
  align-self: flex-end;
}

.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 8px;
}

.typing-indicator span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #999;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8) translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2) translateY(-10px);
    opacity: 1;
  }
}

/* ========== 输入区域 ========== */
.input-section {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  font-size: 0.95em;
  font-family: inherit;
  transition: all 0.3s;
  background: #fafafa;
}

.message-input:focus {
  outline: none;
  border-color: #d4a574;
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.message-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.send-button {
  padding: 12px 32px;
  background: linear-gradient(135deg, #c9916f 0%, #d4a574 100%);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(201, 145, 111, 0.3);
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(201, 145, 111, 0.4);
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}


/* ========== 右侧侧边栏 ========== */
.dialog-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ========== 对话历史样式 ========== */
.history-card {
  max-height: 300px;
}

.history-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: #f5e6d3;
  border-color: #d4a574;
  transform: translateX(2px);
}

.history-item.active {
  background: linear-gradient(135deg, #f5e6d3 0%, #faf4ed 100%);
  border-color: #c9916f;
  box-shadow: 0 2px 8px rgba(201, 145, 111, 0.2);
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: 0.9em;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-info {
  display: flex;
  gap: 12px;
  font-size: 0.75em;
  color: #999;
}

.history-time {
  color: #999;
}

.history-count {
  color: #c9916f;
  font-weight: 500;
}

.delete-session-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.delete-session-btn:hover {
  background: #ffebee;
  opacity: 1;
  transform: scale(1.1);
}

.empty-history {
  text-align: center;
  padding: 30px 20px;
  color: #999;
  font-size: 0.9em;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 2px solid #f5e6d3;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.card-icon {
  font-size: 1.6em;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
  font-weight: bold;
}

.suggestions-list {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 14px 16px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 2px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9em;
  text-align: left;
  color: #555;
  transition: all 0.3s;
  line-height: 1.6;
}

.suggestion-item:hover {
  background: linear-gradient(135deg, #f5e6d3 0%, #faf4ed 100%);
  border-color: #d4a574;
  color: #c9916f;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
}

.stats-list {
  padding: 18px 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.stat-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #c9916f;
  background: linear-gradient(135deg, #c9916f 0%, #d4a574 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ========== 滚动条美化 ========== */
.messages-container::-webkit-scrollbar,
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.suggestions-list::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb,
.suggestions-list::-webkit-scrollbar-thumb {
  background: #d4a574;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #c9916f;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .dialog-main {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .dialog-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .dialog-left {
    height: 600px;
  }
}

@media (max-width: 768px) {
  .ai-dialog-container {
    min-width: auto;
  }

  .dialog-main {
    padding: 15px;
    gap: 15px;
  }

  .dialog-left {
    height: 550px;
  }

  .dialog-header {
    flex-wrap: wrap;
    padding: 16px;
  }

  .header-left {
    flex: 1 1 100%;
    margin-bottom: 10px;
  }

  .new-chat-btn {
    flex: 1;
    width: 100%;
  }

  .header-text h1 {
    font-size: 1.2em;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 1.6em;
  }

  .message-content {
    max-width: 80%;
    padding: 12px 15px;
    font-size: 0.9em;
  }

  .dialog-right {
    grid-template-columns: 1fr;
  }

  .input-section {
    padding: 16px;
  }

  .send-button {
    padding: 12px 24px;
  }
}
</style>
