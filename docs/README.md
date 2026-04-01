# Claude Code Project Analysis

本文档基于当前仓库源码，对 Claude Code 的主链路、提示词工程、任务编排、调度、上下文压缩与扩展层做结构化分析，并落地为可继续维护的文档集。

## 说明

- 证据主要来自 `src/main.tsx`、`src/query.ts`、`src/constants/prompts.ts`、`src/services/*`、`src/tools/*`、`src/tasks/*`。
- 当前仓库存在一部分自动生成的 stub，例如 `src/services/contextCollapse/index.ts`、`src/services/compact/reactiveCompact.ts`、`src/jobs/classifier.ts`。这类部分文档会明确区分“源码直接可证实”与“由调用点反推”的内容。

## 阅读顺序

1. [01 架构分析](./01-architecture/README.md)
2. [02 提示词工程](./02-prompt-engineering/README.md)
3. [03 任务编排、提示词编排与 Agent 引擎](./03-orchestration-agent-engine/README.md)
4. [04 功能项与能力地图](./04-capabilities/README.md)
5. [05 任务调度设计](./05-scheduling/README.md)
6. [06 用户意图理解](./06-intent-understanding/README.md)
7. [07 深入思考、充分理解与正确输出](./07-reasoning-correctness/README.md)
8. [08 上下文压缩与关键信息保真](./08-context-compression/README.md)
9. [09 我补充发现的重要模块](./09-extended-analysis/README.md)

## 关键结论

- 这个项目的核心不是“聊天界面”，而是一个以 `query()` 为中枢的 agent runtime。
- 提示词工程不是单一 system prompt，而是“主系统提示 + 工具提示 + attachment 注入 + side-query 提示 + 压缩/记忆提示”的多层系统。
- 任务编排分成三层：主线程 query 循环、工具执行编排、任务/子代理生命周期管理。
- 正确性不是只靠模型能力，而是靠权限系统、auto-mode classifier、工具约束、压缩保真、plan mode、verification、hooks 等机制共同兜底。
- 上下文管理不是单点能力，而是 `tool result budget -> snip -> microcompact -> context collapse -> autocompact -> reactive compact` 的分层回收链。

## 代码入口地图

- CLI 启动: `src/main.tsx`
- 命令注册: `src/commands.ts`
- 查询主循环: `src/query.ts`
- 工具定义与上下文: `src/Tool.ts`
- 工具注册: `src/tools.ts`
- 系统提示拼装: `src/constants/prompts.ts`
- 工具执行编排: `src/services/tools/toolOrchestration.ts`
- 任务系统: `src/tasks/*`
- 扩展层: `src/services/mcp/*`、`src/skills/*`、`src/bridge/*`、`src/services/plugins/*`
