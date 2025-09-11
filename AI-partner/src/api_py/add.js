import request from '@/utils/request_py.js'

export const adderror = (error) => {
  return request.post('/workflow/ErrorInsertRun', error)
}

export const getquestionanswer = (test) => {
  return request.post('workflow/analysis', test)
}