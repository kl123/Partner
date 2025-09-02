<template>
  <div class="container">
    <header>
      <h1>历史成绩单</h1>
      <p class="subtitle">查看您的历史答题记录和成绩</p>
    </header>
    
    <div class="controls">
      <div class="filter-group">
        <!-- <select v-model="filters.subject">
          <option value="all">所有科目</option>
          <option value="math">数学</option>
          <option value="science">科学</option>
          <option value="history">历史</option>
          <option value="english">英语</option>
        </select> -->
        
        <select v-model="filters.sortBy">
          <!-- <option value="newest">最新优先</option> -->
          <!-- <option value="oldest">最旧优先</option> -->
          <option value="highest">分数最高</option>
          <option value="lowest">分数最低</option>
        </select>
      </div>
      
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索考试名称..." v-model="filters.searchText">
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <i class="fas fa-check-circle"></i>
        <h3>{{ stats.totalTests }}</h3>
        <p>已完成测试</p>
      </div>
      <div class="stat-card">
        <i class="fas fa-trophy"></i>
        <h3>{{ stats.averageScore }}%</h3>
        <p>平均正确率</p>
      </div>
      <!-- <div class="stat-card">
        <i class="fas fa-clock"></i>
        <h3>{{ stats.totalTime }}</h3>
        <p>总学习时间</p>
      </div> -->
      <!-- <div class="stat-card">
        <i class="fas fa-chart-line"></i>
        <h3>{{ stats.improvement }}%</h3>
        <p>进步幅度</p>
      </div> -->
    </div>
    
    <div class="results-grid">
      <div 
        class="result-card" 
        v-for="result in filteredResults" 
        :key="result.id"
      >
        <div class="card-header" :style="headerStyle(result.subject)">
          <h3>{{ result.testName }}</h3>
          <!-- <p>{{ result.date }} · {{ subjectText(result.subject) }}</p> -->
        </div>
        <div class="card-body">
          <!-- <div class="score">{{ result.score }}分</div> -->
          <ul class="details">
            <li>答题数: <span>{{ result.totalQuestions }}</span></li>
            <li>正确数: <span>{{ result.correctAnswers }}</span></li>
            <!-- <li>用时: <span>{{ result.timeSpent }}</span></li> -->
          </ul>
        </div>
        <div class="card-footer">
          <span>详情</span>
          <button class="btn view-details" @click="showTestDetails(result)">查看详情</button>
        </div>
      </div>
    </div>
    
    <div class="modal" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedTest.testName }}</h2>
          <span class="close" @click="closeModal">&times;</span>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 20px;">
            <!-- <p><strong>日期:</strong> {{ selectedTest.date }}</p> -->
            <!-- <p><strong>得分:</strong> {{ selectedTest.score }}分</p> -->
            <p><strong>答题数:</strong> {{ selectedTest.totalQuestions }}</p>
            <p><strong>正确数:</strong> {{ selectedTest.correctAnswers }}</p>
            <!-- <p><strong>用时:</strong> {{ selectedTest.timeSpent }}</p> -->
          </div>
          <h3>答题详情:</h3>
          <div 
            class="question" 
            v-for="(detail, index) in selectedTest.details" 
            :key="index"
          >
            <p><strong>问题 {{ index + 1 }}:</strong> {{ detail.question }}</p>
            <p :class="detail.isCorrect ? 'correct' : 'incorrect'">
              <strong>你的答案:</strong> {{ detail.userAnswer }} 
              {{ detail.isCorrect ? '✓' : '✗' }}
            </p>
            <p v-if="!detail.isCorrect">
              <strong>正确答案:</strong> {{ detail.correctAnswer }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gettest } from '../api/test';
//获取历史数据
const histest = await gettest();
console.log(histest);
//输出获取参数格式
export default {
  name: 'HistoryResults',
  data() {
    return {
      filters: {
        subject: 'all',
        sortBy: 'newest',
        searchText: ''
      },
      showModal: false,
      selectedTest: {},
      testResults: [
        {
          id: 1,
          testName: "数学期中考试",
          subject: "math",
          date: "2023-10-15",
          score: 92,
          totalQuestions: 20,
          correctAnswers: 18,
          timeSpent: "45分钟",
          details: [
            {
              question: "下列哪个是勾股定理的正确表示？",
              userAnswer: "a² + b² = c²",
              correctAnswer: "a² + b² = c²",
              isCorrect: true
            },
            {
              question: "解方程: 2x + 5 = 13",
              userAnswer: "x = 4",
              correctAnswer: "x = 4",
              isCorrect: true
            },
            {
              question: "圆的面积公式是？",
              userAnswer: "πd",
              correctAnswer: "πr²",
              isCorrect: false
            }
          ]
        },
        {
          id: 2,
          testName: "科学知识测验",
          subject: "science",
          date: "2023-10-10",
          score: 85,
          totalQuestions: 15,
          correctAnswers: 12,
          timeSpent: "30分钟",
          details: [
            {
              question: "水的化学式是什么？",
              userAnswer: "H₂O",
              correctAnswer: "H₂O",
              isCorrect: true
            },
            {
              question: "植物通过什么过程制造食物？",
              userAnswer: "呼吸作用",
              correctAnswer: "光合作用",
              isCorrect: false
            },
            {
              question: "人体最大的器官是什么？",
              userAnswer: "皮肤",
              correctAnswer: "皮肤",
              isCorrect: true
            }
          ]
        },
        {
          id: 3,
          testName: "世界历史测试",
          subject: "history",
          date: "2023-10-05",
          score: 78,
          totalQuestions: 20,
          correctAnswers: 15,
          timeSpent: "50分钟",
          details: [
            {
              question: "第二次世界大战结束于哪一年？",
              userAnswer: "1945",
              correctAnswer: "1945",
              isCorrect: true
            },
            {
              question: "美国独立宣言签署于哪一年？",
              userAnswer: "1776",
              correctAnswer: "1776",
              isCorrect: true
            },
            {
              question: "中国古代四大发明不包括以下哪项？",
              userAnswer: "造纸术",
              correctAnswer: "火药",
              isCorrect: false
            }
          ]
        },
        {
          id: 4,
          testName: "英语语法测试",
          subject: "english",
          date: "2023-09-28",
          score: 88,
          totalQuestions: 25,
          correctAnswers: 22,
          timeSpent: "40分钟",
          details: [
            {
              question: "'She _____ to the store yesterday.' 应该填入什么？",
              userAnswer: "went",
              correctAnswer: "went",
              isCorrect: true
            },
            {
              question: "下列哪个是过去完成时？",
              userAnswer: "had eaten",
              correctAnswer: "had eaten",
              isCorrect: true
            },
            {
              question: "'If I were you, I _____ do that.' 应该填入什么？",
              userAnswer: "will",
              correctAnswer: "would",
              isCorrect: false
            }
          ]
        },
        {
          id: 5,
          testName: "数学期末考试",
          subject: "math",
          date: "2023-09-20",
          score: 95,
          totalQuestions: 30,
          correctAnswers: 28,
          timeSpent: "60分钟",
          details: [
            {
              question: "二次方程求根公式是什么？",
              userAnswer: "x = [-b ± √(b² - 4ac)] / 2a",
              correctAnswer: "x = [-b ± √(b² - 4ac)] / 2a",
              isCorrect: true
            },
            {
              question: "计算: ∫(2x dx)",
              userAnswer: "x² + C",
              correctAnswer: "x² + C",
              isCorrect: true
            },
            {
              question: "三角函数中，tanθ = ?",
              userAnswer: "sinθ/cosθ",
              correctAnswer: "sinθ/cosθ",
              isCorrect: true
            }
          ]
        }
      ]
    }
  },
  computed: {
    

    filteredResults() {
      let results = [...this.testResults];
      
      // 筛选科目
      if (this.filters.subject !== 'all') {
        results = results.filter(test => test.subject === this.filters.subject);
      }
      
      // 搜索筛选
      if (this.filters.searchText) {
        const searchText = this.filters.searchText.toLowerCase();
        results = results.filter(test => 
          test.testName.toLowerCase().includes(searchText)
        );
      }
      
      // 排序
      switch(this.filters.sortBy) {
        case 'newest':
          results.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'oldest':
          results.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'highest':
          results.sort((a, b) => b.score - a.score);
          break;
        case 'lowest':
          results.sort((a, b) => a.score - b.score);
          break;
      }
      
      return results;
    },
    stats() {
      const totalTests = this.testResults.length;
      const totalScore = this.testResults.reduce((sum, test) => sum + test.score, 0);
      const averageScore = Math.round(totalScore / totalTests);
      
      // 简单模拟其他统计数据
      return {
        totalTests,
        averageScore,
        totalTime: '42h',
        improvement: '+12%'
      }
    }
  },
  methods: {
    headerStyle(subject) {
      let subjectColor = '#6a11cb';
      
      switch(subject) {
        case 'math':
          subjectColor = '#ff4757';
          break;
        case 'science':
          subjectColor = '#2ed573';
          break;
        case 'history':
          subjectColor = '#ffa502';
          break;
        case 'english':
          subjectColor = '#1e90ff';
          break;
      }
      
      return `background: linear-gradient(135deg, ${subjectColor} 0%, #2575fc 100%);`;
    },
    subjectText(subject) {
      switch(subject) {
        case 'math': return '数学';
        case 'science': return '科学';
        case 'history': return '历史';
        case 'english': return '英语';
        default: return '通用';
      }
    },
    showTestDetails(test) {
      this.selectedTest = test;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 25px 0;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

select, input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 5px 15px;
}

.search-box input {
  border: none;
  padding: 8px;
  width: 200px;
}

.search-box i {
  color: #777;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-card i {
  font-size: 2.5rem;
  color: #6a11cb;
  margin-bottom: 15px;
}

.stat-card h3 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: #6a11cb;
}

.stat-card p {
  color: #777;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
}

.card-header {
  padding: 20px;
  color: white;
}

.card-body {
  padding: 20px;
}

.score {
  font-size: 2.2rem;
  font-weight: bold;
  color: #6a11cb;
  text-align: center;
  margin: 15px 0;
}

.details {
  list-style: none;
  margin: 15px 0;
}

.details li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.details li:last-child {
  border-bottom: none;
}

.card-footer {
  padding: 15px 20px;
  background: #f9f9f9;
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 8px 15px;
  background: #6a11cb;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #2575fc;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 800px;
  border-radius: 10px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close {
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.question {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.correct {
  color: #4caf50;
}

.incorrect {
  color: #f44336;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box input {
    width: 100%;
  }
}
</style>