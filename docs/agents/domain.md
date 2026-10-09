# 领域文档规范 (Domain Docs)

定义工程技能在探索与修改本代码库时，如何规范读取与遵循领域文档。

## 探索代码前的前置阅读清单

- 仓库根目录下的 **`CONTEXT.md`**，或者
- 仓库根目录下的 **`CONTEXT-MAP.md`**（若存在）—— 它指向各个子上下文独立的 `CONTEXT.md`。探索时请查阅与当前任务相关的所有上下文文档。
- **`docs/adr/`** 目录 —— 阅读涉及当前工作区域的所有架构决策记录（ADR）。在多上下文仓库中，同步查阅 `src/<context>/docs/adr/` 中的上下文局部决策。

若上述文件暂不存在，**保持静默并直接推进**。无需主动指出缺失，更不要预先建议创建它们。`/domain-modeling` 技能（通过 `/grill-with-docs` 或 `/improve-codebase-architecture` 触发）会在术语或架构决策真正敲定时按需延迟创建。

## 目录结构布局

单上下文仓库（绝大多数项目推荐采用）：

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

多上下文仓库（根目录存在 `CONTEXT-MAP.md`）：

```text
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← 系统全局架构决策
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← 上下文专属架构决策
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## 严格遵循统一领域词汇表 (Glossary)

输出领域概念时（包括工单标题、重构方案、假说推演、测试用例名称等），必须严格使用 `CONTEXT.md` 中定义的标准术语，严禁使用词汇表显式规避的同义词。

若所需概念尚未收录在词汇表中，这是明确的信号 —— 要么当前设想使用了非项目标准命名（需重新审视），要么存在未建模的领域概念（记录以供 `/domain-modeling` 处理）。

## 显式标注 ADR 冲突

若交付方案与既有架构决策记录（ADR）发生冲突，必须显式标注而非静默覆盖：

> _与 ADR-0007（事件溯源订单模型）存在冲突 —— 但值得重新讨论，原因为……_
