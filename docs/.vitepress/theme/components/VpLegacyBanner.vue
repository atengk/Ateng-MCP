<!--
 * 历史归档版本提示横幅组件 (Legacy / Archived Banner)
 * @author Ateng
 * @since 2026-10-02
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { normalizeThemeLink } from '../utils/link'

export interface VpLegacyBannerProps {
  /**
   * 显式指定当前页面所代表的历史版本号
   */
  currentVersion?: string
  /**
   * 显式指定当前仓库最新的稳定版本号
   * @default 'v1.0.0'
   */
  latestVersion?: string
  /**
   * 跳转至最新稳定版的链接
   * @default 自动计算等价路径或回退至 '/guide/getting-started'
   */
  latestLink?: string
  /**
   * 提示横幅标题
   */
  title?: string
  /**
   * 提示消息说明
   */
  message?: string
  /**
   * 跳转按钮文案
   */
  buttonText?: string
  /**
   * 是否允许用户在当前会话中暂时关闭此提示
   * @default true
   */
  dismissible?: boolean
}

const props = withDefaults(defineProps<VpLegacyBannerProps>(), {
  latestVersion: 'v1.0.0',
  dismissible: true,
})

const { frontmatter, lang } = useData()
const route = useRoute()
const dismissed = ref(false)

const isLegacyPage = computed(() => {
  // 1. 若 Frontmatter 显式配置了 legacy 或 archived 标记，直接生效
  if (frontmatter.value.legacy === true || frontmatter.value.archived === true) {
    return true
  }
  if (frontmatter.value.legacy === false || frontmatter.value.archived === false) {
    return false
  }
  if (props.currentVersion) {
    return true
  }

  // 2. 检查当前路由路径特征（如匹配 /v0 开头，或包含 /legacy/、/archived/ 等）
  const path = route.path
  return (
    /^\/v0(?:\/|$)/.test(path) ||
    /\/v\d+(?:\.\d+)*\//.test(path) ||
    path.includes('/legacy/') ||
    path.includes('/archived/')
  )
})

const shouldShow = computed(() => {
  return isLegacyPage.value && !dismissed.value
})

const isEnglish = computed(() => {
  return lang.value === 'en-US' || route.path.startsWith('/en/')
})

const resolvedCurrentVersion = computed(() => {
  if (props.currentVersion) return props.currentVersion
  if (typeof frontmatter.value.version === 'string') return frontmatter.value.version
  const match = route.path.match(/(v\d+(?:\.\d+)*)/)
  return match ? match[1] : 'v0.9.0'
})

const resolvedLatestVersion = computed(() => {
  if (props.latestVersion) return props.latestVersion
  if (typeof frontmatter.value.latestVersion === 'string') return frontmatter.value.latestVersion
  return 'v1.0.0'
})

const resolvedLatestLink = computed(() => {
  let targetLink = ''
  if (props.latestLink) {
    targetLink = props.latestLink
  } else if (typeof frontmatter.value.latestLink === 'string') {
    targetLink = frontmatter.value.latestLink
  } else {
    const path = route.path
    // 若路由以历史版本前缀打头，尝试平移至最新版本对应等价路径
    if (/^\/v\d+(?:\.\d+)*\//.test(path)) {
      const candidatePath = path.replace(/^\/v\d+(?:\.\d+)*\//, '/')
      if (candidatePath && candidatePath !== '/') {
        targetLink = candidatePath
      }
    }
    if (!targetLink) {
      targetLink = isEnglish.value ? '/en/guide/getting-started' : '/guide/getting-started'
    }
  }

  return normalizeThemeLink(targetLink)
})

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return isEnglish.value ? 'Archived Documentation Notice' : '历史归档版本提示'
})

const resolvedMessage = computed(() => {
  if (props.message) return props.message
  return isEnglish.value
    ? `You are currently viewing an archived version (${resolvedCurrentVersion.value}) of the documentation. It is no longer actively maintained.`
    : `您当前查阅的是历史归档版本（${resolvedCurrentVersion.value}）的技术文档。该版本已停止积极维护，可能存在与最新版不兼容的配置或已废弃的 API。`
})

const resolvedButtonText = computed(() => {
  if (props.buttonText) return props.buttonText
  return isEnglish.value
    ? `Go to Latest (${resolvedLatestVersion.value}) →`
    : `前往最新稳定版 (${resolvedLatestVersion.value}) →`
})

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <Transition name="vp-legacy-banner-fade">
    <div v-if="shouldShow" class="vp-legacy-banner" role="alert">
      <div class="vp-legacy-banner-container">
        <!-- 警示图标 -->
        <div class="vp-legacy-banner-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <!-- 文本与版本标识 -->
        <div class="vp-legacy-banner-body">
          <div class="vp-legacy-banner-header">
            <span class="vp-legacy-banner-badge">{{ resolvedCurrentVersion }} {{ isEnglish ? 'Archived' : '历史归档' }}</span>
            <span class="vp-legacy-banner-title">{{ resolvedTitle }}</span>
          </div>
          <p class="vp-legacy-banner-text">
            {{ resolvedMessage }}
          </p>
        </div>

        <!-- 跳转最新版操作按钮 -->
        <div class="vp-legacy-banner-actions">
          <a :href="resolvedLatestLink" class="vp-legacy-banner-btn">
            {{ resolvedButtonText }}
          </a>
        </div>

        <!-- 关闭按钮 -->
        <button
          v-if="dismissible"
          class="vp-legacy-banner-close"
          type="button"
          :title="isEnglish ? 'Dismiss warning' : '关闭此提示'"
          :aria-label="isEnglish ? 'Dismiss warning' : '关闭此提示'"
          @click="dismiss"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.vp-legacy-banner {
  margin: 0 0 24px 0;
  border-radius: 8px;
  background-color: var(--vp-custom-block-warning-bg, rgba(245, 158, 11, 0.08));
  border: 1px solid var(--vp-custom-block-warning-border, rgba(245, 158, 11, 0.35));
  border-left: 5px solid var(--vp-c-warning-1, #f59e0b);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.06);
  position: relative;
  overflow: hidden;
}

.vp-legacy-banner-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  box-sizing: border-box;
}

.vp-legacy-banner-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-warning-1, #f59e0b);
}

.vp-legacy-banner-body {
  flex: 1;
  min-width: 0;
}

.vp-legacy-banner-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.vp-legacy-banner-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 9999px;
  background-color: rgba(245, 158, 11, 0.18);
  color: var(--vp-c-warning-1, #b45309);
  border: 1px solid rgba(245, 158, 11, 0.3);
  letter-spacing: normal;
}

:root.dark .vp-legacy-banner-badge {
  color: #fbbf24;
}

.vp-legacy-banner-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: normal;
}

.vp-legacy-banner-text {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  letter-spacing: normal;
}

.vp-legacy-banner-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.vp-legacy-banner-btn {
  display: inline-flex;
  align-items: center;
  padding: 7px 15px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff !important;
  background: var(--vp-c-warning-1, #f59e0b);
  border-radius: 6px;
  text-decoration: none !important;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
}

.vp-legacy-banner-btn:hover {
  background: var(--vp-c-warning-2, #d97706);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.vp-legacy-banner-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.vp-legacy-banner-close:hover {
  color: var(--vp-c-text-1);
  background-color: rgba(0, 0, 0, 0.06);
}

:root.dark .vp-legacy-banner-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 折叠淡出动效 */
.vp-legacy-banner-fade-enter-active,
.vp-legacy-banner-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 160px;
  opacity: 1;
}

.vp-legacy-banner-fade-enter-from,
.vp-legacy-banner-fade-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .vp-legacy-banner-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
  }

  .vp-legacy-banner-actions {
    width: 100%;
  }

  .vp-legacy-banner-btn {
    width: 100%;
    justify-content: center;
  }

  .vp-legacy-banner-close {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
