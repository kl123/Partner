<template>
  <div class="learning-dashboard">
    <!-- 左侧：用户信息 & 快捷入口 -->
    <div class="left-section">
      <!-- 用户卡片 -->
      <a-card class="user-card">
        <div class="user-header">
          <a-avatar :size="64" :src="user.avatar" />
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p>
              学号: {{ user.studentId }}
              <a-tag @click="copyId" color="blue" style="cursor: pointer">复制</a-tag>
            </p>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <h4>{{ stats.courses }}</h4>
            <p>已学课程</p>
          </div>
          <div class="stat-item">
            <h4>{{ stats.words }}</h4>
            <p>单词本</p>
          </div>
        </div>
      </a-card>

      <!-- 快捷入口 -->
      <a-list class="quick-actions" :data-source="actions" header="快捷入口">
        <template #renderItem="{ item }">
          <a-list-item @click="handleAction(item.key)">
            <a-list-item-meta :title="item.title" :avatar="item.icon" />
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 英语能力雷达图 -->
      <a-card title="📈 我的英语能力分析" class="chart-card">
        <div ref="radarRef" class="chart-container"></div>
      </a-card>

      <!-- 学习时长趋势图 -->
      <a-card title="⏳ 最近7天学习时长" class="chart-card">
        <div ref="lineRef" class="chart-container"></div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'
import {useRouter} from 'vue-router' 
// DOM 引用（用于挂载图表）
const radarRef = ref(null)
const lineRef = ref(null)
const router = useRouter()
// 用户数据
const user = reactive({
  name: '用户104289810',
  studentId: '2542223758',
  avatar: 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=1'
})

// 统计数据
const stats = reactive({
  courses: 1,
  words: 0
})

// 快捷入口
const actions = ref([
  { key: 'error', title: '错题记录', icon: '📚' },
  { key: 'words', title: '单词本', icon: '📖' },
  { key: 'historical', title: '测试记录', icon: '⚙️' },
  { key: 'feedback', title: '学习提醒', icon: '💬' }
])

// 模拟英语能力数据（五维）
const abilityData = ref({
  indicator: [
    { name: '听力', max: 1 },
    { name: '口语', max: 1 },
    { name: '阅读', max: 1 },
    { name: '写作', max: 1 },
    { name: '词汇', max: 1 }
  ],
  my: [0.5, 0.7, 0.6, 0.4, 0.6],
  target: [0.8, 0.8, 0.9, 0.7, 0.8]
})

// 模拟学习时长数据（最近7天）
const studyData = ref({
  dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  hours: [1.2, 0.8, 1.5, 2.1, 1.8, 3.0, 2.5]
})

// 复制学号
const copyId = async () => {
  try {
    await navigator.clipboard.writeText(user.studentId)
    message.success('学号已复制！')
  } catch (err) {
    message.error('复制失败')
  }
}

// 快捷入口点击
const handleAction = (key) => {
  message.info(`跳转到：${key}`)
  router.push({name:key})
}

// 初始化雷达图
const initRadarChart = () => {
  const chart = echarts.init(radarRef.value)

  const option = {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: abilityData.value.indicator,
      axisName: { color: '#FFA500', fontSize: 14 }, // 增加字体大小
      splitArea: {
        show: true,
        areaStyle: { opacity: 0.1 }
      },
      axisLine: {
        lineStyle: { color: 'rgba(255, 255, 255, 0.3)' }
      }
    },
    series: [
      {
        name: '能力对比',
        type: 'radar',
        data: [
          {
            value: abilityData.value.my,
            name: '我的水平',
            areaStyle: { opacity: 0.2, color: '#667eea' },
            lineStyle: { color: '#667eea', width: 3 },
            symbol: 'circle',
            itemStyle: { color: '#ffd700' }
          },
          {
            value: abilityData.value.target,
            name: '目标水平',
            areaStyle: { opacity: 0.1, color: '#764ba2' },
            lineStyle: { type: 'dashed', color: '#764ba2', width: 2 },
            symbol: 'rect',
            itemStyle: { color: '#ff7f50' }
          }
        ]
      }
    ],
    textStyle: { color: '#fff' }
  }

  chart.setOption(option)

  // 自适应
  window.addEventListener('resize', () => chart.resize())
  nextTick(() => chart.resize())
}

// 初始化折线图（学习时长）
const initLineChart = () => {
  const chart = echarts.init(lineRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 小时'
    },
    xAxis: {
      type: 'category',
      data: studyData.value.dates,
      axisLabel: { color: '#000000', fontSize: 10 }, // 增加字体大小
      axisLine: { lineStyle: { color: '#333' } }
    },
    yAxis: {
      type: 'value',
      name: '学习时长 (小时)',
      axisLabel: { color: '#000000', fontSize: 10, formatter: '{value}h' }, // 增加字体大小
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        name: '学习时长',
        type: 'line',
        data: studyData.value.hours,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 4,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8B5CF6' },
            { offset: 1, color: '#06B6D4' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
            { offset: 1, color: 'rgba(6, 182, 212, 0.1)' }
          ])
        },
        itemStyle: { color: '#00DB7D' }
      }
    ],
    textStyle: { color: '#fff' }
  }

  chart.setOption(option)

  // 自适应
  window.addEventListener('resize', () => chart.resize())
  nextTick(() => chart.resize())
}

// 页面挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initRadarChart()
    initLineChart()
  })
})
</script>

<style scoped>
.learning-dashboard {
  width: 100vw;
  background-color: #ececec;
  color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column; /* 修改为列布局 */
}

.left-section {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  border-bottom: 1px solid #333; /* 修改为底部边框 */
}

.right-section {
  display: none; /* 隐藏右侧部分 */
}

.charts-section {
  /* padding: 20px; */
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 65vh;
}

.user-card {
  background: linear-gradient(135deg, #67c23a 0%, #b3e19d 100%); /* 绿色渐变 */
  color: white;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.user-info h3 {
  margin: 0;
  font-size: 1.2em;
}

.user-info p {
  margin: 4px 0 0 0;
  font-size: 0.9em;
  opacity: 0.9;
}

.stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 16px;
  border-radius: 8px;
}

.stat-item h4 {
  margin: 0;
  font-size: 1.4em;
  font-weight: bold;
}

.stat-item p {
  margin: 4px 0 0 0;
  font-size: 0.9em;
  opacity: 0.9;
}

/* 图表卡片 */
.chart-card {
  background-color: #ffffff; /* 白色背景 */
  border: 1px solid #e8e8e8; /* 边框颜色 */
  border-radius: 12px;
  height: 34vh;
  overflow: hidden;
  padding: 0;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), /* 阴影效果 */
              0px 2px 4px rgba(0, 0, 0, 0.06); /* 更柔和的额外阴影 */
  margin-bottom: 10px;
}

.chart-container {
  width: 100%;
  height: 25vh;
  color: #000;
}

/* 快捷入口 */
.quick-actions :deep(.ant-list-header) {
  color: white;
  font-weight: bold;
  background: none;
  padding: 0 0 10px 0;
}

.quick-actions :deep(.ant-list-item) {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.quick-actions :deep(.ant-list-item-meta-title) {
  color: #67c23a; /* 图标颜色 */
}
</style>