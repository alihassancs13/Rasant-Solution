<template>
  <div class="min-h-screen bg-neutral-100 font-primary text-headingMain antialiased selection:bg-primary-500/20">
    <Navbar />

    <!-- Hero -->
    <section class="relative pt-24 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-secondary-50 via-primary-50/40 to-neutral-100">
      <div
          class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,var(--color-secondary-100)_35%,transparent_42%),radial-gradient(circle_at_82%_18%,var(--color-mesh-purple)_32%,transparent_40%),radial-gradient(circle_at_50%_80%,var(--color-mesh-pink)_12%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"
          aria-hidden="true"
      ></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-secondary-100/45 -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]" aria-hidden="true"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-72 h-72 bg-primary-300/35 top-20 -right-16 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]" aria-hidden="true"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div
            class="text-left transition-all duration-1000 ease-out"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        >
          <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-accent-3/10 text-accent-3 border border-accent-3/20 mb-5 font-display">
            <span class="w-1.5 h-1.5 rounded-full bg-accent-3 animate-pulse"></span>
            Careers at Rasant
          </span>

          <h1 class="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold tracking-tight text-headingMain leading-[1.12]">
            Build software with<br />
            <Transition name="word-fade" mode="out-in">
              <span
                  :key="currentWordIndex"
                  class="inline-block bg-gradient-to-r from-secondary-600 via-primary-500 to-accent-3 bg-clip-text text-transparent"
              >
                {{ heroWords[currentWordIndex] }}
              </span>
            </Transition>
          </h1>

          <p class="mt-5 text-textBody text-base sm:text-lg leading-relaxed max-w-xl">
            Join a team shipping real products in Java, Grails, Python, Vue.js, React, and WordPress — with room to grow, learn, and make an impact.
          </p>

          <div class="flex flex-wrap gap-4 mt-8">
            <ShineButton size="xl" @click="openModal('')">
              Submit your CV
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-sm transition-transform duration-200 group-hover:translate-x-1" />
            </ShineButton>
            <ShineButton variant="outline" size="xl" @click="scrollToSection('open-roles')">
              View open roles
            </ShineButton>
          </div>

          <div class="flex flex-wrap gap-6 mt-10 pt-8 border-t border-borderDefault/80">
            <div v-for="(stat, i) in heroStats" :key="stat.label" class="min-w-[100px]">
              <div
                  class="font-display text-2xl font-bold text-headingMain transition-all duration-700"
                  :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
                  :style="{ transitionDelay: `${400 + i * 100}ms` }"
              >
                {{ stat.value }}
              </div>
              <div class="text-[11px] text-textSupporting uppercase tracking-wide mt-0.5 font-semibold">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Hero visual -->
        <div
            class="relative hidden lg:block transition-all duration-1000 ease-out delay-200"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
          <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.18)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite]" aria-hidden="true"></div>
          <div class="absolute -inset-3 rounded-full border-2 border-dashed border-accent-3/30 animate-[spin_24s_linear_infinite]" aria-hidden="true"></div>

          <div class="relative grid grid-cols-2 gap-4 animate-[visualFloat_6s_ease-in-out_infinite]">
            <div
                v-for="(card, i) in heroCards"
                :key="card.title"
                class="bg-card border border-borderDefault rounded-2xl p-5 shadow-blue hover:-translate-y-1 hover:shadow-insetBlue transition-all duration-300"
                :class="i === 1 ? 'mt-8' : i === 2 ? '-mt-4' : ''"
            >
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.iconBg]">
                <i :class="[card.icon, 'text-lg']" aria-hidden="true"></i>
              </div>
              <h3 class="font-display font-bold text-sm text-headingCard">{{ card.title }}</h3>
              <p class="text-[12px] text-textBody mt-1 leading-relaxed">{{ card.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech marquee -->
    <section class="py-8 bg-section-white border-y border-borderDefault overflow-hidden">
      <p class="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-textSupporting mb-5">Technologies we work with</p>
      <div class="relative flex overflow-hidden">
        <div class="flex gap-10 animate-[marquee_28s_linear_infinite] whitespace-nowrap px-4">
          <span
              v-for="(tech, i) in techMarqueeLooped"
              :key="`${tech.name}-${i}`"
              class="inline-flex items-center gap-2 text-sm font-semibold text-textBody"
          >
            <font-awesome-icon :icon="tech.icon" :class="tech.color" />
            {{ tech.name }}
          </span>
        </div>
      </div>
    </section>

    <!-- Why join us -->
    <section ref="perksRef" class="px-[5%] py-20 md:py-24">
      <div class="max-w-7xl mx-auto">
        <div
            class="text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ease-out"
            :class="visible.perks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <span class="text-xs font-bold tracking-widest text-textBrand uppercase">Life at Rasant</span>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-headingSection mt-3 leading-tight">
            Why engineers choose us
          </h2>
          <p class="text-textBody mt-4 leading-relaxed">
            Meaningful projects, modern stacks, and a team that values craft — not burnout culture.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
              v-for="(perk, i) in perks"
              :key="perk.title"
              class="group relative bg-card border border-borderDefault rounded-2xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-insetBlue hover:border-activeBorder/25 transition-all duration-500 ease-out overflow-hidden"
              :class="visible.perks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
              :style="{ transitionDelay: visible.perks ? `${i * 100}ms` : '0ms' }"
          >
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-100/60 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110', perk.iconBg]">
              <i :class="[perk.icon, 'text-xl']" aria-hidden="true"></i>
            </div>
            <h3 class="font-display font-bold text-headingCard mb-2">{{ perk.title }}</h3>
            <p class="text-sm text-textBody leading-relaxed">{{ perk.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Hiring process -->
    <section ref="processRef" class="px-[5%] py-20 bg-section-white">
      <div class="max-w-5xl mx-auto">
        <div
            class="text-center mb-14 transition-all duration-700 ease-out"
            :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <span class="text-xs font-bold tracking-widest text-textBrand uppercase">How it works</span>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-headingSection mt-3">Our hiring process</h2>
        </div>

        <div class="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          <div
              class="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-borderDefault overflow-hidden"
              aria-hidden="true"
          >
            <div
                class="h-full bg-gradient-to-r from-primary-500 to-accent-3 transition-all duration-1000 ease-out"
                :class="visible.process ? 'w-full' : 'w-0'"
            ></div>
          </div>

          <div
              v-for="(step, i) in hiringSteps"
              :key="step.title"
              class="relative text-center transition-all duration-700 ease-out"
              :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
              :style="{ transitionDelay: visible.process ? `${i * 150}ms` : '0ms' }"
          >
            <div class="relative z-10 w-20 h-20 mx-auto rounded-full bg-card border-2 border-primary-500/30 flex items-center justify-center shadow-blue mb-5 group-hover:scale-105 transition-transform">
              <span class="font-display text-xl font-bold text-primary-600">{{ step.number }}</span>
              <span class="absolute inset-0 rounded-full border-2 border-primary-400/40 animate-ping opacity-20" aria-hidden="true"></span>
            </div>
            <h3 class="font-display font-bold text-headingCard mb-2">{{ step.title }}</h3>
            <p class="text-sm text-textBody leading-relaxed max-w-xs mx-auto">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Open roles -->
    <section id="open-roles" ref="rolesRef" class="px-[5%] py-20 md:py-24">
      <div class="max-w-5xl mx-auto">
        <div
            class="relative rounded-[24px] overflow-hidden bg-card border border-borderDefault shadow-blue transition-all duration-700 ease-out"
            :class="visible.roles ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-transparent to-secondary-50/60 pointer-events-none" aria-hidden="true"></div>

          <div class="relative grid grid-cols-1 lg:grid-cols-[1fr_280px]">
            <div class="p-8 md:p-10 lg:border-r border-borderDefault">
              <div class="flex flex-wrap items-center gap-3 mb-6">
                <h2 class="font-display text-2xl md:text-[28px] font-bold text-headingSection">Open positions</h2>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Talent network open
                </span>
              </div>

              <div class="flex flex-col sm:flex-row gap-5 items-start">
                <div class="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 border border-borderDefault shadow-sm animate-[visualFloat_5s_ease-in-out_infinite]">
                  <i class="fa-solid fa-briefcase text-xl text-primary-600" aria-hidden="true"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-display text-lg font-bold text-headingCard">No open roles right now</h3>
                  <p class="text-sm text-textBody leading-relaxed mt-2 max-w-lg">
                    Our team is at full strength — but strong engineers don't wait on job boards.
                    Send your CV and we'll reach out personally when a role matches your skills in Java, Python, Vue, React, or WordPress.
                  </p>
                  <button
                      type="button"
                      @click="openModal('')"
                      class="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer bg-buttonBackground text-white hover:bg-buttonHover shadow-orange group"
                  >
                    Submit your CV
                    <i class="fa-solid fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-neutral-100/70 border-t lg:border-t-0 border-borderDefault divide-y divide-borderDefault">
              <div
                  v-for="(stat, i) in sidebarStats"
                  :key="stat.label"
                  class="flex items-center justify-between px-6 py-4 transition-all duration-500 hover:bg-white/60"
                  :class="visible.roles ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'"
                  :style="{ transitionDelay: visible.roles ? `${200 + i * 80}ms` : '0ms' }"
              >
                <span class="flex items-center gap-2.5 text-[12px] text-textSupporting font-medium">
                  <i :class="[stat.icon, 'text-accent-1']" aria-hidden="true"></i>
                  {{ stat.label }}
                </span>
                <span class="font-display text-sm font-bold text-headingSection">{{ stat.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section ref="ctaRef" class="px-[5%] pb-24">
      <div
          class="max-w-5xl mx-auto bg-buttonBackground text-white p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl relative overflow-hidden transition-all duration-700 ease-out"
          :class="visible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12)_0%,transparent_50%)] pointer-events-none" aria-hidden="true"></div>
        <div class="relative max-w-xl">
          <h2 class="font-display text-2xl md:text-3xl font-bold mb-2">Don't see your role?</h2>
          <p class="text-white/90 text-sm md:text-base leading-relaxed">
            We're always interested in talented developers, designers, and project leads. Introduce yourself — we'll keep your profile on file.
          </p>
        </div>
        <ShineButton variant="white" size="lg" class="relative shrink-0" @click="openModal('')">
          Send your CV
        </ShineButton>
      </div>
    </section>

    <!-- CV Submit Modal -->
    <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-neutral-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cvModalTitle"
          @click.self="closeModal"
      >
        <Transition
            appear
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-borderDefault overflow-hidden flex flex-col max-h-[90vh]">

            <div class="p-6 border-b border-borderDefault flex items-start justify-between bg-gradient-to-br from-primary-50 via-accent-1/10 to-card shrink-0">
              <div class="space-y-1">
                <span class="inline-block px-2.5 py-0.5 rounded bg-accent-1/10 text-accent-2 text-[10px] font-bold uppercase tracking-wider">
                  Join our team
                </span>
                <h3 id="cvModalTitle" class="font-display text-xl font-bold text-headingMain">Submit Your CV</h3>
                <p class="text-xs text-textBody">Share your profile — we'll match you with the right role.</p>
              </div>
              <button
                  type="button"
                  @click="closeModal"
                  class="text-2xl text-textBody hover:text-headingMain hover:rotate-90 transition-all duration-200 leading-none p-1 cursor-pointer"
                  aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-90"
                enter-to-class="opacity-100 scale-100"
                mode="out-in"
            >
              <div
                  v-if="submitSuccess"
                  key="success"
                  class="p-8 text-center my-auto space-y-3"
              >
                <div class="w-14 h-14 bg-accent-1/20 text-accent-2 rounded-full flex items-center justify-center text-2xl mx-auto border border-accent-1/30 shadow-lg shadow-accent-1/25 animate-[chipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]">
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                </div>
                <h4 class="font-display text-lg font-bold text-headingMain">Application received!</h4>
                <p class="text-sm text-textBody max-w-xs mx-auto">
                  Thank you — our team will review your CV and reach out if there's a match.
                </p>
              </div>

              <form
                  v-else
                  key="form"
                  @submit.prevent="handleSubmit"
                  novalidate
                  class="flex flex-col overflow-hidden"
              >
                <div class="p-6 space-y-4 overflow-y-auto">

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Full Name <span class="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        v-model="formData.name"
                        placeholder="Enter your full name"
                        autocomplete="name"
                        :class="formErrors.name
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.name" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.name }}
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Email Address <span class="text-error">*</span>
                    </label>
                    <input
                        type="email"
                        v-model="formData.email"
                        placeholder="Enter your email address"
                        autocomplete="email"
                        @input="onEmailInput"
                        @blur="onEmailInput"
                        :class="formErrors.email
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.email" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.email }}
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Phone / Contact <span class="text-error">*</span>
                    </label>
                    <input
                        type="tel"
                        v-model="formData.contact"
                        placeholder="Enter your phone or WhatsApp number"
                        autocomplete="tel"
                        :class="formErrors.contact
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.contact" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.contact }}
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Desired Position <span class="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        v-model="formData.position"
                        placeholder="e.g., Vue Developer, Java Backend Engineer"
                        :class="formErrors.position
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.position" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.position }}
                    </p>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Upload CV (PDF, DOC, DOCX) <span class="text-error">*</span>
                    </label>
                    <div
                        @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false"
                        @drop.prevent="handleFileDrop"
                        @click="triggerFileSelect"
                        :class="[
                          isDragging
                            ? 'border-primary-500 bg-primary-500/5 scale-[1.02]'
                            : fileUploaded
                              ? 'border-primary-500 border-solid bg-accent-1/5'
                              : formErrors.file
                                ? 'border-error/50 bg-error/5 border-2 border-dashed'
                                : 'border-primary-500/35 bg-primary-50 hover:bg-primary-100/50 border-2 border-dashed',
                        ]"
                        class="relative rounded-xl p-6 text-center transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary-500/10"
                    >
                      <div
                          class="text-2xl mb-1 select-none transition-colors duration-200"
                          :class="formErrors.file ? 'text-error' : 'text-primary-500'"
                          aria-hidden="true"
                      >
                        <i :class="formErrors.file ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-folder-open'"></i>
                      </div>
                      <p class="text-xs font-semibold text-headingMain">Drag &amp; drop your CV here</p>
                      <p class="text-[11px] text-textBody my-1">or</p>
                      <button
                          type="button"
                          class="cursor-pointer px-3 py-1.5 bg-card border border-borderDefault rounded-md shadow-sm text-[11px] font-medium text-textBody group-hover:border-primary-500/35 transition-all duration-200"
                      >
                        Browse files
                      </button>
                      <span
                          class="block text-[11px] font-medium mt-2 truncate max-w-[200px] mx-auto"
                          :class="fileUploaded ? 'text-accent-2 font-semibold' : 'text-textBody'"
                      >
                        {{ fileName }}
                      </span>
                      <input
                          type="file"
                          ref="fileInput"
                          @change="handleFileSelect"
                          accept=".pdf,.doc,.docx"
                          class="hidden"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-0.5">
                      <p v-if="formErrors.file" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.file }}
                      </p>
                      <p v-else class="text-[10px] text-textBody">Maximum file size: 5MB</p>
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain">
                      Cover Letter
                      <span class="text-textSupporting font-normal">(optional)</span>
                    </label>
                    <textarea
                        v-model="formData.coverLetter"
                        placeholder="Tell us why you'd be a great fit for our team..."
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-borderDefault bg-neutral-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:border-primary-500/35 hover:bg-card focus:bg-card h-24 resize-none"
                    ></textarea>
                  </div>

                </div>

                <div class="p-4 border-t border-borderDefault flex flex-col gap-3 bg-gradient-to-b from-card to-neutral-100 shrink-0">

                  <Transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div
                        v-if="submitError"
                        class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-error/8 border border-error/20"
                    >
                      <i class="fa-solid fa-triangle-exclamation text-error text-xs mt-0.5 shrink-0"></i>
                      <p class="text-[12px] text-error leading-snug">{{ submitError }}</p>
                    </div>
                  </Transition>

                  <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-buttonBackground hover:bg-buttonHover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-orange hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group cursor-pointer"
                  >
                    <span class="relative z-10">
                      {{ isSubmitting ? 'Submitting...' : 'Submit application' }}
                    </span>
                    <span
                        aria-hidden="true"
                        class="relative z-10 transition-transform duration-200 group-hover:translate-x-1"
                    >&rarr;</span>
                    <div
                        class="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-[shineLoop_0.98s_ease-in-out_infinite_alternate]"
                    ></div>
                  </button>
                </div>
              </form>
            </Transition>

          </div>
        </Transition>
      </div>
    </Transition>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useCareers } from '@/composables/useCareers.js'
import Navbar from '../components/navbar.vue'
import Footer from '../components/footer.vue'
import ShineButton from '@/components/ShineButton.vue'

const {
  isModalOpen, submitSuccess, isDragging,
  fileName, fileUploaded, fileInput,
  isSubmitting, submitError,
  formData, formErrors,
  openModal, closeModal,
  triggerFileSelect, handleFileSelect, handleFileDrop,
  handleSubmit, onEmailInput,
} = useCareers()

const heroLoaded = ref(false)
const currentWordIndex = ref(0)
let wordInterval = null
let heroTimer = null

const visible = reactive({
  perks: false,
  process: false,
  roles: false,
  cta: false,
})

const perksRef = ref(null)
const processRef = ref(null)
const rolesRef = ref(null)
const ctaRef = ref(null)

const heroWords = ['real impact', 'modern stacks', 'great teams']
const heroStats = [
  { label: 'Avg. response', value: '48h' },
  { label: 'Active projects', value: '10+' },
  { label: 'Client retention', value: '94%' },
]

const heroCards = [
  { title: 'Modern stack', text: 'Java, Python, Vue, React & WordPress daily.', icon: 'fa-solid fa-code', iconBg: 'bg-tagBlueBg text-primary-600' },
  { title: 'Real products', text: 'Ship features clients use — not slide decks.', icon: 'fa-solid fa-rocket', iconBg: 'bg-tagTealBg text-accent-1' },
  { title: 'Growth path', text: 'Mentorship, ownership, and clear progression.', icon: 'fa-solid fa-users', iconBg: 'bg-tagPinkBg text-secondary-600' },
  { title: 'Flexible culture', text: 'Focus on output, respect, and balance.', icon: 'fa-solid fa-handshake', iconBg: 'bg-accent-1/10 text-accent-2' },
]

const techMarquee = [
  { name: 'Java', icon: ['fab', 'java'], color: 'text-[#E76F00]' },
  { name: 'Grails', icon: ['fas', 'seedling'], color: 'text-[#8E6CF0]' },
  { name: 'Python', icon: ['fab', 'python'], color: 'text-[#3776AB]' },
  { name: 'Vue.js', icon: ['fab', 'vuejs'], color: 'text-[#42B883]' },
  { name: 'React', icon: ['fab', 'react'], color: 'text-[#61DAFB]' },
  { name: 'Tailwind', icon: ['fas', 'wind'], color: 'text-[#38BDF8]' },
  { name: 'WordPress', icon: ['fab', 'wordpress'], color: 'text-[#21759B]' },
  { name: 'HTML / CSS', icon: ['fab', 'html5'], color: 'text-[#E34F26]' },
]

const techMarqueeLooped = computed(() => [...techMarquee, ...techMarquee, ...techMarquee])

const perks = [
  { title: 'Work on live products', description: 'Contribute to Sentra AI, client platforms, and greenfield apps — code that reaches real users.', icon: 'fa-solid fa-bolt', iconBg: 'bg-amber-50 text-amber-600 border border-amber-100' },
  { title: 'Learn every day', description: 'Pair with senior engineers, explore new patterns, and deepen skills across backend and frontend.', icon: 'fa-solid fa-code', iconBg: 'bg-primary-50 text-primary-600 border border-primary-100' },
  { title: 'Transparent team', description: 'Weekly check-ins, clear expectations, and direct access to leads — no mystery management.', icon: 'fa-solid fa-users', iconBg: 'bg-secondary-50 text-secondary-600 border border-secondary-100' },
  { title: 'Remote-friendly', description: 'Collaborate from Islamabad or hybrid — we care about results and communication, not desk time.', icon: 'fa-solid fa-envelope', iconBg: 'bg-teal-50 text-teal-600 border border-teal-100' },
  { title: 'Stable projects', description: 'Long-term client relationships and product work — not endless churn or throwaway MVPs.', icon: 'fa-solid fa-shield-halved', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  { title: 'Room to grow', description: 'Take ownership as you grow — from contributor to lead on features and modules you believe in.', icon: 'fa-solid fa-rocket', iconBg: 'bg-violet-50 text-violet-600 border border-violet-100' },
]

const hiringSteps = [
  { number: '01', title: 'Submit CV', description: 'Share your profile and the kind of role you are looking for — we read every application.' },
  { number: '02', title: 'Intro call', description: 'A friendly conversation about your experience, interests, and how we work.' },
  { number: '03', title: 'Technical chat', description: 'Practical discussion or short exercise aligned with the stack — no trick questions.' },
]

const sidebarStats = [
  { label: 'avg. response', value: '48h', icon: 'fa-solid fa-clock' },
  { label: 'teams hiring soon', value: '5', icon: 'fa-solid fa-users' },
  { label: 'friendly env.', value: '100%', icon: 'fa-solid fa-handshake' },
  { label: 'active projects', value: '10+', icon: 'fa-solid fa-code' },
  { label: 'talent network', value: 'Open', icon: 'fa-solid fa-medal' },
]

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const observeSection = (el, key) => {
  if (!el) return
  const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible[key] = true
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  observer.observe(el)
}

onMounted(() => {
  heroTimer = setTimeout(() => { heroLoaded.value = true }, 80)
  wordInterval = setInterval(() => {
    currentWordIndex.value = (currentWordIndex.value + 1) % heroWords.length
  }, 2800)

  observeSection(perksRef.value, 'perks')
  observeSection(processRef.value, 'process')
  observeSection(rolesRef.value, 'roles')
  observeSection(ctaRef.value, 'cta')
})

onUnmounted(() => {
  clearTimeout(heroTimer)
  clearInterval(wordInterval)
})
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
@keyframes visualFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes botGlow {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}
@keyframes chipPop {
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to { opacity: 1; transform: none; }
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
@keyframes shineLoop {
  0%   { transform: translateX(-200%); }
  100% { transform: translateX(400%); }
}

.word-fade-enter-active,
.word-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.word-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.word-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
