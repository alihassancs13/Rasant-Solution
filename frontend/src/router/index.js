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