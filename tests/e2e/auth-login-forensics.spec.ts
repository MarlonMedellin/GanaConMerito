import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://ganaconmerito.com";

test.describe("Forense Auth Google - GanaConMerito", () => {
  test("captura callback, errores de query y cookies después del login manual", async ({ page }, testInfo) => {
    // Aumentamos el timeout a 4 minutos para permitir el login manual sin que Playwright mate el proceso
    test.setTimeout(240_000);

    const artifactDir = path.join(process.cwd(), "artifacts", "auth-login-forensics");
    fs.mkdirSync(artifactDir, { recursive: true });

    const responses: any[] = [];
    const requests: any[] = [];
    const consoleErrors: any[] = [];
    const navigations: string[] = [];

    page.on("request", (request) => {
      const url = request.url();

      if (
        url.includes("ganaconmerito.com") ||
        url.includes("supabase.co") ||
        url.includes("accounts.google.com")
      ) {
        requests.push({
          method: request.method(),
          url,
          resourceType: request.resourceType(),
        });
      }
    });

    page.on("response", async (response) => {
      const request = response.request();
      const url = response.url();

      if (
        url.includes("ganaconmerito.com") ||
        url.includes("supabase.co") ||
        url.includes("accounts.google.com")
      ) {
        responses.push({
          method: request.method(),
          url,
          status: response.status(),
          resourceType: request.resourceType(),
          headers: response.headers(),
        });
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
        });
      }
    });

    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        navigations.push(frame.url());
      }
    });

    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await expect(page.getByRole("button", { name: /Continuar con Google/i })).toBeVisible();

    await page.screenshot({
      path: path.join(artifactDir, "01-login-before-google.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /Continuar con Google/i }).click();

    console.log("");
    console.log("====================================================");
    console.log("ACCIÓN REQUERIDA:");
    console.log("Completa manualmente el login con Google en la ventana de Playwright.");
    console.log("La prueba tiene 4 MINUTOS antes de cerrarse.");
    console.log("No cierres el navegador.");
    console.log("====================================================");
    console.log("");

    // Espera extendida para permitir el flujo manual completo
    await page.waitForTimeout(180_000);

    const finalUrl = page.url();
    const finalBodyText = await page.locator("body").innerText().catch(() => "");
    const cookies = await page.context().cookies();

    await page.screenshot({
      path: path.join(artifactDir, "02-after-google-manual-window.png"),
      fullPage: true,
    });

    const callbackResponses = responses.filter((entry) =>
      entry.url.includes("/api/auth/callback")
    );

    const loginErrorFromUrl = (() => {
      try {
        const parsed = new URL(finalUrl);
        return parsed.searchParams.get("error");
      } catch {
        return null;
      }
    })();

    const supabaseAuthResponses = responses.filter((entry) =>
      entry.url.includes("/auth/v1/")
    );

    const ownDomainErrors = responses.filter((entry) =>
      entry.url.includes("ganaconmerito.com") && entry.status >= 400
    );

    const supabaseErrors = responses.filter((entry) =>
      entry.url.includes("supabase.co") && entry.status >= 400
    );

    const authCookies = cookies.filter((cookie) =>
      cookie.name.toLowerCase().includes("sb") ||
      cookie.name.toLowerCase().includes("supabase") ||
      cookie.name.toLowerCase().includes("auth")
    );

    const detectedState =
      finalUrl.includes("/home")
        ? "home"
        : finalUrl.includes("/onboarding")
          ? "onboarding"
          : finalUrl.includes("/practice")
            ? "practice"
            : finalUrl.includes("/dashboard")
              ? "dashboard"
              : finalUrl.includes("/login")
                ? "login"
                : "unknown";

    const report = {
      baseUrl: BASE_URL,
      finalUrl,
      detectedState,
      loginErrorFromUrl,
      hasAuthCookies: authCookies.length > 0,
      authCookieNames: authCookies.map((cookie) => cookie.name),
      callbackResponses,
      supabaseAuthResponses,
      ownDomainErrors,
      supabaseErrors,
      navigations,
      consoleErrors,
      requests,
      responses,
      finalBodyPreview: finalBodyText.slice(0, 2000),
      generatedAt: new Date().toISOString(),
    };

    const reportPath = path.join(artifactDir, "auth-login-forensics-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    await testInfo.attach("auth-login-forensics-report", {
      path: reportPath,
      contentType: "application/json",
    });

    await testInfo.attach("auth-login-forensics-screenshot", {
      path: path.join(artifactDir, "02-after-google-manual-window.png"),
      contentType: "image/png",
    });

    console.log("[E2E] Informe Forense Generado:");
    console.log(JSON.stringify({
      finalUrl,
      detectedState,
      loginErrorFromUrl,
      hasAuthCookies: authCookies.length > 0,
      authCookieNames: authCookies.map((cookie) => cookie.name),
      callbackResponses,
      ownDomainErrors,
      supabaseErrors,
      reportPath,
    }, null, 2));

    expect(
      detectedState,
      `El login no llegó a una ruta autenticada.
URL final: ${finalUrl}
Error query: ${loginErrorFromUrl}
Callback responses:
${JSON.stringify(callbackResponses, null, 2)}
Own domain errors:
${JSON.stringify(ownDomainErrors, null, 2)}
Supabase errors:
${JSON.stringify(supabaseErrors, null, 2)}`
    ).toMatch(/home|onboarding|practice|dashboard/);
  });
});
