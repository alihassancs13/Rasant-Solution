import { defineStore } from 'pinia'
import loginApi from '@/services/loginApi.js'

export const useWorklogStore = defineStore('worklogStore', {
  state: () => ({
    loading: false,
    error: null,
    calendarWorklogs: {},
  }),

  actions: {
    getAuthHeader() {
      const token = localStorage.getItem('access_token')
      return {
        Authorization: `Bearer ${token}`,
      }
    },

    async createWorklog(payload) {
      this.error = null
      this.loading = true

      try {
        const response = await loginApi.post(
          '/api/worklogs/create-worklogs/',
          payload,
          { headers: { ...this.getAuthHeader() } }
        )
        return response.data
      } catch (error) {
        console.error('Create Worklog Error:', error.response?.data)
        this.error = error.response?.data || 'Something went wrong'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getCalendarWorklogs(month, year) {
      this.error = null
      this.loading = true

      try {
        // Ensure month and year are provided
        if (!month || !year) {
          throw new Error('Month and year are required')
        }

        const response = await loginApi.get(`/api/worklogs/calendar/${year}/${month}/`, {
        headers: { ...this.getAuthHeader() },
        })

        this.calendarWorklogs = response.data.logs || {}
        return response.data
      } catch (error) {
        console.error('Get Calendar Worklogs Error:', error.response?.data || error.message)
        this.error = error.response?.data?.message || error.message || 'Something went wrong'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateWorklog(worklogId, payload) {
      this.error = null
      this.loading = true

      try {
        const response = await loginApi.put(
          `/api/worklogs/${worklogId}/update/`,
          payload,
          {
            headers: { ...this.getAuthHeader() },
          }
        )

        return response.data
      } catch (error) {
        console.error('Update Worklog Error:', error.response?.data)
        this.error = error.response?.data || 'Something went wrong'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteWorklog(worklogId, issueKey) {
      this.error = null
      this.loading = true

      try {
        const response = await loginApi.delete( `/api/worklogs/${worklogId}/delete/?issue_key=${encodeURIComponent(issueKey)}`,
      {
        headers: { ...this.getAuthHeader() }
      }
    )
        return response.data
      } catch (error) {
        console.error('Delete Worklog Error:', error.response?.data)
        this.error = error.response?.data || 'Something went wrong'
        throw error
      } finally {
        this.loading = false
      }
    },
  async getWorklog(worklogId, issueKey) {
  this.error = null
  this.loading = true

  try {
    const response = await loginApi.get(
  `/api/worklogs/${worklogId}/`,
  {
    headers: {
      ...this.getAuthHeader(),
    },
    params: {
      issue_key: issueKey,
    },
  }
)

    return response.data
  } catch (error) {
    console.error("Get Worklog Error:", error.response?.data)
    this.error = error.response?.data || "Something went wrong"
    throw error
  } finally {
    this.loading = false
  }
},
  },
})