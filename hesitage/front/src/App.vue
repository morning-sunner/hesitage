<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

body {
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  background: linear-gradient(135deg, #e8d5b7 0%, #d4c5a9 50%, #c8b596 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 1;
}

#app {
  position: relative;
  z-index: 2;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

/* 全局头部样式 */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: rgba(139, 90, 43, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  text-align: center;
  border: 3px solid #8b5a2b;
  line-height: 1.2;
  font-weight: bold;
}

.logo-text {
  font-size: 22px;
  color: #5a4a3a;
  font-weight: bold;
  letter-spacing: 2px;
}

nav {
  display: flex;
  gap: 40px;
}

nav a {
  color: #5a4a3a;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s;
  position: relative;
}

nav a:hover {
  color: #8b5a2b;
}

nav a.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #8b5a2b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5a4a3a;
  font-size: 14px;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #8b5a2b;
  border: 2px solid #fff;
}

/* 装饰元素 */
.decoration-circle {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 153, 143, 0.3), transparent);
  pointer-events: none;
}

.decoration-flower {
  position: fixed;
  font-size: 60px;
  opacity: 0.3;
  z-index: 2;
  animation: float 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* 省份选择按钮 */
.region-tabs,
.province-tabs {
  display: flex;
  gap: 20px;
  margin: 30px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.region-tab,
.province-tab {
  padding: 12px 50px;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid transparent;
  border-radius: 25px;
  font-size: 18px;
  color: #5a4a3a;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.region-tab:hover,
.province-tab:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.region-tab.active,
.province-tab.active {
  background: rgba(212, 153, 143, 0.6);
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-color: #8b5a2b;
}

/* 返回顶部按钮 */
.scroll-down-btn,
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8b5a2b, #a67c52);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(139, 90, 43, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.scroll-down-btn:hover,
.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(139, 90, 43, 0.5);
  background: linear-gradient(135deg, #6d4521, #8b5a2b);
}

.arrow-icon,
.arrow-up {
  font-size: 28px;
  color: #fff;
}

.arrow-icon {
  animation: bounce 2s infinite;
}

.arrow-up {
  animation: bounceUp 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes bounceUp {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(10px);
  }
  60% {
    transform: translateY(5px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  nav {
    gap: 25px;
    flex-wrap: wrap;
    justify-content: center;
  }

  nav a {
    font-size: 14px;
  }

  .region-tabs,
  .province-tabs {
    flex-wrap: wrap;
    gap: 10px;
  }

  .region-tab,
  .province-tab {
    padding: 10px 30px;
    font-size: 16px;
  }

  .user-info {
    font-size: 12px;
  }

  .scroll-down-btn,
  .back-to-top {
    width: 50px;
    height: 50px;
    bottom: 20px;
    right: 20px;
  }
}
</style>
