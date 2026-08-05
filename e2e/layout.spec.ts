import { test, expect } from "@playwright/test";
import {
  assertClearOfBottomNav,
  assertFilterPanelAboveBottomNav,
  assertNoHorizontalOverflow,
  countColumnsInFirstRow,
  getNavMode,
  gotoApp,
  openFilters,
  pickFilterSelect,
  resetMockData,
  seedManyPrs,
} from "./helpers";

const ROUTES = ["/", "/add", "/stats"] as const;

/** Tier boundaries — keep in sync with the media queries in src/styles/global.css. */
const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

test.describe("Layout — no horizontal overflow @layout", () => {
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
    const boxes = await page
      .getByTestId("pr-card")
      .evaluateAll((cards) => cards.map((c) => c.getBoundingClientRect().width));
    for (const width of boxes) {
      expect(width).toBeLessThanOrEqual(viewportWidth + 1);
    }
  });
});

test.describe("Layout — responsive tiers @layout", () => {
  test("nav is a rail at >=1024 and a bottom bar below", async ({ page }) => {
    await gotoApp(page);
    const width = page.viewportSize()?.width ?? 0;
    const mode = await getNavMode(page);
    expect(mode).toBe(width >= DESKTOP_MIN ? "rail" : "bottom-bar");
  });

  test("PR list gains columns at >=768", async ({ page }) => {
    await gotoApp(page);
    await seedManyPrs(page, 6);
    const width = page.viewportSize()?.width ?? 0;
    const columns = await countColumnsInFirstRow(page.getByTestId("pr-card"));
    if (width >= TABLET_MIN) {
      expect(columns).toBeGreaterThanOrEqual(2);
    } else {
      expect(columns).toBe(1);
    }
  });

  test("workout picker gains columns at >=768", async ({ page }) => {
    await gotoApp(page);
    await page.goto("/add");
    await page.locator("h1").first().waitFor();
    const width = page.viewportSize()?.width ?? 0;
    const columns = await countColumnsInFirstRow(page.locator("li"));
    if (width >= TABLET_MIN) {
      expect(columns).toBeGreaterThanOrEqual(2);
    } else {
      expect(columns).toBe(1);
    }
  });

  test("progress chart height stays bounded", async ({ page }) => {
    await gotoApp(page);
    await page.goto("/stats");
    await page.locator("h1").first().waitFor();
    const chart = page.locator("svg").first();
    await expect(chart).toBeVisible();
    const height = await chart.evaluate((el) => el.getBoundingClientRect().height);
    // A 2:1 viewBox with height:auto rendered ~700px tall before being capped.
    expect(height).toBeLessThanOrEqual(400);
  });

  test("editing keeps the list visible at >=1024", async ({ page }) => {
    await gotoApp(page);
    await page
      .getByTestId("pr-card")
      .first()
      .getByRole("button", { name: /edit|ערוך/i })
      .click();

    const width = page.viewportSize()?.width ?? 0;
    const editPanel = page.getByTestId("edit-panel");
    await expect(editPanel).toBeVisible();

    if (width >= DESKTOP_MIN) {
      await expect(page.getByTestId("pr-card").first()).toBeVisible();
    } else {
      // Below desktop, editing replaces the page exactly as it always has.
      await expect(page.getByTestId("pr-card").first()).toBeHidden();
    }
  });

  test("the overflow guard can actually fail", async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => {
      const target = document.querySelector("main") ?? document.body;
      const bad = document.createElement("div");
      bad.style.width = "3000px";
      bad.style.height = "10px";
      target.appendChild(bad);
    });

    let detected = false;
    try {
      await assertNoHorizontalOverflow(page);
    } catch {
      detected = true;
    }
    expect(detected, "overflow guard must detect a 3000px-wide child").toBe(true);
  });
});

test.describe("Layout — bottom nav does not cover content @layout", () => {
  test("last PR card stays above bottom nav when scrolled to end", async ({ page }) => {
    await gotoApp(page);
    await seedManyPrs(page, 12);
    const lastCard = page.getByTestId("pr-card").last();
    await expect(lastCard).toBeVisible();
    await assertClearOfBottomNav(page, lastCard);
  });

  test("last statistics group card stays above bottom nav when scrolled to end", async ({
    page,
  }) => {
    await gotoApp(page);
    await page.goto("/stats");
    await page.locator("h1").first().waitFor();
    const lastGroup = page.getByTestId("stats-group-card").last();
    await expect(lastGroup).toBeVisible();
    await assertClearOfBottomNav(page, lastGroup);
  });
});

test.describe("Filters popover — short list @layout", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await resetMockData(page);
  });

  test("panel stays above bottom nav when only one PR is visible", async ({ page }) => {
    await openFilters(page);
    await pickFilterSelect(page, "filter-exercise", "Back Squat");
    await expect(page.getByTestId("pr-card")).toHaveCount(1);
    await expect(page.getByTestId("filters-panel")).toBeVisible();
    await assertFilterPanelAboveBottomNav(page);
  });
});
