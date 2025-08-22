<template>
    <div class="success-container">
      <!-- 动画组件 -->
      <div id="lottie_demo" class="lottie-animation"></div>
      
      <!-- 文字说明 -->
      <div class="text-content">
        <h2>操作成功！稍后跳转</h2>
        <p>{{mes}}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted , ref} from 'vue';
  import lottie from 'lottie-web'; // 引入 lottie-web
  import lottieJson from '@/assets/animate/success.json'; // 加载动画 JSON
  import { useRoute ,useRouter} from 'vue-router' // 引入 useRoute
  
  const route = useRoute()
  const router = useRouter()
  const dest = ref(route.query.dest || 'error')
  const mes = ref(route.query.mes || '暂无消息')
  //加载动画
  let animation = null;
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
  //进行指定界面的跳转
  const skip = ()=>{
    console.log(dest);
    router.push({name:dest.value})
  }
  onMounted(() => {
    initLottie()
    setTimeout(() => {
    skip();
    }, 4000); 
  })
  </script>
  
  <style scoped>
  .success-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh; /* 确保容器高度占满整个视窗 */
    text-align: center;
  }
  
  .lottie-animation {
    height: 20vh;
    width: 30vh;
    margin-bottom: 20px; /* 给文字留出空间 */
  }
  
  .text-content h2 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }
  
  .text-content p {
    font-size: 16px;
    color: #666;
  }
  </style>