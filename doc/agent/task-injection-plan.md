# Omni Plan 任务注入与总结功能实施计划书

> 关联规范：[DSH任务注入接口规范.md](../../DSH任务注入接口规范.md)  
> 目标插件：`dsh-plugin-omni-plan`  
> 制定日期：2026-10-20  
> 当前版本：0.0.3

---

## 一、项目背景与核心目标

本计划书旨在将 Omni Plan 独立置顶小窗口与 DSH 主工作窗口全面联通，实现两大核心业务闭环：

1. **导入功能（Omni Plan 看板 → DSH 会话任务）**：
   - 将 Omni Plan 看板中沉淀的待办任务、焦点行动，经过格式规范化后安全注入到 DSH 当前活跃 Agent 会话的 Todo 任务清单中（`todo_write`），并在 DSH 会话内原生效力渲染。
2. **总结功能（灵感/焦点 → DSH 会话 AI 深度提炼与结构化回写）**：
   - 将零散碎片化的灵感（Inbox）与当前工作流焦点，通过非阻塞排队（`agent.followup`）交付给当前 DSH 会话的 AI，由 AI 进行深度目的推断、前置条件与风险分析，生成结构化任务并通过 `plan_apply_organization` 工具写回 Omni Plan。
3. **DSH 主窗口 UI 交互注入**：
   - 除了置顶独立小窗口底栏的“总结”和“导入”按钮外，在 DSH 会话工具栏（`conversation.session.header.utilities`）注入原生的快捷操作入口，实现双端一致操作体验。

---

## 二、关键技术事实与约束

根据《DSH任务注入接口规范.md》，本项目严格遵循以下事实约束：

| 关键要素 | 规范定义与约束 | 应对方案 |
|---|---|---|
| **DSH 任务归属** | 属于单个活跃的 Agent Session，非全局表 | 必须指定或自动匹配 Live Session，禁止跨会话混写 |
| **写入机制** | 官方工具 `todo_write` 进行全量整表替换 | 写入前必先读取当前 Session Todo，进行 `append` 合并去重 |
| **数据字段限制** | DSH Todo 仅有 `content` 和 `status` | 将任务元数据与来源编码进文本：`[OmniPlan] 标题 · 优先级 · ref=omni:task:<id>` |
| **并发策略安全** | 部署可能开启 `allowParallelInProgress: false` | 批量注入时状态一律置为 `pending`，防止写入失败 |
| **AI 总结不打断** | 严禁打断正在运行中的 Agent 轮次 | 必须采用 `agent.followup()` 排队机制，禁止使用 `agent.steer()` |
| **Prompt Injection 防护** | 灵感内容可能包含攻击性指令 | 不在消息体注入原文：AI 通过 `plan_get_overview` 工具读取，工具结果视为数据；短指令只给整理范围 |

---

## 三、四阶段实施路径规划

```text
┌──────────────────────────────────────────────────────────────┐
│ Phase 1: Host 端任务注入底座建设                             │
│   ├─ 新建 lib/dsh-todos.js (读取/合并/编码/写入)              │
│   ├─ host.js 注入 agents / sessionProjections                │
│   └─ 挂载 /dsh-todos/push, /dsh-todos/sessions, /dsh-todos/state │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ Phase 2: 独立置顶窗口（C# WPF）底栏“导入”功能实装            │
│   ├─ 获取最新活跃会话，打包当前任务数据                      │
│   ├─ 调用 /dsh-todos/push 执行注入                           │
│   └─ 底栏 Toast 反馈 (成功/跳过条数/未找到会话提示)          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ Phase 3: Host 端 AI“总结与整理”管道建设                      │
│   ├─ 挂载 POST /omni-plan/integrations/organize               │
│   ├─ 组装安全 prompt，通过 agent.followup() 非阻塞排队       │
│   └─ 注册 plan_apply_organization 写回落盘工具                │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ Phase 4: 独立置顶窗口“总结”按钮联动与 DSH 窗口 UI 注入        │
│   ├─ WPF 独立小窗口底栏“总结”按钮调用 organize 接口          │
│   ├─ DSH 会话头部 slot 注入“→ DSH 任务”与“AI 总结”按钮       │
│   └─ 全链路端到端联调、验收与文档沉淀                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 四、各阶段详细任务清单与技术方案

### 阶段一（Phase 1）：Host 端任务注入核心底座建设

- [x] **任务 1.1**：新建 `lib/dsh-todos.js` 模块
  - `read_current_todos(ctx, agent)`：优先自 `sessionProjections.stateOf(agent.session, 'todos')` 读取，兜底从事件日志中反查；
  - `build_todo_content(item, kind)`：将 Omni Plan 任务构造为 `[OmniPlan] <title> · <priority> · ref=omni:task:<id>`；
  - `merge_todos(current, additions, options)`：以 `ref=` 和完整文本双重幂等去重，默认 append 模式，新条目置为 `pending`；
  - `push_to_dsh_todos(ctx, { session_id, items, mode, signal })`：通过 `ctx.tools.execute({ name: 'todo_write', arguments: { todos }, agent })` 执行标准写入；
  - `list_live_sessions(ctx)`：探测当前所有处于在线激活态的 Agent Session。
- [x] **任务 1.2**：扩展 `lib/host.js` 依赖注入与路由挂载
  - `export const inject = ['tools', 'webServer', 'agents']`，可选挂载 `sessionProjections`、`systemPrompt`；
  - 注册 `GET /omni-plan/integrations/dsh-todos/sessions`：返回活跃会话列表与最新活跃会话推荐；
  - 注册 `GET /omni-plan/integrations/dsh-todos/state`：查询指定会话当前 Todo 列表；
  - 注册 `POST /omni-plan/integrations/dsh-todos/push`：接收待推送任务，自动解析目标会话并注入，返回 `{ ok: true, pushed, skipped, todos }`。
- [x] **任务 1.3**：增加 AI 自主同步工具与感知段落
  - 注册 `plan_push_to_dsh_todos` 工具（参数：`item_ids`, `mode`, `include_focus`）；
  - `systemPrompt` 增加轻量级短提示，告知 AI 当涉及任务清单时可调用该工具。
- [x] **阶段一验收**：调用接口推送模拟任务，确认 DSH 会话日志产生 `todo/write` 事件，返回码符合规范。

---

### 阶段二（Phase 2）：独立置顶窗口底栏“导入”功能实装

- [x] **任务 2.1**：在 `lib/OmniPlanTopmost.cs` 中实现 `ImportTasksToDsh()` 交互逻辑
  - 监听底栏 `_importButton` 点击事件；
  - 发送 GET 请求探测当前是否存在 Live Session：
    - 若不存在任何会话：底栏显示 Toast 提示 `未检测到活跃 DSH 会话，请先开启会话`；
    - 若存在活跃会话：过滤当前未完成的任务项（状态为 todo/in_progress），提取 `id` 列表；
  - 发送 POST 请求至 `/omni-plan/integrations/dsh-todos/push`；
  - 成功时更新底栏 Toast：`已成功导入 X 条任务到 DSH 窗口`（如有重复则补充 `跳过 Y 条`）。
- [x] **任务 2.2**：更新源码模板并编译热加载
  - 更新 `scratch/generate_topmost.js`，通过 `csc.exe` 重新编译 `lib/OmniPlanTopmost.exe`；
  - 通过本地端口 8574 平滑热重启置顶小窗口并测试导入交互。
- [x] **阶段二验收**：打开 DSH 会话，在置顶独立小窗口点击“导入”，DSH 窗口任务列表即时出现带有 `[OmniPlan]` 标记的待办。

---

### 阶段三（Phase 3）：Host 端 AI“总结与整理”管道建设

- [x] **任务 3.1**：在 `lib/host.js` 中挂载 `POST /omni-plan/integrations/organize`
  - 内存维护 `organize_requests` 请求映射（带 1 小时过期机制）；
  - 校验目标会话是否处于 Live 状态；
  - 提取选中的灵感列表（Inbox）或当前焦点；
  - 组装包含防注入安全沙箱的 `<omni-plan-organize-request>` Prompt 模板。
- [x] **任务 3.2**：通过 `agent.followup()` 实现非阻塞任务排队
  - 采用当前目标会话的 `agent.followup({ role: 'user', id: randomUUID(), content: [...], source: { kind: 'user' } })`；
  - `role` 必须显式给出，否则会话中会写入 role 缺失的 user/message，导致后续模型请求 422；
  - 确保当前 AI 正在回答或执行其他任务时不被强行掐断，执行完毕后自动开始分析。
- [x] **任务 3.3**：实现 AI 落盘工具 `plan_apply_organization`
  - 参数校验：来自 `<omni-plan-organize-request>` 的 `requestId` 必须有效；
    聊天直驱模式可省略 `requestId`（先 `plan_get_overview` 读取，再由 AI 整理落盘）；
  - 数据写回：把 AI 结构化总结提炼的成果写回 Omni Plan（创建新任务，写入目的、前置条件、假设、风险、下一步）；
  - 灵感转换：支持将原灵感自动归档或保留；
  - 可选联动：支持将提炼出的核心行动项同步推入 DSH Todo；
  - 广播 SSE `organize` 与 `change` 事件通知前端。
- [x] **阶段三验收**：向接口发送 organize 请求，在 DSH 对话中确认收到排队 prompt，AI 分析完毕后调用工具成功落盘。

---

### 阶段四（Phase 4）：独立置顶窗口“总结”按钮联动与 DSH 窗口 UI 注入

- [x] **任务 4.1**：置顶独立小窗口底栏“总结”按钮接入
  - 监听 `_summaryButton` 点击事件；
  - 收集当前未处理的灵感与焦点摘要，调用 `/omni-plan/integrations/organize`；
  - 成功后底栏弹出 Toast 提示：`已提交 DSH AI 总结，正在后台分析`。
- [x] **任务 4.2**：DSH 会话头部 Slot 交互注入（`lib/client.js`）
  - 注册 `conversation.session.header.utilities` 扩展插槽：
    - 渲染“→ DSH 任务”快捷按钮（直接绑定当前会话 `sessionId`）；
    - 渲染“AI 总结”操作按钮；
  - 可选在 `sidebar.panellist` 挂载应用图标，提供全局计划入口。
- [x] **任务 4.3**：全链路端到端验收与文档沉淀
  - 针对规范第 11 节与第 15.14 节测试用例进行覆盖验证；
  - 更新 `doc/agent/log.md`（记录各阶段编辑详情）；
  - 更新 `doc/agent/index.md` 与 `交接文档.md`。

---

## 五、立即开始执行：阶段一（Phase 1）行动清单

1. 在 `lib/dsh-todos.js` 中完整实现与 DSH 会话 Todo 协议交互的纯逻辑函数；
2. 在 `lib/host.js` 中声明依赖注入并挂载 `push`、`sessions`、`state` 路由；
3. 本地启动自测，确保接口就绪并能探测到活跃会话。
