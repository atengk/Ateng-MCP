### 变更概述 (Summary of Changes)
<!-- 简要概括本次 PR 解决的问题或引入的新特性，可关联对应 Issue（如 Closes #123） -->

---

### 变更分类 (Type of Change)
- [ ] ✨ 新特性 (`feat`)
- [ ] 🐛 缺陷修复 (`fix`)
- [ ] 📝 文档调整 (`docs`)
- [ ] 💄 样式或视觉微调 (`style`)
- [ ] ♻️ 代码重构 (`refactor`)
- [ ] ⚡ 性能优化 (`perf`)
- [ ] 🤖 CI/CD 或工程配置 (`ci` / `chore`)

---

### 工程规范与质量自检清单 (Pre-flight Checklist)
> 提交 PR 前请逐项核对并勾选确认：

- [ ] **严格类型检查**：本地已运行并通过 `pnpm typecheck`，无任何 TypeScript 报错
- [ ] **生产编译构建**：本地已运行并通过 `pnpm build`，静态产物编译无阻断性错误
- [ ] **零绝对路径红线**：代码与 Markdown 文档内**绝无**宿主机绝对路径（如 `file:///`、`C:/`、`D:/`），站内链接统一使用相对路径
- [ ] **集合空安全**：函数返回列表/集合无匹配时统一返回空数组 `[]`，杜绝未防御的直接链式调用
- [ ] **SSR 安全性**：涉及浏览器专属 API（如 `window`, `document`, `localStorage`）均已前置 `typeof window !== 'undefined'` 卫语句拦截
- [ ] **规范化提交**：Commit 消息遵循 Conventional Commits 格式（如 `feat(shortcode): ...`），便于 `git-cliff` 自动提取 Changelog
