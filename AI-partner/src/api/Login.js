// 登录的相关api
import request from '@/utils/request.js'

export const login = (data) => {
  return request.post('/user/login', data)
}

//测试jwt
// export const test = () => {
//   return request.get('/test')
// }