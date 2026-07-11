<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-[min(380px,calc(100vw-48px))]" aria-live="polite" aria-atomic="true">
      <TransitionGroup
          enter-active-class="transition-[transform,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          enter-from-class="translate-x-[calc(100%+32px)] opacity-0"
          enter-to-class="translate-x-0 opacity-100"
          leave-active-class="transition-[transform,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] absolute"
          leave-from-class="translate-x-0 opacity-100"
          leave-to-class="translate-x-[calc(100%+32px)] opacity-0"
          move-class="transition-transform duration-200"
      >
        <div
            v-for="t in toasts"
            :key="t.id"
            role="alert"
            :class="[
              'relative flex items-center max-w-[min(380px,calc(100vw-48px))] pl-11 pr-10 py-[13px] rounded-xl text-[13px] font-semibold leading-[1.45] border shadow-[0_10px_28px_rgba(15,23,42,0.1)] pointer-events-auto',
              t.type === 'success' ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                : t.type === 'error' ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                : t.type === 'warning' ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
            ]"
        >
          <i
              :class="[
                t.type === 'success' ? 'fa-solid fa-check'
                  : t.type === 'error' ? 'fa-solid fa-xmark'
                  : t.type === 'warning' ? 'fa-solid fa-triangle-exclamation'
                  : 'fa-solid fa-circle-info',
                'absolute left-4 top-1/2 -translate-y-1/2 text-[13px]',
              ]"
              aria-hidden="true"
          ></i>
          <span class="flex-1">{{ t.message }}</span>
          <button
              type="button"
              @click="removeToast(t.id)"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none opacity-50 hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit"
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