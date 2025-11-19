<template>
  <div class="head">
    <component is="LeftOutlined" @click="router.back()"/>
    <p>智能AI学习搭子</p>
    <component is="EllipsisOutlined" />
  </div>
  <div class="main" :style="{ height: isLoginRoute ? 'calc(100vh)' : 'calc(100vh - 15vh)' }">
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
import { HomeOutlined, NodeIndexOutlined, AliwangwangOutlined, TeamOutlined ,LeftOutlined,EllipsisOutlined} from '@ant-design/icons-vue'
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
const isLoginRoute = computed(() => route.path === '/login'||route.path === '/404'||route.path === '/question')

// 点击切换 tab
const onTabClick = (key,path) => {
  activeKey.value = key
  router.push(path)
}
</script>

<style scoped>
.main {
  width: 100vw;
  /* height: calc(100vh - 15vh); 减去头部 15vh + 底部 10vh */
  overflow-y: auto; /* 启用滚动，防止内容溢出 */
}
.head{
  height: 5vh;
  width: 100vw;
  background-color: white;
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #f4f4f4;
  border-top-left-radius: 40px;  /* 设置左上角圆角 */
  border-top-right-radius: 40px; /* 设置右上角圆角 */
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
