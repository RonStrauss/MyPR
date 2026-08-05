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

/** Selector for the primary nav, which renders as a bottom bar or a side rail. */
export const PRIMARY_NAV = '[data-testid="primary-nav"]';

/** Rail mode covers most of the viewport height; the bottom bar is ~64px tall. */
const RAIL_HEIGHT_RATIO = 0.6;

/**
 * No horizontal overflow.
 *
 * The scroll container is `.shell` ([data-scroll-root]), NOT the document, and it
 * sets `overflow-x: hidden` — so overflowing content is contained there and never
 * widens documentElement/body. Asserting only on those made this check
 * unfalsifiable: a 3000px-wide child still passed. The scroll-root assertion is
 * the one that can actually fail.
 */
export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const root = document.querySelector<HTMLElement>("[data-scroll-root]");
    return {
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      rootScrollWidth: root?.scrollWidth ?? 0,
      rootClientWidth: root?.clientWidth ?? 0,
      hasRoot: Boolean(root),
    };
  });
  expect(overflow.hasRoot, "scroll root [data-scroll-root] not found").toBe(true);
  expect(overflow.docScrollWidth).toBeLessThanOrEqual(overflow.docClientWidth + 1);
  expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.bodyClientWidth + 1);
  expect(
    overflow.rootScrollWidth,
    `Scroll root overflows: ${overflow.rootScrollWidth}px of content in a ${overflow.rootClientWidth}px box`
  ).toBeLessThanOrEqual(overflow.rootClientWidth + 1);
}

/**
 * How many items sit on the first row — i.e. the rendered column count.
 * Compares rounded `top` offsets, so it works for both flex columns and grids.
 */
export async function countColumnsInFirstRow(locator: Locator): Promise<number> {
  const tops = await locator.evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().top))
  );
  if (tops.length === 0) return 0;
  const firstRowTop = Math.min(...tops);
  return tops.filter((top) => Math.abs(top - firstRowTop) <= 2).length;
}

/** Which mode the primary nav is currently rendering in. */
export async function getNavMode(page: Page): Promise<"rail" | "bottom-bar"> {
  return page.evaluate(
    ([selector, ratio]) => {
      const nav = document.querySelector<HTMLElement>(selector as string);
      if (!nav) throw new Error("Primary nav not found");
      const rect = nav.getBoundingClientRect();
      return rect.height > window.innerHeight * (ratio as number)
        ? ("rail" as const)
        : ("bottom-bar" as const);
    },
    [PRIMARY_NAV, RAIL_HEIGHT_RATIO] as const
  );
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

/**
 * True when the element's box ends above the bottom nav (and FAB overhang).
 * In rail mode the nav sits beside the content, so it cannot cover it vertically
 * and the check passes trivially rather than failing on irrelevant geometry.
 */
export async function getBottomNavOverlap(locator: Locator): Promise<BottomNavOverlap> {
  return locator.evaluate(
    (el, [selector, ratio]) => {
      const nav = document.querySelector<HTMLElement>(selector as string);
      if (!nav) {
        return { ok: false, bottom: 0, blockTop: 0, overlapPx: 0 };
      }
      const navRect = nav.getBoundingClientRect();
      const bottom = el.getBoundingClientRect().bottom;

      if (navRect.height > window.innerHeight * (ratio as number)) {
        return { ok: true, bottom, blockTop: navRect.top, overlapPx: 0 };
      }

      const fab = nav.querySelector<HTMLElement>('[class*="fab"]');
      const fabTop = fab?.getBoundingClientRect().top ?? navRect.top;
      const blockTop = Math.min(navRect.top, fabTop);
      const gap = 4;
      const overlapPx = bottom - (blockTop - gap);
      return {
        ok: overlapPx <= 0,
        bottom,
        blockTop,
        overlapPx,
      };
    },
    [PRIMARY_NAV, RAIL_HEIGHT_RATIO] as const
  );
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

/**
 * Scroll a control clear of the fixed bottom nav (for nested shell scrolling).
 * A side rail obstructs nothing vertically, so no clearance is applied in rail mode —
 * treating a rail's top edge as the obstruction would scroll by a wrong, large amount.
 */
export async function scrollClearOfBottomNav(page: Page, locator: Locator) {
  await locator.evaluate(
    (el, [selector, ratio]) => {
      const root = document.querySelector<HTMLElement>("[data-scroll-root]");
      if (!root) return;
      const nav = document.querySelector<HTMLElement>(selector as string);
      const navRect = nav?.getBoundingClientRect();
      const isRail = navRect
        ? navRect.height > window.innerHeight * (ratio as number)
        : false;
      const navTop = !navRect || isRail ? window.innerHeight : navRect.top;
      const clearance = 88;
      const bottom = el.getBoundingClientRect().bottom;
      if (bottom > navTop - clearance) {
        root.scrollTop += bottom - navTop + clearance;
      }
    },
    [PRIMARY_NAV, RAIL_HEIGHT_RATIO] as const
  );
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
    const scrollY = root === document.documentElement ? window.scrollY : root.scrollTop;

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

/**
 * The filter panel stays inside the visible area — above the bottom bar when there
 * is one, otherwise within the scroll root — and is never collapsed to the 140px
 * floor while space is available.
 */
export async function assertFilterPanelAboveBottomNav(page: Page) {
  const panel = page.getByTestId("filters-panel");
  await expect(panel).toBeVisible();

  const bounds = await page.evaluate(
    ([selector, ratio]) => {
      const panelEl = document.querySelector('[data-testid="filters-panel"]');
      const navEl = document.querySelector<HTMLElement>(selector as string);
      const root = document.querySelector<HTMLElement>("[data-scroll-root]");
      if (!panelEl || !navEl || !root) return null;
      const p = panelEl.getBoundingClientRect();
      const n = navEl.getBoundingClientRect();
      const isRail = n.height > window.innerHeight * (ratio as number);
      const style = window.getComputedStyle(panelEl);
      return {
        panelTop: p.top,
        panelBottom: p.bottom,
        limit: isRail ? root.getBoundingClientRect().bottom : n.top,
        isRail,
        maxHeightPx: Number.parseFloat(style.maxHeight) || 0,
        overflowY: style.overflowY,
      };
    },
    [PRIMARY_NAV, RAIL_HEIGHT_RATIO] as const
  );

  expect(bounds).not.toBeNull();
  expect(
    bounds!.panelBottom,
    `Panel bottom ${bounds!.panelBottom}px passed the ${
      bounds!.isRail ? "scroll-root bottom" : "nav top"
    } at ${bounds!.limit}px`
  ).toBeLessThanOrEqual(bounds!.limit + 1);
  expect(bounds!.overflowY).toMatch(/auto|scroll/);

  /**
   * Regression guard for the nav-geometry bug: deriving the panel height from a
   * top/side nav produced a permanent 140px box. With room available, use it.
   */
  const available = bounds!.limit - bounds!.panelTop - 8;
  if (available > 300) {
    expect(
      bounds!.maxHeightPx,
      `Panel clamped to ${bounds!.maxHeightPx}px despite ${Math.round(available)}px available`
    ).toBeGreaterThan(200);
  }

  const lastField = panel.locator('input[type="checkbox"]').last();
  await lastField.scrollIntoViewIfNeeded();
  await expect(lastField).toBeInViewport();
}
