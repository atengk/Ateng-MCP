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
| **本地管道 (Stdio)** | 宿主应用作为父进程，通过子进程直接拉起可执行文件并借助 `stdin`/`stdout` 交互 | 本地桌面端、单机研发排障（如 Claude Desktop、Cursor、Windsurf、Cline / Roo Code） | 零网络端口暴露，启动即用；需要本地具备对应语言运行时（如 Node.js / Python / Java）。 |
| **远程长连接 (SSE)** | 服务端作为独立 HTTP 服务常驻运行，客户端通过 Server-Sent Events 流式端点通信 | 容器云编排、团队私有网关、Docker 环境（如 Kubernetes、Cherry Studio、Dify / FastGPT） | 支持跨网络访问与集中化鉴权；需要配置网络端口映射与跨域访问。 |

```mermaid
flowchart LR
  subgraph Local_Host["本地客户端 (Stdio 管道)"]
    IDE["Claude Desktop / Cursor / Windsurf / Cline / Roo Code"] -->|子进程 stdin/stdout| LocalMCP["MCP 服务端进程"]
  end

  subgraph Cloud_Host["分布式环境 (SSE 远程长连接)"]
    Agent["Cherry Studio / Dify / FastGPT"] -->|HTTP GET /sse| Gateway["常驻 MCP HTTP 服务端"]
    Agent -->|HTTP POST /message| Gateway
  end
```

---

## 2. 热门主流客户端接入配置指南

以下汇总了当前市面上最热门的 AI 客户端与 Agent 平台的标准接入方式与配置文件路径：

### 2.1 Claude Desktop

Claude Desktop 是 Anthropic 官方推出的桌面端 AI 助手，在设置中支持通过 JSON 文件集中挂载多个 MCP 服务端。

#### 配置文件路径
- **macOS**：`~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**：`%APPDATA%\Claude\claude_desktop_config.json`

#### 配置示例 (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "redis": {
      "command": "uvx",
      "args": ["atengk-mcp-server-redis", "--url", "redis://127.0.0.1:6379/0"]
    },
    "rdbms": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms", "--db-url", "mysql+pymysql://root:YOUR_PASSWORD@127.0.0.1:3306/mydb"]
    },
    "ssh": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-ssh"],
      "env": {
        "MCP_SSH_HOST": "192.168.1.100",
        "MCP_SSH_USER": "root",
        "MCP_SSH_PASSWORD": "YOUR_PASSWORD"
      }
    },
    "s3-storage": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-s3"],
      "env": {
        "MCP_S3_ENDPOINT": "http://127.0.0.1:9000",
        "MCP_S3_ACCESS_KEY_ID": "${MINIO_ACCESS_KEY}",
        "MCP_S3_SECRET_ACCESS_KEY": "${MINIO_SECRET_KEY}",
        "MCP_S3_FORCE_PATH_STYLE": "true"
      }
    }
  }
}
```

---

### 2.2 Cursor

Cursor 深度集成了 MCP 协议，支持在项目根目录下通过代码级配置文件进行团队共享。

#### 配置文件路径
在当前代码仓库根目录下创建或编辑 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "rdbms-dev": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms"],
      "env": {
        "MCP_RDBMS_DIALECT": "mysql",
        "MCP_RDBMS_DB_HOST": "127.0.0.1",
        "MCP_RDBMS_DB_PORT": "3306",
        "MCP_RDBMS_USER": "root",
        "MCP_RDBMS_PASSWORD": "YOUR_DB_PASSWORD",
        "MCP_RDBMS_DATABASE": "dev_db"
      }
    },
    "kubernetes-ops": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-kubernetes"],
      "env": {
        "KUBECONFIG": "${HOME}/.kube/config",
        "K8S_READ_ONLY": "true"
      }
    },
    "nacos-control": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-nacos"],
      "env": {
        "MCP_NACOS_SERVER_URL": "http://127.0.0.1:8848/nacos",
        "MCP_NACOS_USERNAME": "nacos",
        "MCP_NACOS_PASSWORD": "YOUR_NACOS_PASSWORD"
      }
    }
  }
}
```

> [!TIP] 团队协同建议
> 将项目特定的 `.cursor/mcp.json` 纳入 Git 版本控制，团队成员拉取代码后即可直接共享该项目的 MCP 工具拓扑。

---

### 2.3 Windsurf

Windsurf 是 Codeium 推出的新一代 AI 原生 IDE，通过 Cascade 智能体深度协同 MCP 工具流。

#### 配置文件路径
- **macOS / Linux**：`~/.codeium/windsurf/mcp_config.json`
- **Windows**：`%USERPROFILE%\.codeium\windsurf\mcp_config.json`

#### 配置示例 (`mcp_config.json`)

```json
{
  "mcpServers": {
    "redis": {
      "command": "uvx",
      "args": ["atengk-mcp-server-redis", "--url", "redis://localhost:6379/0"]
    },
    "ssh": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-ssh"],
      "env": {
        "MCP_SSH_CONFIG_ALIAS": "my-cloud-vps"
      }
    },
    "kafka": {
      "command": "uvx",
      "args": ["atengk-mcp-server-kafka", "--bootstrap-servers", "127.0.0.1:9092", "--read-only"]
    }
  }
}
```

---

### 2.4 Cline 与 Roo Code (VS Code 扩展)

Cline 与 Roo Code（前身为 Roo Cline）是 VS Code 平台上极其热门的开源自主 Agent 插件，具备强大的工具执行、权限确认与自动化审批流。

#### 配置文件路径
- **Cline**：
  - Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Roo Code**：
  - Windows: `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\roo_code_mcp_settings.json`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/roo_code_mcp_settings.json`

#### 配置示例 (`cline_mcp_settings.json` / `roo_code_mcp_settings.json`)

```json
{
  "mcpServers": {
    "redis": {
      "command": "uvx",
      "args": ["atengk-mcp-server-redis", "--url", "redis://127.0.0.1:6379/0"],
      "disabled": false,
      "autoApprove": [
        "redis_scan_keys",
        "redis_key_inspect",
        "redis_get_string"
      ]
    },
    "ssh": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-ssh"],
      "env": {
        "MCP_SSH_HOST": "192.168.1.100",
        "MCP_SSH_USER": "root",
        "MCP_SSH_PASSWORD": "YOUR_SSH_PASSWORD"
      },
      "disabled": false,
      "autoApprove": [
        "ssh_ping",
        "ssh_list_connections"
      ]
    },
    "email": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-email"],
      "env": {
        "MCP_SMTP_HOST": "smtp.example.com",
        "MCP_SMTP_USER": "assistant@example.com",
        "MCP_SMTP_PASS": "${EMAIL_AUTH_CODE}"
      },
      "disabled": false,
      "autoApprove": [
        "list_accounts",
        "verify_connection"
      ]
    }
  }
}
```

---

### 2.5 Google Antigravity

Google Antigravity 体系原生支持按服务分治的 Schema 注册与全局 JSON 配置双模式。

#### 模式 A：全局配置文件接入 (`~/.gemini/antigravity/`)

```json
{
  "mcpServers": {
    "redis": {
      "command": "uvx",
      "args": ["atengk-mcp-server-redis", "--url", "redis://localhost:6379/0"]
    },
    "rdbms": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms", "--db-url", "mysql+pymysql://root:YOUR_PASSWORD@127.0.0.1:3306/mydb"]
    },
    "ssh": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-ssh"],
      "env": {
        "MCP_SSH_CONFIG_ALIAS": "my-cloud-vps"
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
├── redis/
│   ├── instructions.md        # 服务最佳实践与 Agent 操作指引
│   ├── redis_scan_keys.json
│   └── redis_key_inspect.json
├── ssh/
│   ├── instructions.md
│   ├── ssh_exec.json
│   └── sftp_read_file.json
└── nacos/
    ├── instructions.md
    └── nacos_get_config.json
```

---

### 2.6 Cherry Studio (国产热门全能客户端)

Cherry Studio 是一款界面精美、支持多厂商模型、知识库与插件体系的跨平台桌面 AI 客户端，对 MCP 提供了直观的可视化配置界面与热插拔支持。

#### 接入方式
1. 打开 Cherry Studio 设置，进入 **「MCP 服务器」** 标签页；
2. 点击 **「添加服务器」**，选择 **Stdio** 或 **SSE** 类型；
3. 或点击右上角 **「编辑配置 (JSON)」** 直接批量贴入标准配置：

```json
{
  "mcpServers": {
    "redis-server": {
      "command": "uvx",
      "args": ["atengk-mcp-server-redis", "--url", "redis://localhost:6379/0"]
    },
    "ssh-server": {
      "command": "npx",
      "args": ["-y", "@atengk/mcp-server-ssh"],
      "env": {
        "MCP_SSH_HOST": "192.168.1.100",
        "MCP_SSH_USER": "root",
        "MCP_SSH_PASSWORD": "YOUR_SSH_PASSWORD"
      }
    },
    "rdbms-server": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms", "--db-url", "sqlite:///./local.db"]
    }
  }
}
```
4. 保存后点击服务右侧的刷新按钮，状态变为绿色即表示工具已成功加载。

---

### 2.7 Dify / FastGPT (企业级多智能体平台)

针对企业级 Agent 开发编排平台（如 Dify、FastGPT 等），MCP 服务端通常以 **Docker 容器** 或常驻后端方式运行在局域网/私有云中，并通过 **SSE 远程端点** 协议挂载。

#### 部署常驻服务 (Docker Compose 示例)
```yaml
services:
  mcp-redis:
    image: atengk/mcp-server-redis:latest
    ports:
      - "8001:8000"
    environment:
      - MCP_REDIS_TRANSPORT=sse
      - MCP_REDIS_URL=redis://192.168.1.100:6379/0

  mcp-ssh:
    image: ghcr.io/atengk/mcp-server-ssh:latest
    ports:
      - "8002:8000"
    environment:
      - MCP_SSH_TRANSPORT=sse
      - MCP_SSH_HOST=192.168.1.100
      - MCP_SSH_USER=root
      - MCP_SSH_PASSWORD=YOUR_SSH_PASSWORD

  mcp-nacos:
    image: ghcr.io/atengk/mcp-server-nacos:latest
    ports:
      - "8003:3000"
    environment:
      - MCP_TRANSPORT=sse
      - MCP_NACOS_SERVER_URL=http://192.168.1.100:8848/nacos
```

#### 在 Dify / FastGPT 中挂载工具
1. 进入应用编排界面或工具库 (Tools)；
2. 选择 **「添加自定义 MCP 工具 (Add MCP Tool)」**；
3. **协议类型** 选择 `Server-Sent Events (SSE)`；
4. **服务器 URL (Server URL)** 填写容器映射的 SSE 地址：
   - Redis: `http://<服务器IP>:8001/sse`
   - SSH: `http://<服务器IP>:8002/sse`
   - Nacos: `http://<服务器IP>:8003/sse`
5. 点击连接测试，平台将自动发现所有原子工具并注入到 Agent 节点或工作流中。

---

### 2.8 OpenAI Codex (Codex CLI & IDE)

OpenAI Codex 提供了强大的命令行工具 (`codex`) 与桌面开发环境扩展支持，原生支持通过标准 TOML 配置文件管理 Model Context Protocol (MCP) 服务端，支持 Stdio 本地进程与远程 SSE 协议双模接入。

#### 配置文件路径
- **全局用户配置**：`~/.codex/config.toml`
- **项目级受信任配置**：`.codex/config.toml`（位于当前代码仓库根目录下，需信任项目目录）

#### 方式 A：编写 TOML 配置文件 (`config.toml`)

直接在 `config.toml` 中通过 `[mcp_servers.<name>]` 块声明服务端：

```toml
# 1. RDBMS 关系型数据库服务 (Stdio 模式，原子字段免转义)
[mcp_servers.rdbms]
command = "uvx"
args = ["atengk-mcp-server-rdbms"]

[mcp_servers.rdbms.env]
MCP_RDBMS_DIALECT = "mysql"
MCP_RDBMS_DB_HOST = "127.0.0.1"
MCP_RDBMS_DB_PORT = "3306"
MCP_RDBMS_USER = "root"
MCP_RDBMS_PASSWORD = "YOUR_DB_PASSWORD"
MCP_RDBMS_DATABASE = "mydb"

# 2. Redis 生产级缓存与诊断服务 (Stdio 模式)
[mcp_servers.redis]
command = "uvx"
args = ["atengk-mcp-server-redis", "--url", "redis://127.0.0.1:6379/0"]

# 3. OpenSSH 智能终端与 SFTP 服务 (Stdio 模式)
[mcp_servers.ssh]
command = "npx"
args = ["-y", "@atengk/mcp-server-ssh"]

[mcp_servers.ssh.env]
MCP_SSH_HOST = "192.168.1.100"
MCP_SSH_USER = "root"
MCP_SSH_PASSWORD = "YOUR_SSH_PASSWORD"

# 4. 远程常驻服务网关 (SSE 模式)
[mcp_servers.remote-gateway]
url = "http://192.168.1.100:8000/sse"
```

#### 方式 B：使用 Codex CLI 命令行快速注册

您也可以在终端中直接通过 `codex mcp` 命令行一键动态挂载服务（命令行将自动写入对应的 `config.toml`）：

```bash
# 注册 Stdio 本地服务（使用 -- 分隔命令与参数）
codex mcp add redis -- uvx atengk-mcp-server-redis --url redis://127.0.0.1:6379/0
codex mcp add rdbms -- uvx atengk-mcp-server-rdbms --db-url mysql+pymysql://root:YOUR_PASSWORD@127.0.0.1:3306/mydb

# 注册 SSE 远程端点服务
codex mcp add remote-gateway --url http://192.168.1.100:8000/sse

# 查看当前已挂载的服务列表
codex mcp list

# 检视特定服务的详细工具与配置
codex mcp show redis
```

---

## 3. 环境变量与凭据安全注入规范

为防止数据库密码、API Token 及私钥误提交至版本控制库，接入时请严格遵守以下安全基线：

1. **零明文硬编码**：严禁在公开或共享的配置文件中填入明文私钥。请利用各客户端提供的系统环境变量继承能力（`${VARIABLE_NAME}`），或在本地未跟踪的私有环境变量文件中声明；
2. **只读保护优先**：在初次配置或生产排障环境中，优先为服务端开启只读安全开关（如 `K8S_READ_ONLY=true`、`MCP_KAFKA_READ_ONLY=true`、`MCP_S3_READ_ONLY=true`）；
3. **白名单自动授权 (Auto-Approve)**：
   - 针对幂等、只读型工具（如 `list`、`inspect`、`query`），可在客户端配置中加入自动放行规则；
   - 针对高危或产生写操作的工具（如 `delete`、`dml`、`publish`），**必须保留人工审批卡点**。

---

## 4. 常见连接故障排查清单 (Troubleshooting)

| 故障现象 | 根因诊断 | 解决方案 |
| :--- | :--- | :--- |
| **`spawn ENOENT` 错误** | 客户端未在系统全局 `PATH` 中找到指定命令（如 `npx`、`uvx`） | 确认 Node.js / uv 已正确安装并加入系统 PATH，或在配置文件中改用完整绝对路径。 |
| **连接挂死 / JSON Parse Error** | 服务端在 Stdio 模式下向标准输出输出了非 JSON 文本（如日志或 Banner） | 确保调试日志输出至 `stderr`，严禁污染 `stdout` 协议通道。 |
| **SSE 401 / 403 鉴权失败** | 远程 MCP 服务端开启了网关鉴权，客户端未携带请求头 | 在客户端配置中检查 Headers 注入规则，或通过内网受信通道访问。 |
| **权限不足 (`EACCES`)** | 执行脚本或二进制文件缺失执行权限 | 在 Linux/macOS 终端中执行 `chmod +x <binary_path>`。 |
| **Tools 列表为空** | 客户端与服务端握手成功但未能正确协商工具 Schema | 检查服务端 SDK 版本是否兼容，使用官方 MCP Inspector 单独探查。 |

---

## 5. 官方调试工具 (MCP Inspector)

如遇到连接异常或工具调用返回不符合预期，推荐使用官方可视化检查工具独立拉起服务进行端到端测试：

```bash
# 使用 npx 启动官方 MCP Inspector 并在浏览器中调试
npx @modelcontextprotocol/inspector <command> <args...>
```

---

## 6. 相关指引

- 查看全量服务矩阵：[MCP 服务矩阵总览](../servers/index.md)
- 查看快速上手入门：[快速起步](./getting-started.md)
