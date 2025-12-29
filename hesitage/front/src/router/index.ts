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
      path: '/ai-dialog',
      name: 'ai-dialog',
      component: () => import('../views/AIDialogView.vue'),
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../views/CommunityView.vue'),
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
      meta: { requiresAuth: true },
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
    {
      path: '/profile/settings',
      component: () => import('../views/ProfileSettings.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
    },

    {
      path: '/Content',
      name: 'Content',
      component: () => import('@/views/Content.vue')
    }
    

  ],
})

router.onError((err) => {
  console.error('[router.onError]', err)
})

router.beforeEach((to) => {
  const loggedIn = localStorage.getItem('isLoggedIn') === '1' || !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !loggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
