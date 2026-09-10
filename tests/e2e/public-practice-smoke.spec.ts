import { test, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

test.describe("Smoke E2E público - /practice", () => {
  test("practice responde correctamente según estado de autenticación", async ({ page }) => {
    const consoleErrors: string[] = [];
    const serverErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`${msg.text()} (${msg.location().url})`);
      }
    });

    page.on("response", (response) => {
      const url = response.url();
      const status = response.status();

      if (url.startsWith(BASE_URL) && status >= 500) {
        serverErrors.push(`${status} ${url}`);
      }
    });

    page.on("requestfailed", (request) => {
      const url = request.url();

      if (url.startsWith(BASE_URL)) {
        failedRequests.push(
          `${request.method()} ${url} :: ${request.failure()?.errorText ?? "request failed"}`
        );
      }
    });

    await page.goto(`${BASE_URL}/practice`, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {
      // No fallar solo por networkidle si hay servicios externos persistentes.
    });

    const currentUrl = page.url();
    const bodyText = await page.locator("body").innerText({ timeout: 15_000 });

    await page.screenshot({
      path: "artifacts/e2e-public-practice-smoke-initial.png",
      fullPage: true,
    });

    const isLogin =
      currentUrl.includes("/login") ||
      bodyText.includes("Continuar con Google") ||
      bodyText.includes("Acceso seguro");

    const isPractice =
      bodyText.includes("Pregunta, decide y revisa feedback.") ||
      bodyText.includes("Iniciar práctica") ||
      bodyText.includes("Sesión real");

    const isOnboarding =
      currentUrl.includes("/onboarding") ||
      bodyText.toLowerCase().includes("onboarding") ||
      bodyText.includes("Guardar onboarding");

    expect(
      isLogin || isPractice || isOnboarding,
      `Estado inesperado al abrir /practice.
URL actual: ${currentUrl}
Texto visible:
${bodyText.slice(0, 1500)}`
    ).toBeTruthy();

    if (isLogin) {
      await expect(page.getByText(/GanaConMerito/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Continuar con Google/i })).toBeVisible();

      const hasCommitMetadata =
        bodyText.includes("Commit desplegado") ||
        bodyText.includes("Build time") ||
        bodyText.includes("Build") ||
        bodyText.includes("Built at");

      expect(
        hasCommitMetadata,
        "La pantalla de login debería mostrar metadata de build/commit."
      ).toBeTruthy();
    }

    if (isOnboarding && !isLogin) {
      await expect(page.locator("body")).toContainText(/onboarding|Guardar onboarding|Meta activa/i);
    }

    if (isPractice) {
      await expect(page.locator("body")).toContainText(/Práctica|Pregunta, decide y revisa feedback/i);

      const startButton = page.getByRole("button", { name: /Iniciar práctica/i });

      if (await startButton.isVisible().catch(() => false)) {
        await startButton.click();

        await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {
          // No fallar solo por networkidle.
        });

        await page.screenshot({
          path: "artifacts/e2e-public-practice-smoke-after-start.png",
          fullPage: true,
        });

        const afterStartText = await page.locator("body").innerText();

        const hasQuestionOrControlledState =
          (await page.locator("button.option-card").count()) > 0 ||
          afterStartText.includes("Debes completar el onboarding") ||
          afterStartText.includes("no hay un ítem disponible") ||
          afterStartText.includes("No se pudo iniciar la sesión") ||
          afterStartText.includes("Sesión");

        expect(
          hasQuestionOrControlledState,
          `Después de iniciar práctica no apareció pregunta ni estado controlado.
Texto visible:
${afterStartText.slice(0, 1500)}`
        ).toBeTruthy();
      }
    }

    expect(serverErrors, `Errores HTTP 5xx:\n${serverErrors.join("\n")}`).toEqual([]);

    const ignoredFailedRequestPatterns = [
      /accounts\.google\.com/i,
      /google/i,
      /gstatic/i,
      /favicon/i,
      /analytics/i,
    ];

    const criticalFailedRequests = failedRequests.filter(
      (entry) => !ignoredFailedRequestPatterns.some((pattern) => pattern.test(entry))
    );

    expect(
      criticalFailedRequests,
      `Requests críticas fallidas:\n${criticalFailedRequests.join("\n")}`
    ).toEqual([]);

    const ignoredConsolePatterns = [
      /favicon/i,
      /hydration/i,
      /third-party/i,
      /chrome-extension/i,
      /google/i,
      /gstatic/i,
    ];

    const criticalConsoleErrors = consoleErrors.filter(
      (error) => !ignoredConsolePatterns.some((pattern) => pattern.test(error))
    );

    expect(
      criticalConsoleErrors,
      `Errores críticos de consola:\n${criticalConsoleErrors.join("\n")}`
    ).toEqual([]);
  });
});
