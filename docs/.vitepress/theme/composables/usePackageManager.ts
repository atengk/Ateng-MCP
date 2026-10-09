/**
 * 全站跨页面联动包管理器 (Package Manager) 状态管理与命令解析 Hook
 * @author Ateng
 * @since 2026-09-25
 */

import { ref, onMounted } from 'vue'

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export interface PackageManagerOption {
  key: PackageManager
  label: string
}

export const PACKAGE_MANAGERS: readonly PackageManagerOption[] = [
  { key: 'pnpm', label: 'pnpm' },
  { key: 'npm', label: 'npm' },
  { key: 'yarn', label: 'yarn' },
  { key: 'bun', label: 'bun' },
] as const

export interface CommandResolutionProps {
  pkg?: string
  package?: string
  command?: 'install' | 'add' | 'create' | 'run' | 'exec' | 'dlx'
  dev?: boolean
  global?: boolean
  args?: string
  script?: string
  cmd?: string
  pnpm?: string
  npm?: string
  yarn?: string
  bun?: string
}

const STORAGE_KEY = 'vp-zenith-package-manager'
const activeManager = ref<PackageManager>('pnpm')
let isStorageListenerAttached = false

/**
 * 解析并生成对应包管理器的执行命令
 *
 * @param manager 目标包管理器
 * @param props 参数选项
 * @returns 格式化后的完整命令行文本
 */
export function resolveCommand(manager: PackageManager, props: CommandResolutionProps): string {
  // 1. 优先采用直接传入的覆盖命令
  if (manager === 'pnpm' && props.pnpm) return props.pnpm
  if (manager === 'npm' && props.npm) return props.npm
  if (manager === 'yarn' && props.yarn) return props.yarn
  if (manager === 'bun' && props.bun) return props.bun

  const cmdType = props.command || 'install'
  const targetPkg = (props.pkg || props.package || '').trim()
  const extraArgs = props.args ? ` ${props.args.trim()}` : ''

  // 2. 处理脚手架初始化命令 (create)
  if (cmdType === 'create') {
    const target = targetPkg || props.cmd || props.script || ''
    const baseCmd = `${manager} create ${target}`.trim()
    return `${baseCmd}${extraArgs}`
  }

  // 3. 处理脚本运行命令 (run)
  if (cmdType === 'run') {
    const scriptName = props.script || targetPkg || props.cmd || ''
    if (manager === 'yarn') {
      return `yarn ${scriptName}${extraArgs}`.trim()
    }
    return `${manager} run ${scriptName}${extraArgs}`.trim()
  }

  // 4. 处理单次临时执行远程命令 (exec / dlx)
  if (cmdType === 'exec' || cmdType === 'dlx') {
    const execTarget = props.cmd || targetPkg || ''
    let base = ''
    switch (manager) {
      case 'pnpm':
        base = `pnpm dlx ${execTarget}`
        break
      case 'npm':
        base = `npx ${execTarget}`
        break
      case 'yarn':
        base = `yarn dlx ${execTarget}`
        break
      case 'bun':
        base = `bunx ${execTarget}`
        break
    }
    return `${base.trim()}${extraArgs}`
  }

  // 5. 处理依赖安装命令 (install / add)
  if (!targetPkg) {
    return `${manager} install${extraArgs}`
  }

  if (props.global) {
    switch (manager) {
      case 'pnpm':
        return `pnpm add -g ${targetPkg}${extraArgs}`
      case 'npm':
        return `npm install -g ${targetPkg}${extraArgs}`
      case 'yarn':
        return `yarn global add ${targetPkg}${extraArgs}`
      case 'bun':
        return `bun add -g ${targetPkg}${extraArgs}`
    }
  }

  if (props.dev) {
    switch (manager) {
      case 'pnpm':
        return `pnpm add -D ${targetPkg}${extraArgs}`
      case 'npm':
        return `npm install -D ${targetPkg}${extraArgs}`
      case 'yarn':
        return `yarn add -D ${targetPkg}${extraArgs}`
      case 'bun':
        return `bun add -d ${targetPkg}${extraArgs}`
    }
  }

  switch (manager) {
    case 'pnpm':
      return `pnpm add ${targetPkg}${extraArgs}`
    case 'npm':
      return `npm install ${targetPkg}${extraArgs}`
    case 'yarn':
      return `yarn add ${targetPkg}${extraArgs}`
    case 'bun':
      return `bun add ${targetPkg}${extraArgs}`
  }
}

/**
 * 全站包管理器状态与联动 Hook
 */
export function usePackageManager() {
  /**
   * 切换当前激活的包管理器并同步至本地存储
   *
   * @param manager 选中的包管理器
   */
  const setActiveManager = (manager: PackageManager) => {
    activeManager.value = manager
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, manager)
      } catch {
        // 防御无痕模式或存储受限异常
      }
    }
  }

  /**
   * 确保注册全局 cross-tab 存储监听器
   */
  const ensureStorageListener = () => {
    if (isStorageListenerAttached || typeof window === 'undefined') return
    isStorageListenerAttached = true

    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        const val = event.newValue as PackageManager
        if (PACKAGE_MANAGERS.some((item) => item.key === val)) {
          activeManager.value = val
        }
      }
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PackageManager | null
      if (stored && PACKAGE_MANAGERS.some((item) => item.key === stored)) {
        activeManager.value = stored
      }
    } catch {
      // 防御存储读取异常
    }

    ensureStorageListener()
  })

  return {
    activeManager,
    setActiveManager,
    packageManagers: PACKAGE_MANAGERS,
    resolveCommand,
  }
}
