# 03. 任务编排、提示词编排与 Agent 引擎

[返回总览](../README.md) | [架构分析](../01-architecture/README.md) | [任务调度](../05-scheduling/README.md)

## 一句话理解

这个项目的 agent 引擎核心是 `src/query.ts`，它把“模型输出、工具执行、上下文治理、错误恢复、任务继续”组织成一个循环状态机。

## Query Loop 是真正的引擎

`query()` / `queryLoop()` 持有一份循环状态：

- `messages`
- `toolUseContext`
- `autoCompactTracking`
- `maxOutputTokensRecoveryCount`
- `hasAttemptedReactiveCompact`
- `pendingToolUseSummary`
- `turnCount`
- `transition`

这不是一次 request-response，而是“一个 agentic turn 的多轮内部推进”。

## 每一轮内部在做什么

1. 取 compact boundary 之后的消息
2. 对 tool result 做预算裁剪
3. 执行 `snip`
4. 执行 `microcompact`
5. 执行 `context collapse`
6. 执行 `autocompact`
7. 调模型流式输出
8. 收集 `tool_use`
9. 根据并发安全性执行工具
10. 注入 attachment、memory、技能发现
11. 如果还有工具结果，则继续下一轮

所以它是“模型轮”和“工具轮”交错推进。

## 工具编排

`src/services/tools/toolOrchestration.ts` 会先把工具调用分批：

- 并发安全的一组，批量并发
- 非并发安全的工具，逐个串行

并发安全不是固定写死，而是每个工具可以根据输入判断 `isConcurrencySafe()`。

这意味着系统不是简单 `Promise.all`，而是“基于工具语义的调度”。

## Streaming Tool Execution

`query.ts` 中的 `StreamingToolExecutor` 允许模型还在流式输出时，已完成的工具结果被提前产出。它解决的是两个问题：

- 降低等待延迟
- 在 fallback / abort 时避免 orphaned tool result

这类设计说明作者已经把 agent 当成一个长时运行系统，而不是同步聊天接口。

## Agent 不是单一形态

当前仓库至少有这些执行形态：

- 主线程 agent
- 本地子代理: `LocalAgentTask`
- 主线程后台化: `LocalMainSessionTask`
- 远程子代理: `RemoteAgentTask`
- 进程内 teammate: `InProcessTeammateTask`
- workflow task: `LocalWorkflowTask`，但源码在当前仓库是 stub

这些类型共享“任务”这个壳，但执行位置、状态持久化和通知方式不同。

## AgentTool 的本质

`AgentTool` 做的不是普通函数调用，而是：

1. 选 agent definition
2. 解析可用工具和可用 MCP
3. 创建子上下文
4. 启动新 query loop
5. 把结果写入 side transcript
6. 通过 `<task-notification>` 回流给主线程

所以它更接近“在同一 runtime 中开一个新 agent session”。

## Coordinator Mode

`src/coordinator/coordinatorMode.ts` 说明这个系统已经显式支持“管理者代理”模式：

- coordinator 负责拆研究、拆实现、拆验证
- worker 负责独立执行
- coordinator 必须自己综合 worker 结果，不能把理解外包给下一跳 worker

这套设计非常像一个内建的 swarm orchestration DSL。

## 提示词编排如何配合编排引擎

- 主线程拿完整系统提示
- subagent 可能继承父上下文，也可能从零开始
- coordinator 拿 coordinator 专用 system prompt
- verification agent、plan agent、explore agent 等 built-in agent 各自定义场景提示

这说明“任务编排”和“提示词编排”是同一个系统的两面。

## 我对这个 agent engine 的判断

- 这是一个显式状态机驱动的 agent runtime，不是隐式递归调用模型。
- 它把“长任务、后台任务、多代理协作、恢复与重试”都纳入同一套循环模型中。
- 真正重要的不是 `AgentTool` 本身，而是 `query.ts + task system + prompt layering` 的组合。
