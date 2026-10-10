/**
 * 站内主题跳转链接智能规范化与容错工具
 *
 * @author Ateng
 * @since 2026-10-10
 */

import { withBase, useData } from 'vitepress'

/**
 * 外部链接正则匹配（支持 http(s):, mailto:, tel:, 协议相对链接 //）
 */
export const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i

/**
 * 判断目标链接是否为外部链接
 *
 * @param url 待检测的链接地址
 * @returns 是否为外部链接
 */
export function isExternalLink(url?: string): boolean {
  return Boolean(url && EXTERNAL_URL_RE.test(url))
}

/**
 * 规范化站内主题交互组件（如 VpCard, VpLinkCard, VpBanner）的跳转链接
 *
 * 1. 过滤防御：空链接、外部链接与纯页面内锚点（#）原样放行；
 * 2. 结构提取：精准保留原始链接中的 Query 查询参数与 Hash 锚点；
 * 3. 容错转换：自动识别并剔除结尾的 .md 后缀，并联动当前站点 site.cleanUrls 配置生成对应路由（开启 cleanUrls 输出干净路由，未开启输出 .html）；
 * 4. 路由对齐：相对路径（./ 或 ../）保留原生相对层级以便由 DOM baseURI 原生解析；绝对路径（/ 开头）自适应补全 withBase 部署前缀。
 *
 * @param url 原始配置或传入的链接地址
 * @returns 规范化后的安全可用链接地址
 */
export function normalizeThemeLink(url?: string): string {
  if (!url) return ''

  // 1. 外链或纯锚点直接原样返回
  if (isExternalLink(url) || url.startsWith('#')) {
    return url
  }

  // 2. 分离 hash 与 search 参数，避免污染路径文件名解析
  const hashIndex = url.indexOf('#')
  const hash = hashIndex !== -1 ? url.slice(hashIndex) : ''
  const urlWithoutHash = hashIndex !== -1 ? url.slice(0, hashIndex) : url

  const searchIndex = urlWithoutHash.indexOf('?')
  const search = searchIndex !== -1 ? urlWithoutHash.slice(searchIndex) : ''
  let pathname = searchIndex !== -1 ? urlWithoutHash.slice(0, searchIndex) : urlWithoutHash

  // 3. 读取当前站点 cleanUrls 配置（Vue 上下文安全兜底）
  let cleanUrls = false
  try {
    const { site } = useData()
    cleanUrls = Boolean(site.value?.cleanUrls)
  } catch {
    cleanUrls = false
  }

  // 4. 智能容错：处理末尾的 .md 后缀
  if (pathname.endsWith('.md')) {
    pathname = pathname.slice(0, -3) + (cleanUrls ? '' : '.html')
  }

  // 5. 绝对路径（/ 开头）自动注入 withBase；相对路径保留原样交由 DOM 解析
  if (pathname.startsWith('/')) {
    return withBase(pathname) + search + hash
  }

  return pathname + search + hash
}
