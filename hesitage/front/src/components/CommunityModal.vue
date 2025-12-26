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
          <div class="leaderboard-item" v-for="(user, index) in topUsers" :key="index">
            <div class="rank">{{ index + 1 }}</div>
            <div class="user-info">
              <div class="avatar">{{ user.avatar }}</div>
              <div class="user-details">
                <span class="username">{{ user.name }}</span>
                <span class="score">{{ user.score }}分</span>
              </div>
            </div>
            <div class="badge">{{ user.title }}</div>
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
import { computed } from 'vue'

interface Props {
  show: boolean
  type: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
}>()

const modalTitle = computed(() => {
  const titles: Record<string, string> = {
    rules: '📋 比赛规则',
    leaderboard: '🏅 排行榜',
    community: '💬 交流社区'
  }
  return titles[props.type] || ''
})

const topUsers = [
  { name: '文化传承者', score: 98, avatar: '🏆', title: '非遗大师' },
  { name: '诗词达人', score: 94, avatar: '🥈', title: '文化学者' },
  { name: '古韵青年', score: 89, avatar: '🥉', title: '传承新星' },
  { name: '江南雅士', score: 85, avatar: '📚', title: '文化爱好者' },
  { name: '匠心独运', score: 82, avatar: '🎨', title: '文化爱好者' }
]
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
  gap: 12px;
}

.leaderboard-modal-content .leaderboard-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fafafa;
  border-radius: 10px;
  transition: background 0.3s;
}

.leaderboard-modal-content .leaderboard-item:hover {
  background: #f0f0f0;
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
}

.leaderboard-modal-content .badge {
  background: #f5e6d3;
  color: #c9916f;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: bold;
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
