<template>
  <Navbar />

  <!-- Hero Section -->
  <section
      class="relative min-h-screen px-6 py-12 md:px-12 lg:px-24 flex items-center overflow-hidden bg-hero-gradient font-primary"
  >
    <div class="max-w-7xl pt-14 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <!-- Left content -->
      <div
          class="lg:col-span-5 flex flex-col space-y-6 text-left transition-all duration-1000 ease-out"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
      >
        <div
            class="inline-flex items-center self-start bg-badgeSemi backdrop-blur-sm border border-borderDefault rounded-full px-4 py-1.5 shadow-sm font-primary"
        >
          <span class="w-2 h-2 rounded-full bg-dotBlue mr-2.5 animate-pulse"></span>
          <span class="text-xs font-semibold tracking-wider text-textSupporting uppercase">
            Trusted by 150+ businesses worldwide
          </span>
        </div>

        <h1 class="text-5xl md:text-6xl font-semibold tracking-tight text-headingMain leading-[1.1] font-display">
          We craft <br />
          <Transition name="fade" mode="out-in">
            <span
                :key="currentWordIndex"
                class="inline-block bg-gradient-to-r from-secondary-500 via-accent-4 to-primary-500 bg-clip-text text-transparent font-display"
            >
              {{ words[currentWordIndex] }}
            </span>
          </Transition> <br />
          software that ships fast.
        </h1>

        <p class="text-lg text-textBody font-medium max-w-xl leading-relaxed font-primary">
          Rasant Solutions builds custom software with Java, Grails, Python, Vue.js and React  — shipped fast and built to last.
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <ShineButton to="/contact" size="xl">
            Start Your Project
            <svg class="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </ShineButton>
          <ShineButton @click="scrollToProducts" variant="outline" size="xl">
            <font-awesome-icon :icon="['fas', 'play']" class="text-sm transition-transform duration-200 group-hover:translate-x-1" />
            See Our Work
          </ShineButton>

        </div>

      </div>

      <!-- Right cards -->
      <div
          class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-5 items-start relative transition-all duration-1000 ease-out delay-300 hidden lg:grid"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
      >
        <!-- Card 1: Code example -->
        <div
            class="md:col-span-2 bg-card rounded-xl shadow-blue border border-borderDefault flex flex-col h-44 max-w-md overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-insetBlue hover:border-accent-1/30"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            style="transition-delay: 80ms"
        >
          <div class="flex items-center justify-between px-4 py-2 border-b border-borderDefault bg-cardHeader">
            <div class="flex space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-Error"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-Warning"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-Success"></span>
            </div>
            <span class="text-[11px] text-textSupporting font-mono">rasant — build.py</span>
            <div class="w-10"></div>
          </div>
          <div class="p-3.5 font-mono text-[11px] leading-relaxed text-textBody flex-1 flex flex-col justify-between">
            <div>
              <p><span class="text-codeKeyword font-semibold">app</span> = <span class="text-codeFunction">rasant.build</span>(</p>
              <p class="pl-4">stack=[<span class="text-codeString">"Python"</span>, <span class="text-codeString">"Vue"</span>, <span class="text-codeString">"React"</span>],</p>
              <p class="pl-4">backend=<span class="text-codeString">"Java / Grails"</span>, cms=<span class="text-codeString">"WordPress"</span></p>
              <p>)<br /><span class="blinking-cursor"></span></p>
            </div>
            <div class="pt-2.5 border-t border-borderDefault flex items-center text-[10px] text-textSupporting font-semibold">
              <span class="text-Success mr-1.5">&#10003;</span> Deployed &nbsp;&#8226;&nbsp; 0 downtime &nbsp;&#8226;&nbsp; 99% uptime
            </div>
          </div>
        </div>

        <!-- Card 2: Deployed -->
        <div
            class="bg-card rounded-xl shadow-blue border border-borderDefault p-6 flex flex-col items-center justify-center text-center h-44 md:h-auto md:row-span-2 self-stretch transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-insetBlue hover:border-accent-1/30"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            style="transition-delay: 160ms"
        >
          <div class="relative w-14 h-14 mb-3">
            <span class="absolute inset-0 rounded-full bg-SuccessLight animate-[ringPulse_2.4s_ease-out_infinite]"></span>
            <div class="relative w-14 h-14 rounded-full bg-SuccessLight flex items-center justify-center border-4 border-accent-1/20">
              <svg class="w-6 h-6 text-accent-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 class="font-bold text-headingCard text-sm font-primary">Deployed</h3>
          <p class="text-[11px] text-textSupporting mt-0.5 font-primary">Production &#8226; 0 downtime</p>
        </div>

        <!-- Card 3: Uptime -->
        <div
            class="bg-card rounded-xl shadow-blue border border-borderDefault p-5 flex flex-col justify-between h-36 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-insetBlue hover:border-accent-1/30"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            style="transition-delay: 240ms"
        >
          <div>
            <div class="text-3xl font-bold text-textBrand tracking-tight font-display">{{ uptimeCounter }}%</div>
            <div class="text-[10px] font-bold text-textSupporting tracking-wider uppercase mt-1 font-primary">Uptime SLA</div>
          </div>
          <div class="w-full h-1.5 rounded-full bg-progressTrack overflow-hidden">
            <div
                class="h-full bg-gradientProgress transition-all duration-[2000ms] ease-out"
                :style="{ width: uptimeCounter + '%' }"
            ></div>
          </div>
        </div>

        <!-- Card 4: Tech Stack -->
        <div
            class="bg-card rounded-xl shadow-blue border border-borderDefault p-4 flex flex-col justify-between h-44 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-insetBlue hover:border-accent-1/30"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            style="transition-delay: 320ms"
        >
          <span class="text-[10px] font-bold text-textSupporting tracking-wider uppercase font-primary">Tech Stack</span>
          <div class="grid grid-cols-2 gap-1.5">
            <span
                v-for="(tech, i) in techStack"
                :key="tech.name"
                :style="{ animationDelay: (i * 70) + 'ms' }"
                class="tech-chip flex items-center justify-center gap-1 text-[9.5px] font-semibold border rounded-lg py-1 px-1 text-textBody font-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue hover:text-textBrand cursor-default"
                :class="tech.chipClass"
            >
              <font-awesome-icon :icon="tech.icon" :class="['text-[9px] shrink-0', tech.color]" />
              {{ tech.name }}
            </span>
          </div>
        </div>

        <!-- Card 5: Faster Delivery -->
        <div
            class="md:col-span-3 bg-card rounded-xl shadow-blue border border-borderDefault p-4 flex items-center justify-between space-x-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-insetBlue hover:border-accent-1/30"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            style="transition-delay: 400ms"
        >
          <div class="flex-1 h-12 flex items-end relative overflow-hidden rounded-lg bg-[#4A90E2]/[0.04] px-1">
            <svg class="w-full h-full" viewBox="0 0 300 50" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#14B8A6"/>
                  <stop offset="45%" stop-color="#4A90E2"/>
                  <stop offset="100%" stop-color="#F97316"/>
                </linearGradient>
                <linearGradient id="heroFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#4A90E2" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#4A90E2" stop-opacity="0.02"/>
                </linearGradient>
                <clipPath id="heroChartClip">
                  <rect x="0" y="0" :width="300 * deliveryProgress / 100" height="50"/>
                </clipPath>
              </defs>
              <g opacity="0.2">
                <line x1="0" y1="12" x2="300" y2="12" stroke="#4A90E2" stroke-width="0.5" stroke-dasharray="4 6"/>
                <line x1="0" y1="25" x2="300" y2="25" stroke="#4A90E2" stroke-width="0.5" stroke-dasharray="4 6"/>
                <line x1="0" y1="38" x2="300" y2="38" stroke="#4A90E2" stroke-width="0.5" stroke-dasharray="4 6"/>
              </g>
              <g clip-path="url(#heroChartClip)">
                <path
                    d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5 L 300 50 L 0 50 Z"
                    fill="url(#heroFillGrad)"
                />
                <path
                    ref="chartLineRef"
                    d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5"
                    fill="none"
                    stroke="url(#heroLineGrad)"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :stroke-dasharray="chartPathLength"
                    :stroke-dashoffset="chartDashOffset"
                />
              </g>
              <circle
                  v-if="deliveryProgress > 2"
                  :cx="chartDot.x"
                  :cy="chartDot.y"
                  r="4"
                  fill="#F97316"
                  class="hero-chart-dot"
              />
              <circle
                  v-if="deliveryProgress > 2"
                  :cx="chartDot.x"
                  :cy="chartDot.y"
                  r="7"
                  fill="#F97316"
                  opacity="0.25"
                  class="hero-chart-dot-ring"
              />
            </svg>
          </div>
          <div class="text-right shrink-0 min-w-[72px]">
            <div class="flex items-center justify-end gap-1">
              <svg
                  class="w-3.5 h-3.5 text-Success transition-opacity duration-300"
                  :class="deliveryProgress >= 99 ? 'opacity-100' : 'opacity-0'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19V5m0 0l-4 4m4-4l4 4"/>
              </svg>
              <div class="text-2xl font-bold font-display bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-1 bg-clip-text text-transparent">
                {{ deliveryDisplay }}x
              </div>
            </div>
            <div class="text-[11px] font-medium text-textSupporting mt-0.5 font-primary">Faster delivery</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trusted Technologies -->
  <section
      ref="techRef"
      class="bg-sectionLight border-t border-borderDefault py-8 sm:py-10 overflow-hidden font-primary"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
      <p
          class="text-center text-xs font-bold tracking-widest text-textSupporting uppercase mb-5 sm:mb-6 transition-all duration-700 ease-out font-primary"
          :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        Trusted Technologies We Build With
      </p>
    </div>

    <div
        class="relative w-full transition-all duration-700 ease-out delay-200"
        :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <div class="pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-10 md:w-16 bg-gradient-to-r from-sectionLight to-transparent z-10"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-10 md:w-16 bg-gradient-to-r from-transparent to-sectionLight z-10"></div>
      <div class="overflow-hidden w-full">
        <div class="flex w-max animate-marquee tech-marquee-track">
          <div
              v-for="copy in 4"
              :key="copy"
              class="flex shrink-0 items-center gap-3 sm:gap-6 pr-3 sm:pr-6"
              :aria-hidden="copy > 1 ? 'true' : undefined"
          >
            <div
                v-for="tech in techList"
                :key="`${copy}-${tech.name}`"
                class="inline-flex items-center gap-1.5 sm:gap-2 bg-card border border-borderDefault rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-sm whitespace-nowrap shrink-0 font-primary"
            >
              <font-awesome-icon :icon="tech.icon" :class="['text-xs sm:text-sm', tech.color]" />
              <span class="text-xs sm:text-sm font-semibold text-brandDark">{{ tech.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Platform Section -->
  <section
      id="platform"
      ref="platformRef"
      class="relative overflow-hidden px-[5%] pt-20 pb-[72px] scroll-mt-20 bg-platform-gradient font-primary"
  >

    <div
        class="relative z-10 text-center max-w-[720px] mx-auto mb-8 transition-all duration-700 ease-out"
        :class="visible.platform ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
    >
      <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">Sentra AI Platform</span>
      <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
        Omni-Channel Access to<br />
        <span class="bg-gradient-to-r from-secondary-500 via-accent-4 via-accent-3 to-primary-500 bg-clip-text text-transparent font-display">
          Service Supervision
        </span>
      </h2>
      <p class="text-textBody mt-4 leading-relaxed font-primary">
        Inbound and outbound voice, AI bots, live agents, chatbots, and <br /> supervisor analytics — one platform for modern call centers and <br /> customer teams.
      </p>
    </div>

    <div
        class="relative z-10 max-w-[1320px] mx-auto rounded-[22px] bg-gradient-to-br from-secondary-100 via-platformBorder to-primary-500 p-[2px] opacity-90 shadow-blue transition-all duration-700 ease-out delay-200"
        :class="visible.platform ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
    >
      <div
          class="rounded-[20px] bg-cardSemi backdrop-blur-sm p-5 transition-all duration-700 ease-out delay-300"
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
      <ShineButton to="/sentra">Explore Sentra Platform</ShineButton>
      <ShineButton to="/login" variant="outline">Open Sentra Portal</ShineButton>
    </div>
  </section>

  <!-- Products Section -->
  <section
      id="products"
      ref="productsRef"
      class="relative overflow-hidden px-[5%] py-24 scroll-mt-20 font-primary bg-sectionLight border-t border-borderDefault"
  >
    <div class="pointer-events-none absolute top-[10%] -right-[8%] w-[520px] h-[520px] rounded-full bg-orbPrimary"></div>

    <div
        class="relative z-10 text-center max-w-[720px] mx-auto mb-11 transition-all duration-700 ease-out"
        :class="visible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
    >
      <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">Our Products</span>
      <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
        Sentra AI at the core.<br />
        Powerful modules around it.
      </h2>
      <p class="text-textBody mt-4 leading-relaxed font-primary">
        Sentra AI is our flagship call-center platform. AI Agent, Chatbot, and Orchestri integrate into your systems — or deploy standalone.
      </p>
    </div>

    <div
        class="relative z-10 max-w-[1100px] mx-auto"
        @mouseenter="productsCarousel.pauseIfFinePointer"
        @mouseleave="productsCarousel.resume"
        @touchstart="productsCarousel.onTouchStart"
        @touchend="productsCarousel.onTouchEnd"
    >
      <div class="w-full lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-3 lg:items-center">
        <button
            type="button"
            aria-label="Previous product"
            @click="productsCarousel.prev"
            class="group hidden lg:flex w-11 h-11 rounded-full cursor-pointer border border-borderDefault bg-card text-headingCard items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange font-primary"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-sm transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>

        <div class="relative w-full rounded-[28px] border border-activeBorder/20 bg-card shadow-lg overflow-hidden min-h-[460px] sm:min-h-[420px] lg:min-h-[380px]">
          <article
              v-for="(product, index) in products"
              :key="product.title"
              :class="[
              'absolute inset-0 transition-all duration-500 ease-out p-5 sm:p-8 lg:p-9',
              index === productsCarousel.index
                ? 'opacity-100 visible translate-x-0 scale-100 pointer-events-auto z-20'
                : index === productsCarousel.exitingIndex
                  ? 'opacity-0 invisible -translate-x-6 scale-[0.98] z-10'
                  : 'opacity-0 invisible translate-x-6 scale-[0.98] pointer-events-none z-0',
            ]"
          >
            <div class="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5 lg:gap-7 items-center lg:min-h-[316px] h-full">
              <div class="order-2 lg:order-none">
                <span :class="['inline-block text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-3.5', product.tagClass]">
                  {{ product.tag }}
                </span>
                <h3 class="text-xl sm:text-2xl lg:text-[32px] font-bold tracking-tight text-headingCard mb-3 font-display">
                  {{ product.title }}
                </h3>
                <p class="text-sm sm:text-[15px] text-textBody leading-relaxed mb-5 max-w-[420px] font-primary">
                  {{ product.description }}
                </p>
                <ShineButton :to="product.ctaLink" size="sm">
                  {{ product.ctaText }}
                  <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-200 cursor-pointer group-hover:translate-x-1" />
                </ShineButton>
              </div>

              <div class="relative flex items-center justify-center min-h-[160px] sm:min-h-[200px] lg:min-h-[280px] lg:max-h-[320px] order-1 lg:order-none">
                <div :class="['absolute inset-y-[5%] inset-x-0 rounded-full blur-md animate-pulse pointer-events-none', product.glow]"></div>
                <img
                    :src="product.svg"
                    :alt="product.title"
                    :title="product.title"
                    loading="lazy"
                    decoding="async"
                    class="relative z-[1] w-full max-h-[160px] sm:max-h-[220px] lg:max-h-[300px] object-contain block rounded-xl drop-shadow-[0_16px_36px_rgba(15,23,42,0.1)] animate-float transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
            </div>
          </article>
        </div>

        <button
            type="button"
            aria-label="Next product"
            @click="productsCarousel.next"
            class="group hidden lg:flex w-11 h-11 rounded-full border border-borderDefault bg-card text-headingCard items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange font-primary"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-sm cursor-pointer transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      <HomeCarouselControls
          class="lg:hidden"
          :count="products.length"
          :active="productsCarousel.index"
          prev-label="Previous product"
          next-label="Next product"
          dot-label="Show product"
          @prev="productsCarousel.prev"
          @next="productsCarousel.next"
          @select="productsCarousel.setActive"
      />
    </div>
  </section>

  <!-- Services Section -->
  <section
      id="services"
      ref="servicesRef"
      class="px-[5%] py-24 bg-sectionWhite border-t border-borderDefault scroll-mt-20 font-primary"
  >
    <div class="max-w-7xl mx-auto">
      <div
          class="flex flex-col md:flex-row md:items-end md:justify-between gap-1 mb-14 transition-all duration-700 ease-out"
          :class="visible.services ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'"
      >
        <div>
          <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">What We Do</span>
          <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
            Services Built for<br />Modern Businesses
          </h2>
        </div>
        <div class="md:max-w-sm">
          <p class="text-textBody leading-relaxed font-primary">
            From Java and Python backends to Vue/React frontends and WordPress sites — we handle every layer.
          </p>
          <ShineButton @click="scrollToTop" variant="outline" size="sm" class="mt-4">
            All Services
          </ShineButton>
        </div>
      </div>

      <!-- Mobile slider -->
      <div
          class="md:hidden relative"
          @mouseenter="servicesCarousel.pauseIfFinePointer"
          @mouseleave="servicesCarousel.resume"
          @touchstart="servicesCarousel.onTouchStart"
          @touchend="servicesCarousel.onTouchEnd"
      >
        <div class="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-sectionWhite to-transparent z-10"></div>
        <div class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-sectionWhite to-transparent z-10"></div>
        <div class="relative min-h-[520px] rounded-[24px] overflow-hidden">
          <div
              v-for="(service, index) in services"
              :key="`mobile-${service.title}`"
              :class="[
                'absolute inset-0 transition-all duration-500 ease-out',
                index === servicesCarousel.index
                  ? 'opacity-100 visible translate-x-0 scale-100 pointer-events-auto z-20'
                  : index === servicesCarousel.exitingIndex
                    ? 'opacity-0 invisible -translate-x-6 scale-[0.98] z-10'
                    : 'opacity-0 invisible translate-x-6 scale-[0.98] pointer-events-none z-0',
              ]"
          >
            <HomeServiceCard :service="service" />
          </div>
        </div>
        <HomeCarouselControls
            :count="services.length"
            :active="servicesCarousel.index"
            prev-label="Previous service"
            next-label="Next service"
            dot-label="Show service"
            @prev="servicesCarousel.prev"
            @next="servicesCarousel.next"
            @select="servicesCarousel.setActive"
        />
      </div>

      <!-- Desktop grid -->
      <div class="hidden md:grid md:grid-cols-3 gap-7">
        <div
            v-for="(service, i) in services"
            :key="service.title"
            class="transition-all duration-700 ease-out hover:-translate-y-1.5"
            :class="visible.services ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-14 scale-95'"
            :style="{ transitionDelay: visible.services ? `${i * 150}ms` : '0ms' }"
        >
          <HomeServiceCard :service="service" />
        </div>
      </div>
    </div>
  </section>

  <!-- Process Section -->
  <section
      id="process"
      ref="processSection"
      class="px-[5%] py-24 bg-sectionLight border-t border-b border-borderDefault font-primary"
  >
    <div class="max-w-6xl mx-auto">
      <div
          class="text-center max-w-2xl mx-auto mb-[72px] transition-all duration-700 ease-out"
          :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">Our Process</span>
        <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
          How We Bring Ideas to Life
        </h2>
        <p class="text-textBody mt-4 leading-relaxed font-primary">
          A battle-tested process that eliminates uncertainty and delivers results on time, every time.
        </p>
      </div>

      <!-- Mobile slider -->
      <div
          class="lg:hidden relative"
          @mouseenter="processCarousel.pauseIfFinePointer"
          @mouseleave="processCarousel.resume"
          @touchstart="processCarousel.onTouchStart"
          @touchend="processCarousel.onTouchEnd"
      >
        <div class="relative min-h-[220px]">
          <div
              v-for="(step, index) in steps"
              :key="`mobile-${step.number}`"
              :class="[
                'absolute inset-0 flex flex-col items-center text-center px-6 transition-all duration-500 ease-out',
                index === processCarousel.index
                  ? 'opacity-100 visible translate-x-0 scale-100 pointer-events-auto z-20'
                  : index === processCarousel.exitingIndex
                    ? 'opacity-0 invisible -translate-x-6 scale-[0.98] z-10'
                    : 'opacity-0 invisible translate-x-6 scale-[0.98] pointer-events-none z-0',
              ]"
          >
            <div :class="['relative z-[1] w-[72px] h-[72px] rounded-full flex items-center justify-center font-bold text-[22px] mb-5 border-2 font-display', step.circleClass]">
              {{ step.number }}
              <span :class="['absolute -inset-1.5 rounded-full border-2 animate-[ringPulse_2.5s_ease-out_infinite]', step.ringClass]"></span>
            </div>
            <h4 class="text-base font-bold text-headingCard mb-2 font-display">{{ step.title }}</h4>
            <p class="text-[13px] text-textBody leading-relaxed max-w-sm font-primary">{{ step.description }}</p>
          </div>
        </div>
        <HomeCarouselControls
            :count="steps.length"
            :active="processCarousel.index"
            prev-label="Previous step"
            next-label="Next step"
            dot-label="Show step"
            @prev="processCarousel.prev"
            @next="processCarousel.next"
            @select="processCarousel.setActive"
        />
      </div>

      <!-- Desktop grid -->
      <div class="relative hidden lg:grid lg:grid-cols-4 gap-y-0">
        <div
            class="hidden lg:block absolute top-9 h-0.5 bg-gradientLine opacity-45 origin-left transition-transform duration-[1200ms] ease-out"
            :style="{ left: 'calc(12.5% + 18px)', right: 'calc(12.5% + 18px)', transform: lineVisible ? 'scaleX(1)' : 'scaleX(0)' }"
        ></div>

        <div
            v-for="(step, i) in steps"
            :key="step.number"
            class="relative flex flex-col items-center text-center px-4 transition-all duration-700 ease-out"
            :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
            :style="{ transitionDelay: visible.process ? `${i * 150}ms` : '0ms' }"
        >
          <div :class="['relative z-[1] w-[72px] h-[72px] rounded-full flex items-center justify-center font-bold text-[22px] mb-6 border-2 transition-transform duration-300 hover:scale-[1.12] font-display', step.circleClass]">
            {{ step.number }}
            <span :class="['absolute -inset-1.5 rounded-full border-2 animate-[ringPulse_2.5s_ease-out_infinite]', step.ringClass]"></span>
          </div>
          <h4 class="text-base font-bold text-headingCard mb-2.5 font-display">{{ step.title }}</h4>
          <p class="text-[13px] text-textBody leading-relaxed font-primary">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section
      id="about"
      ref="aboutRef"
      class="px-[5%] py-24 font-primary"
  >
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div
          class="relative transition-all duration-700 ease-out"
          :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'"
      >
        <div class="w-full rounded-[20px] overflow-hidden bg-sectionLight border border-borderDefault shadow-lg">
          <img :src="aboutIllustration" alt="About Rasant Solutions" loading="lazy" decoding="async" class="w-full block max-h-[180px] lg:max-h-full object-contain p-3 lg:p-0" />
        </div>

        <!-- Avg Delivery Badge -->
        <div class="absolute -bottom-4 -left-2 lg:-bottom-5 lg:-left-7 max-w-[150px] lg:max-w-[200px] bg-card rounded-xl px-3 py-2.5 lg:px-5 lg:py-4 shadow-xl border border-borderDefault font-primary">
          <div class="text-[9px] lg:text-[10px] uppercase tracking-wide text-textSupporting mb-1">Avg. Delivery</div>
          <div class="text-[16px] lg:text-[22px] font-bold text-textBrand font-display">3 Weeks</div>
          <div class="text-[10px] lg:text-[11px] text-textSupporting mt-0.5">From design to launch</div>
        </div>

        <!-- Client Retention Badge -->
        <div class="absolute -top-4 -right-2 lg:-top-5 lg:-right-5 max-w-[150px] lg:max-w-[200px] bg-card rounded-xl px-3 py-2.5 lg:px-5 lg:py-4 shadow-xl border border-borderDefault font-primary">
          <div class="text-[9px] lg:text-[10px] uppercase tracking-wide text-textSupporting mb-1">Client Retention</div>
          <div class="text-[16px] lg:text-[22px] font-bold text-Success font-display">94%</div>
          <div class="text-[10px] lg:text-[11px] text-textSupporting mt-0.5">Return for new projects</div>
        </div>
      </div>

      <div
          class="transition-all duration-700 ease-out delay-200"
          :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'"
      >
        <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">Why Rasant</span>
        <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
          Built to Deliver.<br />Designed to Last.
        </h2>
        <p class="text-textBody mt-4 leading-relaxed font-primary">
          We're not just another dev shop. We embed ourselves in your business and build software that solves real problems — not just specs on paper.
        </p>

        <ul class="hidden md:flex flex-col gap-4 mt-8">
          <li
              v-for="(feature, i) in aboutFeatures"
              :key="feature.title"
              class="group flex items-start gap-4 bg-card border border-borderDefault rounded-xl px-5 py-[18px] shadow-sm transition-all duration-700 ease-out hover:bg-tagBlueBg hover:border-activeBorder/25 hover:translate-x-1.5 hover:shadow-md"
              :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'"
              :style="{ transitionDelay: visible.about ? `${300 + i * 100}ms` : '0ms' }"
          >
            <span
                :class="['w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse', feature.dotColor, feature.delayClass]"></span>
            <div>
              <h4 class="text-sm font-semibold text-headingCard mb-1 font-display">{{ feature.title }}</h4>
              <p class="text-[13px] text-textBody leading-relaxed font-primary">{{ feature.description }}</p>
            </div>
          </li>
        </ul>

        <!-- Mobile slider -->
        <div
            class="md:hidden mt-8"
            @mouseenter="aboutCarousel.pauseIfFinePointer"
            @mouseleave="aboutCarousel.resume"
            @touchstart="aboutCarousel.onTouchStart"
            @touchend="aboutCarousel.onTouchEnd"
        >
          <div class="relative min-h-[140px]">
            <article
                v-for="(feature, index) in aboutFeatures"
                :key="`about-${feature.title}`"
                :class="[
                  'absolute inset-0 flex items-start gap-4 bg-card border border-borderDefault rounded-2xl px-5 py-5 shadow-blue transition-all duration-500 ease-out',
                  index === aboutCarousel.index
                    ? 'opacity-100 visible translate-x-0 scale-100 pointer-events-auto z-20'
                    : index === aboutCarousel.exitingIndex
                      ? 'opacity-0 invisible -translate-x-6 scale-[0.98] z-10'
                      : 'opacity-0 invisible translate-x-6 scale-[0.98] pointer-events-none z-0',
                ]"
            >
              <span
                  :class="['w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse', feature.dotColor, feature.delayClass]"
              ></span>
              <div>
                <h4 class="text-sm font-semibold text-headingCard mb-1 font-display">{{ feature.title }}</h4>
                <p class="text-[13px] text-textBody leading-relaxed font-primary">{{ feature.description }}</p>
              </div>
            </article>
          </div>
          <HomeCarouselControls
              :count="aboutFeatures.length"
              :active="aboutCarousel.index"
              prev-label="Previous feature"
              next-label="Next feature"
              dot-label="Show feature"
              @prev="aboutCarousel.prev"
              @next="aboutCarousel.next"
              @select="aboutCarousel.setActive"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Client Reviews Section -->
  <section
      id="reviews"
      ref="testimonialsRef"
      class="px-[5%] py-24 font-primary overflow-hidden"
      @mouseenter="pauseTestimonialAuto"
      @mouseleave="resumeTestimonialAuto"
  >
    <div class="max-w-7xl mx-auto">
      <div
          class="text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ease-out"
          :class="visible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">Client Reviews</span>
        <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
          Trusted by<br />Real Businesses
        </h2>
        <p class="text-textBody mt-4 leading-relaxed font-primary">
          Partners across hosting, creative, and IT services — built with Vue.js, chatbots, and custom software.
        </p>
      </div>

      <div
          class="relative max-w-4xl mx-auto transition-all duration-700 ease-out delay-150"
          :class="visible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
      >
        <div class="grid grid-cols-1 gap-3 items-center sm:grid-cols-[auto_1fr_auto]">
          <button
              type="button"
              aria-label="Previous review"
              @click="testimonialPrev"
              class="group hidden sm:flex w-11 h-11 rounded-full cursor-pointer border border-borderDefault bg-card text-headingCard items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-sm transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>

          <div
              class="relative min-h-[300px] sm:min-h-[300px] rounded-[24px] border border-borderDefault bg-card shadow-blue overflow-hidden"
              @touchstart="testimonialsCarousel.onTouchStart"
              @touchend="testimonialsCarousel.onTouchEnd"
          >
            <article
                v-for="(testimonial, index) in testimonials"
                :key="testimonial.company"
                :class="[
                  'absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col transition-all duration-500 ease-out',
                  index === testimonialsCarousel.index
                    ? 'opacity-100 visible translate-x-0 scale-100 pointer-events-auto z-20'
                    : index === testimonialsCarousel.exitingIndex
                      ? 'opacity-0 invisible -translate-x-6 scale-[0.98] z-10'
                      : 'opacity-0 invisible translate-x-6 scale-[0.98] pointer-events-none z-0',
                ]"
            >
              <div class="flex flex-wrap items-center gap-2 mb-5">
                <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-tagBlueBg text-textBrand border border-borderDefault">
                  {{ testimonial.service }}
                </span>
                <div class="flex gap-1">
                  <font-awesome-icon v-for="n in 5" :key="n" :icon="['fas', 'star']" class="text-headingCard text-xs" />
                </div>
              </div>

              <p class="text-[15px] sm:text-base text-textBody leading-[1.75] italic flex-1 font-primary">
                "{{ testimonial.quote }}"
              </p>

              <div class="mt-6 pt-5 border-t border-borderDefault">
                <div class="flex items-center gap-3">
                  <div :class="['w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 font-primary', testimonial.avatarBg]">
                    {{ testimonial.initials }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-headingCard font-display">{{ testimonial.company }}</div>
                    <div class="text-xs text-textSupporting mt-0.5 font-primary">{{ testimonial.role }}</div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <button
              type="button"
              aria-label="Next review"
              @click="testimonialNext"
              class="group hidden sm:flex w-11 h-11 rounded-full border border-borderDefault bg-card text-headingCard items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-sm transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        <HomeCarouselControls
            class="sm:hidden"
            :count="testimonials.length"
            :active="testimonialsCarousel.index"
            prev-label="Previous review"
            next-label="Next review"
            dot-label="Show review"
            @prev="testimonialPrev"
            @next="testimonialNext"
            @select="setTestimonialActive"
        />

        <div class="hidden sm:flex items-center justify-center gap-2 mt-6">
          <button
              v-for="(testimonial, index) in testimonials"
              :key="`${testimonial.company}-dot`"
              type="button"
              :aria-label="`Show review from ${testimonial.company}`"
              @click="setTestimonialActive(index)"
              class="h-2 rounded-full transition-all duration-300"
              :class="index === testimonialsCarousel.index ? 'w-7 bg-primary-500' : 'w-2 bg-borderDefault hover:bg-primary-300'"
          ></button>
        </div>
      </div>
    </div>
  </section>

  <Footer />
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/footer.vue'
import HomeServiceCard from '@/components/home/HomeServiceCard.vue'
import HomeCarouselControls from '@/components/home/HomeCarouselControls.vue'
import { useHomeCarousel } from '@/composables/useHomeCarousel.js'
import sentraPlatformSvg from '@/assets/svg/sentra-platform.svg'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import sentraBotSvg from '@/assets/svg/sentra-bot.svg'
import aiAgentSvg from '@/assets/svg/ai-agent-phone-bot.svg'
import chatbotSvg from '@/assets/svg/chatbot-messenger-bot.svg'
import orchestriSvg from '@/assets/svg/orchestri-agent-bot.svg'
import serviceSoftwareSvg from '@/assets/svg/service-software.svg'
import serviceWebMobileSvg from '@/assets/svg/service-webmobile.svg'
import serviceCloudSvg from '@/assets/svg/service-cloud.svg'
import aboutIllustration from '@/assets/svg/hero-illustration.svg'
import ShineButton from "@/components/ShineButton.vue";

const router = useRouter()
const route = useRoute()

const techRef        = ref(null)
const platformRef    = ref(null)
const productsRef    = ref(null)
const servicesRef    = ref(null)
const aboutRef       = ref(null)
const testimonialsRef= ref(null)
const processSection = ref(null)

const visible = ref({
  hero:         true,
  tech:         false,
  platform:     false,
  products:     false,
  services:     false,
  process:      false,
  about:        false,
  testimonials: false,
})

let sectionObserver = null
const refKeyMap = new Map()

function observeSection(el, key) {
  if (!el) return
  refKeyMap.set(el, key)
  sectionObserver.observe(el)
}

const heroLoaded = ref(false)
const uptimeCounter = ref(0)
const deliveryProgress = ref(0)
const deliveryDisplay = ref(0)
const chartPathLength = ref(320)
const chartDot = ref({ x: 0, y: 45 })
const chartLineRef = ref(null)
let uptimeTimer = null

const chartDashOffset = computed(() =>
    chartPathLength.value * (1 - deliveryProgress.value / 100)
)

function syncChartDot() {
  const path = chartLineRef.value
  if (!path) return
  const len = path.getTotalLength()
  if (len > 0) chartPathLength.value = len
  const pt = path.getPointAtLength(len * deliveryProgress.value / 100)
  chartDot.value = { x: pt.x, y: pt.y }
}

function animateHeroMetrics() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    uptimeCounter.value = 99
    deliveryProgress.value = 99
    deliveryDisplay.value = 3
    syncChartDot()
    return
  }

  const target = 99
  const duration = 1800
  const stepCount = 60
  const increment = target / stepCount
  const interval = duration / stepCount
  let current = 0
  uptimeTimer = setInterval(() => {
    current += increment
    const progress = Math.min(current, target)
    uptimeCounter.value = Math.floor(progress)
    deliveryProgress.value = progress
    deliveryDisplay.value = Math.min(3, Math.max(1, Math.round((progress / target) * 3)))
    syncChartDot()
    if (progress >= target) {
      uptimeCounter.value = target
      deliveryProgress.value = target
      deliveryDisplay.value = 3
      syncChartDot()
      clearInterval(uptimeTimer)
    }
  }, interval)
}

const lineVisible = ref(false)

const scrollToProducts = () => {
  const el = document.getElementById('products')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
const techStack = [
  { name: 'Python',   icon: ['fab', 'python'],   color: 'text-[#3776AB]', chipClass: 'bg-[#EFF6FF] border-[#3776AB]/25' },
  { name: 'Vue.js',   icon: ['fab', 'vuejs'],    color: 'text-[#42B883]', chipClass: 'bg-[#ECFDF5] border-[#42B883]/25' },
  { name: 'React',    icon: ['fab', 'react'],    color: 'text-[#61DAFB]', chipClass: 'bg-[#EFF6FF] border-[#61DAFB]/30' },
  { name: 'Java',     icon: ['fab', 'java'],     color: 'text-[#E76F00]', chipClass: 'bg-[#FFF7ED] border-[#E76F00]/25' },
  { name: 'Grails',   icon: ['fas', 'seedling'], color: 'text-[#8E6CF0]', chipClass: 'bg-[#F5F3FF] border-[#8E6CF0]/25' },
  { name: 'HTML',     icon: ['fab', 'html5'],    color: 'text-[#E34F26]', chipClass: 'bg-[#FFF1F2] border-[#E34F26]/25' },
  { name: 'CSS',      icon: ['fab', 'css3-alt'], color: 'text-[#1572B6]', chipClass: 'bg-[#EFF6FF] border-[#1572B6]/25' },
  { name: 'Tailwind', icon: ['fas', 'wind'], color: 'text-[#38BDF8]', chipClass: 'bg-[#ECFEFF] border-[#38BDF8]/25' },
  
]

const words = ['Intelligent', 'Scalable', 'Beautiful', 'Future-Ready']
const currentWordIndex = ref(0)
let rotateInterval = null

const techList = [
  { name: 'Python',   icon: ['fab', 'python'],     color: 'text-[#3776AB]' },
  { name: 'Vue.js',   icon: ['fab', 'vuejs'],       color: 'text-[#42B883]' },
  { name: 'React',    icon: ['fab', 'react'],       color: 'text-[#61DAFB]' },
  { name: 'Java',     icon: ['fab', 'java'],        color: 'text-[#E76F00]' },
  { name: 'Grails',   icon: ['fas', 'seedling'],    color: 'text-[#8E6CF0]' },
  { name: 'HTML',     icon: ['fab', 'html5'],       color: 'text-[#E34F26]' },
  { name: 'CSS',      icon: ['fab', 'css3-alt'],    color: 'text-[#1572B6]' },
  { name: 'Tailwind', icon: ['fas', 'wind'],    color: 'text-[#38BDF8]' },
  { name: 'WordPress', icon: ['fab', 'wordpress'], color: 'text-[#21759B]' },
]

const products = [
  {
    tag: 'Main Product', tagClass: 'tag-blue',
    title: 'Sentra AI',
    description: 'Omni-channel call center with AI routing, agent workbench, and real-time supervision. The platform everything else plugs into.',
    ctaText: 'Explore platform', ctaLink: '/sentra', svg: sentraBotSvg,
    glow: 'bg-glowBlue',
  },
  {
    tag: 'Voice', tagClass: 'tag-teal',
    title: 'AI Agent',
    description: 'Talking voice agents for customer service, internal dialing, and outbound campaigns — with natural speech and live call dashboards.',
    ctaText: 'View Voice AI Agent', ctaLink: '/ai-agent', svg: aiAgentSvg,
    glow: 'bg-glowTeal',
  },
  {
    tag: 'Chat', tagClass: 'tag-teal',
    title: 'Chatbot Agent',
    description: 'Conversational AI for web, WhatsApp, and in-app chat — grounded in your documents with token analytics and live handoff.',
    ctaText: 'View Chatbot Agent', ctaLink: '/chatbot', svg: chatbotSvg,
    glow: 'bg-glowPurple',
  },
  {
    tag: 'SDLC', tagClass: 'tag-teal',
    title: 'Orchestri',
    description: 'AI-driven multi-agent SDLC — gated spec, plan, implement, test, and deploy workflow on your local project folder.',
    ctaText: 'View Orchestri', ctaLink: '/orchestri', svg: orchestriSvg,
    glow: 'bg-glowBlue',
  },
]

const services = [
  {
    title: 'Custom Software Development',
    description: 'Tailor-made backends and business apps in Java, Grails, and Python. Scalable APIs and integrations built for your workflows — not off-the-shelf compromises.',
    illustration: serviceSoftwareSvg,
    icon: ['fas', 'code'],
    iconBg: 'bg-tagBlueBg',
    iconColor: 'text-iconDark',
    link: '/services/custom-software',
    tags: [
      { label: 'Java / Grails', class: 'tag-blue'  },
      { label: 'Python',        class: 'tag-teal'  },
      { label: 'APIs',          class: 'tag-amber' },
    ],
  },
  {
    title: 'Web Applications',
    description: 'Responsive web apps and admin portals with Vue.js, React, Tailwind CSS, and semantic HTML. Polished UI that loads fast and works on every device.',
    illustration: serviceWebMobileSvg,
    icon: ['fas', 'desktop'],
    iconBg: 'bg-tagSkyBg',
    iconColor: 'text-iconDark',
    link: '/services/web-applications',
    tags: [
      { label: 'Vue.js / React', class: 'tag-blue'   },
      { label: 'Tailwind',       class: 'tag-purple' },
      { label: 'HTML / CSS',     class: 'tag-teal'   },
    ],
  },
  {
    title: 'WordPress & CMS',
    description: 'WordPress websites, custom themes, and CMS integrations. Content sites your team can update easily — built with HTML and Tailwind for a sharp look.',
    illustration: serviceCloudSvg,
    icon: ['fab', 'wordpress'],
    iconBg: 'bg-tagTealBg',
    iconColor: 'text-iconDark',
    link: '/services/wordpress-cms',
    tags: [
      { label: 'WordPress',      class: 'tag-teal'  },
      { label: 'Custom Themes',  class: 'tag-blue'  },
      { label: 'Integrations',   class: 'tag-amber' },
    ],
  },
]

const steps = [
  { number: '01', title: 'Discovery',      description: 'We deep-dive into your business goals, user needs, and technical requirements to map the full scope.',             circleClass: 'step-1', ringClass: 'ring-step-1' },
  { number: '02', title: 'Design',         description: 'UI/UX wireframes and prototypes that are validated with real accounts before a single line of code is written.',     circleClass: 'step-2', ringClass: 'ring-step-2' },
  { number: '03', title: 'Build',          description: 'Agile sprints with continuous delivery. You see progress every two weeks — no black-box development.',            circleClass: 'step-3', ringClass: 'ring-step-3' },
  { number: '04', title: 'Launch & Scale', description: 'Rigorous QA, zero-downtime deployment, and ongoing support to keep your product growing.',                        circleClass: 'step-4', ringClass: 'ring-step-4' },
]

const aboutFeatures = [
  { title: 'Expert Engineering Team',     description: 'Senior engineers across Java, Grails, Python, Vue.js, React, and WordPress — with deep experience in fintech, logistics, and e-commerce.', dotColor: 'bg-statusActive',  delayClass: '' },
  { title: 'Transparent Communication',   description: "Weekly demos, real-time project tracking, and a dedicated project manager. You're never in the dark.",                    dotColor: 'bg-step2Border',   delayClass: '[animation-delay:-0.6s]' },
  { title: 'Scalable Architecture',       description: 'We build for tomorrow, not just today. Clean, documented code that grows with your business without rewrites.',           dotColor: 'bg-statusSuccess', delayClass: '[animation-delay:-1.2s]' },
  { title: 'Post-Launch Support',         description: 'We stay with you after go-live. Maintenance, performance tuning, and feature additions on demand.',                       dotColor: 'bg-statusWarning', delayClass: '[animation-delay:-1.8s]' },
]

const testimonials = [
  {
    company: 'Hostbreak',
    role: 'Web Hosting · Islamabad, Pakistan',
    initials: 'HB',
    avatarBg: 'bg-avatarTestimonial1',
    service: 'Vue.js Development',
    quote: 'Rasant built our Vue.js client portal and admin dashboard — fast, responsive, and straightforward for our team to extend. They understood hosting workflows and delivered on time.',
  },
  {
    company: 'SAP Communications',
    role: 'Creative Agency · Pakistan',
    initials: 'SC',
    avatarBg: 'bg-avatarTestimonial2',
    service: 'AI Chatbot',
    quote: 'The chatbot on our site answers visitor questions instantly and captures leads while we focus on creative work. Setup was smooth and handoff to our team was seamless.',
  },
  {
    company: 'Sprint Solutions',
    role: 'IT & Business Services · Gujranwala, Pakistan',
    initials: 'SS',
    avatarBg: 'bg-avatarTestimonial3',
    service: 'Custom Software',
    quote: 'Rasant helped us streamline internal operations with a tailored software solution — reliable APIs, clear documentation, and a team that stayed responsive from kickoff through launch.',
  },
]

const productsCarousel = useHomeCarousel(products.length, { autoMs: 6000 })
const servicesCarousel = useHomeCarousel(services.length, { autoMs: 5500 })
const processCarousel = useHomeCarousel(steps.length, { autoMs: 6000 })
const aboutCarousel = useHomeCarousel(aboutFeatures.length, { autoMs: 5500 })
const testimonialsCarousel = useHomeCarousel(testimonials.length, { autoMs: 5500 })

const setTestimonialActive = (newIndex) => testimonialsCarousel.setActive(newIndex)
const testimonialNext = () => testimonialsCarousel.next()
const testimonialPrev = () => testimonialsCarousel.prev()
const pauseTestimonialAuto = () => testimonialsCarousel.pauseIfFinePointer()
const resumeTestimonialAuto = () => testimonialsCarousel.resume()

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  setTimeout(() => {
    heroLoaded.value = true
    nextTick(() => {
      syncChartDot()
      setTimeout(animateHeroMetrics, 400)
    })
  }, 100)

  rotateInterval = setInterval(() => {
    currentWordIndex.value = (currentWordIndex.value + 1) % words.length
  }, 2200)

  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const key = refKeyMap.get(entry.target)
        if (key) visible.value[key] = true
        sectionObserver.unobserve(entry.target)
        refKeyMap.delete(entry.target)
      }
    })
  }, { threshold: 0.12 })

  observeSection(techRef.value, 'tech')
  observeSection(platformRef.value, 'platform')
  observeSection(productsRef.value, 'products')
  observeSection(servicesRef.value, 'services')
  observeSection(processSection.value, 'process')
  observeSection(aboutRef.value, 'about')
  observeSection(testimonialsRef.value, 'testimonials')

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
  }

  onUnmounted(() => processObserver.disconnect())
})

onUnmounted(() => {
  clearInterval(rotateInterval)
  clearInterval(uptimeTimer)
  if (sectionObserver) sectionObserver.disconnect()
  refKeyMap.clear()
})
</script>

<style scoped>
.blinking-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background-color: var(--color-codeFunction);
  margin-left: 4px;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
}
@keyframes blink {
  from, to { background-color: transparent }
  50%       { background-color: var(--color-codeFunction) }
}
.hero-chart-dot {
  filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.6));
}
.hero-chart-dot-ring {
  animation: chartDotPulse 2s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes chartDotPulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.35); }
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
.tech-marquee-track { will-change: transform; }
@media (max-width: 639px) {
  .tech-marquee-track { animation-duration: 20s; }
}
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

/* Respect accounts who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee,
  .animate-float,
  .animate-pulse,
  [class*="animate-\[ringPulse"],
  .hero-chart-dot-ring,
  .blinking-cursor,
  .tech-chip {
    animation: none !important;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>