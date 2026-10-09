<!--
 * 卡片网格自适应容器组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
withDefaults(
  defineProps<{
    /**
     * 网格列数（支持 1, 2, 3, 4 列）
     * @default 2
     */
    cols?: 1 | 2 | 3 | 4 | '1' | '2' | '3' | '4'
    /**
     * 卡片间距（像素或 CSS 长度）
     * @default '16px'
     */
    gap?: string
  }>(),
  {
    cols: 2,
    gap: '16px',
  }
)
</script>

<template>
  <div
    class="vp-card-grid"
    :class="`grid-cols-${cols}`"
    :style="{ gap }"
  >
    <slot />
  </div>
</template>

<style scoped>
.vp-card-grid {
  display: grid;
  margin: 16px 0 24px;
  width: 100%;
}

.grid-cols-1 {
  grid-template-columns: 1fr;
}

.grid-cols-2 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.grid-cols-3 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.grid-cols-4 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
