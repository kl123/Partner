<template>
  <div class="chat-wrapper">
    <!-- 聊天容器 -->
    <div id="coze-chat-container" class="coze-app-sdk"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const BOT_ID = '7573347874675818532'
const TOKEN = 'pat_lKsvod0i9jo321aP9C3VxMBgdxeS9IlokVWMeO003bkl0ickLDNTjHhI2AqmCMDs'

let cozeClient = null
const initialMessage = '我叫 zhangsan'

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
          theme: 'light',
          lang: 'zh-CN',
          className: 'coze-app-sdk',
          userInfo: {
            url: 'https://example.com/avatars/user123.png',
            id: 'user_123456'
          }
        },
        auth: {
          type: 'token',
          token: TOKEN,
          onRefreshToken: () => TOKEN,
        }
      })

      // 🚀 等待 SDK 渲染完成，再点击图标并模拟输入
      setTimeout(() => {
        const logoImg = document.querySelector('.ab1ac9d9bab12da47298.bc81871a44ea566dd738 img')
        console.log('logoImg:', logoImg)
        if (logoImg) {
          logoImg.click() // 模拟点击
        } else {
          console.warn('未找到 Coze 图标，尝试使用 open() 方法')
          if (cozeClient && cozeClient.open) {
            cozeClient.open()
          }
        }

      }, 500)
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