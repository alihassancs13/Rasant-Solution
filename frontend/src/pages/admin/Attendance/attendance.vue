<script setup>
import { onMounted, onUnmounted } from 'vue'
import AdminSidebar from '../../../components/adminSidebar.vue'
import DashboardHeader from '../../../components/header.vue'
import StatCard from "@/components/StatCard.vue";
import {
  useAttendance,
  STATUS_META,
  historyChips,
  COLUMN_LABELS,
  attendanceBarClass,
} from '@/composables/useAttendance'
import BaseModal from '@/components/baseModal.vue'
import BaseDetailModal from '@/components/baseDetailModal.vue'


const {
  isLoadingList, searchQuery, filteredEmployees, loadEmployees,
  employeesCurrentPage, employeesPageSize, employeesPageSizeOptions, employeesTotalPages,
  employeesStartIndex, employeesEndIndex, paginatedEmployees, employeesPageNumbers,
  employeesGoToPage, employeesNextPage, employeesPrevPage,
  showUploadModal, isDragging, selectedFile, parsedRows, parseError, isParsing, isUploading,
  openUploadModal, closeUploadModal, removeFile, onFileInputChange, onDrop,
  downloadSampleTemplate, groupedMatches, canConfirmUpload, confirmUpload,
  isLoadingHistory, currentEmployee, historyStatusFilter, dateFrom, dateTo,
  hasDateFilter, clearDateFilter,
  openHistory, closeHistory, setHistoryStatus, applyDateFilter,
  historyRecords, historyStats,
  currentPage, historyPageSize, historyPageSizeOptions, totalPages,
  historyStartIndex, historyEndIndex, paginatedHistory, pageNumbers,
  goToPage, historyNextPage, historyPrevPage, formatDateLabel,
  openHistoryStatusId, historyDropdownPosition, historyStatusOptions,
  toggleHistoryStatusDropdown, closeHistoryStatusDropdown, updateHistoryStatus,
} = useAttendance()

onMounted(() => {
  loadEmployees()
  document.addEventListener('click', closeHistoryStatusDropdown)
})
onUnmounted(() => document.removeEventListener('click', closeHistoryStatusDropdown))
</script>

<template>
  <div class="flex h-screen">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden bg-surface">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
            class="w-full"
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            :showBack="!!currentEmployee"
            :titleOverride="currentEmployee ? currentEmployee.name : 'Attendance'"
            :subtitleOverride="currentEmployee ? `${currentEmployee.empNo} · ${currentEmployee.dept}` : 'Manage employee attendance & records'"
            @back="closeHistory"
            :iconOverride="['fas', 'user-check']"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">

        <!-- ============ LIST VIEW ============ -->
        <template v-if="!currentEmployee">
          <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 class="text-xl font-extrabold tracking-tight text-text-primary mb-1">
                Attendance
              </h1>
              <p class="text-[13.5px] text-text-secondary">
                Track daily check-ins and manage weekly attendance uploads.
              </p>
            </div>
            <button
                type="button"
                @click="openUploadModal"
                class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold text-white bg-chat-bubble-me-gradient hover:opacity-90 shadow-[0_6px_16px_rgba(27,85,226,0.3)] transition-colors cursor-pointer"
            >
              <font-awesome-icon icon="fa-solid fa-plus" class="w-3.5 h-3.5" />
              Upload attendance file
            </button>
          </div>

          <div class="bg-white border border-border rounded-xl shadow-(--shadow-card) overflow-hidden">
            <div class="flex items-center justify-between gap-4 flex-wrap px-4.5 py-3.5 border-b border-border-subtle">
              <div class="relative flex-1 min-w-[220px] max-w-[340px]">
                <font-awesome-icon
                    icon="fa-solid fa-magnifying-glass"
                    class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search employee..."
                    class="w-full rounded-full border border-border bg-white pl-9 pr-4 py-2.5 text-[13.5px] text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle"
                />
              </div>
              <div class="flex items-center gap-2 text-sm text-text-muted">
                <span>Rows per page</span>
                <div class="relative">
                  <select
                      v-model.number="employeesPageSize"
                      class="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-border rounded-lg text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-subtle"
                  >
                    <option v-for="size in employeesPageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                  <font-awesome-icon icon="fa-solid fa-chevron-down" class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            <table class="w-full border-collapse">
              <thead>
              <tr>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-text-muted px-4.5 py-3.5 border-b border-border-subtle whitespace-nowrap">Employee</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-text-muted px-4.5 py-3.5 border-b border-border-subtle whitespace-nowrap">Employee No.</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-text-muted px-4.5 py-3.5 border-b border-border-subtle whitespace-nowrap">Department</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-text-muted px-4.5 py-3.5 border-b border-border-subtle whitespace-nowrap">Attendance %</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-text-muted px-4.5 py-3.5 border-b border-border-subtle whitespace-nowrap">Last synced</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="emp in paginatedEmployees"
                  :key="emp.empNo"
                  @click="openHistory(emp)"
                  class="hover:bg-surface/60 cursor-pointer"
              >
                <td class="px-4.5 py-3.5 border-b border-border-subtle">
                  <div class="flex items-center gap-2.5">
                    <div
                        class="w-9.5 h-9.5 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                        :style="{ background: emp.gradient }"
                    >
                      {{ emp.initials }}
                    </div>
                    <span class="font-semibold text-text-primary">{{ emp.name }}</span>
                  </div>
                </td>
                <td class="px-4.5 py-3.5 border-b border-border-subtle">
                      <span class="font-mono text-xs font-semibold bg-surface border border-border text-text-secondary px-2.5 py-1 rounded-md">
                        {{ emp.empNo }}
                      </span>
                </td>
                <td class="px-4.5 py-3.5 border-b border-border-subtle text-[13.5px] text-text-primary">
                  {{ emp.dept }}
                </td>
                <td class="px-4.5 py-3.5 border-b border-border-subtle">
                  <div class="flex items-center gap-2 min-w-[90px]">
                    <div class="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                      <div class="h-full rounded-full" :class="attendanceBarClass(emp.pct).bar" :style="{ width: emp.pct + '%' }" />
                    </div>
                    <span class="text-[12.5px] font-bold w-8.5" :class="attendanceBarClass(emp.pct).text">{{ emp.pct }}%</span>
                  </div>
                </td>
                <td class="px-4.5 py-3.5 border-b border-border-subtle text-xs text-text-muted">
                  {{ emp.synced }}
                </td>
              </tr>
              <tr v-if="isLoadingList">
                <td colspan="6" class="text-center text-[13px] text-text-muted py-12">
                  Loading attendance…
                </td>
              </tr>
              <tr v-else-if="!filteredEmployees.length">
                <td colspan="6" class="text-center text-[13px] text-text-muted py-12">
                  No employees match these filters.
                </td>
              </tr>
              </tbody>
            </table>

            <div v-if="filteredEmployees.length" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border-subtle">
                <span class="text-sm text-text-muted whitespace-nowrap">
                  {{ employeesStartIndex + 1 }}–{{ employeesEndIndex }} of {{ filteredEmployees.length }}
                </span>
              <div class="flex items-center gap-1">
                <button
                    @click="employeesPrevPage"
                    :disabled="employeesCurrentPage === 1"
                    class="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Previous page"
                >
                  <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3 h-3" />
                </button>
                <button
                    v-for="(page, idx) in employeesPageNumbers"
                    :key="`${page}-${idx}`"
                    @click="employeesGoToPage(page)"
                    :disabled="page === '...'"
                    class="min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition cursor-pointer"
                    :class="page === employeesCurrentPage
                      ? 'bg-chat-bubble-me-gradient text-white shadow-md'
                      : page === '...' ? 'text-text-muted cursor-default' : 'text-text-secondary border border-border hover:bg-primary-subtle'"
                >
                  {{ page }}
                </button>
                <button
                    @click="employeesNextPage"
                    :disabled="employeesCurrentPage === employeesTotalPages"
                    class="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Next page"
                >
                  <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- ============ DETAIL VIEW ============ -->
        <template v-else>
          <div class="bg-white border border-border rounded-xl shadow-(--shadow-card) overflow-hidden">
            <!-- Stats Cards -->
            <div class="p-4.5 border-b border-border-subtle">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatCard
                    label="Present"
                    :value="historyStats.present"
                    :icon="['fas', 'check-circle']"
                    color="green"
                />
                <StatCard
                    label="Late"
                    :value="historyStats.late"
                    :icon="['fas', 'clock']"
                    color="yellow"
                />
                <StatCard
                    label="Absent"
                    :value="historyStats.absent"
                    :icon="['fas', 'times-circle']"
                    color="red"
                />
                <StatCard
                    label="On Leave"
                    :value="historyStats.on_leave"
                    :icon="['fas', 'calendar-day']"
                    color="teal"
                />
              </div>
            </div>

            <!-- Filters Bar -->
            <div class="flex items-center justify-between gap-3 flex-wrap px-4.5 py-2.5 border-b border-border-subtle bg-surface">
              <!-- Left side: Status filter chips -->
              <div class="flex gap-2 flex-wrap">
                  <span
                      v-for="chip in historyChips"
                      :key="chip.value"
                      @click="setHistoryStatus(chip.value)"
                      class="px-4 py-1.75 rounded-full text-[13px] font-semibold cursor-pointer select-none transition-colors border"
                      :class="historyStatusFilter === chip.value
                      ? 'bg-chat-bubble-me-gradient hover:opacity-90 shadow-[0_6px_16px_rgba(27,85,226,0.3)] transition-colors cursor-pointer text-white border-text-primary'
                      : 'bg-white text-text-secondary border-border hover:border-text-muted'"
                  >
                    {{ chip.label }}
                  </span>
              </div>

              <!-- Right side: Date filter + Rows per page -->
              <div class="flex items-center gap-3 flex-wrap">
                <!-- Clear date filter button (shown when date filter is active) -->
                <button
                    v-if="hasDateFilter"
                    type="button"
                    @click="clearDateFilter"
                    class="inline-flex items-center gap-1.5 px-4 py-1.75 rounded-full text-[13px] font-semibold bg-danger-subtle text-danger hover:opacity-90 cursor-pointer"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" class="w-3 h-3" />
                  Clear
                </button>

                <!-- Date inputs -->
                <div class="flex items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-4 h-4 text-text-muted shrink-0" />
                  <input
                      v-model="dateFrom"
                      type="date"
                      class="h-9 py-5 px-2.5 rounded-lg border border-border text-[13px] text-text-primary bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle"
                  />
                  <span class="text-[13px] text-text-muted">to</span>
                  <input
                      v-model="dateTo"
                      type="date"
                      class="h-9 py-5 px-2.5 rounded-lg border border-border text-[13px] text-text-primary bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-subtle"
                  />
                </div>

                <!-- Apply button -->
                <button
                    type="button"
                    @click="applyDateFilter"
                    :disabled="isLoadingHistory"
                    class="rounded-full px-4.5 py-2.25 text-[13px] font-semibold text-white bg-chat-bubble-me-gradient hover:opacity-90 shadow-[0_6px_16px_rgba(27,85,226,0.3)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>

                <!-- Rows per page dropdown -->
                <div class="flex items-center gap-2 text-[13px] text-text-muted">
                  <span>Rows</span>
                  <div class="relative">
                    <select
                        v-model.number="historyPageSize"
                        class="appearance-none pl-3 pr-7 py-1.5 text-[13px] bg-white border border-border rounded-lg text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-subtle"
                    >
                      <option v-for="size in historyPageSizeOptions" :key="size" :value="size">{{ size }}</option>
                    </select>
                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>

            <!-- History Table -->
            <p v-if="isLoadingHistory" class="text-center text-[13px] text-text-muted py-12">Loading history…</p>
            <table v-else-if="historyRecords.length" class="w-full border-collapse">
              <thead>
              <tr>
                <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-text-muted px-6 py-4 border-b border-border-subtle bg-surface">Date</th>
                <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-text-muted px-6 py-4 border-b border-border-subtle bg-surface">Status</th>
                <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-text-muted px-6 py-4 border-b border-border-subtle bg-surface">Check-in</th>
                <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-text-muted px-6 py-4 border-b border-border-subtle bg-surface">Check-out</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="rec in paginatedHistory" :key="rec.date" class="hover:bg-surface/60">
                <td class="px-6 py-4 text-[13.5px] text-text-primary border-b border-border-subtle">{{ formatDateLabel(rec.date) }}</td>
                <td class="px-6 py-4 border-b border-border-subtle relative">
                  <button type="button" @click.stop="toggleHistoryStatusDropdown(rec, $event)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border border-transparent hover:shadow-sm"
                          :class="STATUS_META[rec.status].className">
                    {{ STATUS_META[rec.status].label }}
                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-2 h-2 transition-transform opacity-70"
                                       :class="{ 'rotate-180': openHistoryStatusId === rec.id }" />
                  </button>
                </td>
                <td class="px-6 py-4 text-[13.5px] text-text-primary border-b border-border-subtle">{{ rec.in }}</td>
                <td class="px-6 py-4 text-[13.5px] text-text-primary border-b border-border-subtle">{{ rec.out }}</td>
              </tr>
              </tbody>
            </table>
            <p v-else class="text-center text-[13px] text-text-muted py-12">No records match these filters.</p>

            <!-- Pagination -->
            <div v-if="!isLoadingHistory && historyRecords.length" class="flex items-center justify-between gap-3 flex-wrap px-6 py-4 border-t border-border-subtle">
                <span class="text-xs text-text-muted">
                  {{ historyStartIndex + 1 }}–{{ historyEndIndex }} of {{ historyRecords.length }} records
                </span>
              <div class="flex items-center gap-1">
                <button
                    type="button"
                    :disabled="currentPage === 1"
                    @click="historyPrevPage"
                    class="min-w-[30px] h-7.5 px-1.5 rounded-lg border border-border bg-white text-text-secondary text-[12.5px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-text-muted hover:enabled:text-text-primary cursor-pointer"
                >
                  <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3.5 h-3.5" />
                </button>
                <button
                    v-for="(p, idx) in pageNumbers"
                    :key="`${p}-${idx}`"
                    type="button"
                    @click="goToPage(p)"
                    :disabled="p === '...'"
                    class="min-w-[30px] h-7.5 px-1.5 rounded-lg border text-[12.5px] flex items-center justify-center transition-colors cursor-pointer"
                    :class="p === currentPage
                      ? 'bg-primary text-white border-primary'
                      : p === '...' ? 'text-text-muted cursor-default border-transparent' : 'bg-white text-text-secondary border-border hover:border-text-muted hover:text-text-primary'"
                >
                  {{ p }}
                </button>
                <button
                    type="button"
                    :disabled="currentPage === totalPages"
                    @click="historyNextPage"
                    class="min-w-[30px] h-7.5 px-1.5 rounded-lg border border-border bg-white text-text-secondary text-[12.5px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-text-muted hover:enabled:text-text-primary cursor-pointer"
                >
                  <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </template>

      </main>
    </div>

    <!-- Upload modal -->
    <BaseModal
        :isOpen="showUploadModal"
        mode="form"
        title="Upload attendance file"
        subtitle="Each row is matched to an employee by their Employee Number."
        submitText="Confirm & add records"
        cancelText="Cancel"
        :loading="isParsing || isUploading"
        :disabled="!canConfirmUpload"
        @close="closeUploadModal"
        @save="confirmUpload"
    >
      <label
          v-if="!selectedFile"
          for="attendanceFileInput"
          @dragover.prevent="isDragging = true"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          class="block border-2 border-dashed rounded-[14px] px-5 py-8 text-center cursor-pointer transition-colors bg-surface"
          :class="isDragging ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary hover:bg-primary-subtle'"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket" class="w-8 h-8 mx-auto mb-2.5 text-primary" />
        <div class="font-bold text-sm text-text-primary mb-0.5">Click to upload or drag file here</div>
        <div class="text-[12.5px] text-text-muted">.CSV or .XLSX / .XLS — first row must be a header including an Emp No. column</div>
        <input
            id="attendanceFileInput"
            type="file"
            class="hidden"
            accept=".csv,.xlsx,.xls"
            @change="onFileInputChange"
        />
      </label>

      <div v-else class="flex items-center gap-2.5 bg-surface border border-border rounded-xl px-3.5 py-2.75">
        <font-awesome-icon icon="fa-solid fa-file" class="w-5 h-5 text-primary shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-semibold text-text-primary truncate">{{ selectedFile.name }}</div>
          <div class="text-[11.5px] text-text-muted">
            {{ (selectedFile.size / 1024).toFixed(1) }} KB
            <span v-if="isParsing"> · parsing…</span>
            <span v-if="isUploading"> · uploading…</span>
          </div>
        </div>
        <button type="button" @click="removeFile" class="text-text-muted hover:text-text-primary p-1 cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3 flex-wrap bg-surface border border-border rounded-xl px-3.5 py-3 mt-4">
        <div class="text-[12.5px] text-text-secondary leading-relaxed">
          <span class="font-semibold text-text-primary">Required columns:</span>
          {{ Object.values(COLUMN_LABELS).join(' · ') }}
          <br />Any other columns in the file are ignored.
        </div>
        <button
            type="button"
            @click="downloadSampleTemplate"
            class="inline-flex items-center gap-2 shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-primary bg-primary-subtle hover:opacity-90 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-download" class="w-3.5 h-3.5" />
          Download sample file
        </button>
      </div>

      <div v-if="parseError" class="flex gap-2.25 bg-danger-subtle border border-danger-border rounded-xl px-3.5 py-3 mt-4">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-4 h-4 text-danger shrink-0 mt-0.5" />
        <p class="text-[12.5px] text-danger leading-relaxed m-0">{{ parseError }}</p>
      </div>

      <div v-else-if="groupedMatches.length" class="mt-4.5">
        <div class="text-[11px] font-bold uppercase tracking-wide text-text-muted mb-2.25">
          {{ parsedRows.length }} row{{ parsedRows.length === 1 ? '' : 's' }} found — matched by employee number
        </div>
        <div
            v-for="(m, i) in groupedMatches"
            :key="m.empNo"
            class="flex items-center justify-between px-3 py-2.25 rounded-[10px] text-[13px]"
            :class="i % 2 === 0 ? 'bg-surface' : ''"
        >
          <span v-if="m.employee" class="font-semibold flex items-center gap-2 flex-wrap">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="w-3.5 h-3.5 text-success shrink-0" />
            {{ m.employee.name }}
            <span class="font-mono text-xs font-semibold bg-surface border border-border text-text-secondary px-2.5 py-1 rounded-md">
              {{ m.empNo }}
            </span>
          </span>
          <span v-else class="font-semibold flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-3.5 h-3.5 text-[var(--color-danger)] shrink-0" />
            {{ m.empNo }} — no matching employee
          </span>
          <span
              class="font-mono text-xs font-bold px-2.25 py-0.5 rounded-md whitespace-nowrap"
              :style="m.employee
              ? { color: 'var(--color-success)', backgroundColor: 'var(--color-success-subtle)' }
              : { color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-subtle)' }"
          >
            {{ m.count }} record{{ m.count === 1 ? '' : 's' }}
          </span>
        </div>

        <div class="flex gap-2.25 bg-primary-subtle rounded-xl px-3.5 py-3 mt-4">
          <font-awesome-icon icon="fa-solid fa-circle-info" class="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p class="text-[12.5px] text-text-secondary leading-relaxed m-0">
            Rows are grouped by Employee Number and appended to that employee's own attendance history — records are never mixed between employees. Unmatched employee numbers are skipped.
          </p>
        </div>
      </div>
    </BaseModal>

    <!-- Status Dropdown (Teleported to body) -->
    <Teleport to="body">
      <div v-if="openHistoryStatusId !== null"
           class="fixed z-[9999] w-44 bg-white border border-border-subtle rounded-xl shadow-xl py-1.5 overflow-hidden"
           :style="{ top: historyDropdownPosition.top + 'px', left: historyDropdownPosition.left + 'px' }"
           @click.stop>
        <button v-for="s in historyStatusOptions" :key="s" type="button"
                @click="updateHistoryStatus(paginatedHistory.find(r => r.id === openHistoryStatusId), s)"
                class="w-full text-left px-3 py-2 hover:bg-surface transition-colors cursor-pointer flex items-center"
        >
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold w-full justify-center"
                :class="STATUS_META[s].className">
            {{ STATUS_META[s].label }}
          </span>
        </button>
      </div>
    </Teleport>
  </div>
</template>