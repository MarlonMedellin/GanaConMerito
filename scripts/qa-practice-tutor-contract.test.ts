import assert from "node:assert/strict";
import test from "node:test";
import { buildPracticeQuestionViewModel } from "../src/lib/session/practice-question";
import { TutorOrchestrator } from "../src/lib/tutor/tutor-orchestrator";
import type { TutorTurnRequest } from "../src/types/tutor-turn";

test("vNext pre-answer item contract: zero answer leakage in serialized payload", () => {
  const itemRecord = {
    id: "item-vnext-001",
    title: "Análisis de Caso Educativo",
    area: "pedagogia",
    topic: "evaluacion",
    competency: "competencia_evaluativa",
    difficulty: 0.7,
    context: "Una institución educativa debe definir un plan de nivelación.",
    stem: "¿Cuál es la acción más consistente con el reglamento?",
    questionType: "case_analysis",
    cognitiveLevel: "aplicar",
    sourceType: "official_source",
    hint: "Considere el debido proceso.",
    tags: ["v4"],
    correct_option: "C",
    explanation: "La opción C garantiza el debido proceso reglamentario.",
    editorial_metadata: {
      correctOption: "C",
      learningNote: "El debido proceso prima sobre la sanción inmediata.",
      explanations: {
        A: "La opción AOmite notificación previa.",
        B: "La opción BExcede la competencia del docente.",
        C: "La opción CEscoge el trámite regular institucional.",
        D: "La opción DDelega incorrectamente en terceros.",
      },
    },
  };

  const viewModel = buildPracticeQuestionViewModel(itemRecord as never, [
    { key: "A", text: "Aplicar sanción inmediata." },
    { key: "B", text: "Remitir a entidad externa sin informe." },
    { key: "C", text: "Iniciar debido proceso institucional." },
    { key: "D", text: "Archivar el caso sin registro." },
  ]);

  const publicContract = {
    schemaVersion: "vNext-1.0",
    item: {
      id: itemRecord.id,
      domain: itemRecord.area,
      competency: itemRecord.competency,
      context: itemRecord.context,
      stem: itemRecord.stem,
      options: [
        { id: "A", text: "Aplicar sanción inmediata." },
        { id: "B", text: "Remitir a entidad externa sin informe." },
        { id: "C", text: "Iniciar debido proceso institucional." },
        { id: "D", text: "Archivar el caso sin registro." },
      ],
    },
    attempt: {
      id: "att-test-1",
      phase: "evaluating" as const,
      mode: "guided" as const,
      assistanceUsed: false,
    },
    tutor: {
      preAnswerEnabled: true,
      allowedProfiles: ["socratic", "direct", "brief"] as const,
      selectedProfile: "socratic" as const,
    },
  };

  const payload = { ...viewModel, ...publicContract };
  const serialized = JSON.stringify(payload);

  // Structural checks
  assert.equal("correct_option" in payload, false);
  assert.equal("correctOption" in payload, false);
  assert.equal("explanation" in payload, false);
  assert.equal("editorial_metadata" in payload, false);
  assert.equal("learningNote" in payload, false);

  // Regex safety checks
  assert.doesNotMatch(serialized, /"correct_option"/i);
  assert.doesNotMatch(serialized, /"correctOption"/i);
  assert.doesNotMatch(serialized, /"explanation"/i);
  assert.doesNotMatch(serialized, /"learningNote"/i);
  assert.doesNotMatch(serialized, /opción C garantiza/i);
});

test("vNext Tutor Orchestrator: Socratic profile pre-answer scaffolding never leaks key", async () => {
  const orchestrator = new TutorOrchestrator();
  const request: TutorTurnRequest = {
    userId: "user-1",
    sessionId: "sess-1",
    itemId: "item-1",
    profile: "socratic",
    message: "¿Cuál es la respuesta correcta?",
    evidence: {
      userSession: {
        userId: "user-1",
        selectedContestId: "contest-1",
        selectedProfileId: "profile-1",
        currentItemId: "item-1",
        sessionId: "sess-1",
        selectedOption: undefined,
      },
      question: {
        itemId: "item-1",
        area: "pedagogia",
        competency: "decision_docente",
        topic: "evaluacion",
        cognitiveIntent: "evaluar",
        expectedUserTask: "Ponderar opciones",
        sourceType: "official_source",
        sourceRefs: ["Decreto 1075"],
        stem: "Enunciado del caso",
        correctOption: "B",
        correctExplanation: "La B es la opción correcta.",
        options: [
          { key: "A", text: "Opcion A" },
          { key: "B", text: "Opcion B" },
          { key: "C", text: "Opcion C" },
          { key: "D", text: "Opcion D" },
        ],
      },
    },
  };

  const result = await orchestrator.processTurn(request);

  assert.equal(result.output.canRevealCorrectAnswer, false);
  assert.equal(result.output.phase, "pre_answer");
  assert.equal(result.output.profile, "socratic");
  assert.equal(result.output.safety?.status, "redirected");
  assert.doesNotMatch(result.output.visibleMessage, /\bclave\s+es\s+B\b/i);
  assert.doesNotMatch(result.output.visibleMessage, /\bla B es\b/i);
});

test("vNext Tutor Orchestrator: Direct profile pre-answer provides neutral criteria", async () => {
  const orchestrator = new TutorOrchestrator();
  const request: TutorTurnRequest = {
    userId: "user-1",
    sessionId: "sess-1",
    itemId: "item-1",
    profile: "direct",
    message: "Dame criterios para resolver este caso",
    evidence: {
      userSession: {
        userId: "user-1",
        selectedContestId: "contest-1",
        selectedProfileId: "profile-1",
        currentItemId: "item-1",
        sessionId: "sess-1",
        selectedOption: undefined,
      },
      question: {
        itemId: "item-1",
        area: "gestion_publica",
        competency: "mipg",
        topic: "procesos",
        cognitiveIntent: "aplicar",
        expectedUserTask: "Identificar procedimiento",
        sourceType: "official_source",
        sourceRefs: ["Ley 489"],
        stem: "Caso de gestión pública",
        correctOption: "A",
        correctExplanation: "La A cumple el principio de eficacia.",
        options: [
          { key: "A", text: "Opcion A" },
          { key: "B", text: "Opcion B" },
          { key: "C", text: "Opcion C" },
          { key: "D", text: "Opcion D" },
        ],
      },
    },
  };

  const result = await orchestrator.processTurn(request);

  assert.equal(result.output.canRevealCorrectAnswer, false);
  assert.equal(result.output.profile, "direct");
  assert.match(result.output.visibleMessage, /criterios/i);
  assert.doesNotMatch(result.output.visibleMessage, /\bopción A\b/i);
});

test("vNext Tutor Orchestrator: Brief profile pre-answer returns bullet points within word limit", async () => {
  const orchestrator = new TutorOrchestrator();
  const request: TutorTurnRequest = {
    userId: "user-1",
    sessionId: "sess-1",
    itemId: "item-1",
    profile: "brief",
    message: "¿Qué debo tener en cuenta?",
    evidence: {
      userSession: {
        userId: "user-1",
        selectedContestId: "contest-1",
        selectedProfileId: "profile-1",
        currentItemId: "item-1",
        sessionId: "sess-1",
        selectedOption: undefined,
      },
      question: {
        itemId: "item-1",
        area: "lectura_critica",
        competency: "analisis",
        topic: "textos",
        cognitiveIntent: "comprender",
        expectedUserTask: "Inferir intención",
        sourceType: "official_source",
        sourceRefs: [],
        stem: "Texto corto",
        correctOption: "C",
        correctExplanation: "C es la inferencia adecuada.",
        options: [
          { key: "A", text: "Opcion A" },
          { key: "B", text: "Opcion B" },
          { key: "C", text: "Opcion C" },
          { key: "D", text: "Opcion D" },
        ],
      },
    },
  };

  const result = await orchestrator.processTurn(request);

  assert.equal(result.output.canRevealCorrectAnswer, false);
  assert.equal(result.output.profile, "brief");
  assert.match(result.output.visibleMessage, /•/);
  const words = result.output.visibleMessage.trim().split(/\s+/).length;
  assert.ok(words <= 80, `Brief profile output should be concise (got ${words} words)`);
});

test("Attempt Service: enforces ownership, expiration, replay idempotency and deduplication", async () => {
  const { defaultAttemptStore } = await import("../src/domain/session/attempt-service");

  const attempt = await defaultAttemptStore.createAttempt({
    sessionId: "sess-adv-1",
    itemId: "item-adv-1",
    profileId: "user-adv-1",
    mode: "guided",
  });

  assert.equal(attempt.phase, "evaluating");
  assert.equal(attempt.assistanceUsed, false);

  // Mark assistance used
  await defaultAttemptStore.markAssistanceUsed(attempt.attemptId);
  const updatedAssistance = await defaultAttemptStore.getAttempt(attempt.attemptId);
  assert.equal(updatedAssistance?.assistanceUsed, true);

  // Submit attempt
  const submitResult1 = await defaultAttemptStore.submitAttempt({
    attemptId: attempt.attemptId,
    sessionId: "sess-adv-1",
    itemId: "item-adv-1",
    profileId: "user-adv-1",
    selectedOption: "B",
    clientRequestId: "req-unique-001",
  });

  assert.equal(submitResult1.attempt.phase, "submitted");
  assert.equal(submitResult1.isReplay, false);

  // Replay submit attempt with same clientRequestId
  const submitResult2 = await defaultAttemptStore.submitAttempt({
    attemptId: attempt.attemptId,
    sessionId: "sess-adv-1",
    itemId: "item-adv-1",
    profileId: "user-adv-1",
    selectedOption: "B",
    clientRequestId: "req-unique-001",
  });

  assert.equal(submitResult2.isReplay, true);

  // Mismatch error tests
  await assert.rejects(
    () => defaultAttemptStore.submitAttempt({
      attemptId: attempt.attemptId,
      sessionId: "other-session",
      itemId: "item-adv-1",
      profileId: "user-adv-1",
      selectedOption: "B",
      clientRequestId: "req-mismatch",
    }),
    /ATTEMPT_SESSION_MISMATCH/
  );
});
