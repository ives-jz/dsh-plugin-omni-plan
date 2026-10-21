/**
 * 注入任务跨轮次保活（sticky todos）。
 *
 * DSH 的 `todos` 投影会在每次 `turn/start` 时重置为 null，
 * 导致注入的 Omni Plan 任务在下一轮聊天里从面板消失。
 *
 * 本模块：
 * - 监听 `session/event`：任何 `todo/write` 里带 `ref=omni:task:...` 的条目都会被记为“注入项”；
 * - 监听 `turn/start`：把仍未完成的注入项重新写回 todo 列表（保持渲染）；
 * - 监听看板 `change`：任务被标记完成（人类或 AI）后，把它从列表移除，全部完成时清空面板。
 *
 * 完成判定以 Omni Plan 看板的任务状态为准：status === 'done' 即视为完成。
 */

import { randomUUID } from 'node:crypto'
import { build_todo_content, read_current_todos, read_latest_todo_snapshot } from './dsh-todos.js'

const REF_PATTERN = /ref=(omni:task:[a-z0-9_-]+)/i

/**
 * @param {object} options
 * @param {import('@deepseek-ai/cordis').Context} options.ctx
 * @param {object} options.store Omni Plan store
 * @param {object} [options.logger]
 */
export function create_sticky_todos({ ctx, store, logger }) {
  const refs_by_session = new Map()
  const busy = new Set()
  const pending = new Set()
  let timer = null
  let disposed = false

  const warn = (error) => {
    logger?.warn?.(`[omni-plan] sticky todos: ${error instanceof Error ? error.message : String(error)}`)
  }

  function session_agent(session_id) {
    const agents = ctx.get ? ctx.get('agents') : ctx.agents
    return agents && typeof agents.get === 'function' ? agents.get(session_id) : null
  }

  /** 记录一条清单里的 Omni Plan 引用。 */
  function note(session_id, todos) {
    if (!session_id || !Array.isArray(todos) || todos.length === 0) return
    const set = refs_by_session.get(session_id) ?? new Set()
    let added = false
    for (const todo of todos) {
      if (!todo || typeof todo.content !== 'string') continue
      const match = REF_PATTERN.exec(todo.content)
      if (match !== null && !set.has(match[1])) {
        set.add(match[1])
        added = true
      }
    }
    if (added || !refs_by_session.has(session_id)) refs_by_session.set(session_id, set)
  }

  function schedule(session_id) {
    if (!session_id || disposed) return
    pending.add(session_id)
    if (timer === null) timer = setTimeout(flush, 60)
  }

  async function flush() {
    timer = null
    const ids = [...pending]
    pending.clear()
    for (const id of ids) {
      try {
        await rebuild(id)
      } catch (error) {
        warn(error)
      }
    }
  }

  function same_list(left, right) {
    if (left === null) return right.length === 0
    if (left.length !== right.length) return false
    return left.every((item, index) => item.content === right[index].content && item.status === right[index].status)
  }

  /** 按看板当前状态重建该会话的注入列表。 */
  async function rebuild(session_id) {
    if (disposed || busy.has(session_id)) return
    const refs = refs_by_session.get(session_id)
    if (!refs || refs.size === 0) return
    busy.add(session_id)
    try {
      const agent = session_agent(session_id)
      if (!agent) return
      const snapshot = store.snapshot()
      const tasks = snapshot.state.tasks || []
      const todos = []
      for (const ref of [...refs]) {
        const task_id = ref.slice('omni:task:'.length)
        const task = tasks.find((item) => item.id === task_id)
        if (!task || task.status === 'done') {
          refs.delete(ref)
          continue
        }
        todos.push({ content: build_todo_content(task, 'task'), status: 'pending' })
      }
      // 用“投影当前状态”比较：turn/start 已把投影清空时，即使内容与上一条事件相同也要重写，
      // 否则面板会继续空着。
      const current = read_current_todos(ctx, agent)
      if (same_list(current, todos)) return
      await ctx.tools.execute({
        callId: randomUUID(),
        name: 'todo_write',
        arguments: { todos },
        agent,
        signal: new AbortController().signal,
      })
    } finally {
      busy.delete(session_id)
    }
  }

  const disposers = []
  if (typeof ctx.on === 'function') {
    disposers.push(ctx.on('session/event', (session, event) => {
      if (!session || !event) return
      if (event.type === 'todo/write') {
        note(session.id, event.data?.todos)
      } else if (event.type === 'turn/start') {
        // 新轮次开始：投影已被重置，把未完成的注入项补回去。
        if (!refs_by_session.has(session.id)) {
          const latest = read_latest_todo_snapshot(session_agent(session.id))
          if (latest) note(session.id, latest)
        }
        schedule(session.id)
      }
    }))
  }

  const on_change = () => {
    for (const session_id of refs_by_session.keys()) schedule(session_id)
  }
  store.on('change', on_change)

  return {
    dispose() {
      disposed = true
      if (timer !== null) clearTimeout(timer)
      store.off?.('change', on_change)
      for (const disposer of disposers) {
        try {
          disposer?.()
        } catch {
          // ignore
        }
      }
    },
    note,
    refresh: (session_id) => schedule(session_id),
  }
}
