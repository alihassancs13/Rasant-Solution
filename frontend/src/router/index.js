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
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: {
      title: "Rasant Solutions - Home",
      requiresAuth: false  // Public page
    }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: "Login - Rasant Solutions",
      requiresAuth: false  // Public page
    }
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
    meta: {
      title: "Contact - Rasant Solutions",
      requiresAuth: false  // Public page
    }
  },
  {
    path: "/ai-agent",
    name: "ai-agent",
    component: () => import("../pages/ai-agent.vue"),
    meta: {
      title: "AI Agent - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/sdlc-orchestri.vue"),
    meta: {
      title: "Orchestri - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/careers.vue"),
    meta: {
      title: "Careers- Rasant Solutions",
      requiresAuth: false  // Public page
    }
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    component: () => import("../pages/chatbot.vue"),
    meta: {
      title: "Chatbot - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/sentra",
    name: "sentraAI",
    component: () => import("../pages/sentraAI.vue"),
    meta: {
      title: "SentraAI - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/omnipost",
    name: "omnipost",
    component: () => import("../pages/omnipost.vue"),
    meta: {
      title: "OmniPost - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Add Navigation Guard
router.beforeEach((to, from, next) => {
  // Check if user is authenticated
  const isAuthenticated = !!sessionStorage.getItem('accessToken');

  // Get the page title
  document.title = to.meta.title || 'Rasant Solutions';

  // If trying to access login page but already authenticated
  if (to.path === '/login' && isAuthenticated) {
    // Redirect to home page
    next('/home');
    return;
  }

  // If trying to access protected route but not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page
    next('/login');
    return;
  }

  // Allow navigation
  next();
});

export default router;