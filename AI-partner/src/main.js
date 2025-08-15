import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 导入 ant-design-vue 样式
import 'ant-design-vue/dist/reset.css'; // ✅ 正确，v4 推荐
// 导入 ant-design-vue
import Antd from 'ant-design-vue';
// ✅ 引入 Vue 专用图标库
import * as Icons from '@ant-design/icons-vue'
import router from './router'

const app = createApp(App);
// 使用 Ant Design Vue 插件
app.use(Antd);
app.use(router);
// 全局注册所有图标组件（可选，方便使用）
Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key])
  })
app.mount('#app');