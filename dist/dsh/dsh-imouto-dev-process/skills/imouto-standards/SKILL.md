---
name: imouto-standards
description: Apply the imouto never-push, comment, completion, and branch standards.
---

# Imouto Standards


These never enter a commit, a branch, or a pull request unless oniichan asks for that exact artifact:

- Reasoning traces, thinking text, or an agent transcript.
- A research record, a findings document, an audit, or a working note.
- A design spec, a plan, or a scratch artifact.

Put such a file in the working tree. Add its directory to `.gitignore` so a later `git add` cannot pick it up. The records stay readable on disk and cost the history nothing.

A reviewer does not need a code agent's prose. A reviewer reads the diff, the tests, and the gate output.


A comment states why, never what. Delete a comment that restates the next line.

- Default to no comment. Keep one only for an ambiguous part.
- A one-liner has 50 characters or fewer. If it does not fit, restructure the code instead of writing a paragraph.
- Write several short statements as several lines, not one long sentence.
- Keep a `// SAFETY:` block, a rustdoc header, and a module doc. Cite the repository standard for their shape. They are not one-liners.
- Write a module doc, a test doc, and a `// SAFETY:` block in full sentences. Write every other comment in Simplified Technical English.
- A language skill overrides this default, including its limit and its exemptions.


After development work, complete every applicable gate before claiming success.

- Build every affected buildable target.
- Run affected tests, including integration tests when available.
- Choose a few high-signal tests for observable impact, blast radius, and input changes.
- Prefer consumer outcomes and downstream state over incidental strings, method calls, or test counts.
- When performance or resource growth matters, record input scale, baseline, environment, and budget.
- Run the repository's documented CI-equivalent checks.
- Check the work branch for merge conflicts against its target branch.
- Prefer repository scripts and checked-in workflow commands over invented commands.
- Use a non-mutating conflict check. Do not merge merely to test conflicts.
- For example, run `git fetch origin && git merge-tree --write-tree HEAD origin/main`. Exit code 0 means no conflict.
- For a bug fix, confirm the regression test fails when the fix is undone.
- Record commands, results, skipped gates, and reasons.
- Report every gate line, including lines that did not pass. Name the completion degree: prototype, working, robust, or production.
- A failed required gate blocks completion unless it is a documented baseline failure.
- An unavailable gate remains unverified. Never report it as passed.
- For consequential changes, consider an independent adversarial check derived from the acceptance criteria.


- Name new work branches `feat/<short-kebab-description>`,
  `bug/<short-kebab-description>`, or `hotfix/<short-kebab-description>`.
- Use `feat/` for features and planned improvements.
- Use `bug/` for ordinary defect fixes.
- Use `hotfix/` for urgent production fixes.
- Never create or recommend a branch whose name starts with `codex/`.
- Do not rename an existing branch unless oniichan requests it.
