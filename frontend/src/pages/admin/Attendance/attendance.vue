<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useToast } from '@/composables/useToast'
import AdminSidebar from '../../../components/adminSidebar.vue'
import DashboardHeader from '../../../components/header.vue'
import BaseModal from '@/components/baseModal.vue'
import BaseDetailModal from '@/components/baseDetailModal.vue'

const { showToast } = useToast()
const employees = ref([
  { name: 'Sarah Ali',   empNo: '10', dept: 'Engineering', status: 'on_leave', pct: 82, synced: '2 days ago', gradient: 'var(--color-avatarPurpleBlue)' },
  { name: 'Ali Raza',    empNo: '11', dept: 'DevOps',       status: 'late',     pct: 91, synced: '2 days ago', gradient: 'var(--color-avatarBlue)' },
  { name: 'Hina Khan',   empNo: '12', dept: 'Product',      status: 'on_leave', pct: 88, synced: '2 days ago', gradient: 'var(--color-avatarPinkTeal)' },
  { name: 'Usman Tariq', empNo: '13', dept: 'Sales',        status: 'present',  pct: 95, synced: '2 days ago', gradient: 'var(--color-avatarTestimonial3)' },
])

const STATUS_META = {
  present:  { label: 'Present',  textVar: 'var(--color-success)', bgVar: 'var(--color-success-subtle)' },
  late:     { label: 'Late',     textVar: 'var(--color-danger)',  bgVar: 'var(--color-danger-subtle)' },
  absent:   { label: 'Absent',   textVar: 'var(--color-danger)',  bgVar: 'var(--color-danger-subtle)' },
  on_leave: { label: 'On leave', textVar: 'var(--color-warning)', bgVar: 'var(--color-warning-subtle)' },
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
const searchQuery = ref('')
const statusFilter = ref('all')
const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'present', label: 'Present' },
  { value: 'on_leave', label: 'On leave' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
]

const filteredEmployees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return employees.value.filter(e => {
    const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.empNo.toLowerCase().includes(q)
    const matchesStatus = statusFilter.value === 'all' || e.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const showUploadModal = ref(false)
const isDragging = ref(false)
const selectedFile = ref(null)
const parsedRows = ref([])
const parseError = ref('')
const isParsing = ref(false)

const uploadRequestId = ref(0)

const ACCEPTED_EXT = ['csv', 'xlsx', 'xls']


const ALLOWED_COLUMNS = ['emp_no', 'name', 'date', 'timetable', 'clock_in', 'clock_out']
const COLUMN_LABELS = {
  emp_no: 'Emp No.',
  name: 'Name',
  date: 'Date',
  timetable: 'Timetable',
  clock_in: 'Clock In',
  clock_out: 'Clock Out',
}

function normalizeHeader(h) {
  return h
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
}

function openUploadModal() {
  showUploadModal.value = true
}
function closeUploadModal() {
  showUploadModal.value = false
  removeFile()
}
function removeFile() {
  selectedFile.value = null
  parsedRows.value = []
  parseError.value = ''
  uploadRequestId.value++
}

function getExtension(file) {
  return file.name.split('.').pop()?.toLowerCase() ?? ''
}

async function parseSpreadsheet(file) {
  const ext = getExtension(file)
  const workbook =
      ext === 'csv'
          ? XLSX.read(await file.text(), { type: 'string' })
          : XLSX.read(await file.arrayBuffer(), { type: 'array' })

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false })
  if (!rawRows.length) return { header: [], rows: [] }

  const header = Object.keys(rawRows[0]).map(normalizeHeader)

  const rows = rawRows.map(r => {
    const obj = {}
    Object.keys(r).forEach(k => {
      const key = normalizeHeader(k)
      if (ALLOWED_COLUMNS.includes(key)) {
        obj[key] = String(r[k] ?? '').trim()
      }
    })
    return obj
  })

  return { header, rows }
}

async function handleFiles(files) {
  if (!files || !files.length) return
  const file = files[0]
  const ext = getExtension(file)

  if (!ACCEPTED_EXT.includes(ext)) {
    const msg = `Unsupported file type ".${ext}". Please upload a .csv, .xlsx, or .xls file.`
    parseError.value = msg
    showToast(msg, 'error')
    selectedFile.value = null
    parsedRows.value = []
    return
  }

  selectedFile.value = file
  parseError.value = ''
  isParsing.value = true
  const requestId = ++uploadRequestId.value

  try {
    const { header, rows } = await parseSpreadsheet(file)

    if (requestId !== uploadRequestId.value) return

    if (!header.includes('emp_no')) {
      const msg = `No "Emp No." column found in the header row. Found columns: ${header.join(', ') || '(none)'}.`
      parseError.value = msg
      showToast(msg, 'error')
      parsedRows.value = []
      return
    }
    parsedRows.value = rows
  } catch (err) {
    if (requestId !== uploadRequestId.value) return
    const msg = 'Could not read this file. Please make sure it is a valid CSV or Excel file.'
    parseError.value = msg
    showToast(msg, 'error')
    parsedRows.value = []
  } finally {
    if (requestId === uploadRequestId.value) isParsing.value = false
  }
}

function onFileInputChange(e) {
  handleFiles(e.target.files)
}
function onDrop(e) {
  isDragging.value = false
  handleFiles(e.dataTransfer?.files ?? null)
}

function downloadSampleTemplate() {
  const sampleRows = [
    {
      'Emp No.': '10',
      Name: 'Sarah Ali',
      Date: '2026-07-20',
      Timetable: 'Morning Shift',
      'Clock In': '09:00 AM',
      'Clock Out': '05:30 PM',
    },
  ]
  const worksheet = XLSX.utils.json_to_sheet(sampleRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')
  XLSX.writeFile(workbook, 'attendance-upload-sample.xlsx')
}

const groupedMatches = computed(() => {
  const grouped = {}
  parsedRows.value.forEach(r => {
    const num = (r.emp_no || '').toUpperCase()
    if (!num) return
    grouped[num] = (grouped[num] || 0) + 1
  })
  return Object.entries(grouped).map(([empNo, count]) => ({
    empNo,
    count,
    employee: employees.value.find(e => e.empNo === empNo) || null,
  }))
})

const canConfirmUpload = computed(() => !isParsing.value && groupedMatches.value.length > 0)

function confirmUpload() {
  console.log('Rows ready to submit:', parsedRows.value)
  showToast(`${parsedRows.value.length} rows parsed and ready to submit.`, 'success')
  closeUploadModal()
}

function buildDummyHistory(empNo) {
  const statuses = ['present', 'present', 'present', 'late', 'present', 'absent', 'on_leave']
  const list = []
  const start = new Date('2026-07-14T00:00:00')
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() - i)
    const status = statuses[(i + empNo.charCodeAt(empNo.length - 1)) % statuses.length]
    const working = status !== 'absent' && status !== 'on_leave'
    list.push({
      date: d.toISOString().slice(0, 10),
      status,
      in: working ? `08:5${i % 5} AM` : '-',
      out: working ? `05:3${i % 5} PM` : '-',
    })
  }
  return list
}

const showHistoryModal = ref(false)
const currentEmployee = ref(null)
const historyRecords = ref([])
const historyStatusFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const pageSize = 8

const historyChips = [
  { value: 'all', label: 'All' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'on_leave', label: 'On leave' },
]

function openHistory(emp) {
  currentEmployee.value = emp
  historyRecords.value = buildDummyHistory(emp.empNo)
  historyStatusFilter.value = 'all'
  currentPage.value = 1

  const dates = historyRecords.value.map(r => r.date).sort()
  dateFrom.value = dates[0]
  dateTo.value = dates[dates.length - 1]

  showHistoryModal.value = true
}
function closeHistory() {
  showHistoryModal.value = false
}
function setHistoryStatus(status) {
  historyStatusFilter.value = status
  currentPage.value = 1
}
function applyDateFilter() {
  currentPage.value = 1
}

const historyIgnoringStatus = computed(() =>
    historyRecords.value.filter(r => r.date >= dateFrom.value && r.date <= dateTo.value),
)
const filteredHistory = computed(() =>
    historyIgnoringStatus.value.filter(
        r => historyStatusFilter.value === 'all' || r.status === historyStatusFilter.value,
    ),
)

const historyStats = computed(() => {
  const counts = { present: 0, late: 0, absent: 0, on_leave: 0 }
  historyIgnoringStatus.value.forEach(r => counts[r.status]++)
  return counts
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / pageSize)))
const paginatedHistory = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  const start = (currentPage.value - 1) * pageSize
  return filteredHistory.value.slice(start, start + pageSize)
})
const pageNumbers = computed(() => {
  const pages = new Set([1, totalPages.value])
  for (let p = currentPage.value - 1; p <= currentPage.value + 1; p++) {
    if (p > 1 && p < totalPages.value) pages.add(p)
  }
  return [...pages].sort((a, b) => a - b)
})
function goToPage(p) {
  currentPage.value = p
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="flex h-screen">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden bg-[var(--color-surface)]">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
            class="w-full"
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Attendance"
            subtitleOverride="Manage employee attendance & records"
        />
      </div>

      <div class="flex-1 overflow-y-auto px-4 pb-16 sm:px-6">
        <div class="max-w-[1180px] mx-auto">
          <!-- Page head -->
          <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 class="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-1">
                Attendance
              </h1>
              <p class="text-[13.5px] text-[var(--color-text-secondary)]">
                Track daily check-ins and manage weekly attendance uploads.
              </p>
            </div>
            <button
                type="button"
                @click="openUploadModal"
                class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold text-white bg-chat-bubble-me-gradient hover:opacity-90 shadow-[0_6px_16px_rgba(27,85,226,0.3)] transition-colors cursor-pointer"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket" class="w-4 h-4" />
              Upload attendance file
            </button>
          </div>

          <!-- Toolbar -->
          <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div class="relative flex-1 min-w-[220px] max-w-[340px]">
              <font-awesome-icon
                  icon="fa-solid fa-magnifying-glass"
                  class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search employee..."
                  class="w-full rounded-full border border-[var(--color-border)] bg-white pl-9 pr-4 py-2.5 text-[13.5px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)]"
              />
            </div>
            <div class="flex gap-1.5 bg-white p-1 rounded-full border border-[var(--color-border)]">
              <button
                  v-for="opt in filterOptions"
                  :key="opt.value"
                  type="button"
                  @click="statusFilter = opt.value"
                  class="px-4 py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer"
                  :class="statusFilter === opt.value
                  ? 'bg-chat-bubble-me-gradient text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
            <table class="w-full border-collapse">
              <thead>
              <tr>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] whitespace-nowrap">Employee</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] whitespace-nowrap">Employee No.</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] whitespace-nowrap">Department</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] whitespace-nowrap">Attendance %</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] whitespace-nowrap">Last synced</th>
                <th class="text-left text-[10.5px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] whitespace-nowrap">History</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="emp in filteredEmployees"
                  :key="emp.empNo"
                  class="hover:bg-[var(--color-surface)]/60"
              >
                <td class="px-4.5 py-3.5 border-b border-[var(--color-border-subtle)]">
                  <div class="flex items-center gap-2.5">
                    <div
                        class="w-9.5 h-9.5 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                        :style="{ background: emp.gradient }"
                    >
                      {{ initials(emp.name) }}
                    </div>
                    <span class="font-semibold text-[var(--color-text-primary)]">{{ emp.name }}</span>
                  </div>
                </td>
                <td class="px-4.5 py-3.5 border-b border-[var(--color-border-subtle)]">
                    <span class="font-mono text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] px-2.5 py-1 rounded-md">
                      {{ emp.empNo }}
                    </span>
                </td>
                <td class="px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] text-[13.5px] text-[var(--color-text-primary)]">
                  {{ emp.dept }}
                </td>

                <td class="px-4.5 py-3.5 border-b border-[var(--color-border-subtle)]">
                  <div class="flex items-center gap-2 min-w-[90px]">
                    <div class="flex-1 h-1.5 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
                      <div class="h-full rounded-full bg-[var(--color-success)]" :style="{ width: emp.pct + '%' }" />
                    </div>
                    <span class="text-[12.5px] font-bold text-[var(--color-text-secondary)] w-8.5">{{ emp.pct }}%</span>
                  </div>
                </td>
                <td class="px-4.5 py-3.5 border-b border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
                  {{ emp.synced }}
                </td>
                <td class="px-4.5 py-3.5 border-b border-[var(--color-border-subtle)]">
                  <button
                      type="button"
                      @click="openHistory(emp)"
                      class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline cursor-pointer"
                  >
                    View <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredEmployees.length">
                <td colspan="7" class="text-center text-[13px] text-[var(--color-text-muted)] py-12">
                  No employees match these filters.
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= UPLOAD MODAL (BaseModal, mode="form") ================= -->
    <BaseModal
        :isOpen="showUploadModal"
        mode="form"
        title="Upload attendance file"
        subtitle="Each row is matched to an employee by their Employee Number."
        submitText="Confirm & add records"
        cancelText="Cancel"
        :loading="isParsing"
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
          class="block border-2 border-dashed rounded-[14px] px-5 py-8 text-center cursor-pointer transition-colors bg-[var(--color-surface)]"
          :class="isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]'"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket" class="w-8 h-8 mx-auto mb-2.5 text-[var(--color-primary)]" />
        <div class="font-bold text-sm text-[var(--color-text-primary)] mb-0.5">Click to upload or drag file here</div>
        <div class="text-[12.5px] text-[var(--color-text-muted)]">.CSV or .XLSX / .XLS — first row must be a header including an Emp No. column</div>
        <input
            id="attendanceFileInput"
            type="file"
            class="hidden"
            accept=".csv,.xlsx,.xls"
            @change="onFileInputChange"
        />
      </label>

      <div v-else class="flex items-center gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.75">
        <font-awesome-icon icon="fa-solid fa-file" class="w-5 h-5 text-[var(--color-primary)] shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{{ selectedFile.name }}</div>
          <div class="text-[11.5px] text-[var(--color-text-muted)]">
            {{ (selectedFile.size / 1024).toFixed(1) }} KB
            <span v-if="isParsing"> · parsing…</span>
          </div>
        </div>
        <button type="button" @click="removeFile" class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 cursor-pointer">
          <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3 flex-wrap bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3.5 py-3 mt-4">
        <div class="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed">
          <span class="font-semibold text-[var(--color-text-primary)]">Required columns:</span>
          {{ Object.values(COLUMN_LABELS).join(' · ') }}
          <br />Any other columns in the file are ignored.
        </div>
        <button
            type="button"
            @click="downloadSampleTemplate"
            class="inline-flex items-center gap-2 shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] hover:opacity-90 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-download" class="w-3.5 h-3.5" />
          Download sample file
        </button>
      </div>

      <div v-if="parseError" class="flex gap-2.25 bg-[var(--color-danger-subtle)] border border-[var(--color-danger-border)] rounded-xl px-3.5 py-3 mt-4">
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
        <p class="text-[12.5px] text-[var(--color-danger)] leading-relaxed m-0">{{ parseError }}</p>
      </div>

      <div v-else-if="groupedMatches.length" class="mt-4.5">
        <div class="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] mb-2.25">
          {{ parsedRows.length }} row{{ parsedRows.length === 1 ? '' : 's' }} found — matched by employee number
        </div>
        <div
            v-for="(m, i) in groupedMatches"
            :key="m.empNo"
            class="flex items-center justify-between px-3 py-2.25 rounded-[10px] text-[13px]"
            :class="i % 2 === 0 ? 'bg-[var(--color-surface)]' : ''"
        >
          <span v-if="m.employee" class="font-semibold flex items-center gap-2 flex-wrap">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />
            {{ m.employee.name }}
            <span class="font-mono text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] px-2.5 py-1 rounded-md">
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

        <div class="flex gap-2.25 bg-[var(--color-primary-subtle)] rounded-xl px-3.5 py-3 mt-4">
          <font-awesome-icon icon="fa-solid fa-circle-info" class="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p class="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed m-0">
            Rows are grouped by Employee Number and appended to that employee's own attendance history — records are never mixed between employees. Unmatched employee numbers are skipped.
          </p>
        </div>
      </div>
    </BaseModal>

    <!-- ================= HISTORY MODAL (BaseDetailModal, mode="view") ================= -->
    <BaseDetailModal
        v-if="currentEmployee"
        :isOpen="showHistoryModal"
        mode="view"
        size="md"
        :title="currentEmployee.name"
        :subtitle="currentEmployee.empNo + ' · ' + currentEmployee.dept"
        @close="closeHistory"
    >
      <div class="flex items-center gap-3 flex-wrap mb-4">
        <div class="flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
          <input
              v-model="dateFrom"
              type="date"
              class="h-9 px-2.5 rounded-lg border border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)]"
          />
          <span class="text-[13px] text-[var(--color-text-muted)]">to</span>
          <input
              v-model="dateTo"
              type="date"
              class="h-9 px-2.5 rounded-lg border border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)]"
          />
        </div>
        <button
            type="button"
            @click="applyDateFilter"
            class="ml-auto rounded-full px-4.5 py-2.25 text-[13px] font-semibold text-white bg-[var(--color-text-primary)] hover:opacity-90 cursor-pointer"
        >
          Apply
        </button>
      </div>

      <div class="flex gap-2 flex-wrap mb-4">
        <span
            v-for="chip in historyChips"
            :key="chip.value"
            @click="setHistoryStatus(chip.value)"
            class="px-4 py-1.75 rounded-full text-[13px] font-semibold cursor-pointer select-none transition-colors border"
            :class="historyStatusFilter === chip.value
            ? 'bg-[var(--color-text-primary)] text-white border-[var(--color-text-primary)]'
            : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-muted)]'"
        >
          {{ chip.label }}
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4.5">
        <div class="bg-[var(--color-surface)] rounded-xl p-3 text-center">
          <div class="text-[19px] font-extrabold" :style="{ color: 'var(--color-success)' }">{{ historyStats.present }}</div>
          <div class="text-[10.5px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">Present</div>
        </div>
        <div class="bg-[var(--color-surface)] rounded-xl p-3 text-center">
          <div class="text-[19px] font-extrabold" :style="{ color: 'var(--color-warning)' }">{{ historyStats.late }}</div>
          <div class="text-[10.5px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">Late</div>
        </div>
        <div class="bg-[var(--color-surface)] rounded-xl p-3 text-center">
          <div class="text-[19px] font-extrabold" :style="{ color: 'var(--color-danger)' }">{{ historyStats.absent }}</div>
          <div class="text-[10.5px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">Absent</div>
        </div>
        <div class="bg-[var(--color-surface)] rounded-xl p-3 text-center">
          <div class="text-[19px] font-extrabold text-[var(--color-text-primary)]">{{ historyStats.on_leave }}</div>
          <div class="text-[10.5px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">On leave</div>
        </div>
      </div>

      <div class="rounded-xl border border-[var(--color-border)] overflow-hidden">
        <table v-if="filteredHistory.length" class="w-full border-collapse">
          <thead>
          <tr>
            <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">Date</th>
            <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">Status</th>
            <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">Check-in</th>
            <th class="text-left text-[10.5px] font-bold uppercase tracking-wide text-[var(--color-text-muted)] px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">Check-out</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="rec in paginatedHistory" :key="rec.date" class="hover:bg-[var(--color-surface)]/60">
            <td class="px-4 py-2.75 text-[13.5px] text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)]">{{ formatDateLabel(rec.date) }}</td>
            <td class="px-4 py-2.75 border-b border-[var(--color-border-subtle)]">
                <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    :style="{ color: STATUS_META[rec.status].textVar, backgroundColor: STATUS_META[rec.status].bgVar }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" style="background: currentColor" />
                  {{ STATUS_META[rec.status].label }}
                </span>
            </td>
            <td class="px-4 py-2.75 text-[13.5px] text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)]">{{ rec.in }}</td>
            <td class="px-4 py-2.75 text-[13.5px] text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)]">{{ rec.out }}</td>
          </tr>
          </tbody>
        </table>
        <p v-else class="text-center text-[13px] text-[var(--color-text-muted)] py-12">No records match these filters.</p>
      </div>

      <div v-if="filteredHistory.length" class="flex items-center justify-between gap-3 flex-wrap mt-4">
        <span class="text-xs text-[var(--color-text-muted)]">
          Showing {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredHistory.length) }} of {{ filteredHistory.length }} records
        </span>
        <div class="flex items-center gap-1">
          <button
              type="button"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              class="min-w-[30px] h-7.5 px-1.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] text-[12.5px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-[var(--color-text-muted)] hover:enabled:text-[var(--color-text-primary)] cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3.5 h-3.5" />
          </button>
          <template v-for="(p, idx) in pageNumbers" :key="p">
            <span v-if="idx > 0 && p - pageNumbers[idx - 1] > 1" class="text-[var(--color-text-muted)] text-[12.5px] px-0.5">&hellip;</span>
            <button
                type="button"
                @click="goToPage(p)"
                class="min-w-[30px] h-7.5 px-1.5 rounded-lg border text-[12.5px] flex items-center justify-center transition-colors cursor-pointer"
                :class="p === currentPage
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'"
            >
              {{ p }}
            </button>
          </template>
          <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
              class="min-w-[30px] h-7.5 px-1.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] text-[12.5px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-[var(--color-text-muted)] hover:enabled:text-[var(--color-text-primary)] cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </BaseDetailModal>
  </div>
</template>