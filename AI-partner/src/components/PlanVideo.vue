<template>
    <div class="video-player-container">
      <!-- B站视频播放器 -->
      <iframe
        v-if="bvid"
        :src="`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1`"
        style="width: 100%; height: 500px; border: none;"
        allowfullscreen
        allow="autoplay"
        ref="videoPlayer"
      ></iframe>
  
      <!-- 学习时长显示 -->
      <div class="study-timer">
        已学习：<span>{{ formatTime(totalDuration) }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const bvid = route.query.bvid
  
  // 计时相关
  const totalDuration = ref(0)
  const timer = ref(null)
  
  // 格式化时间：秒 -> "X分Y秒"
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}分${sec}秒`
  }
  
  // 启动计时器
  const startTimer = () => {
    console.log('✅ 页面已打开，开始学习计时')
    if (timer.value) return // 防止重复启动
  
    timer.value = setInterval(() => {
      totalDuration.value += 1
    }, 1000)
  }
  
  // 停止计时器，并打印最终学习时间
  const stopTimer = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
      console.log('⏹️ 计时结束，总学习时间:', formatTime(totalDuration.value))
    }
  }
  
  // 页面加载完成：开始计时
  onMounted(() => {
    console.log('🎯 当前播放视频 BV号:', bvid)
    startTimer()
  
    // 监听页面即将卸载（刷新、关闭、跳转）
    const handleBeforeUnload = () => {
      stopTimer()
    }
  
    window.addEventListener('beforeunload', handleBeforeUnload)
  
    // Vue 组件卸载时也清理（路由跳转）
    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      stopTimer()
    })
  })
  </script>
  
  <style scoped>
  .video-player-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .study-timer {
    margin-top: 16px;
    font-size: 16px;
    color: #333;
  }
  </style>