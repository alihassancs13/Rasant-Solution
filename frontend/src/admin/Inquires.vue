<template>
  <div class="flex h-screen bg-surface">
    <!-- Sidebar -->
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Top Header -->
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main ref="mainScroll" class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <div class="max-w-6xl mx-auto">

          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center gap-2 min-w-0">
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-text-secondary text-lg" />
              <h1 class="font-semibold text-text-primary text-2xl font-bold truncate">Inquiries</h1>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            <p class="text-sm text-text-muted mt-3">Loading inquiries...</p>
          </div>

          <!-- Error State -->
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

          <!-- Empty State -->
          <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-14 h-14 rounded-full bg-primary-subtle flex items-center justify-center mb-3">
              <font-awesome-icon icon="fa-solid fa-inbox" class="text-primary text-xl" />
            </div>
            <p class="text-text-primary font-medium">
              {{ searchQuery ? 'No matching inquiries' : 'No inquiries yet' }}
            </p>
            <p class="text-sm text-text-muted mt-1">
              {{ searchQuery ? 'Try a different search term.' : 'New contact form messages will show up here.' }}
            </p>
          </div>

          <!-- Table / List -->
          <div v-else>
            <!-- Desktop Table (md and up) -->
            <div class="hidden md:block bg-white border border-border rounded-xl py-3 px-2 shadow-sm overflow-hidden">

              <!-- Search + Rows-per-page row -->
              <div class="pb-3 px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <!-- Search Filter -->
                <div class="relative w-full sm:w-72">
                  <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                  <input
                      ref="searchInput"
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by name, email, message..."
                      class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <!-- Rows per page -->
                <div class="flex items-center gap-2 text-sm text-text-muted shrink-0">
                  <span class="hidden sm:inline">Show</span>
                  <select
                      v-model.number="pageSize"
                      class="border border-border rounded-lg px-2.5 py-1.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                  <span v-if="!loading && !error" class="text-sm text-text-secondary font-normal ml-1">
                {{ filtered.length }} total
              </span>
                </div>
              </div>

              <!-- Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                  <tr class="bg-surface-alt/80 border-b border-border text-left text-xs text-text-muted uppercase tracking-wide">
                    <th class="px-5 py-3 font-medium">Name</th>
                    <th class="px-5 py-3 font-medium">Email</th>
                    <th class="px-5 py-3 font-medium">Message</th>
                    <th class="px-5 py-3 font-medium whitespace-nowrap">Date</th>
                    <th class="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                  <tr
                      v-for="msg in paginatedItems"
                      :key="msg.id"
                      @click="openModal(msg)"
                      class="hover:bg-surface-alt cursor-pointer transition-colors"
                  >
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-full bg-primary-subtle text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                          {{ initials(msg.full_name) }}
                        </div>
                        <span class="font-medium text-text-primary truncate">{{ msg.full_name }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <a
                          :href="`mailto:${msg.email}`"
                          @click.stop
                          class="text-primary hover:underline break-all"
                      >
                        {{ msg.email }}
                      </a>
                    </td>
                    <td class="px-5 py-4 text-text-muted max-w-xs">
                      <p class="truncate">{{ msg.message }}</p>
                    </td>
                    <td class="px-5 py-4 text-text-muted whitespace-nowrap">{{ formatDate(msg.created_at) }}</td>
                    <td class="px-5 py-4">
                      <div class="flex items-center justify-end gap-2" @click.stop>
                        <button
                            @click="openModal(msg)"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary-subtle hover:bg-primary-subtle-border transition-colors cursor-pointer"
                        >
                          <font-awesome-icon :icon="['fas', 'eye']" />
                        </button>
                        <button
                            @click="handleDelete(msg)"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium text-danger bg-danger-subtle hover:bg-danger-border transition-colors cursor-pointer"
                        >
                          <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>

              </div>

              <!-- Pagination Footer (inside card, below table) -->
              <div ref="paginationRef" class="flex items-center justify-between gap-3 px-3 pt-4">
                <p class="text-sm text-text-muted">
                  Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filtered.length }}
                </p>

                <div class="flex items-center gap-1">
                  <button
                      @click="prevPage"
                      :disabled="currentPage === 1"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs" />
                  </button>

                  <template v-for="(page, idx) in pageNumbers" :key="idx">
                    <span
                        v-if="page === '...'"
                        class="w-8 h-8 flex items-center justify-center text-text-muted text-sm"
                    >
                      ...
                    </span>
                    <button
                        v-else
                        @click="goToPage(page)"
                        class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-pointer"
                        :class="page === currentPage
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:bg-surface-alt'"
                    >
                      {{ page }}
                    </button>
                  </template>

                  <button
                      @click="nextPage"
                      :disabled="currentPage === totalPages"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile List (below md) -->
            <div class="md:hidden bg-white border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
              <div
                  v-for="msg in paginatedItems"
                  :key="msg.id"
                  @click="openModal(msg)"
                  class="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer active:bg-surface-alt transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-full bg-primary-subtle text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                    {{ initials(msg.full_name) }}
                  </div>
                  <span class="font-medium text-text-primary truncate text-sm">{{ msg.full_name }}</span>
                </div>

                <button
                    @click.stop="openModal(msg)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-primary bg-primary-subtle hover:bg-primary-subtle-border transition-colors cursor-pointer shrink-0"
                >
                  <font-awesome-icon :icon="['fas', 'eye']" />
                </button>
              </div>

              <!-- Mobile pagination -->
              <div ref="mobilePaginationRef" class="flex items-center justify-end gap-3 px-4 py-3">
                <div class="flex items-center gap-1">
                  <button
                      @click="prevPage"
                      :disabled="currentPage === 1"
                      class="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs" />
                  </button>
                  <span class="text-xs font-medium text-text-secondary px-1">{{ currentPage }} / {{ totalPages }}</span>
                  <button
                      @click="nextPage"
                      :disabled="currentPage === totalPages"
                      class="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs" />
                  </button>
                </div>
              </div>
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
          <div class="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between gap-4 p-5 border-b border-border">
              <div class="flex items-center gap-2 min-w-0">
                <font-awesome-icon icon="fa-solid fa-eye" class="text-text-secondary text-lg" />
                <h1 class="font-semibold text-text-primary truncate">Inquiries</h1>
              </div>

              <button
                  @click="closeModal"
                  class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors cursor-pointer"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" class="text-lg" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <!-- Name and Email row - side by side -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="rounded-lg p-3">
                  <span class="text-[10px] font-medium text-text-muted">NAME</span>
                  <p class="text-xs font-semibold text-text-primary mt-0.5">{{ selectedMessage.full_name }}</p>
                </div>
                <div class="rounded-lg p-3">
                  <span class="text-[10px] font-medium text-text-muted">EMAIL</span>
                  <a :href="`mailto:${selectedMessage.email}`" class="text-xs text-primary hover:underline break-all mt-0.5 block">
                    {{ selectedMessage.email }}
                  </a>
                </div>
              </div>

              <!-- Message - full width -->
              <span class="text-[10px] font-medium text-text-muted block ml-3">MESSAGE</span>
              <div class="bg-surface-alt/60 rounded-lg p-3">
                <p class="text-sm text-text-secondary leading-relaxed whitespace-pre-line mt-0.5">
                  {{ selectedMessage.message }}
                </p>
              </div>

              <!-- Phone and Date row - side by side -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="rounded-lg p-3">
                  <span class="text-[10px] font-medium text-text-muted">PHONE</span>
                  <p class="text-xs font-semibold text-text-primary mt-0.5">{{ selectedMessage.phone || 'N/A' }}</p>
                </div>
                <div class="rounded-lg p-3">
                  <span class="text-[10px] font-medium text-text-muted">DATE & TIME</span>
                  <p class="text-xs font-semibold text-text-primary mt-0.5">{{ formatDate(selectedMessage.created_at) }}</p>
                </div>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-between gap-3 p-5 border-t border-border bg-surface-alt/60">
              <button
                  @click="handleDelete(selectedMessage)"
                  class="px-4 py-2 rounded-xl text-sm font-medium text-danger bg-danger-subtle hover:bg-danger-border transition-colors cursor-pointer"
              >
                Delete
              </button>
              <div class="flex items-center gap-2">
                <a
                    :href="`mailto:${selectedMessage.email}`"
                    class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
                >
                  Reply by Email
                </a>
                <button
                    @click="closeModal"
                    class="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary bg-white border border-border hover:bg-surface-alt transition-colors cursor-pointer"
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import AdminSidebar from '../components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import { useEmployeeCareer } from '../composables/Admin/useEmployeeCareer.js'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const {
  messages, loading, error, searchQuery, searchInput,
  fetchMessages, deleteMessage, filtered,
  currentPage, totalPages, startIndex, endIndex, pageSize, pageSizeOptions,
  paginatedItems, pageNumbers, nextPage, prevPage, goToPage,
  formatDate, initials,
} = useEmployeeCareer()

// Keep view anchored on the pagination controls when page changes,
// instead of jumping to the top of the page.
const mainScroll = ref(null)
const paginationRef = ref(null)
const mobilePaginationRef = ref(null)

watch(currentPage, async () => {
  await nextTick()
  const target = paginationRef.value?.offsetParent
      ? paginationRef.value
      : mobilePaginationRef.value

  target?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
})

// When rows-per-page changes, reset to page 1; still keep view near pagination
watch(pageSize, async () => {
  await nextTick()
  const target = paginationRef.value?.offsetParent
      ? paginationRef.value
      : mobilePaginationRef.value

  target?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
})

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