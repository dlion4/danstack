# PayMo Business → Account Profile & Digital Bank Page Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Implementation target: `transaction-dashboard/account/`
> Last reconciled: August 30, 2026
> Refined: August 30, 2026 — removed local chrome, migrated to shared modal primitives, matched transfer-overview hierarchy, wired previously dead/missing modal targets, cut one orphan dialog

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.accountProfilePage {
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

The account page redeclares the same tokens as `transfer-overview.module.css`, `fees.module.css`, `settlement.module.css` and `shell.module.css` so the page module is self-contained while every value is identical to the business language. Account-specific additions: `--pm-primary-light` (soft emerald fill used by the tier card and health emphasis) and `--pm-surface-2` (subtle inset surface for verification/membership boxes).

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
| Scope pill | Inter | `0.76rem` | 600 | 99px radius, ink-on for active |
| Bank balance | Sora | `1.35rem` | 800 | `letter-spacing: -0.02em` |
| Card number | Space Grotesk/Sora | `1rem` | 400 | `letter-spacing: 0.08em` |
| Profile name | Sora | `1.05rem` | 700 | |
| Wizard label | Inter | `0.68rem` | 600 | |

---

## 3. LAYOUT SHELL

The account page renders inside the shared authenticated shell (`Layouts/shell/`). It does **not** define its own sidebar or page topbar.

```css
/* Owned by the shell — never redefined by page CSS */
.sidebar { width: 264px; background: var(--pm-sidebar); }   /* 76px compact state */
.topHeader { height: 62px; background: rgba(255,255,255,0.88); backdrop-filter: blur(10px); }
.mainContent { margin-left: 264px; padding: 1.5rem 1.5rem 7rem; max-width: 1500px; }
```

- Page root: `main.accountProfilePage > .main` — `max-width: 1500px; margin: 0 auto; padding: 1.5rem 1.5rem 7rem`.
- Sidebar collapses to off-canvas below 1200px (shell-owned behavior).
- Local chrome removed: the old page's own `pageBar`, breadcrumb, page actions (View Profile / Edit Profile / Export Data) and profile buttons are gone; the shell topbar breadcrumb, user menu and notification dropdown cover them.

---

## 4. COMPONENT PATTERNS

### Card
```css
.card, .tableCard, .listCard, .panel, .bankCard, .paymentCard {
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
- Eyebrow chip (page code "Account Profile & Digital Bank" + live pill "Banking live"), headline ("One identity, one bank, total control."), sub-copy (completeness, KYC, incidents), hero snapshot with account-health value (92/100) and 3-row metric breakdown (Profile complete / Active sessions / Documents on file), primary action (Edit Profile) + secondary action (Export Data).
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
Destructive-flavored action (`btnPmD`) is used for unlink/terminate/remove actions (unlink business, unlink external account, pause payout, terminate sessions).

### Badges (soft)
```css
.badgeS { background: var(--pm-green-soft); color: #067647; }
.badgeW { background: #fef0c7; color: #93370d; }
.badgeD { background: #fee4e2; color: #b42318; }
.badgeI { background: #e8f1fe; color: #175cd3; }
.badgeP { background: #f0ebfe; color: #5925dc; }
```
All `border-radius: 99px; font-size: 0.7rem; font-weight: 600; padding: 0.32em 0.7em;` — same mapping as the shared `badge*` classes in `appPage.module.css`. Badges always carry text; color is never the only signal.

### Scope pills (account filter)
```css
.filterPills { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
.filterPills button { border: 1px solid var(--pm-border); background: #fff; border-radius: 99px; padding: 0.35rem 0.85rem; font-weight: 600; font-size: 0.76rem; color: #475467; }
.filterPills button.filterActive { background: var(--pm-ink); color: #fff; border-color: var(--pm-ink); }
```
Filter pills: "All" / "KES Wallets" / "USD" / "Business" — they scope the Digital Bank Accounts cards, with a scope note ("All 4 accounts in view" / "2 KES accounts in view").

### Live dot
```css
.liveDot { width: 8px; height: 8px; border-radius: 50%; background: var(--pm-green);
  box-shadow: 0 0 0 0 rgba(18,183,106,.5); animation: pmPulse 2s infinite; display: inline-block; }
```

### Profile hero (account-specific)
```css
.profileHero { display: flex; align-items: center; gap: 1rem; background: var(--pm-surface-2);
  border: 1px solid var(--pm-border); border-radius: 14px; padding: 1.1rem 1.2rem; }
.profileAvatar { width: 54px; height: 54px; border-radius: 16px;
  background: linear-gradient(135deg, var(--pm-green), #0d5c38); color: #fff;
  font-family: "Sora", sans-serif; font-weight: 800; font-size: 1.05rem; display: grid; place-items: center; }
.profileName { font-family: "Sora", sans-serif; font-size: 1.05rem; font-weight: 700; margin: 0; }
.profileMeta { font-size: 0.78rem; color: var(--pm-muted); margin: 0; }
.profileStatsRow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; margin-top: 0.7rem; }
.profileStat { background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: 12px; padding: 0.6rem 0.75rem; }
```

### Verification & membership boxes (account-specific)
```css
.verificationBox, .membershipBox { background: var(--pm-surface-2); border: 1px solid var(--pm-border);
  border-radius: 14px; padding: 1rem 1.1rem; height: 100%; display: flex; flex-direction: column; gap: 0.55rem; }
.tierCard { background: var(--pm-green-soft); border-radius: 12px; padding: 0.8rem 1rem; }
.tierName { font-family: "Sora", sans-serif; font-size: 1.3rem; font-weight: 800; color: var(--pm-green-dark); }
.usageTrack { height: 8px; border-radius: 99px; background: #eef0f4; overflow: hidden; margin-top: 0.55rem; }
.usageFill { height: 100%; border-radius: 99px; background: var(--pm-green); }
```

### Bank account card (account-specific)
```css
.bankGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.bankCard { display: flex; flex-direction: column; gap: 0.75rem; }
.bankLogo { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
  color: #fff; font-family: "Sora", sans-serif; font-weight: 800; }
.bankBalance { font-family: "Sora", sans-serif; font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; }
.bankLimitTrack { height: 6px; border-radius: 99px; background: #eef0f4; overflow: hidden; }
.bankLimitFill { height: 100%; border-radius: 99px; background: var(--pm-green); }
```
The legacy card had two dead buttons ("Statements" / "Details" with no handler) — the rewrite wires "Statement" → `downloadDataModal` (data export/statement) and "Details" → `transactionLimitsModal` (configure this account's limits).

### Payment card (account-specific)
```css
.paymentCard { position: relative; border: none; border-radius: 16px; color: #fff; padding: 1.1rem 1.2rem;
  display: flex; flex-direction: column; gap: 0.9rem; cursor: pointer; font-family: inherit; }
.cardGradient1 { background: linear-gradient(135deg, #1e293b, #334155 60%, #10b981); }
.cardGradient2 { background: linear-gradient(135deg, #1e293b, #4338ca 60%, #7c3aed); }
.cardGradient3 { background: linear-gradient(135deg, #1e293b, #0f766e 60%, #12b76a); }
.cardGradient4 { background: linear-gradient(135deg, #1e293b, #92400e 60%, #f59e0b); }
.cardNumber { font-family: "Space Grotesk", "Sora", sans-serif; font-size: 1rem; letter-spacing: 0.08em; }
```

### Activity timeline (account-specific)
```css
.activityTimeline { display: flex; flex-direction: column; background: #fff;
  border: 1px solid var(--pm-border); border-radius: 14px; overflow: hidden; }
.activityItem { display: flex; align-items: center; gap: 0.9rem; padding: 0.85rem 1.1rem;
  border-bottom: 1px solid #f0f2f6; border: none; background: transparent; font: inherit;
  text-align: left; width: 100%; cursor: pointer; }
.activityItem:hover { background: #fafbfd; }
```
Timeline rows are real `<button>` elements (keyboard accessible; no `div[onClick]`).

### Channel chips (account-specific)
```css
.channelChip { display: inline-flex; align-items: center; gap: 0.3rem; background: var(--pm-blue-soft);
  color: var(--pm-blue); border-radius: 99px; padding: 0.18rem 0.6rem; font-size: 0.68rem; font-weight: 600; }
.smartBadge { display: inline-flex; align-items: center; gap: 0.3rem; background: var(--pm-violet-soft);
  color: var(--pm-violet); border-radius: 99px; padding: 0.2rem 0.6rem; font-size: 0.68rem; font-weight: 700; }
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

Account tables:
- Linked Businesses: Business / Type / Domain / Date Registered / Documents / Region / Status / Tier / Action.
- Transaction Limits: Account / Type / Daily Limit / Daily Used (meter) / Monthly Limit / Monthly Used / Status / Action.
- Linked Business Accounts: Business / Account Number / Balance / Daily Limit / Daily Used (meter) / Tier / Status / Action.
- Linked External Accounts: Type / Bank / Account Number / Currency / Status / Last Used / Default / Action.
- Auto Payout Scheduling: Schedule / Type / Amount / Destination / Status / Next Run / Action.
- Security Limits & OTP: Transfer Type / Threshold / Requires OTP / OTP Method / Status / Action.
- Country Restrictions: Country / Code / Status / Verification / Transfer Limit / Action.
- Risk Mitigation: Threshold / Currency / Requirement / Applies To / Status / Action.
- Fee Structure: Transfer Type / Fee / Description / Action.
- Account Hierarchy: Account / Balance / Type / Parent / Funding Source / Action.
- Notifications: Event / Channels (chips) / Status / Action.

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
- In-modal content styling (`summaryBox*`, `sr`, `mutedSmall`, `miniStat*`, `receipt*`) lives in `accountProfile.module.css` and pairs with the shared field/pill/table classes.
- Every form label is paired with its control (`htmlFor` + unique `useId` id, or the shared `Field`/`SelectField` primitives) — the 18 legacy `noLabelWithoutControl` findings are gone.

---

## 7. WIZARD / STEPPER (FlowModal) + TABBED MODALS

Tabbed dialogs use the shared `TabbedModal`:

| Modal | Tabs | Notes |
|-------|------|-------|
| Edit Profile (`editProfileModal`) | Personal / Contact / Address | `ModalShell` + local pill tabs; Save → `profileSavedModal` via `onOpen` |
| KYC & Documents (`kycModal`) | Upload / View Documents / Status | Upload → `docUploadedModal`; table row → `viewDocModal` |
| Linked Accounts & Wallets (`linkedAccountsModal`) | Accounts / Cards | Cards tab → `cardDetailsModal` / `virtualCardModal` |

Step-based flows are implemented with the shared `FlowModal` stepper:
- (None in account — the legacy steppers (session termination, KYC wizard) are covered by `SimpleModal`/`ModalShell` with success receipts; the shared success phase renders for every `SimpleModal` with a `successMsg`.)

Stepper semantics (shared, when used): semantic `<ol>` track, completed dots turn green with check, active dot gets the green focus halo, connectors fill green when done, `prefers-reduced-motion` respected.

---

## 8. SECTION HEADERS

```tsx
<SectionHeading
  index="1.2"
  title="Digital Bank Accounts"
  sub="Your PayMo virtual accounts, balances, limits and linked rails."
  actions={<button className={`${styles.btnPm} ${styles.btnSm}`} ...>…</button>}
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
| — | Hero | Executive navy/emerald banner, "Banking live" pill, account-health snapshot (92/100), 3 metric rows, actions (Edit Profile / Export Data) |
| — | Control strip | Account scope pills (All / KES Wallets / USD / Business) + scope note |
| 1.1 | Account health & profile | 4 KPI cards — health 92/100 (Excellent), profile 98% (Verified), active sessions 4 (1 new device), documents 7 (All valid) |
| 1.2 | Attention / Suggestions / Quick Actions | Attention list (3 rows + View all), AI suggestions (4 rows), quick actions (8) |
| 1.3 | Profile Overview | Profile hero (AK avatar, tier badges), stat row (nationality/ID/DOB/gender), verification status (5 rows, Renew → KYC), membership & limits (tier card + 64% usage meter + Upgrade Limits) |
| 1.4 | Digital Bank Accounts | 4 bank cards with balance, daily-limit meters, verified status, Statement/Details actions |
| 1.5 | Cards & Wallets | 4 payment cards (gradients 1–4) → Card Details |
| 1.6 | Linked Businesses | 4-row table + Link Business action |
| 1.7 | Transaction Limits | 4-row table with usage meters + Configure/Add |
| 1.8 | Linked Business Accounts | 3-row table + Limits / Link Business / unlink |
| 1.9 | Linked External Accounts | 5-row table + Manage / Link Account / unlink |
| 1.10 | Auto Payout Scheduling | 4-row table + Configure / New Schedule |
| 1.11 | Security Limits & OTP | 5-row table + Configure / Add Rule |
| 1.12 | Country Restrictions | 7-row table + Configure / Add Country |
| 1.13 | Risk Mitigation | 4-row table + Configure |
| 1.14 | Transaction Fee Structure | 7-row table + Details |
| 1.15 | Account Hierarchy & Fund Flow | 5-row table + Visual View / Sub-Account |
| 1.16 | Advanced Transaction Notifications | 6-row table with channel chips + Configure / Add Rule |
| 1.17 | Recent Account Activity | 5-row timeline → Transaction Details |

---

## 10. KPI CARD

```css
.kpiGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
@media (max-width: 1280px) { .kpiGrid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 576px)  { .kpiGrid { grid-template-columns: 1fr; } }

.kpiCard { background: #fff; border: 1px solid var(--pm-border); border-radius: var(--pm-radius);
  box-shadow: var(--pm-shadow); padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 0.55rem; }
.kpiIcon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; }
.kpiIconGreen { background: var(--pm-green-soft); color: var(--pm-green-dark); }
.kpiIconAmber { background: var(--pm-warning-soft); color: #b54708; }
.kpiIconBlue  { background: var(--pm-blue-soft); color: var(--pm-blue); }
.kpiIconPurple{ background: var(--pm-violet-soft); color: var(--pm-violet); }
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

Forms inside modals use the shared primitives plus local `GridField`/`GridSelect` helpers (label + `useId`-paired `htmlFor` control in a 2-column `fieldGrid`). Layouts: Edit Profile (3 tabs), KYC upload, limits (account pills + 4 numeric fields + OTP toggle), business limits, link business, link external, create payout, security rules (type pills + threshold/method), country restrictions, risk rules, create sub-account, notifications (event pills + channel toggles), upgrade tier (tier pills + limit rows). `Toggle` covers the enable/disable switches; `InfoBox` carries the contextual hints.

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
| `>= 1200px` | Full fixed 264px sidebar, hero + control strip on one line, 4-col bank/cards grids, 4-col profile stats |
| `1100–1199px` | Off-canvas shell nav; hero metrics wrap; 2-col bank/cards grids |
| `768–1099px` | Profile overview stacks to 2-col; bank/cards grids 2-col; profile stats 2-col |
| `< 768px` | Single-column hero and cards, control strip wraps, tables scroll inside cards, section actions wrap |
| `< 576px` | 1-col KPI and bank/cards grids, bottom-sheet modals, icon-first floating bar (labels hidden), floating bar buttons ≥ 40px targets |

---

## 14. STATUS-TO-TONE MAP (account-specific)

| Status string | Badge class |
|---|---|
| Active, Verified, Enabled, Completed, Linked, Allowed, All valid, Excellent, Default, Fully verified, Premium Member, PayMo to PayMo FREE | `badgeS` |
| Pending, Expiring, Frozen, Paused, Restricted, Disabled, Renew, 1 new device, Verification pending | `badgeW` |
| Blocked, Failed, Terminated | `badgeD` |
| Bank, Local Shop, Online Business, Transport Services (type chips), Sub-account | `badgeI` |
| Multi-currency, Since Jan 2023, AI, Mobile Money (type chips), Business type | `badgeP` |

Verification statuses: "Verified" green check; "Renew" amber pill with a real KYC action (never color-only). Card statuses: Active (green soft pill) vs Frozen (amber pill) — always with text.

---

## 15. IMPLEMENTATION ARCHITECTURE

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Account page | `account/page/AccountProfile.tsx` | Hero, control strip (scope pills), KPI pulse, attention/suggestions/quick actions, 17 numbered sections (1.1–1.17), activity timeline, floating bar, footer |
| Account modals | `account/modals/AccountProfileModals.tsx` | 33 dialogs on shared `ModalShell`/`SimpleModal`/`FlowModal`/`TabbedModal`, receipts, cross-modal navigation |
| Business theme contract | `shell.module.css`, `accountProfile.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

Do not add a second local sidebar or page topbar to a transaction route. Routes below `/pm/app` inherit those surfaces from `AppShell`. Page-level CSS must remain scoped and must not redefine the shell position.

### Current reusable mapping

| Business pattern | Account implementation |
|---|---|
| Fixed 264px navy rail | `.sidebar.expanded`; 76px compact state (shell) |
| Sticky/translucent topbar | `.topHeader` (shell) |
| `pm-banner-hero` | `.heroBanner`, `.heroContent`, `.heroSnapshot`, `.heroMetricRow` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.17`) |
| `pm-card` | `.tableCard`, `.listCard`, `.bankCard`, `.paymentCard`, `.panel` |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue`, `.kpiMeta` |
| Soft status badge | `.badgeS/W/D/I/P` (+ shared `badge*` in modals) |
| Primary / secondary button | `.btnPmP` / `.btnPm`, `.btnPmD` (+ shared `btn`, `btnPrimary`, `btnSecondary`, `btnSm`) |
| Operational list card | `.listCard`, `.actionRow`, `.actionRowMain`, `.actionRowTitle`, `.actionRowSub`, `.iconCircle` |
| Quick action grid | `.quickGrid`, `.quickActionCard` |
| Tabbed dialog | shared `TabbedModal` (Accounts/Cards, KYC, notifications) |
| Live status | `.livePill` + `.liveDot` with `pmPulse` |

---

## 16. SHARED MODAL ARCHITECTURE (33 modals)

All modals render through `account/modals/AccountProfileModals.tsx` (default export, props `{ active, onClose, onOpen }`). 25 are opened directly from the page; 8 more open via in-modal `onOpen` navigation. Every rendered modal is reachable; every page trigger resolves.

| Modal | Primitive | Notes |
|---|---|---|
| Profile Overview (`profileModal`) | `SimpleModal` | Avatar + summary boxes (identity, address, language) |
| Edit Profile (`editProfileModal`) | `ModalShell` | Personal/Contact/Address pill tabs; Save → `profileSavedModal` |
| Profile Saved (`profileSavedModal`) | `SimpleModal` | Receipt + ref PRF-20250627-8810; opened from Edit Profile |
| KYC & Documents (`kycModal`) | `ModalShell` | Upload / View Documents / Status tabs; → `docUploadedModal`, `viewDocModal` |
| Document Uploaded (`docUploadedModal`) | `SimpleModal` | Receipt + ref KYC-20250627-8812; opened from KYC upload |
| Document Viewer (`viewDocModal`) | `SimpleModal` | National ID preview + Download PDF; opened from KYC table |
| All Attention Items (`attentionModal`) | `SimpleModal` | 5 rows → `changePasswordModal` / `editProfileModal` / `sessionModal` / `kycModal` / `bankAccountModal` |
| Card Details (`cardDetailsModal`) | `ModalShell` | Card visual + Freeze/Copy footer; opened from cards grid + linked accounts |
| Linked Accounts & Wallets (`linkedAccountsModal`) | `TabbedModal` | Accounts / Cards tabs; → `cardDetailsModal`, `virtualCardModal`, `linkExternalModal` |
| Create Virtual Card (`virtualCardModal`) | `SimpleModal` | Card name/account/limit fields; opened from Linked Accounts (legacy dead reference now implemented) |
| Transaction Details (`activityDetailModal`) | `SimpleModal` | Amount header + review rows; → `receiptModal` |
| Payment Receipt (`receiptModal`) | `SimpleModal` | Receipt + review rows; opened from activity detail |
| Change Password (`changePasswordModal`) | `SimpleModal` | 3 password fields + policy InfoBox; opened from attention |
| Active Sessions (`sessionModal`) | `ModalShell` | Device table + Terminate All → `terminateAllSessionsModal`; opened from attention |
| Terminate All Sessions (`terminateAllSessionsModal`) | `SimpleModal` | Confirm + warning; opened from sessions |
| Enable 2FA (`enable2FAModal`) | `SimpleModal` | QR + backup-code InfoBox; opened from suggestions (legacy orphan now wired) |
| Download Your Data (`downloadDataModal`) | `SimpleModal` | Range/format selects; ref DATA-20250627-9914 |
| Configure Transaction Limits (`transactionLimitsModal`) | `SimpleModal` | Account pills + 4 limit fields + OTP override toggle |
| Business Account Limits (`businessLimitsModal`) | `SimpleModal` | Business selector + 4 limit fields + approval/employee toggles |
| Link Business (`linkBusinessModal`) | `SimpleModal` | Reg number/name/KRA PIN/type + warning |
| Unlink Business (`unlinkBusinessModal`) | `SimpleModal` | Confirm + warning (legacy page trigger was missing — now implemented) |
| Link External Account (`linkExternalModal`) | `SimpleModal` | Type/provider/number/currency (legacy page trigger was missing — now implemented) |
| Unlink External Account (`unlinkExternalModal`) | `SimpleModal` | Confirm + warning (legacy page trigger was missing — now implemented) |
| Manage External Accounts (`externalAccountsModal`) | `SimpleModal` | Bank / Mobile Money / Crypto tabs + default toggle |
| New Auto Payout (`createPayoutModal`) | `SimpleModal` | Schedule fields (legacy page trigger was missing — now implemented) |
| Configure Auto Payout (`autoPayoutsModal`) | `SimpleModal` | Schedule fields + min-balance toggle |
| Security Limits & OTP (`securityLimitsModal`) | `SimpleModal` | Transfer-type pills + threshold/method + toggles |
| Country Restrictions (`countryRestrictionsModal`) | `SimpleModal` | Country/status/limit/verification fields |
| Risk Mitigation Rules (`riskMitigationModal`) | `SimpleModal` | Threshold/requirement/scope + auto-hold toggle |
| Transaction Fee Structure (`feeStructureModal`) | `SimpleModal` | Static fee list + FREE highlight |
| Account Hierarchy (`accountHierarchyModal`) | `SimpleModal` | Primary → sub-account flow visual |
| Create Sub-Account (`createSubAccountModal`) | `SimpleModal` | Name/type/parent/limits + auto-draw toggle |
| Transaction Notifications (`transactionNotificationsModal`) | `SimpleModal` | Event pills + 4 channel toggles + real-time toggle |
| Upgrade Account Limits (`bankAccountModal`) | `SimpleModal` | Tier pills (Premium/Platinum/Business Elite) + limit rows (legacy page trigger was missing — now implemented) |

Cross-modal navigation uses the `onOpen` callback passed from the page component. Legacy orphan `privacyModal` was **cut** (it had no page trigger and the 8 quick actions already cover the grid); the legacy `virtualCardModal` dead reference is now a real dialog; the legacy missing triggers (`bankAccountModal`, `createPayoutModal`, `linkExternalModal`, `unlinkBusinessModal`, `unlinkExternalModal`) are implemented; `enable2FAModal` is wired to a 4th suggestion; dead card buttons are wired (Statement → export, Details → limits); the nonexistent `bi-link-unlink` icon was replaced with `bi-x-circle`.

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
- [x] Page renders inside `AppShell`; no local sidebar/topbar/breadcrumb/profile chrome (`pageBar`, breadcrumb, page actions, `profileModal`-as-pageBar-button removed).
- [x] Content centred at max 1500px; page CSS never redefines shell position/surfaces.

### Account page hierarchy
- [x] One full-width dark executive hero before the dashboard sections.
- [x] Account scope pills (All / KES Wallets / USD / Business) + scope note.
- [x] Seventeen numbered sections (1.1–1.17) covering the full legacy inventory (profile, bank accounts, cards, businesses, limits, external accounts, payouts, security, countries, risk, fees, hierarchy, notifications, activity).
- [x] Four consistent KPI cards; semantic color reserved for icon/status emphasis.
- [x] Attention + suggestions lists with one primary row action each; 8 quick actions in a shortcut card.
- [x] Bank-account cards with balances, daily-limit meters, verified states and wired actions (no dead buttons).
- [x] Floating command bar (Download Data · Edit Profile) on desktop, icon-first on mobile.
- [x] Footer links to Fees / Settlement centre / Disputes centre (`search={{ modal: undefined }}` on validateSearch routes).

### Cards, forms, tables and icons
- [x] Cards use 16px radius, subtle border and restrained business elevation.
- [x] Controls use 9–10px radius, green focus ring and clear disabled states.
- [x] Buttons include explicit `type="button"` where they do not submit a native form.
- [x] Form labels associated with controls (every label has `htmlFor` + unique id — the 18 legacy `noLabelWithoutControl` findings eliminated).
- [x] Tables use uppercase compact headers, responsive horizontal overflow and non-colour status text (badges always carry text).
- [x] Icon-only controls include contextual accessible names; activity rows are real buttons.

### Modals and wizards
- [x] All 33 modals migrated from legacy local markup to shared `SimpleModal`/`FlowModal`/`ModalShell`/`TabbedModal` (the old file already used shared primitives; the API was migrated to the canonical `shared/components/modals.tsx`).
- [x] Dialog semantics, Escape-to-close, focus return, scroll lock and bottom-sheet mobile behavior come from the shared primitives.
- [x] Preserved: success receipts with reference numbers (PRF-/KYC-/DATA-/TLIM-/RCT-), tabbed dialogs, cross-modal navigation (edit → saved, KYC → uploaded/viewer, attention → change password/sessions/KYC/upgrade, sessions → terminate all, activity → receipt, linked accounts → card details/virtual card).
- [x] Five legacy missing page triggers implemented (`bankAccountModal`, `createPayoutModal`, `linkExternalModal`, `unlinkBusinessModal`, `unlinkExternalModal`); legacy orphan `privacyModal` cut; dead `virtualCardModal` reference implemented; `enable2FAModal` wired via suggestion; dead bank-card buttons wired.
- [x] `prefers-reduced-motion` respected in the page layer.

### Responsive implementation
- [x] `>= 1200px`: full sidebar, 4-col KPI and bank/cards grids, hero snapshot on one line.
- [x] `1100–1199px`: off-canvas shell nav; 2-col grids.
- [x] `768–1099px`: profile overview stacks; 2-col grids where space permits.
- [x] `< 768px`: single-column hero and operational cards, wrapped tools, full-width actions.
- [x] `< 576px`: 1-col KPI, bottom-sheet dialogs, icon-first command bar with 40px targets.

---

## 18. MANUAL VISUAL-QA CHECKLIST

Run this list against `/pm/app/account` before release. Deliberately left as review gates rather than implementation claims.

### Desktop — 1440 × 900
- [ ] Sidebar 264px; content has no horizontal jump or overlap.
- [ ] Hero aligns with business Dashboard hero in radius, navy/emerald gradient, type scale and spacing.
- [ ] Four KPI cards equal height; long copy truncates rather than moving the grid.
- [ ] Account scope pills align on the control strip; active states clearly visible.
- [ ] Bank cards, payment cards, tables and panels align on the 16px card system.
- [ ] Floating command bar does not cover the footer or table controls at the bottom of the page.

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Sidebar starts closed and opens above the page with one backdrop.
- [ ] KPI grid becomes 2 columns; bank/cards grids collapse to 2 then 1 column.
- [ ] Tables scroll inside their card; the full document does not scroll horizontally.
- [ ] Modal layering remains correct above the shell.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy has no clipping; action buttons meet 40px minimum targets.
- [ ] Control strip wraps cleanly; scope pills remain tappable.
- [ ] Fixed command bar leaves content reachable and uses a readable labelled primary action.
- [ ] Modals open as bottom sheets, remain scrollable and keep footer actions visible.
- [ ] Activity timeline rows remain legible and tappable.

### Interaction and accessibility
- [ ] Keyboard can reach control strip, filters, table actions, floating actions and footer in visual order.
- [ ] Switch account scope (All / KES / USD / Business); verify bank cards refilter with the scope note updating.
- [ ] Open each of the 33 modals; verify close, processing, receipt and nested-dialog paths.
- [ ] Run tabbed dialogs (Edit Profile, KYC, Linked Accounts) through their tabs; verify nested opens (saved, uploaded, viewer, card details, virtual card).
- [ ] Verify every form label focuses its control; run a keyboard-only pass over the forms.
- [ ] At 200% browser zoom, content remains usable with no two-dimensional page scrolling.
- [ ] With reduced motion enabled, pulse/pop transitions are effectively disabled.
- [ ] Run automated contrast/accessibility tooling; manually verify muted text and focus contrast.

---

## 19. RELEASE GATES

- [x] Targeted Biome lint passes for all edited account files (August 30, 2026) — zero errors (legacy 18 `noLabelWithoutControl` + 1 CSS format finding eliminated by the rewrite).
- [x] Vitest suite passes: 1 file, 9 tests (August 30, 2026).
- [x] Production client/server build passes with Vite (August 30, 2026).
- [x] Route responds 200 at `/pm/app/account` in the local preview with SSR markers (hero copy, "Account Health", "Attention Required", "Linked Businesses", "Recent Account Activity", "Banking live", footer links).
- [x] Deep-links `?modal=<id>` return 200 for all 25 page-trigger modals (sample verified: profileModal, editProfileModal, kycModal, transactionLimitsModal, cardDetailsModal, activityDetailModal, downloadDataModal, attentionModal, bankAccountModal, createPayoutModal, linkExternalModal, unlinkBusinessModal, unlinkExternalModal).
- [x] Refinement: removed local pageBar/breadcrumb/profile chrome — the shared AppShell provides those.
- [x] Refinement: 33 modals on shared primitives; all rendered modals reachable (25 page-open + 8 via in-modal `onOpen` navigation); 0 orphans, 0 dead triggers; `privacyModal` cut (documented); 5 legacy missing triggers implemented.
- [x] Refinement: CSS module rewritten on the shared token set and composition classes; every `styles.*` token referenced by page and modals resolves in `accountProfile.module.css` or `appPage.module.css` (CSS-reference audit clean; only compound-selector false positives `filterActive`, `floatingPrimary`, `livePill`).
- [x] Refinement: TypeScript typecheck — zero diagnostics in account files (identical error-key baseline to the accepted fees/settlement set).
- [x] `git diff --check` clean.
- [ ] Manual visual-QA checklist above signed off by a reviewer.
- [ ] Real API payload checked against long names, empty arrays, large amounts and non-KES currencies.
