import { chromium } from 'playwright';

async function auditLogin() {
  console.log('Iniciando auditoría de login en https://ganaconmerito.com/login...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];
  const consoleMessages: { type: string; text: string }[] = [];

  page.on('pageerror', exception => {
    errors.push(exception.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  page.on('requestfailed', request => {
    console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  const startTime = Date.now();
  const response = await page.goto('https://ganaconmerito.com/login', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  
  console.log(`\n--- Resultados de la Auditoría ---`);
  console.log(`Estado HTTP: ${response?.status()} ${response?.statusText()}`);
  console.log(`Tiempo de carga: ${loadTime}ms`);
  
  const title = await page.title();
  console.log(`Título: "${title}"`);
  
  // Captura de pantalla del estado inicial
  await page.screenshot({ path: 'audit-login-initial.png' });
  
  // Intentar hacer clic en el botón de login si existe
  const loginButton = page.locator('button:has-text("Google"), button:has-text("Conectando")');
  if (await loginButton.count() > 0) {
    console.log('Botón de login encontrado. Intentando clic...');
    await loginButton.click();
    
    // Esperar un poco para ver si cambia el estado
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'audit-login-after-click.png' });
    
    const buttonText = await loginButton.textContent();
    console.log(`Texto del botón después de 5s: "${buttonText}"`);

    // Intentar extraer el hash del commit del DOM
    const hashElement = page.locator('code');
    if (await hashElement.count() > 0) {
      const deployedHash = await hashElement.textContent();
      console.log(`Hash desplegado detectado en UI: ${deployedHash}`);
    }
  } else {
    console.log('❌ No se encontró el botón de login.');
  }

  console.log(`\n--- Análisis de Consola ---`);
  consoleMessages.forEach(m => console.log(`  [${m.type.toUpperCase()}] ${m.text}`));

  if (errors.length > 0) {
    console.log(`\n❌ Excepciones:`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  await browser.close();
  console.log('\nAuditoría finalizada.');
}

auditLogin().catch(console.error);
