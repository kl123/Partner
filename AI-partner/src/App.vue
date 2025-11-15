<template>
  <div class="page">
  <!-- 只在 AI 页面加载 CozeChatBot -->
  <CozeChatBot v-if="route.path === '/ai'" />
</div>
  <div class="main">
    <router-view/>
  </div>
  <div class="bottom" v-if="!isLoginRoute">
    <span
      v-for="item in tabs"
      :key="item.key"
      :class="{ active: activeKey === item.key }"
      @click="onTabClick(item.key,item.path)"
    >
      <div class="icon-text-container">
        <component :is="item.icon" />
        <span>{{ item.title }}</span>
      </div>
    </span>
  </div>
</template>

<script setup>
import { ref ,computed} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeOutlined, NodeIndexOutlined, AliwangwangOutlined, TeamOutlined } from '@ant-design/icons-vue'
import CozeChatBot from '@/components/CozeChatBot.vue'

const router = useRouter()
const route = useRoute()

// 定义底部导航数据
const tabs = [
  { key: 'home', title: '首页', icon: HomeOutlined ,path: '/home'},
  { key: 'study', title: '学习进度', icon: NodeIndexOutlined , path: '/study'},
  { key: 'ai', title: 'AI陪伴', icon: AliwangwangOutlined ,path: '/allai'},
  { key: 'profile', title: '我的', icon: TeamOutlined ,path: '/profile'}
]

// 当前激活的 tab
const activeKey = ref('home') // 默认首页激活

// 计算属性：判断当前是否为登录页
const isLoginRoute = computed(() => route.path === '/login'||route.path === '/404')

// 点击切换 tab
const onTabClick = (key,path) => {
  activeKey.value = key
  router.push(path)
}
</script>

<style scoped>
.main {
  width: 100vw;
  height: calc(100vh - 10vh);
  /* background-color: aqua; */
  overflow: auto;
  background: linear-gradient(
    to bottom, 
    #7769d3 0%,   /* 渐变起始颜色 */
    #fbfbfd 20%,  /* 渐变结束颜色和位置，这里设为20%，意味着渐变效果占据高度的1/5 */
    #ffffff 20%   /* 纯白色从20%开始，直到100% */
  );
}

.bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #f4f4f4;
  border-top-left-radius: 20px;  /* 设置左上角圆角 */
  border-top-right-radius: 20px; /* 设置右上角圆角 */
  width: 100vw;
  height: 10vh;
  display: flex;
  flex-direction: row;
  border: 1px solid #f4f4f4;
}

.bottom span {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #9f9f9f;
  transition: color 0.3s ease;
}

.bottom span.active {
  color: #13a9a9 !important;
}

.bottom span.active :deep(.anticon) {
  color: #13a9a9 !important;
}

.bottom span.active :deep(.icon-text-container span) {
  color: #13a9a9 !important;
}

</style>
