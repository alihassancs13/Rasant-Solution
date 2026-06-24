<template>
  <div class="min-h-screen bg-slate-50" data-page="omnipost">
    <Navbar />
    <!-- Hero Section -->
    <section class="relative pt-17 pb-0 overflow-hidden bg-gradient-to-b from-[#fdf4ff] via-[#fff8f3] to-[#f8fafc]" id="top">
      <!-- Background mesh -->
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(255,213,180,0.35)_0%,transparent_42%),radial-gradient(circle_at_82%_18%,rgba(201,196,248,0.32)_0%,transparent_40%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.12)_0%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"></div>

      <!-- Orb backgrounds -->
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-[rgba(255,213,180,0.45)] -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-70 h-70 bg-[rgba(143,185,244,0.35)] top-15 -right-15 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-50 h-50 bg-[rgba(167,139,250,0.28)] bottom-[10%] left-[55%] animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-3s]"></div>

      <!-- Decorative side grids -->
      <div class="absolute left-0 right-0 top-13 bottom-0 z-10 pointer-events-none overflow-hidden hidden sm:block" aria-hidden="true">
        <!-- Left grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] left-[max(12px,2vw)] [mask-image:linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(167,139,250,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsLeft" :key="'left-'+i"
                 class="rounded-lg border border-[rgba(167,139,250,0.16)] relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>

        <!-- Right grid -->
        <div class="absolute top-[6%] bottom-[8%] w-[clamp(160px,calc(50%-280px),300px)] z-10 opacity-[0.78] right-[max(12px,2vw)] [mask-image:linear-gradient(270deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_68%,transparent_100%)]">
          <div class="grid grid-cols-3 grid-rows-5 gap-[7px] h-full relative before:absolute before:inset-0 before:bg-[linear-gradient(rgba(167,139,250,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.14)_1px,transparent_1px)] before:bg-[length:calc((100%+7px)/3)_calc((100%+7px)/5)]">
            <div v-for="(cell, i) in gridCellsRight" :key="'right-'+i"
                 class="rounded-lg border border-[rgba(167,139,250,0.16)] relative z-10 animate-[cellBreathe_7s_ease-in-out_infinite]"
                 :class="cell.bgClass"
                 :style="cell.delay ? { animationDelay: cell.delay } : {}"></div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <!-- Left text content -->
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-15">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">OmniPost</span>
          <h1 class="font-['Space_Grotesk'] text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1px] leading-[1.15] mb-4 text-slate-900">
            Ship social content <br class="hidden sm:block"/>
            <em class="not-italic bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">faster &amp; smarter</em>
          </h1>
          <p class="text-[15px] text-slate-500 leading-relaxed mb-6">OmniPost helps teams generate posts, run approvals, connect platforms, and publish on schedule — without switching between spreadsheets, docs, and scheduling tools.</p>
          <div class="flex justify-start gap-3 flex-wrap">
            <button @click="goToLogin"  class="relative overflow-hidden cursor-pointer px-6 py-3.5 bg-orange-700 hover:bg-orange-800 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(147,51,234,0.4)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.6)] active:scale-[0.98] group inline-flex items-center justify-center">
              <span class="relative z-10">Open OmniPost Portal</span>
              <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none animate-shine-loop"></div>
            </button>
            <router-link to="/contact?project=omnipost" class="inline-flex items-center px-8 py-4 bg-white-100 border border-slate-400 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              Contact Sales
            </router-link>
          </div>
        </div>

        <!-- Right Visual -->
        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto mt-5">
          <div class="relative w-[min(350px,85vw)] animate-[botEnter_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.2)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]"></div>
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-[rgba(139,92,246,0.35)] animate-[botRingSpin_22s_linear_infinite]"></div>
            <div class="absolute -inset-5.5 rounded-full border-2 border-dashed border-[rgba(236,72,153,0.22)] animate-[botRingSpin_30s_linear_infinite_reverse]"></div>
            <div class="relative w-full z-20 aspect-square max-w-sm mx-auto">
              <!-- Floating Posts -->
              <div class="absolute inset-0 pointer-events-none z-20">
                <div class="absolute top-0 -left-10 w-20 sm:w-24 animate-[float_5s_ease-in-out_infinite]">
                  <img src="../assets/svg/omnipost-post-instagram.svg" alt="Instagram" class="w-full rounded-xl shadow-lg"/>
                </div>
                <div class="absolute bottom-10 -right-10 w-20 sm:w-24 animate-[float_5s_ease-in-out_infinite] [animation-delay:-1.6s]">
                  <img src="../assets/svg/omnipost-post-facebook.svg" alt="Facebook" class="w-full rounded-xl shadow-lg"/>
                </div>
                <div class="absolute top-1/3 -right-14 w-20 sm:w-24 animate-[float_5s_ease-in-out_infinite] [animation-delay:-3.2s]">
                  <img src="../assets/svg/omnipost-post-linkedin.svg" alt="LinkedIn" class="w-full rounded-xl shadow-lg"/>
                </div>
              </div>
              <img src="../assets/svg/omnipost-hero.svg" alt="OmniPost" class="relative z-10 w-full drop-shadow-2xl"/>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Collaboration Section -->
    <section class="py-16 px-4 sm:px-6 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="inline-block text-sm font-semibold text-indigo-600  px-4 py-1.5 rounded-full mb-4">
              Collaboration
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Roles working together in one workspace
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Creators, approvers, owners, and schedulers route into the same workspace — with clear permissions and real-time handoffs.
            </p>

            <!-- Role Pills -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                <span class="text-purple-600 font-extrabold">#</span> Creator
                <span class="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full uppercase">Active</span>
              </span>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                <span class="text-purple-600 font-extrabold">#</span> Approver
                <span class="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full uppercase">Queue</span>
              </span>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                <span class="text-purple-600 font-extrabold">#</span> Owner
                <span class="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full uppercase">Admin</span>
              </span>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                <span class="text-purple-600 font-extrabold">#</span> Scheduler
                <span class="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase">Live</span>
              </span>
            </div>

            <!-- Feature List -->
            <ul class="space-y-8 max-w-lg">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 accent-neutral-900 flex items-center justify-center text-sm">
                  <i class="fas fa-pen-nib text-accent-neutral-900"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Creators draft and submit</h4>
                  <p class="text-sm ">Write or AI-generate content and send it into the approval queue.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center text-sm">
                  <i class="fas fa-check-double"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Approvers review before publish</h4>
                  <p class="text-sm text-slate-600">Approve, reject, or request changes with a full audit trail.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center text-sm">
                  <i class="fas fa-building"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Owners manage team accounts</h4>
                  <p class="text-sm text-slate-600">Users, roles, billing, and connected social accounts in one place.</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <img src="../assets/svg/omnipost-roles.svg" alt="Team roles workflow" class="w-full rounded-2xl shadow-2xl"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Modules -->
    <section class="py-16 px-4 sm:px-6 bg-slate-50">
      <div class="max-w-4xl mx-auto text-center mb-12">
        <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
          Platform
        </span>
        <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
          Everything you need from idea to publish
        </h2>
        <p class="text-slate-600 text-lg max-w-2xl mx-auto">
          AI generation, approvals, scheduling, bulk import, and analytics — built for marketing and content teams.
        </p>
      </div>

      <div class="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a v-for="module in modules" :key="module.name" :href="module.href"
           class="flex flex-col items-center gap-2 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-purple-300">
          <span class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-lg">
            <i :class="module.icon" class="text-accent-neutral-900"></i>
          </span>
          <span class="font-display font-bold text-sm text-slate-900">{{ module.name }}</span>
        </a>
      </div>
    </section>

    <!-- Dashboard Section -->
    <section id="dashboard" class="py-16 px-4 sm:px-6 scroll-mt-24 relative overflow-hidden bg-gradient-to-r from-purple-50/50 to-pink-50/50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="text-7xl font-display font-extrabold text-purple-200/50 block mb-2 select-none">01</span>
            <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Performance Dashboard
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Live overview of your content pipeline
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Track total posts, approval rates, publish rates, and items needing attention. See pipeline distribution and platform mix across Facebook, Twitter, and LinkedIn at a glance.
            </p>
            <ul class="space-y-8">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-chart-simple"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Pipeline health</h4>
                  <p class="text-sm text-slate-600">Draft, pending, approved, scheduled, and published breakdown.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-percent"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Approval &amp; publish rates</h4>
                  <p class="text-sm text-slate-600">Measure how content moves from draft to live.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-share-nodes"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Platform mix</h4>
                  <p class="text-sm text-slate-600">See which channels your team publishes to most.</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="relative">
            <div class="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div class="relative bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-2xl">
              <img src="../assets/images/dashboard.png" alt="Dashboard" class="w-full rounded-xl"/>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Generator Section -->
    <section id="generator" class="py-16 px-4 sm:px-6 scroll-mt-24 bg-slate-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="lg:order-2">
            <span class="text-7xl font-display font-extrabold text-purple-200/50 block mb-2 select-none">02</span>
            <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              AI Post Generator
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Platform-tailored copy in seconds
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Create platform-tailored copy and hashtags for Twitter, LinkedIn, and Facebook. Pick a tone, add optional context, enable AI image generation, and move to review in one flow.
            </p>
            <ul class="space-y-8">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fab fa-x-twitter"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Multi-platform compose</h4>
                  <p class="text-sm text-slate-600">Select Twitter, Facebook, and LinkedIn in one request.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-sliders"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Tone &amp; hashtags</h4>
                  <p class="text-sm text-slate-600">Friendly, professional, or custom tone with comma-separated tags.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-image"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">AI image creation</h4>
                  <p class="text-sm text-slate-600">Generate matching visuals from post content with one click.</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="lg:order-1 space-y-4">
            <div class="relative bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-2xl">
              <img src="../assets/images/generator.png" alt="AI Generator" class="w-full rounded-xl"/>
            </div>
            <div class="bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-2xl">
              <img src="../assets/svg/omnipost-post-linkedin.svg" alt="LinkedIn preview" class="w-full rounded-xl"/>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Approval Workflow -->
    <section id="approval" class="py-16 px-4 sm:px-6 scroll-mt-24 relative overflow-hidden bg-gradient-to-r from-purple-50/50 to-pink-50/50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="text-7xl font-display font-extrabold text-purple-200/50 block mb-2 select-none">03</span>
            <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Approval Workflow
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Quality control before anything goes live
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Creators submit drafts; approvers review, approve, or reject with a clear audit trail. Nothing publishes until your team signs off.
            </p>
            <ul class="space-y-8">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-hourglass-half"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Pending queue</h4>
                  <p class="text-sm text-slate-600">See every draft waiting for reviewer action.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-thumbs-up"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Approve or reject</h4>
                  <p class="text-sm text-slate-600">One-click decisions with comments and history.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-list-check"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Audit trail</h4>
                  <p class="text-sm text-slate-600">Full record of who approved what and when.</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <img src="../assets/svg/omnipost-approval.svg" alt="Approval workflow" class="w-full rounded-2xl shadow-2xl"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Smart Scheduler -->
    <section id="scheduler" class="py-16 px-4 sm:px-6 scroll-mt-24 bg-slate-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="lg:order-2">
            <span class="text-7xl font-display font-extrabold text-purple-200/50 block mb-2 select-none">04</span>
            <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Smart Scheduler
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Publish automatically when the time is right
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Schedule approved posts and publish automatically to your connected social accounts. Schedulers keep the calendar full while approvers keep quality high.
            </p>
            <ul class="space-y-8">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-clock"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Timed publishing</h4>
                  <p class="text-sm text-slate-600">Set date and time for each approved post.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-plug"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Connected accounts</h4>
                  <p class="text-sm text-slate-600">Publish directly to linked social platforms.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-calendar-days"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Content calendar</h4>
                  <p class="text-sm text-slate-600">See what's queued, live, and upcoming.</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="lg:order-1">
            <img src="../assets/svg/omnipost-flow.svg" alt="Schedule and publish flow" class="w-full rounded-2xl shadow-2xl"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Bulk Upload -->
    <section id="bulk" class="py-16 px-4 sm:px-6 scroll-mt-24 relative overflow-hidden bg-gradient-to-r from-purple-50/50 to-pink-50/50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="text-7xl font-display font-extrabold text-purple-200/50 block mb-2 select-none">05</span>
            <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Bulk Upload
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Generate content at scale
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Import CSV batches, generate content at scale, and manage large campaigns efficiently. Optional campaign assignment keeps bulk imports organized.
            </p>
            <ul class="space-y-8">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-upload"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">CSV import</h4>
                  <p class="text-sm text-slate-600">Upload batches with validated headers and required fields.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-layer-group"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Campaign tagging</h4>
                  <p class="text-sm text-slate-600">Assign imported rows to campaigns on upload.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-wand-magic-sparkles"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Bulk AI generation</h4>
                  <p class="text-sm text-slate-600">Process many topics through the generator at once.</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <img src="../assets/svg/omnipost-bulk.svg" alt="Bulk upload" class="w-full rounded-2xl shadow-2xl"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Team & Roles -->
    <section id="team" class="py-16 px-4 sm:px-6 scroll-mt-24 bg-slate-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="lg:order-2">
            <span class="text-7xl font-display font-extrabold text-purple-200/50 block mb-2 select-none">06</span>
            <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Team &amp; Roles
            </span>
            <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
              Manage users and permissions in one place
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              Organization owners create users, assign Creator or Approver roles, and manage connected social accounts — with active status and per-user actions.
            </p>
            <ul class="space-y-8">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-user-plus"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Create team members</h4>
                  <p class="text-sm text-slate-600">Add users to your organization workspace instantly.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-user-shield"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Role assignment</h4>
                  <p class="text-sm text-slate-600">Creator, Approver, Owner, and Scheduler permissions.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 text-accent-neutral-900 flex items-center justify-center">
                  <i class="fas fa-link"></i>
                </span>
                <div>
                  <h4 class="font-bold text-slate-900">Social account linking</h4>
                  <p class="text-sm text-slate-600">Connect platforms per organization from one admin view.</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="lg:order-1">
            <div class="relative bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-2xl">
              <img src="../assets/images/team-accounts.png" alt="Team accounts" class="w-full rounded-xl"/>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Previews -->
    <section id="social-feed" class="py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-purple-50">
      <div class="max-w-4xl mx-auto text-center mb-12">
        <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
          Social Previews
        </span>
        <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
          One post, every platform
        </h2>
        <p class="text-slate-600 text-lg max-w-2xl mx-auto">
          OmniPost tailors copy and layout for each network — so your Facebook, Instagram, and LinkedIn feeds all look native.
        </p>
      </div>

      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div v-for="platform in platforms" :key="platform.name"
             class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
          <img :src="platform.image" :alt="platform.name" class="w-full rounded-xl"/>
          <p class="flex items-center gap-2 mt-4 font-display font-bold text-slate-900">
            <i :class="platform.icon" class="text-purple-600"></i>
            {{ platform.name }}
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-16 px-4 sm:px-6 bg-slate-50 scroll-mt-24">
      <div class="max-w-4xl mx-auto text-center mb-12">
        <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
          How It Works
        </span>
        <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">
          A clear path from idea to publish
        </h2>
        <p class="text-slate-600 text-lg max-w-2xl mx-auto">
          Creators generate content with AI, approvers keep quality high, and scheduled posts go live automatically to your connected social accounts.
        </p>
      </div>

      <div class="max-w-4xl mx-auto mb-12">
        <img src="../assets/svg/omnipost-flow.svg" alt="How OmniPost works" class="w-full rounded-2xl shadow-2xl"/>
      </div>

      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="(step, index) in steps" :key="index"
             class="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-purple-300">
          <span class="w-11 h-11 rounded-xl bg-purple-100 text-accent-neutral-900 flex items-center justify-center font-display font-extrabold text-lg mb-3">
            {{ index + 1 }}
          </span>
          <h3 class="font-display font-bold text-slate-900 text-lg mb-2">{{ step.title }}</h3>
          <p class="text-sm text-slate-600">{{ step.description }}</p>
        </div>
      </div>
    </section>

    <!-- Capabilities -->
    <section class="py-16 px-4 sm:px-6 bg-white">
      <div class="max-w-4xl mx-auto text-center mb-12">
        <span class="inline-block text-sm font-semibold text-indigo-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
          Capabilities
        </span>
        <h2 class="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
          Built for modern content teams
        </h2>
      </div>

      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="capability in capabilities" :key="capability.title"
             class="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-purple-300">
          <span class="w-11 h-11 rounded-xl bg-purple-100 text-accent-neutral-900 flex items-center justify-center text-lg mb-3">
            <i :class="capability.icon"></i>
          </span>
          <h3 class="font-display font-bold text-slate-900 mb-2">{{ capability.title }}</h3>
          <p class="text-sm text-slate-600">{{ capability.description }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 text-center bg-orange-700">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl sm:text-5xl font-display font-extrabold text-white mb-4">
          Ready to ship social content faster?
        </h2>
        <p class="text-purple-100 text-lg mb-8 max-w-lg mx-auto">
          Replace spreadsheets and scattered tools with one workspace for generation, approval, and publishing.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link to="/contact?project=omnipost" class="inline-flex items-center px-8 py-4 bg-white border-slate-300 text-orange-700 hover:bg-orange-100 font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            Contact Sales
          </router-link>
          <router-link to="/home#products" class="inline-flex items-center px-8 py-4 border-2 border-white/40 hover:border-white/70 text-white font-bold rounded-xl transition-all duration-300 hover:bg-white/10">
            Explore All Products
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import { useOmniPost } from '../composables/useOmniPost.js'
import { useRouter } from 'vue-router'
import Navbar from '../components/navbar.vue'
import Footer from '../components/footer.vue'

export default {
  name: 'OmniPost',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const router = useRouter()
    const {
      modules,
      platforms,
      steps,
      capabilities,
      meshStyle
    } = useOmniPost()

    // Navigation methods using Vue Router
    const goToLogin = () => {
      router.push('/login')
    }

    const goToContact = () => {
      router.push('/contact?project=omnipost')
    }

    return {
      modules,
      platforms,
      steps,
      capabilities,
      meshStyle,
      goToLogin,
      goToContact
    }
  }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.font-display {
  font-family: 'Space Grotesk', sans-serif;
}
/* Custom Animations */
@keyframes meshShift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
  100% { transform: translate(1.5%, -1%) scale(1.04); opacity: 1; }
}
@keyframes orbDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(8px, -12px) scale(1.08); }
  66% { transform: translate(-6px, 10px) scale(0.92); }
}
@keyframes botEnter {
  0% { opacity: 0; transform: scale(0.92) translateY(18px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes botGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}
@keyframes botRingSpin {
  to { transform: rotate(360deg); }
}
.animate-meshShift {
  animation: meshShift 10s ease-in-out infinite alternate;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}
@keyframes shine-loop {
  0% { transform: translateX(-200%) skewX(-12deg); }
  50% { transform: translateX(200%) skewX(-12deg); }
  100% { transform: translateX(-200%) skewX(-12deg); }
}
.animate-shine-loop {
  animation: shine-loop 1.8s linear infinite;
}
.animate-float-delay-0 {
  animation: float 5s ease-in-out infinite;
}
.animate-float-delay-1 {
  animation: float 5s ease-in-out infinite -1.6s;
}
.animate-float-delay-2 {
  animation: float 5s ease-in-out infinite -3.2s;
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 22s linear infinite;
}

@keyframes spin-reverse-slow {
  to { transform: rotate(-360deg); }
}
.animate-spin-reverse-slow {
  animation: spin-reverse-slow 30s linear infinite;
}

/* Scroll margin for sections */
section {
  scroll-margin-top: 96px;
}

/* Smooth hover transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Ensure images don't break */
img {
  max-width: 100%;
  height: auto;
}
</style>