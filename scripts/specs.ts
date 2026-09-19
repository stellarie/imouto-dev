import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export interface OutputSpec { from: string; to: string; install: string }
export interface HostSpec { host: string; vars: Record<string, string>; outputs: OutputSpec[] }

export function loadSpecs(repoRoot: string): HostSpec[] {
  const root = path.join(repoRoot, "hosts");
  return fs.readdirSync(root).sort().map((name) =>
    YAML.parse(fs.readFileSync(path.join(root, name, "host.yaml"), "utf8")) as HostSpec);
}
