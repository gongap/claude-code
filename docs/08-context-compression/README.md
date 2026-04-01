# 08. 上下文压缩与关键信息保真

[返回总览](../README.md) | [提示词工程](../02-prompt-engineering/README.md)

## 一句话理解

Claude Code 的上下文压缩不是单次 summarize，而是一条多层压缩流水线，目标是“尽量晚地丢信息，尽量结构化地保留关键状态”。

## 压缩链路

按 `src/query.ts` 的执行顺序，可以看到这条链：

1. `applyToolResultBudget`
2. `snip`
3. `microcompact`
4. `context collapse`
5. `autocompact`
6. `reactive compact`

这说明系统优先丢弃“最低价值上下文”，最后才做整段摘要。

## 每层在做什么

## 1. Tool Result Budget

先控制工具结果内容大小，避免大型工具输出直接挤爆上下文。

## 2. Snip

基于历史片段做快速裁剪，尽量不进入更重的压缩。

## 3. Microcompact

`src/services/compact/microCompact.ts` 主要针对可压缩工具结果；也能配合缓存编辑，把旧工具结果替换成简化占位。

## 4. Context Collapse

当前仓库内部实现是 stub，但从 `query.ts` 的注释可知，它更像“把旧上下文提交到 collapse store，再按视图投影回会话”，不是简单生成一条 summary message。

## 5. Autocompact

`src/services/compact/autoCompact.ts` 根据上下文窗口阈值自动触发。真正摘要逻辑在 `src/services/compact/compact.ts`。

## 6. Reactive Compact

当前仓库是 stub，但从调用点可知：当真实 API 返回 prompt-too-long / media-size error 时，系统还能在失败后再试图压缩恢复。

## 关键信息如何被保住

## 1. Compact Prompt 明确要求保留关键结构

`src/services/compact/prompt.ts` 要求摘要保留：

- 用户主请求与意图
- 关键技术概念
- 文件与代码片段
- 错误与修复
- 所有用户消息
- 待办
- 当前工作
- 下一步

这不是普通聊天摘要，而是“可继续开发”的工作摘要。

## 2. Session Memory 是第二条保真链

`src/services/SessionMemory/prompts.ts` 维护结构化会话笔记，包括：

- Current State
- Task specification
- Files and Functions
- Errors & Corrections
- Workflow
- Worklog

它补的是“长期连续性”，而不是当前轮上下文。

## 3. Durable Memory 抽取的是跨会话知识

`src/services/extractMemories/*` 会把用户偏好、长期项目事实、经验教训写入 memory 目录，避免压缩后彻底遗忘。

## 4. 附件会在压缩后再注入

`compact.ts` 明确会在压缩后补回某些重要信息，如计划模式、技能、部分文件、memory 等。也就是说，压缩不是一次性删完，而是“摘要后重建必要工作上下文”。

## 5. Boundary 与持久化

系统通过 compact boundary message 记录“从哪里开始是新历史”，同时把替换、任务输出、side transcript 等状态持久化，保证 resume 后不会完全断层。

## 当前源码中需要注意的事实

- `contextCollapse` 内部实现缺失，当前只能确认其调用位置、目标和注释描述
- `reactiveCompact` 内部实现缺失，当前只能确认它负责溢出后的恢复重试

## 我对这套压缩设计的判断

- 它的核心思想是分层降级，而不是单点 summarize。
- “关键信息保真”靠三条线同时完成：compact summary、session memory、durable memory。
- 这也是为什么系统敢在 prompt 中说“conversation has unlimited context through automatic summarization”。
