# Ateng MCP 统一服务矩阵领域模型规范

本项目基于 VitePress Zenith 模板构建，用于沉淀与发布 Ateng 旗下生产级 Model Context Protocol (MCP) 服务端矩阵的架构设计、配置字典与接入规范。

## 统一领域语言 (Glossary)

- **MCP 服务端 (MCP Server)**: 遵循 Anthropic Model Context Protocol 协议规范独立构建与运行的生产级服务，暴露标准化 Tools、Resources 及 Prompts 接口。
- **协议传输模式 (Transport)**: 支持 Stdio（本地标准输入输出管道）、SSE（Server-Sent Events 远程长连接网关）及 Streamable-HTTP（全双工流式 HTTP 传输协议）多模传输。
- **客户端 / Agent (Client)**: 挂载并调度 MCP 服务的上层智能体或 IDE 宿主环境（如 Claude Desktop、Cursor、Cline、Windsurf、Antigravity、Cherry Studio、Dify 等）。
- **服务矩阵 (Server Matrix)**: 涵盖关系数据库（RDBMS）、分布式缓存（Redis）、消息中间件（RocketMQ、Kafka、RabbitMQ）、对象存储（S3）、云原生与主机运维（Kubernetes、OpenSSH）、网络与流量分析（TCP、Traffic Inspector）及安全与数字取证（Reverse）等 7 大专业领域的 13 大生产级服务集合。
- **全双工收发与独立读写锁 (Full-duplex Lock Separation)**: 在 TCP 等网络交互场景中采用读写锁分离架构，确保长轮询接收（`recv`）与指令下发（`send`）互不阻塞。
- **软超时与半包保全 (Soft Timeout & Drain Buffer)**: 网络定界符未达时不破坏报文流，在软超时后无损保全已接收字节切片等待后续拼接，配合防 OOM 熔断门禁保护内存。
- **环形流量缓冲区 (Traffic Ring Buffer)**: 为每个连接或会话分配定长内存环形队列，记录双向收发时序、方向及 Hex/文本快照，支持 MCP Resource 标准化挂载读取。
- **主控与受控子进程解耦架构 (Supervised Decoupled Architecture)**: 在流量检测等高隔离要求场景下，FastMCP 主控进程通过共享 SQLite WAL 数据总线纳管受控引擎子进程（如 `mitmdump` 与 `tshark`），实现控制流与数据流的彻底解耦。
- **受管第 0 毫秒双轨捕获 (SupervisedLaunch)**: 在拉起目标进程瞬间原子注入代理网络参数与运行时 CA 环境变量，第 0 毫秒绑定 PID 树时空切片，彻底消除启动期漏包与多实例端口混淆。
- **写时复制虚拟打补丁 (COW Virtual Patching)**: 在分析会话写时复制内存层应用十六进制补丁并即时驱动反汇编与控制流重绘，物理源文件维持 100% 只读保真，支持安全导出至独立文件。
- **跨会话二阶结构化差异画像 (SSDEEP Binary Diff)**: 提取两组二进制样本的模糊哈希（0~100 相似度得分）、节区尺寸与香农熵差异（`entropy_delta`）及高危导入导出 API 变动集合，推导公共符号基址重定位偏移。
- **双检锁探活防击穿缓存 (Double-checked Lock Probe Cache)**: 在探活端点（`/health`、`/healthz`）引入极短内存缓存与并发双检锁，杜绝高频 K8s Liveness/Readiness 探针击穿后端连接池。
- **传输层 Token 门禁与 DNS 重绑定防御 (Bearer Token Gate & DNS Rebinding Defense)**: 远程 HTTP/SSE 网关通过固定常量时间比对进行 Bearer Token 校验，并通过 `--allowed-hosts` 白名单物理拦截非法 Host 标头与 DNS Rebinding 跨源攻击。
