<template>
  <Carousel autoplay class="notice">
    <div>
      <h3>1</h3>
    </div>
    <div>
      <h3>2</h3>
    </div>
    <div>
      <h3>3</h3>
    </div>
    <div>
      <h3>4</h3>
    </div>
  </Carousel>
  <!-- 引导区标题 -->
  <div class="section-title">
    <span class="icon">🎯</span>
    <span class="text">引导区</span>
  </div>

  <div class="wenjuan">
    <div class="left">
      <img
        src="../assets/问卷.png"
        class="wenjuan-icon"
      />
      <a-button type="dashed" danger style="font-size: 8px;" @click="into('customization')">点击进入个性化定制</a-button>
    </div>

    <!-- 文字内容 -->
    <div class="wenjuan-text">
      <img
        src="../assets/问卷背景.png"
        style="height: 100%;width: 100%;"
      >
    </div>
  </div>

  <div class="section-title">
    <span class="icon">✨</span>
    <span class="text">功能区</span>
  </div>

  <div class="function">
    <!-- 每日听力 -->
    <div class="item">
      <img src="../assets/Al.png" alt="小智助手">
      <div class="text">小智助手</div>
    </div>

    <!-- 单词宝典 -->
    <div class="item">
      <img src="../assets/单词.png" alt="单词宝典">
      <div class="text">单词宝典</div>
    </div>

    <!-- 智能答疑 -->
    <div class="item">
      <img src="../assets/问答库.png" alt="智能答疑">
      <div class="text">智能答疑</div>
    </div>
  </div>

  <div class="function">
    <!-- 就业分析 -->
    <div class="item">
      <img src="../assets/人脸数据分析.png" alt="就业分析">
      <div class="text">就业分析</div>
    </div>

    <!-- 测试生成 -->
    <div class="item" @click="into('test')">
      <img src="../assets/维修档案.png" alt="测试生成">
      <div class="text">测试生成</div>
    </div>

    <!-- 风险预知 -->
    <div class="item">
      <img src="../assets/风险预知.png" alt="风险预知">
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
      <div v-for="(item,index) in classData" :key="index" style="border-bottom: 1px skyblue solid;">
        <div style="display: flex;flex-direction: row;width: 100%;">
          <a-input :value="item.name" @update:value="val => item.name = val" placeholder="课程名" style="display: flex;flex: 1;"/>
          <a-input :value="item.teacher" @update:value="val => item.teacher = val" placeholder="授课老师" style="display: flex;flex: 1;"/>
        </div>
        <div style="display: flex;flex-direction: row;width: 100%;">
          <a-input :value="item.week" @update:value="val => item.week = val" placeholder="礼拜" style="display: flex;flex: 1;"/>
          <a-input :value="item.location" @update:value="val => item.location = val" placeholder="" style="display: flex;flex: 1;"/>
          <a-input :value="item.color" @update:value="val => item.color = val" placeholder="" style="display: flex;flex: 1;"/>
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
import { onMounted, onUnmounted, ref, computed, nextTick ,reactive} from 'vue'
import { useRouter } from 'vue-router'
import CourseTable from '@/components/CourseTable.vue'
import { InboxOutlined ,PlusCircleOutlined} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { addclass,getclass } from "@/api/class.js"
let animation = null
const showTable = ref(false)
const router = useRouter()
const isModalOpen = ref(false)
const classData = reactive([{
      name: '计算机组成原理',
      week: '五',
      num: [5, 6],
      teacher: '赵六',
      location: 'C304',
      color: '#9370DB', // 同上
    }])
// 生成 1~12 的选项
const timeOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}))

// 路由跳转
const into = (name) => {
  router.push({ name })
}

// ==================== 自定义上传逻辑 ====================
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
        headers: {
          Authorization: token,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total > 0) {
            const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
            onProgress({ percent })
          }
        },
      }
    )
    console.log(response.data)
    if (response.data.code == 1) {
      message.success(`${file.name} 课表图片识别成功`)
      Object.assign(classData, response.data.data.output);
      showModal()
    }
  } catch (error) {
    console.error('上传失败:', error)
    onError(error)

    if (error.response?.status === 401) {
      message.error('登录已过期，请重新登录')
    } else if (error.response?.status === 403) {
      message.error('无权限上传文件')
    } else {
      message.error(`${file.name} 上传失败：${error.message || '网络错误'}`)
    }
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

const handleOk = async() => {
  console.log('✅ 最终课程数据 classData：', classData)
  isModalOpen.value = false
  //这里进行数据库插入
  const res = await addclass(classData)
  console.log(res);
  if (res.code == 1) {
    showTable.value = true
  }
}

const handleCancel = () => {
  isModalOpen.value = false
}

// 👇 新增一行课程（直接 push 到 reactive 数组）
const addNewCourse = () => {
  classData.push({
    name: '',
    teacher: '',
    week: '',
    location: '',
    color: '#1890ff', // 默认蓝色
    num: [], // 默认没选节次
  })
}

onMounted(async() => {
  const response = await getclass()
  console.log(response);
  let num = response.data.course.course.length
  if (num>0) {
    showTable.value = true
  }
})

onUnmounted(() => {
  if (animation) {
    animation.destroy()
  }
})
</script>

<style scoped>
/* 引入美观的中文字体 */
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

.section-title .text {
  position: relative;
  padding-left: 8px;
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

@media (max-width: 768px) {
  .section-title {
    font-size: 16px;
  }
  .section-title .icon {
    font-size: 18px;
  }
}

.notice {
  height: 20%;
  width: 100%;
}

h3 {
  height: 15vh;
  color: #fff;
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
  font-family: 'Microsoft YaHei', sans-serif;
}

.left {
  height: 100%;
  width: 25%;
  display: flex;
  flex-direction: column;
}

.wenjuan-icon {
  height: 80%;
  width: 100%;
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
  justify-content: space-between;
}

.function img {
  height: 60%;
  width: auto;
  margin-left: 10px;
  margin-right: 10px;
}

.function .item {
  margin-left: 10px;
  margin-right: 10px;
}

.course {
  width: 100%;
  height: 20vh;
}
</style>