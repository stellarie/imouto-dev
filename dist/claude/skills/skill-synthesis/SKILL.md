---
name: skill-synthesis
description: Audit the skill catalog for overlap and merge skills that claim one trigger into fewer, stronger skills. Use when the catalog grows, when two skills load for the same request, or when oniichan asks for a catalog audit.
---

# Skill Synthesis

Harvesting grows the catalog from a repeated procedure. Synthesis shrinks it. It merges skills that claim one trigger.

The catalog is a menu that every request pays for. Run this skill when the catalog grows, when two skills overlap, or when oniichan asks for an audit.

## Measure the roots

Do not assume where a skill loads from. Measure it.

- List each root: `~/.claude/skills`, the project `.claude/skills`, and the plugin caches.
- Read the skill list that the session provides. It shows what the model can load.
- Reconcile the two lists. If a skill appears in only one, find the root you did not scan before you propose a merge.

Plugin skills carry a namespace: `plugin:skill`. A plugin skill and a personal skill with the same short name are two different skills.

State no precedence rule that you did not observe. If two roots hold one name, load the skill and compare the returned body with each file.

## Stage 0 - Inventory

Record the name, root, size, and description of every skill. Use the reconciled list.

## Stage 1 - Route map

Build a trigger overlap matrix. Two skills overlap when their descriptions claim the same situation. Record the phrases that load each skill.

Similar topics are not one trigger. Two skills about one language differ when one covers formatting and the other covers safety.

## Stage 2 - Verdicts

Assign one verdict to each cluster.

- KEEP: the skill earns its line.
- MERGE into `{target}`: one trigger, one skill. Name the target.
- SPLIT: one skill carries two triggers.
- RETIRE: another skill replaces it, nobody uses it, or its rule has a stricter home.

## Stage 3 - Independent audit

Use read-only subagents on disjoint slices of the inventory. Give each one the slice, the cluster, and the evidence rule.

Add one adversarial pass that argues against each merge. A merge survives when the argument fails.

The author of a skill is the worst judge of its redundancy. Use a reviewer that did not write it.

## Safety gate

Before you retire or merge a skill, check all of these.

1. Archive the old body outside every scanned root, or under a name the loader skips. Never leave a live duplicate.
2. Every normative sentence of a retired skill appears in the merged body, or in a written record with a reason.
3. Grep every skill body, `CLAUDE.md`, `AGENTS.md`, and the blackboard for the retired name.
4. Confirm the merged skill loads with its exact `name` value. Compare the returned body with the file.
5. Oniichan approves every retirement.

A lost trigger fails silently. Archive first.

## Report

Give oniichan:

- the catalog before and after
- every trigger that moved
- every trigger that lost an entry point
- the retired list and the rollback path
- the audit and adversarial results

## Do not

- Do not add new doctrine. Synthesis recombines rules that already exist.
- Do not merge across concern levels. A process skill never absorbs a domain standard.
- Do not retire a skill without approval and an archive.
- Do not promote more than one new skill from one session's evidence. Two is a coincidence. Three is a pattern.
- Do not edit a plugin cache. It is a package change, not a catalog change.

## Provenance

Adapted on 2026-09-29 from the dsh-vn skill `skill-synthesis`, at commit 0b409a9336, path `packages/experimental/imouto-dev-process/skills`. Rewritten for the Claude Code host.
