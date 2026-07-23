<template>
  <div v-if="service" class="min-h-screen bg-neutral-100 font-primary text-headingMain antialiased">
    <Navbar />

    <!-- Hero -->
    <section :class="['relative pt-17 pb-0 overflow-hidden bg-gradient-to-b', service.mesh]">
      <div class="absolute inset-[-10%_-5%] pointer-events-none bg-[radial-gradient(circle_at_18%_20%,var(--color-secondary-100)_35%,transparent_42%),radial-gradient(circle_at_82%_18%,var(--color-mesh-purple)_32%,transparent_40%),radial-gradient(circle_at_50%_80%,var(--color-mesh-pink)_12%,transparent_45%)] animate-[meshShift_10s_ease-in-out_infinite_alternate]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-80 h-80 bg-secondary-100/45 -top-5 -left-20 animate-[orbDrift_14s_ease-in-out_infinite]"></div>
      <div class="absolute rounded-full blur-[70px] pointer-events-none w-70 h-70 bg-primary-300/35 top-15 -right-15 animate-[orbDrift_14s_ease-in-out_infinite] [animation-delay:-6s]"></div>

      <div class="relative max-w-[1040px] mx-auto px-6 z-30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 pb-12">
        <div class="relative z-30 text-left max-w-[560px] mx-auto md:mx-0 mt-10 animate-[fadeUp_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
          <span class="inline-block uppercase tracking-wider text-[11px] font-bold text-accent-3 bg-accent-3/10 px-3 py-1 rounded-full mb-4 font-display">{{ service.badge }}</span>
          <h1 class="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-1px] leading-[1.15] mb-4 text-headingMain">
            {{ service.headline }}<br />
            <em class="not-italic" :class="service.gradient">{{ service.headlineAccent }}</em>
          </h1>
          <p class="text-[15px] text-textBody leading-relaxed mb-6 font-primary">{{ service.description }}</p>
          <div class="flex flex-wrap gap-2 mb-6">
            <span v-for="tag in service.highlights" :key="tag"
                  class="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-section-white border border-borderDefault text-textBody animate-[chipPop_0.55s_cubic-bezier(0.22,1,0.36,1)_both]">
              {{ tag }}
            </span>
          </div>
          <div class="flex gap-3 flex-wrap">
            <ShineButton to="/contact">Start a Project</ShineButton>
            <router-link to="/#services" class="px-6 py-3 border border-borderDefault text-textBody font-semibold rounded-lg hover:bg-neutral-100 transition-colors text-sm no-underline font-primary">
              All Services
            </router-link>
          </div>
        </div>

        <div class="relative z-30 flex justify-center py-1 mx-auto md:mr-0 md:ml-auto animate-[fadeUp_0.9s_cubic-bezier(0.22,1,0.36,1)_0.1s_both]">
          <div class="relative w-full max-w-[480px] animate-[visualFloat_6s_ease-in-out_infinite]">
            <div :class="['absolute inset-[8%] rounded-full animate-[botGlow_3s_ease-in-out_infinite]', service.glow]"></div>
            <div class="absolute -inset-3.5 rounded-full border-2 border-dashed border-accent-3/35 animate-[spin_22s_linear_infinite]"></div>
            <div class="relative rounded-2xl overflow-hidden border border-borderDefault shadow-[var(--shadow-card)] bg-section-white hover:shadow-[var(--shadow-orchestri)] transition-all duration-350 hover:-translate-y-1">
              <img :src="service.heroSvg" :alt="service.title" class="w-full block" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 px-[5%] bg-section-white">
      <div class="max-w-5xl mx-auto">
        <MobileAutoSlide
            :items="service.features"
            min-height="180px"
            desktop-class="grid-cols-3 gap-5"
            item-key="title"
        >
          <template #default="{ item: feat }">
            <article
                class="group p-6 bg-cardSemi border border-borderDefault rounded-2xl shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 h-full"
            >
              <span class="w-11 h-11 rounded-xl bg-accent-3/10 flex items-center justify-center text-accent-3 mb-4 group-hover:scale-110 transition-transform">
                <i :class="feat.icon"></i>
              </span>
              <h3 class="font-display font-bold text-headingCard mb-2">{{ feat.title }}</h3>
              <p class="text-sm text-textSupporting leading-relaxed font-primary">{{ feat.text }}</p>
            </article>
          </template>
        </MobileAutoSlide>
      </div>
    </section>

    <!-- CTA -->
    <section class="p-6 md:p-12 max-w-7xl mx-auto">
      <div class="bg-buttonBackground text-white p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xl animate-[fadeUp_0.8s_ease_both]">
        <div class="max-w-2xl">
          <h2 class="text-2xl md:text-3xl font-bold font-display mb-2 text-white">Ready to build with Rasant?</h2>
          <p class="text-white/90 text-sm md:text-base leading-relaxed font-primary">Tell us about your goals — we respond within one business day with a free consultation.</p>
        </div>
        <ShineButton to="/contact" variant="white">Contact Us</ShineButton>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import ShineButton from '@/components/ShineButton.vue'
import MobileAutoSlide from '@/components/MobileAutoSlide.vue'
import { servicePages } from '@/config/servicesContent.js'

const route = useRoute()
const router = useRouter()
const service = computed(() => servicePages[route.params.slug])

watch(
  () => route.params.slug,
  (slug) => {
    if (slug && !servicePages[slug]) {
      router.replace('/')
      return
    }
    if (service.value?.title) {
      document.title = `${service.value.title} | Rasant Solutions`
    }
  },
  { immediate: true },
)
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
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
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
</style>
