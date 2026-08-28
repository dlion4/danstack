# Payment Rails & Routing — PayMo Business Design Blueprint

The Payment Rails & Routing workspace (**Control Tower**) is rebuilt in the
exact navy/emerald PayMo business-dashboard language used by Initiate
Transfer, Transfer Overview and Onboarding. This document is the feature-level
companion to `transfer-overview/DESIGN-BLUEPRINT.md` (the design authority):
use it to understand the page structure, data contract and workflows, and to
keep future changes consistent.

- **Route:** `/pm/app/payment-rails` → `src/routes/pm/app.payment-rails.tsx`
- **Page:** `pages/PaymentRails.tsx` (default export `PaymentRails`)
- **Modals:** `components/PaymentRailsModals.tsx` (`PaymentRailsModals`,
  data type `PaymentRailsData`)
- **Styles:** `styles/paymentRails.module.css` (scoped, `--pr-*` tokens)

## Design language

- **Executive navy hero.** A `115deg` navy → emerald gradient
  (`#0b1322 → #123a2c → #0d5c38`) with decorative radial orbs, an eyebrow
  ("Payment Rails & Routing" + live-rails pulse pill), a bold Sora headline,
  supporting copy, primary/secondary actions and a glass **network snapshot**
  card (monthly volume, connected banks, open issues, SLA success).
- **Numbered business sections.** Each section carries a dark index chip
  (`01`–`06`), Sora heading and a one-line description — matching
  initiate-transfer/onboarding.
- **PayMo green** `#12b76a` (dark `#0b8f52`, deep `#075c38`) for primary
  actions, live/healthy states and accents; amber for degraded/SLA-watch; red
  for disabled/expired/critical; neutral for paused. No Bootstrap buttons,
  alerts or spinners — all chrome is hand-built.
- **Typography:** Sora for headings/hero/numbers; Inter for body.
- **Icons:** Bootstrap Icons only (`bi-*`), always with `aria-hidden` on
  decorative icons.
- **Motion:** `prefers-reduced-motion` disables pulse/toast animations and
  transitions; CSS-only keyframes otherwise.

## Data & state

- **TanStack Query:** key `["paymo-payment-rails"]`, `queryFn` fetches
  `GET /api/payment-rails`, `initialData: initialMockData` with
  `data ?? initialMockData` fallback, `staleTime: 60_000`, `retry: 1`.
  When the fetch fails, a red cloud notice renders above the sections and the
  cached/mock snapshot keeps every workflow usable.
- **Page content type** `PaymentRailsContent` (exported from the page and
  re-imported by the modal file — type-only, no runtime cycle):
  - `hero` — snapshot metrics (rails configured, active banks, monthly volume,
    success rate)
  - `stats` — KPI values (active rails, connected banks, monthly rail cost,
    attention count)
  - `attention` — open operational items; each carries an `action`
    (`nostroModal` | `railConfigModal` | `bankHealthModal`) and optional
    `bank` for deep-linking
  - `suggestions` — AI routing-copilot recommendations with priority, savings
    estimate and target `action` (`railConfigModal` | `routingRulesModal` |
    `nostroModal`)
  - `quickActions` — 8 command buttons, each wired to a modal id
  - `banks` — 8 counterparties (Equity degraded, Family paused) with rails,
    currencies, health score, latency and monthly cost
  - `routingRules` — 4 priority rules (International USD paused) with
    condition, preferred rail, traffic share and monthly volume
  - `rails` — 5 rail configs (SWIFT disabled / MT103 credentials expiring)
    with cutoff, cost, SLA, failure rate and limits
  - `nostro` — USD/EUR/GBP nostro and KES vostro accounts with balances,
    utilization and status
  - `performance` — per-rail uptime vs SLA target, volume, latency
  - `auditTrail` — latest compliance entries
  - `healthCheck` — last-run summary with per-bank reachability
- **Modal control:** a single `activeModal` string id plus `activeBank` and
  `activeRail` context selectors; `go(id)` opens, cross-modal navigation
  (e.g. attention → bank drill-down; health results → inspect bank) switches
  ids in place.
- **Toasts:** capped stack (`aria-live="polite"`), auto-dismiss 4.2s, green
  success / red danger variants.

## Page anatomy (top → bottom)

1. **Hero** — headline, copy, "Run rail health check" + "Add bank connection"
   actions, network snapshot card.
2. **Alert strip** — offline notice (if query failed) and the SWIFT credential
   warning with a deep link into the SWIFT rail tab.
3. **KPI row** — active rails, connected banks (with degraded/paused footnote),
   monthly rail cost, open attention items.
4. **Section 01 — Attention, suggestions & quick actions.** Three queue cards:
   attention items (severity icon → context-aware workflow), AI suggestions
   (priority badge + savings + Apply), and an 8-button quick-action grid.
5. **Section 02 — Connected banks directory.** Search box (bank/rail), status
   filter chips (All/Active/Degraded/Paused), health-check & add-bank actions;
   semantic table with rail badges, health bars, latency, cost and a
   drill-down button per bank; empty state for no matches.
6. **Section 03 — Routing rules & rail configuration.** Internal tabs
   (`routing rules` / `rail config`). Rules view: numbered priority rows with
   condition → rail, traffic share, monthly volume and edit/A/B-test actions.
   Config view: rail table (status badge, cutoff, cost, SLA, failure rate) with
   per-row configure deep link.
7. **Section 04 — Rail performance analytics.** Four uptime cards with SLA
   bars and volume/latency stats, plus "full report" action.
8. **Section 05 — Nostro & vostro liquidity.** Account rows with utilization
   bars and balances beside a treasury-tools grid (FX rebalance, manage
   accounts, reconcile, export).
9. **Section 06 — Configuration audit trail.** Recent activity table with
   "view full audit log".
10. **Footer** — product mark and in-page section navigation (smooth scroll).
11. **Floating command bar** — fixed bottom-center: Add bank (primary),
    Health check, Routing, Export, Reconcile; icon-only on small screens.
12. **Toast stack.**

## Modal workflows

All 13 dialogs use the shared primitives in
`shared/components/modals.tsx` (`ModalShell`, `SimpleModal`, `FlowModal`,
`TabbedModal`), which bring focus trapping, Escape/backdrop close,
scroll-lock, labelled dialogs and their own token scopes (`.modalOverlay`
defines the palette, so dialogs render consistently on any page root).

| Modal id | Primitive | Workflow |
| --- | --- | --- |
| `addBankModal` | SimpleModal | Institution name, contact email, rails to request; success state |
| `routingRulesModal` | TabbedModal | Rules tab (priority rows + active/paused switches) and Engine settings tab (cost-aware routing, failover, nostro limits, AI suggestions); "Publish rules" |
| `railConfigModal` | TabbedModal | One tab per rail (requested rail sorted first via `activeRail`); enabled/credential warnings, cutoff/SLA/cost/limit fields, live stats, enable switch |
| `nostroModal` | ModalShell | Data-driven nostro/vostro table from `data.nostro` (balances, utilization progress, status); cross-links to FX rebalance |
| `fxRebalanceModal` | FlowModal (2 steps) | Source & amount → confirm/execute; accounts populated from data |
| `healthCheckModal` | ModalShell | Animated per-bank scan with `progressbar`, results + issue drill-downs; reports completion via toast |
| `bankHealthModal` | ModalShell | Health score, latency, cost, enabled rails and last-5 health events for the selected bank (`activeBank`); re-test action |
| `performanceModal` | ModalShell | Full 30-day performance table; cross-links to export |
| `reconcileModal` | FlowModal (2 steps) | Match & review (accounts + pending break) → post entries (FlowModal success receipt) |
| `exportReportModal` | SimpleModal | Period, sections, format; success state |
| `abTestModal` | SimpleModal | Control/variant rails, variant traffic split, auto-rollback switch |
| `attentionModal` | ModalShell | All open items with context-aware resolve buttons |
| `auditLogModal` | ModalShell | Full audit-trail table from `data.auditTrail` |

Fixes carried in this rebuild (behavior preserved): the audit log is its own
dialog (previously aliased to the reconciliation modal), nostro balances come
from real data instead of `banks.slice(0, 4) + Math.random()`, bank health is
driven by `activeBank` instead of being hardcoded to Equity, paused banks
render neutral badges, and every list modal (routing, rail config, nostro,
performance, audit) reads the page payload.

## Accessibility

- Semantic landmarks (`main`, `header`, `section` with `aria-labelledby`,
  `footer`, `nav`), real `<h1>/<h2>/<h3>` hierarchy and table captions.
- Dialogs: focus trap, autofocus, focus restore, Escape/backdrop dismissal,
  `role="dialog"` + `aria-modal` (provided by primitives); switches carry
  `aria-checked`, progress scan exposes `role="progressbar"` values.
- Filter/tab chips use `aria-pressed`/`role="tab"` + `aria-selected`; the
  live toast region is `aria-live="polite"`.
- Color is never the only signal — statuses pair badges with icons and text.

## Responsive rules

- `≤1279px`: KPIs collapse to 2 columns; queues stack; performance cards 2-up;
  floating bar centers to viewport (shell sidebar offset dropped).
- `≤1023px`: hero copy/snapshot rebalance; `≤767px` hero stacks, snapshot
  full width, floating bar spans edges with wrapped labels; `≤575px` KPIs and
  quick actions go single-column and floating bar uses icon-only buttons.
- Wide tables are horizontally scrollable inside `.tableWrap`.

## Validation gates

Run before reporting changes: targeted Biome on the feature, Vitest (full
suite), CSS-module reference audit (0 missing classes), modal reachability
audit (all modal ids opened from page/modal controls; 0 dangling targets),
filtered `tsc --noEmit` (`grep -i payment-rails` → no diagnostics), production
client+server build, `/pm/app/payment-rails` returns HTTP 200 with hero/section
markers in SSR output, and `git diff --check` clean.
