declare module "@deepseek-ai/cordis" {
  export interface Context {
    tools: { register(definition: unknown): () => void };
  }
}

declare module "@deepseek-ai/dsh-tools/src/schema.ts" {
  export function defineTool(options: unknown): unknown;
}
