<template>
    <!-- 隐藏容器，仅用于挂载 Coze SDK -->
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
        bottomSafeArea: 80, // 避开底部导航栏（10vh ≈ 80px）
        maxRetries: 10,     // 最大重试次数
        retryCount: 0,      // 当前重试次数
        retryInterval: 500  // 重试间隔（ms）
      }
    },
    mounted() {
      this.initSDK()
    },
    beforeUnmount() {
      this.destroy()
    },
    methods: {
      // 初始化 SDK（带轮询等待）
      initSDK() {
        const waitForSDK = () => {
          if (typeof CozeWebSDK !== 'undefined') {
            this.createClient()
          } else {
            this.retryCount++
            if (this.retryCount < this.maxRetries) {
              console.warn(`[CozeChatBot] SDK 未加载，第 ${this.retryCount} 次重试...`)
              setTimeout(waitForSDK, this.retryInterval)
            } else {
              console.error('Coze Web SDK 加载失败，请检查 CDN 是否正确引入')
            }
          }
        }
  
        waitForSDK()
      },
  
      // 创建 ChatClient 实例
      createClient() {
        try {
          this.client = new CozeWebSDK.WebChatClient({
            config: {
              type: 'bot',
              bot_id: '7544370935449714726', // ✅ 替换为你的 Bot ID
              isIframe: false,
            },
            auth: {
              type: 'token',
              token: 'pat_MzeJ5W6eCKepZeIXcAhNVmURHIBNqDCH8xRiYz1Hix7JC64sewGLU6hUGlTFa2HF', // ✅ 替换为你的 PAT Token
              onRefreshToken: async () => {
                console.log('Token 即将过期，可在此调用后端刷新')
                return 'new-token-if-expired' // 实际项目中替换为真实刷新逻辑
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
  
          // ✅ 确保 render 是函数再调用
          if (this.client && typeof this.client.render === 'function') {
            this.client.render(this.$refs.chatContainer)
            this.$nextTick(() => {
              setTimeout(() => {
                this.makeButtonDraggable()
              }, 800) // 延迟更久，确保 SDK 渲染完成
            })
          } else {
            console.error('Coze WebChatClient 初始化失败：render 方法不存在')
          }
  
        } catch (error) {
          console.error('创建 Coze WebChatClient 时出错：', error)
        }
      },
  
      // 使悬浮按钮可拖拽
      makeButtonDraggable() {
        this.button = document.querySelector('.coze-web-sdk-assist-btn')
  
        if (!this.button) {
          console.warn('Coze 悬浮按钮未找到，可能 SDK 渲染延迟')
          return
        }
  
        // 设置 fixed 定位
        this.button.style.position = 'fixed'
        this.button.style.right = '20px !important';
        this.button.style.bottom = '120px !important';
        this.button.style.zIndex = 99999
        this.button.style.cursor = 'move'
        this.button.style.transition = 'none'
  
        // 绑定 mousedown
        this.button.addEventListener('mousedown', this.onMouseDown)
      },
  
      onMouseDown(e) {
        this.isDragging = true
        const rect = this.button.getBoundingClientRect()
        this.offsetX = e.clientX - rect.left
        this.offsetY = e.clientY - rect.top
        e.preventDefault()
  
        // 绑定到 document
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
      },
  
      onMouseMove(e) {
        if (!this.isDragging) return
        e.preventDefault()
  
        const x = e.clientX - this.offsetX
        const y = e.clientY - this.offsetY
  
        const maxX = window.innerWidth - this.button.offsetWidth
        const maxY = window.innerHeight - this.button.offsetHeight
        const minY = 0
        const minBottomY = window.innerHeight - this.bottomSafeArea - this.button.offsetHeight
  
        this.button.style.left = `${Math.max(0, Math.min(x, maxX))}px`
        this.button.style.top = `${Math.max(minY, Math.min(y, minBottomY))}px`
      },
  
      onMouseUp() {
        this.isDragging = false
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
      },
  
      // 销毁资源
      destroy() {
        // 1. 销毁 SDK
        if (this.client && typeof this.client.destroy === 'function') {
          this.client.destroy()
        }
  
        // 2. 移除按钮事件
        if (this.button && this.onMouseDown) {
          this.button.removeEventListener('mousedown', this.onMouseDown)
        }
  
        // 3. 移除 document 上的事件（防止残留）
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
  
        // 4. 清理引用
        this.button = null
        this.client = null
      }
    }
  }
  </script>
  
  <style scoped>
  #coze-chat-container {
    display: none;
  }
 
  </style>