<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
    <Sidebar />

    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
        <h1 class="text-xl font-bold text-gray-800 ml-15">Dashboard</h1>

        <button
            @click="openLogoutModal"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-4xl">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome to Company Overview</h2>
          <p class="text-gray-500">You are securely logged into the administrative command panel.</p>
        </div>
      </main>
    </div>

    <div
        v-if="showLogoutModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto"
    >
      <div
          @click="closeLogoutModal"
          class="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px] transition-opacity"
      ></div>

      <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 z-10 transform transition-all">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
        <p class="text-sm text-gray-500 mb-6">
          Are you sure you want to log out of your session? You will need to re-enter your credentials to access the dashboard.
        </p>

        <div class="flex items-center justify-end gap-3">
          <button
              @click="closeLogoutModal"
              class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-600/20 cursor-pointer"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import Sidebar from '../components/adminSidebar.vue';
import { useOverview } from '../composables/Admin/useOverview.js';

// Extract modal status toggles along with core logout logic
const {
  showLogoutModal,
  openLogoutModal,
  closeLogoutModal,
  handleLogout
} = useOverview();
</script>