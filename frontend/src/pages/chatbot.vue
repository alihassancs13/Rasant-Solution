<template>
  <div class="min-h-screen bg-neutral-100 font-primary text-primary-900 antialiased selection:bg-accent-3 selection:text-white">
    <Navbar />

    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-secondary-50 via-primary-50 to-neutral-100">
      <!-- Background mesh -->
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.12)_0%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"></div>

      <!-- Orb backgrounds -->
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-secondary-100/45 -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-70 h-70 bg-primary-300/35 top-15 -right-15 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-50 h-50 bg-accent-1/22 bottom-[10%] left-[55%] animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-3s]"></div>

      <!-- Decorative side grids -->
      <div class="absolute left-0 right-0 top-13 bottom-0 z-10 pointer-events-none overflow-hidden hidden sm:block" aria-hidden="true">
        <!-- Left grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] left-[max(12px,2vw)] [mask-image:linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsLeft" :key="'left-'+i"
                 class="rounded-lg border border-primary-500/20 relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>

        <!-- Right grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] right-[max(12px,2vw)] [mask-image:linear-gradient(270deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsRight" :key="'right-'+i"
                 class="rounded-lg border border-primary-500/20 relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <!-- Left text content -->
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-15">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-1 bg-accent-1/10 px-3 py-1 rounded-full mb-4 font-display">Chatbot Agent</span>
          <h1 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1px] leading-[1.15] mb-4 text-primary-900">
            Conversational AI for <br>
            <em class="not-italic bg-gradient-to-r from-secondary-600 via-accent-4 to-accent-3 bg-clip-text text-transparent">
              web, WhatsApp, and in-app chat
            </em>
          </h1>
          <p class="text-[15px] text-neutral-600 leading-relaxed mb-6 font-primary">
            Grounded chatbots that answer from your documents, handle support and sales conversations, and hand off to humans with full context - with token analytics built in.
          </p>
          <div class="flex justify-start gap-3 flex-wrap">
            <button
                @click="goToContact"
                type="button"
                class="relative overflow-hidden cursor-pointer w-50 flex items-center justify-center px-6 py-3.5 bg-secondary-700 hover:bg-secondary-800 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group font-primary"
            >
              Book a Chat Demo
              <div class="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-[fastShineLoop_2.5s_ease-in-out_infinite]"></div>
            </button>
            <button
                @click="scrollToPricing"
                type="button"
                class="px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-100 transition-colors text-sm cursor-pointer font-primary"
            >
              View Pricing
            </button>
          </div>
        </div>

        <!-- Right bot image -->
        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto">
          <div class="relative w-[min(280px,72vw)] animate-[botEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-accent-1/35 animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-2 border-dashed border-accent-3/20 animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <div class="relative w-full z-20 aspect-square max-w-sm mx-auto">
              <img src="../assets/svg/chatbot-bot.svg" alt="Chatbot agent" class="w-80 h-80 object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" title="Chatbot Agent" />
              <img src="../assets/images/chatbot-face.png" alt="Bot face" class="mt-11 rounded-full absolute top-[22%] left-1/2 -translate-x-1/2 w-[45%] object-contain z-30" title="Bot Face" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div class="lg:col-span-5 space-y-4">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none">01</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-accent-3 font-display">Conversation Flow</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-primary-900 font-display">From message to resolution in chat</h2>
            <p class="text-neutral-600 leading-relaxed font-primary">
              Route every conversation through intent detection, document retrieval, and smart handoff - so customers get accurate answers without waiting on a queue.
            </p>
          </div>

          <div class="lg:col-span-7">
            <div class="p-4 bg-white rounded-2xl border border-neutral-100/50 shadow-2xl shadow-accent-3/20 flex items-center justify-center relative">
              <img
                  src="../assets/svg/chatbot-flow.svg"
                  alt="Chatbot flow diagram"
                  class="w-full h-auto max-w-2xl"
                  title="Chatbot conversation flow"
              />
              <div class="absolute top-[32%] left-[34.8%] w-[6.5%] max-w-[44px] aspect-square flex items-center justify-center">
                <img
                    src="../assets/images/chatbot-face.png"
                    alt="Chatbot agent face avatar"
                    class="w-6 h-6 mr-12 mb-12 pt-0 object-contain rounded-full bg-gradient-to-b from-accent-1/20 to-accent-1/10 shadow-inner"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-20 lg:py-28 bg-neutral-100 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:direction-rtl">

          <div class="lg:col-span-7 lg:order-1">
            <div class="bg-white p-6 rounded-2xl shadow-xl border border-neutral-300/60 space-y-6 max-w-lg mx-auto">
              <div class="w-full">
                <img src="../assets/images/chatbot-analytics-tokens.png" alt="Token metrics and activity trends" class="w-full h-auto rounded-xl border border-neutral-100" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-2 border border-neutral-100 rounded-xl bg-neutral-50/50">
                  <img src="../assets/images/chatbot-token-distribution.png" alt="Token distribution pie chart" class="w-full h-auto" />
                </div>
                <div class="p-2 border border-neutral-100 rounded-xl bg-neutral-50/50">
                  <img src="../assets/images/chatbot-usage-overview.png" alt="Usage overview bar chart" class="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-5 space-y-5 lg:order-2">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none">02</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-accent-3 font-display">Live Analytics</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-primary-900 font-display">Track tokens, requests, and usage</h2>
            <p class="text-neutral-600 leading-relaxed font-primary">
              See embeddings, AI responses, and activity trends in one dashboard - from daily token burn to document coverage.
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-1/10 border border-accent-1/30 text-accent-2 text-xs font-bold tracking-wider font-display">
                <span class="h-2 w-2 rounded-full bg-accent-1 animate-pulse"></span>
                LIVE
              </div>
              <div class="flex flex-wrap gap-2 text-xs text-neutral-600 font-primary">
                <span class="px-3 py-1 bg-white border border-neutral-300 rounded-full font-medium shadow-sm"><strong class="text-primary-900 font-bold">185.2K</strong> tokens</span>
                <span class="px-3 py-1 bg-white border border-neutral-300 rounded-full font-medium shadow-sm"><strong class="text-primary-900 font-bold">632</strong> requests</span>
                <span class="px-3 py-1 bg-white border border-neutral-300 rounded-full font-medium shadow-sm"><strong class="text-primary-900 font-bold">116K</strong> responses</span>
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
            <div class="font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none">03</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-accent-3 font-display">Chat Workflows</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-primary-900 font-display">
              Built for real conversations. <br/>
              <span class="text-accent-3 italic">Knowledge-grounded replies.</span>
            </h2>
            <p class="text-neutral-600 leading-relaxed max-w-xl font-primary">
              Support, sales, and onboarding across web, WhatsApp, and in-app chat - with RAG, live handoff, and usage analytics in one stack.
            </p>
          </div>

          <div class="lg:col-span-6 flex justify-center">
            <div class="relative p-6 bg-neutral-50 rounded-2xl border border-neutral-100 w-full max-w-md aspect-square flex items-center justify-center overflow-visible">
              <div class="absolute inset-0">
                <div class="orbit-1">
                  <div class="absolute inset-[-10%] rounded-full border-2 border-dashed border-accent-3/60 scale-y-[0.85] -rotate-12 animate-[spin_30s_linear_infinite] pointer-events-none"></div>
                </div>
                <div class="orbit-2">
                  <div class="absolute inset-[-6%] rounded-full border-2 border-dashed border-primary-400/50 scale-x-[0.90] rotate-45 animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>
                </div>
              </div>
              <div class="relative w-80 h-100 mx-auto z-10 flex items-center justify-center">
                <img
                    src="../assets/svg/chatbot-messenger-bot.svg"
                    alt="Chatbot with messages"
                    class="w-full h-full object-contain"
                    title="Chatbot agent messaging"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <article v-for="(card, i) in chatbotCards" :key="i"
                   :class="[
              'group relative bg-white/92 border border-neutral-300/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden',
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
            <span :class="`relative z-10 inline-block text-[9px] font-bold tracking-wider uppercase mb-2 font-display`" :style="{ color: card.hex }">{{ card.tag }}</span>
            <h3 class="relative z-10 font-display text-sm font-bold mb-1.5">{{ card.title }}</h3>
            <p class="relative z-10 text-[12.5px] text-neutral-500 leading-normal font-primary">{{ card.desc }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 rounded-[16px_0_0_16px]" :style="{ background: card.hex }"></div>
            <div class="absolute inset-0 pointer-events-none rounded-[14px]" :style="{ background: `linear-gradient(135deg, ${card.hex}14 0%, transparent 55%)` }"></div>
          </article>
        </div>

      </div>
    </section>

    <section class="py-20 lg:py-28 bg-neutral-100 relative overflow-hidden">
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
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[90%] rounded-3xl border-2 border-dashed border-accent-3/60 animate-[spin_35s_linear_infinite] z-10 pointer-events-none"></div>
              <img
                  src="../assets/images/chatbot-face.png"
                  alt="Chatbot face indicator"
                  class="mt-3 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] object-contain z-20"
                  title="Chatbot center face view"
              />
            </div>
          </div>

          <div class="lg:col-span-6 space-y-6">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none">04</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-accent-3 font-display">Capabilities</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-primary-900 font-display">Everything a chatbot agent needs</h2>
            <p class="text-neutral-600 leading-relaxed mb-6 font-primary">
              Intent routing, human handoff, and CRM integrations - the full toolkit for production chat deployments.
            </p>

            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 text-primary-900 font-bold text-sm tracking-wide shadow-sm shadow-accent-3/20">
                  <i class="fa-solid fa-brain text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-primary-900 font-display">Intent and routing</h4>
                  <p class="text-neutral-600 text-sm mt-1 font-primary">Understand what users want and route to the right flow.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 text-primary-900 font-bold text-sm tracking-wide shadow-sm shadow-primary-500/20">
                  <i class="fa-solid fa-headset text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-primary-900 font-display">Human handoff</h4>
                  <p class="text-neutral-600 text-sm mt-1 font-primary">Warm transfer to live agents when chat needs a person.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 text-primary-900 font-bold text-sm tracking-wide shadow-sm shadow-accent-1/20">
                  <i class="fas fa-plug text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-primary-900 font-display">CRM and webhooks</h4>
                  <p class="text-neutral-600 text-sm mt-1 font-primary">Connect tickets, CRM records, and custom backends via API.</p>
                </div>
              </li>
            </ul>

            <div class="ml-20">
              <span class="text-neutral-500 font-primary">Need phone and voice automation? See our
                <a href="/ai-agent" class="text-secondary-700 font-semibold underline">Voice AI Agent</a>.
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="relative bg-secondary-700 rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden">
        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-8 text-center lg:text-left space-y-3">
            <h2 class="text-3xl font-bold text-white font-display tracking-tight">Ready to deploy a chatbot?</h2>
            <p class="text-secondary-50 font-normal max-w-2xl text-base opacity-90 font-primary">
              Book a demo and see how your support, sales, and onboarding chats can run on autopilot.
            </p>
          </div>
          <div class="lg:col-span-4 flex flex-wrap justify-center lg:justify-end gap-3">
            <button
                @click="goToContact"
                type="button"
                class="px-6 py-3.5 bg-white text-secondary-700 font-bold rounded-xl shadow-md hover:bg-secondary-50 transition duration-200 cursor-pointer font-primary"
            >
              Contact Sales
            </button>
            <button
                @click="scrollToPricing"
                type="button"
                class="px-6 py-3.5 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition duration-200 cursor-pointer font-primary"
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

const router = useRouter();

// Grid cells data
const gridCellsLeft = [
  { bgClass: 'bg-accent-3/20' },
  { bgClass: 'bg-accent-4/20', delay: '-0.9s' },
  { bgClass: 'bg-secondary-100/20', delay: '-1.8s' },
  { bgClass: 'bg-accent-3/20', delay: '-2.7s' },
  { bgClass: 'bg-secondary-100/20', delay: '-3.6s' },
  { bgClass: 'bg-primary-500/20', delay: '-4.5s' },
  { bgClass: 'bg-accent-3/20', delay: '-5.4s' },
  { bgClass: 'bg-secondary-100/20', delay: '-6.3s' },
  { bgClass: 'bg-accent-3/20' },
  { bgClass: 'bg-secondary-100/20', delay: '-1.8s' },
  { bgClass: 'bg-accent-4/20', delay: '-0.9s' },
  { bgClass: 'bg-accent-3/20', delay: '-2.7s' },
  { bgClass: 'bg-secondary-100/20', delay: '-3.6s' },
  { bgClass: 'bg-primary-500/20', delay: '-4.5s' },
  { bgClass: 'bg-secondary-100/20', delay: '-1.8s' },
];

const gridCellsRight = [
  { bgClass: 'bg-accent-3/20' },
  { bgClass: 'bg-accent-4/20', delay: '-0.9s' },
  { bgClass: 'bg-secondary-100/20', delay: '-1.8s' },
  { bgClass: 'bg-accent-3/20', delay: '-2.7s' },
  { bgClass: 'bg-secondary-100/20', delay: '-3.6s' },
  { bgClass: 'bg-primary-500/20', delay: '-4.5s' },
  { bgClass: 'bg-accent-3/20', delay: '-5.4s' },
  { bgClass: 'bg-secondary-100/20', delay: '-6.3s' },
  { bgClass: 'bg-accent-3/20' },
  { bgClass: 'bg-secondary-100/20', delay: '-1.8s' },
  { bgClass: 'bg-accent-4/20', delay: '-0.9s' },
  { bgClass: 'bg-accent-3/20', delay: '-2.7s' },
  { bgClass: 'bg-secondary-100/20', delay: '-3.6s' },
  { bgClass: 'bg-primary-500/20', delay: '-4.5s' },
  { bgClass: 'bg-secondary-100/20', delay: '-1.8s' },
];

// Chatbot Cards Data
const chatbotCards = [
  { tag: 'Use case', title: 'Customer support', desc: 'FAQ answers, order status, and ticket creation from chat.', hex: '#8B5CF6', delay: '0s' },
  { tag: 'Use case', title: 'Sales and leads', desc: 'Qualify visitors, capture leads, and route hot prospects.', hex: '#F59E0B', delay: '0.6s' },
  { tag: 'Use case', title: 'Onboarding', desc: 'Guide new users through setup with step-by-step chat flows.', hex: '#EC4899', delay: '1.2s' },
  { tag: 'Control', title: 'Document RAG', desc: 'Upload docs, embed knowledge, and answer from your data.', hex: '#0D9488', delay: '0.3s' },
  { tag: 'Control', title: 'Live handoff', desc: 'Escalate to a human agent with full chat transcript.', hex: '#2563EB', delay: '0.9s' },
  { tag: 'Control', title: 'Token analytics', desc: 'Track embeddings, prompts, and response usage over time.', hex: '#059669', delay: '1.5s' },
];

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

<style scoped>
/* Custom animations */
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

@keyframes fastShineLoop {
  0% { transform: translateX(-160%) skewX(-15deg); }
  35% { transform: translateX(260%) skewX(-15deg); }
  45% { transform: translateX(260%) skewX(-15deg); }
  80% { transform: translateX(-160%) skewX(-15deg); }
  100% { transform: translateX(-160%) skewX(-15deg); }
}

/* Orbit animations */
@keyframes orbit-1 {
  0% { transform: translate(0, 0); }
  25% { transform: translate(18px, -10px); }
  50% { transform: translate(0, -18px); }
  75% { transform: translate(-18px, -10px); }
  100% { transform: translate(0, 0); }
}

@keyframes orbit-2 {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-14px, 12px); }
  50% { transform: translate(0, 20px); }
  75% { transform: translate(14px, 12px); }
  100% { transform: translate(0, 0); }
}

.orbit-1 { position: absolute; inset: 0; animation: orbit-1 14s ease-in-out infinite; }
.orbit-2 { position: absolute; inset: 0; animation: orbit-2 9s ease-in-out infinite; }
</style>