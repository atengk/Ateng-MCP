# 任务追踪器：GitHub (Issue Tracker: GitHub)

本代码仓库的所有需求（Issues）、规格（Specs）与任务工单均以 **GitHub Issues** 形式进行统一纳管与追踪。所有 Agent 与开发者操作统一通过 `gh` CLI 执行。

## 核心操作约定 (Conventions)

- **创建工单 (Create an issue)**：
  ```bash
  gh issue create --title "..." --body "..." --label "..."
  ```
  多行文本推荐使用 `--body-file` 或 EOF 输入。
- **查阅工单 (Read an issue)**：
  ```bash
  gh issue view <number> --comments
  ```
- **检索与列出工单 (List issues)**：
  ```bash
  gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'
  ```
  支持附加 `--label`（如 `--label ready-for-agent`）或 `--state` 进行精准过滤。
- **追加评论与进展 (Comment on an issue)**：
  ```bash
  gh issue comment <number> --body "..."
  ```
- **打标签与更新状态 (Apply / remove labels)**：
  ```bash
  gh issue edit <number> --add-label "ready-for-agent"
  gh issue edit <number> --remove-label "needs-triage"
  ```
- **关闭工单 (Close an issue)**：
  ```bash
  gh issue close <number> --comment "已完成交付并闭环"
  ```

远端仓库自动由本地 `git remote -v` 解析推导（绑定 `atengk/vitepress-zenith`）。

---

## 当技能提示“发布至任务追踪器 (publish to the issue tracker)”时

通过 `gh issue create` 直接创建对应 GitHub Issue，并附带相应的分流标签（如 `ready-for-agent`）。

---

## 当技能提示“获取相关工单 (fetch the relevant ticket)”时

执行 `gh issue view <number> --comments` 拉取工单正文与最新讨论记录。

---

## 探路与向导操作 (Wayfinding)

供 `/wayfinder` 等编排类技能使用：
- **全局路线图 (Map)**：单个带有 `wayfinder:map` 标签的 GitHub Issue，包含 Notes / Decisions-so-far / Fog 章节；
- **子任务工单 (Child ticket)**：关联至 Map 的 GitHub 子工单，带有 `wayfinder:<type>` 标签（`research`/`prototype`/`grilling`/`task`）；
- **任务认领 (Claim)**：`gh issue edit <n> --add-assignee @me`；
- **任务闭环 (Resolve)**：`gh issue comment <n> --body "<answer>" && gh issue close <n>`，并同步更新 Map 中的既定决策列表。
