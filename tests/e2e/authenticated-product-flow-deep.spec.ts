import { test, expect, request } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_STATE_PATH = "artifacts/auth-state.json";
test.use({ storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined });

interface AuditReport {
  baseUrl: string;
  finalUrls: Record<string, string>;
  states: Record<string, string>;
  apiCalls: any[];
  sessionStartStatus: number | null;
  sessionItemStatus: number | null;
  sessionAdvanceStatus: number | null;
  optionCardCount: number;
  bodyTextAfterStart: string;
  hasFeedback: boolean;
  dashboardResult: string;
  logoutResult: string;
  protectionPostLogout: string;
  errors5xx: any[];
  errors4xxCritical: any[];
  warningsNonCritical: any[];
  consoleErrors: string[];
  cookieBeforeLogout: string;
  cookieAfterLogout: string;
  screenshots: string[];
  verdict: string;
  conclusion: string;
}

test.describe("GanaConMerito - Deep Product Flow Audit", () => {
  const artifactDir = path.join(process.cwd(), "artifacts", "authenticated-product-flow-deep");
  const reportPath = path.join(artifactDir, "product-flow-report.json");
  const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

  let report: AuditReport = {
    baseUrl: BASE_URL,
    finalUrls: {},
    states: {},
    apiCalls: [],
    sessionStartStatus: null,
    sessionItemStatus: null,
    sessionAdvanceStatus: null,
    optionCardCount: 0,
    bodyTextAfterStart: "",
    hasFeedback: false,
    dashboardResult: "Pending",
    logoutResult: "Pending",
    protectionPostLogout: "Pending",
    errors5xx: [],
    errors4xxCritical: [],
    warningsNonCritical: [],
    consoleErrors: [],
    cookieBeforeLogout: "",
    cookieAfterLogout: "",
    screenshots: [],
    verdict: "PENDING",
    conclusion: ""
  };

  test.beforeAll(async () => {
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
  });

  test.afterAll(async () => {
    // Calcular veredicto final
    if (report.verdict === "PENDING") {
      const hasCritical4xx = report.errors4xxCritical.length > 0;
      const has5xx = report.errors5xx.length > 0;
      const practiceLoaded = report.states["practice"] === "Success";
      const logoutSuccess = report.logoutResult === "Success";
      const protectionSuccess = report.protectionPostLogout === "Protected";

      if (has5xx || hasCritical4xx || !practiceLoaded || !logoutSuccess || !protectionSuccess) {
        report.verdict = "FAIL";
      } else if (report.optionCardCount === 0) {
        report.verdict = "WARN";
        report.conclusion = "Login y navegación funcionan, pero no aparecen .option-card. Verificar estado de la sesión o banco de preguntas.";
      } else {
        report.verdict = "PASS";
      }
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`[QA] Reporte guardado en: ${reportPath}`);
  });

  test("flujo completo de auditoría de producto", async ({ page }) => {
    // Intercepción de red y consola
    page.on("response", async (response) => {
      const url = response.url();
      const status = response.status();
      const request = response.request();
      const resourceType = request.resourceType();

      // Capturar llamadas de API
      if (url.includes("/api/")) {
        report.apiCalls.push({ url, status, method: request.method() });
        if (url.includes("/api/session/start")) report.sessionStartStatus = status;
        if (url.includes("/api/session/item")) report.sessionItemStatus = status;
        if (url.includes("/api/session/advance")) report.sessionAdvanceStatus = status;
      }

      // Capturar errores
      if (status >= 500) {
        report.errors5xx.push({ url, status });
      } else if (status >= 400) {
        const isCritical = ["document", "script", "stylesheet", "xhr", "fetch"].includes(resourceType) && 
                           !url.includes("favicon.ico") && 
                           !url.includes("google") && 
                           !url.includes("gstatic");
        
        if (isCritical) {
          report.errors4xxCritical.push({ url, status });
        } else {
          report.warningsNonCritical.push({ url, status });
        }
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (!text.includes("google") && !text.includes("analytics")) {
          report.consoleErrors.push(text);
        }
      }
    });

    // 1. /home
    console.log(`[QA] Navegando a /home...`);
    await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle" });
    report.finalUrls["home"] = page.url();
    if (page.url().includes("/login")) {
      report.states["home"] = "Redirected to Login";
      report.verdict = "FAIL";
      throw new Error("Redirección inesperada a login desde /home");
    }
    report.states["home"] = "Success";
    const homeShot = path.join(artifactDir, "01-home.png");
    await page.screenshot({ path: homeShot, fullPage: true });
    report.screenshots.push(homeShot);

    // 2. /practice
    console.log(`[QA] Navegando a /practice...`);
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    report.finalUrls["practice"] = page.url();
    if (page.url().includes("/login")) {
      report.states["practice"] = "Redirected to Login";
      report.verdict = "FAIL";
      throw new Error("Redirección inesperada a login desde /practice");
    }
    
    await expect(page.getByText("Práctica", { exact: false }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/Pregunta, decide y revisa feedback/i);
    report.states["practice"] = "Success";
    
    const startButton = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startButton.isVisible()) {
      console.log(`[QA] Haciendo clic en 'Iniciar práctica'...`);
      await startButton.click();
      
      // Esperar hasta 20s por .option-card
      try {
        await page.waitForSelector(".option-card", { timeout: 20000 });
      } catch (e) {
        console.log(`[QA] No se encontraron .option-card tras 20s.`);
      }
      
      report.optionCardCount = await page.locator(".option-card").count();
      report.bodyTextAfterStart = (await page.locator("body").innerText()).substring(0, 1000);
      
      const practiceShot = path.join(artifactDir, "02-practice-started.png");
      await page.screenshot({ path: practiceShot, fullPage: true });
      report.screenshots.push(practiceShot);

      // 3. Interactuar si hay opciones
      if (report.optionCardCount > 0) {
        console.log(`[QA] Interactuando con opciones...`);
        await page.locator(".option-card").first().click();
        
        const justification = page.locator("textarea, input[placeholder*='justificación']").first();
        if (await justification.isVisible()) {
          await justification.fill("Prueba de QA automatizada - flujo profundo.");
        }
        
        const responderBtn = page.getByRole("button", { name: /Responder|Enviar/i }).first();
        if (await responderBtn.isVisible()) {
          await responderBtn.click();
          await page.waitForTimeout(3000); // Esperar feedback
          report.hasFeedback = (await page.locator("body").innerText()).toLowerCase().includes("feedback") || 
                                (await page.locator("body").innerText()).toLowerCase().includes("correcto") ||
                                (await page.locator("body").innerText()).toLowerCase().includes("incorrecto");
          
          const interactionShot = path.join(artifactDir, "03-practice-interaction.png");
          await page.screenshot({ path: interactionShot, fullPage: true });
          report.screenshots.push(interactionShot);
        }
      }
    } else {
      console.log(`[QA] Botón 'Iniciar práctica' no visible, asumiendo sesión activa.`);
      report.optionCardCount = await page.locator(".option-card").count();
    }

    // 4. /dashboard
    console.log(`[QA] Navegando a /dashboard...`);
    // Intentar encontrar link en nav o ir directo
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    report.finalUrls["dashboard"] = page.url();
    if (page.url().includes("/login")) {
      report.dashboardResult = "Redirected to Login";
    } else {
      const dashTitle = page.locator("h1, h2, .text-2xl").filter({ hasText: /Dashboard|Insights|Estadísticas/i }).first();
      if (await dashTitle.isVisible()) {
        report.dashboardResult = "Success";
      } else {
        report.dashboardResult = "Loaded but title not found";
      }
    }
    const dashShot = path.join(artifactDir, "04-dashboard.png");
    await page.screenshot({ path: dashShot, fullPage: true });
    report.screenshots.push(dashShot);

    // 5. Logout - Auditoría Profunda
    console.log(`[QA] Iniciando Auditoría de Logout...`);
    
    // Capturar cookies antes
    report.cookieBeforeLogout = await page.evaluate(() => document.cookie);
    console.log(`[QA] Cookies antes del logout detectadas.`);

    const logoutBtn = page.getByRole("button", { name: /Cerrar sesión/i }).or(page.locator("text=Cerrar sesión")).first();
    
    if (await logoutBtn.isVisible()) {
      console.log(`[QA] Botón de logout visible. Realizando click...`);
      await logoutBtn.click({ force: true });
      
      // Esperar a que el estado cambie a "Saliendo..."
      try {
        await expect(page.locator("body")).toContainText(/Saliendo/i, { timeout: 5000 });
        console.log(`[QA] Estado 'Saliendo...' detectado.`);
      } catch (e) {
        console.log(`[QA] No se detectó cambio visual a 'Saliendo...' inmediatamente.`);
      }

      // Captura durante el proceso de salida
      const exitingShot = path.join(artifactDir, "05a-exiting-state.png");
      await page.screenshot({ path: exitingShot, fullPage: true });
      report.screenshots.push(exitingShot);

      console.log(`[QA] Esperando redirección definitiva (30s)...`);
      try {
        await Promise.race([
          page.waitForURL(/.*login/, { timeout: 30000 }),
          page.waitForSelector("text=Continuar con Google", { timeout: 30000 })
        ]);
        console.log(`[QA] Redirección detectada con éxito.`);
      } catch (e: any) {
        console.log(`[QA] TIMEOUT: No hubo redirección a login tras 30s.`);
      }
    } else {
      console.log(`[QA] CRÍTICO: Botón de logout no encontrado para click.`);
      report.logoutResult = "Button not found";
    }

    // Capturar cookies después (independiente de si hubo redirect)
    report.cookieAfterLogout = await page.evaluate(() => document.cookie);
    
    report.finalUrls["logout"] = page.url();
    const isAtLogin = page.url().includes("/login") || await page.getByText(/Continuar con Google/i).isVisible();
    
    if (isAtLogin) {
      report.logoutResult = "Success";
    } else {
      const sessionStillExists = report.cookieAfterLogout.includes("next-auth.session-token") || 
                                report.cookieAfterLogout.includes("supabase-auth-token") ||
                                report.cookieAfterLogout.length > 20;
      
      report.logoutResult = `Failed (Current URL: ${page.url()})`;
      report.conclusion += sessionStillExists ? " | La sesión persiste en las cookies." : " | Cookies parecen limpias pero la URL no cambió.";
    }
    
    const logoutShot = path.join(artifactDir, "05b-after-logout-attempt.png");
    await page.screenshot({ path: logoutShot, fullPage: true });
    report.screenshots.push(logoutShot);

    // 6. Protección post-logout
    console.log(`[QA] Verificando protección post-logout...`);
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    if (page.url().includes("/login")) {
      report.protectionPostLogout = "Protected";
    } else {
      report.protectionPostLogout = `Vulnerable (Practice still accessible at ${page.url()})`;
      console.log(`[QA] ALERTA: Acceso concedido a /practice tras intento de logout.`);
    }
    const protectionShot = path.join(artifactDir, "06-protection-check.png");
    await page.screenshot({ path: protectionShot, fullPage: true });
    report.screenshots.push(protectionShot);
  });
});
