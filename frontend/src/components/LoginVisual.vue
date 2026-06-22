<template>
  <div class="mx-auto w-full max-w-[540px]" aria-hidden="true">
    <svg viewBox="0 0 460 310" xmlns="http://www.w3.org/2000/svg" width="100%" style="overflow: visible">
      <defs>
        <linearGradient id="lgPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6B52B8" />
          <stop offset="100%" stop-color="#8FB9F4" />
        </linearGradient>
        <linearGradient id="lgBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4A90E2" />
          <stop offset="100%" stop-color="#3B73C4" />
        </linearGradient>
        <linearGradient id="lgOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C96E3A" />
          <stop offset="100%" stop-color="#EA580C" />
        </linearGradient>
        <linearGradient id="lgCardFace" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#F5F0FF" />
        </linearGradient>
        <linearGradient id="lgTopStripe" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="transparent" />
          <stop offset="35%" stop-color="#C96E3A" />
          <stop offset="55%" stop-color="#6B52B8" />
          <stop offset="75%" stop-color="#4A90E2" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <linearGradient id="lgBar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#C96E3A" />
          <stop offset="50%" stop-color="#B0457A" />
          <stop offset="100%" stop-color="#4A90E2" />
        </linearGradient>
        <filter id="fGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#4A90E2" flood-opacity="0.13" />
        </filter>
      </defs>

      <circle cx="230" cy="155" r="138" fill="none" stroke="rgba(107,82,184,0.10)" stroke-width="1.5" />
      <circle cx="230" cy="155" r="170" fill="none" stroke="rgba(74,144,226,0.08)" stroke-width="1" />

      <path id="outerPath" d="M230,155 m-170,0 a170,170 0 1,1 0.001,0" fill="none" />
      <path id="innerPath" d="M230,155 m-138,0 a138,138 0 1,1 0.001,0" fill="none" />

      <circle r="6" fill="#6B52B8" filter="url(#fGlow)">
        <animateMotion dur="12s" repeatCount="indefinite"><mpath href="#outerPath" /></animateMotion>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle r="4.5" fill="#4A90E2" filter="url(#fGlow)">
        <animateMotion dur="8s" repeatCount="indefinite" begin="-4s"><mpath href="#innerPath" /></animateMotion>
      </circle>
      <circle r="3.5" fill="#14B8A6" filter="url(#fGlow)" opacity="0.85">
        <animateMotion dur="14s" repeatCount="indefinite" begin="-7s"><mpath href="#outerPath" /></animateMotion>
      </circle>

      <g transform="translate(150,80)" filter="url(#fShadow)">
        <rect width="160" height="150" rx="18" fill="url(#lgCardFace)" stroke="rgba(226,232,240,1)" stroke-width="1.5" />
        <rect x="0" y="0" width="160" height="2.5" rx="2" fill="url(#lgTopStripe)" />
        <circle cx="26" cy="30" r="14" fill="url(#lgPurple)" />
        <circle cx="26" cy="26" r="5" fill="rgba(255,255,255,0.9)" />
        <path d="M16,40 Q26,32 36,40" fill="rgba(255,255,255,0.7)" />
        <text x="48" y="25" font-family="Space Grotesk, sans-serif" font-size="9" font-weight="700" fill="#1E3A5F">Welcome back</text>
        <text x="48" y="36" font-family="Inter, sans-serif" font-size="7.5" fill="#64748B">Sentra Dashboard</text>
        <line x1="14" y1="50" x2="146" y2="50" stroke="#E2E8F0" stroke-width="1" />
        <rect x="14" y="58" width="40" height="28" rx="7" fill="rgba(107,82,184,0.08)" />
        <text x="34" y="70" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-size="9" font-weight="800" fill="#6B52B8">128</text>
        <text x="34" y="80" text-anchor="middle" font-family="Inter,sans-serif" font-size="6" fill="#64748B">Calls</text>
        <rect x="60" y="58" width="40" height="28" rx="7" fill="rgba(74,144,226,0.08)" />
        <text x="80" y="70" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-size="9" font-weight="800" fill="#4A90E2">94%</text>
        <text x="80" y="80" text-anchor="middle" font-family="Inter,sans-serif" font-size="6" fill="#64748B">CSAT</text>
        <rect x="106" y="58" width="40" height="28" rx="7" fill="rgba(20,184,166,0.10)" />
        <text x="126" y="70" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-size="9" font-weight="800" fill="#14B8A6">12</text>
        <text x="126" y="80" text-anchor="middle" font-family="Inter,sans-serif" font-size="6" fill="#64748B">Active</text>
        <text x="14" y="97" font-family="Inter,sans-serif" font-size="6.5" fill="#475569">AI Accuracy</text>
        <text x="146" y="97" text-anchor="end" font-family="Space Grotesk,sans-serif" font-size="6.5" font-weight="700" fill="#6B52B8">97%</text>
        <rect x="14" y="100" width="132" height="6" rx="3" fill="#F1F5F9" />
        <rect x="14" y="100" width="128" height="6" rx="3" fill="url(#lgBar)">
          <animate attributeName="width" from="0" to="128" dur="2s" fill="freeze" />
        </rect>
        <text x="14" y="117" font-family="Inter,sans-serif" font-size="6.5" fill="#475569">Uptime</text>
        <text x="146" y="117" text-anchor="end" font-family="Space Grotesk,sans-serif" font-size="6.5" font-weight="700" fill="#4A90E2">99.9%</text>
        <rect x="14" y="120" width="132" height="6" rx="3" fill="#F1F5F9" />
        <rect x="14" y="120" width="131" height="6" rx="3" fill="url(#lgBlue)">
          <animate attributeName="width" from="0" to="131" dur="2.4s" fill="freeze" />
        </rect>
        <circle cx="20" cy="141" r="4" fill="#22C55E">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <text x="29" y="144" font-family="Inter,sans-serif" font-size="6.5" fill="#475569">All systems operational</text>
      </g>

      <g filter="url(#fShadow)">
        <g transform="translate(18,52)">
          <rect width="96" height="40" rx="12" fill="#fff" stroke="#E2E8F0" stroke-width="1.2" />
          <rect width="96" height="2" rx="2" fill="url(#lgPurple)" opacity="0.7" />
          <circle cx="18" cy="22" r="9" fill="url(#lgPurple)" />
          <text x="18" y="26" text-anchor="middle" fill="#fff" font-size="7.5" font-family="Space Grotesk,sans-serif" font-weight="800">S</text>
          <text x="33" y="18" fill="#1E3A5F" font-size="8" font-family="Space Grotesk,sans-serif" font-weight="700">Sentra AI</text>
          <text x="33" y="29" fill="#64748B" font-size="6.5" font-family="Inter,sans-serif">Call Center</text>
          <circle cx="84" cy="12" r="4" fill="#22C55E">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <animate attributeName="transform" additive="sum" values="translate(0,0);translate(0,-4);translate(0,0)" dur="5s" repeatCount="indefinite" />
        </g>
      </g>

      <g filter="url(#fShadow)">
        <g transform="translate(350,40)">
          <rect width="96" height="40" rx="12" fill="#fff" stroke="#E2E8F0" stroke-width="1.2" />
          <rect width="96" height="2" rx="2" fill="url(#lgBlue)" opacity="0.7" />
          <circle cx="18" cy="22" r="9" fill="url(#lgBlue)" />
          <text x="18" y="26" text-anchor="middle" fill="#fff" font-size="7.5" font-family="Space Grotesk,sans-serif" font-weight="800">V</text>
          <text x="33" y="18" fill="#1E3A5F" font-size="8" font-family="Space Grotesk,sans-serif" font-weight="700">AI Agent</text>
          <text x="33" y="29" fill="#64748B" font-size="6.5" font-family="Inter,sans-serif">Voice AI</text>
          <circle cx="84" cy="12" r="4" fill="#22C55E">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.3s" repeatCount="indefinite" begin="-0.8s" />
          </circle>
          <animate attributeName="transform" additive="sum" values="translate(0,0);translate(0,-4);translate(0,0)" dur="6s" repeatCount="indefinite" begin="-1s" />
        </g>
      </g>

      <g filter="url(#fShadow)">
        <g transform="translate(348,230)">
          <rect width="96" height="40" rx="12" fill="#fff" stroke="#E2E8F0" stroke-width="1.2" />
          <rect width="96" height="2" rx="2" fill="url(#lgPurple)" opacity="0.5" />
          <circle cx="18" cy="22" r="9" fill="#C9C4F8" />
          <text x="18" y="26" text-anchor="middle" fill="#fff" font-size="7.5" font-family="Space Grotesk,sans-serif" font-weight="800">C</text>
          <text x="33" y="18" fill="#1E3A5F" font-size="8" font-family="Space Grotesk,sans-serif" font-weight="700">Chatbot</text>
          <text x="33" y="29" fill="#64748B" font-size="6.5" font-family="Inter,sans-serif">Messaging</text>
          <circle cx="84" cy="12" r="4" fill="#22C55E">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.9s" repeatCount="indefinite" begin="-1.4s" />
          </circle>
          <animate attributeName="transform" additive="sum" values="translate(0,0);translate(0,-4);translate(0,0)" dur="7s" repeatCount="indefinite" begin="-3s" />
        </g>
      </g>

      <g filter="url(#fShadow)">
        <g transform="translate(16,220)">
          <rect width="96" height="40" rx="12" fill="#fff" stroke="#E2E8F0" stroke-width="1.2" />
          <rect width="96" height="2" rx="2" fill="url(#lgOrange)" opacity="0.6" />
          <circle cx="18" cy="22" r="9" fill="url(#lgOrange)" />
          <text x="18" y="26" text-anchor="middle" fill="#fff" font-size="7.5" font-family="Space Grotesk,sans-serif" font-weight="800">O</text>
          <text x="33" y="18" fill="#1E3A5F" font-size="8" font-family="Space Grotesk,sans-serif" font-weight="700">OmniPost</text>
          <text x="33" y="29" fill="#64748B" font-size="6.5" font-family="Inter,sans-serif">Social</text>
          <circle cx="84" cy="12" r="4" fill="#22C55E">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.1s" repeatCount="indefinite" begin="-2s" />
          </circle>
          <animate attributeName="transform" additive="sum" values="translate(0,0);translate(0,-4);translate(0,0)" dur="5.5s" repeatCount="indefinite" begin="-2.5s" />
        </g>
      </g>

      <line x1="114" y1="72" x2="174" y2="118" stroke="#6B52B8" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
      </line>
      <circle r="3.5" fill="#6B52B8" opacity="0.85" filter="url(#fGlow)">
        <animateMotion dur="1.8s" repeatCount="indefinite" path="M114,72 L174,118" />
      </circle>

      <line x1="350" y1="60" x2="310" y2="118" stroke="#4A90E2" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
      </line>
      <circle r="3.5" fill="#4A90E2" opacity="0.85" filter="url(#fGlow)">
        <animateMotion dur="1.8s" repeatCount="indefinite" begin="-0.45s" path="M350,60 L310,118" />
      </circle>

      <line x1="348" y1="250" x2="310" y2="210" stroke="#C9C4F8" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
      </line>
      <circle r="3.5" fill="#C9C4F8" opacity="0.85" filter="url(#fGlow)">
        <animateMotion dur="1.8s" repeatCount="indefinite" begin="-0.9s" path="M348,250 L310,210" />
      </circle>

      <line x1="112" y1="240" x2="174" y2="210" stroke="#C96E3A" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.35">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
      </line>
      <circle r="3.5" fill="#C96E3A" opacity="0.85" filter="url(#fGlow)">
        <animateMotion dur="1.8s" repeatCount="indefinite" begin="-1.35s" path="M112,240 L174,210" />
      </circle>
    </svg>
  </div>
</template>
