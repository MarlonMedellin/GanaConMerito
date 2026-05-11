import { chromium, devices } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function capture() {
  const url = 'https://merito-cognition-lab.base44.app/';
  const outputDir = path.join(process.cwd(), 'scratch/design_capture');
  const screenshotDir = path.join(outputDir, 'screenshots_mobile');

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log(`Connecting to browser for MORE MOBILE captures...`);
  const browser = await chromium.launch({ headless: true });
  
  const pixel5 = devices['Pixel 5'];
  const context = await browser.newContext({
    ...pixel5,
    isMobile: true
  });
  const page = await context.newPage();

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // 1. Dashboard Title and Button
  console.log(`Capturing Mobile Hero Section...`);
  const hero = await page.$('main > div > div > div:nth-child(1)');
  if (hero) await hero.screenshot({ path: path.join(screenshotDir, 'mobile_hero.png') });

  // 2. Active Session Card
  console.log(`Capturing Mobile Active Session Card...`);
  const activeSession = await page.$('main > div > div > div:nth-child(2)');
  if (activeSession) await activeSession.screenshot({ path: path.join(screenshotDir, 'mobile_active_session.png') });

  // 3. Metrics Grid (2x2)
  console.log(`Capturing Mobile Metrics Grid...`);
  const metrics = await page.$('main > div > div > div:nth-child(3)');
  if (metrics) await metrics.screenshot({ path: path.join(screenshotDir, 'mobile_metrics_grid.png') });

  // 4. Topic Cards Section
  console.log(`Capturing Mobile Topic Section...`);
  const topics = await page.$('main > div > div > div:nth-child(4)');
  if (topics) await topics.screenshot({ path: path.join(screenshotDir, 'mobile_topics.png') });

  // 5. Performance Chart
  console.log(`Capturing Mobile Performance Chart...`);
  const chart = await page.$('main > div > div > div:nth-child(5) > div:nth-child(1)');
  if (chart) await chart.screenshot({ path: path.join(screenshotDir, 'mobile_chart.png') });

  // 6. Recent Sessions List
  console.log(`Capturing Mobile Recent Sessions...`);
  const recent = await page.$('main > div > div > div:nth-child(5) > div:nth-child(2)');
  if (recent) await recent.screenshot({ path: path.join(screenshotDir, 'mobile_recent_sessions.png') });

  await browser.close();
  console.log(`Mobile capture complete.`);
}

capture().catch(console.error);
