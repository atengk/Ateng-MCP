/**
 * VitePress 站点核心配置
 * @author Ateng
 * @since 2026-09-25
 */

import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import UnoCSS from 'unocss/vite'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { getAutoSidebar } from './utils/sidebar'

const base = process.env.BASE_PATH || (process.env.CI ? '/Ateng-MCP/' : '/')

/**
 * Zenith 旗舰级特性开关矩阵 (Zenith Feature Switches)
 * 遵循极简与渐进式原则，统一管控全站所有特性开闭与默认状态 (Opt-in / Opt-out)
 */
const zenithConfig = {
  // 1. 进阶/特定场景特性（默认关闭，按需开启）
  i18n: false,              // 国际化多语言矩阵：默认关闭（不显示顶栏语言切换，仅保留简体中文）
  versionSwitcher: false,   // 多版本管理与归档横幅：默认关闭（顶栏不显示版本下拉菜单）
  helpful: false,           // 文档有用度评价 (<VpHelpful>)：默认关闭（无后端埋点占位组件）
  zenModeToggle: false,     // 右下角专注模式悬浮球 (<ZenModeToggle>)：默认关闭（快捷键 Alt+Z 仍可直接使用）
  contributors: false,      // 开源贡献者致谢流 (<VpContributors>)：默认关闭（单人/私有项目免受侵扰）
  themePicker: false,       // 顶栏主题强调色盘选择器 (<VpThemePicker>)：默认关闭（按需开启）
  banner: false,            // 顶部全宽公告通知横幅 (<VpBanner>)：默认关闭
  pwaStatus: false,         // PWA 离线运行感知与安装横幅 (<VpPwaStatus>)：默认关闭（按需开启）

  // 2. 旗舰体验特性（做成开关，默认开启）
  commandPalette: true,     // 全局快捷命令中心浮层 (<VpCommandPalette>)：默认开启
  blog: false,               // 博客系统与顶栏导航入口：默认开启
  mediumZoom: true,         // 正文插图平滑点击放大灯箱：默认开启
  readingMetrics: true,     // 阅读认知指标（字数与预计耗时 DocMeta）：默认开启
  readingProgressBar: true, // 页面顶部流光阅读进度条 (<ReadingProgressBar>)：默认开启
  linkPreview: true,        // 站内内链卡片悬浮预览 (<VpLinkPreview>)：默认开启
  keyboardShortcuts: true,  // 全键盘极客导航与速查浮层 (<VpShortcutsModal>)：默认开启
  codeFolding: true,        // 超长代码块自适应高度约束与极客内滚动：默认开启
  zenMode: true,            // 沉浸式专注阅读模式（Alt+Z / Alt+F / 顶部感应胶囊）：默认开启
}

/**
 * 顶栏核心导航项定义（中文）：极简双核直达架构（首页 + 文档，零下拉层级）
 */
const navItemsZh = [
  { text: '首页', link: '/' },
  { text: '文档', link: '/guide/getting-started', activeMatch: '^/(guide|servers|components|adr)/' },
]

/**
 * 全量技术文档通用侧边栏大纲（涵盖核心基础指引与 10 大 MCP 生产级服务端）
 */
const docSidebarZh = [
  {
    text: '基础指引',
    collapsed: false,
    items: [
      { text: '快速起步', link: '/guide/getting-started' },
      { text: '多客户端接入指南', link: '/guide/client-setup' },
    ],
  },
  {
    text: '服务大盘',
    items: [
      { text: 'MCP 服务矩阵总览', link: '/servers/' },
    ],
  },
  {
    text: '数据库与缓存 (Database & Cache)',
    collapsed: false,
    items: [
      { text: 'RDBMS 关系型数据库', link: '/servers/database/rdbms' },
      { text: 'Redis 生产级缓存', link: '/servers/database/redis' },
    ],
  },
  {
    text: '消息流与队列 (Messaging)',
    collapsed: false,
    items: [
      { text: 'RocketMQ 5 控制面', link: '/servers/messaging/rocketmq' },
      { text: 'Kafka 生产级服务', link: '/servers/messaging/kafka' },
      { text: 'RabbitMQ 智能服务', link: '/servers/messaging/rabbitmq' },
    ],
  },
  {
    text: '对象存储 (Storage)',
    collapsed: false,
    items: [
      { text: 'S3 对象存储', link: '/servers/storage/s3' },
    ],
  },
  {
    text: '云原生与主机运维 (Cloud & Ops)',
    collapsed: false,
    items: [
      { text: 'Kubernetes 智能运维', link: '/servers/cloud/kubernetes' },
      { text: 'OpenSSH 终端与 SFTP', link: '/servers/cloud/ssh' },
    ],
  },
  {
    text: '微服务与通信 (Governance & Comms)',
    collapsed: false,
    items: [
      { text: 'Nacos 3.0 控制面', link: '/servers/governance/nacos' },
      { text: 'Email 邮件服务', link: '/servers/tools/email' },
    ],
  },
]


/**
 * 多版本下拉导航项定义（中文）
 */
const versionNavItemZh = {
  text: 'v1.0.0',
  items: [
    {
      text: '当前版本',
      items: [
        { text: 'v1.0.0 (最新稳定版)', link: '/guide/getting-started' },
      ],
    },
    {
      text: '历史归档',
      items: [
        { text: 'v0.9.0 (旧版归档)', link: '/v0/guide/' },
      ],
    },
    {
      text: '版本变更',
      items: [
        { text: '多版本管理指南', link: '/guide/version-switcher' },
        { text: '更新日志 (Changelog)', link: 'https://github.com/atengk/vitepress-zenith/releases' },
      ],
    },
  ],
}

/**
 * 多版本下拉导航项定义（英文）
 */
const versionNavItemEn = {
  text: 'v1.0.0',
  items: [
    {
      text: 'Current Version',
      items: [
        { text: 'v1.0.0 (Latest)', link: '/en/guide/getting-started' },
      ],
    },
    {
      text: 'Archived Versions',
      items: [
        { text: 'v0.9.0 (Legacy)', link: '/v0/guide/' },
      ],
    },
    {
      text: 'Releases',
      items: [
        { text: 'Version Switcher Guide', link: '/guide/version-switcher' },
        { text: 'Changelog', link: 'https://github.com/atengk/vitepress-zenith/releases' },
      ],
    },
  ],
}

/**
 * 英文本地离线检索分词翻译配置
 */
const enSearchLocaleConfig = {
  translations: {
    button: {
      buttonText: 'Search docs',
      buttonAriaLabel: 'Search docs',
    },
    modal: {
      displayDetails: 'Detailed list',
      resetButtonTitle: 'Reset search',
      backButtonTitle: 'Close search',
      noResultsText: 'No results found',
      footer: {
        selectText: 'to select',
        selectKeyAriaLabel: 'Enter',
        navigateText: 'to navigate',
        navigateUpKeyAriaLabel: 'Arrow up',
        navigateDownKeyAriaLabel: 'Arrow down',
        closeText: 'to close',
        closeKeyAriaLabel: 'Escape',
      },
    },
  },
}

/**
 * 英文站点国际化配置（仅在 zenithConfig.i18n 为 true 时注入激活）
 */
const enLocaleConfig = {
  label: 'English',
  lang: 'en-US',
  link: '/en/',
  title: 'Ateng MCP',
  description: 'Production-ready Model Context Protocol (MCP) Servers Hub & Documentation',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/en/' },
      { text: 'Guide', link: '/en/guide/getting-started' },
      ...(zenithConfig.blog ? [{ text: 'Blog', link: '/blog/' }] : []),
      ...(zenithConfig.versionSwitcher ? [versionNavItemEn] : []),
    ],
    sidebar: {
      ...getAutoSidebar({
        locale: 'en',
        groupTitles: {
          guide: 'Guides',
          components: 'Components',
          servers: 'Servers Matrix',
          messaging: 'Message Queues',
          cloud: 'Cloud Native & Ops',
          storage: 'Object Storage',
          tools: 'Tools & Comms',
        },
      }),
      ...(zenithConfig.versionSwitcher ? {
        '/v0/': [
          {
            text: 'v0.9.0 Archived',
            items: [
              { text: 'Legacy Overview', link: '/v0/guide/' },
              { text: 'Back to Latest v1.0.0', link: '/en/guide/getting-started' },
            ],
          },
        ],
      } : {}),
    },
    editLink: {
      pattern: '',
      text: 'Edit this page on GitHub',
    },
    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },
    outline: {
      level: [2, 3] as [number, number],
      label: 'On this page',
    },
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      } as const,
    },
    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
    skipToContentLabel: 'Skip to content',
    langMenuLabel: 'Change language',
    notFound: {
      title: 'Ateng MCP',
      quote: '抱歉，你访问的页面已漂移入深空或已被移除。',
      linkLabel: '返回首页',
      linkText: '返回首页',
    },
  },
}

export default withPwa(defineConfig({
  title: 'Ateng MCP',
  description: '面向大模型与 Agent 生态的现代化 Model Context Protocol (MCP) 统一服务矩阵与官方文档门户',
  lang: 'zh-CN',
  base,

  pwa: {
    outDir: '.vitepress/dist',
    registerType: 'autoUpdate',
    includeAssets: ['logo.svg'],
    manifest: {
      id: base,
      name: 'Ateng MCP',
      short_name: 'ateng-mcp',
      description: '面向大模型与 Agent 生态的现代化 Model Context Protocol (MCP) 统一服务矩阵与官方文档门户',
      theme_color: '#6366f1',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      start_url: base,
      scope: base,
      lang: 'zh-CN',
      categories: ['documentation', 'productivity', 'education'],
      icons: [
        {
          src: `${base}logo.svg`,
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: `${base}logo.svg`,
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}'],
      runtimeCaching: [
        {
          urlPattern: ({ request }) =>
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'worker',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 120,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 24 * 60 * 60, // 60 天
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.origin === 'https://fonts.googleapis.com' ||
            url.origin === 'https://fonts.gstatic.com',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 年
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
          handler: 'CacheFirst',
          options: {
            cacheName: 'jsdelivr-cdn',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    experimental: {
      includeAllowlist: true,
    },
  },

  markdown: {
    math: true,
    lineNumbers: true,
    codeTransformers: [
      transformerTwoslash(),
    ],
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const lang = token.info.trim().split(/\s+/)[0]
        if (lang === 'mermaid') {
          const key = `mermaid-${idx}`
          const code = encodeURIComponent(token.content)
          return `<Mermaid id="${key}" code="${code}" />\n`
        }
        if (lang === 'markmap') {
          const key = `markmap-${idx}`
          const code = encodeURIComponent(token.content)
          return `<Markmap id="${key}" code="${code}" />\n`
        }
        const rendered = defaultFence(tokens, idx, options, env, self)

        // 修复 VitePress 内置 lineNumberPlugin 在结合 Twoslash 时因误用 rawCode.indexOf("</code>") 导致行号在第一个悬浮弹窗处提前截断的缺陷
        const wrapperIdx = rendered.indexOf('<div class="line-numbers-wrapper"')
        if (wrapperIdx !== -1) {
          const matchStartLineNumber = token.info.match(/=(\d+)/)
          const startLineNumber = matchStartLineNumber ? parseInt(matchStartLineNumber[1], 10) : 1
          const codeBeforeWrapper = rendered.slice(0, wrapperIdx)
          // 排除 Twoslash 悬浮提示框 (<template v-slot:popper>...</template>) 内部包含的独立高亮代码行，仅统计主干代码行数
          const cleanCode = codeBeforeWrapper
            .replace(/<template\s+(?:v-slot:popper|#popper)[\s\S]*?<\/template>/g, '')
            .replace(/<span\s+class="[^"]*twoslash-floating[^"]*"[\s\S]*?<\/span>\s*<\/span>\s*<\/span>/g, '')
          const lineMatches = cleanCode.match(/class="line(?:\s+[^"]*)?"/g)
          const rawLines = token.content.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n').length
          const lineCount = lineMatches ? lineMatches.length : rawLines

          const lineNumbersCode = Array.from(
            { length: lineCount },
            (_, i) => `<span class="line-number">${i + startLineNumber}</span><br>`
          ).join('')

          return rendered.replace(
            /<div class="line-numbers-wrapper"[^>]*>[\s\S]*?<\/div>/,
            `<div class="line-numbers-wrapper" aria-hidden="true">${lineNumbersCode}</div>`
          )
        }

        return rendered
      }
    },
  },

  sitemap: {
    hostname: 'https://atengk.github.io/Ateng-MCP',
  },

  head: [
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: 'Ateng MCP' }],
    ['meta', { name: 'keywords', content: 'MCP, Model Context Protocol, Ateng, RocketMQ, Kafka, RabbitMQ, Kubernetes, S3, Email, LLM, Agent' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:title', content: 'Ateng MCP - 生产级 Model Context Protocol 服务端矩阵与生态文档中心' }],
    ['meta', { property: 'og:site_name', content: 'Ateng MCP' }],
    ['meta', { property: 'og:description', content: '面向大模型与 Agent 生态的现代化 Model Context Protocol (MCP) 统一服务矩阵与官方文档门户' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    // 注入防闪烁 (Anti-FOUC) 极速色盘恢复内联脚本
    ['script', {}, `(function(){try{var p=localStorage.getItem('zenith-theme-palette');if(p&&p!=='indigo'){document.documentElement.dataset.themePalette=p;}}catch(e){}})();`],
  ],


  themeConfig: {
    siteTitle: 'Ateng MCP',

    // Zenith 旗舰级技术特性全局开关矩阵（支持页面级 Frontmatter 局部覆写）
    zenith: zenithConfig,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/atengk/Ateng-MCP' },
    ],

    // Giscus 评论系统配置（基于 GitHub Discussions 零运维讨论区）
    giscus: {
      enabled: false,
      repo: 'atengk/vitepress-zenith',
      repoId: 'R_kgDOUrCouQ',
      category: 'General',
      categoryId: 'DIC_kwDOUrCouc4DGX2s',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'top',
      lang: 'zh-CN',
      loading: 'lazy',
    },

    // 本地全文检索全套中英多语言分词与汉化
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '无法找到相关结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车键',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '向上箭头',
                  navigateDownKeyAriaLabel: '向下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: '退出键',
                },
              },
            },
          },
          ...(zenithConfig.i18n ? { en: enSearchLocaleConfig } : {}),
        },
        miniSearch: {
          options: {
            /**
             * 针对中文与西方多语言分词隔离（中文字符使用 Intl.Segmenter 高精度词法切分，西文字符按空格与标点符号拆分）
             */
            tokenize(text) {
              if (typeof text !== 'string') return []
              // 若包含中文字符，优先使用 Intl.Segmenter 原生高精度中文分词
              if (/[\u4e00-\u9fa5]/.test(text) && typeof Intl !== 'undefined' && Intl.Segmenter) {
                const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
                const tokens: string[] = []
                for (const { segment } of segmenter.segment(text)) {
                  const s = segment.trim()
                  if (s) tokens.push(s.toLowerCase())
                }
                return tokens
              }
              // 英文与标准西方语言按空格与标点符号拆分
              return text.toLowerCase().split(/[\s,./\\;:'"[\]{}|`~!@#$%^&*()_+\-=?<>]+/).filter(Boolean)
            },
          },
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
          },
        },
      },
    },

    footer: {
      message: '基于 Apache-2.0 协议开源发布',
      copyright: 'Copyright © 2026-present Ateng',
    },
  },

  // 中英多语言国际化矩阵配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Ateng MCP',
      description: '面向大模型与 Agent 生态的现代化 Model Context Protocol (MCP) 统一服务矩阵与官方文档门户',
      themeConfig: {
        nav: [
          ...navItemsZh,
          ...(zenithConfig.blog ? [{ text: '博客', link: '/blog/' }] : []),
          ...(zenithConfig.versionSwitcher ? [versionNavItemZh] : []),
        ],
        sidebar: {
          '/guide/': docSidebarZh,
          '/servers/': docSidebarZh,
          '/components/': docSidebarZh,
          '/adr/': docSidebarZh,
          ...(zenithConfig.versionSwitcher ? {
            '/v0/': [
              {
                text: 'v0.9.0 历史归档',
                items: [
                  { text: '旧版指引概览', link: '/v0/guide/' },
                  { text: '返回最新稳定版 v1.0.0', link: '/guide/getting-started' },
                ],
              },
            ],
          } : {}),
        },
        editLink: {
          pattern: 'https://github.com/atengk/Ateng-MCP/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        docFooter: {
          prev: '上一篇',
          next: '下一篇',
        },
        outline: {
          level: [2, 3],
          label: '本页大纲',
        },
        lastUpdated: {
          text: '最后更新于',
          formatOptions: {
            dateStyle: 'short',
            timeStyle: 'medium',
          },
        },
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '目录菜单',
        darkModeSwitchLabel: '深浅主题',
        lightModeSwitchTitle: '切换为浅色模式',
        darkModeSwitchTitle: '切换为深色模式',
        skipToContentLabel: '跳转至正文',
        langMenuLabel: '切换语言',
        notFound: {
          title: '企业级技术文档中心',
          quote: '抱歉，您访问的页面已漂移到星际深处或已被移除。',
          linkLabel: '返回首页',
          linkText: '返回首页',
        },
      },
    },
    ...(zenithConfig.i18n ? { en: enLocaleConfig } : {}),
  },


  vite: {
    plugins: [
      UnoCSS(),
    ],
  },
}))

