<!--
 * 精致交互卡片组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'
import { normalizeThemeLink, isExternalLink } from '../utils/link'

const props = withDefaults(
  defineProps<{
    /**
     * 卡片主标题
     */
    title?: string
    /**
     * 卡片描述简述文本
     */
    desc?: string
    description?: string
    /**
     * 图标类名（支持 UnoCSS 纯 CSS 图标，如 i-lucide-sparkles）
     */
    icon?: string
    /**
     * 跳转链接（支持站内相对路径或外部 URL）
     */
    link?: string
    /**
     * 链接打开方式
     * @default '_self'
     */
    target?: '_self' | '_blank'
    /**
     * 卡片右上角徽标文案
     */
    badge?: string
    /**
     * 徽标类型
     * @default 'tip'
     */
    badgeType?: 'tip' | 'warning' | 'danger' | 'info' | 'purple'
  }>(),
  {
    badgeType: 'tip',
  }
)

const resolvedDesc = computed(() => props.desc || props.description || '')
const isExternal = computed(() => isExternalLink(props.link))
const resolvedHref = computed(() => (props.link ? normalizeThemeLink(props.link) : undefined))
const resolvedTarget = computed(() => {
  if (props.target) return props.target
  return isExternal.value ? '_blank' : undefined
})
</script>

<template>
  <component
    :is="link ? 'a' : 'div'"
    class="vp-card"
    :href="resolvedHref"
    :target="link ? resolvedTarget : undefined"
    :rel="link && resolvedTarget === '_blank' ? 'noreferrer noopener' : undefined"
  >
    <div class="card-header">
      <div v-if="icon || $slots.icon" class="icon-box">
        <slot name="icon">
          <span :class="icon" class="card-icon" />
        </slot>
      </div>

      <div v-if="badge || $slots.badge" class="card-badge" :class="`badge-${badgeType}`">
        <slot name="badge">{{ badge }}</slot>
      </div>
    </div>

    <div class="card-body">
      <div v-if="title || $slots.title" class="card-title">
        <slot name="title">{{ title }}</slot>
        <span v-if="link && isExternal" class="i-lucide-external-link external-icon" />
      </div>

      <div v-if="resolvedDesc || $slots.desc" class="card-desc">
        <slot name="desc">{{ resolvedDesc }}</slot>
      </div>

      <div v-if="$slots.default" class="card-content">
        <slot />
      </div>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
.vp-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none !important;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

a.vp-card {
  cursor: pointer;
}

.vp-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -10px var(--vp-c-brand-soft);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
  font-size: 20px;
  transition: all 0.3s;
}

.vp-card:hover .icon-box {
  background-color: var(--vp-c-brand-soft);
  transform: scale(1.05);
}

.card-icon {
  font-size: 20px;
}

.card-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.badge-tip {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}

.badge-purple {
  color: #a855f7;
  background-color: rgba(168, 85, 247, 0.12);
}

.badge-info {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.12);
}

.badge-warning {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.12);
}

.badge-danger {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.12);
}

.card-body {
  flex: 1;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  margin-bottom: 8px;
}

.external-icon {
  font-size: 13px;
  color: var(--vp-c-text-3);
  transition: transform 0.2s;
}

.vp-card:hover .external-icon {
  transform: translate(2px, -2px);
  color: var(--vp-c-brand-1);
}

.card-desc {
  font-size: 13.5px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.card-content {
  margin-top: 10px;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
}

.card-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}
</style>
