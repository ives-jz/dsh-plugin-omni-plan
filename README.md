# Omni Plan

> 给 DSH 用的全局置顶计划看板：**跨会话防失忆 · 灵感收件箱 · AI 整理 · 一键注入待办**。
> 当前版本：`0.0.1-beta`（公测版） · 仓库：<https://github.com/ives-jz/dsh-plugin-omni-plan>

同时开多个 DSH 窗口、多个 Agent 时，切回来最容易忘记「刚才做到哪、下一步该干嘛」。Omni Plan 把一份**所有会话共享的计划板**放到最上层，并让所有 DSH 会话、Claude、Cursor 等 MCP 客户端读写同一份本地数据。

---

## ✨ 特性

- **真·桌面置顶**：Windows 下启动独立 WPF 原生窗口（`WS_EX_TOPMOST`），可以盖住浏览器、IDE、全屏软件，不进任务栏、不进 Alt+Tab。
- **当前焦点锚点**：记录工作区、AI 状态、AI 正在做什么，以及最重要的「你回来后的下一步」——这就是防失忆的核心。
- **任务看板**：待办 / 进行中 / 阻塞 / 完成，P0–P7 优先级、备注、提醒、勾选完成、行内编辑。
- **灵感收件箱**：人类、DSH Agent、外部 MCP 都能随手追加；一键转成任务。
- **AI 整理**：让当前会话的 AI 直接读取看板、整理成结构化任务并写回；整理指令以折叠卡片注入，不刷屏聊天记录。
- **一键注入待办**：单条注入，或「整理 Omni Plan」窗口勾选批量注入当前会话 DSH Todo，按优先级排序。
- **跨轮保活**：注入的待办在任务完成前会跨轮次保持显示；你或 AI 完成它，它才消失。
- **实时同步**：SSE 推送 `snapshot` / `change` / `reminder` / `warning`，多个窗口、多个进程共享同一份状态。
- **MCP 三接入**：DSH 内置工具、MCP Streamable HTTP、独立 stdio Server。

---

## 🚀 快速开始

### 从插件市场安装（发布后）

```text
DSH 侧边栏 → 插件市场 → 搜索 Omni Plan → 安装
```

或：

```powershell
# 插件市场 / Web profile（市场收录命令）
dsh plugin --profile web add dsh-plugin-omni-plan

# 桌面版 profile（本机实际使用的 profile 名以你的环境为准）
dsh plugin --profile desktop add dsh-plugin-omni-plan
```

### 本地目录安装（开发 / 测试）

```powershell
dsh plugin --profile desktop add link:A:\AI\DSH\dsh-plugin-omni-plan
```

安装或更新后：

- 只改了 Client（`lib/client.js`）→ 刷新一次 DSH Web GUI 即可；
- 改了 Host（`lib/host.js` 等）或原生窗口（`lib/OmniPlanTopmost.exe`）→ **完全退出并重新启动 DSH**。

打开置顶窗口后，看板默认出现在屏幕右上角；窗口可拖拽、折叠、切主题。

---

## 🧭 界面速览

### 顶部「◈ Omni Plan」菜单

- **打开置顶窗口**：启动原生置顶看板；
- **整理 ▸ 全部 / 焦点 / 任务 / 灵感**：把对应范围交给当前会话 AI 整理，并在看板上写回。

### 底栏按钮

| 按钮 | 作用 |
|---|---|
| **整理 Omni Plan** | 打开整理窗口：勾选任务直接注入当前会话待办，也可把灵感转任务、新建任务后一起注入 |
| **AI总结** | 复制一段提示词。发给任意 AI，AI 会按指定格式回复；复制回来点「导入」即可解析成任务或灵感 |
| **导入** | 解析剪贴板里 AI 回复的代码块，批量生成任务 / 灵感 |

### 卡片「⋯」菜单

每条焦点 / 任务 / 灵感都有：**复制 · 编辑 · 删除 · 注入对话**。
「注入对话」只注入当前这一条，不会带上其他任务。

---

## 🔁 推荐工作流

```text
记录          →  整理            →  注入              →  完成
灵感/想法         AI 读看板并补全      写入当前会话待办       勾选完成 / AI 标记
进收件箱          成可执行任务         按优先级排序并保活      自动从待办移除
```

1. 有想法先丢进「灵感」——不打断当前 Agent；
2. 点「整理 Omni Plan」或顶部「整理」，让 AI 把它补全成任务；
3. 把要做的注入当前会话待办，AI 和你就有了同一份清单；
4. 做完勾掉，清单自动更新。

---

## 🧰 AI 工具

装好后，所有 DSH 会话自动获得 7 个工具：

| 工具 | 作用 |
|---|---|
| `plan_get_overview` | 读取完整看板：焦点、任务、收件箱、summary |
| `plan_upsert_context` | 新增 / 更新焦点锚点 |
| `plan_manage_task` | `add` / `update` / `complete` / `delete` 任务 |
| `plan_capture_idea` | 快速写入收件箱 |
| `plan_apply_organization` | 把 AI 整理结果写回看板 |
| `plan_push_to_dsh_todos` | 把看板任务注入当前会话待办（可按 `itemIds` 选择、按优先级排序） |
| `plan_get_dsh_todos` | 读取当前会话待办（新一轮重置后也能读回最近一次注入） |

在任意 DSH 会话里直接说：

```text
帮我整理 Omni Plan 里的所有内容
```

AI 会先 `plan_get_overview` 读看板，再 `plan_apply_organization` 写回；需要时自动同步到当前会话待办。

---

## 🔌 MCP 接入

### 方式 A：stdio（最稳，Claude Desktop / Cursor / 通用 MCP 客户端）

```powershell
node "<插件目录>\lib\mcp-stdio.js" --data-dir "%USERPROFILE%\.dsh\omni-plan"
```

配置示例（`claude_desktop_config.json` / `.cursor/mcp.json`）：

```json
{
  "mcpServers": {
    "omni-plan": {
      "command": "node",
      "args": [
        "<插件目录>\\lib\\mcp-stdio.js",
        "--data-dir",
        "C:\\Users\\<you>\\.dsh\\omni-plan"
      ]
    }
  }
}
```

### 方式 B：Streamable HTTP

DSH Web GUI 运行时：

```text
http://127.0.0.1:<DSH端口>/omni-plan/mcp
```

如 `cordis.patch.yml` 配了 `mcpToken`，请求需带 `Authorization: Bearer <token>`。

### 方式 C：旧版 HTTP + SSE

```text
GET  /omni-plan/mcp/sse
POST /omni-plan/mcp/messages?sessionId=<id>
```

---

## 🌐 Host HTTP API

```text
GET    /omni-plan/health
GET    /omni-plan/state
GET    /omni-plan/events                  # SSE

POST   /omni-plan/contexts
PATCH  /omni-plan/contexts/:id
DELETE /omni-plan/contexts/:id

POST   /omni-plan/tasks
PATCH  /omni-plan/tasks/:id
DELETE /omni-plan/tasks/:id
POST   /omni-plan/tasks/:id/complete

POST   /omni-plan/inbox
POST   /omni-plan/inbox/:id/promote
DELETE /omni-plan/inbox/:id

POST   /omni-plan/integrations/organize          # AI 整理
POST   /omni-plan/integrations/dsh-todos/push    # 注入会话待办

POST   /omni-plan/mcp                            # MCP Streamable HTTP
GET    /omni-plan/mcp/sse                        # MCP legacy SSE
POST   /omni-plan/mcp/messages                   # MCP legacy POST

GET    /omni-plan/topmost                        # 原生置顶窗口状态
POST   /omni-plan/topmost                        # 打开
POST   /omni-plan/topmost/close                  # 关闭
```

SSE 事件：`snapshot`（连接时全量）、`change`（增量 + revision）、`reminder`（到期提醒）、`warning`（存储告警）。

---

## 🔒 数据与隐私

- 数据只在本机：`~/.dsh/omni-plan/state.json`，不上传任何服务器；
- 写入使用 `state.json.lock` 排他锁 + 临时文件原子替换，损坏时自动备份重建；
- 插件包内**不包含**任何用户数据、测试任务或日志；
- MCP 默认只监听本机；需要时可用 `mcpToken` 加 Bearer 校验。

---

## ⚙️ 配置

`cordis.patch.yml`：

```yaml
- insert:
    - id: omni-plan
      name: dsh-plugin-omni-plan
      config:
        dataDir: ''            # 空 = ~/.dsh/omni-plan
        pollIntervalMs: 500
        sseHeartbeatMs: 15000
        reminderPollMs: 5000
        mcpHttp: true
        # mcpToken: 'optional-shared-secret'
        # trustedHosts: 'localhost:13304,127.0.0.1:13304'
```

| 字段 | 默认 | 说明 |
|---|---|---|
| `dataDir` | `''` | 数据目录，空字符串用默认路径 |
| `pollIntervalMs` | `500` | `fs.watch` 失败时的轮询兜底 |
| `sseHeartbeatMs` | `15000` | SSE 心跳间隔 |
| `reminderPollMs` | `5000` | 提醒扫描间隔 |
| `mcpHttp` | `true` | 是否暴露 HTTP/SSE MCP |
| `mcpToken` | 空 | 可选 Bearer token |
| `trustedHosts` | 空 | 额外信任的 Host authority |

---

## 🖥️ 原生置顶说明

Windows 下，插件启动独立 WPF 进程 `OmniPlanTopmost.exe`：

- `Topmost=true` + `WS_EX_TOOLWINDOW`：覆盖其他窗口、不进任务栏、不进 Alt+Tab；
- 三页切换：焦点 / 任务 / 灵感；每条内容独立「注入对话 / 复制 / 编辑 / 删除」；
- 与 DSH 完全解耦，数据通过本机 REST + 轮询读写同一份 `state.json`；
- 启动失败会写 `~/.dsh/omni-plan/topmost.log`。

非 Windows 或原生启动不可用时，回退到 Document Picture-in-Picture / popup。

---

## 🛠️ 开发

```powershell
# 语法检查
node --check lib\host.js
node --check lib\client.js
node --check lib\store.js
node --check lib\mcp-stdio.js

# 重新编译原生窗口（Windows）
$ref = 'C:\Program Files (x86)\Reference Assemblies\Microsoft\Framework\.NETFramework\v4.7.2'
& 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe' /nologo /target:winexe `
  /out:'lib\OmniPlanTopmost.exe' `
  "/r:$ref\PresentationFramework.dll" "/r:$ref\PresentationCore.dll" `
  "/r:$ref\WindowsBase.dll" "/r:$ref\System.Xaml.dll" `
  'lib\OmniPlanTopmost.cs'

# 本地安装
dsh plugin --profile desktop add link:<插件目录>
```

---

## 📦 发布

```powershell
npm pack --dry-run     # 确认只打包 lib/、locale/、icon.svg、cordis.patch.yml、README.md、LICENSE
npm publish --access public --tag latest
```

发布后把 GitHub 仓库提交到 DSH Plugin Hub 收录入口（仓库需公开并添加 `dsh-plugin` topic）。

---

## 📄 License

MIT
