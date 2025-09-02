<template>
    <!-- 隐藏容器，仅用于挂载 SDK -->
    <div ref="chatContainer" id="coze-chat-container" style="display: none;"></div>
  </template>
  
  <script>
  export default {
    name: 'CozeChatBot',
    data() {
      return {
        client: null,
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        button: null,
        bottomSafeArea: 80 // 留出底部导航栏空间（单位：px）
      }
    },
    mounted() {
      // 确保 SDK 已加载
      if (typeof CozeWebSDK === 'undefined') {
        console.error('Coze Web SDK 未加载，请检查 CDN 是否正确引入')
        return
      }
  
      // 初始化 ChatClient
      this.client = new CozeWebSDK.WebChatClient({
        config: {
          type: 'bot',
          bot_id: '7544370935449714726', // 替换为你的 Bot ID
          isIframe: false,
        },
        auth: {
          type: 'token',
          token: 'pat_MzeJ5W6eCKepZeIXcAhNVmURHIBNqDCH8xRiYz1Hix7JC64sewGLU6hUGlTFa2HF', // 替换为你的 PAT Token
          onRefreshToken: async () => {
            return 'new-token-if-expired' // 实际项目中可调用后端刷新
          }
        },
        userInfo: {
          id: 'user',
          url: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png',
          nickname: 'User',
        },
        ui: {
          base: {
            icon: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/chatsdk-logo.png',
            layout: 'pc',
            lang: 'zh-CN',
            zIndex: 9999
          },
          header: {
            isShow: true,
            isNeedClose: true,
          },
          asstBtn: {
            isNeed: true // 显示悬浮按钮
          },
          footer: {
            isShow: true,
            expressionText: 'Powered by Coze',
          },
          chatBot: {
            title: '答疑小助手',
            uploadable: true,
            width: 390
          },
        },
      })
  
      // 渲染到容器（异步）
      this.client.render(this.$refs.chatContainer)
  
      // 延迟查找按钮（等待 SDK 渲染）
      this.$nextTick(() => {
        setTimeout(() => {
          this.makeButtonDraggable()
        }, 600)
      })
    },
    methods: {
      makeButtonDraggable() {
        this.button = document.querySelector('.coze-web-sdk-assist-btn')
  
        if (!this.button) {
          console.warn('Coze 悬浮按钮未找到，可能渲染延迟')
          return
        }
  
        // 设置按钮为 fixed 定位，脱离文档流
        this.button.style.position = 'fixed'
        this.button.style.right = '20px'
        this.button.style.bottom = '200px' // 高于底部导航栏（10vh ≈ 80px）
        this.button.style.zIndex = 99999
        this.button.style.cursor = 'move'
        this.button.style.transition = 'none' // 拖拽时禁用动画避免卡顿
  
        // 绑定鼠标事件
        this.button.addEventListener('mousedown', this.onMouseDown)
      },
      onMouseDown(e) {
        this.isDragging = true
        const rect = this.button.getBoundingClientRect()
        this.offsetX = e.clientX - rect.left
        this.offsetY = e.clientY - rect.top
  
        // 防止选中文本
        e.preventDefault()
  
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
      },
      onMouseMove(e) {
        if (!this.isDragging) return
  
        const x = e.clientX - this.offsetX
        const y = e.clientY - this.offsetY
  
        // 限制拖拽范围
        const maxX = window.innerWidth - this.button.offsetWidth
        const maxY = window.innerHeight - this.button.offsetHeight
  
        // 限制不能挡住底部导航栏
        const minY = 0
        const minBottomY = window.innerHeight - this.bottomSafeArea - this.button.offsetHeight
  
        this.button.style.left = `${Math.max(0, Math.min(x, maxX))}px`
        this.button.style.top = `${Math.max(minY, Math.min(y, minBottomY))}px`
      },
      onMouseUp() {
        this.isDragging = false
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
      }
    },
    beforeUnmount() {
      // 销毁 SDK
      if (this.client && typeof this.client.destroy === 'function') {
        this.client.destroy()
      }
  
      // 移除事件监听
      if (this.button) {
        this.button.removeEventListener('mousedown', this.onMouseDown)
      }
    }
  }
  </script>
  
  <style scoped>
  /* 容器隐藏，不占空间 */
  #coze-chat-container {
    display: none;
  }
  </style>