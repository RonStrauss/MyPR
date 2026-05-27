import { test, expect } from "@playwright/test";
import { gotoApp, resetMockData, clickSaveButton } from "./helpers";

test.describe("Edit and delete PRs", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
  });

  test("edit button shows edit form pre-filled with current values", async ({
    page,
  }) => {
    const deadliftCard = page.getByTestId("pr-card").filter({ hasText: "Deadlift" });
    await deadliftCard.getByRole("button", { name: /^Edit$|^ערוך$/i }).click();
    await expect(
      page.getByRole("heading", { name: /Edit PR|עריכת שיא/i })
    ).toBeVisible();
    await expect(page.locator("#weight")).toBeVisible();
    await expect(page.locator("#weight")).toHaveValue("140");
  });

  test("editing weight updates the card", async ({ page }) => {
    const deadliftCard = page.getByTestId("pr-card").filter({ hasText: "Deadlift" });
    await deadliftCard.getByRole("button", { name: /^Edit$|^ערוך$/i }).click();
    await page.locator("#weight").fill("150");
    await clickSaveButton(page);
    await expect(page.getByText("150")).toBeVisible();
  });

  test("delete removes the card after confirmation", async ({ page }) => {
    const deleteBtn = page
      .getByTestId("pr-card")
      .first()
      .getByRole("button", { name: /Delete|מחק/i });
    await deleteBtn.click();
    const confirmDialog = page.getByRole("dialog");
    await expect(
      confirmDialog.getByText(/Delete this record\?|למחוק את השיא הזה\?/)
    ).toBeVisible();
    await confirmDialog.getByRole("button", { name: /Delete|מחק/i }).click();
    await expect(page.locator('[class*="statBoxValue"]').first()).toHaveText("1");
  });

  test("delete cancel keeps the card", async ({ page }) => {
    const firstCard = page.getByTestId("pr-card").first();
    await firstCard.getByRole("button", { name: /Delete|מחק/i }).click();
    const confirmDialog = page.getByRole("dialog");
    await confirmDialog.getByRole("button", { name: /Cancel|ביטול/i }).click();
    await expect(page.getByTestId("pr-card")).toHaveCount(2);
  });
});
