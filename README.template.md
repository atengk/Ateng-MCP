<p align="center">
  <a href="https://github.com/atengk/vitepress-zenith">
    <img src="./docs/public/logo.svg" width="160" height="160" alt="VitePress Zenith Logo" />
  </a>
</p>

<h1 align="center">VitePress Zenith</h1>

<p align="center">
  <strong>现代化顶配旗舰级技术文档、知识库与技术博客矩阵模板</strong>
</p>

<p align="center">
  开箱即用集成沉浸式专注阅读 (Zen Mode)、Shiki Twoslash 动态类型、全局快捷命令中心、Markmap 思维导图、全能富媒体可视化与全站包管理器联动
</p>

<p align="center">
  <a href="https://github.com/atengk/vitepress-zenith/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square" alt="Apache-2.0 License" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node-%3E%3D20.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node Version" />
  </a>
  <a href="https://pnpm.io/">
    <img src="https://img.shields.io/badge/pnpm-%3E%3D9.0.0-f69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm" />
  </a>
  <a href="https://vitepress.dev/">
    <img src="https://img.shields.io/badge/VitePress-^1.6.3-8b5cf6?style=flat-square&logo=vitepress&logoColor=white" alt="VitePress" />
  </a>
  <a href="https://vuejs.org/">
    <img src="https://img.shields.io/badge/Vue-^3.5.0-42b883?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
  </a>
  <a href="https://github.com/atengk/vitepress-zenith/actions">
    <img src="https://img.shields.io/badge/CI%2FCD-Passing-success?style=flat-square&logo=githubactions&logoColor=white" alt="CI/CD" />
  </a>
</p>

---

## 🌟 为什么选择 VitePress Zenith？

在搭建企业级或现代化个人技术文档与知识库时，基于原生 VitePress 往往需要耗费大量时间集成周边插件（如代码悬浮类型、思维导图、全站包管理器切换、灯箱、离线检索、命令中心等），并且经常遭遇样式穿透、依赖冲突、深色模式失调以及移动端适配等痛点。

**VitePress Zenith（天顶）** 正是为此而生：
- 🎯 **开箱即用**：零额外配置，拉取即拥有业界标杆级的设计与交互。
- 💎 **美学天花板**：融合毛玻璃、渐变高光微光、呼吸动效、4 套品牌强调色与白皮书级打印排版。
- 🛠️ **全链路工程生态**：内置 CI/CD、自动生成多级侧边栏、免导入交互组件库与可插拔功能开关矩阵。
- 📶 **离线优先 (PWA)**：断网毫秒级秒开、全站资源自动预缓存与桌面端原生安装体验。

---

## 🚀 12 大杀手级核心特性

| 特性板块 | 说明 |
| :--- | :--- |
| 🎯 **沉浸式专注阅读 (Zen Mode)** | 双侧边栏对称硬件加速展翼平移，加宽至 1180px 黄金阅读画布。支持全局快捷键（`Alt + Z`）与偏好持久化。 |
| ⚡ **Shiki Twoslash 动态类型悬浮** | 在网页代码块中体验 VS Code 级代码悬浮类型推导（`// ^?`）与 TypeScript 编译器语法即时诊断。 |
| ⌨️ **全局交互命令中心 (Command Palette)** | 类似 macOS Spotlight 与 Raycast，按 <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> 或 <kbd>/</kbd> 唤起全文检索与全局快捷动作。 |
| 🎨 **4 套品牌强调色动态切换** | 支持经典紫蓝 (Indigo)、极客翠绿 (Emerald)、炽热赤红 (Crimson) 与日光暖金 (Amber) 即时切换与防闪烁加载。 |
| 📦 **全站联动包管理器选项卡** | 支持 `npm` / `pnpm` / `yarn` / `bun` 一键切换，全站跨页面状态实时无缝同步。 |
| 🔗 **站内内链卡片即时悬浮预览** | 鼠标悬浮站内链接自动弹出上下文卡片摘要与首个标题，提供类似 Wikipedia / Notion 的沉浸式阅读流。 |
| 📶 **PWA 渐进式离线应用与预缓存** | Service Worker 离线全站缓存，弱网/断网秒开，桌面安装横幅，外部流媒体离线优雅降级兜底。 |
| 📐 **全能富媒体与架构可视化** | 原生支持 LaTeX 数学公式、Mermaid 架构流程图、Markmap 交互思维导图与 Medium-zoom 图片全屏灯箱。 |
| 🎬 **自适应多媒体短代码组件** | 封装免 import 的 `<VpImage>`（深浅双模图自适应）、`<VpVideo>`（自适应 MP4）、`<VpBilibili>` 与 `<VpYouTube>`。 |
| 🎛️ **可插拔功能开关矩阵 (`zenithConfig`)** | 在 `config.ts` 集中管控全站 16 项特性开闭，高干扰与无后端特性默认静默，页面 Frontmatter 绝对覆盖。 |
| ⌨️ **全键盘极客导航与速查表** | 按 <kbd>?</kbd> 唤出全键盘速查浮层，支持 <kbd>J</kbd>/<kbd>K</kbd> 翻页、<kbd>T</kbd> 换肤、<kbd>Alt+Z</kbd> 专注模式纯键盘掌控。 |
| 📰 **技术博客、多语言与多版本** | 包含博客时间轴标签筛选流、基于 GitHub Discussions 的 Giscus 评论区、多语言矩阵与历史归档横幅。 |

---

## 🛠️ 快速起步

### 1. 环境准备

确保您的本地开发环境满足以下要求：
- [Node.js](https://nodejs.org/) `>= 20.0.0`
- [pnpm](https://pnpm.io/) `>= 9.0.0`

### 2. 克隆与安装

```bash
# 克隆仓库
git clone https://github.com/atengk/vitepress-zenith.git

# 进入项目目录
cd vitepress-zenith

# 安装依赖
pnpm install
```

### 3. 本地开发与实时预览

```bash
# 启动 VitePress 开发服务器（支持热重载，默认端口 5173）
pnpm dev

# 严格类型诊断检查
pnpm typecheck
```

本地服务启动后，在浏览器访问 [http://localhost:5173](http://localhost:5173) 即可实时查阅。

### 4. 生产编译与预览

```bash
# 编译全站静态产物（输出至 docs/.vitepress/dist）
pnpm build

# 本地启动预览服务器验证生产产物
pnpm preview
```

### 5. 规范化提交与守卫钩子 (Conventional Commits)

```bash
# 方式 A: 交互向导提交
pnpm commit

# 方式 B: 参数化 / AI 一键提交 (推荐先精准 git add，再调用助手)
bash scripts/commit.sh -t feat -s core -m "实现新功能" -p -y
```

> **原生钩子守卫**：项目内置了 `.githooks/commit-msg` 纯 Shell 原生钩子（零外部依赖，毫秒级自愈生效），自动拦截不规范提交并智能放行 Merge / Revert。

### 6. 全生命周期安全发版与演练

```bash
# 演练模式 (不产生实际 Git 变更，安全执行前置自检)
pnpm release -- --dry-run

# 交互式发版 (自检通过后自动更新版本号、打附注 Tag 并推送到 GitHub 触发 Release 流水线)
pnpm release v1.2.1

# CI / 脚本 / AI 一键自动化发版 (-y)
bash scripts/release.sh v1.2.1 -y
```

### 7. 极简轻量容器化部署 (Docker ~25MB)

```bash
# 构建本地生产镜像
docker build -t vitepress-zenith:latest .

# 启动容器 (映射至本地 8080 端口)
docker run -d --name zenith-docs -p 8080:80 vitepress-zenith:latest
```

### 8. 派生并初始化全新业务项目 (Scaffold Sanitization)

若您希望基于本模板为全新的业务领域编写文档，克隆到新目录后只需执行一行交互式初始化向导：

```bash
pnpm init:project
```

向导将交互式引导您输入新项目名称、站点标题与作者，**一键自动安全脱敏并清理原模板中的业务演示数据**，重置元数据、`CONTEXT.md`、ADR 与起步骨架，同时完整保留全套交互短代码组件与主题基建，助您 10 秒开启全新领域文档建设！

---

## 🎛️ 特性开关矩阵 (`themeConfig.zenith`)

Zenith 采用可插拔开关矩阵架构，所有特性均可在 `docs/.vitepress/config.ts` 顶部集中管控：

```ts
const zenithConfig = {
  // 1. 进阶/特定场景特性（默认关闭，按需开启）
  i18n: false,              // 国际化多语言矩阵（关闭时不显示顶栏语言切换）
  versionSwitcher: false,   // 多版本管理与归档横幅（关闭时不显示版本下拉菜单）
  helpful: false,           // 文档有用度评价（无后端埋点占位组件）
  zenModeToggle: false,     // 右下角专注模式悬浮球（快捷键 Alt+Z 仍可直接使用）
  contributors: false,      // 开源贡献者致谢流（单人/私有项目免受侵扰）
  themePicker: false,       // 顶栏主题强调色盘选择器（按需开启）
  banner: false,            // 顶部全宽公告通知横幅（按需开启）
  pwaStatus: false,         // PWA 离线运行感知与安装横幅（按需开启）

  // 2. 旗舰体验特性（做成开关，默认开启，可一键关闭）
  commandPalette: true,     // 全局快捷命令中心浮层 (Ctrl+K / /)
  blog: true,               // 博客系统与导航入口
  mediumZoom: true,         // 正文插图平滑点击放大灯箱
  readingMetrics: true,     // 阅读认知指标（字数与耗时估算）
  readingProgressBar: true, // 页面顶部流光阅读进度条
  linkPreview: true,        // 站内内链卡片悬浮即时预览
  keyboardShortcuts: true,  // 全键盘极客导航与速查浮层
  codeFolding: true,        // 超长代码块（>25行）平滑折叠
}
```

> **页面级覆盖**：任意 Markdown 页面均可通过 Frontmatter 覆盖全局开关（如 `helpful: true` 或 `readingMetrics: false`）。

---

## 🧩 内置交互短代码组件库 (Auto-registered Shortcodes)

在任意 Markdown 文档中均可**直接调用以下组件，无需手动 import**：

| 组件标签 | 使用范例 | 核心功能与应用场景 |
| :--- | :--- | :--- |
| `<VpCardGrid>` & `<VpCard>` | `<VpCardGrid :cols="3"><VpCard title="..." icon="i-lucide-zap" /></VpCardGrid>` | 响应式多列自适应网格与悬浮高光卡片 |
| `<VpBadge>` | `<VpBadge type="tip" dot>默认推荐</VpBadge>` | 6 种语义色与 3 种变体的状态胶囊徽标 |
| `<VpTimeline>` | `<VpTimeline><VpTimelineItem date="..." title="...">...</VpTimelineItem></VpTimeline>` | 版本演进路线图、更新日志与大事件时间线 |
| `<VpLinkCard>` | `<VpLinkCard title="..." link="..." icon="i-lucide-external-link" />` | 推荐关联资源、参考手册与外部链接卡片 |
| `<VpDemoPreview>` | `<VpDemoPreview title="..." :code="...">...</VpDemoPreview>` | 交互运行态沙箱、源码折叠与一键试跑 |
| `<VpApiTable>` | `<VpApiTable><VpApiItem name="src" type="string" required desc="..." /></VpApiTable>` | 结构化参数契约表，支持移动端卡片式自适应 |
| `<VpPlayground>` | `<VpPlayground :files="{ 'index.ts': '...' }" />` | 一键投送 WebContainer 虚拟机秒级试跑 |
| `<VpContributors>` | `<VpContributors :contributors="[...]" />` | 基于 Git 提交历史的贡献者头像行与协作入口 |
| `<VpBlogList>` | `<VpBlogList />` | 博客专栏分类标签无刷新过滤与文章卡片流 |
| `<VpImage>` | `<VpImage light="..." dark="..." caption="..." />` | 浅色/深色主题双图自适应切换与居中图注 |
| `<VpVideo>` | `<VpVideo src="..." poster="..." caption="..." />` | 自适应 16:9 高质感视频播放器与离线兜底 |
| `<VpBilibili>` | `<VpBilibili bvid="BV1xx411c7mD" />` | B站视频自适应嵌入，默认关闭弹幕防打扰 |
| `<VpYouTube>` | `<VpYouTube id="dQw4w9WgXcQ" />` | 官方隐私增强模式国际化视频流嵌入 |

---

## 📁 项目架构与目录结构

```text
vitepress-zenith/
├── .github/
│   ├── ISSUE_TEMPLATE/        # 特化缺陷反馈与需求建议 Issue 模板
│   ├── PULL_REQUEST_TEMPLATE  # 集成零绝对路径与质量自检清单的 PR 模板
│   └── workflows/
│       ├── ci.yml             # 质量门禁 (PR & Push 自动执行类型检查与构建)
│       ├── deploy.yml         # GitHub Actions 自动化构建与 GitHub Pages 部署
│       └── release.yml        # 双通道发版、git-cliff 更新日志与 Docker GHCR 推送
├── docs/                      # 文档与博客源码目录
│   ├── .vitepress/            # VitePress 核心配置与定制主题
│   ├── adr/                   # 架构决策记录 (ADR-0001 ~ ADR-0011)
│   ├── blog/                  # 技术博客文章矩阵（标签筛选与时间线归档）
│   ├── components/            # 交互短代码组件总览与使用范例
│   ├── guide/                 # 基础指南与实战手册 (Zen Mode, Twoslash, 容器化等)
│   └── index.md               # 首页 Hero 落地页
├── .githooks/
│   └── commit-msg             # 纯原生 Shell 提交守卫钩子 (Conventional 规范校验)
├── deploy/
│   └── nginx.conf             # 生产级 Nginx 配置 (Clean URLs、Gzip、长效强缓存)
├── scripts/
│   ├── commit.sh              # 规范化提交助手 (支持向导与 AI/非交互式参数)
│   ├── release.sh             # 全生命周期发版防呆自检脚本 (支持 -y 与 --dry-run)
│   └── init-new-project.mjs   # 新项目脚手架脱敏与一键初始化程序
├── Dockerfile                 # 极简多阶段 Docker 构建配置 (~25MB)
├── .cliff.toml                # git-cliff 自动化增量变更日志提取与分组规则
├── .dockerignore              # Docker 镜像构建忽略规则
├── .editorconfig              # 跨 IDE 编码风格与 2 空格缩进规范
├── .gitattributes             # Git 行尾规范 (强制 text=auto eol=lf)
├── SECURITY.md                # 安全策略与负责任私密漏洞披露渠道
├── CODE_OF_CONDUCT.md         # 社区行为准则 (Contributor Covenant v2.1)
├── CONTRIBUTING.md            # 开发者与开源贡献指南
├── CONTEXT.md                 # 核心领域语言定义与术语规范 (Ubiquitous Language)
├── AGENTS.md                  # 仓库级 AI Agent 协同行为准则与架构约定
├── package.json               # 项目依赖、指令与 Apache-2.0 许可证声明
└── README.md                  # 项目核心说明文档
```

---

## 🚢 自动化 CI/CD 与多维交付体系

项目基于 [atengk/oss-template](https://github.com/atengk/oss-template) 构建了三维立体 GitHub Actions 流水线：

1. **持续集成质量门禁 (`.github/workflows/ci.yml`)**：
   在 Pull Request 或向主干推送时，自动化执行 PR 标题规范校验（`action-semantic-pull-request`）、ShellCheck 静态分析、`pnpm typecheck` 与 `pnpm build`，杜绝任何语法与构建损坏。
2. **文档即时发布 (`.github/workflows/deploy.yml`)**：
   合并至 `main` / `master` 分支后，自动将最新文档构建并发布至 **GitHub Pages**。
3. **全自动发版与容器镜像分发 (`.github/workflows/release.yml`)**：
   当本地运行 `pnpm release` 推送附注 Tag（或在网页调度发版）时，流水线将自动：
   - 提取增量 `git-cliff --latest` 解析生成精美分类 Release Notes；
   - 压缩打包生产静态产物为 `vitepress-zenith-dist-*.zip` 并计算 SHA-256 校验和挂载至 GitHub Release；
   - 自动构建 `linux/amd64` 与 `linux/arm64` 双架构轻量 Docker 镜像并推送至 **GitHub Container Registry (`ghcr.io`)**。
4. **依赖自动化巡检 (`.github/dependabot.yml`)**：
   每月定时巡检 Actions 与依赖库版本并自动提交安全升级 PR。

---

## 📄 开源许可证

本项目基于 [Apache License 2.0](./LICENSE) 开源发布，欢迎自由使用、商业应用与二次定制。

