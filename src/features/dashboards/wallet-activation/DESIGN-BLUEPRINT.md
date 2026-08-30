# PayMo Wallet Activation & Cross-Dashboard Hub — Design Blueprint

**Route:** `/wallet-activation` (standalone — no AppShell; own console chrome)
**Source files:** `src/features/dashboards/wallet-activation/`
**Page override:** minimal auth/hub-style hub (per user direction) — reduced cards/sections, tabs, small feature cards, retained flowchart.

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

The standalone route never mounts the AppShell `.pageRoot`, so the PayMo tokens are defined **on `.waPage` itself** in `walletActivation.module.css` (self-contained theme — same language as `appPage.module.css` / `authTheme.module.css`). Modals render inline (no portal), so they inherit these tokens.

| Token | Value | Token | Value |
|---|---|---|---|
| `--pri` | `#12b76a` | `--pri-600` | `#0b8f52` |
| `--pri-700` / `--pri-dark` | `#0a6b3e` | `--pri-light` | `#32d583` |
| `--sec` | `#0b8f52` | `--sec-light` | `#32d583` |
| `--acc` | `#f79009` | `--acc-light` | `#fdb022` |
| `--surface` | `#f2f4f8` | `--surface-elev` | `#ffffff` |
| `--surface-2` | `#f9fafc` | `--border` | `#e6e9f0` |
| `--border-2` | `#eaecf0` | `--ink-900` | `#101828` |
| `--ink-700` | `#344054` | `--ink-600` | `#475467` |
| `--ink-500` | `#667085` | `--ink-400` | `#98a2b3` |
| `--ink-300` | `#d0d5dd` | `--ink-100` | `#f2f4f7` |
| `--success` / `--success-bg` | `#12b76a` / `#e7f8ef` | `--warning` / `--warning-bg` | `#f79009` / `#fef0c7` |
| `--danger` / `--danger-bg` | `#f04438` / `#fee4e2` | `--info` / `--info-bg` | `#2e90fa` / `#e8f1fe` |
| `--purple` / `--purple-bg` | `#7a5af8` / `#f0ebfe` | `--radius-sm/md/lg/pill` | `10px / 14px / 16px / 999px` |
| `--shadow-sm` | `0 1px 2px rgba(16,24,40,.05)` | `--shadow-md` | `0 1px 2px rgba(16,24,40,.05), 0 8px 24px -12px rgba(16,24,40,.12)` |
| `--shadow-lg` | `0 24px 60px -16px rgba(16,24,40,.28)` | `--shadow-xl` | `0 32px 72px -20px rgba(16,24,40,.32)` |

Root surface (`--shadow-glow: 0 0 0 4px rgba(18,183,106,.14)`), background = two soft radial tints (emerald top-right, blue top-left) over `var(--surface)`, `min-height: 100vh`, full-bleed width.

## 2. TYPOGRAPHY

- **Body:** Inter 400/500/600 — non-bold by design (user override: "use non-bold fonts"); no 700/800 weights in page chrome.
- **Headings:** Sora (`.heroTitle`, `.sectionTitle`, flow titles) 500–600, `letter-spacing: -0.01em`.
- **Numbers/mono accents:** Space Grotesk / Sora fallback.
- Sizes: hero title ~28px, section titles 16–18px, card labels 13–14px, meta/captions 11–12px.
- Fonts load globally via `__root.tsx` head links (Inter, Space Grotesk, Sora, Manrope).

## 3. LAYOUT SHELL

Standalone route (`src/routes/wallet-activation.tsx`) — **no AppShell, no sidebar, no page topbar/breadcrumb/profile chrome**. The page owns a slim console bar (auth/hub convention):

1. **`waConsole`** — crumb (`PayMo / Wallet Activation Hub`), ⌘K search trigger, help icon button.
2. **Hero** — single navy-gradient card: zone chip, title, copy, status chips, 4 stats, 3 actions, primary-account strip with copy button.
3. **Tabs** — segmented tablist (Overview / Live Flow / Dashboards / Manage) with counts.
4. **Tab bodies** — sections `01`–`05` with numbered headers.

## 4. COMPONENT PATTERNS

### Console (`.waConsole`, `.waCrumb`, `.waSearch`, `.waKbd`, `.waIconBtn`)
Search button opens the ⌘K palette; kbd badge shows `⌘K`; help icon opens `supportHelpModal`.

### Hero (`.hero`)
Navy `linear-gradient(140deg, #0b1322, #123a2c 58%, #0d5c38)` card (business-dashboard brand rail language) with decorative orbs; emerald `heroZone` chip; white title/copy; soft chips (`heroChip` with icon + text); stats row (`heroStat` label/value, value in Space Grotesk); actions = `buttonPrimary buttonMd` (Activate) + `buttonGhost buttonMd` (Link Account, Relocate Funds); account strip (`heroAccount`) with copy-to-clipboard feedback (`copied` state swaps `bi-clipboard` → `bi-check-lg`).

### Tabs (`.tabs`, `.tab`, `.tabActive`, `.tabCount`)
`role="tablist"` + `role="tab"` + `aria-selected`; active tab = emerald underline/pill; count badges on Flow/Dashboards.

### Feature cards (`.featureGrid`, `.featureCard`) — auth/hub sizing
`repeat(auto-fill, minmax(250px, 1fr))`, 12px gap, card = 14×16px padding, 14px radius, icon square (tinted `color + "1a"` background), label + desc, chevron. Danger variant (`featureCardDanger`) for Revoke All. Entire card is a `<button type="button">` (a11y).

### Journey strip (`.journeyStrip`, `.journeyItem`, `.journeyDot`, `.journeyLine`, `.journeyPulse`)
Compact horizontal timeline — done/current/pending states, pulse on current, tags (`In progress` / `Up next`), date + meta under title.

### Activity (`.activityCard`, `.activityRow`, `.activityIcon`, `.activityAmt`)
Single card, 5 rows; icon tinted by tone; amount `+`/`−` colored in/out.

### Dashboard cards (`.dashGrid`, `.dashCard`)
`repeat(auto-fill, minmax(240px, 1fr))`; icon + `notifDot` (action needed) or last-touched; status badge; actions: route links (`Enter` → `/pm/app/transfer-overview`, `/cards/app`, `/utility`) or buttons (`Activate`/`Revoke` via `d.modal`, permissions icon).

### Badges (`.badge`, `.badgeSuccess/Warning/Danger/Grey`)
Soft pill with icon, 11px.

### Buttons (`.button`, `.buttonPrimary`, `.buttonGhost`, `.buttonDanger`, `.buttonSmall`, `.buttonMd`, `.buttonSm`)
10px radius, 13px, weight 600 max; primary = emerald; ghost = bordered white; danger = red soft.

## 5. TABLE

Flow-chart account table (`.flowTable*`): sticky header, account (icon+name+number), origin, balance, permission, status (`Active`/`Revoked` soft pills), actions (`View`/`Unlink` buttons). `flowTableRowDisabled` for revoked rows. Wrapped in `flowTableWrapper` (border + radius + shadow) with horizontal scroll on overflow.

## 6. MODAL

All 17 modals use the **shared primitives** from `transaction-dashboard/shared/components/modals.tsx` (`ModalShell`, `SimpleModal`, `FlowModal`, `TabbedModal`, `Toggle`, `SelectField`, `InfoBox`, `ReviewRow`, `PinRow`), styled by `appPage.module.css`. No legacy `MBox`/`BusyOverlay` markup. Modals render inline inside `.waPage`, so the `.waPage` tokens cascade into them.

## 7. WIZARD / STEPPER (FlowModal) + TABBED MODALS

- **FlowModal wizards:** Activate Dashboard (consent suite → PIN gate → tour/link/preferences exits), Link Account (source → destination → permissions → PIN), Relocate Funds (8 steps incl. amount/percentage split), Unlink (reason → PIN).
- **Tour stepper** (`tourGuideModal`): 8-step tour with own progress dots (buttons, `aria-label`), step icons, title/desc.
- **TabbedModal:** link permissions (presets/granular/limits/schedule), flow control, relocation details.
- **PinRow** from shared primitives (4- and 6-digit).

## 8. SECTION HEADERS

Numbered `01`–`05` (`sectionIndex`), icon tinted by tone, title, sub-copy; action button on the right (e.g., Replay Tour).

## 9. PAGE HIERARCHY (numbered sections)

- **Console** — crumb + search + help.
- **Hero** — identity + status + stats + 3 actions + account strip.
- **Tabs** — Overview | Live Flow | Dashboards | Manage.
- **01 Quick Actions** — 8 feature cards (Activate, Link, Manage Links, Relocate, Permissions, Alert Routing, Limits, Guided Tour).
- **02 Activation Journey** — 6-step compact strip.
- **03 Recent Activity** — 5 rows.
- **04 Your Dashboards** — 8 dashboard cards.
- **05 Security, Privacy & Support** — 6 utility cards (Privacy, Preferences, Support, Sample Receipt, Activation Proof, Revoke All).
- **⌘K Command Palette** — search overlay (14 commands + `go:` routes).
- **Toast** — copy/action feedback.

## 10. KPI / STAT CARDS

Hero stats (not separate KPI cards — reduction): Available balance (KES 1,284,300), Consent health 9/9, Pending activations (count), Linked balance. `heroStatLabel` 11px muted + `heroStatValue` Space Grotesk 20px.

## 11. FORMS

Shared `formControl`/`formLabel` (from `appPage.module.css`); labels always `htmlFor`-paired with `id` (Biome `noLabelWithoutControl` clean); day-picker chips wrapped in `<fieldset><legend>`; `Toggle` for switches; `SelectField` for channels; quiet hours = two `type="time"` inputs in `fieldGrid`; limit inputs with KES placeholders.

## 12. TOASTS / DRAWERS / SCROLLBAR / ANIMATIONS

- **Toast** — fixed bottom-center, check icon, 2.2s auto-dismiss (copy feedback).
- **Palette** — backdrop (click to close) + panel + input + grouped list with kbd hints; keyboard: ⌘K toggle, arrows + Enter via active index.
- **Reveal** — small scroll/entrance fade-up helper (staggered `delay`).
- **Flow chart** — animated SVG connectors (`flowLineAnimated`), lane pulse on newly linked, hover cards with permission details, live-dot legend.

## 13. RESPONSIVE BREAKPOINTS

- `@media (max-width: 992px)` — flow chart lanes → stack, lanes strip horizontal scroll, hero stats wrap.
- `@media (max-width: 768px)` — console wraps, hero chips wrap, feature/dash grids → 1–2 columns, journey strip scrolls horizontally, tabs scrollable.
- `@media (max-width: 480px)` — hero actions stack full-width, stats 2×2, palette full-screen.

## 14. STATUS-TO-TONE MAP (wallet-specific)

| Status | Tone | Badge |
|---|---|---|
| Active | success | `bi-check-circle` |
| Activation Pending / Not Activated | warning | `bi-hourglass-split` |
| Suspended | danger | `bi-exclamation-octagon` |
| Grey/neutral | grey | `bi-circle` |
| Link Active / Paused | success / warning | soft pill in flow table |

## 15. IMPLEMENTATION ARCHITECTURE

- `page/WalletActivation.tsx` — data (wallet, dashboards, activeLinks, journeySteps, features, utilities, activity), `Reveal`, `CommandPalette`, main component with `modalState`/`openModal`/`closeModal`, `?modal=` deep-link handler, ⌘K handler, `flash()` toast, copy handler, tab state.
- `components/AccountFlowChart.tsx` — retained flowchart (lanes, SVG connectors, hover cards, table view, mobile strip). `links.map((link, i)` lanes; `flowLane` is a `<fieldset>` (CSS reset `border:0; margin:0; min-inline-size:0`).
- `modals/WalletActivationModals.tsx` — 17 shared-primitive modals; `supportFaq` accordion folded into `supportHelpModal` (HowItWorks content hidden in modal); Relink button for paused links in `activeLinksModal`.
- `styles/walletActivation.module.css` — self-contained tokens on `.waPage` + flow/button/palette/toast + page styles (5 unused utility classes retained: `buttonAccent`, `flowChartCtl`, `flowLaneRight`, `flowLineAnimated`, `flowTablePlaceholder`).
- **Removed (consolidation):** `HowItWorks.tsx`, `ManagementHub.tsx` (content folded into `supportHelpModal` FAQ + feature/utility cards); legacy pageBar, More popover, cmdBar chips, ticker, FAB, banner-split.
- Route: `src/routes/wallet-activation.tsx` + `src/routes/__root.tsx` hides the particle canvas on this path.

## 16. SHARED MODAL ARCHITECTURE (17 modals)

All reachable (literal entry points + `?modal=` deep links):

| Modal | Opens from |
|---|---|
| `activateDashboardModal` | Hero button, Quick Action card, dashboards card, palette, `?modal=` |
| `activationSuccessModal` | Manage → Activation Proof card, `?modal=` |
| `tourGuideModal` | Quick Action card, Journey Replay Tour, palette, `?modal=` |
| `linkAccountModal` | Hero button, Quick Action card, flow success step, palette, `?modal=` |
| `linkPermissionsModal` | Quick Action card, dashboards permissions icon, palette, `?modal=` |
| `linkNotificationsModal` | Quick Action card, `?modal=` |
| `linkFlowControlModal` | nested: `activeLinksModal` |
| `activeLinksModal` | Quick Action card, dashboards card (Loans/Savings), palette, `?modal=` |
| `unlinkAccountModal` | nested: `activeLinksModal` |
| `relinkAccountModal` | nested: `activeLinksModal` (Paused row) |
| `revokeAllAccessModal` | Manage → Revoke All card, Crypto dashboard card, palette, `?modal=` |
| `moneyRelocationModal` | Hero button, Quick Action card, palette, `?modal=` |
| `relocationReceiptModal` | Manage → Sample Receipt card, `?modal=` |
| `supportHelpModal` | console help icon, Manage → Support card, palette, `?modal=` |
| `linkLimitsModal` | Quick Action card (Limits), `?modal=` |
| `privacyModal` | Manage → Privacy Center card, palette, `?modal=` |
| `preferencesModal` | Manage → Preferences card, activation flow "Set Preferences", palette, `?modal=` |

## 17. CODE-COMPLETE CHECKLIST (refined August 30, 2026)

### Theme and typography
- [x] Self-contained `.waPage` tokens (PayMo emerald/ink set) — standalone route renders themed even with no AppShell.
- [x] Inter body / Sora headings; non-bold (≤600) chrome fonts.
- [x] Bootstrap Icons imported by the page (`bootstrap-icons/font/bootstrap-icons.css`) — icons render on the standalone route.

### Page structure (minimal hub)
- [x] Console (crumb + ⌘K search + help), single hero card, 4 tabs, 5 numbered sections max.
- [x] Feature cards small & auth/hub-sized; journey compact strip; activity single card; dashboards grid.
- [x] `HowItWorks`/`ManagementHub` removed; FAQ + guides folded into `supportHelpModal`.
- [x] Retained `AccountFlowChart` with modern flow styling.

### Accessibility and lint
- [x] Biome clean (a11y, parse, organizeImports) across page, chart, modals, CSS.
- [x] Labels `htmlFor`-paired; day chips in `<fieldset><legend>`; flow lanes `<fieldset>`; buttons typed; palette items `type="button"`; anchor → button.

### Modals
- [x] 17 modals on shared primitives; 17/17 reachable; `?modal=` deep links supported.

## 18. MANUAL VISUAL-QA CHECKLIST

### Desktop — 1440 × 900
- [ ] Hero renders navy gradient with emerald accents; chips/stats readable; fonts = Sora/Inter.
- [ ] Feature cards 4–5 per row; journey strip horizontal; activity rows aligned.
- [ ] Flow tab: lanes + SVG connectors + hover cards; table view on toggle.
- [ ] Modals open with overlay, centered, footer buttons; PIN rows focus-stepped.

### Compact/tablet — 1024 × 768 and 768 × 1024
- [ ] Tabs wrap; grids 2 columns; flow lanes stack; palette fits.

### Mobile — 390 × 844
- [ ] Hero actions stack; stats 2×2; journey scrolls; no horizontal page overflow.

## 19. RELEASE GATES

| Gate | Result |
|---|---|
| Biome (`npx biome check src/features/dashboards/wallet-activation/ src/routes/wallet-activation.tsx`) | ✅ clean (0 errors) |
| Vitest (`npx vitest run`) | ✅ 9/9 passed |
| Per-page tsc (`npx tsc -p tsconfig.wallet-activation-check.json`) | ✅ 0 errors in wallet-activation/shared files |
| Client + server prod build (`npx vite build`) | ✅ built (dist/client + dist/server) |
| Route HTTP (`/wallet-activation`) | ✅ 200 with SSR markers (hero, console, sections) |
| `?modal=` deep links (17) | ✅ all 200 |
| Modal reachability | ✅ 17/17 literal + nested entry points |
| CSS-reference audit | ✅ page+chart used ⊆ defined; modals `s.*` ⊆ shared |
| `git diff --check` | ✅ clean |
| Dev server | ✅ `server.host: "0.0.0.0"` (vite.config.ts) |
