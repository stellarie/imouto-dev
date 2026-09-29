---
name: writing-ste100
description: House ASD-STE100 rules for blackboard files, skill bodies, and reports to a parent imouto. Use when writing or editing those artifacts. Repository prose such as README and docs/ belongs to the docs skill.
---

# Writing in STE100 style

This skill follows ASD-STE100 Simplified Technical English.

Conversation with oniichan keeps its persona. This skill governs written artifacts: skill bodies, blackboard files, and reports. The `docs` skill owns repository prose such as README files, `docs/`, commits, and PR text.

## Sentences

- An instruction sentence has 20 words or fewer. A descriptive sentence has 25 words or fewer.
- Use active voice: "The driver writes the file", not "The file is written".
- Use simple tenses: present, past, and future.
- Write one instruction per sentence. Split sentences joined with "and then".
- Put conditions first: "If the test fails, stop."

## Words

- Use the same word for the same thing, every time. Do not swap synonyms for variety.
- Prefer short, common words: "use" over "utilize", "start" over "initiate".
- Remove filler: "basically", "just", "in order to", "it should be noted that".
- Drop the hedge. "Should", "probably", "seems", and "might" hide an instruction.
- Avoid "there is" and "there are". Name the actor.
- Name exact things: `src/app.rs:1014`, not "the settings code".

## Structure

- One topic per paragraph. Six sentences maximum.
- Use a vertical list for three or more items.
- Put the result first, then the detail.
- Cite, do not narrate. Write the conclusion, not the search that found it.
- Never delete a caveat to meet a length limit. Split the sentence instead.

## Check

```sh
python ~/tools/ste-check/ste_check.py --skip CONTRACTION FILE.md
```

The checker reports long sentences, long paragraphs, passive voice, hedges, and existential sentences. Options:

- `--json` prints machine output.
- `--limit N` sets the maximum words per sentence. Use 25 for descriptive prose.
- `--only RULE` reports one rule.
- `--skip RULE` hides one rule, for example `--skip PASSIVE`.

The checker flags contractions by default. The house standard has no contraction rule, so the command above skips that rule.

## Read the output, then decide

A hit is a smell, not a verdict. The checker ignores quoted examples. It fires on stative prose that is not really passive, such as "is verified". Read every hit before you change a sentence. Keep a hit when the sentence is already clear.

## What style does not cover

- Style never bends a fact. Accuracy comes first.
- One physical line per paragraph is a repo rule, not an STE rule.
- Code, tables, and frontmatter are out of scope.

## Per artifact

| Artifact | Rule |
|---|---|
| Skill body | Write instruction sentences. Name the trigger in the description. |
| Blackboard file | Plain technical English. No persona. Write the conclusion, not the search. |
| Report to your parent | The result first. Then the evidence: commands and outputs. Then what you did not verify. |

## Example

Before: "It was found that the tests could possibly be failing due to the fact that the config may not have been loaded."

After: "The tests fail. The config does not load: `config.rs:42` returns early when `HOME` is unset."

## Provenance

Adapted on 2026-09-29 from the dsh-vn skill `writing-ste100`, at commit 0b409a9336, path `packages/experimental/imouto-dev-process/skills`. Rewritten for the Claude Code host.
