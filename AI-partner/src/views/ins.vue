<template>
  <div id="app">
    <div class="container">
      <header>
        <h1>二维码读取器</h1>
        <p class="subtitle">将二维码对准摄像头进行扫描</p>
      </header>
      
      <main class="content">
        <!-- 摄像头视图 -->
        <div class="camera-container">
          <video 
            ref="videoElement" 
            :class="{ 'active': isCameraActive }" 
            autoplay 
            playsinline
          ></video>
          <div class="scan-area" v-if="isCameraActive">
            <div class="scan-line"></div>
          </div>
        </div>
        
        <!-- 状态提示 -->
        <div class="status" :class="statusClass" v-if="statusMessage">
          {{ statusMessage }}
        </div>
        
        <!-- 控制按钮 -->
        <div class="controls">
          <button class="btn-primary" @click="startCamera" :disabled="isCameraActive">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
            </svg>
            启动摄像头
          </button>
          <button class="btn-secondary" @click="stopCamera" :disabled="!isCameraActive">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
            </svg>
            停止摄像头
          </button>
        </div>
        
        <!-- 扫描结果 -->
        <div class="result-container" v-if="qrResult">
          <div class="result-title">扫描结果</div>
          <div class="result-content">{{ qrResult }}</div>
          <div class="result-actions">
            <button class="btn-copy" @click="copyToClipboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
              复制内容
            </button>
          </div>
        </div>
        
        <!-- 使用说明 -->
        <div class="instructions">
          <h3>使用说明</h3>
          <ol>
            <li>点击"启动摄像头"按钮，允许浏览器访问您的摄像头</li>
            <li>将二维码对准扫描框，保持稳定</li>
            <li>系统将自动识别二维码内容并显示在下方</li>
            <li>扫描完成后，可点击"停止摄像头"关闭摄像头</li>
            <li>点击"复制内容"可以将扫描结果复制到剪贴板</li>
          </ol>
        </div>
      </main>
      
      <footer>
        <p>二维码读取器 &copy; 2023</p>
      </footer>
    </div>
  </div>
</template>

<script>
// 引入jsQR库
import jsQR from 'jsqr'

export default {
  name: 'QRScanner',
  data() {
    return {
      isCameraActive: false,
      qrResult: '',
      statusMessage: '请点击"启动摄像头"开始扫描二维码',
      statusClass: 'info',
      videoStream: null,
      canvasElement: null,
      canvasContext: null,
      scanInterval: null
    }
  },
  mounted() {
    this.canvasElement = document.createElement('canvas')
    this.canvasContext = this.canvasElement.getContext('2d')
  },
  methods: {
    async startCamera() {
      try {
        // 请求摄像头访问权限
        this.videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        
        const video = this.$refs.videoElement
        video.srcObject = this.videoStream
        
        // 等待视频准备就绪
        video.onloadedmetadata = () => {
          this.isCameraActive = true
          this.statusMessage = '摄像头已启动，请将二维码对准扫描框'
          this.statusClass = 'info'
          this.qrResult = ''
          this.startScanning()
        }
      } catch (error) {
        console.error('无法访问摄像头:', error)
        this.statusMessage = '无法访问摄像头，请确保已授予摄像头权限'
        this.statusClass = 'error'
      }
    },
    
    stopCamera() {
      if (this.videoStream) {
        this.videoStream.getTracks().forEach(track => track.stop())
        this.videoStream = null
      }
      
      this.isCameraActive = false
      this.statusMessage = '摄像头已关闭'
      this.statusClass = 'info'
      
      if (this.scanInterval) {
        clearInterval(this.scanInterval)
        this.scanInterval = null
      }
    },
    
    startScanning() {
      const video = this.$refs.videoElement
      
      // 设置扫描间隔
      this.scanInterval = setInterval(() => {
        if (!this.isCameraActive || video.readyState !== video.HAVE_ENOUGH_DATA) return
        
        // 设置canvas尺寸与视频相同
        this.canvasElement.width = video.videoWidth
        this.canvasElement.height = video.videoHeight
        
        // 将视频帧绘制到canvas上
        this.canvasContext.drawImage(video, 0, 0, this.canvasElement.width, this.canvasElement.height)
        
        // 获取图像数据
        const imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height)
        
        // 使用jsQR解析二维码
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })
        
        // 如果找到二维码
        if (code) {
          this.qrResult = code.data
          this.statusMessage = '二维码识别成功！'
          this.statusClass = 'success'
        }
      }, 500) // 每500毫秒扫描一次
    },
    
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.qrResult)
        alert('内容已复制到剪贴板！')
      } catch (err) {
        console.error('复制失败:', err)
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = this.qrResult
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('内容已复制到剪贴板！')
      }
    }
  },
  beforeDestroy() {
    this.stopCamera()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

body {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

header {
  background: linear-gradient(to right, #4776E6, #8E54E9);
  color: white;
  padding: 25px;
  text-align: center;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.content {
  padding: 30px;
}

/* 摄像头容器 */
.camera-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

video {
  width: 100%;
  display: block;
  background-color: #000;
  transition: all 0.3s ease;
}

.scan-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border: 2px solid #4776E6;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, transparent, #4776E6, transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}

/* 状态提示 */
.status {
  text-align: center;
  padding: 15px;
  margin: 20px 0;
  border-radius: 8px;
  font-weight: 500;
}

.status.success {
  background-color: #e6f7ee;
  color: #0d8050;
  border: 1px solid #b3e6ce;
}

.status.error {
  background-color: #fde8e8;
  color: #c53030;
  border: 1px solid #f5c6cb;
}

.status.info {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

/* 控制按钮 */
.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

button {
  padding: 12px 25px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(to right, #4776E6, #8E54E9);
  color: white;
  box-shadow: 0 4px 10px rgba(71, 118, 230, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(71, 118, 230, 0.5);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f2f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e4e6e9;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 结果容器 */
.result-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.result-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.result-content {
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  border-left: 4px solid #4776E6;
  word-break: break-all;
  font-family: monospace;
  margin-bottom: 15px;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-copy {
  padding: 8px 16px;
  background: #4776E6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s ease;
}

.btn-copy:hover {
  background: #3a65cc;
}

/* 使用说明 */
.instructions {
  background-color: #f0f7ff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
}

.instructions h3 {
  color: #4776E6;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.instructions ol {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 10px;
  line-height: 1.5;
}

footer {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .content {
    padding: 20px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .controls {
    flex-direction: column;
  }
  
  button {
    width: 100%;
  }
}
</style>