<template>
  <div class="monitor-page">
    <a-card class="list-card" title="学习记录">
      <template #extra>
        <a-button type="link" @click="goBack">
          <LeftOutlined /> 返回
        </a-button>
      </template>
      <div class="filters">
        <a-space wrap>
          <a-select v-model:value="indicator" style="width: 160px" :options="indicatorOptions" />
          <a-select v-model:value="sortKey" style="width: 160px" :options="sortKeyOptions" />
          <a-select v-model:value="sortOrder" style="width: 120px" :options="sortOrderOptions" />
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </div>
      <div class="ring-container">
        <div ref="ringRef" class="ring"></div>
      </div>
      <a-list :data-source="pagedRecords" :loading="loading" item-layout="vertical">
        <template #renderItem="{ item }">
          <a-list-item class="record-item" @click="enterFocus(item)">
            <a-list-item-meta :title="`设备 ${item.devId}`" :description="`总时长 ${formatHours(item.totalTime)}`" />
            <div class="start-time">开始时间：{{ item.startTime || '—' }}</div>
            <div class="metrics">
              <div class="metric"><span>学习</span><span>{{ item.studyTime }}</span><a-tag color="blue">{{
                toPercent(item.studyRatio) }}</a-tag></div>
              <div class="metric"><span>打瞌睡</span><span>{{ item.sleepTime }}</span><a-tag color="orange">{{
                toPercent(item.sleepRadio) }}</a-tag></div>
              <div class="metric"><span>非常专注</span><span>{{ item.attentionTime }}</span><a-tag color="green">{{
                toPercent(item.attentionRadio) }}</a-tag></div>
              <div class="metric"><span>走动</span><span>{{ item.walkTime }}</span></div>
              <div class="metric"><span>玩手机</span><span>{{ item.phoneTime }}</span></div>
            </div>
          </a-list-item>
        </template>
      </a-list>
      <div class="pagination">
        <a-pagination :total="displayRecords.length" v-model:current="current" v-model:pageSize="pageSize"
          :pageSizeOptions="['5', '10', '20', '50']" show-size-changer />
      </div>
      <div v-if="displayRecords.length === 0" class="empty">暂无数据</div>
    </a-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request.js'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()
const records = ref([])
const loading = ref(false)
const indicator = ref('全部')
const sortKey = ref('默认')
const sortOrder = ref('desc')
const current = ref(1)
const pageSize = ref(10)

const indicatorOptions = [
  { label: '全部', value: '全部' },
  { label: '专注偏低', value: '专注偏低' },
  { label: '睡眠偏高', value: '睡眠偏高' },
  { label: '玩手机偏高', value: '玩手机偏高' },
  { label: '学习占比高', value: '学习占比高' }
]

const sortKeyOptions = [
  { label: '默认', value: '默认' },
  { label: '学习占比', value: 'studyRatio' },
  { label: '专注占比', value: 'attentionRadio' },
  { label: '睡眠占比', value: 'sleepRadio' },
  { label: '总时长', value: 'totalTime' },
  { label: '玩手机时长', value: 'phoneTime' }
]

const sortOrderOptions = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' }
]




const goBack = () => {
  router.back()
}

const toPercent = (n) => {
  if (n == null) return '—'
  const v = Number(n)
  if (Number.isNaN(v)) return '—'
  return `${(v * 100).toFixed(1)}%`
}

const formatHours = (h) => {
  if (h == null) return '—'
  const v = Number(h)
  if (Number.isNaN(v)) return String(h)
  return `${v.toFixed(2)} h`
}

const parseMin = (s) => {
  if (!s) return 0
  const parts = String(s).split(':')
  const a = Number(parts[0] || 0)
  const b = Number(parts[1] || 0)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return a + b / 60
}

const resetFilters = () => {
  indicator.value = '全部'
  sortKey.value = '默认'
  sortOrder.value = 'desc'
  current.value = 1
}

const filteredRecords = computed(() => {
  let list = records.value
  if (indicator.value === '专注偏低') list = list.filter(r => Number(r.attentionRadio || 0) < 0.08)
  if (indicator.value === '睡眠偏高') list = list.filter(r => Number(r.sleepRadio || 0) > 0.2)
  if (indicator.value === '玩手机偏高') list = list.filter(r => parseMin(r.phoneTime) > 30)
  if (indicator.value === '学习占比高') list = list.filter(r => Number(r.studyRatio || 0) > 0.7)
  return list
})

const pagedRecords = computed(() => {
  const start = (current.value - 1) * pageSize.value
  return displayRecords.value.slice(start, start + pageSize.value)
})

const displayRecords = computed(() => {
  let list = [...filteredRecords.value]
  if (sortKey.value !== '默认') {
    list.sort((a, b) => {
      const va = sortKey.value === 'phoneTime' ? parseMin(a.phoneTime) : Number(a[sortKey.value] || 0)
      const vb = sortKey.value === 'phoneTime' ? parseMin(b.phoneTime) : Number(b[sortKey.value] || 0)
      return sortOrder.value === 'asc' ? va - vb : vb - va
    })
  }
  return list
})

const ringRef = ref(null)
let ring = null

const renderRingFromList = (list) => {
  if (!ringRef.value) return
  if (!ring) ring = echarts.init(ringRef.value)
  const sum = (fn) => list.reduce((acc, r) => acc + fn(r), 0)
  const study = sum(r => parseMin(r?.studyTime))
  const sleep = sum(r => parseMin(r?.sleepTime))
  const attention = sum(r => parseMin(r?.attentionTime))
  const walk = sum(r => parseMin(r?.walkTime))
  const phone = sum(r => parseMin(r?.phoneTime))
  const total = study + sleep + attention + walk + phone
  const data = total > 0
    ? [
      { name: '学习', value: study, itemStyle: { color: '#1890ff' } },
      { name: '打瞌睡', value: sleep, itemStyle: { color: '#fa8c16' } },
      { name: '非常专注', value: attention, itemStyle: { color: '#52c41a' } },
      { name: '走动', value: walk, itemStyle: { color: '#722ed1' } },
      { name: '玩手机', value: phone, itemStyle: { color: '#eb2f96' } }
    ]
    : [{ name: '暂无数据', value: 1, itemStyle: { color: '#f0f0f0' } }]
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 分钟 ({d}%)' },
    legend: { top: 0, left: 'center', orient: 'horizontal', itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      center: ['50%', '60%'],
      radius: ['55%', '80%'],
      avoidLabelOverlap: true,
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
      labelLine: { show: true, length: 8, length2: 6 },
      data
    }]
  }
  ring.setOption(option)
}

watch(filteredRecords, async (list) => {
  await nextTick()
  renderRingFromList(list)
})

const fetchData = async (devId) => {
  loading.value = true
  try {
    const res = await request.get('http://localhost:8084/device/monitor/list', { params: { devId } })
    if (res && res.code === 1 && Array.isArray(res.data)) {
      records.value = res.data
    } else {
      records.value = []
    }
  } catch (e) {
    records.value = []
  } finally {
    loading.value = false
  }
}


const enterFocus = (item) => {
  router.push({
    path: '/focus',
    query: {
      devId: item.devId,
      total: item.totalTime,
      sleep: item.sleepTime,
      study: item.studyTime,
      attention: item.attentionTime,
      walk: item.walkTime,
      phone: item.phoneTime,
      studyRatio: item.studyRatio,
      sleepRadio: item.sleepRadio,
      attentionRadio: item.attentionRadio,
      startTime: item.startTime
    }
  })
}

const exportCSV = () => {
  const headers = ['id', 'totalTime', 'sleepTime', 'studyTime', 'walkTime', 'phoneTime', 'attentionTime', 'devId', 'studyRatio', 'sleepRadio', 'attentionRadio']
  const rows = filteredRecords.value.map(r => headers.map(h => r[h]))
  const csv = [headers.join(','), ...rows.map(row => row.map(v => `${v ?? ''}`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'monitor.csv'
  a.click()
  URL.revokeObjectURL(url)
}


onMounted(() => {
  const devId = route.query.devId || ''
  fetchData(devId)
})

onUnmounted(() => {
  try { ring && ring.dispose() } catch (e) { }
})

</script>

<style scoped>
.monitor-page {
  padding: 12px;
}

.filters {
  margin-bottom: 12px;
}

.toolbar {
  margin: 12px 0 16px;
}

.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge {
  width: 160px;
  height: 160px;
}

.gauge-label {
  margin-top: 8px;
  font-size: 14px;
}

.chart {
  width: 100%;
  height: 220px;
}

.list-card {
  margin-top: 16px;
}

.ring-container {
  margin: 8px 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  width: 100%;
  height: 280px;
}

.record-item {
  border-radius: 8px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.start-time {
  margin: 4px 0 8px;
  color: #666;
  font-size: 13px;
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty {
  text-align: center;
  color: #999;
  padding: 24px 0;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.row-alert {
  background: #fff1f0;
  transition: background 0.3s ease;
}

@media (max-width: 768px) {
  .gauge {
    width: 120px;
    height: 120px;
  }

  .chart {
    height: 200px;
  }
}
</style>