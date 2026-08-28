# PayMo Transactions — Initiate Transfer Design Blueprint

> Implementation target: `transaction-dashboard/initiate-transfer/`  
> Shared context: completed `/pm/app` shell, Transfer Overview and Transfer Management  
> Last reconciled: August 28, 2026

---

## 1. Purpose and acceptance contract

Initiate Transfer is the focused instruction-building workspace for moving funds through PayMo. It must guide an operator from transfer structure to final approval without hiding fees, rail health, beneficiary assurance or governance context. It must look and behave like the PayMo business dashboard—not like a standalone legacy form.

The implementation is accepted when it:

- uses the shared navy/emerald PayMo Transactions shell and the same business-dashboard visual language as Transfer Overview and Transfer Management;
- preserves `/pm/app/initiate-transfer`;
- preserves `initialData: initialMockData` and the explicit `remoteData ?? initialMockData` fallback so a query failure does not blank the workspace;
- preserves the complete eight-step transfer workflow: transfer type, sender, receiver, amount, rail, purpose/compliance, authorization and review/submit;
- progressively exposes a live transfer summary rather than requiring the operator to remember earlier choices;
- preserves quick actions, reusable templates, bulk upload, recipient management, verification, document upload, fee and rail workflows;
- preserves all 14 hosted modal IDs and makes every workflow directly reachable from an appropriate control;
- preserves touch navigation while protecting interactive form controls from accidental swipe changes;
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

- Interface, form and control copy: `Inter`.
- Display headings and KPI values: `Sora`, falling back to `Inter`.
- Page display heading: responsive `2rem–3.35rem`, tight `1.08` line-height.
- Section heading: `1.06rem`, Sora 700.
- Form labels and status copy remain compact but readable; status is never communicated by colour alone.
- Fonts remain globally loaded by `src/routes/__root.tsx`; the feature adds no network font import.

### Core components

- Cards: white, 1px cool-grey border, 16px radius and restrained dual-layer elevation.
- Controls: 9–10px radius, minimum practical touch height and a visible emerald focus halo.
- Primary buttons: emerald fill and white text; hover uses dark emerald.
- Secondary buttons: white or transparent surface, cool border and dark text.
- Status badges: pill radius with soft green, amber, blue, violet or neutral surfaces and explicit text.
- Icons: Bootstrap Icons throughout the page and workflow host; icon-only actions require contextual accessible names.
- Motion: short feedback transitions only; decorative pulse and transitions respect reduced-motion preferences.

---

## 3. Information architecture

### Executive hero

**Message:** “Send with confidence. Every detail checked before money moves.”

The hero must contain:

1. guided-transfer and live-engine status pills;
2. a clear explanation of the eight-step assurance process;
3. Quick transfer, Templates and Bulk upload actions;
4. a processed-today snapshot;
5. transfer-count, average-settlement and approval-workload metrics.

The background uses the same navy-to-emerald business gradient as the completed transaction pages. Decorative orbs are inert and never obscure content.

### 01 — Transfer readiness

Four equal KPI cards retain the existing operating snapshot:

1. transfer engine and processed value;
2. today’s transfer count and completion state;
3. average settlement performance;
4. pending approval count and value.

Each card pairs its number with context, status text and a distinct but system-consistent icon tone. Query failure produces an unobtrusive notice explaining that the latest local snapshot is in use.

### 02 — Build transfer instruction

The primary workspace combines:

- a percentage progress indicator;
- a semantic horizontal eight-step navigator;
- one focused step panel;
- Back, Continue and final Submit actions;
- a progressive live summary that adds sender, receiver, amount, rail, purpose and execution data as those stages are reached;
- a protected-transfer assurance footer.

The builder is the visual and interaction priority. Secondary operational content must not compete with the current task.

#### Step 1 — Transfer type

- Choose Single, Bulk or Recurring through explicit pressed-state cards.
- Single transfers expose standard and instant settlement preferences.
- Bulk transfers connect directly to file upload and preserve CSV, Excel and ISO 20022 support.
- Recurring transfers expose frequency and end-date controls.
- The operator is reminded that the completed instruction can become a reusable template.

#### Step 2 — Sender account

- Choose from every retained source account and visible balance; the account panel and live summary update with the selection.
- Show available balance, daily limit use, currency and verification state.
- Add source account remains available without leaving the workflow.
- Funding, account-state and daily-limit pre-checks are explained in context.

#### Step 3 — Receiver

- Preserve Bank, Mobile Money and PayMo Wallet destination modes.
- Bank mode retains bank and account-number fields plus account-name verification.
- Mobile mode retains network and telephone fields.
- Wallet mode retains wallet ID or email entry.
- Address book and save-beneficiary workflows remain directly accessible.
- Reversibility risk is stated before the operator continues.

#### Step 4 — Amount and currency

- Preserve all retained currencies and the available-balance reference.
- Present amount shortcuts as a labelled control group; 10%, 25% and available-balance actions update the amount.
- Itemize transfer amount, platform fee, selected rail fee, FX spread and estimated total debit as amount or currency changes.
- Expose the fee calculator directly from the amount workspace.
- Clarify that fees remain estimates until the rail is confirmed.

#### Step 5 — Payment rail

- Preserve Smart route and Manual routing modes.
- Present PesaLink, M-Pesa STK, RTGS and SWIFT with time, fee and success data; choosing a rail creates an explicit manual override and updates fees, summary and final review.
- Explain the recommended route using cost, speed and reliability rather than a decorative badge alone.
- Rail comparison remains directly reachable.
- Explain health monitoring and pre-debit failover.

#### Step 6 — Purpose and compliance

- Preserve purpose code and transfer narration.
- Preserve supporting-document upload for invoices, payroll files, approvals and KYC evidence.
- Preserve urgent/critical handling.
- Surface AML and sanctions pre-check status in context.

#### Step 7 — Authorization

- Show maker, checker and treasury approval responsibilities in sequence.
- Preserve execution scheduling.
- Preserve the 2FA requirement.
- Explain why the selected amount follows the three-level approval policy.

#### Step 8 — Review and submit

- Separate instruction details from execution assurance.
- Retain sender, receiver, amount, total debit, rail, ETA, reference and risk score.
- Summarize compliance, approvals and rail health before release.
- Preserve terms review, draft save and approval submission.
- Completion uses the retained submission receipt workflow.

### 03 — Built-in control checks

Three aligned assurance cards reinforce:

1. live rail monitoring and rail-health access;
2. verified destinations and recipient creation;
3. maker-checker policy and a direct jump to authorization.

### Persistent commands

Desktop receives a floating shortcut bar for Quick transfer, Templates, Bulk and Recipient. On narrow mobile screens, the primary action keeps its label while secondary actions become icon-first controls to preserve usable widths. The page footer retains security context, Support, Preferences and the application version.

---

## 4. Data and workflow contract

### Query fallback

The page must retain both the seeded query and explicit render fallback:

```tsx
useQuery({
  queryKey: ["initiateTransferData"],
  queryFn: fetchInitiateTransferData,
  initialData: initialMockData,
});

const data = remoteData ?? initialMockData;
```

The feature may derive presentation-only summary fields from this snapshot, but it must not replace the query contract or remove source content. When the live query fails, the page shows the local operating snapshot and explains that state without interrupting transfer creation.

### Required workflow IDs

All 14 IDs below are preserved in `InitiateTransferModals.tsx` and reachable from the primary page:

- `newTransferModal`
- `bulkUploadModal`
- `templateModal`
- `railHealthModal`
- `feeCalcModal`
- `railCompareModal`
- `addAccountModal`
- `beneficiaryModal`
- `verifyAccountModal`
- `uploadDocModal`
- `termsModal`
- `submitSuccessModal`
- `draftSavedModal`
- `addRecipientModal`

Opening a page workflow replaces the active modal-state map rather than stacking accidental dialogs. The Add Recipient success action may deliberately restart that same workflow for another entry.

### Summary contract

- Transfer type is visible from the first step.
- Sender details appear from step 2.
- Receiver details appear from step 3.
- Amount, fee and total debit appear from step 4.
- Rail, settlement time and rail fee appear from step 5.
- Purpose and narration appear from step 6.
- Execution time appears from step 7.
- The summary is a polite live region and never replaces the full final review.

---

## 5. Dialog, form and navigation contract

The shared transaction modal primitives define workflow behaviour:

- modal content uses `role="dialog"`, `aria-modal="true"` and a valid `aria-labelledby` target;
- the close control receives initial focus;
- Tab and Shift+Tab are trapped inside the active dialog;
- Escape and the semantic backdrop button close the dialog;
- body scrolling is locked and its previous state is restored;
- focus returns to the invoking control after close;
- mobile dialogs become bottom sheets with a maximum `92dvh` height;
- modal timers are cancelled on close or unmount;
- success messages are announced semantically;
- every applicable field label is associated with its input or select, including repeated recipient bank and mobile-wallet fields;
- the PIN is a labelled fieldset, accepts numeric characters and advances focus;
- modal data tables expose accessible names and column scopes;
- wizard progress is a semantic ordered list with current and completed states;
- segmented modal tabs expose tablist, tab and tabpanel semantics and support Left, Right, Home and End keys;
- non-submit controls use `type="button"`.

The main builder navigation must additionally meet these rules:

- the active step exposes `aria-current="step"`;
- only the current step is in the stepper tab sequence;
- when the stepper is focused, Left/Right move one step and Home/End move to the first/last step;
- there is no global arrow-key listener that can hijack cursor movement inside form controls;
- a horizontal swipe of at least 60px can move between steps when horizontal movement clearly exceeds vertical movement;
- swipes beginning on buttons, links, labels, fields, editable content or button-role controls are ignored;
- vertical page scrolling remains available through `touch-action: pan-y`;
- every field and grouped choice has a programmatic label;
- visible focus treatment applies to links, buttons, inputs, selects and textareas.

---

## 6. Responsive contract

### `>= 1280px`

- Four readiness KPIs appear in one row.
- The builder uses a wide focused form panel with a narrower live-summary aside.
- Control checks use three equal columns.
- The floating shortcut bar centres within the workspace.

### `1024–1279px`

- KPIs use two columns.
- Builder panel and live summary remain side by side until the 1024px boundary.
- At and below 1024px, the live summary stacks beneath the form and uses two internal columns where space permits.

### `< 768px`

- Hero, choice cards and control checks become one column.
- Builder padding and headings tighten without reducing tap targets.
- Fee details and rails use two columns.
- Assurance rows become a single vertical sequence.
- Floating shortcuts stretch across the viewport.
- Footer content stacks in reading order.

### `< 576px`

- KPIs, form grids, settlement options, review cards and summary details become one column.
- The horizontal stepper remains internally scrollable instead of widening the page.
- Hero actions wrap to practical touch widths.
- Form footer guidance occupies its own row above Back and Continue.
- Submit and draft actions become full-width.
- Secondary floating command labels collapse while the primary Quick transfer label remains visible.
- Dialogs dock to the bottom edge and PIN fields remain usable at 320px.
- Reduced-motion preferences disable decorative pulse and transition motion.

---

## 7. Code-complete checklist

### Theme and hierarchy

- [x] Uses exact PayMo business emerald/navy/cool-grey tokens.
- [x] Uses Inter for UI copy and Sora for display values/headings.
- [x] Uses one executive hero followed by three numbered task-focused sections.
- [x] Uses feature-scoped CSS rather than mutating every transaction page.
- [x] Uses a centred maximum content width of 1500px.
- [x] Uses consistent card, badge, icon, control and focus treatments.
- [x] Uses Bootstrap Icons in the page and workflow host.

### Transfer content

- [x] Retains all three transfer structures.
- [x] Retains every source account, destination mode, currency, purpose code and payment rail.
- [x] Retains fee itemization, smart routing, approval flow, scheduling, compliance and final review.
- [x] Retains the progressive summary and operating-readiness data.
- [x] Keeps all 14 hosted modal IDs reachable.
- [x] Keeps `/pm/app/initiate-transfer` intact.
- [x] Keeps `initialData` and `remoteData ?? initialMockData` fallback behaviour.

### Interaction and accessibility

- [x] Stepper exposes progress, current state and scoped keyboard navigation.
- [x] Touch swipe navigation is retained and ignores interactive controls.
- [x] There is no global arrow-key handler.
- [x] Every main-page and modal form label is associated with its control.
- [x] Grouped amount and routing controls have semantic legends.
- [x] Focus styling is visible across links, controls and fields.
- [x] Shared dialogs are labelled, focus-trapped, Escape-closeable and focus-restoring.
- [x] Modal tables are named and expose scoped column headings.
- [x] Wizard, PIN and tab semantics are exposed to assistive technologies.
- [x] Mobile bottom sheets and reduced-motion behaviour are implemented.

### Validation completed

- [x] Targeted Biome checks pass for the page, feature stylesheet and workflow host (August 28, 2026).
- [x] Targeted TypeScript output contains no diagnostics for Initiate Transfer or the shared modal primitives.
- [x] CSS-module audit reports 114 static page keys and no missing definitions; `iconAmber` is selected through the dynamic KPI tone lookup.
- [x] Modal reachability audit confirms all 14 hosted workflows have page controls.
- [x] Vitest passes all 9 tests.
- [x] Vite production client and server builds pass.
- [x] `/pm/app/initiate-transfer` responds HTTP 200 in the local preview.
- [x] The SSR response contains the redesigned hero copy.
- [x] `git diff --check` passes.

---

## 8. Manual visual-QA gates

These remain reviewer gates and are intentionally not claimed as automated validation.

### Desktop — 1440 × 900

- [ ] Hero radius, spacing, gradient and type scale visually match Transfer Overview and Transfer Management.
- [ ] Four readiness cards align to equal height.
- [ ] The eight-step rail remains readable and the current state is unmistakable.
- [ ] Form and live-summary panels align without excessive empty space across all eight steps.
- [ ] Rail, fee, approval and review content remain visually balanced with long values.
- [ ] Floating commands do not obscure control checks or the footer.

### Tablet — 1024 × 768 and 768 × 1024

- [ ] Shell opens off-canvas with one backdrop and no content jump.
- [ ] Readiness KPIs use two columns and the summary stacks cleanly below the form.
- [ ] Horizontal stepper scrolling does not cause document-level overflow.
- [ ] Dialogs remain above shell drawers and fixed commands.
- [ ] Touch swipe changes steps only when the gesture begins outside controls.

### Mobile — 390 × 844, 360 × 800 and 320 × 568

- [ ] Hero copy and all primary actions remain readable and tappable.
- [ ] Every step forms one logical reading order with no two-dimensional page scroll.
- [ ] Form footer, amount breakdown, rail cards and final review fit without clipped content.
- [ ] Floating controls do not block the builder or footer.
- [ ] Every workflow opens as a scrollable bottom sheet with visible actions.
- [ ] PIN inputs and repeated recipient fields fit and retain associated labels.

### Keyboard and assistive technology

- [ ] Keyboard order follows the visual order from hero through footer.
- [ ] Operate the stepper with Left, Right, Home and End and verify focus follows state.
- [ ] Verify arrow keys still edit/select values normally inside form controls.
- [ ] Open each of the 14 workflows and verify Escape, backdrop close and focus return.
- [ ] Complete Quick transfer and Add recipient flows and verify progress and receipt states.
- [ ] Operate modal tabs with Left, Right, Home and End.
- [ ] Verify live-summary announcements are informative and not excessively repetitive.
- [ ] Verify usability at 200% browser zoom.
- [ ] Run contrast and accessibility tooling against live data before release.

### Real-data release gates

- [ ] Test empty arrays and query failures.
- [ ] Test long account, beneficiary, bank, rail and purpose names.
- [ ] Test very large KES amounts and every retained non-KES currency.
- [ ] Verify real fee, FX, risk and approval vocabulary maps to readable states.
- [ ] Confirm date formatting and Africa/Nairobi timezone treatment with production payloads.
- [ ] Confirm validation prevents progression or submission when required production fields are incomplete.
