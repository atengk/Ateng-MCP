# 仓库协同与 Agent 开发规范 (Agent Guidelines)

本项目是【Ateng MCP 生产级服务矩阵文档中心】，基于 VitePress Zenith 构建的现代化全能型技术知识库。基于 VitePress 1.6+ 与 Vue 3.5 构建。

本文档定义了 AI Agent 与开发者在维护、演进及重构本代码库时必须严格遵循的工程规范、架构约定与协同原则。

---

## 1. 核心架构与扩展范式

### 1.1 默认主题扩展架构 (Extended Default Theme)
- **主题入口**：统一位于 `docs/.vitepress/theme/index.ts`，基于 VitePress 官方默认主题扩展，严禁裸写封闭主题；
- **布局插槽装配**：全局插槽与全站增强视图集中在 `docs/.vitepress/theme/Layout.vue`；
- **免导入交互短代码 (Auto-registered Shortcodes)**：所有交互组件统一以 `Vp` 为前缀（如 `<VpCard>`, `<VpVideo>`, `<VpApiTable>`），在 `index.ts` 中全局注册，允许在 Markdown 中免 `import` 直接书写；
- **原子化样式与图标**：样式优先采用 UnoCSS 原子类与 `i-lucide-*` 纯 CSS 图标体系，全站色彩引用 `--vp-c-brand-1` 等语义变量。

### 1.2 可插拔功能开关矩阵 (Pluggable Feature Switch Matrix)
全站进阶特性统一在 `docs/.vitepress/config.ts` 中的 `themeConfig.zenith` 进行强类型集中管控：
- **进阶/高干扰特性默认静默 (Opt-in，默认 `false`)**：`i18n`（多语言切换）、`versionSwitcher`（多版本下拉与归档横幅）、`helpful`（点赞点踩）、`zenModeToggle`（右下角专注悬浮球）、`contributors`（贡献者致谢流）、`themePicker`（顶栏主题强调色盘选择器）、`banner`（顶部全宽公告通知横幅）、`pwaStatus`（PWA 离线安装感知弹窗）；
- **核心体验特性做成开关（默认开启 `true`，可一键全局关闭）**：`commandPalette`、`blog`、`mediumZoom`、`readingMetrics`、`readingProgressBar`、`linkPreview`、`keyboardShortcuts`、`codeFolding`、`zenMode`；
- **单页 Frontmatter 绝对覆盖**：任意 Markdown 可通过 `helpful: true` 或 `readingMetrics: false` 进行局部覆盖。首页（`layout: home`）强制跳过正文增强组件。

---

## 2. 代码质量与工程红线

- **零绝对路径红线 (Zero Absolute Path)**：
  严禁将 `file:///` 或包含宿主机盘符（如 `C:/`、`D:/`）的绝对路径写入任何 Markdown 交付物正文；文档间互链 100% 采用标准相对路径（如 `./`、`../`），源码引用采用工程相对路径。
- **集合空安全契约 (Null Safety)**：
  列表/集合无匹配数据时，统一返回空数组 `[]`，严禁返回 `null`；单个对象查询允许返回 `null`，但调用方必须前置卫语句拦截。
- **并发与单例无状态**：
  状态管理与 Composable 保持单例无状态或单向数据流，严禁使用非受管全局对象污染客户端运行期；涉及 DOM 与浏览器 API 访问必须前置 `typeof window !== 'undefined'` SSR 安全防御。
- **多媒体与流媒体规范**：
  - 插图优先采用相对路径或 `public/` 静态目录，禁止将大体积高清视频（>10MB）直接提交至 Git 仓库源码树；
  - 视频与流媒体必须维持 16:9 响应式比例（`aspect-ratio: 16 / 9`），并自带微光骨架屏与 PWA 离线断网优雅降级兜底。

---

## 3. 领域模型与协同工作流

### 3.1 领域统一语言 (Domain Glossary)
- 根目录 `CONTEXT.md` 是全站唯一的领域模型真理来源。新增或变更核心业务概念时，必须同步在此登记，保持架构词汇一致；
- 详见 [docs/agents/domain.md](./docs/agents/domain.md)。

### 3.2 架构决策记录 (ADR)
- 针对不可逆、影响深远或权衡显著的架构调整，在 `docs/adr/` 目录下按编号创建标准化决策记录（如 `0008-zenith-theme-config-feature-switches.md`）；
- 每次架构变更只增加不篡改历史。

### 3.3 工单追踪系统 (GitHub Issues)
- 基于 GitHub Issues 与 `gh` CLI 统一纳管需求、规格与任务工单；
- 严格遵循五大标准分流标签（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`）；
- 详见 [docs/agents/issue-tracker.md](./docs/agents/issue-tracker.md) 与 [docs/agents/triage-labels.md](./docs/agents/triage-labels.md)。

---

## 4. 常用开发与校验命令

```bash
# 启动本地开发服务（热重载，默认端口 5173）
pnpm dev

# 执行 TypeScript 严格类型检查
pnpm typecheck

# 构建生产级静态文档产物（输出至 docs/.vitepress/dist）
pnpm build

# 本地启动静态产物预览服务器
pnpm preview
```
