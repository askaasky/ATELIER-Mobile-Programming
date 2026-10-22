import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import CollectionPage from '../views/CollectionPage.vue'
import CollectionDetailPage from '../views/CollectionDetailPage.vue'
import FavoritePage from '../views/FavoritePage.vue'
import ExplorePage from '../views/ExplorePage.vue'
import ChatPage from '../views/ChatPage.vue'

const routes: Array<RouteRecordRaw> = [
    {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  
  {
    path: '/',
    redirect: '/home'
  },

  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },

  {
    path: '/explore',
    name: 'Explore',
    component: ExplorePage
  },

  {
    path: '/collection',
    name: 'Collection',
    component: CollectionPage
  },

  {
    path: '/collection/:id',
    name: 'CollectionDetail',
    component: CollectionDetailPage
  },

  {
    path: '/favorite',
    name: 'Favorite',
    component: FavoritePage
  },

  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router