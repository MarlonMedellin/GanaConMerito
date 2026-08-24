import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

const dashboardRoute = read("src/app/api/dashboard/summary/route.ts");
const homePage = read("src/app/(authenticated)/home/page.tsx");
const dashboardPage = read("src/app/(authenticated)/dashboard/page.tsx");
const dashboardMetrics = read("src/lib/dashboard/summary-metrics.ts");
const tutorRoute = read("src/app/api/tutor/turn/route.ts");
const tutorTraceRepository = read("src/lib/tutor/tutor-trace-repository.ts");
const observability = read("src/lib/api/canary-observability.ts");
const onboardingForm = read("src/components/onboarding/onboarding-form.tsx");
const onboardingStatus = read("src/lib/onboarding/status.ts");
const onboardingRoute = read("src/app/api/profile/onboarding/route.ts");
const practicePage = read("src/app/(authenticated)/practice/page.tsx");
const practiceSession = read("src/components/practice/practice-session.tsx");
const formatLabel = read("src/lib/ui/format-label.ts");
const verticalRunner = read("scripts/qa-canary-vertical.js");
const packageJson = read("package.json");

const obsoleteContracts = [
  "professional_profiles",
  "professional_profile_id",
  "session_turns.item_id",
  "GCM_CANARY_OPEC_CATALOG_JSON",
  "GCM_CANARY_TARGETING_ENABLED",
  "gcm_canary_targeting",
  "gcm_canary_session_targeting",
];

test("dashboard surfaces auth and ownership failures instead of empty 200 responses", () => {
  assert.match(dashboardRoute, /requireAuthenticatedProfile/);
  assert.match(dashboardRoute, /requireOwnedSession/);
  assert.match(dashboardRoute, /AUTH_UNAUTHORIZED/);
  assert.match(dashboardRoute, /SESSION_NOT_FOUND/);
  assert.match(dashboardRoute, /observedJson/);
});

test("dashboard student copy hides internal heuristics and does not overclaim trends", () => {
  assert.match(dashboardPage, /Aún no hay una serie temporal suficiente para mostrar tendencia/);
  assert.doesNotMatch(dashboardPage, /Señal de razonamiento/);
  assert.doesNotMatch(dashboardPage, /Índice orientativo/);
  assert.doesNotMatch(dashboardPage, /Session ID/);
  assert.doesNotMatch(dashboardPage, /TutorTraceSummaryCard/);
  assert.match(dashboardPage, /Detalle por área y competencia/);
  assert.doesNotMatch(dashboardPage, /Nivel estimado/);
  assert.match(dashboardMetrics, /canShowTrend: false/);
  assert.match(dashboardMetrics, /canShowPercentile: false/);
  assert.doesNotMatch(dashboardMetrics, /latest > previous/);
});

test("home keeps next action truthful without unsupported activation or level claims", () => {
  assert.doesNotMatch(homePage, /activar el Tutor/i);
  assert.doesNotMatch(homePage, /Nivel estimado/i);
  assert.doesNotMatch(homePage, /mejores preguntas/i);
  assert.doesNotMatch(homePage, /Practicando en:/i);
  assert.doesNotMatch(homePage, /Continuar práctica/i);
  assert.match(homePage, /Practicar ahora/);
  assert.match(homePage, /Completar configuración/);
  assert.match(homePage, /Tutor GCM está disponible dentro de Practice/);
});

test("onboarding makes active areas optional without exposing Canary labels", () => {
  assert.match(onboardingForm, /Cargo \/ referencia OPEC \(opcional\)/);
  assert.doesNotMatch(onboardingForm, /Canary/);
  assert.doesNotMatch(onboardingForm, /OPEC verificada/);
  assert.match(onboardingForm, /Áreas declaradas \(opcional\)/);
  assert.match(onboardingForm, /No filtran ni priorizan las preguntas/);
  assert.doesNotMatch(onboardingForm, /!hasActiveAreas/);
  assert.match(onboardingRoute, /\.default\(\[\]\)/);
  assert.match(onboardingRoute, /onboarding_completed: true/);
  assert.doesNotMatch(onboardingStatus, /&& hasActiveAreas/);
});

test("practice hides editorial metadata and heuristic score cards", () => {
  assert.doesNotMatch(practiceSession, /Dificultad editorial estimada/);
  assert.doesNotMatch(practiceSession, /Mapa temático/);
  assert.doesNotMatch(practiceSession, /Tarea esperada/);
  assert.doesNotMatch(practiceSession, /Intención cognitiva/);
  assert.doesNotMatch(practiceSession, /Sesión \{session\.sessionId/);
  assert.doesNotMatch(practiceSession, /Estado: \{feedback\?\.currentState/);
  assert.doesNotMatch(practiceSession, /Dificultad \$\{item\.difficulty\.toFixed\(2\)\}/);
  assert.doesNotMatch(practiceSession, /no representan mediciones psicométricas calibradas/);
  assert.doesNotMatch(practiceSession, /metric-label">Razonamiento/);
  assert.doesNotMatch(practiceSession, /metric-label">Competencia/);
});

test("common V4 technical labels have human-readable representations", () => {
  assert.match(formatLabel, /planeacion_curricular: "Planeación curricular"/);
  assert.match(formatLabel, /decision_pedagogica: "Decisión pedagógica"/);
  assert.match(formatLabel, /gestion_educativa: "Gestión educativa"/);
});

test("Tutor remains owned, deterministic and trace-backed", () => {
  assert.match(tutorRoute, /requireOwnedSession/);
  assert.match(tutorRoute, /DeterministicTutorProvider/);
  assert.match(tutorRoute, /persistTutorTurnTrace/);
  assert.match(tutorTraceRepository, /getSupabaseAdminClient/);
  assert.doesNotMatch(tutorTraceRepository, /SupabaseClient/);
  assert.match(tutorRoute, /observedJson/);
  assert.doesNotMatch(tutorRoute, /console\.(?:log|warn|error)\([^\n]*userMessage/);
});

test("minimal observability records only operational metadata", () => {
  for (const field of ["requestId", "status", "latencyMs", "errorCode"]) {
    assert.match(observability, new RegExp(field));
  }
  for (const forbidden of ["password", "accessToken", "refreshToken", "serviceRole", "userMessage"]) {
    assert.doesNotMatch(observability, new RegExp(forbidden, "i"));
  }
});

test("CAN-005 runner pins Candidate, OPEC, Tutor, mobile, auth recovery and cleanup", () => {
  assert.match(verticalRunner, /dhiytzbwodfvdrnwhkcw/);
  assert.match(verticalRunner, /docente_aula_secundaria_media/);
  assert.match(verticalRunner, /bb72a5bf-21c0-40ae-8e04-b5633685e618/);
  assert.match(verticalRunner, /width:\s*390,\s*height:\s*844/);
  assert.match(verticalRunner, /locator\('label\.form-field', \{ hasText: \/\^Perfil reusable\/ \}\)\.locator\('select'\)/);
  assert.match(verticalRunner, /const resumeResult = await resumeResponsePromise/);
  assert.match(verticalRunner, /\(error\) => \(\{ error \}\)/);
  assert.match(verticalRunner, /\/api\/tutor\/turn/);
  assert.match(verticalRunner, /tutor_turn_traces/);
  assert.match(verticalRunner, /runSemanticAssertions/);
  assert.match(verticalRunner, /context\.clearCookies\(\)/);
  assert.match(verticalRunner, /deleteUser\(qaUser\.id\)/);
  assert.match(verticalRunner, /horizontal overflow/);
  assert.match(verticalRunner, /Pre-answer payload exposed editorial answer truth/);
  assert.doesNotMatch(verticalRunner, /auth-cookie\.txt/);
  assert.match(onboardingForm, /window\.location\.assign\("\/practice"\)/);
  assert.doesNotMatch(onboardingForm, /useRouter/);
  assert.doesNotMatch(onboardingForm, /router\.refresh\(\)/);
  assert.match(practicePage, /select\("onboarding_completed, active_areas, target_profile_code"\)/);
});

test("CAN-005 implementation does not restore obsolete PR 101 targeting contracts", () => {
  const combined = [dashboardRoute, tutorRoute, observability, verticalRunner].join("\n");
  for (const obsolete of obsoleteContracts) {
    assert.doesNotMatch(combined, new RegExp(obsolete.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("package exposes the CAN-005 commands", () => {
  assert.match(packageJson, /"qa:canary:vertical"/);
  assert.match(packageJson, /"test:canary:vertical-contract"/);
});
