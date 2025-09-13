<template>
  <div
    style="
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 8px 12px;
      gap: 8px;
    "
  >
    <!-- 录音模式 -->
    <div v-if="!isTextInputMode" style="flex: 1; min-width: 0;">
      <a-button
        :type="isRecording ? 'danger' : 'primary'"
        @mousedown="handlePress"
        @mouseleave="handleMouseLeave"
        style="
          width: 100%;
          font-size: 18px;
          border-radius: 24px;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px #e8eaef solid;
          background-color: white;
          color: black;
        "
      >
        <template #icon>
          <AudioOutlined v-if="!isRecording" />
          <SendOutlined v-else />
        </template>
        {{ isRecording ? '再按发送' : '按住说话' }}
      </a-button>
    </div>

    <!-- 文本输入模式 -->
    <div v-else style="flex: 1; min-width: 0; position: relative;">
      <a-input
        v-model:value="inputText"
        @keyup.enter="sendTextMessage"
        placeholder="输入你的消息..."
        style="
          width: 100%;
          height: 40px;
          border-radius: 24px;
          font-size: 16px;
          border: 1px #e8eaef solid;
        "
      />
      <a-button
        type="primary"
        @click="sendTextMessage"
        style="
          position: absolute;
          right: 4px;
          top: 4px;
          bottom: 4px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        发送
      </a-button>
    </div>

    <!-- 切换图标 -->
    <SwapOutlined
      @click="toggleInputMode"
      :style="{
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        transform: isTextInputMode ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease'
      }"
    />
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { AudioOutlined, SendOutlined, SwapOutlined } from '@ant-design/icons-vue';
import { audioToText,textToAudio,AiThough } from "@/api_py/audio";
import { message } from 'ant-design-vue';

// 录音相关
const isRecording = ref(false);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const audioUrl = ref('');
const recordTime = ref(0);
let timer = null;

// 输入模式切换
const isTextInputMode = ref(false); // false=录音模式, true=文本输入模式
const inputText = ref('');

// 切换输入模式
const toggleInputMode = () => {
  isTextInputMode.value = !isTextInputMode.value;
  // 如果从文本切回录音，清空输入框
  if (!isTextInputMode.value) {
    inputText.value = '';
  }
};

// 录音相关逻辑（保持不变）
const handlePress = () => {
  if (isRecording.value) {
    stopRecordingAndSend();
  } else {
    startRecording();
  }
};

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
      sendAudioToAI(audioBlob);
    };

    mediaRecorder.value.start();
    isRecording.value = true;
    recordTime.value = 0;

    timer = setInterval(() => {
      recordTime.value++;
    }, 1000);
  } catch (err) {
    console.error('录音启动失败:', err);
    alert('无法访问麦克风，请检查权限设置。');
  }
};

const stopRecordingAndSend = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    clearInterval(timer);
    isRecording.value = false;
  }
};

const sendAudioToAI = async (audioBlob) => {
  console.log('🔊 正在发送录音到 AI 服务...', audioBlob);

  const response = await processWithLoading(
    () => audioToText(audioBlob),
    '正在识别语音...'
  );

  console.log(response);
  if (response.code == 200) {
    const res = await processWithLoading(
      () => AiThough(response.data),
      '小暖正在思考...'
    );
    console.log(res);

    if (res.code == 200) {
      const res2 = await processWithLoading(
        () => textToAudio(res.data),
        '小暖火速加载中...'
      );
      console.log(res2);
      playTTS(res2.text);
    }
  }
};

const sendTextMessage = async () => {
  if (!inputText.value.trim()) return;

  console.log('📨 发送文本消息:', inputText.value);

  const response = await processWithLoading(
    () => AiThough(inputText.value),
    '小暖正在思考...'
  );

  if (response.code == 200) {
    const res2 = await processWithLoading(
      () => textToAudio(response.data),
      '小暖火速加载中..'
    );
    console.log(res2);
    playTTS(res2.text);
  }

  inputText.value = '';
};

const handleMouseLeave = () => {
  // 可选：移出时自动结束录音
};

const playTTS = (audioUrl) => {

  const audio = new Audio(audioUrl)
  
  // 控制音量
  audio.volume = 1.0

  // 播放
  audio.play().catch(err => {
    console.error("播放失败:", err)
    alert("浏览器阻止了自动播放，请点击页面任意位置后再试～")
  })

  // 播放结束回调
  audio.onended = () => {
    console.log("播放结束")
  }
}

// 带 loading 的 AI 处理函数
const processWithLoading = async (processFn, loadingText = '小暖正在思考...') => {
  const hide = message.loading(loadingText, 0); 
  try {
    const result = await processFn();
    return result;
  } finally {
    hide();
  }
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
  }
});
</script>

<style scoped>
:deep(.ant-btn) {
  transition: all 0.2s;
}
:deep(.ant-btn):active {
  transform: scale(0.98);
}

/* 输入框内按钮样式 */
:deep(.ant-input) {
  padding-right: 80px; /* 给右侧按钮留空间 */
}
</style>