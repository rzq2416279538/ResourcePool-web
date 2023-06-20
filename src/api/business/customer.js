import request from '@/utils/request'

// 查询客户资源列表
export function listCustomer(query) {
  return request({
    url: '/business/customer/list',
    method: 'get',
    params: query
  })
}

// 查询客户资源详细
export function getCustomer(customerId) {
  return request({
    url: '/business/customer/' + customerId,
    method: 'get'
  })
}

// 新增客户资源
export function addCustomer(data) {
  return request({
    url: '/business/customer',
    method: 'post',
    data: data
  })
}

// 修改客户资源
export function updateCustomer(data) {
  return request({
    url: '/business/customer',
    method: 'put',
    data: data
  })
}

export function getBookCustomer(data) {
  return request({
    url: '/business/customer/getBook',
    method: 'post',
    data: data
  })
}

export function getBookCustomerIds(ids) {
  return request({
    url: '/business/customer/getBookIds/' + ids,
    method: 'post',
  })
}


// 删除客户资源
export function delCustomer(customerId) {
  return request({
    url: '/business/customer/' + customerId,
    method: 'delete'
  })
}
