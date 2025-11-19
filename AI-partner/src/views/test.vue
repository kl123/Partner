<template>
  <div class="question-generator">
    <!-- 配置面板 -->
    <div class="config-panel glass-card">
      <div class="panel-header">
        <h2 class="section-title bg-box">题目生成配置 <img src="../assets/台灯图标.png" class="icon-lamp"></h2>
      </div>
      <div class="form-container">
        <!-- 科目输入卡片（同行布局） -->
        <div class="form-card inline-form">
          <label class="form-label bg-box"><img src="../assets/科目图标.png" class="icon-subject"> 科目：</label>
          <input type="text" v-model="configData.subject" placeholder="例如：数学" 
                 :class="['form-input', { 'input-error': errors.subject }]"
                 @blur="validateField('subject')">
          <span v-if="errors.subject" class="error-message bg-box">{{ errors.subject }}</span>
        </div>
        
        <!-- 知识点描述（独占一行） -->
        <div class="form-group full-width">
          <label class="form-label bg-box"><img src="../assets/描述图标.png" class="icon-knowledge">知识点描述：</label>
          <textarea v-model="configData.description" placeholder="例如：大学的微积分内容" 
                    :class="['form-textarea', { 'input-error': errors.description }]"
                    @blur="validateField('description')"></textarea>
          <span v-if="errors.description" class="error-message bg-box">{{ errors.description }}</span>
        </div>
        
        <!-- 知识点（独占一行） -->
        <div class="form-group full-width">
          <label class="form-label bg-box"><img src="../assets/知识点图标.png" class="icon-tag"> 知识点：</label>
          <input type="text" v-model="configData.display_name" placeholder="例如：微分方程" 
                 :class="['form-input', { 'input-error': errors.display_name }]"
                 @blur="validateField('display_name')">
          <span v-if="errors.display_name" class="error-message bg-box">{{ errors.display_name }}</span>
        </div>
        
        <!-- 难度等级（独占一行） -->
        <div class="form-group full-width">
          <label class="form-label bg-box"><img src="../assets/难度等级图标.png" class="icon-difficulty"> 难度等级 (1-5)：</label>
          <div class="difficulty-slider">
            <input type="range" min="1" max="5" v-model="configData.difficulty" class="slider">
            <span class="difficulty-value bg-box">{{ configData.difficulty }}</span>
          </div>
        </div>
        
        <!-- 题型数量输入区（一行三个卡片） -->
        <div class="form-row">
          <!-- 选择题数量（同行布局） -->
          <div class="form-card inline-form">
            <label class="form-label bg-box"><img src="../assets/数量图标1.png" class="icon-choice"> 选择题：</label>
            <input type="number" min="0" max="10" v-model="configData.choice" 
                   :class="['form-input', { 'input-error': errors.choice }]"
                   @blur="validateField('choice')">
            <span v-if="errors.choice" class="error-message bg-box">{{ errors.choice }}</span>
          </div>
          
          <!-- 判断题数量（同行布局） -->
          <div class="form-card inline-form">
            <label class="form-label bg-box"><img src="../assets/数量图标2.png" class="icon-judge">判断题：</label>
            <input type="number" min="0" max="10" v-model="configData.TorF" 
                   :class="['form-input', { 'input-error': errors.TorF }]"
                   @blur="validateField('TorF')">
            <span v-if="errors.TorF" class="error-message bg-box">{{ errors.TorF }}</span>
          </div>
          
          <!-- 解答题数量（同行布局） -->
          <div class="form-card inline-form">
            <label class="form-label bg-box"><img src="../assets/数量图标3.png" class="icon-essay"> 解答题：</label>
            <input type="number" min="0" max="10" v-model="configData.response" 
                   :class="['form-input', { 'input-error': errors.response }]"
                   @blur="validateField('response')">
            <span v-if="errors.response" class="error-message bg-box">{{ errors.response }}</span>
          </div>
        </div>
      </div>
      
      <button @click="validateAndGenerate" :disabled="loading" class="generate-btn primary-btn">
        <span v-if="loading" class="btn-loading">⏳</span>
        {{ loading ? '生成中...' : '生成题目' }}
      </button>

      <div v-if="!isFormValid" class="form-hint bg-box">
        ⚠️ 请填写所有必填字段并至少设置一种题型的数量
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content bg-box">
        <div class="spinner"></div>
        <p class="loading-text bg-box">✨ 正在生成题目，请稍候...</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      <div class="error-content bg-box">
        <span class="error-icon">⚠️</span>
        <p class="error-text bg-box">{{ error }}</p>
        <button @click="error = ''" class="dismiss-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Test',
  data() {
    return {
      configData: {
        TorF: 1,
        choice: 1,
        description: "大学的微积分内容",
        difficulty: 3,
        display_name: "微分方程",
        response: 1,
        subject: "数学"
      },
      errors: {
        subject: "",
        description: "",
        display_name: "",
        choice: "",
        TorF: "",
        response: ""
      },
      loading: false,
      error: '',
      originalConfig: null
    };
  },
  computed: {
    isFormValid() {
      return (
        (this.configData.choice > 0 || this.configData.TorF > 0 || this.configData.response > 0) &&
        this.configData.subject.trim() !== '' &&
        this.configData.description.trim() !== '' &&
        this.configData.display_name.trim() !== ''
      );
    }
  },
  methods: {
    validateField(field) {
      switch (field) {
        case 'subject':
          this.errors.subject = this.configData.subject.trim() === '' ? '科目不能为空' : '';
          break;
        case 'description':
          this.errors.description = this.configData.description.trim() === '' ? '知识点描述不能为空' : '';
          break;
        case 'display_name':
          this.errors.display_name = this.configData.display_name.trim() === '' ? '显示名称不能为空' : '';
          break;
        case 'choice':
          this.errors.choice = this.configData.choice === '' ? '选择题数量不能为空' : 
                             isNaN(this.configData.choice) ? '请输入有效数字' :
                             this.configData.choice > 10 ? '最多生成10道题' : '';
          break;
        case 'TorF':
          this.errors.TorF = this.configData.TorF === '' ? '判断题数量不能为空' : 
                           isNaN(this.configData.TorF) ? '请输入有效数字' :
                           this.configData.TorF > 10 ? '最多生成10道题' : '';
          break;
        case 'response':
          this.errors.response = this.configData.response === '' ? '解答题数量不能为空' : 
                              isNaN(this.configData.response) ? '请输入有效数字' :
                              this.configData.response > 10 ? '最多生成10道题' : '';
          break;
      }
    },

    validateAllFields() {
      this.validateField('subject');
      this.validateField('description');
      this.validateField('display_name');
      this.validateField('choice');
      this.validateField('TorF');
      this.validateField('response');
      return Object.values(this.errors).every(error => error === '');
    },

    validateQuestionCount() {
      const hasQuestions = this.configData.choice > 0 || this.configData.TorF > 0 || this.configData.response > 0;
      if (!hasQuestions) {
        this.error = '请至少设置一种题型的数量（大于0）';
        setTimeout(() => {
          this.error = '';
        }, 3000);
        return false;
      }
      return true;
    },

    async validateAndGenerate() {
      const fieldsValid = this.validateAllFields();
      const questionsValid = this.validateQuestionCount();
      if (!fieldsValid || !questionsValid) return;
      await this.generateQuestions();
    },

    async generateQuestions() {
      this.loading = true;
      this.error = '';
      try {
        const requestData = {
          need: {
            TorF: Number(this.configData.TorF),
            choice: Number(this.configData.choice),
            description: this.configData.description,
            difficulty: Number(this.configData.difficulty),
            display_name: this.configData.display_name,
            response: Number(this.configData.response),
            subject: this.configData.subject,
          }
        };

        const response = await axios.post('http://localhost:8085/workflow/TestAIrun', requestData);
        let questions = [];
        if (response.data && response.data.data) {
          const data = response.data.data;
          const halfLength = Math.ceil(data.length / 2);
          for (let i = 0; i < halfLength; i++) {
            let questionText = data[i];
            let answerText = data[i + halfLength] || '';
            let type = 'essay';
            if (questionText.includes('判断题')) type = 'judgment';
            else if (questionText.includes('选择题')) type = 'choice';
            
            // 优化答案格式化逻辑
            answerText = answerText
              .replace(/[\u3002\uff1b\uff1a]/g, '')
              .replace(/答案/g, '')
              .replace(/\n/g, '<br>')
              .replace(/\\\(|\)\\/g, ' ');
            
            questionText = questionText
              .replace(/\n/g, '<br>')
              .replace(/\\\(|\)\\/g, ' ');

            questions.push({
              id: i + 1,
              text: questionText,
              type: type,
              answer: answerText,
              userAnswer: false,
              showAnswer: false,
              isSubmitted: false,
              options: type === 'choice' ? ["选项A", "选项B", "选项C", "选项D"] : [],
              isCorrect: false
            });
          }
        } else {
          questions = this.generateMockQuestions();
        }

        // ✅ 关键：存储到 localStorage
        this.saveToLocalStorage(questions);
        // 路由传参优化（使用params避免URL暴露）
        this.$router.push({
          name: 'testgo'
        });

      } catch (error) {
        console.error('生成题目失败:', error);
        this.error = '生成题目失败，请检查网络连接或API地址';
        setTimeout(() => {
          this.error = '';
        }, 3000);
        const questions = this.generateMockQuestions();
        console.log('使用模拟题目:', questions);
        console.log('geshi:', typeof questions);
        // 即使出错也生成模拟题目并存储
        this.saveToLocalStorage(questions);
        this.$router.push({
          name: 'testgo'
        });
      } finally {
        this.loading = false;
      }
    },

saveToLocalStorage(questions) {
    try {
      // 存储题目数据
      localStorage.setItem('testQuestions', JSON.stringify(questions));
      // 存储配置数据
      localStorage.setItem('testConfig', JSON.stringify(this.configData));
      // 存储时间戳，用于数据验证
      localStorage.setItem('testTimestamp', Date.now().toString());
      
      console.log('✅ 数据已保存到本地存储');
      console.log('题目数量:', questions.length);
      console.log('配置:', this.configData);
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  },


    generateMockQuestions() {
      const mockQuestions = [];
      // 选择题
      for (let i = 0; i < this.configData.choice; i++) {
        mockQuestions.push({
          id: mockQuestions.length + 1,
          type: "choice",
          text: `微分方程相关选择题 ${i + 1}`,
          options: ["选项A", "选项B", "选项C", "选项D"],
          answer: "选项A",
          userAnswer: null,
          showAnswer: false,
          isSubmitted: false,
          isCorrect: false
        });
      }
      // 判断题
      for (let i = 0; i < this.configData.TorF; i++) {
        mockQuestions.push({
          id: mockQuestions.length + 1,
          type: "judgment",
          text: `微分方程相关判断题 ${i + 1}`,
          answer: i % 2 === 0 ? "正确" : "错误",
          userAnswer: null,
          showAnswer: false,
          isSubmitted: false,
          isCorrect: false,
          options: []
        });
      }
      // 解答题
      for (let i = 0; i < this.configData.response; i++) {
        mockQuestions.push({
          id: mockQuestions.length + 1,
          type: "essay",
          text: `求解微分方程相关问题 ${i + 1}`,
          answer: "解题步骤：<br>1. 确定方程类型<br>2. 选择合适的求解方法<br>3. 代入初始条件<br>4. 验证解的正确性",
          userAnswer: null,
          showAnswer: false,
          isSubmitted: false,
          isCorrect: false,
          options: []
        });
      }
      return mockQuestions;
    }
  }
};
</script>

<style scoped>
/* 基础样式重置 - 加深背景色 */
.question-generator {
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  /* 加深背景色：深蓝色系渐变，更沉稳 */
  background: linear-gradient(135deg, #6686df 0%, #748dde 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px 20px;
}

/* 外层玻璃卡片 - 半透明白色，与深色背景形成对比 */
.glass-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 28px;
  /* 深色背景下增强阴影，提升层次感 */
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(240, 244, 248, 0.9);
  width: 100%;
  max-width: 700px;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f4f8;
  text-align: center;
}

/* 标题圆弧框 - 淡蓝色，与深色背景协调 */
.section-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #1e3a8a; /* 深色文字，提高可读性 */
  margin: 0;
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.5px;
  padding: 12px 24px;
}

.icon-lamp {
  margin-left: 10px;
  font-size: 1.3rem;
  color: #3b82f6; /* 淡蓝色图标 */
}

/* 表单容器：统一间距 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

/* 一行多卡片布局 */
.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 输入框背景卡片 - 淡灰色，比之前更淡 */
.form-card {
  background-color: #f8fafc; /* 极淡的灰色，接近白色但有层次 */
  border-radius: 20px;
  padding: 18px;
  /* 深色背景下阴影调整为柔和深色 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0; /* 淡灰色边框 */
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
}

/* 卡片hover效果 - 阴影加深，轻微上浮 */
.form-card:hover {
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
  transform: translateY(-2px);
  border-color: #cbd5e1;
}

/* 同行布局核心样式 */
.inline-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 独占一行的表单组 */
.full-width {
  width: 100%;
}

/* 标签圆弧框 - 淡蓝色，更浅的色调 */
.form-label {
  font-weight: 500;
  color: #1e3a8a; /* 深色文字，提高可读性 */
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  white-space: nowrap;
}

.form-label i {
  color: #3b82f6; /* 淡蓝色图标 */
  font-size: 1.1rem;
}

/* 同行布局的输入框 */
.inline-form .form-input {
  flex: 1;
  min-width: 100px;
}

/* 输入框样式 - 极淡的背景，淡边框 */
.form-input, .form-textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0; /* 淡灰色边框 */
  border-radius: 14px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #ffffff; /* 白色背景，突出输入区域 */
  color: #1e293b; /* 深色文字，提高可读性 */
}

/* 输入框聚焦状态 - 淡蓝色边框和阴影 */
.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #93c5fd; /* 极淡的蓝色边框 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); /* 淡蓝色阴影 */
}

.form-textarea {
  min-height: 90px;
  resize: vertical;
  line-height: 1.6;
  width: 100%;
}

/* 难度滑块样式 - 适配深色背景 */
.difficulty-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  width: 100%;
  max-width: 500px;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0; /* 淡灰色滑块背景 */
  outline: none;
  -webkit-appearance: none;
}

/* 滑块按钮 - 淡蓝色 */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6; /* 淡蓝色滑块 */
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: #2563eb; /* hover时加深一点蓝色 */
}

/* 难度数值圆弧框 - 淡蓝色 */
.difficulty-value {
  font-weight: 600;
  color: #1e3a8a;
  min-width: 28px;
  text-align: center;
  font-size: 1.05rem;
  padding: 6px 12px;
}

/* 生成按钮 - 渐变蓝色，比之前稍淡 */
.primary-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); /* 淡蓝色渐变 */
  color: white;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); /* hover时加深 */
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 表单提示 - 淡黄色 */
.form-hint {
  margin-top: 16px;
  padding: 12px 16px;
  color: #92400e;
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: center;
}

/* 加载状态 - 适配深色背景 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7); /* 深色半透明背景 */
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: #f8fafc; /* 淡灰色卡片 */
  padding: 32px 48px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #dbeafe; /* 淡蓝色边框 */
  border-top: 4px solid #3b82f6; /* 淡蓝色进度条 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #1e3a8a;
  font-weight: 500;
  font-size: 1.05rem;
  padding: 10px 20px;
  margin: 0;
}

/* 错误提示 - 淡红色 */
.error-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 1000;
  animation: slideIn 0.3s ease forwards;
}

.error-content {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
}

.error-icon {
  font-size: 1.2rem;
  color: #ef4444;
}

.error-text {
  color: #b91c1c;
  margin: 0;
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 6px 12px;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #b91c1c;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.dismiss-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 错误输入样式 - 淡红色边框和阴影 */
.input-error {
  border-color: #fecaca !important; /* 淡红色边框 */
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08) !important; /* 淡红色阴影 */
}

.error-message {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 4px;
  display: inline-block;
  line-height: 1.4;
  padding: 6px 12px;
  width: 100%;
  margin-left: 0;
}

/* 圆弧框通用样式 - 统一淡色调 */
.bg-box {
  border-radius: 30px;
  background-color: #eff6ff; /* 极淡的蓝色背景 */
  transition: all 0.2s ease;
}

/* 不同文字区域的圆弧框配色区分 - 均调淡 */
.section-title.bg-box {
  background-color: #dbeafe; /* 淡蓝色 */
  border: 1px solid #bfdbfe; /* 更淡的蓝色边框 */
}

.form-label.bg-box {
  background-color: #eff6ff; /* 极淡的蓝色 */
  border: 1px solid #dbeafe; /* 淡蓝色边框 */
}

.difficulty-value.bg-box {
  background-color: #dbeafe; /* 淡蓝色 */
  border: 1px solid #bfdbfe; /* 淡蓝色边框 */
}

.error-message.bg-box {
  background-color: #fee2e2; /* 极淡的红色 */
  border: 1px solid #fecaca; /* 淡红色边框 */
}

.form-hint.bg-box {
  background-color: #fffbeb; /* 极淡的黄色 */
  border: 1px solid #fef3c7; /* 淡黄色边框 */
}

.loading-text.bg-box {
  background-color: #eff6ff; /* 极淡的蓝色 */
  border: 1px solid #dbeafe; /* 淡蓝色边框 */
}

.error-content.bg-box {
  background-color: #fee2e2; /* 极淡的红色 */
  border: 1px solid #fecaca; /* 淡红色边框 */
}

.error-text.bg-box {
  background-color: #fef2f2; /* 极淡的红色 */
  border: 1px solid #fee2e2; /* 淡红色边框 */
}

/* 图标样式 */
.icon-subject {
  content: "📚";
}
.icon-knowledge {
  content: "📖";
}
.icon-tag {
  content: "🏷️";
}
.icon-difficulty {
  content: "🎯";
}
.icon-choice {
  content: "🔘";
}
.icon-judge {
  content: "✅";
}
.icon-essay {
  content: "✍️";
}

/* 响应式适配 */
@media (max-width: 768px) {
  .glass-card {
    max-width: 100%;
    padding: 20px 16px;
  }
  
  .form-row {
    gap: 12px;
  }
  
  .form-card {
    min-width: 100%;
  }
  
  .inline-form {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.4rem;
    padding: 10px 20px;
  }
  
  .form-card {
    padding: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  
  .form-label {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
  
  .form-input, .form-textarea {
    padding: 10px 14px;
    font-size: 0.95rem;
  }
  
  .inline-form .form-input {
    min-width: 80px;
  }
  
  .bg-box {
    border-radius: 24px;
  }
}
</style>