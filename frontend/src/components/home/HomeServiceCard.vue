<template>
  <article
      class="group bg-card rounded-2xl border border-borderDefault shadow-blue p-6 sm:p-7 h-full flex flex-col transition-all duration-500 ease-out hover:shadow-insetBlue"
  >
    <img
        :src="service.illustration"
        :alt="service.title"
        loading="lazy"
        decoding="async"
        class="w-full h-32 sm:h-36 object-contain mb-4 transition-transform duration-500 group-hover:scale-[1.02]"
    />
    <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', service.iconBg]">
      <font-awesome-icon :icon="service.icon" :class="['text-2xl sm:text-3xl', service.iconColor]" />
    </div>
    <h3 class="text-lg font-bold text-headingCard mb-2 font-display">{{ service.title }}</h3>
    <p class="text-sm text-textBody leading-relaxed mb-4 flex-1 font-primary">{{ service.description }}</p>
    <div class="flex flex-wrap gap-2 mb-5">
      <span
          v-for="tag in service.tags"
          :key="tag.label"
          :class="['text-xs font-semibold px-3 py-1.5 rounded-full', tag.class]"
      >
        {{ tag.label }}
      </span>
    </div>
    <RouterLink :to="service.link" custom v-slot="{ navigate }">
      <a
          @click="onExplore(navigate)"
          class="inline-flex items-center gap-2 text-sm font-bold text-textBrand group-hover:gap-3 transition-all duration-200 font-primary cursor-pointer"
      >
        Explore Service
        <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </RouterLink>
  </article>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { nextTick } from 'vue'

defineProps({
  service: { type: Object, required: true },
})

function onExplore(navigate) {
  navigate()
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
</script>
