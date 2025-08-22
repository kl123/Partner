import request from '@/utils/request.js'

//知识图谱的插入
export const createPlan = (data) => {
    return request.post('/IndividualPlaning/Create',data)
  }
  
//获取个人的所有学习路径
export const getPlan = () => {
  return request.get('/IndividualPlaning/listLearnPlaning')
}

//获取路径上的全部知识点
export const getNodes = (data) => {
  return request.post('/IndividualPlaning/listKnowledgePoints',{
    pathId:data
  })
}