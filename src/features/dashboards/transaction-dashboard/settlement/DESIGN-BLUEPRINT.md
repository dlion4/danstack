# Settlement & Clearing — Design Blueprint
> Implementation target: `transaction-dashboard/settlement/`
> Blueprint source: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md`
> Content source: `settlement/SETTLEMENT_REBUILD_PLAN.md` (payment-facilitator settlement workspace reframe)
> Last reconciled: August 30, 2026

---

## 1. Page Architecture

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `Layouts/shell/` | Fixed navy sidebar, translucent topbar, toasts, responsive offset |
| Settlement page | `settlement/pages/Settlement.tsx` | Executive hero, breadcrumb/profile/notification bar, World A / World B switch, KPI grid, attention/suggestions/quick-actions, linked businesses, collections/payouts/refunds ledger, rebalance & float, my wallets & internal transfers, reconciliation & disputes, reports & analytics, automated rules, business onboarding & permissions, recent activity |
| Settlement modals | `settlement/components/SettlementModals.tsx` | Local `MBox` dialogs for all 32 settlement workflows |
| Page theme contract | `settlement/styles/settlement.module.css` | Page-level CSS tokens, hero, KPI grid, queue grid, numbered sections, floating bar, footer, toast stack |

Do not add a local sidebar or page topbar. Routes below `/pm/app` inherit those from `AppShell`.

The page is a **payment-facilitator settlement workspace**, not a bank treasury console. It models
two distinct money worlds selectable via a top-level switch:

- **World A — Customer Settlements**: money collected from a linked business's customers
  (collections), money paid out to businesses (payouts), and refunds issued back to customers,
  scoped by a business selector (Land Buyers LTD / Company 2 / All businesses).
- **World B — My Internal Settlements**: the platform operator's own wallets (Business Wallet,
  Virtual Wallet) and internal transfers between them.

Bank-grade RTGS/PesaLink/SWIFT clearing-house and Nostro/Vostro concepts from the legacy page were
identified as out of scope for a payment facilitator and are being phased out per
`SETTLEMENT_REBUILD_PLAN.md` §7 ("what to delete / keep"); see §4 below for current modal status.

---

## 2. CSS Design Tokens

Settlement keeps its own pre-existing `--pm-*` custom properties defined on `.settlementPage` —
these already match the blueprint's navy/emerald palette (same values used by Liquidity and
Reconciliation, just under a `--pm-` prefix instead of unprefixed/`--pri`), so no renaming was
needed, only additive hero/section/KPI/queue/floating-bar/footer/toast classes ported from the
same pattern used on Liquidity and Reconciliation:

```css
--pm-primary: #10b981;      /* emerald */
--pm-primary-dark: #059669;
--pm-ink: #1a1f2e;
--pm-ink-soft: #4b5563;
--pm-muted: #9ca3af;
--pm-bg: #f5f1ec;
--pm-surface: #ffffff;
--pm-border: #e5e2dc;
--pm-warning: #f59e0b;
--pm-danger: #ef4444;
--pm-info: #3b82f6;
--pm-purple: #8b5cf6;
--pm-font-display: "Space Grotesk", "Inter", sans-serif;
```

Net-new classes added this pass (ported verbatim from the Liquidity/Reconciliation pattern,
keyframes renamed `pmHeroPulse`/`pmToastIn` for page-local clarity): `.heroBanner`,
`.heroOrbOne`/`.heroOrbTwo`, `.heroContent`, `.heroCopy`, `.heroEyebrow`, `.livePill`, `.liveDot`,
`.heroActions`, `.heroPrimary`/`.heroSecondary`, `.heroSnapshot`, `.heroMetricRow`,
`.dashboardSection`, `.sectionHeading`, `.sectionIndex`, `.kpiGrid`, `.queueGrid`,
`.floatingBar`/`.floatingPrimary`, `.pageFooter`, `.toastStack`/`.toast`/`.toastDanger`.
Responsive overrides added at the existing `1024px` / `768px` breakpoints, matching the rest of
the page.

**Removed this pass** (confirmed 0 JSX references before deletion): the entire legacy
`.sidebar*`/`.header*` CSS block (the page never rendered its own sidebar/header — the shared
`AppShell` already provides those), keeping only `.avatar` inside a new minimal `.main` block.

---

## 3. Page Sections

| # | Section | Description |
|---|---------|-------------|
| — | Executive Hero | Dark navy/emerald gradient banner: live/preview-mode pill, New Payout / Link API / Statements / Rebalance actions, collected-this-month snapshot aside (paid out, refunds, float available) |
| — | Breadcrumb + profile/notifications bar | Home / BaaS Transactions / Settlement & Clearing; Profile / Notifications / Attention / Activity Log actions |
| 01 | Customer/internal settlement metrics | World-aware KPI row: collected/paid-out/refunds/net-earned/pending/float (World A) or wallet balance/available/pending/float/transfers/withdrawals (World B) |
| 02 | Attention, suggestions & quick actions | 3-column queue: attention required, AI smart suggestions, quick-action grid (8 actions) |
| 03 | Linked businesses | Per-business KPI cards (collected/paid/refunds/fees), permission progress bar, float meter, manage/payout/rebalance actions — World A only |
| 04 | Collections, payouts & refunds | Tabbed ledger table scoped to the selected business — World A only |
| 05 | Rebalance & float | Float-level meters per business + recent rebalances table — World A only |
| 06 | My wallets & internal transfers | Wallet cards (Business/Virtual Wallet) + internal transfers table — World B only |
| 07 | Reconciliation & dispute resolution | Recon summary table + open disputes list |
| 08 | Settlement reports & analytics | 7-day trend bars + key metrics panel |
| 09 | Automated settlement rules | Active automation rules list (auto-settle, auto-rebalance, instant refunds) |
| 10 | Business onboarding & permissions | Master table: KYC status, permission progress, settlement account, fee, schedule |
| 11 | Recent settlement activity | Full activity table spanning both worlds |
| — | Floating Command Bar | Fixed bottom bar: Attention, Activity, Health, New Payout (primary) |
| — | Footer | Cross-links to Liquidity & Float / Reconciliation / Payment Rails |

---

## 4. Modal Inventory

All 32 modals are defined in `SettlementModals.tsx` using a local `MBox` primitive (not yet
migrated to the shared `ModalShell`/`SimpleModal`/`FlowModal` set — see §6 open items).

| Status | Count | Modals |
|---|---|---|
| Reachable | 20 | `initiateSettlementModal`, `settlementDetailModal`, `retrySettlementModal`, `reconciliationWizardModal`, `disputeModal`, `autoRulesModal`, `complianceReportModal`, `generateReportModal`, `activityLogModal`, `reconciliationDetailModal`, `profileModal`, `attentionModal`, `notifModal`, `partialSettlementModal`, `businessDetailModal`, `rebalanceModal`, `internalTransferModal`, `walletTopUpModal`, `refundModal`, `payoutModal`, `linkApiModal`, `rtgsUrgentModal`, `healthCheckModal` |
| Orphaned (defined, no inbound trigger) | 9 | `batchInboxModal`, `batchUploadModal`, `clearingStatusModal`, `engineConfigModal`, `fxSettlementModal`, `nostroModal`, `nostroTransferModal`, `pesaLinkModal`, `settlementCalendarModal` |

Triggers wired this pass: `profileModal` and `notifModal` given real header buttons (breadcrumb
bar, mirroring the Reconciliation pattern); `healthCheckModal` given a floating-bar trigger.
`retrySettlementModal` and `rtgsUrgentModal` confirmed reachable through the `attentionModal`
body (nested trigger, not a page-level orphan).

The 9 remaining orphans are all bank-treasury/clearing-house concepts (`SETTLEMENT_REBUILD_PLAN.md`
§7 marks RTGS/PesaLink clearing windows, Nostro/Vostro accounts, and FX settlement as **delete or
fully replace** — out of scope for a payment facilitator's own settlement workspace). They are
left in place (not deleted) this pass to avoid destructive changes without an explicit decision
on their replacement UI; **flagged for the next iteration**: either wire them into a retained
"channel health" panel or remove the modal bodies entirely per the rebuild plan.

---

## 5. Code-Complete Checklist

### Theme and typography
- [x] Emerald `#10b981` (`--pm-primary`) as the primary interaction color
- [x] Navy sidebar (shell-owned, not duplicated on this page)
- [x] Cool neutral borders, `--pm-bg` canvas
- [x] Semantic colors for status: warning, danger, info, purple
- [x] Inter for body, Space Grotesk for headings/KPI values (existing page tokens)

### Shared shell
- [x] No local sidebar or header — shell provides those; dead `.sidebar*`/`.header*` CSS removed (0 JSX refs confirmed before deletion)
- [x] Page renders within shell's content area

### Page structure
- [x] Executive hero with dark navy/emerald gradient, live/preview pill, snapshot aside
- [x] Numbered dashboard sections (01–11), World A/B-aware
- [x] KPI-styled row replacing the old bare `row g-3` stat cards
- [x] Attention/suggestions/quick-actions queue grid
- [x] Floating command bar with primary New Payout action
- [x] Page footer with cross-links to Liquidity & Float / Reconciliation / Payment Rails
- [x] Toast stack + `pushToast` wired through `doAction`/`nextFlow` in `SettlementModals.tsx`

### Config cleanup
- [x] Removed dead `SettlementConfig` fields with 0 JSX references: `nav`, `headerTitle`,
  `headerSub`, `searchPlaceholder`, `user`, `pageCode`, `hero`, `statCards`, `channels`,
  `clearing`, `exceptionQueue`, `engineHealth`, `nostroPositions`, `regReports`
- [x] Removed dead `NavItem`/`StatCard` interfaces
- [x] `pageTitle`/`pageSub` (previously only referenced in a commented-out JSX block) now
  live in the hero banner copy

### Modals
- [x] 20 of 32 modals confirmed reachable (see §4)
- [x] `profileModal` / `notifModal` / `healthCheckModal` given real triggers this pass (previously orphaned)
- [x] Toast threading added to `doAction`/`nextFlow` via new `onToast` prop
- [ ] 9 legacy bank-treasury modals remain orphaned pending a delete-vs-retarget decision (see §4)
- [ ] Not yet migrated from local `MBox` to shared `ModalShell`/`SimpleModal`/`FlowModal` primitives

### Responsive
- [x] Desktop: full KPI/queue grids
- [x] `<= 1024px`: KPI/queue/hero/section reflow rules
- [x] `<= 768px`: stacked hero, wrapped floating bar, single-column KPI grid

---

## 6. Release Gates

- [x] TypeScript typecheck passes — zero diagnostics in settlement files (August 30, 2026)
- [x] CSS additions scoped to `settlement.module.css` page-level styles only
- [x] Executive hero, numbered sections, floating bar, footer, toast stack added matching the Liquidity/Reconciliation pattern
- [x] Modal reachability audit completed — 20/32 reachable, 3 previously-orphaned modals wired this pass, 9 legacy bank-treasury modals documented as pending cleanup
- [x] Vitest suite passes (1 file / 9 tests, unrelated to this page — no settlement-specific tests exist yet)
- [x] Production build succeeds (client + server), `app.settlement` chunk present
- [x] `/pm/app/settlement` returns HTTP 200
- [x] `git diff --check` — no whitespace/conflict-marker errors
- [x] Biome error count improved (162 vs. 166 pre-existing baseline errors, same category: `useButtonType`/`noLabelWithoutControl` a11y warnings on legacy form fields, none introduced by this refinement)
- [ ] Migration to shared `ModalShell`/`SimpleModal`/`FlowModal` primitives (tracked as follow-up, not blocking this pass)
- [ ] Manual visual-QA checklist signed off by reviewer
