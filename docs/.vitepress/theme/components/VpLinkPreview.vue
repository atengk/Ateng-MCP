<!--
 * 站内内链智能悬浮预览组件 (Link Hover Preview)
 * 类似 Wikipedia / Notion 的沉浸式内链悬浮气泡，光标停留 300ms 自动弹出摘要卡片
 * @author Ateng
 * @since 2026-09-25
 -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vitepress'
import { data as previewMap, type PagePreviewMeta } from '../utils/links.data'

const router = useRouter()
const route = useRoute()

// 预览卡片可见性与定位坐标
const isVisible = ref(false)
const currentMeta = ref<PagePreviewMeta | null>(null)
const cardStyle = ref<Record<string, string>>({})
const targetHref = ref('')

let hoverTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let activeLinkEl: HTMLElement | null = null

const HOVER_DELAY = 280 // 悬浮触发防抖时长 (ms)
const HIDE_DELAY = 160  // 移出保护宽限时长 (ms)
const CARD_WIDTH = 320  // 卡片标准宽度 (px)

/**
 * 将相对路径解析为基于当前路由的绝对路径
 * @param href 原始链接
 */
const resolveTargetUrl = (href: string): string => {
  if (!href) return ''
  // 移除锚点与搜索参数
  const cleanHref = href.split('#')[0].split('?')[0].trim()
  if (!cleanHref) return ''

  if (cleanHref.startsWith('/')) {
    let p = cleanHref
    if (p.endsWith('.md')) p = p.slice(0, -3)
    if (p.endsWith('.html')) p = p.slice(0, -5)
    if (p.endsWith('/index')) p = p.slice(0, -6)
    return p || '/'
  }

  // 处理相对路径 (./ 或 ../)
  const currentSegments = route.path.split('/').filter(Boolean)
  if (!route.path.endsWith('/')) {
    currentSegments.pop()
  }

  const parts = cleanHref.split('/')
  for (const part of parts) {
    if (part === '.' || part === '') continue
    if (part === '..') {
      currentSegments.pop()
    } else {
      let segment = part
      if (segment.endsWith('.md')) segment = segment.slice(0, -3)
      if (segment.endsWith('.html')) segment = segment.slice(0, -5)
      currentSegments.push(segment)
    }
  }

  const resolved = `/${currentSegments.join('/')}`
  return resolved.endsWith('/index') ? resolved.slice(0, -6) || '/' : resolved
}

/**
 * 计算浮层卡片的几何定位与视口碰撞规避
 * @param el 触发的链接元素
 */
const updatePosition = (el: HTMLElement) => {
  if (typeof window === 'undefined') return
  const rect = el.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 1. 水平居中定位并实施左右视口边缘防御
  let left = rect.left + rect.width / 2 - CARD_WIDTH / 2
  if (left < 16) {
    left = 16
  } else if (left + CARD_WIDTH > viewportWidth - 16) {
    left = viewportWidth - CARD_WIDTH - 16
  }

  // 2. 垂直方向检测：默认置于链接上方，上方空间不足时翻转至下方
  const estimatedHeight = 165
  let top = rect.top - estimatedHeight - 10
  let isPlacementBottom = false

  if (top < 16) {
    top = rect.bottom + 10
    isPlacementBottom = true
  }

  cardStyle.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    width: `${CARD_WIDTH}px`,
  }
}

/**
 * 链接鼠标移入事件处理
 */
const handleLinkMouseEnter = (e: MouseEvent) => {
  // 触摸设备免除悬浮以免干扰正常点按
  if (window.matchMedia('(pointer: coarse)').matches) return

  const target = (e.target as HTMLElement)?.closest('a')
  if (!target) return

  const rawHref = target.getAttribute('href')
  if (!rawHref) return

  // 排除外链、纯锚点、下载链接与社交图标链接
  if (
    rawHref.startsWith('http://') ||
    rawHref.startsWith('https://') ||
    rawHref.startsWith('//') ||
    rawHref.startsWith('mailto:') ||
    rawHref.startsWith('tel:') ||
    rawHref.startsWith('#') ||
    target.getAttribute('target') === '_blank' ||
    target.classList.contains('header-anchor') ||
    target.closest('.VPNav') ||
    target.closest('.VPSidebar') ||
    target.closest('.VPDocAside') ||
    target.closest('.vp-theme-picker')
  ) {
    return
  }

  const resolved = resolveTargetUrl(rawHref)
  // 如果链接就是当前页面自身，免除预览
  if (resolved === route.path || `${resolved}/` === route.path || resolved === route.path.replace(/\/$/, '')) {
    return
  }

  // 在元数据表中匹配目标文档
  const matched = previewMap[resolved] || previewMap[`${resolved}/`] || previewMap[`${resolved}.html`]
  if (!matched) return

  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  activeLinkEl = target
  targetHref.value = rawHref

  hoverTimer = setTimeout(() => {
    currentMeta.value = matched
    updatePosition(target)
    isVisible.value = true
  }, HOVER_DELAY)
}

/**
 * 链接鼠标移出事件处理
 */
const handleLinkMouseLeave = () => {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
  scheduleHide()
}

/**
 * 规划延迟关闭卡片
 */
const scheduleHide = () => {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    isVisible.value = false
    currentMeta.value = null
    activeLinkEl = null
  }, HIDE_DELAY)
}

/**
 * 鼠标移入卡片本身时保持显示
 */
const onCardMouseEnter = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

/**
 * 鼠标移出卡片本身时关闭
 */
const onCardMouseLeave = () => {
  scheduleHide()
}

/**
 * 点击卡片直达目标页面
 */
const handleCardClick = () => {
  if (!currentMeta.value) return
  router.go(currentMeta.value.url)
  isVisible.value = false
}

onMounted(() => {
  nextTick(() => {
    const docEl = document.querySelector('.vp-doc') || document.body
    docEl.addEventListener('mouseover', handleLinkMouseEnter as EventListener)
    docEl.addEventListener('mouseout', handleLinkMouseLeave as EventListener)
  })
})

onUnmounted(() => {
  const docEl = document.querySelector('.vp-doc') || document.body
  docEl.removeEventListener('mouseover', handleLinkMouseEnter as EventListener)
  docEl.removeEventListener('mouseout', handleLinkMouseLeave as EventListener)
  if (hoverTimer) clearTimeout(hoverTimer)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="preview-pop">
      <div
        v-if="isVisible && currentMeta"
        class="vp-link-preview-card"
        :style="cardStyle"
        @mouseenter="onCardMouseEnter"
        @mouseleave="onCardMouseLeave"
        @click="handleCardClick"
      >
        <!-- 顶部徽标与元数据 -->
        <div class="card-header">
          <span class="category-badge">
            <span class="badge-icon" :class="currentMeta.categoryIcon" />
            <span>{{ currentMeta.category }}</span>
          </span>
          <span class="reading-meta">
            <span class="meta-icon i-lucide-clock" />
            <span>{{ currentMeta.readingTime }} 分钟阅读</span>
          </span>
        </div>

        <!-- 标题区域 -->
        <h4 class="card-title">
          <span>{{ currentMeta.title }}</span>
        </h4>

        <!-- 首段摘要描述 -->
        <p class="card-desc">
          {{ currentMeta.description }}
        </p>

        <!-- 卡片底部指示 -->
        <div class="card-footer">
          <span class="url-crumb">{{ currentMeta.url }}</span>
          <span class="direct-hint">
            <span>点击直达</span>
            <span class="i-lucide-arrow-up-right" />
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vp-link-preview-card {
  position: fixed;
  z-index: 120;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.08);
  backdrop-filter: blur(16px);
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
  user-select: none;
}

.vp-link-preview-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 20px 40px -10px var(--vp-c-brand-soft), 0 0 0 1px var(--vp-c-brand-1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.badge-icon {
  font-size: 0.85rem;
}

.reading-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.card-title {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  margin: 0 0 10px 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.url-crumb {
  font-family: var(--vp-font-family-mono);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.direct-hint {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

/* 浮层动画 */
.preview-pop-enter-active,
.preview-pop-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-pop-enter-from,
.preview-pop-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(4px);
}
</style>
