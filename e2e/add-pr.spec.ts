import { test, expect } from "@playwright/test";
import { gotoApp, resetMockData, clickSaveButton } from "./helpers";

test.describe("Add PR flow", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
  });

  test("navigates to workout picker via bottom nav", async ({ page }) => {
    await page.locator('a[href="/add"]').first().click();
    await expect(page).toHaveURL("/add");
    await expect(page.getByText("Back Squat")).toBeVisible();
  });

  test("picks a preset exercise and shows add form", async ({ page }) => {
    await page.goto("/add");
    await page.getByText("Back Squat").click();
    await expect(page).toHaveURL(/\/add\/Back%20Squat/i);
    await expect(page.locator("h2").first()).toContainText("Back Squat");
  });

  test("submits a new PR and returns to home with new card visible", async ({
    page,
  }) => {
    await page.goto("/add/Back%20Squat");
    await page.locator("#weight").fill("120");
    await page.locator("#reps").fill("3");
    await clickSaveButton(page);
    await expect(page).toHaveURL("/");
    await expect(page.getByText("120")).toBeVisible();
  });

  test("shows validation error when weight is empty", async ({ page }) => {
    await page.goto("/add/Deadlift");
    await page.locator("#weight").fill("");
    await page.locator("#reps").fill("5");
    await clickSaveButton(page);
    const valid = await page
      .locator("#weight")
      .evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(valid).toBe(false);
  });
});
