<template>
    <a-space direction="vertical" style="width: 100%; text-align: center;">
      <a-button
        :type="isRecording ? 'danger' : 'primary'"
        @mousedown="handlePress"
        @mouseleave="handleMouseLeave"
        style="width: 90%; font-size: 18px; border-radius: 24px; user-select: none;
        display: flex;align-items: center;justify-content: center;border: 1px #e8eaef solid;background-color: white;color: black;"
      >
        <template #icon>
          <AudioOutlined v-if="!isRecording" />
          <SendOutlined v-else />
        </template>
        {{ isRecording ? '再按发送' : '按住说话' }}
      </a-button>
      <!-- <a-typography-text v-if="audioUrl" type="secondary" style="margin-top: 12px;"> -->
        <!-- 录音完成，已自动发送！ -->
        <!-- 可选：保留播放用于调试 -->
        <!-- <a href="#" @click.prevent="playAudio">▶️ 播放录音</a> -->
      <!-- </a-typography-text> -->
  
      <!-- 可选：显示录音时长 -->
      <!-- <a-typography-text v-if="isRecording" type="danger" style="font-size: 12px;">
        {{ formatTime(recordTime) }}
      </a-typography-text> -->
    </a-space>
  </template>
  
  <script setup>
  import { ref, onUnmounted } from 'vue';
  import { AudioOutlined, SendOutlined,SwapOutlined } from '@ant-design/icons-vue';
  
  const isRecording = ref(false);
  const mediaRecorder = ref(null);
  const audioChunks = ref([]);
  const audioUrl = ref('');
  const recordTime = ref(0); // 录音时长（秒）
  let timer = null;
  
  // 🎯 核心：统一处理 mousedown —— 第一次录音，第二次发送
  const handlePress = () => {
    if (isRecording.value) {
      // 第二次按 → 停止并发送
      stopRecordingAndSend();
    } else {
      // 第一次按 → 开始录音
      startRecording();
    }
  };
  
  // 开始录音
  const startRecording = async () => {
    try {
      audioChunks.value = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.value = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  
      mediaRecorder.value.ondataavailable = (e) => {
        audioChunks.value.push(e.data);
      };
  
      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
        audioUrl.value = URL.createObjectURL(audioBlob);
  
        // ✅ 模拟“发送”动作 —— 你可以替换为你自己的 AI 接口调用
        sendAudioToAI(audioBlob);
      };
  
      mediaRecorder.value.start();
      isRecording.value = true;
      recordTime.value = 0;
  
      // 启动计时器
      timer = setInterval(() => {
        recordTime.value++;
      }, 1000);
    } catch (err) {
      console.error('录音启动失败:', err);
      alert('无法访问麦克风，请检查权限设置。');
    }
  };
  
  // 停止录音 + 发送
  const stopRecordingAndSend = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
      clearInterval(timer);
      isRecording.value = false;
    }
  };
  
  // 🚀 模拟发送录音到 AI 的函数（你替换成真实接口）
  const sendAudioToAI = (audioBlob) => {
    console.log('🔊 正在发送录音到 AI 服务...', audioBlob);
  
    // 示例：用 FormData 上传
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
  
    // 伪代码：替换成你自己的 AI 接口
    // fetch('/api/ai/transcribe', {
    //   method: 'POST',
    //   body: formData,
    // })
    // .then(res => res.json())
    // .then(data => {
    //   console.log('AI 识别结果:', data.text);
    //   // 可以在这里把识别结果填入聊天框或直接显示
    // });
  
    // 演示：2秒后提示“已发送”
    setTimeout(() => {
      alert('录音已发送给 AI，正在处理...');
    }, 500);
  };
  
  // 防止鼠标移出未松开导致状态异常
  const handleMouseLeave = () => {
    if (isRecording.value) {
      // 可选：移出时自动结束录音（不发送）
      // stopRecordingAndSend();
    }
  };
  
  // 播放录音（调试用，可删）
  const playAudio = () => {
    if (audioUrl.value) {
      const audio = new Audio(audioUrl.value);
      audio.play();
    }
  };
  
  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 组件卸载时清理
  onUnmounted(() => {
    if (timer) clearInterval(timer);
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
    }
  });
  </script>
  
  <style scoped>
  /* 可选：添加按下反馈 */
  :deep(.ant-btn) {
    transition: all 0.2s;
  }
  :deep(.ant-btn):active {
    transform: scale(0.98);
  }

  </style>