# Commerce Analytics

A production-minded e-commerce analytics dashboard built with React 18 and
Vite. The application is being delivered in five reviewable phases; the current
phase establishes shared filter state, pure selectors, and tested data utilities.

## Architecture note

- **Feature-first organization:** dashboard behavior will live under
  `src/features/dashboard`; shared primitives and helpers will live under
  `src/shared`. Global styles and the data source are kept outside feature
  modules.
- **Replaceable data boundary:** `loadSalesData()` is asynchronous and imports
  static JSON so consumers do not depend on where the data comes from.
- **Generated, checked-in fixture:** `src/data/generate-sales-data.mjs`
  deterministically creates 730 aggregate records for 2025. This keeps the
  fixture reproducible and the repository free from runtime data generation.
- **CSS custom properties:** semantic color, spacing, radius, border, type, and
  focus tokens are centralized in `src/styles/tokens.css`. Component styles
  will consume these tokens rather than introducing one-off values.
- **Trade-off:** the starter shell and complete design-token palette are added
  before the dashboard UI; this avoids coupling the data layer to presentation
  and gives later phases a stable baseline.
- **One filter source of truth:** Zustand stores only date/category/region
  filters. URL parameters serialize the same values and browser `popstate`
  restores them; analytics are recalculated by pure selectors, not duplicated
  in state.
- **Explicit comparison availability:** deltas compare a selected, inclusive
  date period with the immediately preceding period. A delta is unavailable
  when no previous period is selected or the fixture contains no records for
  that comparison interval.
- **Testable boundaries:** the reducer, URL codec, selectors, delta math, and
  RFC-style CSV cell escaping have no React dependencies and are exercised by
  Vitest. Current utility/state coverage is enforced at 80% minimum.

## Current foundation

- React 18 + Vite, plain JavaScript and JSX.
- Static JSON fixture and deterministic regeneration command:
  `node src/data/generate-sales-data.mjs`.
- Light and dark semantic token sets; the theme switcher is added in a later
  phase.
- Vitest, React Testing Library, ESLint, and Prettier are configured as the
  project grows.
- Zustand filter reducer/store with canonical URL serialization and
  back/forward synchronization.
- Pure filter, KPI, period comparison, revenue trend, category, region, and
  channel selectors; shared escaped CSV serialization.

## Setup

```sh
npm install
npm run dev
```

Available scripts: `dev`, `build`, `preview`, `lint`, `format`,
`format:check`, `test`, `test:coverage`, and `test:watch`.

The Phase 2 unit suite covers filter reduction and URL/history sync, pure
aggregations and delta calculations, and CSV escaping. `npm run test:coverage`
enforces 80% minimum statement, branch, function, and line coverage across the
dashboard state/utilities and shared utilities.

## Later phases

The analytics UI, accessibility details, deploy instructions, CI, screenshots,
and remaining known limitations will be documented as those phases are
implemented.
# Profes.Dashboard
