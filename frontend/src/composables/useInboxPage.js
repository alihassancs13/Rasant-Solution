import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useInboxStore } from '../stores/inboxStore.js';
import { useLoginStore } from '../stores/loginStore.js';

const PENDING_KEY = 'inbox_pending_messages_';
const RETRY_MS = 3000;
const LONG_PRESS_MS = 500;
const TOUCH_TOLERANCE = 10;

const getInitials = (name) => name?.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '??';

const computeStatus = (receipts) => {
    if (!receipts?.length) return 'sent';
    if (receipts.every(r => r.is_read)) return 'read';
    if (receipts.every(r => r.is_delivered)) return 'delivered';
    return 'sent';
};

const mapReceipts = (raw) => (raw || []).map(r => ({
    userId: r.user.id,
    name: `${r.user.first_name} ${r.user.last_name}`.trim() || r.user.username,
    is_read: r.is_read,
    is_delivered: r.is_delivered,
}));

const convToThread = (conv, uid) => {
    const other = conv.members?.find(m => m.user.id !== uid);
    const last = conv.last_message;
    return {
        id: conv.id, type: conv.type, contactId: other?.user?.id ?? null,
        avatarUserId: conv.type === 'direct' ? other?.user?.id ?? null : null,
        name: conv.display_name || conv.name || 'Unknown',
        initials: getInitials(conv.display_name || conv.name),
        avatar: null,
        hasAvatar: conv.type === 'group' ? (conv.has_avatar || false) : (other?.user?.has_avatar || false),
        online: false, unread: conv.unread_count || 0,
        lastMessageAt: last?.created_at ? new Date(last.created_at) : new Date(conv.created_at),
        lastMessage: last ? (last.deleted_for_everyone ? 'This message was deleted' : last.content) : '',
        messages: [], messagesLoaded: false, members: conv.members || [],
    };
};

const msgToUi = (msg, uid) => {
    const fromMe = msg.sender.id === uid;
    const receipts = fromMe ? mapReceipts(msg.receipts) : [];
    return {
        id: msg.id, fromMe,
        text: msg.deleted_for_everyone ? 'This message was deleted' : msg.content,
        timestamp: new Date(msg.created_at),
        status: fromMe ? computeStatus(receipts) : undefined,
        deletedForEveryone: msg.deleted_for_everyone, receipts,
    };
};

export function useInboxPage() {
    const inboxStore = useInboxStore();
    const authStore = useLoginStore();
    const currentUserId = computed(() => authStore.user?.id);

    const isLoading = ref(true);
    const threads = ref([]);
    const contacts = ref([]);
    const activeThreadId = ref(null);
    const searchQuery = ref('');
    const messageText = ref('');
    const mobileChatOpen = ref(false);
    const messagesContainer = ref(null);
    const showContactsPanel = ref(false);
    const contactSearchQuery = ref('');
    const contactsLoading = ref(false);
    const showChatMenu = ref(false);
    const showParticipantsPanel = ref(false);

    const groupCreationMode = ref(false);
    const groupName = ref('');
    const selectedMemberIds = ref([]);
    const creatingGroup = ref(false);
    const uploadingGroupPhoto = ref(false);
    const groupPhotoInput = ref(null);

    const showAddMembersPanel = ref(false);
    const addMembersSearchQuery = ref('');
    const selectedNewMemberIds = ref([]);
    const addingMembers = ref(false);
    const myAvatarInput = ref(null);
    const uploadingMyAvatar = ref(false);
    const myAvatar = ref(null);

    const contextMenu = reactive({ visible: false, x: 0, y: 0, threadId: null, message: null });
    const readByMenu = reactive({ visible: false, x: 0, y: 0, receipts: [], totalCount: 0 });
    const confirmModal = reactive({ visible: false, title: '', description: '', confirmLabel: 'Delete', action: null });

    let longPressTimer = null, longPressFired = false, touchStartX = 0, touchStartY = 0;
    const pendingQueue = ref([]);
    let retryTimer = null, isFlushingQueue = false;
    const inFlightIds = new Set();

    const pendingKey = () => `${PENDING_KEY}${currentUserId.value ?? 'anon'}`;
    const savePendingQueue = () => { try { localStorage.setItem(pendingKey(), JSON.stringify(pendingQueue.value)); } catch (e) { console.error(e); } };
    const loadPendingQueue = () => { try { return JSON.parse(localStorage.getItem(pendingKey()) || '[]'); } catch { return []; } };

    function restorePending() {
        const stored = loadPendingQueue();
        for (const p of stored) {
            const t = threads.value.find(t => t.id === p.conversationId);
            if (t && !t.messages.find(m => m.id === p.id)) {
                t.messages.push({ id: p.id, fromMe: true, text: p.text, timestamp: new Date(p.timestamp), status: 'pending' });
            }
        }
        pendingQueue.value = stored;
    }
    function triggerMyAvatarUpload() {
        myAvatarInput.value?.click();
    }

    async function handleMyAvatarChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) { console.error('Image too large'); return; }

        const localPreview = URL.createObjectURL(file);
        myAvatar.value = localPreview;
        uploadingMyAvatar.value = true;
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            await inboxStore.updateMyAvatar(formData);
            inboxStore.clearUserAvatar(currentUserId.value);
            myAvatar.value = await inboxStore.fetchUserAvatarBlob(currentUserId.value);
        } catch (err) {
            console.error('Failed to update avatar:', err);
        } finally {
            uploadingMyAvatar.value = false;
            URL.revokeObjectURL(localPreview);
        }
    }

    const filteredThreads = computed(() => {
        const q = searchQuery.value.trim().toLowerCase();
        const list = q ? threads.value.filter(t => t.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q)) : threads.value;
        return [...list].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });

    const filteredContacts = computed(() => {
        const q = contactSearchQuery.value.trim().toLowerCase();
        return q ? contacts.value.filter(c => c.name.toLowerCase().includes(q)) : contacts.value;
    });

    const activeThread = computed(() => threads.value.find(t => t.id === activeThreadId.value) || null);

    const currentUserMembership = computed(() => {
        if (activeThread.value?.type !== 'group') return null;
        return activeThread.value.members.find(m => m.user.id === currentUserId.value) || null;
    });
    const isCurrentUserGroupAdmin = computed(() => currentUserMembership.value?.role === 'admin');

    // NAYA — group ke members array mein left members bhi hote hain (left_at set hota hai),
    // participants panel mein sirf currently-active members dikhne chahiye
    const activeGroupMembers = computed(() => activeThread.value?.members?.filter(m => !m.left_at) || []);

    const addMembersFilteredContacts = computed(() => {
        if (!activeThread.value) return [];
        const activeIds = new Set(activeThread.value.members.filter(m => !m.left_at).map(m => m.user.id));
        const q = addMembersSearchQuery.value.trim().toLowerCase();
        return contacts.value.filter(c => !activeIds.has(c.id) && (!q || c.name.toLowerCase().includes(q)));
    });

    const formatMessageTime = (date) => {
        const d = new Date(date), now = new Date();
        const diffDays = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
        if (diffDays <= 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' });
        return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatBubbleTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const scrollToBottom = () => nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; });

    async function loadConversations() {
        isLoading.value = true;
        try {
            const data = await inboxStore.fetchConversations();
            threads.value = data.map(c => convToThread(c, currentUserId.value));
            restorePending();
            await Promise.all(
                threads.value
                    .filter(t => t.hasAvatar)
                    .map(async (t) => {
                        t.avatar = t.type === 'group'
                            ? await inboxStore.fetchGroupAvatarBlob(t.id)
                            : await inboxStore.fetchUserAvatarBlob(t.avatarUserId);
                    })
            );
        } finally {
            isLoading.value = false;
        }
    }

    async function selectThread(id) {
        activeThreadId.value = id;
        mobileChatOpen.value = true;
        closeContextMenu();
        showChatMenu.value = false;
        showParticipantsPanel.value = false;
        showAddMembersPanel.value = false;

        const thread = threads.value.find(t => t.id === id);
        if (!thread) return;

        if (!thread.messagesLoaded) {
            const msgs = await inboxStore.fetchMessages(id);
            const pending = thread.messages.filter(m => m.status === 'pending');
            thread.messages = [...msgs.map(m => msgToUi(m, currentUserId.value)), ...pending];
            thread.messagesLoaded = true;
        }
        if (thread.unread > 0) {
            await inboxStore.markMessagesRead(id);
            thread.unread = 0;
            inboxStore.resetConversationUnread(id);
        }
        scrollToBottom();
    }

    const backToList = () => { mobileChatOpen.value = false; activeThreadId.value = null; showParticipantsPanel.value = false; };

    const openGroupCreation = () => {
        showContactsPanel.value = true;
        groupCreationMode.value = true;
        groupName.value = '';
        selectedMemberIds.value = [];
        contactSearchQuery.value = '';
        if (!contacts.value.length) loadContacts();
    };
    const backFromGroupCreation = () => { groupCreationMode.value = false; groupName.value = ''; selectedMemberIds.value = []; };
    const toggleMemberSelection = (id) => {
        const i = selectedMemberIds.value.indexOf(id);
        i === -1 ? selectedMemberIds.value.push(id) : selectedMemberIds.value.splice(i, 1);
    };
    const isMemberSelected = (id) => selectedMemberIds.value.includes(id);

    async function submitCreateGroup() {
        const name = groupName.value.trim();
        if (!name || !selectedMemberIds.value.length) return;
        creatingGroup.value = true;
        try {
            const conv = await inboxStore.createGroupConversation(name, selectedMemberIds.value);
            const thread = convToThread(conv, currentUserId.value);
            threads.value.unshift(thread);
            inboxStore.upsertConversation(conv);
            closeContactsPanel();
            groupCreationMode.value = false;
            selectThread(thread.id);
        } catch (err) {
            console.error('Failed to create group:', err);
        } finally {
            creatingGroup.value = false;
        }
    }

    async function sendMessage() {
        const text = messageText.value.trim();
        if (!text || !activeThread.value) return;
        messageText.value = '';
        const thread = activeThread.value;
        const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const pendingMsg = { id: tempId, conversationId: thread.id, text, timestamp: new Date().toISOString() };

        thread.messages.push({ id: tempId, fromMe: true, text, timestamp: new Date(pendingMsg.timestamp), status: 'pending' });
        thread.lastMessage = text;
        thread.lastMessageAt = new Date(pendingMsg.timestamp);
        scrollToBottom();

        pendingQueue.value.push(pendingMsg);
        savePendingQueue();
        await trySend(pendingMsg);
    }

    async function trySend(pendingMsg) {
        if (inFlightIds.has(pendingMsg.id)) return;
        inFlightIds.add(pendingMsg.id);
        const thread = threads.value.find(t => t.id === pendingMsg.conversationId);
        if (!thread) return;
        try {
            const saved = await inboxStore.sendMessage(pendingMsg.conversationId, pendingMsg.text);
            const uiMsg = msgToUi(saved, currentUserId.value);
            const idx = thread.messages.findIndex(m => m.id === pendingMsg.id);
            if (idx !== -1) thread.messages.splice(idx, 1, uiMsg);
            pendingQueue.value = pendingQueue.value.filter(m => m.id !== pendingMsg.id);
            savePendingQueue();
        } catch (err) {
            console.warn('Message still pending:', err?.message);
        }finally {
            inFlightIds.delete(pendingMsg.id);
        }
    }

    async function flushPendingQueue() {
        if (isFlushingQueue || !pendingQueue.value.length) return;
        isFlushingQueue = true;
        try {
            for (const m of [...pendingQueue.value]) await trySend(m);
        } finally {
            isFlushingQueue = false;
        }
    }

    async function reAddConversation(conversationId) {
        try {
            const all = await inboxStore.fetchConversations();
            const conv = all.find(c => c.id === conversationId);
            if (!conv) return;

            let thread = threads.value.find(t => t.id === conv.id);
            const other = conv.members?.find(m => m.user.id !== currentUserId.value);
            const hasAvatarNow = conv.type === 'group' ? (conv.has_avatar || false) : (other?.user?.has_avatar || false);

            if (!thread) {
                thread = convToThread(conv, currentUserId.value);
                thread.unread = conv.unread_count || 1;
                threads.value.unshift(thread);
            } else {
                thread.members = conv.members || [];
                thread.hasAvatar = hasAvatarNow;
                thread.name = conv.display_name || conv.name || thread.name;
                thread.initials = getInitials(conv.display_name || conv.name);
            }
            inboxStore.upsertConversation(conv);

            if (thread.hasAvatar) {
                thread.avatar = thread.type === 'group'
                    ? await inboxStore.fetchGroupAvatarBlob(thread.id)
                    : await inboxStore.fetchUserAvatarBlob(thread.avatarUserId);
            } else {
                thread.avatar = null;
            }
        } catch (err) {
            console.error('Failed to re-add conversation:', err);
        }
    }
    function handleIncomingSSE(data) {
        const thread = threads.value.find(t => t.id === data.conversation_id);
        if (data.type === 'member_avatar_updated') {
            inboxStore.clearUserAvatar(data.user_id);
            threads.value
                .filter(t => t.id === data.conversation_id || t.avatarUserId === data.user_id)
                .forEach(async (t) => {
                    if (t.type === 'direct' && t.avatarUserId === data.user_id) {
                        t.hasAvatar = data.has_avatar;
                        t.avatar = data.has_avatar ? await inboxStore.fetchUserAvatarBlob(data.user_id) : null;
                    }
                    const member = t.members?.find(m => m.user.id === data.user_id);
                    if (member) member.user.has_avatar = data.has_avatar;
                });
            return;
        }
        if (data.type === 'added_to_conversation') {
            reAddConversation(data.conversation_id);
            return;
        }

        // NAYA — group members change hue (kisi ne leave kiya ya naya member add hua) — sab connected members ke liye live update
        if (data.type === 'members_updated') {
            if (!thread) return;
            thread.members = data.members || [];
            return;
        }

        if (data.type === 'group_avatar_updated') {
            if (!thread) return;
            (async () => {
                thread.avatar = data.has_avatar ? await inboxStore.fetchGroupAvatarBlob(thread.id) : null;
                thread.hasAvatar = data.has_avatar;
            })();
            return;
        }

        if (data.type === 'read_receipt' || data.type === 'delivery_receipt') {
            if (!thread) return;
            const msg = thread.messages.find(m => m.id === data.message_id);
            if (!msg?.receipts) return;
            const uid = data.reader_id ?? data.receiver_id;
            const name = data.reader_name ?? data.receiver_name;
            let r = msg.receipts.find(r => r.userId === uid);
            if (!r) { r = { userId: uid, name: name || 'Unknown', is_read: false, is_delivered: false }; msg.receipts.push(r); }
            r.is_delivered = true;
            if (data.type === 'read_receipt') r.is_read = true;
            msg.status = computeStatus(msg.receipts);
            return;
        }

        if (data.type === 'message_deleted') {
            if (!thread) return;
            const msg = thread.messages.find(m => m.id === data.id);
            if (msg) { msg.deletedForEveryone = true; msg.text = 'This message was deleted'; delete msg.status; }
            if (thread.messages.at(-1)?.id === data.id) thread.lastMessage = 'This message was deleted';
            return;
        }

        if (!thread) { if (data.sender !== currentUserId.value) reAddConversation(data.conversation_id); return; }
        if (data.sender === currentUserId.value) return;

        // NAYA — agar ye message id pehle se thread.messages mein maujood hai (duplicate SSE delivery,
        // jaise reconnect ya naye conversation ki timing race ki wajah se), to dobara add na karo
        if (thread.messages.some(m => m.id === data.id)) return;

        const uiMsg = {
            id: data.id, fromMe: false,
            text: data.deleted_for_everyone ? 'This message was deleted' : (data.content || ''),
            timestamp: new Date(data.created_at), deletedForEveryone: data.deleted_for_everyone,
        };
        thread.messages.push(uiMsg);
        thread.lastMessage = uiMsg.text;
        thread.lastMessageAt = uiMsg.timestamp;

        if (thread.id !== activeThreadId.value) {
            thread.unread++;
            inboxStore.incrementConversationUnread(thread.id);
        } else {
            scrollToBottom();
            inboxStore.markMessagesRead(thread.id);
        }
    }

    async function loadContacts() {
        contactsLoading.value = true;
        try {
            const data = await inboxStore.fetchContacts();
            contacts.value = data.map(u => ({ id: u.id, name: u.full_name, initials: getInitials(u.full_name), role: u.role, online: false }));
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            contactsLoading.value = false;
        }
    }

    const openContactsPanel = () => { showContactsPanel.value = true; contactSearchQuery.value = ''; if (!contacts.value.length) loadContacts(); };
    const closeContactsPanel = () => { showContactsPanel.value = false; contactSearchQuery.value = ''; groupCreationMode.value = false; groupName.value = ''; selectedMemberIds.value = []; };

    async function startChatWithContact(contact) {
        const existing = threads.value.find(t => t.contactId === contact.id);
        if (existing) {
            selectThread(existing.id);
        } else {
            const convData = await inboxStore.createDirectConversation(contact.id);
            const conv = convData.conversation || convData;
            const thread = convToThread(conv, currentUserId.value);
            if (!threads.value.find(t => t.id === thread.id)) threads.value.unshift(thread);
            inboxStore.upsertConversation(conv);
            selectThread(thread.id);
        }
        closeContactsPanel();
    }

    function refreshThreadPreview(thread) {
        if (!thread.messages.length) { thread.lastMessage = ''; return; }
        const last = thread.messages.at(-1);
        thread.lastMessage = last.deletedForEveryone ? 'This message was deleted' : last.text;
        thread.lastMessageAt = last.timestamp;
    }

    function positionMenu(x, y, w = 200, h = 96) {
        const pad = 8;
        if (x + w + pad > window.innerWidth) x = window.innerWidth - w - pad;
        if (y + h + pad > window.innerHeight) y = window.innerHeight - h - pad;
        return { x: Math.max(x, pad), y: Math.max(y, pad) };
    }

    function openContextMenu(event, msg, threadId) {
        if (!msg.fromMe) return;
        event.preventDefault();
        contextMenu.message = msg;
        contextMenu.threadId = threadId;
        Object.assign(contextMenu, positionMenu(event.clientX, event.clientY));
        contextMenu.visible = true;
    }
    const closeContextMenu = () => { contextMenu.visible = false; contextMenu.message = null; contextMenu.threadId = null; };

    function handleTouchStart(event, msg, threadId) {
        if (!msg.fromMe) return;
        const t = event.touches[0];
        touchStartX = t.clientX; touchStartY = t.clientY; longPressFired = false;
        longPressTimer = setTimeout(() => {
            longPressFired = true;
            contextMenu.message = msg;
            contextMenu.threadId = threadId;
            Object.assign(contextMenu, positionMenu(touchStartX, touchStartY));
            contextMenu.visible = true;
            navigator.vibrate?.(15);
        }, LONG_PRESS_MS);
    }
    function handleTouchMove(event) {
        if (!longPressTimer) return;
        const t = event.touches[0];
        if (Math.abs(t.clientX - touchStartX) > TOUCH_TOLERANCE || Math.abs(t.clientY - touchStartY) > TOUCH_TOLERANCE) {
            clearTimeout(longPressTimer); longPressTimer = null;
        }
    }
    function handleTouchEnd(event) {
        clearTimeout(longPressTimer); longPressTimer = null;
        if (longPressFired) event.preventDefault();
    }

    function requestDeleteForMe() {
        const { message, threadId } = contextMenu;
        closeContextMenu();
        if (!message || !threadId) return;
        openConfirmModal({
            title: 'Delete message?', confirmLabel: 'Delete for me',
            description: 'This message will be removed from your chat only. The other person can still see it.',
            action: async () => {
                const thread = threads.value.find(t => t.id === threadId);
                if (!thread) return;
                try {
                    await inboxStore.deleteMessageForMe(message.id);
                    thread.messages = thread.messages.filter(m => m.id !== message.id);
                    refreshThreadPreview(thread);
                } catch (err) { console.error(err); }
            },
        });
    }

    function requestDeleteForEveryone() {
        const { message, threadId } = contextMenu;
        closeContextMenu();
        if (!message || !threadId) return;
        openConfirmModal({
            title: 'Delete message for everyone?', confirmLabel: 'Delete for everyone',
            description: 'This message will be deleted for everyone in the chat. This cannot be undone.',
            action: async () => {
                const thread = threads.value.find(t => t.id === threadId);
                if (!thread) return;
                try {
                    await inboxStore.deleteMessageForEveryone(message.id);
                    const target = thread.messages.find(m => m.id === message.id);
                    if (target) {
                        target.deletedForEveryone = true;
                        target.text = 'This message was deleted';
                        delete target.status;
                        refreshThreadPreview(thread);
                    }
                } catch (err) { console.error(err); }
            },
        });
    }

    const toggleChatMenu = () => { showChatMenu.value = !showChatMenu.value; };

    function requestClearChat() {
        showChatMenu.value = false;
        if (!activeThread.value) return;
        const thread = activeThread.value;
        openConfirmModal({
            title: 'Clear this chat?', confirmLabel: 'Clear chat',
            description: "All messages will be cleared from your view only. The other person's chat will not be affected.",
            action: async () => {
                try {
                    await inboxStore.clearChat(thread.id, false);
                    thread.messages = [];
                    thread.lastMessage = '';
                } catch (err) { console.error(err); }
            },
        });
    }

    function requestDeleteChat() {
        showChatMenu.value = false;
        if (!activeThread.value) return;
        const thread = activeThread.value;
        openConfirmModal({
            title: 'Delete this chat?', confirmLabel: 'Delete chat',
            description: 'This conversation will be removed from your chat list. It will reappear if a new message arrives.',
            action: async () => {
                try {
                    await inboxStore.clearChat(thread.id, true);
                    threads.value = threads.value.filter(t => t.id !== thread.id);
                    inboxStore.removeConversation(thread.id);
                    if (activeThreadId.value === thread.id) { activeThreadId.value = null; mobileChatOpen.value = false; }
                } catch (err) { console.error(err); }
            },
        });
    }

    function openConfirmModal({ title, description, confirmLabel = 'Delete', action }) {
        Object.assign(confirmModal, { title, description, confirmLabel, action, visible: true });
    }
    const closeConfirmModal = () => { confirmModal.visible = false; confirmModal.action = null; };
    const runConfirmedAction = () => { confirmModal.action?.(); closeConfirmModal(); };

    const openParticipantsPanel = () => { if (activeThread.value) showParticipantsPanel.value = true; };
    const closeParticipantsPanel = () => { showParticipantsPanel.value = false; };

    function openReadByMenu(event, msg) {
        event.stopPropagation();
        const W = 208, H = 256;
        let x = contextMenu.x + W + 4;
        if (x + W > window.innerWidth) x = contextMenu.x - W - 4;
        let y = contextMenu.y;
        if (y + H > window.innerHeight) y = window.innerHeight - H - 8;
        readByMenu.x = Math.max(x, 8);
        readByMenu.y = Math.max(y, 8);
        readByMenu.receipts = (msg.receipts || []).filter(r => r.is_read);
        readByMenu.totalCount = msg.receipts?.length || 0;
        readByMenu.visible = true;
    }
    const closeReadByMenu = () => { readByMenu.visible = false; readByMenu.receipts = []; readByMenu.totalCount = 0; };

    function handleGlobalClick() {
        if (contextMenu.visible) closeContextMenu();
        if (readByMenu.visible) closeReadByMenu();
        if (showChatMenu.value) showChatMenu.value = false;
    }
    const handleGlobalScroll = () => { if (contextMenu.visible) closeContextMenu(); };
    function handleEscKey(e) {
        if (e.key === 'Escape') { closeContextMenu(); closeConfirmModal(); showChatMenu.value = false; closeParticipantsPanel(); }
    }

    function triggerGroupPhotoUpload() {
        if (activeThread.value?.type !== 'group') return;
        groupPhotoInput.value?.click();
    }

    async function handleGroupPhotoChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !activeThread.value) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) { console.error('Image too large'); return; }

        const thread = activeThread.value;
        const previousAvatar = thread.avatar;
        const localPreview = URL.createObjectURL(file);
        thread.avatar = localPreview;

        uploadingGroupPhoto.value = true;
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const updatedConv = await inboxStore.updateGroupAvatar(thread.id, formData);
            inboxStore.upsertConversation(updatedConv);
            thread.avatar = await inboxStore.fetchGroupAvatarBlob(thread.id);
            thread.hasAvatar = true;
        } catch (err) {
            console.error('Failed to update group photo:', err);
            thread.avatar = previousAvatar;
        } finally {
            uploadingGroupPhoto.value = false;
            URL.revokeObjectURL(localPreview);
        }
    }

    // ---------------- Add members / Leave group ----------------
    function openAddMembersPanel() {
        if (!isCurrentUserGroupAdmin.value) return;
        showAddMembersPanel.value = true;
        addMembersSearchQuery.value = '';
        selectedNewMemberIds.value = [];
        if (!contacts.value.length) loadContacts();
    }
    const closeAddMembersPanel = () => { showAddMembersPanel.value = false; addMembersSearchQuery.value = ''; selectedNewMemberIds.value = []; };
    const toggleNewMemberSelection = (id) => {
        const i = selectedNewMemberIds.value.indexOf(id);
        i === -1 ? selectedNewMemberIds.value.push(id) : selectedNewMemberIds.value.splice(i, 1);
    };
    const isNewMemberSelected = (id) => selectedNewMemberIds.value.includes(id);

    async function submitAddMembers() {
        if (!activeThread.value || !selectedNewMemberIds.value.length) return;
        addingMembers.value = true;
        try {
            const result = await inboxStore.addGroupMembers(activeThread.value.id, selectedNewMemberIds.value);
            activeThread.value.members = result.conversation.members || [];
            inboxStore.upsertConversation(result.conversation);
            closeAddMembersPanel();
        } catch (err) {
            console.error('Failed to add members:', err);
        } finally {
            addingMembers.value = false;
        }
    }

    function requestLeaveGroup() {
        if (activeThread.value?.type !== 'group') return;
        const thread = activeThread.value;
        openConfirmModal({
            title: 'Leave this group?', confirmLabel: 'Leave group',
            description: 'You will no longer receive messages from this group. You can be re-added by an admin.',
            action: async () => {
                try {
                    await inboxStore.leaveGroup(thread.id);
                    threads.value = threads.value.filter(t => t.id !== thread.id);
                    inboxStore.removeConversation(thread.id);
                    closeParticipantsPanel();
                    if (activeThreadId.value === thread.id) { activeThreadId.value = null; mobileChatOpen.value = false; }
                } catch (err) {
                    console.error('Failed to leave group:', err);
                }
            },
        });
    }

    onMounted(async () => {
        await loadConversations();
        myAvatar.value = await inboxStore.fetchUserAvatarBlob(currentUserId.value);
        inboxStore.connectSSE(handleIncomingSSE);
        retryTimer = setInterval(flushPendingQueue, RETRY_MS);
        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('scroll', handleGlobalScroll, true);
        window.addEventListener('keydown', handleEscKey);
    });

    onBeforeUnmount(() => {
        inboxStore.disconnectSSE();
        window.removeEventListener('click', handleGlobalClick);
        window.removeEventListener('scroll', handleGlobalScroll, true);
        window.removeEventListener('keydown', handleEscKey);
        clearTimeout(longPressTimer);
        clearInterval(retryTimer);
    });

    return {
        isLoading, threads, contacts, activeThreadId, searchQuery, messageText, mobileChatOpen, messagesContainer,
        showContactsPanel, contactSearchQuery, contactsLoading, showChatMenu, contextMenu, confirmModal,
        filteredThreads, filteredContacts, activeThread, formatMessageTime, formatBubbleTime,
        selectThread, backToList, sendMessage, openContactsPanel, closeContactsPanel, startChatWithContact,
        openContextMenu, closeContextMenu, handleTouchStart, handleTouchMove, handleTouchEnd,
        requestDeleteForMe, requestDeleteForEveryone, toggleChatMenu, requestClearChat, requestDeleteChat,
        closeConfirmModal, runConfirmedAction,
        groupCreationMode, groupName, selectedMemberIds, creatingGroup,
        openGroupCreation, backFromGroupCreation, toggleMemberSelection, isMemberSelected, submitCreateGroup,
        readByMenu, openReadByMenu, closeReadByMenu,
        showParticipantsPanel, openParticipantsPanel, closeParticipantsPanel,
        uploadingGroupPhoto, groupPhotoInput, triggerGroupPhotoUpload, handleGroupPhotoChange,
        // Add members / Leave group
        showAddMembersPanel, addMembersSearchQuery, selectedNewMemberIds, addingMembers,
        addMembersFilteredContacts, isCurrentUserGroupAdmin, currentUserMembership, activeGroupMembers,
        openAddMembersPanel, closeAddMembersPanel, toggleNewMemberSelection, isNewMemberSelected, submitAddMembers,
        requestLeaveGroup,    myAvatarInput, uploadingMyAvatar, myAvatar, triggerMyAvatarUpload, handleMyAvatarChange,

    };
}