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
import { ref } from 'vue'

const username = ref(localStorage.getItem('userName') || '')
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
</script>

<style scoped>
.form-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 0;
}
.top-row {
  padding-top: 6px;
}
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

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 10px 0 18px;
}

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

.hint-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hint {
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
  white-space: nowrap;
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

@media (max-width: 980px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .form-label {
    width: auto;
    text-align: left;
    padding-right: 0;
  }
  .hint-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
