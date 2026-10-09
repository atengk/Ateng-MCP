<!--
 * 文档有用度交互反馈组件（👍 有帮助 / 👎 需要改进）
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

// 当前页面用户的投票状态: null | 'yes' | 'no'
const votedState = ref<'yes' | 'no' | null>(null)

/**
 * 读取当前页面的本地投票状态
 */
function syncVoteState() {
  if (typeof window === 'undefined') return
  try {
    const key = `vp-helpful-voted:${route.path}`
    const saved = localStorage.getItem(key)
    if (saved === 'yes' || saved === 'no') {
      votedState.value = saved
    } else {
      votedState.value = null
    }
  } catch {
    votedState.value = null
  }
}

// 页面路由变化时同步状态
watch(
  () => route.path,
  () => {
    syncVoteState()
  }
)

onMounted(() => {
  syncVoteState()
})

/**
 * 记录用户反馈并持久化
 * @param type 反馈类型
 */
function vote(type: 'yes' | 'no') {
  votedState.value = type
  if (typeof window !== 'undefined') {
    try {
      const key = `vp-helpful-voted:${route.path}`
      localStorage.setItem(key, type)
    } catch {
      // 容错处理
    }
  }
}
</script>

<template>
  <div class="vp-helpful-container">
    <div class="vp-helpful-card">
      <Transition name="vp-helpful-switch" mode="out-in">
        <!-- 未反馈状态：显示按钮 -->
        <div v-if="!votedState" class="vp-helpful-prompt" key="prompt">
          <span class="vp-helpful-label">本文对您是否有帮助？</span>
          <div class="vp-helpful-actions">
            <button
              class="vp-helpful-btn vp-btn-yes"
              type="button"
              @click="vote('yes')"
            >
              <span class="vp-helpful-emoji">👍</span>
              <span>有帮助</span>
            </button>
            <button
              class="vp-helpful-btn vp-btn-no"
              type="button"
              @click="vote('no')"
            >
              <span class="vp-helpful-emoji">👎</span>
              <span>需改进</span>
            </button>
          </div>
        </div>

        <!-- 已反馈状态：展示感谢提示 -->
        <div v-else class="vp-helpful-thanks" key="thanks">
          <span class="vp-thanks-icon">🎉</span>
          <div class="vp-thanks-text">
            <p class="vp-thanks-title">感谢您的宝贵反馈！</p>
            <p class="vp-thanks-sub">
              {{
                votedState === 'yes'
                  ? '很高兴能帮到您，祝您编码愉快！'
                  : '我们会持续优化内容，期待未来能带来更好的体验。'
              }}
            </p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.vp-helpful-container {
  margin: 32px 0 20px;
  display: flex;
  justify-content: center;
}

.vp-helpful-card {
  width: 100%;
  max-width: 560px;
  padding: 16px 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s ease;
}

.vp-helpful-card:hover {
  border-color: var(--vp-c-brand-soft);
}

.vp-helpful-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.vp-helpful-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.vp-helpful-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vp-helpful-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vp-helpful-emoji {
  font-size: 1rem;
}

.vp-btn-yes:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transform: translateY(-1px);
}

.vp-btn-no:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  transform: translateY(-1px);
}

/* 感谢气泡 */
.vp-helpful-thanks {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.vp-thanks-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.vp-thanks-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.vp-thanks-sub {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 2px 0 0;
}

/* 切换过渡 */
.vp-helpful-switch-enter-active,
.vp-helpful-switch-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.vp-helpful-switch-enter-from,
.vp-helpful-switch-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (max-width: 520px) {
  .vp-helpful-prompt {
    flex-direction: column;
    align-items: flex-start;
  }

  .vp-helpful-actions {
    width: 100%;
  }

  .vp-helpful-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
