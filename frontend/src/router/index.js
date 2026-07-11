import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Home/login.vue";
import Contact from "../pages/Home/contactForm.vue";
import Home from "../pages/Home/home.vue";
import EmployeeDashboard from '../pages/admin/Employee/employeeDashboard.vue';
import { useLoginStore } from '../stores/loginStore.js';
import JobDetails from '../pages/Home/jobDetails.vue';
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Rasant Solutions - Home",
      requiresAuth: false
    }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: "Login - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
    meta: {
      title: "Contact - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/ai-agent",
    name: "ai-agent",
    component: () => import("../pages/Home/ai-agent.vue"),
    meta: {
      title: "AI Agent - Rasant Solutions",
      requiresAuth: false
    }
  },

  {
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/Home/sdlc-orchestri.vue"),
    meta: {
      title: "Orchestri - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/Home/careers.vue"),
    meta: {
      title: "Careers- Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/careers/:id",
    name: "JobDetails",
    component: () => import("../pages/Home/jobDetails.vue"),
    meta: {
      title: "Job Details - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    component: () => import("../pages/Home/chatbot.vue"),
    meta: {
      title: "Chatbot - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/sentra",
    name: "sentraAI",
    component: () => import("../pages/Home/sentraAI.vue"),
    meta: {
      title: "SentraAI - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/omnipost",
    name: "omnipost",
    component: () => import("../pages/Home/omnipost.vue"),
    meta: {
      title: "OmniPost - Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/admin/overview",
    name: "AdminOverview",
    component: () => import("../pages/admin/Overview/overview.vue"),
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
    path: '/admin/employees/salaries',
    name: 'Salaries',
    component: () => import('../pages/admin/Employee/employeeSalaries.vue'),
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
    path: '/onboarding/:token?',
    name: 'EmployeeOnboarding',
    component: () => import('@/pages/admin/Employee/employeeRegistrationModel.vue'),
    meta: { requiresAuth: false } // or true depending on your needs
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

router.beforeEach((to) => {
  const loginStore = useLoginStore();

  if (to.meta.requiresAuth && !loginStore.isAuthenticated) {
    return '/login';
  }

  if (loginStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return loginStore.redirectBasedOnRole();
  }

  return true;
});
export default router;