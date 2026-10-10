# 0013. 主干分支迁移至 main 与 CI/CD 官方工具链现代化演进

为了全面对齐现代顶级开源软件的工程标准与 GitHub 平台的最新运行时演进，我们决定将本项目的默认主干分支从历史 `master` 原子迁移为 `main`，并对全套 CI/CD 官方 Actions、Docker 分发体系与 Dependabot 依赖巡检策略进行一体化现代化升级。

## 决策背景

在代码库持续演进至 `v1.3.1+` 的过程中，团队面临以下关键基建演进诉求：
1. **主干命名与现代标准脱节**：现代开源社区已广泛采纳 `main` 作为默认主干分支；此前代码库依然使用 `master`，在 GitHub Pages 部署策略、VitePress 在线“编辑此页”外链及社区协作中存在认知割裂；
2. **GitHub Actions 运行时淘汰警告**：GitHub 官方 Runner 宣布淘汰 Node.js 20 运行环境，由于工作流中锁定的官方 Actions（如 `actions/checkout@v4`、`setup-node@v4` 等）依然基于 Node.js 20 开发，流水线运行期持续产生大量弃用警告；
3. **官方 Actions 集体跳版本导致 PR 碎片化**：为适配 Node.js 24，GitHub 官方与 Docker 官方 Actions 集中发布 Major 主版本跳跃；由于原 Dependabot 仅将 `minor`/`patch` 纳入聚合，导致短期内产生 10 余个分散的独立 PR，并直接触发了仓库的并发限流上限；
4. **容器镜像分发隐患**：此前在云端多架构镜像构建时，若上游发生并发提交可能导致检出源码漂移；此外 Docker Registry 对大写组织/仓库名兼容脆弱，且此前缺少 Prerelease 标签隔离机制。

## 决策内容

1. **主干分支原子重命名至 `main`**：
   - 采用 GitHub 官方原子重命名 API（`POST /repos/{owner}/{repo}/branches/master/rename`），平滑将远端默认主干分支更名为 `main`，自动继承历史 PR 指向与 Web 路由重定向；
   - 同步修正 GitHub Pages 环境（`github-pages` Environment）的部署分支白名单为 `main`；
   - 全量收敛项目内部所有硬编码引用：涵盖 CI/CD 工作流触发分支、VitePress 全局 `editLink` 模板、初始化脚手架（`init-new-project.mjs`）、社区治理文档及发版脚本防御性校验。
2. **CI/CD 全套官方 Actions 原生 Node.js 24 现代化升级**：
   - 全面升级 `actions/checkout@v7` 与 `actions/setup-node@v6`，彻底根除 Node.js 20 弃用警告；
   - 全面升级 GitHub Pages 发布工具链：`actions/configure-pages@v6`、`actions/upload-pages-artifact@v5`、`actions/deploy-pages@v5`；
   - 全面升级 Docker 容器构建套件：`docker/setup-qemu-action@v4`、`docker/setup-buildx-action@v4`、`docker/login-action@v4`、`docker/metadata-action@v6`、`docker/build-push-action@v7`。
3. **发版源码精确防漂移与五维标签矩阵**：
   - 在 `github-release` 阶段输出 `raw_version`、`tag_name` 与 `is_prerelease`；
   - 在 `publish-docker` 任务中检出源码强制指定 <span v-pre>`ref: ${{ needs.github-release.outputs.tag_name }}`</span> 并启用全量历史，实现发版制品的严格不可变性（Immutability）；
   - 前置注入 `REPO_LC=${GITHUB_REPOSITORY,,}` 环境变量，实现镜像命名全小写自动规一化；
   - 配置五维 Docker 标签矩阵，并在 Prerelease 预发场景下自动禁用 `latest`，防止开发期未稳定镜像污染生产。
4. **Dependabot 智能聚合编排加固**：
   - 针对 `github-actions` 生态开启全版本（包含 Major）单一 PR 打包聚合，防止跨大版本时的 PR 轰炸；
   - 将并发 PR 上限提升至 10；
   - 对前端业务 `npm` 依赖继续保留保守的 `minor`/`patch` 过滤，严防类似 TypeScript 6.0 的破坏性大版本盲目混入。

## 考虑备选

- **备选 A（手动推 main 删 master 割接）**：需要人工重建分支、手动修改默认分支并强制删除旧分支，且无法自动继承外部已存在的引用重定向，易引发 PR 冲突与悬空；
- **备选 B（对 Actions 维持个别单列升级）**：造成每次发版或月度巡检时面临大量分散 PR，增加人工审查与多次触发 CI 的资源开销；
- **备选 C（保留 master 分支不变）**：无法与上游模板及行业现代标准对齐，长远看技术债务持续累积。

## 产生的后果

- **正面影响**：
  - 100% 对齐现代开源事实标准与最佳实践；
  - 云端流水线日志纯净无告警，全套 Actions 运行在最新的高性能 Node.js 24 运行时上；
  - 实现了发版源码检出的确定性与镜像标签的企业级安全防护；
  - 依赖巡检更加高效规整，单次聚合 PR 即可完成工具链升级。
- **负面成本/注意事项**：
  - 存量本地克隆仓库需执行 `git branch -m master main` 与 `git remote set-head origin -a` 完成指针校准（发版脚本已内置双分支容错提示）。
