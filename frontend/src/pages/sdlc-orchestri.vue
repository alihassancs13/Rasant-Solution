<template>
  <div data-page="orchestri" class="bg-neutral-100 min-h-screen font-primary text-primary-900">
    <Navbar />

    <!-- Hero Section -->
    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-secondary-50 via-primary-50 to-neutral-100" id="top">
      <!-- Background mesh -->
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.12)_0%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"></div>

      <!-- Orb backgrounds -->
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-secondary-100/45 -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-70 h-70 bg-primary-300/35 top-15 -right-15 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-50 h-50 bg-accent-3/28 bottom-[10%] left-[55%] animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-3s]"></div>

      <!-- Decorative side grids -->
      <div class="absolute left-0 right-0 top-13 bottom-0 z-10 pointer-events-none overflow-hidden hidden sm:block" aria-hidden="true">
        <!-- Left grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] left-[max(12px,2vw)] [mask-image:linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(167,139,250,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsLeft" :key="'left-'+i"
                 class="rounded-lg border border-accent-3/16 relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>

        <!-- Right grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] right-[max(12px,2vw)] [mask-image:linear-gradient(270deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(167,139,250,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsRight" :key="'right-'+i"
                 class="rounded-lg border border-accent-3/16 relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <!-- Left text content -->
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-15">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-4 font-display">Orchestri</span>
          <h1 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1px] leading-[1.15] mb-4 text-primary-900">
            AI-driven multi-agent <em class="not-italic bg-gradient-to-r from-secondary-500 to-accent-3 bg-clip-text text-transparent">SDLC in one monorepo</em>
          </h1>
          <p class="text-[15px] text-neutral-600 leading-relaxed mb-6 font-primary">Web UI and FastAPI backend that drive a gated workflow: specification, user approval, plan, implementation, test/debug loop, deployment, and optional execution — on your local project folder.</p>
          <div class="flex justify-start gap-3 flex-wrap">
            <button
                @click="goToContact"
                type="button"
                class="relative overflow-hidden cursor-pointer px-6 py-3.5 bg-secondary-700 hover:bg-secondary-800 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group inline-flex items-center justify-center font-primary"
            >
              Contact Sales
              <div class="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none animate-shine-loop"></div>
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
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-accent-3/35 animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-2 border-dashed border-accent-5/22 animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <div class="relative w-full z-20 aspect-square max-w-sm mx-auto">
              <svg class="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 400 400" fill="none" >
              </svg>
              <img src="../assets/svg/orchestri-bot.svg" alt="Orchestri orchestrator" class="w-120 h-100 object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" title="Orchestri Bot" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 01 - SDLC Flow -->
    <section class="relative py-18 px-[5%] overflow-hidden" id="flow">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,rgba(236,72,153,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

        <div class="relative z-20">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none" aria-hidden="true">01</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-2 relative z-10 font-display">SDLC Flow</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-primary-900 my-2 relative z-10">Gated workflow from spec to deploy</h2>
          <p class="text-[15px] text-neutral-600 leading-relaxed max-w-115 font-primary">The orchestrator FSM moves each run through specification, approvals, planning, code generation, subprocess testing, debug retries, and deployment confirmation — with human gates at every critical step.</p>
        </div>

        <div class="relative z-10 flex items-center justify-center">
          <div class="relative w-full max-w-full">
            <div class="rounded-2xl overflow-hidden border border-neutral-300/80 shadow-[0_22px_56px_rgba(15,23,42,0.1)] bg-white transition-all duration-350 hover:shadow-[0_28px_64px_rgba(88,28,135,0.14)] hover:-translate-y-1 hover:scale-[1.01]">
              <img src="../assets/svg/orchestri-flow.svg" alt="Orchestri SDLC workflow" class="w-full min-h-[280px] block" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 02 - Product UI -->
    <section class="relative py-18 px-[5%] overflow-hidden bg-neutral-100" id="dashboard">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute left-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,rgba(139,92,246,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

        <div class="relative z-10 flex items-center justify-center order-last md:order-first">
          <div class="relative w-full max-w-140 mx-auto">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,rgba(236,72,153,0.08)_45%,transparent_72%)] blur-sm animate-[showcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            <div class="relative z-10 w-full mx-auto p-4.5 rounded-[18px] bg-white/92 border border-neutral-300/80 shadow-[0_20px_52px_rgba(15,23,42,0.09)] transition-all duration-350">
              <div class="relative z-10 grid grid-cols-1 gap-2.5">
                <div class="bg-neutral-50 border border-neutral-300/60 rounded-[14px] p-[10px_10px_8px] transition-all hover:border-accent-3/40 hover:shadow-md">
                  <span class="block text-[9px] font-bold tracking-wider uppercase text-neutral-500 mb-2 pl-0.5 font-display">Pipeline progress</span>
                  <div class="overflow-hidden rounded-[10px] bg-white border border-neutral-100">
                    <img src="../assets/images/orchestri-pipeline-progress.png" alt="Orchestri pipeline progress" class="w-full block" />
                  </div>
                </div>
                <div class="bg-neutral-50 border border-neutral-300/60 rounded-[14px] p-[10px_10px_8px] transition-all hover:border-accent-3/40 hover:shadow-md [animation-delay:0.8s]">
                  <span class="block text-[9px] font-bold tracking-wider uppercase text-neutral-500 mb-2 pl-0.5 font-display">Workflow console</span>
                  <div class="overflow-hidden rounded-[10px] bg-white border border-neutral-100">
                    <img src="../assets/images/orchestri-workflow-ui.png" alt="Orchestri workflow console" class="w-full block" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-20">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none" aria-hidden="true">02</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-2 relative z-10 font-display">Product UI</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-primary-900 my-2 relative z-10">Pipeline progress and workflow console</h2>
          <p class="text-[15px] text-neutral-600 leading-relaxed max-w-115 font-primary">Track every stage from Setup to Deploy on the pipeline bar, then work through Specification, Plan, Implementation, Testing, and Commit in the sidebar workflow — with revision feedback and commit-and-push built in.</p>

          <div class="flex flex-wrap items-center gap-2.5 mt-4.5">
            <div class="inline-flex items-center gap-1.75 px-3.5 py-1.5 rounded-full bg-accent-3/10 border border-accent-3/35 text-[10px] font-bold tracking-widest text-accent-3/80 animate-[livePulse_2.2s_ease-in-out_infinite] font-display" aria-label="Live data">
              <span class="w-2 h-2 rounded-full bg-accent-1 animate-[liveDot_1.8s_ease-in-out_infinite]"></span>
              <span>PRODUCT UI</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="(stat, i) in pipelineStats" :key="i"
                    class="text-[11px] text-neutral-500 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-300/60 animate-[chipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both] font-primary"
                    :style="i > 0 ? { animationDelay: `${i * 0.08}s` } : {}">
                <strong class="text-primary-900 font-bold mr-1">{{ stat.value }}</strong>{{ stat.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 03 - Multi-Agent SDLC -->
    <section class="relative py-18 px-[5%] overflow-hidden" id="workflows">
      <div class="max-w-280 mx-auto">
        <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr] gap-[clamp(28px,5vw,56px)] items-center mb-7">
          <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,rgba(236,72,153,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

          <div class="relative z-20">
            <span class="block font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none" aria-hidden="true">03</span>
            <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-2 relative z-10 font-display">Multi-Agent SDLC</span>
            <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-primary-900 my-2 relative z-10">
              Specialized agents. <em class="not-italic bg-gradient-to-r from-secondary-500 to-accent-3 bg-clip-text text-transparent">One orchestrator.</em>
            </h2>
            <p class="text-[15px] text-neutral-600 leading-relaxed max-w-115 font-primary">Spec, plan, code, and debug agents coordinate through the FSM — with subprocess test runs, deploy commands from the approved plan, and optional desktop .exe for localhost workflows.</p>
          </div>

          <div class="relative z-10 flex items-center justify-center">
            <div class="relative w-[min(280px,80%)] md:w-[min(320px,88%)] mx-auto animate-[visualFloat_6s_ease-in-out_infinite]">
              <div class="absolute inset-5 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22)_0%,transparent_68%)] animate-[voiceGlow_3.5s_ease-in-out_infinite]"></div>
              <div class="absolute inset-[-8%] rounded-full border-2 border-dashed border-neutral-400/30 animate-[botRingSpin_24s_linear_infinite]"></div>
              <div class="absolute inset-[-18%] rounded-full border-2 border-dashed border-accent-5/22 animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
              <img src="../assets/svg/orchestri-agent-bot.svg" alt="Orchestri multi-agent workflow" class="w-full block relative z-10 drop-shadow-[0_22px_48px_rgba(42,95,158,0.2)]" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article v-for="(card, i) in orchestriCards" :key="i"
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

    <!-- Section 04 - Platform -->
    <section class="relative py-18 px-[5%] overflow-hidden bg-neutral-100">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute left-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,rgba(245,158,11,0.1)_50%,transparent_72%)]" aria-hidden="true"></div>

        <div class="relative z-10 flex items-center justify-center order-last md:order-first">
          <div class="relative w-full max-w-140 mx-auto animate-[visualFloat_6s_ease-in-out_infinite]">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,rgba(245,158,11,0.1)_50%,transparent_72%)] blur-sm animate-[showcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            <div class="absolute -inset-1.5 rounded-[22px] border-2 border-dashed border-accent-3/35 animate-[botRingSpin_26s_linear_infinite] pointer-events-none"></div>
            <div class="relative z-10 rounded-2xl overflow-hidden border border-neutral-300/80 shadow-[0_22px_56px_rgba(15,23,42,0.1)] bg-white transition-all duration-350 min-h-75 md:min-h-85 hover:shadow-[0_28px_64px_rgba(88,28,135,0.14)] hover:-translate-y-1 hover:scale-[1.01]">
              <img src="../assets/svg/orchestri-capabilities.svg" alt="Orchestri platform capabilities" class="w-full min-h-80 block" />
            </div>
          </div>
        </div>

        <div class="relative z-20">
          <span class="block font-display text-[clamp(76px,13vw,148px)] font-bold leading-[0.82] tracking-[-5px] text-primary-900/[0.065] pointer-events-none select-none" aria-hidden="true">04</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-2 relative z-10 font-display">Platform</span>
          <h2 class="font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.8px] leading-[1.15] text-primary-900 my-2 relative z-10">Monorepo, desktop, and cloud-ready</h2>
          <p class="text-[15px] text-neutral-600 leading-relaxed max-w-115 font-primary">FastAPI backend with local DATA_DIR storage, React UI with SSE, Windows .exe and macOS .app builds, plus local folder bridge for hosted UI + local disk.</p>

          <ul class="mt-4.5 flex flex-col gap-2.5 list-none p-0">
            <li v-for="(feat, i) in platformFeatures" :key="i"
                class="flex gap-4 items-start p-[14px_16px] bg-white border border-neutral-300/50 rounded-xl shadow-sm animate-[featIn_0.6s_ease_both] font-primary"
                :style="i > 0 ? { animationDelay: `${i * 0.07}s` } : {}">
              <span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-accent-3/10 text-accent-3">
                <i :class="feat.icon"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-primary-800 font-display">{{ feat.title }}</h4>
                <p class="text-xs text-neutral-500 mt-0.5 font-primary">{{ feat.desc }}</p>
              </div>
            </li>
          </ul>

          <p class="text-left text-sm text-neutral-500 mt-4 ml-15 font-primary">
            Need voice or chat products? See <a href="/ai-agent" class="text-secondary-700 underline font-semibold hover:underline">Voice AI Agent</a> and <a href="/chatbot" class="text-secondary-700 underline font-semibold hover:underline">Chatbot</a>.
          </p>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="relative py-18 px-[5%] overflow-hidden bg-neutral-100" id="pricing">
      <div class="max-w-285 mx-auto text-center mb-12">
        <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-4 font-display">Pricing</span>
        <h2 class="font-display text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-1px] leading-[1.15] text-primary-900 mb-4">
          Orchestri plans for every team size
        </h2>
        <p class="text-[15px] text-neutral-600 leading-relaxed max-w-2xl mx-auto font-primary">
          Desktop builds, hosted bridge, and multi-agent SDLC automation — pick the tier that fits your engineering workflow.
        </p>

        <!-- Billing Toggle -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <span class="text-sm font-medium font-primary" :class="billingType === 'monthly' ? 'text-primary-900' : 'text-neutral-400'">Monthly</span>
          <button
              @click="toggleBilling"
              class="relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none"
              :class="billingType === 'yearly' ? 'bg-secondary-600' : 'bg-neutral-300'"
          >
            <span
                class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300"
                :class="billingType === 'yearly' ? 'translate-x-6' : 'translate-x-0'"
            ></span>
          </button>
          <span class="text-sm font-medium font-primary" :class="billingType === 'yearly' ? 'text-primary-900' : 'text-neutral-400'">
            Yearly
            <span class="ml-2 inline-block bg-success/10 text-success text-xs font-bold px-2 py-0.5 rounded-full font-display">Save 15%</span>
          </span>
        </div>
        <p v-if="billingType === 'yearly'" class="text-sm text-neutral-500 mt-3 font-primary">
          Billed yearly — save 15%
        </p>
      </div>

      <div class="max-w-285 mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div v-for="(plan, index) in getPricingPlans()" :key="index"
             class="bg-white rounded-2xl border shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 relative"
             :class="plan.featured ? 'border-2 border-secondary-600 md:scale-105' : 'border-neutral-300/80'">
          <div v-if="plan.featured" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span class="inline-block bg-secondary-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full font-display">Most Popular</span>
          </div>
          <div class="mb-6" :class="plan.featured ? 'mt-2' : ''">
            <span class="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 font-display"
                  :class="plan.badgeClass">{{ plan.name }}</span>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold text-primary-900 font-display">{{ plan.price }}</span>
              <span v-if="plan.period" class="text-sm text-neutral-500 font-primary">{{ plan.period }}</span>
            </div>
            <p class="text-sm text-neutral-500 mt-2 font-primary">{{ plan.description }}</p>
          </div>
          <ul class="space-y-3 mb-8">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex"
                class="flex items-start gap-3 text-sm font-primary"
                :class="feature.included ? 'text-neutral-700' : 'text-neutral-500 opacity-60'">
              <i :class="feature.included ? 'fas fa-check ' + plan.checkColor + ' mt-1' : 'fas fa-minus mt-1'"></i>
              <span>{{ feature.text }}</span>
            </li>
          </ul>
          <a :href="plan.ctaLink" class="block w-full text-center px-6 py-3 font-semibold rounded-xl transition-colors text-sm font-primary"
             :class="plan.ctaClass">
            {{ plan.ctaText }}
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="bg-secondary-700 text-white p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl">
        <div class="max-w-2xl">
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight font-display mb-2">Ready to orchestrate your SDLC?</h2>
          <p class="text-white/90 text-sm md:text-base leading-relaxed font-primary">Start orchestrating spec, plan, implement, test, and deploy with human gates and multi-agent automation.</p>
        </div>
        <div class="flex gap-3 flex-wrap items-center">
          <button
              @click="goToContact"
              type="button"
              class="px-6 py-3.5 bg-white text-secondary-600 font-bold rounded-xl shadow-md transition-transform hover:bg-secondary-50 text-sm cursor-pointer inline-flex items-center justify-center font-primary"
          >
            Contact Sales
          </button>
          <button
              @click="scrollToPricing"
              type="button"
              class="px-6 py-3.5 border border-white/80 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm cursor-pointer inline-flex items-center justify-center font-primary"
          >
            View Pricing
          </button>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import Footer from '../components/footer.vue'
import Navbar from '../components/navbar.vue'

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
  name: 'OrchestriComponent',
  components: { Footer, Navbar },

  data() {
    return {
      billingType: 'monthly',
      gridCells: CELL_CONFIGS,

      pipelineStats: [
        { value: '7', label: 'pipeline stages' },
        { value: 'Workflow', label: 'tab' },
        { value: 'Commit', label: 'and push' },
      ],

      orchestriCards: [
        { tag: 'Agent', title: 'Spec agent', desc: 'Draft requirements from your prompt with structured spec artifacts.', hex: '#6366F1', delay: '0s' },
        { tag: 'Agent', title: 'Plan agent', desc: 'Break work into tasks, tests, and deploy steps for approval.', hex: '#14B8A6', delay: '0.6s' },
        { tag: 'Agent', title: 'Code agent', desc: 'Implement changes in your project directory on the local filesystem.', hex: '#2A5F9E', delay: '1.2s' },
        { tag: 'Control', title: 'User approvals', desc: 'Gate spec, plan, deploy, and finish with explicit approve/revise actions.', hex: '#F59E0B', delay: '0.3s' },
        { tag: 'Control', title: 'Test / debug loop', desc: 'Subprocess pytest runs with configurable debug retries.', hex: '#818CF8', delay: '0.9s' },
        { tag: 'Control', title: 'VCS connect', desc: 'GitHub and Bitbucket OAuth with commit-and-push actions.', hex: '#059669', delay: '1.5s' },
      ],

      platformFeatures: [
        {
          icon: 'fas fa-plug ',
          title: 'FastAPI orchestrator',
          desc: 'Runs, actions, events.jsonl, and subprocess test/deploy with timeouts.',
        },
        {
          icon: 'fas fa-display',
          title: 'React run console',
          desc: 'SSE stream, polling, approve/revise, and project folder picker.',
        },
        {
          icon: 'fas fa-desktop',
          title: 'Desktop builds',
          desc: 'Orchestri.exe / Orchestri.app — localhost API, browser UI, %APPDATA% data.',
        },
      ],

      pricingPlans: [
        {
          name: 'Starter',
          badgeClass: 'text-accent-3 bg-accent-3/10',
          price: '₨85,000',
          period: '/ mo',
          description: 'Desktop builds and basic SDLC automation for small teams.',
          featured: false,
          checkColor: 'text-accent-3',
          features: [
            { text: '1 orchestrator agent', included: true },
            { text: '50 runs / mo', included: true },
            { text: 'Basic workflow', included: true },
            { text: 'Local DATA_DIR storage', included: true },
            { text: 'Desktop .exe build', included: true },
          ],
          ctaText: 'Get Started',
          ctaClass: 'bg-secondary-700 border border-neutral-300 text-white hover:bg-secondary-800',
          ctaLink: '/contact'
        },
        {
          name: 'Business',
          badgeClass: 'text-secondary-600 bg-secondary-50',
          price: '₨210,000',
          period: '/ mo',
          description: 'Full multi-agent orchestration for growing engineering teams.',
          featured: true,
          checkColor: 'text-secondary-500',
          features: [
            { text: '5 orchestrator agents', included: true },
            { text: '200 runs / mo', included: true },
            { text: 'Advanced workflow', included: true },
            { text: 'VCS integration', included: true },
            { text: 'Priority support', included: true },
            { text: 'Desktop .exe & .app builds', included: true },
          ],
          ctaText: 'Get Started',
          ctaClass: 'bg-secondary-700 text-white hover:bg-secondary-800 shadow-md hover:shadow-lg',
          ctaLink: '/contact'
        },
        {
          name: 'Enterprise',
          badgeClass: 'text-accent-3 bg-accent-3/10',
          price: 'Custom',
          period: '',
          description: 'Large-scale SDLC orchestration with dedicated infrastructure.',
          featured: false,
          checkColor: 'text-accent-3',
          features: [
            { text: 'Unlimited orchestrator agents', included: true },
            { text: 'Custom runs', included: true },
            { text: 'Custom workflows', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Advanced analytics & insights', included: true },
            { text: '24/7 support', included: true },
          ],
          ctaText: 'Contact Sales',
          ctaClass: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100',
          ctaLink: '/contact'
        }
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
  },

  methods: {
    toggleBilling() {
      this.billingType = this.billingType === 'monthly' ? 'yearly' : 'monthly'
    },

    getPricingPlans() {
      const monthlyPrices = {
        'Starter': '₨85,000',
        'Business': '₨210,000',
        'Enterprise': 'Custom'
      }
      const yearlyPrices = {
        'Starter': '₨72,250',
        'Business': '₨178,500',
        'Enterprise': 'Custom'
      }

      const prices = this.billingType === 'monthly' ? monthlyPrices : yearlyPrices
      const period = this.billingType === 'monthly' ? '/ month' : '/ year'

      return this.pricingPlans.map(plan => ({
        ...plan,
        price: prices[plan.name] || plan.price,
        period: plan.name === 'Enterprise' ? '' : period
      }))
    },

    goToContact() {
      this.$router.push('/contact?project=orchestri')
    },

    scrollToPricing() {
      const pricingSection = document.getElementById('pricing')
      if (pricingSection) {
        pricingSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
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

@keyframes showcaseGlow {
  0%, 100% { opacity: 0.65; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1.03); }
}

@keyframes visualFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes livePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

@keyframes liveDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
  50% { box-shadow: 0 0 0 7px rgba(52,211,153,0); }
}

@keyframes chipPop {
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to { opacity: 1; transform: none; }
}

@keyframes voiceGlow {
  0%, 100% { opacity: 0.6; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.04); }
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes featIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: none; }
}

@keyframes shine-loop {
  0% { transform: translateX(-150%) skewX(-12deg); }
  40% { transform: translateX(250%) skewX(-12deg); }
  50% { transform: translateX(250%) skewX(-12deg); }
  90% { transform: translateX(-150%) skewX(-12deg); }
  100% { transform: translateX(-150%) skewX(-12deg); }
}

.animate-shine-loop {
  animation: shine-loop 2s ease-in-out infinite;
}
</style>