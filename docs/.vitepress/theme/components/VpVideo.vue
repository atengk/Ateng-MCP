<!--
 * 高质感自适应视频播放短代码组件 (VpVideo)
 * 支持相对路径、Public 静态路径与网络直链 MP4/WebM，提供现代圆角、加载海报、可选图注与网络离线断网兜底
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface VpVideoProps {
  /** 视频资源地址（支持相对路径 ./assets/video.mp4、/videos/video.mp4 或网络链接） */
  src: string
  /** 视频封面海报图地址 */
  poster?: string
  /** 是否呈现原生视频控件，默认 true */
  controls?: boolean
  /** 是否自动静音播放，默认 false */
  autoplay?: boolean
  /** 是否循环播放，默认 false */
  loop?: boolean
  /** 是否静音，默认 false */
  muted?: boolean
  /** 视频容器自定义宽度，默认 100% */
  width?: string
  /** 容器宽高比，默认 16/9 */
  aspectRatio?: string
  /** 视频底部展示的图注说明 */
  caption?: string
}

const props = withDefaults(defineProps<VpVideoProps>(), {
  controls: true,
  autoplay: false,
  loop: false,
  muted: false,
  width: '100%',
  aspectRatio: '16 / 9',
  poster: '',
  caption: '',
})

const isOffline = ref(false)
const hasError = ref(false)

/**
 * 判断是否为外部网络直链
 */
const isRemoteUrl = computed(() => {
  return props.src.startsWith('http://') || props.src.startsWith('https://')
})

function handleVideoError() {
  hasError.value = true
}

function handleOnline() {
  isOffline.value = false
  hasError.value = false
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
  <figure class="vp-video-wrapper" :style="{ maxWidth: width }">
    <div class="vp-video-container" :style="{ aspectRatio }">
      <!-- 离线/加载失败降级卡片（仅针对外部网络直链或已报错场景） -->
      <div v-if="(isOffline && isRemoteUrl) || hasError" class="vp-video-fallback">
        <div class="vp-video-fallback-icon i-lucide-video-off" />
        <p class="vp-video-fallback-title">
          {{ isOffline ? '离线模式网络视频暂不可用' : '视频资源载入受阻' }}
        </p>
        <p class="vp-video-fallback-desc">
          {{ isOffline
            ? '当前处于断网或离线浏览状态。若为本地预缓存文档，正文与图表仍可完整查阅。'
            : '无法加载指定远程视频流，请检查网络连接或直接访问源地址。'
          }}
        </p>
        <a
          v-if="isRemoteUrl"
          :href="src"
          target="_blank"
          rel="noopener noreferrer"
          class="vp-video-fallback-btn"
        >
          <span class="i-lucide-external-link" />
          在新标签页尝试访问视频源
        </a>
      </div>

      <!-- 正常视频播放器 -->
      <video
        v-else
        :src="src"
        :poster="poster"
        :controls="controls"
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        playsinline
        preload="metadata"
        class="vp-video-player"
        @error="handleVideoError"
      >
        <p>您的浏览器暂不支持 HTML5 视频播放，请<a :href="src" target="_blank" rel="noopener">点击此处下载视频</a>。</p>
      </video>
    </div>
    <figcaption v-if="caption" class="vp-video-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.vp-video-wrapper {
  margin: 24px auto;
  width: 100%;
}

.vp-video-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background-color: #0b0f19;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.vp-video-container:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
}

.vp-video-player {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.vp-video-caption {
  margin-top: 8px;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* 离线与错误兜底卡片 */
.vp-video-fallback {
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

.vp-video-fallback-icon {
  font-size: 2.25rem;
  color: #f59e0b;
  margin-bottom: 12px;
}

.vp-video-fallback-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: #f8fafc;
}

.vp-video-fallback-desc {
  font-size: 0.875rem;
  color: #94a3b8;
  max-width: 440px;
  margin: 0 0 16px;
  line-height: 1.5;
}

.vp-video-fallback-btn {
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

.vp-video-fallback-btn:hover {
  opacity: 0.9;
}
</style>
