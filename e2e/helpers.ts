import { expect, type Page } from "@playwright/test";

export async function assertMocksActive(page: Page) {
  const active = await page.evaluate(
    () => (window as Window & { __e2eMock?: boolean }).__e2eMock === true
  );
  expect(active, "E2E mocks not active — is VITE_E2E_MOCK=true?").toBe(true);
}

export async function waitForPrList(page: Page) {
  await page.getByTestId("pr-card").first().waitFor({ state: "visible" });
}

/** Navigate and wait until seeded PR cards are visible */
export async function gotoApp(page: Page, path = "/") {
  await page.goto(path);
  await assertMocksActive(page);
  await waitForPrList(page);
}

/** Reset in-memory mock data (call after page is loaded) */
export async function resetMockData(page: Page) {
  await assertMocksActive(page);
  await page.evaluate(() => {
    const w = window as Window & { __e2eReset?: () => void };
    w.__e2eReset?.();
  });
  await waitForPrList(page);
}

/** Open filters popover */
export async function openFilters(page: Page) {
  await page.getByRole("button", { name: /סינון|filter/i }).click();
  await expect(page.getByTestId("filters-panel")).toBeVisible();
}

/** Pick an option from a filter select by field id */
export async function pickFilterSelect(
  page: Page,
  fieldId: string,
  optionLabel: string
) {
  const panel = page.getByTestId("filters-panel");
  await expect(panel).toBeVisible();
  await panel.locator(`#${fieldId}`).click();
  await page.getByRole("option", { name: optionLabel, exact: true }).click();
}

/** No document-level horizontal scroll */
export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
    };
  });
  expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.docClientWidth + 1);
  expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.bodyClientWidth + 1);
}

/** Filter panel bottom stays above the bottom nav and can scroll to the end */
export async function assertFilterPanelAboveBottomNav(page: Page) {
  const panel = page.getByTestId("filters-panel");
  await expect(panel).toBeVisible();

  const bounds = await page.evaluate(() => {
    const panelEl = document.querySelector('[data-testid="filters-panel"]');
    const navEl = document.querySelector('[data-testid="bottom-nav"]');
    if (!panelEl || !navEl) return null;
    const p = panelEl.getBoundingClientRect();
    const n = navEl.getBoundingClientRect();
    const style = window.getComputedStyle(panelEl);
    return {
      panelBottom: p.bottom,
      navTop: n.top,
      overflowY: style.overflowY,
      scrollHeight: panelEl.scrollHeight,
      clientHeight: panelEl.clientHeight,
    };
  });

  expect(bounds).not.toBeNull();
  expect(bounds!.panelBottom).toBeLessThanOrEqual(bounds!.navTop + 1);
  expect(bounds!.overflowY).toMatch(/auto|scroll/);

  const lastField = panel.locator('input[type="checkbox"]').last();
  await lastField.scrollIntoViewIfNeeded();
  await expect(lastField).toBeInViewport();
}
