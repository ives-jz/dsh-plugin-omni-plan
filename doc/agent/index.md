# dsh-plugin-omni-plan 项目架构索引

## 头部声明
- **项目名称**：dsh-plugin-omni-plan
- **主要开发语言**：JavaScript (Node.js ES Module, 无需打包工具) / C# (.NET Framework 4.x WPF, 原生置顶辅助宿主)
- **运行环境**：DSH (DeepSeek Harness, 基于 Cordis 架构与 Electron 44.x)、Windows 10/11
- **数据存储**：本地 JSON 状态持久化文件（位于 `~/.dsh/omni-plan/state.json`）

---

## 目录结构与各文件作用说明

### 根目录
- `package.json`：npm 插件元数据与入口声明，定义了 host 端入口（`./lib/host.js`）、client 端入口（`./lib/client.js`）、以及 DSH bundle 扩展注入项配置。
- `cordis.patch.yml`：Cordis 插件补丁配置文件，声明本插件在 DSH profiles 中的加载配置（数据路径、SSE 心跳频率、轮询时间等）。
- `icon.svg`：插件矢量图标，采用全新高端科技美学重绘（Squircle 钛金暗夜深邃渐变、连续圆角曲率矩形、同心星轨全景轨道 Omni Orbit、四角焦点交互锚点与核心四芒极简焦点星徽 Focus Sparkle），用于 DSH 侧边栏/插件管理与独立小窗口品牌标识。
- `README.md`：插件公开说明文档。
- `LICENSE`：开源协议（MIT）。

### `lib/` 核心逻辑目录
- `lib/host.js`：
  - DSH 后台服务（Host 端），作为 Cordis 服务插件运行。
  - 注册 4 个全局 plan 工具（`plan_get_overview`、`plan_upsert_context`、`plan_manage_task`、`plan_capture_idea`）。
  - 提供本地 REST API 路由与 SSE 实时广播服务（`/omni-plan/*`）。
  - 提供外部 MCP 协议支持（Streamable HTTP 与 legacy SSE）。
  - 内置 `NativeTopmostManager`，负责 Windows 环境下 C# 原生置顶独立窗口子进程的生命周期管理（启动、关闭、状态感知）。
- `lib/store.js`：
  - 数据持久化与并发管理引擎。
  - 维护 `state.json` 文件锁（`state.json.lock`）、临时文件原子写入、防止多进程并发丢写。
  - 包含状态变更事件通知（`change`）、任务提醒计算与脏数据自动备份。
- `lib/client.js`：
  - DSH 前端 UI 扩展（Client 端），纯原生 JavaScript + React（由宿主提供，无 JSX 编译负担）。
  - 监听 Host 端的 SSE 事件，同步状态。
  - 负责与 Host 端的 `/omni-plan/topmost` 交互，实现置顶与独立窗口的调起与联动。
  - 注入 DSH 窗口左上角全局导航入口（`OmniPlanHeaderButton`，位于 `conversation.header.leading`）：
    - 采用精炼二级菜单面板（“打开置顶窗口”、“整理 ▸”）与三级悬浮子面板（全部 / 焦点 / 任务 / 灵感）；
    - 采用实色不透明底色体系（浅色 `#ffffff`、深色 `#1c1c20`），彻底消除半透明透出底层聊天文字干扰，保证文字 100% 清晰遮挡可读，搭配高阶多层环境弥散投影与微描边；
    - 深色模式采用深邃曜石黑纯实色（`#1c1c20`）配合顶部微天际高光描边与 48px 层次大投影，与 DSH 暗色界面完美相融；
    - 浅色模式采用纯净白纯实色（`#ffffff`）与柔和弥散轻阴影，兼顾高对比度与高级温润质感；
    - 注入三级菜单 `::after` 防抖防闪退透明引流桥接层，配合 120ms 丝滑平滑浮现微动效。
- `lib/mcp-stdio.js`：
  - 独立运行的 MCP stdio 传输入口，供外部命令行或第三方客户端通过标准输入输出调用本插件。
- `lib/dsh-todos.js`：
  - DSH 会话任务注入与内容识别桥接模块，负责将 Omni Plan 条目按 `[OmniPlan] 标题 · 优先级 · ref=omni:task:<id>` 编码，与当前 Live Session 的 Todo 任务进行合并去重，并通过 DSH 原生 `todo_write` 工具执行整表安全注入；提供会话列表探测（`list_live_sessions`）与状态反查能力。
- `lib/dsh-organize.js`：
  - DSH 会话 AI 总结与灵感整理引擎，组装防注入安全短指令 Prompt（`<omni-plan-organize-request>`），通过 `agent.followup()` 实现当前会话 AI 的非阻塞任务排队；注入消息采用 `source.kind = 'omni-plan-organize'`，触发 DSH 聊天 UI 的折叠「请求」卡片（TurnTrigger）实现提示词静默化，正文默认收起；AI 分析完成后通过 `plan_apply_organization` 工具将结构化目的、前置条件、假设、风险与下一步行动回写 Omni Plan 及可选同步 DSH Todo。
- `lib/assets/icons/`：
  - 存放高品质 SVG 矢量图标资产文件（如 `dark.svg` 深色月亮图标、`light.svg` 浅色太阳图标、`close.svg` 关闭图标、`check-icon.svg` 勾选图标等），供插件界面及置顶独立窗口矢量几何解析使用。
- `lib/OmniPlanTopmost.cs`：
  - 原生置顶独立小窗口的 C# WPF 源码。
  - 采用 Windows 原生 `Topmost=true`、`WS_EX_TOOLWINDOW`，无任务栏图标、不占 Alt+Tab，专注桌面置顶。
  - 防触碰全屏 Aero Snap 拦截、无边框四边四角尺寸平滑拖拽缩放、全局启用 TextFormattingMode.Display 与 ClearType 高清文本渲染，文字边缘锐利平滑。
  - 三点更多操作菜单（`ContextMenu` 与 `MenuItem`）现代轻奢重构：彻底取缔 Windows 默认灰白底色与左侧大图标槽，提供 8px 圆角轻奢浮层、立体弥散软阴影、专属矢量 SVG 图标（编辑铅笔、复制、转为任务、删除垃圾桶）与删除危险操作柔和警示红高光反馈。
  - 纯粹高级黑白灰调色板体系，100% 全要素动态响应式刷新，彻底解决浅色模式下死黑与字迹看不清的问题。
  - 主题切换精简化与 SVG 图标化：彻底废除跟随系统（`ThemeMode.System`）与注册表监听，精简为纯粹的深色（Dark）与浅色（Light）二元切换；右上角原 96px 宽文本按钮重构为 28x26 图标按钮（`NewIconButton`），严格解析呈现用户放入的 `dark.svg` 与 `light.svg` 矢量图形；处于深色模式时显示太阳图标提示切换浅色，浅色模式时显示月亮图标提示切换深色；深浅切换按钮与关闭按钮全链路注入 `(0.6, 0.6)` 右下光学微调，彻底消除左上偏斜达成极致视觉居中；点击配合 280ms 物理级无位移静态快照淡出平滑变色，并持久化到本地 `~/.dsh/omni-plan/theme.txt`。
  - Header 拖拽体验与纯净度升级：彻底移除右侧横向占位的“已同步”文本与状态圆点控件（`statusChip`、`_statusDot`、`_statusText`），将窗口拖拽事件监听提升至整个 Header 容器（`header.Background = Brushes.Transparent`），并在鼠标按下时智能判断非可交互子控件即调用 `DragMove()`，彻底解决鼠标点在状态文字或空白处无法拖拽窗口的问题，全区域无死角丝滑拖动。
  - 底栏规范化版本控制与扩展操作区：底栏左侧展示规范的“0.0.1 β”版本徽章；底栏右侧提供“总结”与“导入”两个核心跨端人机协同按钮：
    - **“总结”按钮**（`CopySummaryPromptToClipboard`）：一键提取当前看板活跃焦点、全量待办任务（含P0~P7优先级与备注）与灵感条目，组装为高标准 AI 结构化总结与规划 Prompt，写入系统剪贴板，供用户粘贴到任意端 AI（网页版/客户端 DeepSeek、ChatGPT、Claude 等）；
    - **“导入”按钮**（`ImportFromClipboard`）：直接读取系统剪贴板，智能提取 ```omni-plan ``` 代码块或 Markdown 清单，解析识别焦点、任务与灵感，自动批量调用本地 API 写入 Omni Plan 数据库并实时刷新看板，底栏左侧配备柔和的绿色 Toast 动态反馈。
  - 全链路精简 P0 ~ P5 6级通用优先级体系（P0 紧急、P1 高、P2 较高、P3 普通、P4 较低、P5 低，向后兼容历史脏数据与导入数据）：
    - **智能自动排序**（`SortTasksAuto`）：优先保证未完成任务前置，并严格按 P0 ~ P5 紧急程度排序；相同等级时根据时间先后（创建时间戳升序，早创建的排前面）执行精细排列，已完成任务自动沉底；
    - **手动自定义排序**：任务标题右侧配备极简胶囊切换开关，开启后卡片支持 WPF 原生拖拽（Drag & Drop）自由调换位次，并提供微型箭头（↑/↓）一键微调；
  - 输入框光标（`CaretBrush`）高亮与主题动态同步：在 `CreateTextBoxStyle` 与实例初始化及主题换肤链路中，全面绑定 `CaretBrush = Brush(_palette.TextPrimary)`，彻底解决深色模式下光标为黑色导致看不清的严重视觉缺陷，在深色下为耀眼纯白，在浅色下为温润墨黑。
  - 模态弹窗温润进退微动效系统（AnimateShowOverlay / AnimateHideOverlay）：打开时面板以中心为原点平滑缩放浮升（Scale: 0.95->1.0, TranslateY: 8->0, 220ms CubicEase），退出时自然微缩沉降消隐（Scale: 1.0->0.95, TranslateY: 0->8, Opacity: 1.0->0, 180ms CubicEase），彻底告别瞬时抽离与生硬闪灭。
  - 焦点锚点三大字段完整编辑与清晰化说明（项目/标题、AI正在执行、你回来后的下一步），汉化英文标签并提供自适应多行输入卡槽，三大字段均支持 Ctrl+Enter 快速保存。
  - 顶部三大分段滑块（焦点 / 任务 / 灵感，各 2 汉字对称平衡）配备滑动胶囊指示器（Sliding Active Pill），在各 Tab 间平滑贴地滑行；面板切换具有空间方向感知（去除淡入淡出，100% 不透明纯物理横向滑入）；内容区 Section 标题统一为“灵感收纳柜”；冷启动通过动态静默初始化（animate=false）彻底消灭首帧重叠融合。
  - RenderTargetBitmap 内存静态快照实现真实 Vue 级 0.28s 全窗体主题平滑渐变，通过 `_windowContainer` 顶层同级覆盖（零边框偏移）、动态屏幕原生 DPI 匹配与固定按钮宽度，彻底根除切换时的轻微抖动缺陷；滚动容器开启逐像素硬件平滑滚动（CanContentScroll=false）并配备底部 24px 缓冲区，彻底消除长内容卡片底部操作按钮裁切问题。
  - 任务添加卡片集成主题自适应自定义下拉选择框（Dropdown）：彻底移除占用整行空间的铺排按钮，重构为仅占约 90px 宽度的紧凑胶囊触发器（展示优先级微徽标、中文级别如“P3 · 普通”及下三角标识），点击展开独立的悬浮 Popup 菜单浮层（包含 P0~P5 六级微圆角选项、hover 高亮与对勾勾选，点击外部空白自动收起），与右侧快捷提示和加号按钮形成从容自如的呼吸布局，全要素自适应动态换肤。
  - 最外层直角硬切阴影层彻底根除：精确定位并彻底移除了原 `_rootBorder` 上被 Windows 分层窗口矩形物理边界硬性截断的 `DropShadowEffect`，消除四个圆角外侧原本违和显露的灰色直角边框；全窗体纯粹依靠标准的 12px 圆角与 1.2px 细腻微高光描边（深色 `#383842` / 浅色 `#D1D5DB`）立体界定，边缘 100% 纯净通透融入桌面。
  - 灵感卡片文案规范与杂质清理：操作按钮由“转为待办”规范统一为“转为任务”，对应提示同步更新；彻底移除卡片底部原本因时间戳未格式化显示的长串数字 ID，视觉保持纯粹优雅。
  - 图标人眼视错觉光学居中精准校准与 DrawingGroup 矢量体系：在 24x24 绝对透明画板基底上锁定几何中心；`CreateSvgIcon` 默认采用左上微调（`offsetX = -0.6, offsetY = -0.6`），保持垂直居中的同时收拢水平左右位置达成绝对居中；焦点面板右上角的新建加号按钮尺寸统一升级为 28x28 并居中对齐，专属注入向左向下矫正（`offsetX = -0.8, offsetY = 0.0`），彻底消除原先严重向右上偏斜的错位感；Win32 原生防并发占用剪贴板注入支持；新增 `"inject"` 注入对话专属矢量图标。
  - 卡片“⋯”右键菜单“注入对话”直推能力：在焦点锚点、待办任务、灵感卡片的三点更多操作菜单中统一新增“注入对话”菜单项，鼠标悬停提供详细 Hover ToolTip 说明（明确告知将该项作为待办直接注入 DSH 会话，静默写入，不发送提示词），点击后直接异步调用 `/integrations/dsh-todos/push` 静默落盘到当前 Live Session。
  - 现代化独立全量整理与任务注入窗口（`OrganizeWindow`）：由底栏右侧“整理与注入”按钮呼起，尺寸 540x680，自适应深浅主题与高阶立体软阴影；包含三大核心功能区：
    - **待办任务整理区**：列出当前未完成任务与 P0~P5 紧急度胶囊，支持复选框勾选待注入项，并支持一键将任务“转为焦点”锚点；
    - **灵感闪念整理区**：列出未归档灵感，支持单个或全部一键“转为任务”，消费灵感并自动进入待注入队列；
    - **创立新任务区**：提供多行文本框与 P0~P5 优先级胶囊选择，支持一键创立新任务并勾选加入注入；
    - **底部操作栏**：实时统计勾选任务数量，点击“确认直接注入”通过 `todo_write` 工具静默写入 DSH 会话，全流程无任何提示词或聊天气泡。
- `lib/OmniPlanTopmost.exe`：
  - 由 `OmniPlanTopmost.cs` 通过 Windows 自带的 `csc.exe` 采用 `/codepage:65001 /utf8output` 编译生成的无依赖可执行文件。

### `locale/` 多语言国际化目录
- `locale/zh.json`：简体中文翻译字典。
- `locale/en.json`：英文翻译字典。

### `doc/` 文档目录
- `doc/agent/index.md`：本项目架构与文件索引说明（即本文档）。
- `doc/agent/log.md`：Agent 编辑与演化历史记录日志文件。
- `doc/agent/task-injection-plan.md`：Omni Plan 任务注入与总结功能实施计划书（分阶段跟踪看板）。

---

## 整体业务脉络与调用流

1. **状态流转核心**：
   `~/.dsh/omni-plan/state.json` 是全局唯一样本，受到 `lib/store.js` 的互斥锁保护。无论是 DSH 内部的会话、外部 MCP 工具，还是独立的 C# WPF 窗口，均通过 Host 提供的 REST 接口或 store 统一读写。

2. **独立置顶窗口工作流**：
   - Host 启动并提供 `/omni-plan` 接口。
   - 用户打开 DSH 时，插件静默自动启动 `OmniPlanTopmost.exe`，免去手动点击 📌 的繁琐流程。
   - 独立窗口通过本地 HTTP REST 接口轮询同步状态，提供毫秒级响应。
   - DSH 内部界面隐藏遮挡看板，让 DSH 聊天界面保持整洁。
