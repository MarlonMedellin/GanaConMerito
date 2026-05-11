import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function capture() {
  const url = 'https://merito-cognition-lab.base44.app/';
  const outputDir = path.join(process.cwd(), 'scratch/design_capture');
  const screenshotDir = path.join(outputDir, 'screenshots');

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log(`Connecting to browser...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 }
  });
  const page = await context.newPage();

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Sidebar
  console.log(`Capturing Sidebar...`);
  const sidebar = await page.$('aside');
  if (sidebar) await sidebar.screenshot({ path: path.join(screenshotDir, 'sidebar.png') });

  // Main Content Sections
  console.log(`Capturing Hero Section...`);
  const hero = await page.$('main > div > div > div:nth-child(1)');
  if (hero) await hero.screenshot({ path: path.join(screenshotDir, 'hero.png') });

  console.log(`Capturing Active Session Card...`);
  const activeSession = await page.$('main > div > div > div:nth-child(2)');
  if (activeSession) await activeSession.screenshot({ path: path.join(screenshotDir, 'active_session.png') });

  console.log(`Capturing Metrics Grid...`);
  const metrics = await page.$('main > div > div > div:nth-child(3)');
  if (metrics) await metrics.screenshot({ path: path.join(screenshotDir, 'metrics_grid.png') });

  console.log(`Capturing Topic Grid...`);
  const topics = await page.$('main > div > div > div:nth-child(4)');
  if (topics) await topics.screenshot({ path: path.join(screenshotDir, 'topics_grid.png') });

  console.log(`Capturing Chart and Recent Sessions...`);
  const bottomGrid = await page.$('main > div > div > div:nth-child(5)');
  if (bottomGrid) await bottomGrid.screenshot({ path: path.join(screenshotDir, 'bottom_grid.png') });

  await browser.close();
  console.log(`Capture complete.`);
}

capture().catch(console.error);
