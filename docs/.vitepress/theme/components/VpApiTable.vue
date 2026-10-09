<!--
 * 结构化参数契约表容器组件 (VpApiTable)
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import VpApiItem from './VpApiItem.vue'

export interface ApiTableItem {
  /**
   * 参数/属性名称
   */
  name: string
  /**
   * TypeScript 类型定义或取值联合类型
   */
  type?: string
  /**
   * 默认值
   */
  default?: string
  /**
   * 是否必填
   */
  required?: boolean
  /**
   * 引入版本
   */
  version?: string
  /**
   * 参数说明描述
   */
  description?: string
  /**
   * 是否已废弃
   */
  deprecated?: boolean | string
}

const props = withDefaults(
  defineProps<{
    /**
     * 表格标题（如 Props、Events、Slots、Config 等）
     */
    title?: string
    /**
     * 表格副标题或简要说明
     */
    description?: string
    /**
     * 数组形态的参数项数据（支持直接传参或通过插槽嵌套 <VpApiItem>）
     */
    items?: ApiTableItem[]
    /**
     * 是否展示版本号列
     * @default true
     */
    showVersion?: boolean
    /**
     * 是否开启即时过滤检索输入框
     * @default false
     */
    searchable?: boolean
    /**
     * 检索输入框占位提示文本
     * @default '检索参数名称或类型...'
     */
    searchPlaceholder?: string
  }>(),
  {
    showVersion: true,
    searchable: false,
    searchPlaceholder: '检索参数名称或类型...',
  }
)

// 注入给子组件 VpApiItem 的检索词与列配置
const searchQuery = ref('')
provide('apiTableSearchQuery', searchQuery)
provide('apiTableShowVersion', computed(() => props.showVersion))

// 统计通过 props 传入的数据匹配数量
const filteredItems = computed(() => {
  if (!props.items) return []
  if (!searchQuery.value.trim()) return props.items
  const q = searchQuery.value.trim().toLowerCase()
  return props.items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="vp-api-table-card" role="region" aria-label="API 参数契约表">
    <!-- 顶部标题与检索栏 -->
    <div v-if="title || description || searchable" class="vp-api-table-header">
      <div class="vp-api-title-group">
        <h4 v-if="title" class="vp-api-table-title">{{ title }}</h4>
        <p v-if="description" class="vp-api-table-desc">{{ description }}</p>
      </div>

      <div v-if="searchable" class="vp-api-search-box">
        <span class="vp-api-search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="vp-api-search-input"
          :placeholder="searchPlaceholder"
        />
        <button
          v-if="searchQuery"
          class="vp-api-search-clear"
          title="清空搜索"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 桌面端表头 -->
    <div
      class="vp-api-grid-header"
      :class="{ 'has-version': showVersion }"
      role="row"
    >
      <div class="vp-api-col col-name" role="columnheader">参数名称</div>
      <div class="vp-api-col col-type" role="columnheader">类型契约</div>
      <div class="vp-api-col col-default" role="columnheader">默认值</div>
      <div v-if="showVersion" class="vp-api-col col-version" role="columnheader">引入版本</div>
      <div class="vp-api-col col-desc" role="columnheader">详细说明</div>
    </div>

    <!-- 表格内容区域：支持插槽模式与数组模式 -->
    <div class="vp-api-grid-body" role="rowgroup">
      <!-- 数组传参模式 -->
      <template v-if="items && items.length > 0">
        <VpApiItem
          v-for="item in filteredItems"
          :key="item.name"
          v-bind="item"
        />
        <div
          v-if="filteredItems.length === 0"
          class="vp-api-empty"
        >
          未找到与「{{ searchQuery }}」匹配的参数配置项
        </div>
      </template>

      <!-- 插槽模式 -->
      <slot v-else />
    </div>
  </div>
</template>

<style scoped>
.vp-api-table-card {
  margin: 20px 0 28px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv, #ffffff);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.vp-api-table-card:hover {
  border-color: var(--vp-c-brand-soft, rgba(99, 102, 241, 0.3));
}

.vp-api-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.vp-api-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vp-api-table-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  letter-spacing: -0.01em;
}

.vp-api-table-desc {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.vp-api-search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 220px;
}

.vp-api-search-icon {
  position: absolute;
  left: 10px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  pointer-events: none;
}

.vp-api-search-input {
  width: 100%;
  padding: 5px 28px 5px 30px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: all 0.2s ease;
}

.vp-api-search-input:focus {
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft, rgba(99, 102, 241, 0.15));
}

.vp-api-search-clear {
  position: absolute;
  right: 8px;
  font-size: 11px;
  background: transparent;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 2px 4px;
}

.vp-api-search-clear:hover {
  color: var(--vp-c-text-1);
}

/* 桌面端表头网格 */
.vp-api-grid-header {
  display: grid;
  grid-template-columns: minmax(140px, 1.2fr) minmax(150px, 1.4fr) minmax(100px, 1fr) 2fr;
  padding: 10px 20px;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vp-api-grid-header.has-version {
  grid-template-columns: minmax(140px, 1.2fr) minmax(150px, 1.4fr) minmax(90px, 0.9fr) minmax(80px, 0.8fr) 2fr;
}

.vp-api-grid-body {
  display: flex;
  flex-direction: column;
}

.vp-api-empty {
  padding: 32px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* 移动端与平板窄屏适配（< 768px）：隐藏表头，降级为弹性卡片流 */
@media (max-width: 768px) {
  .vp-api-grid-header {
    display: none;
  }

  .vp-api-table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .vp-api-search-box {
    width: 100%;
  }

  .vp-api-grid-body {
    padding: 12px;
    gap: 12px;
  }
}
</style>
