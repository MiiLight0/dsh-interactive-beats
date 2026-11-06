#!/usr/bin/env node
/**
 * Re-embeds docs/miilight-logo.png into the SVG sources that carry the studio mark.
 *
 * The banner and the social card are self-contained: the logo travels inside the
 * SVG as a data URI so the files render the same in a browser, on GitHub and in
 * rsvg-convert. That also means replacing the PNG is a two-step job — drop the
 * new file in, then run this script — otherwise the SVG keeps the old bytes.
 *
 * No dependencies. Rendering the PNGs afterwards needs rsvg-convert; see
 * CONTRIBUTING.md.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const DOCS = new URL('../docs/', import.meta.url)
const TARGETS = ['banner.svg', 'social-preview.svg']
const EMBEDDED = /(<image\b[^>]*\bhref=")data:image\/png;base64,[^"]*/g

const logo = readFileSync(new URL('miilight-logo.png', DOCS))
const href = `data:image/png;base64,${logo.toString('base64')}`

let failed = false
for (const name of TARGETS) {
  const file = new URL(name, DOCS)
  const source = readFileSync(file, 'utf8')
  if (source.match(EMBEDDED) === null) {
    process.stderr.write(`${name}: no embedded PNG found — nothing to update\n`)
    failed = true
    continue
  }
  const next = source.replace(EMBEDDED, `$1${href}`)
  if (next === source) {
    process.stdout.write(`${name}: already current\n`)
    continue
  }
  writeFileSync(file, next)
  process.stdout.write(`${name}: embedded ${logo.length} bytes of miilight-logo.png\n`)
}

if (failed) process.exitCode = 1
