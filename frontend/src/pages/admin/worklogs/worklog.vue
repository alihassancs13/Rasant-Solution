<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Worklogs"
            subtitleOverride="Compensation, policies & increments"
            :iconOverride="['fas', 'clock']"
        />
      </div>
      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <!-- Soft Jira connect banner (manual worklogs still available) -->
        <div
          v-if="needsJiraLogin"
          class="bg-white border border-[#BFDBFE] rounded-xl shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(74,144,226,0.12)] text-[#1E3A5F] shrink-0">
              <font-awesome-icon :icon="['fab', 'jira']" />
            </div>
            <div>
              <p class="text-sm font-bold text-headingMain">Jira not connected</p>
              <p class="text-xs text-text-muted mt-0.5">
                Connect Jira to sync tickets automatically. You can still add <strong>manual</strong> worklogs below.
              </p>
            </div>
          </div>
          <router-link
            to="/admin/jira"
            class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md btn-primary-gradient whitespace-nowrap"
          >
            <font-awesome-icon :icon="['fab', 'jira']" />
            Go to Jira login
          </router-link>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
              label="Total Hours"
              :value="monthlyStats.totalHours"
              :icon="['fas', 'clock']"
              color="blue"
          />
          <StatCard
              label="Issues Worked"
              :value="monthlyStats.issuesWorked"
              :icon="['fas', 'list-check']"
              color="purple"
          />
          <StatCard
              label="Total Entries"
              :value="monthlyStats.totalEntries"
              :icon="['fas', 'file-lines']"
              color="pink"
          />
          <StatCard
              label="Days Logged"
              :value="monthlyStats.daysLogged"
              :icon="['fas', 'calendar-days']"
              color="teal"
          />
        </div>

        <!-- Full-page loader ONLY on very first load (no data yet) -->
        <div v-if="isCalendarLoading && worklogsByMonth.length === 0">
          <AppSkeleton variant="table" :count="8" />
        </div>

        <!-- Empty state (no data, not loading) -->
        <div v-else-if="worklogsByMonth.length === 0" class="p-16 text-center text-text-muted">
          <font-awesome-icon :icon="['fas', 'clock']" class="text-5xl mb-4 text-slate-300" />
          <h3 class="text-base font-semibold text-slate-700">No worklogs found</h3>
          <button
              @click="openAddModal"
              type="button"
              class="mt-4 inline-flex items-center cursor-pointer gap-2 px-4 py-2 bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
            Add Worklog
          </button>
        </div>

        <!-- Main content: tabs + table always visible once data exists -->
        <div v-else class="space-y-4">
          <!-- Tabs + Add button in the same row -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <!-- Month Filter -->
        <div class="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-border shadow-sm relative month-picker-wrapper">
         <label class="text-sm font-medium text-text-secondary flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-blue-700" />
            Filter by Month
          </label>

         <div class="relative">
           <button
            type="button"
            @click="isMonthPickerOpen = !isMonthPickerOpen"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm
            focus:outline-none focus:ring-2 focus:ring-[#2F6FC4]
            transition-all duration-200 cursor-pointer"
            >
           {{ displayedMonthLabel }}
           <font-awesome-icon :icon="['fas', 'calendar']" class="text-text-muted text-xs" />
          </button>

        <div
           v-if="isMonthPickerOpen"
           class="absolute top-full left-0 mt-1.5 bg-white border border-border rounded-xl shadow-lg z-50 p-3 w-56"
         >
      <!-- Year navigation -->
      <div class="flex items-center justify-between mb-2.5">
        <button
            type="button"
            @click="pickerYear--"
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-xs" />
        </button>
        <span class="text-sm font-semibold text-text-primary">{{ pickerYear }}</span>
        <button
            type="button"
            @click="pickerYear++"
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-xs" />
        </button>
      </div>

      <!-- Month grid -->
      <div class="grid grid-cols-3 gap-1.5">
        <button
            v-for="(m, idx) in monthNames"
            :key="m"
            type="button"
            @click="selectMonth(idx)"
            class="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="isSelectedMonth(idx)
              ? 'bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white'
              : 'text-text-secondary hover:bg-surface'"
        >
          {{ m }}
        </button>
      </div>
    </div>
  </div>
</div>

        <button
         @click="openAddModal"
         type="button"
         class="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white text-sm font-medium rounded-xl border border-primary/20 shadow-md transition-all duration-200 hover:-translate-y-0.5"
         >
         <font-awesome-icon :icon="['fas', 'plus']" />
         Add Worklog
         </button>
       </div>

          <!-- Table box - separate white card below tabs -->
          <div class="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/40 flex-wrap gap-3">
              <div>
              <div class="flex items-center gap-1">
                 <font-awesome-icon :icon="['fas', 'clock']" class="text-gray-600 text-xl"  />
                <h2 class="text-lg font-bold text-text-primary">
                 Worklogs
                </h2>
               </div>
                <p class="text-sm text-text-muted mt-0.5">
                  Time logged against Jira issues for the selected month.
                </p>
              </div>

              <!-- Show entries selector -->
              <div class="flex items-center gap-2 text-sm text-text-muted">
                <span>Show</span>
                <select
                    :value="PAGE_SIZE"
                    @change="setPageSize(Number($event.target.value))"
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
                <span>entries</span>
                <span class="ml-3 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-text-secondary">
                  {{ activeGroup?.entries.length || 0 }} entries
                </span>
              </div>
            </div>

            <div v-if="activeGroup" class="overflow-x-auto">
              <!-- Desktop Table View - hidden on mobile -->
              <table class="w-full text-sm hidden sm:table">
                <thead>
                  <tr class="border-t border-border-subtle">
                    <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Issue</th>
                    <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Date</th>
                    <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Time</th>
                    <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Duration</th>
                    <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Description</th>
                    <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase text-center">Actions</th>
                  </tr>
                </thead>

                <tbody v-if="isCalendarLoading">
                  <tr>
                    <td colspan="7" class="px-4 sm:px-5 py-4">
                      <AppSkeleton variant="table" :count="4" />
                    </td>
                  </tr>
                </tbody>

                <tbody v-else-if="activeGroup.entries.length === 0">
                  <tr>
                    <td colspan="7" class="text-center py-16 text-text-muted">No entries for this month.</td>
                  </tr>
                </tbody>

                <tbody v-else>
                  <tr
                      v-for="entry in activeGroup.entries"
                      :key="entry.worklog_id"
                      class="border-t border-border-subtle hover:bg-surface/50 transition-colors h-12"
                  >
                    <td class="px-4 sm:px-5 py-4 font-bold text-center whitespace-nowrap">
                    <div class="flex justify-left gap-4">
                       <img
                       v-if="entry.issue_type_icon"
                       :src="entry.issue_type_icon"
                       alt="issue type"
                       class="w-4 h-4" />
                    {{ entry.issue_key }}
                      </div>
                    </td>
                    <td class="px-4 sm:px-5 py-4 whitespace-nowrap text-left text-text-secondary">{{ entry.date }}</td>
                    <td class="px-4 sm:px-5 py-4 whitespace-nowrap text-left text-text-secondary">
                      {{ entry.started?.slice(11, 16) }} - {{ entry.ended?.slice(11, 16) }}
                    </td>
                    <td class="px-4 sm:px-5 py-4 whitespace-nowrap text-left font-medium">
                      {{ formatDuration(entry.time_spent_seconds) }}
                    </td>
                    <td class="px-4 sm:px-5 py-4 text-text-secondary text-left max-w-xs truncate" :title="entry.comment">
                      {{ entry.comment || '—' }}
                    </td>

                    <td class="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <div class="flex items-center justify-left gap-1">
                        <button
                            type="button"
                            @click="openEditModal(entry)"
                            title="Edit"
                            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary-subtle hover:text-primary transition-colors text-sm"
                        >
                          <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                        </button>
                        <button
                            type="button"
                            @click="openViewModal(entry)"
                            title="View"
                            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary-subtle hover:text-primary transition-colors text-sm"
                        >
                          <font-awesome-icon :icon="['fas', 'eye']" />
                        </button>
                        <button
                            type="button"
                            @click="openDeleteModal(entry)"
                            :disabled="isDeleting"
                            title="Delete"
                            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Mobile Card View - visible only on mobile -->
              <div class="sm:hidden space-y-3 p-3">
                <div v-if="isCalendarLoading" class="py-2">
                  <AppSkeleton variant="list" :count="4" />
                </div>

                <div v-else-if="activeGroup.entries.length === 0" class="text-center py-8 text-text-muted">
                  <p class="text-sm">No entries for this month.</p>
                </div>

                <div
                  v-else
                  v-for="entry in activeGroup.entries"
                  :key="entry.worklog_id"
                  class="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <!-- Issue Key & Type Icon -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="entry.issue_type_icon"
                        :src="entry.issue_type_icon"
                        alt="issue type"
                        class="w-5 h-5"
                      />
                      <span class="font-bold text-text-primary text-sm">{{ entry.issue_key }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        @click="openEditModal(entry)"
                        title="Edit"
                        class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary-subtle hover:text-primary transition-colors text-sm"
                      >
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                      </button>
                      <button
                        type="button"
                        @click="openViewModal(entry)"
                        title="View"
                        class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary-subtle hover:text-primary transition-colors text-sm"
                      >
                        <font-awesome-icon :icon="['fas', 'eye']" />
                      </button>
                      <button
                        type="button"
                        @click="openDeleteModal(entry)"
                        :disabled="isDeleting"
                        title="Delete"
                        class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </button>
                    </div>
                  </div>

                  <!-- Date -->
                  <div class="flex items-center gap-2 mb-1.5">
                    <font-awesome-icon :icon="['fas', 'calendar-day']" class="text-xs text-text-muted" />
                    <span class="text-sm text-text-secondary">{{ entry.date }}</span>
                  </div>

                  <!-- Time -->
                  <div class="flex items-center gap-2 mb-1.5">
                    <font-awesome-icon :icon="['fas', 'clock']" class="text-xs text-text-muted" />
                    <span class="text-sm text-text-secondary">
                      {{ entry.started?.slice(11, 16) }} - {{ entry.ended?.slice(11, 16) }}
                    </span>
                  </div>

                  <!-- Duration -->
                  <div class="flex items-center gap-2 mb-1.5">
                    <font-awesome-icon :icon="['fas', 'hourglass-half']" class="text-xs text-text-muted" />
                    <span class="text-sm font-medium text-primary">
                      {{ formatDuration(entry.time_spent_seconds) }}
                    </span>
                  </div>

                  <!-- Description -->
                  <div v-if="entry.comment" class="mt-2 pt-2 border-t border-border-subtle">
                   <p class="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">Description</p>
                    <p class="text-sm text-text-secondary line-clamp-2" :title="entry.comment">
                      {{ entry.comment }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Pagination footer -->
              <div
                  v-if="!isCalendarLoading && activeGroup.entries.length > 0 && activeGroup.totalPages > 1"
                  class="pt-4 mt-2 px-4 sm:px-5 pb-4 border-t border-border-subtle flex items-center justify-between flex-wrap gap-3"
              >
                <p class="text-xs text-text-muted">
                  Showing
                  {{ ((activeGroup.currentPage - 1) * PAGE_SIZE) + 1 }}–{{
                    Math.min(activeGroup.currentPage * PAGE_SIZE, activeGroup.entries.length + ((activeGroup.currentPage - 1) * PAGE_SIZE))
                  }}
                  of {{ activeGroup.totalEntries ?? activeGroup.entries.length }}
                </p>
                <div class="flex items-center gap-1 flex-wrap justify-end">
                  <button
                      type="button"
                      :disabled="activeGroup.currentPage === 1"
                      @click="prevPage(activeGroup.month)"
                      class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3 h-3 text-text-secondary" />
                  </button>

                  <template v-for="(page, index) in activePaginationRange" :key="page === '...' ? `ellipsis-${index}` : page">
                    <span v-if="page === '...'" class="w-8 h-8 flex items-center justify-center text-xs text-text-muted">…</span>
                    <button
                        v-else
                        type="button"
                        @click="goToPage(activeGroup.month, page)"
                        :class="activeGroup.currentPage === page
                          ? 'bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white border-transparent'
                          : 'bg-primary-subtle text-primary border-primary/20 hover:bg-primary/10'"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all duration-300"
                    >
                      {{ page }}
                    </button>
                  </template>

                  <button
                      type="button"
                      :disabled="activeGroup.currentPage === activeGroup.totalPages"
                      @click="nextPage(activeGroup.month)"
                      class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Add Worklog Modal -->
      <CreateModal
          :is-open="isAddModalOpen"
          mode="form"
          title="Add Worklog"
          :subtitle="worklogForm.source === 'manual' ? 'Save a manual time entry to the local worklog table.' : 'Log time on a Jira issue (also stored locally).'"
          submit-text="Save worklog"
          :loading="isCreating"
          @close="closeAddModal"
          @save="handleCreateWorklog"
      >
        <form @submit.prevent="handleCreateWorklog" class="grid grid-cols-1 gap-4 text-left text-gray-700">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Entry type</label>
            <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg p-1">
              <button
                  type="button"
                  class="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
                  :class="worklogForm.source === 'jira' ? 'tab-active-gradient text-white' : 'text-gray-500 hover:bg-blue-50'"
                  :disabled="needsJiraLogin"
                  @click="worklogForm.source = 'jira'"
              >
                Jira
              </button>
              <button
                  type="button"
                  class="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer"
                  :class="worklogForm.source === 'manual' ? 'tab-active-gradient text-white' : 'text-gray-500 hover:bg-blue-50'"
                  @click="worklogForm.source = 'manual'"
              >
                Manual
              </button>
            </div>
          </div>

          <div v-if="worklogForm.source === 'manual'" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Task / title <span class="text-red-500">*</span>
            </label>
            <input
                type="text"
                v-model="worklogForm.summary"
                placeholder="e.g. Client meeting, docs, support"
                @focus="clearFieldError('summary')"
                @blur="touched.summary = true; validateField('summary', worklogForm.summary)"
                @input="validateField('summary', worklogForm.summary)"
                class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                :class="touched.summary && fieldErrors.summary ? 'border-red-500' : 'border-gray-200'"
            />
            <p v-if="(touched.summary || !isFormValid) && fieldErrors.summary" class="text-red-500 text-xs mt-1">
              {{ fieldErrors.summary }}
            </p>
            <input type="hidden" v-model="worklogForm.issue_key" />
          </div>

          <div v-else class="flex flex-col gap-1.5 relative">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Issue Key <span class="text-red-500">*</span>
            </label>

            <div class="relative">
              <input
                  type="text"
                  v-model="issueSearchQuery"
                  placeholder="Search issue key..."
                  autocomplete="off"
                  required
                  :readonly="isIssueSelected"
                  @blur="!isIssueSelected && (touched.issue_key = true)"
                  class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                  :class="[
              isIssueSelected ? 'bg-surface cursor-default' : '',
              touched.issue_key && fieldErrors.issue_key ? 'border-red-500' : 'border-gray-200'
            ]"
                  @focus="openIssueDropdown"
                  @input="worklogForm.issue_key = ''; validateField('issue_key', '')"
              />

              <button
                  v-if="isIssueSelected"
                  type="button"
                  @click="clearIssueSelection"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-500 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" />
              </button>
            </div>
            <p v-if="touched.issue_key && fieldErrors.issue_key" class="text-red-500 text-xs mt-1">{{ fieldErrors.issue_key }}</p>

            <ul
                v-if="isIssueDropdownOpen && !isIssueSelected && filteredIssues.length > 0"
                class="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50" >
              <li
                  v-for="issue in filteredIssues"
                  :key="issue.issue_key"
                  class="px-4 py-2 text-sm cursor-pointer hover:bg-surface transition-colors"
                  @mousedown.prevent="selectIssue(issue)"
              >
                <span class="font-bold text-text-primary">{{ issue.issue_key }}</span>
                <span v-if="issue.summary" class="text-text-muted ml-2 text-xs">
            {{ issue.summary }}
          </span>
              </li>
            </ul>

            <div
                v-else-if="isIssueDropdownOpen && !isIssueSelected && issueSearchQuery && filteredIssues.length === 0"
                class="absolute top-full left-0 right-0 mt-1 px-4 py-2 text-sm text-text-muted bg-white border border-gray-200 rounded-xl shadow-lg z-50"
            >
              No matching issues found.
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Start Date <span class="text-red-500">*</span></label>
              <input
                  type="date"
                  v-model="worklogForm.start_date"
                  required
                  @focus="clearFieldError('start_date')"
                  @blur="touched.start_date = true; validateField('start_date', worklogForm.start_date)"
                  @change="validateField('start_date', worklogForm.start_date)"
                  class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                  :class="touched.start_date && fieldErrors.start_date ? 'border-red-500' : 'border-gray-200'"
              />
              <p v-if="touched.start_date && fieldErrors.start_date" class="text-red-500 text-xs mt-1">{{ fieldErrors.start_date }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Start Time <span class="text-red-500">*</span></label>
              <input
                  type="time"
                  v-model="worklogForm.start_time"
                  required
                  @focus="clearFieldError('start_time')"
                  @blur="touched.start_time = true; validateField('start_time', worklogForm.start_time)"
                  @change="validateField('start_time', worklogForm.start_time)"
                  class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                  :class="touched.start_time && fieldErrors.start_time ? 'border-red-500' : 'border-gray-200'"
              />
              <p v-if="touched.start_time && fieldErrors.start_time" class="text-red-500 text-xs mt-1">{{ fieldErrors.start_time }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">End Date <span class="text-red-500">*</span></label>
              <input
                  type="date"
                  v-model="worklogForm.end_date"
                  readonly
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">End Time <span class="text-red-500">*</span></label>
              <input
                  type="time"
                  v-model="worklogForm.end_time"
                  required
                  @focus="clearFieldError('end_time')"
                  @blur="touched.end_time = true; validateField('end_time', worklogForm.end_time)"
                  @change="validateField('end_time', worklogForm.end_time)"
                  class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                  :class="touched.end_time && fieldErrors.end_time ? 'border-red-500' : 'border-gray-200'"
              />
              <p v-if="touched.end_time && fieldErrors.end_time" class="text-red-500 text-xs mt-1">{{ fieldErrors.end_time }}</p>
            </div>
          </div>

          <div v-if="durationDisplay" class="flex items-center gap-2 px-4 py-2.5 bg-primary-subtle rounded-xl text-sm">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-primary" />
            <span class="font-semibold text-primary">Duration: {{ durationDisplay }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
            <textarea
                v-model="worklogForm.worklog_description"
                rows="3"
                placeholder="What did you work on?"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
            ></textarea>
          </div>
        </form>
      </CreateModal>

      <!-- Edit Worklog Modal -->
      <EditModal
          :is-open="isEditModalOpen"
          mode="form"
          title="Edit Worklog"
          subtitle="Update the details for this Jira worklog."
          submit-text="Update worklog"
          :loading="isUpdating"
          @close="closeEditModal"
          @save="handleUpdateWorklog"
      >
        <form @submit.prevent="handleUpdateWorklog" class="grid grid-cols-1 gap-4 text-left text-gray-700">
          <div class="flex flex-col gap-1.5 relative">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Issue Key <span class="text-red-500">*</span>
            </label>

            <div class="relative">
              <input
                  type="text"
                  v-model="editIssueSearchQuery"
                  placeholder="Search issue key..."
                  autocomplete="off"
                  required
                  :readonly="isEditIssueSelected"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
                  :class="{ 'bg-surface cursor-default': isEditIssueSelected }"
                  @focus="openEditIssueDropdown"
                  @blur="closeEditIssueDropdown"
                  @input="editWorklogForm.issue_key = ''"
              />

              <button
                  v-if="isEditIssueSelected"
                  type="button"
                  @click="clearEditIssueSelection"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-500 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" />
              </button>
            </div>

            <ul
                v-if="isEditIssueDropdownOpen && !isEditIssueSelected && filteredEditIssues.length > 0"
                class="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50"
            >
              <li
                  v-for="issue in filteredEditIssues"
                  :key="issue.issue_key"
                  class="px-4 py-2 text-sm cursor-pointer hover:bg-surface transition-colors"
                  @mousedown.prevent="selectEditIssue(issue)"
              >
                <span class="font-bold text-text-primary">{{ issue.issue_key }}</span>
                <span v-if="issue.summary" class="text-text-muted ml-2 text-xs">
                  {{ issue.summary }}
                </span>
              </li>
            </ul>

            <div
                v-else-if="isEditIssueDropdownOpen && !isEditIssueSelected && editIssueSearchQuery && filteredEditIssues.length === 0"
                class="absolute top-full left-0 right-0 mt-1 px-4 py-2 text-sm text-text-muted bg-white border border-gray-200 rounded-xl shadow-lg z-50"
            >
              No matching issues found.
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Start Date <span class="text-red-500">*</span></label>
              <input
                  type="date"
                  v-model="editWorklogForm.start_date"
                  required
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Start Time <span class="text-red-500">*</span></label>
              <input
                  type="time"
                  v-model="editWorklogForm.start_time"
                  required
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">End Date <span class="text-red-500">*</span></label>
              <input
                  type="date"
                  v-model="editWorklogForm.end_date"
                  readonly
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-400">End Time <span class="text-red-500">*</span></label>
              <input
                  type="time"
                  v-model="editWorklogForm.end_time"
                  required
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
              />
            </div>
          </div>

          <div v-if="editDurationDisplay" class="flex items-center gap-2 px-4 py-2.5 bg-primary-subtle rounded-xl text-sm">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-primary" />
            <span class="font-semibold text-primary">Duration: {{ editDurationDisplay }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
            <textarea
                v-model="editWorklogForm.worklog_description"
                rows="3"
                placeholder="What did you work on?"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2F6FC4] transition-all duration-200"
            ></textarea>
          </div>
        </form>
      </EditModal>

      <!-- Delete Worklog Confirmation Modal -->
      <BaseModal
          :is-open="isDeleteModalOpen"
          title="Delete Worklog"
          :item-id="selectedWorklog?.worklog_id"
          submit-text="Delete Worklog"
          mode="delete"
          :loading="isDeleting"
          :disabled="isDeleting"
          @close="closeDeleteModal"
          @save="handleDeleteWorklog"
      >
        <div class="text-center">
          <p class="text-gray-600 mb-4">
            Are you sure you want to delete this worklog for
            <span class="font-semibold font-mono">
              {{ selectedWorklog?.issue_key }}
            </span>?
          </p>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex items-start">
              <font-awesome-icon
                  icon="fa-solid fa-exclamation-triangle"
                  class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
              />
              <p class="text-sm text-yellow-700">
                This action is permanent and cannot be undone.
                The worklog will be removed from Jira permanently.
              </p>
            </div>
          </div>
        </div>
      </BaseModal>

      <BaseDetailModal
          :is-open="isViewModalOpen"
          title="Worklog Details"
          :item-id="selectedWorklog?.worklog_id"
          @close="closeViewModal"
      >
        <!-- Loading -->
        <div v-if="isLoadingWorklog" class="py-2">
          <AppSkeleton variant="form" :count="6" />
        </div>

        <div v-else-if="selectedViewWorklog" class="p-0">

          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-5">
            <div>
              <p class="text-[17px] font-medium text-gray-900 leading-snug">
                {{ selectedViewWorklog.summary }}
              </p>

              <p class="text-xs text-gray-400 mt-1 font-mono">
                {{ selectedViewWorklog.issue_key }}
              </p>
            </div>

            <span
                class="inline-flex items-center px-2.5 py-1 rounded-full
                bg-blue-50 text-blue-700 border border-blue-200
                text-[11px] font-medium uppercase tracking-wide"
            >
              Worklog
            </span>
          </div>

          <!-- Description -->
          <div class="mb-5">
            <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1.5">
              Description
            </label>

            <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed">
              {{ selectedViewWorklog.comment || "No description provided." }}
            </div>
          </div>

          <!-- Details -->
          <div class="grid grid-cols-3 gap-x-6 gap-y-4 border-t border-gray-100 pt-5">

            <!-- Issue -->
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Issue Key
              </label>

              <div class="text-sm text-gray-800">
                {{ selectedViewWorklog.issue_key }}
              </div>
            </div>

            <!-- Worklog -->
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Worklog ID
              </label>

              <div class="text-sm text-gray-800">
                {{ selectedViewWorklog.worklog_id }}
              </div>
            </div>

            <!-- Time -->
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Time Spent
              </label>

              <div class="flex items-center gap-1.5 text-sm text-gray-800">
                <font-awesome-icon
                    :icon="['far', 'clock']"
                    class="w-3.5 h-3.5 text-gray-400"
                />
                {{ selectedViewWorklog.time_spent }}
              </div>
            </div>

            <!-- Started -->
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Started
              </label>

              <div class="flex items-center gap-1.5 text-sm text-gray-800">
                <font-awesome-icon
                    :icon="['far', 'calendar']"
                    class="w-3.5 h-3.5 text-gray-400"
                />
                {{ formatDateOnly(selectedViewWorklog.started) }}
              </div>
            </div>

            <!-- Ended -->
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Ended
              </label>

              <div class="flex items-center gap-1.5 text-sm text-gray-800">
                <font-awesome-icon
                    :icon="['far', 'calendar-check']"
                    class="w-3.5 h-3.5 text-gray-400"
                />
                {{ formatDateOnly(selectedViewWorklog.ended) }}
              </div>
            </div>

            <!-- Seconds -->
            <div>
              <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Duration (Seconds)
              </label>

              <div class="text-sm text-gray-800">
                {{ selectedViewWorklog.time_spent_seconds }}
              </div>
            </div>

          </div>
        </div>
      </BaseDetailModal>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/adminSidebar.vue'
import StatCard from '@/components/statCard.vue'
import TopHeader from '@/components/header.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import CreateModal from '@/components/baseModal.vue'
import BaseModal from '@/components/baseModal.vue'
import BaseDetailModal from '@/components/baseModal.vue'
import EditModal from '@/components/baseModal.vue'
import { useWorklog } from '@/composables/useWorklog.js'

const {
  needsJiraLogin,
  isAddModalOpen,
  isCreating,
  worklogForm,
  openAddModal,
  closeAddModal,
  handleCreateWorklog,
  issueSearchQuery,
  isIssueDropdownOpen,
  filteredIssues,
  selectIssue,
  openIssueDropdown,
  closeIssueDropdown,
  isIssueSelected,
  durationDisplay,
  parseDateTime,
  clearIssueSelection,
  calendarWorklogs,
  isCalendarLoading,
  loadCalendarWorklogs,
  worklogsByMonth,
  expandedMonths,
  toggleMonth,
  formatDuration,
  paginatedWorklogsByMonth,
  nextPage,
  prevPage,
  activeMonthTab,
  activeGroup,
  goToPage,
  activePaginationRange,
  PAGE_SIZE,
  setPageSize,
  monthlyStats,

  // edit worklog
  isEditModalOpen,
  isUpdating,
  editWorklogForm,
  openEditModal,
  closeEditModal,
  handleUpdateWorklog,
  editIssueSearchQuery,
  isEditIssueDropdownOpen,
  filteredEditIssues,
  selectEditIssue,
  openEditIssueDropdown,
  closeEditIssueDropdown,
  isEditIssueSelected,
  clearEditIssueSelection,
  editDurationDisplay,

  // delete worklog
  isDeleteModalOpen,
  isDeleting,
  openDeleteModal,
  closeDeleteModal,
  handleDeleteWorklog,
  selectedWorklog,

  isViewModalOpen,
  isLoadingWorklog,
  openViewModal,
  selectedViewWorklog,
  closeViewModal,
  formatDateOnly,
  selectedMonthFilter,

    isMonthPickerOpen,
    monthNames,
    pickerYear,
    displayedMonthLabel,
    isSelectedMonth,
    selectMonth,
    fieldErrors, touched, validateField, clearFieldError
} = useWorklog()
</script>