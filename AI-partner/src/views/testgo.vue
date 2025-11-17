<template>
  <div class="single-question-container">
    <!-- 顶部导航和进度 -->
    <div class="quiz-header glass-card">
      <div class="header-content">
        <button @click="goBack" class="back-btn secondary-btn">
          返回
        </button>
        <h1 class="quiz-title">{{ testConfig.display_name }}</h1>
        <div class="quiz-progress">
          <div class="progress-info">
            <span>第 {{ currentIndex + 1 }} 题 / 共 {{ questionList.length }} 题</span>
            <span class="score">得分: {{ currentScore }}/{{ questionList.length }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressWidth }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前题目展示 -->
    <div class="question-area" v-if="currentQuestion">
      <div class="question-card glass-card" :key="currentQuestionKey">
        <div class="question-header">
          <span class="question-number">第 {{ currentIndex + 1 }} 题</span>
          <span class="question-type" :class="getTypeClass(currentQuestion.type)">
            {{ getTypeText(currentQuestion.type) }}
          </span>
          <span class="question-status" :class="getStatusClass(currentQuestion)">
            {{ getStatusText(currentQuestion) }}
          </span>
        </div>
        
        <div class="question-content" v-html="currentQuestion.text"></div>
        
        <!-- 选择题选项 -->
        <div v-if="currentQuestion.type === 'choice'" class="options-grid">
          <div 
            v-for="(option, optIndex) in currentQuestion.options" 
            :key="optIndex"
            class="option-item" 
            :class="{ 
              selected: currentQuestion.userAnswer === optIndex,
              correct: currentQuestion.showAnswer && isChoiceCorrect(currentQuestion, optIndex),
              incorrect: currentQuestion.showAnswer && currentQuestion.userAnswer === optIndex && !isChoiceCorrect(currentQuestion, optIndex)
            }"
            @click="selectOption(currentQuestion, optIndex)"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
            <span class="option-text">{{ option }}</span>
            <span v-if="currentQuestion.showAnswer && isChoiceCorrect(currentQuestion, optIndex)" 
                  class="correct-mark">✓</span>
          </div>
        </div>
        
        <!-- 判断题选项 -->
        <div v-if="currentQuestion.type === 'judgment'" class="true-false-grid">
          <button 
            class="tf-btn true-btn" 
            :class="{ 
              selected: currentQuestion.userAnswer === '正确',
              correct: currentQuestion.showAnswer && currentQuestion.answer === '正确',
              incorrect: currentQuestion.showAnswer && currentQuestion.userAnswer === '正确' && currentQuestion.answer !== '正确'
            }" 
            @click="updateUserAnswer(currentQuestion, '正确')"
          >
            ✅ 正确
            <span v-if="currentQuestion.showAnswer && currentQuestion.answer === '正确'" 
                  class="correct-mark">✓</span>
          </button>
          <button 
            class="tf-btn false-btn" 
            :class="{ 
              selected: currentQuestion.userAnswer === '错误',
              correct: currentQuestion.showAnswer && currentQuestion.answer === '错误', 
              incorrect: currentQuestion.showAnswer && currentQuestion.userAnswer === '错误' && currentQuestion.answer !== '错误'
            }" 
            @click="updateUserAnswer(currentQuestion, '错误')"
          >
            ❌ 错误
            <span v-if="currentQuestion.showAnswer && currentQuestion.answer === '错误'" 
                  class="correct-mark">✓</span>
          </button>
        </div>
        
        <!-- 解答题输入区域 -->
        <div v-if="currentQuestion.type === 'essay'" class="answer-area">
          <textarea 
            v-model="currentQuestion.userAnswer" 
            placeholder="✏️ 请输入您的解答..." 
            class="answer-textarea"
            :disabled="currentQuestion.isSubmitted"
          ></textarea>
        </div>
        
        <!-- 答案反馈区域 -->
        <div v-if="currentQuestion.showAnswer" class="answer-feedback-section">
          <div class="feedback-header">
            <h3 class="feedback-title">📖 参考答案</h3>
            <div class="result-badge" :class="getResultBadgeClass(currentQuestion)">
              {{ getResultBadgeText(currentQuestion) }}
            </div>
          </div>
          <div class="answer-content" v-html="currentQuestion.answer"></div>
          
          <!-- 解答题额外提示 -->
          <div v-if="currentQuestion.type === 'essay'" class="essay-tips">
            <p>💡 解答题需要人工批改，系统仅显示参考答案供您对照。</p>
          </div>
        </div>
      </div>

      <!-- 题目操作区域 -->
      <div class="question-actions glass-card">
        <div class="action-buttons">
          <!-- 最后一题显示提交所有答案按钮 -->
          <button 
            v-if="isLastQuestion && !allQuestionsSubmitted" 
            @click="submitAllAnswers" 
            class="submit-all-btn primary-btn"
          >
            📨 提交所有答案
          </button>
          
          <!-- 非最后一题或已提交所有答案时显示普通提交按钮 -->
          <button 
            v-else
            @click="submitAnswer(currentQuestion)" 
            class="submit-btn primary-btn"
            :disabled="!canSubmit || currentQuestion.isSubmitted"
          >
            {{ getSubmitButtonText(currentQuestion) }}
          </button>
          
          <button 
            v-if="currentQuestion.isSubmitted && !currentQuestion.isCorrect && currentQuestion.type !== 'essay'" 
            @click="addToWrongSet(currentQuestion)" 
            class="wrong-set-btn secondary-btn"
          >
            📥 加入错题集
          </button>
        </div>
        
        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <button 
            @click="prevQuestion" 
            class="nav-btn prev-btn"
            :disabled="currentIndex === 0"
          >
            ← 上一题
          </button>
          
          <!-- 横向题目选择器 -->
          <div class="question-selector">
            <div class="selector-header">
              <span class="selector-title">快速跳转</span>
            </div>
            <div class="question-dots">
              <div 
                v-for="(q, index) in questionList" 
                :key="q.id"
                class="question-dot"
                :class="getQuestionDotClass(q, index)"
                @click="jumpToQuestion(index)"
                :title="`第 ${index + 1} 题 ${getQuestionStatus(q)}`"
              >
                <span class="dot-number">{{ index + 1 }}</span>
                <div class="dot-status" :class="getDotStatusClass(q)"></div>
              </div>
            </div>
          </div>
          
          <button 
            @click="nextQuestion" 
            class="nav-btn next-btn"
            :disabled="currentIndex === questionList.length - 1"
          >
            下一题 →
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="error-toast">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p class="error-text">{{ errorMsg }}</p>
        <button @click="errorMsg = ''" class="dismiss-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { addtest } from '@/api/test';
import { adderror } from '@/api_py/add';
import { getquestionanswer } from '@/api_py/add';

export default {
  name: 'SingleQuestionTest',
  props: {
    customQuestions: {
      type: Array,
      required: false,
      default: () => []
    },
    customConfig: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  data() {
    return {
      errorMsg: '',
      currentIndex: 0,
      // 强制重新渲染的key
      currentQuestionKey: 0,
      // 使用响应式数据存储题目列表
      questionList: [],
      testConfig: {
        display_name: '前端基础测试题',
        total: 5
      }
    };
  },
  computed: {
    currentQuestion() {
      return this.questionList[this.currentIndex];
    },
    progressWidth() {
      return `${((this.currentIndex + 1) / this.questionList.length) * 100}%`;
    },
    canSubmit() {
      if (!this.currentQuestion) return false;
      const q = this.currentQuestion;
      if (q.type === 'essay') {
        return q.userAnswer && q.userAnswer.trim().length > 0;
      }
      return q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== '';
    },
    completedCount() {
      return this.questionList.filter(q => q.isSubmitted).length;
    },
    allQuestionsSubmitted() {
      return this.completedCount === this.questionList.length;
    },
    currentScore() {
      return this.questionList.filter(q => q.isCorrect).length;
    },
    isLastQuestion() {
      return this.currentIndex === this.questionList.length - 1;
    }
  },
  watch: {
    // 监听当前题目索引变化，强制重新渲染
    currentIndex() {
      this.currentQuestionKey += 1;
    }
  },
  mounted() {
    this.initializeQuestions();
  },
  methods: {
    initializeQuestions() {
      // 初始化题目数据
      const defaultQuestions = [
        {
          id: 'q1',
          type: 'choice',
          text: '下列哪种数据类型不属于JavaScript基本数据类型？',
          options: [
            'String（字符串）',
            'Array（数组）',
            'Boolean（布尔值）',
            'Number（数字）'
          ],
          answer: 'B',
          userAnswer: null,
          isSubmitted: false,
          showAnswer: false,
          isCorrect: false
        },
        {
          id: 'q2',
          type: 'judgment',
          text: 'Vue.js是一个渐进式JavaScript框架，支持组件化开发。',
          answer: '正确',
          userAnswer: null,
          isSubmitted: false,
          showAnswer: false,
          isCorrect: false
        },
        {
          id: 'q3',
          type: 'essay',
          text: '请简述Vue组件中props和data的区别。',
          answer: '1. 来源不同：props是父组件传递给子组件的数据，data是组件内部维护的私有数据；<br>2. 可修改性不同：props默认只读，不能直接修改（需通过$emit通知父组件），data可直接修改；<br>3. 用途不同：props用于组件间通信，data用于存储组件内部状态。',
          userAnswer: '',
          isSubmitted: false,
          showAnswer: false,
          isCorrect: false
        },
        {
          id: 'q4',
          type: 'choice',
          text: '下列哪个方法用于向数组末尾添加元素？',
          options: [
            'unshift()',
            'push()',
            'shift()',
            'splice()'
          ],
          answer: 'B',
          userAnswer: null,
          isSubmitted: false,
          showAnswer: false,
          isCorrect: false
        },
        {
          id: 'q5',
          type: 'judgment',
          text: 'JavaScript中，typeof null 的返回值是 "null"。',
          answer: '错误',
          userAnswer: null,
          isSubmitted: false,
          showAnswer: false,
          isCorrect: false
        }
      ];

      // 使用自定义题目或默认题目
      if (this.customQuestions && this.customQuestions.length > 0) {
        this.questionList = JSON.parse(JSON.stringify(this.customQuestions));
      } else {
        this.questionList = JSON.parse(JSON.stringify(defaultQuestions));
      }

      // 更新配置
      if (this.customConfig && Object.keys(this.customConfig).length > 0) {
        this.testConfig = { ...this.testConfig, ...this.customConfig };
      }
      
      this.testConfig.total = this.questionList.length;
    },

    goBack() {
      this.$router.push({ name: 'test' });
    },

    async submitAllAnswers() {
      // 检查是否所有题目都已提交
      const unanswered = this.questionList.filter(q => !q.isSubmitted);
      
      if (unanswered.length > 0) {
        // 自动提交所有未提交的题目
        this.questionList.forEach(question => {
          if (!question.isSubmitted && this.hasAnswer(question)) {
            this.submitSingleQuestion(question);
          }
        });
        
        // 再次检查是否还有未提交的题目
        const stillUnanswered = this.questionList.filter(q => !q.isSubmitted);
        if (stillUnanswered.length > 0) {
          this.errorMsg = `还有 ${stillUnanswered.length} 道题未完成，请先完成所有题目`;
          setTimeout(() => this.errorMsg = '', 3000);
          return;
        }
      }

      // 准备提交数据
      let testdata = {
        "tests": {
          "title": this.testConfig.display_name,
          "score": this.currentScore,
          "duration": 0,
        },
        "titles": []
      };

      this.questionList.forEach(question => {
        testdata.titles.push({
          "userAnswer": question.userAnswer,
          "showAnswer": question.answer,
          "isSubmitted": question.isSubmitted ? 1 : 0,
          "isCorrect": question.isCorrect ? 1 : 0,
          "text": question.text,
          "analysis": '',
          "type": question.type,
        });
      });

      try {
        const res = await addtest(testdata);
        console.log(res);
        alert(`提交成功！您的最终得分：${this.currentScore}/${this.questionList.length}`);
        
        // 提交成功后可以跳转页面或显示结果
        this.$router.push({ name: 'test' });
      } catch (err) {
        console.error('提交失败:', err);
        this.errorMsg = '提交失败，请重试';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    },

    submitAnswer(question) {
      if (!this.canSubmit) {
        this.errorMsg = '请先完成当前题目再提交';
        setTimeout(() => this.errorMsg = '', 3000);
        return;
      }
      
      this.submitSingleQuestion(question);
      
      // 如果不是最后一题，自动跳转到下一题
      if (!this.isLastQuestion) {
        setTimeout(() => {
          this.nextQuestion();
        }, 1000);
      }
    },

    submitSingleQuestion(question) {
      question.isSubmitted = true;
      question.showAnswer = true;
      this.checkAnswer(question);
    },

    checkAnswer(question) {
      if (question.type === 'choice') {
        const correctIndex = question.answer.charCodeAt(0) - 65;
        question.isCorrect = question.userAnswer === correctIndex;
      } else if (question.type === 'judgment') {
        question.isCorrect = question.userAnswer === question.answer;
      } else if (question.type === 'essay') {
        question.isCorrect = null; // 解答题不自动判分
      }
    },

    selectOption(question, optionIndex) {
      if (!question.isSubmitted) {
        question.userAnswer = optionIndex;
      }
    },

    updateUserAnswer(question, value) {
      if (!question.isSubmitted) {
        question.userAnswer = value;
      }
    },

    async addToWrongSet(question) {
      if (!question.isSubmitted) {
        this.errorMsg = '请先提交答案再添加到错题集';
        setTimeout(() => this.errorMsg = '', 3000);
        return;
      }
      if (question.isCorrect) {
        this.errorMsg = '正确题目无需添加到错题集';
        setTimeout(() => this.errorMsg = '', 3000);
        return;
      }
      
      const username = localStorage.getItem("username");
      if (!username) {
        alert('请先登录');
        return;
      }
      
      try {
        const questionanswer = await getquestionanswer({ input: question.text });
        const dedata = {
          input: {
            "question": question.text,
            "correct_answer": question.answer,
            "error_answer": String(question.userAnswer || '未作答'),
            "reason": questionanswer.data || '请结合参考答案理解错题原因',
            "username": username,
          }
        };
        const res = await adderror(dedata);
        console.log(res);
        alert('已成功添加到错题集');
      } catch (error) {
        console.error('添加错题失败:', error);
        this.errorMsg = '添加错题集失败，请重试';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },

    nextQuestion() {
      if (this.currentIndex < this.questionList.length - 1) {
        this.currentIndex++;
      }
    },

    jumpToQuestion(index) {
      this.currentIndex = index;
    },

    // 辅助方法
    getTypeClass(type) {
      const typeClasses = {
        'choice': 'type-choice',
        'essay': 'type-essay',
        'judgment': 'type-judge'
      };
      return typeClasses[type] || '';
    },

    getTypeText(type) {
      const typeTexts = {
        'choice': '选择题',
        'essay': '解答题',
        'judgment': '判断题'
      };
      return typeTexts[type] || '';
    },

    getQuestionStatus(question) {
      if (!question.isSubmitted) return '未作答';
      return question.isCorrect ? '正确' : '错误';
    },

    getStatusClass(question) {
      if (!question.isSubmitted) return 'status-unanswered';
      return question.isCorrect ? 'status-correct' : 'status-incorrect';
    },

    getStatusText(question) {
      if (!question.isSubmitted) return '未作答';
      return question.isCorrect ? '已回答正确' : '已回答错误';
    },

    getSubmitButtonText(question) {
      if (question.isSubmitted) return '✅ 已提交';
      return '📤 提交答案';
    },

    getResultBadgeClass(question) {
      if (question.type === 'essay') return 'essay';
      return question.isCorrect ? 'correct' : 'incorrect';
    },

    getResultBadgeText(question) {
      if (question.type === 'essay') return '📝 解答题待批改';
      return question.isCorrect ? '✅ 回答正确' : '❌ 回答错误';
    },

    isChoiceCorrect(question, optionIndex) {
      const correctIndex = question.answer.charCodeAt(0) - 65;
      return optionIndex === correctIndex;
    },

    hasAnswer(question) {
      if (question.type === 'essay') {
        return question.userAnswer && question.userAnswer.trim().length > 0;
      }
      return question.userAnswer !== null && question.userAnswer !== undefined && question.userAnswer !== '';
    },

    // 题目圆点样式
    getQuestionDotClass(question, index) {
      const classes = [];
      if (index === this.currentIndex) {
        classes.push('active');
      }
      if (question.isSubmitted) {
        classes.push(question.isCorrect ? 'correct' : 'incorrect');
      } else {
        classes.push('unanswered');
      }
      return classes;
    },

    // 圆点状态指示器
    getDotStatusClass(question) {
      if (!question.isSubmitted) return 'status-unanswered';
      return question.isCorrect ? 'status-correct' : 'status-incorrect';
    }
  }
};
</script>

<style scoped>
/* 原有样式保持不变，添加题目选择器样式 */
.question-status {
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-unanswered {
  background: #edf2f7;
  color: #718096;
}

.status-correct {
  background: #c6f6d5;
  color: #22543d;
}

.status-incorrect {
  background: #fed7d7;
  color: #742a2a;
}

.result-badge.essay {
  background: #e9d8fd;
  color: #553c9a;
}

/* 题目选择器样式 */
.question-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 400px;
  margin: 0 1rem;
}

.selector-header {
  width: 100%;
  text-align: center;
}

.selector-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.question-dots {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.question-dot {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  font-weight: 600;
  font-size: 0.9rem;
}

.question-dot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.question-dot.active {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  transform: scale(1.1);
}

/* 题目状态样式 */
.question-dot.unanswered {
  background: #edf2f7;
  color: #718096;
  border-color: #e2e8f0;
}

.question-dot.correct {
  background: #c6f6d5;
  color: #22543d;
  border-color: #48bb78;
}

.question-dot.incorrect {
  background: #fed7d7;
  color: #742a2a;
  border-color: #f56565;
}

.dot-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.dot-status.status-unanswered {
  background: #a0aec0;
}

.dot-status.status-correct {
  background: #48bb78;
}

.dot-status.status-incorrect {
  background: #f56565;
}

.dot-number {
  pointer-events: none;
}

/* 其他样式保持不变 */
.single-question-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #6686df 0%, #748dde 100%);
  min-height: 100vh;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
}

.quiz-header {
  padding: 1.5rem 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin: 0;
}

.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #4a5568;
}

.score {
  color: #667eea;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.question-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  flex: 1;
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
  font-size: 1.3rem;
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
  margin-bottom: 2rem;
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
  position: relative;
}

.option-item:hover:not(.correct):not(.incorrect) {
  border-color: #667eea;
  background: #f7fafc;
}

.option-item.selected {
  background: #ebf4ff;
  border-color: #667eea;
}

.option-item.correct {
  background: #f0fff4;
  border-color: #48bb78;
}

.option-item.incorrect {
  background: #fed7d7;
  border-color: #f56565;
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

.option-item.correct .option-letter {
  background: #48bb78;
}

.option-item.incorrect .option-letter {
  background: #f56565;
}

.option-text {
  flex: 1;
  color: #4a5568;
}

.correct-mark {
  color: #48bb78;
  font-weight: bold;
  font-size: 1.2rem;
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
  position: relative;
}

.tf-btn:not(.correct):not(.incorrect):hover {
  transform: translateY(-2px);
}

.true-btn.correct, .true-btn.selected:not(.incorrect) {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.false-btn.correct, .false-btn.selected:not(.incorrect) {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.true-btn.incorrect {
  background: #f56565;
  color: white;
  border-color: #f56565;
}

.false-btn.incorrect {
  background: #f56565;
  color: white;
  border-color: #f56565;
}

.answer-area {
  margin-bottom: 1.5rem;
}

.answer-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  resize: vertical;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.answer-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.answer-textarea:disabled {
  background: #f7fafc;
  color: #718096;
}

.answer-feedback-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feedback-title {
  color: #2d3748;
  margin: 0;
}

.result-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.result-badge.correct {
  background: #c6f6d5;
  color: #22543d;
}

.result-badge.incorrect {
  background: #fed7d7;
  color: #742a2a;
}

.answer-content {
  color: #4a5568;
  line-height: 1.6;
}

.essay-tips {
  margin-top: 1rem;
  padding: 1rem;
  background: #e6fffa;
  border-radius: 8px;
  color: #234e52;
}

.question-actions {
  padding: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-btn, .secondary-btn, .danger-btn {
  padding: 0.75rem 1.5rem;
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
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.danger-btn {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
}

.danger-btn:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  transform: translateY(-2px);
}

.back-btn {
  align-self: flex-start;
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
  .single-question-container {
    padding: 0.5rem;
  }
  
  .glass-card {
    padding: 1.5rem;
  }
  
  .quiz-title {
    font-size: 1.5rem;
  }
  
  .true-false-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .question-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .question-dots {
    gap: 0.3rem;
  }
  
  .question-dot {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    gap: 0.75rem;
  }
  
  .quiz-progress {
    gap: 0.25rem;
  }
  
  .progress-info {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
  
  .question-dot {
    width: 30px;
    height: 30px;
    font-size: 0.75rem;
  }
  
  .dot-status {
    width: 8px;
    height: 8px;
  }
}
</style>