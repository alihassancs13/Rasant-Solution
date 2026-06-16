<template>
  <div data-page="ai-agent" class="bg-[#f8fafc] min-h-screen font-sans text-[#1e293b]">
    <div class="relative z-50">
      <div 
        v-if="isDrawerOpen" 
        @click="isDrawerOpen = false" 
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
      ></div>
      
      <header class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a href="home.html" class="shrink-0" aria-label="Rasant Solutions home">
            <img src="@/assets/rasant-logo.svg" alt="Rasant Solutions" class="h-10 w-auto" width="212" height="42" decoding="async"/>
          </a>

          <nav class="hidden md:flex items-center gap-8 relative">
            <div class="group relative py-2">
              <a href="home.html#services" class="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">
                Services <i class="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
              </a>
              <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 p-2 grid gap-1 z-50">
                <a href="home.html#services" class="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors group/item">
                  <div class="flex gap-3 items-center">
                    <div class="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">SW</div>
                    <div>
                      <h4 class="text-sm font-bold text-slate-800">Custom Software</h4>
                      <p class="text-xs text-slate-500">Enterprise apps and APIs</p>
                    </div>
                  </div>
                  <span class="text-slate-400 group-hover/item:translate-x-1 transition-transform">&rarr;</span>
                </a>
                <a href="home.html#services" class="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50/50 transition-colors group/item">
                  <div class="flex gap-3 items-center">
                    <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">WM</div>
                    <div>
                      <h4 class="text-sm font-bold text-slate-800">Web and Mobile</h4>
                      <p class="text-xs text-slate-500">React, Flutter and Next.js</p>
                    </div>
                  </div>
                  <span class="text-slate-400 group-hover/item:translate-x-1 transition-transform">&rarr;</span>
                </a>
                <a href="home.html#services" class="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors group/item">
                  <div class="flex gap-3 items-center">
                    <div class="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">CL</div>
                    <div>
                      <h4 class="text-sm font-bold text-slate-800">Cloud and DevOps</h4>
                      <p class="text-xs text-slate-500">AWS and Kubernetes</p>
                    </div>
                  </div>
                  <span class="text-slate-400 group-hover/item:translate-x-1 transition-transform">&rarr;</span>
                </a>
              </div>
            </div>

            <div class="group relative py-2">
              <a href="home.html#products" class="flex items-center gap-1 text-sm font-bold text-teal-600">
                Projects <i class="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
              </a>
              <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-120 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 p-4 grid grid-cols-2 gap-3 z-50">
                <a href="#" class="p-3 border border-slate-100 rounded-lg hover:border-teal-100 hover:bg-teal-50/20 transition-all">
                  <div class="inline-block px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase rounded text-slate-600 mb-1">Call Center</div>
                  <h4 class="text-sm font-bold text-slate-800">Sentra AI</h4>
                  <p class="text-xs text-slate-500">AI call center platform</p>
                </a>
                <a href="ai-agent.html" class="p-3 border border-teal-100 bg-teal-50/30 rounded-lg transition-all">
                  <div class="inline-block px-2 py-0.5 bg-teal-100 text-[10px] font-bold uppercase rounded text-teal-700 mb-1">Voice</div>
                  <h4 class="text-sm font-bold text-teal-800">AI Agent</h4>
                  <p class="text-xs text-slate-500">Talking voice agents</p>
                </a>
                <a href="chatbot.html" class="p-3 border border-slate-100 rounded-lg hover:border-teal-100 hover:bg-teal-50/20 transition-all">
                  <div class="inline-block px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase rounded text-slate-600 mb-1">Chat</div>
                  <h4 class="text-sm font-bold text-slate-800">Chatbot</h4>
                  <p class="text-xs text-slate-500">Text and messaging bots</p>
                </a>
                <a href="orchestri.html" class="p-3 border border-slate-100 rounded-lg hover:border-teal-100 hover:bg-teal-50/20 transition-all">
                  <div class="inline-block px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase rounded text-slate-600 mb-1">SDLC</div>
                  <h4 class="text-sm font-bold text-slate-800">Orchestri</h4>
                  <p class="text-xs text-slate-500">AI multi-agent dev workflow</p>
                </a>
              </div>
            </div>

            <a href="contact.html" class="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Contact</a>
          </nav>

          <div class="hidden md:flex items-center gap-4">
            <a href="login.html" class="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">Login</a>
            <a href="contact.html?project=ai-agent" class="relative overflow-hidden px-5 py-2 bg-linear-to-r from-teal-500 to-indigo-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700">Get Quote</a>
          </div>

          <button @click="isDrawerOpen = !isDrawerOpen" class="md:hidden flex flex-col justify-between w-6 h-4 z-50 group" aria-label="Open menu">
            <span :class="['w-full h-0.5 bg-slate-800 transition-all duration-300 origin-left', isDrawerOpen ? 'rotate-45 translate-x-0.5 -translate-y-px' : '']"></span>
            <span :class="['w-full h-0.5 bg-slate-800 transition-all duration-300', isDrawerOpen ? 'opacity-0 scale-0' : '']"></span>
            <span :class="['w-full h-0.5 bg-slate-800 transition-all duration-300 origin-left', isDrawerOpen ? '-rotate-45 translate-x-0.5 translate-y-px' : '']"></span>
          </button>
        </div>
      </header>

      <nav :class="['fixed top-0 right-0 bottom-0 w-72 bg-white border-l border-slate-100 shadow-2xl z-40 pt-24 px-6 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out', isDrawerOpen ? 'translate-x-0' : 'translate-x-full']">
        <a href="home.html#services" class="text-base font-semibold text-slate-700 py-2 border-b border-slate-50">Services</a>
        <a href="home.html#products" class="text-base font-semibold text-slate-700 py-2 border-b border-slate-50">Projects</a>
        <a href="ai-agent.html" class="text-base font-bold text-teal-600 py-2 border-b border-slate-50">Voice AI Agent</a>
        <a href="contact.html" class="text-base font-semibold text-slate-700 py-2 border-b border-slate-50">Contact</a>
        <a href="login.html" class="text-base font-semibold text-slate-700 py-2 border-b border-slate-50">Login</a>
        <a href="contact.html?project=ai-agent" class="mt-4 text-center py-3 bg-teal-600 text-white font-bold rounded-lg shadow">Get a Free Quote</a>
      </nav>
    </div>

    <section class="relative pt-17 pb-0 overflow-hidden bg-[linear-gradient(180deg,#fdf4ff_0%,#fff8f3_38%,#f8fafc_100%)]" id="top">
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.12)_0%,transparent_45%)] animate-[aaMeshShift_10s_ease-in-out_infinite_alternate]"></div>
      
      <div class="absolute rounded-full filter blur-[70px] pointer-events-none w-80 h-80 bg-[rgba(255,213,180,0.45)] -top-5 -left-20 animate-[aaOrbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full filter blur-[70px] pointer-events-none w-70 h-70 bg-[rgba(143,185,244,0.35)] top-15 -right-15 animate-[aaOrbDrift_14s_ease-in-out_infinite] animation-delay-[-6s]" style="animation-delay: -6s;"></div>
      <div class="absolute rounded-full filter blur-[70px] pointer-events-none w-50 h-50 bg-[rgba(45,212,191,0.22)] bottom-[10%] left-[55%] animate-[aaOrbDrift_14s_ease-in-out_infinite]" style="animation-delay: -3s;"></div>

      <div class="absolute left-0 right-0 top-13 bottom-0 z-10 pointer-events-none overflow-hidden hidden sm:block" aria-hidden="true">
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] left-[max(12px,2vw)] mask-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-1.75 h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-size-[calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(204,251,241,0.42)]"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(224,242,254,0.4)]" style="animation-delay: -0.9s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(219,234,254,0.38)]" style="animation-delay: -1.8s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(236,254,255,0.4)]" style="animation-delay: -2.7s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(240,253,250,0.36)] after:absolute after:-inset-1 after:rounded-[10px] after:border after:border-[rgba(20,184,166,0.12)] after:opacity-0 after:animate-[aaLinkPulse_7s_ease-in-out_infinite]" style="animation-delay: -3.6s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(239,246,255,0.42)]" style="animation-delay: -4.5s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(236,253,245,0.36)]" style="animation-delay: -5.4s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(224,231,255,0.38)]" style="animation-delay: -6.3s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(204,251,241,0.42)]"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(219,234,254,0.38)]" style="animation-delay: -1.8s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(224,242,254,0.4)] after:absolute after:-inset-1 after:rounded-[10px] after:border after:border-[rgba(20,184,166,0.12)] after:opacity-0 after:animate-[aaLinkPulse_7s_ease-in-out_infinite]" style="animation-delay: -0.9s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(236,254,255,0.4)]" style="animation-delay: -2.7s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(240,253,250,0.36)]" style="animation-delay: -3.6s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(239,246,255,0.42)]" style="animation-delay: -4.5s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(219,234,254,0.38)]" style="animation-delay: -1.8s;"></div>
          </div>
        </div>
        
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] right-[max(12px,2vw)] mask-[linear-gradient(270deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-1.75 h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(94,234,212,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.14)_1px,transparent_1px)] before:bg-size-[calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(219,234,254,0.38)]" style="animation-delay: -1.8s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(204,251,241,0.42)]"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(224,242,254,0.4)]" style="animation-delay: -0.9s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(239,246,255,0.42)]" style="animation-delay: -4.5s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(236,254,255,0.4)] after:absolute after:-inset-1 after:rounded-[10px] after:border after:border-[rgba(20,184,166,0.12)] after:opacity-0 after:animate-[aaLinkPulse_7s_ease-in-out_infinite]" style="animation-delay: -2.7s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(240,253,250,0.36)]" style="animation-delay: -3.6s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(224,242,254,0.4)]" style="animation-delay: -0.9s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(219,234,254,0.38)]" style="animation-delay: -1.8s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(204,251,241,0.42)]"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(240,253,250,0.36)]" style="animation-delay: -3.6s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(239,246,255,0.42)] after:absolute after:-inset-1 after:rounded-[10px] after:border after:border-[rgba(20,184,166,0.12)] after:opacity-0 after:animate-[aaLinkPulse_7s_ease-in-out_infinite]" style="animation-delay: -4.5s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(236,254,255,0.4)]" style="animation-delay: -2.7s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(204,251,241,0.42)]"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(224,242,254,0.4)]" style="animation-delay: -0.9s;"></div>
            <div class="rounded-lg border border-[rgba(74,144,226,0.2)] relative z-10 animate-[aaCellBreathe_7s_ease-in-out_infinite] bg-[rgba(240,253,250,0.36)]" style="animation-delay: -3.6s;"></div>
          </div>
        </div>
      </div>

      <div class="relative max-w-240 mx-auto px-3 z-30">
        <div class="relative z-30 flex justify-center px-[4%] py-1 mx-auto">
          <div class="relative w-[min(260px,68vw)] animate-[aaBotEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,transparent_70%)] animate-[aaBotGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-[rgba(45,212,191,0.35)] animate-[aaBotRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-2 border-dashed border-[rgba(139,92,246,0.2)] animate-[aaBotRingSpin_30s_linear_infinite_reverse]"></div>
            <object :data="require('../assets/ai-agent-bot.svg')" type="image/svg+xml" title="Voice AI Agent" class="w-full block relative z-20 filter drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]">Voice AI Agent robot</object>
          </div>
        </div>

        <div class="relative z-30 text-center max-w-150 mx-auto px-[4%] pt-1 pb-5.5">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-3">Voice AI Agent</span>
          <h1 class="font-['Space_Grotesk'] text-[clamp(24px,3.5vw,36px)] font-extrabold tracking-[-1px] line-height-[1.15] mb-2.5 text-slate-900">
            Talking agents with <em class="not-italic bg-linear-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">clear, natural voice</em>
          </h1>
          <p class="text-[15px] text-slate-500 leading-relaxed mb-4">Phone-first AI that handles customer service calls, internal dialing, outbound campaigns, and scheduled callbacks - with live queue visibility and call analytics built in.</p>
          <div class="flex justify-center gap-3 flex-wrap">
            <a href="contact.html?project=ai-agent" class="px-6 py-3 bg-linear-to-r from-teal-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-sm">Book a Voice Demo</a>
            <a href="pricing.html?project=ai-agent" class="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm">View Pricing</a>
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden" id="flow">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 filter blur-[52px] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>
        <div class="relative z-20">
          <span class="absolute font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/6.5 -top-12 left-0 pointer-events-none user-select-none" aria-hidden="true">01</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 mt-8 relative z-10">Call Flow</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">From ring to resolution on the phone</h2>
          <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">Route every call through speech recognition, intent handling, and smart transfer - so callers get answers on the line without waiting in silence.</p>
        </div>
        <div class="relative z-10 flex items-center justify-center">
          <div class="relative w-full max-w-140 mx-auto animate-[aaVisualFloat_6s_ease-in-out_infinite]">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(74,144,226,0.08)_45%,transparent_72%)] filter blur-sm animate-[aaShowcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            <div class="relative z-10 rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_22px_56px_rgba(15,23,42,0.1)] bg-white transition-all duration-350 min-h-80 hover:shadow-[0_28px_64px_rgba(15,76,129,0.14)] hover:-translate-y-1 hover:scale-[1.01]">
              <object :data="require('../assets/ai-agent-voice-flow.svg')" type="image/svg+xml" title="Voice AI agent call flow" class="w-full min-h-70 block">Voice agent flow diagram</object>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden bg-slate-50" id="dashboard">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute left-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 filter blur-[52px] bg-[radial-gradient(circle,rgba(74,144,226,0.2)_0%,rgba(20,184,166,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>
        
        <div class="relative z-10 flex items-center justify-center order-last md:order-first">
          <div class="relative w-full max-w-140 mx-auto">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(74,144,226,0.08)_45%,transparent_72%)] filter blur-sm animate-[aaShowcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            
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
                  <div class="overflow-hidden rounded-[10px] bg-white border border-slate-100 h-42.5 md:h-27">
                    <object :data="require('../assets/ai-agent-scheduled-calls.svg')" type="image/svg+xml" title="Scheduled calls overview" class="w-full block -mt-1.5">Scheduled calls overview</object>
                  </div>
                </div>

                <div class="bg-[#fafbfc] border border-slate-200/60 rounded-[14px] p-[10px_10px_8px] animate-[aaTileFloat_5s_ease-in-out_infinite] animation-delay-[0.8s] transition-all hover:border-teal-400/40 hover:shadow-md" style="animation-delay: 0.8s;">
                  <span class="block text-[9px] font-extrabold tracking-wider uppercase text-slate-500 mb-2 pl-0.5">Activity and usage</span>
                  <div class="grid grid-cols-1 sm:grid-cols-[0.42fr_0.58fr] gap-2">
                    <div class="overflow-hidden rounded-[10px] bg-white border border-slate-100 h-37.5 md:h-27">
                      <object :data="require('../assets/ai-agent-analytics.svg')" type="image/svg+xml" title="Analytics summary" class="w-full block">Analytics summary</object>
                    </div>
                    <div class="overflow-hidden rounded-[10px] bg-[#fafbfc] border border-slate-100 h-37.5 md:h-27 flex items-center justify-center">
                      <img src="@/assets/agent_graphs.png" alt="Activity trend charts" class="w-[118%] h-auto block scale-[0.88] origin-center" width="1100" height="420"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-20">
          <span class="absolute font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/6.5 -top-12 left-0 pointer-events-none user-select-none" aria-hidden="true">02</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 mt-8 relative z-10">Live Dashboards</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">Monitor every call in real time</h2>
          <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">See queues, live volume, and agent activity in one glance - from scheduled callbacks to activity trends.</p>
          
          <div class="flex flex-wrap items-center gap-2.5 mt-4.5">
            <div class="inline-flex items-center gap-1.75 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/35 text-[10px] font-extrabold tracking-widest text-teal-800 animate-[aaLivePulse_2.2s_ease-in-out_infinite]" aria-label="Live data">
              <span class="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_0_0_rgba(52,211,153,0.55)] animate-[aaLiveDot_1.8s_ease-in-out_infinite]"></span>
              <span>LIVE</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span class="text-[11px] text-slate-500 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-slate-200/60 animate-[aaChipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]"><strong class="text-slate-900 font-extrabold mr-1">12</strong> calls</span>
              <span class="text-[11px] text-slate-500 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-slate-200/60 animate-[aaChipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]" style="animation-delay: 0.18s;"><strong class="text-slate-900 font-extrabold mr-1">149</strong> live</span>
              <span class="text-[11px] text-slate-500 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-slate-200/60 animate-[aaChipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]" style="animation-delay: 0.26s;"><strong class="text-slate-900 font-extrabold mr-1">2</strong> agents on</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden" id="workflows">
      <div class="max-w-280 mx-auto">
        <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[0.88fr_1.12fr] gap-[clamp(28px,5vw,56px)] items-center mb-7">
          <div class="absolute right-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 filter blur-[52px] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,rgba(74,144,226,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>
          <div class="relative z-20">
            <span class="absolute font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/6.5 -top-12 left-0 pointer-events-none user-select-none" aria-hidden="true">03</span>
            <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 mt-8 relative z-10">Voice Workflows</span>
            <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">
              Built for real calls. <em class="not-italic bg-linear-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">Operator-grade control.</em>
            </h2>
            <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">Customer lines, internal dialing, and outbound campaigns - with clear speech, live queues, and smart routing in one voice stack.</p>
          </div>
          <div class="relative z-10 flex items-center justify-center">
            <div class="relative w-full max-w-120 mx-auto animate-[aaVisualFloat_6s_ease-in-out_infinite]">
              <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(74,144,226,0.08)_45%,transparent_72%)] filter blur-sm animate-[aaShowcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
              <div class="relative w-[min(280px,80%)] md:w-[min(320px,88%)] mx-auto">
                <div class="absolute inset-5 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22)_0%,transparent_68%)] animate-[aaVoiceGlow_3.5s_ease-in-out_infinite]"></div>
                <div class="absolute inset-[-8%] rounded-full border-2 border-dashed border-slate-400/30 animate-[aaBotRingSpin_24s_linear_infinite]"></div>
                <div class="absolute inset-[-18%] rounded-full border-2 border-dashed border-sky-400/20 animate-[aaBotRingSpin_30s_linear_infinite_reverse]"></div>
                <object :data="require('../assets/ai-agent-phone-bot.svg')" type="image/svg+xml" title="Voice AI agent on a call" class="w-full block relative z-20 filter drop-shadow-[0_22px_48px_rgba(42,95,158,0.2)] animate-[aaBotObjBob_5s_ease-in-out_infinite]">Voice AI agent with phone</object>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article class="group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:border-teal-500/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#14B8A6] before:rounded-[16px_0_0_16px] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(20,184,166,0.08)_0%,transparent_55%)] after:pointer-events-none">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase text-[#14B8A6] mb-2">Use case</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">Customer service</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">Inbound support, FAQs, and warm handoff with full transcripts.</p>
          </article>

          <article class="group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:border-violet-500/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#8B5CF6] before:rounded-[16px_0_0_16px] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(139,92,246,0.08)_0%,transparent_55%)] after:pointer-events-none" style="animation-delay: 0.6s;">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase text-[#8B5CF6] mb-2">Use case</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">Internal dialing</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">Extensions, department transfers, and staff announcements.</p>
          </article>

          <article class="group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:border-amber-500/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#F59E0B] before:rounded-[16px_0_0_16px] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,transparent_55%)] after:pointer-events-none" style="animation-delay: 1.2s;">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase text-[#F59E0B] mb-2">Use case</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">Outbound campaigns</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">Reminders, follow-ups, and sales outreach on a live queue.</p>
          </article>

          <article class="group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:border-blue-500/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#2A5F9E] before:rounded-[16px_0_0_16px] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(42,95,158,0.08)_0%,transparent_55%)] after:pointer-events-none" style="animation-delay: 0.3s;">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase text-[#2A5F9E] mb-2">Control</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">Natural, clear speech</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">Human-like TTS and accurate STT - no robotic pacing.</p>
          </article>

          <article class="group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:border-emerald-500/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#059669] before:rounded-[16px_0_0_16px] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(5,150,105,0.08)_0%,transparent_55%)] after:pointer-events-none" style="animation-delay: 0.9s;">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase text-[#059669] mb-2">Control</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">Live call queue</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">Scheduled, active, and completed calls refresh automatically.</p>
          </article>

          <article class="group relative bg-white/92 border border-slate-200/80 rounded-[14px] p-4 pl-4.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:border-teal-700/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] animate-[aaCardFloat_5s_ease-in-out_infinite] hover:[animation-play-state:paused] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#0F766E] before:rounded-[16px_0_0_16px] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(15,118,110,0.08)_0%,transparent_55%)] after:pointer-events-none" style="animation-delay: 1.5s;">
            <span class="relative z-10 inline-block text-[9px] font-extrabold tracking-wider uppercase text-[#0F766E] mb-2">Control</span>
            <h3 class="relative z-10 font-['Space_Grotesk'] text-sm font-bold mb-1.5">Routing and analytics</h3>
            <p class="relative z-10 text-[12.5px] text-slate-500 leading-normal">Resolve on the line, transfer when needed, track volume trends.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="relative py-18 px-[5%] overflow-hidden bg-slate-50">
      <div class="relative max-w-285 mx-auto grid grid-cols-1 md:grid-cols-[1.12fr_0.88fr] gap-[clamp(28px,5vw,56px)] items-center">
        <div class="absolute left-[2%] top-1/2 -translate-y-1/2 w-[min(480px,52%)] h-[min(400px,72%)] rounded-full pointer-events-none z-0 filter blur-[52px] bg-[radial-gradient(circle,rgba(74,144,226,0.2)_0%,rgba(20,184,166,0.1)_42%,transparent_72%)]" aria-hidden="true"></div>
        
        <div class="relative z-10 flex items-center justify-center order-last md:order-first">
          <div class="relative w-full max-w-140 mx-auto animate-[aaVisualFloat_6s_ease-in-out_infinite]">
            <div class="absolute inset-[8%_4%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.22)_0%,rgba(20,184,166,0.1)_50%,transparent_72%)] filter blur-sm animate-[aaShowcaseGlow_4s_ease-in-out_infinite] pointer-events-none"></div>
            <div class="absolute -inset-1.5 rounded-[22px] border-2 border-dashed border-teal-500/35 animate-[aaBotRingSpin_26s_linear_infinite] pointer-events-none"></div>
            <div class="relative z-10 rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_22px_56px_rgba(15,23,42,0.1)] bg-white transition-all duration-350 min-h-75 md:min-h-85 hover:shadow-[0_28px_64px_rgba(15,76,129,0.14)] hover:-translate-y-1 hover:scale-[1.01]">
              <object :data="require('../assets/ai-agent-capabilities.svg')" type="image/svg+xml" title="Voice AI capabilities and telephony integrations" class="w-full min-h-80 block">Voice agent capabilities diagram</object>
            </div>
          </div>
        </div>

        <div class="relative z-20">
          <span class="absolute font-['Space_Grotesk'] text-[clamp(76px,13vw,148px)] font-extrabold leading-[0.82] tracking-[-5px] text-slate-900/6.5 -top-12 left-0 pointer-events-none user-select-none" aria-hidden="true">04</span>
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 mt-8 relative z-10">Capabilities</span>
          <h2 class="font-['Space_Grotesk'] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.8px] leading-[1.15] text-slate-900 my-2 relative z-10">Everything a voice agent needs</h2>
          <p class="text-[15px] text-slate-500 leading-relaxed max-w-115">Recordings, warm transfer, and telephony integrations - the full toolkit for production voice deployments.</p>
          
          <ul class="mt-4.5 flex flex-col gap-2.5 list-none p-0">
            <li class="flex gap-4 items-start p-[14px_16px] bg-white border border-slate-200/50 rounded-xl shadow-sm animate-[aaFeatIn_0.6s_ease_both]">
              <span class="bg-teal-50 text-teal-700 font-extrabold text-[10px] tracking-wider px-2 py-1 rounded">REC</span>
              <div>
                <h4 class="text-sm font-bold text-slate-800">Recordings and logs</h4>
                <p class="text-xs text-slate-500 mt-0.5">Every call captured for review, training, and compliance.</p>
              </div>
            </li>
            <li class="flex gap-4 items-start p-[14px_16px] bg-white border border-slate-200/50 rounded-xl shadow-sm animate-[aaFeatIn_0.6s_ease_both]" style="animation-delay: 0.12s;">
              <span class="bg-violet-50 text-violet-700 font-extrabold text-[10px] tracking-wider px-2 py-1 rounded">TR</span>
              <div>
                <h4 class="text-sm font-bold text-slate-800">Warm transfer</h4>
                <p class="text-xs text-slate-500 mt-0.5">Pass context to a human agent when the caller needs a person.</p>
              </div>
            </li>
            <li class="flex gap-4 items-start p-[14px_16px] bg-white border border-slate-200/50 rounded-xl shadow-sm animate-[aaFeatIn_0.6s_ease_both]" style="animation-delay: 0.19s;">
              <span class="bg-sky-50 text-sky-700 font-extrabold text-[10px] tracking-wider px-2 py-1 rounded">API</span>
              <div>
                <h4 class="text-sm font-bold text-slate-800">CRM and telephony hooks</h4>
                <p class="text-xs text-slate-500 mt-0.5">Connect to your phone system, CRM, and ticketing tools via API.</p>
              </div>
            </li>
          </ul>
          <p class="text-left text-sm text-slate-500 mt-4 mb-0">
            Looking for text and chat automation? See our <a href="chatbot.html" class="text-teal-600 font-semibold hover:underline">Chatbot Agent</a>.
          </p>
        </div>
      </div>
    </section>

    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="bg-linear-to-br from-slate-900 to-slate-800 text-white p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl">
        <div class="max-w-2xl">
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight font-['Space_Grotesk'] mb-2">Ready to deploy a voice agent?</h2>
          <p class="text-slate-400 text-sm md:text-base leading-relaxed">Book a demo and hear how your calls can sound - customer service, internal lines, and outbound included.</p>
        </div>
        <div class="flex gap-3 flex-wrap items-center">
          <a href="contact.html?project=ai-agent" class="px-6 py-3.5 bg-linear-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold rounded-xl shadow-md transition-transform hover:scale-[1.02] text-sm">Contact Sales</a>
          <a href="pricing.html?project=ai-agent" class="px-6 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors text-sm">View Pricing</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AiAgentComponent',
  data() {
    return {
      isDrawerOpen: false,
      parallaxStyle: {
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)'
      }
    }
  },
  methods: {
    handleParallax(event) {
      const card = event.currentTarget;
      const box = card.getBoundingClientRect();
      const x = event.clientX - box.left - (box.width / 2);
      const y = event.clientY - box.top - (box.height / 2);
      
      // Calculate angles (Max 8 degrees tilt to maintain same look)
      const rx = -(y / (box.height / 2)) * 8;
      const ry = (x / (box.width / 2)) * 8;
      
      this.parallaxStyle.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    },
    resetParallax() {
      this.parallaxStyle.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    }
  }
}
</script>

<style scoped>

@keyframes aaMeshShift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
  100% { transform: translate(1.5%, -1%) scale(1.04); opacity: 1; }
}
@keyframes aaOrbDrift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -14px); }
}
@keyframes aaCellBreathe {
  0%, 100% { opacity: 0.28; transform: scale(1); }
  50% { opacity: 0.62; transform: scale(1.015); }
}
@keyframes aaLinkPulse {
  0%, 100% { opacity: 0; transform: scale(0.98); }
  50% { opacity: 0.55; transform: scale(1); }
}
@keyframes aaBotEnter {
  from { opacity: 0; transform: translateY(30px) scale(0.92); }
  to { opacity: 1; transform: none; }
}
@keyframes aaBotRingSpin { 
  to { transform: rotate(360deg); } 
}
@keyframes aaBotGlow {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}
@keyframes aaShowcaseGlow {
  0%, 100% { opacity: 0.65; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1.03); }
}
@keyframes aaVisualFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes aaTileFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes aaLivePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes aaLiveDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5); }
  50% { box-shadow: 0 0 0 7px rgba(52, 211, 153, 0); }
}
@keyframes aaChipPop {
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to { opacity: 1; transform: none; }
}
@keyframes aaVoiceGlow {
  0%, 100% { opacity: 0.6; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.04); }
}
@keyframes aaCardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes aaBotObjBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes aaFeatIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: none; }
}

/* REDUCED MOTION SAFEGUARDS */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>