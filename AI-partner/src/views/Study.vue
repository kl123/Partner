<template>
  <div class="main">
    <div class="top-class">
      <div class="one">
        <div class="left">
          <div class="board">
            <div>
              <div style="margin-top: 5px;margin-bottom:  5px;margin-left: 10px;">{{Selectcourse.title}}</div>
              <p style="font-size: smaller;margin-left: 10px;color: red;">风险预测:<a-rate :value="Selectcourse.risk*100/20" /></p>
            </div>
            <a-progress type="circle" :percent="Selectcourse.progress*100" :size="50" :stroke-width="12" stroke-color="#7bb7d7" style="margin-right: 20px;"/>
          </div>
          <p style="font-size: small;margin-top: 5px;">
            就剩<strong>20%</strong>了!赶紧来学习吧!
          </p>
          <button class="btn1">去学习</button>
        </div>
        <div class="right">
          <img src="../assets/青苹果.png" style="height: 80%;width: 80%;"/>
        </div>
      </div>
      <div class="two">
        <!-- 描述 -->
        <p>
          An apple a day, keeps the docter away.
        </p>
      </div>
    </div>

    <!-- 学习路径和章节学习区域 -->
    <div class="study-section">
      <!-- 学习路径 -->
      <div class="path-header">
        <span>学习路径</span>
        <span style="color: #999; font-size: 12px;">在学路径：{{learningPaths.length}} 个</span>
      </div>
    
      <div class="path-cards">
        <div class="path-card"  v-for="item in learningPaths" :key="item.pathId" @click="SelectClass(item.pathId)">
          <div class="stars"><a-rate :value="5" disabled /></div>
          <div class="subject">{{item.title}}</div>
          <div class="subject-en">Chemical</div>
          <img src="../assets/书.png" alt="化学" class="icon" />
        </div>
      </div>
    
      <!-- 章节学习 -->
      <div class="chapter-header">
        <span>章节学习</span>
      </div>
      <div class="chapter-list-container">
        <div class="chapter-item" v-for="item in Nodes" :key="item.id">
          <div class="chapter-title">{{item.display_name}}</div>
          <div class="time-info">
            <span>⏱️ 剩余时间：15h20min</span><br/>
            <span>📅 计划时间：{{item.day_num}}天</span>
          </div>
          <div class="progress-bar">
            <a-progress stroke-linecap="square" :percent="item.proficiency*100" :size="50" :stroke-width="12" stroke-color="#7bb7d7"/>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { getPlan,getNodes } from "@/api/Study"
import { useRouter } from 'vue-router'
import lottieJson from '../assets/animate/vr.json'
import lottie from 'lottie-web'

const router = useRouter()

// 初始数据，会被接口覆盖
const learningPaths = ref([
  {
    id: 1,
    title: '路径1：离散数学',
    description: '掌握逻辑、集合、图论等计算机基础理论，为算法和编程打下坚实基础。',
    progress: 0.75,
    completed: 0,
  },
  {
    id: 2,
    title: '路径2：数据结构与算法',
    description: '学习常见数据结构与经典算法，提升编程能力与问题解决能力。',
    progress: 1,
    completed: 1,
  },
  {
    id: 3,
    title: '路径3：前端开发入门',
    description: '从 HTML/CSS/JavaScript 到 Vue 框架，掌握现代前端开发技能。',
    progress: 0.4,
    completed: 0,
  },
]);

// 使用 computed 动态生成 stats
const stats = computed(() => {
  const total = learningPaths.value.length;
  const completed = learningPaths.value.filter(path => path.completed === 1).length;
  const inProgress = total - completed; // 进行中 = 总数 - 已完成

  return [
    { title: '总路径数', value: total, tag: '进行中', color: 'blue' },
    { title: '已完成', value: completed, tag: '本周', color: 'green' },
    { title: '学习时长', value: '42h', tag: '累计', color: 'orange' },
  ];
});

const getlearningPaths = async () => {
  const res = await getPlan();
  learningPaths.value = res.data;
  Selectcourse.value = learningPaths.value[0]
  await getNodesbyClass(Selectcourse.value.pathId)
  console.log(res);
}

const intonode = (id, title) => {
  router.push({
    name: "nodes",
    query: {
      pathId: id,
      subject: title
    }
  });
}

 // 加载动画
 let animation = null
 function initLottie() {
    const container = document.getElementById('lottie_demo')
    if (!container) return

    if (animation) {
      animation.destroy()
    }

    animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: lottieJson
    })
 }
 const Selectcourse = ref({});
 const Nodes = ref([])
 // 根据 id 选择课程
  function SelectClass(id) {
    console.log('选择的 ID:', id);
    const found = learningPaths.value.find(item => item.pathId === id);
    if (found) {
      Selectcourse.value = { ...found }; // 解构赋值确保响应式更新
      // console.log(Selectcourse.value);
      getNodesbyClass(id)
    } else {
      console.warn(`未找到 id 为 ${id} 的学习路径`);
    }
  }
  async function getNodesbyClass(id) {
    const response = await getNodes(id)
    Nodes.value = response.data
    console.log(Nodes.value);
  }
onMounted(() => {
  getlearningPaths();
  initLottie()
})
</script>

<style scoped>
.main {
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(to bottom, #cbeaff, #ffffff, #cbeaff);
  display: flex;
  flex-direction: column;
  align-items: center; /* ✅ 新增：水平居中 */
  padding-top: 0;
}

.top-class {
  margin-top: 30px;
  width: 90%;
  background-image: linear-gradient(to bottom, #e4f4ff, #ffffff);
  border-radius: 20px;
  margin-bottom: 20px; /* 改为底部间距，避免顶部挤压 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* 加点阴影提升立体感 */
}
.one{
  display: flex;
  flex-direction: row;
  height: 70%;
  width: 100%;
}
.left {
  height: 100%;
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 子元素在水平方向靠右 */
  padding-right: 16px;   /* 可选：加点右边距避免贴边 */
}
.board{
  margin-top: 10px;
  height: 60%;
  width: 90%;
  background-color: white;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.btn1{
  height: 40px;
  width: 120px;
  color: white;
  background-color: #499ecb;
  border-radius: 20px;
  border: none;
}
.right{
  height: 100%;
  flex:1;
  display: flex;
  justify-content:center;
  align-items: center; 
}
.two{
  height: 30%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 学习路径和章节学习 */
.study-section {
  width: 90%;
  margin: 20px auto;
}

.path-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}

.path-cards {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  padding: 4px 0;
  margin-bottom: 20px;
  gap: 12px;
}

.path-cards::-webkit-scrollbar {
  display: none;
}

.path-card {
  flex: 0 0 auto;
  width: 120px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.path-card .stars {
  margin-bottom: 6px;
}

.path-card .subject {
  font-weight: bold;
  font-size: 14px;
}

.path-card .subject-en {
  font-size: 12px;
  color: #999;
}

.path-card .icon {
  width: 36px;
  height: 36px;
  margin-top: 8px;
}

.chapter-header {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}

.chapter-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.chapter-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.time-info {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar .ant-progress-outer {
  border-radius: 4px;
}

.progress-bar .ant-progress-inner {
  background-color: #13a9a9;
}
/* 包裹容器：固定高度 + 竖向滚动 */
.chapter-list-container {
  max-height: 300px; /* 可根据需求调整，比如 180px / 220px */
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px; /* 避免滚动条遮挡内容（可选） */
}

/* 滚动条美化（可选） */
.chapter-list-container::-webkit-scrollbar {
  width: 3px;
}
.chapter-list-container::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
.chapter-list-container::-webkit-scrollbar-track {
  background-color: #f0f0f0;
}

/* 原有的 .chapter-item 不需要改高度，让它自然排列 */
.chapter-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  /* 移除 height / max-height，由容器控制整体高度 */
}

/* 如果你仍担心单个 item 太高，可以加一点约束 */
.chapter-title,
.time-info {
  word-break: break-word;
  line-height: 1.4;
}
</style>