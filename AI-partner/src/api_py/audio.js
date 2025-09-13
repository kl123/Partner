
import request from '@/utils/request_py.js'

// 🎙️ 语音转文字（上传音频文件）
export const audioToText = (audioFile) => {
  const formData = new FormData()
  formData.append('file', audioFile) // 后端接收字段名为 'file'

  return request({
    url: '/modelCall/AudioToText',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 📝 文字转语音
export const textToAudio = (text) => {
  return request.post('/modelCall/TextToAudio', {
    text: text
  },
  {
      timeout: 60000  // ✅ 设置为 60 秒
    })
}

//传给ai引擎
export const AiThough = (text) => {
    return request.post('/modelCall/AIEmotion', {
        emotion: text
    },
    {
        timeout: 60000  // ✅ 设置为 60 秒
      })
  }