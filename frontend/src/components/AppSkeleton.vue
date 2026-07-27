<template>
  <div class="w-full" :class="wrapClass" role="status" aria-live="polite" aria-busy="true">
    <span class="sr-only">Loading content…</span>

    <!-- Stats / KPI cards -->
    <div v-if="variant === 'stats'" class="grid gap-3 sm:gap-4" :class="statsGridClass">
      <div
          v-for="i in count"
          :key="`stat-${i}`"
          class="rounded-xl border border-border bg-white p-4 sm:p-5 space-y-3 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <SkeletonBone width="40%" height="0.7rem" />
          <SkeletonBone width="2.25rem" height="2.25rem" rounded="lg" />
        </div>
        <SkeletonBone width="45%" height="1.5rem" />
        <SkeletonBone width="70%" height="0.65rem" />
      </div>
    </div>

    <!-- Data table -->
    <div v-else-if="variant === 'table'" class="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
      <div class="hidden md:block">
        <div class="flex gap-4 px-4 py-3 border-b border-border bg-surface">
          <SkeletonBone
              v-for="c in columns"
              :key="`th-${c}`"
              :width="c === 1 ? '28%' : '14%'"
              height="0.7rem"
          />
        </div>
        <div
            v-for="r in count"
            :key="`tr-${r}`"
            class="flex items-center gap-4 px-4 py-3.5 border-b border-border-subtle last:border-0"
        >
          <SkeletonBone width="2rem" height="2rem" rounded="full" class-name="shrink-0" />
          <SkeletonBone width="22%" height="0.75rem" />
          <SkeletonBone width="14%" height="0.75rem" />
          <SkeletonBone width="12%" height="0.75rem" />
          <SkeletonBone width="16%" height="0.75rem" />
          <SkeletonBone width="10%" height="0.75rem" />
        </div>
      </div>
      <div class="md:hidden space-y-3 p-3">
        <div
            v-for="r in count"
            :key="`card-${r}`"
            class="rounded-xl border border-border p-4 space-y-3"
        >
          <div class="flex items-center gap-3">
            <SkeletonBone width="2.5rem" height="2.5rem" rounded="full" />
            <div class="flex-1 space-y-2">
              <SkeletonBone width="55%" height="0.8rem" />
              <SkeletonBone width="35%" height="0.65rem" />
            </div>
          </div>
          <SkeletonBone width="100%" height="0.65rem" />
          <SkeletonBone width="70%" height="0.65rem" />
        </div>
      </div>
    </div>

    <!-- Card grid (vault, credentials, documents) -->
    <div v-else-if="variant === 'cards'" class="grid gap-3 sm:gap-4" :class="cardsGridClass">
      <div
          v-for="i in count"
          :key="`card-${i}`"
          class="rounded-xl border border-border bg-white p-4 space-y-3 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <SkeletonBone width="2.5rem" height="2.5rem" rounded="lg" />
          <div class="flex-1 space-y-2">
            <SkeletonBone width="70%" height="0.8rem" />
            <SkeletonBone width="40%" height="0.65rem" />
          </div>
        </div>
        <SkeletonBone width="100%" height="0.65rem" />
        <SkeletonBone width="85%" height="0.65rem" />
        <div class="flex gap-2 pt-1">
          <SkeletonBone width="4.5rem" height="1.75rem" rounded="md" />
          <SkeletonBone width="4.5rem" height="1.75rem" rounded="md" />
        </div>
      </div>
    </div>

    <!-- Vertical list (leave, inquiries, inbox) -->
    <div v-else-if="variant === 'list'" class="rounded-xl border border-border bg-white overflow-hidden shadow-sm divide-y divide-border-subtle">
      <div
          v-for="i in count"
          :key="`li-${i}`"
          class="flex items-center gap-3 px-4 py-3.5"
      >
        <SkeletonBone width="2.25rem" height="2.25rem" rounded="full" class-name="shrink-0" />
        <div class="flex-1 space-y-2 min-w-0">
          <SkeletonBone :width="i % 2 ? '55%' : '70%'" height="0.75rem" />
          <SkeletonBone :width="i % 2 ? '35%' : '45%'" height="0.6rem" />
        </div>
        <SkeletonBone width="3.5rem" height="1.5rem" rounded="full" class-name="shrink-0" />
      </div>
    </div>

    <!-- Form section -->
    <div v-else-if="variant === 'form'" class="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm space-y-5">
      <SkeletonBone width="30%" height="1rem" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="i in count" :key="`field-${i}`" class="space-y-2">
          <SkeletonBone width="40%" height="0.65rem" />
          <SkeletonBone width="100%" height="2.5rem" rounded="lg" />
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <SkeletonBone width="5.5rem" height="2.25rem" rounded="lg" />
        <SkeletonBone width="5.5rem" height="2.25rem" rounded="lg" />
      </div>
    </div>

    <!-- Sidebar nav items -->
    <div v-else-if="variant === 'sidebar'" class="space-y-2 px-1">
      <div
          v-for="i in count"
          :key="`nav-${i}`"
          class="flex items-center gap-3 rounded-xl px-2 py-2.5"
      >
        <SkeletonBone width="1.5rem" height="1.5rem" rounded="md" class-name="shrink-0" />
        <SkeletonBone v-if="!collapsed" :width="i % 3 === 0 ? '70%' : '55%'" height="0.75rem" />
      </div>
    </div>

    <!-- Dashboard page (stats + table) -->
    <div v-else-if="variant === 'dashboard'" class="space-y-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
            v-for="i in 4"
            :key="`d-stat-${i}`"
            class="rounded-xl border border-border bg-white p-4 sm:p-5 space-y-3 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <SkeletonBone width="40%" height="0.7rem" />
            <SkeletonBone width="2.25rem" height="2.25rem" rounded="lg" />
          </div>
          <SkeletonBone width="45%" height="1.5rem" />
          <SkeletonBone width="70%" height="0.65rem" />
        </div>
      </div>
      <div class="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
        <div class="flex gap-4 px-4 py-3 border-b border-border bg-surface">
          <SkeletonBone v-for="c in 5" :key="`d-th-${c}`" width="14%" height="0.7rem" />
        </div>
        <div
            v-for="r in count"
            :key="`d-tr-${r}`"
            class="flex items-center gap-4 px-4 py-3.5 border-b border-border-subtle last:border-0"
        >
          <SkeletonBone width="2rem" height="2rem" rounded="full" class-name="shrink-0" />
          <SkeletonBone width="22%" height="0.75rem" />
          <SkeletonBone width="14%" height="0.75rem" />
          <SkeletonBone width="16%" height="0.75rem" />
          <SkeletonBone width="12%" height="0.75rem" />
        </div>
      </div>
    </div>

    <!-- Master-detail / analytics detail -->
    <div v-else-if="variant === 'detail'" class="space-y-4">
      <div class="rounded-xl border border-border bg-white p-4 sm:p-5 space-y-3 shadow-sm">
        <div class="flex items-center gap-3">
          <SkeletonBone width="3rem" height="3rem" rounded="full" />
          <div class="flex-1 space-y-2">
            <SkeletonBone width="40%" height="1rem" />
            <SkeletonBone width="25%" height="0.65rem" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-xl border border-border bg-white p-4 space-y-3 shadow-sm">
          <SkeletonBone width="35%" height="0.8rem" />
          <SkeletonBone width="100%" height="10rem" rounded="lg" />
        </div>
        <div class="rounded-xl border border-border bg-white overflow-hidden shadow-sm divide-y divide-border-subtle">
          <div v-for="i in 5" :key="`d-li-${i}`" class="flex items-center gap-3 px-4 py-3.5">
            <SkeletonBone width="2.25rem" height="2.25rem" rounded="full" class-name="shrink-0" />
            <div class="flex-1 space-y-2 min-w-0">
              <SkeletonBone width="60%" height="0.75rem" />
              <SkeletonBone width="40%" height="0.6rem" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact inline (fallback) -->
    <div v-else class="space-y-3 py-6">
      <SkeletonBone
          v-for="i in count"
          :key="`line-${i}`"
          :width="i % 2 ? '100%' : '75%'"
          height="0.85rem"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SkeletonBone from '@/components/SkeletonBone.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'list',
    validator: (v) =>
        ['stats', 'table', 'cards', 'list', 'form', 'sidebar', 'dashboard', 'detail', 'lines'].includes(v),
  },
  count: { type: Number, default: 6 },
  columns: { type: Number, default: 5 },
  cols: { type: Number, default: 4 }, // grid columns for stats/cards
  collapsed: { type: Boolean, default: false },
  className: { type: String, default: '' },
})

const wrapClass = computed(() => props.className)

const statsGridClass = computed(() => {
  if (props.cols === 2) return 'grid-cols-2'
  if (props.cols === 3) return 'grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-2 lg:grid-cols-4'
})

const cardsGridClass = computed(() => {
  if (props.cols === 2) return 'grid-cols-1 sm:grid-cols-2'
  if (props.cols === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})
</script>
