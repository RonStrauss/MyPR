## MyPR – Agent Guide

This file documents expectations for automated agents (and future contributors) working on this repo.

### Firestore rules

- **Always deploy rules after changes**:  
  Whenever you modify `firestore.rules`, you **must** run:

  ```bash
  npm run firebase:deploy-rules
  ```

- **Project selection**:  
  The `firebase:deploy-rules` script reads `VITE_FIREBASE_PROJECT_ID` from your local `.env`. Make sure it is set correctly before deploying.

### Versioning

- **Respect semantic versioning** for `package.json`:
  - **PATCH** (`x.y.z → x.y.(z+1)`): Backwards-compatible bug fixes, refactors, copy/layout tweaks, or internal tooling changes.
  - **MINOR** (`x.y.z → x.(y+1).0`): Backwards-compatible features or noticeable UX improvements (new stats, filters, flows, etc.).
  - **MAJOR** (`x.y.z → (x+1).0.0`): Breaking changes to data, APIs, or user flows that may require migration.
- **After a meaningful series of changes**, bump the version **once** before merging and keep the changelog in the PR description / commit message.

### Firebase & environment

- **Local-only Firebase commands** (like `firebase:deploy-rules`) assume you are logged in with the correct Google account and have the Firebase CLI installed.
- Do **not** commit `.env` or any real Firebase credentials; use `.env.example` and `.firebaserc.example` as templates.

### Frontend / UX conventions

- **RTL & i18n**:
  - Hebrew (`he`) is the default and should always render with `dir="rtl"`; English (`en`) with `dir="ltr"`.
  - When adding new components with text or layout, verify they look correct in both languages (especially grids, flex alignment, and icons/chevrons).
- **Filters & navigation**:
  - The home filters popover should _not_ auto-open when navigating unless explicitly requested in state.
  - The filters badge shows the **number of active filters**, not the filtered result count.

### Testing & quality

- **Before pushing or opening a PR**, run:

  ```bash
  npm run format:check  # Prettier (no write)
  npm run lint          # ESLint
  npm test              # unit tests (Vitest)
  npm run build         # TypeScript + Vite build
  npm run test:e2e      # Playwright end-to-end tests
  ```

  All three must pass.

- **E2E tests** run against a local Vite dev server with `VITE_E2E_MOCK=true`, which replaces Firebase Auth and Firestore with an in-memory stub. No real Firebase credentials are needed to run them.
  - Playwright runs **desktop** (480×900), **Pixel 5**, and **iPhone SE** viewports.
  - Browsers are installed with `npx playwright install --with-deps chromium`.
  - Use `npm run test:e2e:ui` for interactive debugging.

- Avoid adding new dependencies unless necessary; prefer lightweight, composable solutions that fit the existing stack (React + Vite + Firebase + Radix Select + Lucide + Playwright).
