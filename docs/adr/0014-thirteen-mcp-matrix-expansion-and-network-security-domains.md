# 0014. 13 大生产级 MCP 服务矩阵演进与网络安全领域架构划分

随着大模型与智能体对底层系统感知能力的进一步拓展，Ateng MCP 服务矩阵正式引入 3 个全新的生产级服务端（`mcp-server-tcp`、`mcp-server-traffic-inspector`、`mcp-server-reverse`），并将现有远程网关（Redis、RDBMS、SSH）全面升级至具备传输层安全鉴权与 DNS 防重绑定的最新基线。本文档记录服务矩阵从 10 大扩展至 13 大的架构演进决策与领域分类规范。

## 决策背景

在 `v1.1.0` 阶段，Ateng MCP 矩阵收敛了 10 大服务端，覆盖数据库、消息流、对象存储、云原生与协同工具。随着实际研发与攻防排障场景的深入，涌现出三类核心底层能力缺口：
1. **四层/七层原生网络交互与 IoT 调试能力缺失**：大语言模型无法与私有二进制协议（Modbus、工业 PLC）、原生 TCP 长短连接以及本地 Mock 仿真服务进行全双工安全交互；
2. **端到端网络全栈抓包与时序诊断盲区**：缺乏应用层（L7 HTTP/HTTPS/WebSocket）与网络层（L3/L4 PCAP）的协同观测底座，无法对网络故障实施第 0 毫秒进程受管注入抓包、会话重组与混沌故障注入；
3. **底层二进制静态画像与数字取证空白**：缺乏无需重型商业逆向套件即可对 PE / ELF / Mach-O 跨平台二进制执行静态结构分析、跨样本 SSDEEP 差异对比与写时复制内存虚拟打补丁的标准化 MCP 基础设施；
4. **远程网关传输层安全基线演进**：已有的 Redis、RDBMS 与 SSH 在远程暴露（HTTP / SSE）场景下，亟需对齐 Streamable-HTTP、常数时间 Bearer Token 门禁、DNS 重绑定防御及防击穿探活缓存。

## 决策内容

1. **矩阵规模与 7 大专业领域重塑**：
   - 将全矩阵服务规模从 10 大正式扩充为 **13 大生产级 MCP 服务端**；
   - 将领域分类由原本的 5 类扩充为 **7 大专业领域**：
     - **数据库与缓存 (Database & Cache)**：RDBMS、Redis；
     - **消息流与队列 (Messaging)**：RocketMQ 5、Kafka、RabbitMQ；
     - **对象存储 (Storage)**：S3；
     - **云原生与主机运维 (Cloud & Ops)**：Kubernetes、OpenSSH；
     - **网络与流量分析 (Network & Traffic)**：新增 TCP 协议代理与联调、全栈流量抓包与诊断；
     - **安全与数字取证 (Security & DFIR)**：新增 二进制逆向分析与取证；
     - **微服务与通信 (Governance & Comms)**：Nacos 3.0、Email。

2. **文档物理目录与路由架构解耦**：
   - 遵循单一职责原则（SRP），在 `docs/servers/` 下新建两个专属目录：
     - `docs/servers/network/tcp.md`：记录 `mcp-server-tcp`；
     - `docs/servers/network/traffic-inspector.md`：记录 `mcp-server-traffic-inspector`；
     - `docs/servers/security/reverse.md`：记录 `mcp-server-reverse`；
   - 侧边栏与总览大盘同步新增 `网络与流量分析` 与 `安全与数字取证` 分组。

3. **存量服务端传输层安全与诊断能力全景同步**：
   - **Redis (v2.2.0)**：文档同步 Streamable-HTTP 全双工流式传输与 `/mcp` 端点、`--auth-token` 鉴权、`--allowed-hosts` 白名单、`/health` 与 `/healthz` 探活缓存（2.0s 双检锁防击穿）及 Nginx 反向代理配置；
   - **RDBMS (v1.4.0)**：文档同步 `TokenAuthMiddleware` Bearer Token 鉴权、`--allowed-hosts` 与 `--cors-origins` 防御、`/health` 与 `/ping` 探针及优雅停机；
   - **SSH (v1.4.1)**：文档同步收敛单一版本信源后的 CLI 命令、`--doctor` 全景排障扩展（SSE 非回环熔断、预建隧道与白名单诊断）及 CORS 来源白名单。

4. **全站一致性级联刷新**：
   - 首页 `docs/index.md`、矩阵大盘 `docs/servers/index.md`、多客户端统一接入指南 `docs/guide/client-setup.md` 与快速起步 `docs/guide/getting-started.md` 全量同步更新，确保全站数字、架构图与描述 100% 闭环。

## 考虑备选

- **备选 A（合并归入 `docs/servers/tools/`）**：将 TCP、抓包与逆向全部堆砌在已有 `tools/` 目录下。该方案造成通用通信工具（Email）与重度网络/安全底层服务职责混淆，违背高内聚原则，因此否决；
- **备选 B（创建合并大类 `docs/servers/network-security/`）**：将三者统一归入网络安全。该方案虽然减少了一个目录，但模糊了“网络通信抓包”与“二进制逆向取证”截然不同的领域边界与技能受众，因此否决；
- **备选 C（独立细分 `network/` 与 `security/`，当前方案）**：分类精确契合现代基础设施分层，具备极佳的可扩展性与专业度，选定此方案。

## 产生的后果

- **正面影响**：
  - 矩阵覆盖的技术版图显著扩展，填补了大模型在工业网络交互、网络会话诊断与二进制静态安全分析领域的空白；
  - 领域模型和文档目录结构清晰规范，为后续继续扩充安全审计与网络治理类服务奠定标准化基准；
  - 生产级安全防护体系从“单服务只读防护”跃迁至“传输层网关防御 + 运行期行为审计”的立体化安全标准。
- **负面成本/注意事项**：
  - 新增 3 篇详尽服务端文档与大盘拓扑图，需在构建期校验全站链接与组件渲染合规性。
