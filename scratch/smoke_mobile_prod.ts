import { chromium, devices } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const baseUrl = 'https://cnsc.profemarlon.com';
const artifactRoot = path.join(process.cwd(), 'artifacts', 'mobile-smoke-test');
if (!fs.existsSync(artifactRoot)) fs.mkdirSync(artifactRoot, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pixel5 = devices['Pixel 5'];
  const context = await browser.newContext({
    ...pixel5,
    isMobile: true
  });
  const page = await context.newPage();
  
  console.log(`Navigating to ${baseUrl} (Mobile View)...`);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  
  await page.screenshot({ path: path.join(artifactRoot, 'mobile_home.png'), fullPage: true });
  console.log(`Screenshot saved to artifacts/mobile-smoke-test/mobile_home.png`);
  
  await browser.close();
})();
