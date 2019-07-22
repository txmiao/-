import request from '@/utils/request'

export function articleCategoryList(query) {
  return request({
    method: 'get',
    baseURL: 'http://yuanhangcw.me/manage/category',
    params: query
  })
}

export function createArticleCategory(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/category',
    method: 'post',
    data
  })
}



export function updateArticleCategory(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/category/update',
    method: 'post',
    data
  })
}


export function deleteArticleCategory(id) {
  return request({
    // url: `/role/${id}`,
    baseURL: `http://yuanhangcw.me/manage/category/destroy/${id}`,
    method: 'get'
  })
}


//文章管理

export function articleList(query) {
  return request({
    method: 'get',
    baseURL: 'http://yuanhangcw.me/manage/article',
    params: query
  })
}

export function getCategoryList() {
  return request({
    method: 'get',
    baseURL: 'http://yuanhangcw.me/manage/article/category',
  })
}

export function createArticle(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/article',
    method: 'post',
    data
  })
}


export function deleteArticle(id) {
  return request({
    // url: `/role/${id}`,
    baseURL: `http://yuanhangcw.me/manage/article/destroy/${id}`,
    method: 'get'
  })
}




