<template>
  <div class="h-screen w-screen overflow-hidden bg-neutral-100 flex flex-col font-primary select-none antialiased">
    <Navbar />

    <section class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] h-full pt-20 overflow-hidden w-full">

      <aside class="relative hidden lg:flex items-center justify-center p-8 xl:p-12 overflow-hidden bg-gradient-to-b from-secondary-50 via-primary-50 to-neutral-100 border-r border-neutral-300/60 h-full">

        <div class="absolute inset-x-[-5%] inset-y-[-10%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(143,185,244,0.18)_0%,transparent_45%)]" aria-hidden="true"></div>

        <div class="relative z-10 w-full max-w-135 flex flex-col justify-center h-full gap-4 mt-4">

          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-[11px] font-bold tracking-wider uppercase text-secondary-800 w-fit font-display">
            <span class="w-1.5 h-1.5 rounded-full bg-accent-1 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"></span>
            Secure portal
          </div>

          <div class="space-y-1.5">
            <h2 class="font-display text-3xl xl:text-4xl font-bold text-primary-900 leading-tight">
              Sign in to your
              <span class="text-secondary-700">workspace</span>
            </h2>
            <p class="text-[13px] xl:text-[14px] leading-relaxed text-neutral-500 font-normal font-primary">
              One account for Sentra AI, Voice AI Agent, Chatbot dashboards, and client billing — role-based access for your team.
            </p>
          </div>

          <div class="w-full" aria-hidden="true">
            <img
                :src="loginVisual"
                alt="Platform access visualization"
                width="300"
                height="150"
                class="w-full h-auto max-h-[33vh] object-contain rounded-2xl shadow-md bg-secondary-50 border border-neutral-100"
            />
          </div>

          <ul class="flex flex-col gap-2.5 m-0 p-0 list-none">
            <li class="flex items-start gap-3 p-2.5 bg-white/90 border border-neutral-300/50 rounded-xl shadow-sm backdrop-blur-sm">
              <span class="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0" aria-hidden="true">
                <font-awesome-icon icon="fa-solid fa-lock" class="text-neutral-400 text-base" />
              </span>
              <div>
                <strong class="block text-[15px] font-bold text-primary-800 mb-0.5 font-display">Role-based access</strong>
                <span class="text-[13px] text-neutral-500 leading-tight block font-primary">Admin, employee, and client portals</span>
              </div>
            </li>
            <li class="flex items-start gap-3 p-2.5 bg-white/90 border border-neutral-300/50 rounded-xl shadow-sm backdrop-blur-sm">
              <span class="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0" aria-hidden="true">
                <font-awesome-icon icon="fa-solid fa-rocket" class="text-neutral-400 text-base" />
              </span>
              <div>
                <strong class="block text-[15px] font-bold text-primary-800 mb-0.5 font-display">All products, one login</strong>
                <span class="text-[13px] text-neutral-500 leading-tight block font-primary">Sentra, Voice AI, Chatbot &amp; analytics</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      <main class="flex items-center justify-center sm:p-6 bg-white w-full h-full overflow-y-auto lg:overflow-hidden rounded-lg">
        <div class="w-full max-w-120 bg-white border border-neutral-300/80 rounded-2xl sm:p-8 shadow-xl shadow-neutral-100/50">

          <div class="mb-6 text-center lg:text-left">
            <h2 class="font-display text-3xl sm:text-2xl font-bold tracking-tight text-primary-900">Welcome back</h2>
            <p class="text-base sm:text-sm text-neutral-500 font-normal mt-1.5 font-primary">Sign in with your username and password.</p>
          </div>

          <div
              v-if="errorMessage"
              class="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-medium font-primary"
          >
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLoginSubmit" novalidate class="flex flex-col gap-5">

            <div class="flex flex-col gap-2">
              <label for="username" class="block text-base font-semibold text-neutral-700 font-primary">Username</label>
              <div class="relative flex items-center w-full">
                <font-awesome-icon icon="fa-solid fa-user" class="absolute left-4 text-neutral-400 pointer-events-none text-base" />
                <input
                    type="text"
                    id="username"
                    v-model="username"
                    placeholder="admin, employee, or client"
                    required
                    autocomplete="username"
                    class="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl font-primary text-base text-primary-800 bg-neutral-50/50 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between gap-2">
                <label for="password" class="block text-base font-semibold text-neutral-700 font-primary">Password</label>
                <a href="mailto:sales@rasantsolutions.com?subject=Forgot%20Password" class="text-base font-semibold text-secondary-700 no-underline whitespace-nowrap hover:text-accent-3 hover:underline transition-colors duration-150 font-primary">
                  Forgot password?
                </a>
              </div>
              <div class="relative flex items-center w-full">
                <font-awesome-icon icon="fa-solid fa-lock" class="absolute left-4 text-neutral-400 pointer-events-none text-base" />
                <input
                    :type="isPasswordVisible ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    placeholder="Enter your password"
                    required
                    autocomplete="current-password"
                    class="w-full pl-11 pr-11 py-3 border border-neutral-300 rounded-xl font-primary text-base text-primary-800 bg-neutral-50/50 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                />

                <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute right-2 w-8 h-8 border-none bg-transparent rounded-lg cursor-pointer text-neutral-400 flex items-center justify-center transition-all duration-200 hover:text-primary-500 hover:bg-neutral-100"
                    :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                >
                  <font-awesome-icon :icon="isPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" class="text-base" />
                </button>
              </div>
            </div>

            <div class="flex items-center my-0.5">
              <label class="inline-flex items-center gap-3 text-base text-neutral-500 font-normal cursor-pointer select-none font-primary">
                <input
                    type="checkbox"
                    v-model="rememberMe"
                    class="w-4.5 h-4.5 rounded border-neutral-300 text-secondary-700 focus:ring-secondary-600 cursor-pointer accent-secondary-700"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
                type="submit"
                class="relative overflow-hidden cursor-pointer w-full flex items-center justify-center px-6 py-3.5 bg-secondary-700 hover:bg-secondary-800 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group font-primary"
            >
              Sign In
              <div class="absolute inset-0 w-1/3 h-full pointer-events-none animate-shine-loop"></div>
            </button>
          </form>

          <div class="mt-6 space-y-3 text-center">
            <p class="text-base text-neutral-500 font-normal font-primary">
              Need an account?
              <a href="/contact" class="font-bold text-secondary-700 no-underline hover:underline">Contact sales</a>
            </p>

          </div>

        </div>
      </main>
    </section>
  </div>
</template>

<style scoped>
@keyframes shine-loop {
  0% {
    transform: translateX(-150%) skewX(-20deg);
  }
  100% {
    transform: translateX(450%) skewX(-20deg);
  }
}

.animate-shine-loop {
  animation: shine-loop 1.0s ease-in-out infinite alternate;
  width: 30%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0.1) 80%,
      transparent 100%
  );
  filter: blur(0.5px);
}
</style>

<script setup>
import Navbar from '../components/navbar.vue';
import { useLogin } from '../composables/useLogin';
import loginVisual from '../assets/svg/login-visual.svg'

const {
  username,
  password,
  rememberMe,
  isPasswordVisible,
  errorMessage,
  togglePasswordVisibility,
  injectQuickCredentials,
  handleLoginSubmit,
} = useLogin();
</script>