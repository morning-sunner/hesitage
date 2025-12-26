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
      <!-- 进度条 -->
      <div class="progress-bar-section">
        <div class="progress-info">
          <span>第 {{ currentQuestion + 1 }} / {{ totalQuestions }} 题</span>
          <span>得分: {{ score }} 分</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- 题目区域 -->
      <div class="quiz-main">
        <div class="quiz-card">
          <!-- 题目 -->
          <div class="question-section">
            <h2 class="question-title" v-if="questions[currentQuestion]">{{ currentQuestion + 1 }}. {{ questions[currentQuestion]!.question }}</h2>
            <p v-if="questions[currentQuestion]?.description" class="question-description">
              {{ questions[currentQuestion]!.description }}
            </p>
          </div>

          <!-- 选项 -->
          <div class="options-section" v-if="questions[currentQuestion]">
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

          <!-- 解释 -->
          <div v-if="answered && questions[currentQuestion]" class="explanation-section">
            <div class="explanation-title">📖 答案解释</div>
            <p>{{ questions[currentQuestion]!.explanation }}</p>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button v-if="!answered" @click="submitAnswer" :disabled="selectedOption === null" class="submit-button">
              提交答案
            </button>
            <div v-else class="navigation-buttons">
              <button v-if="currentQuestion > 0" @click="prevQuestion" class="nav-button">← 上一题</button>
              <button v-if="currentQuestion < totalQuestions - 1" @click="nextQuestion" class="nav-button">下一题 →</button>
              <button v-else @click="finishQuiz" class="finish-button">完成竞赛</button>
            </div>
          </div>
        </div>
      </div>
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
          <button @click="backHome" class="home-button">返回首页</button>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import CommunityHero from '../components/CommunityHero.vue'
import CommunityModal from '../components/CommunityModal.vue'

interface Question {
  question: string
  description?: string
  options: string[]
  correct: number
  explanation: string
}

const router = useRouter()
const hasStarted = ref(false)
const showResults = ref(false)
const currentQuestion = ref(0)
const selectedOption = ref<number | null>(null)
const answered = ref(false)
const score = ref(0)
const startTime = ref<number>(0)
const timeSpent = ref(0)
const userAnswers = ref<number[]>([])
const selectedDifficulty = ref('easy')

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

const questions: Question[] = [
  {
    question: '昆曲是哪个地区的传统艺术？',
    description: '请选择昆曲的主要传承地',
    options: ['北京', '苏州', '杭州', '宁波'],
    correct: 1,
    explanation: '昆曲是苏州地区的传统戏曲艺术，也是联合国非物质文化遗产代表作。'
  },
  {
    question: '西湖龙井茶的制作工艺属于哪个省份？',
    options: ['安徽', '浙江', '江苏', '江西'],
    correct: 1,
    explanation: '西湖龙井茶产于杭州西湖地区，是浙江省的著名茶叶，其制作工艺已被列为国家非遗项目。'
  },
  {
    question: '苏州评弹的主要语言是什么？',
    options: ['普通话', '粤语', '吴语', '闽南语'],
    correct: 2,
    explanation: '苏州评弹使用吴语进行表演，是长三角地区非常重要的说唱艺术。'
  },
  {
    question: '下列哪个不是长三角地区的非遗项目？',
    options: ['宣纸制作', '徽州木雕', '景德镇瓷器', '京剧'],
    correct: 3,
    explanation: '京剧是北京的传统艺术，不属于长三角地区。宣纸、徽州木雕、景德镇瓷器都是长三角地区的重要非遗项目。'
  },
  {
    question: '浙江剪纸通常用什么工具进行创作？',
    options: ['笔和墨', '剪刀和纸', '刀具和木板', '笔和颜料'],
    correct: 1,
    explanation: '浙江剪纸是用剪刀在纸张上进行创作的传统艺术，具有独特的视觉效果。'
  }
]

const totalQuestions = questions.length
const progressPercentage = computed(() => {
  return ((currentQuestion.value + 1) / totalQuestions) * 100
})

const correctCount = computed(() => {
  return userAnswers.value.filter((answer, index) => answer === questions[index]?.correct).length
})

const accuracy = computed(() => {
  return Math.round((correctCount.value / totalQuestions) * 100)
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

const startQuiz = () => {
  hasStarted.value = true
  selectedOption.value = null
  answered.value = false
  score.value = 0
  currentQuestion.value = 0
  showResults.value = false
  userAnswers.value = Array(totalQuestions).fill(null)
  startTime.value = Date.now()
}

const selectOption = (index: number) => {
  if (!answered.value) {
    selectedOption.value = index
  }
}

const submitAnswer = () => {
  if (selectedOption.value === null) return

  const current = currentQuestion.value
  if (current < 0 || current >= questions.length) return

  answered.value = true
  userAnswers.value[current] = selectedOption.value

  // 计算得分
  if (selectedOption.value === questions[current]!.correct) {
    score.value += 10
  }
}

const nextQuestion = () => {
  if (currentQuestion.value < totalQuestions - 1) {
    currentQuestion.value++
    selectedOption.value = null
    answered.value = false
  }
}

const prevQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
    const answer = userAnswers.value[currentQuestion.value]
    selectedOption.value = (answer !== undefined) ? answer : null
    answered.value = true
  }
}

const finishQuiz = () => {
  timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
  showResults.value = true
}

const restartQuiz = () => {
  startQuiz()
}

const backHome = () => {
  hasStarted.value = false
  showResults.value = false
  router.push('/')
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
  margin-bottom: 12px;
  font-weight: bold;
  color: #333;
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
  min-height: 500px;
}

.quiz-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
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
