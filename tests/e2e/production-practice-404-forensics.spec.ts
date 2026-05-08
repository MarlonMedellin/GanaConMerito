import { test, expect, Request, ConsoleMessage, TestInfo, Response } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT ?? "";

type PlaywrightResponse = {
  source: "playwright";
  method: string;
  url: string;
  status: number;
  resourceType: string;
};

type PlaywrightFailedRequest = {
  source: "playwright";
  method: string;
  url: string;
  resourceType: string;
  errorText: string;
};

type ConsoleError = {
  type: string;
  text: string;
  location: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
};

type CdpRequest = {
  requestId: string;
  url: string;
  method?: string;
  type?: string;
  status?: number;
  mimeType?: string;
  initiator?: unknown;
  failed?: boolean;
  blockedReason?: string;
  errorText?: string;
};

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function sameDomain(url: string) {
  return url.startsWith(BASE_URL);
}

function classify404(entry: { url: string; status?: number; resourceType?: string; type?: string; mimeType?: string }) {
  const url = entry.url.toLowerCase();
  const kind = (entry.resourceType ?? entry.type ?? "").toLowerCase();
  const mime = (entry.mimeType ?? "").toLowerCase();

  if (entry.status !== 404) return "not-404";

  if (
    sameDomain(entry.url) &&
    (
      kind === "document" ||
      kind === "script" ||
      kind === "stylesheet" ||
      kind === "xhr" ||
      kind === "fetch" ||
      url.includes("/api/") ||
      url.includes("/_next/")
    )
  ) {
    return "critical";
  }

  if (
    url.includes("favicon") ||
    url.endsWith(".ico") ||
    url.endsWith(".png") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".webp") ||
    url.endsWith(".svg") ||
    url.endsWith(".map") ||
    kind === "image" ||
    kind === "font" ||
    mime.startsWith("image/") ||
    mime.includes("font")
  ) {
    return "warning";
  }

  if (
    url.includes("google") ||
    url.includes("gstatic") ||
    url.includes("googleapis") ||
    url.includes("analytics")
  ) {
    return "third-party-warning";
  }

  return sameDomain(entry.url) ? "unknown-same-domain" : "unknown-third-party";
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

test.describe("Forense 404 producción /practice", () => {
  test("identifica URL, tipo e iniciador del 404 fantasma", async ({ page }, testInfo: TestInfo) => {
    const artifactDir = path.join(process.cwd(), "artifacts", "production-practice-404-forensics");
    ensureDir(artifactDir);

    const playwrightResponses: PlaywrightResponse[] = [];
    const playwrightFailedRequests: PlaywrightFailedRequest[] = [];
    const consoleErrors: ConsoleError[] = [];
    const cdpRequests = new Map<string, CdpRequest>();

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");

    cdp.on("Network.requestWillBeSent", (event) => {
      cdpRequests.set(event.requestId, {
        requestId: event.requestId,
        url: event.request.url,
        method: event.request.method,
        type: event.type,
        initiator: event.initiator,
      });
    });

    cdp.on("Network.responseReceived", (event) => {
      const current = cdpRequests.get(event.requestId) ?? {
        requestId: event.requestId,
        url: event.response.url,
      };

      cdpRequests.set(event.requestId, {
        ...current,
        url: event.response.url,
        type: event.type,
        status: event.response.status,
        mimeType: event.response.mimeType,
      });
    });

    cdp.on("Network.loadingFailed", (event) => {
      const current = cdpRequests.get(event.requestId) ?? {
        requestId: event.requestId,
        url: "unknown",
      };

      cdpRequests.set(event.requestId, {
        ...current,
        failed: true,
        blockedReason: event.blockedReason,
        errorText: event.errorText,
      });
    });

    page.on("response", (response: Response) => {
      const request = response.request();

      playwrightResponses.push({
        source: "playwright",
        method: request.method(),
        url: response.url(),
        status: response.status(),
        resourceType: request.resourceType(),
      });
    });

    page.on("requestfailed", (request: Request) => {
      playwrightFailedRequests.push({
        source: "playwright",
        method: request.method(),
        url: request.url(),
        resourceType: request.resourceType(),
        errorText: request.failure()?.errorText ?? "request failed",
      });
    });

    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
        });
      }
    });

    await page.goto(`${BASE_URL}/practice`, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
      // En producción puede haber conexiones externas persistentes.
    });

    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    const bodyText = await page.locator("body").innerText({ timeout: 15_000 });
    const commit = extractCommit(bodyText);

    const screenshotPath = path.join(artifactDir, "practice-404-forensics.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const cdpAll = Array.from(cdpRequests.values());

    const playwright404 = playwrightResponses
      .filter((entry) => entry.status === 404)
      .map((entry) => ({
        ...entry,
        classification: classify404(entry),
      }));

    const cdp404 = cdpAll
      .filter((entry) => entry.status === 404)
      .map((entry) => ({
        ...entry,
        classification: classify404(entry),
      }));

    const sameDomain5xx = playwrightResponses.filter(
      (entry) => sameDomain(entry.url) && entry.status >= 500
    );

    const critical404 = [
      ...playwright404.filter((entry) => entry.classification === "critical"),
      ...cdp404.filter((entry) => entry.classification === "critical"),
    ];

    const unknown404 = [
      ...playwright404.filter((entry) => entry.classification.startsWith("unknown")),
      ...cdp404.filter((entry) => entry.classification.startsWith("unknown")),
    ];

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

    const possibleLeak =
      detectedState === "login" &&
      (
        bodyText.includes("Iniciar práctica") ||
        bodyText.includes("Pregunta, decide y revisa feedback.") ||
        bodyText.includes("Justificación opcional") ||
        bodyText.includes("Responder")
      );

    const report = {
      startedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      targetUrl: `${BASE_URL}/practice`,
      finalUrl,
      detectedState,
      commit,
      expectedCommit: EXPECTED_COMMIT || null,
      screenshotPath,
      summary: {
        playwrightResponses: playwrightResponses.length,
        cdpRequests: cdpAll.length,
        playwright404: playwright404.length,
        cdp404: cdp404.length,
        sameDomain5xx: sameDomain5xx.length,
        critical404: critical404.length,
        unknown404: unknown404.length,
        failedRequests: playwrightFailedRequests.length,
        consoleErrors: consoleErrors.length,
        possiblePrivateLeak: possibleLeak,
      },
      playwright404,
      cdp404,
      critical404,
      unknown404,
      sameDomain5xx,
      playwrightFailedRequests,
      consoleErrors,
      cdpFailed: cdpAll.filter((entry) => entry.failed),
      bodyPreview: bodyText.slice(0, 2000),
      finishedAt: new Date().toISOString(),
    };

    const reportPath = path.join(artifactDir, "practice-404-forensics-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    await testInfo.attach("practice-404-forensics-report", {
      path: reportPath,
      contentType: "application/json",
    });

    await testInfo.attach("practice-404-forensics-screenshot", {
      path: screenshotPath,
      contentType: "image/png",
    });

    console.log(JSON.stringify({
      finalUrl,
      detectedState,
      commit,
      playwright404,
      cdp404,
      critical404,
      unknown404,
      consoleErrors,
      reportPath,
      screenshotPath,
    }, null, 2));

    expect(detectedState, `Estado inesperado. URL final: ${finalUrl}`).not.toBe("unknown");

    expect(possibleLeak, "Se detectó posible fuga de contenido privado de práctica en estado login.").toBeFalsy();

    expect(
      sameDomain5xx,
      `Errores 5xx en dominio propio:\n${JSON.stringify(sameDomain5xx, null, 2)}`
    ).toEqual([]);

    expect(
      critical404,
      `404 crítico detectado:\n${JSON.stringify(critical404, null, 2)}`
    ).toEqual([]);

    if (EXPECTED_COMMIT) {
      expect(commit, "No se encontró commit visible para comparar.").toBeTruthy();
      expect(
        commit?.startsWith(EXPECTED_COMMIT.slice(0, 7)),
        `Commit visible ${commit} no coincide con esperado ${EXPECTED_COMMIT}`
      ).toBeTruthy();
    }
  });
});
