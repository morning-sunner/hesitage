<!-- 从 ProfileSettingsSecurity.vue 提取的内容组件 -->
<template>
  <div class="security-settings">
    <div class="form-row top-row">
      <div class="form-label">用户名</div>
      <div class="form-ctrl">
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
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const username = ref(localStorage.getItem('userName') || '')
const currentPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')

/** ✅ 仅本页解除 #app 的 max-width/padding 限制（参考收藏页做法） */
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

onMounted(() => enableFullBleed())
onBeforeUnmount(() => disableFullBleed())

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
</script>

<style scoped>
/* ✅ 仅本页生效：解除 #app 全局 max-width/padding（保留你的做法） */
:global(#app.app-full-bleed) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
:global(body.profile-full-bleed) {
  margin: 0;
  overflow-x: hidden;
}

/* =========================
   1) 去掉“小框”：不要 background/border/radius
   只保留居中与内边距（让它在外层大框里舒服）
   ========================= */
.security-settings {
  width: 100% !important;
  max-width: 860px !important;
  margin: 0 auto !important;

  /* ✅ 只留“内容间距”，不再画第二层框 */
  padding: 34px 56px 28px !important;
  box-sizing: border-box !important;

  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* =========================
   2) 行布局：label + 输入列，整体居中，不贴左
   ========================= */
.security-settings .form-row {
  display: grid !important;
  grid-template-columns: 140px 1fr !important;
  column-gap: 32px !important;
  align-items: center !important;
  padding: 20px 0 !important;
}

.security-settings .form-label {
  text-align: right !important;
  justify-self: end !important;
  font-size: 15px !important;
  font-weight: 850 !important;
  color: #3a2618 !important;
}

.security-settings .form-ctrl {
  min-width: 0 !important;
}

/* =========================
   3) 输入框：统一更舒服
   ========================= */
.security-settings .input {
  width: 100% !important;
  height: 46px !important;
  padding: 12px 16px !important;
  border: 1px solid rgba(120, 120, 120, 0.35) !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  outline: none !important;
  font-size: 14px !important;
  box-sizing: border-box !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}

.security-settings .input:focus {
  border-color: rgba(139, 69, 19, 0.85) !important;
  box-shadow: 0 0 0 4px rgba(194, 158, 109, 0.16) !important;
}

.security-settings .input-readonly {
  background: rgba(250, 246, 242, 0.9) !important;
  border-color: rgba(224, 208, 184, 0.85) !important;
  color: rgba(58, 38, 24, 0.78) !important;
  cursor: not-allowed !important;
}
.security-settings .input-readonly:focus {
  box-shadow: none !important;
}

/* 分割线 & 标题保持简洁 */
.security-settings .divider {
  height: 1px !important;
  background: rgba(0, 0, 0, 0.08) !important;
  margin: 18px 0 18px !important;
}

.security-settings .section-title {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 4px 0 6px !important;
  font-size: 14px !important;
  font-weight: 900 !important;
  color: rgba(139, 69, 19, 0.95) !important;
}

/* =========================
   4) 新密码：提示放右侧（同一行）
   ========================= */
.security-settings .hint-row {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  flex-wrap: nowrap !important;
}
.security-settings .hint-row .input {
  flex: 1 1 auto !important;
}
.security-settings .hint {
  flex: 0 0 auto !important;
  white-space: nowrap !important;
  font-size: 13px !important;
  color: rgba(0, 0, 0, 0.55) !important;
}

/* =========================
   5) 保存按钮：右下角 + 加保存图标 + 内容居中
   ========================= */
.security-settings .actions {
  display: flex !important;
  justify-content: flex-end !important; /* ✅ 右下 */
  padding-top: 26px !important;
}

/* ✅ 关键：按钮内部用 justify-content:center，文字不会偏左 */
.security-settings .save-btn {
  height: 48px !important;
  min-width: 170px !important;
  padding: 0 24px !important;
  border: none !important;
  border-radius: 999px !important;
  cursor: pointer !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important; /* ✅ 内容居中 */
  gap: 10px !important;

  background: linear-gradient(180deg, rgba(139, 69, 19, 0.92), rgba(109, 56, 17, 0.92)) !important;
  color: #fff !important;
  font-size: 15px !important;
  font-weight: 900 !important;
  letter-spacing: 0.5px !important;

  box-shadow: 0 12px 22px rgba(139, 69, 19, 0.18) !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease !important;
}

.security-settings .save-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 16px 28px rgba(139, 69, 19, 0.22) !important;
  filter: brightness(1.02) !important;
}
.security-settings .save-btn:active {
  transform: translateY(0) !important;
  box-shadow: 0 10px 18px rgba(139, 69, 19, 0.18) !important;
}

/* ✅ 保存图标：直接用内联 svg（不改 template，只补样式） */
.security-settings .save-ico {
  width: 18px !important;
  height: 18px !important;
  display: inline-block !important;
  flex: 0 0 auto !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4Zm0 2.5L19.5 8H17V5.5ZM7 5h8v4H7V5Zm12 14H5V5h.5v6H17V5.5h.5V19Z'/%3E%3C/svg%3E") !important;
}

/* =========================
   6) 小屏适配：label 变上方，hint 允许换行
   ========================= */
@media (max-width: 980px) {
  .security-settings {
    max-width: 92vw !important;
    padding: 18px 16px 18px !important;
  }

  .security-settings .form-row {
    grid-template-columns: 1fr !important;
    row-gap: 10px !important;
  }

  .security-settings .form-label {
    text-align: left !important;
    justify-self: start !important;
  }

  .security-settings .hint-row {
    flex-wrap: wrap !important;
  }

  .security-settings .actions {
    justify-content: flex-start !important;
  }
}
</style>
