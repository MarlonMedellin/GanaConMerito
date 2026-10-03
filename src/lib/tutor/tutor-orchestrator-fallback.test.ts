import test from "node:test";
import assert from "node:assert";
import { TutorOrchestrator } from "./tutor-orchestrator";
import type { TutorTurnRequest } from "../../types/tutor-turn";

test("TutorOrchestrator - Fallback contextual y sin regresiones legacy", async (t) => {
  const orchestrator = new TutorOrchestrator();

  const baseInput: TutorTurnRequest = {
    userId: "test-user",
    sessionId: "test-session",
    itemId: "test-item",
    message: "rol y competencia", // esto debería dar explain_profile_alignment
    evidence: {
      question: {
        itemId: "test-item",
        expectedUserTask: "Determinar la acción pedagógica adecuada ante el bajo rendimiento",
        area: "gestion_educativa",
        competency: "decision_pedagogica",
        topic: "evaluacion_diagnostica", cognitiveIntent: "analyze", sourceType: "knowledge_base", sourceRefs: [],
        stem: "Los estudiantes de grado quinto presentan bajo rendimiento.",
        options: [
          { key: "A", text: "Llamar acudientes", isCorrect: false },
          { key: "B", text: "Ajustar la planeación", isCorrect: true },
          { key: "C", text: "Remitir a coordinación", isCorrect: false },
          { key: "D", text: "Aplicar examen de nivelación", isCorrect: false },
        ]
      },
      aspirationalProfile: { profileId: "p", jobName: "Docente", performanceArea: "Educacion", profileLevel: "low" }, userSession: { sessionId: "s", userId: "u", currentItemId: "i", selectedContestId: "", selectedProfileId: "",
        
        supportLevel: "MEDIUM"
      }
    }
  };

  await t.test("Diferenciación semántica de intents en perfil SOCRATIC", async () => {
    // Role
    const roleReq = { ...baseInput, message: "mi rol" };
    const roleRes = await orchestrator.processTurn(roleReq);
    assert.strictEqual(roleRes.output.intent, "explain_profile_alignment");
    assert.ok(roleRes.output.visibleMessage.includes("Decisión pedagógica") || roleRes.output.visibleMessage.includes("decisión pedagógica")); // No snake_case
    assert.ok(!roleRes.output.visibleMessage.includes("decision_pedagogica"));
    
    // Task
    const taskReq = { ...baseInput, message: "tarea evaluativa real" };
    const taskRes = await orchestrator.processTurn(taskReq);
    assert.strictEqual(taskRes.output.intent, "explain_expected_task");
    assert.ok(taskRes.output.visibleMessage.includes("Determinar la acción pedagógica adecuada")); // Contextual

    // Option Analysis
    const optionReq = { ...baseInput, message: "opciones" };
    const optionRes = await orchestrator.processTurn(optionReq);
    assert.strictEqual(optionRes.output.intent, "compare_options");
    assert.ok(optionRes.output.visibleMessage.includes("A: "));
    
    // Legacy tests
    assert.ok(!optionRes.output.visibleMessage.includes("trampa"));
    assert.ok(!optionRes.output.visibleMessage.includes("distractor"));

    // Diferenciación
    assert.notStrictEqual(roleRes.output.visibleMessage, taskRes.output.visibleMessage);
    assert.notStrictEqual(roleRes.output.visibleMessage, optionRes.output.visibleMessage);
    assert.notStrictEqual(taskRes.output.visibleMessage, optionRes.output.visibleMessage);
  });

  await t.test("Diferenciación semántica de intents en perfil DIRECT", async () => {
    const dReq = { ...baseInput, profile: "direct" as const };
    
    const roleRes = await orchestrator.processTurn({ ...dReq, message: "mi rol" });
    const taskRes = await orchestrator.processTurn({ ...dReq, message: "tarea evaluativa real" });
    const optionRes = await orchestrator.processTurn({ ...dReq, message: "opciones" });
    
    assert.notStrictEqual(roleRes.output.visibleMessage, taskRes.output.visibleMessage);
    assert.notStrictEqual(taskRes.output.visibleMessage, optionRes.output.visibleMessage);
    assert.ok(roleRes.output.visibleMessage.includes("Decisión pedagógica") || roleRes.output.visibleMessage.includes("decisión pedagógica"));
    assert.ok(!roleRes.output.visibleMessage.includes("decision_pedagogica"));
  });

  await t.test("Diferenciación semántica de intents en perfil BRIEF (<= 80 palabras)", async () => {
    const bReq = { ...baseInput, profile: "brief" as const };
    
    const roleRes = await orchestrator.processTurn({ ...bReq, message: "mi rol" });
    const taskRes = await orchestrator.processTurn({ ...bReq, message: "tarea evaluativa real" });
    const optionRes = await orchestrator.processTurn({ ...bReq, message: "opciones" });
    
    assert.notStrictEqual(roleRes.output.visibleMessage, taskRes.output.visibleMessage);
    assert.notStrictEqual(taskRes.output.visibleMessage, optionRes.output.visibleMessage);
    
    const roleWords = roleRes.output.visibleMessage.split(/\s+/).length;
    assert.ok(roleWords <= 80, `Brief ROLE tiene demasiadas palabras: ${roleWords}`);
    
    assert.ok(!optionRes.output.visibleMessage.includes("trampa"));
  });

});
