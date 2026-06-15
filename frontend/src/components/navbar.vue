<script setup>
import { ref } from 'vue';
import logo from "../assets/rasant-logo.svg";

const isServicesOpen = ref(false);
const isProjectsOpen = ref(false);
</script>

<template>
  <header style="display: flex; align-items: center; justify-content: space-between; height: 80px;" class="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 px-6 md:px-12 z-50 font-sans shadow-sm">
    
    <div class="flex items-center shrink-0 cursor-pointer">
      <img :src="logo" alt="Rasant Solutions" class="h-10 w-auto object-contain" width="212" height="42" />
    </div>

    <nav class="hidden md:block h-full">
      <ul style="display: flex; flex-direction: row; align-items: center; gap: 32px;" class="h-full m-0 p-0 list-none">
        
        <li class="relative h-full flex items-center">
          <div @click="isServicesOpen = !isServicesOpen; isProjectsOpen = false" class="flex items-center gap-1.5 px-1 h-full text-[15px] font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer select-none">
            Services
            <span class="text-[9px] text-slate-400 block">▼</span>
          </div>
          
          <div v-if="isServicesOpen" class="absolute left-1/2 -translate-x-1/2 top-20 w-[380px] bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50">
            <div class="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm shrink-0">⚙️</div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 m-0">Custom Software</h4>
                <p class="text-[11px] text-slate-400 mt-0.5">Enterprise apps &amp; APIs</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm shrink-0">📱</div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 m-0">Web &amp; Mobile</h4>
                <p class="text-[11px] text-slate-400 mt-0.5">React, Flutter &amp; Next.js</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
              <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-sm shrink-0">☁️</div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 m-0">Cloud &amp; DevOps</h4>
                <p class="text-[11px] text-slate-400 mt-0.5">AWS &amp; Kubernetes</p>
              </div>
            </div>
          </div>
        </li>

        <li class="relative h-full flex items-center">
          <div @click="isProjectsOpen = !isProjectsOpen; isServicesOpen = false" class="flex items-center gap-1.5 px-1 h-full text-[15px] font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer select-none">
            Projects
            <span class="text-[9px] text-slate-400 block">▼</span>
          </div>
          
          <div v-if="isProjectsOpen" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;" class="absolute left-1/2 -translate-x-1/2 top-20 w-[460px] bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50">
            <div class="block p-2.5 border border-slate-50 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span class="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mb-1">Call Center</span>
              <h4 class="text-xs font-bold text-slate-900 m-0">Sentra AI</h4>
            </div>
            <div class="block p-2.5 border border-slate-50 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span class="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mb-1">Voice</span>
              <h4 class="text-xs font-bold text-slate-900 m-0">AI Agent</h4>
            </div>
            <div class="block p-2.5 border border-slate-50 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span class="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mb-1">Chat</span>
              <h4 class="text-xs font-bold text-slate-900 m-0">Chatbot</h4>
            </div>
            <div class="block p-2.5 border border-slate-50 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span class="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mb-1">SDLC</span>
              <h4 class="text-xs font-bold text-slate-900 m-0">Orchestri</h4>
            </div>
          </div>
        </li>

        <li class="h-full flex items-center">
          <div class="px-1 h-full flex items-center text-[15px] font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
            Contact
          </div>
        </li>
      </ul>
    </nav>

    <div style="display: flex; flex-direction: row; align-items: center; gap: 12px;" class="hidden md:flex">
      <div class="px-6 py-2 text-[14px] font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full cursor-pointer transition-colors">
        Login
      </div>
      <div class="px-6 py-2.5 text-[14px] font-bold bg-[#2250c5] text-white rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 cursor-pointer">
        Get Quote
      </div>
    </div>

  </header>
</template>