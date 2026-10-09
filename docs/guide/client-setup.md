---
title: 多客户端统一接入指南
order: 2
---

# 多客户端统一接入指南

Model Context Protocol (MCP) 作为开放标准协议，已获得主流 AI 编程助手、智能运维 Agent 以及大模型宿主环境的原生支持。本文档提供在不同客户端环境中接入 **Ateng MCP 服务矩阵** 的标准配置模版与网络调试指引。

---

## 1. 通信模式概览：Stdio 与 SSE

Ateng MCP 服务矩阵原生支持两种标准通信模式，您可以根据部署拓扑灵活选择：

| 模式 | 运行拓扑 | 适用场景 | 优势与约束 |
| :--- | :--- | :--- | :--- |
| **本地管道 (Stdio)** | 宿主应用作为父进程，通过子进程直接拉起可执行文件并借助 `stdin`/`stdout` 交互 | 本地桌面端、单机研发排障（如 Claude Desktop、Cursor、Cline） | 零网络端口暴露，启动即用；需要本地具备对应语言运行时（如 Node.js / Python / Java）。 |
| **远程长连接 (SSE)** | 服务端作为独立 HTTP 服务常驻运行，客户端通过 Server-Sent Events 流式端点通信 | 容器云编排、团队私有公共网关、Docker 环境（如 Kubernetes、云主机） | 支持跨网络访问与集中化鉴权；需要配置网络端口映射与跨域访问。 |

```mermaid
flowchart LR
  subgraph Local_Host["本地客户端 (Stdio)"]
    IDE["Claude Desktop / Cursor / Cline"] -->|子进程 stdin/stdout| LocalMCP["MCP 服务端进程"]
  end

  subgraph Cloud_Host["分布式环境 (SSE)"]
    Agent["AI 客户端 / 智能体"] -->|HTTP GET /sse| Gateway["常驻 MCP HTTP 服务端"]
    Agent -->|HTTP POST /message| Gateway
  end
```

---

## 2. 主流客户端接入配置指南

### 2.1 Claude Desktop

Claude Desktop 是 Anthropic 官方推出的桌面端 AI 助手，在设置中支持通过 JSON 文件集中挂载多个 MCP 服务端。

#### 配置文件路径
- **macOS**：`~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**：`%APPDATA%\Claude\claude_desktop_config.json`

#### 配置示例 (`claude_desktop_config.json`)

以下示例展示了同时接入 RocketMQ、Kafka、S3（Stdio 模式）以及远程网关（SSE 模式）：

```json
{
  "mcpServers": {
    "rocketmq-control": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-rocketmq"],
      "env": {
        "ROCKETMQ_NAMESRV_ADDR": "127.0.0.1:9876",
        "ROCKETMQ_READ_ONLY": "false"
      }
    },
    "kafka-analytics": {
      "command": "uvx",
      "args": ["atengk-mcp-server-kafka", "--bootstrap-servers", "127.0.0.1:9092", "--read-only"]
    },
    "s3-storage": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-s3"],
      "env": {
        "MCP_S3_ENDPOINT": "http://127.0.0.1:9000",
        "MCP_S3_REGION": "us-east-1",
        "MCP_S3_ACCESS_KEY_ID": "${MINIO_ACCESS_KEY}",
        "MCP_S3_SECRET_ACCESS_KEY": "${MINIO_SECRET_KEY}",
        "MCP_S3_FORCE_PATH_STYLE": "true",
        "MCP_S3_READ_ONLY": "true"
      }
    },
    "remote-gateway-sse": {
      "url": "http://mcp-gateway.internal:8000/sse"
    }
  }
}
```

---

### 2.2 Cursor

Cursor 深度集成了 MCP 协议，支持在项目根目录下通过代码级配置文件进行团队共享。

#### 项目级配置路径
在当前代码仓库根目录下创建或编辑 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "kubernetes-ops": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-kubernetes"],
      "env": {
        "KUBECONFIG": "${HOME}/.kube/config",
        "K8S_READ_ONLY": "true"
      }
    },
    "rabbitmq-tools": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-rabbitmq"],
      "env": {
        "RABBITMQ_URL": "amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@127.0.0.1:5672/",
        "RABBITMQ_READ_ONLY": "true"
      }
    },
    "remote-email-sse": {
      "url": "http://email-mcp.internal:3000/sse"
    }
  }
}
```

> [!TIP] 团队协同建议
> 将项目特定的 `.cursor/mcp.json` 纳入 Git 版本控制，团队成员拉取代码后即可直接共享该项目的 MCP 工具拓扑。

---

### 2.3 Cline (VS Code 扩展)

Cline（前身为 Claude Dev）为 VS Code 用户提供了极简的 MCP 托管生态，支持对特定工具配置自动授权 (autoApprove)。

#### 配置文件路径
- **Windows**：%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
- **macOS**：`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

#### 配置示例 (`cline_mcp_settings.json`)

```json
{
  "mcpServers": {
    "email-tools": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-email"],
      "env": {
        "MCP_SMTP_HOST": "smtp.qq.com",
        "MCP_SMTP_PORT": "465",
        "MCP_SMTP_USER": "assistant@example.com",
        "MCP_SMTP_PASS": "${EMAIL_AUTH_CODE}"
      },
      "disabled": false,
      "autoApprove": [
        "list_accounts",
        "verify_connection",
        "search_emails"
      ]
    },
    "s3-sse-remote": {
      "url": "http://127.0.0.1:8000/sse",
      "disabled": false
    }
  }
}
```

---

### 2.4 Google Antigravity

Google Antigravity 体系原生支持按服务分治的 Schema 注册与全局 JSON 配置双模式。

#### 模式 A：全局配置文件接入 (`~/.gemini/antigravity/`)

在 Antigravity 全局配置中同时挂载 Stdio 与远程 SSE 服务：

```json
{
  "mcpServers": {
    "rocketmq-service": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-rocketmq"],
      "env": {
        "ROCKETMQ_NAMESRV_ADDR": "127.0.0.1:9876",
        "ROCKETMQ_READ_ONLY": "true"
      }
    },
    "k8s-service-sse": {
      "url": "http://k8s-mcp.internal:8080/sse"
    }
  }
}
```

#### 模式 B：原子工具 Schema 注入目录
将特定工具的最佳实践与参数契约放入 `~/.gemini/antigravity/mcp/<service-name>/`：

```text
~/.gemini/antigravity/mcp/
├── rocketmq/
│   ├── instructions.md        # 服务最佳实践与 Agent 操作指引
│   ├── rocketmq_cluster_info.json
│   └── rocketmq_consumer_lag.json
└── email/
    ├── instructions.md
    └── send_email.json
```

---

## 3. 环境变量与凭据安全注入规范

为防止数据库密码、API Token 及密钥误提交至版本控制库，接入时请严格遵守以下安全基线：

1. **零明文硬编码**：严禁在共享的配置文件中填入明文私钥。请利用各客户端提供的系统环境变量继承能力（`${VARIABLE_NAME}`），或在本地未跟踪的私有环境变量文件中声明；
2. **只读保护优先**：在初次配置或生产排障环境中，优先为服务端开启只读安全开关（如 `K8S_READ_ONLY=true`、`MCP_KAFKA_READ_ONLY=true`、`MCP_S3_READ_ONLY=true`）；
3. **白名单自动授权 (Auto-Approve)**：
   - 针对幂等、只读型工具（如 `list`、`status`、`sample`），可在客户端配置中加入自动放行规则；
   - 针对高危或产生写操作的工具（如 `delete`、`purge`、`resend`），**必须保留人工审批卡点**。

---

## 4. 常见连接故障排查清单 (Troubleshooting)

| 故障现象 | 根因诊断 | 解决方案 |
| :--- | :--- | :--- |
| **`spawn ENOENT` 错误** | 客户端未在系统全局 `PATH` 中找到指定命令（如 `npx`、`uvx`） | 确认 Node.js / uv 已正确安装并加入 PATH，或改用绝对路径。 |
| **连接挂死 / JSON Parse Error** | 服务端代码在 Stdio 模式下向标准输出打印了非 JSON 日志（如调试文本或 Banner） | 检查服务端源码，将所有诊断日志改写为输出至 `stderr`，确保 stdout 纯净。 |
| **SSE 401 / 403 鉴权失败** | 远程 MCP 服务端开启了 Bearer Token 或反向代理鉴权，客户端未携带请求头 | 在客户端配置中确认是否支持自定义 Headers 注入，或通过专用认证代理网关透传。 |
| **权限不足 (`EACCES`)** | 执行脚本或预编译二进制文件缺失执行权限 | 在终端中针对目标执行文件执行 `chmod +x <binary_path>`。 |
| **Tools 列表为空** | 客户端握手成功但未能正确协商工具 Schema | 检查服务端的 MCP SDK 版本是否兼容，使用官方 MCP Inspector 进行单独排查。 |

---

## 5. 官方调试工具 (MCP Inspector)

如遇到连接异常或工具调用返回不符合预期，推荐使用官方可视化检查工具独立拉起服务进行端到端测试：

```bash
# 使用 npx 启动官方 MCP Inspector 并在浏览器中调试
npx @modelcontextprotocol/inspector <command> <args...>
```

---

## 6. 相关指引

- 返回服务概览：[MCP 服务矩阵总览](../servers/index.md)
- 查看快速上手：[快速起步](./getting-started.md)
