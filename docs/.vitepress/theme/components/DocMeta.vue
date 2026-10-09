<!--
 * 文章元数据展示组件（字数统计、预计阅读耗时与专注阅读快捷入口）
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vitepress'
import { useZenMode } from '../composables/useZenMode'

const route = useRoute()
const { isEffectiveZenMode, isHome, toggleZenMode } = useZenMode()

const metaContainer = ref<HTMLElement | null>(null)
const wordCount = ref(0)
const readingTime = ref(1)

const isVisible = computed(() => !isHome.value && wordCount.value > 0)

/**
 * 统计正文字数并估算阅读时长（以 350 字/分钟为基准）
 */
const calculateDocStats = () => {
  if (typeof window === 'undefined') return

  const docEl = document.querySelector('.vp-doc')
  if (!docEl) {
    wordCount.value = 0
    readingTime.value = 1
    return
  }

  const text = docEl.textContent || ''
  // 匹配中文字符数
  const cnMatches = text.match(/[\u4e00-\u9fa5]/g) || []
  // 匹配西文字词数
  const enMatches = text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || []

  const total = cnMatches.length + enMatches.length
  wordCount.value = total
  readingTime.value = Math.max(1, Math.ceil(total / 350))

  // 将元数据行自动移动至正文首个 h1 标题下方，确保自然视觉层级
  if (metaContainer.value) {
    const h1 = docEl.querySelector('h1')
    if (h1 && metaContainer.value.previousElementSibling !== h1) {
      h1.insertAdjacentElement('afterend', metaContainer.value)
    }
  }
}

/**
 * 触发浏览器原生打印并输出白皮书级 PDF
 */
const triggerPrint = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

let observer: MutationObserver | null = null

onMounted(() => {
  nextTick(() => {
    calculateDocStats()

    // 监听文档内容动态变化
    const docEl = document.querySelector('.vp-doc')
    if (docEl && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        calculateDocStats()
      })
      observer.observe(docEl, { childList: true, subtree: false })
    }
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(
  () => route.path,
  () => {
    nextTick(calculateDocStats)
  }
)
</script>

<template>
  <div
    v-show="isVisible"
    ref="metaContainer"
    class="doc-meta-bar"
  >
    <div class="meta-item">
      <span class="meta-icon i-lucide-file-text" />
      <span>约 {{ wordCount.toLocaleString() }} 字</span>
    </div>
    <div class="meta-divider">·</div>
    <div class="meta-item">
      <span class="meta-icon i-lucide-clock" />
      <span>预计 {{ readingTime }} 分钟阅读</span>
    </div>
    <div class="meta-divider">·</div>
    <div class="meta-actions">
      <button
        type="button"
        class="zen-quick-btn"
        :class="{ active: isEffectiveZenMode }"
        title="一键切换沉浸专注阅读 (快捷键: Alt+Z 或 Alt+F)"
        @click="toggleZenMode"
      >
        <span class="meta-icon i-lucide-sparkles" />
        <span>{{ isEffectiveZenMode ? '退出专注' : '专注阅读' }}</span>
        <span class="shortcut">Alt+Z</span>
      </button>
      <button
        type="button"
        class="print-quick-btn"
        title="一键打印或导出白皮书级 PDF (快捷键: Ctrl+P)"
        @click="triggerPrint"
      >
        <span class="meta-icon i-lucide-printer" />
        <span>打印</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.doc-meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 24px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  font-size: 1rem;
  color: var(--vp-c-brand-1);
}

.meta-divider {
  color: var(--vp-c-text-3);
  user-select: none;
}

.meta-actions {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: auto;
}

.zen-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.zen-quick-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.print-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.print-quick-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.zen-quick-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.shortcut {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}

.zen-quick-btn.active .shortcut {
  background: rgba(99, 102, 241, 0.2);
  color: var(--vp-c-brand-1);
}

/* 移动端窄屏响应式优化：隐藏物理键提示与打印按钮，避免折行残余分隔符 */
@media (max-width: 640px) {
  .print-quick-btn {
    display: none !important;
  }

  .zen-quick-btn .shortcut {
    display: none !important;
  }

  .doc-meta-bar .meta-divider:last-of-type {
    display: none;
  }
}
</style>
