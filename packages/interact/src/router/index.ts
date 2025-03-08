import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DocsView from '../views/DocsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/docs',
    redirect: '/docs/01-overview'
  },
  {
    path: '/docs/:fileName',
    name: 'docs',
    component: DocsView,
    props: true
  },
  {
    path: '/examples/drag-basic',
    name: 'example-drag-basic',
    component: async () => await import('../examples/DragBasicExample.vue')
  },
  {
    path: '/examples/resize',
    name: 'example-resize',
    component: async () => await import('../examples/ResizeExample.vue')
  },
  {
    path: '/examples/grid-snap',
    name: 'example-grid-snap',
    component: async () => await import('../examples/GridSnapExample.vue')
  },
  {
    path: '/examples/drag-drop',
    name: 'example-drag-drop',
    component: async () => await import('../examples/DragDropExample.vue')
  },
  {
    path: '/examples/gesture',
    name: 'example-gesture',
    component: async () => await import('../examples/GestureExample.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
