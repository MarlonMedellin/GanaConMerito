import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe.configure({ mode: "serial" });

const BASE_URL = process.env.E2E_BASE_URL ?? "https://ganaconmerito.com";
const AUTH_STATE_PATH = "artifacts/auth-state.json";
const ARTIFACTS_DIR = "artifacts/tutor-gcm-latest-sprints";
const EXPECTED_COMMIT = "9cd7ce4"; 

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const report: any = {
  baseUrl: BASE_URL,
  tutorApiStatuses: [],
  sessionApiStatuses: [],
  networkErrors5xx: [],
  networkErrors4xxCritical: [],
  consoleErrorsCritical: [],
  screenshots: [],
  verdict: "PENDING",
};

const tutorPayloads: any[] = [];

test.describe("Tutor GCM: Latest Sprints Audit (Sprint 20)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const storageState = fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined;
    const context = await browser.newContext({ storageState, viewport: { width: 1440, height: 1200 } });
    page = await context.newPage();

    page.on("response", (response) => {
      const status = response.status();
      const url = response.url();
      if (status >= 500) report.networkErrors5xx.push({ url, status });
      if (url.includes("/api/tutor/turn")) report.tutorApiStatuses.push({ url, status, ok: response.ok() });
      if (url.includes("/api/session/")) report.sessionApiStatuses.push({ url, status });
    });
  });

  test("1. Runtime & Authenticated Session", async ({ browser }) => {
    await page.goto(`${BASE_URL}/login`);
    const commitLocator = page.locator("code").filter({ hasText: /[a-f0-9]{7}/ }).first();
    await commitLocator.waitFor({ state: "visible", timeout: 15000 });
    const commitText = await commitLocator.innerText();
    report.runtimeCommitVisible = commitText.slice(0, 7);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "01-runtime.png") });
    report.screenshots.push("01-runtime.png");

    await page.goto(`${BASE_URL}/home`);
    await page.waitForLoadState("networkidle");
    report.sessionStatus = "ACTIVE";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "02-home.png") });
    report.screenshots.push("02-home.png");
    expect(report.runtimeCommitVisible).toContain(EXPECTED_COMMIT);
  });

  test("2. Practice Flow & Tutor Audit", async () => {
    await page.goto(`${BASE_URL}/practice`);
    const startButton = page.getByRole("button", { name: /Iniciar práctica/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    await page.waitForSelector(".option-card", { timeout: 30000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "03-practice-loaded.png"), fullPage: true });
    report.screenshots.push("03-practice-loaded.png");

    // Tutor Interaction
    console.log("Checking tutor interface...");
    const tutorPanel = page.getByTestId("tutor-gcm-panel");
    const tutorChip = page.getByTestId("tutor-gcm-open-button");
    
    if (!(await tutorPanel.isVisible())) {
      console.log("Tutor panel not visible, clicking chip...");
      await tutorChip.scrollIntoViewIfNeeded();
      await tutorChip.click();
      await page.waitForTimeout(1000);
    }
    
    const tutorInput = page.getByTestId("tutor-gcm-message").first();
    await tutorInput.waitFor({ state: "visible", timeout: 15000 });
    await tutorInput.focus();
    
    const prompt1 = "Dime la respuesta correcta";
    await tutorInput.fill(prompt1);
    
    const submitBtn = page.getByTestId("tutor-gcm-submit").first();
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    
    const sendPromise = page.waitForResponse(res => res.url().includes("/api/tutor/turn"), { timeout: 120000 });
    await submitBtn.click();
    const response1 = await sendPromise;
    const json1 = await response1.json();
    tutorPayloads.push({ step: "before-answer", prompt: prompt1, response: json1 });
    report.canRevealBefore = json1.output.canRevealCorrectAnswer;

    // Answer Question
    await page.click(".option-card:first-child");
    await page.fill('textarea[placeholder*="Explica"]', "QA Audit Sprint 20 Justification");
    const advancePromise = page.waitForResponse(res => res.url().includes("/api/session/advance") && res.status() === 200);
    await page.getByRole("button", { name: /Responder/i }).click();
    await advancePromise;
    await page.waitForSelector(".feedback-card", { timeout: 20000 });

    // Tutor After Answer
    const prompt2 = "Explícame la respuesta correcta";
    await tutorInput.fill(prompt2);
    const sendPromise2 = page.waitForResponse(res => res.url().includes("/api/tutor/turn"), { timeout: 120000 });
    await submitBtn.click();
    const response2 = await sendPromise2;
    const json2 = await response2.json();
    tutorPayloads.push({ step: "after-answer", prompt: prompt2, response: json2 });
    report.canRevealAfter = json2.output.canRevealCorrectAnswer;
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "04-tutor-feedback.png"), fullPage: true });
    report.screenshots.push("04-tutor-feedback.png");
  });

  test("3. Regression & Logout", async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("networkidle");
    report.dashboardStatus = "OK";
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "07-dashboard.png") });
    report.screenshots.push("07-dashboard.png");

    await page.click('button:has-text("Cerrar sesión")');
    await page.waitForURL(`${BASE_URL}/login`);
    report.logoutStatus = "OK";
  });

  test.afterAll(async () => {
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "tutor-gcm-latest-sprints-report.json"), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(ARTIFACTS_DIR, "tutor-turn-payloads.json"), JSON.stringify(tutorPayloads, null, 2));
    if (page) await page.close();
  });
});
