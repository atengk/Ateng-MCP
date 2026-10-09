<!--
 * 结构化参数项组件 (VpApiItem)
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * 参数或属性名称
     */
    name: string
    /**
     * TypeScript 类型契约
     */
    type?: string
    /**
     * 默认值
     */
    default?: string
    /**
     * 是否必填
     * @default false
     */
    required?: boolean
    /**
     * 引入版本
     */
    version?: string
    /**
     * 详细说明描述
     */
    description?: string
    /**
     * 是否废弃标记或废弃版本
     * @default false
     */
    deprecated?: boolean | string
  }>(),
  {
    required: false,
    deprecated: false,
  }
)

const searchQuery = inject<Ref<string>>('apiTableSearchQuery', ref(''))
const showVersion = inject<Ref<boolean>>('apiTableShowVersion', ref(true))
const defaultValue = computed(() => props.default)

// 判断当前项是否符合搜索过滤条件
const isMatch = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return true
  return (
    props.name.toLowerCase().includes(q) ||
    (props.type && props.type.toLowerCase().includes(q)) ||
    (props.description && props.description.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div
    v-show="isMatch"
    class="vp-api-row"
    :class="{
      'has-version': showVersion,
      'is-deprecated': !!deprecated,
      'is-required': required,
    }"
    role="row"
  >
    <!-- 1. 参数名称列 -->
    <div class="vp-api-cell cell-name" role="cell">
      <div class="vp-api-name-wrapper">
        <code class="vp-api-name-code" :class="{ strike: !!deprecated }">{{ name }}</code>
        <span v-if="required" class="vp-api-pill pill-required" title="此项为必填配置">必填</span>
        <span v-if="deprecated" class="vp-api-pill pill-deprecated" title="该属性已在后续版本中废弃">
          {{ typeof deprecated === 'string' ? `废弃于 ${deprecated}` : '已废弃' }}
        </span>
      </div>
    </div>

    <!-- 2. 类型契约列 -->
    <div class="vp-api-cell cell-type" role="cell">
      <span class="vp-api-mobile-label">类型：</span>
      <code v-if="type" class="vp-api-type-code">{{ type }}</code>
      <span v-else class="vp-api-placeholder">-</span>
    </div>

    <!-- 3. 默认值列 -->
    <div class="vp-api-cell cell-default" role="cell">
      <span class="vp-api-mobile-label">默认值：</span>
      <code v-if="defaultValue !== undefined" class="vp-api-default-code">{{ defaultValue }}</code>
      <span v-else class="vp-api-placeholder">-</span>
    </div>


    <!-- 4. 版本标记列 -->
    <div v-if="showVersion" class="vp-api-cell cell-version" role="cell">
      <span class="vp-api-mobile-label">版本：</span>
      <span v-if="version" class="vp-api-pill pill-version">{{ version }}</span>
      <span v-else class="vp-api-placeholder">-</span>
    </div>

    <!-- 5. 详细描述列 -->
    <div class="vp-api-cell cell-desc" role="cell">
      <div class="vp-api-desc-content">
        <slot>
          <span v-if="description">{{ description }}</span>
          <span v-else class="vp-api-placeholder">-</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 桌面端默认样式：继承网格对齐 */
.vp-api-row {
  display: grid;
  grid-template-columns: minmax(140px, 1.2fr) minmax(150px, 1.4fr) minmax(100px, 1fr) 2fr;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background-color 0.2s ease;
  font-size: 13px;
}

.vp-api-row.has-version {
  grid-template-columns: minmax(140px, 1.2fr) minmax(150px, 1.4fr) minmax(90px, 0.9fr) minmax(80px, 0.8fr) 2fr;
}

.vp-api-row:last-child {
  border-bottom: none;
}

.vp-api-row:hover {
  background-color: var(--vp-c-bg-alt);
}

.vp-api-cell {
  display: flex;
  align-items: center;
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
  padding: 2px 8px 2px 0;
}

.vp-api-mobile-label {
  display: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.vp-api-name-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.vp-api-name-code {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-brand-dark, #4f46e5);
  background: var(--vp-c-brand-soft, rgba(99, 102, 241, 0.1));
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.18);
  line-height: 1.3;
}

.vp-api-name-code.strike {
  text-decoration: line-through;
  opacity: 0.7;
}

.vp-api-type-code {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.08);
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid rgba(2, 132, 199, 0.16);
  line-height: 1.4;
  white-space: pre-wrap;
}

:root.dark .vp-api-type-code {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.22);
}

.vp-api-default-code {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute, rgba(0, 0, 0, 0.04));
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider);
}

.vp-api-placeholder {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.vp-api-pill {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.4;
}

.pill-required {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.pill-version {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-family: var(--vp-font-family-mono);
}

.pill-deprecated {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.vp-api-desc-content {
  line-height: 1.55;
  color: var(--vp-c-text-1);
}

.vp-api-desc-content :deep(p) {
  margin: 0;
}

.vp-api-desc-content :deep(code) {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--vp-c-bg-alt);
}

/* 移动端与平板窄屏响应式降级（< 768px）：单卡片纵向排版 */
@media (max-width: 768px) {
  .vp-api-row,
  .vp-api-row.has-version {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
  }

  .vp-api-cell {
    padding: 0;
  }

  .vp-api-mobile-label {
    display: inline-block;
    min-width: 52px;
  }

  .cell-name {
    margin-bottom: 2px;
  }

  .cell-type,
  .cell-default,
  .cell-version {
    font-size: 12.5px;
  }

  .cell-desc {
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px dashed var(--vp-c-divider);
    font-size: 13px;
  }
}
</style>
