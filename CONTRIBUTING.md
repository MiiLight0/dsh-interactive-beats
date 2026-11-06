# Contributing

**Short version: the source is open, the maintenance is ours. Issues and PRs are read; outside
PRs are not merged.**

[中文版 →](./CONTRIBUTING.zh-CN.md)

## Issues are the front door

This plugin grew out of a working studio, so **feedback that comes with a real project attached is
worth the most**: a beat that generated badly, a diff that hid something, a lock that cornered the
workflow. That is worth a hundred "nice project" messages.

If you can, include:

- the bundle version — `{"action":"pingVersion"}` reports it
- Harness version, OS, Node version
- how you installed it: GitHub / tag / tarball / npm / local checkout
- which button or HTTP action you used, what you expected, what happened
- the error text as shown. The panel prints it verbatim; the Host terminal has `[interactive-beats]`
  log lines

Feature requests go through issues too. **Describe the production problem rather than the button**
— this is a series, and the button you want may belong to the next plugin.

For vulnerabilities, do not open a public issue. See [SECURITY.md](./SECURITY.md).

## PRs: read, not merged

It is not a judgement on outside code. This production line runs on drama schedules, and a plugin
cannot sit behind someone else's review queue; one team, one voice, ship it — that is how we keep
updates moving.

So:

- A PR may be closed unmerged even when we use the idea. That is the process, not a review of your
  patch.
- If a PR does solve the problem, we implement it ourselves and credit the person who raised it in
  `CHANGELOG.md`.
- MIT is right there: if you need it now, fork it and ship your own build. No permission needed.

If you already wrote a patch, the easiest path is **an issue first** — describe the problem and what
you changed. Skip the PR.

## Running a checkout

No install step, no build step:

```sh
git clone https://github.com/MiiLight0/dsh-interactive-beats.git
cd dsh-interactive-beats
npm test          # host + client smoke tests, no Harness needed
npm run check     # release gate: manifest, identity, syntax, privacy
```

To try a checkout inside a real Harness:

```sh
dsh plugin --profile test add "$PWD"
dsh --profile test --dump-config | grep interactive-beats
```

## House rules

1. **ESM, named exports only.** The Host entry exports `name`, `inject`, `apply`. A default export
   would drop `inject` metadata and the loader would mount the plugin without `webServer`.
2. **Everything reversible.** Register routes, slots and locale dictionaries inside `ctx.effect()` so
   unloading the bundle removes them.
3. **Prompts live in the Host half.** The browser must not be able to rewrite a model prompt.
4. **No telemetry, no startup requests.** The only outbound call is a model call a human triggered.
5. **Validate at the boundary.** Every action clamps input to the same constants used by the store, and
   throws `HttpError(status, message)` — the message is shown to the user, so write it for a person.
6. **Identity is one string.** Package name, patch row `name`, client module id, `PLUGIN_VERSION` and
   the repository owner must agree; `npm run check` enforces it.
7. **Copy is part of the product.** UI strings are Chinese, in the same voice as the rest of the panel:
   short, concrete, no marketing tone.

## Brand assets

Two different marks live in this repository, and they are not interchangeable:

- `icon.svg` is the **plugin** icon — the lantern shown in the Harness plugin list. It belongs to
  this product and may be redrawn as the panel evolves.
- `docs/miilight-logo.png` is the **studio** mark. It is not covered by the MIT license: don't
  recolour it, redraw it, or crop the circle. It appears in the banner, the social card and the team
  section of both READMEs.

The banner and the social card embed the PNG as a data URI so the SVGs stay self-contained. Replacing
the mark is therefore a two-step job:

```sh
cp <new-mark>.png docs/miilight-logo.png      # square, transparent outside the circle, 192 px
node scripts/embed-logo.mjs                   # rewrite the data URI in both SVGs
rsvg-convert -w 1280 docs/banner.svg -o docs/banner.png
rsvg-convert -w 1280 docs/social-preview.svg -o docs/social-preview.png
optipng -o2 docs/*.png
npm run check
```

## Security

See [SECURITY.md](./SECURITY.md). Use GitHub's private vulnerability reporting, not a public issue.
