# Card Dashboard — Fix Summary & Future-Page Playbook

**Project:** `danstack` (Vite + React 19 + TypeScript + TanStack Router/Start + TanStack Query + Bootstrap 5 + CSS Modules)
**Pages fixed:**
- `src/features/card-dashboard/corporate-business-cards` → **PAGE 5.6 Corporate & Business Card Programs**
- `src/features/card-dashboard/virtual-debit-cards` → **PAGE 5.3 Virtual Debit Card Center**
**Reference (known-good) page used as the pattern source:** `src/features/card-dashboard/physical-debit-cards` (PAGE 5.2)

**Validation:** `tsc --noEmit` is clean for both pages and `npm run build` completes successfully (both page chunks emit).

---

## 1. What was broken (root causes)

### A. `corporate-business-cards` (PAGE 5.6) — was almost entirely broken
| # | Problem | Symptom |
|---|---------|---------|
| 1 | Page imported **no CSS at all** and used raw global class names (`pm-app`, `pm-card`, `pm-btn`, `feed-item`, `quick-action-grid`, `c-card`, `pm-table`…) that matched nothing. | Whole page rendered **unstyled / broken layout**. |
| 2 | Rendered its **own sidebar + header** with those dead classes. The app already wraps every page in `CardsShell` (sidebar + header via `<Outlet/>`). | Duplicate / broken chrome, double sidebar. |
| 3 | Content was a **copy of the Physical (5.2) page** (Card Issuance/Ordering, PIN management, replacements) — not the Corporate (5.6) design. | Wrong features for a corporate program. |
| 4 | CSS module existed but was **incomplete** (no `--pm-*` design-token variables) and **disconnected** (class names didn't match the JSX). | Even if imported, tokens like `var(--pm-primary)` resolved to nothing. |
| 5 | Modals were **nested**: the registry returned full `modal > modal-dialog > modal-content` trees and the wrapper wrapped them in *another* `modal > modal-dialog > modal-content`. Used invalid `dataBsDismiss` attrs and placeholder-only bodies. | **Transparent / broken modals**, nothing functional. |

### B. `virtual-debit-cards` (PAGE 5.3) — well-built, but a few real bugs
| # | Problem | Symptom |
|---|---------|---------|
| 1 | **Modal CSS layer had no opaque background, no width, no max-height, no flex-column** on `.modalContent`; `.modalWrap` had no padding. | **Transparent modal cards** (the main reported bug) + unsized dialogs. |
| 2 | `actionClass` config values (`pm-btn-danger`, `pm-btn-danger-soft`, `pm-btn-primary`) didn't match the CSS-module keys (`btnPmD`, `btnPmDSoft`, `btnPmP`). | Action buttons lost their colors. |
| 3 | "Reveal CVV" passed a raw **HTML string** into a renderer that escapes text. | Would show literal HTML instead of the card. |
| 4 | Breadcrumb linked to `/cards` (not a defined route). | TanStack Router type error / dead link. |
| 5 | `SuggestionItem` was missing `iconText` used in the JSX. | Type error; empty icon circles. |
| 6 | Unused imports/locals (strict `noUnusedLocals`). | Type errors. |

---

## 2. What was fixed

### Corporate (5.6) — full rewrite of all 3 files to match the design + working pattern
- **`pages/corporate-business-cards.tsx`** — rewritten to:
  - Import Bootstrap CSS + icons, the CSS module (`styles`), the modals, `useQuery`, `Link`.
  - Use a typed `CorporateBusinessCardsConfig` + `initialMockData` + `fetchCorporateBusinessCards()` (falls back to mock so SSR/dev never crash) — identical data pattern to the working Physical page.
  - Render **only** `pageBar` + `content` (the `CardsShell` layout supplies sidebar/header) — consistent with Physical & Virtual.
  - Real **5.6 content**: hero stats (Active Cards / Pending Approvals / Spend MTD / Missing Receipts), Attention Required, Smart Recommendations (AI), Program Quick Actions, **5.6.1** Program Setup (Recently Issued + Program Configuration), **5.6.2** Controls/Policies/Approvals (Policy Groups + Approval Queue), **5.6.3** Expense & Reconciliation (receipt donut + transactions coding), **5.6.4** Billing & Settlement.
- **`components/CorporateBusinessCardsModals.tsx`** — rebuilt on the clean `MBox` architecture (same as the fixed Virtual modals): single opaque, sized, scrollable dialog driven by `active` id. Implements **all 24 modals** with full content: multi-step **Issue Card** wizard, Bulk Issue, **Policy Rules** (3 tabs), Create Policy, Approval Queue, Review Transaction, Reconciliation, Missing Receipts, Upload Receipt, Card Roster (directory), Manage Employee Card, Edit Limit, Expense Detail, Attention Center, Violation Details, **Funding** (3 tabs), Reports, Statement, Settlement (full/custom amount), Card Delivery tracker, Billing Setup, Branding, Notifications, Company Profile.
- **`styles/corporate-business-cards.module.css`** — complete, self-contained: all `--pm-*` tokens scoped to `.corporateBusinessCards`, full component set (cards, badges, buttons, tables, forms, stepper, tab pills, feed/status rows, quick-action grid, corporate card visual, donut chart) + a **correct opaque modal layer** + responsive breakpoints (tables collapse to labelled cards on mobile).

### Virtual (5.3) — surgical fixes
- **CSS:** rewrote the modal layer → `.modalContent` is now an **opaque white surface** (`background`, `border`, `width:100%`, `max-width:520px`, `max-height:calc(100vh-40px)`, `display:flex; flex-direction:column`, `overflow:hidden`); `.modalWrap` centers + pads + scrolls; `.modalBody` scrolls; `.modalBoxLg`/`.modalBoxXl` widen large dialogs. **This is the fix for the transparent modals.**
- **Page:** removed unused imports; mapped `actionClass` to real CSS keys (`btnPmD`/`btnPmDSoft`/`btnPmP`); breadcrumb → `/cards/app`; added `iconText` to `SuggestionItem` + data.
- **Modals:** "Reveal CVV" now uses proper React state (real card + CVV + copy/hide); wired up `BILLING_CYCLES` and `SUBS_FOR_DISPUTE`; removed dead code; fixed `rows={3}`.

---

## 3. WHY the modals went transparent (the key lesson)
The dialog white background was never declared. The components used **CSS-module-scoped** class names (`styles.modalContent`, `styles.modalWrap`) instead of Bootstrap's global `.modal-content`, so Bootstrap's white background never applied — and the module class itself didn't declare one. **Rule:** the modal container class in the CSS module **must** declare its own `background`, `width`, `max-width`, `max-height`, and flex layout. Never rely on Bootstrap globals for the modal shell when you're using CSS Modules.

---

# 4. FUTURE-PAGE PLAYBOOK (refactor an HTML design → React the first time)

Follow this checklist for every new card-dashboard page so you don't have to re-prompt fixes.

### Step 0 — Copy the pattern, don't reinvent it
Start from the **working reference** `physical-debit-cards` (or the now-fixed `virtual-debit-cards`). Keep the same 3-file structure:
```
feature-folder/
  pages/<PageName>.tsx
  components/<PageName>Modals.tsx
  styles/<page-name>.module.css
```

### Step 1 — Page component template
```tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'      // REQUIRED for grid/utilities
import 'bootstrap-icons/font/bootstrap-icons.css'  // REQUIRED for <i className="bi ..."/>
import styles from '../styles/<page-name>.module.css'
import <PageName>Modals from '../components/<PageName>Modals'

// 1. Type the whole page as ONE config object
// 2. Provide initialMockData (the full design content)
// 3. fetch<Page>() that try/catches and FALLS BACK to mock (SSR-safe)
// 4. useQuery({ queryKey:['paymo-<page>'], queryFn, retry:1, staleTime:60_000 })
// 5. const [activeModal, setActiveModal] = useState<string|null>(null)
// 6. Render:  <div className={styles.root}> pageBar + content ... <Modals active onClose onOpen/> </div>
```
**Do NOT render your own sidebar/header.** The `CardsShell` layout (`routes/cards/app.tsx`) already provides them via `<Outlet/>`. Rendering your own creates a broken double-chrome.

### Step 2 — CSS module template (must be self-contained)
- Put **all `--pm-*` design tokens** inside the root class (e.g. `.myPage { --pm-primary:#4F46E5; ... }`). If you forget this, every `var(--pm-*)` is empty and the page looks broken.
- Use **camelCase class names** (`styles.card`, `styles.btnPm`, `styles.sectionTitle`) and reference them as `styles.xyz` in JSX. **Never** use raw global names like `pm-card` in JSX — they won't be scoped and won't be styled.
- **Always include the modal layer** (copy verbatim):
```css
.backdrop { position:fixed; inset:0; background:rgba(15,23,42,.55); backdrop-filter:blur(2px); z-index:1050; animation:fadeIn .2s; }
.modalWrap { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1051; padding:20px; overflow-y:auto; }
.modalContent { background:var(--pm-surface); color:var(--pm-ink); border:1px solid var(--pm-border);
  border-radius:var(--pm-r-lg); box-shadow:var(--pm-shadow-xl); width:100%; max-width:520px;
  max-height:calc(100vh - 40px); display:flex; flex-direction:column; overflow:hidden; animation:fadeIn .25s; }
.modalBoxLg { max-width:760px; } .modalBoxXl { max-width:1080px; }
.modalHeader { border-bottom:1px solid var(--pm-border); padding:20px 24px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-shrink:0; }
.modalTitle { font-family:var(--pm-font-display); font-weight:700; font-size:16px; margin:0; display:flex; align-items:center; gap:8px; }
.modalBody { padding:24px; position:relative; overflow-y:auto; flex:1 1 auto; }
.modalFooter { border-top:1px solid var(--pm-border); padding:16px 24px; display:flex; justify-content:flex-end; gap:8px; flex-shrink:0; }
@keyframes fadeIn { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:translateY(0);} }
```
- Add responsive `@media` rules; on small screens convert tables to labelled cards using `td::before { content: attr(data-label) }` (so add `data-label="..."` to every `<td>`).

### Step 3 — Modals component template (the `MBox` pattern)
```tsx
function MBox({ id, active, title, size='md', onClose, children, footer }) {
  if (active !== id) return null
  return (<>
    <div className={styles.backdrop} onClick={onClose} />
    <div className={styles.modalWrap} role="dialog" aria-modal="true">
      <div className={`${styles.modalContent} ${size==='lg'?styles.modalBoxLg:''} ${size==='xl'?styles.modalBoxXl:''}`}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>{title}</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  </>)
}
```
Rules that prevent the classic bugs:
- The registry returns **only the body content**, never a full `modal > dialog > content` tree (no nesting).
- One `<MBox>` per modal id; the wrapper decides which shows via `active`.
- For multi-step wizards keep a `step` state + a `Stepper`; for tabs keep a `tabs` record + a tab-pill row; for "submit → success" use `busy` + `results` state and a `renderReceipt` (do **not** inject HTML strings — render real JSX).
- Use `onOpen('otherModal')` to chain modals (e.g. Notifications → Top-up).

### Step 4 — Buttons & badges: use the module keys
When a config item carries an `actionClass`, its value **must** be a real CSS-module key (`btnPmP`, `btnPmD`, `btnPmDSoft`, `btnPmA`, `btnPmW`, `btnPmOutline`), and you apply it as `styles[item.actionClass]`. Don't invent class names that don't exist in the module.

### Step 5 — Verify before you ship (one command each)
```bash
npx tsc --noEmit        # must be clean (strict: noUnusedLocals, verbatimModuleSyntax)
npm run build           # must exit 0 and emit the page chunk
```
Common strict-mode gotchas:
- Use `import type { ReactNode }` for type-only imports (`verbatimModuleSyntax`).
- No unused imports/locals/consts (`noUnusedLocals`) — wire them up or delete them.
- `<textarea rows={3} />` (number, not `rows="3"`).
- `<Link to="...">` must be a **defined route** (check `src/routeTree.gen.ts`); use `/cards/app`, not `/cards`.

### Step 6 — Hand-off prompt you can reuse (copy/paste)
> Refactor `<design.html>` into a new card-dashboard page at `src/features/card-dashboard/<folder>` following the `physical-debit-cards` pattern: 3 files (page + Modals using the `MBox` pattern + self-contained CSS module with all `--pm-*` tokens and the standard opaque modal layer). Do NOT render a sidebar/header (CardsShell provides them). Import Bootstrap + bootstrap-icons. Use `useQuery` with mock fallback. Wire every button/quick-action to a real modal via `setActiveModal`. Add `data-label` to every table `<td>`. Ensure `tsc --noEmit` and `npm run build` pass.

---

## 5. Files changed
```
src/features/card-dashboard/corporate-business-cards/pages/corporate-business-cards.tsx        (rewritten)
src/features/card-dashboard/corporate-business-cards/components/CorporateBusinessCardsModals.tsx (rewritten)
src/features/card-dashboard/corporate-business-cards/styles/corporate-business-cards.module.css  (rewritten)
src/features/card-dashboard/virtual-debit-cards/pages/VirtualDebitCards.tsx                     (fixed)
src/features/card-dashboard/virtual-debit-cards/components/VirtualDebitCardsModals.tsx          (fixed)
src/features/card-dashboard/virtual-debit-cards/styles/virtual-debit-cards.module.css           (modal layer fixed)
```
> Note: `src/features/card-dashboard/VirtualDebitCards/` (PascalCase) is an **orphan duplicate** not referenced by any route — safe to delete later. The live page is the kebab-case `virtual-debit-cards/`.
