<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-4 md:p-6 pb-0">
        <DashboardHeader
            :user-name="userName"
            role="employee"
            :notification-count="5"
        />
      </div>

      <div id="dashboardScrollContainer" class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StateCard
              label="TOTAL EMPLOYEES"
              :value="statsSummary.total || 0"
              subtitle="Active roster"
              :icon="['fas', 'users']"
              color="blue"
          />
          <StateCard
              label="IN OFFICE TODAY"
              :value="statsSummary.inOffice || 0"
              subtitle="Checked in via attendance"
              :icon="['fas', 'circle-check']"
              color="teal"
          />
          <StateCard
              label="INTERN / PROBATION"
              :value="statsSummary.internProbation || 0"
              subtitle="Onboarding pipeline"
              :icon="['fas', 'clipboard-list']"
              color="purple"
          />
          <StateCard
              label="AWAY TODAY"
              :value="statsSummary.awayToday || 0"
              subtitle="Not in office"
              :icon="['fas', 'umbrella-beach']"
              color="orange"
          />
        </div>

        <div class="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">

          <div class="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-border gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <div class="w-full sm:w-64">
                <div class="relative w-full">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                  </span>
                  <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search employee by name"
                      class="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-sm text-text-muted whitespace-nowrap">Show</span>
                <select
                    v-model="pageSize"
                    class="px-3 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span class="text-sm text-text-muted whitespace-nowrap">per page</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button
                  type="button"
                  @click="openCreateModal"
                  class="flex items-center cursor-pointer gap-2 px-4 py-2 bg-buttonBackground text-buttonTextColor text-sm font-medium rounded-xl hover:bg-buttonHover transition-colors whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'plus']" />
                Create Employee
              </button>

              <button
                  @click="showModal = true"
                  type="button"
                  class="flex items-center cursor-pointer gap-2 px-4 py-2 border border-buttonBackground text-black text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'clipboard-list']" />
                View onboarding form
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="p-4 m-6 bg-danger-subtle text-danger rounded-xl border border-danger/20 flex items-center gap-3">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
            <span class="text-sm font-medium">{{ errorMessage }}</span>
            <button @click="loadEmployees" class="ml-auto text-xs underline font-bold cursor-pointer">Retry</button>
          </div>

          <div v-if="isLoading" class="p-20 text-center text-text-muted">
            <font-awesome-icon :icon="['fas', 'spinner']" spin class="text-4xl text-primary mb-3" />
            <p class="text-sm">Fetching employee records details...</p>
          </div>

          <div v-else-if="employees.length > 0" class="overflow-x-auto">
            <table class="w-full min-w-[1000px] text-left border-collapse">
              <thead>
              <tr class="bg-surface border-b border-border">
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Employee</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Department</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Account</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Salary</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Joined</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Contact</th>
                <th class="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">Actions</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-border text-sm text-text-primary">
              <tr v-for="emp in employees" :key="emp.id" class="hover:bg-surface/40 transition-colors">
                <td class="p-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center font-bold text-primary overflow-hidden">
                      <img v-if="emp.avatar" :src="emp.avatar" alt="Avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ emp.name ? emp.name.charAt(0) : 'E' }}</span>
                    </div>
                    <div>
                      <h4 class="font-bold text-text-primary">{{ emp.name }}</h4>
                      <p class="text-xs text-text-muted uppercase tracking-tight">{{ emp.employee_number }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4 whitespace-nowrap text-text-secondary">{{ emp.department }}</td>
                <td class="p-4 whitespace-nowrap">
                    <span :class="[
                      'px-2.5 py-1 text-xs font-semibold rounded-lg inline-block',
                      emp.status === 'Permanent' ? 'bg-emerald-50 text-emerald-700' : '',
                      emp.status === 'Contract' ? 'bg-indigo-50 text-indigo-700' : '',
                      emp.status === 'Probation' ? 'bg-amber-50 text-amber-700' : '',
                      emp.status === 'Intern' ? 'bg-purple-50 text-purple-700' : ''
                    ]">
                      {{ emp.status }}
                    </span>
                </td>
                <!-- In the <td> for "Account" -->
                <td class="p-4 whitespace-nowrap">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        :checked="emp.is_active"
                        @change="toggleActive(emp, $event)"
                        class="sr-only peer"
                    />
                    <div class="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </td>
                <td class="p-4 whitespace-nowrap font-medium text-text-secondary">
                  Rs {{ Number(emp.salary).toLocaleString() }}
                </td>
                <td class="p-4 whitespace-nowrap text-text-secondary">{{ emp.joined_date }}</td>
                <td class="p-4 whitespace-nowrap">
                  <button class="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-teal-600 transition-colors">
                    <font-awesome-icon :icon="['far', 'comment']" />
                    DM
                  </button>
                </td>
                <td class="p-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="openEditModal(emp)" class="p-1.5 hover:bg-surface cursor-pointer rounded-lg text-text-muted hover:text-text-primary transition-colors">
                      <font-awesome-icon :icon="['fas', 'pen']" class="text-sm" />
                    </button>
                    <button  @click="openViewModal(emp)"  class="p-1.5 hover:bg-surface cursor-pointer rounded-lg text-text-muted hover:text-text-primary transition-colors">
                      <font-awesome-icon :icon="['fas', 'eye']" class="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="p-16 text-center text-text-muted">
            <font-awesome-icon :icon="['fas', 'folder-open']" class="text-5xl mb-4 text-slate-300" />
            <h3 class="text-base font-semibold text-slate-700 mb-1">No matching employee data found</h3>
            <p class="text-xs text-slate-400">Try modifying your query variables parameters filters.</p>
          </div>

          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-surface border-t border-border gap-3">
            <div class="text-xs text-text-secondary font-medium text-center sm:text-left">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center justify-center gap-3">
              <button
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                  class="px-4 py-2 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 hover:bg-surface transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
                  class="px-4 py-2 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 hover:bg-surface transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        @click.self="showModal = false"
    >
      <div class="w-full max-w-3xl">
        <EmployeeRegistrationModelForm @close="showModal = false" />
      </div>
    </div>
      <!-- Create model-->
    <CreateModal
        :is-open="isCreateModalOpen"
        mode="form"
        title="Create employee"
        subtitle="Enter basic details — onboarding continues in this dashboard."
        submit-text="Create & send invitation"
        :loading="isCreating"
        :wide="false"
        @close="closeCreateModal"
        @save="handleCreateEmployee"
    >
      <form @submit.prevent="handleCreateEmployee" class="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-gray-700">
        <!-- FULL NAME -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              v-model="createFormData.name"
              placeholder="e.g. Sarah Ali"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>

        <!-- EMAIL ADDRESS -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Email Address <span class="text-red-500">*</span>
          </label>
          <input
              type="email"
              v-model="createFormData.email"
              placeholder="employee@email.com"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>

        <!-- PHONE NUMBER (replaces "With Reference Of") -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <input
              type="tel"
              v-model="createFormData.phone_number"
              placeholder="e.g. 03XX-XXXXXXX"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>

        <!-- POSITION — ADMIN ONLY -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Designation <span class="text-red-500">*</span>
            </label>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            ADMIN ONLY
          </span>
          </div>
          <input
              type="text"
              v-model="createFormData.position"
              placeholder="e.g. Software Engineer"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>

        <!-- MONTHLY SALARY (PKR) — ADMIN ONLY -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Monthly Salary (PKR) <span class="text-red-500">*</span>
            </label>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            ADMIN ONLY
          </span>
          </div>
          <input
              type="number"
              v-model="createFormData.salary"
              placeholder="e.g. 85000"
              min="0"
              step="1000"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>
      </form>
    </CreateModal>
    <!-- edit model-->
    <EditModal
        :is-open="isEditModalOpen"
        mode="form"
        title="Edit employee"
        :subtitle="selectedEmployee ? selectedEmployee.employee_number : ''"
        submit-text="Save changes"
        :loading="isUpdating"
        :wide="false"
        modalClass="max-w-md w-full"
        submitButtonClass="bg-buttonBackground hover:bg-[#1F5A9E] text-white font-semibold px-6 py-2.5 rounded-x"
        @close="closeEditModal"
        @save="handleUpdateEmployee"


    >
      <form @submit.prevent="handleUpdateEmployee" class="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-gray-700">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</label>
          <input type="text" v-model="editFormData.name" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Email</label>
          <input type="email" v-model="editFormData.email" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Phone</label>
          <input type="text" v-model="editFormData.phone_number" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Department</label>
          <input type="text" v-model="editFormData.department" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Designation</label>
          <input type="text" v-model="editFormData.designation" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Employment Status</label>
          <select v-model="editFormData.status" class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]">
            <option value="Intern">Intern</option>
            <option value="Probation">Probation</option>
            <option value="Contract">Contract</option>
            <option value="Permanent">Permanent</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Account Status</label>
          <select v-model="editFormData.is_active" class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]">
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Salary (PKR)</label>
          <input type="number" v-model="editFormData.salary" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Join Date</label>
          <input type="date" v-model="editFormData.joined_date" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]" />
        </div>
      </form>
    </EditModal>
    <!-- view model-->
    <ViewModal
        :is-open="isViewModalOpen"
        mode="view"
        title="Employee Details"
        :subtitle="viewEmployee ? `${viewEmployee.full_name || viewEmployee.name} (${viewEmployee.employee_number})` : ''"
        size="md"
        @close="closeViewModal"
    >
      <div v-if="viewEmployee" class="space-y-4 text-left overflow-hidden h-auto max-h-full">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Department</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.department }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Designation</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.designation }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Email</span>
            <span class="text-sm font-bold text-[#1e293b] truncate" :title="viewEmployee.email">{{ viewEmployee.email }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Phone</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.phone_number }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Gender</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.gender }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Monthly Salary</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">Rs {{ Number(viewEmployee.salary).toLocaleString() }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Joined</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.joined_date }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">CNIC</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.cnic }}</span>
          </div>
        </div>

        <div v-if="viewEmployee.present_address || viewEmployee.permanent_address" class="pt-3 border-t border-slate-100">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-if="viewEmployee.present_address" class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Present Address</span>
              <span class="text-sm font-bold text-[#1e293b] line-clamp-1">{{ viewEmployee.present_address }}</span>
            </div>

            <div v-if="viewEmployee.permanent_address" class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Permanent Address</span>
              <span class="text-sm font-bold text-[#1e293b] line-clamp-1">{{ viewEmployee.permanent_address }}</span>
            </div>
          </div>
        </div>

      </div>
    </ViewModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import DashboardHeader from '../../../components/header.vue';
import StateCard from '../../../components/StatCard.vue';
import AdminSidebar from '../../../components/adminSidebar.vue';
import EditModal from '../../../components/baseModal.vue';
import CreateModal from '../../../components/baseModal.vue';
import ViewModal from '../../../components/baseDetailModal.vue';
import { useToast } from '@/composables/useToast.js';
import EmployeeRegistrationModelForm from '@/pages/admin/Employee/employeeRegistrationModel.vue';
import { useEmployeeDashboard } from '@/composables/useEmployeeDashboard.js';
const {  showToast } = useToast();
const isViewModalOpen = ref(false);
const viewEmployee = ref(null);
import { watch } from 'vue';
const openViewModal = (employee) => {
  viewEmployee.value = employee;
  isViewModalOpen.value = true;
};
const closeViewModal = () => {
  isViewModalOpen.value = false;
  viewEmployee.value = null;
};
const {
  employees,
  isLoading,
  errorMessage,
  searchQuery,
  currentPage,
  totalPages,
  statsSummary,
  pageSize,
  loadEmployees,
  updateEmployee
} = useEmployeeDashboard();
const userName = ref('System Administrator');
const showModal = ref(false);
watch(showModal, (isOpen) => {
  const container = document.getElementById('dashboardScrollContainer');

  if (isOpen) {
    document.body.classList.add('overflow-hidden');
    if (container) container.classList.add('!overflow-y-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
    if (container) container.classList.remove('!overflow-y-hidden');
  }
});
const copied = ref(false);
const isEditModalOpen = ref(false);
const isUpdating = ref(false);
const selectedEmployee = ref(null);
const isCreateModalOpen = ref(false);
const isCreating = ref(false);
const createFormData = reactive({
  name: '',
  email: '',
  phone_number: '',
  position: '',
  salary: '',
});
const openCreateModal = () => {
  createFormData.name = '';
  createFormData.email = '';
  createFormData.phone_number = '';
  createFormData.position = '';
  createFormData.salary = '';
  isCreateModalOpen.value = true;
};
const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const handleCreateEmployee = async () => {
  // Basic client-side validation
  if (!createFormData.name.trim() || !createFormData.email.trim()) {
    // You can add a toast/notification here
    console.warn('Name and Email are required.');
    return;
  }
  isCreating.value = true;
  try {
    // 🔁 Replace with your actual API call
    const payload = {
      name: createFormData.name.trim(),
      email: createFormData.email.trim(),
      phone_number: createFormData.phone_number.trim(),
      position: createFormData.position.trim(),
      salary: createFormData.salary ? parseFloat(createFormData.salary) : null,
    };

    console.log('➡️ Creating employee:', payload);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // On success — close modal
    closeCreateModal();

    // Optionally refresh employee list or show success toast
    // await fetchEmployees();

  } catch (error) {
    console.error(' Failed to create employee:', error);
    // Handle error (toast, etc.)
  } finally {
    isCreating.value = false;
  }
};
const editFormData = reactive({
  name: '',
  email: '',
  phone_number: '',
  department: '',
  designation: '',
  status: 'Permanent',
  account_status: 'Active',
  salary: '',
  joined_date: ''
});

onMounted(() => {
  loadEmployees();
});
const openEditModal = (employee) => {
  selectedEmployee.value = employee;
  editFormData.name = employee.name || '';
  editFormData.email = employee.email || '';
  editFormData.phone_number = employee.phone_number || '';
  editFormData.department = employee.department || '';
  editFormData.designation = employee.designation || '';
  editFormData.status = employee.status || 'Permanent';
  editFormData.account_status = employee.account_active ? 'Active' : 'Inactive';
  editFormData.salary = employee.salary || '';
  editFormData.joined_date = employee.joined_date || '';

  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  selectedEmployee.value = null;
};

const handleUpdateEmployee = async () => {
  if (!selectedEmployee.value) return;

  isUpdating.value = true;

  const patchPayload = {
    name: editFormData.name,
    email: editFormData.email,
    phone_number: editFormData.phone_number,
    department: editFormData.department,
    designation: editFormData.designation,
    status: editFormData.status,
    is_active: editFormData.is_active,
    salary: editFormData.salary,
    joined_date: editFormData.joined_date
  };

  const result = await updateEmployee(selectedEmployee.value.id, patchPayload);
  isUpdating.value = false;

  if (result.success) {
    showToast('Employee updated successfully!', 'success');
    closeEditModal();
  } else {
    showToast(`Error: ${result.error || 'Update failed'}`, 'error');
  }
};


const toggleActive = async (employee, event) => {
  const newActive = event.target.checked;
  const result = await updateEmployee(employee.id, { is_active: newActive });
  if (!result.success) {
    showToast(`Error: ${result.error || 'Update failed'}`, 'error');
    // revert the checkbox state by toggling back (if needed)
    event.target.checked = !newActive;
  } else {
    showToast('Account status updated successfully!', 'success');
    // Optionally recalc stats if needed (the composable's updateEmployee already calls calculateStats)
  }
};
</script>