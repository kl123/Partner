import request from '@/utils/request.js'

export const gettest = () => {
  return request.get('/title/listTestsAll')
}

export const addtest = (test) => {
  return request.post('/title/addTestAndTitlesList/addWrongQuestion', test)
}

export const getquestion = (testid) => {
  return request.post('/title/listTitlesByTestId', testid)
}