<!--
 * 沉浸式专注阅读模式顶部智能感应滑出控制胶囊
 * 鼠标悬停屏幕顶部边缘或快捷键切换时平滑浮现，移开后自动隐形
 * @author Ateng
 * @since 2026-09-27
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useData } from 'vitepress'
import { useZenMode } from '../composables/useZenMode'

const { page, isDark } = useData()
const { isEffectiveZenMode, toggleZenMode } = useZenMode()

const isVisible = ref(false)
const readingProgress = ref(0)
let autoHideTimer: any = null

const pageTitle = computed(() => {
  return page.value.title || '当前文档'
})

/**
 * 监听滚动计算当前长文阅读百分比
 */
const updateProgress = () => {
  if (typeof window === 'undefined') return
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  if (docHeight <= 0) {
    readingProgress.value = 100
  } else {
    readingProgress.value = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)))
  }
}

/**
 * 鼠标靠近屏幕顶部边缘 (Top <= 50px) 时唤出控制胶囊
 */
const onMouseMove = (e: MouseEvent) => {
  if (!isEffectiveZenMode.value) return
  if (e.clientY <= 50) {
    isVisible.value = true
    clearTimeout(autoHideTimer)
  } else if (e.clientY > 80 && !autoHideTimer) {
    isVisible.value = false
  }
}

/**
 * 切换深浅外观主题
 */
const toggleTheme = () => {
  isDark.value = !isDark.value
}

// 刚进入专注阅读时，短暂展示 3 秒友好提示，随后自动隐藏
watch(
  () => isEffectiveZenMode.value,
  (val) => {
    if (val) {
      isVisible.value = true
      clearTimeout(autoHideTimer)
      autoHideTimer = setTimeout(() => {
        isVisible.value = false
        autoHideTimer = null
      }, 3000)
    } else {
      isVisible.value = false
      clearTimeout(autoHideTimer)
      autoHideTimer = null
    }
  }
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('scroll', updateProgress)
  }
  clearTimeout(autoHideTimer)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isEffectiveZenMode"
      class="zen-hover-container"
      :class="{ 'is-active': isVisible }"
    >
      <div class="zen-pill">
        <!-- 标题与图标 -->
        <div class="pill-left">
          <span class="pill-icon i-lucide-book-open" />
          <span class="pill-title" :title="pageTitle">{{ pageTitle }}</span>
        </div>

        <div class="pill-divider" />

        <!-- 阅读进度百分比 -->
        <div class="pill-progress">
          <span class="progress-text">已读 {{ readingProgress }}%</span>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${readingProgress}%` }" />
          </div>
        </div>

        <div class="pill-divider" />

        <!-- 主题切换、快捷键提示与退出操作 -->
        <div class="pill-right">
          <button
            type="button"
            class="pill-theme-btn"
            :title="isDark ? '切换浅色模式 (快捷键: T)' : '切换深色模式 (快捷键: T)'"
            @click="toggleTheme"
          >
            <span :class="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" />
          </button>
          <span class="shortcut-tip">Alt+Z / Esc</span>
          <button
            type="button"
            class="exit-btn"
            title="退出专注阅读 (快捷键: Alt+Z 或 Esc)"
            @click="toggleZenMode"
          >
            <span class="i-lucide-minimize-2" />
            <span>退出专注</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 悬浮胶囊容器：默认向上推移并隐藏，激活时平滑滑入 */
.zen-hover-container {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translate(-50%, -120%);
  opacity: 0;
  pointer-events: none;
  z-index: 99999;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
  user-select: none;
}

.zen-hover-container.is-active {
  transform: translate(-50%, 0);
  opacity: 1;
  pointer-events: auto;
}

/* GitHub Primer 风格毛玻璃悬浮胶囊 */
.zen-pill {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 16px;
  background-color: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(16px);
  white-space: nowrap;
}

.pill-left {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 320px;
}

.pill-icon {
  font-size: 15px;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.pill-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill-divider {
  width: 1px;
  height: 14px;
  background-color: var(--vp-c-divider);
}

.pill-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  min-width: 52px;
}

.progress-track {
  width: 54px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--vp-c-bg-mute);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--vp-c-brand-1);
  border-radius: 2px;
  transition: width 0.15s ease-out;
}

.pill-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pill-theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
}

.pill-theme-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.shortcut-tip {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  background-color: var(--vp-c-bg-mute);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.exit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 4px 10px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.exit-btn:hover {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-soft);
}

/* 移动端与平板窄屏下隐藏顶部鼠标滑出胶囊，防止横向超宽溢出 */
@media (max-width: 768px) {
  .zen-hover-container {
    display: none !important;
  }
}
</style>
