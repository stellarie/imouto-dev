import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpecs, type OutputSpec } from "./specs.js";

export interface LivePaths { repoRoot: string; claude: string; agents: string; cache?: string }
function body(text: string, heading: string): string | undefined {
  const normalized = text.replaceAll("\r", "");
  const match = new RegExp(`^## ${heading}\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m").exec(normalized);
  return match?.[1];
}
export function compareLive(paths: LivePaths, outputs: OutputSpec[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const output of outputs) if (output.install) {
    const dist = path.join(paths.repoRoot, "dist", output.to);
    if (!fs.existsSync(output.install) || !fs.readFileSync(dist).equals(fs.readFileSync(output.install))) errors.push(`diff ${output.install}`);
  }
  for (const [heading, file] of [["DEVELOPMENT COMPLETION GATE", "completion-gate.md"], ["GIT BRANCH NAMES", "branch-names.md"]] as const) {
    const expected = fs.readFileSync(path.join(paths.repoRoot, "canon", "standards", file), "utf8");
    for (const live of [paths.claude, paths.agents]) if (body(fs.readFileSync(live, "utf8"), heading) !== expected) errors.push(`diff ${live} section ${heading}`);
  }
  if (paths.cache) {
    const dist = path.join(paths.repoRoot, "dist/codex/imouto-dev/skills/subimouto-dev/SKILL.md");
    if (!fs.existsSync(paths.cache) || !fs.readFileSync(dist).equals(fs.readFileSync(paths.cache))) warnings.push(`warn ${paths.cache}`);
  }
  return { errors, warnings };
}
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const outputs = loadSpecs(repoRoot).flatMap((spec) => spec.outputs);
  const result = compareLive({ repoRoot, claude: "C:/Users/Stella/CLAUDE.md", agents: "C:/Users/Stella/.codex/AGENTS.md", cache: "C:/Users/Stella/.codex/plugins/cache/imouto-local/imouto-dev/1.0.0/skills/subimouto-dev/SKILL.md" }, outputs);
  [...result.errors, ...result.warnings].forEach((line) => console.log(line));
  process.exitCode = result.errors.length ? 1 : 0;
}
