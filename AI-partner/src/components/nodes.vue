<template>
  <div class="container">
    <!-- 外层浅蓝色背景卡片 -->
    <div class="outer-card">
      <!-- 顶部学习卡片（背景改为淡蓝色） -->
      <div class="top-card">
        <h2>English <span class="difficulty">难度: ★★★</span></h2>
        <div class="time-progress">
          <p>剩余时间: 20min</p>
          <div class="progress-circle">
            <div class="progress-bg"></div>
            <div class="progress-fill" style="width: 70%"></div>
            <span class="progress-text">70%</span>
          </div>
        </div>
        <p class="description">说明: 英语学习锻炼听说读写译能力，通过扩大词汇量，了解英语语法，锻炼听说能力的方法，来提高英语能力...</p>
      </div>
    </div>

    <!-- 听力和单词模块的总背景卡片 -->
    <div class="modules-container">
      <!-- 英语听力模块 -->
      <div class="module blue">
        <h3>英语听力</h3>
        <ul class="task-list">
          <li class="completed">
            <input type="checkbox" checked disabled>
            <span>Dictation</span>
          </li>
          <li>
            <input type="radio" disabled>
            <span>长对语文本2篇</span>
          </li>
        </ul>
      </div>

      <!-- 英语单词模块 -->
      <div class="module light-blue">
        <h3>英语单词</h3>
        <ul class="task-list">
          <li class="completed">
            <input type="checkbox" checked disabled>
            <span>学习50个新单词</span>
          </li>
          <li class="completed">
            <input type="checkbox" checked disabled>
            <span>复习50个单词</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="task-tip">
      本章节的学习任务结束啦<br>
      开启下一章节学习吧~
    </div>
  </div>
</template>

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