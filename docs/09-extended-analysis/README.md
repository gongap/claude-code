# 09. 我补充发现的重要模块

[返回总览](../README.md) | [能力地图](../04-capabilities/README.md)

这一章对应你原始要求中的第 9 点：查找你没提到但项目里很关键的部分，并补充分析。

## 1. MCP 是能力扩展总线

`src/services/mcp/client.ts` 展示出 MCP 在这里不是附加插件，而是一等公民能力层。

它负责：

- 连接 stdio / SSE / streamable HTTP / WebSocket MCP 服务
- 动态拉取 tools / resources / prompts
- 处理 OAuth、session expired、tool result truncation
- 让 MCP tools 和本地 tools 共同进入主系统

所以 MCP 在这个项目里承担的是“统一外部工具协议”角色。

## 2. Skills 不是普通 prompt 模板

`src/skills/loadSkillsDir.ts` 表明 skills 支持：

- frontmatter 元数据
- allowed tools
- model / effort override
- hooks
- 参数替换
- 路径作用域
- fork context

也就是说 skill 更像“可装载的半结构化工作单元”，不是单纯文本宏。

## 3. Plugins 是产品扩展层

`src/services/plugins/pluginOperations.ts` 与相关 `utils/plugins/*` 表明插件系统支持：

- marketplace
- scope 安装: user / project / local / managed
- 依赖与反向依赖
- 版本缓存与更新
- policy 限制

技能更偏 prompt/workflow，插件更偏产品能力扩展。

## 4. Bridge / Remote 让它从 CLI 变成多端系统

`src/bridge/bridgeMain.ts` 与 `src/remote/RemoteSessionManager.ts` 说明项目并非单端本地 CLI：

- 可与远程 session 建立长连接
- 可处理 reconnect、token refresh、capacity throttle
- 可把 permission request 透传到远端
- 可在 IDE / 手机 / 桌面之间共享会话

也就是说 Claude Code 的源码里已经隐含了一个多终端 agent platform。

## 5. Memory 体系比“记忆文件”复杂得多

从源码能看到至少三类 memory：

1. `CLAUDE.md` / nested memory
2. Session Memory
3. Extracted durable memories

再加上 team memory / memory sync，说明“记忆”在这里是完整子系统，不只是读一份 markdown。

## 6. Auto Mode Classifier 是安全边界核心

`src/utils/permissions/yoloClassifier.ts` 与 `classifierDecision.ts` 显示 auto mode 并不是简单 auto-accept。

它有：

- allowlisted safe tools
- XML 2-stage classifier
- 用户自定义 allow / soft deny / environment
- 与 Bash classifier 结合

这代表产品已经意识到“agent 自主执行”必须有独立安全判定面。

## 7. Query 系统对缓存极端敏感

仓库很多实现都围绕 prompt cache 命中率设计：

- system prompt static/dynamic boundary
- memoized prompt sections
- agent list 改成 attachment delta
- MCP instructions 改成 delta attachment
- cached microcompact

这说明性能优化重点不是单纯代码速度，而是 token economics。

## 8. 当前仓库的不完整点

当前源码里有几类模块并不完整：

- `src/services/contextCollapse/*`
- `src/services/compact/reactiveCompact.ts`
- `src/jobs/classifier.ts`
- `src/tasks/LocalWorkflowTask/LocalWorkflowTask.ts`

因此对这些模块应当做“调用点级分析”，不要假装掌握了内部细节。

## 我补充后的总体理解

- 这个项目真正的产品边界比“终端编码助手”大得多。
- 它已经具备 agent platform 雏形：本地 runtime、远程 runtime、扩展总线、调度系统、记忆系统、多代理系统、权限与安全系统。
- 如果后续还要继续深挖，我会优先建议沿着这四条线继续：

1. `query.ts` 与 `QueryEngine.ts` 的差异与演进
2. MCP / bridge / remote 的统一协议层
3. auto mode classifier 的真实 prompt 与策略
4. compact、session memory、durable memory 三者如何协同
