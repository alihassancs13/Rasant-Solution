<template>
  <div
      class="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden"
  >
    <!-- Top accent bar -->
    <div class="absolute top-0 left-0 right-0 h-1" :class="accent.bar"></div>

    <div class="flex items-start justify-between">
      <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
        {{ label }}
      </p>
      <div
          class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          :class="accent.iconBg"
      >
        <font-awesome-icon :icon="icon" class="w-4 h-4" :class="accent.iconColor" />
      </div>
    </div>

    <p class="text-3xl font-bold text-slate-900 mt-2">{{ value }}</p>

    <p class="text-xs text-slate-400 mt-1">
      {{ subtitle }}
    </p>

    <router-link
        v-if="link"
        :to="link"
        class="text-xs font-medium text-blue-600 hover:underline mt-1 inline-block"
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
  subtitle: { type: String, required: true },
  icon: { type: Array, required: true }, // e.g. ['fas', 'globe']
  color: { type: String, default: 'orange' }, // orange | purple | blue | teal
  link: { type: String, default: null },
  linkLabel: { type: String, default: 'View more' }
})

const themes = {
  orange: {
    bar: 'bg-orange-400',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500'
  },
  purple: {
    bar: 'bg-purple-400',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500'
  },
  blue: {
    bar: 'bg-blue-400',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500'
  },
  teal: {
    bar: 'bg-teal-400',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600'
  }
}

const accent = computed(() => themes[props.color] || themes.orange)
</script>