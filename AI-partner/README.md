# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur

## success界面组件说明
在使用router跳转进入组件时，需要进行传参dest，dest是指定下个跳转页面的路由路径的name
实例代码：
//跳转到成功页
  const enterSuccess = () =>{
    router.push({
      name:"success",
      query: {
      dest: 'study',
  }
  },)
  }

## 获取用户名说明
 localStorage.getItem("username")