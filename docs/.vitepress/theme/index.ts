/**
 * VitePress 默认主题扩展入口
 * @author Ateng
 * @since 2026-09-25
 */

import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import Layout from './Layout.vue'
import PackageManagerTabs from './components/PackageManagerTabs.vue'
import Mermaid from './components/Mermaid.vue'
import Markmap from './components/Markmap.vue'
import VpCard from './components/VpCard.vue'
import VpCardGrid from './components/VpCardGrid.vue'
import VpBadge from './components/VpBadge.vue'
import VpTimeline from './components/VpTimeline.vue'
import VpTimelineItem from './components/VpTimelineItem.vue'
import VpLinkCard from './components/VpLinkCard.vue'
import VpDemoPreview from './components/VpDemoPreview.vue'
import VpBanner from './components/VpBanner.vue'
import VpLegacyBanner from './components/VpLegacyBanner.vue'
import VpHelpful from './components/VpHelpful.vue'
import VpBlogList from './components/VpBlogList.vue'
import VpCommandPalette from './components/VpCommandPalette.vue'
import VpComments from './components/VpComments.vue'
import VpThemePicker from './components/VpThemePicker.vue'
import VpLinkPreview from './components/VpLinkPreview.vue'
import VpApiTable from './components/VpApiTable.vue'
import VpApiItem from './components/VpApiItem.vue'
import VpPlayground from './components/VpPlayground.vue'
import VpShortcutsModal from './components/VpShortcutsModal.vue'
import VpContributors from './components/VpContributors.vue'
import VpImage from './components/VpImage.vue'
import VpVideo from './components/VpVideo.vue'
import VpBilibili from './components/VpBilibili.vue'
import VpYouTube from './components/VpYouTube.vue'
import { useCommandPalette } from './composables/useCommandPalette'
import { useCodeFolding } from './composables/useCodeFolding'
import { useThemePalette } from './composables/useThemePalette'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useZenMode } from './composables/useZenMode'
import 'virtual:uno.css'
import './styles/vars.css'
import './styles/custom.css'
import './styles/palette.css'
import './styles/print.css'
import './styles/zen-mode.css'
import './styles/code-folding.css'
import '@shikijs/vitepress-twoslash/style.css'

export { useCommandPalette, useCodeFolding, useThemePalette, useKeyboardShortcuts, useZenMode }

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    // 兼容垫片：修复 @shikijs/vitepress-twoslash 对 floating-vue@5.4+ 的内部猴子补丁报错
    const origComponent = app.component
    app.component = function (name: string, ...rest: any[]) {
      if (name === 'VMenu' && rest[0] && !rest[0].components) {
        rest[0].components = {
          Popper: {
            extends: {
              methods: {
                show: () => {},
                hide: () => {},
              },
            },
          },
        }
      }
      return (origComponent as any).call(this, name, ...rest)
    }
    app.use(TwoslashFloatingVue)
    app.component = origComponent
    app.component('PackageManagerTabs', PackageManagerTabs)
    app.component('PackageTabs', PackageManagerTabs)
    app.component('Mermaid', Mermaid)
    app.component('Markmap', Markmap)
    app.component('VpCard', VpCard)
    app.component('VpCardGrid', VpCardGrid)
    app.component('VpBadge', VpBadge)
    app.component('VpTimeline', VpTimeline)
    app.component('VpTimelineItem', VpTimelineItem)
    app.component('VpLinkCard', VpLinkCard)
    app.component('VpDemoPreview', VpDemoPreview)
    app.component('VpBanner', VpBanner)
    app.component('VpLegacyBanner', VpLegacyBanner)
    app.component('VpHelpful', VpHelpful)
    app.component('VpBlogList', VpBlogList)
    app.component('VpCommandPalette', VpCommandPalette)
    app.component('VpComments', VpComments)
    app.component('VpThemePicker', VpThemePicker)
    app.component('VpLinkPreview', VpLinkPreview)
    app.component('VpApiTable', VpApiTable)
    app.component('VpApiItem', VpApiItem)
    app.component('VpPlayground', VpPlayground)
    app.component('VpShortcutsModal', VpShortcutsModal)
    app.component('VpContributors', VpContributors)
    app.component('VpImage', VpImage)
    app.component('VpVideo', VpVideo)
    app.component('VpBilibili', VpBilibili)
    app.component('VpYouTube', VpYouTube)
  },
} satisfies Theme


