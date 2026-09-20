---
schema: codex-project-memory/v1
project: imouto-dev
last_verified: 2026-09-20
---

# Project Memory

## Purpose

This repository generates imouto process outputs and validates blackboard task files.

## Commands

- `corepack pnpm check` - Verify generated outputs match committed files. [verified: 2026-09-19] [source: package.json]
- `corepack pnpm check:live` - Compare outputs and shared standards with live files. [verified: 2026-09-19] [source: package.json]
- `corepack pnpm test` - Run generator, parity, installer, and blackboard tests. [verified: 2026-09-19] [source: package.json]
- `corepack pnpm tsx scripts/dsh-smoke.ts --static` - Verify both dsh bundles in an isolated profile. [verified: 2026-09-19] [source: scripts/dsh-smoke.ts]
- `corepack pnpm tsx scripts/dsh-smoke.ts --live` - Verify dsh health and blackboard tools with isolated state. [verified: 2026-09-19] [source: scripts/dsh-smoke.ts]
- `corepack pnpm --filter dsh-imouto-codex check` - Verify the owned Codex provider package. [verified: 2026-09-20] [source: packages/dsh-imouto-codex/package.json]

## Architecture

- Canon files feed host specifications and committed generated outputs. [status: active] [verified: 2026-09-19] [source: scripts/generate.ts]
- The blackboard CLI validates tasks and applies controlled status transitions. [status: active] [verified: 2026-09-19] [source: tools/blackboard/cli.ts]
- The dsh host generates process and Yuu bundles without live installation targets. [status: active] [verified: 2026-09-19] [source: hosts/dsh/host.yaml]
- `dsh-imouto-codex` provides `openai-codex` for Yuu's parent model. [status: active] [verified: 2026-09-20] [source: packages/dsh-imouto-codex/cordis.patch.yml]

## Conventions

- Generated outputs remain byte-identical when canon files use no template features. [verified: 2026-09-19] [source: scripts/parity.test.ts]
- Yuu delegates only through imouto-driver MCP tools. Native dsh delegation rows stay absent. [verified: 2026-09-20] [source: hosts/dsh/agent.cordis.yml; scripts/parity.test.ts]

## Known Pitfalls

- Live standards may use mixed line endings -> normalize carriage returns before extraction. [status: active] [verified: 2026-09-19] [source: scripts/check-live.ts]
- ESM bundles using YAML need a `createRequire` banner -> use `scripts/build-dsh.ts`. [status: active] [verified: 2026-09-19] [source: scripts/build-dsh.ts; live smoke]
- Live overlay plugins must use the staged absolute file -> bare bundle names resolve outside the overlay. [status: active] [verified: 2026-09-19] [source: scripts/dsh-smoke.ts]
- Yuu previously copied every standard agent row -> native delegation rows are now intentionally excluded. [status: superseded] [verified: 2026-09-20] [source: hosts/dsh/agent.cordis.yml; scripts/parity.test.ts]
- Harness `0.1.6-alpha.2` uses explicit image target dimensions -> adapt provider projections before calling `readImageRequest`. [status: active] [verified: 2026-09-20] [source: packages/dsh-imouto-codex/src/adapter.ts]

## Decisions

### 2026-09-19 - Keep dsh bundles outside live installation

- Decision: Generate dsh bundles with empty installation paths.
- Why: dsh installs bundles through profile package management.
- Alternatives: Direct live output installation was rejected.
- Evidence: `hosts/dsh/host.yaml` and the static smoke profile.

### 2026-09-19 - Preserve initial live rule text

- Decision: Keep the five canon files byte-identical to the approved live snapshot.
- Why: Later tasks change content after this repository establishes parity.
- Alternatives: Immediate rule updates were deferred.
- Evidence: `scripts/parity.test.ts` verifies all five approved hashes.

### 2026-09-20 - Own the Codex parent provider

- Decision: Maintain the Codex provider as `packages/dsh-imouto-codex`.
- Why: GPT orchestrates Yuu while imouto-driver retains DeepSeek Flash workers.
- Alternatives: A Codex worker provider and Harness fork were rejected.
- Evidence: `packages/dsh-imouto-codex/UPSTREAM.md` and `hosts/dsh/agent.cordis.yml`.

## Open Questions

None.

## Session Handoffs

### 2026-09-20 - Codex parent provider

- Done: Imported, renamed, ported, tested, and integrated the Codex provider.
- Pending: Parent review, publication, hosted CI, and OAuth acceptance.
- Next: Review the provider diff and install all three dsh bundles.
- Verification: Typecheck, 281 tests, build, static smoke, and security scans passed.

### 2026-09-19 - Canon repository implementation

- Done: Implemented generation, parity, installation, validation, transitions, dsh bundles, and live smoke coverage.
- Pending: Manual Yuu Web UI acceptance.
- Next: Install approved outputs, reinstall the Codex plugin, and run the scratch Yuu session.
- Verification: Typecheck, 46 tests, generated check, static smoke, live smoke, and merge-tree passed.
