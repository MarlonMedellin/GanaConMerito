import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { advanceSessionSchema } from "../src/lib/validation/session";

const resumeRoute = fs.readFileSync("src/app/api/session/resume/route.ts", "utf8");
const practiceSession = fs.readFileSync("src/components/practice/practice-session.tsx", "utf8");
const qaRunner = fs.readFileSync("scripts/qa-canary-resume.js", "utf8");

test("resume uses the canonical V4 targeting and turn schema", () => {
  assert.match(resumeRoute, /target_profile_code/);
  assert.match(resumeRoute, /target_opec_id/);
  assert.match(resumeRoute, /question_id/);
  assert.match(resumeRoute, /excludeItemIds:\s*seenItemIds/);
  assert.match(resumeRoute, /targetProfileCode:\s*session\.target_profile_code/);
  assert.match(resumeRoute, /targetOpecId:\s*session\.target_opec_id/);

  assert.doesNotMatch(resumeRoute, /professional_profile_id/);
  assert.doesNotMatch(resumeRoute, /professional_profiles/);
  assert.doesNotMatch(resumeRoute, /session_turns[\s\S]*item_id/);
  assert.doesNotMatch(resumeRoute, /GCM_CANARY_OPEC_CATALOG_JSON/);

  const basePayload = {
    sessionId: "760c4aed-1159-47a7-883c-9f84da70851f",
    attemptId: "760c4aed-1159-47a7-883c-9f84da70851f",
    clientRequestId: "760c4aed-1159-47a7-883c-9f84da70851f",
    selectedOption: "A" as const,
  };

  assert.equal(advanceSessionSchema.safeParse({ ...basePayload, itemId: "DOC-001001" }).success, true);
  assert.equal(advanceSessionSchema.safeParse({ ...basePayload, itemId: "GEN-001001" }).success, true);
  assert.equal(
    advanceSessionSchema.safeParse({ ...basePayload, itemId: "760c4aed-1159-47a7-883c-9f84da70851f" }).success,
    false,
  );
});

test("resume reconstructs state without persisting a turn", () => {
  assert.match(resumeRoute, /from\("session_turns"\)[\s\S]*\.select\("question_id, turn_number"\)/);
  assert.doesNotMatch(resumeRoute, /\.insert\(/);
  assert.doesNotMatch(resumeRoute, /\.update\(/);
  assert.doesNotMatch(resumeRoute, /\.delete\(/);
  assert.doesNotMatch(resumeRoute, /\.rpc\(/);
});

test("practice attempts resume before exposing start", () => {
  assert.match(practiceSession, /useEffect\(\(\) => \{\s*void resumeActiveSession\(\);/);
  assert.match(practiceSession, /fetch\("\/api\/session\/resume", \{ cache: "no-store" \}\)/);
  assert.match(practiceSession, /!initializing && !session && !error/);
});

test("remote runner enforces CAN-004 continuity and security assertions", () => {
  assert.match(qaRunner, /turnsBeforeResume\.length === 1/);
  assert.match(qaRunner, /turnsAfterResume\.length === 1/);
  assert.match(qaRunner, /resumed\.sessionId === sessionId/);
  assert.match(qaRunner, /resumed\.currentItemId !== firstItemId/);
  assert.match(qaRunner, /containsForbiddenPreAnswerTruth/);
  assert.match(qaRunner, /verifyClientBoundary/);
  assert.match(qaRunner, /deleteUser\(qaUserId\)/);

  assert.doesNotMatch(qaRunner, /professional_profiles/);
  assert.doesNotMatch(qaRunner, /professional_profile_id/);
  assert.doesNotMatch(qaRunner, /GCM_CANARY_OPEC_CATALOG_JSON/);
});
