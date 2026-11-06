/**
 * Client-half smoke test: load the module the way the Harness page does, run
 * the factory, and mount the plugin on a stub client context.
 *
 * Catches the mistakes that a syntax check misses — a module id that no longer
 * matches the package name, a factory that throws, or a slot that is no longer
 * registered.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const source = readFileSync(join(ROOT, 'client.js'), 'utf8')

const registered = []
const slots = []

const React = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  Fragment: 'Fragment',
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: (value) => ({ current: value }),
  useState: (value) => [typeof value === 'function' ? value() : value, () => {}],
}

const sandbox = {
  window: { __ModuleLoader__: { load: (handoff) => registered.push(handoff) } },
  document: { createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }) },
  navigator: { clipboard: { writeText: async () => {} } },
  fetch: async () => ({ ok: true, json: async () => ({ state: null }) }),
  console,
  setTimeout,
  clearTimeout,
  queueMicrotask,
}

const failures = []
const expect = (label, condition, detail) => {
  if (!condition) failures.push(`${label}${detail === undefined ? '' : `: ${detail}`}`)
}

vm.createContext(sandbox)
vm.runInContext(source, sandbox, { filename: 'client.js' })

expect('one module registration', registered.length === 1, String(registered.length))
const handoff = registered[0]
expect('registration id matches package name', handoff.id === pkg.name, `${handoff.id} vs ${pkg.name}`)
expect('registration has a factory', typeof handoff.factory === 'function')

const plugin = handoff.factory((id) => {
  if (id !== 'react') throw new Error(`unexpected require: ${id}`)
  return React
})

expect('factory returns apply', typeof plugin.apply === 'function')
expect(
  'factory injects slots and locale',
  Array.isArray(plugin.inject) && plugin.inject.includes('slots') && plugin.inject.includes('locale'),
  JSON.stringify(plugin.inject),
)

plugin.apply({
  effect: (callback) => {
    callback()
    return { dispose() {} }
  },
  slots: {
    inject: (name, callback) => {
      slots.push(name)
      callback()
      return () => {}
    },
    register: (options, component) => {
      if (typeof component !== 'function') failures.push(`slot ${options.name} registered a non-component`)
      return { dispose() {} }
    },
  },
  locale: { register: () => ({ dispose() {} }), bind: () => (key) => key },
})

expect('sidebar slot', slots.includes('sidebar.panellist'), JSON.stringify(slots))
expect('main slot', slots.includes('main'), JSON.stringify(slots))

console.log(`module id: ${handoff.id}`)
console.log(`inject: ${JSON.stringify(plugin.inject)}`)
console.log(`slots: ${JSON.stringify(slots)}`)

if (failures.length > 0) {
  console.error(`\nFAILED:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('client half loads and applies cleanly')
