<template>
  <div class="forgot-password-page">
    <div class="forgot-password-card">
      <!-- 左侧文案区 -->
      <div class="left-panel">
        <div class="brand">Welcome Back!</div>
        <div class="sub">
          <div>长三角非物质文化遗产</div>
          <div>WebGIS平台</div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="right-panel">
        <button class="btn-back" @click="goBack">← 返回登录</button>

        <!-- 步骤 1：输入邮箱 -->
        <div v-if="step === 1" class="form-section">
          <div class="title">找回密码</div>

          <label class="field">
            <div class="field-label">邮箱</div>
            <input
              v-model="email"
              class="input"
              type="email"
              placeholder="请输入你的邮箱"
              @keyup.enter="sendCode"
            />
          </label>

          <button class="btn-primary" :disabled="!email || loading" @click="sendCode">
            {{ loading ? '发送中...' : '发送验证码' }}
          </button>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <!-- 步骤 2：验证邮箱和输入验证码 -->
        <div v-if="step === 2" class="form-section">
          <div class="title">验证邮箱</div>
          <p class="step-hint">验证码已发送到 <strong>{{ maskedEmail }}</strong></p>

          <label class="field">
            <div class="field-label">验证码</div>
            <input
              v-model="verificationCode"
              class="input"
              type="text"
              placeholder="请输入 6 位验证码"
              maxlength="6"
              @keyup.enter="verifyAndReset"
            />
          </label>

          <div class="code-timer">
            <span v-if="codeExpired" class="expired">验证码已过期</span>
            <span v-else class="timer">{{ formatTime(codeExpiresAt) }}</span>
          </div>

          <button class="btn-primary" :disabled="!verificationCode || loading || codeExpired" @click="verifyAndReset">
            {{ loading ? '验证中...' : '验证并重置密码' }}
          </button>

          <button class="btn-link" :disabled="loading" @click="step = 1">
            更换邮箱
          </button>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <!-- 步骤 3：设置新密码 -->
        <div v-if="step === 3" class="form-section">
          <div class="title">设置新密码</div>

          <label class="field">
            <div class="field-label">新密码</div>
            <input
              v-model="newPassword"
              class="input"
              type="password"
              placeholder="至少 8 位字符"
            />
          </label>

          <label class="field">
            <div class="field-label">确认密码</div>
            <input
              v-model="confirmPassword"
              class="input"
              type="password"
              placeholder="再次输入密码"
              @keyup.enter="resetPassword"
            />
          </label>

          <button class="btn-primary" :disabled="!newPassword || !confirmPassword || loading" @click="resetPassword">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <!-- 步骤 4：成功 -->
        <div v-if="step === 4" class="form-section success">
          <div class="success-icon">✓</div>
          <div class="title">密码已重置</div>
          <p class="step-hint">你的密码已成功重置，请使用新密码登录</p>

          <button class="btn-primary" @click="goToLogin">
            返回登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const step = ref(1) // 1: 邮箱输入 | 2: 验证码 | 3: 新密码 | 4: 成功
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const codeExpiresAt = ref<number>(0)
const codeExpired = ref(false)

// 定时更新倒计时
const updateCodeTimer = () => {
  const interval = setInterval(() => {
    const now = Date.now() / 1000
    const remaining = codeExpiresAt.value - now
    if (remaining <= 0) {
      codeExpired.value = true
      clearInterval(interval)
    }
  }, 1000)
}

const formatTime = (expiresAt: number) => {
  const remaining = Math.max(0, Math.floor(expiresAt - Date.now() / 1000))
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const maskedEmail = computed(() => {
  const [name, domain] = email.value.split('@')
  if (!name || !domain) return email.value
  return `${name.substring(0, 2)}****@${domain}`
})

import { computed } from 'vue'

const sendCode = async () => {
  if (!email.value) {
    errorMessage.value = '请输入邮箱'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        type: 'reset_password',
      }),
    })

    const data = await response.json()

    if (data.success) {
      step.value = 2
      codeExpiresAt.value = data.expiresAt
      codeExpired.value = false
      updateCodeTimer()
      ElMessage.success('验证码已发送')
    } else {
      errorMessage.value = data.message || '发送失败'
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试'
    console.error('发送验证码失败:', error)
  } finally {
    loading.value = false
  }
}

const verifyAndReset = async () => {
  if (!verificationCode.value) {
    errorMessage.value = '请输入验证码'
    return
  }

  if (verificationCode.value.length !== 6) {
    errorMessage.value = '验证码必须是 6 位'
    return
  }

  // 验证码只是验证，直接进入密码重置步骤
  step.value = 3
  errorMessage.value = ''
}

const resetPassword = async () => {
  if (!newPassword.value) {
    errorMessage.value = '请输入新密码'
    return
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = '密码长度至少 8 位'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      }),
    })

    const data = await response.json()

    if (data.success) {
      step.value = 4
      ElMessage.success('密码已重置')
    } else {
      errorMessage.value = data.message || '重置失败'
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试'
    console.error('重置密码失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
}

.forgot-password-card {
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 90%;
  max-width: 900px;
  height: 500px;
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #c8b596 0%, #d4a574 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}

.brand {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.sub {
  font-size: 1.1em;
  line-height: 1.8;
  opacity: 0.9;
}

.right-panel {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.btn-back {
  align-self: flex-start;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1em;
  margin-bottom: 20px;
  transition: color 0.3s;
}

.btn-back:hover {
  color: #8b6f47;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section.success {
  align-items: center;
  text-align: center;
}

.title {
  font-size: 1.8em;
  color: #8b6f47;
  font-weight: bold;
  margin-bottom: 10px;
}

.step-hint {
  color: #999;
  font-size: 0.95em;
  margin-bottom: 10px;
}

.success-icon {
  font-size: 4em;
  color: #52c41a;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #333;
}

.input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.input:focus {
  outline: none;
  border-color: #c9916f;
  box-shadow: 0 0 0 3px rgba(201, 145, 111, 0.1);
}

.code-timer {
  font-size: 0.9em;
  text-align: right;
}

.timer {
  color: #ff7a45;
  font-weight: bold;
}

.expired {
  color: #f5222d;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #c9916f 0%, #d4a574 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 145, 111, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-link {
  background: none;
  border: none;
  color: #c9916f;
  cursor: pointer;
  font-size: 0.95em;
  text-align: center;
  transition: color 0.3s;
}

.btn-link:hover:not(:disabled) {
  color: #8b6f47;
  text-decoration: underline;
}

.btn-link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #f5222d;
  font-size: 0.9em;
  padding: 12px;
  background: #fff2f0;
  border-radius: 6px;
  border-left: 3px solid #f5222d;
}

@media (max-width: 768px) {
  .forgot-password-card {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    padding: 30px 20px;
  }

  .right-panel {
    padding: 30px 20px;
  }

  .brand {
    font-size: 1.5em;
  }
}
</style>
