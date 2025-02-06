import { createRouter, createWebHistory } from 'vue-router'
const routes = [
    {
        path: '/',
        component: () => import('../views/Upload.vue'),
        name: 'Upload'
    },
    {
        path: '/dashboard',
        component: () => import('../views/View.vue'),
        name: 'Dashboard'
    },
    {
        path: '/editbyname',
        component: () => import('../views/EditByName.vue'),
        name: 'Edit By Name'
    },
    {
        path: '/editbydate',
        component: () => import('../views/EditByDate.vue'),
        name: 'Edit By Date'
    },
    {
        path: '/username',
        component: () => import('../views/EditUserName.vue'),
        name: 'Edit Name'
    },
    {
        path: '/data',
        component: () => import('../views/Data.vue'),
        name: 'Data Management'
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
