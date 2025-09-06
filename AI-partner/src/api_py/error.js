import request from '@/utils/request_py.js'

//查询--展示全部错题
export const CaptureErrors = (data) => {
    return request.post('/workflow/data', {
        input: data
    })
  }
