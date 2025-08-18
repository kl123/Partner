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
            name="subject"
            :rules="[{ required: true, message: '请输入你想学习的学科' }]"
          >
            <a-input
              v-model:value="formData.subject"
              placeholder="例如：编程、数学、心理学、设计"
              allow-clear
            />
          </a-form-item>
  
          <!-- 问题2：希望每天学习时长 -->
          <a-form-item
            label="你希望每天学习多长时间？"
            name="duration"
            :rules="[{ required: true, message: '请选择一个学习时长' }]"
          >
            <a-select
              v-model:value="formData.duration"
              placeholder="选择每天学习时间"
            >
              <a-select-option value="30分钟">30分钟</a-select-option>
              <a-select-option value="1小时">1小时</a-select-option>
              <a-select-option value="1.5小时">1.5小时</a-select-option>
              <a-select-option value="2小时">2小时</a-select-option>
              <a-select-option value="2小时以上">2小时以上</a-select-option>
            </a-select>
          </a-form-item>
  
          <!-- 问题3：每周哪几天学习 -->
          <a-form-item
            label="你通常在每周哪些时间学习？"
            name="days"
            :rules="[{ required: true, message: '请至少选择一天' }]"
          >
            <a-checkbox-group v-model:value="formData.days">
              <a-row :gutter="[8, 8]">
                <a-col :span="12" v-for="day in weekDays" :key="day">
                  <a-checkbox :value="day">{{ day }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
  
          <!-- 问题4：学习目标 -->
          <a-form-item
            label="你的学习主要目标是？"
            name="goal"
            :rules="[{ required: true, message: '请选择一个目标' }]"
          >
            <a-radio-group v-model:value="formData.goal">
              <a-radio value="job">找工作或提升职业技能</a-radio>
              <a-radio value="exam">通过考试或完成学业</a-radio>
              <a-radio value="hobby">兴趣驱动，自我提升</a-radio>
            </a-radio-group>
          </a-form-item>
  
          <!-- 提交按钮 -->
          <a-form-item :wrapper-col="{ xs: { span: 24, offset: 0 }, sm: { span: 12, offset: 8 } }">
            <a-button type="primary" html-type="submit" size="large" block>
              生成我的个性化学习计划 🚀
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter} from 'vue-router'
  import { LeftOutlined } from '@ant-design/icons-vue'

  const router = useRouter()
  // 一周的天数
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  // 表单数据
  const formData = reactive({
    subject: '',
    duration: undefined,
    days: [],
    goal: undefined
  })
  
  // 提交处理
  const handleSubmit = () => {
    console.log('表单数据:', formData)
    // 这里可以发送到后端，或跳转到学习计划页
    // 例如：router.push({ name: 'Plan', params: formData })
    alert(`感谢提交！我们将为你定制：${formData.subject} 的学习计划。`)
  }

  //退出
  const quit = () => {
    router.back()
  }
  </script>
  
  <style scoped>
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
  </style>