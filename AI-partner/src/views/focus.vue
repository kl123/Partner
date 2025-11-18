<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <button class="nav-btn" :class="{ active: tab === 'day' }" @click="tab = 'day'">日数据</button>
      <button class="nav-btn" :class="{ active: tab === 'week' }" @click="tab = 'week'">周数据</button>
      <button class="nav-btn" :class="{ active: tab === 'month' }" @click="tab = 'month'">月数据</button>
    </div>

    <!-- 本周专注度与分类统计 -->
    <div class="stats-row">
      <div class="focus-card">
        <!-- <div class="circle-chart">
          <div class="circle-bg"></div>
          <div class="circle-progress" :style="{ strokeDasharray: `${40 * 2 * Math.PI / 100 * 100}px ${2 * Math.PI * 100}px` }"></div>
          <div class="circle-text">40%</div>
        </div> -->
        <img src="../assets/环形图.png" alt="本周专注度" class="focus-img">
      </div>
      <div class="stats-list">
        <div class="stat-item">
          <img src="../assets/xpc.png" alt="打瞌睡" class="stat-icon">
          <span>打瞌睡</span>
          <span>25%</span>
        </div>
        <div class="stat-item">
          <img src="../assets/pgs.png" alt="专注学习" class="stat-icon">
          <span>专注学习</span>
          <span>40%</span>
        </div>
        <div class="stat-item">
          <img src="../assets/mx.png" alt="分心" class="stat-icon">
          <span>分心</span>
          <span>35%</span>
        </div>
      </div>
    </div>

    <<<<<<< HEAD <!--、 AI助手报告分析按钮 -->
      <button v-if="!reportHtml" class="analysis-btn" :disabled="listening" @click="startReportListener">
        {{ listening ? '正在获取…' : '获取学习报告' }}
      </button>
      <div v-if="reportHtml" class="report-card">
        <div v-html="reportHtml"></div>
      </div>
      =======
      <!-- AI助手报告分析按钮 -->
      <button class="analysis-btn">AI助手报告分析</button>
      >>>>>>> jyx

      <!-- 姿态监测与提醒记录 -->
      <div class="monitor-row">
        <div class="monitor-card">
          <h4>姿态监测统计</h4>
          <div class="bar-chart">
            <div class="bar-item">
              <span>犯困</span>
              <div class="bar" :style="{ width: '5%' }"></div>
            </div>
            <div class="bar-item">
              <span>发呆</span>
              <div class="bar" :style="{ width: '10%' }"></div>
            </div>
            <div class="bar-item">
              <span>学习</span>
              <div class="bar" :style="{ width: '40%' }"></div>
            </div>
            <div class="bar-item">
              <span>走动</span>
              <div class="bar" :style="{ width: '15%' }"></div>
            </div>
            <div class="bar-item">
              <span>玩手机</span>
              <div class="bar" :style="{ width: '30%' }"></div>
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
        <button class="plan-btn">周计划提醒表✓</button>
        <div class="plan-list">
          <div class="plan-item">
            <input type="checkbox" checked>
            <span>周一 9:00</span>
            <span>背单词50个</span>
          </div>
          <div class="plan-item">
            <input type="checkbox" checked>
            <span>周一 10:00</span>
            <span>看网课</span>
          </div>
          <div class="plan-item">
            <input type="checkbox" checked>
            <span>周一 13:30</span>
            <span>复习高数</span>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'
export default {
  data() {
    return {
      tab: 'day',
      title: '日数据',
      perc: { sleep: 0, study: 0, focus: 0, walk: 0, phone: 0, idle: 0, distraction: 0 },
      listening: false,
      reportMarkdown: '',
      reportHtml: '',
      reportSource: null,
      reportGot: false,
      listenTimer: null,
      pollTimer: null,
      postController: null,
      streamBuf: ''
    };
  },
  mounted() {
    const q = this.$route.query || {};
    const fmt = (d) => {
      const pad = n => (n < 10 ? '0' : '') + n;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    this.title = q.startTime ? `学习数据 · ${fmt(new Date(q.startTime))}` : '学习数据';
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
    this.$nextTick(() => { mountRing(); this.initReport(); });
  }
  , methods: {
    appendStreamText(text) {
      try {
        const obj = JSON.parse(text);
        if (obj && typeof obj === 'object') {
          if (typeof obj.delta === 'string') text = obj.delta;
          else if (typeof obj.text === 'string') text = obj.text;
          else if (typeof obj.data === 'string') text = obj.data;
        }
      } catch (_) { }
      const s = String(text).replace(/\r/g, '\n');
      this.streamBuf += s;
      const flushIdx = this.streamBuf.lastIndexOf('\n\n');
      if (flushIdx >= 0) {
        const head = this.streamBuf.slice(0, flushIdx + 2);
        const tail = this.streamBuf.slice(flushIdx + 2);
        this.reportMarkdown += head;
        this.streamBuf = tail;
      }
      this.reportHtml = this.mdToHtml(this.reportMarkdown + this.streamBuf);
    },
    formatStartTime(s) {
      const str = String(s || '').trim()
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) return str
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(str)) return str + ':00'
      const d = new Date(str)
      if (!isNaN(d.getTime())) {
        const pad = (n) => (n < 10 ? '0' : '') + n
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      }
      return str
    },
    async initReport() {
      const q = this.$route.query || {};
      const devId = String(q.devId || '').trim();
      const startTime = this.formatStartTime(q.startTime || '');
      if (!devId || !startTime) return;
      try {
        const res = await fetch(`http://192.168.5.35:8085/modelCall/MarkdownByKey?dev_id=${encodeURIComponent(devId)}&start_time=${encodeURIComponent(startTime)}`);
        const data = await res.json();
        if (data && data.code === 200 && typeof data.data === 'string' && data.data.trim() !== '') {
          this.reportMarkdown = data.data;
          this.reportHtml = this.mdToHtml(this.reportMarkdown);
          this.listening = false;
          return;
        }
      } catch (e) { }
      this.startReportListener();
    },
    startReportListener() {
      if (this.listening) return;
      const q = this.$route.query || {};
      const devId = String(q.devId || '').trim();
      const startTime = this.formatStartTime(q.startTime || '');
      if (!devId || !startTime) { this.listening = false; return; }
      this.listening = true;
      this.reportMarkdown = '';
      this.reportHtml = '';
      this.reportGot = false;
      if (this.listenTimer) { try { clearTimeout(this.listenTimer) } catch (e) { } this.listenTimer = null }
      const params = new URLSearchParams({ dev_id: devId, start_time: startTime });
      const url = `http://192.168.5.35:8085/modelCall/LANStreamGet?${params.toString()}`;
      try {
        const es = new EventSource(url);
        this.reportSource = es;
        this.listenTimer = setTimeout(() => {
          if (!this.reportGot) {
            try { this.reportSource && this.reportSource.close() } catch (_) { }
            this.listening = false;
            message.info('暂未生成学习报告，请稍后重试');
          }
        }, 10000);
        es.onmessage = (e) => {
          const text = e?.data || '';
          if (!text) return;
          this.reportGot = true;
          if (this.listenTimer) { try { clearTimeout(this.listenTimer) } catch (_) { } this.listenTimer = null }
          if (text === '[DONE]') { try { es.close(); } catch (_) { } this.listening = false; return; }
          this.appendStreamText(text);
        };
        es.onerror = () => {
          try { es.close(); } catch (_) { }
          this.listening = false;
          if (this.listenTimer) { try { clearTimeout(this.listenTimer) } catch (_) { } this.listenTimer = null }
          if (!this.reportHtml) this.startPollMarkdown(devId, startTime);
        };
      } catch (e) {
        this.listening = false;
        if (!this.reportHtml) this.startPollMarkdown(devId, startTime);
      }
    },
    mdToHtml(md) {
      const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const inline = (t) => esc(t)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
      const lines = String(md).split(/\r?\n/);
      let html = '';
      let inCode = false; let codeBuf = []; let listBuf = []; let paraBuf = '';
      const flushList = () => { if (listBuf.length) { html += '<ul>' + listBuf.map(li => `<li>${li}</li>`).join('') + '</ul>'; listBuf = []; } };
      const flushCode = () => { if (inCode) { html += `<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`; inCode = false; codeBuf = []; } };
      const flushPara = () => { if (paraBuf.trim() !== '') { html += `<p>${inline(paraBuf)}</p>`; paraBuf = ''; } };
      for (let raw of lines) {
        const s = raw; // 保留原始行内容
        if (s.startsWith('```')) { if (!inCode) { flushPara(); flushList(); inCode = true; } else { flushCode(); } continue; }
        if (inCode) { codeBuf.push(raw); continue; }
        const m = s.match(/^(#{1,6})\s+(.*)$/);
        if (m) { flushPara(); flushList(); const lvl = m[1].length; html += `<h${lvl}>${inline(m[2])}</h${lvl}>`; continue; }
        if (/^[-*]\s+/.test(s)) { flushPara(); listBuf.push(inline(s.replace(/^[-*]\s+/, ''))); continue; }
        if (s.trim() === '') { flushList(); flushPara(); continue; }
        paraBuf = paraBuf ? paraBuf + s : s;
      }
      flushList(); flushCode(); flushPara();
      return html;
    },
    async startPostStream(devId, startTime) {
      try { this.postController && this.postController.abort() } catch (_) { }
      const base = 'http://192.168.5.35:8085/modelCall/LANStreamReport'
      const controller = new AbortController()
      this.postController = controller
      const startTs = Date.now()
      const readStream = async (res) => {
        if (!res || !res.body) return false
        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''
          for (const part of parts) {
            const lines = part.split('\n')
            const datas = lines.filter(l => l.startsWith('data:')).map(l => l.replace(/^data:\s?/, ''))
            let text = datas.length ? datas.join('\n') : part
            if (!text) continue
            this.reportGot = true
            if (text === '[DONE]') { try { controller.abort() } catch (_) { } return true }
            this.appendStreamText(text)
          }
        }
        return true
      }
      const attempts = [
        { url: base, init: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' }, body: JSON.stringify({ dev_id: devId, start_time: this.formatStartTime(startTime) }), signal: controller.signal } },
        { url: base, init: { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'text/event-stream' }, body: new URLSearchParams({ dev_id: devId, start_time: this.formatStartTime(startTime) }).toString(), signal: controller.signal } }
      ]
      let ok = false
      for (const a of attempts) {
        try {
          const res = await fetch(a.url, a.init)
          if (res.status === 422 || res.status === 405) { continue }
          ok = await readStream(res)
          if (ok) break
        } catch (_) { continue }
      }
      if (!ok) {
        if (!this.reportHtml) this.startPollMarkdown(devId, startTime)
      }
      if (!this.reportGot && Date.now() - startTs >= 10000) {
        this.listening = false
        message.info('暂未生成学习报告，请稍后重试')
      }
    },
    startPollMarkdown(devId, startTime) {
      if (this.pollTimer) { try { clearInterval(this.pollTimer) } catch (e) { } this.pollTimer = null }
      const startedAt = Date.now();
      this.pollTimer = setInterval(async () => {
        try {
          const st = this.formatStartTime(startTime)
          const res = await fetch(`http://192.168.5.35:8085/modelCall/MarkdownByKey?dev_id=${encodeURIComponent(devId)}&start_time=${encodeURIComponent(st)}`);
          const data = await res.json();
          if (data && data.code === 200 && typeof data.data === 'string' && data.data.trim() !== '') {
            this.reportMarkdown = data.data;
            this.reportHtml = this.mdToHtml(this.reportMarkdown);
            try { clearInterval(this.pollTimer) } catch (_) { }
            this.pollTimer = null;
            this.listening = false;
          }
        } catch (_) { }
        if (!this.reportHtml && Date.now() - startedAt >= 10000) {
          try { clearInterval(this.pollTimer) } catch (_) { }
          this.pollTimer = null;
          this.listening = false;
          message.info('暂未生成学习报告，请稍后重试');
        }
      }, 2000);
    }
  },
  unmounted() {
    try { this.reportSource && this.reportSource.close() } catch (e) { }
    if (this.listenTimer) { try { clearTimeout(this.listenTimer) } catch (e) { } this.listenTimer = null }
    if (this.pollTimer) { try { clearInterval(this.pollTimer) } catch (e) { } this.pollTimer = null }
    try { this.postController && this.postController.abort() } catch (e) { }
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
  <<<<<<< HEAD border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .1);
  =======>>>>>>>jyx
}

.nav-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
}

<<<<<<< HEAD .back-btn {
  flex: 0 0 auto;
  width: 36px;
  height: 32px;
  padding: 0;
  margin-left: 12px;
  margin-right: 12px;
  background: rgba(255, 255, 255, .15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn svg {
  width: 14px;
  height: 14px;
  fill: #fff;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.nav-spacer {
  flex: 0 0 auto;
  width: 36px;
  height: 32px;
  margin-right: 12px;
}

.nav-btn.active {
  background-color: #81c784;
  border-radius: 4px;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .15);

  =======.nav-btn.active {
    background-color: #81c784;
    border-radius: 4px;
    >>>>>>>jyx
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

  .report-card {
    width: 90%;
    margin: 0 auto 15px;
    padding: 14px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    color: #333;
  }

  .report-card h1,
  .report-card h2,
  .report-card h3 {
    margin: 8px 0;
    color: #2f855a;
  }

  .report-card p {
    line-height: 1.6;
  }

  .report-card ul {
    padding-left: 18px;
  }

  .report-card code {
    background: #f6f8fa;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .report-card pre {
    background: #f6f8fa;
    padding: 8px;
    border-radius: 6px;
    overflow: auto;
  }

  .report-skeleton {
    display: grid;
    gap: 8px;
  }

  .report-skeleton .line {
    height: 10px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0, #e8e8e8, #f0f0f0);
    animation: shimmer 1.2s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }

    100% {
      background-position: 200px 0;
    }
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
  }</style>