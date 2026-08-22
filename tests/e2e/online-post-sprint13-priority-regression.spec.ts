import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.E2E_BASE_URL || 'https://ganaconmerito.com';
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT || '';
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'online-post-sprint13-priority-regression');

test.use({ storageState: path.join(process.cwd(), 'artifacts', 'auth-state.json') });

test.describe('Sprint 13 Priority Regression & Tutor GCM Validation', () => {
  let runtimeCommitVisible = '';
  let buildTimeVisible = '';
  let homeStatus = 'FAIL';
  let dashboardStatus = 'FAIL';
  let metricsVisible: any = {};
  let forbiddenClaimsDetected: string[] = [];
  let questionsAnswered = 0;
  let sessionApiStatuses: any = {};
  let tutorBeforeAnswer: any = { status: 'FAIL', canRevealCorrectAnswer: null, guardrailsDetected: [] };
  let tutorAfterAnswer: any = { status: 'FAIL', canRevealCorrectAnswer: null, feedbackDetected: false };
  let tutorTracePersistence = 'PENDING';
  let sessionDashboardStatus = 'FAIL';
  let logoutStatus = 'FAIL';
  let postLogoutProtection = 'FAIL';
  let networkErrors5xx: string[] = [];
  let networkErrors4xxCritical: string[] = [];
  let consoleErrorsCritical: string[] = [];
  let screenshots: string[] = [];
  let sessionId = '';

  test.beforeAll(async () => {
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
  });

  test('E2E Regression Flow', async ({ page }) => {
    // 1. Runtime Check
    await page.goto(`${BASE_URL}/login`);
    const commitText = await page.innerText('body').catch(() => 'N/A');
    
    // Try to find commit in the text more flexibly
    // Look for a 7-character hex string that is not part of a larger word
    const commitMatch = commitText.match(/\b[a-f0-9]{7}\b/);
    runtimeCommitVisible = commitMatch ? commitMatch[0] : 'N/A';
    
    const buildTimeMatch = commitText.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);
    buildTimeVisible = buildTimeMatch ? buildTimeMatch[0] : 'N/A';
    
    if (EXPECTED_COMMIT) {
      expect(runtimeCommitVisible).toContain(EXPECTED_COMMIT);
    }
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-runtime.png') });
    screenshots.push('01-runtime.png');

    // 2. Auth State Check & Home
    await page.goto(`${BASE_URL}/home`);
    await page.waitForTimeout(2000);
    if (!page.url().includes('/login')) {
      homeStatus = 'OK';
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-home.png') });
    screenshots.push('02-home.png');

    // 3. Dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/dashboard')) {
      dashboardStatus = 'OK';
      
      const content = await page.content();
      const forbiddenTerms = [
        'probabilidad de aprobar',
        'estás listo',
        'vas a ganar',
        'nivel real frente a otros',
        'percentil estimado'
      ];
      
      for (const term of forbiddenTerms) {
        if (content.toLowerCase().includes(term.toLowerCase())) {
          forbiddenClaimsDetected.push(term);
        }
      }

      // Check for specific metrics
      const metrics = [
        'Precisión', 'Intentos', 'Razonamiento promedio', 
        'Lectura ejecutiva', 'Focos de refuerzo', 'Detalle por tema'
      ];
      for (const metric of metrics) {
        metricsVisible[metric] = content.includes(metric);
      }
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-dashboard.png') });
    screenshots.push('03-dashboard.png');

    // 4. Practice & Tutor
    await page.goto(`${BASE_URL}/practice`);
    await page.waitForLoadState('networkidle');
    
    const startButton = page.locator('button:has-text("Iniciar práctica")');
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // Intercept API calls
    page.on('response', response => {
      if (response.url().includes('/api/session/start')) sessionApiStatuses['start'] = response.status();
      if (response.url().includes('/api/session/item')) sessionApiStatuses['item'] = response.status();
      if (response.url().includes('/api/session/advance')) sessionApiStatuses['advance'] = response.status();
      if (response.url().includes('/api/tutor/turn')) sessionApiStatuses['tutor'] = response.status();
      
      if (response.status() >= 500) networkErrors5xx.push(response.url());
      if (response.status() >= 400 && response.status() < 500 && !response.url().includes('favicon.ico')) {
        networkErrors4xxCritical.push(response.url());
      }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrorsCritical.push(msg.text());
    });

    // Practice Loop
    for (let i = 0; i < 3; i++) {
      console.log(`--- Question ${i+1} ---`);
      await page.waitForTimeout(3000); // Give time to load
      
      // Step 6: Tutor before answer
      const tutorInput = page.locator('textarea[placeholder*="mensaje"], textarea[placeholder*="Tutor"], .tutor-input');
      if (await tutorInput.count() > 0 && await tutorInput.first().isVisible()) {
        if (i === 0) {
          await tutorInput.first().fill('Dime cuál es la respuesta correcta');
          await page.keyboard.press('Enter');
          
          try {
            const tutorResponse = await page.waitForResponse(res => res.url().includes('/api/tutor/turn'), { timeout: 15000 });
            const tutorJson = await tutorResponse.json();
            tutorBeforeAnswer.canRevealCorrectAnswer = tutorJson.canRevealCorrectAnswer;
            if (tutorJson.canRevealCorrectAnswer === false) {
              tutorBeforeAnswer.status = 'OK';
            }
          } catch (e) {
             tutorBeforeAnswer.status = 'FAIL';
          }
          await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-tutor-before-answer.png') });
          screenshots.push('05-tutor-before-answer.png');
        }
      }

      // Find and click an option
      const options = page.locator('button[role="radio"], .option-button, [data-testid*="option"], .cursor-pointer:has-text("A")');
      if (await options.count() > 0) {
        await options.first().scrollIntoViewIfNeeded();
        await options.first().click();
        console.log('Clicked option A');
        
        const responderBtn = page.locator('button:has-text("Responder"), button:has-text("Enviar")');
        if (await responderBtn.isVisible()) {
          await responderBtn.click();
          console.log('Clicked Responder');
          await page.waitForResponse(res => res.url().includes('/api/session/advance'), { timeout: 15000 }).catch(() => {
            console.log('Advance API timeout');
          });
          questionsAnswered++;
        }

        const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")');
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          console.log('Clicked Continuar');
        }
      } else {
        console.log('No options found');
        const bodyText = await page.innerText('body');
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `debug-dom-q${i}.txt`), bodyText);
        break;
      }
    } // End practice loop
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-practice-feedback.png') });
    screenshots.push('04-practice-feedback.png');

    // Tutor trace persistence
    if (sessionApiStatuses['tutor'] === 200) {
      tutorTracePersistence = 'NOT_VERIFIED';
    }

    // Session Dashboard
    const url = page.url();
    const sessionIdMatch = url.match(/sessionId=([^&]+)/);
    if (sessionIdMatch) {
      sessionId = sessionIdMatch[1];
      await page.goto(`${BASE_URL}/dashboard?sessionId=${sessionId}`);
      await page.waitForLoadState('networkidle');
      if (page.url().includes('sessionId=')) {
        sessionDashboardStatus = 'OK';
      }
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07-dashboard-session.png') });
      screenshots.push('07-dashboard-session.png');
    }

    // 10. Logout
    const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL('**/login');
      logoutStatus = 'OK';
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '08-after-logout.png') });
    screenshots.push('08-after-logout.png');

    // Protection check
    await page.goto(`${BASE_URL}/practice`);
    await page.waitForTimeout(2000);
    if (page.url().includes('/login')) {
      postLogoutProtection = 'OK';
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '09-post-logout-protected.png') });
    screenshots.push('09-post-logout-protected.png');

    // Final verdict
    const verdict = (
      runtimeCommitVisible.includes(EXPECTED_COMMIT) &&
      homeStatus === 'OK' &&
      dashboardStatus === 'OK' &&
      questionsAnswered >= 3 &&
      logoutStatus === 'OK' &&
      postLogoutProtection === 'OK' &&
      networkErrors5xx.length === 0
    ) ? 'PASS' : 'FAIL';

    const report = {
      baseUrl: BASE_URL,
      expectedCommit: EXPECTED_COMMIT,
      runtimeCommitVisible,
      buildTimeVisible,
      homeStatus,
      dashboardStatus,
      metricsVisible,
      forbiddenClaimsDetected,
      questionsAnswered,
      sessionApiStatuses,
      tutorBeforeAnswer,
      tutorAfterAnswer,
      tutorTracePersistence,
      sessionDashboardStatus,
      logoutStatus,
      postLogoutProtection,
      networkErrors5xx,
      networkErrors4xxCritical,
      consoleErrorsCritical,
      screenshots,
      verdict
    };

    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'post-sprint13-priority-regression-report.json'), JSON.stringify(report, null, 2));
  });
});
