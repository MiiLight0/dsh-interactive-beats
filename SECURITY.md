# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | yes |

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting on this repository
(**Security → Report a vulnerability**). Do not open a public issue for anything that could be
exploited before a fix ships.

Useful details: Harness version, OS, how you installed the bundle, and the smallest sequence that
reproduces the problem.

We do not merge outside pull requests, but if you already have a patch, attach it to the private
report. We will apply it in-house and credit you.

We are a small studio, so the honest timeline is: **acknowledgement within 3 working days**, and a
fix or a written explanation within 30 days. If the report is about the Harness itself rather than
this bundle, please report it to the Harness project instead.

## What is in scope

The bundle's own code: the Host half (`index.js`), the client half (`client.js`), the shipped
prompts, the store format and the release gate.

Things we care about most:

- **Cross-origin access to the local store.** One same-origin route, `Origin` checked, `403` otherwise.
- **Credential leakage.** The external model key lives in the Host credential service; it must never
  reach the project JSON, a response body, an export or a log line.
- **Path traversal or shell execution.** There is no shell call and no user-controlled path anywhere.
- **Prompt injection with side effects.** Model output is data: it is parsed, clamped and shown, never
  executed. If you find a path where model output becomes a command, a URL fetch, or a file path, that
  is a real bug.

## What is not in scope

- The quality, accuracy or safety of model output. See *Known Limitations* in the README.
- Anything a model provider does with the text you send it. The external route contacts the URL you
  configure, and nothing else.
- Harness, Cordis, or third-party providers. Report those upstream.
- Findings that require an attacker to already control your machine, your profile directory, or your
  Harness installation.

## Safety notes for users

- The store is a plain JSON file with mode `0600` in your profile's `plugin-data` directory. Anyone
  who can read your user account can read your story material.
- The external endpoint is empty by default. If you point it at a third-party service, the beat text
  you ask about leaves your machine.
- Exports are local files. Treat them like any other unpublished script.
