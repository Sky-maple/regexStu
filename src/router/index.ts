import { createRouter, createWebHashHistory } from 'vue-router'
import { lessons } from '@/data/curriculum'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/learn', redirect: `/learn/${lessons[0].id}` },
    { path: '/learn/:lessonId', name: 'learn', component: () => import('@/views/LearnView.vue') },
    { path: '/lab', name: 'lab', component: () => import('@/views/LabView.vue') },
    { path: '/practice', name: 'practice', component: () => import('@/views/PracticeView.vue') },
    { path: '/challenge', name: 'challenge', component: () => import('@/views/ChallengeView.vue') },
    { path: '/mistakes', name: 'mistakes', component: () => import('@/views/MistakesView.vue') },
    { path: '/cases', name: 'cases', component: () => import('@/views/CasesView.vue') },
    { path: '/progress', name: 'progress', component: () => import('@/views/ProgressView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.name === 'learn' && from.name === 'learn') return { top: 0 }
    return { top: 0 }
  }
})

export default router
