import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
    },
    {
      path: '/heritage',
      name: 'heritage',
      component: () => import('../views/HeritageView.vue'),
    },
    {
      path: '/detail',
      name: 'detail',
      component: () => import('../views/DetailView.vue'),
    },
        {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/profile/edit',
      name: 'profile-favorites',
      component: () => import('../views/ProfileFavoritesView.vue'),
    },
    {
      path: '/profile/detail',
      name: 'profile-detail',
      component: () => import('../views/ProfileDetailView.vue'),
    },
  ],
})

export default router
