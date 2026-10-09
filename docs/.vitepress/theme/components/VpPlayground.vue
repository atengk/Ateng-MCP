<!--
 * 独立在线交互沙箱启动卡片组件 (VpPlayground)
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * 沙箱工程标题
     * @default '组件交互沙箱'
     */
    title?: string
    /**
     * 沙箱工程补充说明
     */
    desc?: string
    /**
     * 演示源码文本
     */
    code: string
    /**
     * 徽标文案
     * @default 'WebContainer'
     */
    badge?: string
    /**
     * 启动按钮文案
     * @default '在 StackBlitz 试跑'
     */
    buttonText?: string
  }>(),
  {
    title: '组件交互沙箱',
    badge: 'WebContainer',
    buttonText: '在 StackBlitz 试跑',
  }
)

const isLoading = ref(false)

const launchSandbox = async () => {
  if (isLoading.value || !props.code) return
  isLoading.value = true
  try {
    const { openInStackBlitz } = await import('../utils/stackblitz')
    await openInStackBlitz({
      title: props.title,
      description: props.desc,
      code: props.code,
    })
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="vp-playground-card">
    <div class="vp-playground-header">
      <div class="vp-playground-info">
        <div class="vp-playground-title-row">
          <span class="vp-playground-title">{{ title }}</span>
          <span v-if="badge" class="vp-playground-badge">{{ badge }}</span>
        </div>
        <p v-if="desc" class="vp-playground-desc">{{ desc }}</p>
      </div>

      <button
        type="button"
        class="vp-playground-launch-btn"
        :class="{ loading: isLoading }"
        :disabled="isLoading"
        title="在新窗口通过 WebContainer 打开此沙箱工程"
        @click="launchSandbox"
      >
        <span v-if="isLoading" class="i-lucide-loader-2 vp-playground-btn-icon spin" />
        <span v-else class="i-lucide-zap vp-playground-btn-icon bolt" />
        <span>{{ isLoading ? '正在初始化虚拟机...' : buttonText }}</span>
      </button>
    </div>

    <!-- 源码预览区域 -->
    <div class="vp-playground-code-stage">
      <pre class="vp-playground-code"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.vp-playground-card {
  margin: 20px 0;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv, #ffffff);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.25s ease;
}

.vp-playground-card:hover {
  border-color: var(--vp-c-brand-soft, rgba(99, 102, 241, 0.3));
}

.vp-playground-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.vp-playground-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vp-playground-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vp-playground-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.vp-playground-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 9999px;
  background: var(--vp-c-brand-soft, rgba(99, 102, 241, 0.12));
  color: var(--vp-c-brand-dark, #4f46e5);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.vp-playground-desc {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.vp-playground-launch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: var(--vp-c-brand, #6366f1);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
}

.vp-playground-launch-btn:hover {
  background: var(--vp-c-brand-dark, #4f46e5);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.35);
  transform: translateY(-1px);
}

.vp-playground-launch-btn:active {
  transform: translateY(0);
}

.vp-playground-launch-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.vp-playground-btn-icon {
  font-size: 15px;
}

.vp-playground-btn-icon.bolt {
  color: #fbbf24;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

.vp-playground-code-stage {
  background: var(--vp-code-block-bg);
  max-height: 280px;
  overflow-y: auto;
}

.vp-playground-code {
  margin: 0;
  padding: 16px 20px;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  background: transparent;
}

@media (max-width: 640px) {
  .vp-playground-header {
    flex-direction: column;
    align-items: stretch;
  }

  .vp-playground-launch-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
