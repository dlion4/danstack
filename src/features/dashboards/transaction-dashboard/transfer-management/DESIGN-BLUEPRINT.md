# PayMo Transactions — Transfer Management Design Blueprint

> Implementation target: `transaction-dashboard/transfer-management/`  
> Shared context: completed `/pm/app` shell and Transfer Overview  
> Last reconciled: August 28, 2026

---

## 1. Purpose and acceptance contract

Transfer Management is the operational workspace for initiating, monitoring, approving and reconciling bank transfers. It must look and behave like the PayMo business dashboard—not like a standalone legacy utility page.

The implementation is accepted when it:

- uses the shared navy/emerald PayMo Transactions shell;
- preserves both `/pm/app/transfer-management` and `/pm/app/transfers`;
- preserves `data ?? initialMockData` so an API outage does not blank the page;
- preserves every existing transfer workflow ID and makes each workflow reachable;
- presents domestic rails, cross-border transfers, FX, schedules, history, limits, approvals and compliance in a clear operational sequence;
- meets the dialog, keyboard, responsive and reduced-motion requirements below.

---

## 2. Visual system

### Exact tokens

| Role | Value |
|---|---|
| Primary emerald | `#12b76a` |
| Dark emerald | `#0b8f52` |
| Soft emerald | `#e7f8ef` |
| Primary ink | `#101828` |
| Secondary ink | `#344054` |
| Muted text | `#667085` |
| Canvas | `#f2f4f8` |
| Card | `#ffffff` |
| Border | `#e6e9f0` |
| Navigation navy | `#0b1322` |
| Warning | `#f79009` |
| Danger | `#f04438` |
| Information | `#2e90fa` |
| Violet | `#7a5af8` |
| Card radius | `16px` |

### Typography

- Interface/body/control copy: `Inter`.
- Display headings and KPI values: `Sora`, falling back to `Inter`.
- Page display heading: responsive `2rem–3.35rem`, tight `1.08` line-height.
- Section heading: `1.06rem`, Sora 700.
- Table header: `0.63rem`, uppercase, `0.07em` tracking.
- Table cell: `0.74rem`; status text always accompanies status colour.
- Fonts remain globally loaded by `src/routes/__root.tsx`; the feature adds no network font import.

### Core components

- Cards: white, 1px cool-grey border, 16px radius, restrained dual-layer elevation.
- Controls: 9–10px radius, minimum 36–42px height, visible emerald focus halo.
- Primary buttons: emerald fill and white text; hover uses dark emerald.
- Secondary buttons: white or transparent surface, cool border, dark text.
- Status badges: pill radius with soft green, amber, red, blue, violet or neutral surface.
- Icons: Bootstrap Icons; icon-only actions require contextual accessible names.

---

## 3. Information architecture

### Executive hero

**Message:** “Move money at scale, without losing control.”

The hero must contain:

1. transfer-control and live-rail status pills;
2. one clear operational statement;
3. New transfer, International and Bulk upload actions;
4. an August transfer snapshot;
5. connected-bank, FX-corridor and rail-uptime metrics.

The background is the same navy-to-emerald business gradient used by Transfer Overview. Decorative orbs are inert and never obscure text.

### 01 — Operational pulse

Four equal KPI cards:

1. transferred today;
2. pending approval;
3. 30-day success rate;
4. average settlement.

The existing API/mock statistics remain the source for three cards; today’s transfer card is derived from the existing hero snapshot. Supporting context is retained instead of being reduced to decorative numbers.

### 02 — Action centre

- Transfer exceptions and smart suggestions are separate but equally weighted cards.
- Each list row has one concise action.
- Eight frequent workflows remain visible in the workflow launcher.
- “Review queue” opens the existing attention workflow.

### 03 — Domestic transfer rails

- Responsive activity table for PesaLink, EFT and RTGS.
- Beneficiary identity, bank, amount, rail, text status and action are all visible.
- Bank connectivity panel retains every bank and rail note.
- Bank directory and transfer-health workflows are directly reachable.

### 04 — International and FX desk

- Cross-border table retains destination, source amount, rate, transfer method, status and receipt/tracking action.
- KES exchange panel retains every existing rate and delta.
- International transfer and FX-rate workflows remain reachable.

### 05 — Scheduled and recurring transfers

- Upcoming runs use a compact calendar/list composition rather than a second dense desktop table.
- Name, beneficiary, frequency, amount, state and edit/approval action remain present.
- New schedule and recurring-rule actions retain their workflow IDs.

### 06 — History and reconciliation

- Search matches reference, beneficiary, bank, amount and method.
- Status filters cover the actual snapshot values: All, Success, Processing and Delivered.
- Zero matches produce a meaningful empty state and reset action.
- Reconcile, export, receipt and tracking workflows remain connected.

### 07 — Limits, approvals and compliance

Three aligned governance cards retain:

- all four transfer-limit values;
- all four maker-checker approval bands;
- AML, sanctions and KYC assurance states;
- direct access to limits, approval queue and compliance workflows.

### Persistent commands

Desktop receives a floating command bar for New transfer, Schedule, Bulk upload and Beneficiaries. Mobile keeps the primary label and switches secondary commands to icon-first controls to protect space.

---

## 4. Data and workflow contract

### Query fallback

The page must retain:

```tsx
const data = remoteData ?? initialMockData;
```

The feature may derive presentation-only fields from this snapshot, but it must not replace the API contract or remove source content. When the live query fails, the page shows the local operating snapshot and an unobtrusive status notice.

### Required workflow IDs

All 21 IDs below are preserved in `TransferManagementModals.tsx` and reachable from the page or a data-driven action:

- `initiateTransferModal`
- `internationalModal`
- `scheduleTransferModal`
- `recurringModal`
- `bulkTransferModal`
- `beneficiaryModal`
- `approvalQueueModal`
- `transferHistoryModal`
- `attentionModal`
- `complianceModal`
- `bankStatusModal`
- `bankDirectoryModal`
- `transferHealthModal`
- `fxRatesModal`
- `reconciliationModal`
- `limitsModal`
- `editRecurringModal`
- `transferReceiptModal`
- `intlReceiptModal`
- `trackTransferModal`
- `trackIntlModal`

`Ctrl/Cmd + K` opens `initiateTransferModal` as a keyboard accelerator. Opening a workflow replaces the active modal state instead of stacking accidental dialogs.

---

## 5. Dialog and form contract

The shared transaction modal primitives now define the management workflow behaviour:

- modal content uses `role="dialog"`, `aria-modal="true"` and a valid `aria-labelledby` target;
- the close control receives initial focus;
- Tab and Shift+Tab are trapped inside the active dialog;
- Escape and the semantic backdrop button close the dialog;
- body scrolling is locked and its previous state is restored;
- focus returns to the invoking control after close;
- mobile dialogs become bottom sheets with a maximum `92dvh` height;
- modal timers are cancelled on close/unmount;
- success messages are announced with semantic output;
- every applicable field label is associated with its input or select;
- the PIN is a labelled fieldset, accepts numeric characters and advances focus;
- wizard progress is a semantic ordered list with current/completed states;
- segmented tabs expose tablist, tab and tabpanel semantics and support Left, Right, Home and End keys;
- buttons that do not natively submit a form use `type="button"`.

The simple-modal submission path must show its success receipt whenever `successMsg` exists, even when no custom `onSubmit` callback is supplied.

---

## 6. Responsive contract

### `>= 1280px`

- Four KPI cards in one row.
- Domestic and international areas use table + status side panels.
- Eight quick actions appear in one compact launcher row.
- Floating bar centres within the workspace.

### `1100–1279px`

- KPI cards become two columns.
- Domestic and international panels may stack.
- Quick actions become four columns.
- Governance may use two columns with the final card spanning the row.

### `< 768px`

- Hero, attention, data panels and governance become one column.
- Section actions wrap below headings.
- Table controls stack; tables scroll within cards rather than widening the document.
- Schedule rows hide secondary frequency/amount columns while preserving name, date, state and action.
- Floating commands stretch across the viewport.

### `< 576px`

- KPI cards become one column.
- Quick actions use two columns.
- Hero actions wrap to practical touch widths.
- Dialogs dock to the bottom edge.
- PIN controls fit at 320px viewport width.
- Reduced-motion preferences disable decorative pulse and transition motion.

---

## 7. Code-complete checklist

### Theme and hierarchy

- [x] Uses exact PayMo business emerald/navy/cool-grey tokens.
- [x] Uses Inter for UI copy and Sora for display values/headings.
- [x] Uses one executive hero followed by seven numbered operational sections.
- [x] Uses feature-scoped CSS rather than mutating every transaction page.
- [x] Uses a centred maximum content width of 1500px.
- [x] Uses consistent card, badge, icon and control treatments.

### Operational content

- [x] Retains all domestic transfer rows and bank-health details.
- [x] Retains all international transfer rows and FX rates.
- [x] Retains all schedules and recurring-payment states.
- [x] Retains the complete transfer-history snapshot.
- [x] Retains limits, approval bands and compliance statuses.
- [x] Keeps all 21 modal workflow IDs reachable.
- [x] Keeps both route entry points intact.
- [x] Keeps `data ?? initialMockData` fallback behaviour.

### Interaction and accessibility

- [x] History search and status filters are functional.
- [x] History filtering has a useful empty state and reset control.
- [x] Tables have captions, scoped headings and internal horizontal overflow.
- [x] Icon-only actions have contextual accessible names.
- [x] Focus styling is visible across links, controls and fields.
- [x] Forms have associated labels; PIN input is a labelled group.
- [x] Shared dialogs are labelled, focus-trapped, Escape-closeable and focus-restoring.
- [x] Wizard and tab semantics are exposed to assistive technologies.
- [x] Mobile bottom sheets and reduced-motion behaviour are implemented.

### Validation completed

- [x] Targeted Biome checks pass for the page, feature stylesheet, workflow host and shared modal primitives.
- [x] Targeted TypeScript output contains no diagnostics for the edited page or shared modal primitives.
- [x] Vite production client/server build passes (August 28, 2026).
- [x] `/pm/app/transfer-management` responds HTTP 200 in the local preview.
- [x] `/pm/app/transfers` responds HTTP 200 in the local preview.
- [x] The SSR response contains the redesigned hero copy.

---

## 8. Manual visual-QA gates

These remain reviewer gates and are intentionally not claimed as automated validation.

### Desktop — 1440 × 900

- [ ] Hero radius, spacing, gradient and type scale visually match Transfer Overview.
- [ ] Four KPI cards align to equal height.
- [ ] Action-centre rows and quick actions remain balanced with long copy.
- [ ] Domestic/international side panels align with their table cards.
- [ ] Floating commands do not obscure the final governance cards or footer.

### Tablet — 1024 × 768 and 768 × 1024

- [ ] Shell opens off-canvas with one backdrop and no content jump.
- [ ] KPI grid uses two columns and operational panels stack cleanly.
- [ ] Tables scroll inside their cards without document-level horizontal scrolling.
- [ ] Dialogs remain above shell drawers and fixed commands.

### Mobile — 390 × 844 and 360 × 800

- [ ] Hero copy and all actions remain readable and tappable.
- [ ] Sections form one logical reading order.
- [ ] Schedule rows preserve date, beneficiary, state and action.
- [ ] Floating controls do not block page content.
- [ ] Every workflow opens as a scrollable bottom sheet with visible footer actions.
- [ ] PIN inputs and wizard progress fit without two-dimensional page scrolling.

### Keyboard and assistive technology

- [ ] Keyboard order follows the visual order from hero through footer.
- [ ] Open each of the 21 workflows and verify Escape, backdrop close and focus return.
- [ ] Complete domestic and international wizard flows and verify progress/receipt states.
- [ ] Operate modal tabs with Left, Right, Home and End.
- [ ] Test search/filter/reset with keyboard only.
- [ ] Verify usability at 200% browser zoom.
- [ ] Run contrast and accessibility tooling against live data before release.

### Real-data release gates

- [ ] Test empty arrays and API errors.
- [ ] Test long beneficiary and bank names.
- [ ] Test very large KES amounts and non-KES currencies.
- [ ] Verify real approval/compliance status vocabulary maps to a readable tone.
- [ ] Confirm date formatting and timezone treatment with production payloads.
