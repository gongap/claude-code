# 06. 用户意图理解

[返回总览](../README.md) | [提示词工程](../02-prompt-engineering/README.md) | [正确性](../07-reasoning-correctness/README.md)

## 一句话理解

Claude Code 不是靠一个神秘的“意图识别模型”理解用户，而是通过输入路由、attachment 抽取、命令识别、提示建议、权限分类器等多层机制来逼近用户意图。

## 1. 输入先被路由，而不是直接送模型

`src/utils/handlePromptSubmit.ts` 和 `src/utils/processUserInput/processUserInput.ts` 会先判断：

- 是否是 `/command`
- 是否是本地 exit/quit 类命令
- 是否包含 pasted text / image / IDE selection
- 是否需要展开引用
- 是否来自 bridge / remote，需要禁用 slash command

所以“理解意图”的第一步其实是输入类型识别。

## 2. Slash command 是显式意图

`src/utils/messageQueueManager.ts:isSlashCommand()` 与 `src/commands.ts` 共同定义了显式意图层。

用户一旦输入 `/review`、`/compact`、`/tasks`，系统不会让主模型自由发挥，而是直接进入相应 command 流程。

这是一种“把高价值意图显式结构化”的设计。

## 3. Attachment 抽取是在补完意图

`src/utils/attachments.ts` 会把很多外部上下文转成模型可见信息，例如：

- 文件内容
- 图片与文档
- IDE 选择
- 任务通知
- 计划模式提醒
- 技能发现
- MCP 指令 delta
- memory / CLAUDE.md

这相当于告诉模型：“用户虽然只说了一句话，但真正的意图上下文还有这些。”

## 4. Prompt Suggestion 在推测下一步意图

`src/services/PromptSuggestion/promptSuggestion.ts` 会基于历史消息尝试生成 suggestion，当前 prompt variant 明确是 `user_intent`。

这说明系统内部已经把“用户表述”与“系统推测的可执行意图”分开建模。

## 5. Auto-mode classifier 在理解‘用户是否真的授权’

`src/utils/permissions/yoloClassifier.ts` 不是理解任务意图，而是理解“动作边界意图”：

- 用户是否明确允许某类操作
- 哪些工具天然安全
- 哪些工具必须阻断或软拒绝

也就是把“我想做什么”和“用户是否允许我这么做”拆成两条语义链。

## 6. 任务通知伪装成 user-role message

`<task-notification>` 会以 user-role message 回到主线程。为了避免主模型把它当真人用户，coordinator prompt 和 query 逻辑都要求显式识别这种 XML。

这说明系统不仅在理解真实用户，也在理解“系统内部伪用户消息”。

## 7. 意图理解的真实策略

综合源码，系统的策略更像：

1. 先做输入路由
2. 再补全上下文
3. 再用系统提示限制解释空间
4. 再在权限层做风险语义判断
5. 再在 suggestion / speculation 层预测下一步

而不是一次性把“意图理解”交给主模型。

## 我对这部分的判断

- 这个项目对“意图”采取的是工程化分解，而不是端到端黑盒识别。
- 它把意图拆成：命令意图、任务意图、上下文意图、权限意图、后续动作意图。
- 这种设计更适合 agent 系统，因为每一层都能单独调试和替换。
