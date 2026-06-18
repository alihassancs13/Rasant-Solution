<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
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
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">Orchestri</span>
          <h1 class="font-['Space_Grotesk'] text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1px] leading-[1.15] mb-4 text-slate-900">
            AI-driven multi-agent <em class="not-italic bg-gradient-to-r from-orange-500 to-indigo-600 bg-clip-text text-transparent">SDLC in one monorepo</em>
          </h1>
          <p class="text-[15px] text-slate-500 leading-relaxed mb-6">Web UI and FastAPI backend that drive a gated workflow: specification, user approval, plan, implementation, test/debug loop, deployment, and optional execution — on your local project folder.</p>
          <div class="flex justify-start gap-3 flex-wrap">
            <a href="contact.html?project=orchestri" class="relative overflow-hidden cursor-pointer w-50 flex items-center justify-center px-6 py-3.5 bg-orange-700 hover:bg-orange-900 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(42,95,158,0.4)] hover:shadow-[0_6px_20px_rgba(42,95,158,0.6)] active:scale-[0.98] group">
              Contact Sales
              <div class="absolute inset-0 w-1/4 h-full bg-white/10 pointer-events-none animate-shine-loop"></div>
            </a>
            <a href="pricing.html?project=orchestri" class="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm">View Pricing</a>
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
              <img src="../assets/svg/orchestri-bot.svg" alt="Orchestri Orchestrator Vector Graphic" class="w-full h-full object-contain drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" title="Orchestri Bot" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-white border-y border-slate-100" id="flow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <div class="lg:col-span-5 space-y-6 relative">
            <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">01</span>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600">SDLC Flow</span>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Gated workflow from spec to deploy</h2>
            <p class="text-base leading-relaxed text-slate-600">
              The orchestrator FSM moves each run through specification, approvals, planning, code generation, subprocess testing, debug retries, and deployment confirmation — with human gates at every critical step.
            </p>
          </div>

          <div class="lg:col-span-7">
            <img src="../assets/svg/orchestri-flow.svg" alt="Gated SDLC Workflow Pipeline Diagram" class="w-full h-auto rounded-2xl border border-slate-100 shadow-xs" />
          </div>

        </div>
      </div>
    </section>

    <section class="py-24 bg-slate-50" id="dashboard">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div class="lg:col-span-7 order-last lg:order-first">
            <div class="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-2 overflow-hidden max-w-2xl mx-auto">
              <img src="../assets/images/orchestri-pipeline-progress.png" alt="Orchestri Product UI Management Console" class="w-full h-auto rounded-xl object-cover" />
            </div>
            <div class="oc-dash-img-wrap oc-dash-img-workflow">
            <img src="../assets/images/orchestri-workflow-ui.png" alt="Orchestri workflow console with Specification, Plan, Implementation, Testing, and Commit" width="900" height="1100" loading="lazy" decoding="async"/>
          </div>
          </div>

          <div class="lg:col-span-5 space-y-6 relative">
            <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">02</span>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600">Product UI</span>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pipeline progress and workflow console</h2>
            <p class="text-base leading-relaxed text-slate-600">
              Track every stage from Setup to Deploy on the pipeline bar, then work through Specification, Plan, Implementation, Testing, and Commit in the sidebar workflow — with revision feedback and commit-and-push built in.
            </p>

            
            <div class="pt-2 space-y-4">
              <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                PRODUCT UI
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-2xs"><strong>7</strong> pipeline stages</span>
                <span class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-2xs"><strong>Workflow</strong> tab</span>
                <span class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-2xs"><strong>Commit</strong> and push</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-24 bg-white" id="workflows">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-6 space-y-4 relative">
            <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">03</span>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600">Multi-Agent SDLC</span>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Specialized agents. <span class="text-indigo-600 italic">One orchestrator.</span>
            </h2>
            <p class="text-base leading-relaxed text-slate-600">
              Spec, plan, code, and debug agents coordinate through the FSM — with subprocess test runs, deploy commands from the approved plan, and optional desktop .exe for localhost workflows.
            </p>
          </div>

          <div class="lg:col-span-6 flex justify-center">
            <img src="../assets/svg/orchestri-agent-bot.svg" alt="Multi-Agent Orchestration Map Diagram" class="w-full max-w-[440px] h-auto object-contain" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article class="relative group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 border-t-4 border-t-indigo-500">
            <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 mb-3">Agent</span>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Spec agent</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Draft requirements from your prompt with structured spec artifacts.</p>
          </article>

          <article class="relative group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 border-t-4 border-t-teal-500">
            <span class="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 mb-3">Agent</span>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Plan agent</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Break work into tasks, tests, and deploy steps for approval.</p>
          </article>

          <article class="relative group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 border-t-4 border-t-blue-600">
            <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 mb-3">Agent</span>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Code agent</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Implement changes in your project directory on the local filesystem.</p>
          </article>

          <article class="relative group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 border-t-4 border-t-amber-500">
            <span class="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 mb-3">Control</span>
            <h3 class="text-lg font-bold text-slate-900 mb-2">User approvals</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Gate spec, plan, deploy, and finish with explicit approve/revise actions.</p>
          </article>

          <article class="relative group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 border-t-4 border-t-indigo-400">
            <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 mb-3">Control</span>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Test / debug loop</h3>
            <p class="text-sm text-slate-600 leading-relaxed">Subprocess pytest runs with configurable debug retries.</p>
          </article>

          <article class="relative group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 border-t-4 border-t-emerald-600">
            <span class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 mb-3">Control</span>
            <h3 class="text-lg font-bold text-slate-900 mb-2">VCS connect</h3>
            <p class="text-sm text-slate-600 leading-relaxed">GitHub and Bitbucket OAuth with commit-and-push actions.</p>
          </article>
        </div>

      </div>
    </section>

    <section class="py-24 bg-slate-50 border-t border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div class="lg:col-span-6">
            <img src="../assets/svg/orchestri-capabilities.svg" alt="Orchestri Platform Stack Core Capabilities Blueprint" class="w-full h-auto drop-shadow-sm" />
          </div>

          <div class="lg:col-span-6 space-y-6 relative">
            <span class="block font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/[0.065] pointer-events-none select-none" aria-hidden="true">04</span>
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600">Platform</span>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Monorepo, desktop, and cloud-ready</h2>
            <p class="text-base leading-relaxed text-slate-600">
              FastAPI backend with local DATA_DIR storage, React UI with SSE, Windows .exe and macOS .app builds, plus local folder bridge for hosted UI + local disk.
            </p>


            <ul class="space-y-4 pt-2">
              <li class="flex items-start gap-4">
                <span class="flex-none flex items-center justify-center w-12 h-8 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">API</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900">FastAPI orchestrator</h4>
                  <p class="text-xs text-slate-500 mt-0.5">Runs, actions, events.jsonl, and subprocess test/deploy with timeouts.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-none flex items-center justify-center w-12 h-8 rounded-lg bg-teal-600 text-white font-mono text-xs font-bold">UI</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900">React run console</h4>
                  <p class="text-xs text-slate-500 mt-0.5">SSE stream, polling, approve/revise, and project folder picker.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="flex-none flex items-center justify-center w-12 h-8 rounded-lg bg-slate-800 text-white font-mono text-xs font-bold">EXE</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900">Desktop builds</h4>
                  <p class="text-xs text-slate-500 mt-0.5">Orchestri.exe / Orchestri.app — localhost API, browser UI, %APPDATA% data.</p>
                </div>
              </li>
            </ul>

            <p class="text-xs text-slate-400 bg-slate-100 rounded-xl p-3 border border-slate-200/50 inline-block">
              Need voice or chat products? See <a href="ai-agent.html" class="text-indigo-600 hover:underline font-medium">Voice AI Agent</a> and <a href="chatbot.html" class="text-indigo-600 hover:underline font-medium">Chatbot</a>.
            </p>
          </div>

        </div>
      </div>
    </section>

    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl px-8 py-10 md:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          <div class="space-y-2 relative z-10 text-center md:text-left">
            <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">Ready to orchestrate your SDLC?</h2>
            <p class="text-orange-100 text-sm max-w-xl">
              Book a walkthrough of spec → plan → implement → test → deploy with human gates and multi-agent automation.
            </p>
          </div>
          <div class="flex flex-wrap gap-3 relative z-10 justify-center flex-none">
            <a href="contact.html?project=orchestri" class="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-50 transition-colors duration-200">
              Contact Sales
            </a>
            <a href="pricing.html?project=orchestri" class="inline-flex items-center justify-center rounded-xl bg-transparent border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200">
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
import Footer from '../components/footer.vue'
import Navbar from '../components/navbar.vue'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

.font-display {
  font-family: 'Space Grotesk', sans-serif;
}
</style>