<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
    <Navbar />

    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-[#fdf4ff] via-[#fff8f3] to-[#f8fafc]">
      <!-- Background mesh -->
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.12)_0%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"></div>

      <!-- Orb backgrounds -->
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-[rgba(255,213,180,0.45)] -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-70 h-70 bg-[rgba(143,185,244,0.35)] top-15 -right-15 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-50 h-50 bg-[rgba(45,212,191,0.22)] bottom-[10%] left-[55%] animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-3s]"></div>

      <!-- Decorative side grids -->
      <div class="absolute left-0 right-0 top-13 bottom-0 z-10 pointer-events-none overflow-hidden hidden sm:block" aria-hidden="true">
        <!-- Left grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] left-[max(12px,2vw)] [mask-image:linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsLeft" :key="'left-'+i"
                 class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>

        <!-- Right grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] right-[max(12px,2vw)] [mask-image:linear-gradient(270deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsRight" :key="'right-'+i"
                 class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <!-- Left text content -->
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-15">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-4">Chatbot Agent</span>
          <h1 class="font-['Space_Grotesk'] text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1px] leading-[1.15] mb-4 text-slate-900">
            Conversational AI for <br>
            <em class="not-italic bg-gradient-to-r from-orange-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              web, WhatsApp, and in-app chat
            </em>
          </h1>
          <p class="text-[15px] text-slate-500 leading-relaxed mb-6">
            Grounded chatbots that answer from your documents, handle support and sales conversations, and hand off to humans with full context - with token analytics built in.
          </p>
          <div class="flex justify-start gap-3 flex-wrap">
            <button
                @click="goToContact"
                type="button"
                class="relative overflow-hidden cursor-pointer w-50 flex items-center justify-center px-6 py-3.5 bg-orange-700 hover:bg-orange-900 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group"
            >
              Book a Chat Demo
              <div class="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-[fastShineLoop_2.5s_ease-in-out_infinite]"></div>
            </button>
            <button
                @click="scrollToPricing"
                type="button"
                class="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm cursor-pointer"
            >
              View Pricing
            </button>
          </div>
        </div>

        <!-- Right bot image -->
        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto">
          <div class="relative w-[min(280px,72vw)] animate-[botEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-[rgba(45,212,191,0.35)] animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-2 border-dashed border-[rgba(139,92,246,0.2)] animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <div class="relative w-full z-20 aspect-square max-w-sm mx-auto">

              <svg class="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              </svg>
              <img src="../assets/svg/chatbot-bot.svg" alt="Chatbot agent" class="w-80 h-80 object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" title="Chatbot Agent" />
              <img src="../assets/images/chatbot-face.png" alt="Bot face" class="absolute top-[22%] left-1/2 -translate-x-1/2 w-[55%] object-contain z-30" title="Bot Face" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div class="lg:col-span-5 space-y-4">
            <div class="font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none">01</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">Conversation Flow</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-space-grotesk">From message to resolution in chat</h2>
            <p class="text-slate-600 leading-relaxed">
              Route every conversation through intent detection, document retrieval, and smart handoff - so customers get accurate answers without waiting on a queue.
            </p>
          </div>

          <div class="lg:col-span-7">
            <div class="p-4 bg-white rounded-2xl border border-slate-100/50 shadow-2xl shadow-purple-500/20 flex items-center justify-center">
              <img
                  src="../assets/svg/chatbot-flow.svg"
                  alt="Chatbot flow diagram"
                  class="w-full h-auto max-w-2xl"
                  title="Chatbot conversation flow"
              />
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-20 lg:py-28 bg-slate-100 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:direction-rtl">

          <div class="lg:col-span-7 lg:order-1">

            <div class="bg-white  p-6 rounded-2xl shadow-xl border border-slate-200/60 space-y-6 max-w-lg mx-auto">

              <div class="w-full">
                <img src="../assets/images/chatbot-analytics-tokens.png" alt="Token metrics and activity trends" class="w-full h-auto rounded-xl border border-slate-100" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                  <img src="../assets/images/chatbot-token-distribution.png" alt="Token distribution pie chart" class="w-full h-auto" />
                </div>
                <div class="p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                  <img src="../assets/images/chatbot-usage-overview.png" alt="Usage overview bar chart" class="w-full h-auto" />
                </div>
              </div>

            </div>
          </div>
          <div class="lg:col-span-5 space-y-5 lg:order-2">
            <div class="font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none">02</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">Live Analytics</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-space-grotesk">Track tokens, requests, and usage</h2>
            <p class="text-slate-600 leading-relaxed">
              See embeddings, AI responses, and activity trends in one dashboard - from daily token burn to document coverage.
            </p>


            <div class="flex flex-wrap items-center gap-3 pt-2">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wider">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </div>
              <div class="flex flex-wrap gap-2 text-xs text-slate-600">
                <span class="px-3 py-1 bg-white border border-slate-200 rounded-full font-medium shadow-sm"><strong class="text-slate-900 font-bold">185.2K</strong> tokens</span>
                <span class="px-3 py-1 bg-white border border-slate-200 rounded-full font-medium shadow-sm"><strong class="text-slate-900 font-bold">632</strong> requests</span>
                <span class="px-3 py-1 bg-white border border-slate-200 rounded-full font-medium shadow-sm"><strong class="text-slate-900 font-bold">116K</strong> responses</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div class="lg:col-span-6 space-y-4">
            <div class="font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none">03</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">Chat Workflows</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-space-grotesk">
              Built for real conversations. <br/>
              <span class="text-indigo-600 italic">Knowledge-grounded replies.</span>
            </h2>
            <p class="text-slate-600 leading-relaxed max-w-xl">
              Support, sales, and onboarding across web, WhatsApp, and in-app chat - with RAG, live handoff, and usage analytics in one stack.
            </p>
          </div>

          <div class="lg:col-span-6 flex justify-center">
            <div class="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 w-full max-w-md aspect-square flex items-center justify-center overflow-visible">

              <div class="absolute inset-[-12%] rounded-full border-2 border-dashed border-purple-400/60 scale-y-[0.85] -rotate-12 animate-[spin_30s_linear_infinite] pointer-events-none"></div>

              <div class="absolute inset-[-4%] rounded-full border-2 border-dashed border-sky-400/50 scale-x-[0.90] rotate-45 animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>

              <img
                  src="../assets/svg/chatbot-messenger-bot.svg"
                  alt="Chatbot with messages"
                  class="w-80 h-100 mx-auto relative z-10"
                  title="Chatbot agent messaging"
              />
            </div>
          </div>
        </div>

        <!-- Updated 6 Cards - Same style as Orchestri -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <article v-for="(card, i) in chatbotCards" :key="i"
                   :class="[
              'group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden',
              'transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]',
              'animate-[cardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused]',
              `hover:border-${card.color}/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]`,
              `before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-[16px_0_0_16px]`,
              `after:absolute after:inset-0 after:pointer-events-none`
            ]"
                   :style="{
              animationDelay: card.delay,
              '--card-accent': card.hex,
              '--before-bg': card.hex
            }">
            <span :class="`relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase mb-2`" :style="{ color: card.hex }">{{ card.tag }}</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">{{ card.title }}</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">{{ card.desc }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 rounded-[16px_0_0_16px]" :style="{ background: card.hex }"></div>
            <div class="absolute inset-0 pointer-events-none rounded-[14px]" :style="{ background: `linear-gradient(135deg, ${card.hex}14 0%, transparent 55%)` }"></div>
          </article>
        </div>

      </div>
    </section>

    <section class="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div class="lg:col-span-6 flex justify-center">
            <div class="relative p-6 bg-white rounded-2xl shadow-md w-full max-w-lg overflow-visible">

              <img
                  src="../assets/svg/chatbot-capabilities.svg"
                  alt="Chatbot capabilities diagram"
                  class="w-full h-auto block relative z-10"
                  title="Chatbot capabilities and integrations"
              />

              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[90%] rounded-3xl border-2 border-dashed border-purple-500/60 animate-[spin_35s_linear_infinite] z-10 pointer-events-none"></div>

              <img
                  src="../assets/images/chatbot-face.png"
                  alt="Chatbot face indicator"
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] object-contain z-20"
                  title="Chatbot center face view"
              />

            </div>
          </div>

          <div class="lg:col-span-6 space-y-6">
            <div class="font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none">04</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">Capabilities</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-space-grotesk">Everything a chatbot agent needs</h2>
            <p class="text-slate-600 leading-relaxed mb-6">
              Intent routing, human handoff, and CRM integrations - the full toolkit for production chat deployments.
            </p>


            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-200 text-slate-900 font-bold text-sm tracking-wide shadow-sm shadow-indigo-600/20">
                  <i class="fa-solid fa-brain text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 font-space-grotesk">Intent and routing</h4>
                  <p class="text-slate-600 text-sm mt-1">Understand what users want and route to the right flow.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-200 text-slate-900 font-bold text-sm tracking-wide shadow-sm shadow-sky-500/20">
                  <i class="fa-solid fa-headset text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 font-space-grotesk">Human handoff</h4>
                  <p class="text-slate-600 text-sm mt-1">Warm transfer to live agents when chat needs a person.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-200 text-slate-900 font-bold text-sm tracking-wide shadow-sm shadow-emerald-500/20">
                  <i class="fas fa-plug text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 font-space-grotesk">CRM and webhooks</h4>
                  <p class="text-slate-600 text-sm mt-1">Connect tickets, CRM records, and custom backends via API.</p>
                </div>
              </li>
            </ul>


            <div class="ml-20">
            <span class="text-slate-500">Need phone and voice automation? See our
  <a href="#" class="text-orange-700 font-semibold underline">Voice AI Agent</a>.
</span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="relative bg-orange-800 rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden">
        <div class="absolute right-0 top-0 -mt-12 -mr-12 h-72 w-72 rounded-full bg-white/10 blur-2xl"></div>
        <div class="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-white/10 blur-xl"></div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-8 text-center lg:text-left space-y-3">
            <h2 class="text-3xl font-extrabold text-white font-space-grotesk tracking-tight">Ready to deploy a chatbot?</h2>
            <p class="text-orange-50 font-normal max-w-2xl text-base opacity-90">
              Book a demo and see how your support, sales, and onboarding chats can run on autopilot.
            </p>
          </div>
          <div class="lg:col-span-4 flex flex-wrap justify-center lg:justify-end gap-3">
            <button
                @click="goToContact"
                type="button"
                class="px-6 py-3.5 bg-white text-orange-700 font-bold rounded-xl shadow-md hover:bg-orange-50 transition duration-200 cursor-pointer"
            >
              Contact Sales
            </button>
            <button
                @click="scrollToPricing"
                type="button"
                class="px-6 py-3.5 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition duration-200 cursor-pointer"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '../components/navbar.vue';
import Footer from '../components/footer.vue';
import { useRouter } from 'vue-router';

// Initialize router
const router = useRouter();

// Define grid cells data
const gridCellsLeft = [
  { bgClass: 'bg-[rgba(237,233,254,0.35)]' },
  { bgClass: 'bg-[rgba(252,231,243,0.32)]', delay: '-0.9s' },
  { bgClass: 'bg-[rgba(255,237,213,0.28)]', delay: '-1.8s' },
  { bgClass: 'bg-[rgba(243,232,255,0.3)]', delay: '-2.7s' },
  { bgClass: 'bg-[rgba(255,241,242,0.28)]', delay: '-3.6s' },
  { bgClass: 'bg-[rgba(238,242,255,0.32)]', delay: '-4.5s' },
  { bgClass: 'bg-[rgba(250,245,255,0.26)]', delay: '-5.4s' },
  { bgClass: 'bg-[rgba(255,247,237,0.3)]', delay: '-6.3s' },
  { bgClass: 'bg-[rgba(237,233,254,0.35)]' },
  { bgClass: 'bg-[rgba(255,237,213,0.28)]', delay: '-1.8s' },
  { bgClass: 'bg-[rgba(252,231,243,0.32)]', delay: '-0.9s' },
  { bgClass: 'bg-[rgba(243,232,255,0.3)]', delay: '-2.7s' },
  { bgClass: 'bg-[rgba(255,241,242,0.28)]', delay: '-3.6s' },
  { bgClass: 'bg-[rgba(238,242,255,0.32)]', delay: '-4.5s' },
  { bgClass: 'bg-[rgba(255,237,213,0.28)]', delay: '-1.8s' },
];

const gridCellsRight = [
  { bgClass: 'bg-[rgba(237,233,254,0.35)]' },
  { bgClass: 'bg-[rgba(252,231,243,0.32)]', delay: '-0.9s' },
  { bgClass: 'bg-[rgba(255,237,213,0.28)]', delay: '-1.8s' },
  { bgClass: 'bg-[rgba(243,232,255,0.3)]', delay: '-2.7s' },
  { bgClass: 'bg-[rgba(255,241,242,0.28)]', delay: '-3.6s' },
  { bgClass: 'bg-[rgba(238,242,255,0.32)]', delay: '-4.5s' },
  { bgClass: 'bg-[rgba(250,245,255,0.26)]', delay: '-5.4s' },
  { bgClass: 'bg-[rgba(255,247,237,0.3)]', delay: '-6.3s' },
  { bgClass: 'bg-[rgba(237,233,254,0.35)]' },
  { bgClass: 'bg-[rgba(255,237,213,0.28)]', delay: '-1.8s' },
  { bgClass: 'bg-[rgba(252,231,243,0.32)]', delay: '-0.9s' },
  { bgClass: 'bg-[rgba(243,232,255,0.3)]', delay: '-2.7s' },
  { bgClass: 'bg-[rgba(255,241,242,0.28)]', delay: '-3.6s' },
  { bgClass: 'bg-[rgba(238,242,255,0.32)]', delay: '-4.5s' },
  { bgClass: 'bg-[rgba(255,237,213,0.28)]', delay: '-1.8s' },
];

// Chatbot Cards Data - Same style as Orchestri
const chatbotCards = [
  { tag: 'Use case', title: 'Customer support', desc: 'FAQ answers, order status, and ticket creation from chat.', hex: '#8B5CF6', delay: '0s' },
  { tag: 'Use case', title: 'Sales and leads', desc: 'Qualify visitors, capture leads, and route hot prospects.', hex: '#F59E0B', delay: '0.6s' },
  { tag: 'Use case', title: 'Onboarding', desc: 'Guide new users through setup with step-by-step chat flows.', hex: '#EC4899', delay: '1.2s' },
  { tag: 'Control', title: 'Document RAG', desc: 'Upload docs, embed knowledge, and answer from your data.', hex: '#0D9488', delay: '0.3s' },
  { tag: 'Control', title: 'Live handoff', desc: 'Escalate to a human agent with full chat transcript.', hex: '#2563EB', delay: '0.9s' },
  { tag: 'Control', title: 'Token analytics', desc: 'Track embeddings, prompts, and response usage over time.', hex: '#059669', delay: '1.5s' },
];

// Methods
const goToContact = () => {
  router.push('/contact?project=chatbot');
};

const scrollToPricing = () => {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};
</script>

<style>
/* Custom typography styles mimicking your project fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.font-space-grotesk {
  font-family: 'Space Grotesk', sans-serif;
}
@keyframes fastShineLoop {
  0% {
    transform: translateX(-160%) skewX(-15deg);
  }
  /* Swift journey from Left to Right */
  35% {
    transform: translateX(260%) skewX(-15deg);
  }
  /* Quick pause at the right edge */
  45% {
    transform: translateX(260%) skewX(-15deg);
  }
  /* Swift journey back from Right to Left */
  80% {
    transform: translateX(-160%) skewX(-15deg);
  }
  /* Pause at the left edge before restarting the loop */
  100% {
    transform: translateX(-160%) skewX(-15deg);
  }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.animate-spin-slow {
  animation: spin 22s linear infinite;
}

.animate-spin-reverse-slow {
  animation: spin-reverse 30s linear infinite;
}

@keyframes meshShift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
  100% { transform: translate(1.5%, -1%) scale(1.04); opacity: 1; }
}

@keyframes orbDrift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -14px); }
}

@keyframes cellBreathe {
  0%, 100% { opacity: 0.28; transform: scale(1); }
  50% { opacity: 0.62; transform: scale(1.015); }
}

@keyframes botEnter {
  from { opacity: 0; transform: translateY(30px) scale(0.92); }
  to { opacity: 1; transform: none; }
}

@keyframes botRingSpin {
  to { transform: rotate(360deg); }
}

@keyframes botGlow {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes shine-loop {
  0% {
    transform: translateX(-50%) skewX(-15deg);
  }
  100% {
    transform: translateX(50%) skewX(-15deg);
  }
}

.animate-shine-loop {
  animation: shine-loop 2.3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>