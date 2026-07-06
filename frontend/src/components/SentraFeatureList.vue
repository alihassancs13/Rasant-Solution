<template>
  <div class="mt-[22px] max-w-[480px]">
    <MobileAutoSlide :items="items" min-height="88px" desktop-class="grid-cols-1 gap-4" item-key="title">
      <template #default="{ item }">
        <div class="flex gap-4 bg-white/50 rounded-xl p-3 border border-borderDefault hover:border-card-hover-border-alt transition-all duration-300">
          <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary-500/10 text-textBrand">
            <i :class="item.icon" class="text-sm text-textBody" aria-hidden="true"></i>
          </span>
          <div>
            <h4 class="text-sm font-bold text-headingCard font-display">{{ item.title }}</h4>
            <p class="text-[13px] text-textSupporting leading-relaxed font-primary">{{ item.description }}</p>
          </div>
        </div>
      </template>
    </MobileAutoSlide>
  </div>
</template>

<script setup>
import MobileAutoSlide from '@/components/MobileAutoSlide.vue'

defineProps({
  items: { type: Array, required: true },
})
</script>
