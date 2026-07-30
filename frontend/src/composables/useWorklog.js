// composables/useWorklog.js
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
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

  // ==================== VALIDATION STATE ====================
  const ADD_FIELDS = ['issue_key', 'start_date', 'start_time', 'end_date', 'end_time', 'worklog_description', 'summary'];
  const EDIT_FIELDS = ['issue_key', 'start_date', 'start_time', 'end_date', 'end_time', 'worklog_description', 'summary'];

  const makeState = (fields, val) => reactive(Object.fromEntries(fields.map(f => [f, val])));

  const fieldErrors = makeState(ADD_FIELDS, '');
  const editFieldErrors = makeState(EDIT_FIELDS, '');
  const touched = makeState(ADD_FIELDS, false);
  const editTouched = makeState(EDIT_FIELDS, false);

  const resetValidation = (errors, touchedObj) => {
    Object.keys(errors).forEach(k => errors[k] = '');
    Object.keys(touchedObj).forEach(k => touchedObj[k] = false);
  };

  // Clear error for a specific field when user focuses on it
  const clearFieldError = (field) => {
    if (fieldErrors[field] !== undefined) {
      fieldErrors[field] = '';
    }
    if (editFieldErrors[field] !== undefined) {
      editFieldErrors[field] = '';
    }
  };

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

  // ==================== VALIDATION FUNCTIONS ====================
  const MAX_LENGTH = 255;

  const validateField = (field, value) => {
    const trimmed = (value || '').trim();
    if (!trimmed && field === 'summary') {
      return 'Task / title is required.';
    }
    if (!trimmed && (field === 'issue_key' || field === 'start_date' || field === 'start_time' ||
        field === 'end_date' || field === 'end_time')) {
      const labels = {
        issue_key: 'Issue key',
        start_date: 'Start date',
        start_time: 'Start time',
        end_date: 'End date',
        end_time: 'End time',
        summary: 'Task / title',
        worklog_description: 'Description'
      };
      return `${labels[field] || field} is required.`;
    }
    if (field === 'summary' && trimmed.length > MAX_LENGTH) {
      return `Must not exceed ${MAX_LENGTH} characters.`;
    }
    if (field === 'issue_key' && trimmed.length > MAX_LENGTH) {
      return `Must not exceed ${MAX_LENGTH} characters.`;
    }

    return  '';
  };

  const runValidation = (fields, form, errors, touchedObj) => {
    fields.forEach(f => { errors[f] = validateField(f, form[f]); });
    Object.keys(touchedObj).forEach(k => touchedObj[k] = true);
  };

  const validateAllFields = () => {
    ADD_FIELDS.forEach(field => touched[field] = true);
    runValidation(ADD_FIELDS, worklogForm, fieldErrors, touched);

    if (worklogForm.source === 'manual') {
      fieldErrors.issue_key = '';
    } else {
      fieldErrors.summary = '';
    }
  };
  const validateEditAllFields = () => runValidation(EDIT_FIELDS, editWorklogForm, editFieldErrors, editTouched);

  const isFormValid = computed(() => !Object.values(fieldErrors).some(error => error !== ''));
  const isEditFormValid = computed(() => !Object.values(editFieldErrors).some(error => error !== ''));

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
      if (result.jira_sync_error && isJiraAuthError(result.jira_sync_error)) {
        needsJiraLogin.value = true
      } else if (!result.jira_sync_error) {
        const connected = jiraStore.jiraConnected && !jiraStore.jiraExpired
        needsJiraLogin.value = !connected
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || ''
      if (isJiraAuthError(message)) {
        needsJiraLogin.value = true
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
    const selectedMonthKey = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })

    Object.entries(calendarWorklogs.value).forEach(([dateStr, logs]) => {
      const date = new Date(dateStr)
      const isSameMonth = date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()

      if (isSameMonth) {
        logs.forEach(log => {
          if (!grouped[selectedMonthKey]) grouped[selectedMonthKey] = []
          grouped[selectedMonthKey].push({ ...log, date: dateStr })
        })
      }
    })

    if (grouped[selectedMonthKey]) {
      grouped[selectedMonthKey].sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    return [{ month: selectedMonthKey, entries: grouped[selectedMonthKey] || [] }]
  })

  const goToPage = (month, page) => setPage(month, page)

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
  const secondsToHours = (seconds) => Math.round(((Number(seconds) || 0) / 3600) * 100) / 100

  /** e.g. "12.5h" — used for totals so Worklogs and Analytics match. */
  const formatHours = (seconds) => `${secondsToHours(seconds)}h`

  /** Shared "2h 30m" formatter, used both for stored entry seconds and for live start/end diffs. */
  const secondsToDuration = (seconds) => {
    if (!seconds) return '0m'
    const totalMinutes = Math.floor(seconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    return parts.length > 0 ? parts.join(' ') : '0m'
  }
  const formatDuration = secondsToDuration

  // --- Pagination (depends on worklogsByMonth, so comes after it) ---
  const getCurrentPage = (month) => monthPages.value[month] || 1
  const setPage = (month, page) => { monthPages.value[month] = page }

  const paginatedWorklogsByMonth = computed(() => {
    return worklogsByMonth.value.map((group) => {
      const currentPage = getCurrentPage(group.month)
      const totalPages = Math.max(1, Math.ceil(group.entries.length / PAGE_SIZE.value))
      const start = (currentPage - 1) * PAGE_SIZE.value
      const paginatedEntries = group.entries.slice(start, start + PAGE_SIZE.value)

      return { ...group, entries: paginatedEntries, currentPage, totalPages, totalEntries: group.entries.length }
    })
  })

  const setPageSize = (size) => {
    PAGE_SIZE.value = size
    monthPages.value = {}
  }

  watch(paginatedWorklogsByMonth, (groups) => {
    if (groups.length && !activeMonthTab.value) activeMonthTab.value = groups[0].month
  }, { immediate: true })

  const activeGroup = computed(() =>
      paginatedWorklogsByMonth.value.find(g => g.month === activeMonthTab.value) || null
  )

  const nextPage = (month) => {
    const group = paginatedWorklogsByMonth.value.find((g) => g.month === month)
    if (group && group.currentPage < group.totalPages) setPage(month, group.currentPage + 1)
  }

  const prevPage = (month) => {
    const current = getCurrentPage(month)
    if (current > 1) setPage(month, current - 1)
  }

  // --- Searchable issue dropdown (shared factory for Add + Edit forms) ---
  const createIssueSearchController = (formTarget, errorsTarget, touchedTarget) => {
    const searchQuery = ref('')
    const isSelected = ref(false)
    const isDropdownOpen = ref(false)

    const filteredIssues = computed(() => {
      const issues = jiraStore.userIssues || []
      if (!searchQuery.value) return issues
      const query = searchQuery.value.toLowerCase()
      return issues.filter(issue =>
          issue.issue_key.toLowerCase().includes(query) ||
          (issue.summary || '').toLowerCase().includes(query)
      )
    })

    const selectIssue = (issue) => {
      formTarget.issue_key = issue.issue_key
      formTarget.summary = issue.summary || ''
      searchQuery.value = `${issue.issue_key} - ${issue.summary}`
      isDropdownOpen.value = false
      isSelected.value = true
      errorsTarget.issue_key = ''
      touchedTarget.issue_key = true
    }

    const clearSelection = () => {
      formTarget.issue_key = ''
      searchQuery.value = ''
      isSelected.value = false
      errorsTarget.issue_key = validateField('issue_key', '')
    }

    const openDropdown = () => { isDropdownOpen.value = true }
    const closeDropdown = () => {
      setTimeout(() => { isDropdownOpen.value = false }, 150)
    }

    return { searchQuery, isSelected, isDropdownOpen, filteredIssues, selectIssue, clearSelection, openDropdown, closeDropdown }
  }

  const {
    searchQuery: issueSearchQuery,
    isSelected: isIssueSelected,
    isDropdownOpen: isIssueDropdownOpen,
    filteredIssues,
    selectIssue,
    clearSelection: clearIssueSelection,
    openDropdown: openIssueDropdown,
    closeDropdown: closeIssueDropdown,
  } = createIssueSearchController(worklogForm, fieldErrors, touched)

  watch(
      () => worklogForm.start_date,
      (newDate) => { worklogForm.end_date = newDate }
  )

  const loadUserIssues = async () => {
    if (needsJiraLogin.value) return
    const accountId = jiraStore.jiraUser?.account_id
    if (!accountId) return
    try {
      await jiraStore.getUserIssues(accountId)
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || ''
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
    resetValidation(fieldErrors, touched);
  }

  const openAddModal = () => {
    resetForm()
    isAddModalOpen.value = true
  }

  const closeAddModal = () => {
    isAddModalOpen.value = false
    resetValidation(fieldErrors, touched);
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
    return secondsToDuration(Math.floor((end - start) / 1000))
  }

  const durationDisplay = computed(() =>
      calculateDurationDisplay(worklogForm.start_date, worklogForm.start_time, worklogForm.end_date, worklogForm.end_time)
  )

  const handleCreateWorklog = async () => {
    validateAllFields();

    if (!isFormValid.value) {
      const firstError = Object.entries(fieldErrors).find(([_, v]) => v)?.[1];
      showToast('Please fix all validation errors before saving.', 'error');
      return;
    }

    if (worklogForm.source === 'manual' && !worklogForm.summary) {
      fieldErrors.summary = 'Task / title is required for manual entries.';
      touched.summary = true;
      showToast('Please fill all required fields.', 'error');
      return;
    }

    const start = parseDateTime(worklogForm.start_date, worklogForm.start_time);
    const end = parseDateTime(worklogForm.end_date, worklogForm.end_time);
    if (!start || !end || end <= start) {
      showToast('End time must be after start time.', 'error');
      return;
    }

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
        issue_key: isManual ? (worklogForm.issue_key || worklogForm.summary || 'MANUAL') : worklogForm.issue_key,
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
    summary: '',
  })

  // Watch for summary field changes to validate live (Add form)
  watch(
      () => worklogForm.summary,
      (newVal) => {
        if (touched.summary) {
          fieldErrors.summary = validateField('summary', newVal);
        }
      },
      { immediate: true }
  );

  // Watch for summary field changes to validate live (Edit form) - moved AFTER editWorklogForm is defined
  watch(
      () => editWorklogForm.summary,
      (newVal) => {
        if (editTouched.summary) {
          editFieldErrors.summary = validateField('summary', newVal);
        }
      },
      { immediate: true }
  );

  const {
    searchQuery: editIssueSearchQuery,
    isSelected: isEditIssueSelected,
    isDropdownOpen: isEditIssueDropdownOpen,
    filteredIssues: filteredEditIssues,
    selectIssue: selectEditIssue,
    clearSelection: clearEditIssueSelection,
    openDropdown: openEditIssueDropdown,
    closeDropdown: closeEditIssueDropdown,
  } = createIssueSearchController(editWorklogForm, editFieldErrors, editTouched)

  // ISO datetime ("2026-07-22T15:48:00.000+0000") -> input values
  const isoToDateInput = (iso) => (iso ? iso.slice(0, 10) : '')
  const isoToTimeInput = (iso) => (iso ? iso.slice(11, 16) : '')

  const editDurationDisplay = computed(() =>
      calculateDurationDisplay(editWorklogForm.start_date, editWorklogForm.start_time, editWorklogForm.end_date, editWorklogForm.end_time)
  )

  const openEditModal = (entry) => {
    editingWorklogId.value = entry.worklog_id

    editWorklogForm.issue_key = entry.issue_key || ''
    editIssueSearchQuery.value = entry.summary ? `${entry.issue_key} - ${entry.summary}` : (entry.issue_key || '')
    editWorklogForm.start_date = isoToDateInput(entry.started)
    editWorklogForm.start_time = isoToTimeInput(entry.started)
    editWorklogForm.end_date = isoToDateInput(entry.ended) || editWorklogForm.start_date
    editWorklogForm.end_time = isoToTimeInput(entry.ended)
    editWorklogForm.worklog_description = typeof entry.comment === 'string' ? entry.comment : extractCommentText(entry.comment)
    editWorklogForm.summary = entry.summary || ''
    isEditIssueSelected.value = Boolean(editWorklogForm.issue_key)
    isEditIssueDropdownOpen.value = false

    resetValidation(editFieldErrors, editTouched);

    isEditModalOpen.value = true
  }

  const closeEditModal = () => {
    isEditModalOpen.value = false
    editingWorklogId.value = null
    Object.assign(editWorklogForm, {
      issue_key: '', start_date: '', start_time: '', end_date: '', end_time: '', worklog_description: '', summary: ''
    })
    editIssueSearchQuery.value = ''
    isEditIssueSelected.value = false

    resetValidation(editFieldErrors, editTouched);
  }

  watch(
      () => editWorklogForm.start_date,
      (newDate) => { editWorklogForm.end_date = newDate }
  )

  const handleUpdateWorklog = async () => {
    validateEditAllFields();

    if (!isEditFormValid.value) {
      showToast('Please fix all validation errors before saving.', 'error');
      return;
    }

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
        summary: editWorklogForm.summary || '',
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

  const closeDeleteModal = () => { isDeleteModalOpen.value = false }

  const handleDeleteWorklog = async () => {
    if (!selectedWorklog.value) return

    isDeleting.value = true
    try {
      await worklogStore.deleteWorklog(selectedWorklog.value.worklog_id, selectedWorklog.value.issue_key)
      showToast("Worklog deleted successfully!", "success")
      closeDeleteModal()
      await loadCalendarWorklogs()
    } catch (error) {
      console.error("FULL ERROR:", error)
      const message = error?.response?.data?.message || error?.response?.data?.error || "Failed to delete worklog"
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
    const seconds = w.timeSpentSeconds ?? w.time_spent_seconds ?? entry?.time_spent_seconds ?? 0
    const started = w.started || entry?.started || null
    const ended = w.ended || entry?.ended || safeIsoFromStartedSeconds(started, seconds)

    const rawComment = w.comment ?? entry?.comment
    const comment = typeof rawComment === 'string' ? rawComment.trim() : extractCommentText(rawComment)

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
    selectedViewWorklog.value = normalizeWorklogDetail(entry)

    try {
      if (!entry.worklog_id) return

      const response = await worklogStore.getWorklog(entry.worklog_id, entry.issue_key)
      const payload = response?.data?.data || response?.data || response
      if (payload && typeof payload === 'object') {
        selectedViewWorklog.value = normalizeWorklogDetail(entry, payload)
      }
    } catch (error) {
      console.warn('Worklog detail fetch failed, using list data', error)
      if (!selectedViewWorklog.value?.worklog_id) {
        showToast(error?.response?.data?.message || 'Failed to load worklog.', 'error')
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
    const entries = worklogsByMonth.value[0]?.entries || []
    const totalSeconds = entries.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0)
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

    // --- validation ---
    fieldErrors,
    touched,
    editFieldErrors,
    editTouched,
    isFormValid,
    isEditFormValid,
    validateField,
    validateAllFields,
    validateEditAllFields,
    clearFieldError,
  };
}