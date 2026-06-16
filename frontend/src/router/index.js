import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import contact from "../pages/contactForm.vue"


const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/contact",
    name: "Contact",
    component: contact,
  },
  {
    path: "/",
    redirect: "/login",
  },
<<<<<<< HEAD
  {
      path: '/ai-agent',
      name: 'ai-agent',
      
      component: () => import('../pages/ai-agent.vue') 
    }
=======
  ,
  {
    path: "/",
    redirect: "/contact",
  },
>>>>>>> 504648a7f5c026d0fd0609f3d1406f2980627077
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;