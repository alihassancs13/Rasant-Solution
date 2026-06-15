<script setup>
// Imports only your exact navbar file dependency
import Navbar from "../components/navbar.vue";
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans antialiased selection:bg-blue-500 selection:text-white">
    
    <Navbar />

    <main style="display: flex; min-height: calc(100vh - 80px);" class="pt-20 flex-col lg:flex-row w-full">
      
      <div class="flex-1 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-purple-50/40 p-8 lg:p-16 flex flex-col justify-center items-center lg:items-start">
        
        <div class="max-w-xl">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 shadow-sm rounded-full mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[11px] font-bold tracking-wider text-slate-500 uppercase">SECURE PORTAL</span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Sign in to your <span class="text-[#2250c5]">workspace</span>
          </h1>
          
          <p class="text-[15px] font-medium text-slate-500 leading-relaxed mb-8">
            One account for Sentra AI, Voice AI Agent, Chatbot dashboards, and client billing — role-based access for your team.
          </p>

          <div class="bg-white/80 backdrop-blur border border-slate-100 p-6 rounded-2xl shadow-xl shadow-slate-100/50 mb-8 flex justify-center">
            <div class="relative w-full max-w-sm aspect-[4/3] bg-slate-50 rounded-xl border border-slate-100/80 flex items-center justify-center p-4">
              <div class="z-10 bg-[#1e293b] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">RS</div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-3/4 h-3/4 border border-dashed border-slate-200 rounded-full animate-[spin_60s_linear_infinite]"></div>
              </div>
            </div>
          </div>

          <div class="space-y-3.5">
            <div class="flex items-center gap-3.5 p-3.5 bg-white/60 border border-slate-100 rounded-xl">
              <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm shadow-sm">🔒</div>
              <div>
                <h4 class="text-sm font-bold text-slate-800">Role-based access</h4>
                <p class="text-xs text-slate-400 mt-0.5">Admin, employee, and client portals</p>
              </div>
            </div>
            <div class="flex items-center gap-3.5 p-3.5 bg-white/60 border border-slate-100 rounded-xl">
              <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-sm shadow-sm">⚡</div>
              <div>
                <h4 class="text-sm font-bold text-slate-800">All products, one login</h4>
                <p class="text-xs text-slate-400 mt-0.5">Sentra AI, Voice AI, Chatbot &amp; analytics</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="w-full lg:w-[540px] bg-white p-8 lg:p-16 flex flex-col justify-center border-l border-slate-100">
        
        <div class="w-full max-w-sm mx-auto">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p class="text-sm text-slate-400 mt-1">Sign in with your username and password.</p>
          </div>

          <form @submit.prevent class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
                <input type="text" value="client" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div class="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Forgot password?</div>
              </div>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                <input type="password" value="••••••••••••" class="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm cursor-pointer hover:text-slate-600">👁️</span>
              </div>
            </div>

            <div class="flex items-center">
              <input id="remember" type="checkbox" checked class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <label for="remember" class="ml-2.5 text-xs font-semibold text-slate-500 cursor-pointer select-none">Remember me on this device</label>
            </div>

            <button type="submit" class="w-full py-3 bg-[#2250c5] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/10 transition-all text-sm tracking-wide mt-2">
              Sign In
            </button>
          </form>

          <div class="relative my-8 text-center">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-100"></div></div>
            <span class="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or try a demo</span>
          </div>

          <div>
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">Quick-fill Credentials</div>
            <div style="display: flex; gap: 8px;" class="w-full mb-4">
              <button class="flex-1 py-2 px-3 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors">Admin</button>
              <button class="flex-1 py-2 px-3 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors">Employee</button>
              <button class="flex-1 py-2 px-3 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors">Client</button>
            </div>
            <div class="text-[11px] text-slate-400 text-center leading-relaxed">
              Demo passwords: <code class="bg-slate-50 px-1 py-0.5 rounded text-slate-600 font-mono text-[10px]">Admin@123</code> · <code class="bg-slate-50 px-1 py-0.5 rounded text-slate-600 font-mono text-[10px]">Employee@123</code> · <code class="bg-slate-50 px-1 py-0.5 rounded text-slate-600 font-mono text-[10px]">Client@123</code>
            </div>
          </div>

          <div class="mt-10 text-center space-y-3">
            <p class="text-xs font-semibold text-slate-500">Need an account? <span class="text-blue-600 hover:underline cursor-pointer font-bold">Contact sales</span></p>
            <div class="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors pt-2 border-t border-slate-100 w-full justify-center">
              ← Back to website
            </div>
          </div>

        </div>

      </div>

    </main>
  </div>
</template>