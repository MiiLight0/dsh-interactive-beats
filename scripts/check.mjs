#!/usr/bin/env node
/**
 * Release gate for dsh-interactive-beats.
 *
 * Checks the package against the DeepSeek Harness bundle contract
 * (`@deepseek-ai/dsh-package-manifest`) and refuses to pass when something that
 * must stay private is about to be published. Run with `npm run check`.
 *
 * No dependencies: plain Node builtins, so it works in CI without an install.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

const failures = []
const notes = []

const fail = (message) => failures.push(message)
const ok = (message) => notes.push(message)
const readJson = (relPath) => JSON.parse(readFileSync(join(ROOT, relPath), 'utf8'))

// ── 1. package.json against the bundle contract ─────────────────────────────

const pkg = readJson('package.json')

if (pkg.private === true) fail('package.json: `private` must be absent or false; `private: true` blocks publication')

if (typeof pkg.name !== 'string' || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(pkg.name)) {
  fail(`package.json: \`name\` is not a valid npm package name: ${JSON.stringify(pkg.name)}`)
} else if (!pkg.name.startsWith('dsh-')) {
  fail(`package.json: \`name\` should use the dsh- prefix, got ${pkg.name}`)
} else {
  ok(`name: ${pkg.name}`)
}

if (typeof pkg.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version)) {
  fail(`package.json: \`version\` is not semver: ${JSON.stringify(pkg.version)}`)
} else {
  ok(`version: ${pkg.version}`)
}

if (pkg.type !== 'module') fail('package.json: `type` must be "module" (the entry uses ESM named exports)')

const bundle = pkg.dsh?.bundle
if (bundle === undefined) {
  fail('package.json: missing `dsh.bundle` — the profile would install this as a plain dependency, not a layer')
} else {
  const patches = Array.isArray(bundle.patch) ? bundle.patch : [bundle.patch]
  if (patches.length === 0) fail('package.json: `dsh.bundle.patch` is empty')
  for (const patch of patches) {
    if (typeof patch !== 'string' || patch.trim() === '') {
      fail('package.json: every `dsh.bundle.patch` entry must be a non-empty string')
    } else if (!existsSync(join(ROOT, patch))) {
      fail(`package.json: patch file not found: ${patch}`)
    } else {
      ok(`patch: ${patch}`)
    }
  }
  if (bundle.platforms !== undefined) {
    const known = new Set(['aix', 'android', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', 'win32'])
    if (!Array.isArray(bundle.platforms) || bundle.platforms.length === 0) {
      fail('package.json: `dsh.bundle.platforms` must be a non-empty list of Node platform names')
    } else {
      for (const platform of bundle.platforms) {
        if (!known.has(platform)) fail(`package.json: unknown Node platform in dsh.bundle.platforms: ${platform}`)
      }
    }
  }
}

if (pkg.dsh?.manifestVersion !== undefined && pkg.dsh.manifestVersion !== 1) {
  fail('package.json: `dsh.manifestVersion` must be 1 when present')
}

const client = pkg.dsh?.client
if (client !== undefined) {
  if (typeof client.platform !== 'string' || client.platform === '') {
    fail('package.json: `dsh.client.platform` is required for a bundle with a client half')
  } else if (client.platform !== 'web') {
    fail(`package.json: this bundle targets web, got ${client.platform}`)
  }
  if (!existsSync(join(ROOT, 'client.js'))) fail('package.json: dsh.client is declared but client.js is missing')
  for (const key of ['./client', './client.js']) {
    if (pkg.exports?.[key] !== './client.js') {
      fail(`package.json: exports["${key}"] must be "./client.js" — the exports map blocks any subpath it does not list`)
    }
  }
}

if (typeof pkg.engines?.dsh !== 'string' || pkg.engines.dsh.trim() === '') {
  fail('package.json: `engines.dsh` must declare the supported Harness range')
} else {
  ok(`engines.dsh: ${pkg.engines.dsh}`)
}

for (const field of ['license', 'description', 'repository']) {
  if (pkg[field] === undefined || pkg[field] === '') fail(`package.json: missing \`${field}\``)
}

// Advertised identity must agree with the patch row and the client module id.
const patchName = /name:\s*['"]?([^'"\s]+)['"]?/.exec(readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8'))
if (patchName === null) fail('cordis.patch.yml: no `name:` row found')
else if (patchName[1] !== pkg.name) fail(`cordis.patch.yml: row name ${patchName[1]} != package name ${pkg.name}`)
else ok('cordis.patch.yml: row name matches the package name')

const clientSource = readFileSync(join(ROOT, 'client.js'), 'utf8')
const moduleId = /__ModuleLoader__\.load\(\{\s*id:\s*['"]([^'"]+)['"]/.exec(clientSource)
if (moduleId === null) fail('client.js: could not find the __ModuleLoader__.load({ id }) registration')
else if (moduleId[1] !== pkg.name) fail(`client.js: module id ${moduleId[1]} != package name ${pkg.name}`)
else ok('client.js: module id matches the package name')

// The version in the entry is reported by the pingVersion probe, so support can
// tell builds apart without reading the tarball.
const entryVersion = /const PLUGIN_VERSION = '([^']+)'/.exec(readFileSync(join(ROOT, 'index.js'), 'utf8'))
if (entryVersion === null) fail('index.js: PLUGIN_VERSION not found')
else if (entryVersion[1] !== pkg.version) fail(`index.js: PLUGIN_VERSION ${entryVersion[1]} != package.json ${pkg.version}`)
else ok(`PLUGIN_VERSION: ${entryVersion[1]}`)

// Repository identity: a stale personal owner in one file and an organisation in
// another is the classic way a first release ships broken install commands.
const repoUrl = typeof pkg.repository === 'string' ? pkg.repository : (pkg.repository?.url ?? '')
const repoMatch = /github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?(?:#|$)/.exec(repoUrl)
let expectedAdd = null
if (repoMatch === null) {
  fail(`package.json: repository.url is not a GitHub URL: ${JSON.stringify(repoUrl)}`)
} else {
  const [, owner, repo] = repoMatch
  if (repo !== pkg.name) fail(`package.json: repository name ${repo} != package name ${pkg.name}`)
  else ok(`repository: ${owner}/${repo}`)
  expectedAdd = `github:${owner}/${pkg.name}`
}

if (expectedAdd !== null) {
  for (const doc of ['README.md', 'README.zh-CN.md']) {
    if (!existsSync(join(ROOT, doc))) continue
    const lines = readFileSync(join(ROOT, doc), 'utf8').split('\n')
    let seen = 0
    for (const line of lines) {
      if (!line.includes('dsh plugin') || !line.includes(' add ')) continue
      if (!line.includes('github:')) continue
      seen += 1
      if (!line.includes(expectedAdd)) fail(`${doc}: install command does not use ${expectedAdd}\n      ${line.trim()}`)
    }
    if (seen === 0) fail(`${doc}: no \`dsh plugin ... add github:...\` install command found`)
    else ok(`${doc}: ${seen} GitHub install command(s) match the repository owner`)
  }
}

// README obligations from the official publishing guide.
const README_SECTIONS = {
  'README.md': [
    ['install', /^##+ .*install/im],
    ['configuration', /^##+ .*config/im],
    ['model experience', /^##+ .*model experience/im],
    ['known limitations', /^##+ .*known limitations/im],
    ['privacy', /^##+ .*(privacy|data)/im],
  ],
  'README.zh-CN.md': [
    ['install', /^##+ .*(安装|Install)/m],
    ['configuration', /^##+ .*(配置|Config)/m],
    ['model experience', /^##+ .*(Model Experience|模型视角)/im],
    ['known limitations', /^##+ .*(已知限制|Known Limitations)/im],
    ['privacy', /^##+ .*(隐私|数据|Privacy)/im],
  ],
}
for (const [doc, sections] of Object.entries(README_SECTIONS)) {
  if (!existsSync(join(ROOT, doc))) {
    fail(`missing required file: ${doc}`)
    continue
  }
  const body = readFileSync(join(ROOT, doc), 'utf8')
  const missing = sections.filter(([, pattern]) => !pattern.test(body)).map(([name]) => name)
  if (missing.length > 0) fail(`${doc}: missing required section(s): ${missing.join(', ')}`)
  else ok(`${doc}: all required sections present`)
}

// Marketplace metadata: a malformed locale file ships an empty listing.
for (const locale of ['locale/zh.json', 'locale/en.json']) {
  if (!existsSync(join(ROOT, locale))) {
    fail(`missing required file: ${locale}`)
    continue
  }
  let data
  try {
    data = readJson(locale)
  } catch (error) {
    fail(`${locale}: not valid JSON (${error.message})`)
    continue
  }
  const title = data?.meta?.title
  const description = data?.meta?.description
  if (typeof title !== 'string' || title.trim() === '') fail(`${locale}: meta.title is required`)
  else if (typeof description !== 'string' || description.trim().length < 40) {
    fail(`${locale}: meta.description is too short to be useful in a listing`)
  } else {
    ok(`${locale}: ${title}`)
  }
}

// README images that live in the repo must also be inside the published `files`
// list, otherwise the README renders broken on every consumer that is not the
// repository page itself.
const fileEntryMatches = (path) => {
  const normalized = path.replace(/^\.\//, '')
  return (pkg.files ?? []).some((entry) => {
    const pattern = entry
      .replace(/^\.\//, '')
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]*')
      .replace(/\*\*/g, '.*')
    return new RegExp(`^${pattern}$`).test(normalized)
  })
}

for (const doc of ['README.md', 'README.zh-CN.md']) {
  if (!existsSync(join(ROOT, doc))) continue
  const body = readFileSync(join(ROOT, doc), 'utf8')
  const sources = [...body.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1])
  let local = 0
  for (const src of sources) {
    if (!src.startsWith('./')) continue
    local += 1
    if (!existsSync(join(ROOT, src))) fail(`${doc}: image not found on disk: ${src}`)
    else if (!fileEntryMatches(src)) fail(`${doc}: image ${src} is not covered by package.json "files" — it would break on npm`)
  }
  ok(`${doc}: ${sources.length} image(s), ${local} local and shippable`)
}

// The changelog's newest entry has to be the version being released.
if (existsSync(join(ROOT, 'CHANGELOG.md'))) {
  const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8')
  const heading = /^##\s+\[?([0-9]+\.[0-9]+\.[0-9]+[^\]\s]*)\]?/m.exec(changelog)
  if (heading === null) fail('CHANGELOG.md: no versioned heading found')
  else if (heading[1] !== pkg.version) fail(`CHANGELOG.md: newest entry is ${heading[1]}, package is ${pkg.version}`)
  else ok(`CHANGELOG.md: newest entry is ${pkg.version}`)
}

// ── 2. published payload ────────────────────────────────────────────────────

if (!Array.isArray(pkg.files) || pkg.files.length === 0) {
  fail('package.json: `files` must list the published payload')
} else {
  for (const entry of pkg.files) {
    if (entry.includes('*')) continue
    if (!existsSync(join(ROOT, entry))) fail(`package.json: files entry not found: ${entry}`)
  }
}

for (const required of ['README.md', 'LICENSE', 'index.js', 'client.js', 'cordis.patch.yml']) {
  if (!existsSync(join(ROOT, required))) fail(`missing required file: ${required}`)
}

if (pkg.icon !== undefined) {
  const iconPath = join(ROOT, pkg.icon)
  if (!existsSync(iconPath)) fail(`package.json: icon not found: ${pkg.icon}`)
  else if (!/\.(svg|png|jpe?g|webp)$/i.test(pkg.icon)) fail(`package.json: icon must be svg/png/jpeg/webp: ${pkg.icon}`)
  else if (statSync(iconPath).size > 256 * 1024) fail(`package.json: icon exceeds the 256 KiB manifest limit: ${pkg.icon}`)
  else ok(`icon: ${pkg.icon} (${statSync(iconPath).size} bytes)`)
}

// ── 3. the client half must work in every shell ─────────────────────────────

// Electron replaces window.prompt with a stub that throws, and the throw lands
// inside a React handler: the click looks like it did nothing. window.confirm
// survives today but blocks the renderer and does not exist in TUI or headless
// shells, so the panel keeps its own dialogs.
for (const call of ['prompt', 'confirm', 'alert']) {
  if (new RegExp(`\\bwindow\\.${call}\\s*\\(`).test(clientSource)) {
    fail(`client.js: window.${call}() is not portable — the desktop shell throws on prompt; use the in-panel dialog`)
  }
}
ok('client.js: no native prompt/confirm/alert calls')

// Both dictionaries are registered as-is, and makeTr falls back to Chinese for
// a missing key. A half-filled en dictionary therefore ships a half-Chinese UI.
const parseDictionary = (name) => {
  const start = clientSource.indexOf(`const ${name} = {`)
  if (start < 0) return null
  const end = clientSource.indexOf('\n    }', start)
  if (end < 0) return null
  const map = new Map()
  for (const line of clientSource.slice(start, end).split('\n')) {
    const match = /^\s+'([^']+)':\s*(.+),$/.exec(line)
    if (match !== null) map.set(match[1], match[2])
  }
  return map
}
const zhDict = parseDictionary('zh')
const enDict = parseDictionary('en')
if (zhDict === null || enDict === null || zhDict.size === 0) {
  fail('client.js: could not parse the zh/en dictionaries')
} else {
  const missingEn = [...zhDict.keys()].filter((key) => !enDict.has(key))
  if (missingEn.length > 0) {
    fail(`client.js: ${missingEn.length} key(s) missing from en — they render in Chinese: ${missingEn.slice(0, 6).join(', ')}`)
  } else {
    ok(`locale: ${zhDict.size} keys present in both zh and en`)
  }
  const placeholders = (value) => (value.match(/\{(\w+)\}/g) ?? []).sort().join(',')
  const drift = [...zhDict]
    .filter(([key, value]) => enDict.has(key) && placeholders(value) !== placeholders(enDict.get(key)))
    .map(([key]) => key)
  if (drift.length > 0) fail(`client.js: zh/en placeholder mismatch: ${drift.slice(0, 6).join(', ')}`)
}

// ── 4. syntax of every shipped JavaScript file ──────────────────────────────

const scripts = [
  'index.js',
  'client.js',
  ...(existsSync(join(ROOT, 'scripts'))
    ? readdirSync(join(ROOT, 'scripts'))
        .filter((name) => name.endsWith('.mjs'))
        .map((name) => `scripts/${name}`)
    : []),
  ...(existsSync(join(ROOT, 'seed')) ? ['seed/templates.js'] : []),
  ...(existsSync(join(ROOT, 'test'))
    ? readdirSync(join(ROOT, 'test'))
        .filter((name) => name.endsWith('.mjs'))
        .map((name) => `test/${name}`)
    : []),
]
for (const file of scripts) {
  try {
    execFileSync(process.execPath, ['--check', join(ROOT, file)], { stdio: 'pipe' })
    ok(`syntax: ${file}`)
  } catch (error) {
    fail(`syntax error in ${file}: ${String(error.stderr ?? error.message).trim().split('\n')[0]}`)
  }
}

// ── 5. privacy gate ────────────────────────────────────────────────────────

const SCAN_SKIP = new Set(['scripts/check.mjs'])
const SCAN_EXTENSIONS = ['.js', '.mjs', '.json', '.yml', '.yaml', '.md', '.svg', '.txt']

const FORBIDDEN = [
  { pattern: /\/Users\/[A-Za-z0-9._-]+/, label: 'absolute macOS home path' },
  { pattern: /[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}[A-Za-z0-9._-]+/, label: 'absolute Windows home path' },
  { pattern: /\b(?:10|127)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, label: 'loopback or private IPv4 address' },
  { pattern: /\b192\.168\.\d{1,3}\.\d{1,3}\b/, label: 'private IPv4 address' },
  { pattern: /\bsk-[A-Za-z0-9_-]{16,}/, label: 'OpenAI-style secret' },
  { pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}/, label: 'GitHub token' },
  { pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}/, label: 'Slack token' },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/, label: 'AWS access key id' },
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, label: 'private key block' },
  { pattern: /@(?:gmail|googlemail|qq|163|126|yeah|sina|sohu|foxmail|outlook|hotmail|live|icloud)\.(?:com|cn|net)\b/i, label: 'personal email domain' },
  { pattern: /uniapi|magpie|chapter-gacha|@local\//i, label: 'internal project or gateway codename' }
]

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      yield* walk(full)
    } else {
      yield full
    }
  }
}

let scanned = 0
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file)
  if (SCAN_SKIP.has(rel)) continue
  if (!SCAN_EXTENSIONS.some((extension) => rel.endsWith(extension))) continue
  const text = readFileSync(file, 'utf8')
  scanned += 1
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(text)) fail(`privacy: ${rel} contains ${rule.label}`)
  }
}
ok(`privacy: scanned ${scanned} files for secrets, home paths and internal codenames`)

// ── report ─────────────────────────────────────────────────────────────────

for (const note of notes) process.stdout.write(`  ok  ${note}\n`)
if (failures.length > 0) {
  process.stdout.write('\n')
  for (const failure of failures) process.stdout.write(`  !!  ${failure}\n`)
  process.stdout.write(`\n${failures.length} check(s) failed.\n`)
  process.exit(1)
}
process.stdout.write(`\nAll ${notes.length} checks passed.\n`)
