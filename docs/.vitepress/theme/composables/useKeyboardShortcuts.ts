/**
 * 全键盘极客导航与快捷键速查中心 Composable
 * @author Ateng
 * @since 2026-09-25
 */

import { ref } from 'vue'
import { useData } from 'vitepress'

const isShortcutsOpen = ref(false)
let isListenerAttached = false

/**
 * 判断事件目标是否为可编辑文本区域
 * @param event 键盘事件
 * @returns 是否在输入框中
 */
function isEditingContent(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false
  const tagName = target.tagName
  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  )
}

/**
 * 键盘快捷键监听与状态管理 Hook
 */
export function useKeyboardShortcuts() {
  const { isDark } = useData()

  const openShortcuts = () => {
    isShortcutsOpen.value = true
  }

  const closeShortcuts = () => {
    isShortcutsOpen.value = false
  }

  const toggleShortcuts = () => {
    isShortcutsOpen.value = !isShortcutsOpen.value
  }

  /**
   * 单例注册全局键盘监听器
   */
  const attachKeyboardShortcuts = () => {
    if (isListenerAttached || typeof window === 'undefined') return
    isListenerAttached = true

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // 1. 如果用户正在输入框或文本域中输入，坚决不响应单键快捷键，彻底杜绝误触
      if (isEditingContent(event)) return

      // 2. 若速查面板正处于开启状态，Esc、? 或 Shift+/ 触发关闭
      if (isShortcutsOpen.value) {
        if (event.key === 'Escape' || event.key === '?' || (event.key === '/' && event.shiftKey)) {
          event.preventDefault()
          event.stopPropagation()
          closeShortcuts()
        }
        return
      }

      // 3. 呼出快捷键速查面板：? 键或 Shift + /
      const isQuestionMark = event.key === '?' || (event.key === '/' && event.shiftKey)
      if (isQuestionMark && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        event.stopPropagation()
        openShortcuts()
        return
      }

      // 4. 深浅主题切换：T 键（无修饰键）
      if ((event.key === 't' || event.key === 'T') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        isDark.value = !isDark.value
        return
      }

      // 5. 文档正文翻页：J 键（下一篇）、K 键（上一篇）
      if ((event.key === 'j' || event.key === 'J') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const nextLink = document.querySelector('a.pager-link.next') as HTMLAnchorElement | null
        if (nextLink) {
          event.preventDefault()
          nextLink.click()
        }
        return
      }

      if ((event.key === 'k' || event.key === 'K') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const prevLink = document.querySelector('a.pager-link.prev') as HTMLAnchorElement | null
        if (prevLink) {
          event.preventDefault()
          prevLink.click()
        }
        return
      }
    })
  }

  return {
    isShortcutsOpen,
    openShortcuts,
    closeShortcuts,
    toggleShortcuts,
    attachKeyboardShortcuts,
  }
}
