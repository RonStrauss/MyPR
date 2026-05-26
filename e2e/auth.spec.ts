import { test, expect } from "@playwright/test";
import { gotoApp } from "./helpers";

test.describe("Auth & routing", () => {
  test("mock auth lands on home", async ({ page }) => {
    await gotoApp(page);
    await expect(page).toHaveURL("/");
  });

  test("home page shows PR list heading", async ({ page }) => {
    await gotoApp(page);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("unknown routes redirect to home", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("pr-card").first()).toBeVisible();
  });
});
