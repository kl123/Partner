<template>
  <div class="video-list-container">
    

    <!-- 加载中遮罩 -->
    <a-spin :spinning="loading" tip="加载中..." style="display: block; margin: 20px auto;">
      <!-- 视频卡片列表 -->
      <div v-if="!loading" class="video-cards-grid">
        <a-card
          v-for="(item, index) in DataList"
          :key="index"
          hoverable
          class="video-card"
          @click="openVideo(item.video_url)"
        >
          <!-- 封面图 + 时长 -->
          <div class="video-cover-wrapper">
            <img
              :src="item.video_image"
              alt="视频封面"
              @error="$event.target.src='https://images.unsplash.com/photo-1489389944381-3471b5b30f04?w=800&auto=format&fit=crop&q=80'"
              class="video-cover"
            />
            <div class="video-duration">
              {{ item.video_duration }}
            </div>
          </div>

          <!-- 视频信息区 -->
          <div class="video-info">
            <!-- 标题（省略） -->
            <a-tooltip :title="item.video_name" placement="topLeft">
              <div class="video-title">
                {{ item.video_name }}
              </div>
            </a-tooltip>

            <!-- 简介（省略） -->
            <a-tooltip :title="item.video_description" placement="topLeft">
              <div class="video-desc">
                {{ truncateText(item.video_description, 60) }}
              </div>
            </a-tooltip>

            <!-- 统计信息 -->
            <div class="video-meta">
              <span class="meta-item">👁️ {{ item.video_views }}</span>
              <span class="meta-item">👍 {{ item.video_like }}</span>
              <span class="meta-item">⭐ {{ item.video_collection }}</span>
              <span class="meta-item">🪙 {{ item.video_coins }}</span>
              <span class="meta-item">🔁 {{ item.video_forward }}</span>
              <span class="meta-item">📅 {{ formatDate(item.video_date) }}</span>
            </div>

            <!-- 作者 -->
            <div class="video-author">
              🎥 {{ item.video_author }}
            </div>
          </div>
        </a-card>

        <!-- 无数据提示 -->
        <div v-if="DataList.length === 0" class="no-data">
          暂无相关视频
        </div>
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

// 数据
const DataList = ref([]);
const loading = ref(true);

// 获取数据
const getData = async () => {
  try {
    const res = await CaptureVideo(title);
    console.log('获取数据成功:', res);
    DataList.value = res.data || res; // 根据实际返回结构调整
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 打开视频链接（新标签页）
const openVideo = (url) => {
  const match = url.match(/BV[a-zA-Z0-9]{10}/)
  console.log(match[0]);
  router.push({
    name:"Play",
    query:{
      bvid:match[0]
    }
  })
  // window.open(url, '_blank');
};

// 截取文本（用于标题/简介过长）
const truncateText = (text, length) => {
  if (!text) return '暂无简介';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

// 格式化日期（去除前面的 " · "）
const formatDate = (dateStr) => {
  return dateStr ? dateStr.replace(/^ \· /, '') : '未知时间';
};

onMounted(() => {
  getData();
});
</script>

<style scoped>
.video-list-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 16px;
  font-weight: 500;
}

/* 网格布局 */
.video-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 10px;
}

.video-card {
  border-radius: 12px !important;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 封面图区域 */
.video-cover-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  background-color: #000;
  border-radius: 8px;
}

.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

/* 信息区 */
.video-info {
  padding: 12px 14px;
}

.video-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.video-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.video-author {
  font-size: 13px;
  color: #1890ff;
  font-weight: 500;
}

/* 无数据 */
.no-data {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .video-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .back-button {
    font-size: 15px;
  }

  .video-title {
    font-size: 14px;
  }

  .video-desc {
    font-size: 12px;
  }

  .video-meta {
    font-size: 11px;
  }
}
</style>