import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/home/index.vue';
import HomeConsole from '../views/home/console.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/console',
    name: 'console',
    component: HomeConsole,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
