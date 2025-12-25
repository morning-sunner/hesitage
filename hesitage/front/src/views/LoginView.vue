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
          <button class="btn-link" type="button" @click="goRegister">新用户注册</button>
        </div>

        <div class="hint">
          登录校验使用 localStorage 的 auth_users（前端可用版）。
        </div>
      </div>
    </div>

    <!-- ✅ 忘记密码弹窗（写在本文件里，不新增路由） -->
    <teleport to="body">
      <div v-if="forgotOpen" class="modal-mask" @click.self="closeForgot">
        <div class="modal-card">
          <div class="modal-head">
            <div class="modal-title">找回密码</div>
            <button class="modal-x" type="button" @click="closeForgot">×</button>
          </div>

          <div class="modal-desc">
            这是演示版：验证码会用弹窗提示（真实项目应发送到邮箱/短信）。
          </div>

          <label class="field">
            <div class="field-label">账号/邮箱</div>
            <input
              v-model="fpAccount"
              class="input"
              type="text"
              placeholder="请输入用户名或邮箱"
              autocomplete="username"
            />
          </label>

          <div class="fp-row">
            <label class="field fp-code">
              <div class="field-label">验证码</div>
              <input
                v-model="fpCode"
                class="input"
                type="text"
                placeholder="6位验证码"
                inputmode="numeric"
                maxlength="6"
              />
            </label>

            <button
              class="btn-secondary"
              type="button"
              :disabled="fpSending || fpCooldown > 0"
              @click="sendResetCode"
            >
              <span v-if="fpCooldown > 0">{{ fpCooldown }}s后重试</span>
              <span v-else>{{ fpSending ? '发送中...' : '发送验证码' }}</span>
            </button>
          </div>

          <label class="field">
            <div class="field-label">新密码</div>
            <input
              v-model="fpNewPassword"
              class="input"
              type="password"
              placeholder="请输入新密码（至少6位）"
              autocomplete="new-password"
            />
          </label>

          <label class="field">
            <div class="field-label">确认新密码</div>
            <input
              v-model="fpNewPassword2"
              class="input"
              type="password"
              placeholder="再次输入新密码"
              autocomplete="new-password"
            />
          </label>

          <div class="fp-actions">
            <button class="btn-ghost" type="button" @click="closeForgot">取消</button>
            <button class="btn-primary" type="button" :disabled="fpResetting" @click="resetPassword">
              {{ fpResetting ? '提交中...' : '重置密码并返回登录' }}
            </button>
          </div>

          <div class="fp-foot">
            提示：验证码有效期 10 分钟。
          </div>
        </div>
      </div>
    </teleport>
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

/** ====== 用户库（与注册页/设置页兼容）====== */
type LocalUser = {
  username: string
  email: string
  passwordHash: string
  createdAt: number
  deactivated?: boolean
  deactivatedAt?: number
}
const LS_USERS = 'auth_users'
const RESET_PREFIX = 'auth_reset_code:' // key = auth_reset_code:<emailLower>

function readUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(LS_USERS)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as LocalUser[]) : []
  } catch {
    return []
  }
}
function writeUsers(users: LocalUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users))
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

function findUserByAccount(users: LocalUser[], a: string): LocalUser | undefined {
  const na = normalize(a)
  return users.find(x => normalize(x.username) === na || normalize(x.email) === na)
}

async function onLogin() {
  const a = account.value.trim()
  const p = password.value

  if (!a) return alert('请输入用户名或邮箱')
  if (!p) return alert('请输入密码')

  loading.value = true
  try {
    const users = readUsers()
    const u = findUserByAccount(users, a)
    if (!u) return alert('账号不存在，请先注册')

    // ✅ 兼容“停用账户”
    if (u.deactivated) {
      const ok = window.confirm('该账户已停用，是否现在重新启用并继续登录？')
      if (!ok) return
      // 重新启用
      const emailKey = normalize(u.email)
      const idx = users.findIndex(x => normalize(x.email) === emailKey)
      const target = users[idx]
      if (target) {
        target.deactivated = false
        target.deactivatedAt = undefined
        writeUsers(users)
      }
    }

    const ph = await sha256Base64(p)
    if (ph !== u.passwordHash) return alert('密码错误')

    // ✅ 写入登录态 & 给你的个人中心/设置页用
    const token = (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now())
    localStorage.setItem('token', token)
    localStorage.setItem('isLoggedIn', '1')
    localStorage.setItem('auth_current_user', JSON.stringify({ username: u.username, email: u.email }))
    localStorage.setItem('userName', u.username)
    localStorage.setItem('userEmail', u.email)

    // 让其它组件（如顶部头像）立刻更新
    window.dispatchEvent(new Event('auth-changed'))

    alert('登录成功')
    router.replace(redirectTo.value)
  } finally {
    loading.value = false
  }
}

/** ================= 忘记密码：弹窗版（落地可用） ================= */
const forgotOpen = ref(false)
const fpAccount = ref('')
const fpCode = ref('')
const fpNewPassword = ref('')
const fpNewPassword2 = ref('')
const fpSending = ref(false)
const fpResetting = ref(false)
const fpCooldown = ref(0)
let fpTimer: number | null = null

function openForgot() {
  forgotOpen.value = true
  // 默认带入登录框账号，减少用户输入
  fpAccount.value = account.value.trim()
  fpCode.value = ''
  fpNewPassword.value = ''
  fpNewPassword2.value = ''
}

function closeForgot() {
  forgotOpen.value = false
}

function startCooldown(seconds: number) {
  fpCooldown.value = seconds
  if (fpTimer) window.clearInterval(fpTimer)
  fpTimer = window.setInterval(() => {
    fpCooldown.value -= 1
    if (fpCooldown.value <= 0) {
      fpCooldown.value = 0
      if (fpTimer) window.clearInterval(fpTimer)
      fpTimer = null
    }
  }, 1000)
}

function make6Code() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

type ResetPayload = { code: string; expiresAt: number }

function readReset(emailLower: string): ResetPayload | null {
  try {
    const raw = localStorage.getItem(`${RESET_PREFIX}${emailLower}`)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (!obj?.code || !obj?.expiresAt) return null
    return obj as ResetPayload
  } catch {
    return null
  }
}

function writeReset(emailLower: string, payload: ResetPayload) {
  localStorage.setItem(`${RESET_PREFIX}${emailLower}`, JSON.stringify(payload))
}

function clearReset(emailLower: string) {
  localStorage.removeItem(`${RESET_PREFIX}${emailLower}`)
}

async function sendResetCode() {
  const a = fpAccount.value.trim()
  if (!a) return alert('请输入用户名或邮箱')

  fpSending.value = true
  try {
    const users = readUsers()
    const u = findUserByAccount(users, a)
    if (!u) return alert('账号不存在，请先注册')

    const emailLower = normalize(u.email)
    const code = make6Code()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10分钟
    writeReset(emailLower, { code, expiresAt })

    // ✅ 演示版：直接弹出验证码（真实项目：发邮件/短信）
    alert(`验证码（演示版）：${code}\n有效期 10 分钟`)

    // 防止狂点：60s 冷却
    startCooldown(60)
  } finally {
    fpSending.value = false
  }
}

async function resetPassword() {
  const a = fpAccount.value.trim()
  const c = fpCode.value.trim()
  const p1 = fpNewPassword.value
  const p2 = fpNewPassword2.value

  if (!a) return alert('请输入用户名或邮箱')
  if (!c) return alert('请输入验证码')
  if (c.length !== 6) return alert('验证码应为6位数字')
  if (!p1 || p1.length < 6) return alert('新密码至少6位')
  if (p1 !== p2) return alert('两次输入的新密码不一致')

  fpResetting.value = true
  try {
    const users = readUsers()
    const u = findUserByAccount(users, a)
    if (!u) return alert('账号不存在，请先注册')

    const emailLower = normalize(u.email)
    const payload = readReset(emailLower)
    if (!payload) return alert('请先发送验证码')
    if (Date.now() > payload.expiresAt) {
      clearReset(emailLower)
      return alert('验证码已过期，请重新发送')
    }
    if (payload.code !== c) return alert('验证码错误')

    // 更新密码
    const idx = users.findIndex(x => normalize(x.email) === emailLower)
    const target = users[idx]
    if (!target) return alert('未找到账户记录，无法重置')

    target.passwordHash = await sha256Base64(p1)
    writeUsers(users)
    clearReset(emailLower)

    alert('密码已重置，请使用新密码登录')
    // 回填账号，清空登录密码
    account.value = u.email || u.username
    password.value = ''
    closeForgot()
  } finally {
    fpResetting.value = false
  }
}

function onForgot() {
  openForgot()
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

onBeforeUnmount(() => {
  if (fpTimer) window.clearInterval(fpTimer)
  fpTimer = null
  disableFullBleed()
})
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

/* ================= 弹窗样式（新增，不影响原布局） ================= */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 18px;
}

.modal-card {
  width: min(560px, 94vw);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(240, 230, 214, 0.95);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  padding: 18px 18px 14px;
  backdrop-filter: blur(10px);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.modal-title {
  font-size: 18px;
  font-weight: 900;
  color: #3a2618;
}
.modal-x {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
}
.modal-x:hover {
  transform: translateY(-1px);
}

.modal-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.58);
  line-height: 1.6;
  margin-bottom: 12px;
}

.fp-row {
  display: flex;
  align-items: end;
  gap: 10px;
}
.fp-code {
  flex: 1;
  margin-bottom: 14px;
}

.btn-secondary {
  height: 44px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 900;
  color: rgba(58, 38, 24, 0.9);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}
.btn-secondary:hover {
  transform: translateY(-1px);
}
.btn-secondary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.fp-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-ghost {
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(255, 255, 255, 0.70);
  cursor: pointer;
  font-weight: 900;
}
.btn-ghost:hover {
  transform: translateY(-1px);
}

.fp-foot {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
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
