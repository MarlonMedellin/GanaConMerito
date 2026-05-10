import { chromium } from '@playwright/test';
import * as path from 'path';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'artifacts/auth-state.json'
  });
  const page = await context.newPage();
  
  console.log('Navigating to /home...');
  await page.goto('https://cnsc.profemarlon.com/home');
  await page.waitForTimeout(5000);
  
  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'artifacts/test-session-state.png' });
  
  const bodyText = await page.innerText('body');
  if (bodyText.includes('Cerrar sesión') || bodyText.includes('Dashboard')) {
    console.log('Session is VALID');
  } else {
    console.log('Session is INVALID (Redirected to login or missing auth markers)');
  }
  
  await browser.close();
}

run();
