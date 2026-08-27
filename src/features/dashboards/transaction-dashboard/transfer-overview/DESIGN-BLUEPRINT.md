# Dashboard A Design System Blueprint
> Extracted from: `business-dashboard/components/Dashboard/` and `Onlinestore/`
> Target: `transaction-dashboard/transfer-overview/`
> Date: August 27, 2026

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

## 19. IMPLEMENTATION CHECKLIST FOR TRANSFER-OVERVIEW

### Phase 1: CSS Variable Alignment
- [x] Map all `--pm-*` tokens to Dashboard A exact values
- [x] Remove cream/warm color tones, use cool grays
- [x] Add missing tokens: `--pm-card`, `--pm-badge-*` colors

### Phase 2: Typography
- [x] Switch headings to Sora
- [x] Set body to Inter at 0.925rem
- [x] Match all font-size scales

### Phase 3: Component Styles
- [x] Card: 16px radius, dual-layer shadow, hover elevation
- [x] Buttons: 10px radius primary, 8px small, green hover states
- [x] Badges: badge-soft pattern with correct bg/text colors
- [x] Tables: uppercase headers, proper cell padding
- [x] Forms: 10px radius, green focus ring
- [x] Modals: 18px radius, dark backdrop, proper padding
- [x] Wizard: 34px dots, green active glow, done state

### Phase 4: Layout
- [x] Content: max-width 1500px, centered
- [x] Topbar: sticky, blur, proper border
- [x] Responsive: sidebar collapse at 1200px

### Phase 5: Animations
- [x] pmPop for modals
- [x] pmSlideIn for drawers
- [x] pmPulse for live dots
- [x] pmToastIn for notifications

---

## 20. TRANSFER-OVERVIEW SPECIFIC MAPPING

| Dashboard A Pattern | Transfer-Overview Equivalent |
|---------------------|------------------------------|
| `pm-card` | `.card` class |
| `pm-card-hover` | Cards with click handlers |
| `pm-kpi-label` | `.sl` class |
| `pm-kpi-value` | `.sv` class |
| `pm-sec` + `pm-sec-no` | Section headers (no numbered sections in transfer) |
| `badge-soft` | `.badge`, `.badgeS/W/D/I/P` |
| `btn-primary` | `.btnPmP` class |
| `btn-outline-secondary` | `.btnPm` class |
| `pm-table` | `.tbl` class |
| `pm-wizard-track` | `.stepper` class |
| `pm-modal` | `.modalWrap` / `.modalBox` classes |
| `pm-toast-stack` | Not yet implemented (add) |
| `pm-chip` | `.pills` / `.pill` classes |
| `pm-drawer` | Not used (all modals) |
| `pm-banner-hero` | `.cardAccent` class |
