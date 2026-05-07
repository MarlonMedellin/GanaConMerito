import { test, expect, request } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.use({ storageState: "artifacts/auth-state.json" });

interface AuditReport {
  baseUrl: string;
  userState: string;
  pagesVisited: string[];
  finalUrls: Record<string, string>;
  questionTurns: number;
  totalQuestionsAnswered: number;
  optionCountsByTurn: number[];
  justificationFilledByTurn: boolean[];
  feedbackDetectedByTurn: boolean[];
  sessionApiResponses: {
    start: number | null;
    item: number | null;
    advance: number[];
  };
  dashboardStatus: string;
  logoutStatus: string;
  postLogoutProtectionStatus: string;
  internalLinksAudit: string[];
  brokenLinks: string[];
  textAuditFindings: string[];
  graphicAuditFindings: string[];
  networkErrors: any[];
  consoleErrors: string[];
  screenshots: string[];
  verdict: string;
  conclusion: string;
}

test.describe("GanaConMerito - Online UX & Flow Audit", () => {
  const artifactDir = path.join(process.cwd(), "artifacts", "online-authenticated-five-question-ux-audit");
  const reportPath = path.join(artifactDir, "online-five-question-ux-report.json");
  const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

  let report: AuditReport = {
    baseUrl: BASE_URL,
    userState: "Authenticated",
    pagesVisited: [],
    finalUrls: {},
    questionTurns: 0,
    totalQuestionsAnswered: 0,
    optionCountsByTurn: [],
    justificationFilledByTurn: [],
    feedbackDetectedByTurn: [],
    sessionApiResponses: { start: null, item: null, advance: [] },
    dashboardStatus: "Pending",
    logoutStatus: "Pending",
    postLogoutProtectionStatus: "Pending",
    internalLinksAudit: [],
    brokenLinks: [],
    textAuditFindings: [],
    graphicAuditFindings: [],
    networkErrors: [],
    consoleErrors: [],
    screenshots: [],
    verdict: "PENDING",
    conclusion: ""
  };

  test.beforeAll(async () => {
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
  });

  const captureScreenshot = async (page: any, filename: string) => {
    const fullPath = path.join(artifactDir, filename);
    await page.screenshot({ path: fullPath, fullPage: true });
    report.screenshots.push(fullPath);
  };

  const auditTexts = async (page: any, contextName: string) => {
    const bodyText = await page.locator("body").innerText();
    const suspiciousPatterns = [
      /gestion\s*·\s*lectura_de_indicadores/i,
      /_[a-z0-9]/, // snake_case heuristic
      /\bundefined\b/i,
      /\bnull\b/i,
      /\bNaN\b/,
      /\bnot-set\b/i,
      /\bunknown\b/i,
      /\bTODO\b/
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyText)) {
        // Extract a snippet around the match
        const match = bodyText.match(pattern);
        if (match && match.index !== undefined) {
          const start = Math.max(0, match.index - 30);
          const end = Math.min(bodyText.length, match.index + match[0].length + 30);
          const snippet = bodyText.substring(start, end).replace(/\n/g, " ");
          report.textAuditFindings.push(`[${contextName}] Suspicious text found matching ${pattern}: "...${snippet}..."`);
        }
      }
    }
  };

  const auditLinks = async (page: any) => {
    const links = await page.locator("a[href]").evaluateAll((elements: HTMLAnchorElement[]) => elements.map(e => e.href));
    for (const href of links) {
      if (href.startsWith(BASE_URL) && !report.internalLinksAudit.includes(href)) {
        report.internalLinksAudit.push(href);
      }
    }
  };

  const auditGraphics = async (page: any, contextName: string) => {
    const mainExists = await page.locator("main").count() > 0;
    if (!mainExists) report.graphicAuditFindings.push(`[${contextName}] <main> tag is missing.`);
    
    const h1Exists = await page.locator("h1").count() > 0;
    if (!h1Exists) report.graphicAuditFindings.push(`[${contextName}] <h1> tag is missing.`);
    
    // Check overflow
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (hasOverflow) report.graphicAuditFindings.push(`[${contextName}] Horizontal overflow detected.`);
    
    // Broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return imgs.filter(img => img.naturalWidth === 0 || img.naturalHeight === 0).map(img => img.src);
    });
    if (brokenImages.length > 0) report.graphicAuditFindings.push(`[${contextName}] Broken images: ${brokenImages.join(", ")}`);
  };

  test.afterAll(async () => {
    // Evaluate verdict
    const hasCriticalErrors =
      report.networkErrors.some((e) => e.status >= 500) ||
      report.brokenLinks.length > 0 ||
      report.logoutStatus !== "Success" ||
      report.postLogoutProtectionStatus !== "Protected" ||
      (report.sessionApiResponses.start ?? 0) >= 400 ||
      (report.sessionApiResponses.item ?? 0) >= 400;
    
    if (hasCriticalErrors || report.finalUrls["home"]?.includes("/login") || report.totalQuestionsAnswered === 0) {
      report.verdict = "FAIL";
    } else if (report.textAuditFindings.length > 0 || report.graphicAuditFindings.length > 0 || report.totalQuestionsAnswered < 5) {
      report.verdict = "WARN";
      if (report.totalQuestionsAnswered < 5) report.conclusion += "Sesión terminó antes de 5 preguntas. ";
      if (report.textAuditFindings.length > 0) report.conclusion += "Textos técnicos detectados. ";
    } else {
      report.verdict = "PASS";
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`[QA] Reporte guardado en: ${reportPath}`);
  });

  test("flujo completo de auditoría UX en producción", async ({ page, request }) => {
    // Intercepción de red y consola
    page.on("response", async (response) => {
      const url = response.url();
      const status = response.status();
      const req = response.request();
      const resourceType = req.resourceType();

      if (url.includes("/api/session/start")) report.sessionApiResponses.start = status;
      if (url.includes("/api/session/item")) report.sessionApiResponses.item = status;
      if (url.includes("/api/session/advance")) report.sessionApiResponses.advance.push(status);

      if (status >= 500) {
        report.networkErrors.push({ url, status });
      } else if (status >= 400) {
        const isCritical = ["document", "script", "stylesheet", "xhr", "fetch"].includes(resourceType) && 
                           !url.includes("favicon.ico") && !url.includes("google") && !url.includes("gstatic");
        if (isCritical) report.networkErrors.push({ url, status, type: "4xx Critical" });
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("google") && !msg.text().includes("analytics")) {
        report.consoleErrors.push(msg.text());
      }
    });

    // 1 & 2. /home
    console.log(`[QA] Auditando /home...`);
    await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle" });
    report.finalUrls["home"] = page.url();
    report.pagesVisited.push("/home");
    
    if (page.url().includes("/login")) throw new Error("Redirección a login desde /home");
    
    await auditTexts(page, "Home");
    await auditLinks(page);
    await auditGraphics(page, "Home");
    await captureScreenshot(page, "01-home.png");

    // 3. /practice
    console.log(`[QA] Auditando /practice...`);
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    report.finalUrls["practice"] = page.url();
    report.pagesVisited.push("/practice");
    
    await expect(page.getByText("Práctica", { exact: false }).first()).toBeVisible();
    await captureScreenshot(page, "02-practice-loaded.png");

    const startButton = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      console.log(`[QA] Esperando opciones de práctica...`);
      try {
        await page.waitForSelector(".option-card", { timeout: 30000 });
      } catch (e) {
        report.verdict = "FAIL";
        report.conclusion += "Timeout esperando .option-card tras iniciar práctica. ";
      }
    }

    // 4 & 5. Responder 5 preguntas
    for (let i = 1; i <= 5; i++) {
      console.log(`[QA] Turno de pregunta ${i}...`);
      await page.waitForTimeout(2000); // Dar tiempo a renderizar
      const options = page.locator(".option-card");
      const count = await options.count();
      
      if (count === 0) {
        console.log(`[QA] No se encontraron opciones en el turno ${i}. Terminando ciclo de preguntas.`);
        break; // Sesión terminada o error
      }
      
      report.questionTurns++;
      report.optionCountsByTurn.push(count);
      
      if (count < 2) report.graphicAuditFindings.push(`[Practice T${i}] Menos de 2 opciones encontradas.`);
      
      await auditTexts(page, `Practice Turno ${i}`);
      await captureScreenshot(page, `0${2 + i * 2 - 1}-question-0${i}.png`); // 03, 05, 07, 09, 11
      
      // Responder
      await options.first().click();
      
      const justificationInput = page.locator("textarea, input[placeholder*='justificación']").first();
      let justificationFilled = false;
      if (await justificationInput.isVisible()) {
        await justificationInput.fill(`QA turno ${i}: justifico mi selección para validar entrada de texto, flujo de respuesta y feedback.`);
        justificationFilled = true;
      }
      report.justificationFilledByTurn.push(justificationFilled);
      
      const responderBtn = page.getByRole("button", { name: /Responder|Enviar/i }).first();
      if (await responderBtn.isVisible()) {
        await responderBtn.click();
        
        // Esperar feedback
        await page.waitForTimeout(4000);
        
        const bodyTxt = await page.locator("body").innerText();
        const hasFeedback = bodyTxt.toLowerCase().includes("feedback") || bodyTxt.toLowerCase().includes("correcto") || bodyTxt.toLowerCase().includes("incorrecto");
        report.feedbackDetectedByTurn.push(hasFeedback);
        
        await auditTexts(page, `Feedback Turno ${i}`);
        await captureScreenshot(page, `0${2 + i * 2}-feedback-0${i}.png`); // 04, 06, 08, 10, 12
        
        report.totalQuestionsAnswered++;
        
        const nextBtn = page.getByRole("button", { name: /Siguiente/i }).first();
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
        } else {
           console.log(`[QA] No hay botón Siguiente. Fin de práctica.`);
           break;
        }
      } else {
        console.log(`[QA] Botón Responder no encontrado.`);
        break;
      }
    }

    // 6. /dashboard
    console.log(`[QA] Auditando /dashboard...`);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    report.finalUrls["dashboard"] = page.url();
    report.pagesVisited.push("/dashboard");
    
    if (page.url().includes("/login")) {
      report.dashboardStatus = "Redirected to Login";
    } else {
      report.dashboardStatus = "Success";
      await auditTexts(page, "Dashboard");
      await auditLinks(page);
      await auditGraphics(page, "Dashboard");
      await captureScreenshot(page, "13-dashboard.png");
    }

    // 7. Test Internal Links
    console.log(`[QA] Verificando enlaces internos rotos (${report.internalLinksAudit.length})...`);
    for (const link of report.internalLinksAudit) {
      try {
        const res = await request.get(link);
        if (!res.ok()) report.brokenLinks.push(`${link} (Status: ${res.status()})`);
      } catch (e) {
        report.brokenLinks.push(`${link} (Fetch Error)`);
      }
    }

    // 9. Logout
    console.log(`[QA] Ejecutando Logout...`);
    const logoutBtn = page.getByRole("button", { name: /Cerrar sesión/i }).or(page.locator("text=Cerrar sesión")).first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click({ force: true });
      try {
        await Promise.race([
          page.waitForURL(/.*login/, { timeout: 45000 }),
          page.waitForSelector("text=Continuar con Google", { timeout: 45000 })
        ]);
        report.logoutStatus = "Success";
      } catch (e) {
        report.logoutStatus = "Failed/Timeout";
      }
    } else {
      report.logoutStatus = "Button Not Found";
    }
    
    await captureScreenshot(page, "14-after-logout.png");

    console.log(`[QA] Verificando protección post-logout...`);
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    if (page.url().includes("/login")) {
      report.postLogoutProtectionStatus = "Protected";
    } else {
      report.postLogoutProtectionStatus = "Vulnerable";
    }
    await captureScreenshot(page, "15-post-logout-practice.png");
  });
});
