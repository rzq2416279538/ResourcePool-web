import request from '@/utils/request'

// 查询客户通讯录列表
export function listBook(query) {
  return request({
    url: '/business/book/list',
    method: 'get',
    params: query
  })
}

export function getBook(bookId) {
  return request({
    url: '/business/book/' + bookId,
    method: 'get'
  })
}


// 新增客户通讯录
export function addBook(data) {
  return request({
    url: '/business/book',
    method: 'post',
    data: data
  })
}

// 修改客户通讯录
export function updateBook(data) {
  return request({
    url: '/business/book',
    method: 'put',
    data: data
  })
}

// 删除客户通讯录
export function delBook(bookId) {
  return request({
    url: '/business/book/' + bookId,
    method: 'delete'
  })
}

// 回收
export function recoverys(data) {
  return request({
    url: '/business/book/recoverys',
    method: 'post',
    data: data
  })
}
