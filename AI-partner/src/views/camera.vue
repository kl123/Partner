<template>
  <div class="monitor-home">
    <!-- 顶部状态栏 -->
    <header class="top-bar">
      <div class="time">{{ currentTime }}</div>
      <div class="network">
        <span>在线</span>
        <span>5G</span>
        <span class="signal">📶</span>
        <span class="battery">{{ battery }}%</span>
      </div>
    </header>

    <!-- 家庭监控标题区 -->
    <div class="home-header">
      <h1>家庭监控中心 ▼</h1>
      <p class="device-status">当前在线设备：{{ onlineDevices }}/{{ totalDevices }} <span class="refresh-btn"
          @click="refreshDevices">🔄</span></p>
    </div>

    <!-- 快速操作场景区 -->
    <div class="scene-ad-area">
      <div class="scene-cards">
        <div class="scene-card" v-for="scene in scenes" :key="scene.id" @click="handleSceneClick(scene)">
          <div class="scene-icon">{{ scene.icon }}</div>
          <div class="scene-name">{{ scene.name }}</div>
        </div>
      </div>
    </div>

    <!-- 监控设备列表区 -->
    <div class="devices-area">
      <div class="devices-header">
        全部监控设备
        <span class="add-device-btn" @click="showAddDeviceModal = true">+ 添加设备</span>
      </div>
      <div class="devices-list">
        <!-- 监控设备卡片 -->
        <div class="device-card" v-for="device in devices" :key="device.id">
          <div class="device-status-badge" :class="device.online ? 'online' : 'offline'">
            {{ device.online ? '在线' : '离线' }}
          </div>
          <div class="device-name">
            {{ device.name }}
            <span class="device-type">{{ device.type }}</span>
          </div>
          <div class="device-preview" @click="viewRealTime(device)">
            <img :src="device.preview" alt="监控预览" class="preview-img">
            <div class="real-time-tag">实时查看</div>
          </div>
          <div class="device-actions">
            <button class="action-btn" @click="viewRecord(device)">📹 回放</button>
            <button class="action-btn" @click="setDevice(device)">⚙️ 设置</button>
          </div>
        </div>
      </div>
      <button class="edit-btn" @click="enterEditMode">编辑设备</button>
    </div>

    <!-- 工具功能区 -->
    <div class="tools-area">
      <div class="tools-header">常用工具</div>
      <div class="tools-grid">
        <div class="tool-card" @click="openCloudStorage">
          <div class="tool-icon">☁️</div>
          <div class="tool-name">云存储</div>
          <div class="tool-desc">查看历史录像</div>
        </div>
        <div class="tool-card" @click="openAlertSetting">
          <div class="tool-icon">🔔</div>
          <div class="tool-name">报警设置</div>
          <div class="tool-desc">移动侦测/声音报警</div>
        </div>
        <div class="tool-card" @click="openShareManage">
          <div class="tool-icon">👥</div>
          <div class="tool-name">共享管理</div>
          <div class="tool-desc">授权家人查看</div>
        </div>
        <div class="tool-card" @click="openDeviceHelp">
          <div class="tool-icon">❓</div>
          <div class="tool-name">设备帮助</div>
          <div class="tool-desc">故障排查/教程</div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <div class="nav-item active">
        <i class="icon-device">📹</i>
        <span>监控</span>
      </div>
      <div class="nav-item" @click="goToRecord">
        <i class="icon-record">📼</i>
        <span>回放</span>
      </div>
      <div class="nav-item" @click="goToAlert">
        <i class="icon-alert">⚠️</i>
        <span>报警</span>
        <span class="notification-badge">{{ alertCount }}</span>
      </div>
      <div class="nav-item" @click="goToMine">
        <i class="icon-my">👤</i>
        <span>我的</span>
      </div>
    </nav>

    <!-- 添加设备弹窗（仅新增部分） -->
    <div class="modal-mask" v-if="showAddDeviceModal" @click="showAddDeviceModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>通过设备编码添加设备</h3>
          <span class="modal-close" @click="showAddDeviceModal = false">×</span>
        </div>
        <div class="modal-body">
          <p class="modal-tip">请输入设备底部/说明书上的16位设备编码</p>
          <input type="text" v-model="deviceCode" placeholder="例如：SN_8A3F92B7C1D4E6G8" maxlength="16"
            @input="formatDeviceCode" class="device-code-input">
          <p class="modal-note">设备编码通常以SN_开头，共16位字符（字母/数字/下划线）</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddDeviceModal = false">取消</button>
          <button class="confirm-btn" @click="bindDeviceByCode" :disabled="!isDeviceCodeValid">
            确认绑定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonitorHome',
  data() {
    return {
      currentTime: '',
      battery: 57,
      onlineDevices: 3,
      totalDevices: 4,
      alertTime: '今天 09:23',
      alertCount: 2,
      scenes: [
        { id: 1, name: '全部开启', icon: '' },
        { id: 2, name: '全部关闭', icon: '' },
        { id: 3, name: '录像模式', icon: '' },
        { id: 4, name: '仅查看', icon: '' },
      ],
      devices: [
        {
          id: 1,
          name: '客厅摄像头',
          type: '高清夜视',
          online: true,
          preview: 'https://picsum.photos/200/150?random=1'
        },
        {
          id: 2,
          name: '门口摄像头',
          type: '人脸识别',
          online: true,
          preview: 'https://picsum.photos/200/150?random=2'
        },
      ],
      // 新增添加设备相关数据
      showAddDeviceModal: false,
      deviceCode: '',
    };
  },
  computed: {
    // 验证设备编码是否有效（16位字符，支持字母、数字、下划线）
    isDeviceCodeValid() {
      const reg = /^[A-Za-z0-9_]{16}$/;
      return reg.test(this.deviceCode);
    }
  },
  mounted() {
    // 初始化当前时间
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    refreshDevices() {
      // 模拟刷新设备状态
      this.onlineDevices = Math.floor(Math.random() * this.totalDevices) + 1;
      this.devices.forEach(device => {
        device.online = Math.random() > 0.3;
      });
    },
    handleSceneClick(scene) {
      alert(`执行场景：${scene.name}`);
      // 实际项目中可添加场景执行逻辑（如控制设备开关、模式切换等）
    },
    viewRealTime(device) {
      if (device.online) {
        alert(`查看${device.name}实时画面`);
        // 跳转实时监控页面
      } else {
        alert(`${device.name}当前离线，无法查看实时画面`);
      }
    },
    viewRecord(device) {
      if (device.online) {
        alert(`查看${device.name}历史录像`);
        // 跳转录像回放页面
      } else {
        alert(`${device.name}当前离线，无法查看录像`);
      }
    },
    setDevice(device) {
      alert(`进入${device.name}设置页面`);
      // 跳转设备设置页面
    },
    addDevice() {
      // 原alert替换为显示弹窗
      this.showAddDeviceModal = true;
      this.deviceCode = ''; // 重置输入框
    },
    enterEditMode() {
      alert('进入设备编辑模式（可删除/排序设备）');
    },
    openCloudStorage() {
      alert('打开云存储管理');
    },
    openAlertSetting() {
      alert('打开报警设置');
    },
    openShareManage() {
      alert('打开共享管理');
    },
    openDeviceHelp() {
      alert('打开设备帮助中心');
    },
    goToRecord() {
      alert('跳转到录像回放页面');
    },
    goToAlert() {
      alert('跳转到报警记录页面');
    },
    goToMine() {
      alert('跳转到个人中心页面');
    },
    // 新增：格式化设备编码（自动转为大写）
    formatDeviceCode() {
      this.deviceCode = this.deviceCode.toUpperCase();
    },
    // 新增：通过设备编码绑定设备
    bindDeviceByCode() {
      // 模拟设备绑定逻辑
      const deviceTypes = ['高清夜视', '人脸识别', '全景监控', '红外感应'];
      const randomType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const newDevice = {
        id: Date.now(),
        name: `新绑定设备(${this.deviceCode.slice(0, 6)})`, // 用编码前6位作为设备名称后缀
        type: randomType,
        online: false, // 新绑定设备默认离线，需等待联网
        preview: `https://picsum.photos/200/150?random=${Date.now()}`
      };

      // 添加新设备到列表
      this.devices.push(newDevice);
      this.totalDevices = this.devices.length;
      this.onlineDevices = this.devices.filter(d => d.online).length;

      // 关闭弹窗并提示
      this.showAddDeviceModal = false;
      alert(`设备绑定成功！\n设备编码：${this.deviceCode}\n设备类型：${randomType}\n请等待设备联网（约1-2分钟）`);
    }
  }
};
</script>

<style scoped>
/* 全局页面样式 */
.monitor-home {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(to bottom, #2d8cf0 0%, #e8f4f8 100%);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: 80px;
  /* 预留底部导航空间 */
}

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  color: #fff;
}

.time {
  font-size: 18px;
  font-weight: 500;
}

.network {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.battery {
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

/* 家庭监控标题区 */
.home-header {
  text-align: center;
  margin: 20px 0;
}

.home-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.device-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.refresh-btn {
  cursor: pointer;
  font-size: 16px;
}

.refresh-btn:active {
  transform: rotate(180deg);
  transition: transform 0.5s;
}

/* 快速操作场景区 */
.scene-ad-area {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 24px;
  gap: 12px;
}

.scene-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex: 1;
}

.scene-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.scene-card:active {
  transform: scale(0.95);
}

.scene-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.scene-name {
  font-size: 16px;
  font-weight: 500;
}

.monitor-alert {
  background: linear-gradient(to bottom, #ff7a45, #ff4d4f);
  color: #fff;
  border-radius: 12px;
  padding: 16px;
  flex: 1;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.monitor-alert h3 {
  font-size: 18px;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-time {
  font-size: 12px;
  opacity: 0.9;
  margin: 0 0 4px;
}

.alert-content {
  font-size: 14px;
  margin: 0 0 16px;
  line-height: 1.4;
}

.check-btn {
  background: #fff;
  color: #ff4d4f;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.check-btn:active {
  background: #f5f5f5;
}

/* 监控设备列表区 */
.devices-area {
  padding: 0 16px;
  margin-bottom: 24px;
}

.devices-header {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-device-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #2d8cf0;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.devices-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.device-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.device-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.device-status-badge.online {
  background: #e6f4ea;
  color: #52c41a;
}

.device-status-badge.offline {
  background: #f5f5f5;
  color: #8c8c8c;
}

.device-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  padding-right: 60px;
  /* 给状态徽章留空间 */
}

.device-type {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
  font-weight: normal;
}

.device-preview {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin: 8px 0;
  cursor: pointer;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.real-time-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.device-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.action-btn {
  flex: 1;
  background: #f5f7fa;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 6px 0;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn:active {
  background: #e8f4f8;
  color: #2d8cf0;
}

.edit-btn {
  display: block;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 24px;
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.edit-btn:active {
  background: #f5f5f5;
}

/* 工具功能区 */
.tools-area {
  padding: 0 16px;
}

.tools-header {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tool-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.tool-card:active {
  transform: scale(0.95);
}

.tool-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #2d8cf0;
}

.tool-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.tool-desc {
  font-size: 12px;
  color: #666;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.nav-item.active {
  color: #2d8cf0;
}

.nav-item i {
  font-size: 24px;
  margin-bottom: 4px;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 新增：添加设备弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.device-code-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border 0.3s;
}

.device-code-input:focus {
  border-color: #2d8cf0;
}

.modal-note {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #eee;
}

.confirm-btn {
  background: #2d8cf0;
  color: #fff;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover {
  background: #1a73e8;
}
</style>