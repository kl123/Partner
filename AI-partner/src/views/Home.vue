<template>
  <div class="app-container">
    <!-- 顶部栏 -->
    <header class="top-bar">
      <div class="left-icon">
        <img class="icon-notice" src="../assets/消息.png" alt="通知" />
        <span>通知</span>
      </div>
      <div class="right-icon">
        <img class="icon-camera" src="../assets/相机.png" alt="相机" />
        <span>拍照上传</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <h1>DAILY PRACTISE</h1>
      <div class="card-group" >
        <!-- 计划制定卡片 -->
        <div class="card plan-card" >
          <img src="../assets/书包.png" alt="计划制定" class="card-icon" />
          <h3>计划制定</h3>
          <p>为你定制今日学习计划，确定学习目标，增强学习动力，提高学习效率...</p>
          <button class="card-btn" @click="into('customization')">去制定</button>
        </div>

        <!-- 每日一句卡片 -->
        <div class="card sentence-card">
          <img src="../assets/闹钟.png" alt="每日一句" class="card-icon2" />
          <h3>每日一句</h3>
          <p>那些看似不起波澜的日复一日，会突然在某一天让人看到坚持的意义。</p>
          <div class="like-group">
            <img class="icon-heart" src="../assets/爱心.png" alt="点赞" />
            <img class="icon-star" src="../assets/五角星.png" alt="收藏" />
            <img class="icon-bookmark" src="../assets/书签.png" alt="书签" />
          </div>
          <button class="card-btn2">去学习</button>

        </div>
      </div>

      <!-- 功能图标区 -->
      <div class="function-grid">
        <div class="function-item" @click="into('ai')">
          <img class="icon-assistant" src="../assets/1.png" alt="小智助手" />
          <span>小智助手</span>
        </div>
        <div class="function-item" @click="into('camera')">
          <img class="icon-wordbook" src="../assets/2.png" alt="单词宝典" />
          <span>监测中心</span>
        </div>
        <div class="function-item" @click="into('question')">
          <img class="icon-qa" src="../assets/3.png" alt="智能答疑" />
          <span>智能答疑</span>
        </div>
        <div class="function-item">
          <img class="icon-analysis" src="../assets/4.png" alt="就业分析" />
          <span>课程表</span>
        </div>
        <div class="function-item" @click="into('test')">
          <img class="icon-test" src="../assets/5.png" alt="测试生成" />
          <span>测试生成</span>
        </div>
        <div class="function-item">
          <img class="icon-warning" src="../assets/6.png" alt="风险预知" />
          <span>风险预知</span>
        </div>
      </div>

      <!-- 日程区 -->
      <div class="schedule-section">
        <h2>MY SCHEDUAL</h2>
        <div class="todo-list">
          <h3>To Do List</h3>
          <ul v-for="item in List">
            <li>
              <i class="icon-check"></i>
              <span>{{item.title}}</span>
            </li>
            <!-- <li>
              <i class="icon-check"></i>
              <span>微积分</span>
            </li>
            <li>
              <i class="icon-check"></i>
              <span>中国共产党史</span>
            </li> -->
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPlan } from "@/api/Study"

const router = useRouter()
const count = ref(0)
const List = ref([])
const into = (name) => {
    router.push({ name })
}
async function Plans() {
  const res = await getPlan()
  List.value=res.data
  console.log(res);
}
onMounted(()=>{
  Plans()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0e6fa, #e0f0fa);
  font-family: 'Arial', sans-serif;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  align-items: center;
}

.left-icon, .right-icon {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.icon-assistant, .icon-wordbook, .icon-qa, .icon-analysis, .icon-test, .icon-warning, .icon-check, .icon-home, .icon-progress, .icon-ai, .icon-mine {
  width: 50px;
  margin-right: 8px;
}

.icon-heart, .icon-star, .icon-bookmark{
  width: 12px;
  height: 12px;
}
.icon-notice, .icon-camera{
  width: 30px;
  height: 30px;
}

.main-content {
  padding: 0 16px;
}

h1, h2, h3 {
  font-weight: bold;
}

h1 {
  font-size: 28px;
  margin-bottom: 24px;
}

.card-group {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.plan-card {
  background-color: rgba(230, 214, 250, 0.8);
}

.sentence-card {
  background-color: rgba(224, 240, 250, 0.8);
}

.card-icon {
  width: 64px;
  height: 65px;
  margin-bottom: 9px;
  margin-top: 6px;
}
.card-icon2 {
  width: 64px;
  height: 80px;
}
.card-btn {
  background-color: #b898e6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 8px;
}

.sentence-card .card-btn {
  background-color: #98c9e6;
}

.card-btn2 {
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 15px;
  background-color: #98c9e6;
}

.like-group {
  display: flex;
  gap: 8px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background-color: rgba(224, 240, 250, 0.8);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 32px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}

.schedule-section h2 {
  font-size: 24px;
  margin-bottom: 16px;
}

.todo-list {
  text-align: center;
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 8px rgba(0, 0, 0, 0.1);
}
.todo-list h3 {
  font-size: 25px;
}
.todo-list ul {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #9848e6;
  color: #fff;
  border: none;
  font-size: 24px;
  cursor: pointer;
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>