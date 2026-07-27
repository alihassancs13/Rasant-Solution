import {computed, onMounted, reactive, ref, watch,nextTick} from 'vue';
import { useJiraStore } from '@/stores/jiraStore';
import { useValidation } from '@/composables/useValidation'

export interface JiraForm {
    email: string
    apiToken: string
    domain: string
}

export interface JiraErrors {
    email?: string
    apiToken?: string
    domain?: string
    issues?: string
    project?: string
    work_type?: string
    reporter?: string
    summary?: string
}

export interface JiraIssue {
    issue_key: string
    issue_id: string
    issue_url: string
    summary: string
    issue_type: string
    issue_type_description: string
    issue_type_icon: string
    status: string
    status_category: string
    status_color: string
    project_key: string
    project_name: string
    project_type: string
    project_avatar: string
    priority: string | null
    due_date: string | null
}

export interface CreateFormData {
    project:{ id: string; key: string; name: string } | null,
    work_type: string;
    status: string | null;
    summary: string;
    priority: string;
    description: string | null;
    assignee: string | null;
    parent: string | null;
    due_date: string;
    teams: string | null;
    start_date: string;
    sprint: string | null;
    reporter:string;
    attachment: File[] | null;
    space_bar: string | null;
    issue_color: string | null;
    e2e_responsible: string | null;
}

export interface StatusMessage {
    title: string;
    messages: string[];
    type: 'success' | 'error' | '';
}

export interface JiraUser {
    success: boolean
    name: string
    email: string
    account_id: string
    avatar: string
    timezone: string
}

export interface ToastMessage {
    title: string;
    messages: string[];
    type: 'success' | 'error' | 'info' | '';
}

export function useJiraConnect() {
    const jiraStore = useJiraStore()
    const { getEmailError } = useValidation()

    const form = ref<JiraForm>({
        email: '',
        apiToken: '',
        domain: ''
    })

    interface Option {
        id: string | number;
        name: string;
        teamId?: string | number;
        displayName?: string;
    }

    const errors = ref<JiraErrors>({})
    const jiraUser = computed(() => jiraStore.jiraUser as JiraUser | null)
    const jiraExpired = computed(() => jiraStore.jiraExpired)
    const userIssues = computed(() => (jiraStore.userIssues as unknown as JiraIssue[]) ?? [])
    const isLoading = computed(() => jiraStore.isLoading)
    const isConnecting = ref(false)
    const chatbotProject = ref('')
    const agentProject   = ref('')
    const isSavingChatbot = ref(false)
    const isSavingAgent = ref(false)
    const showToken = ref(false)
    const activeTab = ref('inProgress')
    const ticketPage = ref(1)
    const ticketsPerPage = ref(5)
    const isIssueModalOpen = ref(false)
    const showColorDropdown = ref(false)
    const isModalLoading = computed(() => jiraStore.isModalLoading)
    const selectedIssue = ref<any>(null)
    const showDeleteIssueConfirm = ref(false)
    const deleteSubtasks = ref(false)
    const isSubmitting = ref(false);
    const isCreateModalOpen = ref(false)
    const issueToDelete = ref<any>(null)
    const isDeleting = ref(false)
    const deleteStatusMessage = ref<{ type: string; messages: string[] }>({ type: '', messages: [] })
    const getAuthToken = () => localStorage.getItem('access_token')
    const API_BASE = import.meta.env.VITE_API_URL
    const createIssueErrors = reactive<Record<string, string[]>>({});
    const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
    const projects = computed<Option[]>(() => jiraStore.projects ?? []);
    const workTypes = computed<Option[]>(() => jiraStore.workTypes ?? []);
    const users = computed<Option[]>(() => jiraStore.users ?? []);
    const statuses = computed<Option[]>(() => jiraStore.statuses ?? []);
    const assignees = computed<Option[]>(() => jiraStore.assignees ?? []);
    const priorities = computed<Option[]>(() => jiraStore.priorities ?? []);
    const attachmentInput = ref<HTMLInputElement | null>(null)
    const sprints = computed<Option[]>(() => jiraStore.sprints ?? []);
    const search = computed<Option[]>(() => jiraStore.search ?? []);
    const teams = computed<Option[]>(() => jiraStore.teams ?? []);
    const issueSearchQuery = ref('')
    const showExpiredBanner = ref(false)
    const showIssueDropdown = ref(false)
    const isWorkTypesLoading = ref(false)
    const isAssigneesLoading = ref(false)
    const isStatusesLoading = ref(false)
    const colorDropdownRef = ref<HTMLElement | null>(null)
    const isProjectsLoading = ref(false)
    const isSprintsLoading = ref(false)
    let searchDebounce: ReturnType<typeof setTimeout>
    const isSaving = ref(false)
    const showCredentialsModal = ref(false)
    const openCredentialsModal = () => {
        const savedUser = jiraStore.jiraUser ?? JSON.parse(localStorage.getItem('jira_user') || 'null')

        if (savedUser) {
            form.value.email = savedUser.email ?? ''
            form.value.domain = savedUser.domain ?? ''
        }
        showCredentialsModal.value = true
        }



    const closeModal = () => {
        showCredentialsModal.value = false
    }

    const handleConnectAndClose = async () => {
        await jiraStore.connectJira()
        if (jiraStore.jiraConnected) {
            showCredentialsModal.value = false
            showToken.value = false
        }
    }
    const issueColors = [
        { value: 'purple',        label: 'Purple',         hex: '#8777D9' },
        { value: 'blue',          label: 'Blue',            hex: '#2684FF' },
        { value: 'teal',          label: 'Teal',            hex: '#00B8D9' },
        { value: 'green',         label: 'Green',           hex: '#36B37E' },
        { value: 'yellow',        label: 'Yellow',          hex: '#FFC400' },
        { value: 'orange',        label: 'Orange',          hex: '#FF8B00' },
        { value: 'red',           label: 'Red',             hex: '#FF5630' },
        { value: 'pink',          label: 'Pink',            hex: '#FF8FBA' },
        { value: 'dark_blue',     label: 'Dark Blue',       hex: '#0747A6' },
        { value: 'dark_teal',     label: 'Dark Teal',       hex: '#008DA6' },
        { value: 'dark_green',    label: 'Dark Green',      hex: '#006644' },
        { value: 'dark_yellow',   label: 'Dark Yellow',     hex: '#FF991F' },
    ]
    const toastMessage = ref<ToastMessage>({
        title: '',
        messages: [],
        type: '',
    });

    const statusMessage = ref<StatusMessage>({
        title: '',
        messages: [],
        type: '',
    });

    const createIssueForm = reactive<CreateFormData>({
        project: null,
        work_type: '',
        status: '',
        summary: '',
        description: '',
        assignee: '',
        priority:'',
        parent: null,
        due_date: '',
        teams: '',
        start_date: '',
        sprint: '',
        reporter: '',
        attachment: [],
        space_bar: '',
        issue_color: '',
        e2e_responsible: ''
    });

    // priority is a string from your API e.g. "Medium", "High", "Low", "Critical"
    const PRIORITY_CONFIG: Record<string, { classes: string; icon: string[] }> = {
        Highest:  { classes: 'bg-red-50 text-red-700 border-red-200',       icon: ['fas', 'angles-up'] },
        High:     { classes: 'bg-orange-50 text-orange-700 border-orange-200', icon: ['fas', 'arrow-up'] },
        Medium:   { classes: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: ['fas', 'equals'] },
        Low:      { classes: 'bg-blue-50 text-blue-700 border-blue-200',     icon: ['fas', 'arrow-down'] },
        Lowest:   { classes: 'bg-gray-50 text-gray-500 border-gray-200',    icon: ['fas', 'angles-down'] },
    }

    const FALLBACK_PRIORITY = { classes: 'bg-gray-50 text-gray-500 border-gray-200', icon: ['fas', 'minus'] }

    const priorityConfig = (priority: string | null) =>
        priority ? (PRIORITY_CONFIG[priority] ?? FALLBACK_PRIORITY) : FALLBACK_PRIORITY

    const showToast = (title: string, messages: string[], type: 'success' | 'error' | 'info') => {
        toastMessage.value = { title, messages, type };
        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (toastMessage.value.title === title) {
                toastMessage.value = { title: '', messages: [], type: '' };
            }
        }, timeout);
    };

    const extractDescription = (description: any): string => {
        if (!description) return 'No description available'
        return description.content
            ?.flatMap((block: any) => block.content ?? [])
            .filter((node: any) => node.type === 'text')
            .map((node: any) => node.text)
            .join('') || 'No description available'
    }


    function isImageFile(mimeType: string): boolean {
        return mimeType.startsWith('image/')
    }

    const switchTab = (tab: string) => {
        activeTab.value = tab
        ticketPage.value = 1
    }

    const tabIssues = computed(() => {
        const all = userIssues.value ?? []
        if (activeTab.value === 'inProgress') return all.filter(i => i.status_category === 'In Progress')
        if (activeTab.value === 'toDo') return all.filter(i => i.status_category === 'To Do')
        if (activeTab.value === 'done') return all.filter(i => i.status_category === 'Done')
        return []
    })

    const paginatedTabIssues = computed(() => {
        const start = (ticketPage.value - 1) * ticketsPerPage.value
        return tabIssues.value.slice(start, start + ticketsPerPage.value)
    })

    const paginationRange = computed(() => {
  const total = totalTicketPages.value
  const current = ticketPage.value
  const delta = 1
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

    const totalTicketPages = computed(() =>
        Math.ceil(tabIssues.value.length / ticketsPerPage.value)
    )

// counts for badges
    const counts = computed(() => ({
        inProgress: (userIssues.value ?? []).filter(i => i.status_category === 'In Progress').length,
        toDo: (userIssues.value ?? []).filter(i => i.status_category === 'To Do').length,
        done: (userIssues.value ?? []).filter(i => i.status_category === 'Done').length,
    }))

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'

        return new Date(dateString).toLocaleString()
    }

    const validate = (): boolean => {
        errors.value = {}

        if (!form.value.email)
            errors.value.email = 'Email is required.'
        else {
            const emailError = getEmailError(form.value.email)
            if (emailError) errors.value.email = emailError
        }

        if (!form.value.apiToken)
            errors.value.apiToken = 'API token is required.'

        if (!form.value.domain)
            errors.value.domain = 'Domain is required.'
        else if (!form.value.domain.includes('.atlassian.net'))
            errors.value.domain = 'Enter a valid domain.'

        return Object.keys(errors.value).length === 0
    }

    const connectJira = async (): Promise<void> => {
        if (!validate()) return

        isConnecting.value = true
        try {
            const response= await jiraStore.connectJira({
                email: form.value.email,
                api_token: form.value.apiToken,
                domain: form.value.domain,
            })


            console.log('Connect response:', response)
            console.log('jiraUser after connect:', jiraStore.jiraUser)

            const accountId = response?.account_id
            console.log('accountId:', accountId)

            if (!accountId) {
                errors.value.domain = 'No account is required.'
                return
            }
            jiraStore.jiraConnected = true
            jiraStore.jiraExpired = false
            showToast('Success', ['JIRA connected successfully.'], 'success')
            showCredentialsModal.value = false
            await jiraStore.getUserIssues(accountId)

        } catch (err: any) {
            const data = err?.response?.data
            const message =
                data?.error
                || data?.messages?.[0]?.message
                || data?.detail
                || 'JIRA connection failed.'

            showToast('Error', [message], 'error')
        } finally {
            isConnecting.value = false
        }
    }

    const fetchUserIssues = async (): Promise<void> => {
        ticketPage.value = 1
        try {
            const accountId = (jiraStore.jiraUser as any)?.account_id
            if (!accountId) return
            await jiraStore.getUserIssues(accountId)
        } catch (err) {
            errors.value.issues = 'Failed to fetch issues'
        }
    }

    const fetchSingleIssue = async (issueKey: string): Promise<void> => {
        try {
            await jiraStore.getSingleIssue(issueKey)
            selectedIssue.value = jiraStore.perIssue
        } catch (err) {
            errors.value.issues = 'Failed to fetch issue details'
        }
    }

    const openIssueModal = async (issueKey: string): Promise<void> => {
        try {
            selectedIssue.value = null
            isIssueModalOpen.value = true
            await jiraStore.getSingleIssue(issueKey)
            selectedIssue.value = jiraStore.perIssue
            if (selectedIssue.value?.attachments?.length) {
                await jiraStore.loadAttachmentPreviews(selectedIssue.value.attachments)
            }
        } catch (err) {
            console.error('Failed to fetch issue detail', err)
        }
    }

    const isFormValid = computed(() => {
        const base =
            createIssueForm.project !== null
            createIssueForm.work_type !== null &&
            createIssueForm.reporter !== null &&
            createIssueForm.summary.trim()
        return Boolean(base);
    });

    const resetCreateIssueForm = () => {
        Object.assign(createIssueForm, {
            project: '',
            work_type: '',
            status: '',
            summary: '',
            description: '',
            assignee: '',
            reporter: '',
            sprint: '',
            priority: '',
            parent: null,
            due_date: '',
            start_date: '',
            story_points: '',
            issue_color: '',
            flagged: false,
            e2e_responsible: '',
            labels: [],
            teams: '',
            fix_versions: [],
            attachment: [],
            linked_worked_items: [],
            space_bar: '',
        });

        issueSearchQuery.value = '';
        showIssueDropdown.value = false;

        statusMessage.value = { title: '', messages: [], type: '' };
        Object.keys(createIssueErrors).forEach(k => delete createIssueErrors[k]);
    };

    const openCreateModal = () => {
        resetCreateIssueForm();
        isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
        isCreateModalOpen.value = false;
        resetCreateIssueForm();
        errors.value = {};
    };

    const handleFileSelect = (event: Event) => {
        const input = event.target as HTMLInputElement
        if (!input.files) return
        const files = Array.from(input.files)
        createIssueForm.attachment = [
            ...(createIssueForm.attachment || []),
            ...files
        ]
        input.value = ''
    }

    const handleFileDrop = (event: DragEvent) => {
        const files = Array.from(event.dataTransfer?.files || [])
        createIssueForm.attachment = [
            ...(createIssueForm.attachment || []),
            ...files
        ]
    }

    const removeAttachment = (index: number) => {
        createIssueForm.attachment?.splice(index, 1)
    }

    const submitCreateIssue = async () => {
        errors.value = {};
        if (!createIssueForm.project) errors.value.project = 'Space is required';
        if (!createIssueForm.work_type) errors.value.work_type = 'Work type is required';
        if (!createIssueForm.reporter) errors.value.reporter = 'Reporter is required';
        if (!createIssueForm.summary.trim()) errors.value.summary = 'Summary is required';

        if (Object.keys(errors.value).length > 0) return;

        if (!isFormValid.value) return;
        isSubmitting.value = true;

        try {
            const formData = new FormData();

            const fields = {
                project_key:        createIssueForm.project?.key,
                issue_type:          createIssueForm.work_type,
                reporter_id:           createIssueForm.reporter,
                summary:            createIssueForm.summary,
                assignee_id:        createIssueForm.assignee,
                sprint_id:          createIssueForm.sprint,
                parent_key:         createIssueForm.parent,
                e2e_responsible_id: createIssueForm.e2e_responsible,
                status:             createIssueForm.status,
                due_date:           createIssueForm.due_date,
                start_date:         createIssueForm.start_date,
                issue_color:        createIssueForm.issue_color,
                description:        createIssueForm.description,
                team_id:            createIssueForm.teams
            };

            // Append scalar fields
            Object.entries(fields).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    formData.append(key, String(value));
                }
            });

            // Append attachments
            createIssueForm.attachment?.forEach(file => formData.append('attachments', file));

            const res = await jiraStore.createUserIssue(formData) as any;
            showToast('Success', [`Issue ${res?.issue_key} created successfully`], 'success');
            closeCreateModal();
            resetCreateIssueForm();

        } catch (err: any) {
            const response = err?.response?.data || err;
            showToast('Error', [response?.message || 'Something went wrong'], 'error');
        } finally {
            isSubmitting.value = false;
        }
    };

    // Open Delete modal
    function openDeleteIssueModal(issue: any) {
        issueToDelete.value = issue
        deleteStatusMessage.value = { type: '', messages: [] }
        showDeleteIssueConfirm.value = true
    }

    // Close Delete modal
    function closeDeleteIssueModal() {
        showDeleteIssueConfirm.value = false
        issueToDelete.value = null
        deleteStatusMessage.value = { type: '', messages: [] }
    }

    // Perform deletion of issue
    async function performDeleteIssue() {
        if (!issueToDelete.value) return
        isDeleting.value = true

        try {
          const  result =  await jiraStore.deleteJiraIssue(issueToDelete.value.issue_key, deleteSubtasks.value )
            showToast('Success', [result?.message],'success')
            setTimeout(() => closeDeleteIssueModal(), 1200)

        } catch (err: any) {
            const data = err.response?.data
            const messages = data?.errorMessages?.length
                ? data.errorMessages
                : [data?.detail || data?.error ||  'Failed to delete issue']
            showToast('Error', messages, 'error')
        } finally {
            isDeleting.value = false
        }
    }

    watch(() => form.value.email, (val) => {
        if (!val) {
            errors.value.email = ''
            return
        }
        errors.value.email = getEmailError(val) || ''
    })

    watch(() => jiraStore.jiraExpired, (val) => {
        if (val) {
            showExpiredBanner.value = true
            setTimeout(() => {
                showExpiredBanner.value = false
            }, 5000)
        }
    })

    watch(() => createIssueForm.project,async (project) => {
        if (project) {
            isWorkTypesLoading.value = true
            isAssigneesLoading.value = true
            isStatusesLoading.value = true
            isSprintsLoading.value = true

            await Promise.all([
                jiraStore.getWorkTypes(project.id).finally(() => isWorkTypesLoading.value = false),
                jiraStore.getAssignees(project.key).finally(() => isAssigneesLoading.value = false),
                jiraStore.getStatuses(project.key).finally(() => isStatusesLoading.value = false),
                jiraStore.getProjectSprints(project.key).finally(() => isSprintsLoading.value = false),
            ])

        }
    })

    onMounted(async () => {
        await jiraStore.checkJiraConnection()

        if (jiraStore.jiraExpired) {
            const savedUser = jiraStore.jiraUser

            if (savedUser) {
                form.value.email = savedUser.email ?? ''
                form.value.domain = savedUser.domain ?? ''

                showExpiredBanner.value = false
                await nextTick()
                showExpiredBanner.value = true

                setTimeout(() => {
                    showExpiredBanner.value = false
                }, 6000)
            }
        } else {
            showExpiredBanner.value = false
        }

        if (jiraStore.jiraConnected && !jiraStore.jiraExpired) {
            isProjectsLoading.value = true
            try {
                await jiraStore.getUserIssues(jiraStore.jiraAccountId)
                await jiraStore.getProjects()
                console.log("Projects:", jiraStore.getProjects)
                await jiraStore.getPriority()
                await jiraStore.getTeams()
            } finally {
                isProjectsLoading.value = false
            }
        }
        // Close color dropdown on outside click
        document.addEventListener('mousedown', (e) => {
            if (!colorDropdownRef.value?.contains(e.target as Node)) {
                showColorDropdown.value = false
            }
        })
    })

    return {
        form,
        errors,
        isConnecting,
        isLoading,
        showToken,
        totalTicketPages,
        ticketsPerPage,
        ticketPage,
        jiraUser,
        activeTab,
        tabIssues,
        selectedIssue,
        isModalLoading,
        isIssueModalOpen,
        paginatedTabIssues,
        counts,
        colorDropdownRef,
        showDeleteIssueConfirm,
        issueToDelete,
        isDeleting,
        deleteStatusMessage,
        createIssueForm,
        teams,
        isSubmitting,
        isFormValid,
        projects,
        workTypes,
        statuses,
        priorities,
        users,
        sprints,
        assignees,
        search,
        isProjectsLoading,
        isWorkTypesLoading,
        isAssigneesLoading,
        isStatusesLoading,
        isSprintsLoading,
        jiraExpired,
        issueSearchQuery,
        showIssueDropdown,
        showCredentialsModal,
        handleConnectAndClose,
        issueColors,
        openCreateModal,
        handleFileDrop,
        handleFileSelect,
        removeAttachment,
        submitCreateIssue,
        isCreateModalOpen,
        closeCreateModal,
        showToast,
        openDeleteIssueModal,
        closeDeleteIssueModal,
        performDeleteIssue,
        showExpiredBanner,
        userIssues,
        API_BASE,
        connectJira,
        priorityConfig,
        toastMessage,
        openCredentialsModal,
        chatbotProject,
        agentProject,
        isSavingChatbot,
        isSavingAgent,
        deleteSubtasks,
        isImageFile,
        IMAGE_EXTENSIONS,
        showColorDropdown,
        getAuthToken,
        extractDescription,
        formatDate,
        fetchSingleIssue,
        closeModal,
        openIssueModal,
        paginationRange,
        switchTab,
        fetchUserIssues,
        jiraStore,
    }
}