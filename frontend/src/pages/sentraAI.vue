<template>
  <Navbar />
  <div class="min-h-screen bg-[#f8fafc] font-['Inter'] text-[#1E3A5F] antialiased selection:bg-[#4A90E2]/20">
    <!-- Showcase Section -->
    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-[#fdf4ff] via-[#fff8f3] to-[#f8fafc]" id="top">
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
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-4">Sentra AI Platform</span>
          <h1 class="font-['Space_Grotesk'] text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1px] leading-[1.15] mb-4 text-slate-900">
            Omni-channel call center with <br/>
            <em class="not-italic bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#6B52B8] bg-clip-text text-transparent">
              AI routing and live supervision
            </em>
          </h1>
          <p class="text-[15px] text-slate-500 leading-relaxed mb-6">Inbound and outbound voice, AI bots, live agents, chatbots, and supervisor analytics — one platform for modern contact centers.</p>
          <div class="flex gap-3 flex-wrap">
            <button
                @click="$router.push('/login')"
                type="button"
                class="relative overflow-hidden cursor-pointer w-50 flex items-center justify-center px-6 py-3.5 bg-orange-700 hover:bg-orange-900 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group"
            >
              Open Sentra Portal
              <div class="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none animate-shine-fast-loop"></div>
            </button>
            <router-link to="/contact?project=sentra" class="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm cursor-pointer no-underline">
              Contact Sales
            </router-link>
          </div>
        </div>

        <!-- Right Visual -->
        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto">
          <div class="relative w-[min(400px,80vw)] animate-[botEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-[rgba(45,212,191,0.35)] animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-2 border-dashed border-[rgba(139,92,246,0.2)] animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <div class="relative w-full z-20 aspect-square max-w-sm mx-auto flex items-center justify-center overflow-visible">
              <img src="../assets/svg/sentra-bot.svg" alt="Sentra AI call routing" class="w-full h-[450px] object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)] relative z-10" />
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
          <!--  sentra-platform.svg added here -->
          <img src="../assets/svg/sentra-platform.svg" alt="Sentra AI platform architecture"
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

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in dashboardFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8 text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in liveCallFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8  text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in queueFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8 text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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
            <figure class="relative w-full">
              <div class="relative z-[2] p-[8px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_12px_32px_rgba(15,23,42,0.07)] overflow-hidden">
                <img src="@/assets/images/bulk-contacts.png" alt="Sentra AI bulk contacts"
                     class="w-full h-auto rounded-[10px]" />
              </div>
              <figcaption class="mt-2.5 text-xs text-[#475569] text-center font-['Inter']">Bulk import contacts via CSV with optional campaign assignment.</figcaption>
            </figure>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">04</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Campaigns &amp; Contacts</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Launch and manage outbound campaigns</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Create AI-driven Sales, Service, or custom campaigns — toggle them on or off, set start dates, and import thousands of contacts in one CSV upload with validation built in.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in campaignFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8  text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in schedulerFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8  text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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
            <figure class="relative w-full">
              <div class="relative z-[2] p-[8px] rounded-2xl bg-white/95 border border-[rgba(203,213,225,0.95)] shadow-[0_12px_32px_rgba(15,23,42,0.07)] overflow-hidden">
                <img src="@/assets/images/analytics-charts.png" alt="Sentra AI analytics charts"
                     class="w-full h-auto rounded-[10px]" />
              </div>
              <figcaption class="mt-2.5 text-xs text-[#475569] text-center font-['Inter']">Token trends, distribution breakdown, and usage by module.</figcaption>
            </figure>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-[rgba(42,95,158,0.065)] pointer-events-none select-none">06</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4 font-['Inter']">Analytics</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-[#1E3A5F] mb-3">Token usage, embeddings, and chat insights</h2>
          <p class="text-[15px] text-[#475569] leading-relaxed max-w-[480px] font-['Inter']">Filter analytics by client, user, date range, and grouping period. Track total tokens, embedding usage, AI response volume, and request counts — with drill-down into chat history and per-user stats.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in analyticsFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8  text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in teamFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-[#E2E8F0] hover:border-[#4A90E2]/30 transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style="background: rgba(74, 144, 226, 0.08);">
                <i :class="item.icon" class="bg-[#4A90E2]/8  text-sm" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-[#1E3A5F] font-['Space_Grotesk']">{{ item.title }}</h4>
                <p class="text-[13px] text-[#475569] leading-relaxed font-['Inter']">{{ item.description }}</p>
              </div>
            </div>
          </div>
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
    <section class="py-16 px-[5%] text-center bg-orange-700">
      <div class="max-w-3xl mx-auto">
        <p class="font-['Space_Grotesk'] text-3xl md:text-4xl font-extrabold mb-3 text-white">
          Ready to modernize your contact center?
        </p>
        <p class="text-white/80 mb-6 font-['Inter'] text-base md:text-lg">
          Deploy Sentra AI on your stack or start with our managed demo environment.
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <router-link to="/login" class="shadow-md transition-transform hover:scale-[1.02] inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition-all duration-300 shadow-lg hover:shadow-xl font-['Inter']">
            Open Sentra Portal
          </router-link>
          <router-link to="/contact?project=sentra" class="inline-flex items-center px-6 py-3 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 font-['Inter']">
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
@keyframes shineFastLoop {
  0% {
    transform: translateX(-150%) skewX(-12deg);
  }
  /* Fast journey from Left to Right */
  40% {
    transform: translateX(250%) skewX(-12deg);
  }
  /* Tiny pause at the right edge before returning */
  50% {
    transform: translateX(250%) skewX(-12deg);
  }
  /* Fast journey back from Right to Left */
  90% {
    transform: translateX(-150%) skewX(-12deg);
  }
  /* Pause at the left edge before restarting the whole loop */
  100% {
    transform: translateX(-150%) skewX(-12deg);
  }
}

.animate-shine-fast-loop {
  /* Adjust 3s to make the total cycle (including pauses) longer or shorter */
  animation: shineFastLoop 2s ease-in-out infinite;
}
.animate-spin-slow {
  animation: spin 22s linear infinite;
}

.animate-spin-reverse-slow {
  animation: spin-reverse 30s linear infinite;
}
</style>