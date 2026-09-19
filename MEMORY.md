---
schema: codex-project-memory/v1
project: imouto-dev
last_verified: 2026-09-19
---

# Project Memory

## Purpose

This repository generates imouto process outputs and validates blackboard task files.

## Commands

- `corepack pnpm check` - Verify generated outputs match committed files. [verified: 2026-09-19] [source: package.json]
- `corepack pnpm check:live` - Compare outputs and shared standards with live files. [verified: 2026-09-19] [source: package.json]
- `corepack pnpm test` - Run generator, parity, installer, and blackboard tests. [verified: 2026-09-19] [source: package.json]

## Architecture

- Canon files feed host specifications and committed generated outputs. [status: active] [verified: 2026-09-19] [source: scripts/generate.ts]
- The blackboard CLI validates tasks and applies controlled status transitions. [status: active] [verified: 2026-09-19] [source: tools/blackboard/cli.ts]

## Conventions

- Generated outputs remain byte-identical when canon files use no template features. [verified: 2026-09-19] [source: scripts/parity.test.ts]

## Known Pitfalls

- Live standards may use mixed line endings -> normalize carriage returns before extraction. [status: active] [verified: 2026-09-19] [source: scripts/check-live.ts]

## Decisions

### 2026-09-19 - Preserve initial live rule text

- Decision: Keep the five canon files byte-identical to the approved live snapshot.
- Why: Later tasks change content after this repository establishes parity.
- Alternatives: Immediate rule updates were deferred.
- Evidence: `scripts/parity.test.ts` verifies all five approved hashes.

## Open Questions

- [ ] Confirm the first live installation after oniichan approves it. Next check: run `corepack pnpm install-outputs --apply`. [added: 2026-09-19]

## Session Handoffs

### 2026-09-19 - Canon repository implementation

- Done: Implemented generation, parity, live checks, installation, blackboard validation, and transitions.
- Pending: Manual live installation approval and plugin reinstall.
- Next: Parent review and manual acceptance.
- Verification: Typecheck, 22 tests, generated check, and live check passed.
