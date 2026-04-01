# 04. 功能项与能力地图

[返回总览](../README.md) | [扩展模块](../09-extended-analysis/README.md)

## 一句话理解

Claude Code 的能力不是单个“大模型能力”，而是“命令层 + 工具层 + 任务层 + 扩展层”的组合能力。

## 核心能力分类

| 能力域 | 代表模块 | 说明 |
| --- | --- | --- |
| 代码读写 | `FileReadTool` `FileEditTool` `FileWriteTool` | 读文件、编辑、创建文件 |
| 搜索检索 | `GlobTool` `GrepTool` `LSPTool` | 文件级、内容级、语言服务级检索 |
| Shell 执行 | `BashTool` | 运行系统命令，支持权限与安全约束 |
| Web / 资料 | `WebFetchTool` `WebSearchTool` | 外部网页抓取与搜索 |
| 多代理协作 | `AgentTool` `SendMessageTool` `TeamCreateTool` | 派发、续跑、建团队 |
| 任务管理 | `TodoWriteTool` `TaskCreate/Get/List/Update` | 显式任务拆解与状态跟踪 |
| 计划与模式切换 | `EnterPlanMode` `ExitPlanMode` `EnterWorktree` | 工作模式切换 |
| MCP 扩展 | `MCPTool` `ListMcpResourcesTool` `ReadMcpResourceTool` | 外部工具与资源接入 |
| 远程运行 | `RemoteAgentTask` `bridge` `remote` | 远端 session 与跨设备控制 |
| 记忆与压缩 | `SessionMemory` `extractMemories` `compact` | 长会话连续性 |

## 命令层能力

`src/commands.ts` 展示了产品面向用户的能力入口。高频类别有：

- 会话管理: `/resume` `/session` `/rename` `/clear`
- 环境与配置: `/config` `/permissions` `/model` `/output-style`
- 代码工作流: `/diff` `/review` `/commit` `/branch`
- 扩展系统: `/mcp` `/skills` `/plugin`
- 计划与调度: `/plan` `/tasks`
- 远程与设备: `/desktop` `/mobile` `/bridge`

所以命令层更像“操作面板”，而不只是 prompt 宏。

## 多种运行场景

项目支持的不是单一终端使用方式，而是多种场景：

- 交互式 REPL
- 非交互 `-p` / SDK 模式
- 后台本地任务
- 远程 agent / web session
- IDE bridge
- in-process teammate / swarm

## 正确性相关能力

系统还内建了很多“不是用户直接感知，但决定质量”的能力：

- 权限检查
- auto mode classifier
- compact / reactive recovery
- verification agent
- hooks
- task notification
- prompt suggestion / speculation

这些能力共同决定“这个 agent 是否可长期运行”。

## 我认为最有辨识度的能力

1. 工具与代理统一在同一 query runtime 中
2. 子代理不是玩具功能，而是任务系统的一等公民
3. MCP、skills、plugins、bridge 让它不止是本地 CLI
4. 长上下文不是靠模型原生窗口，而是靠自己的压缩与记忆系统

## 相关章节

- 多代理与引擎: [03 任务编排、提示词编排与 Agent 引擎](../03-orchestration-agent-engine/README.md)
- 调度: [05 任务调度设计](../05-scheduling/README.md)
- 扩展层: [09 我补充发现的重要模块](../09-extended-analysis/README.md)
