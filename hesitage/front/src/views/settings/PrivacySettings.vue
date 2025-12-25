<!-- 从 ProfileSettingsPrivacy.vue 提取的内容组件 -->
<template>
  <div class="privacy-settings">
    <div class="privacy-grid">
      <!-- 个人资料可见性 -->
      <section class="privacy-col">
        <div class="privacy-title">个人资料可见性</div>

        <label class="radio-row">
          <input
            class="radio"
            type="radio"
            name="profileVisibility"
            value="public"
            v-model="privacy.profileVisibility"
          />
          <span class="radio-text">公开-所有用户可见</span>
        </label>

        <label class="radio-row">
          <input
            class="radio"
            type="radio"
            name="profileVisibility"
            value="private"
            v-model="privacy.profileVisibility"
          />
          <span class="radio-text">私密-仅自己可见</span>
        </label>

        <div v-if="privacy.profileVisibility === 'private'" class="privacy-tip">
          已选择"私密"，下方公开项将自动关闭。
        </div>
      </section>

      <!-- 收藏与动态可见性 -->
      <section class="privacy-col split">
        <div class="privacy-title">收藏与动态可见性</div>

        <label class="radio-row" :class="{ disabled: privacy.profileVisibility === 'private' }">
          <input
            class="radio"
            type="radio"
            name="activityVisibility"
            value="public"
            v-model="privacy.activityVisibility"
            :disabled="privacy.profileVisibility === 'private'"
          />
          <span class="radio-text">公开-所有用户可见</span>
        </label>

        <label class="radio-row" :class="{ disabled: privacy.profileVisibility === 'private' }">
          <input
            class="radio"
            type="radio"
            name="activityVisibility"
            value="friend"
            v-model="privacy.activityVisibility"
            :disabled="privacy.profileVisibility === 'private'"
          />
          <span class="radio-text">好友可见</span>
        </label>

        <label class="radio-row">
          <input
            class="radio"
            type="radio"
            name="activityVisibility"
            value="private"
            v-model="privacy.activityVisibility"
          />
          <span class="radio-text">仅自己可见</span>
        </label>
      </section>

      <!-- 搜索引擎与分享 -->
      <section class="privacy-col split">
        <div class="privacy-title">搜索引擎与分享</div>

        <label class="radio-row">
          <input
            class="radio"
            type="checkbox"
            v-model="privacy.allowSearch"
          />
          <span class="radio-text">允许搜索引擎收录</span>
        </label>

        <label class="radio-row">
          <input
            class="radio"
            type="checkbox"
            v-model="privacy.allowShare"
          />
          <span class="radio-text">允许他人分享我的内容</span>
        </label>

        <div class="privacy-desc">
          关闭搜索引擎收录可能会降低你的内容可见度，但能保护隐私。
        </div>
      </section>
    </div>

    <div class="actions">
      <button class="save-btn" type="button" @click="onSavePrivacy">
        <span class="save-ico" aria-hidden="true"></span>
        保存更改
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const privacy = ref({
  profileVisibility: localStorage.getItem('profileVisibility') || 'public',
  activityVisibility: localStorage.getItem('activityVisibility') || 'public',
  allowSearch: localStorage.getItem('allowSearch') !== 'false',
  allowShare: localStorage.getItem('allowShare') !== 'false',
})

function onSavePrivacy() {
  localStorage.setItem('profileVisibility', privacy.value.profileVisibility)
  localStorage.setItem('activityVisibility', privacy.value.activityVisibility)
  localStorage.setItem('allowSearch', String(privacy.value.allowSearch))
  localStorage.setItem('allowShare', String(privacy.value.allowShare))
  alert('隐私设置已保存')
}
</script>

<style scoped>
.privacy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  min-height: 320px;
}

.privacy-col {
  padding: 8px 26px 18px;
}

.privacy-col.split {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.privacy-title {
  text-align: center;
  font-size: 15px;
  font-weight: 750;
  color: #3a2618;
  margin: 8px 0 22px;
}

.radio-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  user-select: none;
  cursor: pointer;
}

.radio-row.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.radio {
  width: 15px;
  height: 15px;
  accent-color: rgba(139, 69, 19, 0.88);
  cursor: pointer;
}

.radio[disabled] {
  opacity: 0.55;
  cursor: not-allowed;
}

.radio-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(58, 38, 24, 0.9);
}

.privacy-desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(0, 0, 0, 0.55);
  text-align: center;
  padding: 0 10px;
}

.privacy-tip {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(139, 69, 19, 0.75);
  text-align: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 22px;
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
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
  .privacy-grid {
    grid-template-columns: 1fr;
  }

  .privacy-col.split {
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style>
