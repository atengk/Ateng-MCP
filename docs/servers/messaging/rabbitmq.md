---
title: RabbitMQ 智能服务
order: 3
---

# RabbitMQ 智能服务 MCP

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <VpBadge type="tip">生产级</VpBadge>
  <VpBadge type="info">TypeScript / Node.js</VpBadge>
  <VpBadge type="purple">Stdio & SSE</VpBadge>
  <VpBadge type="warning" dot>工单建设中</VpBadge>
</div>

面向 RabbitMQ AMQP 消息代理的智能化控制与指标分析服务。基于 Model Context Protocol (MCP) 为大模型与自主智能体（Agent）提供 Exchange 交换机路由分析、Queue 队列堆积预警、死信队列（DLX/DLQ）投递检查以及连接通道健康探测等全方位保障。

---

## 1. 核心定位与技术架构

- **服务定位**：微服务架构与异步任务流场景下的 RabbitMQ 智能化管理服务；
- **技术栈**：Node.js 20+、TypeScript、`@modelcontextprotocol/sdk`、amqplib / Management HTTP API；
- **通信模式**：支持标准输入输出（Stdio）与 HTTP/SSE 远程长连接；
- **特色支持**：双通道驱动（AMQP 协议操作 + Management API 统计大盘指标）。

---

## 2. 规划能力与工具矩阵

> [!NOTE] 模块演进计划
> 本服务端正在进行规范化重构（对应工单 #13），预计提供以下核心 Tool / Resource 能力。

| 工具名称 | 分类 | 说明 | 风险等级 |
| :--- | :--- | :--- | :--- |
| `rabbitmq_cluster_health` | 节点状态 | 检查 Erlang 节点内存使用、磁盘水位报警及文件句柄 | 只读 (Readonly) |
| `rabbitmq_exchange_bindings` | 路由排查 | 分析指定 Exchange 与 Queue 的 Binding Key 匹配规则 | 只读 (Readonly) |
| `rabbitmq_queue_metrics` | 队列监控 | 实时统计队列堆积量、Ready/Unacked 状态与消费速率 | 只读 (Readonly) |
| `rabbitmq_dead_letter_audit`| 死信诊断 | 检查死信交换机（x-dead-letter-exchange）挂载与丢信 | 只读 (Readonly) |
| `rabbitmq_purge_queue` | 运维清理 | 清理非生产测试队列的历史积压（带白名单保护） | 高危 (Sensitive) |

---

## 3. 客户端快速挂载预览

参考 [多客户端统一接入指南](../../guide/client-setup.md) 进行本地或容器化配置：

```json
{
  "mcpServers": {
    "rabbitmq-mcp": {
      "command": "npx",
      "args": ["-y", "ateng-rabbitmq-mcp"],
      "env": {
        "RABBITMQ_MANAGEMENT_URL": "http://127.0.0.1:15672",
        "RABBITMQ_USERNAME": "guest",
        "RABBITMQ_PASSWORD": "${SERVICE_PASSWORD}"
      }
    }
  }
}
```

---

## 4. 相关资源

- 返回上一级：[MCP 服务矩阵总览](../index.md)
- 客户端配置参考：[多客户端统一接入指南](../../guide/client-setup.md)
