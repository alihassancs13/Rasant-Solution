<template>
  <div data-page="ai-agent" class="bg-[#f8fafc] min-h-screen font-sans text-[#1e293b]">
    <Navbar />

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
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-4">Voice AI Agent</span>
          <h1 class="font-['Space_Grotesk'] text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1px] leading-[1.15] mb-4 text-slate-900">
            Talking agents with <em class="not-italic bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">clear, natural voice</em>
          </h1>
          <p class="text-[15px] text-slate-500 leading-relaxed mb-6">Phone-first AI that handles customer service calls, internal dialing, outbound campaigns, and scheduled callbacks — with live queue visibility and call analytics built in.</p>
          <div class="flex justify-start gap-3 flex-wrap">
            <button
                @click="goToContact"
                type="button"
                class="relative overflow-hidden cursor-pointer w-50 flex items-center justify-center px-6 py-3.5 bg-orange-700 hover:bg-orange-900 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group"
            >
              Book a Voice Demo
              <div class="absolute inset-0 w-1/4 h-full bg-white/10 pointer-events-none animate-shine-loop"></div>
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
                <circle cx="200" cy="200" r="160"
                        stroke="#93c5fd" stroke-width="2" stroke-dasharray="8 6" opacity="0.6"
                        class="animate-[spin_20s_linear_infinite]" style="transform-origin: 200px 200px; animation-direction: reverse;" />

                <circle cx="200" cy="200" r="130"
                        stroke="#60a5fa" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"
                        class="animate-[spin_12s_linear_infinite]" style="transform-origin: 200px 200px;" />
              </svg>

              <img src="../assets/svg/ai-agent-bot.svg" alt="Chatbot agent" class="w-full h-full object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" title="Chatbot Agent" />

              <img src="../assets/images/ai-agent-face.png" alt="Bot face" class="absolute top-[22%] left-1/2 -translate-x-1/2 w-[55%] object-contain z-30" title="Bot Face" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden" id="flow">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

        <div class="relative z-20">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">01</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 relative z-10">Call Flow</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">From ring to resolution on the phone</h2>
          <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">Route every call through speech recognition, intent handling, and smart transfer — so callers get answers on the line without waiting in silence.</p>
        </div>

        <div class="relative z-10 flex items-center justify-center">
          <div class="relative w-full max-w-full">
            <img src="../assets/svg/ai-agent-voice-flow.svg" title="Voice AI agent call flow" class="w-full min-h-[280px] block" />

            <img
                src="../assets/images/ai-agent-face.png"
                alt="Bot face"
                class="absolute top-[42%] left-[34.5%] -translate-x-1/2 -translate-y-1/2 w-[7%] min-w-[45px] max-w-[65px] h-auto z-10"
                title="Bot Face"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden bg-slate-50" id="dashboard">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute left-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(74,144,226,0.2)_0%,rgba(20,184,166,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

        <div class="relative z-10 flex items-center justify-center order-last md:order-first">
          <div class="relative w-full max-w-140 mx-auto">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(74,144,226,0.08)_45%,transparent_72%)] blur-sm animate-[aaShowcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            <div
              id="dashCockpit"
              @mousemove="handleParallax"
              @mouseleave="resetParallax"
              :style="parallaxStyle"
              class="relative z-10 w-full mx-auto p-4.5 rounded-[18px] bg-white/92 border border-slate-200/80 shadow-[0_20px_52px_rgba(15,23,42,0.09)] transition-all duration-350 ease-out animate-[aaVisualFloat_7s_ease-in-out_infinite]"
            >
              <div class="relative z-10 grid grid-cols-1 gap-2.5">
                <div class="bg-[#fafbfc] border border-slate-200/60 rounded-[14px] p-[10px_10px_8px] animate-[aaTileFloat_5s_ease-in-out_infinite] transition-all hover:border-teal-400/40 hover:shadow-md">
                  <span class="block text-[9px] font-extrabold tracking-wider uppercase text-slate-500 mb-2 pl-0.5">Scheduled queue</span>
                  <div class="overflow-hidden rounded-[10px] bg-white border border-slate-100 h-[170px] md:h-[108px]">
                    <img src="../assets/svg/ai-agent-scheduled-calls.svg" alt="Scheduled calls overview" class="w-full block -mt-1.5" />
                  </div>
                </div>

                <div class="bg-[#fafbfc] border border-slate-200/60 rounded-[14px] p-[10px_10px_8px] animate-[aaTileFloat_5s_ease-in-out_infinite] [animation-delay:0.8s] transition-all hover:border-teal-400/40 hover:shadow-md">
                  <span class="block text-[9px] font-extrabold tracking-wider uppercase text-slate-500 mb-2 pl-0.5">Activity and usage</span>
                  <div class="grid grid-cols-1 sm:grid-cols-[0.42fr_0.58fr] gap-2">
                    <div class="overflow-hidden rounded-[10px] bg-white border border-slate-100 h-[150px] md:h-[108px]">
                      <img src="../assets/svg/ai-agent-analytics.svg" alt="Analytics summary" class="w-full block" />
                    </div>
                    <div class="overflow-hidden rounded-[10px] bg-[#fafbfc] border border-slate-100 h-[150px] md:h-[108px] flex items-center justify-center">
                      <img src="../assets/images/agent_graphs.png" alt="Activity trend charts" class="w-[118%] h-auto block scale-[0.88] origin-center" width="1100" height="420" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-20">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">02</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 relative z-10">Live Dashboards</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">Monitor every call in real time</h2>
          <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">See queues, live volume, and agent activity in one glance — from scheduled callbacks to activity trends.</p>


          <div class="flex flex-wrap items-center gap-2.5 mt-4.5">
            <div class="inline-flex items-center gap-1.75 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/35 text-[10px] font-extrabold tracking-widest text-teal-800 animate-[aaLivePulse_2.2s_ease-in-out_infinite]" aria-label="Live data">
              <span class="w-2 h-2 rounded-full bg-[#34D399] animate-[aaLiveDot_1.8s_ease-in-out_infinite]"></span>
              <span>LIVE</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="(stat, i) in liveStats" :key="i"
                class="text-[11px] text-slate-500 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-slate-200/60 animate-[aaChipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]"
                :style="i > 0 ? { animationDelay: `${i * 0.08}s` } : {}">
                <strong class="text-slate-900 font-extrabold mr-1">{{ stat.value }}</strong>{{ stat.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden" id="workflows">
      <div class="max-w-280 mx-auto">
        <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr] gap-[clamp(28px,5vw,56px)] items-center mb-7">
          <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

          <div class="relative z-20">
            <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">03</span>
            <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 relative z-10">Voice Workflows</span>
            <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">
              Built for real calls. <em class="not-italic bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">Operator-grade control.</em>
            </h2>
            <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">Customer lines, internal dialing, and outbound campaigns — with clear speech, live queues, and smart routing in one voice stack.</p>
          </div>

          <div class="relative z-10 flex items-center justify-center">
            <div class="relative w-[min(280px,80%)] md:w-[min(320px,88%)] mx-auto animate-[aaVisualFloat_6s_ease-in-out_infinite]">
              <div class="absolute inset-5 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22)_0%,transparent_68%)] animate-[aaVoiceGlow_3.5s_ease-in-out_infinite]"></div>
              <div class="absolute inset-[-8%] rounded-full border-2 border-dashed border-slate-400/30 animate-[aaBotRingSpin_24s_linear_infinite]"></div>
              <div class="absolute inset-[-18%] rounded-full border-2 border-dashed border-sky-400/20 animate-[aaBotRingSpin_30s_linear_infinite_reverse]"></div>

              <img
                  src="../assets/svg/ai-agent-phone-bot.svg"
                  alt="Voice AI agent on a call"
                  class="w-full block relative z-10 drop-shadow-[0_22px_48px_rgba(42,95,158,0.2)]"
              />

              <img
                  src="../assets/images/ai-agent-face.png"
                  alt="Bot face"
                  class="absolute top-1/2 left-[46%] -translate-x-1/2 -translate-y-1/2 w-[50%] h-auto z-20 animate-[aaBotObjBob_5s_ease-in-out_infinite]"
                  title="Bot Face"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article v-for="(card, i) in workflowCards" :key="i"
            :class="[
              'group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden',
              'transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]',
              'animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused]',
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

    <section class="relative py-18 px-[5%] overflow-hidden bg-slate-50">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute left-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 blur-[52px] bg-[radial-gradient(circle,rgba(74,144,226,0.2)_0%,rgba(20,184,166,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>

        <div class="relative z-10 flex items-center justify-center order-last md:order-first">
          <div class="relative w-full max-w-140 mx-auto animate-[aaVisualFloat_6s_ease-in-out_infinite]">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.22)_0%,rgba(20,184,166,0.1)_50%,transparent_72%)] blur-sm animate-[aaShowcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            <div class="absolute -inset-1.5 rounded-[22px] border-2 border-dashed border-teal-500/35 animate-[aaBotRingSpin_26s_linear_infinite] pointer-events-none"></div>

            <div class="relative z-10 rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_22px_56px_rgba(15,23,42,0.1)] bg-white transition-all duration-350 min-h-75 md:min-h-85 hover:shadow-[0_28px_64px_rgba(15,76,129,0.14)] hover:-translate-y-1 hover:scale-[1.01]">
              <img src="../assets/svg/ai-agent-capabilities.svg" alt="Voice AI capabilities and telephony integrations" class="w-full min-h-80 block" />

              <img src="../assets/images/ai-agent-face.png" alt="Bot Face" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] object-contain z-20" title="Bot Face" />
            </div>
          </div>
        </div>

        <div class="relative z-20">
          <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">04</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 relative z-10">Capabilities</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">Everything a voice agent needs</h2>
          <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">Recordings, warm transfer, and telephony integrations — the full toolkit for production voice deployments.</p>

          <ul class="mt-4.5 flex flex-col gap-2.5 list-none p-0">
            <li v-for="(feat, i) in capabilityFeatures" :key="i"
                class="flex gap-4 items-start p-[14px_16px] bg-white border border-slate-200/50 rounded-xl shadow-sm animate-[aaFeatIn_0.6s_ease_both]"
                :style="i > 0 ? { animationDelay: `${i * 0.07}s` } : {}"><span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-teal-50 text-teal-700">
  <i :class="feat.icon"></i>
</span>
              <div>
                <h4 class="text-sm font-bold text-slate-800">{{ feat.title }}</h4>
                <p class="text-xs text-slate-500 mt-0.5">{{ feat.desc }}</p>
              </div>
            </li>
          </ul>

          <p class="text-left text-sm text-slate-500 mt-4 mb-0">
            Looking for text and chat automation? See our <a href="chatbot.html" class="text-orange-600 font-semibold hover:underline">Chatbot Agent</a>.
          </p>
        </div>
      </div>
    </section>
    <!-- In your template -->
    <!-- Pricing Section -->
    <!-- Pricing Section -->
    <!-- Pricing Section -->
    <section class="relative py-18 px-[5%] overflow-hidden bg-slate-50" id="pricing">
      <div class="max-w-285 mx-auto text-center mb-12">
        <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-4">Pricing</span>
        <h2 class="font-['Space_Grotesk'] text-[clamp(28px,3.5vw,42px)] font-extrabold tracking-[-1px] leading-[1.15] text-slate-900 mb-4">
          Voice agent plans that scale <br>with your calls
        </h2>
        <p class="text-[15px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          From inbound support lines to outbound campaigns — every plan includes recordings, warm transfer, and usage analytics.
        </p>

        <!-- Billing Toggle -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <span class="text-sm font-medium" :class="billingType === 'monthly' ? 'text-slate-900' : 'text-slate-400'">Monthly</span>
          <button
              @click="toggleBilling"
              class="relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none"
              :class="billingType === 'yearly' ? 'bg-orange-600' : 'bg-slate-300'"
          >
        <span
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300"
            :class="billingType === 'yearly' ? 'translate-x-6' : 'translate-x-0'"
        ></span>
          </button>
          <span class="text-sm font-medium" :class="billingType === 'yearly' ? 'text-slate-900' : 'text-slate-400'">
        Yearly
        <span class="ml-2 inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save 15%</span>
      </span>
        </div>
        <p v-if="billingType === 'yearly'" class="text-sm text-slate-500 mt-3">
          Billed yearly — save 15%
        </p>
      </div>

      <div class="max-w-285 mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div v-for="(plan, index) in getPricingPlans()" :key="index"
             class="bg-white rounded-2xl border shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 relative"
             :class="plan.featured ? 'border-2 border-orange-600 md:scale-105' : 'border-slate-200/80'">
          <div v-if="plan.featured" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span class="inline-block bg-orange-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">Most Popular</span>
          </div>
          <div class="mb-6" :class="plan.featured ? 'mt-2' : ''">
        <span class="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
              :class="plan.badgeClass">{{ plan.name }}</span>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-slate-900">{{ plan.price }}</span>
              <span v-if="plan.period" class="text-sm text-slate-500">{{ plan.period }}</span>
            </div>
            <p class="text-sm text-slate-500 mt-2">{{ plan.description }}</p>
          </div>
          <ul class="space-y-3 mb-8">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex"
                class="flex items-start gap-3 text-sm"
                :class="feature.included ? 'text-slate-700' : 'text-slate-500 opacity-60'">
              <i :class="feature.included ? 'fas fa-check ' + plan.checkColor + ' mt-1' : 'fas fa-minus mt-1'"></i>
              <span>{{ feature.text }}</span>
            </li>
          </ul>
          <a :href="plan.ctaLink" class="block w-full text-center px-6 py-3 font-semibold rounded-xl transition-colors text-sm"
             :class="plan.ctaClass">
            {{ plan.ctaText }}
          </a>
        </div>
      </div>
    </section>
    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="bg-orange-700 text-white p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl">
        <div class="max-w-2xl">
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight font-['Space_Grotesk'] mb-2">Ready to deploy a voice agent?</h2>
          <p class="text-white text-sm md:text-base leading-relaxed">Book a demo and hear how your calls can sound — customer service, internal lines, and outbound included.</p>
        </div>
        <div class="flex gap-3 flex-wrap items-center">
          <button
              @click="goToContact"
              type="button"
              class="px-6 py-3.5 bg-white text-orange-600 font-bold rounded-xl shadow-md transition-transform hover:scale-[1.02] text-sm cursor-pointer inline-flex items-center justify-center"
          >
            Contact Sales
          </button>
          <button
              @click="scrollToPricing"
              type="button"
              class="px-6 py-3 border border-slate-300 text-white font-semibold rounded-lg  transition-colors text-sm cursor-pointer"
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

// Grid cell config for hero side panels
const CELL_CONFIGS = [
  { bg: 'bg-[rgba(204,251,241,0.42)]' },
  { bg: 'bg-[rgba(224,242,254,0.4)]',  delay: '-0.9s' },
  { bg: 'bg-[rgba(219,234,254,0.38)]', delay: '-1.8s' },
  { bg: 'bg-[rgba(236,254,255,0.4)]',  delay: '-2.7s' },
  { bg: 'bg-[rgba(240,253,250,0.36)]', delay: '-3.6s' },
  { bg: 'bg-[rgba(239,246,255,0.42)]', delay: '-4.5s' },
  { bg: 'bg-[rgba(236,253,245,0.36)]', delay: '-5.4s' },
  { bg: 'bg-[rgba(224,231,255,0.38)]', delay: '-6.3s' },
  { bg: 'bg-[rgba(204,251,241,0.42)]' },
  { bg: 'bg-[rgba(219,234,254,0.38)]', delay: '-1.8s' },
  { bg: 'bg-[rgba(224,242,254,0.4)]',  delay: '-0.9s' },
  { bg: 'bg-[rgba(236,254,255,0.4)]',  delay: '-2.7s' },
  { bg: 'bg-[rgba(240,253,250,0.36)]', delay: '-3.6s' },
  { bg: 'bg-[rgba(239,246,255,0.42)]', delay: '-4.5s' },
  { bg: 'bg-[rgba(219,234,254,0.38)]', delay: '-1.8s' },
]

export default {
  name: 'AiAgentComponent',
  components: { Footer, Navbar },

  data() {
    return {
      parallaxStyle: { transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)' },
      billingType: 'monthly',
      gridCells: CELL_CONFIGS,

      liveStats: [
        { value: '12',  label: 'calls' },
        { value: '149', label: 'live' },
        { value: '2',   label: 'agents on' },
      ],

      workflowCards: [
        { tag: 'Use case', title: 'Customer service',    desc: 'Inbound support, FAQs, and warm handoff with full transcripts.',    hex: '#14B8A6', delay: '0s'   },
        { tag: 'Use case', title: 'Internal dialing',    desc: 'Extensions, department transfers, and staff announcements.',                hex: '#8B5CF6', delay: '0.6s' },
        { tag: 'Use case', title: 'Outbound campaigns',  desc: 'Reminders, follow-ups, and sales outreach on a live queue.',               hex: '#F59E0B', delay: '1.2s' },
        { tag: 'Control',  title: 'Natural, clear speech', desc: 'Human-like TTS and accurate STT — no robotic pacing.',                 hex: '#2A5F9E', delay: '0.3s' },
        { tag: 'Control',  title: 'Live call queue',     desc: 'Scheduled, active, and completed calls refresh automatically.',            hex: '#059669', delay: '0.9s' },
        { tag: 'Control',  title: 'Routing and analytics', desc: 'Resolve on the line, transfer when needed, track volume trends.',      hex: '#0F766E', delay: '1.5s' },
      ],

      capabilityFeatures: [
        {
          icon: 'fas fa-microphone',
          title: 'Recordings and logs',
          desc: 'Every call captured for review, training, and compliance.'
        },
        {
          icon: 'fas fa-graduation-cap',
          title: 'Warm transfer',
          desc: 'Pass context to a human agent when the caller needs a person.'
        },
        {
          icon: 'fas fa-plug',
          title: 'CRM and telephony hooks',
          desc: 'Connect to your phone system, CRM, and ticketing tools via API.'
        },
      ],

      pricingPlans: [
        {
          name: 'Starter',
          badgeClass: 'text-teal-600 bg-teal-50',
          price: '₨45,000',
          period: '/ mo',
          description: 'Inbound voice agents for customer lines and IVR replacement.',
          featured: false,
          checkColor: 'text-teal-500',
          features: [
            { text: '2 voice agents', included: true },
            { text: '200 voice minutes / mo', included: true },
            { text: 'Basic workflows', included: true },
            { text: 'Call recordings', included: true },
            { text: 'Usage analytics', included: true },
          ],
          ctaText: 'Get Started',
          ctaClass: 'bg-orange-700 border border-slate-300 text-white hover:bg-orange-800',
          ctaLink: '/contact'
        },
        {
          name: 'Business',
          badgeClass: 'text-orange-600 bg-orange-50',
          price: '₨125,000',
          period: '/ mo',
          description: 'For growing teams and businesses',
          featured: true,
          checkColor: 'text-orange-500',
          features: [
            { text: '10 voice agents', included: true },
            { text: '1,000 voice minutes / mo', included: true },
            { text: 'Advanced workflows', included: true },
            { text: 'Call recordings & logs', included: true },
            { text: 'Priority support', included: true },
            { text: 'Warm transfer', included: true },
          ],
          ctaText: 'Get Started',
          ctaClass: 'bg-orange-700 text-white hover:bg-orange-800 shadow-md hover:shadow-lg',
          ctaLink: '/contact'
        },
        {
          name: 'Enterprise',
          badgeClass: 'text-violet-600 bg-violet-50',
          price: 'Custom',
          period: '',
          description: 'For large-scale voice operations',
          featured: false,
          checkColor: 'text-violet-500',
          features: [
            { text: 'Unlimited voice agents', included: true },
            { text: 'Custom voice minutes', included: true },
            { text: 'Custom workflows', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Advanced analytics & insights', included: true },
            { text: '24/7 phone support', included: true },
          ],
          ctaText: 'Contact Sales',
          ctaClass: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
          ctaLink: '/contact'
        }
      ]
    }
  },

  methods: {
    scrollToPricing() {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    },
    goToContact() {
      // Option A: Using Vue Router (if configured)
      this.$router.push('/contact?project=ai-agent')

      // Option B: Using window.location
      // window.location.href = '/contact?project=ai-agent'
    },
    handleParallax(event) {
      const box = event.currentTarget.getBoundingClientRect()
      const rx = -((event.clientY - box.top  - box.height / 2) / (box.height / 2)) * 8
      const ry =  ((event.clientX - box.left - box.width  / 2) / (box.width  / 2)) * 8
      this.parallaxStyle.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
    },
    toggleBilling() {
      this.billingType = this.billingType === 'monthly' ? 'yearly' : 'monthly'
    },
    getPricingPlans() {
      const monthlyPrices = {
        'Starter': '₨45,000',
        'Business': '₨125,000',
        'Enterprise': 'Custom'
      }
      const yearlyPrices = {
        'Starter': '₨38,250',
        'Business': '₨106,250',
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
    resetParallax() {
      this.parallaxStyle.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    },
  },
}
</script>

<style scoped>
@keyframes aaMeshShift {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.9; }
  100% { transform: translate(1.5%, -1%) scale(1.04); opacity: 1; }
}
@keyframes aaOrbDrift {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(20px, -14px); }
}
@keyframes aaCellBreathe {
  0%, 100% { opacity: 0.28; transform: scale(1); }
  50%       { opacity: 0.62; transform: scale(1.015); }
}
@keyframes aaBotEnter {
  from { opacity: 0; transform: translateY(30px) scale(0.92); }
  to   { opacity: 1; transform: none; }
}
@keyframes aaBotRingSpin { to { transform: rotate(360deg); } }
@keyframes aaBotGlow {
  0%, 100% { opacity: 0.65; }
  50%       { opacity: 1; }
}
@keyframes aaShowcaseGlow {
  0%, 100% { opacity: 0.65; transform: scale(0.98); }
  50%       { opacity: 1; transform: scale(1.03); }
}
@keyframes aaVisualFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
@keyframes aaTileFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
@keyframes aaLivePulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.04); }
}
@keyframes aaLiveDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
  50%       { box-shadow: 0 0 0 7px rgba(52,211,153,0); }
}
@keyframes aaChipPop {
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to   { opacity: 1; transform: none; }
}
@keyframes aaVoiceGlow {
  0%, 100% { opacity: 0.6; transform: scale(0.96); }
  50%       { opacity: 1; transform: scale(1.04); }
}
@keyframes aaCardFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
@keyframes aaBotObjBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(100%) skewX(-12deg);
  }
}
</style>