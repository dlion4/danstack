# Payment Rails & Routing — Design Blueprint
> Implementation target: `transaction-dashboard/payment-rails/`
> Blueprint source: `transaction-dashboard/transfer-overview/DESIGN-BLUEPRINT.md`
> Last reconciled: August 28, 2026

---

## 1. Page Architecture

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `Layouts/shell/` | Fixed navy sidebar, translucent topbar, toasts, responsive offset |
| Payment rails page | `payment-rails/pages/PaymentRails.tsx` | Executive hero, KPI pulse, attention/suggestions, connected banks, routing rules, rail config, performance analytics, nostro/vostro, audit log |
| Payment rails modals | `payment-rails/components/PaymentRailsModals.tsx` | Shared modal dialogs (SimpleModal, FlowModal, TabbedModal) for all rail workflows |
| Page theme contract | `payment-rails/styles/paymentRails.module.css` | Page-level CSS tokens, hero, KPI grid, sections, floating bar, footer |

Do not add a local sidebar or page topbar. Routes below `/pm/app` inherit those from `AppShell`.

---

## 2. CSS Design Tokens

All tokens match the PayMo Business blueprint:

```css
/* Brand */
--pm-green: #12b76a;
--pm-green-dark: #0b8f52;
--pm-green-soft: #e7f8ef;

/* Neutrals */
--pm-ink: #101828;
--pm-muted: #667085;
--pm-bg: #f2f4f8;
--pm-card: #ffffff;
--pm-border: #e6e9f0;

/* Semantic */
--pm-warning: #f79009;
--pm-danger: #f04438;
--pm-info: #2e90fa;
--pm-violet: #7a5af8;
--pm-accent: #12b76a;
```

---

## 3. Page Sections

| Section | Index | Description |
|---------|-------|-------------|
| Executive Hero | — | Dark gradient banner with live status, KPI snapshot, primary actions |
| Payment Health Pulse | 1.1 | 3 KPI cards: success rate, avg settlement, monthly rail cost |
| Attention & Recommendations | 1.2 | 3-column: attention items, smart suggestions, quick action grid |
| Connected Banks Directory | 1.3 | Full-width table: bank, status, health, rails, settlement, limits |
| Routing Rules & Rail Config | 1.4 | 2-column: routing rules engine + rail configuration list |
| Rail Performance Analytics | 1.5 | Full-width table: rail, volume, success, avg time, cost |
| Nostro Accounts & Audit Log | 1.6 | 2-column: nostro/vostro positions + audit/compliance log |
| Floating Command Bar | — | Fixed bottom bar: Add Bank, Rules, Config, Health |
| Footer | — | Protected-by notice, support/settings links |

---

## 4. Modal Inventory

All modals use shared transaction primitives from `shared/components/modals.tsx`:

| Modal | Component | Notes |
|-------|-----------|-------|
| Connect New Bank | `FlowModal` | 4-step: Bank → Rails → Confirm → Done |
| Routing Rules Engine | `TabbedModal` | 2 tabs: Active Rules, New Rule |
| Payment Rail Configuration | `SimpleModal` | Table of rails with cutoffs and limits |
| Nostro / Vostro Accounts | `SimpleModal` | Read-only account list |
| Nostro FX Rebalance | `FlowModal` | 4-step: Position → Trade → Confirm → Done |
| Rail Health Dashboard | `SimpleModal` | 4 soft-box cards + bank health table |
| Bank Health Detail | `SimpleModal` | Warning callout + latency/error metrics |
| Rail Performance Report | `SimpleModal` | Full performance table |
| Rail Reconciliation | `SimpleModal` | Date range + rail selector |
| Export Rail Report | `SimpleModal` | Report type, date range, format |
| A/B Test ACH Rule | `SimpleModal` | Traffic split + duration |
| Attention Review Queue | `SimpleModal` | 3 action rows with cross-modal navigation |

---

## 5. Code-Complete Checklist

### Theme and typography
- [x] Emerald `#12b76a` as the only primary interaction color
- [x] `#0b1322` for navigation rail, `#f2f4f8` for canvas
- [x] Cool neutral borders `#e6e9f0`
- [x] Semantic colors for status: warning, danger, info, violet
- [x] Inter for body, Sora for headings/KPI values

### Shared shell
- [x] No local sidebar or header — shell provides those
- [x] Page renders within shell's `.mainContent` area

### Page structure
- [x] Executive hero with dark navy/emerald gradient
- [x] Six numbered sections (1.1–1.6)
- [x] KPI cards with edge indicators and badge supplements
- [x] Attention/suggestions grid with icon circles and row actions
- [x] Quick action grid for common rail workflows
- [x] Full-width data tables with responsive overflow
- [x] Two-column layout for routing/config and nostro/audit
- [x] Floating command bar with primary action
- [x] Page footer with compliance notice

### Modals
- [x] All 12 modals use shared SimpleModal, FlowModal, TabbedModal
- [x] FlowModal wizards: Add Bank (4-step), FX Rebalance (4-step)
- [x] TabbedModal: Routing Rules (Active + New Rule tabs)
- [x] Cross-modal navigation (attention → health, attention → config)
- [x] Focus trapping, Escape to close, body scroll lock
- [x] Mobile: bottom-sheet dialogs at 92dvh max

### Responsive
- [x] `>= 1200px`: 3-column KPI grid, full tables
- [x] `1100–1199px`: 2-column KPI, stacked sections
- [x] `768–1099px`: single-column hero, wrapped grids
- [x] `< 768px`: full-width everything, stacked actions
- [x] `< 576px`: single KPI column, icon-only floating bar

---

## 6. Release Gates

- [x] TypeScript typecheck passes — zero diagnostics in payment-rails files (August 28, 2026)
- [x] Shared modal components from `shared/components/modals.tsx` used consistently
- [x] CSS module created: `paymentRails.module.css` with page-level styles only
- [x] Executive hero added matching blueprint pattern
- [x] Numbered section headings (1.1–1.6) added
- [x] Floating command bar added
- [x] Page footer added
- [x] Pre-existing merge conflicts in TransferManagement.tsx do not affect this page
- [ ] Manual visual-QA checklist signed off by reviewer
