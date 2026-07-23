<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <AppHeader
            :userName="displayName"
            :role="roleLabel"
            titleOverride="Manage Account"
            subtitleOverride="Profile, password & email settings"
            :iconOverride="['fas', 'users-gear']"
            settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6">
        <div class="max-w-5xl mx-auto space-y-5">

          <!-- Hero strip -->
          <section class="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1E3A5F] via-[#2A5F9E] to-[#4A90E2] p-6 sm:p-8 text-white shadow-sm">
            <div class="absolute inset-0 opacity-30 pointer-events-none"
                 style="background: radial-gradient(circle at 90% 10%, rgba(255,255,255,0.35), transparent 45%);"></div>
            <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div class="relative">
                <div class="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                  <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                  <span v-else class="text-2xl font-bold tracking-wide">{{ initials }}</span>
                </div>
                <label class="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-50 transition-colors">
                  <font-awesome-icon :icon="['fas', 'image']" class="text-sm" />
                  <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
                </label>
              </div>
              <div class="min-w-0">
                <p class="text-xs uppercase tracking-[0.18em] text-sky-100/90 font-semibold mb-1">Account</p>
                <h1 class="text-2xl sm:text-3xl font-bold font-display truncate">{{ displayName }}</h1>
                <p class="text-sky-100/90 text-sm mt-1">{{ profile?.email || 'No email set' }} · {{ roleLabel }}</p>
              </div>
            </div>
          </section>

          <!-- Tabs -->
          <div class="flex flex-wrap gap-2">
            <button
                v-for="tab in visibleTabs"
                :key="tab.id"
                type="button"
                @click="activeTab = tab.id"
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer border"
                :class="activeTab === tab.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-text-secondary border-border hover:bg-primary-subtle hover:text-primary'"
            >
              <font-awesome-icon :icon="tab.icon" class="mr-2" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Profile -->
          <section v-if="activeTab === 'profile'" class="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6">
            <div class="mb-5">
              <h2 class="text-lg font-bold text-headingMain">Profile details</h2>
              <p class="text-sm text-textSupporting mt-1">Update how your name and contact appear across the portal.</p>
            </div>

            <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="saveProfile">
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Username</label>
                <input v-model="profileForm.username" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Email</label>
                <input v-model="profileForm.email" type="email" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">First name</label>
                <input v-model="profileForm.first_name" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Last name</label>
                <input v-model="profileForm.last_name" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" />
              </div>

              <div v-if="profile?.employee" class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-sectionLight border border-border p-4">
                <div>
                  <p class="text-[11px] uppercase tracking-wide text-text-muted font-semibold">Employee ID</p>
                  <p class="text-sm font-semibold text-text-primary mt-0.5">{{ profile.employee.employee_number }}</p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wide text-text-muted font-semibold">Department</p>
                  <p class="text-sm font-semibold text-text-primary mt-0.5">{{ profile.employee.department || '—' }}</p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wide text-text-muted font-semibold">Designation</p>
                  <p class="text-sm font-semibold text-text-primary mt-0.5">{{ profile.employee.designation || '—' }}</p>
                </div>
              </div>

              <div class="sm:col-span-2 flex justify-end pt-2">
                <button type="submit" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-buttonBackground text-white text-sm font-semibold hover:bg-buttonHover transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm" :disabled="accountStore.isSavingProfile">
                  <font-awesome-icon v-if="accountStore.isSavingProfile" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
                  Save profile
                </button>
              </div>
            </form>
          </section>

          <!-- Password -->
          <section v-if="activeTab === 'password'" class="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6">
            <div class="mb-5">
              <h2 class="text-lg font-bold text-headingMain">Change password</h2>
              <p class="text-sm text-textSupporting mt-1">Use a strong password with mixed case, numbers, and a symbol.</p>
            </div>

            <form class="max-w-lg space-y-4" @submit.prevent="savePassword">
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Current password</label>
                <div class="relative">
                  <input v-model="passwordForm.current_password" :type="show.current ? 'text' : 'password'" class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" required />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer" @click="show.current = !show.current">
                    <font-awesome-icon :icon="['fas', show.current ? 'eye-slash' : 'eye']" />
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">New password</label>
                <div class="relative">
                  <input v-model="passwordForm.new_password" :type="show.next ? 'text' : 'password'" class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" required minlength="8" />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer" @click="show.next = !show.next">
                    <font-awesome-icon :icon="['fas', show.next ? 'eye-slash' : 'eye']" />
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Confirm new password</label>
                <div class="relative">
                  <input v-model="passwordForm.confirm_password" :type="show.confirm ? 'text' : 'password'" class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" required minlength="8" />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer" @click="show.confirm = !show.confirm">
                    <font-awesome-icon :icon="['fas', show.confirm ? 'eye-slash' : 'eye']" />
                  </button>
                </div>
              </div>
              <div class="flex justify-end pt-2">
                <button type="submit" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-buttonBackground text-white text-sm font-semibold hover:bg-buttonHover transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm" :disabled="accountStore.isSavingPassword">
                  <font-awesome-icon v-if="accountStore.isSavingPassword" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
                  Update password
                </button>
              </div>
            </form>
          </section>

          <!-- Email settings (admin) -->
          <section v-if="activeTab === 'email' && isAdmin" class="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6">
            <div class="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold text-headingMain">Email / SMTP settings</h2>
                <p class="text-sm text-textSupporting mt-1">
                  Outgoing mail for employee credentials, onboarding, status updates, and increment alerts.
                </p>
              </div>
              <label class="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary cursor-pointer select-none">
                <input v-model="emailForm.is_active" type="checkbox" class="rounded border-border text-primary focus:ring-primary" />
                SMTP active
              </label>
            </div>

            <div v-if="accountStore.isLoadingEmail" class="py-12 text-center text-text-muted text-sm">
              <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin mr-2" />
              Loading settings…
            </div>

            <form v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="saveEmail">
              <div class="sm:col-span-2 rounded-xl border border-border bg-sectionLight p-4 text-sm text-textSupporting">
                <p class="font-semibold text-text-primary mb-1">Recommended Rasant mail server</p>
                <p>Host <span class="font-mono text-primary">mail.rasantsol.com</span> · SMTP port <span class="font-mono text-primary">465</span> (SSL) · Auth required</p>
              </div>

              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">SMTP host</label>
                <input v-model="emailForm.smtp_host" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" placeholder="mail.rasantsol.com" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">SMTP port</label>
                <input v-model.number="emailForm.smtp_port" type="number" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" min="1" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Username</label>
                <input v-model="emailForm.smtp_username" type="email" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" placeholder="danialali@rasantsol.com" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  Password
                  <span v-if="emailForm.has_password" class="normal-case font-medium text-tagTealText">(saved — leave blank to keep)</span>
                </label>
                <div class="relative">
                  <input v-model="emailForm.smtp_password" :type="show.smtp ? 'text' : 'password'" class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" placeholder="Email account password" autocomplete="new-password" />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer" @click="show.smtp = !show.smtp">
                    <font-awesome-icon :icon="['fas', show.smtp ? 'eye-slash' : 'eye']" />
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">From name</label>
                <input v-model="emailForm.from_name" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">From email</label>
                <input v-model="emailForm.from_email" type="email" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" required />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Admin notification email</label>
                <input v-model="emailForm.admin_notification_email" type="email" class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" required />
                <p class="text-xs text-text-muted mt-1">Receives increment-due digests and onboarding alerts.</p>
              </div>

              <div class="sm:col-span-2 flex flex-wrap items-center gap-4">
                <label class="inline-flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                  <input v-model="emailForm.use_ssl" type="checkbox" class="rounded border-border text-primary focus:ring-primary" @change="onSslToggle" />
                  Use SSL (port 465)
                </label>
                <label class="inline-flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                  <input v-model="emailForm.use_tls" type="checkbox" class="rounded border-border text-primary focus:ring-primary" @change="onTlsToggle" />
                  Use TLS (port 587)
                </label>
              </div>

              <div class="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border mt-2">
                <div class="flex flex-1 gap-2 items-center">
                  <input v-model="testToEmail" type="email" class="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-activeBorder transition" placeholder="Send test to…" />
                  <button type="button" class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm font-semibold hover:bg-primary-subtle hover:text-primary transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap" :disabled="accountStore.isTestingEmail" @click="sendTest">
                    <font-awesome-icon v-if="accountStore.isTestingEmail" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
                    Send test
                  </button>
                </div>
                <button type="submit" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-buttonBackground text-white text-sm font-semibold hover:bg-buttonHover transition-colors disabled:opacity-60 cursor-pointer shadow-sm" :disabled="accountStore.isSavingEmail">
                  <font-awesome-icon v-if="accountStore.isSavingEmail" :icon="['fas', 'spinner']" class="animate-spin mr-2" />
                  Save email settings
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue';
import AdminSidebar from '@/components/adminSidebar.vue';
import AppHeader from '@/components/header.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import { useAccountStore } from '@/stores/accountStore.js';
import { useLoginStore } from '@/stores/loginStore.js';
import { useToast } from '@/composables/useToast.js';
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl.js';

const accountStore = useAccountStore();
const loginStore = useLoginStore();
const { showToast } = useToast();

const activeTab = ref('profile');
const avatarBust = ref(Date.now());
const testToEmail = ref('');

const show = reactive({
  current: false,
  next: false,
  confirm: false,
  smtp: false,
});

const profileForm = reactive({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
});

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
});

const emailForm = reactive({
  smtp_host: 'mail.rasantsol.com',
  smtp_port: 465,
  smtp_username: 'danialali@rasantsol.com',
  smtp_password: '',
  has_password: false,
  use_ssl: true,
  use_tls: false,
  from_name: 'Rasant Solutions',
  from_email: 'danialali@rasantsol.com',
  admin_notification_email: 'danialali@rasantsol.com',
  is_active: true,
});

const profile = computed(() => accountStore.profile);
const isAdmin = computed(() => {
  const role = (profile.value?.role_name || loginStore.getUserRole || '').toLowerCase();
  return role === 'admin' || role === 'administrator';
});

const visibleTabs = computed(() => {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: ['fas', 'user'] },
    { id: 'password', label: 'Password', icon: ['fas', 'lock'] },
  ];
  if (isAdmin.value) {
    tabs.push({ id: 'email', label: 'Email settings', icon: ['fas', 'envelope'] });
  }
  return tabs;
});

const displayName = computed(() => {
  const p = profile.value;
  if (!p) return loginStore.getUserName || 'User';
  const full = `${p.first_name || ''} ${p.last_name || ''}`.trim();
  return full || p.username || p.email || 'User';
});

const roleLabel = computed(() => profile.value?.role_name || loginStore.getUserRole || 'User');

const initials = computed(() => {
  const name = displayName.value || 'U';
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'U';
});

const avatarObjectUrl = ref(null);

const avatarUrl = computed(() => avatarObjectUrl.value);

async function loadAvatarBlob() {
  if (avatarObjectUrl.value) {
    URL.revokeObjectURL(avatarObjectUrl.value);
    avatarObjectUrl.value = null;
  }
  const id = profile.value?.id || loginStore.user?.id;
  if (!id || !profile.value?.has_avatar) return;
  try {
    const token = localStorage.getItem('accessToken');
    const base = BASE_URL.replace(/\/$/, '');
    const res = await fetch(`${base}${API_ENDPOINTS.ACCOUNTS_GET_USER_AVATAR(id)}?t=${avatarBust.value}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    avatarObjectUrl.value = URL.createObjectURL(blob);
  } catch {
    // keep initials fallback
  }
}

watch(
  () => [profile.value?.id, profile.value?.has_avatar, avatarBust.value],
  () => { loadAvatarBlob(); },
  { immediate: true }
);

function fillProfileForm(data) {
  if (!data) return;
  profileForm.username = data.username || '';
  profileForm.email = data.email || '';
  profileForm.first_name = data.first_name || '';
  profileForm.last_name = data.last_name || '';
}

function fillEmailForm(data) {
  if (!data) return;
  Object.assign(emailForm, {
    smtp_host: data.smtp_host || '',
    smtp_port: data.smtp_port || 465,
    smtp_username: data.smtp_username || '',
    smtp_password: '',
    has_password: !!data.has_password,
    use_ssl: !!data.use_ssl,
    use_tls: !!data.use_tls,
    from_name: data.from_name || '',
    from_email: data.from_email || '',
    admin_notification_email: data.admin_notification_email || '',
    is_active: data.is_active !== false,
  });
  testToEmail.value = data.admin_notification_email || data.from_email || profileForm.email || '';
}

function onSslToggle() {
  if (emailForm.use_ssl) {
    emailForm.use_tls = false;
    if (emailForm.smtp_port === 587) emailForm.smtp_port = 465;
  }
}

function onTlsToggle() {
  if (emailForm.use_tls) {
    emailForm.use_ssl = false;
    if (emailForm.smtp_port === 465) emailForm.smtp_port = 587;
  }
}

async function saveProfile() {
  const result = await accountStore.updateProfile({ ...profileForm });
  showToast(result.success ? result.message : result.error, result.success ? 'success' : 'error');
}

async function savePassword() {
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    showToast('New passwords do not match.', 'error');
    return;
  }
  const result = await accountStore.changePassword({ ...passwordForm });
  showToast(result.success ? result.message : result.error, result.success ? 'success' : 'error');
  if (result.success) {
    passwordForm.current_password = '';
    passwordForm.new_password = '';
    passwordForm.confirm_password = '';
  }
}

async function saveEmail() {
  const payload = { ...emailForm };
  delete payload.has_password;
  if (!payload.smtp_password) delete payload.smtp_password;
  const result = await accountStore.saveEmailSettings(payload);
  showToast(result.success ? result.message : result.error, result.success ? 'success' : 'error');
  if (result.success) fillEmailForm(accountStore.emailSettings);
}

async function sendTest() {
  if (!testToEmail.value) {
    showToast('Enter an email address for the test.', 'error');
    return;
  }
  const result = await accountStore.testEmailSettings(testToEmail.value);
  showToast(result.success ? result.message : result.error, result.success ? 'success' : 'error');
}

async function onAvatarChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const result = await accountStore.uploadAvatar(file);
  showToast(result.success ? 'Avatar updated.' : result.error, result.success ? 'success' : 'error');
  if (result.success) {
    avatarBust.value = Date.now();
    // Keep header avatar in sync with login user
    if (loginStore.user) {
      loginStore.setUser({ ...loginStore.user, has_avatar: true });
    }
  }
  event.target.value = '';
}

watch(activeTab, async (tab) => {
  if (tab === 'email' && isAdmin.value && !accountStore.emailSettings) {
    const result = await accountStore.fetchEmailSettings();
    if (result.success) fillEmailForm(result.data);
    else showToast(result.error, 'error');
  }
});

onMounted(async () => {
  const result = await accountStore.fetchProfile();
  if (result.success) fillProfileForm(result.data);
  else showToast(result.error, 'error');
});

onBeforeUnmount(() => {
  if (avatarObjectUrl.value) URL.revokeObjectURL(avatarObjectUrl.value);
});
</script>
