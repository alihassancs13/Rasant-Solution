<template>
  <footer class="relative overflow-hidden shrink-0 mt-auto bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-white">
    <div class="h-1 w-full footer-gradient-bar" aria-hidden="true"></div>

    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="hidden sm:block absolute -top-24 -right-12 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(74,144,226,0.18)_0%,transparent_68%)] footer-orb-a"></div>
      <div class="hidden sm:block absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(201,196,248,0.22)_0%,transparent_70%)] footer-orb-b"></div>
    </div>

    <div class="relative z-10 px-[5%]">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-6 lg:gap-12 py-4 sm:py-8 lg:py-10">
        <!-- Brand -->
        <div class="col-span-2 lg:col-span-1">
          <router-link to="/" aria-label="Rasant Solutions home" class="inline-flex">
            <img
                src="../assets/images/rasant-logo.png"
                alt=""
                width="212"
                height="42"
                decoding="async"
                class="h-7 sm:h-10 w-auto"
            />
          </router-link>
          <p class="hidden sm:block mt-4 text-sm leading-relaxed text-neutral-600 max-w-[280px] font-primary">
            We build intelligent digital products that help businesses grow, innovate, and deliver.
          </p>
          <div class="hidden sm:inline-flex mt-4 items-center gap-2 text-[11px] font-semibold text-headingMain bg-accent-1/10 border border-accent-1/25 px-3 py-1.5 rounded-full font-primary">
            <span class="w-1.5 h-1.5 rounded-full bg-accent-1 animate-pulse"></span>
            Available for new projects
          </div>
        </div>

        <!-- Services -->
        <div>
          <h4 class="footer-heading">Services</h4>
          <ul class="space-y-1.5 sm:space-y-2.5">
            <li><router-link to="/services/custom-software" class="footer-link">Custom Software</router-link></li>
            <li><router-link to="/services/web-applications" class="footer-link">Web Applications</router-link></li>
            <li><router-link to="/services/wordpress-cms" class="footer-link">WordPress &amp; CMS</router-link></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="footer-heading">Company</h4>
          <ul class="space-y-1.5 sm:space-y-2.5">
            <li><router-link to="/#about" class="footer-link">About Us</router-link></li>
            <li><router-link to="/careers" class="footer-link">Careers</router-link></li>
            <li><router-link to="/ai-agent" class="footer-link">Projects</router-link></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="col-span-2 lg:col-span-1">
          <h4 class="footer-heading">Contact</h4>
          <ul class="space-y-1.5 sm:space-y-2.5">
            <li><router-link to="/contact" class="footer-link">Get a Quote</router-link></li>
            <li>
              <a href="mailto:career@rasantsol.com" class="footer-link footer-link-external">career@rasantsol.com</a>
            </li>
            <li>
              <a href="tel:+92512716768" class="footer-link footer-link-external">051 2716768</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 py-3 sm:py-5 border-t border-primary-600/10">
        <p class="text-[11px] sm:text-sm text-neutral-600 font-primary text-center sm:text-left">
          &copy; 2026 Rasant Solutions. All rights reserved.
        </p>

        <div class="flex gap-2 flex-wrap justify-center sm:justify-end" aria-label="Social media">
          <a href="https://www.linkedin.com/company/rasant-solutions/" aria-label="LinkedIn" class="footer-social-btn hover:bg-[#0A66C2] hover:border-[#0A66C2] group">
            <img src="../assets/icons/social-linkedin.svg" alt="" width="16" height="16" decoding="async" class="w-4 h-4 sm:w-[18px] sm:h-[18px] transition duration-250 group-hover:brightness-0 group-hover:invert" />
          </a>
          <a href="#" aria-label="X" class="footer-social-btn hover:bg-primary-900 hover:border-primary-900 group">
            <img src="../assets/icons/social-x.svg" alt="" width="16" height="16" decoding="async" class="w-4 h-4 sm:w-[18px] sm:h-[18px] transition duration-250 group-hover:brightness-0 group-hover:invert" />
          </a>
          <a href="#" aria-label="GitHub" class="footer-social-btn hover:bg-primary-900 hover:border-primary-900 group">
            <img src="../assets/icons/social-github.svg" alt="" width="16" height="16" decoding="async" class="w-4 h-4 sm:w-[18px] sm:h-[18px] transition duration-250 group-hover:brightness-0 group-hover:invert" />
          </a>
          <a href="#" aria-label="Instagram" class="footer-social-btn hover:bg-[#E1306C] hover:border-[#E1306C] group">
            <img src="../assets/icons/social-instagram.svg" alt="" width="16" height="16" decoding="async" class="w-4 h-4 sm:w-[18px] sm:h-[18px] transition duration-250 group-hover:brightness-0 group-hover:invert" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-gradient-bar {
  background: linear-gradient(90deg, #C96E3A, #B0457A, #6B52B8, #4A90E2, #14B8A6, #C96E3A);
  background-size: 200% 100%;
  animation: footerBarShift 8s linear infinite;
}

.footer-orb-a {
  animation: footerOrbDrift 14s ease-in-out infinite;
}
.footer-orb-b {
  animation: footerOrbDrift 18s ease-in-out infinite reverse;
}

.footer-heading {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--color-primary-900, #1E3A5F);
  margin-bottom: 0.5rem;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
}

@media (min-width: 640px) {
  .footer-heading {
    font-size: 12px;
    letter-spacing: 1.5px;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }
}

.footer-heading::before {
  content: '';
  width: 3px;
  height: 12px;
  border-radius: 9999px;
  background: linear-gradient(to bottom, #C96E3A, #4A90E2, #14B8A6);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .footer-heading::before {
    width: 4px;
    height: 16px;
  }
}

.footer-link {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  line-height: 1.35;
  color: #404040;
  text-decoration: none;
  transition: color 0.2s;
  font-family: var(--font-primary, 'Inter', sans-serif);
}

@media (min-width: 640px) {
  .footer-link {
    font-size: 0.875rem;
    line-height: inherit;
  }
}

.footer-link:hover {
  color: var(--color-primary-600, #4A6ABA);
}

@media (min-width: 640px) {
  .footer-link::after {
    content: ' →';
    font-size: 10px;
    color: #4A90E2;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .footer-link:hover::after {
    opacity: 1;
  }
}

.footer-link-external {
  word-break: break-all;
}

@media (min-width: 640px) {
  .footer-link-external {
    word-break: normal;
  }
}

.footer-social-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  background: white;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s, box-shadow 0.25s, background-color 0.25s, border-color 0.25s;
}

@media (min-width: 640px) {
  .footer-social-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
  }
}

.footer-social-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(42, 95, 158, 0.18);
}

@keyframes footerBarShift {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes footerOrbDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(12px, -10px) scale(1.05); }
}
</style>
