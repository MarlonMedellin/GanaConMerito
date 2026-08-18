import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const AUTH_STATE_PATH = "artifacts/auth-state.json";
test.use({ storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined });

test.describe("GanaConMerito - Práctica Autenticada", () => {
  test("debe cargar la interfaz de práctica y permitir iniciar sesión", async ({ page }) => {
    const artifactDir = path.join(process.cwd(), "artifacts", "authenticated-practice");
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
    
    const BASE_URL = process.env.E2E_BASE_URL ?? "https://cnsc.profemarlon.com";

    console.log(`[E2E] Navegando a práctica como usuario autenticado: ${BASE_URL}/practice`);

    // 1. Ir directamente a práctica
    await page.goto(`${BASE_URL}/practice`, { waitUntil: "networkidle" });

    // 2. Verificar que NO estamos en login (PASS si no hay redirección)
    await expect(page, "Debería mantenerse en /practice y no redirigir a login").not.toHaveURL(/.*login/);
    
    // Verificamos que el título de la sección esté presente
    await expect(page.getByText("Práctica", { exact: false }).first()).toBeVisible();

    // Captura inicial
    const initialShot = path.join(artifactDir, "01-practice-loaded.png");
    await page.screenshot({ path: initialShot, fullPage: true });
    console.log(`[E2E] Captura inicial guardada: ${initialShot}`);

    // 3. Interactuar con "Iniciar práctica"
    const startButton = page.getByRole("button", { name: /Iniciar práctica/i });
    
    if (await startButton.isVisible()) {
      console.log("[E2E] Click en 'Iniciar práctica'...");
      await startButton.click();
      
      // Esperar a que la UI transicione
      await page.waitForTimeout(4000);
      
      // 4. Validar presencia de componentes de práctica
      // Buscamos las tarjetas de opciones que indican que la práctica está activa
      const options = page.locator(".option-card");
      const optionsCount = await options.count();
      
      console.log(`[E2E] Opciones encontradas: ${optionsCount}`);
      
      if (optionsCount > 0) {
        await expect(options.first()).toBeVisible();
      } else {
        // Si no hay .option-card, buscamos algún texto que indique carga de pregunta
        await expect(page.locator("body")).toContainText(/pregunta|decide/i);
      }
      
      // Captura tras interacción
      const finalShot = path.join(artifactDir, "02-question-active.png");
      await page.screenshot({ path: finalShot, fullPage: true });
      console.log(`[E2E] Captura de práctica activa guardada: ${finalShot}`);
      
      console.log("[E2E] Flujo de práctica autenticada validado con éxito.");
    } else {
      console.log("[E2E] El botón 'Iniciar práctica' no es visible. Verificando si la práctica ya está iniciada...");
      await expect(page.locator(".option-card").first()).toBeVisible();
    }
  });
});
