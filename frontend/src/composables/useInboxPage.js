import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useInboxStore } from '../stores/inboxStore.js';
import { useLoginStore } from '../stores/loginStore.js';

function getInitials(name) {
    if (!name) return '??';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function conversationToThread(conv, currentUserId) {
    const otherMember = conv.members?.find((m) => m.user.id !== currentUserId);
    const lastMsg = conv.last_message;
    return {
        id: conv.id,
        type: conv.type,
        contactId: otherMember?.user?.id ?? null,
        name: conv.display_name || conv.name || 'Unknown',
        initials: getInitials(conv.display_name || conv.name),
        online: false,
        unread: conv.unread_count || 0,
        lastMessageAt: lastMsg?.created_at ? new Date(lastMsg.created_at) : new Date(conv.created_at),
        lastMessage: lastMsg
            ? (lastMsg.deleted_for_everyone ? 'This message was deleted' : lastMsg.content)
            : '',
        messages: [],
        messagesLoaded: false,
    };
}
function computeMessageStatus(receipts) {
    if (!receipts || !receipts.length) return 'sent';
    const allRead = receipts.every((r) => r.is_read);
    const allDelivered = receipts.every((r) => r.is_delivered);
    return allRead ? 'read' : allDelivered ? 'delivered' : 'sent';
}

function mapReceipts(rawReceipts) {
    return (rawReceipts || []).map((r) => ({
        userId: r.user.id,
        name: `${r.user.first_name} ${r.user.last_name}`.trim() || r.user.username,
        is_read: r.is_read,
        is_delivered: r.is_delivered,
    }));
}
function messageToUi(msg, currentUserId) {
    const fromMe = msg.sender.id === currentUserId;
    const receipts = fromMe ? mapReceipts(msg.receipts) : [];
    return {
        id: msg.id,
        fromMe,
        text: msg.deleted_for_everyone ? 'This message was deleted' : msg.content,
        timestamp: new Date(msg.created_at),
        status: fromMe ? computeMessageStatus(receipts) : undefined,
        deletedForEveryone: msg.deleted_for_everyone,
        receipts,
    };
}

const PENDING_STORAGE_KEY_PREFIX = 'inbox_pending_messages_';
const RETRY_INTERVAL_MS = 1000;

export function useInboxPage() {
    const inboxStore = useInboxStore();
    const authStore = useLoginStore();
    const currentUserId = computed(() => authStore.user?.id);

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

    // For Group chat
    const groupCreationMode = ref(false);
    const groupName = ref('');
    const selectedMemberIds = ref([]);
    const creatingGroup = ref(false);

    const contextMenu = reactive({
        visible: false, x: 0, y: 0, threadId: null, message: null,
    });
    const readByMenu = reactive({
        visible: false,
        x: 0,
        y: 0,
        receipts: [],
    });

    let longPressTimer = null;
    let longPressFired = false;
    let touchStartX = 0;
    let touchStartY = 0;
    const LONG_PRESS_MS = 500;
    const TOUCH_MOVE_TOLERANCE = 10;

    const confirmModal = reactive({
        visible: false, title: '', description: '', confirmLabel: 'Delete', action: null,
    });


    // ---------------- Pending / offline queue ----------------
    const pendingQueue = ref([]);
    let retryTimer = null;
    let isFlushingQueue = false;

    function pendingStorageKey() {
        return `${PENDING_STORAGE_KEY_PREFIX}${currentUserId.value ?? 'anon'}`;
    }

    function savePendingQueue() {
        try {
            localStorage.setItem(pendingStorageKey(), JSON.stringify(pendingQueue.value));
        } catch (e) {
            console.error('Failed to persist pending queue:', e);
        }
    }

    function loadPendingQueueFromStorage() {
        try {
            const raw = localStorage.getItem(pendingStorageKey());
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to read pending queue:', e);
            return [];
        }
    }

    function restorePendingMessagesIntoThreads() {
        const stored = loadPendingQueueFromStorage();
        if (!stored.length) return;

        pendingQueue.value = stored;

        for (const pendingMsg of stored) {
            const thread = threads.value.find((t) => t.id === pendingMsg.conversationId);
            if (!thread) continue;
            const alreadyThere = thread.messages.find((m) => m.id === pendingMsg.id);
            if (!alreadyThere) {
                thread.messages.push({
                    id: pendingMsg.id,
                    fromMe: true,
                    text: pendingMsg.text,
                    timestamp: new Date(pendingMsg.timestamp),
                    status: 'pending',
                });
            }
        }
    }
    // -----------------------------------------------------------

    const filteredThreads = computed(() => {
        const q = searchQuery.value.trim().toLowerCase();
        const list = q
            ? threads.value.filter((t) => t.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q))
            : threads.value;
        return [...list].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });

    const filteredContacts = computed(() => {
        const q = contactSearchQuery.value.trim().toLowerCase();
        if (!q) return contacts.value;
        return contacts.value.filter((c) => c.name.toLowerCase().includes(q));
    });

    const activeThread = computed(() => threads.value.find((t) => t.id === activeThreadId.value) || null);

    function formatMessageTime(date) {
        const d = new Date(date);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((startOfToday - startOfThat) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' });
        return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    function formatBubbleTime(date) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function scrollToBottom() {
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        });
    }

    async function loadConversations() {
        const data = await inboxStore.fetchConversations();
        threads.value = data.map((c) => conversationToThread(c, currentUserId.value));
        restorePendingMessagesIntoThreads();
    }

    async function selectThread(id) {
        activeThreadId.value = id;
        mobileChatOpen.value = true;
        closeContextMenu();
        showChatMenu.value = false;

        const thread = threads.value.find((t) => t.id === id);
        if (!thread) return;

        if (!thread.messagesLoaded) {
            const msgs = await inboxStore.fetchMessages(id);
            const serverMsgs = msgs.map((m) => messageToUi(m, currentUserId.value));
            const stillPending = thread.messages.filter((m) => m.status === 'pending');
            thread.messages = [...serverMsgs, ...stillPending];
            thread.messagesLoaded = true;
        }

        if (thread.unread > 0) {
            await inboxStore.markMessagesRead(id);
            thread.unread = 0;
            inboxStore.resetConversationUnread(id);
        }

        scrollToBottom();
    }

    function backToList() {
        mobileChatOpen.value = false;
        activeThreadId.value = null;
    }

    // For Group Chat
    function openGroupCreation() {
        showContactsPanel.value = true;
        groupCreationMode.value = true;
        groupName.value = '';
        selectedMemberIds.value = [];
        contactSearchQuery.value = '';
        if (!contacts.value.length) loadContacts();
    }

    function backFromGroupCreation() {
        groupCreationMode.value = false;
        groupName.value = '';
        selectedMemberIds.value = [];
    }

    function toggleMemberSelection(contactId) {
        const idx = selectedMemberIds.value.indexOf(contactId);
        if (idx === -1) {
            selectedMemberIds.value.push(contactId);
        } else {
            selectedMemberIds.value.splice(idx, 1);
        }
    }

    function isMemberSelected(contactId) {
        return selectedMemberIds.value.includes(contactId);
    }

    async function submitCreateGroup() {
        const name = groupName.value.trim();
        if (!name) return;
        if (selectedMemberIds.value.length < 1) return;

        creatingGroup.value = true;
        try {
            const conv = await inboxStore.createGroupConversation(name, selectedMemberIds.value);
            const newThread = conversationToThread(conv, currentUserId.value);
            threads.value.unshift(newThread);
            inboxStore.upsertConversation(conv);
            closeContactsPanel();
            groupCreationMode.value = false;
            selectThread(newThread.id);
        } catch (err) {
            console.error('Failed to create group:', err);
        } finally {
            creatingGroup.value = false;
        }
    }

    // ---------------- Send message with offline queue ----------------
    async function sendMessage() {
        const text = messageText.value.trim();
        if (!text || !activeThread.value) return;

        messageText.value = '';
        const thread = activeThread.value;
        const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const pendingMsg = {
            id: tempId,
            conversationId: thread.id,
            text,
            timestamp: new Date().toISOString(),
        };

        thread.messages.push({
            id: tempId,
            fromMe: true,
            text,
            timestamp: new Date(pendingMsg.timestamp),
            status: 'pending',
        });
        thread.lastMessage = text;
        thread.lastMessageAt = new Date(pendingMsg.timestamp);
        scrollToBottom();

        pendingQueue.value.push(pendingMsg);
        savePendingQueue();

        await trySendPendingMessage(pendingMsg);
    }

    async function trySendPendingMessage(pendingMsg) {
        const thread = threads.value.find((t) => t.id === pendingMsg.conversationId);
        if (!thread) return;

        try {
            const savedMsg = await inboxStore.sendMessage(pendingMsg.conversationId, pendingMsg.text);
            const uiMsg = messageToUi(savedMsg, currentUserId.value);
            const idx = thread.messages.findIndex((m) => m.id === pendingMsg.id);
            if (idx !== -1) thread.messages.splice(idx, 1, uiMsg);

            pendingQueue.value = pendingQueue.value.filter((m) => m.id !== pendingMsg.id);
            savePendingQueue();
        } catch (err) {
            console.warn('Message still pending, will retry:', err?.message);
        }
    }

    async function flushPendingQueue() {
        if (isFlushingQueue || !pendingQueue.value.length) return;
        isFlushingQueue = true;
        try {
            const queueSnapshot = [...pendingQueue.value];
            for (const msg of queueSnapshot) {
                await trySendPendingMessage(msg);
            }
        } finally {
            isFlushingQueue = false;
        }
    }

    function handleIncomingSSE(data) {
        if (data.type === 'read_receipt') {
            const thread = threads.value.find((t) => t.id === data.conversation_id);
            if (!thread) return;
            const msg = thread.messages.find((m) => m.id === data.message_id);
            if (!msg || !msg.receipts) return;

            const receipt = msg.receipts.find((r) => r.userId === data.reader_id);
            if (receipt) {
                receipt.is_read = true;
                receipt.is_delivered = true;
            } else {
                msg.receipts.push({
                    userId: data.reader_id,
                    name: data.reader_name || 'Unknown',
                    is_read: true,
                    is_delivered: true,
                });
            }
            msg.status = computeMessageStatus(msg.receipts);   // NAYA — sab receipts dekh kar recompute
            return;
        }

        if (data.type === 'delivery_receipt') {
            const thread = threads.value.find((t) => t.id === data.conversation_id);
            if (!thread) return;
            const msg = thread.messages.find((m) => m.id === data.message_id);
            if (!msg || !msg.receipts) return;

            const receipt = msg.receipts.find((r) => r.userId === data.receiver_id);
            if (receipt) {
                receipt.is_delivered = true;
            } else {
                msg.receipts.push({
                    userId: data.receiver_id,
                    name: data.receiver_name || 'Unknown',
                    is_read: false,
                    is_delivered: true,
                });
            }
            msg.status = computeMessageStatus(msg.receipts);   // NAYA
            return;
        }

        if (data.type === 'message_deleted') {
            const thread = threads.value.find((t) => t.id === data.conversation_id);
            if (!thread) return;
            const msg = thread.messages.find((m) => m.id === data.id);
            if (msg) {
                msg.deletedForEveryone = true;
                msg.text = 'This message was deleted';
                delete msg.status;
            }
            const lastMsg = thread.messages[thread.messages.length - 1];
            if (lastMsg && lastMsg.id === data.id) {
                thread.lastMessage = 'This message was deleted';
            }
            return;
        }

        const thread = threads.value.find((t) => t.id === data.conversation_id);
        if (!thread) return;

        if (data.sender === currentUserId.value) return;

        const uiMsg = {
            id: data.id,
            fromMe: false,
            text: data.deleted_for_everyone ? 'This message was deleted' : (data.content || ''),
            timestamp: new Date(data.created_at),
            deletedForEveryone: data.deleted_for_everyone,
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
            contacts.value = data.map((u) => ({
                id: u.id,
                name: u.full_name,
                initials: getInitials(u.full_name),
                role: u.role,
                online: false,
            }));
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            contactsLoading.value = false;
        }
    }

    function openContactsPanel() {
        showContactsPanel.value = true;
        contactSearchQuery.value = '';
        if (!contacts.value.length) loadContacts();
    }
    function closeContactsPanel() {
        showContactsPanel.value = false;
        contactSearchQuery.value = '';
        groupCreationMode.value = false;
        groupName.value = '';
        selectedMemberIds.value = [];
    }

    async function startChatWithContact(contact) {
        const existing = threads.value.find((t) => t.contactId === contact.id);
        if (existing) {
            selectThread(existing.id);
        } else {
            const convData = await inboxStore.createDirectConversation(contact.id);
            const conv = convData.conversation || convData;
            const newThread = conversationToThread(conv, currentUserId.value);
            const alreadyInList = threads.value.find((t) => t.id === newThread.id);
            if (!alreadyInList) threads.value.unshift(newThread);
            inboxStore.upsertConversation(conv);
            selectThread(newThread.id);
        }
        closeContactsPanel();
    }

    function refreshThreadPreview(thread) {
        if (!thread.messages.length) {
            thread.lastMessage = '';
            return;
        }
        const last = thread.messages[thread.messages.length - 1];
        thread.lastMessage = last.deletedForEveryone ? 'This message was deleted' : last.text;
        thread.lastMessageAt = last.timestamp;
    }

    function positionMenu(clientX, clientY) {
        const MENU_WIDTH = 200, MENU_HEIGHT = 96, padding = 8;
        let x = clientX, y = clientY;
        if (x + MENU_WIDTH + padding > window.innerWidth) x = window.innerWidth - MENU_WIDTH - padding;
        if (y + MENU_HEIGHT + padding > window.innerHeight) y = window.innerHeight - MENU_HEIGHT - padding;
        if (x < padding) x = padding;
        if (y < padding) y = padding;
        contextMenu.x = x;
        contextMenu.y = y;
    }

    function openContextMenu(event, msg, threadId) {
        if (!msg.fromMe) return;
        event.preventDefault();
        contextMenu.message = msg;
        contextMenu.threadId = threadId;
        positionMenu(event.clientX, event.clientY);
        contextMenu.visible = true;
    }
    function closeContextMenu() {
        contextMenu.visible = false;
        contextMenu.message = null;
        contextMenu.threadId = null;
    }

    function handleTouchStart(event, msg, threadId) {
        if (!msg.fromMe) return;
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        longPressFired = false;
        longPressTimer = setTimeout(() => {
            longPressFired = true;
            contextMenu.message = msg;
            contextMenu.threadId = threadId;
            positionMenu(touchStartX, touchStartY);
            contextMenu.visible = true;
            if (navigator.vibrate) navigator.vibrate(15);
        }, LONG_PRESS_MS);
    }
    function handleTouchMove(event) {
        if (!longPressTimer) return;
        const touch = event.touches[0];
        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);
        if (dx > TOUCH_MOVE_TOLERANCE || dy > TOUCH_MOVE_TOLERANCE) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
    function handleTouchEnd(event) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
        if (longPressFired) event.preventDefault();
    }

    function requestDeleteForMe() {
        const { message, threadId } = contextMenu;
        closeContextMenu();
        if (!message || !threadId) return;
        openConfirmModal({
            title: 'Delete message?',
            description: 'This message will be removed from your chat only. The other person can still see it.',
            confirmLabel: 'Delete for me',
            action: async () => {
                const thread = threads.value.find((t) => t.id === threadId);
                if (!thread) return;
                try {
                    await inboxStore.deleteMessageForMe(message.id);
                    thread.messages = thread.messages.filter((m) => m.id !== message.id);
                    refreshThreadPreview(thread);
                } catch (err) {
                    console.error('Failed to delete message:', err);
                }
            },
        });
    }

    function requestDeleteForEveryone() {
        const { message, threadId } = contextMenu;
        closeContextMenu();
        if (!message || !threadId) return;
        openConfirmModal({
            title: 'Delete message for everyone?',
            description: 'This message will be deleted for everyone in the chat. This cannot be undone.',
            confirmLabel: 'Delete for everyone',
            action: async () => {
                const thread = threads.value.find((t) => t.id === threadId);
                if (!thread) return;
                try {
                    await inboxStore.deleteMessageForEveryone(message.id);
                    const target = thread.messages.find((m) => m.id === message.id);
                    if (target) {
                        target.deletedForEveryone = true;
                        target.text = 'This message was deleted';
                        delete target.status;
                        refreshThreadPreview(thread);
                    }
                } catch (err) {
                    console.error('Failed to delete message for everyone:', err);
                }
            },
        });
    }

    function toggleChatMenu() {
        showChatMenu.value = !showChatMenu.value;
    }

    function requestClearChat() {
        showChatMenu.value = false;
        if (!activeThread.value) return;
        const thread = activeThread.value;
        openConfirmModal({
            title: 'Clear this chat?',
            description: "All messages will be cleared from your view only. The other person's chat will not be affected.",
            confirmLabel: 'Clear chat',
            action: async () => {
                try {
                    await inboxStore.clearChat(thread.id);
                    thread.messages = [];
                    thread.lastMessage = '';
                } catch (err) {
                    console.error('Failed to clear chat:', err);
                }
            },
        });
    }

    function openConfirmModal({ title, description, confirmLabel = 'Delete', action }) {
        confirmModal.title = title;
        confirmModal.description = description;
        confirmModal.confirmLabel = confirmLabel;
        confirmModal.action = action;
        confirmModal.visible = true;
    }
    function closeConfirmModal() {
        confirmModal.visible = false;
        confirmModal.action = null;
    }
    function runConfirmedAction() {
        if (typeof confirmModal.action === 'function') confirmModal.action();
        closeConfirmModal();
    }

    function handleGlobalClick() {
        if (contextMenu.visible) closeContextMenu();
        if (readByMenu.visible) closeReadByMenu();
        if (showChatMenu.value) showChatMenu.value = false;
    }
    function handleGlobalScroll() {
        if (contextMenu.visible) closeContextMenu();
    }
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closeContextMenu();
            closeConfirmModal();
            showChatMenu.value = false;
        }
    }
    function openReadByMenu(event, msg) {
        event.stopPropagation();
        closeContextMenu();
        const rect = event.currentTarget.getBoundingClientRect();
        readByMenu.x = rect.right + 4;
        readByMenu.y = rect.top;
        readByMenu.receipts = msg.receipts || [];
        readByMenu.visible = true;
    }

    function closeReadByMenu() {
        readByMenu.visible = false;
        readByMenu.receipts = [];
    }

    onMounted(async () => {
        await loadConversations();
        inboxStore.connectSSE(handleIncomingSSE);

        retryTimer = setInterval(flushPendingQueue, RETRY_INTERVAL_MS);

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
        threads, contacts, activeThreadId, searchQuery, messageText, mobileChatOpen, messagesContainer,
        showContactsPanel, contactSearchQuery, contactsLoading,
        showChatMenu, contextMenu, confirmModal,
        filteredThreads, filteredContacts, activeThread,
        formatMessageTime, formatBubbleTime, scrollToBottom,
        selectThread, backToList, sendMessage,
        openContactsPanel, closeContactsPanel, startChatWithContact,
        openContextMenu, closeContextMenu, handleTouchStart, handleTouchMove, handleTouchEnd,
        requestDeleteForMe, requestDeleteForEveryone,
        toggleChatMenu, requestClearChat,
        closeConfirmModal, runConfirmedAction,
        groupCreationMode, groupName, selectedMemberIds, creatingGroup,
        openGroupCreation, backFromGroupCreation, toggleMemberSelection, isMemberSelected, submitCreateGroup,
        readByMenu, openReadByMenu, closeReadByMenu,
    };
}