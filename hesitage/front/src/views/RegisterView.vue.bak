<template>
  <div class="register-page">
    <div class="register-card">
      <!-- 左侧文案区（与登录页一致） -->
      <div class="left-panel">
        <div class="brand">Welcome Back!</div>
        <div class="sub">
          <div>长三角非物质文化遗产</div>
          <div>WebGIS平台</div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="right-panel">
        <div class="title">欢迎注册</div>

        <label class="field">
          <div class="field-label">用户名</div>
          <input v-model="username" class="input" type="text" placeholder="请输入用户名" autocomplete="username" />
        </label>

        <label class="field">
          <div class="field-label">邮箱</div>
          <input v-model="email" class="input" type="text" placeholder="请输入邮箱" autocomplete="email" />
        </label>

        <!-- 验证码（前端演示：生成 6 位码 + 倒计时） -->
        <div class="field">
          <div class="field-label">验证码</div>
          <div class="code-row">
            <input v-model="codeInput" class="input code-input" type="text" placeholder="验证码" />
            <button class="btn-code" type="button" :disabled="codeCooldown > 0" @click="onSendCode">
              {{ codeCooldown > 0 ? `重新获取(${codeCooldown}s)` : '获取验证码' }}
            </button>
          </div>

          <!-- 仅用于演示：把验证码提示出来（你接后端发邮件后删掉这行即可） -->
          <div v-if="devCodeHint" class="dev-hint">演示验证码：{{ devCodeHint }}</div>
        </div>

        <label class="field">
          <div class="field-label">密码</div>
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="请输入密码（至少8位，建议含字母数字）"
            autocomplete="new-password"
          />
        </label>

        <label class="field">
          <div class="field-label">确认密码</div>
          <input
            v-model="confirm"
            class="input"
            type="password"
            placeholder="请确认密码"
            autocomplete="new-password"
          />
        </label>

        <button class="btn-primary" type="button" :disabled="loading" @click="onRegister">
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <div class="bottom-actions">
          <div class="to-login">
            已有账号？
            <button class="link" type="button" @click="goLogin">去登录</button>
          </div>
        </div>

        <div class="hint">
          注册信息保存在本机 localStorage（前端可用版）。你后续接后端时，把 onSendCode / onRegister 换成接口请求即可。
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

/** ✅ 与登录页一致：全宽铺满 */
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

/** ✅ 注册成功后跳转：默认首页，也支持 ?redirect=/xxx */
const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.trim() ? r : '/'
})

/** ====== 表单 ====== */
const username = ref('')
const email = ref('')
const codeInput = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)

/** ====== 用户库（前端可用版）====== */
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
function writeUsers(users: LocalUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users))
}

function normalize(s: string) {
  return (s || '').trim().toLowerCase()
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

async function sha256Base64(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  const bytes = new Uint8Array(hash)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** ====== 验证码（演示版：本机生成+存储）====== */
const devCodeHint = ref('') // 演示提示（你接后端发邮件后删掉即可）
const codeCooldown = ref(0)
let timer: number | null = null

function gen6Code() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function startCooldown(sec = 60) {
  codeCooldown.value = sec
  if (timer) window.clearInterval(timer)
  timer = window.setInterval(() => {
    codeCooldown.value -= 1
    if (codeCooldown.value <= 0) {
      codeCooldown.value = 0
      if (timer) window.clearInterval(timer)
      timer = null
    }
  }, 1000)
}

function onSendCode() {
  const e = email.value.trim()
  if (!e) return alert('请先输入邮箱')
  if (!isEmail(e)) return alert('邮箱格式不正确')

  const code = gen6Code()
  const key = `auth_email_code:${normalize(e)}`
  localStorage.setItem(key, JSON.stringify({ code, createdAt: Date.now() }))

  // 演示用：显示验证码（接后端发邮件后删掉这一行即可）
  devCodeHint.value = code

  startCooldown(60)
  alert('验证码已生成（演示版：请看页面提示码）')
}

function verifyCode(e: string, input: string) {
  const key = `auth_email_code:${normalize(e)}`
  const raw = localStorage.getItem(key)
  if (!raw) return { ok: false, msg: '请先获取验证码' }

  try {
    const obj = JSON.parse(raw) as { code: string; createdAt: number }
    const expired = Date.now() - obj.createdAt > 10 * 60 * 1000 // 10分钟
    if (expired) return { ok: false, msg: '验证码已过期，请重新获取' }
    if ((input || '').trim() !== obj.code) return { ok: false, msg: '验证码错误' }
    return { ok: true, msg: '' }
  } catch {
    return { ok: false, msg: '验证码异常，请重新获取' }
  }
}

/** ====== 注册提交（真正可用：写入本机用户库）====== */
async function onRegister() {
  const u = username.value.trim()
  const e = email.value.trim()
  const c = codeInput.value.trim()
  const p = password.value
  const cp = confirm.value

  if (!u) return alert('请输入用户名')
  if (!e) return alert('请输入邮箱')
  if (!isEmail(e)) return alert('邮箱格式不正确')

  const codeCheck = verifyCode(e, c)
  if (!codeCheck.ok) return alert(codeCheck.msg)

  if (!p) return alert('请输入密码')
  if (p.length < 8) return alert('密码至少 8 位')
  const okMix = /[A-Za-z]/.test(p) && /\d/.test(p)
  if (!okMix) return alert('密码需包含字母和数字')
  if (p !== cp) return alert('两次密码不一致')

  loading.value = true
  try {
    const users = readUsers()
    const nu = normalize(u)
    const ne = normalize(e)

    if (users.some(x => normalize(x.username) === nu)) return alert('该用户名已存在')
    if (users.some(x => normalize(x.email) === ne)) return alert('该邮箱已注册')

    const passwordHash = await sha256Base64(p)
    users.push({ username: u, email: e, passwordHash, createdAt: Date.now() })
    writeUsers(users)

    // ✅ 写入你个人中心/设置页会用到的信息
    localStorage.setItem('userName', u)
    localStorage.setItem('userEmail', e)

    // ✅ 自动登录：写 token / 登录态
    const token = (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now())
    localStorage.setItem('token', token)
    localStorage.setItem('isLoggedIn', '1')
    localStorage.setItem('auth_current_user', JSON.stringify({ username: u, email: e }))

    alert('注册成功，请登录')
    router.replace({
    path: '/login',
    query: { redirect: redirectTo.value, account: e } // ✅ 顺便把邮箱带过去
    })
  } finally {
    loading.value = false
  }
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: redirectTo.value } })
}

onMounted(() => enableFullBleed())
onBeforeUnmount(() => {
  disableFullBleed()
  if (timer) window.clearInterval(timer)
})

// ✅ 你模板里用到的函数名要导出（script setup 自动可用）
// onSendCode / onRegister / goLogin / devCodeHint / codeCooldown 等
</script>


<style scoped>
/* ✅ 与登录页一致：解除 #app 限制 */
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

/* ✅ 背景全屏：fixed + 100vw */
.register-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  display: grid;
  place-items: center;

  background: url('/figures/bg-header.jpg') no-repeat center;
  background-size: cover;
}
.register-page::before {
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

/* 卡片：与登录页一致 */
.register-card {
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

/* 左侧：与登录页一致 */
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

/* 右侧：与登录页一致 */
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
.input::placeholder {
  color: rgba(0, 0, 0, 0.45);
}

/* 验证码行：输入 + 按钮 */
.code-row {
  display: grid;
  grid-template-columns: 1fr 150px;
  gap: 12px;
  align-items: center;
}
.code-input {
  height: 44px;
}
.btn-code {
  height: 44px;
  border: none;
  border-radius: 10px;
  background: rgba(27, 111, 178, 0.75);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(27, 111, 178, 0.14);
}
.btn-code:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}
.btn-code:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.dev-hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

/* 注册按钮：与登录页一致 */
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

/* 底部：已有账号/去登录 */
.bottom-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}
.to-login {
  font-size: 13px;
  color: rgba(58, 38, 24, 0.7);
  font-weight: 700;
}
.link {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #1b6fb2;
  font-weight: 900;
  padding: 0 6px;
}
.link:hover {
  text-decoration: underline;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.6;
}

@media (max-width: 860px) {
  .register-card {
    grid-template-columns: 1fr;
  }
  .left-panel {
    padding: 26px 16px;
  }
  .right-panel {
    padding: 22px 18px 18px;
  }
  .code-row {
    grid-template-columns: 1fr;
  }
}
</style>
