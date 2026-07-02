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
        <div class="max-w-6xl mx-auto">
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

          <!-- Table -->
          <div v-else class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                <tr class="bg-gray-50/80 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th class="px-5 py-3 font-medium">Name</th>
                  <th class="px-5 py-3 font-medium">Email</th>
                  <th class="px-5 py-3 font-medium">Message</th>
                  <th class="px-5 py-3 font-medium whitespace-nowrap">Date</th>
                  <th class="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                <tr
                    v-for="msg in filtered"
                    :key="msg.id"
                    @click="openModal(msg)"
                    class="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-9 h-9 rounded-full bg-[#E2ECF9] text-[#1B55E2] font-semibold text-xs flex items-center justify-center shrink-0">
                        {{ initials(msg.full_name) }}
                      </div>
                      <span class="font-medium text-gray-800 truncate">{{ msg.full_name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <a
                        :href="`mailto:${msg.email}`"
                        @click.stop
                        class="text-[#1B55E2] hover:underline break-all"
                    >
                      {{ msg.email }}
                    </a>
                  </td>
                  <td class="px-5 py-4 text-gray-500 max-w-xs">
                    <p class="truncate">{{ msg.message }}</p>
                  </td>
                  <td class="px-5 py-4 text-gray-500 whitespace-nowrap">{{ formatDate(msg.created_at) }}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-end gap-2" @click.stop>
                      <button
                          @click="openModal(msg)"
                          class="px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B55E2] bg-[#E2ECF9] hover:bg-[#d3e2f7] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                          @click="handleDelete(msg)"
                          class="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
            v-if="selectedMessage"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>

          <!-- Panel -->
          <div class="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-full bg-[#E2ECF9] text-[#1B55E2] font-semibold flex items-center justify-center shrink-0">
                  {{ initials(selectedMessage.full_name) }}
                </div>
                <div class="min-w-0">
                  <h2 class="font-semibold text-gray-800 truncate">{{ selectedMessage.full_name }}</h2>
                  <a
                      :href="`mailto:${selectedMessage.email}`"
                      class="text-sm text-[#1B55E2] hover:underline break-all"
                  >
                    {{ selectedMessage.email }}
                  </a>
                </div>
              </div>
              <button
                  @click="closeModal"
                  class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 max-h-[60vh] overflow-y-auto">
              <p class="text-xs text-gray-400 mb-3">{{ formatDate(selectedMessage.created_at) }}</p>
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {{ selectedMessage.message }}
              </p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-3 p-5 border-t border-gray-100 bg-gray-50/60">
              <button
                  @click="handleDelete(selectedMessage)"
                  class="px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                Delete
              </button>
              <div class="flex items-center gap-2">
                <a
                    :href="`mailto:${selectedMessage.email}`"
                    class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#1B55E2] hover:bg-[#1546B8] transition-colors"
                >
                  Reply by Email
                </a>
                <button
                    @click="closeModal"
                    class="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AdminSidebar from '../components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import { useEmployeeCareer } from '../composables/Admin/useEmployeeCareer.js'

const {
  messages, loading, error, searchQuery, searchInput,
  fetchMessages, deleteMessage, filtered,
  formatDate, initials,
} = useEmployeeCareer()

// --- Details modal ---
const selectedMessage = ref(null)

function openModal(msg) {
  selectedMessage.value = msg
}

function closeModal() {
  selectedMessage.value = null
}

async function handleDelete(msg) {
  if (!msg) return
  const ok = confirm(`Delete inquiry from ${msg.full_name}?`)
  if (!ok) return

  await deleteMessage(msg.id)

  if (selectedMessage.value?.id === msg.id) {
    closeModal()
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') closeModal()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>