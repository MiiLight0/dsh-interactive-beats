/**
 * Host-half smoke test: import the entry, mount it on a stub Cordis context,
 * and drive the same-origin route with a fake request/response pair.
 *
 * No Harness runtime and no dependencies: this checks the parts a reviewer can
 * verify offline — named exports, reversible route registration, the origin
 * guard, method handling and the state payload shape.
 */
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

// The store must follow ctx.profileContext.dir, so two profiles never share a
// file. Deliberately no DSH_PROFILE_DIR here: that env var is only a fallback.
const profileDir = join(mkdtempSync(join(tmpdir(), 'bf-host-')), 'profiles', 'smoke')
const storeFile = join(profileDir, 'plugin-data', 'interactive-beats.json')

const mod = await import(join(ROOT, 'index.js'))

const failures = []
const expect = (label, condition, detail) => {
  if (!condition) failures.push(`${label}${detail === undefined ? '' : `: ${detail}`}`)
}

expect('named export name', typeof mod.name === 'string', String(mod.name))
expect('named export inject', Array.isArray(mod.inject) && mod.inject.includes('webServer'), JSON.stringify(mod.inject))
expect('named export apply', typeof mod.apply === 'function')
expect('no default export (would drop inject)', mod.default === undefined, String(mod.default))

let route
const disposed = []
const ctx = {
  get: () => undefined,
  profileContext: { dir: profileDir },
  effect: (factory, label) => {
    const result = factory()
    disposed.push(label)
    return { dispose: () => result?.dispose?.() }
  },
  webServer: {
    register: (options) => {
      route = options
      return { dispose() {} }
    },
  },
}

mod.apply(ctx)

expect('route registered', route !== undefined)
expect('route path', route?.path === '/interactive-beats/api', String(route?.path))
expect('route is exact', route?.kind === 'exact', String(route?.kind))
expect('route handler', typeof route?.handler === 'function')
expect('registered through ctx.effect', disposed.length === 1, JSON.stringify(disposed))

function call(method, body, headers = {}) {
  return new Promise((resolve) => {
    // A non-IP host keeps this file clean for the privacy gate in scripts/check.mjs.
    const host = 'harness.test:3080'
    const req = { method, headers: { host, origin: `http://${host}`, ...headers } }
    req[Symbol.asyncIterator] = async function* iterator() {
      if (body !== undefined) yield Buffer.from(JSON.stringify(body))
    }
    const chunks = []
    const res = {
      statusCode: 0,
      headers: {},
      setHeader(key, value) {
        this.headers[key] = value
      },
      end(chunk) {
        if (chunk !== undefined) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
        const text = Buffer.concat(chunks).toString('utf8')
        resolve({ status: this.statusCode, body: text === '' ? null : JSON.parse(text) })
      },
    }
    route.handler(req, res)
  })
}

const created = await call('POST', { action: 'createProject', title: 'Smoke project' })
expect('createProject status', created.status === 200, String(created.status))
expect('createProject returns state', created.body?.state?.projects?.length === 1)
expect('store follows ctx.profileContext.dir', existsSync(storeFile), storeFile)

const rejected = await call('POST', { action: 'createProject', title: 'x' }, { origin: 'https://evil.example' })
expect('cross-origin rejected', rejected.status === 403, String(rejected.status))

const unknown = await call('POST', { action: 'nope' })
expect('unknown action rejected', unknown.status === 400, String(unknown.status))

const badMethod = await call('PUT')
expect('unsupported method', badMethod.status === 405, String(badMethod.status))

const state = await call('GET')
expect('GET returns state', state.status === 200 && Array.isArray(state.body?.state?.projects))
expect('state hides version snapshots', JSON.stringify(state.body).includes('versions') === false)

console.log(`name: ${mod.name}`)
console.log(`inject: ${JSON.stringify(mod.inject)}`)
console.log(`route: ${route.kind} ${route.path}`)
console.log(`store: ${storeFile}`)
console.log(
  `createProject -> ${created.status}, GET -> ${state.status}, cross-origin -> ${rejected.status}, ` +
    `unknown action -> ${unknown.status}, PUT -> ${badMethod.status}`,
)

if (failures.length > 0) {
  console.error(`\nFAILED:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('host half mounts, serves and guards the route')
