import { defineConfig, devices } from "@playwright/test";

/** iPhone SE dimensions on Chromium (CI installs chromium only). */
const narrowMobile = {
  ...devices["Desktop Chrome"],
  viewport: devices["iPhone SE"].viewport,
  deviceScaleFactor: devices["iPhone SE"].deviceScaleFactor,
  isMobile: true,
  hasTouch: true,
};

const sharedUse = {
  baseURL: "http://localhost:5173",
  trace: "on-first-retry" as const,
  locale: "he-IL",
  navigationTimeout: 8_000,
  actionTimeout: 5_000,
};

export default defineConfig({
  testDir: "./e2e",
  timeout: 10_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: sharedUse,
  projects: [
    /* Phone-class widths run the full suite. */
    {
      // Was misleadingly named "desktop": 480px is the old mobile shell width.
      name: "mobile-wide",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 480, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "mobile-narrow",
      use: narrowMobile,
    },
    /**
     * Wider tiers run only layout-tagged specs — functional behaviour is already
     * covered at phone widths, and `workers: 1` makes a full cross-product costly.
     */
    {
      name: "tablet",
      grep: /@layout/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 834, height: 1112 },
      },
    },
    {
      name: "desktop",
      grep: /@layout/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    // Avoid `npx` wrapper here; Playwright terminates direct node child reliably on Windows.
    command: "node ./node_modules/vite/bin/vite.js --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      ...process.env,
      VITE_E2E_MOCK: "true",
    },
  },
});
