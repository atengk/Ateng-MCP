---
title: RabbitMQ 智能服务端
order: 3
---

# RabbitMQ 智能 MCP 服务端

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <a href="https://github.com/atengk/mcp-server-rabbitmq" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/GitHub-atengk%2Fmcp--server--rabbitmq-blue?logo=github&style=flat-square" alt="GitHub Repo" />
  </a>
  <img src="https://img.shields.io/badge/RabbitMQ-3.13+-orange.svg?style=flat-square" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Go-1.22+-blue.svg?style=flat-square" alt="Go 1.22+" />
  <img src="https://img.shields.io/badge/AMQP-0--9--1-red.svg?style=flat-square" alt="AMQP 0-9-1" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square" alt="License" />
</div>

`mcp-server-rabbitmq` 是专为大语言模型与自主智能体打造的生产级 **RabbitMQ Model Context Protocol (MCP)** 服务端，基于高并发 Go 原生内核构建。它深度结合 AMQP 0-9-1 协议与 RabbitMQ HTTP Management API，向 AI 助手暴露完整的 AMQP 拓扑声明、消息发布与排障消费、队列深度监控与死信治理能力。

---

## 1. 核心架构与协议融合

```mermaid
flowchart TD
  subgraph AI_Host["AI 宿主环境 (Claude / Cursor / Antigravity)"]
    Agent["LLM Agent 编程与运维大脑"]
  end

  subgraph MCP_Server["mcp-server-rabbitmq (Go 原生高性能内核)"]
    direction TB
    Transport["Stdio 管道传输 / HTTP SSE 长连接"]
    Safety["安全门禁 (Read-Only Guard & 4KB 截断)"]
    
    subgraph Toolsets["12 项核心原子运维工具"]
      Overview["集群全景与指标监控"]
      QueueOps["队列全生命周期管理"]
      ExchangeOps["Exchange 交换机与路由拓扑"]
      MessageOps["消息发布与安全无害拉取"]
    end

    DualDriver["AMQP 0-9-1 协议通道 + Management REST API 双驱动"]
  end

  subgraph Cluster["RabbitMQ 消息中间件集群"]
    Broker["RabbitMQ Broker (AMQP 端口 5672)"]
    MgmtAPI["Management Plugin (HTTP 端口 15672)"]
  end

  Agent -->|Stdio / SSE| Transport
  Transport --> Safety
  Safety --> Toolsets
  Toolsets --> DualDriver
  DualDriver -->|AMQP 消息链路| Broker
  DualDriver -->|REST 指标巡检| MgmtAPI
```

---

## 2. Tools 工具契约字典 (共 12 项)

| 模块分类 | 工具标识 (Tool Name) | 核心入参 (Parameters) | 职责与安全规范 |
| :--- | :--- | :--- | :--- |
| **集群概览** | `rabbitmq_overview` | *(无入参)* | 检查 RabbitMQ 节点健康度、Erlang 版本、连接数与全集群消息吞吐率 |
| **队列治理** | `rabbitmq_list_queues` | `vhost?`, `name_pattern?` | 列出队列就绪消息数、未确认消息数、消费者数量与内存占用 |
| | `rabbitmq_declare_queue` | **`name`**, `vhost?`, `durable?`, `auto_delete?`, `arguments?` | 声明式创建队列（支持 `x-max-length`、`x-dead-letter-exchange` 等死信拓扑） |
| | `rabbitmq_delete_queue` | **`name`**, `vhost?`, `if_unused?`, `if_empty?` | 删除指定队列（只读门禁下隐藏） |
| | `rabbitmq_purge_queue` | **`name`**, `vhost?` | 清空指定队列中积压的所有消息（只读门禁下隐藏） |
| **交换机与绑定** | `rabbitmq_list_exchanges`| `vhost?` | 列出所有 Exchange 交换机类型（direct、fanout、topic、headers）与属性 |
| | `rabbitmq_declare_exchange`| **`name`**, **`type`**, `vhost?`, `durable?`, `auto_delete?` | 声明式创建交换机 |
| | `rabbitmq_delete_exchange`| **`name`**, `vhost?`, `if_unused?` | 删除指定交换机（只读门禁下隐藏） |
| | `rabbitmq_bind_queue` | **`queue`**, **`exchange`**, **`routing_key`**, `vhost?` | 绑定队列到交换机并建立路由规则 |
| | `rabbitmq_unbind_queue` | **`queue`**, **`exchange`**, **`routing_key`**, `vhost?` | 解除队列与交换机的绑定关系 |
| **消息流转** | `rabbitmq_publish_message` | **`exchange`**, **`routing_key`**, **`payload`**, `headers?`, `persistent?` | 发布业务测试消息（支持持久化与自定义 Headers） |
| | `rabbitmq_get_messages` | **`queue`**, `vhost?`, `count?` *(默认 5)*, `ack_mode?` | 安全拉取队列消息进行排查（支持无害 requeue 模式，正文 4KB 截断） |

---

## 3. 多客户端接入配置

### 3.1 Claude Desktop 配置 (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "rabbitmq": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-rabbitmq"],
      "env": {
        "RABBITMQ_URL": "amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@127.0.0.1:5672/",
        "RABBITMQ_HTTP_URL": "http://127.0.0.1:15672/",
        "RABBITMQ_READ_ONLY": "false"
      }
    }
  }
}
```

### 3.2 Cursor 与 Antigravity 配置

在 `.cursor/mcp.json` 或 `~/.gemini/antigravity/mcp/` 中挂载：

```json
{
  "mcpServers": {
    "rabbitmq-prod": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-rabbitmq"],
      "env": {
        "RABBITMQ_URL": "amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq.internal:5672/production",
        "RABBITMQ_HTTP_URL": "http://rabbitmq.internal:15672/",
        "RABBITMQ_READ_ONLY": "true"
      }
    }
  }
}
```

---

## 4. 环境变量矩阵

| 环境变量名 | 默认值 | 作用说明 |
| :--- | :--- | :--- |
| `RABBITMQ_URL` | `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost:5672/` | AMQP 连接串（含用户名、密码、主机与 vhost） |
| `RABBITMQ_HTTP_URL` | `http://localhost:15672/` | RabbitMQ Management HTTP API 基础地址（用于指标获取） |
| `RABBITMQ_READ_ONLY` | `false` | 全局只读安全门禁开关（开启后隐藏清空/删除/发布工具） |
| `RABBITMQ_MAX_MESSAGE_BYTES`| `4096` | 消息拉取内容截断阈值（字节） |
| `MCP_TRANSPORT` | `stdio` | 通信传输模式 (`stdio` 或 `sse`) |
| `MCP_PORT` | `8080` | SSE 远程模式下的 HTTP 监听端口 |

---

## 5. 本地运行与 Docker 快速启动

```bash
# 1. npx 快速运行
npx -y @atengk/mcp-server-rabbitmq --url amqp://guest:guest@127.0.0.1:5672/

# 2. Docker 镜像运行
docker run -d \
  --name mcp-server-rabbitmq \
  -p 8080:8080 \
  -e RABBITMQ_URL=amqp://guest:guest@host.docker.internal:5672/ \
  -e RABBITMQ_READ_ONLY=true \
  ghcr.io/atengk/mcp-server-rabbitmq:latest
```

---

## 6. 相关资源与互链

- 官方开源仓库：[atengk/mcp-server-rabbitmq](https://github.com/atengk/mcp-server-rabbitmq)
- 返回服务矩阵总览：[MCP 服务矩阵总览](../index.md)
- 客户端配置参考：[多客户端统一接入指南](../../guide/client-setup.md)
