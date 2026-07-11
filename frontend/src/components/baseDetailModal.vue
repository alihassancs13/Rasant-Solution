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
            class="relative w-full transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all flex flex-col max-h-[90vh]"
            :class="{
            'max-w-md': props.size === 'sm',
            'max-w-2xl': props.size === 'md',
            'max-w-4xl': props.size === 'lg',
            'max-w-6xl': props.size === 'xl'
          }"
            @click.stop
        >
          <!-- Header -->
          <div
              class="px-8 py-6 border-b border-gray-200 flex-shrink-0"
              :class="getHeaderClasses"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <!-- Icon based on mode -->
                <div
                    class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    :class="getIconClasses"
                >
                  <font-awesome-icon
                      :icon="getModeIcon"
                      class="w-6 h-6"
                  />
                </div>
                <div>
                  <h3
                      class="text-xl font-bold leading-6"
                      :class="getTitleClasses"
                      id="modal-title"
                  >
                    {{ props.title }}
                  </h3>

                  <!-- Additional header info -->
                  <div v-if="props.subtitle || formattedTimestamp || props.itemId" class="mt-2 space-y-1">
                    <p v-if="props.subtitle" class="text-sm text-gray-600">
                      {{ props.subtitle }}
                    </p>
                  </div>
                </div>
              </div>
              <button
                  v-if="!props.hideClose"
                  @click="$emit('close')"
                  class="rounded-xl p-2 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  aria-label="Close"
              >
                <font-awesome-icon
                    icon="fa-solid fa-times"
                    class="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
                />
              </button>
            </div>
          </div>

          <!-- Body - Main content area that should NOT have max-height -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div class="bg-white animate-fade-in">
              <slot></slot>
            </div>
          </div>

          <!-- Footer -->
          <div
              v-if="!props.hideFooter"
              class="px-8 py-5 border-t border-gray-200 flex-shrink-0"
              :class="getFooterClasses"
          >
            <div class="flex justify-end space-x-3">
              <!-- Cancel button -->
              <button
                  v-if="props.mode !== 'view' && props.mode !== 'info'"
                  @click="$emit('cancel')"
                  :disabled="props.loading"
                  class="px-6 py-3 text-sm rounded-xl btn-gradient-border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ props.cancelText }}
              </button>

              <!-- Action buttons based on mode -->
              <button
                  v-if="props.mode === 'delete'"
                  @click="$emit('confirm')"
                  :disabled="props.loading"
                  class="px-6 py-3 text-sm font-medium rounded-xl border border-transparent bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <font-awesome-icon
                    v-if="props.loading"
                    icon="fa-solid fa-spinner"
                    spin
                    class="w-4 h-4 mr-2"
                />
                <font-awesome-icon
                    v-else
                    icon="fa-solid fa-trash--can"
                    class="w-4 h-4 mr-2"
                />
                {{ props.confirmText }}
              </button>

              <button
                  v-if="props.mode === 'form'"
                  @click="$emit('save')"
                  :disabled="props.disabled || props.loading"
                  class="px-6 py-3 text-sm font-medium rounded-xl border border-transparent bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white hover:from-[#295FB0] hover:via-[#386FC0] hover:to-[#417FD0] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A88D8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <font-awesome-icon
                    v-if="props.loading"
                    icon="fa-solid fa-spinner"
                    spin
                    class="w-4 h-4 mr-2"
                />
                <font-awesome-icon
                    v-else
                    icon="fa-solid fa-check"
                    class="w-4 h-4 mr-2"
                />
                {{ props.submitText }}
              </button>

              <button
                  v-if="props.mode === 'success'"
                  @click="$emit('confirm')"
                  :disabled="props.loading"
                  class="px-6 py-3 text-sm font-medium rounded-xl border border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <font-awesome-icon
                    v-if="props.loading"
                    icon="fa-solid fa-spinner"
                    spin
                    class="w-4 h-4 mr-2"
                />
                <font-awesome-icon
                    v-else
                    icon="fa-solid fa-check-circle"
                    class="w-4 h-4 mr-2"
                />
                {{ props.confirmText }}
              </button>

              <button
                  v-if="props.mode === 'warning' || props.mode === 'error'"
                  @click="$emit('confirm')"
                  :disabled="props.loading"
                  class="px-6 py-3 text-sm font-medium rounded-xl border border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <font-awesome-icon
                    v-if="props.loading"
                    icon="fa-solid fa-spinner"
                    spin
                    class="w-4 h-4 mr-2"
                />
                <font-awesome-icon
                    v-else
                    icon="fa-solid fa-exclamation-triangle"
                    class="w-4 h-4 mr-2"
                />
                {{ props.confirmText }}
              </button>

              <!-- Close button for view/info modes -->
              <button
                  v-if="props.mode === 'view' || props.mode === 'info'"
                  @click="$emit('close')"
                  class="px-6 py-3 text-sm rounded-xl btn-gradient-border transition-all duration-200 flex items-center"
              >
                <font-awesome-icon
                    icon="fa-solid fa-times"
                    class="w-4 h-4 mr-2"
                />
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

let savedScrollY = 0;


// Add icons to library

interface Props {
  isOpen: boolean;
  mode?: 'form' | 'delete' | 'view' | 'warning' | 'info' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  itemId?: string | number;
  submitText?: string;
  timestamp?: string | number | Date;
  loading?: boolean;
  disabled?: boolean;
  hideFooter?: boolean;
  hideClose?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  mode: 'view',
  size: 'lg',
  title: 'Details',
  submitText: 'Save',
  loading: false,
  disabled: false,
  hideFooter: false,
  hideClose: false,
  confirmText: 'Confirm',
  cancelText: 'Cancel'
});

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
  (e: 'delete'): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

// Computed properties
const formattedTimestamp = computed(() => {
  if (!props.timestamp) return '';

  const date = new Date(props.timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const getModeIcon = computed(() => {
  const iconMap: Record<string, any> = {
    'form': 'fa-solid fa-edit',
    'delete': 'fa-solid fa-trash-can',
    'view': 'fa-solid fa-eye',
    'warning': 'fa-solid fa-exclamation-triangle',
    'info': 'fa-solid fa-info-circle',
    'success': 'fa-solid fa-check-circle',
    'error': 'fa-solid fa-times-circle'
  };
  return iconMap[props.mode] || 'fa-solid fa-info-circle';
});

const getHeaderClasses = computed(() => {
  const classes: Record<string, string> = {
    'form': 'header-base-gradient',
    'delete': 'bg-gradient-to-r from-red-50 to-rose-50',
    'view': 'header-base-gradient',
    'warning': 'bg-gradient-to-r from-yellow-50 to-amber-50',
    'info': 'bg-gradient-to-r from-blue-50 to-cyan-50',
    'success': 'bg-gradient-to-r from-green-50 to-emerald-50',
    'error': 'bg-gradient-to-r from-red-50 to-pink-50'
  };
  return classes[props.mode] || 'bg-gradient-to-r from-gray-50 to-gray-100';
});

const getIconClasses = computed(() => {
  const classes: Record<string, string> = {
    'form': 'icon-gradient-brand',
    'delete': 'bg-red-100 text-red-600',
    'view': 'icon-gradient-brand',
    'warning': 'bg-yellow-100 text-yellow-600',
    'info': 'bg-blue-100 text-blue-600',
    'success': 'bg-green-100 text-green-600',
    'error': 'bg-red-100 text-red-600'
  };
  return classes[props.mode] || 'bg-gray-100 text-gray-600';
});

const getTitleClasses = computed(() => {
  const classes: Record<string, string> = {
    'form': 'text-teal-700',
    'delete': 'text-red-700',
    'view': 'text-gray-900',
    'warning': 'text-yellow-700',
    'info': 'text-blue-700',
    'success': 'text-green-700',
    'error': 'text-red-700'
  };
  return classes[props.mode] || 'text-gray-900';
});

const getFooterClasses = computed(() => {
  const classes: Record<string, string> = {
    'form': 'bg-gray-50',
    'delete': 'bg-gradient-to-r from-red-50 to-rose-50',
    'view': 'bg-gray-50',
    'warning': 'bg-gradient-to-r from-yellow-50 to-amber-50',
    'info': 'bg-gradient-to-r from-blue-50 to-cyan-50',
    'success': 'bg-gradient-to-r from-green-50 to-emerald-50',
    'error': 'bg-gradient-to-r from-red-50 to-pink-50'
  };
  return classes[props.mode] || 'bg-gradient-to-r from-gray-50 to-gray-100';
});
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
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
  margin: 4px 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Animations */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Styling for slotted content */
:deep(.detail-section) {
  margin-bottom: 1.5rem;
}

:deep(.detail-section:last-child) {
  margin-bottom: 0;
}

:deep(.detail-label) {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

:deep(.detail-value) {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
  padding: 0.5rem 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.75rem;
}

:deep(.detail-value:last-child) {
  margin-bottom: 0;
}

:deep(.detail-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

:deep(.detail-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.detail-row:last-child) {
  border-bottom: none;
}

:deep(.detail-badge) {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

:deep(.detail-badge.active) {
  background-color: #d1fae5;
  color: #065f46;
}

:deep(.detail-badge.inactive) {
  background-color: #fee2e2;
  color: #991b1b;
}

:deep(.detail-badge.pending) {
  background-color: #fef3c7;
  color: #92400e;
}

/* Section headers in slotted content */
:deep(h4.detail-heading) {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

/* Chip styling for tags */
:deep(.detail-chip) {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #e0f2fe;
  color: #0369a1;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Status indicators */
:deep(.status-indicator) {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

:deep(.status-indicator.active) {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

:deep(.status-indicator.inactive) {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

/* Loading skeleton */
:deep(.detail-skeleton) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.375rem;
  height: 1rem;
  margin-bottom: 0.5rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Field labels inside slotted form content (Job Title, Job Type, Department, etc.) */
:deep(.dash-field label) {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  font-family: var(--font-primary);
}
</style>