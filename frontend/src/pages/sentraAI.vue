<template>
  <Navbar />
  <div class="bg-[#f8fafc] min-h-screen">
    <!-- Showcase Section -->
    <section class="relative pt-[68px] overflow-hidden bg-gradient-to-b from-[#eff6ff] via-[#fff8f3] to-[#f8fafc]">
      <!-- Mesh Background -->
      <div class="absolute inset-[-10%_-5%] pointer-events-none"
           :style="{
             background: `
               radial-gradient(circle at 18% 20%, rgba(143, 185, 244, 0.35) 0%, transparent 42%),
               radial-gradient(circle at 82% 18%, rgba(201, 196, 248, 0.28) 0%, transparent 40%),
               radial-gradient(circle at 50% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 45%)
             `
           }">
      </div>

      <div class="max-w-7xl mx-auto px-[5%] relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <!-- Left Content -->
          <div>
            <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4">
              Sentra AI Platform
            </span>
            <h1 class="font-['Space_Grotesk'] text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-[-1px] mb-2.5">
              Omni-channel call center with <br/>
              <em class="not-italic bg-gradient-to-r from-[#2A5F9E] to-[#14B8A6] bg-clip-text text-transparent">
                AI routing and live supervision
              </em>
            </h1>
            <p class="text-[15px] text-slate-600 leading-relaxed mb-4 max-w-2xl">
              Inbound and outbound voice, AI bots, live agents, chatbots, and supervisor analytics — one platform for modern contact centers.
            </p>
            <div class="flex gap-3 flex-wrap">
              <router-link to="/login" class="inline-flex items-center px-6 py-3 bg-[#2A5F9E] text-white font-semibold rounded-lg hover:bg-[#1E3A5F] transition-all duration-300 shadow-lg hover:shadow-xl">
                Open Sentra Portal
              </router-link>
              <router-link to="/contact?project=sentra" class="inline-flex items-center px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-[#2A5F9E] hover:text-[#2A5F9E] transition-all duration-300">
                Book a Demo
              </router-link>
            </div>
          </div>

          <!-- Right Visual -->
          <div class="relative z-[3] flex justify-center">
            <div class="relative w-[min(360px,86vw)]">
              <div class="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.22)_0%,transparent_70%)] pointer-events-none"></div>
              <div class="absolute inset-[-14px] rounded-full border-2 border-dashed border-[rgba(42,95,158,0.32)] animate-[spin_22s_linear_infinite] pointer-events-none"></div>
              <div class="absolute inset-[-22px] rounded-full border-2 border-dashed border-[rgba(20,184,166,0.22)] animate-[spin_30s_linear_infinite_reverse] pointer-events-none"></div>
              <img src="@/assets/svg/sentra-bot.svg" alt="Sentra AI call routing"
                   class="w-full relative z-[2] drop-shadow-[0_16px_36px_rgba(42,95,158,0.2)]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Architecture -->
    <section class="py-[72px] px-[5%] bg-gradient-to-br from-[#fff8f3] via-[#f5f0ff] to-[#eff6ff]">
      <div class="max-w-[1320px] mx-auto">
        <div class="text-center max-w-[760px] mx-auto mb-9">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4">
            Platform Architecture
          </span>
          <h2 class="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-[-0.5px] mb-3">
            How Sentra AI runs your contact center
          </h2>
          <p class="text-slate-600 max-w-2xl mx-auto font-['Inter']">
            Explore inbound voice, outbound campaigns, chatbots, live agent handoff, and supervisor analytics — orchestrated by one AI router.
          </p>
        </div>
        <div class="rounded-2xl p-[14px] bg-white/90 border border-[rgba(203,213,225,0.9)] shadow-[0_20px_60px_rgba(42,95,158,0.1)]">
          <img src="@/assets/svg/sentra-platform.svg" alt="Sentra AI platform architecture"
               class="w-full block rounded-[14px]" />
        </div>
      </div>
    </section>

    <!-- Capabilities -->
    <section class="py-20 px-[5%] bg-slate-50/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <span class="inline-block text-xs font-semibold uppercase tracking-[1.5px] text-[#2A5F9E] bg-white/80 px-4 py-2 rounded-full border border-[rgba(42,95,158,0.12)] mb-4">
            Capabilities
          </span>
          <h2 class="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold tracking-[-0.5px]">
            Everything a modern call center needs
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] max-w-[1100px] mx-auto">
          <div v-for="benefit in benefits" :key="benefit.title"
               class="bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-[rgba(74,144,226,0.28)]">
            <h3 class="font-['Space_Grotesk'] text-base font-bold mb-2">{{ benefit.title }}</h3>
            <p class="text-sm text-slate-600 leading-relaxed font-['Inter']">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-[5%] text-center bg-gradient-to-br from-[#1e3a5f] to-[#2a5f9e] text-white">
      <div class="max-w-4xl mx-auto">
        <h2 class="font-['Space_Grotesk'] text-3xl md:text-5xl font-extrabold mb-3">
          Ready to modernize your contact center?
        </h2>
        <p class="text-white/80 mb-6 font-['Inter']">
          Deploy Sentra AI on your stack or start with our managed demo environment.
        </p>
        <div class="flex gap-3.5 justify-center flex-wrap">
          <router-link to="/login" class="inline-flex items-center px-8 py-4 bg-white text-[#2A5F9E] font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl font-['Inter']">
            Open Sentra Portal
          </router-link>
          <router-link to="/contact?project=sentra" class="inline-flex items-center px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 font-['Inter']">
            Contact Sales
          </router-link>
        </div>
      </div>
    </section>

  </div>
  <Footer />
</template>

<script>
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
export default {
  name: 'SentraPage',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      benefits: [
        {
          title: 'AI Router',
          description: 'Route every channel through one intelligent hub — voice, chat, SMS, email, and CRM events.'
        },
        {
          title: 'Live Agent Workbench',
          description: 'Warm transfers with full context, whisper coaching, and supervisor barge-in.'
        },
        {
          title: 'Outbound Campaigns',
          description: 'Preview and predictive dialer flows with compliance-aware pacing.'
        },
        {
          title: 'Supervisor Analytics',
          description: 'Real-time SLA, queue health, and agent performance dashboards.'
        }
      ]
    }
  },
  mounted() {
    // Add custom animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes spin-reverse {
        to { transform: rotate(-360deg); }
      }
      .animate-\\[spin_22s_linear_infinite\\] {
        animation: spin 22s linear infinite;
      }
      .animate-\\[spin_30s_linear_infinite_reverse\\] {
        animation: spin-reverse 30s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }
}
</script>

<style scoped>
/* Scoped styles for any custom overrides */
.btn-shine {
  position: relative;
  overflow: hidden;
}

.btn-shine::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -60%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(25deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(25deg);
  }
  100% {
    transform: translateX(100%) rotate(25deg);
  }
}
</style>