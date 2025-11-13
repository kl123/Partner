<template>
  <Carousel autoplay class="notice" effect="fade" dots>
    <div
      v-for="(item, index) in noticeItems"
      :key="index"
      class="notice-slide"
    >
      <div
        :id="item.id"
        class="lottie-animation"
        style="height: 60%; width: 100%;"
      ></div>
      <div class="notice-item">
        <span class="notice-icon">{{ item.icon }}</span>
        <div class="notice-content">
          <strong>{{ item.title }}</strong>
          <span>{{ item.desc }}</span>
        </div>
      </div>
    </div>
  </Carousel>

  <!-- 引导区标题 -->
  <div class="section-title">
    <span class="icon">🎯</span>
    <span class="text">引导区</span>
  </div>

  <div class="wenjuan">
    <div class="left">
      <img src="../assets/问卷.png" class="wenjuan-icon" />
      <a-button type="dashed" danger style="font-size: 8px;" @click="into('customization')">
        点击进入个性化定制
      </a-button>
    </div>
    <div class="wenjuan-text">
      <img src="../assets/问卷背景.png" style="height: 100%; width: 100%;" />
    </div>
  </div>

  <div class="section-title">
    <span class="icon">✨</span>
    <span class="text">功能区</span>
  </div>

  <div class="function">
    <div class="item" @click="into('ai-buddy')">
      <img src="../assets/Al.png" alt="智能AI学习搭子" />
      <div class="text">智能AI学习搭子</div>
    </div>
    <div class="item">
      <img src="../assets/单词.png" alt="单词宝典" />
      <div class="text">单词宝典</div>
    </div>
    <div class="item">
      <img src="../assets/问答库.png" alt="智能答疑" />
      <div class="text">智能答疑</div>
    </div>
  </div>

  <div class="function">
    <div class="item">
      <img src="../assets/人脸数据分析.png" alt="就业分析" />
      <div class="text">就业分析</div>
    </div>
    <div class="item" @click="into('test')">
      <img src="../assets/维修档案.png" alt="测试生成" />
      <div class="text">测试生成</div>
    </div>
    <div class="item">
      <img src="../assets/风险预知.png" alt="风险预知" />
      <div class="text">风险预知</div>
    </div>
  </div>

  <div class="course" v-if="showTable">
    <CourseTable />
  </div>

  <!-- 课表图片识别 -->
  <div class="course" v-if="!showTable">
    <a-upload-dragger
      v-bind="uploadProps"
      @change="handleChange"
      @drop="handleDrop"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">请上传课表图片文件进行识别!</p>
      <p class="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibited from uploading company data or other
        banned files.
      </p>
    </a-upload-dragger>
  </div>

  <!-- 课程确认弹窗 -->
  <Modal
    title="📖课程确认"
    :open="isModalOpen"
    @ok="handleOk"
    @cancel="handleCancel"
    :centered="true"
    width="800px"
  >
    <div style="max-height: 70vh; overflow-y: auto; padding: 0 20px;">
      <div v-for="(item, index) in classData" :key="index" style="border-bottom: 1px skyblue solid;">
        <div style="display: flex; flex-direction: row; width: 100%;">
          <a-input
            :value="item.name"
            @update:value="val => item.name = val"
            placeholder="课程名"
            style="flex: 1;"
          />
          <a-input
            :value="item.teacher"
            @update:value="val => item.teacher = val"
            placeholder="授课老师"
            style="flex: 1;"
          />
        </div>
        <div style="display: flex; flex-direction: row; width: 100%;">
          <a-input
            :value="item.week"
            @update:value="val => item.week = val"
            placeholder="礼拜"
            style="flex: 1;"
          />
          <a-input
            :value="item.location"
            @update:value="val => item.location = val"
            placeholder="教室"
            style="flex: 1;"
          />
          <a-input
            :value="item.color"
            @update:value="val => item.color = val"
            placeholder="颜色"
            style="flex: 1;"
          />
        </div>
        <div style="margin: 10px 0;">
          <span>选择节次：</span>
          <a-checkbox-group
            :value="item.num"
            :options="timeOptions"
            style="display: flex; flex-wrap: wrap; gap: 8px;"
            @update:value="(val) => item.num = val"
          />
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a-button type="dashed" @click="addNewCourse">
          <PlusCircleOutlined /> 新增一行课程
        </a-button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { Modal } from 'ant-design-vue'
import { Carousel } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import CourseTable from '@/components/CourseTable.vue'
import { InboxOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { addclass, getclass } from '@/api/class.js'
import lottie from 'lottie-web'

// 🎯 Lottie 动画文件
import lottieJson from '@/assets/animate/答疑.json'
import lottieJson1 from '@/assets/animate/进度分析.json'
import lottieJson2 from '@/assets/animate/错题分析.json'
import lottieJson3 from '@/assets/animate/风险预测.json'

// ==================== 轮播图数据 + 动画管理 ====================
const noticeItems = reactive([
  {
    id: 'lottie_0',
    icon: '🧠',
    title: '智能答疑',
    desc: '随时解答难题，学习不卡壳',
    json: lottieJson,
  },
  {
    id: 'lottie_1',
    icon: '📊',
    title: '进度追踪',
    desc: '学习路径可视化，目标更清晰',
    json: lottieJson1,
  },
  {
    id: 'lottie_2',
    icon: '🔍',
    title: '错题分析',
    desc: '精准定位薄弱点，高效提分',
    json: lottieJson2,
  },
  {
    id: 'lottie_3',
    icon: '⚠️',
    title: '风险预知',
    desc: '提前预警学习风险，防患未然',
    json: lottieJson3,
  },
])

// 🎬 统一初始化函数
function initLottie(item) {
  const container = document.getElementById(item.id)
  if (!container) return

  if (item.animation) {
    item.animation.destroy()
  }

  item.animation = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: item.json,
  })
}

onMounted(() => {
  noticeItems.forEach(initLottie)

  // 检查是否有课表数据
  getclass().then(res => {
    if (res.data?.course?.course?.length > 0) {
      showTable.value = true
    }
  })
})

onUnmounted(() => {
  noticeItems.forEach(item => {
    if (item.animation) {
      item.animation.destroy()
    }
  })
})

// ==================== 其他功能逻辑 ====================
const showTable = ref(false)
const router = useRouter()
const isModalOpen = ref(false)
const classData = reactive([
  {
    name: '计算机组成原理',
    week: '五',
    num: [5, 6],
    teacher: '赵六',
    location: 'C304',
    color: '#9370DB',
  },
])

const timeOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}))

const into = (name) => {
  router.push({ name })
}

// 上传逻辑
const customUploadRequest = async ({ file, onSuccess, onError, onProgress }) => {
  const formData = new FormData()
  formData.append('file', file)
  const token = localStorage.getItem('token')

  if (!token) {
    message.error('未检测到登录凭证，请先登录')
    onError(new Error('No token provided'))
    return
  }

  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_BASE_API + '/IndividualPlaning/create',
      formData,
      {
        headers: { Authorization: token },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total > 0) {
            const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
            onProgress({ percent })
          }
        },
      }
    )

    if (response.data.code === 1) {
      message.success(`${file.name} 课表图片识别成功`)
      Object.assign(classData, response.data.data.output)
      showModal()
    }
  } catch (error) {
    console.error('上传失败:', error)
    onError(error)
    message.error(`${file.name} 上传失败：${error.message || '网络错误'}`)
  }
}

const uploadProps = {
  name: 'file',
  multiple: true,
  customRequest: customUploadRequest,
}

const showModal = () => {
  isModalOpen.value = true
}

const handleOk = async () => {
  const res = await addclass(classData)
  if (res.code === 1) {
    showTable.value = true
  }
  isModalOpen.value = false
}

const handleCancel = () => {
  isModalOpen.value = false
}

const addNewCourse = () => {
  classData.push({
    name: '',
    teacher: '',
    week: '',
    location: '',
    color: '#1890ff',
    num: [],
  })
}

// 占位函数（你原代码有，但未实现）
const handleChange = () => {}
const handleDrop = () => {}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 10px 10px;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #4a4a4a;
  letter-spacing: 0.5px;
}
.section-title .icon {
  font-size: 20px;
}
.section-title .text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #46b8ff, #1890ff);
  border-radius: 2px;
}

.notice {
  height: 20%;
  width: 100%;
}
.notice-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 20vh;
  width: 100%;

}
.notice-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: #333;
}
.notice-icon {
  font-size: 24px;
}
.notice-content strong {
  font-weight: 600;
}
.notice-content span {
  font-size: 12px;
  color: #666;
}

.wenjuan {
  height: 15vh;
  width: 95%;
  margin: 10px auto;
  background-color: #46b8ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(70, 184, 255, 0.2);
  color: white;
}
.left {
  height: 100%;
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.wenjuan-icon {
  height: 60%;
  width: auto;
  opacity: 0.95;
}
.wenjuan-text {
  width: 75%;
  height: 100%;
}

.function {
  height: 10%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 10px;
  box-sizing: border-box;
}
.function .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.function img {
  height: 60%;
  width: auto;
}
.function .text {
  font-size: 12px;
  color: #333;
}

.course {
  width: 100%;
  height: 20vh;
}

@media (max-width: 768px) {
  .section-title { font-size: 16px; }
  .notice-item { font-size: 13px; padding: 6px 12px; }
  .notice-icon { font-size: 20px; }
  .notice-content strong { font-size: 13px; }
  .notice-content span { font-size: 11px; }
}
</style>