/**
 * DSH 会话任务注入与内容识别桥接模块
 * 
 * 遵循《DSH任务注入接口规范.md》：
 * - DSH Todo 是单 Agent Session 的全量替换清单 (todo_write)；
 * - 注入前必须读取当前会话的 todos projection，以 append 模式合并去重；
 * - 数据项通过 [OmniPlan] ... · ref=omni:task:<id> 进行编码与关联；
 * - 默认状态全部置为 pending，避免触发 allowParallelInProgress 限制；
 * - 支持 list_live_sessions 探测在线会话。
 */

import { randomUUID } from 'node:crypto'

/**
 * 构造统一格式的 DSH Todo Content
 * @param {object} item Omni Plan 实体 (task / context / idea)
 * @param {string} kind 实体类型 ('task' | 'context' | 'idea')
 * @returns {string} 编码后的 content 文本
 */
export function build_todo_content(item, kind = 'task') {
  if (!item) return ''

  if (kind === 'task') {
    const title_raw = (item.title || '未命名任务').trim()
    const title_clean = title_raw.length > 200 ? `${title_raw.slice(0, 197)}...` : title_raw
    const priority_label = get_priority_chinese_label(item.priority)
    const due_part = item.remindAt ? ` · due ${format_timestamp(item.remindAt)}` : ''
    return `[OmniPlan] ${title_clean} · ${priority_label}${due_part} · ref=omni:task:${item.id}`
  }

  if (kind === 'context' || kind === 'focus') {
    const workspace = (item.workspace || '工作区').trim()
    const next_action = (item.nextActionForHuman || '待接手').trim()
    const action_clean = next_action.length > 200 ? `${next_action.slice(0, 197)}...` : next_action
    return `[OmniPlan] ${workspace} → ${action_clean} · ref=omni:context:${item.id}`
  }

  if (kind === 'idea' || kind === 'inbox') {
    const content_raw = (item.content || '灵感闪念').trim()
    const content_clean = content_raw.length > 220 ? `${content_raw.slice(0, 217)}...` : content_raw
    return `[OmniPlan] ${content_clean} · ref=omni:idea:${item.id}`
  }

  return `[OmniPlan] ${item.title || item.content || '任务项'} · ref=omni:item:${item.id}`
}

/** 优先级权重：数字越小越重要（P0 最高）。 */
const PRIORITY_WEIGHTS = {
  p0: 0, p1: 1, p2: 2, p3: 3, p4: 4, p5: 5, p6: 6, p7: 7,
  high: 1, medium: 3, low: 5,
}

/**
 * 按优先级从重到轻排序（同优先级保持创建时间先后）。
 * @param {Array} items 待推送条目
 * @returns {Array} 排序后的新数组
 */
export function sort_items_by_priority(items = []) {
  return [...items].sort((left, right) => {
    const left_weight = PRIORITY_WEIGHTS[String(left?.priority ?? '').toLowerCase()] ?? 9
    const right_weight = PRIORITY_WEIGHTS[String(right?.priority ?? '').toLowerCase()] ?? 9
    if (left_weight !== right_weight) return left_weight - right_weight
    return (left?.createdAt ?? 0) - (right?.createdAt ?? 0)
  })
}

/**
 * 读取目标会话的当前 DSH Todo 列表
 * @param {object} ctx Cordis Context
 * @param {object} agent 目标 Agent 实例
 * @returns {Array<{ content: string, status: string }>}
 */
export function read_current_todos(ctx, agent) {
  if (!agent || !agent.session) return []

  // 1. 优先从 sessionProjections 读取当前状态
  const projections = ctx.get ? ctx.get('sessionProjections') : ctx.sessionProjections
  if (projections !== undefined && typeof projections.stateOf === 'function') {
    try {
      const state = projections.stateOf(agent.session, 'todos')
      if (state !== undefined) {
        return (state ?? []).map((todo) => ({ ...todo }))
      }
    } catch {
      // projection 读取异常时降级扫描事件日志
    }
  }

  // 2. 降级：从 session snapshot 事件中寻找最新的 todo/write
  if (typeof agent.session.snapshotEvents === 'function') {
    try {
      const events = agent.session.snapshotEvents()
      for (let index = events.length - 1; index >= 0; index -= 1) {
        if (events[index] && events[index].type === 'todo/write' && events[index].data) {
          const todos_from_event = events[index].data.todos
          if (Array.isArray(todos_from_event)) {
            return todos_from_event.map((todo) => ({ ...todo }))
          }
        }
      }
    } catch {
      // snapshot 提取失败
    }
  }

  return []
}

/**
 * 读取最近一次 todo/write 快照。
 * 与 read_current_todos 不同：即使新一轮 turn/start 已把 todos 投影重置为 null，
 * 也能从会话事件里取回最后一次写入的清单（供 AI 在轮次边界后读取注入结果）。
 * @param {object} agent 目标 Agent 实例
 * @returns {Array<{content: string, status: string}>|null} 最后一次快照，或 null（从未写过）
 */
export function read_latest_todo_snapshot(agent) {
  if (!agent || !agent.session || typeof agent.session.snapshotEvents !== 'function') return null
  try {
    const events = agent.session.snapshotEvents()
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index]
      if (event && event.type === 'todo/write' && Array.isArray(event.data?.todos)) {
        return event.data.todos.map((todo) => ({ ...todo }))
      }
    }
  } catch {
    // snapshot 提取失败时返回 null
  }
  return null
}

/**
 * 提取 content 中的 ref 标识符 (如 omni:task:xxx)
 * @param {string} content
 * @returns {string|null}
 */
export function extract_todo_ref(content) {
  if (typeof content !== 'string') return null
  const match = content.match(/ref=(omni:[a-z0-9_-]+:[a-z0-9_-]+)/i)
  return match ? match[1] : null
}

/**
 * 合并现有任务与新注入条目
 * @param {Array<{ content: string, status: string }>} current 当前 Todo 列表
 * @param {Array<{ content: string, status: string }>} additions 待注入的新条目
 * @param {object} options 合并配置 (mode: 'append' | 'replace')
 * @returns {{ merged_todos: Array, pushed_count: number, skipped_count: number }}
 */
export function merge_todos(current = [], additions = [], options = {}) {
  const mode = options.mode ?? 'append'
  if (mode === 'replace') {
    return {
      merged_todos: additions.map((item) => ({ ...item })),
      pushed_count: additions.length,
      skipped_count: 0,
    }
  }

  const result = current.map((todo) => ({ ...todo }))
  const seen_contents = new Set(result.map((todo) => todo.content))
  const seen_refs = new Set(
    result
      .map((todo) => extract_todo_ref(todo.content))
      .filter((ref) => ref !== null)
  )

  let pushed_count = 0
  let skipped_count = 0

  for (const item of additions) {
    if (!item || !item.content) continue

    // 1. 完全相同文本幂等去重
    if (seen_contents.has(item.content)) {
      skipped_count += 1
      continue
    }

    // 2. 相同 ref 来源去重 (避免更新时间等细节微变导致重复注入)
    const item_ref = extract_todo_ref(item.content)
    if (item_ref && seen_refs.has(item_ref)) {
      skipped_count += 1
      continue
    }

    seen_contents.add(item.content)
    if (item_ref) seen_refs.add(item_ref)
    result.push({ ...item })
    pushed_count += 1
  }

  return {
    merged_todos: result,
    pushed_count,
    skipped_count,
  }
}

/**
 * 将任务推送到目标 DSH 会话
 * @param {object} ctx Cordis Context
 * @param {object} params
 * @param {string} [params.target_session_id] 目标会话 ID
 * @param {Array} params.items 待推送的实体项列表
 * @param {string} [params.kind] 实体类型 ('task' | 'context' | 'idea')
 * @param {string} [params.mode] 合并模式 ('append' | 'replace')
 * @param {boolean} [params.dry_run] 仅返回合并结果而不执行实际写入
 * @param {AbortSignal} [params.signal]
 * @param {object} [params.agent] 可选直接传入 Agent 实例
 * @returns {Promise<object>}
 */
export async function push_to_dsh_todos(ctx, params = {}) {
  const {
    target_session_id,
    items = [],
    kind = 'task',
    mode = 'append',
    dry_run = false,
  } = params

  // ctx.tools.execute 要求 signal 一定存在：注册表会读取 callerSignal.aborted。
  // 调用方没有传 signal 时，用一个永不取消的 signal 兜底，避免隐性 TypeError。
  const signal = params.signal ?? new AbortController().signal

  let agent = params.agent
  if (!agent) {
    if (!target_session_id) {
      // 若未提供 session_id，尝试寻找最新活跃会话
      const live_sessions = list_live_sessions(ctx)
      if (live_sessions.length === 0) {
        throw new Error('SESSION_NOT_LIVE: 未检测到任何活跃的 DSH 会话，请先开启会话')
      }
      agent = live_sessions[0].agent
    } else {
      agent = get_agent_by_session_id(ctx, target_session_id)
    }
  }

  if (!agent) {
    throw new Error(`SESSION_NOT_FOUND: 未找到会话 ${target_session_id}`)
  }

  if (agent.isDisposed || (agent.session && agent.session.isArchived)) {
    throw new Error('SESSION_NOT_LIVE: 目标会话已归档或已销毁，无法注入任务')
  }

  // 1. 读取目标会话当前的 Todo 清单
  const current_todos = read_current_todos(ctx, agent)

  // 2. 构造待添加的新 Todo 项 (状态一律设为 pending 避免并发冲突)
  // 按优先级从重到轻排列，保证注入到 DSH 的列表顺序也是 P0→P7
  const ordered_items = sort_items_by_priority(items)
  const additions = ordered_items.map((item) => ({
    content: build_todo_content(item, item?.kind || kind),
    status: 'pending',
  }))

  // 3. 执行合并与去重
  const { merged_todos, pushed_count, skipped_count } = merge_todos(current_todos, additions, { mode })

  // 4. 若为 dry_run 则直接返回预览结果
  if (dry_run) {
    return {
      ok: true,
      target_session_id: agent.session?.id ?? target_session_id,
      mode,
      requested: items.length,
      pushed: pushed_count,
      skipped: skipped_count,
      dry_run: true,
      todos: merged_todos,
      counts: count_todo_statuses(merged_todos),
    }
  }

  // 若无新增且无需替换整表，则无需发起写入
  if (pushed_count === 0 && mode === 'append') {
    return {
      ok: true,
      target_session_id: agent.session?.id ?? target_session_id,
      mode,
      requested: items.length,
      pushed: 0,
      skipped: skipped_count,
      todos: merged_todos,
      counts: count_todo_statuses(merged_todos),
      session_seq: agent.session?.seq ?? 0,
    }
  }

  // 5. 通过官方工具 todo_write 执行写入
  if (!ctx.tools || typeof ctx.tools.execute !== 'function') {
    throw new Error('TODO_TOOL_UNAVAILABLE: 当前环境未挂载 tools.execute 服务')
  }

  const call_id = randomUUID()
  const execute_result = await ctx.tools.execute({
    callId: call_id,
    name: 'todo_write',
    arguments: { todos: merged_todos },
    agent,
    signal,
  })

  if (execute_result && execute_result.isError) {
    const error_msg = (execute_result.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
    throw new Error(error_msg || 'TODO_WRITE_FAILED: todo_write 工具执行失败')
  }

  return {
    ok: true,
    target_session_id: agent.session?.id ?? target_session_id,
    mode,
    requested: items.length,
    pushed: pushed_count,
    skipped: skipped_count,
    todos: merged_todos,
    counts: count_todo_statuses(merged_todos),
    session_seq: agent.session?.seq ?? 0,
  }
}

/**
 * 列出当前所有活跃 (Live) 的 Agent 会话
 * @param {object} ctx Cordis Context
 * @returns {Array<{ session_id: string, live: boolean, title: string, agent: object }>}
 */
export function list_live_sessions(ctx) {
  const result = []
  const agents_service = ctx.get ? ctx.get('agents') : ctx.agents
  if (!agents_service) return result

  // 尝试不同的集合迭代机制。官方 agents 服务暴露 list()，
  // 旧实现只查 values() 会把活跃会话误判为 0 个。
  let agent_list = []
  if (typeof agents_service.list === 'function') {
    agent_list = agents_service.list()
  } else if (typeof agents_service.values === 'function') {
    agent_list = Array.from(agents_service.values())
  } else if (Array.isArray(agents_service)) {
    agent_list = agents_service
  } else if (agents_service instanceof Map) {
    agent_list = Array.from(agents_service.values())
  } else if (typeof agents_service.entries === 'function') {
    agent_list = Array.from(agents_service.entries()).map(([, val]) => val)
  }

  for (const agent of agent_list) {
    if (!agent || agent.isDisposed) continue
    const session = agent.session
    if (!session || session.isArchived) continue

    const session_id = session.id || agent.id
    if (!session_id) continue

    result.push({
      session_id,
      live: true,
      title: session.title || session.name || `会话 ${session_id.slice(0, 8)}`,
      agent,
    })
  }

  return result
}

/**
 * 根据 session_id 获取对应的 Agent 实例
 * @param {object} ctx Cordis Context
 * @param {string} session_id
 * @returns {object|null}
 */
export function get_agent_by_session_id(ctx, session_id) {
  if (!session_id) return null
  const agents_service = ctx.get ? ctx.get('agents') : ctx.agents
  if (!agents_service) return null

  if (typeof agents_service.get === 'function') {
    const found = agents_service.get(session_id)
    if (found) return found
  }

  // 迭代匹配
  const all_sessions = list_live_sessions(ctx)
  const matched = all_sessions.find((item) => item.session_id === session_id)
  return matched ? matched.agent : null
}

function count_todo_statuses(todos = []) {
  let pending = 0
  let in_progress = 0
  let completed = 0
  for (const item of todos) {
    if (item.status === 'in_progress') in_progress += 1
    else if (item.status === 'completed') completed += 1
    else pending += 1
  }
  return { pending, inProgress: in_progress, completed }
}

function get_priority_chinese_label(priority) {
  const p = (priority || 'p3').toLowerCase()
  const map = {
    p0: 'P0·最高',
    p1: 'P1·极高',
    p2: 'P2·紧急',
    p3: 'P3·普通',
    p4: 'P4·较低',
    p5: 'P5·低',
    p6: 'P6·微弱',
    p7: 'P7·备忘',
    high: 'P0·最高',
    medium: 'P3·普通',
    low: 'P5·低',
  }
  return map[p] || 'P3·普通'
}

function format_timestamp(timestamp) {
  if (!timestamp) return ''
  try {
    const d = new Date(timestamp)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  } catch {
    return String(timestamp)
  }
}
