# PayMo Business → System Health & Operations Dashboard Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Sibling references: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md` (canonical page), `initiate-transfer/`, `fx/DESIGN-BLUEPRINT.md`, `compliance/DESIGN-BLUEPRINT.md`, `analytics/DESIGN-BLUEPRINT.md`
> Implementation targets: `transaction-dashboard/system-health/` (`pages/OpsSystem.tsx`, `components/OpsSystemModals.tsx`, `styles/systemHealth.module.css`)
> Content reframe source: legacy 1.17.html — the B2B operations command center
> Last reconciled: August 30, 2026

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.systemHealthPage {
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
  --pm-bg-soft: #eef0f4;
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

- Every token matches the sibling refined pages exactly — the transaction dashboards are visually interchangeable with the business pages.
- Semantic colours are reserved for status/icon emphasis only; the primary interaction colour is always emerald `#12b76a`.
- The legacy 1.17 theme (teal primary `#10b981`, amber accent `#f59e0b`, cream canvas `#f5f1ec`, Space Grotesk display font, page-level `min-height: 100vh` + radial gradients) is fully replaced.

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
| Table ref code | mono | `0.66rem` | — | `ui-monospace, SFMono-Regular, Menlo` |
| Badge | Inter | `0.7rem` | 600 | `border-radius: 99px` |
| Button | Inter | `0.86rem` | 600 | small `0.8rem` |
| Quick action label | Inter | `0.69rem` | 650 | icon `1rem` |
| Row title (attention) | Inter | `0.77rem` | 650 | `#344054`, ellipsis |
| Row sub | Inter | `0.68rem` | 400 | `--pm-muted` |
| Floating bar | Inter | `0.69rem` | 650 | |
| Footer | Inter | `0.66rem` | 400 | `--pm-muted` |

---

## 3. LAYOUT SHELL

The route `/pm/app/ops-health` (`src/routes/pm/app.ops-health.tsx`) renders `OpsSystem` inside the shared authenticated AppShell.

- **Owned by AppShell** (never re-render locally): fixed 264px navy sidebar (`#0b1322`) with 76px compact state, 62px translucent topbar with breadcrumb/search/account/security/notifications/user menu, toasts, drawers.
- **Owned by the page**: everything inside `.content` — hero, numbered sections, tables, floating command bar, footer.
- Page root `.systemHealthPage` is a plain block (`font-family`, background `#f2f4f8`) — no flex row, no local sidebar/header/breadcrumb.
- `.content`:
```css
.systemHealthPage .content {
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
.btnPmD { background: var(--pm-danger); color: #fff; border-color: var(--pm-danger); }
.btnPmA { background: #e7f8ef; color: var(--pm-green-dark); border-color: #a9e6c5; }
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

### Live dot
```css
.dotLive { width: 7px; height: 7px; border-radius: 50%; background: #41d991; animation: pmPulse 2s infinite; }
```

### Progress bar
```css
.pmProgress { height: 8px; background: #eef0f4; border-radius: 99px; overflow: hidden; }
.pmProgressBar { height: 100%; border-radius: 99px; transition: width 0.3s ease; }
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
.tbl code { color: #667085; font-family: ui-monospace, ...; font-size: 0.66rem; }
```
- Tables live inside `.tableCard` with `.tableToolbar` (title + tools) and `.tableScroll` (horizontal overflow only inside the card — never the document).
- Used for: service health overview, corridor performance, partner API status, settlement batches, fraud rules, infrastructure metrics, operations ticket queue.

---

## 6. MODAL (page-scoped legacy Modal layer)

The system-health modals use the page-scoped `Modal` wrapper in `OpsSystemModals.tsx` (a deliberate choice — 30 legacy shells with flows/tabs/busy/receipt state were restyled in place rather than migrated, preserving behaviour). The **visual contract is identical** to the shared modal primitives:

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

### Modal API (OpsSystemModals.tsx)
```tsx
<Modal open={state.globalStatus} onClose={() => onClose("globalStatus")}
       size="sm" | "md" | "lg" | "xl" title="…" icon="bi-globe" loading={…}>
  {children}
  footer={<ReactNode>}
</Modal>
```
- Backdrop click closes; Bootstrap `.btn-close` restyled to a 34px `#f2f4f8` circular close.
- Mobile: bottom sheet, `max-height: 92dvh`, `border-radius: 16px 16px 0 0`, full-width footer buttons.
- Modal hygiene (added at page level, matching every refined page): body scroll lock while open, `Escape` closes, focus returns to the trigger.
- `.loadingOv`/`.spinner`/`.loadingLabel` = busy overlay; `.fstepActive` = step fade; `.fl`/`.fc` = legacy form label/control (business-styled); `.pills`/`.pillActive` = segmented tab panels.
- Modal-state bridge preserved: `initialModalsState` (30 booleans) + `ModalKey` union + `onClose(key)` — page owns state via `useState(initialModalsState)`.

### Per-modal sizes (30 shells)
| Size | Modal keys |
|------|-----------|
| `xl` (1060px) | `globalStatus`, `incidentQueue`, `settlementDetail`, `apiPerformance`, `fraudAlertQueue`, `auditLog`, `liveTransactionFeed` |
| `lg` (820px) | `fraudModel`, `webhookMonitor`, `incidentDetail`, `partnerApiDetail`, `infraDetail`, `capacityPlanning`, `ticketDetail`, `failureAnalysis`, `corridorDetail`, `slaReport`, `uptimeHistory` |
| `md` (540px) | `runHealthCheck`, `fraudReview`, `createIncident`, `infraScaling`, `escalation`, `reconciliation`, `profile`, `opsNotif`, `serviceDetail`, `corridorPerformance`, `caseExport`, `notifSettings` |

---

## 7. DRAWER

Not used on this page. Shell-owned right aside / left drawer (account, security, notifications, contextual panels) apply unchanged.

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
- Multi-step flows preserved: `settlementDetail` (Overview → Reconciliation → Resolution → Done) and `incidentDetail` (Summary → Timeline → Resolution → Done), driven by the legacy `useFlow(total, labels)` hook (`next`/`reset`/`renderStepper`/`showStep` bridges).
- Receipt: `.receipt` (dashed box) + `.ri` (56px green icon circle) + `.receiptTitle`/`.receiptSub` — shown after actions (`useActionModal` bridge).

---

## 9. SECTION HEADERS

```tsx
<SectionHeading id="ops-status-heading" index="1.1" title="System status & uptime" description="…"
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
    {card.progress && <span className={styles.pmProgress} style={{ width: 110 }}>…</span>}
  </div>
  {card.note?.map(n => <div className={styles.kpiLine}><span>{n}</span></div>)}
</article>
```
- Grid: `.kpiGrid { repeat(4, minmax(0, 1fr)) }` → 2-up (1100px) → 1-up (576px).
- 3px top accent: `kpiCard::before` slate; `kpiFeatured` emerald (platform uptime); `kpiDanger` red (open incidents).
- Icon tones via `STAT_META` keyed by stat key — see §19.

---

## 11. FORMS

```css
.fl { display: block; font-size: 0.72rem; font-weight: 600; color: #344054; margin-bottom: 0.3rem; }
.fc { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.9rem; }
.fc:focus { outline: 0; border-color: var(--pm-green); box-shadow: 0 0 0 0.2rem rgba(18,183,106,.14); }
```
- Bootstrap overrides inside `.systemHealthPage`: `.form-check-input:checked` green, `.form-switch` green, `.progress`/`.progress-bar` green on `#eef0f4`.

---

## 12. TOAST NOTIFICATIONS

Shell-owned (`shell.module.css` `.toastContainer`/`.paymoToast`). No page-level toast layer on this page (no inline pause/resume-style actions; the legacy page had none either).

---

## 13. DROPDOWN

Bootstrap dropdowns are not used on the page; shell dropdowns apply.

---

## 14. SCROLLBAR

```css
.systemHealthPage * { scrollbar-width: thin; scrollbar-color: #c8cdd8 transparent; }
.systemHealthPage *::-webkit-scrollbar { width: 8px; height: 8px; }
.systemHealthPage *::-webkit-scrollbar-thumb { background: #c8cdd8; border-radius: 8px; }
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
| `≥ 1280px` | KPI grid 4-up; quick actions 4-up; metric tiles 3-up; floating bar centred on `calc(50% + 94px)` (compensates compact sidebar) |
| `1100–1279px` | KPI grid 2-up; panel grids and attention grid 1-up; floating bar `left: 50%` |
| `768–1099px` | Hero keeps two columns (narrowed); quick-action card stacks; table toolbar stacks |
| `< 768px` | Hero single column; section actions full width; quick grid 2-up; floating bar becomes bottom bar spanning the viewport; content padding `1rem 1rem 5.5rem` |
| `< 576px` | Single KPI column; metric tiles 1-up; hero buttons fill; tables `min-width: 640px` scroll in card; floating bar icon-first; modals become bottom sheets (92dvh); stepper labels hidden |

---

## 17. STATUS-TO-TONE MAP

The page uses the same `BadgeTone` union as the sibling pages:
```ts
type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
```
Ops-specific usage: Healthy/Operational/Resolved/Completed/Matched/Delivered → `badgeS`; Degraded/Delayed/Warning/Pending/Unmatched/In Progress → `badgeW`; Failed/High risk → `badgeD`; info/low risk/scaling events → `badgeI`; AI suggestions → `badgeP`. Status is always text + badge — never colour alone.

---

## 18. MISC COMPONENTS

- **Hero banner** — navy→emerald gradient `linear-gradient(115deg, #0b1322 0%, #123a2c 60%, #0d5c38 100%)`, two decorative orbs, eyebrow pills ("Operations command center" + live status pill), h1 "System Health & Operations", primary CTA "Run health check", secondary CTAs "Global status" and "Create incident", glass **hero snapshot**: bell → `opsNotif`, gear → `notifSettings`, avatar → `profile`, big uptime value, detail line, 3-metric row (success rate / API P95 / open incidents).
- **Status notice** (`.statusNotice`) — amber callout shown only when the API fetch fails; content falls back to `initialMockData` ("Using the latest local operating snapshot").
- **KPI pulse** — 4 KPI cards: platform uptime (featured), transaction success (progress bar), API response P95, open incidents (danger accent + 3 notes).
- **Attention grid** (`.attentionGrid`) — Action center (3 rows: settlement batch → `settlementDetail`, fraud FP → `fraudModel`, API P99 → `apiPerformance`) + Smart guidance (3 rows: auto-scaling → `infraScaling`, fraud weekend → `fraudModel`, reconciliation → `reconciliation`; plus incident row → `incidentDetail`) with AI badge; quick action card (8 shortcuts).
- **Utility box** (`.ub`) — `#fafbfd` inset panel used inside cards (service table, regional status, failure breakdown, webhook stats, reconciliation summary, review queue, scaling events).
- **Summary boxes** (`.summaryBox`, `-Info/-Warn/-Danger/-Accent`) and **mini stats** (`.miniStat`, `.miniStatBig`, `.miniStatLabel`) — used inside modals (settlement detail, fraud console, API performance).
- **Metric tiles** (`.metricTiles`) — 3-up soft tiles for live transaction metrics (txns / volume / success) and fraud KPIs (alerts / blocked / review queue).
- **Floating command bar** — fixed, `left: calc(50% + 94px)`, white glass, primary "Run health check"; Incidents / Live feed / Fraud queue / Audit log; icon-first on mobile.
- **Page footer** — "PayMo operations command center", Support (plain `<a>`) / Preferences (`Link`) links, version `v1.17.0`.
- **Stat rows** (`.sr`) — row label + right-aligned badge/strong; used for regional status, failure reasons, webhooks, reconciliation, review queue, scaling events.

---

## 19. IMPLEMENTATION ARCHITECTURE

Two styling layers, same as every refined transaction page:

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Ops page | `system-health/pages/OpsSystem.tsx` | Hero, KPI pulse, attention centre, transaction health, API health, settlement, fraud ops, infrastructure, queue & audit, floating bar, footer |
| Ops modals | `system-health/components/OpsSystemModals.tsx` | 30 Modal shells with flows/tabs/busy/receipt state, steppers |
| Business theme contract | `system-health/styles/systemHealth.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

### Current reusable mapping

| Business pattern | Ops implementation |
|---|---|
| Fixed 264px navy rail + compact state | AppShell sidebar (not rendered locally) |
| Sticky/translucent compact topbar | AppShell topbar (not rendered locally) |
| `pm-banner-hero` | `.heroBanner` + `.heroContent` + `.heroSnapshot` + `.heroMetricRow` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.8`) |
| `pm-card` | `.card` — white, 16px, `#e6e9f0`, dual-layer shadow |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon`, `.kpiValue`, `.kpiFoot`, `.kpiFeatured`/`.kpiDanger` accents |
| Soft status badge | `.badge`, `.badgeS/W/D/I/P` |
| Primary/secondary button | `.btnPmP` / `.btnPm`, `.btnPmD`, `.btnPmA`, `.btnSm` |
| Operational list card | `.listCard`, `.cardHeader`, `.cardKicker`, `.actionRow`, `.actionRowMain` |
| Business table + toolbar | `.tableCard`, `.tableToolbar`, `.tableTitle`, `.tableScroll`, `.tbl` |
| Quick-action shortcut card | `.quickActionCard`, `.quickActionIntro`, `.quickGrid`, `.quickBtn` |
| Floating quick-action bar | `.floatingBar`, `.floatingPrimary` |
| Segmented tab pills | `.pills`, `.pillActive` (modal tab panels) |
| Modal/wizard | Page-scoped `Modal` layer (visual contract equals shared `ModalShell`) |
| Shell toast | `.toastContainer`, `.paymoToast` (shell) |
| Drawer/context panel | shell `LeftDrawer` / `RightAside` |

### KPI metadata (`STAT_META`)
| stat key | Icon | Tone |
|----------|------|------|
| `uptime` | `bi-shield-check` | `#e7f8ef` bg / `#067647` icon; card gets `kpiFeatured` accent |
| `success` | `bi-check2-circle` | `#e7f8ef` bg / `#067647` icon |
| `p95` | `bi-speedometer2` | `#e8f1fe` bg / `#175cd3` icon |
| `incidents` | `bi-exclamation-triangle` | `#fee4e2` bg / `#b42318` icon; card gets `kpiDanger` accent |
| fallback | `bi-bar-chart` | `#fafbfd` bg / `#475467` icon |

---

## 20. MODAL INVENTORY (30 / 30 REACHABLE)

All 30 shells live in `OpsSystemModals.tsx`; every key below is triggered from the page:

| # | Modal | Size | Reachable from |
|---|-------|------|----------------|
| 1 | `globalStatus` | xl | Hero secondary, regional status card, section 1.1 |
| 2 | `incidentQueue` | xl | Attention header, quick actions, floating bar |
| 3 | `runHealthCheck` | md | Hero primary, quick actions, floating bar |
| 4 | `settlementDetail` | xl | Attention row, quick actions, 1.5 header, batch rows |
| 5 | `fraudModel` | lg | Attention rows, suggestions, quick actions, 1.6 header, rule rows |
| 6 | `apiPerformance` | xl | Attention row, quick actions, 1.4 header |
| 7 | `webhookMonitor` | lg | 1.4 header, webhook card |
| 8 | `fraudAlertQueue` | xl | 1.6 header, floating bar |
| 9 | `fraudReview` | md | Manual review queue card |
| 10 | `incidentDetail` | lg | Smart guidance incident row |
| 11 | `createIncident` | md | Hero secondary |
| 12 | `partnerApiDetail` | lg | Partner API table rows |
| 13 | `infraDetail` | lg | Infrastructure table rows |
| 14 | `infraScaling` | md | Suggestions, quick actions, 1.7 header, scaling card |
| 15 | `capacityPlanning` | lg | 1.7 header |
| 16 | `ticketDetail` | lg | Quick actions, 1.8 header, ticket rows |
| 17 | `escalation` | md | 1.8 header, ticket rows |
| 18 | `auditLog` | xl | Quick actions, audit card, floating bar |
| 19 | `liveTransactionFeed` | xl | 1.3 header, floating bar |
| 20 | `failureAnalysis` | lg | 1.3 header, failure breakdown card |
| 21 | `corridorDetail` | lg | Corridor table rows |
| 22 | `reconciliation` | md | Suggestions, 1.5 header, reconciliation card |
| 23 | `profile` | md | Hero snapshot avatar (re-wired this refinement) |
| 24 | `slaReport` | lg | 1.1 header |
| 25 | `uptimeHistory` | lg | 1.1 header |
| 26 | `opsNotif` | md | Hero snapshot bell (re-wired this refinement) |
| 27 | `serviceDetail` | md | Service table rows |
| 28 | `corridorPerformance` | md | Corridor table rows (re-wired this refinement) |
| 29 | `caseExport` | md | Audit card (re-wired this refinement) |
| 30 | `notifSettings` | md | Hero snapshot gear, notifications card (re-wired this refinement) |

Cross-modal navigation (doAction spinner → receipt, 4-step flows, pill tabs, PIN-free forms) preserved from the original `OpsSystemModals` bridge. `OpsSystemModals.tsx` stays at HEAD except a surgical dead-code cleanup (7 pre-existing TS6133 unused declarations removed — no behaviour change, no formatting churn).

---

## 21. CODE-COMPLETE CHECKLIST (refined August 30, 2026)

### Theme and typography
- [x] Emerald `#12b76a` is the only primary interaction colour.
- [x] `#0b1322` navigation rail and `#f2f4f8` canvas (via AppShell).
- [x] Cool neutral borders `#e6e9f0`; no warm/cream tokens remain in `systemHealth.module.css`.
- [x] Semantic colours only for status: warning `#f79009`, danger `#f04438`, info `#2e90fa`, violet `#7a5af8`.
- [x] Inter for body/controls, Sora for headings/KPI values (fonts loaded once in `src/routes/__root.tsx`).

### Shell and page hierarchy
- [x] Page renders content only — no second sidebar, header, breadcrumb or page bar (legacy `min-height: 100vh` gradient shell removed).
- [x] One full-width dark executive hero before all sections (gradient, orbs, eyebrow pills, glass snapshot with bell/gear/avatar actions and metric row).
- [x] Eight numbered sections: 1.1 System status & uptime, 1.2 Needs your attention (+ quick actions), 1.3 Transaction health monitor, 1.4 API & integration health, 1.5 Settlement & reconciliation, 1.6 Fraud & security operations, 1.7 Infrastructure & uptime, 1.8 Operations queue, support & audit.
- [x] Four KPI cards with per-card icon tone, featured/danger top accents, progress bar and note lines.
- [x] Attention + AI suggestions as scannable list cards with one primary row action each; 8 quick actions in the shortcut card.
- [x] All 7 legacy sections preserved (services/regions, corridors/failure reasons, partner APIs/webhooks, settlement batches/reconciliation, fraud rules/review queue, infra/scaling, tickets).
- [x] Floating command bar on desktop, icon-first bottom bar on mobile; page footer.
- [x] Content centred at 1500px max width.

### Cards, forms, tables and icons
- [x] Cards 16px radius, subtle border, restrained elevation.
- [x] Controls 9–10px radius, green focus ring, clear disabled states.
- [x] Explicit `type="button"` on all non-submit buttons.
- [x] Tables use uppercase compact headers, card-scoped horizontal scroll, non-colour status text, mono references.
- [x] Bootstrap Icons throughout; icons support labels and are never the sole status signal.
- [x] Quick actions and hero buttons are real buttons with keyboard access.

### Modals, steppers and drawers
- [x] Dialogs use `role="dialog"`, `aria-modal`, labelled title, dark blurred backdrop, sticky header/footer.
- [x] Escape closes the active dialog, focus returns to its trigger, body scroll locks while open.
- [x] Mobile dialogs become bottom sheets with 92dvh max height.
- [x] Steppers show completed/current/upcoming states with green connectors and focus halo.
- [x] Loading overlay, receipts, tab panels and nested workflows preserved from the legacy bridge.
- [x] All 30 modal shells reachable (audited — 8 previously orphaned shells re-wired).
- [x] `prefers-reduced-motion` respected.

### Responsive implementation
- [x] `≥ 1280px`: 4-column KPI grid, 4-up quick actions, centred floating bar with sidebar offset.
- [x] `1100–1279px`: 2-column KPI grid, off-canvas shell nav, floating bar re-centred.
- [x] `768–1099px`: hero two-column, panels single-column.
- [x] `< 768px`: single-column hero/operational cards, stacked toolbars, full-width section actions, bottom-bar command bar.
- [x] `< 576px`: single KPI column, icon-first command bar, bottom-sheet dialogs, shrunken steppers.

---

## 22. MANUAL VISUAL-QA CHECKLIST

Run against `/pm/app/ops-health` before release — deliberate review gates.

### Desktop — 1440 × 900
- [ ] Sidebar/topbar come from the shell; hero aligns with transfer-overview hero (gradient, radius, type scale).
- [ ] Four KPI cards equal height; long badge text truncates without breaking the grid.
- [ ] Tables scroll inside their cards; the document never scrolls horizontally.
- [ ] Floating bar does not cover footer or table controls.
- [ ] Hero snapshot metrics match the data (uptime / success / P95 / open incidents).

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] KPI grid becomes 2-up; panel grids single-column; hero still two-column at 1024.
- [ ] Modals remain centred and scrollable; footer actions visible.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy unclipped; action buttons ≥ 40px target; first button full-width.
- [ ] Quick actions 2-up; metric tiles single column; tables scroll inside cards.
- [ ] Floating bar icon-first with labelled primary; content reachable behind it.
- [ ] Modals open as bottom sheets with sticky footer actions.

### Interaction and accessibility
- [ ] Keyboard reaches hero, KPIs, tables, floating bar, footer in visual order.
- [ ] Focus visible on cards, buttons and inputs; quick actions activate with Enter/Space.
- [ ] Run the Settlement Batch stepper to completion (4 steps → receipt).
- [ ] Open the Incident Management stepper (4 steps) from the suggestions row.
- [ ] Open every modal via its trigger; verify Escape, backdrop click, focus return.
- [ ] At 200% zoom no two-dimensional page scrolling.
- [ ] Reduced motion disables pulse/pop/fade transitions.

---

## 23. RELEASE GATES

- [x] Targeted Biome check passes for `OpsSystem.tsx` (August 30, 2026). CSS lint state is at parity with the reference pages (`noImportantStyles` on the `.heroLive` override + `prefers-reduced-motion` block — same intentional patterns as `transfer-overview.module.css`).
- [x] TypeScript: zero diagnostics in `transaction-dashboard/system-health/` files (7 pre-existing TS6133 dead-code errors in `OpsSystemModals.tsx` removed surgically — no behaviour change).
- [x] CSS class audit: every `styles.*` reference in `OpsSystem.tsx` + `OpsSystemModals.tsx` resolves in `systemHealth.module.css` (no missing classes; composed-selector pairs `stepActive`/`stepDone`/`quickActionIntro`/`tableTitle` verified present).
- [x] Modal audit: 30/30 shells reachable from the page.
- [x] 8 orphaned shells (`profile`, `opsNotif`, `notifSettings`, `incidentDetail`, `createIncident`, `fraudReview`, `corridorPerformance`, `caseExport`) re-wired through hero snapshot, attention, quick actions and section actions.
- [x] Legacy lint findings in `OpsSystemModals.tsx` (a11y etc., ~20 findings) remain at HEAD parity — out of scope, matching the ComplianceModals/AnalyticsModals policy.
- [x] Content preserved from legacy 1.17 (services, regions, corridors, failure reasons, partner APIs, webhooks, settlement batches, reconciliation, fraud rules, review queue, infra, scaling, tickets, audit).
- [x] Production client/server build passes.
- [x] Route responds at `/pm/app/ops-health` with SSR markers in the local preview.
- [x] Vitest suite passes (9/9).
- [x] `git diff --check` clean.
- [ ] Manual visual-QA checklist (§22) signed off by a reviewer.
