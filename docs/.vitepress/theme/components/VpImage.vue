<!--
 * 增强型图文排版与深浅色模式自适应图片组件 (VpImage)
 * 支持单图展示、浅色/深色主题双图自动交替、自定义宽度对齐与居中图注
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
export interface VpImageProps {
  /** 单图资源路径（若未区分深浅色时使用） */
  src?: string
  /** 浅色模式专属图片地址 */
  light?: string
  /** 深色模式专属图片地址 */
  dark?: string
  /** 图片替代文本 */
  alt?: string
  /** 底部居中图注说明 */
  caption?: string
  /** 自定义图片最大宽度，例如 '600px' 或 '80%'，默认 '100%' */
  width?: string
  /** 是否允许点击平滑放大灯箱，默认 true */
  zoom?: boolean
}

withDefaults(defineProps<VpImageProps>(), {
  src: '',
  light: '',
  dark: '',
  alt: '文档插图',
  caption: '',
  width: '100%',
  zoom: true,
})
</script>

<template>
  <figure class="vp-image-wrapper" :style="{ maxWidth: width }">
    <!-- 1. 双模图片呈现 -->
    <template v-if="light && dark">
      <img
        :src="light"
        :alt="alt"
        class="vp-image-el light-only"
        :class="{ 'no-zoom': !zoom }"
        loading="lazy"
      />
      <img
        :src="dark"
        :alt="alt"
        class="vp-image-el dark-only"
        :class="{ 'no-zoom': !zoom }"
        loading="lazy"
      />
    </template>

    <!-- 2. 普通单图呈现 -->
    <template v-else-if="src">
      <img
        :src="src"
        :alt="alt"
        class="vp-image-el"
        :class="{ 'no-zoom': !zoom }"
        loading="lazy"
      />
    </template>

    <!-- 3. 图注 -->
    <figcaption v-if="caption" class="vp-image-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.vp-image-wrapper {
  margin: 20px auto;
  text-align: center;
}

.vp-image-el {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s;
}

.vp-image-el:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.vp-image-caption {
  margin-top: 8px;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
