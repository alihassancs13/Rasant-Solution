<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col font-sans select-none antialiased">
    <Navbar />
      
    <section class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] h-[calc(100vh-80px)] mt-20 overflow-hidden w-full">
      
      <aside class="relative hidden lg:flex items-center justify-center p-8 xl:p-16 overflow-hidden bg-gradient-to-b from-[#fdf4ff] via-[#fff8f3] to-slate-50 border-r border-slate-200/60">
        
        <div class="absolute -inset-x-[5%] -inset-y-[10%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(143,185,244,0.18)_0%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate] motion-reduce:animate-none" aria-hidden="true"></div>
        
        <div class="relative z-10 w-full max-w-[580px] flex flex-col justify-center h-full">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600/[0.08] border border-blue-600/[0.15] rounded-full text-[11px] font-bold tracking-wider uppercase text-blue-900 w-fit  mt-5">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-900 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"></span>
            Secure portal
          </div>

          <h2 class="text-4xl font-bold text-[#1e3a5f] leading-tight font-sans">
          Sign in to your
          <span class="text-[#2b6cb0]">workspace</span>
        </h2>
          
          <p class="text-[14px] xl:text-[16px] leading-relaxed text-slate-500 max-w-[520px] mb-5 font-normal">
            One account for Sentra AI, Voice AI Agent, Chatbot dashboards, and client billing — role-based access for your team.
          </p>

          <div class="w-full max-w-[540px] mb-5" aria-hidden="true">
            <img 
              src="@/assets/login-visual.svg" 
              alt="Rasant platform access visualization layout panel mapping" 
              class="w-full h-auto max-h-[32vh] object-contain rounded-2xl shadow-md bg-pink-50 border border-slate-100"
            />
          </div>

          <ul class="flex flex-col gap-3 m-0 p-0 list-none">
            <li class="flex items-start gap-3.5 p-3 bg-white/90 border border-slate-200/50 rounded-xl shadow-sm backdrop-blur-sm">
              <span class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0" aria-hidden="true">🔐</span>
              <div>
                <strong class="block text-[13px] font-bold text-slate-800 mb-0.5">Role-based access</strong>
                <span class="text-[12px] text-slate-500 leading-tight block">Admin, employee, and client portals</span>
              </div>
            </li>
            <li class="flex items-start gap-3.5 p-3 bg-pink/90 border border-slate-200/50 rounded-xl shadow-sm backdrop-blur-sm">
              <span class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0" aria-hidden="true">⚡</span>
              <div>
                <strong class="block text-[13px] font-bold text-slate-800 mb-0.5">All products, one login</strong>
                <span class="text-[12px] text-slate-500 leading-tight block">Sentra, Voice AI, Chatbot &amp; analytics</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      <main class="flex items-center justify-center p-5 md:p-10 bg-white w-full h-full overflow-y-auto lg:overflow-hidden">
        <div class="w-full max-w-[380px] bg-white border border-slate-200/80 rounded-2xl p-6 xl:p-7 shadow-lg shadow-slate-100/50">
          
          <div class="mb-5">
            <h2 class="font-display text-[22px] font-normal tracking-tight text-[#1e3a5f] mt-5">Welcome back</h2>
            <p class="text-[13px] text-slate-500 font-normal leading-normal">Sign in with your username and password.</p>
          </div>

          <div 
            v-if="errorMessage" 
            class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px] font-medium  animate-[shake_0.35s_ease-in-out]"
          >
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLoginSubmit" novalidate class="flex flex-col gap-1">
            
            <div class="flex flex-col">
              <label for="username" class="block text-[12px] font-semibold text-slate-800 ">Username</label>
              <div class="relative flex items-center w-full">
                <i class="fa-regular fa-user absolute left-3.5 text-slate-400 pointer-events-none text-[15px]"></i>
                <input 
                  type="text" 
                  id="username" 
                  v-model="username" 
                  placeholder="admin, employee, or client" 
                  required 
                  autocomplete="username"
                  class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl font-sans text-[14px] text-slate-800 bg-slate-50/50 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div class="flex flex-col">
              <div class="flex items-center justify-between gap-3 mb-1.5">
                <label for="password" class="block text-[12px] font-semibold text-slate-800">Password</label>
                <a href="mailto:sales@rasantsolutions.com?subject=Forgot%20Password" class="text-[12px] font-semibold text-[#3e6394] no-underline whitespace-nowrap hover:text-indigo-700 hover:underline transition-colors duration-150">
                  Forgot password?
                </a>
              </div>
              <div class="relative flex items-center w-full">
                <i class="fa-solid fa-lock absolute left-3.5 text-slate-400 pointer-events-none text-[15px]"></i>
                <input 
                  :type="isPasswordVisible ? 'text' : 'password'" 
                  id="password" 
                  v-model="password" 
                  placeholder="Enter your password" 
                  required 
                  autocomplete="current-password"
                  class="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl font-sans text-[14px] text-slate-800 bg-slate-50/50 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
                
                <button 
                  type="button" 
                  @click="togglePasswordVisibility"
                  class="absolute right-1 w-9 h-9 border-none bg-transparent rounded-lg cursor-pointer text-slate-400 flex items-center justify-center transition-all duration-200 hover:text-blue-600 hover:bg-slate-100"
                  :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                >
                  <i :class="['fa-regular', isPasswordVisible ? 'fa-eye-slash' : 'fa-eye', 'text-[15px]']"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center">
              <label class="inline-flex items-center gap-2 text-[12px] text-slate-500 font-normal cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  v-model="rememberMe" 
                  class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button 
              type="submit" 
              class="relative overflow-hidden w-full flex items-center justify-center px-6 py-2.5 bg-[#2A5F9E] hover:from-blue-700 hover:to-indigo-800 text-[14px] font-semibold text-white rounded-xl transition-all duration-200 shadow-md shadow-indigo-100 group"
            >
              Sign In
              <div class="absolute inset-0 w-1/2 h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_0.75s_ease-in-out]"></div>
            </button>
          </form>

          <div class="flex items-center gap-3 my-4 text-slate-400 text-[11px] font-bold uppercase tracking-wider before:content-[''] before:flex-1 before:h-[1px] before:bg-slate-200/80 after:content-[''] after:flex-1 after:h-[1px] after:bg-slate-200/80" aria-hidden="true">
            <span>Or try a demo</span>
          </div>

          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick-fill credentials</p>
          <div class="flex gap-2">
            <button 
              type="button" 
              @click="injectQuickCredentials('admin', 'Admin@123')"
              class="flex-1 py-2 px-1 border border-slate-200 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Admin
            </button>
            <button 
              type="button" 
              @click="injectQuickCredentials('employee', 'Employee@123')"
              class="flex-1 py-2 px-1 border border-slate-200 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Employee
            </button>
            <button 
              type="button" 
              @click="injectQuickCredentials('client', 'Client@123')"
              class="flex-1 py-2 px-1 border border-slate-200 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer transition-all duration-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Client
            </button>
          </div>
          
          <p class="mt-2.5 text-[10px] text-slate-400 leading-relaxed text-center font-normal">
            Demo passwords: <code class="font-mono text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">Admin@123</code> · <code class="font-mono text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">Employee@123</code> · <code class="font-mono text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">Client@123</code>
          </p>

          <p class="mt-2 text-[12px] text-center text-slate-500 font-normal">
            Need an account? 
            <a href="#" class="font-bold text-[#4f6f9a] no-underline hover:underline">Contact sales</a>
          </p>
          
          <a href="#" class="block text-center mt-2.5 text-[12px] font-medium text-slate-500 no-underline transition-colors duration-200 hover:text-blue-600">
            ← Back to website
          </a>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup>
import Navbar from '../components/navbar.vue';
import { useLogin } from '../composables/useLogin';

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