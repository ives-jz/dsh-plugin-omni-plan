/**
 * Host half of dsh-plugin-omni-plan.
 *
 * Responsibilities:
 *   - mount the four shared `plan_*` tools into every DSH session,
 *   - serve the same operations to the Web Client over local REST + SSE,
 *   - expose a stateless MCP Streamable HTTP endpoint and a legacy HTTP+SSE
 *     endpoint for external AI clients,
 *   - broadcast change/reminder frames so every open board refreshes in <500ms.
 *
 * No third-party runtime dependency is used: the plugin only relies on Node
 * built-ins plus the Cordis services `tools` and `webServer`.
 */

import { randomUUID, timingSafeEqual } from 'node:crypto'
import { spawn } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AGENT_STATUSES,
  IDEA_SOURCES,
  PlanNotFoundError,
  PlanStoreError,
  PlanValidationError,
  TASK_PRIORITIES,
  TASK_STATUSES,
  openStore,
  summarizeState,
} from './store.js'
import {
  build_todo_content,
  extract_todo_ref,
  get_agent_by_session_id,
  list_live_sessions,
  merge_todos,
  push_to_dsh_todos,
  read_current_todos,
  read_latest_todo_snapshot,
} from './dsh-todos.js'
import {
  apply_organization_result,
  dispatch_organize_request,
  get_organize_request_status,
} from './dsh-organize.js'
import { create_sticky_todos } from './dsh-sticky.js'

const PACKAGE = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const SERVER_NAME = 'dsh-plugin-omni-plan'
const SERVER_VERSION = PACKAGE.version ?? '0.1.0'
const MCP_PROTOCOL_VERSIONS = new Set(['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25'])
const MCP_LATEST_PROTOCOL = '2025-11-25'
const DEFAULT_BASE_PATH = '/omni-plan'
const DEFAULT_BODY_LIMIT = 128 * 1024
const HEARTBEAT_SSE = ': keepalive\n\n'

export const name = SERVER_NAME
export const inject = ['tools', 'webServer', 'agents']

/* --------------------------------------------------------------------------
 * JSON Schemas shared by ctx.tools and MCP tools/list
 * ------------------------------------------------------------------------ */

const INTEGER = { type: 'integer' }
const NULLABLE_INTEGER = { oneOf: [{ type: 'integer' }, { type: 'null' }] }

const CONTEXT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'workspace', 'agentStatus', 'currentDoing', 'nextActionForHuman', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    workspace: { type: 'string' },
    agentStatus: { type: 'string', enum: [...AGENT_STATUSES] },
    currentDoing: { type: 'string' },
    nextActionForHuman: { type: 'string' },
    updatedAt: INTEGER,
  },
}

const TASK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'title', 'status', 'priority', 'remindAt', 'notes', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    priority: { type: 'string', enum: [...TASK_PRIORITIES] },
    remindAt: NULLABLE_INTEGER,
    notes: { type: 'string' },
    createdAt: INTEGER,
    updatedAt: INTEGER,
    completedAt: INTEGER,
  },
}

const IDEA_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'content', 'source', 'createdAt'],
  properties: {
    id: { type: 'string' },
    content: { type: 'string' },
    source: { type: 'string', enum: [...IDEA_SOURCES] },
    createdAt: INTEGER,
  },
}

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'contexts', 'running', 'waitingUser', 'idle',
    'tasks', 'todo', 'inProgress', 'done', 'blocked',
    'inbox', 'overdueReminders', 'nextReminderAt',
  ],
  properties: {
    contexts: INTEGER,
    running: INTEGER,
    waitingUser: INTEGER,
    idle: INTEGER,
    tasks: INTEGER,
    todo: INTEGER,
    inProgress: INTEGER,
    done: INTEGER,
    blocked: INTEGER,
    inbox: INTEGER,
    overdueReminders: INTEGER,
    nextReminderAt: NULLABLE_INTEGER,
  },
}

const OVERVIEW_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'revision', 'updatedAt', 'activeContexts', 'tasks', 'inbox', 'summary'],
  properties: {
    ok: { type: 'boolean' },
    revision: INTEGER,
    updatedAt: INTEGER,
    activeContexts: { type: 'array', items: CONTEXT_SCHEMA },
    tasks: { type: 'array', items: TASK_SCHEMA },
    inbox: { type: 'array', items: IDEA_SCHEMA },
    summary: SUMMARY_SCHEMA,
  },
}

const CONTEXT_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'message', 'revision', 'updatedAt', 'context', 'summary'],
  properties: {
    ok: { type: 'boolean' },
    message: { type: 'string' },
    revision: INTEGER,
    updatedAt: INTEGER,
    context: CONTEXT_SCHEMA,
    summary: SUMMARY_SCHEMA,
  },
}

const TASK_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'message', 'revision', 'updatedAt', 'summary'],
  properties: {
    ok: { type: 'boolean' },
    message: { type: 'string' },
    revision: INTEGER,
    updatedAt: INTEGER,
    task: TASK_SCHEMA,
    removedTaskId: { type: 'string' },
    summary: SUMMARY_SCHEMA,
  },
}

const IDEA_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'message', 'revision', 'updatedAt', 'idea', 'summary'],
  properties: {
    ok: { type: 'boolean' },
    message: { type: 'string' },
    revision: INTEGER,
    updatedAt: INTEGER,
    idea: IDEA_SCHEMA,
    summary: SUMMARY_SCHEMA,
  },
}

const EMPTY_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {},
}

const CONTEXT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['workspace', 'agentStatus', 'currentDoing', 'nextActionForHuman'],
  properties: {
    workspace: {
      type: 'string',
      description: 'A stable project/window name, e.g. "DSH · Omni Plan" or "Cursor · billing-api". Upsert is keyed by this value.',
    },
    agentStatus: {
      type: 'string',
      enum: [...AGENT_STATUSES],
      description: 'running = AI is working; waiting_user = AI needs you; idle = nothing is running.',
    },
    currentDoing: {
      type: 'string',
      description: 'What the AI is doing right now in that workspace. Keep it specific and short.',
    },
    nextActionForHuman: {
      type: 'string',
      description: 'The recovery anchor: exactly what the human should do when they return. Write the next concrete action, not a status.',
    },
  },
}

const TASK_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['action'],
  properties: {
    action: { type: 'string', enum: ['add', 'update', 'complete', 'delete'] },
    taskId: { type: 'string', description: 'Required for update/complete/delete; optional when adding.' },
    title: { type: 'string', description: 'Task title. Required for add; optional for update.' },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    priority: { type: 'string', enum: [...TASK_PRIORITIES] },
    remindAt: {
      oneOf: [{ type: 'string' }, { type: 'integer' }, { type: 'null' }],
      description: 'ISO-8601 date-time or epoch milliseconds. null/empty clears the reminder. Reminders stop when a task is done.',
    },
    notes: { type: 'string', description: 'Context, acceptance criteria, links, or AI progress notes.' },
  },
}

const IDEA_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['content'],
  properties: {
    content: { type: 'string', description: 'One flash thought or unprocessed to-do. Capture the thought verbatim; do not expand it into a plan.' },
    source: { type: 'string', enum: [...IDEA_SOURCES], description: 'Who captured it. Defaults to human.' },
  },
}

function renderToolValue(_args, value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function genericCall(title, kind, args) {
  return { card: 'generic', title, kind, rawInput: args }
}

const PLAN_TOOL_SPECS = [
  {
    name: 'plan_get_overview',
    description:
      'Read the shared Omni Plan board: every active-context recovery anchor, all tasks (including reminders and notes), and the quick inbox. Call this when you need to know what the human is working on, what is blocked, or which task to pick up next. The data is shared by every DSH session and external MCP client.',
    parameters: EMPTY_PARAMETERS,
    outputSchema: OVERVIEW_OUTPUT_SCHEMA,
    readOnly: true,
    callTitle: 'Read Omni Plan overview',
    callKind: 'read',
  },
  {
    name: 'plan_upsert_context',
    description:
      'Create or update the Active Focus anchor for one workspace/window. Call it immediately before starting a long-running task (agentStatus=running), when you need the human (waiting_user), and when you are idle (idle). Always write a concrete nextActionForHuman so the human can recover context after switching windows.',
    parameters: CONTEXT_PARAMETERS,
    outputSchema: CONTEXT_OUTPUT_SCHEMA,
    callTitle: 'Update Omni Plan focus anchor',
    callKind: 'edit',
  },
  {
    name: 'plan_manage_task',
    description:
      'Add, update, complete, or delete one plan task atomically. Use add with title/status/priority/remindAt/notes; use update with taskId plus any changed fields; use complete to mark a task done; use delete to remove it. Prefer updating an existing task over creating duplicates. Notes are the right place for AI progress and acceptance criteria.',
    parameters: TASK_PARAMETERS,
    outputSchema: TASK_OUTPUT_SCHEMA,
    callTitle: 'Manage Omni Plan task',
    callKind: 'edit',
  },
  {
    name: 'plan_capture_idea',
    description:
      'Capture a flash thought, interruption, or unprocessed to-do into the shared inbox without derailing the current work. Use it whenever the human says "remember this", "later", or a new idea appears. Do not turn the idea into tasks; capture it verbatim so it can be triaged later.',
    parameters: IDEA_PARAMETERS,
    outputSchema: IDEA_OUTPUT_SCHEMA,
    callTitle: 'Capture Omni Plan idea',
    callKind: 'other',
  },
  {
    name: 'plan_push_to_dsh_todos',
    description:
      'Copy selected Omni Plan items into the current DSH session todo list so they appear in the UI. Call this when the user asks to sync tasks to the DSH session todo list.',
    parameters: {
      type: 'object',
      properties: {
        itemIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional task IDs to push. If omitted, all open tasks are pushed.',
        },
        mode: {
          type: 'string',
          enum: ['append', 'replace'],
          description: 'Default is append (preserves existing todos). Use replace only when explicitly requested.',
        },
        includeFocus: {
          type: 'boolean',
          description: 'Whether to also push the active workspace focus anchor. Defaults to true.',
        },
        includeCompleted: {
          type: 'boolean',
          description: 'Whether to include completed tasks. Defaults to false.',
        },
      },
    },
    outputSchema: {
      type: 'object',
      required: ['ok', 'pushed', 'skipped'],
      properties: {
        ok: { type: 'boolean' },
        pushed: { type: 'integer' },
        skipped: { type: 'integer' },
        targetSessionId: { type: 'string' },
      },
    },
    readOnly: false,
    callTitle: 'Push to DSH session todos',
    callKind: 'mutate',
  },
  {
    name: 'plan_apply_organization',
    description:
      'Apply structured AI organization results back to Omni Plan and optionally push to DSH todos. Two entry points: when responding to an <omni-plan-organize-request>, pass its requestId; in a normal chat where the human asks you to organize the board, first read plan_get_overview, then call this with items derived from it and omit requestId.',
    parameters: {
      type: 'object',
      required: ['items'],
      properties: {
        requestId: { type: 'string', description: 'Only needed when answering an <omni-plan-organize-request>; omit it for chat-driven organizing.' },
        summary: { type: 'string', description: 'Short summary of the organization' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['title'],
            properties: {
              sourceRef: { type: 'string' },
              title: { type: 'string' },
              purpose: { type: 'string' },
              preconditions: { type: 'array', items: { type: 'string' } },
              assumptions: { type: 'array', items: { type: 'string' } },
              risks: { type: 'array', items: { type: 'string' } },
              priority: { type: 'string' },
              status: { type: 'string' },
              notes: { type: 'string' },
              questions: { type: 'array', items: { type: 'string' } },
              actions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        focus: {
          type: 'object',
          properties: {
            nextActionForHuman: { type: 'string' },
          },
        },
        consumeInbox: { type: 'boolean', description: 'Whether to remove source ideas from inbox. Defaults to true.' },
        pushToDsh: { type: 'boolean', description: 'Whether to sync to DSH session todos. Defaults to true.' },
      },
    },
    outputSchema: {
      type: 'object',
      required: ['ok', 'created_task_count'],
      properties: {
        ok: { type: 'boolean' },
        created_task_count: { type: 'integer' },
        pushed_to_dsh_count: { type: 'integer' },
        summary: { type: 'string' },
      },
    },
    readOnly: false,
    callTitle: 'Apply organized plan items',
    callKind: 'mutate',
  },
  {
    name: 'plan_get_dsh_todos',
    description:
      'Read the current DSH session todo list, including the last injected Omni Plan snapshot even after a new turn reset the todo projection. Use it when the human asks what was injected into this session or when you need the exact injected items after a turn boundary.',
    parameters: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      required: ['ok', 'todos'],
      properties: {
        ok: { type: 'boolean' },
        todos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              status: { type: 'string' },
            },
          },
        },
        counts: { type: 'object' },
        source: { type: 'string' },
      },
    },
    readOnly: true,
    callTitle: 'Read DSH session todos',
    callKind: 'read',
  },
]

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asArgs(value) {
  return isPlainObject(value) ? value : {}
}

/** Execute one shared plan operation and shape its model-facing value. */
async function executePlanTool(store, toolName, rawArgs, meta) {
  const args = asArgs(rawArgs)
  if (toolName === 'plan_get_overview') {
    const snapshot = store.snapshot()
    return {
      ok: true,
      revision: snapshot.revision,
      updatedAt: snapshot.updatedAt,
      activeContexts: snapshot.state.activeContexts,
      tasks: snapshot.state.tasks,
      inbox: snapshot.state.inbox,
      summary: summarizeState(snapshot.state),
    }
  }

  if (toolName === 'plan_upsert_context') {
    const result = await store.upsertContext(
      {
        workspace: args.workspace,
        agentStatus: args.agentStatus,
        currentDoing: args.currentDoing,
        nextActionForHuman: args.nextActionForHuman,
      },
      meta,
    )
    return {
      ok: true,
      message: `Focus anchor saved for "${result.context.workspace}".`,
      revision: result.revision,
      updatedAt: result.updatedAt,
      context: result.context,
      summary: summarizeState(result.state),
    }
  }

  if (toolName === 'plan_manage_task') {
    const result = await store.manageTask(
      {
        action: args.action,
        taskId: args.taskId,
        title: args.title,
        status: args.status,
        priority: args.priority,
        remindAt: args.remindAt,
        notes: args.notes,
      },
      meta,
    )
    if (args.action === 'delete') {
      return {
        ok: true,
        message: `Task ${result.removedTaskId} deleted.`,
        revision: result.revision,
        updatedAt: result.updatedAt,
        removedTaskId: result.removedTaskId,
        summary: summarizeState(result.state),
      }
    }
    const verb = args.action === 'add' ? 'added' : args.action === 'complete' ? 'completed' : 'updated'
    return {
      ok: true,
      message: `Task "${result.task.title}" ${verb}.`,
      revision: result.revision,
      updatedAt: result.updatedAt,
      task: result.task,
      summary: summarizeState(result.state),
    }
  }

  if (toolName === 'plan_capture_idea') {
    const result = await store.captureIdea(
      {
        content: args.content,
        source: args.source ?? meta.ideaSource ?? 'human',
      },
      meta,
    )
    return {
      ok: true,
      message: 'Idea captured in the Omni Plan inbox.',
      revision: result.revision,
      updatedAt: result.updatedAt,
      idea: result.idea,
      summary: summarizeState(result.state),
    }
  }

  throw new PlanValidationError(`unknown Omni Plan tool: ${toolName}`)
}

/** Build fresh ToolDefinition objects for the current store. */
function buildToolDefinitions(store, ctx) {
  return PLAN_TOOL_SPECS.map((spec) => ({
    name: spec.name,
    description: spec.description,
    parameters: spec.parameters,
    timeoutMs: 20000,
    ...(spec.readOnly ? { isConcurrencySafe: () => true } : {}),
    output: {
      schema: spec.outputSchema,
      render: renderToolValue,
    },
    async execute(args, exec) {
      if (exec?.signal?.aborted) throw new Error('Omni Plan tool call aborted')
      if (spec.name === 'plan_apply_organization') {
        return await apply_organization_result(ctx, store, {
          request_id: args.requestId,
          summary: args.summary,
          items: args.items,
          focus: args.focus,
          consume_inbox: args.consumeInbox !== false,
          push_to_dsh: args.pushToDsh !== false,
          agent: exec?.agent,
          signal: exec?.signal,
        })
      }
      if (spec.name === 'plan_push_to_dsh_todos') {
        const snapshot = store.snapshot()
        let items_to_push = []
        if (Array.isArray(args.itemIds) && args.itemIds.length > 0) {
          const id_set = new Set(args.itemIds)
          items_to_push = snapshot.state.tasks.filter((t) => id_set.has(t.id))
        } else {
          items_to_push = snapshot.state.tasks.filter((t) => {
            if (!args.includeCompleted && t.status === 'done') return false
            return true
          })
        }
        return await push_to_dsh_todos(ctx, {
          agent: exec?.agent,
          items: items_to_push,
          kind: 'task',
          mode: args.mode || 'append',
          signal: exec?.signal,
        })
      }
      if (spec.name === 'plan_get_dsh_todos') {
        const projection_todos = read_current_todos(ctx, exec?.agent)
        const snapshot_todos = read_latest_todo_snapshot(exec?.agent)
        const todos = projection_todos.length > 0 ? projection_todos : (snapshot_todos ?? [])
        const counts = { pending: 0, inProgress: 0, completed: 0 }
        for (const todo of todos) {
          if (todo.status === 'in_progress') counts.inProgress += 1
          else if (todo.status === 'completed') counts.completed += 1
          else counts.pending += 1
        }
        return {
          ok: true,
          todos,
          counts,
          source: projection_todos.length > 0 ? 'projection' : (snapshot_todos === null ? 'empty' : 'todo-write'),
        }
      }
      const actor = exec?.agent?.id === undefined ? 'dsh-agent' : String(exec.agent.id)
      return executePlanTool(store, spec.name, args, {
        kind: 'tool',
        action: spec.name,
        origin: 'dsh-agent',
        actor,
        ideaSource: 'dsh-agent',
      })
    },
    presentCall(args) {
      return genericCall(spec.callTitle, spec.callKind, args)
    },
  }))
}

/* --------------------------------------------------------------------------
 * HTTP helpers and trust policy
 * ------------------------------------------------------------------------ */

class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

function numberOption(value, fallback, min, max) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

function normalizeHostConfig(input) {
  const config = isPlainObject(input) ? input : {}
  const trustedHostsRaw = Array.isArray(config.trustedHosts)
    ? config.trustedHosts
    : String(config.trustedHosts ?? '').split(',')
  return {
    dataDir: typeof config.dataDir === 'string' ? config.dataDir : '',
    pollIntervalMs: numberOption(config.pollIntervalMs, 500, 500, 60000),
    debounceMs: numberOption(config.debounceMs, 90, 30, 2000),
    lockTimeoutMs: numberOption(config.lockTimeoutMs, 8000, 1000, 60000),
    sseHeartbeatMs: numberOption(config.sseHeartbeatMs, 15000, 3000, 120000),
    reminderPollMs: numberOption(config.reminderPollMs, 5000, 1000, 60000),
    bodyLimit: numberOption(config.bodyLimit, DEFAULT_BODY_LIMIT, 4096, 2 * 1024 * 1024),
    mcpHttp: config.mcpHttp !== false,
    mcpToken: typeof config.mcpToken === 'string' ? config.mcpToken.trim() : '',
    publicBaseUrl: typeof config.publicBaseUrl === 'string' ? config.publicBaseUrl.replace(/\/+$/, '') : '',
    trustedHosts: trustedHostsRaw.map((value) => String(value).trim().toLowerCase()).filter(Boolean),
  }
}

function sendJson(res, status, value, extraHeaders = undefined) {
  if (res.headersSent) {
    try {
      res.end()
    } catch {
      // ignored
    }
    return
  }
  const body = JSON.stringify(value)
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, no-transform',
    'content-length': Buffer.byteLength(body),
    'x-content-type-options': 'nosniff',
    ...(extraHeaders ?? {}),
  }
  res.writeHead(status, headers)
  res.end(body)
}

function sendEmpty(res, status, extraHeaders = undefined) {
  if (res.headersSent) {
    try {
      res.end()
    } catch {
      // ignored
    }
    return
  }
  res.writeHead(status, {
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...(extraHeaders ?? {}),
  })
  res.end()
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function sendApiError(res, error, logger) {
  if (res.headersSent) {
    try {
      res.end()
    } catch {
      // ignored
    }
    return
  }
  let status = 500
  let code = 'INTERNAL_ERROR'
  if (error instanceof HttpError) {
    status = error.status
    code = error.code
  } else if (error instanceof PlanValidationError) {
    status = 400
    code = error.code
  } else if (error instanceof PlanNotFoundError) {
    status = 404
    code = error.code
  } else if (error instanceof PlanStoreError) {
    status = error.code === 'LOCK_TIMEOUT' ? 503 : 500
    code = error.code
  }
  if (status >= 500) logger?.error?.(`[omni-plan] HTTP error: ${error?.stack ?? errorMessage(error)}`)
  const message = status >= 500 && code === 'INTERNAL_ERROR'
    ? `internal Omni Plan error: ${errorMessage(error)}`
    : errorMessage(error)
  sendJson(res, status, { ok: false, error: { code, message } })
}

function methodNotAllowed(res, methods) {
  sendJson(res, 405, { ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'method not allowed' } }, {
    allow: methods.join(', '),
  })
}

async function readBodyText(req, limit) {
  const declared = Number(req.headers?.['content-length'])
  if (Number.isFinite(declared) && declared > limit) {
    throw new HttpError(413, 'BODY_TOO_LARGE', `request body exceeds ${limit} bytes`)
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > limit) throw new HttpError(413, 'BODY_TOO_LARGE', `request body exceeds ${limit} bytes`)
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '')
}

async function readJsonBody(req, limit) {
  const contentType = String(req.headers?.['content-type'] ?? '').toLowerCase()
  if (!contentType.includes('application/json') && !contentType.includes('+json')) {
    throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json')
  }
  const text = await readBodyText(req, limit)
  if (text.trim() === '') throw new HttpError(400, 'EMPTY_BODY', 'request body must be a JSON object')
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new HttpError(400, 'INVALID_JSON', `invalid JSON body: ${errorMessage(error)}`)
  }
}

function loopbackHostname(hostname) {
  const value = String(hostname ?? '').toLowerCase()
  return value === 'localhost' || value === '127.0.0.1' || value === '::1' || value === '[::1]'
}

function normalizeAuthority(url) {
  const port = url.port !== '' ? url.port : url.protocol === 'https:' ? '443' : '80'
  return `${url.hostname.toLowerCase()}:${port}`
}

function requestIsTrusted(req, settings) {
  try {
    const rawHost = req.headers?.host
    if (typeof rawHost !== 'string' || rawHost === '') return false
    const hostUrl = new URL(`http://${rawHost}`)
    const trustedAuthority = settings.trustedHosts.includes(hostUrl.host.toLowerCase())
    if (!loopbackHostname(hostUrl.hostname) && !trustedAuthority) return false

    const origin = req.headers?.origin
    if (origin === undefined || origin === '') return true
    let originUrl
    try {
      originUrl = new URL(String(origin))
    } catch {
      return false
    }
    if (originUrl.protocol === 'dsh-app:') return true
    if (!loopbackHostname(originUrl.hostname) && !trustedAuthority) return false
    return normalizeAuthority(originUrl) === normalizeAuthority(hostUrl)
  } catch {
    return false
  }
}

function mcpTokenOf(req, url) {
  const authorization = String(req.headers?.authorization ?? '')
  if (/^Bearer\s+/i.test(authorization)) return authorization.replace(/^Bearer\s+/i, '').trim()
  return url.searchParams.get('token') ?? ''
}

function tokenMatches(provided, expected) {
  if (expected === '') return true
  const left = Buffer.from(String(provided))
  const right = Buffer.from(String(expected))
  if (left.length !== right.length) return false
  try {
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}

function requestBaseUrl(req, settings) {
  if (settings.publicBaseUrl !== '') return settings.publicBaseUrl
  const forwarded = String(req.headers?.['x-forwarded-proto'] ?? '').split(',')[0].trim().toLowerCase()
  const protocol = forwarded === 'https' || forwarded === 'http'
    ? forwarded
    : (req.socket?.encrypted === true ? 'https' : 'http')
  return `${protocol}://${req.headers?.host ?? '127.0.0.1'}`
}

/* --------------------------------------------------------------------------
 * SSE hub for the in-DSH board
 * ------------------------------------------------------------------------ */

class BoardEventHub {
  constructor({ heartbeatMs, logger }) {
    this.logger = logger
    this.clients = new Set()
    this.sequence = 0
    this.onClient = null
    this.heartbeat = setInterval(() => {
      for (const client of this.clients) {
        try {
          client.res.write(HEARTBEAT_SSE)
        } catch {
          this._drop(client)
        }
      }
    }, heartbeatMs)
    this.heartbeat.unref?.()
  }

  get size() {
    return this.clients.size
  }

  add(req, res, snapshot) {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
      'x-content-type-options': 'nosniff',
    })
    res.write('retry: 3000\n\n')
    res.flushHeaders?.()
    const client = { res }
    this.clients.add(client)

    const cleanup = () => this._drop(client)
    req.once('close', cleanup)
    req.once('aborted', cleanup)
    res.once('close', cleanup)
    res.once('error', cleanup)

    this._write(client, 'snapshot', {
      state: snapshot.state,
      revision: snapshot.revision,
      updatedAt: snapshot.updatedAt,
      serverTime: Date.now(),
      change: null,
    })
    setTimeout(() => {
      try {
        this.onClient?.()
      } catch {
        // A reminder callback must never break the SSE stream.
      }
    }, 0).unref?.()
  }

  _write(client, event, data) {
    const id = String(++this.sequence)
    let frame = `id: ${id}\n`
    if (event) frame += `event: ${event}\n`
    for (const line of JSON.stringify(data).split('\n')) frame += `data: ${line}\n`
    frame += '\n'
    try {
      client.res.write(frame)
      return true
    } catch {
      this._drop(client)
      return false
    }
  }

  broadcast(event, data) {
    let delivered = 0
    for (const client of [...this.clients]) {
      if (this._write(client, event, data)) delivered += 1
    }
    return delivered
  }

  _drop(client) {
    this.clients.delete(client)
    try {
      client.res.end()
    } catch {
      // ignored
    }
  }

  closeAll() {
    for (const client of [...this.clients]) this._drop(client)
    clearInterval(this.heartbeat)
  }
}

/* --------------------------------------------------------------------------
 * Reminder scanner
 * ------------------------------------------------------------------------ */

class ReminderScanner {
  constructor({ store, hub, intervalMs, logger }) {
    this.store = store
    this.hub = hub
    this.logger = logger
    this.fired = new Map()
    this.timer = setInterval(() => this.check(), intervalMs)
    this.timer.unref?.()
  }

  check() {
    if (this.hub.size === 0) return
    try {
      const state = this.store.getState()
      const now = Date.now()
      const live = new Set()
      const due = []
      for (const task of state.tasks) {
        if (task.status === 'done') continue
        if (!Number.isFinite(task.remindAt) || task.remindAt <= 0) continue
        const key = `${task.id}@${task.remindAt}`
        live.add(key)
        if (task.remindAt <= now && !this.fired.has(key)) due.push(task)
      }
      for (const key of this.fired.keys()) {
        if (!live.has(key)) this.fired.delete(key)
      }
      if (due.length === 0) return
      const delivered = this.hub.broadcast('reminder', {
        tasks: due,
        at: now,
      })
      if (delivered > 0) {
        for (const task of due) this.fired.set(`${task.id}@${task.remindAt}`, now)
      }
    } catch (error) {
      this.logger?.warn?.(`[omni-plan] reminder scan failed: ${errorMessage(error)}`)
    }
  }

  stop() {
    clearInterval(this.timer)
  }
}

/* --------------------------------------------------------------------------
 * Native OS topmost window (Windows)
 *
 * Electron's main window denies `window.open`, and Document Picture-in-Picture
 * is not a dependable OS-level window in every Electron build.  A small WPF
 * process launched by the Host gives us a genuinely separate, always-on-top
 * Windows window while still using the same REST/SSE plan data.
 * ------------------------------------------------------------------------ */

const TOPMOST_EXE_PATH = fileURLToPath(new URL('./OmniPlanTopmost.exe', import.meta.url))

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class NativeTopmostManager {
  constructor({ store, hub, logger }) {
    this.store = store
    this.hub = hub
    this.logger = logger
    this.sourceExecutablePath = TOPMOST_EXE_PATH
    this.executablePath = this._resolveExecutable()
    this.logPath = path.join(store.dataDir, 'topmost.log')
    this.child = null
    this.ready = false
    this.supported = process.platform === 'win32'
      && existsSync(this.executablePath)
  }

  _resolveExecutable() {
    // Windows may block executables on network/removable drives (e.g. A:\).
    // Mirror the helper into the local data directory so spawning always
    // happens from a trusted, writable location.
    const localExe = path.join(this.store.dataDir, 'OmniPlanTopmost.exe')
    try {
      if (existsSync(this.sourceExecutablePath)) {
        const sourceStats = statSync(this.sourceExecutablePath)
        let needsCopy = true
        if (existsSync(localExe)) {
          const localStats = statSync(localExe)
          needsCopy = sourceStats.mtimeMs > localStats.mtimeMs || sourceStats.size !== localStats.size
        }
        if (needsCopy) {
          copyFileSync(this.sourceExecutablePath, localExe)
        }
      }
    } catch (error) {
      this.logger?.warn?.(`[omni-plan] could not mirror topmost helper to data dir: ${errorMessage(error)}`)
    }
    return existsSync(localExe) ? localExe : this.sourceExecutablePath
  }

  get open() {
    return this.child !== null
  }

  status() {
    return {
      supported: this.supported,
      open: this.open,
      mode: this.supported ? 'native-windows' : null,
      pid: this.child?.pid ?? null,
    }
  }

  _broadcast(open) {
    try {
      this.hub.broadcast('topmost', {
        open,
        mode: open ? 'native-windows' : null,
        at: Date.now(),
      })
    } catch {
      // An SSE failure must not affect the native window lifecycle.
    }
  }

  async openWindow(baseUrl) {
    if (!this.supported) {
      throw new HttpError(501, 'TOPMOST_UNSUPPORTED', 'native topmost helper is missing or this is not Windows')
    }
    if (this.child !== null) return { open: true, alreadyOpen: true, pid: this.child.pid, mode: 'native-windows' }

    const readyFile = path.join(this.store.dataDir, `.topmost-ready-${randomUUID()}`)
    const args = [
      '--base-url',
      `${baseUrl}/omni-plan`,
      '--parent-pid',
      String(process.pid),
      '--width',
      '420',
      '--height',
      '700',
      '--ready-file',
      readyFile,
      '--log-file',
      this.logPath,
    ]

    let child
    try {
      child = spawn(this.executablePath, args, {
        stdio: 'ignore',
        windowsHide: true,
      })
    } catch (error) {
      throw new HttpError(500, 'TOPMOST_SPAWN_FAILED', `could not start the native topmost window: ${errorMessage(error)}`)
    }

    this.child = child
    this.ready = false
    let settled = false

    const cleanupReady = () => {
      try { unlinkSync(readyFile) } catch { /* already gone */ }
    }

    child.once('error', (error) => {
      this.logger?.warn?.(`[omni-plan] topmost process error: ${errorMessage(error)}`)
      if (this.child === child) {
        this.child = null
        this.ready = false
      }
      cleanupReady()
      if (!settled) {
        settled = true
        this._broadcast(false)
      }
    })

    child.once('exit', (code, signal) => {
      if (this.child === child) {
        this.child = null
        this.ready = false
      }
      cleanupReady()
      this.logger?.info?.(`[omni-plan] native topmost closed (code=${code ?? 'null'}, signal=${signal ?? 'null'})`)
      this._broadcast(false)
    })

    const deadline = Date.now() + 7000
    while (Date.now() < deadline) {
      if (existsSync(readyFile)) {
        cleanupReady()
        this.ready = true
        this._broadcast(true)
        return { open: true, alreadyOpen: false, pid: child.pid, mode: 'native-windows' }
      }
      if (child.exitCode !== null || this.child !== child) break
      await wait(120)
    }

    try { child.kill() } catch { /* ignored */ }
    if (this.child === child) {
      this.child = null
      this.ready = false
    }
    cleanupReady()
    throw new HttpError(
      500,
      'TOPMOST_START_FAILED',
      `native topmost window did not start; see ${this.logPath}`,
    )
  }

  closeWindow() {
    const child = this.child
    if (child === null) return { open: false }
    this.child = null
    this.ready = false
    try {
      child.kill()
    } catch {
      // A subsequent taskkill is the Windows fallback.
      try {
        spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
          stdio: 'ignore',
          windowsHide: true,
        })
      } catch {
        // ignored
      }
    }
    this._broadcast(false)
    return { open: false }
  }

  dispose() {
    this.closeWindow()
  }
}

/* --------------------------------------------------------------------------
 * MCP JSON-RPC bridge and transports
 * ------------------------------------------------------------------------ */

function jsonRpcError(id, code, message, data = undefined) {
  return {
    jsonrpc: '2.0',
    id: id === undefined ? null : id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  }
}

function mcpToolDescriptor(spec) {
  return {
    name: spec.name,
    description: spec.description,
    inputSchema: spec.parameters,
    annotations: {
      readOnlyHint: spec.readOnly === true,
      destructiveHint: spec.name === 'plan_manage_task',
      idempotentHint: spec.readOnly === true,
      openWorldHint: false,
    },
  }
}

class McpBridge {
  constructor({ store, logger }) {
    this.store = store
    this.logger = logger
  }

  async handle(message, meta = {}) {
    if (Array.isArray(message)) {
      if (message.length === 0) return jsonRpcError(null, -32600, 'Invalid Request: empty batch')
      const responses = []
      for (const entry of message) {
        const response = await this.handleOne(entry, meta)
        if (response !== null) responses.push(response)
      }
      return responses.length === 0 ? null : responses
    }
    return this.handleOne(message, meta)
  }

  async handleOne(message, meta) {
    if (!isPlainObject(message) || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
      return jsonRpcError(message?.id, -32600, 'Invalid Request: expected a JSON-RPC 2.0 object')
    }
    const hasId = Object.prototype.hasOwnProperty.call(message, 'id')
    const id = message.id
    if (!hasId) {
      // Notifications never receive a response.  `notifications/initialized`
      // is the only one clients normally send, but ignoring unknown
      // notifications is the protocol-correct behavior.
      return null
    }
    const method = message.method
    const params = isPlainObject(message.params) ? message.params : {}

    if (method === 'initialize') {
      const requested = typeof params.protocolVersion === 'string' ? params.protocolVersion : MCP_LATEST_PROTOCOL
      const protocolVersion = MCP_PROTOCOL_VERSIONS.has(requested) ? requested : MCP_LATEST_PROTOCOL
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          instructions:
            'Shared Omni Plan board for all DSH sessions and external AI clients. '
            + 'Call plan_get_overview first. Before a long job call plan_upsert_context with agentStatus="running" '
            + 'and a concrete nextActionForHuman; when you need the human switch to "waiting_user"; when finished use "idle". '
            + 'Capture interruptions with plan_capture_idea instead of losing them.',
        },
      }
    }

    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: PLAN_TOOL_SPECS.map(mcpToolDescriptor) },
      }
    }

    if (method === 'tools/call') {
      const toolName = params.name
      if (typeof toolName !== 'string' || toolName === '') {
        return jsonRpcError(id, -32602, 'Invalid params: tools/call requires a tool name')
      }
      const spec = PLAN_TOOL_SPECS.find((entry) => entry.name === toolName)
      if (spec === undefined) return jsonRpcError(id, -32602, `Unknown tool: ${toolName}`)
      if (params.arguments !== undefined && !isPlainObject(params.arguments)) {
        return jsonRpcError(id, -32602, 'Invalid params: tool arguments must be an object')
      }
      try {
        const value = await executePlanTool(this.store, toolName, params.arguments ?? {}, {
          kind: 'mcp',
          action: toolName,
          origin: 'external-mcp',
          actor: `mcp:${meta.transport ?? 'http'}`,
          ideaSource: 'external-mcp',
        })
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
            structuredContent: value,
            isError: false,
          },
        }
      } catch (error) {
        const code = error instanceof PlanValidationError || error instanceof PlanNotFoundError
          ? 'TOOL_INPUT_ERROR'
          : 'TOOL_EXECUTION_ERROR'
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `${code}: ${errorMessage(error)}` }],
            isError: true,
          },
        }
      }
    }

    return jsonRpcError(id, -32601, `Method not found: ${method}`)
  }
}

class McpHttpTransport {
  constructor({ bridge, settings, logger }) {
    this.bridge = bridge
    this.settings = settings
    this.logger = logger
    this.sessions = new Map()
    this.sequence = 0
    this.heartbeat = setInterval(() => {
      for (const session of this.sessions.values()) {
        try {
          session.res.write(HEARTBEAT_SSE)
        } catch {
          this._drop(session.id)
        }
      }
    }, settings.sseHeartbeatMs)
    this.heartbeat.unref?.()
  }

  _write(session, event, data) {
    const id = String(++this.sequence)
    let frame = `id: ${id}\n`
    if (event) frame += `event: ${event}\n`
    for (const line of JSON.stringify(data).split('\n')) frame += `data: ${line}\n`
    frame += '\n'
    session.res.write(frame)
  }

  _drop(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) return
    this.sessions.delete(sessionId)
    try {
      session.res.end()
    } catch {
      // ignored
    }
  }

  openLegacySse(req, res) {
    const sessionId = randomUUID()
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
      'x-content-type-options': 'nosniff',
    })
    res.write('retry: 3000\n\n')
    res.flushHeaders?.()
    const session = { id: sessionId, res }
    this.sessions.set(sessionId, session)
    const cleanup = () => this._drop(sessionId)
    req.once('close', cleanup)
    req.once('aborted', cleanup)
    res.once('close', cleanup)
    res.once('error', cleanup)

    const base = requestBaseUrl(req, this.settings)
    const token = this.settings.mcpToken === ''
      ? ''
      : `&token=${encodeURIComponent(this.settings.mcpToken)}`
    res.write(`event: endpoint\ndata: ${base}${DEFAULT_BASE_PATH}/mcp/messages?sessionId=${sessionId}${token}\n\n`)
  }

  async handleLegacyPost(req, res, url) {
    const sessionId = url.searchParams.get('sessionId') ?? ''
    const session = this.sessions.get(sessionId)
    if (!session) throw new HttpError(404, 'MCP_SESSION_NOT_FOUND', 'unknown or expired MCP SSE session')
    const text = await readBodyText(req, this.settings.bodyLimit)
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      this._write(session, 'message', jsonRpcError(null, -32700, `Parse error: ${errorMessage(error)}`))
      sendEmpty(res, 202)
      return
    }
    let response
    try {
      response = await this.bridge.handle(parsed, { transport: 'http-sse' })
    } catch (error) {
      response = jsonRpcError(null, -32603, `Internal error: ${errorMessage(error)}`)
    }
    if (response !== null) {
      try {
        this._write(session, 'message', response)
      } catch {
        this._drop(sessionId)
      }
    }
    sendEmpty(res, 202)
  }

  async handleStreamablePost(req, res) {
    const text = await readBodyText(req, this.settings.bodyLimit)
    if (text.trim() === '') throw new HttpError(400, 'EMPTY_BODY', 'MCP request body is empty')
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      sendJson(res, 400, jsonRpcError(null, -32700, `Parse error: ${errorMessage(error)}`))
      return
    }
    const response = await this.bridge.handle(parsed, { transport: 'http-streamable' })
    if (response === null) {
      sendEmpty(res, 202)
      return
    }
    sendJson(res, 200, response)
  }

  close() {
    for (const sessionId of [...this.sessions.keys()]) this._drop(sessionId)
    clearInterval(this.heartbeat)
  }
}

/* --------------------------------------------------------------------------
 * REST/SSE route handler
 * ------------------------------------------------------------------------ */

function requireMcpAuth(req, url, settings) {
  if (!tokenMatches(mcpTokenOf(req, url), settings.mcpToken)) {
    throw new HttpError(401, 'MCP_UNAUTHORIZED', 'invalid or missing MCP bearer token')
  }
}

function mutationResponse(result) {
  const output = {
    ok: true,
    state: result.state,
    revision: result.revision,
    updatedAt: result.updatedAt,
    change: result.change,
    summary: summarizeState(result.state),
    serverTime: Date.now(),
  }
  for (const key of ['context', 'task', 'idea', 'removedContext', 'removedTaskId', 'removedIdea']) {
    if (result[key] !== undefined) output[key] = result[key]
  }
  return output
}

function createRequestHandler({ store, settings, hub, mcpTransport, topmost, logger, ctx }) {
  const base = DEFAULT_BASE_PATH
  return async function handleRequest(req, res) {
    try {
      if (!requestIsTrusted(req, settings)) {
        throw new HttpError(403, 'UNTRUSTED_REQUEST', 'Omni Plan only accepts requests from this local DSH origin')
      }
      const url = new URL(String(req.url ?? '/'), 'http://omni-plan.local')
      const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
      if (pathname !== base && !pathname.startsWith(`${base}/`)) {
        throw new HttpError(404, 'NOT_FOUND', 'not found')
      }
      const relative = pathname === base ? '/' : pathname.slice(base.length)
      const method = String(req.method ?? 'GET').toUpperCase()
      const isMcpPath = relative === '/mcp' || relative.startsWith('/mcp/')
      if (isMcpPath) {
        if (!settings.mcpHttp || mcpTransport === null) {
          throw new HttpError(404, 'MCP_DISABLED', 'MCP HTTP transport is disabled')
        }
        requireMcpAuth(req, url, settings)
      }

      if (relative === '/' || relative === '/health') {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        return sendJson(res, 200, {
          ok: true,
          name: SERVER_NAME,
          version: SERVER_VERSION,
          revision: store.revision,
          updatedAt: store.updatedAt,
          dataDir: store.dataDir,
          sseClients: hub.size,
          mcpHttp: settings.mcpHttp,
          topmost: topmost?.status?.() ?? { supported: false, open: false, mode: null, pid: null },
          serverTime: Date.now(),
        })
      }

      if (relative === '/topmost') {
        if (method === 'GET') {
          return sendJson(res, 200, { ok: true, ...(topmost?.status?.() ?? { supported: false, open: false, mode: null, pid: null }) })
        }
        if (method === 'POST') {
          if (topmost === null || topmost === undefined) {
            throw new HttpError(501, 'TOPMOST_UNSUPPORTED', 'native topmost window is unavailable')
          }
          const result = await topmost.openWindow(requestBaseUrl(req, settings))
          return sendJson(res, 200, { ok: true, ...result })
        }
        return methodNotAllowed(res, ['GET', 'POST'])
      }

      if (relative === '/topmost/close') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        if (topmost === null || topmost === undefined) {
          throw new HttpError(501, 'TOPMOST_UNSUPPORTED', 'native topmost window is unavailable')
        }
        return sendJson(res, 200, { ok: true, ...topmost.closeWindow() })
      }

      if (relative === '/state') {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        const snapshot = store.snapshot()
        return sendJson(res, 200, {
          ok: true,
          state: snapshot.state,
          revision: snapshot.revision,
          updatedAt: snapshot.updatedAt,
          summary: summarizeState(snapshot.state),
          serverTime: Date.now(),
        })
      }

      if (relative === '/events') {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        hub.add(req, res, store.snapshot())
        return
      }

      if (relative === '/contexts') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const body = await readJsonBody(req, settings.bodyLimit)
        if (!isPlainObject(body)) throw new HttpError(400, 'INVALID_BODY', 'context body must be an object')
        const result = await store.upsertContext(body, {
          kind: 'context',
          action: 'rest-upsert',
          origin: 'human',
          actor: 'web-ui',
        })
        return sendJson(res, 200, mutationResponse(result))
      }

      let match = /^\/contexts\/([^/]+)$/.exec(relative)
      if (match) {
        const id = decodeURIComponent(match[1])
        if (method === 'PATCH' || method === 'PUT') {
          const body = await readJsonBody(req, settings.bodyLimit)
          if (!isPlainObject(body)) throw new HttpError(400, 'INVALID_BODY', 'context body must be an object')
          const result = await store.upsertContext({ ...body, id }, {
            kind: 'context',
            action: 'rest-update',
            origin: 'human',
            actor: 'web-ui',
          })
          return sendJson(res, 200, mutationResponse(result))
        }
        if (method === 'DELETE') {
          const result = await store.removeContext({ id }, {
            kind: 'context',
            action: 'rest-delete',
            origin: 'human',
            actor: 'web-ui',
          })
          return sendJson(res, 200, mutationResponse(result))
        }
        return methodNotAllowed(res, ['PATCH', 'PUT', 'DELETE'])
      }

      if (relative === '/tasks') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const body = await readJsonBody(req, settings.bodyLimit)
        if (!isPlainObject(body)) throw new HttpError(400, 'INVALID_BODY', 'task body must be an object')
        const result = await store.manageTask({ ...body, action: 'add' }, {
          kind: 'task',
          action: 'rest-add',
          origin: 'human',
          actor: 'web-ui',
        })
        return sendJson(res, 200, mutationResponse(result))
      }

      match = /^\/tasks\/([^/]+)\/complete$/.exec(relative)
      if (match) {
        const id = decodeURIComponent(match[1])
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const result = await store.manageTask({ action: 'complete', taskId: id }, {
          kind: 'task',
          action: 'rest-complete',
          origin: 'human',
          actor: 'web-ui',
        })
        return sendJson(res, 200, mutationResponse(result))
      }

      match = /^\/tasks\/([^/]+)$/.exec(relative)
      if (match) {
        const id = decodeURIComponent(match[1])
        if (method === 'PATCH' || method === 'PUT') {
          const body = await readJsonBody(req, settings.bodyLimit)
          if (!isPlainObject(body)) throw new HttpError(400, 'INVALID_BODY', 'task body must be an object')
          const result = await store.manageTask({ ...body, action: 'update', taskId: id }, {
            kind: 'task',
            action: 'rest-update',
            origin: 'human',
            actor: 'web-ui',
          })
          return sendJson(res, 200, mutationResponse(result))
        }
        if (method === 'DELETE') {
          const result = await store.manageTask({ action: 'delete', taskId: id }, {
            kind: 'task',
            action: 'rest-delete',
            origin: 'human',
            actor: 'web-ui',
          })
          return sendJson(res, 200, mutationResponse(result))
        }
        return methodNotAllowed(res, ['PATCH', 'PUT', 'DELETE'])
      }

      // ----------------------------------------------------------------------
      // DSH Todo 会话任务注入接口 (遵循《DSH任务注入接口规范.md》)
      // ----------------------------------------------------------------------
      if (relative === '/integrations/dsh-todos/sessions' || relative === '/dsh-todos/sessions') {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        const live_sessions = list_live_sessions(ctx)
        return sendJson(res, 200, {
          ok: true,
          sessions: live_sessions.map((s) => ({
            sessionId: s.session_id,
            live: s.live,
            title: s.title,
          })),
        })
      }

      if (relative === '/integrations/dsh-todos/state' || relative === '/dsh-todos/state') {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        const target_session_id = url.searchParams.get('sessionId')
        if (!target_session_id) {
          throw new HttpError(400, 'INVALID_REQUEST', 'sessionId parameter is required')
        }
        const agent = get_agent_by_session_id(ctx, target_session_id)
        if (!agent) {
          throw new HttpError(404, 'SESSION_NOT_FOUND', `session ${target_session_id} not found`)
        }
        const current_todos = read_current_todos(ctx, agent)
        let pending = 0, in_progress = 0, completed = 0
        for (const t of current_todos) {
          if (t.status === 'in_progress') in_progress += 1
          else if (t.status === 'completed') completed += 1
          else pending += 1
        }
        return sendJson(res, 200, {
          ok: true,
          sessionId: target_session_id,
          todos: current_todos,
          counts: { pending, inProgress: in_progress, completed },
          sessionSeq: agent.session?.seq ?? 0,
        })
      }

      if (relative === '/integrations/dsh-todos/push' || relative === '/dsh-todos/push') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const body = (await readJsonBody(req, settings.bodyLimit)) || {}
        if (!isPlainObject(body)) {
          throw new HttpError(400, 'INVALID_BODY', 'request body must be an object')
        }

        const target_session_id = body.targetSessionId || body.target_session_id
        const mode = body.mode || 'append'
        const dry_run = Boolean(body.dryRun ?? body.dry_run)
        const include_focus = Boolean(body.includeFocus ?? body.include_focus ?? true)
        const include_inbox = Boolean(body.includeInbox ?? body.include_inbox ?? false)
        const include_completed = Boolean(body.includeCompleted ?? body.include_completed ?? false)

        const snapshot = store.snapshot()
        let items_to_push = []
        let push_kind = body.kind || 'task'

        if (Array.isArray(body.items) && body.items.length > 0) {
          items_to_push = body.items
        } else if (body.item && typeof body.item === 'object') {
          items_to_push = [body.item]
        } else if (body.itemId) {
          const item_id = String(body.itemId)
          if (push_kind === 'idea' || push_kind === 'inbox') {
            const found = (snapshot.state.inbox || []).find((i) => i.id === item_id)
            if (found) items_to_push = [{ ...found, kind: 'idea' }]
          } else if (push_kind === 'context' || push_kind === 'focus') {
            const found = (snapshot.state.activeContexts || []).find((c) => c.id === item_id)
            if (found) items_to_push = [{ ...found, kind: 'context' }]
          } else {
            const found = (snapshot.state.tasks || []).find((t) => t.id === item_id)
            if (found) items_to_push = [{ ...found, kind: 'task' }]
          }
        } else if (Array.isArray(body.itemIds) && body.itemIds.length > 0) {
          const id_set = new Set(body.itemIds)
          items_to_push = snapshot.state.tasks.filter((t) => id_set.has(t.id))
        } else {
          items_to_push = snapshot.state.tasks.filter((t) => {
            if (!include_completed && t.status === 'done') return false
            return true
          })
        }

        const push_result = await push_to_dsh_todos(ctx, {
          target_session_id,
          items: items_to_push,
          kind: push_kind,
          mode,
          dry_run,
        })

        return sendJson(res, 200, push_result)
      }

      // ----------------------------------------------------------------------
      // DSH AI 智能总结与灵感整理接口 (遵循《DSH任务注入接口规范.md》第15节)
      // ----------------------------------------------------------------------
      if (relative === '/integrations/organize' || relative === '/organize') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const body = (await readJsonBody(req, settings.bodyLimit)) || {}
        if (!isPlainObject(body)) {
          throw new HttpError(400, 'INVALID_BODY', 'request body must be an object')
        }
        const organize_res = await dispatch_organize_request(ctx, store, {
          target_session_id: body.targetSessionId || body.target_session_id,
          scope: body.scope || 'inbox',
          item_ids: body.itemIds || body.item_ids || [],
          mode: body.mode || 'apply_and_push',
          instructions: body.instructions || '',
          max_items: body.maxItems || body.max_items || 20,
        })
        return sendJson(res, 200, organize_res)
      }

      match = /^\/(?:integrations\/)?organize\/([^/]+)$/.exec(relative)
      if (match) {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        const request_id = decodeURIComponent(match[1])
        const status_res = get_organize_request_status(request_id)
        if (!status_res) {
          throw new HttpError(404, 'NOT_FOUND', 'organize request not found or expired')
        }
        return sendJson(res, 200, status_res)
      }

      if (relative === '/inbox') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const body = await readJsonBody(req, settings.bodyLimit)
        if (!isPlainObject(body)) throw new HttpError(400, 'INVALID_BODY', 'inbox body must be an object')
        const result = await store.captureIdea({ content: body.content, source: 'human' }, {
          kind: 'inbox',
          action: 'rest-add',
          origin: 'human',
          actor: 'web-ui',
        })
        return sendJson(res, 200, mutationResponse(result))
      }

      match = /^\/inbox\/([^/]+)\/promote$/.exec(relative)
      if (match) {
        const id = decodeURIComponent(match[1])
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        const result = await store.promoteIdea({ id }, {
          kind: 'inbox',
          action: 'rest-promote',
          origin: 'human',
          actor: 'web-ui',
        })
        return sendJson(res, 200, mutationResponse(result))
      }

      match = /^\/inbox\/([^/]+)$/.exec(relative)
      if (match) {
        const id = decodeURIComponent(match[1])
        if (method !== 'DELETE') return methodNotAllowed(res, ['DELETE'])
        const result = await store.removeIdea({ id }, {
          kind: 'inbox',
          action: 'rest-delete',
          origin: 'human',
          actor: 'web-ui',
        })
        return sendJson(res, 200, mutationResponse(result))
      }

      if (relative === '/mcp') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        return await mcpTransport.handleStreamablePost(req, res)
      }

      if (relative === '/mcp/sse') {
        if (method !== 'GET') return methodNotAllowed(res, ['GET'])
        return mcpTransport.openLegacySse(req, res)
      }

      if (relative === '/mcp/messages') {
        if (method !== 'POST') return methodNotAllowed(res, ['POST'])
        return await mcpTransport.handleLegacyPost(req, res, url)
      }

      throw new HttpError(404, 'NOT_FOUND', 'not found')
    } catch (error) {
      sendApiError(res, error, logger)
    }
  }
}

/* --------------------------------------------------------------------------
 * Cordis plugin entry
 * ------------------------------------------------------------------------ */

/**
 * Mount the Omni Plan Host.  Both `tools` and `webServer` are hard dependencies;
 * Cordis will hold the plugin until they exist and dispose it with them.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {object} [config]
 */
export async function apply(ctx, config = {}) {
  const settings = normalizeHostConfig(config)
  const logger = ctx.logger ?? console
  const store = await openStore({
    dataDir: settings.dataDir,
    pollIntervalMs: settings.pollIntervalMs,
    debounceMs: settings.debounceMs,
    lockTimeoutMs: settings.lockTimeoutMs,
    logger,
  })

  // 注入任务跨轮次保活：turn/start 后自动补回未完成的注入项。
  const sticky = create_sticky_todos({ ctx, store, logger })
  ctx.effect(() => () => sticky.dispose())

  const hub = new BoardEventHub({ heartbeatMs: settings.sseHeartbeatMs, logger })
  const reminder = new ReminderScanner({
    store,
    hub,
    intervalMs: settings.reminderPollMs,
    logger,
  })
  const topmost = new NativeTopmostManager({ store, hub, logger })
  const mcpBridge = settings.mcpHttp ? new McpBridge({ store, logger }) : null
  const mcpTransport = mcpBridge === null
    ? null
    : new McpHttpTransport({ bridge: mcpBridge, settings, logger })
  const handleRequest = createRequestHandler({ store, settings, hub, mcpTransport, topmost, logger, ctx })

  const onStoreChange = (payload) => {
    hub.broadcast('change', payload)
    // Newly added overdue reminders should fire immediately rather than wait
    // for the next scanner tick.
    reminder.check()
  }
  const onStoreWarning = (warning) => {
    hub.broadcast('warning', warning)
  }
  hub.onClient = () => reminder.check()
  store.on('change', onStoreChange)
  store.on('warning', onStoreWarning)

  try {
    ctx.effect(() => {
      const disposers = []
      try {
        disposers.push(ctx.webServer.register({
          kind: 'prefix',
          path: DEFAULT_BASE_PATH,
          handler: handleRequest,
        }))
        for (const definition of buildToolDefinitions(store, ctx)) {
          disposers.push(ctx.tools.register(definition))
        }

        const systemPrompt = ctx.get ? ctx.get('systemPrompt') : ctx.systemPrompt
        if (systemPrompt && typeof systemPrompt.section === 'function') {
          try {
            disposers.push(systemPrompt.section({
              name: 'omni-plan-awareness',
              order: 55,
              text:
                'A shared Omni Plan board is available in this DSH profile. ' +
                'When the user mentions planning, tasks, active focus, next steps, or inbox, ' +
                'call plan_get_overview before answering. ' +
                'Use plan_push_to_dsh_todos to copy selected Omni Plan items into the current session todo list. ' +
                'DSH todos are per-session and only store content/status; full notes stay in Omni Plan.',
            }))
          } catch {
            // optional service failed to mount
          }
        }
        logger?.info?.(`[omni-plan] ready: ${store.statePath} (tools=4, http=${settings.mcpHttp ? 'rest+sse+mcp' : 'rest+sse'})`)
        return async () => {
          reminder.stop()
          topmost.dispose()
          store.off('change', onStoreChange)
          store.off('warning', onStoreWarning)
          mcpTransport?.close()
          hub.closeAll()
          for (const dispose of disposers.reverse()) {
            try {
              dispose()
            } catch (error) {
              logger?.warn?.(`[omni-plan] disposer failed: ${errorMessage(error)}`)
            }
          }
          await store.close()
        }
      } catch (error) {
        for (const dispose of disposers.reverse()) {
          try {
            dispose()
          } catch {
            // ignored while unwinding a failed activation
          }
        }
        throw error
      }
    }, 'dsh-plugin-omni-plan: host resources')
  } catch (error) {
    reminder.stop()
    topmost.dispose()
    store.off('change', onStoreChange)
    store.off('warning', onStoreWarning)
    mcpTransport?.close()
    hub.closeAll()
    await store.close()
    throw error
  }
}

// Reused by `lib/mcp-stdio.js` so the stdio MCP server and the DSH tools can
// never drift apart.  Importing this module has no Cordis side effects.
export { McpBridge, PLAN_TOOL_SPECS, SERVER_NAME, SERVER_VERSION, executePlanTool }

