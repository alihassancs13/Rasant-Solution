<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Decorative top accent strip -->
      <div class="h-[3px] w-full bg-gradient-to-r from-blue-500 via-amber-500 via-teal-400 to-violet-500"></div>

      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <div class="max-w-none">

          <!-- Loading -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p class="text-sm text-text-muted mt-3">Loading inquiries...</p>
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
          <div v-else>
            <!-- Status pipeline cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div
                  v-for="card in statusCards"
                  :key="card.key"
                  class="bg-white border-t-4 rounded-2xl shadow-md px-5 py-4"
                  :style="{ borderTopColor: card.color }"
              >
                <p class="text-[11px] font-semibold tracking-wide text-text-muted uppercase">{{ card.label }}</p>
                <p class="text-3xl font-bold text-[#1E2A4A] mt-1">{{ statusCounts[card.key] || 0 }}</p>
              </div>
            </div>

            <!-- Split view: one card, vertical divider -->
            <div class="bg-white border border-border rounded-2xl shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr] lg:divide-x lg:divide-border">

              <!-- Left column - Contact Submissions -->
              <div class="flex flex-col">
                <div class="p-4 bg-gradient-to-r from-[#FBF1E7] to-[#F5EDE5] border-b border-border">
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

                <div class="divide-y divide-border max-h-[65vh] overflow-y-auto">
                  <button
                      v-for="msg in filtered"
                      :key="msg.id"
                      type="button"
                      @click="selectMessage(msg)"
                      class="w-full text-left px-4 py-3.5 transition-colors cursor-pointer flex items-start gap-3 border-l-4"
                      :class="selectedMessage?.id === msg.id
                        ? 'bg-[#FBF1E7] border-[#E8622C]'
                        : 'border-transparent hover:bg-surface-alt'"
                  >
                    <div class="w-9 h-9 rounded-full bg-[#EDEBFB] text-[#5B4FC4] font-semibold text-xs flex items-center justify-center shrink-0">
                      {{ initials(msg.full_name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-semibold text-sm text-[#1E2A4A] truncate">{{ msg.full_name }}</span>
                        <span class="text-[11px] text-text-muted shrink-0">{{ formatShortDate(msg.created_at) }}</span>
                      </div>
                      <p class="text-xs font-semibold text-[#C2571F] truncate mt-0.5">
                        {{ msg.project_type || 'General inquiry' }}
                      </p>
                      <p class="text-xs text-text-muted truncate mt-0.5">{{ msg.message }}</p>
                    </div>
                  </button>

                  <div v-if="filtered.length === 0" class="px-4 py-8 text-center text-sm text-text-muted">
                    No matching inquiries.
                  </div>
                </div>
              </div>

              <!-- Right column - Detail View -->
              <div v-if="selectedMessage" class="flex flex-col">
                <div class="flex items-start justify-between gap-4 p-5 bg-gradient-to-r from-[#F5EDE5] to-[#EEF3FB] border-b border-border">
                  <div class="min-w-0">
                    <h2 class="text-xl font-bold text-[#1E2A4A] truncate">{{ selectedMessage.full_name }}</h2>
                    <a :href="`mailto:${selectedMessage.email}`" class="text-sm font-medium text-[#E8622C] hover:underline break-all">
                      {{ selectedMessage.email }}
                    </a>
                  </div>
                  <span
                      class="shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize"
                      :class="statusBadgeClasses(selectedMessage.status)"
                  >
                    {{ statusLabel(selectedMessage.status) }}
                  </span>
                </div>

                <div class="p-5 space-y-5 flex-1 overflow-y-auto">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-surface-alt/70 border border-border rounded-lg p-3">
                      <span class="text-[10px] font-semibold text-text-muted uppercase">Phone</span>
                      <p class="text-sm font-semibold text-[#1E2A4A] mt-1">{{ selectedMessage.phone || 'N/A' }}</p>
                    </div>
                    <div class="bg-surface-alt/70 border border-border rounded-lg p-3">
                      <span class="text-[10px] font-semibold text-text-muted uppercase">Project Type</span>
                      <p class="text-sm font-semibold text-[#1E2A4A] mt-1">{{ selectedMessage.project_type || 'N/A' }}</p>
                    </div>
                    <div class="bg-surface-alt/70 border border-border rounded-lg p-3">
                      <span class="text-[10px] font-semibold text-text-muted uppercase">Submitted</span>
                      <p class="text-sm font-semibold text-[#1E2A4A] mt-1">{{ formatShortDate(selectedMessage.created_at) }}</p>
                    </div>
                    <div class="bg-surface-alt/70 border border-border rounded-lg p-3">
                      <span class="text-[10px] font-semibold text-text-muted uppercase">Source</span>
                      <p class="text-sm font-semibold text-[#1E2A4A] mt-1">{{ selectedMessage.source || 'N/A' }}</p>
                    </div>
                  </div>

                  <div>
                    <span class="text-[10px] font-semibold text-text-muted uppercase block mb-1.5">Original Message</span>
                    <div class="bg-surface-alt/70 border border-border rounded-lg p-4">
                      <p class="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{{ selectedMessage.message }}</p>
                    </div>
                  </div>

                  <div v-if="!selectedMessage.replies?.length" class="text-sm text-text-muted">
                    No replies sent yet.
                  </div>
                  <div v-else>
                    <span class="text-[10px] font-semibold text-text-muted uppercase block mb-1.5">Reply History</span>
                    <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                      <div v-for="reply in selectedMessage.replies" :key="reply.id" class="bg-[#FBF1E7] rounded-lg p-3">
                        <p class="text-sm text-[#1E2A4A] whitespace-pre-line">{{ reply.body }}</p>
                        <p class="text-[11px] text-text-muted mt-1">{{ formatShortDate(reply.sent_at) }}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span class="text-[10px] font-medium text-text-muted uppercase block mb-1.5">Reply via Email</span>
                    <textarea
                        v-model="replyText"
                        rows="4"
                        placeholder="Write your response — this will be sent to the inquiry email on file..."
                        class="w-full rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-y"
                    ></textarea>
                  </div>
                </div>

                <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-start gap-3 p-5 border-t border-border bg-white">
                  <button
                      @click="onSendReply"
                      :disabled="sendingReply || !replyText.trim()"
                      class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E8622C] hover:bg-[#D65A2B] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <font-awesome-icon icon="fa-solid fa-paper-plane" />
                    {{ sendingReply ? 'Sending...' : 'Send email reply' }}
                  </button>

                  <select
                      :value="selectedMessage.status"
                      @change="onStatusChange($event.target.value)"
                      :disabled="updatingStatus"
                      class="px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer disabled:opacity-60"
                  >
                    <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useInquiries, STATUS_OPTIONS } from '@/composables/useInquiries.js'
import { useToast } from '@/composables/useToast.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const {
  messages, loading, error, statusCounts, fetchMessages,
  searchQuery, searchInput, filtered,
  selectedMessage, selectMessage,
  replyText, sendingReply, handleSendReply,
  updatingStatus, handleStatusChange,
  initials, formatShortDate,
} = useInquiries()

const toast = useToast()

const statusCards = [
  { key: 'new', label: 'New', color: '#3B82F6' },
  { key: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { key: 'replied', label: 'Replied', color: '#14B8A6' },
  { key: 'quoted', label: 'Quoted', color: '#8B5CF6' },
]

function statusLabel(value) {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label || value
}

function statusBadgeClasses(value) {
  const map = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    replied: 'bg-teal-100 text-teal-700',
    quoted: 'bg-violet-100 text-violet-700',
  }
  return map[value] || 'bg-surface-alt text-text-muted'
}

async function onSendReply() {
  const result = await handleSendReply()
  if (result?.success) {
    toast.success('Reply sent successfully.')
  } else {
    toast.error(result?.message || 'Failed to send email reply.')
  }
}

async function onStatusChange(status) {
  const result = await handleStatusChange(status)
  if (result?.success) {
    toast.success('Status updated.')
  } else {
    toast.error(result?.message || 'Failed to update status.')
  }
}

onMounted(fetchMessages)
</script>