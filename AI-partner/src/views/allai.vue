<template>
  <div class="app-container">
    <!-- 头部区域 -->
    <header class="header">
      <img src="../assets/logo.png" alt="助手头像" class="avatar" />
      <div class="greeting">
        <h1>您好！我在听...</h1>
        <p>有任何问题都可以来找我哦！快来提问试试吧~</p>
      </div>
    </header>

    <!-- 今日热搜推荐区域 -->
    <section class="hot-search">
      <h2>为您推荐今日热搜：</h2>
      <ul class="search-list">
        <li>分式的定义</li>
        <li>四级必背单词表</li>
      </ul>
      <div class="subject-cards">
        <div class="subject-card">
          <img src="../assets/汉字.png" alt="语文" class="subject-icon" />
          <p>语文</p>
        </div>
        <div class="subject-card">
          <img src="../assets/数学.png" alt="数学" class="subject-icon" />
          <p>数学</p>
        </div>
        <div class="subject-card">
          <img src="../assets/英语.png" alt="英语" class="subject-icon" />
          <p>英语</p>
        </div>
      </div>
    </section>

    <!-- 功能卡片区域 -->
    <section class="function-cards">
      <div class="function-card">
        <h3>制定今日计划</h3>
        <p>今天准备学什么呢？不知道的话，问问AI小助手吧~</p>
        <img src="../assets/计划.png" alt="制定计划" class="card-icon" />
      </div>
      <div class="function-card">
        <h3>寻找写作灵感</h3>
        <p>AI小助手为你提供全新视角的写作灵感，让作文锦上添花。</p>
        <img src="../assets/写作.png" alt="写作灵感" class="card-icon" />
      </div>
      <div class="function-card">
        <h3>有译英语词典</h3>
        <p>英语单词不认识？别担心，AI小助手来帮你快速消灭生词。</p>
        <img src="../assets/词典.png" alt="英语词典" class="card-icon" />
      </div>
      <div class="function-card">
        <h3>更多功能，等待解锁中......</h3>
        <img src="../assets/更多.png" alt="更多功能" class="card-icon" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AssistantPage',
  data() {
    return {
      // 可根据实际需求添加数据
    }
  }
}
</script>

<style scoped>
.app-container {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #e6f7ff;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 15px;
}
.greeting h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
}
.greeting p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 今日热搜样式 */
.hot-search {
  background-color: #e6f7ff;
  padding: 15px 20px;
  margin: 10px;
  border-radius: 8px;
}
.hot-search h2 {
  font-size: 18px;
  margin: 0 0 10px 0;
}
.search-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
}
.search-list li {
  margin-bottom: 5px;
}
.subject-cards {
  display: flex;
  justify-content: space-around;
}
.subject-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}
.subject-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 5px;
}

/* 功能卡片样式 */
.function-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 10px 10px 10px;
}
.function-card {
  background-color: #f0e6fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.function-card h3 {
  font-size: 16px;
  margin: 0 0 8px 0;
}
.function-card p {
  font-size: 12px;
  color: #666;
  margin: 0 0 10px 0;
  flex-grow: 1;
}
.card-icon {
  width: 40px;
  height: 40px;
  align-self: flex-end;
}

/* 底部导航样式 */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background-color: #fff;
  border-top: 1px solid #eee;
  margin-top: auto;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
}
.nav-item img {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}
.nav-center .action-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #7d26cd;
  color: #fff;
  border: none;
  font-size: 24px;
  position: relative;
  top: -25px;
}
</style>