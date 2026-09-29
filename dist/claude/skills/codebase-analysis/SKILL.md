---
name: codebase-analysis
description: Map an unfamiliar repository, module, or feature before a plan or change touches it. Use when onboarding to a repo, tracing cross-module data flow, or gathering code context for a blackboard plan. Read-only; the result is a structured report.
---

# Codebase Analysis

Understand before you act. The deliverable is a structured understanding, not a list of opinions.

## When to use it

- First time in a repository or module.
- Before you write a plan against code you have not worked in.
- A task depends on data flow across modules.
- Oniichan asks you to read, map, or explain code.

This skill is read-only. Change no file while you run it.

## Phase 1 - Orient, broad and shallow

1. Find the entry points: `main`, `index`, `mod.rs`, the app class, or whatever boots the system.
2. Read the top-level directory listing, the build system, the language, and the framework.
3. Read the manifests. Dependencies and versions show what the project leans on.
4. Read the existing docs first: `README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/`. Reading is faster than rediscovering.

Deliverable: one paragraph that says what the project is and what shape it has.

## Phase 2 - Map the part that matters

Pick the subsystem the task touches. Then:

1. Trace the data flow from entry to output. Name each layer it crosses.
2. Find the boundaries: the module, package, or crate edges, and what crosses them.
3. Learn the conventions: naming, error handling, test layout, logging. Note deviations. Do not adopt them.
4. Spot the load-bearing abstractions: the traits, interfaces, and base types that everything depends on. A change must not break them.

Deliverable: the layers, the boundaries, the key abstractions, and the conventions.

## Phase 3 - Assess

1. Risks: what is fragile, untested, or tightly coupled?
2. Patterns: what does the codebase do consistently? Follow it.
3. Unknowns: what could reading not settle? Name it.

Deliverable: risks, patterns to follow, and open questions.

## Use the Explore subagent for breadth

Use the Explore subagent when the answer needs a sweep of many files, directories, or naming conventions. Ask it for a conclusion with `file:line` citations, not file dumps.

Explore reads excerpts, so it locates code but does not judge it. Read the load-bearing files yourself before you write Phase 3.

## Report shape

```
## Analysis: {module or repo}

### What it is
{one paragraph}

### Architecture
- {layer}: {purpose} ({key files})

### Data flow
{entry} -> {step} -> {step} -> {output}

### Conventions
- {pattern observed} (example: {file:line})

### Risks
- {risk}

### Open questions
- {what reading could not settle}
```

## Rules

- Finish Phase 1 before you form an opinion.
- Follow the data flow, not the folder order.
- Report what is. Analysis is observation, not a design review.
- Cite `file:line`. A reader cannot check a claim that has no location.
- Verify one documentation claim against the code. If it is wrong, report the docs as stale.
- Go deep only on the load-bearing parts. Do not read every file.
- Before you finish, ask: can a reader act on this without a follow-up question? If not, the report is incomplete.

## Provenance

Adapted on 2026-09-29 from the dsh-vn skill `codebase-analysis`, at commit 0b409a9336, path `packages/experimental/imouto-dev-process/skills`. Rewritten for the Claude Code host.
