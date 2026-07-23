<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
            :user-name="userName"
            role="employee"
            :notification-count="5"
            :iconOverride="['fas', 'rectangle-list']"
        />
      </div>

      <div id="dashboardScrollContainer" class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="emp-stat-grid">
          <StateCard
              variant="peach"
              icon="fa-users"
              label="Total employees"
              :value="statsSummary.total"
          />
          <StateCard
              variant="lavender"
              icon="fa-check"
              label="In office today"
              :value="statsSummary.inOffice"

          />
          <StateCard
              variant="sky"
              icon="fa-clipboard-list"
              label="Intern / probation"
              :value="statsSummary.internProbation"

          />
          <StateCard
              variant="teal"
              icon="fa-umbrella-beach"
              label="Away today"
              :value="statsSummary.awayToday"

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
                  @click="copyOnboardingLink"
                  type="button"
                  class="flex items-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 gap-2 px-4 py-2 btn-primary-gradient text-buttonTextColor text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'copy']" />
                Copy form link
              </button>

              <button
                  @click="showModal = true"
                  type="button"
                  class="flex items-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 gap-2 px-4 py-2 border border-buttonBackground text-black text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'clipboard-list']" />
                View onboarding form
              </button>
              <button
                  type="button"
                  @click="openCreateModal"
                  class="flex items-center cursor-pointer gap-1 px-2 py-2 btn-primary-gradient text-buttonTextColor font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap"
              >
                <font-awesome-icon :icon="['fas', 'plus']" />
                Create employee
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

          <!-- Table (desktop) + Cards (mobile) -->
          <div v-else-if="employees.length > 0">
            <!-- Desktop/Tablet: Table view -->
            <div class="hidden md:block overflow-x-auto">
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
                        <i class="fas fa-user text-xl text-primary"></i>
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
                        emp.status === 'Permanent' ? 'bg-emerald-100 text-emerald-700' : '',
                        emp.status === 'Contract' ? 'bg-indigo-100 text-indigo-700' : '',
                        emp.status === 'Probation' ? 'bg-amber-100 text-amber-700' : '',
                        emp.status === 'Intern' ? 'bg-purple-100 text-purple-700' : ''
                      ]">
                        {{ emp.status }}
                      </span>
                  </td>
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
                    <router-link
                        to="/admin/inbox"
                        class="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-teal-600 transition-colors w-fit"                    >
                      <font-awesome-icon :icon="['far', 'comment']" />
                      DM
                    </router-link>
                  </td>
                  <td class="p-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="openEditModal(emp)" class="p-1.5 hover:bg-surface cursor-pointer rounded-lg text-text-muted hover:text-text-primary transition-colors">
                        <font-awesome-icon :icon="['fas', 'pen']" class="text-sm" />
                      </button>
                      <button @click="openViewModal(emp)" class="p-1.5 hover:bg-surface cursor-pointer rounded-lg text-text-muted hover:text-text-primary transition-colors">
                        <font-awesome-icon :icon="['fas', 'eye']" class="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile: Card view -->
            <div class="md:hidden space-y-3 p-4">
              <div
                  v-for="emp in employees"
                  :key="emp.id"
                  class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center font-bold text-primary overflow-hidden shrink-0">
                      <img v-if="emp.avatar" :src="emp.avatar" alt="Avatar" class="w-full h-full object-cover" />
                      <i class="fas fa-user text-xl text-primary"></i>
                    </div>
                    <div class="min-w-0">
                      <h4 class="font-bold text-text-primary truncate">{{ emp.name }}</h4>
                      <p class="text-xs text-text-muted uppercase tracking-tight truncate">{{ emp.employee_number }}</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                        type="checkbox"
                        :checked="emp.is_active"
                        @change="toggleActive(emp, $event)"
                        class="sr-only peer"
                    />
                    <div class="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div class="border-t border-gray-100"></div>

                <div class="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Department</p>
                    <p class="font-semibold text-text-primary truncate">{{ emp.department }}</p>
                  </div>
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Status</p>
                    <span :class="[
                      'px-2 py-0.5 rounded-full text-[11px] font-semibold inline-block',
                      emp.status === 'Permanent' ? 'bg-emerald-100 text-emerald-700' : '',
                      emp.status === 'Contract' ? 'bg-indigo-100 text-indigo-700' : '',
                      emp.status === 'Probation' ? 'bg-amber-100 text-amber-700' : '',
                      emp.status === 'Intern' ? 'bg-purple-100 text-purple-700' : ''
                    ]">
                      {{ emp.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Salary</p>
                    <p class="font-semibold text-text-primary truncate">Rs {{ Number(emp.salary).toLocaleString() }}</p>
                  </div>
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Joined</p>
                    <p class="font-semibold text-text-primary truncate">{{ emp.joined_date }}</p>
                  </div>
                </div>

                <div class="border-t border-gray-100"></div>

                <div class="flex items-center justify-between gap-2">
                  <router-link
                      to="/admin/inbox"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-teal-600 transition-colors"
                  >
                    <font-awesome-icon :icon="['far', 'comment']" />
                    DM
                  </router-link>
                  <div class="flex items-center gap-2">
                    <button @click="openEditModal(emp)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary" title="Edit">
                      <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3" />
                    </button>
                    <button @click="openViewModal(emp)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary" title="View">
                      <font-awesome-icon :icon="['fas', 'eye']" class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
            <div class="flex items-center justify-center gap-2">
              <button
                  v-for="page in pageNumbers"
                  :key="page"
                  @click="typeof page === 'number' ? currentPage = page : null"
                  :disabled="typeof page !== 'number'"
                  class="px-3 py-1 text-sm font-semibold rounded-lg border transition-colors"
                  :class="{
                    'bg-blue-600 text-white border-blue-600': page === currentPage,
                    'bg-white text-gray-800 border-border hover:bg-surface': page !== currentPage && typeof page === 'number',
                    'opacity-50 cursor-not-allowed bg-white border-border': typeof page !== 'number'
                  }"
              >
                {{ page }}
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

    <!-- Create Modal -->
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

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Department <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              v-model="createFormData.department"
              placeholder="e.g. Engineering"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Insurance Amount
          </label>
          <input
              type="text"
              v-model="createFormData.insurance_amount"
              placeholder="e.g. Rs.23000"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
          />
        </div>

        <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
         Tax (%)
        </label>
       <div class="relative">
         <input
           type="number"
           v-model="createFormData.tax"
           placeholder="e.g. 5"
           min="0"
           max="100"
           step="0.01"
           class="w-full px-4 py-2.5 pr-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
           />
         <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
        </div>
      </div>
      </form>
    </CreateModal>

    <!-- Edit Modal -->
    <EmployeeBaseModal
        :is-open="isEditModalOpen"
        mode="edit"
        title="Edit Employee"
        :subtitle="selectedEmployee ? selectedEmployee.employee_number : ''"
        size="lg"
        :hide-footer="true"
        :loading="isUpdating"
        :show-more="showMoreEdit"
        @close="closeEditModal"
        @cancel="closeEditModal"
        @toggle-more="toggleMoreEdit"
        form-id="edit-employee-form"
    >
      <!-- Main container with proper height management -->
      <div class="flex flex-col" style="height: 100%;">

        <!-- Scrollable Content - Only this scrolls -->
        <div class="flex-1 overflow-y-auto px-6 py-6 custom-scroll">
          <form
              id="edit-employee-form"
              @submit.prevent="handleUpdateEmployee"
              class="text-left text-gray-700"
          >
            <div class="space-y-5">
              <!-- Basic Details Grid - 2 columns -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                  <input
                      type="text"
                      v-model="editFormData.name"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Email</label>
                  <input
                      type="email"
                      v-model="editFormData.email"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Phone</label>
                  <input
                      type="text"
                      v-model="editFormData.phone_number"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Department</label>
                  <input
                      type="text"
                      v-model="editFormData.department"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Designation</label>
                  <input
                      type="text"
                      v-model="editFormData.designation"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Employment Status</label>
                  <select
                      v-model="editFormData.status"
                      class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  >
                    <option
                      v-for="st in employmentStatuses"
                      :key="st.id || st.code || st.name"
                      :value="st.name"
                    >
                      {{ st.name }}
                    </option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Account Status</label>
                  <select
                      v-model="editFormData.is_active"
                      class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  >
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Work from home</label>
                  <select
                      v-model="editFormData.work_from_home"
                      class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  >
                    <option :value="false">No</option>
                    <option :value="true">Yes</option>
                  </select>
                  <p class="text-[11px] text-gray-400">
                    If Yes, check-ins outside the office radius show as Work from home.
                  </p>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Salary (PKR)</label>
                  <input
                      type="number"
                      v-model="editFormData.salary"
                      class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                  />
                </div>

                <!-- Insurance Amount -->
              <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Insurance Amount (PKR)
             </label>
               <input
                   type="number"
                   v-model="editFormData.insurance_amount"
                   placeholder="e.g. 5000"
                   min="0"
                   step="100"
                   class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                />
               </div>

              <!-- Tax Percentage -->
            <div class="flex flex-col gap-1.5">
             <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
                Tax (%)
              </label>
            <div class="relative">
             <input
                type="number"
                v-model="editFormData.tax"
                placeholder="e.g. 10"
                min="0"
                max="100"
                step="0.01"
                class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
               />
             <span class="absolute inset-y-0 right-4 flex items-center text-gray-500 font-medium">
              %
             </span>
            </div>
           </div>
          </div>

              <!-- ACCOUNT SECURITY Section -->
              <div class="space-y-4 pt-2">
                <h4 class="font-bold text-[#1e293b] text-sm">ACCOUNT SECURITY</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="flex flex-col gap-1.5">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
                        New Password
                      </label>
                      <span v-if="editFormData.password && passwordStrength && passwordStrength !== 'Strong' && !showStrongMessage"
                            class="text-xs font-semibold px-2 py-0.5 rounded-full border"
                            :class="{
                                'bg-red-100 border-red-300 text-red-600': passwordStrength === 'Weak',
                                'bg-yellow-100 border-yellow-300 text-yellow-600': passwordStrength === 'Medium'
                              }">
                          {{ passwordStrength }}
                        </span>
                    </div>
                    <div class="relative">
                      <input
                          :type="showPassword ? 'text' : 'password'"
                          v-model="editFormData.password"
                          placeholder="Enter new password"
                          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition pr-12"
                          :class="{
                            'border-red-500 focus:ring-red-500': passwordStrength === 'Weak' && editFormData.password && !showStrongMessage,
                            'border-yellow-500 focus:ring-yellow-500': passwordStrength === 'Medium' && editFormData.password && !showStrongMessage,
                            'border-green-500 focus:ring-green-500': passwordStrength === 'Strong' && editFormData.password && showStrongMessage
                          }"
                      />
                      <button
                          type="button"
                          @click="showPassword = !showPassword"
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Confirm Password
                    </label>
                    <div class="relative">
                      <input
                          :type="showConfirmPassword ? 'text' : 'password'"
                          v-model="editFormData.confirmPassword"
                          placeholder="Confirm new password"
                          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition pr-12"
                      />
                      <button
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <span v-if="passwordError" class="text-xs text-red-500 font-medium mt-1">
                      <i class="fas fa-exclamation-circle mr-1"></i> {{ passwordError }}
                    </span>
                  </div>

                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <div v-if="editFormData.password && passwordStrength && passwordStrength !== 'Strong'" class="text-xs text-gray-500 space-y-0.5">
                      <div v-for="(rule, index) in getPasswordRules(editFormData.password)" :key="index"
                           class="flex items-center gap-1.5">
                        <i :class="rule.passed ? 'fas fa-check-circle text-green-500' : 'fas fa-circle text-gray-300'"></i>
                        <span :class="rule.passed ? 'text-green-600' : 'text-gray-400'">{{ rule.text }}</span>
                      </div>
                    </div>
                    <div v-if="editFormData.password && passwordStrength === 'Strong' && showStrongMessage" class="text-xs text-green-600">
                      <i class="fas fa-check-circle mr-1"></i> Strong password - all requirements met!
                    </div>
                  </div>

                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Join Date</label>
                    <input
                        type="date"
                        v-model="editFormData.joined_date"
                        class="w-95 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                </div>
              </div>

              <!-- More Details Section (toggled) -->
              <div v-if="showMoreEdit" class="space-y-5 animate-fade-in-up mt-5 pt-5 border-t border-slate-100">
                <h4 class="font-bold text-[#1e293b] text-sm">PERSONAL DETAILS</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">CNIC Number</label>
                    <input
                        type="text"
                        v-model="editFormData.cnic"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Gender</label>
                    <select
                        v-model="editFormData.gender"
                        class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Present Address</label>
                    <input
                        type="text"
                        v-model="editFormData.present_address"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Permanent Address</label>
                    <input
                        type="text"
                        v-model="editFormData.permanent_address"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                </div>

                <h4 class="font-bold text-[#1e293b] text-sm">EMERGENCY CONTACT</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Name</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_name"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Relation</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_relation"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency CNIC</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_cnic"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Phone</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_phone"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Address</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_address"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                </div>

                <h4 class="font-bold text-[#1e293b] text-sm">BANK INFORMATION</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Bank Name</label>
                    <input
                        type="text"
                        v-model="editFormData.bank_name"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Branch Name</label>
                    <input
                        type="text"
                        v-model="editFormData.branch_name"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Account Number</label>
                    <input
                        type="text"
                        v-model="editFormData.account_number"
                        placeholder="—"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer - Fixed at bottom -->
        <div class="flex-shrink-0 w-full bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-end gap-2 sm:gap-3" style="padding: 1rem 2rem; border-radius: 0 0 2rem 2rem; background: white;">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <!-- Cancel Button -->
            <button
                type="button"
                @click="closeEditModal"
                class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition bg-white w-full sm:w-auto"
            >
              Cancel
            </button>

            <!-- More details / Show less button -->
            <button
                type="button"
                @click="toggleMoreEdit"
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-buttonTextColor shadow-sm transition flex items-center justify-center gap-2 btn-primary-gradient  w-full sm:w-auto"
            >
              <i v-if="showMoreEdit" class="fas fa-chevron-up text-xs"></i>
              <i v-else class="fas fa-chevron-down text-xs"></i>
              {{ showMoreEdit ? 'Show less' : 'More details' }}
            </button>

            <!-- Save changes button -->
            <button
                type="submit"
                form="edit-employee-form"
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-buttonTextColor shadow-sm transition btn-primary-gradient  w-full sm:w-auto"
                :disabled="isUpdating"
            >
              {{ isUpdating ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </div>
      </div>
    </EmployeeBaseModal>

    <!-- View Modal -->
    <EmployeeBaseModal
        :is-open="isViewModalOpen"
        mode="view"
        title="Edit Employee"
        :subtitle="viewEmployee?.employee_number || 'RS-0726-04'"
        size="lg"
        @close="closeViewModal"
        @toggle-more="showMore = !showMore"
        :show-more="showMore"
    >
      <div v-if="viewEmployee" class="text-left w-full h-full flex flex-col">
        <!-- Your employee content here -->
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
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Employment Status</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.status }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Monthly Salary</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">Rs {{ Number(viewEmployee.salary).toLocaleString() }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Joined Date</span>
            <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.joined_date }}</span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Account Status</span>
            <span class="text-sm font-bold truncate" :class="viewEmployee.is_active ? 'text-green-600' : 'text-red-500'">
              {{ viewEmployee.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Work from home</span>
            <span class="text-sm font-bold truncate" :class="viewEmployee.work_from_home ? 'text-sky-600' : 'text-[#1e293b]'">
              {{ viewEmployee.work_from_home ? 'Yes' : 'No' }}
            </span>
          </div>
        </div>

        <!-- More details section -->
        <div v-if="showMore" class="space-y-5 animate-fade-in-up mt-5">
          <h4 class="text-sm font-bold text-[#1e293b]">PERSONAL DETAILS</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">CNIC Number</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.cnic || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Gender</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.gender || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Present Address</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.present_address || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Permanent Address</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.permanent_address || '—' }}</span>
            </div>
          </div>

          <h4 class="text-sm font-bold text-[#1e293b]">EMERGENCY CONTACT</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Contact Name</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.emergency_name || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Relation</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.emergency_relation || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Emergency CNIC</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.emergency_cnic || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Emergency Phone</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.emergency_phone || '—' }}</span>
            </div>
          </div>

          <h4 class="text-sm font-bold text-[#1e293b]">BANK INFORMATION</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Bank Name</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.bank_name || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Branch Name</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.branch_name || '—' }}</span>
            </div>
            <div class="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col justify-center sm:col-span-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1.5">Account Number</span>
              <span class="text-sm font-bold text-[#1e293b] truncate">{{ viewEmployee.account_number || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </EmployeeBaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import DashboardHeader from '../../../components/header.vue';
import StateCard from '../../../components/StatCard.vue';
import AdminSidebar from '../../../components/adminSidebar.vue';
import CreateModal from '../../../components/baseModal.vue';
import { useToast } from '@/composables/useToast.js';
import EmployeeRegistrationModelForm from '@/pages/admin/Employee/employeeRegistrationModel.vue';
import { useEmployeeDashboard } from '@/composables/useEmployeeDashboard.js';
import EmployeeBaseModal from '@/components/employeeBaseModel.vue';
import { useEmployeeStore} from '@/stores/employeeStore.js'
// Password related refs
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordError = ref('');
const passwordStrength = ref('');
const passwordStrengthColor = ref('');
const employeeStore = useEmployeeStore();
const employmentStatuses = computed(() => employeeStore.employmentStatuses || []);
const passwordStrengthClass = ref('');
const showStrongMessage = ref(false);
let strongMessageTimeout = null;

// Composables
const { showToast } = useToast();
const {
  employees,
  isLoading,
  errorMessage,
  searchQuery,
  currentPage,
  pageSize,
  totalPages,
  statsSummary,
  loadEmployees,
  updateEmployee,
  pageNumbers,
  allEmployees,
  calculateStats
} = useEmployeeDashboard();

// Local state
const userName = ref('System Administrator');
const showModal = ref(false);
const isViewModalOpen = ref(false);
const showMore = ref(false);
const viewEmployee = ref(null);
const isEditModalOpen = ref(false);
const isUpdating = ref(false);
const selectedEmployee = ref(null);
const isCreateModalOpen = ref(false);
const isCreating = ref(false);
const showMoreEdit = ref(false);

// Form data
const createFormData = reactive({
  name: '',
  email: '',
  phone_number: '',
  position: '',
  salary: '',
  department: '',
  insurance_amount: '',
  tax: ''
});

const editFormData = reactive({
  name: '',
  email: '',
  phone_number: '',
  department: '',
  designation: '',
  status: 'Permanent',
  is_active: true,
  work_from_home: false,
  salary: '',
  joined_date: '',
  employee_number: '',
  cnic: '',
  gender: '',
  present_address: '',
  permanent_address: '',
  emergency_name: '',
  emergency_relation: '',
  emergency_cnic: '',
  emergency_phone: '',
  emergency_address: '',
  bank_name: '',
  branch_name: '',
  account_number: '',
  password: '',
  confirmPassword: '',
  tax: '',
  insurance_amount:'',
});

// Password validation functions
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  return errors;
};

const getPasswordRules = (password) => {
  const rules = [
    { text: 'At least 8 characters', passed: password.length >= 8 },
    { text: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
    { text: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
    { text: 'Contains a number', passed: /[0-9]/.test(password) },
    { text: 'Contains special character (!@#$%^&*)', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];
  return rules;
};

// Watch password for strength validation
watch(() => editFormData.password, (newPassword) => {
  if (!newPassword) {
    passwordStrength.value = '';
    passwordStrengthColor.value = '';
    passwordStrengthClass.value = '';
    showStrongMessage.value = false;
    if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
    return;
  }

  const errors = validatePasswordStrength(newPassword);

  if (errors.length === 0) {
    passwordStrength.value = 'Strong';
    passwordStrengthColor.value = 'text-green-600';
    passwordStrengthClass.value = 'bg-green-100 border-green-300';

    showStrongMessage.value = true;
    if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
    strongMessageTimeout = setTimeout(() => {
      showStrongMessage.value = false;
    }, 2000);
  } else if (errors.length <= 2) {
    passwordStrength.value = 'Medium';
    passwordStrengthColor.value = 'text-yellow-600';
    passwordStrengthClass.value = 'bg-yellow-100 border-yellow-300';
    showStrongMessage.value = false;
    if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
  } else {
    passwordStrength.value = 'Weak';
    passwordStrengthColor.value = 'text-red-600';
    passwordStrengthClass.value = 'bg-red-100 border-red-300';
    showStrongMessage.value = false;
    if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
  }
});

// Watch confirm password to clear error
watch(() => editFormData.confirmPassword, () => {
  if (passwordError.value && passwordError.value.includes('match')) {
    if (editFormData.password === editFormData.confirmPassword) {
      passwordError.value = '';
    }
  }
});

// Modal handlers
const openCreateModal = () => {
  Object.assign(createFormData, {
    name: '',
    email: '',
    phone_number: '',
    position: '',
    salary: '',
    department: '',
    insurance_amount: '',
    tax: ''
  });
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const handleCreateEmployee = async () => {
  if (!createFormData.name.trim() || !createFormData.email.trim()) {
    showToast('Name and Email are required.', 'error');
    return;
  }
  if (!createFormData.phone_number.trim()) {
    showToast('Phone number is required.', 'error');
    return;
  }
  if (!createFormData.department.trim()) {
    showToast('Department is required.', 'error');
    return;
  }

  isCreating.value = true;
  try {
    const formDataPayload = new FormData();
    formDataPayload.append('name', createFormData.name.trim());
    formDataPayload.append('email', createFormData.email.trim());
    formDataPayload.append('phone_number', createFormData.phone_number.trim());
    formDataPayload.append(
      'designation',
      (createFormData.position || '').trim() || 'Employee'
    );
    formDataPayload.append('department', createFormData.department.trim());
    formDataPayload.append('status', 'Intern');
    formDataPayload.append('is_active', 'true');
    formDataPayload.append(
      'joined_date',
      new Date().toISOString().split('T')[0]
    );
    if (createFormData.salary) {
      formDataPayload.append('salary', parseFloat(createFormData.salary));
    }
    if (createFormData.insurance_amount) {
      formDataPayload.append('insurance_amount', parseFloat(createFormData.insurance_amount));
    }
    if (createFormData.tax) {
      formDataPayload.append('tax', parseFloat(createFormData.tax));
    }

    const result = await employeeStore.addEmployee(formDataPayload);

    if (result.success) {
      const emailNote = result.data?.email_sent === false
        ? ' Create-password email could not be sent — check Email settings.'
        : ' A create-password link was emailed to the employee.';
      showToast(`Employee created successfully.${emailNote}`, 'success', 5000);
      closeCreateModal();
      // Refresh list outside create success path so a refresh failure
      // does not look like a create failure
      try {
        await loadEmployees();
      } catch (refreshErr) {
        console.error('Employee created but list refresh failed:', refreshErr);
      }
    } else {
      showToast(result.error || 'Failed to create employee', 'error', 6000);
    }
  } catch (error) {
    console.error('Failed to create employee:', error);
    showToast(error?.message || 'Failed to create employee. Please try again.', 'error');
  } finally {
    isCreating.value = false;
  }
};

const openEditModal = (employee) => {
  selectedEmployee.value = employee;
  passwordError.value = '';
  passwordStrength.value = '';
  passwordStrengthColor.value = '';
  passwordStrengthClass.value = '';
  showStrongMessage.value = false;
  if (strongMessageTimeout) clearTimeout(strongMessageTimeout);

  Object.assign(editFormData, {
    name: employee.name || employee.full_name || '',
    email: employee.email || '',
    phone_number: employee.phone_number || '',
    department: employee.department || '',
    designation: employee.designation || '',
    status: employee.status || employee.employment_status || 'Permanent',
    is_active: employee.is_active === true || employee.is_active === 'true' || employee.account_status === 'Active',
    work_from_home: employee.work_from_home === true || employee.work_from_home === 'true',
    salary: employee.salary || '',
    joined_date: employee.joined_date || '',
    employee_number: employee.employee_number || '',
    cnic: employee.cnic || '',
    gender: employee.gender || '',
    present_address: employee.present_address || '',
    permanent_address: employee.permanent_address || '',
    emergency_name: employee.emergency_name || '',
    emergency_relation: employee.emergency_relation || '',
    emergency_cnic: employee.emergency_cnic || '',
    emergency_phone: employee.emergency_phone || '',
    emergency_address: employee.emergency_address || '',
    bank_name: employee.bank_name || '',
    branch_name: employee.branch_name || '',
    account_number: employee.account_number || '',
    password: '',
    confirmPassword: ''
  });
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  selectedEmployee.value = null;
  showMoreEdit.value = false;
  showStrongMessage.value = false;
  if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
};

const handleUpdateEmployee = async () => {
  if (!selectedEmployee.value) return;

  // Password validation
  const password = editFormData.password;
  const confirmPassword = editFormData.confirmPassword;

  // Check if both are filled or both are empty
  if ((password && !confirmPassword) || (!password && confirmPassword)) {
    passwordError.value = 'Both password fields must be filled or both empty.';
    return;
  }

  if (password && confirmPassword && password !== confirmPassword) {
    passwordError.value = 'Passwords do not match.';
    return;
  }

  // Password strength validation (only if password is provided)
  if (password) {
    const strengthErrors = validatePasswordStrength(password);
    if (strengthErrors.length > 0) {
      passwordError.value = 'Password is too weak: ' + strengthErrors.join(', ');
      return;
    }
  }

  // Clear error if validation passes
  passwordError.value = '';

  isUpdating.value = true;
  try {
    const payload = {};
    const textFields = [
      'name', 'email', 'phone_number', 'department', 'designation', 'status',
      'present_address', 'permanent_address', 'emergency_name', 'emergency_relation',
      'emergency_phone', 'emergency_address', 'bank_name', 'branch_name', 'account_number',
    ];
    const nullableTextFields = ['cnic', 'gender', 'emergency_cnic'];
    const numberFields = ['salary', 'tax', 'insurance_amount'];

    textFields.forEach((key) => {
      const value = editFormData[key];
      if (value !== undefined && value !== null) {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      }
    });

    nullableTextFields.forEach((key) => {
      const value = editFormData[key];
      if (value === undefined || value === null || value === '') {
        payload[key] = null;
      } else {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      }
    });

    // Only send joined_date when it has a real value
    if (editFormData.joined_date) {
      payload.joined_date = editFormData.joined_date;
    }

    numberFields.forEach((key) => {
      const value = editFormData[key];
      if (value === '' || value === null || value === undefined) return;
      const num = Number(value);
      if (!Number.isNaN(num)) payload[key] = num;
    });

    payload.is_active = !!editFormData.is_active;
    payload.work_from_home = !!editFormData.work_from_home;

    if (password) {
      payload.password = password;
    }

    const result = await updateEmployee(selectedEmployee.value.id, payload);
    if (result.success) {
      showToast(
        password ? 'Employee and login password updated successfully!' : 'Employee updated successfully!',
        'success'
      );
      closeEditModal();
      try {
        await loadEmployees();
      } catch (refreshErr) {
        console.error('Updated but list refresh failed:', refreshErr);
      }
    } else {
      showToast(result.error || 'Update failed', 'error', 6000);
    }
  } catch (error) {
    console.error('Update error:', error);
    showToast(error?.message || 'An error occurred while updating.', 'error');
  } finally {
    isUpdating.value = false;
  }
};

const openViewModal = (employee) => {
  viewEmployee.value = employee;
  isViewModalOpen.value = true;
};

const closeViewModal = () => {
  isViewModalOpen.value = false;
  showMore.value = false;
};

const toggleActive = async (employee, event) => {
  const newActive = event.target.checked;
  const result = await updateEmployee(employee.id, { is_active: newActive });
  if (!result.success) {
    showToast(`Error: ${result.error || 'Update failed'}`, 'error');
    event.target.checked = !newActive;
  } else {
    showToast('Account status updated successfully!', 'success');
  }
};

const toggleMoreEdit = () => {
  showMoreEdit.value = !showMoreEdit.value;
};

// Watch for modal to control body scroll
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
const copyOnboardingLink = async () => {
  const link = `${window.location.origin}/onboarding/new`;
  try {
    await navigator.clipboard.writeText(link);
    showToast('Onboarding link copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy link', 'error');
    // Fallback: prompt user to copy manually
    prompt('Copy this link:', link);
  }
};
// Lifecycle
onMounted(() => {
  employeeStore.fetchEmploymentStatuses();
  loadEmployees();
  window.addEventListener('employee-created', loadEmployees);
});

onBeforeUnmount(() => {
  window.removeEventListener('employee-created', loadEmployees);
});

// Expose methods to parent if needed
defineExpose({
  openEditModal,
  openViewModal,
  closeEditModal,
  closeViewModal,
  openCreateModal
});
</script>

<style scoped>
.employee-view-modal :deep(.relative.flex.flex-col),
.employee-view-modal :deep(.modal-body),
.employee-view-modal :deep([class*="modal-body"]),
.employee-view-modal :deep([class*="p-"]),
.employee-view-modal :deep([class*="px-"]) {
  padding: 0px !important;
  overflow: hidden !important;
  border-radius: 2rem !important;
}

.custom-header-flush {
  margin: 0 !important;
  width: 100% !important;
  border-top-left-radius: 2rem !important;
  border-top-right-radius: 2rem !important;
  box-sizing: border-box;
}

.custom-footer-flush {
  margin: 0 !important;
  width: 100% !important;
  border-bottom-left-radius: 2rem !important;
  border-bottom-right-radius: 2rem !important;
}

.custom-content-scroll {
  max-h: calc(85vh - 160px);
}

:deep(.custom-scrollbar) {
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
}

:deep(.px-8.py-6.border-b) {
  display: none !important;
}

.emp-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .emp-stat-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .emp-stat-grid { grid-template-columns: 1fr; }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Animation for fade in */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
</style>