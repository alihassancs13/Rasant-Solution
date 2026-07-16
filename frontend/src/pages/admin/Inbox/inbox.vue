<script setup>
import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue'
import AppHeader from '../../../components/header.vue'
import AdminSidebar from '@/components/adminSidebar.vue'

const threads = ref([
  {
    id: 1,
    contactId: 101,
    name: 'Ayesha Khan',
    initials: 'AK',
    online: true,
    unread: 2,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
    lastMessage: 'Can you review the increment policy draft?',
    messages: [
      { id: 1, fromMe: false, text: 'Hi! Can you review the increment policy draft?', timestamp: new Date(Date.now() - 1000 * 60 * 20) },
      { id: 2, fromMe: true, text: 'Sure, sending feedback in a bit.', timestamp: new Date(Date.now() - 1000 * 60 * 12), status: 'read' },
      { id: 3, fromMe: false, text: 'Thank you, appreciate it!', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    ],
  },
  {
    id: 2,
    contactId: 102,
    name: 'Bilal Ahmed',
    initials: 'BA',
    online: false,
    unread: 0,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastMessage: 'CV shortlisting is done for the frontend role.',
    messages: [
      { id: 1, fromMe: false, text: 'CV shortlisting is done for the frontend role.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { id: 2, fromMe: true, text: 'Great, forward the shortlist to me.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), status: 'delivered' },
    ],
  },
  {
    id: 3,
    contactId: 104,
    name: 'HR Team',
    initials: 'HR',
    online: true,
    unread: 5,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    lastMessage: 'Salary sheet updated for this month.',
    messages: [
      { id: 1, fromMe: false, text: 'Salary sheet updated for this month.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
    ],
  },
  {
    id: 4,
    contactId: 103,
    name: 'Zara Malik',
    initials: 'ZM',
    online: false,
    unread: 0,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    lastMessage: 'Thanks for the quick response.',
    messages: [
      { id: 1, fromMe: false, text: 'Thanks for the quick response.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
    ],
  },
])

const contacts = ref([
  { id: 101, name: 'Ayesha Khan', initials: 'AK', role: 'employee', online: true },
  { id: 102, name: 'Bilal Ahmed', initials: 'BA', role: 'employee', online: false },
  { id: 103, name: 'Zara Malik', initials: 'ZM', role: 'employee', online: false },
  { id: 104, name: 'HR Team', initials: 'HR', role: 'admin', online: true },
  { id: 105, name: 'Hassan Raza', initials: 'HR', role: 'employee', online: true },
  { id: 106, name: 'System Admin', initials: 'SA', role: 'admin', online: true },
])

const activeThreadId = ref(null)
const searchQuery = ref('')
const messageText = ref('')
const mobileChatOpen = ref(false)
const messagesContainer = ref(null)

const showContactsPanel = ref(false)
const contactSearchQuery = ref('')
const contactsLoading = ref(false)

/* ---------------- Chat header menu (clear chat) ---------------- */
const showChatMenu = ref(false)

/* ---------------- Message context menu (right-click / long-press) ---------------- */
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  threadId: null,
  message: null,
})

let longPressTimer = null
let longPressFired = false
let touchStartX = 0
let touchStartY = 0
const LONG_PRESS_MS = 500
const TOUCH_MOVE_TOLERANCE = 10

/* ---------------- Confirm modal (delete message / clear chat) ---------------- */
const confirmModal = reactive({
  visible: false,
  title: '',
  description: '',
  confirmLabel: 'Delete',
  action: null, // function to run on confirm
})

function openConfirmModal({ title, description, confirmLabel = 'Delete', action }) {
  confirmModal.title = title
  confirmModal.description = description
  confirmModal.confirmLabel = confirmLabel
  confirmModal.action = action
  confirmModal.visible = true
}

function closeConfirmModal() {
  confirmModal.visible = false
  confirmModal.action = null
}

function runConfirmedAction() {
  if (typeof confirmModal.action === 'function') confirmModal.action()
  closeConfirmModal()
}

const filteredThreads = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = q
      ? threads.value.filter(
          (t) => t.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q)
      )
      : threads.value

  return [...list].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
})

const filteredContacts = computed(() => {
  const q = contactSearchQuery.value.trim().toLowerCase()
  if (!q) return contacts.value
  return contacts.value.filter((c) => c.name.toLowerCase().includes(q))
})

const activeThread = computed(
    () => threads.value.find((t) => t.id === activeThreadId.value) || null
)

function formatMessageTime(date) {
  const d = new Date(date)
  const now = new Date()

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfToday - startOfThat) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString([], { weekday: 'long' })
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatBubbleTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function selectThread(id) {
  activeThreadId.value = id
  mobileChatOpen.value = true
  const thread = threads.value.find((t) => t.id === id)
  if (thread) thread.unread = 0
  closeContextMenu()
  showChatMenu.value = false
  scrollToBottom()
}

function backToList() {
  mobileChatOpen.value = false
}

function sendMessage() {
  const text = messageText.value.trim()
  if (!text || !activeThread.value) return

  const now = new Date()
  const newMsg = {
    id: activeThread.value.messages.length
        ? Math.max(...activeThread.value.messages.map((m) => m.id)) + 1
        : 1,
    fromMe: true,
    text,
    timestamp: now,
    status: 'sent',
  }

  activeThread.value.messages.push(newMsg)
  activeThread.value.lastMessage = text
  activeThread.value.lastMessageAt = now
  messageText.value = ''
  scrollToBottom()
  setTimeout(() => { newMsg.status = 'delivered' }, 800)
  setTimeout(() => { newMsg.status = 'read' }, 2000)
}
function onIncomingMessage(threadId, message) {
  const thread = threads.value.find((t) => t.id === threadId)
  if (!thread) return

  thread.messages.push(message)
  thread.lastMessage = message.text
  thread.lastMessageAt = message.timestamp
  if (thread.id !== activeThreadId.value) thread.unread++
  if (thread.id === activeThreadId.value) scrollToBottom()
}

function openContactsPanel() {
  showContactsPanel.value = true
  contactSearchQuery.value = ''
}

function closeContactsPanel() {
  showContactsPanel.value = false
  contactSearchQuery.value = ''
}

function startChatWithContact(contact) {
  const existing = threads.value.find((t) => t.contactId === contact.id)

  if (existing) {
    selectThread(existing.id)
  } else {
    const newThread = {
      id: threads.value.length ? Math.max(...threads.value.map((t) => t.id)) + 1 : 1,
      contactId: contact.id,
      name: contact.name,
      initials: contact.initials,
      online: contact.online,
      unread: 0,
      lastMessageAt: new Date(),
      lastMessage: '',
      messages: [],
    }
    threads.value.unshift(newThread)
    selectThread(newThread.id)
  }

  closeContactsPanel()
}

/* ---------------- Message preview sync after delete/clear ---------------- */
function refreshThreadPreview(thread) {
  if (!thread.messages.length) {
    thread.lastMessage = ''
    return
  }
  const last = thread.messages[thread.messages.length - 1]
  thread.lastMessage = last.deletedForEveryone ? 'This message was deleted' : last.text
  thread.lastMessageAt = last.timestamp
}

/* ---------------- Context menu (right-click on web, long-press on mobile) ---------------- */
function positionMenu(clientX, clientY) {
  const MENU_WIDTH = 200
  const MENU_HEIGHT = 96
  const padding = 8
  let x = clientX
  let y = clientY

  if (x + MENU_WIDTH + padding > window.innerWidth) x = window.innerWidth - MENU_WIDTH - padding
  if (y + MENU_HEIGHT + padding > window.innerHeight) y = window.innerHeight - MENU_HEIGHT - padding
  if (x < padding) x = padding
  if (y < padding) y = padding

  contextMenu.x = x
  contextMenu.y = y
}

function openContextMenu(event, msg, threadId) {
  // Sirf apna (fromMe) message hi delete kiya ja sakta hai
  if (!msg.fromMe) return
  event.preventDefault()
  contextMenu.message = msg
  contextMenu.threadId = threadId
  positionMenu(event.clientX, event.clientY)
  contextMenu.visible = true
}

function closeContextMenu() {
  contextMenu.visible = false
  contextMenu.message = null
  contextMenu.threadId = null
}

function handleTouchStart(event, msg, threadId) {
  if (!msg.fromMe) return
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  longPressFired = false

  longPressTimer = setTimeout(() => {
    longPressFired = true
    contextMenu.message = msg
    contextMenu.threadId = threadId
    positionMenu(touchStartX, touchStartY)
    contextMenu.visible = true
    if (navigator.vibrate) navigator.vibrate(15)
  }, LONG_PRESS_MS)
}

function handleTouchMove(event) {
  if (!longPressTimer) return
  const touch = event.touches[0]
  const dx = Math.abs(touch.clientX - touchStartX)
  const dy = Math.abs(touch.clientY - touchStartY)
  if (dx > TOUCH_MOVE_TOLERANCE || dy > TOUCH_MOVE_TOLERANCE) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function handleTouchEnd(event) {
  clearTimeout(longPressTimer)
  longPressTimer = null
  if (longPressFired) {
    // ghost click ko rokna jo long-press k baad fire hota hai
    event.preventDefault()
  }
}

/* ---------------- Delete actions ---------------- */
function requestDeleteForMe() {
  const { message, threadId } = contextMenu
  closeContextMenu()
  if (!message || !threadId) return

  openConfirmModal({
    title: 'Delete message?',
    description: 'This message will be removed from your chat only. The other person can still see it.',
    confirmLabel: 'Delete for me',
    action: () => {
      const thread = threads.value.find((t) => t.id === threadId)
      if (!thread) return
      thread.messages = thread.messages.filter((m) => m.id !== message.id)
      refreshThreadPreview(thread)
    },
  })
}

function requestDeleteForEveryone() {
  const { message, threadId } = contextMenu
  closeContextMenu()
  if (!message || !threadId) return

  openConfirmModal({
    title: 'Delete message for everyone?',
    description: 'This message will be deleted for everyone in the chat. This cannot be undone.',
    confirmLabel: 'Delete for everyone',
    action: () => {
      const thread = threads.value.find((t) => t.id === threadId)
      if (!thread) return
      const target = thread.messages.find((m) => m.id === message.id)
      if (!target) return
      target.deletedForEveryone = true
      target.text = 'This message was deleted'
      delete target.status
      refreshThreadPreview(thread)
    },
  })
}

/* ---------------- Clear chat (apni side se hi, doosre user ko messages waisay hi dikhtay rehtay hain) ---------------- */
function toggleChatMenu() {
  showChatMenu.value = !showChatMenu.value
}

function requestClearChat() {
  showChatMenu.value = false
  if (!activeThread.value) return
  const thread = activeThread.value

  openConfirmModal({
    title: 'Clear this chat?',
    description: 'All messages will be cleared from your view only. The other person\'s chat will not be affected.',
    confirmLabel: 'Clear chat',
    action: () => {
      thread.messages = []
      thread.lastMessage = ''
    },
  })
}

/* ---------------- Global listeners to close context menu ---------------- */
function handleGlobalClick() {
  if (contextMenu.visible) closeContextMenu()
  if (showChatMenu.value) showChatMenu.value = false
}
function handleGlobalScroll() {
  if (contextMenu.visible) closeContextMenu()
}
function handleEscKey(e) {
  if (e.key === 'Escape') {
    closeContextMenu()
    closeConfirmModal()
    showChatMenu.value = false
  }
}

window.addEventListener('click', handleGlobalClick)
window.addEventListener('scroll', handleGlobalScroll, true)
window.addEventListener('keydown', handleEscKey)

onBeforeUnmount(() => {
  window.removeEventListener('click', handleGlobalClick)
  window.removeEventListener('scroll', handleGlobalScroll, true)
  window.removeEventListener('keydown', handleEscKey)
  clearTimeout(longPressTimer)
})
</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader
            class="w-full"
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Inbox"
            subtitleOverride="Manage your messages and notifications"
        />
      </div>

      <!-- Inbox Content -->
      <div class="flex-1 min-h-0 overflow-hidden px-3 sm:px-4 pb-4">
        <div class="h-full overflow-hidden rounded-xl border border-border bg-card shadow-card-small">
          <div class="flex h-full">
            <!-- Threads sidebar -->
            <aside
                class="w-full min-h-0 flex-col overflow-hidden border-r border-border-subtle md:flex md:w-[320px] lg:w-[360px]"
                :class="mobileChatOpen ? 'hidden' : 'flex'"
            >
              <!-- New chat / contacts panel -->
              <template v-if="showContactsPanel">
                <div class="flex items-center gap-3 border-b border-border-subtle px-4 py-4">
                  <button
                      type="button"
                      @click="closeContactsPanel"
                      aria-label="Back"
                      class="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer"
                  >
                    <i class="fa-solid fa-arrow-left text-[16px]"></i>
                  </button>
                  <span class="font-display text-lg font-bold text-primary-900">New chat</span>
                </div>

                <div class="px-4 py-3">
                  <div class="relative">
                    <i
                        class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"
                        aria-hidden="true"
                    ></i>
                    <input
                        v-model="contactSearchQuery"
                        type="search"
                        placeholder="Search contacts..."
                        aria-label="Search contacts"
                        class="w-full rounded-full border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-[border-color,box-shadow] duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div class="flex-1 min-h-0 space-y-1 overflow-y-auto px-2 pb-3 scrollbar-whatsapp">
                  <p v-if="contactsLoading" class="px-3 py-6 text-center text-sm text-text-muted">
                    Loading contacts...
                  </p>

                  <template v-else>
                    <button
                        v-for="contact in filteredContacts"
                        :key="contact.id"
                        type="button"
                        @click="startChatWithContact(contact)"
                        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-alt cursor-pointer"
                    >
                      <div class="relative shrink-0">
                        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                          {{ contact.initials }}
                        </div>
                        <span
                            v-if="contact.online"
                            class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"
                        ></span>
                      </div>

                      <div class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-medium text-text-primary">{{ contact.name }}</span>
                        <span class="block truncate text-xs capitalize text-text-secondary">{{ contact.role }}</span>
                      </div>
                    </button>

                    <p v-if="!filteredContacts.length" class="px-3 py-6 text-center text-sm text-text-muted">
                      No contacts found.
                    </p>
                  </template>
                </div>
              </template>

              <!-- Conversation list -->
              <template v-else>
                <div class="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-[18px]">
                  <span class="font-display text-xl font-extrabold text-primary-900">Messages</span>
                  <button
                      type="button"
                      @click="openContactsPanel"
                      aria-label="New chat"
                      class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer"
                  >
                    <i class="fa-solid fa-plus text-[16px]"></i>
                  </button>
                </div>

                <div class="px-4 py-3">
                  <div class="relative">
                    <i
                        class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"
                        aria-hidden="true"
                    ></i>
                    <input
                        v-model="searchQuery"
                        type="search"
                        placeholder="Search conversations..."
                        aria-label="Search conversations"
                        class="w-full rounded-full border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-[border-color,box-shadow] duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div class="flex-1 min-h-0 space-y-1 overflow-y-auto px-2 pb-3 scrollbar-whatsapp">
                  <button
                      v-for="thread in filteredThreads"
                      :key="thread.id"
                      type="button"
                      @click="selectThread(thread.id)"
                      class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer"
                      :class="thread.id === activeThreadId ? 'header-gradient border border-primary-light shadow-sm' : 'hover:bg-surface-alt'"
                  >
                    <div class="relative shrink-0">
                      <div class="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                        {{ thread.initials }}
                      </div>
                      <span
                          v-if="thread.online"
                          class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"
                      ></span>
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate text-sm font-medium text-text-primary">{{ thread.name }}</span>
                        <span class="shrink-0 text-[11px] text-text-muted">{{ formatMessageTime(thread.lastMessageAt) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate text-xs text-text-secondary">{{ thread.lastMessage || 'No messages yet' }}</span>
                        <span
                            v-if="thread.unread"
                            class="ml-1 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white"
                        >
                          {{ thread.unread }}
                        </span>
                      </div>
                    </div>
                  </button>

                  <p v-if="!filteredThreads.length" class="px-3 py-6 text-center text-sm text-text-muted">
                    No conversations found.
                  </p>
                </div>
              </template>
            </aside>

            <!-- Chat panel -->
            <section
                class="min-w-0 flex-1 flex-col md:flex"
                :class="mobileChatOpen ? 'flex' : 'hidden'"
            >
              <template v-if="activeThread">
                <div class="relative flex items-center gap-3 border-b border-border bg-inbox-header-gradient px-4 py-3">
                  <button
                      type="button"
                      @click="backToList"
                      aria-label="Back to conversations"
                      class="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt md:hidden cursor-pointer"
                  >
                    <i class="fa-solid fa-arrow-left text-[18px]"></i>
                  </button>

                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                    {{ activeThread.initials }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-display text-base font-semibold text-headingCard">{{ activeThread.name }}</h3>
                    <span class="font-display text-xs font-normal text-text-secondary">
                      {{ activeThread.online ? 'Online' : 'Team messages' }}
                    </span>
                  </div>

                  <!-- Chat options (Clear chat) -->
                  <div class="relative shrink-0">
                    <button
                        type="button"
                        @click.stop="toggleChatMenu"
                        aria-label="Chat options"
                        class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer"
                    >
                      <i class="fa-solid fa-ellipsis-vertical text-[16px]"></i>
                    </button>

                    <div
                        v-if="showChatMenu"
                        @click.stop
                        class="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card-small"
                    >
                      <button
                          type="button"
                          @click="requestClearChat"
                          class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-alt cursor-pointer"
                      >
                        <i class="fa-solid fa-broom text-[13px] text-text-secondary"></i>
                        Clear chat
                      </button>
                    </div>
                  </div>
                </div>

                <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto bg-messages-gradient px-4 py-4 scrollbar-whatsapp">
                  <div
                      v-for="msg in activeThread.messages"
                      :key="msg.id"
                      class="flex"
                      :class="msg.fromMe ? 'justify-end' : 'justify-start'"
                  >
                    <div
                        class="max-w-[75%] select-none rounded-xl px-3.5 py-2 text-sm leading-relaxed"
                        :class="[
                          msg.fromMe
                            ? 'rounded-br-[4px] bg-chat-bubble-me-gradient text-white shadow-bubble-me'
                            : 'rounded-bl-[4px] border border-border bg-card text-text-primary shadow-[var(--shadow-sm)]',
                          msg.fromMe ? 'cursor-pointer' : 'cursor-default',
                        ]"
                        style="touch-action: manipulation;"
                        @contextmenu="openContextMenu($event, msg, activeThread.id)"
                        @touchstart="handleTouchStart($event, msg, activeThread.id)"
                        @touchmove="handleTouchMove($event)"
                        @touchend="handleTouchEnd($event)"
                    >
                      <span :class="msg.deletedForEveryone ? 'italic text-white/70' : ''">
                        <i v-if="msg.deletedForEveryone" class="fa-solid fa-ban mr-1 text-[11px]"></i>{{ msg.text }}
                      </span>
                      <div class="mt-1 flex items-center justify-end gap-1 text-[10px]" :class="msg.fromMe ? 'text-white/70' : 'text-text-muted'">
                        <span>{{ formatBubbleTime(msg.timestamp) }}</span>
                        <i
                            v-if="msg.fromMe && !msg.deletedForEveryone"
                            class="text-[12px] leading-none"
                            :class="[
                              msg.status === 'read' ? 'fa-solid fa-check-double text-sky-300' : '',
                              msg.status === 'delivered' ? 'fa-solid fa-check-double text-white/70' : '',
                              msg.status === 'sent' ? 'fa-solid fa-check text-white/70' : '',
                            ]"
                        ></i>
                      </div>
                    </div>
                  </div>

                  <div v-if="!activeThread.messages.length" class="flex h-full items-center justify-center text-sm text-text-muted">
                    No messages yet
                  </div>
                </div>

                <form @submit.prevent="sendMessage" class="flex items-center gap-2 border-t border-border bg-card px-3 py-3">
                  <input
                      v-model="messageText"
                      type="text"
                      placeholder="Message..."
                      autocomplete="off"
                      enterkeyhint="send"
                      class="flex-1 rounded-full border border-border bg-surface-alt px-4 py-2 text-sm text-text-primary placeholder:text-text-muted transition-[border-color,background-color,box-shadow] duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                      type="submit"
                      aria-label="Send message"
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover cursor-pointer"
                  >
                    <i class="fa-solid fa-paper-plane text-[14px] "></i>
                  </button>
                </form>
              </template>

              <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 bg-messages-gradient text-text-muted">
                <div class="flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt">
                  <i class="fa-solid fa-comments text-[22px]"></i>
                </div>
                <p class="text-sm">Select a chat to start messaging</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- Message context menu (web right-click / mobile long-press) -->
    <Teleport to="body">
      <div
          v-if="contextMenu.visible"
          @click.stop
          class="fixed z-[60] w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card-small"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <button
            v-if="!contextMenu.message?.deletedForEveryone"
            type="button"
            @click="requestDeleteForEveryone"
            class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-surface-alt cursor-pointer"
        >
          <i class="fa-solid fa-trash text-[13px]"></i>
          Delete for everyone
        </button>
        <button
            type="button"
            @click="requestDeleteForMe"
            class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-alt cursor-pointer"
        >
          <i class="fa-solid fa-trash-can text-[13px] text-text-secondary"></i>
          Delete for me
        </button>
      </div>
    </Teleport>

    <!-- Confirm modal (delete message / clear chat) -->
    <Teleport to="body">
      <div
          v-if="confirmModal.visible"
          class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
          @click.self="closeConfirmModal"
      >
        <div class="w-full max-w-sm rounded-2xl bg-card p-5 shadow-card-small">
          <h3 class="font-display text-base font-semibold text-text-primary">{{ confirmModal.title }}</h3>
          <p class="mt-2 text-sm text-text-secondary">{{ confirmModal.description }}</p>

          <div class="mt-5 flex justify-end gap-2">
            <button
                type="button"
                @click="closeConfirmModal"
                class="rounded-full px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt cursor-pointer"
            >
              Cancel
            </button>
            <button
                type="button"
                @click="runConfirmedAction"
                class="rounded-full bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
            >
              {{ confirmModal.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
</style>