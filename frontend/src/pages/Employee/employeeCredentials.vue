<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <ToastContainer />
    <!-- Sidebar (Desktop) -->
    <div class="flex-shrink-0 hidden md:block">
      <AdminSidebar />
    </div>

    <!-- Mobile Sidebar Toggle -->
    <div class="md:hidden fixed top-4 left-4 z-50">
      <button @click="isSidebarOpen = true" class="p-2 bg-white rounded-lg shadow-lg">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <!-- Mobile Sidebar Drawer -->
    <div v-if="isSidebarOpen" class="md:hidden fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/50" @click="isSidebarOpen = false"></div>
      <div class="fixed top-0 left-0 h-full w-64 bg-white shadow-xl overflow-y-auto">
        <button
            @click="isSidebarOpen = false"
            class="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <i class="fas fa-times"></i>
        </button>
        <AdminSidebar />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <!-- Header with proper spacing -->
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
            class="w-full"
            userName="Employee"
            role="employee"
            :notificationCount="0"
            titleOverride="My Credentials"
            subtitleOverride="View credentials shared with you"
            :iconOverride="['fas', 'shield-alt']"
        />
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 pt-1 px-4 pb-4 sm:px-6 lg:px-8 overflow-hidden">
        <div class="w-full h-full">
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="text-center">
              <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
              <p class="text-gray-600">Loading credentials...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-3">
              <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
              <div>
                <h4 class="text-red-800 font-medium">Error loading credentials</h4>
                <p class="text-red-600 text-sm">{{ error }}</p>
                <button
                    @click="fetchCredentials"
                    class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Main Panel -->
            <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
              <!-- Toolbar - No Add Button for Employee -->
              <div class="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200">
                <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <!-- Left Side - Search -->
                  <div class="relative flex-1 sm:flex-none min-w-0 w-full sm:w-48 md:w-60">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="search"
                        v-model="searchQuery"
                        placeholder="Search credentials..."
                        class="pl-10 pr-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full"
                    />
                  </div>

                  <!-- Right Side - Page Size Only -->
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-sm text-gray-600 hidden sm:inline">Show</span>
                      <select
                          v-model="pageSize"
                          class="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                      <span class="text-sm text-gray-600 hidden sm:inline">per page</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Table - Desktop View -->
              <div class="hidden md:block overflow-y-auto flex-1">
                <table class="w-full min-w-[700px] lg:min-w-[800px]">
                  <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th class="px-4 sm:px-6 py-3 text-left font-bold text-xs text-gray-500 uppercase tracking-wider">Project name</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Password</th>
                  </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                  <!-- No Data -->
                  <tr v-if="paginatedCredentials && paginatedCredentials.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <i class="fas fa-lock text-4xl text-gray-300 mb-3"></i>
                        <h4 class="text-lg font-medium text-gray-700">No credentials shared with you</h4>
                        <p class="text-sm text-gray-500">Your admin will share credentials with you as needed.</p>
                      </div>
                    </td>
                  </tr>
                  <!-- Data Rows -->
                  <tr v-for="cred in paginatedCredentials" :key="cred.id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 sm:px-6 py-4">
                      <div class="flex items-center gap-2 sm:gap-3">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0"
                             :style="{ backgroundColor: '#3B82F6' }">
                          {{ getInitials(cred.name) }}
                        </div>
                        <div class="min-w-0">
                          <strong class="text-xs sm:text-sm block truncate max-w-[120px] sm:max-w-[200px]">{{ cred.name }}</strong>
                          <a :href="cred.link" target="_blank" rel="noopener" class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate max-w-[120px] sm:max-w-[200px]">
                            {{ cred.link }}
                            <i class="fas fa-arrow-up-right-from-square text-[10px] flex-shrink-0"></i>
                          </a>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 sm:px-6 py-4">
                      <span class="text-xs sm:text-sm truncate block max-w-[150px]">{{ cred.username }}</span>
                    </td>
                    <td class="px-4 sm:px-6 py-4">
                      <span class="text-xs sm:text-sm truncate block max-w-[120px] sm:max-w-[200px]">{{ cred.email }}</span>
                    </td>
                    <td class="px-4 sm:px-6 py-4">
                      <div class="flex items-center gap-2 whitespace-nowrap">
                        <span class="text-xs sm:text-sm font-mono inline-block min-w-[85px] sm:min-w-[95px]">{{ cred.showPassword ? cred.password : '••••••••' }}</span>
                        <button @click="togglePassword(cred.id)" class="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0">
                          <i :class="cred.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="md:hidden overflow-y-auto flex-1 space-y-3 p-3">
                <div v-if="paginatedCredentials && paginatedCredentials.length === 0" class="text-center py-12">
                  <i class="fas fa-lock text-4xl text-gray-300 mb-3"></i>
                  <h4 class="text-lg font-medium text-gray-700">No credentials shared with you</h4>
                  <p class="text-sm text-gray-500">Your admin will share credentials with you as needed.</p>
                </div>
                <div
                    v-for="cred in paginatedCredentials"
                    :key="cred.id"
                    class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                           :style="{ backgroundColor: '#3B82F6' }">
                        {{ getInitials(cred.name) }}
                      </div>
                      <div class="min-w-0">
                        <strong class="text-sm block truncate">{{ cred.name }}</strong>
                        <a :href="cred.link" target="_blank" rel="noopener" class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate">
                          {{ cred.link }}
                          <i class="fas fa-arrow-up-right-from-square text-[10px] flex-shrink-0"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3">
                    <div class="min-w-0">
                      <p class="text-xs text-gray-500 font-medium">Username</p>
                      <p class="font-medium text-gray-800 truncate">{{ cred.username }}</p>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs text-gray-500 font-medium">Email</p>
                      <p class="font-medium text-gray-800 truncate">{{ cred.email }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-xs text-gray-500 font-medium">Password</p>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-sm inline-block min-w-[85px]">{{ cred.showPassword ? cred.password : '••••••••' }}</span>
                        <button @click="togglePassword(cred.id)" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                          <i :class="cred.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="flex-shrink-0 px-3 sm:px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div class="text-xs sm:text-sm text-gray-600">
                  Showing {{ startIndex + 1 }}–{{ Math.min(endIndex, filteredCredentials?.length || 0) }} of {{ filteredCredentials?.length || 0 }}
                </div>
                <div class="flex items-center gap-2 flex-wrap justify-center">
                  <button
                      @click="prevPage"
                      :disabled="currentPage === 1"
                      class="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <div class="flex gap-1">
                    <button
                        v-for="page in displayedPages"
                        :key="page"
                        @click="typeof page === 'number' ? goToPage(page) : null"
                        class="px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm min-w-[32px]"
                        :class="page === '...' ? 'cursor-default text-gray-400' :
                                currentPage === page ? 'dash-topbar-profile text-buttonTextColor' : 'hover:bg-gray-100 text-gray-700'"
                        :disabled="page === '...'"
                    >
                      {{ page }}
                    </button>
                  </div>
                  <button
                      @click="nextPage"
                      :disabled="currentPage === totalPages"
                      class="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import AdminSidebar from "@/components/adminSidebar.vue";
import DashboardHeader from "@/components/header.vue";
import ToastContainer from "@/components/ToastContainer.vue";
import useEmployeeCredentials from "@/composables/useEmployeeCredentials.js";

export default {
  name: 'EmployeeCredentials',
  components: {
    AdminSidebar,
    DashboardHeader,
    ToastContainer
  },
  setup() {
    const isSidebarOpen = ref(false);
    return {
      ...useEmployeeCredentials(),
      isSidebarOpen
    }
  }
}
</script>
