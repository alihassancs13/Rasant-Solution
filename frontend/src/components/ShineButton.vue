<template>
  <component
      :is="to ? RouterLink : 'button'"
      v-bind="to ? { to } : { type: props.type }"
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
    <span v-if="hasShine" class="shine" aria-hidden="true"></span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  label:   { type: String, default: '' },
  to:      { type: String, default: null },
  variant: { type: String, default: 'primary' }, // primary | outline | blue | green | white | secondary | accent
  size:    { type: String, default: 'md' },       // sm | md | lg | xl
  shape:   { type: String, default: 'xl' },       // xl | pill | 2xl | full
  type:    { type: String, default: 'button' },
})

defineEmits(['click'])

// Size configurations
const sizeClass = computed(() => ({
  sm: 'px-5 py-3 text-[13px]',
  md: 'px-6 py-3.5 text-[14px]',
  lg: 'px-7 py-3.5 text-[15px]',
  xl: 'px-7 py-4 text-[15px]',
}[props.size] ?? 'px-6 py-3.5 text-[14px]'))

// Shape configurations
const shapeClass = computed(() => ({
  xl:    'rounded-xl',
  pill:  'rounded-full',
  '2xl': 'rounded-2xl',
  full:  'rounded-[50px]',
}[props.shape] ?? 'rounded-xl'))

// Variant configurations using CSS variables from main.css
const variantClass = computed(() => {
  const variants = {
    // Primary - Orange
    primary: 'bg-secondary-900 hover:bg-secondary-800 text-white shadow-orange',

    // Outline
    outline: 'bg-white border border-neutral-300 hover:bg-neutral-100 text-primary-900 shadow-sm',

    // White
    white: 'bg-white text-secondary-600 hover:bg-secondary-50 shadow-md',

    // Blue
    blue: 'bg-primary-500 hover:bg-primary-600 text-white shadow-blue',

    // Green
    green: 'bg-accent-1 hover:bg-accent-2 text-white shadow-lg shadow-accent-1/20',

    // Secondary - Purple
    secondary: 'bg-accent-3 hover:bg-accent-3/80 text-white shadow-lg shadow-accent-3/20',

    // Accent - Teal
    accent: 'bg-accent-1 hover:bg-accent-2 text-white shadow-lg shadow-accent-1/20',

    // Dark
    dark: 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-900/20',

    // Ghost
    ghost: 'bg-transparent hover:bg-neutral-100 text-primary-900 border border-transparent hover:border-neutral-300',

    // Danger
    danger: 'bg-error hover:bg-error/80 text-white shadow-lg shadow-error/20',

    // Success
    success: 'bg-success hover:bg-success/80 text-white shadow-lg shadow-success/20',
  }

  return variants[props.variant] ?? variants.primary
})

// Determine if shine effect should be shown
const hasShine = computed(() => {
  const noShineVariants = ['outline', 'white', 'ghost']
  return !noShineVariants.includes(props.variant)
})
</script>

<style scoped>
@keyframes shine {
  0% {
    transform: translateX(-100%) skewX(-20deg);
  }
  100% {
    transform: translateX(300%) skewX(-20deg);
  }
}

.shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  width: 30%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 25%,
      rgba(255, 255, 255, 0.40) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 100%
  );
  animation: shine 0.8s ease-in-out infinite alternate;
  filter: blur(0.5px);
  border-radius: 50%;
}

/* Optional: Hover shine pause */
.group:hover .shine {
  animation-play-state: running;
}

/* Optional: Disable shine on touch devices */
@media (hover: none) {
  .shine {
    animation: none;
    display: none;
  }
}
</style>