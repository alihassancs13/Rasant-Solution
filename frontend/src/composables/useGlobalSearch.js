import { ref,  } from 'vue';
import { useRouter } from 'vue-router';
import { useEmployeeStore } from '@/stores/employeeStore.js';
import { useAttendanceStore } from '@/stores/attendanceStore.js';
import { useInboxStore } from '@/stores/inboxStore.js';
import { useJiraStore } from '@/stores/jiraStore.js';
import { useDocumentStore } from '@/stores/documentStore.js';
import { useCredentialsVaultStore } from '@/stores/credentialsVaultStore.js';
import { useWorklogStore } from '@/stores/worklogStore.js';
import { useInquiriesStore } from '@/stores/useInquiriesStore.js';
import { usePayrollSettingsStore } from '@/stores/payrollStore.js';
import { useLeaveStore } from '@/stores/leaveStore.js';
import { useContactStore } from '@/stores/contactStore.js';
import { useCvStore } from '@/stores/cvStore.js';
import { useJobStore } from '@/stores/jobStore.js';
import { usePolicyStore } from '@/stores/policyStore.js';
import { useOverviewStore } from '@/stores/worklogAnalyticsStore.js';
import { useWorklogAnalyticsStore } from '@/stores/worklogAnalyticsStore.js';
export function useGlobalSearch() {
    const router = useRouter();
    const employeeStore = useEmployeeStore();
    const attendanceStore = useAttendanceStore();
    const inboxStore = useInboxStore();
    const jiraStore = useJiraStore();
    const documentStore = useDocumentStore();
    const vaultStore = useCredentialsVaultStore();
    const worklogStore = useWorklogStore();
    const inquiryStore = useInquiriesStore();
    const payrollStore = usePayrollSettingsStore();
    const leaveStore = useLeaveStore();
    const contactStore = useContactStore();
    const cvStore = useCvStore();
    const jobStore = useJobStore();
    const policyStore = usePolicyStore();
    const overviewStore = useOverviewStore();
    const worklogAnalyticsStore = useWorklogAnalyticsStore();
    const searchQuery = ref('');
    const searchResults = ref([]);
    const showResults = ref(false);
    const isSearching = ref(false);
    let dataLoaded = false;
    const loadAllData = async () => {
        if (dataLoaded) return;
        console.log('Loading data from all modules...');
        const loadPromises = [];
        try {
            if (employeeStore.employees?.length === 0) {
                console.log('Loading employees...');
                loadPromises.push(employeeStore.fetchEmployees().catch(err => console.error('Employee load error:', err)));
            }
            if (inboxStore.conversations?.length === 0) {
                console.log('Loading inbox...');
                loadPromises.push(inboxStore.fetchConversations().catch(err => console.error('Inbox load error:', err)));
            }
            if (inquiryStore.messages?.length === 0) {
                console.log('Loading inquiries...');
                loadPromises.push(inquiryStore.fetchMessages().catch(err => console.error('Inquiries load error:', err)));
            }
            if (jiraStore.projects?.length === 0) {
                console.log('Loading jira...');
                loadPromises.push(jiraStore.getProjects().catch(err => console.error('Jira load error:', err)));
            }
            console.log('Loading documents...');
            try {
                await documentStore.loadAllItems();
                console.log('Documents loaded via loadAllItems:', documentStore.allItems?.length || 0);
            } catch (err) {
                console.error('loadAllItems failed:', err);
                try {
                    await documentStore.loadAllFolders();
                    console.log('Folders loaded:', documentStore.allItems?.length || 0);
                } catch (e) {
                    console.error('loadAllFolders failed:', e);
                }
                try {
                    await documentStore.loadAllFiles();
                    console.log('Files loaded:', documentStore.allItems?.length || 0);
                } catch (e) {
                    console.error('loadAllFiles failed:', e);
                }
            }
            if (documentStore.allItems?.length === 0 && documentStore.viewItems?.length === 0) {
                console.log('Trying to fetch employee documents as fallback...');
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const employeeId = user.employee_id || user.id;
                        if (employeeId) {
                            await documentStore.fetchEmployeeDocuments(employeeId);
                            console.log('Employee documents loaded:', documentStore.viewItems?.length || 0);
                        }
                    }
                } catch (e) {
                    console.error('fetchEmployeeDocuments failed:', e);
                }
            }
            if (!worklogAnalyticsStore.summary) {
                console.log('Loading worklog analytics...');
                loadPromises.push(worklogAnalyticsStore.fetchOverview().catch(err => console.error('Worklog Analytics load error:', err)));
            }
            if (vaultStore.credentials?.length === 0) {
                console.log('Loading vault...');
                loadPromises.push(vaultStore.fetchCredentials().catch(err => console.error('Vault load error:', err)));
            }
            if (Object.keys(worklogStore.calendarWorklogs || {}).length === 0) {
                console.log('Loading worklogs...');
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                loadPromises.push(worklogStore.getCalendarWorklogs(month, year).catch(err => console.error('Worklogs load error:', err)));
            }
            if (policyStore.policies?.length === 0) {
                console.log('Loading policies...');
                loadPromises.push(policyStore.fetchPolicies().catch(err => console.error('Policies load error:', err)));
            }
            if (!overviewStore.stats) {
                console.log('Loading overview stats...');
                loadPromises.push(overviewStore.fetchStats().catch(err => console.error('Overview load error:', err)));
            }
            if (loadPromises.length > 0) {
                await Promise.all(loadPromises);
                console.log(`Loaded ${loadPromises.length} modules`);
            }
            dataLoaded = true;
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };
    const safeString = (value) => {
        if (!value) return '';
        return String(value).toLowerCase();
    };
    const performSearch = async (query) => {
        if (!query || query.trim().length < 2) {
            searchResults.value = [];
            showResults.value = false;
            return;
        }
        isSearching.value = true;
        const searchTerm = query.toLowerCase().trim();
        const results = [];
        try {
            await loadAllData();
            const documents = documentStore.allItems || documentStore.viewItems || []
            const employees = employeeStore.employees || [];
            if (employees.length > 0) {
                const employeeResults = employees.filter(emp =>
                    safeString(emp.name).includes(searchTerm) ||
                    safeString(emp.email).includes(searchTerm) ||
                    safeString(emp.employee_number).includes(searchTerm) ||
                    safeString(emp.department).includes(searchTerm) ||
                    safeString(emp.designation).includes(searchTerm) ||
                    safeString(emp.phone_number).includes(searchTerm)
                ).slice(0, 5).map(emp => ({
                    id: `emp-${emp.id}`,
                    title: emp.name || 'Employee',
                    subtitle: `${emp.designation || 'Employee'} • ${emp.department || ''}`,
                    module: 'Employees',
                    icon: ['fas', 'user'],
                    route: '/admin/employees/dashboard',
                    query: { highlightEmployee: emp.id },
                    type: 'employee'
                }));
                results.push(...employeeResults);
            }
            const attendanceRecords = attendanceStore.attendanceRecords || [];
            if (attendanceRecords.length > 0) {
                const attendanceResults = attendanceRecords.filter(record => {
                    const employeeName = safeString(record.employee_name);
                    const date = safeString(record.date);
                    const status = safeString(record.status);
                    return employeeName.includes(searchTerm) ||
                        date.includes(searchTerm) ||
                        status.includes(searchTerm);
                }).slice(0, 3).map(record => ({
                    id: `att-${record.id}`,
                    title: record.employee_name || 'Employee',
                    subtitle: `Attendance • ${record.date || ''} • ${record.status || ''}`,
                    module: 'Attendance',
                    icon: ['fas', 'clock'],
                    route: '/admin/employees/attendance',
                    type: 'attendance'
                }));
                results.push(...attendanceResults);
            }
            const inboxItems = inboxStore.conversations || [];
            console.log('Inbox conversations to search:', inboxItems.length);
            let contacts = [];
            try {
                contacts = await inboxStore.fetchContacts();
                console.log('Contacts fetched:', contacts.length);
                console.log('First few contacts:', contacts.slice(0, 3).map(c => c.name || c.username || c.email));
            } catch (e) {
                console.warn('Could not fetch contacts:', e);
            }
            const inboxResults = [];
            if (inboxItems.length > 0 && contacts.length > 0) {
                const userMap = {};
                contacts.forEach(contact => {
                    userMap[contact.id] = contact;
                });
                for (const conv of inboxItems) {
                    let displayName = '';
                    let foundMatch = false;
                    if (conv.type === 'direct' && !conv.name) {
                        if (conv.created_by && userMap[conv.created_by]) {
                            const user = userMap[conv.created_by];
                            displayName = user.name || user.username || user.email || '';
                            const searchName = safeString(displayName);
                            if (searchName.includes(searchTerm)) {
                                foundMatch = true;
                            }
                        }
                        if (!foundMatch) {
                            for (const contact of contacts) {
                                const contactName = safeString(contact.name || contact.username || contact.email);
                                if (contactName.includes(searchTerm)) {
                                    if (conv.created_by === contact.id) {
                                        displayName = contact.name || contact.username || contact.email || '';
                                        foundMatch = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!foundMatch && conv.last_message) {
                            const lastMsg = safeString(conv.last_message);
                            if (lastMsg.includes(searchTerm)) {
                                displayName = 'Conversation';
                                foundMatch = true;
                            }
                        }
                    } else {
                        const convName = safeString(conv.name || conv.title || '');
                        const lastMsg = safeString(conv.last_message || '');
                        if (convName.includes(searchTerm) || lastMsg.includes(searchTerm)) {
                            displayName = conv.name || conv.title || 'Conversation';
                            foundMatch = true;
                        }
                    }
                    if (foundMatch) {
                        inboxResults.push({
                            id: `inbox-${conv.id}`,
                            title: displayName || 'Conversation',
                            subtitle: `Inbox • ${conv.last_message || 'No messages'}`,
                            module: 'Inbox',
                            icon: ['fas', 'envelope'],
                            route: '/admin/inbox',
                            query: { highlightConversation: conv.id },
                            type: 'inbox'
                        });
                    }
                }
            }
            if (inboxResults.length === 0 && contacts.length > 0) {
                console.log('No inbox matches found, checking contacts directly...');
                const matchingContacts = contacts.filter(c => {
                    const name = safeString(c.name || c.username || c.email);
                    return name.includes(searchTerm);
                });
                matchingContacts.forEach(contact => {
                    const hasConversation = inboxItems.some(conv => {
                        return conv.created_by === contact.id && conv.type === 'direct';
                    });
                    if (hasConversation) {
                        const conv = inboxItems.find(c => c.created_by === contact.id && c.type === 'direct');
                        if (conv) {
                            inboxResults.push({
                                id: `inbox-${conv.id}`,
                                title: contact.name || contact.username || contact.email || 'User',
                                subtitle: `Inbox • ${conv.last_message || 'No messages'}`,
                                module: 'Inbox',
                                icon: ['fas', 'envelope'],
                                route: '/admin/inbox',
                                query: { highlightConversation: conv.id },
                                type: 'inbox'
                            });
                        }
                    }
                });
            }
            if (inboxResults.length === 0 && inboxItems.length > 0) {
                console.log('Trying to search in messages for each conversation...');
                for (const conv of inboxItems) {
                    try {
                        const messages = await inboxStore.fetchMessages(conv.id);
                        if (messages && messages.length > 0) {
                            for (const msg of messages) {
                                const senderName = safeString(msg.sender_name || msg.username || '');
                                const content = safeString(msg.content || '');
                                if (senderName.includes(searchTerm) || content.includes(searchTerm)) {
                                    inboxResults.push({
                                        id: `inbox-${conv.id}`,
                                        title: msg.sender_name || msg.username || 'User',
                                        subtitle: `Inbox • ${conv.last_message || 'No messages'}`,
                                        module: 'Inbox',
                                        icon: ['fas', 'envelope'],
                                        route: '/admin/inbox',
                                        query: { highlightConversation: conv.id },
                                        type: 'inbox'
                                    });
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Could not fetch messages for conversation:', conv.id);
                    }
                }
            }
            results.push(...inboxResults.slice(0, 5));
            console.log('Inbox results found:', inboxResults.length);
            console.log('Inbox results:', inboxResults);
            const inquiries = inquiryStore.messages || [];
            if (inquiries.length > 0) {
                const inquiryResults = inquiries.filter(inq => {
                    const name = safeString(inq.name);
                    const email = safeString(inq.email);
                    const subject = safeString(inq.subject);
                    const message = safeString(inq.message);
                    return name.includes(searchTerm) ||
                        email.includes(searchTerm) ||
                        subject.includes(searchTerm) ||
                        message.includes(searchTerm);
                }).slice(0, 3).map(inq => ({
                    id: `inq-${inq.id}`,
                    title: inq.name || 'Inquiry',
                    subtitle: `${inq.subject || 'No subject'} • ${inq.email || ''}`,
                    module: 'Inquiries',
                    icon: ['fas', 'comments'],
                    route: '/admin/inquiries',
                    query: { highlightInquiry: inq.id },
                    type: 'inquiry'
                }));
                results.push(...inquiryResults);
            }
            const jiraProjects = jiraStore.projects || [];
            if (jiraProjects.length > 0) {
                const jiraResults = jiraProjects.filter(project => {
                    const name = safeString(project.name);
                    const key = safeString(project.key);
                    return name.includes(searchTerm) || key.includes(searchTerm);
                }).slice(0, 3).map(project => ({
                    id: `jira-${project.id}`,
                    title: project.name || 'Jira Project',
                    subtitle: `Jira • ${project.key || ''}`,
                    module: 'Jira',
                    icon: ['fas', 'tasks'],
                    route: '/admin/jira',
                    query: { highlightProject: project.id },
                    type: 'jira'
                }));
                results.push(...jiraResults);
            }
            console.log('Searching in documents...');
            if (documents.length > 0) {
                const documentResults = documents.filter(doc => {
                    const name = safeString(doc.name || doc.title);
                    const description = safeString(doc.description);
                    const folder = safeString(doc.folder);
                    const category = safeString(doc.category);
                    const file_name = safeString(doc.file_name);
                    const extension = safeString(doc.extension);
                    const type = safeString(doc.type);
                    return name.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        folder.includes(searchTerm) ||
                        category.includes(searchTerm) ||
                        file_name.includes(searchTerm) ||
                        extension.includes(searchTerm) ||
                        type.includes(searchTerm);
                }).slice(0, 5).map(doc => {
                    const isFolder = doc.isFolder || doc.type === 'folder';
                    const title = doc.name || doc.title || doc.file_name || 'Document';
                    const subtitle = isFolder ? `Folder • ${doc.category || ''}` : `File • ${doc.extension || 'file'}`;
                    return {
                        id: `doc-${doc.id}`,
                        title: title,
                        subtitle: subtitle,
                        module: 'Documents',
                        icon: isFolder ? ['fas', 'folder'] : ['fas', 'file-alt'],
                        route: '/admin/documents',
                        query: { highlightDocument: doc.id },
                        type: 'document'
                    };
                });
                results.push(...documentResults);
                console.log('Document results found:', documentResults.length);
            } else {
                console.warn('No documents to search. documents.length = 0');
            }
            const vaultItems = vaultStore.credentials || [];
            console.log('Searching in vault...');
            if (vaultItems.length > 0) {
                const vaultResults = vaultItems.filter(item => {
                    const name = safeString(item.name);
                    const username = safeString(item.username);
                    const email = safeString(item.email);
                    const description = safeString(item.description);
                    const project = safeString(item.project);
                    const link = safeString(item.link);
                    return name.includes(searchTerm) ||
                        username.includes(searchTerm) ||
                        email.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        project.includes(searchTerm) ||
                        link.includes(searchTerm);
                }).slice(0, 5).map(item => ({
                    id: `vault-${item.id}`,
                    title: item.name || 'Vault Item',
                    subtitle: `Vault • ${item.username || item.email || item.project || ''}`,
                    module: 'Vault',
                    icon: ['fas', 'lock'],
                    route: '/admin/credentialsvault',
                    query: { highlightCredential: item.id },
                    type: 'vault'
                }));
                results.push(...vaultResults);
                console.log('Vault results found:', vaultResults.length);
            } else {
                console.warn('No vault items to search. vaultItems.length = 0');
            }
            const worklogEntries = Object.values(worklogStore.calendarWorklogs || {}).flat() || [];
            if (worklogEntries.length > 0) {
                const worklogResults = worklogEntries.filter(wl => {
                    const description = safeString(wl.description);
                    const project = safeString(wl.project);
                    const employee = safeString(wl.employee_name);
                    return description.includes(searchTerm) ||
                        project.includes(searchTerm) ||
                        employee.includes(searchTerm);
                }).slice(0, 3).map(wl => ({
                    id: `wl-${wl.id}`,
                    title: wl.employee_name || 'Worklog',
                    subtitle: `Worklog • ${wl.project || ''} • ${wl.hours || 0}h`,
                    module: 'Worklogs',
                    icon: ['fas', 'tasks'],
                    route: '/admin/worklogs',
                    type: 'worklog'
                }));
                results.push(...worklogResults);
            }
            const contactItems = contactStore.contacts || [];
            if (contactItems.length > 0) {
                const contactResults = contactItems.filter(contact => {
                    const name = safeString(contact.name);
                    const email = safeString(contact.email);
                    const company = safeString(contact.company);
                    return name.includes(searchTerm) ||
                        email.includes(searchTerm) ||
                        company.includes(searchTerm);
                }).slice(0, 3).map(contact => ({
                    id: `contact-${contact.id}`,
                    title: contact.name || 'Contact',
                    subtitle: `${contact.company || ''} • ${contact.email || ''}`,
                    module: 'Contacts',
                    icon: ['fas', 'address-book'],
                    route: '/admin/contacts',
                    query: { highlightContact: contact.id },
                    type: 'contact'
                }));
                results.push(...contactResults);
            }
            const jobs = jobStore.jobs || [];
            if (jobs.length > 0) {
                const jobResults = jobs.filter(job => {
                    const title = safeString(job.title);
                    const description = safeString(job.description);
                    const department = safeString(job.department);
                    return title.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        department.includes(searchTerm);
                }).slice(0, 3).map(job => ({
                    id: `job-${job.id}`,
                    title: job.title || 'Job',
                    subtitle: `${job.department || ''} • ${job.status || ''}`,
                    module: 'Jobs',
                    icon: ['fas', 'briefcase'],
                    route: '/admin/jobs',
                    query: { highlightJob: job.id },
                    type: 'job'
                }));
                results.push(...jobResults);
            }
            const policies = policyStore.policies || [];
            if (policies.length > 0) {
                const policyResults = policies.filter(policy => {
                    const title = safeString(policy.title);
                    const description = safeString(policy.description);
                    const category = safeString(policy.category);
                    return title.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        category.includes(searchTerm);
                }).slice(0, 3).map(policy => ({
                    id: `policy-${policy.id}`,
                    title: policy.title || 'Policy',
                    subtitle: `${policy.category || ''} • ${policy.status || ''}`,
                    module: 'Policies',
                    icon: ['fas', 'file-contract'],
                    route: '/admin/policies',
                    query: { highlightPolicy: policy.id },
                    type: 'policy'
                }));
                results.push(...policyResults);
            }
            console.log('Searching in overview...');
            if (overviewStore.stats) {
                const stats = overviewStore.stats;
                const overviewResults = [];
                const statsData = {
                    'Active Employees': stats.active_employees,
                    'Published Jobs': stats.published_jobs,
                    'Inquiries': stats.inquiries,
                    'Worklog Hours': stats.worklog_hours,
                    'Present Today': stats.present_today,
                    'Late Today': stats.late_today,
                    'Absent Today': stats.absent_today,
                };
                for (const [key, value] of Object.entries(statsData)) {
                    if (value !== undefined && value !== null) {
                        const valueStr = safeString(value);
                        if (valueStr.includes(searchTerm)) {
                            overviewResults.push({
                                id: `overview-${key}`,
                                title: key,
                                subtitle: `Overview • ${value}`,
                                module: 'Overview',
                                icon: ['fas', 'chart-simple'],
                                route: '/admin/overview',
                                type: 'overview'
                            });
                        }
                    }
                }
                if (stats.by_employee && Array.isArray(stats.by_employee)) {
                    stats.by_employee.forEach(emp => {
                        const name = safeString(emp.employee_name);
                        if (name.includes(searchTerm)) {
                            overviewResults.push({
                                id: `overview-emp-${emp.employee_id}`,
                                title: emp.employee_name || 'Employee',
                                subtitle: `Overview • ${emp.total_hours || 0}h worked`,
                                module: 'Overview',
                                icon: ['fas', 'chart-simple'],
                                route: '/admin/overview',
                                type: 'overview'
                            });
                        }
                    });
                }
                results.push(...overviewResults.slice(0, 5));
                console.log('Overview results found:', overviewResults.slice(0, 5).length);
            } else {
                console.warn('No overview stats to search');
            }
            console.log('Searching in worklog analytics...');
            if (worklogAnalyticsStore) {
                const analyticsResults = [];
                const byEmployee = worklogAnalyticsStore.byEmployee || [];
                const topIssues = worklogAnalyticsStore.topIssues || [];
                const dailyTrend = worklogAnalyticsStore.dailyTrend || [];
                const summary = worklogAnalyticsStore.summary || {};
                console.log('Worklog Analytics - byEmployee length:', byEmployee.length);
                console.log('Worklog Analytics - first employee:', byEmployee[0]);
                if (byEmployee.length > 0) {
                    byEmployee.forEach(emp => {
                        const name = safeString(emp.employee_name || emp.name || emp.user || emp.username);
                        const department = safeString(emp.department || emp.dept || '');
                        const project = safeString(emp.project || '');
                        const email = safeString(emp.email || '');
                        if (name.includes(searchTerm) ||
                            department.includes(searchTerm) ||
                            project.includes(searchTerm) ||
                            email.includes(searchTerm)) {
                            analyticsResults.push({
                                id: `analytics-emp-${emp.employee_id || emp.id || Date.now()}`,
                                title: emp.employee_name || emp.name || emp.user || 'Employee',
                                subtitle: `Worklog Analytics • ${emp.department || '—'} • ${emp.total_hours || emp.hours || 0}h • ${emp.total_entries || emp.entries || 0} entries`,
                                module: 'Worklog Analytics',
                                icon: ['fas', 'chart-line'],
                                route: '/admin/worklogs/analytics',
                                query: { highlightEmployee: emp.employee_id || emp.id },
                                type: 'analytics'
                            });
                        }
                    });
                }
                if (summary && Object.keys(summary).length > 0) {
                    const summaryData = {
                        'Total Hours': summary.total_hours,
                        'Total Employees': summary.total_employees,
                        'Average Hours': summary.average_hours,
                        'Total Worklogs': summary.total_worklogs,
                        'Total Days': summary.total_days,
                        'Total Issues': summary.total_issues,
                    };
                    for (const [key, value] of Object.entries(summaryData)) {
                        if (value !== undefined && value !== null) {
                            const valueStr = safeString(value);
                            if (valueStr.includes(searchTerm)) {
                                analyticsResults.push({
                                    id: `analytics-summary-${key}`,
                                    title: key,
                                    subtitle: `Worklog Analytics • ${value}`,
                                    module: 'Worklog Analytics',
                                    icon: ['fas', 'chart-line'],
                                    route: '/admin/worklogs/analytics',
                                    type: 'analytics'
                                });
                            }
                        }
                    }
                }
                if (topIssues.length > 0) {
                    topIssues.forEach(issue => {
                        const issueKey = safeString(issue.issue_key || issue.key || '');
                        const summaryText = safeString(issue.summary || issue.title || '');
                        const project = safeString(issue.project || '');
                        if (issueKey.includes(searchTerm) ||
                            summaryText.includes(searchTerm) ||
                            project.includes(searchTerm)) {
                            analyticsResults.push({
                                id: `analytics-issue-${issue.issue_key || issue.key || Date.now()}`,
                                title: issue.issue_key || issue.key || 'Issue',
                                subtitle: `Worklog Analytics • ${issue.summary || issue.title || ''} • ${issue.total_hours || issue.hours || 0}h`,
                                module: 'Worklog Analytics',
                                icon: ['fas', 'chart-line'],
                                route: '/admin/worklogs/analytics',
                                type: 'analytics'
                            });
                        }
                    });
                }
                if (dailyTrend.length > 0) {
                    dailyTrend.forEach(day => {
                        const date = safeString(day.date || day.day || '');
                        const project = safeString(day.project || '');
                        const employee = safeString(day.employee_name || day.name || '');
                        if (date.includes(searchTerm) ||
                            project.includes(searchTerm) ||
                            employee.includes(searchTerm)) {
                            analyticsResults.push({
                                id: `analytics-trend-${day.date || day.day || Date.now()}`,
                                title: day.date || day.day || 'Date',
                                subtitle: `Worklog Analytics • ${day.total_hours || day.hours || 0}h • ${day.project || ''}`,
                                module: 'Worklog Analytics',
                                icon: ['fas', 'chart-line'],
                                route: '/admin/worklogs/analytics',
                                type: 'analytics'
                            });
                        }
                    });
                }
                results.push(...analyticsResults.slice(0, 5));
                console.log('Worklog Analytics results found:', analyticsResults.slice(0, 5).length);
                if (analyticsResults.length > 0) {
                    console.log('First analytics result:', analyticsResults[0]);
                }
            } else {
                console.warn('No worklog analytics store available');
            }
            console.log('Total results found:', results.length);
            const modulePriority = {
                'Overview': 0,
                'Employees': 1,
                'Inbox': 2,
                'Inquiries': 3,
                'Attendance': 4,
                'Payroll': 5,
                'Leave': 6,
                'Jira': 7,
                'Documents': 8,
                'Vault': 9,
                'Worklogs': 10,
                'Worklog Analytics': 11,
                'Contacts': 12,
                'CVs': 13,
                'Jobs': 14,
                'Policies': 15
            };
            results.sort((a, b) => (modulePriority[a.module] || 99) - (modulePriority[b.module] || 99));
            searchResults.value = results.slice(0, 15);
            showResults.value = true;
            console.log('Final results:', searchResults.value);
        } catch (error) {
            console.error('Search error:', error);
            searchResults.value = [];
            showResults.value = false;
        } finally {
            isSearching.value = false;
        }
    };
    const navigateToResult = (result) => {
        showResults.value = false;
        searchQuery.value = '';
        searchResults.value = [];
        if (result.route) {
            if (result.query) {
                router.push({
                    path: result.route,
                    query: result.query
                });
            } else {
                router.push(result.route);
            }
        }
    };
    const clearSearch = () => {
        searchQuery.value = '';
        searchResults.value = [];
        showResults.value = false;
    };
    return {
        searchQuery,
        searchResults,
        showResults,
        isSearching,
        performSearch,
        navigateToResult,
        clearSearch,
        loadAllData
    };
}