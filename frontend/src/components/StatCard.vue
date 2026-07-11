<template>
  <div
      class="relative bg-white border border-slate-200 rounded-xl p-3 shadow-sm overflow-hidden"
  >
    <!-- Top accent bar with dynamic gradient based on color prop -->
    <div class="absolute top-0 left-0 right-0 h-1" :class="accent.bar"></div>

    <div class="flex items-start justify-between">
      <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
        {{ label }}
      </p>
      <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          :class="accent.iconBg"
      >
        <font-awesome-icon :icon="icon" class="w-3.5 h-3.5" :class="accent.iconColor" />
      </div>
    </div>

    <p class="text-2xl font-bold text-slate-900 mt-1.5">{{ value }}</p>
    <p v-if="subtitle" class="text-xs text-slate-500 mt-1">{{ subtitle }}</p>

    <router-link
        v-if="link"
        :to="link"
        class="text-xs font-medium text-blue-600 hover:underline mt-0.5 inline-block"
    >
      {{ linkLabel }}
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: '' },
  icon: { type: Array, required: true },
  color: { type: String, default: 'pink' },
  link: { type: String, default: null },
  linkLabel: { type: String, default: 'View more' }
})

const themes = {
  // First card - Pink gradient
  pink: {
    bar: 'bg-gradient-to-r from-[#FFD5B4] to-[#E8C1D9]',
    iconBg: 'bg-[rgba(255,213,180,0.35)]',
    iconColor: 'text-gray-600'
  },
  // Second card - Purple gradient
  purple: {
    bar: 'bg-gradient-to-r from-[#E8C1D9] to-[#C9C4F8]',
    iconBg: 'bg-[rgba(201,196,248,0.35)]',
    iconColor: 'text-gray-600'
  },
  // Third card - Blue gradient
  blue: {
    bar: 'bg-gradient-to-r from-[#C9C4F8] to-[#8FB9F4]',
    iconBg: 'bg-[rgba(143,185,244,0.35)]',
    iconColor: 'text-gray-600'
  },
  // Fourth card - Teal gradient
  teal: {
    bar: 'bg-gradient-to-r from-[#8FB9F4] to-[#14B8A6]',
    iconBg: 'bg-[rgba(20,184,166,0.2)]',
    iconColor: 'text-gray-600'
  },
  // Orange theme (default fallback)
  orange: {
    bar: 'bg-orange-400',
    iconBg: 'bg-orange-100',
    iconColor: 'text-gray-600'
  },
  green: {
    bar: 'bg-green-400',
    iconBg: 'bg-green-100',
    iconColor: 'text-gray-600'
  },
  yellow: {
    bar: 'bg-gradient-to-r from-[#FDE68A] to-[#F59E0B]',
    iconBg: 'bg-[rgba(245,158,11,0.15)]',
    iconColor: 'text-gray-600'
  },
  red: {
    bar: 'bg-red-400',
    iconBg: 'bg-red-100',
    iconColor: 'text-gray-600'
  }
}

const accent = computed(() => themes[props.color] || themes.pink)
</script>