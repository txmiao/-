/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const userRouter = {
  path: '/user-manage',
  component: Layout,
  redirect: '/user-manage/user-list',
  name: 'userManage',
  meta: {
    title: '用户管理',
    icon: 'table'
  },
  children: [
    {
      path: 'user-list',
      component: () => import('@/views/user-manage/user-list'),
      name: 'userList',
      meta: { title: '用户管理' }
    },
    // {
    //   path: 'article-list',
    //   component: () => import('@/views/article-manage/article-list'),
    //   name: 'articleList',
    //   meta: { title: '文章列表' }
    // },
  ]
}
export default userRouter
