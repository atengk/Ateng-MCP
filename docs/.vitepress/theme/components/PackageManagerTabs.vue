<!--
 * 全站跨页面联动包管理器选项卡组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  usePackageManager,
  resolveCommand,
  type CommandResolutionProps,
} from '../composables/usePackageManager'

const props = withDefaults(defineProps<CommandResolutionProps>(), {
  command: 'install',
  dev: false,
  global: false,
})

const { activeManager, setActiveManager, packageManagers } = usePackageManager()

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 当前选中的命令文本
 */
const currentCommand = computed(() => {
  return resolveCommand(activeManager.value, props)
})

/**
 * 复制当前命令到剪贴板
 */
const copyCommand = async () => {
  if (typeof window === 'undefined' || !navigator.clipboard) return

  try {
    await navigator.clipboard.writeText(currentCommand.value)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 降级兜底方案
    const textArea = document.createElement('textarea')
    textArea.value = currentCommand.value
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      copied.value = true
      if (copyTimer) clearTimeout(copyTimer)
      copyTimer = setTimeout(() => {
        copied.value = false
      }, 2000)
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
</script>

<template>
  <div class="package-manager-tabs">
    <div class="tabs-header">
      <div class="tabs-nav" role="tablist">
        <button
          v-for="pm in packageManagers"
          :key="pm.key"
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ active: activeManager === pm.key }"
          :aria-selected="activeManager === pm.key"
          @click="setActiveManager(pm.key)"
        >
          <!-- pnpm 专属图标 -->
          <svg v-if="pm.key === 'pnpm'" class="pm-icon" viewBox="0 0 256 256" fill="none">
            <rect width="70" height="70" x="10" y="10" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="93" y="10" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="176" y="10" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="93" y="93" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="176" y="93" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="10" y="176" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="93" y="176" fill="#F69220" rx="6" />
            <rect width="70" height="70" x="176" y="176" fill="#4EBE59" rx="6" />
          </svg>

          <!-- npm 专属图标 -->
          <svg v-else-if="pm.key === 'npm'" class="pm-icon" viewBox="0 0 256 256" fill="none">
            <path fill="#CB3837" d="M0 0h256v256H0z" />
            <path fill="#FFF" d="M48 48h160v160h-32V80h-48v128H48z" />
          </svg>

          <!-- yarn 专属图标 -->
          <svg v-else-if="pm.key === 'yarn'" class="pm-icon" viewBox="0 0 256 256" fill="none">
            <path fill="#2C8EBB" d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm68.3 194.2c-5.8 4.2-12.7 6.4-19.8 6.4-11.2 0-21.9-5.6-28.2-15.1l-24.8-37.1-24.9 37.1c-6.3 9.5-17 15.1-28.2 15.1-7.1 0-14-2.2-19.8-6.4-14.7-10.6-18.2-30.8-7.7-45.5L88 126.9V72c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v54.9l44.3 21.8c14.7 10.6 18.2 30.8 7.7 45.5z"/>
          </svg>

          <!-- bun 专属图标 -->
          <svg v-else-if="pm.key === 'bun'" class="pm-icon" viewBox="0 0 256 256" fill="none">
            <path fill="#FBF0DF" stroke="#2D2B28" stroke-width="12" d="M128 40c-44 0-80 36-80 80 0 35 23 65 55 75v21h50v-21c32-10 55-40 55-75 0-44-36-80-80-80z"/>
            <circle cx="106" cy="115" r="9" fill="#2D2B28"/>
            <circle cx="150" cy="115" r="9" fill="#2D2B28"/>
            <path stroke="#2D2B28" stroke-width="8" stroke-linecap="round" d="M118 135c5 6 15 6 20 0"/>
          </svg>

          <span class="tab-label">{{ pm.label }}</span>
        </button>
      </div>

      <div class="tabs-actions">
        <button
          type="button"
          class="copy-btn"
          :class="{ copied }"
          :aria-label="copied ? '已复制命令' : '复制命令'"
          :title="copied ? '已复制！' : '复制到剪贴板'"
          @click="copyCommand"
        >
          <span v-if="copied" class="copy-success-wrapper">
            <span class="i-lucide-check check-icon" />
            <span class="copy-tip">已复制</span>
          </span>
          <span v-else class="copy-default-wrapper">
            <span class="i-lucide-copy copy-icon" />
          </span>
        </button>
      </div>
    </div>

    <div class="tabs-content">
      <slot :name="activeManager" :command="currentCommand">
        <pre class="command-block"><code><span class="prompt">$</span><span class="cmd-text">{{ currentCommand }}</span></code></pre>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.package-manager-tabs {
  margin: 16px 0;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-code-block-bg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.package-manager-tabs:hover {
  border-color: var(--vp-c-brand-soft, var(--vp-c-divider));
}

.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background-color: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  min-height: 42px;
}

.tabs-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.tab-btn.active {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pm-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.tabs-actions {
  display: flex;
  align-items: center;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  height: 28px;
}

.copy-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.copy-btn.copied {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}

.copy-success-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.copy-default-wrapper {
  display: inline-flex;
  align-items: center;
}

.copy-icon,
.check-icon {
  font-size: 14px;
}

.copy-tip {
  font-size: 12px;
}

.tabs-content {
  position: relative;
}

.command-block {
  margin: 0;
  padding: 16px 20px;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  background: transparent;
}

.command-block code {
  color: var(--vp-c-text-1);
  font-family: inherit;
}

.prompt {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  user-select: none;
  margin-right: 8px;
}

.cmd-text {
  font-weight: 500;
}
</style>
