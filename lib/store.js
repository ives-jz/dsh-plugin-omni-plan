/**
 * Omni Plan state engine.
 *
 * One JSON document is shared by:
 *   - the DSH Host process (ctx.tools + REST/SSE/MCP),
 *   - every other DSH profile that points at the same directory,
 *   - the standalone stdio MCP process (`lib/mcp-stdio.js`).
 *
 * Correctness rules:
 *   1. Every mutation takes an exclusive lock file and re-reads the disk inside
 *      the lock, so two processes cannot lose each other's writes.
 *   2. Writes are atomic (temp file + rename), so a reader never sees partial JSON.
 *   3. A directory watcher plus a cheap polling fallback observe writes made by
 *      external MCP processes, then emit a normalised `change` event.
 *   4. The in-process promise queue serialises mutations owned by one process.
 *
 * The default data path is `~/.dsh/omni-plan/state.json`.  Set
 * `OMNI_PLAN_DIR` or pass `dataDir` to share a different directory.
 */

import { createHash, randomBytes } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { promises as fs, watch as watchDirectory } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const SCHEMA_VERSION = 1
export const STATE_FILE_NAME = 'state.json'
export const LOCK_FILE_NAME = 'state.json.lock'
export const AGENT_STATUSES = Object.freeze(['running', 'waiting_user', 'idle'])
export const TASK_STATUSES = Object.freeze(['todo', 'in_progress', 'done', 'blocked'])
export const TASK_PRIORITIES = Object.freeze([
  'p0', 'p1', 'p2', 'p3', 'p4', 'p5', // 常用优先级 P0~P5
  'p6', 'p7', // 向后兼容历史数据
  'high', 'medium', 'low',
])
export const IDEA_SOURCES = Object.freeze(['human', 'dsh-agent', 'external-mcp'])

export const DEFAULT_STATE_DIR = path.join(os.homedir(), '.dsh', 'omni-plan')

const WORKSPACE_MAX = 160
const FOCUS_TEXT_MAX = 4000
const TASK_TITLE_MAX = 500
const TASK_NOTES_MAX = 8000
const IDEA_MAX = 8000
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/

/** A caller supplied data that does not satisfy the plan contract. */
export class PlanValidationError extends Error {
  constructor(message, code = 'INVALID_INPUT') {
    super(message)
    this.name = 'PlanValidationError'
    this.code = code
  }
}

/** An entity referenced by id/workspace does not exist. */
export class PlanNotFoundError extends Error {
  constructor(message, code = 'NOT_FOUND') {
    super(message)
    this.name = 'PlanNotFoundError'
    this.code = code
  }
}

/** A storage-level failure (locking, parsing, atomic write). */
export class PlanStoreError extends Error {
  constructor(message, code = 'STORE_ERROR', cause) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'PlanStoreError'
    this.code = code
  }
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function readField(value, ...names) {
  for (const name of names) {
    if (hasOwn(value, name)) return value[name]
  }
  return undefined
}

function sleep(ms) {
  // Intentionally ref'd: a process waiting for the lock must stay alive until
  // it gets the lock (this matters for the standalone MCP stdio entry).
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function nextTimestamp(previous) {
  const base = Number.isFinite(previous) ? Number(previous) : 0
  return Math.max(Date.now(), base + 1)
}

function finiteTimestamp(value, fallback = 0) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return Number.isFinite(number) && Number(number) > 0 ? Math.trunc(Number(number)) : fallback
}

function clampText(value, field, max, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new PlanValidationError(`${field} is required`)
    return ''
  }
  if (typeof value !== 'string') {
    throw new PlanValidationError(`${field} must be a string`)
  }
  const text = value.replace(/\u0000/g, '').trim()
  if (required && text.length === 0) {
    throw new PlanValidationError(`${field} must not be empty`)
  }
  if (text.length <= max) return text
  // Stored data may have been produced by a different client.  Reading is
  // forgiving and truncates; writes reject overly long values (see requireText).
  return `${text.slice(0, Math.max(0, max - 1))}…`
}

function safeClampText(value, field, max, fallback = '') {
  try {
    return clampText(value, field, max)
  } catch {
    return fallback
  }
}

function requireText(value, field, max) {
  if (typeof value !== 'string') throw new PlanValidationError(`${field} must be a string`)
  const text = value.replace(/\u0000/g, '').trim()
  if (text.length === 0) throw new PlanValidationError(`${field} must not be empty`)
  if (text.length > max) throw new PlanValidationError(`${field} must be at most ${max} characters`)
  return text
}

/** Optional text for writes: undefined means "leave unchanged", null/"" clears. */
function optionalText(value, field, max) {
  if (value === undefined) return undefined
  if (value === null) return ''
  if (typeof value !== 'string') throw new PlanValidationError(`${field} must be a string`)
  const text = value.replace(/\u0000/g, '').trim()
  if (text.length > max) throw new PlanValidationError(`${field} must be at most ${max} characters`)
  return text
}

function requireEnum(value, field, values) {
  if (typeof value !== 'string' || !values.includes(value)) {
    throw new PlanValidationError(`${field} must be one of: ${values.join(', ')}`)
  }
  return value
}

function normalizeEnum(value, fallback, values) {
  return typeof value === 'string' && values.includes(value) ? value : fallback
}

function normalizeRemindAt(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) throw new PlanValidationError('remindAt must be a positive epoch-millisecond number or an ISO date string')
    return Math.trunc(value)
  }
  if (typeof value === 'string') {
    const text = value.trim()
    if (text === '') return null
    if (/^\d+$/.test(text)) {
      const number = Number(text)
      if (!Number.isSafeInteger(number) || number <= 0) throw new PlanValidationError('remindAt is outside the supported epoch-millisecond range')
      return number
    }
    const parsed = Date.parse(text)
    if (!Number.isFinite(parsed) || parsed <= 0) throw new PlanValidationError('remindAt must be an epoch-millisecond number or an ISO date string')
    return Math.trunc(parsed)
  }
  throw new PlanValidationError('remindAt must be an epoch-millisecond number, an ISO date string, or null')
}

function normalizeId(value, prefix, used = new Set()) {
  if (value !== undefined && value !== null && value !== '') {
    if (typeof value !== 'string' || !ID_RE.test(value)) {
      throw new PlanValidationError(`${prefix} id must match ${ID_RE}`)
    }
    return value
  }
  let id = ''
  do {
    id = `${prefix}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`
  } while (used.has(id))
  return id
}

function workspaceHash(workspace) {
  return createHash('sha1').update(workspace.toLowerCase()).digest('hex').slice(0, 12)
}

function contextIdForWorkspace(workspace, used = new Set()) {
  const base = `ctx-${workspaceHash(workspace)}`
  if (!used.has(base)) return base
  let suffix = 2
  while (used.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

function normalizeSource(value) {
  return normalizeEnum(value, 'human', IDEA_SOURCES)
}

function emptyState(now = Date.now()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    updatedAt: now,
    activeContexts: [],
    tasks: [],
    inbox: [],
  }
}

function cloneState(state) {
  return structuredClone(state)
}

function stateSignature(state) {
  return createHash('sha1').update(JSON.stringify(state)).digest('hex')
}

/**
 * Normalise any on-disk document into the public data model.  Unknown fields
 * are dropped deliberately: the JSON document is a compact, stable contract,
 * not a general-purpose store for other plugins.
 */
export function normalizeState(raw, { now = Date.now() } = {}) {
  const source = isPlainObject(raw) ? raw : {}
  const revision = Number.isSafeInteger(source.revision) && source.revision >= 0 ? source.revision : 0
  const updatedAt = finiteTimestamp(source.updatedAt, now)

  const activeContexts = []
  const contextIds = new Set()
  const contextByWorkspace = new Map()
  const rawContexts = Array.isArray(source.activeContexts) ? source.activeContexts : []

  for (const item of rawContexts) {
    if (!isPlainObject(item)) continue
    let workspace
    try {
      workspace = clampText(item.workspace, 'workspace', WORKSPACE_MAX, { required: true })
    } catch {
      continue
    }
    if (workspace.length === 0) continue

    let id
    try {
      id = normalizeId(item.id, 'ctx', contextIds)
    } catch {
      id = contextIdForWorkspace(workspace, contextIds)
    }
    if (contextIds.has(id)) id = contextIdForWorkspace(workspace, contextIds)

    const context = {
      id,
      workspace,
      agentStatus: normalizeEnum(item.agentStatus, 'idle', AGENT_STATUSES),
      currentDoing: safeClampText(item.currentDoing, 'currentDoing', FOCUS_TEXT_MAX),
      nextActionForHuman: safeClampText(item.nextActionForHuman, 'nextActionForHuman', FOCUS_TEXT_MAX),
      updatedAt: finiteTimestamp(item.updatedAt, updatedAt),
    }

    const key = workspace.toLowerCase()
    const existingIndex = contextByWorkspace.get(key)
    if (existingIndex !== undefined) {
      if (activeContexts[existingIndex].updatedAt >= context.updatedAt) continue
      contextIds.delete(activeContexts[existingIndex].id)
      activeContexts[existingIndex] = context
    } else {
      contextByWorkspace.set(key, activeContexts.length)
      activeContexts.push(context)
    }
    contextIds.add(context.id)
  }

  const tasks = []
  const taskIds = new Set()
  const rawTasks = Array.isArray(source.tasks) ? source.tasks : []
  for (const item of rawTasks) {
    if (!isPlainObject(item)) continue
    let title
    try {
      title = clampText(item.title, 'title', TASK_TITLE_MAX, { required: true })
    } catch {
      continue
    }
    if (title.length === 0) continue

    let id
    try {
      id = normalizeId(item.id, 'task', taskIds)
    } catch {
      id = normalizeId(undefined, 'task', taskIds)
    }
    if (taskIds.has(id)) id = normalizeId(undefined, 'task', taskIds)

    let remindAt = null
    try {
      remindAt = normalizeRemindAt(item.remindAt) ?? null
    } catch {
      remindAt = null
    }

    const createdAt = finiteTimestamp(item.createdAt, updatedAt)
    const taskUpdatedAt = finiteTimestamp(item.updatedAt, createdAt)
    const status = normalizeEnum(item.status, 'todo', TASK_STATUSES)
    const task = {
      id,
      title,
      status,
      priority: normalizeEnum(item.priority, 'medium', TASK_PRIORITIES),
      remindAt,
      notes: safeClampText(item.notes, 'notes', TASK_NOTES_MAX),
      createdAt,
      updatedAt: taskUpdatedAt,
    }
    const completedAt = finiteTimestamp(item.completedAt, 0)
    if (completedAt > 0) task.completedAt = completedAt
    taskIds.add(id)
    tasks.push(task)
  }

  const inbox = []
  const inboxIds = new Set()
  const rawInbox = Array.isArray(source.inbox) ? source.inbox : []
  for (const item of rawInbox) {
    if (!isPlainObject(item)) continue
    let content
    try {
      content = clampText(item.content, 'content', IDEA_MAX, { required: true })
    } catch {
      continue
    }
    if (content.length === 0) continue

    let id
    try {
      id = normalizeId(item.id, 'idea', inboxIds)
    } catch {
      id = normalizeId(undefined, 'idea', inboxIds)
    }
    if (inboxIds.has(id)) id = normalizeId(undefined, 'idea', inboxIds)
    inboxIds.add(id)
    inbox.push({
      id,
      content,
      source: normalizeSource(item.source),
      createdAt: finiteTimestamp(item.createdAt, updatedAt),
    })
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    revision,
    updatedAt,
    activeContexts,
    tasks,
    inbox,
  }
}

/** Build the compact counters consumed by tools and the Client header. */
export function summarizeState(state, now = Date.now()) {
  const summary = {
    contexts: state.activeContexts.length,
    running: 0,
    waitingUser: 0,
    idle: 0,
    tasks: state.tasks.length,
    todo: 0,
    inProgress: 0,
    done: 0,
    blocked: 0,
    inbox: state.inbox.length,
    overdueReminders: 0,
    nextReminderAt: null,
  }
  for (const context of state.activeContexts) {
    if (context.agentStatus === 'running') summary.running += 1
    else if (context.agentStatus === 'waiting_user') summary.waitingUser += 1
    else summary.idle += 1
  }
  for (const task of state.tasks) {
    if (task.status === 'todo') summary.todo += 1
    else if (task.status === 'in_progress') summary.inProgress += 1
    else if (task.status === 'done') summary.done += 1
    else if (task.status === 'blocked') summary.blocked += 1
    if (task.status !== 'done' && Number.isFinite(task.remindAt) && task.remindAt > 0) {
      if (task.remindAt <= now) summary.overdueReminders += 1
      if (summary.nextReminderAt === null || task.remindAt < summary.nextReminderAt) {
        summary.nextReminderAt = task.remindAt
      }
    }
  }
  return summary
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

/**
 * Compare the entity arrays of two states.  The Host includes this in every
 * SSE `change` frame so the Client can breathe-highlight exactly the rows an
 * AI (or external MCP client) touched.
 */
export function diffStates(previous, next) {
  const entities = []
  const kinds = [
    ['context', 'activeContexts'],
    ['task', 'tasks'],
    ['idea', 'inbox'],
  ]
  for (const [kind, key] of kinds) {
    const before = new Map((previous[key] ?? []).map((item) => [item.id, item]))
    const after = new Map((next[key] ?? []).map((item) => [item.id, item]))
    for (const [id, item] of after) {
      const old = before.get(id)
      if (old === undefined) entities.push({ kind, id, action: 'added' })
      else if (!sameJson(old, item)) entities.push({ kind, id, action: 'updated' })
    }
    for (const id of before.keys()) {
      if (!after.has(id)) entities.push({ kind, id, action: 'removed' })
    }
  }
  return entities
}

function isProcessAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code === 'EPERM'
  }
}

/**
 * Exclusive lock built from an O_EXCL lock file.  This works across Node
 * processes on Windows, macOS and Linux without native dependencies.  A lock
 * left by a crashed process is removed once it is old enough or its PID is dead.
 */
class FileLock {
  constructor(file, { timeoutMs = 8000, staleMs = 20000, logger = null } = {}) {
    this.file = file
    this.timeoutMs = timeoutMs
    this.staleMs = staleMs
    this.logger = logger
    this.held = false
  }

  async acquire() {
    const deadline = Date.now() + this.timeoutMs
    let delay = 20
    for (;;) {
      try {
        const handle = await fs.open(this.file, 'wx', 0o600)
        try {
          await handle.writeFile(
            JSON.stringify({ pid: process.pid, hostname: os.hostname(), acquiredAt: Date.now() }),
            'utf8',
          )
        } finally {
          await handle.close()
        }
        this.held = true
        return
      } catch (error) {
        if (error?.code !== 'EEXIST') throw error
        await this._breakIfStale()
        if (Date.now() >= deadline) {
          throw new PlanStoreError(
            `timed out waiting for the Omni Plan lock at ${this.file}`,
            'LOCK_TIMEOUT',
            error,
          )
        }
        const jitter = Math.floor(Math.random() * Math.min(40, delay))
        await sleep(delay + jitter)
        delay = Math.min(250, Math.ceil(delay * 1.7))
      }
    }
  }

  async _breakIfStale() {
    let stat
    try {
      stat = await fs.stat(this.file)
    } catch (error) {
      if (error?.code === 'ENOENT') return
      throw error
    }
    let stale = Date.now() - stat.mtimeMs > this.staleMs
    if (!stale) {
      try {
        const parsed = JSON.parse(await fs.readFile(this.file, 'utf8'))
        if (Number.isSafeInteger(parsed.pid) && parsed.pid !== process.pid && !isProcessAlive(parsed.pid)) {
          stale = true
        }
      } catch {
        // A malformed or partially written lock is handled by the age check on
        // the next pass.  Do not break a fresh lock just because its body is bad.
      }
    }
    if (stale) {
      try {
        await fs.unlink(this.file)
        this.logger?.warn?.(`[omni-plan] removed stale lock ${this.file}`)
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error
      }
    }
  }

  async release() {
    if (!this.held) return
    this.held = false
    let lastError
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        await fs.unlink(this.file)
        return
      } catch (error) {
        if (error?.code === 'ENOENT') return
        lastError = error
        await sleep(20 + attempt * 20)
      }
    }
    // The mutation itself already succeeded.  A stale lock will be cleaned by
    // the next acquisition; never turn a completed write into a failure.
    this.logger?.warn?.(`[omni-plan] could not remove lock ${this.file}: ${lastError?.message ?? lastError}`)
  }
}

async function renameWithRetry(from, to) {
  let lastError
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await fs.rename(from, to)
      return
    } catch (error) {
      lastError = error
      if (!['EPERM', 'EACCES', 'EBUSY', 'EEXIST'].includes(error?.code)) throw error
      await sleep(20 + attempt * 25)
    }
  }
  throw lastError
}

/**
 * The shared plan store.  Construct through `openStore()` so the directory,
 * initial document and watchers are ready before the Host registers tools.
 */
export class OmniPlanStore extends EventEmitter {
  constructor(options = {}) {
    super()
    this.setMaxListeners(100)
    this.dataDir = resolveDataDir(options.dataDir)
    this.statePath = path.join(this.dataDir, STATE_FILE_NAME)
    this.lockPath = path.join(this.dataDir, LOCK_FILE_NAME)
    this.logger = options.logger ?? null
    this.debounceMs = Math.max(30, Number(options.debounceMs) || 90)
    this.pollIntervalMs = Math.max(500, Number(options.pollIntervalMs) || 2000)
    this.lockTimeoutMs = Math.max(1000, Number(options.lockTimeoutMs) || 8000)
    this.lock = new FileLock(this.lockPath, {
      timeoutMs: this.lockTimeoutMs,
      staleMs: Math.max(5000, Number(options.lockStaleMs) || 20000),
      logger: this.logger,
    })

    this._state = emptyState()
    this._revision = 0
    this._signature = ''
    this._queue = Promise.resolve()
    this._closed = false
    this._watcher = null
    this._watchTimer = null
    this._pollTimer = null
    this._refreshInFlight = null
  }

  get revision() {
    return this._revision
  }

  get updatedAt() {
    return this._state.updatedAt
  }

  /** Read the current cached state.  Callers receive an isolated copy. */
  getState() {
    return cloneState(this._state)
  }

  /** A consistent read bundle used by REST/SSE/tools. */
  snapshot() {
    return {
      state: this.getState(),
      revision: this._revision,
      updatedAt: this._state.updatedAt,
    }
  }

  async open() {
    if (this._closed) throw new PlanStoreError('cannot open a closed Omni Plan store', 'STORE_CLOSED')
    await fs.mkdir(this.dataDir, { recursive: true, mode: 0o700 })
    await this.lock.acquire()
    try {
      const current = await this._readDisk({ recover: true })
      if (current === null) await this._writeAtomic(emptyState())
    } finally {
      await this.lock.release()
    }
    const disk = await this._readDisk({ recover: true })
    if (disk === null) throw new PlanStoreError(`Omni Plan state was not created at ${this.statePath}`, 'STORE_INIT_FAILED')
    this._state = disk.state
    this._revision = disk.state.revision
    this._signature = disk.signature
    this._startWatchers()
    return this
  }

  /** Serialise state-changing work for this process. */
  _enqueue(work) {
    const result = this._queue.then(work, work)
    this._queue = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  async _readDisk({ recover = false } = {}) {
    let text
    try {
      text = await fs.readFile(this.statePath, 'utf8')
    } catch (error) {
      if (error?.code === 'ENOENT') return null
      throw new PlanStoreError(`could not read ${this.statePath}: ${error?.message ?? error}`, 'READ_FAILED', error)
    }

    try {
      const parsed = JSON.parse(text)
      if (!isPlainObject(parsed)) throw new PlanStoreError('state root must be a JSON object', 'CORRUPT_STATE')
      const state = normalizeState(parsed)
      return { state, signature: stateSignature(state), text }
    } catch (error) {
      if (!recover) throw new PlanStoreError(`invalid Omni Plan JSON at ${this.statePath}: ${error?.message ?? error}`, 'CORRUPT_STATE', error)
      const backupPath = `${this.statePath}.corrupt-${Date.now()}`
      try {
        await fs.copyFile(this.statePath, backupPath)
      } catch {
        // Best effort: the old bytes may already be gone.  The warning below
        // still tells the user where the replacement document lives.
      }
      this._warn('CORRUPT_STATE', `Omni Plan state was invalid; backed it up to ${backupPath} and started a clean document`)
      const fresh = emptyState()
      return await this._writeAtomic(fresh)
    }
  }

  async _writeAtomic(state) {
    const body = `${JSON.stringify(state, null, 2)}\n`
    const tmp = path.join(
      this.dataDir,
      `.${STATE_FILE_NAME}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`,
    )
    let handle = null
    try {
      handle = await fs.open(tmp, 'wx', 0o600)
      await handle.writeFile(body, 'utf8')
      await handle.sync()
      await handle.close()
      handle = null
      await renameWithRetry(tmp, this.statePath)
      try {
        await fs.chmod(this.statePath, 0o600)
      } catch {
        // Windows ignores POSIX modes; a failure here must not fail the write.
      }
      return { state, signature: stateSignature(state), text: body }
    } catch (error) {
      try {
        await handle?.close()
      } catch {
        // ignored
      }
      try {
        await fs.unlink(tmp)
      } catch {
        // ignored
      }
      if (error instanceof PlanStoreError) throw error
      throw new PlanStoreError(`could not write ${this.statePath}: ${error?.message ?? error}`, 'WRITE_FAILED', error)
    }
  }

  _warn(code, message, details = undefined) {
    const warning = { code, message, ...(details === undefined ? {} : { details }), at: Date.now() }
    this.logger?.warn?.(`[omni-plan] ${message}`)
    if (this.listenerCount('warning') > 0) {
      try {
        this.emit('warning', warning)
      } catch (error) {
        this.logger?.warn?.(`[omni-plan] warning listener failed: ${error?.message ?? error}`)
      }
    }
  }

  _emitChange(change) {
    if (this._closed) return
    const payload = {
      state: this.getState(),
      revision: this._revision,
      updatedAt: this._state.updatedAt,
      change: {
        ...change,
        revision: this._revision,
        at: Date.now(),
        entities: Array.isArray(change.entities) ? change.entities : [],
      },
    }
    try {
      this.emit('change', payload)
    } catch (error) {
      // A bad observer must never turn a committed write into a failed call.
      this._warn('LISTENER_FAILED', `change listener failed: ${error?.message ?? error}`)
    }
  }

  /**
   * Lock, re-read, mutate and atomically persist one state transition.
   * `mutator(state, now)` may throw to abort without touching the file.
   */
  async _mutate(mutator, meta = {}) {
    if (this._closed) throw new PlanStoreError('Omni Plan store is closed', 'STORE_CLOSED')
    return this._enqueue(async () => {
      if (this._closed) throw new PlanStoreError('Omni Plan store is closed', 'STORE_CLOSED')
      await this.lock.acquire()
      try {
        const disk = await this._readDisk({ recover: true })
        const base = disk?.state ?? emptyState()
        base.revision = Math.max(base.revision, this._revision)
        base.updatedAt = Math.max(base.updatedAt, this._state.updatedAt)
        const previous = cloneState(base)
        const now = nextTimestamp(base.updatedAt)
        const outcome = await mutator(base, now)
        base.revision = Math.max(base.revision, this._revision) + 1
        base.updatedAt = now
        const normalized = normalizeState(base, { now })
        normalized.revision = base.revision
        normalized.updatedAt = now
        const written = await this._writeAtomic(normalized)

        this._state = normalized
        this._revision = normalized.revision
        this._signature = written.signature

        const change = {
          kind: outcome?.kind ?? meta.kind ?? 'state',
          action: outcome?.action ?? meta.action ?? 'updated',
          origin: meta.origin ?? 'unknown',
          ...(meta.actor === undefined ? {} : { actor: meta.actor }),
          entities: diffStates(previous, normalized),
        }
        this._emitChange(change)
        return {
          ...(outcome?.result ?? {}),
          state: this.getState(),
          revision: this._revision,
          updatedAt: this._state.updatedAt,
          change,
        }
      } finally {
        await this.lock.release()
      }
    })
  }

  /**
   * Upsert an Active Focus anchor.  Existing records may be addressed by id or
   * workspace.  Omitted fields are preserved; new records default to idle/empty.
   */
  async upsertContext(input, meta = {}) {
    if (!isPlainObject(input)) throw new PlanValidationError('context payload must be an object')
    return this._mutate((state, now) => {
      const requestedId = readField(input, 'id', 'contextId', 'context_id')
      const workspaceValue = readField(input, 'workspace')
      let index = -1
      if (requestedId !== undefined && requestedId !== null && requestedId !== '') {
        index = state.activeContexts.findIndex((context) => context.id === requestedId)
      }

      let workspace
      if (workspaceValue !== undefined) {
        workspace = requireText(workspaceValue, 'workspace', WORKSPACE_MAX)
        const key = workspace.toLowerCase()
        const byWorkspace = state.activeContexts.findIndex((context) => context.workspace.toLowerCase() === key)
        if (byWorkspace >= 0 && byWorkspace !== index) {
          if (index >= 0) {
            throw new PlanValidationError('workspace already belongs to another active context', 'WORKSPACE_CONFLICT')
          }
          index = byWorkspace
        }
      }

      if (index < 0 && workspace === undefined) {
        throw new PlanValidationError('workspace is required when creating an active context')
      }

      let context
      let action
      if (index >= 0) {
        context = state.activeContexts[index]
        if (workspace !== undefined) context.workspace = workspace
        const status = readField(input, 'agentStatus', 'agent_status')
        if (status !== undefined) context.agentStatus = requireEnum(status, 'agentStatus', AGENT_STATUSES)
        const currentDoing = readField(input, 'currentDoing', 'current_doing')
        if (currentDoing !== undefined) context.currentDoing = optionalText(currentDoing, 'currentDoing', FOCUS_TEXT_MAX)
        const nextAction = readField(input, 'nextActionForHuman', 'next_action_for_human')
        if (nextAction !== undefined) context.nextActionForHuman = optionalText(nextAction, 'nextActionForHuman', FOCUS_TEXT_MAX)
        context.updatedAt = now
        action = 'updated'
      } else {
        const used = new Set(state.activeContexts.map((item) => item.id))
        const id = requestedId === undefined || requestedId === null || requestedId === ''
          ? contextIdForWorkspace(workspace, used)
          : normalizeId(requestedId, 'ctx', used)
        if (used.has(id)) throw new PlanValidationError(`context id ${id} already exists`, 'ID_CONFLICT')
        const statusValue = readField(input, 'agentStatus', 'agent_status')
        context = {
          id,
          workspace,
          agentStatus: statusValue === undefined ? 'idle' : requireEnum(statusValue, 'agentStatus', AGENT_STATUSES),
          currentDoing: optionalText(readField(input, 'currentDoing', 'current_doing'), 'currentDoing', FOCUS_TEXT_MAX) ?? '',
          nextActionForHuman: optionalText(readField(input, 'nextActionForHuman', 'next_action_for_human'), 'nextActionForHuman', FOCUS_TEXT_MAX) ?? '',
          updatedAt: now,
        }
        state.activeContexts.push(context)
        action = 'added'
      }

      return {
        kind: 'context',
        action,
        result: { context: structuredClone(context) },
      }
    }, meta)
  }

  async removeContext(input, meta = {}) {
    const id = readField(input, 'id', 'contextId', 'context_id')
    const workspace = readField(input, 'workspace')
    return this._mutate((state) => {
      let index = -1
      if (id !== undefined && id !== null && id !== '') index = state.activeContexts.findIndex((item) => item.id === id)
      else if (workspace !== undefined) {
        const key = String(workspace).trim().toLowerCase()
        index = state.activeContexts.findIndex((item) => item.workspace.toLowerCase() === key)
      }
      if (index < 0) throw new PlanNotFoundError('active context not found')
      const [removed] = state.activeContexts.splice(index, 1)
      return { kind: 'context', action: 'removed', result: { removedContext: removed } }
    }, meta)
  }

  /**
   * Atomic task CRUD.  `action` is add/update/complete/delete.  Timestamps are
   * assigned inside the store so concurrent agents cannot reorder writes.
   */
  async manageTask(input, meta = {}) {
    if (!isPlainObject(input)) throw new PlanValidationError('task payload must be an object')
    const action = requireEnum(input.action, 'action', ['add', 'update', 'complete', 'delete'])
    const taskId = readField(input, 'taskId', 'task_id', 'id')

    return this._mutate((state, now) => {
      if (action === 'add') {
        const title = requireText(readField(input, 'title'), 'title', TASK_TITLE_MAX)
        const statusValue = readField(input, 'status')
        const priorityValue = readField(input, 'priority')
        const status = statusValue === undefined ? 'todo' : requireEnum(statusValue, 'status', TASK_STATUSES)
        const priority = priorityValue === undefined ? 'medium' : requireEnum(priorityValue, 'priority', TASK_PRIORITIES)
        const remindAt = hasOwn(input, 'remindAt') || hasOwn(input, 'remind_at')
          ? normalizeRemindAt(readField(input, 'remindAt', 'remind_at')) ?? null
          : null
        const notes = optionalText(readField(input, 'notes'), 'notes', TASK_NOTES_MAX) ?? ''
        const used = new Set(state.tasks.map((task) => task.id))
        const id = taskId === undefined || taskId === null || taskId === ''
          ? normalizeId(undefined, 'task', used)
          : normalizeId(taskId, 'task', used)
        if (used.has(id)) throw new PlanValidationError(`task id ${id} already exists`, 'ID_CONFLICT')
        const task = {
          id,
          title,
          status,
          priority,
          remindAt,
          notes,
          createdAt: now,
          updatedAt: now,
          ...(status === 'done' ? { completedAt: now } : {}),
        }
        state.tasks.push(task)
        return { kind: 'task', action: 'added', result: { task: structuredClone(task) } }
      }

      if (taskId === undefined || taskId === null || taskId === '') {
        throw new PlanValidationError(`taskId is required for action "${action}"`)
      }
      const index = state.tasks.findIndex((task) => task.id === taskId)
      if (index < 0) throw new PlanNotFoundError(`task ${taskId} not found`)
      const task = state.tasks[index]

      if (action === 'delete') {
        state.tasks.splice(index, 1)
        return { kind: 'task', action: 'removed', result: { removedTaskId: taskId } }
      }

      if (action === 'complete') {
        task.status = 'done'
        task.completedAt = now
        task.updatedAt = now
        task.remindAt = null
        return { kind: 'task', action: 'completed', result: { task: structuredClone(task) } }
      }

      // update: `undefined` means "leave this field alone"; `null` on remindAt
      // and an empty string on notes are explicit clears.
      if (input.title !== undefined) task.title = requireText(input.title, 'title', TASK_TITLE_MAX)
      if (input.status !== undefined) {
        const nextStatus = requireEnum(input.status, 'status', TASK_STATUSES)
        task.status = nextStatus
        if (nextStatus === 'done') {
          if (!task.completedAt) task.completedAt = now
        } else {
          delete task.completedAt
        }
      }
      if (input.priority !== undefined) task.priority = requireEnum(input.priority, 'priority', TASK_PRIORITIES)
      const remindValue = readField(input, 'remindAt', 'remind_at')
      if (remindValue !== undefined) {
        task.remindAt = normalizeRemindAt(remindValue) ?? null
      }
      if (input.notes !== undefined) task.notes = optionalText(input.notes, 'notes', TASK_NOTES_MAX) ?? ''
      task.updatedAt = now
      return { kind: 'task', action: 'updated', result: { task: structuredClone(task) } }
    }, meta)
  }

  async captureIdea(input, meta = {}) {
    if (!isPlainObject(input)) throw new PlanValidationError('inbox payload must be an object')
    const content = requireText(readField(input, 'content'), 'content', IDEA_MAX)
    const sourceValue = readField(input, 'source')
    const source = sourceValue === undefined ? 'human' : requireEnum(sourceValue, 'source', IDEA_SOURCES)
    return this._mutate((state, now) => {
      const used = new Set(state.inbox.map((idea) => idea.id))
      const requestedId = readField(input, 'id', 'ideaId', 'idea_id')
      const id = requestedId === undefined || requestedId === null || requestedId === ''
        ? normalizeId(undefined, 'idea', used)
        : normalizeId(requestedId, 'idea', used)
      if (used.has(id)) throw new PlanValidationError(`idea id ${id} already exists`, 'ID_CONFLICT')
      const idea = { id, content, source, createdAt: now }
      state.inbox.unshift(idea)
      return { kind: 'inbox', action: 'added', result: { idea: structuredClone(idea) } }
    }, meta)
  }

  async removeIdea(input, meta = {}) {
    const id = readField(input, 'id', 'ideaId', 'idea_id')
    if (id === undefined || id === null || id === '') throw new PlanValidationError('idea id is required')
    return this._mutate((state) => {
      const index = state.inbox.findIndex((idea) => idea.id === id)
      if (index < 0) throw new PlanNotFoundError(`idea ${id} not found`)
      const [removed] = state.inbox.splice(index, 1)
      return { kind: 'inbox', action: 'removed', result: { removedIdea: removed } }
    }, meta)
  }

  /**
   * Convert one inbox thought into a task in a single locked transaction, so an
   * external MCP process cannot observe the thought in both places or neither.
   */
  async promoteIdea(input, meta = {}) {
    const id = readField(input, 'id', 'ideaId', 'idea_id')
    if (id === undefined || id === null || id === '') throw new PlanValidationError('idea id is required')
    return this._mutate((state, now) => {
      const index = state.inbox.findIndex((idea) => idea.id === id)
      if (index < 0) throw new PlanNotFoundError(`idea ${id} not found`)
      const [idea] = state.inbox.splice(index, 1)
      const used = new Set(state.tasks.map((task) => task.id))
      const task = {
        id: normalizeId(undefined, 'task', used),
        title: idea.content.slice(0, TASK_TITLE_MAX),
        status: 'todo',
        priority: 'medium',
        remindAt: null,
        notes: `Promoted from inbox (${idea.source}, ${new Date(idea.createdAt).toISOString()})\n\n${idea.content}`.slice(0, TASK_NOTES_MAX),
        createdAt: now,
        updatedAt: now,
      }
      state.tasks.push(task)
      return { kind: 'inbox', action: 'promoted', result: { idea: structuredClone(idea), task: structuredClone(task) } }
    }, meta)
  }

  /** Wait until every queued mutation owned by this process settles. */
  async flush() {
    await this._queue
  }

  async _refreshFromDisk(reason) {
    if (this._closed) return
    if (this._refreshInFlight !== null) return this._refreshInFlight
    this._refreshInFlight = this._enqueue(async () => {
      if (this._closed) return
      let disk
      try {
        disk = await this._readDisk({ recover: false })
      } catch (error) {
        this._warn(error?.code ?? 'REFRESH_FAILED', `could not refresh Omni Plan state: ${error?.message ?? error}`)
        return
      }
      if (disk === null || disk.signature === this._signature) return

      const previous = this._state
      const next = disk.state
      if (next.revision <= this._revision) next.revision = this._revision + 1
      if (next.updatedAt <= previous.updatedAt) next.updatedAt = previous.updatedAt + 1
      const entities = diffStates(previous, next)
      this._state = next
      this._revision = next.revision
      this._signature = disk.signature
      this._emitChange({
        kind: 'state',
        action: 'external-sync',
        origin: 'external',
        reason,
        entities,
      })
    }).finally(() => {
      this._refreshInFlight = null
    })
    return this._refreshInFlight
  }

  _scheduleRefresh(reason) {
    if (this._closed || this._watchTimer !== null) return
    this._watchTimer = setTimeout(() => {
      this._watchTimer = null
      void this._refreshFromDisk(reason)
    }, this.debounceMs)
  }

  _startWatchers() {
    try {
      // Keep both observation mechanisms ref'd: a store waiting for an external
      // MCP write must remain alive even when no HTTP server is open.  `close()`
      // always clears them, so this does not leak a DSH process.
      this._watcher = watchDirectory(this.dataDir, { persistent: true }, (eventType, filename) => {
        const name = Buffer.isBuffer(filename) ? filename.toString('utf8') : filename
        if (name !== null && name !== undefined && name !== STATE_FILE_NAME) return
        this._scheduleRefresh(`fs.watch:${eventType}`)
      })
      this._watcher.on('error', (error) => {
        this._warn('WATCH_FAILED', `state watcher failed: ${error?.message ?? error}`)
      })
    } catch (error) {
      this._warn('WATCH_UNAVAILABLE', `state watcher unavailable; polling will be used: ${error?.message ?? error}`)
    }

    this._pollTimer = setInterval(() => {
      this._scheduleRefresh('poll')
    }, this.pollIntervalMs)
  }

  async close() {
    if (this._closed) return
    this._closed = true
    if (this._watchTimer !== null) {
      clearTimeout(this._watchTimer)
      this._watchTimer = null
    }
    if (this._pollTimer !== null) {
      clearInterval(this._pollTimer)
      this._pollTimer = null
    }
    try {
      this._watcher?.close()
    } catch {
      // ignored
    }
    this._watcher = null
    await this._queue
    this.removeAllListeners()
  }
}

/** Resolve the shared directory with `~` expansion and environment support. */
export function resolveDataDir(input) {
  let raw = input
  if (raw === undefined || raw === null || raw === '') raw = process.env.OMNI_PLAN_DIR
  if (raw === undefined || raw === null || raw === '') raw = DEFAULT_STATE_DIR
  if (typeof raw !== 'string') throw new PlanValidationError('dataDir must be a string')
  if (raw === '~') raw = os.homedir()
  else if (raw.startsWith('~/') || raw.startsWith('~\\')) raw = path.join(os.homedir(), raw.slice(2))
  return path.resolve(raw)
}

/**
 * Open (and initialise) the shared plan store.
 * @param {object} [options] - dataDir/logger/pollIntervalMs/debounceMs/lockTimeoutMs.
 * @returns {Promise<OmniPlanStore>}
 */
export async function openStore(options = {}) {
  const store = new OmniPlanStore(options)
  await store.open()
  return store
}
