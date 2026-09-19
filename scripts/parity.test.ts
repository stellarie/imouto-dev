import fs from "node:fs";import path from "node:path";import crypto from "node:crypto";import { expect,it } from "vitest";
const root=path.resolve(import.meta.dirname,".."); const entries=[
["codex/imouto-dev/.codex-plugin/plugin.json","plugin.json","3da70ffb00e25da0b31b76555dfafda342730359f867a66b78962390ebc04712"],
["codex/imouto-dev/skills/subimouto-dev/SKILL.md","subimouto-dev.md","4048384bd8f4a740472f49975f14c841f16a0bced3fb2f3ee84a455e583db57c"],
["claude/skills/imouto-plan/SKILL.md","imouto-plan.md","dfb13d2b0d9dff2478e35e94a2c67976e279a812d05502971863c9a5bb1f806b"],
["claude/skills/imouto-dispatch/SKILL.md","imouto-dispatch.md","b02c6b7a31fa37346d35951b2fdab47f15efeac245cd3caafecf91334d62b471"],
["notes/PROTOCOL.md","protocol.md","7506e5bc9c52cc79f039162eae53e3d0a24eb7647863289571f7ae1c15c2e712"]] as const;
it("matches all golden hashes",()=>{for(const [dist,golden,hash] of entries){for(const file of [path.join(root,"dist",dist),path.join(root,"golden",golden)])expect(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")).toBe(hash);expect(fs.readFileSync(path.join(root,"dist",dist))).toEqual(fs.readFileSync(path.join(root,"golden",golden)));}});
