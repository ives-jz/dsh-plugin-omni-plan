#!/usr/bin/env node
/**
 * Standalone Model Context Protocol stdio server for Omni Plan.
 *
 * Claude Desktop, Cursor, Cline, Continue and any other MCP client can launch
 * this file directly:
 *
 *   node "<plugin-dir>/lib/mcp-stdio.js" --data-dir "C:\\Users\\you\\.dsh\\omni-plan"
 *
 * It shares the exact same state engine, tool schemas and business operations
 * as the DSH Host.  Mutations take the same cross-process file lock, so a task
 * completed from Cursor is immediately observed by the DSH board's fs.watch.
 *
 * Protocol notes:
 *   - stdout is reserved for newline-delimited JSON-RPC 2.0 messages;
 *   - diagnostics go to stderr only;
 *   - requests are processed sequentially to preserve write order.
 */

import readline from 'node:readline'
import path from 'node:path'
import { McpBridge, SERVER_VERSION } from './host.js'
import { openStore, resolveDataDir } from './store.js'

function usage() {
  return [
    'dsh-plugin-omni-plan MCP stdio server',
    '',
    'Usage:',
    '  node lib/mcp-stdio.js [--data-dir <dir>]',
    '',
    'Options:',
    '  --data-dir <dir>   Directory containing state.json',
    '                     (default: $OMNI_PLAN_DIR or ~/.dsh/omni-plan)',
    '  --version          Print the server version and exit',
    '  --help             Print this help and exit',
  ].join('\n')
}

function parseArgs(argv) {
  const result = { dataDir: undefined, help: false, version: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') result.help = true
    else if (argument === '--version' || argument === '-v') result.version = true
    else if (argument === '--data-dir' || argument === '--dir') {
      const value = argv[index + 1]
      if (value === undefined || value.startsWith('--')) throw new Error(`${argument} requires a directory`)
      result.dataDir = value
      index += 1
    } else if (argument.startsWith('--data-dir=')) {
      result.dataDir = argument.slice('--data-dir='.length)
    } else if (argument.startsWith('--dir=')) {
      result.dataDir = argument.slice('--dir='.length)
    } else {
      throw new Error(`unknown argument: ${argument}`)
    }
  }
  return result
}

function log(message) {
  try {
    process.stderr.write(`[omni-plan-mcp] ${message}\n`)
  } catch {
    // stderr can disappear when the parent closes; there is nowhere left to log.
  }
}

const args = parseArgs(process.argv.slice(2))
if (args.help) {
  process.stdout.write(`${usage()}\n`)
  process.exit(0)
}
if (args.version) {
  process.stdout.write(`${SERVER_VERSION}\n`)
  process.exit(0)
}

process.title = 'dsh-omni-plan-mcp'
const dataDir = args.dataDir === undefined ? resolveDataDir() : path.resolve(args.dataDir)
let store
try {
  store = await openStore({
    dataDir,
    pollIntervalMs: 1500,
    debounceMs: 60,
    logger: { warn: (message) => log(message) },
  })
} catch (error) {
  log(`could not open the plan store at ${dataDir}: ${error?.stack ?? error}`)
  process.exit(1)
}
const bridge = new McpBridge({ store, logger: { warn: (message) => log(message) } })

log(`ready v${SERVER_VERSION}; data=${store.statePath}`)

let closing = false
async function shutdown(exitCode = 0) {
  if (closing) return
  closing = true
  try {
    await store.close()
  } catch (error) {
    log(`store close failed: ${error?.message ?? error}`)
    exitCode = 1
  }
  // Let the last JSON-RPC response reach the parent pipe before process.exit()
  // truncates stdout.
  await new Promise((resolve) => {
    try {
      if (process.stdout.writableLength === 0) resolve()
      else process.stdout.write('', resolve)
    } catch {
      resolve()
    }
  })
  process.exit(exitCode)
}

process.on('SIGINT', () => { void shutdown(0) })
process.on('SIGTERM', () => { void shutdown(0) })
process.on('SIGHUP', () => { void shutdown(0) })
process.stdout.on('error', (error) => {
  if (error?.code === 'EPIPE') process.exit(0)
  log(`stdout error: ${error?.message ?? error}`)
  void shutdown(1)
})
process.on('uncaughtException', (error) => {
  log(`uncaught exception: ${error?.stack ?? error}`)
  void shutdown(1)
})
process.on('unhandledRejection', (error) => {
  log(`unhandled rejection: ${error?.stack ?? error}`)
  void shutdown(1)
})

const input = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
  terminal: false,
})

let queue = Promise.resolve()

function send(message) {
  if (message === null) return
  process.stdout.write(`${JSON.stringify(message)}\n`)
}

async function handleLine(line) {
  const text = line.trim()
  if (text === '') return
  let message
  try {
    message = JSON.parse(text)
  } catch (error) {
    send({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: `Parse error: ${error?.message ?? error}` },
    })
    return
  }

  try {
    const response = await bridge.handle(message, { transport: 'stdio' })
    send(response)
  } catch (error) {
    log(`dispatch failed: ${error?.stack ?? error}`)
    send({
      jsonrpc: '2.0',
      id: message && Object.prototype.hasOwnProperty.call(message, 'id') ? message.id : null,
      error: { code: -32603, message: `Internal error: ${error?.message ?? error}` },
    })
  }
}

input.on('line', (line) => {
  queue = queue.then(() => handleLine(line)).catch((error) => {
    log(`queue failure: ${error?.stack ?? error}`)
  })
})

input.on('close', () => {
  void queue.finally(() => shutdown(0))
})

input.on('error', (error) => {
  log(`stdin error: ${error?.message ?? error}`)
  void shutdown(1)
})
