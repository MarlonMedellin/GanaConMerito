import { test, expect, Request, Response, ConsoleMessage, TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://ganaconmerito.com";
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT ?? "";

type NetworkEntry = {
  method: string;
  url: string;
  status: number;
  resourceType: string;
};

type FailedRequest = {
  method: string;
  url: string;
  resourceType: string;
  errorText: string;
};

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function isSameDomain(url: string) {
  return url.startsWith(BASE_URL);
}

function isCritical4xx(entry: NetworkEntry) {
  if (entry.status < 400 || entry.status >= 500) return false;

  const url = entry.url;
  const type = entry.resourceType;

  return (
    type === "document" ||
    type === "script" ||
    type === "stylesheet" ||
    type === "xhr" ||
    type === "fetch" ||
    url.includes("/api/") ||
    url.includes("/_next/")
  );
}

function isProbablyNonCritical4xx(entry: NetworkEntry) {
  if (entry.status < 400 || entry.status >= 500) return false;

  const url = entry.url.toLowerCase();
  const type = entry.resourceType;

  return (
    type === "image" ||
    type === "font" ||
    url.includes("favicon") ||
    url.endsWith(".ico") ||
    url.endsWith(".png") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".webp") ||
    url.endsWith(".svg")
  );
}

function extractCommit(text: string) {
  const patterns = [
    /Commit desplegado:\s*([a-f0-9]{7,40})/i,
    /Build\s*:\s*([a-f0-9]{7,40})/i,
    /commit[^\n\r]{0,80}?([a-f0-9]{7,40})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

test.describe("Contrato producción /practice", () => {
  test("valida auth boundary, metadata y severidad de errores", async ({ page }, testInfo: TestInfo) => {
    const artifactDir = path.join(process.cwd(), "artifacts", "production-practice-contract");
    ensureDir(artifactDir);

    const network: NetworkEntry[] = [];
    const failedRequests: FailedRequest[] = [];
    const consoleErrors: string[] = [];

    page.on("response", (response: Response) => {
      const request = response.request();
      const url = response.url();

      if (!isSameDomain(url)) return;

      network.push({
        method: request.method(),
        url,
        status: response.status(),
        resourceType: request.resourceType(),
      });
    });

    page.on("requestfailed", (request: Request) => {
      const url = request.url();

      if (!isSameDomain(url)) return;

      failedRequests.push({
        method: request.method(),
        url,
        resourceType: request.resourceType(),
        errorText: request.failure()?.errorText ?? "request failed",
      });
    });

    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const startedAt = new Date().toISOString();

    await page.goto(`${BASE_URL}/practice`, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
      // En producción puede haber conexiones de terceros; no se falla solo por networkidle.
    });

    const finalUrl = page.url();
    const bodyText = await page.locator("body").innerText({ timeout: 15_000 });

    const screenshotPath = path.join(artifactDir, "practice-contract.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const isLogin =
      finalUrl.includes("/login") ||
      bodyText.includes("Continuar con Google") ||
      bodyText.includes("Acceso seguro");

    const isOnboarding =
      finalUrl.includes("/onboarding") ||
      bodyText.toLowerCase().includes("onboarding") ||
      bodyText.includes("Guardar onboarding");

    const isPractice =
      bodyText.includes("Pregunta, decide y revisa feedback.") ||
      bodyText.includes("Iniciar práctica") ||
      bodyText.includes("Sesión real");

    const detectedState = isLogin
      ? "login"
      : isOnboarding
        ? "onboarding"
        : isPractice
          ? "practice"
          : "unknown";

    const commit = extractCommit(bodyText);

    const serverErrors = network.filter((entry) => entry.status >= 500);
    const critical4xx = network.filter(isCritical4xx);
    const nonCritical4xx = network.filter(isProbablyNonCritical4xx);

    const ignoredConsolePatterns = [
      /favicon/i,
      /google/i,
      /gstatic/i,
      /analytics/i,
      /chrome-extension/i,
      /third-party/i,
    ];

    const criticalConsoleErrors = consoleErrors.filter(
      (error) => !ignoredConsolePatterns.some((pattern) => pattern.test(error))
    );

    const report = {
      startedAt,
      finishedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      targetUrl: `${BASE_URL}/practice`,
      finalUrl,
      detectedState,
      commit,
      expectedCommit: EXPECTED_COMMIT || null,
      counts: {
        networkTotal: network.length,
        serverErrors: serverErrors.length,
        critical4xx: critical4xx.length,
        nonCritical4xx: nonCritical4xx.length,
        failedRequests: failedRequests.length,
        consoleErrors: consoleErrors.length,
        criticalConsoleErrors: criticalConsoleErrors.length,
      },
      serverErrors,
      critical4xx,
      nonCritical4xx,
      failedRequests,
      consoleErrors,
      criticalConsoleErrors,
      bodyPreview: bodyText.slice(0, 2000),
      screenshotPath,
    };

    const reportPath = path.join(artifactDir, "practice-contract-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    await testInfo.attach("practice-contract-report", {
      path: reportPath,
      contentType: "application/json",
    });

    await testInfo.attach("practice-contract-screenshot", {
      path: screenshotPath,
      contentType: "image/png",
    });

    expect(
      detectedState,
      `Estado inesperado al abrir /practice.
URL final: ${finalUrl}
Texto visible:
${bodyText.slice(0, 1500)}`
    ).not.toBe("unknown");

    if (detectedState === "login") {
      await expect(page.getByRole("heading", { name: /GanaConMerito/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Continuar con Google/i })).toBeVisible();

      expect(
        bodyText.includes("Iniciar práctica"),
        "Un usuario no autenticado no debería ver el botón Iniciar práctica."
      ).toBeFalsy();

      expect(
        await page.locator("button.option-card").count(),
        "Un usuario no autenticado no debería ver opciones de pregunta."
      ).toBe(0);
    }

    if (detectedState === "practice") {
      await expect(page.locator("body")).toContainText(/Práctica|Pregunta, decide y revisa feedback/i);
    }

    if (EXPECTED_COMMIT) {
      expect(
        commit,
        `No se encontró commit visible para comparar con EXPECTED_COMMIT=${EXPECTED_COMMIT}`
      ).toBeTruthy();

      expect(
        commit?.startsWith(EXPECTED_COMMIT.slice(0, 7)),
        `Commit visible (${commit}) no coincide con EXPECTED_COMMIT (${EXPECTED_COMMIT})`
      ).toBeTruthy();
    } else {
      expect(
        commit,
        "No se encontró metadata de commit visible. Esto reduce trazabilidad operativa."
      ).toBeTruthy();
    }

    expect(serverErrors, `Errores HTTP 5xx:\n${JSON.stringify(serverErrors, null, 2)}`).toEqual([]);

    expect(
      critical4xx,
      `Errores 4xx críticos detectados:\n${JSON.stringify(critical4xx, null, 2)}`
    ).toEqual([]);

    expect(
      criticalConsoleErrors,
      `Errores críticos de consola:\n${criticalConsoleErrors.join("\n")}`
    ).toEqual([]);
  });
});
