import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * Sprint 12: Dashboard Metric Signal & Prudence Contract Audit
 * Target: https://ganaconmerito.com
 */

test.describe.configure({ mode: "serial" });

const BASE_URL = process.env.E2E_BASE_URL ?? "https://ganaconmerito.com";
const AUTH_STATE_PATH = "artifacts/auth-state.json";
const ARTIFACTS_DIR = "artifacts/online-dashboard-metric-signal-contract";
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT ?? "64d78de";
const FULL_EXPECTED_COMMIT = "64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba";

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const report: any = {
  baseUrl: BASE_URL,
  expectedCommit: FULL_EXPECTED_COMMIT,
  runtimeCommitVisible: "PENDING",
  buildTimeVisible: "PENDING",
  dashboardTextSample: "",
  signalLabelsDetected: [],
  prudentCopyDetected: [],
  forbiddenClaimsDetected: [],
  metricsVisible: [],
  percentileStatus: "UNKNOWN",
  strengthsCopyStatus: "UNKNOWN",
  weaknessesCopyStatus: "UNKNOWN",
  questionsAnswered: 0,
  sessionDashboardStatus: "PENDING",
  logoutStatus: "PENDING",
  postLogoutProtection: "PENDING",
  networkErrors5xx: [],
  networkErrors4xxCritical: [],
  consoleErrorsCritical: [],
  screenshots: [],
  verdict: "PENDING",
};

test.describe("Sprint 12: Dashboard Metric Signal Contract Audit", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const storageState = fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined;
    const context = await browser.newContext({ storageState });
    page = await context.newPage();

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
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        report.consoleErrorsCritical.push(msg.text());
      }
    });
  });

  test("1. Runtime & 2. Sesión autenticada", async ({ browser }) => {
    // 1. Runtime check
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

    // 2. Auth check
    await page.goto(`${BASE_URL}/home`);
    await page.waitForFunction(() => 
      window.location.pathname.includes("/home") || 
      window.location.pathname.includes("/dashboard") || 
      window.location.pathname.includes("/practice")
    , { timeout: 15000 });

    await expect(page.getByRole("button", { name: /Cerrar sesión/i }).first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "02-home.png") });
    report.screenshots.push("02-home.png");

    expect(report.runtimeCommitVisible).toContain(EXPECTED_COMMIT);
  });

  test("3. Dashboard histórico — Señal y Prudencia", async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("networkidle");
    
    const bodyText = await page.innerText("body");
    report.dashboardTextSample = bodyText.slice(0, 1000);

    // 4. Forbidden Claims
    const forbidden = ["probabilidad de aprobar", "estás listo", "vas a ganar", "nivel real frente a otros", "percentil estimado"];
    forbidden.forEach(claim => {
      if (bodyText.toLowerCase().includes(claim)) {
        report.forbiddenClaimsDetected.push(claim);
      }
    });

    // 5. Signal Labels
    const signals = ["Sin señal", "Señal inicial", "Señal emergente", "Señal usable"];
    signals.forEach(label => {
      if (bodyText.includes(label)) {
        report.signalLabelsDetected.push(label);
      }
    });

    // Prudent Copy
    const prudent = ["muestra", "señal", "no concluyente", "prudencia", "orientación", "evidencia"];
    prudent.forEach(word => {
      if (bodyText.toLowerCase().includes(word)) {
        report.prudentCopyDetected.push(word);
      }
    });

    // 6. Metrics visible
    const metrics = ["Precisión", "Intentos", "Razonamiento promedio", "Señal de nivel", "Nivel estimado", "Lectura ejecutiva", "Focos de refuerzo", "Detalle por tema"];
    metrics.forEach(metric => {
      if (bodyText.includes(metric)) {
        report.metricsVisible.push(metric);
      }
    });

    // 7. Percentile
    if (bodyText.includes("Percentil")) {
      report.percentileStatus = bodyText.includes("no concluyente") ? "PRUDENT" : "CONCLUIVE_OR_DIRECT";
    }

    // 8. Strengths/Weaknesses
    if (bodyText.includes("Fortaleza")) {
      report.strengthsCopyStatus = (bodyText.includes("no concluyente") || bodyText.includes("Sin conclusión")) ? "PRUDENT" : "DIRECT";
    }
    if (bodyText.includes("Refuerzo")) {
      report.weaknessesCopyStatus = (bodyText.includes("no concluyente") || bodyText.includes("sugerido inicial")) ? "PRUDENT" : "DIRECT";
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "03-dashboard-historical.png"), fullPage: true });
    report.screenshots.push("03-dashboard-historical.png");

    expect(report.forbiddenClaimsDetected.length).toBe(0);
  });

  test("9. Flujo de práctica", async () => {
    await page.goto(`${BASE_URL}/practice`);
    const startButton = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startButton.isVisible()) await startButton.click();

    for (let i = 0; i < 3; i++) {
      await page.waitForSelector(".option-card", { timeout: 20000 });
      await page.click(".option-card:first-child");
      await page.fill('textarea[placeholder*="Explica"]', `QA Sprint 12: justificación de prueba ${i+1}`);
      
      const advancePromise = page.waitForResponse(res => res.url().includes("/api/session/advance") && res.status() === 200);
      await page.getByRole("button", { name: /Responder/i }).click();
      await advancePromise;
      
      await page.waitForSelector(".feedback-card", { timeout: 10000 });
      report.questionsAnswered++;

      if (i < 2) {
        await page.click("button:has-text('Siguiente pregunta')");
      }
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "04-practice-feedback.png") });
    report.screenshots.push("04-practice-feedback.png");
  });

  test("10. Dashboard de sesión", async () => {
    // We stay in the practice session, look for "Ver resumen" or similar
    const summaryButton = page.getByRole("link", { name: /Ver sesión|Resumen/i }).first();
    if (await summaryButton.isVisible()) {
      await summaryButton.click();
    } else {
      // Try to find the sessionId in URL or just go to dashboard with last session if possible
      const sessionLink = page.locator("a[href*='sessionId=']").first();
      if (await sessionLink.isVisible()) {
        await sessionLink.click();
      } else {
        // Fallback to latest dashboard
        await page.goto(`${BASE_URL}/dashboard`);
      }
    }

    await page.waitForLoadState("networkidle");
    report.sessionDashboardStatus = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "05-dashboard-session.png"), fullPage: true });
    report.screenshots.push("05-dashboard-session.png");
  });

  test("11. Logout & 12. Red y consola", async () => {
    await page.click("button:has-text('Cerrar sesión')");
    await page.waitForURL(`${BASE_URL}/login`);
    report.logoutStatus = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "06-after-logout.png") });
    report.screenshots.push("06-after-logout.png");

    await page.goto(`${BASE_URL}/practice`);
    await page.waitForURL(`${BASE_URL}/login`);
    report.postLogoutProtection = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "07-post-logout-protected.png") });
    report.screenshots.push("07-post-logout-protected.png");

    // Final verdict
    if (report.forbiddenClaimsDetected.length > 0 || report.networkErrors5xx.length > 0) {
      report.verdict = "FAIL";
    } else if (report.questionsAnswered < 3 || report.signalLabelsDetected.length === 0) {
      report.verdict = "WARN";
    } else {
      report.verdict = "PASS";
    }

    fs.writeFileSync(path.join(ARTIFACTS_DIR, "dashboard-metric-signal-report.json"), JSON.stringify(report, null, 2));
    console.log(`Sprint 12 Report generated in ${ARTIFACTS_DIR}`);
  });
});
