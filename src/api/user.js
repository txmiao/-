import request from '@/utils/request'

export function login(data) {
  return request({
    // url: '/user/login',
    // method: 'post',
    // data

    method: 'post',
    baseURL: 'http://yuanhangcw.me/manage/login',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getAccountPower() {
  return request({
    method: 'get',
    // baseURL: 'http://yuanhangcw.me/manage/menu/tree'
    baseURL: 'http://yuanhangcw.me/manage/tree'
  })
}
