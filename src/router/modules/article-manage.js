/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const articleRouter = {
  path: '/article-manage',
  component: Layout,
  redirect: '/article-manage/article-list',
  name: 'articleManage',
  meta: {
    title: '文章管理',
    icon: 'table'
  },
  children: [
    {
      path: 'article-list',
      component: () => import('@/views/article-manage/article-list'),
      name: 'articleList',
      meta: { title: '文章列表' }
    },
    {
      path: 'article-category-list',
      component: () => import('@/views/article-manage/article-category-list'),
      name: 'articleCategorylist',
      meta: { title: '分类列表' }
    },

  ]
}
export default articleRouter
