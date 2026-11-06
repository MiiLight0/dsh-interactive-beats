# Architecture

Four minutes of reading, for anyone reviewing the bundle or planning to build on it.

## Two halves, one contract

```
┌─ Host (Node, index.js) ───────────────┐        ┌─ Client (browser, client.js) ─┐
│ Cordis plugin: export name/inject/apply│        │ __ModuleLoader__.load({...})  │
│ one route: /interactive-beats/api     │◀──────▶│ sidebar.panellist + main slot │
│ JSON store in plugin-data/            │  HTTP  │ React panel, zh/en dictionary │
│ prompts, model calls, validation      │        │ render + local UI state       │
└───────────────────────────────────────┘        └───────────────────────────────┘
```

The Host half is the only half that can read the disk, touch the credential service or call a model.
The client half is a normal React component registered into two slots. There is no IPC, no websocket
and no second route to keep in sync.

## Why one route

`GET` returns the current state, `POST` carries an `action` field and returns a result object. One
route means one origin check, one body parser and one error shape. The alternative — a REST surface
per entity — would add a lot of routing for a single-user local tool.

Every action funnels through the same three steps:

1. **clamp** — ids, titles, material and beat fields are cut to the constants at the top of
   `index.js`, never trusted at length;
2. **mutate a clone** — the store hands the mutator a deep copy, so a thrown `HttpError` inside the
   mutator leaves both memory and disk untouched;
3. **write atomically** — temp file in the same directory, `rename`, `chmod 0600`, then update the
   in-memory cache. A failed write leaves the previous state in place.

Writes are serialized through a promise queue, so two panel actions arriving together cannot
interleave read-modify-write.

## The store

One JSON document per profile:

```
plugin-data/interactive-beats.json
{ version, updatedAt, activeProjectId, projects[], settings }
```

- `version` is `STATE_VERSION` (currently `1`). Loading runs every field through a normalizer, so a
  hand-edited or older file degrades to defaults instead of crashing the panel.
- Versions are stored inline per beat (max 30) rather than in a side table: they are only ever read
  or written with their beat, and keeping them together makes restore a single array operation.
- The panel never receives version snapshots in the state payload — it asks for one beat's history
  when the user opens it. That keeps the payload small on a 15-beat project with history.

## Model calls

`complete()` picks one of two implementations:

- **DSH routes** go through `llm.prepareCall()` and `prepared.stream()`. The bundle never holds a
  provider key for these; the Host already has one.
- **External routes** are a plain `fetch` to the URL the user typed, with the key read from the
  credentials service at call time. `http`/`https` only, 240 s timeout, `stream: false`.

Both return a string. `parseModelJson()` strips an optional Markdown fence, takes the outermost
`{...}` span and parses it — models add prose around JSON often enough that a strict `JSON.parse` on
the whole reply would fail on perfectly good output.

Prompts are constants in the Host half. The client sends material, ids and settings — never a prompt.

## Dual-model compare

`compareBeats` runs both routes with `Promise.allSettled`, normalizes each sheet, and parks the
results in an in-memory map keyed by a random id (max 24 entries, oldest evicted). The panel shows
both; `applyBeatsCandidate` takes the id and writes the chosen sheet. A Host restart drops pending
candidates, which is the intended behaviour: nothing half-compared should survive as state.

## Client

Plain `React.createElement` (aliased to `h`), no JSX, no bundler, no client-side dependencies beyond
the `react` the Harness page already provides. The panel keeps one `state` object from the Host and
a small amount of local UI state; every mutation is a round-trip, so two windows cannot silently
diverge.

The stylesheet is injected as a single `<style>` element using the Host's CSS custom properties
(`--dsw-alias-*`), which is why the panel follows the Harness light/dark theme without any theme
code of its own.

## Failure behaviour

| Failure | What the user sees |
| --- | --- |
| Model returns prose instead of JSON | `502` with the first 120 characters, so it is obvious what happened |
| Model stream breaks mid-answer | `502 模型响应中断：…` |
| External endpoint missing / bad scheme | `400` before any network call |
| Cross-origin POST | `403`, no body parsing |
| Locked beat edited | `409`, and the panel keeps the unsaved text |
| Store write fails (disk full, read-only) | `500`, and the in-memory state is not updated |

## Deliberate omissions

- No `Config` schema: settings are per-user and live in the panel, not in a profile file.
- No model-facing tools: this plugin does not change what an agent can do.
- No migrations: `STATE_VERSION` exists so a future release can add one, not because there is one.
- No streaming to the browser: generation is a single result the user reviews, not a chat.
