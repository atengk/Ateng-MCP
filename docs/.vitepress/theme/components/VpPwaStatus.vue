<!--
 * PWA 离线运行感知与应用安装横幅组件
 * @author Ateng
 * @since 2026-09-25
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOffline = ref(false)
const showOnlineNotice = ref(false)
const canInstall = ref(false)
let deferredPrompt: any = null
let onlineTimer: any = null

function handleOnline() {
  isOffline.value = false
  showOnlineNotice.value = true
  if (onlineTimer) clearTimeout(onlineTimer)
  onlineTimer = setTimeout(() => {
    showOnlineNotice.value = false
  }, 3500)
}

function handleOffline() {
  isOffline.value = true
  showOnlineNotice.value = false
}

function handleBeforeInstallPrompt(e: Event) {
  // 阻止浏览器默认的轻量安装信息栏
  e.preventDefault()
  deferredPrompt = e
  canInstall.value = true
}

function handleAppInstalled() {
  canInstall.value = false
  deferredPrompt = null
}

async function installPwa() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    canInstall.value = false
  }
  deferredPrompt = null
}

function dismissInstall() {
  canInstall.value = false
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    isOffline.value = !navigator.onLine
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  }
  if (onlineTimer) clearTimeout(onlineTimer)
})
</script>

<template>
  <div class="vp-pwa-container">
    <!-- 离线状态浮动胶囊 -->
    <transition name="vp-pwa-slide">
      <div v-if="isOffline" class="vp-pwa-badge offline">
        <span class="vp-pwa-icon">⚡</span>
        <span class="vp-pwa-text">离线模式已激活，正在查阅本地全站预缓存文档</span>
      </div>
    </transition>

    <!-- 网络恢复提示胶囊 -->
    <transition name="vp-pwa-slide">
      <div v-if="showOnlineNotice" class="vp-pwa-badge online">
        <span class="vp-pwa-icon">✓</span>
        <span class="vp-pwa-text">网络连接已恢复，实时数据流已重连</span>
      </div>
    </transition>

    <!-- PWA 安装引导浮层 -->
    <transition name="vp-pwa-fade">
      <div v-if="canInstall && !isOffline" class="vp-pwa-install-card">
        <div class="vp-pwa-install-content">
          <div class="vp-pwa-install-icon">📲</div>
          <div class="vp-pwa-install-info">
            <div class="vp-pwa-install-title">安装 VitePress Zenith</div>
            <div class="vp-pwa-install-desc">添加到桌面或主屏幕，尊享独立窗口与全离线原生级阅读体验</div>
          </div>
        </div>
        <div class="vp-pwa-install-actions">
          <button class="vp-pwa-btn primary" @click="installPwa">一键安装</button>
          <button class="vp-pwa-btn secondary" @click="dismissInstall">稍后再说</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.vp-pwa-container {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.vp-pwa-badge {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.vp-pwa-badge.offline {
  background: rgba(245, 158, 11, 0.92);
  color: #ffffff;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.vp-pwa-badge.online {
  background: rgba(16, 185, 129, 0.92);
  color: #ffffff;
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.vp-pwa-install-card {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 90vw;
  max-width: 380px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--vp-c-bg-elv, #ffffff);
  border: 1px solid var(--vp-c-divider, rgba(60, 60, 67, 0.12));
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.18), 0 0 1px 1px rgba(0, 0, 0, 0.05);
}

.vp-pwa-install-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vp-pwa-install-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--vp-c-brand-soft, rgba(99, 102, 241, 0.1));
  flex-shrink: 0;
}

.vp-pwa-install-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vp-pwa-install-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.vp-pwa-install-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.vp-pwa-install-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.vp-pwa-btn {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.vp-pwa-btn.primary {
  background: var(--vp-c-brand, #6366f1);
  color: #ffffff;
}

.vp-pwa-btn.primary:hover {
  background: var(--vp-c-brand-dark, #4f46e5);
}

.vp-pwa-btn.secondary {
  background: var(--vp-c-bg-alt, rgba(0, 0, 0, 0.04));
  color: var(--vp-c-text-2);
}

.vp-pwa-btn.secondary:hover {
  background: var(--vp-c-bg, rgba(0, 0, 0, 0.08));
  color: var(--vp-c-text-1);
}

.vp-pwa-slide-enter-active,
.vp-pwa-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.vp-pwa-slide-enter-from,
.vp-pwa-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.vp-pwa-fade-enter-active,
.vp-pwa-fade-leave-active {
  transition: all 0.3s ease;
}

.vp-pwa-fade-enter-from,
.vp-pwa-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media print {
  .vp-pwa-container {
    display: none !important;
  }
}
</style>
