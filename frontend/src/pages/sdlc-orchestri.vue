<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
    <Navbar />

    <section class="relative overflow-hidden bg-gradient-to-tr from-orange-50/40 via-white to-indigo-100/50 py-20 lg:py-32" id="top">
      <div class="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl"></div>
      <div class="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-7 space-y-6">
            <span class="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 ring-1 ring-inset ring-indigo-500/10">
              Orchestri
            </span>
            <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-display leading-tight">
              AI-driven multi-agent <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600">SDLC in one monorepo</span>
            </h1>
            <p class="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Web UI and FastAPI backend that drive a gated workflow: specification, user approval, plan, implementation, test/debug loop, deployment, and optional execution — on your local project folder.
            </p>
            <div class="flex flex-wrap gap-4 pt-2">
              <a href="contact.html?project=orchestri" class="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-orange-500 transition-colors duration-200">
                Request a Demo
              </a>
              <a href="pricing.html?project=orchestri" class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors duration-200">
                View Pricing
              </a>
            </div>
          </div>

          <div class="lg:col-span-5 flex justify-center relative">
            <img src="../assets/svg/orchestri-bot.svg" alt="Orchestri Orchestrator Vector Graphic" class="w-full max-w-[360px] h-auto object-contain drop-shadow-md" />
          </div>

        </div>
      </div>
    </section>

    <section class="py-24 bg-white border-y border-slate-100" id="flow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div class="lg:col-span-5 space-y-6 relative">
            <div class="absolute -top-12 left-0 text-8xl font-black text-slate-100/80 pointer-events-none select-none font-display">01</div>
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
              <img src="..//assets/images/orchestri-pipeline-progress.png" alt="Orchestri Product UI Management Console" class="w-full h-auto rounded-xl object-cover" />
            </div>
            <div class="oc-dash-img-wrap oc-dash-img-workflow">
            <img src="..//assets/images/orchestri-workflow-ui.png" alt="Orchestri workflow console with Specification, Plan, Implementation, Testing, and Commit" width="900" height="1100" loading="lazy" decoding="async"/>
          </div>
          </div>

          <div class="lg:col-span-5 space-y-6 relative">
            <div class="absolute -top-12 left-0 text-8xl font-black text-slate-200/60 pointer-events-none select-none font-display">02</div>
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
            <div class="absolute -top-12 left-0 text-8xl font-black text-slate-100 pointer-events-none select-none font-display">03</div>
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
            <div class="absolute -top-12 left-0 text-8xl font-black text-slate-200/60 pointer-events-none select-none font-display">04</div>
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