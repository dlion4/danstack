# Card Dashboard → Bootstrap Migration Plan

> Goal: convert the 10 card pages (`/cards/app/*`) from **Tailwind utility markup** to
> **Bootstrap 5 + bootstrap-icons**, styled to match the **business-dashboard** design
> system (`.pm-*` classes), fully **functional and responsive** — while preserving
> **100% of the behavior**: store, data, modals, toasts, keyboard shortcuts, routing.

---

## 0. North star

`src/features/dashboards/business-dashboard/` is the reference. Its pages use:

- **Bootstrap 5** grid + utilities (`row/col-*`, `d-flex`, `gap-*`, `mb-*`, `flex-wrap`, `text-center`)
- **bootstrap-icons** (`<i className="bi bi-credit-card-2-front" />`)
- A **`.pm-*` design system** defined in `business-dashboard/index.css` (tokens: `--pm-green #12b76a`,
  `--pm-ink #101828`, `--pm-muted #667085`, `--pm-bg #f2f4f8`, `--pm-border #e6e9f0`,
  `--pm-sidebar #0b1322`) — **these exact same hex values are the cards' current palette**,
  so converting to the business theme keeps the cards' brand colors.
- Per-module `ui.tsx` primitives (Badge, Modal, Section, Spark, WizardShell…) built on Bootstrap classes,
  and a per-module `store.tsx`/`data.ts`.

The cards' `store.tsx` + `data.ts` are already this shape — only the **presentation layer** changes.

---

## 1. Key decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | Framework | Bootstrap 5 (grid/components/utilities) + bootstrap-icons — identical to business-dashboard |
| 2 | Class namespace | **`.pmc-*`** (PayMo Cards) so cards CSS never collides with business `.pm-*` or utility `.pm-utility-*` |
| 3 | Typography | Match business: **Inter** (body) + **Sora** (headings). Drop Manrope (option: keep it if the user prefers) |
| 4 | Layout shell | New `lib/AppShell.tsx` mirroring business `lib/AppShell.tsx` (Sidebar / Topbar / QuickBar) |
| 5 | Icons | Keep a tiny `Icon` wrapper (`name` → `bi-*`) so page call sites barely change |
| 6 | Routing | **Unchanged** — keep `/cards/app/*`, `lib/routes.ts`, `store.tsx`, `data.ts` |
| 7 | Modals/drawers | Bootstrap `.modal` / `.offcanvas`, driven by the existing `store.modal` / `store.drawer` state |
| 8 | Scope | Bootstrap CSS imported at the **layout route component** (`CardsShell.tsx`), overrides scoped to `.pmc-page-content` |

---

## 2. Current state → target state

| Concern | Current (Tailwind) | Target (Bootstrap) |
|---|---|---|
| Styling | Tailwind utilities + scoped `@theme` | Bootstrap 5 + `.pmc-*` theme in `index.css` |
| Icons | `icons.tsx` inline SVG (`Icon name="…"`) | `Icon` wrapper → `<i className="bi bi-…"/>` |
| Primitives | `ui.tsx` (Badge/Btn/Chip/Modal/Drawer/Progress/Toggle/Reveal/SectionHead/Spark/Empty) | Bootstrap components + small `.pmc-*` helpers |
| Shell | `Shell.tsx` (Sidebar/Topbar/QuickBar/MobileNav) | `lib/AppShell.tsx` + Bootstrap offcanvas for mobile |
| Modals | custom `Modal`/`Drawer` | Bootstrap `.modal` / `.offcanvas` |
| Layout | flex/grid + arbitrary `px`, `text-[12.5px]` | `row/col-*`, `d-flex`, `gap-*`, scoped size helpers |
| Fonts | Manrope + Sora | Inter + Sora |
| CSS entry | `index.css` (Tailwind) | `index.css` (Bootstrap import + `.pmc-*` theme) |

---

## 3. File plan

**Keep unchanged (do not touch logic):**

- `store.tsx` — all state/actions (page, cards, modals, toasts, sync, shortcuts payloads)
- `data.ts` — all seed data/constants
- `lib/routes.ts` — page-id ↔ URL map, `useCardsNavigate()`
- `features/card-dashboard/<module>/pages/index.ts` + `card-command-center/components/sectionsB|C/index.ts` (12 re-export files)
- `src/routes/cards/**` — every route file

**Create:**

- `lib/AppShell.tsx` — Sidebar / Topbar / QuickBar / MobileNav (mirror business `lib/AppShell.tsx`)
- `lib/navigation.ts` — cards nav zones (5.1–5.10 + per-page section anchors)
- `lib/icons.ts` — `ICON_MAP: Record<IconName, string>` (custom name → `bi-*`)

**Rewrite (presentation only, keep every export name):**

- `icons.tsx` — thin `Icon` wrapper rendering `<i className="bi …"/>` (or delete and use `ICON_MAP` directly)
- `ui.tsx` — Bootstrap-based primitives (see §4)
- `Shell.tsx` — delete (replaced by `lib/AppShell.tsx`)
- `components/layout/CardsShell.tsx` — layout route component: imports `bootstrap.css` + `bootstrap-icons.css` + `index.css`, renders AppShell + all modals/drawers/toasts around `<Outlet />`
- `index.css` — `.pmc-*` theme (see §5)
- `modalsA.tsx`, `modalsB.tsx` — Bootstrap modal/offcanvas versions (same exports)
- `sectionsA/B/C.tsx`, `page2.tsx` … `page10.tsx` — Bootstrap markup (same exports)

**Delete once rewritten:** nothing else. Keep `utils/cn.ts` (harmless, still handy for conditional classes).

---

## 4. Mapping tables

### 4.1 Icons — `IconName` → `bi-*` (complete list from `icons.tsx`)

| IconName | bootstrap-icon | IconName | bootstrap-icon |
|---|---|---|---|
| menu | `bi-list` | x | `bi-x-lg` |
| search | `bi-search` | bell | `bi-bell` |
| chevDown | `bi-chevron-down` | chevRight | `bi-chevron-right` |
| chevLeft | `bi-chevron-left` | card | `bi-credit-card-2-front` |
| snow | `bi-snow` | lock | `bi-lock` |
| alertTri | `bi-exclamation-triangle-fill` | shield | `bi-shield` |
| shieldCheck | `bi-shield-fill-check` | chart | `bi-bar-chart-line` |
| sliders | `bi-sliders` | globe | `bi-globe2` |
| zap | `bi-lightning-charge` | plus | `bi-plus-lg` |
| check | `bi-check2` | checkCircle | `bi-check-circle-fill` |
| info | `bi-info-circle` | phone | `bi-telephone` |
| sms | `bi-chat-dots` | mail | `bi-envelope` |
| upRight | `bi-arrow-up-right` | downRight | `bi-arrow-down-right` |
| download | `bi-download` | filter | `bi-funnel` |
| refresh | `bi-arrow-repeat` | eye | `bi-eye` |
| eyeOff | `bi-eye-slash` | wallet | `bi-wallet2` |
| users | `bi-people` | help | `bi-question-circle` |
| send | `bi-send` | spark | `bi-stars` |
| clock | `bi-clock-history` | wave | `bi-activity` |
| logout | `bi-box-arrow-right` | building | `bi-buildings` |
| pie | `bi-pie-chart` | key | `bi-key` |
| copy | `bi-copy` | flag | `bi-flag` |
| arrowRight | `bi-arrow-right` | dots | `bi-three-dots-vertical` |
| inbox | `bi-inbox` | headset | `bi-headset` |
| gauge | `bi-speedometer2` | | |

### 4.2 `ui.tsx` primitives → Bootstrap

| Current primitive | Bootstrap target |
|---|---|
| `Btn` (primary/light/danger) | `.btn .btn-primary` / `.btn-outline-secondary` / `.btn-danger` (scoped overrides in `.pmc-page-content`) |
| `Badge` (tones) | `.badge` + `.pmc-badge-success/warning/danger/info/violet/dark/muted` soft badges |
| `Chip` | `.badge` soft variant |
| `Progress` | `.progress` + `.progress-bar` (`style={{ width: pct+"%" }}`) |
| `Toggle` | `.form-check.form-switch` |
| `FieldLabel` | `.form-label` |
| `Modal` | Bootstrap `.modal` (React-controlled; `modal-dialog-scrollable`, `modal-dialog-centered` when it fits) |
| `Drawer` | Bootstrap `.offcanvas` (`.offcanvas-end` / `.offcanvas-start`) |
| `SectionHead` | `.pmc-section-head` (kicker + title + right actions) |
| `Spark` | keep inline-SVG sparkline, styled via `.pmc-*` colors |
| `Reveal` | keep IntersectionObserver, apply `.pmc-reveal` animation class (preserve motion) |
| `Empty` | `.pmc-empty` (icon + title + hint) |
| NEW `StatCard` | `.pmc-stat` (label + value + delta) |
| NEW `CardFrame` | `.pmc-card` (white, radius 16, soft shadow) |
| NEW `TableFrame` | `.table.pmc-table` inside `.table-responsive` |

### 4.3 Tailwind utility → Bootstrap utility (most common)

| Tailwind | Bootstrap |
|---|---|
| `flex` | `d-flex` |
| `items-center` / `justify-between` | `align-items-center` / `justify-content-between` |
| `gap-2` `gap-2.5` `gap-3` `gap-4` | `gap-2` `gap-3` `gap-4` (Bootstrap ≥5.3) |
| `grid grid-cols-2/3/4` | `row g-3` + `col-6 / col-md-4 / col-xl-3` |
| `p-4` `px-5` `py-3` | `p-3` `p-4` `px-4` `py-2` |
| `rounded-xl / rounded-2xl` | `.pmc-card` radius (16px) / `rounded-4` |
| `border border-line` | `border` (scoped border-color on `.pmc-page-content`) |
| `shadow-pm / shadow-pm-lg` | `.pmc-shadow` / `.pmc-shadow-lg` |
| `text-[12.5px]` `text-[11px]` … | scoped size helpers `.pmc-fs-xs / .pmc-fs-sm / .pmc-fs-md` (or inline `style`) |
| `text-ink / text-muted / text-faint` | `.pmc-ink / .pmc-muted / .pmc-faint` |
| `bg-canvas / bg-white` | `.pmc-bg` / `bg-white` |
| `font-display` | `font-family: "Sora"` (`.pmc-display`) |
| `text-pmgreen / text-danger` | `.text-primary` / `.text-danger` (scoped) |

### 4.4 Responsive layout map

| Breakpoint | Behavior |
|---|---|
| `≥1200px` (xl) | sidebar visible (250px), content `max-width: 1320px`, 3–4 col grids |
| `992–1199` (lg) | sidebar visible, 3-col → 2-col |
| `768–991` (md) | sidebar → offcanvas (burger), 2-col → 1-col, `.table-responsive` scrolls |
| `<768` (sm) | single column, hero stacks, quickbar scrolls horizontally, full-width modals |
| Touch | keep the existing 44px min tap-target global rule |

---

## 5. `index.css` — `.pmc-*` theme (scope everything)

```css
@import "bootstrap/dist/css/bootstrap.min.css";
@import "bootstrap-icons/font/bootstrap-icons.css";

:root { /* same tokens as business */ --pm-green:#12b76a; --pm-ink:#101828; --pm-muted:#667085;
  --pm-bg:#f2f4f8; --pm-border:#e6e9f0; --pm-sidebar:#0b1322; --pm-radius:16px; ... }

.pmc-sidebar { … } .pmc-brand { … } .pmc-nav-wrap { … } .pmc-nav-group { … } .pmc-nav-item { … }
.pmc-topbar { … } .pmc-crumb { … } .pmc-search-box { … } .pmc-dd { … } .pmc-dd-menu { … }
.pmc-burger { … } .pmc-quickbar { … } .pmc-banner-hero { … }
.pmc-card { … } .pmc-stat { … } .pmc-section-head { … } .pmc-table { … }
.pmc-badge-success/warning/danger/info/violet { … }
.pmc-empty { … } .pmc-reveal { … } .pmc-shadow / .pmc-shadow-lg { … }

/* Bootstrap overrides scoped to page content only (mirror business .pm-page-content) */
.pmc-page-content .btn-primary { background: var(--pm-green); border-color: var(--pm-green); … }
.pmc-page-content .form-control:focus { border-color: var(--pm-green); box-shadow: 0 0 0 .2rem rgba(18,183,106,.14); }
.pmc-page-content .form-switch .form-check-input:checked { background-color: var(--pm-green); … }
.pmc-page-content .progress-bar { background-color: var(--pm-green); … }
.pmc-page-content .modal-content { border:none; border-radius:18px; box-shadow: var(--pm-shadow-lg); }
```

Rules: **one Tailwind entry only** (it already lives in global `styles.css`), scope every element rule
to `.pmc-*`, no `!important` on colors (it breaks `:hover`), keep animations (`rise`, `popIn`,
`drawerIn`, `toastIn`) with `.pmc-*` selectors.

---

## 6. Shell plan — `lib/AppShell.tsx` (mirror business `lib/AppShell.tsx`)

- **`NAVIGATION`** zones: **"Card Center"** = 5.1–5.10 module buttons (page nav), plus per-page anchor
  links (the current `NAV_51…NAV_510` sections become zone items with `anchor`).
- **`Sidebar`** — brand ("PayMo BAAS · Cards"), business switcher chip ("Acme Traders Ltd"), nav groups,
  support + keyboard-shortcuts footer. `d-none d-lg-flex`, offcanvas on mobile.
- **`Topbar`** — burger, breadcrumb (`BAAS / Cards / <page>`), search box, sync button, notifications
  dropdown, account dropdown — `.pmc-topbar` / `.pmc-dd` / `.pmc-dd-menu`.
- **`QuickBar`** — page-specific actions (Issue Card, Top Up, Repay Credit, Run Health Check, Export
  Report, Freeze All…) — `.pmc-quickbar` fixed bottom.
- **`MobileNav`** — Bootstrap `.offcanvas` hosting `SidebarContent`.

`components/layout/CardsShell.tsx` (layout route component) then:

```tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../index.css";
// async-load bootstrap JS bundle once (like BusinessShell) so .modal/.offcanvas work
// render <AppProvider><div className="pmc-shell"><AppShell/><main className="pmc-page-content"><Outlet/></main>
//        <AllModalsAndDrawers/><ToastViewport/></div></AppProvider>
```

---

## 7. Modals & drawers (same exports, Bootstrap markup)

**Shared (`modalsA`/`modalsB`):** `CardDrawer`, `ConfigureAlertsModal`, `FreezeModal`, `FreezeAllModal`,
`PinModal`, `LimitsDrawer`, `IssueCardModal`, `DisputeModal`, `FraudWizardModal`, `ShortcutsModal`,
`SupportDrawer`.

**Page-owned:** `ActivateModal`, `ReplaceModal`, `VirtualIssueModal`, `VirtualDetailsModal`,
`CreditIssueModal`, `CreditDetailsModal`, `RepayModal`, `StatementDrawer`, `PrepaidIssueModal`,
`TopupModal`, `PrepaidManageDrawer`, `BillingModal`, `InviteEmployeeModal`, `ApprovalModal`,
`PolicyModal`, `FraudWizardModal(7)`, `FraudEventModal`, `ReportBuilderModal`, `HealthCheckModal`,
`WebhookModal`, `ApiKeyModal`, `SettingsDefaultsModal`.

Each renders a Bootstrap `.modal`/`.offcanvas` gated on `store.modal.type` / `store.drawer.type`, keeps
the exact same fields/validation/actions, and calls the existing store methods + `toast`.

---

## 8. Page-by-page checklist

- **5.1 Command Center** (`sectionsA/B/C`): OverviewSection, CardsSection, AlertsSection,
  TransactionsSection, SecuritySection, AnalyticsSection, ProgramSection → hero banner + stat cards +
  card visual grid + alerts list + `.pmc-table` transactions + charts + program health.
- **5.2 Physical** (`page2`): HeroAndTiers, OrdersSection, MyPhysCardsSection, FeeSection, AddressSection, ReplacementSection + Activate/Replace modals.
- **5.3 Virtual Debit** (`page3`): VirtualOverview, VirtualCardsSection, GuardrailsSection, FundingSection, VirtualActivitySection, VirtualBestPractice + 2 modals.
- **5.4 Virtual Credit** (`page4`): CreditOverview, CreditLineSection, CreditCardsSection, RepaymentSection, CreditActivitySection, CreditInsightsSection + 4 modals/drawer.
- **5.5 Prepaid** (`page5`): PrepaidOverview, PrepaidCardsSection, BalancesSection, ControlsSection, PrepaidActivitySection, PrepaidFeesSection + 3 modals/drawer.
- **5.6 Corporate** (`page6`): CorporateOverview, DepartmentsSection, EmployeesSection, PoliciesSection, ApprovalsSection, BillingSection + 4 modals.
- **5.7 Security** (`page7`): SecurityOverview, FraudEventsSection, SafeguardsSection, ReportCardSection, SuspiciousSection, AuditLogSection + 2 modals.
- **5.8 Analytics** (`page8`): AnalyticsOverview, IssuanceSection, RevenueSection, ConcentrationSection, CorporateSpendSection, InsightsSection + ReportBuilderModal.
- **5.9 Admin** (`page9`): AdminOverview, GatewayLogsSection, IntegrationsSection, AdminAccessSection, EnvironmentSection + 3 modals.
- **5.10 Settings** (`page10`): SettingsOverview, DefaultsSection, SupportSection, FaqSection, ResourcesSection + SettingsDefaultsModal.

Every section keeps its **id anchors** (sidebar scroll + keyboard shortcuts 1–7 depend on them).

---

## 9. Phases (execution order — commit after each)

1. **Foundation** — `index.css` theme + `lib/icons.ts` + `icons.tsx` wrapper + `lib/navigation.ts`.
2. **Primitives** — rewrite `ui.tsx` (Bootstrap) and audit every call site still compiles.
3. **Shell** — `lib/AppShell.tsx` + rewrite `components/layout/CardsShell.tsx`; delete `Shell.tsx`.
4. **Shared modals** — `modalsA.tsx`, `modalsB.tsx`.
5. **Page 5.1** — `sectionsA/B/C.tsx` (full vertical slice: verify nav + shortcuts + modals).
6. **Pages 5.2–5.10** — one page per sub-phase.
7. **QA** — build, scoped `tsc`, smoke-test all routes + breakpoints + shortcuts + deep links.
8. **PR**.

---

## 10. Risks & gotchas

- **Bootstrap is global once imported** → import it only in the layout route component and scope
  overrides to `.pmc-page-content` (mirror business). Do NOT add Bootstrap to global `styles.css`.
- **`.modal`/`.offcanvas` need the JS bundle** → async `import("bootstrap/dist/js/bootstrap.bundle.min.js")`
  on mount (copy the BusinessShell pattern).
- **Class collisions** → use `.pmc-*`, never `.pm-*` (business) or `.pm-utility-*` (utility).
- **Don't touch `store.tsx` / `data.ts`** — behavior must be byte-for-byte preserved.
- **Keep export names identical** so the 12 re-export files and route files don't change.
- **Arbitrary font sizes** (`text-[12.5px]`) have no Bootstrap utility — use scoped `.pmc-fs-*` helpers.
- **Anchors + shortcuts** — preserve every section `id` and the `1–7`, `N`, `A`, `F`, `/`, `Esc` handlers.
- **No `@theme` in route-level CSS** (it's served uncompiled in dev) — the global `styles.css` already
  holds the Tailwind theme; the cards Bootstrap theme is plain CSS tokens.

---

## 11. Acceptance criteria (definition of done)

- [ ] `npm run build` passes; scoped `tsc --noEmit` clean for `card-dashboard` + `routes/cards`
- [ ] All 10 `/cards/app/*` routes render (200) and `/cards` redirects
- [ ] Sidebar, topbar, quickbar, hero, cards, tables, badges, progress, switches, modals, drawers all render
- [ ] Responsive at xl / lg / md / sm (sidebar→offcanvas, grids collapse, tables scroll, quickbar wraps)
- [ ] All 30+ modals/drawers open/close and mutate state exactly as before
- [ ] Keyboard shortcuts (N/A/F, `/`, 1–7, Esc), deep links, back/forward all work
- [ ] No visual leakage into home / business / utility / dev routes