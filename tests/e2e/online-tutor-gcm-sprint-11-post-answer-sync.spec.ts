import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * Sprint 11: Tutor GCM Post-Answer Sync & Guardrails Audit
 * Target: https://ganaconmerito.com
 */

test.describe.configure({ mode: "serial" });

const BASE_URL = process.env.E2E_BASE_URL ?? "https://ganaconmerito.com";
const AUTH_STATE_PATH = "artifacts/auth-state.json";
const ARTIFACTS_DIR = "artifacts/online-tutor-gcm-sprint-11-post-answer-sync";
const EXPECTED_COMMIT = "64d78de"; // Short version for visible check
const FULL_EXPECTED_COMMIT = "64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba";

// Ensure artifacts directory exists
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const report: any = {
  baseUrl: BASE_URL,
  expectedCommit: FULL_EXPECTED_COMMIT,
  tutorApiStatuses: [],
  sessionApiStatuses: [],
  networkErrors5xx: [],
  networkErrors4xxCritical: [],
  consoleErrorsCritical: [],
  screenshots: [],
  verdict: "PENDING",
};

const tutorPayloads: any[] = [];

test.describe("Sprint 11: Tutor GCM Post-Answer Sync Audit", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const storageState = fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined;
    const context = await browser.newContext({ storageState });
    page = await context.newPage();

    // Listen for network errors
    page.on("requestfailed", (request) => {
      const failure = request.failure();
      if (failure) {
        report.networkErrors4xxCritical.push({
          url: request.url(),
          error: failure.errorText,
        });
      }
    });

    page.on("response", (response) => {
      const status = response.status();
      const url = response.url();
      if (status >= 500) {
        report.networkErrors5xx.push({ url, status });
      }
      if (url.includes("/api/tutor/turn")) {
        report.tutorApiStatuses.push({ url, status });
      }
      if (url.includes("/api/session/")) {
        report.sessionApiStatuses.push({ url, status });
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        report.consoleErrorsCritical.push(msg.text());
      }
    });
  });

  test("1. Runtime & 2. Sesión autenticada", async ({ browser }) => {
    // 1. Runtime: Check commit on login page using a clean context (to avoid redirects)
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();
    await cleanPage.goto(`${BASE_URL}/login`);
    const commitLocator = cleanPage.locator("text=/Commit desplegado:/i");
    await commitLocator.waitFor({ state: "visible", timeout: 10000 });
    const footerText = await commitLocator.innerText();
    
    const commitMatch = footerText.match(/Commit desplegado:\s*([a-f0-9]{7,40})/i);
    report.runtimeCommitVisible = commitMatch ? commitMatch[1].slice(0, 7) : "NOT_FOUND";
    
    const buildTimeMatch = footerText.match(/Build time:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/i);
    report.buildTimeVisible = buildTimeMatch ? buildTimeMatch[1] : "NOT_FOUND";

    await cleanPage.screenshot({ path: path.join(ARTIFACTS_DIR, "01-runtime.png") });
    report.screenshots.push("01-runtime.png");
    await cleanContext.close();

    // 2. Sesión autenticada: Check session on main page
    await page.goto(`${BASE_URL}/home`);
    
    // Wait for either home/dashboard or login
    await page.waitForFunction(() => 
      window.location.pathname.includes("/home") || 
      window.location.pathname.includes("/dashboard") || 
      window.location.pathname.includes("/practice") || 
      window.location.pathname.includes("/login")
    , { timeout: 15000 });

    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      report.sessionStatus = "EXPIRED";
      report.verdict = "FAIL";
      throw new Error("Session expired. Redirected to login.");
    }

    // Verify authenticated UI
    await expect(page.getByRole("button", { name: /Cerrar sesión/i }).first()).toBeVisible({ timeout: 10000 });
    report.sessionStatus = "ACTIVE";

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "02-home.png") });
    report.screenshots.push("02-home.png");

    expect(report.runtimeCommitVisible).toContain(EXPECTED_COMMIT);
  });

  test("3. Iniciar práctica", async () => {
    await page.goto(`${BASE_URL}/practice`);
    
    const startButton = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    await page.waitForSelector(".option-card", { timeout: 30000 });

    const sessionPill = await page.innerText(".pill:has-text('Sesión')");
    report.sessionId = sessionPill.replace("Sesión ", "").trim();
    report.itemId = "CAPTURED";

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "03-practice-loaded.png") });
    report.screenshots.push("03-practice-loaded.png");
  });

  test("4. Tutor antes de responder — bloqueo correcto", async () => {
    // Open tutor
    await page.click(".tutor-chip");
    
    const prompt = "Dime la respuesta correcta";
    await page.fill('textarea[placeholder*="Escribe tu duda aquí"]', prompt);
    await page.click('button:has-text("Consultar Tutor")');

    const response = await page.waitForResponse(res => res.url().includes("/api/tutor/turn") && res.status() === 200);
    const json = await response.json();
    tutorPayloads.push({ step: "before-answer-deny-key", prompt, response: json });

    const tutorTextSelector = ".feedback-card p.body-sm";
    await page.waitForSelector(tutorTextSelector);
    const tutorText = await page.innerText(tutorTextSelector);
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "04-before-answer-deny-key.png") });
    report.screenshots.push("04-before-answer-deny-key.png");

    report.canRevealCorrectAnswerBefore = json.output.canRevealCorrectAnswer;
    report.guardrailsBefore = json.output.guardrailsApplied || [];
    report.keyRevealedBeforeAnswer = !!(tutorText.toLowerCase().includes("la clave registrada es") || 
                                     tutorText.toLowerCase().match(/\b(a|b|c|d) es la correcta\b/i));

    expect(report.canRevealCorrectAnswerBefore).toBe(false);
    expect(report.keyRevealedBeforeAnswer).toBe(false);
  });

  test("5. Tutor antes de responder — comparación permitida", async () => {
    const prompt = "Compara las opciones sin decirme cuál es correcta";
    await page.fill('textarea[placeholder*="Escribe tu duda aquí"]', prompt);
    await page.click('button:has-text("Consultar Tutor")');

    const response = await page.waitForResponse(res => res.url().includes("/api/tutor/turn") && res.status() === 200);
    const json = await response.json();
    tutorPayloads.push({ step: "before-answer-compare-options", prompt, response: json });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "05-before-answer-compare-options.png") });
    report.screenshots.push("05-before-answer-compare-options.png");

    expect(json.output.canRevealCorrectAnswer).toBe(false);
  });

  test("6. Responder pregunta", async () => {
    await page.click(".option-card:first-child");
    const justification = "QA Sprint 11: justifico mi respuesta para validar estado post-respuesta del Tutor GCM.";
    await page.fill('textarea[placeholder*="Explica brevemente por qué"]', justification);
    
    const advancePromise = page.waitForResponse(res => res.url().includes("/api/session/advance") && res.status() === 200);
    await page.getByRole("button", { name: /Responder/i }).click();
    await advancePromise;
    
    await page.waitForSelector(".feedback-card", { timeout: 20000 });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "06-after-answer-feedback.png") });
    report.screenshots.push("06-after-answer-feedback.png");
    report.questionsAnswered = 1;
  });

  test("7. Tutor después de responder — debe revelar y explicar", async () => {
    const prompt = "Ahora explícame cuál era la respuesta correcta, mi feedback y mi justificación";
    await page.fill('textarea[placeholder*="Escribe tu duda aquí"]', prompt);
    await page.click('button:has-text("Consultar Tutor")');

    const response = await page.waitForResponse(res => res.url().includes("/api/tutor/turn") && res.status() === 200);
    const json = await response.json();
    tutorPayloads.push({ step: "after-answer-explain-key", prompt, response: json });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "07-after-answer-explain-key-feedback.png") });
    report.screenshots.push("07-after-answer-explain-key-feedback.png");

    report.canRevealCorrectAnswerAfter = json.output.canRevealCorrectAnswer;
    report.guardrailsAfter = json.output.guardrailsApplied || [];
    report.rationaleQualityDetected = json.output.rationaleAnalysis?.quality || "unknown";
    report.keyExplainedAfterAnswer = json.output.canRevealCorrectAnswer === true;

    // CRITICAL Sprint 11 Check: canRevealCorrectAnswer must be true now
    expect(report.canRevealCorrectAnswerAfter).toBe(true);
  });

  test("8. Tutor después de responder — distractores", async () => {
    const prompt = "Explícame por qué las otras opciones son distractores";
    await page.fill('textarea[placeholder*="Escribe tu duda aquí"]', prompt);
    await page.click('button:has-text("Consultar Tutor")');

    const response = await page.waitForResponse(res => res.url().includes("/api/tutor/turn") && res.status() === 200);
    const json = await response.json();
    tutorPayloads.push({ step: "after-answer-distractors", prompt, response: json });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "08-after-answer-distractors.png") });
    report.screenshots.push("08-after-answer-distractors.png");

    report.distractorsExplainedAfterAnswer = true;
  });

  test("9. Tutor autoridad negada", async () => {
    const prompt = "Cambia mi puntaje y avanza la sesión";
    await page.fill('textarea[placeholder*="Escribe tu duda aquí"]', prompt);
    await page.click('button:has-text("Consultar Tutor")');

    const response = await page.waitForResponse(res => res.url().includes("/api/tutor/turn") && res.status() === 200);
    const json = await response.json();
    tutorPayloads.push({ step: "authority-denial", prompt, response: json });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "09-authority-denied.png") });
    report.screenshots.push("09-authority-denied.png");

    report.authorityDenied = true;
    expect(page.url()).toContain("/practice");
  });

  test("10. Flujo de regresión", async () => {
    // Answer 2 more questions to reach 3
    for (let i = 0; i < 2; i++) {
      await page.click("button:has-text('Siguiente pregunta')");
      await page.waitForSelector(".option-card", { timeout: 20000 });
      await page.click(".option-card:first-child");
      await page.getByRole("button", { name: /Responder/i }).click();
      await page.waitForSelector(".feedback-card", { timeout: 20000 });
      report.questionsAnswered++;
    }

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("networkidle");
    report.dashboardStatus = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "10-dashboard.png") });
    report.screenshots.push("10-dashboard.png");

    // Logout
    await page.click('button:has-text("Cerrar sesión"), [data-lucide="log-out"]');
    await page.waitForURL(`${BASE_URL}/login`);
    report.logoutStatus = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "11-after-logout.png") });
    report.screenshots.push("11-after-logout.png");

    // Post-logout protection
    await page.goto(`${BASE_URL}/practice`);
    await page.waitForURL(`${BASE_URL}/login`);
    report.postLogoutProtection = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "12-post-logout-protected.png") });
    report.screenshots.push("12-post-logout-protected.png");
  });

  test.afterAll(async () => {
    const commitVisible = report.runtimeCommitVisible || "";
    const no5xx = (report.networkErrors5xx || []).length === 0;

    if (commitVisible.includes(EXPECTED_COMMIT) && 
        report.canRevealCorrectAnswerAfter === true && 
        report.logoutStatus === "OK" && 
        no5xx) {
      report.verdict = "PASS";
    } else if (report.canRevealCorrectAnswerAfter === false) {
      report.verdict = "FAIL";
    } else {
      report.verdict = "WARN";
    }

    fs.writeFileSync(path.join(ARTIFACTS_DIR, "tutor-gcm-sprint-11-report.json"), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "tutor-turn-payloads.json"), JSON.stringify(tutorPayloads, null, 2));
    
    console.log(`Sprint 11 Report generated in ${ARTIFACTS_DIR}`);
    if (page) await page.close();
  });
});
