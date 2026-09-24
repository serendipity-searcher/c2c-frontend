import { createRouter, createWebHistory } from 'vue-router'
import ConversationView from '@/views/ConversationView.vue'

const textPage = () => import('@/views/TextPageView.vue')

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'conversation', component: ConversationView },
    { path: '/about', name: 'about', component: textPage, props: { section: 'about' } },
    { path: '/rules', name: 'rules', component: textPage, props: { section: 'rules' } },
    { path: '/screen', name: 'screen', component: () => import('@/views/ScreenView.vue') },
  ],
})
