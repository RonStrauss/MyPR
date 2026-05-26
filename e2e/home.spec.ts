import { test, expect } from "@playwright/test";
import {
  gotoApp,
  openFilterSelect,
  openFilters,
  pickFilterSelect,
  pointerDownOutsideSelect,
  resetMockData,
} from "./helpers";

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
    await panel
      .getByRole("button")
      .filter({ hasText: /clear|נקה/i })
      .click();
    await expect(page.getByText("Deadlift")).toBeVisible();
    await expect(page.getByText("Back Squat")).toBeVisible();
  });

  test("Escape closes open select but keeps filters panel", async ({ page }) => {
    await openFilters(page);
    await openFilterSelect(page, "filter-exercise");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("filters-panel")).toBeVisible();
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("clicking outside filters while select is open closes select but keeps panel", async ({
    page,
  }) => {
    await openFilters(page);
    await openFilterSelect(page, "filter-exercise");
    await pointerDownOutsideSelect(page);
    await expect(page.getByTestId("filters-panel")).toBeVisible();
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("clicking outside filters with select closed closes the panel", async ({
    page,
  }) => {
    await openFilters(page);
    await page.locator("h1").first().click();
    await expect(page.getByTestId("filters-panel")).not.toBeVisible();
  });
});
