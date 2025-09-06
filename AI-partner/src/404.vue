<template>
    <div class="error-page">
      <!-- Lottie 动画容器 -->
      <div id="lottie_demo" class="lottie-container"></div>
  
      <!-- 错误文字 -->
      <div class="error-text">
        <h1>404</h1>
        <p>页面不存在</p>
        <span>您访问的页面走丢了～</span>
      </div>
  
      <!-- 可选：返回首页按钮 -->
      <button class="back-home-btn" @click="goHome">返回首页</button>
    </div>
  </template>
  
  <script setup>
  import { onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import lottieJson from '@/assets/animate/404.json'
  import lottie from 'lottie-web'
  
  const router = useRouter()
  
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
  
  onMounted(() => {
    initLottie()
  })
  
  onUnmounted(() => {
    if (animation) {
      animation.destroy()
      animation = null
    }
  })
  
  // 返回首页
  const goHome = () => {
    router.push('/home')
  }
  </script>
  
  <style scoped>
  .error-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  }
  
  /* Lottie 动画大小控制 */
  .lottie-container {
    width: 80vw;
    height: 70vh;
    max-width: 500px; /* 限制最大宽度，适配小屏 */
    max-height: 300px;
  }
  
  .error-text h1 {
    font-size: 3rem;
    color: #4a6fa5;
    margin: 0;
    font-weight: bold;
  }
  
  .error-text p {
    font-size: 1.2rem;
    color: #666;
    margin: 10px 0 5px;
  }
  
  .error-text span {
    font-size: 0.95rem;
    color: #999;
  }
  
  .back-home-btn {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 1rem;
    color: #fff;
    background-color: #4a6fa5;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .back-home-btn:hover {
    background-color: #3a5a80;
  }
  </style>