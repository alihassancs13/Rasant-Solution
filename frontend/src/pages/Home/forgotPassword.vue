<template>
  <div class="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#EFF6FF] via-white to-[#F8FAFC] px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-6 flex justify-center">
        <img src="../../assets/images/rasant-logo.png" alt="Rasant Solutions" class="h-10 w-auto" />
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <p class="text-[0.68rem] font-bold tracking-widest text-primary-700 uppercase mb-2">Account recovery</p>
        <h1 class="text-xl font-bold text-[#1E3A5F] mb-1">{{ stepTitle }}</h1>
        <p class="text-sm text-slate-500 mb-6">{{ stepSubtitle }}</p>

        <p v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ error }}
        </p>
        <p v-if="info" class="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {{ info }}
        </p>

        <!-- Step 1: email -->
        <form v-if="step === 1" class="space-y-4" @submit.prevent="sendCode">
          <div>
            <label class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-[#1E3A5F] uppercase">Email</label>
            <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="your.email@company.com"
                :class="[
                'w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm outline-none',
                emailLiveError
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 focus:border-red-500 focus:ring-red-500/30 focus:bg-red-50'
                  : 'border-slate-200 focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/15'
              ]"
            />
            <p v-if="emailLiveError" class="mt-1.5 text-xs font-medium text-red-600">
              {{ emailLiveError }}
            </p>
          </div>
          <button
              type="submit"
              class="w-full rounded-xl bg-[#1E3A5F] text-white font-semibold py-2.5 text-sm hover:bg-[#2A5F9E] disabled:opacity-50 cursor-pointer"
              :disabled="loading || hasEmailError"
          >
            {{ loading ? 'Sending…' : 'Send verification code' }}
          </button>
        </form>

        <!-- Step 2: OTP -->
        <form v-else-if="step === 2" class="space-y-4" @submit.prevent="verifyCode">
          <div>
            <label class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-[#1E3A5F] uppercase">Verification code</label>
            <input
                v-model="code"
                type="text"
                inputmode="numeric"
                maxlength="6"
                required
                placeholder="6-digit code"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm tracking-[0.3em] text-center font-semibold outline-none focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/15"
            />
            <p class="text-xs text-slate-500 mt-1.5">Sent to {{ email }}</p>
          </div>
          <button
              type="submit"
              class="w-full rounded-xl bg-[#1E3A5F] text-white font-semibold py-2.5 text-sm hover:bg-[#2A5F9E] disabled:opacity-50 cursor-pointer"
              :disabled="loading"
          >
            {{ loading ? 'Verifying…' : 'Verify code' }}
          </button>
          <button type="button" class="w-full text-sm text-[#4A90E2] font-semibold cursor-pointer" :disabled="loading" @click="sendCode">
            Resend code
          </button>
        </form>

        <!-- Step 3: new password -->
        <form v-else class="space-y-4" @submit.prevent="resetPassword">
          <div>
            <label class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-[#1E3A5F] uppercase">New password</label>
            <input
                v-model="newPassword"
                type="password"
                required
                autocomplete="new-password"
                :class="[
                'w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm outline-none',
                passwordLiveError
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 focus:border-red-500 focus:ring-red-500/30 focus:bg-red-50'
                  : 'border-slate-200 focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/15'
              ]"
            />

            <!-- Real-time red error (hard requirements not met) -->
            <p v-if="passwordLiveError" class="mt-1.5 text-xs font-medium text-red-600">
              {{ passwordLiveError }}
            </p>

            <!-- Real-time single-line strength label (only when requirements are met) -->
            <p
                v-else-if="passwordStrengthLabel"
                class="mt-1.5 text-xs font-medium"
                :class="passwordStrengthLabel.color"
            >
              {{ passwordStrengthLabel.text }}
            </p>

            <!-- Default static hint before typing starts -->
            <p v-else class="mt-1.5 text-xs text-slate-400">
              8–32 characters, at least 1 capital letter and 1 special character.
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-[#1E3A5F] uppercase">Confirm password</label>
            <input
                v-model="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                :class="[
                'w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm outline-none',
                confirmMismatchError
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50 focus:border-red-500 focus:ring-red-500/30 focus:bg-red-50'
                  : 'border-slate-200 focus:border-[#4A90E2] focus:ring-4 focus:ring-[#4A90E2]/15'
              ]"
            />
            <p v-if="confirmMismatchError" class="mt-1.5 text-xs font-medium text-red-600">
              {{ confirmMismatchError }}
            </p>
          </div>

          <button
              type="submit"
              class="w-full rounded-xl bg-[#1E3A5F] text-white font-semibold py-2.5 text-sm hover:bg-[#2A5F9E] disabled:opacity-50 cursor-pointer"
              :disabled="loading || hasPasswordError"
          >
            {{ loading ? 'Saving…' : 'Set new password' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-500">
          <router-link to="/login" class="text-[#4A90E2] font-semibold hover:underline">Back to sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/loginApi.js'
import { useValidation } from '@/composables/useValidation.js'

const router = useRouter()
const validation = useValidation()
const { LENGTH_LIMITS, getEmailError, getPasswordStrengthError } = validation
const getPasswordStrengthLabel = validation.getPasswordStrengthLabel || (() => null)

const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const resetToken = ref('')
const loading = ref(false)
const error = ref('')
const info = ref('')

const emailLiveError = computed(() => getEmailError(email.value, LENGTH_LIMITS.emailOrUsername.max))
const hasEmailError = computed(() => !!emailLiveError.value || !email.value.trim())

// Live password strength check: min 8, max 32, 1 capital, 1 special character
const passwordLiveError = computed(() => {
  if (!newPassword.value) return null // don't show error before user starts typing
  return getPasswordStrengthError(newPassword.value, LENGTH_LIMITS.password)
})

// Live single-line strength label (Weak / Medium / Strong) — only when no hard error
const passwordStrengthLabel = computed(() => {
  if (!newPassword.value || passwordLiveError.value) return null
  return getPasswordStrengthLabel(newPassword.value)
})

// Live confirm-password mismatch check
const confirmMismatchError = computed(() => {
  if (!confirmPassword.value) return null
  return confirmPassword.value !== newPassword.value ? 'Passwords do not match.' : null
})

const hasPasswordError = computed(() => {
  return !!getPasswordStrengthError(newPassword.value, LENGTH_LIMITS.password) || newPassword.value !== confirmPassword.value
})

const stepTitle = computed(() => {
  if (step.value === 1) return 'Forgot password'
  if (step.value === 2) return 'Enter verification code'
  return 'Create new password'
})

const stepSubtitle = computed(() => {
  if (step.value === 1) return 'Enter your account email and we’ll send a verification code.'
  if (step.value === 2) return 'Check your inbox for the 6-digit code.'
  return 'Choose a new password for your account.'
})

async function sendCode() {
  error.value = ''
  info.value = ''

  if (hasEmailError.value) {
    error.value = emailLiveError.value
    return
  }

  loading.value = true
  try {
    const { data } = await authAPI.forgotPassword(email.value.trim())
    info.value = data.message || 'If an account exists, a code was sent.'
    step.value = 2
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not send verification code.'
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  error.value = ''
  info.value = ''
  loading.value = true
  try {
    const { data } = await authAPI.verifyResetOtp(email.value.trim(), code.value.trim())
    resetToken.value = data.reset_token
    info.value = data.message || 'Code verified.'
    step.value = 3
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid verification code.'
  } finally {
    loading.value = false
  }
}

async function resetPassword() {
  error.value = ''
  info.value = ''

  const strengthError = getPasswordStrengthError(newPassword.value, LENGTH_LIMITS.password)
  if (strengthError) {
    error.value = strengthError
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    const { data } = await authAPI.resetPassword({
      reset_token: resetToken.value,
      new_password: newPassword.value,
      confirm_password: confirmPassword.value,
    })
    info.value = data.message || 'Password updated.'
    setTimeout(() => router.push('/login'), 1200)
  } catch (err) {
    error.value = err.response?.data?.error || 'Could not reset password.'
  } finally {
    loading.value = false
  }
}
</script>