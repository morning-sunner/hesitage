<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <!-- 弹窗内容 -->
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button class="close-button" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <!-- 比赛规则 -->
        <div v-if="type === 'rules'" class="rules-modal-content">
          <div class="rule-card">
            <div class="rule-icon">⏰</div>
            <h3>时间规则</h3>
            <ul>
              <li>每题答题时间不限</li>
              <li>总用时将影响最终排名</li>
              <li>建议仔细思考后作答</li>
            </ul>
          </div>
          <div class="rule-card">
            <div class="rule-icon">💯</div>
            <h3>计分规则</h3>
            <ul>
              <li>答对一题得10分</li>
              <li>答错不扣分</li>
              <li>最终成绩基于正确率计算</li>
            </ul>
          </div>
          <div class="rule-card">
            <div class="rule-icon">🏆</div>
            <h3>奖励机制</h3>
            <ul>
              <li>90分以上：非遗文化大师</li>
              <li>70-89分：文化传承者</li>
              <li>50-69分：文化爱好者</li>
            </ul>
          </div>
        </div>

        <!-- 排行榜 -->
        <div v-if="type === 'leaderboard'" class="leaderboard-modal-content">
          <!-- 难度选择器 -->
          <div class="difficulty-tabs">
            <button 
              v-for="diff in difficultyLevels" 
              :key="diff.value"
              :class="['difficulty-tab', { active: selectedDifficulty === diff.value }]"
              @click="selectedDifficulty = diff.value"
            >
              {{ diff.label }}
            </button>
          </div>

          <!-- 加载中状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 排行榜列表 -->
          <div v-else-if="currentLeaderboard.length > 0" class="leaderboard-list">
            <div class="leaderboard-item" v-for="user in currentLeaderboard" :key="user.userId">
              <div class="rank" :class="getRankClass(user.rank)">{{ user.rank }}</div>
              <div class="user-info">
                <div class="avatar">{{ getAvatarEmoji(user.rank) }}</div>
                <div class="user-details">
                  <span class="username">{{ user.username }}</span>
                  <span class="score">
                    {{ user.score }}分 
                    <span class="time-info">({{ formatTime(user.timeSpent) }})</span>
                  </span>
                </div>
              </div>
              <div class="badge">{{ getBadgeTitle(user.score) }}</div>
            </div>
          </div>

          <!-- 暂无数据 -->
          <div v-else class="empty-state">
            <div class="empty-icon">🏆</div>
            <p>暂无排行榜数据</p>
            <p class="empty-hint">快来成为第一个上榜的人吧！</p>
          </div>
        </div>

        <!-- 交流社区 -->
        <div v-if="type === 'community'" class="community-modal-content">
          <div class="community-intro">
            <p>🎉 欢迎来到长三角非遗文化交流社区！</p>
            <p>这里是全国最大的非遗文化学习交流平台，汇聚了来自各地的文化爱好者。</p>
          </div>
          <div class="community-features">
            <div class="feature-item">
              <div class="feature-icon">💬</div>
              <h4>在线讨论</h4>
              <p>与专家和爱好者实时交流非遗知识</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <h4>资源分享</h4>
              <p>海量非遗文化学习资料免费下载</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎓</div>
              <h4>专家讲座</h4>
              <p>定期举办非遗传承人在线讲座</p>
            </div>
          </div>
          <button class="join-button">立即加入社区</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Props {
  show: boolean
  type: string
}

interface LeaderboardUser {
  rank: number | string
  userId: number
  username: string
  totalQuestions: number
  correctAnswers: number
  score: number
  timeSpent: number
  submittedAt: string
}

interface LeaderboardData {
  beginner: LeaderboardUser[]
  intermediate: LeaderboardUser[]
  advanced: LeaderboardUser[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
}>()

const selectedDifficulty = ref<'beginner' | 'intermediate' | 'advanced'>('beginner')
const loading = ref(false)
const leaderboardData = ref<LeaderboardData>({
  beginner: [],
  intermediate: [],
  advanced: []
})

const difficultyLevels = [
  { value: 'beginner' as const, label: '初级 (10题)' },
  { value: 'intermediate' as const, label: '中级 (20题)' },
  { value: 'advanced' as const, label: '高级 (25题)' }
]

const modalTitle = computed(() => {
  const titles: Record<string, string> = {
    rules: '📋 比赛规则',
    leaderboard: '🏅 排行榜',
    community: '💬 交流社区'
  }
  return titles[props.type] || ''
})

const currentLeaderboard = computed(() => {
  return leaderboardData.value[selectedDifficulty.value] || []
})

// 获取排行榜数据
const fetchLeaderboard = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/leaderboard')
    const data = await response.json()
    
    console.log('📊 排行榜API响应:', data)
    
    if (data.success) {
      leaderboardData.value = data.data
      console.log('✅ 排行榜数据已加载:', leaderboardData.value)
      console.log('当前难度数据:', currentLeaderboard.value)
    } else {
      console.error('❌ API返回失败:', data)
    }
  } catch (error) {
    console.error('❌ 获取排行榜失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化时间（秒转为分秒）
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return minutes > 0 ? `${minutes}分${secs}秒` : `${secs}秒`
}

// 获取排名样式类
const getRankClass = (rank: number | string): string => {
  const r = typeof rank === 'string' ? parseInt(rank) : rank
  if (r === 1) return 'rank-gold'
  if (r === 2) return 'rank-silver'
  if (r === 3) return 'rank-bronze'
  return ''
}

// 获取头像表情
const getAvatarEmoji = (rank: number | string): string => {
  const r = typeof rank === 'string' ? parseInt(rank) : rank
  if (r === 1) return '🏆'
  if (r === 2) return '🥈'
  if (r === 3) return '🥉'
  return '👤'
}

// 获取徽章标题
const getBadgeTitle = (score: number): string => {
  if (score >= 90) return '非遗大师'
  if (score >= 80) return '文化学者'
  if (score >= 70) return '传承新星'
  if (score >= 60) return '文化爱好者'
  return '学习者'
}

// 监听弹窗显示状态
watch(() => props.show, (newVal) => {
  if (newVal && props.type === 'leaderboard') {
    fetchLeaderboard()
  }
})

// 组件挂载时如果是排行榜类型则加载数据
onMounted(() => {
  if (props.show && props.type === 'leaderboard') {
    fetchLeaderboard()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: zoomIn 0.3s ease-out;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #faf8f4 0%, #ffffff 100%);
}

.modal-header h2 {
  color: #8b6f47;
  font-size: 1.6em;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8em;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-button:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(80vh - 100px);
}

/* 规则弹窗内容 */
.rules-modal-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.rules-modal-content .rule-card {
  background: #fafafa;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.rules-modal-content .rule-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
  display: block;
}

.rules-modal-content h3 {
  color: #8b6f47;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.rules-modal-content ul {
  text-align: left;
  color: #666;
  line-height: 1.8;
  padding-left: 20px;
}

.rules-modal-content li {
  margin-bottom: 8px;
}

/* 排行榜弹窗内容 */
.leaderboard-modal-content {
  display: flex;
  flex-direction: column;
}

.difficulty-tabs {
  display: flex;
  gap: 8px;
  padding: 20px 20px 0 20px;
  border-bottom: 2px solid #f0f0f0;
}

.difficulty-tab {
  flex: 1;
  padding: 12px 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px 8px 0 0;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.difficulty-tab:hover {
  background: #e8e8e8;
  color: #333;
}

.difficulty-tab.active {
  background: linear-gradient(135deg, #d4a574 0%, #c9916f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #d4a574;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.leaderboard-list {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.leaderboard-modal-content .leaderboard-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fafafa;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 12px;
}

.leaderboard-modal-content .leaderboard-item:hover {
  background: #f5e6d3;
  transform: translateX(4px);
}

.leaderboard-modal-content .rank {
  width: 35px;
  height: 35px;
  background: #d4a574;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a857 100%);
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
}

.leaderboard-modal-content .user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.leaderboard-modal-content .avatar {
  font-size: 1.8em;
}

.leaderboard-modal-content .user-details {
  display: flex;
  flex-direction: column;
}

.leaderboard-modal-content .username {
  font-weight: bold;
  color: #333;
  margin-bottom: 3px;
}

.leaderboard-modal-content .score {
  color: #c9916f;
  font-size: 0.95em;
  font-weight: 600;
}

.time-info {
  font-size: 0.85em;
  color: #999;
  font-weight: 400;
  margin-left: 8px;
}

.leaderboard-modal-content .badge {
  background: #f5e6d3;
  color: #c9916f;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: bold;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px;
  color: #bbb;
}

/* 社区弹窗内容 */
.community-modal-content {
  text-align: center;
}

.community-intro {
  margin-bottom: 30px;
}

.community-intro p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 12px;
  font-size: 1.05em;
}

.community-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-item {
  background: #fafafa;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.feature-icon {
  font-size: 2.5em;
  margin-bottom: 12px;
}

.feature-item h4 {
  color: #8b6f47;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.feature-item p {
  color: #666;
  font-size: 0.9em;
  line-height: 1.6;
}

.join-button {
  background: linear-gradient(135deg, #d4a574 0%, #c9916f 100%);
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 25px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.join-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 165, 116, 0.4);
}

@media (max-width: 480px) {
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
