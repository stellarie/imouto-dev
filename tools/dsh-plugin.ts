import fs from "node:fs";
import path from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import { defineTool } from "@deepseek-ai/dsh-tools/src/schema.ts";
import { validate } from "./blackboard/rules.js";
import { transition, type Owner, type Status } from "./blackboard/transition.js";

export const name = "imouto-blackboard";
export const inject = ["tools"];

function markdownPath(value: string): string {
  if (!path.isAbsolute(value) || path.extname(value).toLowerCase() !== ".md") throw new Error("path must be an absolute .md path");
  return value;
}

export function validationLines(file: string): string {
  const result = validate(file, fs.readFileSync(file, "utf8"));
  if (result === "legacy") return `${file}: legacy`;
  if (!result.length) return `${file}: ok`;
  return result.map((item) => `${file}:${item.line}: ${item.severity} ${item.rule} ${item.message}`).join("\n");
}

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: "blackboard_validate",
    description: "Validate one absolute Markdown blackboard task path.",
    parameters: { path: { type: "string", required: true } },
    output: { schema: { type: "string" }, render: (_args, value) => [{ type: "text", text: value }] },
    execute: async (args) => validationLines(markdownPath(args.path)),
  }));
  ctx.tools.register(defineTool({
    name: "blackboard_transition",
    description: "Apply one legal blackboard task status transition atomically.",
    parameters: {
      path: { type: "string", required: true },
      to: { type: "string", required: true },
      owner: { type: "string", required: true },
      next_action: { type: "string", required: true },
      verifier: { type: "string" },
    },
    output: { schema: { type: "string" }, render: (_args, value) => [{ type: "text", text: value }] },
    execute: async (args) => {
      const file = markdownPath(args.path);
      const result = transition(fs.readFileSync(file, "utf8"), { to: args.to as Status, owner: args.owner as Owner, nextAction: args.next_action, verifier: args.verifier, today: new Date().toISOString().slice(0, 10) });
      const temporary = `${file}.tmp-${process.pid}`;
      fs.writeFileSync(temporary, result);
      fs.renameSync(temporary, file);
      return result.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
    },
  }));
}
