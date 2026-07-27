<template>
  <div
      class="skeleton-bone"
      :class="roundedClass"
      :style="boneStyle"
      aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '0.875rem' },
  rounded: { type: String, default: 'md' }, // none | sm | md | lg | xl | full
  className: { type: String, default: '' },
})

const roundedClass = computed(() => {
  const map = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }
  return [map[props.rounded] || map.md, props.className].filter(Boolean).join(' ')
})

const boneStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
</script>
