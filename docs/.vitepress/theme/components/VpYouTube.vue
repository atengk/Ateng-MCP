<!--
 * YouTube 响应式国际化流媒体视频嵌入组件 (VpYouTube)
 * 采用 YouTube-nocookie 隐私增强域名，集成 16:9 响应式容器、微光骨架屏与 PWA 离线断网优雅降级
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface VpYouTubeProps {
  /** YouTube 视频 ID（例如 'dQw4w9WgXcQ'） */
  id: string
  /** 起始播放秒数，默认 0 */
  start?: number
  /** 是否自动播放，默认 false */
  autoplay?: boolean
  /** 容器自定义最大宽度，默认 100% */
  width?: string
  /** 容器宽高比，默认 16 / 9 */
  aspectRatio?: string
  /** 底部居中图注说明 */
  caption?: string
}

const props = withDefaults(defineProps<VpYouTubeProps>(), {
  start: 0,
  autoplay: false,
  width: '100%',
  aspectRatio: '16 / 9',
  caption: '',
})

const isLoading = ref(true)
const isOffline = ref(false)

/**
 * 官方 Web 网页直链
 */
const originalWebUrl = computed(() => {
  return `https://www.youtube.com/watch?v=${props.id}`
})

/**
 * 组装 YouTube-nocookie 官方增强隐私嵌入地址
 */
const iframeSrc = computed(() => {
  const params = new URLSearchParams()
  if (props.start > 0) params.set('start', String(props.start))
  if (props.autoplay) params.set('autoplay', '1')
  const query = params.toString()
  return `https://www.youtube-nocookie.com/embed/${props.id}${query ? `?${query}` : ''}`
})

function handleIframeLoad() {
  isLoading.value = false
}

function handleOnline() {
  isOffline.value = false
}

function handleOffline() {
  isOffline.value = true
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    isOffline.value = !navigator.onLine
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
})
</script>

<template>
  <figure class="vp-media-wrapper" :style="{ maxWidth: width }">
    <div class="vp-media-container" :style="{ aspectRatio }">
      <!-- 1. 离线断网优雅降级卡片 -->
      <div v-if="isOffline" class="vp-media-offline">
        <div class="vp-media-offline-icon i-lucide-wifi-off" />
        <p class="vp-media-offline-title">离线模式无法载入 YouTube 视频</p>
        <p class="vp-media-offline-desc">
          当前处于断网或离线浏览状态。文档正文与本地缓存可正常查阅，重连网络后视频将自动恢复。
        </p>
        <a
          :href="originalWebUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="vp-media-offline-btn"
        >
          <span class="i-lucide-external-link" />
          在 YouTube 中打开
        </a>
      </div>

      <!-- 2. 在线正常播放渲染 -->
      <template v-else>
        <!-- 加载微光骨架屏 -->
        <div v-if="isLoading" class="vp-media-skeleton">
          <div class="vp-media-skeleton-pulse">
            <span class="vp-media-skeleton-icon i-lucide-video" />
            <span class="vp-media-skeleton-text">正在加载 YouTube 播放器...</span>
          </div>
        </div>

        <iframe
          :src="iframeSrc"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          class="vp-media-iframe"
          title="YouTube 视频播放器"
          @load="handleIframeLoad"
        />
      </template>
    </div>
    <figcaption v-if="caption" class="vp-media-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.vp-media-wrapper {
  margin: 24px auto;
  width: 100%;
}

.vp-media-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background-color: #0b0f19;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.vp-media-container:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
}

.vp-media-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.vp-media-caption {
  margin-top: 8px;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* 离线降级卡片样式 */
.vp-media-offline {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: radial-gradient(circle at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%);
  color: #f8fafc;
}

.vp-media-offline-icon {
  font-size: 2.25rem;
  color: #f59e0b;
  margin-bottom: 12px;
}

.vp-media-offline-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: #f8fafc;
}

.vp-media-offline-desc {
  font-size: 0.875rem;
  color: #94a3b8;
  max-width: 440px;
  margin: 0 0 16px;
  line-height: 1.5;
}

.vp-media-offline-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  background: var(--vp-c-brand-1);
  text-decoration: none;
  transition: opacity 0.2s;
}

.vp-media-offline-btn:hover {
  opacity: 0.9;
}

/* 骨架屏加载样式 */
.vp-media-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.6);
  z-index: 1;
  pointer-events: none;
}

.vp-media-skeleton-pulse {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.vp-media-skeleton-icon {
  font-size: 2rem;
  color: var(--vp-c-brand-1);
}

.vp-media-skeleton-text {
  font-size: 0.85rem;
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
