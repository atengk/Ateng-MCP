<!--
 * 解耦式技术社区评论组件 (基于 GitHub Discussions 的 Giscus 深度整合)
 * 支持深浅色主题无缝跟随、跨路由重载、页面级评论开关与零服务端运维
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

export interface GiscusConfig {
  /** 全局评论功能总开关，默认 false；显式设为 true 时方全站激活评论 */
  enabled?: boolean
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title'
  strict?: '0' | '1'
  reactionsEnabled?: '0' | '1'
  emitMetadata?: '0' | '1'
  inputPosition?: 'top' | 'bottom'
  theme?: string
  darkTheme?: string
  lang?: string
  loading?: 'lazy' | 'eager'
}

const { frontmatter, theme, isDark } = useData()
const route = useRoute()

const commentsContainerRef = ref<HTMLElement | null>(null)

// 从 themeConfig 中提取 Giscus 选项配置
const giscusConfig = computed<GiscusConfig | null>(() => {
  return (theme.value.giscus as GiscusConfig) || null
})

// 判断当前页面是否允许呈现评论组件
const isCommentsEnabled = computed(() => {
  // 1. 若全局未配置 Giscus 或未显式开启（enabled !== true），直接隐退
  if (!giscusConfig.value || giscusConfig.value.enabled !== true || !giscusConfig.value.repo) {
    return false
  }
  // 2. 若 Frontmatter 显式禁用（comments: false），隐退
  if (frontmatter.value.comments === false) {
    return false
  }
  // 3. 首页与无布局页面隐退
  if (frontmatter.value.layout === 'home' || route.path === '/') {
    return false
  }
  return true
})

/**
 * 获取当前适配的 Giscus 主题方案
 */
const getCurrentTheme = () => {
  const cfg = giscusConfig.value
  if (!cfg) return 'light'
  return isDark.value ? (cfg.darkTheme || 'dark') : (cfg.theme || 'light')
}

/**
 * 动态加载并挂载 Giscus 客户端脚本
 */
const loadGiscus = () => {
  if (typeof window === 'undefined' || !commentsContainerRef.value || !giscusConfig.value) return

  // 1. 清理历史挂载节点
  commentsContainerRef.value.innerHTML = ''

  const cfg = giscusConfig.value
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', cfg.repo)
  script.setAttribute('data-repo-id', cfg.repoId || '')
  script.setAttribute('data-category', cfg.category || 'Announcements')
  script.setAttribute('data-category-id', cfg.categoryId || '')
  script.setAttribute('data-mapping', cfg.mapping || 'pathname')
  script.setAttribute('data-strict', cfg.strict || '0')
  script.setAttribute('data-reactions-enabled', cfg.reactionsEnabled || '1')
  script.setAttribute('data-emit-metadata', cfg.emitMetadata || '0')
  script.setAttribute('data-input-position', cfg.inputPosition || 'top')
  script.setAttribute('data-theme', getCurrentTheme())
  script.setAttribute('data-lang', cfg.lang || 'zh-CN')
  script.setAttribute('data-loading', cfg.loading || 'lazy')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  commentsContainerRef.value.appendChild(script)
}

/**
 * 动态向 Giscus iframe 发送换肤指令
 */
const syncThemeToIframe = () => {
  if (typeof window === 'undefined') return
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  if (!iframe || !iframe.contentWindow) return

  iframe.contentWindow.postMessage(
    {
      giscus: {
        setConfig: {
          theme: getCurrentTheme(),
        },
      },
    },
    'https://giscus.app'
  )
}

// 监听明暗模式切换，即时换肤
watch(isDark, () => {
  syncThemeToIframe()
})

// 监听路由路径变化，重新按新页面维度挂载讨论区
watch(
  () => route.path,
  () => {
    nextTick(() => {
      if (isCommentsEnabled.value) {
        loadGiscus()
      }
    })
  }
)

onMounted(() => {
  nextTick(() => {
    if (isCommentsEnabled.value) {
      loadGiscus()
    }
  })
})
</script>

<template>
  <section v-if="isCommentsEnabled" class="vp-comments-section">
    <div class="comments-header">
      <div class="header-title">
        <span class="header-icon i-lucide-messages-square" />
        <span>技术交流与社区讨论</span>
      </div>
      <span class="header-badge">基于 GitHub Discussions · 纯净无广告</span>
    </div>

    <!-- 挂载容器 -->
    <div ref="commentsContainerRef" class="comments-wrapper" />
  </section>
</template>

<style scoped>
.vp-comments-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--vp-c-divider);
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.header-icon {
  font-size: 1.25rem;
  color: var(--vp-c-brand-1);
}

.header-badge {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  padding: 3px 10px;
  border-radius: 9999px;
  background-color: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
}

.comments-wrapper {
  min-height: 180px;
  position: relative;
}

@media (max-width: 640px) {
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
