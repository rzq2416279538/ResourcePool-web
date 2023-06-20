import request from '@/utils/request'

// 查询企业通讯录列表
export function listTranslateBook(query) {
  return request({
    url: '/business/translateBook/list',
    method: 'get',
    params: query
  })
}

// 查询企业通讯录详细
export function getTranslateBook(translateBookId) {
  return request({
    url: '/business/translateBook/' + translateBookId,
    method: 'get'
  })
}

// 新增企业通讯录
export function addTranslateBook(data) {
  return request({
    url: '/business/translateBook',
    method: 'post',
    data: data
  })
}

// 修改企业通讯录
export function updateTranslateBook(data) {
  return request({
    url: '/business/translateBook',
    method: 'put',
    data: data
  })
}

// 删除企业通讯录
export function delTranslateBook(translateBookId) {
  return request({
    url: '/business/translateBook/' + translateBookId,
    method: 'delete'
  })
}
export function recoverys(data) {
  return request({
    url: '/business/translateBook/recoverys',
    method: 'post',
    data: data
  })
}
