<!-- ProfileSettingsLogin.vue -->
<template>
  <div class="login-settings">
    <div class="two-col">
      <!-- 左列：登录历史 + 登出（底部对齐） -->
      <section class="col col-left">
        <div class="section-wrap">
          <div class="section-title">
            <span class="lock-icon"></span>
            <span>登录历史</span>
          </div>

          <!-- 内容（顶端） -->
          <div class="panel-body panel-left">
            <div class="login-devices">
              <div v-for="(device, index) in loginDevices" :key="index" class="device-card">
                <div class="device-main">
                  <div class="device-header">
                    <div class="device-info">
                      <span class="device-type">{{ device.type }}</span>
                      <span class="device-location">{{ device.location }}</span>
                    </div>
                    <span class="device-time">{{ device.lastLogin }}</span>
                  </div>

                  <div class="device-detail">
                    <span class="chip">IP: {{ device.ip }}</span>
                    <span class="chip">{{ device.status }}</span>
                  </div>
                </div>

                <div class="device-side">
                  <span v-if="device.isCurrent" class="badge">当前设备</span>

                  <button
                    v-else
                    class="btn btn-danger-outline btn-sm"
                    type="button"
                    @click="onLogoutDevice(index)"
                  >
                    <span class="btn-ico i-logout" aria-hidden="true"></span>
                    登出此设备
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ 登出（固定在左列底部） -->
          <div class="bottom-bar">
            <div class="section-title">
              <span class="logout-icon"></span>
              <span>登出</span>
            </div>

            <div class="logout-section">
              <p class="logout-desc">退出当前账户</p>

              <!-- ✅ 和保存更改同宽同长 -->
              <button class="btn btn-danger btn-lg btn-action" type="button" @click="onLogoutAll">
                <span class="btn-ico i-logout" aria-hidden="true"></span>
                登出所有设备
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 右列：登录安全 + 保存（底部对齐） -->
      <section class="col col-right">
        <div class="section-wrap">
          <div class="section-title">
            <span class="shield-icon"></span>
            <span>登录安全</span>
          </div>

          <!-- 内容（顶端） -->
          <div class="panel-body panel-right">
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
          </div>

          <!-- ✅ 保存（固定在右列底部） -->
          <div class="bottom-bar bottom-actions">
            <button class="btn btn-primary btn-lg btn-action" type="button" @click="onSaveLogin">
              <span class="btn-ico i-save" aria-hidden="true"></span>
              保存更改
            </button>
          </div>
        </div>
      </section>
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
    isCurrent: true
  },
  {
    type: 'iPhone 14 Pro - Safari',
    location: '中国 浙江省',
    ip: '192.168.1.101',
    lastLogin: '3 天前',
    status: '离线',
    isCurrent: false
  },
  {
    type: 'iPad Air - Safari',
    location: '中国 北京市',
    ip: '10.0.0.50',
    lastLogin: '1 周前',
    status: '离线',
    isCurrent: false
  }
])

const settings = ref({
  twoFactorEnabled: localStorage.getItem('twoFactorEnabled') === 'true',
  loginNotification: localStorage.getItem('loginNotification') !== 'false',
  unusualLoginAlert: localStorage.getItem('unusualLoginAlert') !== 'false'
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
/* 兜底 */
.login-settings,
.login-settings * {
  box-sizing: border-box;
}

.login-settings {
  --text-strong: rgba(45, 28, 18, 0.95);
  --muted: rgba(0, 0, 0, 0.55);

  --brand: rgba(139, 69, 19, 0.92);
  --brand-weak: rgba(139, 69, 19, 0.10);

  --line: rgba(0, 0, 0, 0.06);
  --border: rgba(224, 208, 184, 0.78);

  --card-bg: rgba(255, 255, 255, 0.92);

  /* ✅ 两个主按钮统一宽度（登出所有设备 & 保存更改） */
  --action-w: 320px;

  width: min(1500px, 100%);
  height: 100%;
  min-height: 100%;
  margin: 0 auto;
  padding: clamp(10px, 1.4vw, 18px);
}

/* 两列布局 */
.two-col {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 34px;
  align-items: stretch;
}

.col {
  min-width: 0;
  display: flex;
}

/* 内容容器（每列一套：顶部内容 + 底部 bar） */
.section-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 6px;
}

/* 标题 */
.section-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  font-size: 15px;
  font-weight: 850;
  color: var(--brand);
  letter-spacing: 0.3px;

  padding-left: 8px;
}

/* icon */
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

/* ✅ 主体内容：顶端对齐，底部留给 bottom-bar */
.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 18px;
}

.panel-left,
.panel-right {
  padding-top: 4px;
}

/* ✅ 底部条：固定在列底部 */
.bottom-bar {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 12px;
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
}

/* =========================
   统一按钮体系
   ========================= */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  height: 50px;
  padding: 0 28px;
  min-width: 168px;
  border-radius: 999px;

  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2;

  cursor: pointer;
  user-select: none;

  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}

.btn-sm {
  height: 44px;
  padding: 0 22px;
  min-width: 150px;
  font-size: 13px;
}

.btn-lg {
  height: 54px;
  padding: 0 34px;
  font-size: 15px;
}

/* ✅ 两个主按钮同宽同长 */
.btn-action {
  width: var(--action-w);
  min-width: var(--action-w);
}

/* 主色按钮（棕） */
.btn-primary {
  background: rgba(139, 69, 19, 0.90);
  color: #fff;
  border-color: rgba(139, 69, 19, 0.28);
  box-shadow: 0 14px 22px rgba(139, 69, 19, 0.18);
}
.btn-primary:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

/* 危险按钮（红 实心） */
.btn-danger {
  background: rgba(244, 67, 54, 0.88);
  color: #fff;
  border-color: rgba(244, 67, 54, 0.32);
  box-shadow: 0 14px 22px rgba(244, 67, 54, 0.14);
}
.btn-danger:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

/* 危险按钮（红 轻量） */
.btn-danger-outline {
  background: rgba(244, 67, 54, 0.10);
  color: rgba(211, 47, 47, 0.96);
  border-color: rgba(244, 67, 54, 0.24);
  box-shadow: none;
}
.btn-danger-outline:hover {
  background: rgba(244, 67, 54, 0.16);
  transform: translateY(-1px);
}

/* 按钮图标 */
.btn-ico {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* 保存图标（白） */
.btn-ico.i-save {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4Zm0 2.5L19.5 8H17V5.5ZM7 5h8v4H7V5Zm12 14H5V5h.5v6H17V5.5h.5V19Z'/%3E%3C/svg%3E");
}

/* 登出图标：默认白（用于红实心按钮） */
.btn-ico.i-logout {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M16 17v-2H7v-2h9v-2l3 3-3 3ZM14 3a2 2 0 0 1 2 2v4h-2V5H6v14h8v-4h2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8Z'/%3E%3C/svg%3E");
}

/* ✅ outline 按钮里的登出图标改为红色（不然白色会“发虚”） */
.btn-danger-outline .btn-ico.i-logout {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d32f2f'%3E%3Cpath d='M16 17v-2H7v-2h9v-2l3 3-3 3ZM14 3a2 2 0 0 1 2 2v4h-2V5H6v14h8v-4h2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8Z'/%3E%3C/svg%3E");
}

/* =========================
   登录历史卡片
   ========================= */
.login-devices {
  display: grid;
  gap: 18px;
}

.device-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;

  padding: 20px 22px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
}

.device-main {
  min-width: 0;
  display: grid;
  gap: 10px;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.device-type {
  font-weight: 850;
  color: var(--text-strong);
  font-size: 15px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-location {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.35;
}

.device-time {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

.device-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 8px 14px;
  border-radius: 999px;

  font-size: 12px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.70);

  background: rgba(240, 230, 214, 0.88);
  border: 1px solid rgba(224, 208, 184, 0.92);
}

.device-side {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 40px;
  padding: 0 16px;
  border-radius: 999px;

  font-size: 13px;
  font-weight: 900;
  color: rgba(109, 56, 17, 0.96);

  background: rgba(139, 69, 19, 0.10);
  border: 1px solid rgba(139, 69, 19, 0.20);
}

/* =========================
   登录安全卡片
   ========================= */
.security-options {
  display: grid;
  gap: 18px;
}

.security-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;

  padding: 18px 22px;
  min-height: 62px;

  border-radius: 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
}

.security-label {
  font-weight: 850;
  color: var(--text-strong);
  font-size: 14px;
  line-height: 1.35;
}

.security-ctrl {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
}

/* checkbox -> 开关 */
.checkbox {
  appearance: none;
  -webkit-appearance: none;

  width: 44px;
  height: 24px;
  border-radius: 999px;

  border: 1px solid rgba(0, 0, 0, 0.18);
  background: rgba(0, 0, 0, 0.12);

  position: relative;
  cursor: pointer;
  outline: none;

  transition: background 0.18s ease, border-color 0.18s ease;
}

.checkbox::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;

  width: 20px;
  height: 20px;
  border-radius: 999px;

  background: #fff;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);

  transition: transform 0.18s ease;
}

.checkbox:checked {
  background: rgba(139, 69, 19, 0.86);
  border-color: rgba(139, 69, 19, 0.40);
}
.checkbox:checked::after {
  transform: translateX(20px);
}

/* 登出区域卡片 */
.logout-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  padding: 18px 20px;
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(244, 67, 54, 0.26);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
}

.logout-desc {
  margin: 0;
  font-size: 14px;
  font-weight: 850;
  color: rgba(211, 47, 47, 0.86);
}

/* 响应式 */
@media (max-width: 980px) {
  .two-col {
    height: auto;
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .bottom-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .device-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .device-side {
    justify-content: flex-start;
  }

  .logout-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-action {
    width: 100%;
    min-width: 0;
  }
}
/* =========================
   1) 标题更像“标题栏”
   ========================= */
.section-title {
  font-size: 17px;     /* 原来 15px -> 更明显 */
  font-weight: 900;
  letter-spacing: 0.4px;
  padding-left: 8px;
  margin-bottom: 2px;
}

.lock-icon,
.shield-icon,
.logout-icon {
  width: 20px;         /* 原来 18px -> 略大 */
  height: 20px;
}

/* 底部bar标题与按钮间距更舒服一点 */
.bottom-bar {
  padding-top: 16px;   /* 原来 18px */
  gap: 10px;           /* 原来 12px */
}

/* =========================
   2) 两个主按钮稍微小一点
   （保存更改 & 登出所有设备）
   ========================= */
/* 统一宽度也收一点 */
.login-settings {
  --action-w: 280px;   /* 原来 320px -> 收紧 */
}

/* 主按钮尺寸：更“精致” */
.btn-lg {
  height: 48px;        /* 原来 54px */
  padding: 0 26px;     /* 原来 0 34px */
  font-size: 14px;     /* 原来 15px */
}

/* 两个主按钮同宽同长，跟随变量 */
.btn-action {
  width: var(--action-w);
  min-width: var(--action-w);
}

/* 图标跟随按钮稍微小一点 */
.btn-ico {
  width: 16px;         /* 原来 18px */
  height: 16px;
}

/* 登出区域卡片也略紧凑点（避免按钮变小后卡片显空） */
.logout-section {
  padding: 16px 18px;  /* 原来 18px 20px */
}

/* 小屏依然全宽 */
@media (max-width: 720px) {
  .btn-action {
    width: 100%;
    min-width: 0;
  }
}

</style>
