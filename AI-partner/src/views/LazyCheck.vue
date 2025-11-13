<template>
  <div class="lazy-page">
    <div class="hero">
        <div class="hero-top">
          <div class="roof"></div>
          <div class="hero-title">智能 AI 学习搭子 — 偷懒检测</div>
          <div class="hero-sub">使用摄像头判断是否长时间静止，保持高效学习</div>
        </div>
      </div>

      <div class="content">
        <div class="panel">
          <div class="panel-left">
            <div class="card camera-card">
              <div class="card-title">摄像头预览（示例）</div>
              <div class="card-body">
                <!-- 静态占位图，页面为死数据，但允许本地替换展示图片 -->
                <img :src="imageSrc" alt="camera-placeholder" class="video" />
              </div>
              <div class="card-actions">
                <a-button type="primary" disabled>开启摄像头</a-button>
                <a-button disabled>关闭摄像头</a-button>
                <a-button disabled>编辑</a-button>
              </div>
            </div>
          </div>

          <div class="panel-right">
            <div class="card info-card">
              <div class="card-title">检测状态</div>
              <div class="card-body status-body">
                <div class="status-row"><strong>状态：</strong> <span :class="{lazy: isLazy}">{{ isLazy ? '偷懒中' : '活跃' }}</span></div>
                <div class="status-row">运动值：{{ motionValue }}</div>
                <div class="status-row">静止时长：{{ Math.floor(idleSeconds) }} s</div>
                <div class="status-row small">阈值：{{ motionThreshold }} · 连续静止 {{ idleLimit }}s 判定为偷懒</div>
                <a-switch v-model:checked="showDebug" /> <span class="small">显示调试</span>
              </div>
            </div>

            <div class="card tips-card">
              <div class="card-title">小贴士</div>
              <div class="card-body">若检测到偷懒，建议站起来活动 30 秒，或做眼保健操，保持专注。</div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import placeholder from '@/assets/摄像头.jpg'

// 页面为死数据：不启用摄像头或任何判断机制，仅展示静态示例数据
const streaming = ref(false)
const showDebug = ref(false)
const motionValue = ref(1234) // 示例静态数据
const idleSeconds = ref(3)
const isLazy = ref(false)

// 保留这些常量作为页面展示用
const motionThreshold = 1500
const idleLimit = 5

// 图片展示（死数据，不允许编辑）
const imageSrc = ref(placeholder)
</script>

<style scoped>
.lazy-page{ padding: 0; font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif }
.hero{ background: linear-gradient(180deg, #7db7ff 0%, #9ed7ff 30%, #dff3ff 100%); padding-bottom: 20px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px }
.hero-top{ max-width: 980px; margin: 0 auto; padding: 22px 16px 34px; text-align: center }
.roof{ height: 36px; width: 120px; margin: 0 auto 6px; background: linear-gradient(90deg,#6ec1ff,#4aa0ff); border-radius: 24px 24px 0 0 }
.hero-title{ font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 6px }
.hero-sub{ font-size: 12px; color: rgba(255,255,255,0.9); margin-top: 6px }

.content{ padding: 18px }
.panel{ display:flex; gap: 12px; align-items:flex-start; max-width: 980px; margin: 0 auto }
.panel-left{ flex: 1 }
.panel-right{ flex: 1 }

.card{ background: linear-gradient(180deg,#ffffff,#f5fbff); border-radius: 12px; padding: 12px; box-shadow: 0 8px 30px rgba(30,144,255,0.06); margin-bottom: 12px }
.card-title{ font-weight: 700; color: #2b6aa3; margin-bottom: 8px }
.card-body{ min-height: 120px; display:flex; align-items:center; justify-content:center; flex-direction:column }
.card-actions{ display:flex; gap: 8px; justify-content:center; margin-top: 10px }

.camera-card .video{ width: 100%; border-radius: 8px; max-width: 420px; box-shadow: 0 6px 18px rgba(30,144,255,0.06) }
.hidden-canvas{ display:none }

.info-card .status-row{ margin: 6px 0 }
.info-card .status-row .lazy{ color: #ff4d4f; font-weight:700 }
.info-card .small{ font-size:12px; color:#7a8aa0 }

.tips-card .card-body{ font-size: 13px; color:#5b6b86 }

/* 兼容底部导航的安全区 */
@media (max-width: 768px){
  .content{ padding-bottom: 92px }
  .panel{ flex-direction: column }
}
</style>
