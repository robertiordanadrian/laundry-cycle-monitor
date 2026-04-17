# Laundry Cycle Monitor

Angular 19 web app for the launderette service — list active/past cycles and
start a new one against a real device.

---

## Prerequisites

| Tool   | Version  |
| ------ | -------- |
| Node   | `20.11+` |
| npm    | `10.2+`  |
| Chrome | any recent (for `npm test`) |

`.nvmrc` pins the Node version — `nvm use` if you have it.

## Quick start

```bash
nvm use          # optional
npm install
npm start
```

`npm start` runs both servers through `concurrently`:

- `json-server` on `http://localhost:3000`
- `ng serve` on `http://localhost:4200` (opens automatically) with a dev
  proxy mapping `/api` → `:3000` so the same base URL works behind any
  reverse proxy in production.

## Scripts

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm start`            | Backend + frontend, dev proxy wired.                           |
| `npm run start:api`    | Only the json-server mock backend.                             |
| `npm run start:web`    | Only the Angular dev server.                                   |
| `npm run build`        | Production build with budgets enforced.                        |
| `npm test`             | Karma + Jasmine in watch mode.                                 |
| `npm run test:ci`      | Headless single run, fails on < 90% coverage.                  |
| `npm run lint`         | ESLint (flat config) + Stylelint.                              |
| `npm run format`       | Prettier write.                                                |

Pre-commit: Husky v9 runs `lint-staged` on changed files only.

---

## Structure

```
src/app/
├── core/                  singletons — HTTP, stores, interceptors, DI tokens
│   ├── api/               per-resource HttpClient wrappers
│   ├── dto/               raw wire shapes
│   ├── interceptors/      error (retry 5xx + network), logging
│   ├── mappers/           DTO → domain (incl. data-quirk reconciliation)
│   ├── models/            domain types (readonly)
│   ├── state/             signal stores + view-store computed join
│   └── tokens/            API_BASE_URL, LOGGER, RETRY_CONFIG, CURRENT_USER
├── features/
│   ├── cycles-list/       list + tabs + detail dialog
│   └── create-cycle/      reactive form with live price preview
├── layout/app-header/     dark chrome, theme toggle
└── shared/                UI kit, pipes, services, i18n
```

Path aliases: `@core/*`, `@features/*`, `@shared/*`, `@env/*`. ESLint
blocks `../../../` imports.

---

## Architecture notes

- **Hand-rolled signal stores** (no `@ngrx/signals`). Each resource has its
  own store with independent loading/error state, so a failure in
  `/tariffs` doesn't block the cycle list from rendering. `CyclesViewStore`
  holds zero state and exposes only `computed()` selectors — the cycle ⊕
  device ⊕ tariff join lives there, never in templates.
- **Optimistic create with per-row rollback**. The temp row is removed by
  id on failure, not via a snapshot restore, so concurrent optimistic
  writes can't race each other.
- **Retry only where it makes sense**: 5xx, network (0), 408, 504.
  Exponential backoff `initialDelayMs * backoffFactor^attempt` (1s → 2s →
  4s default). 4xx is never retried. All final failures normalise to a
  structured `ApiError` with a `category`.
- **OnPush + signals everywhere** — `@angular-eslint/prefer-on-push-component-change-detection`
  blocks any new component without it.
- **Theme** via `<html data-theme="auto|light|dark">`. `ThemeService`
  persists the choice, reflects it in `color-scheme` + the attribute, and
  reacts to `prefers-color-scheme` changes via a signal so "auto" actually
  follows the OS in real time.

---

## Testing

```bash
npm run test:ci
```

Coverage report at `coverage/laundry-cycle-monitor/index.html`. Karma fails
the run if `statements`, `branches`, `functions` or `lines` drops below
**90%**.

- Mappers, APIs, stores, interceptors — unit tests with
  `HttpTestingController` and `fakeAsync` + `tick` for the retry timing.
- Components — Material `ComponentHarness` (`MatTabGroupHarness`,
  `MatSelectHarness`, `MatFormFieldHarness`, `MatButtonHarness`) plus
  custom `StatusBadgeHarness` and `CycleCardHarness` (with
  `HarnessPredicate` filters). Zero `By.css` queries.
- Integration — `RouterTestingHarness` walks `/cycles` → `/cycles/new` →
  submit → back to `/cycles` and asserts the new cycle lands in the
  Active tab.

---

## Assumptions & data quirks

1. **`Device.tariffId` is `number`, `Tariff.id` is `string`** — normalised
   to `string` in `DeviceMapper`. The `DeviceDto` union keeps the
   inconsistency visible at the wire boundary.
2. **`Cycle.invoiceLines` may be empty** (or `null`) for failure /
   in-progress cycles. The mapper always returns an array.
3. **Status / `stoppedAt` inconsistency** — fixture cycle id `4` is
   `in-progress` while also carrying a `stoppedAt` timestamp.
   `cycle.mapper.ts` coerces such records: `in-progress` + `stoppedAt` +
   invoice lines → `completed`, else → `cancelled`. The rest of the app
   then relies on the invariant
   `status === 'in-progress' ⇒ stoppedAt === null`. See
   `reconcileStatus()` and the dedicated specs.
4. **`Cycle.status`** is validated against a four-value union; unknown
   values fall back to `failure`.
5. **`startedAt`** is parsed defensively — garbage yields `new Date(0)`
   instead of `Invalid Date` so `relativeTime` and sorting stay safe.
6. **`userId` is `'web-user'`** — mocked client-side. A real product would
   take this from session state.

---

## Trade-offs left on the table

- **No auto-tick on "Running for"** — `RelativeTimePipe` is pure. In
  production I'd feed it a `now` signal driven by `interval(60_000)`, with
  visibility-aware pausing. Out of scope for 5 fixture cycles.
- **No virtualization** — `@angular/cdk/scrolling` would pay off at >50
  items; the grid is swappable to `CdkVirtualScrollViewport` without
  touching stores or view models.
- **Tab index in a local signal, not `queryParams`** — Active vs History
  isn't worth a URL.
- **No SSR / Universal** — not required, but `WINDOW` and `LOCAL_STORAGE`
  are injectable tokens ready for it.
- **Card opens a dialog, not a route** — list context stays intact;
  acceptable for a quick-look flow, route-based would be correct if cycle
  detail was ever shareable.

---

## Known issues

- **Material Symbols CDN** is loaded from Google Fonts. Behind a
  corporate proxy that blocks it, icons render as fallback text.
  Self-host the font for environments behind strict CSP or blocked CDNs.
