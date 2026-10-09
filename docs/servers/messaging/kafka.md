---
title: Kafka 生产级服务
order: 2
---

# Kafka 生产级 MCP 服务

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <VpBadge type="tip">生产级</VpBadge>
  <VpBadge type="info">FastMCP / Python 3.11</VpBadge>
  <VpBadge type="purple">Stdio & SSE</VpBadge>
  <VpBadge type="warning" dot>工单建设中</VpBadge>
</div>

面向 Apache Kafka 分布式流式事件平台的生产级智能管控与诊断服务。基于 Model Context Protocol (MCP) 为大模型与自主智能体（Agent）提供集群健康巡检、Topic 分区再均衡、Consumer Group 延迟告警以及消息采样回放等核心能力。

---

## 1. 核心定位与技术架构

- **服务定位**：高并发数据流与事件驱动场景下的 Kafka 集群智能运维中枢；
- **技术栈**：Python 3.11+、FastMCP 框架、confluent-kafka-python / kafka-python；
- **通信模式**：支持标准输入输出（Stdio）与 HTTP/SSE 远程长连接；
- **安全特性**：严格的 ACL 鉴权集成、Kerberos/SASL 认证支持、敏感配置自动脱敏。

---

## 2. 规划能力与工具矩阵

> [!NOTE] 模块演进计划
> 本服务端正在进行规范化重构（对应工单 #12），预计提供以下核心 Tool / Resource 能力。

| 工具名称 | 分类 | 说明 | 风险等级 |
| :--- | :--- | :--- | :--- |
| `kafka_cluster_info` | 拓扑健康 | 查看 Broker 节点列表、Controller 状态及元数据版本 | 只读 (Readonly) |
| `kafka_topic_overview` | 主题治理 | 检查 Topic 分区分布、副本同步状态 (ISR) 及清理策略 | 只读 (Readonly) |
| `kafka_consumer_lag` | 消费堆积 | 统计 Consumer Group 各 Partition 的位移延迟与落后量 | 只读 (Readonly) |
| `kafka_sample_messages`| 消息采样 | 安全采样最新 N 条分区消息，自动掩码机密字段 | 只读 (Readonly) |
| `kafka_reset_offsets` | 运维操作 | 针对指定消费者组按时间戳或最新位置重置偏移量 | 高危 (Sensitive) |

---

## 3. 客户端快速挂载预览

参考 [多客户端统一接入指南](../../guide/client-setup.md) 进行本地或容器化配置：

```json
{
  "mcpServers": {
    "kafka-mcp": {
      "command": "uvx",
      "args": ["ateng-kafka-mcp"],
      "env": {
        "KAFKA_BOOTSTRAP_SERVERS": "127.0.0.1:9092",
        "KAFKA_SECURITY_PROTOCOL": "PLAINTEXT"
      }
    }
  }
}
```

---

## 4. 相关资源

- 返回上一级：[MCP 服务矩阵总览](../index.md)
- 客户端配置参考：[多客户端统一接入指南](../../guide/client-setup.md)
