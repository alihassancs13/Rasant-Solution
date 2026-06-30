<script setup>
import AdminSidebar from '../components/adminSidebar.vue'
import TopHeader from '../components/header.vue'
import StatCard from '../components/statCard.vue'
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Right side: header + page content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto px-4 pb-4">
        <router-view />

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
              label="Live on Site"
              :value="2"
              subtitle="Published jobs"
              :icon="['fas', 'globe']"
              color="orange"
          />

          <StatCard
              label="New CVs"
              :value="1"
              subtitle="Awaiting review"
              :icon="['fas', 'inbox']"
              color="purple"
          />

          <StatCard
              label="Draft Posts"
              :value="0"
              subtitle="Not yet public"
              :icon="['fas', 'pen-to-square']"
              color="blue"
          />

          <StatCard
              label="Total CVs"
              :value="2"
              subtitle=""
              :icon="['fas', 'clipboard-list']"
              color="teal"
              link="/careers"
              linkLabel="View careers page"
          />
        </div>
      </main>
    </div>
  </div>
</template>