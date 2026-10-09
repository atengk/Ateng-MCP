/**
 * 全局交互命令中心 (Command Palette) 状态控制与快捷键监听 Composable
 * @author Ateng
 * @since 2026-09-25
 */

import { ref, onMounted, onUnmounted } from 'vue'

const isPaletteOpen = ref(false)
let isGlobalListenerAttached = false

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
 * 命令中心状态管理与按键调度 Hook
 */
export function useCommandPalette() {
  /**
   * 打开命令中心
   */
  const open = () => {
    isPaletteOpen.value = true
  }

  /**
   * 关闭命令中心
   */
  const close = () => {
    isPaletteOpen.value = false
  }

  /**
   * 切换命令中心显隐状态
   */
  const toggle = () => {
    isPaletteOpen.value = !isPaletteOpen.value
  }

  /**
   * 注册全局键盘事件与顶栏搜索按钮劫持（单例注册，防重复监听）
   */
  const attachGlobalListeners = () => {
    if (isGlobalListenerAttached || typeof window === 'undefined') return
    isGlobalListenerAttached = true

    // 1. 注册捕获阶段键盘监听，优先截获 Ctrl+K / Cmd+K 与 / 快捷键
    const handleKeyDown = (event: KeyboardEvent) => {
      // 判断 Ctrl+K / Cmd+K
      if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault()
        event.stopImmediatePropagation()
        toggle()
        return
      }

      // 判断未在输入状态下的 / 斜杠键（排除 Shift+/ 组合）
      if (event.key === '/' && !event.shiftKey && !isEditingContent(event)) {
        event.preventDefault()
        event.stopImmediatePropagation()
        open()
        return
      }

      // 判断 Escape 键退出
      if (event.key === 'Escape' && isPaletteOpen.value) {
        event.preventDefault()
        event.stopImmediatePropagation()
        close()
      }
    }

    // 2. 注册捕获阶段全局点击监听，协同劫持 VitePress 默认搜索按钮
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const searchBtn = target.closest('#local-search, .DocSearch-Button, .VPNavBarSearchButton')
      if (searchBtn) {
        event.preventDefault()
        event.stopImmediatePropagation()
        open()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('click', handleClick, true)
  }

  return {
    isOpen: isPaletteOpen,
    open,
    close,
    toggle,
    attachGlobalListeners,
  }
}
