/**
 * 动态主题强调色盘状态机 Composable
 * 支持 4 套高质感品牌色切换、DOM 变量注入与 localStorage 记忆持久化
 * @author Ateng
 * @since 2026-09-25
 */

import { ref, onMounted } from 'vue'

export type ThemePaletteId = 'indigo' | 'emerald' | 'rose' | 'amber'

export interface ThemePalette {
  id: ThemePaletteId
  name: string
  color: string
  darkColor: string
  description: string
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'indigo',
    name: '经典紫蓝',
    color: '#6366f1',
    darkColor: '#818cf8',
    description: '理性与深邃的现代科技质感',
  },
  {
    id: 'emerald',
    name: '极客翠绿',
    color: '#10b981',
    darkColor: '#34d399',
    description: '清爽通透的极客开源活力',
  },
  {
    id: 'rose',
    name: '潮流蔷薇',
    color: '#f43f5e',
    darkColor: '#fb7185',
    description: '热烈敏锐的新锐设计美学',
  },
  {
    id: 'amber',
    name: '典雅琥珀',
    color: '#d97706',
    darkColor: '#fbbf24',
    description: '沉稳温润的知识智识质地',
  },
]

const STORAGE_KEY = 'zenith-theme-palette'
const DEFAULT_PALETTE: ThemePaletteId = 'indigo'

// 全局单例响应式色盘状态
const currentPalette = ref<ThemePaletteId>(DEFAULT_PALETTE)
let isInitialized = false

/**
 * 获取与操控全局强调色盘 Hook
 */
export function useThemePalette() {
  /**
   * 应用指定的色盘方案到根节点
   * @param id 目标色盘标识
   */
  const setPalette = (id: ThemePaletteId) => {
    currentPalette.value = id
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, id)
      } catch (e) {
        // 本地存储异常静默兜底
      }

      if (id === DEFAULT_PALETTE) {
        delete document.documentElement.dataset.themePalette
      } else {
        document.documentElement.dataset.themePalette = id
      }
    }
  }

  /**
   * 初始化色盘配置（从持久化存储或默认值装配）
   */
  const initPalette = () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemePaletteId | null
      if (saved && THEME_PALETTES.some((p) => p.id === saved)) {
        setPalette(saved)
      } else {
        setPalette(DEFAULT_PALETTE)
      }
    } catch (e) {
      setPalette(DEFAULT_PALETTE)
    }
  }

  onMounted(() => {
    if (!isInitialized) {
      initPalette()
      isInitialized = true
    }
  })

  return {
    palettes: THEME_PALETTES,
    currentPalette,
    setPalette,
    initPalette,
  }
}
