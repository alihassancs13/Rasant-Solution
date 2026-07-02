import { reactive, onMounted, onUnmounted } from 'vue'

export function useHomeCarousel(length, options = {}) {
  const { autoMs = 0 } = options

  const carousel = reactive({
    index: 0,
    exitingIndex: null,
  })

  let exitTimer = null
  let autoTimer = null
  let paused = false
  let touchStartX = 0

  function slideClasses(i) {
    if (i === carousel.index) {
      return 'opacity-100 visible translate-x-0 scale-100 pointer-events-auto z-20'
    }
    if (i === carousel.exitingIndex) {
      return 'opacity-0 invisible -translate-x-6 scale-[0.98] z-10'
    }
    return 'opacity-0 invisible translate-x-6 scale-[0.98] pointer-events-none z-0'
  }

  function setActive(newIndex) {
    if (!length || newIndex === carousel.index || newIndex < 0 || newIndex >= length) return
    carousel.exitingIndex = carousel.index
    carousel.index = newIndex
    clearTimeout(exitTimer)
    exitTimer = setTimeout(() => { carousel.exitingIndex = null }, 550)
    restartAuto()
  }

  function next() {
    if (!length) return
    setActive((carousel.index + 1) % length)
  }

  function prev() {
    if (!length) return
    setActive((carousel.index - 1 + length) % length)
  }

  function restartAuto() {
    if (!autoMs || paused) return
    clearInterval(autoTimer)
    autoTimer = setInterval(next, autoMs)
  }

  function pause() {
    paused = true
    clearInterval(autoTimer)
  }

  function resume() {
    paused = false
    restartAuto()
  }

  function pauseIfFinePointer() {
    if (window.matchMedia('(pointer: fine)').matches) pause()
  }

  function onTouchStart(e) {
    touchStartX = e.touches[0].clientX
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 48) {
      if (dx < 0) next()
      else prev()
    }
  }

  function startAuto() {
    if (autoMs) restartAuto()
  }

  function stopAuto() {
    clearInterval(autoTimer)
    clearTimeout(exitTimer)
  }

  onMounted(() => {
    startAuto()
  })

  onUnmounted(() => {
    stopAuto()
  })

  return Object.assign(carousel, {
    slideClasses,
    setActive,
    next,
    prev,
    pause,
    resume,
    pauseIfFinePointer,
    onTouchStart,
    onTouchEnd,
    startAuto,
    stopAuto,
  })
}
