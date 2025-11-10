<template>
  <div class="page">
    <!-- 画布容器 -->
    <div class="canvas-container" ref="container">
      <canvas ref="canvas"></canvas>
      
      <!-- 左侧控制面板 -->
      <div class="floating-controls left-controls" v-if="model">
        <div class="control-group">
          <!-- <div class="control-label">模型控制</div> -->
          <button class="control-btn" @click="switchModel" title="切换模型">
            <span class="btn-icon">↻</span>
          </button>
          <button class="control-btn" @click="centerModel" title="居中显示">
            <span class="btn-icon">◎</span>
          </button>
          <button class="control-btn" @click="resetScale" title="重置大小">
            <span class="btn-icon">↺</span>
          </button>
          <input
              type="file"
              ref="fileInput"
              accept=".wav,.mp3,.ogg"
              @change="handleFileSelect"
              style="display: none"
            />
            <button class="control-btn" @click="selectAudioFile" title="选择音频文件">
              <span class="btn-icon">📁</span>
            </button>
            <button 
              class="control-btn" 
              :class="{ 'recording': isRecording }"
              @click="toggleRecording"
              :title="isRecording ? '停止录音' : '开始录音'"
            >
              <span class="btn-icon">{{ isRecording ? '⏹️' : '🎤' }}</span>
            </button>
            <button 
              class="control-btn" 
              @click="togglePlayback"
              :disabled="!currentAudioBuffer"
              :title="isPlaying ? '暂停播放' : '播放音频'"
            >
              <span class="btn-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
            </button>
        </div>
      </div>

      <!-- 右侧控制面板 -->
      <div class="floating-controls right-controls" v-if="model">
        <div class="control-group">
          <!-- <div class="control-label">缩放控制</div> -->
          <button class="control-btn" @click="adjustScale(5)" title="放大">
            <span class="btn-icon">+</span>
          </button>
          <div class="scale-display">
            <span class="percentage">{{ Math.round(currentScale * 100) }}%</span>
          </div>
          <button class="control-btn" @click="adjustScale(-5)" title="缩小">
            <span class="btn-icon">−</span>
          </button>
        </div>
      </div>

      <div v-if="!model" class="loading">
        <div class="loading-spinner"></div>
        <p>模型加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount ,watch} from 'vue'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import * as PIXI from 'pixi.js'

const canvas = ref(null)
const container = ref(null)
const waveformCanvas = ref(null)
const fileInput = ref(null)
let app = null
let model = ref(null)
let currentScale = ref(0.2) // 初始缩放20%
// 添加调试变量
const lastEnergy = ref(0)
const debugMode = ref(true)
// 音频相关状态
const isRecording = ref(false)
const isPlaying = ref(false)
const currentAudioBuffer = ref(null)
const audioDuration = ref(0)
const currentTime = ref(0)
const audioContext = ref(null)
const audioSource = ref(null)
const analyser = ref(null)
const animationFrame = ref(null)

// 嘴型参数
const mouthOpenness = ref(0)
const mouthMovement = ref(0)

// 配置参数
const config = {
  maxScale: 1.5,
  minScale: 0.1,
  baseScale: 0.2,
  padding: 20,
  mouthSensitivity: 1.5, // 嘴型敏感度
  mouthSmoothing: 0.8    // 嘴型平滑度
}
// 初始化音频上下文
const initAudioContext = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    analyser.value = audioContext.value.createAnalyser()
    analyser.value.fftSize = 256
    analyser.value.smoothingTimeConstant = 0.8
  }
}

// 选择音频文件
const selectAudioFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    loadAudioFile(file)
  }
}

// 加载音频文件
const loadAudioFile = (file) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      initAudioContext()
      const audioData = e.target.result
      const buffer = await audioContext.value.decodeAudioData(audioData)
      currentAudioBuffer.value = buffer
      audioDuration.value = buffer.duration
      setupWaveform()
    } catch (error) {
      console.error('加载音频文件失败:', error)
    }
  }
  reader.readAsArrayBuffer(file)
}

// 设置波形显示
const setupWaveform = () => {
  if (!waveformCanvas.value || !currentAudioBuffer.value) return

  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // 绘制波形
  const data = currentAudioBuffer.value.getChannelData(0)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 2
  ctx.beginPath()

  const sliceWidth = width / data.length
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const y = (data[i] * height / 2) + height / 2
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  }

  ctx.stroke()
}

// 播放音频
const playAudio = () => {
  if (!currentAudioBuffer.value || !audioContext.value) return

  stopAudio()

  audioSource.value = audioContext.value.createBufferSource()
  audioSource.value.buffer = currentAudioBuffer.value

  // 连接分析器
  audioSource.value.connect(analyser.value)
  analyser.value.connect(audioContext.value.destination)

  // 设置播放事件
  audioSource.value.onended = () => {
    isPlaying.value = false
    currentTime.value = 0
    cancelAnimationFrame(animationFrame.value)
    mouthOpenness.value = 0
    updateMouthShape()
  }

  audioSource.value.start(0)
  isPlaying.value = true
  startAudioAnalysis()
}

// 停止音频
const stopAudio = () => {
  if (audioSource.value) {
    try {
      audioSource.value.stop()
      audioSource.value.disconnect()
    } catch (error) {
      console.error('停止音频时出错:', error)
    }
    audioSource.value = null
  }
  isPlaying.value = false
  currentTime.value = 0
  cancelAnimationFrame(animationFrame.value)
}

// 开始音频分析
const startAudioAnalysis = () => {
  const dataArray = new Uint8Array(analyser.value.frequencyBinCount)

  const analyze = () => {
    if (!isPlaying.value) return

    analyser.value.getByteFrequencyData(dataArray)
    
    // 计算音频能量（主要在中高频范围）
    let energy = 0
    for (let i = 10; i < 50; i++) {
      energy += dataArray[i]
    }
    energy = energy / 40 / 128 // 归一化到 0-1

    // 平滑嘴型变化
    mouthMovement.value = Math.max(0, Math.min(1, energy * config.mouthSensitivity))
    mouthOpenness.value = mouthOpenness.value * config.mouthSmoothing + 
                         mouthMovement.value * (1 - config.mouthSmoothing)

    updateMouthShape()

    // 更新当前时间
    if (audioSource.value && audioContext.value) {
      currentTime.value = audioContext.value.currentTime - audioSource.value.startTime
      if (currentTime.value >= audioDuration.value) {
        isPlaying.value = false
        return
      }
    }

    animationFrame.value = requestAnimationFrame(analyze)
  }

  analyze()
}

// 更新嘴型
const updateMouthShape = () => {
  if (!model.value) return

  // 根据嘴型开合度设置参数（不同模型参数名可能不同）
  const mouthParams = [
    'ParamMouthOpenY'    // 最常见的嘴型参数
  ]

  // 尝试设置嘴型参数
  for (const param of mouthParams) {
    if (model.value.internalModel.coreModel.getParameterIndex(param) !== -1) {
      model.value.internalModel.coreModel.setParameterValueById(
        param,
        mouthOpenness.value
      )

      console.log(`设置参数 ${param} 为 ${mouthOpenness.value}`)
      break
    }
  }
}

// 切换播放状态
const togglePlayback = () => {
  if (isPlaying.value) {
    stopAudio()
  } else {
    playAudio()
  }
}

// 录音功能（需要用户授权）
const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    initAudioContext()
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    isRecording.value = true
    // 这里可以添加录音实现
    console.log('开始录音')
  } catch (error) {
    console.error('无法访问麦克风:', error)
  }
}

const stopRecording = () => {
  isRecording.value = false
  console.log('停止录音')
}

// 时间格式化
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}


// 模型列表
const modelList = [
  './ama/model/兔兔-阿米娅.model3.json',
  // 添加更多模型路径
  './Miss Bai/Miss Bai.model3.json'
]
let currentModelIndex = ref(0)

// 获取自适应画布尺寸 - 100%背景大小
const getAdaptiveCanvasSize = () => {
  if (!container.value) return { width: 800, height: 600 }

  const containerRect = container.value.getBoundingClientRect()
  return {
    width: containerRect.width,
    height: containerRect.height
  }
}

// 调整画布大小
const resizeCanvas = () => {
  if (!app || !container.value) return

  const newSize = getAdaptiveCanvasSize()
  app.renderer.resize(newSize.width, newSize.height)
  canvas.value.style.width = `${newSize.width}px`
  canvas.value.style.height = `${newSize.height}px`
  centerModel()
}

// 模型居中显示
const centerModel = () => {
  if (!model.value || !app) return

  model.value.x = app.screen.width / 2
  model.value.y = app.screen.height / 2
  model.value.anchor.set(0.5, 0.5)
}

// 调整缩放比例
const adjustScale = (delta) => {
  if (!model.value) return

  const newScale = Math.max(
    config.minScale,
    Math.min(config.maxScale, currentScale.value + (delta / 100))
  )
  
  currentScale.value = newScale
  model.value.scale.set(newScale)
  centerModel()
}

// 重置缩放
const resetScale = () => {
  currentScale.value = config.baseScale
  if (model.value) {
    model.value.scale.set(config.baseScale)
    centerModel()
  }
}

// 切换模型
const switchModel = async () => {
  if (!app) return
  
  // 移除当前模型
  if (model.value) {
    app.stage.removeChild(model.value)
    model.value.destroy()
    model.value = null
  }
  
  // 更新模型索引
  currentModelIndex.value = (currentModelIndex.value + 1) % modelList.length
  
  try {
    // 加载新模型
    const newModel = await Live2DModel.from(modelList[currentModelIndex.value])
    model.value = newModel
    app.stage.addChild(model.value)
    
    // 重置缩放和位置
    currentScale.value = config.baseScale
    model.value.scale.set(config.baseScale)
    centerModel()
    
    console.log('模型切换完成', `当前模型: ${modelList[currentModelIndex.value]}`)
  } catch (error) {
    console.error('切换模型失败:', error)
    // 如果切换失败，尝试重新加载原始模型
    currentModelIndex.value = 0
  }
}

// 窗口大小改变处理
const handleResize = () => {
  resizeCanvas()
}

let resizeObserver = null

const handleKeyDown = (event) => {
  // 检查是否按下A键（keyCode 65）
  if (event.keyCode === 65 || event.key === 'a' || event.key === 'A') {
    // 防止浏览器默认行为
    event.preventDefault();
    
    // 触发模型切换
    switchModel();
    
    // 可选：添加视觉反馈
    document.body.classList.add('key-pressed');
    setTimeout(() => {
      document.body.classList.remove('key-pressed');
    }, 200);
  }
  else if (event.keyCode === 66 || event.key === 'b' || event.key === 'B') {
    event.preventDefault();
    adjustScale(5); // 按B键放大
  }
  else if (event.keyCode === 67 || event.key === 'c' || event.key === 'C') {
    event.preventDefault();
    adjustScale(-5); // 按C键缩小
  }
  else if (event.keyCode === 82 || event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    resetScale(); // 按R键重置大小
  }
  else if (event.keyCode === 77 || event.key === 't' || event.key === 'T') {
    model.value.internalModel.coreModel.setParameterValueById('ParamExpression11', 1);
    model.value.internalModel.coreModel.setParameterValueById('ParamExpression43', 1);
  }
  else if (event.keyCode === 78 || event.key === 'n' || event.key === 'N') {
    console.log('PIXI.live2d:', PIXI.live2d);
    console.log('Live2DCubismFramework:', typeof Live2DCubismFramework);
    console.log('CubismFramework:', typeof CubismFramework);
  }
};

onMounted(() => {
  window.PIXI = PIXI

  if (!canvas.value || !container.value) return

  const initialSize = getAdaptiveCanvasSize()

  app = new PIXI.Application({
    view: canvas.value,
    autoStart: true,
    width: initialSize.width,
    height: initialSize.height,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    backgroundAlpha: 0,
    autoDensity: true
  })

    // 初始化波形画布
  if (waveformCanvas.value) {
    waveformCanvas.value.width = 300
    waveformCanvas.value.height = 60
  }
  
  // 设置画布样式为100%
  canvas.value.style.width = `${initialSize.width}px`
  canvas.value.style.height = `${initialSize.height}px`

  // 加载初始模型
  loadInitialModel()
  
  window.addEventListener('resize', handleResize)
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container.value)

  window.addEventListener('keydown', handleKeyDown);
})

// 加载初始模型
const loadInitialModel = () => {
  Live2DModel.from(modelList[currentModelIndex.value])
    .then(loadedModel => {
      model.value = loadedModel
      app.stage.addChild(model.value)
      
      // 初始应用20%缩放
      model.value.scale.set(config.baseScale)
      centerModel()
      
      console.log('模型加载完成', 
                 `初始缩放: ${config.baseScale * 100}%`,
                 `缩放范围: ${config.minScale * 100}% - ${config.maxScale * 100}%`)
    })
    .catch(error => {
      console.error('加载 Live2D 模型失败:', error)
    })
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) resizeObserver.disconnect()
  if (model.value) model.value.destroy()
  if (app) app.destroy(true, { children: true })
  window.removeEventListener('keydown', handleKeyDown);
})
</script>

<style scoped>
.page {
  padding: 0;
  text-align: center;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: linear-gradient(135deg, #667eea 0%, #6e3ba1 100%);
  overflow: hidden;
}

/* 画布容器样式 - 100%大小 */
.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

/* 悬浮控制面板 */
.floating-controls {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
  min-width: 80px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.left-controls {
  top: 50%;
  left: 30px;
  transform: translateY(-50%);
}

.right-controls {
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
}

.floating-controls:hover {
  transform: translateY(-50%) scale(1.02);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.3);
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.control-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
  text-align: center;
}

.control-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1),
              -4px -4px 8px rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.15),
              -6px -6px 12px rgba(255, 255, 255, 0.9);
}

.control-btn:active {
  transform: translateY(1px);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1),
              -2px -2px 4px rgba(255, 255, 255, 0.8);
}

.btn-icon {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.scale-display {
  width: 70px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  font-weight: 700;
  margin: 5px 0;
}

.percentage {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.95rem;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-controls {
    padding: 15px;
    min-width: 70px;
  }
  
  .left-controls {
    left: 15px;
  }
  
  .right-controls {
    right: 15px;
  }
  
  .control-btn {
    width: 45px;
    height: 45px;
  }
  
  .btn-icon {
    font-size: 18px;
  }
  
  .scale-display {
    width: 60px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .floating-controls {
    padding: 10px;
    min-width: 60px;
    border-radius: 15px;
  }
  
  .left-controls {
    left: 10px;
  }
  
  .right-controls {
    right: 10px;
  }
  
  .control-group {
    gap: 8px;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  .scale-display {
    width: 50px;
    height: 30px;
    font-size: 0.85rem;
  }
  
  .control-label {
    font-size: 0.8rem;
  }
}
</style>