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

      <div class="flex-1 overflow-y-auto p-4 md:p-6">

        <div class="flex flex-wrap gap-4 mb-6">
          <button
              type="button"
              class="flex items-center gap-2 cursor-pointer px-5 py-2.5 bg-buttonBackground text-buttonTextColor font-medium rounded-xl shadow-sm hover:bg-buttonHover transition-colors text-sm"
          >
            <span class="font-bold text-base">$</span>
            Manage salaries
          </button>

          <button
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 bg-white text-text-primary font-medium rounded-xl border border-border shadow-sm hover:bg-surface-alt transition-colors text-sm"
          >
            <font-awesome-icon :icon="['fas', 'users-cog']" class="text-text-muted" />
            Careers & hiring
          </button>
        </div>

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

          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border gap-4">
            <div class="w-full sm:max-w-sm">
              <div class="relative w-full">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                  <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                </span>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by name, ID, or department..."
                    class="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div class="flex items-center justify-start sm:justify-end gap-3 flex-wrap">
              <button
                  @click="copyRegistrationLink"
                  type="button"
                  class="flex items-center cursor-pointer gap-2 px-4 py-2 bg-buttonBackground text-buttonTextColor text-sm font-medium rounded-xl hover:bg-buttonHover transition-colors whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'link']" />
                {{ copied ? 'Link Copied!' : 'Copy Registration Link' }}
              </button>

              <button
                  @click="showModal = true"
                  type="button"
                  class="flex items-center cursor-pointer gap-2 px-4 py-2 bg-buttonBackground text-buttonTextColor text-sm font-medium rounded-xl hover:bg-buttonHover transition-colors whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'plus']" />
                Add employee
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
                      <p class="text-xs text-text-muted uppercase tracking-tight">{{ emp.emp_id }}</p>
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

                <td class="p-4 whitespace-nowrap">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="emp.account_active" class="sr-only peer" />
                    <div class="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </td>

                <td class="p-4 whitespace-nowrap font-medium text-text-secondary">
                  Rs {{ Number(emp.salary).toLocaleString() }}
                </td>

                <td class="p-4 whitespace-nowrap text-text-secondary">{{ emp.joined_date }}</td>



                <td class="p-4 whitespace-nowrap">
                  <button class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-teal-600 transition-colors">
                    <font-awesome-icon :icon="['far', 'comment']" />
                    DM
                  </button>
                </td>

                <td class="p-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button class="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors">
                      <font-awesome-icon :icon="['fas', 'pen-to-square']" class="text-sm" />
                    </button>
                    <button class="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors">
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

          <div v-if="totalPages > 1" class="flex items-center justify-between p-4 bg-surface border-t border-border">
            <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="px-3 py-1 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 transition-opacity cursor-pointer"
            >
              Previous
            </button>
            <span class="text-xs text-text-secondary font-medium">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="px-3 py-1 text-xs font-semibold rounded-lg border bg-white disabled:opacity-50 transition-opacity cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>

    <AddEmployeeModal
        v-if="showModal"
        @close="showModal = false"
        @add-employee="handleAddEmployeeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DashboardHeader from '../../../components/header.vue';
import StateCard from '../../../components/StatCard.vue';
import AdminSidebar from '../../../components/adminSidebar.vue';
import AddEmployeeModal from '../../../components/admin/addEmployeemodel.vue';

// Integrating Reactive Orchestration Composable Layer Architecture
import { useEmployeeDashboard } from '../../../composables/Admin/useEmployeeDashboard.js';

const {
  employees,
  isLoading,
  errorMessage,
  searchQuery,
  currentPage,
  totalPages,
  statsSummary,
  loadEmployees
} = useEmployeeDashboard();

// Basic Header Static Properties configuration
const userName = ref('System Administrator');
const showModal = ref(false);
const copied = ref(false);

// Initialize remote data collection streams during component mounting lifecycle
onMounted(() => {
  loadEmployees();
});

// Refresh collection pipeline upon execution of inner custom creation modal triggers
const handleAddEmployeeModal = (data) => {
  console.log('Employee added successfully via dashboard overlay context tracker payload:', data);
  loadEmployees();
};

// Clipboard automation handler system logic integration
const copyRegistrationLink = () => {
  const baseUrl = window.location.origin;
  const registrationLink = `${baseUrl}/employee/register`;
  navigator.clipboard.writeText(registrationLink)
      .then(() => {
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 3000);
      })
      .catch(() => {
        alert(`Registration link generated parameters: ${registrationLink}`);
      });
};
</script>