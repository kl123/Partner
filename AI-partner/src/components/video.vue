<template>
    <div>  
      <!-- 加载中遮罩 -->
      <a-spin :spinning="loading" tip="加载中..." style="display: block; margin-top: 20px;">
        <div v-if="!loading" style="padding: 20px;">
          <!-- 这里可以放你加载完成后的视频或其他内容 -->
          <p>视频标题：{{ title }}</p>
          <!-- 其他内容... -->
        </div>
      </a-spin>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import { CaptureVideo } from '@/api_py/video.js';
  import { useRouter, useRoute } from 'vue-router';
  
  const router = useRouter();
  const route = useRoute();
  
  // 接收参数
  const title = route.query.title;
  
  // 控制加载状态
  const loading = ref(true);
  
  const getData = async () => {
    try {
      const res = await CaptureVideo(title);
      console.log('获取数据成功:', res);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      loading.value = false; // 加载结束
    }
  };
  
  const goBack = () => {
    router.back()
  };
  
  onMounted(() => {
    getData();
  });
  </script>