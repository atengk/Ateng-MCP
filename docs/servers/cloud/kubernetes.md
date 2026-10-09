---
title: Kubernetes 智能运维
order: 1
---

# Kubernetes 智能运维 MCP 服务

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <VpBadge type="tip">生产级</VpBadge>
  <VpBadge type="info">Go / client-go</VpBadge>
  <VpBadge type="purple">Stdio & SSE</VpBadge>
  <VpBadge type="warning" dot>工单建设中</VpBadge>
</div>

面向云原生与微服务集群的生产级 Kubernetes 智能运维中枢。基于 Model Context Protocol (MCP) 为大模型与自主智能体（Agent）赋予多集群状态感知、Pod 故障根因分析、异常事件实时检索与资源配额超标预警等运维自动化能力。

---

## 1. 核心定位与技术架构

- **服务定位**：K8s 生产环境的智能 SRE Copilot 基础设施服务；
- **技术栈**：Go 1.22+、mcp-golang SDK、官方 `k8s.io/client-go`；
- **通信模式**：支持标准输入输出（Stdio）与远程 HTTP/SSE；
- **安全隔离**：内置 RBAC 最小权限原则，高危变更动作强制实施二级确认机制。

---

## 2. 规划能力与工具矩阵

> [!NOTE] 模块演进计划
> 本服务端正在进行规范化重构（对应工单 #14），预计提供以下核心 Tool / Resource 能力。

| 工具名称 | 分类 | 说明 | 风险等级 |
| :--- | :--- | :--- | :--- |
| `k8s_cluster_health` | 集群感知 | 查询 Node 节点状态、API Server 延迟与核心组件健康度 | 只读 (Readonly) |
| `k8s_diagnose_pod` | 故障诊断 | 针对 CrashLoopBackOff/OOMKilled Pod 执行自动化根因分析 | 只读 (Readonly) |
| `k8s_list_events` | 事件巡检 | 按命名空间检索 Warning/Error 异常事件并聚合频次 | 只读 (Readonly) |
| `k8s_get_pod_logs` | 日志检索 | 获取指定容器标准输出日志并支持正则过滤与时间切片 | 只读 (Readonly) |
| `k8s_restart_deployment` | 自愈控制 | 对指定 Deployment 执行滚动重启与自愈状态跟踪 | 高危 (Sensitive) |

---

## 3. 客户端快速挂载预览

参考 [多客户端统一接入指南](../../guide/client-setup.md) 进行本地或容器化配置：

```json
{
  "mcpServers": {
    "kubernetes-mcp": {
      "command": "/usr/local/bin/ateng-k8s-mcp",
      "args": ["--kubeconfig", "~/.kube/config"],
      "env": {
        "K8S_READONLY_MODE": "true"
      }
    }
  }
}
```

---

## 4. 相关资源

- 返回上一级：[MCP 服务矩阵总览](../index.md)
- 客户端配置参考：[多客户端统一接入指南](../../guide/client-setup.md)
