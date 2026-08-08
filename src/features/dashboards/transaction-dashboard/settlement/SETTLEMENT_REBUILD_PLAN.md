# PayMo Settlement & Clearing — Page Analysis & Rebuild Plan

> **Your situation:** You are a member of the Paymo platform. You have NOT yet linked
> your API key / connected Paymo to process your customers' payments. You onboard
> businesses (merchants), and those businesses' customers pay through your platform.
> You need a settlement workspace that shows **your customers' settlements**
> (money collected, money paid out to them, refunds, rebalance/auto-settle funding)
> and **your own internal wallet settlements** (your business wallet / virtual wallet),
> with a hard separation between the two worlds — plus a clear view of what each
> linked business must grant permission for.

---

## 1. The core problem with the current page

The page today (`Settlement.tsx` + `SettlementModals.tsx`) is built as a **bank-grade
clearing operator console**. It assumes you are a bank treasury manager (RTGS, PesaLink,
SWIFT, Nostro accounts, CBK regulatory returns, clearing-house cut-off windows).

| What it shows today | What you actually need |
|---|---|
| "Settlement engine live — KES 2.84B settled" | Your merchant settlement totals across your businesses |
| RTGS / PesaLink / ACH / SWIFT channel performance | Payout rails: M-Pesa, bank transfer, card, Paymo wallet |
| Clearing house windows & cut-off timers | Paymo connection status (not yet linked!), payout schedule |
| Nostro/Vostro positions (USD/EUR/GBP banks) | Your internal business wallet + virtual wallet balances |
| CBK / KRA / AML regulatory reports | Business KYC/permission requirements & settlement statements |
| "PayMo VA → Stripe API" style internal ledger rows | Per-business collections, payouts, refunds, rebalances |

**The single biggest structural change:** the page must become a
**payment-facilitator settlement workspace** organized around **two distinct worlds**:

```
WORLD A — CUSTOMER/BUSINESS SETTLEMENTS
   money flowing between your customers (businesses) and their end customers
   └─ collections (recovered), payouts (sent to them), refunds, chargebacks,
      rebalances to fund auto-settlement

WORLD B — MY INTERNAL SETTLEMENTS
   your own money on the platform
   └─ business wallet, virtual wallet, internal transfers, self top-ups
```

These two worlds must be **clearly separated** (tabs / segmented control) because the
data, permissions, and actions are completely different.

---
5
## 2. The data hierarchy (who owns what)

```
ME (Paymo member / payment facilitator)
│
├── World B: MY WALLETS  (business wallet, virtual wallet, internal balances)
│
└── World A: LINKED BUSINESSES  (merchants I onboarded and collect for)
    │
    ├── 1. LAND BUYERS LTD        — 30 customers, paying land-plot installments (high value, monthly, KES)
    └── 2. [COMPANY 2]            — 209 customers, paying retail/product orders (high volume, low value, daily)
```

Each business has:
- its **own customer base** (30 vs 209) making **different payment types**
- its own **settlement profile** (fee %, payout schedule, minimum float, auto-settle rule)
- its own **permission requirements** (what it must approve before it can settle)
- its own **collection/payout/refund ledger**

So every metric, table and section must be **filterable by business context** — and the
two example businesses should make that distinction visible immediately.

---

## 3. What each business needs to show (World A data model)

### 3.1 Business entity
```
Business {
  id, name, type (e.g. Real Estate / Retail / Services),
  status (Active / Pending Setup / Suspended),
  customersCount,                 // 30 or 209
  settlementAccount,              // where payouts go (bank / M-Pesa / Paymo wallet)
  feePercent,                     // your cut, e.g. 1.5%
  payoutSchedule,                 // Daily / Weekly / Monthly / Manual
  minimumFloat,                   // auto-settle funding threshold
  currency,
  connectedAt,                    // Paymo connection date (empty = not yet linked)
  permissionStatus,               // which permissions are granted/pending
}
```

### 3.2 Settlement ledger per business — every row the user asked for
```
SettlementTxn {
  txnRef, date, customerName, order/plot ref,
  paymentMethod,                 // M-Pesa, card, bank, wallet
  amountCollected,               // "amounts recovered"
  payoutAmount,                  // "amount i send them" (net of fee)
  fee, 
  refund,                        // incl. refund reason & status
  chargeback,
  status,                        // Collected / Paid Out / Pending / Refunded / Failed
}
```

### 3.3 Rebalance / auto-settle funding
```
Rebalance {
  id, businessId, direction,     // from float → settlement account (auto-settle for customers)
  amount, trigger,               // manual / auto (below minimum float)
  sourceWallet, targetAccount, status, initiatedBy, time
}
```

### 3.4 Refunds
```
Refund { id, businessId, txnRef, customer, amount, reason, initiatedBy, status, date }
```

---

## 4. World B data model (my internal settlements)

```
MyWallet {
  id, type,                      // "Business Wallet" | "Virtual Wallet"
  balance, available, pending,
  currency, purpose,             // e.g. "funding business payouts" / "personal use"
}

InternalTransfer {
  id, from, to, amount, reference, status, date,
  // e.g. Business Wallet → Virtual Wallet, or Wallet → Business Settlement Float
}

SelfTopUp / Withdraw {
  id, wallet, amount, destination, status, date
}
```

**Why you need these:** before you can settle any customer's transaction, Paymo needs
funding in your float. World B is where you move your own money to make that happen
("amount i rebalance to an account for it to auto settle for my customer").

---

## 5. Permission model — "clear distinction between the data from my customers so that i need to know permissions and what they require"

Add a **Permissions** panel per business — a checklist of what that business must grant
before settlement can run. Track each as `Granted / Pending / Required`:

```
PERMISSION CHECKLIST (per business)
├── 1. KYC & onboarding docs (business registration, directors, tax PIN)
├── 2. API / integration scopes (what Paymo can access: create payment links, read txns)
├── 3. Settlement account ownership (verify bank / M-Pesa number matches business name)
├── 4. Fee agreement (accept your % per txn)
├── 5. Payout schedule consent (daily/weekly/monthly)
├── 6. Auto-settle float rule (rebalance threshold, funding source)
├── 7. Refund authority (who can initiate refunds, max amount)
├── 8. Data visibility scope (what their customers' data they can see)
```

On the page this renders as a compact **progress pill** on each business card
(e.g. "6/8 granted") with a **detail drawer** listing each permission, its status, what
it unlocks, and a "Request / Resend" action.

---

## 6. Proposed new page structure (section by section)

### 6.0 Paymo connection banner (NEW — because you haven't linked yet)
- **Status card:** "Paymo not connected" with **Link API Key** CTA (enter API key →
  test connection → save). Once linked, shows connected date, last sync, webhook health.
- This is the **gate** — most settlement data stays in "preview/mock" until linked.

### 6.1 Context switcher (NEW — the heart of the redesign)
A **segmented control** with two segments:
- **👥 Customer Settlements** (World A)
- **👛 My Wallets & Internal** (World B)

Inside World A, a **business selector**: `All Businesses` | `Land Buyers LTD (30)` |
`[Company 2] (209)`. Switching it refilters every stat, table and card on the page.

### 6.2 World A — Overview stats (reframes current hero/stat cards)
| Stat | Data |
|---|---|
| Collected (recovered) this period | Σ amountCollected |
| Paid out to businesses | Σ payoutAmount |
| Refunds issued | Σ refund |
| Net earned (fees) | Σ fee |
| Auto-settled via rebalance | Σ rebalance |
| Pending payout | next scheduled batch total |

When a business is selected, these show **that business only** — the 30-customer
installment business vs the 209-customer retail business will look very different.

### 6.3 World A — Business settlement table (NEW, replaces bank channels table)
Per business row (or per-batch detail when one business selected):
```
Business | Customers | Collected | Payouts | Refunds | Net | Fee % | Schedule | Permissions (x/8) | Status | Action
```

### 6.4 World A — Business detail drawer (NEW)
Clicking a business opens: its customers count (30 / 209), ledger of
collections/payouts/refunds, permission checklist, settlement account, fee agreement,
auto-settle float config, and "View Statement" export.

### 6.5 World A — Collections vs Payouts split (NEW)
Two side-by-side tables: **money recovered from customers** (amounts collected) and
**money sent to the business** (payouts) — the "clear distinction" you asked for.

### 6.6 World A — Refunds & Chargebacks (NEW section)
Filterable table of refunds with reason, status, initiator, and approval workflow.

### 6.7 World A — Rebalance & Float (replaces Clearing House)
Where you **fund auto-settlement**: per-business float level vs `minimumFloat`, a
**Rebalance** button (amount, source wallet → business settlement account), and the
auto-rule (refills float when below threshold). This is "amount i rebalance to an
account for it to auto settle for my customer."

### 6.8 World B — My Wallets (NEW)
Cards for **Business Wallet** and **Virtual Wallet** (balance, available, pending).
Actions: **Send Money** (internal transfer between my wallets), **Top Up**,
**Withdraw to bank**. A small table of internal transfers.

### 6.9 World B — Internal transfer flow (NEW modal)
`From wallet → To wallet/account | Amount | Reference | Confirm` — editable inputs,
not fixed values (per your earlier requirement).

### 6.10 Auto Settlement Rules (KEEP current — already rebuilt with editable tabs)
Retarget content: rules like "Auto-settle Land Buyers LTD payouts weekly on Friday",
"Auto-rebalance float when below KES 500K", "Auto-refund txns under KES 2K".

### 6.11 Reports & Analytics (KEEP, reframe)
- Business settlement statements (per business, per period)
- Fee earnings report
- Refund analysis
- Rebalance history
- **Onboarding status** (which businesses still need permissions)

### 6.12 Attention / Suggestions / Quick Actions (KEEP pattern, reframe content)
- Attention: "Land Buyers LTD missing KYC doc — payouts paused", "Paymo API key not
  linked", "Float below minimum for Company 2".
- Suggestions: "Auto-settle on Tuesday to cut fees", "Enable instant refunds for
  Company 2's 209 customers".
- Quick Actions: Link Paymo API, New Payout, Rebalance Float, Issue Refund, Send to
  My Wallet, View Permissions.

### 6.13 Recent Activity (KEEP, add `World` column)
Every activity row tagged **Customer Settlement** vs **Internal Wallet** and colored
differently so the two data worlds never blur.

---

## 7. What to delete / keep from the current code

**Delete or fully replace:**
- `channels` (RTGS/PesaLink/SWIFT/ACH rows) → business settlement table
- `clearing` (PesaLink/RTGS clearing windows) → rebalance & float section
- `nostroPositions` (bank Nostro) → my wallets
- `regReports` (CBK/KRA/AML) → business onboarding/permission status
- "Real-time Settlement Engine" & "Clearing House" section headers/copy
- "Engine Health" (throughput/queue depth) → connection health (API linked? last sync)

**Keep and reframe:**
- Hero + stat card layout → World A overview stats
- Attention / Suggestions / Quick Actions pattern (already mobile-money styled)
- Reconciliation & Disputes → refunds/chargebacks + recon per business
- Auto Rules (already rebuilt with editable tabs + History)
- Reports & Analytics, Recent Activity, all modal primitives (`styles.ub`, `styles.tbl`,
  `styles.pills`, `styles.fc`, `styles.fl`, badge tones)

**New sections to build:**
1. Connection banner + Link API key
2. World A/B context switcher + business selector
3. Business list table (with permission progress)
4. Business detail drawer (customers, permissions, ledger, statement)
5. Collections vs Payouts split
6. Refunds & chargebacks
7. Rebalance & float
8. My Wallets + internal transfer

---

## 8. Mock data for your two real businesses (ready to implement)

### Land Buyers LTD — 30 customers (real-estate installments)
- Type: Real Estate; low volume, **high value**; monthly installments (KES 500K–5M per txn)
- Collected MTD: KES 86.4M · Payouts: KES 81.2M · Refunds: KES 1.1M (1 plot cancellation)
- Fee: 1.25% · Schedule: Weekly · Float: KES 3M minimum
- Permissions: 7/8 (missing: settlement account verification)
- Customers: 30 · Avg txn: KES 1.9M · Payment mix: bank transfer 60%, M-Pesa 40%

### [Company 2] — 209 customers (retail / product orders)
- Type: Retail; high volume, **low value**; daily orders (KES 200–50K per txn)
- Collected MTD: KES 12.8M · Payouts: KES 11.6M · Refunds: KES 860K (25 orders)
- Fee: 2.0% · Schedule: Daily · Float: KES 500K minimum
- Permissions: 8/8 (fully onboarded)
- Customers: 209 · Avg txn: KES 1,900 · Payment mix: M-Pesa 78%, card 22%

These two rows alone make the **business distinction** obvious: different customer
counts, ticket sizes, schedules, floats, and permission states.

---

## 9. Implementation order (milestones)

1. **M0 — Structure:** context switcher (World A / World B), business selector, connection banner; retitle/reframe existing sections' copy.
2. **M1 — World A:** business list table + stat rework; Collections vs Payouts; Refunds; business detail drawer with permission checklist.
3. **M2 — Rebalance & float:** float cards, Rebalance modal (editable fields), auto-refill rule.
4. **M3 — World B:** My Wallets cards, internal transfer modal, transfer history.
5. **M4 — Data:** add the two real businesses to mock config; filter every metric by selected business.
6. **M5 — Polish:** API-link modal, statement export, permission request/resend flow, activity `World` tags.

**Files touched:** `pages/Settlement.tsx` (config + sections), `components/SettlementModals.tsx` (new modals: Link API, Rebalance, Internal Transfer, Business Detail, Permission Request), `styles/settlement.module.css` (segment control, drawer, wallet cards).
