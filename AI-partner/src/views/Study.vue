<template>
  <div class="learning-progress-page">
    <!-- 页面标题 -->
    <a-typography-title :level="2" style="color: #1890ff">
      📚 学习进度
    </a-typography-title>

    <!-- 数据总览面板 -->
    <a-card class="overview-panel" :bordered="false" :hoverable="true">
      <a-row :gutter="[16, 16]" justify="center">
        <a-col :xs="24" :sm="12" :md="8" v-for="stat in stats" :key="stat.title">
          <a-card :title="stat.title" size="small">
            <a-typography-text :strong="true" style="fontSize: '1.2em'; color: '#1890ff'">
              {{ stat.value }}
            </a-typography-text>
            <template #extra>
              <a-tag :color="stat.color">{{ stat.tag }}</a-tag>
            </template>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 学习路径列表 -->
    <div class="learning-paths">
      <a-typography-title :level="3" style="text-align: left; margin-bottom: 16px; color: #333">
        我的学习路径
      </a-typography-title>

      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :md="8" v-for="(path,index) in learningPaths" :key="path.id">
          <a-card hoverable class="path-card" @click = "intonode(path.pathId,path.title)">
            <!-- 路径名称 -->
            <template #title>
              <a-typography-title :level="4" style="margin: 0">
                🏁路径{{ index + 1 }}：{{ path.title }}
              </a-typography-title>
            </template>

            <!-- 描述 -->
            <a-typography-paragraph style="color: #666; lineHeight: '1.6'">
              {{ path.description }}
            </a-typography-paragraph>

            <!-- 进度与状态 -->
            <div class="progress-status">
              <!-- 环形进度条 -->
              <a-progress
                type="circle"
                :percent="path.progress*100"
                :stroke-color="(path.progress*100) >= 100 ? '#52c41a' : '#1890ff'"
                :width="80"
              />

              <!-- 是否完成标签 -->
              <div class="status-tag">
                <a-tag
                  :color="path.completed==1 ? 'success' : path.progress > 0 ? 'processing' : 'default'"
                  style="fontSize: '0.9em'; padding: '4px 8px'"
                >
                  {{ path.completed == 1 ? '已完成' : path.progress > 0 ? '学习中' : '未开始' }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
// ✅ 只保留数据，不再手动解构 ant-design-vue 组件
// 所有组件使用 <a-xxx> 标签，由全局注册支持（main.js 中 use 了 ant-design-vue）
import { ref,onMounted } from "vue"
import { getPlan } from "@/api/Study"
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = [
  { title: '总路径数', value: '3', tag: '进行中', color: 'blue' },
  { title: '已完成', value: '1', tag: '本周', color: 'green' },
  { title: '学习时长', value: '42h', tag: '累计', color: 'orange' },
];

const learningPaths = ref([
  {
    id: 1,
    title: '路径1：离散数学',
    description: '掌握逻辑、集合、图论等计算机基础理论，为算法和编程打下坚实基础。',
    progress: 0.75,
    completed: 0,
  },
  {
    id: 2,
    title: '路径2：数据结构与算法',
    description: '学习常见数据结构与经典算法，提升编程能力与问题解决能力。',
    progress: 1,
    completed: 1,
  },
  {
    id: 3,
    title: '路径3：前端开发入门',
    description: '从 HTML/CSS/JavaScript 到 Vue 框架，掌握现代前端开发技能。',
    progress: 0.4,
    completed: 0,
  },
]);

const getlearningPaths =async()=>{
  const res = await getPlan()
  learningPaths.value = res.data
  console.log(res);
}

const intonode = (id,title) =>{
  router.push({
    name:"nodes",
    query:{
      pathId:id,
      subject:title
    }
  })
}

onMounted(()=>{
  getlearningPaths()
})

</script>

<style scoped>
.learning-progress-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f5f7fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.overview-panel {
  margin-bottom: 32px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.learning-paths {
  padding: 0 16px;
}

.path-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.path-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.progress-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
}

.status-tag {
  flex: 1;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .learning-progress-page {
    padding: 12px;
  }

  .progress-status {
    flex-direction: column;
    gap: 12px;
  }

  .status-tag {
    text-align: center;
  }
}
</style>