<template>
  <!-- Backdrop -->
  <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
  >
    <div
        v-if="props.isOpen"
        @click="$emit('close')"
        class="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm z-9998"
    ></div>
  </transition>

  <!-- Modal -->
  <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
  >
    <div
        v-if="props.isOpen"
        class="fixed inset-0 z-9999 overflow-y-auto"
        aria-labelledby="modal-title"
        aria-modal="true"
        role="dialog"
    >
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <!-- Modal container -->
        <div
            class="relative w-full transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all flex flex-col"
            :class="{
                'max-w-md': props.size === 'sm',
                'max-w-2xl': props.size === 'md',
                'max-w-4xl': props.size === 'lg',
                'max-w-6xl': props.size === 'xl'
              }"
            style="height: 90vh; max-height: 90vh;"
            @click.stop
        >
          <!-- Main container with relative positioning -->
          <div class="relative w-full h-full flex flex-col" style="min-height: 500px;">

            <!-- Header - Fixed at top -->
            <div class="w-full flex items-center justify-between border-b border-slate-100/50 shrink-0" style="background: linear-gradient(135deg, rgb(255, 248, 243) 0%, rgb(245, 240, 255) 50%, rgb(239, 246, 255) 100%); padding: 1.5rem 2rem;">
              <div class="flex items-center gap-4 text-left">
                <div class="w-10 h-10 bg-[#D1FAE5] rounded-2xl flex items-center justify-center border border-[#A7F3D0] shrink-0 shadow-sm overflow-hidden">
                  <i class="fas fa-user text-xl"></i>
                </div>
                <div class="flex flex-col">
                  <h2 class="text-xl font-bold text-[#1e293b] tracking-tight leading-tight">
                    {{ props.title || 'Employee Details' }}
                  </h2>
                  <div v-if="props.subtitle" class="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                    <span class="tracking-wider uppercase font-bold text-[#64748b]">{{ props.subtitle }}</span>
                  </div>
                </div>
              </div>
              <button
                  @click="$emit('close')"
                  class="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>

            <!-- Scrollable Content - Takes remaining space -->
            <div class="flex-1 overflow-y-auto px-6 py-6" :style="props.hideFooter ? '' : 'padding-bottom: 80px;'">
              <slot></slot>
            </div>

            <!-- Footer - Absolutely positioned at bottom (if not hidden) -->
            <div v-if="!props.hideFooter" class="absolute bottom-0 left-0 right-0 w-full bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-end gap-2 sm:gap-3" style="padding: 1rem 2rem; border-radius: 0 0 2rem 2rem;">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <!-- Cancel button -->
                <button
                    v-if="props.mode === 'form' || props.mode === 'edit'"
                    type="button"
                    @click="$emit('cancel')"
                    class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition bg-white w-full sm:w-auto"
                >
                  {{ props.cancelText }}
                </button>

                <!-- Close button for view mode -->
                <button
                    v-if="props.mode === 'view'"
                    type="button"
                    @click="$emit('close')"
                    class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition bg-white w-full sm:w-auto"
                >
                  Close Details
                </button>

                <!-- More details / Show less toggle button -->
                <button
                    v-if="props.showMore !== undefined"
                    type="button"
                    @click="$emit('toggle-more')"
                    class="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition flex items-center justify-center gap-2 bg-[#E25C1D] hover:bg-[#D9531E] w-full sm:w-auto"
                >
                  <i v-if="props.showMore" class="fas fa-chevron-up text-xs"></i>
                  <i v-else class="fas fa-chevron-down text-xs"></i>
                  {{ props.showMore ? 'Show less' : 'More details' }}
                </button>

                <!-- Save/Update button for form/edit mode -->
                <button
                    v-if="props.mode === 'form' || props.mode === 'edit'"
                    type="submit"
                    :form="props.formId || 'edit-employee-form'"
                    class="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition bg-[#E25C1D] hover:bg-[#D9531E] w-full sm:w-auto"
                    :disabled="props.loading"
                >
                  {{ props.loading ? 'Saving...' : props.submitText }}
                </button>

                <!-- Delete button -->
                <button
                    v-if="props.mode === 'delete'"
                    type="button"
                    @click="$emit('confirm')"
                    class="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    :disabled="props.loading"
                >
                  {{ props.loading ? 'Deleting...' : props.confirmText }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue';

let savedScrollY = 0;

interface Props {
  isOpen: boolean;
  mode?: 'view' | 'form' | 'edit' | 'delete';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  submitText?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  hideFooter?: boolean;
  showMore?: boolean;
  formId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  mode: 'view',
  size: 'lg',
  title: 'Employee Details',
  submitText: 'Save changes',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
  hideFooter: false,
  showMore: false,
  formId: 'edit-employee-form'
});

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'toggle-more'): void;
}>();

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
  } else {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  }
});
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Animation for fade in */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}
</style>