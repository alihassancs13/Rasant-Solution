import { defineStore } from 'pinia';
import { contactAPI } from '../services/cvApi.js';       // admin: getAll/delete
import { contactAPI as publicContactAPI } from '../services/contactApi.js'; // public: sendMessage

export const useContactStore = defineStore('contact', {
    state: () => ({
        messages: [],
        isLoading: false,
        isSubmitting: false,
        error: null,
    }),

    getters: {
        getMessages: (state) => state.messages,
        totalMessages: (state) => state.messages.length,
    },

    actions: {
        // Admin: fetch all contact messages
        async fetchMessages() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await contactAPI.getAll();
                this.messages = response.data;
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch messages';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async deleteMessage(id) {
            try {
                await contactAPI.delete(id);
                this.messages = this.messages.filter((m) => m.id !== id);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete message';
                return { success: false, error: this.error };
            }
        },

        async submitContactForm(data) {
            this.isSubmitting = true;
            this.error = null;
            try {
                const response = await publicContactAPI.sendMessage(data);
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to send message';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});