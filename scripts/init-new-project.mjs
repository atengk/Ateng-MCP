/**
 * VitePress Zenith 新项目脚手架脱敏与一键初始化脚本
 * 负责清理原模板中的业务演示内容、重置元数据并为新领域项目准备白板工程
 * @author Ateng
 * @since 2026-09-25
 */

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * 封装命令行输入提问
 * @param {string} query 提示文案
 * @param {string} defaultVal 默认值
 * @returns {Promise<string>}
 */
function ask(query, defaultVal = '') {
  return new Promise((resolve) => {
    const hint = defaultVal ? ` (默认: ${defaultVal})` : ''
    rl.question(`${query}${hint}: `, (answer) => {
      resolve(answer.trim() || defaultVal)
    })
  })
}

/**
 * 安全删除目录或文件
 * @param {string} targetPath 目标相对或绝对路径
 */
function safeRemove(targetPath) {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(rootDir, targetPath)
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true })
  }
}

/**
 * 写入或覆写文本文件
 * @param {string} targetPath 目标相对或绝对路径
 * @param {string} content 文本内容
 */
function writeFile(targetPath, content) {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(rootDir, targetPath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf-8')
}

async function main() {
  console.log('\n======================================================')
  console.log('🚀 VitePress Zenith · 新项目脚手架脱敏与初始化向导')
  console.log('======================================================\n')
  console.log('⚠️  注意：此脚本专为【克隆到新项目目录后】使用！')
  console.log('它将一键清理母体工程中的演示指南、测试数据与历史提交，')
  console.log('同时完整保留核心主题基建、自适应组件库、UnoCSS 与 PWA 能力。\n')

  const confirmRun = await ask('👉 是否确认开始初始化新项目？(输入 y 继续，其他任意键取消)', 'n')
  if (confirmRun.toLowerCase() !== 'y') {
    console.log('\n❌ 操作已安全取消，当前项目未做任何修改。\n')
    rl.close()
    return
  }

  // 1. 收集新项目元信息
  console.log('\n--- 步骤 1/4: 收集新项目基本信息 ---')
  const projectName = await ask('📦 新项目代号/目录名 (package.json name)', 'my-zenith-docs')
  const siteTitle = await ask('📝 知识库/站点中文标题', '企业级技术文档中心')
  const siteDesc = await ask('💡 站点一句话描述', '基于 VitePress Zenith 构建的现代化全能型技术知识库')
  const authorName = await ask('👤 项目作者/团队名称', 'Ateng')
  const githubRepo = await ask('🔗 GitHub 仓库开源地址 (如 https://github.com/my-org/my-docs，留空则为私有离线模式)', '')

  // 2. 特性开关配置
  console.log('\n--- 步骤 2/4: 可插拔特性开关与工程配置定制 ---')
  const enableBlogInput = await ask('📰 是否启用技术博客专栏？(y/n)', 'n')
  const enableBlog = enableBlogInput.toLowerCase() === 'y'

  const enableI18nInput = await ask('🌐 是否启用中英双语国际化矩阵？(y/n)', 'n')
  const enableI18n = enableI18nInput.toLowerCase() === 'y'

  const showComponentsNavInput = await ask('🧩 是否在顶栏导航显示组件库参考手册？(y/n)', 'n')
  const showComponentsNav = showComponentsNavInput.toLowerCase() === 'y'

  const enableBannerInput = await ask('📢 是否启用全站顶部公告通知横幅？(y/n)', 'n')
  const enableBanner = enableBannerInput.toLowerCase() === 'y'
  let bannerText = ''
  if (enableBanner) {
    bannerText = await ask('📣 请输入顶部公告横幅文案', `🎉 欢迎查阅 ${siteTitle}！`)
  }

  const enableDeployWorkflowInput = await ask('🚀 是否保留 GitHub Pages 静态站点部署工作流 (deploy.yml)？(y/n)', 'y')
  const enableDeployWorkflow = enableDeployWorkflowInput.toLowerCase() === 'y'

  const enableCiReleaseInput = await ask('📦 是否保留开源质量门禁 CI、自动发版 Release 与容器化工程底座？(y/n)', 'y')
  const enableCiRelease = enableCiReleaseInput.toLowerCase() === 'y'

  const resetGitInput = await ask('🔄 是否彻底重置 Git 提交历史（创建崭新仓库）？(y/n)', 'y')
  const resetGit = resetGitInput.toLowerCase() === 'y'

  console.log('\n--- 步骤 3/4: 执行脱敏与文件重置 ---')

  // 3.1 更新 package.json
  const pkgPath = path.resolve(rootDir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = projectName
    pkg.version = '1.0.0'
    pkg.description = siteDesc
    pkg.author = authorName
    if (githubRepo) {
      pkg.repository = {
        type: 'git',
        url: githubRepo.endsWith('.git') ? githubRepo : `${githubRepo}.git`,
      }
    } else {
      delete pkg.repository
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
    console.log('✅ package.json 元数据重置完成')
  }

  // 3.2 更新 docs/.vitepress/config.ts
  const configPath = path.resolve(rootDir, 'docs/.vitepress/config.ts')
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf-8')

    // 替换站点标题、描述与主题标题
    configContent = configContent.replace(/title:\s*['"][^'"]+['"]/g, `title: '${siteTitle}'`)
    configContent = configContent.replace(/description:\s*['"][^'"]+['"]/g, `description: '${siteDesc}'`)
    configContent = configContent.replace(/siteTitle:\s*['"][^'"]+['"]/g, `siteTitle: '${siteTitle}'`)

    // 更新导航与历史链接中的演示路径为起步指南路径
    configContent = configContent.replaceAll('/guide/what-is-zenith', '/guide/getting-started')
    configContent = configContent.replaceAll('/en/guide/what-is-zenith', '/en/guide/getting-started')

    // 更新 zenithConfig 开关与公告配置
    configContent = configContent.replace(/blog:\s*(true|false)/, `blog: ${enableBlog}`)
    configContent = configContent.replace(/i18n:\s*(true|false)/, `i18n: ${enableI18n}`)
    if (enableBanner) {
      configContent = configContent.replace(
        /banner:\s*(true|false)[^\n]*/,
        `banner: true,             // 顶部全宽公告通知横幅 (<VpBanner>)：已启用\n  bannerText: '${bannerText}',`
      )
    } else {
      configContent = configContent.replace(
        /banner:\s*(true|false)[^\n]*/,
        `banner: false,            // 顶部全宽公告通知横幅 (<VpBanner>)：默认关闭`
      )
    }

    // 顶栏组件库参考手册链接控制
    if (!showComponentsNav) {
      configContent = configContent.replace(/\s*\{\s*text:\s*['"]组件['"],\s*link:\s*['"]\/components\/overview['"]\s*\},?/, '')
      configContent = configContent.replace(/\s*\{\s*text:\s*['"]Components['"],\s*link:\s*['"]\/components\/overview['"]\s*\},?/, '')
    }

    // 社交仓库与编辑此页链接适配
    if (githubRepo) {
      const cleanRepo = githubRepo.replace(/\/$/, '').replace(/\.git$/, '')
      configContent = configContent.replace(
        /socialLinks:\s*\[[\s\S]*?\{[\s\S]*?icon:\s*['"]github['"][\s\S]*?\}[\s\S]*?\]/,
        `socialLinks: [\n      { icon: 'github', link: '${cleanRepo}' },\n    ]`
      )
      configContent = configContent.replaceAll(
        'https://github.com/atengk/vitepress-zenith/edit/master/docs/:path',
        `${cleanRepo}/edit/master/docs/:path`
      )
    } else {
      configContent = configContent.replace(
        /socialLinks:\s*\[[\s\S]*?\{[\s\S]*?icon:\s*['"]github['"][\s\S]*?\}[\s\S]*?\]/,
        `socialLinks: []`
      )
      configContent = configContent.replaceAll(
        'https://github.com/atengk/vitepress-zenith/edit/master/docs/:path',
        ''
      )
    }

    // 页脚版权年份与作者名称更新
    const currentYear = new Date().getFullYear()
    configContent = configContent.replace(
      /copyright:\s*['"][^'"]+['"]/,
      `copyright: 'Copyright © ${currentYear}-present ${siteTitle || authorName}'`
    )

    // PWA Manifest 名称与描述更新
    configContent = configContent.replace(/name:\s*['"]VitePress Zenith[^'"]*['"]/, `name: '${siteTitle}'`)
    configContent = configContent.replace(/short_name:\s*['"][^'"]+['"]/, `short_name: '${projectName}'`)

    fs.writeFileSync(configPath, configContent, 'utf-8')
    console.log('✅ docs/.vitepress/config.ts 特性开关、导航与品牌元数据配置完成')
  }

  // 3.3 清理业务演示文档并创建起步模板
  safeRemove('docs/guide')
  safeRemove('docs/v0')

  if (!enableBlog) {
    safeRemove('docs/blog')
  } else {
    safeRemove('docs/blog/posts')
    writeFile(
      'docs/blog/posts/welcome.md',
      `---
title: 欢迎使用 ${siteTitle} 团队博客
date: ${new Date().toISOString().split('T')[0]}
author: ${authorName}
tags:
  - 架构
  - 起步
description: 本站点已启用基于 VitePress Zenith 的技术博客专栏，在此沉淀团队技术洞察与演进历程。
---

# 欢迎使用 ${siteTitle} 团队博客

这是由 **${authorName}** 发起的第一篇团队技术博客。

您可以在此目录持续新增 Markdown 文件，系统将自动汇总至博文矩阵与时间轴归档。
`
    )
    console.log('✅ 博客起步博文初始化完成 (docs/blog/posts/welcome.md)')
  }

  if (!enableI18n) {
    safeRemove('docs/en')
  } else {
    safeRemove('docs/en/guide')
    writeFile(
      'docs/en/guide/getting-started.md',
      `---
title: Getting Started
order: 1
---

# Welcome to ${siteTitle}

This is the starter documentation based on **VitePress Zenith**.
`
    )
    console.log('✅ 英文起步指南初始化完成 (docs/en/guide/getting-started.md)')
  }

  // 生成起步文档 docs/guide/getting-started.md
  writeFile(
    'docs/guide/getting-started.md',
    `---
title: 快速起步
order: 1
---

# 欢迎使用 ${siteTitle}

这是基于 **VitePress Zenith** 模板初始化的新项目技术文档起步页面。

---

## 1. 核心概述

${siteDesc}

您可以直接在此目录下编辑 Markdown 文档，或者创建新的子目录以构建分层分类体系。

---

## 2. 交互组件使用指南

本模板已全局预置了丰富的交互短代码组件库（如卡片矩阵、时间轴、深浅色模式自适应图片、视频播放器等）。

如需查阅组件属性与调用范例，请参考本地内参文档：[组件库总览与使用范例](../components/overview.md)。
`
  )
  console.log('✅ 新项目业务指南初始化完成 (docs/guide/getting-started.md)')

  // 3.4 重置首页落地页 docs/index.md
  const secondAction = showComponentsNav
    ? `    - theme: alt
      text: 组件参考手册
      link: /components/overview`
    : `    - theme: alt
      text: 架构设计决策
      link: /adr/0001-init-project`

  writeFile(
    'docs/index.md',
    `---
layout: home

hero:
  name: "${siteTitle}"
  text: "新一代现代化技术知识矩阵"
  tagline: "${siteDesc}"
  image:
    src: /logo.svg
    alt: ${siteTitle}
  actions:
    - theme: brand
      text: 立即查阅指南 →
      link: /guide/getting-started
${secondAction}

features:
  - icon: 🎯
    title: 领域深耕
    details: 面向当前特定技术领域构建的高内聚架构文档与规范指南。
  - icon: ⚡
    title: 极速响应
    details: 基于 Vite 与 VitePress 现代化流水线，毫秒级热更新与离线秒开体验。
  - icon: 💎
    title: 旗舰交互
    details: 集成沉浸式专注阅读 (Zen Mode)、动态色盘换肤与白皮书级纯净打印。
---
`
  )
  console.log('✅ 首页落地页重置完成 (docs/index.md)')

  // 3.5 重置 CONTEXT.md
  writeFile(
    'CONTEXT.md',
    `# ${siteTitle} 领域模型规范

本项目基于 VitePress Zenith 模板构建，用于沉淀特定业务领域的核心知识与架构规范。

## 统一领域语言 (Language)

**核心概念 (Core Domain Concept)**:
在此定义新项目首个核心业务实体的清晰职责与边界约束。
_Avoid_: 混淆业务名词, 模糊定义
`
  )
  console.log('✅ 领域模型词汇表重置完成 (CONTEXT.md)')

  // 3.6 重置 docs/adr/
  safeRemove('docs/adr')
  writeFile(
    'docs/adr/0001-init-project.md',
    `# 0001. 初始化 ${siteTitle} 技术架构

为了规范新项目的文档体系与工程治理，我们决定基于 VitePress Zenith 现代化技术模板构建本项目。

## 考虑备选

- **原生 VitePress 裸写**：需要耗费大量时间自行拼装插件与主题扩展，易产生割裂；
- **第三方封闭文档平台**：缺乏代码库同构协同能力与离线部署自主权；
- **基于 VitePress Zenith 模板派生（采纳）**：开箱即用集成全套交互组件、沉浸阅读、离线 PWA 与统一协同规范。

## 产生的后果

- 团队获得统一、高质感的现代技术文档矩阵；
- 遵循领域驱动模型 (CONTEXT.md) 与架构决策记录 (ADR) 协同流程。
`
  )
  console.log('✅ 架构决策记录重置完成 (docs/adr/0001-init-project.md)')

  // 3.7 重置根目录工程文档 README.md 与 AGENTS.md
  const readmePath = path.resolve(rootDir, 'README.md')
  const templateReadmePath = path.resolve(rootDir, 'README.template.md')
  if (fs.existsSync(readmePath) && !fs.existsSync(templateReadmePath)) {
    fs.renameSync(readmePath, templateReadmePath)
  }
  writeFile(
    'README.md',
    `# ${siteTitle}

> ${siteDesc}

本项目基于现代化全能型文档矩阵架构构建，提供毫秒级热更体验、离线全文检索、沉浸式阅读与自适应组件支持。

---

## 🚀 快速起步

### 1. 安装项目依赖

\`\`\`bash
pnpm install
\`\`\`

### 2. 启动本地开发服务

\`\`\`bash
pnpm dev
\`\`\`

本地开发服务将运行在 \`http://localhost:5173\`，编辑 Markdown 即刻获得热更新渲染。

### 3. 执行 TypeScript 严格类型检查

\`\`\`bash
pnpm typecheck
\`\`\`

### 4. 构建生产级静态站点 (SSG)

\`\`\`bash
pnpm build
\`\`\`

静态部署产物将输出至 \`docs/.vitepress/dist\`。

### 5. 本地预览生产构建产物

\`\`\`bash
pnpm preview
\`\`\`

### 6. 交互式规范化提交 (Conventional Commits)

\`\`\`bash
pnpm commit
\`\`\`

### 7. 全生命周期安全发版与演练

\`\`\`bash
# 演练模式 (不产生实际 Git 变更，安全验证前置自检)
pnpm release -- --dry-run

# 正式发版 (自检通过后自动更新版本号、打附注 Tag 并推送到远端)
pnpm release v1.0.0
\`\`\`

### 8. 极简轻量容器化部署 (Docker ~25MB)

\`\`\`bash
# 构建本地生产镜像
docker build -t ${projectName}:latest .

# 启动容器并在本地访问 http://localhost:8080
docker run -d -p 8080:80 --name ${projectName} ${projectName}:latest
\`\`\`

---

## 📁 核心目录结构

\`\`\`text
├── docs/                    # 技术文档、静态资源与知识库正文
│   ├── .vitepress/          # 全站主题、插件与导航配置
│   ├── guide/               # 业务指引与技术知识库正文
│   ├── public/              # 静态公共资源（Logo、自定义配图）
│   └── index.md             # 站点落地首页
├── deploy/                  # 生产级 Nginx 与静态容器配置
├── scripts/                 # 发版防呆 (release.sh) 与规范提交 (commit.sh)
├── Dockerfile               # 极简 Node 构建 + Nginx Alpine 多阶段镜像
├── .cliff.toml              # 自动化语义更新日志生成规则
├── CONTEXT.md               # 业务领域模型真理来源
├── AGENTS.md                # 仓库开发规范与 AI 协同协议
└── package.json
\`\`\`

---

## 📚 模板参考与内参

本项目派生自 **VitePress Zenith** 模板。如需查阅内置的各种交互短代码组件（卡片、时间轴、双模图片、API 表格等）调用范例与高级主题配置，请参考本地内参：
- [模板功能总览与内参说明](./README.template.md)
`
  )
  console.log('✅ README.md 已重置为新项目专属规范文档 (母体模板内参备份为 README.template.md)')

  const agentsPath = path.resolve(rootDir, 'AGENTS.md')
  if (fs.existsSync(agentsPath)) {
    let agentsContent = fs.readFileSync(agentsPath, 'utf-8')
    agentsContent = agentsContent.replace(
      /本项目是基于 VitePress 1\.6\+ 与 Vue 3\.5 构建的现代化全能型技术文档、知识库与技术博客矩阵模板（VitePress Zenith）。/,
      `本项目是【${siteTitle}】，${siteDesc}。基于 VitePress 1.6+ 与 Vue 3.5 构建。`
    )
    fs.writeFileSync(agentsPath, agentsContent, 'utf-8')
    console.log('✅ AGENTS.md 业务项目名称与协同规范已同步更新')
  }

  // 3.8 GitHub Actions 与持续集成工作流控制
  const deployYmlPath = path.resolve(rootDir, '.github/workflows/deploy.yml')
  if (enableDeployWorkflow) {
    if (fs.existsSync(deployYmlPath)) {
      let deployContent = fs.readFileSync(deployYmlPath, 'utf-8')
      deployContent = deployContent.replace(
        /name:\s*部署 VitePress Zenith 至 GitHub Pages/,
        `name: 部署 ${siteTitle} 至 GitHub Pages`
      )
      fs.writeFileSync(deployYmlPath, deployContent, 'utf-8')
      console.log('✅ .github/workflows/deploy.yml 工作流名称已更新')
    }
  } else {
    safeRemove(deployYmlPath)
    console.log('✅ 已安全移除 GitHub Pages 部署工作流 (deploy.yml)')
  }

  if (!enableCiRelease) {
    safeRemove('.github/workflows/ci.yml')
    safeRemove('.github/workflows/release.yml')
    safeRemove('.github/dependabot.yml')
    safeRemove('.github/ISSUE_TEMPLATE')
    safeRemove('.github/PULL_REQUEST_TEMPLATE.md')
    safeRemove('.cliff.toml')
    safeRemove('.githooks')
    safeRemove('SECURITY.md')
    safeRemove('CODE_OF_CONDUCT.md')
    safeRemove('scripts/commit.sh')
    safeRemove('scripts/release.sh')
    console.log('✅ 已清理开源 CI/CD 门禁、Git 提交钩子与自动发版工具链')
  } else {
    // 联动更新 SECURITY.md、config.yml 与 .cliff.toml 中的目标仓库
    if (githubRepo) {
      const secPath = path.resolve(rootDir, 'SECURITY.md')
      if (fs.existsSync(secPath)) {
        let secContent = fs.readFileSync(secPath, 'utf-8')
        secContent = secContent.replace(/atengk\/vitepress-zenith/g, githubRepo)
        fs.writeFileSync(secPath, secContent, 'utf-8')
      }
      const issueConfigPath = path.resolve(rootDir, '.github/ISSUE_TEMPLATE/config.yml')
      if (fs.existsSync(issueConfigPath)) {
        let issueConfigContent = fs.readFileSync(issueConfigPath, 'utf-8')
        issueConfigContent = issueConfigContent.replace(/atengk\/vitepress-zenith/g, githubRepo)
        fs.writeFileSync(issueConfigPath, issueConfigContent, 'utf-8')
      }
      const cliffPath = path.resolve(rootDir, '.cliff.toml')
      if (fs.existsSync(cliffPath)) {
        const repoParts = githubRepo.split('/')
        if (repoParts.length === 2) {
          let cliffContent = fs.readFileSync(cliffPath, 'utf-8')
          cliffContent = cliffContent.replace(/owner = "atengk"/, `owner = "${repoParts[0]}"`)
          cliffContent = cliffContent.replace(/repo = "vitepress-zenith"/, `repo = "${repoParts[1]}"`)
          fs.writeFileSync(cliffPath, cliffContent, 'utf-8')
        }
      }
    }
    console.log('✅ 已保留并适配开源质量门禁 CI、自动发版 Release 与容器化工程底座')
  }

  // 若用户两项均未选择保留，则清理整个 .github 目录
  if (!enableDeployWorkflow && !enableCiRelease) {
    safeRemove('.github')
    console.log('✅ 已清理全部 .github/ 工作流与协作模版')
  }

  // 3.9 更新开源许可证版权所有者
  const licensePath = path.resolve(rootDir, 'LICENSE')
  if (fs.existsSync(licensePath)) {
    let licenseContent = fs.readFileSync(licensePath, 'utf-8')
    licenseContent = licenseContent.replace(
      /Copyright 2026-present Ateng and VitePress Zenith Contributors/,
      `Copyright ${new Date().getFullYear()}-present ${authorName || siteTitle} and Contributors`
    )
    fs.writeFileSync(licensePath, licenseContent, 'utf-8')
    console.log('✅ LICENSE 许可证版权所有者已同步更新')
  }

  // 3.10 清理 public/ 演示矢量图片
  safeRemove('docs/public/theme-demo-light.svg')
  safeRemove('docs/public/theme-demo-dark.svg')
  console.log('✅ 已清理 docs/public/ 演示矢量素材 (保留 logo.svg 占位)')

  // 3.11 清空临时工单
  safeRemove('.scratch')

  // 4. 重置 Git 历史（可选）
  console.log('\n--- 步骤 4/4: Git 版本历史管理 ---')
  if (resetGit) {
    try {
      safeRemove('.git')
      execSync('git init', { cwd: rootDir, stdio: 'ignore' })
      execSync('git add -A', { cwd: rootDir, stdio: 'ignore' })
      execSync(`git commit -m "feat: 初始化 ${siteTitle} (基于 VitePress Zenith 模板)"`, {
        cwd: rootDir,
        stdio: 'ignore',
      })
      console.log('✅ Git 提交历史已彻底重置为崭新的 Initial Commit')
    } catch {
      console.log('⚠️ Git 历史重置跳过或未执行成功，您可以手动执行 git init')
    }
  } else {
    console.log('ℹ️ 已保留原有 Git 历史记录')
  }

  console.log('\n======================================================')
  console.log('🎉 恭喜！新项目脱敏与初始化全部完成！')
  console.log('======================================================\n')
  console.log('下一步操作推荐：')
  console.log('  1. 执行 pnpm dev 启动本地实时预览服务器')
  console.log('  2. 在 docs/guide/ 下编写您的业务技术文档')
  console.log('  3. 在 docs/public/ 替换为新项目的品牌 Logo 图标\n')

  rl.close()
}

main().catch((err) => {
  console.error('\n❌ 初始化过程中发生错误:', err)
  rl.close()
  process.exit(1)
})
