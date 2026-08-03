import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as XLSX from 'xlsx'
import { useAttendanceStore } from '../stores/attendanceStore.js'
import { useToast } from '@/composables/useToast'
function buildPageNumbers(current, total) {
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    let leftStart = current <= 2 ? 1 : current - 1
    leftStart = Math.min(leftStart, total - 1)
    const leftEnd = Math.min(leftStart + 1, total)
    const left = leftStart === leftEnd ? [leftStart] : [leftStart, leftEnd]

    const rightStart = total - 1
    const rightEnd = total
    let right = rightStart === rightEnd ? [rightEnd] : [rightStart, rightEnd]
    right = right.filter((p) => !left.includes(p))

    if (right.length === 0) {
        return [1, '...', ...left]
    }

    return [...left, '...', ...right]
}

// Reusable pagination state for a reactive source array.
function usePagination(sourceRef, initialPageSize = 5) {
    const currentPage = ref(1)
    const pageSize = ref(initialPageSize)
    const pageSizeOptions = [5, 10, 20, 50]

    const totalPages = computed(() => Math.max(1, Math.ceil(sourceRef.value.length / pageSize.value)))
    const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
    const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, sourceRef.value.length))
    const paginatedItems = computed(() => sourceRef.value.slice(startIndex.value, endIndex.value))
    const pageNumbers = computed(() => buildPageNumbers(currentPage.value, totalPages.value))

    function goToPage(page) {
        if (page === '...') return
        currentPage.value = page
    }
    function nextPage() {
        if (currentPage.value < totalPages.value) currentPage.value++
    }
    function prevPage() {
        if (currentPage.value > 1) currentPage.value--
    }

    watch(pageSize, () => { currentPage.value = 1 })
    watch(sourceRef, () => {
        if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    })

    return {
        currentPage, pageSize, pageSizeOptions, totalPages,
        startIndex, endIndex, paginatedItems, pageNumbers,
        goToPage, nextPage, prevPage,
    }
}

const AVATAR_GRADIENTS = [
    'var(--color-avatarPurpleBlue)',
    'var(--color-avatarBlue)',
    'var(--color-avatarPinkTeal)',
    'var(--color-avatarTestimonial3)',
]
const gradientCache = new Map()
function gradientFor(key) {
    const str = String(key ?? '')
    if (gradientCache.has(str)) return gradientCache.get(str)
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
    const value = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
    gradientCache.set(str, value)
    return value
}
const initialsCache = new Map()
function computeInitials(name) {
    if (initialsCache.has(name)) return initialsCache.get(name)
    const value = (name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    initialsCache.set(name, value)
    return value
}

function formatClock(value) {
    if (!value) return '—'
    const str = String(value)
    return str.length >= 5 ? str.slice(0, 5) : str
}

function mapEmployeeRow(row) {
    return {
        id: row.id,
        name: row.name,
        empNo: String(row.emp_no ?? row.attendance_id ?? row.employee_number ?? ''),
        dept: row.dept ?? row.department ?? '',
        status: row.today_status ?? row.status ?? null,
        pct: row.attendance_percentage ?? row.pct ?? 0,
        synced: row.last_synced ?? row.synced ?? '-',
        gradient: gradientFor(row.emp_no ?? row.id),
        initials: computeInitials(row.name),
        todayClockIn: formatClock(row.today_clock_in),
        todayClockOut: formatClock(row.today_clock_out),
        todayStatus: row.today_status || null,
        todayInOffice: row.today_in_office,
        todayLocationLabel: row.today_location_label || null,
        workFromHome: Boolean(row.work_from_home),
        todayDistance: row.today_distance_meters,
        todayAddress: row.today_address || '',
        todayLatitude: row.today_latitude,
        todayLongitude: row.today_longitude,
        todayLateMinutes: row.today_late_minutes,
        hasTodayCheckIn: Boolean(row.today_clock_in),
    }
}

function mapHistoryRecord(rec) {
    return {
        id: rec.id,
        date: rec.date,
        status: rec.status,
        timetable: rec.timetable || '',
        late_minutes: rec.late_minutes,
        overtime_hours: rec.overtime_hours,
        in: formatClock(rec.clock_in ?? rec.check_in),
        out: formatClock(rec.clock_out ?? rec.check_out),
        check_in_in_office: rec.check_in_in_office,
        check_in_location_label: rec.check_in_location_label,
        check_in_distance_meters: rec.check_in_distance_meters,
        check_in_address: rec.check_in_address,
        check_in_latitude: rec.check_in_latitude,
        check_in_longitude: rec.check_in_longitude,
        check_out_in_office: rec.check_out_in_office,
        check_out_location_label: rec.check_out_location_label,
        check_out_distance_meters: rec.check_out_distance_meters,
        check_out_address: rec.check_out_address,
        check_out_latitude: rec.check_out_latitude,
        check_out_longitude: rec.check_out_longitude,
        work_from_home: Boolean(rec.work_from_home),
    }
}

export const STATUS_META = {
    present: { label: 'Present', className: 'text-[var(--color-success)] bg-[var(--color-success-subtle)]/20' },
    late: { label: 'Late', className: 'text-[var(--color-danger)] bg-[var(--color-danger-subtle)]' },
    absent: { label: 'Absent', className: 'text-[var(--color-danger)] bg-[var(--color-danger-subtle)]' },
    on_leave: { label: 'On leave', className: 'text-[var(--color-warning)] bg-[var(--color-warning-subtle)]' },
    holiday: { label: 'Holiday', className: 'text-sky-700 bg-sky-100' },
}

export function attendanceBarClass(pct) {
    return { bar: 'bg-chat-bubble-me-gradient', text: 'text-text-primary' }
}

export const historyChips = [
    { value: 'all', label: 'All' },
    { value: 'present', label: 'Present' },
    { value: 'late', label: 'Late' },
    { value: 'absent', label: 'Absent' },
    { value: 'on_leave', label: 'On leave' },
    { value: 'holiday', label: 'Holiday' },
]

const ACCEPTED_EXT = ['csv', 'xlsx', 'xls']
const ALLOWED_COLUMNS = ['emp_no', 'name', 'date', 'timetable', 'clock_in', 'clock_out']
export const COLUMN_LABELS = {
    emp_no: 'Emp No.',
    name: 'Name',
    date: 'Date',
    timetable: 'Timetable',
    clock_in: 'Clock In',
    clock_out: 'Clock Out',
}

function normalizeHeader(h) {
    return h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function getExtension(file) {
    return file.name.split('.').pop()?.toLowerCase() ?? ''
}

export function useAttendance() {
    const store = useAttendanceStore()
    const { isLoading: isLoadingList, isLoadingHistory, isSubmitting: isUploading } = storeToRefs(store)
    const { showToast } = useToast()

    // ---------- list ----------
    const searchQuery = ref('')

    const employees = computed(() => store.employees.map(mapEmployeeRow))

    const filteredEmployees = computed(() => {
        const q = searchQuery.value.trim().toLowerCase()
        if (!q) return employees.value
        return employees.value.filter((e) =>
            e.name.toLowerCase().includes(q) || e.empNo.toLowerCase().includes(q),
        )
    })

    const {
        currentPage: employeesCurrentPage, pageSize: employeesPageSize, pageSizeOptions: employeesPageSizeOptions,
        totalPages: employeesTotalPages, startIndex: employeesStartIndex, endIndex: employeesEndIndex,
        paginatedItems: paginatedEmployees, pageNumbers: employeesPageNumbers,
        goToPage: employeesGoToPage, nextPage: employeesNextPage, prevPage: employeesPrevPage,
    } = usePagination(filteredEmployees, 5)

    watch(searchQuery, () => { employeesCurrentPage.value = 1 })

    async function loadEmployees() {
        try {
            await store.fetchAttendanceList()
        } catch (err) {
            showToast(err?.response?.data?.error || 'Could not load attendance list.', 'error')
        }
    }

    // ---------- upload modal ----------
    const showUploadModal = ref(false)
    const isDragging = ref(false)
    const selectedFile = ref(null)
    const parsedRows = ref([])
    const parseError = ref('')
    const isParsing = ref(false)
    const uploadRequestId = ref(0)

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

    async function parseSpreadsheet(file) {
        const ext = getExtension(file)
        const workbook = ext === 'csv'
            ? XLSX.read(await file.text(), { type: 'string' })
            : XLSX.read(await file.arrayBuffer(), { type: 'array' })

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false })
        if (!rawRows.length) return { header: [], rows: [] }

        const header = Object.keys(rawRows[0]).map(normalizeHeader)
        const rows = rawRows.map((r) => {
            const obj = {}
            Object.keys(r).forEach((k) => {
                const key = normalizeHeader(k)
                if (ALLOWED_COLUMNS.includes(key)) obj[key] = String(r[k] ?? '').trim()
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
        const sampleRows = [{
            'Emp No.': '10',
            Name: 'Sarah Ali',
            Date: '2026-07-20',
            Timetable: 'Morning Shift',
            'Clock In': '09:00 AM',
            'Clock Out': '05:30 PM',
        }]
        const worksheet = XLSX.utils.json_to_sheet(sampleRows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')
        XLSX.writeFile(workbook, 'attendance-upload-sample.xlsx')
    }

    const groupedMatches = computed(() => {
        const grouped = {}
        parsedRows.value.forEach((r) => {
            const num = (r.emp_no || '').toUpperCase()
            if (!num) return
            grouped[num] = (grouped[num] || 0) + 1
        })
        return Object.entries(grouped).map(([empNo, count]) => ({
            empNo,
            count,
            employee: employees.value.find((e) => e.empNo === empNo) || null,
        }))
    })

    const canConfirmUpload = computed(() => !isParsing.value && !isUploading.value && groupedMatches.value.length > 0)

    async function confirmUpload() {
        const result = await store.bulkUploadAttendance(parsedRows.value)
        if (!result.success) {
            showToast(result.error || 'Upload failed. Please try again.', 'error')
            return
        }
        const { data } = result
        showToast(
            `${data.successfully_saved} of ${data.total_rows} rows saved.` +
            (data.skipped_weekend ? ` ${data.skipped_weekend} weekend rows skipped.` : '') +
            (data.failed ? ` ${data.failed} failed.` : ''),
            data.failed ? 'warning' : 'success',
        )
        closeUploadModal()
        await loadEmployees()
    }

    // ---------- history detail (inline, replaces the table — not a modal) ----------
    const currentEmployee = ref(null)
    const historyStatusFilter = ref('all')
    const dateFrom = ref('')
    const dateTo = ref('')

    // When a date range is active, the status chips are hidden in favor of
    // a single "clear date filter" action (see template).
    const hasDateFilter = computed(() => !!(dateFrom.value || dateTo.value))

    const historyRecords = computed(() =>
        (store.currentHistory?.history ?? []).map(mapHistoryRecord),
    )
    const historyStats = computed(() =>
        store.currentHistory?.historyStats ?? { present: 0, late: 0, absent: 0, on_leave: 0, holiday: 0 },
    )

    const {
        currentPage, pageSize: historyPageSize, pageSizeOptions: historyPageSizeOptions,
        totalPages, startIndex: historyStartIndex, endIndex: historyEndIndex,
        paginatedItems: paginatedHistory, pageNumbers,
        goToPage, nextPage: historyNextPage, prevPage: historyPrevPage,
    } = usePagination(historyRecords, 5)

    async function fetchHistory() {
        if (!currentEmployee.value) return
        try {
            await store.fetchAttendanceHistory(currentEmployee.value.id, {
                date_from: dateFrom.value || undefined,
                date_to: dateTo.value || undefined,
                status: historyStatusFilter.value !== 'all' ? historyStatusFilter.value : undefined,
            })
            currentPage.value = 1
        } catch (err) {
            showToast(err?.response?.data?.error || 'Could not load attendance history.', 'error')
        }
    }
    async function openHistory(emp) {
        currentEmployee.value = emp
        historyStatusFilter.value = 'all'
        dateFrom.value = ''
        dateTo.value = ''
        await fetchHistory()
    }
    function closeHistory() {
        currentEmployee.value = null
    }
    function setHistoryStatus(status) {
        historyStatusFilter.value = status
        fetchHistory()
    }
    function applyDateFilter() {
        fetchHistory()
    }
    // Removes the date range and re-runs the query with the status chips
    // back in control (chips reappear automatically via hasDateFilter).
    function clearDateFilter() {
        dateFrom.value = ''
        dateTo.value = ''
        fetchHistory()
    }

    function formatDateLabel(dateStr) {
        const d = new Date(dateStr + 'T00:00:00')
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // ---------- inline status dropdown (present / late / on_leave / absent / holiday) ----------
    const openHistoryStatusId = ref(null)
    const historyDropdownPosition = ref({ top: 0, left: 0 })
    const historyStatusOptions = ['present', 'late', 'on_leave', 'absent', 'holiday']

    function toggleHistoryStatusDropdown(rec, event) {
        if (openHistoryStatusId.value === rec.id) {
            openHistoryStatusId.value = null
            return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const dropdownHeight = 230
        const spaceBelow = window.innerHeight - rect.bottom

        const top = spaceBelow < dropdownHeight
            ? rect.top + window.scrollY - dropdownHeight - 6
            : rect.bottom + window.scrollY + 6

        historyDropdownPosition.value = { top, left: rect.left + window.scrollX }
        openHistoryStatusId.value = rec.id
    }
    function closeHistoryStatusDropdown() {
        openHistoryStatusId.value = null
    }

    const selectedCheckIn = ref(null)
    function openCheckInDetail(rec) {
        selectedCheckIn.value = rec
    }
    function closeCheckInDetail() {
        selectedCheckIn.value = null
    }

    async function updateHistoryStatus(rec, newStatus) {
        if (!rec || rec.status === newStatus) {
            openHistoryStatusId.value = null
            return
        }
        const previousStatus = rec.status
        rec.status = newStatus // optimistic update
        openHistoryStatusId.value = null

        const result = await store.updateAttendanceRecord(rec.id, { status: newStatus })
        if (!result.success) {
            rec.status = previousStatus
            showToast(result.error, 'error')
        } else {
            showToast('Attendance status updated.', 'success')
            await fetchHistory()
        }
    }
    return {
        // list
        isLoadingList, searchQuery, filteredEmployees, loadEmployees,
        employeesCurrentPage, employeesPageSize, employeesPageSizeOptions, employeesTotalPages,
        employeesStartIndex, employeesEndIndex, paginatedEmployees, employeesPageNumbers,
        employeesGoToPage, employeesNextPage, employeesPrevPage,
        // upload modal
        showUploadModal, isDragging, selectedFile, parsedRows, parseError, isParsing, isUploading,
        openUploadModal, closeUploadModal, removeFile, onFileInputChange, onDrop,
        downloadSampleTemplate, groupedMatches, canConfirmUpload, confirmUpload,
        // history detail (inline)
        isLoadingHistory, currentEmployee, historyStatusFilter, dateFrom, dateTo,
        hasDateFilter, clearDateFilter,
        openHistory, closeHistory, setHistoryStatus, applyDateFilter, historyRecords, historyStats,
        currentPage, historyPageSize, historyPageSizeOptions, totalPages,
        historyStartIndex, historyEndIndex, paginatedHistory, pageNumbers,
        goToPage, historyNextPage, historyPrevPage, formatDateLabel,
        // inline status dropdown
        openHistoryStatusId, historyDropdownPosition, historyStatusOptions,
        toggleHistoryStatusDropdown, closeHistoryStatusDropdown, updateHistoryStatus,
        selectedCheckIn, openCheckInDetail, closeCheckInDetail,
    }
}