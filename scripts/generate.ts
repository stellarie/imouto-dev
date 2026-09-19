import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpecs } from "./specs.js";
import type { VariableSpec } from "./specs.js";
import { buildDsh } from "./build-dsh.js";

export interface OutputSpec { from: string | string[]; to: string; install: string; prepend?: string; stripFrontmatter?: boolean }
export interface HostSpec { host: string; vars: Record<string, VariableSpec>; outputs: OutputSpec[] }

export function render(source: string, host: string, vars: Record<string, string>, file = "source"): string {
  const lines = source.split(/(?<=\n)/);
  let active: string | undefined;
  let output = "";
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const plain = line.replace(/\r?\n$/, "");
    const open = /^<!-- host:([^ ]+) -->$/.exec(plain);
    if (open) {
      if (active) throw new Error(`${file}:${index + 1}: nested host block`);
      active = open[1];
      continue;
    }
    if (plain === "<!-- /host -->") {
      if (!active) throw new Error(`${file}:${index + 1}: closing unopened host block`);
      active = undefined;
      continue;
    }
    if (!active || active === host) output += line;
  }
  if (active) throw new Error(`${file}:${lines.length}: unclosed host block`);
  return output.replace(/\{\{imouto:([^}]+)}}/g, (_all, name: string) => {
    const value = vars[name];
    if (value === undefined) throw new Error(`${file}: unknown variable ${name}`);
    return value;
  });
}

export function generateAll(repoRoot: string, outDir: string): Map<string, string> {
  const generated = new Map<string, string>();
  for (const spec of loadSpecs(repoRoot)) {
    const vars = Object.fromEntries(Object.entries(spec.vars).map(([name, value]) => {
      if (typeof value === "string") return [name, value];
      const source = fs.readFileSync(path.join(repoRoot, value.file), "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "");
      const indent = " ".repeat(value.indent);
      return [name, source.split("\n").map((line, index) => index === 0 || !line ? line : `${indent}${line}`).join("\n")];
    }));
    for (const output of spec.outputs) {
      const sources = (Array.isArray(output.from) ? output.from : [output.from]).map((name) => {
        let source = fs.readFileSync(path.join(repoRoot, name), "utf8");
        if (output.stripFrontmatter) source = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
        return render(source, spec.host, vars, name).replace(/\s+$/, "");
      });
      const prefix = output.prepend ? render(output.prepend, spec.host, vars, `${output.to}:prepend`) : "";
      const text = `${prefix}${sources.join("\n\n")}\n`;
      const target = path.join(outDir, output.to);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, text);
      generated.set(output.to.replaceAll("\\", "/"), text);
    }
  }
  const pluginTarget = path.join(outDir, "dsh/dsh-imouto-dev-process/lib/index.js");
  fs.mkdirSync(path.dirname(pluginTarget), { recursive: true });
  buildDsh(repoRoot, pluginTarget);
  generated.set("dsh/dsh-imouto-dev-process/lib/index.js", fs.readFileSync(pluginTarget, "utf8"));
  return generated;
}

function filesUnder(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
}

export function checkGenerated(repoRoot: string): string[] {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "imouto-dev-check-"));
  try {
    const generated = generateAll(repoRoot, temporary);
    const names = new Set([...generated.keys(), ...filesUnder(path.join(repoRoot, "dist"))]);
    return [...names].sort().filter((name) => {
      const expected = path.join(temporary, name);
      const actual = path.join(repoRoot, "dist", name);
      return !fs.existsSync(expected) || !fs.existsSync(actual) || !fs.readFileSync(expected).equals(fs.readFileSync(actual));
    });
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  if (process.argv.includes("--check")) {
    const differences = checkGenerated(repoRoot);
    differences.forEach((name) => console.error(`diff ${name}`));
    process.exitCode = differences.length ? 1 : 0;
  } else generateAll(repoRoot, path.join(repoRoot, "dist"));
}
