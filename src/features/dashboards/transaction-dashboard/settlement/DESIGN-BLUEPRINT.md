# PayMo Business → Settlement Page Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Implementation target: `transaction-dashboard/settlement/`
> Last reconciled: August 30, 2026
> Refined: August 30, 2026 — removed local chrome, migrated to shared modal primitives, matched transfer-overview hierarchy, phased out bank-grade clearing concepts (payment-facilitator reframe)

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.settlementPage {
  /* ── Brand ── */
  --pm-green: #12b76a;
  --pm-green-dark: #0b8f52;
  --pm-green-soft: #e7f8ef;
  --pm-primary-light: #e9f9f0;

  /* ── Neutrals ── */
  --pm-ink: #101828;
  --pm-muted: #667085;
  --pm-bg: #f2f4f8;
  --pm-card: #ffffff;
  --pm-border: #e6e9f0;
  --pm-sidebar: #0b1322;
  --pm-surface-2: #f8f9fc;

  /* ── Semantic ── */
  --pm-warn: #f79009;
  --pm-warning: #f79009;
  --pm-warning-soft: #fef0c7;
  --pm-danger: #f04438;
  --pm-danger-soft: #fee4e2;
  --pm-blue: #2e90fa;
  --pm-blue-soft: #e8f1fe;
  --pm-violet: #7a5af8;
  --pm-violet-soft: #f0ebfe;

  /* ── Dimensions ── */
  --pm-radius: 16px;
  --pm-shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px -12px rgba(16, 24, 40, 0.12);
  --pm-shadow-lg: 0 24px 60px -16px rgba(16, 24, 40, 0.28);
}
```

The settlement page redeclares the same tokens as `transfer-overview.module.css`, `fees.module.css` and `shell.module.css` so the page module is self-contained while every value is identical to the business language. Settlement-only additions: `--pm-primary-light` (soft emerald fill used by the "Businesses" quick action) and `--pm-surface-2` (subtle inset surface for KPI strips inside business cards).

---

## 2. TYPOGRAPHY

| Element | Family | Size | Weight | Notes |
|---------|--------|------|--------|-------|
| Body | `"Inter", system-ui, sans-serif` | `0.925rem` | 400 | `-webkit-font-smoothing: antialiased` |
| Headings (h1-h5) | `"Sora", "Inter", sans-serif` | varies | 700 | `letter-spacing: -0.02em` |
| Hero headline | Sora | `1.7rem` | 800 | `letter-spacing: -0.03em` |
| Hero metric value | Sora | `1.9rem` | 800 | `letter-spacing: -0.03em` |
| KPI label | Inter | `0.72rem` | 600 | `text-transform: uppercase; letter-spacing: 0.06em; color: var(--pm-muted)` |
| KPI value | Sora | `1.65rem` | 800 | `letter-spacing: -0.03em` |
| Section heading | Sora | `1.12rem` | 700 | |
| Section number badge | — | `0.72rem` | 700 | 30×30px, rounded 9px, `var(--pm-ink)` bg |
| Section subtitle | Inter | `0.82rem` | 400 | `color: var(--pm-muted)` |
| Table header | Inter | `0.68rem` | 700 | `text-transform: uppercase; letter-spacing: 0.07em; color: var(--pm-muted)` |
| Table cell | Inter | `0.86rem` | 400 | |
| Badge | Inter | `0.7rem` | 600 | `border-radius: 99px` |
| Button | Inter | varies | 600 | |
| Form label | Inter | `0.8rem` | 600 | `color: #344054` |
| Form input | Inter | `0.9rem` | 400 | |
| Segmented control label | Inter | `0.84rem` | 600 | |
| Scope pill | Inter | `0.76rem` | 600 | 99px radius, ink-on for active, customer-count chip |
| Connection banner | Inter | `0.8rem` | 400/600 | title 600, body 400 |
| Wallet balance | Sora | `1.5rem` | 800 | `letter-spacing: -0.02em` |
| Wizard dot | Inter | `0.82rem` | 700 | 34×34px circle |
| Wizard label | Inter | `0.68rem` | 600 | |

---

## 3. LAYOUT SHELL

The settlement page renders inside the shared authenticated shell (`Layouts/shell/`). It does **not** define its own sidebar or page topbar.

```css
/* Owned by the shell — never redefined by page CSS */
.sidebar { width: 264px; background: var(--pm-sidebar); }   /* 76px compact state */
.topHeader { height: 62px; background: rgba(255,255,255,0.88); backdrop-filter: blur(10px); }
.mainContent { margin-left: 264px; padding: 1.5rem 1.5rem 7rem; max-width: 1500px; }
```

- Page root: `main.settlementPage > .main` — `max-width: 1500px; margin: 0 auto; padding: 1.5rem 1.5rem 7rem`.
- Sidebar collapses to off-canvas below 1200px (shell-owned behavior).
- Local chrome removed: the old page's own pageBar/breadcrumb/profile/notifications buttons are gone; the shell topbar breadcrumb, user menu and notification dropdown cover them. The page keeps a bell action inside the "Needs your attention" card header that opens the page-level Notifications modal (same pattern as fees' `feeNotifModal` and transfer-overview's notifications modal).

---

## 4. COMPONENT PATTERNS

### Card
```css
.card, .tableCard, .listCard, .bizCard, .walletCard, .panel {
  background: var(--pm-card);
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius);
  box-shadow: var(--pm-shadow);
  padding: 1.25rem;
}
```

### Hero (navy/emerald executive banner)
```css
.heroBanner {
  border-radius: var(--pm-radius);
  border: 1px solid var(--pm-border);
  overflow: hidden;
  background: linear-gradient(115deg, #0b1322 0%, #123a2c 60%, #0d5c38 100%);
  color: #fff;
  box-shadow: var(--pm-shadow);
}
```
- Eyebrow chip (page code "Settlement & Clearing" + live preview pill), headline ("Every collection, payout and refund settled with full traceability."), sub-copy, hero snapshot with collected-this-month value (KES 86.4M) and 3-row metric breakdown (Paid out / Refunds issued / Float available), primary action (New Payout) + secondary actions (Link API, Statements, Rebalance).
- Hero orbs (`heroOrbOne`, `heroOrbTwo`) — translucent green/blue radial decorations, `pointer-events: none`.

### Buttons
```css
.btnPmP { background: var(--pm-green); border-color: var(--pm-green); border-radius: 10px; font-weight: 600; }
.btnPmP:hover { background: var(--pm-green-dark); border-color: var(--pm-green-dark); }
.btnPm { border: 1px solid var(--pm-border); background: #fff; color: #475467; border-radius: 10px; font-weight: 600; }
.btnPm:hover { background: #f2f4f8; color: var(--pm-ink); }
.btnPmD { border: 1px solid var(--pm-danger); color: var(--pm-danger); background: #fff; border-radius: 10px; font-weight: 600; }
.heroPrimaryBtn { background: #fff; color: #075c38; border-radius: 10px; font-weight: 600; }
.heroSecondaryBtn { border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.08); color: #fff; border-radius: 10px; }
```
Destructive-flavored action (`btnPmD`) is used sparingly — "Review" on the missing-KYC attention item and "Retry" on failed settlements.

### Badges (soft)
```css
.badgeS { background: var(--pm-green-soft); color: #067647; }
.badgeW { background: #fef0c7; color: #93370d; }
.badgeD { background: #fee4e2; color: #b42318; }
.badgeI { background: #e8f1fe; color: #175cd3; }
.badgeP { background: #f0ebfe; color: #5925dc; }
```
All `border-radius: 99px; font-size: 0.7rem; font-weight: 600; padding: 0.32em 0.7em;` — same mapping as the shared `badge*` classes in `appPage.module.css`. Badges always carry text; color is never the only signal.

### Segmented control (world switch)
```css
.segmented { display: inline-flex; background: #eef0f4; border-radius: 10px; padding: 3px; }
.segmented button { border: none; background: transparent; padding: 0.45rem 1.1rem; border-radius: 8px; font-weight: 600; color: #667085; }
.segmented button.segmentActive { background: #fff; color: var(--pm-ink); box-shadow: 0 1px 3px rgba(16,24,40,0.12); }
.segmented button.segmentActive i { color: var(--pm-green); }
```
Segments: "Customer Settlements" (`bi-people`) and "My Wallets & Internal" (`bi-wallet2`).

### Scope pills (business filter)
```css
.filterPills { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
.filterPills button { border: 1px solid var(--pm-border); background: #fff; border-radius: 99px; padding: 0.35rem 0.85rem; font-weight: 600; font-size: 0.76rem; color: #475467; }
.filterPills button.filterActive { background: var(--pm-ink); color: #fff; border-color: var(--pm-ink); }
.bizCount { min-width: 1.25rem; height: 1.25rem; border-radius: 99px; background: #eef0f4; color: #475467; font-size: 0.68rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; padding: 0 0.35rem; }
```
Filter pills: "All Businesses (2)" / "Land Buyers LTD (30)" / "Company 2 (209)". Active pill shows an inverted customer-count chip.

### Live dot
```css
.liveDot { width: 8px; height: 8px; border-radius: 50%; background: var(--pm-green);
  box-shadow: 0 0 0 0 rgba(18,183,106,.5); animation: pmPulse 2s infinite; display: inline-block; }
```

### Connection banner (page-level, settlement-specific)
```css
.connBanner { display: flex; align-items: center; gap: 0.9rem; background: linear-gradient(90deg, #e7f8ef, #f2fbf6);
  border: 1px solid #c6eeda; border-radius: 14px; padding: 0.85rem 1.1rem; flex-wrap: wrap; }
.connIcon { width: 40px; height: 40px; border-radius: 12px; background: #fff; color: var(--pm-green); display: grid; place-items: center; }
.connTitle { font-weight: 700; font-size: 0.86rem; }
.connSub { font-size: 0.78rem; color: var(--pm-muted); }
.connTag { margin-left: auto; font-size: 0.72rem; font-weight: 600; color: var(--pm-green-dark); display: inline-flex; align-items: center; gap: 0.35rem; }
```
Rendered when `paymoConnected` is false (preview mode) with a "Link API Key" action opening `linkApiModal`.

### Business card (settlement-specific)
```css
.bizCard { display: flex; flex-direction: column; gap: 0.9rem; }
.bizName { font-family: "Sora", sans-serif; font-size: 1rem; font-weight: 700; margin: 0; }
.bizType { font-size: 0.76rem; color: var(--pm-muted); margin: 0.15rem 0 0; }
.bizKpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; background: var(--pm-surface-2);
  border: 1px solid var(--pm-border); border-radius: 12px; padding: 0.7rem 0.85rem; }
.bizKpiLabel { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--pm-muted); }
.bizKpiValue { font-family: "Sora", sans-serif; font-size: 0.95rem; font-weight: 700; white-space: nowrap; }
```

### Permission track + float meter
```css
.permTrack, .floatMeter { display: flex; align-items: center; gap: 0.55rem; font-size: 0.76rem; color: var(--pm-muted); }
.permBar { flex: 1; height: 6px; border-radius: 99px; background: #eef0f4; }
.permFill { height: 100%; border-radius: 99px; background: var(--pm-green); }
.floatFill { height: 100%; border-radius: 99px; background: var(--pm-blue); }
.floatLow { background: var(--pm-warning); }
```
Float is low (amber fill) when `float <= minFloat * 1.1`; the business status badge flips to warning with an `bi-exclamation-triangle` icon and the Rebalance button flips to `btnPmD`.

### Wallet card (internal world)
```css
.walletCard { display: flex; flex-direction: column; gap: 0.8rem; }
.walletIcon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
.walletBalance { font-family: "Sora", sans-serif; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; }
.walletRow { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--pm-muted); }
.walletRow strong { color: var(--pm-ink); }
```

---

## 5. TABLE

```css
.tableCard { background: #fff; border: 1px solid var(--pm-border); border-radius: var(--pm-radius); box-shadow: var(--pm-shadow); padding: 1.25rem; }
.tableToolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tableTitle { font-family: "Sora", sans-serif; font-size: 0.98rem; font-weight: 700; margin: 0; }
.tableSub { font-size: 0.78rem; color: var(--pm-muted); margin: 0.2rem 0 0; }
.tableWrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--pm-border); }
.tbl { width: 100%; margin-bottom: 0; font-size: 0.86rem; }
.tbl thead th {
  font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--pm-muted); border-bottom: 1px solid var(--pm-border);
  padding: 0.65rem 0.85rem; white-space: nowrap; font-weight: 700; background: #fafbfd;
}
.tbl tbody td { padding: 0.7rem 0.85rem; border-bottom: 1px solid #f0f2f6; vertical-align: middle; }
.tbl tbody tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover { background: #fafbfd; }
```

Settlement tables:
- Collections/Payouts/Refunds ledger (tabbed within one card): Ref / Business / Customer / Method / Amount / Status / Action.
- Reconciliation summary: Batch / Expected / Actual / Variance / Status / Action.
- Internal transfers: Time / From / To / Amount / Status.
- Business onboarding & permissions: Business / Customers / KYC Docs / Permissions / Settlement Account / Fee / Schedule / Action.
- Recent settlement activity: Time / World / Ref / Activity / Amount / Status / Action.

### World tags (activity feed)
```css
.flowTag { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 99px; padding: 0.28rem 0.6rem; font-size: 0.7rem; font-weight: 600; }
.flowCustomer { background: var(--pm-green-soft); color: #067647; }   /* bi-people  */
.flowInternal  { background: #eef0f4; color: #475467; }              /* bi-wallet2 */
```
Tags always carry a text label ("Customer"/"Internal") so color is never the only signal.

---

## 6. MODAL

All modals use the shared primitives from `transaction-dashboard/shared/components/modals.tsx` — `ModalShell`, `SimpleModal`, `FlowModal`. Shared CSS (`.modalOverlay`, `.modalWrapper`, `.modalSm/Md/Lg/Xl`, `.modalContent`, `.modalHeader`, `.modalFooter`) comes from `shared/styles/appPage.module.css`:

```css
/* Shared (appPage.module.css) — do not redefine in page CSS */
.modalOverlay { background: rgba(11,19,34,0.55); backdrop-filter: blur(4px); }
.modalWrapper { display: flex; align-items: flex-end; justify-content: center; }
.modalContent { border-radius: 18px; box-shadow: var(--pm-shadow-lg); border: none; }
/* Mobile: bottom sheet, max 92dvh */
```

- Escape closes; focus returns to the trigger; body scroll locks while open; close button receives initial focus.
- Mobile (< 576px) dialogs become bottom sheets with `max-height: 92dvh`.
- In-modal content styling (`summaryBox*`, `sr`, `mutedSmall`, `miniStat*`, `receipt*`) lives in `settlement.module.css` and pairs with the shared field/pill/table classes.

---

## 7. WIZARD / STEPPER (FlowModal)

Two flows use the shared `FlowModal` stepper:

| Flow | Steps | Confirm label | Success |
|------|-------|---------------|---------|
| Reconciliation Wizard (`reconciliationWizardModal`) | Select → Match → Resolve → Done | Reconcile | shared success page ("Reconciliation Complete": 1,142 matched • 47 exceptions resolved • Report generated) |
| Raise Settlement Dispute (`disputeModal`) | Details → Evidence → Done | Submit | shared success page ("Dispute Filed": Case #SET-44901) |

Stepper semantics (shared): semantic `<ol>` track, completed dots turn green with check, active dot gets the green focus halo, connectors fill green when done, `prefers-reduced-motion` respected.

---

## 8. SECTION HEADERS

```tsx
<SectionHeading
  id="set-sec-pulse"
  index="1.1"
  title="Settlement pulse"
  description="All businesses — headline figures for the current settlement cycle."
  action={<button className={`${styles.btnPmP} btn btn-sm`} ...>…</button>}
/>
```

```css
.sectionHeading { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin: 2.1rem 0 1rem; flex-wrap: wrap; }
.sectionHeadingCopy { display: flex; align-items: center; gap: 0.75rem; }
.sectionIndex { width: 30px; height: 30px; border-radius: 9px; background: var(--pm-ink); color: #fff;
  font-size: 0.72rem; font-weight: 700; display: grid; place-items: center; flex: none; }
.sectionHeading h2 { font-size: 1.12rem; margin: 0; font-weight: 700; }
.sectionHeading p { color: var(--pm-muted); font-size: 0.82rem; margin: 0.15rem 0 0; }
```

---

## 9. PAGE HIERARCHY (numbered sections)

| # | Section | World | Content |
|---|---------|-------|---------|
| — | Hero | both | Executive navy/emerald banner, live state, collected-this-month snapshot (KES 86.4M), 3 metric rows, actions (New Payout / Link API / Statements / Rebalance) |
| — | Control strip | both | World segmented control (Customer Settlements / My Wallets & Internal) + business scope pills (All / Land Buyers LTD / Company 2) + scope note; Link Business action |
| — | Connection banner | both | Shown while `paymoConnected === false`: link-API CTA + sandbox tag |
| 1.1 | Settlement pulse | both | 6 KPI cards — customers: Collected, Paid out, Refunds issued, Net earned (fees), Pending payout, Float available; internal: Total wallet balance, Available now, Pending settlement, Float committed, Transfers (MTD), Withdrawals (MTD) |
| 1.2 | Needs your attention | both | Attention list + smart suggestions list + quick-action card (8 actions) |
| 1.3 | Linked businesses | customers | Business cards: KPIs (collected/paid/refunds/fee), permission track, float meter, Manage/Payout/Rebalance actions |
| 1.3 | My wallets & internal transfers | internal | Wallet cards (balance, available, pending, top-up/send/withdraw) + internal transfers table |
| 1.4 | Collections, payouts & refunds | customers | Tabbed ledger (Collections / Payouts / Refunds) + export, scope-aware |
| 1.5 | Rebalance & float | customers | Float levels panel per business + recent rebalances |
| 1.6 | Reconciliation & dispute resolution | both | Reconciliation summary table + open disputes |
| 1.7 | Settlement reports & analytics | both | 7-day trend chart + key metrics + compliance shortcut |
| 1.8 | Automated settlement rules | both | Active automation rules list |
| 1.9 | Business onboarding & permissions | both | Permissions table (KYC, granted x/8, settlement account, fee, schedule) |
| 1.10 | Recent settlement activity | both | Activity table with world tags (Customer/Internal) + full-log action |

World-specific sections swap 1.3/1.4/1.5 between the two worlds; numbering stays stable so the hierarchy reads consistently in both directions.

---

## 10. KPI CARD

```css
.kpiGrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
@media (max-width: 1280px) { .kpiGrid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px)  { .kpiGrid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 576px)  { .kpiGrid { grid-template-columns: 1fr; } }

.kpiCard { background: #fff; border: 1px solid var(--pm-border); border-radius: var(--pm-radius);
  box-shadow: var(--pm-shadow); padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 0.55rem; }
.kpiIcon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; }
.kpiIconGreen { background: var(--pm-green-soft); color: var(--pm-green-dark); }
.kpiIconAmber { background: var(--pm-warning-soft); color: #b54708; }
.kpiIconBlue  { background: var(--pm-blue-soft); color: var(--pm-blue); }
.kpiIconPurple{ background: var(--pm-violet-soft); color: var(--pm-violet); }
.kpiIconSlate { background: #eef0f4; color: #475467; }
.kpiValue { font-family: "Sora", sans-serif; font-size: 1.65rem; font-weight: 800; letter-spacing: -0.03em; }
.kpiMeta { display: flex; align-items: center; gap: 0.45rem; font-size: 0.76rem; color: var(--pm-muted); }
```

---

## 11. FORMS

Shared `Field` / `SelectField` / `Toggle` / `InfoBox` / `ReviewRow` primitives from `shared/components/modals.tsx`, styled by `appPage.module.css`:

```css
.fieldLabel { font-weight: 600; font-size: 0.8rem; color: #344054; margin-bottom: 0.3rem; }
/* controls: border-radius 10px, border var(--pm-border), focus ring rgba(18,183,106,0.14) */
```

Forms inside modals use the shared primitives (`SelectField` for business/source wallet/channel/purpose; `Toggle` for rule enablement; `Field` for amounts and references). Multi-field layouts use Bootstrap `.row g-3` inside the modal body. Native `<form>` with `onSubmit` is used only inside the auto-rules "Create New" tab so the Add Rule button submits FormData-named fields.

---

## 12. TOASTS / DRAWERS / SCROLLBAR / ANIMATIONS

- Toasts: shell-owned `.toastContainer` / `.paymoToast` (from `shell.module.css`). The old page-local toast stack was removed.
- Drawers/asides: shell-owned `.leftDrawer` / `.rightAside`.
- Scrollbar: thin `#c8cdd8` on transparent track (global).
- Animations (defined once, page-level):
  - `pmPulse` — live-dot ring (2s infinite)
  - `pmPop` — modal content entrance
  - `pmSlideIn` — drawer entrance
  - `pmToastIn` — toast entrance
  - `pmSpin` — processing spinner
- `@media (prefers-reduced-motion: reduce)` — disables pulse/pop/slide/transition.

---

## 13. RESPONSIVE BREAKPOINTS

| Breakpoint | Behavior |
|---|---|
| `>= 1200px` | Full fixed 264px sidebar, hero + control strip on one line, 6-col KPI grid, 2-col business cards, ledger + recon side-by-side panels |
| `1100–1199px` | Off-canvas shell nav; hero metrics wrap; 3-col KPI grid |
| `768–1099px` | 3-col→2-col KPI, business cards 2-col→1-col, panels stack |
| `< 768px` | Single-column hero and cards, control strip wraps, tables scroll inside cards, section actions wrap |
| `< 576px` | 1-col KPI, bottom-sheet modals, icon-first floating bar (labels hidden), floating bar buttons ≥ 40px targets |

---

## 14. STATUS-TO-TONE MAP (settlement-specific)

| Status string | Badge class |
|---|---|
| Collected, Paid Out, Matched, Completed, Active, Verified, Applied, Resolved, Enabled, Submitted | `badgeS` |
| Pending, Pending Approval, In Progress, Scheduled, Paused, Exception, Flagged, Requested | `badgeW` |
| Failed, Suspended, Rejected, Disputed, Overdue | `badgeD` |
| Sent, Requested, Submitted, In transit | `badgeI` |
| In review, Monitored | `badgeP` |
| Inactive, Archived, Closed | muted slate (`#f2f4f8`/`#475467`) |

World tags: `flowCustomer` (emerald, `bi-people`) vs `flowInternal` (slate, `bi-wallet2`) — always paired with a text label so color is never the only signal.

Permission dots: `permDot` + `permOk` (green) / `permPending` (amber) — always paired with `permItem` label/detail text and a Grant/Requested badge or Request button.

---

## 15. IMPLEMENTATION ARCHITECTURE

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Settlement page | `settlement/pages/Settlement.tsx` | Hero, connection banner, control strip (world + scope), KPI pulse, attention/suggestions/quick actions, world-specific sections (businesses/ledger/rebalance vs wallets/transfers), reconciliation, reports, rules, onboarding, activity, floating bar, footer |
| Settlement modals | `settlement/components/SettlementModals.tsx` | 21 dialogs on shared `ModalShell`/`SimpleModal`/`FlowModal`, steppers, receipts, downloads, cross-modal navigation |
| Business theme contract | `shell.module.css`, `settlement.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

Do not add a second local sidebar or page topbar to a transaction route. Routes below `/pm/app` inherit those surfaces from `AppShell`. Page-level CSS must remain scoped and must not redefine the shell position.

### Current reusable mapping

| Business pattern | Settlement implementation |
|---|---|
| Fixed 264px navy rail | `.sidebar.expanded`; 76px compact state (shell) |
| Sticky/translucent topbar | `.topHeader` (shell) |
| `pm-banner-hero` | `.heroBanner`, `.heroContent`, `.heroSnapshot`, `.heroMetricRow` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.10`) |
| `pm-card` | `.tableCard`, `.listCard`, `.bizCard`, `.walletCard`, `.panel` |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue`, `.kpiMeta` |
| Soft status badge | `.badgeS/W/D/I/P` (+ shared `badge*` in modals) |
| Primary / secondary button | `.btnPmP` / `.btnPm`, `.btnPmD` (+ shared `btn`, `btnPrimary`, `btnSecondary`, `btnSm`) |
| Operational list card | `.listCard`, `.actionRow`, `.actionRowMain`, `.actionRowActions` |
| Business table and toolbar | `.tableCard`, `.tableToolbar`, `.tableWrap`, `.tbl`, `.filterPills`, `.tableFooter` |
| Segmented direction control | `.controlStrip`, `.segmented`, `.segmentActive` |
| Quick-action grid | `.quickGrid`, `.quickActionCard` |
| Analytics panel | `.panel`, `.chartBars`, `.barLabel`, `.miniStat*` |
| Connection/onboarding banner | `.connBanner`, `.connIcon`, `.connText`, `.connTag` |
| Floating quick-action bar | `.floatingBar`, `.floatingPrimary` (Attention · Activity · Health · New Payout) |
| Modal / wizard | Shared `ModalShell`, `SimpleModal`, `FlowModal` from `shared/components/modals.tsx` |
| Shell toast | `.toastContainer`, `.paymoToast` (from `shell.module.css`) |

---

## 16. SHARED MODAL ARCHITECTURE (21 modals)

All 21 modals use the shared transaction modal primitives from `shared/components/modals.tsx`:

| Modal | Component | Notes |
|-------|-----------|-------|
| Link Paymo API (`linkApiModal`) | `SimpleModal` | API key (password), Sandbox/Production env pills, webhook URL; Save & Connect → "Paymo connected successfully. Webhook verified." PYM-KEY-8841 |
| New Payout (`payoutModal`) | `SimpleModal` | Business select (pending balances), When pills (Now/Today/Weekly), amount, settlement account, fee summary; → PO-9921 |
| Rebalance Float (`rebalanceModal`) | `SimpleModal` | Business + source wallet selects, amount, min-float note; → RB-102 |
| Internal Transfer (`internalTransferModal`) | `SimpleModal` | From wallet → virtual/business float/bank, amount + reference; instant-and-free note; → TW-9922 |
| Wallet Top Up (`walletTopUpModal`) | `SimpleModal` | Wallet, amount, funding source (bank/corporate card); → TU-552 |
| Issue Refund (`refundModal`) | `SimpleModal` | Business, customer, txn ref, amount, reason; second-approver warning; → RF-4413 |
| Retry Failed Settlement (`retrySettlementModal`) | `SimpleModal` | Failed-settlement checkboxes, retry reason, fee warning; → SET-88425 |
| Partial Settlement Resolution (`partialSettlementModal`) | `SimpleModal` | Partial amount + liquidity-constraint note; → remaining scheduled tomorrow |
| Settlement Details (`settlementDetailModal`) | `ModalShell` | Read-only ref/timeline; footer "Retry if Failed" → `retrySettlementModal` |
| Reconciliation Details (`reconciliationDetailModal`) | `ModalShell` | Batch expected/actual/variance (read-only) |
| Reconciliation Wizard (`reconciliationWizardModal`) | `FlowModal` | 4-step Select → Match → Resolve → Done; Resolve step opens `disputeModal` / `partialSettlementModal` via `onOpen` |
| Raise Settlement Dispute (`disputeModal`) | `FlowModal` | 3-step Details → Evidence → Done |
| Automated Settlement Rules (`autoRulesModal`) | `ModalShell` | Tabs Active/Create/History; active rules editable with toggles; create tab appends rules; history from `RULE_HISTORY` |
| Regulatory Compliance Reports (`complianceReportModal`) | `SimpleModal` | Filing list (CBK/KRA/AML/FX) with submit → CBK-20250627-001 |
| Generate Settlement Report (`generateReportModal`) | `SimpleModal` | Report type + date range + format; `onSubmit` downloads CSV |
| Settlement Health Check (`healthCheckModal`) | `ModalShell` | Health score mini-stats + action rows → `retrySettlementModal` / `rtgsUrgentModal` / `disputeModal` |
| Priority Payout Submission (`rtgsUrgentModal`) | `SimpleModal` | Cut-off warning + priority reason; → urgent flag fee note |
| Full Activity Log (`activityLogModal`) | `ModalShell` | Time/Ref/Action/User/Result table (read-only) |
| All Attention Items (`attentionModal`) | `ModalShell` | Full queue; rows navigate via `onOpen` → `retrySettlementModal` / `rtgsUrgentModal` / `disputeModal` |
| Notifications (`notifModal`) | `ModalShell` | 3 notice cards (failed settlement, cut-off, dispute evidence) |
| Linked Business Details (`businessDetailModal`) | `ModalShell` | `MODAL_BIZ` pills + Overview/Permissions/Ledger tabs; footer New Payout → `payoutModal` + Rebalance → `rebalanceModal` |

Cross-modal navigation uses the `onOpen` callback passed from the page component. The 5 legacy bank-grade dialogs were intentionally **cut** with the payment-facilitator reframe: `nostroModal`, `nostroTransferModal`, `pesaLinkModal`, `settlementCalendarModal`, `clearingStatusModal` — their content maps to the consumer-rail concepts in the design (bank transfer / M-Pesa / PayMo wallet). Legacy `rtgsUrgentModal` was **kept** and reframed as "Priority Payout Submission" (cut-off warning + priority reason). Legacy `RULE_CHANNELS` (RTGS/PesaLink/SWIFT) became "M-Pesa" / "Bank transfer" / "PayMo wallet" / "Card" / "All channels".

---

## 17. CODE-COMPLETE CHECKLIST (refined August 30, 2026)

### Theme and typography
- [x] Emerald `#12b76a` as the only primary interaction color.
- [x] `#0b1322` navigation rail and `#f2f4f8` canvas.
- [x] Cool neutral borders `#e6e9f0`; no warm/cream transaction styling.
- [x] Semantic colors only for status: warning `#f79009`, danger `#f04438`, info `#2e90fa`, violet `#7a5af8`.
- [x] Inter for body/control copy, Sora for headings/KPI values (loaded once in `src/routes/__root.tsx`).
- [x] Bootstrap Icons everywhere; icons support labels and are never the sole status signal.

### Shared shell
- [x] Page renders inside `AppShell`; no local sidebar/topbar/breadcrumb/profile chrome (`pageBar`, `breadcrumb`, `profileModal`, `notifModal`-as-topbar-button removed).
- [x] Content centred at max 1500px; page CSS never redefines shell position/surfaces.

### Settlement page hierarchy
- [x] One full-width dark executive hero before the dashboard sections.
- [x] Connection banner with Link API CTA while `paymoConnected === false`.
- [x] World segmented control (Customer Settlements / My Wallets & Internal) + business scope pills (All / Land Buyers LTD / Company 2) + scope note.
- [x] Ten numbered sections (1.1–1.10); world-specific 1.3–1.5 swap by world while numbering stays stable.
- [x] Six consistent KPI cards per world; semantic color reserved for icon/status emphasis.
- [x] Attention + suggestions lists with one primary row action each; 8 quick actions in a shortcut card.
- [x] Linked-business cards with permission tracks + float meters; wallet cards for internal world.
- [x] Reconciliation, reports/analytics, auto rules, onboarding/permissions and activity all visible without opening a dialog.
- [x] Floating command bar (Attention · Activity · Health · New Payout) on desktop, icon-first on mobile.

### Cards, forms, tables and icons
- [x] Cards use 16px radius, subtle border and restrained business elevation.
- [x] Controls use 9–10px radius, green focus ring and clear disabled states.
- [x] Buttons include explicit `type="button"` where they do not submit a native form.
- [x] Form labels associated with controls; segmented control and pills use button semantics with `aria` states.
- [x] Tables use uppercase compact headers, responsive horizontal overflow and non-colour status text (badges always carry text; world tags carry labels).
- [x] Icon-only controls include contextual accessible names.

### Modals and wizards
- [x] All 21 modals migrated from legacy `MBox`/`BusyOverlay` to shared `SimpleModal`/`FlowModal`/`ModalShell`.
- [x] Dialog semantics, Escape-to-close, focus return, scroll lock and bottom-sheet mobile behavior come from the shared primitives.
- [x] Wizard steps are semantic ordered lists with completed/current/upcoming states; connectors turn green when done.
- [x] Preserved: processing receipts, reference numbers (SET-/PO-/RB-/TW-/TU-/RF-/CBK-), downloadable reports, cross-modal navigation (recon wizard → dispute/partial, details → retry, attention → retry/urgent/dispute).
- [x] Five bank-grade dialogs (nostro/nostroTransfer/pesaLink/settlementCalendar/clearingStatus) removed; `rtgsUrgentModal` kept and reframed as Priority Payout Submission; rule channels consumer-ified.
- [x] `prefers-reduced-motion` respected in the page layer.

### Responsive implementation
- [x] `>= 1200px`: full sidebar, 6-col KPI, 2-col business cards, hero snapshot on one line.
- [x] `1100–1199px`: off-canvas shell nav; 3-col KPI.
- [x] `768–1099px`: 2-col KPI where space permits; world sections stack.
- [x] `< 768px`: single-column hero and operational cards, wrapped tools, full-width actions.
- [x] `< 576px`: 1-col KPI, bottom-sheet dialogs, icon-first command bar with 40px targets.

---

## 18. MANUAL VISUAL-QA CHECKLIST

Run this list against `/pm/app/settlement` before release. Deliberately left as review gates rather than implementation claims.

### Desktop — 1440 × 900
- [ ] Sidebar 264px; content has no horizontal jump or overlap.
- [ ] Hero aligns with business Dashboard hero in radius, navy/emerald gradient, type scale and spacing.
- [ ] Six KPI cards equal height; long copy truncates rather than moving the grid.
- [ ] Segmented world control and scope pills align on the control strip; active states clearly visible.
- [ ] Business cards, ledger, recon panels and analytics cards align on the 16px card system.
- [ ] Floating command bar does not cover the footer or table controls at the bottom of the page.

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Sidebar starts closed and opens above the page with one backdrop.
- [ ] KPI grid becomes 3/2 columns; business cards collapse to one column.
- [ ] Tables scroll inside their card; the full document does not scroll horizontally.
- [ ] Modal layering remains correct above the shell.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy has no clipping; action buttons meet 40px minimum targets.
- [ ] Control strip wraps cleanly; scope pills remain tappable.
- [ ] Fixed command bar leaves content reachable and uses a readable labelled primary action.
- [ ] Modals open as bottom sheets, remain scrollable and keep footer actions visible.
- [ ] Stepper labels remain legible without shrinking.

### Interaction and accessibility
- [ ] Keyboard can reach control strip, filters, table actions, floating actions and footer in visual order.
- [ ] Switch world (Customer Settlements ↔ My Wallets & Internal) and scope; verify tables, cards and totals refilter with the scope note updating.
- [ ] Open each of the 21 modals; verify close, processing, receipt and nested-dialog paths.
- [ ] Run the two steppers (reconciliation, dispute) through completion and verify completed connectors.
- [ ] Download the generated settlement report; verify filename and content.
- [ ] At 200% browser zoom, content remains usable with no two-dimensional page scrolling.
- [ ] With reduced motion enabled, pulse/pop transitions are effectively disabled.
- [ ] Run automated contrast/accessibility tooling; manually verify muted text and focus contrast.

---

## 19. RELEASE GATES

- [x] Targeted Biome lint passes for all edited settlement files (August 30, 2026) — no errors; only the same pre-existing repo-wide diagnostics as the fees baseline.
- [x] Vitest suite passes: 1 file, 9 tests (August 30, 2026).
- [x] Production client/server build passes with Vite (August 30, 2026).
- [x] Route responds 200 at `/pm/app/settlement` in the local preview with SSR markers (hero copy, "Needs your attention", "Linked businesses", "Paymo not connected yet").
- [x] Refinement: removed local sidebar/header chrome — the shared AppShell provides those.
- [x] Refinement: 21 modals migrated from legacy `MBox`/`BusyOverlay` to shared `ModalShell`/`SimpleModal`/`FlowModal`; all rendered modals reachable (16 page-open + 5 via in-modal `onOpen` navigation); 5 bank-grade dialogs cut (`rtgsUrgentModal` retained as Priority Payout Submission).
- [x] Refinement: CSS module rewritten on the transfer-overview token set and composition classes; every `styles.*` token referenced by page and modals resolves in `settlement.module.css` or `appPage.module.css` (CSS-reference audit clean).
- [x] Refinement: TypeScript typecheck — zero new diagnostics in settlement files (identical error-key set to the accepted fees baseline).
- [ ] Manual visual-QA checklist above signed off by a reviewer.
- [ ] Real API payload checked against long names, empty arrays, large amounts and non-KES currencies.
