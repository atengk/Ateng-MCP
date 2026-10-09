# 分流标签规范 (Triage Labels)

工程技能遵循五大标准分流角色。本文档定义各角色与本代码仓库任务追踪器中实际使用的标签字符串之间的映射关系。

| mattpocock/skills 标准标签 | 仓库追踪器实际标签 | 语义与职责说明 |
| -------------------------- | ------------------ | -------------- |
| `needs-triage`             | `needs-triage`     | 待评估：维护者需评估此问题与需求 |
| `needs-info`               | `needs-info`       | 待补充：等待提报人补充必要背景或信息 |
| `ready-for-agent`          | `ready-for-agent`  | 待 Agent 执行：需求契约完备，可由自主 Agent 执行 |
| `ready-for-human`          | `ready-for-human`  | 待人工介入：涉及高风险或复杂决策，需人工开发者实现 |
| `wontfix`                  | `wontfix`          | 不予处理：经评估决定不予执行或关闭 |

当技能提及某一分流角色（例如“应用就绪标签 / apply the AFK-ready triage label”）时，请使用本表中对应的标签字符串。

若本仓库采用定制化标签体系，可直接调整第二列对应的实际标签名称。
