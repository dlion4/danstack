# PayMo Business → Account Settings & Administration Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Sibling references: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md` (canonical page), `initiate-transfer/`, `fx/`, `compliance/`, `analytics/`, `payment-rails/`, `system-health/DESIGN-BLUEPRINT.md`
> Implementation targets: `transaction-dashboard/settings/` (`page/AccountSettings.tsx`, `modals/AccountSettingsModals.tsx`, `style/accountSettings.module.css`)
> Content source: legacy 1.18.html — the personal account settings & administration hub (no legacy HTML retained in repo; content sourced from the pre-refinement TSX)
> Last reconciled: August 30, 2026

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
.settingsPage {
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
- The legacy 1.18 theme (teal primary `#10b981`, amber accent `#f59e0b`, cream canvas `#f5f1ec`, Space Grotesk display font, page-level `min-height: 100vh` + radial gradients, warm borders `#e5e2dc`) is fully replaced.
- The settings modals read the shared `appPage.module.css` root (`.pageRoot` `--pri/--surface-2/--ink-*/--success/...` aliases) — same resolved values as the token set above; the three settings-exclusive missing primitives (`buttonOutline`, `hintBoxWarning`, `hintBoxInfo`) were added to the shared stylesheet with the same business values.

---

## 2. TYPOGRAPHY

| Element | Family | Size | Weight | Notes |
|---------|--------|------|--------|-------|
| Body | `"Inter", system-ui, sans-serif` | `0.875rem` | 400 | `-webkit-font-smoothing: antialiased` |
| Hero h1 | Sora | `clamp(1.75rem, 3.2vw, 2.9rem)` | 750 | `letter-spacing: -0.03em; line-height: 1.08` |
| Hero eyebrow | Inter | `0.7rem` | 700 | uppercase, `0.06em`, `#b7e6cf` pills |
| Hero score value | Sora | `3rem` | 750 | `-0.03em`; `/100` at `1.1rem` 600 `rgba(255,255,255,0.55)` |
| Hero metric value | Sora | `1.25rem` | 700 | tone per metric (`#41d991` / `#fbbf24` / `#fda29b`) |
| Hero metric label | Inter | `0.62rem` | 600 | uppercase, `0.05em`, `rgba(255,255,255,0.6)` |
| Section heading (h2) | Sora | `1.06rem` | 700 | `-0.02em` |
| Section index badge | Inter | `0.67rem` | 700 | 35×35px, radius 10px, `#101828` bg |
| Section subtitle | Inter | `0.78rem` | 400 | `--pm-muted`, max-width 680px |
| Card title (h3) | Sora | `0.95rem` | 700 | `-0.01em`, icon at `1em` |
| Card kicker | Inter | `0.72rem` | 400 | `--pm-muted` |
| Method name | Inter | `0.84rem` | 700 | `--pm-ink` |
| Method desc | Inter | `0.72rem` | 400 | `--pm-muted`, line-height 1.5 |
| Toggle card title | Inter | `0.82rem` | 600 | `--pm-ink` |
| Toggle card meta | Inter | `0.7rem` | 400 | `--pm-muted` |
| Detail value | Inter | `0.84rem` | 600 | `--pm-ink` |
| Detail meta | Inter | `0.7rem` | 400 | `--pm-muted` |
| Detail block title | Inter | `0.64rem` | 700 | uppercase, `0.08em`, `--pm-muted` |
| Table header | Inter | `0.68rem` | 600 | uppercase, `0.05em`, `--pm-muted` |
| Table cell | Inter | `0.8rem` | 400 | `--pm-ink-soft`; strong cells `--pm-ink` |
| Table code ref | mono | `0.72rem` | — | `SFMono-Regular, Consolas` fallback stack |
| Badge | Inter | `0.68rem` | 600 | `border-radius: 99px` |
| Button | Inter | `0.8rem` | 600 | small `0.75rem` |
| Pill | Inter | `0.78rem` | 500 | active 600 |
| Quick action label | Inter | `0.72rem` | 600 | icon `1.1rem` |
| Attention row text | Inter | `0.78rem` | 600 | `--pm-ink` |
| Footer | Inter | `0.75rem` | 400 | `--pm-muted` |

Fonts stay globally loaded by `src/routes/__root.tsx`; the feature adds no network font import.

---

## 3. LAYOUT SHELL

The route `/pm/app/settings` (`src/routes/pm/app.settings.tsx`) renders `AccountSettings` inside the shared authenticated AppShell (fixed navy `#0b1322` sidebar + translucent topbar + toasts). The page renders content only:

- No local sidebar, topbar, breadcrumb or page bar (the legacy `pageBar`/`breadcrumb` block and its commented-out `h1`/`pageDescription` were removed).
- Content column: `flex: 1`, `max-width: 1500px`, `margin: 0 auto`, `padding: 1.5rem 1.5rem 3.5rem`.
- Composition: one full-width dark executive hero → ten numbered sections (01–10) → attention / smart suggestions / quick actions triple-card row → footer strip → modals.

---

## 4. COMPONENT PATTERNS

### Cards
- White `--pm-card`, `1px solid var(--pm-border)`, radius `16px`, `padding: 1.25rem`, `box-shadow: var(--pm-shadow)` — identical to the business pages' cards.
- Hover states: subtle elevation + emerald border on interactive sub-cards (method cards, quick buttons) only.

### Buttons
- Base: `min-height: 40px`, padding `0.5rem 1rem`, radius `10px`, Inter 600 `0.8rem`, cool border `#e6e9f0`, `--pm-ink-soft` text.
- Primary: emerald fill `#12b76a`, white text; hover `#0b8f52` + `translateY(-1px)`.
- Danger: soft red fill `#fee4e2`, `#dc2626` text, translucent red border; hover fills solid `#f04438`.
- Small: `min-height: 32px`, padding `0.3rem 0.8rem`, `0.75rem`.
- Disabled: `opacity: 0.55`, `cursor: not-allowed`, no transform.
- Every non-submit button carries explicit `type="button"`.

### Badges
- Pill `99px`, `0.68rem` 600, icon `0.3rem` gap.
- Tones: success `#e7f8ef/#0b8f52`, warning `#fef0c7/#b54708`, danger `#fee4e2/#d92d20`, info `#e8f1fe/#175cd3`, purple `#f0ebfe/#6938ef`, outline `transparent/#344054` with `1px dashed`-free solid `--pm-border-2` border.

### Icons
- Bootstrap Icons exclusively (page + modals; zero Font Awesome live references).
- Icon-only buttons (hero snapshot Audit/Sessions/Questions, beneficiary pencil/trash) require `aria-label` + `title`.

---

## 5. TABLE

- `width: 100%`, `border-collapse: collapse`, font `0.8rem`.
- Headers: uppercase `0.68rem` 600 `--pm-muted`, `letter-spacing 0.05em`, `background: var(--pm-surface-2)`, bottom `1px solid var(--pm-border)`.
- Cells: `padding: 0.75rem`, `--pm-ink-soft`, row hover `var(--pm-surface-2)`; last row borderless.
- Card-scoped horizontal scroll via `.tableWrap { overflow-x: auto }` — the document never scrolls horizontally.
- Cell helpers: `.cellMain` (bold ink), `.cellMeta` (muted 0.68rem sub-line), `.cellCode` (mono chip), `.cellNowrap`.
- Tables used: sessions, KYC documents, beneficiaries, security events (audit trail).

---

## 6. MODAL (shared-settings-acc primitive layer)

All 23 settings shells are built from `shared-settings-acc/components/modals.tsx` (`ModalShell`, `SimpleModal`, `FlowModal`, `TabbedModal`, plus `InfoBox`/`SelectField`/`Toggle`/`PinRow`/`ReviewRow` helpers) and styled by the **shared** `appPage.module.css` (`s = shared`). The primitives file stays at HEAD — it is also consumed by `account/` (AccountProfileModals), so it is not settings-exclusive.

### Modal chrome (from shared CSS — verified contract)
- Backdrop `.overlay`: `position: fixed; inset: 0`, `rgba(11, 19, 34, 0.45)` + `backdrop-filter: blur(4px)`, `z-index: 9999`, centred, `overflow-y: auto`, `padding: 16px`.
- Dialog `.dialog`: white, radius `16px`, `box-shadow: var(--pm-shadow-lg)` (`0 24px 60px -16px rgba(16,24,40,0.28)`), `max-height: 90vh`, flex column with sticky header/body/footer.
- Sizes: sm `400px`, md `500px`, lg `800px`, xl `1140px`; FlowModal always lg.
- Header: bottom border, Sora 700 `1.05rem` title, emerald icon, 36px ghost close button (hover `--ink-100`).
- Footer: top border, `#fafbfd` strip, right-aligned, wrap; mobile stacks full-width column-reverse.
- `≥1200px`: `.overlay` gains `padding-left: calc(16px + var(--sidebar-width))` so dialogs centre inside the shell content area.
- `≤575.98px`: bottom-sheet behavior — `.overlay` aligns to `flex-end` with `padding: 0`, `.dialog` gets `max-height: 92dvh`, `border-radius: 16px 16px 0 0`, `margin: 0` (this refinement added the missing `.overlay`/`.dialog` bottom-sheet rules to the shared CSS — the primitives render those classes directly, previously only `.modalWrapper`/`.modalContent` were sheet-ified).
- Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-label` from title, Escape closes, backdrop `mousedown`-target close, body scroll locked while open.
- InfoBox variants resolve to `.hintBox*` classes; this refinement added the two missing variants used by settings shells: `.hintBoxWarning` and `.hintBoxInfo` (mirroring the existing `.hintBoxWarn`/`.hintBoxSuccess` tones with `--pm-*` values).

---

## 7. DRAWER

No slide-in drawer exists on this page. Data export, webhook configuration, linked-account management and closure flows all use centred dialogs (see §6/§8); the AppShell owns any app-level drawers.

---

## 8. WIZARD / STEPPER

`FlowModal` renders the shared stepper: numbered circles with connecting lines, completed steps show a green check, the current step is highlighted, upcoming steps are muted; the footer shows Back/Cancel + Continue, and the final step uses the `confirmLabel` (danger for closure flows). Mobile: labels hidden `≤575.98px`, steps become flexible.

Three wizards preserved:

| Wizard | Steps | Confirm | Variant |
|--------|-------|---------|---------|
| `enable2FAModal` | Choose method → Scan QR code → Verify | Enable 2FA | primary |
| `closeAccountModal` (controlled, `closeAccountStep`) | Understand Impact → Select Beneficiaries → Allocate Funds → Verify Identity → Review & Confirm → Success | Close Account | danger |
| `closeBusinessAccountModal` | Review impact → Fund payout → Confirm closure | Close Account | danger |

`closeAccountModal` also hosts nested pill tabs inside step 2 (Family / Charities / Custom — driven by `closeAccountStep`), a percentage/fixed allocation toggle, and a schedule-date toggle inside step 5 — all preserved.

---

## 9. SECTION HEADERS

Business numbered pattern: dark `#101828` 35×35px index chip (`01`–`10`) + Sora `1.06rem` h2 + muted subtitle on the left; action buttons on the right (`sectionAction`). Headers wrap on mobile and the action column stacks below the copy.

Sections:
1. 01 Security & Authentication
2. 02 Notification Preferences
3. 03 Linked Devices & Active Sessions
4. 04 KYC & Document Vault
5. 05 API & Developer Settings
6. 06 Preferences & Localization
7. 07 Privacy & Data Controls
8. 08 Beneficiaries & Next of Kin
9. 09 Account Administration (Overview / Close Main / Close Business pills)
10. 10 Recent Security Events

---

## 10. KPI CARD

The legacy 4-card stat row is replaced by the hero snapshot (§11): a glass panel showing the security posture score 92/100 plus three metric tiles — Open incidents `0` (`#41d991`), Recommendations `3` (`#fbbf24`), Password expiry `12d` (`#fda29b`). The old `cardAccent` gradient card, `statCard`/`statLabel`/`statValue` fragments and the white cards with coloured stat labels are removed in favour of the hero composition.

---

## 11. FORMS

All settings forms live inside modals (change password, security questions, KYC upload, webhooks, preferences, edit profile, beneficiaries, closure flows) and use the shared `.formControl` / `.formLabel` / `.field` / `.fieldLabel` classes from `appPage.module.css`:

- Inputs: `100%` width, `10px 14px`, cool border, radius `10px`, Inter 14px; focus = emerald border + `--pm-shadow-glow` halo (`0 0 0 0.2rem rgba(18,183,106,0.14)`).
- Labels: 600, `--pm-ink-soft`, compact.
- Toggles: shared `.switchRow`/`.toggle` — 40px switch, emerald on-state, optional `danger` tone for destructive confirms.
- Selects: shared `.field`; date/time inputs use `color-scheme: light`.
- OTP/PIN: 6 password inputs, `44×54px`, `2px` border, numeric inputMode, auto-advance via `PinRow` pattern (2FA verify + both closure verify steps).
- Upload dropzone (KYC): dashed `--pm-border-2` box with icon, hoverable, 10 MB note — styled via inline legacy vars that resolve to shared modal tokens.

---

## 12. TOAST NOTIFICATIONS

The shared AppShell owns toasts; the settings page adds no toast layer. In-modal feedback uses the shared receipt pattern (§13) and `InfoBox` hints.

---

## 13. RECEIPT / SUCCESS STATES

`SimpleModal`/`FlowModal` processing → receipt flow (shared): spinner overlay with "Processing...", then a green check circle, Sora title, muted message and optional mono reference (`DATA-20250627-9914`, `CLOSE-20250627-8842`, `REACT-20250627-4410`, `BENEF-20250627-5532…5534`). The close-account receipt additionally lists sent notifications and read-only-mode guidance — preserved.

---

## 14. SCROLLBAR

`settingsPage * { scrollbar-width: thin; scrollbar-color: #c8cdd8 transparent; }` + 8px webkit thumb `#c8cdd8`, transparent track — matching every refined page.

---

## 15. ANIMATIONS

- `pmPulse` on the hero live dot (emerald halo pulse, 2s).
- Hover micro-motions only: `translateY(-1px)` + shadow on buttons/cards; `transition: all 0.15s` (page) / `0.2s` (legacy button) — kept short.
- `prefers-reduced-motion: reduce` kills all animation/transition globally on the page.

---

## 16. RESPONSIVE BREAKPOINTS

| Breakpoint | Behavior |
|---|---|
| `≥1200px` | Full 3-up toggle/detail/privacy grids, 4-up quick actions, 2-col hero, modal overlay offsets for the shell sidebar |
| `992–1199px` | Hero snapshot narrows; toggle/detail/privacy grids 2-up |
| `768–991px` | Hero single-column with snapshot capped at 520px; triple-card row single-column; KYC grid single-column |
| `576–767px` | Single-column method/toggle/detail/privacy/admin grids; quick actions 2-up; section headings stack; API key value wraps full-width (`overflow-wrap: anywhere`); page padding `1rem` |
| `≤575.98px` | Hero buttons full-width stacked; metric tiles single column; score `2.5rem`; tables compacted (`0.6rem` cells); buttons full-width (small stays auto); modals become bottom sheets |
| `≤420px` | Page padding `0.75rem`; quick actions 1-up; h1 `1.5rem`; eyebrow `0.62rem` |

---

## 17. STATUS-TO-TONE MAP

| Status | Tone | Token |
|---|---|---|
| Active / Enabled / Verified / Current / Success / On / Linked / Healthy | success | `--pm-green-soft` bg, `--pm-green-dark` text |
| Expiring / New / Minor / Pending / Warning | warning | `--pm-warning-soft` bg, `#b54708` text |
| Revoked / Blocked / Danger / Off (destructive) | danger | `--pm-danger-soft` bg, `#d92d20` text |
| Info / Policy hints / Data rights | info | `--pm-info-soft` bg, `#175cd3` text |
| AI suggestions badge | purple | `--pm-purple-soft` bg, `#6938ef` text |
| Off / neutral / paused | outline | transparent bg, `--pm-border-2` border, `--pm-ink-soft` text |

Status is never communicated by colour alone — every badge carries a text label.

---

## 18. MISC COMPONENTS

- **Admin pill tabs (09):** shared `.pills` track (`--pm-surface-2`, `1px` border, radius 12px, `overflow-x: auto`) with white active pill + shadow; `role="tablist"`/`role="tab"`/`aria-selected` wired.
- **Verification progress:** thin `8px` emerald tracks; the Address track uses `--pm-warn` at 75%.
- **Biz rows (close business):** gradient avatar tile 40×40 radius 10 + name/detail + danger Close button.
- **Info strip:** soft-blue footnote under the beneficiaries table.
- **Count row:** Sora `1.4rem` device count + label + "1 new device" badge.
- **Footer strip:** centered muted line with emerald shield icon.
- **Alert boxes:** `.alertSuccess/.alertInfo/.alertDanger` — soft fills with icon + wrapped text (KYC verified, close-main warning, close-business info).

---

## 19. IMPLEMENTATION ARCHITECTURE

| Layer | File | Responsibility |
|---|---|---|
| Route | `src/routes/pm/app.settings.tsx` | `createFileRoute("/pm/app/settings")` renders `<Settings/>` inside AppShell |
| Page | `settings/page/AccountSettings.tsx` | Hero, 10 numbered sections, triple action cards, footer; `modalState` + `openModal/closeModal`; `adminTab` 0/1/2; TanStack Query mock fetch with `initialData` |
| Modals | `settings/modals/AccountSettingsModals.tsx` | 23 shells over shared primitives; kept at HEAD except 4 surgical TS fixes (removed 3 unused `useState` pairs, quoted `justifyContent: center`) |
| Page CSS | `settings/style/accountSettings.module.css` | `.settingsPage` tokens + hero/sections/cards/tables/responsive |
| Shared CSS | `shared/styles/appPage.module.css` | Modal chrome + `.buttonOutline`/`.hintBoxWarning`/`.hintBoxInfo` additions + `.overlay`/`.dialog` bottom-sheet rules |
| Shared primitives | `shared-settings-acc/components/modals.tsx` | HEAD, untouched (shared with `account/`) |

Deleted (verified zero references src-wide): `settings/modals/AccountSettings.tsx` (orphaned page copy importing non-existent `../components/…`) and `settings/modals/accountSettings.module.css` (orphaned 490-line stylesheet).

---

## 20. MODAL INVENTORY (23 / 23 REACHABLE)

All 23 shells live in `AccountSettingsModals.tsx`; every key below is triggered from the page:

| # | Modal | Primitive / Size | Reachable from |
|---|-------|------------------|----------------|
| 1 | `attentionModal` | SimpleModal lg | Attention card "View all" |
| 2 | `changePasswordModal` | SimpleModal md | Hero Password, 01 method rows, attention Update, quick Password |
| 3 | `enable2FAModal` | FlowModal lg (3 steps) | Hero 2FA, 01 header 2FA + method rows, suggestions Enable, quick 2FA |
| 4 | `securityQuestionsModal` | SimpleModal md | Hero snapshot Questions, 01 method rows, quick Questions |
| 5 | `securityAuditModal` | ModalShell lg | Hero snapshot Audit, 01 header Audit, 10 Full Audit Log |
| 6 | `sessionModal` | ModalShell lg | Hero snapshot Sessions, 03 Manage All, attention Review, quick Sessions |
| 7 | `terminateAllSessionsModal` | SimpleModal md | 03 Terminate All |
| 8 | `kycModal` | ModalShell lg (Upload/View/Status pills) | 04 Upload + Vault, KYC row Renew, attention Renew, suggestions Upload |
| 9 | `viewDocModal` | SimpleModal md | KYC row View |
| 10 | `notifSettingsModal` | TabbedModal lg (Channels/Quiet Hours/Digest) | 02 Advanced |
| 11 | `privacyModal` | SimpleModal md | 07 Manage, data-rights View, suggestions Review |
| 12 | `downloadDataModal` | SimpleModal md | 07 Export, data-rights Request, 09 Export, quick Export |
| 13 | `closeAccountModal` | FlowModal lg (6 steps, controlled) | Hero Close Account, 09 close-main CTA, data-rights deletion Request |
| 14 | `reactivateModal` | SimpleModal md | 09 Reactivation Request |
| 15 | `apiKeyModal` | TabbedModal lg (Create Key/Webhooks/Rotate) | 05 Create Key, quick API Keys |
| 16 | `webhookModal` | SimpleModal md | 05 Webhooks |
| 17 | `preferencesModal` | TabbedModal lg (Localization/Interface/Accessibility) | 06 Manage, quick Preferences |
| 18 | `editProfileModal` | ModalShell lg (Personal/Contact/Address pills) | Hero Edit Profile, attention Verify |
| 19 | `linkedAccountsModal` | TabbedModal lg (Accounts/PayMo/Business) | 09 Linked accounts, quick Linked |
| 20 | `closeBusinessAccountModal` | FlowModal lg (3 steps) | 09 close-business rows, linkedAccounts Business tab Close |
| 21 | `addBeneficiaryModal` | SimpleModal md (Family/Charity/Custom pills) | 08 Add Beneficiary |
| 22 | `editBeneficiaryModal` | SimpleModal md | 08 row pencil |
| 23 | `deleteBeneficiaryModal` | SimpleModal md | 08 row trash |

Cross-modal navigation preserved: attention rows open their target modal from within `attentionModal`; `sessionModal` footer can open `terminateAllSessionsModal`; `kycModal` footer can open `viewDocModal`; `linkedAccountsModal` business rows open `closeBusinessAccountModal`. `AccountSettingsModals.tsx` stays at HEAD except 4 surgical TS fixes (3 unused state pairs + one unquoted style value) — no behaviour change, no formatting churn.

---

## 21. CODE-COMPLETE CHECKLIST (refined August 30, 2026)

### Theme and typography
- [x] Emerald `#12b76a` is the only primary interaction colour.
- [x] `#0b1322` navigation rail and `#f2f4f8` canvas (via AppShell).
- [x] Cool neutral borders `#e6e9f0`; no warm/cream tokens remain in `accountSettings.module.css`.
- [x] Semantic colours only for status: warning `#f79009`, danger `#f04438`, info `#2e90fa`, violet `#7a5af8`.
- [x] Inter for body/controls, Sora for headings/KPI values (fonts loaded once in `src/routes/__root.tsx`).

### Shell and page hierarchy
- [x] Page renders content only — no second sidebar, header, breadcrumb or page bar (legacy pageBar removed).
- [x] One full-width dark executive hero before all sections (gradient, orbs, eyebrow pills, glass posture snapshot with Audit/Sessions/Questions actions and metric row).
- [x] Ten numbered sections (01 Security & Auth, 02 Notifications, 03 Sessions, 04 KYC, 05 API, 06 Preferences, 07 Privacy, 08 Beneficiaries, 09 Administration, 10 Security events).
- [x] The legacy 4 stat cards (posture gradient card, incidents, recommendations, password expiry) folded into the hero snapshot.
- [x] Attention + AI suggestions as scannable list cards with one primary row action each; 8 quick actions in the shortcut card.
- [x] All legacy sections and their content preserved (auth methods, notifications, sessions table, KYC table + verification progress, API keys, preferences blocks, privacy columns, beneficiaries table, admin 3-tab flow, audit table).
- [x] Page footer; content centred at 1500px max width.

### Cards, forms, tables and icons
- [x] Cards 16px radius, subtle border, restrained elevation.
- [x] Controls 9–10px radius, green focus ring, clear disabled states.
- [x] Explicit `type="button"` on all non-submit buttons (page and primitives).
- [x] Tables use uppercase compact headers, card-scoped horizontal scroll, non-colour status text, mono key/account references.
- [x] Bootstrap Icons throughout; zero live Font Awesome references.
- [x] Quick actions and hero buttons are real buttons with keyboard access.

### Modals, steppers and drawers
- [x] Dialogs use `role="dialog"`, `aria-modal`, labelled title, dark blurred backdrop, sticky header/footer.
- [x] Escape closes the active dialog, backdrop-click closes, body scroll locks while open.
- [x] Mobile dialogs become bottom sheets with 92dvh max height (`≤575.98px` — shared `.overlay`/`.dialog` rules added this refinement).
- [x] Steppers show completed/current/upcoming states with green connectors; mobile labels hide.
- [x] Loading overlay, receipts, tab panels, nested pills and cross-modal navigation preserved.
- [x] All 23 modal shells reachable (audited — 23/23 were already wired; wiring retained 1:1).
- [x] `prefers-reduced-motion` respected.

### Responsive implementation
- [x] `≥1200px`: 3-up grids, 4-up quick actions, hero two-column, modal overlay offsets for the sidebar.
- [x] `992–1199px`: 2-up toggle/detail/privacy grids, narrower snapshot.
- [x] `768–991px`: hero single-column, triple-card row and KYC grid single-column.
- [x] `576–767px`: all content grids single-column, quick actions 2-up, section headings stack, API keys wrap.
- [x] `≤575.98px`: hero buttons stacked full-width, metric tiles single column, bottom-sheet dialogs, compact tables.
- [x] `≤420px`: quick actions 1-up, tighter padding and type.

---

## 22. MANUAL VISUAL-QA CHECKLIST

Run against `/pm/app/settings` before release — deliberate review gates.

### Desktop — 1440 × 900
- [ ] Sidebar/topbar come from the shell; hero aligns with transfer-overview/system-health hero (gradient, radius, type scale).
- [ ] Hero snapshot score 92/100 and metric tiles match the data (0 incidents / 3 recommendations / 12d expiry).
- [ ] Ten section headings use the numbered index chips; action buttons sit right-aligned.
- [ ] Tables scroll inside their cards; the document never scrolls horizontally.
- [ ] Modals centre within the shell content area (sidebar offset applied).

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Toggle/detail/privacy grids become 2-up; hero still two-column at 1024.
- [ ] Triple-card row and KYC grid single-column at 768.
- [ ] Modals remain centred and scrollable; footer actions visible.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy unclipped; hero action buttons ≥ 40px target, stacked full-width.
- [ ] Quick actions 2-up; metric tiles single column; tables scroll inside cards.
- [ ] Admin pills scroll horizontally without wrapping; admin panels single column.
- [ ] Modals open as bottom sheets with rounded top corners and sticky footer actions.

### Interaction and accessibility
- [ ] Keyboard reaches hero, section actions, tables, quick actions, footer in visual order.
- [ ] Focus visible on buttons and inputs; quick actions activate with Enter/Space.
- [ ] Run the 2FA wizard (3 steps), the business-closure wizard (3 steps) and the full close-account wizard (6 steps → receipt).
- [ ] Open every modal via its trigger; verify Escape, backdrop click, focus return.
- [ ] Verify cross-modal chains: attention → target modal; sessions → terminate all; KYC → viewer; linked accounts → close business.
- [ ] At 200% zoom no two-dimensional page scrolling.
- [ ] Reduced motion disables pulse and transitions.

---

## 23. RELEASE GATES

- [x] Targeted Biome check passes for `AccountSettings.tsx` (August 30, 2026). CSS lint state is at parity with the reference pages (7 warnings: `noImportantStyles` on the `.heroLive` override + `prefers-reduced-motion` block — same intentional patterns as `systemHealth.module.css`; plus `noDescendingSpecificity` on the reduced-motion block).
- [x] `AccountSettingsModals.tsx` untouched apart from 4 surgical TS fixes (3 unused state pairs, one unquoted style value); its ~21 pre-existing a11y findings are the known legacy baseline and are out of scope.
- [x] Shared CSS additions (`buttonOutline`, `hintBoxWarning`, `hintBoxInfo`, `.overlay`/`.dialog` bottom-sheet rules) introduce zero new lint findings; the shared file's pre-existing findings are at HEAD parity.
- [x] Zero TypeScript diagnostics under `transaction-dashboard/settings` and `transaction-dashboard/shared` (`tsc --noEmit` feature-filtered).
- [x] CSS class audit: every `styles.*` reference on the page and every `s.*` reference in the modals resolves (0 missing).
- [x] Stale files deleted after src-wide reference grep confirmed zero consumers.
- [x] Vitest suite green.
- [x] Client and server production builds green.
- [x] Route `/pm/app/settings` returns HTTP 200 with SSR markers present and no modal leak in server markup.
- [x] `git diff --check` clean; committed and pushed to `arena/01a053d9-danstack`.
