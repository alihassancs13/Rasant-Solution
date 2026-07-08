import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Home/login.vue";
import Contact from "../pages/Home/contactForm.vue";
import Home from "../pages/Home/home.vue";
import EmployeeDashboard from '../pages/admin/Employee/employeeDashboard.vue';
import { useLoginStore } from '../stores/loginStore.js';

const routes = [
  {
    path: "/",
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
    component: () => import("../pages/Home/ai-agent.vue"),
    meta: {
      title: "AI Agent - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },

  {
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/Home/sdlc-orchestri.vue"),
    meta: {
      title: "Orchestri - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/Home/careers.vue"),
    meta: {
      title: "Careers- Rasant Solutions",
      requiresAuth: false  // Public page
    }
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    component: () => import("../pages/Home/chatbot.vue"),
    meta: {
      title: "Chatbot - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/sentra",
    name: "sentraAI",
    component: () => import("../pages/Home/sentraAI.vue"),
    meta: {
      title: "SentraAI - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/omnipost",
    name: "omnipost",
    component: () => import("../pages/Home/omnipost.vue"),
    meta: {
      title: "OmniPost - Rasant Solutions",
      requiresAuth: false  // Public page (or true if you want to protect it)
    }
  },
  {
    path: "/admin/overview",
    name: "AdminOverview",
    component: () => import("../pages/admin/Overview/overview.vue"), // Points straight to your sidebar + welcome layout file
    meta: { title: "Admin Overview - Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/admin/career',
    component: () => import('../pages/admin/Employee/employeeCareer.vue') },
  {
    path: '/admin/inquiries',
    component: () => import('../pages/admin/Inquiries/Inquiries.vue'),
    meta: { title: "Admin Inquiries - Rasant Solutions", requiresAuth: true }
  },

  {
    path: '/services/:slug',
    name: 'ServiceDetail',
    component: () => import('../pages/Home/ServiceDetail.vue'),
    meta: {
      title: 'Services - Rasant Solutions',
      requiresAuth: false,
    },
  },
  {
    path: '/admin/employees/dashboard',
    name: 'EmployeeDashboard',
    component: EmployeeDashboard,
    meta: { requiresAuth: true, role: 'employee' }
  },

  {
  path: '/admin/jira',
  name: 'Jira',
  component: () => import('@/pages/admin/jira/jira.vue'),
  meta: { requiresAuth: true, role: 'employee' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Add Navigation Guard
router.beforeEach((to) => {
  const loginStore = useLoginStore();   //  Correct

  if (to.meta.requiresAuth && !loginStore.isAuthenticated) {
    return '/login';
  }

  if (loginStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return loginStore.redirectBasedOnRole();
  }

  return true;
});
export default router;