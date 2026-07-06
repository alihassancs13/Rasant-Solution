<template>
  <div v-if="items.length">
    <!-- Mobile: single auto-sliding slot -->
    <div
        v-if="items.length > 1"
        :class="[mobileHideClass, 'relative']"
        :style="{ minHeight }"
    >
      <div
          v-for="(item, index) in items"
          :key="resolveKey(item, index)"
          :class="slideClasses(index)"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
    <div v-else :class="mobileHideClass">
      <slot :item="items[0]" :index="0" />
    </div>

    <!-- Desktop: full grid -->
    <div :class="[desktopHideClass, desktopClass]">
      <template v-for="(item, index) in items" :key="resolveKey(item, index)">
        <slot :item="item" :index="index" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHomeCarousel } from '@/composables/useHomeCarousel.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  minHeight: { type: String, default: '140px' },
  autoMs: { type: Number, default: 3200 },
  desktopClass: { type: String, default: 'gap-4' },
  stackBelow: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  itemKey: { type: String, default: '' },
  active: { type: Boolean, default: true },
})

const carousel = useHomeCarousel(props.items.length, {
  autoMs: props.autoMs,
})

const mobileHideClass = computed(() => {
  if (props.stackBelow === 'sm') return 'sm:hidden'
  if (props.stackBelow === 'lg') return 'lg:hidden'
  return 'md:hidden'
})

const desktopHideClass = computed(() => {
  if (props.stackBelow === 'sm') return 'hidden sm:grid'
  if (props.stackBelow === 'lg') return 'hidden lg:grid'
  return 'hidden md:grid'
})

function resolveKey(item, index) {
  if (props.itemKey && item && item[props.itemKey] != null) return item[props.itemKey]
  if (item?.title) return item.title
  if (item?.name) return item.name
  return index
}

function slideClasses(index) {
  const base =
    'absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]'

  if (!props.active) {
    return `${base} opacity-0 scale-75 -rotate-3 blur-md pointer-events-none`
  }
  if (index === carousel.index) {
    return `${base} opacity-100 scale-100 rotate-0 blur-none pointer-events-auto z-20`
  }
  if (index === carousel.exitingIndex) {
    return `${base} opacity-0 scale-110 rotate-3 blur-md z-10`
  }
  return `${base} opacity-0 scale-75 -rotate-3 blur-md pointer-events-none z-0`
}
</script>
