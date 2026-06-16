import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
      path: '/ai-agent',
      name: 'ai-agent',
      
      component: () => import('../pages/ai-agent.vue') 
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;