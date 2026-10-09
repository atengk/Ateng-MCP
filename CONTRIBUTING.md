# 贡献指南 (Contributing to VitePress Zenith)

感谢你关注并愿意为 **VitePress Zenith** 贡献代码或文档！我们致力于构建兼具极客美学与工业级稳健性的全能型技术文档与知识库矩阵模板。

在提交任何 Pull Request (PR) 之前，请花费几分钟阅读本指南。

---

## 🛠️ 本地开发环境准备

- **Node.js**: `>= 20.0.0`
- **包管理器**: `pnpm` (推荐 `>= 9.0.0`)
- **Git**: 具备标准的 Git CLI 环境（Windows 用户推荐使用 Git Bash 或 WSL）

```bash
# 1. 克隆本仓库到本地
git clone https://github.com/atengk/vitepress-zenith.git
cd vitepress-zenith

# 2. 安装项目依赖（使用锁定版本）
pnpm install

# 3. 启动本地开发服务器（支持热重载，默认端口 5173）
pnpm dev
```

---

## 📋 代码与提交规范

### 1. 规范化提交 (Conventional Commits)
本项目集成 `git-cliff` 自动提取更新日志。请确保所有 Commit 消息严格遵循规范格式：

```
<type>(<scope>): <清晰中文简述>
```

- **常见类型**：`feat`（新特性）、`fix`（缺陷修复）、`docs`（文档）、`perf`（性能优化）、`refactor`（重构）、`style`（样式微调）、`chore`（构建/杂项）。
- **提交守卫钩子**：项目内置了纯原生 `.githooks/commit-msg` 钩子。首次运行提交脚本或手动配置 `git config core.hooksPath .githooks` 即可自动生效，拦截非合规提交并智能放行 Merge / Revert。
- **提交助手**：你可以直接在终端运行交互式向导，或在脚本/AI 中通过参数化命令快速提交：
  ```bash
  # 交互式向导
  pnpm commit

  # 自动化/参数化提交 (推荐先精准 git add，再调用助手)
  bash scripts/commit.sh -t feat -s core -m "实现新功能" -p -y
  ```

### 2. 质量门禁与预检红线
在推送代码或创建 PR 之前，必须在本地运行并通过以下自检命令：

```bash
# 严格类型检查（严禁引入类型断言或缺失类型报错）
pnpm typecheck

# 生产级静态构建（验证产物编译无异常）
pnpm build
```

- **零绝对路径红线**：所有 Markdown 文档与源码间互链 100% 采用相对路径，严禁包含任何宿主机绝对路径。
- **SSR 防御**：任何涉及浏览器专属 API（`window` / `document` / `localStorage`）的交互组件，必须具备 `typeof window !== 'undefined'` 卫语句拦截。

---

## 🚀 维护者发版流程

项目内置全生命周期发版防呆脚本（具备 5 大前置自检、版本号推导与演练模式）：

```bash
# 演练模式：仅执行 5 大自检与规划预览，不修改任何 Git 状态
pnpm release -- --dry-run

# 交互式发版：按提示输入版本号或执行 SemVer 语义化发版
pnpm release v1.2.0
```

发版脚本会自动联动更新 `package.json` 中的版本号、创建附注 Git Tag 并推送到 GitHub，自动触发云端 Release 流水线与 Docker 容器镜像构建。

---

## 🤝 社区准则与安全政策

- **行为准则**：参与本项目社区讨论与协同开发，请共同遵守 [行为准则 (CODE_OF_CONDUCT.md)](./CODE_OF_CONDUCT.md)。
- **安全漏洞报告**：发现疑似安全隐患，请勿在公开 Issue 披露，请遵循 [安全策略 (SECURITY.md)](./SECURITY.md) 通过 GitHub Advisories 或私密邮箱联络维护者。

---

## 📄 开源许可证

本项目遵循 [Apache License 2.0](./LICENSE) 开源协议。提交任何 Pull Request 即代表你同意将你的贡献在 Apache-2.0 协议条款下进行开源分发。

