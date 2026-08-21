# Utility Dashboard → Bootstrap 5 + SCSS Redesign Plan

> **Goal:** Convert the 6+1 utility pages (`/utility/*`) from **Tailwind utility markup** to
> **Bootstrap 5 + SCSS** (the zip's design system), add the new **Recurring** page, and
> ensure every page is **functional and responsive** — while preserving **100% of the
> behavior**: store, data, modals, toasts, keyboard shortcuts, routing, and all existing
> page-specific logic.

---

## 0. North star

`utility-v2.zip` (`src/features/dashboards/utility-dashboard/utility-v2.zip`) is the
reference. Its pages use:

- **Bootstrap 5** grid + utilities (`row/col-*`, `d-flex`, `gap-*`, `mb-*`, `flex-wrap`, `text-center`)
- A **`index.scss`** design system that imports Bootstrap SCSS, defines tokens, then
  rebuilds Tailwind-parity utility classes (`.bg-ink`, `.text-muted`, `.rounded-xl`, `.grid-cols-4`, etc.)
  — so **class names are mostly preserved** while the engine switches from Tailwind to Bootstrap.
- The **exact same** store (`AppProvider`/`useApp`), data layer, icons, and dialog system.
- **New page:** `/utility/recurring` — a dedicated autopay management page (replaces the
  drawer-only approach for autopay management).
- **Same palette:** `--pm-green #12b76a`, `--pm-ink #101828`, `--pm-muted #667085`,
  `--pm-bg #f2f4f8`, `--pm-border #e6e9f0`, `--pm-side #0b1322` — identical hex values,
  so converting to the bootstrap theme keeps the brand colors.

---

## 1. Key decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | Framework | Bootstrap 5 (grid/components/utilities) + `bootstrap-icons` — **not used here**; the zip keeps custom SVG icons |
| 2 | Class namespace | Keep **no prefix** — the zip uses unprefixed Bootstrap utilities directly (`.bg-ink`, `.text-muted`, `.card`, `.btn`). Scope with `.pm-utility-shell` where needed. |
| 3 | Typography | **Manrope** (body) + **Sora** (headings) — same as current. The SCSS vars `$font-family-sans-serif` and `$headings-font-family` set these. |
| 4 | Icons | **Keep the existing custom SVG icon system** (`components/ui/icons.tsx`) — the zip uses the same 68-icon SVG set. Do NOT switch to bootstrap-icons. |
| 5 | Routing | Add `/utility/recurring` route. Keep all existing routes. Update catch-all. |
| 6 | Modals/drawers | Keep the existing React modal/drawer system (custom `Modal`/`Drawer` in `ui.tsx`). The zip uses the same custom components, NOT Bootstrap `.modal`/`.offcanvas`. |
| 7 | Styling engine | Replace Tailwind + `@theme` + scoped CSS with the zip's `index.scss` (Bootstrap 5 SCSS + Tailwind-parity utility rebuild). |
| 8 | Scope | Bootstrap SCSS imported at the **layout route component** (`UtilityShell.tsx`), overrides scoped to `.pm-utility-shell`. |

---

## 2. Current state → target state

| Concern | Current (Tailwind) | Target (Bootstrap 5 + SCSS) |
|---|---|---|
| Styling | Tailwind utilities + `@theme` + scoped `styles/index.css` | Bootstrap 5 SCSS + Tailwind-parity utilities in `index.scss` |
| CSS entry | `features/utility-dashboard/styles/index.css` (`@theme` tokens) | `features/utility-dashboard/styles/index.scss` (Bootstrap SCSS import + design tokens + utility rebuild) |
| Icons | `components/ui/icons.tsx` (custom SVG, 68 icons) | **Unchanged** — same `Icon` component |
| Primitives | `components/ui/index.tsx` (Badge/Button/Chip/Modal/Drawer/etc.) | **Unchanged** — same components, same class names (they already use the bootstrap-parity classes) |
| Shell | `components/layout/Shell.tsx` (sidebar/topbar/palette/mobile) | **Unchanged** — same component, same Tailwind-parity classes |
| Store | `lib/store.tsx` (AppProvider/useApp) | **Unchanged** — byte-for-byte preserved |
| Data | `lib/data.ts` (UTILITIES/ACCOUNTS/TXNS/SCHEDULES/etc.) | **Unchanged** — byte-for-byte preserved |
| Layout route | `components/layout/UtilityShell.tsx` | Update: import `index.scss` instead of `styles/index.css` |
| Routes | 6 routes (overview, electricity, water, internet, airtime, settings) | 7 routes (+ recurring) |
| Pages | 6 module pages | 7 module pages (+ recurring) |

---

## 3. Why class names mostly survive

The zip's `index.scss` rebuilds Tailwind-parity utilities from SCSS. Examples:

```scss
// Bootstrap SCSS import
@import "bootstrap/scss/bootstrap";

// Then Tailwind-parity utilities are redefined as plain CSS:
.text-ink { color: var(--color-ink) !important; }
.bg-ink { background-color: var(--color-ink) !important; }
.rounded-full { border-radius: 9999px !important; }
.d-grid { display: grid !important; }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.fs-13 { font-size: 13px !important; }
.fw-bold { font-weight: 700 !important; }
.gap-3 { gap: 0.75rem !important; }
.p-4 { padding: 1rem !important; }
```

This means **most JSX class names can stay exactly the same** — they just resolve to
SCSS-defined rules instead of Tailwind-generated ones. The main changes are:

1. **`@theme` block** → SCSS `:root` variables (already handled by the zip's SCSS)
2. **Tailwind v4 `@theme` imports** → `@import "bootstrap/scss/bootstrap"` + SCSS vars
3. **Some arbitrary values** like `text-[13.5px]`, `rounded-[13px]`, `w-[252px]` → named
   utilities or inline styles (the SCSS rebuild covers most, but not every arbitrary value)
4. **Responsive prefixes** `sm:`, `md:`, `lg:`, `xl:` → `@media` queries in SCSS or
   `sm-*`, `md-*`, `lg-*`, `xl-*` class variants defined in the SCSS

---

## 4. File plan

### Keep unchanged (do not touch logic):

- `lib/store.tsx` — all state/actions
- `lib/data.ts` — all seed data/constants
- `lib/utils/cn.ts` — className helper
- `lib/utils/useReveal.ts` — scroll-reveal hook
- `components/ui/icons.tsx` — SVG icon system
- `components/ui/index.tsx` — UI primitives (Badge, Button, Modal, Drawer, etc.)
- `components/dialogs/index.tsx` — all shared dialogs
- `components/modals/index.tsx` — all shared modals
- `components/layout/Shell.tsx` — sidebar/topbar/palette/mobile nav
- `features/utility-dashboard/*/pages/index.tsx` — all existing page files (class names survive)
- `src/routes/utility/*.tsx` — all existing route files

### Create:

- `features/utility-dashboard/styles/index.scss` — **the zip's SCSS design system**
  (Bootstrap import + tokens + Tailwind-parity utilities + scoped overrides)
- `routes/utility/recurring.tsx` — new route file for the recurring/autopay page
- `features/utility-dashboard/features/utility-dashboard/recurring/` — new page directory
  with `pages/index.tsx`

### Modify:

- `features/dashboards/utility-dashboard/components/layout/UtilityShell.tsx` —
  change CSS import from `styles/index.css` to `styles/index.scss`
- `src/routes/utility.tsx` — no change needed (just renders UtilityShell)
- `tsconfig.json` — may need `*.scss` support (Vite handles this natively with sass)

### Delete (once migration is verified):

- `features/utility-dashboard/styles/index.css` — replaced by `index.scss`

---

## 5. The SCSS design system (`index.scss`) — critical details

The zip's `index.scss` (~39KB) does the following in order:

### 5.1 Bootstrap SCSS bootstrap

```scss
@use "sass:math";

// Bootstrap variable overrides (BEFORE importing bootstrap)
$primary: #12b76a;
$danger: #f04438;
$warning: #f79009;
$info: #2e90fa;
$dark: #101828;
$secondary: #667085;
$light: #f2f4f8;

$font-family-sans-serif: "Manrope", ui-sans-serif, system-ui, sans-serif;
$headings-font-family: "Sora", ui-sans-serif, system-ui, sans-serif;
$border-color: #e6e9f0;
// ... more overrides

@import "bootstrap/scss/bootstrap";
```

### 5.2 Design tokens (`:root`)

```scss
:root {
  --color-ink: #101828;
  --color-pmgreen: #12b76a;
  --color-pmgreen-soft: #e7f8ef;
  --color-side: #0b1322;
  --shadow-pm: 0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px -12px rgba(16, 24, 40, 0.12);
  --font-display: "Sora", ...;
  --font-sans: "Manrope", ...;
  // ... 30+ tokens
}
```

### 5.3 Bootstrap component restyle

Restyled `.btn`, `.badge`, `.form-control`, `.card`, `.progress` to match the PayMo design.

### 5.4 Tailwind-parity utility classes

Every utility class used in the pages is rebuilt:

- **Colors:** `.text-ink`, `.bg-pmgreen`, `.bg-canvas`, `.border-line`, `.bg-warn-soft`, etc.
- **Layout:** `.d-grid`, `.grid-cols-2` through `.grid-cols-6`, `.d-flex`, `.align-items-center`
- **Spacing:** `.p-4`, `.px-5`, `.py-3`, `.gap-2`, `.gap-3`, `.mb-4`, `.mt-3`, `.me-n1`
- **Typography:** `.fs-95` through `.fs-42`, `.fw-bold`, `.fw-extrabold`, `.font-display`, `.num`, `.tracking-tight`
- **Sizing:** `.h-30px`, `.w-252px`, `.max-w-460px`, `.max-w-1320px`, etc.
- **Responsive:** `.sm-grid-cols-2`, `.lg-grid-cols-4`, `.xl-grid-cols-6`, `.sm-fs-19`, `.lg-ps-252px`
- **Effects:** `.shadow-pm`, `.shadow-pm-lg`, `.backdrop-blur-xl`, `.card-hover`, `.modal-pop`, `.drawer-in`
- **Animations:** `.reveal`, `.bar-grow`, `.toast-in`, `.shake`, `.spin-slow`
- **Gradient:** `.bg-gradient-to-br`, `.from-ink`, `.to-white`, `.via-0f2233`
- **Opacity:** `.bg-white-10` through `.bg-white-90`, `.text-white-55`, `.hover-bg-white-10`

### 5.5 SCSS color loops

```scss
@each $name, $hex in (pmgreen: #12b76a, warn: #f79009, danger: #f04438, pmblue: #2e90fa, pmviolet: #7a5af8) {
  @each $i in (10, 12, 15, 20, 25, 30, 40, 50, 60) {
    .bg-#{$name}-#{$i} { background-color: rgba($hex, math.div($i, 100)) !important; }
  }
}
```

---

## 6. Arbitrary value resolution

The current pages use Tailwind arbitrary values like `text-[13.5px]`, `rounded-[13px]`, `w-[252px]`, `h-[220px]`.

The SCSS rebuild covers **most** of these via explicit utility definitions. For any that aren't covered:

| Tailwind arbitrary | SCSS resolution |
|---|---|
| `text-[13.5px]` | `.fs-135` (defined in `$fs-map`) |
| `text-[14.5px]` | `.fs-145` |
| `rounded-[13px]` | `.rounded-13px` (defined in SCSS loop) |
| `w-[252px]` | `.w-252px` (defined in SCSS) |
| `max-w-[460px]` | `.max-w-460px` |
| `h-[220px]` | `.min-h-220px` |
| `grid-cols-[1.35fr_1fr]` | `.grid-cols-1-35fr-1fr` (defined in SCSS) |
| `text-[10.5px]` | `.fs-105` |
| `tracking-[0.14em]` | `.tracking-014em` or `.tracking-0-14em` |

**Any value NOT in the SCSS rebuild** needs either:
1. A new SCSS rule added to `index.scss`, OR
2. An inline `style={}` prop, OR
3. A scoped CSS class in the page file

---

## 7. New page: Recurring (Autopay Management)

### 7.1 What it is

The current autopay management is handled via a **drawer** (`AutopayDrawer` in dialogs).
The zip adds a **dedicated full page** at `/utility/recurring` that shows:

- All autopay rules with status, next run, amount, method
- Schedule of upcoming payments
- Ability to add/edit/pause/delete rules
- History of autopay executions

### 7.2 Route file

```tsx
// src/routes/utility/recurring.tsx
import { createFileRoute } from "@tanstack/react-router";
import { RecurringPage } from "@/features/dashboards/utility-dashboard/features/utility-dashboard/recurring/pages";

export const Route = createFileRoute("/utility/recurring")({
  component: RecurringPage,
});
```

### 7.3 Page component

Create `features/utility-dashboard/features/utility-dashboard/recurring/pages/index.tsx`:
- Import from the zip's source (adapt paths to main project structure)
- Uses the same store (`useApp`), data (`SCHEDULES`, `AUTOPAY_RULES`, `ACCOUNTS`)
- Uses the same UI primitives (`Card`, `Badge`, `Button`, `SectionHead`, `Table`, etc.)

### 7.4 Navigation update

Add to `NAV_GROUPS` in `lib/data.ts`:
```ts
{ key: "recurring", label: "Autopay rules", icon: "repeat", to: "/utility/recurring" }
```

Update `PAGE_META` in `Shell.tsx`:
```ts
"/utility/recurring": { title: "Autopay & Schedules", crumb: "Recurring" }
```

---

## 8. Shell plan — no structural changes

The shell (`components/layout/Shell.tsx`) stays structurally identical. The only change
is the CSS import path in `UtilityShell.tsx`:

```diff
- import "../../features/utility-dashboard/styles/index.css";
+ import "../../features/utility-dashboard/styles/index.scss";
```

The shell's Tailwind class names survive because `index.scss` rebuilds them as Bootstrap
parity utilities.

---

## 9. Page-by-page inventory

### 3.1 Overview (`/utility`)
- **File:** `features/utility-dashboard/overview/pages/index.tsx`
- **Sections:** Hero banner, KPI strip, utility categories grid (3.1), saved accounts (3.2), spend insights (3.3), schedules & autopay (3.4), funding sources (3.5), transaction history (3.6), support
- **Class names:** ~200 unique Tailwind classes → all covered by SCSS rebuild
- **Changes needed:** None to JSX class names. Verify rendering after CSS switch.

### 3.2 Electricity (`/utility/electricity`)
- **File:** `features/utility-dashboard/electricity/pages/index.tsx`
- **New from zip:** The zip's `electricity/index.tsx` (41KB) is a significantly enhanced page
- **Changes needed:** Merge zip improvements into existing page (see §10)

### 3.3 Water (`/utility/water`)
- **File:** `features/utility-dashboard/water/pages/index.tsx`
- **New from zip:** `water/index.tsx` (36KB)
- **Changes needed:** Merge zip improvements

### 3.4 Internet (`/utility/internet`)
- **File:** `features/utility-dashboard/internet/pages/index.tsx`
- **New from zip:** `internet/index.tsx` (52KB)
- **Changes needed:** Merge zip improvements

### 3.5 Mobile Money / Airtime (`/utility/airtime` → `/utility/mobile-money`)
- **File:** `features/utility-dashboard/mobile-money/pages/index.tsx`
- **New from zip:** `mobile-money/index.tsx` (58KB)
- **Changes needed:** Merge zip improvements. Note: zip uses `/utility/mobile-money` path.

### 3.6 Settings (`/utility/settings`)
- **File:** `features/utility-dashboard/settings/pages/index.tsx`
- **New from zip:** `settings/index.tsx` (65KB)
- **Changes needed:** Merge zip improvements

### 3.7 Recurring (`/utility/recurring`) — **NEW**
- **File:** To create
- **New from zip:** `recurring/index.tsx` (72KB)
- **Changes needed:** Create from zip source

---

## 10. Page merge strategy

The zip contains enhanced versions of each page (in `src/features/utility-dashboard/`).
Each is significantly larger than the current version, indicating added sections, modals,
and interactions.

**Merge approach per page:**

1. **Read the zip's page** to identify new sections/components
2. **Diff against the current page** to find what's added
3. **Port the additions** into the current page's JSX, keeping the current import paths
4. **Verify** the page renders with the new SCSS styling

Key improvements in the zip pages:
- More detailed hero sections with animated backgrounds
- Enhanced data tables with sorting, filtering, export
- More granular stat cards with sparklines
- Improved mobile responsive layouts
- Better empty states and error handling

---

## 11. Phases (execution order — commit after each)

### Phase 1: SCSS Foundation
1. Copy `index.scss` from the zip into `features/utility-dashboard/styles/`
2. Verify the SCSS compiles (Vite + sass — already a project dependency)
3. Update `UtilityShell.tsx` to import `index.scss` instead of `index.css`
4. **Smoke test:** Run `npm run build` — verify no CSS import errors
5. **Visual test:** Load `/utility` — compare against current to confirm parity

### Phase 2: Arbitrary Value Audit
1. Scan all utility page files for Tailwind arbitrary values (`text-[...]`, `rounded-[...]`, `w-[...]`, etc.)
2. For each, verify it exists in the SCSS rebuild
3. Add missing utilities to `index.scss` or convert to inline styles
4. **Build check:** `tsc --noEmit` for utility-dashboard + routes/utility

### Phase 3: Add Recurring Route
1. Create `routes/utility/recurring.tsx`
2. Create `features/utility-dashboard/features/utility-dashboard/recurring/pages/index.tsx`
3. Update `NAV_GROUPS` and `PAGE_META` in `lib/data.ts` and `Shell.tsx`
4. **Build check:** Verify new route compiles

### Phase 4: Page Enhancements (one page per sub-phase)
1. **Electricity** — merge zip's `electricity/index.tsx` improvements
2. **Water** — merge zip's `water/index.tsx` improvements
3. **Internet** — merge zip's `internet/index.tsx` improvements
4. **Mobile Money** — merge zip's `mobile-money/index.tsx` improvements
5. **Settings** — merge zip's `settings/index.tsx` improvements
6. **Overview** — merge zip's `overview/index.tsx` improvements
7. **Recurring** — finalize from zip's `recurring/index.tsx`

### Phase 5: Shell & Layout Polish
1. Verify sidebar, topbar, palette, mobile nav all render correctly
2. Verify all route transitions work
3. Verify command palette (⌘K) works
4. Verify notification drawer works
5. Verify mobile bottom nav works

### Phase 6: Dialog & Modal Audit
1. Open every dialog type and verify it renders
2. Test BuyWizard flow end-to-end
3. Test AddAccountWizard flow
4. Test TopUpModal flow
5. Test HistoryDrawer, ExportModal, AutopayDrawer
6. Test TxnDrawer, ReportModal, HelpModal, TariffModal

### Phase 7: Responsive QA
1. Test at xl (≥1280px), lg (1024–1279), md (768–1023), sm (<768)
2. Sidebar visible on lg+, offcanvas on mobile
3. Grid columns collapse correctly
4. Tables scroll horizontally on mobile
5. Hero section stacks vertically on mobile
6. Bottom nav appears on mobile

### Phase 8: Cleanup
1. Delete `features/utility-dashboard/styles/index.css` (replaced by `.scss`)
2. Remove any unused Tailwind-specific imports
3. Final `npm run build` — zero errors
4. Final visual audit across all 7 routes

---

## 12. Risks & gotchas

- **Bootstrap SCSS is global once imported** → import it only in `UtilityShell.tsx` and
  scope overrides to `.pm-utility-shell`. Do NOT add Bootstrap to global `styles.css`.
- **sass dependency** → already in `package.json` devDependencies (`"sass": "^1.103.0"`).
  Verify it's installed: `ls node_modules/sass`.
- **Class collisions** → The SCSS rebuild uses the same class names as Tailwind. Since
  Bootstrap is scoped to `.pm-utility-shell`, it shouldn't leak. But verify that
  global Tailwind utilities (from `src/styles.css`) don't conflict.
- **Don't touch `store.tsx` / `data.ts`** — behavior must be byte-for-byte preserved.
- **Keep export names identical** so route files don't change.
- **The SCSS file is ~39KB** — it's large but it's a one-time import. Vite compiles it
  to efficient CSS.
- **Some responsive classes may need `sm-*`, `md-*`, `lg-*`, `xl-*` prefixed versions**
  defined in the SCSS. Check the zip's SCSS for these.
- **`@theme` block** in the current `styles/index.css` uses Tailwind v4 syntax. The SCSS
  replaces this with standard CSS custom properties on `:root`.
- **The zip's pages import from `../../ui`, `../../icons`, `../../lib/data`** — these
  paths need remapping to the main project's structure.

---

## 13. Acceptance criteria (definition of done)

- [ ] `npm run build` passes with zero errors
- [ ] `tsc --noEmit` clean for utility-dashboard + routes/utility
- [ ] All 7 `/utility/*` routes render (200) and `/utility` redirects work
- [ ] Sidebar, topbar, palette, hero, cards, tables, badges, progress, modals, drawers all render
- [ ] Responsive at xl / lg / md / sm (sidebar collapses, grids reflow, tables scroll, bottom nav appears)
- [ ] All 13+ modals/dialogs open/close and mutate state exactly as before
- [ ] Command palette (⌘K) works with search
- [ ] Keyboard shortcuts work (Escape closes modals)
- [ ] Deep links to specific sections (sec-insights, sec-history, etc.) work
- [ ] Recurring page renders and shows autopay rules
- [ ] No visual leakage into home / business / cards / dev routes
- [ ] Fonts render correctly (Manrope body, Sora headings)
- [ ] Animations work (reveal on scroll, modal pop-in, drawer slide, toast slide-up)
- [ ] Color palette matches zip reference (verify green, blue, violet, teal, warning tones)

---

## 14. Files inventory (from zip)

```
utility-v2.zip → utility/src/
├── components/
│   ├── dialogs/index.tsx          (47KB — shared dialog hosts)
│   ├── layout/
│   │   ├── index.ts
│   │   └── Shell.tsx              (28KB — sidebar/topbar/palette)
│   ├── modals/index.tsx           (47KB — shared modal hosts)
│   └── ui/
│       ├── icons.tsx              (9KB — 68 SVG icons)
│       └── index.tsx              (27KB — UI primitives)
├── data.ts                        (24KB — types + seed data)
├── features/utility-dashboard/
│   ├── electricity/index.tsx      (41KB)
│   ├── internet/index.tsx         (52KB)
│   ├── mobile-money/index.tsx     (58KB)
│   ├── overview/index.tsx         (51KB)
│   ├── recurring/index.tsx        (72KB — NEW)
│   ├── settings/index.tsx         (65KB)
│   └── water/index.tsx            (36KB)
├── icons.tsx                      (9KB — duplicate of components/ui/icons.tsx)
├── index.css                      (7KB — Tailwind theme — REPLACED by index.scss)
├── index.scss                     (39KB — THE SCSS DESIGN SYSTEM — key file)
├── lib/
│   ├── data.ts                    (24KB)
│   ├── index.ts
│   ├── store.tsx                  (3.8KB)
│   └── utils/
│       ├── cn.ts
│       └── useReveal.ts
├── main.tsx
├── routes/utility/
│   ├── electricity.tsx
│   ├── index.tsx
│   ├── internet.tsx
│   ├── mobile-money.tsx
│   ├── recurring.tsx              (NEW)
│   ├── settings.tsx
│   └── water.tsx
├── router.tsx
├── routeTree.gen.ts
├── store.tsx                      (3.7KB — duplicate of lib/store.tsx)
└── ui.tsx                         (27KB — duplicate of components/ui/index.tsx)
```

**Key files to extract from zip:**
1. `index.scss` — the SCSS design system (most critical)
2. `features/utility-dashboard/recurring/index.tsx` — the new recurring page
3. `features/utility-dashboard/*/index.tsx` — enhanced versions of all existing pages
4. `components/ui/icons.tsx` — verify no new icons added
5. `components/ui/index.tsx` — verify no new primitives added
6. `components/dialogs/index.tsx` — verify no new dialogs added
7. `components/modals/index.tsx` — verify no new modals added

---

## 15. Rollback plan

If the SCSS switch breaks something:
1. Revert `UtilityShell.tsx` to import `styles/index.css`
2. The Tailwind theme still works
3. Debug the specific SCSS issue in isolation
4. Re-attempt the switch

If a page merge breaks something:
1. Revert that page's `index.tsx` to the pre-merge version
2. The rest of the dashboard is unaffected
3. Debug the specific merge issue

---

## 16. Testing checklist

### Build
- [ ] `npm run build` — zero errors
- [ ] `tsc --noEmit` — zero type errors
- [ ] SCSS compiles without warnings

### Routes
- [ ] `/utility` — Overview renders
- [ ] `/utility/electricity` — Electricity page renders
- [ ] `/utility/water` — Water page renders
- [ ] `/utility/internet` — Internet page renders
- [ ] `/utility/airtime` — Mobile Money page renders
- [ ] `/utility/settings` — Settings page renders
- [ ] `/utility/recurring` — Recurring page renders (NEW)
- [ ] `/utility/nonexistent` — redirects to `/utility`

### Components
- [ ] Sidebar renders with all nav items
- [ ] Sidebar highlights active route
- [ ] Sidebar wallet balance widget shows
- [ ] Topbar renders with search, wallet, notifications
- [ ] Breadcrumbs update per route
- [ ] Command palette opens (⌘K), searches, navigates
- [ ] Mobile bottom nav renders on small screens
- [ ] Mobile nav drawer opens from burger menu

### Dialogs
- [ ] BuyWizard — full flow (select utility → enter details → confirm → success)
- [ ] AddAccountWizard — add a new meter/account
- [ ] TopUpModal — wallet top-up flow
- [ ] TxnDrawer — view transaction details
- [ ] HistoryDrawer — full transaction history
- [ ] ExportModal — export flow
- [ ] AutopayDrawer — view/edit autopay rules
- [ ] RenameModal — rename an account
- [ ] RemoveModal — remove an account
- [ ] ModuleModal — view module details
- [ ] HelpModal — FAQ and support
- [ ] TariffModal — tariff information
- [ ] ReportModal — report an issue

### Responsive
- [ ] xl (≥1280px): sidebar visible, 4-col grids
- [ ] lg (1024–1279): sidebar visible, 2-3 col grids
- [ ] md (768–1023): sidebar hidden, 1-2 col grids
- [ ] sm (<768): single column, bottom nav, stacked hero

### Visual
- [ ] Fonts: Manrope body, Sora headings
- [ ] Colors: green (#12b76a), blue (#2e90fa), violet (#7a5af8), teal (#0e9384), warning (#f79009)
- [ ] Dark sidebar (#0b1322) with glow effect
- [ ] Hero banner gradient renders
- [ ] Card shadows and borders match
- [ ] Animations: reveal on scroll, modal pop, drawer slide, toast slide
- [ ] No visual artifacts or broken layouts
