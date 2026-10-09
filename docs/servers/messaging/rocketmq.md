---
title: RocketMQ 5 控制面
order: 1
---

# RocketMQ 5 控制面 MCP 服务

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <VpBadge type="tip">生产级</VpBadge>
  <VpBadge type="info">Spring AI / Java 21</VpBadge>
  <VpBadge type="purple">Stdio & SSE</VpBadge>
  <VpBadge type="warning" dot>工单建设中</VpBadge>
</div>

面向 Apache RocketMQ 5.x 分布式消息引擎的生产级智能化控制面。基于 Model Context Protocol (MCP) 为大模型与自主智能体（Agent）提供集群拓扑感知、Topic 与消费组治理、消息轨迹检索与死信队列（DLQ）重投等核心运维能力。

---

## 1. 核心定位与技术架构

- **服务定位**：企业级 RocketMQ 5.x 智能诊断与治理控制面；
- **技术栈**：Spring Boot 3.3+、Spring AI MCP Server、RocketMQ 5.x Client、Java 21；
- **通信模式**：支持标准输入输出（Stdio）与远程长链接（SSE, Server-Sent Events）；
- **防灾机制**：只读/变更权限分级隔离，严格防御高危 Topic 误删除与突发压测流量。

---

## 2. 规划能力与工具矩阵

> [!NOTE] 模块演进计划
> 本服务端正在进行规范化重构（对应工单 #11），预计提供以下核心 Tool / Resource 能力。

| 工具名称 | 分类 | 说明 | 风险等级 |
| :--- | :--- | :--- | :--- |
| `rocketmq_cluster_status` | 拓扑感知 | 查询 Namesrv、Broker 节点健康度及集群负载 | 只读 (Readonly) |
| `rocketmq_topic_inspect` | 主题分析 | 检查指定 Topic 的读写队列分布与路由配置 | 只读 (Readonly) |
| `rocketmq_consumer_lag` | 延迟预警 | 评估消费组堆积量、TPS 与客户端接入状态 | 只读 (Readonly) |
| `rocketmq_query_msg_trace`| 轨迹追踪 | 检索指定消息 ID 的发送、投递与消费全链路轨迹 | 只读 (Readonly) |
| `rocketmq_dlq_resend` | 运维补救 | 针对死信队列消息进行安全重投递与消费验证 | 高危 (Sensitive) |

---

## 3. 客户端快速挂载预览

参考 [多客户端统一接入指南](../../guide/client-setup.md) 进行本地或容器化配置：

```json
{
  "mcpServers": {
    "rocketmq-mcp": {
      "command": "java",
      "args": ["-jar", "/opt/ateng-mcp/rocketmq-mcp-server.jar"],
      "env": {
        "ROCKETMQ_NAMESRV_ADDR": "127.0.0.1:9876",
        "ROCKETMQ_AUTH_ENABLED": "false"
      }
    }
  }
}
```

---

## 4. 相关资源

- 返回上一级：[MCP 服务矩阵总览](../index.md)
- 客户端配置参考：[多客户端统一接入指南](../../guide/client-setup.md)
