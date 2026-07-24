import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Home/login.vue";
import Contact from "../pages/Home/contactForm.vue";
import Home from "../pages/Home/home.vue";
import EmployeeDashboard from '../pages/admin/Employee/employeeDashboard.vue';
import Documents from '../pages/admin/Documents/documents.vue';
import Vault from '../pages/admin/Vault/credentialsVault.vue';
import Credential from '../pages/Employee/employeeCredentials.vue';
import EmployeeEmployeeAttendance from '../pages/admin/Employee/employeeAttendance.vue';
import { useLoginStore } from '../stores/loginStore.js';
import JobDetails from '../pages/Home/jobDetails.vue';
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      module: "Home",
      title: "Home | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      module: "Login",
      title: "Login | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("../pages/Home/forgotPassword.vue"),
    meta: {
      module: "Forgot Password",
      title: "Forgot Password | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/create-password/:token",
    name: "CreatePassword",
    component: () => import("../pages/Home/createPassword.vue"),
    meta: {
      module: "Create Password",
      title: "Create Password | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
    meta: {
      module: "Contact",
      title: "Contact | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/ai-agent",
    name: "ai-agent",
    component: () => import("../pages/Home/ai-agent.vue"),
    meta: {
      module: "AI Agent",
      title: "AI Agent | Rasant Solutions",
      requiresAuth: false
    }
  },

  {
    path: "/orchestri",
    name: "Orchestri",
    component: () => import("../pages/Home/sdlc-orchestri.vue"),
    meta: {
      module: "Orchestri",
      title: "Orchestri | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/careers",
    name: "Careers",
    component: () => import("../pages/Home/careers.vue"),
    meta: {
      module: "Careers",
      title: "Careers | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/careers/:id",
    name: "JobDetails",
    component: () => import("../pages/Home/jobDetails.vue"),
    meta: {
      module: "Job Details",
      title: "Job Details | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    component: () => import("../pages/Home/chatbot.vue"),
    meta: {
      module: "Chatbot",
      title: "Chatbot | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/sentra",
    name: "sentraAI",
    component: () => import("../pages/Home/sentraAI.vue"),
    meta: {
      module: "SentraAI",
      title: "SentraAI | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/omnipost",
    name: "omnipost",
    component: () => import("../pages/Home/omnipost.vue"),
    meta: {
      module: "OmniPost",
      title: "OmniPost | Rasant Solutions",
      requiresAuth: false
    }
  },
  {
    path: "/admin/overview",
    name: "AdminOverview",
    component: () => import("../pages/admin/Overview/overview.vue"),
    meta: { module: "Overview", title: "Overview | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/admin/account',
    name: 'ManageAccount',
    component: () => import('../pages/admin/Account/manageAccount.vue'),
    meta: { module: "Account", title: "Account | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/settings',
    redirect: '/admin/account',
  },
  {
    path: '/admin/career',
    component: () => import('../pages/admin/Employee/employeeCareer.vue'),
    meta: { module: "Career", title: "Career | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/admin/inquiries',
    component: () => import('../pages/admin/Inquiries/Inquiries.vue'),
    meta: { module: "Inquiries", title: "Inquiries | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/admin/employees/salaries',
    name: 'Salaries',
    component: () => import('../pages/admin/Employee/employeeSalaries.vue'),
    meta: { module: "Salaries", title: "Salaries | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/admin/inbox',
    name: 'Inbox',
    component: () => import('../pages/admin/Inbox/inbox.vue'),
    meta: { module: "Inbox", title: "Inbox | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/services/:slug',
    name: 'ServiceDetail',
    component: () => import('../pages/Home/ServiceDetail.vue'),
    meta: {
      module: "Services",
      title: "Services | Rasant Solutions",
      requiresAuth: false,
    },
  },
  {
    path: '/admin/employees/dashboard',
    name: 'EmployeeDashboard',
    component: EmployeeDashboard,
    meta: { module: "Employees", title: "Employees | Rasant Solutions", requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/employees/attendance',
    name: 'EmployeeAttendance',
    component: EmployeeEmployeeAttendance,
    meta: { module: "Attendance", title: "Attendance | Rasant Solutions", requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/employees/leave',
    name: 'AdminLeaveRequests',
    component: () => import('../pages/admin/Employee/employeeLeave.vue'),
    meta: { module: "Leave", title: "Leave | Rasant Solutions", requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/documents',
    name: 'Documents',
    component: Documents,
    meta: { module: "Documents", title: "Documents | Rasant Solutions", requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/credentialsvault',
    name: 'Vault',
    component: Vault,
    meta: { module: "Credentials", title: "Credentials | Rasant Solutions", requiresAuth: true, role: 'admin' }
  },
  {
    path: '/employee/overview',
    name: 'EmployeeOverview',
    component: () => import('../pages/Employee/employeeOverview.vue'),
    meta: { module: "Overview", title: "Overview | Rasant Solutions", requiresAuth: true, role: 'employee' }
  },
  {
    path: '/employee/attendance',
    name: 'MyAttendance',
    component: () => import('../pages/Employee/employeeAttendance.vue'),
    meta: { module: "Attendance", title: "Attendance | Rasant Solutions", requiresAuth: true, role: 'employee' }
  },
  {
    path: '/employee/leave',
    name: 'MyLeave',
    component: () => import('../pages/Employee/employeeLeave.vue'),
    meta: { module: "Leave", title: "Leave | Rasant Solutions", requiresAuth: true, role: 'employee' }
  },
  {
    path: '/employee/credentialsvault',
    name: 'Credential',
    component: Credential,
    meta: { module: "Credentials", title: "Credentials | Rasant Solutions", requiresAuth: true, role: 'employee' }
  },
  {
    path: '/onboarding/:token?',
    name: 'EmployeeOnboarding',
    component: () => import('@/pages/admin/Employee/employeeRegistrationModel.vue'),
    meta: { module: "Onboarding", title: "Onboarding | Rasant Solutions", requiresAuth: false }
  },
  {
    path: '/admin/worklogs',
    name: 'Worklogs',
    component: () => import('@/pages/admin/worklogs/worklog.vue'),
    meta: { module: "Worklogs", title: "Worklogs | Rasant Solutions", requiresAuth: true }
  },
  {
    path: '/admin/worklogs/analytics',
    name: 'WorklogAnalytics',
    component: () => import('@/pages/admin/worklogs/worklogAnalytics.vue'),
    meta: { module: "Worklog Analytics", title: "Worklog Analytics | Rasant Solutions", requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/jira',
    name: 'Jira',
    component: () => import('@/pages/admin/jira/jira.vue'),
    meta: { module: "Jira", title: "Jira | Rasant Solutions", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const loginStore = useLoginStore();
  loginStore.initialize();
  // Check if route requires authentication
  if (to.meta.requiresAuth && !loginStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return;
  }
  if (loginStore.isAuthenticated && to.path === '/login') {
    next(loginStore.redirectBasedOnRole());
    return;
  }
  next();
});
export default router;