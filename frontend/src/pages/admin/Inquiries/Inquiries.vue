<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader
            userName="System Admin"
            role="admin"
            :notificationCount="3"
            titleOverride="Inquiries"
            subtitleOverride="Manage your messages and notifications"
            :iconOverride="['fas', 'paper-plane']"
        />
      </div>

      <main class="flex-1 min-h-0 overflow-hidden px-3 sm:px-4 pb-4 flex flex-col gap-4">

        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <AppSkeleton variant="stats" :count="4" />
          <AppSkeleton variant="list" :count="8" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-14 h-14 rounded-full bg-danger-subtle flex items-center justify-center mb-3">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="text-danger text-xl" />
          </div>
          <p class="text-text-primary font-medium">Couldn't load inquiries</p>
          <p class="text-sm text-text-muted mt-1">{{ error }}</p>
          <button
              @click="fetchMessages"
              class="mt-4 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-14 h-14 rounded-full bg-primary-subtle flex items-center justify-center mb-3">
            <font-awesome-icon icon="fa-solid fa-inbox" class="text-primary text-xl" />
          </div>
          <p class="text-text-primary font-medium">No inquiries yet</p>
          <p class="text-sm text-text-muted mt-1">New contact form messages will show up here.</p>
        </div>

        <!-- Main content -->
        <div v-else class="flex-1 min-h-0 flex flex-col gap-4">
          <!-- Status pipeline cards - hidden on mobile -->
          <div class="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <StatCard
                v-for="card in statusCards"
                :key="card.key"
                :label="card.label"
                :value="statusCounts[card.key] || 0"
                :icon="card.icon"
                :color="card.color"
                class="!py-2.5 !px-3"
            />
          </div>

          <!-- Main container -->
          <div class="flex-1 min-h-0 bg-white border border-border rounded-xl shadow-md overflow-hidden relative">

            <!-- ====== MOBILE VIEW ====== -->
            <!-- List View -->
            <div v-if="isMobile && !showMobileDetail" class="flex flex-col h-full">
              <div class="p-4 bg-gradient-to-r bg-pink-50/70 border-b border-border shrink-0">
                <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Contact Submissions ({{ filtered.length }})
                </p>
                <div class="relative">
                  <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                  <input
                      ref="searchInput"
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search..."
                      class="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div class="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                <button
                    v-for="msg in filtered"
                    :key="msg.id"
                    type="button"
                    @click="selectMessageMobile(msg)"
                    class="w-full text-left px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 border hover:shadow-md"
                    :class="selectedMessage?.id === msg.id
                        ? 'bg-gradient-to-r from-pink-50 via-pink-100/50 to-indigo-50 border-primary/30 shadow-md'
                        : 'bg-white border-transparent hover:bg-surface-alt'"
                >
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-900 font-semibold text-sm flex items-center justify-center shrink-0">
                    {{ initials(msg.full_name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-semibold text-sm text-[#1E2A4A] truncate">{{ msg.full_name }}</span>
                      <span class="text-[11px] text-text-muted shrink-0">{{ formatShortDate(msg.created_at) }}</span>
                    </div>
                    <p class="text-xs text-text-muted truncate">{{ msg.message }}</p>
                    <span class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          :class="getStatusBadgeClass(msg.status)">
                      {{ getStatusName(msg.status) }}
                    </span>
                  </div>
                </button>

                <div v-if="filtered.length === 0" class="px-4 py-8 text-center text-sm text-text-muted">
                  No matching inquiries.
                </div>
              </div>
            </div>

            <!-- Mobile Detail View -->
            <div v-if="isMobile && showMobileDetail && selectedMessage" class="flex flex-col h-full absolute inset-0 bg-white z-10">
              <!-- Back button -->
              <div class="p-3 border-b border-border bg-white flex items-center gap-3 shrink-0">
                <button @click="closeMobileDetail" class="p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer">
                  <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-text-primary text-lg" />
                </button>
                <span class="font-semibold text-text-primary">Inquiry Details</span>
              </div>

              <!-- Detail content -->
              <div class="flex-1 min-h-0 overflow-y-auto">
                <!-- Header -->
                <div class="bg-linear-to-r from-pink-50 via-pink-100/50 to-indigo-50 p-4 shrink-0">
                  <div class="flex flex-col gap-3">
                    <div>
                      <h2 class="text-lg font-bold text-[#1E2A4A]">{{ selectedMessage.full_name }}</h2>
                      <a :href="`mailto:${selectedMessage.email}`" class="text-[13px] font-bold text-[#C2571F] hover:underline break-all">{{ selectedMessage.email }}</a>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <button @click="openEmailModal(selectedMessage)"
                              class="flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#E8622C] hover:bg-[#D65A2B] rounded-full transition shadow-sm cursor-pointer whitespace-nowrap">
                        <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-3.5 h-3.5 shrink-0" />
                        <span>Email</span>
                      </button>

                      <div class="relative flex-1 min-w-0">
                        <select
                            :value="selectedMessage.status"
                            @change="handleStatusChange($event.target.value)"
                            :disabled="updatingStatus"
                            class="w-full appearance-none px-3.5 py-2 pr-9 text-sm font-semibold text-text-primary bg-white border border-border rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60">
                          <option v-for="s in statuses" :key="s.code" :value="s.code">{{ s.name }}</option>
                        </select>
                        <font-awesome-icon icon="fa-solid fa-chevron-down" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted w-2 h-2" />
                      </div>

                      <button @click="requestDelete(selectedMessage)" :disabled="deleting"
                              class="flex-1 min-w-0 px-4 py-2 text-sm font-semibold text-text-muted bg-white border border-border-subtle rounded-full hover:bg-surface-alt hover:text-text-secondary transition cursor-pointer whitespace-nowrap disabled:opacity-60">
                        {{ deleting ? 'Removing...' : 'Remove' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Metadata -->
                <div class="bg-[#F8FAFC] px-4 py-3 border-b border-slate-200/60">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="bg-white border border-slate-200/90 rounded-xl px-3 py-2">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</p>
                      <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">{{ selectedMessage.phone || 'N/A' }}</p>
                    </div>
                    <div class="bg-white border border-slate-200/90 rounded-xl px-3 py-2">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted</p>
                      <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">{{ formatShortDate(selectedMessage.created_at) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Content -->
                <div class="px-4 pt-3 pb-6 space-y-4">
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Original Message</span>
                    <div class="bg-gradient-to-r from-pink-50 via-pink-100/50 to-indigo-50 border border-indigo-100/70 rounded-lg p-4">
                      <p class="text-sm text-gray-600 whitespace-pre-line">{{ selectedMessage.message }}</p>
                    </div>
                  </div>

                  <div v-if="selectedMessage.replies?.length" class="border-t border-slate-200 pt-3">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reply History</span>
                    <div class="space-y-2 max-h-40 overflow-y-auto pr-1 mt-1.5">
                      <div v-for="reply in selectedMessage.replies" :key="reply.id" class="bg-[#FBF1E7] rounded-lg p-3">
                        <p class="text-sm text-[#1E2A4A] whitespace-pre-line">{{ reply.body }}</p>
                        <p class="text-[11px] text-text-muted mt-1">{{ formatShortDate(reply.sent_at) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ====== DESKTOP VIEW ====== -->
            <div v-if="!isMobile" class="hidden lg:grid h-full grid-cols-[380px_1fr] divide-x divide-border">
              <!-- Left column -->
              <div class="flex flex-col min-h-0 overflow-hidden">
                <div class="p-4 bg-gradient-to-r bg-pink-50/70 border-b border-border shrink-0">
                  <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Contact Submissions
                  </p>
                  <div class="relative">
                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                    <input
                        ref="searchInput"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search..."
                        class="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                  <button
                      v-for="msg in filtered"
                      :key="msg.id"
                      type="button"
                      @click="selectMessage(msg)"
                      class="w-full text-left px-4 py-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 border"
                      :class="selectedMessage?.id === msg.id
                          ? 'bg-gradient-to-r from-pink-50 via-pink-100/50 to-indigo-50 border-primary/30 shadow-md'
                          : 'bg-white border-transparent hover:bg-surface-alt'"
                  >
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-900 font-semibold text-sm flex items-center justify-center shrink-0">
                      {{ initials(msg.full_name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-semibold text-sm text-[#1E2A4A] truncate">{{ msg.full_name }}</span>
                        <span class="text-[11px] text-text-muted shrink-0">{{ formatShortDate(msg.created_at) }}</span>
                      </div>
                      <p class="text-xs text-text-muted truncate">{{ msg.message }}</p>
                    </div>
                  </button>

                  <div v-if="filtered.length === 0" class="px-4 py-8 text-center text-sm text-text-muted">
                    No matching inquiries.
                  </div>
                </div>
              </div>

              <!-- Right column -->
              <div v-if="selectedMessage" class="flex flex-col min-h-0 overflow-hidden">
                <div class="bg-linear-to-r from-pink-50 via-pink-100/50 to-indigo-50 border-b border-slate-200/60 p-4 sm:p-6 shrink-0">
                  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div class="min-w-0">
                      <h2 class="text-lg sm:text-xl font-bold text-[#1E2A4A] truncate">{{ selectedMessage.full_name }}</h2>
                      <a :href="`mailto:${selectedMessage.email}`" class="text-[13px] font-bold text-[#C2571F] hover:underline break-all">{{ selectedMessage.email }}</a>
                    </div>

                    <div class="w-full sm:w-auto flex flex-wrap items-center gap-2">
                      <button @click="openEmailModal(selectedMessage)"
                              class="flex-1 sm:flex-initial min-w-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#E8622C] hover:bg-[#D65A2B] rounded-full transition shadow-sm cursor-pointer whitespace-nowrap">
                        <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-3.5 h-3.5 shrink-0" />
                        <span class="sm:hidden">Email</span>
                        <span class="hidden sm:inline">Email candidate</span>
                      </button>

                      <div class="relative flex-1 sm:flex-initial min-w-0">
                        <select
                            :value="selectedMessage.status"
                            @change="handleStatusChange($event.target.value)"
                            :disabled="updatingStatus"
                            class="w-full appearance-none px-3.5 py-2 pr-9 text-sm font-semibold text-text-primary bg-white border border-border rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60">
                          <option v-for="s in statuses" :key="s.code" :value="s.code">{{ s.name }}</option>
                        </select>
                        <font-awesome-icon icon="fa-solid fa-chevron-down" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted w-2 h-2" />
                      </div>

                      <button @click="requestDelete(selectedMessage)" :disabled="deleting"
                              class="flex-1 sm:flex-initial min-w-0 px-4 py-2 text-sm font-semibold text-text-muted bg-white border border-border-subtle rounded-full hover:bg-surface-alt hover:text-text-secondary transition cursor-pointer whitespace-nowrap disabled:opacity-60">
                        {{ deleting ? 'Removing...' : 'Remove' }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="bg-[#F8FAFC] px-6 py-3 border-b border-slate-200/60 shrink-0">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</p>
                      <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">{{ selectedMessage.phone || 'N/A' }}</p>
                    </div>
                    <div class="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted</p>
                      <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">{{ formatShortDate(selectedMessage.created_at) }}</p>
                    </div>
                  </div>
                </div>

                <div class="px-6 pt-3 pb-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
                  <div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Original Message</span>
                    <div class="bg-gradient-to-r from-pink-50 via-pink-100/50 to-indigo-50 border border-indigo-100/70 rounded-lg p-4">
                      <p class="text-sm text-gray-600 whitespace-pre-line">{{ selectedMessage.message }}</p>
                    </div>
                  </div>

                  <div v-if="selectedMessage.replies?.length" class="border-t border-slate-200 -mx-6 px-6 pt-3">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reply History</span>
                    <div class="space-y-2 max-h-40 overflow-y-auto pr-1 mt-1.5">
                      <div v-for="reply in selectedMessage.replies" :key="reply.id" class="bg-[#FBF1E7] rounded-lg p-3">
                        <p class="text-sm text-[#1E2A4A] whitespace-pre-line">{{ reply.body }}</p>
                        <p class="text-[11px] text-text-muted mt-1">{{ formatShortDate(reply.sent_at) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Modal -->
        <BaseModal :is-open="showEmailModal" mode="form" size="lg" title="Email Inquiry"
                   :subtitle="`Sending to: ${emailForm.to}`"
                   :submit-text="sendingReply ? 'Sending...' : 'Send Email'" :loading="sendingReply"
                   @close="closeEmailModal" @cancel="closeEmailModal" @save="handleSendReply">
          <form @submit.prevent="handleSendReply">
            <div class="space-y-4">
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Subject</label>
                <input v-model="emailForm.subject" type="text"
                       class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Message</label>
                <textarea v-model="emailForm.message" rows="8"
                          class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
            </div>
          </form>
        </BaseModal>

        <!-- Delete Confirm -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          <div @click="cancelDelete" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"></div>
          <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border z-10 transform transition-all">
            <h3 class="text-lg font-bold text-text-primary mb-2">Delete Inquiry</h3>
            <p class="text-sm text-text-muted mb-6">Are you sure you want to delete this inquiry? This action cannot be undone.</p>
            <div class="flex items-center justify-end gap-3">
              <button @click="cancelDelete" class="px-4 py-2 text-sm font-semibold text-text-secondary bg-surface hover:bg-surface-alt rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button @click="confirmDelete" :disabled="deleting"
                      class="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger-hover rounded-xl transition-colors shadow-sm shadow-danger/20 cursor-pointer disabled:opacity-60">
                {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import AppHeader from '@/components/header.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import StatCard from '@/components/statCard.vue'
import BaseModal from '@/components/baseModal.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import { useInquiries } from '@/composables/useInquiries.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Mobile state
const isMobile = ref(window.innerWidth < 1024)
const showMobileDetail = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  // Close mobile detail on resize to desktop
  if (!isMobile.value) {
    showMobileDetail.value = false
  }
}

// Custom select for mobile
const selectMessageMobile = (msg) => {
  selectMessage(msg)
  showMobileDetail.value = true
}

const closeMobileDetail = () => {
  showMobileDetail.value = false
  // Optionally clear selection
  // selectedMessage.value = null
}

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const {
  messages, loading, error, statusCounts, fetchMessages,
  statuses, fetchStatuses, statusCards,
  searchQuery, searchInput, filtered,
  selectedMessage, selectMessage,
  showEmailModal, emailForm, openEmailModal, closeEmailModal,
  sendingReply, handleSendReply,
  updatingStatus, handleStatusChange,
  deleting, showDeleteConfirm, requestDelete, cancelDelete, confirmDelete,
  initials, formatShortDate,
} = useInquiries()

// Helper functions
const getStatusBadgeClass = (status) => {
  const classes = {
    'new': 'bg-blue-100 text-blue-700',
    'in_progress': 'bg-yellow-100 text-yellow-700',
    'held': 'bg-orange-100 text-orange-700',
    'closed': 'bg-green-100 text-green-700',
    'resolved': 'bg-green-100 text-green-700',
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getStatusName = (status) => {
  const names = {
    'new': 'New',
    'in_progress': 'In Progress',
    'held': 'Held',
    'closed': 'Closed',
    'resolved': 'Resolved',
  }
  return names[status] || status
}

onMounted(() => {
  fetchStatuses()
  fetchMessages()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Mobile optimizations */
@media (max-width: 1023px) {
  .lg\:grid {
    display: none !important;
  }
}

/* Slide animation for mobile detail */
.mobile-detail-enter-active,
.mobile-detail-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.mobile-detail-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.mobile-detail-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>