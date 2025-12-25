<template>
  <!-- 1. 创建一个真正的 Flexbox 父容器 -->
  <div class="navbar-container">
    <!-- 2. Logo 作为第一个子元素 -->
    <div class="navbar-logo" @click="goHome">
      <div class="logo-circle">
        <span class="logo-text">长三角<br>非遗</span>
      </div>
      <span class="platform-name">长三角非遗平台</span>
    </div>

    <!-- 3. el-menu 作为中间的子元素，它会自动伸缩 -->
    <el-menu
      :default-active="activeMenu"
      mode="horizontal"
      class="navbar-menu"
      @select="handleSelect"
    >
    <el-menu-item index="/">首页</el-menu-item>
    <!-- 删除了非遗文化下拉菜单，保留文化展示点击 -->
    <el-menu-item index="/heritage">文化展示</el-menu-item>
    <el-menu-item index="/detail">匠人书影</el-menu-item>
    <el-menu-item index="community">互动社区</el-menu-item>
    <el-menu-item index="/chat">AI对话</el-menu-item>
    <el-menu-item index="/profile">个人中心</el-menu-item>
  </el-menu>

    <!-- ✅ 4. 右侧用户区：加入真实登录态显示（不动其它部分） -->
    <div class="navbar-user">
      <!-- 头像：仍保留原来的视觉，但根据登录态显示不同 -->
      <div class="navbar-user-main" @click="onUserClick" :title="loggedIn ? '进入个人中心' : '请先登录'">
        <img
          :src="avatarToShow"
          alt="用户头像"
          class="user-avatar"
        />

        <!-- 已登录：显示账号；未登录：显示“未登录” -->
        <span class="user-text">
          {{ loggedIn ? (currentUserText || '已登录') : '未登录' }}
        </span>
      </div>

      <!-- 未登录：登录/注册 -->
      <template v-if="!loggedIn">
        <button class="user-action" type="button" @click="goLogin">登录</button>
        <button class="user-action user-action--ghost" type="button" @click="goRegister">注册</button>
      </template>

      <!-- 已登录：退出 -->
      <template v-else>
        <button class="user-action user-action--logout" type="button" @click="logout">退出</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('/')

/** ✅ 登录态 */
const loggedIn = ref(false)
const avatarUrl = ref('')
const currentUserText = ref('')

const DEFAULT_AVATAR = '/figures/user-avatar.svg'

const avatarToShow = computed(() => {
  return loggedIn.value && avatarUrl.value ? avatarUrl.value : DEFAULT_AVATAR
})

function syncAuth() {
  const ok = localStorage.getItem('isLoggedIn') === '1' || !!localStorage.getItem('token')
  loggedIn.value = ok

  if (ok) {
    avatarUrl.value = localStorage.getItem('userAvatar') || ''
    try {
      const u = JSON.parse(localStorage.getItem('auth_current_user') || 'null') as any
      currentUserText.value = (u?.email || u?.username || localStorage.getItem('userEmail') || '').trim()
    } catch {
      currentUserText.value = (localStorage.getItem('userEmail') || '').trim()
    }
  } else {
    avatarUrl.value = ''
    currentUserText.value = ''
  }
}

const handleSelect = (key: string) => {
  // 处理导航跳转
  if (key === '/' || key === '/chat' || key === '/heritage' || key === '/detail' || key === '/profile') {
    router.push(key)
    activeMenu.value = key
  } else {
    // 其他菜单项可以添加具体逻辑
    console.log('Selected:', key)
  }
}

function goHome() {
  router.push('/')
  activeMenu.value = '/'
}

function onUserClick() {
  if (loggedIn.value) {
    router.push('/profile')
    activeMenu.value = '/profile'
  } else {
    // 未登录：点头像去登录，带 redirect 回来
    goLogin()
  }
}

function goLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
function goRegister() {
  router.push({ name: 'register', query: { redirect: route.fullPath } })
}

function logout() {
  // ✅ 清空登录态
  localStorage.removeItem('token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('isLogin')
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('auth_current_user')

  // ✅ 清空当前用户展示信息（不删除用户库 auth_users）
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userAvatar')

  syncAuth()
  window.dispatchEvent(new Event('auth-changed')) // 通知其它组件同步

  // ✅ 退出后回主页（你要的）
  router.replace('/')
  activeMenu.value = '/'
}

/** ✅ 同页登录/退出也能即时刷新 */
function onAuthChanged() {
  syncAuth()
}

/** ✅ 跨标签页同步（可选，但很稳） */
function onStorageChange(e: StorageEvent) {
  if (!e.key) return
  const keys = ['token', 'isLoggedIn', 'auth_current_user', 'userAvatar', 'userEmail']
  if (keys.includes(e.key)) syncAuth()
}

onMounted(() => {
  syncAuth()
  window.addEventListener('auth-changed', onAuthChanged)
  window.addEventListener('storage', onStorageChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', onAuthChanged)
  window.removeEventListener('storage', onStorageChange)
})
</script>

<style scoped>
/* 这是新的父容器，负责整体布局 */
.navbar-container {
  display: flex;
  align-items: center; /* 垂直居中 */
  height: 80px;
  padding: 0 40px;
  background: linear-gradient(90deg, rgba(200, 180, 150, 0.95) 0%, rgba(212, 197, 169, 0.95) 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  border: none !important;
  gap: 0;
}

/* Logo 部分 */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 20px;
  cursor: pointer;
}

.logo-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c8b596 0%, #d4c5a9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.logo-text {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  line-height: 1.2;
}

.platform-name {
  font-size: 18px;
  font-weight: 600;
  color: #4a3f35;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

/* 让 el-menu 占据所有剩余空间 */
:deep(.navbar-menu) {
  flex-grow: 1; /* 这是关键！让菜单区域自动伸展 */
  justify-content: center; /* 让菜单项在可用空间内居中 */
  border: none !important;
  background-color: transparent !important;
  height: 80px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center;
}

/* 菜单项样式 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 80px !important;
  line-height: 80px !important;
  padding: 0 16px !important;
  margin: 0 4px !important;
  color: #5a4f45 !important;
  font-weight: 500;
  border: none !important;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  background-color: transparent !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(0, 0, 0, 0.05) !important;
  color: #3d3328 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: transparent !important;
  color: #3d3328 !important;
  border-bottom: 3px solid #d4a574 !important;
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  background-color: transparent !important;
  color: #3d3328 !important;
}

/* 下拉菜单样式 */
:deep(.el-menu--popup) {
  background-color: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 8px;
  padding: 8px 0 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

:deep(.el-menu--popup .el-menu-item) {
  padding: 0 20px !important;
  height: 40px !important;
  line-height: 40px !important;
  color: #5a4f45 !important;
  font-size: 14px;
  border: none !important;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background-color: rgba(212, 165, 116, 0.1) !important;
  color: #3d3328 !important;
}

:deep(.el-menu--popup .el-menu-item.is-active) {
  background-color: rgba(212, 165, 116, 0.15) !important;
  color: #3d3328 !important;
}

/* ✅ 用户区（右侧）—— 原有基础上“加”样式，不破坏原布局 */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: default;
  flex-shrink: 0;
  height: 80px;
  padding: 0;
}

/* 点击头像+文字这一块 */
.navbar-user-main {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  height: 80px;
  padding: 0;
}

/* 原头像样式保留 */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  object-fit: cover;
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

/* 新增：右侧账号文字 */
.user-text {
  font-size: 13px;
  font-weight: 700;
  color: #4a3f35;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 新增：登录/注册/退出按钮 */
.user-action {
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.45);
  color: #4a3f35;
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.user-action:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.6);
}

.user-action--ghost {
  background: transparent;
}

.user-action--logout {
  background: rgba(195, 76, 56, 0.16);
  border-color: rgba(195, 76, 56, 0.32);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0 30px;
    height: 70px;
  }

  .navbar-logo {
    height: 70px;
    margin-right: 15px;
  }

  .logo-circle {
    width: 45px;
    height: 45px;
  }

  .platform-name {
    font-size: 16px;
  }

  :deep(.navbar-menu) {
    height: 70px !important;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 70px !important;
    line-height: 70px !important;
    padding: 0 12px !important;
    font-size: 14px;
  }

  .navbar-user { height: 70px; }
  .navbar-user-main { height: 70px; }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 20px;
    height: 60px;
  }

  .navbar-logo {
    height: 60px;
    margin-right: 10px;
  }

  .logo-circle {
    width: 40px;
    height: 40px;
  }

  .platform-name {
    font-size: 14px;
  }

  :deep(.navbar-menu) {
    height: 60px !important;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 60px !important;
    line-height: 60px !important;
    padding: 0 8px !important;
    font-size: 12px;
  }

  .user-avatar {
    width: 35px;
    height: 35px;
  }

  .navbar-user { height: 60px; }
  .navbar-user-main { height: 60px; }

  .user-text { max-width: 90px; }
}
</style>
