# Ateng MCP 统一服务矩阵文档中心

> 面向大模型与 Agent 生态的现代化 Model Context Protocol (MCP) 统一服务矩阵与官方文档门户

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue?style=flat&logo=github)](https://atengk.github.io/Ateng-MCP/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

本项目基于现代化全能型文档矩阵架构构建，提供毫秒级热更体验、离线全文检索、沉浸式专注阅读 (Zen Mode) 与自适应组件支持。集中托管与呈现 Ateng 开源的生产级 MCP 服务端生态矩阵。

---

## 🌟 MCP 服务端矩阵

| 技术领域 | 服务名称 | 描述 | 状态 |
| :--- | :--- | :--- | :--- |
| **消息中间件** | [`mcp-server-rocketmq`](https://github.com/atengk/mcp-server-rocketmq) | 基于 Spring AI 2 / Spring Boot 4 的 RocketMQ 5 智能化控制面服务端 | [![RocketMQ](https://img.shields.io/github/v/release/atengk/mcp-server-rocketmq?label=Release)](https://github.com/atengk/mcp-server-rocketmq) |
| **消息中间件** | [`mcp-server-kafka`](https://github.com/atengk/mcp-server-kafka) | 基于 Python 与 FastMCP 构建的生产级 Apache Kafka 模型上下文协议服务端 | [![Kafka](https://img.shields.io/github/v/release/atengk/mcp-server-kafka?label=Release)](https://github.com/atengk/mcp-server-kafka) |
| **消息中间件** | [`mcp-server-rabbitmq`](https://github.com/atengk/mcp-server-rabbitmq) | 专为 LLM 打造的生产级 RabbitMQ Model Context Protocol 服务端 | [![RabbitMQ](https://img.shields.io/github/v/release/atengk/mcp-server-rabbitmq?label=Release)](https://github.com/atengk/mcp-server-rabbitmq) |
| **云原生运维** | [`mcp-server-kubernetes`](https://github.com/atengk/mcp-server-kubernetes) | 企业级云原生智能运维与排障服务底座 (Go 原生内核 + 跨平台 npx 零配置即启) | [![Kubernetes](https://img.shields.io/github/v/release/atengk/mcp-server-kubernetes?label=Release)](https://github.com/atengk/mcp-server-kubernetes) |
| **对象存储** | [`mcp-server-s3`](https://github.com/atengk/mcp-server-s3) | 生产级 S3 对象存储 MCP 服务端，深度兼容 RustFS、MinIO、AWS S3、OSS、R2 | [![S3](https://img.shields.io/github/v/release/atengk/mcp-server-s3?label=Release)](https://github.com/atengk/mcp-server-s3) |
| **通信与工具** | [`mcp-server-email`](https://github.com/atengk/mcp-server-email) | 生产级 Email MCP 服务端，支持多账户并发、会话回复保持、IMAP 复合检索 | [![Email](https://img.shields.io/github/v/release/atengk/mcp-server-email?label=Release)](https://github.com/atengk/mcp-server-email) |

---

## 🚀 快速起步

### 1. 安装项目依赖

```bash
pnpm install
```

### 2. 启动本地开发服务

```bash
pnpm dev
```

本地开发服务将运行在 `http://localhost:5173`，编辑 Markdown 即刻获得热更新渲染。

### 3. 执行 TypeScript 严格类型检查

```bash
pnpm typecheck
```

### 4. 构建生产级静态站点 (SSG)

```bash
pnpm build
```

静态部署产物将输出至 `docs/.vitepress/dist`。

### 5. 本地预览生产构建产物

```bash
pnpm preview
```

### 6. 交互式规范化提交 (Conventional Commits)

```bash
pnpm commit
```

### 7. 全生命周期安全发版与演练

```bash
# 演练模式 (不产生实际 Git 变更，安全验证前置自检)
pnpm release -- --dry-run

# 正式发版 (自检通过后自动更新版本号、打附注 Tag 并推送到远端)
pnpm release v1.0.0
```

### 8. 极简轻量容器化部署 (Docker ~25MB)

```bash
# 构建本地生产镜像
docker build -t my-zenith-docs:latest .

# 启动容器并在本地访问 http://localhost:8080
docker run -d -p 8080:80 --name my-zenith-docs my-zenith-docs:latest
```

---

## 📁 核心目录结构

```text
├── docs/                    # 技术文档、静态资源与知识库正文
│   ├── .vitepress/          # 全站主题、插件与导航配置
│   ├── guide/               # 业务指引与技术知识库正文
│   ├── public/              # 静态公共资源（Logo、自定义配图）
│   └── index.md             # 站点落地首页
├── deploy/                  # 生产级 Nginx 与静态容器配置
├── scripts/                 # 发版防呆 (release.sh) 与规范提交 (commit.sh)
├── Dockerfile               # 极简 Node 构建 + Nginx Alpine 多阶段镜像
├── .cliff.toml              # 自动化语义更新日志生成规则
├── CONTEXT.md               # 业务领域模型真理来源
├── AGENTS.md                # 仓库开发规范与 AI 协同协议
└── package.json
```

---

## 📚 模板参考与内参

本项目派生自 **VitePress Zenith** 模板。如需查阅内置的各种交互短代码组件（卡片、时间轴、双模图片、API 表格等）调用范例与高级主题配置，请参考本地内参：
- [模板功能总览与内参说明](./README.template.md)
