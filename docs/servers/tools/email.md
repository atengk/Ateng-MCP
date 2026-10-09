---
title: Email 邮件服务
order: 1
---

# Email 邮件服务 MCP

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
  <VpBadge type="tip">生产级</VpBadge>
  <VpBadge type="info">TypeScript / Node.js</VpBadge>
  <VpBadge type="purple">Stdio & SSE</VpBadge>
  <VpBadge type="warning" dot>工单建设中</VpBadge>
</div>

面向企业通信场景的标准化 Email 邮件智能服务。基于 Model Context Protocol (MCP) 为大模型与自主智能体（Agent）赋予 SMTP/IMAP 协议交互、自动化告警邮件组装发送、收件箱重要度摘要以及附件安全扫描等通信能力。

---

## 1. 核心定位与技术架构

- **服务定位**：智能体任务闭环、自动化通知与收件箱分析的通信服务；
- **技术栈**：Node.js 20+、TypeScript、`@modelcontextprotocol/sdk`、nodemailer、imapflow；
- **通信模式**：支持标准输入输出（Stdio）与远程 HTTP/SSE；
- **安全防范**：收件人白名单限制、频率熔断限流与敏感信息拦截脱敏。

---

## 2. 规划能力与工具矩阵

> [!NOTE] 模块演进计划
> 本服务端正在进行规范化重构（对应工单 #16），预计提供以下核心 Tool / Resource 能力。

| 工具名称 | 分类 | 说明 | 风险等级 |
| :--- | :--- | :--- | :--- |
| `email_send` | 邮件外发 | 支持 HTML 模板渲染、多附件安全挂载与高优先级投递 | 受控 (Guarded) |
| `email_list_unread` | 收件扫描 | 检索未读邮件摘要、发件人分析与未读统计 | 只读 (Readonly) |
| `email_search` | 历史检索 | 按主题、发件人或时间区间全文检索历史往来邮件 | 只读 (Readonly) |
| `email_verify_smtp` | 健康巡检 | 验证邮件服务器连通性、TLS 证书与鉴权状态 | 只读 (Readonly) |

---

## 3. 客户端快速挂载预览

参考 [多客户端统一接入指南](../../guide/client-setup.md) 进行本地或容器化配置：

```json
{
  "mcpServers": {
    "email-mcp": {
      "command": "npx",
      "args": ["-y", "ateng-email-mcp"],
      "env": {
        "SMTP_HOST": "smtp.example.com",
        "SMTP_PORT": "465",
        "SMTP_USER": "alert@example.com",
        "SMTP_PASS": "${SERVICE_PASSWORD}"
      }
    }
  }
}
```

---

## 4. 相关资源

- 返回上一级：[MCP 服务矩阵总览](../index.md)
- 客户端配置参考：[多客户端统一接入指南](../../guide/client-setup.md)
