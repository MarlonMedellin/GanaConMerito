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

test("submission requires UUID correlation and rejects client authority", async () => {
  const {advanceSessionSchema} = await import("../src/lib/validation/session");
  const valid = {sessionId:crypto.randomUUID(),attemptId:crypto.randomUUID(),clientRequestId:crypto.randomUUID(),itemId:"DOC-000001",selectedOption:"A"};
  assert.equal(advanceSessionSchema.safeParse(valid).success,true);
  for (const field of ["attemptId","clientRequestId","sessionId"]) {
    assert.equal(advanceSessionSchema.safeParse({...valid,[field]:""}).success,false);
    assert.equal(advanceSessionSchema.safeParse({...valid,[field]:undefined}).success,false);
  }
  for (const extra of [{mode:"guided"},{assistanceUsed:false}]) assert.equal(advanceSessionSchema.safeParse({...valid,...extra}).success,false);
});

test("exactly three tactical predefined chips before answering and zero after answering", async () => {
  const { getTutorGuidedActions } = await import("../src/components/tutor/tutor-interface");
  const preAnswerActions = getTutorGuidedActions(false, "guided");
  assert.equal(preAnswerActions.length, 3);
  assert.deepEqual(preAnswerActions, [
    "¿Cuál es mi rol y competencia aquí?",
    "¿Cuál es la tarea evaluativa real?",
    "¿Qué trampa esconden los distractores?",
  ]);

  const postAnswerActions = getTutorGuidedActions(true, "guided");
  assert.equal(postAnswerActions.length, 0);

  const simulationActions = getTutorGuidedActions(false, "simulation");
  assert.equal(simulationActions.length, 0);
});

test("translation of all required question types and technical labels", async () => {
  const { formatTechnicalLabel } = await import("../src/lib/ui/format-label");
  assert.equal(formatTechnicalLabel("normative_applied"), "Normativa aplicada");
  assert.equal(formatTechnicalLabel("technical_applied"), "Técnica aplicada");
  assert.equal(formatTechnicalLabel("reasoning"), "Razonamiento");
  assert.equal(formatTechnicalLabel("conceptual"), "Conceptual");
  assert.equal(formatTechnicalLabel("case_analysis"), "Análisis de caso");
  assert.equal(formatTechnicalLabel("situational"), "Situacional");
  assert.equal(formatTechnicalLabel("reading_analysis"), "Análisis de lectura");
});

test("practice-session interface has user-rationale removed and feedback without rationale prompt", async () => {
  const fs = await import("node:fs");
  const practiceSession = fs.readFileSync("src/components/practice/practice-session.tsx", "utf8");
  const tutorInterface = fs.readFileSync("src/components/tutor/tutor-interface.tsx", "utf8");
  const scoreResponse = fs.readFileSync("src/domain/evaluation/score-response.ts", "utf8");

  // User rationale field removed completely
  assert.doesNotMatch(practiceSession, /user-rationale/);
  assert.doesNotMatch(practiceSession, /userRationale/);
  assert.doesNotMatch(practiceSession, /Justificación de tu respuesta/);

  // Exact initial tutor message
  assert.match(
    tutorInterface,
    /Tutor AI GCM🤖: Antes de responderte, te ayudaré a pensar\. Pregúntame sobre el caso o sobre cómo analizar las alternativas; puedo explicarte por qué una alternativa es plausible o no plausible, sin revelarte la clave\./,
  );

  // Feedback does not ask to justify in next turn
  assert.doesNotMatch(scoreResponse, /siguiente turno/i);
  assert.doesNotMatch(scoreResponse, /Intenta explicar tu razonamiento/i);

  // Header layout matching reference mockup (Row 1, Row 2, Row 3)
  assert.match(practiceSession, /<p className="eyebrow">SESIÓN<\/p>/);
  assert.match(practiceSession, /\{turnNumber\} de práctica/);
  assert.match(practiceSession, /<h1>Piensa como te van a evaluar\.<\/h1>/);
  assert.match(practiceSession, /className="practice-meta"/);
  assert.match(practiceSession, /Foco actual/);
  assert.match(practiceSession, /Meta de sesión/);
  assert.match(practiceSession, /Dominio/);
  assert.doesNotMatch(practiceSession, /Foco \/ Modalidad \/ Asistencia/);

  // Accessibility checks
  assert.match(practiceSession, /role="radiogroup"/);
  assert.match(practiceSession, /role="radio"/);
  assert.match(practiceSession, /feedbackHeaderRef\.current\.focus\(\)/);
  assert.match(practiceSession, /mobileSheetRef/);
});

test("tutor polish contract: S/D/B profile cards, dynamic header, and contextual placeholders", async () => {
  const fs = await import("node:fs");
  const tutorInterface = fs.readFileSync("src/components/tutor/tutor-interface.tsx", "utf8");

  // Three profile options with initials S, D, B and descriptions
  assert.match(tutorInterface, /key: "socratic", initial: "S", label: "Socrático", desc: "Preguntas guiadas antes de revelar"/);
  assert.match(tutorInterface, /key: "direct", initial: "D", label: "Directo", desc: "Criterios claros y explicación estructurada"/);
  assert.match(tutorInterface, /key: "brief", initial: "B", label: "Breve", desc: "Orientación en viñetas sintéticas"/);

  // Dynamic header title per active profile
  assert.match(tutorInterface, /Tutor AI GCM 🤖 — /);
  assert.match(tutorInterface, /S · Socrático/);
  assert.match(tutorInterface, /D · Directo/);
  assert.match(tutorInterface, /B · Breve/);

  // Contextual placeholder before and after answering
  assert.match(tutorInterface, /Consulta al Tutor GCM \(sin revelar la clave\)\.\.\./);
  assert.match(tutorInterface, /¿Tienes una objeción o duda sobre la norma\? Escribe aquí\.\.\./);

  // Initial exact tutor message preserved
  assert.match(
    tutorInterface,
    /Tutor AI GCM🤖: Antes de responderte, te ayudaré a pensar\. Pregúntame sobre el caso o sobre cómo analizar las alternativas; puedo explicarte por qué una alternativa es plausible o no plausible, sin revelarte la clave\./,
  );
});


