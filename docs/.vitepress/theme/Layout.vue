<!--
 * 全局自定义布局封装（挂载通知横幅、进度条、元数据、反馈组件与沉浸式阅读组件）
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ReadingProgressBar from './components/ReadingProgressBar.vue'
import ZenModeToggle from './components/ZenModeToggle.vue'
import DocMeta from './components/DocMeta.vue'
import VpBanner from './components/VpBanner.vue'
import VpLegacyBanner from './components/VpLegacyBanner.vue'
import VpHelpful from './components/VpHelpful.vue'
import VpCommandPalette from './components/VpCommandPalette.vue'
import VpComments from './components/VpComments.vue'
import VpThemePicker from './components/VpThemePicker.vue'
import VpLinkPreview from './components/VpLinkPreview.vue'
import VpPwaStatus from './components/VpPwaStatus.vue'
import VpShortcutsModal from './components/VpShortcutsModal.vue'
import VpContributors from './components/VpContributors.vue'
import VpZenHoverBar from './components/VpZenHoverBar.vue'
import { useMediumZoom } from './composables/useMediumZoom'
import { useCodeFolding } from './composables/useCodeFolding'
import { useThemePalette } from './composables/useThemePalette'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

const { Layout } = DefaultTheme
const { theme, frontmatter } = useData()

// 页面类型判断
const isHome = computed(() => frontmatter.value.layout === 'home')

/**
 * 辅助函数：根据 Frontmatter 覆盖与全局 themeConfig.zenith 开关决定最终显隐
 * @param key 特性键名
 * @param defaultValue 全局兜底默认值
 */
function resolveFeatureSwitch(key: string, defaultValue = false) {
  if (frontmatter.value[key] !== undefined) {
    return Boolean(frontmatter.value[key])
  }
  return theme.value.zenith?.[key] ?? defaultValue
}

// 1. 文档有用度点赞/点踩（默认 false：无后端埋点占位组件）
const showHelpful = computed(() => {
  if (isHome.value) return false
  return resolveFeatureSwitch('helpful', false)
})

// 2. 右下角专注模式悬浮球（默认 false：快捷键 Alt+Z 仍可直接使用）
const showZenModeToggle = computed(() => {
  if (isHome.value) return false
  return resolveFeatureSwitch('zenModeToggle', false)
})

// 3. 开源贡献者致谢流（默认 false：单人/私有项目免受侵扰）
const showContributors = computed(() => {
  if (isHome.value) return false
  if (frontmatter.value.contributors !== undefined) {
    if (typeof frontmatter.value.contributors === 'boolean') return frontmatter.value.contributors
    if (Array.isArray(frontmatter.value.contributors)) return true
  }
  return Boolean(theme.value.zenith?.contributors)
})

// 4. 阅读认知指标（字数与预计耗时 DocMeta，默认 true）
const showReadingMetrics = computed(() => {
  if (isHome.value) return false
  return resolveFeatureSwitch('readingMetrics', true)
})

// 5. 页面顶部流光阅读进度条（默认 true）
const showReadingProgressBar = computed(() => {
  if (isHome.value) return false
  return resolveFeatureSwitch('readingProgressBar', true)
})

// 6. 站内内链卡片悬浮预览（默认 true）
const showLinkPreview = computed(() => {
  return resolveFeatureSwitch('linkPreview', true)
})

// 7. 全键盘极客导航与速查浮层（默认 true）
const showKeyboardShortcuts = computed(() => {
  return resolveFeatureSwitch('keyboardShortcuts', true)
})

// 8. 超长代码块渐变折叠（默认 true）
const enableCodeFolding = computed(() => {
  return resolveFeatureSwitch('codeFolding', true)
})

// 9. 历史归档警告横幅（默认 false，受 versionSwitcher 开关控制，亦支持 Frontmatter 覆盖）
const showLegacyBanner = computed(() => {
  if (isHome.value) return false
  return resolveFeatureSwitch('versionSwitcher', false)
})

// 10. 顶部全宽公告通知横幅（默认 false：按需开启）
const showBanner = computed(() => {
  return resolveFeatureSwitch('banner', false)
})

// 11. 顶栏主题强调色盘选择器（默认 false：按需开启）
const showThemePicker = computed(() => {
  return resolveFeatureSwitch('themePicker', false)
})

// 12. 全局交互命令中心浮层（默认 true）
const showCommandPalette = computed(() => {
  return resolveFeatureSwitch('commandPalette', true)
})

// 13. PWA 离线运行感知与应用安装横幅（默认 false：按需开启）
const showPwaStatus = computed(() => {
  return resolveFeatureSwitch('pwaStatus', false)
})

// 14. 正文图片平滑缩放灯箱（默认 true）
const enableMediumZoom = computed(() => {
  return resolveFeatureSwitch('mediumZoom', true)
})

// 15. 沉浸式专注阅读顶部智能感应胶囊（默认 true）
const showZenHoverBar = computed(() => {
  if (isHome.value) return false
  return resolveFeatureSwitch('zenMode', true)
})

// 挂载正文图片平滑缩放灯箱
if (enableMediumZoom.value) {
  useMediumZoom()
}

// 挂载超长代码块智能折叠
if (enableCodeFolding.value) {
  useCodeFolding()
}

// 初始化主题强调色盘
useThemePalette()

// 挂载全键盘极客导航监听器
const { attachKeyboardShortcuts } = useKeyboardShortcuts()
if (showKeyboardShortcuts.value) {
  attachKeyboardShortcuts()
}
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <VpThemePicker v-if="showThemePicker" />
    </template>

    <template #nav-screen-content-after>
      <VpThemePicker v-if="showThemePicker" />
    </template>

    <template #layout-top>
      <VpBanner v-if="showBanner" />
      <ReadingProgressBar v-if="showReadingProgressBar" />
    </template>

    <template #doc-before>
      <VpLegacyBanner v-if="showLegacyBanner" />
      <DocMeta v-if="showReadingMetrics" />
    </template>

    <template #doc-footer-before>
      <VpHelpful v-if="showHelpful" />
      <VpContributors v-if="showContributors" />
    </template>

    <template #doc-after>
      <VpComments />
    </template>

    <template #layout-bottom>
      <ZenModeToggle v-if="showZenModeToggle" />
      <VpCommandPalette v-if="showCommandPalette" />
      <VpLinkPreview v-if="showLinkPreview" />
      <VpPwaStatus v-if="showPwaStatus" />
      <VpShortcutsModal v-if="showKeyboardShortcuts" />
      <VpZenHoverBar v-if="showZenHoverBar" />
    </template>

  </Layout>
</template>
