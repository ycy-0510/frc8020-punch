import { createRouter, createWebHistory } from 'vue-router'
const routes = [
    {
        path: '/',
        component: () => import('../views/Upload.vue'),
        name: 'Upload'
    },
    {
        path: '/view',
        component: () => import('../views/View.vue'),
        name: 'view'
    },
    {
        path: '/edit',
        component: () => import('../views/Edit.vue'),
        name: 'Edit'
    },
    {
        path: '/edit-name',
        component: () => import('../views/EditUserName.vue'),
        name: 'Edit Name'
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
