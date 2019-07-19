/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const permissionRouter = {
  path: '/permission-manage',
  component: Layout,
  redirect: '/permission-manage/permission-list',
  name: 'permissionManage',
  meta: {
    title: '权限管理',
    icon: 'table'
  },
  children: [
    {
      path: 'admin-list',
      component: () => import('@/views/permission-manage/admin-list'),
      name: 'adminList',
      meta: { title: '管理员列表' }
    },
    {
      path: 'role-list',
      component: () => import('@/views/permission-manage/role-list'),
      name: 'roleList',
      meta: { title: '角色列表' }
    },
    {
      path: 'permission-list',
      component: () => import('@/views/permission-manage/permission-list'),
      name: 'permissionList',
      meta: { title: '权限列表' }
    },
    {
      path: 'resources-list',
      component: () => import('@/views/permission-manage/resources-list'),
      name: 'resourcesList',
      meta: { title: '资源列表' }
    },
  ]
}
export default permissionRouter
