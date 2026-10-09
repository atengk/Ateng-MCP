/**
 * 代码块自适应与行号健康维护 Composable
 * 确保代码块行号对齐与长代码顺畅滚动，避免侵入性遮罩干扰
 * @author Ateng
 * @since 2026-09-25
 */

import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

/**
 * 挂载代码块自适应与健康监控 Hook
 */
export function useCodeFolding() {
  const route = useRoute()
  let observer: MutationObserver | null = null

  /**
   * 扫描并校验页面内所有代码块的行号完整性
   */
  const scanAndSyncCodeBlocks = () => {
    if (typeof window === 'undefined') return

    const codeBlocks = document.querySelectorAll<HTMLElement>('.vp-doc div[class*="language-"]')
    codeBlocks.forEach((block) => {
      // 1. 统计当前代码块总行数
      const lineNumbers = block.querySelectorAll('.line-numbers-wrapper .line-number')
      const codeElement = block.querySelector('pre > code')
      const textLines = (codeElement?.textContent || '').trim().split('\n').length
      const codeLines = block.querySelectorAll('pre > code .line').length

      const lineCount = Math.max(lineNumbers.length, codeLines, textLines)

      // 2. 防御性自动修复：若代码块包含行号容器但行号数量不足（如被插件截断），动态补齐缺失行号
      const wrapper = block.querySelector('.line-numbers-wrapper')
      if (wrapper && lineNumbers.length < lineCount) {
        let startNum = 1
        const firstNum = lineNumbers[0]?.textContent
        if (firstNum && !isNaN(Number(firstNum))) {
          startNum = Number(firstNum)
        }
        let html = ''
        for (let i = 0; i < lineCount; i++) {
          html += `<span class="line-number">${startNum + i}</span><br>`
        }
        wrapper.innerHTML = html
      }
    })
  }

  onMounted(() => {
    nextTick(() => {
      scanAndSyncCodeBlocks()

      // 观察异步或动态渲染的 DOM 变化
      const docEl = document.querySelector('.vp-doc')
      if (docEl && typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => {
          scanAndSyncCodeBlocks()
        })
        observer.observe(docEl, { childList: true, subtree: true })
      }
    })
  })

  watch(
    () => route.path,
    () => {
      nextTick(() => {
        scanAndSyncCodeBlocks()
      })
    }
  )

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })
}
