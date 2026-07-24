import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl';
import { useLoginStore } from '../stores/loginStore.js';

function getAuthToken() {
    const authStore = useLoginStore();
    return authStore.accessToken;
}

const apiClient = axios.create({ baseURL: BASE_URL, timeout: 8000 });

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const useInboxStore = defineStore('inbox', {
    state: () => ({
        conversations: [],
        loadingConversations: false,
        loadingMessages: false,
        eventSource: null,
        sseConnected: false,
        userAvatars: {},
    }),

    getters: {
        unreadConversationsCount: (state) => {
            return state.conversations.filter((c) => (c.unread_count || 0) > 0).length;
        },
    },

    actions: {
        async fetchConversations() {
            this.loadingConversations = true;
            try {
                const response = await apiClient.get(API_ENDPOINTS.INBOX_LIST_CONVERSATIONS);
                this.conversations = response.data;
                return response.data;
            } finally {
                this.loadingConversations = false;
            }
        },

        async createDirectConversation(receiverId) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_CREATE_DIRECT, {
                receiver_id: receiverId,
            });
            return response.data;
        },

        async createGroupConversation(name, memberIds) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_CREATE_GROUP, {
                name,
                member_ids: memberIds,
            });
            return response.data;
        },

        async sendMessage(conversationId, content, files = []) {
            if (files.length) {
                const formData = new FormData();
                formData.append('conversation_id', conversationId);
                formData.append('content', content || '');
                files.forEach((file) => formData.append('files', file));

                const response = await apiClient.post(API_ENDPOINTS.INBOX_SEND_MESSAGE, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return response.data;
            }

            const response = await apiClient.post(API_ENDPOINTS.INBOX_SEND_MESSAGE, {
                conversation_id: conversationId,
                content,
            });
            return response.data;
        },

        async fetchAttachmentBlob(attachmentId) {
            try {
                const response = await apiClient.get(
                    API_ENDPOINTS.INBOX_GET_ATTACHMENT(attachmentId),
                    { responseType: 'blob' }
                );
                return { blob: response.data, url: URL.createObjectURL(response.data) };
            } catch (err) {
                console.error('Failed to fetch attachment:', err);
                return null;
            }
        },


        async fetchContacts() {
            const response = await apiClient.get(API_ENDPOINTS.INBOX_LIST_USERS);
            return response.data;
        },

        async fetchMessages(conversationId) {
            this.loadingMessages = true;
            try {
                const response = await apiClient.get(API_ENDPOINTS.INBOX_GET_MESSAGES(conversationId));
                return response.data;
            } finally {
                this.loadingMessages = false;
            }
        },

        async markMessagesRead(conversationId) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_MARK_READ(conversationId));
            return response.data;
        },

        incrementConversationUnread(conversationId) {
            const conv = this.conversations.find((c) => c.id === conversationId);
            if (conv) conv.unread_count = (conv.unread_count || 0) + 1;
        },

        resetConversationUnread(conversationId) {
            const conv = this.conversations.find((c) => c.id === conversationId);
            if (conv) conv.unread_count = 0;
        },

        upsertConversation(conversation) {
            const idx = this.conversations.findIndex((c) => c.id === conversation.id);
            if (idx !== -1) {
                this.conversations[idx] = conversation;
            } else {
                this.conversations.unshift(conversation);
            }
        },

        async deleteMessageForMe(messageId) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_DELETE_FOR_ME(messageId));
            return response.data;
        },

        async deleteMessageForEveryone(messageId) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_DELETE_FOR_EVERYONE(messageId));
            return response.data;
        },

        async clearChat(conversationId, deleteChat = false) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_CLEAR_CHAT(conversationId), {
                delete_chat: deleteChat,
            });
            return response.data;
        },

        // ---------- Group avatar ----------
        async updateGroupAvatar(conversationId, formData) {
            const response = await apiClient.post(
                API_ENDPOINTS.INBOX_UPDATE_GROUP_AVATAR(conversationId),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data;
        },

        async fetchGroupAvatarBlob(conversationId) {
            try {
                const response = await apiClient.get(
                    API_ENDPOINTS.INBOX_GET_GROUP_AVATAR(conversationId),
                    { responseType: 'blob' }
                );
                return URL.createObjectURL(response.data);
            } catch (err) {
                console.error('Failed to fetch group avatar:', err);
                return null;
            }
        },

        async leaveGroup(conversationId) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_LEAVE_GROUP(conversationId));
            return response.data;
        },

        async addGroupMembers(conversationId, memberIds) {
            const response = await apiClient.post(API_ENDPOINTS.INBOX_ADD_MEMBERS(conversationId), {
                member_ids: memberIds,
            });
            return response.data;
        },

        async updateMyAvatar(formData) {
            const response = await apiClient.post(API_ENDPOINTS.ACCOUNTS_UPDATE_MY_AVATAR, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },

        async fetchUserAvatarBlob(userId) {
            if (this.userAvatars[userId]) return this.userAvatars[userId];
            try {
                const response = await apiClient.get(API_ENDPOINTS.ACCOUNTS_GET_USER_AVATAR(userId), { responseType: 'blob' });
                const url = URL.createObjectURL(response.data);
                this.userAvatars[userId] = url;
                return url;
            } catch {
                return null;
            }
        },

        clearUserAvatar(userId) {
            if (this.userAvatars[userId]) {
                URL.revokeObjectURL(this.userAvatars[userId]);
                delete this.userAvatars[userId];
            }
        },

        removeConversation(conversationId) {
            this.conversations = this.conversations.filter((c) => c.id !== conversationId);
        },

        connectSSE(onMessage) {
            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = null;
            }

            const token = getAuthToken();
            const url = `${BASE_URL}${API_ENDPOINTS.INBOX_SSE_STREAM.slice(1)}?token=${token}`;
            this.eventSource = new EventSource(url);

            this.eventSource.onopen = () => {
                this.sseConnected = true;
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (e) {
                    console.error('SSE parse error:', e);
                }
            };

            this.eventSource.onerror = (err) => {
                this.sseConnected = false;
                console.error('SSE connection error:', err);
            };
        },

        disconnectSSE() {
            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = null;
                this.sseConnected = false;
            }
        },
    },
});