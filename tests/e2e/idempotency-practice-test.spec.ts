import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_STATE_PATH = "artifacts/auth-state.json";
test.use({ storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined });

test.describe("GanaConMerito - Idempotency Practice Test", () => {
  const artifactDir = path.join(process.cwd(), "artifacts", "idempotency-practice-test");
  const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

  test.beforeAll(async () => {
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
  });

  test("validar que al entrar dos veces sale la misma pregunta (idempotencia)", async ({ page }) => {
    console.log(`[QA] Intento 1: Obteniendo primera pregunta...`);
    
    // 1. Primer intento
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    const startBtn = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startBtn.isVisible()) {
      await startBtn.click();
    }
    
    await page.waitForSelector(".option-card", { timeout: 30000 });
    
    // Capturar texto de la pregunta. 
    // Basado en auditorías previas, el texto suele estar en un contenedor principal antes de las opciones.
    // Usaremos un selector genérico o innerText del contenedor de práctica.
    const questionText1 = await page.locator("main").innerText();
    await page.screenshot({ path: path.join(artifactDir, "attempt-1.png"), fullPage: true });
    
    console.log(`[QA] Pregunta 1 capturada (primeros 100 chars): ${questionText1.substring(0, 100).replace(/\n/g, " ")}...`);

    // 2. Navegar fuera y volver a entrar
    console.log(`[QA] Navegando a /home y volviendo a /practice...`);
    await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle" });
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });
    
    const startBtn2 = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startBtn2.isVisible()) {
      await startBtn2.click();
    }

    await page.waitForSelector(".option-card", { timeout: 30000 });
    
    const questionText2 = await page.locator("main").innerText();
    await page.screenshot({ path: path.join(artifactDir, "attempt-2.png"), fullPage: true });
    
    console.log(`[QA] Pregunta 2 capturada (primeros 100 chars): ${questionText2.substring(0, 100).replace(/\n/g, " ")}...`);

    // 3. Comparación
    // Limpiamos un poco los textos para evitar falsos negativos por espacios o tiempos.
    const clean1 = questionText1.trim().replace(/\s+/g, " ");
    const clean2 = questionText2.trim().replace(/\s+/g, " ");

    const areIdentical = clean1 === clean2;
    
    console.log(`[QA] ¿Son idénticas?: ${areIdentical}`);

    if (areIdentical) {
      console.log(`[QA] RESULTADO: Se confirma que la pregunta persiste al re-entrar.`);
    } else {
      console.log(`[QA] RESULTADO: La pregunta CAMBIÓ al re-entrar.`);
    }

    // Guardar resultado en un mini-reporte
    const report = {
      timestamp: new Date().toISOString(),
      attempt1: clean1.substring(0, 500),
      attempt2: clean2.substring(0, 500),
      areIdentical,
      verdict: areIdentical ? "IDEMPOTENT" : "DYNAMIC"
    };
    fs.writeFileSync(path.join(artifactDir, "idempotency-report.json"), JSON.stringify(report, null, 2));
    
    // El test pasa si la ejecución termina, el veredicto real se lee en la consola/JSON.
    // Si el usuario quiere que "siempre salga la misma", validamos eso.
    expect(areIdentical, "La misma sesión debe conservar la pregunta al reingresar a /practice").toBe(true);
  });
});
