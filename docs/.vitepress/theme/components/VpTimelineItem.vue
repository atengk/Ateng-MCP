<!--
 * 时间轴单个事件节点组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * 发生时间或日期（如 '2026-09-25'）
     */
    time?: string
    date?: string
    /**
     * 节点标题（如 'v1.0.0 正式发布'）
     */
    title?: string
    /**
     * 版本标签或状态标（如 'v1.0.0'）
     */
    tag?: string
    version?: string
    /**
     * 节点语义色
     * @default 'primary'
     */
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    /**
     * 节点图标类名（如 i-lucide-check）
     */
    icon?: string
  }>(),
  {
    type: 'primary',
  }
)

const resolvedTime = computed(() => props.time || props.date || '')
const resolvedTag = computed(() => props.tag || props.version || '')
</script>

<template>
  <div class="timeline-item" :class="`item-${type}`">
    <div class="timeline-line"></div>

    <div class="timeline-node">
      <span v-if="icon" :class="icon" class="node-icon" />
      <span v-else class="node-dot" />
    </div>

    <div class="timeline-content">
      <div class="timeline-header">
        <span v-if="resolvedTime || $slots.time" class="timeline-time">
          <slot name="time">{{ resolvedTime }}</slot>
        </span>

        <span v-if="resolvedTag || $slots.tag" class="timeline-tag">
          <slot name="tag">{{ resolvedTag }}</slot>
        </span>
      </div>

      <div v-if="title || $slots.title" class="timeline-title">
        <slot name="title">{{ title }}</slot>
      </div>

      <div v-if="$slots.default" class="timeline-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-item {
  position: relative;
  padding-bottom: 28px;
  padding-left: 28px;
}

.timeline-item:last-child {
  padding-bottom: 4px;
}

.timeline-line {
  position: absolute;
  top: 14px;
  bottom: -4px;
  left: 6px;
  width: 2px;
  background-color: var(--vp-c-divider);
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-node {
  position: absolute;
  top: 4px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  z-index: 2;
  transition: all 0.25s;
}

.node-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.node-icon {
  font-size: 10px;
}

/* 语义色配置 */
.item-primary .timeline-node {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.item-success .timeline-node {
  border-color: #10b981;
  color: #10b981;
}

.item-warning .timeline-node {
  border-color: #f59e0b;
  color: #f59e0b;
}

.item-danger .timeline-node {
  border-color: #ef4444;
  color: #ef4444;
}

.item-info .timeline-node {
  border-color: #3b82f6;
  color: #3b82f6;
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12.5px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

.timeline-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
}

.timeline-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  margin-bottom: 6px;
}

.timeline-body {
  font-size: 13.5px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.timeline-body :deep(ul) {
  margin: 6px 0;
  padding-left: 18px;
}

.timeline-body :deep(li) {
  margin: 3px 0;
}
</style>
