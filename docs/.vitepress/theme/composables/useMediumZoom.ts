/**
 * Medium-zoom 正文插图灯箱平滑缩放 Hook
 * @author Ateng
 * @since 2026-09-25
 */

import mediumZoom, { type Zoom } from 'medium-zoom'
import { onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'

let zoomInstance: Zoom | null = null

/**
 * 绑定正文图片点击放大灯箱
 */
export function useMediumZoom() {
  const route = useRoute()

  const updateZoom = () => {
    if (typeof window === 'undefined') return

    nextTick(() => {
      // 销毁旧实例并为当前页面重新挂载
      if (zoomInstance) {
        zoomInstance.detach()
      }

      // 绑定正文图片，排除无缩放标记与小图标
      zoomInstance = mediumZoom('.vp-doc img:not(.no-zoom):not(.logo)', {
        background: 'var(--vp-c-bg)',
        margin: 24,
      })
    })
  }

  onMounted(updateZoom)

  watch(() => route.path, updateZoom)

  onUnmounted(() => {
    if (zoomInstance) {
      zoomInstance.detach()
      zoomInstance = null
    }
  })
}
