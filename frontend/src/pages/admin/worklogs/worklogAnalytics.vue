<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader
            titleOverride="Worklog Analytics"
            subtitleOverride="Team time tracking — overall &amp; per employee"
            :iconOverride="['fas', 'chart-line']"
            settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6 space-y-4">
        <div
          v-if="needsJiraLogin"
          class="bg-white border border-[#BFDBFE] rounded-xl shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <p class="text-sm font-bold text-headingMain">Your Jira account is not connected</p>
            <p class="text-xs text-text-muted mt-0.5">
              Analytics still show stored worklogs. Connect Jira to sync the latest ticket time.
            </p>
          </div>
          <router-link
            to="/admin/jira"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white btn-primary-gradient"
          >
            Go to Jira login
          </router-link>
        </div>

        <!-- Filters -->
        <div class="bg-white border border-border rounded-lg shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row lg:items-end gap-3 justify-between">
          <div>
            <h2 class="text-lg font-bold text-headingMain">Analytics range</h2>
            <p class="text-sm text-textSupporting mt-0.5">
              Totals from local worklogs (Jira sync + manual). <span class="font-medium text-text-primary">8 hours = 1 day</span>
              <span v-if="appliedRangeLabel" class="text-text-primary font-medium"> · {{ appliedRangeLabel }}</span>.
            </p>
          </div>
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">From</label>
              <input
                  v-model="fromDate"
                  type="date"
                  class="px-3.5 py-2.5 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">To</label>
              <input
                  v-model="toDate"
                  type="date"
                  class="px-3.5 py-2.5 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition"
              />
            </div>
            <button
                type="button"
                class="px-4 py-2.5 rounded-md bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white text-sm font-semibold border border-primary/20 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
                :disabled="store.loading"
                @click="applyRange"
            >
              <font-awesome-icon v-if="store.loading" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              Apply
            </button>
            <button
                v-if="viewMode === 'employee'"
                type="button"
                class="px-4 py-2.5 rounded-md border border-border bg-white text-sm font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary transition-colors cursor-pointer"
                @click="backToOverall"
            >
              ← Overall view
            </button>
          </div>
        </div>

        <div class="bg-white border border-border rounded-lg shadow-sm p-4 sm:p-5 space-y-4">
          <div>
            <h2 class="text-lg font-bold text-headingMain">Monthly Export</h2>
            <p class="text-sm text-textSupporting mt-0.5">
              Set project details, then export a compact full-month timesheet workbook.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">Project Name</label>
              <input
                v-model="exportSettings.project_name"
                type="text"
                placeholder="e.g. CSM-MOVE"
                class="w-full px-3.5 py-2.5 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1.5">Project No</label>
              <input
                v-model="exportSettings.project_number"
                type="text"
                placeholder="e.g. 10501273/004800"
                class="w-full px-3.5 py-2.5 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              class="inline-flex items-center justify-center min-w-[140px] px-4 py-2.5 rounded-md border border-border bg-white text-sm font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary transition-colors cursor-pointer disabled:opacity-60"
              :disabled="isSavingExportSettings"
              @click="saveExportSettings"
            >
              <font-awesome-icon v-if="isSavingExportSettings" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              <font-awesome-icon v-else :icon="['fas', 'floppy-disk']" class="mr-2" />
              Save
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center min-w-[180px] px-4 py-2.5 rounded-md bg-gradient-to-r from-[#1E3A5F] via-[#2A5F9E] to-[#4A90E2] text-white text-sm font-semibold border border-primary/20 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
              :disabled="isExportingWorkbook"
              @click="exportWorkbook"
            >
              <font-awesome-icon v-if="isExportingWorkbook" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              <font-awesome-icon v-else :icon="['fas', 'file-excel']" class="mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        <div v-if="store.error && !needsJiraLogin" class="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 text-sm">
          {{ store.error }}
        </div>

        <!-- OVERALL VIEW -->
        <template v-if="viewMode === 'overall'">
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <StatCard
                label="Total hours"
                :value="formatHoursValue(displaySummary.total_hours)"
                :subtitle="filterHint"
                :icon="['fas', 'clock']"
                color="blue"
            />
            <StatCard
                label="Days (8h)"
                :value="formatDayUnits(displaySummary.total_day_units ?? (Number(displaySummary.total_hours) / 8))"
                :icon="['fas', 'calendar-days']"
                color="teal"
            />
            <StatCard label="Entries" :value="displaySummary.total_entries ?? '—'" :icon="['fas', 'file-lines']" color="purple" />
            <StatCard label="Issues" :value="displaySummary.unique_issues ?? '—'" :icon="['fas', 'list-check']" color="pink" />
            <StatCard label="Active loggers" :value="displaySummary.active_loggers ?? '—'" :icon="['fas', 'users']" color="orange" />
            <StatCard label="Avg hrs / day" :value="formatHoursValue(displaySummary.avg_hours_per_day)" :icon="['fas', 'chart-bar']" color="green" />
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <section class="xl:col-span-3 bg-white border border-border rounded-lg shadow-sm p-5">
              <div class="mb-4">
                <h3 class="text-base font-bold text-headingMain">Daily hours</h3>
                <p class="text-xs text-textSupporting">Hours logged per day in the applied range</p>
              </div>
              <div v-if="!dailyTrend.length" class="py-12 text-center text-text-muted text-sm">No daily data in this range.</div>
              <div v-else class="flex items-end gap-1.5 h-44 overflow-x-auto pb-2">
                <div
                    v-for="day in dailyTrend"
                    :key="day.date"
                    class="flex flex-col items-center justify-end min-w-[36px] flex-1 max-w-[48px] h-full group"
                    :title="`${day.date}: ${day.hours}h (${day.entries} entries)`"
                >
                  <span class="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 mb-1">
                    {{ formatHoursValue(day.hours) }}
                  </span>
                  <div
                      class="w-full rounded-t-md bg-gradient-to-t from-[#1E3A5F] to-[#4A90E2] transition-all"
                      :style="{ height: `${barHeight(day.hours)}%` }"
                  ></div>
                  <span class="text-[9px] text-text-muted mt-1">{{ shortDay(day.date) }}</span>
                </div>
              </div>
            </section>

            <section class="xl:col-span-2 bg-white border border-border rounded-lg shadow-sm p-5">
              <h3 class="text-base font-bold text-headingMain mb-1">Top issues</h3>
              <p class="text-xs text-textSupporting mb-4">Most logged tickets in range</p>
              <div v-if="!topIssues.length" class="py-10 text-center text-text-muted text-sm">No issues yet.</div>
              <ul v-else class="space-y-3">
                <li v-for="issue in topIssues" :key="issue.issue_key" class="flex items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-text-primary truncate">{{ issue.issue_key }}</p>
                    <p class="text-xs text-text-muted truncate">{{ issue.summary || 'No summary' }}</p>
                    <div class="mt-1.5 h-1.5 rounded-sm bg-sectionLight overflow-hidden">
                      <div class="h-full rounded-sm bg-primary" :style="{ width: `${issueBar(issue.hours)}%` }"></div>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-headingMain">{{ formatHoursValue(issue.hours) }}</p>
                    <p class="text-[10px] text-text-muted">{{ issue.entries }} logs</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          <section class="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface/40">
              <div>
                <h3 class="text-base font-bold text-headingMain">By employee</h3>
                <p class="text-xs text-textSupporting">Click a row to open that person’s worklogs for this range</p>
              </div>
              <input
                  v-model="employeeSearch"
                  type="search"
                  placeholder="Search employee…"
                  class="px-3.5 py-2.5 rounded-md border border-border bg-white text-sm w-full sm:w-56 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition"
              />
            </div>

            <div v-if="store.loading" class="py-16 text-center text-text-muted">
              <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-2xl text-primary mb-2" />
              <p class="text-sm">Loading analytics…</p>
            </div>

            <div v-else-if="!filteredEmployees.length" class="py-16 text-center text-text-muted text-sm">
              No employee worklogs in this range.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-sectionLight text-left text-[11px] uppercase tracking-wide text-text-muted">
                  <tr>
                    <th class="px-5 py-3 font-semibold">Employee</th>
                    <th class="px-4 py-3 font-semibold">Department</th>
                    <th class="px-4 py-3 font-semibold text-right">Hours</th>
                    <th class="px-4 py-3 font-semibold text-right">Days (8h)</th>
                    <th class="px-4 py-3 font-semibold text-right">Entries</th>
                    <th class="px-4 py-3 font-semibold text-right">Issues</th>
                    <th class="px-5 py-3 font-semibold text-right">Share</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                      v-for="emp in filteredEmployees"
                      :key="emp.user_id || emp.email"
                      class="border-t border-border hover:bg-primary-subtle/40 cursor-pointer transition-colors"
                      @click="openEmployee(emp)"
                  >
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-md bg-gradient-to-br from-[#1E3A5F] to-[#4A90E2] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {{ initials(emp.name) }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-semibold text-text-primary truncate">{{ emp.name }}</p>
                          <p class="text-xs text-text-muted truncate">{{ emp.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-text-secondary">{{ emp.department || '—' }}</td>
                    <td class="px-4 py-3 text-right font-bold text-headingMain">{{ formatHoursValue(emp.total_hours) }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-[#1E3A5F]">{{ formatDayUnits(emp.day_units ?? (Number(emp.total_hours) / 8)) }}</td>
                    <td class="px-4 py-3 text-right text-text-secondary">{{ emp.entries }}</td>
                    <td class="px-4 py-3 text-right text-text-secondary">{{ emp.unique_issues }}</td>
                    <td class="px-5 py-3 text-right">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-lg bg-tagBlueBg text-tagBlueText text-xs font-semibold">
                        {{ sharePct(emp.total_hours) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <!-- EMPLOYEE DETAIL VIEW -->
        <template v-else>
          <div v-if="store.detailLoading" class="py-20 text-center text-text-muted">
            <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-3xl text-primary mb-3" />
            <p class="text-sm">Loading employee worklogs…</p>
          </div>

          <template v-else-if="detail">
            <section class="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-[#1E3A5F] via-[#2A5F9E] to-[#4A90E2] p-6 text-white shadow-sm">
              <div
                  class="absolute inset-0 opacity-25 pointer-events-none"
                  style="background: radial-gradient(circle at 90% 10%, rgba(255,255,255,0.35), transparent 45%);"
              ></div>
              <div class="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-sky-100/90 font-semibold mb-1">Employee worklogs</p>
                  <h2 class="text-2xl font-bold font-display">{{ detail.employee.name }}</h2>
                  <p class="text-sky-100/90 text-sm mt-1">
                    {{ detail.employee.email }}
                    <span v-if="detail.employee.department"> · {{ detail.employee.department }}</span>
                    <span v-if="detail.employee.designation"> · {{ detail.employee.designation }}</span>
                  </p>
                  <p v-if="appliedRangeLabel" class="text-sky-100/80 text-xs mt-2">Range: {{ appliedRangeLabel }}</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="bg-white/10 rounded-md px-3 py-2 border border-white/15 backdrop-blur-sm">
                    <p class="text-[10px] uppercase tracking-wide text-sky-100">Hours</p>
                    <p class="text-lg font-bold">{{ formatHoursValue(detail.summary.total_hours) }}</p>
                  </div>
                  <div class="bg-white/10 rounded-md px-3 py-2 border border-white/15 backdrop-blur-sm">
                    <p class="text-[10px] uppercase tracking-wide text-sky-100">Entries</p>
                    <p class="text-lg font-bold">{{ detail.summary.total_entries }}</p>
                  </div>
                  <div class="bg-white/10 rounded-md px-3 py-2 border border-white/15 backdrop-blur-sm">
                    <p class="text-[10px] uppercase tracking-wide text-sky-100">Issues</p>
                    <p class="text-lg font-bold">{{ detail.summary.unique_issues }}</p>
                  </div>
                  <div class="bg-white/10 rounded-md px-3 py-2 border border-white/15 backdrop-blur-sm">
                    <p class="text-[10px] uppercase tracking-wide text-sky-100">Days</p>
                    <p class="text-lg font-bold">{{ detail.summary.days_logged }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-border bg-surface/40">
                <h3 class="text-base font-bold text-headingMain">Logged entries</h3>
                <p class="text-xs text-textSupporting">Up to 200 most recent entries from Jira in the applied range</p>
              </div>
              <div v-if="!detail.entries?.length" class="py-14 text-center text-text-muted text-sm">No entries for this employee.</div>
              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-sectionLight text-left text-[11px] uppercase tracking-wide text-text-muted">
                    <tr>
                      <th class="px-5 py-3 font-semibold">Date</th>
                      <th class="px-4 py-3 font-semibold">Issue</th>
                      <th class="px-4 py-3 font-semibold">Summary / comment</th>
                      <th class="px-5 py-3 font-semibold text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in detail.entries" :key="entry.id" class="border-t border-border hover:bg-primary-subtle/30 transition-colors">
                      <td class="px-5 py-3 text-text-secondary whitespace-nowrap">{{ formatDateTime(entry.started) }}</td>
                      <td class="px-4 py-3 font-semibold text-primary">{{ entry.issue_key }}</td>
                      <td class="px-4 py-3 text-text-secondary">
                        <p class="truncate max-w-md">{{ entry.summary || '—' }}</p>
                        <p v-if="entry.comment" class="text-xs text-text-muted truncate max-w-md">{{ entry.comment }}</p>
                      </td>
                      <td class="px-5 py-3 text-right font-bold text-headingMain">{{ formatHoursValue(entry.hours) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </template>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import AdminSidebar from '@/components/adminSidebar.vue';
import AppHeader from '@/components/header.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import StatCard from '@/components/StatCard.vue';
import { useWorklogAnalyticsStore } from '@/stores/worklogAnalyticsStore.js';
import { useJiraStore } from '@/stores/jiraStore.js';
import { useToast } from '@/composables/useToast.js';

const store = useWorklogAnalyticsStore();
const jiraStore = useJiraStore();
const { showToast } = useToast();

const needsJiraLogin = ref(false);
const fromDate = ref(store.range.from);
const toDate = ref(store.range.to);
const viewMode = ref('overall');
const employeeSearch = ref('');
const exportSettings = ref({
  project_name: '',
  project_number: '',
});

function isJiraAuthError(message = '') {
  const text = String(message || '').toLowerCase();
  return text.includes('jira') && (
    text.includes('not connected') ||
    text.includes('connect first') ||
    text.includes('expired') ||
    text.includes('please connect')
  );
}
const summary = computed(() => store.summary || {});
const dailyTrend = computed(() => store.dailyTrend || []);
const topIssues = computed(() => store.topIssues || []);
const detail = computed(() => store.employeeDetail);
const isSavingExportSettings = computed(() => store.settingsLoading);
const isExportingWorkbook = computed(() => store.exportLoading);

const filteredEmployees = computed(() => {
  const q = employeeSearch.value.trim().toLowerCase();
  if (!q) return store.byEmployee;
  return store.byEmployee.filter((e) =>
      [e.name, e.email, e.department, e.designation].some((v) => (v || '').toLowerCase().includes(q))
  );
});

const displaySummary = computed(() => {
  const q = employeeSearch.value.trim();
  const base = summary.value || {};
  const rangeFrom = store.range.from;
  const rangeTo = store.range.to;
  let daySpan = 1;
  if (rangeFrom && rangeTo) {
    const a = new Date(`${rangeFrom}T00:00:00`);
    const b = new Date(`${rangeTo}T00:00:00`);
    daySpan = Math.max(Math.round((b - a) / 86400000) + 1, 1);
  }

  if (!q) {
    return {
      total_hours: base.total_hours ?? 0,
      total_entries: base.total_entries ?? 0,
      unique_issues: base.unique_issues ?? 0,
      active_loggers: base.active_loggers ?? 0,
      avg_hours_per_day: base.avg_hours_per_day ?? 0,
    };
  }

  const emps = filteredEmployees.value;
  const totalSeconds = emps.reduce((sum, e) => sum + (Number(e.total_seconds) || 0), 0);
  const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
  const totalEntries = emps.reduce((sum, e) => sum + (Number(e.entries) || 0), 0);
  const uniqueIssues = emps.reduce((sum, e) => sum + (Number(e.unique_issues) || 0), 0);

  return {
    total_hours: totalHours,
    total_entries: totalEntries,
    unique_issues: uniqueIssues,
    active_loggers: emps.length,
    avg_hours_per_day: Math.round((totalSeconds / 3600 / daySpan) * 100) / 100,
  };
});

const appliedRangeLabel = computed(() => {
  if (!store.range.from || !store.range.to) return '';
  return `${store.range.from} → ${store.range.to}`;
});

const filterHint = computed(() => {
  const parts = [];
  if (appliedRangeLabel.value) parts.push(appliedRangeLabel.value);
  if (employeeSearch.value.trim()) parts.push('search filter');
  return parts.join(' · ') || 'Applied range';
});

const maxDailyHours = computed(() => Math.max(...dailyTrend.value.map((d) => d.hours || 0), 1));
const maxIssueHours = computed(() => Math.max(...topIssues.value.map((i) => i.hours || 0), 1));
const totalHoursForShare = computed(() => Number(displaySummary.value.total_hours) || 0);

const rangeDays = computed(() => {
  const from = store.range.from;
  const to = store.range.to;
  if (!from || !to) return '—';
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  return Math.max(Math.round((b - a) / 86400000) + 1, 1);
});

function formatHoursValue(hours) {
  if (hours === null || hours === undefined || hours === '—') return '—';
  const n = Math.round(Number(hours) * 100) / 100;
  if (Number.isNaN(n)) return '—';
  return `${n}h`;
}
function formatDayUnits(dayUnits) {
  if (dayUnits === null || dayUnits === undefined || dayUnits === '—') return '—';
  const n = Math.round(Number(dayUnits) * 100) / 100;
  if (Number.isNaN(n)) return '—';
  return `${n}d`;
}
function barHeight(hours) {
  return Math.max(((hours || 0) / maxDailyHours.value) * 100, 4);
}
function issueBar(hours) {
  return Math.max(((hours || 0) / maxIssueHours.value) * 100, 4);
}
function sharePct(hours) {
  if (!totalHoursForShare.value) return 0;
  return Math.round((Number(hours) / totalHoursForShare.value) * 100);
}
function shortDay(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}
function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function saveExportSettings() {
  if (!exportSettings.value.project_name.trim() || !exportSettings.value.project_number.trim()) {
    showToast('Please fill project name and project number.', 'error');
    return;
  }
  const result = await store.saveExportSettings({
    project_name: exportSettings.value.project_name.trim(),
    project_number: exportSettings.value.project_number.trim(),
  });
  if (!result.success) {
    showToast(result.error, 'error');
    return;
  }
  exportSettings.value = { ...store.exportSettings };
  showToast(result.message || 'Export settings saved.', 'success');
}

async function exportWorkbook() {
  if (!exportSettings.value.project_name.trim() || !exportSettings.value.project_number.trim()) {
    showToast('Save project name and project number before export.', 'error');
    return;
  }
  const result = await store.exportMonthlyWorkbook();
  if (!result.success) {
    showToast(result.error, 'error');
    return;
  }
  showToast('Monthly timesheet exported successfully.', 'success');
}

async function applyRange() {
  if (needsJiraLogin.value) return;
  if (!fromDate.value || !toDate.value) {
    showToast('Please select both From and To dates.', 'error');
    return;
  }
  store.setRange(fromDate.value, toDate.value);
  const result = await store.fetchOverview();
  if (!result.success) {
    if (isJiraAuthError(result.error)) {
      needsJiraLogin.value = true;
      store.error = null;
    } else {
      showToast(result.error, 'error');
    }
  }
  fromDate.value = store.range.from;
  toDate.value = store.range.to;
  if (viewMode.value === 'employee' && store.selectedEmployee) {
    await store.fetchEmployeeDetail(store.selectedEmployee);
  }
}

async function openEmployee(emp) {
  if (needsJiraLogin.value) return;
  if (!emp.user_id) {
    showToast('This logger has no linked user account.', 'error');
    return;
  }
  viewMode.value = 'employee';
  const result = await store.fetchEmployeeDetail(emp.user_id);
  if (!result.success) {
    if (isJiraAuthError(result.error)) {
      needsJiraLogin.value = true;
      store.error = null;
    } else {
      showToast(result.error, 'error');
    }
    viewMode.value = 'overall';
  }
}

function backToOverall() {
  viewMode.value = 'overall';
  store.clearEmployeeDetail();
}

onMounted(async () => {
  fromDate.value = store.range.from;
  toDate.value = store.range.to;

  await jiraStore.checkJiraConnection();
  needsJiraLogin.value = !jiraStore.jiraConnected || jiraStore.jiraExpired;

  const result = await store.fetchOverview();
  if (!result.success) {
    if (isJiraAuthError(result.error)) {
      needsJiraLogin.value = true;
      store.error = null;
    } else {
      showToast(result.error, 'error');
    }
  }
  const settingsResult = await store.fetchExportSettings();
  if (settingsResult.success) {
    exportSettings.value = { ...store.exportSettings };
  }
  fromDate.value = store.range.from;
  toDate.value = store.range.to;
});
</script>
