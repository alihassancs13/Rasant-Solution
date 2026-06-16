import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Contact from "../pages/contactForm.vue";
import contact from "../pages/contactForm.vue"
 
 
const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
  },
  {
    path: "/ai-agent",
    name: "ai-agent",
    component: () => import("../pages/ai-agent.vue"),
  },

  {
      path: '/ai-agent',
      name: 'ai-agent',
     
      component: () => import('../pages/ai-agent.vue')
    }
  ,
  {
    path: "/",
    redirect: "/contact",
  },

];
 
const router = createRouter({
  history: createWebHistory(),
  routes,
});
 
export default router;