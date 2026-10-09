<!--
 * Markmap 交互式矢量思维导图组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useData } from 'vitepress'

const props = withDefaults(
  defineProps<{
    id?: string
    code?: string
    content?: string
    height?: string
  }>(),
  {
    height: '380px',
  }
)

const { isDark } = useData()
const svgRef = ref<SVGSVGElement | null>(null)
let markmapInstance: any = null
const isLoading = ref(true)

const markdownText = computed(() => {
  const raw = props.code || props.content || ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
})

/**
 * 初始化并渲染思维导图
 */
const renderMarkmap = async () => {
  if (typeof window === 'undefined' || !svgRef.value) return
  isLoading.value = true

  try {
    const { Transformer } = await import('markmap-lib')
    const { Markmap } = await import('markmap-view')

    const transformer = new Transformer()
    const { root } = transformer.transform(markdownText.value)

    if (markmapInstance) {
      markmapInstance.setData(root)
      markmapInstance.fit()
    } else {
      markmapInstance = Markmap.create(svgRef.value, {
        autoFit: true,
        duration: 300,
        colorFreezeLevel: 2,
      }, root)
    }
  } catch {
    // 防御解析失败
  } finally {
    isLoading.value = false
  }
}

/**
 * 适应画布大小居中展示
 */
const fitView = () => {
  if (markmapInstance) {
    markmapInstance.fit()
  }
}

/**
 * 放大画布
 */
const zoomIn = () => {
  if (markmapInstance) {
    markmapInstance.rescale(1.25)
  }
}

/**
 * 缩小画布
 */
const zoomOut = () => {
  if (markmapInstance) {
    markmapInstance.rescale(0.8)
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  renderMarkmap()

  if (typeof ResizeObserver !== 'undefined' && svgRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (markmapInstance) {
        markmapInstance.fit()
      }
    })
    resizeObserver.observe(svgRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (markmapInstance) {
    markmapInstance.destroy()
    markmapInstance = null
  }
})

watch(() => markdownText.value, () => {
  renderMarkmap()
})

watch(() => isDark.value, () => {
  if (markmapInstance) {
    renderMarkmap()
  }
})
</script>

<template>
  <div class="markmap-wrapper" :style="{ height }">
    <div class="markmap-toolbar">
      <button type="button" class="toolbar-btn" title="放大" @click="zoomIn">
        <span class="i-lucide-zoom-in" />
      </button>
      <button type="button" class="toolbar-btn" title="缩小" @click="zoomOut">
        <span class="i-lucide-zoom-out" />
      </button>
      <button type="button" class="toolbar-btn" title="适应画布" @click="fitView">
        <span class="i-lucide-maximize-2" />
      </button>
    </div>

    <div v-if="isLoading" class="markmap-loading">
      <span class="loading-spinner"></span>
      <span>正在构建交互思维导图...</span>
    </div>

    <svg ref="svgRef" class="markmap-svg"></svg>
  </div>
</template>

<style scoped>
.markmap-wrapper {
  position: relative;
  margin: 20px 0;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.markmap-wrapper:hover {
  border-color: var(--vp-c-brand-soft, var(--vp-c-divider));
}

.markmap-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.markmap-svg:active {
  cursor: grabbing;
}

.markmap-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 4px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}

.markmap-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  background-color: var(--vp-c-bg-soft);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
