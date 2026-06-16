<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col font-sans select-none antialiased">
    <Navbar />
    
    <section class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] h-full pt-20 overflow-hidden w-full">
      
      <aside class="relative hidden lg:flex items-center justify-center p-8 xl:p-12 overflow-hidden bg-linear-to-b from-[#fdf4ff] via-[#fff8f3] to-slate-50 border-r border-slate-200/60 h-full">
        
        <div class="absolute inset-x-[-5%] inset-y-[-10%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(143,185,244,0.18)_0%,transparent_45%)]" aria-hidden="true"></div>
        
        <div class="relative z-10 w-full max-w-135 flex flex-col justify-center h-full gap-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600/8 border border-blue-600/15 rounded-full text-[11px] font-bold tracking-wider uppercase text-orange-800 w-fit">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-700 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"></span>
            Secure portal
          </div>

          <div class="space-y-1.5">
            <h2 class="text-3xl xl:text-4xl font-bold text-[#1e3a5f] leading-tight">
              Sign in to your
              <span class="text-orange-700">workspace</span>
            </h2>
            <p class="text-[13px] xl:text-[14px] leading-relaxed text-slate-500 font-normal">
              One account for Sentra AI, Voice AI Agent, Chatbot dashboards, and client billing — role-based access for your team.
            </p>
          </div>

         <div class="w-full max-w-65 mx-auto" aria-hidden="true">
            <img
              :src="loginVisual"
              alt="Platform access visualization"
              width="270" height="102"
            />
          </div>

          <ul class="flex flex-col gap-2.5 m-0 p-0 list-none">
            <li class="flex items-start gap-3 p-2.5 bg-white/90 border border-slate-200/50 rounded-xl shadow-sm backdrop-blur-sm">
              <span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0" aria-hidden="true">
                <i class="fa-solid fa-shield-halved text-xs"></i>
              </span>
              <div>
                <strong class="block text-[12px] font-bold text-slate-800 mb-0.5">Role-based access</strong>
                <span class="text-[11px] text-slate-500 leading-tight block">Admin, employee, and client portals</span>
              </div>
            </li>
            <li class="flex items-start gap-3 p-2.5 bg-fuchsia-50/80 border border-slate-200/50 rounded-xl shadow-sm backdrop-blur-sm">
              <span class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-500 shrink-0" aria-hidden="true">
                <i class="fa-solid fa-bolt text-xs"></i>
              </span>
              <div>
                <strong class="block text-[12px] font-bold text-slate-800 mb-0.5">All products, one login</strong>
                <span class="text-[11px] text-slate-500 leading-tight block">Sentra, Voice AI, Chatbot &amp; analytics</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      <main class="flex items-center justify-center p-4 sm:p-6 bg-white w-full h-full overflow-y-auto lg:overflow-hidden">
        <div class="w-full max-w-95 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-100/50">
          
          <div class="mb-4 text-center lg:text-left">
            <h2 class="font-display text-xl font-bold tracking-tight text-[#1e3a5f]">Welcome back</h2>
            <p class="text-[12px] text-slate-500 font-normal mt-0.5">Sign in with your username and password.</p>
          </div>

          <div 
            v-if="errorMessage" 
            class="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] font-medium"
          >
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLoginSubmit" novalidate class="flex flex-col gap-3">
            
            <div class="flex flex-col gap-1">
              <label for="username" class="block text-[11px] font-semibold text-slate-700">Username</label>
              <div class="relative flex items-center w-full">
                <i class="fa-regular fa-user absolute left-3.5 text-slate-400 pointer-events-none text-[13px]"></i>
                <input 
                  type="text" 
                  id="username" 
                  v-model="username" 
                  placeholder="admin, employee, or client" 
                  required 
                  autocomplete="username"
                  class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl font-sans text-[13px] text-slate-800 bg-slate-50/50 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between gap-2">
                <label for="password" class="block text-[11px] font-semibold text-slate-700">Password</label>
                <a href="mailto:sales@rasantsolutions.com?subject=Forgot%20Password" class="text-[11px] font-semibold text-orange-700 no-underline whitespace-nowrap hover:text-indigo-700 hover:underline transition-colors duration-150">
                  Forgot password?
                </a>
              </div>
              <div class="relative flex items-center w-full">
                <i class="fa-solid fa-lock absolute left-3.5 text-slate-400 pointer-events-none text-[13px]"></i>
                <input 
                  :type="isPasswordVisible ? 'text' : 'password'" 
                  id="password" 
                  v-model="password" 
                  placeholder="Enter your password" 
                  required 
                  autocomplete="current-password"
                  class="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl font-sans text-[13px] text-slate-800 bg-slate-50/50 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
                
                <button 
                  type="button" 
                  @click="togglePasswordVisibility"
                  class="absolute right-1.5 w-7 h-7 border-none bg-transparent rounded-lg cursor-pointer text-slate-400 flex items-center justify-center transition-all duration-200 hover:text-blue-600 hover:bg-slate-100"
                  :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                >
                  <i :class="['fa-regular', isPasswordVisible ? 'fa-eye-slash' : 'fa-eye', 'text-[13px]']"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center my-0.5">
              <label class="inline-flex items-center gap-2 text-[11px] text-slate-500 font-normal cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  v-model="rememberMe" 
                  class="w-3.5 h-3.5 rounded border-slate-300 text-orange-700 focus:ring-orange-600 cursor-pointer accent-orange-700"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button 
            type="submit" 
            class="relative overflow-hidden w-full flex items-center justify-center px-6 py-2.5 bg-orange-700 hover:bg-orange-900 text-[13px] font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group"
          >
            Sign In
            <div class="absolute inset-0 w-1/4 h-full bg-white/10 pointer-events-none animate-shine-loop"></div>
          </button>
          </form>

          <div class="flex items-center gap-3 my-3.5 text-slate-400 text-[9px] font-bold uppercase tracking-wider before:content-[''] before:flex-1 before:h-px before:bg-slate-200/80 after:content-[''] after:flex-1 after:h-px after:bg-slate-200/80" aria-hidden="true">
            <span>Or try a demo</span>
          </div>

          <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quick-fill credentials</p>
          <div class="flex gap-1.5">
            <button 
              type="button" 
              @click="injectQuickCredentials('admin', 'Admin@123')"
              class="flex-1 py-1.5 px-1 border border-slate-200 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-700 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Admin
            </button>
            <button 
              type="button" 
              @click="injectQuickCredentials('employee', 'Employee@123')"
              class="flex-1 py-1.5 px-1 border border-slate-200 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-700 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Employee
            </button>
            <button 
              type="button" 
              @click="injectQuickCredentials('client', 'Client@123')"
              class="flex-1 py-1.5 px-1 border border-slate-200 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-700 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Client
            </button>
          </div>
          
          <p class="mt-2 text-[9px] text-slate-400 leading-relaxed text-center font-normal">
            Demo passwords: <code class="font-mono text-[8px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">Admin@123</code> · <code class="font-mono text-[8px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">Employee@123</code>
          </p>

          <div class="mt-4 space-y-1.5 text-center text-[11px]">
            <p class="text-slate-500 font-normal">
              Need an account? 
              <a href="" class="font-bold text-orange-700 no-underline hover:underline">Contact sales</a>
            </p>
            <a href="#" class="inline-block font-medium text-slate-500 no-underline transition-colors duration-200 hover:text-blue-600">
              <i class="fa-solid fa-arrow-left mr-1 text-[10px]"></i> Back to website
            </a>
          </div>
          
        </div>
      </main>
    </section>
  </div>
</template>

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