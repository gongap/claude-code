# 05. 任务调度设计

[返回总览](../README.md) | [Agent 引擎](../03-orchestration-agent-engine/README.md)

## 一句话理解

这个项目的调度不是单一 cron，而是“命令队列调度 + 任务生命周期调度 + 定时任务调度 + 远程调度”四层叠加。

## 1. 命令队列调度

`src/utils/messageQueueManager.ts` 维护全局统一命令队列，所有来源都进同一队列：

- 用户输入
- 任务通知
- orphaned permission 响应
- scheduled task 触发
- bridge / remote 注入消息

优先级分为：

- `now`
- `next`
- `later`

这让系统可以在不丢失主线程响应性的情况下插入后台事件。

## 2. Query Loop 内部调度

`src/query.ts` 里有自己的微调度逻辑：

- `sleep` 工具会影响队列 drain 策略
- attachment 在工具轮结束后统一注入
- queued command 只在适合的 turn 边界被消费
- subagent 只消费发给自己的 task-notification

也就是说，队列并不是“来了就立刻跑”，而是按 query turn 边界吸收。

## 3. 定时任务调度

当前源码能明确看到本地定时任务调度的几个关键点：

1. `.claude/scheduled_tasks.json` 是持久化来源
2. `src/utils/cronTasksLock.ts` 通过锁文件保证同一项目目录只由一个 session 驱动 scheduler
3. `src/cli/print.ts` 在 SDK / `-p` 模式下会启动 cron scheduler
4. scheduler 触发时不是直接执行函数，而是把 prompt 以 `isMeta: true` 的方式 enqueue 回主系统

这意味着“定时任务”在实现上其实是“系统自动投递一条隐藏 prompt”。

## 4. `Cron` 与 `/loop`

`src/skills/bundled/loop.ts` 把用户自然语言的间隔表达转成 `CronCreateTool` 调用。

这层设计很重要：

- 用户面对的是“意图型接口”
- 内部落地的是标准化 cron 表达式
- 任务创建后还会立即执行一次，而不是只等下一次触发

## 5. 后台任务调度

后台任务并不靠队列 alone，而是 Task 框架：

- `LocalMainSessionTask`: 主线程后台化
- `LocalAgentTask`: 本地 agent 后台执行
- `RemoteAgentTask`: 远程 session 轮询
- `InProcessTeammateTask`: 同进程队友

这些任务完成后通过 `<task-notification>` 回流给主线程模型。

## 6. 远程调度

仓库里还有第二套“远程触发”概念：

- `RemoteTriggerTool`
- `src/skills/bundled/scheduleRemoteAgents.ts`

它不是本地 cron，而是为远程 Claude Code session 创建 schedule trigger。也就是说，本项目同时支持本地调度和云端调度。

## 设计优点

1. 所有调度最终都回到统一对话 runtime
2. 不需要为 scheduled task 额外维护第二套执行引擎
3. 同一用户意图可以在交互、后台、定时、远程之间迁移

## 我对这套调度的判断

- 最聪明的点不是“有 cron”，而是“把 cron fire 重新编码成系统 prompt”。
- 这让 scheduler 变成现有 agent runtime 的输入源，而不是并行的第二系统。
- 配合任务通知机制，系统把异步工作统一收敛成“消息驱动”。
