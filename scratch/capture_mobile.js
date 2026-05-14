const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createBrowserClient } = require('@supabase/ssr');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function capture() {
  const artifactRoot = path.join(process.cwd(), 'artifacts', 'visual-verification-mobile');
  if (!fs.existsSync(artifactRoot)) fs.mkdirSync(artifactRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const iPhone = devices['iPhone 13'];
  const context = await browser.newContext({ ...iPhone, baseURL: baseUrl });

  // Auth
  const jar = new Map();
  const client = createBrowserClient(url, anonKey, {
    cookies: {
      getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
      setAll(cookies) { for (const c of cookies) jar.set(c.name, c.value); },
    },
  });
  await client.auth.signInWithPassword({ email: 'qa-ui@test.com', password: 'qa-password-123' });
  const cookieEntries = Array.from(jar.entries());
  await context.addCookies(cookieEntries.map(([name, value]) => ({ name, value, url: baseUrl })));

  const page = await context.newPage();

  const paths = ['/home', '/practice', '/dashboard'];
  for (const p of paths) {
    console.log(`Capturing ${p}...`);
    await page.goto(p, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(artifactRoot, `${p.replace(/\//g, '')}_mobile.png`), fullPage: true });
  }

  await browser.close();
  console.log(`Mobile screenshots captured in ${artifactRoot}`);
}

capture().catch(console.error);
