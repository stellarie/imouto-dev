import fs from "node:fs"; import path from "node:path"; import { validate } from "./rules.js"; import { transition, type Owner, type Status } from "./transition.js";
function arg(name:string): string|undefined { const i=process.argv.indexOf(name); return i<0?undefined:process.argv[i+1]; }
if (process.argv[2] === "validate") {
  const inputs=process.argv.slice(3); const files=inputs.flatMap((p)=>fs.statSync(p).isDirectory()?fs.readdirSync(p).filter((n)=>n.endsWith(".md")&&n!=="PROTOCOL.md").map((n)=>path.join(p,n)):[p]); let failed=false;
  for(const file of files.sort()){const result=validate(file,fs.readFileSync(file,"utf8"));if(result==="legacy")console.log(`${file}: legacy`);else if(!result.length)console.log(`${file}: ok`);else for(const f of result){console.log(`${file}:${f.line}: ${f.severity} ${f.rule} ${f.message}`);if(f.severity==="error")failed=true;}} process.exitCode=failed?1:0;
} else if(process.argv[2] === "transition") {
  const file=process.argv[3]; if(!file) throw new Error("file required"); const text=fs.readFileSync(file,"utf8"); const result=transition(text,{to:arg("--to") as Status,owner:arg("--owner") as Owner,nextAction:arg("--next")??"",verifier:arg("--verifier"),today:new Date().toISOString().slice(0,10)}); const tmp=`${file}.tmp-${process.pid}`;fs.writeFileSync(tmp,result);fs.renameSync(tmp,file);
} else throw new Error("usage: bb validate|transition");
