---
title: MCP 服务矩阵总览
order: 1
---

# MCP 服务矩阵总览

面向大模型与 Agent 生态的现代化 **Model Context Protocol (MCP)** 生产级服务端矩阵。通过标准化协议连接底层消息队列、云原生编排系统、对象存储与企业通信体系，赋予大语言模型对真实生产环境的安全感知与精确操作能力。

---

## 1. 矩阵服务导航

点击对应卡片即可进入具体服务端的详细架构设计、Tools 契约字典与客户端挂载指南：

<VpCardGrid :cols="3">
  <VpCard
    title="RocketMQ 5 控制面"
    desc="基于 Spring AI 2 与 Spring Boot 4 的企业级控制面，覆盖集群拓扑、Topic/消费组治理与死信队列重投。"
    icon="i-lucide-layers"
    badge="Spring AI / Java 21"
    badgeType="tip"
    link="./messaging/rocketmq.md"
  />
  <VpCard
    title="Kafka 生产级服务"
    desc="基于 FastMCP 与 aiokafka 异步架构，提供双重安全只读防线、零位移侵入消息采样与 Lag 堆积诊断。"
    icon="i-lucide-activity"
    badge="FastMCP / Python"
    badgeType="tip"
    link="./messaging/kafka.md"
  />
  <VpCard
    title="RabbitMQ 智能服务"
    desc="Go 原生高性能内核，深度打通 AMQP 0-9-1 与 Management API，支持拓扑声明与无害消息排查。"
    icon="i-lucide-shuffle"
    badge="Go / AMQP"
    badgeType="info"
    link="./messaging/rabbitmq.md"
  />
  <VpCard
    title="Kubernetes 智能运维"
    desc="基于官方 client-go 构建的云原生 SRE 底座，支持 Pod 故障排障、容器日志流式读取与事件审计。"
    icon="i-lucide-box"
    badge="Go / client-go"
    badgeType="purple"
    link="./cloud/kubernetes.md"
  />
  <VpCard
    title="S3 对象存储"
    desc="深度兼容 RustFS、MinIO、AWS S3 与阿里云 OSS，内置三位一体安全防灾铁律与并发分段上传。"
    icon="i-lucide-hard-drive"
    badge="TypeScript / Node"
    badgeType="tip"
    link="./storage/s3.md"
  />
  <VpCard
    title="Email 邮件服务"
    desc="支持多账户并发、RFC 会话回复保持、IMAP 复合检索、附件安全沙箱与防灾软删除的邮件能力底座。"
    icon="i-lucide-mail"
    badge="TypeScript / Node"
    badgeType="info"
    link="./tools/email.md"
  />
</VpCardGrid>

---

## 2. 服务矩阵架构拓扑

```mermaid
flowchart TD
    subgraph Clients["主流 Agent 客户端 (MCP Host)"]
        C1["Claude Desktop"]
        C2["Cursor IDE"]
        C3["Cline"]
        C4["Google Antigravity"]
    end

    subgraph Gateway["MCP 统一协议层 (Stdio / SSE)"]
        GW["Model Context Protocol 规范"]
    end

    subgraph Matrix["Ateng MCP 生产级服务端矩阵"]
        subgraph MQ["消息队列 (MQ)"]
            S1["RocketMQ 5 控制面<br/>(Spring AI 2 / Spring Boot 4)"]
            S2["Kafka 生产级服务<br/>(FastMCP / Python 3.11+)"]
            S3["RabbitMQ 智能服务<br/>(Go 1.22+ / AMQP 0-9-1)"]
        end
        subgraph Cloud["云原生与存储"]
            S4["Kubernetes 智能运维<br/>(Go 1.22+ / client-go)"]
            S5["S3 对象存储<br/>(TypeScript / Node.js >= 20)"]
        end
        subgraph Tools["通信与协作"]
            S6["Email 邮件服务<br/>(TypeScript / Node.js >= 20)"]
        end
    end

    Clients ==> Gateway
    Gateway --> S1
    Gateway --> S2
    Gateway --> S3
    Gateway --> S4
    Gateway --> S5
    Gateway --> S6
```

---

## 3. 技术规范与协议支持对比

下表汇总了服务矩阵中全部 6 大服务端的实现栈、通信协议与运行依赖要求：

| 服务名称 | 领域分类 | 核心技术栈 | 通信协议 | 运行接入方式 | 详情文档 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RocketMQ 5 控制面** | 消息队列 | Spring AI 2 + Spring Boot 4 + JDK 21 | Stdio / SSE | `npx -y @atengk/mcp-server-rocketmq` | [查看文档](./messaging/rocketmq.md) |
| **Kafka 生产级服务** | 消息队列 | Python 3.11+ + FastMCP + aiokafka | Stdio / SSE | `uvx atengk-mcp-server-kafka` | [查看文档](./messaging/kafka.md) |
| **RabbitMQ 智能服务** | 消息队列 | Go 1.22+ + AMQP 0-9-1 + REST API | Stdio / SSE | `npx -y @atengk/mcp-server-rabbitmq` | [查看文档](./messaging/rabbitmq.md) |
| **Kubernetes 智能运维**| 云原生运维 | Go 1.22+ + k8s client-go | Stdio / SSE | `npx -y @atengk/mcp-server-kubernetes` | [查看文档](./cloud/kubernetes.md) |
| **S3 对象存储** | 存储介质 | TypeScript + Node >= 20 + AWS SDK v3 | Stdio / SSE | `npx -y @atengk/mcp-server-s3` | [查看文档](./storage/s3.md) |
| **Email 邮件服务** | 通信协作 | TypeScript + Node >= 20 + Nodemailer | Stdio / SSE | `npx -y @atengk/mcp-server-email` | [查看文档](./tools/email.md) |

---

## 4. 快速接入与后续指引

无论您使用哪种 Agent 客户端，均可通过标准 JSON 描述完成服务矩阵的挂载与鉴权配置：

- 客户端配置速查：[多客户端统一接入指南](../guide/client-setup.md)
- 快速入门教程：[快速起步](../guide/getting-started.md)
