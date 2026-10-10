---
title: RDBMS 通用关系型数据库服务
order: 2
---

# RDBMS 通用关系型数据库服务

通用的关系型数据库模型上下文协议（Model Context Protocol, MCP）官方服务，基于 **Python 3.12+**、**SQLAlchemy 2.0** 与 **FastMCP** 现代化架构构建。

专为各大语言模型（LLM）与智能体（Claude、Cursor、Windsurf、Dify 等）提供标准、安全、可控、高内聚的多数据库探查、查询采样、慢查询诊断与原子事务变更能力。

---

## 1. 核心架构与设计特性

```mermaid
flowchart TD
    subgraph ClientSide ["AI 客户端生态 (MCP Host)"]
        Client["Claude Desktop / Cursor / Windsurf / Dify / Antigravity"]
    end

    subgraph ProtocolLayer ["通信传输与分层环境层"]
        FastMCP["FastMCP 协议服务器 (stdio / sse)"]
        Env["分层环境解析器 (core/env.py)"]
        Dotenv[".env 自动探测与 RFC 1738 密码免转义拼装"]
    end

    subgraph GuardLayer ["AST 深度语法安全守卫 (core/guard.py)"]
        ASTParse["sqlglot AST 语法树解析与分析"]
        ReadOnly["只读语义校验 (Select / CTE With)"]
        LimitInject["自动注入安全 LIMIT 截断 (默认 100 行)"]
        WhereGuard["DML 强制阻断无 WHERE 条件的 UPDATE/DELETE"]
        ExplainGuard["sql_explain 危险修饰符拦截与剥离"]
    end

    subgraph EngineLayer ["连接池与多库路由中枢 (core/connection.py)"]
        Registry["ConnectionRegistry (多库配置中心)"]
        Pool["连接池健康预检与自愈 (pool_pre_ping)"]
        Audit["独立审计流水日志 (rdbms_mcp_audit.log)"]
    end

    subgraph DatabaseLayer ["多元关系型数据库集群 (SQLAlchemy 2.0)"]
        MySQL[("MySQL 8.x / 5.7 / MariaDB")]
        PostgreSQL[("PostgreSQL 12~17")]
        SQLite[("SQLite 内存库 / 本地文件库")]
        Oracle[("Oracle 19c / 21c")]
        MSSQL[("SQL Server / ClickHouse / 国产库")]
    end

    Client -->|"JSON-RPC (stdio / sse)"| FastMCP
    Dotenv --> Env --> Registry
    FastMCP -->|"9 核心工具调用"| GuardLayer
    GuardLayer -->|"AST 验证通过"| Registry
    Registry --> Pool
    Pool -->|"工作线程池异步卸载 (anyio)"| DatabaseLayer
    Registry -.->|"写操作流水异步落盘"| Audit
```

### 1.1 通用多数据库抽象底座
- **多元方言内置支持**：基于 SQLAlchemy 2.0 驱动引擎，默认内置 **MySQL** (`pymysql`)、**PostgreSQL** (`psycopg3`)、**SQLite**；
- **插件化扩展支持**：无缝扩展支持 **Oracle**、**SQL Server**、**ClickHouse** 及各类符合 SQL 方言标准的国产数据库（达梦、人大金仓等）。

### 1.2 AST 语法树级深度安全守卫 (Guardrail)
- **只读模式静态分析**：基于 `sqlglot` 语法树静态分析，物理拦截任何多语句拼接注入以及非 SELECT/WITH 写入操作；
- **自动 LIMIT 注入**：为未指定行数的大模型查询强制追加安全截断（默认 100 行），彻底杜绝全表拉取导致 OOM 或上下文爆炸；
- **灾难性误改误删阻断**：静态分析强制拦截缺少 `WHERE` 条件的 `UPDATE` 与 `DELETE` 语句，直接驳回。

### 1.3 原子事务与权限双重门禁
- **单事务原子批处理**：`sql_dml` 接受单条或批量 SQL，底层在**单一原子事务块**中执行，任何单步失败全量自动回滚 (`ROLLBACK`)，绝不留脏数据；
- **双重授权与确认**：默认强只读保护，写权限必须通过 `--allow-dml` 与 `--allow-ddl` 显式授权，且 DDL 建表/删表要求 `confirm=True` 二次确认；
- **连接池自愈**：连接池集成 `pool_pre_ping=True` 探针预检与周期回收，毫秒级自愈因网络超时或数据库重启导致的死连接。

---

## 2. 9 核心工具契约字典 (Tools Contract)

所有工具均支持可选的 `db` 参数。不传时自动路由到默认连接；传入时精确定位目标多库别名：

| 领域前缀 | 工具名称 | 参数契约 | 功能描述与安全约束 |
| :--- | :--- | :--- | :--- |
| **`db_`** | `db_list_connections` | `()` | 查看所有已配置连接别名、方言内核、默认库标识与只读保护状态。**密码强制执行 `***` 安全脱敏掩码** |
| | `db_get_info` | `(db: str = None)` | 探查目标数据库内核方言、真实版本号、当前 Schema/Database 及活跃登录用户 |
| **`schema_`** | `schema_list_tables` | `(schema=None, include_views=False, db=None)` | 获取业务数据表与视图清单、表注释并**自动聚合全库外键依赖拓扑**。自动过滤数据库系统保留模式 |
| | `schema_describe_table` | `(table_name: str, schema=None, db=None)` | 一站式全息探查数据表列明细（类型、可空性、默认值）、主键约束、外键关联与全部索引明细 |
| **`sql_`** | `sql_query` | `(sql: str, limit: int = 100, format="json", db=None)` | 安全只读数据采样与业务分析，支持复杂 CTE `WITH` 语法。支持 `json` / `markdown` / `csv` 格式，自动序列化 Decimal/时间/BLOB 并**自动注入 LIMIT** |
| | `sql_explain` | `(sql: str, db=None)` | 执行 `EXPLAIN` 获取数据库原生查询执行计划，辅助分析慢查询与索引命中瓶颈 |
| | `sql_dml` | `(sql: str \| list[str], db=None)` | 原子事务数据增删改（支持单条或批量）。**单步失败全量自动回滚**，受 `--allow-dml` 门禁管控，**强制拦截无 WHERE 条件操作** |
| | `sql_ddl` | `(sql: str, confirm: bool = False, db=None)` | 结构定义变更（建表、删表、改表）。受 `--allow-ddl` 权限管控并要求 `confirm=True` 二次确认 |
| **`admin_`** | `admin_list_running_queries` | `(db=None)` | 观测数据库正在运行的长查询与活动会话（针对 SQLite 等轻量库自适应优雅降级） |

---

## 3. 安装与运行方式

### 3.1 方式 1：使用 `uvx` 免安装直接运行（推荐）

```bash
# 1. 单数据库直连启动 (只读安全模式)
uvx atengk-mcp-server-rdbms --db-url "postgresql+psycopg://user:YOUR_PASSWORD@localhost:5432/mydb"

# 2. 多数据库配置文件启动
uvx atengk-mcp-server-rdbms --config ./connections.yaml

# 3. 开启写入权限 (允许 DML 与 DDL)
uvx atengk-mcp-server-rdbms --db-url "sqlite:///./demo.db" --allow-dml --allow-ddl
```

### 3.2 方式 2：源码运行

```bash
git clone https://github.com/atengk/mcp-server-rdbms.git
cd mcp-server-rdbms
uv sync
uv run atengk-mcp-server-rdbms --db-url "sqlite:///./demo.db"
```

---

## 4. MCP 客户端配置模版

### 4.1 原子字段模式（推荐，密码特殊字符免转义）

针对密码包含 `@`、`#`、`:` 等特殊字符的情况，服务内置环境自动拼装器会自动进行 RFC 1738 安全转义：

```json
{
  "mcpServers": {
    "rdbms": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms"],
      "env": {
        "MCP_RDBMS_DIALECT": "mysql",
        "MCP_RDBMS_DB_HOST": "127.0.0.1",
        "MCP_RDBMS_DB_PORT": "3306",
        "MCP_RDBMS_USER": "root",
        "MCP_RDBMS_PASSWORD": "YOUR_DB_PASSWORD",
        "MCP_RDBMS_DATABASE": "mydb"
      }
    }
  }
}
```

### 4.2 全量连接串模式 (PostgreSQL 示例)

```json
{
  "mcpServers": {
    "postgres-dev": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms"],
      "env": {
        "MCP_RDBMS_DB_URL": "postgresql+psycopg://user:YOUR_PASSWORD@127.0.0.1:5432/mydb"
      }
    }
  }
}
```

### 4.3 开启写操作与多库配置中心模式

```json
{
  "mcpServers": {
    "rdbms-cluster": {
      "command": "uvx",
      "args": ["atengk-mcp-server-rdbms"],
      "env": {
        "MCP_RDBMS_CONFIG": "./connections.yaml",
        "MCP_RDBMS_ALLOW_DML": "true",
        "MCP_RDBMS_ALLOW_DDL": "true"
      }
    }
  }
}
```

---

## 5. 环境变量与配置参数全景

| 环境变量 | 命令行参数 | 默认值 | 作用描述 |
| :--- | :--- | :--- | :--- |
| `MCP_RDBMS_DB_URL` | `--db-url` | 无 | 标准 SQLAlchemy 连接串（如 `mysql+pymysql://...`） |
| `MCP_RDBMS_DIALECT`| `--dialect` | `sqlite` | 数据库类型方言（`mysql` / `postgresql` / `sqlite` / `oracle` / `mssql`） |
| `MCP_RDBMS_DB_HOST`| `--host` | `localhost` | 数据库主机 IP 或域名 |
| `MCP_RDBMS_DB_PORT`| `--port` | 依据方言自动推导 | 数据库端口号 |
| `MCP_RDBMS_USER` | `--user` | 无 | 登录用户名 |
| `MCP_RDBMS_PASSWORD`| `--password` | 无 | 登录密码（自动执行 RFC 1738 转义与日志掩码） |
| `MCP_RDBMS_DATABASE`| `--database` | 无 | 默认连接的目标数据库名 |
| `MCP_RDBMS_ALLOW_DML`| `--allow-dml` | `false` | 开启数据写入权限（INSERT/UPDATE/DELETE） |
| `MCP_RDBMS_ALLOW_DDL`| `--allow-ddl` | `false` | 开启数据定义语言变更权限（CREATE/ALTER/DROP） |
| `MCP_RDBMS_CONFIG` | `--config` | 无 | 多环境多数据库连接配置文件路径 |

---

## 6. 相关指引

- 查看缓存服务：[Redis 生产级缓存与运维诊断](./redis.md)
- 返回服务矩阵全景：[MCP 服务矩阵总览](../index.md)
- 多客户端配置速查：[多客户端统一接入指南](../../guide/client-setup.md)
