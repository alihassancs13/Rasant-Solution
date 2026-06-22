<template>
  <component
      :is="to ? RouterLink : 'button'"
      v-bind="to ? { to } : { type: props.type }"
      :class="[
      'cursor-pointer relative overflow-hidden',
      'font-[\'Space_Grotesk\'] font-bold',
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
  variant: { type: String, default: 'primary' }, // primary | outline | blue | green
  size:    { type: String, default: 'md' },       // sm | md | lg | xl
  shape:   { type: String, default: 'xl' },       // xl | pill | 2xl
  type:    { type: String, default: 'button' },
})

defineEmits(['click'])

const sizeClass = computed(() => ({
  sm: 'px-5 py-3 text-[13px]',
  md: 'px-6 py-3.5 text-[14px]',
  lg: 'px-7 py-3.5 text-[15px]',
  xl: 'px-7 py-4 text-[15px]',
}[props.size] ?? 'px-6 py-3.5 text-[14px]'))

const shapeClass = computed(() => ({
  xl:    'rounded-xl',
  pill:  'rounded-[50px]',
  '2xl': 'rounded-2xl',
}[props.shape] ?? 'rounded-xl'))

const variantClass = computed(() => ({
  primary: 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-lg shadow-[#C2410C]/20',
  outline: 'bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] shadow-sm',
  white:   'bg-white text-orange-600 hover:bg-orange-100 shadow-md',
  blue:    'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20',
  green:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20',
}[props.variant] ?? 'bg-[#C2410C] hover:bg-[#9A3412] text-white'))

const hasShine = computed(() => !['outline', 'white'].includes(props.variant))
</script>

<style scoped>
@keyframes shine {
  0%   { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(300%)  skewX(-20deg); }
}
.shine {
  position: absolute; inset: 0; pointer-events: none;
  width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.40) 50%, rgba(255,255,255,0.15) 75%, transparent 100%);
  animation: shine 0.8s ease-in-out infinite alternate;
  filter: blur(0.5px); border-radius: 50%;
}
</style>