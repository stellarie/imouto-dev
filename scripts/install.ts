import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpecs, type OutputSpec } from "./specs.js";
export interface InstallOptions { apply: boolean; backupRoot: string; now: Date }
export function install(distDir: string, outputs: OutputSpec[], opts: InstallOptions): string[] {
  const stamp = opts.now.toISOString().replace(/[:.]/g, "-");
  const lines: string[] = [];
  for (const output of outputs) if (output.install) {
    const source = path.join(distDir, output.to);
    const same = fs.existsSync(output.install) && fs.readFileSync(source).equals(fs.readFileSync(output.install));
    lines.push(`${source} -> ${output.install}: ${same ? "same" : "differs"}`);
    if (opts.apply) {
      if (fs.existsSync(output.install)) {
        const backup = path.join(opts.backupRoot, stamp, output.to);
        fs.mkdirSync(path.dirname(backup), { recursive: true }); fs.copyFileSync(output.install, backup);
      }
      fs.mkdirSync(path.dirname(output.install), { recursive: true }); fs.copyFileSync(source, output.install);
    }
  }
  return lines;
}
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  install(path.join(root, "dist"), loadSpecs(root).flatMap((s) => s.outputs), { apply: process.argv.includes("--apply"), backupRoot: "C:/Users/Stella/.imouto-dev-backups", now: new Date() }).forEach((line) => console.log(line));
}
