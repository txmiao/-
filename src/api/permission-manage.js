import request from '@/utils/request'

export function permissionList(query) {
  return request({
    method: 'get',
    baseURL: 'http://yuanhangcw.me/manage/permission',
    params: query
  })
}

export function createPermission(data) {
  return request({
    // url: '/article/create',
    baseURL: 'http://yuanhangcw.me/manage/permission',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/permission/update',
    method: 'post',
    data
  })
}

export function deletePermission(id) {
  return request({
    // url: `/role/${id}`,
    baseURL: `http://yuanhangcw.me/manage/permission/destroy/${id}`,
    method: 'get'
  })
}

//资源----
export function resourcesList(query) {
  return request({
    method: 'get',
    baseURL: 'http://yuanhangcw.me/manage/menu',
    params: query
  })
}


export function topresourcesList() {
  return request({
    method: 'get',
    baseURL: 'http://yuanhangcw.me/manage/menu/topmenu'
  })
}

export function createResources(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/menu',
    method: 'post',
    data
  })
}

export function updateResources(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/menu/update',
    method: 'post',
    data
  })
}

export function deleteResources(id) {
  return request({
    // url: `/role/${id}`,
    baseURL: `http://yuanhangcw.me/manage/menu/destroy/${id}`,
    method: 'get'
  })
}


// 角色
export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles(query) {
  return request({
    baseURL: `http://yuanhangcw.me/manage/role`,
    method: 'get',
    params: query
  })
}

export function createRole(data) {
  return request({
    baseURL: `http://yuanhangcw.me/manage/role`,
    method: 'post',
    data
  })
}

export function addRole(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    // url: `/role/${id}`,
    baseURL: `http://yuanhangcw.me/manage/role/destroy/${id}`,
    method: 'get'
  })
}




export function getPermissionlist() {
  return request({
    baseURL: `http://yuanhangcw.me/manage/role/permission`,
    method: 'get'
  })
}

export function checkedPermission(id) {
  return request({
    // url: `/role/${id}`,
    baseURL: `http://yuanhangcw.me/manage/role/edit/${id}`,
    method: 'get'
  })
}

export function updateRole(data) {
  return request({
    baseURL: 'http://yuanhangcw.me/manage/role/update',
    method: 'post',
    data
  })
}
