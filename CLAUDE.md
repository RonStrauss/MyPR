# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

MyPR is a mobile-first gym personal-record (PR) tracker: React 19 + Vite + TypeScript, Firebase Auth (Google only) + Firestore, deployed to Cloudflare Workers as an SPA/PWA. Hebrew (RTL) is the default language.

`AGENTS.md` holds the project's own agent conventions (versioning, Firestore rules deploys, UX rules) — read it too; the essentials are summarized below.

## Commands

```bash
npm run dev                    # Vite dev server (localhost:5173)
npm run build                  # tsc --noEmit && vite build  (type errors fail the build)
npm run lint                   # ESLint (lint:fix to autofix)
npm run format:check           # Prettier check (format to write)
npm test                       # Vitest, single run
npm run test:e2e               # Playwright, 3 viewport projects
npm run test:e2e:ui            # Playwright interactive UI
npm run preview                # build + wrangler dev (Workers runtime locally)
npm run deploy                 # build + wrangler deploy
npm run firebase:deploy-rules  # deploy firestore.rules to VITE_FIREBASE_PROJECT_ID from .env
```

Single unit test: `npx vitest run src/lib/statistics.test.ts` (or `-t "pattern"`).
Single e2e test: `npx playwright test e2e/home.spec.ts --project=desktop` (projects: `desktop` 480×900, `mobile` Pixel 5, `mobile-narrow` iPhone SE — all Chromium).

CI (`.github/workflows/ci.yml`, PRs to main/master) runs `format:check`, `lint`, `test`, `build` in one job and Playwright in another. Run all five locally before pushing.

## Architecture

**Data flow.** Firestore is the only store; there is no client-side cache layer or global state manager. `services/prService.ts` owns all reads/writes against `users/{uid}/prs/{prId}`; `hooks/usePrs.ts` wraps its `onSnapshot` subscription and is the single source of PR data for pages. Pages derive everything else with `useMemo` over the record array (`lib/prRanking`, `lib/prFilters`, `lib/statistics`) — filtering, "best PR" detection, and stats are pure functions, never queries.

**Validation is duplicated on purpose.** `lib/validation.ts` (`validatePrInput`, `sanitizeNotes`) runs client-side before every write, and `firestore.rules` re-checks the same invariants server-side (required keys, exercise ≤120 chars, non-negative weight, integer reps, `YYYY-MM-DD` date in 1900–2999, notes ≤1000 chars with no `<`/`>`, `createdAt == request.time` on create). **Changing one means changing the other**, and per `AGENTS.md` any `firestore.rules` edit must be followed by `npm run firebase:deploy-rules`.

**E2E mocking via build-time aliasing.** When `VITE_E2E_MOCK=true`, `vite.config.ts` swaps three modules for in-memory stubs and skips the Cloudflare plugin:

| Real                     | Mock                                                   |
| ------------------------ | ------------------------------------------------------ |
| `@/contexts/AuthContext` | `src/e2e-mock/MockAuthProvider.tsx` (always signed in) |
| `@/services/prService`   | `src/e2e-mock/mockPrService.ts`                        |
| `@/lib/firebase`         | `src/e2e-mock/firebase.ts` (inert stub)                |

`src/e2e-mock/store.ts` is the shared in-memory store and exposes `window.__e2eMock`, `__e2eReset()`, `__e2eSeedMany(n)`, which `e2e/helpers.ts` drives. No Firebase credentials are needed for e2e. Mocks must keep the same module surface as the real files (including `PrValidationError`) or the alias breaks at runtime.

**Test split.** Vitest is configured inside `vite.config.ts` with `environment: "node"` and `include: ["src/**/*.test.ts"]` — so unit tests cover only pure logic in `src/lib/` (`.test.ts`, never `.tsx`). All component, layout, and interaction coverage lives in Playwright. Don't reach for a component-test setup; add an e2e spec instead.

**Feature flags.** `src/config/features.ts` reads `import.meta.env` at build time. The `visibility` (public/private PR sharing) flag is currently off and is enforced in three places: `prService.assertValidInput` forces `isPublic: false`, `prFilters` (`uiFilters`, `countActiveFilters`, `applyPrFilters`) ignores the visibility filter, and the UI hides the controls. Keep all three consistent when touching visibility.

**Routing & shell.** `App.tsx` gates on `useAuth()`: unauthenticated users only get `/auth`, authenticated users get `/` (home), `/add`, `/add/:exercise`, `/stats` under `components/Layout/Layout.tsx`. All pages are `React.lazy`. Cross-page navigation passes typed state through `lib/navigation.ts` (`HomePageState`, `filtersFor*` builders) rather than query params.

**Layout contract.** The shell — not `document` — is the scroll container: `[data-scroll-root]` on the shell div, `[data-testid="bottom-nav"]` for the fixed bottom nav, and `--layout-bottom-inset` in `styles/global.css` to keep content clear of the nav + FAB. Several e2e helpers assert against exactly these hooks, so preserve them when restyling the shell.

**Styling.** CSS Modules colocated per component (`Component/Component.module.css`) plus design tokens and shared `.btn`/`.btn-primary`/`.btn-ghost` classes in `src/styles/global.css`. Dark theme, orange accent — use the CSS variables, not literal colors.

**PWA.** `vite-plugin-pwa` with `registerType: "prompt"`; `components/UpdateBanner/UpdateBanner.tsx` surfaces the update via `useRegisterSW` and falls back to `window.location.reload()` after a 10s timeout. `src/version.ts` exposes `__APP_VERSION__`, injected from `package.json` by Vite.

## Conventions

- Everything written into the repo is in English — commit messages, PR titles and descriptions, code comments, identifiers, and docs — regardless of the language a discussion happens in. The exception is user-facing copy, which is translated in `src/i18n/locales/{he,en}.json`.
- Import via the `@/` alias (mapped in both `tsconfig*.json` and `vite.config.ts`); relative imports only inside `src/e2e-mock/`.
- Hebrew (`he`) is the default with `dir="rtl"`, English (`en`) is `ltr` — `src/i18n/index.ts` sets `documentElement.dir`/`lang` and persists to `localStorage`. Every user-facing string goes in both `src/i18n/locales/{he,en}.json`, and new layouts must be checked in both directions (grids, flex alignment, chevron/icon direction).
- Playwright runs with `locale: "he-IL"`, so selectors must match Hebrew or use regex alternation (`/save|שמור/i`) — see the existing helpers.
- Firestore rejects `undefined`: omit optional fields (`notes`) rather than writing them, as `toFirestoreFields` does.
- Bump `package.json` version once per meaningful change set, semver per `AGENTS.md` (patch = fixes/refactors/copy, minor = features/UX, major = breaking data or flow changes).
- Filters UI: the popover must not auto-open on navigation unless state explicitly requests it, and the badge shows the count of _active filters_, not results.
- Avoid new dependencies; prefer composing what's here (React + Firebase + Radix Select + Lucide).
- Never commit `.env` or `.firebaserc` — `.env.example` and `.firebaserc.example` are the templates.
