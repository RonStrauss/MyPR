import { test, expect } from "@playwright/test";
import {
  assertFilterPanelAboveBottomNav,
  assertNoHorizontalOverflow,
  gotoApp,
  openFilters,
  pickFilterSelect,
  resetMockData,
} from "./helpers";

const ROUTES = ["/", "/add", "/stats"] as const;

test.describe("Layout — no horizontal overflow", () => {
  for (const route of ROUTES) {
    test(`no sideways scroll on ${route}`, async ({ page }) => {
      await gotoApp(page);
      if (route !== "/") {
        await page.goto(route);
        await page.locator("h1").first().waitFor();
      }
      await assertNoHorizontalOverflow(page);
    });
  }

  test("filters popover does not widen the page", async ({ page }) => {
    await gotoApp(page);
    await openFilters(page);
    await assertNoHorizontalOverflow(page);
  });

  test("PR cards do not exceed viewport width", async ({ page }) => {
    await gotoApp(page);
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const boxes = await page.getByTestId("pr-card").evaluateAll((cards) =>
      cards.map((c) => c.getBoundingClientRect().width)
    );
    for (const width of boxes) {
      expect(width).toBeLessThanOrEqual(viewportWidth + 1);
    }
  });
});

test.describe("Filters popover — short list", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
  });

  test("panel stays above bottom nav when only one PR is visible", async ({
    page,
  }) => {
    await openFilters(page);
    await pickFilterSelect(page, "filter-exercise", "Back Squat");
    await expect(page.getByTestId("pr-card")).toHaveCount(1);
    await expect(page.getByTestId("filters-panel")).toBeVisible();
    await assertFilterPanelAboveBottomNav(page);
  });
});
