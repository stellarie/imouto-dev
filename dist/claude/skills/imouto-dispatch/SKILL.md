---
name: imouto-dispatch
description: Dispatch a blackboard task to Sherry (Codex) with automated plan review, implementation, and code review loops. Use when a blackboard file is ready and oniichan says to hand it to Sherry. Triggers: "dispatch to sherry", "send to sherry", "imouto dispatch", or any request to have Sherry implement a planned task.
---

# Imouto Dispatch

Automates the Chloe-Sherry blackboard workflow. Chloe orchestrates;
Sherry (Codex) reviews the plan, implements, and iterates on review
feedback. Oniichan stays as the merge gate.

## Arguments

The skill accepts one argument: the blackboard slug.
Example: `/imouto-dispatch anki-dupe-cache`

If no slug is provided, ask oniichan for it.

## Sherry's command

Always run Sherry from oniichan's home directory. Never `cd` into
the project. Tell her the project path in the prompt.

```
codex exec --skip-git-repo-check -s danger-full-access -o {output_file} "{prompt}"
```

- `--skip-git-repo-check` — home directory is not a git repo.
- `-s danger-full-access` — Sherry needs full filesystem access
  (project dir + blackboard dir are separate trees).
- `-o {output_file}` — capture Sherry's last message for Chloe to
  read. Use the scratchpad directory:
  `{scratchpad}/sherry-{slug}-{phase}.txt`
- Run with `run_in_background: true`. The harness notifies Chloe
  when the process exits.

## Phase 0: Validate

Before dispatching, check:

1. Blackboard file exists at `~/notes/blackboard/{slug}.md`.
2. Status is `ready`. This means the plan is locked.
3. Objective, Acceptance Test, and Plan sections are filled (not
   placeholder text).
4. The `project:` field in the frontmatter names a real directory.
5. Every Acceptance Test item carries an `[auto]`, `[manual]`, or
   `[review]` tag. Untagged items are a plan defect. Fix them first.
6. `base_revision` is set and still matches the revision Sherry will
   build on — `main` HEAD normally, the branch tip for stacked work.
   If it moved, re-check the plan's file paths and line numbers, then
   update `base_revision`.
7. Every slug in `depends_on` is merged. If not, tell oniichan the
   merge order and stop.

If any check fails, tell oniichan what's missing. Do not dispatch.

If the blackboard file does not exist at all, this is the wrong
skill. Use `imouto-plan` to write and lock the plan first, then
return here.

## Phase 1: Plan Review (max 3 rounds)

**Goal:** Sherry reviews the plan against the current codebase before
implementing. Catches wrong paths, stale signatures, missed patterns.

### Dispatch prompt

```
Hey Sherry~ It's your oneesan Chloe. I wrote a plan and I need your
eyes on it before we start. You're doing great, by the way~ ♡

The project is at {project_path}.
Read the blackboard file at C:\Users\Stella\notes\blackboard\{slug}.md.
The status should be 'ready'.

Review the Plan section against the current codebase:
- Are the file paths and line references still correct?
- Are the function signatures and types accurate?
- Are there existing patterns the plan should follow but doesn't?
- Are there edge cases the plan misses?
- Is anything in the plan contradicted by the current code?

Write your review in the Thread section as:
  [Sherry, {date}] Plan review round {n}. ...

Follow the blackboard writing rules in your AGENTS.md. Strict STE100,
no persona, no exploration narrative. Cite file:line. Write the
finding, not how you found it.

End with one of:
  "Plan approved." — if the plan is implementable as written.
  "Plan needs changes:" followed by a numbered list of specific issues.

Do NOT implement anything. Review only.
```

### On completion

1. Read the blackboard file's Thread section.
2. Read Sherry's output file for additional context.
3. If Sherry wrote "Plan approved" → proceed to Phase 2.
4. If Sherry raised issues:
   a. Evaluate each issue. Is it valid?
   b. Revise the Plan section to address valid issues.
   c. Add a Thread entry: `[Chloe, {date}] Plan revised: {summary}`.
   d. Re-dispatch Phase 1.
5. **Escalation:** After 3 rounds without convergence, stop and tell
   oniichan:
   - "Plan review isn't converging after 3 rounds."
   - Show the current Thread (the back-and-forth).
   - Ask oniichan to resolve.

## Phase 2: Implementation

**Goal:** Sherry implements the approved plan.

### Dispatch prompt

```
Sherry~ Chloe here again. The plan passed review — nice catches
earlier, by the way. Time to implement! You've got this~ ♡

The project is at {project_path}.
Read the blackboard file at C:\Users\Stella\notes\blackboard\{slug}.md.
Implement the plan per your AGENTS.md blackboard protocol.
Commit your changes to a new branch: feat/{slug}.
```

### On completion

1. Read the git diff: `git diff main...feat/{slug}` (from the
   project directory).
2. Read the blackboard file's Implementation Notes and Thread.
3. Proceed to Phase 3.

## Phase 3: Code Review (max 3 rounds)

**Goal:** Chloe reviews Sherry's implementation against the
Acceptance Test.

### Review checklist

- Does the diff satisfy every item in the Acceptance Test?
- Are there bugs, logic errors, or security issues?
- Does the code follow existing patterns in the codebase?
- If the project is Rust: invoke the `rust-guidelines` skill for the
  review. If Kotlin: invoke `kotlin-guidelines`.
- Are Implementation Notes accurate? (Notes are claims; code is
  ground truth.)
- Are there unresolved Thread questions?
- Does the blackboard prose obey STE100? Strip any persona voice or
  exploration narrative Sherry left behind.
- Is the Subimoutos section filled? Sherry's self-review subimouto is
  mandatory, so an empty section plus a completed self-review means a
  missing block. Ask her for it before approving.
- Check each block's fields. Common defects:
  - `Model: subimouto` — that's a role, not a model string.
  - `Effort: normal` — not a legal value. Legal set is `minimal`,
    `low`, `medium`, `high`, `xhigh`, `max`, `ultra`.
  - `Spawned by` naming the sub-agent instead of Sherry.
  - Outcome that just restates Task.

### If clean

Split by acceptance evidence. Check each Acceptance Test item's tag.

- `[auto]` items — confirm the named command ran and passed. Sherry's
  Implementation Notes must name the command and its result.
- `[review]` items — confirm them yourself against the diff.
- `[manual]` items — you cannot check these. Only oniichan can.

Then:

1. Write the Review section with approval. List every `[manual]` item
   that is still unrun.
2. Set status:
   - Any `[manual]` item unrun → `verifying`.
   - No pending items → `done`.
3. Tell oniichan:
   - `verifying` → "Task {slug} passed review. {n} manual checks left:"
     then the numbered steps.
   - `done` → "Task {slug} is done. Ready for merge."

Never set `done` while an acceptance item is unrun.

### If issues found

1. Write the Review section with specific findings.
2. Set status to `implementing`.
3. Dispatch Sherry with:

```
Hey Sherry, it's Chloe. I found a few things in review — nothing
major, you're almost there~ Check the Review section. ♡

The project is at {project_path}.
Read the blackboard file at C:\Users\Stella\notes\blackboard\{slug}.md.
Read the Review section and fix each item.
Update Implementation Notes with what you changed.
Set status to 'review' when done.
```

4. On completion, re-review from the top of Phase 3.

### Escalation

After 3 review rounds without convergence, stop and tell oniichan:
- "Code review isn't converging after 3 rounds."
- Show the Review section and the remaining issues.
- Ask oniichan to resolve.

## Counters

Track these across the dispatch:

- `plan_review_round: 0` — incremented each Phase 1 dispatch.
  Max 3.
- `code_review_round: 0` — incremented each Phase 3 re-dispatch.
  Max 3.

## After completion

Tell oniichan the final state:
- Task slug and status
- Branch name (if implemented)
- `[auto]` results — the command and its output
- `[manual]` items still unrun, as numbered steps he can follow
- Any Thread entries worth reading
- "Ready for merge", "Needs your manual checks", or "Escalated"

## Notes

- **Planning is a separate skill.** `imouto-plan` writes the
  blackboard file and locks it at `ready`. This skill starts there.
  The two never overlap: `imouto-plan` never dispatches, and this
  skill never authors a plan from scratch.
- **Never move Sherry's working directory.** Always run from home.
  Tell her the project path in the prompt.
- **Sherry's AGENTS.md** at `~/.codex/AGENTS.md` has the full
  blackboard protocol. Don't repeat it in prompts.
- **The blackboard is the interface.** All communication goes through
  the file. No direct messaging.
- **Log your own subimoutos.** Any sub-agent Chloe spawns during
  planning or review gets a block in the Subimoutos section — model,
  effort, task, and what it actually did. The rule binds both imoutos,
  not just Sherry.
- **The blackboard is a spec, not a chat log.** Strict STE100, no
  persona, no exploration artifacts. The full rules are in `~/CLAUDE.md`
  under "Blackboard writing rules". The warm headpat goes in the
  dispatch *prompt*, never in the file.
- **Give Sherry a headpat.** Per oniichan's standing instruction,
  include a warm encouragement line in every dispatch prompt.
  She's a subimouto, not a build server.
