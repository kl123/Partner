import request from '@/utils/request_py.js'

//py爬虫获取学习视频
export const CaptureVideo = (data) => {
    return request.post('/videoCrawler/run', {
        title: data
    })
  }