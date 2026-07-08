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
            </ShineButton>
            <ShineButton
                v-if="hasOpenRoles"
                variant="outline"
                size="xl"
                @click="scrollToSection('open-roles')"
            >
              View open roles
            </ShineButton>
          </div>
        </div>

        <!-- Hero visual -->
        <div
            class="relative flex justify-center transition-all duration-1000 ease-out delay-200"
            :class="heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
          <div class="absolute inset-[5%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.15)_0%,transparent_70%)] animate-[botGlow_3s_ease-in-out_infinite] pointer-events-none" aria-hidden="true"></div>
          <img
              :src="careersHeroSvg"
              alt=""
              class="relative w-full max-w-[420px] lg:max-w-none lg:w-[110%] lg:-mr-8 drop-shadow-xl animate-[visualFloat_6s_ease-in-out_infinite]"
              width="560"
              height="480"
              loading="eager"
              decoding="async"
          />
        </div>
      </div>
    </section>

    <!-- Tech marquee -->
    <section ref="techRef" class="py-10 bg-sectionLight border-y border-borderDefault overflow-hidden">
      <div class="max-w-7xl mx-auto px-6">
        <p
            class="text-center text-xs font-bold tracking-widest text-textSupporting uppercase mb-6 transition-all duration-700 ease-out"
            :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          Technologies we work with
        </p>
      </div>

      <div
          class="relative transition-all duration-700 ease-out delay-200"
          :class="visible.tech ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-20 bg-gradient-to-r from-sectionLight to-transparent z-10"></div>
        <div class="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-20 bg-gradient-to-l from-sectionLight to-transparent z-10"></div>
        <div class="overflow-hidden">
          <div class="flex w-max animate-marquee">
            <div
                v-for="copy in 4"
                :key="copy"
                class="flex shrink-0 items-center gap-6 pr-6"
                :aria-hidden="copy > 1 ? 'true' : undefined"
            >
              <div
                  v-for="tech in techList"
                  :key="`${copy}-${tech.name}`"
                  class="inline-flex items-center gap-2 bg-card border border-borderDefault rounded-full px-5 py-2.5 shadow-sm whitespace-nowrap shrink-0"
              >
                <font-awesome-icon :icon="tech.icon" :class="['text-sm', tech.color]" />
                <span class="text-sm font-semibold text-brandDark">{{ tech.name }}</span>
              </div>
            </div>
          </div>
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

        <MobileAutoSlide
            :items="perks"
            min-height="180px"
            stack-below="lg"
            desktop-class="grid-cols-3 gap-6"
            item-key="title"
            :active="visible.perks"
        >
          <template #default="{ item: perk, index: i }">
            <article
                class="group relative bg-card border border-borderDefault rounded-2xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-insetBlue hover:border-activeBorder/25 transition-all duration-500 ease-out overflow-hidden h-full"
                :class="visible.perks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
                :style="{ transitionDelay: visible.perks ? `${i * 100}ms` : '0ms' }"
            >
              <div class="absolute top-0 right-0 w-28 h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" aria-hidden="true">
                <img :src="perk.iconSvg" alt="" class="w-full h-full object-contain" loading="lazy" />
              </div>
              <div class="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-primary-50 to-secondary-50 border border-borderDefault/60">
                <i :class="[perk.icon, 'text-lg text-primary-600']" aria-hidden="true"></i>
              </div>
              <h3 class="font-display font-bold text-headingCard mb-2">{{ perk.title }}</h3>
              <p class="text-sm text-textBody leading-relaxed">{{ perk.description }}</p>
            </article>
          </template>
        </MobileAutoSlide>
      </div>
    </section>

    <!-- Hiring process -->
    <section ref="processRef" class="px-[5%] py-20 bg-section-white relative overflow-hidden">
      <img
          :src="careersProcessSvg"
          alt=""
          class="absolute -right-8 top-12 w-40 h-40 opacity-[0.07] pointer-events-none hidden lg:block"
          aria-hidden="true"
      />
      <div class="max-w-5xl mx-auto relative">
        <div
            class="text-center mb-14 transition-all duration-700 ease-out"
            :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <span class="text-xs font-bold tracking-widest text-textBrand uppercase">How it works</span>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-headingSection mt-3">Our hiring process</h2>
        </div>

        <div class="relative">
          <div
              class="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-borderDefault overflow-hidden"
              aria-hidden="true"
          >
            <div
                class="h-full bg-gradient-to-r from-primary-500 to-accent-3 transition-all duration-1000 ease-out"
                :class="visible.process ? 'w-full' : 'w-0'"
            ></div>
          </div>

        <MobileAutoSlide
            :items="hiringSteps"
            min-height="220px"
            desktop-class="grid-cols-3 gap-6"
            item-key="title"
            :active="visible.process"
        >
          <template #default="{ item: step, index: i }">
            <div
                class="relative text-center transition-all duration-700 ease-out"
                :class="visible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
                :style="{ transitionDelay: visible.process ? `${i * 150}ms` : '0ms' }"
            >
              <div class="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-card border-2 border-primary-500/25 flex items-center justify-center shadow-blue mb-5 transition-transform duration-300 hover:scale-105 overflow-hidden">
                <img :src="step.iconSvg" alt="" class="w-11 h-11" loading="lazy" />
                <span class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center font-display shadow-sm">
                  {{ step.number }}
                </span>
              </div>
              <h3 class="font-display font-bold text-headingCard mb-2">{{ step.title }}</h3>
              <p class="text-sm text-textBody leading-relaxed max-w-xs mx-auto">{{ step.description }}</p>
            </div>
          </template>
        </MobileAutoSlide>
        </div>
      </div>
    </section>

    <!-- Open roles (only when published jobs exist) -->
    <section
        v-if="hasOpenRoles"
        id="open-roles"
        ref="openRolesRef"
        class="px-[5%] py-20 md:py-24"
    >
      <div class="max-w-4xl mx-auto">
        <div
            class="text-center mb-12 transition-all duration-700 ease-out"
            :class="visible.openRoles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          <span class="text-xs font-bold tracking-widest text-textBrand uppercase">Join the team</span>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-headingSection mt-3">Current openings</h2>
          <p class="text-textBody mt-3 max-w-lg mx-auto leading-relaxed">
            We're hiring for the roles below. Apply directly or submit your CV — we'll get back to you promptly.
          </p>
        </div>

        <div class="space-y-4">
          <article
              v-for="(job, i) in openRoles"
              :key="job.id"
              class="group bg-card border border-borderDefault rounded-2xl p-6 md:p-8 shadow-sm hover:border-activeBorder/30 hover:shadow-insetBlue hover:-translate-y-0.5 transition-all duration-300"
              :class="visible.openRoles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
              :style="{ transitionDelay: visible.openRoles ? `${i * 100}ms` : '0ms' }"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <h3 class="font-display text-xl font-bold text-headingCard">{{ job.job_title }}</h3>
                  <span
                      v-if="job.job_type_name"
                      class="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary-50 text-primary-700 border border-primary-100"
                  >
                    {{ job.job_type_name }}
                  </span>
                </div>
                <p class="text-sm text-textSupporting font-medium">
                  {{ job.department }}
                  <span v-if="job.location" class="text-textBody"> · {{ job.location }}</span>
                </p>
                <p v-if="job.description" class="text-sm text-textBody leading-relaxed mt-3 line-clamp-3">
                  {{ job.description }}
                </p>
              </div>
              <ShineButton
                  size="md"
                  class="shrink-0 self-start"
                  @click="openModal(job.job_title)"
              >
                Apply now
              </ShineButton>
            </div>
          </article>
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
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-sm"
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
          <div class="relative w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-borderDefault overflow-hidden flex flex-col">

            <div class="relative px-6 py-5 md:px-8 md:py-6 border-b border-borderDefault flex items-start justify-between gap-4 bg-gradient-to-br from-primary-50/90 via-white to-secondary-50/40 shrink-0">
              <div class="flex items-start gap-4 min-w-0">
                <div class="hidden sm:flex w-12 h-12 rounded-xl bg-white border border-primary-100 shadow-sm items-center justify-center shrink-0">
                  <img :src="careersStepSubmitSvg" alt="" class="w-8 h-8" aria-hidden="true" />
                </div>
                <div class="space-y-1 min-w-0">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-1/10 text-accent-2 text-[10px] font-bold uppercase tracking-wider border border-accent-1/15">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent-2 animate-pulse"></span>
                    Join our team
                  </span>
                  <h3 id="cvModalTitle" class="font-display text-xl md:text-2xl font-bold text-headingMain">Submit your CV</h3>
                  <p class="text-sm text-textBody">Tell us about yourself — we'll match you with the right opportunity.</p>
                </div>
              </div>
              <button
                  type="button"
                  @click="closeModal"
                  class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-textBody hover:text-headingMain hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                  aria-label="Close modal"
              >
                <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
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
                  class="px-8 py-12 text-center space-y-4"
              >
                <div class="w-16 h-16 bg-accent-1/20 text-accent-2 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-accent-1/30 shadow-lg shadow-accent-1/20 animate-[chipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]">
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                </div>
                <h4 class="font-display text-xl font-bold text-headingMain">Application received!</h4>
                <p class="text-sm text-textBody max-w-md mx-auto leading-relaxed">
                  Thank you — our team will review your CV and reach out if there's a match.
                </p>
              </div>

              <form
                  v-else
                  key="form"
                  @submit.prevent="handleSubmit"
                  novalidate
                  class="flex flex-col"
              >
                <div class="px-6 py-6 md:px-8 md:py-7">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                        <i class="fa-solid fa-user text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                        Full Name <span class="text-error">*</span>
                      </label>
                      <input
                          type="text"
                          v-model="formData.name"
                          placeholder="Your full name"
                          autocomplete="name"
                          :class="inputClass(formErrors.name)"
                      />
                      <p v-if="formErrors.name" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.name }}
                      </p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                        <i class="fa-solid fa-envelope text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                        Email Address <span class="text-error">*</span>
                      </label>
                      <input
                          type="email"
                          v-model="formData.email"
                          placeholder="name@example.com"
                          autocomplete="email"
                          @input="onEmailInput"
                          @blur="onEmailInput"
                          :class="inputClass(formErrors.email)"
                      />
                      <p v-if="formErrors.email" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.email }}
                      </p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                        <i class="fa-solid fa-phone text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                        Phone / Contact <span class="text-error">*</span>
                      </label>
                      <input
                          type="tel"
                          v-model="formData.contact"
                          placeholder="Phone or WhatsApp"
                          autocomplete="tel"
                          :class="inputClass(formErrors.contact)"
                      />
                      <p v-if="formErrors.contact" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.contact }}
                      </p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                        <i class="fa-solid fa-briefcase text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                        Desired Position <span class="text-error">*</span>
                      </label>
                      <input
                          type="text"
                          v-model="formData.position"
                          placeholder="e.g. Vue Developer, Java Engineer"
                          :class="inputClass(formErrors.position)"
                      />
                      <p v-if="formErrors.position" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.position }}
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                        <i class="fa-solid fa-file-arrow-up text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                        Upload CV <span class="text-error">*</span>
                      </label>
                      <div
                          @dragover.prevent="isDragging = true"
                          @dragleave.prevent="isDragging = false"
                          @drop.prevent="handleFileDrop"
                          @click="triggerFileSelect"
                          :class="[
                            isDragging
                              ? 'border-primary-500 bg-primary-500/5 ring-2 ring-primary-500/20'
                              : fileUploaded
                                ? 'border-primary-500 border-solid bg-accent-1/5'
                                : formErrors.file
                                  ? 'border-error/50 bg-error/5'
                                  : 'border-primary-500/30 bg-primary-50/60 hover:bg-primary-50 hover:border-primary-500/50',
                          ]"
                          class="relative flex items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 transition-all duration-200 cursor-pointer group min-h-[104px]"
                      >
                        <div
                            class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200"
                            :class="formErrors.file ? 'bg-error/10 text-error' : fileUploaded ? 'bg-accent-1/15 text-accent-2' : 'bg-white text-primary-500 border border-primary-100 shadow-sm'"
                            aria-hidden="true"
                        >
                          <i :class="formErrors.file ? 'fa-solid fa-triangle-exclamation' : fileUploaded ? 'fa-solid fa-file-circle-check' : 'fa-solid fa-cloud-arrow-up'"></i>
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                          <p class="text-sm font-semibold text-headingMain">
                            {{ fileUploaded ? 'CV attached' : 'Drag & drop or browse' }}
                          </p>
                          <p class="text-[11px] text-textBody mt-0.5">PDF, DOC, DOCX · Max 5MB</p>
                          <p
                              class="text-[11px] font-medium mt-1 truncate"
                              :class="fileUploaded ? 'text-accent-2' : 'text-textSupporting'"
                          >
                            {{ fileName }}
                          </p>
                        </div>
                        <button
                            type="button"
                            class="shrink-0 hidden sm:inline-flex cursor-pointer px-3 py-1.5 bg-white border border-borderDefault rounded-lg shadow-sm text-[11px] font-semibold text-textBody group-hover:border-primary-500/40 group-hover:text-primary-600 transition-all duration-200"
                        >
                          Browse
                        </button>
                        <input
                            type="file"
                            ref="fileInput"
                            @change="handleFileSelect"
                            accept=".pdf,.doc,.docx"
                            class="hidden"
                        />
                      </div>
                      <p v-if="formErrors.file" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.file }}
                      </p>
                    </div>

                    <div class="space-y-1.5 flex flex-col">
                      <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                        <i class="fa-solid fa-pen text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                        Cover Letter
                        <span class="text-textSupporting font-normal">(optional)</span>
                      </label>
                      <textarea
                          v-model="formData.coverLetter"
                          placeholder="Brief note on your experience and what you're looking for..."
                          class="flex-1 w-full min-h-[104px] text-sm px-3.5 py-3 rounded-xl border border-borderDefault bg-neutral-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:border-primary-500/35 hover:bg-white focus:bg-white resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div class="px-6 py-4 md:px-8 border-t border-borderDefault flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-neutral-50/80 via-white to-primary-50/30 shrink-0">
                  <p class="text-[11px] text-textSupporting hidden sm:block">
                    <i class="fa-solid fa-lock text-[10px] mr-1 opacity-60" aria-hidden="true"></i>
                    Your information is kept confidential.
                  </p>
                  <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-buttonBackground hover:bg-buttonHover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-orange hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group cursor-pointer"
                  >
                    <span class="relative z-10">
                      {{ isSubmitting ? 'Submitting...' : 'Submit application' }}
                    </span>
                  </button>
                </div>
              </form>
            </Transition>

          </div>
        </Transition>
      </div>
    </Transition>

    <Footer />
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm" aria-live="polite" aria-atomic="true">
      <TransitionGroup
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-6"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-200 ease-in absolute"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-6"
          move-class="transition-transform duration-200"
      >
        <div
            v-for="t in toasts"
            :key="t.id"
            role="alert"
            :class="[
              'relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm backdrop-blur-sm',
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800'
                : t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-primary-50 border-primary-200 text-primary-800',
            ]"
        >
          <i
              :class="[
                t.type === 'success' ? 'fa-solid fa-circle-check text-emerald-600'
                  : t.type === 'error' ? 'fa-solid fa-circle-exclamation text-red-600'
                  : t.type === 'warning' ? 'fa-solid fa-triangle-exclamation text-amber-600'
                  : 'fa-solid fa-circle-info text-primary-600',
                'text-base mt-0.5 shrink-0',
              ]"
              aria-hidden="true"
          ></i>
          <p class="flex-1 leading-snug">{{ t.message }}</p>
          <button
              type="button"
              @click="removeToast(t.id)"
              class="shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss notification"
          >&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCareers } from '@/composables/useCareers.js'
import Navbar from '../../components/navbar.vue'
import Footer from '../../components/footer.vue'
import ShineButton from '@/components/ShineButton.vue'
import MobileAutoSlide from '@/components/MobileAutoSlide.vue'
import careersHeroSvg from '@/assets/svg/careers-hero.svg'
import careersProcessSvg from '@/assets/svg/careers-process.svg'
import careersPerkAccentSvg from '@/assets/svg/careers-perk-accent.svg'
import careersStepSubmitSvg from '@/assets/svg/careers-step-submit.svg'
import careersStepCallSvg from '@/assets/svg/careers-step-call.svg'
import careersStepTechSvg from '@/assets/svg/careers-step-tech.svg'
import {useCvStore} from "@/stores/cvStore.js";

const {
  isModalOpen, submitSuccess, isDragging,
  fileName, fileUploaded, fileInput,
  isSubmitting, submitError,
  formData, formErrors,
  toasts, removeToast,
  openModal, closeModal,
  triggerFileSelect, handleFileSelect, handleFileDrop,
  handleSubmit, onEmailInput,
} = useCareers()

const heroLoaded = ref(false)
const currentWordIndex = ref(0)
let wordInterval = null
let heroTimer = null

const visible = reactive({
  tech: false,
  perks: false,
  process: false,
  openRoles: false,
  cta: false,
})

const techRef = ref(null)
const perksRef = ref(null)
const processRef = ref(null)
const openRolesRef = ref(null)
const ctaRef = ref(null)

const openRoles = ref([])
const hasOpenRoles = computed(() => openRoles.value.length > 0)

const heroWords = ['real impact', 'modern stacks', 'great teams']

const techList = [
  { name: 'Java', icon: ['fab', 'java'], color: 'text-[#E76F00]' },
  { name: 'Grails', icon: ['fas', 'seedling'], color: 'text-[#8E6CF0]' },
  { name: 'Python', icon: ['fab', 'python'], color: 'text-[#3776AB]' },
  { name: 'Vue.js', icon: ['fab', 'vuejs'], color: 'text-[#42B883]' },
  { name: 'React', icon: ['fab', 'react'], color: 'text-[#61DAFB]' },
  { name: 'Tailwind', icon: ['fas', 'wind'], color: 'text-[#38BDF8]' },
  { name: 'WordPress', icon: ['fab', 'wordpress'], color: 'text-[#21759B]' },
  { name: 'HTML / CSS', icon: ['fab', 'html5'], color: 'text-[#E34F26]' },
]

const perks = [
  { title: 'Work on live products', description: 'Contribute to Sentra AI, client platforms, and greenfield apps — code that reaches real users.', icon: 'fa-solid fa-bolt', iconSvg: careersPerkAccentSvg },
  { title: 'Learn every day', description: 'Pair with senior engineers, explore new patterns, and deepen skills across backend and frontend.', icon: 'fa-solid fa-code', iconSvg: careersPerkAccentSvg },
  { title: 'Transparent team', description: 'Weekly check-ins, clear expectations, and direct access to leads — no mystery management.', icon: 'fa-solid fa-users', iconSvg: careersPerkAccentSvg },
  { title: 'Remote-friendly', description: 'Collaborate from Islamabad or hybrid — we care about results and communication, not desk time.', icon: 'fa-solid fa-envelope', iconSvg: careersPerkAccentSvg },
  { title: 'Stable projects', description: 'Long-term client relationships and product work — not endless churn or throwaway MVPs.', icon: 'fa-solid fa-shield-halved', iconSvg: careersPerkAccentSvg },
  { title: 'Room to grow', description: 'Take ownership as you grow — from contributor to lead on features and modules you believe in.', icon: 'fa-solid fa-rocket', iconSvg: careersPerkAccentSvg },
]

const hiringSteps = [
  { number: '01', title: 'Submit CV', description: 'Share your profile and the kind of role you are looking for — we read every application.', iconSvg: careersStepSubmitSvg },
  { number: '02', title: 'Intro call', description: 'A friendly conversation about your experience, interests, and how we work.', iconSvg: careersStepCallSvg },
  { number: '03', title: 'Technical chat', description: 'Practical discussion or short exercise aligned with the stack — no trick questions.', iconSvg: careersStepTechSvg },
]

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const inputClass = (hasError) => [
  'w-full text-sm px-3.5 py-2.5 rounded-xl border bg-neutral-50 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-white focus:bg-white',
  hasError
    ? 'border-error/60 focus:border-error focus:ring-error/10'
    : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35',
]

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

const fetchOpenRoles = async () => {
  try {
    const { data } = await cvAPI.getPublishedJobs()
    openRoles.value = Array.isArray(data) ? data : []
  } catch {
    openRoles.value = []
  }
}

onMounted(async () => {
  heroTimer = setTimeout(() => { heroLoaded.value = true }, 80)
  wordInterval = setInterval(() => {
    currentWordIndex.value = (currentWordIndex.value + 1) % heroWords.length
  }, 2800)

  await fetchOpenRoles()

  observeSection(techRef.value, 'tech')
  observeSection(perksRef.value, 'perks')
  observeSection(processRef.value, 'process')
  observeSection(ctaRef.value, 'cta')

  if (hasOpenRoles.value) {
    await nextTick()
    observeSection(openRolesRef.value, 'openRoles')
  }
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
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 25s linear infinite; }
.animate-marquee:hover { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none !important;
  }
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
