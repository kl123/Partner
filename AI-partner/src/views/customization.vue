<!-- 这个页面用于调查用户的学习目的包括想了解学科,希望每天学习时长,周几学习,是否面向找工作还是通过学业 -->
<template>
    <div @click="quit()">
      <LeftOutlined style="margin-left: 10px;margin-top: 10px;"/>
      <text>返回</text>
    </div>
    <div class="survey-container">
      <!-- 顶部标题 -->
      <a-card class="survey-header" :bordered="false">
        <h1 class="title">AI 个性学习助手</h1>
        <p class="subtitle">为了更好地为你定制学习计划，请完成以下小调查 🌟</p>
      </a-card>
  
      <!-- 问卷表单 -->
      <a-card class="survey-form-card">
        <a-form
          :model="formData"
          :label-col="{ xs: { span: 24 }, sm: { span: 8 } }"
          :wrapper-col="{ xs: { span: 24 }, sm: { span: 12 } }"
          layout="vertical"
          autocomplete="off"
        >
          <!-- 问题1：想了解的学科 -->
          <a-form-item
            label="你最想了解的学科是？"
            name="concept"
            :rules="[{ required: true, message: '请输入你想学习的学科' }]"
          >
            <a-input
              v-model:value="formData.concept"
              placeholder="例如：编程、数学、心理学、设计"
              allow-clear
            />
          </a-form-item>
  
          <!-- 问题2：希望每天学习时长 -->
          <a-form-item
            label="你希望每天学习多长时间？"
            name="time"
            :rules="[{ required: true, message: '请选择一个学习时长' }]"
          >
            <a-select
              v-model:value="formData.time"
              placeholder="选择每天学习时间"
            >
              <a-select-option :value="1">1小时</a-select-option>
              <a-select-option :value="2">2小时</a-select-option>
              <a-select-option :value="3">3小时</a-select-option>
              <a-select-option :value="4">4小时</a-select-option>
              <a-select-option :value="5">4小时以上</a-select-option>
            </a-select>
          </a-form-item>
  
          <!-- 问题3：每周哪几天学习 -->
          <a-form-item
            label="你通常在每周哪些时间学习？"
            name="week"
            :rules="[{ required: true, message: '请至少选择一天' }]"
          >
            <a-checkbox-group v-model:value="formData.week">
              <a-row :gutter="[8, 8]">
                <a-col :span="12" v-for="day in weekweek" :key="day">
                  <a-checkbox :value="day">{{ day }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
  
          <!-- 提交按钮 -->
          <a-form-item :wrapper-col="{ xs: { span: 24, offset: 0 }, sm: { span: 12, offset: 8 } }">
            <!-- html-type="submit" -->
            <a-button type="primary"  size="large" @click="handleSubmit()" block>
              生成我的个性化学习计划 🚀
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <!-- 阴影背景层 -->
    <div
      v-if="showShadow"
      class="shadow-overlay"
      @click="showShadow = false"
    >
    </div>
    <div id="lottie_demo" class="lottie-animation" v-if="showShadow"></div>
    <p class="loading-text" v-if="showShadow">正在生成学习路径，请稍后...</p>
  </template>
  
  <script setup>
  import { ref, reactive, nextTick } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { LeftOutlined } from '@ant-design/icons-vue'
  import { message } from 'ant-design-vue'
  import { createPlan } from "@/api/Study.js"
  import lottie from 'lottie-web'
  import lottieJson from '../assets/animate/Load.json'

  const router = useRouter()

  // 控制阴影层显示/隐藏
  const showShadow = ref(false)

  // 一周的天数
  const weekweek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  // 星期映射表
  const weekMap = {
    '周一': 1,
    '周二': 2,
    '周三': 3,
    '周四': 4,
    '周五': 5,
    '周六': 6,
    '周日': 7
  }

  // 表单数据（time 初始化为 null 或 undefined，避免默认字符串）
  const formData = reactive({
    concept: '',
    time: null,  // 使用 null 表示未选择
    week: []
  })

  // 加载动画
  let animation = null
  function initLottie() {
    const container = document.getElementById('lottie_demo')
    if (!container) return

    if (animation) {
      animation.destroy()
    }

    animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: lottieJson
    })
  }

  // 提交处理（含表单验证 + 数据转换）
  const handleSubmit = () => {
    // ✅ 表单完整性验证
    if (!formData.concept.trim()) {
      alert('请填写你想学习的学科！')
      return
    }
    if (formData.time === null || formData.time === undefined) {
      alert('请选择每天学习时长！')
      return
    }
    if (!Array.isArray(formData.week) || formData.week.length === 0) {
      alert('请至少选择一个学习日期！')
      return
    }

    const weekNumbers = formData.week.map(day => weekMap[day]).sort((a, b) => a - b)

  const submitData = {
    concept: formData.concept.trim(),
    time: Number(formData.time),  // ✅ 转成数字
    week: weekNumbers
  }

  console.log('✅ 提交数据:', submitData)
  console.log('time 类型:', typeof submitData.time)

  showShadow.value = true
  nextTick(() => {
    initLottie()
    // ✅ 传 submitData
    request_py(submitData)  // ✅ 这里要传参数！
  })
  }

  //发送py请求
  const request_py = async (param) => {
    try{
      const response = await axios.post("http://localhost:8085/workflow/run", {
        need: param 
      })
      console.log(response.data.all_nodes)
      console.log(response.data.learn_path)
      // 进行后端数据存储
      const res = await createPlan(response.data)
      console.log(res);
      enterSuccess()
    }catch(error){
      message.error('AI 生成学习计划失败，请稍后重试', 5)
    }
}
  // 退出
  const quit = () => {
    router.back()
  }

  // 跳转到成功页
  const enterSuccess = () => {
    router.push({
      name: "success",
      query: {
        dest: 'study',
        mes:formData.concept+"学习路径生成完毕"
      }
    })
  }
  </script>
  
  <style scoped>
  /* 阴影背景层 */
.shadow-overlay {
    position: fixed; /* 固定定位，覆盖整个视口 */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
    transition: opacity 0.3s ease; /* 可选：淡入淡出效果 */
}
  .survey-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  
  .survey-header {
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px !important;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .title {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
  
  .subtitle {
    margin: 8px 0 0;
    font-size: 16px;
    opacity: 0.9;
  }
  
  .survey-form-card {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    background-color: #fff;
  }
  
  /* 小屏幕优化 */
  @media (max-width: 576px) {
    .survey-container {
      padding: 12px;
    }
  
    .survey-header {
      padding: 20px 16px;
    }
  
    .title {
      font-size: 24px;
    }
  
    .subtitle {
      font-size: 14px;
    }
  }
.lottie-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: transparent;
  z-index: 1001;
}
.loading-text {
  position: absolute;
  top: calc(50% + 120px); /* 在动画下方 */
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  pointer-events: none; /* 防止文字阻挡点击 */
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out 0.3s forwards;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
  </style>