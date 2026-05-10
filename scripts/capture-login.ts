import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://cnsc.profemarlon.com/login');
  await page.screenshot({ path: 'artifacts/live-login-state.png' });
  console.log('Screenshot saved to artifacts/live-login-state.png');
  
  await browser.close();
}

run();
