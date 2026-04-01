# Claude Code

Anthropic 官方 CLI 工具，为 Claude 提供终端形态的 Agent Runtime 环境。

## 项目概述

Claude Code 是一个以 `query()` 为中枢的 agent runtime，UI、命令、工具、任务、记忆、MCP、远程会话都围绕同一个查询循环组装。

核心特性：
- **多工具编排**：内置工具系统 + MCP 协议扩展
- **任务生命周期管理**：支持本地 agent、远程 agent、主线程后台化
- **上下文压缩**：分层上下文回收链（snip → microcompact → context collapse → reactive compact）
- **提示词工程**：多层提示系统（主系统提示 + 工具提示 + attachment 注入 + 压缩/记忆提示）
- **Vim 模式**：终端内嵌 Vim 按键绑定
- **插件系统**：支持本地插件、Skills、桥接协议扩展
- **多运行模式**：本地 daemon、远程会话、Coordinator 模式、沙箱执行

## 技术栈

- **运行时**: Bun
- **语言**: TypeScript (严格模式)
- **UI 框架**: Ink (React for CLI)
- **SDK**: @anthropic-ai/sdk, @anthropic-ai/claude-agent-sdk
- **协议**: MCP (Model Context Protocol)
- **布局引擎**: Yoga

## 目录结构

```
src/
├── entrypoints/           # CLI 入口点
│   ├── cli.tsx            # 主入口
│   ├── init.ts            # 初始化
│   ├── mcp.ts             # MCP 入口
│   └── sdk/               # SDK 类型定义
├── ink/                   # Ink UI 框架核心
│   ├── components/        # React 组件 (Box, Text, Button 等)
│   ├── events/            # 事件系统
│   ├── hooks/             # React Hooks
│   ├── layout/            # Yoga 布局引擎封装
│   ├── termio/            # 终端协议解析 (ANSI, CSI, OSC 等)
│   └── renderer.ts        # 渲染管线
├── state/                 # 状态管理 (Zustand)
│   ├── AppState.tsx       # 应用状态
│   └── store.ts
├── query/                 # 查询引擎核心
├── tools/                 # 内置工具集
├── tasks/                 # 任务生命周期 (LocalAgent, RemoteAgent 等)
├── services/              # 核心服务
│   ├── mcp/               # MCP 服务
│   ├── plugins/           # 插件系统
│   └── context/           # 上下文管理
├── commands/              # Slash commands
├── bridge/                # 桥接协议 (IDE, Chrome, 远程)
├── coordinator/           # Coordinator 协调模式
├── buddy/                 # Buddy agent 模式
├── voice/                 # 语音模式
├── skills/                # Skills 系统
├── vim/                   # Vim 按键绑定
├── remote/                # 远程会话
├── daemon/                # Daemon 模式
├── bootstrap/             # 启动引导
├── plugins/               # 插件系统
├── self-hosted-runner/    # 自托管运行器
├── environment-runner/    # 环境执行器
├── jobs/                  # 作业调度
├── schemas/               # 数据 schema
├── constants/             # 常量定义
├── hooks/                 # React hooks
├── components/            # UI 组件
├── screens/               # 屏幕/视图
├── types/                 # 类型定义
├── utils/                 # 工具函数
├── context.ts             # 上下文管理
├── query.ts               # 查询主循环
└── main.tsx               # 主入口

docs/                      # 项目架构文档
stubs/                     # 内部依赖桩文件
```

## 快速开始

### 前置条件

- Bun >= 1.0

### 安装依赖

```bash
bun install
```

### 运行

```bash
bun run start              # 交互模式
bun run dev                # 开发模式（热重载）
bun run ask -p "问题"       # 一次性查询
```

### 常用命令

```bash
bun --preload ./preload.ts src/entrypoints/cli.tsx --help           # 查看帮助
bun --preload ./preload.ts src/entrypoints/cli.tsx -p "2+2=?"      # 打印模式
bun --preload ./preload.ts src/entrypoints/cli.tsx --add-dir .      # 允许目录访问
bun --preload ./preload.ts src/entrypoints/cli.tsx --resume         # 恢复会话
```

## 架构图

```
cli.tsx 启动
    ├── main.tsx 初始化
    │       ├── 配置加载、插件初始化、MCP 连接预取
    │       └── MDM、Keychain、GrowthBook 预热
    ├── commands.ts 注册 /command
    ├── handlePromptSubmit 处理用户输入
    ├── processUserInput 解析 slash command、附件
    └── query.ts 核心状态机
            ├── 构造 system prompt + contexts
            ├── 调用模型
            ├── assistant 流式输出 / tool_use
            ├── toolOrchestration 工具编排
            │   └── tools/* 执行
            └── 任务通知 / attachment / memory / compact
```

## 文档

项目详细分析文档见 [docs/](docs/README.md)：

1. [01 架构分析](docs/01-architecture/README.md)
2. [02 提示词工程](docs/02-prompt-engineering/README.md)
3. [03 任务编排与 Agent 引擎](docs/03-orchestration-agent-engine/README.md)
4. [04 功能项与能力地图](docs/04-capabilities/README.md)
5. [05 任务调度设计](docs/05-scheduling/README.md)
6. [06 用户意图理解](docs/06-intent-understanding/README.md)
7. [07 深入思考与正确性保证](docs/07-reasoning-correctness/README.md)
8. [08 上下文压缩与关键信息保真](docs/08-context-compression/README.md)
9. [09 扩展分析](docs/09-extended-analysis/README.md)

## 许可证

Anthropic
