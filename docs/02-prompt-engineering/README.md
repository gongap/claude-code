# 02. 提示词工程

[返回总览](../README.md) | [架构分析](../01-architecture/README.md) | [上下文压缩](../08-context-compression/README.md)

## 一句话理解

这个项目的提示词工程不是单个 system prompt，而是一个“多源拼装系统”。

## 提示词的来源

1. 主系统提示
   `src/constants/prompts.ts:getSystemPrompt()`
2. 工具提示
   每个工具目录下的 `prompt.ts`
3. Agent 提示
   `src/tools/AgentTool/prompt.ts`、`src/coordinator/coordinatorMode.ts`
4. side-query 提示
   压缩、session memory、memory extraction、auto-mode classifier 等各自有独立 prompt
5. attachment 转换提示
   `src/utils/attachments.ts` 把任务通知、技能发现、MCP 指令、计划模式提醒等转换成模型可见上下文
6. 用户追加提示
   `appendSystemPrompt`、custom agent prompt、技能 prompt、CLI flag prompt

## 主系统提示的组织方式

`src/constants/prompts.ts` 把 system prompt 分成“静态前缀”和“动态尾部”。

- 静态前缀包含身份、任务原则、动作风险、用工具原则、风格约束
- 动态尾部包含 session guidance、memory、语言、output style、MCP instructions、scratchpad、token budget 等
- 两段之间用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 分隔，目的是保护 prompt cache

这说明作者非常在意“提示词缓存命中率”。

## 主系统提示实际在约束什么

主提示不是泛泛而谈，而是在强约束这些行为：

- 先读后改，不要猜代码
- 有专用工具就不要滥用 Bash
- 工具可并行时并行
- 风险操作要确认
- 不要过度设计、过度注释、过度防御
- 输出要准确，不要虚报成功
- 上下文会自动压缩，不需要自己担心窗口天然终止

这类提示本质上是在纠正大模型最常见的工程偏差。

## 工具提示的角色

每个工具不仅有 schema 和执行逻辑，还有自己的行为约束。例如：

- `BashTool` 的 prompt 会限制 `sleep`、轮询、破坏性命令、后台执行策略
- `AgentTool` 的 prompt 会教模型何时派子代理、如何写子代理提示
- `TaskCreateTool` / `TodoWriteTool` 会把任务拆解变成显式工作流
- `WebFetchTool` 会要求引用和转述方式符合约束

所以“提示词工程”与“工具设计”在这里是耦合的。

## Agent 提示词编排

`AgentTool` 本身不是只有一个 prompt。

- 普通 agent 使用 `src/tools/AgentTool/prompt.ts`
- coordinator mode 使用 `src/coordinator/coordinatorMode.ts` 的独立系统提示
- built-in agent 还能叠加自己的 `getSystemPrompt()`
- fork subagent 与 fresh subagent 的提示风格不同：前者写 directive，后者写完整 briefing

这说明它不是简单“spawn another model”，而是在 prompt 层明确区分上下文继承与上下文隔离。

## side-query 提示词

这是项目里很容易被忽略但很关键的一层。

- 压缩提示: `src/services/compact/prompt.ts`
- Session Memory 更新提示: `src/services/SessionMemory/prompts.ts`
- Memory 抽取提示: `src/services/extractMemories/prompts.ts`
- Auto mode classifier 提示: `src/utils/permissions/yoloClassifier.ts`

这些 side query 不是面向用户，而是面向系统内部子任务。

## 提示词工程的三个核心目标

1. 让模型像工程代理，而不是闲聊模型
2. 让缓存稳定，减少 token 浪费
3. 让不同子系统拥有专用 prompt，而不是把所有规则堆进主提示

## 我对这套 prompt 工程的判断

- 它的重点不是“写一段厉害的 system prompt”，而是“让不同运行阶段各自拿到合适的 prompt”。
- 动态边界、memoized section、attachment 注入、tool prompt、side-query prompt 一起构成了完整的提示词基础设施。
- 真正的工程价值在“提示词与 runtime 联动”，而不在措辞本身。
