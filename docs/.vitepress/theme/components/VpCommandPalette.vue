<!--
 * 全局交互命令中心 (Raycast / Spotlight 风格 Command Palette)
 * 集成快捷动作指令、全局导航与 Minisearch 离线高精度全文检索
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, shallowRef } from 'vue'
import { useData, useRouter } from 'vitepress'
import localSearchIndex from '@localSearchIndex'
import { useCommandPalette } from '../composables/useCommandPalette'
import { useZenMode } from '../composables/useZenMode'
import { useThemePalette } from '../composables/useThemePalette'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

/**
 * 命令中心单项契约接口
 */
export interface PaletteItem {
  id: string
  title: string
  description?: string
  category: 'action' | 'navigation' | 'document'
  icon: string
  shortcut?: string[]
  badge?: string
  perform: () => void | Promise<void>
  keywords?: string[]
}

const { isOpen, close, attachGlobalListeners } = useCommandPalette()
const { isZenMode, toggleZenMode } = useZenMode()
const { currentPalette, setPalette } = useThemePalette()
const { openShortcuts } = useKeyboardShortcuts()
const { isDark, localeIndex, theme, frontmatter } = useData()
const router = useRouter()

// 输入检索词与高亮指针
const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listContainerRef = ref<HTMLElement | null>(null)

// 离线全文检索索引实例与加载状态
const miniSearchInstance = shallowRef<any>(null)
const isSearchLoading = ref(false)

// 操作反馈 Toast 状态
const toastMessage = ref('')
let toastTimer: any = null

/**
 * 触发轻量级操作提示条
 * @param message 提示内容
 */
const showToast = (message: string) => {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}

/**
 * 页面平滑路由跳转
 * @param path 目标路径
 */
const navigate = (path: string) => {
  const target = path.startsWith('/') || path.startsWith('http') ? path : `/${path}`
  router.go(target)
  close()
}

/**
 * 复制当前文档 Markdown 链接
 */
const copyMarkdownLink = async () => {
  if (typeof window === 'undefined') return
  const title = document.title.replace(/\s*\|\s*VitePress Zenith.*$/, '').trim() || '文档链接'
  const text = `[${title}](${window.location.href})`
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制 Markdown 链接至剪贴板')
  } catch {
    showToast('复制失败，请检查浏览器权限')
  }
}

/**
 * 复制当前文档 URL 网址
 */
const copyCurrentUrl = async () => {
  if (typeof window === 'undefined') return
  try {
    await navigator.clipboard.writeText(window.location.href)
    showToast('已复制网页地址至剪贴板')
  } catch {
    showToast('复制失败，请检查浏览器权限')
  }
}

/**
 * 平滑返回文档顶部
 */
const scrollToTop = () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
  close()
}

/**
 * 异步初始化 Minisearch 检索实例
 */
const initMiniSearch = async () => {
  if (miniSearchInstance.value || typeof window === 'undefined') return
  try {
    isSearchLoading.value = true
    const currentLocale = localeIndex.value || 'root'
    const loader = localSearchIndex[currentLocale] || localSearchIndex.root || Object.values(localSearchIndex)[0]
    if (!loader) return

    const rawData = await loader()
    if (!rawData || !rawData.default) return

    const MiniSearch = (await import('minisearch')).default
    miniSearchInstance.value = MiniSearch.loadJSON(rawData.default, {
      fields: ['title', 'titles', 'text'],
      storeFields: ['title', 'titles'],
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        boost: { title: 4, text: 2, titles: 1 },
      },
    })
  } catch {
    // 降级静默容错，不阻断核心动作功能
  } finally {
    isSearchLoading.value = false
  }
}

// 基础快捷动作列表
const staticActions = computed<PaletteItem[]>(() => {
  const isHome = frontmatter.value?.layout === 'home'
  const actions: PaletteItem[] = []

  // 首页自适应隐藏专注阅读指令，正文页正常呈现
  if (!isHome) {
    actions.push({
      id: 'action-zen-mode',
      title: isZenMode.value ? '退出沉浸专注阅读 (Zen Mode)' : '进入沉浸专注阅读 (Zen Mode)',
      description: '彻底隐藏顶栏与双侧边栏，聚焦 1240px 黄金纯净视界',
      category: 'action',
      icon: 'i-lucide-sparkles',
      shortcut: ['Alt', 'Z'],
      badge: '专注阅读',
      keywords: ['zen', 'focus', '阅读', '专注', '全屏', '侧边栏', '沉浸', 'Alt+Z', 'Alt+F'],
      perform: () => {
        toggleZenMode()
        close()
      },
    })
  }

  actions.push(
  {
    id: 'action-toggle-theme',
    title: isDark.value ? '切换为浅色主题 (Light Mode)' : '切换为深色主题 (Dark Mode)',
    description: '切换全站明暗模式外观风格',
    category: 'action',
    icon: isDark.value ? 'i-lucide-sun' : 'i-lucide-moon',
    shortcut: ['Theme'],
    badge: '外观偏好',
    keywords: ['theme', 'dark', 'light', '深色', '浅色', '主题', '黑夜', '白天'],
    perform: () => {
      isDark.value = !isDark.value
      close()
    },
  },
  {
    id: 'action-copy-md',
    title: '复制当前页 Markdown 引用链接',
    description: '格式化为 [页面标题](URL) 快速分享引用',
    category: 'action',
    icon: 'i-lucide-file-text',
    shortcut: ['Copy MD'],
    badge: '分享',
    keywords: ['copy', 'markdown', 'link', '复制', '链接', '引用'],
    perform: copyMarkdownLink,
  },
  {
    id: 'action-copy-url',
    title: '复制当前页网址 (URL)',
    description: '快速将当前网页完整地址复制至剪贴板',
    category: 'action',
    icon: 'i-lucide-link',
    shortcut: ['Copy URL'],
    badge: '分享',
    keywords: ['copy', 'url', 'link', '网址', '地址', '链接'],
    perform: copyCurrentUrl,
  },
  {
    id: 'action-scroll-top',
    title: '返回页面顶部',
    description: '平滑滚动到当前文档的最上方',
    category: 'action',
    icon: 'i-lucide-arrow-up',
    shortcut: ['Top'],
    badge: '视图',
    keywords: ['top', 'scroll', '置顶', '顶部', '回到顶部'],
    perform: scrollToTop,
  },
  {
    id: 'action-print-doc',
    title: '打印当前文档 / 导出 PDF (Print to PDF)',
    description: '自动净化页面辅助浮层与导航，输出排版规整的白皮书级文档',
    category: 'action',
    icon: 'i-lucide-printer',
    shortcut: ['Ctrl', 'P'],
    badge: '文档工具',
    keywords: ['print', 'pdf', '打印', '导出', '白皮书', '排版'],
    perform: () => {
      close()
      setTimeout(() => {
        if (typeof window !== 'undefined') window.print()
      }, 150)
    },
  },
  {
    id: 'action-shortcuts-modal',
    title: '键盘快捷键速查中心 (Keyboard Shortcuts)',
    description: '系统化查看全站全键盘极客导航与控制按键',
    category: 'action',
    icon: 'i-lucide-keyboard',
    shortcut: ['?'],
    badge: '速查',
    keywords: ['shortcuts', 'keyboard', 'cheat', 'sheet', '快捷键', '按键', '速查', 'geek'],
    perform: () => {
      close()
      setTimeout(() => {
        openShortcuts()
      }, 100)
    },
  },
  {
    id: 'action-palette-indigo',
    title: '强调色盘：经典紫蓝 (Indigo)',
    description: '切换至理性与深邃的现代科技质感主色',
    category: 'action',
    icon: 'i-lucide-palette',
    badge: currentPalette.value === 'indigo' ? '当前生效' : '色盘',
    keywords: ['indigo', 'palette', 'color', 'purple', 'blue', '紫蓝', '科技', '强调色', '换肤'],
    perform: () => {
      setPalette('indigo')
      showToast('已切换至「经典紫蓝」强调色')
      close()
    },
  },
  {
    id: 'action-palette-emerald',
    title: '强调色盘：极客翠绿 (Emerald)',
    description: '切换至清爽通透的极客开源活力主色',
    category: 'action',
    icon: 'i-lucide-palette',
    badge: currentPalette.value === 'emerald' ? '当前生效' : '色盘',
    keywords: ['emerald', 'green', 'palette', 'color', '翠绿', '绿色', '极客', '开源', '强调色', '换肤'],
    perform: () => {
      setPalette('emerald')
      showToast('已切换至「极客翠绿」强调色')
      close()
    },
  },
  {
    id: 'action-palette-rose',
    title: '强调色盘：潮流蔷薇 (Rose)',
    description: '切换至热烈敏锐的新锐设计美学主色',
    category: 'action',
    icon: 'i-lucide-palette',
    badge: currentPalette.value === 'rose' ? '当前生效' : '色盘',
    keywords: ['rose', 'pink', 'red', 'palette', 'color', '蔷薇', '粉红', '玫瑰', '潮流', '强调色', '换肤'],
    perform: () => {
      setPalette('rose')
      showToast('已切换至「潮流蔷薇」强调色')
      close()
    },
  },
  {
    id: 'action-palette-amber',
    title: '强调色盘：典雅琥珀 (Amber)',
    description: '切换至沉稳温润的知识智识质地主色',
    category: 'action',
    icon: 'i-lucide-palette',
    badge: currentPalette.value === 'amber' ? '当前生效' : '色盘',
    keywords: ['amber', 'orange', 'yellow', 'palette', 'color', '琥珀', '橙色', '黄色', '典雅', '强调色', '换肤'],
    perform: () => {
      setPalette('amber')
      showToast('已切换至「典雅琥珀」强调色')
      close()
    },
  })

  return actions
})

// 全站核心导航列表（解耦硬编码演示文章，完全交由 Minisearch 动态检索驱动）
const navigationItems = computed<PaletteItem[]>(() => {
  const items: PaletteItem[] = [
    {
      id: 'nav-home',
      title: '首页 (Landing Page)',
      description: '回到全站门户门面主页',
      category: 'navigation',
      icon: 'i-lucide-compass',
      badge: '门户',
      keywords: ['home', 'index', '首页', '门面'],
      perform: () => navigate('/'),
    },
    {
      id: 'nav-components-overview',
      title: '交互短代码组件库总览',
      description: '查看全套免 import 短代码组件与语法参考手册',
      category: 'navigation',
      icon: 'i-lucide-box',
      badge: '组件库',
      keywords: ['components', 'overview', '组件', '短代码', '手册'],
      perform: () => navigate('/components/overview'),
    },
  ]

  // 若全局开关开启了博客，安全动态追加博客专栏入口
  if (theme.value.zenith?.blog) {
    items.push({
      id: 'nav-blog',
      title: '专栏: 团队技术博客与演进动态',
      description: '时间轴归档、多维分类、标签墙与博文矩阵',
      category: 'navigation',
      icon: 'i-lucide-newspaper',
      badge: '博客',
      keywords: ['blog', 'posts', '博客', '文章', '动态'],
      perform: () => navigate('/blog/'),
    })
  }

  // 动态读取当前配置中的 GitHub 社交仓库地址
  const githubLink = (theme.value.socialLinks || []).find((s: any) => s.icon === 'github')?.link
  if (githubLink) {
    items.push({
      id: 'nav-github',
      title: '开源仓库 (GitHub)',
      description: '在 GitHub 查看源码、Star 支持或提交 Issue',
      category: 'navigation',
      icon: 'i-lucide-github',
      shortcut: ['Repo ↗'],
      badge: '社区',
      keywords: ['github', 'repo', 'open source', '开源', '仓库'],
      perform: () => {
        if (typeof window !== 'undefined') {
          window.open(githubLink, '_blank')
        }
        close()
      },
    })
  }

  return items
})

// 动态检索文档结果
const documentResults = ref<PaletteItem[]>([])

// 综合搜索计算：联动 Actions、Navigation 与 Minisearch 离线检索
watch(
  [searchQuery, miniSearchInstance],
  async ([query, searcher]) => {
    const q = query.trim().toLowerCase()
    if (!q || !searcher) {
      documentResults.value = []
      return
    }

    try {
      const hits = searcher.search(q).slice(0, 8)
      documentResults.value = hits.map((hit: any) => {
        const titles = Array.isArray(hit.titles) && hit.titles.length > 0 ? hit.titles : []
        const breadcrumb = titles.length > 0 ? titles.join(' › ') : hit.id
        return {
          id: `doc-${hit.id}`,
          title: hit.title || hit.id,
          description: breadcrumb,
          category: 'document',
          icon: 'i-lucide-file-text',
          badge: '文档',
          perform: () => navigate(hit.id),
        }
      })
    } catch {
      documentResults.value = []
    }
  },
  { immediate: true }
)

// 动作与导航筛选（基于标题、描述或关键词匹配）
const filteredActions = computed<PaletteItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return staticActions.value
  return staticActions.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)))
    )
  })
})

const filteredNavigations = computed<PaletteItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return navigationItems.value
  return navigationItems.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)))
    )
  })
})

// 平铺所有可被键盘选中的项目（按动作 -> 搜索结果 -> 导航排序）
const allSelectableItems = computed<PaletteItem[]>(() => {
  return [
    ...filteredActions.value,
    ...documentResults.value,
    ...filteredNavigations.value,
  ]
})

// 滚动选中的项至可视区域
const scrollToSelectedItem = () => {
  nextTick(() => {
    const selectedEl = listContainerRef.value?.querySelector('.command-item.is-selected') as HTMLElement | null
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  })
}

// 当可选项发生变化时，将光标指针安全重置在合法区间
watch(
  allSelectableItems,
  (items) => {
    if (items.length === 0) {
      selectedIndex.value = 0
    } else if (selectedIndex.value >= items.length) {
      selectedIndex.value = items.length - 1
    }
    scrollToSelectedItem()
  },
  { immediate: true }
)

// 键盘无障碍事件处理
const handleKeyNavigation = (event: KeyboardEvent) => {
  if (allSelectableItems.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % allSelectableItems.value.length
    scrollToSelectedItem()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + allSelectableItems.value.length) % allSelectableItems.value.length
    scrollToSelectedItem()
  } else if (event.key === 'Enter') {
    if (event.isComposing) return
    event.preventDefault()
    const target = allSelectableItems.value[selectedIndex.value]
    if (target) {
      target.perform()
    }
  }
}

// 弹窗显隐控制与初始化
watch(isOpen, (open) => {
  if (open) {
    searchQuery.value = ''
    selectedIndex.value = 0
    initMiniSearch()
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

onMounted(() => {
  attachGlobalListeners()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div
        v-if="isOpen"
        class="command-palette-mask"
        @click.self="close"
        @keydown="handleKeyNavigation"
      >
        <div class="command-palette-dialog" role="dialog" aria-modal="true" aria-label="交互命令中心">
          <!-- 顶部搜索检索输入栏 -->
          <div class="palette-input-bar">
            <span class="palette-search-icon i-lucide-search" aria-hidden="true" />
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              class="palette-input"
              placeholder="键入指令或搜索全站文档... (输入关键词过滤)"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              v-if="searchQuery"
              class="palette-clear-btn"
              title="清空输入"
              @click="searchQuery = ''; inputRef?.focus()"
            >
              <span class="i-lucide-x" />
            </button>
            <kbd class="palette-esc-badge" @click="close">ESC</kbd>
          </div>

          <!-- 列表展示区 -->
          <div ref="listContainerRef" class="palette-list-container">
            <!-- 空状态 -->
            <div v-if="allSelectableItems.length === 0" class="palette-empty-state">
              <span class="palette-empty-icon i-lucide-search-x" />
              <p class="palette-empty-text">未找到与 "{{ searchQuery }}" 相关的快捷指令或文档</p>
              <span class="palette-empty-hint">请尝试调整关键词或使用拼音分词检索</span>
            </div>

            <!-- 快捷动作分组 -->
            <div v-if="filteredActions.length > 0" class="palette-group">
              <div class="palette-group-title">
                <span>快捷动作 (Actions)</span>
                <span class="group-count">{{ filteredActions.length }}</span>
              </div>
              <div
                v-for="item in filteredActions"
                :key="item.id"
                class="command-item"
                :class="{ 'is-selected': allSelectableItems[selectedIndex]?.id === item.id }"
                @click="item.perform()"
                @mouseenter="selectedIndex = allSelectableItems.findIndex(i => i.id === item.id)"
              >
                <div class="item-icon-wrapper">
                  <span :class="item.icon" class="item-icon" />
                </div>
                <div class="item-content">
                  <div class="item-header">
                    <span class="item-title">{{ item.title }}</span>
                    <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
                  </div>
                  <span v-if="item.description" class="item-desc">{{ item.description }}</span>
                </div>
                <div v-if="item.shortcut && item.shortcut.length > 0" class="item-shortcut">
                  <kbd v-for="key in item.shortcut" :key="key" class="shortcut-key">{{ key }}</kbd>
                </div>
                <span class="item-enter-hint i-lucide-corner-down-left" />
              </div>
            </div>

            <!-- 离线全文检索结果分组 -->
            <div v-if="documentResults.length > 0" class="palette-group">
              <div class="palette-group-title">
                <span>文档搜索 (Documentation)</span>
                <span class="group-count">{{ documentResults.length }}</span>
              </div>
              <div
                v-for="item in documentResults"
                :key="item.id"
                class="command-item"
                :class="{ 'is-selected': allSelectableItems[selectedIndex]?.id === item.id }"
                @click="item.perform()"
                @mouseenter="selectedIndex = allSelectableItems.findIndex(i => i.id === item.id)"
              >
                <div class="item-icon-wrapper doc-icon">
                  <span :class="item.icon" class="item-icon" />
                </div>
                <div class="item-content">
                  <div class="item-header">
                    <span class="item-title">{{ item.title }}</span>
                    <span class="item-badge doc-badge">{{ item.badge }}</span>
                  </div>
                  <span v-if="item.description" class="item-desc">{{ item.description }}</span>
                </div>
                <span class="item-enter-hint i-lucide-corner-down-left" />
              </div>
            </div>

            <!-- 核心导航分组 -->
            <div v-if="filteredNavigations.length > 0" class="palette-group">
              <div class="palette-group-title">
                <span>页面导航 (Navigation)</span>
                <span class="group-count">{{ filteredNavigations.length }}</span>
              </div>
              <div
                v-for="item in filteredNavigations"
                :key="item.id"
                class="command-item"
                :class="{ 'is-selected': allSelectableItems[selectedIndex]?.id === item.id }"
                @click="item.perform()"
                @mouseenter="selectedIndex = allSelectableItems.findIndex(i => i.id === item.id)"
              >
                <div class="item-icon-wrapper nav-icon">
                  <span :class="item.icon" class="item-icon" />
                </div>
                <div class="item-content">
                  <div class="item-header">
                    <span class="item-title">{{ item.title }}</span>
                    <span v-if="item.badge" class="item-badge nav-badge">{{ item.badge }}</span>
                  </div>
                  <span v-if="item.description" class="item-desc">{{ item.description }}</span>
                </div>
                <div v-if="item.shortcut && item.shortcut.length > 0" class="item-shortcut">
                  <kbd v-for="key in item.shortcut" :key="key" class="shortcut-key">{{ key }}</kbd>
                </div>
                <span class="item-enter-hint i-lucide-corner-down-left" />
              </div>
            </div>
          </div>

          <!-- 底部快捷提示栏与状态条 -->
          <div class="palette-footer">
            <div class="footer-shortcuts">
              <span class="shortcut-tip">
                <kbd class="mini-kbd">↑</kbd>
                <kbd class="mini-kbd">↓</kbd>
                <span>切换</span>
              </span>
              <span class="shortcut-tip">
                <kbd class="mini-kbd">↵</kbd>
                <span>执行</span>
              </span>
              <span class="shortcut-tip">
                <kbd class="mini-kbd">ESC</kbd>
                <span>退出</span>
              </span>
            </div>
            <div class="footer-meta">
              <span class="meta-label">VitePress Zenith Command Center</span>
            </div>
          </div>

          <!-- 操作成功轻量浮层 Toast -->
          <Transition name="toast-pop">
            <div v-if="toastMessage" class="palette-toast">
              <span class="toast-icon i-lucide-check-circle" />
              <span class="toast-text">{{ toastMessage }}</span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-palette-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 16px 24px;
}

.command-palette-dialog {
  position: relative;
  width: 100%;
  max-width: 660px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 75vh;
}

.palette-input-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
}

.palette-search-icon {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.05rem;
  color: var(--vp-c-text-1);
  font-family: inherit;
}

.palette-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.95rem;
}

.palette-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.palette-clear-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.palette-esc-badge {
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  font-family: inherit;
}

.palette-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  overscroll-behavior: contain;
}

.palette-list-container::-webkit-scrollbar {
  width: 6px;
}
.palette-list-container::-webkit-scrollbar-thumb {
  background-color: var(--vp-c-divider);
  border-radius: 3px;
}

.palette-group {
  margin-bottom: 12px;
}

.palette-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
}

.group-count {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-3);
}

.command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  border: 1px solid transparent;
  margin-bottom: 2px;
}

.command-item:hover,
.command-item.is-selected {
  background-color: var(--vp-c-default-soft);
  border-color: var(--vp-c-divider);
}

.command-item.is-selected {
  background-color: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.25);
}

.item-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  font-size: 1.15rem;
}

.item-icon-wrapper.doc-icon {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.item-icon-wrapper.nav-icon {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.command-item.is-selected .item-title {
  color: var(--vp-c-brand-1);
}

.item-badge {
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: rgba(99, 102, 241, 0.12);
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.item-badge.doc-badge {
  background-color: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.item-badge.nav-badge {
  background-color: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.item-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.item-shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.shortcut-key {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-family: inherit;
}

.item-enter-hint {
  font-size: 0.95rem;
  color: var(--vp-c-brand-1);
  opacity: 0;
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.command-item.is-selected .item-enter-hint {
  opacity: 1;
}

.palette-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.palette-empty-icon {
  font-size: 2.2rem;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

.palette-empty-text {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.palette-empty-hint {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.palette-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-top: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.footer-shortcuts {
  display: flex;
  align-items: center;
  gap: 14px;
}

.shortcut-tip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-kbd {
  font-size: 0.68rem;
  padding: 1px 5px;
  border-radius: 3px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-family: inherit;
}

.footer-meta {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

.palette-toast {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background-color: #0f172a;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  font-size: 0.84rem;
  font-weight: 500;
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  z-index: 1010;
  white-space: nowrap;
}

:global(.dark) .palette-toast {
  background-color: #1e293b;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.6);
}

.toast-icon {
  font-size: 1.05rem;
  color: #10b981;
  flex-shrink: 0;
}

.toast-text {
  color: #ffffff !important;
  line-height: 1.2;
}

/* 动效过渡 */
.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.2s ease;
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}

.palette-fade-enter-active .command-palette-dialog {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.palette-fade-enter-from .command-palette-dialog {
  transform: scale(0.96) translateY(-8px);
  opacity: 0;
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: all 0.2s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@media (max-width: 640px) {
  .command-palette-mask {
    padding: 24px 12px;
  }
  .command-palette-dialog {
    max-height: 88vh;
  }
  .footer-meta {
    display: none;
  }
}
</style>
