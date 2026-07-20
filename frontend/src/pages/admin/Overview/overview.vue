<template>
  <div class="flex h-screen bg-surface">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Top Header -->
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader
            :userName="'Admin User'"
            role="admin"
            :notificationCount="3"
            :iconOverride="['fas', 'house']"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <div class="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <font-awesome-icon icon="fa-solid fa-house" class="text-text-secondary text-lg" />
            <h2 class="text-2xl font-bold text-text-primary">Welcome to Company Overview</h2>
          </div>
          <p class="text-text-muted">You are securely logged into the administrative command panel.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '../../../components/adminSidebar.vue';
import AppHeader from '../../../components/header.vue';
</script>