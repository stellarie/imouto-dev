import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@deepseek-ai/dsh-llm": path.resolve(import.meta.dirname, "../deepseek-harness/packages/llm/llm/src/error.ts"),
      "@deepseek-ai/dsh-util-values": path.resolve(import.meta.dirname, "../deepseek-harness/packages/util/values/src/index.ts"),
    },
  },
  test: { testTimeout: 15_000 },
});
