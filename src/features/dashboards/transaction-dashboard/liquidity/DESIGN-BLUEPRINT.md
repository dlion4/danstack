# Liquidity & Float — Design Blueprint
> Implementation target: `transaction-dashboard/liquidity/`
> Blueprint source: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md`
> Content source: `liquidity/LIQUIDITY_REBUILD_PLAN.md` (payment-facilitator float workspace reframe)
> Last reconciled: August 30, 2026

---

## 1. Page Architecture

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `Layouts/shell/` | Fixed navy sidebar, translucent topbar, toasts, responsive offset |
| Liquidity page | `liquidity/pages/Liquidity.tsx` | Executive hero, World A (business settlement floats) / World B (my liquidity) switch, KPI grid, movements ledger, rail liquidity, monitoring, wallets, permissions, attention/suggestions/quick-actions, activity log |
| Liquidity modals | `liquidity/components/LiquidityModals.tsx` | Shared modal dialogs (SimpleModal, FlowModal, TabbedModal, ModalShell) for all 15 float workflows |
| Page theme contract | `liquidity/styles/liquidity.module.css` | Page-level CSS tokens, hero, KPI grid, sections, floating bar, footer, toast stack |

Do not add a local sidebar or page topbar. Routes below `/pm/app` inherit those from `AppShell`.

The page is a **payment-facilitator float workspace**, not a bank treasury console: it tracks
the pre-funded floats that auto-settle two linked example businesses (Land Buyers LTD and
Company 2) and the facilitator's own Business/Virtual wallets that fund those floats — see
`LIQUIDITY_REBUILD_PLAN.md` for the full content reframe rationale.

---

## 2. CSS Design Tokens

Liquidity keeps its own pre-existing unprefixed custom properties (`--pri`, `--ink-*`, `--pm-*`,
semantic `--warn`/`--danger`/`--info`/`--violet`) defined on `.pageRoot` — these already match
the blueprint's emerald/navy palette values, so no renaming was needed, only additive classes:

```css
/* Values match the PayMo Business blueprint 1:1 */
--pri: #12b76a;            /* == --pm-green */
--pri-dark: #0b8f52;       /* == --pm-green-dark */
--pri-soft: #e7f8ef;       /* == --pm-green-soft */
--ink-900: #101828;        /* == --pm-ink */
--ink-500: #667085;        /* == --pm-muted */
--bg: #f2f4f8;              /* == --pm-bg */
--surface: #ffffff;         /* == --pm-card */
--border: #e6e9f0;          /* == --pm-border */
--warn: #f79009;
--danger: #f04438;
--info: #2e90fa;
--violet: #7a5af8;
```

---

## 3. Page Sections

| Section | Index | World | Description |
|---------|-------|-------|-------------|
| Executive Hero | — | both | Dark gradient banner: live-float pill, rebalance/rules/alerts/health-check actions, float snapshot aside |
| Breadcrumb + connection banner | — | both | Home / Transactions Hub / Liquidity & Float, sandbox API-key banner |
| World switch + scope pills | — | both | Business Floats vs. My Liquidity toggle; All / Land Buyers LTD / Company 2 scope pills |
| Float health metrics | 01 | A | KPI grid: 6 stat cards (total float, floats healthy, at risk, runway, etc.) |
| Business settlement floats | 01 | A | Float cards grid with meters, rebalance/rules actions |
| Float movements ledger | 02 | A | Table of top-ups/payouts/refunds with RB- refs, settlement-status and new-movement actions |
| Payout rail liquidity | 03 | A | Rail consumption rows (M-Pesa/bank/card/wallet) + 48h runway forecast bars + risk scenarios |
| Float monitoring & alerts | 04 | A | Active alerts + auto-refill toggle rows, thresholds/alerts actions |
| My wallets | 01 | B | Business Wallet + Virtual Wallet cards |
| Facilitator permissions | 02 | B | Scope grid (granted/pending) with governance request-access action |
| Attention, suggestions & quick actions | 05/03 | both | 3-column queue: attention required, AI suggestions, quick-action grid |
| Recent liquidity activity | 06/04 | both | Unified audit trail table across both worlds |
| Floating Command Bar | — | both | Fixed bottom bar: Alerts, Forecast, Rebalance (primary) |
| Footer | — | both | Cross-links to Reconciliation / Settlement / Payment Rails |

---

## 4. Modal Inventory

All modals use shared transaction primitives from `shared/components/modals.tsx`. 15 modals
remain reachable after removing the legacy bank/agent-treasury modals that had zero inbound
triggers post-reframe (see §4.1).

| Modal | Component | Trigger(s) | Notes |
|-------|-----------|------------|-------|
| Float Rebalance | `FlowModal` | Hero primary, float cards, attention row, quick actions, liquidity-health "Fix Issues" | 4-step: Source → Amount → Approve → Done |
| Top-up Business Float | `SimpleModal` | Connection banner "Link API Key", attention row, quick actions | onToast on submit |
| Liquidity Forecast & Recommendations | `ModalShell` (tabbed via `ForecastTabs`) | Hero, floating bar, quick actions | 48h/7d/30d pill switch; "Apply" swaps to Forecast Apply |
| Apply Forecast Recommendations | `SimpleModal` | swap from Forecast | onToast on submit |
| My Access & Governance | `SimpleModal`/`ModalShell` | Hero, quick actions | Facilitator scope requests |
| Liquidity Health Check | `ModalShell` | Hero "Health check" | Domain-specific health table (Land Buyers LTD / Company 2 / rails); "Fix Issues" swaps to Rebalance |
| Float Alerts | `ModalShell` | Hero, page bar, monitoring section | Notification list; "Configure" swaps to Float Rules |
| Scenario Planning | `SimpleModal` | Risk Scenarios "Plan scenario" | Domain scenario list (Land Buyers weekly batch, Company 2 surge, M-Pesa delay) |
| Float Rules & Thresholds | `SimpleModal` | Hero, float cards, monitoring, alerts swap | Per-business min/top-up/trigger; onToast on submit |
| Internal Transfer (Wallet Transfer) | `SimpleModal` | My wallets, quick actions | Business Wallet ↔ Virtual Wallet; onToast on submit |
| Reconciliation cross-link | `ModalShell` | Quick actions "Reconcile", attention row, Settlement Detail swap | Cross-navigates toward `/pm/app/reconciliation` workflow |
| Settlement status | `SimpleModal` | Movements ledger "Settlement status" | Swaps to Reconciliation or Settlement Detail |
| Settlement Detail | `SimpleModal`/`ModalShell` | swap from Settlement status | Swaps onward to Reconciliation |
| Export Liquidity Report | `SimpleModal` | Page bar "Reports", quick actions, activity log "Full Audit Log" | Report type/date-range/format; onToast on submit |
| All Attention Items | `SimpleModal` | Attention queue "View all" | Full attention list with per-row actions |

### 4.1 Modals removed (dead code, 0 inbound triggers after reframe)

Removed together with their now-unused helper components (`DangerFlowModal`, `FacilityPicker`,
`SwitchRow`) because the World A/B float-workspace reframe eliminated every caller:

`agentFloatModal`, `agentTopupModal`, `agentDetailModal`, `agentTopupQuickModal`,
`bulkTopupModal`, `emergencyLiquidityModal`, `partnerTopupModal`, `profileModal`,
`quickRebalanceModal`, `internalPoolModal`.

Modal count went from 25 (legacy bank-treasury console) to 15 (payment-facilitator workspace).

---

## 5. Code-Complete Checklist

### Theme and typography
- [x] Emerald `#12b76a` (`--pri`) as the only primary interaction color
- [x] Navy `#0b1322`-family sidebar (shell-owned, not duplicated on this page)
- [x] Cool neutral borders, `--bg` canvas
- [x] Semantic colors for status: warn, danger, info, violet
- [x] Inter for body, Sora for headings/KPI values (via existing page tokens)

### Shared shell
- [x] No local sidebar or header — shell provides those
- [x] Page renders within shell's content area

### Page structure
- [x] Executive hero with dark navy/emerald gradient, live pill, snapshot aside
- [x] Numbered dashboard sections (01–06 for World A, 01–04 for World B)
- [x] KPI grid replacing the old bare `row g-3` stat cards
- [x] Attention/suggestions/quick-actions queue grid
- [x] Floating command bar with primary Rebalance action
- [x] Page footer with cross-links to Reconciliation / Settlement / Payment Rails
- [x] Toast stack wired to modal `onSubmit` callbacks via `onToast`

### Modals
- [x] All 15 modals use shared SimpleModal / FlowModal / TabbedModal / ModalShell primitives
- [x] Dead legacy modals (10 ids + DangerFlowModal/FacilityPicker/SwitchRow helpers) removed
- [x] `scenarioModal` and `settlementModal` given real triggers (previously 0 inbound)
- [x] `liquidityHealthModal` content rewritten to the current domain and given a hero trigger
- [x] Cross-modal navigation via `swap()` preserved (attention → rebalance/topup/thresholds/reconciliation, forecast → apply, health → rebalance, alerts → thresholds, settlement → detail → reconciliation)
- [x] Key SimpleModal submits surface a page-level toast (`onToast`)

### Responsive
- [x] `>= 1200px`: full KPI/queue grids
- [x] `<= 1199.98px`: 2-column KPI/queue grids, stacked hero
- [x] `<= 767.98px`: single-column hero/KPI/queue, wrapped floating bar
- [x] `<= 575.98px`: single-column everything, compact floating bar

---

## 6. Release Gates

- [x] TypeScript typecheck passes — zero diagnostics in liquidity files (August 30, 2026)
- [x] Shared modal components from `shared/components/modals.tsx` used consistently
- [x] CSS additions scoped to `liquidity.module.css` page-level styles only
- [x] Executive hero, numbered sections, floating bar, footer, toast stack added matching blueprint pattern
- [x] Dead modal audit completed and applied (25 → 15 modals)
- [x] Route link paths corrected to real `/pm/app/*` routes (breadcrumb + footer cross-links)
- [ ] Biome: 8 pre-existing a11y/CSS lint errors remain (label-without-control on legacy date/select fields, CSS descending-specificity, `!important` in reduced-motion block) — same category of pre-existing debt as payment-rails (3 errors); not introduced by this pass
- [ ] Manual visual-QA checklist signed off by reviewer
