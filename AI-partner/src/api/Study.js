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

// 更新进度
export const updateProgress = (data) => {
  const pathStr = localStorage.getItem('pathId')
  const conceptStr = localStorage.getItem('concept_id')

  // 转为整数
  const pathId = parseInt(pathStr, 10)
  const concept_id = parseInt(conceptStr, 10)

  // 可选：校验是否转换成功
  if (isNaN(pathId) || isNaN(concept_id)) {
    console.error('路径ID或概念ID无效:', { pathStr, conceptStr })
    return Promise.reject(new Error('Invalid ID'))
  }

  return request.post('/IndividualPlaning/updateProgressOfTheLearningPath', {
    pathId:pathId,      // 已是整数
    concept_id:concept_id,  // 已是整数
    progress: data
  })
}