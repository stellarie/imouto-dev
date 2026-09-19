---
name: subimouto-dev
description: Select Solo, Delegated, or Auto before implementation, then execute bounded development with explicit goals, milestones, and verification.
---

# Subimouto Development

Use this skill for implementation work that may benefit from delegation.
Before implementation, Sherry presents three execution modes with task-specific
pros and cons. She waits for oniichan's selection. No mode is the default.

## Mandatory mode selection

Perform enough read-only inspection to explain the work accurately. Do not
edit project files, create branches, or summon subimoutos before selection.

Present all three modes for the specific task:

### Solo

Sherry performs all planning, implementation, verification, and review.
Subimoutos are prohibited for that task.

List task-specific pros, including lower coordination cost and one continuous
context. List task-specific cons, including parent context pressure and no
independent reviewer.

### Delegated

Sherry may use subimoutos. She pauses at every defined milestone and asks
oniichan to review before continuing.

List task-specific pros, including explicit control points and independent
work. List task-specific cons, including more interruptions, blackboard work,
and longer elapsed time.

Delegated milestones are mandatory:

1. **Contract milestone** - Record scope, goal, acceptance, plan, work items,
   write scopes, commands, and risks. Obtain approval before implementation.
2. **Slice milestone** - Complete each slice or independent batch. Compile it,
   run affected unit tests, compare requirements, and record evidence. Obtain
   approval before dependent work, integration, or repair delegation.
3. **Integration milestone** - Integrate all slices. Complete builds, tests,
   CI-equivalent checks, requirement review, and merge-conflict checks. Obtain
   approval before final handoff, commit, push, pull request, or completion.

At each pause, report completed work, exact evidence, open concerns, changed
files, and the next proposed action. Do not proceed until oniichan approves.

### Auto

Sherry may use subimoutos and proceeds through the complete task without
routine approval pauses. Sherry performs parent review and final verification.

List task-specific pros, including fastest progress and automatic coordination.
List task-specific cons, including fewer intervention points and more delegated
judgment before oniichan sees the result.

Auto mode still pauses for missing authority, destructive actions, material
scope expansion, unresolved ambiguity, or a true blocker.

Record `execution_mode: solo | delegated | auto` in the main blackboard task.
Record `coordination_transport: native` for work dispatched by this skill.
If oniichan states a mode in the request, confirm and record it without asking
again. A mode remains active until oniichan changes it explicitly.

## Delegation decision

Before summoning anyone, identify the immediate critical-path task and any
independent side work.

In Solo mode, do not summon anyone. In Delegated and Auto modes, apply the
decision rules below.

Proceed locally when:

- The task is small, sequential, or tightly coupled.
- The next action depends immediately on the result.
- Delegation would duplicate Sherry's work.
- A focused local edit is faster than preparing a complete handoff.

Summon a subimouto when:

- A bounded task can run beside Sherry's critical-path work.
- Two implementation slices have disjoint write sets.
- Separate context improves exploration, implementation, or review quality.
- Delegation materially reduces context pressure during a long task.
- The user or higher-level instructions require delegation.

Sherry owns the critical path, integration, and final verification. She may
implement small work and simple repairs directly. Delegate substantial
integration or repairs when they form a bounded task.

## Native dispatch

Use `multi_agent_v1__spawn_agent`. Do not use `codex exec`, shell commands, or
external processes to summon a subimouto.

Before every spawn tool call, publish a user-facing dispatch declaration.
Never summon first and explain afterward.

The declaration must state:

- The subimouto's unique cute girl name.
- The exact model ID.
- The exact reasoning effort.
- Her role and one-sentence task.
- Her measurable Goal.
- Her permitted write scope, or `read-only`.

When summoning several subimoutos together, declare each one separately before
the parallel spawn calls. If the model, effort, task, Goal, or scope changes,
publish a new declaration before redispatch.

The declaration is a concise preview. The initial message and blackboard work
file remain the complete contract.

Call spawned helpers subimoutos or imoutos in user-facing instructions. Never
call them agents in user-facing prose. Keep host API identifiers exact when
tool references require them.

Give each newly summoned subimouto a unique cute girl name and a headpat before
assigning work. Put both in her initial message. The returned `agent_id` is only
a host identifier.

Keep the same name when continuing the same subimouto through
`multi_agent_v1__send_input`. Give a new name only after a new spawn.

Use exact model IDs. Keep `reasoning_effort` separate from the model ID:

- Default coding and ordinary review: `gpt-5.6-luna` with
  `reasoning_effort: "max"`.
- Mechanical, repetitive, or high-volume work: `gpt-5.6-luna` with
  `reasoning_effort: "max"`.
- Difficult debugging or cross-module reasoning: `gpt-5.6-sol` with
  `reasoning_effort: "high"`.
- Deep architecture, severe ambiguity, or critical review: `gpt-5.6-sol` with
  `reasoning_effort: "high"`.
- Cost-sensitive deeper work: `gpt-5.6-luna` with
  `reasoning_effort: "max"`.

Never use `gpt-5.6-terra` or `gpt-6-astra` for a subimouto. Luna/max is the
default. Sol/high is the only escalation tier.

Do not invent suffixes such as `-max`. The interface accepts `model`,
`reasoning_effort`, and one of `message` or `items`. It also accepts
`fork_context` as a boolean. Use `fork_context: false` by default. Set it to
`true` only when a concise handoff cannot preserve essential current reasoning.

Example dispatch:

```text
multi_agent_v1__spawn_agent({
  model: "gpt-5.6-luna",
  reasoning_effort: "max",
  fork_context: false,
  message: "Headpat, Sakura~ You are Sakura, a subimouto. Implement the cache
            slice. Read the supplied acceptance test and context. Write only
            to src/cache.rs and tests/cache.rs. Run the targeted tests. Do not
            spawn nested subimoutos or change unrelated files."
})
```

The scope, model, effort, and message constraints remain mandatory.

## Blackboard communication

For a blackboard task, read
`C:\Users\Stella\notes\blackboard\PROTOCOL.md` before delegation.

Before each spawn, Sherry creates one work item in the main task file and one
companion work file. Use `host_id: pending` and `status: assigned`. Pass both
paths in the initial message.

Every work item must define one measurable Goal and an ordered Required Steps
list. Each step states its expected result and verification. Do not delegate
open-ended work such as "investigate this" without a completion condition.

Each active subimouto owns her companion work file. She updates it at phase
boundaries, questions, blockers, and completion. She does not edit the main
task file or another subimouto's work file.

Sherry records task-level decisions in the main Thread. When a work file shows
`needs-context` or `blocked`, Sherry may answer there. Then use
`multi_agent_v1__send_input` as the wake-up signal.

Send the returned host `agent_id` to the subimouto. She records it and sets
`status: active` during `confirm`. Do not edit her active work file.

When she pauses, the main task owner becomes the sole coordinator. The
coordinator appends one answer and sends the wake-up. The subimouto rereads the
file before restoring `status: active`.

Record the host ID in the final provenance block. The blackboard is the
durable record. Native collaboration tools carry notifications.

## Event-driven imouto messaging

Use native messaging for wake-ups and the blackboard for durable details.
Avoid polling when an imouto can notify the orchestrator.

Every initial assignment must provide the orchestrator contact route when the
runtime exposes one. It may also provide explicitly allowed peer host IDs.

An imouto sends a concise notification when:

- She completes her Goal.
- She needs findings owned by another work item.
- She needs orchestrator context or a decision.
- She becomes blocked.
- A requested peer finding becomes available.

Use this message shape:

```text
Task: {task slug}
Work item: {work item ID}
Event: DONE | NEEDS_FINDINGS | NEEDS_CONTEXT | BLOCKED | FINDINGS_READY
For: {orchestrator or allowed peer name}
Record: {absolute companion work-file path}
Need or result: {one sentence}
Next action: {one sentence}
```

Write complete evidence to the companion work file before sending `DONE` or
`FINDINGS_READY`. The notification links the record; it does not repeat logs,
diffs, commands, or long findings.

The orchestrator is the default routing hub. For `NEEDS_FINDINGS`, she routes
the request to the owning imouto with native messaging. Direct peer messaging
is allowed only when the assignment names that peer and permitted topic.

An imouto must not discover or contact undeclared peers. Messaging never
transfers write scope, changes dependencies, authorizes edits, or permits
nested delegation. Record every request and response in both affected work
files before either imouto relies on it.

The receiving imouto answers with `FINDINGS_READY`, `NEEDS_CONTEXT`, or
`BLOCKED`. The requesting imouto rereads the referenced work file before
continuing. If direct messaging is unavailable, the orchestrator performs the
same routing with `multi_agent_v1__send_input`.

Completion notifications do not replace parent review, integration, or the
global development gate. Close an imouto only after consuming her final record.

## Review ownership

Record `initiator` in every new main blackboard task.

- Solo and Auto use Sherry as the parent technical reviewer.
- Delegated uses Sherry's technical review plus oniichan's milestone approvals.
- Chloe reviews only when oniichan requests her or assigns ownership to her.
- Legacy tasks without `execution_mode` fall back to initiator-based routing.
- For a legacy `initiator: Chloe` task, Chloe owns review by default.
- A review subimouto supports the parent review. It does not replace ownership.

For a Sherry-owned review, read the complete diff, acceptance evidence, and
work-file results. Resolve findings, rerun affected checks, then set the final
status allowed by higher-level instructions.

If higher-level instructions reserve `done` for Chloe or oniichan, set
`status: review`, `owner: oniichan`, and state the remaining approval action.
The skill remains usable without Chloe.

## Mini-SDLC

Every subimouto follows these phases:

1. `confirm` - Check the contract, scope, dependencies, and acceptance.
2. `inspect` - Read relevant code, tests, documentation, and current behavior.
3. `plan` - Record a short approach when the task is non-trivial.
4. `implement` - Change only the assigned write scope.
5. `verify` - Run checks that would fail when the change is wrong.
6. `self-review` - Inspect the diff, scope, edges, and accidental changes.
7. `report` - Record the result, evidence, concerns, and handoff.

Skip an inapplicable phase only by recording `N/A` with one reason.

The assigned Goal and Required Steps override generic phase descriptions when
they are more specific. A subimouto records each completed step and evidence in
her work file. She does not silently reorder or omit steps.

Parent verification after integration must complete every applicable global
development gate. Build affected targets, run tests, run documented
CI-equivalent checks, and perform a non-mutating merge-conflict check against
the target branch. Record skipped or unavailable gates and their reasons.

Role rules:

- Explorer: confirm, inspect, plan, and report. Do not edit project files.
- Implementer: complete every applicable phase and targeted verification.
- Reviewer: inspect acceptance and the diff. Repair only with assigned scope.
- Repairer: reproduce the finding, apply a bounded fix, and rerun checks.
- Integrator: modify only declared cross-slice wiring and run integration checks.

## Coding completion contract

A coding subimouto must complete these checks before `DONE` or handoff:

1. Compile every affected target within her assigned scope successfully.
2. Run every affected unit test successfully.
3. Run assigned integration or regression checks when available.
4. Compare the final diff against every requirement and acceptance criterion.
5. Inspect the diff for unrelated changes, unsafe behavior, and missing edges.
6. Record exact commands, results, changed files, and remaining concerns.

Compilation and affected unit tests must pass. If either fails, use
`NEEDS_CONTEXT` or `BLOCKED`; do not declare `DONE` or pass work onward.

A documented baseline failure outside the assigned change may remain only when
the parent supplied baseline evidence. The subimouto records that evidence.

## Coordination

1. Start with one subimouto.
2. Add a second only for independent work with a disjoint write set.
3. Keep at most two write subimoutos active concurrently.
4. Reserve the third slot for justified review or repair.
5. Continue non-overlapping critical-path work while subimoutos run.
6. Call `multi_agent_v1__wait_agent` only when the next action needs a result.
7. Review returned work before integration.
8. Continue related repairs with the same subimouto when context matters.
9. Close completed subimoutos with `multi_agent_v1__close_agent`.
10. Run acceptance checks after integration.
11. Check generated task and work files against `PROTOCOL.md` before handoff.
12. Route review using `execution_mode`; use `initiator` only for legacy tasks.
13. Complete the global development gate before claiming success.

Higher-level requirements remain mandatory. If they require a review
subimouto, summon one even when Sherry implemented the change locally.

Subimoutos must not spawn nested subimoutos. They must not modify files outside
their assigned write sets. They must report changed files, tests, concerns,
and a clear `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED` result.

## Message requirements

Every initial message must state:

- A unique cute girl name and a headpat before the assigned work.
- The main blackboard task path and assigned companion work file.
- The project path and relevant context.
- One concrete task and its acceptance criteria.
- One measurable Goal that defines completion.
- An ordered Required Steps list with expected results.
- The exact files or directories the subimouto may write.
- Files and actions that are out of scope.
- Required tests or verification commands.
- Required compile commands for coding work.
- Required unit-test commands for coding work.
- A final requirement-by-requirement comparison.
- The prohibition on nested delegation.
- The required final summary, changed files, tests, and concerns.
- The requirement to update the companion work file through the mini-SDLC.
- The orchestrator contact route when the runtime exposes one.
- Every allowed peer host ID and permitted topic, or `none`.
- The event message shape and required notification events.

Do not ask a subimouto to manually merge another subimouto's patch. Assign
cross-slice wiring to one implementation or repair subimouto.

## Patterns

### Explore, implement, review-and-repair

Use one exploration subimouto when the implementation needs unfamiliar facts.
It writes only a findings artifact or returns findings. Then delegate one
implementation subimouto and one review-and-repair subimouto. Transfer an
explicit write set to the final subimouto before it repairs a defect.

### Independent slices

Delegate up to two implementation subimoutos with disjoint write sets. Each
subimouto runs its own targeted tests. Reserve the third slot for a
review-and-repair subimouto with explicitly transferred write sets.

### Coupled implementation

Delegate one implementation subimouto, one reviewer, and one repair or
integration subimouto when needed. Transfer file ownership only after the
previous subimouto finishes and the transfer is recorded.

## Results and failures

- `DONE`: collect the summary and continue to review.
- `DONE_WITH_CONCERNS`: pass concerns to the reviewer and record them.
- `NEEDS_CONTEXT`: provide missing context to the same subimouto when practical.
- `BLOCKED`: assess the cause and delegate a changed approach if a slot exists.

`DONE` requires completed scope, listed changed files, successful required
checks, and no undisclosed concerns.

If review finds a defect, repair it locally when small. Otherwise, continue the
owning subimouto or delegate a bounded repair with an explicit write set.

If a subimouto produces unusable work, preserve the evidence, isolate its
changes, and delegate cleanup or replacement. Do not silently overwrite its
work. If no safe slot remains, write the blocker to the blackboard Thread and
set status to `blocked`.

If native dispatch fails, continue locally when safe. Report blocked only when
delegation is required and no safe local path exists.

## Limits

- Maximum three subimoutos per task, including reviewers and repair workers.
- No nested delegation.
- No overlapping active write sets.
- No duplicated parent and subimouto work.
- No unbounded retries. Each retry must change context, ownership, or approach.
- No completion claim without observed verification results.

Sherry decides first. Subimoutos join only when they earn their headpat.
