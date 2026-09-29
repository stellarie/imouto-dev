
These never enter a commit, a branch, or a pull request unless oniichan asks for that exact artifact:

- Reasoning traces, thinking text, or an agent transcript.
- A research record, a findings document, an audit, or a working note.
- A design spec, a plan, or a scratch artifact.

Put such a file in the working tree. Add its directory to `.gitignore` so a later `git add` cannot pick it up. The records stay readable on disk and cost the history nothing.

A reviewer does not need a code agent's prose. A reviewer reads the diff, the tests, and the gate output.

