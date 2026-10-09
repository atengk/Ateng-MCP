<!--
 * Mermaid GitHub 官方规范矢量架构与时序图渲染组件
 * 完全复刻 GitHub Primer 规范：原生 neutral/dark 主题、classic 纯净矢量、纯 SVG 文本与全屏自适应交互
 * @author Ateng
 * @since 2026-09-27
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  id?: string
  code: string
}>()

const { isDark } = useData()
const containerRef = ref<HTMLElement | null>(null)
const svgContent = ref('')
const errorMsg = ref('')
const isLoading = ref(true)

// 交互状态
const copied = ref(false)
const isFullscreen = ref(false)
const zoomScale = ref(1.0)
const fitScale = ref(1.0)
const panOffset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const svgDimensions = ref({ width: 600, height: 400 })

/**
 * 从 SVG 源码中提取原生 viewBox 真实物理尺寸
 */
const parseSvgDimensions = (svgStr: string) => {
  const match = svgStr.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/)
  if (match) {
    const w = parseFloat(match[3])
    const h = parseFloat(match[4])
    if (w > 0 && h > 0) {
      return { width: w, height: h }
    }
  }
  return { width: 600, height: 400 }
}

const decodedCode = computed(() => {
  try {
    return decodeURIComponent(props.code)
  } catch {
    return props.code
  }
})

/**
 * 100% 对齐 GitHub 官方 Mermaid 渲染管线
 * - look: 'classic'（去除 Mermaid 11/12 默认引入的阴影、渐变与圆角花哨样式，保持 GitHub 经典 1px 极简线条）
 * - theme: 'neutral'（浅色）/ 'dark'（深色）
 * - htmlLabels: false（纯 SVG <text> 渲染，中文字符水平与垂直在几何卡片内绝对居中）
 */
const renderDiagram = async () => {
  if (typeof window === 'undefined') return
  isLoading.value = true
  errorMsg.value = ''

  try {
    if (document?.fonts?.ready) {
      await document.fonts.ready
    }

    const mermaid = (await import('mermaid')).default
    const uniqueId = (props.id || 'mermaid').replace(/[^a-zA-Z0-9_-]/g, '') + '-' + Math.random().toString(36).slice(2, 8)

    // GitHub Primer 官方系统字体栈
    const githubFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark.value ? 'dark' : 'neutral',
      look: 'classic',
      securityLevel: 'loose',
      fontFamily: githubFontFamily,
      fontSize: 14,
      flowchart: {
        htmlLabels: false,
        useMaxWidth: true,
        padding: 16,
        nodeSpacing: 45,
        rankSpacing: 45,
        curve: 'linear',
        wrappingWidth: 500,
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        actorFontSize: 14,
        noteFontSize: 13,
        messageFontSize: 14,
      },
      gantt: {
        useMaxWidth: true,
        barHeight: 24,
        barGap: 6,
        topPadding: 50,
        sidePadding: 75,
      },
      state: {
        useMaxWidth: true,
      },
    })

    const { svg } = await mermaid.render(uniqueId, decodedCode.value)
    svgContent.value = svg
    svgDimensions.value = parseSvgDimensions(svg)
  } catch (err: any) {
    errorMsg.value = err?.message || 'Mermaid 图表解析失败'
  } finally {
    isLoading.value = false
  }
}

/**
 * 复制源码到剪贴板 (带 2 秒成功反馈)
 */
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(decodedCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 降级兜底
  }
}

/**
 * 智能计算视口自适应最佳缩放倍率 (兼顾完整展示与像素级锐利度)
 */
const computeFitScale = () => {
  if (typeof window === 'undefined') return 1.0
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  const svgW = svgDimensions.value.width || 600
  const svgH = svgDimensions.value.height || 400

  // 保证图表完全落在顶部胶囊(约 70px)与底部提示条(约 60px)之间的安全可见区域
  const safeW = viewportW * 0.85
  const safeH = Math.max(viewportH - 160, 200)

  // 计算能够完整装下图表的最大缩放比例
  const fitRatio = Math.min(safeW / svgW, safeH / svgH)

  // 若图表本身较小（fitRatio >= 1.0），默认以 1.0 (100% 原始尺寸) 居中展示，保持最佳清晰度；
  // 若图表超出屏幕（fitRatio < 1.0），则自适应缩小至刚好完全可见（保留四周安全间距）
  const finalScale = fitRatio < 1.0 ? Math.max(fitRatio * 0.95, 0.20) : 1.0
  return Number(finalScale.toFixed(2))
}

/**
 * 打开全屏沉浸平铺灯箱
 */
const openFullscreen = () => {
  if (svgContent.value) {
    svgDimensions.value = parseSvgDimensions(svgContent.value)
  }
  const initialFit = computeFitScale()
  fitScale.value = initialFit
  zoomScale.value = initialFit
  panOffset.value = { x: 0, y: 0 }
  isFullscreen.value = true
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
  }
}

/**
 * 关闭全屏灯箱
 */
const closeFullscreen = () => {
  isFullscreen.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeyDown)
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeFullscreen()
  }
}

const zoomIn = () => {
  zoomScale.value = Math.min(Number((zoomScale.value + 0.25).toFixed(2)), 8.0)
}

const zoomOut = () => {
  zoomScale.value = Math.max(Number((zoomScale.value - 0.25).toFixed(2)), 0.2)
}

const fitToScreen = () => {
  const newFit = computeFitScale()
  fitScale.value = newFit
  zoomScale.value = newFit
  panOffset.value = { x: 0, y: 0 }
}

const resetZoom = () => {
  zoomScale.value = 1.0
  panOffset.value = { x: 0, y: 0 }
}

/**
 * 双击画布在自适应铺满与 100% 原始尺寸之间快速切换
 */
const onDoubleClick = () => {
  if (Math.abs(zoomScale.value - fitScale.value) < 0.15) {
    zoomScale.value = 1.0
  } else {
    zoomScale.value = fitScale.value
  }
  panOffset.value = { x: 0, y: 0 }
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY < 0 ? 0.15 : -0.15
  zoomScale.value = Math.min(Math.max(Number((zoomScale.value + delta).toFixed(2)), 0.2), 8.0)
}

const onPointerDown = (e: PointerEvent) => {
  if (e.button !== 0) return
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - panOffset.value.x,
    y: e.clientY - panOffset.value.y,
  }
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  panOffset.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  }
}

const onPointerUp = () => {
  isDragging.value = false
}

onMounted(() => {
  renderDiagram()
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeyDown)
  }
})

watch(() => isDark.value, () => {
  renderDiagram()
})

watch(() => decodedCode.value, () => {
  renderDiagram()
})
</script>

<template>
  <div class="mermaid-wrapper" ref="containerRef">
    <!-- GitHub 风格微型悬浮操作栏 (复制源码 & 全屏放大) -->
    <div class="mermaid-actions">
      <button
        type="button"
        class="action-btn"
        :title="copied ? '已复制 Mermaid 源码' : '复制源码'"
        @click="copyCode"
      >
        <span v-if="copied" class="i-lucide-check text-green-500" />
        <span v-else class="i-lucide-copy" />
      </button>
      <button
        type="button"
        class="action-btn"
        title="全屏沉浸与智能自适应放大"
        @click="openFullscreen"
      >
        <span class="i-lucide-maximize-2" />
      </button>
    </div>

    <!-- 加载反馈 -->
    <div v-if="isLoading && !svgContent" class="mermaid-loading">
      <span class="loading-spinner"></span>
      <span>正在渲染架构图表...</span>
    </div>

    <!-- 错误反馈 -->
    <div v-else-if="errorMsg" class="mermaid-error">
      <div class="error-title">Mermaid 语法解析异常</div>
      <pre>{{ errorMsg }}</pre>
    </div>

    <!-- 正文 SVG 纯净矢量容器 -->
    <div v-else class="mermaid-svg-container" v-html="svgContent"></div>

    <!-- GitHub Primer 极简自适应沉浸灯箱 -->
    <Teleport to="body">
      <div v-if="isFullscreen" class="mermaid-modal-overlay" @click.self="closeFullscreen">
        <!-- 沉浸式顶部悬浮控制栏 -->
        <div class="modal-floating-header">
          <div class="modal-title">
            <span class="badge">Mermaid 矢量全屏沉浸预览</span>
            <span class="scale-text">{{ Math.round(zoomScale * 100) }}%</span>
          </div>
          <div class="modal-tools">
            <button type="button" class="modal-btn" title="放大 (滚轮向上)" @click="zoomIn">
              <span class="i-lucide-zoom-in" />
            </button>
            <button type="button" class="modal-btn" title="缩小 (滚轮向下)" @click="zoomOut">
              <span class="i-lucide-zoom-out" />
            </button>
            <button type="button" class="modal-btn" title="自适应视口铺满 (双击画布)" @click="fitToScreen">
              <span class="i-lucide-scan" />
            </button>
            <button type="button" class="modal-btn" title="还原 100% 原始尺寸" @click="resetZoom">
              <span class="i-lucide-rotate-ccw" />
            </button>
            <button type="button" class="modal-btn close-btn" title="退出全屏 (Esc)" @click="closeFullscreen">
              <span class="i-lucide-x" />
            </button>
          </div>
        </div>

        <!-- 沉浸式交互画布 (支持自由平移、滚轮缩放与双击自适应) -->
        <div
          class="modal-body"
          @wheel="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointerleave="onPointerUp"
          @dblclick="onDoubleClick"
        >
          <div
            class="modal-canvas"
            :style="{
              width: `${svgDimensions.width}px`,
              height: `${svgDimensions.height}px`,
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }"
            v-html="svgContent"
          ></div>
        </div>

        <!-- 底部快捷手势引导提示条 -->
        <div class="modal-floating-footer">
          <span>💡 滚轮缩放 (0.2x ~ 8.0x) · 鼠标按住拖拽平移 · 双击自适应铺满 · ESC 键退出</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* GitHub 原生极简内联容器：无厚重外边框与花哨背景，自然融入 Markdown 文档流 */
.mermaid-wrapper {
  position: relative;
  margin: 24px 0;
  padding: 12px 0;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  overflow-x: auto;
}

/* 鼠标悬停时平滑浮现微型操作组 */
.mermaid-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 5;
}

.mermaid-wrapper:hover .mermaid-actions {
  opacity: 1;
  pointer-events: auto;
}

/* 触控屏设备（无鼠标 hover）常驻呈现全屏与复制按钮，方便手机端直接点触放大 */
@media (hover: none), (pointer: coarse) {
  .mermaid-actions {
    opacity: 0.85;
    pointer-events: auto;
  }
}

/* GitHub Primer 风格微型按钮 */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  background-color: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-3);
}

.mermaid-svg-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 居中并限制最大宽度不超过容器，高度自适应 */
:deep(.mermaid-svg-container svg) {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}

/* 注入全局 Primer 字体栈与抗锯齿优化 */
:deep(.mermaid-svg-container text),
:deep(.mermaid-svg-container .label),
:deep(.modal-canvas text),
:deep(.modal-canvas .label) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

:deep(.mermaid-svg-container .edgeLabel rect),
:deep(.modal-canvas .edgeLabel rect) {
  fill: var(--vp-c-bg) !important;
  stroke: var(--vp-c-divider) !important;
  stroke-width: 1px !important;
  rx: 3px;
  ry: 3px;
}

/* 彻底解决多行 <br/> 节点在 <foreignObject> 下受 VitePress 样式污染导致的文字偏下与底部截断 */
:deep(.node foreignObject) {
  overflow: visible !important;
}

:deep(.node foreignObject div) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
}

:deep(.node foreignObject p) {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  text-align: center !important;
}

:deep(.node foreignObject span.nodeLabel) {
  display: inline-block !important;
  text-align: center !important;
}

.mermaid-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
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

.mermaid-error {
  padding: 12px 16px;
  background-color: var(--vp-c-danger-soft);
  border-left: 4px solid var(--vp-c-danger-1);
  border-radius: 4px;
  color: var(--vp-c-danger-1);
  font-size: 13px;
  width: 100%;
}

.error-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.mermaid-error pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: var(--vp-font-family-mono);
}

/* 100vw x 100vh 纯沉浸式全屏灯箱 (深浅色模式自动自适应) */
.mermaid-modal-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  background-color: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

/* 沉浸式顶部悬浮控制栏 */
.modal-floating-header {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
  padding: 6px 16px;
  background-color: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
  user-select: none;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.scale-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg-mute);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  min-width: 46px;
  text-align: center;
  white-space: nowrap;
}

.modal-tools {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.modal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn:hover {
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.modal-btn.close-btn:hover {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

/* 全屏画布主体 */
.modal-body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  background-color: var(--vp-c-bg);
}

.modal-canvas {
  position: relative;
  transform-origin: center center;
  will-change: transform;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 强制让 SVG 填满原生固定尺寸画布，解除 Mermaid 行内 max-width 限制并防止 0x0 坍缩 */
:deep(.modal-canvas svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  display: block;
}

/* 底部悬浮提示条 */
.modal-floating-footer {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: none;
  font-size: 12px;
  white-space: nowrap;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  padding: 6px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
