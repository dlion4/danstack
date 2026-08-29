# Reconciliation Center — Design Blueprint
> Implementation target: `transaction-dashboard/reconciliation/`
> Blueprint source: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md`
> Content source: `reconciliation/RECONCILIATION_REBUILD_PLAN.md` (payment-facilitator reconciliation workspace reframe)
> Last reconciled: August 30, 2026

---

## 1. Page Architecture

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `Layouts/shell/` | Fixed navy sidebar, translucent topbar, toasts, responsive offset |
| Reconciliation page | `reconciliation/pages/Reconciliation.tsx` | Executive hero, business-scope selector, KPI grid, attention/suggestions/quick-actions, overview dashboard, pending workbench, matched transactions, exceptions, rules engine, reports/audit, settings & automation |
| Reconciliation modals | `reconciliation/components/ReconciliationModals.tsx` | Shared modal dialogs (SimpleModal, FlowModal, ModalShell) for all 18 reconciliation workflows |
| Page theme contract | `reconciliation/styles/reconciliation.module.css` | Page-level CSS tokens, hero, KPI grid, queue grid, sections, floating bar, footer, toast stack |

Do not add a local sidebar or page topbar. Routes below `/pm/app` inherit those from `AppShell`.

The page is a **payment-facilitator reconciliation workspace**, not a bank back-office console:
it verifies three money streams (Collections, Payouts, Float movements) for two linked example
businesses (Land Buyers LTD — 30 customers, weekly high-value; Company 2 — 209 customers, daily
low-value) against the actual rail/settlement statements. Every row carries a traceable chain:
customer txn (COL-/ORD-/PLT-) → business → rail → statement → float link (RB-…, ties back to the
Liquidity page). Bank/SWIFT/FX-desk concepts and Payroll/Supplier-specific rules were removed;
team permissions were replaced by the "My Recon Access" scope panel — see
`RECONCILIATION_REBUILD_PLAN.md` for the full content-reframe rationale. Unlike Liquidity (10
dead modals removed), the rebuild plan called for **all 18 modals to be kept and retargeted**
to the new domain — none were deleted.

---

## 2. CSS Design Tokens

Reconciliation keeps its own pre-existing unprefixed custom properties (`--pri`, `--ink-*`,
`--pm-*`, semantic `--warning`/`--danger`/`--info`/`--purple`) defined on `.pageRoot` — these
already match the blueprint's emerald/navy palette values (explicitly documented in the file's
own header comment as "the same design system used on the Transfer Overview page"), so no
renaming was needed, only additive hero/KPI/queue/floating-bar/footer/toast classes ported from
the same pattern used on Liquidity:

```css
/* Values match the PayMo Business blueprint 1:1 */
--pri: #12b76a;            /* == --pm-green */
--ink-900: #101828;        /* == --pm-ink */
--ink-500: #667085;        /* == --pm-muted */
--bg: #f2f4f8;              /* == --pm-bg */
--surface: #ffffff;         /* == --pm-card */
--border: #e6e9f0;          /* == --pm-border */
--warning: #f79009;
--danger: #f04438;
--info: #2e90fa;
--purple: #7a5af8;
--radius-lg: 16px; --radius-md: 14px; --radius-sm: 10px;
--font-display: "Sora", "Inter", sans-serif;
```

Net-new classes added this pass (ported verbatim from `liquidity.module.css`, keyframes renamed
`liqPulse`/`liqToastIn` → `recPulse`/`recToastIn` for page-local clarity): `.heroBanner`,
`.heroOrbOne/.heroOrbTwo`, `.heroContent`, `.heroCopy`, `.heroEyebrow`, `.livePill`, `.liveDot`,
`.heroActions`, `.heroPrimary/.heroSecondary`, `.heroSnapshot`, `.heroMetricRow`,
`.statusNotice`, `.dashboardSection`, `.sectionHeading`, `.sectionIndex`, `.kpiGrid`, `.kpiCard`,
`.queueGrid`, `.queueCard`, `.cardKicker/.kicker`, `.cardHead`, `.textButton`,
`.iconGreen/.iconBlue/.iconViolet/.iconAmber/.iconDanger`, `.floatingBar`, `.floatingPrimary`,
`.pageFooter`, `.toastStack`, `.toast/.toastDanger`. Responsive overrides for these classes were
added at the existing `1199.98px` / `767.98px` / `575.98px` breakpoints, matching Liquidity.

---

## 3. Page Sections

| # | Section | Description |
|---|---------|-------------|
| — | Executive Hero | Dark gradient banner: live match-rate pill, Run Auto-Recon / My Recon Access / Manual Match / Health check actions, match-rate snapshot aside |
| — | Breadcrumb + scope selector | Home / Transactions Hub / Reconciliation Center; All businesses / Land Buyers LTD 30 / Company 2 209 scope pills; Profile / Reports actions |
| 01 | Reconciliation KPIs | KPI-styled stat row: hero match-rate card, Matched Today, Pending/Exceptions, Audit Trail |
| 02 | Attention, suggestions & quick actions | 3-column queue: attention required, AI smart suggestions, quick-action grid (8 actions) |
| 03 | Reconciliation overview dashboard | Business & rail coverage, today's activity bars, exception breakdown, reconciliation health tiles |
| 04 | Pending reconciliations workbench | Table of unmatched collections/payouts/float movements per business/stream/rail with Match/Flag/Resolve row actions |
| 05 | Matched transactions | Table of verified matches with Paymo record vs. statement, matched-by, and a Float Link (RB-…) cross-link to the Liquidity page |
| 06 | Discrepancies & exceptions | Table of open exceptions by stream/priority with Resolve/Dispute row actions |
| 07 | Auto-reconciliation rules engine | Per-business matching rules table + top-performing rules side panel |
| 08 | Reports, exports & audit trail | Quick-report buttons + recent audit-activity table |
| 09 | Reconciliation settings & automation | Matching tolerances, notification toggles, "My Recon Access" scope panel |
| — | Floating Command Bar | Fixed bottom bar: Alerts, Health, Manual Match (primary) |
| — | Footer | Cross-links to Liquidity & Float / Settlement / Payment Rails |

---

## 4. Modal Inventory

All modals use shared transaction primitives from `shared/components/modals.tsx`. All 18
modals defined in `ReconciliationModals.tsx` are reachable — per the rebuild plan, none were
removed; several were retargeted in place to the new domain content.

| Modal | Component | Trigger(s) | Notes |
|-------|-----------|------------|-------|
| Manual Match | `FlowModal` | Hero, page bar, pending workbench rows, exceptions "Resolve", attention row, quick actions, floating bar | Multi-step Select → Confirm → Done |
| Discrepancy / Flag Exception | `FlowModal` | Attention row, pending workbench "Flag", exceptions "New Exception", quick actions | Multi-step exception flow |
| Rule Engine | `ModalShell` (tabs + wizard) | Suggestions "Create", rules engine "New Rule", quick actions | Tabbed; "Performance" swaps to Rule Performance |
| Bulk Match | `FlowModal` | Pending workbench "Bulk Match", quick actions | Multi-step bulk-confirm flow |
| Upload Statement | `SimpleModal` | Quick actions "Upload Statement" | onToast on submit |
| Variance Resolution (`fxRateModal`) | `SimpleModal` | Pending workbench "Resolve" (exception rows) | Content already retargeted to Company 2/ORD-8899 variance case per rebuild plan; given a real trigger this pass |
| Export Report | `SimpleModal` | Matched "Export", Reports "Export", quick reports, suggestions "Export" | onToast on submit |
| Audit Log | `SimpleModal` (xl) | Matched "View", Reports "Audit Log", quick actions | onToast on submit |
| Rule Performance | `SimpleModal` | Rules engine "Performance", rules table "View", swap from Rule Engine | — |
| Matched Filter | `SimpleModal` | Matched transactions "Filter" | onToast on submit |
| Reconciliation Notifications | `ModalShell` | Floating bar "Alerts" | "Settings" swaps to Reconciliation Settings |
| Reconciliation Settings | `SimpleModal` | Settings section, swap from Notifications | onToast on submit |
| My Recon Access | `SimpleModal` | Hero, page bar, settings section | onToast on submit; replaces legacy Team Permissions |
| Dispute | `SimpleModal` | Exceptions "Dispute" | onToast on submit |
| Advanced Filters | `SimpleModal` | Pending workbench "Filters" | Consolidates both legacy `#filterModal` blocks; onToast on submit |
| Run Auto-Reconciliation | `SimpleModal` | Hero, page bar, overview "Run Now", suggestions, quick actions | onToast on submit |
| All Items Requiring Attention | `ModalShell` | Attention queue "View all" | Full attention list; row actions swap to Manual Match / Discrepancy |
| Reconciliation Health Check | `ModalShell` | Hero "Health check", overview "Health" | Domain health tiles (match rate, businesses, exceptions, avg resolve) |
| Profile | `ModalShell` | Page bar "Profile" | Given a real trigger this pass (previously 0 inbound) |

---

## 5. Code-Complete Checklist

### Theme and typography
- [x] Emerald `#12b76a` (`--pri`) as the only primary interaction color
- [x] Navy sidebar (shell-owned, not duplicated on this page)
- [x] Cool neutral borders, `--bg` canvas
- [x] Semantic colors for status: warning, danger, info, purple
- [x] Inter for body, Sora for headings/KPI values (via existing page tokens)

### Shared shell
- [x] No local sidebar or header — shell provides those
- [x] Page renders within shell's content area

### Page structure
- [x] Executive hero with dark navy/emerald gradient, live match-rate pill, snapshot aside
- [x] Numbered dashboard sections (01–09)
- [x] KPI-styled row replacing the old bare `row g-3` stat cards
- [x] Attention/suggestions/quick-actions queue grid
- [x] Floating command bar with primary Manual Match action
- [x] Page footer with cross-links to Liquidity & Float / Settlement / Payment Rails
- [x] Toast stack wired to modal `onSubmit` callbacks via `onToast`

### Modals
- [x] All 18 modals use shared SimpleModal / FlowModal / ModalShell primitives
- [x] `fxRateModal` (Variance Resolution) and `profileModal` given real triggers (previously 0 inbound)
- [x] Cross-modal navigation via `swap()` preserved (attention → match/discrepancy, rule engine ↔ performance, notifications → settings)
- [x] All SimpleModal submits surface a page-level toast (`onToast`)
- [x] Per rebuild plan, no modals removed — all 18 kept and retargeted to the payment-facilitator domain

### Responsive
- [x] `>= 1200px`: full KPI/queue grids
- [x] `<= 1199.98px`: 3-column KPI grid, 1-column queue grid
- [x] `<= 767.98px`: 2-column KPI grid, stacked hero, wrapped floating bar
- [x] `<= 575.98px`: single-column KPI grid, compact floating bar

---

## 6. Release Gates

- [x] TypeScript typecheck passes — zero diagnostics in reconciliation files (August 30, 2026)
- [x] Shared modal components from `shared/components/modals.tsx` used consistently
- [x] CSS additions scoped to `reconciliation.module.css` page-level styles only
- [x] Executive hero, numbered sections, floating bar, footer, toast stack added matching the Liquidity/blueprint pattern
- [x] Modal audit completed — all 18 modals reachable, 2 previously-orphaned modals (`fxRateModal`, `profileModal`) wired
- [x] Vitest suite passes (1 file / 9 tests)
- [x] Production build succeeds (client + server), `app.reconciliation` chunk present
- [x] `/pm/app/reconciliation` returns HTTP 200
- [x] `git diff --check` — no whitespace/conflict-marker errors
- [ ] Biome: 13 pre-existing a11y errors (`noLabelWithoutControl` / `useSemanticElements` on legacy form fields) + 9 pre-existing CSS warnings (`noDescendingSpecificity`, `noImportantStyles`) remain — same category/count as before this pass (confirmed via baseline diff), not introduced by this refinement
- [ ] Manual visual-QA checklist signed off by reviewer
