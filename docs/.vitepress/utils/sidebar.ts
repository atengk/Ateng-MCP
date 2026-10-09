/**
 * 物理目录结构扫描与 Frontmatter 自动推导侧边栏工具函数
 * @author Ateng
 * @since 2026-09-25
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'

export interface AutoSidebarOptions {
  /**
   * 文档源根目录（绝对路径或相对于项目根目录的相对路径）
   * @default 'docs' 或当指定 locale 时为 'docs/<locale>'
   */
  srcDir?: string
  /**
   * 当前国际化语言标识（如 'root' 或 'en'）
   * @default 'root'
   */
  locale?: string
  /**
   * 路由基础前缀（如 '/en'）
   */
  baseRoute?: string
  /**
   * 需要忽略扫描的目录或文件名
   * @default ['.vitepress', 'public', 'node_modules', 'blog', 'adr', 'agents', 'en']
   */
  ignoreDirs?: string[]
  /**
   * 一级或二级分组中文标题映射表
   * @example { 'guide': '核心指引', 'components': '短代码组件库' }
   */
  groupTitles?: Record<string, string>
  /**
   * 手动精确覆盖的侧边栏映射表（覆盖自动扫描结果）
   */
  overrides?: DefaultTheme.SidebarMulti
  /**
   * 子分组是否默认折叠
   * @default false
   */
  defaultCollapsed?: boolean
}

export interface MarkdownMeta {
  title?: string
  order?: number
  hidden?: boolean
  collapsed?: boolean
}

/**
 * 解析单个 Markdown 文件的 Frontmatter 元数据与首个大标题
 *
 * @param filePath 物理文件绝对路径
 * @returns 提取的元数据对象
 */
export function parseMarkdownMeta(filePath: string): MarkdownMeta {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    const meta: MarkdownMeta = {}

    // 1. 解析 Frontmatter 键值对
    if (match) {
      const yaml = match[1]
      for (const line of yaml.split('\n')) {
        const colonIdx = line.indexOf(':')
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim()
          let val = line.slice(colonIdx + 1).trim()
          // 去除两端包裹的单双引号
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }

          if (key === 'order') {
            meta.order = Number(val)
          } else if (key === 'title') {
            meta.title = val
          } else if (key === 'hidden') {
            meta.hidden = val === 'true'
          } else if (key === 'collapsed') {
            meta.collapsed = val === 'true'
          }
        }
      }
    }

    // 2. 若未显式声明 title，自动提取正文首个 # 大标题
    if (!meta.title) {
      const cleanBody = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
      const h1Match = cleanBody.match(/^#\s+(.+)$/m)
      if (h1Match) {
        meta.title = h1Match[1].trim()
      }
    }

    return meta
  } catch {
    return {}
  }
}

/**
 * 递归扫描特定章节目录，生成侧边栏条目列表
 *
 * @param currentDir 当前物理目录绝对路径
 * @param routePrefix 对应的 URL 路由前缀（如 '/guide/' 或 '/en/guide/'）
 * @param options 自动侧边栏参数
 * @returns VitePress 侧边栏条目数组
 */
export function scanDirectory(
  currentDir: string,
  routePrefix: string,
  options: AutoSidebarOptions
): DefaultTheme.SidebarItem[] {
  if (!fs.existsSync(currentDir)) return []
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })
  const itemsWithOrder: Array<DefaultTheme.SidebarItem & { order: number }> = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue
    const fullPath = path.join(currentDir, entry.name)

    // 1. 处理 Markdown 文件
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const meta = parseMarkdownMeta(fullPath)
      if (meta.hidden) continue

      const baseName = entry.name.replace(/\.md$/, '')
      const title = meta.title || baseName
      const link = baseName === 'index' ? routePrefix : `${routePrefix}${baseName}`
      const order = meta.order !== undefined ? meta.order : 999

      itemsWithOrder.push({
        text: title,
        link,
        order,
      })
    }
    // 2. 递归处理子目录为二级折叠分组
    else if (entry.isDirectory()) {
      const dirName = entry.name
      const subDirMetaPath = path.join(fullPath, 'index.md')
      const dirMeta = fs.existsSync(subDirMetaPath) ? parseMarkdownMeta(subDirMetaPath) : {}
      if (dirMeta.hidden) continue

      const subRoutePrefix = `${routePrefix}${dirName}/`
      const subItems = scanDirectory(fullPath, subRoutePrefix, options)
      if (subItems.length === 0) continue

      const dirTitle = dirMeta.title || options.groupTitles?.[dirName] || dirName
      const dirOrder = dirMeta.order !== undefined ? dirMeta.order : 999
      const isCollapsed = dirMeta.collapsed !== undefined ? dirMeta.collapsed : (options.defaultCollapsed ?? false)

      itemsWithOrder.push({
        text: dirTitle,
        collapsed: isCollapsed,
        items: subItems,
        order: dirOrder,
      })
    }
  }

  // 严格按 order 升序排序
  itemsWithOrder.sort((a, b) => a.order - b.order)

  // 剥离内部排序字段，返回标准 SidebarItem
  return itemsWithOrder.map(({ order, ...rest }) => rest)
}

/**
 * 自动推导并生成全站多模块侧边栏配置
 *
 * @param options 侧边栏自动化配置项
 * @returns VitePress 格式的 SidebarMulti 对象
 */
export function getAutoSidebar(options: AutoSidebarOptions = {}): DefaultTheme.SidebarMulti {
  const rootDir = process.cwd()
  const isRootLocale = !options.locale || options.locale === 'root'
  const defaultSrcDir = isRootLocale ? 'docs' : `docs/${options.locale}`
  let srcDir = path.resolve(rootDir, options.srcDir || defaultSrcDir)

  // 若默认基于 rootDir 解析不存在，降级通过当前模块所在目录向外回退
  if (!fs.existsSync(srcDir)) {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url))
      const fallbackDir = path.resolve(currentDir, '..', options.srcDir || defaultSrcDir)
      if (fs.existsSync(fallbackDir)) {
        srcDir = fallbackDir
      }
    } catch {
      // 保持当前 srcDir
    }
  }

  const localePrefix = options.baseRoute !== undefined
    ? options.baseRoute
    : (isRootLocale ? '' : `/${options.locale}`)

  const ignoreList = new Set([
    '.vitepress',
    'public',
    'node_modules',
    'blog',
    'adr',
    'agents',
    ...(isRootLocale ? ['en', 'v0'] : []),
    ...(options.ignoreDirs || []),
  ])

  const sidebarResult: DefaultTheme.SidebarMulti = {}

  if (!fs.existsSync(srcDir)) return sidebarResult

  const entries = fs.readdirSync(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoreList.has(entry.name) || entry.name.startsWith('.')) {
      continue
    }

    const sectionDir = path.join(srcDir, entry.name)
    const routePrefix = `${localePrefix}/${entry.name}/`

    // 若用户显式提供了精确覆盖配置，优先采用
    if (options.overrides && options.overrides[routePrefix]) {
      sidebarResult[routePrefix] = options.overrides[routePrefix]
      continue
    }

    const sectionItems = scanDirectory(sectionDir, routePrefix, options)
    if (sectionItems.length > 0) {
      const sectionGroupTitle = options.groupTitles?.[entry.name] || entry.name
      sidebarResult[routePrefix] = [
        {
          text: sectionGroupTitle,
          items: sectionItems,
        },
      ]
    }
  }

  // 合并用户在 overrides 中定义的其他路由（如单独定义的特殊页面）
  if (options.overrides) {
    for (const [key, val] of Object.entries(options.overrides)) {
      if (!sidebarResult[key]) {
        sidebarResult[key] = val
      }
    }
  }

  return sidebarResult
}

