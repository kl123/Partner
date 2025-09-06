// utils/request.js

import axios from 'axios'
import { message } from 'ant-design-vue'  // ✅ 改为 ant-design-vue 的 message
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data, status } = response
    if (status >= 200 && status < 300) {
      // ✅ 可选：统一提示成功（根据需要开启）
      // message.success('请求成功')
      return data
    } else {
      message.error('请求失败：' + response.statusText)
      return Promise.reject(new Error(response.statusText))
    }
  },
  (error) => {
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          message.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          message.error('权限不足')
          break
        case 404:
          message.error('请求的资源不存在')
          router.push('/404')
          break
        default:
          message.error('请求失败：' + (response.data?.message || response.statusText))
      }
    } else {
      message.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default request