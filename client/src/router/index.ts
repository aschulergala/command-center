import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tokens',
    },
    {
      path: '/tokens',
      name: 'tokens',
      component: () => import('@/views/TokensView.vue'),
    },
    {
      path: '/nfts',
      name: 'nfts',
      component: () => import('@/views/NFTsView.vue'),
    },
    {
      path: '/creators',
      name: 'creators',
      component: () => import('@/views/CreatorsView.vue'),
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('@/views/ExportView.vue'),
    },
  ],
})

export default router
