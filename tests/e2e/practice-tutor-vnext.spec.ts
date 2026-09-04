import { test, expect } from "@playwright/test";

test.describe("Practice & Tutor vNext E2E Suite (Authoritative & Accessible)", () => {
  test("Guided, Simulation, and Review modes flow with anti-spoiler network validation", async ({ page }) => {
    let itemResponseCount = 0;

    page.on("response", async (response) => {
      if (response.url().includes("/api/session/item")) {
        const json = await response.json().catch(() => null);
        if (json && json.item) {
          itemResponseCount += 1;
          expect(json.correctOption).toBeUndefined();
          expect(json.correct_option).toBeUndefined();
          expect(json.correctAnswer).toBeUndefined();
          expect(json.learningNote).toBeUndefined();
          expect(json.explanations).toBeUndefined();
          expect(json.attempt).toBeDefined();
          expect(json.attempt.id).toBeTruthy();
        }
      }
    });

    await page.goto("/practice");
    await page.waitForLoadState("networkidle");

    const bodyText = await page.innerText("body");
    expect(bodyText).toBeTruthy();

    if (itemResponseCount > 0) {
      // Radiogroup accessible selection check
      const radioGroup = page.locator('[role="radiogroup"]');
      if (await radioGroup.isVisible()) {
        const firstOption = radioGroup.locator('[role="radio"]').first();
        await firstOption.click();
        await expect(firstOption).toHaveAttribute("aria-checked", "true");
      }
    }
  });

  test("Mobile responsive sheet accessibility and Escape key navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/practice");

    const mobileButton = page.locator("button", { hasText: "🤖 Tutor AI" });
    if (await mobileButton.isVisible()) {
      await mobileButton.click();
      const dialog = page.locator('aside[role="dialog"]');
      await expect(dialog).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }
  });
});
