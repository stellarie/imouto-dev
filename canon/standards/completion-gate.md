
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

