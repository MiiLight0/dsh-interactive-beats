/**
 * Host half of the 15-Beat Foundation bundle.
 *
 * Owns the durable project store, the 15-beat seed, model calls for
 * "material -> 15 beats" and per-beat / whole-sheet review, and the same-origin
 * JSON route used by the sidebar panel. The external model key lives in the
 * Host credential service and is never sent to the browser.
 */
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { beatTemplates } from './seed/templates.js'

const ROUTE_PATH = '/interactive-beats/api'
const PLUGIN_VERSION = '0.2.0'
const STATE_VERSION = 1
const SEED_VERSION = 0
const STORE_NAME = 'interactive-beats.json'
const EXTERNAL_CREDENTIAL = 'interactive-beats:external-model-key'
const MAX_BODY_BYTES = 2 * 1024 * 1024
const MAX_PROJECTS = 20
const MAX_TITLE = 120
const MAX_MATERIAL = 120000
const MAX_BRIEF = 8000
const MAX_CONTENT = 6000
const MAX_ONE_LINE = 400
const MAX_TURN = 1200
const MAX_HOOK = 800
const MAX_SOURCE = 2400
const MAX_NOTES = 4000
const MAX_EPISODE_HINT = 200
const MAX_VERSIONS = 30
const MAX_BATCH_KEYS = 6
const MAX_INSTRUCTION = 2000
const MAX_VERSION_NOTE = 500
const BATCH_FIELDS = ['oneLine', 'content', 'turn', 'hook']
const BATCH_OPS = new Set(['rewrite', 'tighten', 'conflict', 'hook'])
const BATCH_TARGETS = new Set(['all', 'oneLine', 'content', 'turn', 'hook'])
const MODEL_TIMEOUT_MS = 240000
const DEFAULT_EXTERNAL_BASE = ''
const DEFAULT_EXTERNAL_MODEL = ''
const DIMENSIONS = ['function', 'causality', 'character', 'theme', 'hook']
const DIMENSION_WEIGHTS = { function: 0.3, causality: 0.25, character: 0.2, theme: 0.15, hook: 0.1 }

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/**
 * In-memory handoff for "compare generation": the host runs the same prompt on
 * the primary and secondary routes, keeps the normalized sheets here, and the
 * panel applies the chosen one by token. Nothing is written until apply, and a
 * host reload simply drops stale candidates.
 */
const generationCandidates = new Map()
const MAX_GENERATION_CANDIDATES = 24

function rememberCandidate(entry) {
  const id = randomUUID()
  generationCandidates.set(id, entry)
  while (generationCandidates.size > MAX_GENERATION_CANDIDATES) {
    const oldest = generationCandidates.keys().next().value
    if (oldest === undefined) break
    generationCandidates.delete(oldest)
  }
  return id
}

/**
 * Where this profile keeps plugin data.
 *
 * `ctx.profileContext.dir` is the only authoritative source: it is supplied by
 * the launcher and points at `$DSH_HOME/profiles/<name>`, so two profiles get
 * two stores. The env var is a test hook for hosts that mount the entry
 * without a profile (and for the smoke test), and `~/.dsh` is the last resort.
 */
function resolveDataDir(ctx) {
  const profileDir = ctx?.profileContext?.dir
  if (typeof profileDir === 'string' && profileDir !== '') return join(profileDir, 'plugin-data')
  const fromEnv = process.env.DSH_PROFILE_DIR
  if (typeof fromEnv === 'string' && fromEnv !== '') return join(fromEnv, 'plugin-data')
  return join(homedir(), '.dsh', 'plugin-data')
}

function now() {
  return Date.now()
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function text(value, limit) {
  if (typeof value !== 'string') return ''
  const cut = value.slice(0, limit)
  // Never split a surrogate pair: half an emoji renders as a replacement box
  // everywhere downstream, including in exports.
  const last = cut.charCodeAt(cut.length - 1)
  return last >= 0xd800 && last <= 0xdbff ? cut.slice(0, -1) : cut
}

function trimmed(value, limit) {
  return text(value, limit).trim()
}

function integer(value, fallback, min, max) {
  const parsed = Number.isFinite(value) ? Math.trunc(value) : fallback
  return Math.min(max, Math.max(min, parsed))
}

function stringArray(value, limit, itemLimit) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().slice(0, itemLimit))
    .filter((item) => item !== '')
    .slice(0, limit)
}

function emptyProject(title) {
  const stamp = now()
  return {
    id: randomUUID(),
    title: trimmed(title, MAX_TITLE) || '未命名项目',
    material: '',
    brief: emptyBrief(),
    beats: beatTemplates.map((template) => emptyBeat(template)),
    sheetReview: null,
    generation: null,
    createdAt: stamp,
    updatedAt: stamp,
  }
}

function emptyBrief() {
  return {
    logline: '',
    theme: '',
    format: '',
    structureNotes: '',
  }
}

function emptyBeat(template) {
  return {
    key: template.key,
    oneLine: '',
    content: '',
    turn: '',
    hook: '',
    page: template.targetPage,
    episodeHint: '',
    sourceNote: '',
    notes: '',
    checks: {},
    status: 'draft',
    locked: false,
    review: null,
    versions: [],
    updatedAt: now(),
  }
}

function emptyState() {
  return {
    version: STATE_VERSION,
    seedVersion: null,
    activeProjectId: null,
    projects: [],
    settings: defaultSettings(),
    createdAt: now(),
    updatedAt: now(),
  }
}

function defaultSettings() {
  return {
    reviewMode: 'single',
    primary: { mode: 'default' },
    secondary: { mode: 'none' },
    externalBaseURL: DEFAULT_EXTERNAL_BASE,
    externalModel: DEFAULT_EXTERNAL_MODEL,
  }
}

function normalizeModelRef(value, fallbackMode) {
  const source = value !== null && typeof value === 'object' ? value : {}
  const mode =
    source.mode === 'dsh' || source.mode === 'external' || source.mode === 'none' || source.mode === 'default'
      ? source.mode
      : fallbackMode
  if (mode === 'dsh') {
    const provider = trimmed(source.provider, 120)
    const model = trimmed(source.model, 240)
    if (provider !== '' && model !== '') return { mode: 'dsh', provider, model }
    return { mode: fallbackMode === 'none' ? 'none' : 'default' }
  }
  if (mode === 'external') return { mode: 'external' }
  if (mode === 'none') return { mode: 'none' }
  return { mode: 'default' }
}

function normalizeSettings(value) {
  const source = value !== null && typeof value === 'object' ? value : {}
  const primary = normalizeModelRef(source.primary, 'default')
  const secondary = normalizeModelRef(source.secondary, 'none')
  return {
    reviewMode: source.reviewMode === 'dual' ? 'dual' : 'single',
    primary: primary.mode === 'none' ? { mode: 'default' } : primary,
    secondary: secondary.mode === 'default' ? { mode: 'none' } : secondary,
    externalBaseURL: trimmed(source.externalBaseURL, 2000) || DEFAULT_EXTERNAL_BASE,
    externalModel: trimmed(source.externalModel, 200) || DEFAULT_EXTERNAL_MODEL,
  }
}

function normalizeBrief(value) {
  const source = value !== null && typeof value === 'object' ? value : {}
  return {
    logline: trimmed(source.logline, MAX_BRIEF),
    theme: trimmed(source.theme, MAX_BRIEF),
    format: trimmed(source.format, MAX_BRIEF),
    structureNotes: text(source.structureNotes, MAX_BRIEF),
  }
}

function clampScore(value, fallback = 6) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(10, Math.max(1, Math.round(number * 10) / 10))
}

function clampTotal(value, fallback = 0) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(100, Math.max(0, Math.round(number)))
}

function weightedTotal(dimensions) {
  let total = 0
  for (const key of DIMENSIONS) total += dimensions[key] * DIMENSION_WEIGHTS[key]
  return Math.round(total * 10)
}

function normalizeDimensions(value) {
  const source = value !== null && typeof value === 'object' ? value : {}
  return {
    function: clampScore(source.function),
    causality: clampScore(source.causality),
    character: clampScore(source.character),
    theme: clampScore(source.theme),
    hook: clampScore(source.hook),
  }
}

function normalizeReview(value, modelLabel) {
  if (value === null || typeof value !== 'object') return null
  const dimensions = normalizeDimensions(value.dimensions ?? value.scores ?? value)
  const issues = stringArray(value.issues, 8, 600)
  const alternatives = stringArray(value.alternatives, 4, 900)
  const verdict = trimmed(value.verdict ?? value.summary ?? '', 1600)
  const fix = trimmed(value.fix ?? value.rewrite ?? value.suggestion ?? '', 2400)
  const hasShape = verdict !== '' || fix !== '' || issues.length > 0 || alternatives.length > 0
  if (!hasShape) return null
  return {
    model: trimmed(modelLabel, 200),
    at: now(),
    score: weightedTotal(dimensions),
    dimensions,
    verdict,
    issues,
    fix,
    alternatives,
  }
}

function normalizeReviewRecord(value) {
  if (value === null || typeof value !== 'object') return null
  const primary = normalizeReview(value.primary ?? value, value.primary?.model ?? value.model ?? '')
  const secondary = normalizeReview(value.secondary, value.secondary?.model ?? '')
  if (primary === null && secondary === null) return null
  return { primary, secondary }
}

function normalizeSheetReview(value) {
  if (value === null || typeof value !== 'object') return null
  const primary = normalizeOneSheetReview(value.primary ?? value, value.model ?? '')
  const secondary = normalizeOneSheetReview(value.secondary, value.secondary?.model ?? '')
  if (primary === null && secondary === null) return null
  return { primary, secondary }
}

function normalizeOneSheetReview(value, modelLabel) {
  if (value === null || typeof value !== 'object') return null
  const acts = value.acts !== null && typeof value.acts === 'object' ? value.acts : {}
  const issues = stringArray(value.issues, 10, 700)
  const topFixes = stringArray(value.topFixes ?? value.fixes, 8, 900)
  const verdict = trimmed(value.verdict ?? value.summary ?? '', 2000)
  const hasShape = verdict !== '' || issues.length > 0 || topFixes.length > 0
  if (!hasShape) return null
  return {
    model: trimmed(modelLabel, 200),
    at: now(),
    overall: clampTotal(value.overall ?? value.score),
    acts: {
      act1: clampTotal(acts.act1 ?? acts.actOne),
      act2: clampTotal(acts.act2 ?? acts.actTwo),
      act3: clampTotal(acts.act3 ?? acts.actThree),
    },
    verdict,
    issues,
    topFixes,
  }
}

function normalizeChecks(value) {
  const checks = {}
  if (value !== null && typeof value === 'object') {
    for (const [key, checked] of Object.entries(value)) {
      if (typeof key === 'string' && key.length <= 8 && checked === true) checks[key] = true
    }
  }
  return checks
}

function normalizeVersion(value) {
  if (value === null || typeof value !== 'object') return null
  const source = value.snapshot !== null && typeof value.snapshot === 'object' ? value.snapshot : value
  const snapshot = {
    oneLine: trimmed(source.oneLine, MAX_ONE_LINE),
    content: text(source.content, MAX_CONTENT),
    turn: trimmed(source.turn, MAX_TURN),
    hook: trimmed(source.hook, MAX_HOOK),
    page: integer(source.page, 1, 1, 300),
    episodeHint: trimmed(source.episodeHint, MAX_EPISODE_HINT),
    sourceNote: trimmed(source.sourceNote, MAX_SOURCE),
    notes: text(source.notes, MAX_NOTES),
    checks: normalizeChecks(source.checks),
    status: source.status === 'final' ? 'final' : 'draft',
  }
  const hasContent =
    snapshot.oneLine !== '' ||
    snapshot.content !== '' ||
    snapshot.turn !== '' ||
    snapshot.hook !== '' ||
    snapshot.sourceNote !== '' ||
    snapshot.notes !== ''
  if (!hasContent) return null
  const sourceKind = ['manual', 'ai-batch', 'restore'].includes(value.source) ? value.source : 'manual'
  return {
    id: typeof value.id === 'string' && value.id !== '' ? value.id : randomUUID(),
    at: Number.isFinite(value.at) ? value.at : now(),
    source: sourceKind,
    note: trimmed(value.note, MAX_VERSION_NOTE),
    starred: value.starred === true,
    snapshot,
  }
}

function normalizeVersions(value) {
  if (!Array.isArray(value)) return []
  return value.map(normalizeVersion).filter(Boolean).slice(-MAX_VERSIONS)
}

function snapshotOf(beat) {
  return {
    oneLine: beat.oneLine,
    content: beat.content,
    turn: beat.turn,
    hook: beat.hook,
    page: beat.page,
    episodeHint: beat.episodeHint,
    sourceNote: beat.sourceNote,
    notes: beat.notes,
    checks: { ...beat.checks },
    status: beat.status,
  }
}

function pushVersion(beat, source, note) {
  const snapshot = snapshotOf(beat)
  const versions = Array.isArray(beat.versions) ? beat.versions : []
  const last = versions[versions.length - 1]
  if (last !== undefined && JSON.stringify(last.snapshot) === JSON.stringify(snapshot)) return beat
  return {
    ...beat,
    versions: [...versions, { id: randomUUID(), at: now(), source, note: trimmed(note, MAX_VERSION_NOTE), snapshot }].slice(-MAX_VERSIONS),
  }
}

function normalizeBeat(value, template) {
  const source = value !== null && typeof value === 'object' ? value : {}
  const rawStatus = source.status === 'final' || source.status === 'locked' ? 'final' : 'draft'
  return {
    key: template.key,
    oneLine: trimmed(source.oneLine, MAX_ONE_LINE),
    content: text(source.content, MAX_CONTENT),
    turn: trimmed(source.turn, MAX_TURN),
    hook: trimmed(source.hook, MAX_HOOK),
    page: integer(source.page, template.targetPage, 1, 300),
    episodeHint: trimmed(source.episodeHint, MAX_EPISODE_HINT),
    sourceNote: trimmed(source.sourceNote, MAX_SOURCE),
    notes: text(source.notes, MAX_NOTES),
    checks: normalizeChecks(source.checks),
    status: rawStatus,
    locked: source.locked === true && rawStatus === 'final',
    review: normalizeReviewRecord(source.review),
    versions: normalizeVersions(source.versions),
    updatedAt: now(),
  }
}

function normalizeProject(value) {
  const source = value !== null && typeof value === 'object' ? value : {}
  const stamp = now()
  const byKey = new Map()
  if (Array.isArray(source.beats)) {
    for (const beat of source.beats) {
      if (beat !== null && typeof beat === 'object' && typeof beat.key === 'string') byKey.set(beat.key, beat)
    }
  } else if (source.beats !== null && typeof source.beats === 'object') {
    for (const [key, beat] of Object.entries(source.beats)) byKey.set(key, beat)
  }
  return {
    id: typeof source.id === 'string' && source.id !== '' ? source.id : randomUUID(),
    title: trimmed(source.title, MAX_TITLE) || '未命名项目',
    material: text(source.material, MAX_MATERIAL),
    brief: normalizeBrief(source.brief),
    beats: beatTemplates.map((template) => normalizeBeat(byKey.get(template.key), template)),
    sheetReview: normalizeSheetReview(source.sheetReview),
    generation: normalizeGeneration(source.generation),
    createdAt: Number.isFinite(source.createdAt) ? source.createdAt : stamp,
    updatedAt: Number.isFinite(source.updatedAt) ? source.updatedAt : stamp,
  }
}

function normalizeGeneration(value) {
  if (value === null || typeof value !== 'object') return null
  return {
    at: Number.isFinite(value.at) ? value.at : now(),
    model: trimmed(value.model, 200),
    missingMaterial: stringArray(value.missingMaterial, 8, 500),
    warnings: stringArray(value.warnings, 8, 500),
  }
}

function normalizeState(value) {
  if (value === null || typeof value !== 'object') return emptyState()
  const projects = Array.isArray(value.projects)
    ? value.projects.filter((project) => project !== null && typeof project === 'object').slice(0, MAX_PROJECTS).map(normalizeProject)
    : []
  const activeProjectId =
    typeof value.activeProjectId === 'string' && projects.some((project) => project.id === value.activeProjectId)
      ? value.activeProjectId
      : projects[0]?.id ?? null
  return {
    version: STATE_VERSION,
    seedVersion: value.seedVersion === SEED_VERSION ? SEED_VERSION : null,
    activeProjectId,
    projects,
    settings: normalizeSettings(value.settings),
    createdAt: Number.isFinite(value.createdAt) ? value.createdAt : now(),
    updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt : now(),
  }
}

function hasBeatText(beat) {
  return [beat.oneLine, beat.content, beat.turn, beat.hook, beat.sourceNote, beat.notes].some(
    (value) => typeof value === 'string' && value.trim() !== '',
  )
}

function versionCount(beat) {
  return Array.isArray(beat.versions) ? beat.versions.length : 0
}

function needsInitialVersions(state) {
  return state.projects.some((project) => project.beats.some((beat) => hasBeatText(beat) && versionCount(beat) === 0))
}

function addInitialVersions(state) {
  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      beats: project.beats.map((beat) =>
        hasBeatText(beat) && versionCount(beat) === 0 ? pushVersion(beat, 'manual', '初始稿') : beat,
      ),
    })),
  }
}

/**
 * `resolveDir` is read on first I/O rather than at apply time: the launcher
 * attaches `profileContext` to the root context, and this plugin may be mounted
 * a tick before that, so binding late is the only safe order.
 */
function createStore(resolveDir) {
  let storeFile
  const file = () => {
    if (storeFile === undefined) storeFile = join(resolveDir(), STORE_NAME)
    return storeFile
  }
  let cache
  let queue = Promise.resolve()

  async function load() {
    if (cache !== undefined) return cache
    try {
      const raw = await readFile(file(), 'utf8')
      cache = normalizeState(JSON.parse(raw))
    } catch (error) {
      if (error?.code !== 'ENOENT') console.error('[interactive-beats] could not read store', error)
      cache = emptyState()
    }
    return cache
  }

  async function write(value) {
    const target = file()
    await mkdir(dirname(target), { recursive: true })
    const temp = `${target}.${process.pid}.${Date.now()}.tmp`
    await writeFile(temp, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 })
    await rename(temp, target)
    try {
      await chmod(target, 0o600)
    } catch {
      // Best effort on platforms that do not support chmod.
    }
  }

  return {
    state: load,
    async update(mutator) {
      const run = async () => {
        const current = await load()
        const next = mutator(clone(current))
        next.version = STATE_VERSION
        next.updatedAt = now()
        // Write first: if the disk is full or read-only, memory must not claim a
        // change that never reached the file.
        await write(next)
        cache = next
        return next
      }
      const result = queue.then(run, run)
      queue = result.catch(() => undefined)
      return result
    },
  }
}

function abortAfter(ms) {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  if (typeof timer.unref === 'function') timer.unref()
  return controller.signal
}

async function readExternalKey(ctx) {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) return undefined
  try {
    const record = await credentials.readRecord(EXTERNAL_CREDENTIAL)
    if (record === undefined || record.kind !== 'api-key') return undefined
    return typeof record.key === 'string' && record.key !== '' ? record.key : undefined
  } catch {
    return undefined
  }
}

async function saveExternalKey(ctx, value) {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) throw new HttpError(503, '凭据服务不可用，无法保存外部模型 Key。')
  const key = trimmed(value, 4096)
  if (key === '') throw new HttpError(400, 'Key 不能为空。')
  await credentials.modifyRecord(EXTERNAL_CREDENTIAL, async (current) =>
    current !== undefined && current.kind === 'api-key' ? { ...current, key } : { kind: 'api-key', key },
  )
}

async function clearExternalKey(ctx) {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) return
  try {
    await credentials.deleteRecord(EXTERNAL_CREDENTIAL)
  } catch {
    // Nothing to clear.
  }
}

function chatCompletionsUrl(baseURL) {
  const value = typeof baseURL === 'string' ? baseURL.trim() : ''
  if (value === '') {
    throw new HttpError(400, '请先在模型设置里填写外部接口地址（OpenAI Chat Completions 兼容端点）。')
  }
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new HttpError(400, '外部接口地址不是合法的 URL，请写完整（含 https:// 或 http://）。')
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new HttpError(400, `外部接口地址只支持 http/https，收到的是 ${parsed.protocol}`)
  }
  if (/\/chat\/completions\/?$/i.test(value)) return value.replace(/\/$/, '')
  return `${value.replace(/\/+$/, '')}/chat/completions`
}

function requireExternalModel(model) {
  const value = typeof model === 'string' ? model.trim() : ''
  if (value === '') throw new HttpError(400, '请先在模型设置里填写外部模型名称。')
  return value
}

function failureMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

async function callDshModel(ctx, route, messages, options = {}) {
  const llm = ctx.get('llm')
  if (llm === undefined) throw new HttpError(503, '当前 DSH 没有可用的 LLM 服务。')
  const signal = abortAfter(options.timeoutMs ?? MODEL_TIMEOUT_MS)
  let prepared
  try {
    prepared = await llm.prepareCall(
      {
        provider: route.provider,
        model: route.model,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 12000,
      },
      signal,
    )
  } catch (error) {
    throw new HttpError(400, `模型配置不可用：${failureMessage(error)}`)
  }
  const normalized = messages.map((message) =>
    typeof message.content === 'string'
      ? { role: message.role, content: [{ type: 'text', text: message.content }] }
      : message,
  )
  const request = { ...prepared.config, messages: normalized, signal }
  if (options.system !== undefined) request.system = options.system
  let result = ''
  let blockText = ''
  let failure
  try {
    for await (const chunk of prepared.stream(request)) {
      if (chunk.type === 'text-delta') result += chunk.text
      else if (chunk.type === 'block-end' && chunk.block?.type === 'text') blockText += chunk.block.text
      else if (
        chunk.type === 'finish' &&
        chunk.reason !== undefined &&
        (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted')
      ) {
        failure = chunk.reason.failure
      }
    }
  } catch (error) {
    // A provider that drops the connection mid-stream surfaces here; report it
    // as a model failure instead of an opaque 500.
    throw new HttpError(502, `模型响应中断：${failureMessage(error)}`)
  }
  if (failure !== undefined) {
    const suffix = failure.status === undefined ? '' : `（HTTP ${failure.status}）`
    const code = failure.code === undefined ? '' : ` [${failure.code}]`
    throw new HttpError(502, `模型调用失败${suffix}${code}：${failure.message}`)
  }
  const content = result.trim() || blockText.trim()
  if (content === '') throw new HttpError(502, '模型返回了空内容。')
  return content
}

async function callExternalModel(ctx, route, messages, options = {}) {
  const key = await readExternalKey(ctx)
  if (key === undefined) throw new HttpError(400, '尚未保存外部模型 Key，请先在设置中填写。')
  const body = {
    model: requireExternalModel(route.model),
    messages: options.system === undefined ? messages : [{ role: 'system', content: options.system }, ...messages],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 12000,
    stream: false,
  }
  let response
  try {
    response = await fetch(chatCompletionsUrl(route.baseURL), {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: abortAfter(options.timeoutMs ?? MODEL_TIMEOUT_MS),
    })
  } catch (error) {
    const name = error instanceof Error && error.name === 'TimeoutError' ? '请求超时' : '无法连接外部模型接口'
    throw new HttpError(502, `${name}：${failureMessage(error)}`)
  }
  const raw = await response.text()
  if (!response.ok) throw new HttpError(502, `外部模型请求失败（HTTP ${response.status}）：${raw.slice(0, 500)}`)
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new HttpError(502, '外部模型返回了非 JSON 响应。')
  }
  const message = data?.choices?.[0]?.message?.content
  let content = ''
  if (typeof message === 'string') content = message
  else if (Array.isArray(message)) {
    content = message
      .map((part) => (typeof part === 'string' ? part : typeof part?.text === 'string' ? part.text : ''))
      .join('')
  }
  if (content.trim() === '') throw new HttpError(502, '外部模型返回了空内容。')
  return content.trim()
}

async function complete(ctx, source, messages, options = {}) {
  if (source.mode === 'external') return callExternalModel(ctx, source, messages, options)
  return callDshModel(ctx, source, messages, options)
}

function parseModelJson(raw) {
  let value = raw.trim()
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(value)
  if (fence !== null) value = fence[1].trim()
  const start = value.indexOf('{')
  const end = value.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new HttpError(502, `模型没有返回 JSON 对象（长度 ${value.length}，开头：${value.slice(0, 120)}）。`)
  }
  try {
    return JSON.parse(value.slice(start, end + 1))
  } catch {
    throw new HttpError(502, '模型返回的 JSON 无法解析，请重试。')
  }
}

// ── prompts ──────────────────────────────────────────────────────────────────

const GENERATOR_SYSTEM = [
  '你是一位资深剧集结构顾问，精通 Blake Snyder 的 Save the Cat 15 拍。',
  '你的任务不是把素材改写成小说，而是从一堆零散素材里找出唯一一条主线，再把它分配到 15 个节拍里。',
  '你必须做取舍：素材里大多数情节会被合并、前移、后移或删掉。不要试图把所有设定都塞进 15 拍。',
  '每一拍必须是一个具体的事件/场景，不是抽象概括；必须有价值转变；必须和下一拍有因果。',
  '如果素材缺少关键信息，在 missingMaterial 里明确列出，不要用模糊的套话编造。',
  '只输出一个合法 JSON 对象。第一个字符必须是 {，最后一个字符必须是 }。不要 Markdown 代码块，不要注释，不要额外解释。JSON 字符串内如需换行必须使用 \\n。',
].join('\n')

function generationSchema() {
  const beats = beatTemplates
    .map(
      (template) =>
        `    "${template.key}": {\n      "oneLine": "这一拍在本故事里的作用，一句话",\n      "content": "具体发生什么，100-220字",\n      "turn": "价值转变：从X到Y",\n      "hook": "这一拍留下的钩子",\n      "page": ${template.targetPage},\n      "episodeHint": "第X-Y集前后",\n      "sourceNote": "用了原素材的什么，删/改/并了什么"\n    }`,
    )
    .join(',\n')
  return `{
  "logline": "一句话故事",
  "theme": "一句人话的主题",
  "format": "体量/形态",
  "structureNotes": "这次结构改造的关键取舍，Markdown，300-800字",
  "missingMaterial": ["素材里缺的1-5项"],
  "beats": {
${beats}
  }
}`
}

function beatSheetDigest(project) {
  return beatTemplates
    .map((template) => {
      const beat = project.beats.find((item) => item.key === template.key) ?? emptyBeat(template)
      const content = beat.content.trim() === '' ? '（空白）' : beat.content.trim().slice(0, 220)
      return `${template.no}. ${template.title} / ${template.en}（p${beat.page}）\n   作用：${beat.oneLine || '（未填）'}\n   内容：${content}`
    })
    .join('\n')
}

function buildGenerationPrompt(project) {
  const templateBlock = beatTemplates
    .map(
      (template) =>
        `${template.no}. ${template.title} / ${template.en}（目标 ${pageAnchor(template)}，第${template.act}幕）\n   固定任务：${template.job}\n   必须回答：${template.questions.join(' / ')}`,
    )
    .join('\n\n')
  return `请把下面这堆素材整理成《${project.title}》的 15 拍地基。

【项目底稿】
一句话故事：${project.brief.logline || '（未填，请你提炼）'}
主题：${project.brief.theme || '（未填，请你提炼）'}
体量/形态：${project.brief.format || '（未填，请从素材判断）'}

【素材池】
${project.material.trim() || '（空。请在 missingMaterial 里说明无法成拍。）'}

【15 拍固定骨架】
${templateBlock}

【硬规则】
1. 先定主角：她想要什么（外部目标）、她需要什么（内部成长）、她怕什么（缺陷）。
2. 定对手：谁/什么在阻止她；对手必须有主动行动。
3. 定赌注：失败会失去什么；中点后赌注必须升级。
4. 定结局：第三幕她主动选择什么；结局必须由她的成长带来。
5. 主题必须是一句人话，由一个有资格的人物在第 2 拍说出来；主角当时不必懂。
6. B 故事必须是一段关系，承载主题，不是支线任务。
7. 页码锚点：第 4 拍 p10-12；第 6 拍 p25；第 7 拍 p30；第 9 拍 p55；第 11 拍 p75；第 13 拍 p85；第 15 拍 p110。允许 ±2 页。
8. 不要照搬素材的卷/集结构；按 15 拍重新切。素材里重复的“危机—解决”要合并；不服务主线的支线要删。
9. 每一拍都要有“这一拍改变了什么”，不能只是“发生了什么”。
10. 如果素材里缺关键信息，在 missingMaterial 里列出，不要编造一个模糊的答案。

【输出】
只输出一个合法 JSON 对象，结构必须严格为：
${generationSchema()}

评分/写作要求：具体、可拍、有因果。不要写“主角成长了”“气氛紧张”这种空话。`
}

const REVIEW_SYSTEM = [
  '你是一位残酷但具体的剧本医生。你只评审这一拍，不重写全剧。',
  '先判断这一拍是否完成了它的 Save the Cat 功能，再看因果、人物、主题、钩子。',
  '评分要拉开差距，不要所有维度都给 8 分；低分要给出可执行的修法。',
  '每个问题必须指向具体的台词/动作/事件，不要泛泛而谈。',
  '只输出一个合法 JSON 对象。不要 Markdown 代码块，不要额外解释。',
].join('\n')

function buildBeatReviewPrompt(project, beat, template) {
  return `【项目】
《${project.title}》
一句话故事：${project.brief.logline || '（未填）'}
主题：${project.brief.theme || '（未填）'}
体量：${project.brief.format || '（未填）'}

【全剧 15 拍速览】
${beatSheetDigest(project)}

【正在评审】
第 ${template.no} 拍：${template.title} / ${template.en}
固定任务：${template.job}
必须回答：${template.questions.join(' / ')}
目标页码：p${template.targetPage}

【这一拍的内容】
一句话作用：${beat.oneLine || '（未填）'}
发生什么：${beat.content || '（未填）'}
价值转变：${beat.turn || '（未填）'}
钩子：${beat.hook || '（未填）'}
当前页码/集数：p${beat.page} · ${beat.episodeHint || '（未填）'}
素材来源/改编：${beat.sourceNote || '（未填）'}
作者备注：${beat.notes || '（无）'}

【评分维度 1-10】
function：是否完成了这一拍的固定任务
causality：是否有清楚的因果/价值转变，是否把故事推向下一拍
character：主角的想要/需要/缺陷/关系是否在场
theme：是否承载主题，且不说教
hook：是否让观众想进入下一拍

【输出】
{
  "dimensions": { "function": 1-10, "causality": 1-10, "character": 1-10, "theme": 1-10, "hook": 1-10 },
  "verdict": "一句话判断这一拍最致命的问题或最值得保留的东西",
  "issues": ["最多 5 条，每条指向具体内容"],
  "fix": "一个具体的改法，说明改哪一场/哪句/哪个动作",
  "alternatives": ["最多 3 个不同方向的替代方案，每个一句话"]
}`
}

function buildSheetReviewPrompt(project) {
  return `【项目】
《${project.title}》
一句话故事：${project.brief.logline || '（未填）'}
主题：${project.brief.theme || '（未填）'}
体量：${project.brief.format || '（未填）'}

【15 拍】
${beatTemplates
  .map((template) => {
    const beat = project.beats.find((item) => item.key === template.key) ?? emptyBeat(template)
    return `## ${template.no}. ${template.title}（p${beat.page} / 目标 ${pageAnchor(template)}）
作用：${beat.oneLine || '（未填）'}
内容：${beat.content || '（未填）'}
转变：${beat.turn || '（未填）'}
钩子：${beat.hook || '（未填）'}`
  })
  .join('\n\n')}

【评估】
1. 三幕是否清晰：第一幕是否把主角送进新世界；第二幕是否先爽后痛；第三幕是否由主角主动选择。
2. 赌注是否升级：中点后是否比中点前更贵。
3. B 故事是否承载主题，并在中点与 A 故事相撞。
4. 中点、一无所有、第三幕衔接点是否成立。
5. 哪些拍是重复的、哪些拍缺因果、哪些拍可以合并。
6. 只给 5 条以内的关键修改，按优先级排序。

【输出】
{
  "overall": 0-100,
  "acts": { "act1": 0-100, "act2": 0-100, "act3": 0-100 },
  "verdict": "一句话总判断",
  "issues": ["最多 6 条，每条指出具体拍号"],
  "topFixes": ["最多 5 条，按优先级排序，每条可执行"]
}`
}

const BATCH_SYSTEM = [
  '你是剧本结构编辑，负责按指令批量修改选中的节拍。',
  '不要改未被选中的拍，不要改页码、状态、锁定状态。',
  '保留原有的事实、人物、因果和每一拍在 15 拍里的功能；不要新增人物或支线。',
  '只输出一个合法 JSON 对象。不要 Markdown 代码块，不要额外解释。',
].join('\n')

const BATCH_OP_TEXT = {
  rewrite: '按用户指令改写；保留原有事实、人物、因果和这一拍的功能。',
  tighten: '收紧：删掉 20%-30% 的水词、重复解释和抽象概括，保留具体动作与画面。',
  conflict: '补冲突：给这一拍加一个具体的阻力、意外或代价，但不能改变这一拍在 15 拍里的功能。',
  hook: '强化钩子：让这一拍结尾更急、更具体、更想知道下一拍；不要靠新人物或新设定。',
}

function buildBatchPrompt(project, beats, instruction, op, target) {
  const fields = target === 'all' ? BATCH_FIELDS : [target]
  const fieldLabels = {
    oneLine: '一句话作用',
    content: '这一拍发生什么',
    turn: '价值转变',
    hook: '钩子',
  }
  const beatBlock = beats
    .map((beat) => {
      const template = templateByKey(beat.key)
      return `### 第 ${template.no} 拍：${template.title}（key: ${beat.key}）\n一句话作用：${beat.oneLine || '（空）'}\n发生什么：${beat.content || '（空）'}\n价值转变：${beat.turn || '（空）'}\n钩子：${beat.hook || '（空）'}\n页码：p${beat.page}${beat.episodeHint ? ` · ${beat.episodeHint}` : ''}`
    })
    .join('\n\n')
  const schema = `{
  "beats": {
${beats.map((beat) => `    "${beat.key}": { ${fields.map((field) => `"${field}": "..."`).join(', ')} }`).join(',\n')}
  },
  "note": "一句话说明这次改了什么"
}`
  return `【项目】
《${project.title}》
一句话故事：${project.brief.logline || '（未填）'}
主题：${project.brief.theme || '（未填）'}
体量：${project.brief.format || '（未填）'}

【选中的节拍】
${beatBlock}

【修改功能】
${BATCH_OP_TEXT[op]}

【修改范围】
只改这些字段：${fields.map((field) => fieldLabels[field]).join('、')}
每条拍只输出上面列出的字段；不要改页码、状态、其他字段。

【用户指令】
${instruction}

【硬规则】
1. 只改选中的 ${beats.length} 条拍，key 必须原样返回。
2. 保留人物名字、既有事实、因果顺序和每一拍的功能；不要新增人物、支线或设定。
3. 每个字段都要具体、可拍，不要写“主角成长了”“气氛紧张”这种空话。
4. 如果某条拍原本是空的，按用户指令和相邻拍的信息补，不要写成通用模板。
5. 只输出一个合法 JSON 对象，结构必须严格为：
${schema}`
}

function normalizeBatchProposals(value, keys, target) {
  const source = value !== null && typeof value === 'object' ? value : {}
  const raw = source.beats ?? source.proposals ?? source
  const fields = target === 'all' ? BATCH_FIELDS : [target]
  const byKey = new Map()
  if (Array.isArray(raw)) {
    raw.forEach((item, index) => {
      if (item === null || typeof item !== 'object') return
      const key = typeof item.key === 'string' ? item.key : keys[index]
      if (key !== undefined) byKey.set(key, item)
    })
  } else if (raw !== null && typeof raw === 'object') {
    for (const [key, item] of Object.entries(raw)) {
      if (item !== null && typeof item === 'object') byKey.set(key, item)
    }
  }
  const proposals = {}
  for (const key of keys) {
    const item = byKey.get(key)
    if (item === undefined) continue
    const patch = {}
    for (const field of fields) {
      const rawValue = item[field]
      if (typeof rawValue !== 'string') continue
      const limit = field === 'content' ? MAX_CONTENT : field === 'oneLine' ? MAX_ONE_LINE : field === 'turn' ? MAX_TURN : MAX_HOOK
      patch[field] = field === 'content' ? text(rawValue, limit) : trimmed(rawValue, limit)
    }
    if (Object.keys(patch).length > 0) proposals[key] = patch
  }
  return {
    proposals,
    note: trimmed(source.note, MAX_VERSION_NOTE),
  }
}

// ── model routing ────────────────────────────────────────────────────────────

function dshSourceFor(provider, model) {
  if (typeof provider !== 'string' || provider === '' || typeof model !== 'string' || model === '') return null
  return {
    mode: 'dsh',
    label: `${provider} · ${model}`,
    provider,
    model,
  }
}

function dshSource(service) {
  const selection = service.currentSelection()
  return dshSourceFor(selection?.provider, selection?.model)
}

function externalSource(settings) {
  return {
    mode: 'external',
    label: settings.externalModel || '外部模型',
    baseURL: typeof settings.externalBaseURL === 'string' ? settings.externalBaseURL.trim() : '',
    model: settings.externalModel,
  }
}

function sourceForRef(service, settings, ref, fallbackExternal) {
  if (ref?.mode === 'dsh') return dshSourceFor(ref.provider, ref.model)
  if (ref?.mode === 'external') return externalSource(settings)
  if (ref?.mode === 'default') return dshSource(service) ?? (fallbackExternal ? externalSource(settings) : null)
  return null
}

function primarySource(service, settings) {
  return sourceForRef(service, settings, settings.primary ?? { mode: 'default' }, true)
}

function secondarySource(service, settings) {
  const ref = settings.secondary ?? { mode: 'none' }
  if (ref.mode === 'none') return null
  return sourceForRef(service, settings, ref, false)
}

function modelRefLabel(service, settings, ref) {
  if (ref?.mode === 'none') return '不使用'
  if (ref?.mode === 'external') return `${settings.externalModel || '外部模型'}（外部）`
  if (ref?.mode === 'dsh') return `${ref.provider} · ${ref.model}`
  const selection = service.currentSelection()
  return selection?.provider !== undefined && selection?.model !== undefined
    ? `${selection.provider} · ${selection.model}（DSH 默认）`
    : 'DSH 默认（当前未选择）'
}

function normalizeGeneratedBeat(value, template) {
  const source = value !== null && typeof value === 'object' ? value : {}
  return {
    key: template.key,
    oneLine: trimmed(source.oneLine ?? source.one_line, MAX_ONE_LINE),
    content: text(source.content ?? source.what, MAX_CONTENT),
    turn: trimmed(source.turn ?? source.valueTurn ?? source.change, MAX_TURN),
    hook: trimmed(source.hook ?? source.cliffhanger, MAX_HOOK),
    page: integer(source.page, template.targetPage, 1, 300),
    episodeHint: trimmed(source.episodeHint ?? source.episodes, MAX_EPISODE_HINT),
    sourceNote: trimmed(source.sourceNote ?? source.source, MAX_SOURCE),
    notes: '',
    checks: {},
    status: 'draft',
    locked: false,
    review: null,
    versions: [],
    updatedAt: now(),
  }
}

function normalizeGenerated(value, project) {
  const source = value !== null && typeof value === 'object' ? value : {}
  const rawBeats = source.beats
  const byKey = new Map()
  if (Array.isArray(rawBeats)) {
    rawBeats.forEach((beat, index) => {
      if (beat === null || typeof beat !== 'object') return
      const key = typeof beat.key === 'string' ? beat.key : beatTemplates[index]?.key
      if (key !== undefined) byKey.set(key, beat)
    })
  } else if (rawBeats !== null && typeof rawBeats === 'object') {
    for (const [key, beat] of Object.entries(rawBeats)) byKey.set(key, beat)
  }
  const warnings = []
  const beats = beatTemplates.map((template) => {
    const generated = byKey.get(template.key)
    if (generated === undefined) {
      warnings.push(`模型没有返回「${template.title}」，已留空。`)
      return emptyBeat(template)
    }
    return normalizeGeneratedBeat(generated, template)
  })
  for (const key of byKey.keys()) {
    if (!beatTemplates.some((template) => template.key === key)) warnings.push(`模型返回了未知拍「${key}」，已忽略。`)
  }
  const brief = {
    logline: trimmed(source.logline, MAX_BRIEF) || project.brief.logline,
    theme: trimmed(source.theme, MAX_BRIEF) || project.brief.theme,
    format: trimmed(source.format, MAX_BRIEF) || project.brief.format,
    structureNotes: text(source.structureNotes ?? source.structure_notes, MAX_BRIEF) || project.brief.structureNotes,
  }
  return {
    beats,
    brief,
    missingMaterial: stringArray(source.missingMaterial, 8, 500),
    warnings,
  }
}

// ── state view ───────────────────────────────────────────────────────────────

function stateView(service, state, hasKey) {
  let selection = service.currentSelection()
  if (selection === undefined || selection === null) selection = null
  return {
    ...state,
    projects: state.projects.map(({ beats, ...project }) => {
      const mappedBeats = beats.map(({ versions, ...beat }) => {
        const list = Array.isArray(versions) ? versions : []
        const labels = versionLabels(list)
        const last = list.length > 0 ? list[list.length - 1] : null
        return {
          ...beat,
          versionCount: list.length,
          latestVersionAt: last === null ? null : last.at,
          latestVersionLabel: last === null ? null : labels.get(last.id) ?? null,
          starredCount: list.filter((version) => version.starred === true).length,
        }
      })
      return { ...project, beats: mappedBeats }
    }),
    templates: beatTemplates,
    modelInfo: {
      reviewMode: state.settings.reviewMode,
      label:
        selection === null
          ? state.settings.externalModel
          : `${selection.provider} · ${selection.model}`,
      primary: state.settings.primary,
      secondary: state.settings.secondary,
      primaryLabel: modelRefLabel(service, state.settings, state.settings.primary),
      secondaryLabel: modelRefLabel(service, state.settings, state.settings.secondary),
      dshSelection: selection,
      externalBaseURL: state.settings.externalBaseURL,
      externalModel: state.settings.externalModel,
      hasExternalKey: hasKey,
    },
    capabilities: {
      dsh: service.hasLlm(),
      credentials: service.hasCredentials(),
    },
  }
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function sendJson(res, status, value) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(JSON.stringify(value))
}

async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413, '请求内容过大。')
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (raw === '') return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, '请求体不是合法 JSON。')
  }
}

function isSameOrigin(req) {
  const origin = req.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

function projectById(state, id) {
  const project = state.projects.find((item) => item.id === id)
  if (project === undefined) throw new HttpError(404, '项目不存在，请刷新页面。')
  return project
}

function beatByKey(project, key) {
  const beat = project.beats.find((item) => item.key === key)
  if (beat === undefined) throw new HttpError(404, '节拍不存在，请刷新页面。')
  return beat
}

function templateByKey(key) {
  return beatTemplates.find((template) => template.key === key)
}

function pageAnchor(template) {
  return template.pageRange ? `p${template.pageRange}` : `p${template.targetPage}`
}

function versionLabelFor(date) {
  const pad = (number) => String(number).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`
}

function versionLabels(versions) {
  const used = new Set()
  const labels = new Map()
  for (const version of versions) {
    let date = Number.isFinite(version.at) ? new Date(version.at) : new Date()
    if (Number.isNaN(date.getTime())) date = new Date()
    let label = versionLabelFor(date)
    while (used.has(label)) {
      date = new Date(date.getTime() + 60000)
      label = versionLabelFor(date)
    }
    used.add(label)
    labels.set(version.id, label)
  }
  return labels
}

function versionsView(beat) {
  const versions = Array.isArray(beat.versions) ? beat.versions : []
  const labels = versionLabels(versions)
  return {
    key: beat.key,
    versions: versions.map((version, index) => ({
      id: version.id,
      at: version.at,
      label: labels.get(version.id) ?? '',
      source: version.source,
      note: version.note,
      starred: version.starred === true,
      isLatest: index === versions.length - 1,
      preview: {
        oneLine: version.snapshot.oneLine,
        content: version.snapshot.content.slice(0, 240),
        turn: version.snapshot.turn,
        hook: version.snapshot.hook,
      },
    })),
    current: {
      versionCount: versions.length,
      updatedAt: beat.updatedAt,
      latestVersionAt: versions.length > 0 ? versions[versions.length - 1].at : null,
    },
  }
}

// ── service ──────────────────────────────────────────────────────────────────

function createService(ctx, store) {
  function currentSelection() {
    try {
      return ctx.get('agentDefaultModel')?.currentSelection() ?? null
    } catch {
      return null
    }
  }

  async function testExternal(settings, draftKey) {
    const key = draftKey ?? (await readExternalKey(ctx))
    if (key === undefined) throw new HttpError(400, '请填写外部模型 Key。')
    let response
    try {
      response = await fetch(chatCompletionsUrl(settings.externalBaseURL), {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: requireExternalModel(settings.externalModel),
          messages: [
            { role: 'system', content: '你是模型连通性测试。只回答“可用”。' },
            { role: 'user', content: '请只回答两个字：可用' },
          ],
          temperature: 0,
          max_tokens: 128,
          stream: false,
        }),
        signal: abortAfter(30000),
      })
    } catch (error) {
      throw new HttpError(502, `无法连接外部模型接口：${failureMessage(error)}`)
    }
    const raw = await response.text()
    if (!response.ok) throw new HttpError(502, `外部模型请求失败（HTTP ${response.status}）：${raw.slice(0, 400)}`)
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      throw new HttpError(502, '外部模型返回了非 JSON 响应。')
    }
    const message = data?.choices?.[0]?.message?.content
    const content =
      typeof message === 'string'
        ? message
        : Array.isArray(message)
          ? message.map((part) => (typeof part === 'string' ? part : part?.text ?? '')).join('')
          : ''
    if (content.trim() === '') throw new HttpError(502, '外部模型返回了空内容。')
    return content.trim().slice(0, 200)
  }

  const service = {
    currentSelection,
    hasLlm: () => ctx.get('llm') !== undefined,
    hasCredentials: () => ctx.get('credentials') !== undefined,

    async view() {
      let current = await store.state()
      if (needsInitialVersions(current)) current = await store.update(addInitialVersions)
      return stateView(service, current, await readExternalKey(ctx).then((key) => key !== undefined))
    },

    async createProject(body) {
      const title = trimmed(body.title, MAX_TITLE) || '未命名项目'
      await store.update((previous) => {
        if (previous.projects.length >= MAX_PROJECTS) throw new HttpError(409, `最多 ${MAX_PROJECTS} 个项目。`)
        const project = emptyProject(title)
        return {
          ...previous,
          activeProjectId: project.id,
          projects: [...previous.projects, project],
        }
      })
      return { state: await service.view() }
    },

    async selectProject(body) {
      const id = trimmed(body.id, 100)
      await store.update((previous) => {
        projectById(previous, id)
        return { ...previous, activeProjectId: id }
      })
      return { state: await service.view() }
    },

    async renameProject(body) {
      const id = trimmed(body.id, 100)
      const title = trimmed(body.title, MAX_TITLE)
      if (title === '') throw new HttpError(400, '项目名不能为空。')
      await store.update((previous) => {
        projectById(previous, id)
        return {
          ...previous,
          projects: previous.projects.map((project) =>
            project.id === id ? { ...project, title, updatedAt: now() } : project,
          ),
        }
      })
      return { state: await service.view() }
    },

    async deleteProject(body) {
      const id = trimmed(body.id, 100)
      await store.update((previous) => {
        if (previous.projects.length <= 1) throw new HttpError(409, '至少保留一个项目。')
        const projects = previous.projects.filter((project) => project.id !== id)
        if (projects.length === previous.projects.length) throw new HttpError(404, '项目不存在。')
        return {
          ...previous,
          projects,
          activeProjectId: previous.activeProjectId === id ? projects[0].id : previous.activeProjectId,
        }
      })
      return { state: await service.view() }
    },

    async saveMaterial(body) {
      const id = trimmed(body.id, 100)
      const material = text(body.material, MAX_MATERIAL)
      const brief = normalizeBrief(body.brief)
      await store.update((previous) => {
        projectById(previous, id)
        return {
          ...previous,
          projects: previous.projects.map((project) =>
            project.id === id ? { ...project, material, brief, updatedAt: now() } : project,
          ),
        }
      })
      return { state: await service.view() }
    },

    async saveBeat(body) {
      const id = trimmed(body.id, 100)
      const key = trimmed(body.key, 60)
      const patch = body.patch !== null && typeof body.patch === 'object' ? body.patch : {}
      const source = ['manual', 'ai-batch', 'restore'].includes(body.source) ? body.source : 'manual'
      const note = trimmed(body.note, MAX_VERSION_NOTE)
      await store.update((previous) => {
        const project = projectById(previous, id)
        const current = beatByKey(project, key)
        if (current.locked) throw new HttpError(409, '这一拍已锁定，请先解锁。')
        const template = templateByKey(key)
        let next = normalizeBeat({ ...current, ...patch, key }, template)
        if (next.status === 'final' && next.content.trim() === '') {
          throw new HttpError(400, '定稿前先写“这一拍发生什么”。')
        }
        next.locked = current.locked
        next.review = current.review
        next.versions = current.versions
        if (JSON.stringify(snapshotOf(current)) !== JSON.stringify(snapshotOf(next))) {
          next = pushVersion(next, source, note)
        }
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? { ...item, beats: item.beats.map((beat) => (beat.key === key ? next : beat)), updatedAt: now() }
              : item,
          ),
        }
      })
      return { state: await service.view() }
    },

    async lockBeat(body) {
      const id = trimmed(body.id, 100)
      const key = trimmed(body.key, 60)
      const locked = body.locked === true
      await store.update((previous) => {
        const project = projectById(previous, id)
        const current = beatByKey(project, key)
        if (locked && (current.status !== 'final' || current.content.trim() === '')) {
          throw new HttpError(400, '先保存并定稿，再锁定。')
        }
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  beats: item.beats.map((beat) =>
                    beat.key === key ? { ...beat, locked, status: locked ? 'final' : beat.status, updatedAt: now() } : beat,
                  ),
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      return { state: await service.view() }
    },

    async lockAll(body) {
      const id = trimmed(body.id, 100)
      const locked = body.locked === true
      await store.update((previous) => {
        const project = projectById(previous, id)
        if (locked) {
          const missing = project.beats.find((beat) => beat.status !== 'final' || beat.content.trim() === '')
          if (missing !== undefined) {
            const template = templateByKey(missing.key)
            throw new HttpError(400, `「${template?.title ?? missing.key}」还没定稿，先补完再全部锁定。`)
          }
        }
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  beats: item.beats.map((beat) => ({
                    ...beat,
                    locked,
                    status: locked ? 'final' : beat.status,
                    updatedAt: now(),
                  })),
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      return { state: await service.view() }
    },

    async generateBeats(body) {
      const id = trimmed(body.id, 100)
      const material = text(body.material, MAX_MATERIAL)
      const brief = normalizeBrief(body.brief)
      if (material.trim() === '') throw new HttpError(400, '先把素材放进素材池。')

      const current = await store.state()
      const project = clone(projectById(current, id))
      if (project.beats.some((beat) => beat.locked)) {
        throw new HttpError(409, '还有拍是锁定的。生成会覆盖全部 15 拍，请先全部解锁。')
      }

      // Persist the material before the model call so a failed generation does
      // not lose the writer's paste.
      await store.update((previous) => {
        projectById(previous, id)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id ? { ...item, material, brief, updatedAt: now() } : item,
          ),
        }
      })

      const source = primarySource(service, current.settings)
      const prompt = buildGenerationPrompt({ ...project, material, brief })
      const raw = await complete(ctx, source, [{ role: 'user', content: prompt }], {
        system: GENERATOR_SYSTEM,
        temperature: 0.65,
        maxTokens: 14000,
      })
      const value = parseModelJson(raw)
      const generated = normalizeGenerated(value, { ...project, material, brief })
      const generation = {
        at: now(),
        model: source.label,
        missingMaterial: generated.missingMaterial,
        warnings: generated.warnings,
      }
      await store.update((previous) => {
        projectById(previous, id)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  material,
                  brief: generated.brief,
                  beats: generated.beats,
                  generation,
                  sheetReview: null,
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      return { state: await service.view(), generation }
    },

    async compareBeats(body) {
      const id = trimmed(body.id, 100)
      const material = text(body.material, MAX_MATERIAL)
      const brief = normalizeBrief(body.brief)
      if (material.trim() === '') throw new HttpError(400, '先把素材放进素材池。')

      const current = await store.state()
      const project = clone(projectById(current, id))
      if (project.beats.some((beat) => beat.locked)) {
        throw new HttpError(409, '还有拍是锁定的。对比生成会替换 15 拍，请先全部解锁。')
      }
      const settings = current.settings
      const routes = [
        { key: 'primary', source: primarySource(service, settings) },
        { key: 'secondary', source: secondarySource(service, settings) },
      ]
      if (routes[0].source === null) throw new HttpError(400, '没有可用的主模型，请在设置里选择一个 DSH 模型。')
      if (routes[1].source === null) throw new HttpError(400, '对比生成需要先在设置里选第二个模型。')
      for (const route of routes) {
        if (route.source.mode === 'external' && (await readExternalKey(ctx)) === undefined) {
          throw new HttpError(400, '有外部接口模型，请先保存外部模型 Key。')
        }
      }

      // Persist the material before the long call so a failed comparison does
      // not lose the writer's paste.
      await store.update((previous) => {
        projectById(previous, id)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id ? { ...item, material, brief, updatedAt: now() } : item,
          ),
        }
      })

      const prompt = buildGenerationPrompt({ ...project, material, brief })
      const settled = await Promise.allSettled(
        routes.map(async (route) => {
          const started = now()
          const raw = await complete(ctx, route.source, [{ role: 'user', content: prompt }], {
            system: GENERATOR_SYSTEM,
            temperature: 0.65,
            maxTokens: 14000,
          })
          return {
            key: route.key,
            label: route.source.label,
            mode: route.source.mode,
            elapsedMs: now() - started,
            generated: normalizeGenerated(parseModelJson(raw), { ...project, material, brief }),
          }
        }),
      )

      const candidates = []
      const warnings = []
      settled.forEach((result, index) => {
        const route = routes[index]
        if (result.status === 'rejected') {
          warnings.push(`${route.source.label} 生成失败：${failureMessage(result.reason)}`)
          return
        }
        const value = result.value
        const token = rememberCandidate({
          projectId: id,
          material,
          model: value.label,
          mode: value.mode,
          brief: value.generated.brief,
          beats: value.generated.beats,
          missingMaterial: value.generated.missingMaterial,
          warnings: value.generated.warnings,
        })
        candidates.push({
          id: token,
          slot: route.key,
          label: value.label,
          mode: value.mode,
          elapsedMs: value.elapsedMs,
          brief: value.generated.brief,
          beats: value.generated.beats.map((beat) => ({
            key: beat.key,
            oneLine: beat.oneLine,
            content: beat.content,
            turn: beat.turn,
            hook: beat.hook,
            page: beat.page,
            episodeHint: beat.episodeHint,
            sourceNote: beat.sourceNote,
          })),
          missingMaterial: value.generated.missingMaterial,
          warnings: value.generated.warnings,
        })
      })
      if (candidates.length === 0) {
        throw new HttpError(502, `两个模型都没有返回可用的 15 拍。${warnings.join('；')}`)
      }
      return { candidates, warnings, projectTitle: project.title, at: now() }
    },

    async applyBeatsCandidate(body) {
      const id = trimmed(body.id, 100)
      const candidateId = trimmed(body.candidateId, 80)
      const entry = generationCandidates.get(candidateId)
      if (entry === undefined || entry.projectId !== id) {
        throw new HttpError(404, '候选已失效，请重新对比生成。')
      }
      const generation = {
        at: now(),
        model: entry.model,
        missingMaterial: entry.missingMaterial,
        warnings: entry.warnings,
      }
      await store.update((previous) => {
        const project = projectById(previous, id)
        if (project.beats.some((beat) => beat.locked)) {
          throw new HttpError(409, '还有拍是锁定的，请先解锁再采用。')
        }
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  material: entry.material,
                  brief: entry.brief,
                  beats: entry.beats,
                  generation,
                  sheetReview: null,
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      generationCandidates.delete(candidateId)
      return { state: await service.view(), generation }
    },

    async reviewBeat(body) {
      const id = trimmed(body.id, 100)
      const key = trimmed(body.key, 60)
      const mode = body.mode === 'dual' ? 'dual' : 'single'
      const current = await store.state()
      const project = projectById(current, id)
      const beat = clone(beatByKey(project, key))
      const template = templateByKey(key)
      if (beat.content.trim() === '') throw new HttpError(400, '先写“这一拍发生什么”，再体检。')
      const settings = current.settings
      const primary = primarySource(service, settings)
      if (primary === null) throw new HttpError(400, '没有可用的主模型，请在设置里选择一个 DSH 模型。')
      if (primary.mode === 'external' && (await readExternalKey(ctx)) === undefined) {
        throw new HttpError(400, '主模型是外部接口，请先保存外部模型 Key。')
      }
      const warnings = []
      let secondary = null
      if (mode === 'dual') {
        secondary = secondarySource(service, settings)
        if (secondary === null) throw new HttpError(400, '双模型体检需要先在设置里选第二个模型。')
        if (secondary.mode === 'external' && (await readExternalKey(ctx)) === undefined) {
          throw new HttpError(400, '副模型是外部接口，请先保存外部模型 Key。')
        }
        if (secondary.mode === 'dsh' && primary.mode === 'dsh' && secondary.provider === primary.provider && secondary.model === primary.model) {
          warnings.push('主模型和副模型是同一个，两份评分可能几乎一样。')
        }
      }
      const prompt = buildBeatReviewPrompt(project, beat, template)
      const primaryRaw = await complete(ctx, primary, [{ role: 'user', content: prompt }], {
        system: REVIEW_SYSTEM,
        temperature: 0.25,
        maxTokens: 4000,
      })
      const primaryReview = normalizeReview(parseModelJson(primaryRaw), primary.label)
      if (primaryReview === null) throw new HttpError(502, '模型没有返回可用的体检结果。')
      if (secondary !== null) {
        try {
          const secondaryRaw = await complete(ctx, secondary, [{ role: 'user', content: prompt }], {
            system: REVIEW_SYSTEM,
            temperature: 0.25,
            maxTokens: 4000,
          })
          secondary = normalizeReview(parseModelJson(secondaryRaw), secondary.label)
          if (secondary === null) warnings.push('第二个模型没有返回可用评分。')
        } catch (error) {
          warnings.push(`第二个模型体检失败：${failureMessage(error)}`)
          secondary = null
        }
      }
      const review = { primary: primaryReview, secondary }
      await store.update((previous) => {
        const target = projectById(previous, id)
        beatByKey(target, key)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  beats: item.beats.map((itemBeat) =>
                    itemBeat.key === key ? { ...itemBeat, review, updatedAt: now() } : itemBeat,
                  ),
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      return { state: await service.view(), review, warnings }
    },

    async reviewSheet(body) {
      const id = trimmed(body.id, 100)
      const mode = body.mode === 'dual' ? 'dual' : 'single'
      const current = await store.state()
      const project = projectById(current, id)
      const settings = current.settings
      const primary = primarySource(service, settings)
      if (primary === null) throw new HttpError(400, '没有可用的主模型，请在设置里选择一个 DSH 模型。')
      if (primary.mode === 'external' && (await readExternalKey(ctx)) === undefined) {
        throw new HttpError(400, '主模型是外部接口，请先保存外部模型 Key。')
      }
      const warnings = []
      let secondary = null
      if (mode === 'dual') {
        secondary = secondarySource(service, settings)
        if (secondary === null) throw new HttpError(400, '双模型体检需要先在设置里选第二个模型。')
        if (secondary.mode === 'external' && (await readExternalKey(ctx)) === undefined) {
          throw new HttpError(400, '副模型是外部接口，请先保存外部模型 Key。')
        }
        if (secondary.mode === 'dsh' && primary.mode === 'dsh' && secondary.provider === primary.provider && secondary.model === primary.model) {
          warnings.push('主模型和副模型是同一个，两份评分可能几乎一样。')
        }
      }
      const prompt = buildSheetReviewPrompt(project)
      const primaryRaw = await complete(ctx, primary, [{ role: 'user', content: prompt }], {
        system: REVIEW_SYSTEM,
        temperature: 0.25,
        maxTokens: 5000,
      })
      const primaryReview = normalizeOneSheetReview(parseModelJson(primaryRaw), primary.label)
      if (primaryReview === null) throw new HttpError(502, '模型没有返回可用的总诊结果。')
      if (secondary !== null) {
        try {
          const secondaryRaw = await complete(ctx, secondary, [{ role: 'user', content: prompt }], {
            system: REVIEW_SYSTEM,
            temperature: 0.25,
            maxTokens: 5000,
          })
          secondary = normalizeOneSheetReview(parseModelJson(secondaryRaw), secondary.label)
          if (secondary === null) warnings.push('第二个模型没有返回可用总诊。')
        } catch (error) {
          warnings.push(`第二个模型总诊失败：${failureMessage(error)}`)
          secondary = null
        }
      }
      const review = { primary: primaryReview, secondary }
      await store.update((previous) => {
        projectById(previous, id)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id ? { ...item, sheetReview: review, updatedAt: now() } : item,
          ),
        }
      })
      return { state: await service.view(), review, warnings }
    },

    async batchUpdate(body) {
      const id = trimmed(body.id, 100)
      const keys = [
        ...new Set(
          (Array.isArray(body.keys) ? body.keys : [])
            .filter((key) => typeof key === 'string')
            .map((key) => key.trim())
            .filter((key) => key !== ''),
        ),
      ].slice(0, MAX_BATCH_KEYS)
      if (keys.length === 0) throw new HttpError(400, '先勾选要修改的节拍。')
      const instruction = trimmed(body.instruction, MAX_INSTRUCTION)
      if (instruction === '') throw new HttpError(400, '写一句修改指令。')
      const op = BATCH_OPS.has(body.op) ? body.op : 'rewrite'
      const target = BATCH_TARGETS.has(body.target) ? body.target : 'all'
      const model = body.model === 'secondary' ? 'secondary' : 'primary'
      const current = await store.state()
      const project = projectById(current, id)
      const beats = keys.map((key) => clone(beatByKey(project, key)))
      if (beats.some((beat) => beat.locked)) {
        throw new HttpError(409, '锁定的拍不能批量修改，请先解锁。')
      }
      const source =
        model === 'secondary'
          ? secondarySource(service, current.settings)
          : primarySource(service, current.settings)
      if (source === null) {
        throw new HttpError(
          400,
          model === 'secondary' ? '副模型未配置，请先在模型设置里选第二个模型。' : '没有可用的主模型，请先在模型设置里选择。',
        )
      }
      if (source.mode === 'external' && (await readExternalKey(ctx)) === undefined) {
        throw new HttpError(400, '选中的是外部接口，请先保存外部模型 Key。')
      }
      const prompt = buildBatchPrompt(project, beats, instruction, op, target)
      const raw = await complete(ctx, source, [{ role: 'user', content: prompt }], {
        system: BATCH_SYSTEM,
        temperature: 0.55,
        maxTokens: 6000,
      })
      const parsed = normalizeBatchProposals(parseModelJson(raw), keys, target)
      if (Object.keys(parsed.proposals).length === 0) {
        throw new HttpError(502, '模型没有返回可应用的修改，请重试。')
      }
      return {
        proposals: parsed.proposals,
        note: parsed.note,
        model: source.label,
        op,
        target,
        keys,
      }
    },

    async batchApply(body) {
      const id = trimmed(body.id, 100)
      const proposals = body.proposals !== null && typeof body.proposals === 'object' ? body.proposals : {}
      const keys = Object.keys(proposals)
        .filter((key) => templateByKey(key) !== undefined)
        .slice(0, MAX_BATCH_KEYS)
      if (keys.length === 0) throw new HttpError(400, '没有可应用的修改。')
      const note = trimmed(body.note, MAX_VERSION_NOTE) || 'AI 批量修改'
      await store.update((previous) => {
        const project = projectById(previous, id)
        const updates = new Map()
        for (const key of keys) {
          const current = beatByKey(project, key)
          if (current.locked) {
            throw new HttpError(409, `「${templateByKey(key)?.title ?? key}」已锁定，请先解锁。`)
          }
          const patch = {}
          for (const field of BATCH_FIELDS) {
            const raw = proposals[key]?.[field]
            if (typeof raw !== 'string') continue
            const limit =
              field === 'content' ? MAX_CONTENT : field === 'oneLine' ? MAX_ONE_LINE : field === 'turn' ? MAX_TURN : MAX_HOOK
            patch[field] = field === 'content' ? text(raw, limit) : trimmed(raw, limit)
          }
          if (Object.keys(patch).length === 0) continue
          const template = templateByKey(key)
          let next = normalizeBeat({ ...current, ...patch, key }, template)
          next.locked = current.locked
          next.review = current.review
          next.versions = current.versions
          if (JSON.stringify(snapshotOf(current)) !== JSON.stringify(snapshotOf(next))) {
            next = pushVersion(next, 'ai-batch', note)
          }
          updates.set(key, next)
        }
        if (updates.size === 0) throw new HttpError(400, '没有实际改动。')
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  beats: item.beats.map((beat) => updates.get(beat.key) ?? beat),
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      return { state: await service.view() }
    },

    async getVersions(body) {
      const id = trimmed(body.id, 100)
      const key = trimmed(body.key, 60)
      const current = await store.state()
      const project = projectById(current, id)
      return versionsView(beatByKey(project, key))
    },

    async starVersion(body) {
      const id = trimmed(body.id, 100)
      const key = trimmed(body.key, 60)
      const versionId = trimmed(body.versionId, 100)
      const starred = body.starred === true
      let view
      await store.update((previous) => {
        const project = projectById(previous, id)
        const beat = beatByKey(project, key)
        const version = beat.versions.find((item) => item.id === versionId)
        if (version === undefined) throw new HttpError(404, '找不到这个历史版本，请刷新后重试。')
        const nextBeat = {
          ...beat,
          versions: beat.versions.map((item) => (item.id === versionId ? { ...item, starred } : item)),
        }
        view = versionsView(nextBeat)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? { ...item, beats: item.beats.map((beatItem) => (beatItem.key === key ? nextBeat : beatItem)), updatedAt: now() }
              : item,
          ),
        }
      })
      return { versions: view, state: await service.view() }
    },

    async restoreVersion(body) {
      const id = trimmed(body.id, 100)
      const key = trimmed(body.key, 60)
      const versionId = trimmed(body.versionId, 100)
      await store.update((previous) => {
        const project = projectById(previous, id)
        const current = beatByKey(project, key)
        if (current.locked) throw new HttpError(409, '这一拍已锁定，请先解锁。')
        const version = current.versions.find((item) => item.id === versionId)
        if (version === undefined) throw new HttpError(404, '找不到这个历史版本，请刷新后重试。')
        const template = templateByKey(key)
        let next = normalizeBeat({ ...current, ...version.snapshot, key }, template)
        next.locked = current.locked
        next.review = null
        next.versions = current.versions
        next = pushVersion(next, 'restore', `恢复至 ${new Date(version.at).toLocaleString()}`)
        return {
          ...previous,
          projects: previous.projects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  beats: item.beats.map((beat) => (beat.key === key ? next : beat)),
                  updatedAt: now(),
                }
              : item,
          ),
        }
      })
      return { state: await service.view() }
    },

    async listModels() {
      const llm = ctx.get('llm')
      const current = currentSelection()
      if (llm === undefined) return { providers: [], current, supported: false }
      let providers
      try {
        providers = await llm.listProviders()
      } catch (error) {
        throw new HttpError(502, `读取 DSH 模型列表失败：${failureMessage(error)}`)
      }
      const groups = []
      for (const provider of providers) {
        const group = {
          id: provider.id,
          name: provider.name || provider.id,
          models: [],
          error: null,
        }
        try {
          const models = await llm.listModels(provider.id)
          group.models = models.map((model) => ({
            id: model.id,
            name: model.name || model.id,
            description: model.description || '',
          }))
        } catch (error) {
          group.error = failureMessage(error)
        }
        groups.push(group)
      }
      return { providers: groups, current, supported: true }
    },

    async saveSettings(body) {
      const settings = normalizeSettings({
        reviewMode: body.reviewMode,
        primary: body.primary,
        secondary: body.secondary,
        externalBaseURL: body.externalBaseURL,
        externalModel: body.externalModel,
      })
      if (body.apiKey !== undefined && body.apiKey !== '') await saveExternalKey(ctx, body.apiKey)
      if (body.clearKey === true) await clearExternalKey(ctx)
      await store.update((previous) => ({ ...previous, settings }))
      return { state: await service.view() }
    },

    async testModel(body) {
      const settings = normalizeSettings({
        reviewMode: 'single',
        primary: body.primary,
        secondary: body.secondary,
        externalBaseURL: body.externalBaseURL,
        externalModel: body.externalModel,
      })
      const mode = body.mode === 'external' ? 'external' : body.mode === 'default' ? 'default' : 'dsh'
      if (mode === 'external') {
        const key = body.apiKey !== undefined && body.apiKey !== '' ? trimmed(body.apiKey, 4096) : undefined
        if (key === undefined && (await readExternalKey(ctx)) === undefined) {
          throw new HttpError(400, '请填写外部模型 Key。')
        }
        const reply = await testExternal(settings, key)
        return { ok: true, label: `${settings.externalModel}（外部）`, reply }
      }
      let source
      if (mode === 'default') {
        source = dshSource(service)
        if (source === null) throw new HttpError(400, 'DSH 当前没有可用模型。')
      } else {
        const provider = trimmed(body.provider, 120)
        const model = trimmed(body.model, 240)
        if (provider === '' || model === '') throw new HttpError(400, '先选择一个 DSH 模型。')
        source = dshSourceFor(provider, model)
      }
      const raw = await complete(ctx, source, [{ role: 'user', content: '请只回答两个字：可用' }], {
        system: '你是模型连通性测试。只回答“可用”。',
        temperature: 0,
        maxTokens: 256,
        timeoutMs: 30000,
      })
      return { ok: true, label: source.label, reply: raw.slice(0, 200) }
    },
  }
  return service
}

function createHandler(service) {
  return async (req, res) => {
    try {
      if (!isSameOrigin(req)) {
        sendJson(res, 403, { error: '拒绝跨源请求。' })
        return
      }
      if (req.method === 'GET') {
        sendJson(res, 200, { state: await service.view() })
        return
      }
      if (req.method !== 'POST') {
        res.setHeader('allow', 'GET, POST')
        sendJson(res, 405, { error: 'method not allowed' })
        return
      }
      const body = await readJson(req)
      if (body === null || typeof body !== 'object' || Array.isArray(body)) {
        throw new HttpError(400, '请求体必须是 JSON 对象。')
      }
      let result
      if (body.action === 'createProject') result = await service.createProject(body)
      else if (body.action === 'selectProject') result = await service.selectProject(body)
      else if (body.action === 'renameProject') result = await service.renameProject(body)
      else if (body.action === 'deleteProject') result = await service.deleteProject(body)
      else if (body.action === 'saveMaterial') result = await service.saveMaterial(body)
      else if (body.action === 'saveBeat') result = await service.saveBeat(body)
      else if (body.action === 'lockBeat') result = await service.lockBeat(body)
      else if (body.action === 'lockAll') result = await service.lockAll(body)
      else if (body.action === 'generateBeats') result = await service.generateBeats(body)
      else if (body.action === 'compareBeats') result = await service.compareBeats(body)
      else if (body.action === 'applyBeatsCandidate') result = await service.applyBeatsCandidate(body)
      else if (body.action === 'reviewBeat') result = await service.reviewBeat(body)
      else if (body.action === 'reviewSheet') result = await service.reviewSheet(body)
      else if (body.action === 'batchUpdate') result = await service.batchUpdate(body)
      else if (body.action === 'batchApply') result = await service.batchApply(body)
      else if (body.action === 'getVersions') result = await service.getVersions(body)
      else if (body.action === 'starVersion') result = await service.starVersion(body)
      else if (body.action === 'restoreVersion') result = await service.restoreVersion(body)
      else if (body.action === 'listModels') result = await service.listModels()
      else if (body.action === 'saveSettings') result = await service.saveSettings(body)
      else if (body.action === 'testModel') result = await service.testModel(body)
      else if (body.action === 'pingVersion') result = { pong: `dsh-interactive-beats@${PLUGIN_VERSION}` }
      else throw new HttpError(400, `unknown action: ${String(body.action)}`)
      sendJson(res, 200, result)
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      if (status >= 500) console.error('[interactive-beats] request failed', error)
      sendJson(res, status, { error: failureMessage(error) })
    }
  }
}

/**
 * Cordis plugin metadata. Named exports only: a default export would drop the
 * `inject` declaration and the loader would mount this plugin without the
 * `webServer` service it needs.
 */
export const name = 'interactive-beats'
export const inject = ['webServer']

/**
 * Mount the Host half: one same-origin JSON route, registered as a reversible
 * effect so unloading the bundle removes it again.
 * @param ctx Cordis context carrying `webServer`; `llm`, `credentials` and
 * `agentDefaultModel` are optional and resolved lazily per request.
 */
export function apply(ctx) {
  const store = createStore(() => resolveDataDir(ctx))
  const service = createService(ctx, store)
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: ROUTE_PATH, handler: createHandler(service) }),
    'interactive-beats: api route',
  )
}
