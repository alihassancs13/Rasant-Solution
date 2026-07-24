<template>
  <div class="flex h-screen bg-surface">
    <Sidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader
            titleOverride="Overview"
            subtitleOverride="Company snapshot &amp; shortcuts"
            :iconOverride="['fas', 'house']"
            settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6 space-y-4">
        <!-- Hero -->
        <section class="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-[#1E3A5F] via-[#2A5F9E] to-[#4A90E2] p-6 sm:p-8 text-white shadow-sm">
          <div
              class="absolute inset-0 opacity-25 pointer-events-none"
              style="background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.4), transparent 40%);"
          ></div>
          <div class="relative flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-sky-100/90 font-semibold mb-2">Rasant Solutions</p>
              <h1 class="text-2xl sm:text-3xl font-bold font-display">Admin dashboard</h1>
              <p class="text-sky-100/90 text-sm mt-2 max-w-xl">
                Snapshot of people, hiring, attendance, inquiries, and worklogs — jump into any module from here.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <router-link
                  to="/admin/employees/dashboard"
                  class="px-4 py-2 rounded-md bg-white text-primary text-sm font-semibold hover:bg-sky-50 transition-colors"
              >
                Employees
              </router-link>
              <router-link
                  to="/admin/worklogs/analytics"
                  class="px-4 py-2 rounded-md bg-white/15 border border-white/25 text-white text-sm font-semibold hover:bg-white/25 transition-colors"
              >
                Worklog analytics
              </router-link>
              <router-link
                  to="/admin/inquiries"
                  class="px-4 py-2 rounded-md bg-white/15 border border-white/25 text-white text-sm font-semibold hover:bg-white/25 transition-colors"
              >
                Inquiries
              </router-link>
            </div>
          </div>
        </section>

        <div v-if="store.loading && !stats" class="py-20 text-center text-text-muted">
          <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-3xl text-primary mb-3" />
          <p class="text-sm">Loading dashboard…</p>
        </div>

        <div v-else-if="store.error && !stats" class="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p class="text-red-700 font-medium">{{ store.error }}</p>
          <button type="button" class="mt-3 text-sm text-primary font-semibold underline cursor-pointer" @click="load">
            Retry
          </button>
        </div>

        <template v-else-if="stats">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
                label="Active employees"
                :value="stats.employees?.active ?? 0"
                :subtitle="`${stats.employees?.total ?? 0} total · ${stats.employees?.inactive ?? 0} inactive`"
                :icon="['fas', 'users']"
                color="blue"
                link="/admin/employees/dashboard"
            />
            <StatCard
                label="Published jobs"
                :value="stats.hiring?.published_jobs ?? 0"
                :subtitle="`${stats.hiring?.draft_jobs ?? 0} drafts · ${stats.hiring?.new_cvs ?? 0} new CVs`"
                :icon="['fas', 'briefcase']"
                color="purple"
                link="/admin/career"
            />
            <StatCard
                label="Inquiries"
                :value="stats.inquiries?.total ?? 0"
                :subtitle="`${stats.inquiries?.last_7_days ?? 0} in last 7 days`"
                :icon="['fas', 'paper-plane']"
                color="pink"
                link="/admin/inquiries"
            />
            <StatCard
                label="Worklog hours (month)"
                :value="worklogHoursLabel"
                :subtitle="`${stats.worklogs_month?.entries ?? 0} entries this month`"
                :icon="['fas', 'clock']"
                color="teal"
                link="/admin/worklogs/analytics"
            />
          </div>

          <div class="grid grid-cols-[1fr_2fr] gap-4">
            <section class="lg:col-span-1 bg-white border border-border rounded-lg shadow-sm p-5">
              <h3 class="text-base font-bold text-headingMain mb-1">Attendance today</h3>
              <p class="text-xs text-textSupporting mb-4">Live pulse from attendance records</p>
              <div class="space-y-3">
                <div class="flex items-center justify-between rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                  <span class="text-sm font-medium text-emerald-800">Present</span>
                  <span class="text-lg font-bold text-emerald-700">{{ stats.attendance_today?.present ?? 0 }}</span>
                </div>
                <div class="flex items-center justify-between rounded-md bg-amber-50 border border-amber-100 px-3 py-2.5">
                  <span class="text-sm font-medium text-amber-800">Late</span>
                  <span class="text-lg font-bold text-amber-700">{{ stats.attendance_today?.late ?? 0 }}</span>
                </div>
                <div class="flex items-center justify-between rounded-md bg-rose-50 border border-rose-100 px-3 py-2.5">
                  <span class="text-sm font-medium text-rose-800">Absent</span>
                  <span class="text-lg font-bold text-rose-700">{{ stats.attendance_today?.absent ?? 0 }}</span>
                </div>
              </div>
              <router-link
                  to="/admin/employees/attendance"
                  class="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Open attendance →
              </router-link>
            </section>

            <section class="w-full bg-white border border-border rounded-lg shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-headingMain">Today's work updates</h3>
                  <p class="text-xs text-textSupporting">
                    What employees say they're working on · {{ stats.today_work_updates_count ?? 0 }} update(s)
                  </p>
                </div>
              </div>
              <ul v-if="stats.today_work_updates?.length" class="divide-y divide-border max-h-[300px] overflow-y-auto w-full">
                <li
                    v-for="item in stats.today_work_updates"
                    :key="item.id"
                    class="px-5 py-3.5"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-md bg-primary-subtle text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {{ initials(item.name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-baseline justify-between gap-2">
                        <p class="text-sm font-semibold text-text-primary truncate">{{ item.name }}</p>
                        <span class="text-[10px] text-text-muted shrink-0">{{ formatShortTime(item.updated_at) }}</span>
                      </div>
                      <p class="text-xs text-text-muted truncate">
                        {{ item.department || '—' }}
                        <span v-if="item.designation"> · {{ item.designation }}</span>
                      </p>
                      <p class="text-sm text-text-secondary mt-1.5 whitespace-pre-wrap">{{ item.note }}</p>
                    </div>
                  </div>
                </li>
              </ul>
              <p v-else class="w-full py-10 text-center text-sm text-text-muted">
                No work updates posted today yet.
              </p>
            </section>
          </div>

          <section class="lg:col-span-2 bg-white border border-border rounded-lg shadow-sm p-5">
            <h3 class="text-base font-bold text-headingMain mb-1">Quick modules</h3>
            <p class="text-xs text-textSupporting mb-4">Jump to the areas you use most</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <router-link
                  v-for="item in quickLinks"
                  :key="item.to"
                  :to="item.to"
                  class="group rounded-md border border-border p-4 hover:border-primary hover:bg-primary-subtle/50 transition-colors"
              >
                <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" :class="item.bg">
                  <font-awesome-icon :icon="item.icon" class="text-sm" :class="item.color" />
                </div>
                <p class="text-sm font-semibold text-text-primary group-hover:text-primary">{{ item.label }}</p>
                <p class="text-xs text-text-muted mt-0.5">{{ item.desc }}</p>
              </router-link>
            </div>
          </section>


          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section class="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-headingMain">Recent employees</h3>
                  <p class="text-xs text-textSupporting">Latest additions to the roster</p>
                </div>
                <router-link to="/admin/employees/dashboard" class="text-xs font-semibold text-primary hover:underline shrink-0">
                  View all
                </router-link>
              </div>
              <ul v-if="stats.recent_employees?.length" class="divide-y divide-border">
                <li
                    v-for="emp in stats.recent_employees"
                    :key="emp.id"
                    class="px-5 py-3 flex items-center gap-3"
                >
                  <div class="w-9 h-9 rounded-md bg-primary-subtle text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {{ initials(emp.name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-text-primary truncate">{{ emp.name }}</p>
                    <p class="text-xs text-text-muted truncate">
                      {{ emp.department || '—' }} · {{ emp.designation || '—' }}
                    </p>
                  </div>
                  <span
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-lg shrink-0"
                      :class="emp.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ emp.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </li>
              </ul>
              <p v-else class="py-10 text-center text-sm text-text-muted">No employees yet.</p>
            </section>

            <section class="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-headingMain">Latest inquiries</h3>
                  <p class="text-xs text-textSupporting">Contact form messages</p>
                </div>
                <router-link to="/admin/inquiries" class="text-xs font-semibold text-primary hover:underline shrink-0">
                  View all
                </router-link>
              </div>
              <ul v-if="stats.recent_inquiries?.length" class="divide-y divide-border">
                <li v-for="msg in stats.recent_inquiries" :key="msg.id" class="px-5 py-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-text-primary truncate">{{ msg.full_name }}</p>
                      <p class="text-xs text-text-muted truncate">{{ msg.email }}</p>
                      <p class="text-xs text-text-secondary mt-1 line-clamp-2">{{ msg.message }}</p>
                    </div>
                    <span class="text-[10px] text-text-muted shrink-0">{{ formatShortDate(msg.created_at) }}</span>
                  </div>
                </li>
              </ul>
              <p v-else class="py-10 text-center text-sm text-text-muted">No inquiries yet.</p>
            </section>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import Sidebar from '@/components/adminSidebar.vue';
import AppHeader from '@/components/header.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import StatCard from '@/components/StatCard.vue';
import { useOverviewStore } from '@/stores/worklogAnalyticsStore.js';
import { useToast } from '@/composables/useToast.js';

const store = useOverviewStore();
const { showToast } = useToast();
const stats = computed(() => store.stats);

const worklogHoursLabel = computed(() => {
  const h = stats.value?.worklogs_month?.hours;
  if (h === null || h === undefined) return '—';
  return `${h}h`;
});

const quickLinks = [
  { to: '/admin/employees/dashboard', label: 'Employees', desc: 'Roster & profiles', icon: ['fas', 'users'], bg: 'bg-blue-50', color: 'text-blue-600' },
  { to: '/admin/employees/salaries', label: 'Salaries', desc: 'Pay & increments', icon: ['fas', 'money-bill'], bg: 'bg-amber-50', color: 'text-amber-600' },
  { to: '/admin/documents', label: 'Documents', desc: 'Shared files', icon: ['fas', 'folder'], bg: 'bg-violet-50', color: 'text-violet-600' },
  { to: '/admin/credentialsvault', label: 'Vault', desc: 'Credentials', icon: ['fas', 'shield-halved'], bg: 'bg-teal-50', color: 'text-teal-600' },
  { to: '/admin/worklogs', label: 'Worklogs', desc: 'Personal calendar', icon: ['fas', 'clock'], bg: 'bg-sky-50', color: 'text-sky-600' },
  { to: '/admin/account', label: 'Account', desc: 'Profile & email', icon: ['fas', 'gear'], bg: 'bg-slate-100', color: 'text-slate-600' },
];

function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatShortTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

async function load() {
  const result = await store.fetchStats();
  if (!result.success) showToast(result.error, 'error');
}

onMounted(load);
</script>
