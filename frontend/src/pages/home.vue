<template>
  <Navbar />

  <!-- Hero Section -->
  <section
      class="relative min-h-screen px-6 py-12 md:px-12 lg:px-24 flex items-center overflow-hidden"
      style="background: linear-gradient(165deg, #FFFFFF 0%, #FFF8F3 35%, #F5F0FF 65%, #EFF6FF 100%); font-family: 'Inter', sans-serif;"
  >
    <div class="max-w-7xl pt-14 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

      <!-- Left content -->
      <div
          class="lg:col-span-5 flex flex-col space-y-6 text-left transition-all duration-1000 ease-out"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
      >
        <div class="inline-flex items-center self-start bg-white/80 backdrop-blur-sm border border-[#E2E8F0]/60 rounded-full px-4 py-1.5 shadow-sm" style="font-family: 'Inter', sans-serif;">
          <span class="w-2 h-2 rounded-full bg-[#4A90E2] mr-2.5 animate-pulse"></span>
          <span class="text-xs font-semibold tracking-wider text-[#64748B] uppercase">
          Trusted by 150+ businesses worldwide
        </span>
        </div>

        <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-[#1E3A5F] leading-[1.1]" style="font-family: 'Space Grotesk', sans-serif;">
          We craft <br />
          <Transition name="fade" mode="out-in">
          <span
              :key="currentWordIndex"
              class="inline-block bg-gradient-to-r from-[#C96E3A] via-[#B0457A] via-[#6B52B8] to-[#3B73C4] bg-clip-text text-transparent"
              style="font-family: 'Space Grotesk', sans-serif;"
          >
            {{ words[currentWordIndex] }}
          </span>
          </Transition> <br />
          software that ships fast.
        </h1>

        <p class="text-lg text-[#475569] font-medium max-w-xl leading-relaxed" style="font-family: 'Inter', sans-serif;">
          Rasant Solutions engineers bold digital products — from cloud-native platforms to AI-powered apps — built to launch fast and scale without limits.
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <button class="inline-flex items-center justify-center bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold px-7 py-4 rounded-xl shadow-lg shadow-[#C2410C]/20 transition-all duration-200 group transform hover:-translate-y-0.5 cursor-pointer" style="font-family: 'Inter', sans-serif;">
            <span>Start Your Project</span>
            <svg class="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>

          <button class="inline-flex items-center justify-center cursor-pointer bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] font-semibold px-7 py-4 rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-0.5" style="font-family: 'Inter', sans-serif;">
            <svg class="w-5 h-5 mr-2 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>See Our Work</span>
          </button>
        </div>

        <!-- Trust section moved here -->
        <div class="flex items-center gap-4 pt-2">
          <div class="flex -space-x-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFD5B4] to-[#E8C1D9] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white" style="font-family: 'Inter', sans-serif;">AK</div>
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9C4F8] to-[#8FB9F4] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white" style="font-family: 'Inter', sans-serif;">SR</div>
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A90E2] to-[#8FB9F4] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white" style="font-family: 'Inter', sans-serif;">MJ</div>
            <div class="w-9 h-9 rounded-full bg-[#EA580C] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white" style="font-family: 'Inter', sans-serif;">+</div>
          </div>
          <p class="text-sm text-[#475569]" style="font-family: 'Inter', sans-serif;">
            <span class="font-bold text-[#1E3A5F]">50+ clients</span> shipped products with us this year
          </p>
        </div>
      </div>

      <!-- Right cards -->
      <div
          class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-5 items-start relative transition-all duration-1000 ease-out delay-300"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
      >
        <div class="md:col-span-2 bg-white rounded-2xl shadow-xl shadow-[#4A90E2]/10 border border-[#E2E8F0] flex flex-col h-44 max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-[#E2E8F0] bg-[#F1F5F9]/50">
            <div class="flex space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
            </div>
            <span class="text-[11px] text-[#64748B] font-mono">rasant — build.ts</span>
            <div class="w-10"></div>
          </div>
          <div class="p-3.5 font-mono text-[11px] leading-relaxed text-[#475569] flex-1 flex flex-col justify-between">
            <div>
              <p><span class="text-[#6B52B8] font-semibold">const</span> app = <span class="text-[#6B52B8]">await</span> <span class="text-[#4A90E2]">rasant.build</span>({</p>
              <p class="pl-4">stack: [<span class="text-[#14B8A6]">"React"</span>, <span class="text-[#14B8A6]">"Node"</span>, <span class="text-[#14B8A6]">"AWS"</span>],</p>
              <p class="pl-4">deploy: <span class="text-[#14B8A6]">"production"</span></p>
              <p>});<br><span class="blinking-cursor"></span></p>
            </div>
            <div class="pt-2.5 border-t border-[#E2E8F0] flex items-center text-[10px] text-[#64748B] font-semibold">
              <span class="text-[#22C55E] mr-1.5">✓</span> Deployed &nbsp;•&nbsp; 0 downtime &nbsp;•&nbsp; 99% uptime
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-[#4A90E2]/10 border border-[#E2E8F0] p-6 flex flex-col items-center justify-center text-center h-44 md:h-auto md:row-span-2 self-stretch">
          <div class="w-14 h-14 rounded-full bg-[#14B8A6]/10 flex items-center justify-center border-4 border-[#14B8A6]/20 mb-3">
            <svg class="w-6 h-6 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-bold text-[#1E3A5F] text-sm" style="font-family: 'Inter', sans-serif;">Deployed</h3>
          <p class="text-[11px] text-[#64748B] mt-0.5" style="font-family: 'Inter', sans-serif;">Production • 0 downtime</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-[#4A90E2]/10 border border-[#E2E8F0] p-5 flex flex-col justify-between h-36">
          <div>
            <div class="text-3xl font-extrabold text-[#4A90E2] tracking-tight" style="font-family: 'Space Grotesk', sans-serif;">{{ uptimeCounter }}%</div>
            <div class="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mt-1" style="font-family: 'Inter', sans-serif;">Uptime SLA</div>
          </div>
          <div class="w-full h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
                class="h-full bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#4A90E2] transition-all duration-[2000ms] ease-out"
                :style="{ width: uptimeCounter + '%' }"
            ></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-[#4A90E2]/10 border border-[#E2E8F0] p-5 flex flex-col justify-between h-36">
          <span class="text-[10px] font-bold text-[#64748B] tracking-wider uppercase" style="font-family: 'Inter', sans-serif;">Tech Stack</span>
          <div class="grid grid-cols-2 gap-1.5">
          <span v-for="tech in techStack" :key="tech" class="text-[11px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-1.5 px-1 text-center text-[#475569]" style="font-family: 'Inter', sans-serif;">
            {{ tech }}
          </span>
          </div>
        </div>

        <div class="md:col-span-3 bg-white rounded-2xl shadow-xl shadow-[#4A90E2]/10 border border-[#E2E8F0] p-4 flex items-center justify-between space-x-6">
          <div class="flex-1 h-10 flex items-end relative overflow-hidden">
            <svg class="w-full h-full text-[#4A90E2]/10" viewBox="0 0 300 50" preserveAspectRatio="none">
              <path d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5 L 300 50 L 0 50 Z" fill="currentColor"/>
              <path d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5" fill="none" stroke="#4A90E2" stroke-width="2.5"/>
            </svg>
          </div>
          <div class="text-right shrink-0">
            <div class="text-2xl font-extrabold text-[#6B52B8]" style="font-family: 'Space Grotesk', sans-serif;">3x</div>
            <div class="text-[11px] font-medium text-[#64748B] mt-0.5" style="font-family: 'Inter', sans-serif;">Faster delivery</div>
          </div>
        </div>
      </div>
    </div>
  </section>



  <!-- Trusted Technologies -->
  <section
      ref="techRef"
      class="bg-[#F8FAFC] border-t border-[#E2E8F0] px-30 py-10 overflow-hidden"
      style="font-family: 'Inter', sans-serif;"
  >
    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
      <p
          class="text-center text-xs font-bold tracking-widest text-[#64748B] uppercase mb-6 transition-all duration-700 ease-out"
          :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          style="font-family: 'Inter', sans-serif;"
      >
        Trusted Technologies We Build With
      </p>
    </div>

    <div
        class="relative transition-all duration-700 ease-out delay-200"
        :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <div class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10"></div>
      <div class="overflow-hidden">
        <div class="flex gap-6 w-max animate-marquee">
          <div
              v-for="(tech, i) in [...techList, ...techList]"
              :key="tech.name + '-' + i"
              class="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-full px-5 py-2.5 shadow-sm whitespace-nowrap shrink-0"
              style="font-family: 'Inter', sans-serif;"
          >
            <font-awesome-icon :icon="tech.icon" :class="['text-sm', tech.color]" />
            <span class="text-sm font-semibold text-[#1E3A5F]">{{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Platform Section -->
  <section
      id="platform"
      ref="platformRef"
      class="relative overflow-hidden px-[5%] pt-20 pb-[72px]"
      style="background: linear-gradient(165deg, #FFF8F3 0%, #FDF2F8 28%, #F5F0FF 52%, #EFF6FF 100%); font-family: 'Inter', sans-serif;"
  >
    <div class="pointer-events-none absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,213,180,0.22)_0%,transparent_70%)]"></div>
    <div class="pointer-events-none absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(143,185,244,0.18)_0%,transparent_70%)]"></div>

    <div
        class="relative z-10 text-center max-w-[720px] mx-auto mb-8 transition-all duration-700 ease-out"
        :class="visible.platform ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
    >
      <span class="text-xs font-bold tracking-widest text-[#4A90E2] uppercase" style="font-family: 'Inter', sans-serif;">Sentra AI Platform</span>
      <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mt-3 leading-tight" style="font-family: 'Space Grotesk', sans-serif;">
        Omni-Channel Access to<br />
        <span class="bg-gradient-to-r from-[#C96E3A] via-[#B0457A] via-[#6B52B8] to-[#3B73C4] bg-clip-text text-transparent" style="font-family: 'Space Grotesk', sans-serif;">
          Service Supervision
        </span>
      </h2>
      <p class="text-[#475569] mt-4 leading-relaxed" style="font-family: 'Inter', sans-serif;">
        Inbound and outbound voice, AI bots, live agents, chatbots, and <br> supervisor analytics — one platform for modern call centers and <br> customer teams.
      </p>
    </div>

    <div
        class="relative z-10 max-w-[1320px] mx-auto rounded-[22px] bg-gradient-to-br from-[#FFD5B4] via-[#C9C4F8] to-[#4A90E2] p-[2px] opacity-90 shadow-[0_16px_48px_rgba(74,144,226,0.1)] transition-all duration-700 ease-out delay-200"
        :class="visible.platform ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
    >
      <div
          class="rounded-[20px] bg-white/90 backdrop-blur-sm p-5 transition-all duration-700 ease-out delay-300"
          :class="visible.platform ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'"
      >
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

    <div
        class="relative z-10 flex flex-wrap justify-center gap-4 mt-9 transition-all duration-700 ease-out delay-300"
        :class="visible.platform ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <RouterLink to="/sentra" class="inline-flex items-center justify-center bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-[#C2410C]/20 transition-all duration-200 transform hover:-translate-y-0.5" style="font-family: 'Inter', sans-serif;">
        Explore Sentra Platform
      </RouterLink>
      <RouterLink to="/login" class="inline-flex items-center justify-center bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-0.5" style="font-family: 'Inter', sans-serif;">
        Open Sentra Portal
      </RouterLink>
    </div>
  </section>

  <!-- Products Section -->
  <section
      id="products"
      ref="productsRef"
      class="relative overflow-hidden px-[5%] py-24"
      style="background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%); font-family: 'Inter', sans-serif;"
  >
    <div class="pointer-events-none absolute top-[10%] -right-[8%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.08)_0%,transparent_70%)]"></div>

    <div
        class="relative z-10 text-center max-w-[720px] mx-auto mb-11 transition-all duration-700 ease-out"
        :class="visible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
    >
      <span class="text-xs font-bold tracking-widest text-[#4A90E2] uppercase" style="font-family: 'Inter', sans-serif;">Our Products</span>
      <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mt-3 leading-tight" style="font-family: 'Space Grotesk', sans-serif;">
        Sentra AI at the core.<br />
        Powerful modules around it.
      </h2>
      <p class="text-[#475569] mt-4 leading-relaxed" style="font-family: 'Inter', sans-serif;">
        Sentra AI is our flagship call-center platform. AI Agent, Chatbot, and Orchestri integrate into your systems — or deploy standalone.
      </p>
    </div>

    <div
        class="relative z-10 max-w-[1100px] mx-auto transition-all duration-700 ease-out delay-200"
        :class="visible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
    >
      <div class="grid grid-cols-[auto_1fr_auto] gap-3 items-center">

        <button
            type="button"
            aria-label="Previous product"
            @click="prev"
            class="group hidden lg:flex w-11 h-11 rounded-full border border-[#E2E8F0] bg-white text-[#1E3A5F] items-center justify-center shrink-0 transition-all duration-200 hover:bg-[#C2410C] hover:border-[#C2410C] hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-[#C2410C]/25"
            style="font-family: 'Inter', sans-serif;"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-sm transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>

        <div class="relative rounded-[28px] border border-[#4A90E2]/20 bg-white/90 shadow-[0_24px_64px_rgba(15,23,42,0.08)] overflow-hidden lg:min-h-[380px]">
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
                <span :class="['inline-block text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-3.5', product.tagClass]" style="font-family: 'Inter', sans-serif;">
                  {{ product.tag }}
                </span>
                <h3 class="text-2xl lg:text-[32px] font-extrabold tracking-tight text-[#1E3A5F] mb-3" style="font-family: 'Space Grotesk', sans-serif;">
                  {{ product.title }}
                </h3>
                <p class="text-[15px] text-[#475569] leading-relaxed mb-5 max-w-[420px]" style="font-family: 'Inter', sans-serif;">
                  {{ product.description }}
                </p>
                <RouterLink
                    :to="product.ctaLink"
                    class="group inline-flex items-center justify-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#C2410C]/20 transition-all duration-200 transform hover:-translate-y-0.5"
                    style="font-family: 'Inter', sans-serif;"
                >
                  {{ product.ctaText }}
                  <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-200 group-hover:translate-x-1" />
                </RouterLink>
              </div>

              <div class="relative flex cursor-pointer items-center justify-center min-h-[200px] lg:min-h-[280px] lg:max-h-[320px] order-first lg:order-none">
                <div :class="['absolute inset-y-[5%] inset-x-0 rounded-full blur-md animate-pulse pointer-events-none', product.glow]"></div>
                <object
                    :data="product.svg"
                    type="image/svg+xml"
                    :title="product.title"
                    class="relative z-[1] w-full max-h-[220px] lg:max-h-[300px] block rounded-2xl drop-shadow-[0_16px_36px_rgba(15,23,42,0.1)] animate-float transition-transform duration-500 ease-out hover:scale-105"
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
            class="group hidden lg:flex w-11 h-11 rounded-full border border-[#E2E8F0] bg-white text-[#1E3A5F] items-center justify-center shrink-0 transition-all duration-200 hover:bg-[#C2410C] hover:border-[#C2410C] hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-[#C2410C]/25"
            style="font-family: 'Inter', sans-serif;"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-sm transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      <div class="flex flex-wrap justify-center gap-2 mt-6" role="tablist" aria-label="Product slides">
        <button
            v-for="(product, index) in products"
            :key="product.title"
            type="button"
            role="tab"
            :aria-selected="index === activeIndex"
            @click="selectTab(index)"
            :class="[
            'relative cursor-pointer px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300',
            index === activeIndex
              ? 'bg-[#C2410C] border-[#C2410C] text-white shadow-lg shadow-[#C2410C]/25 scale-105'
              : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#C2410C]/40 hover:text-[#1E3A5F]'
          ]"
            style="font-family: 'Inter', sans-serif;"
        >
          {{ product.title }}
          <span
              v-if="index === activeIndex"
              class="absolute -inset-1 rounded-full border-2 border-[#C2410C] animate-[ringPulse_2.5s_ease-out_infinite] pointer-events-none"
          ></span>
        </button>
      </div>

      <div class="h-[3px] bg-[#4A90E2]/10 rounded-full mt-4 overflow-hidden">
        <span
            :class="['block h-full rounded-full bg-gradient-to-r from-[#14B8A6] to-[#4A90E2] transition-[width] duration-[6000ms] ease-linear', progressActive ? 'w-full' : 'w-0']"
        ></span>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section
      id="services"
      ref="servicesRef"
      class="px-[5%] py-24 bg-white"
      style="font-family: 'Inter', sans-serif;"
  >
    <div class="max-w-7xl mx-auto">

      <div
          class="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 transition-all duration-700 ease-out"
          :class="visible.services ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'"
      >
        <div>
          <span class="text-xs font-bold tracking-widest text-[#4A90E2] uppercase" style="font-family: 'Inter', sans-serif;">What We Do</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mt-3 leading-tight" style="font-family: 'Space Grotesk', sans-serif;">
            Services Built for<br />Modern Businesses
          </h2>
        </div>
        <div class="md:max-w-sm">
          <p class="text-[#475569] leading-relaxed" style="font-family: 'Inter', sans-serif;">
            From idea to deployment — we handle every layer of your digital product.
          </p>
          <RouterLink
              to="/services"
              class="inline-flex items-center gap-2 mt-4 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] font-semibold px-5 py-3 rounded-xl shadow-sm transition-all duration-200"
              style="font-family: 'Inter', sans-serif;"
          >
            All Services
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
        <div
            v-for="(service, i) in services"
            :key="service.title"
            class="group bg-white rounded-2xl border border-[#E2E8F0] shadow-xl shadow-[#4A90E2]/10 p-7 transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[inset_0_0_15px_rgba(74,144,226,0.3)]"
            :class="visible.services ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-14 scale-95'"
            :style="{ transitionDelay: visible.services ? `${i * 150}ms` : '0ms', animationDelay: `${i * 0.4}s` }"
        >
          <img
              :src="service.illustration"
              :alt="service.title"
              class="w-full h-36 object-contain mb-5 transition-transform duration-500 ease-out group-hover:scale-110 animate-float"
          />
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 ease-out', service.iconBg]">
            <font-awesome-icon :icon="service.icon" :class="['text-3xl', service.iconColor]" />
          </div>
          <h3 class="text-lg font-bold text-[#1E3A5F] mb-2.5" style="font-family: 'Space Grotesk', sans-serif;">{{ service.title }}</h3>
          <p class="text-sm text-[#475569] leading-relaxed mb-5" style="font-family: 'Inter', sans-serif;">{{ service.description }}</p>
          <div class="flex flex-wrap gap-2 mb-6">
            <span
                v-for="tag in service.tags"
                :key="tag.label"
                :class="['text-xs font-semibold px-3 py-1.5 rounded-full transition-transform duration-200 hover:scale-105', tag.class]"
                style="font-family: 'Inter', sans-serif;"
            >
              {{ tag.label }}
            </span>
          </div>
          <RouterLink
              :to="service.link"
              class="inline-flex items-center gap-2 text-sm font-bold text-[#4A90E2] group-hover:gap-3 transition-all duration-200"
              style="font-family: 'Inter', sans-serif;"
          >
            Explore Service
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-200 group-hover:translate-x-1" />
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <!-- Process Section -->
  <section
      id="process"
      ref="processSection"
      class="px-[5%] py-24 bg-[#F8FAFC] border-t border-b border-[#E2E8F0]"
      style="font-family: 'Inter', sans-serif;"
  >
    <div class="max-w-6xl mx-auto">

      <div
          class="text-center max-w-2xl mx-auto mb-[72px] transition-all duration-700 ease-out"
          :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <span class="text-xs font-bold tracking-widest text-[#4A90E2] uppercase" style="font-family: 'Inter', sans-serif;">Our Process</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mt-3 leading-tight" style="font-family: 'Space Grotesk', sans-serif;">
          How We Bring Ideas to Life
        </h2>
        <p class="text-[#475569] mt-4 leading-relaxed" style="font-family: 'Inter', sans-serif;">
          A battle-tested process that eliminates uncertainty and delivers results on time, every time.
        </p>
      </div>

      <div class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-y-0">

        <div
            class="hidden lg:block absolute top-9 h-0.5 bg-gradient-to-r from-[#14B8A6] to-[#4A90E2] opacity-45 origin-left transition-transform duration-[1200ms] ease-out"
            :style="{ left: 'calc(12.5% + 18px)', right: 'calc(12.5% + 18px)', transform: lineVisible ? 'scaleX(1)' : 'scaleX(0)' }"
        ></div>

        <div
            v-for="(step, i) in steps"
            :key="step.number"
            class="relative flex flex-col items-center text-center px-4 transition-all duration-700 ease-out"
            :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
            :style="{ transitionDelay: visible.process ? `${i * 150}ms` : '0ms' }"
        >
          <div :class="['relative z-[1] w-[72px] h-[72px] rounded-full flex items-center justify-center font-extrabold text-[22px] mb-6 border-2 transition-transform duration-300 hover:scale-[1.12]', step.circleClass]" style="font-family: 'Space Grotesk', sans-serif;">
            {{ step.number }}
            <span :class="['absolute -inset-1.5 rounded-full border-2 animate-[ringPulse_2.5s_ease-out_infinite]', step.ringClass]"></span>
          </div>
          <h4 class="text-base font-bold text-[#1E3A5F] mb-2.5" style="font-family: 'Space Grotesk', sans-serif;">{{ step.title }}</h4>
          <p class="text-[13px] text-[#475569] leading-relaxed" style="font-family: 'Inter', sans-serif;">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section
      id="about"
      ref="aboutRef"
      class="px-[5%] py-24"
      style="font-family: 'Inter', sans-serif;"
  >
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

      <div
          class="relative transition-all duration-700 ease-out"
          :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'"
      >
        <div class="w-full rounded-[20px] overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] shadow-lg">
          <img :src="aboutIllustration" alt="About Rasant Solutions" class="w-full block" />
        </div>
        <div class="absolute -bottom-5 -left-7 max-w-[200px] bg-white rounded-2xl px-5 py-4 shadow-xl border border-[#E2E8F0]" style="font-family: 'Inter', sans-serif;">
          <div class="text-[10px] uppercase tracking-wide text-[#64748B] mb-1">Avg. Delivery</div>
          <div class="text-[22px] font-extrabold text-[#4A90E2]" style="font-family: 'Space Grotesk', sans-serif;">3 Weeks</div>
          <div class="text-[11px] text-[#64748B] mt-0.5">From design to launch</div>
        </div>
        <div class="absolute -top-5 -right-5 max-w-[200px] bg-white rounded-2xl px-5 py-4 shadow-xl border border-[#E2E8F0]" style="font-family: 'Inter', sans-serif;">
          <div class="text-[10px] uppercase tracking-wide text-[#64748B] mb-1">Client Retention</div>
          <div class="text-[22px] font-extrabold text-[#14B8A6]" style="font-family: 'Space Grotesk', sans-serif;">94%</div>
          <div class="text-[11px] text-[#64748B] mt-0.5">Return for new projects</div>
        </div>
      </div>

      <div
          class="transition-all duration-700 ease-out delay-200"
          :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'"
      >
        <span class="text-xs font-bold tracking-widest text-[#4A90E2] uppercase" style="font-family: 'Inter', sans-serif;">Why Rasant</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mt-3 leading-tight" style="font-family: 'Space Grotesk', sans-serif;">
          Built to Deliver.<br />Designed to Last.
        </h2>
        <p class="text-[#475569] mt-4 leading-relaxed" style="font-family: 'Inter', sans-serif;">
          We're not just another dev shop. We embed ourselves in your business and build software that solves real problems — not just specs on paper.
        </p>

        <ul class="flex flex-col gap-4 mt-8">
          <li
              v-for="(feature, i) in aboutFeatures"
              :key="feature.title"
              class="group flex items-start gap-4 bg-white border border-[#E2E8F0] rounded-2xl px-5 py-[18px] shadow-sm transition-all duration-700 ease-out hover:bg-[#4A90E2]/5 hover:border-[#4A90E2]/25 hover:translate-x-1.5 hover:shadow-md"
              :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'"
              :style="{ transitionDelay: visible.about ? `${300 + i * 100}ms` : '0ms' }"
          >
            <span :class="['w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse', feature.dotColor, feature.delayClass]"></span>
            <div>
              <h4 class="text-sm font-semibold text-[#1E3A5F] mb-1" style="font-family: 'Space Grotesk', sans-serif;">{{ feature.title }}</h4>
              <p class="text-[13px] text-[#475569] leading-relaxed" style="font-family: 'Inter', sans-serif;">{{ feature.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <!-- Testimonials -->
  <section
      id="projects"
      ref="testimonialsRef"
      class="px-[5%] py-24"
      style="font-family: 'Inter', sans-serif;"
  >
    <div class="max-w-7xl mx-auto">

      <div
          class="text-center max-w-2xl mx-auto mb-[60px] transition-all duration-700 ease-out"
          :class="visible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <span class="text-xs font-bold tracking-widest text-[#4A90E2] uppercase" style="font-family: 'Inter', sans-serif;">Our Projects</span>
        <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mt-3 leading-tight" style="font-family: 'Space Grotesk', sans-serif;">
          Work That Speaks<br />For Itself
        </h2>
        <p class="text-[#475569] mt-4 leading-relaxed" style="font-family: 'Inter', sans-serif;">
          150+ projects delivered across 20+ industries. Real results from real clients.
        </p>
      </div>

      <!-- Grid with auto-rows for equal height -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div
              v-for="(testimonial, i) in testimonials"
          :key="testimonial.name"
          class="bg-white border border-[#E2E8F0] rounded-[20px] p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-1.5 hover:-rotate-[0.5deg] hover:border-[#4A90E2]/25 hover:shadow-xl h-full flex flex-col"
          :class="[
          visible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14'
          ]"
          :style="{ transitionDelay: visible.testimonials ? `${i * 150}ms` : '0ms' }"
          >
          <!-- Stars - Fixed at top -->
          <div class="flex gap-1 mb-[18px] flex-shrink-0">
            <font-awesome-icon v-for="n in 5" :key="n" :icon="['fas', 'star']" class="text-[#1E3A5F] text-sm" />
          </div>

          <!-- Quote - Takes remaining space -->
          <p class="text-[15px] text-[#475569] leading-[1.75] italic mb-6 flex-1" style="font-family: 'Inter', sans-serif;">
            "{{ testimonial.quote }}"
          </p>

          <!-- Author section - Fixed at bottom -->
          <div class="flex-shrink-0">
            <div class="flex items-center gap-3">
              <div :class="['w-11 h-11 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0', testimonial.avatarBg]" style="font-family: 'Inter', sans-serif;">
                {{ testimonial.initials }}
              </div>
              <div>
                <div class="text-sm font-semibold text-[#1E3A5F]" style="font-family: 'Inter', sans-serif;">{{ testimonial.name }}</div>
                <div class="text-xs text-[#64748B] mt-0.5" style="font-family: 'Inter', sans-serif;">{{ testimonial.role }}</div>
              </div>
            </div>
            <RouterLink
                :to="testimonial.link"
                class="inline-flex items-center gap-1.5 mt-5 text-[13px] font-bold text-[#14B8A6] hover:gap-2.5 hover:text-[#0D9488] transition-all duration-200"
                style="font-family: 'Space Grotesk', sans-serif;"
            >
              {{ testimonial.linkText }}
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-[10px]" />
            </RouterLink>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Pricing CTA -->
  <section
      ref="pricingRef"
      class="relative mx-[5%] mb-20 overflow-hidden rounded-[22px] border border-[#CBD5E1] border-l-[5px] border-l-[#2A5F9E] bg-white px-7 sm:px-12 py-9 sm:py-11 shadow-[0_4px_6px_rgba(30,58,95,0.04),0_24px_64px_rgba(42,95,158,0.12)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_12px_rgba(30,58,95,0.06),0_32px_72px_rgba(42,95,158,0.16)]"
      :class="visible.pricing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      style="font-family: 'Inter', sans-serif;"
  >
    <div class="pointer-events-none absolute -top-[40%] -right-[8%] w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(143,185,244,0.18)_0%,transparent_68%)]"></div>
    <div class="pointer-events-none absolute -bottom-[50%] left-[28%] w-52 h-52 rounded-full bg-[radial-gradient(circle,rgba(201,196,248,0.14)_0%,transparent_70%)]"></div>

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-9">
      <div>
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.3px] text-[#2A5F9E] bg-[#2A5F9E]/10 border border-[#2A5F9E]/20 px-3.5 py-1.5 rounded-full mb-3.5" style="font-family: 'Inter', sans-serif;">
          <span class="w-[7px] h-[7px] rounded-full bg-[#14B8A6] shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"></span>
          Pricing
        </span>
        <h3 class="text-2xl sm:text-[32px] font-extrabold tracking-tight text-[#1E3A5F] leading-tight mb-2.5" style="font-family: 'Space Grotesk', sans-serif;">
          Transparent pricing for every product
        </h3>
        <p class="text-[15px] text-[#475569] max-w-[500px] leading-relaxed mb-4.5" style="font-family: 'Inter', sans-serif;">
          Compare plans side by side — no hidden fees. All prices shown in PKR.
        </p>
        <div class="flex flex-wrap gap-2">
          <span
              v-for="pill in ctaPills"
              :key="pill.label"
              :class="['text-xs font-semibold text-[#1E3A5F] px-3 py-1.5 rounded-lg border', pill.class]"
              style="font-family: 'Inter', sans-serif;"
          >
            {{ pill.label }}
          </span>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 shrink-0">
        <RouterLink to="/pricing" class="inline-flex items-center justify-center bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-[#C2410C]/20 transition-all duration-200 transform hover:-translate-y-0.5" style="font-family: 'Inter', sans-serif;">
          Explore Pricing
        </RouterLink>
        <RouterLink to="/contact" class="inline-flex items-center justify-center bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] font-semibold px-7 py-3.5 rounded-xl shadow-sm transition-all duration-200 transform hover:-translate-y-0.5" style="font-family: 'Inter', sans-serif;">
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
import { RouterLink } from 'vue-router'
import sentraBotSvg from '@/assets/svg/sentra-bot.svg'
import aiAgentSvg from '@/assets/svg/ai-agent-phone-bot.svg'
import chatbotSvg from '@/assets/svg/chatbot-messenger-bot.svg'
import orchestriSvg from '@/assets/svg/orchestri-agent-bot.svg'
import serviceSoftwareSvg from '@/assets/svg/service-software.svg'
import serviceWebMobileSvg from '@/assets/svg/service-webmobile.svg'
import serviceCloudSvg from '@/assets/svg/service-cloud.svg'
import aboutIllustration from '@/assets/svg/hero-illustration.svg'

// ─── Scroll animation refs & state ───────────────────────────────────────────
const statsRef       = ref(null)
const techRef        = ref(null)
const platformRef    = ref(null)
const productsRef    = ref(null)
const servicesRef    = ref(null)
const aboutRef       = ref(null)
const testimonialsRef= ref(null)
const pricingRef     = ref(null)
const processSection = ref(null)

const visible = ref({
  hero:         true,
  stats:        false,
  tech:         false,
  platform:     false,
  products:     false,
  services:     false,
  process:      false,
  about:        false,
  testimonials: false,
  pricing:      false,
})

function makeObserver(key) {
  return new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible.value[key] = true
        }
      },
      { threshold: 0.12 }
  )
}

const observers = []

// ─── Hero load animation ──────────────────────────────────────────────────────
const heroLoaded = ref(false)
const uptimeCounter = ref(0)

// ─── Word rotation ────────────────────────────────────────────────────────────
const activeIndex = ref(0)
const exitingIndex = ref(null)
const progressActive = ref(false)
let autoTimer = null
let exitTimer = null
const SLIDE_DURATION = 6000
const lineVisible = ref(false)
let observer = null

const techStack = ['React', 'Node.js', 'AWS', 'Flutter']

const words = ['Intelligent', 'Scalable', 'Beautiful', 'Future-Ready']
const currentWordIndex = ref(0)
let rotateInterval = null



const techList = [
  { name: 'Flutter',      icon: ['fas', 'mobile-screen'], color: 'text-[#0EA5E9]'     },
  { name: 'Next.js',      icon: ['fas', 'server'],         color: 'text-[#1E3A5F]'  },
  { name: 'React',        icon: ['fab', 'react'],          color: 'text-[#61DAFB]'   },
  { name: 'Node.js',      icon: ['fab', 'node-js'],        color: 'text-[#339933]'},
  { name: 'Python',       icon: ['fab', 'python'],         color: 'text-[#3776AB]'   },
  { name: 'AWS',          icon: ['fab', 'aws'],            color: 'text-[#FF9900]' },
  { name: 'Docker',       icon: ['fab', 'docker'],         color: 'text-[#2496ED]'   },
  { name: 'Google Cloud', icon: ['fab', 'google'],         color: 'text-[#4285F4]'    },
]

const products = [
  {
    tag: 'Main Product', tagClass: 'bg-[#4A90E2]/10 text-[#4A90E2]',
    title: 'Sentra AI',
    description: 'Omni-channel call center with AI routing, agent workbench, and real-time supervision. The platform everything else plugs into.',
    ctaText: 'Explore platform', ctaLink: '/sentra', svg: sentraBotSvg,
    glow: 'bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)]',
  },
  {
    tag: 'Voice', tagClass: 'bg-[#14B8A6]/10 text-[#14B8A6]',
    title: 'AI Agent',
    description: 'Talking voice agents for customer service, internal dialing, and outbound campaigns — with natural speech and live call dashboards.',
    ctaText: 'View Voice AI Agent', ctaLink: '/ai-agent', svg: aiAgentSvg,
    glow: 'bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(74,144,226,0.08)_50%,transparent_72%)]',
  },
  {
    tag: 'Chat', tagClass: 'bg-[#14B8A6]/10 text-[#14B8A6]',
    title: 'Chatbot Agent',
    description: 'Conversational AI for web, WhatsApp, and in-app chat — grounded in your documents with token analytics and live handoff.',
    ctaText: 'View Chatbot Agent', ctaLink: '/chatbot', svg: chatbotSvg,
    glow: 'bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,rgba(236,72,153,0.08)_50%,transparent_72%)]',
  },
  {
    tag: 'SDLC', tagClass: 'bg-[#14B8A6]/10 text-[#14B8A6]',
    title: 'Orchestri',
    description: 'AI-driven multi-agent SDLC — gated spec, plan, implement, test, and deploy workflow on your local project folder.',
    ctaText: 'View Orchestri', ctaLink: '/orchestri', svg: orchestriSvg,
    glow: 'bg-[radial-gradient(circle,rgba(74,144,226,0.16)_0%,rgba(20,184,166,0.08)_45%,transparent_72%)]',
  },
]

const services = [
  {
    title: 'Custom Software Development',
    description: 'Tailor-made applications engineered to your exact workflows. Scalable, secure, and built to last — not off-the-shelf compromises.',
    illustration: serviceSoftwareSvg,
    icon: ['fas', 'code'],
    iconBg: 'bg-[#4A90E2]/10',
    iconColor: 'text-[#1E3A5F]',
    link: '/services/custom-software',
    tags: [{ label: 'Enterprise Apps', class: 'bg-[#4A90E2]/10 text-[#4A90E2]' }, { label: 'AI Integration', class: 'bg-[#F59E0B]/10 text-[#B45309]' }, { label: 'APIs', class: 'bg-[#14B8A6]/10 text-[#0D9488]' }],
  },
  {
    title: 'Web & Mobile Applications',
    description: 'Beautiful, high-performance web and mobile apps using React, Flutter, and Next.js. Pixel-perfect UI that users love to interact with.',
    illustration: serviceWebMobileSvg,
    icon: ['fas', 'mobile-screen-button'],
    iconBg: 'bg-[#0EA5E9]/10',
    iconColor: 'text-[#1E3A5F]',
    link: '/services/web-mobile',
    tags: [{ label: 'React / Next.js', class: 'bg-[#4A90E2]/10 text-[#4A90E2]' }, { label: 'Flutter', class: 'bg-[#6B52B8]/10 text-[#6B52B8]' }, { label: 'PWA', class: 'bg-[#14B8A6]/10 text-[#0D9488]' }],
  },
  {
    title: 'Cloud Solutions & DevOps',
    description: 'Architect, migrate and manage cloud infrastructure that scales with your growth. CI/CD pipelines, container orchestration, 99.9% uptime guaranteed.',
    illustration: serviceCloudSvg,
    icon: ['fas', 'cloud'],
    iconBg: 'bg-[#14B8A6]/10',
    iconColor: 'text-[#1E3A5F]',
    link: '/services/cloud-devops',
    tags: [{ label: 'AWS / GCP', class: 'bg-[#14B8A6]/10 text-[#0D9488]' }, { label: 'Kubernetes', class: 'bg-[#4A90E2]/10 text-[#4A90E2]' }, { label: 'CI/CD', class: 'bg-[#F59E0B]/10 text-[#B45309]' }],
  },
]

const steps = [
  { number: '01', title: 'Discovery',      description: 'We deep-dive into your business goals, user needs, and technical requirements to map the full scope.',                      circleClass: 'bg-[#4A90E2]/10 border-[#4A90E2] text-[#4A90E2]', ringClass: 'border-[#4A90E2]' },
  { number: '02', title: 'Design',         description: 'UI/UX wireframes and prototypes that are validated with real users before a single line of code is written.',               circleClass: 'bg-[#0EA5E9]/10 border-[#0EA5E9] text-[#0EA5E9]',        ringClass: 'border-[#0EA5E9]'  },
  { number: '03', title: 'Build',          description: 'Agile sprints with continuous delivery. You see progress every two weeks — no black-box development.',                      circleClass: 'bg-[#14B8A6]/10 border-[#14B8A6] text-[#14B8A6]',     ringClass: 'border-[#14B8A6]' },
  { number: '04', title: 'Launch & Scale', description: 'Rigorous QA, zero-downtime deployment, and ongoing support to keep your product growing.',                                  circleClass: 'bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B]',  ringClass: 'border-[#F59E0B]'},
]

const aboutFeatures = [
  { title: 'Expert Engineering Team',     description: 'Senior full-stack engineers with deep domain expertise across fintech, logistics, healthcare, and e-commerce.',           dotColor: 'bg-[#4A90E2]',   delayClass: '' },
  { title: 'Transparent Communication',   description: "Weekly demos, real-time project tracking, and a dedicated project manager. You're never in the dark.",                    dotColor: 'bg-[#0EA5E9]',    delayClass: '[animation-delay:-0.6s]' },
  { title: 'Scalable Architecture',       description: 'We build for tomorrow, not just today. Clean, documented code that grows with your business without rewrites.',           dotColor: 'bg-[#14B8A6]',   delayClass: '[animation-delay:-1.2s]' },
  { title: 'Post-Launch Support',         description: 'We stay with you after go-live. Maintenance, performance tuning, and feature additions on demand.',                       dotColor: 'bg-[#F59E0B]',  delayClass: '[animation-delay:-1.8s]' },
]

const testimonials = [
  { name: 'Ahmed Khan',      role: 'Operations Head, Sentra AI Client',  initials: 'AK', avatarBg: 'bg-gradient-to-br from-[#4A90E2] to-[#8FB9F4]',    quote: 'Sentra AI transformed our call center — wait times dropped 60% and our agents handle twice the volume. The IVR and AI routing just works.',            link: '/pricing?project=sentra', linkText: 'View Sentra AI pricing' },
  { name: 'Sara Rashid',     role: 'CEO, FinTech Startup',               initials: 'SR', avatarBg: 'bg-gradient-to-br from-[#3A7BC8] to-[#8FB9F4]',    quote: 'Our AI agents now handle invoice processing and customer follow-ups autonomously. Rasant built a system that saves us 20+ hours every week.',        link: '/ai-agent',               linkText: 'Explore AI Agent'       },
  { name: 'Michael Jensen',  role: 'Support Director, E-Commerce Brand', initials: 'MJ', avatarBg: 'bg-gradient-to-br from-[#F59E0B] to-[#EF4444]',    quote: 'The chatbot handles 80% of our support tickets on WhatsApp and web. Live handoff to agents is seamless — our CSAT scores went up immediately.',    link: '/chatbot',                linkText: 'Explore Chatbot Agent'  },
]

const ctaPills = [
  { label: 'Sentra AI',  class: 'border-[#93C5FD] bg-[#EFF6FF]'     },
  { label: 'AI Agent',   class: 'border-[#5EEAD4] bg-[#F0FDFA]'     },
  { label: 'Chatbot',    class: 'border-[#C4B5FD] bg-[#F5F3FF]' },
  { label: 'Orchestri',  class: 'border-[#FDBA74] bg-[#FFF7ED]' },
]

// ─── Carousel logic ───────────────────────────────────────────────────────────
function slideStateClasses(index) {
  if (index === activeIndex.value)   return 'lg:opacity-100 lg:visible lg:translate-x-0 lg:scale-100 lg:pointer-events-auto lg:z-20'
  if (index === exitingIndex.value)  return 'lg:opacity-0 lg:invisible lg:-translate-x-7 lg:scale-[0.985] lg:z-10'
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

function next()            { setActive((activeIndex.value + 1) % products.length) }
function prev()            { setActive((activeIndex.value - 1 + products.length) % products.length) }
function selectTab(index)  { setActive(index) }

function restartProgress() {
  progressActive.value = false
  nextTick(() => { progressActive.value = true })
}

function restartAuto() {
  clearInterval(autoTimer)
  autoTimer = setInterval(next, SLIDE_DURATION)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  // Hero animation
  setTimeout(() => {
    heroLoaded.value = true
    setTimeout(() => {
      const target = 99
      const duration = 1800
      const steps = 60
      const increment = target / steps
      const interval = duration / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          uptimeCounter.value = target
          clearInterval(timer)
        } else {
          uptimeCounter.value = Math.floor(current)
        }
      }, interval)
    }, 400)
  }, 100)

  // Word rotation
  rotateInterval = setInterval(() => {
    currentWordIndex.value = (currentWordIndex.value + 1) % words.length
  }, 2200)

  // Setup observers
  const observerPairs = [
    [statsRef, 'stats'],
    [techRef, 'tech'],
    [platformRef, 'platform'],
    [productsRef, 'products'],
    [servicesRef, 'services'],
    [processSection, 'process'],
    [aboutRef, 'about'],
    [testimonialsRef, 'testimonials'],
    [pricingRef, 'pricing'],
  ]

  observerPairs.forEach(([ref, key]) => {
    if (ref.value) {
      const obs = makeObserver(key)
      obs.observe(ref.value)
      observers.push(obs)
    }
  })

  // Process line observer
  const processObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lineVisible.value = true
          processObserver.disconnect()
        }
      },
      { threshold: 0.3 }
  )
  if (processSection.value) {
    processObserver.observe(processSection.value)
    observers.push(processObserver)
  }

  // Carousel auto-play
  restartProgress()
  autoTimer = setInterval(next, SLIDE_DURATION)
})

onUnmounted(() => {
  clearInterval(rotateInterval)
  clearInterval(autoTimer)
  clearTimeout(exitTimer)
  observers.forEach(o => o.disconnect())
})
</script>

<style scoped>
.blinking-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background-color: #4A90E2;
  margin-left: 4px;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
}
@keyframes blink {
  from, to { background-color: transparent }
  50%       { background-color: #4A90E2 }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.fade-enter-from  { opacity: 0; transform: translateY(10px);  }
.fade-leave-to    { opacity: 0; transform: translateY(-10px); }
@keyframes marquee {
  from { transform: translateX(0);    }
  to   { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 25s linear infinite; }
.animate-marquee:hover { animation-play-state: paused; }
@keyframes ringPulse {
  0%   { transform: scale(1);    opacity: 0.5; }
  100% { transform: scale(1.35); opacity: 0;   }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
.animate-float {
  animation: float 3.5s ease-in-out infinite;
}
</style>