<template>
  <div class="login-page">
    <div class="login-card">
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
        <div class="title">账号密码登录</div>

        <label class="field">
          <div class="field-label">账号/邮箱</div>
          <input
            v-model="account"
            class="input"
            type="text"
            placeholder="请输入用户名或邮箱"
            autocomplete="username"
          />
        </label>

        <label class="field">
          <div class="field-label">密码</div>
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </label>

        <button class="btn-primary" type="button" :disabled="loading" @click="onLogin">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div class="bottom-actions">
          <button class="btn-link" type="button" @click="onForgot">忘记密码？</button>
          <!-- ✅ 这里就是你说的“新用户注册” -->
          <button class="btn-link" type="button" @click="goRegister">新用户注册</button>
        </div>

        <div class="hint">
          登录校验使用 localStorage 的 auth_users（前端可用版）。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

/** ✅ 与你注册页一致：全宽铺满 */
const APP_CLASS = 'app-full-bleed'
const BODY_CLASS = 'auth-full-bleed'
function enableFullBleed() {
  document.getElementById('app')?.classList.add(APP_CLASS)
  document.body.classList.add(BODY_CLASS)
}
function disableFullBleed() {
  document.getElementById('app')?.classList.remove(APP_CLASS)
  document.body.classList.remove(BODY_CLASS)
}

/** ✅ 登录成功后跳到哪里：默认首页 */
const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.trim() ? r : '/'
})

const account = ref('')
const password = ref('')
const loading = ref(false)

/** ====== 用户库（与注册页保持一致）====== */
type LocalUser = {
  username: string
  email: string
  passwordHash: string
  createdAt: number
}
const LS_USERS = 'auth_users'

function readUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(LS_USERS)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function normalize(s: string) {
  return (s || '').trim().toLowerCase()
}

async function sha256Base64(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  const bytes = new Uint8Array(hash)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

async function onLogin() {
  const a = account.value.trim()
  const p = password.value

  if (!a) return alert('请输入用户名或邮箱')
  if (!p) return alert('请输入密码')

  loading.value = true
  try {
    const users = readUsers()
    const na = normalize(a)
    const u = users.find(x => normalize(x.username) === na || normalize(x.email) === na)
    if (!u) return alert('账号不存在，请先注册')

    const ph = await sha256Base64(p)
    if (ph !== u.passwordHash) return alert('密码错误')

    // ✅ 写入登录态 & 给你的个人中心/设置页用
    const token = (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now())
    localStorage.setItem('token', token)
    localStorage.setItem('isLoggedIn', '1')
    localStorage.setItem('auth_current_user', JSON.stringify({ username: u.username, email: u.email }))

    localStorage.setItem('userName', u.username)
    localStorage.setItem('userEmail', u.email)

    alert('登录成功')
    router.replace(redirectTo.value) // ✅ 登录成功回首页（或 redirect 指定页）
  } finally {
    loading.value = false
  }
}

function onForgot() {
  alert('忘记密码功能待完善')
}

async function goRegister() {
  try {
    await router.push({ name: 'register', query: { redirect: redirectTo.value } })
  } catch (e) {
    console.error('goRegister 跳转失败：', e)
    alert('跳转失败：请打开控制台查看报错信息')
  }
}


onMounted(() => {
  enableFullBleed()

  const a = route.query.account
  if (typeof a === 'string' && a.trim()) {
    account.value = a.trim()
  }
})

onBeforeUnmount(() => disableFullBleed())
</script>

<style scoped>
/* ✅ 解除 #app 限制（与注册页一致） */
:global(#app.app-full-bleed) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
:global(body.auth-full-bleed) {
  margin: 0;
  overflow: hidden;
  background: #faf6f2;
}

.login-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  display: grid;
  place-items: center;

  background: url('/figures/bg-header.jpg') no-repeat center;
  background-size: cover;
}
.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 20% 0%,
    rgba(255, 255, 255, 0.55),
    rgba(250, 246, 242, 0.82) 60%,
    rgba(0, 0, 0, 0.08) 100%
  );
}

.login-card {
  position: relative;
  z-index: 1;
  width: min(980px, 92vw);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(240, 230, 214, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);

  display: grid;
  grid-template-columns: 360px 1fr;
  overflow: hidden;
}

.left-panel {
  background: rgba(240, 205, 150, 0.35);
  border-right: 1px solid rgba(224, 208, 184, 0.8);
  padding: 44px 26px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
}
.brand {
  font-size: 34px;
  font-weight: 900;
  color: #3a2618;
}
.sub {
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: rgba(58, 38, 24, 0.9);
  line-height: 1.9;
}

.right-panel {
  padding: 34px 34px 26px;
}
.title {
  font-size: 22px;
  font-weight: 900;
  color: #3a2618;
  margin-bottom: 18px;
  border-left: 4px solid rgba(194, 158, 109, 0.95);
  padding-left: 12px;
}

.field {
  display: block;
  margin-bottom: 14px;
}
.field-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(58, 38, 24, 0.75);
  margin-bottom: 8px;
}
.input {
  width: 100%;
  height: 44px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(255, 255, 255, 0.78);
  outline: none;
  padding: 0 14px;
  font-size: 14px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.input:focus {
  border-color: rgba(194, 158, 109, 0.95);
  box-shadow: 0 0 0 3px rgba(194, 158, 109, 0.16), 0 10px 18px rgba(0, 0, 0, 0.08);
}

.btn-primary {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: rgba(139, 69, 19, 0.88);
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 14px 22px rgba(139, 69, 19, 0.18);
}
.btn-primary:hover {
  background: rgba(109, 56, 17, 0.95);
  transform: translateY(-1px);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
}
.btn-link {
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(255, 255, 255, 0.70);
  padding: 8px 16px;
  cursor: pointer;
  color: #1b6fb2;
  font-size: 14px;
  font-weight: 800;
  border-radius: 10px;
}
.btn-link:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.6;
}

@media (max-width: 860px) {
  .login-card {
    grid-template-columns: 1fr;
  }
  .left-panel {
    padding: 26px 16px;
  }
  .right-panel {
    padding: 22px 18px 18px;
  }
}
</style>
