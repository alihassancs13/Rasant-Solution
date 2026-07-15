<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">


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
              <StatCard
                v-for="card in statusCards"
                :key="card.key"
                :label="card.label"
                :value="statusCounts[card.key] || 0"
                :icon="card.icon"
                :color="card.color"
               />
            </div>

            <!-- Split view: one card, vertical divider -->
            <div class="bg-white border border-border rounded-xl shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr] lg:divide-x lg:divide-border">

              <!-- Left column - Contact Submissions -->
              <div class="flex flex-col">
                <div class="p-4 bg-gradient-to-r bg-pink-50/70 border-b border-border">
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

                <div class="space-y-2 p-1 max-h-[65vh] overflow-y-auto">
                  <button
                      v-for="msg in filtered"
                      :key="msg.id"
                      type="button"
                      @click="selectMessage(msg)"
                      class="w-full text-left px-4 py-3.5  rounded-xl  transition-colors cursor-pointer flex items-start gap-3  border"
                      :class="selectedMessage?.id === msg.id
                        ? 'bg-gradient-to-r from-pink-50 via-pink-100/50 via-60% to-indigo-50  border-gray-300'
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
                      <p class="text-xs font-semibold text-[#C2571F] truncate">
                        {{ msg.project_type || 'General inquiry' }}
                      </p>
                      <p class="text-xs text-text-muted truncate ">{{ msg.message }}</p>
                    </div>
                  </button>

                  <div v-if="filtered.length === 0" class="px-4 py-8 text-center text-sm text-text-muted">
                    No matching inquiries.
                  </div>
                </div>
              </div>

              <!-- Right column - Detail View -->
               <div v-if="selectedMessage" class="flex flex-col h-full">

                 <!-- Header -->
               <div class="flex items-start justify-between gap-4 p-4 bg-linear-to-r from-pink-50 via-pink-100/50 via-0% to-indigo-50 border-b border-slate-200/60">
               <div class="min-w-0  flex flex-col gap-0">
                <h2 class="text-lg font-bold text-[#1E2A4A] truncate">{{ selectedMessage.full_name }}</h2>
                  <a :href="`mailto:${selectedMessage.email}`" class="text-[13px] font-bold text-[#C2571F] hover:underline break-all"> {{ selectedMessage.email }}</a>
               </div>
               <span
                   class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize"
                   :class="statusBadgeClasses(selectedMessage.status)" >
                    {{ statusLabel(selectedMessage.status) }}</span>
               </div>

               <!-- Full-Width Grayish Metadata Strip -->
              <div class="bg-[#F8FAFC] px-6 py-3 border-b border-slate-200/60">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">

                  <!-- Phone -->
                 <div class="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 ">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Phone
                  </p>
                  <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">
                    {{ selectedMessage.phone || 'N/A' }}
                  </p>
                </div>

                 <!-- Project Type -->
              <div class="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 ">
               <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500"> Project Type </p>
               <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]"> {{ selectedMessage.project_type || 'N/A' }}</p>
              </div>

               <!-- Submitted -->
              <div class="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 ">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500"> Submitted</p>
               <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">{{ formatShortDate(selectedMessage.created_at) }}</p>
              </div>

               <!-- Source -->
             <div class="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 ">
               <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500"> Source </p>
               <p class="mt-0.5 text-[13px] font-bold text-[#1E2A4A]">{{ selectedMessage.source || 'N/A' }}</p>
              </div>
             </div>
           </div>

           <!-- Scrollable Body Content -->
            <div class="px-6 pt-3 pb-6 space-y-4 flex-1 overflow-y-auto">

           <!-- Original Message -->
            <div>
             <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Original Message</span>
            <div class="bg-gradient-to-r from-pink-50 via-pink-100/50 via-0% to-indigo-50 border border-indigo-100/70 rounded-lg p-4">
              <p class="text-sm text-gray-600  whitespace-pre-line">{{ selectedMessage.message }}</p>
            </div>
            </div>

            <div class="border-t border-slate-200 -mx-6 px-6">
            <!-- No replies state -->
            <div v-if="!selectedMessage.replies?.length" class="text-[13px] text-slate-500 pt-3 pb-1">
              No replies sent yet.
            </div>

            <!-- Reply history state -->
            <div v-else>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reply History</span>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
             <div v-for="reply in selectedMessage.replies" :key="reply.id" class="bg-[#FBF1E7] rounded-lg p-3">
              <p class="text-sm text-[#1E2A4A] whitespace-pre-line">{{ reply.body }}</p>
               <p class="text-[11px] text-text-muted mt-1">{{ formatShortDate(reply.sent_at) }}</p>
              </div>
             </div>
            </div>
          </div>

              <!-- Reply Input -->
            <div class="border-t border-slate-200 pt-3 pb-3 -mx-6 px-6">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Reply via Email</span>
              <textarea
                v-model="replyText"
                rows="4"
                placeholder="Write your response — this will be sent to the inquiry email on file..."
                class="w-full rounded-lg border border-border bg-white text-sm text-text-primary placeholder-text-muted p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-y"></textarea>
            </div>
          </div>

            <!-- Action Footer -->
          <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-start gap-3 p-5 border-t border-border bg-white">
            <button
             @click="onSendReply"
             :disabled="sendingReply || !replyText.trim()"
             class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E8622C] hover:bg-[#D65A2B] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"  >
            <font-awesome-icon icon="fa-solid fa-paper-plane" />
             {{ sendingReply ? 'Sending...' : 'Send email reply' }}
            </button>

            <select
             :value="selectedMessage.status"
             @change="onStatusChange($event.target.value)"
             :disabled="updatingStatus"
             class="px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer disabled:opacity-60" >
            <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
           </select>
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
import StatCard from '@/components/statCard.vue'
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
  { key: 'new', label: 'New', icon: ['fas', 'inbox'], color: 'blue' },
  { key: 'in_progress', label: 'In Progress', icon: ['fas', 'spinner'], color: 'amber' },
  { key: 'replied', label: 'Replied', icon: ['fas', 'reply'], color: 'teal' },
  { key: 'quoted', label: 'Quoted', icon: ['fas', 'file-invoice-dollar'], color: 'purple' },
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