<template>
    <div class="chat-wrapper">
      <!-- 聊天容器 -->
      <div id="coze-chat-container" class="coze-app-sdk"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, onUnmounted } from 'vue'
  
  const BOT_ID = '7544370935449714726'
  const TOKEN = 'pat_lKsvod0i9jo321aP9C3VxMBgdxeS9IlokVWMeO003bkl0ickLDNTjHhI2AqmCMDs'
  
  let cozeClient = null
  
  onMounted(() => {
    // 动态加载 Coze SDK
    const script = document.createElement('script')
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js'
    script.async = true
    script.onload = () => {
      if (window.CozeWebSDK) {
        cozeClient = new window.CozeWebSDK.WebChatClient({
          config: {
            bot_id: BOT_ID,
          },
          componentProps: {
            title: '智能答疑助手',
            el: '#coze-chat-container', // 指定容器
            showFloatingButton: false, // 关闭浮动按钮
            autoOpen: true, // 尝试自动打开
            theme: 'light',
            lang: 'zh-CN',
            className: 'coze-app-sdk',
            userInfo: {
              url: 'https://example.com/avatars/user123.png',
              nickname: '小明',
              id: 'user_123456'
            }
          },
          auth: {
            type: 'token',
            token: TOKEN,
            onRefreshToken: () => TOKEN,
          }
        })
  
        // ⭐️ 关键：手动调用 open() 强制打开聊天窗口
        setTimeout(() => {
          if (cozeClient && cozeClient.open) {
            cozeClient.open()
          }
        }, 100)
      } else {
        console.error('Coze SDK 加载失败')
      }
    }
    document.head.appendChild(script)
  })
  
  onUnmounted(() => {
    if (cozeClient && cozeClient.destroy) {
      cozeClient.destroy()
    }
  })
  </script>
  
  <style scoped>
  .chat-wrapper {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
  }
  
  .coze-app-sdk {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background-color: white;
  }
  </style>