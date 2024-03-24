import { createRouter , createWebHistory } from "vue-router";
export const router = createRouter({
  history:createWebHistory(),
  routes:[
    {
      name:'reg and login',
      path:'/',
      component:()=>import('./components/login.vue')
    },
    {
      name:'accaunt',
      path:'/accaunt/:name/:id',
      component:()=>import('./components/accaunt.vue'),
    }
  ]
})