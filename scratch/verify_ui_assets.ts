import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function capture() {
  const screenshotDir = path.join(process.cwd(), 'artifacts/verification_screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const urls = [
    { name: 'login', url: 'https://cnsc.profemarlon.com/login' },
    // Home requires login, so we might only see the login page if we don't have cookies.
    // However, I'll try to capture the login page as evidence of the "new" look.
  ];

  for (const item of urls) {
    console.log(`Capturing ${item.name}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, `${item.name}_desktop.png`), fullPage: true });
  }

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  for (const item of urls) {
    console.log(`Capturing ${item.name} mobile...`);
    await mobilePage.goto(item.url, { waitUntil: 'networkidle' });
    await mobilePage.screenshot({ path: path.join(screenshotDir, `${item.name}_mobile.png`), fullPage: true });
  }

  await browser.close();
  console.log(`Verification screenshots captured in ${screenshotDir}`);
}

capture().catch(console.error);
