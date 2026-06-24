import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Contact from "../pages/contactForm.vue";
import Careers from "../pages/careers.vue";
import Home from "../pages/home.vue";
import Chatbot from "../pages/chatbot.vue";
import sentraAI from "../pages/sentraAI.vue";
import omnipost from "@/pages/omnipost.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Rasant Solutions - Home" }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "Login - Rasant Solutions" }
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
    meta: { title: "Contact - Rasant Solutions" }
  },
  {
    path: "/ai-agent",
    name: "ai-agent",
    component: () => import("../pages/ai-agent.vue"),
    meta: { title: "AI Agent - Rasant Solutions" }
  },
  {
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/sdlc-orchestri.vue"),
    meta: { title: "Orchestri - Rasant Solutions" }
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/careers.vue"),
    meta: { title: "Careers- Rasant Solutions" }
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    component: () => import("../pages/chatbot.vue"),
    meta: { title: "Chatbot - Rasant Solutions" }
  },
  {
    path: "/sentra",
    name: "sentraAI",
    component: () => import("../pages/sentraAI.vue"),
    meta: { title: "SentraAI - Rasant Solutions" }
  },
  {
    path: "/omnipost",
    name: "omnipost",
    component: () => import("../pages/omnipost.vue"),
    meta: { title: "OmniPost - Rasant Solutions" }
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;