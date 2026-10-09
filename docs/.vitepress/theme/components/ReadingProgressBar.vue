<!--
 * 顶部平滑阅读进度指示条
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const progress = ref(0)

const isVisible = computed(() => frontmatter.value?.layout !== 'home' && progress.value > 0)

let ticking = false

/**
 * 计算当前阅读深度百分比
 */
const updateProgress = () => {
  if (typeof window === 'undefined') return

  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - window.innerHeight

  if (docHeight <= 0) {
    progress.value = 0
    ticking = false
    return
  }

  const current = (scrollTop / docHeight) * 100
  progress.value = Math.min(100, Math.max(0, current))
  ticking = false
}

const onScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateProgress)
    ticking = true
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('scroll', onScroll, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    v-show="isVisible"
    class="reading-progress-bar"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    :style="{ width: `${progress}%` }"
  />
</template>

<style scoped>
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2.5px;
  background: linear-gradient(90deg, var(--vp-c-brand-1) 0%, #ec4899 50%, #8b5cf6 100%);
  z-index: 999;
  pointer-events: none;
  transition: width 0.12s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px var(--vp-c-brand-1);
}
</style>
