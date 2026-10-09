/**
 * StackBlitz WebContainer 虚拟工程打包与启动协议工具库
 * @author Ateng
 * @since 2026-09-25
 */

export interface StackBlitzProjectOptions {
  /**
   * 沙箱工程标题
   */
  title?: string
  /**
   * 沙箱工程描述
   */
  description?: string
  /**
   * 核心组件或片段源码
   */
  code: string
  /**
   * 额外追加的运行时生产依赖
   */
  dependencies?: Record<string, string>
  /**
   * 额外追加的开发依赖
   */
  devDependencies?: Record<string, string>
  /**
   * 打开沙箱后默认聚焦编辑的文件
   * @default 'src/App.vue'
   */
  openFile?: string
}

/**
 * 格式化组件代码为规范的 Vue 3 单文件组件 (SFC)
 *
 * @param code 原始代码字符串
 * @returns 补齐结构后的完整 SFC 源码
 */
export function formatToVueSfc(code: string): string {
  const trimmed = code.trim()
  if (trimmed.includes('<template>')) {
    return trimmed
  }
  return `<script setup lang="ts">
// 在此编写你的组件响应式数据或交互事件
</script>

<template>
  <div class="zenith-demo-container">
    ${trimmed}
  </div>
</template>

<style scoped>
.zenith-demo-container {
  padding: 32px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: #1e293b;
}
</style>`
}

/**
 * 构建微型 Vite + Vue 3 虚拟机工程文件字典
 *
 * @param options 沙箱工程配置选项
 * @returns 虚拟文件映射表（文件名 -> 内容）
 */
export function createViteVueProjectFiles(options: StackBlitzProjectOptions): Record<string, string> {
  const packageJson = {
    name: 'zenith-sandbox-demo',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      vue: '^3.5.13',
      ...(options.dependencies || {}),
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.2.1',
      typescript: '^5.7.3',
      vite: '^5.4.11',
      ...(options.devDependencies || {}),
    },
  }

  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
`

  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${options.title || 'VitePress Zenith 演示沙箱'}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`

  const mainTs = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`

  return {
    'package.json': JSON.stringify(packageJson, null, 2),
    'vite.config.ts': viteConfig,
    'index.html': indexHtml,
    'src/main.ts': mainTs,
    'src/App.vue': formatToVueSfc(options.code),
  }
}

/**
 * 在新窗口打开 StackBlitz WebContainer 在线项目
 *
 * @param options 沙箱工程配置选项
 */
export async function openInStackBlitz(options: StackBlitzProjectOptions): Promise<void> {
  if (typeof window === 'undefined') return

  // 1. 动态按需载入 @stackblitz/sdk，保障首屏体积零膨胀
  const { default: sdk } = await import('@stackblitz/sdk')

  // 2. 组装微型虚拟工程文件树
  const files = createViteVueProjectFiles(options)

  // 3. 发送协议并在新标签页中拉起 WebContainer 虚拟机
  sdk.openProject(
    {
      title: options.title || 'Zenith 演示沙箱',
      description: options.description || '基于 VitePress Zenith 一键直达的 WebContainer 在线调试沙箱',
      template: 'node',
      files,
    },
    {
      newWindow: true,
      openFile: options.openFile || 'src/App.vue',
    }
  )
}
