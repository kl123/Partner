<template>
  <Carousel autoplay class="notice">
    <div>
      <h3>1</h3>
    </div>
    <div>
      <h3>2</h3>
    </div>
    <div>
      <h3>3</h3>
    </div>
    <div>
      <h3>4</h3>
    </div>
  </Carousel>
  <!-- 引导区标题 -->
  <div class="section-title">
    <span class="icon">🎯</span>
    <span class="text">引导区</span>
  </div>

  <div class="wenjuan">
    <div class="left">
      <img
        src="../assets/问卷.png"
        class="wenjuan-icon"
      />
      <a-button type="dashed" danger style="font-size: 8px;" @click="into('customization')">点击进入个性化定制</a-button>
    </div>
    
    <!-- 文字内容 -->
    <div class="wenjuan-text">
      <img
        src="../assets/问卷背景.png"
        style="height: 100%;width: 100%;"    
      >
    </div>
  </div>

  <div class="section-title">
    <span class="icon">✨</span>
    <span class="text">功能区</span>
  </div>

  <div class="function">
    <!-- 每日听力 -->
    <div class="item">
      <img src="../assets/Al.png" alt="小智助手">
      <div class="text">小智助手</div>
    </div>

    <!-- 单词宝典 -->
    <div class="item">
      <img src="../assets/单词.png" alt="单词宝典">
      <div class="text">单词宝典</div>
    </div>

    <!-- 智能答疑 -->
    <div class="item">
      <img src="../assets/问答库.png" alt="智能答疑">
      <div class="text">智能答疑</div>
    </div>

  </div>
  <div class="function">
    <!-- 每日听力 -->
    <div class="item">
      <img src="../assets/人脸数据分析.png" alt="就业分析">
      <div class="text">就业分析</div>
    </div>

    <!-- 测试题 -->
    <div class="item" @click="into('test')">
      <img src="../assets/维修档案.png" alt="测试生成">
      <div class="text">测试生成</div>
    </div>

    <!-- 智能答疑 -->
    <div class="item">
      <img src="../assets/风险预知.png" alt="风险预知">
      <div class="text">风险预知</div>
    </div>

  </div>
  <div class="course">
    <CourseTable/>
  </div>
  
</template>
<script setup>
import { Carousel } from 'ant-design-vue';
import lottie from 'lottie-web'; // 引入 lottie-web
import lottieJson from '../assets/animate/cat.json'; // 你的动画 JSON
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'
import CourseTable from '@/components/CourseTable.vue'

let animation = null;
const router = useRouter()

// 初始化 Lottie 动画
function initLottie() {
  const container = document.getElementById('lottie_demo');
  if (!container) return;

  // 销毁可能已存在的动画
  if (animation) {
    animation.destroy();
  }

  animation = lottie.loadAnimation({
    container, // 动画插入的 DOM 容器
    renderer: 'svg', // 渲染为 SVG（推荐）
    loop: true,
    autoplay: true,
    animationData: lottieJson, // 动画数据
  });
}
//路由跳转
const into = (name) => {
  router.push({name:name})
}

onMounted(() => {
  // initLottie();
});

onUnmounted(() => {
  if (animation) {
    animation.destroy(); // 组件销毁时清理动画
  }
});
</script>
<style scoped>
/* 引入美观的中文字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 10px 10px;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #4a4a4a;
  letter-spacing: 0.5px;
  /* border-bottom: #9c9c9c 1px solid; */
}

.section-title .icon {
  font-size: 20px;
}

.section-title .text {
  position: relative;
  padding-left: 8px;
}

/* 添加左侧竖条装饰 */
.section-title .text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #46b8ff, #1890ff);
  border-radius: 2px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .section-title {
    font-size: 16px;
  }
  .section-title .icon {
    font-size: 18px;
  }
}

/* 保持原有样式不变 */
.notice {
  height: 20%;
  width: 100%;
}

h3 {
  height: 15vh;
  color: #fff;
}

.wenjuan {
  height: 15vh;
  width: 95%;
  margin: 10px auto;
  background-color: #46b8ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(70, 184, 255, 0.2);
  color: white;
  font-family: 'Microsoft YaHei', sans-serif;
}

.left {
  height: 100%;
  width: 25%;
  display: flex;
  flex-direction: column;
}

.wenjuan-icon {
  height: 80%;
  width: 100%;
  opacity: 0.95;
}

.wenjuan-text {
  width: 75%;
  height: 100%;
}

.function {
  height: 10%;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.function img {
  height: 60%;
  width: auto;
  margin-left: 10px;
  margin-right: 10px;
}

.function .item {
  margin-left: 10px;
  margin-right: 10px;
}

.course {
  width: 100%;
  height: 20vh;
}
</style>