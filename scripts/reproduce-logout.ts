import { chromium } from 'playwright';

async function reproduceLogout() {
  console.log('Iniciando reproducción de logout en https://cnsc.profemarlon.com...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type().toUpperCase()}] ${text}`);
    console.log(`BROWSER CONSOLE: [${msg.type().toUpperCase()}] ${text}`);
  });

  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.message}`);
    consoleMessages.push(`[PAGE_ERROR] ${err.message}`);
  });

  // Intentamos ir a una ruta protegida. Si no estamos logueados nos mandará a /login.
  // Pero el botón de logout podría estar en el layout si el middleware no es estricto
  // o si podemos forzar su renderizado para pruebas.
  // En este caso, el usuario dice que el botón dice "Saliendo..." y se queda colgado.
  
  await page.goto('https://cnsc.profemarlon.com/login');
  await page.waitForLoadState('networkidle');

  console.log('Buscando botón de logout (Cerrar sesión)...');
  
  // Nota: Si no estamos logueados, el botón no aparecerá.
  // Sin embargo, si el error es "Missing Supabase browser environment variables",
  // es probable que ocurra incluso al intentar inicializar el cliente en la página de login
  // si el componente SignOutButton se monta (aunque esté oculto o en un layout superior).
  
  const logoutButton = page.locator('button:has-text("Cerrar sesión")');
  
  if (await logoutButton.count() > 0) {
    console.log('Botón encontrado. Haciendo clic...');
    await logoutButton.click();
    
    await page.waitForTimeout(5000);
    const text = await logoutButton.textContent();
    console.log(`Texto del botón después de 5s: "${text}"`);
    
    if (text === 'Saliendo...') {
      console.log('❌ REPRODUCIDO: El botón se quedó en "Saliendo...".');
    } else {
      console.log('✅ El botón cambió de estado o redirigió.');
    }
  } else {
    console.log('⚠️ No se encontró el botón de logout. ¿Estamos logueados?');
    
    // Vamos a verificar si hay errores de Supabase en la consola al cargar /login
    const hasEnvError = consoleMessages.some(m => m.includes('Missing Supabase browser environment variables'));
    if (hasEnvError) {
      console.log('❌ DETECTADO ERROR DE CONFIGURACIÓN EN CONSOLA.');
    }
  }

  await page.screenshot({ path: 'reproduce-logout.png' });
  await browser.close();
}

reproduceLogout().catch(console.error);
