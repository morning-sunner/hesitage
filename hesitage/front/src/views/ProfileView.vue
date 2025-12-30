<template>
  <Teleport to="body">
    <div class="profile-overlay">
      <div class="profile-page">
        <!-- 顶部头部：与收藏页统一 -->
        <div class="header">
          <div class="header-inner">
            <h1>个人中心</h1>

            <!-- 头像上传 -->
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

            <!-- 右上角邮箱 -->
            <input v-model="userEmail" type="text" class="username-input" placeholder="xxxxx@xx.com" />
          </div>
        </div>

        <!-- 导航栏：统一样式 + 左侧返回首页 -->
        <div class="nav">
          <div class="nav-inner">
            <button class="nav-home" type="button" @click="goHome" aria-label="返回首页">← 首页</button>

            <div class="nav-links">
              <router-link to="/profile" class="nav-item" :class="{ active: activeTab === '/profile' }">
                📋 我的资料
              </router-link>

              <router-link to="/profile/edit" class="nav-item" :class="{ active: activeTab === '/profile/edit' }">
                ⭐ 我的收藏
              </router-link>

              <router-link to="/profile/settings" class="nav-item" :class="{ active: activeTab === '/profile/settings' }">
                ⚙️ 设置
              </router-link>
            </div>
          </div>
        </div>

        <!-- 白底主体外壳 -->
        <div class="page-shell">
          <div class="profile-container">
            <div class="profile-card">
              <div class="profile-group">
                <div class="profile-label">
                  <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                  用户名
                </div>
                <div class="profile-content">
                  <input v-model="username" type="text" class="profile-input" placeholder="请输入用户名" />
                </div>
              </div>

              <div class="profile-group">
                <div class="profile-label">
                  <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                    />
                  </svg>
                  性别
                </div>
                <div class="profile-content">
                  <select v-model="gender" class="profile-input">
                    <option value="">请选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="secret">保密</option>
                  </select>
                </div>
              </div>

              <div class="profile-group">
                <div class="profile-label">
                  <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                    />
                  </svg>
                  生日
                </div>
                <div class="profile-content">
                  <input v-model="birthday" type="date" class="profile-input" />
                </div>
              </div>

              <div class="profile-group">
                <div class="profile-label">
                  <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                    />
                  </svg>
                  邮箱
                </div>
                <div class="profile-content">
                  <input v-model="userEmail" type="email" class="profile-input" placeholder="请输入邮箱" />
                </div>
              </div>

              <div class="profile-group">
                <div class="profile-label">
                  <svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
                  </svg>
                  个人简介
                </div>
                <div class="profile-content">
                  <textarea
                    v-model="bio"
                    class="profile-textarea"
                    placeholder="请输入个人简介（最多200字）"
                    maxlength="200"
                  ></textarea>
                </div>
              </div>

              <div class="profile-actions">
                <button class="save-btn" @click="onSave">保存修改</button>
                <button class="cancel-btn" @click="onCancel">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = computed(() => route.path)

let prevBodyOverflow = ''

// 表单数据
const username = ref('')
const gender = ref('')
const birthday = ref('')
const bio = ref('')

// 邮箱 + 头像落地（与收藏页同 key）
const LS_EMAIL_KEY = 'userEmail'
const LS_AVATAR_KEY = 'userAvatar'

const userEmail = ref('')
const avatarUrl = ref<string>('')

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

watch(userEmail, (val) => localStorage.setItem(LS_EMAIL_KEY, (val || '').trim()))

onMounted(() => {
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  username.value = localStorage.getItem('userName') || ''
  userEmail.value = localStorage.getItem(LS_EMAIL_KEY) || ''
  avatarUrl.value = localStorage.getItem(LS_AVATAR_KEY) || ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = prevBodyOverflow || ''
})

function goHome() {
  router.push('/')
}

function onSave() {
  if (username.value.trim()) localStorage.setItem('userName', username.value.trim())
  localStorage.setItem(LS_EMAIL_KEY, (userEmail.value || '').trim())
  alert('资料保存成功！')
}

function onCancel() {
  if (!confirm('确定要取消修改吗？未保存的内容将丢失')) return
  username.value = localStorage.getItem('userName') || ''
  userEmail.value = localStorage.getItem(LS_EMAIL_KEY) || ''
  avatarUrl.value = localStorage.getItem(LS_AVATAR_KEY) || ''
  gender.value = ''
  birthday.value = ''
  bio.value = ''
}
</script>

<style scoped>
.profile-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;

  background: radial-gradient(ellipse at 20% 0%, rgba(255, 255, 255, 0.85), rgba(250, 246, 242, 1) 55%);
  scrollbar-gutter: stable both-edges;
  overscroll-behavior: contain;
  isolation: isolate;
}

.profile-page {
  --page-width: min(1680px, calc(100% - 48px));

  font-family: "微软雅黑", sans-serif;
  color: #3a2618;
  min-height: 100vh;
  background: radial-gradient(ellipse at 20% 0%, rgba(255, 255, 255, 0.85), rgba(250, 246, 242, 1) 55%);
}

.profile-page * {
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

/* 顶部：背景全宽 */
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
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 18% 18%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.18) 55%, rgba(0, 0, 0, 0.08) 100%),
    linear-gradient(180deg, rgba(250, 246, 242, 0.25) 0%, rgba(250, 246, 242, 0.58) 55%, rgba(250, 246, 242, 0.78) 100%);
}

/* header 内容居中容器 */
.header-inner {
  position: relative;
  height: 100%;
  width: var(--page-width);
  margin: 0 auto;
  padding-top: 20px;
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

/* 头像 */
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

/* 邮箱输入 */
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

/* 导航 sticky：背景全宽 */
.nav {
  width: 100%;
  background: rgba(230, 200, 155, 0.92);
  margin-bottom: 22px;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(224, 208, 184, 0.9);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  padding: 0;
}

/* nav 内容居中容器 */
.nav-inner {
  width: var(--page-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
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

/* 主体壳：居中 */
.page-shell {
  width: var(--page-width);
  margin: 0 auto 60px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(240, 230, 214, 0.95);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.08);
  padding: 20px 18px 24px;
  min-height: calc(100vh - 190px - 62px - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表单部分 */
.profile-container {
  width: min(960px, calc(100% - 36px));
  margin: 0 auto;
}
.profile-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.06);
  border: 1px solid rgba(240, 230, 214, 0.95);
}

.profile-group {
  margin-bottom: 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.profile-label {
  flex: 0 0 150px;
  font-weight: 600;
  color: #5d4037;
  padding-right: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}
.label-icon { width: 18px; height: 18px; fill: #c29e6d; }

.profile-content { flex: 1; min-width: 220px; }

.profile-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  border-radius: 10px;
  background-color: rgba(250, 246, 242, 0.95);
  font-size: 14px;
  color: #3a2618;
  outline: none;
}
.profile-input:focus {
  border-color: rgba(194, 158, 109, 0.95);
  box-shadow: 0 0 0 3px rgba(194,158,109,0.14);
  background-color: #fff;
}

.profile-textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px 15px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  border-radius: 10px;
  background-color: rgba(250, 246, 242, 0.95);
  font-size: 14px;
  color: #3a2618;
  resize: vertical;
  outline: none;
}
.profile-textarea:focus {
  border-color: rgba(194, 158, 109, 0.95);
  box-shadow: 0 0 0 3px rgba(194,158,109,0.14);
  background-color: #fff;
}

.profile-actions {
  text-align: center;
  margin-top: 34px;
}
.save-btn,
.cancel-btn {
  padding: 10px 35px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 650;
  border: 1px solid transparent;
}
.save-btn {
  background: #8b4513;
  color: #fff;
  box-shadow: 0 10px 18px rgba(139, 69, 19, 0.18);
  margin-right: 14px;
}
.save-btn:hover { background: #6d3811; transform: translateY(-2px); }

.cancel-btn {
  background: rgba(240, 230, 214, 0.88);
  color: #5d4037;
  border-color: rgba(224, 208, 184, 0.95);
}
.cancel-btn:hover { background: rgba(230, 200, 155, 0.92); transform: translateY(-2px); }

/* 响应式 */
@media (max-width: 720px) {
  .username-input { right: 16px; width: 200px; }
  .header h1 { left: 16px; }
}

@media (max-width: 480px) {
  .header { height: 210px; }
  .username-input { top: 150px; right: 20px; width: calc(100% - 40px); }

  .nav-inner { gap: 8px; padding: 10px 10px; }
  .nav-home { padding: 8px 10px; font-size: 12px; }
  .nav-item { font-size: 12px; gap: 2px; padding: 10px 4px; }

  .profile-group { flex-direction: column; align-items: flex-start; }
  .profile-label { margin-bottom: 10px; }
  .profile-card { padding: 20px; }
}
</style>
