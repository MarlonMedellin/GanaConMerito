import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function check() {
  const sprintLog = await readFile("/opt/gcm/app/docs/02-delivery/sprint-log.md", "utf8");
  const status = await readFile("/opt/gcm/app/docs/project/status.md", "utf8");

  try {
    assert.match(sprintLog, /Sprint cerrado — Sprint 33: Stabilization, Governance and Runtime Confidence/i);
    console.log("Match 1 OK");
    assert.match(sprintLog, /Deployment Status:\s*SUCCESS/i);
    console.log("Match 2 OK");
    assert.match(sprintLog, /Operational Status:\s*STABLE/i);
    console.log("Match 3 OK");
    assert.match(status, /Sprint actual:\s*Sprint 34 — Runtime Confidence and Post-Stabilization Governance/i);
    console.log("Match 4 OK");
    assert.match(status, /Estado:\s*MVP estabilizado operativamente/i);
    console.log("Match 5 OK");
  } catch (e) {
    console.error(e.message);
  }
}

check();
