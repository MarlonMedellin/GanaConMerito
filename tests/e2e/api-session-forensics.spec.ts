import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_STATE_PATH = "artifacts/auth-state.json";
test.use({ storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined });

test.describe("GanaConMerito - Session API Forensics", () => {
  const artifactDir = path.join(process.cwd(), "artifacts", "api-session-forensics");
  const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

  let forensicLog: any[] = [];

  test.beforeAll(async () => {
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
  });

  test("analizar payloads de API de sesión durante práctica", async ({ page }) => {
    // Interceptar y guardar cuerpos de API
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/session/")) {
        try {
          const status = response.status();
          const method = response.request().method();
          let body = {};
          if (status !== 204 && method !== "OPTIONS") {
             body = await response.json();
          }
          
          const entry = {
            url,
            method,
            status,
            timestamp: new Date().toISOString(),
            payload: body
          };
          forensicLog.push(entry);
          console.log(`[API] ${method} ${url} -> ${status}`);
        } catch (e) {
          // Ignorar si no es JSON o falla
        }
      }
    });

    console.log(`[QA] Iniciando forense en /practice...`);
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    
    const startBtn = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }

    // Esperar primera pregunta
    await page.waitForSelector(".option-card", { timeout: 30000 });
    await page.screenshot({ path: path.join(artifactDir, "01-question-loaded.png") });

    // Responder primera pregunta para gatillar /advance
    const options = page.locator(".option-card");
    await options.first().click();
    
    const responderBtn = page.getByRole("button", { name: /Responder/i });
    if (await responderBtn.isVisible()) {
      await responderBtn.click();
      console.log(`[QA] Respuesta enviada. Esperando procesamiento...`);
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: path.join(artifactDir, "02-after-response.png") });

    // Verificar si el botón Siguiente existe o está oculto
    const nextBtn = page.getByRole("button", { name: /Siguiente/i });
    const nextVisible = await nextBtn.isVisible();
    const nextCount = await nextBtn.count();
    
    console.log(`[QA] Botón Siguiente: Visible=${nextVisible}, Count=${nextCount}`);

    // Guardar log forense
    fs.writeFileSync(
      path.join(artifactDir, "session-api-payloads.json"), 
      JSON.stringify({
        summary: {
          nextButtonVisible: nextVisible,
          nextButtonCount: nextCount,
          urlAtEnd: page.url()
        },
        logs: forensicLog
      }, null, 2)
    );
    
    console.log(`[QA] Forense completado. Log guardado en artifacts/api-session-forensics/`);
  });
});
