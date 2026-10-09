<!--
 * 沉浸式阅读模式悬浮切换胶囊按钮
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useZenMode } from '../composables/useZenMode'

const { isEffectiveZenMode, isHome, toggleZenMode } = useZenMode()

// 仅在非首页文档页面展示悬浮切换胶囊
const isVisible = computed(() => !isHome.value)
</script>

<template>
  <Teleport to="body">
    <transition name="zen-fade">
      <button
        v-if="isVisible"
        type="button"
        class="zen-mode-toggle"
        :class="{ active: isEffectiveZenMode }"
        :title="isEffectiveZenMode ? '退出沉浸模式 (快捷键: Alt+Z 或 Esc)' : '开启沉浸式专注阅读 (快捷键: Alt+Z)'"
        @click="toggleZenMode"
      >
        <span class="icon" aria-hidden="true">
          <svg
            v-if="!isEffectiveZenMode"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
          </svg>
        </span>
        <span class="label">{{ isEffectiveZenMode ? '退出专注' : '专注阅读' }}</span>
        <span class="shortcut">Alt+Z</span>
      </button>
    </transition>
  </Teleport>
</template>

<style scoped>
.zen-mode-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 80;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

:root.dark .zen-mode-toggle {
  background: rgba(30, 30, 36, 0.85);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
}

.zen-mode-toggle:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--vp-c-brand-soft);
}

.zen-mode-toggle.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #ffffff;
}

.zen-mode-toggle.active:hover {
  background: var(--vp-c-brand-2);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  margin-left: 2px;
}

.zen-mode-toggle.active .shortcut {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.zen-fade-enter-active,
.zen-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.zen-fade-enter-from,
.zen-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
