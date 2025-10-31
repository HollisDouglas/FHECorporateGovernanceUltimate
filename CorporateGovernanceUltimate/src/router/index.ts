import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Proposals from '@/views/Proposals.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/proposals',
    name: 'Proposals',
    component: Proposals
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
