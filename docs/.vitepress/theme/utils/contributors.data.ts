/**
 * 全站文档 Git 历史贡献者提取与编译期聚合 Loader
 * 自动提取各 Markdown 页面 Git Commit 历史、贡献者头像、提交次数与最后变更信息
 * @author Ateng
 * @since 2026-09-25
 */

import { createContentLoader } from 'vitepress'
import { execSync } from 'node:child_process'
import crypto from 'node:crypto'

export interface ContributorInfo {
  name: string
  email?: string
  avatar: string
  github?: string
  commitsCount: number
  lastCommitTime: number
  lastCommitMessage: string
}

export interface PageContributorsMeta {
  url: string
  contributors: ContributorInfo[]
  totalCommits: number
  lastUpdated: number
}

declare const data: Record<string, PageContributorsMeta>
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
 * 计算邮箱 MD5 哈希
 * @param email 邮箱地址
 */
function getEmailHash(email: string): string {
  return crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex')
}

/**
 * 已知开源核心贡献者映射表（自动关联高精度 GitHub 真实头像与主页）
 */
const KNOWN_AUTHORS: Record<string, { name?: string; github: string; avatar: string }> = {
  孔余: {
    name: '孔余 (Ateng)',
    github: 'atengk',
    avatar: 'https://github.com/atengk.png',
  },
  Ateng: {
    name: 'Ateng',
    github: 'atengk',
    avatar: 'https://github.com/atengk.png',
  },
  atengk: {
    name: 'Ateng',
    github: 'atengk',
    avatar: 'https://github.com/atengk.png',
  },
  '2385569970@qq.com': {
    name: '孔余 (Ateng)',
    github: 'atengk',
    avatar: 'https://github.com/atengk.png',
  },
}

export default createContentLoader('**/*.md', {
  includeSrc: false,
  render: false,
  transform(rawData) {
    const fileToCommits: Record<string, Array<{
      hash: string
      authorName: string
      authorEmail: string
      timestamp: number
      message: string
    }>> = {}

    // 1. 尝试从当前工程 Git 提交历史中提取所有文件的修改记录
    try {
      const gitLogOutput = execSync('git log --name-only --format="COMMIT:%H|%an|%ae|%at|%s"', {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      })

      const lines = gitLogOutput.split('\n')
      let currentCommit: {
        hash: string
        authorName: string
        authorEmail: string
        timestamp: number
        message: string
      } | null = null

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue
        if (line.startsWith('COMMIT:')) {
          const parts = line.slice(7).split('|')
          currentCommit = {
            hash: parts[0] || '',
            authorName: parts[1] || 'Contributor',
            authorEmail: parts[2] || '',
            timestamp: parseInt(parts[3] || '0', 10),
            message: parts.slice(4).join('|') || '',
          }
        } else if (currentCommit) {
          const normalizedFile = line.replace(/\\/g, '/')
          if (!fileToCommits[normalizedFile]) {
            fileToCommits[normalizedFile] = []
          }
          fileToCommits[normalizedFile].push(currentCommit)
        }
      }
    } catch {
      // Git 环境不可用或浅克隆时静默降级
    }

    const resultMap: Record<string, PageContributorsMeta> = {}

    // 2. 遍历全站 Markdown 页面，聚合各自的贡献者指标
    rawData.forEach((item) => {
      const cleanUrl = normalizeUrl(item.url)
      const frontmatter = item.frontmatter || {}

      // 推导该页面可能对应的物理仓库相对路径
      const candidatePaths = [
        `docs${cleanUrl}.md`,
        `docs${cleanUrl}/index.md`,
        cleanUrl === '/' ? 'docs/index.md' : '',
        cleanUrl.startsWith('/en') ? `docs${cleanUrl}.md` : '',
      ].filter(Boolean)

      let commits: Array<{
        hash: string
        authorName: string
        authorEmail: string
        timestamp: number
        message: string
      }> = []

      for (const p of candidatePaths) {
        if (fileToCommits[p] && fileToCommits[p].length > 0) {
          commits = fileToCommits[p]
          break
        }
      }

      // 按作者邮箱或名字聚合贡献
      const authorMap: Record<string, {
        name: string
        email: string
        commitsCount: number
        lastCommitTime: number
        lastCommitMessage: string
      }> = {}

      commits.forEach((c) => {
        const key = (c.authorEmail || c.authorName).toLowerCase()
        if (!authorMap[key]) {
          authorMap[key] = {
            name: c.authorName,
            email: c.authorEmail,
            commitsCount: 0,
            lastCommitTime: c.timestamp,
            lastCommitMessage: c.message,
          }
        }
        authorMap[key].commitsCount += 1
        if (c.timestamp > authorMap[key].lastCommitTime) {
          authorMap[key].lastCommitTime = c.timestamp
          authorMap[key].lastCommitMessage = c.message
        }
      })

      const contributors: ContributorInfo[] = Object.values(authorMap).map((author) => {
        const known =
          KNOWN_AUTHORS[author.name] ||
          (author.email && KNOWN_AUTHORS[author.email.toLowerCase()]) ||
          KNOWN_AUTHORS[author.name.trim()]
        let avatar = ''
        const github = known?.github || 'atengk'
        const displayName = known?.name || author.name

        if (known?.avatar) {
          avatar = known.avatar
        } else if (github) {
          avatar = `https://github.com/${github}.png`
        } else if (author.email) {
          const hash = getEmailHash(author.email)
          avatar = `https://weavatar.com/avatar/${hash}?d=identicon`
        } else {
          avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(author.name)}`
        }

        return {
          name: displayName,
          email: author.email,
          avatar,
          github,
          commitsCount: author.commitsCount,
          lastCommitTime: author.lastCommitTime,
          lastCommitMessage: author.lastCommitMessage,
        }
      })

      // 3. 支持 Frontmatter 中的显式自定义贡献者拓展
      if (Array.isArray(frontmatter.contributors)) {
        frontmatter.contributors.forEach((fmAuthor: any) => {
          if (!fmAuthor || !fmAuthor.name) return
          const existing = contributors.find((c) => c.name === fmAuthor.name)
          if (existing) {
            if (fmAuthor.avatar) existing.avatar = fmAuthor.avatar
            if (fmAuthor.github) existing.github = fmAuthor.github
          } else {
            contributors.push({
              name: fmAuthor.name,
              avatar: fmAuthor.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(fmAuthor.name)}`,
              github: fmAuthor.github,
              commitsCount: 1,
              lastCommitTime: Date.now() / 1000,
              lastCommitMessage: fmAuthor.message || 'Contributor',
            })
          }
        })
      }

      // 若未提取到任何 Git 提交，且 Frontmatter 指定了 author，提供兜底保底项
      if (contributors.length === 0) {
        const defaultAuthor = frontmatter.author || '孔余'
        const known = KNOWN_AUTHORS[defaultAuthor] || KNOWN_AUTHORS['孔余']
        contributors.push({
          name: known?.name || defaultAuthor,
          avatar: known?.avatar || 'https://github.com/atengk.png',
          github: known?.github || 'atengk',
          commitsCount: 1,
          lastCommitTime: Date.now() / 1000,
          lastCommitMessage: 'Initial document contribution',
        })
      }

      // 按提交次数倒序排序
      contributors.sort((a, b) => b.commitsCount - a.commitsCount || b.lastCommitTime - a.lastCommitTime)

      const totalCommits = contributors.reduce((acc, c) => acc + c.commitsCount, 0)
      const lastUpdated = Math.max(...contributors.map((c) => c.lastCommitTime), 0)

      const meta: PageContributorsMeta = {
        url: cleanUrl,
        contributors,
        totalCommits,
        lastUpdated,
      }

      // 4. 将标准路径与常见后缀变体登记至映射表
      resultMap[cleanUrl] = meta
      resultMap[`${cleanUrl}.html`] = meta
      resultMap[`${cleanUrl}.md`] = meta
      if (cleanUrl !== '/') {
        resultMap[`${cleanUrl}/`] = meta
      }
    })

    return resultMap
  },
})
