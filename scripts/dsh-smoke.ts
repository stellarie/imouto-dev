import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repo = path.resolve(import.meta.dirname, "..");
const harness = "C:/Users/Stella/deepseek-harness";
const driver = "C:/Users/Stella/imouto-driver";
const mode = process.argv[2];
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "imouto-dsh-smoke-"));
const home = path.join(temporary, "dsh-home");
const state = path.join(temporary, "state");
const staged = path.join(temporary, "bundles");
const pinnedHarnessRevision = "ddefc45fbc7f8e46dd73185e68295696d1297887";
fs.cpSync(path.join(repo, "dist/dsh"), staged, { recursive: true });

function run(args: string[], env: NodeJS.ProcessEnv = process.env) {
  return spawnSync("C:/Users/Stella/AppData/Local/mise/installs/node/24.18.0/node_modules/pnpm/pnpm.exe", ["--pm-on-fail=ignore", "dsh", ...args], { cwd: harness, env: { ...env, DSH_HOME: home }, encoding: "utf8", timeout: 120_000 });
}
function assert(label: string, condition: boolean, detail = "") {
  console.log(`${condition ? "ok" : "fail"}: ${label}`);
  if (!condition) { if (detail) console.error(detail); process.exitCode = 1; throw new Error(label); }
}

function staticSmoke() {
  const revision = spawnSync("git", ["rev-parse", "HEAD"], { cwd: harness, encoding: "utf8" });
  const runtimeDiff = spawnSync("git", ["diff", "--quiet", `${pinnedHarnessRevision}..HEAD`, "--", ".", ":(exclude)AGENTS.md"], { cwd: harness });
  assert("harness runtime revision", revision.stdout.trim() === pinnedHarnessRevision || runtimeDiff.status === 0);
  let result = run(["--profile", "imouto-smoke", "--from-default-profile", "web", "--dump-config"]);
  assert("scratch web profile", result.status === 0, result.error?.message ?? result.stderr);
  const bundles = [
    path.join(staged, "dsh-imouto-dev-process"),
    path.join(staged, "dsh-imouto-dev"),
    path.join(repo, "packages/dsh-imouto-codex"),
  ];
  for (const bundle of bundles) {
    result = run(["plugin", "--profile", "imouto-smoke", "add", bundle]);
    assert(`install ${path.basename(bundle)}`, result.status === 0, result.stderr);
  }
  result = run(["--profile", "imouto-smoke", "--dump-config"]);
  assert("dump config", result.status === 0, result.stderr);
  assert("no unmatched patch target", !/unmatched patch target/i.test(result.stderr), result.stderr);
  assert("blackboard plugin row", result.stdout.includes("id: imouto-blackboard"));
  assert("imouto skill row", result.stdout.includes("id: imouto-skill-filesystem"));
  assert("agent preset row", result.stdout.includes("id: agent-presets") && result.stdout.includes("dsh-imouto-dev/package.json"));
  assert("Codex provider row", result.stdout.includes("id: llm-openai-codex") && result.stdout.includes("dsh-imouto-codex"));
  assert("Yuu Codex model", result.stdout.includes("provider: openai-codex") && result.stdout.includes("model: gpt-5.6-sol"));
}

function liveSmoke() {
  const envFile = path.join(driver, ".env");
  const match = fs.existsSync(envFile) ? /^DEEPSEEK_API_KEY=(.+)$/m.exec(fs.readFileSync(envFile, "utf8")) : undefined;
  if (!match?.[1]?.trim()) { console.log("skipped: no key"); process.exitCode = 2; return; }
  const overlay = path.join(temporary, "live.patch.yml");
  const node = "C:/Users/Stella/AppData/Local/mise/installs/node/24.18.0/node.exe";
  const tsx = path.join(driver, "node_modules/tsx/dist/cli.mjs").replaceAll("\\", "/");
  const entry = path.join(driver, "src/mcp.ts").replaceAll("\\", "/");
  const blackboard = path.join(staged, "dsh-imouto-dev-process/lib/index.js").replaceAll("\\", "/");
  fs.writeFileSync(overlay, `- insert:\n    - id: imouto-blackboard\n      name: ${JSON.stringify(blackboard)}\n    - id: imouto-mcp\n      name: '@deepseek-ai/dsh-mcp-client'\n      config:\n        serverName: imouto\n        transport: stdio\n        toolCallTimeoutMs: 180000\n        command: ${JSON.stringify(node)}\n        args: [${JSON.stringify(tsx)}, ${JSON.stringify(entry)}]\n        env:\n          IMOUTO_STATE_HOME: ${JSON.stringify(state.replaceAll("\\", "/"))}\n`);
  const env = { ...process.env, DEEPSEEK_API_KEY: match[1].trim() };
  let result = run(["--profile", "imouto-live", "--from-default-profile", "headless", "--dump-config"], env);
  assert("scratch headless profile", result.status === 0, result.stderr);
  result = run(["plugin", "--profile", "imouto-live", "add", path.join(harness, "packages/core/tools"), path.join(harness, "vendor/cordis")], env);
  assert("link live peer packages", result.status === 0, result.stderr);
  result = run(["--profile", "imouto-live", "--patch", overlay, "Call the tool mcp__imouto__health. Print its stateDir value only."], env);
  assert("imouto health task", result.status === 0, result.stderr);
  assert("health plugin imports", !/failed to import/i.test(result.stderr), result.stderr);
  assert("health uses temporary state", result.stdout.toLowerCase().includes(state.toLowerCase()), result.stdout);
  const fixture = path.join(repo, "tools/blackboard/fixtures/valid.md");
  result = run(["--profile", "imouto-live", "--patch", overlay, `Call the tool blackboard_validate on ${fixture}. Print the result only.`], env);
  assert("blackboard validation task", result.status === 0, result.stderr);
  assert("blackboard plugin imports", !/failed to import/i.test(result.stderr), result.stderr);
  const output = result.stdout.trim();
  const reported = output.startsWith("`") && output.endsWith("`") ? output.slice(1, -1) : output;
  assert("validator reports exact result", reported === `${fixture}: ok`, result.stdout);
}

try {
  if (mode === "--static") staticSmoke();
  else if (mode === "--live") liveSmoke();
  else throw new Error("usage: dsh-smoke.ts --static|--live");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
