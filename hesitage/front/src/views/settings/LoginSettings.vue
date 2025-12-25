<!-- 从 ProfileSettingsLogin.vue 提取的内容组件 -->
<template>
  <div class="login-settings">
    <div class="section-title">
      <span class="lock-icon"></span>
      <span>登录历史</span>
    </div>

    <div class="login-devices">
      <div v-for="(device, index) in loginDevices" :key="index" class="device-card">
        <div class="device-header">
          <div class="device-info">
            <span class="device-type">{{ device.type }}</span>
            <span class="device-location">{{ device.location }}</span>
          </div>
          <span class="device-time">{{ device.lastLogin }}</span>
        </div>
        <div class="device-detail">
          <span>IP: {{ device.ip }}</span>
          <span>{{ device.status }}</span>
        </div>
        <button v-if="device.isCurrent" class="device-badge">当前设备</button>
        <button v-else class="device-action" @click="onLogoutDevice(index)">登出此设备</button>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-title">
      <span class="shield-icon"></span>
      <span>登录安全</span>
    </div>

    <div class="security-options">
      <div class="security-item">
        <div class="security-label">双因素认证</div>
        <div class="security-ctrl">
          <input type="checkbox" v-model="settings.twoFactorEnabled" class="checkbox" />
          <span>{{ settings.twoFactorEnabled ? '已启用' : '未启用' }}</span>
        </div>
      </div>

      <div class="security-item">
        <div class="security-label">登录通知</div>
        <div class="security-ctrl">
          <input type="checkbox" v-model="settings.loginNotification" class="checkbox" />
          <span>{{ settings.loginNotification ? '已启用' : '未启用' }}</span>
        </div>
      </div>

      <div class="security-item">
        <div class="security-label">异地登录提示</div>
        <div class="security-ctrl">
          <input type="checkbox" v-model="settings.unusualLoginAlert" class="checkbox" />
          <span>{{ settings.unusualLoginAlert ? '已启用' : '未启用' }}</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-title">
      <span class="logout-icon"></span>
      <span>登出</span>
    </div>

    <div class="logout-section">
      <p class="logout-desc">退出当前账户</p>
      <button class="logout-btn" @click="onLogoutAll">登出所有设备</button>
    </div>

    <div class="actions">
      <button class="save-btn" type="button" @click="onSaveLogin">
        <span class="save-ico" aria-hidden="true"></span>
        保存更改
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loginDevices = ref([
  {
    type: 'Windows 11 - Chrome',
    location: '中国 浙江省',
    ip: '192.168.1.100',
    lastLogin: '现在登录中',
    status: '活跃',
    isCurrent: true,
  },
  {
    type: 'iPhone 14 Pro - Safari',
    location: '中国 浙江省',
    ip: '192.168.1.101',
    lastLogin: '3 天前',
    status: '离线',
    isCurrent: false,
  },
  {
    type: 'iPad Air - Safari',
    location: '中国 北京市',
    ip: '10.0.0.50',
    lastLogin: '1 周前',
    status: '离线',
    isCurrent: false,
  },
])

const settings = ref({
  twoFactorEnabled: localStorage.getItem('twoFactorEnabled') === 'true',
  loginNotification: localStorage.getItem('loginNotification') !== 'false',
  unusualLoginAlert: localStorage.getItem('unusualLoginAlert') !== 'false',
})

function onLogoutDevice(index: number) {
  if (confirm('确认要在此设备登出吗？')) {
    loginDevices.value.splice(index, 1)
    alert('已在该设备登出')
  }
}

function onLogoutAll() {
  if (confirm('确认要登出所有设备吗？')) {
    alert('已登出所有设备，请重新登录')
    // 实际应用中这里会重定向到登录页
  }
}

function onSaveLogin() {
  localStorage.setItem('twoFactorEnabled', String(settings.value.twoFactorEnabled))
  localStorage.setItem('loginNotification', String(settings.value.loginNotification))
  localStorage.setItem('unusualLoginAlert', String(settings.value.unusualLoginAlert))
  alert('登录安全设置已保存')
}
</script>

<style scoped>
.section-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 750;
  color: rgba(139, 69, 19, 0.95);
  margin: 20px 0 16px 0;
}

.lock-icon,
.shield-icon,
.logout-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
}

.lock-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b4513'%3E%3Cpath d='M7 10a5 5 0 0 1 10 0v2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3V10Zm4 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'/%3E%3C/svg%3E");
}

.shield-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b4513'%3E%3Cpath d='M12 1l8.5 3v8c0 5.5-4.25 10.75-8.5 12-4.25-1.25-8.5-6.5-8.5-12V4L12 1Z'/%3E%3C/svg%3E");
}

.logout-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b4513'%3E%3Cpath d='M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4Zm-5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3-9H5V5h10v5Z'/%3E%3C/svg%3E");
}

.login-devices {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.device-card {
  border: 1px solid rgba(224, 208, 184, 0.85);
  border-radius: 8px;
  padding: 16px;
  background: rgba(248, 244, 240, 0.85);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.device-header {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-type {
  font-weight: 600;
  color: #3a2618;
  font-size: 14px;
}

.device-location {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.device-time {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  margin-left: 20px;
}

.device-detail {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.device-badge,
.device-action {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.device-badge {
  background: rgba(144, 202, 249, 0.3);
  color: rgba(25, 103, 210, 0.9);
  font-weight: 600;
}

.device-action {
  background: rgba(244, 67, 54, 0.1);
  color: rgba(211, 47, 47, 0.9);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-action:hover {
  background: rgba(244, 67, 54, 0.2);
}

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 20px 0;
}

.security-options {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(224, 208, 184, 0.85);
  border-radius: 8px;
  background: rgba(248, 244, 240, 0.85);
}

.security-label {
  font-weight: 600;
  color: #3a2618;
  font-size: 14px;
}

.security-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: rgba(139, 69, 19, 0.88);
  cursor: pointer;
}

.logout-section {
  padding: 20px;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  background: rgba(255, 235, 238, 0.3);
  margin-bottom: 20px;
}

.logout-desc {
  font-size: 14px;
  color: rgba(211, 47, 47, 0.8);
  margin: 0 0 12px 0;
}

.logout-btn {
  padding: 10px 20px;
  background: rgba(244, 67, 54, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(211, 47, 47, 0.9);
  transform: translateY(-1px);
}

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
</style>
