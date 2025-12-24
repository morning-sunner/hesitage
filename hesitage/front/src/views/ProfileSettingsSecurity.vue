<template>
  <div class="settings-page">
    <!-- 顶部头部（与收藏页一致） -->
    <div class="header">
      <h1>个人中心</h1>

      <div class="avatar-area">
        <div class="avatar" @click="onAvatarClick" title="点击上传头像" :class="{ filled: !!avatarUrl }">
          <img v-if="avatarUrl" :src="avatarUrl" alt="用户头像" class="avatar-img" />
          <div v-else class="avatar-icon"></div>

          <div class="avatar-mask">
            <span>{{ avatarUrl ? '更换头像' : '上传头像' }}</span>
          </div>
        </div>

        <div class="avatar-text">{{ avatarUrl ? '点击更换头像' : '添加头像' }}</div>
        <input ref="fileInputRef" class="file-input" type="file" accept="image/*" @change="onFileChange" />
      </div>

      <input v-model="userEmail" type="text" class="username-input" placeholder="xxxxx@xx.com" />
    </div>

    <!-- 主菜单导航（与收藏页一致结构；字体已统一调大加粗） -->
    <div class="nav">
      <button class="nav-home" type="button" @click="goHome" aria-label="返回首页">← 首页</button>

      <div class="nav-links">
        <router-link to="/profile" class="nav-item" :class="{ active: activePath === '/profile' }">
          📋 我的资料
        </router-link>

        <router-link to="/profile/edit" class="nav-item" :class="{ active: activePath === '/profile/edit' }">
          ⭐ 我的收藏
        </router-link>

        <!-- ✅ 子路由也能高亮“设置” -->
        <router-link to="/profile/settings/security" class="nav-item" :class="{ active: isSettingsTab }">
          ⚙️ 设置
        </router-link>
      </div>
    </div>

    <!-- 主体 -->
    <div class="page-shell">
      <div class="settings-layout">
        <!-- 左侧菜单（样式不动，用路由切换） -->
        <aside class="settings-side">
          <button class="side-item" :class="{ active: activeSection === 'security' }" @click="goSecurity">
            账户与安全
          </button>

          <button class="side-item" :class="{ active: activeSection === 'privacy' }" @click="goPrivacy">
            隐私设置
          </button>

          <button class="side-item" :class="{ active: activeSection === 'data' }" @click="goData">
            数据管理
            </button>

          <button class="side-item" :class="{ active: activeSection === 'login' }" @click="goLogin">
            登录和注册
          </button>

        </aside>

        <!-- 右侧内容：账户与安全 -->
        <main class="settings-main">
          <div class="form-row top-row">
            <div class="form-label">用户名</div>
            <div class="form-ctrl">
              <!-- ✅ 禁止修改用户名：只读展示（从 localStorage 读取 userName） -->
              <input v-model="username" class="input input-readonly" type="text" readonly aria-readonly="true" />
            </div>
          </div>

          <div class="divider"></div>

          <div class="section-title">
            <span class="key-icon" aria-hidden="true"></span>
            <span>修改密码</span>
          </div>

          <div class="form-row">
            <div class="form-label">当前密码</div>
            <div class="form-ctrl">
              <input v-model="currentPwd" class="input" type="password" placeholder="" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">新密码</div>
            <div class="form-ctrl hint-row">
              <input v-model="newPwd" class="input" type="password" placeholder="" />
              <div class="hint">至少8位，包括字母和数字</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">确认新密码</div>
            <div class="form-ctrl">
              <input v-model="confirmPwd" class="input" type="password" placeholder="" />
            </div>
          </div>

          <div class="actions">
            <button class="save-btn" type="button" @click="onSaveSecurity">
              <span class="save-ico" aria-hidden="true"></span>
              保存更改
            </button>
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

const activePath = computed(() => route.path)
const isSettingsTab = computed(() => activePath.value.startsWith('/profile/settings'))

/** ✅ 与收藏页一致：仅本页解除 #app 的 max-width/padding */
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


/** ====== localStorage keys（与其他页共用）====== */
const LS_EMAIL_KEY = 'userEmail'
const LS_AVATAR_KEY = 'userAvatar'
const LS_NAME_KEY = 'userName'

/** ====== 头像 + 邮箱 ====== */
const userEmail = ref('')
const avatarUrl = ref<string>('')

watch(userEmail, (val) => localStorage.setItem(LS_EMAIL_KEY, (val || '').trim()))

const fileInputRef = ref<HTMLInputElement | null>(null)
const onAvatarClick = () => fileInputRef.value?.click()

const onFileChange = (e: Event) => {
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
  }
  reader.onerror = () => {
    alert('读取图片失败，请重试')
    input.value = ''
  }
  reader.readAsDataURL(file)
}

/** ====== 左侧菜单：用路由控制高亮 ====== */
type SectionKey = 'security' | 'privacy' | 'data' | 'login'
const activeSection = computed<SectionKey>(() => {
  const p = activePath.value
  if (p.startsWith('/profile/settings/security')) return 'security'
  if (p.startsWith('/profile/settings/privacy')) return 'privacy'
  if (p.startsWith('/profile/settings/data')) return 'data'
  if (p.startsWith('/profile/settings/login')) return 'login'
  // 默认值：安全页写 'security'，隐私页写 'privacy'
  return 'security'
})


function goSecurity() {
  router.push('/profile/settings/security')
}
function goPrivacy() {
  router.push('/profile/settings/privacy')
}
function goData() {
  alert('该模块待完善')
  // 以后做了 data 页面就改成：
  // router.push('/profile/settings/data')
}

function goLogin() {
  router.push('/profile/settings/login')
}


/** ====== 账户与安全 ====== */
const username = ref('') // 只读展示
const currentPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')

function onSaveSecurity() {
  const hasPwdChange = !!(currentPwd.value || newPwd.value || confirmPwd.value)
  if (!hasPwdChange) {
    alert('未填写密码修改内容')
    return
  }

  if (!currentPwd.value) {
    alert('请输入当前密码')
    return
  }
  if (!newPwd.value) {
    alert('请输入新密码')
    return
  }
  const okLen = newPwd.value.length >= 8
  const okMix = /[A-Za-z]/.test(newPwd.value) && /\d/.test(newPwd.value)
  if (!okLen || !okMix) {
    alert('新密码至少8位，且需包含字母和数字')
    return
  }
  if (newPwd.value !== confirmPwd.value) {
    alert('两次输入的新密码不一致')
    return
  }

  alert('密码修改已保存（前端演示）')
  currentPwd.value = ''
  newPwd.value = ''
  confirmPwd.value = ''
}

onMounted(() => {
  enableFullBleed()
  userEmail.value = localStorage.getItem(LS_EMAIL_KEY) || ''
  avatarUrl.value = localStorage.getItem(LS_AVATAR_KEY) || ''
  username.value = localStorage.getItem(LS_NAME_KEY) || ''
})

onBeforeUnmount(() => {
  disableFullBleed()
})
</script>

<style scoped>
/* ✅ 与收藏页一致：解除 #app 全局 max-width/padding（关键） */
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

/* 顶部（与收藏页一致） */
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

/* 头像（与收藏页一致） */
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

/* 邮箱输入（与收藏页一致） */
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

/* 主菜单导航（字体统一更大更粗） */
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

/* ✅ 你要的：主菜单更大、更粗（且三页统一） */
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

/* 白底主体壳 */
.page-shell {
  width: min(1680px, 96vw);
  margin: 0 auto 60px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.08);
  padding: 18px 18px 22px;
}

/* 布局 */
.settings-layout {
  display: flex;
  gap: 26px;
  align-items: stretch;
  padding: 10px 10px 18px;
}

/* 左侧菜单（不改样式，只保证比主菜单小一点） */
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

/* 右侧内容 */
.settings-main {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 12px;
  box-shadow: 0 12px 26px rgba(0,0,0,0.06);
  padding: 28px 26px 26px;
}

/* 表单行（标题比主菜单更小更细） */
.form-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 0;
}
.top-row { padding-top: 6px; }
.form-label {
  width: 140px;
  font-size: 15px;
  font-weight: 650;
  color: #3a2618;
  text-align: right;
  padding-right: 10px;
}
.form-ctrl {
  flex: 1;
  min-width: 260px;
}
.input {
  width: min(520px, 100%);
  height: 42px;
  padding: 10px 14px;
  border: 1px solid rgba(120, 120, 120, 0.45);
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  background: #fff;
}
.input:focus {
  border-color: rgba(139, 69, 19, 0.85);
  box-shadow: 0 0 0 3px rgba(194, 158, 109, 0.18);
}
.input-readonly {
  background: rgba(250, 246, 242, 0.9);
  border-color: rgba(224, 208, 184, 0.85);
  color: rgba(58, 38, 24, 0.78);
  cursor: not-allowed;
}
.input-readonly:focus {
  box-shadow: none;
  border-color: rgba(224, 208, 184, 0.85);
}

/* 分割线 */
.divider {
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 10px 0 18px;
}

/* 小标题（比主菜单小，且与隐私模块统一） */
.section-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 750;
  color: rgba(139, 69, 19, 0.95);
  margin: 0 0 8px 0;
}
.key-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b4513'%3E%3Cpath d='M7.5 14a4.5 4.5 0 1 1 3.88-2.2l7.12 0v2h-2v2h-2v2h-3.2l-.7 1.1A4.49 4.49 0 0 1 7.5 14Zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'/%3E%3C/svg%3E");
}

/* 新密码提示 */
.hint-row {
  display: flex;
  align-items: center;
  gap: 18px;
}
.hint {
  color: rgba(0,0,0,0.55);
  font-size: 13px;
  white-space: nowrap;
}

/* 隐私设置三栏 */
.privacy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  min-height: 320px;
}
.privacy-col {
  padding: 8px 26px 18px;
}
.privacy-col.split {
  border-left: 1px solid rgba(0,0,0,0.10);
}
.privacy-title {
  text-align: center;
  font-size: 15px;
  font-weight: 750;
  color: #3a2618;
  margin: 8px 0 22px;
}
.radio-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  user-select: none;
}
.radio {
  width: 15px;
  height: 15px;
  accent-color: rgba(139, 69, 19, 0.88);
}
.radio[disabled] {
  opacity: 0.55;
  cursor: not-allowed;
}
.radio-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(58, 38, 24, 0.90);
}
.privacy-desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(0,0,0,0.55);
  text-align: center;
  padding: 0 10px;
}
.privacy-tip {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(139, 69, 19, 0.75);
  text-align: center;
}

/* 按钮区 */
.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 22px;
}
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  padding: 12px 26px;
  border-radius: 10px;
  background: rgba(139, 69, 19, 0.88);
  color: #fff;
  font-size: 15px;
  font-weight: 850;
  box-shadow: 0 14px 22px rgba(139, 69, 19, 0.18);
}
.save-btn:hover {
  background: rgba(109, 56, 17, 0.95);
  transform: translateY(-2px);
}
.save-ico {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4Zm0 2.5L19.5 8H17V5.5ZM7 5h8v4H7V5Zm12 14H5V5h.5v6H17V5.5h.5V19Z'/%3E%3C/svg%3E");
}

/* 占位 */
.placeholder { padding: 18px 8px; }
.placeholder-title {
  font-size: 18px;
  font-weight: 900;
  color: #8b4513;
  margin-bottom: 10px;
}
.placeholder-desc {
  font-size: 14px;
  color: rgba(0,0,0,0.55);
  line-height: 1.7;
}

/* 响应式 */
@media (max-width: 980px) {
  .settings-layout { flex-direction: column; }
  .settings-side { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .side-item { width: calc(50% - 8px); }
  .privacy-grid { grid-template-columns: 1fr; }
  .privacy-col.split { border-left: none; border-top: 1px solid rgba(0,0,0,0.10); }
}

@media (max-width: 480px) {
  .header { height: 210px; }
  .username-input { top: 150px; right: 20px; width: calc(100% - 40px); }

  .nav { gap: 8px; padding: 10px 10px; }
  .nav-home { padding: 8px 10px; font-size: 12px; }
  .nav-item { font-size: 13px; gap: 2px; padding: 10px 4px; } /* 手机端也稍大一点 */

  .form-row { flex-direction: column; align-items: flex-start; }
  .form-label { width: auto; text-align: left; padding-right: 0; }
  .hint-row { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
