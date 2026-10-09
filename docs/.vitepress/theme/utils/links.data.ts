/**
 * 全站内链悬浮预览元数据提取与编译期聚合 Loader
 * 针对站内 Markdown 文档提取标题、描述、摘要、分类与字数，提供 O(1) 毫秒级内链预览
 * @author Ateng
 * @since 2026-09-25
 */

import { createContentLoader } from 'vitepress'

export interface PagePreviewMeta {
  url: string
  title: string
  description: string
  category: string
  categoryIcon: string
  tags: string[]
  words: number
  readingTime: number
  date?: string
}

declare const data: Record<string, PagePreviewMeta>
export { data }

/**
 * 规范化 URL 路径，统一去除后缀与斜杠格式
 * @param path 原始路径
 */
function normalizeUrl(path: string): string {
  let clean = path.replace(/\\/g, '/').trim()
  if (clean.endsWith('.md')) clean = clean.slice(0, -3)
  if (clean.endsWith('.html')) clean = clean.slice(0, -5)
  if (clean.endsWith('/index')) clean = clean.slice(0, -6)
  if (!clean.startsWith('/')) clean = `/${clean}`
  if (clean.endsWith('/') && clean.length > 1) clean = clean.slice(0, -1)
  return clean
}

/**
 * 从文档正文中提取首段有意义的文本摘要（排除 Frontmatter、标题、HTML 标签与图片）
 * @param src 原始 Markdown 源码
 */
function extractFirstParagraph(src: string): string {
  // 1. 去除 Frontmatter 头部
  const withoutFm = src.replace(/^---[\s\S]*?---\s*/, '')
  // 2. 按行遍历寻找首个具有实质文本内容的段落
  const lines = withoutFm.split('\n')
  const paragraphLines: string[] = []
  let capturing = false

  for (const line of lines) {
    const trimmed = line.trim()
    // 跳过大纲标题、分割线、HTML 注释、代码块标记与空行
    if (
      !capturing &&
      (!trimmed ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('---') ||
        trimmed.startsWith('<!--') ||
        trimmed.startsWith('```') ||
        trimmed.startsWith(':::') ||
        trimmed.startsWith('<') ||
        trimmed.startsWith('!['))
    ) {
      continue
    }

    // 捕获普通段落内容
    if (trimmed) {
      capturing = true
      // 清理行内 Markdown 语法（加粗、代码、链接等）
      const cleanLine = trimmed
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
      paragraphLines.push(cleanLine)
    } else if (capturing) {
      // 遇到空行代表当前段落结束
      break
    }
  }

  const result = paragraphLines.join(' ').trim()
  if (result.length > 130) {
    return `${result.slice(0, 126)}...`
  }
  return result
}

export default createContentLoader('**/*.md', {
  includeSrc: true,
  transform(raw): Record<string, PagePreviewMeta> {
    const map: Record<string, PagePreviewMeta> = {}

    raw.forEach(({ url, frontmatter, src }) => {
      // 过滤私有配置与隐藏页面
      if (frontmatter?.hidden || url.includes('.vitepress')) return

      const cleanUrl = normalizeUrl(url)
      const cleanSrc = (src || '').replace(/^---[\s\S]*?---\s*/, '')

      // 1. 统计字数与预计阅读时间
      const cnMatches = cleanSrc.match(/[\u4e00-\u9fa5]/g) || []
      const enMatches = cleanSrc.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || []
      const words = cnMatches.length + enMatches.length
      const readingTime = Math.max(1, Math.ceil(words / 350))

      // 2. 提取或推导标题
      let title = frontmatter?.title || ''
      if (!title) {
        const h1Match = cleanSrc.match(/^#\s+(.+)$/m)
        if (h1Match) {
          title = h1Match[1].trim()
        }
      }
      if (!title) {
        title = cleanUrl.split('/').pop() || '未命名文档'
      }

      // 3. 提取描述与摘要
      const description = frontmatter?.description || extractFirstParagraph(src || '') || '暂无详细摘要'

      // 4. 推导栏目分类与对应语义图标
      let category = '技术文档'
      let categoryIcon = 'i-lucide-book-open'
      if (cleanUrl.startsWith('/guide')) {
        category = '核心指南'
        categoryIcon = 'i-lucide-compass'
      } else if (cleanUrl.startsWith('/components')) {
        category = '交互组件库'
        categoryIcon = 'i-lucide-box'
      } else if (cleanUrl.startsWith('/blog')) {
        category = '技术专栏'
        categoryIcon = 'i-lucide-newspaper'
      } else if (cleanUrl.startsWith('/adr')) {
        category = '架构决策 (ADR)'
        categoryIcon = 'i-lucide-git-commit'
      } else if (cleanUrl === '' || cleanUrl === '/') {
        category = '站点首页'
        categoryIcon = 'i-lucide-home'
      }

      const tags: string[] = Array.isArray(frontmatter?.tags)
        ? frontmatter.tags
        : typeof frontmatter?.tags === 'string'
          ? [frontmatter.tags]
          : []

      const meta: PagePreviewMeta = {
        url: cleanUrl,
        title,
        description,
        category,
        categoryIcon,
        tags,
        words,
        readingTime,
        date: frontmatter?.date ? String(frontmatter.date) : undefined,
      }

      // 5. 将规范化路径与变体同时映射至索引表，保障多写法容错
      map[cleanUrl] = meta
      map[`${cleanUrl}.html`] = meta
      map[`${cleanUrl}.md`] = meta
      if (cleanUrl !== '/') {
        map[`${cleanUrl}/`] = meta
      }
    })

    return map
  },
})
