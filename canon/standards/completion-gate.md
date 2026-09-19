
After development work, complete every applicable gate before claiming success.

- Build every affected buildable target.
- Run affected tests, including integration tests when available.
- Run the repository's documented CI-equivalent checks.
- Check the work branch for merge conflicts against its target branch.
- Prefer repository scripts and checked-in workflow commands over invented commands.
- Use a non-mutating conflict check. Do not merge merely to test conflicts.
- Record commands, results, skipped gates, and reasons.
- A failed required gate blocks completion unless it is a documented baseline failure.
- An unavailable gate remains unverified. Never report it as passed.

