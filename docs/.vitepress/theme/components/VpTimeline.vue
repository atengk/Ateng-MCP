<!--
 * 版本演进与项目时间轴容器组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
// 时间轴外层容器
</script>

<template>
  <div class="vp-timeline">
    <slot />
  </div>
</template>

<style scoped>
.vp-timeline {
  position: relative;
  margin: 24px 0 32px;
  padding-left: 12px;
}
</style>
