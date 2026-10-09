# Ateng MCP 统一服务矩阵领域模型规范

本项目基于 VitePress Zenith 模板构建，用于沉淀与发布 Ateng 旗下生产级 Model Context Protocol (MCP) 服务端矩阵的架构设计、配置字典与接入规范。

## 统一领域语言 (Glossary)

- **MCP 服务端 (MCP Server)**: 遵循 Anthropic Model Context Protocol 协议规范独立构建与运行的生产级服务，暴露标准化 Tools、Resources 及 Prompts 接口。
- **协议传输模式 (Transport)**: 支持 Stdio（本地标准输入输出管道）与 SSE（Server-Sent Events 远程长连接网关）双模传输。
- **客户端 / Agent (Client)**: 挂载并调度 MCP 服务的上层智能体或 IDE 宿主环境（如 Claude Desktop、Cursor、Cline、Antigravity 等）。
- **服务矩阵 (Server Matrix)**: 涵盖消息中间件（RocketMQ、Kafka、RabbitMQ）、云原生运维（Kubernetes）、对象存储（S3）与通信工具（Email）等技术领域的高可用服务集合。
