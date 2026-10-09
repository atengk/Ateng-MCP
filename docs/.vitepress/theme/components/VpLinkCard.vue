<!--
 * 外部链接与推荐资源导航卡片组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * 资源名称
     */
    title: string
    /**
     * 简短描述
     */
    desc?: string
    description?: string
    /**
     * 跳转链接
     */
    href?: string
    link?: string
    /**
     * 链接打开方式
     * @default '_blank'
     */
    target?: string
    /**
     * 图标类名（如 i-lucide-globe, i-lucide-github 等）
     */
    icon?: string
    /**
     * 状态标签
     */
    badge?: string
  }>(),
  {
    target: '_blank',
  }
)

const resolvedLink = computed(() => props.href || props.link || '#')
const resolvedDesc = computed(() => props.desc || props.description || '')
</script>

<template>
  <a
    :href="resolvedLink"
    :target="target"
    rel="noopener noreferrer"
    class="vp-link-card"
  >
    <div class="link-card-left">
      <div v-if="icon || $slots.icon" class="link-icon-box">
        <slot name="icon">
          <span :class="icon" class="link-icon" />
        </slot>
      </div>

      <div class="link-info">
        <div class="link-title-row">
          <span class="link-title">{{ title }}</span>
          <span v-if="badge" class="link-badge">{{ badge }}</span>
        </div>
        <p v-if="resolvedDesc" class="link-desc">{{ resolvedDesc }}</p>
      </div>
    </div>

    <div class="link-card-arrow">
      <span class="i-lucide-arrow-up-right arrow-icon" />
    </div>
  </a>
</template>

<style scoped>
.vp-link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  padding: 14px 18px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  text-decoration: none !important;
  color: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.vp-link-card:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -8px var(--vp-c-brand-soft);
}

.link-card-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.link-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
  font-size: 20px;
  flex-shrink: 0;
  transition: all 0.25s;
}

.vp-link-card:hover .link-icon-box {
  background-color: var(--vp-c-brand-soft);
  transform: scale(1.08);
}

.link-icon {
  font-size: 20px;
}

.link-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.link-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.link-desc {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card-arrow {
  display: flex;
  align-items: center;
  padding-left: 12px;
  color: var(--vp-c-text-3);
  transition: all 0.25s;
}

.arrow-icon {
  font-size: 18px;
  transition: transform 0.25s;
}

.vp-link-card:hover .arrow-icon {
  color: var(--vp-c-brand-1);
  transform: translate(2px, -2px);
}
</style>
