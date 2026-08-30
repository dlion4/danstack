# PayMo Business → Disputes Page Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Implementation target: `transaction-dashboard/disputes/`
> Last reconciled: August 30, 2026
> Refined: August 30, 2026 — removed local chrome, migrated to shared modal primitives, matched the transfer-overview / fees / settlement hierarchy

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.disputesPage {
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
  --pm-info: #2e90fa;
  --pm-info-soft: #e8f1fe;
  --pm-accent: #12b76a;
  --pm-accent-soft: #e7f8ef;
  --pm-purple: #7a5af8;
  --pm-purple-soft: #f0ebfe;

  /* ── Dimensions ── */
  --pm-radius: 16px;
  --pm-shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px -12px rgba(16, 24, 40, 0.12);
  --pm-shadow-lg: 0 24px 60px -16px rgba(16, 24, 40, 0.28);
}
```

The disputes page redeclares the same tokens as `transfer-overview.module.css`, `fees.module.css`, `settlement.module.css` and `shell.module.css` so the page module is self-contained while every value is identical to the business language. Disputes uses the same aliases (`--pm-info*`, `--pm-accent*`, `--pm-purple*`, `--pm-primary-light`, `--pm-surface-2`) as the other transaction pages.

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
| Filter pill | Inter | `0.76rem` | 600 | 99px radius, ink-on for active, count chip |
| Mini-stat label | Inter | `0.64rem` | 700 | `text-transform: uppercase; letter-spacing: 0.08em` |
| Funnel legend | Inter | `0.7rem` | 400 | hero snapshot |
| Wizard dot | Inter | `0.82rem` | 700 | 34×34px circle |
| Wizard label | Inter | `0.68rem` | 600 | |

---

## 3. LAYOUT SHELL

The disputes page renders inside the shared authenticated shell (`Layouts/shell/`). It does **not** define its own sidebar or page topbar.

```css
/* Owned by the shell — never redefined by page CSS */
.sidebar { width: 264px; background: var(--pm-sidebar); }   /* 76px compact state */
.topHeader { height: 62px; background: rgba(255,255,255,0.88); backdrop-filter: blur(10px); }
.mainContent { margin-left: 264px; padding: 1.5rem 1.5rem 7rem; max-width: 1500px; }
```

- Page root: `div.disputesPage > .main` — `max-width: 1500px; margin: 0 auto; padding: 1.5rem 1.5rem 7rem`.
- Sidebar collapses to off-canvas below 1200px (shell-owned behavior).
- Local chrome removed: the old page's own pageBar/breadcrumb/search/user/profile/nav block are gone; the shell topbar breadcrumb, user menu and notification dropdown cover them. The page keeps a bell action inside the "Attention Required" card header that opens the page-level `caseNotifModal` (same pattern as fees' `feeNotifModal` and settlement's notifications modal).

---

## 4. COMPONENT PATTERNS

### Card
```css
.card, .tableCard, .listCard, .panel {
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
- Eyebrow chip (page code "Dispute & Chargeback" + live pill "Dispute command center live"), headline ("Every dispute filed, every chargeback answered, every case tracked to resolution."), sub-copy, primary action (File Dispute) + secondary actions (Upload Evidence, Bulk Action).
- Hero snapshot: "142 open cases" value, detail copy, **case lifecycle funnel** (Filed 38 · In progress 67 · Won 37) with legend, and a 3-row metric breakdown.
- Hero orbs (`heroOrbOne`, `heroOrbTwo`) — translucent green/blue radial decorations, `pointer-events: none`.

### Funnel (case lifecycle)
```css
.funnel { display: flex; gap: 3px; height: 8px; border-radius: 99px; overflow: hidden; }
.funnelSeg { height: 100%; border-radius: 99px; }
.funnelLegend { display: flex; flex-wrap: wrap; gap: 0.7rem; font-size: 0.7rem; color: rgba(255,255,255,0.75); }
.funnelLegend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 0.3rem; }
```
Funnel segments use semantic colors (info filed / warning in-progress / emerald won) and always carry a text legend — color is never the only signal.

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
`btnPmD` is reserved for destructive-adjacent actions ("Upload" on an expiring high-value case, "Blacklist" in merchant risk).

### Badges (soft)
```css
.badgeS { background: var(--pm-green-soft); color: #067647; }
.badgeW { background: #fef0c7; color: #93370d; }
.badgeD { background: #fee4e2; color: #b42318; }
.badgeI { background: #e8f1fe; color: #175cd3; }
.badgeP { background: #f0ebfe; color: #5925dc; }
```
All `border-radius: 99px; font-size: 0.7rem; font-weight: 600; padding: 0.32em 0.7em;` — same mapping as the shared `badge*` classes in `appPage.module.css`. Badges always carry text.

### Filter pills (network scope)
```css
.filterPills { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
.filterPills button { border: 1px solid var(--pm-border); background: #fff; border-radius: 99px; padding: 0.35rem 0.85rem; font-weight: 600; font-size: 0.76rem; color: #475467; }
.filterPills button.filterActive { background: var(--pm-ink); color: #fff; border-color: var(--pm-ink); }
.countChip { min-width: 1.25rem; height: 1.25rem; border-radius: 99px; background: #eef0f4; color: #475467; font-size: 0.68rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; padding: 0 0.35rem; }
```
Pills: All Networks (142) / Visa (61) / Mastercard (38) / PesaLink (24). The filter drives the evidence-requirements and chargeback tables and the scope note ("Visa in view").

### Live dot
```css
.liveDot { width: 8px; height: 8px; border-radius: 50%; background: var(--pm-green);
  box-shadow: 0 0 0 0 rgba(18,183,106,.5); animation: pmPulse 2s infinite; display: inline-block; }
```

### Panel (inner unit box inside table cards)
```css
.panel { background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: 14px; padding: 1rem 1.1rem; }
.panelTitle { font-family: "Sora", "Inter", sans-serif; font-size: 0.9rem; font-weight: 700; margin: 0 0 0.35rem; }
```
Panels split wide cards into distinct columns (eligible transactions / reason quick select / filing stats; requirements / library; chargebacks / stage summary; analytics columns; recovery).

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

Disputes tables:
- Evidence requirements: Case / Network / Deadline / Evidence Needed / Status / Action (deadline turns `textDanger` when `dangerDeadline`).
- Active chargebacks: CB ID / Case / Network / Stage / Amount / Due / Action.
- Recent activity: Date / Case / Type / Merchant / Amount / Status / Action.
- Modal tables (package manager, merchant risk, analytics, health, activity log) use the shared `tableWrap`/`table` classes from `appPage.module.css`.

---

## 6. MODAL

All modals use the shared primitives from `transaction-dashboard/shared/components/modals.tsx` — `ModalShell`, `SimpleModal`, `FlowModal`, `TabbedModal`. Shared CSS (`.modalOverlay`, `.modalWrapper`, `.modalSm/Md/Lg/Xl`, `.modalContent`, `.modalHeader`, `.modalFooter`) comes from `shared/styles/appPage.module.css`:

```css
/* Shared (appPage.module.css) — do not redefine in page CSS */
.modalOverlay { background: rgba(11,19,34,0.55); backdrop-filter: blur(4px); }
.modalWrapper { display: flex; align-items: flex-end; justify-content: center; }
.modalContent { border-radius: 18px; box-shadow: var(--pm-shadow-lg); border: none; }
/* Mobile: bottom sheet, max 92dvh */
```

- Escape closes; focus returns to the trigger; body scroll locks while open; close button receives initial focus.
- Mobile (< 576px) dialogs become bottom sheets with `max-height: 92dvh`.
- In-modal content styling (`summaryBox*`, `miniStat*`, `sr`, `mutedSmall`, `fwBold13`) lives in `disputes.module.css` and pairs with the shared field/pill/table classes.

---

## 7. WIZARD / STEPPER (FlowModal)

Three flows use the shared `FlowModal` stepper:

| Flow | Steps | Confirm label | Success |
|------|-------|---------------|---------|
| File New Dispute (`disputeModal`) | Select → Reason → Evidence → Done | File Dispute | shared success page (case summary box on the last form step: CDP-44923 · KES 87,400 · deadline 11 Jul 2025) |
| Upload Evidence Package (`evidenceUploadModal`) | Select → Files → Done | Upload | shared success page (deadline + package completeness on last form step) |
| Bulk Dispute Actions (`bulkDisputeModal`) | Select → Action → Done | Run Bulk Action | shared success page (2 cases, evidence uploaded) |

Stepper semantics (shared): semantic `<ol>` track, completed dots turn green with check, active dot gets the green focus halo, connectors fill green when done, `prefers-reduced-motion` respected.

---

## 8. SECTION HEADERS

```tsx
<SectionHeading
  id="dis-sec-pulse"
  index="1.1"
  title="Dispute pulse"
  description="All networks — headline figures for the current dispute cycle."
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

| # | Section | Content |
|---|---------|---------|
| — | Hero | Executive navy/emerald banner, live state, "142 open cases" snapshot, case lifecycle funnel + legend, 3 metric rows, actions (File Dispute / Upload Evidence / Bulk Action) |
| — | Control strip | Network scope pills (All Networks / Visa / Mastercard / PesaLink with case counts) + Health Check + New Dispute actions + scope note |
| 1.1 | Dispute pulse | 6 KPI cards: Win rate (90d), Open cases, At risk / pending, Monthly savings, Recovered (30d), Avg resolution |
| 1.2 | Needs your attention | Attention list + smart suggestions list + quick-action card (8 actions) |
| 1.3 | Dispute initiation & filing | Eligible transactions + reason quick select + filing stats (30d) |
| 1.4 | Evidence management & submission | Active evidence requirements table + evidence library |
| 1.5 | Chargeback workflow & tracking | Active chargebacks table + stage summary |
| 1.6 | Resolution analytics & insights | Win rate by reason code + top 5 merchants + recovery summary |
| 1.7 | Recent dispute activity | Activity table (Date / Case / Type / Merchant / Amount / Status / Action) + full log |

Section numbering follows the same `1.1`–`1.7` convention as fees (1.1–1.8) and settlement (1.1–1.10); network filtering refilters tables and the scope note while numbering stays stable.

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

Forms inside modals use the shared primitives (`SelectField` for cards/transactions/reason codes/cases/evidence types/response types; `Field` for amounts; textareas for descriptions/notes). Rule toggles use labelled `form-switch` inputs with `aria-label`s inside `sr` rows.

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
| `>= 1200px` | Full fixed 264px sidebar, hero + control strip on one line, 6-col KPI grid, 3-col attention grid, panels side-by-side |
| `1100–1199px` | Off-canvas shell nav; hero metrics wrap; 3-col KPI grid; attention 2-col with quick actions spanning |
| `768–1099px` | 3-col→2-col KPI, panels stack, attention 1-col |
| `< 768px` | Single-column hero and cards, control strip wraps, tables scroll inside cards, section actions wrap |
| `< 576px` | 1-col KPI, bottom-sheet modals, icon-first floating bar (labels hidden), floating bar buttons ≥ 40px targets |

---

## 14. STATUS-TO-TONE MAP (disputes-specific)

| Status string | Badge class |
|---|---|
| Won, Resolved, Complete, Paid, Recovered, Enabled, Applied, Passing, Good | `badgeS` |
| Pending, Under Review, Representment, Evidence Pending, Expiring, Below, Review, High Risk, Blacklist | `badgeW` / `badgeD` (severity) |
| Failed, Rejected, Lost, Blocked, Overdue | `badgeD` |
| Pre-Arbitration, Filed, In Progress, Requested, Submitted | `badgeI` |
| Arbitration, In Review, Monitored | `badgeP` |
| Inactive, Archived, Closed | muted slate (`#f2f4f8`/`#475467`) |

Severity guidance: "Expiring", "High Risk" and "Blacklist" use danger or warning tones and always pair with an action button; the deadline cell flips `textDanger` when a case is expiring. Funnel segments use the same semantic palette with a text legend.

---

## 15. IMPLEMENTATION ARCHITECTURE

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Disputes page | `disputes/pages/Disputes.tsx` | Hero + funnel, control strip (network scope), KPI pulse, attention/suggestions/quick actions, filing, evidence, chargebacks, analytics, activity, floating bar, footer |
| Disputes modals | `disputes/components/DisputesModals.tsx` | 19 dialogs on shared `ModalShell`/`SimpleModal`/`FlowModal`/`TabbedModal`, steppers, receipts, downloads, cross-modal navigation |
| Business theme contract | `shell.module.css`, `disputes.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

Do not add a second local sidebar or page topbar to a transaction route. Routes below `/pm/app` inherit those surfaces from `AppShell`. Page-level CSS must remain scoped and must not redefine the shell position.

### Current reusable mapping

| Business pattern | Disputes implementation |
|---|---|
| Fixed 264px navy rail | `.sidebar.expanded`; 76px compact state (shell) |
| Sticky/translucent topbar | `.topHeader` (shell) |
| `pm-banner-hero` | `.heroBanner`, `.heroContent`, `.heroSnapshot`, `.heroMetricRow` + `.funnel` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.7`) |
| `pm-card` | `.tableCard`, `.listCard`, `.panel` |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue`, `.kpiMeta` |
| Soft status badge | `.badgeS/W/D/I/P` (+ shared `badge*` in modals) |
| Primary / secondary button | `.btnPmP` / `.btnPm`, `.btnPmD` (+ shared `btn`, `btnPrimary`, `btnSecondary`, `btnSm`) |
| Operational list card | `.listCard`, `.actionRow`, `.actionRowMain`, `.actionRowActions` |
| Business table and toolbar | `.tableCard`, `.tableWrap`, `.tbl`, `.filterPills`, `.panel` |
| Scope filter | `.controlStrip`, `.filterPills`, `.filterActive`, `.countChip` |
| Quick-action grid | `.quickGrid`, `.quickActionCard` |
| Analytics panel | `.panel`, `.miniStat*`, `.summaryBox*` |
| Floating quick-action bar | `.floatingBar`, `.floatingPrimary` (Attention · Activity · Health · New Dispute) |
| Modal / wizard | Shared `ModalShell`, `SimpleModal`, `FlowModal`, `TabbedModal` from `shared/components/modals.tsx` |
| Shell toast | `.toastContainer`, `.paymoToast` (from `shell.module.css`) |

---

## 16. SHARED MODAL ARCHITECTURE (19 modals)

All 19 modals use the shared transaction modal primitives from `shared/components/modals.tsx`:

| Modal | Component | Notes |
|-------|-----------|-------|
| File New Dispute (`disputeModal`) | `FlowModal` | 4-step Select → Reason → Evidence → Done; case summary on last step (CDP-44923 · KES 87,400 · deadline 11 Jul 2025) |
| Upload Evidence Package (`evidenceUploadModal`) | `FlowModal` | 3-step Select → Files → Done; format/size hint box |
| Respond to Chargeback (`chargebackResponseModal`) | `SimpleModal` | CB select + response type + evidence notes/files → CB-99102-R1 |
| Bulk Dispute Actions (`bulkDisputeModal`) | `FlowModal` | 3-step Select → Action → Done; case checkboxes with status badges |
| Evidence Package Manager (`evidencePackageModal`) | `TabbedModal` | All Files / Receipts / Police / Delivery; downloads; footer Upload More → `evidenceUploadModal` |
| Merchant Risk Management (`merchantRiskModal`) | `TabbedModal` | High Risk table (Blacklist/Monitor) / Repeat Offenders / Blacklist (Remove); action confirmation badge |
| Resolution Analytics (`resolutionAnalyticsModal`) | `TabbedModal` | xl; Win Rate tiles / Merchant table / Reason Code table / Time to Resolve; footer Export → `exportReportModal` |
| Dispute Automation Rules (`disputeRulesModal`) | `ModalShell` | Auto-Escalation / Evidence Rules / Merchant Rules tabs with switches; Save Rules → receipt |
| Arbitration Management (`arbitrationModal`) | `SimpleModal` | Case + status summary + notes; inline "Calculate Fee" → `feeCalcModal` |
| Dispute Fee Calculator (`feeCalcModal`) | `SimpleModal` | Action select + fee estimate (KES 1,500) |
| Export Dispute Report (`exportReportModal`) | `SimpleModal` | Report type + date range + format; `onSubmit` downloads CSV |
| Dispute Health Check (`healthCheckModal`) | `ModalShell` | Health tiles + metrics table; footer Security Check → `securityCheckModal` + Improve Score → `disputeRulesModal` |
| Dispute Security Check (`securityCheckModal`) | `ModalShell` | Encryption/approvals/webhook validation rows |
| Case Notifications (`caseNotifModal`) | `ModalShell` | 5 notice cards; footer Automation → `disputeRulesModal`; opened from attention-card bell |
| Full Activity Log (`activityLogModal`) | `ModalShell` | xl; case filter + search + activity table |
| All Items Requiring Attention (`attentionModal`) | `ModalShell` | 4 rows navigate via `onOpen` → evidence/response/risk/detail modals |
| Quick Dispute (`quickDisputeModal`) | `SimpleModal` | Txn + reason + amount → CDP-44924 |
| Dispute Details (`disputeDetailModal`) | `ModalShell` | Summary + timeline; footer Upload Evidence → `evidenceUploadModal` |
| Chargeback Tracker (`chargebackTrackerModal`) | `ModalShell` | CB summary + stage timeline |

Cross-modal navigation uses the `onOpen` callback passed from the page component: `arbitrationModal → feeCalcModal`, `healthCheckModal → securityCheckModal / disputeRulesModal`, `resolutionAnalyticsModal → exportReportModal`, `evidencePackageModal → evidenceUploadModal`, `disputeDetailModal → evidenceUploadModal`, `caseNotifModal → disputeRulesModal`, `attentionModal → per-row target modals`.

Legacy ids removed with the refinement: `profileModal` (shell chrome), `disputeRulesModal2` (dead duplicate stub of disputeRulesModal), `branchSupportModal` (no consumer navigation home); `feeCalcModal` and `securityCheckModal` were orphaned in the legacy file and are now wired into arbitration/health workflows.

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
- [x] Page renders inside `AppShell`; no local sidebar/topbar/breadcrumb/profile chrome (pageBar, breadcrumb, search, user, nav block removed).
- [x] Content centred at max 1500px; page CSS never redefines shell position/surfaces.

### Disputes page hierarchy
- [x] One full-width dark executive hero before the dashboard sections, with case lifecycle funnel + legend.
- [x] Network scope pills (All / Visa / Mastercard / PesaLink) + scope note; filtering refilters requirements + chargeback tables.
- [x] Seven numbered sections (1.1–1.7) with stable numbering.
- [x] Six consistent KPI cards; semantic color reserved for icon/status emphasis.
- [x] Attention + suggestions lists with one primary row action each; 8 quick actions in a shortcut card.
- [x] Filing/evidence/chargeback/analytics content all visible without opening a dialog.
- [x] Floating command bar (Attention · Activity · Health · New Dispute) on desktop, icon-first on mobile.

### Cards, forms, tables and icons
- [x] Cards use 16px radius, subtle border and restrained business elevation.
- [x] Controls use 9–10px radius, green focus ring and clear disabled states.
- [x] Buttons include explicit `type="button"` where they do not submit a native form.
- [x] Form labels associated with controls; filter pills expose active state via class + count chip.
- [x] Tables use uppercase compact headers, responsive horizontal overflow and non-colour status text (badges always carry text).
- [x] Icon-only controls include contextual accessible names (bell button labelled "Dispute notifications").

### Modals and wizards
- [x] All 19 modals migrated from legacy `MBox`/`BusyOverlay` to shared `SimpleModal`/`FlowModal`/`ModalShell`/`TabbedModal`.
- [x] Dialog semantics, Escape-to-close, focus return, scroll lock and bottom-sheet mobile behavior come from the shared primitives.
- [x] Wizard steps are semantic ordered lists with completed/current/upcoming states; connectors turn green when done.
- [x] Preserved: processing receipts, reference numbers (CDP-/CB-), downloadable reports, cross-modal navigation (arbitration → fee calc, health → security/rules, analytics → export, details → evidence upload).
- [x] Orphaned/duplicate legacy dialogs removed (profile, disputeRulesModal2, branchSupport); fee calc + security check re-homed.
- [x] `prefers-reduced-motion` respected in the page layer.

### Responsive implementation
- [x] `>= 1200px`: full sidebar, 6-col KPI, 3-col attention, panels side-by-side.
- [x] `1100–1199px`: off-canvas shell nav; 3-col KPI; 2-col attention.
- [x] `768–1099px`: 2-col KPI where space permits; sections stack.
- [x] `< 768px`: single-column hero and operational cards, wrapped tools, full-width actions.
- [x] `< 576px`: 1-col KPI, bottom-sheet dialogs, icon-first command bar with 40px targets.

---

## 18. MANUAL VISUAL-QA CHECKLIST

Run this list against `/pm/app/disputes` before release. Deliberately left as review gates rather than implementation claims.

### Desktop — 1440 × 900
- [ ] Sidebar 264px; content has no horizontal jump or overlap.
- [ ] Hero aligns with business Dashboard hero in radius, navy/emerald gradient, type scale and spacing; funnel legend legible on the snapshot.
- [ ] Six KPI cards equal height; long copy truncates rather than moving the grid.
- [ ] Network pills and scope note align on the control strip; active states clearly visible.
- [ ] Filing/evidence/chargeback/analytics panels align on the 16px card system.
- [ ] Floating command bar does not cover the footer or table controls at the bottom of the page.

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Sidebar starts closed and opens above the page with one backdrop.
- [ ] KPI grid becomes 3/2 columns; panels stack in a single column.
- [ ] Tables scroll inside their card; the full document does not scroll horizontally.
- [ ] Modal layering remains correct above the shell.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy has no clipping; action buttons meet 40px minimum targets.
- [ ] Control strip wraps cleanly; network pills remain tappable.
- [ ] Fixed command bar leaves content reachable and uses a readable labelled primary action.
- [ ] Modals open as bottom sheets, remain scrollable and keep footer actions visible.
- [ ] Stepper labels remain legible without shrinking.

### Interaction and accessibility
- [ ] Keyboard can reach control strip, filters, table actions, floating actions and footer in visual order.
- [ ] Switch network filter; verify requirements + chargeback tables refilter and the scope note updates.
- [ ] Open each of the 19 modals; verify close, processing, receipt and nested-dialog paths.
- [ ] Run the three steppers (dispute, evidence, bulk) through completion and verify completed connectors.
- [ ] Download the exported dispute report; verify filename and content.
- [ ] At 200% browser zoom, content remains usable with no two-dimensional page scrolling.
- [ ] With reduced motion enabled, pulse/pop transitions are effectively disabled.
- [ ] Run automated contrast/accessibility tooling; manually verify muted text and focus contrast.

---

## 19. RELEASE GATES

- [x] Targeted Biome lint passes for all edited disputes files (August 30, 2026) — no errors.
- [x] Vitest suite passes: 1 file, 9 tests (August 30, 2026).
- [x] Production client/server build passes with Vite (August 30, 2026).
- [x] Route responds 200 at `/pm/app/disputes` in the local preview with SSR markers (hero copy, "Dispute pulse", "Needs your attention", section headings); `?modal=` deep-link returns 200.
- [x] Refinement: removed local sidebar/header chrome — the shared AppShell provides those.
- [x] Refinement: 19 modals migrated from legacy `MBox`/`BusyOverlay` to shared `ModalShell`/`SimpleModal`/`FlowModal`/`TabbedModal`; all 19 reachable (17 page-open + 2 via in-modal `onOpen` navigation).
- [x] Refinement: CSS module rewritten on the transfer-overview token set and composition classes; every `styles.*` token referenced by page and modals resolves in `disputes.module.css` or `appPage.module.css` (CSS-reference audit clean).
- [x] Refinement: TypeScript typecheck — zero new diagnostics in disputes files (identical error-key set to the accepted fees/settlement baseline).
- [ ] Manual visual-QA checklist above signed off by a reviewer.
- [ ] Real API payload checked against long names, empty arrays, large amounts and non-KES currencies.
