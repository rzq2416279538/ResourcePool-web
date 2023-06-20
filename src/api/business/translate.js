import request from '@/utils/request'

// 查询企业资源列表
export function listTranslate(query) {
  return request({
    url: '/business/translate/list',
    method: 'get',
    params: query
  })
}

// 查询企业资源详细
export function getTranslate(translateId) {
  return request({
    url: '/business/translate/' + translateId,
    method: 'get'
  })
}

// 新增企业资源
export function addTranslate(data) {
  return request({
    url: '/business/translate',
    method: 'post',
    data: data
  })
}

// 修改企业资源
export function updateTranslate(data) {
  return request({
    url: '/business/translate',
    method: 'put',
    data: data
  })
}

// 领取企业资源
export function getBookTranslate(data) {
  return request({
    url: '/business/translate/getBook',
    method: 'post',
    data: data
  })
}

// 批量领取企业资源
export function getBookTranslateIds(ids) {
  return request({
    url: '/business/translate/getBookIds/' + ids,
    method: 'post',
  })
}

// 删除企业资源
export function delTranslate(translateId) {
  return request({
    url: '/business/translate/' + translateId,
    method: 'delete'
  })
}
