import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { V4QuestionRepository } from "../src/lib/question-bank/v4-question-repository";
import { buildTutorEvidence } from "../src/lib/tutor/tutor-evidence-builder";
import { DeterministicTutorProvider } from "../src/lib/tutor/providers/deterministic-tutor-provider";
import { persistTutorTurnTrace } from "../src/lib/tutor/tutor-trace-repository";

function localEnv() {
  const output = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8", shell: process.platform === "win32" });
  const values = new Map<string, string>();
  for (const line of output.split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index > 0) values.set(line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, ""));
  }
  const url = values.get("API_URL");
  const serviceKey = values.get("SERVICE_ROLE_KEY") ?? values.get("SECRET_KEY");
  if (!url || !serviceKey) throw new Error("Local Supabase credentials are unavailable");
  return { url, serviceKey };
}

async function main() {
  const { url, serviceKey } = localEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const email = `runtime-${randomUUID()}@example.test`;
  const created = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error("Could not create runtime test user");
  const authUserId = created.data.user.id;
  try {
    await admin.from("question_releases").update({ status: "active", activated_at: new Date().toISOString() }).eq("bank", "question-bank-v4");
    const { data: profile, error: profileError } = await admin.from("profiles").insert({ auth_user_id: authUserId, email }).select("id").single();
    if (profileError || !profile) throw profileError ?? new Error("Profile insert failed");
    await admin.from("learning_profiles").insert({
      profile_id: profile.id,
      target_profile_code: "coordinador",
      active_areas: ["evaluacion"],
      active_goal: "runtime integration",
      onboarding_completed: true,
    });
    await admin.from("item_target_profiles").upsert({
      question_id: "DOC-000001",
      profile_code: "coordinador",
      evidence: { test: true },
      content_hash: "a".repeat(64),
    });
    const { data: session, error: sessionError } = await admin.from("sessions").insert({
      profile_id: profile.id,
      target_profile_code: "coordinador",
      mode: "practice",
      current_state: "practice",
      status: "active",
    }).select("id").single();
    if (sessionError || !session) throw sessionError ?? new Error("Session insert failed");

    const repository = new V4QuestionRepository();
    const candidates = await repository.listCandidates({ targetProfileCode: "coordinador", limit: 20 });
    assert.equal(candidates.some((candidate) => candidate.id === "DOC-000001"), true);
    const practice = await repository.getPracticeQuestion("DOC-000001");
    assert.ok(practice);
    assert.equal(practice.options.length, 4);
    assert.equal("correctOption" in practice, false);
    assert.equal(practice.sourceReference, null);

    const pre = await buildTutorEvidence({ supabase: admin, userId: profile.id, sessionId: session.id, itemId: "DOC-000001" });
    assert.ok(pre.question);
    assert.equal(pre.question?.correctOption, undefined);
    assert.equal(pre.question?.correctExplanation, undefined);

    const answered = await repository.getAnsweredQuestion("DOC-000001");
    assert.ok(answered);
    const { error: advanceError } = await admin.rpc("advance_session_atomic", {
      p_profile_id: profile.id,
      p_session_id: session.id,
      p_item_id: "DOC-000001",
      p_selected_option: answered.correctOption,
      p_user_rationale: "Integración runtime",
      p_response_time_ms: 1000,
      p_confidence_self_report: 4,
      p_feedback_text: "Correcto",
      p_is_correct: true,
      p_reasoning_score: 80,
      p_normative_consistency_score: 80,
      p_competency_score: 80,
      p_estimated_theta_delta: 0.1,
      p_remediation_needed: false,
      p_evaluation_source: "deterministic",
      p_evaluation_version: "integration-v1",
      p_previous_state: "practice",
      p_current_state: "review",
    });
    if (advanceError) throw advanceError;

    const post = await buildTutorEvidence({ supabase: admin, userId: profile.id, sessionId: session.id, itemId: "DOC-000001" });
    assert.equal(post.question?.correctOption, answered.correctOption);
    assert.ok(post.question?.correctExplanation);
    const tutor = new DeterministicTutorProvider();
    const turn = await tutor.generate({ userId: profile.id, sessionId: session.id, itemId: "DOC-000001", message: "Explícame el feedback", evidence: post });
    assert.equal(turn.output.canRevealCorrectAnswer, true);
    assert.equal((await persistTutorTurnTrace({ supabase: admin, profileId: profile.id, trace: turn.trace })).ok, true);
    const traces = await admin.from("tutor_turn_traces").select("question_id, can_reveal_correct_answer").eq("trace_id", turn.trace.traceId).single();
    assert.deepEqual(traces.data, { question_id: "DOC-000001", can_reveal_correct_answer: true });

    console.log(JSON.stringify({ status: "passed", practiceQuestion: "safe", postAnswerTruth: "server-only", tutor: "passed", sessionAdvance: "atomic", targetingInheritance: "profile" }, null, 2));
  } finally {
    await admin.auth.admin.deleteUser(authUserId).catch(() => undefined);
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.stack : error); process.exit(1); });
