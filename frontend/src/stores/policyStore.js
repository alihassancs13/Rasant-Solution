import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const getAuthToken = () => localStorage.getItem('accessToken');

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const usePolicyStore = defineStore('policy', {
    state: () => ({
        assignments: [],
        isLoadingAssignments: false,
        isSavingAssignments: false,
        policies: [],
        incrementTypes: [],
        isModalLoading: false,
        employeeDetail: null,
        cycleTimings: [],
        applicationModes: [],
        dueTodayIncrements: [],
        isLoadingDueToday: false,
        isLoading: false,
        isSubmitting: false,
        error: null,
    }),

    getters: {
        getPolicyById: (state) => (id) => state.policies.find((p) => p.id === id),
        activePolicies: (state) => state.policies.filter((p) => p.is_active),
        isPolicyAssigned: (state) => (policyId) =>
        state.assignments.some((a) => a.policy === policyId),
    },

    actions: {
        async fetchPolicies() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.INCREMENT_POLICIES);
                this.policies = response?.data?.data ?? [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch policies';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchIncrementsDueToday() {
          this.isLoadingDueToday = true;
         try {
            const response = await apiClient.get(API_ENDPOINTS.INCREMENTS_DUE_TODAY);
            this.dueTodayIncrements = response?.data?.data ?? [];
            return { success: true };
         } catch (error) {
            this.error = error.response?.data?.message || 'Failed to fetch due today increments';
            return { success: false, error: this.error };
          } finally {
        this.isLoadingDueToday = false;
          }
       },

       async checkInsuranceRenewals() {
          this.isCheckingInsuranceRenewals = true;
          try {
            const response = await apiClient.post(API_ENDPOINTS.CHECK_INSURANCE_RENEWALS);
            this.renewedInsuranceEmployees = response?.data?.data ?? [];
            return { success: true };
          } catch (error) {
            this.error = error.response?.data?.message || 'Failed to check insurance renewals';
            return { success: false, error: this.error };
          } finally {
             this.isCheckingInsuranceRenewals = false;
          }
       },

        async fetchLookups() {
            try {
                const response = await apiClient.get(API_ENDPOINTS.INCREMENT_LOOKUPS);
                const data = response?.data?.data ?? {};
                this.incrementTypes    = data.increment_types ?? [];
                this.cycleTimings      = data.cycle_timings ?? [];
                this.applicationModes  = data.application_modes ?? [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch lookup data';
                return { success: false, error: this.error };
            }
        },

        async createPolicy(payload) {
            this.isSubmitting = true;
            try {
                const response = await apiClient.post(API_ENDPOINTS.INCREMENT_POLICIES, payload);
                this.policies.unshift(response.data.data);
                return { success: true, data: response.data.data };
            } catch (error) {
                this.error = error.response?.data?.errors || error.response?.data?.message || 'Failed to create policy';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async updatePolicy(id, payload) {
            this.isSubmitting = true;
            try {
                const response = await apiClient.put(`${API_ENDPOINTS.INCREMENT_POLICIES}${id}/`, payload);
                const index = this.policies.findIndex((p) => p.id === id);
                if (index !== -1) this.policies[index] = response.data.data;
                return { success: true, data: response.data.data };
            } catch (error) {
                this.error = error.response?.data?.errors || error.response?.data?.message || 'Failed to update policy';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },
        async fetchAssignments() {
            this.isLoadingAssignments = true;
            try {
                const response = await apiClient.get(API_ENDPOINTS.POLICY_ASSIGNMENTS);
                this.assignments = response?.data?.data ?? [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch assignments';
                return { success: false, error: this.error };
            } finally {
                this.isLoadingAssignments = false;
            }
        },

        async syncPolicyAssignments(policyId, employeeIds) {
            this.isSavingAssignments = true;
            try {
                const response = await apiClient.post(API_ENDPOINTS.POLICY_ASSIGN(policyId), {
                    employee_ids: employeeIds,
                });

                this.assignments = this.assignments.filter(a => a.policy !== policyId);
                this.assignments.push(...(response?.data?.data ?? []));
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to save assignments';
                return { success: false, error: this.error };
            } finally {
                this.isSavingAssignments = false;
            }
        },

        async forceIncrement() {
            this.isSubmitting = true;
            try {
                const response = await apiClient.post(API_ENDPOINTS.FORCE_INCREMENT);
                return { success: true, data: response.data.data, message: response.data.message };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to force increment';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async deletePolicy(id) {
            try {
                await apiClient.delete(`${API_ENDPOINTS.INCREMENT_POLICIES}${id}/`);
                this.policies = this.policies.filter((p) => p.id !== id);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete policy';
                return { success: false, error: this.error };
            }
        },

        async getEmployeeDetail(employeeId) {
            this.isModalLoading = true
            this.error = null

            try {
             const response = await apiClient.get(API_ENDPOINTS.GET_EMPLOYEE_DETAIL(employeeId));
             this.employeeDetail = response.data
             return response.data

            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to fetch employee details'
                throw err
            } finally {
                 this.isModalLoading = false
             }
         },

        async saveEmployeeMonthlyBonus(employeeId, bonusAmount, deductionMonth = null) {
            this.isModalLoading = true;
            this.error = null;
            try {
                const payload = { bonus_amount: bonusAmount };
                if (deductionMonth) payload.deduction_month = deductionMonth;
                const response = await apiClient.patch(
                    API_ENDPOINTS.EMPLOYEE_MONTHLY_BONUS(employeeId),
                    payload,
                );
                await this.getEmployeeDetail(employeeId);
                return { success: true, data: response.data };
            } catch (err) {
                this.error = err.response?.data?.error || 'Failed to save bonus';
                return { success: false, error: this.error };
            } finally {
                this.isModalLoading = false;
            }
        },
    },
});