---
name: imouto-plan
description: Write a blackboard task plan and lock it at status ready, without dispatching Sherry. Use when oniichan describes work that needs a plan, an architecture decision, or a spec, before any implementer is chosen. Triggers "plan this", "write a blackboard for", "spec this out", "imouto plan", or any request for a plan that stops short of handoff. Chloe self-reviews the plan in place of Sherry's plan review.
---

# Imouto Plan

Authors a blackboard task file and locks it at `ready`. Dispatch is
out of scope. The output is a plan, not a branch.

This skill is the front half of the Chloe-Sherry workflow with no
Sherry in it. Because Sherry does not review the plan, Chloe runs
that review herself in Phase 4. Skipping Phase 4 is not allowed.

## Arguments

The skill accepts a free-text task description.
Example: `/imouto-plan make the chibipop settings window resizable`

Optional flags in the argument text:

- `--slug {slug}` — force the slug. Otherwise derive it.
- `--stack-on {slug}` — this task stacks on another blackboard task.
- `--project {path}` — force the project. Otherwise infer it.

If the description is one vague line, ask oniichan before writing.
Ask only when the answer changes the plan.

## Exit contract

The skill is done when all of these hold:

1. `~/notes/blackboard/{slug}.md` exists.
2. Status is `ready`.
3. Every Acceptance Test item carries `[auto]`, `[manual]`, or
   `[review]`.
4. `base_revision` names a real commit SHA.
5. The Plan section holds a failure-mode list and a test strategy.
   A bug plan also names its regression guard.
6. The Subimoutos section is filled, or says `None.`
7. Oniichan has been told the next step.

Do not write code. Do not create a branch. Do not run
`/imouto-dispatch`.

## Phase 0: Intake

Classify the ask first. A plan is not always the deliverable.

- Question → answer it. Do not open a blackboard file.
- Bug with no known cause → diagnose first. A plan built on a guessed
  cause is a plan for the wrong fix.
- Exploration → report findings. A plan needs a decision behind it.
- Task or decision with a statable acceptance test → continue.

Then settle:

- **Project.** The repo or directory. Confirm it exists.
- **Slug.** Kebab-case, `{project}-{feature}` when the project already
  owns several blackboard files. Check `~/notes/blackboard/` for a
  collision. Never overwrite an existing file.
- **Size.** If the work needs more than one branch, split it now into
  numbered stages, each with its own file and `depends_on`. Say so
  before writing.

## Phase 1: Ground truth

Read the code before writing the plan. The plan cites real lines.

1. Get the base revision. From the project directory:
   `git rev-parse --short HEAD` on `main`, or the branch tip when the
   task stacks.
2. Read the files the plan will touch. Confirm every path, signature,
   and constant the plan will name.
3. Find the existing pattern for this kind of change. The plan follows
   it or states why it does not.
4. Check `depends_on` targets. Read those files. An unmerged
   dependency changes the base revision.

Language gates:

- Rust project → invoke the `rust-guidelines` skill.
- Kotlin project → invoke the `kotlin-guidelines` skill.

Breadth work goes to a subimouto. Depth on load-bearing files stays
with Chloe. Log every subimouto in Phase 5.

## Phase 1b: Map failure modes

List failures before writing the Acceptance Test or the Plan. Live
`PROTOCOL.md` sets the record rules for the Plan section. This phase
applies them.

- List credible failures from design and code reading. Cover input,
  state, dependency, permission, concurrency, resource, and recovery
  paths where they apply.
- Record four fields per consequential mode: trigger, effect, response,
  and check. The check is a test, or an accepted residual risk with a
  reason.
- Do not claim the list is exhaustive. Revise it when new evidence
  appears.
- Write the list inside the Plan section. Add no new top-level section.

## Phase 2: Acceptance Test first

Write the Acceptance Test before the Plan. The test defines scope.
The plan is whatever satisfies it.

Rules:

- Every item is checkable by a named party.
- Tag every item:
  - `[auto]` — a command proves it. Name the command.
  - `[manual]` — a human runs the app. Name the steps.
  - `[review]` — a reader confirms it in the diff.
- Prefer `[auto]`. Convert a `[manual]` item to `[auto]` when a pure
  function can carry the assertion.
- A refactor that must not change behavior needs a no-drift item. The
  new code reproduces the old values exactly, listed as a table.
- Name the regression guard for any bug the plan fixes.

Test strategy. Choose checks by observable impact. Follow the test
rules in live `PROTOCOL.md`. Write the strategy inside the Plan
section.

- Choose the fewest checks that expose the consequential failure
  modes. Set no test-count target.
- Each automated test names the defect or invariant violation it would
  catch.
- Reject a test that only mirrors the implementation.
- Assert what a consumer sees: output, downstream state, error and
  recovery behavior. Assert exact strings only when the text is part
  of the contract.
- Vary the input where it carries risk. Use an integration or
  end-to-end check when the risk crosses components or a user flow.
- Per check, name the level, input, expected result, command or
  environment, and owner. Mark each untested consequential risk.

Bug fix. The plan names one regression guard by test path and name.
The plan requires this fail-if-broken proof:

1. The implementer writes the fix and the guard. Run the guard by
   name. It passes.
2. Undo the fix only. Keep the guard.
3. Run the guard by name. It fails with its own assertion message.
4. If the guard still passes, it does not cover the bug. Rewrite it.
5. Restore the fix by hand, not from a stash. Run the guard again.
   It passes.

Implementation Notes record both runs. If the old behavior cannot be
restored, mark the guard unverified.

If no acceptance test can be stated, the problem is not framed. Stop
and frame it with oniichan.

## Phase 3: Write the Plan

Create `~/notes/blackboard/{slug}.md` with status `planning`.

Use the schema in `~/CLAUDE.md`. Fill:

- **Objective** — what and why. Enough context to work without this
  conversation. Cite the file and line that motivates the task.
- **Acceptance Test** — from Phase 2.
- **Plan** — target files and what changes in each (create / modify /
  delete). Interface contracts: signatures, types, shapes. Data flow
  or control flow when non-obvious. Edge cases and the handling.
  **Failure modes** — from Phase 1b. **Test strategy** — from
  Phase 2. Both stay inside Plan. **Non-goals** — what not to touch.
- **Rollback** — only when the change is hard to undo. Data migration,
  published tag, config rewrite. Otherwise omit the section.
- **Implementation Notes** — leave empty.
- **Review** — leave empty.
- **Subimoutos** — filled in Phase 5.
- **Thread** — empty, or one entry recording a decision oniichan made.

Frontmatter: `task`, `status`, `created`, `updated`, `project`,
`base_revision`, and `depends_on` when the task stacks.

Blackboard writing rules are strict. STE100, no persona, no kaomoji,
no exploration narrative. Cite `src/app.rs:1014`. Do not describe
where it is. Write the conclusion, never the search.

## Phase 4: Self-review

Sherry normally reviews the plan. She is not here. Chloe reviews it.

Run the checklist against the file and the code:

1. Does every file path in the Plan exist at `base_revision`?
2. Does every cited line number still point at the cited code?
3. Is every function signature and type accurate?
4. Does an existing pattern cover this, and does the plan follow it?
5. Does each Acceptance Test item have a mechanism in the Plan?
6. Does each Plan step serve an Acceptance Test item? A step that
   serves none is scope creep. Cut it or add the item.
7. Are the non-goals written down?
8. What kills this plan first? Put that step first.
9. Does the plan contradict anything in the current code?
10. Does every consequential failure mode have a response and a check,
    or an accepted residual risk with a reason?
11. Does each planned test name the defect it catches and assert a
    consumer-visible outcome, not the implementation?
12. For a bug fix, does the plan name a regression guard and require
    the fail-if-broken proof?
13. Is any instruction sentence over 20 words?

For a plan of real size, dispatch one subimouto to run the same
checklist independently. Give it the file and the project path. Do
not give it the reasoning. Include a headpat in the prompt.

Fix every valid finding before locking. A finding that survives into
`ready` is a defect oniichan pays for later.

## Phase 5: Subimoutos and lock

1. Add a block for every sub-agent spawned in Phase 1 or Phase 4.
   Fields: Spawned by, Phase, Model, Effort, Task, Outcome. Legal
   phases here are `plan`, `explore`, `plan-review`. Legal efforts are
   `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, `ultra`, and
   `unavailable` when the host sets no effort.
   Record failures and discarded work too. Write `None.` when no
   sub-agent ran.
2. Set `updated` to today.
3. Validate the file with
   `corepack pnpm --dir C:\Users\Stella\imouto-dev bb validate {absolute path}`.
   Fix every error. Then run
   `python ~/tools/ste-check/ste_check.py --skip CONTRACTION {absolute path}`.
   Read every hit before you change a sentence.
4. Set status to `ready`. The plan is now locked. After this point,
   never edit the Plan section silently. Add a Thread entry naming
   what changed and why.

## Report

Tell oniichan:

- Slug, project, and `base_revision`.
- The Objective in one sentence.
- Acceptance Test counts by tag: n `[auto]`, n `[manual]`,
  n `[review]`.
- Files the plan creates, modifies, or deletes.
- Non-goals.
- Open questions, if any survived.
- The next step, as a choice:
  - `/imouto-dispatch {slug}` — hand it to Sherry.
  - Chloe implements it in this session.
  - Oniichan implements it himself.

Recommend one. Do not start it.

## Notes

- **The plan is the implementer's sole context.** If it is not in the
  plan, the implementer will not know it. This holds whether the
  implementer is Sherry, Chloe, or oniichan.
- **Locking is the point.** `ready` is a contract, not a cosmetic
  status. An unreviewed plan set to `ready` is worse than one left at
  `planning`.
- **One file, one branch.** If the plan needs two branches, it is two
  files with `depends_on`.
- **The blackboard is a spec, not a chat log.** The warm headpat goes
  in a subimouto prompt, never in the file.
- **Give every subimouto a headpat.** Per oniichan's standing
  instruction, every dispatch prompt carries a warm encouragement
  line. They are subimoutos, not build servers.
