import { test, expect } from "@playwright/test";
import { gotoApp, resetMockData } from "./helpers";

test.describe("Statistics page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
    await page.goto("/stats");
    await expect(page.locator('[class*="statValue"]').first()).toHaveText("2");
  });

  test("renders stats page heading", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("overview grid shows total PRs count matching seed data", async ({
    page,
  }) => {
    await expect(page.locator('[class*="statValue"]').first()).toHaveText("2");
  });

  test("progress chart is rendered when records exist", async ({ page }) => {
    await expect(page.locator("svg[role='img']")).toBeVisible();
  });

  test("group bests section contains a best button", async ({ page }) => {
    await expect(page.locator('[class*="bestBtn"]').first()).toBeVisible();
  });

  test("clicking a group best navigates to filtered home", async ({ page }) => {
    await page.locator('[class*="bestBtn"]').first().click();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("pr-card").first()).toBeVisible();
  });
});
