# 0001. 初始化 Ateng MCP 统一服务矩阵文档中心架构

为了集中纳管与发布 Ateng 旗下的生产级 Model Context Protocol (MCP) 服务端矩阵（RocketMQ、Kafka、RabbitMQ、Kubernetes、S3、Email 等），提供体系化的接入指南与工具契约展示，我们决定基于 VitePress Zenith 现代化技术模板构建本项目。

## 考虑备选

- **原生 VitePress 裸写**：需要耗费大量时间自行拼装插件与主题扩展，易产生割裂；
- **第三方封闭文档平台**：缺乏代码库同构协同能力与离线部署自主权；
- **基于 VitePress Zenith 模板派生（采纳）**：开箱即用集成全套交互组件、沉浸阅读、离线 PWA 与统一协同规范。

## 产生的后果

- 团队获得统一、高质感的现代技术文档矩阵；
- 遵循领域驱动模型 (CONTEXT.md) 与架构决策记录 (ADR) 协同流程。
