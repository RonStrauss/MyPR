import { expect, type Locator, type Page } from "@playwright/test";

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

/** Simulate a pointer click outside an open Radix select (Playwright clicks are blocked). */
export async function pointerDownOutsideSelect(page: Page) {
  await page.evaluate(() => {
    const init: PointerEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: 8,
      clientY: 8,
    };
    document.dispatchEvent(new PointerEvent("pointerdown", init));
    document.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
  });
}

/** Open a filter select dropdown without choosing an option */
export async function openFilterSelect(page: Page, fieldId: string) {
  const panel = page.getByTestId("filters-panel");
  await expect(panel).toBeVisible();
  await panel.locator(`#${fieldId}`).click();
  await expect(page.getByRole("listbox")).toBeVisible();
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

/** Seed enough PRs that the home list scrolls on mobile viewports. */
export async function seedManyPrs(page: Page, count = 12) {
  await assertMocksActive(page);
  await page.evaluate((n) => {
    const w = window as Window & { __e2eSeedMany?: (count: number) => void };
    w.__e2eSeedMany?.(n);
  }, count);
  await waitForPrList(page);
}

/** Scroll the app shell to the bottom. */
export async function scrollScrollRootToBottom(page: Page) {
  await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>("[data-scroll-root]");
    if (!root) throw new Error("Scroll root not found");
    root.scrollTop = root.scrollHeight;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

type BottomNavOverlap = {
  ok: boolean;
  bottom: number;
  blockTop: number;
  overlapPx: number;
};

/** True when the element's box ends above the bottom nav (and FAB overhang). */
export async function getBottomNavOverlap(locator: Locator): Promise<BottomNavOverlap> {
  return locator.evaluate((el) => {
    const nav = document.querySelector<HTMLElement>("[data-testid=bottom-nav]");
    if (!nav) {
      return { ok: false, bottom: 0, blockTop: 0, overlapPx: 0 };
    }
    const fab = nav.querySelector<HTMLElement>('[class*="fab"]');
    const navTop = nav.getBoundingClientRect().top;
    const fabTop = fab?.getBoundingClientRect().top ?? navTop;
    const blockTop = Math.min(navTop, fabTop);
    const gap = 4;
    const bottom = el.getBoundingClientRect().bottom;
    const overlapPx = bottom - (blockTop - gap);
    return {
      ok: overlapPx <= 0,
      bottom,
      blockTop,
      overlapPx,
    };
  });
}

export async function assertClearOfBottomNav(page: Page, locator: Locator) {
  await scrollScrollRootToBottom(page);
  const result = await getBottomNavOverlap(locator);
  expect(
    result.ok,
    `Expected element bottom (${result.bottom}px) above nav zone (top ${result.blockTop}px); overlap ${result.overlapPx}px`
  ).toBe(true);
}

/** Open the delete confirmation modal for the first PR card */
export async function openDeleteModal(page: Page) {
  await page
    .getByTestId("pr-card")
    .first()
    .getByRole("button", { name: /Delete|מחק/i })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

/** Add room below the page so scroll behavior can be exercised in e2e. */
export async function ensureScrollable(page: Page) {
  await page.evaluate(() => {
    const SPACER_ID = "e2e-scroll-spacer";
    if (document.getElementById(SPACER_ID)) return;

    const target = document.querySelector("main") ?? document.body;
    const spacer = document.createElement("div");
    spacer.id = SPACER_ID;
    spacer.style.height = "200vh";
    target.appendChild(spacer);
  });
}

/** Scroll a control above the fixed bottom nav (for nested shell scrolling). */
export async function scrollClearOfBottomNav(page: Page, locator: Locator) {
  await locator.evaluate((el) => {
    const root = document.querySelector<HTMLElement>("[data-scroll-root]");
    if (!root) return;
    const nav = document.querySelector<HTMLElement>("[data-testid=bottom-nav]");
    const navTop = nav?.getBoundingClientRect().top ?? window.innerHeight;
    const clearance = 88;
    const bottom = el.getBoundingClientRect().bottom;
    if (bottom > navTop - clearance) {
      root.scrollTop += bottom - navTop + clearance;
    }
  });
}

/** Click save after clearing the fixed bottom nav overlay. */
export async function clickSaveButton(page: Page) {
  const save = page.getByRole("button", { name: /save|שמור/i });
  await scrollClearOfBottomNav(page, save);
  await save.evaluate((el) => {
    (el as HTMLButtonElement).click();
  });
}

function scrollRootSelector() {
  return "[data-scroll-root]";
}

type ScrollObservation = {
  scrollY: number;
  intersectionRatio: number;
  maxScroll: number;
};

/** Read page title visibility via IntersectionObserver. */
async function measureScroll(page: Page): Promise<ScrollObservation> {
  return page.evaluate(async (selector) => {
    const sentinel = document.querySelector("h1");
    if (!sentinel) {
      throw new Error("Scroll sentinel (h1) not found");
    }

    const root =
      document.querySelector<HTMLElement>(selector) ?? document.documentElement;
    const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
    const scrollY =
      root === document.documentElement ? window.scrollY : root.scrollTop;

    const intersectionRatio = await new Promise<number>((resolve) => {
      const io = new IntersectionObserver(
        ([entry]) => {
          io.disconnect();
          resolve(entry?.intersectionRatio ?? 0);
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      io.observe(sentinel);
    });

    return {
      scrollY,
      intersectionRatio,
      maxScroll,
    };
  }, scrollRootSelector());
}

async function emulateWheelScroll(page: Page) {
  await page.evaluate(
    (selector) =>
      new Promise<void>((resolve) => {
        const root =
          document.querySelector<HTMLElement>(selector) ?? document.documentElement;
        if (root === document.documentElement) {
          window.scrollTo(0, 0);
        } else {
          root.scrollTop = 0;
        }
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    scrollRootSelector()
  );

  const viewport = page.viewportSize();
  const x = (viewport?.width ?? 400) / 2;
  const y = (viewport?.height ?? 800) / 2;
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, 800);
  await page.mouse.wheel(0, 800);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

/** Emulate user scroll with the mouse wheel and compare sentinel visibility. */
async function attemptScroll(page: Page): Promise<{
  before: ScrollObservation;
  after: ScrollObservation;
}> {
  const before = await measureScroll(page);
  await emulateWheelScroll(page);
  const after = await measureScroll(page);
  return { before, after };
}

/** Background scroll should not move while a scroll-blocking modal is open. */
export async function assertScrollBlocked(page: Page) {
  const { before, after } = await attemptScroll(page);
  expect(after.intersectionRatio).toBeCloseTo(before.intersectionRatio, 1);
}

/** Background scroll should work again after the modal closes. */
export async function assertScrollUnblocked(page: Page) {
  const baseline = await measureScroll(page);
  expect(baseline.maxScroll).toBeGreaterThan(100);

  const { before, after } = await attemptScroll(page);
  const scrolled =
    after.scrollY > before.scrollY + 20 ||
    after.intersectionRatio < before.intersectionRatio - 0.05;
  expect(scrolled).toBe(true);
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
