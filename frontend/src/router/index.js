import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Contact from "../pages/contactForm.vue";
import Careers from "../pages/careers.vue";
import Home from "../pages/home.vue";
import Chatbot from "../pages/chatbot.vue";
import sentraAI from "../pages/sentraAI.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
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
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/sdlc-orchestri.vue"),
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/careers.vue"),
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    component: () => import("../pages/chatbot.vue"), 
  },
  {
    path: "/sentra",
    name: "sentraAI",
    component: () => import("../pages/sentraAI.vue"),
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;