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

    <!-- 主菜单导航 -->
    <div class="nav">
      <button class="nav-home" type="button" @click="goHome" aria-label="返回首页">← 首页</button>

      <div class="nav-links">
        <router-link to="/profile" class="nav-item" :class="{ active: activePath === '/profile' }">
          📋 我的资料
        </router-link>

        <router-link to="/profile/edit" class="nav-item" :class="{ active: activePath === '/profile/edit' }">
          ⭐ 我的收藏
        </router-link>

        <button class="nav-item" :class="{ active: activePath === '/profile/settings' }" @click="goSettings">
          ⚙️ 设置
        </button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="page-shell">
      <div class="settings-layout">
        <!-- 左侧菜单（样式不动，用 activeTab 切换） -->
        <aside class="settings-side">
          <button
            v-for="tab in settingsTabs"
            :key="tab.id"
            class="side-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </aside>

        <!-- 右侧内容区 -->
        <main class="settings-main">
          <keep-alive>
            <component :is="currentTabComponent" />
          </keep-alive>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SecuritySettingsContent from './settings/SecuritySettings.vue'
import PrivacySettingsContent from './settings/PrivacySettings.vue'
import LoginSettingsContent from './settings/LoginSettings.vue'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const route = useRoute()

// 状态管理
const activeTab = ref((route.query.tab as string) || 'security')
const activePath = ref(route.path)
const fileInputRef = ref<HTMLInputElement>()
const userEmail = ref(localStorage.getItem('userEmail') || 'user@example.com')
const avatarUrl = ref(localStorage.getItem('avatarUrl') || '')

// 设置 Tab 列表
const settingsTabs = [
  { id: 'security', label: '账户与安全' },
  { id: 'privacy', label: '隐私设置' },
  { id: 'login', label: '登录管理' }
]

// 计算属性：当前 Tab 的组件
const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'security':
      return SecuritySettingsContent
    case 'privacy':
      return PrivacySettingsContent
    case 'login':
      return LoginSettingsContent
    default:
      return SecuritySettingsContent
  }
})

// 导航方法
const goHome = () => router.push('/')
const goSettings = () => router.push('/profile/settings')

// 头像上传处理
const onAvatarClick = () => {
  fileInputRef.value?.click()
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      avatarUrl.value = url
      localStorage.setItem('avatarUrl', url)
    }
    reader.readAsDataURL(file)
  }
}

// 初始化
onMounted(() => {
  activePath.value = route.path
  enableFullBleed()
})

onBeforeUnmount(() => {
  disableFullBleed()
})

/** 启用/禁用全屏模式 */
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
  background: radial-gradient(ellipse at 20% 0%, rgba(255, 255, 255, 0.85), rgba(250, 246, 242, 1) 55%);
}

/* 头部区域 */
.header {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px 40px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  min-width: 200px;
}

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #ddd;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  background: #f9f9f9;
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: #1890ff;
}

.avatar.filled {
  background: #e6f7ff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  width: 50px;
  height: 50px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>') center/contain no-repeat;
  color: #999;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.avatar:hover .avatar-mask {
  opacity: 1;
}

.avatar-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.file-input {
  display: none;
}

.username-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  max-width: 300px;
}

.username-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 导航栏 */
.nav {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 15px 40px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.nav-home {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-home:hover {
  background: #e0e0e0;
  transform: translateX(-2px);
}

.nav-links {
  display: flex;
  gap: 20px;
  flex: 1;
}

.nav-item {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  position: relative;
  transition: color 0.3s ease;
  text-decoration: none;
}

.nav-item:hover {
  color: #1890ff;
}

.nav-item.active {
  color: #1890ff;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  right: 0;
  height: 3px;
  background: #1890ff;
}

/* 页面主体 */
.page-shell {
  flex: 1;
  padding: 20px 40px;
}

.settings-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
  max-width: 1200px;
}

.settings-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.side-item {
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.side-item:hover {
  background: #f5f5f5;
  color: #333;
}

.side-item.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
  border-left: 3px solid #1890ff;
  padding-left: 13px;
}

.settings-main {
  background: white;
  border-radius: 8px;
  padding: 30px;
  min-height: 500px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header {
    flex-wrap: wrap;
    gap: 20px;
  }

  .settings-layout {
    grid-template-columns: 150px 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 15px 20px;
  }

  .header h1 {
    font-size: 20px;
    min-width: auto;
  }

  .nav {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
    align-items: flex-start;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
  }

  .page-shell {
    padding: 15px 20px;
  }

  .settings-layout {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .settings-side {
    flex-direction: row;
    position: static;
    gap: 8px;
    overflow-x: auto;
  }

  .side-item {
    white-space: nowrap;
    flex: 1;
    min-width: 80px;
  }

  .settings-main {
    padding: 20px;
    min-height: auto;
  }
}
</style>
