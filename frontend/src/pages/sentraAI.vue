<template>
  <Navbar />
  <div class="min-h-screen bg-[#f8fafc] font-['Inter'] text-[#1E3A5F] antialiased selection:bg-[#4A90E2]/20">
    <!-- Showcase Section -->
    <section class="relative pt-[68px] overflow-hidden" style="background: linear-gradient(180deg, #eff6ff 0%, #fff8f3 38%, #f8fafc 100%);">
      <div class="absolute inset-[-10%_-5%] pointer-events-none" :style="{
        background: `
          radial-gradient(circle at 18% 20%, rgba(143, 185, 244, 0.35) 0%, transparent 42%),
          radial-gradient(circle at 82% 18%, rgba(201, 196, 248, 0.28) 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 45%)
        `
      }"></div>

      <div class="max-w-7xl mx-auto px-[5%] relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <!-- Left Content -->
          <div>
            <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">
              Sentra AI Platform
            </span>
            <h1 class="font-['Space_Grotesk'] text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-[-1px] mb-2.5 text-[#1E3A5F]">
              Omni-channel call center with <br/>
              <em class="not-italic bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#6B52B8] bg-clip-text text-transparent">
                AI routing and live supervision
              </em>
            </h1>
            <p class="text-[15px] text-[#475569] leading-relaxed mb-4 max-w-2xl font-['Inter']">
              Inbound and outbound voice, AI bots, live agents, chatbots, and supervisor analytics — one platform for modern contact centers.
            </p>
            <div class="flex gap-3 flex-wrap">
              <router-link to="/login" class="inline-flex items-center px-6 py-3 bg-[#C2410C] text-white font-semibold rounded-lg hover:bg-[#9A3412] transition-all duration-300 shadow-lg shadow-[#C2410C]/30 hover:shadow-xl font-['Inter']">
                Open Sentra Portal
              </router-link>
              <router-link to="/contact?project=sentra" class="inline-flex items-center px-6 py-3 border-2 border-[#E2E8F0] text-[#1E3A5F] font-semibold rounded-lg hover:border-[#4A90E2] hover:text-[#4A90E2] transition-all duration-300 font-['Inter']">
                Contact Sales
              </router-link>
            </div>
          </div>

          <!-- Right Visual -->
          <div class="relative z-[3] flex justify-center">
            <div class="relative w-[min(360px,86vw)]">
              <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.22)_0%,transparent_70%)] pointer-events-none"></div>
              <div class="absolute inset-[-14px] rounded-full border-2 border-dashed border-[rgba(42,95,158,0.32)] pointer-events-none"></div>
              <div class="absolute inset-[-22px] rounded-full border-2 border-dashed border-[rgba(20,184,166,0.22)] pointer-events-none"></div>
              <img src="@/assets/svg/sentra-bot.svg" alt="Sentra AI call routing"
                   class="w-full relative z-[2] drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Architecture -->
    <section class="py-[72px] px-[5%]" style="background: linear-gradient(165deg, #fff8f3 0%, #f5f0ff 52%, #eff6ff 100%);">
      <div class="max-w-[1320px] mx-auto">
        <div class="text-center max-w-[760px] mx-auto mb-9">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">
            Platform Architecture
          </span>
          <h2 class="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-[-0.5px] mb-3 text-[#1E3A5F]">
            How Sentra AI runs your contact center
          </h2>
          <p class="text-[#475569] max-w-2xl mx-auto font-['Inter'] text-[17px] leading-relaxed">
            Explore inbound voice, outbound campaigns, chatbots, live agent handoff, and supervisor analytics — orchestrated by one AI router.
          </p>
        </div>
        <div class="rounded-2xl p-[14px] bg-white/90 border border-[rgba(203,213,225,0.9)] shadow-[0_20px_60px_rgba(42,95,158,0.1)]">
          <img src="@/assets/svg/sentra-platform.svg" alt="Sentra AI platform architecture"
               class="w-full block rounded-[14px]" />
        </div>
      </div>
    </section>

    <!-- Platform Modules -->
    <section class="py-20 px-[5%] bg-[#F8FAFC]">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-[760px] mx-auto mb-11">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">
            Platform Modules
          </span>
          <h2 class="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-[-0.5px] mb-3 text-[#1E3A5F]">
            One workspace for every contact-center role
          </h2>
          <p class="text-[#475569] max-w-2xl mx-auto font-['Inter'] text-[17px] leading-relaxed">
            Supervisors, agents, and admins each get purpose-built screens — from live call monitoring to campaign scheduling and token-level analytics.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 max-w-[900px] mx-auto gap-[14px]">
          <router-link v-for="module in modules" :key="module.name" :to="module.link"
                       class="flex flex-col items-center gap-2.5 p-[22px_14px] rounded-2xl bg-white border border-[#E2E8F0] text-[#1E3A5F] font-['Space_Grotesk'] text-[13px] font-bold transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-[rgba(20,184,166,0.35)] no-underline">
            <div class="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-lg text-[#C2410C]" style="background: rgba(74, 144, 226, 0.08);">
              <i :class="module.icon" aria-hidden="true"></i>
            </div>
            <span>{{ module.name }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Dashboard Section -->
    <section id="dashboard" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(74, 144, 226, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">01</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Command Center</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Real-time dashboard overview</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">A live snapshot of your entire operation — scheduled calls, queue depth, module usage, and activity trends that refresh automatically so supervisors always know what is happening right now.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in dashboardFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
              <img src="@/assets/images/scheduled-overview.png" alt="Sentra AI scheduled calls overview dashboard"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Calls Section -->
    <section id="live-calls" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-[#F1F5F9]">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] left-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(74, 144, 226, 0.2) 0%, rgba(20, 184, 166, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[1] order-2 lg:order-1">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
              <img src="@/assets/images/live-calls.png" alt="Sentra AI live calls table"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">02</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Live Calls</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Monitor and manage active calls</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Supervisors watch every active conversation in real time — who answered, which AI agent handled it, how long it ran, and whether a human agent has been assigned.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in liveCallFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Call Queue Section -->
    <section id="call-queue" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(74, 144, 226, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">03</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Call Queue</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Intelligent call routing and queue management</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Calls waiting for assignment are prioritized by urgency and skill requirement. Managers see wait times, required expertise, and which agents are available to take the next call.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in queueFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
              <img src="@/assets/images/call-queue.png" alt="Sentra AI call queue"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Campaigns Section -->
    <section id="campaigns" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-[#F1F5F9]">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] left-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(74, 144, 226, 0.2) 0%, rgba(20, 184, 166, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[1] order-2 lg:order-1">
          <div class="flex flex-col gap-4">
            <div class="relative w-full">
              <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
              <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
                <img src="@/assets/images/campaigns.png" alt="Sentra AI campaigns"
                     class="w-full h-auto rounded-[10px]" />
              </div>
            </div>
            <div class="relative w-full">
              <div class="relative z-[2] p-[8px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_12px_32px_rgba(15,23,42,0.07)] overflow-hidden">
                <img src="@/assets/images/bulk-contacts.png" alt="Sentra AI bulk contacts"
                     class="w-full h-auto rounded-[10px]" />
                <figcaption class="mt-2.5 text-xs text-[#475569] text-center font-['Inter']">Bulk import contacts via CSV with optional campaign assignment.</figcaption>
              </div>
            </div>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">04</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Campaigns &amp; Contacts</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Launch and manage outbound campaigns</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Create AI-driven Sales, Service, or custom campaigns — toggle them on or off, set start dates, and import thousands of contacts in one CSV upload with validation built in.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in campaignFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Call Scheduler Section -->
    <section id="scheduler" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(74, 144, 226, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">05</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Call Scheduler</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Automated dialing on your schedule</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Per-campaign scheduling dials contacts automatically within your calling window. Monitor pool progress, daily limits, queue depth, and which AI agents are receiving calls.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in schedulerFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
              <img src="@/assets/images/call-scheduler.png" alt="Sentra AI call scheduler"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Analytics Section -->
    <section id="analytics" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-[#F1F5F9]">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] left-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(74, 144, 226, 0.2) 0%, rgba(20, 184, 166, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[1] order-2 lg:order-1">
          <div class="flex flex-col gap-4">
            <div class="relative w-full">
              <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
              <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
                <img src="@/assets/images/chatbot-analytics.png" alt="Sentra AI chatbot analytics"
                     class="w-full h-auto rounded-[10px]" />
              </div>
            </div>
            <div class="relative w-full">
              <div class="relative z-[2] p-[8px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_12px_32px_rgba(15,23,42,0.07)] overflow-hidden">
                <img src="@/assets/images/analytics-charts.png" alt="Sentra AI analytics charts"
                     class="w-full h-auto rounded-[10px]" />
                <figcaption class="mt-2.5 text-xs text-[#475569] text-center font-['Inter']">Token trends, distribution breakdown, and usage by module.</figcaption>
              </div>
            </div>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">06</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Analytics</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Token usage, embeddings, and chat insights</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Filter analytics by client, user, date range, and grouping period. Track total tokens, embedding usage, AI response volume, and request counts — with drill-down into chat history and per-user stats.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in analyticsFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Team Workspace Section -->
    <section id="team" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2" style="background: radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(74, 144, 226, 0.1) 42%, transparent 72%);"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">07</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Team Workspace</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Agent availability and quick access</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">See who is online across your organization for call routing and transfers. Agent availability bars, quick-launch shortcuts into key modules, and high-level counts for contacts, campaigns, uploads, and tokens.</p>
          <ul class="mt-[22px] max-w-[480px] space-y-4">
            <li v-for="item in teamFeatures" :key="item.title" class="flex gap-4">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="text-[#4A90E2] text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)] blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_22px_56px_rgba(15,23,42,0.1)] overflow-hidden">
              <img src="@/assets/images/team-dashboard.png" alt="Sentra AI team workspace"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities Section -->
    <section class="py-20 px-[5%] bg-[#F1F5F9]">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">
            Capabilities
          </span>
          <h2 class="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-[-0.5px] text-[#1E3A5F]">
            Everything a modern call center needs
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] max-w-[1100px] mx-auto">
          <div v-for="benefit in benefits" :key="benefit.title"
               class="bg-white border border-[#E2E8F0] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-[rgba(74,144,226,0.28)]">
            <h3 class="font-['Space_Grotesk'] text-base font-bold text-[#1E3A5F] mb-2">{{ benefit.title }}</h3>
            <p class="text-sm text-[#475569] leading-relaxed font-['Inter']">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-[5%] text-center" style="background: linear-gradient(165deg, #1e3a5f 0%, #2a5f9e 100%);">
      <div class="max-w-4xl mx-auto">
        <h2 class="font-['Space_Grotesk'] text-3xl md:text-5xl font-extrabold mb-3 text-white">
          Ready to modernize your contact center?
        </h2>
        <p class="text-white/80 mb-6 font-['Inter'] text-lg">
          Deploy Sentra AI on your stack or start with our managed demo environment.
        </p>
        <div class="flex gap-3.5 justify-center flex-wrap">
          <router-link to="/login" class="inline-flex items-center px-8 py-4 bg-white text-[#2A5F9E] font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl font-['Inter']">
            Open Sentra Portal
          </router-link>
          <router-link to="/contact?project=sentra" class="inline-flex items-center px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 font-['Inter']">
            Contact Sales
          </router-link>
        </div>
      </div>
    </section>

  </div>
  <Footer />
</template>

<script>
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'

export default {
  name: 'SentraPage',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      modules: [
        { name: 'Dashboard', icon: 'fas fa-gauge-high', link: '#dashboard' },
        { name: 'Live Calls', icon: 'fas fa-phone-volume', link: '#live-calls' },
        { name: 'Call Queue', icon: 'fas fa-list-ol', link: '#call-queue' },
        { name: 'Campaigns', icon: 'fas fa-rocket', link: '#campaigns' },
        { name: 'Call Scheduler', icon: 'fas fa-calendar-days', link: '#scheduler' },
        { name: 'Analytics', icon: 'fas fa-chart-line', link: '#analytics' },
        { name: 'Team Workspace', icon: 'fas fa-users', link: '#team' },
        { name: 'Contacts', icon: 'fas fa-address-book', link: '#campaigns' }
      ],
      dashboardFeatures: [
        { icon: 'fas fa-bolt', title: 'Live queue metrics', description: 'Total, scheduled, processing, and blocked calls at a glance.' },
        { icon: 'fas fa-chart-area', title: 'Activity trends', description: 'Chatbot requests and document uploads charted over time.' },
        { icon: 'fas fa-chart-pie', title: 'Module usage split', description: 'See how volume distributes across chatbot, agents, and live calls.' }
      ],
      liveCallFeatures: [
        { icon: 'fas fa-headset', title: 'AI + human handoff', description: 'Track which calls are on AI agents like Danison and when they move to live staff.' },
        { icon: 'fas fa-user-plus', title: 'One-click assignment', description: 'Assign unowned calls to available agents or enable auto-assignment.' },
        { icon: 'fas fa-play', title: 'Review actions', description: 'View details, listen to recordings, and open transcripts from each row.' }
      ],
      queueFeatures: [
        { icon: 'fas fa-flag', title: 'Priority routing', description: 'High, medium, and low priority badges with color-coded urgency.' },
        { icon: 'fas fa-screwdriver-wrench', title: 'Skill-based matching', description: 'Route to Sales, Technical Support, or Customer Support automatically.' },
        { icon: 'fas fa-users-gear', title: 'Auto assign all', description: 'Bulk-assign waiting calls to the next available skilled agents.' }
      ],
      campaignFeatures: [
        { icon: 'fas fa-toggle-on', title: 'Campaign lifecycle', description: 'Full create, edit, delete, and on/off control for every workflow.' },
        { icon: 'fas fa-file-csv', title: 'Bulk contact import', description: 'Upload CSV files with required phone_number headers and optional campaign tags.' },
        { icon: 'fas fa-robot', title: 'AI script campaigns', description: 'Outbound voice scripts for sales outreach, service follow-ups, and more.' }
      ],
      schedulerFeatures: [
        { icon: 'fas fa-clock', title: 'Calling windows', description: 'Set hours and days — e.g. 09:00–19:00 Mon–Sun with daily caps.' },
        { icon: 'fas fa-robot', title: 'Agent availability', description: 'Toggle individual AI agents on or off for receiving scheduled calls.' },
        { icon: 'fas fa-list-check', title: 'Pool tracking', description: 'Done vs. remaining contacts, in-queue, processing, and blocked counts.' }
      ],
      analyticsFeatures: [
        { icon: 'fas fa-filter', title: 'Flexible filters', description: 'Slice data by client, user, period, and daily/weekly grouping.' },
        { icon: 'fas fa-coins', title: 'Token breakdown', description: 'Separate embed, query, prompt, and response token consumption.' },
        { icon: 'fas fa-chart-line', title: 'Visual trends', description: 'Activity line charts, distribution pie, and usage bar comparisons.' }
      ],
      teamFeatures: [
        { icon: 'fas fa-circle', title: 'Live presence', description: 'Online team members with client roles and availability status.' },
        { icon: 'fas fa-grip', title: 'Quick access grid', description: 'Jump to Agents, Live Calls, Call Queue, Jira, and subscription.' },
        { icon: 'fas fa-gauge', title: 'Workspace stats', description: 'Contacts, campaigns, uploads, and token usage in one row.' }
      ],
      benefits: [
        { title: 'AI Router', description: 'Route every channel through one intelligent hub — voice, chat, SMS, email, and CRM events.' },
        { title: 'Live Agent Workbench', description: 'Warm transfers with full context, whisper coaching, and supervisor barge-in.' },
        { title: 'Outbound Campaigns', description: 'Scheduled AI dialing with per-campaign limits, agent toggles, and pool tracking.' },
        { title: 'Supervisor Analytics', description: 'Real-time SLA, queue health, token usage, and agent performance dashboards.' },
        { title: 'Chatbot & RAG', description: 'Document-grounded chat with embedding analytics, chat history, and per-client reporting.' },
        { title: 'Contact Management', description: 'Bulk CSV import with validation, campaign assignment, and searchable contact records.' }
      ]
    }
  }
}
</script>

<style scoped>
</style>