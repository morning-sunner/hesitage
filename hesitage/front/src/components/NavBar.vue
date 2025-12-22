<template>
  <!-- 1. 创建一个真正的 Flexbox 父容器 -->
  <div class="navbar-container">
    <!-- 2. Logo 作为第一个子元素 -->
    <div class="navbar-logo">
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
      <el-sub-menu index="heritage">
        <template #title>非遗文化</template>
        <el-menu-item index="/heritage">文化展示</el-menu-item>
        <el-menu-item index="heritage-folk">民间文学</el-menu-item>
        <el-menu-item index="heritage-song">说唱艺曲</el-menu-item>
        <el-menu-item index="heritage-sports">体育游艺</el-menu-item>
        <el-menu-item index="heritage-craft">传统技艺</el-menu-item>
        <el-menu-item index="heritage-art">工艺美术</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/detail">匠人书影</el-menu-item>
      <el-menu-item index="community">互动社区</el-menu-item>
      <el-menu-item index="/chat">AI对话</el-menu-item>
    </el-menu>

    <!-- 4. 用户头像作为最后一个子元素 -->
    <div class="navbar-user">
      <img src="/figures/user-avatar.svg" alt="用户头像" class="user-avatar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeMenu = ref('/')

const handleSelect = (key: string) => {
  // 处理导航跳转
  if (key === '/' || key === '/chat' || key === '/heritage' || key === '/detail') {
    router.push(key)
    activeMenu.value = key
  } else {
    // 其他菜单项可以添加具体逻辑
    console.log('Selected:', key)
  }
}
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

/* 用户头像（右侧） */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex-shrink: 0;
  height: 80px;
  padding: 0;
}

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
}
</style>
