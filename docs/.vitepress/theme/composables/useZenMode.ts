/**
 * 沉浸式专注阅读模式 (Zen Mode) 状态管理与交互 Composable
 * @author Ateng
 * @since 2026-09-25
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const STORAGE_KEY = 'vp-zenith-zen-mode'
const isZenMode = ref(false)
let isGlobalListenerAttached = false

/**
 * 沉浸式阅读管理 Hook
 */
export function useZenMode() {
  const { frontmatter } = useData()

  // 判定当前页面是否为首页（统一以 layout: home 为唯一标准，自动适配多语言与根路径）
  const isHome = computed(() => frontmatter.value?.layout === 'home')

  // 实际生效的专注状态（双状态解耦：用户意向开启且非首页挂起态）
  const isEffectiveZenMode = computed(() => isZenMode.value && !isHome.value)

  /**
   * 应用或更新专注模式偏好与持久化
   * @param value 是否开启沉浸模式
   */
  const applyZenMode = (value: boolean) => {
    isZenMode.value = value
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
  }

  /**
   * 切换沉浸模式状态
   */
  const toggleZenMode = () => {
    // 首页直接静默拦截，不触发任何状态突变
    if (isHome.value) return
    applyZenMode(!isZenMode.value)
  }

  /**
   * 绑定全局唯一的键盘快捷键监听器（单例模式，防止多组件重复触发抵消）
   */
  const ensureGlobalListener = () => {
    if (isGlobalListenerAttached || typeof window === 'undefined') return
    isGlobalListenerAttached = true

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // 1. 忽略输入框与可编辑元素中的按键
      const target = event.target as HTMLElement | null
      if (target && (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable)) {
        return
      }

      // 2. 判断 Alt+Z 或 Alt+F 组合键（双键别名映射，兼顾极客与全屏阅读肌肉记忆）
      const isKeyZ = event.code === 'KeyZ' || event.key === 'z' || event.key === 'Z'
      const isKeyF = event.code === 'KeyF' || event.key === 'f' || event.key === 'F'
      if (event.altKey && (isKeyZ || isKeyF)) {
        event.preventDefault()
        // 首页按键静默忽略
        if (isHome.value) return
        toggleZenMode()
        return
      }

      // 3. 判断 Escape 键退出专注模式（仅在当前实际处于专注生效态且无活动遮罩时响应，首页挂起期间按 Esc 不冲掉偏好）
      if (event.key === 'Escape' && isEffectiveZenMode.value) {
        const hasOverlay = document.querySelector('.command-palette-mask, .vp-shortcuts-overlay, .medium-zoom-overlay') !== null
        if (!hasOverlay) {
          event.preventDefault()
          applyZenMode(false)
        }
      }
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    // 从本地存储读取用户历史偏好（保留在 isZenMode 中，若当前在首页则自动由 isEffectiveZenMode 挂起）
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      isZenMode.value = true
    }

    // 确保单例快捷键事件监听已注册
    ensureGlobalListener()
  })

  // 声明式单向数据流驱动 DOM：根据 isEffectiveZenMode 自动挂载/移除 html.zen-mode 类名
  watch(
    isEffectiveZenMode,
    (effective) => {
      if (typeof window === 'undefined') return
      document.documentElement.classList.toggle('zen-mode', effective)
    },
    { immediate: true }
  )

  return {
    isZenMode,
    isEffectiveZenMode,
    isHome,
    toggleZenMode,
    applyZenMode,
    exitZenMode: () => applyZenMode(false),
  }
}
