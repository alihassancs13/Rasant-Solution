<template>
  <div class="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#EFF6FF] via-white to-[#F8FAFC] px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-6 flex justify-center">
        <img src="../../assets/images/rasant-logo.png" alt="Rasant Solutions" class="h-10 w-auto" />
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <template v-if="checking">
          <p class="text-sm text-slate-500 text-center py-8">Validating your invite link…</p>
        </template>

        <template v-else-if="!valid">
          <h1 class="text-xl font-bold text-[#1E3A5F] mb-2">Link invalid or expired</h1>
          <p class="text-sm text-slate-500 mb-6">{{ error || 'Please ask your admin to resend a create-password email.' }}</p>
          <router-link
            to="/login"
            class="inline-flex w-full justify-center rounded-xl bg-[#1E3A5F] text-white font-semibold py-2.5 text-sm hover:bg-[#2A5F9E]"
          >
            Go to sign in
          </router-link>
        </template>

        <template v-else>
          <p class="text-[0.68rem] font-bold tracking-widest text-primary-700 uppercase mb-2">Welcome</p>
          <h1 class="text-xl font-bold text-[#1E3A5F] mb-1">Create your password</h1>
          <p class="text-sm text-slate-500 mb-6">
            Hi {{ profileName || 'there' }} — set a password for
            <span class="font-semibold text-slate-700">{{ profileEmail }}</span>
          </p>

          <p v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ error }}
          </p>
          <p v-if="info" class="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {{ info }}
          </p>

          <form class="space-y-4" @submit.prevent="submit">
            <div>
              <label class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-[#1E3A5F] uppercase">New password</label>
              <input
                v-model="newPassword"
                type="password"
                required
                minlength="8"
                autocomplete="new-password"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/15"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-[#1E3A5F] uppercase">Confirm password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                minlength="8"
                autocomplete="new-password"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/15"
              />
            </div>
            <button
              type="submit"
              class="w-full rounded-xl bg-[#1E3A5F] text-white font-semibold py-2.5 text-sm hover:bg-[#2A5F9E] disabled:opacity-50 cursor-pointer"
              :disabled="loading"
            >
              {{ loading ? 'Saving…' : 'Create password' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authAPI } from '@/services/loginApi.js'

const route = useRoute()
const router = useRouter()
const token = String(route.params.token || '')

const checking = ref(true)
const valid = ref(false)
const profileName = ref('')
const profileEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const info = ref('')

onMounted(async () => {
  try {
    const { data } = await authAPI.validateSetupToken(token)
    valid.value = Boolean(data.valid)
    profileName.value = data.name || ''
    profileEmail.value = data.email || ''
  } catch (err) {
    valid.value = false
    error.value = err.response?.data?.error || 'This create-password link is invalid or expired.'
  } finally {
    checking.value = false
  }
})

async function submit() {
  error.value = ''
  info.value = ''
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  loading.value = true
  try {
    const { data } = await authAPI.confirmSetupPassword(token, {
      new_password: newPassword.value,
      confirm_password: confirmPassword.value,
    })
    info.value = data.message || 'Password created.'
    setTimeout(() => router.push('/login'), 1200)
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not create password.'
  } finally {
    loading.value = false
  }
}
</script>
