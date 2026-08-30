# PayMo Business → Analytics & Reporting Dashboard Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Sibling references: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md` (canonical page), `initiate-transfer/`, `fx/DESIGN-BLUEPRINT.md`, `compliance/DESIGN-BLUEPRINT.md`
> Implementation targets: `transaction-dashboard/analytics/` (`pages/Analytics.tsx`, `components/AnalyticsModals.tsx`, `styles/analytics.module.css`)
> Content reframe source: original `analytics` feature (legacy page 1.8 — report builder, failure/merchant drill-downs, scheduled reports, auto-retry, health check)
> Last reconciled: August 30, 2026

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.analyticsPage {
  /* ── Brand ── */
  --pm-green: #12b76a;
  --pm-green-dark: #0b8f52;
  --pm-green-soft: #e7f8ef;
  --pm-primary: #12b76a;
  --pm-primary-dark: #0b8f52;
  --pm-primary-light: #41d991;
  --pm-accent: #12b76a;
  --pm-accent-soft: #e7f8ef;

  /* ── Neutrals ── */
  --pm-ink: #101828;
  --pm-ink-soft: #344054;
  --pm-muted: #667085;
  --pm-bg: #f2f4f8;
  --pm-surface: #ffffff;
  --pm-surface-2: #fafbfd;
  --pm-card: #ffffff;
  --pm-border: #e6e9f0;
  --pm-border-2: #d5d9e2;
  --pm-sidebar: #0b1322;

  /* ── Semantic ── */
  --pm-warn: #f79009;
  --pm-warning: #f79009;
  --pm-warning-soft: #fef0c7;
  --pm-danger: #f04438;
  --pm-danger-soft: #fee4e2;
  --pm-blue: #2e90fa;
  --pm-info: #2e90fa;
  --pm-info-soft: #e8f1fe;
  --pm-violet: #7a5af8;
  --pm-purple: #7a5af8;
  --pm-purple-soft: #f0ebfe;

  /* ── Dimensions ── */
  --pm-radius: 16px;
  --pm-shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px -12px rgba(16, 24, 40, 0.12);
  --pm-shadow-lg: 0 24px 60px -16px rgba(16, 24, 40, 0.28);
  --pm-shadow-glow: 0 0 0 0.2rem rgba(18, 183, 106, 0.14);

  /* ── Font stacks ── */
  --pm-font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --pm-font-display: "Sora", "Inter", sans-serif;
}
```

- Every token matches `transfer-overview.module.css` / `initiateTransfer.module.css` / `fx.module.css` exactly — the refined transaction pages are visually interchangeable.
- Semantic colours are reserved for status/icon emphasis only; the primary interaction colour is always emerald `#12b76a`.

---

## 2. TYPOGRAPHY

| Element | Family | Size | Weight | Notes |
|---------|--------|------|--------|-------|
| Body | `"Inter", system-ui, sans-serif` | `0.925rem` | 400 | `-webkit-font-smoothing: antialiased` |
| Hero h1 | Sora | `clamp(2rem, 3.7vw, 3.35rem)` | 750 | `letter-spacing: -0.045em; line-height: 1.08` |
| Hero eyebrow | Inter | `0.7rem` | 700 | uppercase, `0.06em`, `#b7e6cf` pills |
| Hero snapshot value | Sora | `clamp(1.55rem, 2.5vw, 2.1rem)` | 800 | `-0.035em` |
| Hero metric strong | Sora | `0.9rem` | 700 | white; label `0.62rem` `#8fbaa6` |
| Section heading (h2) | Sora | `1.06rem` | 700 | `-0.02em` |
| Section index badge | Inter | `0.67rem` | 700 | 35×35px, radius 10px, `#101828` bg |
| Section subtitle | Inter | `0.78rem` | 400 | `--pm-muted`, max-width 680px |
| Card kicker | Inter | `0.6rem` | 750 | uppercase, `0.09em`, `--pm-green-dark` |
| Card header (h3) | Sora | `0.92rem` | 700 | `-0.015em` |
| KPI label | Inter | `0.68rem` | 700 | uppercase, `0.055em`, `#475467` |
| KPI value | Sora | `clamp(1.35rem, 1.9vw, 1.8rem)` | 800 | `-0.04em` |
| KPI foot | Inter | `0.65rem` | 400 | `--pm-muted` |
| Table header | Inter | `0.63rem` | 700 | uppercase, `0.07em`, `--pm-muted` |
| Table cell | Inter | `0.75rem` | 400 | `#475467`; strong cells `--pm-ink` |
| Badge | Inter | `0.7rem` | 600 | `border-radius: 99px` |
| Button | Inter | `0.86rem` | 600 | small `0.8rem` |
| Quick action label | Inter | `0.69rem` | 650 | icon `1rem` |
| Row title (attention) | Inter | `0.77rem` | 650 | `#344054`, ellipsis |
| Row sub | Inter | `0.68rem` | 400 | `--pm-muted` |
| Floating bar | Inter | `0.69rem` | 650 | |
| Footer | Inter | `0.66rem` | 400 | `--pm-muted` |

---

## 3. LAYOUT SHELL

The Analytics route `/pm/app/analytics` (`src/routes/pm/app.analytics.tsx`) renders `Analytics` inside the shared authenticated AppShell.

- **Owned by AppShell** (never re-render locally): fixed 264px navy sidebar (`#0b1322`) with 76px compact state, 62px translucent topbar with breadcrumb/search/account/security/notifications/user menu, toasts, drawers.
- **Owned by the page**: everything inside `.content` — hero, numbered sections, tables, floating command bar, footer.
- Page root `.analyticsPage` is a plain block (`font-family`, background `#f2f4f8`) — no flex row, no local sidebar/header/breadcrumb. The legacy local page bar, breadcrumb, search box and profile header (commented chrome of page 1.8) are dropped; the shell owns that chrome.
- `.content`:
```css
.analyticsPage .content {
  flex: 1;
  padding: 1.5rem 1.5rem 7.5rem;
  max-width: 1500px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}
```

---

## 4. COMPONENT PATTERNS

### Card
```css
.card {
  background: var(--pm-card);
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius);   /* 16px */
  padding: 1.2rem;
  box-shadow: var(--pm-shadow);
  transition: box-shadow 0.2s, transform 0.2s;
}
.card:hover { box-shadow: 0 4px 16px -10px rgba(16, 24, 40, 0.24); }
```

### Buttons
```css
.btnPm { border-radius: 10px; font-weight: 600; border: 1px solid var(--pm-border); background: #fff; color: #475467; }
.btnPm:hover { background: #f2f4f8; color: var(--pm-ink); border-color: #d5d9e2; }
.btnPmP { background: var(--pm-green); color: #fff; border-color: var(--pm-green); }
.btnPmP:hover { background: var(--pm-green-dark); color: #fff; }
.btnPmA { background: #e7f8ef; color: var(--pm-green-dark); border-color: #a9e6c5; }  /* pause/resume secondary */
.btnSm { padding: 5px 12px; font-size: 0.8rem; border-radius: 8px; }
```
Every button carries `type="button"` unless it submits a real form.

### Badges (soft)
| Class | Background | Text |
|-------|-----------|------|
| `.badgeS` | `#e7f8ef` | `#067647` |
| `.badgeW` | `#fef0c7` | `#93370d` |
| `.badgeD` | `#fee4e2` | `#b42318` |
| `.badgeI` | `#e8f1fe` | `#175cd3` |
| `.badgeP` | `#f0ebfe` | `#5925dc` |

Badges are the primary non-colour status signal inside tables and rows; icons in badges are decorative.

### Heat cell (hourly volume)
```css
.heatCell { border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 0.62rem; }
```
Used in the 5-up heatmap grid (`.heatmapGrid`, `gap: 6px`) — data-driven `background`/`color` from the mock (`--pm-green-soft` → emerald ramp, `--pm-danger-soft` → red ramp for peak hours).

### Live dot
```css
.dotLive { width: 7px; height: 7px; border-radius: 50%; background: #41d991; animation: pmPulse 2s infinite; }
```

---

## 5. TABLE

```css
.tbl { width: 100%; border-collapse: collapse; font-size: 0.86rem; min-width: 780px; }
.tbl th { padding: 0.72rem 0.85rem; font-size: 0.63rem; text-transform: uppercase; letter-spacing: 0.07em;
          color: var(--pm-muted); border-bottom: 1px solid var(--pm-border); background: #fafbfd; white-space: nowrap; }
.tbl td { padding: 0.7rem 0.85rem; border-bottom: 1px solid #f0f2f6; vertical-align: middle; color: #475467; font-size: 0.75rem; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: #fafbfd; }
```
- Tables live inside `.tableCard` with `.tableToolbar` (title + tools), `.tableScroll` (horizontal overflow only inside the card — never the document).
- Used on: category performance (section 1.6), recent custom reports (1.7), scheduled & automated reports (1.7 table card).
- Row actions are real buttons: `View`, `Edit`, `Pause`/`Resume` (toast) — never links or spans.

---

## 6. MODAL (page-scoped MBox layer)

The Analytics modals use the page-scoped `MBox` shell in `AnalyticsModals.tsx` (a deliberate choice — 12 legacy shells with `results`/`busy`/`flows`/`tabs`/stepper state were restyled in place rather than migrated, preserving behaviour). The **visual contract is identical** to the shared modal primitives:

```css
.backdrop { position: fixed; inset: 0; background: rgba(11, 19, 34, 0.55); backdrop-filter: blur(3px); z-index: 1055; }
.modalWrap { position: fixed; inset: 0; z-index: 1075; display: flex; align-items: center; justify-content: center;
             padding: 1.25rem; overflow-y: auto; pointer-events: none; }
.modalBox { pointer-events: auto; width: 100%; max-width: 540px; background: #fff; border: 1px solid rgba(230,233,240,.9);
            border-radius: 18px; box-shadow: var(--pm-shadow-lg); animation: pmPop .2s cubic-bezier(.16,1,.3,1);
            max-height: calc(100vh - 3rem); display: flex; flex-direction: column; }
.modalBoxLg { max-width: 820px; } .modalBoxXl { max-width: 1060px; }
.modalHeader { position: sticky; top: 0; z-index: 2; background: rgba(255,255,255,.96); backdrop-filter: blur(10px);
               border-bottom: 1px solid var(--pm-border); padding: 1rem 1.4rem; }
.modalFooter { position: sticky; bottom: 0; z-index: 2; background: #fafbfd; border-top: 1px solid var(--pm-border);
               padding: 0.9rem 1.4rem; }
```

### MBox API (AnalyticsModals.tsx)
```tsx
<MBox id="reportBuilderModal" active={active} title={<ReactNode>} size="md" | "lg" | "xl" onClose={fn}>
  {children}
  footer={<ReactNode>}
</MBox>
```
- Backdrop click closes; Bootstrap `.btn-close` restyled to a 34px `#f2f4f8` circular close.
- Mobile: bottom sheet, `max-height: 92dvh`, `border-radius: 16px 16px 0 0`, full-width footer buttons.
- Modal hygiene (added at page level, matching transfer-overview/fx): body scroll lock while open, `Escape` closes, focus returns to the trigger.
- `.loadingOv`/`.spinner`/`.loadingLabel` = BusyOverlay; `.fstepActive` = step fade; `.fl`/`.fc` = legacy form label/control (business-styled); `.sr` = stat row; `.pills`/`.pill`/`.pillActive` = tab panels (`sw(prefix,key,btn)`).

### Per-modal sizes (12 shells)
| Size | Modal ids |
|------|-----------|
| `xl` (1060px) | `reportBuilderModal`, `failureDrillModal`, `merchantDrillModal`, `trendModal` |
| `lg` (820px) | `exportModal`, `categoryModal`, `scheduledReportsModal`, `healthCheckModal` |
| `md` (540px) | `autoRetryModal`, `attentionModal`, `notifModal`, `profileModal` |

---

## 7. DRAWER

Not used on the Analytics page. Shell-owned right aside / left drawer (account, security, notifications, contextual panels) apply unchanged.

---

## 8. WIZARD / STEPPER

```css
.stepper { display: flex; align-items: center; margin-bottom: 24px; padding: 0.4rem 0.2rem 0.6rem; overflow-x: auto; }
.stepN { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #d5d9e2; background: #fff;
         color: #98a2b3; font-weight: 700; font-size: 0.82rem; }
.stepActive .stepN { border-color: var(--pm-green); color: var(--pm-green-dark); box-shadow: 0 0 0 5px rgba(18,183,106,.14); }
.stepDone .stepN { background: var(--pm-green); border-color: var(--pm-green); color: #fff; }
.stepLine { flex: 1; height: 2px; background: #d5d9e2; min-width: 18px; }
.stepDone .stepLine { background: var(--pm-green); }
```
- **Report builder wizard**: `nextFlow('rb', 4)` — steps `RB_STEPS` Type → Columns → Delivery → Done (preserved bridge from the legacy page; `.fstepActive` step fade, busy overlay between steps).
- Receipt: `.receipt` (dashed box) + `.ri` (56px green icon circle) + `.receiptTitle`/`.receiptSub` — shown after report builder completion and after exports.

---

## 9. SECTION HEADERS

```tsx
<SectionHeading id="analytics-pulse-heading" index="1.1" title="Analytics pulse" description="…"
  action={<div className={styles.headerButtonRow}>…buttons…</div>} />
```
- `.sectionHeading` — flex, `align-items: flex-end`, gap 1.25rem, `margin-bottom: 1rem`.
- `.sectionIndex` — 35px ink square with the number (`1.1`–`1.8`).
- `.dashboardSection { padding-top: 2.2rem; }` (1.7rem under 768px).
- On mobile the action row goes full-width and buttons become equal flex columns.

---

## 10. KPI CARD

```tsx
<article className={`${styles.card} ${styles.kpiCard} ${meta.accent ? styles[meta.accent] : ""}`}>
  <div className={styles.kpiIcon} style={{ background: meta.bg, color: meta.color }}><i className={`bi ${meta.icon}`} /></div>
  <div className={styles.kpiMeta}><span>{card.label}</span><small>Live</small></div>
  <strong className={styles.kpiValue}>{card.value}</strong>
  <div className={styles.kpiFoot}>
    <span className={`${styles.badge} ${styles[card.badge.tone]}`}><i className={`bi ${card.badge.icon}`} /> {card.badge.text}</span>
    {card.progress && <span className={styles.pmProgress} style={{ width: 110 }}><span className={styles.pmProgressBar} style={{ display: "block", width, background }} /></span>}
  </div>
  {card.note?.map(n => <div className={styles.kpiLine}><span>{n}</span></div>)}
</article>
```
- Grid: `.kpiGrid { repeat(3, minmax(0, 1fr)) }` → 1 column (576px).
- 3px top accent: `kpiCard::before` slate; `kpiFeatured` emerald (success card, first); `kpiDanger` red (failed card).
- Icon tones via `STAT_META` keyed by stat key — see §19.

---

## 11. FORMS

```css
.fl { display: block; font-size: 0.72rem; font-weight: 600; color: #344054; margin-bottom: 0.3rem; }
.fc { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.9rem; }
.fc:focus { outline: 0; border-color: var(--pm-green); box-shadow: 0 0 0 0.2rem rgba(18,183,106,.14); }
```
- Bootstrap overrides inside `.analyticsPage`: `.form-check-input:checked` green, `.form-switch` green, `.progress`/`.progress-bar` green on `#eef0f4`.
- `.pills`/`.pill`/`.pillActive` — segmented controls used for tab panels inside report builder, export and drill modals (`sw()` bridge).

---

## 12. TOAST NOTIFICATIONS

Shell-owned (`shell.module.css` `.toastContainer`/`.paymoToast`). The page adds only a lightweight **page notice** (`output.pageNotice`) for the Pause/Resume schedule action and error fallback — a fixed top-center pill that auto-dismisses after 3.5s (preserves the legacy `doAction` notice bridge).

---

## 13. DROPDOWN

Bootstrap dropdowns are not used on the page; shell dropdowns apply.

---

## 14. SCROLLBAR

```css
.analyticsPage * { scrollbar-width: thin; scrollbar-color: #c8cdd8 transparent; }
.analyticsPage *::-webkit-scrollbar { width: 8px; height: 8px; }
.analyticsPage *::-webkit-scrollbar-thumb { background: #c8cdd8; border-radius: 8px; }
```

---

## 15. ANIMATIONS

```css
@keyframes pmPop    { from { opacity: 0; transform: scale(.97) translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes pmFade   { from { opacity: 0; } to { opacity: 1; } }
@keyframes pmPulse  { 0% { box-shadow: 0 0 0 0 rgba(18,183,106,.5); } 70% { box-shadow: 0 0 0 7px rgba(18,183,106,0); } 100% { box-shadow: 0 0 0 0 rgba(18,183,106,0); } }
@keyframes pmSpin   { to { transform: rotate(360deg); } }
@keyframes pmFi     { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
```
All animations gated by `@media (prefers-reduced-motion: reduce)` (universal `animation-duration/transition-duration: 0.01ms !important`).

---

## 16. RESPONSIVE BREAKPOINTS

| Range | Behaviour |
|-------|-----------|
| `≥ 1280px` | KPI grid 3-up; quick actions 4-up; heatmap 5-up; export tiles 3-up; floating bar centred on `calc(50% + 94px)` (compensates compact sidebar) |
| `1100–1279px` | Same grids; floating bar `left: 50%` |
| `768–1099px` | Hero keeps two columns (narrowed); `panelGridWide` and attention grid collapse to 1 column; export tiles 3-up |
| `< 768px` | Hero single column; section actions full width; attention grid 1-up; quick grid 2-up; table toolbar stacks; floating bar becomes bottom bar spanning the viewport; content padding `1rem 1rem 5.5rem` |
| `< 576px` | Single KPI column; heatmap 3-up; export tiles 1-up; hero buttons fill; floating bar icon-first (labels hidden, primary keeps label); modals become bottom sheets (92dvh); stepper labels hidden |

---

## 17. STATUS-TO-TONE MAP

The page uses the same `BadgeTone` union as the sibling pages:
```ts
type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
```
Analytics-specific usage: Success/Active/Scheduled → `badgeS`; Pending/Processing/Retrying/Low → `badgeW`; Failed/Declined/High risk → `badgeD`; In-progress/Drill → `badgeI`; AI suggestions → `badgeP`. Status is always text + badge — never colour alone.

---

## 18. MISC COMPONENTS

- **Hero banner** — navy→emerald gradient `linear-gradient(115deg, #0b1322 0%, #123a2c 60%, #0d5c38 100%)`, two decorative orbs, eyebrow pills (graph-up icon + live pulse with "Refreshing…" while fetching), primary (white) + secondary (glass) CTA buttons wired to `reportBuilderModal` / `scheduledReportsModal` / `exportModal`, glass **hero snapshot** card: "Live snapshot" label, notif bell + avatar buttons (→ `notifModal` / `profileModal`), headline value, detail line, 3-metric trend row.
- **Status notice** (`.statusNotice`) — slate/green callout shown only when the API fetch fails; content falls back to mock data (`initialMockData`), tagged "Using the latest local operating snapshot".
- **Attention grid** (`.attentionGrid`) — two list cards: Action center ("Attention required" + `badgeD` count) and Smart guidance (AI `badgeP`), each row with icon circle + title/sub + one primary small action.
- **Quick action card** (`.quickActionCard`, `.quickGrid`, `.quickBtn`) — "Start a workflow" shortcuts (report builder, export, failure drill, merchant drill, trend, health check, schedules, auto-retry), icon + label + arrow.
- **Utility box** (`.ub`) — `#f2f4f8` inset panel used inside cards (chart bars, top merchants, heatmap, failure reasons, retry stats, templates, exports).
- **Summary boxes** (`.summaryBox`, `-Info/-Warn/-Danger`) and **mini stats** (`.miniStat`, `.miniStatBig`, `.miniStatLabel`) — used inside cards and modals (best day, concentration risk, retry performance).
- **Floating command bar** — fixed, `left: calc(50% + 94px)`, white glass, primary "New report"; Failures/Schedules/Health actions; icon-first on mobile.
- **Page footer** — "PayMo transaction analytics engine", Support (plain `<a>`)/Preferences links, version `v1.8.0`.
- **Bar chart** (`.chartBars`/`.chartBar`/`.barLabel`) — flex-end columns, data-driven height/colour, each bar is a real button opening `trendModal` (keyboard accessible drill-down).
- **Stat rows** (`.sr`) — row label + right-aligned badge/strong; used for merchants, weekdays, seasonal, failure reasons, top failing, recent exports.

---

## 19. IMPLEMENTATION ARCHITECTURE

Two styling layers, same as every refined transaction page:

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Analytics page | `analytics/pages/Analytics.tsx` | Hero, KPI pulse, attention grid, quick actions, volume/merchant, trends, failure analysis, merchant/category, report builder, export center, floating bar, footer |
| Analytics modals | `analytics/components/AnalyticsModals.tsx` | 12 MBox shells with flows/results/tabs/busy state, stepper, receipts |
| Business theme contract | `analytics/styles/analytics.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

### Current reusable mapping

| Business pattern | Analytics implementation |
|---|---|
| Fixed 264px navy rail + compact state | AppShell sidebar (not rendered locally) |
| Sticky/translucent compact topbar | AppShell topbar (not rendered locally) |
| `pm-banner-hero` | `.heroBanner` + `.heroContent` + `.heroSnapshot` + `.heroMetricRow` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.8`) |
| `pm-card` | `.card` — white, 16px, `#e6e9f0`, dual-layer shadow |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon`, `.kpiValue`, `.kpiFoot`, `.kpiFeatured`/`.kpiDanger` accents |
| Soft status badge | `.badge`, `.badgeS/W/D/I/P` |
| Primary/secondary button | `.btnPmP` / `.btnPm`, `.btnPmA`, `.btnSm` |
| Operational list card | `.listCard`, `.cardHeader`, `.cardKicker`, `.actionRow`, `.actionRowMain` |
| Business table + toolbar | `.tableCard`, `.tableToolbar`, `.tableTitle`, `.tableScroll`, `.tbl` |
| Quick-action shortcut card | `.quickActionCard`, `.quickActionIntro`, `.quickGrid`, `.quickBtn` |
| Floating quick-action bar | `.floatingBar`, `.floatingPrimary` |
| Segmented tab pills | `.pills`, `.pill`, `.pillActive` (modal tab panels via `sw()`) |
| Modal/wizard | Page-scoped `MBox` layer (visual contract equals shared `ModalShell`) |
| Shell toast | `.toastContainer`, `.paymoToast` (shell); page-level `output.pageNotice` for pause/resume |
| Drawer/context panel | shell `LeftDrawer` / `RightAside` |

### KPI metadata (`STAT_META`)
| stat key | Icon | Tone |
|----------|------|------|
| `success` | `bi-check2-circle` | `#e7f8ef` bg / `#067647` icon; card gets `kpiFeatured` accent |
| `avg` | `bi-arrow-left-right` | `#e8f1fe` bg / `#175cd3` icon |
| `failed` | `bi-x-octagon` | `#fee4e2` bg / `#b42318` icon; card gets `kpiDanger` accent |
| fallback | `bi-bar-chart` | `#fafbfd` bg / `#475467` icon |

---

## 20. MODAL INVENTORY (12 / 12 REACHABLE)

All modal shells live in `AnalyticsModals.tsx`; every id below is triggered from the page (hero, section actions, attention rows, quick actions, chart bars, tables, floating bar):

| # | Modal | Size | Reachable from |
|---|-------|------|----------------|
| 1 | `reportBuilderModal` | xl | Hero primary, pulse action, quick actions, templates, floating bar |
| 2 | `exportModal` | lg | Hero action, export options, recent exports, floating bar |
| 3 | `failureDrillModal` | xl | Quick actions, section 1.5 header, floating bar |
| 4 | `merchantDrillModal` | xl | Quick actions, top merchants, top failing, category card, section 1.6 header |
| 5 | `trendModal` | xl | Quick actions, chart bars, trends header, seasonal card |
| 6 | `categoryModal` | lg | Quick actions, section 1.6 header |
| 7 | `scheduledReportsModal` | lg | Hero action, schedules toolbar, schedule rows, floating bar |
| 8 | `autoRetryModal` | md | Quick actions, retry performance card |
| 9 | `healthCheckModal` | lg | Quick actions, pulse/overview header, floating bar |
| 10 | `attentionModal` | md | Attention card header, quick actions |
| 11 | `notifModal` | md | Hero snapshot bell (re-wired this refinement — was orphaned in commented chrome) |
| 12 | `profileModal` | md | Hero snapshot avatar (re-wired this refinement — was orphaned in commented chrome) |

Cross-modal navigation (doAction spinner → receipt, RB 4-step wizard `nextFlow('rb', 4)`, tab panels `sw()`) preserved from the original `AnalyticsModals` bridge.

---

## 21. CODE-COMPLETE CHECKLIST (refined August 30, 2026)

### Theme and typography
- [x] Emerald `#12b76a` is the only primary interaction colour.
- [x] `#0b1322` navigation rail and `#f2f4f8` canvas (via AppShell).
- [x] Cool neutral borders `#e6e9f0`; no warm/cream tokens remain in `analytics.module.css`.
- [x] Semantic colours only for status: warning `#f79009`, danger `#f04438`, info `#2e90fa`, violet `#7a5af8`.
- [x] Inter for body/controls, Sora for headings/KPI values (fonts loaded once in `src/routes/__root.tsx`).

### Shell and page hierarchy
- [x] Page renders content only — no second sidebar, header, breadcrumb, search box or page bar (legacy local chrome removed; shell owns it).
- [x] One full-width dark executive hero before all sections (gradient, orbs, eyebrow pills, glass snapshot with bell/avatar actions and metric row).
- [x] Eight numbered sections: 1.1 Analytics pulse, 1.2 Needs your attention (+ quick actions), 1.3 Volume & merchant overview, 1.4 Trends & patterns, 1.5 Failure & decline analysis, 1.6 Merchant & category insights, 1.7 Report builder & schedules, 1.8 Export & delivery center.
- [x] Three KPI cards (Success rate / Avg value / Failed txns) with per-card icon tone and featured/danger top accents.
- [x] Attention + AI suggestions as scannable list cards with one primary row action each; 8 quick actions in the shortcut card.
- [x] Volume trend bar chart (each bar drills into `trendModal`), top-5 merchants, hourly heatmap, weekday/weekend, seasonal, failure distribution, top failing, retry performance, category table, concentration risk.
- [x] Report templates, recent custom reports, scheduled & automated reports table (Edit / Pause / Resume actions) preserved from page 1.8.
- [x] Export options grid + recent exports with working CSV download (`downloadExport` Blob bridge).
- [x] Floating command bar on desktop, icon-first bottom bar on mobile; page footer.
- [x] Content centred at 1500px max width.

### Cards, forms, tables and icons
- [x] Cards 16px radius, subtle border, restrained elevation.
- [x] Controls 9–10px radius, green focus ring, clear disabled states.
- [x] Explicit `type="button"` on all non-submit buttons.
- [x] Tables use uppercase compact headers, card-scoped horizontal scroll, non-colour status text.
- [x] Bootstrap Icons throughout; icons support labels and are never the sole status signal.
- [x] Chart bars and quick actions are real buttons with keyboard access (`aria-label`/title on bars).

### Modals, steppers and drawers
- [x] Dialogs use `role="dialog"`, `aria-modal`, labelled title, dark blurred backdrop, sticky header/footer.
- [x] Escape closes the active dialog, focus returns to its trigger, body scroll locks while open.
- [x] Mobile dialogs become bottom sheets with 92dvh max height.
- [x] Report-builder stepper shows completed/current/upcoming states with green connectors and focus halo.
- [x] Loading overlay, receipts, tab panels and nested workflows preserved from the legacy bridge.
- [x] All 12 modal shells reachable (audited — `notifModal`/`profileModal` re-wired from the hero snapshot; previously orphaned).
- [x] `prefers-reduced-motion` respected.

### Responsive implementation
- [x] `≥ 1280px`: 3-column KPI grid, 4-up quick actions, 5-up heatmap, centred floating bar with sidebar offset.
- [x] `1100–1279px`: same grids, floating bar re-centred.
- [x] `768–1099px`: hero two-column, panel/attention grids single-column.
- [x] `< 768px`: single-column hero/operational cards, stacked toolbars, full-width section actions, bottom-bar command bar.
- [x] `< 576px`: single KPI column, heatmap 3-up, icon-first command bar, bottom-sheet dialogs, shrunken steppers.

---

## 22. MANUAL VISUAL-QA CHECKLIST

Run against `/pm/app/analytics` before release — deliberate review gates.

### Desktop — 1440 × 900
- [ ] Sidebar/topbar come from the shell; hero aligns with transfer-overview hero (gradient, radius, type scale).
- [ ] Three KPI cards equal height; long badge text truncates without breaking the grid.
- [ ] Chart bars drill into the trend modal; heatmap cells legible at 5-up.
- [ ] Tables scroll inside their cards; the document never scrolls horizontally.
- [ ] Floating bar does not cover footer or table controls.
- [ ] Hero snapshot metrics match the data (volume / success / merchants).

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] KPI grid stays 3-up at 1024; panel and attention grids single-column.
- [ ] Hero still two-column at 1024; snapshot not clipped.
- [ ] Modals remain centred and scrollable; footer actions visible.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy unclipped; action buttons ≥ 40px target; first button full-width.
- [ ] Quick actions 2-up; heatmap 3-up; export tiles full width.
- [ ] Tables scroll inside cards; schedule toolbar stacks.
- [ ] Floating bar icon-first with labelled primary; content reachable behind it.
- [ ] Modals open as bottom sheets with sticky footer actions.

### Interaction and accessibility
- [ ] Keyboard reaches hero, KPIs, chart bars, tables, floating bar, footer in visual order.
- [ ] Focus visible on cards, buttons and inputs; chart bars activate with Enter/Space.
- [ ] Open the report builder wizard to completion (stepper → busy → receipt).
- [ ] Pause/Resume a scheduled report; the page notice appears and auto-dismisses.
- [ ] Download a recent export (CSV) and confirm the file name mapping.
- [ ] Open every modal via its trigger; verify Escape, backdrop click, focus return.
- [ ] At 200% zoom no two-dimensional page scrolling.
- [ ] Reduced motion disables pulse/pop/fade transitions.

---

## 23. RELEASE GATES

- [x] Targeted Biome check passes for `Analytics.tsx` (August 30, 2026). CSS lint state is at parity with the reference pages (`noImportantStyles` on the `.btnPmP:hover` override + `prefers-reduced-motion` block; `noDescendingSpecificity` on the same intentional patterns as `transfer-overview.module.css`).
- [x] TypeScript: zero diagnostics in `transaction-dashboard/analytics/` files (pre-existing legacy `Link` route-union issue in `transfer-overview` is unrelated and tracked upstream).
- [x] CSS class audit: every `styles.*` reference in `Analytics.tsx` + `AnalyticsModals.tsx` resolves in `analytics.module.css` (no missing classes; composed-selector pairs `stepActive`/`stepDone`/`quickActionIntro`/`tableTitle` verified present).
- [x] Modal audit: 12/12 shells reachable from the page.
- [x] `notifModal`/`profileModal` reachability restored (were orphaned in the commented legacy header chrome).
- [x] Content preserved from the legacy page 1.8 (report builder wizard, failure/merchant/trend drills, scheduled reports, auto-retry, health check, exports, category analysis).
- [x] Production client/server build passes.
- [x] Route responds at `/pm/app/analytics` with SSR markers in the local preview.
- [x] Vitest suite passes (9/9).
- [x] `git diff --check` clean.
- [ ] Manual visual-QA checklist (§22) signed off by a reviewer.
