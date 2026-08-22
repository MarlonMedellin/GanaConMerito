import { test as setup, expect } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://ganaconmerito.com";
const AUTH_STATE_PATH = "artifacts/auth-state.json";

setup("guardar sesión autenticada manual", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });

  console.log("");
  console.log("================================================");
  console.log("ACCIÓN REQUERIDA:");
  console.log("Inicia sesión manualmente con el usuario QA de Google.");
  console.log("Cuando termines y estés dentro de la app, la prueba detectará el cambio de URL y guardará el estado.");
  console.log("================================================");
  console.log("");

  await page.getByRole("button", { name: /Continuar con Google/i }).click();

  // Esperamos a que la navegación llegue a una ruta autenticada (hasta 3 minutos)
  await page.waitForURL(
    (url) =>
      url.pathname.includes("/home") ||
      url.pathname.includes("/onboarding") ||
      url.pathname.includes("/practice") ||
      url.pathname.includes("/dashboard"),
    { timeout: 180_000 }
  );

  // Validación final de que el botón de login ya no existe
  await expect(page.locator("body")).not.toContainText(/Continuar con Google/i);

  // Persistimos el estado de la sesión (cookies, localStorage, etc)
  await page.context().storageState({ path: AUTH_STATE_PATH });

  console.log(`[AUTH] Sesión guardada con éxito en ${AUTH_STATE_PATH}`);
});
