<!--
 * 交互运行态沙箱与源码折叠预览组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * 演示标题
     * @default '交互演示'
     */
    title?: string
    /**
     * 演示补充说明
     */
    desc?: string
    /**
     * 底层源码文本（用于一键复制代码）
     */
    code?: string
    /**
     * 默认是否展开源码
     * @default false
     */
    defaultOpen?: boolean
    /**
     * 是否在工具栏显示 StackBlitz 一键试跑入口
     * @default true
     */
    stackblitz?: boolean
    /**
     * 自定义 StackBlitz 项目标题
     */
    playgroundTitle?: string
  }>(),
  {
    title: '交互演示',
    defaultOpen: false,
    stackblitz: true,
  }
)

const isOpen = ref(props.defaultOpen)
const copied = ref(false)
const isOpeningPlayground = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const handleOpenStackBlitz = async () => {
  if (!props.code || isOpeningPlayground.value) return
  isOpeningPlayground.value = true
  try {
    const { openInStackBlitz } = await import('../utils/stackblitz')
    await openInStackBlitz({
      title: props.playgroundTitle || props.title || 'Zenith 演示沙箱',
      description: props.desc || '在 StackBlitz 浏览器虚拟机中即时试跑与调试',
      code: props.code,
    })
  } finally {
    isOpeningPlayground.value = false
  }
}

const copySource = async () => {
  if (typeof window === 'undefined' || !props.code) return

  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 降级兜底
    const textArea = document.createElement('textarea')
    textArea.value = props.code
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
  <div class="vp-demo-preview">
    <!-- 上层：实时交互运行态容器 -->
    <div class="demo-stage">
      <slot />
    </div>

    <!-- 中间：控制与操作工具栏 -->
    <div class="demo-toolbar">
      <div class="demo-meta">
        <span class="demo-title">{{ title }}</span>
        <span v-if="desc" class="demo-desc">{{ desc }}</span>
      </div>

      <div class="demo-actions">
        <!-- 在 StackBlitz 试跑按钮 -->
        <button
          v-if="code && stackblitz"
          type="button"
          class="action-btn stackblitz-btn"
          :class="{ loading: isOpeningPlayground }"
          :disabled="isOpeningPlayground"
          title="在 StackBlitz 浏览器虚拟机中即时试跑与调试"
          @click="handleOpenStackBlitz"
        >
          <span v-if="isOpeningPlayground" class="i-lucide-loader-2 action-icon animate-spin" />
          <span v-else class="i-lucide-zap action-icon stackblitz-icon" />
          <span class="btn-text">{{ isOpeningPlayground ? '启动中...' : '在 StackBlitz 试跑' }}</span>
        </button>

        <button
          v-if="code"
          type="button"
          class="action-btn"
          :class="{ copied }"
          :title="copied ? '代码已复制！' : '复制代码'"
          @click="copySource"
        >
          <span v-if="copied" class="i-lucide-check action-icon" />
          <span v-else class="i-lucide-copy action-icon" />
          <span class="btn-text">{{ copied ? '已复制' : '复制' }}</span>
        </button>

        <button
          type="button"
          class="action-btn"
          :class="{ active: isOpen }"
          :title="isOpen ? '收起源码' : '查看源码'"
          @click="toggleOpen"
        >
          <span class="i-lucide-code action-icon" />
          <span class="btn-text">{{ isOpen ? '收起源码' : '查看源码' }}</span>
        </button>
      </div>
    </div>


    <!-- 下层：折叠源码区域 -->
    <div v-show="isOpen" class="demo-code-wrapper">
      <slot name="code">
        <pre v-if="code" class="fallback-code"><code>{{ code }}</code></pre>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.vp-demo-preview {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.vp-demo-preview:hover {
  border-color: var(--vp-c-brand-soft, var(--vp-c-divider));
}

.demo-stage {
  padding: 24px;
  background-color: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 100px;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: var(--vp-c-bg-alt);
  min-height: 42px;
}

.demo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.demo-desc {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background-color: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.action-btn.active {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}

.action-btn.copied {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.12);
}

.action-btn.stackblitz-btn {
  color: var(--vp-c-brand-1, #6366f1);
}

.action-btn.stackblitz-btn:hover {
  background-color: var(--vp-c-brand-soft, rgba(99, 102, 241, 0.12));
}

.stackblitz-icon {
  color: #1389fd;
}

:root.dark .stackblitz-icon {
  color: #38bdf8;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.9s linear infinite;
}

.action-icon {
  font-size: 14px;
}


.demo-code-wrapper {
  background-color: var(--vp-code-block-bg);
  border-top: 1px solid var(--vp-c-divider);
}

.demo-code-wrapper :deep(div[class*='language-']) {
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
}

.fallback-code {
  margin: 0;
  padding: 16px 20px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  white-space: pre-wrap;
  background: transparent;
}
</style>
