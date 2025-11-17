<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <button class="nav-btn" :class="{ active: tab === 'day' }" @click="tab = 'day'">日数据</button>
    </div>

    <!-- 本周专注度与分类统计 -->
    <div class="stats-row">
      <div class="focus-card">
        <div ref="ringRef" class="focus-ring"></div>
        <div class="focus-percentage">今日专注度 {{ perc.focus }}%</div>
      </div>
      <div class="stats-list">
        <div class="stat-item">
          <img src="../assets/xpc.png" alt="打瞌睡" class="stat-icon">
          <span>打瞌睡</span>
          <span>{{ perc.sleep }}%</span>
        </div>
        <div class="stat-item">
          <img src="../assets/pgs.png" alt="专注学习" class="stat-icon">
          <span>专注学习</span>
          <span>{{ perc.study }}%</span>
        </div>
        <div class="stat-item">
          <img src="../assets/mx.png" alt="分心" class="stat-icon">
          <span>分心</span>
          <span>{{ perc.distraction }}%</span>
        </div>
      </div>
    </div>

    <!--、 AI助手报告分析按钮 -->
    <button class="analysis-btn">AI助手报告分析</button>

    <!-- 姿态监测与提醒记录 -->
    <div class="monitor-row">
      <div class="monitor-card">
        <h4>姿态监测统计</h4>
        <div class="bar-chart">
          <div class="bar-item">
            <span>犯困</span>
            <div class="bar" :style="{ width: perc.sleep + '%' }"></div>
          </div>
          <div class="bar-item">
            <span>发呆</span>
            <div class="bar" :style="{ width: perc.idle + '%' }"></div>
          </div>
          <div class="bar-item">
            <span>学习</span>
            <div class="bar" :style="{ width: perc.study + '%' }"></div>
          </div>
          <div class="bar-item">
            <span>走动</span>
            <div class="bar" :style="{ width: perc.walk + '%' }"></div>
          </div>
          <div class="bar-item">
            <span>玩手机</span>
            <div class="bar" :style="{ width: perc.phone + '%' }"></div>
          </div>
          <div class="axis">20% 40% 60% 80%</div>
        </div>
      </div>
      <div class="remind-card">
        <h4>触发提醒记录</h4>
        <div class="remind-list">
          <div class="remind-item">
            <span>周一10:35</span>
            <span>提醒！发呆超过15分钟</span>
          </div>
          <div class="remind-item">
            <span>周一14:48</span>
            <span>休息！学习超过60分钟</span>
          </div>
          <div class="remind-item">
            <span>周一16:27</span>
            <span>提醒！玩手机超过30分钟</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 周计划提醒表 -->
    <div class="plan-section">
      <button class="plan-btn">今日计划提醒表✓</button>
      <div class="plan-list">
        <div class="plan-item">
          <input type="checkbox" checked>
          <span>今日 9:00</span>
          <span>背单词50个</span>
        </div>
        <div class="plan-item">
          <input type="checkbox" checked>
          <span>今日 10:00</span>
          <span>看网课</span>
        </div>
        <div class="plan-item">
          <input type="checkbox" checked>
          <span>今日 13:30</span>
          <span>复习高数</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  data() {
    return {
      tab: 'day',
      perc: { sleep: 0, study: 0, focus: 0, walk: 0, phone: 0, idle: 0, distraction: 0 }
    };
  },
  mounted() {
    const q = this.$route.query || {};
    const parseMin = (s) => {
      if (!s) return 0;
      const parts = String(s).split(':');
      const a = Number(parts[0] || 0);
      const b = Number(parts[1] || 0);
      if (Number.isNaN(a) || Number.isNaN(b)) return Number(s) || 0;
      return a + b / 60;
    };
    const totalH = Number(q.total) || 0;
    const vH = {
      sleep: parseMin(q.sleep),
      study: parseMin(q.study),
      attention: parseMin(q.attention),
      walk: parseMin(q.walk),
      phone: parseMin(q.phone)
    };
    let sum = totalH > 0 ? totalH : vH.sleep + vH.study + vH.attention + vH.walk + vH.phone;
    if (sum <= 0) sum = 1;
    const rSleep = q.sleepRadio ? Number(q.sleepRadio) : vH.sleep / sum;
    const rStudy = q.studyRatio ? Number(q.studyRatio) : vH.study / sum;
    const rAttention = q.attentionRadio ? Number(q.attentionRadio) : vH.attention / sum;
    const rWalk = vH.walk / sum;
    const rPhone = vH.phone / sum;
    const sleepP = Math.round(rSleep * 100);
    const studyP = Math.round(rStudy * 100);
    const attentionP = Math.round(rAttention * 100);
    const walkP = Math.round(rWalk * 100);
    const phoneP = Math.round(rPhone * 100);
    const idleP = Math.max(0, 100 - sleepP - studyP - attentionP - walkP - phoneP);
    const distractionP = phoneP;
    const w = { study: 1.0, attention: 1.5, sleep: 1.2, walk: 0.8, phone: 1.5 };
    const pos = w.study * rStudy + w.attention * rAttention;
    const den = pos + w.sleep * rSleep + w.walk * rWalk + w.phone * rPhone;
    const focusP = Math.round((den > 0 ? (pos / den) : 0) * 100);
    this.perc = { sleep: sleepP, study: studyP, focus: focusP, walk: walkP, phone: phoneP, idle: idleP, distraction: distractionP };
    const mountRing = () => {
      const el = this.$refs.ringRef;
      if (!el) return;
      const chart = echarts.init(el);
      const option = {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['60%', '80%'],
          label: { show: false },
          data: [
            { value: this.perc.focus, name: '专注度', itemStyle: { color: '#52c41a' } },
            { value: Math.max(0, 100 - this.perc.focus), name: '剩余', itemStyle: { color: '#f0f0f0' } }
          ]
        }],
        graphic: [{
          type: 'text',
          left: 'center',
          top: 'center',
          style: { text: `${this.perc.focus}%`, fontSize: 22, fontWeight: 600, fill: '#333' }
        }]
      };
      chart.setOption(option);
    };
    this.$nextTick(() => mountRing());
  }
};
</script>

<style scoped>
/* 全局容器样式 */
.app-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  background-color: #a5d6a7;
  padding: 10px 0;
}

.nav-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
}

.nav-btn.active {
  background-color: #81c784;
  border-radius: 4px;
}

/* 本周专注度与分类统计行 */
.stats-row {
  display: flex;
  padding: 15px;
  gap: 15px;
}

.focus-card {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.focus-card h3 {
  margin-top: 0;
  font-size: 18px;
}

.circle-chart {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 20px auto;
}

.circle-bg,
.circle-progress {
  fill: none;
  stroke-width: 10;
}

.circle-bg {
  stroke: #f0f0f0;
}

.circle-progress {
  stroke: #f5a623;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
}

.stats-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  width: 39px;
  height: 39px;
  margin-right: 8px;
}

/* AI分析按钮 */
.analysis-btn {
  display: block;
  width: 90%;
  margin: 0 auto 15px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  cursor: pointer;
}

/* 姿态监测与提醒记录行 */
.monitor-row {
  display: flex;
  padding: 0 15px 15px;
  gap: 15px;
}

.monitor-card,
.remind-card {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.monitor-card h4,
.remind-card h4 {
  margin-top: 0;
  font-size: 16px;
}

.bar-chart {
  margin-top: 15px;
}

.bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.bar-item span {
  width: 50px;
  display: inline-block;
  font-size: 14px;
}

.bar {
  height: 10px;
  background-color: #64b5f6;
  border-radius: 5px;
}

.axis {
  text-align: right;
  font-size: 10px;
  color: #999;
  margin-top: 5px;
}

.remind-list {
  margin-top: 15px;
}

.remind-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

/* 周计划提醒表 */
.plan-section {
  padding: 0 15px 15px;
}

.plan-btn {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  cursor: pointer;
}

.plan-list {
  margin-top: 10px;
}

.plan-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.plan-item input {
  margin-right: 8px;
}

.plan-item span {
  display: inline-block;
  width: 100px;
  font-size: 14px;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 10px 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
}

.nav-item img {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}

.nav-item.active {
  color: #2196f3;
}

.focus-img {
  width: 120px;
  height: 150px;
  margin: 20px auto;
  display: block;
}

.focus-percentage {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.focus-ring {
  width: 120px;
  height: 120px;
  margin: 20px auto;
}
</style>