# Mobile Money & PSP Hub — PayMo Business Design Blueprint

The Mobile Money & PSP Integration Hub is rebuilt in the exact navy/emerald
PayMo business-dashboard language used by Initiate Transfer, Payment Rails and
Onboarding. This document is the feature-level companion to
`transfer-overview/DESIGN-BLUEPRINT.md` (the design authority): use it to
understand the page structure, data contract and modal workflows, and to keep
future changes consistent.

- **Route:** `/pm/app/mobile-money` → `src/routes/pm/app.mobile-money.tsx`
- **Page:** `pages/MobileMoney.tsx` (default export `MobileMoney`)
- **Modals:** `components/MobileMoneyModals.tsx` (`MobileMoneyModals`,
  data type `MobileMoneyData`)
- **Styles:** `styles/mobileMoney.module.css` (scoped, `--mm-*` tokens)

## Design language

- **Executive navy hero.** A `115deg` navy → emerald gradient
  (`#0b1322 → #123a2c → #0d5c38`) with decorative radial orbs, an eyebrow
  ("Mobile Money & PSP Hub" + a live-command-center pulse pill), a bold Sora
  headline, supporting copy, "Send money" (primary) / "Bulk transfer"
  (secondary) actions and a glass **network snapshot** card (today's volume,
  success rate, connected wallets).
- **Numbered business sections.** Sections 01–07 each carry a dark index chip,
  Sora heading and a one-line description.
- **PayMo green** `#12b76a` (dark `#0b8f52`) for primary actions, live/healthy
  states and accents; amber for warnings/pending/KYC-due; red for failures and
  pauses; blue for info; violet for AI/compliance; neutral for paused. No
  Bootstrap buttons/alerts/spinners in chrome — everything is hand-built.
- **Typography:** Sora for headings/hero/numbers; Inter for body.
- **Icons:** Bootstrap Icons only (`bi-*`), decorative icons `aria-hidden`.
- **Motion:** `prefers-reduced-motion` disables pulse/toast animations.

## Data & state

- **TanStack Query:** key `["paymo-mobile-money"]`, `queryFn` fetches
  `GET /api/mobile-money-hub`, `initialData: initialMockData` with
  `data ?? initialMockData` fallback, `staleTime: 60_000`, `retry: 1`.
  A red cloud notice renders if the fetch fails; the cached snapshot keeps
  every workflow usable.
- **Page content type** `MobileMoneyConfig` (exported from the page):
  - `hero` — live label, headline value ("12 wallets linked"), detail, buttons
    and snapshot metrics
  - `kpis` — pending settlement, today's volume, total mobile balance,
    compliance health
  - `attention` — failed B2C batch, KYC refresh, Airtel token expiry, each
    wired to its resolving modal
  - `suggestions` — AI copilot tips (B2B enablement, T-Kash volume switch,
    nightly reconciliation) with priority and target modal
  - `quickActions` — 8 command buttons
  - `wallets` — 4 business wallets (Paybill, Disbursement, Collections,
    Payroll Float) with provider, balance, limit, health and 24h volume
  - `snapshot` — total balance / net flow / pending settlement stat boxes
  - `linkedWallets` — 3 connected numbers with KYC, status and permissions
  - `recentTransfers`, `psps` (4 providers), `kycStatus`, `txnLimits`,
    `trendBars` (7-day), `reconciliation`, `supportContacts`,
    `alertSettings`, `integrationHealth`
- **Modal control:** a single `activeModal` id via `setActiveModal`;
  cross-modal navigation (attention → workflow, health check → wallet health)
  switches ids in place.
- **Toasts:** capped stack (`aria-live="polite"`), auto-dismiss 4.2s, green
  success / red danger.

## Page anatomy (top → bottom)

1. **Hero** — headline, copy, Send/Bulk actions, network snapshot.
2. **Offline strip** — only when the query fails.
3. **KPI row** — 4 cards with icon, value and contextual footnote.
4. **Section 01 — Attention, suggestions & quick actions.** Queue cards:
   operational items (severity icon → resolving workflow), AI suggestions
   (priority badge + action), 8-button quick-action grid.
5. **Section 02 — Mobile money portfolio overview.** Wallet search + health /
   link actions; semantic table with provider badges, balances, limits, health
   bars and 24h txns; portfolio snapshot stat boxes.
6. **Section 03 — Linked wallets & transfer hub.** Linked accounts table
   (KYC/status/perms, context actions: Complete KYC / Perms / Pause), quick
   transfer form (From/To/Amount → send or schedule) and recent transfers
   table (receipt / retry deep links).
7. **Section 04 — PSP integration management.** Provider table with status,
   API uptime and settlement; add-PSP and health-dashboard actions.
8. **Section 05 — Compliance, KYC & limits.** KYC register (full/partial/
   expired counts + bulk refresh), transaction limits + adjust action.
9. **Section 06 — Analytics, reconciliation & reporting.** 7-day CSS volume
   trend chart and reconciliation card (last run, run now, export reports).
10. **Section 07 — Support, alerts & integration health.** 24/7 contacts,
    alert switches (accessible `role="switch"`), live integration health and
    the health-check action.
11. **Footer** — product mark, in-page section nav plus Alerts and Profile
    entries (making `notifModal`/`profileModal` reachable).
12. **Floating command bar** — Send (primary), Bulk, Link, Reconcile, Export;
    icon-only on small screens.
13. **Toast stack.**

## Modal workflows

All 25 dialogs use the shared primitives in
`shared/components/modals.tsx` (`ModalShell`, `SimpleModal`, `FlowModal`,
`TabbedModal`), which provide focus trapping, Escape/backdrop close,
scroll-lock, labelled dialogs and their own token scopes.

| Modal id | Primitive | Workflow |
| --- | --- | --- |
| `sendMoneyModal` | FlowModal (4 steps) | Source funds → recipient (phone/till/paybill tabs + country) → review & fee breakdown → authorize (radio processing option + PIN auto-advance + STK hint); success receipt via the FlowModal end state |
| `bulkTransferModal` | FlowModal (5 steps) | Source & STK mode → recipients (Paymo users / manual entry with live add / paste list / CSV upload) → country & purpose → review & costs → authorize (PIN + live processing stats) |
| `linkWalletModal` | SimpleModal | Provider, phone, account type, notification/auto-reconcile switches |
| `walletDetailModal` | TabbedModal | Overview / Transactions / Limits / KYC tabs from page wallet data |
| `bulkRetryModal` | SimpleModal | Retry-47 options and amount summary |
| `reconcileModal` | FlowModal (2 steps) | Wallets + date range → run summary with report reference |
| `pspSettingsModal` | TabbedModal | Credentials (token-expiry warning) / limits / webhooks |
| `kycBulkModal` | SimpleModal | Account multi-select + outreach method |
| `disputeModal` | FlowModal (3 steps) | Transaction → evidence (description + file) → review; case id MMD-44987 |
| `walletPermissionsModal` | SimpleModal | Five permission switches (`role="switch"` + `aria-checked`) |
| `scheduleTransferModal` | SimpleModal | From/to/amount/datetime/frequency |
| `pspHealthModal` | ModalShell | Uptime/latency/error-rate/incident table |
| `limitSettingsModal` | SimpleModal | Per-transaction/daily/monthly limits + approval switch |
| `transferReceiptModal` | ModalShell | Structured receipt rows for a completed transfer |
| `pauseWalletModal` | SimpleModal | Reason + block switches; routes to `pauseConfirmModal` |
| `statementModal` | SimpleModal | Wallet, date range, format (PDF/Excel/CSV) |
| `walletHealthModal` | ModalShell | Health stat cards + per-wallet health table from page data |
| `addPspModal` | SimpleModal | Name, type, endpoint, settlement cycle |
| `contactSupportModal` | SimpleModal | Subject + message; ticket PSP-8821 |
| `healthCheckModal` | ModalShell | Overall/wallets/degraded/critical stats + link to wallet health |
| `attentionModal` | ModalShell | All open items with context-aware resolve buttons |
| `pspCompareModal` | SimpleModal | M-Pesa/Airtel/T-Kash fee, success and settlement comparison |
| `notifModal` | ModalShell | Failure / expiry / reconciliation notifications |
| `profileModal` | ModalShell | User card with linked-wallet and health stats |
| `pauseConfirmModal` | SimpleModal | Final confirmation before blocking a wallet (secondary-submit) |

Fixes carried in this rebuild while preserving every workflow and piece of
copy: the bespoke `MBox`/backdrop layer (no focus trap, `aria-label={id}`,
bootstrap `btn-close`) is replaced by the accessible shared primitives;
manual-recipient rows carry stable ids instead of `Math.random()`/index keys;
the PIN auto-advance chain is local to each wizard; previously unreachable
`notifModal`/`profileModal` (legacy commented header) are reachable from the
footer; the pause flow is an explicit two-step (form → confirmation).

## Accessibility

- Semantic landmarks (`main`, `header`, `section` with `aria-labelledby`,
  `footer`, `nav`), real heading hierarchy and table captions.
- Dialogs: focus trap, autofocus, focus restore, Escape/backdrop dismissal
  via the shared primitives; switches carry `role="switch"` + `aria-checked`;
  recipient tabs use `role="tab"` + `aria-selected`; the trend chart is a
  `role="img"` with an accessible name, per-bar detail via `title`.
- Statuses pair color with icons and text — never color alone.

## Responsive rules

- `≤1279px`: KPIs collapse to 2 columns; queues and stat boxes stack; the
  floating bar centers to the viewport.
- `≤1023px`: hero copy/snapshot rebalance; `≤767px` hero stacks, floating bar
  spans edges; `≤575px` KPIs/quick actions go single-column and the floating
  bar becomes icon-only.
- Wide tables scroll horizontally inside the shared table wrappers.

## Validation gates

Targeted Biome on the feature, Vitest (full suite), CSS-module reference audit
(0 missing classes), modal reachability audit (all 25 ids reachable from page
or modal controls; 0 dangling targets), filtered `tsc --noEmit`
(`grep -i mobile-money` → no diagnostics), production client+server build,
`/pm/app/mobile-money` returns HTTP 200 with hero/section markers in SSR
output, and `git diff --check` clean.
