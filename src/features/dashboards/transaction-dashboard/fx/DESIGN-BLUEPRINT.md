# PayMo Business → FX Dashboard Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Sibling references: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md` (canonical page), `initiate-transfer/`
> Implementation targets: `transaction-dashboard/fx/` (`FxManagement.tsx`, `FxModals.tsx`, `fx.module.css`)
> Content reframe source: `fx/FX_REBUILD_PLAN.md` (facilitator edition — three worlds)
> Last reconciled: August 30, 2026

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.fxPage {
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

- Every token above matches `transfer-overview.module.css` / `initiateTransfer.module.css` exactly — the three refined transaction pages are visually interchangeable.
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
| Table ref code | mono | `0.66rem` | — | `ui-monospace, SFMono-Regular, Menlo` |
| Badge | Inter | `0.7rem` | 600 | `border-radius: 99px` |
| Button | Inter | `0.86rem` | 600 | small `0.8rem` |
| Form label | Inter | `0.72–0.8rem` | 600 | `#344054` |
| Form input | Inter | `0.9rem` | 400 | |
| Quick action label | Inter | `0.69rem` | 650 | icon `1rem` |
| Row title (attention) | Inter | `0.77rem` | 650 | `#344054`, ellipsis |
| Row sub | Inter | `0.68rem` | 400 | `--pm-muted` |
| Floating bar | Inter | `0.69rem` | 650 | |
| Footer | Inter | `0.66rem` | 400 | `--pm-muted` |

---

## 3. LAYOUT SHELL

The FX route `/pm/app/fx` (`src/routes/pm/app.fx.tsx`) renders `FxManagement` inside the shared authenticated AppShell.

- **Owned by AppShell** (never re-render locally): fixed 264px navy sidebar (`#0b1322`) with 76px compact state, 62px translucent topbar with breadcrumb/search/account/security/notifications/user menu, toasts, drawers.
- **Owned by the page**: everything inside `.content` — hero, scope bar, numbered sections, tables, floating command bar, footer.
- Page root `.fxPage` is a plain block (`font-family`, background `#f2f4f8`) — no flex row, no local sidebar/header.
- `.content`:
```css
.fxPage .content {
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
.btnSm { padding: 5px 12px; font-size: 0.8rem; border-radius: 8px; }
.textButton { color: var(--pm-green-dark); font-weight: 700; border: 0; background: transparent; }
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
| `.badgeM` | `#f2f4f8` | `#475467` |

Badges are the primary non-colour status signal inside tables and rows; icons in badges are decorative.

### Chips / destination chips
- `.destChip` — pill for conversion destinations; `.destChipFloat` (violet, `→ float · RB-…`) and `.destChipWallet` (blue, `→ Business/Virtual wallet`).
- `.worldTag` / `.worldTagCust` (green) / `.worldTagMy` (blue) — World A/B tags on the activity feed.

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
.tbl code { color: #667085; font-family: ui-monospace, ...; font-size: 0.66rem; }
```
- Tables live inside `.tableCard` with `.tableToolbar` (title + tools), `.tableScroll` (horizontal overflow only inside the card — never the document), and `.tableFooter` (count + link-style action).
- `.tableSearch` input — 190px, `#fafbfd` bg, green focus ring; used on the diaspora settlements table.
- Empty states: `.emptyState` (icon + strong + span) rendered as a `colSpan` row for both scope-empty and search-empty cases.

---

## 6. MODAL (page-scoped MBox layer)

The FX modals use the page-scoped `MBox` shell in `FxModals.tsx` (a deliberate choice — 25 legacy shells with `results`/`busy`/`flows`/`tabs` state were restyled in place rather than migrated, preserving behaviour). The **visual contract is identical** to the shared modal primitives:

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

### MBox API (FxModals.tsx)
```tsx
<MBox id="convertModal" active={active} title={<ReactNode>} size="md" | "lg" | "xl" onClose={fn}>
  {children}
  footer={<ReactNode>}
</MBox>
```
- Backdrop click closes; Bootstrap `.btn-close` restyled to a 34px `#f2f4f8` circular close.
- Mobile: bottom sheet, `max-height: 92dvh`, `border-radius: 16px 16px 0 0`, full-width footer buttons.
- Modal hygiene (added at page level, matching transfer-overview): body scroll lock while open, `Escape` closes, focus returns to the trigger.
- `.loadingOv`/`.spinner`/`.loadingLabel` = BusyOverlay; `.fstepActive` = step fade; `.fl`/`.fc` = legacy form label/control (business-styled).

---

## 7. DRAWER

Not used on the FX page. Shell-owned right aside / left drawer (security, API keys, contextual panels) apply unchanged.

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
- PIN input: `.pinRow` + `.pinInput` (48×56px, Sora 24px, green focus ring).
- Receipt: `.receipt` (dashed box) + `.ri` (56px green icon circle) + `.receiptTitle`/`.receiptSub`.

---

## 9. SECTION HEADERS

```tsx
<SectionHeading id="fx-rates-heading" index="1.4" title="Rates, locks & market" description="…"
  action={<div className={styles.headerButtonRow}>…buttons…</div>} />
```
- `.sectionHeading` — flex, `align-items: flex-end`, gap 1.25rem, `margin-bottom: 1rem`.
- `.sectionIndex` — 35px ink square with the number (`1.1`–`1.5`).
- `.dashboardSection { padding-top: 2.2rem; }` (1.7rem under 768px).
- On mobile the action row goes full-width and buttons become equal flex columns.

---

## 10. KPI CARD

```tsx
<article className={`${styles.card} ${styles.kpiCard} ${styles.kpiFeatured} ${styles.kpiWarning}`}>
  <div className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}><i className="bi bi-currency-exchange" /></div>
  <div className={styles.kpiMeta}><span>FOREIGN CURRENCY HELD</span><small>Live</small></div>
  <strong className={styles.kpiValue}>KES 11.85M</strong>
  {stat.progress && <div className={styles.kpiProgress}><div className={styles.pmProgress}><div className={styles.pmProgressBar} style={{width, background}} /></div></div>}
  <div className={styles.kpiFoot}><span className={`${styles.badge} ${styles.badgeS}`}>…</span><span>…</span></div>
</article>
```
- Grid: `repeat(6, 1fr)` → 3 → 1 columns (1279px / 575px).
- 3px top accent: `kpiCard::before` slate; `kpiFeatured` green (first card); `kpiWarning` amber (awaiting-conversion card).
- Icon tones via `STAT_META` keyed by label — see §19.

---

## 11. FORMS

```css
.fl { display: block; font-size: 0.72rem; font-weight: 600; color: #344054; margin-bottom: 0.3rem; }
.fc { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.9rem; }
.fc:focus { outline: 0; border-color: var(--pm-green); box-shadow: 0 0 0 0.2rem rgba(18,183,106,.14); }
```
- Bootstrap overrides inside `.fxPage`: `.form-check-input:checked` green, `.form-switch` green, `.progress`/`.progress-bar` green on `#eef0f4`.

---

## 12. TOAST NOTIFICATIONS

Shell-owned (`shell.module.css` `.toastContainer`/`.paymoToast`). Page does not add its own toast layer.

---

## 13. DROPDOWN

Bootstrap dropdowns are not used on the page (all selection via pills/segmented controls); shell dropdowns apply.

---

## 14. SCROLLBAR

```css
.fxPage * { scrollbar-width: thin; scrollbar-color: #c8cdd8 transparent; }
.fxPage *::-webkit-scrollbar { width: 8px; height: 8px; }
.fxPage *::-webkit-scrollbar-thumb { background: #c8cdd8; border-radius: 8px; }
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
All animations gated by `@media (prefers-reduced-motion: reduce)`.

---

## 16. RESPONSIVE BREAKPOINTS

| Range | Behaviour |
|-------|-----------|
| `≥ 1280px` | 6-column KPI grid; quick actions 6-up; floating bar centred on `calc(50% + 94px)` (compensates compact sidebar) |
| `1100–1279px` | KPI grid 3-up; quick actions 3-up; floating bar `left: 50%` |
| `768–1099px` | Hero keeps two columns (narrowed); panel grid 1-up; analytics 2-up |
| `< 768px` | Hero single column; section actions full width; attention grid 1-up; table toolbar stacks, search full width; scope bar stacks (pills scroll horizontally); floating bar becomes bottom bar spanning the viewport |
| `< 576px` | Single KPI column; hero buttons fill; tables `min-width: 640px` scroll in card; floating bar icon-first (labels hidden, primary keeps label); modals become bottom sheets (92dvh); stepper labels hidden; PIN inputs shrink |

---

## 17. STATUS-TO-TONE MAP

The page uses the same `BadgeTone` union as the sibling pages:
```ts
type BadgeTone = "badgeS" | "badgeW" | "badgeD" | "badgeI" | "badgeP";
```
FX-specific usage: Completed/Active/Converted/Granted → `badgeS`; Pending/Awaiting/Paused/Low → `badgeW`; Failed/Settled-as-final → `badgeD`; In-review → `badgeI`; rate-lock protection → `badgeP`. Slate `badgeM` is available for neutral metadata. Status is always text + badge — never colour alone.

---

## 18. MISC COMPONENTS

- **Hero banner** — navy→emerald gradient `linear-gradient(115deg, #0b1322 0%, #123a2c 60%, #0d5c38 100%)`, two decorative orbs, eyebrow pills, primary (white) + secondary (glass) buttons, glass snapshot with 3-metric row.
- **Scope bar** (`.scopeBar`) — white card under the hero holding: World segmented switch (`Customer FX` / `My Wallets & FX`), business selector pills (`All · 30 · 209`), scope tag, sandbox-preview tag (when preview data), profile avatar button.
- **Status notice** (`.statusNotice`) — amber callout shown only when the API fetch fails; content falls back to mock data.
- **Wallet structure** (`.walletTree`, `.walletNode`, `.walletArrow`) — connected pill hierarchy: Master → Business Wallet → Virtual Wallet → Sub-wallets → Floats.
- **Business source cards** (`.bizSourceCard`) — per-business conversion-limit cards; the wallet cards reuse it as a real `<button>` (`.bizSourceCardBtn`) with a nested visual "Manage" span.
- **Sub-wallet cards** (`.subWalletCard`) — currency icon, balance, KES equivalent, 24h change, status badge, Convert/Top up/Withdraw.
- **Rate-lock strip** (`.lockStrip`) — "Worth locking" AI suggestion bar (green soft).
- **Permissions panel** (`.permItem`, `.permDot`, `.permOk`/`.permPending`) — scope list with Granted badge / Request access button.
- **Floating command bar** — fixed, `left: calc(50% + 94px)`, white glass, primary "Instant convert"; icon-first on mobile.
- **Page footer** — "Protected by PayMo secure transaction controls", Support/Preferences links, version.
- **Utility box** (`.ub`) — `#f2f4f8` inset panel used inside cards (rates table, alert lists, analytics).
- **Summary boxes** (`.summaryBox`, `-Info/-Warn/-Danger/-Accent`) and **mini stats** (`.miniStat`, `.miniStatBig`, `.miniStatLabel`) — used inside modals.

---

## 19. IMPLEMENTATION ARCHITECTURE

Two styling layers, same as every refined transaction page:

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| FX page | `fx/pages/FxManagement.tsx` | Hero, scope bar, KPI pulse, action centre, World A/B sections, rates/locks, rules/permissions, activity, floating bar, footer |
| FX modals | `fx/components/FxModals.tsx` | 25 MBox shells with flows/results/tabs/busy state, receipts, PIN, steppers |
| Business theme contract | `fx/styles/fx.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

### Current reusable mapping

| Business pattern | FX implementation |
|---|---|
| Fixed 264px navy rail + compact state | AppShell sidebar (not rendered locally) |
| Sticky/translucent compact topbar | AppShell topbar (not rendered locally) |
| `pm-banner-hero` | `.heroBanner` + `.heroContent` + `.heroSnapshot` + `.heroMetricRow` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.5`) |
| `pm-card` | `.card` — white, 16px, `#e6e9f0`, dual-layer shadow |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue`, `.kpiFoot`, `.kpiProgress` |
| Soft status badge | `.badge`, `.badgeS/W/D/I/P/M` |
| Primary/secondary button | `.btnPmP` / `.btnPm`, `.textButton` |
| Operational list card | `.listCard`, `.cardHeader`, `.cardKicker`, `.actionRow`, `.actionRowMain` |
| Business table + toolbar | `.tableCard`, `.tableToolbar`, `.tableTitle`, `.tableSearch`, `.tableScroll`, `.tbl`, `.tableFooter`, `.emptyState` |
| Quick-action shortcut card | `.quickActionCard`, `.quickActionIntro`, `.quickGrid`, `.quickBtn` |
| Floating quick-action bar | `.floatingBar`, `.floatingPrimary` |
| Scope/filter pills | `.pills`, `.pill`, `.pillActive`, `.worldSwitch`, `.worldBtn(Active)`, `.bizBar` |
| Modal/wizard | Page-scoped `MBox` layer (visual contract equals shared `ModalShell`) |
| Shell toast | `.toastContainer`, `.paymoToast` (shell) |
| Drawer/context panel | shell `LeftDrawer` / `RightAside` |

### KPI metadata (`STAT_META`)
| Label | Icon | Tone |
|-------|------|------|
| FOREIGN CURRENCY HELD | `bi-currency-exchange` | `kpiIconBlue` |
| BEST RATE TODAY | `bi-graph-up-arrow` | `kpiIconGreen` |
| DIASPORA → FLOAT (MTD) | `bi-bank2` | `kpiIconGreen` |
| FX FEES PAID (MTD) | `bi-piggy-bank` | `kpiIconAmber` |
| RATE LOCKS ACTIVE | `bi-shield-lock` | `kpiIconViolet` |
| AWAITING CONVERSION | `bi-hourglass-split` | `kpiIconRed` (card also gets `kpiWarning` accent) |
| fallback | `bi-wallet2` | `kpiIconBlue` |

---

## 20. MODAL INVENTORY (25 / 25 REACHABLE)

All modal shells live in `FxModals.tsx`; every id below is triggered from the page (hero, scope bar, action centre, quick actions, section actions, table rows, floating bar):

| # | Modal | Reachable from |
|---|-------|----------------|
| 1 | `convertModal` | Hero, quick actions, rates table, sub-wallet, section actions |
| 2 | `hedgeModal` | Hero, suggestions, quick actions, lock strip, section actions, floating bar |
| 3 | `newWalletModal` | Hero, suggestions, quick actions, sub-wallet header |
| 4 | `bulkFxModal` | Quick actions, section actions, table footer |
| 5 | `swapModal` | Quick actions |
| 6 | `rateAlertsModal` | Quick actions, attention, rates card, floating bar, sections |
| 7 | `fxTransferModal` | Quick actions, cross-border table, floating bar |
| 8 | `fxStatementModal` | Quick actions, analytics export, activity header |
| 9 | `walletDetailModal` | Quick actions, wallet cards, wallet tree |
| 10 | `walletTopUpModal` | World B header, sub-wallet cards |
| 11 | `walletWithdrawModal` | World B header, sub-wallet cards |
| 12 | `diasporaConvertModal` | Attention, World A header/table |
| 13 | `fxReceiptModal` | Conversion/activity/cross-border rows |
| 14 | `fxLimitsModal` | World A limits card |
| 15 | `fxAccessModal` | Pulse header, permissions card, scope bar profile area |
| 16 | `fxHealthModal` | Pulse header |
| 17 | `fxNotifModal` | Hero (Notifications) |
| 18 | `attentionModal` | Action centre header |
| 19 | `profileModal` | Scope bar avatar |
| 20 | `fxMarketModal` | Rates section header |
| 21 | `fxRiskModal` | Rate locks card (Exposure) |
| 22 | `fxAnalyticsModal` | Rate locks card (Analytics) |
| 23 | `rateLockModal` | Rate locks card (Manage locks) |
| 24 | `fxAutomationModal` | Rules section header, auto-rules panel |
| 25 | `fxPreferencesModal` | Wallet preferences panel |

Cross-modal navigation (doAction spinner → receipt, steppers, tab panels, PIN) preserved from the original `FxModals` bridge.

---

## 21. CODE-COMPLETE CHECKLIST (refined August 30, 2026)

### Theme and typography
- [x] Emerald `#12b76a` is the only primary interaction colour.
- [x] `#0b1322` navigation rail and `#f2f4f8` canvas (via AppShell).
- [x] Cool neutral borders `#e6e9f0`; no warm/cream tokens remain in `fx.module.css`.
- [x] Semantic colours only for status: warning `#f79009`, danger `#f04438`, info `#2e90fa`, violet `#7a5af8`.
- [x] Inter for body/controls, Sora for headings/KPI values (fonts loaded once in `src/routes/__root.tsx`).

### Shell and page hierarchy
- [x] Page renders content only — no second sidebar, header, breadcrumb or page bar.
- [x] One full-width dark executive hero before all sections (gradient, orbs, eyebrow pills, snapshot with metric row).
- [x] Five numbered sections: 1.1 FX pulse, 1.2 Needs your attention (+ quick actions), 1.3 Customer FX / My wallets (world switch), 1.4 Rates, locks & market, 1.5 Rules, permissions & activity.
- [x] Scope bar preserves the World switch (Customer FX / My Wallets & FX) and business selector (All / Land Buyers LTD / Company 2) with live scope tag.
- [x] Six KPI cards with per-card icon tone, featured/warning top accents, optional progress bars.
- [x] Attention + suggestions as scannable list cards with one primary row action each; 8 quick actions in the shortcut card.
- [x] Diaspora table is searchable (reference/payer) with scope-empty and search-empty states and a footer count.
- [x] World A: diaspora & card settlements, conversion history with destination chips, per-business conversion limits.
- [x] World B: wallet structure (cards + connected tree), currency sub-wallets, cross-border payments.
- [x] Rates card: live retail rates + alert panel; locks card: worth-locking strip, active locks, FX cost chart + key metrics + exposure/analytics actions.
- [x] Rules card: auto-conversion rules, alert settings, wallet preferences; permissions panel; recent FX activity with world tags.
- [x] Floating command bar on desktop, icon-first bottom bar on mobile; page footer.
- [x] Content centred at 1500px max width.

### Cards, forms, tables and icons
- [x] Cards 16px radius, subtle border, restrained elevation.
- [x] Controls 9–10px radius, green focus ring, clear disabled states.
- [x] Explicit `type="button"` on all non-submit buttons.
- [x] Tables use uppercase compact headers, card-scoped horizontal scroll, non-colour status text, mono references.
- [x] Bootstrap Icons throughout; icons support labels and are never the sole status signal.
- [x] Clickable wallet cards are real buttons (`bizSourceCardBtn`) with keyboard access.

### Modals, steppers and drawers
- [x] Dialogs use `role="dialog"`, `aria-modal`, labelled title, dark blurred backdrop, sticky header/footer.
- [x] Escape closes the active dialog, focus returns to its trigger, body scroll locks while open.
- [x] Mobile dialogs become bottom sheets with 92dvh max height.
- [x] Steppers show completed/current/upcoming states with green connectors and focus halo.
- [x] Loading overlay, receipts, tab panels, PIN advance and nested workflows preserved.
- [x] All 25 modal shells reachable (audited — including `fxRiskModal`, newly wired from the Rate locks card).
- [x] `prefers-reduced-motion` respected.

### Responsive implementation
- [x] `≥ 1280px`: 6-column KPI grid, 6-up quick actions, centred floating bar with sidebar offset.
- [x] `1100–1279px`: 3-column KPI grid, off-canvas shell nav, floating bar re-centred.
- [x] `768–1099px`: hero two-column, panels single-column, analytics two-up.
- [x] `< 768px`: single-column hero/operational cards, stacked toolbars, full-width section actions, scope bar stacks.
- [x] `< 576px`: single KPI column, icon-first command bar, bottom-sheet dialogs, shrunken steppers/PIN.

---

## 22. MANUAL VISUAL-QA CHECKLIST

Run against `/pm/app/fx` before release — deliberate review gates.

### Desktop — 1440 × 900
- [ ] Sidebar/topbar come from the shell; hero aligns with transfer-overview hero (gradient, radius, type scale).
- [ ] Six KPI cards equal height; long badge text truncates without breaking the grid.
- [ ] Scope bar: world switch, business pills, scope tag and avatar sit on one line.
- [ ] Tables scroll inside their cards; the document never scrolls horizontally.
- [ ] Floating bar does not cover footer or table controls.
- [ ] Hero snapshot metrics match the data (4 sub-wallets · 129.45 · KES 8.42M).

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] KPI grid becomes 3-up; panel grid single-column; hero still two-column at 1024.
- [ ] World/business pills scroll horizontally without wrapping into illegibility.
- [ ] Modals remain centred and scrollable; footer actions visible.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy unclipped; action buttons ≥ 40px target; first button full-width.
- [ ] Scope bar stacks; pills scroll; profile avatar full-width row end.
- [ ] Diaspora search stretches full width; table scrolls inside card.
- [ ] Floating bar icon-first with labelled primary; content reachable behind it.
- [ ] Modals open as bottom sheets with sticky footer actions.
- [ ] Wallet structure tree wraps into connected tiles; arrows still legible.

### Interaction and accessibility
- [ ] Keyboard reaches hero, scope bar, KPIs, tables, floating bar, footer in visual order.
- [ ] Focus visible on cards, buttons and inputs; wallet cards activate with Enter/Space.
- [ ] Open each World, each business scope; verify tables re-filter and empty states appear.
- [ ] Search diaspora table by `PLT`, `ORD`, and a bogus string (empty state).
- [ ] Run Convert, Rate Lock and Cross-Border steppers to completion (receipt + download).
- [ ] Open every modal via its trigger; verify Escape, backdrop click, focus return.
- [ ] At 200% zoom no two-dimensional page scrolling.
- [ ] Reduced motion disables pulse/pop/fade transitions.

---

## 23. RELEASE GATES

- [x] Targeted Biome check passes for `FxManagement.tsx` (August 30, 2026). CSS lint state is at parity with the reference pages (`noImportantStyles`/`noDescendingSpecificity` on the same intentional patterns as `transfer-overview.module.css`).
- [x] TypeScript: zero diagnostics in `transaction-dashboard/fx/` files.
- [x] CSS class audit: every `styles.*` reference in `FxManagement.tsx` + `FxModals.tsx` resolves in `fx.module.css` (no missing classes).
- [x] Modal audit: 25/25 shells reachable from the page.
- [x] `fxRiskModal` reachability restored (was orphaned before the refinement).
- [x] Facilitator content reframe (three worlds, business selector, wallet structure, rate locks, permission scopes) preserved from `FX_REBUILD_PLAN.md`.
- [ ] Production client/server build passes.
- [ ] Route responds at `/pm/app/fx` with SSR markers in the local preview.
- [ ] Vitest suite passes.
- [ ] `git diff --check` clean.
- [ ] Manual visual-QA checklist (§22) signed off by a reviewer.
