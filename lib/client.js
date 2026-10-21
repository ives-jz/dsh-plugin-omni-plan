/**
 * Client half of dsh-plugin-omni-plan.
 *
 * Plain-JavaScript dynamic Client bundle: no JSX build step, React comes from
 * the browser module table.  The board is a `shell.overlay` occupant; entries
 * in that layer are click-through, so the panel opts back into pointer events.
 *
 * Desktop always-on-top uses Document Picture-in-Picture when Chromium exposes
 * it.  The PiP document receives the host theme styles plus this plugin's CSS,
 * then a second React root (or a dependency-free DOM fallback) mirrors the
 * same live state and calls the same REST actions.
 */

window.__ModuleLoader__.load({
  id: 'dsh-plugin-omni-plan',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'omni-plan'
    const API = '/omni-plan'
    const UI_KEY = 'dsh.omni-plan.ui.v1'
    const PIP_NAME = 'dsh-omni-plan-pip'

    /* ------------------------------------------------------------------ *
     * Locale dictionaries
     * ------------------------------------------------------------------ */

    const DICT_ZH = {
      title: 'OMNI PLAN',
      tagline: '全局计划 · 防失忆锚点',
      statusConnected: '实时同步',
      statusConnecting: '连接中',
      statusOffline: '断线 · 轮询中',
      focus: '当前焦点',
      focusHint: '切回来先看这里',
      focusEmpty: '还没有焦点锚点。AI 或你都可以创建一条。',
      focusAdd: '+ 新锚点',
      focusAddTitle: '新建焦点锚点',
      workspace: '项目 / 窗口',
      workspacePlaceholder: '例如：DSH · Omni Plan',
      agentStatus: 'AI 状态',
      statusRunning: '执行中',
      statusWaiting: '等你接手',
      statusIdle: '空闲',
      currentDoing: 'AI 正在做什么',
      nextAction: '你回来后的下一步',
      nextActionPlaceholder: '写具体动作，例如：打开 host.js 检查 SSE 路由',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      editNext: '改下一步',
      confirmDeleteFocus: '删除这个焦点锚点？',
      focusSaved: '焦点锚点已保存',
      tasks: '计划 / 待办',
      tasksHint: '完成、编辑、设置提醒',
      taskPlaceholder: '添加任务，回车保存…',
      add: '添加',
      filterOpen: '未完成',
      filterAll: '全部',
      filterTodo: '待办',
      filterInProgress: '进行中',
      filterBlocked: '阻塞',
      filterDone: '完成',
      tasksEmpty: '这个筛选下没有任务。',
      priorityHigh: '高',
      priorityMedium: '中',
      priorityLow: '低',
      notes: '备注',
      remindAt: '提醒时间',
      noReminder: '不提醒',
      clearReminder: '清除提醒',
      overdue: '已逾期',
      due: '提醒',
      completed: '已完成',
      taskEdit: '编辑任务',
      titleLabel: '标题',
      statusLabel: '状态',
      priorityLabel: '优先级',
      taskSaved: '任务已更新',
      taskAdded: '任务已添加',
      taskCompleted: '任务已完成',
      taskDeleted: '任务已删除',
      confirmDeleteTask: '删除这个任务？',
      inbox: '闪念收件箱',
      inboxHint: '任何窗口的 AI 都能往这里丢想法',
      inboxPlaceholder: '记一条闪念，回车保存…',
      capture: '记下',
      inboxEmpty: '收件箱是空的。',
      promote: '转任务',
      ideaFromHuman: '人类',
      ideaFromDsh: 'DSH Agent',
      ideaFromMcp: '外部 MCP',
      ideaCaptured: '闪念已记录',
      ideaPromoted: '已转为任务',
      ideaDeleted: '闪念已删除',
      confirmDeleteIdea: '删除这条闪念？',
      pin: '弹出桌面置顶',
      pinShort: '置顶',
      pinHint: 'Document Picture-in-Picture · 系统级最前端',
      pinUnsupported: '当前环境不支持 Document PiP，将打开独立悬浮窗（可能无法系统置顶）',
      pinFallbackTitle: '已打开独立悬浮窗',
      pinFallbackBody: '当前环境不支持 Document PiP，无法保证系统级置顶。',
      pinFailed: '无法打开置顶窗口',
      pipTopmost: '桌面置顶',
      pipNative: '系统级置顶',
      pipPopup: '独立窗口',
      pipClose: '关闭置顶窗口',
      opacity: '透明度',
      notifications: '通知',
      notificationsOn: '系统通知已开启',
      notificationsBlocked: '系统通知被浏览器拦截，仍会有声音和面板闪烁',
      notificationsUnsupported: '当前环境不支持系统通知',
      enableNotifications: '开启系统通知',
      refresh: '刷新',
      resetPosition: '重置位置',
      collapse: '收起',
      expand: '展开',
      errorTitle: '操作失败',
      warningTitle: 'Omni Plan 提醒',
      aiWaitingTitle: 'AI 正在等你',
      aiCompletedTitle: 'AI 已完成任务',
      aiBlockedTitle: 'AI 遇到阻塞',
      reminderTitle: '计划提醒',
      aiWaitingBody: '{workspace}：{next}',
      aiCompletedBody: '{title}',
      aiBlockedBody: '{title}',
      reminderBody: '{title}',
      justNow: '刚刚',
      minutesAgo: '{n} 分钟前',
      hoursAgo: '{n} 小时前',
      daysAgo: '{n} 天前',
      close: '关闭',
      aiNow: 'AI NOW',
      nextForYou: 'NEXT FOR YOU',
      countTasks: '{n} 项',
      countIdeas: '{n} 条',
      pinBadge: '置顶',
    }

    const DICT_EN = {
      title: 'OMNI PLAN',
      tagline: 'Global plan · context anchor',
      statusConnected: 'Live',
      statusConnecting: 'Connecting',
      statusOffline: 'Offline · polling',
      focus: 'Active focus',
      focusHint: 'Read this first when you return',
      focusEmpty: 'No focus anchor yet. You or any AI can create one.',
      focusAdd: '+ New anchor',
      focusAddTitle: 'New focus anchor',
      workspace: 'Project / window',
      workspacePlaceholder: 'e.g. DSH · Omni Plan',
      agentStatus: 'AI status',
      statusRunning: 'Running',
      statusWaiting: 'Waiting for you',
      statusIdle: 'Idle',
      currentDoing: 'What the AI is doing',
      nextAction: 'Your next action',
      nextActionPlaceholder: 'Be concrete, e.g. open host.js and check the SSE route',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      editNext: 'Edit next step',
      confirmDeleteFocus: 'Delete this focus anchor?',
      focusSaved: 'Focus anchor saved',
      tasks: 'Plan / tasks',
      tasksHint: 'Complete, edit, set reminders',
      taskPlaceholder: 'Add a task, press Enter…',
      add: 'Add',
      filterOpen: 'Open',
      filterAll: 'All',
      filterTodo: 'To do',
      filterInProgress: 'Doing',
      filterBlocked: 'Blocked',
      filterDone: 'Done',
      tasksEmpty: 'No tasks in this filter.',
      priorityHigh: 'High',
      priorityMedium: 'Medium',
      priorityLow: 'Low',
      notes: 'Notes',
      remindAt: 'Remind at',
      noReminder: 'No reminder',
      clearReminder: 'Clear reminder',
      overdue: 'Overdue',
      due: 'Due',
      completed: 'Completed',
      taskEdit: 'Edit task',
      titleLabel: 'Title',
      statusLabel: 'Status',
      priorityLabel: 'Priority',
      taskSaved: 'Task updated',
      taskAdded: 'Task added',
      taskCompleted: 'Task completed',
      taskDeleted: 'Task deleted',
      confirmDeleteTask: 'Delete this task?',
      inbox: 'Quick inbox',
      inboxHint: 'Any AI in any window can drop an idea here',
      inboxPlaceholder: 'Capture a thought, press Enter…',
      capture: 'Capture',
      inboxEmpty: 'The inbox is empty.',
      promote: 'To task',
      ideaFromHuman: 'Human',
      ideaFromDsh: 'DSH Agent',
      ideaFromMcp: 'External MCP',
      ideaCaptured: 'Idea captured',
      ideaPromoted: 'Promoted to task',
      ideaDeleted: 'Idea deleted',
      confirmDeleteIdea: 'Delete this idea?',
      pin: 'Pop out always-on-top',
      pinShort: 'PIN',
      pinHint: 'Document Picture-in-Picture · OS topmost',
      pinUnsupported: 'Document PiP is unavailable; a standalone popup will open instead (topmost is not guaranteed).',
      pinFallbackTitle: 'Standalone window opened',
      pinFallbackBody: 'Document PiP is unavailable, so OS-level topmost cannot be guaranteed.',
      pinFailed: 'Could not open the pinned window',
      pipTopmost: 'Desktop topmost',
      pipNative: 'OS topmost',
      pipPopup: 'Standalone window',
      pipClose: 'Close pinned window',
      opacity: 'Opacity',
      notifications: 'Notifications',
      notificationsOn: 'System notifications are enabled',
      notificationsBlocked: 'System notifications are blocked; sound and the flashing panel still work',
      notificationsUnsupported: 'System notifications are unavailable in this environment',
      enableNotifications: 'Enable notifications',
      refresh: 'Refresh',
      resetPosition: 'Reset position',
      collapse: 'Collapse',
      expand: 'Expand',
      errorTitle: 'Action failed',
      warningTitle: 'Omni Plan warning',
      aiWaitingTitle: 'AI is waiting for you',
      aiCompletedTitle: 'AI completed a task',
      aiBlockedTitle: 'AI is blocked',
      reminderTitle: 'Plan reminder',
      aiWaitingBody: '{workspace}: {next}',
      aiCompletedBody: '{title}',
      aiBlockedBody: '{title}',
      reminderBody: '{title}',
      justNow: 'just now',
      minutesAgo: '{n}m ago',
      hoursAgo: '{n}h ago',
      daysAgo: '{n}d ago',
      close: 'Close',
      aiNow: 'AI NOW',
      nextForYou: 'NEXT FOR YOU',
      countTasks: '{n} tasks',
      countIdeas: '{n} ideas',
      pinBadge: 'PINNED',
    }

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */

    const CSS = `
.op-panel, .op-pip-shell {
  --op-accent: var(--dsw-alias-brand-primary, #22d3ee);
  --op-accent-soft: color-mix(in srgb, var(--op-accent) 18%, transparent);
  --op-accent-line: color-mix(in srgb, var(--op-accent) 46%, transparent);
  --op-bg: color-mix(in srgb, var(--dsw-alias-bg-overlay, #0b1220) 88%, transparent);
  --op-bg-strong: color-mix(in srgb, var(--dsw-alias-bg-layer-1, #111827) 94%, transparent);
  --op-bg-soft: color-mix(in srgb, var(--dsw-alias-bg-layer-2, #1e293b) 68%, transparent);
  --op-text: var(--dsw-alias-label-primary, #e6edf7);
  --op-muted: var(--dsw-alias-label-secondary, #93a4bd);
  --op-border: color-mix(in srgb, var(--dsw-alias-border-l2, #64748b) 62%, transparent);
  --op-border-soft: color-mix(in srgb, var(--dsw-alias-border-l1, #475569) 44%, transparent);
  --op-success: var(--dsw-alias-state-success-primary, #34d399);
  --op-warn: var(--dsw-alias-state-warn-primary, #fbbf24);
  --op-danger: var(--dsw-alias-state-error-primary, #fb7185);
  --op-idle: var(--dsw-alias-state-idle-primary, #94a3b8);
  --op-mono: ui-monospace, SFMono-Regular, "Cascadia Mono", Consolas, "Liberation Mono", monospace;
  color-scheme: inherit;
}
body[data-ds-dark-theme] .op-panel, body[data-ds-dark-theme] .op-pip-shell {
  --op-bg: color-mix(in srgb, #050b18 78%, var(--dsw-alias-bg-overlay, #0b1220));
  --op-bg-strong: color-mix(in srgb, #081120 82%, var(--dsw-alias-bg-layer-1, #111827));
  --op-text: #e6edf7;
  --op-muted: #93a4bd;
  --op-border: rgba(94, 234, 212, .22);
  --op-border-soft: rgba(148, 163, 184, .16);
}
.op-panel {
  position: fixed;
  z-index: 2147483000;
  width: 372px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  color: var(--op-text);
  background:
    radial-gradient(120% 90% at 0% 0%, var(--op-accent-soft), transparent 52%),
    linear-gradient(150deg, color-mix(in srgb, var(--op-bg-strong) 92%, transparent), var(--op-bg));
  border: 1px solid var(--op-border);
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, .42), inset 0 1px 0 rgba(255, 255, 255, .06);
  backdrop-filter: blur(22px) saturate(145%);
  -webkit-backdrop-filter: blur(22px) saturate(145%);
  overflow: hidden;
  font-family: inherit;
  transition: opacity .16s ease, box-shadow .2s ease;
}
.op-panel.op-collapsed { width: 248px; }
.op-panel.op-pulse { animation: op-pulse 1.15s ease-in-out 2; }
.op-panel * { box-sizing: border-box; }
.op-pip-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 0% 0%, var(--op-accent-soft), transparent 55%),
    linear-gradient(150deg, var(--op-bg-strong), var(--op-bg));
  color: var(--op-text);
}
.op-pip-shell.op-pulse { animation: op-pip-pulse 1.15s ease-in-out 2; }
.op-pip-root { height: 100%; }
.op-pip-body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  overflow: hidden !important;
  background: var(--op-bg-strong, #081120) !important;
  color: var(--op-text, #e6edf7) !important;
}
.op-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px 9px 12px;
  border-bottom: 1px solid var(--op-border-soft);
  background: linear-gradient(120deg, var(--op-accent-soft), transparent 55%);
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.op-header:active { cursor: grabbing; }
.op-pip-header { cursor: default; flex: 0 0 auto; }
.op-brand { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.op-brand-mark {
  width: 22px; height: 22px; border-radius: 7px; position: relative; flex: 0 0 auto;
  background: conic-gradient(from 210deg, var(--op-accent), #818cf8, var(--op-accent));
  box-shadow: 0 0 18px var(--op-accent-soft);
}
.op-brand-mark::after {
  content: ""; position: absolute; inset: 4px; border-radius: 5px; background: var(--op-bg-strong);
}
.op-brand-mark::before {
  content: ""; position: absolute; inset: 8px; border-radius: 50%; background: var(--op-accent);
  box-shadow: 0 0 9px var(--op-accent);
}
.op-brand-copy { min-width: 0; }
.op-title {
  font-family: var(--op-mono); font-size: 11px; font-weight: 750;
  letter-spacing: .16em; line-height: 1.1; white-space: nowrap;
}
.op-tagline {
  margin-top: 2px; color: var(--op-muted); font-size: 9.5px; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.op-status {
  display: inline-flex; align-items: center; gap: 5px; color: var(--op-muted);
  font-family: var(--op-mono); font-size: 9px; white-space: nowrap;
}
.op-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--op-idle); flex: 0 0 auto;
}
.op-dot.is-online { background: var(--op-success); box-shadow: 0 0 8px var(--op-success); }
.op-dot.is-connecting { background: var(--op-warn); box-shadow: 0 0 8px var(--op-warn); }
.op-dot.is-offline { background: var(--op-danger); box-shadow: 0 0 8px var(--op-danger); }
.op-header-actions { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }
.op-icon-btn {
  width: 26px; height: 26px; padding: 0; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--op-border-soft); border-radius: 7px; background: var(--op-bg-soft);
  color: var(--op-muted); font-family: var(--op-mono); font-size: 13px; line-height: 1; cursor: pointer;
  transition: color .15s ease, border-color .15s ease, background .15s ease;
}
.op-icon-btn:hover { color: var(--op-text); border-color: var(--op-accent-line); background: var(--op-accent-soft); }
.op-icon-btn.is-accent { color: var(--op-accent); }
.op-icon-btn:disabled { opacity: .5; cursor: wait; }
.op-scroll {
  overflow-y: auto; overflow-x: hidden; padding: 10px 10px 4px;
  max-height: calc(100vh - 160px); flex: 1 1 auto; overscroll-behavior: contain;
}
.op-pip-shell .op-scroll { max-height: none; min-height: 0; }
.op-scroll::-webkit-scrollbar { width: 7px; }
.op-scroll::-webkit-scrollbar-thumb { background: var(--op-border); border-radius: 8px; }
.op-scroll::-webkit-scrollbar-track { background: transparent; }
.op-section { margin: 0 0 12px; }
.op-section:last-child { margin-bottom: 4px; }
.op-section-head { display: flex; align-items: baseline; gap: 7px; margin: 0 2px 7px; }
.op-section-title {
  font-family: var(--op-mono); font-size: 10px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: var(--op-text);
}
.op-section-count { font-family: var(--op-mono); font-size: 9px; color: var(--op-muted); }
.op-section-hint {
  margin-left: auto; color: var(--op-muted); font-size: 9.5px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.op-btn {
  border: 1px solid var(--op-border); border-radius: 7px; background: var(--op-bg-soft);
  color: var(--op-text); font-size: 11px; line-height: 1.2; padding: 5px 9px; cursor: pointer;
  transition: border-color .15s ease, background .15s ease, color .15s ease;
}
.op-btn:hover { border-color: var(--op-accent-line); background: var(--op-accent-soft); }
.op-btn.op-btn-primary {
  background: color-mix(in srgb, var(--op-accent) 20%, var(--op-bg-soft));
  border-color: var(--op-accent-line); color: var(--op-text);
}
.op-btn.op-btn-danger { color: var(--op-danger); border-color: color-mix(in srgb, var(--op-danger) 35%, transparent); }
.op-btn.op-btn-ghost { border-color: transparent; background: transparent; color: var(--op-muted); padding: 3px 6px; }
.op-btn.op-btn-ghost:hover { color: var(--op-text); background: var(--op-bg-soft); }
.op-btn:disabled { opacity: .5; cursor: wait; }
.op-link-btn {
  border: 0; background: transparent; color: var(--op-muted); cursor: pointer; padding: 2px 4px;
  font-family: var(--op-mono); font-size: 10px;
}
.op-link-btn:hover { color: var(--op-accent); }
.op-focus-card {
  position: relative; margin-bottom: 7px; padding: 9px 10px 9px 12px; border-radius: 10px;
  background: linear-gradient(135deg, var(--op-bg-soft), color-mix(in srgb, var(--op-bg-strong) 78%, transparent));
  border: 1px solid var(--op-border-soft); border-left: 2px solid var(--op-accent);
}
.op-focus-card.is-flash { animation: op-flash 1.5s ease-in-out 2; }
.op-focus-top { display: flex; align-items: center; gap: 6px; }
.op-workspace { font-size: 11.5px; font-weight: 650; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.op-status-pill {
  display: inline-flex; align-items: center; gap: 4px; border-radius: 999px; padding: 2px 6px;
  font-family: var(--op-mono); font-size: 8.5px; letter-spacing: .04em; white-space: nowrap;
  border: 1px solid currentColor;
}
.op-status-pill.is-running { color: var(--op-success); background: color-mix(in srgb, var(--op-success) 11%, transparent); }
.op-status-pill.is-waiting_user { color: var(--op-warn); background: color-mix(in srgb, var(--op-warn) 11%, transparent); }
.op-status-pill.is-idle { color: var(--op-idle); background: color-mix(in srgb, var(--op-idle) 10%, transparent); }
.op-focus-time { margin-left: auto; color: var(--op-muted); font-family: var(--op-mono); font-size: 8.5px; white-space: nowrap; }
.op-focus-current {
  margin-top: 7px; color: var(--op-muted); font-size: 10.5px; line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.op-focus-current b, .op-kicker {
  font-family: var(--op-mono); color: var(--op-accent); font-size: 8.5px; letter-spacing: .1em;
  margin-right: 5px; font-weight: 650;
}
.op-next {
  margin-top: 7px; padding: 7px 8px; border-radius: 7px;
  border: 1px dashed color-mix(in srgb, var(--op-accent) 34%, transparent);
  background: color-mix(in srgb, var(--op-accent) 7%, transparent);
  color: var(--op-text); font-size: 11px; line-height: 1.45; white-space: pre-wrap; word-break: break-word;
}
.op-focus-actions { display: flex; justify-content: flex-end; gap: 4px; margin-top: 5px; }
.op-empty {
  padding: 10px 9px; border: 1px dashed var(--op-border); border-radius: 9px;
  color: var(--op-muted); font-size: 10.5px; line-height: 1.5; text-align: center;
  background: color-mix(in srgb, var(--op-bg-soft) 42%, transparent);
}
.op-form { display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 9px; background: var(--op-bg-soft); border: 1px solid var(--op-border-soft); margin-bottom: 7px; }
.op-form-row { display: flex; gap: 6px; }
.op-form-row > .op-input, .op-form-row > .op-select { flex: 1; min-width: 0; }
.op-input, .op-select, .op-textarea {
  width: 100%; border: 1px solid var(--op-border); border-radius: 6px;
  background: color-mix(in srgb, var(--op-bg-strong) 82%, transparent);
  color: var(--op-text); font-family: inherit; font-size: 11px; line-height: 1.35; padding: 6px 7px;
  outline: none; transition: border-color .15s ease, box-shadow .15s ease;
}
.op-input::placeholder, .op-textarea::placeholder { color: var(--op-muted); opacity: .8; }
.op-input:focus, .op-select:focus, .op-textarea:focus {
  border-color: var(--op-accent-line); box-shadow: 0 0 0 2px var(--op-accent-soft);
}
.op-textarea { min-height: 54px; resize: vertical; }
.op-form-label { display: flex; flex-direction: column; gap: 3px; color: var(--op-muted); font-family: var(--op-mono); font-size: 8.5px; letter-spacing: .05em; }
.op-form-actions { display: flex; justify-content: flex-end; gap: 5px; margin-top: 1px; }
.op-inline-edit { margin-top: 6px; display: flex; flex-direction: column; gap: 5px; }
.op-task-add { display: flex; gap: 5px; align-items: center; margin-bottom: 7px; }
.op-task-add .op-input { flex: 1; }
.op-task-tools { display: flex; gap: 4px; align-items: center; }
.op-filter-row { display: flex; flex-wrap: wrap; gap: 3px; margin: 0 0 7px; }
.op-filter {
  border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--op-muted);
  font-family: var(--op-mono); font-size: 8.5px; letter-spacing: .04em; padding: 3px 7px; cursor: pointer;
}
.op-filter.is-active { color: var(--op-accent); border-color: var(--op-accent-line); background: var(--op-accent-soft); }
.op-task {
  display: flex; align-items: flex-start; gap: 7px; padding: 7px 7px 7px 8px; border-radius: 8px;
  border: 1px solid transparent; transition: background .15s ease, border-color .15s ease;
}
.op-task:hover { background: var(--op-bg-soft); border-color: var(--op-border-soft); }
.op-task.is-flash { animation: op-flash 1.5s ease-in-out 2; }
.op-check {
  width: 14px; height: 14px; margin: 2px 0 0; accent-color: var(--op-accent); cursor: pointer; flex: 0 0 auto;
}
.op-task-main { flex: 1; min-width: 0; }
.op-task-title {
  font-size: 11.5px; line-height: 1.35; color: var(--op-text); word-break: break-word;
}
.op-task.is-done .op-task-title { color: var(--op-muted); text-decoration: line-through; }
.op-task-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 3px; color: var(--op-muted); font-family: var(--op-mono); font-size: 8.5px; }
.op-priority { border: 1px solid currentColor; border-radius: 999px; padding: 1px 6px; font-size: 8px; font-weight: 600; letter-spacing: .02em; transition: all .12s ease; }
.op-priority.is-high, .op-priority.is-p0 { color: #dc2626; border-color: rgba(220, 38, 38, 0.45); background: rgba(220, 38, 38, 0.12); }
.op-priority.is-p1 { color: #ea580c; border-color: rgba(234, 88, 12, 0.4); background: rgba(234, 88, 12, 0.1); }
.op-priority.is-p2 { color: var(--op-text); border-color: rgba(140, 140, 150, 0.45); background: rgba(140, 140, 150, 0.14); }
.op-priority.is-medium, .op-priority.is-p3 { color: var(--op-muted); border-color: var(--op-border); background: transparent; }
.op-priority.is-p4 { color: var(--op-muted); border-color: var(--op-border-soft); background: transparent; opacity: 0.85; }
.op-priority.is-low, .op-priority.is-p5 { color: var(--op-muted); border-color: transparent; background: transparent; opacity: 0.65; }

/* 深色模式下的微调保证清晰锐利 */
body[data-ds-dark-theme] .op-priority.is-p0,
html[data-theme='dark'] .op-priority.is-p0,
html.dark .op-priority.is-p0 {
  color: #ef4444; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.2);
}
body[data-ds-dark-theme] .op-priority.is-p1,
html[data-theme='dark'] .op-priority.is-p1,
html.dark .op-priority.is-p1 {
  color: #f97316; border-color: rgba(249, 115, 22, 0.45); background: rgba(249, 115, 22, 0.16);
}
body[data-ds-dark-theme] .op-priority.is-p2,
html[data-theme='dark'] .op-priority.is-p2,
html.dark .op-priority.is-p2 {
  color: #f4f4f5; border-color: rgba(255, 255, 255, 0.25); background: rgba(255, 255, 255, 0.14);
}
.op-remind.is-overdue { color: var(--op-danger); }
.op-task-notes {
  margin-top: 5px; color: var(--op-muted); font-size: 10px; line-height: 1.45; white-space: pre-wrap;
  word-break: break-word; border-left: 1px solid var(--op-border); padding-left: 6px;
}
.op-task-actions { display: flex; gap: 1px; flex: 0 0 auto; opacity: .65; }
.op-task:hover .op-task-actions { opacity: 1; }
.op-task-edit { margin: 3px 0 6px; }
.op-inbox-add { display: flex; gap: 5px; align-items: center; }
.op-inbox-add .op-input { flex: 1; }
.op-idea {
  display: flex; align-items: flex-start; gap: 6px; padding: 6px 7px; border-radius: 7px;
  border: 1px solid transparent;
}
.op-idea:hover { background: var(--op-bg-soft); border-color: var(--op-border-soft); }
.op-idea.is-flash { animation: op-flash 1.5s ease-in-out 2; }
.op-idea-content { flex: 1; min-width: 0; font-size: 10.5px; line-height: 1.45; word-break: break-word; white-space: pre-wrap; }
.op-idea-meta { display: flex; gap: 5px; margin-top: 3px; color: var(--op-muted); font-family: var(--op-mono); font-size: 8px; }
.op-source-badge { border: 1px solid var(--op-border); border-radius: 999px; padding: 1px 4px; }
.op-idea-actions { display: flex; gap: 2px; flex: 0 0 auto; opacity: .7; }
.op-idea:hover .op-idea-actions { opacity: 1; }
.op-footer {
  display: flex; align-items: center; gap: 7px; padding: 7px 9px;
  border-top: 1px solid var(--op-border-soft); background: color-mix(in srgb, var(--op-bg-strong) 58%, transparent);
  font-family: var(--op-mono); font-size: 8.5px; color: var(--op-muted); flex: 0 0 auto;
}
.op-opacity { display: flex; align-items: center; gap: 5px; flex: 1; min-width: 0; }
.op-opacity input { width: 62px; accent-color: var(--op-accent); }
.op-footer-btn {
  border: 0; background: transparent; color: var(--op-muted); font-family: var(--op-mono);
  font-size: 9px; cursor: pointer; padding: 2px 3px; white-space: nowrap;
}
.op-footer-btn:hover { color: var(--op-text); }
.op-footer-spacer { flex: 1; }
.op-toast {
  position: absolute; left: 9px; right: 9px; bottom: 44px; z-index: 5;
  border-radius: 9px; padding: 8px 9px; display: flex; gap: 7px; align-items: flex-start;
  background: color-mix(in srgb, var(--op-bg-strong) 96%, transparent);
  border: 1px solid var(--op-border); box-shadow: 0 14px 38px rgba(0, 0, 0, .35);
  animation: op-toast-in .2s ease-out;
}
.op-toast.is-error { border-color: color-mix(in srgb, var(--op-danger) 55%, transparent); }
.op-toast.is-warn { border-color: color-mix(in srgb, var(--op-warn) 55%, transparent); }
.op-toast.is-success { border-color: color-mix(in srgb, var(--op-success) 55%, transparent); }
.op-toast-icon { color: var(--op-accent); font-family: var(--op-mono); font-size: 13px; line-height: 1.2; }
.op-toast.is-error .op-toast-icon { color: var(--op-danger); }
.op-toast.is-warn .op-toast-icon { color: var(--op-warn); }
.op-toast.is-success .op-toast-icon { color: var(--op-success); }
.op-toast-body { min-width: 0; flex: 1; }
.op-toast-title { font-size: 10.5px; font-weight: 650; line-height: 1.3; }
.op-toast-text { margin-top: 2px; color: var(--op-muted); font-size: 9.5px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
.op-toast-close { border: 0; background: transparent; color: var(--op-muted); cursor: pointer; font-size: 13px; line-height: 1; padding: 0 2px; }
.op-pip-shell .op-toast { position: fixed; bottom: 10px; }
.op-pip-foot { padding: 5px 9px; border-top: 1px solid var(--op-border-soft); color: var(--op-muted); font-family: var(--op-mono); font-size: 8px; display: flex; justify-content: space-between; gap: 8px; }
.op-pip-mode { color: var(--op-accent); }
.op-count { font-family: var(--op-mono); font-size: 9px; color: var(--op-muted); white-space: nowrap; }
@keyframes op-flash {
  0%, 100% { border-color: var(--op-border-soft); box-shadow: none; }
  35% { border-color: var(--op-accent-line); box-shadow: 0 0 0 1px var(--op-accent-line), 0 0 20px var(--op-accent-soft); background-color: var(--op-accent-soft); }
}
@keyframes op-pulse {
  0%, 100% { box-shadow: 0 24px 70px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06); }
  50% { box-shadow: 0 0 0 1px var(--op-accent-line), 0 0 42px var(--op-accent-soft), 0 24px 70px rgba(0,0,0,.42); }
}
@keyframes op-pip-pulse {
  0%, 100% { box-shadow: inset 0 0 0 0 transparent; }
  50% { box-shadow: inset 0 0 0 2px var(--op-accent-line), inset 0 0 42px var(--op-accent-soft); }
}
@keyframes op-toast-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 520px) {
  .op-panel { left: 12px !important; top: 12px !important; width: calc(100vw - 24px); max-height: calc(100vh - 24px); }
}
`

    /* ------------------------------------------------------------------ *
     * Tiny utilities
     * ------------------------------------------------------------------ */

    function cx(...parts) {
      return parts.filter(Boolean).join(' ')
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function pad2(value) {
      return String(value).padStart(2, '0')
    }

    function toLocalInput(timestamp) {
      if (!Number.isFinite(timestamp) || timestamp <= 0) return ''
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
    }

    function fromLocalInput(value) {
      if (typeof value !== 'string' || value.trim() === '') return null
      const timestamp = new Date(value).getTime()
      return Number.isFinite(timestamp) ? timestamp : null
    }

    function formatDateTime(timestamp, localeId) {
      if (!Number.isFinite(timestamp) || timestamp <= 0) return ''
      try {
        return new Date(timestamp).toLocaleString(localeId || undefined, {
          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        })
      } catch {
        return new Date(timestamp).toLocaleString()
      }
    }

    function interpolate(text, params) {
      return String(text).replace(/\{(\w+)\}/g, (_match, key) => (
        params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`
      ))
    }

    function readUiState() {
      const fallback = {
        x: typeof window === 'undefined' ? 12 : Math.max(12, window.innerWidth - 392),
        y: 72,
        opacity: 0.96,
        collapsed: false,
      }
      try {
        const parsed = JSON.parse(window.localStorage.getItem(UI_KEY) || 'null')
        if (!parsed || typeof parsed !== 'object') return fallback
        return {
          x: Number.isFinite(parsed.x) ? parsed.x : fallback.x,
          y: Number.isFinite(parsed.y) ? parsed.y : fallback.y,
          opacity: Number.isFinite(parsed.opacity) ? clamp(parsed.opacity, 0.35, 1) : fallback.opacity,
          collapsed: parsed.collapsed === true,
        }
      } catch {
        return fallback
      }
    }

    function writeUiState(ui) {
      try {
        window.localStorage.setItem(UI_KEY, JSON.stringify(ui))
      } catch {
        // private mode / disabled storage: the board still works for this page
      }
    }

    function makeTranslator(bindTranslate) {
      return function translate(key, params) {
        let text
        try {
          text = bindTranslate(key, params)
        } catch {
          text = key
        }
        if (typeof text !== 'string' || text === key) {
          const fallback = DICT_ZH[key] ?? DICT_EN[key] ?? key
          return interpolate(fallback, params)
        }
        return text
      }
    }

    function useLocaleSignal(locale) {
      const [, setRevision] = React.useState(0)
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined
        return locale.subscribe(() => setRevision((value) => value + 1))
      }, [locale])
      return locale && typeof locale.getLocale === 'function'
        ? locale.getLocale().revision
        : 0
    }

    function useNowTick() {
      const [tick, setTick] = React.useState(0)
      React.useEffect(() => {
        const timer = window.setInterval(() => setTick((value) => value + 1), 30000)
        return () => window.clearInterval(timer)
      }, [])
      return tick
    }

    function relativeTime(timestamp, t, now = Date.now()) {
      if (!Number.isFinite(timestamp) || timestamp <= 0) return ''
      const delta = Math.max(0, now - timestamp)
      const seconds = Math.floor(delta / 1000)
      if (seconds < 60) return t('justNow')
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return t('minutesAgo', { n: minutes })
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return t('hoursAgo', { n: hours })
      return t('daysAgo', { n: Math.floor(hours / 24) })
    }

    function statusLabel(status, t) {
      if (status === 'running') return t('statusRunning')
      if (status === 'waiting_user') return t('statusWaiting')
      return t('statusIdle')
    }

    function priorityLabel(priority, t) {
      if (priority === 'p0') return 'P0 紧急'
      if (priority === 'p1') return 'P1 高'
      if (priority === 'p2') return 'P2 较高'
      if (priority === 'p3') return 'P3 普通'
      if (priority === 'p4') return 'P4 较低'
      if (priority === 'p5') return 'P5 低'
      if (priority === 'high') return t('priorityHigh')
      if (priority === 'low') return t('priorityLow')
      return t('priorityMedium')
    }

    function sourceLabel(source, t) {
      if (source === 'dsh-agent') return t('ideaFromDsh')
      if (source === 'external-mcp') return t('ideaFromMcp')
      return t('ideaFromHuman')
    }

    function computeSummary(state) {
      const summary = { running: 0, waitingUser: 0, idle: 0, openTasks: 0, doneTasks: 0, inbox: 0 }
      for (const context of state.activeContexts) {
        if (context.agentStatus === 'running') summary.running += 1
        else if (context.agentStatus === 'waiting_user') summary.waitingUser += 1
        else summary.idle += 1
      }
      for (const task of state.tasks) {
        if (task.status === 'done') summary.doneTasks += 1
        else summary.openTasks += 1
      }
      summary.inbox = state.inbox.length
      return summary
    }

    function sortContexts(contexts) {
      const order = { waiting_user: 0, running: 1, idle: 2 }
      return [...contexts].sort((left, right) => (
        (order[left.agentStatus] ?? 9) - (order[right.agentStatus] ?? 9)
        || right.updatedAt - left.updatedAt
      ))
    }

    function sortTasks(tasks) {
      const order = { in_progress: 0, blocked: 1, todo: 2, done: 3 }
      const priority_weight_map = {
        p0: 0, p1: 1, p2: 2, p3: 3, p4: 4, p5: 5, p6: 5, p7: 5,
        high: 1, medium: 3, low: 5,
      }
      return [...tasks].sort((left, right) => (
        (order[left.status] ?? 9) - (order[right.status] ?? 9)
        || (priority_weight_map[left.priority] ?? 9) - (priority_weight_map[right.priority] ?? 9)
        || right.updatedAt - left.updatedAt
      ))
    }

    function resolveReactDom(requireModule) {
      const attempts = ['react-dom/client', 'react-dom']
      for (const request of attempts) {
        try {
          const moduleValue = requireModule(request)
          if (moduleValue && typeof moduleValue.createRoot === 'function') {
            return { kind: 'createRoot', module: moduleValue }
          }
          if (moduleValue && typeof moduleValue.render === 'function') {
            return { kind: 'legacy', module: moduleValue }
          }
        } catch {
          // The module table intentionally allows packages to omit React DOM.
        }
      }
      return null
    }

    function copyThemeToWindow(win) {
      const sourceRoot = document.documentElement
      const targetRoot = win.document.documentElement
      for (const attribute of Array.from(sourceRoot.attributes)) {
        try {
          targetRoot.setAttribute(attribute.name, attribute.value)
        } catch {
          // Ignore invalid attributes from the host page.
        }
      }
      for (const attribute of Array.from(document.body.attributes)) {
        try {
          win.document.body.setAttribute(attribute.name, attribute.value)
        } catch {
          // Ignore invalid attributes from the host page.
        }
      }
      try {
        const base = win.document.createElement('base')
        base.href = document.baseURI
        win.document.head.prepend(base)
      } catch {
        // A base element only improves asset resolution; it is not required.
      }
      for (const node of Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))) {
        try {
          const clone = node.cloneNode(true)
          if (clone.tagName === 'LINK') clone.href = node.href
          win.document.head.appendChild(clone)
        } catch {
          // A cross-origin stylesheet clone can fail; our own CSS still applies.
        }
      }
      const style = win.document.createElement('style')
      style.dataset.omniPlan = 'pip'
      style.textContent = CSS
      win.document.head.appendChild(style)
      win.document.title = 'Omni Plan'
      const hostBodyClass = document.body.className.trim()
      win.document.body.className = hostBodyClass === '' ? 'op-pip-body' : `${hostBodyClass} op-pip-body`
      win.document.body.style.margin = '0'
      win.document.body.style.overflow = 'hidden'
    }

    function appendText(parent, className, text) {
      const node = parent.ownerDocument.createElement('div')
      node.className = className
      node.textContent = text
      parent.appendChild(node)
      return node
    }

    function makeButton(doc, className, text, onClick, title) {
      const button = doc.createElement('button')
      button.type = 'button'
      button.className = className
      button.textContent = text
      if (title) button.title = title
      button.addEventListener('click', onClick)
      return button
    }

    /* ------------------------------------------------------------------ *
     * React sections
     * ------------------------------------------------------------------ */

    function FocusSection({ contexts, t, flash, actions, now }) {
      const [adding, setAdding] = React.useState(false)
      const [form, setForm] = React.useState({
        workspace: '',
        agentStatus: 'running',
        currentDoing: '',
        nextActionForHuman: '',
      })
      const [editingId, setEditingId] = React.useState(null)
      const [editNext, setEditNext] = React.useState('')

      const sorted = sortContexts(contexts)

      function startEdit(context) {
        setEditingId(context.id)
        setEditNext(context.nextActionForHuman)
      }

      async function saveNext(context) {
        try {
          await actions.saveFocus({
            workspace: context.workspace,
            agentStatus: context.agentStatus,
            currentDoing: context.currentDoing,
            nextActionForHuman: editNext,
          })
          setEditingId(null)
        } catch {
          // The toast is owned by the action wrapper.
        }
      }

      async function submitNew(event) {
        event.preventDefault()
        if (form.workspace.trim() === '') return
        try {
          await actions.saveFocus(form)
          setForm({ workspace: '', agentStatus: 'running', currentDoing: '', nextActionForHuman: '' })
          setAdding(false)
        } catch {
          // Keep the form so the user can correct it.
        }
      }

      return h('section', { className: 'op-section' },
        h('div', { className: 'op-section-head' },
          h('span', { className: 'op-section-title' }, t('focus')),
          h('span', { className: 'op-section-count' }, `${sorted.length}`),
          h('span', { className: 'op-section-hint' }, t('focusHint')),
          h('button', {
            type: 'button',
            className: 'op-link-btn',
            onClick: () => setAdding((value) => !value),
          }, adding ? t('cancel') : t('focusAdd')),
        ),
        adding && h('form', { className: 'op-form', onSubmit: submitNew },
          h('label', { className: 'op-form-label' }, t('workspace'),
            h('input', {
              className: 'op-input',
              value: form.workspace,
              autoFocus: true,
              placeholder: t('workspacePlaceholder'),
              onChange: (event) => setForm({ ...form, workspace: event.target.value }),
            }),
          ),
          h('div', { className: 'op-form-row' },
            h('label', { className: 'op-form-label' }, t('agentStatus'),
              h('select', {
                className: 'op-select',
                value: form.agentStatus,
                onChange: (event) => setForm({ ...form, agentStatus: event.target.value }),
              },
                h('option', { value: 'running' }, t('statusRunning')),
                h('option', { value: 'waiting_user' }, t('statusWaiting')),
                h('option', { value: 'idle' }, t('statusIdle')),
              ),
            ),
          ),
          h('label', { className: 'op-form-label' }, t('currentDoing'),
            h('input', {
              className: 'op-input',
              value: form.currentDoing,
              onChange: (event) => setForm({ ...form, currentDoing: event.target.value }),
            }),
          ),
          h('label', { className: 'op-form-label' }, t('nextAction'),
            h('textarea', {
              className: 'op-textarea',
              value: form.nextActionForHuman,
              placeholder: t('nextActionPlaceholder'),
              onChange: (event) => setForm({ ...form, nextActionForHuman: event.target.value }),
            }),
          ),
          h('div', { className: 'op-form-actions' },
            h('button', { type: 'button', className: 'op-btn op-btn-ghost', onClick: () => setAdding(false) }, t('cancel')),
            h('button', { type: 'submit', className: 'op-btn op-btn-primary' }, t('save')),
          ),
        ),
        sorted.length === 0 && !adding
          ? h('div', { className: 'op-empty' }, t('focusEmpty'))
          : null,
        sorted.map((context) => h('article', {
          key: context.id,
          className: cx('op-focus-card', flash.has(`context:${context.id}`) && 'is-flash'),
        },
          h('div', { className: 'op-focus-top' },
            h('span', { className: 'op-workspace', title: context.workspace }, context.workspace),
            h('span', { className: `op-status-pill is-${context.agentStatus}` }, statusLabel(context.agentStatus, t)),
            h('span', { className: 'op-focus-time' }, relativeTime(context.updatedAt, t, now)),
          ),
          context.currentDoing
            ? h('div', { className: 'op-focus-current' },
                h('span', { className: 'op-kicker' }, t('aiNow')),
                context.currentDoing,
              )
            : null,
          editingId === context.id
            ? h('div', { className: 'op-inline-edit' },
                h('textarea', {
                  className: 'op-textarea',
                  value: editNext,
                  autoFocus: true,
                  placeholder: t('nextActionPlaceholder'),
                  onChange: (event) => setEditNext(event.target.value),
                }),
                h('div', { className: 'op-form-actions' },
                  h('button', { type: 'button', className: 'op-btn op-btn-ghost', onClick: () => setEditingId(null) }, t('cancel')),
                  h('button', { type: 'button', className: 'op-btn op-btn-primary', onClick: () => { void saveNext(context) } }, t('save')),
                ),
              )
            : h('div', { className: 'op-next' },
                h('span', { className: 'op-kicker' }, t('nextForYou')),
                context.nextActionForHuman || '—',
              ),
          h('div', { className: 'op-focus-actions' },
            editingId === context.id ? null : h('button', {
              type: 'button', className: 'op-btn op-btn-ghost', onClick: () => startEdit(context),
            }, t('editNext')),
            h('button', {
              type: 'button',
              className: 'op-btn op-btn-ghost op-btn-danger',
              onClick: () => {
                if (window.confirm(t('confirmDeleteFocus'))) void actions.deleteFocus(context.id).catch(() => {})
              },
            }, t('delete')),
          ),
        )),
      )
    }

    function TaskSection({ tasks, t, flash, actions, now }) {
      const [filter, setFilter] = React.useState('open')
      const [title, setTitle] = React.useState('')
      const [priority, setPriority] = React.useState('p3')
      const [showRemind, setShowRemind] = React.useState(false)
      const [remind, setRemind] = React.useState('')
      const [editingId, setEditingId] = React.useState(null)
      const [edit, setEdit] = React.useState(null)
      const [expanded, setExpanded] = React.useState(new Set())

      const filtered = sortTasks(tasks.filter((task) => {
        if (filter === 'all') return true
        if (filter === 'open') return task.status !== 'done'
        return task.status === filter
      }))

      async function submitNew(event) {
        event.preventDefault()
        const value = title.trim()
        if (value === '') return
        try {
          await actions.addTask({
            title: value,
            priority,
            ...(showRemind && remind !== '' ? { remindAt: fromLocalInput(remind) } : {}),
          })
          setTitle('')
          setRemind('')
          setShowRemind(false)
        } catch {
          // Keep the draft so the user can retry.
        }
      }

      function startEdit(task) {
        setEditingId(task.id)
        setEdit({
          title: task.title,
          status: task.status,
          priority: task.priority,
          notes: task.notes || '',
          remind: toLocalInput(task.remindAt),
        })
      }

      async function saveEdit(taskId) {
        if (!edit) return
        try {
          await actions.updateTask(taskId, {
            title: edit.title,
            status: edit.status,
            priority: edit.priority,
            notes: edit.notes,
            remindAt: fromLocalInput(edit.remind),
          })
          setEditingId(null)
          setEdit(null)
        } catch {
          // Keep the editor open for correction.
        }
      }

      function toggleExpanded(taskId) {
        setExpanded((current) => {
          const next = new Set(current)
          if (next.has(taskId)) next.delete(taskId)
          else next.add(taskId)
          return next
        })
      }

      const filters = [
        ['open', t('filterOpen')],
        ['all', t('filterAll')],
        ['todo', t('filterTodo')],
        ['in_progress', t('filterInProgress')],
        ['blocked', t('filterBlocked')],
        ['done', t('filterDone')],
      ]

      return h('section', { className: 'op-section' },
        h('div', { className: 'op-section-head' },
          h('span', { className: 'op-section-title' }, t('tasks')),
          h('span', { className: 'op-section-count' }, t('countTasks', { n: tasks.filter((task) => task.status !== 'done').length })),
          h('span', { className: 'op-section-hint' }, t('tasksHint')),
        ),
        h('form', { className: 'op-task-add', onSubmit: submitNew },
          h('input', {
            className: 'op-input',
            value: title,
            placeholder: t('taskPlaceholder'),
            onChange: (event) => setTitle(event.target.value),
          }),
          h('select', {
            className: 'op-select',
            style: { width: '80px', flex: '0 0 80px' },
            value: priority,
            title: t('priorityLabel'),
            onChange: (event) => setPriority(event.target.value),
          },
            h('option', { value: 'p0' }, 'P0 紧急'),
            h('option', { value: 'p1' }, 'P1 高'),
            h('option', { value: 'p2' }, 'P2 较高'),
            h('option', { value: 'p3' }, 'P3 普通'),
            h('option', { value: 'p4' }, 'P4 较低'),
            h('option', { value: 'p5' }, 'P5 低'),
            h('option', { value: 'high' }, t('priorityHigh')),
            h('option', { value: 'medium' }, t('priorityMedium')),
            h('option', { value: 'low' }, t('priorityLow')),
          ),
          h('button', {
            type: 'button',
            className: 'op-icon-btn',
            title: t('remindAt'),
            onClick: () => setShowRemind((value) => !value),
          }, showRemind ? '◷' : '⏱'),
          h('button', { type: 'submit', className: 'op-btn op-btn-primary' }, t('add')),
        ),
        showRemind && h('div', { className: 'op-form-row', style: { marginBottom: '7px' } },
          h('label', { className: 'op-form-label', style: { flex: 1 } }, t('remindAt'),
            h('input', {
              type: 'datetime-local',
              className: 'op-input',
              value: remind,
              onChange: (event) => setRemind(event.target.value),
            }),
          ),
        ),
        h('div', { className: 'op-filter-row' },
          filters.map(([value, label]) => h('button', {
            key: value,
            type: 'button',
            className: cx('op-filter', filter === value && 'is-active'),
            onClick: () => setFilter(value),
          }, label)),
        ),
        filtered.length === 0 ? h('div', { className: 'op-empty' }, t('tasksEmpty')) : null,
        filtered.map((task) => h('div', { key: task.id },
          h('div', { className: cx('op-task', task.status === 'done' && 'is-done', flash.has(`task:${task.id}`) && 'is-flash') },
            h('input', {
              type: 'checkbox',
              className: 'op-check',
              checked: task.status === 'done',
              onChange: () => {
                if (task.status === 'done') void actions.updateTask(task.id, { status: 'todo' }).catch(() => {})
                else void actions.completeTask(task.id).catch(() => {})
              },
              'aria-label': task.status === 'done' ? t('completed') : t('filterDone'),
            }),
            h('div', { className: 'op-task-main' },
              h('div', {
                className: 'op-task-title',
                onClick: () => toggleExpanded(task.id),
                style: { cursor: 'pointer' },
              }, task.title),
              h('div', { className: 'op-task-meta' },
                h('span', { className: `op-priority is-${task.priority}` }, priorityLabel(task.priority, t)),
                task.remindAt
                  ? h('span', {
                      className: cx('op-remind', task.status !== 'done' && task.remindAt <= now && 'is-overdue'),
                    }, `${task.remindAt <= now && task.status !== 'done' ? t('overdue') : t('due')} ${formatDateTime(task.remindAt)}`)
                  : null,
                task.status === 'in_progress' ? h('span', null, t('filterInProgress')) : null,
                task.status === 'blocked' ? h('span', { style: { color: 'var(--op-warn)' } }, t('filterBlocked')) : null,
              ),
              expanded.has(task.id) && task.notes
                ? h('div', { className: 'op-task-notes' }, task.notes)
                : null,
            ),
            h('div', { className: 'op-task-actions' },
              h('button', {
                type: 'button', className: 'op-icon-btn', title: t('edit'),
                onClick: () => startEdit(task),
              }, '✎'),
              h('button', {
                type: 'button', className: 'op-icon-btn', title: t('delete'),
                onClick: () => {
                  if (window.confirm(t('confirmDeleteTask'))) void actions.deleteTask(task.id).catch(() => {})
                },
              }, '×'),
            ),
          ),
          editingId === task.id && edit
            ? h('div', { className: 'op-form op-task-edit' },
                h('label', { className: 'op-form-label' }, t('titleLabel'),
                  h('input', {
                    className: 'op-input',
                    value: edit.title,
                    onChange: (event) => setEdit({ ...edit, title: event.target.value }),
                  }),
                ),
                h('div', { className: 'op-form-row' },
                  h('label', { className: 'op-form-label', style: { flex: 1 } }, t('statusLabel'),
                    h('select', {
                      className: 'op-select',
                      value: edit.status,
                      onChange: (event) => setEdit({ ...edit, status: event.target.value }),
                    },
                      h('option', { value: 'todo' }, t('filterTodo')),
                      h('option', { value: 'in_progress' }, t('filterInProgress')),
                      h('option', { value: 'blocked' }, t('filterBlocked')),
                      h('option', { value: 'done' }, t('filterDone')),
                    ),
                  ),
                  h('label', { className: 'op-form-label', style: { flex: 1 } }, t('priorityLabel'),
                    h('select', {
                      className: 'op-select',
                      value: edit.priority,
                      onChange: (event) => setEdit({ ...edit, priority: event.target.value }),
                    },
                      h('option', { value: 'p0' }, 'P0 紧急'),
                      h('option', { value: 'p1' }, 'P1 高'),
                      h('option', { value: 'p2' }, 'P2 较高'),
                      h('option', { value: 'p3' }, 'P3 普通'),
                      h('option', { value: 'p4' }, 'P4 较低'),
                      h('option', { value: 'p5' }, 'P5 低'),
                      h('option', { value: 'high' }, t('priorityHigh')),
                      h('option', { value: 'medium' }, t('priorityMedium')),
                      h('option', { value: 'low' }, t('priorityLow')),
                    ),
                  ),
                ),
                h('label', { className: 'op-form-label' }, t('remindAt'),
                  h('input', {
                    type: 'datetime-local',
                    className: 'op-input',
                    value: edit.remind,
                    onChange: (event) => setEdit({ ...edit, remind: event.target.value }),
                  }),
                ),
                h('label', { className: 'op-form-label' }, t('notes'),
                  h('textarea', {
                    className: 'op-textarea',
                    value: edit.notes,
                    onChange: (event) => setEdit({ ...edit, notes: event.target.value }),
                  }),
                ),
                h('div', { className: 'op-form-actions' },
                  h('button', { type: 'button', className: 'op-btn op-btn-ghost', onClick: () => { setEditingId(null); setEdit(null) } }, t('cancel')),
                  h('button', { type: 'button', className: 'op-btn op-btn-primary', onClick: () => { void saveEdit(task.id) } }, t('save')),
                ),
              )
            : null,
        )),
      )
    }

    function InboxSection({ ideas, t, flash, actions, now }) {
      const [draft, setDraft] = React.useState('')

      async function submit(event) {
        event.preventDefault()
        const value = draft.trim()
        if (value === '') return
        try {
          await actions.addIdea(value)
          setDraft('')
        } catch {
          // Keep the draft for retry.
        }
      }

      return h('section', { className: 'op-section' },
        h('div', { className: 'op-section-head' },
          h('span', { className: 'op-section-title' }, t('inbox')),
          h('span', { className: 'op-section-count' }, t('countIdeas', { n: ideas.length })),
          h('span', { className: 'op-section-hint' }, t('inboxHint')),
        ),
        h('form', { className: 'op-inbox-add', onSubmit: submit },
          h('input', {
            className: 'op-input',
            value: draft,
            placeholder: t('inboxPlaceholder'),
            onChange: (event) => setDraft(event.target.value),
          }),
          h('button', { type: 'submit', className: 'op-btn op-btn-primary' }, t('capture')),
        ),
        ideas.length === 0 ? h('div', { className: 'op-empty', style: { marginTop: '7px' } }, t('inboxEmpty')) : null,
        ideas.map((idea) => h('div', {
          key: idea.id,
          className: cx('op-idea', flash.has(`idea:${idea.id}`) && 'is-flash'),
        },
          h('div', { className: 'op-idea-content' },
            idea.content,
            h('div', { className: 'op-idea-meta' },
              h('span', { className: 'op-source-badge' }, sourceLabel(idea.source, t)),
              h('span', null, relativeTime(idea.createdAt, t, now)),
            ),
          ),
          h('div', { className: 'op-idea-actions' },
            h('button', {
              type: 'button', className: 'op-link-btn', title: t('promote'),
              onClick: () => { void actions.promoteIdea(idea.id).catch(() => {}) },
            }, '↗'),
            h('button', {
              type: 'button', className: 'op-link-btn', title: t('delete'),
              onClick: () => {
                if (window.confirm(t('confirmDeleteIdea'))) void actions.deleteIdea(idea.id).catch(() => {})
              },
            }, '×'),
          ),
        )),
      )
    }

    function PanelBody({ data, t, flash, actions, now }) {
      return h('div', { className: 'op-body' },
        h(FocusSection, { contexts: data.activeContexts, t, flash, actions, now }),
        h(TaskSection, { tasks: data.tasks, t, flash, actions, now }),
        h(InboxSection, { ideas: data.inbox, t, flash, actions, now }),
      )
    }

    function Toast({ notice, onClose, t }) {
      if (!notice) return null
      const icon = notice.kind === 'error' ? '!' : notice.kind === 'warn' ? '▲' : notice.kind === 'success' ? '✓' : '◈'
      return h('div', { className: `op-toast is-${notice.kind || 'info'}` },
        h('span', { className: 'op-toast-icon' }, icon),
        h('div', { className: 'op-toast-body' },
          h('div', { className: 'op-toast-title' }, notice.title),
          notice.body ? h('div', { className: 'op-toast-text' }, notice.body) : null,
        ),
        h('button', { type: 'button', className: 'op-toast-close', onClick: onClose, 'aria-label': t('close') }, '×'),
      )
    }

    function PipRoot({ data, t, flash, actions, now, connected, notice, close, mode, pulse, onCloseNotice }) {
      return h('div', { className: cx('op-pip-shell', pulse && 'op-pulse') },
        h('header', { className: 'op-header op-pip-header' },
          h('div', { className: 'op-brand' },
            h('span', { className: 'op-brand-mark', 'aria-hidden': true }),
            h('div', { className: 'op-brand-copy' },
              h('div', { className: 'op-title' }, t('title')),
              h('div', { className: 'op-tagline' }, t('tagline')),
            ),
          ),
          h('span', { className: 'op-status' },
            h('span', { className: `op-dot ${connected ? 'is-online' : 'is-offline'}` }),
            connected ? t('statusConnected') : t('statusOffline'),
          ),
          h('div', { className: 'op-header-actions' },
            h('button', {
              type: 'button', className: 'op-icon-btn is-accent', title: t('pipClose'),
              onClick: close,
            }, '×'),
          ),
        ),
        h('div', { className: 'op-scroll' }, h(PanelBody, { data, t, flash, actions, now })),
        h(Toast, { notice, onClose: onCloseNotice, t }),
        h('footer', { className: 'op-pip-foot' },
          h('span', { className: 'op-pip-mode' }, mode === 'native' ? t('pipNative') : mode === 'pip' ? t('pipTopmost') : t('pipPopup')),
          h('span', null, t('pinBadge')),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Dependency-free PiP fallback renderer
     * ------------------------------------------------------------------ */

    function renderPipDom(container, props) {
      const { data, t, flash, actions, now, connected, notice, close, mode, pulse } = props
      const doc = container.ownerDocument
      const win = doc.defaultView
      const previousDraft = container.querySelector('#op-pip-idea-input')?.value || ''
      const focused = doc.activeElement?.id === 'op-pip-idea-input'
      container.textContent = ''

      const shell = doc.createElement('div')
      shell.className = `op-pip-shell${pulse ? ' op-pulse' : ''}`
      container.appendChild(shell)

      const header = doc.createElement('header')
      header.className = 'op-header op-pip-header'
      const brand = doc.createElement('div')
      brand.className = 'op-brand'
      const mark = doc.createElement('span')
      mark.className = 'op-brand-mark'
      brand.appendChild(mark)
      const copy = doc.createElement('div')
      copy.className = 'op-brand-copy'
      const title = doc.createElement('div')
      title.className = 'op-title'
      title.textContent = t('title')
      const tagline = doc.createElement('div')
      tagline.className = 'op-tagline'
      tagline.textContent = t('tagline')
      copy.appendChild(title)
      copy.appendChild(tagline)
      brand.appendChild(copy)
      header.appendChild(brand)
      const status = doc.createElement('span')
      status.className = 'op-status'
      const dot = doc.createElement('span')
      dot.className = `op-dot ${connected ? 'is-online' : 'is-offline'}`
      status.appendChild(dot)
      status.appendChild(doc.createTextNode(connected ? t('statusConnected') : t('statusOffline')))
      header.appendChild(status)
      const actionsBar = doc.createElement('div')
      actionsBar.className = 'op-header-actions'
      actionsBar.appendChild(makeButton(doc, 'op-icon-btn is-accent', '×', close, t('pipClose')))
      header.appendChild(actionsBar)
      shell.appendChild(header)

      const scroll = doc.createElement('div')
      scroll.className = 'op-scroll'
      shell.appendChild(scroll)

      const focus = doc.createElement('section')
      focus.className = 'op-section'
      const focusHead = doc.createElement('div')
      focusHead.className = 'op-section-head'
      const focusTitle = doc.createElement('span')
      focusTitle.className = 'op-section-title'
      focusTitle.textContent = t('focus')
      focusHead.appendChild(focusTitle)
      focus.appendChild(focusHead)
      if (data.activeContexts.length === 0) {
        const empty = doc.createElement('div')
        empty.className = 'op-empty'
        empty.textContent = t('focusEmpty')
        focus.appendChild(empty)
      }
      for (const context of sortContexts(data.activeContexts)) {
        const card = doc.createElement('article')
        card.className = `op-focus-card${flash.has(`context:${context.id}`) ? ' is-flash' : ''}`
        const top = doc.createElement('div')
        top.className = 'op-focus-top'
        const workspace = doc.createElement('span')
        workspace.className = 'op-workspace'
        workspace.textContent = context.workspace
        top.appendChild(workspace)
        const pill = doc.createElement('span')
        pill.className = `op-status-pill is-${context.agentStatus}`
        pill.textContent = statusLabel(context.agentStatus, t)
        top.appendChild(pill)
        const time = doc.createElement('span')
        time.className = 'op-focus-time'
        time.textContent = relativeTime(context.updatedAt, t, now)
        top.appendChild(time)
        card.appendChild(top)
        if (context.currentDoing) {
          const doing = doc.createElement('div')
          doing.className = 'op-focus-current'
          const kicker = doc.createElement('span')
          kicker.className = 'op-kicker'
          kicker.textContent = t('aiNow')
          doing.appendChild(kicker)
          doing.appendChild(doc.createTextNode(context.currentDoing))
          card.appendChild(doing)
        }
        const next = doc.createElement('div')
        next.className = 'op-next'
        const nextKicker = doc.createElement('span')
        nextKicker.className = 'op-kicker'
        nextKicker.textContent = t('nextForYou')
        next.appendChild(nextKicker)
        next.appendChild(doc.createTextNode(context.nextActionForHuman || '—'))
        card.appendChild(next)
        const cardActions = doc.createElement('div')
        cardActions.className = 'op-focus-actions'
        cardActions.appendChild(makeButton(doc, 'op-btn op-btn-ghost', t('editNext'), async () => {
          const value = win.prompt(t('editNext'), context.nextActionForHuman || '')
          if (value === null) return
          try {
            await actions.saveFocus({
              workspace: context.workspace,
              agentStatus: context.agentStatus,
              currentDoing: context.currentDoing,
              nextActionForHuman: value,
            })
          } catch {
            // The main panel shows the error toast.
          }
        }, t('editNext')))
        card.appendChild(cardActions)
        focus.appendChild(card)
      }
      scroll.appendChild(focus)

      const tasks = doc.createElement('section')
      tasks.className = 'op-section'
      const tasksHead = doc.createElement('div')
      tasksHead.className = 'op-section-head'
      const tasksTitle = doc.createElement('span')
      tasksTitle.className = 'op-section-title'
      tasksTitle.textContent = t('tasks')
      tasksHead.appendChild(tasksTitle)
      tasks.appendChild(tasksHead)
      const openTasks = sortTasks(data.tasks.filter((task) => task.status !== 'done'))
      if (openTasks.length === 0) {
        const empty = doc.createElement('div')
        empty.className = 'op-empty'
        empty.textContent = t('tasksEmpty')
        tasks.appendChild(empty)
      }
      for (const task of openTasks) {
        const row = doc.createElement('div')
        row.className = `op-task${flash.has(`task:${task.id}`) ? ' is-flash' : ''}`
        const checkbox = doc.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'op-check'
        checkbox.checked = false
        checkbox.addEventListener('change', () => {
          checkbox.disabled = true
          void actions.completeTask(task.id).catch(() => { checkbox.disabled = false })
        })
        row.appendChild(checkbox)
        const main = doc.createElement('div')
        main.className = 'op-task-main'
        const taskTitle = doc.createElement('div')
        taskTitle.className = 'op-task-title'
        taskTitle.textContent = task.title
        main.appendChild(taskTitle)
        const meta = doc.createElement('div')
        meta.className = 'op-task-meta'
        meta.textContent = `${priorityLabel(task.priority, t)}${task.remindAt ? ` · ${formatDateTime(task.remindAt)}` : ''}`
        main.appendChild(meta)
        row.appendChild(main)
        tasks.appendChild(row)
      }
      scroll.appendChild(tasks)

      const inbox = doc.createElement('section')
      inbox.className = 'op-section'
      const inboxHead = doc.createElement('div')
      inboxHead.className = 'op-section-head'
      const inboxTitle = doc.createElement('span')
      inboxTitle.className = 'op-section-title'
      inboxTitle.textContent = t('inbox')
      inboxHead.appendChild(inboxTitle)
      inbox.appendChild(inboxHead)
      const form = doc.createElement('form')
      form.className = 'op-inbox-add'
      const input = doc.createElement('input')
      input.id = 'op-pip-idea-input'
      input.className = 'op-input'
      input.placeholder = t('inboxPlaceholder')
      input.value = previousDraft
      const submit = makeButton(doc, 'op-btn op-btn-primary', t('capture'), () => {})
      submit.type = 'submit'
      form.appendChild(input)
      form.appendChild(submit)
      form.addEventListener('submit', async (event) => {
        event.preventDefault()
        const value = input.value.trim()
        if (value === '') return
        input.disabled = true
        try {
          await actions.addIdea(value)
          input.value = ''
        } catch {
          // The main panel owns the error toast.
        } finally {
          input.disabled = false
          input.focus()
        }
      })
      inbox.appendChild(form)
      for (const idea of data.inbox.slice(0, 6)) {
        const row = doc.createElement('div')
        row.className = `op-idea${flash.has(`idea:${idea.id}`) ? ' is-flash' : ''}`
        const content = doc.createElement('div')
        content.className = 'op-idea-content'
        content.textContent = idea.content
        row.appendChild(content)
        const rowActions = doc.createElement('div')
        rowActions.className = 'op-idea-actions'
        rowActions.appendChild(makeButton(doc, 'op-link-btn', '↗', () => {
          void actions.promoteIdea(idea.id).catch(() => {})
        }, t('promote')))
        row.appendChild(rowActions)
        inbox.appendChild(row)
      }
      scroll.appendChild(inbox)

      if (notice) {
        const toast = doc.createElement('div')
        toast.className = `op-toast is-${notice.kind || 'info'}`
        const icon = doc.createElement('span')
        icon.className = 'op-toast-icon'
        icon.textContent = notice.kind === 'error' ? '!' : notice.kind === 'warn' ? '▲' : '✓'
        toast.appendChild(icon)
        const toastBody = doc.createElement('div')
        toastBody.className = 'op-toast-body'
        const toastTitle = doc.createElement('div')
        toastTitle.className = 'op-toast-title'
        toastTitle.textContent = notice.title
        toastBody.appendChild(toastTitle)
        if (notice.body) {
          const toastText = doc.createElement('div')
          toastText.className = 'op-toast-text'
          toastText.textContent = notice.body
          toastBody.appendChild(toastText)
        }
        toast.appendChild(toastBody)
        shell.appendChild(toast)
      }

      const footer = doc.createElement('footer')
      footer.className = 'op-pip-foot'
      const modeLabel = doc.createElement('span')
      modeLabel.className = 'op-pip-mode'
      modeLabel.textContent = mode === 'pip' ? t('pipTopmost') : t('pipPopup')
      footer.appendChild(modeLabel)
      const pin = doc.createElement('span')
      pin.textContent = t('pinBadge')
      footer.appendChild(pin)
      shell.appendChild(footer)

      if (focused) {
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }
    }

    /* ------------------------------------------------------------------ *
     * Main application
     * ------------------------------------------------------------------ */

    function OmniPlanApp({ t, locale }) {
      const localeRevision = useLocaleSignal(locale)
      const now = useNowTick()
      const localeId = locale && typeof locale.getLocale === 'function' ? locale.getLocale().active : 'zh-CN'

      const initialUi = React.useRef(null)
      if (initialUi.current === null) initialUi.current = readUiState()
      const [ui, setUi] = React.useState(initialUi.current)
      const [pos, setPos] = React.useState({ x: initialUi.current.x, y: initialUi.current.y })
      const [data, setData] = React.useState({ state: { activeContexts: [], tasks: [], inbox: [], revision: 0, updatedAt: 0 }, revision: 0 })
      const dataRef = React.useRef(data)
      const [connection, setConnection] = React.useState('connecting')
      const [busy, setBusy] = React.useState(false)
      const busyCount = React.useRef(0)
      const [flash, setFlash] = React.useState(new Set())
      const [notice, setNotice] = React.useState(null)
      const [pulse, setPulse] = React.useState(false)
      const [pipOpen, setPipOpen] = React.useState(true)
      const [pipMode, setPipMode] = React.useState('native')
      const pipModeRef = React.useRef(pipMode)
      pipModeRef.current = pipMode
      const [notifPermission, setNotifPermission] = React.useState(
        typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
      )

      const panelRef = React.useRef(null)
      const dragRef = React.useRef(null)
      const flashTimers = React.useRef(new Map())
      const noticeTimer = React.useRef(null)
      const pulseTimer = React.useRef(null)
      const audioRef = React.useRef(null)
      const pipRef = React.useRef(null)
      const openPipRef = React.useRef(null)
      const tRef = React.useRef(t)
      const localeIdRef = React.useRef(localeId)
      const reactDomRef = React.useRef(undefined)
      tRef.current = t
      localeIdRef.current = localeId

      const summary = computeSummary(data.state)

      function updateUi(patch) {
        setUi((current) => {
          const next = { ...current, ...patch }
          writeUiState(next)
          return next
        })
      }

      function acceptPayload(payload) {
        if (!payload || !payload.state || !Array.isArray(payload.state.tasks)) return
        const next = {
          state: payload.state,
          revision: Number.isFinite(payload.revision) ? payload.revision : (payload.state.revision || 0),
        }
        dataRef.current = next
        setData(next)
      }

      function clearFlash(key) {
        setFlash((current) => {
          if (!current.has(key)) return current
          const next = new Set(current)
          next.delete(key)
          return next
        })
      }

      function markFlash(entities, delay = 3200) {
        if (!Array.isArray(entities) || entities.length === 0) return
        setFlash((current) => {
          const next = new Set(current)
          for (const entity of entities) {
            if (entity && entity.kind && entity.id) next.add(`${entity.kind}:${entity.id}`)
          }
          return next
        })
        for (const entity of entities) {
          if (!entity || !entity.kind || !entity.id) continue
          const key = `${entity.kind}:${entity.id}`
          const existing = flashTimers.current.get(key)
          if (existing) window.clearTimeout(existing)
          const timer = window.setTimeout(() => {
            flashTimers.current.delete(key)
            clearFlash(key)
          }, delay)
          flashTimers.current.set(key, timer)
        }
      }

      function initAudio() {
        if (audioRef.current) return
        try {
          const AudioCtor = window.AudioContext || window.webkitAudioContext
          if (AudioCtor) audioRef.current = new AudioCtor()
        } catch {
          audioRef.current = null
        }
      }

      function playTone(kind) {
        const audio = audioRef.current
        if (!audio || audio.state === 'closed') return
        const schedule = () => {
          try {
            const start = audio.currentTime
            const notes = kind === 'error'
              ? [240, 180]
              : kind === 'warn' || kind === 'warning'
                ? [700, 520, 700]
                : [660, 880, 1100]
            notes.forEach((frequency, index) => {
              const oscillator = audio.createOscillator()
              const gain = audio.createGain()
              const at = start + index * 0.11
              oscillator.type = 'sine'
              oscillator.frequency.setValueAtTime(frequency, at)
              gain.gain.setValueAtTime(0.0001, at)
              gain.gain.exponentialRampToValueAtTime(0.045, at + 0.015)
              gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09)
              oscillator.connect(gain)
              gain.connect(audio.destination)
              oscillator.start(at)
              oscillator.stop(at + 0.1)
            })
          } catch {
            // Audio is a bonus; never let it break the board.
          }
        }
        if (audio.state === 'suspended') {
          audio.resume().then(schedule).catch(() => {})
        } else {
          schedule()
        }
      }

      function systemNotify(title, body) {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
        try {
          const notification = new Notification(title, {
            body,
            silent: true,
            tag: 'omni-plan-notice',
          })
          window.setTimeout(() => notification.close(), 8000)
        } catch {
          // Some Electron shells expose Notification but refuse the constructor.
        }
      }

      function notify(kind, title, body, options = {}) {
        const sound = options.sound !== false
        const system = options.system !== false
        const shouldPulse = options.pulse !== false
        const level = kind === 'error' ? 'error' : kind === 'warn' ? 'warn' : kind === 'success' ? 'success' : 'info'
        setNotice({ kind: level, title, body, at: Date.now() })
        if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
        noticeTimer.current = window.setTimeout(() => setNotice(null), 8000)
        if (shouldPulse) {
          setPulse(true)
          if (pulseTimer.current) window.clearTimeout(pulseTimer.current)
          pulseTimer.current = window.setTimeout(() => setPulse(false), 2300)
        }
        if (sound) playTone(level)
        if (system) systemNotify(title, body)
      }

      async function requestNotifications() {
        if (typeof Notification === 'undefined') {
          notify('warn', t('notifications'), t('notificationsUnsupported'), { sound: false, system: false })
          setNotifPermission('unsupported')
          return
        }
        try {
          const permission = await Notification.requestPermission()
          setNotifPermission(permission)
          if (permission === 'granted') notify('success', t('notifications'), t('notificationsOn'), { sound: false, system: false })
          else notify('warn', t('notifications'), t('notificationsBlocked'), { sound: false, system: false })
        } catch {
          notify('warn', t('notifications'), t('notificationsBlocked'), { sound: false, system: false })
        }
      }

      function handleChange(payload) {
        const previousState = dataRef.current.state
        const change = payload && payload.change ? payload.change : {}
        const entities = Array.isArray(change.entities) ? change.entities : []
        const origin = change.origin || 'unknown'
        acceptPayload(payload)
        if (origin !== 'human') markFlash(entities)
        if (origin === 'human') return

        const nextState = payload.state
        const previousTasks = new Map(previousState.tasks.map((task) => [task.id, task]))
        const previousContexts = new Map(previousState.activeContexts.map((context) => [context.id, context]))
        const taskIds = new Set(entities.filter((entity) => entity.kind === 'task').map((entity) => entity.id))
        const contextIds = new Set(entities.filter((entity) => entity.kind === 'context').map((entity) => entity.id))

        const newlyDone = nextState.tasks.filter((task) => (
          taskIds.has(task.id) && task.status === 'done' && previousTasks.get(task.id)?.status !== 'done'
        ))
        const newlyBlocked = nextState.tasks.filter((task) => (
          taskIds.has(task.id) && task.status === 'blocked' && previousTasks.get(task.id)?.status !== 'blocked'
        ))
        const newlyWaiting = nextState.activeContexts.filter((context) => (
          contextIds.has(context.id) && context.agentStatus === 'waiting_user'
          && previousContexts.get(context.id)?.agentStatus !== 'waiting_user'
        ))

        if (newlyWaiting.length > 0) {
          const first = newlyWaiting[0]
          notify('warn', tRef.current('aiWaitingTitle'), tRef.current('aiWaitingBody', {
            workspace: first.workspace,
            next: first.nextActionForHuman || '—',
          }))
        } else if (newlyBlocked.length > 0) {
          notify('warn', tRef.current('aiBlockedTitle'), newlyBlocked.map((task) => task.title).join(' · '))
        } else if (newlyDone.length > 0) {
          notify('success', tRef.current('aiCompletedTitle'), newlyDone.map((task) => task.title).join(' · '))
        }
      }

      async function fetchState(silent = true) {
        try {
          const response = await fetch(`${API}/state`, {
            cache: 'no-store',
            headers: { accept: 'application/json' },
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const payload = await response.json()
          if (payload && payload.ok !== false) acceptPayload(payload)
          if (!silent) setConnection('connected')
          return payload
        } catch (error) {
          if (!silent) notify('error', tRef.current('errorTitle'), error?.message || String(error), { sound: false, system: false })
          return null
        }
      }

      async function apiCall(path, options = {}) {
        const init = {
          method: options.method || 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: {
            accept: 'application/json',
            ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
            ...(options.headers || {}),
          },
          ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
        }
        const response = await fetch(`${API}${path}`, init)
        let payload = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
        if (!response.ok || !payload || payload.ok === false) {
          const message = payload?.error?.message || `HTTP ${response.status}`
          throw new Error(message)
        }
        if (payload.state) acceptPayload(payload)
        if (Array.isArray(payload.change?.entities) && payload.change.origin !== 'human') {
          markFlash(payload.change.entities)
        }
        return payload
      }

      async function act(path, options, successKey) {
        busyCount.current += 1
        setBusy(true)
        try {
          const payload = await apiCall(path, options)
          if (successKey) notify('success', tRef.current(successKey), '', { sound: false, system: false, pulse: false })
          return payload
        } catch (error) {
          notify('error', tRef.current('errorTitle'), error?.message || String(error), { sound: false, system: false, pulse: false })
          throw error
        } finally {
          busyCount.current = Math.max(0, busyCount.current - 1)
          if (busyCount.current === 0) setBusy(false)
        }
      }

      const actions = {
        saveFocus: (payload) => act('/contexts', { method: 'POST', body: payload }, 'focusSaved'),
        deleteFocus: (id) => act(`/contexts/${encodeURIComponent(id)}`, { method: 'DELETE' }, null),
        addTask: (payload) => act('/tasks', { method: 'POST', body: payload }, 'taskAdded'),
        updateTask: (id, payload) => act(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }, 'taskSaved'),
        completeTask: (id) => act(`/tasks/${encodeURIComponent(id)}/complete`, { method: 'POST', body: {} }, 'taskCompleted'),
        deleteTask: (id) => act(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'taskDeleted'),
        addIdea: (content) => act('/inbox', { method: 'POST', body: { content } }, 'ideaCaptured'),
        promoteIdea: (id) => act(`/inbox/${encodeURIComponent(id)}/promote`, { method: 'POST', body: {} }, 'ideaPromoted'),
        deleteIdea: (id) => act(`/inbox/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'ideaDeleted'),
        refresh: () => fetchState(false),
      }

      React.useEffect(() => {
        let disposed = false
        let source = null
        let pollTimer = null

        function stopPolling() {
          if (pollTimer !== null) {
            window.clearInterval(pollTimer)
            pollTimer = null
          }
        }

        function startPolling() {
          if (pollTimer !== null || disposed) return
          pollTimer = window.setInterval(() => { void fetchState(true) }, 1600)
        }

        function parseFrame(event) {
          try {
            return JSON.parse(event.data)
          } catch {
            return null
          }
        }

        void fetchState(true)
        const autoLaunchNativeTopmost = async () => {
          try {
            const statusRes = await fetch(`${API}/topmost`, { cache: 'no-store', headers: { accept: 'application/json' } })
            if (!statusRes.ok) return
            const payload = await statusRes.json().catch(() => null)
            if (disposed || !payload || payload.supported !== true) return
            if (payload.open === true) {
              pipModeRef.current = 'native'
              setPipMode('native')
              setPipOpen(true)
              return
            }
            // 尚未启动时，自动发送 POST 开启原生独立窗口
            const startRes = await fetch(`${API}/topmost`, {
              method: 'POST',
              cache: 'no-store',
              credentials: 'same-origin',
              headers: { accept: 'application/json' },
            })
            if (startRes.ok) {
              const startPayload = await startRes.json().catch(() => null)
              if (!disposed && startPayload && startPayload.open === true) {
                pipModeRef.current = 'native'
                setPipMode('native')
                setPipOpen(true)
              }
            }
          } catch {
            // 静默处理，避免打断界面
          }
        }
        void autoLaunchNativeTopmost()
        if (typeof EventSource === 'undefined') {
          setConnection('offline')
          startPolling()
        } else {
          try {
            source = new EventSource(`${API}/events`)
            source.addEventListener('open', () => {
              if (disposed) return
              setConnection('connected')
              stopPolling()
            })
            source.addEventListener('snapshot', (event) => {
              if (disposed) return
              const payload = parseFrame(event)
              if (!payload) return
              acceptPayload(payload)
              setConnection('connected')
              stopPolling()
            })
            source.addEventListener('change', (event) => {
              if (disposed) return
              const payload = parseFrame(event)
              if (!payload) return
              handleChange(payload)
              setConnection('connected')
            })
            source.addEventListener('reminder', (event) => {
              if (disposed) return
              const payload = parseFrame(event)
              if (!payload || !Array.isArray(payload.tasks)) return
              markFlash(payload.tasks.map((task) => ({ kind: 'task', id: task.id })))
              notify('warn', tRef.current('reminderTitle'), payload.tasks.map((task) => task.title).join(' · '))
            })
            source.addEventListener('warning', (event) => {
              if (disposed) return
              const payload = parseFrame(event)
              notify('warn', tRef.current('warningTitle'), payload?.message || '', { sound: false, system: false })
            })
            source.addEventListener('topmost', (event) => {
              if (disposed) return
              const payload = parseFrame(event)
              if (!payload) return
              if (payload.open === true) {
                pipModeRef.current = 'native'
                setPipMode('native')
                setPipOpen(true)
              } else if (pipModeRef.current === 'native') {
                pipModeRef.current = 'pip'
                setPipMode('pip')
                setPipOpen(false)
              }
            })
            source.onerror = () => {
              if (disposed) return
              setConnection('offline')
              startPolling()
            }
          } catch {
            setConnection('offline')
            startPolling()
          }
        }

        return () => {
          disposed = true
          stopPolling()
          try { source?.close() } catch { /* ignored */ }
        }
      }, [])

      React.useEffect(() => {
        if (!pipOpen || pipMode !== 'native') return undefined
        let disposed = false
        const timer = window.setInterval(async () => {
          try {
            const response = await fetch(`${API}/topmost`, {
              cache: 'no-store',
              headers: { accept: 'application/json' },
            })
            if (!response.ok) return
            const payload = await response.json()
            if (!disposed && payload && payload.open !== true) {
              pipModeRef.current = 'pip'
              setPipMode('pip')
              setPipOpen(false)
            }
          } catch {
            // Keep the main panel hidden until the native window is confirmed closed.
          }
        }, 1600)
        return () => {
          disposed = true
          window.clearInterval(timer)
        }
      }, [pipOpen, pipMode])

      React.useEffect(() => {
        const onResize = () => {
          setPos((current) => {
            const width = panelRef.current?.offsetWidth || 372
            const height = panelRef.current?.offsetHeight || 520
            return {
              x: clamp(current.x, 8, Math.max(8, window.innerWidth - width - 8)),
              y: clamp(current.y, 8, Math.max(8, window.innerHeight - height - 8)),
            }
          })
        }
        window.addEventListener('resize', onResize)
        onResize()
        return () => window.removeEventListener('resize', onResize)
      }, [ui.collapsed])

      React.useEffect(() => {
        return () => {
          for (const timer of flashTimers.current.values()) window.clearTimeout(timer)
          flashTimers.current.clear()
          if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
          if (pulseTimer.current) window.clearTimeout(pulseTimer.current)
          try { audioRef.current?.close?.() } catch { /* ignored */ }
          cleanupPip()
        }
      }, [])

      function startDrag(event) {
        if (event.button !== 0) return
        const target = event.target
        if (target && typeof target.closest === 'function'
          && target.closest('button, input, select, textarea, a, [data-no-drag]')) return
        const element = panelRef.current
        if (!element) return
        const rect = element.getBoundingClientRect()
        dragRef.current = {
          pointerId: event.pointerId,
          deltaX: event.clientX - rect.left,
          deltaY: event.clientY - rect.top,
        }
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* ignored */ }
        event.preventDefault()
      }

      function moveDrag(event) {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        const width = panelRef.current?.offsetWidth || 372
        const height = panelRef.current?.offsetHeight || 520
        setPos({
          x: clamp(event.clientX - drag.deltaX, 8, Math.max(8, window.innerWidth - width - 8)),
          y: clamp(event.clientY - drag.deltaY, 8, Math.max(8, window.innerHeight - height - 8)),
        })
      }

      function endDrag(event) {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        dragRef.current = null
        const width = panelRef.current?.offsetWidth || 372
        const height = panelRef.current?.offsetHeight || 520
        const nextPos = {
          x: clamp(event.clientX - drag.deltaX, 8, Math.max(8, window.innerWidth - width - 8)),
          y: clamp(event.clientY - drag.deltaY, 8, Math.max(8, window.innerHeight - height - 8)),
        }
        setPos(nextPos)
        try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* ignored */ }
        setUi((current) => {
          const next = { ...current, x: nextPos.x, y: nextPos.y }
          writeUiState(next)
          return next
        })
      }

      function resetPosition() {
        const width = panelRef.current?.offsetWidth || 372
        const next = {
          x: Math.max(12, window.innerWidth - width - 18),
          y: 72,
        }
        setPos(next)
        updateUi({ x: next.x, y: next.y })
      }

      function cleanupPip() {
        const current = pipRef.current
        pipRef.current = null
        if (current) {
          try {
            if (current.kind === 'react' && current.root) current.root.unmount()
          } catch { /* ignored */ }
          try { current.win?.close?.() } catch { /* ignored */ }
        }
        setPipOpen(false)
      }

      function createPipRoot(win, mode) {
        copyThemeToWindow(win)
        const container = win.document.createElement('div')
        container.className = 'op-pip-root'
        win.document.body.appendChild(container)
        if (reactDomRef.current === undefined) reactDomRef.current = resolveReactDom(require)
        const reactDom = reactDomRef.current
        if (reactDom) {
          try {
            if (reactDom.kind === 'createRoot') {
              const root = reactDom.module.createRoot(container)
              pipRef.current = { kind: 'react', win, root, container, mode }
              return
            }
            if (reactDom.kind === 'legacy') {
              const root = {
                render: (element) => reactDom.module.render(element, container),
                unmount: () => reactDom.module.unmountComponentAtNode(container),
              }
              pipRef.current = { kind: 'react', win, root, container, mode }
              return
            }
          } catch {
            // Fall through to the dependency-free renderer.
          }
        }
        container.textContent = ''
        pipRef.current = { kind: 'dom', win, container, mode }
      }

      async function openPip() {
        initAudio()
        if (pipRef.current) {
          const existing = pipRef.current
          if (existing.win && existing.win.closed) {
            cleanupPip()
          } else {
            try { existing.win?.focus?.() } catch { /* ignored */ }
            return
          }
        }

        // Desktop OS-level path first: a separate WPF process with Topmost=true.
        // DSH's Electron main window denies window.open, and Document PiP is not
        // guaranteed to leave the Electron window on every build.
        let nativeSupported = false
        try {
          const statusResponse = await fetch(`${API}/topmost`, {
            cache: 'no-store',
            headers: { accept: 'application/json' },
          })
          if (statusResponse.ok) {
            const status = await statusResponse.json()
            nativeSupported = status && status.supported === true
            if (nativeSupported && status.open === true) {
              pipModeRef.current = 'native'
              setPipMode('native')
              setPipOpen(true)
              return
            }
          }
        } catch {
          nativeSupported = false
        }

        if (nativeSupported) {
          try {
            const response = await fetch(`${API}/topmost`, {
              method: 'POST',
              cache: 'no-store',
              credentials: 'same-origin',
              headers: { accept: 'application/json' },
            })
            const payload = await response.json().catch(() => null)
            if (response.ok && payload && payload.ok === true && payload.open === true) {
              pipModeRef.current = 'native'
              setPipMode('native')
              setPipOpen(true)
              return
            }
            throw new Error(payload?.error?.message || tRef.current('pinFailed'))
          } catch (error) {
            notify('error', tRef.current('errorTitle'), error?.message || tRef.current('pinFailed'), {
              sound: false,
              system: false,
              pulse: false,
            })
            return
          }
        }

        let pipApi = null
        try { pipApi = window.documentPictureInPicture } catch { pipApi = null }
        let win = null
        let mode = 'pip'
        try {
          if (pipApi && typeof pipApi.requestWindow === 'function') {
            win = await pipApi.requestWindow({ width: 340, height: 500 })
          } else {
            mode = 'popup'
            win = window.open('', PIP_NAME, 'popup=yes,width=340,height=500,resizable=yes,scrollbars=no,alwaysOnTop=yes')
          }
        } catch {
          mode = 'popup'
          try {
            win = window.open('', PIP_NAME, 'popup=yes,width=340,height=500,resizable=yes,scrollbars=no,alwaysOnTop=yes')
          } catch {
            win = null
          }
        }
        if (!win) {
          notify('error', tRef.current('errorTitle'), tRef.current('pinFailed'), { sound: false, system: false })
          return
        }
        try {
          win.document.body.textContent = ''
          createPipRoot(win, mode)
          setPipMode(mode)
          setPipOpen(true)
          win.addEventListener('pagehide', () => {
            if (pipRef.current && pipRef.current.win === win) {
              pipRef.current = null
              setPipOpen(false)
            }
          }, { once: true })
          if (mode === 'popup') {
            notify('warn', tRef.current('pinFallbackTitle'), tRef.current('pinFallbackBody'), { sound: false, system: false })
          }
        } catch (error) {
          try { win.close() } catch { /* ignored */ }
          pipRef.current = null
          setPipOpen(false)
          notify('error', tRef.current('errorTitle'), error?.message || tRef.current('pinFailed'), { sound: false, system: false })
        }
      }

      openPipRef.current = openPip

      // The launcher lives in the conversation header; it opens the same
      // native/PiP window through this stable custom event bridge.
      React.useEffect(() => {
        const openFromHeader = () => { void openPipRef.current?.() }
        window.addEventListener('omni-plan:open', openFromHeader)
        return () => window.removeEventListener('omni-plan:open', openFromHeader)
      }, [])

      React.useEffect(() => {
        const current = pipRef.current
        if (!current) return
        const pipProps = {
          data: data.state,
          t,
          flash,
          actions,
          now,
          connected: connection === 'connected',
          notice,
          close: cleanupPip,
          mode: pipMode,
          pulse,
          onCloseNotice: () => setNotice(null),
        }
        if (current.kind === 'react') {
          try { current.root.render(h(PipRoot, pipProps)) } catch { /* ignored */ }
        } else {
          renderPipDom(current.container, pipProps)
        }
      }, [data, flash, t, localeRevision, connection, notice, pulse, now, pipMode, pipOpen])

      if (pipOpen) return null

      return h(Toast, { notice, onClose: () => setNotice(null), t })
    }

    /**
     * Top navigation entry for Omni Plan.
     *
     * It is mounted into conversation.header.leading, the official top-left
     * navigation seat, instead of a fixed floating pill. That keeps it in the
     * header flow (next to DSH navigation) and out of the composer/send button.
     */
    function OmniPlanHeaderButton({ t }) {
      const [menuOpen, setMenuOpen] = React.useState(false)
      const [organizeOpen, setOrganizeOpen] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [status, setStatus] = React.useState('')
      const rootRef = React.useRef(null)

      React.useEffect(() => {
        if (!menuOpen) return undefined
        const onPointerDown = (event) => {
          if (rootRef.current && !rootRef.current.contains(event.target)) {
            setMenuOpen(false)
            setOrganizeOpen(false)
          }
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
      }, [menuOpen])

      function openWindow() {
        setMenuOpen(false)
        setOrganizeOpen(false)
        try { window.dispatchEvent(new CustomEvent('omni-plan:open')) } catch { /* ignored */ }
      }

      async function organize(scope) {
        if (busy) return
        setBusy(true)
        setStatus('提交中…')
        try {
          const response = await fetch(`${API}/integrations/organize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scope, mode: 'apply_and_push' }),
          })
          const payload = await response.json().catch(() => null)
          if (response.ok && payload && payload.ok) {
            const labels = { all: '全部', focus: '焦点', tasks: '任务', inbox: '灵感' }
            setStatus(`已提交：${labels[scope] || scope}`)
          } else {
            setStatus(payload?.error?.message || '提交失败')
          }
        } catch {
          setStatus('网络异常')
        } finally {
          setBusy(false)
          window.setTimeout(() => setStatus(''), 2800)
        }
      }

      const scopeButtons = [
        ['all', '全部'],
        ['focus', '焦点'],
        ['tasks', '任务'],
        ['inbox', '灵感'],
      ]

      return h('div', {
        ref: rootRef,
        className: 'op-header-nav-wrap',
        onPointerDown: (event) => event.stopPropagation(),
      },
        h('style', {
          key: 'op-header-nav-style',
          dangerouslySetInnerHTML: {
            __html: `
              .op-header-nav-wrap {
                position: relative;
                display: inline-flex;
                align-items: center;
                -webkit-app-region: no-drag;

                /* 浅色主题默认变量 (Light Mode) - 采用 100% 纯白不透明底色，绝不透出后方文字 */
                --op-hdr-btn-bg: rgba(0, 0, 0, 0.04);
                --op-hdr-btn-bg-hover: rgba(0, 0, 0, 0.08);
                --op-hdr-btn-border: rgba(0, 0, 0, 0.09);
                --op-hdr-btn-border-hover: rgba(0, 0, 0, 0.18);
                --op-hdr-btn-color: #27272a;
                --op-hdr-btn-color-hover: #09090b;

                --op-hdr-menu-bg: #ffffff;
                --op-hdr-menu-border: rgba(0, 0, 0, 0.1);
                --op-hdr-menu-shadow: 0 14px 34px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(0, 0, 0, 0.04);
                --op-hdr-item-color: #27272a;
                --op-hdr-item-hover-bg: rgba(0, 0, 0, 0.06);
                --op-hdr-item-hover-color: #09090b;
                --op-hdr-arrow-color: rgba(0, 0, 0, 0.45);
                --op-hdr-divider: rgba(0, 0, 0, 0.07);
                --op-hdr-status-color: #52525b;
              }

              /* 深色主题 (Dark Mode)：采用 100% 曜石黑不透明底色，彻底防止文字穿透透底 */
              @media (prefers-color-scheme: dark) {
                .op-header-nav-wrap {
                  --op-hdr-btn-bg: rgba(255, 255, 255, 0.06);
                  --op-hdr-btn-bg-hover: rgba(255, 255, 255, 0.12);
                  --op-hdr-btn-border: rgba(255, 255, 255, 0.09);
                  --op-hdr-btn-border-hover: rgba(255, 255, 255, 0.22);
                  --op-hdr-btn-color: #e4e4e7;
                  --op-hdr-btn-color-hover: #ffffff;

                  --op-hdr-menu-bg: #1c1c20;
                  --op-hdr-menu-border: rgba(255, 255, 255, 0.11);
                  --op-hdr-menu-shadow: 0 20px 48px rgba(0, 0, 0, 0.72), 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.07);
                  --op-hdr-item-color: #f4f4f5;
                  --op-hdr-item-hover-bg: rgba(255, 255, 255, 0.09);
                  --op-hdr-item-hover-color: #ffffff;
                  --op-hdr-arrow-color: rgba(255, 255, 255, 0.5);
                  --op-hdr-divider: rgba(255, 255, 255, 0.08);
                  --op-hdr-status-color: #a1a1aa;
                }
              }

              body[data-ds-dark-theme] .op-header-nav-wrap,
              html[data-theme='dark'] .op-header-nav-wrap,
              html.dark .op-header-nav-wrap {
                --op-hdr-btn-bg: rgba(255, 255, 255, 0.06);
                --op-hdr-btn-bg-hover: rgba(255, 255, 255, 0.12);
                --op-hdr-btn-border: rgba(255, 255, 255, 0.09);
                --op-hdr-btn-border-hover: rgba(255, 255, 255, 0.22);
                --op-hdr-btn-color: #e4e4e7;
                --op-hdr-btn-color-hover: #ffffff;

                --op-hdr-menu-bg: #1c1c20;
                --op-hdr-menu-border: rgba(255, 255, 255, 0.11);
                --op-hdr-menu-shadow: 0 20px 48px rgba(0, 0, 0, 0.72), 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.07);
                --op-hdr-item-color: #f4f4f5;
                --op-hdr-item-hover-bg: rgba(255, 255, 255, 0.09);
                --op-hdr-item-hover-color: #ffffff;
                --op-hdr-arrow-color: rgba(255, 255, 255, 0.5);
                --op-hdr-divider: rgba(255, 255, 255, 0.08);
                --op-hdr-status-color: #a1a1aa;
              }

              .op-header-nav {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                height: 28px;
                margin-left: 2px;
                padding: 0 10px;
                border: 1px solid var(--op-hdr-btn-border);
                border-radius: 6px;
                background: var(--op-hdr-btn-bg);
                color: var(--op-hdr-btn-color);
                font: inherit;
                font-size: 12px;
                font-weight: 500;
                line-height: 1;
                white-space: nowrap;
                cursor: pointer;
                user-select: none;
                transition: background .14s ease, color .14s ease, border-color .14s ease, transform .08s ease;
                -webkit-app-region: no-drag;
              }
              .op-header-nav:hover,
              .op-header-nav[aria-expanded="true"] {
                background: var(--op-hdr-btn-bg-hover);
                color: var(--op-hdr-btn-color-hover);
                border-color: var(--op-hdr-btn-border-hover);
              }
              .op-header-nav:active {
                transform: translateY(1px);
              }
              .op-header-nav-mark {
                font-size: 10.5px;
                opacity: .82;
              }

              /* 二级菜单主面板 */
              .op-header-menu {
                position: absolute;
                top: 34px;
                left: 0;
                z-index: 99999;
                min-width: 180px;
                padding: 5px;
                border: 1px solid var(--op-hdr-menu-border);
                border-radius: 9px;
                background: var(--op-hdr-menu-bg);
                box-shadow: var(--op-hdr-menu-shadow);
                backdrop-filter: blur(20px) saturate(160%);
                -webkit-backdrop-filter: blur(20px) saturate(160%);
                animation: op-menu-in .12s cubic-bezier(0.16, 1, 0.3, 1);
              }

              @keyframes op-menu-in {
                from {
                  opacity: 0;
                  transform: translateY(-4px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }

              .op-header-menu-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                min-height: 30px;
                padding: 0 10px;
                border: 0;
                border-radius: 6px;
                background: transparent;
                color: var(--op-hdr-item-color);
                font: inherit;
                font-size: 12.5px;
                font-weight: 450;
                line-height: 1.4;
                text-align: left;
                cursor: pointer;
                user-select: none;
                transition: background .12s ease, color .12s ease;
              }
              .op-header-menu-item:hover {
                background: var(--op-hdr-item-hover-bg);
                color: var(--op-hdr-item-hover-color);
              }
              .op-header-menu-item:active {
                transform: scale(0.99);
              }
              .op-header-menu-item:disabled {
                opacity: .45;
                cursor: wait;
              }
              .op-header-menu-arrow {
                opacity: .7;
                font-size: 11px;
                color: var(--op-hdr-arrow-color);
                transition: transform .12s ease, color .12s ease;
              }
              .op-header-submenu:hover .op-header-menu-arrow {
                transform: translateX(1.5px);
                color: var(--op-hdr-item-hover-color);
              }

              .op-header-submenu {
                position: relative;
              }
              /* 鼠标跨越缝隙桥接层，防意外丢失悬停 */
              .op-header-submenu::after {
                content: '';
                position: absolute;
                top: -4px;
                right: -8px;
                width: 12px;
                height: calc(100% + 8px);
                pointer-events: auto;
              }

              /* 三级子菜单面板 */
              .op-header-submenu-panel {
                position: absolute;
                top: -5px;
                left: calc(100% + 3px);
                min-width: 98px;
                padding: 5px;
                border: 1px solid var(--op-hdr-menu-border);
                border-radius: 9px;
                background: var(--op-hdr-menu-bg);
                box-shadow: var(--op-hdr-menu-shadow);
                backdrop-filter: blur(20px) saturate(160%);
                -webkit-backdrop-filter: blur(20px) saturate(160%);
                animation: op-submenu-in .12s cubic-bezier(0.16, 1, 0.3, 1);
              }

              @keyframes op-submenu-in {
                from {
                  opacity: 0;
                  transform: translateX(-4px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateX(0) scale(1);
                }
              }

              .op-header-menu-status {
                margin-top: 4px;
                padding: 6px 10px 3px;
                border-top: 1px solid var(--op-hdr-divider);
                color: var(--op-hdr-status-color);
                font-size: 10.5px;
                line-height: 1.35;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            `,
          },
        }),
        h('button', {
          type: 'button',
          className: 'op-header-nav',
          title: 'Omni Plan',
          'aria-label': 'Omni Plan',
          'aria-haspopup': 'menu',
          'aria-expanded': menuOpen ? 'true' : 'false',
          'data-no-drag': '',
          onClick: () => {
            setMenuOpen((value) => !value)
            setOrganizeOpen(false)
          },
        },
          h('span', { className: 'op-header-nav-mark', 'aria-hidden': 'true' }, '◈'),
          h('span', null, 'Omni Plan'),
        ),
        menuOpen ? h('div', {
          className: 'op-header-menu',
          role: 'menu',
        },
          h('button', {
            type: 'button',
            className: 'op-header-menu-item',
            role: 'menuitem',
            onClick: openWindow,
          }, '打开置顶窗口'),
          h('div', {
            className: 'op-header-submenu',
            onMouseEnter: () => setOrganizeOpen(true),
            onMouseLeave: () => setOrganizeOpen(false),
          },
            h('button', {
              type: 'button',
              className: 'op-header-menu-item',
              role: 'menuitem',
              'aria-haspopup': 'menu',
              'aria-expanded': organizeOpen ? 'true' : 'false',
              onClick: () => setOrganizeOpen((value) => !value),
            },
              h('span', null, '整理'),
              h('span', { className: 'op-header-menu-arrow', 'aria-hidden': 'true' }, '▸'),
            ),
            organizeOpen ? h('div', {
              className: 'op-header-submenu-panel',
              role: 'menu',
            },
              scopeButtons.map(([scope, label]) => h('button', {
                key: scope,
                type: 'button',
                className: 'op-header-menu-item',
                role: 'menuitem',
                disabled: busy,
                onClick: () => { void organize(scope) },
              }, label)),
            ) : null,
          ),
          status ? h('div', { className: 'op-header-menu-status' }, status) : null,
        ) : null,
      )
    }

    /**
     * DSH 会话头部工具栏快捷操作组件 (遵循《DSH任务注入接口规范.md》第8节)
     */
    function SessionToolbarActions(props) {
      const { sessionId, t } = props
      const [loading, setLoading] = React.useState(false)
      const [msg, setMsg] = React.useState(null)

      if (!sessionId) return null

      const pushToSession = async () => {
        if (loading) return
        setLoading(true)
        setMsg('推送中...')
        try {
          const res = await fetch(`${API}/integrations/dsh-todos/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetSessionId: sessionId, mode: 'append' }),
          })
          const data = await res.json()
          if (data && data.ok) {
            setMsg(data.pushed > 0 ? `已导入 ${data.pushed} 条` : '已在清单中')
          } else {
            setMsg('导入失败')
          }
        } catch {
          setMsg('网络异常')
        } finally {
          setLoading(false)
          setTimeout(() => setMsg(null), 2500)
        }
      }

      const organizeWithAi = async () => {
        if (loading) return
        setLoading(true)
        setMsg('提交分析...')
        try {
          const res = await fetch(`${API}/integrations/organize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetSessionId: sessionId, mode: 'apply_and_push' }),
          })
          const data = await res.json()
          if (data && data.ok) {
            setMsg('AI正在分析')
          } else {
            setMsg('提交失败')
          }
        } catch {
          setMsg('网络异常')
        } finally {
          setLoading(false)
          setTimeout(() => setMsg(null), 2500)
        }
      }

      return h('div', {
        className: 'omni-session-actions',
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: '8px',
          fontSize: '12px',
        },
      },
        h('button', {
          type: 'button',
          title: '将看板待办任务导入并注入到当前会话 Todo 列表',
          disabled: loading,
          onClick: pushToSession,
          style: {
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#e2e8f0',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '500',
            transition: 'all 0.15s ease',
          },
        }, msg || '→ DSH任务'),
        h('button', {
          type: 'button',
          title: '将看板灵感交给当前会话 AI 进行深度总结与提炼',
          disabled: loading,
          onClick: organizeWithAi,
          style: {
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '500',
            transition: 'all 0.15s ease',
          },
        }, 'AI总结')
      )
    }

    /* ------------------------------------------------------------------ *
     * Cordis Client entry
     * ------------------------------------------------------------------ */

    const inject = ['slots', 'locale']

    function apply(ctx) {
      function registerDict(localeId, dictionary) {
        try {
          return ctx.locale.register(NS, localeId, dictionary)
        } catch (error) {
          console.error(`[omni-plan] locale ${localeId} registration failed`, error)
          return () => {}
        }
      }
      ctx.effect(() => registerDict('zh', DICT_ZH))
      ctx.effect(() => registerDict('en', DICT_EN))
      const t = makeTranslator(ctx.locale.bind(NS))
      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: NS,
        order: 100,
        label: () => t('title'),
      }, () => h(OmniPlanApp, { t, locale: ctx.locale })))

      // 顶部左侧全局导航入口：与 DSH 的应用/编辑按钮同处 header leading 区域，
      // 不再使用右下角 fixed 胶囊，避免遮挡发送键。
      try {
        ctx.slots.inject('conversation.header.leading', () => ctx.slots.register({
          name: 'conversation.header.leading',
        }, () => h(OmniPlanHeaderButton, { t })))
      } catch (err) {
        console.warn('[omni-plan] conversation header leading slot injection failed:', err)
      }

      // DSH 任务 / AI 整理按钮已迁移到原生置顶窗口的底栏。
      // 会话顶部不再注入这两个按钮，避免占用聊天 header 空间。
    }

    return { name: NS, inject, apply }
  },
})
