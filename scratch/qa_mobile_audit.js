const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createBrowserClient } = require('@supabase/ssr');

const baseUrl = process.env.QA_BASE_URL || 'https://cnsc.profemarlon.com';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function auditMobile() {
  const artifactRoot = path.join(process.cwd(), 'artifacts', 'mobile-audit');
  if (!fs.existsSync(artifactRoot)) fs.mkdirSync(artifactRoot, { recursive: true });

  console.log(`Starting mobile audit on ${baseUrl}`);
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const device = devices['iPhone 13'];
  const context = await browser.newContext({ ...device, baseURL: baseUrl });

  // 1. Auth via Cookies to save time and ensure session
  const jar = new Map();
  const client = createBrowserClient(url, anonKey, {
    cookies: {
      getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
      setAll(cookies) { for (const c of cookies) jar.set(c.name, c.value); },
    },
  });
  
  console.log("Signing in...");
  const { data, error } = await client.auth.signInWithPassword({ 
    email: 'qa-ui@test.com', 
    password: 'qa-password-123' 
  });
  
  if (error) throw new Error(`Auth failed: ${error.message}`);
  
  const cookieEntries = Array.from(jar.entries());
  await context.addCookies(cookieEntries.map(([name, value]) => ({ 
    name, 
    value, 
    url: baseUrl,
    path: '/',
    secure: true,
    sameSite: 'Lax'
  })));

  const page = await context.newPage();

  // 2. Capture /home
  console.log("Navigating to /home...");
  await page.goto('/home', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactRoot, '01-home-mobile.png') });

  // 3. Capture Menu Open
  console.log("Opening mobile menu...");
  // The menu button is usually a burger icon in the topbar
  const menuButton = page.locator('button[aria-label="Abrir menú"], button.mobile-menu-trigger').first();
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.waitForTimeout(500); // Wait for animation
    await page.screenshot({ path: path.join(artifactRoot, '02-menu-open-mobile.png') });
    // Close it to continue
    const closeButton = page.locator('button[aria-label="Cerrar menú"], button.mobile-menu-close').first();
    if (await closeButton.isVisible()) await closeButton.click();
    else await page.mouse.click(300, 300); // Click outside
  } else {
    console.warn("Mobile menu button not found or not visible");
  }

  // 4. Navigate to /practice and capture before answering
  console.log("Navigating to /practice...");
  await page.goto('/practice', { waitUntil: 'networkidle' });
  
  // Start session if needed
  const startButton = page.locator('button:has-text("Iniciar práctica")').first();
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForSelector('article h2', { timeout: 15000 });
  }

  await page.screenshot({ path: path.join(artifactRoot, '03-practice-before-answer-mobile.png') });

  // 5. Trigger Tutor GCM and capture
  console.log("Opening Tutor GCM...");
  const tutorTrigger = page.locator('button:has-text("Preguntar al Tutor"), button.tutor-trigger').first();
  if (await tutorTrigger.isVisible()) {
    await tutorTrigger.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactRoot, '04-tutor-open-mobile.png') });
  } else {
    console.warn("Tutor trigger not found");
  }

  // 6. Answer and capture feedback
  console.log("Answering question...");
  const firstOption = page.locator('button.option-card').first();
  await firstOption.click();
  
  const submitButton = page.locator('button:has-text("Responder")').first();
  await submitButton.click();
  
  await page.waitForSelector('.feedback-card, .feedback-section', { timeout: 15000 });
  await page.screenshot({ path: path.join(artifactRoot, '05-feedback-mobile.png') });

  // 7. Capture /metrics
  console.log("Navigating to /metrics...");
  await page.goto('/metrics', { waitUntil: 'networkidle' }).catch(() => page.goto('/dashboard'));
  await page.screenshot({ path: path.join(artifactRoot, '06-metrics-mobile.png') });

  await browser.close();
  console.log(`Audit complete. Artifacts in ${artifactRoot}`);
}

auditMobile().catch(console.error);
