<template>
  <Navbar />
  <section class="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 px-6 py-12 md:px-12 lg:px-24 flex items-center overflow-hidden font-sans">
    
    <div class="max-w-7xl pt-14 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      
      <div class="lg:col-span-5 flex flex-col space-y-6 text-left">
        <div class="inline-flex items-center self-start bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-purple-400 mr-2.5 animate-pulse"></span>
          <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Trusted by 150+ businesses worldwide
          </span>
        </div>

        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          We craft <br />
          <Transition name="fade" mode="out-in">
            <span
              :key="currentWordIndex"
              class="inline-block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent"
            >
              {{ words[currentWordIndex] }}
            </span>
          </Transition> <br />
          software that ships fast.
        </h1>

        <p class="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
          Rasant Solutions engineers bold digital products — from cloud-native platforms to AI-powered apps — built to launch fast and scale without limits.
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <button class="inline-flex items-center justify-center bg-[#E03C08] hover:bg-[#c63406] text-white font-semibold px-7 py-4 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 group transform hover:-translate-y-0.5">
            <span>Start Your Project</span>
            <svg class="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
          
          <button class="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-7 py-4 rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-0.5">
            <svg class="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>See Our Work</span>
          </button>
        </div>
      </div>

      <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-5 items-start relative">
        
        <div class="md:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-44 max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/50">
            <div class="flex space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">rasant — build.ts</span>
            <div class="w-10"></div>
          </div>
          <div class="p-3.5 font-mono text-[11px] leading-relaxed text-slate-600 flex-1 flex flex-col justify-between">
            <div>
              <p><span class="text-purple-600 font-semibold">const</span> app = <span class="text-purple-600">await</span> <span class="text-blue-600">rasant.build</span>({</p>
              <p class="pl-4">stack: [<span class="text-emerald-600">"React"</span>, <span class="text-emerald-600">"Node"</span>, <span class="text-emerald-600">"AWS"</span>],</p>
              <p class="pl-4">deploy: <span class="text-emerald-600">"production"</span></p>
              <p>});
                <br>
                <span class="blinking-cursor"></span></p> </div>
            <div class="pt-2.5 border-t border-slate-100 flex items-center text-[10px] text-slate-500 font-semibold">
              <span class="text-emerald-500 mr-1.5">✓</span> Deployed &nbsp;•&nbsp; 0 downtime &nbsp;•&nbsp; 99% uptime
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex flex-col items-center justify-center text-center h-44 md:h-auto md:row-span-2 self-stretch">
          <div class="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100/50 mb-3">
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-bold text-slate-800 text-sm">Deployed</h3>
          <p class="text-[11px] text-slate-400 mt-0.5">Production • 0 downtime</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-between h-36">
          <div>
            <div class="text-3xl font-extrabold text-blue-600 tracking-tight">99%</div>
            <div class="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Uptime SLA</div>
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 w-[99%]"></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-between h-36">
          <span class="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Tech Stack</span>
          <div class="grid grid-cols-2 gap-1.5">
            <span v-for="tech in techStack" :key="tech" class="text-[11px] font-semibold bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-1 text-center text-slate-600">
              {{ tech }}
            </span>
          </div>
        </div>

        <div class="md:col-span-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 flex items-center justify-between space-x-6">
          <div class="flex-1 h-10 flex items-end relative overflow-hidden">
            <svg class="w-full h-full text-blue-500/10" viewBox="0 0 300 50" preserveAspectRatio="none">
              <path d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5 L 300 50 L 0 50 Z" fill="currentColor"/>
              <path d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
            </svg>
          </div>
          <div class="text-right shrink-0">
            <div class="text-2xl font-extrabold text-purple-600">3x</div>
            <div class="text-[11px] font-medium text-slate-400 mt-0.5">Faster delivery</div>
          </div>
        </div>

      </div>
      
    </div>
  </section>
  <!-- Stats Section -->
  <section class="relative px-6 py-12 md:px-12 lg:px-24 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
    <div class="max-w-7xl mx-auto">

      <!-- Avatars + clients line -->
      <div class="flex items-center gap-4 mb-10">
        <div class="flex -space-x-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 border-2 border-white flex items-center justify-center text-[11px] font-bold text-white">AK</div>
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 border-2 border-white flex items-center justify-center text-[11px] font-bold text-white">SR</div>
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-[11px] font-bold text-white">MJ</div>
          <div class="w-9 h-9 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[11px] font-bold text-white">+</div>
        </div>
        <p class="text-sm text-slate-600">
          <span class="font-bold text-slate-800">50+ clients</span> shipped products with us this year
        </p>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex items-center gap-4"
        >
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', stat.bg]">
            <font-awesome-icon :icon="stat.icon" :class="['text-lg', stat.iconColor]" />
          </div>
          <div>
            <div class="text-2xl font-extrabold text-blue-600">{{ stat.value }}</div>
            <div class="text-sm text-slate-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Trusted Technologies -->
   <section class="bg-slate-50 border-t border-slate-100 px-30 py-10 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
      <p class="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">
        Trusted Technologies We Build With
      </p>
    </div>

    <div class="relative">
      <!-- edge fade overlays -->
      <div class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

      <div class="overflow-hidden">
        <div class="flex gap-6 w-max animate-marquee">
          <div
            v-for="(tech, i) in [...techList, ...techList]"
            :key="tech.name + '-' + i"
            class="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-sm whitespace-nowrap shrink-0"
          >
            <font-awesome-icon :icon="tech.icon" :class="['text-sm', tech.color]" />
            <span class="text-sm font-semibold text-slate-700">{{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- CTA -->
  <section id="platform" class="relative overflow-hidden px-[5%] pt-20 pb-[72px] bg-gradient-to-br from-[#FFF8F3] via-[#FDF2F8] to-[#EFF6FF]">

  <!-- decorative background blobs -->
  <div class="pointer-events-none absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,213,180,0.22)_0%,transparent_70%)]"></div>
  <div class="pointer-events-none absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(143,185,244,0.18)_0%,transparent_70%)]"></div>

  <!-- header -->
  <div class="relative z-10 text-center max-w-[720px] mx-auto mb-8">
    <span class="text-xs font-bold tracking-widest text-blue-600 uppercase">Sentra AI Platform</span>
    <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
      Omni-Channel Access to<br />
      <span class="bg-[linear-gradient(90deg,#C96E3A,#B0457A,#6B52B8,#3B73C4,#1D5AA8)] bg-clip-text text-transparent">
        Service Supervision
      </span>
    </h2>
    <p class="text-slate-500 mt-4 leading-relaxed">
      Inbound and outbound voice, AI bots, live agents, chatbots, and supervisor analytics — one platform for modern call centers and customer teams.
    </p>
  </div>

  <!-- diagram card with gradient border -->
  <div class="relative z-10 max-w-[1320px] mx-auto rounded-[22px] bg-gradient-to-br from-[#FFD5B4] via-[#C9C4F8] to-[#4A90E2] p-[2px] opacity-90 shadow-[0_16px_48px_rgba(74,144,226,0.1)]">
    <div class="rounded-[20px] bg-white/90 backdrop-blur-sm p-5">
      <object
        :data="sentraPlatformSvg"
        type="image/svg+xml"
        class="w-full h-auto block"
        title="Sentra AI platform architecture"
      >
        Sentra AI platform diagram
      </object>
    </div>
  </div>

  <!-- CTA -->
  <div class="relative z-10 flex flex-wrap justify-center gap-4 mt-9">
    <RouterLink
      to="/sentra"
      class="inline-flex items-center justify-center bg-[#E03C08] hover:bg-[#c63406] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
    >
      Explore Sentra Platform ?
    </RouterLink>
    <RouterLink
      to="/login"
      class="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
    >
      Open Sentra Portal
    </RouterLink>
  </div>

</section>
<!-- Products Carousel -->
  <section id="products" class="relative overflow-hidden px-[5%] py-24 bg-gradient-to-b from-white to-slate-50">

    <div class="pointer-events-none absolute top-[10%] -right-[8%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.08)_0%,transparent_70%)]"></div>

    <div class="relative z-10 text-center max-w-[720px] mx-auto mb-11">
      <span class="text-xs font-bold tracking-widest text-blue-600 uppercase">Our Products</span>
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
        Sentra AI at the core.<br />
        Powerful modules around it.
      </h2>
      <p class="text-slate-500 mt-4 leading-relaxed">
        Sentra AI is our flagship call-center platform. AI Agent, Chatbot, and Orchestri integrate into your systems — or deploy standalone.
      </p>
    </div>

    <div class="relative z-10 max-w-[1100px] mx-auto">
      <div class="grid grid-cols-[auto_1fr_auto] gap-3 items-center">

        <button
          type="button"
          aria-label="Previous product"
          @click="prev"
        class="hidden lg:flex w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-700 items-center justify-center shrink-0 transition-all duration-200 hover:bg-[#E03C08] hover:border-[#E03C08] hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-600/25"        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-sm" />
        </button>

        <div class="relative rounded-[28px] border border-blue-500/[0.18] bg-white/90 shadow-[0_24px_64px_rgba(15,23,42,0.08)] overflow-hidden lg:min-h-[380px]">
          <article
            v-for="(product, index) in products"
            :key="product.title"
            :class="[
              index === activeIndex ? 'block' : 'hidden',
              'lg:block lg:absolute lg:inset-0 lg:transition-all lg:duration-500 lg:ease-out p-6 sm:p-8 lg:p-9',
              slideStateClasses(index)
            ]"
          >
            <div class="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 lg:gap-7 items-center lg:min-h-[316px]">

              <div>
                <span :class="['inline-block text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-3.5', product.tagClass]">
                  {{ product.tag }}
                </span>
                <h3 class="text-2xl lg:text-[32px] font-extrabold tracking-tight text-slate-900 mb-3">
                  {{ product.title }}
                </h3>
                <p class="text-[15px] text-slate-500 leading-relaxed mb-5 max-w-[420px]">
                  {{ product.description }}
                </p>
                <RouterLink
                :to="product.ctaLink"
                class="inline-flex items-center justify-center gap-2 bg-[#E03C08] hover:bg-[#c63406] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {{ product.ctaText }}
                  <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
                </RouterLink>
              </div>

              <div class="relative flex items-center justify-center min-h-[200px] lg:min-h-[280px] lg:max-h-[320px] order-first lg:order-none">
                <div :class="['absolute inset-y-[5%] inset-x-0 rounded-full blur-md animate-pulse pointer-events-none', product.glow]"></div>
                <object
                  :data="product.svg"
                  type="image/svg+xml"
                  :title="product.title"
                  class="relative z-[1] w-full max-h-[220px] lg:max-h-[300px] block rounded-2xl drop-shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
                >
                  {{ product.title }}
                </object>
              </div>

            </div>
          </article>
        </div>

        <button
          type="button"
          aria-label="Next product"
          @click="next"
          class="hidden lg:flex w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-700 items-center justify-center shrink-0 transition-all duration-200 hover:bg-[#E03C08] hover:border-[#E03C08] hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-600/25"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-sm" />
        </button>

      </div>

      <!-- tabs -->
      <div class="flex flex-wrap justify-center gap-2 mt-6" role="tablist" aria-label="Product slides">
        <button
          v-for="(product, index) in products"
          :key="product.title"
          type="button"
          role="tab"
          :aria-selected="index === activeIndex"
          @click="selectTab(index)"
          :class="[
                'px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300',
                index === activeIndex
                ? 'bg-[#E03C08] border-[#E03C08] text-white shadow-lg shadow-orange-600/25'
                : 'border-slate-200 bg-white text-slate-500 hover:border-orange-400/40 hover:text-slate-700'
                ]"
        >
          {{ product.title }}
        </button>
      </div>

      <!-- progress bar -->
      <div class="h-[3px] bg-blue-500/10 rounded-full mt-4 overflow-hidden">
        <span
          :class="['block h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-[width] duration-[6000ms] ease-linear', progressActive ? 'w-full' : 'w-0']"
        ></span>
      </div>

    </div>
  </section>
<!-- Services -->
  <section id="services" class="px-[5%] py-24 bg-white">
    <div class="max-w-7xl mx-auto">

      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
        <div>
          <span class="text-xs font-bold tracking-widest text-blue-600 uppercase">What We Do</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
            Services Built for<br />Modern Businesses
          </h2>
        </div>
        <div class="md:max-w-sm">
          <p class="text-slate-500 leading-relaxed">
            From idea to deployment — we handle every layer of your digital product.
          </p>
          <RouterLink
            to="/services"
            class="inline-flex items-center gap-2 mt-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3 rounded-xl shadow-sm transition-all duration-200"
          >
            All Services ?
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
        <div
          v-for="service in services"
          :key="service.title"
          class="group bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/40"
        >
          <img :src="service.illustration" :alt="service.title" class="w-full h-36 object-contain mb-5" />

          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', service.iconBg]">
            <font-awesome-icon :icon="service.icon" :class="['text-lg', service.iconColor]" />
          </div>

          <h3 class="text-lg font-bold text-slate-900 mb-2.5">{{ service.title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed mb-5">{{ service.description }}</p>

          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="tag in service.tags"
              :key="tag.label"
              :class="['text-xs font-semibold px-3 py-1.5 rounded-full', tag.class]"
            >
              {{ tag.label }}
            </span>
          </div>

          <RouterLink
            :to="service.link"
            class="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all duration-200"
          >
            Explore Service
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
          </RouterLink>
        </div>
      </div>

    </div>
  </section>
  <!-- How We Work -->
  <section id="process" ref="processSection" class="px-[5%] py-24 bg-slate-50 border-t border-b border-slate-200">
    <div class="max-w-6xl mx-auto">

      <div class="text-center max-w-2xl mx-auto mb-[72px]">
        <span class="text-xs font-bold tracking-widest text-blue-600 uppercase">Our Process</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
          How We Bring Ideas to Life
        </h2>
        <p class="text-slate-500 mt-4 leading-relaxed">
          A battle-tested process that eliminates uncertainty and delivers results on time, every time.
        </p>
      </div>

      <div class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-y-0">

        <div
          class="hidden lg:block absolute top-9 h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 opacity-45 origin-left transition-transform duration-[1200ms] ease-out"
          :style="{ left: 'calc(12.5% + 18px)', right: 'calc(12.5% + 18px)', transform: lineVisible ? 'scaleX(1)' : 'scaleX(0)' }"
        ></div>

        <div
          v-for="step in steps"
          :key="step.number"
          class="relative flex flex-col items-center text-center px-4"
        >
          <div :class="['relative z-[1] w-[72px] h-[72px] rounded-full flex items-center justify-center font-extrabold text-[22px] mb-6 border-2 transition-transform duration-300 hover:scale-[1.12]', step.circleClass]">
            {{ step.number }}
            <span :class="['absolute -inset-1.5 rounded-full border-2 animate-[ringPulse_2.5s_ease-out_infinite]', step.ringClass]"></span>
          </div>
          <h4 class="text-base font-bold text-slate-900 mb-2.5">{{ step.title }}</h4>
          <p class="text-[13px] text-slate-500 leading-relaxed">{{ step.description }}</p>
        </div>

      </div>

    </div>
  </section>

  <!-- Why Us -->
  <section id="about" class="px-[5%] py-24">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

      <div class="relative">
        <div class="w-full rounded-[20px] overflow-hidden bg-slate-50 border border-slate-200 shadow-lg">
          <img :src="aboutIllustration" alt="About Rasant Solutions" class="w-full block" />
        </div>

        <div class="absolute -bottom-5 -left-7 max-w-[200px] bg-white rounded-2xl px-5 py-4 shadow-xl border border-slate-200">
          <div class="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Avg. Delivery</div>
          <div class="text-[22px] font-extrabold text-blue-500">3 Weeks</div>
          <div class="text-[11px] text-slate-500 mt-0.5">From design to launch</div>
        </div>

        <div class="absolute -top-5 -right-5 max-w-[200px] bg-white rounded-2xl px-5 py-4 shadow-xl border border-slate-200">
          <div class="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Client Retention</div>
          <div class="text-[22px] font-extrabold text-emerald-400">94%</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Return for new projects</div>
        </div>
      </div>

      <div>
        <span class="text-xs font-bold tracking-widest text-blue-600 uppercase">Why Rasant</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
          Built to Deliver.<br />Designed to Last.
        </h2>
        <p class="text-slate-500 mt-4 leading-relaxed">
          We're not just another dev shop. We embed ourselves in your business and build software that solves real problems — not just specs on paper.
        </p>

        <ul class="flex flex-col gap-4 mt-8">
          <li
            v-for="feature in aboutFeatures"
            :key="feature.title"
            class="group flex items-start gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-[18px] shadow-sm transition-all duration-300 hover:bg-blue-500/[0.04] hover:border-blue-500/25 hover:translate-x-1.5 hover:shadow-md"
          >
            <span
              :class="['w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse', feature.dotColor, feature.delayClass]"
            ></span>
            <div>
              <h4 class="text-sm font-semibold text-slate-900 mb-1">{{ feature.title }}</h4>
              <p class="text-[13px] text-slate-500 leading-relaxed">{{ feature.description }}</p>
            </div>
          </li>
        </ul>
      </div>

    </div>
  </section>
  <!-- Testimonials -->
  <section id="projects" class="px-[5%] py-24">
    <div class="max-w-7xl mx-auto">

      <div class="text-center max-w-2xl mx-auto mb-[60px]">
        <span class="text-xs font-bold tracking-widest text-blue-600 uppercase">Our Projects</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
          Work That Speaks<br />For Itself
        </h2>
        <p class="text-slate-500 mt-4 leading-relaxed">
          150+ projects delivered across 20+ industries. Real results from real clients.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.name"
          class="bg-white border border-slate-200 rounded-[20px] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:-rotate-[0.5deg] hover:border-blue-500/25 hover:shadow-xl"
        >
          <div class="flex gap-1 mb-[18px]">
            <font-awesome-icon v-for="n in 5" :key="n" :icon="['fas', 'star']" class="text-amber-500 text-sm" />
          </div>
          <p class="text-[15px] text-slate-600 leading-[1.75] italic mb-6">
            "{{ testimonial.quote }}"
          </p>
          <div class="flex items-center gap-3">
            <div :class="['w-11 h-11 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0', testimonial.avatarBg]">
              {{ testimonial.initials }}
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ testimonial.name }}</div>
              <div class="text-xs text-slate-500 mt-0.5">{{ testimonial.role }}</div>
            </div>
          </div>
          <RouterLink
            :to="testimonial.link"
            class="inline-flex items-center gap-1.5 mt-5 text-[13px] font-bold text-teal-600 hover:gap-2.5 hover:text-teal-700 transition-all duration-200"
          >
            {{ testimonial.linkText }}
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-[10px]" />
          </RouterLink>
        </div>
      </div>

    </div>
  </section>
  <!-- Pricing CTA -->
  <section class="relative mx-[5%] mb-20 overflow-hidden rounded-[22px] border border-slate-300 border-l-[5px] border-l-[#2A5F9E] bg-white px-7 sm:px-12 py-9 sm:py-11 shadow-[0_4px_6px_rgba(30,58,95,0.04),0_24px_64px_rgba(42,95,158,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_12px_rgba(30,58,95,0.06),0_32px_72px_rgba(42,95,158,0.16)]">

    <div class="pointer-events-none absolute -top-[40%] -right-[8%] w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(143,185,244,0.18)_0%,transparent_68%)]"></div>
    <div class="pointer-events-none absolute -bottom-[50%] left-[28%] w-52 h-52 rounded-full bg-[radial-gradient(circle,rgba(201,196,248,0.14)_0%,transparent_70%)]"></div>

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-9">
      <div>
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.3px] text-[#2A5F9E] bg-[#2A5F9E]/[0.08] border border-[#2A5F9E]/[0.15] px-3.5 py-1.5 rounded-full mb-3.5">
          <span class="w-[7px] h-[7px] rounded-full bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"></span>
          Pricing
        </span>
        <h3 class="text-2xl sm:text-[32px] font-extrabold tracking-tight text-[#1E3A5F] leading-tight mb-2.5">
          Transparent pricing for every product
        </h3>
        <p class="text-[15px] text-slate-500 max-w-[500px] leading-relaxed mb-4.5">
          Compare plans side by side — no hidden fees. All prices shown in PKR.
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="pill in ctaPills"
            :key="pill.label"
            :class="['text-xs font-semibold text-[#1E3A5F] px-3 py-1.5 rounded-lg border', pill.class]"
          >
            {{ pill.label }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 shrink-0">
        <RouterLink
          to="/pricing"
          class="inline-flex items-center justify-center bg-[#E03C08] hover:bg-[#c63406] text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Explore Pricing
        </RouterLink>
        <RouterLink
          to="/contact"
          class="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3.5 rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Talk to Sales
        </RouterLink>
      </div>
    </div>

  </section>
  <Footer />
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/footer.vue'
import sentraPlatformSvg from '@/assets/svg/sentra-platform.svg'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import sentraBotSvg from '@/assets/svg/sentra-bot.svg'
import aiAgentSvg from '@/assets/svg/ai-agent-phone-bot.svg'
import chatbotSvg from '@/assets/svg/chatbot-messenger-bot.svg'
import orchestriSvg from '@/assets/svg/orchestri-agent-bot.svg'
import serviceSoftwareSvg from '@/assets/svg/service-software.svg'
import serviceWebMobileSvg from '@/assets/svg/service-webmobile.svg'
import serviceCloudSvg from '@/assets/svg/service-cloud.svg'
import aboutIllustration from '@/assets/svg/hero-illustration.svg'
const activeIndex = ref(0)
const exitingIndex = ref(null)
const progressActive = ref(false)
let autoTimer = null
let exitTimer = null
const SLIDE_DURATION = 6000
const processSection = ref(null)
const lineVisible = ref(false)
let observer = null

const techStack = ['React', 'Node.js', 'AWS', 'Flutter']

const words = ['Intelligent', 'Scalable', 'Beautiful', 'Future-Ready']
const currentWordIndex = ref(0)
let rotateInterval = null

onMounted(() => {
  rotateInterval = setInterval(() => {
    currentWordIndex.value = (currentWordIndex.value + 1) % words.length
  }, 2200)
})

onUnmounted(() => {
  clearInterval(rotateInterval)
})
const stats = [
  { value: '150+', label: 'Projects Delivered', icon: ['fas', 'rocket'], bg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { value: '50+', label: 'Happy Clients', icon: ['fas', 'handshake'], bg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { value: '5+', label: 'Years Experience', icon: ['fas', 'bolt'], bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { value: '99%', label: 'Client Satisfaction', icon: ['fas', 'star'], bg: 'bg-purple-50', iconColor: 'text-purple-500' },
]

const techList = [
  { name: 'Flutter', icon: ['fas', 'mobile-screen'], color: 'text-sky-500' },
  { name: 'Next.js', icon: ['fas', 'server'], color: 'text-slate-800' },
  { name: 'React', icon: ['fab', 'react'], color: 'text-cyan-500' },
  { name: 'Node.js', icon: ['fab', 'node-js'], color: 'text-emerald-600' },
  { name: 'Python', icon: ['fab', 'python'], color: 'text-blue-500' },
  { name: 'AWS', icon: ['fab', 'aws'], color: 'text-orange-500' },
  { name: 'Docker', icon: ['fab', 'docker'], color: 'text-blue-600' },
  { name: 'Google Cloud', icon: ['fab', 'google'], color: 'text-red-500' },
]
const products = [
  {
    tag: 'Main Product',
    tagClass: 'bg-blue-50 text-blue-600',
    title: 'Sentra AI',
    description: 'Omni-channel call center with AI routing, agent workbench, and real-time supervision. The platform everything else plugs into.',
    ctaText: 'Explore platform',
    ctaLink: '/sentra',
    svg: sentraBotSvg,
    glow: 'bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)]',
  },
  {
    tag: 'Voice',
    tagClass: 'bg-teal-50 text-teal-600',
    title: 'AI Agent',
    description: 'Talking voice agents for customer service, internal dialing, and outbound campaigns — with natural speech and live call dashboards.',
    ctaText: 'View Voice AI Agent',
    ctaLink: '/ai-agent',
    svg: aiAgentSvg,
    glow: 'bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(74,144,226,0.08)_50%,transparent_72%)]',
  },
  {
    tag: 'Chat',
    tagClass: 'bg-teal-50 text-teal-600',
    title: 'Chatbot Agent',
    description: 'Conversational AI for web, WhatsApp, and in-app chat — grounded in your documents with token analytics and live handoff.',
    ctaText: 'View Chatbot Agent',
    ctaLink: '/chatbot',
    svg: chatbotSvg,
    glow: 'bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,rgba(236,72,153,0.08)_50%,transparent_72%)]',
  },
  {
    tag: 'SDLC',
    tagClass: 'bg-teal-50 text-teal-600',
    title: 'Orchestri',
    description: 'AI-driven multi-agent SDLC — gated spec, plan, implement, test, and deploy workflow on your local project folder with FastAPI + React.',
    ctaText: 'View Orchestri',
    ctaLink: '/orchestri',
    svg: orchestriSvg,
    glow: 'bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)]',
  },
]
const services = [
  {
    title: 'Custom Software Development',
    description: 'Tailor-made applications engineered to your exact workflows. Scalable, secure, and built to last — not off-the-shelf compromises.',
    illustration: serviceSoftwareSvg,
    icon: ['fas', 'code'],
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    link: '/services/custom-software',
    tags: [
      { label: 'Enterprise Apps', class: 'bg-blue-50 text-blue-600' },
      { label: 'AI Integration', class: 'bg-amber-50 text-amber-600' },
      { label: 'APIs', class: 'bg-teal-50 text-teal-600' },
    ],
  },
  {
    title: 'Web & Mobile Applications',
    description: 'Beautiful, high-performance web and mobile apps using React, Flutter, and Next.js. Pixel-perfect UI that users love to interact with.',
    illustration: serviceWebMobileSvg,
    icon: ['fas', 'mobile-screen-button'],
    iconBg: 'bg-sky-400/10',
    iconColor: 'text-sky-500',
    link: '/services/web-mobile',
    tags: [
      { label: 'React / Next.js', class: 'bg-blue-50 text-blue-600' },
      { label: 'Flutter', class: 'bg-purple-50 text-purple-600' },
      { label: 'PWA', class: 'bg-teal-50 text-teal-600' },
    ],
  },
  {
    title: 'Cloud Solutions & DevOps',
    description: 'Architect, migrate and manage cloud infrastructure that scales with your growth. CI/CD pipelines, container orchestration, 99.9% uptime guaranteed.',
    illustration: serviceCloudSvg,
    icon: ['fas', 'cloud'],
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
    link: '/services/cloud-devops',
    tags: [
      { label: 'AWS / GCP', class: 'bg-teal-50 text-teal-600' },
      { label: 'Kubernetes', class: 'bg-blue-50 text-blue-600' },
      { label: 'CI/CD', class: 'bg-amber-50 text-amber-600' },
    ],
  },
]

const steps = [
  {
    number: '01',
    title: 'Discovery',
    description: 'We deep-dive into your business goals, user needs, and technical requirements to map the full scope.',
    circleClass: 'bg-blue-500/[0.12] border-blue-500 text-blue-500',
    ringClass: 'border-blue-500',
  },
  {
    number: '02',
    title: 'Design',
    description: 'UI/UX wireframes and prototypes that are validated with real users before a single line of code is written.',
    circleClass: 'bg-sky-400/10 border-sky-400 text-sky-400',
    ringClass: 'border-sky-400',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Agile sprints with continuous delivery. You see progress every two weeks — no black-box development.',
    circleClass: 'bg-teal-500/10 border-teal-500 text-teal-500',
    ringClass: 'border-teal-500',
  },
  {
    number: '04',
    title: 'Launch & Scale',
    description: 'Rigorous QA, zero-downtime deployment, and ongoing support to keep your product growing.',
    circleClass: 'bg-amber-500/10 border-amber-500 text-amber-500',
    ringClass: 'border-amber-500',
  },
]
const aboutFeatures = [
  {
    title: 'Expert Engineering Team',
    description: 'Senior full-stack engineers with deep domain expertise across fintech, logistics, healthcare, and e-commerce.',
    dotColor: 'bg-blue-500',
    delayClass: '',
  },
  {
    title: 'Transparent Communication',
    description: "Weekly demos, real-time project tracking, and a dedicated project manager. You're never in the dark.",
    dotColor: 'bg-sky-400',
    delayClass: '[animation-delay:-0.6s]',
  },
  {
    title: 'Scalable Architecture',
    description: 'We build for tomorrow, not just today. Clean, documented code that grows with your business without rewrites.',
    dotColor: 'bg-teal-500',
    delayClass: '[animation-delay:-1.2s]',
  },
  {
    title: 'Post-Launch Support',
    description: 'We stay with you after go-live. Maintenance, performance tuning, and feature additions on demand.',
    dotColor: 'bg-amber-500',
    delayClass: '[animation-delay:-1.8s]',
  },
]

const testimonials = [
  {
    name: 'Ahmed Khan',
    role: 'Operations Head, Sentra AI Client',
    initials: 'AK',
    avatarBg: 'bg-[linear-gradient(135deg,#4A90E2,#8FB9F4)]',
    quote: 'Sentra AI transformed our call center — wait times dropped 60% and our agents handle twice the volume. The IVR and AI routing just works.',
    link: '/pricing?project=sentra',
    linkText: 'View Sentra AI pricing',
  },
  {
    name: 'Sara Rashid',
    role: 'CEO, FinTech Startup',
    initials: 'SR',
    avatarBg: 'bg-[linear-gradient(135deg,#3A7BC8,#8FB9F4)]',
    quote: 'Our AI agents now handle invoice processing and customer follow-ups autonomously. Rasant built a system that saves us 20+ hours every week.',
    link: '/ai-agent',
    linkText: 'Explore AI Agent',
  },
  {
    name: 'Michael Jensen',
    role: 'Support Director, E-Commerce Brand',
    initials: 'MJ',
    avatarBg: 'bg-[linear-gradient(135deg,#F59E0B,#EF4444)]',
    quote: 'The chatbot handles 80% of our support tickets on WhatsApp and web. Live handoff to agents is seamless — our CSAT scores went up immediately.',
    link: '/chatbot',
    linkText: 'Explore Chatbot Agent',
  },
]

const ctaPills = [
  { label: 'Sentra AI', class: 'border-blue-200 bg-blue-50' },
  { label: 'AI Agent', class: 'border-teal-300 bg-teal-50' },
  { label: 'Chatbot', class: 'border-purple-300 bg-purple-50' },
  { label: 'Orchestri', class: 'border-orange-300 bg-orange-50' },
]


function slideStateClasses(index) {
  if (index === activeIndex.value) {
    return 'lg:opacity-100 lg:visible lg:translate-x-0 lg:scale-100 lg:pointer-events-auto lg:z-20'
  }
  if (index === exitingIndex.value) {
    return 'lg:opacity-0 lg:invisible lg:-translate-x-7 lg:scale-[0.985] lg:z-10'
  }
  return 'lg:opacity-0 lg:invisible lg:translate-x-7 lg:scale-[0.985] lg:pointer-events-none lg:z-0'
}

function setActive(newIndex) {
  if (newIndex === activeIndex.value) return
  exitingIndex.value = activeIndex.value
  activeIndex.value = newIndex

  clearTimeout(exitTimer)
  exitTimer = setTimeout(() => { exitingIndex.value = null }, 550)

  restartProgress()
  restartAuto()
}

function next() {
  setActive((activeIndex.value + 1) % products.length)
}

function prev() {
  setActive((activeIndex.value - 1 + products.length) % products.length)
}

function selectTab(index) {
  setActive(index)
}

function restartProgress() {
  progressActive.value = false
  nextTick(() => { progressActive.value = true })
}

function restartAuto() {
  clearInterval(autoTimer)
  autoTimer = setInterval(next, SLIDE_DURATION)
}

onMounted(() => {
  restartProgress()
  autoTimer = setInterval(next, SLIDE_DURATION)
})

onUnmounted(() => {
  clearInterval(autoTimer)
  clearTimeout(exitTimer)
})
onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        lineVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  if (processSection.value) observer.observe(processSection.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.blinking-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background-color: #4f46e5; /* Indigo color for the cursor */
  margin-left: 4px;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
}

@keyframes blink {
  from, to { background-color: transparent }
  50% { background-color: #4f46e5; }
}

/* Word rotation transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 25s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
@keyframes ringPulse {
  0%   { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.35); opacity: 0; }
}
</style>