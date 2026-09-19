import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

export function buildDsh(repoRoot: string, outfile: string): void {
  buildSync({
    entryPoints: [path.join(repoRoot, "tools/dsh-plugin.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "bundle",
    external: ["@deepseek-ai/cordis"],
    alias: { "@deepseek-ai/dsh-llm": path.resolve(import.meta.dirname, "../../deepseek-harness/packages/llm/llm/src/error.ts") },
    banner: { js: "import { createRequire as __imoutoCreateRequire } from 'node:module'; const require = __imoutoCreateRequire(import.meta.url);" },
    nodePaths: [path.join(repoRoot, "node_modules"), path.resolve(import.meta.dirname, "../node_modules")],
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  buildDsh(repoRoot, path.join(repoRoot, "dist/dsh/dsh-imouto-dev-process/lib/index.js"));
}
