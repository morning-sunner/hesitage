<template>
  <div class="community-container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 社区主页 -->
    <div v-if="!hasStarted" class="community-home">
      <CommunityHero
        v-model:difficulty="selectedDifficulty"
        @start-quiz="startQuiz"
        @open-modal="openModal"
      />
    </div>

    <!-- 答题页面 -->
    <div v-else-if="!showResults" class="quiz-page">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>正在加载题目...</p>
      </div>
      
      <template v-else>
        <!-- 进度条 -->
        <div class="progress-bar-section">
          <div class="progress-info">
            <span>第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</span>
            <span>⏱️ 用时: {{ formatElapsedTime }}</span>
            <div class="score-with-button">
              <span>得分: {{ score }} 分</span>
              <button @click="finishQuiz" class="end-quiz-button-inline" title="结束答题并查看成绩">
                结束答题
              </button>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <!-- 题目区域 -->
        <div class="quiz-main">
          <!-- 左箭头 -->
          <button 
            v-if="currentQuestion > 0" 
            @click="prevQuestion" 
            class="nav-arrow nav-arrow-left"
            title="上一题"
          >
            ‹
          </button>

          <div class="quiz-card">
            <!-- 题目信息标签 -->
            <div class="question-tags" v-if="questions[currentQuestion]">
              <span class="tag tag-type">{{ questions[currentQuestion]!.type }}</span>
              <span class="tag tag-region">{{ questions[currentQuestion]!.region }}</span>
              <span class="tag tag-difficulty" :class="questions[currentQuestion]!.difficulty">
                {{ questions[currentQuestion]!.difficulty }}
              </span>
            </div>
            
            <!-- 题目 -->
            <div class="question-section">
              <h2 class="question-title" v-if="questions[currentQuestion]">
                {{ currentQuestion + 1 }}. {{ questions[currentQuestion]!.question }}
              </h2>
              <p v-if="questions[currentQuestion]?.type === '多选'" class="question-hint">
                （多选题，请选择所有正确答案）
              </p>
            </div>

            <!-- 单选/判断题选项 -->
            <div class="options-section" v-if="questions[currentQuestion] && questions[currentQuestion]!.type !== '多选'">
              <button
                v-for="(option, index) in questions[currentQuestion]!.options"
                :key="index"
                @click="selectOption(index)"
                :class="['option-button', {
                  selected: selectedOption === index,
                  correct: answered && index === questions[currentQuestion]!.correct,
                  incorrect: answered && selectedOption === index && index !== questions[currentQuestion]!.correct
                }]"
                :disabled="answered"
              >
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
                <span v-if="answered && index === questions[currentQuestion]!.correct" class="option-icon">✓</span>
                <span v-if="answered && selectedOption === index && index !== questions[currentQuestion]!.correct" class="option-icon">✗</span>
              </button>
            </div>
            
            <!-- 多选题选项 -->
            <div class="options-section" v-if="questions[currentQuestion] && questions[currentQuestion]!.type === '多选'">
              <button
                v-for="(option, index) in questions[currentQuestion]!.options"
                :key="index"
                @click="toggleMultiOption(index)"
                :class="['option-button', {
                  selected: selectedOptions.includes(index),
                  correct: answered && isCorrectMultiOption(index),
                  incorrect: answered && selectedOptions.includes(index) && !isCorrectMultiOption(index)
                }]"
                :disabled="answered"
              >
                <span class="option-checkbox">{{ selectedOptions.includes(index) ? '☑' : '☐' }}</span>
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
                <span v-if="answered && isCorrectMultiOption(index)" class="option-icon">✓</span>
              </button>
            </div>

            <!-- 解释（查看答案后显示） -->
            <div v-if="answered && questions[currentQuestion]" class="explanation-section">
              <div class="explanation-title">📖 答案解释</div>
              <p>{{ questions[currentQuestion]!.explanation }}</p>
              <div v-if="selectedOption === questions[currentQuestion]!.correct || (questions[currentQuestion]!.type === '多选' && isCorrectMultiAnswer())" class="correct-hint">
                ✓ 回答正确！
              </div>
              <div v-else class="incorrect-hint">
                ✗ 回答错误，正确答案是：{{ getCorrectAnswerText() }}
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <button 
                v-if="!answered" 
                @click="submitAnswer" 
                :disabled="questions[currentQuestion]?.type === '多选' ? selectedOptions.length === 0 : selectedOption === null" 
                class="submit-button"
              >
                查看答案
              </button>
              <div v-else class="answered-hint">
                已查看答案，请使用左右箭头切换题目
              </div>
            </div>
          </div>

          <!-- 右箭头 -->
          <button 
            v-if="currentQuestion < totalQuestions - 1" 
            @click="nextQuestion" 
            class="nav-arrow nav-arrow-right"
            :title="answered ? '下一题' : '请先查看答案'"
          >
            ›
          </button>
          
          <!-- 完成按钮（最后一题且已答题） -->
          <button 
            v-if="currentQuestion === totalQuestions - 1 && answered" 
            @click="finishQuiz" 
            class="nav-arrow nav-arrow-right finish-arrow"
            title="完成答题"
          >
            ✓
          </button>
        </div>
      </template>
    </div>

    <!-- 结果页面 -->
    <div v-else class="results-page">
      <div class="results-card">
        <div class="results-header">
          <h1>竞赛完成！</h1>
          <div class="results-score">
            <span class="score-number">{{ score }}</span>
            <span class="score-total">/ {{ totalQuestions * 10 }}</span>
          </div>
          <p class="results-message">{{ resultMessage }}</p>
        </div>

        <div class="results-stats">
          <div class="stat-item">
            <div class="stat-label">正确答题</div>
            <div class="stat-value">{{ correctCount }} 题</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">准确率</div>
            <div class="stat-value">{{ accuracy }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">耗时</div>
            <div class="stat-value">{{ timeSpent }} 秒</div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="restartQuiz" class="restart-button">重新答题</button>
          <button @click="backHome" class="home-button">返回互动社区</button>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <CommunityModal
      :show="showModal"
      :type="currentModal"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import CommunityHero from '../components/CommunityHero.vue'
import CommunityModal from '../components/CommunityModal.vue'

interface Question {
  id: number
  type: string
  region: string
  question: string
  description?: string
  options: string[]
  correct: number | string  // 单选/判断是number，多选是string如"ABCD"
  explanation: string
  difficulty: string
}

interface QuizStats {
  total: number
  byDifficulty: { easy: number; medium: number; hard: number }
  byType: { single: number; multiple: number; truefalse: number }
  byRegion: Array<{ region: string; count: number }>
}

const router = useRouter()
const hasStarted = ref(false)
const showResults = ref(false)
const quizMode = ref<'practice' | 'challenge'>('challenge')  // 答题模式
const currentQuestion = ref(0)
const selectedOption = ref<number | null>(null)
const selectedOptions = ref<number[]>([])  // 多选题用
const answered = ref(false)
const score = ref(0)
const startTime = ref<number>(0)
const timeSpent = ref(0)
const elapsedTime = ref(0) // 实时计时（秒）
const timerInterval = ref<number | null>(null)
const userAnswers = ref<(number | number[])[]>([])
const selectedDifficulty = ref('easy')
const selectedRegion = ref('全部')
const questionCount = ref(10)  // 初级默认10题

// 难度与题数的映射（与排行榜对应）
const difficultyMap = {
  easy: 10,    // 初级：10题
  medium: 20,  // 中级：20题
  hard: 25     // 高级：25题
}

// 题目数据
const questions = ref<Question[]>([])
const loading = ref(false)
const quizStats = ref<QuizStats | null>(null)

// 菜单和弹窗相关
const showModal = ref(false)
const currentModal = ref('')

const openModal = (type: string) => {
  currentModal.value = type
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentModal.value = ''
}

// 从数据库获取题目
const fetchQuestions = async () => {
  loading.value = true
  try {
    // 根据难度映射到中文
    const difficultyMap2 = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    const difficulty = difficultyMap2[selectedDifficulty.value as keyof typeof difficultyMap2] || '简单'
    
    // 调用后端 API 获取题目，传递难度参数
    const response = await fetch(`/api/quiz-questions?count=${questionCount.value}&difficulty=${difficulty}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    if (data.success && data.questions) {
      // 转换题目格式
      questions.value = data.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        region: q.region,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        difficulty: q.difficulty
      }))
      console.log(`✓ 加载了 ${questions.value.length} 道题目`)
    }
  } catch (error) {
    console.error('获取题目失败:', error)
    // 使用默认题目作为后备
    questions.value = getDefaultQuestions()
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const fetchStats = async () => {
  try {
    const response = await fetch('/api/quiz-stats')
    const data = await response.json()
    if (data.success) {
      quizStats.value = data.stats
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

// 默认题目（后备）
const getDefaultQuestions = (): Question[] => [
  {
    id: 1,
    type: '单选',
    region: '江苏',
    question: '昆曲是哪个地区的传统艺术？',
    description: '请选择昆曲的主要传承地',
    options: ['北京', '苏州', '杭州', '宁波'],
    correct: 1,
    explanation: '昆曲是苏州地区的传统戏曲艺术，也是联合国非物质文化遗产代表作。',
    difficulty: '简单'
  }
]

// 页面加载时获取统计
onMounted(() => {
  fetchStats()
})

// 多选题：切换选项
const toggleMultiOption = (index: number) => {
  if (answered.value) return
  const idx = selectedOptions.value.indexOf(index)
  if (idx === -1) {
    selectedOptions.value.push(index)
  } else {
    selectedOptions.value.splice(idx, 1)
  }
}

// 检查多选题某个选项是否正确
const isCorrectMultiOption = (index: number): boolean => {
  const currentQ = questions.value[currentQuestion.value]
  if (!currentQ || currentQ.type !== '多选') return false
  const correctStr = currentQ.correct as string
  const correctIndexes = correctStr.split('').map(c => c.charCodeAt(0) - 65)
  return correctIndexes.includes(index)
}

const totalQuestions = computed(() => questions.value.length)
const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return ((currentQuestion.value + 1) / totalQuestions.value) * 100
})

// 格式化实时时间（用于进度条）
const formatElapsedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60)
  const secs = elapsedTime.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

// 启动计时器
const startTimer = () => {
  if (timerInterval.value) return
  
  timerInterval.value = window.setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

// 停止计时器
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const correctCount = computed(() => {
  return userAnswers.value.filter((answer, index) => {
    const q = questions.value[index]
    if (!q || answer === undefined || answer === null) return false
    
    if (q.type === '多选') {
      // 多选题比较
      if (!Array.isArray(answer)) return false
      const userAns = (answer as number[]).sort().join('')
      const correctAns = (q.correct as string).split('').map(c => c.charCodeAt(0) - 65).sort().join('')
      return userAns === correctAns
    }
    return answer === q.correct
  }).length
})

const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

const resultMessage = computed(() => {
  if (accuracy.value >= 90) {
    return '🌟 太棒了！您对长三角非遗文化的了解非常深入！'
  } else if (accuracy.value >= 70) {
    return '👍 很好！您对非遗文化有了较好的认识。'
  } else if (accuracy.value >= 50) {
    return '🎯 不错！继续学习会更加了解非遗文化。'
  } else {
    return '💪 加油！建议多看看非遗相关的介绍。'
  }
})

const startQuiz = async (mode: 'practice' | 'challenge') => {
  // 设置答题模式
  quizMode.value = mode
  
  // 根据难度更新题目数量
  questionCount.value = difficultyMap[selectedDifficulty.value as keyof typeof difficultyMap] || 10
  
  // 先获取题目
  await fetchQuestions()
  
  if (questions.value.length === 0) {
    alert('获取题目失败，请稍后重试')
    return
  }
  
  hasStarted.value = true
  selectedOption.value = null
  selectedOptions.value = []
  answered.value = false
  score.value = 0
  currentQuestion.value = 0
  showResults.value = false
  userAnswers.value = Array(questions.value.length).fill(null)
  startTime.value = Date.now()
  elapsedTime.value = 0
  startTimer() // 开始计时
}

const selectOption = (index: number) => {
  if (!answered.value) {
    selectedOption.value = index
  }
}

const submitAnswer = () => {
  if (answered.value) return
  
  const currentQ = questions.value[currentQuestion.value]
  if (!currentQ) return
  
  // 保存用户答案
  if (currentQ.type === '多选') {
    userAnswers.value[currentQuestion.value] = [...selectedOptions.value]
  } else {
    userAnswers.value[currentQuestion.value] = selectedOption.value ?? -1
  }
  
  // 检查答案
  let isCorrect = false
  if (currentQ.type === '多选') {
    isCorrect = isCorrectMultiAnswer()
  } else {
    isCorrect = selectedOption.value === currentQ.correct
  }
  
  if (isCorrect) {
    score.value += 10
  }
  
  answered.value = true
  // 移除自动跳转，让用户手动使用左右箭头切换
}

const nextQuestion = () => {
  if (currentQuestion.value < totalQuestions.value - 1) {
    currentQuestion.value++
    selectedOption.value = null
    selectedOptions.value = []
    answered.value = false
  }
}

const prevQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
    const answer = userAnswers.value[currentQuestion.value]
    const currentQ = questions.value[currentQuestion.value]
    
    if (currentQ?.type === '多选') {
      selectedOptions.value = (answer as number[]) || []
      selectedOption.value = null
    } else {
      selectedOption.value = (answer as number) ?? null
      selectedOptions.value = []
    }
    answered.value = true
  }
}

const finishQuiz = async () => {
  stopTimer() // 停止计时器
  timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
  showResults.value = true

  // 只有挑战模式才提交成绩到排行榜
  if (quizMode.value === 'challenge') {
    try {
      // 获取当前用户信息
      const userStr = localStorage.getItem('auth_current_user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (user && user.userId) {
        // 映射难度级别
        const difficultyLevelMap = {
          easy: 'beginner',
          medium: 'intermediate',
          hard: 'advanced'
        }
        
        const difficultyLevel = difficultyLevelMap[selectedDifficulty.value as keyof typeof difficultyLevelMap]
        
        const response = await fetch('/api/submit-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.userId,
            username: user.username,
            difficulty: difficultyLevel,
            totalQuestions: totalQuestions.value,
            correctAnswers: correctCount.value,
            score: score.value,
            timeSpent: timeSpent.value
          })
        })
        
        const data = await response.json()
        if (data.success) {
          console.log('✓ 成绩已保存到排行榜')
          if (data.data.rank) {
            console.log(`  当前排名: 第 ${data.data.rank} 名`)
          }
        }
      } else {
        console.log('⚠️ 未登录，成绩未保存到排行榜')
      }
    } catch (error) {
      console.error('提交成绩失败:', error)
    }
  } else {
    console.log('📝 练习模式，成绩不计入排行榜')
  }
}

// 判断多选题是否答对
const isCorrectMultiAnswer = (): boolean => {
  const currentQ = questions.value[currentQuestion.value]
  if (!currentQ || currentQ.type !== '多选') return false
  
  const userAns = selectedOptions.value.sort().join('')
  const correctAns = (currentQ.correct as string).split('').map(c => c.charCodeAt(0) - 65).sort().join('')
  return userAns === correctAns
}

// 获取正确答案文本
const getCorrectAnswerText = (): string => {
  const currentQ = questions.value[currentQuestion.value]
  if (!currentQ) return ''
  
  if (currentQ.type === '多选') {
    const correctIndexes = (currentQ.correct as string).split('').map(c => c.charCodeAt(0) - 65)
    return correctIndexes.map(i => `${String.fromCharCode(65 + i)}. ${currentQ.options[i]}`).join(', ')
  } else {
    const correctIndex = currentQ.correct as number
    return `${String.fromCharCode(65 + correctIndex)}. ${currentQ.options[correctIndex]}`
  }
}

const restartQuiz = () => {
  startQuiz(quizMode.value)
}

const backHome = () => {
  hasStarted.value = false
  showResults.value = false
}
</script>

<style scoped>
.community-container {
  min-width: 1400px;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
  padding-bottom: 30px;
}

.community-home {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ========== 答题页面样式 ========== */
.quiz-page {
  min-height: 100vh;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.progress-bar-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: bold;
  color: #333;
}

.score-with-button {
  display: flex;
  align-items: center;
  gap: 12px;
}

.end-quiz-button-inline {
  padding: 4px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
  white-space: nowrap;
}

.end-quiz-button-inline:hover {
  background: #c82333;
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
  transform: translateY(-1px);
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9916f 0%, #d4a574 100%);
  transition: width 0.3s ease;
}

.quiz-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 500px;
  max-width: 900px;
  margin: 0 auto;
}

/* 左右导航箭头 */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border: none;
  background: rgba(201, 145, 111, 0.9);
  color: white;
  font-size: 36px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow:hover {
  background: rgba(212, 165, 116, 1);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.nav-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-arrow-left {
  left: -70px;
}

.nav-arrow-right {
  right: -70px;
}

.quiz-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
}

/* 题目标签样式 */
.question-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-type {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-region {
  background: #e8f5e9;
  color: #388e3c;
}

.tag-difficulty {
  background: #fff3e0;
  color: #f57c00;
}

.tag-difficulty.简单 {
  background: #e8f5e9;
  color: #388e3c;
}

.tag-difficulty.中等 {
  background: #fff3e0;
  color: #f57c00;
}

.tag-difficulty.困难 {
  background: #ffebee;
  color: #d32f2f;
}

.question-hint {
  color: #666;
  font-size: 14px;
  margin-top: 8px;
  font-style: italic;
}

/* 加载样式 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #c9916f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 多选题复选框 */
.option-checkbox {
  margin-right: 8px;
  font-size: 18px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-section {
  margin-bottom: 40px;
}

.question-title {
  font-size: 1.3em;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.6;
}

.question-description {
  color: #999;
  font-size: 0.95em;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.option-button {
  padding: 16px 20px;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1em;
}

.option-button:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #d4a574;
}

.option-button.selected {
  background: #e8d5b7;
  border-color: #c9916f;
  font-weight: bold;
}

.option-button.correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.option-button.incorrect {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-label {
  min-width: 30px;
  font-weight: bold;
}

.option-text {
  flex: 1;
}

.option-icon {
  font-size: 1.2em;
  font-weight: bold;
}

.explanation-section {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #c9916f;
  margin-bottom: 30px;
}

.explanation-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.explanation-section p {
  color: #666;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.submit-button,
.nav-button,
.finish-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: all 0.3s;
}

.submit-button {
  background: #c9916f;
  color: white;
  flex: 1;
  max-width: 300px;
}

.submit-button:hover:not(:disabled) {
  background: #d4a574;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 145, 111, 0.3);
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.answered-hint {
  text-align: center;
  padding: 12px;
  color: #28a745;
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  flex: 1;
  max-width: 400px;
}

.finish-arrow {
  background: #28a745;
  font-size: 32px;
  font-weight: bold;
}

.finish-arrow:hover {
  background: #218838;
  transform: translateY(-50%) scale(1.1);
}

.navigation-buttons {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.nav-button {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.nav-button:hover {
  background: #e8d5b7;
  border-color: #c9916f;
}

.finish-button {
  background: linear-gradient(135deg, #c9916f 0%, #d4a574 100%);
  color: white;
  flex: 1;
  max-width: 200px;
}

.finish-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 145, 111, 0.3);
}

/* ========== 结果页面样式 ========== */
.results-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.results-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.5s ease-out;
}

.results-header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.results-header h1 {
  font-size: 2em;
  color: #333;
  margin-bottom: 20px;
}

.results-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
  margin-bottom: 15px;
}

.score-number {
  font-size: 3em;
  font-weight: bold;
  color: #c9916f;
}

.score-total {
  font-size: 1.5em;
  color: #999;
}

.results-message {
  color: #666;
  font-size: 1.1em;
  line-height: 1.6;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-label {
  color: #999;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #c9916f;
}

.results-actions {
  display: flex;
  gap: 10px;
}

.restart-button,
.home-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: all 0.3s;
}

.restart-button {
  background: #c9916f;
  color: white;
}

.restart-button:hover {
  background: #d4a574;
  transform: translateY(-2px);
}

.home-button {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.home-button:hover {
  background: #e8d5b7;
  border-color: #c9916f;
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

  .quiz-main {
    padding: 0 10px;
  }

  /* 小屏幕隐藏左右箭头 */
  .nav-arrow {
    display: none;
  }

  .quiz-card {
    padding: 20px;
  }

  .question-title {
    font-size: 1.1em;
  }

  .results-card {
    padding: 20px;
  }

  .score-number {
    font-size: 2em;
  }

  .results-stats {
    grid-template-columns: 1fr;
  }

  .heritage-gallery {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .rules-content {
    grid-template-columns: 1fr;
  }
  
  .leaderboard-content {
    padding: 0 10px;
  }
  
  .leaderboard-item {
    padding: 12px;
  }
  
  .user-details {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
}

/* ========== 超小屏响应式 ========== */
@media (max-width: 480px) {
  .quiz-header h1 {
    font-size: 1.5em;
  }
  
  .quiz-stats {
    grid-template-columns: 1fr;
  }
  
  .heritage-gallery {
    grid-template-columns: 1fr;
  }
  
  .card-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .community-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .heritage-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
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

  .modal-content {
    width: 95%;
    max-height: 85vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.3em;
  }

  .modal-body {
    padding: 20px;
  }

  .rules-modal-content {
    grid-template-columns: 1fr;
  }

  .community-features {
    grid-template-columns: 1fr;
  }
}
</style>
