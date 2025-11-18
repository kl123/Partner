<template>
  <div class="error-questions-container">
    <!-- 头部（含Lottie动画和标题） -->
    <header class="page-header">
      <div class="demo">
        <div id="lottie_demo" class="lottie-animation"></div>
        <h1>错题详情</h1>
      </div>
    </header>

    <!-- 题目序号导航 -->
    <div class="question-nav">
      <button 
        v-for="(item, index) in errorQuestions" 
        :key="index" 
        :class="{ active: currentIndex === index }"
        @click="currentIndex = index"
      >
        {{ index + 1 }}
      </button>
    </div>

    <!-- 当前题目详情卡片 -->
    <main class="question-detail-card" v-if="errorQuestions.length > 0">
      <!-- 题目头部（序号+时间） -->
      <div class="question-header">
        <span class="index-badge">{{ currentIndex + 1 }}</span>
        <span class="time">{{ formatTime(currentQuestion.create_time) }}</span>
      </div>

      <!-- 题目内容 -->
      <div class="question-content">
        <p class="question-text"><strong>问题：</strong>{{ currentQuestion.question }}</p>

        <!-- 选项区域（如果有选项的话，适配单选题场景） -->
        <div class="options" v-if="currentQuestion.options">
          <div 
            class="option" 
            v-for="(opt, key) in currentQuestion.options" 
            :key="key"
            :class="[
              currentQuestion.user_answer === key ? 'user-selected' : '',
              currentQuestion.correct_answer === key ? 'correct' : ''
            ]"
          >
            {{ key }}. {{ opt }}
          </div>
        </div>

        <!-- 答题情况+得分 组合卡片 -->
        <div class="answer-score-card">
          <div class="answer-item">
            <strong class="label user">你的答案：</strong>
            <span :class="['answer', currentQuestion.user_answer === currentQuestion.correct_answer ? 'correct' : 'incorrect']">
              {{ currentQuestion.user_answer }}
            </span>
          </div>
          <div class="answer-item">
            <strong class="label correct">正确答案：</strong>
            <span class="answer correct">{{ currentQuestion.correct_answer }}</span>
          </div>
          <div class="score-item">
            <strong>得分：</strong>
            <span class="score">{{ currentQuestion.score || 0 }}</span>
          </div>
        </div>

        <!-- 错误原因 -->
        <div class="reason-box">
          <strong>答案解析：</strong>
          <span>{{ currentQuestion.error_reason || '暂无错误原因记录' }}</span>
        </div>
      </div>
    </main>

    <!-- 无数据提示 -->
    <div v-if="errorQuestions.length === 0" class="empty-state">
      <p>🎉 暂无错题，继续保持！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import lottieJson from '../assets/animate/数据师.json'
import lottie from 'lottie-web'
import { CaptureErrors } from '@/api_py/error'

// 错题数据（从接口获取，默认固定模拟数据）
const errorQuestions = ref([])
// 当前选中的题目索引
const currentIndex = ref(0)

// 格式化时间（去掉时区部分，只保留年月日时分）
const formatTime = (timeStr) => {
  return timeStr?.split(' +')[0] || '未知时间'
}

// 当前选中的题目（计算属性）
const currentQuestion = computed(() => {
  return errorQuestions.value[currentIndex.value] || {}
})

// 加载Lottie动画
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

// 获取错题数据（优先接口获取，失败则用固定模拟数据）
const getData = async () => {
  try {
    const username = localStorage.getItem("username")
    const res = await CaptureErrors(username)
    console.log('接口获取错题数据：', res)
    // 适配接口返回格式（假设res.output是错题数组）
    if (res?.output?.length) {
      errorQuestions.value = res.output
    } else {
      // 接口无数据时加载固定模拟数据
      loadMockData()
    }
  } catch (error) {
    console.error('获取错题失败，使用模拟数据：', error)
    loadMockData()
  }
}

// 固定模拟错题数据
const loadMockData = () => {
  errorQuestions.value = [
    {
      create_time: '2025-09-15 15:20:03 +0800',
      question: '若某存储器存取周期为50ns，每次读出8位数，该存储器的数据传输速率是多少？',
      options: {
        A: '20Bps',
        B: '20bps',
        C: '20MBps',
        D: '20Mbps'
      },
      user_answer: 'C',
      correct_answer: 'D',
      error_reason: '混淆了字节（B）和比特（b）的换算关系，且未正确计算传输速率公式',
      score: 0
    },
    {
      create_time: '2025-09-12 09:45:18 +0800',
      question: '在计算机网络中，HTTP协议工作在OSI参考模型的哪一层？',
      options: {
        A: '网络层',
        B: '传输层',
        C: '应用层',
        D: '表示层'
      },
      user_answer: 'B',
      correct_answer: 'C',
      error_reason: '对OSI七层模型各层协议记忆不准确，混淆了HTTP和TCP的分层',
      score: 0
    },
    {
      create_time: '2025-09-10 14:30:52 +0800',
      question: '下列哪种数据结构是无序的？',
      options: {
        A: '数组',
        B: '链表',
        C: '哈希表',
        D: '栈'
      },
      user_answer: 'A',
      correct_answer: 'C',
      error_reason: '对哈希表的存储特性理解不深入，误认为数组是无序的',
      score: 3.4
    }
  ]
}

// 初始化函数
onMounted(() => {
  initLottie()
  getData()
})
</script>

<style scoped>
/* 原有样式保留，核心修改：整体色调改为淡蓝色系 */
.demo {
  display: flex;
  flex-direction: row;
  height: 10vh;
  align-items: center;
  justify-content: center;
}

.lottie-animation {
  width: 30%;
  height: 100%;
}

.error-questions-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f0f7ff; /* 页面背景：淡蓝色 */
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  padding-bottom: 80px; /* 给底部tab栏留空间 */
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.2em;
  color: #3b82f6; /* 标题色：中蓝色 */
  margin: 0;
}

/* 题目导航 */
.question-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.question-nav button {
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #dbeafe; /* 按钮边框：淡蓝色 */
  background-color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.question-nav button:hover {
  border-color: #93c5fd; /* 按钮hover边框：浅蓝色 */
}

.question-nav button.active {
  background-color: #3b82f6; /* 激活按钮背景：中蓝色 */
  color: #fff;
  border-color: #3b82f6;
}

/* 题目详情卡片 */
.question-detail-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08); /* 阴影：淡蓝色调 */
  overflow: hidden;
}

.question-header {
  background: #eff6ff; /* 题目头部背景：淡蓝色 */
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dbeafe; /* 分隔线：淡蓝色 */
}

.index-badge {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #3b82f6; /* 序号徽章背景：中蓝色 */
  color: white;
  border-radius: 50%;
  font-size: 0.9em;
  font-weight: bold;
}

.time {
  font-size: 0.9em;
  color: #64748b; /* 时间色：深灰色（与蓝色系协调） */
}

.question-content {
  padding: 18px;
  line-height: 1.7;
}

.question-text {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1em;
}

/* 选项样式 */
.options {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #dbeafe; /* 选项边框：淡蓝色 */
  background-color: #f8fafc; /* 选项背景：极淡蓝色 */
  transition: all 0.2s;
}

.option:hover {
  background-color: #eff6ff; /* 选项hover背景：淡蓝色 */
  border-color: #93c5fd;
}

.option.user-selected {
  background: #dbeafe; /* 用户答案背景：浅蓝色 */
  border-color: #60a5fa; /* 用户答案边框：中浅蓝色 */
  color: #ff0000; /* 用户答案文字色：深蓝色 */
}

.option.correct {
  background: #bfdbfe; /* 正确答案背景：中浅蓝色 */
  border-color: #3b82f6; /* 正确答案边框：中蓝色 */
  color: #1e40af; /* 正确答案文字色：深蓝色 */
}

/* 答题情况+得分 组合卡片（核心修改） */
.answer-score-card {
  background: #eff6ff; /* 卡片背景：淡蓝色 */
  border: 1px solid #dbeafe; /* 卡片边框：淡蓝色 */
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.label.user {
  color: #1e40af;
}

.label.correct {
  color: #1e40af;
}

.answer {
  border-radius: 4px;
  font-family: monospace;
  font-weight: 500;
  font-size: 1.5em;
}

.answer.incorrect {
  color: #ff0000;
}

.answer.correct {
  color: #1e40af;
}

/* 得分样式（调整为同行显示） */
.score-item {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
}

.score {
  font-size: 1.3em;
  color: #3b82f6; /* 得分色：中蓝色 */
  font-weight: bold;
}

.reason-box {
  margin: 16px 0;
  padding: 12px;
  background: #e0f2fe; /* 错误原因背景：淡蓝色 */
  border-left: 4px solid #3b82f6; /* 左侧边框：中蓝色 */
  border-radius: 4px;
  font-size: 0.95em;
  color: #1e40af; /* 错误原因文字色：深蓝色 */
}

/* 无数据状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1.2em;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08); /* 阴影：淡蓝色调 */
}

/* 底部tab栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 12px 0;
  border-top: 1px solid #dbeafe; /* 边框：淡蓝色 */
  box-shadow: 0 -2px 8px rgba(59, 130, 246, 0.05); /* 阴影：淡蓝色调 */
}

.tab-item {
  text-align: center;
  color: #64748b;
  font-size: 0.9em;
  cursor: pointer;
}

.tab-item.active {
  color: #3b82f6; /* 激活tab色：中蓝色 */
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .demo {
    height: 8vh;
  }

  .lottie-animation {
    width: 40%;
  }

  .question-nav {
    gap: 8px;
  }

  /* 移动端下答题卡片换行显示 */
  .answer-score-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .score-item {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>