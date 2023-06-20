import request from '@/utils/request'

// 查询企业沟通记录列表
export function listTranslateConnect(query) {
  return request({
    url: '/business/translateConnect/list',
    method: 'get',
    params: query
  })
}

// 查询企业沟通记录详细
export function getTranslateConnect(translateConnectId) {
  return request({
    url: '/business/translateConnect/' + translateConnectId,
    method: 'get'
  })
}

// 新增企业沟通记录
export function addTranslateConnect(data) {
  return request({
    url: '/business/translateConnect',
    method: 'post',
    data: data
  })
}

// 修改企业沟通记录
export function updateTranslateConnect(data) {
  return request({
    url: '/business/translateConnect',
    method: 'put',
    data: data
  })
}

// 删除企业沟通记录
export function delTranslateConnect(translateConnectId) {
  return request({
    url: '/business/translateConnect/' + translateConnectId,
    method: 'delete'
  })
}
