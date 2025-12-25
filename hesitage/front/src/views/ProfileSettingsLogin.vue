<template>
  <div class="settings-page">
    <!-- 顶部头部（与前两页一致） -->
    <div class="header">
      <h1>个人中心</h1>

      <div class="avatar-area">
        <div
          class="avatar"
          @click="onAvatarClick"
          :title="loggedIn ? '点击上传头像' : '请先登录后上传头像'"
          :class="{ filled: !!avatarUrl, disabled: !loggedIn }"
        >
          <img v-if="avatarUrl" :src="avatarUrl" alt="用户头像" class="avatar-img" />
          <div v-else class="avatar-icon"></div>

          <div class="avatar-mask">
            <span>{{ loggedIn ? (avatarUrl ? '更换头像' : '上传头像') : '未登录' }}</span>
          </div>
        </div>

        <div class="avatar-text">
          <span v-if="loggedIn">{{ avatarUrl ? '点击更换头像' : '添加头像' }}</span>
          <span v-else>未登录</span>
        </div>

        <input ref="fileInputRef" class="file-input" type="file" accept="image/*" @change="onFileChange" />
      </div>

      <input
        v-model="userEmail"
        type="text"
        class="username-input"
        :disabled="!loggedIn"
        :placeholder="loggedIn ? 'xxxxx@xx.com' : '未登录'"
      />
    </div>

    <!-- 主菜单导航 -->
    <div class="nav">
      <button class="nav-home" type="button" @click="goHome" aria-label="返回首页">← 首页</button>

      <div class="nav-links">
        <router-link to="/profile" class="nav-item" :class="{ active: activeTab === '/profile' }">
          📋 我的资料
        </router-link>

        <router-link to="/profile/edit" class="nav-item" :class="{ active: activeTab === '/profile/edit' }">
          ⭐ 我的收藏
        </router-link>

        <router-link
          to="/profile/settings"
          class="nav-item"
          :class="{ active: activeTab.startsWith('/profile/settings') }"
        >
          ⚙️ 设置
        </router-link>
      </div>
    </div>

    <!-- 主体 -->
    <div class="page-shell">
      <div class="settings-layout">
        <!-- 左侧菜单 -->
        <aside class="settings-side">
          <button class="side-item" :class="{ active: activeSection === 'security' }" @click="goSecurity">
            账户与安全
          </button>

          <button class="side-item" :class="{ active: activeSection === 'privacy' }" @click="goPrivacy">
            隐私设置
          </button>

          <!-- ✅ 数据管理：暂时隐藏（不删除，后面要恢复就把注释去掉） -->
          <!--
          <button class="side-item" :class="{ active: activeSection === 'data' }" @click="goData">
            数据管理
          </button>
          -->

          <button class="side-item" :class="{ active: activeSection === 'login' }" @click="goLogin">
            登录和注册
          </button>
        </aside>

        <!-- 右侧内容：登录与注册 -->
        <main class="settings-main">
          <div class="lr-grid">
            <!-- 左：登录/退出 + 注册 -->
            <div class="lr-left">
              <div class="lr-block">
                <div class="lr-title">登录与退出</div>

                <template v-if="!loggedIn">
                  <div class="lr-row">
                    <div class="lr-label">当前状态</div>
                    <div class="lr-user">未登录</div>
                  </div>

                  <div class="lr-row">
                    <div class="lr-label">未登录？</div>
                    <button class="lr-btn" type="button" @click="onGoLogin">
                      去登录 <span class="lr-arrow">↗</span>
                    </button>
                  </div>

                  <div class="lr-row">
                    <div class="lr-label">新用户</div>
                    <button class="lr-btn" type="button" @click="onGoRegister">
                      去注册 <span class="lr-arrow">↗</span>
                    </button>
                  </div>
                </template>

                <template v-else>
                  <div class="lr-row">
                    <div class="lr-label">当前账号</div>
                    <div class="lr-user">{{ currentUserText }}</div>
                  </div>

                  <div class="lr-row">
                    <div class="lr-label">已登录</div>
                    <button class="lr-btn" type="button" @click="onLogout">
                      退出登录 <span class="lr-arrow">↘</span>
                    </button>
                  </div>
                </template>
              </div>

              <div class="lr-block" v-if="!loggedIn">
                <div class="lr-title">注册账户</div>

                <div class="lr-row">
                  <div class="lr-label">首次使用</div>
                  <button class="lr-btn" type="button" @click="onGoRegister">
                    去注册 <span class="lr-arrow">↗</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 右：危险操作 -->
            <div class="lr-right">
              <div class="danger-card">
                <div class="danger-head">
                  <span class="danger-ico">⚠</span>
                  <span class="danger-text">危险操作</span>
                </div>

                <div class="danger-sec">
                  <div class="danger-title">停用账户</div>
                  <div class="danger-desc">
                    暂时停用您的账户，您的数据被保留但不再公开可见
                  </div>
                  <button class="danger-btn" type="button" @click="onDisableAccount">
                    ⏸ 停用账户
                  </button>
                </div>

                <div class="danger-divider"></div>

                <div class="danger-sec">
                  <div class="danger-title">注销账户</div>
                  <div class="danger-desc">
                    永久删除你的账户和数据，此操作不可撤销
                  </div>
                  <button class="danger-btn danger-btn--delete" type="button" @click="onDeleteAccount">
                    🗑 删除账户
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = computed(() => route.path)

/** 与前两页一致：仅本页解除 #app 的 max-width/padding */
const APP_CLASS = 'app-full-bleed'
const BODY_CLASS = 'profile-full-bleed'
function enableFullBleed() {
  document.getElementById('app')?.classList.add(APP_CLASS)
  document.body.classList.add(BODY_CLASS)
}
function disableFullBleed() {
  document.getElementById('app')?.classList.remove(APP_CLASS)
  document.body.classList.remove(BODY_CLASS)
}

function goHome() {
  router.push('/')
}

/** localStorage keys（与其他页共用） */
const LS_EMAIL_KEY = 'userEmail'
const LS_AVATAR_KEY = 'userAvatar'
const LS_USERS = 'auth_users'

/** ===== 用户库结构（与登录/注册一致，新增可选字段） ===== */
type LocalUser = {
  username: string
  email: string
  passwordHash: string
  createdAt: number
  deactivated?: boolean
  deactivatedAt?: number
}

function normalize(s: string) {
  return (s || '').trim().toLowerCase()
}

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

/** 头像 + 邮箱（头部显示用） */
const userEmail = ref('')
const avatarUrl = ref<string>('')

/** ✅ 登录态 */
type AuthUser = { username?: string; email?: string }
const loggedIn = ref(false)
const currentUser = ref<AuthUser | null>(null)

const currentUserText = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.email || currentUser.value.username || ''
})

function readLoginState() {
  const ok = localStorage.getItem('isLoggedIn') === '1' || !!localStorage.getItem('token')
  loggedIn.value = ok

  if (ok) {
    try {
      currentUser.value = JSON.parse(localStorage.getItem('auth_current_user') || 'null')
    } catch {
      currentUser.value = null
    }

    userEmail.value = localStorage.getItem(LS_EMAIL_KEY) || currentUser.value?.email || ''
    avatarUrl.value = localStorage.getItem(LS_AVATAR_KEY) || ''
  } else {
    currentUser.value = null
    userEmail.value = ''
    avatarUrl.value = ''
  }
}

/** ✅ 只在登录状态下允许写邮箱；否则不写 */
watch(userEmail, (val) => {
  if (!loggedIn.value) return
  const v = (val || '').trim()
  if (v) localStorage.setItem(LS_EMAIL_KEY, v)
  else localStorage.removeItem(LS_EMAIL_KEY)
})

const fileInputRef = ref<HTMLInputElement | null>(null)

/** ✅ 未登录时不允许上传头像 */
const onAvatarClick = () => {
  if (!loggedIn.value) {
    alert('请先登录后再上传头像')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  fileInputRef.value?.click()
}

const onFileChange = (e: Event) => {
  if (!loggedIn.value) return

  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件（png/jpg/webp 等）')
    input.value = ''
    return
  }

  const MAX_MB = 2
  if (file.size > MAX_MB * 1024 * 1024) {
    alert(`图片太大（> ${MAX_MB}MB），请换一张更小的头像`)
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    avatarUrl.value = result
    localStorage.setItem(LS_AVATAR_KEY, result)
    input.value = ''
    window.dispatchEvent(new Event('auth-changed')) // 让 NavBar 立刻更新头像
  }
  reader.onerror = () => {
    alert('读取图片失败，请重试')
    input.value = ''
  }
  reader.readAsDataURL(file)
}

/** 左侧菜单高亮：根据路由判断 */
type SectionKey = 'security' | 'privacy' | 'data' | 'login'
const activeSection = computed<SectionKey>(() => {
  if (route.path.startsWith('/profile/settings/privacy')) return 'privacy'
  if (route.path.startsWith('/profile/settings/security')) return 'security'
  // ✅ 数据管理：暂时隐藏后，这个高亮判断也注释掉（保留代码，便于恢复）
  // if (route.path.startsWith('/profile/settings/data')) return 'data'
  if (route.path.startsWith('/profile/settings/login')) return 'login'
  return 'login'
})

function goSecurity() {
  router.push('/profile/settings/security')
}
function goPrivacy() {
  router.push('/profile/settings/privacy')
}
function goData() {
  alert('该模块待完善')
}
function goLogin() {
  router.push('/profile/settings/login')
}

/** ✅ 跳转：带 redirect 回本页 */
function onGoLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
async function onGoRegister() {
  await router.push({ name: 'register', query: { redirect: route.fullPath } })
}

/** ✅ 统一：清空登录态 + 当前用户展示信息（不删 auth_users） */
function clearSessionAndProfile() {
  // 登录态
  localStorage.removeItem('token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('isLogin')
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('auth_current_user')

  // 当前用户展示信息
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userAvatar')
  localStorage.removeItem(LS_EMAIL_KEY)
  localStorage.removeItem(LS_AVATAR_KEY)

  readLoginState()
  window.dispatchEvent(new Event('auth-changed')) // 让 NavBar / 其它页面立刻刷新
}

/** ✅ 退出：回首页 */
function onLogout() {
  clearSessionAndProfile()
  alert('已退出登录')
  router.replace('/')
}

/** ✅ 停用账户：标记 deactivated=true，然后退出回首页 */
function onDisableAccount() {
  if (!loggedIn.value || !currentUser.value?.email) {
    alert('请先登录后再执行此操作')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  const ok = window.confirm('确定要【停用账户】吗？停用后可在登录时选择重新启用。')
  if (!ok) return

  const typed = window.prompt('请输入：DISABLE 以确认停用（区分大小写）')
  if (typed !== 'DISABLE') {
    alert('已取消：输入不正确')
    return
  }

  const users = readUsers()
  const emailKey = normalize(currentUser.value.email || '')
  const idx = users.findIndex(u => normalize(u.email) === emailKey)

  if (idx < 0) {
    alert('未找到该账户记录，无法停用')
    return
  }

  const target = users[idx]
  if (!target) {
    alert('未找到该账户记录，无法停用')
    return
  }

  target.deactivated = true
  target.deactivatedAt = Date.now()
  writeUsers(users)

  clearSessionAndProfile()
  alert('账户已停用（可在登录时重新启用）')
  router.replace('/')
}

/** ✅ 删除账户：从 auth_users 移除当前用户（不可撤销），然后退出回首页 */
function onDeleteAccount() {
  if (!loggedIn.value || !currentUser.value?.email) {
    alert('请先登录后再执行此操作')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  const ok = window.confirm('确定要【永久删除账户】吗？此操作不可撤销！')
  if (!ok) return

  const typed = window.prompt('请输入：DELETE 以确认删除（区分大小写）')
  if (typed !== 'DELETE') {
    alert('已取消：输入不正确')
    return
  }

  const users = readUsers()
  const emailKey = normalize(currentUser.value.email || '')
  const next = users.filter(u => normalize(u.email) !== emailKey)

  if (next.length === users.length) {
    alert('未找到该账户记录，无法删除')
    return
  }

  writeUsers(next)

  // 顺便删掉该邮箱验证码缓存（如果有）
  localStorage.removeItem(`auth_email_code:${emailKey}`)

  // 清空会话与个人信息
  clearSessionAndProfile()

  alert('账户已永久删除')
  router.replace('/')
}

/** ✅ 监听其它页面/标签页变更 localStorage，自动同步本页状态 */
function onStorageChange(e: StorageEvent) {
  if (!e.key) return
  const keys = ['token', 'isLoggedIn', 'auth_current_user', LS_EMAIL_KEY, LS_AVATAR_KEY, 'userAvatar', 'userEmail']
  if (keys.includes(e.key)) readLoginState()
}

function onAuthChanged() {
  readLoginState()
}

onMounted(() => {
  enableFullBleed()
  readLoginState()
  window.addEventListener('storage', onStorageChange)
  window.addEventListener('auth-changed', onAuthChanged)
})

onBeforeUnmount(() => {
  disableFullBleed()
  window.removeEventListener('storage', onStorageChange)
  window.removeEventListener('auth-changed', onAuthChanged)
})
</script>

<style scoped>
/* —— 你的 CSS 原样保留（我未改动结构，只在末尾补了少量状态样式） —— */
:global(#app.app-full-bleed) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
:global(body.profile-full-bleed) {
  margin: 0;
  overflow-x: hidden;
  background: #faf6f2;
}

.settings-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.settings-page {
  font-family: "微软雅黑", sans-serif;
  color: #3a2618;
  min-height: 100vh;
  background: radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.85), rgba(250,246,242,1) 55%);
}

/* 顶部（与前两页一致） */
.header {
  position: relative;
  height: 190px;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  background: url('/figures/bg-header.jpg') no-repeat center;
  background-size: cover;
  background-color: #f0e6d6;
  border-bottom: 1px solid rgba(224, 208, 184, 0.85);
  padding-top: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 18% 18%, rgba(255,255,255,0.55), rgba(255,255,255,0.18) 55%, rgba(0,0,0,0.08) 100%),
    linear-gradient(180deg, rgba(250,246,242,0.25) 0%, rgba(250,246,242,0.58) 55%, rgba(250,246,242,0.78) 100%);
}
.header h1 {
  position: absolute;
  top: 18px;
  left: 30px;
  font-size: 24px;
  letter-spacing: 1px;
  color: #3a2618;
  border-bottom: 3px solid rgba(194, 158, 109, 0.92);
  padding-bottom: 6px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.65);
}

/* 头像（与前两页一致） */
.avatar-area {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed rgba(194, 158, 109, 0.95);
  margin: 0 auto;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.10);
  position: relative;
  overflow: hidden;
}
.avatar.filled { border-style: solid; }
.avatar:hover {
  border-color: #8b4513;
  transform: scale(1.05);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-icon {
  width: 30px;
  height: 30px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c29e6d'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.9;
}
.avatar-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}
.avatar-mask span {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}
.avatar:hover .avatar-mask { opacity: 1; }
.avatar-text {
  color: #6d543a;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
}
.file-input { display: none; }

/* 邮箱输入（与前两页一致） */
.username-input {
  position: absolute;
  top: 22px;
  right: 30px;
  width: 230px;
  padding: 9px 12px;
  font-size: 14px;
  border: 1px solid rgba(224, 208, 184, 0.85);
  background-color: rgba(255, 255, 255, 0.72);
  border-radius: 10px;
  outline: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
}
.username-input:focus {
  border-color: rgba(194, 158, 109, 0.95);
  box-shadow: 0 0 0 3px rgba(194, 158, 109, 0.16), 0 8px 18px rgba(0,0,0,0.08);
}

/* 主菜单导航（与前两页一致） */
.nav {
  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  background: rgba(230, 200, 155, 0.92);
  padding: 10px 12px;
  margin-bottom: 22px;

  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(224, 208, 184, 0.9);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}
.nav-home {
  flex: 0 0 auto;
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  color: #5d4037;
  padding: 9px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}
.nav-home:hover {
  border-color: rgba(194, 158, 109, 0.95);
  background: rgba(255, 255, 255, 0.84);
  transform: translateY(-1px);
}
.nav-links {
  display: flex;
  flex: 1;
  min-width: 0;
}
.nav-item {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 850;
  color: #5d4037;
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border-bottom: 2px solid transparent;
  padding: 10px 6px;
}
.nav-item.active {
  color: #8b4513;
  font-weight: 900;
  border-bottom: 2px solid rgba(139, 69, 19, 0.9);
}
.nav-item:hover:not(.active) {
  color: #8b4513;
  transform: translateY(-1px);
}

/* 白底主体壳（与前两页一致） */
.page-shell {
  width: min(1680px, 96vw);
  margin: 0 auto 60px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.08);
  padding: 18px 18px 22px;
}
.settings-layout {
  display: flex;
  gap: 26px;
  align-items: stretch;
  padding: 10px 10px 18px;
}

/* 左侧菜单（与前两页一致） */
.settings-side {
  width: 230px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 10px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.06);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.side-item {
  width: 100%;
  border: 1px solid rgba(224, 208, 184, 0.85);
  background: rgba(248, 244, 240, 0.85);
  color: #3a2618;
  padding: 16px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 650;
  text-align: left;
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
}
.side-item:hover {
  transform: translateY(-1px);
  border-color: rgba(194, 158, 109, 0.9);
  background: rgba(240, 230, 214, 0.78);
}
.side-item.active {
  background: rgba(240, 205, 150, 0.50);
  border-color: rgba(194, 158, 109, 0.95);
  position: relative;
}
.side-item.active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 14px;
  bottom: 14px;
  width: 4px;
  border-radius: 4px;
  background: rgba(194, 158, 109, 0.95);
}

/* 右侧内容壳（与前两页一致） */
.settings-main {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 12px;
  box-shadow: 0 12px 26px rgba(0,0,0,0.06);
  padding: 28px 26px 26px;
}

/* ====== 登录与注册页：右侧内容（新增，不影响其他页）====== */
.lr-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 26px;
  align-items: start;
}

.lr-block {
  padding: 18px 8px 16px;
}

.lr-title {
  font-size: 18px;
  font-weight: 900;
  color: #3a2618;
  margin-bottom: 16px;
}

.lr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 0;
}

.lr-label {
  font-size: 15px;
  font-weight: 650;
  color: rgba(58, 38, 24, 0.9);
}

.lr-btn {
  border: none;
  cursor: pointer;
  padding: 12px 22px;
  border-radius: 10px;
  background: rgba(139, 69, 19, 0.88);
  color: #fff;
  font-size: 15px;
  font-weight: 850;
  box-shadow: 0 14px 22px rgba(139, 69, 19, 0.18);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.lr-btn:hover {
  background: rgba(109, 56, 17, 0.95);
  transform: translateY(-2px);
}
.lr-arrow {
  font-weight: 900;
  opacity: 0.95;
}

.danger-card {
  background: rgba(248, 244, 240, 0.85);
  border: 1px solid rgba(224, 208, 184, 0.85);
  border-radius: 14px;
  padding: 18px 18px 16px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.06);
}

.danger-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.danger-ico {
  font-size: 20px;
  line-height: 1;
}
.danger-text {
  font-size: 18px;
  font-weight: 900;
  color: rgba(195, 76, 56, 0.95);
}

.danger-sec {
  padding: 10px 6px 14px;
}

.danger-title {
  font-size: 16px;
  font-weight: 900;
  color: #3a2618;
  margin-bottom: 8px;
}

.danger-desc {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(0,0,0,0.55);
  margin-bottom: 12px;
}

.danger-divider {
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 6px 0 10px;
}

.danger-btn {
  width: 100%;
  border: none;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(195, 76, 56, 0.88);
  color: #fff;
  font-size: 15px;
  font-weight: 850;
  box-shadow: 0 14px 22px rgba(195, 76, 56, 0.14);
}
.danger-btn:hover {
  background: rgba(175, 62, 46, 0.95);
  transform: translateY(-2px);
}
.danger-btn--delete {
  background: rgba(195, 76, 56, 0.78);
}
.danger-btn--delete:hover {
  background: rgba(175, 62, 46, 0.90);
}

/* 响应式：与前两页风格一致 */
@media (max-width: 980px) {
  .settings-layout { flex-direction: column; }
  .settings-side { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .side-item { width: calc(50% - 8px); }

  .lr-grid {
    grid-template-columns: 1fr;
  }
}

/* ✅ 新增：账号文本显示更像“信息” */
.lr-user {
  font-size: 14px;
  font-weight: 850;
  color: rgba(58, 38, 24, 0.75);
}

/* ✅ 新增：未登录时头像区域禁用的视觉提示 */
.avatar.disabled {
  cursor: not-allowed;
  opacity: 0.85;
}
.avatar.disabled:hover {
  transform: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.10);
  border-color: rgba(194, 158, 109, 0.95);
}
.username-input:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
</style>
