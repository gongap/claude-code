# 07. 深入思考、充分理解与正确输出

[返回总览](../README.md) | [用户意图理解](../06-intent-understanding/README.md) | [上下文压缩](../08-context-compression/README.md)

## 一句话理解

这个项目并不假设模型天然会“认真思考并正确输出”，而是通过一整套约束、恢复、验证和模式切换机制逼着它更可靠。

## 正确性的来源不是单点

## 1. 系统提示先压行为偏差

`src/constants/prompts.ts` 直接规定：

- 先读文件再改
- 不要猜测未读代码
- 有专用工具不用 Bash
- 不要虚报测试成功
- 风险操作先确认

这是第一层“思考约束”。

## 2. 工具 schema 与权限系统限制行动空间

`Tool.ts` + `canUseTool` + permission mode 让模型就算想乱来，也不一定能执行。

auto mode 下还会走 classifier，尤其写操作和敏感操作会额外被审视。

## 3. Query Loop 内置恢复逻辑

`src/query.ts` 对几类常见失败有明确恢复策略：

- prompt too long
- media size error
- max output tokens
- fallback model 切换
- streaming 中断

也就是说，系统并不把“第一次输出失败”当成最终失败。

## 4. Plan mode 与 coordinator mode 是显式深思考模式

- plan mode 让模型先规划，再进入实现
- coordinator mode 强制把研究、综合、实现、验证拆开

这类模式不是锦上添花，而是“把复杂任务拆成更可靠的认知阶段”。

## 5. Verification 被产品化

从系统提示、agent 定义到 `verification agent` 的存在都说明：作者知道“模型自证正确”不可靠，所以尝试把验证外包给独立流程。

这类设计比单纯要求“请仔细检查”更有效。

## 6. Hooks 是外部纠偏机制

用户或系统可以在若干事件点插入 hook，对 prompt submit、tool use、post sampling 等阶段进行干预。

这意味着“正确性”不仅来自模型本体，也来自宿主系统的外部规则。

## 7. Session Memory / Extract Memories 保留纠错历史

`SessionMemory` 与 `extractMemories` 都强调：

- 用户纠正过什么
- 哪些方案失败过
- 当前正确状态是什么

这让系统在长会话中不至于反复犯同一个错误。

## 8. 输出风格也参与正确性

输出风格相关提示不是只有美观作用。比如长度限制、不要过度铺垫、引用文件位置、不要在工具调用前后产生误导性文本，都会直接影响“用户是否正确理解系统状态”。

## 我对这部分的判断

- 这个项目对“深入思考”的理解非常工程化：不是让模型多想，而是让系统强制它经过更可靠的路径。
- 它把正确性拆成四层：输入理解正确、行动权限正确、执行恢复正确、最终验证正确。
- 如果只看 prompt，会低估这套系统；真正保证正确性的，是 prompt、tool、task、memory、hooks、verification 一起工作。
