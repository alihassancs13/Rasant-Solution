<template>
  <div class="flex h-screen bg-slate-50/50">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-4 md:p-6 pb-0">
        <DashboardHeader
            :user-name="userName"
            role="employee"
            :notification-count="5"
        />
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <!-- Top Action Buttons -->
        <div class="flex flex-wrap gap-4 mb-6">
          <button
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 bg-[#df5309] text-white font-medium rounded-xl shadow-sm hover:bg-[#c64907] transition-colors"
          >
            <span class="font-bold">$</span>
            Manage salaries
          </button>

          <button
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 bg-white text-[#111827] font-medium rounded-xl border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <i class="fas fa-users-cog text-slate-500"></i>
            Careers & hiring
          </button>
        </div>

        <!-- Metrics Stats Cards Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StateCard
              v-for="stat in stats"
              :key="stat.label"
              :label="stat.label"
              :value="stat.value"
              :subtitle="stat.subtitle"
              :icon="stat.icon"
              :color="stat.color"
              :link="stat.link"
              link-label="View more"
          />
        </div>

        <!-- Employee Sub-Navigation Tab Panel Control -->
        <div class="inline-flex p-1.5 bg-slate-100 rounded-xl mb-6 shadow-sm border border-slate-200">
          <button
              type="button"
              @click="activeTab = 'list'"
              :class="[
              'px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2',
              activeTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            <font-awesome-icon :icon="['fas', 'file-lines']" class="text-slate-400" />
            Employee list
          </button>

          <button
              type="button"
              @click="activeTab = 'add'"
              :class="[
              'px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2',
              activeTab === 'add' ? 'bg-[#3b7ddd] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
            Add new employee
          </button>
        </div>

        <!-- Add Employee UI Layout Area -->
        <div v-if="activeTab === 'add'" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-6xl">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-slate-900">Add new employee</h3>
            <p class="text-sm text-slate-500">Upload a CV or ID document to auto-fill fields, or enter details manually.</p>
          </div>

          <!-- Document Parser Drag & Drop Box Dropzone Area -->
          <div
              @dragover.prevent
              @drop.prevent="handleCvUpload"
              class="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/20 p-8 flex flex-col items-center justify-center text-center mb-8 relative group transition-colors hover:bg-blue-50/40"
          >
            <input
                type="file"
                id="cvUploader"
                accept=".pdf,.doc,.docx,image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleCvUpload"
            />

            <div v-if="isParsingCv" class="flex flex-col items-center">
              <font-awesome-icon :icon="['fas', 'spinner']" spin class="text-3xl text-blue-500 mb-3" />
              <p class="text-sm font-medium text-slate-600">Reading details & auto-filling form parameters...</p>
            </div>

            <div v-else class="flex flex-col items-center">
              <!-- Stacked Mock Document Icon Layout Graphic -->
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3 relative">
                <font-awesome-icon :icon="['fas', 'file-lines']" class="text-xl" />
                <div class="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border-2 border-white">
                  <font-awesome-icon :icon="['fas', 'plus']" class="text-[10px]" />
                </div>
              </div>
              <h4 class="text-sm font-bold text-slate-800 mb-1">Upload document for auto-fill</h4>
              <p class="text-xs text-slate-400">Drop a PDF, image, or Word file — we'll scan name, contact, and role fields.</p>
            </div>
          </div>

          <!-- Manual Fields Entry Validation Forms Grid -->
          <form @submit.prevent="handleAddEmployee" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

              <!-- Full Name Input -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                    v-model="formData.fullName"
                    type="text"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. John Doe"
                />
                <span v-if="errors.fullName" class="text-xs text-red-500 mt-1 block">{{ errors.fullName }}</span>
              </div>

              <!-- Email Input -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                <input
                    v-model="formData.email"
                    type="email"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="name@company.com"
                />
                <span v-if="errors.email" class="text-xs text-red-500 mt-1 block">{{ errors.email }}</span>
              </div>

              <!-- Phone Input -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                <input
                    v-model="formData.phone"
                    type="text"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="+92 300 1234567"
                />
                <span v-if="errors.phone" class="text-xs text-red-500 mt-1 block">{{ errors.phone }}</span>
              </div>

              <!-- Department Input -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                <input
                    v-model="formData.department"
                    type="text"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. Engineering"
                />
                <span v-if="errors.department" class="text-xs text-red-500 mt-1 block">{{ errors.department }}</span>
              </div>

              <!-- Designation Input -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                <input
                    v-model="formData.designation"
                    type="text"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. Flutter Developer"
                />
                <span v-if="errors.designation" class="text-xs text-red-500 mt-1 block">{{ errors.designation }}</span>
              </div>

              <!-- Restricted Employment Status Select Options Dropdown -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employment Status</label>
                <div class="relative">
                  <select
                      v-model="formData.employmentStatus"
                      class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    <option v-for="status in statusOptions" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs" />
                  </div>
                </div>
                <span v-if="errors.employmentStatus" class="text-xs text-red-500 mt-1 block">{{ errors.employmentStatus }}</span>
              </div>

              <!-- Monthly Salary Input -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Salary (PKR)</label>
                <input
                    v-model="formData.monthlySalary"
                    type="number"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. 75000"
                />
                <span v-if="errors.monthlySalary" class="text-xs text-red-500 mt-1 block">{{ errors.monthlySalary }}</span>
              </div>

              <!-- Join Date Picker Input Box -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Join Date</label>
                <input
                    v-model="formData.joinDate"
                    type="date"
                    class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <span v-if="errors.joinDate" class="text-xs text-red-500 mt-1 block">{{ errors.joinDate }}</span>
              </div>

            </div>

            <!-- Operational Form Control Action Buttons Footer Base Line -->
            <div class="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button
                  type="submit"
                  class="flex items-center gap-2 px-5 py-3 bg-[#df5309] text-white font-medium rounded-xl shadow-sm hover:bg-[#c64907] transition-colors text-sm"
              >
                <font-awesome-icon :icon="['fas', 'plus']" />
                Add employee
              </button>

              <button
                  type="button"
                  @click="clearForm"
                  class="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors text-sm"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="text-slate-400" />
                Clear form
              </button>
            </div>
          </form>
        </div>

        <!-- Optional Dashboard List View State Handler Empty Area placeholder -->
        <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
          <font-awesome-icon :icon="['fas', 'file-lines']" class="text-4xl mb-2 text-slate-300" />
          <p class="text-sm font-medium">Employee Records View Table Panel.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DashboardHeader from '../components/header.vue';
import StateCard from '../components/StatCard.vue';
import AdminSidebar from '../components/adminSidebar.vue';
import { useEmployeeDashboard } from '../composables/Admin/useEmployeeDashboard.js'; // Adjust paths as required

const userName = ref('John Doe');

// Destructure reactive states and validation events from separated composable core
const {
  activeTab,
  formData,
  errors,
  isParsingCv,
  statusOptions,
  clearForm,
  handleAddEmployee,
  handleCvUpload
} = useEmployeeDashboard();

const stats = ref([
  {
    label: 'Total Tasks',
    value: 12,
    subtitle: 'Active tasks this week',
    icon: ['fas', 'clipboard-list'],
    color: 'blue',
    link: '/admin/employees/tasks'
  },
  {
    label: 'Attendance',
    value: '94%',
    subtitle: "This month's attendance rate",
    icon: ['fas', 'calendar-check'],
    color: 'teal',
    link: '/admin/employees/attendance'
  },
  {
    label: 'Messages',
    value: 8,
    subtitle: 'Unread messages',
    icon: ['fas', 'envelope'],
    color: 'purple',
    link: '/admin/inbox'
  },
  {
    label: 'Projects',
    value: 3,
    subtitle: 'Active projects',
    icon: ['fas', 'project-diagram'],
    color: 'orange',
    link: '/admin/projects'
  }
]);
</script>