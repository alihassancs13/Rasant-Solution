<template>
  <div class="flex items-center justify-center gap-3 mt-6">
    <button
        type="button"
        :aria-label="prevLabel"
        @click="$emit('prev')"
        class="group w-10 h-10 rounded-full border border-borderDefault bg-card text-headingCard flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange"
    >
      <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs transition-transform duration-200 group-hover:-translate-x-0.5" />
    </button>

    <div class="flex items-center gap-2">
      <button
          v-for="(_, i) in count"
          :key="i"
          type="button"
          :aria-label="`${dotLabel} ${i + 1}`"
          @click="$emit('select', i)"
          class="h-2 rounded-full transition-all duration-300"
          :class="i === active ? 'w-7 bg-primary-500' : 'w-2 bg-borderDefault hover:bg-primary-300'"
      ></button>
    </div>

    <button
        type="button"
        :aria-label="nextLabel"
        @click="$emit('next')"
        class="group w-10 h-10 rounded-full border border-borderDefault bg-card text-headingCard flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-buttonPrimaryHover hover:border-buttonPrimaryBorder hover:text-white hover:scale-105 hover:shadow-orange"
    >
      <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, required: true },
  active: { type: Number, required: true },
  prevLabel: { type: String, default: 'Previous slide' },
  nextLabel: { type: String, default: 'Next slide' },
  dotLabel: { type: String, default: 'Go to slide' },
})

defineEmits(['prev', 'next', 'select'])
</script>
