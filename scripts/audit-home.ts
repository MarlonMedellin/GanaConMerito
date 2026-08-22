import { chromium } from 'playwright';

async function auditPage() {
  console.log('Iniciando auditoría de https://ganaconmerito.com/home...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: string[] = [];
  const consoleMessages: { type: string; text: string }[] = [];

  // Capturar errores a nivel de página (excepciones no capturadas)
  page.on('pageerror', exception => {
    errors.push(exception.message);
  });

  // Capturar mensajes de consola (warnings y errores)
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  const startTime = Date.now();
  
  // Navegar a la página y esperar a que la red se estabilice
  const response = await page.goto('https://ganaconmerito.com/home', { waitUntil: 'networkidle' });
  
  const loadTime = Date.now() - startTime;
  
  console.log(`\n--- Resultados de la Auditoría ---`);
  console.log(`Estado HTTP: ${response?.status()} ${response?.statusText()}`);
  console.log(`Tiempo de carga (networkidle): ${loadTime}ms`);
  
  // Obtener el título
  const title = await page.title();
  console.log(`Título de la página: "${title}"`);
  
  // Captura de pantalla para validación visual
  const screenshotPath = 'audit-home.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Captura de pantalla guardada en: ${screenshotPath}`);
  
  console.log(`\n--- Análisis de Consola y Errores ---`);
  if (errors.length === 0) {
    console.log('✅ No se detectaron excepciones no manejadas (pageerror).');
  } else {
    console.log('❌ Excepciones no manejadas:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
  
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  const errorsLog = consoleMessages.filter(m => m.type === 'error');

  console.log(`\nErrores de consola: ${errorsLog.length}`);
  errorsLog.forEach(m => console.log(`  [ERROR] ${m.text}`));

  console.log(`\nAdvertencias de consola: ${warnings.length}`);
  warnings.forEach(m => console.log(`  [WARNING] ${m.text}`));

  await browser.close();
  console.log('\nAuditoría finalizada.');
}

auditPage().catch(console.error);
