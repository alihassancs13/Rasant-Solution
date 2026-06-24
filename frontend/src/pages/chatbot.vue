<template>
  <div class="min-h-screen bg-neutral-100 font-primary text-headingMain antialiased selection:bg-primary-500/20 selection:text-white">
    <Navbar />

    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-secondary-50 via-primary-50 to-neutral-100">
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.12)_0%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-secondary-100/45 -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-70 h-70 bg-primary-300/35 top-15 -right-15 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-50 h-50 bg-accent-1/22 bottom-[10%] left-[55%] animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-3s]"></div>

      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <!-- Left text -->
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-15 order-1">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-1 bg-accent-1/10 px-3 py-1 rounded-full mb-4 font-display">Chatbot Agent</span>
          <h1 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1px] leading-[1.15] mb-4 text-headingMain">
            Conversational AI for <br>
            <em class="not-italic text-gradient-primary">web, WhatsApp, and in-app chat</em>
          </h1>
          <p class="text-[15px] text-textBody leading-relaxed mb-6 font-primary">
            Grounded chatbots that answer from your documents, handle support and sales conversations, and hand off to humans with full context - with token analytics built in.
          </p>
          <div class="flex justify-start gap-3 flex-wrap">
            <ShineButton to="/contact">Book a Chat Demo</ShineButton>
            <button @click="scrollToPricing" type="button" class="px-6 py-3 border border-borderDefault text-textBody font-semibold rounded-lg hover:bg-neutral-100 transition-colors text-sm cursor-pointer font-primary">
              View Pricing
            </button>
          </div>
        </div>

        <!-- Right bot image -->
        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto order-2">
          <div class="relative w-[min(380px,80vw)] aspect-square flex items-center justify-center animate-[botEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[15%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute inset-[5%] rounded-full border-2 border-dashed border-accent-1/35 animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute inset-0 rounded-full border-2 border-dashed border-accent-3/20 animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <img src="../assets/svg/chatbot-messenger-bot.svg" alt="Chatbot Agent" class="relative z-10 w-[75%] h-[75%] object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" />
          </div>
        </div>
      </div>
    </section>

    <!-- Section 01 — Conversation Flow -->
    <section class="py-20 lg:py-28 bg-section-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <!-- Text — always first -->
          <div class="lg:col-span-5 space-y-4 order-1">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">01</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-textBrand font-display">Conversation Flow</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-headingSection font-display">From message to resolution in chat</h2>
            <p class="text-textBody leading-relaxed font-primary">
              Route every conversation through intent detection, document retrieval, and smart handoff - so customers get accurate answers without waiting on a queue.
            </p>
          </div>

          <!-- Image — always second -->
          <div class="lg:col-span-7 order-2">
            <div class="p-4 bg-section-white rounded-2xl border border-borderDefault shadow-[var(--shadow-primary-dark)] flex items-center justify-center relative">
              <img src="../assets/svg/chatbot-flow.svg" alt="Chatbot flow diagram" class="w-full h-auto max-w-2xl" title="Chatbot conversation flow" />
              <div class="absolute top-[32%] left-[34.8%] w-[6.5%] max-w-[44px] aspect-square flex items-center justify-center">
                <img src="../assets/images/chatbot-face.png" alt="Chatbot agent face avatar" class="w-6 h-6 mr-12 mb-12 pt-0 object-contain rounded-full bg-gradient-to-b from-accent-1/30 to-accent-2/20 shadow-inner" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Section 02 — Live Analytics -->
    <section class="py-20 lg:py-28 bg-neutral-200 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <!-- Text — mobile pe pehle, lg pe right -->
          <div class="lg:col-span-5 space-y-5 order-1 lg:order-2">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">02</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-textBrand font-display">Live Analytics</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-headingSection font-display">Track tokens, requests, and usage</h2>
            <p class="text-textBody leading-relaxed font-primary">
              See embeddings, AI responses, and activity trends in one dashboard - from daily token burn to document coverage.
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-1/10 border border-accent-1/30 text-accent-2 text-xs font-bold tracking-wider font-display">
                <span class="h-2 w-2 rounded-full bg-accent-1 animate-pulse"></span>
                LIVE
              </div>
              <div class="flex flex-wrap gap-2 text-xs text-textSupporting font-primary">
                <span class="px-3 py-1 bg-section-white border border-borderDefault rounded-full font-medium shadow-sm"><strong class="text-headingMain font-bold">185.2K</strong> tokens</span>
                <span class="px-3 py-1 bg-section-white border border-borderDefault rounded-full font-medium shadow-sm"><strong class="text-headingMain font-bold">632</strong> requests</span>
                <span class="px-3 py-1 bg-section-white border border-borderDefault rounded-full font-medium shadow-sm"><strong class="text-headingMain font-bold">116K</strong> responses</span>
              </div>
            </div>
          </div>

          <!-- Image — mobile pe baad mein, lg pe left -->
          <div class="lg:col-span-7 order-2 lg:order-1">
            <div class="bg-section-white p-6 rounded-2xl shadow-xl border border-borderDefault space-y-6 max-w-lg mx-auto">
              <div class="w-full">
                <img src="../assets/images/chatbot-analytics-tokens.png" alt="Token metrics and activity trends" class="w-full h-auto rounded-xl border border-borderDefault" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-2 border border-borderDefault rounded-xl bg-neutral-50/50">
                  <img src="../assets/images/chatbot-token-distribution.png" alt="Token distribution pie chart" class="w-full h-auto" />
                </div>
                <div class="p-2 border border-borderDefault rounded-xl bg-neutral-50/50">
                  <img src="../assets/images/chatbot-usage-overview.png" alt="Usage overview bar chart" class="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Section 03 — Chat Workflows -->
    <section class="py-20 lg:py-28 bg-section-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">

          <!-- Text — always first -->
          <div class="lg:col-span-6 space-y-4 order-1">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">03</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-textBrand font-display">Chat Workflows</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-headingSection font-display">
              Built for real conversations. <br/>
              <span class="text-headingSection">Knowledge-grounded replies.</span>
            </h2>
            <p class="text-textBody leading-relaxed max-w-xl font-primary">
              Support, sales, and onboarding across web, WhatsApp, and in-app chat - with RAG, live handoff, and usage analytics in one stack.
            </p>
          </div>

          <!-- Image — always second -->
          <div class="lg:col-span-6 flex justify-center order-2">
            <div class="relative p-6 bg-neutral-50 rounded-2xl border border-borderDefault w-full max-w-md aspect-square flex items-center justify-center overflow-visible">
              <div class="absolute inset-0">
                <div class="orbit-1">
                  <div class="absolute inset-[-10%] rounded-full border-4 border-dashed border-accent-3/60 scale-y-[0.85] -rotate-12 animate-[spin_30s_linear_infinite] pointer-events-none"></div>
                </div>
                <div class="orbit-2">
                  <div class="absolute inset-[-6%] rounded-full border-4 border-dashed border-accent-7/50 scale-x-[0.90] rotate-45 animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>
                </div>
              </div>
              <div class="relative w-80 h-100 mx-auto z-10 flex items-center justify-center">
                <img src="../assets/svg/chatbot-messenger-bot.svg" alt="Chatbot with messages" class="w-full h-full object-contain drop-shadow-[var(--shadow-primary-dark)]" title="Chatbot agent messaging" />
              </div>
            </div>
          </div>
        </div>

        <!-- 6 Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <article v-for="(card, i) in chatbotCards" :key="i"
                   :class="[
              'group relative bg-cardSemi border border-borderDefault rounded-[14px] p-4 pl-4.5 shadow-[var(--shadow-card-small)] overflow-hidden',
              'transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]',
              'animate-[cardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused]',
            ]"
                   :style="{ animationDelay: card.delay }">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase mb-2 font-display" :style="{ color: card.hex }">{{ card.tag }}</span>
            <h3 class="relative z-10 font-display text-sm font-bold mb-1.5 text-headingCard">{{ card.title }}</h3>
            <p class="relative z-10 text-[12.5px] text-textSupporting leading-normal font-primary">{{ card.desc }}</p>
            <div class="absolute left-0 top-0 bottom-0 w-1 rounded-[16px_0_0_16px]" :style="{ background: card.hex }"></div>
            <div class="absolute inset-0 pointer-events-none rounded-[14px]" :style="{ background: `linear-gradient(135deg, ${card.hex}14 0%, transparent 55%)` }"></div>
          </article>
        </div>

      </div>
    </section>

    <!-- Section 04 — Capabilities -->
    <section class="py-20 lg:py-28 bg-neutral-200 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <!-- Text — mobile pe pehle, lg pe right -->
          <div class="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div class="font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">04</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-textBrand font-display">Capabilities</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-headingSection font-display">Everything a chatbot agent needs</h2>
            <p class="text-textBody leading-relaxed mb-6 font-primary">
              Intent routing, human handoff, and CRM integrations - the full toolkit for production chat deployments.
            </p>
            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 text-headingMain font-bold text-sm tracking-wide shadow-sm shadow-primary-500/20">
                  <i class="fa-solid fa-brain text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-headingCard font-display">Intent and routing</h4>
                  <p class="text-textSupporting text-sm mt-1 font-primary">Understand what users want and route to the right flow.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 text-headingMain font-bold text-sm tracking-wide shadow-sm shadow-accent-7/20">
                  <i class="fa-solid fa-headset text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-headingCard font-display">Human handoff</h4>
                  <p class="text-textSupporting text-sm mt-1 font-primary">Warm transfer to live agents when chat needs a person.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 text-headingMain font-bold text-sm tracking-wide shadow-sm shadow-accent-1/20">
                  <i class="fas fa-plug text-xl"></i>
                </span>
                <div>
                  <h4 class="text-lg font-bold text-headingCard font-display">CRM and webhooks</h4>
                  <p class="text-textSupporting text-sm mt-1 font-primary">Connect tickets, CRM records, and custom backends via API.</p>
                </div>
              </li>
            </ul>
            <div class="ml-20">
              <span class="text-textSupporting font-primary">Need phone and voice automation? See our
                <router-link to="/ai-agent" class="text-secondary-600 font-semibold underline">Voice AI Agent</router-link>.
              </span>
            </div>
          </div>

          <!-- Image — mobile pe baad mein, lg pe left -->
          <div class="lg:col-span-6 flex justify-center order-2 lg:order-1">
            <div class="relative p-6 bg-section-white rounded-2xl shadow-md w-full max-w-lg overflow-visible">
              <img src="../assets/svg/chatbot-capabilities.svg" alt="Chatbot capabilities diagram" class="w-full h-auto block relative z-10" title="Chatbot capabilities and integrations" />
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[90%] rounded-3xl border-4 border-dashed border-accent-3/60 animate-[spin_35s_linear_infinite] z-10 pointer-events-none"></div>
              <img src="../assets/images/chatbot-face.png" alt="Chatbot face indicator" class="mt-3 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] object-contain z-20" title="Chatbot center face view" />
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 lg:py-28 bg-section-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-1 bg-accent-1/10 px-3 py-1 rounded-full mb-4 font-display">Pricing</span>
        <h2 class="font-display text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-1px] leading-[1.15] text-headingSection mb-4">
          Chatbot plans that scale <br>with your conversations
        </h2>
        <p class="text-textBody leading-relaxed max-w-2xl mx-auto font-primary">
          From support chatbots to enterprise RAG deployments — every plan includes document grounding, analytics, and human handoff.
        </p>

        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div v-for="(plan, index) in pricingPlans" :key="index"
               class="bg-section-white rounded-2xl border shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 relative text-left"
               :class="plan.featured ? 'border-2 border-secondary-600 md:scale-105' : 'border-borderDefault'">
            <div v-if="plan.featured" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span class="inline-block bg-secondary-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full font-display">Most Popular</span>
            </div>
            <div class="mb-6" :class="plan.featured ? 'mt-2' : ''">
              <span class="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 font-display" :class="plan.badgeClass">{{ plan.name }}</span>
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-bold text-headingMain font-display">{{ plan.price }}</span>
                <span v-if="plan.period" class="text-sm text-textSupporting font-primary">{{ plan.period }}</span>
              </div>
              <p class="text-sm text-textSupporting mt-2 font-primary">{{ plan.description }}</p>
            </div>
            <ul class="space-y-3 mb-8">
              <li v-for="(feature, fIndex) in plan.features" :key="fIndex"
                  class="flex items-start gap-3 text-sm font-primary"
                  :class="feature.included ? 'text-textBody' : 'text-textSupporting opacity-60'">
                <i :class="feature.included ? 'fas fa-check ' + plan.checkColor + ' mt-1' : 'fas fa-minus mt-1'"></i>
                <span>{{ feature.text }}</span>
              </li>
            </ul>
            <a :href="plan.ctaLink" class="block w-full text-center px-6 py-3 font-semibold rounded-xl transition-colors text-sm font-primary" :class="plan.ctaClass">
              {{ plan.ctaText }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="relative bg-buttonBackground rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden">
        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-8 text-center lg:text-left space-y-3">
            <h2 class="text-3xl font-extrabold text-white font-display tracking-tight">Ready to deploy a chatbot?</h2>
            <p class="text-white/90 font-normal max-w-2xl text-base font-primary">
              Book a demo and see how your support, sales, and onboarding chats can run on autopilot.
            </p>
          </div>
          <div class="lg:col-span-4 flex flex-wrap justify-center lg:justify-end gap-3">
            <button @click="goToContact" type="button" class="px-6 py-3.5 bg-white text-secondary-600 font-bold rounded-xl shadow-md hover:bg-secondary-50 transition duration-200 cursor-pointer font-primary">
              Contact Sales
            </button>
            <button @click="scrollToPricing" type="button" class="px-6 py-3.5 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition duration-200 cursor-pointer font-primary">
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
import ShineButton from "@/components/ShineButton.vue";

const router = useRouter();

const chatbotCards = [
  { tag: 'Use case', title: 'Customer support', desc: 'FAQ answers, order status, and ticket creation from chat.', hex: '#8B5CF6', delay: '0s' },
  { tag: 'Use case', title: 'Sales and leads', desc: 'Qualify visitors, capture leads, and route hot prospects.', hex: '#F59E0B', delay: '0.6s' },
  { tag: 'Use case', title: 'Onboarding', desc: 'Guide new accounts through setup with step-by-step chat flows.', hex: '#EC4899', delay: '1.2s' },
  { tag: 'Control', title: 'Document RAG', desc: 'Upload docs, embed knowledge, and answer from your data.', hex: '#0D9488', delay: '0.3s' },
  { tag: 'Control', title: 'Live handoff', desc: 'Escalate to a human agent with full chat transcript.', hex: '#2563EB', delay: '0.9s' },
  { tag: 'Control', title: 'Token analytics', desc: 'Track embeddings, prompts, and response usage over time.', hex: '#059669', delay: '1.5s' },
];

const pricingPlans = [
  {
    name: 'Starter', badgeClass: 'text-accent-1 bg-accent-1/10',
    price: '₨35,000', period: '/ mo', description: 'For small teams and startups',
    featured: false, checkColor: 'text-accent-1',
    features: [
      { text: '1 chatbot', included: true },
      { text: '500 chat sessions / mo', included: true },
      { text: 'Document upload (5 docs)', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Human handoff', included: true },
    ],
    ctaText: 'Get Started', ctaClass: 'bg-buttonBackground border border-borderDefault text-white hover:bg-buttonHover', ctaLink: '/contact'
  },
  {
    name: 'Business', badgeClass: 'text-secondary-600 bg-secondary-50',
    price: '₨95,000', period: '/ mo', description: 'For growing businesses',
    featured: true, checkColor: 'text-secondary-500',
    features: [
      { text: '5 chatbots', included: true },
      { text: '5,000 chat sessions / mo', included: true },
      { text: 'Document upload (50 docs)', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'CRM integration', included: true },
    ],
    ctaText: 'Get Started', ctaClass: 'bg-buttonBackground text-white hover:bg-buttonHover shadow-md hover:shadow-lg', ctaLink: '/contact'
  },
  {
    name: 'Enterprise', badgeClass: 'text-accent-3 bg-accent-3/10',
    price: 'Custom', period: '', description: 'For large-scale operations',
    featured: false, checkColor: 'text-accent-3',
    features: [
      { text: 'Unlimited chatbots', included: true },
      { text: 'Unlimited chat sessions', included: true },
      { text: 'Unlimited document upload', included: true },
      { text: 'Custom workflows', included: true },
      { text: 'Priority support', included: true },
    ],
    ctaText: 'Contact Sales', ctaClass: 'border border-borderDefault text-textBody hover:bg-neutral-100', ctaLink: '/contact'
  }
];

const goToContact = () => router.push('/contact?project=chatbot');

const scrollToPricing = () => {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<style scoped>
@keyframes orbit-1 {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(18px, -10px); }
  50%  { transform: translate(0, -18px); }
  75%  { transform: translate(-18px, -10px); }
  100% { transform: translate(0, 0); }
}

@keyframes orbit-2 {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-14px, 12px); }
  50%  { transform: translate(0, 20px); }
  75%  { transform: translate(14px, 12px); }
  100% { transform: translate(0, 0); }
}

.orbit-1 { position: absolute; inset: 0; animation: orbit-1 14s ease-in-out infinite; }
.orbit-2 { position: absolute; inset: 0; animation: orbit-2 9s ease-in-out infinite; }

@keyframes meshShift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
  100% { transform: translate(1.5%, -1%) scale(1.04); opacity: 1; }
}

@keyframes orbDrift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -14px); }
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>