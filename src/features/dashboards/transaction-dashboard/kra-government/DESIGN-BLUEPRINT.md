# PayMo Business → KRA & Government Page Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Implementation target: `transaction-dashboard/kra-government/`
> Last reconciled: August 30, 2026
> Refined: August 30, 2026 — removed local chrome, migrated to shared modal primitives, matched the transfer-overview / fees / settlement / disputes hierarchy

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.kraGovernmentPage {
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

The kra-government page redeclares the same tokens as `transfer-overview.module.css`, `fees.module.css`, `settlement.module.css`, `disputes.module.css` and `shell.module.css` so the page module is self-contained while every value is identical to the business language. KRA uses the same aliases (`--pm-info*`, `--pm-accent*`, `--pm-purple*`, `--pm-primary-light`, `--pm-surface-2`) as the other transaction pages.

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
| Filter pill | Inter | `0.76rem` | 600 | 99px radius, ink-on for active |
| PIN chip (hero) | Inter | `0.72rem` | 600 | 99px radius, translucent white on navy |
| Mini-stat label | Inter | `0.64rem` | 700 | `text-transform: uppercase; letter-spacing: 0.08em` |
| Government card price | Sora | `1.1rem` | 800 | `letter-spacing: -0.02em` |
| Wizard dot | Inter | `0.82rem` | 700 | 34×34px circle |
| Wizard label | Inter | `0.68rem` | 600 | |

---

## 3. LAYOUT SHELL

The kra-government page renders inside the shared authenticated shell (`Layouts/shell/`). It does **not** define its own sidebar or page topbar.

```css
/* Owned by the shell — never redefined by page CSS */
.sidebar { width: 264px; background: var(--pm-sidebar); }   /* 76px compact state */
.topHeader { height: 62px; background: rgba(255,255,255,0.88); backdrop-filter: blur(10px); }
.mainContent { margin-left: 264px; padding: 1.5rem 1.5rem 7rem; max-width: 1500px; }
```

- Page root: `div.kraGovernmentPage > .main` — `max-width: 1500px; margin: 0 auto; padding: 1.5rem 1.5rem 7rem`.
- Sidebar collapses to off-canvas below 1200px (shell-owned behavior).
- Local chrome removed: the old page's own sidebar/nav/header/pageBar/breadcrumb/search/user/profile block are gone; the shell topbar breadcrumb, user menu and notification dropdown cover them. The page keeps a bell action inside the "Attention Required" card header that opens the page-level `govNotifModal` (same pattern as disputes' `caseNotifModal` and settlement's notifications modal).

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
- Eyebrow chip (page code "KRA & Government" + live pill "KRA integration live"), headline ("Every obligation filed, every tax paid, every PIN synced."), sub-copy, primary action (Pay Tax) + secondary actions (File Return, Health Check).
- Hero snapshot: "4 KRA PINs linked" value, detail copy, **linked-PIN chips** (A012345678Y · P987654321Z · R445566778X · C112233445W with green check dots), an **obligations meter** (5 · 65% met, five segmented bars), and a 3-row metric breakdown (KES 184.2k due / 94-100 compliance / KES 47.8k savings).
- Hero orbs (`heroOrbOne`, `heroOrbTwo`) — translucent green/blue radial decorations, `pointer-events: none`.

### PIN chips + obligations meter (hero)
```css
.pinChip { border: 1px solid rgba(255,255,255,0.22); background: rgba(255,255,255,0.09);
  border-radius: 99px; padding: 0.28rem 0.7rem; font-size: 0.72rem; font-weight: 600; color: #fff; }
.pinChip i { color: var(--pm-green); }
.heroMeterSeg { height: 6px; flex: 1; border-radius: 99px; background: rgba(255,255,255,0.18); }
.heroMeterSeg.heroMeterOn { background: var(--pm-green); }
```
Color is never the only signal: chips carry the PIN text, the meter carries a text header ("Obligations this month — 5 · 65% met").

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
`btnPmD` is reserved for destructive-adjacent actions ("File" on a due-soon return, "Pay" on an overdue assessment, "Dispute").

### Badges (soft)
```css
.badgeS { background: var(--pm-green-soft); color: #067647; }
.badgeW { background: #fef0c7; color: #93370d; }
.badgeD { background: #fee4e2; color: #b42318; }
.badgeI { background: #e8f1fe; color: #175cd3; }
.badgeP { background: #f0ebfe; color: #5925dc; }
```
All `border-radius: 99px; font-size: 0.7rem; font-weight: 600; padding: 0.32em 0.7em;` — same mapping as the shared `badge*` classes in `appPage.module.css`. Badges always carry text.

### Filter pills (entity scope)
```css
.filterPills { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
.filterPills button { border: 1px solid var(--pm-border); background: #fff; border-radius: 99px; padding: 0.35rem 0.85rem; font-weight: 600; font-size: 0.76rem; color: #475467; }
.filterPills button.filterActive { background: var(--pm-ink); color: #fff; border-color: var(--pm-ink); }
```
Pills: All PINs / Personal / JK Holdings / Rental Portfolio / JK Investments. The filter drives the linked-PINs table, the iTax activity table and the scheduled payments list, plus the scope note ("A012345678Y · Personal in view").

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
Panels split wide cards into distinct columns (linked PINs / tax position; payment methods / scheduled; government activity).

### Government service card
```css
.govCard { background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: 14px;
  padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.govCard:hover { border-color: var(--pm-accent); box-shadow: var(--pm-shadow); }
.govCardIcon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; }
.govCardPrice { font-family: "Sora", sans-serif; font-size: 1.1rem; font-weight: 800; }
```
One card per provider — eCitizen (info blue), County (warning amber), Ardhisasa (accent green) — each with provider badge, title, description, price and a primary Pay action. Grid: 3-col desktop → 2-col tablet → 1-col mobile.

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

KRA tables:
- Linked KRA PINs & obligations: PIN (code-styled, `C:` prefix stripped) / Entity / Status / Next Due / Amount / Actions (Pay · File / Dispute).
- Recent iTax activity: Date / PIN / Type / Amount / Status / Ref / Action (Receipt · View · Pay).
- Client tax PINs & formats: Client / Country / Authority / PIN / Format / **Validation** (live `validatePin` check per country — Kenya `A\d{9}A`, Uganda 10 digits, Tanzania 3-3-3, Ghana `A\d{12}`, Nigeria 8-4; green "Valid" / red "Invalid" with expected-format tooltip) / Status / Action.
- Government service payments: Date / Service / Provider / Amount / Status / Ref / Action (Track · Receipt).
- Recent tax & filing activity: Date / Service / Provider / Amount / Method / Status / Ref / Action.
- Modal tables (optimizer, health check, bulk validate, histories) use the shared `tableWrap`/`table` classes from `appPage.module.css`.

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
- In-modal content styling (`summaryBox*`, `miniStat*`, `sr`, `mutedSmall`, `fwBold13`) lives in `kraGovernment.module.css` and pairs with the shared field/pill/table classes.

---

## 7. WIZARD / STEPPER (FlowModal)

Three flows use the shared `FlowModal` stepper:

| Flow | Steps | Confirm label | Success |
|------|-------|---------------|---------|
| Pay KRA Tax (`payKRAModal`) | Obligation → Details → Confirm → Done | Pay Now | shared success page + summary (KRA PIN, KES 42,800, iTax Ref ITX-883421, date) |
| File Tax Return (`fileReturnModal`) | Select → Upload → Submit → Done | Submit & Pay | shared success page + summary (VAT-202506-99182, filed by, date) |
| Bulk Tax Filing (`bulkTaxModal`) | Upload → Validate → Done | Execute | shared success page (3 returns filed, 2 payments processed) |

Stepper semantics (shared): semantic `<ol>` track, completed dots turn green with check, active dot gets the green focus halo, connectors fill green when done, `prefers-reduced-motion` respected. Pay KRA Tax's confirm step includes the shared `PinRow` (4-digit wallet PIN with auto-advance and per-digit aria-labels).

---

## 8. SECTION HEADERS

```tsx
<SectionHeading
  id="kra-sec-pulse"
  index="1.1"
  title="Compliance pulse"
  description="All KRA PINs in view — headline figures across linked tax identities."
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
| — | Hero | Executive navy/emerald banner, live state, "4 KRA PINs linked" snapshot, linked-PIN chips, obligations meter, 3 metric rows, actions (Pay Tax / File Return / Health Check) |
| — | Control strip | Entity scope pills (All PINs / Personal / JK Holdings / Rental Portfolio / JK Investments) + Bulk File + Link KRA PIN actions + scope note |
| 1.1 | Compliance pulse | 6 KPI cards: Due in 7 days, Compliance score, Savings this year, Open obligations, Penalties (18m), Avg filing lead |
| 1.2 | Needs your attention | Attention list + smart suggestions list + quick-action card (8 actions) |
| 1.3 | KRA iTax integration hub | Linked KRA PINs & obligations table + tax position snapshot + recent iTax activity |
| 1.4 | Client tax PINs & formats | Multi-country PIN table with live format validation column |
| 1.5 | Tax payment execution & scheduling | Payment methods & sources + scheduled & recurring payments |
| 1.6 | Government services & payments | eCitizen / County / Ardhisasa service cards + recent government service payments |
| 1.7 | Recent tax & filing activity | Activity table (Date / Service / Provider / Amount / Method / Status / Ref / Action) |

Section numbering follows the same `1.1`–`1.7` convention as disputes; entity filtering refilters the hub tables, scheduled payments and the scope note while numbering stays stable.

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

Shared `Field` / `SelectField` / `PinRow` / `InfoBox` primitives from `shared/components/modals.tsx`, styled by `appPage.module.css`:

```css
.fieldLabel { font-weight: 600; font-size: 0.8rem; color: #344054; margin-bottom: 0.3rem; }
/* controls: border-radius 10px, border var(--pm-border), focus ring rgba(18,183,106,0.14) */
```

Forms inside modals use the shared primitives (`SelectField` for entities/tax types/payment methods/schedules/counties/services/frequencies; `Field` for amounts, PINs, references, plot numbers; textareas for dispute reasons). Checkboxes (`Pay immediately after filing`, `Auto-file next month`, `Enable auto-sync with iTax`, sync scopes) are labelled `form-check` inputs.

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
| `>= 1200px` | Full fixed 264px sidebar, hero + control strip on one line, 6-col KPI grid, 3-col attention grid, 3-col government cards, panels side-by-side |
| `1100–1199px` | Off-canvas shell nav; hero metrics wrap; 3-col KPI grid; 2-col attention; 2-col government cards |
| `768–1099px` | 3-col→2-col KPI, panels stack, attention 1-col, government cards 2-col |
| `< 768px` | Single-column hero and cards, control strip wraps, tables scroll inside cards, section actions wrap |
| `< 576px` | 1-col KPI, bottom-sheet modals, 1-col government cards, icon-first floating bar (labels hidden), floating bar buttons ≥ 40px targets |

---

## 14. STATUS-TO-TONE MAP (kra-government-specific)

| Status string | Badge class |
|---|---|
| Compliant, Paid, Filed, Success, Active, Valid, Default, Excellent, Synced, Enabled, Claimed | `badgeS` |
| Due Soon, Filed, Paused, Warning, Needs Attention | `badgeW` / `badgeI` (severity) |
| Overdue, Expiring, Failed, Rejected, Invalid | `badgeD` |
| Processing, Under Processing, In Progress | `badgeI` |
| (rare) Arbitration-style escalation | `badgeP` |
| Inactive, Archived, Closed | muted slate (`#f2f4f8`/`#475467`) |

Severity guidance: "Overdue" and "Due Soon" always pair with an action button (Pay / File); the PIN-validation column uses green check / red x badges with a tooltip carrying the expected format regex source. Obligation meter segments use emerald for met, translucent white for unmet, with a text count.

---

## 15. IMPLEMENTATION ARCHITECTURE

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| KRA page | `kra-government/pages/KraGovernment.tsx` | Hero + PIN chips + obligations meter, control strip (entity scope), compliance KPI pulse, attention/suggestions/quick actions, iTax hub, client PIN formats + validation, payments & scheduling, government services, activity, floating bar, footer |
| KRA modals | `kra-government/components/KraGovernmentModals.tsx` | 19 dialogs on shared `ModalShell`/`SimpleModal`/`FlowModal`, steppers, receipts, downloads, cross-modal navigation |
| Business theme contract | `shell.module.css`, `kraGovernment.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

Do not add a second local sidebar or page topbar to a transaction route. Routes below `/pm/app` inherit those surfaces from `AppShell`. Page-level CSS must remain scoped and must not redefine the shell position.

### Current reusable mapping

| Business pattern | KRA implementation |
|---|---|
| Fixed 264px navy rail | `.sidebar.expanded`; 76px compact state (shell) |
| Sticky/translucent topbar | `.topHeader` (shell) |
| `pm-banner-hero` | `.heroBanner`, `.heroContent`, `.heroSnapshot`, `.heroMetricRow` + `.heroPinChips` + `.heroMeter` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.7`) |
| `pm-card` | `.tableCard`, `.listCard`, `.panel` |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue`, `.kpiMeta` |
| Soft status badge | `.badgeS/W/D/I/P` (+ shared `badge*` in modals) |
| Primary / secondary button | `.btnPmP` / `.btnPm`, `.btnPmD` (+ shared `btn`, `btnPrimary`, `btnSecondary`, `btnSm`) |
| Operational list card | `.listCard`, `.actionRow`, `.actionRowMain`, `.actionRowActions` |
| Business table and toolbar | `.tableCard`, `.tableWrap`, `.tbl`, `.panel` |
| Scope filter | `.controlStrip`, `.filterPills`, `.filterActive`, `.scopeNote` |
| Quick-action grid | `.quickGrid`, `.quickActionCard` |
| Service grid | `.govGrid`, `.govCard`, `.govCardIcon`, `.govCardPrice` |
| Analytics panel | `.panel`, `.miniStat*`, `.summaryBox*` |
| Floating quick-action bar | `.floatingBar`, `.floatingPrimary` (Attention · Sync · Health · Pay Tax) |
| Modal / wizard | Shared `ModalShell`, `SimpleModal`, `FlowModal` from `shared/components/modals.tsx` |
| Shell toast | `.toastContainer`, `.paymoToast` (from `shell.module.css`) |

---

## 16. SHARED MODAL ARCHITECTURE (19 modals)

All 19 modals use the shared transaction modal primitives from `shared/components/modals.tsx`:

| Modal | Component | Notes |
|-------|-----------|-------|
| Pay KRA Tax (`payKRAModal`) | `FlowModal` | 4-step Obligation → Details → Confirm → Done; `PinRow` on confirm; summary + iTax ref on last step |
| File Tax Return (`fileReturnModal`) | `FlowModal` | 4-step Select → Upload → Submit → Done; VAT computation summary (gross/input/output/net payable); auto-file checkbox |
| Bulk Tax Filing (`bulkTaxModal`) | `FlowModal` | 3-step Upload → Validate → Done; real CSV template download |
| Pay eCitizen Service (`payECitizenModal`) | `SimpleModal` | Service select + app/ref number + method; receipt via email/SMS |
| Pay County Revenue (`payCountyModal`) | `SimpleModal` | County + permit/service + account/plot + method (no bank transfer) |
| Pay Ardhisasa Land Services (`payArdhisasaModal`) | `SimpleModal` | Land service + LR/plot + method; Ministry of Lands note |
| Schedule Tax Payment (`scheduleTaxModal`) | `SimpleModal` | PIN/tax type + amount + frequency + start date + method |
| Tax Optimizer (`taxOptimizerModal`) | `SimpleModal` | KES 47,800 savings banner + opportunities table (Claim / Add / File Early → `fileReturnModal`) |
| Link New KRA PIN (`addKRAModal`) | `SimpleModal` | PIN + entity type + name + default source + auto-sync checkbox |
| Sync with iTax (`syncItaxModal`) | `SimpleModal` | Last-sync summary + sync-scope checkboxes |
| Tax Payment Receipt (`taxReceiptModal`) | `ModalShell` | Official receipt summary + real PDF/Share file downloads |
| Government Service Receipt (`govReceiptModal`) | `ModalShell` | Service/ref/amount/date summary; opened from service rows |
| Track Government Service (`trackGovModal`) | `SimpleModal` | Application ref + status summary (Under Processing · Biometric Verification) |
| Compliance Health Dashboard (`complianceHealthModal`) | `ModalShell` | Health mini-stats + entity score table; footer Resolve Issues → `payKRAModal` |
| All Items Requiring Attention (`attentionModal`) | `ModalShell` | 3 rows navigate via `onOpen` → file / pay / eCitizen modals |
| Full Tax Payment History (`taxHistoryModal`) | `ModalShell` | xl; rows → `taxReceiptModal` / `fileReturnModal` |
| Government Services History (`govHistoryModal`) | `ModalShell` | xl; rows → `trackGovModal` / `govReceiptModal` |
| Dispute KRA Assessment (`disputeKRAModal`) | `SimpleModal` | PIN + assessment ref + reason + supporting docs; → KRA-DSP-99182 |
| Government Notifications (`govNotifModal`) | `ModalShell` | 4 notice cards; opened from attention-card bell |

Cross-modal navigation uses the `onOpen` callback passed from the page component: `complianceHealthModal → payKRAModal`, `taxOptimizerModal → fileReturnModal`, `taxHistoryModal → taxReceiptModal / fileReturnModal`, `govHistoryModal → trackGovModal / govReceiptModal`, `attentionModal → fileReturn / payKRA / payECitizen`.

Legacy ids removed with the refinement: `profileModal` (shell chrome) and `taxOptimizerModal2` (dead duplicate stub of taxOptimizerModal). The six orphaned legacy modals (`payECitizenModal`, `payCountyModal`, `payArdhisasaModal`, `trackGovModal`, `govReceiptModal`, `govNotifModal`) had **no page trigger** in the legacy file and are now wired into section 1.6 and the attention-card bell.

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

### KRA page hierarchy
- [x] One full-width dark executive hero before the dashboard sections, with linked-PIN chips + obligations meter.
- [x] Entity scope pills (All / Personal / JK Holdings / Rental / Investments) + scope note; filtering refilters hub tables + scheduled payments.
- [x] Seven numbered sections (1.1–1.7) with stable numbering.
- [x] Six consistent KPI cards; semantic color reserved for icon/status emphasis.
- [x] Attention + suggestions lists with one primary row action each; 8 quick actions in a shortcut card.
- [x] iTax hub, client PIN validation, payments/scheduling, government services and activity all visible without opening a dialog.
- [x] Floating command bar (Attention · Sync · Health · Pay Tax) on desktop, icon-first on mobile.

### Cards, forms, tables and icons
- [x] Cards use 16px radius, subtle border and restrained business elevation.
- [x] Controls use 9–10px radius, green focus ring and clear disabled states.
- [x] Buttons include explicit `type="button"` where they do not submit a native form.
- [x] Form labels associated with controls; filter pills expose active state via class.
- [x] Tables use uppercase compact headers, responsive horizontal overflow and non-colour status text (badges always carry text).
- [x] Icon-only controls include contextual accessible names (bell button labelled "Government notifications").
- [x] Live PIN/TIN validation column with expected-format tooltips preserved from the legacy page.

### Modals and wizards
- [x] All 19 modals migrated from legacy `MBox`/`BusyOverlay` to shared `SimpleModal`/`FlowModal`/`ModalShell`.
- [x] Dialog semantics, Escape-to-close, focus return, scroll lock and bottom-sheet mobile behavior come from the shared primitives.
- [x] Wizard steps are semantic ordered lists with completed/current/upcoming states; connectors turn green when done.
- [x] Preserved: processing receipts, reference numbers (ITX- / VAT- / EC- / CCN- / ARD- / SCH- / KRA-DSP-), downloadable templates/receipts, wallet PIN entry, cross-modal navigation (health → pay, optimizer → file, histories → receipt/track).
- [x] Orphaned/duplicate legacy dialogs removed (profile, taxOptimizerModal2); six orphaned government modals re-homed.
- [x] `prefers-reduced-motion` respected in the page layer.

### Responsive implementation
- [x] `>= 1200px`: full sidebar, 6-col KPI, 3-col attention, 3-col government cards, panels side-by-side.
- [x] `1100–1199px`: off-canvas shell nav; 3-col KPI; 2-col government cards.
- [x] `768–1099px`: 2-col KPI where space permits; sections stack.
- [x] `< 768px`: single-column hero and operational cards, wrapped tools, full-width actions.
- [x] `< 576px`: 1-col KPI, bottom-sheet dialogs, icon-first command bar with 40px targets.

---

## 18. MANUAL VISUAL-QA CHECKLIST

Run this list against `/pm/app/kra-government` before release. Deliberately left as review gates rather than implementation claims.

### Desktop — 1440 × 900
- [ ] Sidebar 264px; content has no horizontal jump or overlap.
- [ ] Hero aligns with business Dashboard hero in radius, navy/emerald gradient, type scale and spacing; PIN chips and obligations meter legible on the snapshot.
- [ ] Six KPI cards equal height; long copy truncates rather than moving the grid.
- [ ] Entity pills and scope note align on the control strip; active states clearly visible.
- [ ] Hub tables, client validation table, payment panels and government cards align on the 16px card system.
- [ ] Floating command bar does not cover the footer or table controls at the bottom of the page.

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Sidebar starts closed and opens above the page with one backdrop.
- [ ] KPI grid becomes 3/2 columns; panels stack in a single column.
- [ ] Tables scroll inside their card; the full document does not scroll horizontally.
- [ ] Modal layering remains correct above the shell.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy has no clipping; action buttons meet 40px minimum targets.
- [ ] Control strip wraps cleanly; entity pills remain tappable.
- [ ] Government cards stack 1-col with readable prices and actions.
- [ ] Fixed command bar leaves content reachable and uses a readable labelled primary action.
- [ ] Modals open as bottom sheets, remain scrollable and keep footer actions visible.
- [ ] Stepper labels remain legible without shrinking.

### Interaction and accessibility
- [ ] Keyboard can reach control strip, filters, table actions, floating actions and footer in visual order.
- [ ] Switch entity filter; verify hub tables + scheduled payments refilter and the scope note updates.
- [ ] Open each of the 19 modals; verify close, processing, receipt and nested-dialog paths.
- [ ] Run the three steppers (pay, file, bulk) through completion and verify completed connectors.
- [ ] Download the bulk CSV template and a tax receipt; verify filenames and content.
- [ ] At 200% browser zoom, content remains usable with no two-dimensional page scrolling.
- [ ] With reduced motion enabled, pulse/pop transitions are effectively disabled.
- [ ] Run automated contrast/accessibility tooling; manually verify muted text and focus contrast.

---

## 19. RELEASE GATES

- [x] Targeted Biome lint passes for all edited kra-government files (August 30, 2026) — no errors.
- [x] Vitest suite passes: 1 file, 9 tests (August 30, 2026).
- [x] Production client/server build passes with Vite (August 30, 2026).
- [x] Route responds 200 at `/pm/app/kra-government` in the local preview with SSR markers (hero copy, "Compliance pulse", "KRA iTax integration hub", "Client tax PINs & formats", "Government services & payments", "Recent tax & filing activity"); `?modal=` deep-link returns 200.
- [x] Refinement: removed local sidebar/header chrome — the shared AppShell provides those.
- [x] Refinement: 19 modals migrated from legacy `MBox`/`BusyOverlay` to shared `ModalShell`/`SimpleModal`/`FlowModal`; all 19 rendered are reachable from the page (18 direct triggers + govReceiptModal via service rows); 2 legacy dead ids cut (profile, taxOptimizerModal2); 6 orphaned government modals re-homed.
- [x] Refinement: CSS module rewritten on the transfer-overview token set and composition classes; every `styles.*` token referenced by page and modals resolves in `kraGovernment.module.css` or `appPage.module.css` (CSS-reference audit clean).
- [x] Refinement: TypeScript typecheck — zero new diagnostics in kra-government files (identical error-key set to the accepted fees/settlement baseline).
- [ ] Manual visual-QA checklist above signed off by a reviewer.
- [ ] Real API payload checked against long names, empty arrays, large amounts, multiple countries and non-KES currencies.
