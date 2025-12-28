<template>
  <div class="container">
    <NavBar />

    <div class="main-content">
      <div class="content-wrapper">
        <!-- 卡片列表 -->
        <div
          v-for="(person, index) in inheritors"
          :key="index"
          class="info-card clickable"
          @click="openModal(person)"
        >
          <h2 class="card-title">{{ person.name }}</h2>
          <div class="card-meta">
            <span>项目类别：{{ person.category }}</span>
            <span>级别：{{ person.level }}</span>
          </div>
          <div class="card-divider"></div>
          <div class="card-content">
            <p>{{ person.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">✕</button>
        <h2 class="modal-title">{{ currentPerson.name }}</h2>
        <p><strong>项目类别：</strong>{{ currentPerson.category }}</p>
        <p><strong>级别：</strong>{{ currentPerson.level }}</p>
        <div class="modal-description">{{ currentPerson.description }}</div>
      </div>
    </div>
  </div>
</template>




<script setup lang="ts">
  import { ref } from "vue";
  import NavBar from "@/components/NavBar.vue";
  
  // 卡片数据（多条示例）
  const inheritors = ref([
    { name: "张三", category: "传统技艺", level: "国家级", description: "长期从事非遗保护工作，具有重要影响。" },
    { name: "李四", category: "传统工艺", level: "省级", description: "擅长传统陶瓷制作，技艺精湛。" },
    { name: "王五", category: "传统表演", level: "国家级", description: "长期从事昆曲表演和教学。" },
    { name: "赵六", category: "刺绣", level: "市级", description: "精通苏绣技艺，作品多次获奖。" },
    { name: "钱七", category: "书法", level: "国家级", description: "书法造诣深厚，师承名家。" },
    { name: "孙八", category: "陶瓷", level: "省级", description: "擅长景德镇传统陶瓷制作。" },
    { name: "周九", category: "茶艺", level: "市级", description: "精通茶艺泡制与礼仪展示。" },
    { name: "吴十", category: "剪纸", level: "国家级", description: "剪纸技艺精湛，作品多次展出。" },
    { name: "郑十一", category: "民乐", level: "省级", description: "擅长江南民乐演奏与教学。" },
    { name: "冯十二", category: "传统戏曲", level: "国家级", description: "长期从事越剧表演及推广。" },
    { name: "陈十三", category: "民俗", level: "市级", description: "组织民俗活动，传播地方文化。" },
    { name: "蒋十四", category: "传统医药", level: "国家级", description: "中医药传承工作者，经验丰富。" },
  ]);
  
  // 控制弹窗显示
  const showModal = ref(false);
  const currentPerson = ref<any>(null);
  
  const openModal = (person: any) => {
    currentPerson.value = person;
    showModal.value = true;
  };
  
  const closeModal = () => {
    showModal.value = false;
    currentPerson.value = null;
  };
  </script>
  
  
  
  
  

<style scoped>
.container {
  width: 100%;            /* 占满屏幕宽度 */
  min-width: 1500px;      /* 最小限制 */
  margin: 0 auto;         /* 居中显示 */
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa, #eef1f5);
  position: relative;
  overflow: hidden;

}

.main-content {
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片样式 */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
  border: 1px solid #d4a574;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #7f8c8d;
}

.card-divider {
  height: 1px;
  background: #e6e8eb;
  margin: 20px 0;
}

.card-content {
  font-size: 15px;
  line-height: 1.8;
  color: #4a4a4a;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  max-height: 80vh;  /* 内容过多时弹窗内部滚动 */
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.modal-title {
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-description {
  margin-top: 12px;
  line-height: 1.6;
  color: #4a4a4a;
}
</style>
