# PayMo Business → Fees Page Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Implementation target: `transaction-dashboard/fees/`
> Last reconciled: August 30, 2026
> Refined: August 30, 2026 — removed local chrome, migrated to shared modal primitives, matched transfer-overview hierarchy

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.feesPage {
  /* ── Brand ── */
  --pm-green: #12b76a;
  --pm-green-dark: #0b8f52;
  --pm-green-soft: #e7f8ef;

  /* ── Neutrals ── */
  --pm-ink: #101828;
  --pm-muted: #667085;
  --pm-bg: #f2f4f8;
  --pm-card: #ffffff;
  --pm-border: #e6e9f0;
  --pm-sidebar: #0b1322;

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

The fees page redeclares the same tokens as `transfer-overview.module.css` and `shell.module.css` so the page module is self-contained while every value is identical to the business language. Semantic aliases added for fees-only emphasis: `--pm-warning-soft`, `--pm-danger-soft`, `--pm-blue-soft`, `--pm-violet-soft` for soft badge fills.

---

## 2. TYPOGRAPHY

| Element | Family | Size | Weight | Notes |
|---------|--------|------|--------|-------|
| Body | `"Inter", system-ui, sans-serif` | `0.925rem` | 400 | `-webkit-font-smoothing: antialiased` |
| Headings (h1-h5) | `"Sora", "Inter", sans-serif` | varies | 700 | `letter-spacing: -0.02em` |
| Hero headline | Sora | `1.7rem` | 800 | `letter-spacing: -0.03em` |
| Hero metric value | Sora | `1.9rem` | 800 | `letter-spacing: -0.03em` |
| KPI label | Inter | `0.74rem` | 600 | `text-transform: uppercase; letter-spacing: 0.06em; color: var(--pm-muted)` |
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
| Scope pill | Inter | `0.76rem` | 600 | 99px radius, ink-on for active |
| Nav item | Inter | `0.84rem` | 500 | |
| Wizard dot | Inter | `0.82rem` | 700 | 34×34px circle |
| Wizard label | Inter | `0.68rem` | 600 | |

---

## 3. LAYOUT SHELL

The fees page renders inside the shared authenticated shell (`Layouts/shell/`). It does **not** define its own sidebar or page topbar.

```css
/* Owned by the shell — never redefined by page CSS */
.sidebar { width: 264px; background: var(--pm-sidebar); }   /* 76px compact state */
.topHeader { height: 62px; background: rgba(255,255,255,0.88); backdrop-filter: blur(10px); }
.mainContent { margin-left: 264px; padding: 1.5rem 1.5rem 7rem; max-width: 1500px; }
```

- Page root: `main.feesPage` — `max-width: 1500px; margin: 0 auto; padding: 1.5rem 1.5rem 7rem`.
- Sidebar collapses to off-canvas below 1200px (shell-owned behavior).
- Local chrome removed: the old page's own pageBar/breadcrumb/profile button are gone; the shell topbar breadcrumb and user menu cover them.

---

## 4. COMPONENT PATTERNS

### Card
```css
.card /* page-level: .tableCard, .listCard, .modelTile, .costGrid > div, .complianceGrid > div */ {
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
- Eyebrow chip (page code + live dot), headline, sub-copy, hero snapshot with metric value (KES 1.34M profit) and 3-row metric breakdown, primary action (New Fee Model) + secondary actions (Calculator, Profit Pot).
- Hero orbs (`heroOrbOne`, `heroOrbTwo`) — translucent green radial decorations, `pointer-events: none`.

### Buttons
```css
.btnPmP { background: var(--pm-green); border-color: var(--pm-green); border-radius: 10px; font-weight: 600; }
.btnPmP:hover { background: var(--pm-green-dark); border-color: var(--pm-green-dark); }
.btnPm { border: 1px solid var(--pm-border); background: #fff; color: #475467; border-radius: 10px; font-weight: 600; }
.btnPm:hover { background: #f2f4f8; color: var(--pm-ink); }
.heroPrimaryBtn { background: #fff; color: #075c38; border-radius: 10px; font-weight: 600; }
.heroSecondaryBtn { border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.08); color: #fff; border-radius: 10px; }
.textButton { color: var(--pm-green-dark); font-weight: 600; font-size: 0.82rem; }
```

### Badges (soft)
```css
.badgeS { background: var(--pm-green-soft); color: #067647; }
.badgeW { background: #fef0c7; color: #93370d; }
.badgeD { background: #fee4e2; color: #b42318; }
.badgeI { background: #e8f1fe; color: #175cd3; }
.badgeP { background: #f0ebfe; color: #5925dc; }
```
All `border-radius: 99px; font-size: 0.7rem; font-weight: 600; padding: 0.32em 0.7em;` — same mapping as the shared `badge*` classes in `appPage.module.css`.

### Segmented control (direction world switch)
```css
.segmented { display: inline-flex; background: #eef0f4; border-radius: 10px; padding: 3px; }
.segmented button { border: none; background: transparent; padding: 0.45rem 1.1rem; border-radius: 8px; font-weight: 600; color: #667085; }
.segmented button.segmentActive { background: #fff; color: var(--pm-ink); box-shadow: 0 1px 3px rgba(16,24,40,0.12); }
.segmented button.segmentActive i { color: var(--pm-green); }
```

### Scope pills (business filter)
```css
.filterPills { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
.filterPills button { border: 1px solid var(--pm-border); background: #fff; border-radius: 99px; padding: 0.35rem 0.85rem; font-weight: 600; font-size: 0.76rem; color: #475467; }
.filterPills button.filterActive { background: var(--pm-ink); color: #fff; border-color: var(--pm-ink); }
```

### Live dot
```css
.dotLive { width: 8px; height: 8px; border-radius: 50%; background: var(--pm-green);
  box-shadow: 0 0 0 0 rgba(18,183,106,.5); animation: pmPulse 2s infinite; display: inline-block; }
```

---

## 5. TABLE

```css
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

Fees tables: businesses table (Model / Charge / PayMo fee / Profit / Status / Actions), charges ledger (Date / Reference / Customer / Business / Amount / PayMo fee / Profit / Status), cost schedule (Service / PayMo rate / Cap), waivers table, compliance filings, recent activity (Type / Entity / Amount / Status / When).

---

## 6. MODAL

All modals use the shared primitives from `transaction-dashboard/shared/components/modals.tsx` — `ModalShell`, `SimpleModal`, `FlowModal`. Shared CSS (`.modalOverlay`, `.modalWrapper`, `.modalSm/Md/Lg`, `.modalContent`, `.modalHeader`, `.modalFooter`) comes from `shared/styles/appPage.module.css`:

```css
/* Shared (appPage.module.css) — do not redefine in page CSS */
.modalOverlay { background: rgba(11,19,34,0.55); backdrop-filter: blur(4px); }
.modalWrapper { display: flex; align-items: flex-end; justify-content: center; }
.modalContent { border-radius: 18px; box-shadow: var(--pm-shadow-lg); border: none; }
/* Mobile: bottom sheet, max 92dvh */
```

- Escape closes; focus returns to the trigger; body scroll locks while open; close button receives initial focus.
- Mobile (< 576px) dialogs become bottom sheets with `max-height: 92dvh`.

---

## 7. WIZARD / STEPPER (FlowModal)

Four flows use the shared `FlowModal` stepper:

| Flow | Steps | Confirm label | Success |
|------|-------|---------------|---------|
| New Fee Model (`addFeeRuleModal`) | Details → Pricing → Conditions → Done | Apply Model | shared success page |
| Advanced Fee Calculator (`feeCalculatorModal`) | Details → Breakdown → Done | Calculate Fee | shared success page |
| Create Fee Waiver (`waiverModal`) | Details → Eligibility → Done | Create Waiver | shared success page |
| Profit Pot Delivery (`settlementModal`) | Select → Review → Done | Deliver Profit | shared success page |

Stepper semantics (shared): semantic `<ol>` track, completed dots turn green with check, active dot gets the green focus halo, connectors fill green when done, `prefers-reduced-motion` respected.

---

## 8. SECTION HEADERS

```tsx
<SectionHeading
  id="fee-pulse"
  index="1.1"
  title="Fee pulse"
  description="What you collect, what PayMo keeps, and what lands in your pot."
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
| — | Hero | both | Executive navy/emerald banner, live state, profit snapshot (KES 1.34M), 3 metric rows, actions |
| — | Control strip | both | Direction segmented control (Customer Charges / My Costs & Profit) + business scope pills (All / Land Buyers LTD / Company 2) + scope note |
| 1.1 | Fee pulse | both | 6 KPI cards: Profit in pot, Your charges (MTD), PayMo fees (MTD), Net profit (MTD), Delivery rules, Avg fee rate |
| 1.2 | Needs your attention | both | Exceptions list + suggestions list + quick-action card (8 actions) |
| 1.3 | Fee models & business pricing | charges | Model tile grid (flat/percentage/tiered/discount/zero) + businesses table (model, charge, PayMo fee, profit, status) |
| 1.4 | Customer charges ledger | charges | Charge preview strip + charges table + scope-aware totals + charge actions (charge customer, bulk upload) |
| 1.3 | Profit pot & channeling | profit | Pot card (accumulated value, auto-deliver status) + channel rules list + delivery history |
| 1.4 | What PayMo charges you | profit | PayMo cost cards per service (transfer, wallet, instant, compliance, processing, API) + delivery summary |
| 1.5 | Fee analytics & reports | both | Analytics cards: monthly fee costs, profit share, delivery performance + ranked list + report shortcuts (Fee Revenue Report, Profit by Service, Model Performance, Market Comparison) |
| 1.6 | Waivers, discounts & promos | both | Waivers table + new waiver action + promos |
| 1.7 | Compliance, audit & profit access | both | Regulatory filings, fee-disclosure compliance checks, audit trail, profit permissions |
| 1.8 | Recent fee activity | both | Activity table with world tags (customer charge vs profit delivery) |

World-specific sections swap between 1.3/1.4 depending on the segmented control; numbering stays stable so the hierarchy reads consistently in both directions.

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
.kpiIconRed   { background: var(--pm-danger-soft); color: var(--pm-danger); }
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

Forms inside modals use the shared primitives (e.g. `SelectField` for fee types/waiver types/periods; `Toggle` for instant-delivery switch in Channel Rule; `ReviewRow` for settlement review).

---

## 12. TOASTS / DRAWERS / SCROLLBAR / ANIMATIONS

- Toasts: shell-owned `.toastContainer` / `.paymoToast` (from `shell.module.css`).
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
| `>= 1200px` | Full fixed 264px sidebar, hero + control strip on one line, 6-col KPI grid, 4-col model grid, analytics 2-col |
| `1100–1199px` | Off-canvas shell nav; hero metrics wrap; 3-col KPI grid |
| `768–1099px` | 3-col→2-col KPI, models 2-col, pot/cost grids stack |
| `< 768px` | Single-column hero and cards, control strip wraps, tables scroll inside cards, section actions wrap |
| `< 576px` | 1-col KPI, bottom-sheet modals, icon-first floating bar (labels hidden), floating bar buttons ≥ 40px targets |

---

## 14. STATUS-TO-TONE MAP (fees-specific)

| Status string | Badge class |
|---|---|
| Collected, Active, Applied, Delivered, Enabled, Approved, Live, Resolved, Delivered to wallet | `badgeS` |
| Pending, Review, Draft, Paused, Processing, Scheduled, Expiring | `badgeW` |
| Failed, Suspended, Overdue, Rejected, Disabled, Breached | `badgeD` |
| Sent, Requested, Submitted, In transit | `badgeI` |
| Tiered, Monitored, In review | `badgeP` |
| Inactive, Archived, Closed | muted (`badgeS`-style slate: `#f2f4f8`/`#475467`) |

World tags: `worldTagCust` (customer charge, emerald) vs `worldTagMy` (my costs/profit, ink) — used in the activity feed with an accompanying text label so color is never the only signal.

Permission dots: `permDot` + `permOk` (green) / `permPending` (amber) — always paired with `permTitle`/`permSub` text.

---

## 15. IMPLEMENTATION ARCHITECTURE

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Fees page | `fees/pages/Fees.tsx` | Hero, control strip (direction + scope), KPI pulse, attention/suggestions/quick actions, world-specific sections, analytics, waivers, compliance, activity, floating bar, footer |
| Fees modals | `fees/components/FeesModals.tsx` | 30 dialogs on shared `ModalShell`/`SimpleModal`/`FlowModal`, steppers, receipts, downloads, cross-modal navigation |
| Business theme contract | `shell.module.css`, `fees.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

Do not add a second local sidebar or page topbar to a transaction route. Routes below `/pm/app` inherit those surfaces from `AppShell`. Page-level CSS must remain scoped and must not redefine the shell position.

### Current reusable mapping

| Business pattern | Fees implementation |
|---|---|
| Fixed 264px navy rail | `.sidebar.expanded`; 76px compact state (shell) |
| Sticky/translucent topbar | `.topHeader` (shell) |
| `pm-banner-hero` | `.heroBanner`, `.heroContent`, `.heroSnapshot` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.8`) |
| `pm-card` | `.tableCard`, `.listCard`, `.modelTile`, `.costGrid > div`, `.complianceGrid > div` |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue`, `.kpiMeta` |
| Soft status badge | `.badgeS/W/D/I/P` (+ shared `badge*` in modals) |
| Primary / secondary button | `.btnPmP` / `.btnPm` (+ shared `btn`, `btnPrimary`, `btnSecondary`, `btnSm`) |
| Operational list card | `.listCard`, `.actionRow`, `.actionRowMain` |
| Business table and toolbar | `.tableCard`, `.tableWrap`, `.tbl`, `.filterPills`, `.tableTools` |
| Segmented direction control | `.controlStrip`, `.segmented`, `.segmentActive` |
| Quick-action grid | `.quickGrid`, `.quickActionCard` |
| Analytics card | `.analyticsGrid`, `.chartBars`, `.rankedList` |
| Floating quick-action bar | `.floatingBar` (New model · Calculator · Charge · Profit pot) |
| Modal / wizard | Shared `ModalShell`, `SimpleModal`, `FlowModal` from `shared/components/modals.tsx` |
| Shell toast | `.toastContainer`, `.paymoToast` (from `shell.module.css`) |

---

## 16. SHARED MODAL ARCHITECTURE (30 modals)

All 30 modals use the shared transaction modal primitives from `shared/components/modals.tsx`:

| Modal | Component | Notes |
|-------|-----------|-------|
| New Fee Model (`addFeeRuleModal`) | `FlowModal` | 4-step wizard Details → Pricing → Conditions → Done |
| Edit Fee Rule (`editFeeRuleModal`) | `SimpleModal` | Model select + pricing fields |
| Advanced Fee Calculator (`feeCalculatorModal`) | `FlowModal` | 3-step Details → Breakdown → Done; live preview via `advCalc` |
| Add Tier (`addCommissionTierModal`) | `SimpleModal` | Tiered model tier adder |
| Edit Commission Tier (`editCommissionModal`) | `SimpleModal` | Opened from Model Detail |
| Create Fee Waiver (`waiverModal`) | `FlowModal` | 3-step Details → Eligibility → Done |
| Edit Waiver (`editWaiverModal`) | `SimpleModal` | Waiver fields |
| Profit Pot Delivery (`settlementModal`) | `FlowModal` | 3-step Select → Review → Done |
| Compliance Health Check (`complianceCheckModal`) | `SimpleModal` | Soft score cards |
| Fee Revenue Report (`feeReportModal`) | `SimpleModal` | Period + format; `onSubmit` downloads `fee_revenue_report.txt` |
| Profit by Service (`agentLeaderboardModal`) | `ModalShell` | Ranked leaderboard (read-only) |
| Fee Exemptions (`exemptionModal`) | `SimpleModal` | Exemption policy form |
| All Items Requiring Attention (`attentionFullModal`) | `ModalShell` | Full queue; rows navigate to target modals via `onOpen` |
| Fee Notifications (`feeNotifModal`) | `ModalShell` | Notification list; opens Preferences |
| Notification Preferences (`notifSettingsModal`) | `SimpleModal` | Channel matrix table (Push/SMS/Email) |
| Fee Policy Configuration (`policyConfigModal`) | `SimpleModal` | Disclosure + rounding + retention settings |
| Audit Log Detail (`auditDetailModal`) | `ModalShell` | Single audit entry (read-only) |
| Bulk Fee Rule Upload (`bulkUploadModal`) | `SimpleModal` | CSV template download + file input |
| Channel Profits to Wallet (`partnerPayoutModal`) | `SimpleModal` | Wallet select + amount |
| Regulatory Fee Report (`regulatoryReportModal`) | `SimpleModal` | Filing period + regulator select |
| Tier Performance Analytics (`tierPerformanceModal`) | `ModalShell` | Chart rows per tier (read-only) |
| Hardship Waiver (`hardshipWaiverModal`) | `SimpleModal` | Reason select + evidence note |
| Market Fee Comparison (`feeCompareModal`) | `ModalShell` | Provider comparison table (read-only) |
| Confirm Action (`finalConfirmModal`) | `SimpleModal` | Destructive-adjacent confirm with reason |
| Charge a Customer (`chargeCustomerModal`) | `SimpleModal` | Customer + model + amount → receipt |
| Channel Rule (`channelRuleModal`) | `SimpleModal` | Rule fields + instant-delivery toggle |
| Profit Pot (`potDetailModal`) | `ModalShell` | Pot breakdown; opens Delivery via `onOpen` |
| Profit Permissions & Access (`profitAccessModal`) | `SimpleModal` | Permission rows with dots + toggles |
| Promo & Discount Campaign (`promoModal`) | `SimpleModal` | Campaign form |
| Fee Model Detail (`feeModelDetailModal`) | `ModalShell` | Model read-only; opens New Model / Edit Tier via `onOpen` |

Cross-modal navigation uses the `onOpen` callback passed from the page component: `feeModelDetailModal → addFeeRuleModal / editCommissionModal`, `potDetailModal → settlementModal`, `feeNotifModal → notifSettingsModal`, `attentionFullModal → per-row target modals`.

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
- [x] Page renders inside `AppShell`; no local sidebar/topbar/breadcrumb/profile chrome.
- [x] Content centred at max 1500px; page CSS never redefines shell position/surfaces.

### Fees page hierarchy
- [x] One full-width dark executive hero before the dashboard sections.
- [x] Direction segmented control (Customer Charges / My Costs & Profit) + business scope pills (All / Land Buyers LTD / Company 2).
- [x] Eight numbered sections (1.1–1.8); world-specific 1.3/1.4 swap by direction while numbering stays stable.
- [x] Six consistent KPI cards; semantic color reserved for icon/status emphasis.
- [x] Attention + suggestions lists with one primary row action each; 8 quick actions in a shortcut card.
- [x] Fee model tiles + businesses table, charges ledger with preview, profit pot + channeling, PayMo cost cards.
- [x] Analytics, waivers, compliance/audit/profit access, and recent activity all visible without opening a dialog.
- [x] Floating command bar (New model · Calculator · Charge · Profit pot) on desktop, icon-first on mobile.

### Cards, forms, tables and icons
- [x] Cards use 16px radius, subtle border and restrained business elevation.
- [x] Controls use 9–10px radius, green focus ring and clear disabled states.
- [x] Buttons include explicit `type="button"` where they do not submit a native form.
- [x] Form labels associated with controls; segmented control and pills use `<fieldset>` semantics.
- [x] Tables use uppercase compact headers, responsive horizontal overflow and non-colour status text (badges always carry text; world tags carry labels).
- [x] Icon-only controls include contextual accessible names.

### Modals and wizards
- [x] All 30 modals migrated from legacy `MBox`/`BusyOverlay` to shared `SimpleModal`/`FlowModal`/`ModalShell`.
- [x] Dialog semantics, Escape-to-close, focus return, scroll lock and bottom-sheet mobile behavior come from the shared primitives.
- [x] Wizard steps are semantic ordered lists with completed/current/upcoming states; connectors turn green when done.
- [x] Preserved: 1400ms processing receipts, reference numbers, downloadable receipts/templates/reports, cross-modal navigation, fee calculator live preview.
- [x] `prefers-reduced-motion` respected in the page layer.

### Responsive implementation
- [x] `>= 1200px`: full sidebar, 6-col KPI, 4-col model grid, hero snapshot on one line.
- [x] `1100–1199px`: off-canvas shell nav; 3-col KPI.
- [x] `768–1099px`: 2-col KPI where space permits; world sections stack.
- [x] `< 768px`: single-column hero and operational cards, wrapped tools, full-width actions.
- [x] `< 576px`: 1-col KPI, bottom-sheet dialogs, icon-first command bar with 40px targets.

---

## 18. MANUAL VISUAL-QA CHECKLIST

Run this list against `/pm/app/fees` before release. Deliberately left as review gates rather than implementation claims.

### Desktop — 1440 × 900
- [ ] Sidebar 264px; content has no horizontal jump or overlap.
- [ ] Hero aligns with business Dashboard hero in radius, navy/emerald gradient, type scale and spacing.
- [ ] Six KPI cards equal height; long copy truncates rather than moving the grid.
- [ ] Segmented control and scope pills align on the control strip; active states clearly visible.
- [ ] Model tiles, ledger, pot/cost grids and analytics cards align on the 16px card system.
- [ ] Floating command bar does not cover the footer or table controls at the bottom of the page.

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Sidebar starts closed and opens above the page with one backdrop.
- [ ] KPI grid becomes 3/2 columns; model and cost grids collapse to 2 columns.
- [ ] Tables scroll inside their card; the full document does not scroll horizontally.
- [ ] Modal layering remains correct above the shell.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy has no clipping; action buttons meet 40px minimum targets.
- [ ] Control strip wraps cleanly; pills remain tappable.
- [ ] Fixed command bar leaves content reachable and uses a readable labelled primary action.
- [ ] Modals open as bottom sheets, remain scrollable and keep footer actions visible.
- [ ] Stepper labels remain legible without shrinking.

### Interaction and accessibility
- [ ] Keyboard can reach control strip, filters, table actions, floating actions and footer in visual order.
- [ ] Switch direction (Customer Charges ↔ My Costs & Profit) and scope; verify tables, cards and totals refilter with the scope note updating.
- [ ] Open each of the 30 modals; verify close, processing, receipt and nested-dialog paths.
- [ ] Run the four steppers through completion and verify completed connectors.
- [ ] Download the CSV template and fee revenue report; verify filenames and content.
- [ ] At 200% browser zoom, content remains usable with no two-dimensional page scrolling.
- [ ] With reduced motion enabled, pulse/pop transitions are effectively disabled.
- [ ] Run automated contrast/accessibility tooling; manually verify muted text and focus contrast.

---

## 19. RELEASE GATES

- [x] Targeted Biome lint passes for all edited fees files (August 30, 2026) — no errors; only the same warning classes as the accepted transfer-overview baseline.
- [x] Vitest suite passes: 1 file, 9 tests (August 30, 2026).
- [x] Production client/server build passes with Vite 8.2.1 (August 30, 2026).
- [x] Route responds 200 at `/pm/app/fees` in the local preview with SSR markers (hero copy, KES 1.34M, section indices).
- [x] Refinement: removed local sidebar/header chrome — the shared AppShell provides those.
- [x] Refinement: 30 modals migrated from legacy `MBox`/`BusyOverlay` to shared `ModalShell`/`SimpleModal`/`FlowModal`; all 30 reachable (27 page-open + 3 via in-modal `onOpen` navigation).
- [x] Refinement: CSS module rewritten on the transfer-overview token set and composition classes; every `styles.*` token referenced by page and modals resolves in `fees.module.css` or `appPage.module.css` (CSS-reference audit clean).
- [x] Refinement: TypeScript typecheck — zero new diagnostics in fees files (only the pre-existing repo-wide `/pm/app/support` route-literal error shared with transfer-overview and shell TopNav).
- [x] Refinement: sidebar label updated from "Fees & Commissions" to "Fees & Profit" to match the page title.
- [ ] Manual visual-QA checklist above signed off by a reviewer.
- [ ] Real API payload checked against long names, empty arrays, large amounts and non-KES currencies.
