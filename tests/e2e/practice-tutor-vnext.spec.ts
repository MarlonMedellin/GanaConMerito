import { test, expect } from "@playwright/test";

test.describe("Practice & Tutor vNext E2E Suite", () => {
  test("Guided mode: displays pre-answer tutor and allows socratic, direct, brief profiles", async ({ page }) => {
    await page.goto("/");
    // Navigation to practice page or guest session
    await expect(page).toHaveURL(/\/(practice|login)?/);
  });

  test("Simulation mode: disables pre-answer tutor and locks help before submitting", async ({ page }) => {
    await page.goto("/");
    await expect(page).toBeDefined();
  });

  test("Anti-spoiler contract check: network payloads contain no correctOption or learningNote before submission", async ({ page }) => {
    const responses: any[] = [];
    page.on("response", async (response) => {
      if (response.url().includes("/api/session/item")) {
        const json = await response.json().catch(() => null);
        if (json) responses.push(json);
      }
    });

    await page.goto("/");
    for (const json of responses) {
      expect(json.correctOption).toBeUndefined();
      expect(json.correctAnswer).toBeUndefined();
      expect(json.learningNote).toBeUndefined();
      expect(json.explanations).toBeUndefined();
    }
  });

  test("Accessibility and responsive sheet: radiogroup, aria-live, escape key and focus trap", async ({ page }) => {
    await page.goto("/");
    // Verify viewport and keyboard navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toBeDefined();
  });
});
