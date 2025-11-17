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
      <button class="header-toggle" @click="toggleStatus" :aria-expanded="showStatusPanel">
        <span class="title-text">学习设备中心</span>
        <span class="arrow" :class="{ open: showStatusPanel }">▲</span>
      </button>
      <transition name="fade-slide">
        <p v-if="showStatusPanel" class="device-status">当前在线设备：{{ onlineDevices }}/{{ totalDevices }} <span
            class="refresh-btn" @click="refreshDevices">🔄</span></p>
      </transition>
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
        <span>全部学习设备</span>
        <div class="header-controls">


          <span class="add-device-btn" @click="showAddDeviceModal = true">+ 添加设备</span>
        </div>
      </div>
      <div class="devices-list">
        <div class="camera-card" v-for="cam in filteredCameras" :key="cam.id" @touchstart="onDeviceTouchStart($event, cam)" @touchmove="onDeviceTouchMove($event, cam)" @touchend="onDeviceTouchEnd" @mousedown="onDeviceMouseDown($event, cam)" @mousemove="onDeviceMouseMove" @mouseup="onDeviceMouseUp">
          <button @click="refreshOnlineStatus(cam)" class="device-status-badge"
            :class="[cam.online ? 'online' : 'offline', { loading: cam.loading }]">
            <span v-if="!cam.loading">{{ cam.online ? '在线' : '离线' }}</span>
            <span v-else class="spinner-icon">
              <SyncOutlined spin />
            </span>
          </button>
          <div class="device-name">{{ cam.name }}</div>
          <div class="device-type">{{ cam.type }}</div>
          <div class="device-preview" @click="viewRealTimeCamera(cam)">
            <img :src="cam.preview" alt="摄像头预览" class="preview-img">
            <div class="real-time-tag">实时数据</div>
          </div>
          <div class="device-actions">
            <button class="action-btn" @click="openAccessoryDrawer(cam)">查看辅助设备</button>
            <button class="action-btn" @click="setDevice(cam)">⚙️ 设置</button>
          </div>
          <div class="accessories-grid" v-if="false">
            <div class="accessory-card"
              v-for="acc in cam.accessories.filter(a => selectedCategory === 'all' ? true : (selectedCategory === 'camera' ? false : a.category === selectedCategory)).filter(a => !searchQuery || a.name.includes(searchQuery) || a.type.includes(searchQuery))"
              :key="acc.id">
              <div class="accessory-status" :class="acc.online ? 'online' : 'offline'">{{ acc.online ? '在线' : '离线' }}
              </div>
              <div class="accessory-name">{{ acc.name }}<span class="device-type">{{ acc.type }}</span></div>
              <div class="accessory-preview">
                <img :src="acc.preview" alt="设备预览" class="preview-img">
              </div>
              <div class="device-actions">
                <button class="action-btn" @click="toggleAccessoryPower(acc, true)">打开</button>
                <button class="action-btn" @click="toggleAccessoryPower(acc, false)">关闭</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    <div class="drawer-mask" v-if="drawerTranslateY < drawerPanelHeight - 1" @click="closeDrawer"
      :style="{ bottom: navHeight + 'px' }"></div>
    <div class="accessory-drawer" :style="{ bottom: drawerBottomOffset + 'px', zIndex: drawerZIndex }">
      <div class="drawer-container"
        :style="{ height: (drawerHandleHeight + (drawerPanelFullHeight - drawerTranslateY)) + 'px', transition: dragging ? 'none' : 'height 0.2s ease' }">
        <div class="drawer-handle" @click="onDrawerHandleClick" :style="{ height: drawerHandleHeight + 'px' }"
          @touchstart="onDrawerTouchStart" @touchmove="onDrawerTouchMove" @touchend="onDrawerTouchEnd"
          @mousedown="onDrawerTouchStart" @mousemove="onDrawerTouchMove" @mouseup="onDrawerTouchEnd">
          <span class="drawer-hint" :style="{ top: drawerHandleHeight <= 20 ? '6px' : '8px' }"></span>
          <span v-show="drawerTranslateY < drawerPanelHeight - 1">{{ activeDrawerCameraName }} · {{ drawerStatusText
          }}</span>
        </div>
        <div class="drawer-panel" :style="{ height: drawerPanelFullHeight + 'px' }" @click.self="closeDrawer"
          @touchstart="onDrawerTouchStart" @touchmove="onDrawerTouchMove" @touchend="onDrawerTouchEnd"
          @mousedown="onDrawerTouchStart" @mousemove="onDrawerTouchMove" @mouseup="onDrawerTouchEnd">
          <div class="device-actions">
            <button class="action-btn" @click="openAddAccessoryByDrawer">➕ 添加辅助设备</button>
            <button class="action-btn" :class="{ primary: assistEditMode }" @click="toggleEditAccessories">✏️
              编辑辅助设备</button>
          </div>
          <div v-if="assistEditMode" class="edit-tip"><span class="tip-icon">✏️</span><span>编辑模式已开启</span><button
              class="tip-exit" @click="toggleEditAccessories">退出</button></div>
          <div v-if="!activeDrawerAccessories || activeDrawerAccessories.length === 0" class="empty-state">
            暂无辅助设备，点击上方“添加辅助设备”</div>
          <div class="accessories-grid">
            <div class="accessory-card" v-for="acc in activeDrawerAccessories" :key="acc.id" @touchstart="onAccTouchStart($event, acc)" @touchmove="onAccTouchMove" @touchend="onAccTouchEnd" @mousedown="onAccMouseDown($event, acc)" @mousemove="onAccMouseMove" @mouseup="onAccMouseUp">
              <div class="accessory-status" :class="acc.online ? 'online' : 'offline'">{{ acc.online ? '在线' : '离线' }}
              </div>
              <div class="accessory-name">{{ acc.name }}<span class="device-type">{{ acc.type }}</span></div>
              <div class="accessory-preview">
                <img :src="acc.preview" alt="设备预览" class="preview-img">
              </div>
              <div class="device-actions">
                <button class="action-btn" @click="toggleAccessoryPower(acc, true)">打开</button>
                <button class="action-btn" @click="toggleAccessoryPower(acc, false)">关闭</button>
                <transition>
                  <button v-if="assistEditMode" class="action-btn danger" @click="deleteAccessory(acc)"
                    :disabled="acc.deleting">{{ acc.deleting ? '删除中...' : '删除' }}</button>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav class="bottom-nav" @click.capture="onBottomNavClick">
      <div class="nav-item active">
        <i class="icon-device">📚</i>
        <span>设备</span>
      </div>
      <div class="nav-item" @click="goToRecord">
        <i class="icon-record">📼</i>
        <span>记录</span>
      </div>
      <div class="nav-item" @click="goToAlert">
        <i class="icon-alert">⚠️</i>
        <span>提醒</span>
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
          <h3>通过设备编码添加学习设备</h3>
          <span class="modal-close" @click="showAddDeviceModal = false">×</span>
        </div>
        <div class="modal-body">
          <p class="modal-tip">请输入学习设备编码（BE+生产日期）</p>
          <input type="text" v-model="deviceCode" placeholder="例如：BE20251117"
            @input="formatDeviceCode" class="device-code-input">
          <p class="modal-note">设备编码为BE+生产日期，例如：BE20251117</p>
          <div class="modal-row">
            <input type="text" v-model.trim="bindUsername" placeholder="请输入用户名" class="device-code-input">
          </div>
          <div class="modal-row">
            <input type="password" v-model.trim="bindPassword" placeholder="请输入密码" class="device-code-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddDeviceModal = false">取消</button>
          <button class="confirm-btn" @click="bindDeviceByCode" :disabled="!canBind">
            确认绑定
          </button>
        </div>
      </div>
    </div>

    <div class="aux-modal-mask" v-if="showAddAuxModal" @click="closeAddAuxModal">
      <div class="aux-modal-content" @click.stop>
        <div class="aux-modal-header">
          <h3>添加辅助设备</h3>
          <span class="aux-modal-close" @click="closeAddAuxModal">×</span>
        </div>
        <div class="aux-top-error" v-if="auxErrors.top">{{ auxErrors.top }}</div>
        <div class="aux-modal-body">
          <div class="aux-field">
            <label class="aux-label">设备ID</label>
            <input class="aux-input" type="text" :value="auxForm.devId" disabled>
            <div class="aux-error" v-if="auxErrors.devId">{{ auxErrors.devId }}</div>
          </div>
          <div class="aux-field">
            <label class="aux-label">辅助设备标识码</label>
            <input class="aux-input" type="text" v-model.trim="auxForm.auxiliaryDeviceId" placeholder="请输入辅助设备的唯一标识码">
            <div class="aux-error" v-if="auxErrors.auxiliaryDeviceId">{{ auxErrors.auxiliaryDeviceId }}</div>
          </div>
        </div>
        <div class="aux-modal-footer">
          <button class="aux-btn aux-cancel" @click="closeAddAuxModal" :disabled="auxLoading">取消</button>
          <button class="aux-btn aux-confirm" @click="submitAuxiliary" :disabled="auxLoading">确定</button>
        </div>
      </div>
    </div>
    <div class="aux-modal-mask" v-if="showDeleteModal" @click="closeDeleteModal">
      <div class="aux-modal-content" @click.stop>
        <div class="aux-modal-header">
          <h3>确认删除设备</h3>
          <span class="aux-modal-close" @click="closeDeleteModal">×</span>
        </div>
        <div class="aux-modal-body">
          <div class="aux-field">
            <label class="aux-label">用户名</label>
            <input class="aux-input" type="text" v-model.trim="deleteForm.username" placeholder="请输入用户名">
          </div>
          <div class="aux-field">
            <label class="aux-label">密码</label>
            <input class="aux-input" type="password" v-model.trim="deleteForm.password" placeholder="请输入密码">
          </div>
        </div>
        <div class="aux-modal-footer">
          <button class="aux-btn aux-cancel" @click="closeDeleteModal" :disabled="deleteLoading">取消</button>
          <button class="aux-btn aux-confirm" @click="submitDelete" :disabled="deleteLoading || !canSubmitDelete">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request.js';
import axios from 'axios';
import { message, Modal } from 'ant-design-vue';

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
        { id: 1, name: '开始学习', icon: '📚' },
        { id: 2, name: '结束学习', icon: '🛑' },
        { id: 3, name: '番茄模式', icon: '⏱️' },
        { id: 4, name: '专注模式', icon: '🎧' },
      ],
      cameras: [],
      // 新增添加设备相关数据
      showAddDeviceModal: false,
      deviceCode: '',
      bindUsername: '',
      bindPassword: '',
      searchQuery: '',
      selectedCategory: 'all',
      selectedCameraId: null,
      selectedDeviceType: 'RGB护眼灯',
      activeDrawerCameraId: null,
      drawerOpen: false,
      drawerTranslateY: 0,
      dragging: false,
      gestureStartY: 0,
      gestureStartTime: 0,
      lastMoveY: 0,
      lastMoveTime: 0,
      startTranslateY: 0,
      drawerPanelHeight: 300,
      drawerPanelFullHeight: 420,
      navHeight: 60,
      showStatusPanel: false,
      showAddAuxModal: false,
      assistEditMode: false,
      auxForm: {
        devId: '',
        devName: '',
        auxiliaryDeviceId: ''
      },
      auxErrors: {
        top: '',
        devId: '',
        auxiliaryDeviceId: ''
      },
      auxLoading: false,
      showDeleteModal: false,
      deleteTargetCam: null,
      deleteForm: { username: '', password: '' },
      deleteLoading: false,
      longPressTimer: null,
      longPressDuration: 800,
      pressingCamId: null,
      touchStartX: 0,
      touchStartY: 0,
      mouseDown: false,
      accLongPressTimer: null,
      pressingAccId: null,
      accTouchStartX: 0,
      accTouchStartY: 0,
      accMouseDown: false,
    };
  },
  computed: {
    isDeviceCodeValid() {
      const reg = /^BE\d{8}$/;
      return reg.test(this.deviceCode);
    },
    canBind() {
      return this.isDeviceCodeValid && !!this.bindUsername && !!this.bindPassword;
    },
    filteredCameras() {
      const q = this.searchQuery.trim();
      return this.cameras.filter(cam => {
        const camMatch = q ? (cam.name.includes(q) || cam.type.includes(q)) : true;
        const accPool = this.selectedCategory === 'camera' ? [] : cam.accessories.filter(a => this.selectedCategory === 'all' ? true : a.category === this.selectedCategory);
        const accMatch = q ? accPool.some(a => a.name.includes(q) || a.type.includes(q)) : accPool.length > 0 || true;
        return camMatch || accMatch;
      });
    },
    activeDrawerAccessories() {
      const cam = this.cameras.find(c => c.id === this.activeDrawerCameraId);
      return cam ? cam.accessories : [];
    },
    canSubmitDelete() {
      return !!(this.deleteForm.username && this.deleteForm.password && this.deleteTargetCam);
    },
    drawerStatusText() {
      const accs = this.cameras.find(c => c.id === this.activeDrawerCameraId)?.accessories || [];
      const anyOn = accs.some(a => a.powerOn);
      return anyOn ? '🔌 辅助设备 · 已开启' : '⏻ 辅助设备 · 全部关闭';
    },
    activeDrawerCameraName() {
      const cam = this.cameras.find(c => c.id === this.activeDrawerCameraId);
      return cam ? cam.name : '未选择摄像头';
    },
    drawerHandleHeight() {
      return this.drawerTranslateY >= this.drawerPanelHeight - 1 ? 6 : 48;
    },
    drawerZIndex() {
      return this.drawerTranslateY < this.drawerPanelHeight - 1 ? 9999 : 500;
    },
    drawerBottomOffset() {
      return this.drawerTranslateY < this.drawerPanelHeight - 1 ? this.navHeight : (this.navHeight - this.drawerHandleHeight);
    }
  },
  watch: {
    drawerOpen(val) {
      if (!val) this.assistEditMode = false;
    }
  },
  async mounted() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
    const base = Math.round(window.innerHeight * 0.45);
    this.drawerPanelHeight = Math.max(240, Math.min(420, base));
    const fullBase = Math.round(window.innerHeight * 0.7);
    this.drawerPanelFullHeight = Math.max(this.drawerPanelHeight + 120, Math.min(560, fullBase));
    const navEl = document.querySelector('.bottom-nav');
    this.navHeight = navEl ? navEl.offsetHeight : 60;
    const desk = this.cameras.find(c => c.name.includes('书桌')) || this.cameras[0];
    this.activeDrawerCameraId = desk ? desk.id : null;
    this.drawerTranslateY = this.drawerPanelFullHeight;
    this.onResizeRef = () => {
      const b = Math.round(window.innerHeight * 0.45);
      this.drawerPanelHeight = Math.max(240, Math.min(420, b));
      const fb = Math.round(window.innerHeight * 0.7);
      this.drawerPanelFullHeight = Math.max(this.drawerPanelHeight + 120, Math.min(560, fb));
      this.drawerTranslateY = this.drawerOpen ? 0 : this.drawerPanelFullHeight;
      const el = document.querySelector('.bottom-nav');
      this.navHeight = el ? el.offsetHeight : 60;
    };
    window.addEventListener('resize', this.onResizeRef);

    try {
      const data = await request.get('http://localhost:8084/device/details');
      if (data.code === 1) {
        this.cameras = await Promise.all(data.data.map(async (device) => {
          let online = true; // Default
          if (device.deviceNameOrgin && device.deviceNameOrgin !== 'Null') {
            try {
              const res = await axios.get('https://apis.bemfa.com/va/online', {
                params: {
                  uid: '6fc94297b1a4771e713523fd16d19702',
                  topic: device.deviceNameOrgin,
                  type: 1
                }
              });
              if (res.data.code === 0) {
                online = res.data.data;
              }
            } catch (err) {
              console.error(`Failed to fetch online status for ${device.deviceNameOrgin}:`, err);
            }
          }
          return {
            id: device.id,
            devId: device.devId,
            name: device.deviceNameUser,
            type: device.deviceNameOrgin,
            online,
            preview: device.imgUrl || `https://picsum.photos/400/300?random=${Date.now()}`,
            loading: false,
            accessories: [] // Assuming no accessories; adjust if needed
          };
        }));
        this.updateCounts();
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
    this.refreshInterval = setInterval(() => {
      this.cameras.forEach(cam => this.refreshOnlineStatus(cam, false));
    }, 30000);
  },
  beforeUnmount() {
    if (this.onResizeRef) window.removeEventListener('resize', this.onResizeRef);
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    refreshDevices() {
      this.recountFromList();
    },
    recountFromList() {
      const list = this.filteredCameras;
      const total = list.length;
      const online = list.filter(c => c.online).length;
      this.totalDevices = total;
      this.onlineDevices = online;
    },
    toggleStatus() {
      this.showStatusPanel = !this.showStatusPanel;
    },
    handleSceneClick(scene) {
      alert(`执行学习场景：${scene.name}`);
      // 实际项目中可添加场景执行逻辑（如控制设备开关、模式切换等）
    },
    viewRealTimeCamera(cam) {
      if (cam.online) {
        alert(`查看${cam.name}实时数据`);
      } else {
        alert(`${cam.name}当前离线，无法查看实时数据`);
      }
    },
    setDevice(device) {
      alert(`进入${device.name}设置页面`);
      // 跳转设备设置页面
    },
    addDevice() {
      this.selectedCameraId = this.cameras[0]?.id || null;
      this.selectedDeviceType = 'RGB护眼灯';
      this.showAddDeviceModal = true;
      this.deviceCode = '';
    },
    openAddAccessory(cam) {
      this.selectedCameraId = cam.id;
      this.selectedDeviceType = 'RGB护眼灯';
      this.showAddDeviceModal = true;
      this.deviceCode = '';
    },
    async openAccessoryDrawer(cam) {
      this.activeDrawerCameraId = cam.id;
      const partialGap = this.drawerPanelFullHeight - this.drawerPanelHeight;
      this.drawerTranslateY = partialGap;
      this.drawerOpen = true;

      try {
        const data = await request.get('http://localhost:8084/device/auxiliary/list', {
          params: { devId: cam.devId }
        });
        if (data.code === 1) {
          cam.accessories = data.data.map(aux => ({
            id: aux.id,
            name: aux.assistDeviceName,
            type: '辅助设备',
            category: 'assist',
            online: aux.state === 'true',
            powerOn: aux.state === 'true',
            preview: aux.imgUrl,
            auxiliaryDeviceId: aux.auxiliaryDeviceId || aux.id || aux.assistDeviceName
          }));
        }
      } catch (error) {
        console.error('Failed to fetch auxiliary devices:', error);
      }
    },
    openAddAccessoryByDrawer() {
      const cam = this.cameras.find(c => c.id === this.activeDrawerCameraId) || this.cameras[0];
      if (!cam) return;
      this.openAddAuxiliaryModal(cam);
    },
    toggleEditAccessories() {
      this.assistEditMode = !this.assistEditMode;
    },
    deleteAccessory(acc) {
      const cam = this.cameras.find(c => c.id === this.activeDrawerCameraId);
      if (!cam) return;
      Modal.confirm({
        centered: true,
        zIndex: 10001,
        title: '确认删除该辅助设备吗？',
        content: `设备：${acc.name}`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          acc.deleting = true;
          try {
            const res = await request.post('http://localhost:8084/device/auxiliary/init', null, {
              params: { auxiliaryDeviceId: acc.auxiliaryDeviceId || acc.id || acc.name },
              timeout: 10000
            });
            if (res && res.code === 1) {
              cam.accessories = cam.accessories.filter(a => a.id !== acc.id);
              this.updateCounts();
              message.success('删除成功');
            } else {
              const msg = (res && res.msg) ? res.msg : '删除失败，请重试';
              message.error(msg);
            }
          } catch (e) {
            message.error('网络异常，请检查连接');
          } finally {
            acc.deleting = false;
          }
        }
      });
    },
    openAddAuxiliaryModal(cam) {
      this.auxErrors = { top: '', devId: '', auxiliaryDeviceId: '' };
      this.auxForm.devId = cam.devId || '';
      this.auxForm.devName = cam.name || '';
      this.auxForm.auxiliaryDeviceId = '';
      this.showAddAuxModal = true;
    },
    closeAddAuxModal() {
      if (this.auxLoading) return;
      this.showAddAuxModal = false;
      this.auxErrors = { top: '', devId: '', auxiliaryDeviceId: '' };
      this.auxForm.auxiliaryDeviceId = '';
    },
    validateAuxiliaryForm() {
      this.auxErrors = { top: '', devId: '', auxiliaryDeviceId: '' };
      let ok = true;
      if (!this.auxForm.devId) {
        this.auxErrors.devId = '设备不存在';
        ok = false;
      }
      const reg = /^[A-Za-z0-9_]{6,32}$/;
      if (!this.auxForm.auxiliaryDeviceId) {
        this.auxErrors.auxiliaryDeviceId = '请输入辅助设备标识码';
        ok = false;
      } else if (!reg.test(this.auxForm.auxiliaryDeviceId)) {
        this.auxErrors.auxiliaryDeviceId = '辅助设备标识码格式不正确';
        ok = false;
      }
      return ok;
    },
    async submitAuxiliary() {
      if (this.auxLoading) return;
      if (!this.validateAuxiliaryForm()) return;
      this.auxLoading = true;
      try {
        const res = await request.post('http://localhost:8084/device/auxiliary/add', null, {
          params: {
            devId: this.auxForm.devId,
            auxiliaryDeviceId: this.auxForm.auxiliaryDeviceId
          },
          timeout: 10000
        });
        if (res && res.code === 1) {
          await this.refreshActiveDrawerAccessories();
          this.showAddAuxModal = false;
          message.success('添加成功');
        } else if (res && res.code === 0) {
          const msg = res.msg || '';
          if (msg === '设备不存在') {
            this.auxErrors.devId = '设备不存在';
          } else if (msg === '无权操作该设备') {
            this.auxErrors.top = '无权操作该设备';
          } else if (msg === '辅助设备不存在') {
            this.auxErrors.auxiliaryDeviceId = '辅助设备不存在';
          } else if (msg === '绑定失败') {
            this.auxErrors.top = '绑定失败，请重试';
          } else {
            this.auxErrors.top = msg || '绑定失败，请重试';
          }
        }
      } catch (e) {
        message.error('网络异常，请检查连接');
      } finally {
        this.auxLoading = false;
      }
    },
    async refreshActiveDrawerAccessories() {
      const cam = this.cameras.find(c => c.id === this.activeDrawerCameraId) || this.cameras[0];
      if (!cam) return;
      try {
        const data = await request.get('http://localhost:8084/device/auxiliary/list', {
          params: { devId: cam.devId }
        });
        if (data.code === 1) {
          cam.accessories = data.data.map(aux => ({
            id: aux.id,
            name: aux.assistDeviceName,
            type: '辅助设备',
            category: 'assist',
            online: aux.state === 'true',
            powerOn: aux.state === 'true',
            preview: aux.imgUrl,
            auxiliaryDeviceId: aux.auxiliaryDeviceId || aux.id || aux.assistDeviceName
          }));
          this.updateCounts();
        }
      } catch (err) { }
    },
    onDeviceTouchStart(e, cam) {
      this.cancelPressTimer();
      const t = e.touches && e.touches[0] ? e.touches[0] : e;
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
      this.pressingCamId = cam.id;
      this.longPressTimer = setTimeout(() => {
        if (this.pressingCamId === cam.id) {
          this.confirmDelete(cam);
        }
      }, this.longPressDuration);
    },
    onDeviceTouchMove(e, cam) {
      if (!this.pressingCamId) return;
      const t = e.touches && e.touches[0] ? e.touches[0] : e;
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        this.cancelPressTimer();
      }
    },
    onDeviceTouchEnd() {
      this.cancelPressTimer();
      this.pressingCamId = null;
    },
    onDeviceMouseDown(e, cam) {
      this.mouseDown = true;
      this.pressingCamId = cam.id;
      this.touchStartX = e.clientX;
      this.touchStartY = e.clientY;
      this.cancelPressTimer();
      this.longPressTimer = setTimeout(() => {
        if (this.mouseDown && this.pressingCamId === cam.id) {
          this.confirmDelete(cam);
        }
      }, this.longPressDuration);
    },
    onDeviceMouseMove(e) {
      if (!this.mouseDown || !this.pressingCamId) return;
      const dx = e.clientX - this.touchStartX;
      const dy = e.clientY - this.touchStartY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        this.cancelPressTimer();
      }
    },
    onDeviceMouseUp() {
      this.mouseDown = false;
      this.cancelPressTimer();
      this.pressingCamId = null;
    },
    cancelPressTimer() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    },
    onAccTouchStart(e, acc) {
      this.cancelAccPressTimer();
      const t = e.touches && e.touches[0] ? e.touches[0] : e;
      this.accTouchStartX = t.clientX;
      this.accTouchStartY = t.clientY;
      this.pressingAccId = acc.id;
      this.accLongPressTimer = setTimeout(() => {
        if (this.pressingAccId === acc.id) {
          this.deleteAccessory(acc);
        }
      }, this.longPressDuration);
    },
    onAccTouchMove(e) {
      if (!this.pressingAccId) return;
      const t = e.touches && e.touches[0] ? e.touches[0] : e;
      const dx = t.clientX - this.accTouchStartX;
      const dy = t.clientY - this.accTouchStartY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        this.cancelAccPressTimer();
      }
    },
    onAccTouchEnd() {
      this.cancelAccPressTimer();
      this.pressingAccId = null;
    },
    onAccMouseDown(e, acc) {
      this.accMouseDown = true;
      this.pressingAccId = acc.id;
      this.accTouchStartX = e.clientX;
      this.accTouchStartY = e.clientY;
      this.cancelAccPressTimer();
      this.accLongPressTimer = setTimeout(() => {
        if (this.accMouseDown && this.pressingAccId === acc.id) {
          this.deleteAccessory(acc);
        }
      }, this.longPressDuration);
    },
    onAccMouseMove(e) {
      if (!this.accMouseDown || !this.pressingAccId) return;
      const dx = e.clientX - this.accTouchStartX;
      const dy = e.clientY - this.accTouchStartY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        this.cancelAccPressTimer();
      }
    },
    onAccMouseUp() {
      this.accMouseDown = false;
      this.cancelAccPressTimer();
      this.pressingAccId = null;
    },
    cancelAccPressTimer() {
      if (this.accLongPressTimer) {
        clearTimeout(this.accLongPressTimer);
        this.accLongPressTimer = null;
      }
    },
    confirmDelete(cam) {
      Modal.confirm({
        centered: true,
        title: '确认删除该设备吗？',
        content: `设备：${cam.name}`,
        okText: '继续',
        cancelText: '取消',
        onOk: () => {
          this.deleteTargetCam = cam;
          this.deleteForm = { username: '', password: '' };
          this.showDeleteModal = true;
        }
      });
    },
    async submitDelete() {
      if (!this.canSubmitDelete || this.deleteLoading) return;
      this.deleteLoading = true;
      const cam = this.deleteTargetCam;
      try {
        const accs = Array.isArray(cam.accessories) ? cam.accessories : [];
        for (const acc of accs) {
          const aid = acc.auxiliaryDeviceId || acc.id || acc.name;
          try {
            await request.post('http://localhost:8084/device/auxiliary/init', null, {
              params: { auxiliaryDeviceId: aid },
              timeout: 10000
            });
          } catch (e) {}
        }
        const res = await request.post('http://localhost:8084/device/init', {
          username: this.deleteForm.username,
          password: this.deleteForm.password
        }, {
          params: { devId: cam.devId },
          timeout: 10000
        });
        if (res && res.code === 1) {
          this.cameras = this.cameras.filter(c => c.id !== cam.id);
          this.updateCounts();
          message.success('删除成功');
          this.showDeleteModal = false;
          this.deleteTargetCam = null;
          this.deleteForm = { username: '', password: '' };
        } else {
          const msg = (res && res.msg) ? res.msg : '删除失败，请重试';
          message.error(msg);
        }
      } catch (e) {
        message.error('网络异常，请检查连接');
      } finally {
        this.deleteLoading = false;
      }
    },
    closeDeleteModal() {
      if (this.deleteLoading) return;
      this.showDeleteModal = false;
      this.deleteTargetCam = null;
      this.deleteForm = { username: '', password: '' };
    },
    openCloudStorage() {
      alert('打开学习记录');
    },
    openAlertSetting() {
      alert('打开提醒设置');
    },
    openShareManage() {
      alert('打开学习房间');
    },
    openDeviceHelp() {
      alert('打开设备帮助中心');
    },
    goToRecord() {
      alert('跳转到学习记录页面');
    },
    goToAlert() {
      alert('跳转到提醒中心页面');
    },
    goToMine() {
      alert('跳转到个人中心页面');
    },
    // 新增：格式化设备编码（自动转为大写）
    formatDeviceCode() {
      this.deviceCode = this.deviceCode.toUpperCase();
    },
    // 新增：通过设备编码绑定设备
    async bindDeviceByCode() {
      if (!this.canBind) return;
      try {
        const res = await request.post('http://localhost:8084/device/bind', {
          username: this.bindUsername,
          password: this.bindPassword
        }, {
          params: { devId: this.deviceCode },
          timeout: 10000
        });
        if (res && res.code === 1) {
          message.success('绑定成功');
          this.showAddDeviceModal = false;
          this.bindUsername = '';
          this.bindPassword = '';
          this.deviceCode = '';
          try {
            const data = await request.get('http://localhost:8084/device/details');
            if (data.code === 1) {
              this.cameras = await Promise.all(data.data.map(async (device) => {
                let online = true;
                if (device.deviceNameOrgin && device.deviceNameOrgin !== 'Null') {
                  try {
                    const o = await axios.get('https://apis.bemfa.com/va/online', {
                      params: {
                        uid: '6fc94297b1a4771e713523fd16d19702',
                        topic: device.deviceNameOrgin,
                        type: 1
                      }
                    });
                    if (o.data.code === 0) {
                      online = o.data.data;
                    }
                  } catch (err) {}
                }
                return {
                  id: device.id,
                  devId: device.devId,
                  name: device.deviceNameUser,
                  type: device.deviceNameOrgin,
                  online,
                  preview: device.imgUrl || `https://picsum.photos/400/300?random=${Date.now()}`,
                  loading: false,
                  accessories: []
                };
              }));
              this.updateCounts();
            } else {
              const fallback = {
                id: Date.now(),
                devId: this.deviceCode,
                name: this.deviceCode,
                type: '新设备',
                online: false,
                preview: `https://picsum.photos/400/300?random=${Date.now()}`,
                loading: false,
                accessories: []
              };
              this.cameras.push(fallback);
              this.updateCounts();
            }
          } catch (e) {
            const fallback = {
              id: Date.now(),
              devId: this.deviceCode,
              name: this.deviceCode,
              type: '新设备',
              online: false,
              preview: `https://picsum.photos/400/300?random=${Date.now()}`,
              loading: false,
              accessories: []
            };
            this.cameras.push(fallback);
            this.updateCounts();
          }
        } else {
          const msg = (res && res.msg) ? res.msg : '绑定失败，请重试';
          message.error(msg);
        }
      } catch (e) {
        message.error('网络异常，请检查连接');
      }
    },
    toggleAccessoryPower(acc, state) {
      if (!acc.online) {
        alert(`${acc.name}当前离线`);
        return;
      }
      acc.powerOn = !!state;
      alert(`${acc.name}${state ? '已打开' : '已关闭'}`);
    },
    onDrawerTouchStart(e) {
      const t = e.target;
      const tag = (t && t.tagName) ? t.tagName.toLowerCase() : '';
      if (['button', 'input', 'select', 'a', 'textarea'].includes(tag) || (t && t.closest && t.closest('.device-actions'))) return;
      e.preventDefault();
      this.dragging = true;
      this.gestureStartY = (e.touches ? e.touches[0].clientY : e.clientY);
      this.gestureStartTime = (performance && performance.now) ? performance.now() : Date.now();
      this.lastMoveY = this.gestureStartY;
      this.lastMoveTime = this.gestureStartTime;
      this.startTranslateY = this.drawerTranslateY;
    },
    onDrawerTouchMove(e) {
      if (!this.dragging) return;
      e.preventDefault();
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      const dy = y - this.gestureStartY;
      const max = this.drawerPanelFullHeight;
      const min = -Math.round(this.drawerPanelFullHeight * 0.12);
      let val = this.startTranslateY + dy;
      if (val < min) val = min;
      if (val > max) val = max;
      this.drawerTranslateY = val;
      const now = (performance && performance.now) ? performance.now() : Date.now();
      this.lastMoveY = y;
      this.lastMoveTime = now;
    },
    onDrawerTouchEnd() {
      this.dragging = false;
      const dt = Math.max(1, ((performance && performance.now) ? performance.now() : Date.now()) - this.gestureStartTime);
      const vy = (this.lastMoveY - this.gestureStartY) / dt;
      let openVelocityThreshold = 0.3; // 上滑易开
      let closeVelocityThreshold = 0.6; // 下滑难关
      const full = this.drawerPanelFullHeight;
      const partialGap = full - this.drawerPanelHeight;
      const y = this.drawerTranslateY;
      const overDragThreshold = -Math.round(full * 0.12);
      // 动态速度阈值：如果速度快，进一步放宽阈值
      if (Math.abs(vy) > 1) {
        openVelocityThreshold = 0.2;
        closeVelocityThreshold = 0.8;
      }
      if (y < overDragThreshold) {
        this.drawerTranslateY = 0;
        this.drawerOpen = true;
        return;
      }
      if (vy < -openVelocityThreshold) { // 上滑速度快 -> 完全展开
        this.drawerTranslateY = 0;
        this.drawerOpen = true;
        return;
      }
      if (vy > closeVelocityThreshold) { // 下滑速度快 -> 关闭
        this.drawerTranslateY = full;
        this.drawerOpen = false;
        return;
      }
      // 非对称阈值：打开阈值低（15%），关闭阈值高（85%）
      const t1 = partialGap; // 调整为 partialGap，使得从 partial 上拉更容易到 full
      const t2 = full * 0.85; // 难关
      // 非对称吸附区间：上侧小（易逃脱到 full），下侧大（难逃脱到 closed）
      const upperSnap = 10;
      const lowerSnap = 30;
      if (y > partialGap - upperSnap && y < partialGap + lowerSnap) {
        this.drawerTranslateY = partialGap;
        this.drawerOpen = true;
        return;
      }
      if (y <= t1) {
        this.drawerTranslateY = 0;
        this.drawerOpen = true;
      } else if (y >= t2) {
        this.drawerTranslateY = full;
        this.drawerOpen = false;
      } else {
        this.drawerTranslateY = partialGap;
        this.drawerOpen = true;
      }
    },
    onDrawerHandleClick() {
      const full = this.drawerPanelFullHeight;
      const partialGap = full - this.drawerPanelHeight;
      const y = this.drawerTranslateY;
      if (y >= full - 1) { // closed -> partial
        this.drawerTranslateY = partialGap;
        this.drawerOpen = true;
      } else if (y > partialGap / 2) { // partial -> full
        this.drawerTranslateY = 0;
        this.drawerOpen = true;
      } else { // full -> closed
        this.drawerTranslateY = full;
        this.drawerOpen = false;
      }
    },
    closeDrawer() {
      this.drawerOpen = false;
      this.drawerTranslateY = this.drawerPanelFullHeight;
      this.assistEditMode = false;
    },
    onBottomNavClick() {
      if (this.drawerTranslateY < this.drawerPanelHeight) {
        this.closeDrawer();
      }
    },
    updateCounts() {
      const cams = this.cameras.length;
      const accs = this.cameras.reduce((s, c) => s + c.accessories.length, 0);
      const onlineCams = this.cameras.filter(c => c.online).length;
      const onlineAccs = this.cameras.reduce((s, c) => s + c.accessories.filter(a => a.online).length, 0);
      this.totalDevices = cams + accs;
      this.onlineDevices = onlineCams + onlineAccs;
    },
    async refreshOnlineStatus(cam, showLoading = true) {
      if (!cam.type || cam.type === 'Null') return;
      if (showLoading && cam.loading) return;
      if (showLoading) cam.loading = true;
      const start = (performance && performance.now) ? performance.now() : Date.now();
      try {
        const res = await axios.get('https://apis.bemfa.com/va/online', {
          params: {
            uid: '6fc94297b1a4771e713523fd16d19702',
            topic: cam.type,
            type: 1
          }
        });
        if (res.data.code === 0) {
          cam.online = res.data.data;
        }
      } catch (err) {
      }
      const now = (performance && performance.now) ? performance.now() : Date.now();
      const elapsed = now - start;
      if (showLoading) {
        const minLoading = 2000;
        if (elapsed < minLoading) {
          await new Promise(r => setTimeout(r, minLoading - elapsed));
        }
        cam.loading = false;
      }
      this.updateCounts();
    },
  },
  destroyed() {
    clearInterval(this.refreshInterval);
    window.removeEventListener('resize', this.onResizeRef);
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

.header-toggle {
  background: transparent;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 12px;
}

.category-filter {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 12px;
  background: #fff;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.device-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.camera-card {
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

.device-status-badge.loading {
  background: #ffc107;
  animation: pulse 2.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.spinner {
  display: inline-block;
  animation: spin 2.5s linear infinite;
  transform-origin: 50% 50%;
}

.spinner-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.spinner-icon svg {
  width: 1em;
  height: 1em;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
  margin-top: 4px;
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

.accessories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.accessory-card {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.accessory-status {
  font-size: 12px;
  margin-bottom: 4px;
}

.accessory-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.accessory-preview {
  width: 100%;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin: 6px 0;
}

.modal-row {
  margin-top: 8px;
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
  transition: background 0.2s ease, color 0.2s ease;
}

.action-btn:active {
  background: #e8f4f8;
  color: #2d8cf0;
}

.action-btn:hover {
  background: #eef6ff;
}

.action-btn.primary {
  background: #2d8cf0;
  color: #fff;
}

.action-btn.primary:hover {
  background: #1a73e8;
}

.action-btn:focus-visible {
  outline: 2px solid #2d8cf0;
  outline-offset: 2px;
}

.action-btn.danger {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn.danger[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.edit-tip {
  margin-top: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eef6ff;
  color: #1a73e8;
  border: 1px solid #d0e4ff;
  border-radius: 8px;
  animation: fadeIn 0.2s ease;
}

.tip-icon {
  font-size: 14px;
}

.tip-exit {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #2d8cf0;
  cursor: pointer;
  font-size: 12px;
}

.tip-exit:hover {
  text-decoration: underline;
}

.empty-state {
  margin-top: 12px;
  padding: 16px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 8px;
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
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
  z-index: 600;
}

.bottom-nav.disabled {
  pointer-events: none;
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

.accessory-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.drawer-container {
  transition: height 0.2s ease;
  overflow: hidden;
}

.drawer-handle {
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  touch-action: none;
}

.drawer-hint {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #dbe8ff;
  position: absolute;
  top: 8px;
}

.drawer-panel {
  background: linear-gradient(#fff, #fafafa);
  height: 300px;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.12);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  z-index: 9998;
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

.aux-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.aux-modal-content {
  background: #fff;
  border-radius: 16px;
  width: 500px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.22s ease;
}

.aux-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.aux-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.aux-modal-close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.aux-top-error {
  color: #ff4d4f;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.aux-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.aux-field {}

.aux-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.aux-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.aux-input:focus {
  border-color: #2d8cf0;
}

.aux-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 6px;
}

.aux-modal-footer {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.aux-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.aux-cancel {
  background: #f5f5f5;
  color: #666;
}

.aux-confirm {
  background: #2d8cf0;
  color: #fff;
}
</style>
/* 使用 Vue 默认过渡类名 */
.v-enter-active,
.v-leave-active {
transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.v-enter-from,
.v-leave-to {
opacity: 0;
transform: translateY(10px) scale(0.98);
}

.v-enter-to,
.v-leave-from {
opacity: 1;
transform: translateY(0) scale(1);
}