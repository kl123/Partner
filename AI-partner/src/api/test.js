import request from '@/utils/request.js'

export const gettest = () => {
  return request.get('/IndividualPlaning/listTestsAll')
}

export const addtest = (test) => {
  return request.post('/IndividualPlaning/addWrongQuestion', test)
}

export const getquestion = (testid) => {
  return request.post('/IndividualPlaning/listTitleByTestId', testid)
}