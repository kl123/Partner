<template>
  <div class="page">
    <!-- 画布容器 -->
    <div class="canvas-container" ref="container">
      <canvas ref="canvas"></canvas>
      
      <!-- 悬浮控制面板 -->
      <div class="floating-controls" v-if="model">
        <div class="control-group">
          <div class="control-label">模型大小</div>
          <div class="scale-controls">
            <button class="control-btn" @click="adjustScale(-5)" title="缩小">
              <span class="btn-icon">−</span>
            </button>
            <div class="scale-display">
              <span class="percentage">{{ Math.round(currentScale * 100) }}%</span>
            </div>
            <button class="control-btn" @click="adjustScale(5)" title="放大">
              <span class="btn-icon">+</span>
            </button>
          </div>
        </div>

        <div class="control-group">
          <div class="control-label">位置调整</div>
          <div class="position-controls">
            <button class="control-btn" @click="centerModel" title="居中显示">
              <span class="btn-icon">◎</span>
            </button>
            <button class="control-btn" @click="resetScale" title="重置大小">
              <span class="btn-icon">↺</span>
            </button>
          </div>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import * as PIXI from 'pixi.js'

const canvas = ref(null)
const container = ref(null)
let app = null
let model = ref(null)
let currentScale = ref(0.2) // 初始缩放20%

// 配置参数
const config = {
  maxScale: 1.5,    // 最大放大150%
  minScale: 0.1,    // 最小缩小10%
  baseScale: 0.2,   // 基础缩放比例20%
  padding: 20
}

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

// 自动调整模型大小以适应画布
const autoFitModel = () => {
  if (!model.value || !app) return

  const canvasWidth = app.screen.width
  const canvasHeight = app.screen.height

  // 计算适合画布的缩放比例
  const widthScale = (canvasWidth * 0.5) / model.value.width  // 50%画布宽度
  const heightScale = (canvasHeight * 0.5) / model.value.height // 50%画布高度
  const autoScale = Math.min(widthScale, heightScale)

  // 应用自动缩放，但不超过最大最小限制
  currentScale.value = Math.max(
    config.minScale,
    Math.min(config.maxScale, autoScale)
  )
  
  model.value.scale.set(currentScale.value)
  centerModel()
  
  console.log('自动适应完成', 
             `画布: ${canvasWidth}x${canvasHeight}`, 
             `缩放: ${Math.round(currentScale.value * 100)}%`)
}

// 窗口大小改变处理
const handleResize = () => {
  resizeCanvas()
  // 可以选择是否在resize时重新自动适应
  // autoFitModel()
}

let resizeObserver = null

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

  // 设置画布样式为100%
  canvas.value.style.width = `${initialSize.width}px`
  canvas.value.style.height = `${initialSize.height}px`

  Live2DModel.from('./ama/model/兔兔-阿米娅.model3.json')
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

  window.addEventListener('resize', handleResize)
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) resizeObserver.disconnect()
  if (model.value) model.value.destroy()
  if (app) app.destroy(true, { children: true })
})
</script>

<style scoped>
.page {
  padding: 0;
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.header {
  margin-bottom: 0;
  padding: 20px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.header h2 {
  color: white;
  margin: 0;
  font-size: 2.2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  color: rgba(255, 255, 255, 0.9);
  margin: 8px 0 0;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  bottom: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
  min-width: 200px;
  transition: all 0.3s ease;
}

.floating-controls:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.3);
}

.control-group {
  margin-bottom: 16px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  text-align: center;
}

.scale-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  padding: 8px;
  border: 1px solid #dee2e6;
}

.position-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.control-btn {
  width: 42px;
  height: 42px;
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
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.scale-display {
  min-width: 60px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  font-weight: 700;
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
  .header {
    padding: 15px;
  }
  
  .header h2 {
    font-size: 1.8rem;
  }
  
  .floating-controls {
    bottom: 20px;
    right: 20px;
    padding: 16px;
    min-width: 180px;
  }
  
  .control-btn {
    width: 38px;
    height: 38px;
  }
  
  .btn-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 12px;
  }
  
  .header h2 {
    font-size: 1.5rem;
  }
  
  .header p {
    font-size: 1rem;
  }
  
  .floating-controls {
    bottom: 15px;
    right: 15px;
    left: 15px;
    min-width: auto;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px;
  }
  
  .control-group {
    margin-bottom: 0;
    margin-right: 15px;
  }
  
  .control-group:last-child {
    margin-right: 0;
  }
  
  .control-label {
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
}
</style>