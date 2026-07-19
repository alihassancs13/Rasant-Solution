<script setup>
import AppHeader from '../../../components/header.vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import { useInboxPage } from '../../../composables/useInboxPage.js'

const {
  isLoading, threads, contacts, activeThreadId, searchQuery, messageText, mobileChatOpen, messagesContainer,
  showContactsPanel, contactSearchQuery, contactsLoading,
  showChatMenu, contextMenu, confirmModal,
  filteredThreads, filteredContacts, activeThread,
  formatMessageTime, formatBubbleTime,
  selectThread, backToList, sendMessage,
  openContactsPanel, closeContactsPanel, startChatWithContact,
  openContextMenu, handleTouchStart, handleTouchMove, handleTouchEnd,
  requestDeleteForMe, requestDeleteForEveryone,
  toggleChatMenu, requestClearChat, requestDeleteChat,
  closeConfirmModal, runConfirmedAction,
  groupCreationMode, groupName, selectedMemberIds, creatingGroup,
  openGroupCreation, backFromGroupCreation, toggleMemberSelection, isMemberSelected, submitCreateGroup,
  readByMenu, openReadByMenu, closeReadByMenu,
  showParticipantsPanel, openParticipantsPanel, closeParticipantsPanel, uploadingGroupPhoto, groupPhotoInput,
  triggerGroupPhotoUpload, handleGroupPhotoChange, showAddMembersPanel, addMembersSearchQuery, selectedNewMemberIds, addingMembers,
  addMembersFilteredContacts, isCurrentUserGroupAdmin,
  openAddMembersPanel, closeAddMembersPanel, toggleNewMemberSelection, isNewMemberSelected, submitAddMembers,
  requestLeaveGroup, activeGroupMembers,
  myAvatar, uploadingMyAvatar, myAvatarInput, triggerMyAvatarUpload, handleMyAvatarChange,

} = useInboxPage()
</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader class="w-full" userName="System Admin" role="admin" :notificationCount="1"
                   titleOverride="Inbox" subtitleOverride="Manage your messages and notifications" />
      </div>

      <div class="flex-1 min-h-0 overflow-hidden px-3 sm:px-4 pb-4">
        <div class="h-full overflow-hidden rounded-xl border border-border bg-card shadow-card-small">

          <!-- Loading state -->
          <div v-if="isLoading" class="p-20 text-center text-text-muted">
            <font-awesome-icon :icon="['fas', 'spinner']" spin class="text-4xl text-primary mb-3" />
            <p class="text-sm">Loading your conversations...</p>
          </div>

          <div v-else class="flex h-full">
            <!-- Threads sidebar -->
            <aside class="w-full min-h-0 flex-col overflow-hidden border-r border-border-subtle md:flex md:w-[320px] lg:w-[360px]"
                   :class="mobileChatOpen ? 'hidden' : 'flex'">

              <template v-if="showContactsPanel">
                <div class="flex items-center gap-3 border-b border-border-subtle px-4 py-4">
                  <button type="button" @click="groupCreationMode ? backFromGroupCreation() : closeContactsPanel()"
                          aria-label="Back" class="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer">
                    <i class="fa-solid fa-arrow-left text-[16px]"></i>
                  </button>
                  <span class="font-display text-lg font-bold text-primary-900">{{ groupCreationMode ? 'New group' : 'New chat' }}</span>
                </div>

                <div v-if="groupCreationMode" class="px-4 py-3 border-b border-border-subtle">
                  <input v-model="groupName" type="text" placeholder="Group name..."
                         class="w-full rounded-full border border-border bg-surface-alt px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <p class="mt-2 text-xs text-text-muted">{{ selectedMemberIds.length }} member{{ selectedMemberIds.length === 1 ? '' : 's' }} selected</p>
                </div>

                <div class="px-4 py-3">
                  <div class="relative">
                    <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"></i>
                    <input v-model="contactSearchQuery" type="search" placeholder="Search contacts..."
                           class="w-full rounded-full border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                <div class="flex-1 min-h-0 space-y-1 overflow-y-auto px-2 pb-3 scrollbar-whatsapp">
                  <p v-if="contactsLoading" class="px-3 py-6 text-center text-sm text-text-muted">Loading contacts...</p>
                  <template v-else>
                    <button v-if="!groupCreationMode" type="button" @click="openGroupCreation"
                            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-alt cursor-pointer">
                      <div class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <i class="fa-solid fa-users text-[16px]"></i>
                      </div>
                      <span class="text-sm font-medium text-text-primary">New group</span>
                    </button>

                    <button v-for="contact in filteredContacts" :key="contact.id" type="button"
                            @click="groupCreationMode ? toggleMemberSelection(contact.id) : startChatWithContact(contact)"
                            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-alt cursor-pointer">
                      <div class="relative shrink-0">
                        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">{{ contact.initials }}</div>
                        <span v-if="contact.online" class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"></span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-medium text-text-primary">{{ contact.name }}</span>
                        <span class="block truncate text-xs capitalize text-text-secondary">{{ contact.role }}</span>
                      </div>
                      <div v-if="groupCreationMode" class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                           :class="isMemberSelected(contact.id) ? 'border-primary bg-primary' : 'border-border'">
                        <i v-if="isMemberSelected(contact.id)" class="fa-solid fa-check text-[10px] text-white"></i>
                      </div>
                    </button>
                    <p v-if="!filteredContacts.length" class="px-3 py-6 text-center text-sm text-text-muted">No contacts found.</p>
                  </template>
                </div>

                <div v-if="groupCreationMode" class="border-t border-border-subtle px-4 py-3">
                  <button type="button" @click="submitCreateGroup" :disabled="!groupName.trim() || selectedMemberIds.length < 1 || creatingGroup"
                          class="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    {{ creatingGroup ? 'Creating...' : 'Create group' }}
                  </button>
                </div>
              </template>

              <template v-else>
                <div class="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-[18px]">
                  <span class="font-display text-xl font-extrabold text-primary-900">Messages</span>
                  <div class="flex items-center gap-2">
                    <button type="button" @click="triggerMyAvatarUpload" aria-label="Change my photo" class="relative h-9 w-9 shrink-0 rounded-full overflow-hidden cursor-pointer">
                      <img v-if="myAvatar" :src="myAvatar" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center bg-neutral-200 text-xs font-semibold text-neutral-600">Me</div>
                      <div v-if="uploadingMyAvatar" class="absolute inset-0 flex items-center justify-center bg-black/40">
                        <i class="fa-solid fa-spinner fa-spin text-white text-xs"></i>
                      </div>
                    </button>
                    <input ref="myAvatarInput" type="file" accept="image/*" class="hidden" @change="handleMyAvatarChange" />
                    <button type="button" @click="openContactsPanel" aria-label="New chat" class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer">
                      <i class="fa-solid fa-plus text-[16px]"></i>
                    </button>
                  </div>
                </div>
                <div class="px-4 py-3">
                  <div class="relative">
                    <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"></i>
                    <input v-model="searchQuery" type="search" placeholder="Search conversations..."
                           class="w-full rounded-full border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                <div class="flex-1 min-h-0 space-y-1 overflow-y-auto px-2 pb-3 scrollbar-whatsapp">
                  <button v-for="thread in filteredThreads" :key="thread.id" type="button" @click="selectThread(thread.id)"
                          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left cursor-pointer"
                          :class="thread.id === activeThreadId ? 'header-gradient border border-primary-light shadow-sm' : 'hover:bg-surface-alt'">
                    <div class="relative shrink-0">
                      <div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                        <img v-if="thread.avatar" :src="thread.avatar" class="h-full w-full object-cover" />
                        <span v-else>{{ thread.initials }}</span>
                      </div>
                      <span v-if="thread.online" class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate text-sm font-medium text-text-primary">{{ thread.name }}</span>
                        <span class="shrink-0 text-[11px] text-text-muted">{{ formatMessageTime(thread.lastMessageAt) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate text-xs text-text-secondary">{{ thread.lastMessage || 'No messages yet' }}</span>
                        <span v-if="thread.unread" class="ml-1 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">{{ thread.unread }}</span>
                      </div>
                    </div>
                  </button>
                  <p v-if="!filteredThreads.length" class="px-3 py-6 text-center text-sm text-text-muted">No conversations found.</p>
                </div>
              </template>
            </aside>

            <!-- Chat panel -->
            <section class="min-w-0 flex-1 flex-col md:flex relative" :class="mobileChatOpen ? 'flex' : 'hidden'">
              <template v-if="activeThread">
                <div class="relative flex items-center gap-3 border-b border-border bg-inbox-header-gradient px-4 py-3">
                  <button type="button" @click="backToList" aria-label="Back"
                          class="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt md:hidden cursor-pointer">
                    <i class="fa-solid fa-arrow-left text-[18px]"></i>
                  </button>

                  <div class="flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <img v-if="activeThread.avatar" :src="activeThread.avatar" class="h-full w-full object-cover" />
                    <div v-else class="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-semibold text-neutral-600">{{ activeThread.initials }}</div>
                  </div>
                  <div class="min-w-0 flex-1 cursor-pointer" @click="openParticipantsPanel">
                    <h3 class="truncate font-display text-base font-semibold text-headingCard">{{ activeThread.name }}</h3>
                    <span class="font-display text-xs font-normal text-text-secondary">
                      {{ activeThread.type === 'group' ? `${activeGroupMembers.length} participants` : (activeThread.online ? 'Online' : 'Team messages') }}
                    </span>
                  </div>

                  <div class="relative shrink-0">
                    <button type="button" @click.stop="toggleChatMenu" aria-label="Chat options"
                            class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer">
                      <i class="fa-solid fa-ellipsis-vertical text-[16px]"></i>
                    </button>
                    <div v-if="showChatMenu" @click.stop class="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card-small">
                      <button type="button" @click="requestClearChat" class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-alt cursor-pointer">
                        <i class="fa-solid fa-broom text-[13px] text-text-secondary"></i> Clear chat
                      </button>
                      <button type="button" @click="requestDeleteChat" class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-surface-alt cursor-pointer">
                        <i class="fa-solid fa-trash text-[13px]"></i> Delete chat
                      </button>
                    </div>
                  </div>
                </div>

                <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto bg-messages-gradient px-4 py-4 scrollbar-whatsapp">
                  <div v-for="msg in activeThread.messages" :key="msg.id" class="flex" :class="msg.fromMe ? 'justify-end' : 'justify-start'">
                    <div class="max-w-[75%] select-none rounded-xl px-3.5 py-2 text-sm leading-relaxed"
                         :class="[msg.fromMe ? 'rounded-br-[4px] bg-chat-bubble-me-gradient text-white shadow-bubble-me' : 'rounded-bl-[4px] border border-border bg-card text-text-primary shadow-[var(--shadow-sm)]', msg.fromMe ? 'cursor-pointer' : 'cursor-default']"
                         style="touch-action: manipulation;"
                         @contextmenu="openContextMenu($event, msg, activeThread.id)"
                         @touchstart="handleTouchStart($event, msg, activeThread.id)"
                         @touchmove="handleTouchMove($event)" @touchend="handleTouchEnd($event)">
                      <span :class="msg.deletedForEveryone ? (msg.fromMe ? 'italic text-white/70' : 'italic text-text-muted') : ''">
                        <i v-if="msg.deletedForEveryone" class="fa-solid fa-ban mr-1 text-[11px]"></i>{{ msg.text }}
                      </span>
                      <div class="mt-1 flex items-center justify-end gap-1 text-[10px]" :class="msg.fromMe ? 'text-white/70' : 'text-text-muted'">
                        <span>{{ formatBubbleTime(msg.timestamp) }}</span>
                        <i v-if="msg.fromMe && !msg.deletedForEveryone" class="text-[12px] leading-none"
                           :class="[msg.status === 'read' && 'fa-solid fa-check-double text-sky-300', msg.status === 'delivered' && 'fa-solid fa-check-double text-white/70', msg.status === 'sent' && 'fa-solid fa-check text-white/70', msg.status === 'pending' && 'fa-regular fa-clock text-white/70']"></i>
                      </div>
                    </div>
                  </div>
                  <div v-if="!activeThread.messages.length" class="flex h-full items-center justify-center text-sm text-text-muted">No messages yet</div>
                </div>

                <form @submit.prevent="sendMessage" class="flex items-center gap-2 border-t border-border bg-card px-3 py-3">
                  <input v-model="messageText" type="text" placeholder="Message..." autocomplete="off" enterkeyhint="send"
                         class="flex-1 rounded-full border border-border bg-surface-alt px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button type="submit" aria-label="Send" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover cursor-pointer">
                    <i class="fa-solid fa-paper-plane text-[14px]"></i>
                  </button>
                </form>
              </template>

              <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 bg-messages-gradient text-text-muted">
                <div class="flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt"><i class="fa-solid fa-comments text-[22px]"></i></div>
                <p class="text-sm">Select a chat to start messaging</p>
              </div>

              <!-- Participants / Group info / Contact info slide-in panel -->
              <div v-if="showParticipantsPanel && activeThread" class="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-card scrollbar-whatsapp">

                <!-- Header -->
                <div class="flex items-center gap-3 border-b border-border-subtle px-4 py-4">
                  <button type="button" @click="closeParticipantsPanel" aria-label="Close"
                          class="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer">
                    <i class="fa-solid fa-xmark text-[18px]"></i>
                  </button>
                  <span class="font-display text-lg font-bold text-primary-900">{{ activeThread.type === 'group' ? 'Group info' : 'Contact info' }}</span>
                </div>

                <!-- Centered avatar + name block -->
                <div class="flex flex-col items-center gap-3 border-b border-border-subtle px-4 py-8">
                  <div class="relative">
                    <div
                        class="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-4xl font-semibold text-neutral-600"
                        :class="activeThread.type === 'group' ? 'cursor-pointer group' : ''"
                        @click="activeThread.type === 'group' && triggerGroupPhotoUpload()"
                    >
                      <img v-if="activeThread.avatar" :src="activeThread.avatar" alt="" class="h-full w-full object-cover" />
                      <span v-else>{{ activeThread.initials }}</span>

                      <!-- hover overlay -->
                      <div
                          v-if="activeThread.type === 'group'"
                          class="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/0 opacity-0 transition-opacity group-hover:bg-black/50 group-hover:opacity-100"
                      >
                        <i class="fa-solid fa-camera text-[20px] text-white"></i>
                        <span class="text-[11px] font-medium text-white">Change photo</span>
                      </div>

                      <!-- uploading spinner -->
                      <div v-if="uploadingGroupPhoto" class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                        <font-awesome-icon :icon="['fas', 'spinner']" spin class="text-white text-xl" />
                      </div>
                    </div>

                    <input
                        ref="groupPhotoInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleGroupPhotoChange"
                    />
                  </div>

                  <h2 class="text-center font-display text-xl font-bold text-text-primary">{{ activeThread.name }}</h2>
                  <p v-if="activeThread.type === 'group'" class="text-sm text-text-secondary">
                    Group · {{ activeGroupMembers.length }} participants
                  </p>
                  <p v-else class="text-sm text-text-secondary">{{ activeThread.online ? 'Online' : 'Offline' }}</p>
                </div>

                <!-- About / description -->
                <div v-if="activeThread.description" class="border-b border-border-subtle px-4 py-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-text-muted">About</p>
                  <p class="mt-1 text-sm text-text-primary">{{ activeThread.description }}</p>
                </div>

                <!-- Members list (group only) -->
                <div v-if="activeThread.type === 'group'" class="flex-1 px-2 py-2">
                  <p class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    {{ activeGroupMembers.length }} participants
                  </p>
                  <div v-for="member in activeGroupMembers" :key="member.user.id" class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-alt">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
                      {{ (member.user.first_name?.[0] || member.user.username?.[0] || '?').toUpperCase() }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-medium text-text-primary">
                        {{ `${member.user.first_name} ${member.user.last_name}`.trim() || member.user.username }}
                      </span>
                      <span class="block truncate text-xs capitalize text-text-secondary">{{ member.user.role_name || 'Member' }}</span>
                    </div>
                    <span v-if="member.role === 'admin'" class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">Admin</span>
                  </div>
                </div>

                <!-- Your photo (direct chats only) -->
                <div v-else class="flex-1 px-2 py-2">
                  <p class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">Your photo</p>
                  <button type="button" @click="triggerMyAvatarUpload"
                          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-alt cursor-pointer">
                    <div class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                      <img v-if="myAvatar" :src="myAvatar" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center bg-neutral-200 text-xs font-semibold text-neutral-600">Me</div>
                      <div v-if="uploadingMyAvatar" class="absolute inset-0 flex items-center justify-center bg-black/40">
                        <i class="fa-solid fa-spinner fa-spin text-white text-xs"></i>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="block text-sm font-medium text-text-primary">Change your photo</span>
                      <span class="block text-xs text-text-secondary">Update your profile picture</span>
                    </div>
                    <i class="fa-solid fa-chevron-right text-[11px] text-text-muted"></i>
                  </button>
                </div>

                <!-- Action buttons (group only) -->
                <div v-if="activeThread.type === 'group'" class="border-t border-border-subtle px-2 py-2">
                  <button
                      v-if="isCurrentUserGroupAdmin"
                      type="button"
                      @click="openAddMembersPanel"
                      class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-alt cursor-pointer"
                  >
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <i class="fa-solid fa-user-plus text-[14px]"></i>
                    </div>
                    <span class="text-sm font-medium text-text-primary">Add members</span>
                  </button>
                  <button
                      type="button"
                      @click="requestLeaveGroup"
                      class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-alt cursor-pointer"
                  >
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
                      <i class="fa-solid fa-right-from-bracket text-[14px]"></i>
                    </div>
                    <span class="text-sm font-medium text-danger">Leave group</span>
                  </button>
                </div>
              </div>

              <!-- Add members slide-in panel -->
              <div v-if="showAddMembersPanel && activeThread" class="absolute inset-0 z-40 flex flex-col bg-card">
                <div class="flex items-center gap-3 border-b border-border-subtle px-4 py-4">
                  <button type="button" @click="closeAddMembersPanel" aria-label="Back"
                          class="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-alt cursor-pointer">
                    <i class="fa-solid fa-arrow-left text-[16px]"></i>
                  </button>
                  <span class="font-display text-lg font-bold text-primary-900">Add members</span>
                </div>
                <div class="px-4 py-3">
                  <div class="relative">
                    <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted"></i>
                    <input v-model="addMembersSearchQuery" type="search" placeholder="Search contacts..."
                           class="w-full rounded-full border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div class="flex-1 min-h-0 space-y-1 overflow-y-auto px-2 pb-3 scrollbar-whatsapp">
                  <button v-for="contact in addMembersFilteredContacts" :key="contact.id" type="button"
                          @click="toggleNewMemberSelection(contact.id)"
                          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-alt cursor-pointer">
                    <div class="relative shrink-0">
                      <div class="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">{{ contact.initials }}</div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-medium text-text-primary">{{ contact.name }}</span>
                      <span class="block truncate text-xs capitalize text-text-secondary">{{ contact.role }}</span>
                    </div>
                    <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                         :class="isNewMemberSelected(contact.id) ? 'border-primary bg-primary' : 'border-border'">
                      <i v-if="isNewMemberSelected(contact.id)" class="fa-solid fa-check text-[10px] text-white"></i>
                    </div>
                  </button>
                  <p v-if="!addMembersFilteredContacts.length" class="px-3 py-6 text-center text-sm text-text-muted">No contacts available to add.</p>
                </div>
                <div class="border-t border-border-subtle px-4 py-3">
                  <button type="button" @click="submitAddMembers"
                          :disabled="!selectedNewMemberIds.length || addingMembers"
                          class="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                    {{ addingMembers ? 'Adding...' : `Add ${selectedNewMemberIds.length || ''} member${selectedNewMemberIds.length === 1 ? '' : 's'}`.trim() }}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- Message context menu -->
    <Teleport to="body">
      <div v-if="contextMenu.visible" @click.stop class="fixed z-[60] w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card-small" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
        <button v-if="contextMenu.message?.receipts?.length > 1" type="button" @click="openReadByMenu($event, contextMenu.message)"
                class="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-alt cursor-pointer">
          <span class="flex items-center gap-2">
            <i class="fa-solid fa-check-double text-[13px] text-text-secondary"></i>
            Read by {{ contextMenu.message.receipts.filter(r => r.is_read).length }} of {{ contextMenu.message.receipts.length }}
          </span>
          <i class="fa-solid fa-chevron-right text-[11px] text-text-muted"></i>
        </button>
        <button v-if="!contextMenu.message?.deletedForEveryone" type="button" @click="requestDeleteForEveryone"
                class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-surface-alt cursor-pointer">
          <i class="fa-solid fa-trash text-[13px]"></i> Delete for everyone
        </button>
        <button type="button" @click="requestDeleteForMe" class="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-text-primary hover:bg-surface-alt cursor-pointer">
          <i class="fa-solid fa-trash-can text-[13px] text-text-secondary"></i> Delete for me
        </button>
      </div>
    </Teleport>

    <!-- Read by submenu -->
    <Teleport to="body">
      <div v-if="readByMenu?.visible" @click.stop class="fixed z-[65] w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card-small max-h-64 overflow-y-auto" :style="{ left: readByMenu.x + 'px', top: readByMenu.y + 'px' }">
        <div v-for="receipt in readByMenu.receipts" :key="receipt.userId" class="flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-text-primary">
          <span class="truncate">{{ receipt.name }}</span>
          <i class="text-[12px]" :class="receipt.is_read ? 'fa-solid fa-check-double text-sky-500' : (receipt.is_delivered ? 'fa-solid fa-check-double text-text-muted' : 'fa-solid fa-check text-text-muted')"></i>
        </div>
        <p v-if="!readByMenu.receipts.length" class="px-3.5 py-2 text-xs text-text-muted">No one yet</p>
      </div>
    </Teleport>

    <!-- Confirm modal -->
    <Teleport to="body">
      <div v-if="confirmModal.visible" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4" @click.self="closeConfirmModal">
        <div class="w-full max-w-sm rounded-2xl bg-card p-5 shadow-card-small">
          <h3 class="font-display text-base font-semibold text-text-primary">{{ confirmModal.title }}</h3>
          <p class="mt-2 text-sm text-text-secondary">{{ confirmModal.description }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" @click="closeConfirmModal" class="rounded-full px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt cursor-pointer">Cancel</button>
            <button type="button" @click="runConfirmedAction" class="rounded-full bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer">{{ confirmModal.confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
</style>