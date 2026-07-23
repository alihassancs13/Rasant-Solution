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
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Vault"
            subtitleOverride="Admin login and access keys"
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
              <!-- Toolbar -->
              <div class="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200">
                <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <!-- Left Side - Search -->
                  <div class="relative flex-1 sm:flex-none min-w-0 w-full sm:w-48 md:w-60">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="search"
                        v-model="searchQuery"
                        placeholder="Search by name ... "
                        class="pl-10 pr-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full"
                    />
                  </div>

                  <!-- Right Side - Page Size + Add Button -->
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

              <!-- Card Grid View -->
              <div class="overflow-y-auto flex-1 p-4">
                <!-- No Data -->
                <div v-if="paginatedCredentials && paginatedCredentials.length === 0" class="text-center py-12">
                  <i class="fas fa-lock text-4xl text-gray-300 mb-3"></i>
                  <h4 class="text-lg font-medium text-gray-700">No credentials found</h4>
                  <p class="text-sm text-gray-500">Try a different search, or add a new credential for this project.</p>
                </div>

                <!-- Card Grid - Responsive -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                      v-for="cred in paginatedCredentials"
                      :key="cred.id"
                      class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
                  >
                    <!-- Card Header -->
                    <div class="p-4 border-b border-gray-100">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                          <div class="w-10 h-10 rounded-lg flex items-center justify-center dash-topbar-profile font-bold text-sm flex-shrink-0"
                               :style="{ backgroundColor: '#3B82F6' }">
                            {{ getInitials(cred.name) }}
                          </div>
                          <div class="min-w-0">
                            <h4 class="text-sm font-semibold text-gray-800 truncate">{{ cred.name }}</h4>
                            <a :href="cred.link" target="_blank" rel="noopener" class="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate">
                              {{ cred.link }}
                              <i class="fas fa-arrow-up-right-from-square text-[10px] flex-shrink-0"></i>
                            </a>
                          </div>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <button
                              type="button"
                              @click="openEditModal(cred)"
                              class="text-slate-500 hover:text-indigo-700 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                              title="Edit credential"
                          >
                            <i class="fas fa-pen text-sm"></i>
                          </button>
                          <button
                              type="button"
                              @click="openDeleteModal(cred)"
                              class="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                              title="Delete credential"
                          >
                            <i class="fas fa-trash text-sm"></i>
                          </button>
                          <button
                              type="button"
                              @click="openShareModal(cred)"
                              class="text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                              title="Share credential"
                          >
                            <i class="fas fa-share-alt text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Card Body -->
                    <div class="p-4 flex-1">
                      <div class="space-y-2">
                        <div>
                          <p class="text-xs text-gray-500 font-medium">Username</p>
                          <p class="text-sm text-gray-800 truncate">{{ cred.username || 'N/A' }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 font-medium">Email</p>
                          <p class="text-sm text-gray-800 truncate">{{ cred.email || 'N/A' }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 font-medium">Password</p>
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-mono inline-block min-w-[80px]">{{ cred.showPassword ? cred.password_display : '••••••••' }}</span>
                            <button @click="togglePassword(cred.id)" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                              <i :class="cred.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                          </div>
                        </div>
                        <!-- Description (optional) -->
                        <div v-if="cred.description" class="pt-1">
                          <p class="text-xs text-gray-500 font-medium">Description</p>
                          <p class="text-xs text-gray-600 truncate">{{ cred.description }}</p>
                        </div>
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

    <!-- Add / Edit Modal using BaseModal -->
    <BaseModal
        :isOpen="showModal"
        mode="form"
        size="md"
        :title="isEditing ? 'Edit Credential' : 'Add Credential'"
        :subtitle="isEditing ? 'Update login details for this credential.' : 'Store login details for a project or admin panel.'"
        :submitText="isEditing ? 'Save changes' : 'Save credential'"
        :cancelText="'Cancel'"
        :loading="isSaving || loading"
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
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password
                <span v-if="isEditing" class="text-gray-400 text-xs font-normal">(leave blank to keep current)</span>
              </label>
              <input
                  v-model="form.password"
                  type="text"
                  :placeholder="isEditing ? 'Leave blank to keep current' : 'Enter password'"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :required="!isEditing"
              />
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
                  :placeholder="isEditing ? 'Confirm new password' : 'Re-enter password'"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :required="!isEditing || !!form.password"
              />
              <p v-if="fieldErrors.confirmPassword" class="text-xs mt-1 text-red-500">{{ fieldErrors.confirmPassword }}</p>
              <p v-else-if="passwordMismatch" class="text-xs mt-1 text-red-500">
                Passwords do not match
              </p>
            </div>
          </div>

          <!-- Description field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-gray-400 text-xs font-normal">(optional)</span></label>
            <textarea
                v-model="form.description"
                rows="3"
                placeholder="Add any additional notes, purpose, or details about this credential..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
            ></textarea>
            <p v-if="fieldErrors.description" class="text-xs mt-1 text-red-500">{{ fieldErrors.description }}</p>
          </div>
        </div>
      </form>
    </BaseModal>

    <!-- Delete confirmation -->
    <BaseModal
        :is-open="showDeleteModal"
        mode="delete"
        title="Delete credential"
        :subtitle="deleteSubtitle"
        submit-text="Delete"
        cancel-text="Cancel"
        :loading="isDeleting"
        @close="closeDeleteModal"
        @save="submitDelete"
    />

    <!-- Share Modal using BaseModal -->
    <BaseModal
        :isOpen="showShareModal"
        mode="form"
        title="Share Credential"
        :subtitle="`Share credential with employees`"
        :submitText="isSharing ? 'Sharing...' : 'Share'"
        :cancelText="'Cancel'"
        :loading="isSharing"
        class="max-w-5xl"
        @close="closeShareModal"
        @save="confirmShare"
    >
      <div class="space-y-5">
        <!-- Search Bar -->
        <div class="relative">
          <input
              type="search"
              v-model="shareSearchQuery"
              placeholder="Search employees by name or email..."
              class="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <!-- Credential Details Section -->
        <div v-if="selectedCredential" class="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-indigo-700 mb-3">Credential Details</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Row 1: Title, Username, Link -->
            <div>
              <p class="text-xs text-gray-500">Title</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedCredential.name || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Username</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedCredential.username || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Link</p>
              <p class="text-sm font-medium text-gray-800 truncate" :title="selectedCredential.link">
                {{ selectedCredential.link || 'N/A' }}
              </p>
            </div>

            <!-- Row 2: Email, Password, (empty) -->
            <div>
              <p class="text-xs text-gray-500">Email</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedCredential.email || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Password</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedCredential.password_display || 'N/A' }}</p>
            </div>
            <div></div>

            <!-- Row 3: Description - full width -->
            <div class="col-span-1 md:col-span-3">
              <p class="text-xs text-gray-500">Description</p>
              <p class="text-sm text-gray-700 break-words whitespace-pre-wrap">{{ selectedCredential.description || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Selected Count -->
        <div v-if="selectedEmployees.length > 0" class="text-sm text-indigo-600 font-medium">
          {{ selectedEmployees.length }} employee(s) selected
        </div>

        <!-- Employee List -->
        <!-- Employee List -->
        <div class="border border-gray-200 rounded-lg max-h-[280px] overflow-y-auto">
          <div v-if="employeeStore.isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="shareFilteredEmployees.length === 0" class="text-center py-12">
            <h4 class="text-lg font-medium text-gray-700">No employees found</h4>
            <p class="text-sm text-gray-500">Try adjusting your search</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-2 p-3">
            <div
                v-for="emp in shareFilteredEmployees"
                :key="emp.id"
                class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border"
                :class="[
          isAlreadyShared(emp.id)
            ? 'bg-green-50 border-green-200 hover:bg-green-100'
            : 'hover:bg-gray-50 border-gray-100 cursor-pointer',
          isEmployeeSelected(emp.id) ? 'bg-indigo-50 border-indigo-200' : ''
        ]"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                {{ getInitials(emp.full_name || emp.email || 'U') }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-800 truncate">
                  {{ emp.full_name || emp.email || 'No name' }}
                </p>
                <p class="text-[10px] text-gray-500 truncate">{{ emp.email }}</p>
                <p v-if="isAlreadyShared(emp.id)" class="text-[10px] text-green-600 font-medium mt-0.5">
                  ✓ Already shared
                </p>
              </div>
              <div class="flex-shrink-0">
                <!-- For already shared - show remove button -->
                <button
                    v-if="isAlreadyShared(emp.id)"
                    @click.stop="confirmRemoveShare(emp.id)"
                    class="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                    title="Remove access"
                    type="button"
                >
                  <i class="fas fa-times text-red-600 text-[10px]"></i>
                </button>
                <!-- For not shared - show selection checkbox -->
                <div
                    v-else
                    class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                    :class="isEmployeeSelected(emp.id) ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'"
                    @click="toggleEmployee(emp)"
                >
                  <span v-if="isEmployeeSelected(emp.id)" class="text-white text-[8px]">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Employees List -->
        <div v-if="selectedEmployees.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-3 max-h-[80px] overflow-y-auto">
          <p class="text-xs text-green-800 font-medium mb-1">Selected employees:</p>
          <div class="flex flex-wrap gap-1">
            <span
                v-for="emp in selectedEmployees"
                :key="emp.id"
                class="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
            >
              {{ emp.full_name || emp.email }}
              <button @click="toggleEmployee(emp)" class="hover:text-red-600" type="button">
                ✕
              </button>
            </span>
          </div>
        </div>

        <!-- Share button disabled state info -->
        <div v-if="selectedEmployees.length === 0" class="text-sm text-gray-500 text-center py-1">
          Please select at least one employee to share
        </div>
      </div>
    </BaseModal>

    <!-- Unshare confirmation -->
    <BaseModal
        :is-open="showUnshareModal"
        mode="delete"
        title="Remove access"
        :subtitle="unshareSubtitle"
        submit-text="Remove access"
        cancel-text="Cancel"
        :loading="isUnsharing"
        @close="closeUnshareModal"
        @save="submitUnshare"
    />
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