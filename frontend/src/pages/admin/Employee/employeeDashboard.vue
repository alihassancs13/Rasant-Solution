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

              <!-- NEW: Active only checkbox -->
              <div class="flex items-center gap-2 ml-0 sm:ml-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      v-model="showOnlyActive"
                      class="sr-only peer"
                  />
                  <div class="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
                <span class="text-sm text-text-muted whitespace-nowrap">Active only</span>
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
                Create
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="p-4 m-6 bg-danger-subtle text-danger rounded-xl border border-danger/20 flex items-center gap-3">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
            <span class="text-sm font-medium">{{ errorMessage }}</span>
            <button @click="loadEmployees" class="ml-auto text-xs underline font-bold cursor-pointer">Retry</button>
          </div>

          <div v-if="isLoading" class="space-y-4">
            <AppSkeleton variant="table" :count="8" />
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
                  <!-- Desktop Table - Status column -->
                  <td class="p-4 whitespace-nowrap">
                    <select
                        :value="getEmployeeStatusId(emp)"
                        @change="handleStatusChange(emp, parseInt($event.target.value))"
                        class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition bg-white min-w-[120px]"
                        :style="{
        color: getStatusColor(getEmployeeStatusId(emp)),
        backgroundColor: getStatusBgColor(getEmployeeStatusId(emp))
    }"
                    >
                      <option
                          v-for="status in employmentStatuses"
                          :key="status.id"
                          :value="status.id"
                          :selected="getEmployeeStatusId(emp) === status.id"
                      >
                        {{ status.name }}
                      </option>
                    </select>
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
                        :to="{ path: '/admin/inbox', query: { chatWith: emp.id, chatName: emp.name } }"
                        class="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-teal-600 transition-colors w-fit"
                    >
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
                  <!-- Mobile Card - Status -->

                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Status</p>
                    <select
                        :value="getEmployeeStatusId(emp)"
                        @change="handleStatusChange(emp, parseInt($event.target.value))"
                        class="w-full px-2 py-1 text-xs font-semibold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition bg-white"
                        :style="{
        color: getStatusColor(getEmployeeStatusId(emp)),
        backgroundColor: getStatusBgColor(getEmployeeStatusId(emp))
    }"
                    >
                      <option
                          v-for="status in employmentStatuses"
                          :key="status.id"
                          :value="status.id"
                          :selected="getEmployeeStatusId(emp) === status.id"
                      >
                        {{ status.name }}
                      </option>
                    </select>
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
                      :to="{ path: '/admin/inbox', query: { chatWith: emp.id, chatName: emp.name } }"
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
            <h3 class="text-base font-semibold text-slate-700 mb-1">No employee data found</h3>
          </div>

          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-surface border-t border-border gap-3">
            <div class="text-xs text-text-secondary font-medium text-center sm:text-left">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center justify-center gap-2">
              <!-- Previous button -->
              <button
                  @click="currentPage > 1 ? currentPage-- : null"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 text-sm font-semibold rounded-lg border transition-colors"
                  :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-white border-border text-gray-400' : 'bg-white text-gray-800 border-border hover:bg-surface'"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs" />
              </button>

              <!-- Page numbers -->
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

              <!-- Next button -->
              <button
                  @click="currentPage < totalPages ? currentPage++ : null"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 text-sm font-semibold rounded-lg border transition-colors"
                  :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-white border-border text-gray-400' : 'bg-white text-gray-800 border-border hover:bg-surface'"
              >
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs" />
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
        :disable-submit="!isCreateFormValid || isCreating"
        :loading="isCreating"
        :wide="false"
        @close="closeCreateModal"
        @save="handleCreateEmployee"
    >
      <form @submit.prevent="handleCreateEmployee" class="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-gray-700">
        <!-- First Name -->
        <!-- First Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              v-model="createFormData.first_name"
              placeholder="e.g. Sarah"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.first_name && createErrors.first_name) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('first_name')"
              @blur="markCreateTouched('first_name')"
          />
          <span v-if="createTouched.first_name && createErrors.first_name" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.first_name }}
    </span>
        </div>

        <!-- Last Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Last Name <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              v-model="createFormData.last_name"
              placeholder="e.g. Ali"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.last_name && createErrors.last_name) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('last_name')"
              @blur="markCreateTouched('last_name')"
          />
          <span v-if="createTouched.last_name && createErrors.last_name" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.last_name }}
    </span>
        </div>

        <!-- Username - NEW FIELD -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Username <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              v-model="createFormData.username"
              placeholder="e.g. sarah_ali"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.username && createErrors.username) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('username')"
              @blur="markCreateTouched('username')"
          />
          <span v-if="createTouched.username && createErrors.username" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.username }}
    </span>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Email Address <span class="text-red-500">*</span>
          </label>
          <input
              type="email"
              v-model="createFormData.email"
              placeholder="employee@email.com"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.email && createErrors.email) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('email')"
              @blur="markCreateTouched('email')"
          />
          <span v-if="createTouched.email && createErrors.email" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.email }}
    </span>
        </div>

        <!-- Phone Number -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              inputmode="numeric"
              v-model="createFormData.phone_number"
              placeholder="e.g. 03XXXXXXXXX"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.phone_number && createErrors.phone_number) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('phone_number')"
              @blur="markCreateTouched('phone_number')"
          />
          <span v-if="createTouched.phone_number && createErrors.phone_number" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.phone_number }}
      </span>
        </div>

        <!-- Designation -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Designation</label>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">ADMIN ONLY</span>
          </div>
          <input
              type="text"
              v-model="createFormData.position"
              placeholder="e.g. Software Engineer"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.position && createErrors.position) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('position')"
              @blur="markCreateTouched('position')"
          />
          <span v-if="createTouched.position && createErrors.position" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.position }}
      </span>
        </div>

        <!-- Monthly Salary -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Monthly Salary (PKR) <span class="text-red-500">*</span>
            </label>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">ADMIN ONLY</span>
          </div>
          <input
              type="text"
              inputmode="decimal"
              v-model="createFormData.salary"
              placeholder="e.g. 85000"
              maxlength="10"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.salary && createErrors.salary) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('salary')"
              @blur="markCreateTouched('salary')"
          />
          <span v-if="createTouched.salary && createErrors.salary" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.salary }}
      </span>
        </div>

        <!-- Department -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
            Department <span class="text-red-500">*</span>
          </label>
          <input
              type="text"
              v-model="createFormData.department"
              placeholder="e.g. Engineering"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.department && createErrors.department) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('department')"
              @blur="markCreateTouched('department')"
          />
          <span v-if="createTouched.department && createErrors.department" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.department }}
      </span>
        </div>

        <!-- Insurance Amount -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Insurance Amount</label>
          <input
              type="text"
              inputmode="decimal"
              v-model="createFormData.insurance_amount"
              placeholder="e.g. 23000"
              maxlength="10"
              :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.insurance_amount && createErrors.insurance_amount) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
              @input="markCreateTouched('insurance_amount')"
              @blur="markCreateTouched('insurance_amount')"
          />
          <span v-if="createTouched.insurance_amount && createErrors.insurance_amount" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.insurance_amount }}
      </span>
        </div>

        <!-- Tax -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Tax (%)</label>
          <div class="relative">
            <input
                type="text"
                inputmode="decimal"
                v-model="createFormData.tax"
                placeholder="e.g. 5"
                maxlength="5"
                :class="['w-full px-4 py-2.5 pr-8 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200', (createTouched.tax && createErrors.tax) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                @input="markCreateTouched('tax')"
                @blur="markCreateTouched('tax')"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <span v-if="createTouched.tax && createErrors.tax" class="text-xs text-rose-500 mt-1 block">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ createErrors.tax }}
      </span>
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
        :disable-submit="!isEditFormValid || isUpdating"
        @close="closeEditModal"
        @cancel="closeEditModal"
        @toggle-more="toggleMoreEdit"
        form-id="edit-employee-form"
    >
      <!-- Main container with proper height management -->
      <div class="flex flex-col" style="height: 100%;">

        <!-- Scrollable Content -->
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
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name <span class="text-red-500">*</span></label>
                  <input
                      type="text"
                      v-model="editFormData.name"

                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.name && editErrors.name) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('name')"
                      @blur="markEditTouched('name')"
                  />
                  <span v-if="editTouched.name && editErrors.name" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.name }}
              </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Email <span class="text-red-500">*</span></label>
                  <input
                      type="email"
                      v-model="editFormData.email"
                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.email && editErrors.email) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('email')"
                      @blur="markEditTouched('email')"
                  />
                  <span v-if="editTouched.email && editErrors.email" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.email }}
              </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Phone <span class="text-red-500">*</span></label>
                  <input
                      type="text"
                      inputmode="numeric"
                      v-model="editFormData.phone_number"

                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.phone_number && editErrors.phone_number) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('phone_number')"
                      @blur="markEditTouched('phone_number')"
                  />
                  <span v-if="editTouched.phone_number && editErrors.phone_number" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.phone_number }}
              </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Department <span class="text-red-500">*</span></label>
                  <input
                      type="text"
                      v-model="editFormData.department"

                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.department && editErrors.department) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('department')"
                      @blur="markEditTouched('department')"
                  />
                  <span v-if="editTouched.department && editErrors.department" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.department }}
              </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Designation <span class="text-red-500">*</span></label>
                  <input
                      type="text"
                      v-model="editFormData.designation"

                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.designation && editErrors.designation) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('designation')"
                      @blur="markEditTouched('designation')"
                  />
                  <span v-if="editTouched.designation && editErrors.designation" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.designation }}
              </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Salary (PKR) <span class="text-red-500">*</span></label>
                  <input
                      type="text"
                      inputmode="decimal"
                      v-model="editFormData.salary"
                      maxlength="10"
                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.salary && editErrors.salary) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('salary')"
                      @blur="markEditTouched('salary')"
                  />
                  <span v-if="editTouched.salary && editErrors.salary" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.salary }}
              </span>
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
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Insurance Amount (PKR)</label>
                  <input
                      type="text"
                      inputmode="decimal"
                      v-model="editFormData.insurance_amount"
                      placeholder="e.g. 5000"
                      maxlength="10"
                      :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.insurance_amount && editErrors.insurance_amount) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                      @input="markEditTouched('insurance_amount')"
                      @blur="markEditTouched('insurance_amount')"
                  />
                  <span v-if="editTouched.insurance_amount && editErrors.insurance_amount" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.insurance_amount }}
              </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Tax (%)</label>
                  <div class="relative">
                    <input
                        type="text"
                        inputmode="decimal"
                        v-model="editFormData.tax"
                        placeholder="e.g. 10"
                        maxlength="5"
                        :class="['w-full px-4 py-2.5 pr-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.tax && editErrors.tax) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('tax')"
                        @blur="markEditTouched('tax')"
                    />
                    <span class="absolute inset-y-0 right-4 flex items-center text-gray-500 font-medium">%</span>
                  </div>
                  <span v-if="editTouched.tax && editErrors.tax" class="text-xs text-rose-500 mt-1 block">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.tax }}
              </span>
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
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Join Date <span class="text-red-500">*</span></label>
                    <input
                        type="date"
                        v-model="editFormData.joined_date"
                        :class="['w-95 px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.joined_date && editErrors.joined_date) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @change="markEditTouched('joined_date')"
                        @blur="markEditTouched('joined_date')"
                    />
                    <span v-if="editTouched.joined_date && editErrors.joined_date" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.joined_date }}
                </span>
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
                        placeholder="00000-0000000-0"

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.cnic && editErrors.cnic) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('cnic')"
                        @blur="markEditTouched('cnic')"
                    />
                    <span v-if="editTouched.cnic && editErrors.cnic" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.cnic }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Gender</label>
                    <select
                        v-model="editFormData.gender"
                        class="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition"
                        @change="markEditTouched('gender')"
                        @blur="markEditTouched('gender')"
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
                        maxlength="250"
                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.present_address && editErrors.present_address) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('present_address')"
                        @blur="markEditTouched('present_address')"
                    />
                    <span v-if="editTouched.present_address && editErrors.present_address" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.present_address }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Permanent Address</label>
                    <input
                        type="text"
                        v-model="editFormData.permanent_address"
                        placeholder="—"
                        maxlength="250"
                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.permanent_address && editErrors.permanent_address) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('permanent_address')"
                        @blur="markEditTouched('permanent_address')"
                    />
                    <span v-if="editTouched.permanent_address && editErrors.permanent_address" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.permanent_address }}
                </span>
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

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.emergency_name && editErrors.emergency_name) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('emergency_name')"
                        @blur="markEditTouched('emergency_name')"
                    />
                    <span v-if="editTouched.emergency_name && editErrors.emergency_name" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.emergency_name }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Relation</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_relation"
                        placeholder="—"

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.emergency_relation && editErrors.emergency_relation) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('emergency_relation')"
                        @blur="markEditTouched('emergency_relation')"
                    />
                    <span v-if="editTouched.emergency_relation && editErrors.emergency_relation" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.emergency_relation }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency CNIC</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_cnic"
                        placeholder="00000-0000000-0"

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.emergency_cnic && editErrors.emergency_cnic) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('emergency_cnic')"
                        @blur="markEditTouched('emergency_cnic')"
                    />
                    <span v-if="editTouched.emergency_cnic && editErrors.emergency_cnic" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.emergency_cnic }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Phone</label>
                    <input
                        type="text"
                        inputmode="numeric"
                        v-model="editFormData.emergency_phone"
                        placeholder="03XXXXXXXXX"

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.emergency_phone && editErrors.emergency_phone) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('emergency_phone')"
                        @blur="markEditTouched('emergency_phone')"
                    />
                    <span v-if="editTouched.emergency_phone && editErrors.emergency_phone" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.emergency_phone }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Address</label>
                    <input
                        type="text"
                        v-model="editFormData.emergency_address"
                        placeholder="—"
                        maxlength="250"
                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.emergency_address && editErrors.emergency_address) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('emergency_address')"
                        @blur="markEditTouched('emergency_address')"
                    />
                    <span v-if="editTouched.emergency_address && editErrors.emergency_address" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.emergency_address }}
                </span>
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

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.bank_name && editErrors.bank_name) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('bank_name')"
                        @blur="markEditTouched('bank_name')"
                    />
                    <span v-if="editTouched.bank_name && editErrors.bank_name" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.bank_name }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Branch Name</label>
                    <input
                        type="text"
                        v-model="editFormData.branch_name"
                        placeholder="—"

                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.branch_name && editErrors.branch_name) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('branch_name')"
                        @blur="markEditTouched('branch_name')"
                    />
                    <span v-if="editTouched.branch_name && editErrors.branch_name" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.branch_name }}
                </span>
                  </div>
                  <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Account Number</label>
                    <input
                        type="text"
                        v-model="editFormData.account_number"
                        placeholder="PK00XXXX0000000000000000"
                        maxlength="24"
                        :class="['w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition', (editTouched.account_number && editErrors.account_number) ? 'border-rose-500 bg-rose-50' : 'border-gray-200']"
                        @input="markEditTouched('account_number')"
                        @blur="markEditTouched('account_number')"
                    />
                    <span v-if="editTouched.account_number && editErrors.account_number" class="text-xs text-rose-500 mt-1 block">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ editErrors.account_number }}
                </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex-shrink-0 w-full bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-end gap-2 sm:gap-3" style="padding: 1rem 2rem; border-radius: 0 0 2rem 2rem; background: white;">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
                type="button"
                @click="closeEditModal"
                class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition bg-white w-full sm:w-auto"
            >
              Cancel
            </button>

            <button
                type="button"
                @click="toggleMoreEdit"
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-buttonTextColor shadow-sm transition flex items-center justify-center gap-2 btn-primary-gradient w-full sm:w-auto"
            >
              <i v-if="showMoreEdit" class="fas fa-chevron-up text-xs"></i>
              <i v-else class="fas fa-chevron-down text-xs"></i>
              {{ showMoreEdit ? 'Show less' : 'More details' }}
            </button>

            <button
                type="submit"
                form="edit-employee-form"
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-buttonTextColor shadow-sm transition btn-primary-gradient w-full sm:w-auto"
                :disabled="!isEditFormValid || isUpdating"
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
        title="View Employee"
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
    <!-- Status Change Confirmation Modal -->
    <CreateModal
        :is-open="showStatusConfirmModal"
        mode="confirm"
        title="Change Status"
        :loading="isChangingStatus"
        submit-text="Confirm"
        @close="cancelStatusChange"
        @save="confirmStatusChange"

    >
      <div v-if="statusChangeEmployee && selectedNewStatus" class="py-2">
        <!-- Status change -->
        <div class="flex items-center justify-center gap-2 text-sm mb-3">
          <span class="font-medium text-gray-600">{{ getStatusName(getEmployeeStatusId(statusChangeEmployee)) }}</span>
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-gray-400 text-xs" />
          <span class="font-medium" :style="{ color: getStatusColor(selectedNewStatus.id) }">
                {{ selectedNewStatus.name }}
            </span>
        </div>

        <!-- Employee name -->
        <p class="text-center text-sm text-gray-700 mb-3">
          {{ statusChangeEmployee.name }}
        </p>

        <!-- Reason (only show for Resign, or always show but mark optional) -->
        <div v-if="selectedNewStatus.name.toLowerCase() === 'resign'" class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-600">Reason <span class="text-red-500">*</span></label>
          <textarea
              v-model="statusFeedback"
              rows="2"
              placeholder="Reason for resignation..."
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition resize-none"
              :class="{ 'border-red-500 focus:ring-red-500': statusChangeError }"
          ></textarea>
          <p v-if="statusChangeError" class="text-xs text-red-500">{{ statusChangeError }}</p>
        </div>

      </div>
    </CreateModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DashboardHeader from '../../../components/header.vue';
import StateCard from '../../../components/StatCard.vue';
import AdminSidebar from '../../../components/adminSidebar.vue';
import AppSkeleton from '@/components/AppSkeleton.vue';
import CreateModal from '../../../components/baseModal.vue';
import EmployeeRegistrationModelForm from '@/pages/admin/Employee/employeeRegistrationModel.vue';
import EmployeeBaseModal from '@/components/employeeBaseModel.vue';
import { useEmployeeDashboard } from '@/composables/useEmployeeDashboard.js';

const userName = ref('System Administrator');

// Use the composable - all logic is here
const {
  employees,
  isLoading,
  errorMessage,
  searchQuery,
  currentPage,
  pageSize,
  totalPages,
  statsSummary,
  sortBy,
  sortDirection,
  toggleSort,
  loadEmployees,
  pageNumbers,
  showModal,
  isViewModalOpen,
  showMore,
  viewEmployee,
  isEditModalOpen,
  isUpdating,
  selectedEmployee,
  isCreateModalOpen,
  isCreating,
  showMoreEdit,
  showPassword,
  showConfirmPassword,
  passwordError,
  passwordStrength,
  passwordStrengthClass,
  showStrongMessage,
  statusChangeEmployee,
  showStatusConfirmModal,
  selectedNewStatus,
  statusFeedback,
  isChangingStatus,
  statusChangeError,
  employmentStatuses,
  createFormData,
  editFormData,
  getPasswordRules,
  getStatusColor,
  getStatusBgColor,
  getStatusName,
  getEmployeeStatusId,
  openCreateModal,
  closeCreateModal,
  handleCreateEmployee,
  openEditModal,
  closeEditModal,
  handleUpdateEmployee,
  openViewModal,
  closeViewModal,
  toggleActive,
  handleStatusChange,
  confirmStatusChange,
  cancelStatusChange,
  toggleMoreEdit,
  copyOnboardingLink,
  initialize,
  cleanup,
  createTouched,
  createErrors,
  markCreateTouched,
  isCreateFormValid,
  editTouched,
  editErrors,
  markEditTouched,
  isEditFormValid,
  showOnlyActive
} = useEmployeeDashboard();

// Lifecycle
onMounted(() => {
  initialize();
});

onBeforeUnmount(() => {
  cleanup();
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