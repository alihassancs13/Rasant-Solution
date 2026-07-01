<!-- src/pages/Admin/InquiriesPage.vue -->
<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Top Header -->
      <div class="p-3 pl-16 sm:p-4 md:pl-4">

        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <div class="max-w-5xl mx-auto">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Inquiries</h1>
              <p class="text-sm text-gray-500 mt-1">
                {{ filtered.length }} message{{ filtered.length !== 1 ? 's' : '' }} from your contact form
              </p>
            </div>

            <div class="relative w-full sm:w-72">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                  ref="searchInput"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by name, email, message..."
                  class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B55E2]/30 focus:border-[#1B55E2] transition-all"
              />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#1B55E2] border-t-transparent"></div>
            <p class="text-sm text-gray-500 mt-3">Loading inquiries...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="text-red-500 text-xl" />
            </div>
            <p class="text-gray-700 font-medium">Couldn't load inquiries</p>
            <p class="text-sm text-gray-500 mt-1">{{ error }}</p>
            <button
                @click="fetchMessages"
                class="mt-4 px-5 py-2 rounded-xl bg-[#1B55E2] text-white text-sm font-medium hover:bg-[#1546B8] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-14 h-14 rounded-full bg-[#E2ECF9] flex items-center justify-center mb-3">
              <font-awesome-icon icon="fa-solid fa-inbox" class="text-[#1B55E2] text-xl" />
            </div>
            <p class="text-gray-700 font-medium">
              {{ searchQuery ? 'No matching inquiries' : 'No inquiries yet' }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              {{ searchQuery ? 'Try a different search term.' : 'New contact form messages will show up here.' }}
            </p>
          </div>

          <!-- Messages List -->
          <div v-else class="space-y-3">
            <div
                v-for="msg in filtered"
                :key="msg.id"
                class="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 min-w-0">
                  <!-- Avatar -->
                  <div class="w-10 h-10 rounded-full bg-[#E2ECF9] text-[#1B55E2] font-semibold text-sm flex items-center justify-center shrink-0">
                    {{ initials(msg.full_name) }}
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="font-semibold text-gray-800">{{ msg.full_name }}</h3>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-400">{{ formatDate(msg.created_at) }}</span>
                    </div>
                    <a :href="`mailto:${msg.email}`" class="text-sm text-[#1B55E2] hover:underline break-all">
                      {{ msg.email }}
                    </a>
                  </div>
                </div>

              </div>

              <p class="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">
                {{ msg.message }}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '../components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import { useDashboard } from '@/composables/useDashboard.js'

const {
  messages, loading, error, searchQuery, searchInput,
  fetchMessages, deleteMessage, filtered,
  formatDate, initials,
} = useDashboard()
</script>