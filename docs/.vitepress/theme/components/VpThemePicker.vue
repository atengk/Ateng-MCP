<!--
 * 动态主题强调色盘选择器 (VpThemePicker)
 * 支持 4 套高质感品牌色切换、即时响应式换肤与持久化存储
 * @author Ateng
 * @since 2026-09-25
 -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemePalette, THEME_PALETTES, type ThemePaletteId } from '../composables/useThemePalette'

const { currentPalette, setPalette } = useThemePalette()
const isOpen = ref(false)
const pickerRef = ref<HTMLElement | null>(null)

/**
 * 切换下拉面板展开/收起状态
 */
const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

/**
 * 选中并切换目标色盘
 * @param id 色盘标识
 */
const handleSelect = (id: ThemePaletteId) => {
  setPalette(id)
  isOpen.value = false
}

/**
 * 点击外部区域自动收起下拉面板
 */
const handleClickOutside = (e: MouseEvent) => {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div ref="pickerRef" class="vp-theme-picker">
    <!-- 调色盘触发按钮 -->
    <button
      type="button"
      class="picker-btn"
      :class="{ 'is-active': isOpen }"
      title="切换主品牌强调色盘"
      aria-label="切换主品牌强调色盘"
      :aria-expanded="isOpen"
      @click.stop="toggleOpen"
    >
      <span class="btn-icon i-lucide-palette" />
      <span
        class="color-dot"
        :style="{
          backgroundColor: THEME_PALETTES.find(p => p.id === currentPalette)?.color || '#6366f1'
        }"
      />
    </button>

    <!-- 下拉面板 -->
    <Transition name="fade-down">
      <div v-if="isOpen" class="picker-dropdown" @click.stop>
        <div class="dropdown-header">
          <span class="header-icon i-lucide-palette" />
          <span class="header-title">品牌强调色盘</span>
        </div>

        <div class="palette-list">
          <button
            v-for="item in THEME_PALETTES"
            :key="item.id"
            type="button"
            class="palette-item"
            :class="{ selected: currentPalette === item.id }"
            @click="handleSelect(item.id)"
          >
            <span
              class="palette-dot"
              :style="{ backgroundColor: item.color }"
            />
            <div class="palette-info">
              <span class="palette-name">{{ item.name }}</span>
              <span class="palette-desc">{{ item.description }}</span>
            </div>
            <span
              v-if="currentPalette === item.id"
              class="check-icon i-lucide-check"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.vp-theme-picker {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.picker-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.picker-btn:hover,
.picker-btn.is-active {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
  border-color: var(--vp-c-divider);
}

.btn-icon {
  font-size: 1.15rem;
}

.color-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-bg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-icon {
  font-size: 0.95rem;
  color: var(--vp-c-brand-1);
}

.palette-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.palette-item:hover {
  background-color: var(--vp-c-default-soft);
}

.palette-item.selected {
  background-color: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.palette-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.palette-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.palette-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}

.palette-desc {
  font-size: 11px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-icon {
  font-size: 1rem;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* 下拉菜单淡出动画 */
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
