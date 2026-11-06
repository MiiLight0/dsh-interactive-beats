# Changelog

All notable changes to this bundle are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-06

### Fixed

- **New project and rename no longer die silently in the desktop app.** Both
  actions called `window.prompt`, which Electron replaces with a stub that throws
  synchronously; the throw landed inside a React handler, so the click looked
  like it did nothing at all. They now open an in-panel dialog. The dialog keeps
  the caret in the input while you type, submits on Enter, closes on Escape, and
  disables OK while the name is empty.
- Every confirmation — delete, overwrite on generate/compare, unlock one or all,
  switching away from unsaved work — moved to the same in-panel confirm. The
  client no longer calls `window.prompt`, `window.confirm` or `window.alert` at
  all, so the panel also works in shells where native dialogs are missing or
  block the renderer.

### Added

- Complete English UI. The `en` dictionary went from 110 explicit strings (the
  rest fell back to Chinese) to 308 entries matching `zh` key for key; the panel
  follows the Harness locale.
- README screenshot of the workbench (`docs/panel.webp`, 1600 px, about 80 KB).

### Changed

- The release gate now fails on any `window.prompt` / `window.confirm` /
  `window.alert` call, on a key missing from `en`, and on a placeholder mismatch
  between the two dictionaries.

## [0.1.0] - 2026-11-06

First public release.

### Added

- Material pool per project: one working document for world, characters,
  synopsis and loose ideas. The store lives in the profile's `plugin-data`
  directory (resolved from `ctx.profileContext.dir`, so profiles do not share a
  file), is written atomically and carries mode `0600`.
- `generate 15 beats`: sends the whole pool to the selected model and returns
  one throughline (logline, theme, 15 beats, missing material, structure notes).
- `compare beats`: the same prompt runs on the primary and secondary routes in
  parallel; nothing is written until you pick a sheet.
- Beat editor with two views: list and table. Page, one-liner, content and hook
  are editable in the table and save on blur; the value turn lives in the detail
  panel.
- Batch rewrite over up to 6 beats with a per-cell character-level diff and
  per-cell accept, or accept all selected cells at once.
- Per-beat version history with `MMDDHHMM` ids, starring and restore. A beat
  keeps up to 30 versions inside the project document.
- Per-beat and whole-sheet review: one score, five weighted dimensions,
  concrete issues, one fix, three alternatives. Dual-model mode runs the same
  prompt on two models and shows both report cards side by side.
- Finalize and lock: locked beats are read-only; all 15 locked freezes the
  foundation.
- Markdown export of the brief, all 15 beats, reviews, notes, missing material
  and structure notes. Copy or download.
- Model list read from the Host (`llm.listProviders()` / `llm.listModels()`),
  grouped by provider, with no key needed for models DSH already knows.
- Optional OpenAI Chat Completions compatible endpoint. The key is stored in
  the Host credential service and never returned to the browser. The address is
  empty by default: nothing is sent anywhere until you fill it in.
- Sidebar entry (`sidebar.panellist`) and main panel, both registered through
  Cordis effects so unloading the bundle removes them again.
- English and Chinese marketplace metadata; the panel itself is written in
  Chinese.
- Studio branding: the team's own mark (`docs/miilight-logo.png`) on the banner,
  the social card and the team section of both READMEs. The MIT license covers
  the code, not the brand assets.
- Maintenance model documented in both READMEs and `CONTRIBUTING.md`: the source
  is MIT and open, upstream updates are made in-house, and outside pull requests
  are read but not merged.
