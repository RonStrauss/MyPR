import { test, expect } from "@playwright/test";
import { gotoApp, openFilters, pickFilterSelect, resetMockData } from "./helpers";

test.describe("Home — PR list", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
  });

  test("shows seeded PR cards", async ({ page }) => {
    await expect(page.getByText("Back Squat")).toBeVisible();
    await expect(page.getByText("Deadlift")).toBeVisible();
  });

  test("stats bar shows total record count", async ({ page }) => {
    const statValue = page.locator('[class*="statBoxValue"]').first();
    await expect(statValue).toHaveText("2");
  });

  test("filters button is visible", async ({ page }) => {
    await expect(page.locator('[aria-haspopup="dialog"]')).toBeVisible();
  });

  test("filters panel opens and closes", async ({ page }) => {
    await page.locator('[aria-haspopup="dialog"]').click();
    const panel = page.locator('[role="dialog"]');
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
  });

  test("filter by exercise hides non-matching cards", async ({ page }) => {
    await openFilters(page);
    await pickFilterSelect(page, "filter-exercise", "Back Squat");
    await expect(
      page.getByTestId("pr-card").filter({ hasText: "Deadlift" })
    ).not.toBeVisible();
    await expect(
      page.getByTestId("pr-card").filter({ hasText: "Back Squat" })
    ).toBeVisible();
  });

  test("clear filters restores all records", async ({ page }) => {
    await openFilters(page);
    await pickFilterSelect(page, "filter-exercise", "Back Squat");
    const panel = page.getByRole("dialog");
    await panel.getByRole("button").filter({ hasText: /clear|נקה/i }).click();
    await expect(page.getByText("Deadlift")).toBeVisible();
    await expect(page.getByText("Back Squat")).toBeVisible();
  });
});
