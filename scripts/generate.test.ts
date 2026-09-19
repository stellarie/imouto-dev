import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkGenerated, generateAll, render } from "./generate.js";

const root = path.resolve(import.meta.dirname, "..");
describe("render", () => {
  it("preserves plain files", () => expect(render("plain\n", "x", {}, "f")).toBe("plain\n"));
  it("renders variables and host blocks", () => expect(render("{{imouto:name}} {{model}}\n<!-- host:x -->\nyes\n<!-- /host -->\n<!-- host:y -->\nno\n<!-- /host -->\n", "x", { name: "Riko" }, "f")).toBe("Riko {{model}}\nyes\n"));
  it("rejects malformed input", () => {
    expect(() => render("{{imouto:no}}", "x", {}, "f")).toThrow(/no/);
    expect(() => render("<!-- host:x -->\n<!-- host:y -->\n", "x", {}, "f")).toThrow(/2/);
    expect(() => render("<!-- host:x -->\n", "x", {}, "f")).toThrow(/1/);
  });
});
it("composes sources, strips frontmatter, prepends, and indents file variables", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "compose-test-"));
  try {
    fs.mkdirSync(path.join(temp, "hosts/x"), { recursive: true });
    fs.mkdirSync(path.join(temp, "canon"));
    fs.mkdirSync(path.join(temp, "tools"));
    fs.writeFileSync(path.join(temp, "canon/a.md"), "---\na: b\n---\nA\n");
    fs.writeFileSync(path.join(temp, "canon/b.md"), "B\n");
    fs.writeFileSync(path.join(temp, "canon/persona.md"), "one\ntwo\n");
    fs.writeFileSync(path.join(temp, "tools/dsh-plugin.ts"), "export const x=1\n");
    fs.writeFileSync(path.join(temp, "hosts/x/host.yaml"), `host: x
vars:
  persona: { file: canon/persona.md, indent: 4 }
outputs:
  - from: [canon/a.md, canon/b.md]
    to: composed.md
    install: ''
    prepend: "P {{imouto:persona}}\\n"
    stripFrontmatter: true
`);
    const out = path.join(temp, "out");
    generateAll(temp, out);
    expect(fs.readFileSync(path.join(out, "composed.md"), "utf8")).toBe("P one\n    two\nA\n\nB\n");
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
it("check detects a one-byte canon edit", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "canon-test-"));
  try {
    fs.cpSync(root, temp, { recursive: true, filter: (source) => !source.includes(`${path.sep}node_modules${path.sep}`) && !source.includes(`${path.sep}.git${path.sep}`) });
    expect(checkGenerated(temp).filter((name) => name !== "dsh/dsh-imouto-dev-process/lib/index.js")).toEqual([]);
    fs.appendFileSync(path.join(temp, "canon/protocol.md"), "x");
    expect(checkGenerated(temp)).toContain("notes/PROTOCOL.md");
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
