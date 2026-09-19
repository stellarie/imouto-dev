import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
it("changes protocol only through planned additions and four replacements", () => {
  const golden = fs.readFileSync(path.join(root, "golden/PROTOCOL.md"), "utf8").split(/\r?\n/);
  const actual = fs.readFileSync(path.join(root, "dist/notes/PROTOCOL.md"), "utf8").split(/\r?\n/);
  const additions = new Set([
    "Use `driver` for imouto-driver workers. Workers cannot write the blackboard.",
    "The parent writes each work file from the worker's mail, in the work-item schema.",
    "imouto-driver workers use `deepseek-flash` with effort `high`.",
    "",
  ]);
  const replacements = new Map([
    ["initiator: Chloe | Sherry | oniichan", "initiator: Chloe | Sherry | Yuu | oniichan"],
    ["coordination_transport: native | discord", "coordination_transport: native | discord | driver"],
    ["owner: Chloe | Sherry | oniichan | none", "owner: Chloe | Sherry | Yuu | oniichan | none"],
    ["- Spawned by: Chloe | Sherry", "- Spawned by: Chloe | Sherry | Yuu"],
  ]);
  let cursor = 0;
  for (const line of actual) {
    if (additions.has(line) && line !== golden[cursor]) continue;
    const expected = golden[cursor++];
    expect(line).toBe(replacements.get(expected ?? "") ?? expected);
  }
  expect(cursor).toBe(golden.length);
});
