import { defineStore } from 'pinia'
import loginApi from '@/services/loginApi.js'

export const useJiraStore = defineStore('jiraStore', {
    state: () => ({
        jiraUser: JSON.parse(localStorage.getItem('jira_user') || 'null'),
        jiraExpired: false,
        jiraConnected: !!localStorage.getItem('jira_account_id') ,
        jiraAccountId: null,
        userIssues: null,
        perIssue: null,
        isModalLoading: false,
        attachmentUrls: {},
        search: [],
        projects:[],
        teams:[],
        assignees:[],
        workTypes:[],
        parents:[],
        users:[],
        statuses:[],
        priorities:[],
        sprints:[],
        isConnecting: false,
        isLoading: false,
        error: null,
    }),

    actions: {

        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return { Authorization: 'Bearer ' + token };
        },


        async checkJiraConnection() {
            try {

                const res = await loginApi.get('/api/jira/check-jira-connection/')
                this.jiraConnected = res.data.connected

                if (res.data.expired || !res.data.connected) {
                    this.jiraUser = null
                    this.jiraExpired = true
                    if (res.data.email || res.data.domain) {
                        const userData = {
                            email: res.data.email ?? '',
                            domain: res.data.domain ?? '',
                            name: res.data.name ?? '',
                            avatar: res.data.avatar ?? '',
                            account_id: res.data.account_id ?? '',
                        }
                        this.jiraUser = userData
                        localStorage.setItem('jira_user', JSON.stringify(userData))
                    }

                    localStorage.removeItem('jira_account_id')
                } else {
                    this.jiraExpired = false
                    if (res.data.account_id) {
                        this.jiraAccountId = res.data.account_id
                        localStorage.setItem('jira_account_id', res.data.account_id)
                        console.log('accountId:', this.jiraAccountId)

                        const userData = {
                            email: res.data.email ?? '',
                            domain: res.data.domain ?? '',
                            name: res.data.name ?? '',
                            avatar: res.data.avatar ?? '',
                            account_id: res.data.account_id ?? '',
                        }
                        this.jiraUser = userData
                        localStorage.setItem('jira_user', JSON.stringify(userData))
                    }
                }

            } catch (err) {

                console.error("Jira check failed:", err)

                this.jiraConnected = false
                this.jiraExpired = true
                this.jiraUser = null
            }
        },

        async connectJira(payload) {
            this.isConnecting = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/connect/', payload ,{
                    headers: this.getAuthHeader()
                });

                const userData = {
                    ...response.data,
                    email: payload.email,
                    domain: payload.domain,
                }

                this.jiraUser = userData
                localStorage.setItem('jira_user', JSON.stringify(userData))
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Connection failed'
                throw err
            } finally {
                this.isConnecting = false
            }
        },

        async getUserIssues(accountId) {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.get('/api/jira/get-user-issues/', {
                    headers: this.getAuthHeader(),
                    params: {
                        account_id: accountId
                    }
                });

                this.userIssues = response.data.issues

                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getWorkTypes(projectId) {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/get-issue-types/', {project_id: projectId},{
                    headers: this.getAuthHeader(),
                });

                this.workTypes = response.data.issue_types
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getStatuses(projectKey) {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/get-statuses/', {project_key: projectKey},{
                    headers: this.getAuthHeader(),
                });

                this.statuses = response.data.statuses
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getPriority() {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/get-jira-link-types/', {
                    headers: this.getAuthHeader(),
                });

                this.priorities = response.data.link_types
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getAssignees(projectKey) {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.get('/api/jira/search-assignees/',{
                    headers: this.getAuthHeader(),
                    params:{
                        project_key: projectKey
                    }
                });

                this.users = response.data.assignees.map(u => ({
                    id: u.accountId,
                    name: u.displayName,
                    email: u.email,
                    avatar: u.avatar,
                    active: u.active
                }))
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getProjects() {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/get-recent-jira-projects/', {},{
                    headers: this.getAuthHeader(),
                });

                this.projects = response.data.projects
                console.log("Projects:",this.projects)
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getTeams() {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/get-teams/', {},{
                    headers: this.getAuthHeader(),
                });

                this.teams = response.data.teams
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async getProjectSprints(projectKey) {
            this.isLoading = true
            this.error = null

            try {
                const response = await loginApi.post('/api/jira/get-project-sprints/', {project_key: projectKey},{
                    headers: this.getAuthHeader(),
                });

                this.sprints = response.data.sprints
                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async createUserIssue(payload) {
            this.error = null;
            this.loading = true;


            try {
                const isFormData = payload instanceof FormData

                const response = await loginApi.post(
                "/api/jira/create-issue/",
                payload,
             {
                   headers: {
                 ...this.getAuthHeader(),
                  "Content-Type": "multipart/form-data",
               },
               }
                );

                if (this.jiraUser?.account_id) {
                    await this.getUserIssues(this.jiraUser.account_id);
                }

                return response.data;

            } catch (error) {
                console.error('Create Issue Error:', error.response?.data);
                this.error = error.response?.data || 'Something went wrong';
                throw error;

            } finally {
                this.loading = false;
            }
        },

        async deleteJiraIssue(issueKey,deleteSubtasks) {
            this.isLoading = true
            this.error = null
                const response = await loginApi.delete(`/api/jira/delete-issue/`, {
                    headers: this.getAuthHeader(),
                    data: {
                        issue_key: issueKey,
                        delete_subtasks: deleteSubtasks
                    }
                });

                if (this.jiraUser?.account_id) {
                    await this.getUserIssues(this.jiraUser.account_id)
                }

                return response.data
            },

        async getSingleIssue(issueKey) {
            this.isModalLoading= true
            this.error = null

            try {
                const response = await loginApi.get(`/api/jira/issue/${issueKey}`, {
                    headers: this.getAuthHeader(),
                });

                this.perIssue = response.data.issue

                return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch issues'
                throw err
            } finally {
                this.isModalLoading = false
            }
        },

        async getAttachmentPreview(attachmentId) {
            try {
                const response = await loginApi.get(
                    `/api/jira/attachment/${attachmentId}/`,
                    { responseType: 'blob' }
                )
                this.attachmentUrls[attachmentId] = URL.createObjectURL(response.data)

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to load attachment'
                throw err
            }
        },

        async loadAttachmentPreviews(attachments) {
            this.isModalLoading = true;
            try{
            for (const attachment of attachments) {
                await this.getAttachmentPreview(attachment.id)
            }
        }finally{
                this.isModalLoading = false
        }},

    },
})