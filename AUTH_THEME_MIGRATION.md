# Auth Theme Migration — PayMo Business design language

All nine `/auth/*` pages were re-themed and rebuilt on a shared design system so
the authentication surface is visually identical to the business workspace
(`src/features/dashboards/business-dashboard`) and the cards workspace
(`src/features/Layouts/dashboard-cards-layout`).

## What changed

| Before | After |
| --- | --- |
| 9 dark "emerald glass" pages, 9 separate CSS modules (~8,100 lines) | 1 shared design system (`styles/authTheme.module.css` + `components/AuthKit.tsx`) |
| `import "bootstrap/dist/css/bootstrap.min.css"` + Bootstrap JS bundle in every page (global side effects) | Only `bootstrap-icons` font is imported — zero global CSS leakage |
| ~11,700 lines of page code with duplicated markup | ~3,500 lines of composed, typed components |
| Long marketing copy, repeated trust strips, footer link farms | Precise pages: one job per screen |
| Inline status text | Toast notifications + modal dialogs on every meaningful action |

## Design tokens (mirrors `business-dashboard/index.css`)

| Token | Value |
| --- | --- |
| Primary | `#12b76a` / dark `#0b8f52` / soft `#e7f8ef` |
| Ink · text · muted | `#101828` · `#344054` · `#667085` |
| Canvas · surface · line | `#f2f4f8` · `#ffffff` · `#e6e9f0` |
| Brand rail / hero | `linear-gradient(115deg,#0b1322,#123a2c 55%,#0d5c38)` |
| Type | Inter (body) · Sora (headings) |
| Radius / shadow | 16px cards, 10px controls, layered `--au-shadow` |

## Shared kit — `src/features/authentication/components/AuthKit.tsx`

- **Layout**: `AuthPage`, `AuthSplit` (brand rail + form column), `AuthConsole`
  (topbar + content), `Hero`, `Section`, `Card`
- **Controls**: `Button`, `Field`, `Input`, `PasswordInput`, `Select`, `Switch`,
  `Check`, `SegTabs`, `OptionCard`, `OtpInput`, `PinPad`, `Chip`
- **Feedback**: global `toast` store + `Toaster`, `Modal`, `Notice`, `Badge`,
  `Tile`, `Stepper`, `Progress`, `EmptyState`
- **Helpers**: `useCountdown`, `mmss`, `useDeviceLabel`, `go`

Toasts use a module-level store (`useSyncExternalStore`), so any component can
call `toast.success(...)` without a provider.

## Page-by-page

| Route | Shape | Pop-ups / toasts |
| --- | --- | --- |
| `/auth/login` | Split · 5 sign-in methods (passkey, password, PIN pad, magic link, social) | Help router dialog, switch-account confirm, toasts on every flow |
| `/auth/register` | Split · 4-step wizard (type → details → verify → secure) | Terms dialog, leave-setup confirm, strength + OTP toasts |
| `/auth/recovery` | Split · 3 steps (method → verify → new password) | Assisted-recovery dialog, resend/OTP/reset toasts |
| `/auth/mfa` | Split · 6 factors, TOTP window meter, 5-min session timer | Lost-access dialog, recovery-codes dialog, factor toasts |
| `/auth/identity` | Split (wide) · Method → Verify → Review → Next steps | Requirements dialog, cancel confirm, upload/review toasts |
| `/auth/passkeys` | Console · passkey inventory + policies + comparison | Add-passkey wizard, rename, revoke confirm, pair-device dialog |
| `/auth/security` | Console · score, sessions, history, alerts, apps, emergency | Revoke, revoke-all, app permissions, threshold, freeze dialogs |
| `/auth/account-status` | Console · restoration task board | Six multi-step wizards + live application tracker (see below) |
| `/auth/hub` | Console · workspace picker with ⌘K search | Preview, notifications, custom-dashboard builder |

## Preserved

Every route and destination link is unchanged: `/auth/*` file routes,
`/auth/hub`, `/auth/login`, `/auth/register`, `/auth/recovery`, `/auth/mfa`,
`/auth/passkeys`, `/auth/identity`, `/auth/security`, `/auth/account-status`,
the hub workspace targets (`/pm/app/transfer-overview`, `/business-dashboard`,
`/utility/`, `/business/`, `/dev-dashboard/`, `/cards/app/card-command-center`),
and the account-status deep links (`verify.paymo.com/...`, `tel:`, `mailto:`,
`support.paymo.com/...`).

One intentional behaviour change: password sign-in now routes to `/auth/mfa`
(step-up) instead of jumping straight to `/auth/hub`, which makes the existing
MFA route reachable from the primary flow.

Each route also sets its own document title via `head()`.

---

## Account status · verification wizards & application tracking

`/auth/account-status` is no longer a list of links to an external portal. Each
verification task opens a purpose-built multi-step wizard, and submitting one
creates a **tracked application** with a live progress bar and status badges.

### The six wizards (`components/TaskWizards.tsx`)

| Task | Steps | Flow |
| --- | --- | --- |
| Verify your identity | 5 | Document type → capture front/back → proof of address → liveness scan → review & consent |
| Verify linked accounts | 5 | Pick accounts → ownership method → micro-deposit / instant login / statement → wallet OTP → debit mandate + signature |
| Business verification (KYB) | 6 | Entity details → 4 corporate documents → directors (add/remove) → UBO shareholding that must total 100% → operations & markets → director attestation |
| Review flagged transactions | 5 | Queue table → adjudicate each of 4 txns (recognise / not mine) → source of funds → evidence → signed declaration |
| Fraud flag appeal | 6 | Flag summary → grounds → volume before/after + narrative → evidence pack (≥2) → compliance callback contact → dual attestation |
| Resolve customer dispute | 6 | Case file → response type (challenge / refund / partial) → evidence bundle → settlement offer → customer message → review & file |

Each step is individually validated — the **Continue** button stays disabled
until the step is genuinely satisfied — and the shell (`components/WizardKit.tsx`)
provides the clickable step rail, progress bar, autosave note, uploads,
pick-rows, signature fields and summary rows.

### Application tracker (`components/ApplicationTracker.tsx`)

Submitting a wizard issues a reference (`PMO-FA-8Q3D71`) and puts the
application into a task-specific compliance pipeline of five stages. The task
card swaps its CTA for **Track application**, an "Applications in review"
section appears, and the tracker dialog shows:

- reference + copy button, SLA and a live indicator
- overall **progress bar** and stage counter
- a stage timeline where each stage carries a badge: `Done` · `In progress` · `Queued`
- an overall status badge: **Pending → In review → Resolved**
- once resolved, the footer becomes **Proceed to account** → routes to `/auth/hub`
  (the hero and the applications section expose the same CTA when every required
  task is cleared)

Stages advance on a 7-second cadence so the flow can be demonstrated end to end,
and a toast announces each decision.

### Tests

`src/features/authentication/__tests__/wizards.test.tsx` (vitest + jsdom) drives
all six wizards through every step, asserts each step can be satisfied and
submitted, checks the pending → in review → resolved transitions, and runs the
full page flow: file a fraud appeal, fast-forward the pipeline, and confirm
"Proceed to account" appears.

```
npx vitest run src/features/authentication
```
