import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/Login.vue'), name: 'Login' },
  { path: '/home', component: () => import('@/views/Home.vue'), name: 'home' },
  { path: '/study', component: () => import('@/views/Study.vue'), name: 'study' },
  { path: '/ai', component: () => import('@/views/Ai.vue'), name: 'ai' },
  { path: '/profile', component: () => import('@/views/Profile.vue'), name: 'profile' },
  {path: '/customization', component: () => import('@/views/customization.vue'), name: 'customization' },
  { path: '/', redirect: '/home' } // 默认跳转首页
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router