<template>
  <!-- Backdrop -->
  <div
      v-if="props.isOpen"
      @click="$emit('close')"
      class="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-40"
  ></div>

  <!-- Modal -->
  <div
      v-if="props.isOpen"
      class="fixed inset-0 z-50 overflow-y-auto "
      aria-labelledby="modal-title"
      aria-modal="true"
      role="dialog"
  >
    <div class="flex min-h-full items-center justify-center p-4 text-center">
      <!-- Modal container -->
      <div
          class="relative w-full transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all duration-300 ease-out"
          :class="{
            'max-w-md': props.mode === 'delete' || props.mode === 'toggle' || props.mode === 'confirm',
            'max-w-2xl': props.mode === 'form' && !props.wide,
            'max-w-4xl': props.mode === 'view',
            'max-w-6xl': props.wide
          }"
          @click.stop
      >
        <!-- ══════════ DELETE / CONFIRM MODE: centered confirmation layout ══════════ -->
        <template v-if="props.mode === 'delete' || props.mode === 'confirm'">
          <div class="px-8 pt-8 pb-6 flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-7 h-7 text-red-600" />
            </div>
            <h3
                id="modal-title"
                class="text-xl font-bold mb-2 break-words"
                :class="props.mode === 'delete' ? 'text-red-700' : 'text-gray-800'"
            >
              {{ props.title }}
            </h3>
            <p v-if="props.subtitle" class="text-sm text-gray-500 leading-relaxed max-w-sm break-words">
              {{ props.subtitle }}
            </p>
            <div v-if="$slots.default" class="w-full mt-4">
              <slot></slot>
            </div>
          </div>

          <div class="px-6 pb-6">
            <div class="flex items-center justify-center gap-3">
              <button
                  type="button"
                  @click="$emit('close')"
                  :disabled="props.loading"
                  class="flex-1 max-w-[160px] px-5 py-2.5 text-sm font-semibold rounded-xl btn-gradient-border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {{ props.cancelText }}
              </button>

              <button
                  type="submit"
                  @click="$emit('save')"
                  :disabled="props.loading || props.disabled"
                  class="flex-1 max-w-[160px] px-5 py-2.5 text-sm font-semibold rounded-xl text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  :class="props.mode === 'delete'
            ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 focus:ring-red-400'
            : 'btn-primary-gradient focus:ring-primary/40'"
              >
                <font-awesome-icon
                    v-if="props.loading"
                    icon="fa-solid fa-spinner"
                    spin
                    class="mr-2 h-4 w-4 text-white"
                />
                <span>{{ props.loading ? 'Processing...' : props.submitText }}</span>
              </button>
            </div>
          </div>
        </template>

        <!-- ══════════ OTHER MODES: form / view / toggle (unchanged) ══════════ -->
        <template v-else>
          <!-- Header -->
          <div
              class="px-6 py-4 border-b border-gray-100"
              :class="{
    'header-base-gradient': (props.mode === 'toggle' || props.mode === 'form') && !props.title.includes('Error'),
    'bg-gradient-to-r from-gray-50 to-gray-100': props.mode === 'view'
  }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start space-x-3 min-w-0 flex-1">
                <!-- Icon based on mode -->
                <div
                    class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="{
          'icon-gradient-brand': props.mode === 'toggle' || (props.mode === 'form' && !props.title.includes('Error')),
          'bg-rose-100 text-rose-600': props.title.includes('Error'),
          'bg-teal-100 text-teal-600': props.mode === 'view'
        }"
                >
                  <font-awesome-icon
                      v-if="props.mode === 'toggle'"
                      icon="fa-solid fa-bolt-lightning"
                      class="w-5 h-5"
                  />
                  <font-awesome-icon
                      v-else-if="props.mode === 'view'"
                      icon="fa-solid fa-eye"
                      class="w-5 h-5"
                  />
                  <font-awesome-icon
                      v-else
                      icon="fa-solid fa-check-circle"
                      class="w-5 h-5"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <h3
                      class="text-lg font-bold leading-6 break-words"
                      :class="{
            'text-red-700': props.title.includes('Error'),
            'text-gray-900': props.mode === 'view',
            'text-gray-800': !(props.title.includes('Error') || props.mode === 'view')
          }"
                      id="modal-title"
                  >
                    {{ props.title }}
                  </h3>
                  <p
                      v-if="props.subtitle"
                      class="text-sm mt-1 break-words"
                      :class="{
            'text-red-600': props.title.includes('Error'),
            'text-gray-600': props.mode === 'view',
            'text-gray-500': !(props.title.includes('Error') || props.mode === 'view')
          }"
                  >
                    {{ props.subtitle }}
                  </p>
                </div>
              </div>
              <button
                  @click="$emit('close')"
                  class="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 shrink-0"
                  aria-label="Close"
              >
                <font-awesome-icon
                    icon="fa-solid fa-times"
                    class="w-5 h-5 text-gray-500"
                />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div :class="['px-8 py-6 bg-white animate-fade-in custom-scrollbar overflow-y-auto', props.wide ? 'max-h-[72vh] px-6' : 'max-h-[60vh]']">
              <slot></slot>
            </div>
          </div>

          <!-- Footer -->
          <div
              class="px-6 py-4 border-t border-gray-100"
              :class="{
              'bg-gradient-to-r from-gray-50 to-gray-100': props.mode === 'view',
              'bg-red-50': props.title.includes('Error'),
              'bg-gray-50': props.mode === 'form' || props.mode === 'toggle'
            }"
          >
            <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                  v-if="props.mode !== 'view'"
                  type="button"
                  @click="$emit('close')"
                  :disabled="props.loading"
                  class="px-5 py-2.5 text-sm rounded-xl btn-gradient-border border border-0.125rem transition-all duration-200"
              >
                {{ props.cancelText }}
              </button>

              <!-- For view mode - only close button -->
              <button
                  v-if="props.mode === 'view'"
                  @click="$emit('close')"
                  class="px-5 py-2.5 text-sm rounded-xl btn-gradient-border transition-all duration-200"
              >
                Close Details
              </button>

              <!-- For other modes - submit button -->
              <button
                  v-if="props.mode !== 'view'"
                  type="submit"
                  @click="$emit('save')"
                  :disabled="props.loading || props.disabled"
                  class="px-5 py-2.5 text-sm font-medium rounded-xl text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  :class="{
                  'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 focus:ring-red-400': props.title.includes('Error'),
                  'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:ring-emerald-400': props.mode === 'toggle',
                  'bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] hover:from-[#295FB0] hover:via-[#386FC0] hover:to-[#417FD0] focus:ring-[#4A88D8]': props.mode === 'form' && !props.title.includes('Error'),
                }"
              >
                <font-awesome-icon
                    v-if="props.loading"
                    icon="fa-solid fa-spinner"
                    spin
                    class="mr-2 h-4 w-4 text-white"
                />
                <span>{{ props.loading ? 'Processing...': props.submitText }}</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface Props {
  isOpen: boolean;
  mode?: 'form' | 'delete' | 'toggle' | 'view' | 'confirm';
  title: string;
  submitText?: string;
  cancelText?: string;
  subtitle?: string;
  loading?: boolean;
  disabled?: boolean;
  wide?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  mode: 'form',
  loading: false,
  disabled: false,
  submitText: 'Save',
  cancelText: 'Cancel',
  wide: false,
});

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>

<style scoped>
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

/* Smooth modal animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.3s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
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
.modal-subtitle-text {
  color: var(--color-text-secondary);
  font-family: var(--font-primary);
}
</style>