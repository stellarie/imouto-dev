import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { validationLines } from "./dsh-plugin.js";

const fixtures = path.resolve(import.meta.dirname, "blackboard/fixtures");
describe("dsh validator", () => {
  for (const name of fs.readdirSync(fixtures).filter((file) => file.endsWith(".md"))) {
    it(`matches CLI format for ${name}`, () => {
      const file = path.join(fixtures, name);
      const lines = validationLines(file);
      const cli = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "tools/blackboard/cli.ts", "validate", file], { cwd: path.resolve(import.meta.dirname, ".."), encoding: "utf8" });
      expect(cli.error).toBeUndefined();
      expect(lines).toBe(cli.stdout.trim());
    });
  }
});
