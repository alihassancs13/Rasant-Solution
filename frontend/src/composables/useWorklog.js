// composables/useWorklog.js
import { ref, reactive, computed, onMounted,onUnmounted, watch } from 'vue'
import { useJiraStore } from '@/stores/jiraStore.js'
import { useWorklogStore } from '@/stores/worklogStore.js'
import { useToast } from '@/composables/useToast.js';

export function useWorklog() {
  const worklogStore = useWorklogStore();
  const { showToast } = useToast();
  const jiraStore = useJiraStore()
  const isMonthPickerOpen = ref(false)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const selectedMonthFilter = ref(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const isAddModalOpen = ref(false)
  const isCreating = ref(false)
  const calendarWorklogs = ref({})
  const isCalendarLoading = ref(false)
  const needsJiraLogin = ref(false)
  const monthPages = ref({})
  const activeMonthTab = ref(null)
  const expandedMonths = ref({})
  const PAGE_SIZE = ref(10)

  const worklogForm = reactive({
    source: 'jira',
    issue_key: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    worklog_description: '',
    summary: '',
  })

  const pickerYear = ref(
  selectedMonthFilter.value
    ? Number(selectedMonthFilter.value.split('-')[0])
    : new Date().getFullYear()
  )

  const displayedMonthLabel = computed(() => {
  if (!selectedMonthFilter.value) return 'Select month'
  const [year, month] = selectedMonthFilter.value.split('-')
  const idx = Number(month) - 1
  return `${monthNames[idx]} ${year}`
})

const isSelectedMonth = (idx) => {
  if (!selectedMonthFilter.value) return false
  const [year, month] = selectedMonthFilter.value.split('-')
  return Number(year) === pickerYear.value && Number(month) - 1 === idx
}

const selectMonth = (idx) => {
  const monthStr = String(idx + 1).padStart(2, '0')
  selectedMonthFilter.value = `${pickerYear.value}-${monthStr}`
  isMonthPickerOpen.value = false
}

const isJiraAuthError = (message = '') => {
  const text = String(message || '').toLowerCase()
  return text.includes('jira') && (
    text.includes('not connected') ||
    text.includes('connect first') ||
    text.includes('expired') ||
    text.includes('please connect')
  )
}

const ensureJiraConnected = async () => {
  await jiraStore.checkJiraConnection()
  const connected = jiraStore.jiraConnected && !jiraStore.jiraExpired
  needsJiraLogin.value = !connected
  return connected
}

// close dropdown when clicking outside
const closeMonthPickerOnOutsideClick = (e) => {
  if (!e.target.closest('.month-picker-wrapper')) {
    isMonthPickerOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', closeMonthPickerOnOutsideClick))
onUnmounted(() => document.removeEventListener('click', closeMonthPickerOnOutsideClick))


    const loadCalendarWorklogs = async () => {
    if (!selectedMonthFilter.value) return

    isCalendarLoading.value = true
    try {
      const [year, month] = selectedMonthFilter.value.split('-').map(Number)
      const result = await worklogStore.getCalendarWorklogs(month, year)
      calendarWorklogs.value = result.logs || {}
      // Soft banner only — DB/manual worklogs still load
      if (result.jira_sync_error && isJiraAuthError(result.jira_sync_error)) {
        needsJiraLogin.value = true
      } else if (!result.jira_sync_error) {
        // Connected sync ok (or no jira attempted with empty error after local-only)
        const connected = jiraStore.jiraConnected && !jiraStore.jiraExpired
        needsJiraLogin.value = !connected
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        ''
      if (isJiraAuthError(message)) {
        needsJiraLogin.value = true
        // Still try not to wipe local display — calendar may return empty
        calendarWorklogs.value = {}
      } else {
        showToast('Failed to load worklog calendar', 'error')
      }
    } finally {
      isCalendarLoading.value = false
    }
  }

  const worklogsByMonth = computed(() => {
    const grouped = {}
    const selectedDate = new Date(selectedMonthFilter.value + '-01')
    const selectedMonthKey = selectedDate.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    })

    Object.entries(calendarWorklogs.value).forEach(([dateStr, logs]) => {
      const date = new Date(dateStr)

      // Check if this date belongs to the selected month
      const isSameMonth = date.getMonth() === selectedDate.getMonth() &&
                         date.getFullYear() === selectedDate.getFullYear()

      if (isSameMonth) {
        logs.forEach(log => {
          if (!grouped[selectedMonthKey]) {
            grouped[selectedMonthKey] = []
          }
          grouped[selectedMonthKey].push({ ...log, date: dateStr })
        })
      }
    })

    // Sort entries by date (newest first)
    if (grouped[selectedMonthKey]) {
      grouped[selectedMonthKey].sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    return [{
      month: selectedMonthKey,
      entries: grouped[selectedMonthKey] || []
    }]
  })

  const goToPage = (month, page) => {
    setPage(month, page)
  }

  const activePaginationRange = computed(() => {
    if (!activeGroup.value) return []

    const current = activeGroup.value.currentPage
    const total = activeGroup.value.totalPages
    const range = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) range.push(i)
      return range
    }

    range.push(1)
    if (current > 3) range.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) range.push(i)

    if (current < total - 2) range.push('...')
    range.push(total)

    return range
  })

  const toggleMonth = (monthKey) => {
    expandedMonths.value[monthKey] = !expandedMonths.value[monthKey]
  }

  /** Clock hours from seconds (matches Worklog Analytics: seconds / 3600). */
  const secondsToHours = (seconds) =>
    Math.round(((Number(seconds) || 0) / 3600) * 100) / 100

  /** e.g. "12.5h" — used for totals so Worklogs and Analytics match. */
  const formatHours = (seconds) => `${secondsToHours(seconds)}h`

  /** Entry duration as clock time: "2h 30m" (no workday "d"). */
  const formatDuration = (seconds) => {
    if (!seconds) return '0m'
    const totalMinutes = Math.floor(seconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)

    return parts.length > 0 ? parts.join(' ') : '0m'
  }

  // --- Pagination (depends on worklogsByMonth, so comes after it) ---

  const getCurrentPage = (month) => monthPages.value[month] || 1

  const setPage = (month, page) => {
    monthPages.value[month] = page
  }

  const paginatedWorklogsByMonth = computed(() => {
    return worklogsByMonth.value.map((group) => {
      const currentPage = getCurrentPage(group.month)
      const totalPages = Math.max(1, Math.ceil(group.entries.length / PAGE_SIZE.value))
      const start = (currentPage - 1) * PAGE_SIZE.value
      const paginatedEntries = group.entries.slice(start, start + PAGE_SIZE.value)

      return {
        ...group,
        entries: paginatedEntries,
        currentPage,
        totalPages,
        totalEntries: group.entries.length,
      }
    })
  })

  const setPageSize = (size) => {
    PAGE_SIZE.value = size
    // Reset all months' pages back to 1
    monthPages.value = {}
  }

  watch(paginatedWorklogsByMonth, (groups) => {
    if (groups.length && !activeMonthTab.value) {
      activeMonthTab.value = groups[0].month
    }
  }, { immediate: true })

  const activeGroup = computed(() =>
    paginatedWorklogsByMonth.value.find(g => g.month === activeMonthTab.value) || null
  )

  const nextPage = (month) => {
    const group = paginatedWorklogsByMonth.value.find((g) => g.month === month)
    if (group && group.currentPage < group.totalPages) {
      setPage(month, group.currentPage + 1)
    }
  }

  const prevPage = (month) => {
    const current = getCurrentPage(month)
    if (current > 1) setPage(month, current - 1)
  }

  // --- Searchable issue dropdown state (Add modal) ---
  const issueSearchQuery = ref('')
  const isIssueSelected = ref(false)
  const isIssueDropdownOpen = ref(false)

  const filteredIssues = computed(() => {
    const issues = jiraStore.userIssues || []
    if (!issueSearchQuery.value) return issues
    const query = issueSearchQuery.value.toLowerCase()
    return issues.filter(issue =>
      issue.issue_key.toLowerCase().includes(query) ||
      (issue.summary || '').toLowerCase().includes(query)
    )
  })

  const selectIssue = (issue) => {
    worklogForm.issue_key = issue.issue_key
    issueSearchQuery.value = `${issue.issue_key} - ${issue.summary}`
    isIssueDropdownOpen.value = false
    isIssueSelected.value = true
  }

  const clearIssueSelection = () => {
    worklogForm.issue_key = ''
    issueSearchQuery.value = ''
    isIssueSelected.value = false
  }

  const openIssueDropdown = () => {
    isIssueDropdownOpen.value = true
  }

  watch(
  () => worklogForm.start_date,
  (newDate) => {
    worklogForm.end_date = newDate
  }
)

  const closeIssueDropdown = () => {
    // slight delay so click on list item registers before closing
    setTimeout(() => {
      isIssueDropdownOpen.value = false
    }, 150)
  }

  const loadUserIssues = async () => {
    if (needsJiraLogin.value) return
    const accountId = jiraStore.jiraUser?.account_id
    if (!accountId) return
    try {
      await jiraStore.getUserIssues(accountId)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        ''
      if (isJiraAuthError(message)) {
        needsJiraLogin.value = true
      } else {
        showToast('Failed to load Jira issues', 'error')
      }
    }
  }

  const resetForm = () => {
    Object.assign(worklogForm, {
      source: needsJiraLogin.value ? 'manual' : 'jira',
      issue_key: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      worklog_description: '',
      summary: '',
    })
    issueSearchQuery.value = ''
    isIssueSelected.value = false
  }

  const openAddModal = () => {
    resetForm()
    isAddModalOpen.value = true
  }

  const closeAddModal = () => {
    isAddModalOpen.value = false
  }

  // Converts native <input type="date"> value "YYYY-MM-DD" to "MM/DD/YYYY"
  const formatDateForApi = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${month}/${day}/${year}`
  }

  // Converts native <input type="time"> value "HH:MM" (24h) to "h:mm am/pm"
  const formatTimeForApi = (timeStr) => {
    const [hourStr, minuteStr] = timeStr.split(':')
    let hour = parseInt(hourStr, 10)
    const period = hour >= 12 ? 'pm' : 'am'
    hour = hour % 12 || 12
    return `${hour}:${minuteStr} ${period}`
  }

  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null
    return new Date(`${dateStr}T${timeStr}`)
  }

  // Shared duration formatter for both Add and Edit modals
  const calculateDurationDisplay = (startDate, startTime, endDate, endTime) => {
    const start = parseDateTime(startDate, startTime)
    const end = parseDateTime(endDate, endTime)

    if (!start || !end || end <= start) return ''

    const totalMinutes = Math.floor((end - start) / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)

    return parts.length > 0 ? parts.join(' ') : '0m'
  }

  const durationDisplay = computed(() =>
    calculateDurationDisplay(
      worklogForm.start_date,
      worklogForm.start_time,
      worklogForm.end_date,
      worklogForm.end_time
    )
  )

  const handleCreateWorklog = async () => {
    const isManual = worklogForm.source === 'manual'
    if (isManual) {
      if (!worklogForm.start_date || !worklogForm.start_time || !worklogForm.end_date || !worklogForm.end_time) {
        showToast('Please fill all required fields.', 'error')
        return
      }
    } else if (!worklogForm.issue_key || !worklogForm.start_date || !worklogForm.start_time || !worklogForm.end_date || !worklogForm.end_time) {
      showToast('Please fill all required fields.', 'error')
      return
    }

    isCreating.value = true
    try {
      const payload = {
        source: isManual ? 'manual' : 'jira',
        issue_key: isManual
          ? (worklogForm.issue_key || worklogForm.summary || 'MANUAL')
          : worklogForm.issue_key,
        summary: worklogForm.summary || '',
        start_date: formatDateForApi(worklogForm.start_date),
        start_time: formatTimeForApi(worklogForm.start_time),
        end_date: formatDateForApi(worklogForm.end_date),
        end_time: formatTimeForApi(worklogForm.end_time),
        worklog_description: worklogForm.worklog_description,
      }

      await worklogStore.createWorklog(payload)
      showToast(isManual ? 'Manual worklog saved!' : 'Worklog added successfully!', 'success')
      await loadCalendarWorklogs()
      closeAddModal()

    } catch (error) {
      console.error('FULL ERROR:', error)
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to add worklog'
      if (isJiraAuthError(message)) {
        needsJiraLogin.value = true
        worklogForm.source = 'manual'
        showToast('Jira not connected — switch to Manual, or log in to Jira.', 'error')
      } else {
        showToast(message, 'error')
      }
    } finally {
      isCreating.value = false
    }
  }

  // =====================================================
  // ---------------- EDIT WORKLOG -----------------------
  // =====================================================

  const isEditModalOpen = ref(false)
  const isUpdating = ref(false)
  const editingWorklogId = ref(null)

  const editWorklogForm = reactive({
    issue_key: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    worklog_description: '',
  })

  const editIssueSearchQuery = ref('')
  const isEditIssueSelected = ref(false)
  const isEditIssueDropdownOpen = ref(false)

  // Reuses the same jiraStore.userIssues source as the Add modal's filteredIssues
  const filteredEditIssues = computed(() => {
    const issues = jiraStore.userIssues || []
    if (!editIssueSearchQuery.value) return issues
    const query = editIssueSearchQuery.value.toLowerCase()
    return issues.filter(issue =>
      issue.issue_key.toLowerCase().includes(query) ||
      (issue.summary || '').toLowerCase().includes(query)
    )
  })

  const selectEditIssue = (issue) => {
    editWorklogForm.issue_key = issue.issue_key
    editIssueSearchQuery.value = `${issue.issue_key} - ${issue.summary}`
    isEditIssueDropdownOpen.value = false
    isEditIssueSelected.value = true
  }

  const clearEditIssueSelection = () => {
    editWorklogForm.issue_key = ''
    editIssueSearchQuery.value = ''
    isEditIssueSelected.value = false
  }

  const openEditIssueDropdown = () => {
    isEditIssueDropdownOpen.value = true
  }

  const closeEditIssueDropdown = () => {
    setTimeout(() => {
      isEditIssueDropdownOpen.value = false
    }, 150)
  }

  // ISO datetime ("2026-07-22T15:48:00.000+0000") -> input values
  const isoToDateInput = (iso) => (iso ? iso.slice(0, 10) : '')
  const isoToTimeInput = (iso) => (iso ? iso.slice(11, 16) : '')

  const editDurationDisplay = computed(() =>
    calculateDurationDisplay(
      editWorklogForm.start_date,
      editWorklogForm.start_time,
      editWorklogForm.end_date,
      editWorklogForm.end_time
    )
  )

  const openEditModal = (entry) => {
    editingWorklogId.value = entry.worklog_id

    editWorklogForm.issue_key = entry.issue_key || ''
    editIssueSearchQuery.value = entry.summary
      ? `${entry.issue_key} - ${entry.summary}`
      : (entry.issue_key || '')
    editWorklogForm.start_date = isoToDateInput(entry.started)
    editWorklogForm.start_time = isoToTimeInput(entry.started)
    editWorklogForm.end_date = isoToDateInput(entry.ended) || editWorklogForm.start_date
    editWorklogForm.end_time = isoToTimeInput(entry.ended)
    editWorklogForm.worklog_description =
      typeof entry.comment === 'string'
        ? entry.comment
        : extractCommentText(entry.comment)
    isEditIssueSelected.value = Boolean(editWorklogForm.issue_key)
    isEditIssueDropdownOpen.value = false

    isEditModalOpen.value = true
  }

  const closeEditModal = () => {
    isEditModalOpen.value = false
    editingWorklogId.value = null
    Object.assign(editWorklogForm, {
      issue_key: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      worklog_description: '',
    })
    editIssueSearchQuery.value = ''
    isEditIssueSelected.value = false
  }

  watch(
  () => editWorklogForm.start_date,
  (newDate) => {
    editWorklogForm.end_date = newDate
  }
)

  const handleUpdateWorklog = async () => {
    if (!editingWorklogId.value) return

    if (!editWorklogForm.issue_key || !editWorklogForm.start_date || !editWorklogForm.start_time || !editWorklogForm.end_date || !editWorklogForm.end_time) {
      showToast('Please fill all required fields.', 'error')
      return
    }

    const start = parseDateTime(editWorklogForm.start_date, editWorklogForm.start_time)
    const end = parseDateTime(editWorklogForm.end_date, editWorklogForm.end_time)

    if (!start || !end || end <= start) {
      showToast('End time can not be before start time.', 'error')
      return
    }

    isUpdating.value = true
    try {
      const payload = {
        issue_key: editWorklogForm.issue_key,
        start_date: formatDateForApi(editWorklogForm.start_date),
        start_time: formatTimeForApi(editWorklogForm.start_time),
        end_date: formatDateForApi(editWorklogForm.end_date),
        end_time: formatTimeForApi(editWorklogForm.end_time),
        worklog_description: editWorklogForm.worklog_description,
      }

      await worklogStore.updateWorklog(editingWorklogId.value, payload)
      showToast('Worklog updated successfully!', 'success')
      closeEditModal()
      await loadCalendarWorklogs()
    } catch (error) {
      console.error('FULL ERROR:', error)
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to update worklog'
      if (isJiraAuthError(message)) {
        needsJiraLogin.value = true
        closeEditModal()
      } else {
        showToast(message, 'error')
      }
    } finally {
      isUpdating.value = false
    }
  }


  // =====================================================
  // ---------------- DELETE WORKLOG ----------------------
  // =====================================================
  const isDeleteModalOpen = ref(false)
  const isDeleting = ref(false)
  const selectedWorklog = ref(null)

  const openDeleteModal = (entry) => {
   selectedWorklog.value = entry
   isDeleteModalOpen.value = true
  }

  const closeDeleteModal = () => {
   isDeleteModalOpen.value = false
  }

  const handleDeleteWorklog = async () => {
  if (!selectedWorklog.value) return

  isDeleting.value = true

  try {
    await worklogStore.deleteWorklog(
      selectedWorklog.value.worklog_id,
      selectedWorklog.value.issue_key
    )

    showToast("Worklog deleted successfully!", "success")

    closeDeleteModal()
    await loadCalendarWorklogs()
  } catch (error) {
    console.error("FULL ERROR:", error)

    const message =
      error?.response?.data?.message || error?.response?.data?.error || "Failed to delete worklog"

    if (isJiraAuthError(message)) {
      needsJiraLogin.value = true
      closeDeleteModal()
    } else {
      showToast(message, "error")
    }
  } finally {
    isDeleting.value = false
  }
}

   // =====================================================
  // ---------------- VIEW WORKLOG ----------------------
  // =====================================================
   const isViewModalOpen = ref(false)
   const isLoadingWorklog = ref(false)
   const selectedViewWorklog = ref(null)
   const formatDateOnly = (iso) => (iso ? iso.slice(0, 10) : 'N/A')


   const extractCommentText = (comment) => {
  if (!comment) return ''
  if (typeof comment === 'string') return comment.trim()
  if (typeof comment !== 'object') return ''
  return (comment.content || [])
    .flatMap(block => (block.content || []).map(node => node.text || ''))
    .join(' ')
    .trim()
}

const safeIsoFromStartedSeconds = (started, seconds) => {
  if (!started || !seconds) return null
  const ms = new Date(started).getTime()
  if (Number.isNaN(ms)) return null
  return new Date(ms + Number(seconds) * 1000).toISOString()
}

const normalizeWorklogDetail = (entry, raw = null) => {
  const w = raw && typeof raw === 'object' ? raw : {}
  const seconds =
    w.timeSpentSeconds ??
    w.time_spent_seconds ??
    entry?.time_spent_seconds ??
    0
  const started = w.started || entry?.started || null
  const ended =
    w.ended ||
    entry?.ended ||
    safeIsoFromStartedSeconds(started, seconds)

  const rawComment = w.comment ?? entry?.comment
  const comment =
    typeof rawComment === 'string'
      ? rawComment.trim()
      : extractCommentText(rawComment)

  return {
    issue_key: w.issue_key || entry?.issue_key || '',
    summary: w.summary || entry?.summary || '',
    worklog_id: w.worklog_id || w.id || entry?.worklog_id || '',
    time_spent: w.timeSpent || w.time_spent || entry?.time_spent || '',
    time_spent_seconds: Number(seconds) || 0,
    started,
    ended,
    comment: comment || '',
    source: w.source || entry?.source || '',
  }
}

const openViewModal = async (entry) => {
  if (!entry) return

  isViewModalOpen.value = true
  isLoadingWorklog.value = true
  // Show calendar row immediately so the modal never looks empty on API mismatch
  selectedViewWorklog.value = normalizeWorklogDetail(entry)

  try {
    if (!entry.worklog_id) return

    const response = await worklogStore.getWorklog(
      entry.worklog_id,
      entry.issue_key
    )
    // Store returns axios body: { success, data } or nested shapes
    const payload = response?.data?.data || response?.data || response
    if (payload && typeof payload === 'object') {
      selectedViewWorklog.value = normalizeWorklogDetail(entry, payload)
    }
  } catch (error) {
    // Keep calendar fallback; only toast if we have nothing useful
    console.warn('Worklog detail fetch failed, using list data', error)
    if (!selectedViewWorklog.value?.worklog_id) {
      showToast(
        error?.response?.data?.message || 'Failed to load worklog.',
        'error'
      )
      isViewModalOpen.value = false
    }
  } finally {
    isLoadingWorklog.value = false
  }
}

   const closeViewModal = () => {
     isViewModalOpen.value = false
     selectedViewWorklog.value = null
   }

    const monthlyStats = computed(() => {
    // Always use the currently selected month filter (not stale tab / all months)
    const entries = worklogsByMonth.value[0]?.entries || []

    const totalSeconds = entries.reduce(
      (sum, e) => sum + (e.time_spent_seconds || 0),
      0
    )

    const uniqueIssues = new Set(entries.map(e => e.issue_key)).size
    const uniqueDays = new Set(entries.map(e => e.date)).size

    return {
      totalHours: formatHours(totalSeconds),
      issuesWorked: uniqueIssues,
      totalEntries: entries.length,
      daysLogged: uniqueDays,
    }
  })

  watch(selectedMonthFilter, async () => {
    monthPages.value = {}
    await loadCalendarWorklogs()
    activeMonthTab.value = worklogsByMonth.value[0]?.month || null
  })

  onMounted(async () => {
    await ensureJiraConnected()
    // Always load local DB calendar (manual + synced). Jira sync runs server-side when connected.
    await loadUserIssues()
    await loadCalendarWorklogs()
  })

  return {
    needsJiraLogin,
    isAddModalOpen,
    isCreating,
    worklogForm,
    openAddModal,
    closeAddModal,
    handleCreateWorklog,
    durationDisplay,
    issueSearchQuery,
    isIssueDropdownOpen,
    filteredIssues,
    selectIssue,
    openIssueDropdown,
    parseDateTime,
    closeIssueDropdown,
    isIssueSelected,
    clearIssueSelection,
    calendarWorklogs,
    isCalendarLoading,
    loadCalendarWorklogs,
    worklogsByMonth,
    expandedMonths,
    toggleMonth,
    formatDuration,
    formatHours,
    secondsToHours,
    paginatedWorklogsByMonth,
    nextPage,
    prevPage,
    activeMonthTab,
    activeGroup,
    goToPage,
    activePaginationRange,
    PAGE_SIZE,
    setPageSize,

    // --- edit worklog ---
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

    // --- delete worklog ---
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
    monthlyStats,
    selectedMonthFilter,

    // --- month picker ---
    isMonthPickerOpen,
    monthNames,
    pickerYear,
    displayedMonthLabel,
    isSelectedMonth,
    selectMonth,

  };
}