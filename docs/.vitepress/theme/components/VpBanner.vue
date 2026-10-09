<!--
 * 全宽公告通知横幅组件（支持全局固定置顶、折叠收起与本地记忆防打扰）
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useData } from 'vitepress'

export interface VpBannerProps {
  /**
   * 横幅唯一标识，用于在 localStorage 中记忆关闭状态
   * @default 'zenith-announcement-v1'
   */
  id?: string
  /**
   * 公告文案
   * @default '🎉 欢迎体验 VitePress Zenith 旗舰级技术文档与知识库矩阵模板！'
   */
  text?: string
  /**
   * 跳转链接地址
   * @default '/guide/getting-started'
   */
  link?: string
  /**
   * 链接文字
   * @default '了解详情 →'
   */
  linkText?: string
  /**
   * 是否允许用户关闭并持久化记忆
   * @default true
   */
  dismissible?: boolean
  /**
   * 是否作为全局顶部横幅（固定定位并自动响应驱动 --vp-layout-top-height 布局变量）
   * @default true
   */
  fixed?: boolean
}

const props = withDefaults(defineProps<VpBannerProps>(), {
  id: 'zenith-announcement-v1',
  text: '🎉 欢迎体验 VitePress Zenith 旗舰级技术文档与知识库矩阵模板！',
  link: '/guide/getting-started',
  linkText: '了解详情 →',
  dismissible: true,
  fixed: true,
})

const { theme } = useData()
const displayText = computed(() => {
  if (props.text && props.text !== '🎉 欢迎体验 VitePress Zenith 旗舰级技术文档与知识库矩阵模板！') {
    return props.text
  }
  return theme.value?.zenith?.bannerText || props.text
})

const bannerRef = ref<HTMLElement | null>(null)
// 默认初始化为 true，避免页面初次载入时因展开动效引发导航栏瞬时高度测量偏差与闪烁
const isVisible = ref(true)
let resizeObserver: ResizeObserver | null = null

/**
 * 动态同步当前横幅实际高精度高度至全站布局变量 --vp-layout-top-height
 */
function updateLayoutTopHeight() {
  if (!props.fixed || typeof window === 'undefined') return
  if (isVisible.value && bannerRef.value) {
    const rect = bannerRef.value.getBoundingClientRect()
    const height = rect.height
    document.documentElement.style.setProperty('--vp-layout-top-height', `${height}px`)
  } else {
    document.documentElement.style.setProperty('--vp-layout-top-height', '0px')
  }
}

// 挂载时检查 localStorage 是否已关闭过该公告
onMounted(() => {
  if (typeof window === 'undefined') return
  try {
    const storageKey = `vp-zenith-banner-${props.id}`
    const isDismissed = localStorage.getItem(storageKey)
    if (isDismissed) {
      isVisible.value = false
      updateLayoutTopHeight()
      return
    }
  } catch {
    // 忽略异常并展示公告
  }

  nextTick(() => {
    updateLayoutTopHeight()
    if (bannerRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateLayoutTopHeight()
      })
      resizeObserver.observe(bannerRef.value)
    }
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (props.fixed && typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--vp-layout-top-height', '0px')
  }
})

/**
 * 关闭横幅并将状态持久化到本地存储
 */
function dismiss() {
  isVisible.value = false
  if (props.fixed && typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--vp-layout-top-height', '0px')
  }
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `vp-zenith-banner-${props.id}`
      localStorage.setItem(storageKey, 'true')
    } catch {
      // 容错处理
    }
  }
}
</script>

<template>
  <Transition name="vp-banner-fade" :appear="false">
    <aside
      v-if="isVisible"
      ref="bannerRef"
      class="vp-announcement-banner"
      :class="{ 'is-fixed': fixed, 'is-inline': !fixed }"
      role="alert"
    >
      <div class="vp-banner-content">
        <slot>
          <span class="vp-banner-text">{{ displayText }}</span>
          <a v-if="link" :href="link" class="vp-banner-link">
            {{ linkText }}
          </a>
        </slot>
      </div>

      <button
        v-if="dismissible"
        class="vp-banner-close"
        type="button"
        title="关闭公告"
        aria-label="关闭公告"
        @click="dismiss"
      >
        <svg
          class="vp-banner-close-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </aside>
  </Transition>
</template>

<style scoped>
.vp-announcement-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 48px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), #8b5cf6);
  color: #ffffff;
  font-size: 0.88rem;
  line-height: 1.5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 100%;
}

.vp-announcement-banner.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-layout-top, 60);
}

.vp-announcement-banner.is-inline {
  position: relative;
  border-radius: 8px;
  margin: 16px 0;
}

.vp-banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  text-align: center;
}

.vp-banner-text {
  font-weight: 500;
  letter-spacing: normal;
}

.vp-banner-link {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s ease;
}

.vp-banner-link:hover {
  opacity: 0.85;
}

.vp-banner-close {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.vp-banner-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.05);
}

.vp-banner-close-icon {
  width: 14px;
  height: 14px;
}

/* 仅在用户手动点击关闭时触发平滑上滑折叠动效 */
.vp-banner-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 80px;
  overflow: hidden;
}

.vp-banner-fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(-100%);
}

@media (max-width: 640px) {
  .vp-announcement-banner {
    padding: 10px 36px 10px 16px;
    font-size: 0.82rem;
  }

  .vp-banner-close {
    right: 8px;
  }
}
</style>
