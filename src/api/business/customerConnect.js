import request from '@/utils/request'

// 查询客户沟通记录列表
export function listCustomerConnect(query) {
  return request({
    url: '/business/customerConnect/list',
    method: 'get',
    params: query
  })
}

// 查询客户沟通记录详细
export function getCustomerConnect(customerConnectId) {
  return request({
    url: '/business/customerConnect/' + customerConnectId,
    method: 'get'
  })
}

// 新增客户沟通记录
export function addCustomerConnect(data) {
  return request({
    url: '/business/customerConnect',
    method: 'post',
    data: data
  })
}

// 修改客户沟通记录
export function updateCustomerConnect(data) {
  return request({
    url: '/business/customerConnect',
    method: 'put',
    data: data
  })
}

// 删除客户沟通记录
export function delCustomerConnect(customerConnectId) {
  return request({
    url: '/business/customerConnect/' + customerConnectId,
    method: 'delete'
  })
}
