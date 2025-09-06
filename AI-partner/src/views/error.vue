<script setup>
import { ref, onMounted } from 'vue'
import lottieJson from '../assets/animate/数据师.json'
import lottie from 'lottie-web'
import { CaptureErrors } from '@/api_py/error'
// 模拟数据（你可以通过 API 获取）
const errorQuestions = ref([])

// 格式化时间（去掉时区部分，只保留年月日时分）
const formatTime = (timeStr) => {
  return timeStr?.split(' +')[0] || '未知时间'
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
 //获取错题
 const geData = async() =>{
  let username = localStorage.getItem("username")
  const res = await CaptureErrors(username)
  console.log(res);
  errorQuestions.value = res.output
 }
 //初始化函数
 onMounted(()=>{
  initLottie()
  geData()
 })

</script>

<template>
  <div class="error-questions-container">
    <header class="page-header">
      <div class="deom">
        <div id="lottie_demo" class="lottie-animation"></div>
        <h1> 错题本</h1>
      </div>
    </header>

    <main class="questions-list">
      <div
        v-for="(item, index) in errorQuestions"
        :key="index"
        class="question-card"
      >
        <div class="question-header">
          <span class="index-badge">{{ index + 1 }}</span>
          <span class="time">{{ formatTime(item.create_time) }}</span>
        </div>

        <div class="question-content">
          <p class="question-text"><strong>问题：</strong>{{ item.question }}</p>

          <div class="answer-section">
            <p class="user-answer">
              <strong class="label user">你的答案：</strong>
              <span :class="['answer', item.user_answer === item.correct_answer ? 'correct' : 'incorrect']">
                {{ item.user_answer }}
              </span>
            </p>

            <p class="correct-answer">
              <strong class="label correct">正确答案：</strong>
              <span class="answer correct">{{ item.correct_answer }}</span>
            </p>
          </div>

          <div class="reason-box">
            <strong>❌ 错误原因：</strong>
            <span>{{ item.error_reason }}</span>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-if="errorQuestions.length === 0" class="empty-state">
        <p>🎉 暂无错题，继续保持！</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.deom{
  display: flex;
  flex-direction: row;
  height: 10vh;
  align-items: center; 
  justify-content: center;
}
.lottie-animation{
  width: 30%;
  height: 100%;
}
.error-questions-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f9fafa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.2em;
  color: #4a6fa5;
  margin: 0;
}

.welcome {
  color: #666;
  font-size: 1.1em;
  margin-top: 8px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.question-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.question-header {
  background: #eef2f8;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dde2e8;
}

.index-badge {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #4a6fa5;
  color: white;
  border-radius: 50%;
  font-size: 0.9em;
  font-weight: bold;
}

.time {
  font-size: 0.9em;
  color: #777;
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

.answer-section {
  margin: 12px 0;
}

.label {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.label.user {
  background: #ffeaea;
  color: #d9534f;
}

.label.correct {
  background: #e6f7e6;
  color: #4caf50;
}

.answer {
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: 500;
}

.answer.incorrect {
  background: #ffeaea;
  color: #d9534f;
}

.answer.correct {
  background: #e6f7e6;
  color: #4caf50;
}

.reason-box {
  margin-top: 14px;
  padding: 12px;
  background: #fff4e6;
  border-left: 4px solid #ffa726;
  border-radius: 4px;
  font-size: 0.95em;
  color: #e65100;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
  font-size: 1.2em;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>