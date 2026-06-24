<template>
  <Navbar />
  <div class="min-h-screen bg-hero-gradient font-primary antialiased selection:bg-primary-500/20">
    <!-- Showcase Section -->
    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-secondary-50 via-primary-50 to-neutral-100" id="top">
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
                 class="rounded-lg border border-borderDefault relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>

        <!-- Right grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] right-[max(12px,2vw)] [mask-image:linear-gradient(270deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsRight" :key="'right-'+i"
                 class="rounded-lg border border-borderDefault relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <!-- Left text content -->
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-15">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-1 bg-accent-1/10 px-3 py-1 rounded-full mb-4 font-display">Sentra AI Platform</span>
          <h1 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1px] leading-[1.15] mb-4 text-headingMain">
            Omni-channel call center with <br/>
            <em class="not-italic text-gradient-primary">
              AI routing and live supervision
            </em>
          </h1>
          <p class="text-[15px] text-textBody leading-relaxed mb-6 font-primary">Inbound and outbound voice, AI bots, live agents, chatbots, and supervisor analytics — one platform for modern contact centers.</p>
          <div class="flex gap-3 flex-wrap">
            <ShineButton to="/login" >Open Sentra Portal</ShineButton>
            <router-link to="/contact?project=sentra" class="px-6 py-3 border border-borderDefault text-textBody font-semibold rounded-lg hover:bg-neutral-100 transition-colors text-sm cursor-pointer no-underline font-primary">
              Contact Sales
            </router-link>
          </div>
        </div>

        <!-- Right Visual -->
        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto">
          <div class="relative w-[min(400px,80vw)] animate-[botEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,var(--color-bot-glow)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute -inset-3.5 rounded-full border-4 border-dashed border-accent-1/35 animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-4 border-dashed border-accent-3/20 animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <div class="relative w-full z-20 aspect-square max-w-sm mx-auto flex items-center justify-center overflow-visible">
              <img src="../assets/svg/sentra-bot.svg" alt="Sentra AI call routing" class="w-full h-[450px] object-contain drop-shadow-[var(--shadow-primary-dark)] relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Architecture -->
    <section class="py-[72px] px-[5%] bg-gradient-secondary">
      <div class="max-w-[1320px] mx-auto">
        <div class="text-center max-w-[760px] mx-auto mb-9">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">
            Platform Architecture
          </span>
          <h2 class="font-display text-3xl md:text-4xl font-bold tracking-[-0.5px] mb-3 text-headingSection">
            How Sentra AI runs your contact center
          </h2>
          <p class="text-textBody max-w-2xl mx-auto font-primary text-[17px] leading-relaxed">
            Explore inbound voice, outbound campaigns, chatbots, live agent handoff, and supervisor analytics — orchestrated by one AI router.
          </p>
        </div>
        <div class="rounded-2xl p-[14px] bg-white/90 border border-borderDefault shadow-[var(--color-platform-shadow)]">
          <img src="../assets/svg/sentra-platform.svg" alt="Sentra AI platform architecture"
               class="w-full block rounded-[14px]" />
        </div>
      </div>
    </section>

    <!-- Platform Modules -->
    <section class="py-20 px-[5%] bg-neutral-100">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-[760px] mx-auto mb-11">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">
            Platform Modules
          </span>
          <h2 class="font-display text-3xl md:text-4xl font-bold tracking-[-0.5px] mb-3 text-headingSection">
            One workspace for every contact-center role
          </h2>
          <p class="text-textBody max-w-2xl mx-auto font-primary text-[17px] leading-relaxed">
            Supervisors, agents, and admins each get purpose-built screens — from live call monitoring to campaign scheduling and token-level analytics.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 max-w-[900px] mx-auto gap-[14px]">
          <router-link v-for="module in modules" :key="module.name" :to="module.link"
                       class="flex flex-col items-center gap-2.5 p-[22px_14px] rounded-2xl bg-section-white border border-borderDefault text-headingCard font-display text-[13px] font-bold transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-card-hover-border no-underline">
            <div class="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-lg text-secondary-700" style="background: var(--color-icon-container-bg);">
              <i :class="module.icon " class="text-button-hover" aria-hidden="true"></i>
            </div>
            <span>{{ module.name }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Dashboard Section -->
    <section id="dashboard" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-section-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-2xl pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2 bg-glow-dashboard"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">01</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Command Center</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Real-time dashboard overview</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">A live snapshot of your entire operation — scheduled calls, queue depth, module usage, and activity trends that refresh automatically so supervisors always know what is happening right now.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in dashboardFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-glow-queue blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
              <img src="@/assets/images/scheduled-overview.png" alt="Sentra AI scheduled calls overview dashboard"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Calls Section -->
    <section id="live-calls" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-neutral-200">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] left-[2%] top-1/2 -translate-y-1/2 bg-glow-live"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[1] order-2 lg:order-1">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-glow-live blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
              <img src="@/assets/images/live-calls.png" alt="Sentra AI live calls table"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">02</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Live Calls</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Monitor and manage active calls</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">Supervisors watch every active conversation in real time — who answered, which AI agent handled it, how long it ran, and whether a human agent has been assigned.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in liveCallFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call Queue Section -->
    <section id="call-queue" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-section-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2 bg-glow-queue"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">03</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Call Queue</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Intelligent call routing and queue management</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">Calls waiting for assignment are prioritized by urgency and skill requirement. Managers see wait times, required expertise, and which agents are available to take the next call.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in queueFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-glow-queue blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
              <img src="@/assets/images/call-queue.png" alt="Sentra AI call queue"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Campaigns Section -->
    <section id="campaigns" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-neutral-200">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] left-[2%] top-1/2 -translate-y-1/2 bg-glow-campaign"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[1] order-2 lg:order-1">
          <div class="flex flex-col gap-4">
            <div class="relative w-full">
              <div class="absolute inset-[6%_2%] rounded-full bg-glow-campaign blur-[10px] pointer-events-none"></div>
              <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
                <img src="@/assets/images/campaigns.png" alt="Sentra AI campaigns"
                     class="w-full h-auto rounded-[10px]" />
              </div>
            </div>
            <figure class="relative w-full">
              <div class="relative z-[2] p-[8px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card-small)] overflow-hidden">
                <img src="@/assets/images/bulk-contacts.png" alt="Sentra AI bulk contacts"
                     class="w-full h-auto rounded-[10px]" />
              </div>
              <figcaption class="mt-2.5 text-xs text-textSupporting text-center font-primary">Bulk import contacts via CSV with optional campaign assignment.</figcaption>
            </figure>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">04</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Campaigns &amp; Contacts</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Launch and manage outbound campaigns</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">Create AI-driven Sales, Service, or custom campaigns — toggle them on or off, set start dates, and import thousands of contacts in one CSV upload with validation built in.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in campaignFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call Scheduler Section -->
    <section id="scheduler" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-section-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2 bg-glow-scheduler"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">05</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Call Scheduler</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Automated dialing on your schedule</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">Per-campaign scheduling dials contacts automatically within your calling window. Monitor pool progress, daily limits, queue depth, and which AI agents are receiving calls.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in schedulerFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-glow-scheduler blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
              <img src="@/assets/images/call-scheduler.png" alt="Sentra AI call scheduler"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Analytics Section -->
    <section id="analytics" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-neutral-200">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] left-[2%] top-1/2 -translate-y-1/2 bg-glow-analytics"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[1] order-2 lg:order-1">
          <div class="flex flex-col gap-4">
            <div class="relative w-full">
              <div class="absolute inset-[6%_2%] rounded-full bg-glow-analytics blur-[10px] pointer-events-none"></div>
              <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
                <img src="@/assets/images/chatbot-analytics.png" alt="Sentra AI chatbot analytics"
                     class="w-full h-auto rounded-[10px]" />
              </div>
            </div>
            <figure class="relative w-full">
              <div class="relative z-[2] p-[8px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card-small)] overflow-hidden">
                <img src="@/assets/images/analytics-charts.png" alt="Sentra AI analytics charts"
                     class="w-full h-auto rounded-[10px]" />
              </div>
              <figcaption class="mt-2.5 text-xs text-textSupporting text-center font-primary">Token trends, distribution breakdown, and usage by module.</figcaption>
            </figure>
          </div>
        </div>
        <div class="relative z-[2] order-1 lg:order-2">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">06</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Analytics</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Token usage, embeddings, and chat insights</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">Filter analytics by client, user, date range, and grouping period. Track total tokens, embedding usage, AI response volume, and request counts — with drill-down into chat history and per-user stats.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in analyticsFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Workspace Section -->
    <section id="team" class="relative py-[72px] px-[5%] overflow-hidden scroll-mt-[96px] bg-section-white">
      <div class="absolute w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] right-[2%] top-1/2 -translate-y-1/2 bg-glow-team"></div>

      <div class="max-w-[1140px] mx-auto relative grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-[clamp(28px,5vw,56px)] items-center z-[2]">
        <div class="relative z-[2]">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-sectionNumber pointer-events-none select-none">07</span>
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">Team Workspace</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-headingSection mb-3">Agent availability and quick access</h2>
          <p class="text-[15px] text-textBody leading-relaxed max-w-[480px] font-primary">See who is online across your organization for call routing and transfers. Agent availability bars, quick-launch shortcuts into key modules, and high-level counts for contacts, campaigns, uploads, and tokens.</p>

          <div class="mt-[22px] max-w-[480px] grid grid-cols-1 gap-4">
            <div v-for="item in teamFeatures" :key="item.title" class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
              <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
                <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
                <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="relative z-[1]">
          <div class="relative w-full">
            <div class="absolute inset-[6%_2%] rounded-full bg-glow-team blur-[10px] pointer-events-none"></div>
            <div class="relative z-[2] p-[10px] rounded-2xl bg-white/95 border border-borderDefault shadow-[var(--shadow-card)] overflow-hidden">
              <img src="@/assets/images/team-dashboard.png" alt="Sentra AI team workspace"
                   class="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities Section -->
    <section class="py-20 px-[5%] bg-neutral-200">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-textBrand bg-badge-white px-4 py-2 rounded-full border border-badge-border mb-4 font-primary">
            Capabilities
          </span>
          <h2 class="font-display text-3xl md:text-4xl font-bold tracking-[-0.5px] text-headingSection">
            Everything a modern call center needs
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] max-w-[1100px] mx-auto">
          <div v-for="benefit in benefits" :key="benefit.title"
               class="bg-section-white border border-borderDefault rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-card-hover-border">
            <h3 class="font-display text-base font-bold text-headingCard mb-2">{{ benefit.title }}</h3>
            <p class="text-sm text-textBody leading-relaxed font-primary">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="bg-secondary-700 text-white p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl">
        <div class="max-w-2xl text-left">
          <p class="font-display text-2xl md:text-3xl font-bold mb-3 text-white">
            Ready to modernize your contact center?
          </p>
          <p class="text-white/80 font-primary text-sm md:text-base leading-relaxed">
            Deploy Sentra AI on your stack or start with our managed demo environment.
          </p>
        </div>
        <div class="flex gap-3 flex-wrap items-center lg:justify-end shrink-0">
          <ShineButton to="/login" >Open Sentra Portal</ShineButton>
          <router-link to="/contact?project=sentra" class="inline-flex items-center justify-center px-6 py-3.5 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 font-primary text-sm">
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
import ShineButton from "@/components/ShineButton.vue";

// Grid cell config
const CELL_CONFIGS = [
  { bg: 'bg-accent-3/20' },
  { bg: 'bg-accent-4/20', delay: '-0.9s' },
  { bg: 'bg-secondary-100/20', delay: '-1.8s' },
  { bg: 'bg-accent-3/20', delay: '-2.7s' },
  { bg: 'bg-secondary-100/20', delay: '-3.6s' },
  { bg: 'bg-primary-500/20', delay: '-4.5s' },
  { bg: 'bg-accent-3/20', delay: '-5.4s' },
  { bg: 'bg-secondary-100/20', delay: '-6.3s' },
  { bg: 'bg-accent-3/20' },
  { bg: 'bg-secondary-100/20', delay: '-1.8s' },
  { bg: 'bg-accent-4/20', delay: '-0.9s' },
  { bg: 'bg-accent-3/20', delay: '-2.7s' },
  { bg: 'bg-secondary-100/20', delay: '-3.6s' },
  { bg: 'bg-primary-500/20', delay: '-4.5s' },
  { bg: 'bg-secondary-100/20', delay: '-1.8s' },
]

export default {
  name: 'SentraPage',
  components: {
    Navbar,
    Footer,
    ShineButton
  },
  data() {
    return {
      gridCells: CELL_CONFIGS,
      modules: [
        { name: 'Dashboard', icon: 'fas fa-gauge-high', link: '#dashboard' },
        { name: 'Live Calls', icon: 'fas fa-phone-volume', link: '#live-calls' },
        { name: 'Call Queue', icon: 'fas fa-list-ol', link: '#call-queue' },
        { name: 'Campaigns', icon: 'fas fa-rocket', link: '#campaigns' },
        { name: 'Call Scheduler', icon: 'fas fa-calendar-days', link: '#scheduler' },
        { name: 'Analytics', icon: 'fas fa-chart-line', link: '#analytics' },
        { name: 'Team Workspace', icon: 'fas fa-accounts', link: '#team' },
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
        { icon: 'fas fa-accounts-gear', title: 'Auto assign all', description: 'Bulk-assign waiting calls to the next available skilled agents.' }
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
  },
  computed: {
    gridCellsLeft() {
      return this.gridCells.slice(0, 15)
    },
    gridCellsRight() {
      return this.gridCells.slice(0, 15)
    }
  }
}
</script>

<style scoped>
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

@keyframes shineFastLoop {
  0% { transform: translateX(-150%) skewX(-12deg); }
  40% { transform: translateX(250%) skewX(-12deg); }
  50% { transform: translateX(250%) skewX(-12deg); }
  90% { transform: translateX(-150%) skewX(-12deg); }
  100% { transform: translateX(-150%) skewX(-12deg); }
}

.animate-shine-fast-loop {
  animation: shineFastLoop 2s ease-in-out infinite;
}
</style>