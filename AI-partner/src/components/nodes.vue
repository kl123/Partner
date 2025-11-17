<template>
  <div class="container">
    <!-- 外层浅蓝色背景卡片 -->
    <div class="outer-card">
      <!-- 顶部学习卡片（背景改为淡蓝色） -->
      <div class="top-card">
        <h2>{{route.query.subject}} <span class="difficulty">难度: ★★★</span></h2>
        <div class="time-progress">
          <p>剩余时间: 20min</p>
          <div class="progress-circle">
            <a-progress type="circle" :percent="courseFromStorage.progress*100" :size="80" :stroke-width="12" stroke-color="#7bb7d7" style="margin-right: 20px;"/>
          </div>
        </div>
        <p class="description">说明:{{courseFromStorage.description}}</p>
      </div>
    </div>

    <!-- 听力和单词模块的总背景卡片 -->
    <div class="modules-container">
      <!-- 英语听力模块 -->
      <div class="module blue" v-for="item in timelineItems">
        <h3>{{item.display_name}}</h3>
        <a-progress stroke-linecap="square" :percent="item.proficiency*100" :size="6" :stroke-width="6" stroke-color="#417bbd"/>
        <p>
          难度:<a-rate :value="item.difficulty" />
        </p>
        <ul class="task-list">
          <li>
            <input type="radio" disabled>
            <span>计划时间{{item.day_num}}</span>
          </li>
          <li>
            <input type="radio" disabled>
            <span>{{item.description}}</span>
          </li>
        </ul>
        <button style="border-radius: 20px; background-color: #4f90d4;border: none;padding: 10px" @click="handleStart(item)">开始学习</button>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="task-tip">
      本章节的学习任务结束啦<br>
      开启下一章节学习吧~
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted,watch } from "vue"
import { LeftOutlined, CheckCircleOutlined,MinusCircleOutlined } from '@ant-design/icons-vue';
import { getNodes } from "@/api/Study"
import { Typography, Timeline, Card, Button } from 'ant-design-vue';
import { useRouter,useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const showStatus = ref(true)
const courseFromStorage = ref({ description: '加载中...' });
// 注册组件
const ATypographyTitle = Typography.Title;
const ATimeline = Timeline;
const ATimelineItem = Timeline.Item;
const ACard = Card;
const AButton = Button;
const subject = route.query.subject
onMounted(async () => {
  // 1. 立即恢复本地存储的课程信息
  const stored = localStorage.getItem('course');
  if (stored) {
    try {
      courseFromStorage.value = JSON.parse(stored);
    } catch (e) {
      console.error('解析 course 失败');
    }
  }

  // 2. 加载学习路径列表（不影响顶部显示）
  await requestNode();
});
// 学习路径数据（增强版）
const timelineItems = ref([
  {
    display_name: '路径1：离散数学',
    difficulty: 2,
    difficultyText: '中等',
    proficiency:0.5,
    dayNum: 10,
    description: '学习集合、逻辑、图论等基础数学知识，为算法打下坚实基础。',
  },
  {
    display_name: '路径2：数据结构与算法',
    difficulty: 3,
    difficultyText: '困难',
    proficiency:0.3,
    dayNum: 21,
    description: '掌握数组、链表、栈、队列、树、图等结构及常见算法实现。',
  },
  {
    display_name: '路径3：前端开发入门',
    difficulty: 1,
    difficultyText: '简单',
    dayNum: 14,
    proficiency:1,
    description: '学习 HTML、CSS、JavaScript 和 Vue 基础，完成静态页面开发。',
  },
  {
    display_name: '路径4：算法进阶实战',
    difficulty: 3,
    difficultyText: '困难',
    dayNum: 30,
    description: '深入动态规划、贪心、回溯等高级算法，结合 LeetCode 实战训练。',
  },
]);



//获取学习路径上的知识点
const requestNode = async() => {
  const id = route.query.pathId
  const res = await getNodes(id)
  console.log(res);
  timelineItems.value = res.data
}

// 模拟点击“进入学习”
const handleStart = (item) => {
  console.log('🚀 开始学习:', item.display_name);
  showStatus.value = false
  // 这里可以跳转页面，比如：
  router.push({
    name:"video",
    query:{
    title:item.display_name
  }
})
    //进行本地存储
    localStorage.setItem('pathId', item.pathId)
    localStorage.setItem('concept_id', item.conceptId)
    localStorage.setItem('progress', item.proficiency)
};
const goBack = () =>{
  showStatus.value = true
}
</script>

<style scoped>
/* 背景改为蓝色→白色→蓝色的垂直渐变 */
.container {
  background: linear-gradient(to bottom, #66b3ff 0%, #ffffff 50%, #66b3ff 100%);
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 外层浅蓝色背景卡片 */
.outer-card {
  background-color: #e6f2ff; /* 浅蓝色背景 */
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

/* 顶部学习卡片 - 背景改为淡蓝色 */
.top-card {
  background-color: #f0f8ff; /* 淡蓝色背景（比外层卡片更浅） */
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.top-card h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #1a73e8; /* 加深标题颜色，提升可读性 */
}

.difficulty {
  font-size: 16px;
  color: #5f6368;
  margin-left: 10px;
}

.time-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap; /* 适配小屏幕 */
  gap: 15px;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  overflow: hidden;
}

.progress-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #e6f2ff;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #1a73e8; /* 调整进度条颜色，更醒目 */
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
  color: #1a73e8;
}

.description {
  font-size: 14px;
  color: #424242;
  line-height: 1.6;
  margin: 0;
}

/* 听力和单词模块的总背景卡片 */
.modules-container {
  background-color: #e6f2ff; /* 与顶部外层卡片同色，保持统一 */
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.module {
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px; /* 模块之间的间距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 移除最后一个模块的底部间距 */
.module:last-child {
  margin-bottom: 0;
}

.module h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
}

/* 为模块标题添加图标样式（可选，增强视觉） */
.module h3::before {
  content: "📚";
  margin-right: 8px;
}

.blue {
  background-color: #66b3ff;
  color: #fff;
}

.light-blue {
  background-color: #cce5ff;
  color: #333;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 15px;
}

.task-list li input {
  margin-right: 10px;
  transform: scale(1.1); /* 放大复选框/单选框，提升交互感 */
}

.task-list li.completed span {
  text-decoration: line-through;
  opacity: 0.7;
}

.task-tip {
  text-align: center;
  color: #5f6368;
  margin: 40px 0 20px;
  font-size: 15px;
  line-height: 1.8;
  padding-bottom: 20px;
}
</style>

<script>
export default {
  name: "StudyPage",
  data() {
    return {
      // 可根据实际需求添加数据
    };
  },
};
</script>