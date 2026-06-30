import softwareHero from '@/assets/svg/service-software-hero.svg'
import webAppsHero from '@/assets/svg/service-webmobile-hero.svg'
import wordpressHero from '@/assets/svg/service-cloud-hero.svg'

export const servicePages = {
  'custom-software': {
    slug: 'custom-software',
    title: 'Custom Software Development',
    badge: 'Custom Software',
    headline: 'Enterprise apps engineered for',
    headlineAccent: 'your exact workflows',
    description:
      'Tailor-made backends and business applications in Java, Grails, and Python — APIs, integrations, and dashboards built for how you work.',
    heroSvg: softwareHero,
    features: [
      { icon: 'fas fa-layer-group', title: 'Backend architecture', text: 'Java, Grails, and Python services with clean APIs and data layers that grow with you.' },
      { icon: 'fas fa-shield-halved', title: 'Security first', text: 'Auth, roles, audit trails, and deployment hardening from day one.' },
      { icon: 'fas fa-code-branch', title: 'Integrations', text: 'Connect legacy systems, third-party tools, and modern web frontends.' },
    ],
    highlights: ['Java / Grails', 'Python', 'APIs', 'Enterprise Apps'],
    mesh: 'from-secondary-50 via-primary-50 to-neutral-100',
    gradient: 'text-gradient-primary',
    glow: 'bg-[radial-gradient(circle,rgba(74,144,226,0.2)_0%,transparent_70%)]',
  },
  'web-applications': {
    slug: 'web-applications',
    title: 'Web Applications',
    badge: 'Web Development',
    headline: 'Modern web apps with',
    headlineAccent: 'Vue, React & Tailwind',
    description:
      'Responsive web applications and admin portals using Vue.js, React, Tailwind CSS, and semantic HTML — fast, polished, and easy to maintain.',
    heroSvg: webAppsHero,
    features: [
      { icon: 'fas fa-bolt', title: 'Performance tuned', text: 'Optimized bundles, lazy loading, and responsive layouts on every screen size.' },
      { icon: 'fas fa-palette', title: 'Design-led UI', text: 'Marketing pages, dashboards, and portals that match your brand system.' },
      { icon: 'fas fa-desktop', title: 'Component-driven', text: 'Reusable Vue and React components with Tailwind for consistent UI at scale.' },
    ],
    highlights: ['Vue.js / React', 'Tailwind', 'HTML / CSS', 'Admin Portals'],
    mesh: 'from-primary-50 via-secondary-50 to-neutral-100',
    gradient: 'text-gradient-primary',
    glow: 'bg-[radial-gradient(circle,rgba(201,196,248,0.25)_0%,transparent_70%)]',
  },
  'wordpress-cms': {
    slug: 'wordpress-cms',
    title: 'WordPress & CMS',
    badge: 'WordPress',
    headline: 'Content sites that are',
    headlineAccent: 'easy to manage',
    description:
      'WordPress websites, custom themes, and CMS integrations — built with HTML and Tailwind so your team can publish and update content without friction.',
    heroSvg: wordpressHero,
    features: [
      { icon: 'fab fa-wordpress', title: 'WordPress builds', text: 'Marketing sites, blogs, and landing pages tailored to your brand and goals.' },
      { icon: 'fas fa-palette', title: 'Custom themes', text: 'Tailwind-ready themes and layouts that look sharp on every device.' },
      { icon: 'fas fa-plug', title: 'Plugins & integrations', text: 'Forms, CRM hooks, and third-party tools wired into your site.' },
    ],
    highlights: ['WordPress', 'Custom Themes', 'HTML / Tailwind', 'Integrations'],
    mesh: 'from-accent-1/5 via-primary-50 to-neutral-100',
    gradient: 'text-gradient-primary',
    glow: 'bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,transparent_70%)]',
  },
}

export const serviceSlugs = Object.keys(servicePages)
