<template>
  <div class="ai-buddy-page">
    <div class="header">
      <div class="title">智能AI学习搭子</div>
      <div class="subtitle">你的智能学习同伴 · 随时随地陪练与答疑</div>
    </div>

    <Carousel autoplay class="hero" effect="fade" dots>
      <div class="hero-slide" v-for="(it, idx) in slides" :key="idx">
        <div :id="it.id" class="lottie" style="height: 160px;"></div>
        <div class="hero-text">
          <strong>{{ it.title }}</strong>
          <div>{{ it.desc }}</div>
        </div>
      </div>
    </Carousel>

    <div class="section-title">
      <span class="icon">📚</span>
      <span class="text">功能区</span>
    </div>

    <div class="function">
      <div class="item" @click="open('practice')">
        <img src="../assets/单词.png" />
        <div class="text">随堂练习</div>
      </div>
      <div class="item" @click="open('qna')">
        <img src="../assets/问答库.png" />
        <div class="text">智能答疑</div>
      </div>
      <div class="item" @click="open('plan')">
        <img src="../assets/人脸数据分析.png" />
        <div class="text">学习规划</div>
      </div>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-title">学习记录</div>
        <div class="card-body">自动记录练习与答疑历史，帮你追踪成长。</div>
      </div>
      <div class="card">
        <div class="card-title">错题分析</div>
        <div class="card-body">汇总错题并给出针对性训练建议。</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Carousel } from 'ant-design-vue'
import lottie from 'lottie-web'
import lottieJson from '@/assets/animate/答疑.json'
import lottieJson1 from '@/assets/animate/进度分析.json'
import { onMounted, onUnmounted, reactive } from 'vue'

const slides = reactive([
  { id: 'ai_lottie_0', title: '智能答疑', desc: '随时解答你的学习疑问', json: lottieJson },
  { id: 'ai_lottie_1', title: '进度追踪', desc: '可视化学习路径与目标', json: lottieJson1 },
])

function initLottie(item) {
  const container = document.getElementById(item.id)
  if (!container) return
  if (item.animation) item.animation.destroy()
  item.animation = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: item.json,
  })
}

onMounted(() => {
  slides.forEach(initLottie)
})
onUnmounted(() => {
  slides.forEach((s) => s.animation && s.animation.destroy())
})

const open = (name) => {
  // 占位：可以接入具体路由或方法
  console.log('open', name)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
.ai-buddy-page{ padding: 12px; font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.header{ text-align: center; padding: 10px 0; }
.header .title{ font-size: 20px; font-weight: 700; color: #1e90ff; }
.header .subtitle{ font-size: 12px; color: #666; margin-top: 6px }
.hero{ margin: 12px 0 }
.hero-slide{ display:flex; flex-direction: column; align-items: center; justify-content: center }
.hero-text{ text-align: center; margin-top: 8px }
.section-title{ display:flex; align-items:center; gap:10px; margin: 10px 0 }
.function{ display:flex; justify-content: space-around; padding: 0 10px }
.function .item{ display:flex; flex-direction: column; align-items:center; gap:6px }
.function img{ height: 48px }
.cards{ display:flex; gap: 10px; margin-top: 12px }
.card{ flex:1; background: linear-gradient(180deg,#fff,#f5f8ff); padding: 12px; border-radius: 10px; box-shadow:0 6px 16px rgba(30,144,255,0.08) }
.card-title{ font-weight:600; color:#333 }
.card-body{ font-size:12px; color:#666; margin-top:8px }

@media (max-width:768px){ .function img{ height:40px } }
</style>
