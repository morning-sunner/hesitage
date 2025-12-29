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

        <router-link
          to="/profile/settings"
          class="nav-item"
          :class="{ active: activePath === '/profile/settings' }"
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
import SupportFeedbackSettingsContent from './settings/SupportFeedbackSettings.vue'
import LoginSettingsContent from './settings/LoginSettings.vue'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref((route.query.tab as string) || 'security')
const activePath = ref(route.path)
const fileInputRef = ref<HTMLInputElement>()
const userEmail = ref(localStorage.getItem('userEmail') || 'user@example.com')
const avatarUrl = ref(localStorage.getItem('avatarUrl') || '')

const settingsTabs = [
  { id: 'security', label: '账户与安全' },
  { id: 'privacy', label: '帮助与反馈' }, 
  { id: 'login', label: '登录管理' }
]


const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'security':
      return SecuritySettingsContent
    case 'privacy':
      return SupportFeedbackSettingsContent

    case 'login':
      return LoginSettingsContent
    default:
      return SecuritySettingsContent
  }
})

const goHome = () => router.push('/')
const goSettings = () => router.push('/profile/settings')

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

onMounted(() => {
  activePath.value = route.path
  enableFullBleed()
})

onBeforeUnmount(() => {
  disableFullBleed()
})

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
  width: 100%;
  font-family: "微软雅黑", sans-serif;
  color: #3a2618;
  min-height: 100vh;
  background: radial-gradient(ellipse at 20% 0%, rgba(255, 255, 255, 0.85), rgba(250, 246, 242, 1) 55%);
}

/* 头部区域：与资料页、收藏页完全一致 */
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

/* 头像：与收藏页一致 */
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

/* 邮箱输入：与收藏页一致 */
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

/* 导航 sticky：与收藏页、资料页统一 */
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

/* 页面主体 - 白底外壳 */
.page-shell {
  width: min(1680px, 96vw);
  margin: 0 auto 60px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.08);
  padding: 30px 24px 24px;
}

.settings-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 30px;
  width: 100%;
}

.settings-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(240, 230, 214, 0.95);
  padding: 20px 16px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.side-item {
  padding: 16px 20px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 10px;
  font-size: 15px;
  color: #5d4037;
  font-weight: 600;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}
.side-item:hover {
  background: linear-gradient(135deg, #f5e6d3 0%, #faf4ed 100%);
  color: #8b4513;
  transform: translateX(2px);
}
.side-item.active {
  background: linear-gradient(135deg, #c9916f 0%, #d4a574 100%);
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(201, 145, 111, 0.3);
}

.settings-main {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  padding: 30px;
  min-height: 500px;
}

:deep(.security-settings) {
  width: 100%;
  padding: 10px 6px;
}

:deep(.security-settings .form-row) {
  display: grid;
  grid-template-columns: 140px minmax(280px, 620px);
  column-gap: 22px;
  align-items: center;
  justify-content: center;
  padding: 18px 0;
}

:deep(.security-settings .form-label) {
  text-align: right;
  font-size: 15px;
  font-weight: 750;
  color: #3a2618;
}

:deep(.security-settings .input) {
  width: 100%;
  height: 44px;
  border-radius: 10px;
}

:deep(.security-settings .hint-row) {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* 保存按钮：对齐到输入列的右侧（更协调） */
:deep(.security-settings .actions) {
  display: grid;
  grid-template-columns: 140px minmax(280px, 620px);
  justify-content: center;
  padding-top: 22px;
}
:deep(.security-settings .save-btn) {
  justify-self: end;
}

@media (max-width: 720px) {
  .username-input { right: 16px; width: 200px; }
  .header h1 { left: 16px; }
}

@media (max-width: 480px) {
  .header { height: 210px; }
  .username-input { top: 150px; right: 20px; width: calc(100% - 40px); }

  .nav { gap: 8px; padding: 10px 10px; }
  .nav-home { padding: 8px 10px; font-size: 12px; }
  .nav-item { font-size: 12px; gap: 2px; padding: 10px 4px; }

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

  /* 小屏：表单改纵向 */
  :deep(.security-settings .form-row) {
    grid-template-columns: 1fr;
    row-gap: 10px;
    justify-content: stretch;
  }
  :deep(.security-settings .form-label) {
    text-align: left;
  }
  :deep(.security-settings .actions) {
    grid-template-columns: 1fr;
    justify-content: stretch;
  }
  :deep(.security-settings .save-btn) {
    justify-self: start;
  }
}
</style>
