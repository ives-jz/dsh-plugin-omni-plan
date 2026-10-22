/**
 * DSH 会话 AI 总结与灵感整理引擎
 * 
 * 遵循《DSH任务注入接口规范.md》第 15 节：
 * - 整理使用目标 DSH 会话的 AI，不额外配置 API Key；
 * - 采用 agent.followup() 排队投递，不打断当前 Agent 轮次；
 * - 原文作为数据块包装，严格防范 Prompt Injection；
 * - 提供 plan_apply_organization 写回落盘工具；
 * - 内存维护 organize_requests 表并管理请求生命周期。
 */

import { randomUUID } from 'node:crypto'
import { push_to_dsh_todos } from './dsh-todos.js'

// 内存请求状态表 (TTL: 1小时)
const organize_requests = new Map()

const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * 组装“聊天式”整理指令（短消息）。
 *
 * 设计：不再把看板原文塞进 prompt，只发一条一句话指令，
 * 让 AI 自己调用 plan_get_overview 读取数据再整理落盘。
 * 好处：消息短、数据永远最新，也不会把大量用户内容写进会话历史。
 */
export function build_organize_prompt(params = {}) {
  const {
    request_id,
    mode = 'preview',
    scope = 'all',
    focus = null,
    items = [],
    instructions = '',
    inbox_count = 0,
    task_count = 0,
  } = params

  const label = scope === 'inbox'
    ? `Omni Plan 收件箱里的全部灵感（当前 ${inbox_count} 条）`
    : scope === 'tasks'
      ? `Omni Plan 里所有未完成的任务（当前 ${task_count} 个）`
      : scope === 'focus'
        ? 'Omni Plan 的当前焦点'
        : scope === 'selection'
          ? `我在 Omni Plan 里选中的 ${items.length} 条条目（${items.map((item) => item.source_ref).join('、')}）`
          : `Omni Plan 里的所有内容（收件箱 ${inbox_count} 条灵感 + 当前焦点 + ${task_count} 个未完成任务）`

  const mode_line = mode === 'preview'
    ? '先只输出结构化预览，不要写入看板；我确认后再落盘。'
    : `请调用 plan_apply_organization（requestId="${request_id}"）写回看板${mode === 'apply_and_push' ? '，再用 plan_push_to_dsh_todos 把核心行动项同步到当前会话 Todo' : ''}。必须调用工具落盘，不要只在聊天里口头承诺。`

  const user_instructions = instructions ? `\n额外要求：${instructions}` : ''

  return `<omni-plan-organize-request requestId="${request_id}" scope="${scope}" mode="${mode}">
[Omni Plan] 请帮我整理：${label}。先调用 plan_get_overview 读取看板，不要让我再把内容粘贴过来。
为每条灵感/条目提炼可执行任务：title、purpose、preconditions、assumptions（明确标注为假设）、risks、priority（p0-p5）、status、notes、questions、actions，并保留 sourceRef（inbox:xxx / task:xxx）；不确定的信息写进 questions，不要编造。${mode_line}${user_instructions}
</omni-plan-organize-request>`
}

/**
 * 发起 AI 总结请求并排队到目标会话
 */
export async function dispatch_organize_request(ctx, store, params = {}) {
  const {
    target_session_id,
    scope = 'inbox',
    item_ids = [],
    mode = 'apply_and_push',
    instructions = '',
    max_items = 20,
  } = params

  clean_expired_requests()

  // 1. 获取目标 Agent 实例
  const agents_service = ctx.get ? ctx.get('agents') : ctx.agents
  if (!agents_service) {
    throw new Error('AGENTS_UNAVAILABLE: 当前环境未挂载 agents 服务')
  }

  let agent = null
  if (target_session_id) {
    if (typeof agents_service.get === 'function') {
      agent = agents_service.get(target_session_id)
    }
  }

  // 若未指定 session 或未找到，寻找首个 live 会话
  if (!agent) {
    let agent_list = []
    if (typeof agents_service.list === 'function') {
      agent_list = agents_service.list()
    } else if (typeof agents_service.values === 'function') {
      agent_list = Array.from(agents_service.values())
    } else if (Array.isArray(agents_service)) {
      agent_list = agents_service
    }
    for (const a of agent_list) {
      if (a && !a.isDisposed && a.session && !a.session.isArchived) {
        agent = a
        break
      }
    }
  }

  if (!agent) {
    throw new Error('SESSION_NOT_LIVE: 未检测到任何活跃的 DSH 会话，请先开启会话')
  }

  // 2. 收集需要整理的数据项
  // scope 支持:
  //   inbox      仅未整理灵感
  //   focus      仅当前焦点（items 为空，focus 由 prompt 携带）
  //   tasks      未完成任务
  //   all        灵感 + 未完成任务 + 焦点
  //   selection  指定 itemIds（可同时包含 inbox/task）
  const snapshot = store.snapshot()
  const items = []
  const selected_ids = new Set(Array.isArray(item_ids) ? item_ids : [])
  const include_inbox = scope === 'inbox' || scope === 'all' || scope === 'selection'
  const include_tasks = scope === 'tasks' || scope === 'all' || scope === 'selection'
  const remaining = () => Math.max(0, max_items - items.length)

  if (include_inbox) {
    let inbox_list = snapshot.state.inbox || []
    if (selected_ids.size > 0) {
      inbox_list = inbox_list.filter((item) => selected_ids.has(item.id))
    }
    for (const idea of inbox_list.slice(0, remaining())) {
      items.push({
        source_ref: `inbox:${idea.id}`,
        content: idea.content,
        created_at: idea.createdAt,
      })
    }
  }

  if (include_tasks) {
    let task_list = (snapshot.state.tasks || []).filter((task) => task.status !== 'done')
    if (selected_ids.size > 0) {
      task_list = task_list.filter((task) => selected_ids.has(task.id))
    }
    for (const task of task_list.slice(0, remaining())) {
      const meta = [
        `优先级: ${task.priority || 'medium'}`,
        task.status ? `状态: ${task.status}` : '',
        task.notes ? `备注: ${task.notes}` : '',
      ].filter(Boolean).join('；')
      items.push({
        source_ref: `task:${task.id}`,
        content: `${task.title}（${meta}）`,
        created_at: task.createdAt,
      })
    }
  }

  const focus = snapshot.state.activeContexts && snapshot.state.activeContexts.length > 0
    ? snapshot.state.activeContexts[0]
    : null

  if (items.length === 0 && !focus) {
    throw new Error('NO_CONTENT_TO_ORGANIZE: 当前看板没有可供总结的灵感、任务或焦点')
  }

  const inbox_total = (snapshot.state.inbox || []).length
  const task_total = (snapshot.state.tasks || []).filter((task) => task.status !== 'done').length

  const request_id = randomUUID()
  const prompt_text = build_organize_prompt({
    request_id,
    mode,
    scope,
    focus,
    items,
    instructions,
    inbox_count: inbox_total,
    task_count: task_total,
  })

  const scope_label_map = {
    all: '全部看板',
    focus: '焦点锚点',
    tasks: '待办任务',
    inbox: '灵感收纳柜',
    selection: '选中条目',
  }
  const scope_text = scope_label_map[scope] || scope

  // 3. 采用 agent.followup() 进行非阻塞排队
  if (typeof agent.followup !== 'function') {
    throw new Error('FOLLOWUP_UNSUPPORTED: 目标 Agent 实例不支持 followup 排队机制')
  }

  // 注意：followup 的消息对象会被 DSH 原样写入 user/message 事件。
  // 必须显式给出 role（和 id），否则会话里会留下一条没有 role 的 user/message，
  // 之后每一次模型请求都会整包 422：messages[n]: missing field `role`。
  // source.kind 改为 'omni-plan-organize'（非 'user'），DSH 聊天 UI 会将其渲染为
  // 折叠的“请求”卡片（TurnTrigger），默认收起正文，避免提示词外露，达成静默化体验。
  await agent.followup({
    role: 'user',
    id: randomUUID(),
    content: [{
      type: 'text',
      text: prompt_text,
    }],
    source: {
      kind: 'omni-plan-organize',
      form: 'notice',
      summary: `正在整理 Omni Plan（${scope_text}）`,
    },
  })

  // 4. 登记请求状态
  const record = {
    request_id,
    target_session_id: agent.session?.id || agent.id,
    mode,
    item_count: items.length,
    status: 'queued',
    created_at: Date.now(),
    updated_at: Date.now(),
    result: null,
  }
  organize_requests.set(request_id, record)

  return {
    ok: true,
    request_id,
    target_session_id: record.target_session_id,
    status: 'queued',
    item_count: items.length,
    mode,
  }
}

/**
 * 由 AI 调用 plan_apply_organization 工具执行写回落盘
 */
export async function apply_organization_result(ctx, store, params = {}) {
  const {
    request_id,
    summary = '',
    items = [],
    focus = null,
    consume_inbox = true,
    push_to_dsh = true,
    agent,
    signal,
  } = params

  // 两种入口：
  // 1) request_id 存在：来自 UI「整理」按钮排队的 <omni-plan-organize-request>，
  //    必须命中内存请求表，保证幂等与状态回写；
  // 2) request_id 缺省：用户在聊天里直接说“帮我整理 Omni Plan”，
  //    AI 先 plan_get_overview 读取，再调用本工具落盘；直接执行写回。
  let record = null
  if (request_id) {
    record = organize_requests.get(request_id)
    if (!record) {
      throw new Error(`REQUEST_NOT_FOUND_OR_EXPIRED: 总结请求 ${request_id} 不存在或已过期`)
    }
    if (record.status === 'applied') {
      return { ok: true, already_applied: true, request_id }
    }
  }

  const created_tasks = []

  // 1. 批量写回 Omni Plan 任务
  for (const item of items) {
    if (!item || !item.title) continue

    const notes_parts = []
    if (item.purpose) notes_parts.push(`【目的】${item.purpose}`)
    if (item.preconditions && item.preconditions.length > 0) {
      notes_parts.push(`【前置条件】\n- ${item.preconditions.join('\n- ')}`)
    }
    if (item.assumptions && item.assumptions.length > 0) {
      notes_parts.push(`【假设】\n- ${item.assumptions.join('\n- ')}`)
    }
    if (item.risks && item.risks.length > 0) {
      notes_parts.push(`【风险】\n- ${item.risks.join('\n- ')}`)
    }
    if (item.actions && item.actions.length > 0) {
      notes_parts.push(`【建议行动】\n- ${item.actions.join('\n- ')}`)
    }
    if (item.questions && item.questions.length > 0) {
      notes_parts.push(`【待确认问题】\n- ${item.questions.join('\n- ')}`)
    }
    if (item.notes) notes_parts.push(`【补充说明】${item.notes}`)
    if (item.sourceRef) notes_parts.push(`来源: ${item.sourceRef}`)

    const organized_notes = notes_parts.join('\n\n')
    let task_result = null

    // 已有任务：按 sourceRef 更新，而不是再创建一条重复任务
    if (item.sourceRef && item.sourceRef.startsWith('task:')) {
      const task_id = item.sourceRef.slice('task:'.length)
      const snapshot = store.snapshot()
      const existing = (snapshot.state.tasks || []).find((task) => task.id === task_id)
      if (existing) {
        const merged_notes = existing.notes
          ? `${existing.notes}\n\n--- 整理结果 ---\n${organized_notes}`
          : organized_notes
        task_result = await store.manageTask({
          action: 'update',
          taskId: task_id,
          title: item.title,
          priority: item.priority || existing.priority || 'p3',
          status: item.status || existing.status || 'todo',
          notes: merged_notes.slice(0, 8000),
        }, {
          kind: 'task',
          action: 'organize-update',
          origin: 'dsh-agent',
          actor: agent?.id ? String(agent.id) : 'ai-organizer',
        })
      }
    }

    if (!task_result) {
      task_result = await store.manageTask({
        action: 'add',
        title: item.title,
        priority: item.priority || 'p3',
        status: item.status || 'todo',
        notes: organized_notes,
      }, {
        kind: 'task',
        action: 'organize-apply',
        origin: 'dsh-agent',
        actor: agent?.id ? String(agent.id) : 'ai-organizer',
      })
    }

    if (task_result && task_result.task) {
      created_tasks.push(task_result.task)
    }

    // 2. 若对应来源是 inbox 且需要 consume，则自动从收件箱归档删除
    if (consume_inbox && item.sourceRef && item.sourceRef.startsWith('inbox:')) {
      const idea_id = item.sourceRef.slice('inbox:'.length)
      try {
        await store.removeIdea({ id: idea_id }, {
          kind: 'inbox',
          action: 'organize-consume',
          origin: 'dsh-agent',
          actor: 'ai-organizer',
        })
      } catch {
        // 忽略已删除错误
      }
    }
  }

  // 3. 更新焦点工作区的下一步行动
  if (focus && focus.nextActionForHuman) {
    const snapshot = store.snapshot()
    const active_ctx = (snapshot.state.activeContexts && snapshot.state.activeContexts[0]) || {
      workspace: 'default',
      agentStatus: 'waiting_user',
      currentDoing: '已完成 AI 计划梳理',
      nextActionForHuman: focus.nextActionForHuman,
    }
    await store.upsertContext({
      ...active_ctx,
      nextActionForHuman: focus.nextActionForHuman,
    }, {
      kind: 'context',
      action: 'organize-update-focus',
      origin: 'dsh-agent',
      actor: 'ai-organizer',
    })
  }

  // 4. 若开启同步，将新创建的任务推送到当前 DSH 会话的 Todo 列表
  // 注意：ctx.tools.execute 必须带 signal，否则注册表读取 callerSignal.aborted 会抛错
  // （会被误吞成 pushed=0）。失败时把原因带回给调用方，避免静默。
  let pushed_to_dsh_count = 0
  let push_error = null
  if (push_to_dsh && created_tasks.length > 0 && agent) {
    try {
      const push_res = await push_to_dsh_todos(ctx, {
        agent,
        items: created_tasks,
        kind: 'task',
        mode: 'append',
        signal,
      })
      pushed_to_dsh_count = push_res.pushed || 0
    } catch (error) {
      push_error = error instanceof Error ? error.message : String(error)
    }
  }

  if (record) {
    record.status = 'applied'
    record.updated_at = Date.now()
    record.result = {
      summary,
      created_task_count: created_tasks.length,
      pushed_to_dsh_count,
    }
  }

  return {
    ok: true,
    request_id: request_id || null,
    created_task_count: created_tasks.length,
    pushed_to_dsh_count,
    ...(push_error === null ? {} : { push_error }),
    summary,
  }
}

/**
 * 获取请求状态
 */
export function get_organize_request_status(request_id) {
  clean_expired_requests()
  const found = organize_requests.get(request_id)
  if (!found) return null
  return {
    ok: true,
    requestId: found.request_id,
    targetSessionId: found.target_session_id,
    status: found.status,
    mode: found.mode,
    itemCount: found.item_count,
    createdAt: found.created_at,
    result: found.result,
  }
}

function clean_expired_requests() {
  const now = Date.now()
  for (const [id, req] of organize_requests.entries()) {
    if (now - req.created_at > ONE_HOUR_MS) {
      organize_requests.delete(id)
    }
  }
}
