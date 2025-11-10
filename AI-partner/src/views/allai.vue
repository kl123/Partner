<template>
  <div class="app-container">
    <!-- 头部区域（无背景） -->
    <header class="header">
      <img src="../assets/logo.png" alt="助手头像" class="avatar" />
      <div class="greeting">
        <h1>您好！我在听...</h1>
        <p>有任何问题都可以来找我哦！快来提问试试吧~</p>
      </div>
    </header>

    <!-- 今日热搜推荐区域（关键词前加tag图案） -->
    <section class="hot-search">
      <h2>为您推荐今日热搜：</h2>
      <ul class="search-list">
        <li><img src="../assets/tag.png" alt="tag" class="tag-icon" />分式的定义</li>
        <li><img src="../assets/tag.png" alt="tag" class="tag-icon" />四级必背单词表</li>
      </ul>
      <div class="subject-cards">
        <div class="subject-card" @click="handleSubjectClick('语文')">
          <img src="../assets/汉字.png" alt="语文" class="subject-icon" />
          <p>语文</p>
        </div>
        <div class="subject-card" @click="handleSubjectClick('数学')">
          <img src="../assets/数学.png" alt="数学" class="subject-icon" />
          <p>数学</p>
        </div>
        <div class="subject-card" @click="handleSubjectClick('英语')">
          <img src="../assets/英语.png" alt="英语" class="subject-icon" />
          <p>英语</p>
        </div>
      </div>
    </section>

    <!-- 功能卡片区域（浅紫到白色渐变） -->
    <section class="function-section">
      <div class="function-cards">
        <div class="function-card" @click="handleFunctionClick('制定今日计划')">
          <h3>制定今日计划</h3>
          <p>今天准备学什么呢？不知道的话，问问AI小助手吧~</p>
          <img src="../assets/计划.png" alt="制定计划" class="card-icon" />
        </div>
        <div class="function-card" @click="handleFunctionClick('寻找写作灵感')">
          <h3>寻找写作灵感</h3>
          <p>AI小助手为你提供全新视角的写作灵感，让作文锦上添花。</p>
          <img src="../assets/书写.png" alt="写作灵感" class="card-icon1" />
        </div>
        <div class="function-card" @click="handleFunctionClick('有译英语词典')">
          <h3>有译英语词典</h3>
          <p>英语单词不认识？别担心，AI小助手来帮你快速消灭生词。</p>
          <img src="../assets/字典.png" alt="英语词典" class="card-icon2" />
        </div>
        <div class="function-card" @click="handleFunctionClick('更多功能')">
          <h3>更多功能，等待解锁中......</h3>
          <img src="../assets/更多.png" alt="更多功能" class="card-icon3" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AssistantPage',
  data() {
    return {
      // 可根据实际需求添加数据（如交互状态、动态内容等）
    }
  },
  methods: {
    // 学科卡片点击事件
    handleSubjectClick(subject) {
      console.log(`选择了${subject}学科`);
      // 可添加学科相关功能逻辑
    },
    // 功能卡片点击事件
    handleFunctionClick(funcName) {
      console.log(`点击了${funcName}功能`);
      // 可添加对应功能逻辑
    }
  }
}
</script>

<style scoped>
/* 全局样式重置与基础设置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Microsoft YaHei', 'Heiti SC', sans-serif;
  background-color: #f8f9fa;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 12px;
}

/* 头部样式（无背景，保持原有布局） */
.header {
  display: flex;
  align-items: center;
  padding: 18px 10px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.greeting h1 {
  padding-top: 40px;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #2d3748;
}
.greeting p {
  font-size: 10px;
  color: #4a5568;
  line-height: 1.5;
}

/* 今日热搜推荐区域（关键词前加tag图案） */
.hot-search {
  background: linear-gradient(180deg, #e6f7ff 0%, #ffffff 100%);
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(144, 202, 249, 0.15);
}
.hot-search h2 {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2d3748;
}
.search-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  display: block;
}
.search-list li {
  padding: 8px 0;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: color 0.2s;
  display: block;
  margin-bottom: 4px;
}
/* tag图案样式 */
.tag-icon {
  margin-right: 2px;
  width: 22px;
  height: 20px;
}
.search-list li:hover {
  color: #4299e1;
}
.search-list li:hover .tag-icon {
  color: #2b6cb0; /* hover时tag加深 */
}

/* 学科卡片（统一淡蓝色背景） */
.subject-cards {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}
.subject-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  cursor: pointer;
  padding: 12px 0;
  border-radius: 12px;
  transition: transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  background-color: #e8f4f8; /* 统一淡蓝色背景 */
}
.subject-card:hover {
  transform: translateY(-3px);
  background-color: #d1e7dd; /* hover时加深蓝色 */
}
.subject-icon {
  width: 52px;
  height: 52px;
  object-fit: contain;
  margin-bottom: 6px;
}
.subject-card p {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

/* 功能卡片区域（保持原有渐变样式） */
.function-section {
  background: linear-gradient(180deg, #f3e8ff 0%, #ffffff 100%);
  padding: 20px 16px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(194, 171, 234, 0.15);
}
.function-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.function-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.function-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #2d3748;
}
.function-card p {
  font-size: 12px;
  color: #4a5568;
  margin: 0 0 12px 0;
  flex-grow: 1;
  line-height: 1.4;
}
.card-icon {
  width: 60px;
  height: 60px;
  align-self: flex-end;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.card-icon1 {
  width: 60px;
  height: 60px;
  align-self: flex-end;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.card-icon2 {
  width: 60px;
  height: 50px;
  align-self: flex-end;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.card-icon3 {
  padding-top: 50px;
  width: 60px;
  height: 100px;
  align-self: flex-end;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.function-card:hover .card-icon {
  opacity: 1;
}

/* 响应式适配（保持原有逻辑） */
@media (max-width: 320px) {
  .header {
    padding: 20px 0;
  }
  .avatar {
    width: 64px;
    height: 64px;
  }
  .greeting h1 {
    font-size: 20px;
  }
  .function-cards {
    gap: 8px;
  }
  .function-card {
    padding: 12px;
  }
  .function-card h3 {
    font-size: 15px;
  }
}
</style>