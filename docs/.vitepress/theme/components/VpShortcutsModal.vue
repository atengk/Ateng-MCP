<!--
 * 全键盘极客导航与快捷键速查中心浮层组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

export interface VpShortcutsModalProps {
  /**
   * 强制控制速查面板显示（未传则使用全局单例状态）
   */
  visible?: boolean
}

const props = defineProps<VpShortcutsModalProps>()
const { isShortcutsOpen, closeShortcuts } = useKeyboardShortcuts()
const { lang } = useData()

const isOpen = computed(() => {
  if (props.visible !== undefined) return props.visible
  return isShortcutsOpen.value
})

const isEnglish = computed(() => lang.value === 'en-US')

interface ShortcutCategory {
  title: string
  titleEn: string
  icon: string
  items: {
    keys: string[]
    label: string
    labelEn: string
    description?: string
    descriptionEn?: string
  }[]
}

const categories: ShortcutCategory[] = [
  {
    title: '全站导航与控制',
    titleEn: 'Navigation & Controls',
    icon: '🧭',
    items: [
      {
        keys: ['?'],
        label: '呼出 / 关闭快捷键速查中心',
        labelEn: 'Toggle Keyboard Shortcuts Modal',
      },
      {
        keys: ['Ctrl / ⌘', 'K'],
        label: '唤起全局交互命令中心 (或按 /)',
        labelEn: 'Open Command Palette (or press /)',
      },
      {
        keys: ['T'],
        label: '切换深浅外观主题',
        labelEn: 'Toggle Dark / Light Theme',
      },
      {
        keys: ['Alt', 'Z'],
        label: '开启 / 退出沉浸式专注阅读 (亦支持 Alt+F)',
        labelEn: 'Toggle Zen Reading Mode (also Alt+F)',
      },
      {
        keys: ['Ctrl / ⌘', 'P'],
        label: '白皮书级纯净打印当前文档',
        labelEn: 'Print Document to Clean PDF',
      },
      {
        keys: ['Esc'],
        label: '关闭当前弹层 / 退出专注模式',
        labelEn: 'Close Active Modal / Exit Zen Mode',
      },
    ],
  },
  {
    title: '长文连贯阅读',
    titleEn: 'Reading Flow',
    icon: '📖',
    items: [
      {
        keys: ['J'],
        label: '跳转下一篇文章',
        labelEn: 'Next Document',
        description: '自动聚焦并平滑导航至下一章节',
        descriptionEn: 'Navigate smoothly to the next article',
      },
      {
        keys: ['K'],
        label: '跳转上一篇文章',
        labelEn: 'Previous Document',
        description: '自动聚焦并平滑导航至上一章节',
        descriptionEn: 'Navigate smoothly to the previous article',
      },
    ],
  },
  {
    title: '页面内智能交互',
    titleEn: 'Content & Media',
    icon: '✨',
    items: [
      {
        keys: ['Scroll'],
        label: '超长代码自适应滚动',
        labelEn: 'Adaptive Code Scroll',
        description: '超过 35 行代码块平滑内滚动浏览全文，行号绝对对齐',
        descriptionEn: 'Smooth scroll long code blocks with synchronized line numbers',
      },
      {
        keys: ['Click'],
        label: '图片 Medium 级平滑灯箱',
        labelEn: 'Image Zoom Lightbox',
        description: '点击正文图片进入沉浸式缩放视图',
        descriptionEn: 'Click images to inspect details in lightbox',
      },
      {
        keys: ['Hover'],
        label: '站内内链即时悬浮气泡',
        labelEn: 'Internal Link Hover Preview',
        description: '悬停站内文档链接 280ms 预览上下文卡片',
        descriptionEn: 'Hover internal links to preview summary',
      },
    ],
  },
]
</script>

<template>
  <Teleport to="body">
    <Transition name="vp-shortcuts-fade">
      <div
        v-if="isOpen"
        class="vp-shortcuts-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vp-shortcuts-title"
        @click.self="closeShortcuts"
      >
        <Transition name="vp-shortcuts-scale">
          <div v-if="isOpen" class="vp-shortcuts-modal">
            <!-- 头部 -->
            <div class="vp-shortcuts-header">
              <div class="vp-shortcuts-header-main">
                <div class="vp-shortcuts-header-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="8" x2="6" y2="8" />
                    <line x1="10" y1="8" x2="10" y2="8" />
                    <line x1="14" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="8" x2="18" y2="8" />
                    <line x1="6" y1="12" x2="6" y2="12" />
                    <line x1="10" y1="12" x2="10" y2="12" />
                    <line x1="14" y1="12" x2="14" y2="12" />
                    <line x1="18" y1="12" x2="18" y2="12" />
                    <line x1="7" y1="16" x2="17" y2="16" />
                  </svg>
                </div>
                <h3 id="vp-shortcuts-title" class="vp-shortcuts-title">
                  {{ isEnglish ? 'Keyboard Shortcuts' : '键盘快捷键速查' }}
                </h3>
                <span class="vp-shortcuts-tag">
                  {{ isEnglish ? 'Geek Navigation' : '极客导航' }}
                </span>
              </div>

              <button
                class="vp-shortcuts-close"
                type="button"
                :title="isEnglish ? 'Close' : '关闭'"
                :aria-label="isEnglish ? 'Close' : '关闭'"
                @click="closeShortcuts"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <!-- 分组内容 -->
            <div class="vp-shortcuts-content">
              <div v-for="category in categories" :key="category.title" class="vp-shortcuts-group">
                <div class="vp-shortcuts-group-title">
                  <span class="vp-shortcuts-group-icon">{{ category.icon }}</span>
                  <span>{{ isEnglish ? category.titleEn : category.title }}</span>
                </div>

                <div class="vp-shortcuts-list">
                  <div
                    v-for="item in category.items"
                    :key="item.label"
                    class="vp-shortcuts-item"
                  >
                    <div class="vp-shortcuts-item-info">
                      <span class="vp-shortcuts-item-label">
                        {{ isEnglish ? item.labelEn : item.label }}
                      </span>
                      <span
                        v-if="item.description || item.descriptionEn"
                        class="vp-shortcuts-item-desc"
                      >
                        {{ isEnglish ? (item.descriptionEn || item.description) : item.description }}
                      </span>
                    </div>

                    <div class="vp-shortcuts-keys">
                      <template v-for="(k, idx) in item.keys" :key="idx">
                        <kbd class="vp-kbd">{{ k }}</kbd>
                        <span v-if="idx < item.keys.length - 1" class="vp-kbd-plus">+</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部说明栏 -->
            <div class="vp-shortcuts-footer">
              <span class="vp-shortcuts-tip">
                💡 {{ isEnglish ? 'Single-key shortcuts are automatically disabled inside text inputs.' : '在任何输入框获焦时，单键快捷键自动禁用防误触。' }}
              </span>
              <span class="vp-shortcuts-esc-hint">
                {{ isEnglish ? 'Press' : '按' }} <kbd class="vp-kbd-mini">Esc</kbd> {{ isEnglish ? 'to close' : '关闭' }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vp-shortcuts-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.vp-shortcuts-modal {
  width: 100%;
  max-width: 660px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  box-sizing: border-box;
}

.vp-shortcuts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.vp-shortcuts-header-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vp-shortcuts-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1);
}

.vp-shortcuts-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: normal;
}

.vp-shortcuts-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  letter-spacing: normal;
}

.vp-shortcuts-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vp-shortcuts-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.vp-shortcuts-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vp-shortcuts-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: normal;
}

.vp-shortcuts-group-icon {
  font-size: 0.95rem;
}

.vp-shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vp-shortcuts-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  transition: background 0.15s ease;
}

.vp-shortcuts-item:hover {
  background: var(--vp-c-default-soft);
}

.vp-shortcuts-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.vp-shortcuts-item-label {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  letter-spacing: normal;
}

.vp-shortcuts-item-desc {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
  letter-spacing: normal;
}

.vp-shortcuts-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.vp-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 5px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  color: var(--vp-c-text-1);
  letter-spacing: normal;
}

.vp-kbd-plus {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.vp-shortcuts-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.vp-shortcuts-tip {
  letter-spacing: normal;
}

.vp-kbd-mini {
  display: inline-block;
  padding: 0 4px;
  font-size: 0.7rem;
  border-radius: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

/* 过渡动效 */
.vp-shortcuts-fade-enter-active,
.vp-shortcuts-fade-leave-active {
  transition: opacity 0.2s ease;
}

.vp-shortcuts-fade-enter-from,
.vp-shortcuts-fade-leave-to {
  opacity: 0;
}

.vp-shortcuts-scale-enter-active,
.vp-shortcuts-scale-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.vp-shortcuts-scale-enter-from,
.vp-shortcuts-scale-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(10px);
}

@media (max-width: 640px) {
  .vp-shortcuts-modal {
    max-height: 90vh;
  }

  .vp-shortcuts-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .vp-shortcuts-keys {
    align-self: flex-end;
  }

  .vp-shortcuts-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
