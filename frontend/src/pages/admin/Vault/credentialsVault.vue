<template>
  <div class="flex h-screen bg-gray-50">
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

    <!-- Mobile Sidebar Drawer (overlay, does not push page content) -->
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
    <div class="flex-1 overflow-y-auto w-full">
      <div class="p-4 sm:p-6">
        <DashboardHeader
            class="w-full"
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Vault"
            subtitleOverride="Admin login and access keys"
        />
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
          <div class="bg-white mt-4 sm:mt-7 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <!-- Toolbar -->
            <div class="p-3 sm:p-4 border-b border-gray-200">
              <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
                <!-- Total Credentials -->
                <div class="flex items-center gap-4 bg-gradient-to-br from-[#2A5F9E] to-[#4A90E2] rounded-lg w-full sm:w-auto">
                  <div class="px-3 sm:px-4 py-2 rounded-lg border border-indigo-100 w-full sm:w-auto text-center sm:text-left">
                    <span class="text-base sm:text-lg font-bold text-buttonTextColor">Total Credentials :</span>
                    <span class="ml-2 text-base sm:text-lg font-bold text-buttonTextColor">{{ totalCount || 0 }}</span>
                  </div>
                </div>

                <!-- Right Toolbar -->
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div class="relative flex-1 sm:flex-none min-w-0">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="search"
                        v-model="searchQuery"
                        placeholder="Search..."
                        class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-48 md:w-60"
                    />
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="text-sm text-gray-600 hidden sm:inline">Show</span>
                    <select
                        v-model="pageSize"
                        class="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <span class="text-sm text-gray-600 hidden sm:inline">per page</span>
                  </div>

                  <button
                      @click="openAddModal"
                      class="px-3 sm:px-4 py-2 btn-primary-gradient cursor-pointer text-buttonTextColor rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm sm:text-base flex-shrink-0"
                  >
                    <i class="fas fa-plus"></i>
                    <span class="hidden sm:inline">Add credential</span>
                    <span class="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Table - Desktop View -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full min-w-[700px] lg:min-w-[800px]">
                <thead class="bg-gray-50 border-b border-gray-200">
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
                      <h4 class="text-lg font-medium text-gray-700">No credentials found</h4>
                      <p class="text-sm text-gray-500">Try a different search, or add a new credential for this project.</p>
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
                      <span class="text-xs sm:text-sm font-mono inline-block min-w-[85px] sm:min-w-[95px]">{{ cred.showPassword ? cred.password_display : '••••••••' }}</span>
                      <button @click="togglePassword(cred.id)" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                        <i :class="cred.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="md:hidden space-y-3 p-3">
              <div v-if="paginatedCredentials && paginatedCredentials.length === 0" class="text-center py-12">
                <i class="fas fa-lock text-4xl text-gray-300 mb-3"></i>
                <h4 class="text-lg font-medium text-gray-700">No credentials found</h4>
                <p class="text-sm text-gray-500">Try a different search, or add a new credential.</p>
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
                      <span class="font-mono text-sm inline-block min-w-[85px]">{{ cred.showPassword ? cred.password_display : '••••••••' }}</span>
                      <button @click="togglePassword(cred.id)" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                        <i :class="cred.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="px-3 sm:px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-center sm:justify-between gap-3">
              <div class="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left order-2 sm:order-1">
                Showing {{ startIndex + 1 }}–{{ Math.min(endIndex, filteredCredentials?.length || 0) }} of {{ filteredCredentials?.length || 0 }}
              </div>
              <div class="flex items-center gap-2 order-1 sm:order-2 flex-wrap justify-center">
                <button
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <div class="flex gap-1 flex-wrap justify-center">
                  <button
                      v-for="page in totalPages"
                      :key="page"
                      @click="goToPage(page)"
                      class="px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm"
                      :class="currentPage === page
                      ? 'dash-topbar-profile text-buttonTextColor'
                      : 'hover:bg-gray-100 text-gray-700'"
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

    <!-- Add Modal using BaseModal -->
    <BaseModal
        :isOpen="showModal"
        mode="form"
        size="md"
        title="Add Credential"
        subtitle="Store login details for a project or admin panel."
        :submitText="'Save credential'"
        :cancelText="'Cancel'"
        :loading="loading"
        formId="credential-form"
        @close="closeModal"
        @cancel="closeModal"
        @save="saveCredential"
    >
      <form id="credential-form" @submit.prevent="saveCredential">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Credential label</label>
            <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Sentra AI — Admin Panel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
            />
            <p v-if="fieldErrors.name" class="text-xs mt-1 text-red-500">{{ fieldErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Login link (URL)</label>
            <input
                v-model="form.link"
                type="url"
                placeholder="https://admin.example.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
            />
            <p v-if="fieldErrors.link" class="text-xs mt-1 text-red-500">{{ fieldErrors.link }}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                  v-model="form.username"
                  type="text"
                  placeholder="e.g. admin"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
              />
              <p v-if="fieldErrors.username" class="text-xs mt-1 text-red-500">{{ fieldErrors.username }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                  v-model="form.email"
                  type="email"
                  placeholder="e.g. admin@example.com"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
              />
              <p v-if="fieldErrors.email" class="text-xs mt-1 text-red-500">{{ fieldErrors.email }}</p>
            </div>
          </div>

          <!-- Password + Confirm Password in one row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                  v-model="form.password"
                  type="text"
                  placeholder="Enter password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
              />
              <!-- Missing-field error takes priority over the strength hint -->
              <p v-if="fieldErrors.password" class="text-xs mt-1 text-red-500">{{ fieldErrors.password }}</p>
              <p
                  v-else-if="passwordStrength && passwordStrength !== 'strong'"
                  class="text-xs mt-1"
                  :class="passwordStrength === 'weak' ? 'text-red-500' : 'text-yellow-500'"
              >
                {{ passwordStrength === 'weak' ? 'Weak password. Use uppercase, lowercase, a number and a special character.' : 'Medium strength. Add a special character or make it longer for a strong password.' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                  v-model="form.confirmPassword"
                  type="text"
                  placeholder="Re-enter password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
              />
              <p v-if="fieldErrors.confirmPassword" class="text-xs mt-1 text-red-500">{{ fieldErrors.confirmPassword }}</p>
              <p v-else-if="passwordMismatch" class="text-xs mt-1 text-red-500">
                Password do not match
              </p>
            </div>
          </div>

        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script>
import { ref } from "vue";
import AdminSidebar from "@/components/adminSidebar.vue";
import DashboardHeader from "@/components/header.vue";
import BaseModal from "@/components/baseModal.vue";
import useCredentialsVault from "@/composables/useCredentialsVault.js";
import ToastContainer from "@/components/ToastContainer.vue";

export default {
  name: 'CredentialVault',
  components: {
    AdminSidebar,
    DashboardHeader,
    BaseModal,
    ToastContainer
  },
  setup() {
    const isSidebarOpen = ref(false)
    return {
      ...useCredentialsVault(),
      isSidebarOpen
    }
  }
}
</script>

<style scoped>
/* Add custom styles if needed */
</style>