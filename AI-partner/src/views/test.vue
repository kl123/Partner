<template>
  <div class="question-generator">
    <!-- 配置面板 -->
    <div class="config-panel glass-card">
      <h2 class="section-title">📝 题目生成配置</h2>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">📚 科目：</label>
          <input type="text" v-model="configData.subject" placeholder="例如：数学" 
                 :class="['form-input', { 'input-error': errors.subject }]"
                 @blur="validateField('subject')">
          <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">🎯 知识点描述：</label>
          <textarea v-model="configData.description" placeholder="例如：关于大学的微积分内容" 
                    :class="['form-textarea', { 'input-error': errors.description }]"
                    @blur="validateField('description')"></textarea>
          <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">🏷️ 知识点：</label>
          <input type="text" v-model="configData.display_name" placeholder="例如：微分方程" 
                 :class="['form-input', { 'input-error': errors.display_name }]"
                 @blur="validateField('display_name')">
          <span v-if="errors.display_name" class="error-message">{{ errors.display_name }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">⭐ 难度等级 (1-5)：</label>
          <div class="difficulty-slider">
            <input type="range" min="1" max="5" v-model="configData.difficulty" class="slider">
            <span class="difficulty-value">{{ configData.difficulty }}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">🔢 选择题数量：</label>
          <input type="number" min="0" max="10" v-model="configData.choice" 
                 :class="['form-input', { 'input-error': errors.choice }]"
                 @blur="validateField('choice')">
          <span v-if="errors.choice" class="error-message">{{ errors.choice }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">🔢 判断题数量：</label>
          <input type="number" min="0" max="10" v-model="configData.TorF" 
                 :class="['form-input', { 'input-error': errors.TorF }]"
                 @blur="validateField('TorF')">
          <span v-if="errors.TorF" class="error-message">{{ errors.TorF }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">🔢 解答题数量：</label>
          <input type="number" min="0" max="10" v-model="configData.response" 
                 :class="['form-input', { 'input-error': errors.response }]"
                 @blur="validateField('response')">
          <span v-if="errors.response" class="error-message">{{ errors.response }}</span>
        </div>
      </div>
      
      <button @click="validateAndGenerate" :disabled="loading" class="generate-btn primary-btn">
        <span v-if="loading" class="btn-loading">⏳</span>
        {{ loading ? '生成中...' : '🚀 生成题目' }}
      </button>

      <div v-if="!isFormValid" class="form-hint">
        ⚠️ 请填写所有必填字段并至少设置一种题型的数量
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="questions.length === 0 && !loading" class="empty-state glass-card">
      <div class="empty-content">
        <div class="empty-icon">📚</div>
        <h3>暂无题目</h3>
        <p>请先配置题目参数并点击"生成题目"按钮</p>
        <div class="empty-tips">
          <p>💡 使用提示：</p>
          <ul>
            <li>设置选择题、判断题、解答题的数量</li>
            <li>至少设置一种题型的数量（大于0）</li>
            <li>填写所有必填字段（科目、知识点描述、显示名称）</li>
            <li>调整难度等级</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 题目展示区域 -->
    <div class="questions-container" v-else-if="questions.length > 0">
      <h2 class="section-title">📋 生成的题目</h2>
      
      <div v-for="(question, index) in questions" :key="index" class="question-card glass-card">
        <div class="question-header">
          <span class="question-number">{{ index + 1 }}</span>
          <!-- <span class="question-type" :class="getTypeClass(question.type)">{{ question.type }}</span> -->
        </div>
        
        <div class="question-content" v-html="formatQuestionContent(question.text)"></div>
        
        <!-- 选择题选项 -->
        <div v-if="question.type === 'choice'" class="options-grid">
          <div v-for="(option, optIndex) in question.options" :key="optIndex" 
               class="option-item" :class="{ selected: question.userAnswer === optIndex }"
               @click="selectOption(question, optIndex)">
            <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>
        
        <!-- 判断题选项 -->
        <div v-if="question.type === 'judgment'" class="true-false-grid">
          <button class="tf-btn true-btn" :class="{ selected: question.userAnswer === true }" 
                  @click="question.userAnswer = true">
            ✅ 正确
          </button>
          <button class="tf-btn false-btn" :class="{ selected: question.userAnswer === false }" 
                  @click="question.userAnswer = false">
            ❌ 错误
          </button>
        </div>
        
        <!-- 解答题输入区域 -->
        <div v-if="question.type === 'essay'" class="answer-area">
          <textarea v-model="question.userAnswer" placeholder="✏️ 请输入您的解答..." 
                    class="answer-textarea"></textarea>
        </div>
        
        <!-- 答案提交和显示 -->
        <div class="question-actions">
          <button @click="submitAnswer(question)" class="submit-btn secondary-btn">
            📤 提交答案
          </button>
          
          <div v-if="question.showAnswer" class="answer-section">
            <h4 class="answer-title">📖 参考答案：</h4>
            <div class="answer-content" v-html="formatQuestionContent(question.answer || '暂无参考答案')"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-text">✨ 正在生成题目，请稍候...</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p class="error-text">{{ error }}</p>
        <button @click="error = ''" class="dismiss-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'QuestionGenerator',
  data() {
    return {
      configData: {
        TorF: 1,
        choice: 2,
        description: "大学的微积分内容",
        difficulty: 3,
        display_name: "微分方程",
        response: 3,
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
      questions: [],
      loading: false,
      error: ''
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
    },
    totalQuestions() {
      return this.configData.choice + this.configData.TorF + this.configData.response;
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
                             isNaN(this.configData.choice) ? '请输入有效数字' : '';
          break;
        case 'TorF':
          this.errors.TorF = this.configData.TorF === '' ? '判断题数量不能为空' : 
                           isNaN(this.configData.TorF) ? '请输入有效数字' : '';
          break;
        case 'response':
          this.errors.response = this.configData.response === '' ? '解答题数量不能为空' : 
                              isNaN(this.configData.response) ? '请输入有效数字' : '';
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
        return false;
      }
      return true;
    },

    async validateAndGenerate() {
      // 验证所有字段
      const fieldsValid = this.validateAllFields();
      const questionsValid = this.validateQuestionCount();

      if (!fieldsValid || !questionsValid) {
        return;
      }

      await this.generateQuestions();
    },

    async generateQuestions() {
      this.loading = true;
      this.error = '';
      
      try {
        // 确保数字字段是数字类型
        const requestData = {
          need: {
            TorF: String(this.configData.TorF),
            choice: String(this.configData.choice),
            description: this.configData.description,
            difficulty: Number(this.configData.difficulty),
            display_name: this.configData.display_name,
            response: String(this.configData.response),
            subject: this.configData.subject,
          }
        };

        // 调用API生成题目
        //需要修改的地方
        const response = await axios.post('http://localhost:8085/workflow/TestAIrun', requestData);
        if (response.data && response.data.data) {
          const data=response.data.data;
          const halfLength=Math.ceil(data.length/2);
          this.questions=[];
          for(let i=0;i<halfLength;i++){
            let questionText=data[i];
            let answerText=data[i+halfLength];
            let type = 'essay'; // 默认问答题
            if (questionText.includes('判断题')) type = 'judgment';
            else if (questionText.includes('选择题')) type = 'choice';
            answerText=answerText
              .replace(/答案/g,'')
              .replace(/；/g,'')
              .replace(/：/g,'')
            questionText=questionText
              .replace(/\n/g, '<br>')
              .replace(/\\\(/g, '  ')
              .replace(/$/g, '  ')
              .replace(/\\\)/g, '  ');
            let newquestion={
                id: index + 1,
                text: questionText,
                type: type,
                answer:answerText,
                userAnswer: null,
                showAnswer: false,
                isSubmitted: false,
                options: ["选项A", "选项B", "选项C", "选项D"],
                isCorrect: false
              }
              // 解答题不自动判断正误
            this.questions.push(newquestion)
          }
          
      } else {
          // 模拟数据，实际使用时删除
          this.questions = this.generateMockQuestions();
        }
      } catch (error) {
        console.error('生成题目失败:', error);
        this.error = '生成题目失败，请检查网络连接或API地址';
        // 使用模拟数据作为备选
        this.questions = this.generateMockQuestions();
      } finally {
        this.loading = false;
      }
    },
    

    generateMockQuestions() {
      const mockQuestions = [];
      
      // 生成选择题
      for (let i = 0; i < this.configData.choice; i++) {
        mockQuestions.push({
          type: "选择题",
          content: `微分方程相关选择题 ${i + 1}`,
          options: ["选项A", "选项B", "选项C", "选项D"],
          answer: "选项A"
        });
      }
      
      // 生成判断题
      for (let i = 0; i < this.configData.TorF; i++) {
        mockQuestions.push({
          type: "判断题",
          content: `微分方程相关判断题 ${i + 1}`,
          answer: i % 2 === 0 ? "正确" : "错误"
        });
      }
      
      // 生成解答题
      for (let i = 0; i < this.configData.response; i++) {
        mockQuestions.push({
          type: "解答题",
          content: `求解微分方程相关问题 ${i + 1}`,
          answer: "解题步骤和最终答案"
        });
      }
      
      return mockQuestions.map(q => ({
        ...q,
        userAnswer: null,
        showAnswer: false,
        isSubmitted: false,
        isCorrect: false
      }));
    },

    formatQuestionContent(text) {
      if (text) return '';
      return text.replace(/\n/g, '<br>');
    },

    submitAnswer(question) {
      question.isSubmitted = true;
      question.showAnswer = true;
      
      // 简单的答案验证逻辑
      if (question.type === '选择题') {
        question.isCorrect = question.userAnswer === 0; // 假设第一个选项总是正确答案
      } else if (question.type === '判断题') {
        question.isCorrect = question.userAnswer === true; // 假设总是正确
      }
      // 解答题不自动判断正误
    },

    selectOption(question, optionIndex) {
      question.userAnswer = optionIndex;
    },

    getTypeClass(type) {
      const typeClasses = {
        '选择题': 'type-choice',
        '解答题': 'type-essay',
        '判断题': 'type-judge'
      };
      return typeClasses[type] || '';
    }
  }
};
</script>

<style scoped>
/* 原有的所有样式保持不变，只添加错误样式 */

/** */
.input-error {
  border-color: #f56565 !important;
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1) !important;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-group {
  position: relative;
}

/* 其他原有样式保持不变 */
.question-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input, .form-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.difficulty-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.difficulty-value {
  font-weight: 700;
  color: #667eea;
  min-width: 30px;
  text-align: center;
}

.primary-btn, .secondary-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  background: #48bb78;
  color: white;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.form-hint {
  margin-top: 1rem;
  padding: 1rem;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  color: #92400e;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  margin-top: 2rem;
}

.empty-content {
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.empty-tips {
  text-align: left;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.empty-tips p {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-tips ul {
  color: #6b7280;
  padding-left: 1.5rem;
}

.empty-tips li {
  margin-bottom: 0.25rem;
}

.questions-container {
  margin-top: 2rem;
}

.question-card {
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f7fafc;
}

.question-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
}

.question-type {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.type-choice { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.type-essay { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.type-judge { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.question-content {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.options-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.option-item.selected {
  background: #ebf4ff;
  border-color: #667eea;
}

.option-letter {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.option-text {
  flex: 1;
  color: #4a5568;
}

.true-false-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tf-btn {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.true-btn:hover, .true-btn.selected {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.false-btn:hover, .false-btn.selected {
  background: #f56565;
  color: white;
  border-color: #f56565;
}

.answer-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  resize: vertical;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.answer-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.question-actions {
  margin-top: 1.5rem;
}

.answer-section {
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f0fff4;
  border-radius: 12px;
  border-left: 4px solid #48bb78;
}

.answer-title {
  color: #2f855a;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.answer-content {
  color: #38a169;
  line-height: 1.6;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #4a5568;
  font-weight: 500;
}

.error-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.error-content {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon {
  font-size: 1.2rem;
}

.error-text {
  color: #c53030;
  margin: 0;
  flex: 1;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #c53030;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
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

@media (max-width: 768px) {
  .question-generator {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .glass-card {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .true-false-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .question-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
    justify-content: center;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}
</style>