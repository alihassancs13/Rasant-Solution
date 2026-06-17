<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
    <Navbar />

    <section class="relative overflow-hidden bg-pink-50 py-20 lg:py-32">
      <div class="absolute inset-0 z-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
      <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-300/40    blur-3xl opacity-40"></div>
      <div class="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 rounded-full bg-pink-200 blur-3xl opacity-30"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700">
              Chatbot Agent
            </span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-space-grotesk">
              Conversational AI for 
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-indigo-600">
                web, WhatsApp, and in-app chat
              </span>
            </h1>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Grounded chatbots that answer from your documents, handle support and sales conversations, and hand off to humans with full context - with token analytics built in.
            </p>
            <div class="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <a href="#" class="px-8 py-4 rounded-xl text-white font-medium bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg shadow-orange-600/30 hover:shadow-xl hover:shadow-orange-600/40 transition duration-200 transform hover:-translate-y-0.5">
                Book a Chat Demo
              </a>
              <a href="#" class="px-8 py-4 rounded-xl text-slate-700 font-medium bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition duration-200">
                View Pricing
              </a>
            </div>
          </div>

          <div class="lg:col-span-5 flex justify-center relative">
            <div class="relative w-full max-w-md aspect-square flex items-center justify-center">
              <div class="absolute inset-0 rounded-full border border-dashed border-indigo-200 animate-[spin_60s_linear_infinite]"></div>
              <div class="absolute inset-8 rounded-full border border-dotted border-pink-200 animate-[spin_40s_linear_infinite_reverse]"></div>
              
              <div class="relative p-8 bg-white/40 backdrop-blur-md rounded-full shadow-2xl border border-white/60">
                <img 
                src="../assets/svg/chatbot-bot.svg" 
                alt="Chatbot agent" 
                class="w-64 h-64 mx-auto" 
                title="Chatbot Agent"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-5 space-y-4">
            <div class="text-7xl font-extrabold text-slate-100 font-space-grotesk tracking-tighter leading-none select-none">01</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">Conversation Flow</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-space-grotesk">From message to resolution in chat</h2>
            <p class="text-slate-600 leading-relaxed">
              Route every conversation through intent detection, document retrieval, and smart handoff - so customers get accurate answers without waiting on a queue.
            </p>
          </div>

          <div class="lg:col-span-7">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
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

    <section class="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:direction-rtl">
          
          <div class="lg:col-span-7 space-y-6 lg:order-1">
            <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div class="text-7xl font-extrabold text-slate-200/70 font-space-grotesk tracking-tighter leading-none select-none">02</div>
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
            <div class="text-7xl font-extrabold text-slate-100 font-space-grotesk tracking-tighter leading-none select-none">03</div>
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
            <div class="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 w-full max-w-md aspect-square flex items-center justify-center">
              <div class="absolute inset-0 rounded-full border border-slate-200/50 animate-[spin_50s_linear_infinite]"></div>
              <img 
                src="../assets/svg/chatbot-messenger-bot.svg" 
                alt="Chatbot with messages" 
                class="w-56 h-56 mx-auto relative z-10" 
                title="Chatbot agent messaging"
                />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article class="p-6 bg-white rounded-2xl border-l-4 border-l-purple-500 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 group">
            <span class="text-xs font-semibold tracking-wider text-purple-600 uppercase">Use case</span>
            <h3 class="text-lg font-bold text-slate-900 mt-2 font-space-grotesk">Customer support</h3>
            <p class="text-slate-600 text-sm mt-2">FAQ answers, order status, and ticket creation from chat.</p>
          </article>
          
          <article class="p-6 bg-white rounded-2xl border-l-4 border-l-amber-500 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 group">
            <span class="text-xs font-semibold tracking-wider text-amber-600 uppercase">Use case</span>
            <h3 class="text-lg font-bold text-slate-900 mt-2 font-space-grotesk">Sales and leads</h3>
            <p class="text-slate-600 text-sm mt-2">Qualify visitors, capture leads, and route hot prospects.</p>
          </article>

          <article class="p-6 bg-white rounded-2xl border-l-4 border-l-pink-500 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 group">
            <span class="text-xs font-semibold tracking-wider text-pink-600 uppercase">Use case</span>
            <h3 class="text-lg font-bold text-slate-900 mt-2 font-space-grotesk">Onboarding</h3>
            <p class="text-slate-600 text-sm mt-2">Guide new users through setup with step-by-step chat flows.</p>
          </article>

          <article class="p-6 bg-white rounded-2xl border-l-4 border-l-teal-500 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 group">
            <span class="text-xs font-semibold tracking-wider text-teal-600 uppercase">Control</span>
            <h3 class="text-lg font-bold text-slate-900 mt-2 font-space-grotesk">Document RAG</h3>
            <p class="text-slate-600 text-sm mt-2">Upload docs, embed knowledge, and answer from your data.</p>
          </article>

          <article class="p-6 bg-white rounded-2xl border-l-4 border-l-blue-600 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 group">
            <span class="text-xs font-semibold tracking-wider text-blue-600 uppercase">Control</span>
            <h3 class="text-lg font-bold text-slate-900 mt-2 font-space-grotesk">Live handoff</h3>
            <p class="text-slate-600 text-sm mt-2">Escalate to a human agent with full chat transcript.</p>
          </article>

          <article class="p-6 bg-white rounded-2xl border-l-4 border-l-emerald-600 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 group">
            <span class="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Control</span>
            <h3 class="text-lg font-bold text-slate-900 mt-2 font-space-grotesk">Token analytics</h3>
            <p class="text-slate-600 text-sm mt-2">Track embeddings, prompts, and response usage over time.</p>
          </article>
        </div>

      </div>
    </section>

    <section class="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-6 flex justify-center">
            <div class="p-6 bg-white rounded-2xl shadow-md w-full max-w-lg">
             <img 
                src="../assets/svg/chatbot-capabilities.svg" 
                alt="Chatbot capabilities diagram" 
                class="w-full h-auto" 
                title="Chatbot capabilities and integrations"
                />
            </div>
          </div>

          <div class="lg:col-span-6 space-y-6">
            <div class="text-7xl font-extrabold text-slate-200/80 font-space-grotesk tracking-tighter leading-none select-none">04</div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">Capabilities</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-space-grotesk">Everything a chatbot agent needs</h2>
            <p class="text-slate-600 leading-relaxed mb-6">
              Intent routing, human handoff, and CRM integrations - the full toolkit for production chat deployments.
            </p>

            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-sm tracking-wide shadow-sm shadow-indigo-600/20">
                  NLP
                </span>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 font-space-grotesk">Intent and routing</h4>
                  <p class="text-slate-600 text-sm mt-1">Understand what users want and route to the right flow.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500 text-white font-bold text-sm tracking-wide shadow-sm shadow-sky-500/20">
                  HO
                </span>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 font-space-grotesk">Human handoff</h4>
                  <p class="text-slate-600 text-sm mt-1">Warm transfer to live agents when chat needs a person.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-sm shadow-emerald-500/20">
                  API
                </span>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 font-space-grotesk">CRM and webhooks</h4>
                  <p class="text-slate-600 text-sm mt-1">Connect tickets, CRM records, and custom backends via API.</p>
                </div>
              </li>
            </ul>

            <div class="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-sm text-slate-600 mt-6">
              <i class="fas fa-info-circle text-indigo-500 mr-2"></i>
              Need phone and voice automation? See our 
              <a href="#" class="text-indigo-600 font-semibold hover:underline">Voice AI Agent</a>.
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
            <a href="#" class="px-6 py-3.5 bg-white text-orange-700 font-bold rounded-xl shadow-md hover:bg-orange-50 transition duration-200">
              Contact Sales
            </a>
            <a href="#" class="px-6 py-3.5 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition duration-200">
              View Pricing
            </a>
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
</script>

<style>
/* Custom typography styles mimicking your project fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');

.font-space-grotesk {
  font-family: 'Space Grotesk', sans-serif;
}
</style>