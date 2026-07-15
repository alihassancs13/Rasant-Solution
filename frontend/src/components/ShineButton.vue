<template>
  <button
      v-if="!to"
      :type="type"
      :class="[
      'cursor-pointer relative overflow-hidden',
      'font-display font-bold',
      'no-underline transition-all duration-200 active:scale-[0.98]',
      'inline-flex items-center justify-center gap-2 group',
      'hover:-translate-y-0.5',
      sizeClass, shapeClass, variantClass,
    ]"
      @click="$emit('click', $event)"
      :disabled="disabled"
  >
    <slot>{{ label }}</slot>
    <span
        v-if="badge !== null"
        class="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-xs font-bold shrink-0"
    >
      {{ badge }}
    </span>
  </button>

  <RouterLink
      v-else
      :to="to"
      :class="[
      'cursor-pointer relative overflow-hidden',
      'font-display font-bold',
      'no-underline transition-all duration-200 active:scale-[0.98]',
      'inline-flex items-center justify-center gap-2 group',
      'hover:-translate-y-0.5',
      sizeClass, shapeClass, variantClass,
    ]"
      @click="$emit('click', $event)"
  >
    <slot>{{ label }}</slot>
    <span
        v-if="badge !== null"
        class="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-xs font-bold shrink-0"
    >
      {{ badge }}
    </span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  label:   { type: String, default: '' },
  to:      { type: String, default: null },
  variant: { type: String, default: 'primary' },
  size:    { type: String, default: 'md' },
  shape:   { type: String, default: 'xl' },
  type:    { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  badge:   { type: [String, Number], default: null },
})

defineEmits(['click'])

const sizeClass = computed(() => ({
  xs: 'px-3.5 py-2 text-[12px]',
  sm: 'px-5 py-3 text-[13px]',
  md: 'px-6 py-3.5 text-[14px]',
  lg: 'px-7 py-3.5 text-[15px]',
  xl: 'px-7 py-4 text-[15px]',
}[props.size] ?? 'px-6 py-3.5 text-[14px]'))

const shapeClass = computed(() => ({
  xl:    'rounded-xl',
  pill:  'rounded-full',
  '2xl': 'rounded-2xl',
  full:  'rounded-[50px]',
}[props.shape] ?? 'rounded-xl'))

const variantClass = computed(() => {
  const variants = {
    primary:   'bg-buttonBackground hover:bg-buttonHover text-buttonTextColor shadow-orange',
    outline:   'bg-white border border-neutral-300 hover:bg-neutral-100 text-primary-900 shadow-sm',
    white:     'bg-buttonBackground text-buttonTextColor hover:bg-secondary-50 shadow-md',
    blue:      'bg-primary-500 hover:bg-primary-600 text-white shadow-blue',
    green:     'bg-accent-1 hover:bg-accent-2 text-white shadow-lg shadow-accent-1/20',
    secondary: 'bg-accent-3 hover:bg-accent-3/80 text-white shadow-lg shadow-accent-3/20',
    accent:    'bg-accent-1 hover:bg-accent-2 text-white shadow-lg shadow-accent-1/20',
    dark:      'bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-900/20',
    ghost:     'bg-transparent hover:bg-neutral-100 text-primary-900 border border-transparent hover:border-neutral-300',
    danger:    'bg-error hover:bg-error/80 text-white shadow-lg shadow-error/20',
    success:   'bg-success hover:bg-success/80 text-white shadow-lg shadow-success/20',
    teal:      'bg-teal-500 hover:bg-teal-600 text-white shadow-sm',
    urgent:    'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl',
  }
  return variants[props.variant] ?? variants.primary
})
</script>