<template>
  <div class="emp-stat" :class="`stat-${variant}`">
    <span class="emp-stat-icon" aria-hidden="true">
      <i :class="['fa-solid', icon]" aria-hidden="true"></i>
    </span>
    <div class="emp-stat-label">{{ label }}</div>
    <div class="emp-stat-value">{{ value }}</div>
    <div class="emp-stat-sub">{{ subtitle }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, required: true },
  icon: { type: String, required: true }, // e.g. 'fa-users'
  variant: { type: String, default: 'peach' } // peach | lavender | sky | teal
})
</script>

<style scoped>
.emp-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: dashViewIn 0.5s ease both;
  position: relative;
  overflow: hidden !important; /* required: clips the bar to the card's own rounded corners, no separate gap/pill */
}

.emp-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.08);
}

/* Top accent bar. Colors sampled directly from the reference screenshot:
   the bar is one continuous pastel gradient running peach -> pink ->
   lavender -> blue -> teal across all four cards, each card showing its
   own slice of it. */
.emp-stat::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  margin: 0;
  border-radius: 0; /* no independent rounding — the parent's overflow:hidden does the clipping */
}

.stat-peach::before    { background: linear-gradient(90deg, #FFD5B4, #E8C1D9); }
.stat-lavender::before { background: linear-gradient(90deg, #E8C1D9, #C9C4F8); }
.stat-sky::before       { background: linear-gradient(90deg, #C9C4F8, #8FB9F4); }
.stat-teal::before     { background: linear-gradient(90deg, #8FB9F4, #14B8A6); }

/* Icon box sits top-right; icon glyph is the same dark navy on every
   card, only the box tint changes. */
.emp-stat-icon {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #354E6F;
}

.stat-peach .emp-stat-icon    { background: #FFF1E8; }
.stat-lavender .emp-stat-icon { background: #EEECFD; }
.stat-sky .emp-stat-icon       { background: #DCE9FB; }
.stat-teal .emp-stat-icon     { background: #D5F2EF; }

.emp-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary, #64748b);
  padding-right: 44px;
}

.emp-stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-top: 8px;
  line-height: 1;
}

.emp-stat-sub {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  margin-top: 6px;
}

@keyframes dashViewIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>