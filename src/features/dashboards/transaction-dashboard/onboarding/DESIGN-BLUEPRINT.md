# PayMo Transactions — Business Onboarding & KYC Design Blueprint

> Implementation target: `transaction-dashboard/onboarding/`  
> Shared context: completed `/pm/app` shell, Transfer Overview and Initiate Transfer  
> Last reconciled: August 28, 2026

---

## 1. Purpose and acceptance contract

Business Onboarding & KYC is the guided verification workspace that takes an
operator from “unregistered local shop” to Certified business status. It must
let a business begin with the documents they already have, submit
progressively, resume anytime, and see exactly which verification level they
have earned and what unlocks next. It must look and behave like the PayMo
business dashboard — not like a standalone legacy form.

The implementation is accepted when it:

- uses the shared navy/emerald PayMo Transactions shell and the same
  business-dashboard visual language as Transfer Overview and Initiate
  Transfer;
- preserves `/pm/app/onboarding`;
- preserves `initialData: initialMockData` and the explicit
  `remoteData ?? initialMockData` fallback so a query failure does not blank
  the workspace;
- preserves the complete nine-step onboarding workflow: business type,
  business identity, owner, contact, documents, banking, operations,
  compliance and review/submit;
- progressively exposes a live profile summary rather than requiring the
  operator to remember earlier entries;
- preserves per-business-type document matrices (Small Scale, Startup, Solo
  Proprietor, Freelance, Creative and Other) so progress, checklists and
  recommendations adapt to the selected type;
- preserves draft persistence to localStorage, resume-anytime behaviour and
  the 30-day KYC check-in / 90-day dormancy protection messaging;
- preserves document upload with drag & drop, pending/verified/rejected
  statuses and re-upload paths;
- preserves all 11 hosted modal workflows and makes every one directly
  reachable from an appropriate control;
- preserves touch navigation while protecting interactive form controls from
  accidental swipe changes;
- meets the dialog, keyboard, responsive and reduced-motion requirements
  below.

---

## 2. Visual system

### Exact tokens

| Role | Value |
|---|---|
| Primary emerald | `#12b76a` |
| Dark emerald | `#0b8f52` |
| Deep emerald | `#075c38` |
| Soft emerald | `#e7f8ef` |
| Primary ink | `#101828` |
| Secondary ink | `#344054` |
| Muted text | `#667085` |
| Subtle text | `#98a2b3` |
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
- Page display heading: responsive `2rem–3.15rem`, tight `1.08` line-height.
- Section heading: `1.06rem`, Sora 700.
- Form labels and status copy remain compact but readable; status is never
  communicated by colour alone (every badge carries an explicit text label).
- Fonts remain globally loaded by `src/routes/__root.tsx`; the feature adds
  no network font import.

### Core components

- Cards: white, 1px cool-grey border, 16px radius and restrained dual-layer
  elevation.
- Controls: 9–10px radius, minimum practical touch height and a visible
  emerald focus halo (`3px rgba(18,183,106,0.2)` on focus-visible).
- Primary buttons: emerald fill and white text; hover uses dark emerald.
- Secondary buttons: white surface, cool border and dark text.
- Status badges: pill radius with soft green, amber, blue, violet, red or
  neutral surfaces and explicit text.
- Icons: Bootstrap Icons throughout the page and workflow host; icon-only
  actions include `aria-label`s; no emoji or Font Awesome glyphs remain.
- Motion: short feedback transitions only; decorative pulse, fade, pop and
  toast transitions respect reduced-motion preferences.

---

## 3. Information architecture

### Executive hero

**Message:** “Verify once. Unlock bigger limits as your business grows.”

The hero must contain:

1. guided-onboarding and KYC-desk-live status pills (the live pill reflects
   the query fetch state);
2. a clear explanation of progressive submission, resume-anytime behaviour and
   the one-month check-in / dormancy protection;
3. Start/Continue onboarding, Upload documents and View status actions;
4. a profile-completion snapshot;
5. current level, daily send limit and review-window metrics.

The background uses the same navy-to-emerald business gradient
(`linear-gradient(115deg, #0b1322, #123a2c 60%, #0d5c38)`) as the completed
transaction pages. Decorative orbs are inert and never obscure content.

### 01 — Verification readiness

Four equal KPI cards derive their values live from the saved draft:

1. current verification level (Basic / Enhanced / Certified) and document
   counts for the selected business type;
2. documents uploaded (`x/y`) with the completion percentage and pending count;
3. daily send limit, fee rate, beneficiary count and bulk allowance for the
   current level;
4. the 24–48 hour review window and how many documents are queued in review.

Each card pairs its number with a badge, supporting context and a distinct
but system-consistent icon tone. Query failure produces an unobtrusive
notice explaining that the latest local profile snapshot is in use.

### 02 — Complete business profile

The primary workspace combines:

- a percentage progress indicator over the nine steps;
- a semantic horizontal nine-step navigator;
- one focused step panel;
- Back, Continue and final Submit application actions plus an explicit
  Save-draft control;
- a progressive live summary that adds business type, legal identity, owner,
  contact, documents, settlement, operations and compliance data as those
  stages are reached;
- a protected-onboarding assurance footer in the summary column.

The builder is the visual and interaction priority. Secondary operational
content must not compete with the current task.

#### Step 1 — Business type

- Choose Small Scale, Startup, Solo Proprietor, Freelance, Creative or Other
  through explicit pressed-state cards.
- Each card states its icon, description and required-document count.
- The choice drives the document matrix used by Step 5, the progress metric,
  checklists, status views and recommendations.
- Continue is disabled until a type is selected; selecting a type persists to
  the draft immediately.

#### Step 2 — Business identity

- Legal name, legal structure, year established, registration/certificate
  number, KRA PIN and sector/industry.
- Legal names are called out as needing to match KRA and registration records
  exactly.

#### Step 3 — Owner details

- Full legal name, national ID/passport number and ID type, date of birth,
  nationality, phone (with +254 prefix), email and physical address.

#### Step 4 — Contact information

- Business phone, business email, website/social handle, business physical
  address, county, PO box and preferred contact time.

#### Step 5 — Documents

- Lists exactly the documents for the selected business type; required
  documents are marked and drive the progress metric.
- Every document row supports click-to-upload, drag & drop, simulated upload
  to “pending review”, file name/size display, re-upload for pending or
  rejected files and removal for rejected files.
- The upload control is a labelled `<input type="file">` (visually hidden);
  the row never nests interactive elements.
- Rejected or pending documents can be re-uploaded without restarting the
  profile.

#### Step 6 — Banking & settlement

- Bank, account name (must match legal name), account number, branch,
  optional M-Pesa Paybill/Till and settlement currency (KES/USD/EUR/GBP).
- Context states that settlement details are verified against KRA records.

#### Step 7 — Operations

- Expected monthly volume, average transaction size, primary use case, payout
  preference, number of locations and peak hours.
- The dormancy notice is stated here: a light KYC check ~1 month after
  onboarding; accounts inactive for 90+ days are flagged dormant and paused
  to protect the business, and reactivation takes a fresh KYC check.

#### Step 8 — Compliance

- Beneficial owner/signatory, source of funds and expected monthly turnover.
- Five required declarations (AML legitimacy, sanctions/PEP screening
  consent, periodic KYC consent, dormancy understanding, accuracy
  confirmation) are associated checkboxes grouped in a labelled fieldset with
  a live “n of 5 confirmed” legend.
- Declarations reference POCAMLA (2009) context.

#### Step 9 — Review & submit

- Lists business type, legal identity, owner, contact, document counts, bank
  and operations data with explicit Edit links that jump back to the
  originating step.
- Missing values render in warning amber rather than disappearing.
- Submitting persists `submitted: true`, marks all steps completed and opens
  the hosted success dialog with reference, date and 24–48 hour review
  expectations.
- Save-draft at any point writes to localStorage and toasts “resume anytime”.

### 03 — Verification levels & limits

Three aligned tier cards for Basic, Enhanced and Certified:

- per-tier daily limit, fee rate, beneficiaries and bulk payment allowance;
- the current level is marked with an emerald ribbon/ring and a View status
  action;
- Certified shows Upgrade now (or View benefits when already earned);
- a gradient upgrade strip promotes 10× limits, 0.8% fees, API access and
  international transfers, with Upgrade now and Compare benefits actions.

### 04 — Documents & next steps

- The business-type filter is a labelled fieldset of pressed-state pills
  (same matrix choices as Step 1) and drives the checklist.
- Verified / in-review / missing stat tiles summarize the document state.
- The first missing documents are shown with their format/cost hints and an
  Upload action.
- AI document recommendations are priority-ranked cards (rank number, title,
  source portal, cost, turnaround and impact), with Full analysis, Show me
  how and Remind me actions.

### 05 — Assurance & recent activity

Three aligned assurance cards reinforce:

1. bank-grade KYC verification (links to the status workflow);
2. progressive document submission with re-upload paths (links to upload);
3. dormancy protection and the 30/90-day policy (links to the how-to guide).

A compact recent-activity table (upload and verification events over the last
7 days) appears in-page; the Full log action opens the tabbed activity dialog
(all activity / uploads only).

### Persistent commands

Desktop receives a floating shortcut bar for Start/Continue onboarding,
Upload, Checklist and Status. On narrow mobile screens the primary action
keeps its label while secondary actions become icon-first controls. The page
footer retains KYC/AML/dormancy context, Support, Preferences and the
application version.

---

## 4. Data and workflow contract

### Query fallback

The page must retain both the seeded query and explicit render fallback:

```tsx
useQuery({
  queryKey: ["paymo-onboarding"],
  queryFn: fetchOnboarding,
  initialData: initialMockData,
  staleTime: 60_000,
  retry: 1,
});

const data = remoteData ?? initialMockData;
```

The feature may derive presentation-only fields (tier, progress, summaries)
from this snapshot, but it must not replace the query contract or remove
source content. When the live query fails, the page shows the local profile
snapshot and an amber notice without interrupting onboarding.

### Draft contract

- The draft persists under the `paymo-onboarding-draft` localStorage key as a
  `WizardDraft` (business type, current step, last-visited timestamp, field
  map, document map, completed steps, submitted flag).
- Every step change, field edit, document upload and declaration toggle
  writes through the same `updateDraft` path (state + storage).
- A returning user with an unfinished draft sees the emerald resume banner and
  re-enters at the last visited step; a submitted profile re-enters at the
  review step.
- Corrupt or missing storage falls back to an empty draft without throwing.

### Required workflow IDs

All 11 hosted IDs below are preserved in `OnboardingModals.tsx` and reachable
from the primary page:

- `bizTypeModal`
- `uploadModal`
- `aiModal`
- `limitsModal`
- `upgradeModal`
- `statusModal`
- `checklistModal`
- `benefitsModal`
- `activityModal`
- `howToModal`
- `successModal`

The guided nine-step builder is an inline page workspace (not a dialog). The
page’s `openModal` router treats `"startWizard"` (and the legacy
`"wizardModal"` name kept for external callers) as “jump into the inline
builder and scroll to it”, and never opens a second copy of the workflow.
Opening a hosted dialog replaces the active modal-state map entry rather than
stacking accidental dialogs; dialog-to-dialog navigation (`swap`) closes the
source while opening the target.

### Summary contract

- Business type is visible from step 1.
- Legal identity appears from step 2.
- Owner details appear from step 3.
- Contact details appear from step 4.
- Document counts appear from step 5.
- Settlement details appear from step 6.
- Operations details appear from step 7.
- Compliance declaration progress appears from step 8.
- The summary is a polite live region (`aria-live="polite"`) and never
  replaces the full review step; before any data exists it explains that
  selections will appear there.

---

## 5. Dialog, form and navigation contract

The shared transaction modal primitives (`ModalShell`, `SimpleModal`,
`TabbedModal` in `shared/components/modals.tsx`) define workflow behaviour:

- modal content uses `role="dialog"`, `aria-modal="true"` and a valid
  `aria-labelledby` target;
- the close control receives initial focus;
- Tab and Shift+Tab are trapped inside the active dialog;
- Escape and the semantic backdrop button close the dialog;
- body scrolling is locked and its previous state is restored;
- focus returns to the invoking control after close;
- mobile dialogs become bottom sheets with a maximum `92dvh` height;
- upload timers are cancelled on close or unmount;
- success messages are announced semantically;
- every field label is associated with its input or select via generated ids
  (no id collisions when controls repeat across modals);
- modal data tables expose accessible names (captions) and column scopes;
- segmented modal tabs expose tablist, tab and tabpanel semantics and support
  Left, Right, Home and End keys;
- non-submit controls use `type="button"`.

The main builder navigation must additionally meet these rules:

- the active step exposes `aria-current="step"`;
- only the current step is in the stepper tab sequence (`tabIndex={-1}` on
  others);
- when the stepper is focused, Left/Right move one step and Home/End move to
  the first/last step;
- there is no global arrow-key listener that can hijack cursor movement
  inside form controls — the handler lives on the stepper `<ol>` only;
- a horizontal swipe of at least 60px can move between steps when horizontal
  movement clearly exceeds vertical movement;
- swipes beginning on buttons, links, labels, fields, editable content or
  button-role controls are ignored;
- vertical page scrolling remains available through `touch-action: pan-y`;
- every field and grouped choice has a programmatic label;
- visible focus treatment applies to links, buttons, inputs, selects and
  textareas;
- drag-and-drop on document rows is a progressive enhancement — the labelled
  Upload button and file input are the accessible, keyboard-operable path.

---

## 6. Responsive contract

### `>= 1280px`

- Four readiness KPIs appear in one row.
- The builder uses a wide focused form panel with a narrower live-summary
  aside.
- Tier cards use three equal columns; assurance cards use three equal columns.
- The floating shortcut bar centres within the workspace.

### `1024–1279px`

- KPIs use two columns.
- Builder panel and live summary remain side by side until the 1024px
  boundary.
- At and below 1024px, the live summary stacks beneath the form and uses two
  internal columns where space permits; tier cards collapse to one column.

### `< 768px`

- Hero, choice cards, tier cards and assurance cards become one column.
- Builder padding and headings tighten without reducing tap targets.
- Business-type cards use two columns; document stats use one column.
- Review rows and recommendation stacks reflow without clipping.
- Floating shortcuts stretch across the viewport.
- Footer content stacks in reading order.

### `< 576px`

- KPIs, form grids and summary details become one column.
- The horizontal stepper remains internally scrollable (minimum 720px track)
  instead of widening the page.
- Hero actions wrap to practical touch widths.
- Segmented controls and upload rows wrap while actions stay reachable.
- Secondary floating command labels collapse while the primary Start/Continue
  label remains visible.
- Dialogs dock to the bottom edge and remain usable at 320px.
- Reduced-motion preferences disable decorative pulse and transition motion.

---

## 7. Code-complete checklist

### Theme and hierarchy

- [x] Uses exact PayMo business emerald/navy/cool-grey tokens.
- [x] Uses Inter for UI copy and Sora for display values/headings.
- [x] Uses one executive hero followed by five numbered task-focused sections.
- [x] Uses feature-scoped CSS rather than mutating every transaction page.
- [x] Uses a centred maximum content width of 1500px.
- [x] Uses consistent card, badge, icon, control and focus treatments.
- [x] Uses Bootstrap Icons in the page and workflow host; zero emoji and zero
      Font Awesome references remain.

### Onboarding content

- [x] Retains all six business types and their per-type document matrices.
- [x] Retains identity, owner, contact, banking, operations and compliance
      fields.
- [x] Retains upload, re-upload, pending/verified/rejected statuses and
      drag-and-drop document handling.
- [x] Retains localStorage draft persistence, resume banner and
      submit-anytime flow.
- [x] Retains the 30-day check-in / 90-day dormancy messaging.
- [x] Retains Basic/Enhanced/Certified limits, benefits and upgrade content.
- [x] Retains AI recommendations, how-to guide and activity log.
- [x] Keeps all 11 hosted modal IDs reachable from the page.
- [x] Keeps `/pm/app/onboarding` intact.
- [x] Keeps `initialData` and `remoteData ?? initialMockData` fallback
      behaviour.

### Interaction and accessibility

- [x] Stepper exposes progress, current state and scoped keyboard navigation.
- [x] Touch swipe navigation is retained and ignores interactive controls.
- [x] There is no global arrow-key handler.
- [x] Every main-page and modal form label is associated with its control
      (unique generated ids).
- [x] Business-type filters and compliance declarations use semantic fieldsets
      with legends.
- [x] Focus styling is visible across links, controls and fields.
- [x] Shared dialogs are labelled, focus-trapped, Escape-closeable and
      focus-restoring.
- [x] Modal tables are named (captions) and expose scoped column headings.
- [x] Tabbed activity dialog exposes tablist/tab/tabpanel semantics and
      directional keyboard support.
- [x] Mobile bottom sheets and reduced-motion behaviour are implemented.

### Validation completed

- [x] Targeted Biome checks pass for the page and the workflow host (August
      28, 2026).
- [x] Targeted TypeScript output contains no diagnostics for Onboarding or the
      shared modal primitives.
- [x] CSS-module audit reports 147 referenced style keys and no missing
      definitions.
- [x] Modal reachability audit confirms all 11 hosted workflows have page
      controls; the guided builder is the inline page workspace.
- [x] Emoji and Font Awesome audit reports 0 references in page and host.
- [x] Vitest passes all 9 tests.
- [x] Vite production client/server build passes.
- [x] `/pm/app/onboarding` responds HTTP 200 in the local preview.
- [x] The SSR response contains the redesigned hero and all five section
      markers.
- [x] `git diff --check` passes.

---

## 8. Manual visual-QA gates

These remain reviewer gates and are intentionally not claimed as automated
validation.

### Desktop — 1440 × 900

- [ ] Hero radius, spacing, gradient and type scale visually match Transfer
      Overview and Initiate Transfer.
- [ ] Four readiness cards align to equal height with long copy truncating.
- [ ] The nine-step rail remains readable and the current state is
      unmistakable.
- [ ] Form and live-summary panels align without excessive empty space across
      all nine steps.
- [ ] Tier cards, recommendations and activity table align on the 16px card
      system.
- [ ] Floating commands do not obscure the assurance cards or footer.

### Tablet — 1024 × 768 and 768 × 1024

- [ ] Shell opens off-canvas with one backdrop and no content jump.
- [ ] Readiness KPIs use two columns and the summary stacks cleanly below the
      form at the 1024px boundary.
- [ ] Horizontal stepper scrolling does not cause document-level overflow.
- [ ] Dialogs remain above shell drawers and fixed commands.
- [ ] Touch swipe changes steps only when the gesture begins outside controls.

### Mobile — 390 × 844, 360 × 800 and 320 × 568

- [ ] Hero copy and all primary actions remain readable and tappable.
- [ ] Every step forms one logical reading order with no two-dimensional page
      scroll.
- [ ] Document rows, business-type cards and review content fit without
      clipped content.
- [ ] Floating controls do not block the builder or footer.
- [ ] Every workflow opens as a scrollable bottom sheet with visible actions.
- [ ] Upload rows and repeated fields fit and retain associated labels.

### Keyboard and assistive technology

- [ ] Keyboard order follows the visual order from hero through footer.
- [ ] Operate the stepper with Left, Right, Home and End and verify focus
      follows state.
- [ ] Verify arrow keys still edit/select values normally inside form
      controls.
- [ ] Open each of the 11 workflows and verify Escape, backdrop close and
      focus return.
- [ ] Complete the upload flow and verify pending statuses, re-upload paths
      and the success dialog.
- [ ] Operate the activity dialog tabs with Left, Right, Home and End.
- [ ] Verify live-summary announcements are informative and not excessively
      repetitive.
- [ ] Verify drag-and-drop is never the only way to upload (keyboard path via
      the Upload button).
- [ ] Verify usability at 200% browser zoom.
- [ ] Run contrast and accessibility tooling against live data before
      release.

### Real-data release gates

- [ ] Test empty activity arrays, missing documents and query failures.
- [ ] Test long business names, owner names, document labels and bank names.
- [ ] Test every business type’s document matrix and its progress percentage.
- [ ] Verify real verification, pending and rejected status vocabulary maps to
      readable states.
- [ ] Confirm date formatting and Africa/Nairobi timezone treatment with
      production payloads.
- [ ] Confirm localStorage being unavailable (private mode) degrades
      gracefully without losing the in-session draft.
- [ ] Confirm validation prevents submission messaging when required
      production declarations are incomplete.
