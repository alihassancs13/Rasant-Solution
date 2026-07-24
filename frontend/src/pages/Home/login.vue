<template>
  <div class="login-page fixed inset-0 flex h-dvh w-full max-w-[100vw] overflow-hidden bg-gradient-primary font-primary antialiased">

    <div class="flex min-h-0 min-w-0 flex-1 w-full overflow-hidden">
      <!-- Left panel -->
      <aside class="relative hidden min-h-0 min-w-0 flex-[1.08] flex-col justify-between overflow-hidden border-r border-borderDefault px-10 pt-8 pb-8 lg:flex lg:px-12 lg:pt-10 lg:pb-10 xl:px-14">

        <div class="absolute inset-0 bg-gradient-primary" aria-hidden="true"></div>

        <!-- Animated grid -->
        <div
            class="pointer-events-none absolute inset-0 animate-login-grid bg-[radial-gradient(circle,var(--color-primary-800)/0.055_1px,transparent_1px)] bg-[length:26px_26px]"
            aria-hidden="true"
        ></div>

        <!-- Floating orbs -->
        <div class="pointer-events-none absolute -top-32 -left-24 h-[520px] w-[520px] animate-login-orb rounded-full bg-[radial-gradient(circle,var(--color-secondary-100),transparent_65%)] opacity-60 blur-[72px]" aria-hidden="true"></div>
        <div class="pointer-events-none absolute -right-12 -bottom-16 h-[440px] w-[440px] animate-login-orb rounded-full bg-[radial-gradient(circle,var(--color-mesh-purple),transparent_65%)] opacity-60 blur-[72px] [animation-direction:reverse] [animation-duration:18s]" aria-hidden="true"></div>
        <div class="pointer-events-none absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 animate-login-orb rounded-full bg-[radial-gradient(circle,var(--color-primary-500)/0.12,transparent_70%)] blur-[60px] [animation-duration:14s] [animation-delay:3s]" aria-hidden="true"></div>

        <!-- Animated scanline shimmer -->
        <div class="pointer-events-none absolute inset-0 animate-scanline opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--color-section-white)/0.5_2px,var(--color-section-white)/0.5_4px)]" aria-hidden="true"></div>

        <div class="relative z-10 animate-login-fade-up">
          <!-- Live badge with pulsing ring -->
          <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-borderDefault bg-badgeSemi px-3.5 py-1.5 text-[0.67rem] font-bold tracking-widest text-textSupporting uppercase shadow-sm backdrop-blur-sm">
              <span class="relative flex h-2 w-2 shrink-0">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-60"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
              </span>
            Secure · Role-based · Always on
          </div>

          <h1 class="mb-2.5 font-display text-[clamp(1.65rem,2.4vw,2.5rem)] leading-[1.12] font-bold tracking-tight text-headingMain">
            Everything you build,<br />
            <span class="text-gradient-primary relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-secondary-500 after:to-primary-500 after:animate-underline-grow">one place to manage.</span>
          </h1>

          <p class="max-w-[380px] text-sm leading-relaxed text-textBody">
            Unified access to Sentra AI, Voice AI Agent, Chatbot dashboards and client billing — secured with role-based controls.
          </p>
        </div>

        <div class="relative z-10 flex min-h-0 flex-1 items-center justify-center py-4 animate-login-fade-up [animation-delay:80ms]">
          <LoginVisual class="w-full max-w-[min(100%,540px)] min-h-[240px] max-h-[min(46vh,480px)] drop-shadow-[var(--shadow-blue)] transition-all duration-700 hover:drop-shadow-[0_24px_64px_rgba(74,144,226,0.35)] hover:-translate-y-1" />
        </div>

        <div class="relative z-10 flex flex-wrap gap-2 animate-login-fade-up [animation-delay:160ms]">
          <div
              v-for="(stat, i) in stats"
              :key="stat.label"
              :style="{ animationDelay: `${200 + i * 80}ms` }"
              class="stat-card flex min-w-[88px] flex-col rounded-xl border border-borderDefault bg-cardSemi px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(74,144,226,0.18)] hover:border-primary-200 animate-login-fade-up cursor-default"
          >
            <span class="font-display text-xl leading-none font-extrabold text-headingMain">{{ stat.value }}</span>
            <span class="mt-0.5 text-[0.68rem] font-medium text-textSupporting">{{ stat.label }}</span>
          </div>
        </div>
      </aside>

      <!-- Right panel -->
      <main class="relative flex min-h-0 min-w-0 flex-1 w-full flex-col items-center overflow-hidden bg-gradient-primary px-4 py-4 sm:px-6 sm:py-6 lg:bg-section-white/80 lg:backdrop-blur-sm">

        <!-- Animated concentric rings (desktop only — avoids mobile horizontal overflow) -->
        <div class="pointer-events-none absolute -top-48 -right-48 hidden h-[580px] w-[580px] animate-login-ring rounded-full border border-primary-500/10 lg:block" aria-hidden="true"></div>
        <div class="pointer-events-none absolute -top-28 -right-28 hidden h-[380px] w-[380px] animate-login-ring rounded-full border border-primary-500/10 [animation-delay:2s] lg:block" aria-hidden="true"></div>
        <div class="pointer-events-none absolute -top-14 -right-14 hidden h-[200px] w-[200px] animate-login-ring rounded-full border border-primary-500/8 [animation-delay:4s] lg:block" aria-hidden="true"></div>

        <div class="pointer-events-none absolute -bottom-24 -left-20 hidden h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,var(--color-secondary-500)/0.08_0%,var(--color-accent-3)/0.06_50%,transparent_70%)] blur-2xl lg:block" aria-hidden="true"></div>

        <!-- Floating particles -->
        <div class="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
          <span class="particle absolute top-[15%] left-[8%] h-1 w-1 rounded-full bg-primary-400/30 animate-float-1"></span>
          <span class="particle absolute top-[35%] right-[12%] h-1.5 w-1.5 rounded-full bg-secondary-400/25 animate-float-2"></span>
          <span class="particle absolute bottom-[22%] left-[15%] h-1 w-1 rounded-full bg-accent-3/20 animate-float-3"></span>
          <span class="particle absolute top-[65%] right-[8%] h-1 w-1 rounded-full bg-primary-300/30 animate-float-1 [animation-delay:1.5s]"></span>
          <span class="particle absolute bottom-[40%] left-[5%] h-1 w-1 rounded-full bg-secondary-300/20 animate-float-2 [animation-delay:2.5s]"></span>
        </div>

        <div class="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center justify-center">
          <div class="w-full max-w-[400px] min-w-0 animate-login-card sm:max-w-[420px] lg:max-w-[400px] [animation-delay:60ms]">

            <div class="mb-4 flex justify-center">
              <img
                  src="../../assets/images/rasant-logo.png"
                  alt="Rasant Solutions"
                  width="212"
                  height="42"
                  decoding="async"
                  class="h-10 w-auto max-w-[180px] object-contain"
              />
            </div>

            <div class="mb-4 sm:mb-5">
              <div class="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[0.68rem] font-bold tracking-widest text-primary-700 uppercase">
                <font-awesome-icon icon="fa-solid fa-shield-halved" class="text-[0.65rem] text-primary-500 animate-shield-pulse" />
                Secure Sign-In
              </div>
              <h2 class="mt-2 font-display text-xl font-bold text-headingMain animate-login-fade-up [animation-delay:120ms] sm:mt-3 sm:text-2xl">Welcome back</h2>
              <p class="mt-1 text-sm leading-relaxed text-textBody animate-login-fade-up [animation-delay:180ms]">
                Sign in to access your Rasant Solutions workspace.
              </p>
            </div>

            <form @submit.prevent="handleLoginSubmit" novalidate class="space-y-3 sm:space-y-4">
              <div class="animate-login-fade-up [animation-delay:220ms]">
                <label for="username" class="mb-1.5 block text-[0.7rem] font-bold tracking-wider text-headingMain uppercase">
                  Email or Username
                </label>
                <div class="relative group">
                <span class="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-primary-500 transition-transform duration-200 group-focus-within:scale-110">
                  <font-awesome-icon icon="fa-solid fa-user" />
                </span>
                  <input
                      id="emailOrusername"
                      v-model="emailOrUsername"
                      type="text"
                      placeholder="Enter your email or username"
                      required
                      autocomplete="username"
                      :class="[
                    'login-input w-full rounded-xl border border-borderDefault bg-neutral-100 py-2.5 pr-3 pl-10 text-[0.9375rem] text-headingMain outline-none transition-all duration-200 placeholder:text-textSupporting',
                    fieldErrors.emailOrUsername
                      ? 'border-error ring-2 ring-error/20 bg-error/5 focus:border-error focus:ring-error/30 focus:bg-error/5'
                      : 'focus:border-primary-500 focus:bg-section-white focus:ring-4 focus:ring-primary-500/12 focus:shadow-[0_0_0_4px_rgba(74,144,226,0.08),0_2px_8px_rgba(74,144,226,0.12)]'
                  ]"
                  />
                </div>
                <p v-if="emailLiveError" class="mt-1 text-xs font-medium text-error animate-shake">
                  {{ emailLiveError }}
                </p>
              </div>

              <div class="animate-login-fade-up [animation-delay:280ms]">
                <div class="mb-1.5 flex items-center justify-between">
                  <label for="password" class="text-[0.7rem] font-bold tracking-wider text-headingMain uppercase">
                    Password
                  </label>
                  <router-link
                      to="/forgot-password"
                      class="text-xs font-semibold text-secondary-500 transition-all duration-200 hover:text-accent-4 hover:underline hover:underline-offset-2"
                  >
                    Forgot password?
                  </router-link>
                </div>
                <div class="relative group">
                <span class="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-primary-500 transition-transform duration-200 group-focus-within:scale-110">
                  <font-awesome-icon icon="fa-solid fa-lock" />
                </span>
                  <input
                      id="password"
                      v-model="password"
                      :type="isPasswordVisible ? 'text' : 'password'"
                      placeholder="Enter your password"
                      required
                      autocomplete="current-password"
                      :class="[
                    'login-input w-full rounded-xl border border-borderDefault bg-neutral-100 py-2.5 pr-11 pl-10 text-[0.9375rem] text-headingMain outline-none transition-all duration-200 placeholder:text-textSupporting',
                    fieldErrors.password
                      ? 'border-error ring-2 ring-error/20 bg-error/5 focus:border-error focus:ring-error/30 focus:bg-error/5'
                      : 'focus:border-primary-500 focus:bg-section-white focus:ring-4 focus:ring-primary-500/12 focus:shadow-[0_0_0_4px_rgba(74,144,226,0.08),0_2px_8px_rgba(74,144,226,0.12)]'
                  ]"
                  />
                  <button
                      type="button"
                      class="absolute top-1/2 right-0 flex h-full w-10 -translate-y-1/2 items-center justify-center rounded-r-xl text-accent-3 transition-all duration-200 hover:bg-primary-500/10 hover:text-primary-600 active:scale-90"
                      :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                      @click="togglePasswordVisibility"
                  >
                    <font-awesome-icon
                        :icon="isPasswordVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                        class="text-[0.95rem] transition-transform duration-200"
                        :class="isPasswordVisible ? 'scale-90' : 'scale-100'"
                    />
                  </button>
                </div>
                <p v-if="passwordLengthError" class="mt-1 text-xs font-medium text-error animate-shake">
                  {{ passwordLengthError }}
                </p>
              </div>

              <label class="inline-flex cursor-pointer items-center gap-2.5 text-sm text-textBody select-none group animate-login-fade-up [animation-delay:320ms]">
                <input v-model="rememberMe" type="checkbox" class="h-4 w-4 cursor-pointer accent-primary-500 transition-transform duration-150 group-hover:scale-110" />
                <span class="transition-colors duration-200 group-hover:text-primary-700">Remember me on this device</span>
              </label>

              <div class="animate-login-fade-up [animation-delay:360ms]">
                <ShineButton
                    type="submit"
                    size="md"
                    shape="xl"
                    class="w-full! transition-transform duration-150 active:scale-[0.98]"
                    :disabled="isLoading || hasLengthError"
                >
                <span v-if="isLoading">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="mr-2 animate-spin" />
                  Signing in...
                </span>
                  <span v-else>Sign In</span>
                </ShineButton>
              </div>
            </form>

            <div class="mt-4 text-center animate-login-fade-up [animation-delay:400ms]">
              <p class="text-sm text-textBody">
                Need access?
                <router-link to="/contact" class="font-semibold text-secondary-500 transition-all duration-200 hover:text-accent-4 hover:underline hover:underline-offset-2">
                  Contact sales
                </router-link>
              </p>
            </div>
          </div>
        </div>

        <router-link
            to="/"
            class="relative z-20 mt-auto inline-flex shrink-0 items-center gap-1.5 pb-2 pt-4 text-sm font-semibold text-textBody transition-all duration-200 hover:text-headingMain no-underline"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-xs" />
          Back to website
        </router-link>
      </main>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  overscroll-behavior: none;
}

.login-input:-webkit-autofill,
.login-input:-webkit-autofill:hover,
.login-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1e3a5f;
  -webkit-box-shadow: 0 0 0 1000px #f8fafc inset;
  transition: background-color 9999s ease-out;
}

/* Scanline sweep animation */
@keyframes scanline {
  0% { background-position: 0 0; }
  100% { background-position: 0 100px; }
}
.animate-scanline {
  animation: scanline 4s linear infinite;
}

/* Gradient shift on top bar */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
}

/* Underline grow for headline */
@keyframes underline-grow {
  0% { transform: scaleX(0); opacity: 0; }
  100% { transform: scaleX(1); opacity: 1; }
}
.animate-underline-grow {
  animation: underline-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both;
}

/* Shield pulse */
@keyframes shield-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.92); }
}
.animate-shield-pulse {
  animation: shield-pulse 2.5s ease-in-out infinite;
}

/* Error shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-5px); }
  30% { transform: translateX(5px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Floating particles */
@keyframes float-1 {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
  33% { transform: translateY(-18px) translateX(8px); opacity: 0.8; }
  66% { transform: translateY(-8px) translateX(-6px); opacity: 0.5; }
}
@keyframes float-2 {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  40% { transform: translateY(14px) translateX(-10px); opacity: 0.7; }
  70% { transform: translateY(6px) translateX(8px); opacity: 0.4; }
}
@keyframes float-3 {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.35; }
  50% { transform: translateY(-12px) translateX(12px) scale(1.5); opacity: 0.6; }
}
.animate-float-1 { animation: float-1 6s ease-in-out infinite; }
.animate-float-2 { animation: float-2 8s ease-in-out infinite; }
.animate-float-3 { animation: float-3 7s ease-in-out infinite; }
</style>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import ShineButton from '../../components/ShineButton.vue';
import { useLogin } from '../../composables/useLogin.js';
import LoginVisual from "@/components/LoginVisual.vue";

onMounted(() => {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

const stats = [
  { value: '99%', label: 'Uptime SLA' },
  { value: '150+', label: 'Clients worldwide' },
  { value: '3×', label: 'Faster delivery' },
];

const {
  emailOrUsername,
  password,
  rememberMe,
  isPasswordVisible,
  isLoading,
  fieldErrors,
  emailLengthError,
  emailLiveError,
  passwordLengthError,
  hasLengthError,
  togglePasswordVisibility,
  handleLoginSubmit,
} = useLogin();

</script>