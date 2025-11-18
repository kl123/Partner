import request from '@/utils/request.js'
//获取用户课程
export const getclass = () => {
    return request.get('/IndividualPlaning/getCourse')
  }
//添加个人课表
export const addclass = (data) => {
    return request.post('/IndividualPlaning/AddCourse',
    {
        course:data
    })
  }