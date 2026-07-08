<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm" aria-live="polite" aria-atomic="true">
      <TransitionGroup
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-6"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-200 ease-in absolute"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-6"
          move-class="transition-transform duration-200"
      >
        <div
            v-for="t in toasts"
            :key="t.id"
            role="alert"
            :class="[
              'relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm backdrop-blur-sm bg-card',
              t.type === 'success' ? 'border-emerald-200 text-emerald-800'
                : t.type === 'error' ? 'border-red-200 text-red-800'
                : t.type === 'warning' ? 'border-amber-200 text-amber-800'
                : 'border-primary-200 text-primary-800',
            ]"
        >
          <span
              :class="[
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                t.type === 'success' ? 'bg-emerald-100 text-emerald-600'
                  : t.type === 'error' ? 'bg-red-100 text-red-600'
                  : t.type === 'warning' ? 'bg-amber-100 text-amber-600'
                  : 'bg-primary-100 text-primary-600',
              ]"
          >
            <i
                :class="[
                  t.type === 'success' ? 'fa-solid fa-check'
                    : t.type === 'error' ? 'fa-solid fa-xmark'
                    : t.type === 'warning' ? 'fa-solid fa-triangle-exclamation'
                    : 'fa-solid fa-circle-info',
                  'text-xs',
                ]"
                aria-hidden="true"
            ></i>
          </span>
          <p class="flex-1 leading-snug font-medium">{{ t.message }}</p>
          <button
              type="button"
              @click="removeToast(t.id)"
              class="shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss notification"
          >&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast.js'

const { toasts, removeToast } = useToast()
</script>