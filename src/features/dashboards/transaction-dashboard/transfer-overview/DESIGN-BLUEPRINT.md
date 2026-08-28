# PayMo Business → Transaction Dashboard Design Blueprint
> Visual sources: `business-dashboard/components/Dashboard/`, `Onlinestore/`, `Books/`, and `business-dashboard/index.css`
> Implementation targets: `Layouts/shell/` and `transaction-dashboard/transfer-overview/`
> Last reconciled: August 28, 2026

---

## 1. CSS CUSTOM PROPERTIES (EXACT VALUES)

```css
:root {
  /* ── Brand ── */
  --pm-green: #12b76a;
  --pm-green-dark: #0b8f52;
  --pm-green-soft: #e7f8ef;

  /* ── Neutrals ── */
  --pm-ink: #101828;
  --pm-muted: #667085;
  --pm-bg: #f2f4f8;
  --pm-card: #ffffff;
  --pm-border: #e6e9f0;
  --pm-sidebar: #0b1322;

  /* ── Semantic ── */
  --pm-warn: #f79009;
  --pm-danger: #f04438;
  --pm-blue: #2e90fa;
  --pm-violet: #7a5af8;

  /* ── Dimensions ── */
  --pm-radius: 16px;
  --pm-shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px -12px rgba(16, 24, 40, 0.12);
  --pm-shadow-lg: 0 24px 60px -16px rgba(16, 24, 40, 0.28);
}
```

---

## 2. TYPOGRAPHY

| Element | Family | Size | Weight | Notes |
|---------|--------|------|--------|-------|
| Body | `"Inter", system-ui, sans-serif` | `0.925rem` | 400 | `-webkit-font-smoothing: antialiased` |
| Headings (h1-h5) | `"Sora", "Inter", sans-serif` | varies | 700 | `letter-spacing: -0.02em` |
| KPI label | Inter | `0.74rem` | 600 | `text-transform: uppercase; letter-spacing: 0.06em; color: var(--pm-muted)` |
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
| Nav item | Inter | `0.84rem` | 500 | |
| Dropdown item | Inter | `0.82rem` | 500 | |
| Wizard dot | Inter | `0.82rem` | 700 | 34×34px circle |
| Wizard label | Inter | `0.68rem` | 600 | |

---

## 3. LAYOUT SHELL

### Sidebar
```css
width: 264px;          /* Fixed left sidebar */
background: var(--pm-sidebar);  /* #0b1322 */
position: fixed;
inset: 0 auto 0 0;
z-index: 1046;
```
- Brand logo: 38×38px, rounded 11px, gradient `#12b76a → #0b8f52`, shadow `0 6px 16px -6px rgba(18,183,106,0.6)`
- Brand name: Sora, 0.98rem, weight 700
- Nav groups: 0.63rem, weight 700, `letter-spacing: 0.12em`, color `#5d6b83`
- Nav items: rounded 10px, weight 500, color `#aab6c9`
- Nav hover: `rgba(255,255,255,0.05)` bg, white text
- Nav active: `linear-gradient(90deg, rgba(18,183,106,0.18), rgba(18,183,106,0.05))` bg, `#7ee2b0` text, `rgba(18,183,106,0.35)` border

### Main Area
```css
.pm-main {
  margin-left: 264px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

### Topbar
```css
.pm-topbar {
  position: sticky;
  top: 0;
  z-index: 1030;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--pm-border);
  padding: 0.7rem 1.5rem;
}
```

### Content
```css
.pm-content {
  flex: 1;
  padding: 1.5rem 1.5rem 7rem;
  max-width: 1500px;
  width: 100%;
  margin: 0 auto;
}
```

---

## 4. COMPONENT PATTERNS

### Card
```css
.pm-card {
  background: var(--pm-card);        /* #ffffff */
  border: 1px solid var(--pm-border); /* #e6e9f0 */
  border-radius: var(--pm-radius);    /* 16px */
  box-shadow: var(--pm-shadow);
  padding: 1.25rem;
}
.pm-card-hover {
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.pm-card-hover:hover {
  box-shadow: var(--pm-shadow-lg);
  transform: translateY(-2px);
}
```

### Buttons (Bootstrap Overrides)
```css
.btn {
  font-weight: 600;
  border-radius: 10px;
}
.btn-sm {
  border-radius: 8px;
  font-size: 0.8rem;
}
.btn-lg {
  border-radius: 12px;
}

/* Primary */
.btn-primary {
  background: var(--pm-green);
  border-color: var(--pm-green);
  box-shadow: 0 1px 2px rgba(16,24,40,.12);
}
.btn-primary:hover {
  background: var(--pm-green-dark) !important;
  border-color: var(--pm-green-dark) !important;
}

/* Outline Primary */
.btn-outline-primary {
  color: var(--pm-green-dark);
  border-color: #b7e6cf;
  background: #fff;
}
.btn-outline-primary:hover {
  background: var(--pm-green-soft);
  color: var(--pm-green-dark);
  border-color: var(--pm-green);
}

/* Outline Secondary */
.btn-outline-secondary {
  border-color: var(--pm-border);
  color: #475467;
  background: #fff;
}
.btn-outline-secondary:hover {
  background: #f2f4f8;
  color: var(--pm-ink);
  border-color: #d5d9e2;
}
```

### Badges (Soft)
```css
.badge-soft {
  font-weight: 600;
  font-size: 0.7rem;
  padding: 0.32em 0.7em;
  border-radius: 99px;
}
.badge-soft.green  { background: var(--pm-green-soft); color: #067647; }
.badge-soft.red    { background: #fee4e2; color: #b42318; }
.badge-soft.amber  { background: #fef0c7; color: #93370d; }
.badge-soft.blue   { background: #e8f1fe; color: #175cd3; }
.badge-soft.violet { background: #f0ebfe; color: #5925dc; }
.badge-soft.slate  { background: #f2f4f8; color: #475467; }
.badge-soft.ink    { background: var(--pm-ink); color: #fff; }
```

### Chips
```css
.pm-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
  border: 1px solid var(--pm-border);
  background: #fff;
  color: #475467;
  font-weight: 600;
  font-size: 0.76rem;
  cursor: pointer;
}
.pm-chip:hover { border-color: #c4c9d4; }
.pm-chip.on {
  background: var(--pm-ink);
  color: #fff;
  border-color: var(--pm-ink);
}
```

### Live Dot
```css
.pm-dot-live {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--pm-green);
  box-shadow: 0 0 0 0 rgba(18,183,106,.5);
  animation: pmPulse 2s infinite;
  display: inline-block;
}
```

---

## 5. TABLE

```css
.pm-table { margin-bottom: 0; }

.pm-table thead th {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--pm-muted);
  border-bottom: 1px solid var(--pm-border);
  padding: 0.65rem 0.85rem;
  white-space: nowrap;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.pm-table tbody td {
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid #f0f2f6;
  vertical-align: middle;
}

.pm-table tbody tr:last-child td { border-bottom: none; }
.pm-table tbody tr:hover { background: #fafbfd; }
```

---

## 6. MODAL

```css
/* Backdrop */
.modal-backdrop {
  opacity: 0.45;
  background: #0b1322;
}

/* Content */
.modal-content {
  border: none;
  border-radius: 18px;
  box-shadow: var(--pm-shadow-lg);
}

/* Header */
.modal-header {
  border-bottom: 1px solid var(--pm-border);
  padding: 1rem 1.4rem;
}

/* Footer */
.modal-footer {
  border-top: 1px solid var(--pm-border);
  padding: 0.9rem 1.4rem;
}

/* Title */
.modal-title {
  font-size: 1.05rem;
}

/* Animation */
.modal.pm-modal.show .modal-content {
  animation: pmPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Scrollable body */
.modal-dialog-scrollable .modal-body {
  max-height: min(64vh, 660px);
}
```

### Modal Component API (from ui.tsx)
```tsx
<Modal
  open={boolean}
  onClose={() => void}
  title={ReactNode}
  subtitle={ReactNode}     // optional
  icon={ReactNode}         // optional, rendered in pm-kpi-icon
  size="sm" | "md" | "lg" | "xl" | "full"
  children={ReactNode}
  footer={ReactNode}       // optional
  hideClose={boolean}      // optional
/>
```

---

## 7. DRAWER

```css
.pm-drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(480px, 100vw);
  background: #fff;
  z-index: 1055;
  box-shadow: -20px 0 60px rgba(16, 24, 40, 0.22);
  display: flex;
  flex-direction: column;
  animation: pmSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.pm-drawer-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--pm-border);
}
.pm-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}
.pm-drawer-foot {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--pm-border);
  background: #fafbfd;
}
```

---

## 8. WIZARD / STEPPER

```css
.pm-wizard-track {
  display: flex;
  align-items: flex-start;
  padding: 0.4rem 0.2rem 0.6rem;
}

.pm-wstep {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  position: relative;
  flex: 1;
  min-width: 0;
}

.pm-wdot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fff;
  border: 2px solid #d5d9e2;
  color: #98a2b3;
  font-weight: 700;
  font-size: 0.82rem;
  z-index: 1;
  transition: all 0.2s;
}

/* Active step */
.pm-wstep.active .pm-wdot {
  border-color: var(--pm-green);
  color: var(--pm-green-dark);
  box-shadow: 0 0 0 5px rgba(18, 183, 106, 0.14);
}

/* Done step */
.pm-wstep.done .pm-wdot {
  background: var(--pm-green);
  border-color: var(--pm-green);
  color: #fff;
}

/* Labels */
.pm-wlabel {
  font-size: 0.68rem;
  font-weight: 600;
  color: #98a2b3;
  text-align: center;
  line-height: 1.2;
}
.pm-wstep.active .pm-wlabel { color: var(--pm-ink); }
.pm-wstep.done .pm-wlabel { color: #344054; }

/* Connection line */
.pm-wline {
  position: absolute;
  top: 16px;
  left: calc(50% + 20px);
  width: calc(100% - 40px);
  height: 2px;
  background: #d5d9e2;
  z-index: 0;
}
.pm-wstep.done .pm-wline { background: var(--pm-green); }

/* Progress bar */
.pm-wprogress {
  height: 5px;
  margin: 0.2rem 0 0.9rem;
}
```

### WizardShell API (from ui.tsx)
```tsx
<WizardShell
  steps={[
    { label: "Step 1", icon: <i className="bi bi-icon1" /> },
    { label: "Step 2", icon: <i className="bi bi-icon2" /> },
  ]}
  current={number}          // 0-indexed
  onStep={(i) => void}      // optional, makes dots clickable
  children={ReactNode}
  footer={ReactNode}        // optional
/>
```

---

## 9. SECTION HEADERS

```css
.pm-sec {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 2.1rem 0 1rem;
  flex-wrap: wrap;
}
.pm-sec:first-of-type { margin-top: 0.4rem; }

.pm-sec-no {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--pm-ink);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex: none;
}

.pm-sec h2 {
  font-size: 1.12rem;
  margin: 0;
  font-weight: 700;
}

.pm-sec-sub {
  width: 100%;
  color: var(--pm-muted);
  font-size: 0.82rem;
  margin: -0.5rem 0 0 2.6rem;
}
```

### Section API (from ui.tsx)
```tsx
<Section
  no="1.0"                    // optional, renders pm-sec-no badge
  title="Financial Pulse"
  sub="Description text"
  actions={<button>Action</button>}  // optional, rendered ms-auto
/>
```

---

## 10. KPI CARD

### KPI API (from ui.tsx)
```tsx
<Kpi
  icon={<i className="bi bi-wallet2" />}
  iconBg="var(--pm-green-soft)"
  label="Cash on Hand"
  value="KES 1,245,000"
  delta="12%"
  deltaGood={true}           // true=green, false=slate
  spark={[1, 2, 3, 4, 5]}   // optional sparkline data
  sparkColor="#12b76a"
  footer="vs last month"     // optional
/>
```

---

## 11. FORMS

```css
.form-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #344054;
  margin-bottom: 0.3rem;
}

.form-control,
.form-select {
  border-radius: 10px;
  border-color: var(--pm-border);
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--pm-green);
  box-shadow: 0 0 0 0.2rem rgba(18, 183, 106, 0.14);
}

.form-check-input:checked {
  background-color: var(--pm-green);
  border-color: var(--pm-green);
}

.form-check-input:focus {
  border-color: var(--pm-green);
  box-shadow: 0 0 0 0.2rem rgba(18, 183, 106, 0.14);
}

.form-switch .form-check-input:checked {
  background-color: var(--pm-green);
  border-color: var(--pm-green);
}
```

---

## 12. TOAST NOTIFICATIONS

```css
.pm-toast-stack {
  position: fixed;
  top: 74px;
  right: 18px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(360px, calc(100vw - 32px));
}

.pm-toast {
  background: #fff;
  border: 1px solid var(--pm-border);
  border-left: 4px solid var(--pm-green);
  border-radius: 12px;
  box-shadow: var(--pm-shadow-lg);
  padding: 0.75rem 0.9rem;
  display: flex;
  gap: 0.7rem;
  animation: pmToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.pm-toast.info    { border-left-color: var(--pm-blue); }
.pm-toast.warning { border-left-color: var(--pm-warn); }
.pm-toast.danger  { border-left-color: var(--pm-danger); }
```

---

## 13. DROPDOWN

```css
.dropdown-menu {
  border-radius: 12px;
  border-color: var(--pm-border);
  box-shadow: var(--pm-shadow-lg);
  padding: 0.4rem;
  font-size: 0.875rem;
}

.dropdown-item {
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: #f2f4f8;
}
```

---

## 14. SCROLLBAR

```css
* { scrollbar-width: thin; scrollbar-color: #c8cdd8 transparent; }
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-thumb { background: #c8cdd8; border-radius: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
```

---

## 15. ANIMATIONS

```css
@keyframes pmPop {
  from { opacity: 0; transform: scale(0.97) translateY(4px); }
  to   { opacity: 1; transform: none; }
}

@keyframes pmSlideIn {
  from { transform: translateX(40px); opacity: 0; }
  to   { transform: none; opacity: 1; }
}

@keyframes pmToastIn {
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: none; opacity: 1; }
}

@keyframes pmPulse {
  0%   { box-shadow: 0 0 0 0 rgba(18,183,106,.5); }
  70%  { box-shadow: 0 0 0 7px rgba(18,183,106,0); }
  100% { box-shadow: 0 0 0 0 rgba(18,183,106,0); }
}

@keyframes pmSpin {
  to { transform: rotate(360deg); }
}

.pm-spin {
  animation: pmSpin 0.8s linear infinite;
  display: inline-block;
}
```

---

## 16. RESPONSIVE BREAKPOINTS

```css
/* Tablet sidebar collapse */
@media (max-width: 1199.98px) {
  .pm-sidebar { transform: translateX(-100%); }
  .pm-sidebar.open { transform: translateX(0); box-shadow: 0 0 80px rgba(0,0,0,0.5); }
  .pm-main { margin-left: 0; }
  .pm-hide-md { display: none !important; }
  .pm-quickbar { display: none; }
}

/* Desktop burger hide */
@media (min-width: 1200px) {
  .pm-burger { display: none !important; }
}

/* Mobile */
@media (max-width: 575.98px) {
  .pm-content { padding: 1rem 0.9rem 5rem; }
  .pm-kpi-value { font-size: 1.35rem; }
}
```

---

## 17. STATUS-TO-TONE MAP (from ui.tsx)

```typescript
export const toneOf: Record<string, string> = {
  // Success
  Active: "success", Received: "success", Restocked: "success",
  Completed: "success", Found: "success", Available: "success",
  Verified: "success", Approved: "success", Paid: "success",
  Published: "success", Live: "success", Enabled: "success",
  Connected: "success", Resolved: "success", Won: "success",
  Healthy: "success", Success: "success",

  // Warning
  Pending: "warning", Partial: "warning", Counting: "warning",
  Low: "warning", Medium: "warning", Important: "warning",
  Processing: "warning", Limited: "warning", Paused: "warning",
  Watch: "warning", Notice: "warning", Expiring soon: "warning",
  Needs Evidence: "warning", In transit: "warning",

  // Danger
  Expired: "danger", Damage: "danger", Theft: "danger",
  Destroyed: "danger", Overdue: "danger", Failed: "danger",
  Disconnected: "danger", Critical: "danger", Required: "danger",
  Error: "danger", Suspended: "danger", Lost: "danger",
  Escalated: "danger",

  // Info (blue)
  Sent: "info", Scheduled: "info", Open: "info",
  Disbursed: "info", Submitted: "info",

  // Violet
  Quarantined: "violet", "Return to supplier": "violet",
  "In review": "violet", Under Review: "violet", Assigned: "violet",

  // Muted (slate)
  Draft: "muted", Archived: "muted", Inactive: "muted",
  Closed: "muted", Ended: "muted", Revoked: "muted",
};
```

### Badge Color Mapping (CSS)
| Tone | Background | Text Color |
|------|-----------|------------|
| success | `var(--pm-green-soft)` (#e7f8ef) | `#067647` |
| danger | `#fee4e2` | `#b42318` |
| warning | `#fef0c7` | `#93370d` |
| info | `#e8f1fe` | `#175cd3` |
| violet | `#f0ebfe` | `#5925dc` |
| muted | `#f2f4f8` | `#475467` |
| ink | `var(--pm-ink)` (#101828) | `#fff` |

---

## 18. MISC COMPONENTS

### Progress Bar
```css
.progress { background-color: #eef0f4; border-radius: 99px; }
.progress-bar { background-color: var(--pm-green); border-radius: 99px; }
```

### Bell Icon
```css
.pm-bell {
  position: relative;
  width: 38px; height: 38px;
  border-radius: 10px;
  border: 1px solid var(--pm-border);
  background: #fff;
  display: grid; place-items: center;
  color: #475467;
}
.pm-bell .nub {
  position: absolute; top: -4px; right: -4px;
  min-width: 16px; height: 16px;
  border-radius: 99px;
  background: var(--pm-danger);
  color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: grid; place-items: center;
  padding: 0 3px;
}
```

### Avatar
```css
.pm-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb020, #f79009);
  color: #fff;
  display: grid; place-items: center;
  font-weight: 700;
  font-size: 0.8rem;
}
```

### Search Box
```css
.pm-search-box {
  position: relative;
}
.pm-search-box i {
  position: absolute; left: 11px; top: 50%;
  transform: translateY(-50%);
  color: #98a2b3;
  font-size: 0.85rem;
}
.pm-search-box input {
  padding-left: 2.1rem;
  border-radius: 10px;
}
```

### Banner Hero
```css
.pm-banner-hero {
  border-radius: var(--pm-radius);
  border: 1px solid var(--pm-border);
  overflow: hidden;
  background: linear-gradient(115deg, #0b1322 0%, #123a2c 60%, #0d5c38 100%);
  color: #fff;
  box-shadow: var(--pm-shadow);
}
```

### Quick Actions Bar
```css
.pm-quickbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1040;
  background: rgba(11, 19, 34, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 99px;
  padding: 0.45rem 0.55rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  box-shadow: 0 18px 50px -12px rgba(11, 19, 34, 0.55);
}
```

---

## 19. IMPLEMENTATION ARCHITECTURE

The transaction workspace deliberately has two styling layers:

| Layer | Owner | Responsibility |
|---|---|---|
| Shared authenticated shell | `src/features/Layouts/shell/` | Fixed navy navigation, compact translucent topbar, account/security panels, toasts, responsive page offset |
| Transfer overview | `transfer-overview/pages/TransferOverview.tsx` | Transaction hero, KPI pulse, action queue, workflow shortcuts, transfer table, channels, beneficiaries, schedules, analytics |
| Transaction workflows | `transfer-overview/components/TransferOverviewModals.tsx` | Dialog shell, forms, steppers, receipts, loading states, detail/management workflows |
| Business theme contract | `shell.module.css` and `transfer-overview.module.css` | Exact shared tokens, spacing, typography, elevation, states and breakpoints |

Do not add a second local sidebar or page topbar to a transaction route. Routes below `/pm/app` inherit those surfaces from `AppShell`. Page-level CSS must remain scoped and must not redefine the shell position.

### Current reusable mapping

| Business pattern | Transaction implementation |
|---|---|
| Fixed 264px navy rail | `.sidebar.expanded`; 76px compact state |
| Sticky/translucent compact topbar | `.topHeader`; 62px height and route breadcrumb |
| `pm-banner-hero` | `.heroBanner`, `.heroContent`, `.heroSnapshot` |
| Numbered business section title | `.sectionHeading`, `.sectionIndex` (`1.1`–`1.5`) |
| `pm-card` | `.card`; white, 16px, `#e6e9f0` border, dual-layer shadow |
| KPI card | `.kpiGrid`, `.kpiCard`, `.kpiIcon*`, `.kpiValue` |
| Soft status badge | `.badge`, `.badgeS/W/D/I/P` |
| Primary / secondary button | `.btnPmP` / `.btnPm` |
| Operational list card | `.listCard`, `.actionRow`, `.actionRowMain` |
| Business table and toolbar | `.tableCard`, `.tableToolbar`, `.tbl`, `.filterPills` |
| Channel progress pattern | `.channelRow`, `.progressTrack`, `.channelInsight` |
| Beneficiary tiles | `.favoriteGrid`, `.favoriteTile`, `.favoriteAvatar` |
| Schedule rows | `.scheduleList`, `.scheduleRow`, `.scheduleDate` |
| Analytics card | `.analyticsGrid`, `.chartBars`, `.rankedList`, `.rateList` |
| Floating quick-action bar | `.floatingBar` |
| Modal / wizard | `.modalWrap`, `.modalBox`, `.stepper`, `.stepSegment` |
| Shell toast | `.toastContainer`, `.paymoToast` |
| Drawer / context panel | `.leftDrawer`, `.rightAside` |

---

## 20. CODE-COMPLETE CHECKLIST

### Theme and typography
- [x] Use emerald `#12b76a` as the only primary interaction color.
- [x] Use `#0b1322` for the navigation rail and `#f2f4f8` for the canvas.
- [x] Use cool neutral borders `#e6e9f0`; remove warm/cream transaction styling.
- [x] Use semantic colors only for status: warning `#f79009`, danger `#f04438`, info `#2e90fa`, violet `#7a5af8`.
- [x] Use Inter for body/control copy and Sora for headings/KPI values.
- [x] Load Inter and Sora once in `src/routes/__root.tsx`; do not add per-page font imports.

### Shared shell
- [x] Use a fixed 264px business-style sidebar and a 76px compact desktop state.
- [x] Collapse to an off-canvas sidebar below 1200px with backdrop and close control.
- [x] Use an emerald-gradient brand mark, grouped nav labels, matching active state and readable compact icons.
- [x] Resolve the active item from the segment after `/app/` (not the `app` segment itself).
- [x] Use a 62px translucent topbar with breadcrumb, global search, live state, linked accounts, security, notifications and user menu.
- [x] Keep linked-account switch/copy controls functional.
- [x] Style security/API-key drawers, contextual asides and toasts with the same cards, radii and semantic states.
- [x] Prevent security/API-key drawer actions from also opening the unrelated right aside.

### Transfer page hierarchy
- [x] Present one full-width dark executive hero before the dashboard sections.
- [x] Use five numbered sections: pulse, attention, portfolio, recipients/schedules and analytics.
- [x] Use four consistent KPI cards and reserve semantic color for icon/status emphasis.
- [x] Keep attention and suggestion lists scannable with one primary row action.
- [x] Surface all six frequent transfer workflows in a consistent shortcut card.
- [x] Provide searchable and status-filterable recent transfers with a useful empty state.
- [x] Keep channel health, favourite recipients, scheduled payments and analytics visible without opening a dialog.
- [x] Keep the floating command bar on desktop and adapt it to an icon-first mobile bar.
- [x] Keep content centred at a maximum width of 1500px.

### Cards, forms, tables and icons
- [x] Cards use 16px radius, subtle border and restrained business elevation.
- [x] Controls use 9–10px radius, green focus ring and clear disabled states.
- [x] Buttons include explicit `type="button"` where they do not submit a native form.
- [x] Form labels are associated with their controls; grouped choices use group captions.
- [x] Tables use uppercase compact headers, responsive horizontal overflow and non-colour status text.
- [x] Use Bootstrap Icons consistently; icons support labels and are never the sole status signal.
- [x] Icon-only controls include contextual accessible names.

### Modals, drawers and wizards
- [x] Dialogs use labelled `role="dialog"`, `aria-modal`, initial close-button focus, trapped Tab navigation, a dark blurred backdrop and sticky header/footer.
- [x] Escape closes the active transfer dialog, focus returns to its trigger, and page scrolling locks while it is open.
- [x] Mobile dialogs become bottom sheets with a maximum 92dvh height.
- [x] Wizard steps are a semantic ordered list with completed, current and upcoming states.
- [x] Completed wizard connectors turn green; active dots use the business focus halo.
- [x] Preserve loading, receipt, download, tabs, PIN and nested workflow behaviour.
- [x] Respect `prefers-reduced-motion` in both shell and page layers.

### Responsive implementation
- [x] `>= 1200px`: full/compact fixed navigation and offset topbar/content.
- [x] `1100–1199px`: off-canvas shell navigation; portfolio may collapse to one column.
- [x] `768–1099px`: two-column KPI/analytics composition where space permits.
- [x] `< 768px`: single-column hero and operational cards, wrapped tools and full-width actions.
- [x] `< 576px`: single KPI column, one-column beneficiaries, compressed schedules, bottom-sheet dialogs and icon-first command bar.

---

## 21. MANUAL VISUAL-QA CHECKLIST

Run this list against `/pm/app/transfer-overview` before release. These are deliberately left as review gates rather than implementation claims.

### Desktop — 1440 × 900
- [ ] Sidebar is exactly 264px when open; content has no horizontal jump or overlap.
- [ ] Topbar controls fit on one line and dropdowns stay within the viewport.
- [ ] Hero aligns with business Dashboard hero in radius, navy/emerald gradient, type scale and spacing.
- [ ] Four KPI cards have equal height; long supporting copy truncates rather than moving the grid.
- [ ] Attention rows, portfolio table and analytics cards align on the 16px card system.
- [ ] Floating command bar does not cover the footer or table controls at the bottom of the page.

### Compact desktop/tablet — 1024 × 768 and 768 × 1024
- [ ] Sidebar starts closed and opens above the page with one backdrop.
- [ ] Search/breadcrumb reduce cleanly without forcing header actions off-screen.
- [ ] KPI grid becomes two columns; portfolio and relationship areas become one column.
- [ ] Tables scroll inside their card; the full document does not scroll horizontally.
- [ ] Drawer and modal layering remains correct above the shell.

### Mobile — 390 × 844 and 360 × 800
- [ ] Hero copy has no clipping and action buttons meet a 40px minimum target.
- [ ] KPI, attention, shortcut, recipient and analytics layouts become one logical reading sequence.
- [ ] The fixed command bar leaves content reachable and uses readable labelled primary action.
- [ ] Modals open as bottom sheets, remain scrollable and keep footer actions visible.
- [ ] PIN inputs fit at 320px width; stepper scrolls without shrinking labels into illegibility.

### Interaction and accessibility
- [ ] Keyboard can reach sidebar, topbar, filters, table actions, floating actions and footer in visual order.
- [ ] Visible focus is not clipped by cards, drawers, tables or dialogs.
- [ ] Open each topbar dropdown; click outside and press Escape to close it.
- [ ] Open Security and API Keys independently; verify no empty right aside appears.
- [ ] Run Send, Bulk and Schedule steppers through completion and verify completed connectors.
- [ ] Open each overview action and verify close, processing, receipt and nested-dialog paths.
- [ ] Search by recipient and reference; test All, Success and Pending including the empty state.
- [ ] At 200% browser zoom, content remains usable with no two-dimensional page scrolling.
- [ ] With reduced motion enabled, pulse/pop/slide transitions are effectively disabled.
- [ ] Run automated contrast/accessibility tooling; manually verify muted text and focus contrast.

---

## 22. RELEASE GATES

- [x] Targeted Biome lint passes for all edited TSX shell and transfer files (August 28, 2026).
- [x] Vitest suite passes: 1 file, 9 tests (August 28, 2026).
- [x] Production client/server build passes with Vite 8.2.1 (August 28, 2026).
- [x] Route responds successfully at `/pm/app/transfer-overview` in the local preview.
- [ ] Manual visual-QA checklist above signed off by a reviewer.
- [ ] Real API payload checked against long names, empty arrays, large amounts and non-KES currencies.
