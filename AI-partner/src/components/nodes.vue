<template>
    <div class="linear-timeline-container">
      <a-typography-title :level="2" style="text-align: center; color: #1890ff; margin-bottom: 40px">
        📚 {{ subject }}的学习路径
      </a-typography-title>
  
      <a-timeline mode="center">
        <a-timeline-item
          v-for="(item, index) in timelineItems"
          :key="index"
          :color="getDotColor(index)"
        >
          <!-- 小卡片位于小圆点下方 -->
          <div class="timeline-card-below">
            <a-card
              :bordered="false"
              class="timeline-card"
              :class="`gradient-${index + 1}`"
            >
              <template #title>
                <span style="color: white; font-weight: bold">{{ item.displayName }}</span>
              </template>
  
              <!-- 内容区域 -->
              <div class="card-content">
                <!-- 难度 -->
                <div class="card-row">
                  <strong>🎯 难度：</strong>
                  <span class="difficulty-stars">
                    {{ '⭐'.repeat(item.difficulty) }}
                  </span>
                </div>
  
                <!-- 计划时间 -->
                <div class="card-row">
                  <strong>🕒 计划时间：</strong>
                  <span>{{ item.dayNum }} 天</span>
                </div>
  
                <!-- 描述 -->
                <div class="card-row">
                  <strong>📌 说明：</strong>
                  <span>{{ item.description }}</span>
                </div>
  
                <!-- 按钮 -->
                <div class="card-row" style="text-align: right; margin-top: 12px">
                  <a-button
                    type="primary"
                    size="small"
                    shape="round"
                    @click="handleStart(item)"
                  >
                    ▶️ 进入学习
                  </a-button>
                </div>
              </div>
            </a-card>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </template>
  
  <script setup>
  import { ref,onMounted } from "vue"
  import { getNodes } from "@/api/Study"
  import { Typography, Timeline, Card, Button } from 'ant-design-vue';
  import { useRouter,useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()
  // 注册组件
  const ATypographyTitle = Typography.Title;
  const ATimeline = Timeline;
  const ATimelineItem = Timeline.Item;
  const ACard = Card;
  const AButton = Button;
  const subject = route.query.subject
  onMounted(()=>{
    requestNode()
  })
  // 学习路径数据（增强版）
  const timelineItems = ref([
    {
      displayName: '路径1：离散数学',
      difficulty: 2,
      difficultyText: '中等',
      dayNum: 10,
      description: '学习集合、逻辑、图论等基础数学知识，为算法打下坚实基础。',
    },
    {
      displayName: '路径2：数据结构与算法',
      difficulty: 3,
      difficultyText: '困难',
      dayNum: 21,
      description: '掌握数组、链表、栈、队列、树、图等结构及常见算法实现。',
    },
    {
      displayName: '路径3：前端开发入门',
      difficulty: 1,
      difficultyText: '简单',
      dayNum: 14,
      description: '学习 HTML、CSS、JavaScript 和 Vue 基础，完成静态页面开发。',
    },
    {
      displayName: '路径4：算法进阶实战',
      difficulty: 3,
      difficultyText: '困难',
      dayNum: 30,
      description: '深入动态规划、贪心、回溯等高级算法，结合 LeetCode 实战训练。',
    },
  ]);
  
  // 小圆点颜色（与卡片渐变起始色一致）
  const getDotColor = (index) => {
    const colors = [
      '#ff7e5f', // gradient-1
      '#6a11cb', // gradient-2
      '#00b4db', // gradient-3
      '#86a8e7', // gradient-4
      '#f9cb40', // gradient-5
      '#e94d6b', // gradient-6
      '#4ecdc4', // gradient-7
      '#6c5ce7', // gradient-8
      '#fd79a8', // gradient-9
      '#a55eea'  // gradient-10
    ];
    return colors[index % colors.length];
  };
  
  //获取学习路径上的知识点
  const requestNode = async() => {
    const id = route.query.pathId
    const res = await getNodes(id)
    console.log(res);
    timelineItems.value = res.data
  }

  // 模拟点击“进入学习”
  const handleStart = (item) => {
    console.log('🚀 开始学习:', item.title);
    // 这里可以跳转页面，比如：
    // router.push(`/study/${item.title}`)
  };
  </script>
  
  <style scoped>
  .linear-timeline-container {
    padding: 40px 20px;
    background-color: #f8f9fa;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .timeline-card-below {
    display: flex;
    justify-content: center;
    margin-top: 12px;
    margin-bottom: 24px;
    width: 100%;
  }
  
  .timeline-card {
    width: 100%;
    max-width: 400px;
    border-radius: 14px !important;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: white;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .timeline-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  }
  
  /* 卡片内容样式 */
  .card-content {
    font-size: 14px;
    line-height: 1.6;
  }
  
  .card-row {
    margin-bottom: 8px;
  }
  
  .difficulty-stars {
    margin-left: 6px;
    font-size: 16px;
  }
  
  /* --- 渐变背景 --- */
  .gradient-1  { background: linear-gradient(135deg, #ff7e5f, #feb47b); }
  .gradient-2  { background: linear-gradient(135deg, #6a11cb, #2575fc); }
  .gradient-3  { background: linear-gradient(135deg, #00b4db, #0083b0); }
  .gradient-4  { background: linear-gradient(135deg, #86a8e7, #91eae4); }
  .gradient-5  { background: linear-gradient(135deg, #f9cb40, #f8b500); }
  .gradient-6  { background: linear-gradient(135deg, #e94d6b, #ef7e8b); }
  .gradient-7  { background: linear-gradient(135deg, #4ecdc4, #44a08d); }
  .gradient-8  { background: linear-gradient(135deg, #6c5ce7, #a55eea); }
  .gradient-9  { background: linear-gradient(135deg, #fd79a8, #e84393); }
  .gradient-10 { background: linear-gradient(135deg, #a55eea, #7a4fed); }
  
  /* --- 响应式适配 --- */
  @media (max-width: 768px) {
    .linear-timeline-container {
      padding: 20px 12px;
    }
  
    .timeline-card {
      max-width: 320px;
      border-radius: 12px;
    }
  
    .timeline-card-below {
      margin-top: 8px;
      margin-bottom: 16px;
    }
  
    .card-content {
      font-size: 13px;
    }
  }
  </style>