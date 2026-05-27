import { test, expect } from "@playwright/test";
import {
  assertScrollBlocked,
  assertScrollUnblocked,
  ensureScrollable,
  gotoApp,
  openDeleteModal,
  resetMockData,
} from "./helpers";

test.describe("Delete PR modal", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
  });

  test("shows exercise and lift details", async ({ page }) => {
    const deadliftCard = page.getByTestId("pr-card").filter({ hasText: "Deadlift" });
    await deadliftCard.getByRole("button", { name: /Delete|מחק/i }).click();
    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog.getByText("Deadlift")).toBeVisible();
    await expect(confirmDialog.getByText(/140.*3|140.*×.*3/)).toBeVisible();
  });

  test("closes on browser back", async ({ page }) => {
    await openDeleteModal(page);
    await page.goBack();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("pr-card")).toHaveCount(2);
  });

  test("blocks background scroll while open", async ({ page }) => {
    await ensureScrollable(page);
    await openDeleteModal(page);
    await assertScrollBlocked(page);
  });

  test("allows background scroll after close", async ({ page }) => {
    await ensureScrollable(page);
    await openDeleteModal(page);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Cancel|ביטול/i })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await assertScrollUnblocked(page);
  });
});
