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
    { name: "陈建国", category: "传统技艺", level: "国家级", description: "长期投身于传统技艺的传承保护工作，于多家工艺厂担任技术骨干。曾参与多项国家级非遗项目的抢救性记录与整理，培养青年学徒三十余人。其严谨的治学态度与深厚的实践经验，在业内享有广泛声誉。" },
    { name: "王秀英", category: "版画", level: "省级", description: "自青年时期起便跟随师父学习木版年画的刻印与绘制，至今已逾五十年。他完整掌握了从制版、调色到套印的全部古法工艺，作品色彩浓烈，富有乡土生活气息。如今虽年事已高，仍坚持每年春节前亲手印制一批年画赠送乡邻。" },
    { name: "张建军", category: "木质建筑", level: "国家级", description: "长期致力于传统木结构建筑的营造与修复工作，精通榫卯技艺。曾主持或参与多项古建筑、古戏台的修缮工程，坚持使用原工艺、原材料。他还将复杂的构造原理制成模型与图纸，用于教学，使这门古老技艺更易于理解与传播。" },
    { name: "李爱华", category: "刺绣", level: "市级", description: "自幼随母亲学习传统刺绣，尤其擅长苏绣中的双面绣技法。其作品多次在省级工艺美术展览中获奖，并被海外文化机构收藏。退休后仍坚持在社区开设公益培训班，致力于将这门手艺传给更多年轻人。" },
    { name: "刘国庆", category: "民俗节庆", level: "国家级", description: "是地方民俗“龙舟祭祀仪式”的主要组织者与主持者。她熟知仪式中的每一个环节、唱词与禁忌，并能清晰阐述其背后的历史渊源与文化寓意。每年端午，她都会带领村民完整复原这一传统活动，使其成为当地重要的文化名片。" },
    { name: "赵玉兰", category: "陶瓷", level: "省级", description: "出身陶瓷世家，熟练掌握从选土、炼泥到烧制的完整工艺流程。在景德镇老厂工作期间，参与复原了数种已失传的明清釉彩配方。近年来专注于将传统技法与现代审美相结合，创作出一系列深受市场欢迎的新式瓷器。" },
    { name: "周胜利", category: "传统医药", level: "市级", description: "深耕传统中医药领域，尤其擅长运用本地草药配制膏方与药酒。他不仅继承了家族的秘方与诊法，还通过临床实践不断加以完善。近年来，他开始将这些经验系统整理成册，并带徒传授，希望使古老智慧惠及更多人。" },
    { name: "孙淑珍", category: "剪纸", level: "国家级", description: "为剪纸艺术传承人，其作品题材广泛，从传统吉祥纹样到现代生活场景均有涉猎。她的剪纸刀法流畅，线条细腻，尤其擅长创作大型、复杂的叙事性组画。多次应邀赴海外进行文化交流，作品被多家博物馆收藏。" },
    { name: "吴建设", category: "民乐", level: "省级", description: "作为地方戏曲团的骨干演员，专工老生行当，唱腔醇厚饱满。除了登台表演，她还系统整理了所在剧种的数百个传统唱段与表演口诀。常年深入中小学校开展戏曲普及讲座，被誉为“行走的戏曲百科全书”。" },
    { name: "郑红梅", category: "编织技艺", level: "国家级", description: "是地方传统编织技艺的能手，熟练掌握竹编、草编、藤编等多种技法。她设计的编织品既实用又美观，巧妙地将传统图案与现代生活用品相结合。通过开办合作社，她带领村里妇女一起从事编织生产，使这项手艺成为助力乡村振兴的特色产业。" },
    { name: "冯志强", category: "民乐", level: "市级", description: "擅长多种民间乐器的制作与演奏，尤以二胡和琵琶见长。他制作的乐器音色纯正，工艺考究，许多专业院团的乐师都慕名前来定制。除了演奏与制作，他还花费大量时间搜集、记谱，整理了大量濒临失传的民间曲调。" },
    { name: "黄春华", category: "茶艺", level: "国家级", description: "是非遗项目“传统茶食制作技艺”的代表性传承人。她制作的茶点不仅口味正宗，更注重造型与季节、茶品的搭配，蕴含深厚的饮食文化。多年来，她坚持使用古法原料与工具，并详细记录了每一道工序的操作要领与心得。" },
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
