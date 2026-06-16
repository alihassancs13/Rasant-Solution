import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Contact from "../pages/contactForm.vue";
import Careers from "../pages/careers.vue";
import Orchestri from "../pages/sdlc-orchestri.vue";
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
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/sdlc-orchestri.vue"), // Make sure your file name matches exactly
  },
  {
    path: "/",
    redirect: "/contact",
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/careers.vue"), // Added your new Careers page here
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;