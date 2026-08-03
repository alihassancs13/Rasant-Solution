import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl';
import { useLoginStore } from '../stores/loginStore.js';

const getToken = () => useLoginStore().accessToken;

const apiClient = axios.create({ baseURL: BASE_URL, timeout: 8000 });
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const blobUrl = async (url) => {
    const { data } = await apiClient.get(url, { responseType: 'blob' });
    return URL.createObjectURL(data);
};

export const useInboxStore = defineStore('inbox', {
    state: () => ({
        conversations: [],
        loadingConversations: false,
        loadingMessages: false,
        eventSource: null,
        sseConnected: false,
        userAvatars: {},
        conversationsFetchedAt: 0,
        _conversationsInflight: null,
        _connectingToken: null,
    }),

    getters: {
        unreadConversationsCount: (s) => s.conversations.filter((c) => (c.unread_count || 0) > 0).length,
    },

    actions: {
        // ---------- Conversations ----------
        async fetchConversations({ force = false } = {}) {
            const TTL = 60_000;
            const fresh = this.conversationsFetchedAt && Date.now() - this.conversationsFetchedAt < TTL;
            if (!force && fresh) return this.conversations;
            if (this._conversationsInflight) return this._conversationsInflight;

            this.loadingConversations = this.conversations.length === 0;
            this._conversationsInflight = apiClient
                .get(API_ENDPOINTS.INBOX_LIST_CONVERSATIONS)
                .then(({ data }) => {
                    this.conversations = data;
                    this.conversationsFetchedAt = Date.now();
                    return data;
                })
                .finally(() => {
                    this.loadingConversations = false;
                    this._conversationsInflight = null;
                });

            return this._conversationsInflight;
        },

        createDirectConversation: (receiverId) =>
            apiClient.post(API_ENDPOINTS.INBOX_CREATE_DIRECT, { receiver_id: receiverId }).then((r) => r.data),

        createGroupConversation: (name, memberIds) =>
            apiClient.post(API_ENDPOINTS.INBOX_CREATE_GROUP, { name, member_ids: memberIds }).then((r) => r.data),

        async sendMessage(conversationId, content, files = []) {
            if (!files.length) {
                return apiClient
                    .post(API_ENDPOINTS.INBOX_SEND_MESSAGE, { conversation_id: conversationId, content })
                    .then((r) => r.data);
            }
            const formData = new FormData();
            formData.append('conversation_id', conversationId);
            formData.append('content', content || '');
            files.forEach((f) => formData.append('files', f));
            return apiClient
                .post(API_ENDPOINTS.INBOX_SEND_MESSAGE, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then((r) => r.data);
        },

        async fetchAttachmentBlob(attachmentId) {
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.INBOX_GET_ATTACHMENT(attachmentId), { responseType: 'blob' });
                return { blob: data, url: URL.createObjectURL(data) };
            } catch (err) {
                console.error('Failed to fetch attachment:', err);
                return null;
            }
        },

        fetchContacts: () => apiClient.get(API_ENDPOINTS.INBOX_LIST_USERS).then((r) => r.data),

        async fetchMessages(conversationId) {
            this.loadingMessages = true;
            try {
                return (await apiClient.get(API_ENDPOINTS.INBOX_GET_MESSAGES(conversationId))).data;
            } finally {
                this.loadingMessages = false;
            }
        },

        markMessagesRead: (conversationId) =>
            apiClient.post(API_ENDPOINTS.INBOX_MARK_READ(conversationId)).then((r) => r.data),

        incrementConversationUnread(conversationId) {
            const c = this.conversations.find((c) => c.id === conversationId);
            if (c) c.unread_count = (c.unread_count || 0) + 1;
        },

        resetConversationUnread(conversationId) {
            const c = this.conversations.find((c) => c.id === conversationId);
            if (c) c.unread_count = 0;
        },

        upsertConversation(conversation) {
            const idx = this.conversations.findIndex((c) => c.id === conversation.id);
            if (idx !== -1) this.conversations[idx] = conversation;
            else this.conversations.unshift(conversation);
        },

        updateConversationLastMessage(conversationId, lastMessage) {
            const c = this.conversations.find((c) => c.id === conversationId);
            if (c) c.last_message = lastMessage;
        },

        removeConversation(conversationId) {
            this.conversations = this.conversations.filter((c) => c.id !== conversationId);
        },

        // ---------- Messages ----------
        deleteMessageForMe: (messageId) =>
            apiClient.post(API_ENDPOINTS.INBOX_DELETE_FOR_ME(messageId)).then((r) => r.data),

        deleteMessageForEveryone: (messageId) =>
            apiClient.post(API_ENDPOINTS.INBOX_DELETE_FOR_EVERYONE(messageId)).then((r) => r.data),

        clearChat: (conversationId, deleteChat = false) =>
            apiClient.post(API_ENDPOINTS.INBOX_CLEAR_CHAT(conversationId), { delete_chat: deleteChat }).then((r) => r.data),

        // ---------- Group / avatars ----------
        updateGroupAvatar: (conversationId, formData) =>
            apiClient
                .post(API_ENDPOINTS.INBOX_UPDATE_GROUP_AVATAR(conversationId), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((r) => r.data),

        fetchGroupAvatarBlob: (conversationId) =>
            blobUrl(API_ENDPOINTS.INBOX_GET_GROUP_AVATAR(conversationId)).catch((err) => {
                console.error('Failed to fetch group avatar:', err);
                return null;
            }),

        leaveGroup: (conversationId) =>
            apiClient.post(API_ENDPOINTS.INBOX_LEAVE_GROUP(conversationId)).then((r) => r.data),

        addGroupMembers: (conversationId, memberIds) =>
            apiClient.post(API_ENDPOINTS.INBOX_ADD_MEMBERS(conversationId), { member_ids: memberIds }).then((r) => r.data),

        updateMyAvatar: (formData) =>
            apiClient
                .post(API_ENDPOINTS.ACCOUNTS_UPDATE_MY_AVATAR, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then((r) => r.data),

        async fetchUserAvatarBlob(userId) {
            if (this.userAvatars[userId]) return this.userAvatars[userId];
            try {
                return (this.userAvatars[userId] = await blobUrl(API_ENDPOINTS.ACCOUNTS_GET_USER_AVATAR(userId)));
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

        // ---------- SSE ----------
        connectSSE(onMessage) {
            const token = getToken();
            if (!token) return;
            if (this.eventSource && this._connectingToken === token) return; // already connected with this token

            this.disconnectSSE();
            this._connectingToken = token;

            this.eventSource = new EventSource(`${BASE_URL}${API_ENDPOINTS.INBOX_SSE_STREAM}?token=${token}`);
            this.eventSource.onopen = () => { this.sseConnected = true; };
            this.eventSource.onmessage = (e) => {
                try { onMessage(JSON.parse(e.data)); } catch (err) { console.error('SSE parse error:', err); }
            };
            this.eventSource.onerror = (err) => {
                this.sseConnected = false;
                console.error('SSE connection error:', err);
            };
        },

        async markOffline() {
            try {
                await apiClient.post(API_ENDPOINTS.INBOX_MARK_OFFLINE);
            } catch (err) {
                console.error('Failed to mark offline:', err);
            }
        },

        disconnectSSE() {
            if (!this.eventSource) return;
            this.eventSource.close();
            this.eventSource = null;
            this.sseConnected = false;
            this._connectingToken = null;
        },
    },
});