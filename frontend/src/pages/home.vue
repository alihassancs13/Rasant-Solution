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
          Rasant Solutions engineers bold digital products — from cloud-native platforms to AI-powered apps — built to launch fast and scale without limits.
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <ShineButton to="/contact" size="xl">
            Start Your Project
            <svg class="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </ShineButton>
          <ShineButton to="/#products" variant="outline" size="xl">
            See Our Work
          </ShineButton>
        </div>

        <!-- Trust section -->
        <div class="flex items-center gap-4 pt-2">
          <div class="flex -space-x-3">
            <div class="w-9 h-9 rounded-full bg-avatarPinkTeal border-2 border-white flex items-center justify-center text-[11px] font-bold text-white font-primary">
              AK
            </div>
            <div class="w-9 h-9 rounded-full bg-avatarPurpleBlue border-2 border-white flex items-center justify-center text-[11px] font-bold text-white font-primary">
              SR
            </div>
            <div class="w-9 h-9 rounded-full bg-avatarBlue border-2 border-white flex items-center justify-center text-[11px] font-bold text-white font-primary">
              MJ
            </div>
            <div class="w-9 h-9 rounded-full bg-avatarTeal border-2 border-white flex items-center justify-center text-[11px] font-bold text-white font-primary">
              +
            </div>
          </div>
          <p class="text-sm text-textBody font-primary">
            <span class="font-bold text-brandDark">50+ clients</span> shipped products with us this year
          </p>
        </div>
      </div>

      <!-- Right cards -->
      <div
          class="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-5 items-start relative transition-all duration-1000 ease-out delay-300"
          :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
      >
        <!-- Card 1: Code example -->
        <div class="md:col-span-2 bg-card rounded-xl shadow-blue border border-borderDefault flex flex-col h-44 max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 border-b border-borderDefault bg-cardHeader">
            <div class="flex space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-Error"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-Warning"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-Success"></span>
            </div>
            <span class="text-[11px] text-textSupporting font-mono">rasant — build.ts</span>
            <div class="w-10"></div>
          </div>
          <div class="p-3.5 font-mono text-[11px] leading-relaxed text-textBody flex-1 flex flex-col justify-between">
            <div>
              <p><span class="text-codeKeyword font-semibold">const</span> app = <span class="text-codeKeyword">await</span> <span class="text-codeFunction">rasant.build</span>({</p>
              <p class="pl-4">stack: [<span class="text-codeString">"React"</span>, <span class="text-codeString">"Node"</span>, <span class="text-codeString">"AWS"</span>],</p>
              <p class="pl-4">deploy: <span class="text-codeString">"production"</span></p>
              <p>});<br /><span class="blinking-cursor"></span></p>
            </div>
            <div class="pt-2.5 border-t border-borderDefault flex items-center text-[10px] text-textSupporting font-semibold">
              <span class="text-Success mr-1.5">✓</span> Deployed &nbsp;•&nbsp; 0 downtime &nbsp;•&nbsp; 99% uptime
            </div>
          </div>
        </div>

        <!-- Card 2: Deployed -->
        <div class="bg-card rounded-xl shadow-blue border border-borderDefault p-6 flex flex-col items-center justify-center text-center h-44 md:h-auto md:row-span-2 self-stretch">
          <div class="w-14 h-14 rounded-full bg-SuccessLight flex items-center justify-center border-4 border-accent-1/20 mb-3">
            <svg class="w-6 h-6 text-accent-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-bold text-headingCard text-sm font-primary">Deployed</h3>
          <p class="text-[11px] text-textSupporting mt-0.5 font-primary">Production • 0 downtime</p>
        </div>

        <!-- Card 3: Uptime -->
        <div class="bg-card rounded-xl shadow-blue border border-borderDefault p-5 flex flex-col justify-between h-36">
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
        <div class="bg-card rounded-xl shadow-blue border border-borderDefault p-5 flex flex-col justify-between h-36">
          <span class="text-[10px] font-bold text-textSupporting tracking-wider uppercase font-primary">Tech Stack</span>
          <div class="grid grid-cols-2 gap-1.5">
            <span
                v-for="tech in techStack"
                :key="tech"
                class="text-[11px] font-semibold bg-techItem border border-borderDefault rounded-lg py-1.5 px-1 text-center text-textBody font-primary"
            >
              {{ tech }}
            </span>
          </div>
        </div>

        <!-- Card 5: Faster Delivery -->
        <div class="md:col-span-3 bg-card rounded-xl shadow-blue border border-borderDefault p-4 flex items-center justify-between space-x-6">
          <div class="flex-1 h-10 flex items-end relative overflow-hidden">
            <svg class="w-full h-full text-blobPrimary" viewBox="0 0 300 50" preserveAspectRatio="none">
              <path d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5 L 300 50 L 0 50 Z" fill="currentColor"/>
              <path d="M0 45 C 50 43, 80 30, 120 32 C 160 34, 200 15, 250 18 L 300 5" fill="none" stroke="currentColor" stroke-width="2.5"/>
            </svg>
          </div>
          <div class="text-right shrink-0">
            <div class="text-2xl font-bold text-metricWarn font-display">3x</div>
            <div class="text-[11px] font-medium text-textSupporting mt-0.5 font-primary">Faster delivery</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trusted Technologies -->
  <section
      ref="techRef"
      class="bg-sectionLight border-t border-borderDefault px-30 py-10 overflow-hidden font-primary"
  >
    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
      <p
          class="text-center text-xs font-bold tracking-widest text-textSupporting uppercase mb-6 transition-all duration-700 ease-out font-primary"
          :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        Trusted Technologies We Build With
      </p>
    </div>

    <div
        class="relative transition-all duration-700 ease-out delay-200"
        :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <div class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-sectionLight to-transparent z-10"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-sectionLight to-transparent z-10"></div>
      <div class="overflow-hidden">
        <div class="flex gap-6 w-max animate-marquee">
          <div
              v-for="tech in techListLooped"
              :key="tech.key"
              class="inline-flex items-center gap-2 bg-card border border-borderDefault rounded-full px-5 py-2.5 shadow-sm whitespace-nowrap shrink-0 font-primary"
          >
            <font-awesome-icon :icon="tech.icon" :class="['text-sm', tech.color]" />
            <span class="text-sm font-semibold text-brandDark">{{ tech.name }}</span>
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
      class="relative overflow-hidden px-[5%] py-24 scroll-mt-20 font-primary"
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
        class="relative z-10 max-w-[1100px] mx-auto transition-all duration-700 ease-out delay-200"
        :class="visible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        @mouseenter="pauseAuto"
        @mouseleave="resumeAuto"
    >
      <div class="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
        <button
            type="button"
            aria-label="Previous product"
            @click="prev"
            class="group hidden lg:flex w-11 h-11 rounded-full cursor-pointer border border-borderDefault bg-card text-headingCard items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange font-primary"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-sm transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>

        <div class="relative rounded-[28px] border border-activeBorder/20 bg-cardSemi shadow-lg overflow-hidden lg:min-h-[380px]">
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
                <h3 class="text-2xl lg:text-[32px] font-bold tracking-tight text-headingCard mb-3 font-display">
                  {{ product.title }}
                </h3>
                <p class="text-[15px] text-textBody leading-relaxed mb-5 max-w-[420px] font-primary">
                  {{ product.description }}
                </p>
                <ShineButton :to="product.ctaLink" size="sm">
                  {{ product.ctaText }}
                  <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-200 cursor-pointer group-hover:translate-x-1" />
                </ShineButton>
              </div>

              <div class="relative flex cursor-pointer items-center justify-center min-h-[200px] lg:min-h-[280px] lg:max-h-[320px] order-first lg:order-none">
                <div :class="['absolute inset-y-[5%] inset-x-0 rounded-full blur-md animate-pulse pointer-events-none', product.glow]"></div>
                <object
                    :data="product.svg"
                    type="image/svg+xml"
                    :title="product.title"
                    class="relative z-[1] w-full max-h-[220px] lg:max-h-[300px] block rounded-xl drop-shadow-[0_16px_36px_rgba(15,23,42,0.1)] animate-float transition-transform duration-500 ease-out hover:scale-105"
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
            class="group hidden lg:flex w-11 h-11 rounded-full border border-borderDefault bg-card text-headingCard items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange font-primary"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-sm cursor-pointer transition-transform duration-200 group-hover:translate-x-0.5" />
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
            'relative cursor-pointer px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 font-primary',
            index === activeIndex
              ? 'bg-buttonPrimaryHover border-buttonPrimaryBorder text-white shadow-orange scale-105'
              : 'border-borderDefault bg-card text-textBody hover:border-buttonPrimaryBorder/40 hover:text-brandDark'
          ]"
        >
          {{ product.title }}
          <span
              v-if="index === activeIndex"
              class="absolute -inset-1 rounded-full border-2 border-buttonPrimaryBorder animate-[ringPulse_2.5s_ease-out_infinite] pointer-events-none"
          ></span>
        </button>
      </div>

      <div class="h-[3px] bg-blobPrimary rounded-full mt-4 overflow-hidden">
        <span
            :class="['block h-full rounded-full bg-gradientProgress', progressActive ? 'w-full' : 'w-0']"
            :style="{ transition: progressActive ? `width ${SLIDE_DURATION}ms linear` : 'none' }"
        ></span>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section
      id="services"
      ref="servicesRef"
      class="px-[5%] py-24 bg-sectionWhite scroll-mt-20 font-primary"
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
            From idea to deployment — we handle every layer of your digital product.
          </p>
          <ShineButton to="/services" variant="outline" size="sm" class="mt-4">
            All Services
          </ShineButton>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
        <div
            v-for="(service, i) in services"
            :key="service.title"
            class="group bg-card rounded-xl border border-borderDefault shadow-blue p-7 transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-insetBlue"
            :class="visible.services ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-14 scale-95'"
            :style="{ transitionDelay: visible.services ? `${i * 150}ms` : '0ms', animationDelay: `${i * 0.4}s` }"
        >
          <img
              :src="service.illustration"
              :alt="service.title"
              loading="lazy"
              decoding="async"
              class="w-full h-36 object-contain mb-5 transition-transform duration-500 ease-out group-hover:scale-110 animate-float"
          />
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 ease-out', service.iconBg]">
            <font-awesome-icon :icon="service.icon" :class="['text-3xl', service.iconColor]" />
          </div>
          <h3 class="text-lg font-bold text-headingCard mb-2.5 font-display">{{ service.title }}</h3>
          <p class="text-sm text-textBody leading-relaxed mb-5 font-primary">{{ service.description }}</p>
          <div class="flex flex-wrap gap-2 mb-6">
            <span
                v-for="tag in service.tags"
                :key="tag.label"
                :class="['text-xs font-semibold px-3 py-1.5 rounded-full transition-transform duration-200 hover:scale-105', tag.class]"
            >
              {{ tag.label }}
            </span>
          </div>
          <RouterLink
              :to="service.link"
              class="inline-flex items-center gap-2 text-sm font-bold text-textBrand group-hover:gap-3 transition-all duration-200 font-primary"
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

      <div class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-y-0">
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
          <img :src="aboutIllustration" alt="About Rasant Solutions" loading="lazy" decoding="async" class="w-full block" />
        </div>
        <div class="absolute -bottom-5 -left-7 max-w-[200px] bg-card rounded-xl px-5 py-4 shadow-xl border border-borderDefault font-primary">
          <div class="text-[10px] uppercase tracking-wide text-textSupporting mb-1">Avg. Delivery</div>
          <div class="text-[22px] font-bold text-textBrand font-display">3 Weeks</div>
          <div class="text-[11px] text-textSupporting mt-0.5">From design to launch</div>
        </div>
        <div class="absolute -top-5 -right-5 max-w-[200px] bg-card rounded-xl px-5 py-4 shadow-xl border border-borderDefault font-primary">
          <div class="text-[10px] uppercase tracking-wide text-textSupporting mb-1">Client Retention</div>
          <div class="text-[22px] font-bold text-Success font-display">94%</div>
          <div class="text-[11px] text-textSupporting mt-0.5">Return for new projects</div>
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

        <ul class="flex flex-col gap-4 mt-8">
          <li
              v-for="(feature, i) in aboutFeatures"
              :key="feature.title"
              class="group flex items-start gap-4 bg-card border border-borderDefault rounded-xl px-5 py-[18px] shadow-sm transition-all duration-700 ease-out hover:bg-tagBlueBg hover:border-activeBorder/25 hover:translate-x-1.5 hover:shadow-md"
              :class="visible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'"
              :style="{ transitionDelay: visible.about ? `${300 + i * 100}ms` : '0ms' }"
          >
            <span :class="['w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse', feature.dotColor, feature.delayClass]"></span>
            <div>
              <h4 class="text-sm font-semibold text-headingCard mb-1 font-display">{{ feature.title }}</h4>
              <p class="text-[13px] text-textBody leading-relaxed font-primary">{{ feature.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section
      id="projects"
      ref="testimonialsRef"
      class="px-[5%] py-24 font-primary"
  >
    <div class="max-w-7xl mx-auto">
      <div
          class="text-center max-w-2xl mx-auto mb-[60px] transition-all duration-700 ease-out"
          :class="visible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <span class="text-xs font-bold tracking-widest text-textBrand uppercase font-primary">Our Projects</span>
        <h2 class="text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight font-display">
          Work That Speaks<br />For Itself
        </h2>
        <p class="text-textBody mt-4 leading-relaxed font-primary">
          150+ projects delivered across 20+ industries. Real results from real clients.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div
            v-for="(testimonial, i) in testimonials"
            :key="testimonial.name"
            class="bg-card border border-borderDefault rounded-[20px] p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-1.5 hover:-rotate-[0.5deg] hover:border-activeBorder/25 hover:shadow-xl h-full flex flex-col"
            :class="[
            visible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14'
          ]"
            :style="{ transitionDelay: visible.testimonials ? `${i * 150}ms` : '0ms' }"
        >
          <!-- Stars -->
          <div class="flex gap-1 mb-[18px] flex-shrink-0">
            <font-awesome-icon v-for="n in 5" :key="n" :icon="['fas', 'star']" class="text-headingCard text-sm" />
          </div>

          <!-- Quote -->
          <p class="text-[15px] text-textBody leading-[1.75] italic mb-6 flex-1 font-primary">
            "{{ testimonial.quote }}"
          </p>

          <!-- Author -->
          <div class="flex-shrink-0">
            <div class="flex items-center gap-3">
              <div :class="['w-11 h-11 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0 font-primary', testimonial.avatarBg]">
                {{ testimonial.initials }}
              </div>
              <div>
                <div class="text-sm font-semibold text-headingCard font-primary">{{ testimonial.name }}</div>
                <div class="text-xs text-textSupporting mt-0.5 font-primary">{{ testimonial.role }}</div>
              </div>
            </div>
            <RouterLink
                :to="testimonial.link"
                class="inline-flex items-center gap-1.5 mt-5 text-[13px] font-bold text-linkText hover:gap-2.5 hover:text-linkHoverText transition-all duration-200 font-display"
            >
              {{ testimonial.linkText }}
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-[10px]" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <Footer />
</template>
<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/footer.vue'
import sentraPlatformSvg from '@/assets/svg/sentra-platform.svg'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import sentraBotSvg from '@/assets/svg/sentra-bot.svg'
import aiAgentSvg from '@/assets/svg/ai-agent-phone-bot.svg'
import chatbotSvg from '@/assets/svg/chatbot-messenger-bot.svg'
import orchestriSvg from '@/assets/svg/orchestri-agent-bot.svg'
import serviceSoftwareSvg from '@/assets/svg/service-software.svg'
import serviceWebMobileSvg from '@/assets/svg/service-webmobile.svg'
import serviceCloudSvg from '@/assets/svg/service-cloud.svg'
import aboutIllustration from '@/assets/svg/hero-illustration.svg'
import ShineButton from "@/components/ShineButton.vue";
import {useLogin} from "@/composables/useLogin.js";

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

// Single shared observer reused across all sections (instead of one
// IntersectionObserver instance per section).
let sectionObserver = null
const refKeyMap = new Map()

function observeSection(el, key) {
  if (!el) return
  refKeyMap.set(el, key)
  sectionObserver.observe(el)
}

// ─── Hero load animation ──────────────────────────────────────────────────────
const heroLoaded = ref(false)
const uptimeCounter = ref(0)
let uptimeTimer = null

// ─── Carousel / word rotation state ──────────────────────────────────────────
const activeIndex = ref(0)
const exitingIndex = ref(null)
const progressActive = ref(false)
let autoTimer = null
let exitTimer = null
const SLIDE_DURATION = 6000
const lineVisible = ref(false)
let autoPaused = false

const techStack = ['React', 'Node.js', 'AWS', 'Flutter']

const words = ['Intelligent', 'Scalable', 'Beautiful', 'Future-Ready']
const currentWordIndex = ref(0)
let rotateInterval = null

// ─── Data ─────────────────────────────────────────────────────────────────────
// Brand-fixed tech icon colors live as their own CSS variables
// (--color-techFlutter, --color-techReact, etc.) rather than inline hex,
// so they're defined once and reusable anywhere else in the app.
const techList = [
  { name: 'Flutter',      icon: ['fas', 'mobile-screen'], color: 'text-techFlutter'  },
  { name: 'Next.js',      icon: ['fas', 'server'],        color: 'text-techNextjs'   },
  { name: 'React',        icon: ['fab', 'react'],         color: 'text-techReact'    },
  { name: 'Node.js',      icon: ['fab', 'node-js'],       color: 'text-techNode'     },
  { name: 'Python',       icon: ['fab', 'python'],        color: 'text-techPython'   },
  { name: 'AWS',          icon: ['fab', 'aws'],           color: 'text-techAws'      },
  { name: 'Docker',       icon: ['fab', 'docker'],        color: 'text-techDocker'   },
  { name: 'Google Cloud', icon: ['fab', 'google'],        color: 'text-techGoogle'   },
]
// Precompute the doubled marquee list with stable keys once via computed(),
// instead of re-spreading [...techList, ...techList] on every render.
const techListLooped = computed(() =>
    [...techList, ...techList].map((tech, i) => ({ ...tech, key: `${tech.name}-${i}` }))
)

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
    description: 'Tailor-made applications engineered to your exact workflows. Scalable, secure, and built to last — not off-the-shelf compromises.',
    illustration: serviceSoftwareSvg,
    icon: ['fas', 'code'],
    iconBg: 'bg-tagBlueBg',
    iconColor: 'text-iconDark',
    link: '/services/custom-software',
    tags: [
      { label: 'Enterprise Apps', class: 'tag-blue'  },
      { label: 'AI Integration',  class: 'tag-amber' },
      { label: 'APIs',            class: 'tag-teal'  },
    ],
  },
  {
    title: 'Web & Mobile Applications',
    description: 'Beautiful, high-performance web and mobile apps using React, Flutter, and Next.js. Pixel-perfect UI that accounts love to interact with.',
    illustration: serviceWebMobileSvg,
    icon: ['fas', 'mobile-screen-button'],
    iconBg: 'bg-tagSkyBg',
    iconColor: 'text-iconDark',
    link: '/services/web-mobile',
    tags: [
      { label: 'React / Next.js', class: 'tag-blue'   },
      { label: 'Flutter',         class: 'tag-purple' },
      { label: 'PWA',             class: 'tag-teal'   },
    ],
  },
  {
    title: 'Cloud Solutions & DevOps',
    description: 'Architect, migrate and manage cloud infrastructure that scales with your growth. CI/CD pipelines, container orchestration, 99.9% uptime guaranteed.',
    illustration: serviceCloudSvg,
    icon: ['fas', 'cloud'],
    iconBg: 'bg-tagTealBg',
    iconColor: 'text-iconDark',
    link: '/services/cloud-devops',
    tags: [
      { label: 'AWS / GCP',  class: 'tag-teal'  },
      { label: 'Kubernetes', class: 'tag-blue'  },
      { label: 'CI/CD',      class: 'tag-amber' },
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
  { title: 'Expert Engineering Team',     description: 'Senior full-stack engineers with deep domain expertise across fintech, logistics, healthcare, and e-commerce.',           dotColor: 'bg-statusActive',  delayClass: '' },
  { title: 'Transparent Communication',   description: "Weekly demos, real-time project tracking, and a dedicated project manager. You're never in the dark.",                    dotColor: 'bg-step2Border',   delayClass: '[animation-delay:-0.6s]' },
  { title: 'Scalable Architecture',       description: 'We build for tomorrow, not just today. Clean, documented code that grows with your business without rewrites.',           dotColor: 'bg-statusSuccess', delayClass: '[animation-delay:-1.2s]' },
  { title: 'Post-Launch Support',         description: 'We stay with you after go-live. Maintenance, performance tuning, and feature additions on demand.',                       dotColor: 'bg-statusWarning', delayClass: '[animation-delay:-1.8s]' },
]

const testimonials = [
  { name: 'Ahmed Khan',      role: 'Operations Head, Sentra AI Client',  initials: 'AK', avatarBg: 'bg-avatarTestimonial1', quote: 'Sentra AI transformed our call center — wait times dropped 60% and our agents handle twice the volume. The IVR and AI routing just works.',            link: '/pricing?project=sentra', linkText: 'View Sentra AI pricing' },
  { name: 'Sara Rashid',     role: 'CEO, FinTech Startup',               initials: 'SR', avatarBg: 'bg-avatarTestimonial2', quote: 'Our AI agents now handle invoice processing and customer follow-ups autonomously. Rasant built a system that saves us 20+ hours every week.',        link: '/ai-agent',               linkText: 'Explore AI Agent'       },
  { name: 'Michael Jensen',  role: 'Support Director, E-Commerce Brand', initials: 'MJ', avatarBg: 'bg-avatarTestimonial3', quote: 'The chatbot handles 80% of our support tickets on WhatsApp and web. Live handoff to agents is seamless — our CSAT scores went up immediately.',    link: '/chatbot',                linkText: 'Explore Chatbot Agent'  },
]

const ctaPills = [
  { label: 'Sentra AI',  class: 'pill-blue'   },
  { label: 'AI Agent',   class: 'pill-teal'   },
  { label: 'Chatbot',    class: 'pill-purple' },
  { label: 'Orchestri',  class: 'pill-amber'  },
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
  if (autoPaused) return
  clearInterval(autoTimer)
  autoTimer = setInterval(next, SLIDE_DURATION)
}

// Pause the auto-rotating carousel while the user hovers it so it doesn't
// jump to the next slide while they're mid-read.
function pauseAuto() {
  autoPaused = true
  clearInterval(autoTimer)
}
function resumeAuto() {
  autoPaused = false
  restartAuto()
}

const scrollToServices = () => {
  const section = document.getElementById('services');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  return false;
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  // Hero animation
  setTimeout(() => {
    heroLoaded.value = true
    setTimeout(() => {
      const target = 99
      const duration = 1800
      const stepCount = 60
      const increment = target / stepCount
      const interval = duration / stepCount
      let current = 0
      uptimeTimer = setInterval(() => {
        current += increment
        if (current >= target) {
          uptimeCounter.value = target
          clearInterval(uptimeTimer)
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

  // One shared IntersectionObserver for all sections instead of one per section.
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

  observeSection(statsRef.value, 'stats')
  observeSection(techRef.value, 'tech')
  observeSection(platformRef.value, 'platform')
  observeSection(productsRef.value, 'products')
  observeSection(servicesRef.value, 'services')
  observeSection(processSection.value, 'process')
  observeSection(aboutRef.value, 'about')
  observeSection(testimonialsRef.value, 'testimonials')
  observeSection(pricingRef.value, 'pricing')

  // Process line observer (separate, one-shot)
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

  // Carousel auto-play
  restartProgress()
  autoTimer = setInterval(next, SLIDE_DURATION)

  // Expose scrollToServices to window for navbar
  window.scrollToServices = scrollToServices;

  onUnmounted(() => processObserver.disconnect())
})

onUnmounted(() => {
  clearInterval(rotateInterval)
  clearInterval(autoTimer)
  clearInterval(uptimeTimer)
  clearTimeout(exitTimer)
  if (sectionObserver) sectionObserver.disconnect()
  refKeyMap.clear()
  delete window.scrollToServices;
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

/* Respect accounts who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee,
  .animate-float,
  .animate-pulse,
  [class*="animate-\[ringPulse"] {
    animation: none !important;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>