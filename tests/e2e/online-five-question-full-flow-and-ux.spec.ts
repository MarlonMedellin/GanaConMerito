import { test, expect, request as playwrightRequest, ConsoleMessage } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_STATE_PATH = "artifacts/auth-state.json";
test.use({ storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined });

interface AuditReport {
  verdict: string;
  questionsAnswered: number;
  turns: any[];
  sessionRepeats: any[];
  dashboard: string;
  logout: string;
  postLogoutProtection: string;
  links: { total: number; broken: string[] };
  textFindings: any[];
  visualFindings: any[];
  apiPayloads: any[];
  errors: { network: any[]; console: string[] };
  metadata: {
    evaluationSource: string | null;
    evaluationVersion: string | null;
  };
  conclusion: string;
}

test.describe("GanaConMerito - Full Flow & UX Audit", () => {
  test.setTimeout(180000);
  const artifactDir = path.join(process.cwd(), "artifacts", "online-five-question-full-flow-and-ux");
  const reportPath = path.join(artifactDir, "online-five-question-full-flow-report.json");
  const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

  let report: AuditReport = {
    verdict: "PENDING",
    questionsAnswered: 0,
    turns: [],
    sessionRepeats: [],
    dashboard: "Pending",
    logout: "Pending",
    postLogoutProtection: "Pending",
    links: { total: 0, broken: [] },
    textFindings: [],
    visualFindings: [],
    apiPayloads: [],
    errors: { network: [], console: [] },
    metadata: { evaluationSource: null, evaluationVersion: null },
    conclusion: ""
  };

  test.beforeAll(async () => {
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  });

  const captureScreenshot = async (page: any, filename: string) => {
    const fullPath = path.join(artifactDir, filename);
    await page.screenshot({ path: fullPath, fullPage: true });
    return fullPath;
  };

  const auditTexts = async (page: any, screen: string) => {
    const bodyText = await page.locator("body").innerText();
    const patterns = [
      { regex: /gestion\s*·\s*lectura_de_indicadores/i, suggest: "Gestión · Lectura de indicadores" },
      { regex: /_[a-z0-9]/, suggest: "Humanizar snake_case" },
      { regex: /\b(undefined|null|NaN|not-set|unknown)\b/i, suggest: "Evitar valores técnicos" }
    ];

    for (const p of patterns) {
      if (p.regex.test(bodyText)) {
        const match = bodyText.match(p.regex);
        const snippet = bodyText.substring(Math.max(0, match!.index! - 20), Math.min(bodyText.length, match!.index! + 40)).replace(/\n/g, " ");
        report.textFindings.push({
          screen,
          text: snippet,
          severity: "medium",
          suggestion: p.suggest
        });
      }
    }
  };

  const auditVisual = async (page: any, screen: string) => {
    const main = await page.locator("main").count();
    const h1 = await page.locator("h1").count();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    
    if (main === 0) report.visualFindings.push({ screen, issue: "Missing <main> tag" });
    if (h1 === 0) report.visualFindings.push({ screen, issue: "Missing <h1> tag" });
    if (overflow) report.visualFindings.push({ screen, issue: "Horizontal overflow detected" });
  };

  test.afterAll(async () => {
    // Verdict Logic
    const criticalFail = report.errors.network.some(n => n.status >= 500) || report.logout === "FAIL" || report.postLogoutProtection === "FAIL";
    if (criticalFail || report.questionsAnswered === 0) {
      report.verdict = "FAIL";
    } else if (report.textFindings.length > 0 || report.questionsAnswered < 5) {
      report.verdict = "WARN";
    } else {
      report.verdict = "PASS";
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(artifactDir, "session-api-payloads.json"), JSON.stringify(report.apiPayloads, null, 2));
    fs.writeFileSync(path.join(artifactDir, "text-audit-findings.json"), JSON.stringify(report.textFindings, null, 2));
  });

  test("flujo completo y auditoría UX profunda", async ({ page, request }) => {
    // Intercepción
    page.on("response", async (res) => {
      const url = res.url();
      if (url.includes("/api/session/")) {
        try {
          const body = await res.json();
          report.apiPayloads.push({ url, status: res.status(), body, timestamp: new Date().toISOString() });
          if (body.evaluationSource) report.metadata.evaluationSource = body.evaluationSource;
          if (body.evaluationVersion) report.metadata.evaluationVersion = body.evaluationVersion;
        } catch (e) {}
      }
      if (res.status() >= 400 && !url.includes("google") && !url.includes("favicon")) {
        report.errors.network.push({ url, status: res.status() });
      }
    });

    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error" && !msg.text().includes("google")) report.errors.console.push(msg.text());
    });

    // 1. /home
    console.log("[QA] Paso 1: /home");
    await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle" });
    if (page.url().includes("/login")) throw new Error("Redirected to login from /home");
    await auditTexts(page, "Home");
    await auditVisual(page, "Home");
    await captureScreenshot(page, "01-home.png");

    // 2. /practice
    console.log("[QA] Paso 2: /practice");
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    await expect(page.getByText("Práctica").first()).toBeVisible();
    await captureScreenshot(page, "02-practice-init.png");
    
    const startBtn = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startBtn.isVisible()) await startBtn.click();

    // 3. 5 Preguntas
    for (let i = 1; i <= 5; i++) {
      console.log(`[QA] Pregunta ${i}...`);
      await page.waitForSelector(".option-card", { timeout: 30000 });
      
      const qText = await page.locator("main").innerText();
      const options = page.locator(".option-card");
      const optCount = await options.count();
      
      const lastApi = report.apiPayloads[report.apiPayloads.length - 1];
      const currentItemId = lastApi?.body?.id || lastApi?.body?.currentItemId || "unknown";

      report.turns.push({
        turn: i,
        itemId: currentItemId,
        options: optCount,
        textSnippet: qText.substring(0, 100)
      });

      await auditTexts(page, `Practice Q${i}`);
      await captureScreenshot(page, `03-q${i}-loaded.png`);

      // Responder
      await options.first().click();
      const justInput = page.locator("textarea, input[placeholder*='justificación']").first();
      if (await justInput.isVisible()) {
        await justInput.fill(`QA turno ${i}: justifico mi selección para validar flujo completo.`);
      }
      
      const respBtn = page.getByRole("button", { name: /Responder/i });
      await respBtn.click();
      
      // Esperar feedback y botón Siguiente
      const startTime = Date.now();
      const nextBtn = page.getByRole("button", { name: /Siguiente/i });
      
      await page.waitForTimeout(2000); // Mínimo visual
      let nextVisible = false;
      try {
        await nextBtn.waitFor({ state: "visible", timeout: 15000 });
        nextVisible = true;
      } catch (e) {
        console.log(`[QA] Siguiente no apareció en turno ${i} tras 15s`);
      }
      
      const timeToNext = Date.now() - startTime;
      report.turns[i-1].timeToNext = timeToNext;
      report.turns[i-1].nextVisible = nextVisible;
      
      await auditTexts(page, `Feedback Q${i}`);
      await captureScreenshot(page, `04-q${i}-feedback.png`);
      
      report.questionsAnswered++;

      if (nextVisible) {
        await nextBtn.click();
        await page.waitForTimeout(2000); // Delay para carga de siguiente
      } else {
        console.log("[QA] Terminando flujo por falta de botón Siguiente.");
        break;
      }
    }

    // 6. Dashboard
    console.log("[QA] Paso 6: Dashboard");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    report.dashboard = page.url().includes("/login") ? "FAIL" : "OK";
    await auditTexts(page, "Dashboard");
    await captureScreenshot(page, "13-dashboard.png");

    // 7. Enlaces
    const links = await page.locator("a[href]").evaluateAll((els: HTMLAnchorElement[]) => els.map(e => e.href));
    report.links.total = links.length;
    for (const l of links.filter(h => h.startsWith(BASE_URL)).slice(0, 5)) { // Limit to 5 for speed
      const res = await request.get(l);
      if (!res.ok()) report.links.broken.push(`${l} (${res.status()})`);
    }

    // 10. Repetición (antes de logout final)
    console.log("[QA] Paso 10: Verificando repetición...");
    for (let j = 1; j <= 2; j++) {
      await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
      const sBtn = page.getByRole("button", { name: /Iniciar práctica/i });
      if (await sBtn.isVisible()) await sBtn.click();
      await page.waitForSelector(".option-card", { timeout: 10000 });
      const lastStart = report.apiPayloads.filter(p => p.url.includes("/start")).pop();
      report.sessionRepeats.push({
        attempt: j,
        sessionId: lastStart?.body?.sessionId,
        itemId: lastStart?.body?.currentItemId
      });
    }

    // 9. Logout
    console.log("[QA] Paso 9: Logout");
    const lBtn = page.getByRole("button", { name: /Cerrar sesión/i }).or(page.locator("text=Cerrar sesión")).first();
    if (await lBtn.isVisible()) {
      await lBtn.click({ force: true });
      try {
        await page.waitForURL(/.*login/, { timeout: 30000 });
        report.logout = "OK";
      } catch (e) {
        report.logout = "FAIL";
      }
    }
    await captureScreenshot(page, "14-logout.png");

    // Protección
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    report.postLogoutProtection = page.url().includes("/login") ? "OK" : "FAIL";
    await captureScreenshot(page, "15-protection.png");
  });
});
