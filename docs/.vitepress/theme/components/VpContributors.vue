<!--
 * 开源文档贡献者致谢流与 GitHub 编辑协同组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { data as contributorsMap } from '../utils/contributors.data'
import type { ContributorInfo } from '../utils/contributors.data'

export interface VpContributorsProps {
  /**
   * 手动传入贡献者列表（覆盖自动提取数据）
   */
  contributors?: ContributorInfo[]
  /**
   * 自定义“在 GitHub 上编辑此页”链接
   */
  editUrl?: string
  /**
   * 是否展示编辑此页链接
   * @default true
   */
  showEditLink?: boolean
  /**
   * 模块自定义标题
   */
  title?: string
}

const props = withDefaults(defineProps<VpContributorsProps>(), {
  contributors: undefined,
  editUrl: undefined,
  showEditLink: true,
  title: undefined,
})

const { page, theme, lang, frontmatter } = useData()
const route = useRoute()

// 仅在非首页且未显式关闭时展示
const shouldShow = computed(() => {
  if (frontmatter.value.contributors === false) return false
  if (frontmatter.value.layout === 'home' || route.path === '/' || route.path === '/en/') return false
  return true
})

const isEnglish = computed(() => lang.value === 'en-US' || route.path.startsWith('/en/'))

/**
 * 匹配当前文档的贡献者元数据
 */
const currentMeta = computed(() => {
  const path = route.path.replace(/\\/g, '/')
  const rel = page.value.relativePath ? `/${page.value.relativePath.replace(/\.md$/, '')}` : ''

  return (
    contributorsMap[path] ||
    contributorsMap[path.replace(/\/$/, '')] ||
    contributorsMap[`${path}.html`] ||
    contributorsMap[rel] ||
    contributorsMap[`${rel}.html`] ||
    null
  )
})

/**
 * 解析最终贡献者列表
 */
const list = computed<ContributorInfo[]>(() => {
  if (props.contributors && props.contributors.length > 0) {
    return props.contributors
  }
  if (currentMeta.value && currentMeta.value.contributors.length > 0) {
    return currentMeta.value.contributors
  }
  return [
    {
      name: frontmatter.value.author || '孔余 (Ateng)',
      avatar: 'https://github.com/atengk.png',
      github: 'atengk',
      commitsCount: 1,
      lastCommitTime: Date.now() / 1000,
      lastCommitMessage: 'Document initial creation',
    },
  ]
})

/**
 * 计算 GitHub 编辑此页直达链接
 */
const resolvedEditUrl = computed(() => {
  if (props.editUrl) return props.editUrl
  const pattern =
    theme.value.editLink?.pattern ||
    'https://github.com/atengk/vitepress-zenith/edit/master/docs/:path'
  return pattern.replace(':path', page.value.relativePath)
})

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return isEnglish.value ? 'Page Contributors' : '本页贡献者'
})

const editText = computed(() => {
  return theme.value.editLink?.text || (isEnglish.value ? 'Edit this page on GitHub' : '在 GitHub 上编辑此页')
})

function formatTimestamp(ts: number): string {
  if (!ts) return ''
  const date = new Date(ts * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div v-if="shouldShow" class="vp-contributors" role="region" aria-label="文档贡献者与编辑链接">
    <div class="vp-contributors-container">
      <!-- 贡献者头像流区域 -->
      <div class="vp-contributors-main">
        <div class="vp-contributors-header">
          <div class="vp-contributors-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span class="vp-contributors-title">{{ resolvedTitle }}</span>
          <span class="vp-contributors-count">
            {{ list.length }} {{ isEnglish ? 'contributors' : '位贡献者' }}
          </span>
        </div>

        <div class="vp-contributors-avatars">
          <div
            v-for="author in list"
            :key="author.name"
            class="vp-contributor-item"
          >
            <a
              :href="author.github ? `https://github.com/${author.github}` : undefined"
              :target="author.github ? '_blank' : undefined"
              :rel="author.github ? 'noopener noreferrer' : undefined"
              class="vp-contributor-avatar-link"
              :class="{ 'has-link': Boolean(author.github) }"
            >
              <img
                :src="author.avatar"
                :alt="author.name"
                class="vp-contributor-avatar"
                loading="lazy"
                @error="(e) => {
                  const target = e.target as HTMLImageElement
                  if (target && !target.src.includes('dicebear')) {
                    target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(author.name)}`
                  }
                }"
              />
            </a>

            <!-- 悬浮微型卡片 Tooltip -->
            <div class="vp-contributor-tooltip" role="tooltip">
              <div class="vp-tooltip-name">{{ author.name }}</div>
              <div class="vp-tooltip-meta">
                <span>{{ author.commitsCount }} {{ isEnglish ? 'commits' : '次提交' }}</span>
                <span v-if="author.lastCommitTime">· {{ formatTimestamp(author.lastCommitTime) }}</span>
              </div>
              <div v-if="author.lastCommitMessage" class="vp-tooltip-msg">
                "{{ author.lastCommitMessage }}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑此页按钮 -->
      <div v-if="showEditLink && resolvedEditUrl" class="vp-contributors-edit">
        <a
          :href="resolvedEditUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="vp-edit-page-btn"
          title="跳转 GitHub 提交 Pull Request 协同改进本页内容"
        >
          <svg class="vp-edit-icon" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span class="vp-edit-text">{{ editText }}</span>
          <svg class="vp-external-icon" viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vp-contributors {
  margin: 24px 0 16px 0;
  padding: 16px 20px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-sizing: border-box;
  transition: border-color 0.25s ease;
}

.vp-contributors:hover {
  border-color: var(--vp-c-brand-soft);
}

.vp-contributors-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.vp-contributors-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.vp-contributors-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.vp-contributors-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1);
}

.vp-contributors-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  letter-spacing: normal;
}

.vp-contributors-count {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 9999px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  letter-spacing: normal;
}

.vp-contributors-avatars {
  display: flex;
  align-items: center;
  padding-left: 4px;
}

.vp-contributor-item {
  position: relative;
  margin-left: -8px;
  transition: transform 0.2s ease, z-index 0.2s ease;
}

.vp-contributor-item:first-child {
  margin-left: 0;
}

.vp-contributor-item:hover {
  transform: translateY(-2px) scale(1.15);
  z-index: 10;
}

.vp-contributor-avatar-link {
  display: block;
  border-radius: 50%;
  outline: none;
}

.vp-contributor-avatar-link.has-link {
  cursor: pointer;
}

.vp-contributor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-bg);
  background: var(--vp-c-bg-mute);
  object-fit: cover;
  display: block;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: border-color 0.2s ease;
}

.vp-contributor-item:hover .vp-contributor-avatar {
  border-color: var(--vp-c-brand-1);
}

/* Tooltip 浮层 */
.vp-contributor-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 8px 12px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  white-space: nowrap;
  z-index: 20;
  min-width: 140px;
}

.vp-contributor-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: var(--vp-c-divider) transparent transparent transparent;
}

.vp-contributor-item:hover .vp-contributor-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.vp-tooltip-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.vp-tooltip-meta {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.vp-tooltip-msg {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  margin-top: 4px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 编辑此页按钮 */
.vp-contributors-edit {
  display: flex;
  align-items: center;
}

.vp-edit-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2) !important;
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none !important;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.vp-edit-page-btn:hover {
  color: var(--vp-c-brand-1) !important;
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  transform: translateY(-1px);
}

.vp-edit-icon {
  color: var(--vp-c-brand-1);
}

.vp-external-icon {
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.vp-edit-page-btn:hover .vp-external-icon {
  opacity: 1;
  transform: translate(1px, -1px);
}

@media (max-width: 640px) {
  .vp-contributors {
    padding: 14px 16px;
  }

  .vp-contributors-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .vp-contributors-edit {
    width: 100%;
  }

  .vp-edit-page-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
