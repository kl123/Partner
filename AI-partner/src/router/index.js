import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/Login.vue'), name: 'Login' },
  { path: '/home', component: () => import('@/views/Home.vue'), name: 'home' },
  { path: '/study', component: () => import('@/views/Study.vue'), name: 'study' },
  { path: '/ai', component: () => import('@/views/Ai.vue'), name: 'ai' },
  { path: '/profile', component: () => import('@/views/Profile.vue'), name: 'profile' },
  {path: '/customization', component: () => import('@/views/customization.vue'), name: 'customization' },
  {path: '/success', component: () => import('@/components/success.vue'), name: 'success' },
  {path: '/nodes', component: () => import('@/components/nodes.vue'), name: 'nodes' ,
  children:[{
    path: 'video', component: () => import('@/components/video.vue'), name: 'video' 
  },
  {path: 'Play', component: () => import('@/components/PlanVideo.vue'), name: 'Play' },
]
},
  {path: '/test', component: () => import('@/views/test.vue'), name: 'test' },
  // {path: '/Play', component: () => import('@/components/PlanVideo.vue'), name: 'Play' },
  { path: '/', redirect: '/home' } // 默认跳转首页
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

