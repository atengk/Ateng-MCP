<!--
 * 状态与分类胶囊徽标组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
withDefaults(
  defineProps<{
    /**
     * 徽标文案
     */
    text?: string
    /**
     * 语义类型
     * @default 'tip'
     */
    type?: 'tip' | 'info' | 'warning' | 'danger' | 'purple' | 'success'
    /**
     * 样式变体
     * - 'subtle': 柔和背景（推荐）
     * - 'solid': 纯色背景
     * - 'outline': 边框线框
     * @default 'subtle'
     */
    variant?: 'subtle' | 'solid' | 'outline'
    /**
     * 尺寸规格
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg'
    /**
     * 是否在文案前展示微小圆点
     * @default false
     */
    dot?: boolean
  }>(),
  {
    type: 'tip',
    variant: 'subtle',
    size: 'md',
    dot: false,
  }
)
</script>

<template>
  <span
    class="vp-badge"
    :class="[`type-${type}`, `variant-${variant}`, `size-${size}`]"
  >
    <span v-if="dot" class="badge-dot" />
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped>
.vp-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  border-radius: 9999px;
  white-space: nowrap;
  vertical-align: middle;
  line-height: 1;
  transition: all 0.2s;
}

/* 尺寸规格 */
.size-sm {
  font-size: 11px;
  padding: 2px 7px;
}

.size-md {
  font-size: 12px;
  padding: 3px 9px;
}

.size-lg {
  font-size: 13px;
  padding: 4px 12px;
}

/* 圆点 */
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Subtle 柔和底色变体 */
.variant-subtle.type-tip {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}

.variant-subtle.type-success {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.12);
}

.variant-subtle.type-info {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.12);
}

.variant-subtle.type-warning {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.12);
}

.variant-subtle.type-danger {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.12);
}

.variant-subtle.type-purple {
  color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.12);
}

/* Solid 实体底色变体 */
.variant-solid.type-tip {
  color: #fff;
  background-color: var(--vp-c-brand-1);
}

.variant-solid.type-success {
  color: #fff;
  background-color: #10b981;
}

.variant-solid.type-info {
  color: #fff;
  background-color: #3b82f6;
}

.variant-solid.type-warning {
  color: #fff;
  background-color: #f59e0b;
}

.variant-solid.type-danger {
  color: #fff;
  background-color: #ef4444;
}

.variant-solid.type-purple {
  color: #fff;
  background-color: #8b5cf6;
}

/* Outline 线框变体 */
.variant-outline {
  background-color: transparent;
  border: 1px solid currentColor;
}

.variant-outline.type-tip {
  color: var(--vp-c-brand-1);
}

.variant-outline.type-success {
  color: #10b981;
}

.variant-outline.type-info {
  color: #3b82f6;
}

.variant-outline.type-warning {
  color: #f59e0b;
}

.variant-outline.type-danger {
  color: #ef4444;
}

.variant-outline.type-purple {
  color: #8b5cf6;
}
</style>
