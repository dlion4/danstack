# PayMo Reconciliation Center — Page Analysis & Rebuild Plan

> **Your situation:** You are a Paymo member running your own business, with linked
> businesses — **Land Buyers LTD (30 customers)** and **Company 2 (209 customers)** —
> whose customer payments flow through you. Three pages form one system:
>
> - **Settlement** shows *what flowed* — money collected from customers, paid out to
>   businesses, refunded, rebalanced.
> - **Liquidity & Float** shows *what's sitting in the tanks* — business floats and
>   your wallets, and how you move money so customers can always auto-settle.
> - **Reconciliation** (this page) shows *what matched* — proving every collection,
>   payout and float movement is verified against the actual statements from the
>   payout rails (M-Pesa, bank, card) and your settlement accounts.
>
> If Settlement is the story and Liquidity is the fuel, **Reconciliation is the
> audit** — it verifies the story is true. You reconcile *customer money that is not
> yours*, so your permissions decide what you may see, match, refund and dispute.

---

## 1. The core problem with the current page

The page today (`Reconciliation.tsx` + `ReconciliationModals.tsx`) is built as a
**bank interbank reconciliation console**. It assumes you run a bank matching
transfers between Equity, KCB, Co-op, Stanbic and international SWIFT corridors.

| What it shows today | What you actually need |
|---|---|
| "Reconciliation engine — 94.7% match rate, 8,412 of 8,882 txn across 6 banks" | Match rate across **your 2 businesses** and their payout rails |
| Bank Coverage (Equity/KCB/Co-op/Stanbic) | **Business Coverage** — per-business recon health (Land Buyers LTD, Company 2) + rails (M-Pesa, bank transfer, card) |
| Pending workbench of bank transfers (EQ-882910, KCB-991028) | Unmatched **customer transactions** (plot installments, order payments) between your Paymo ledger and rail/settlement statements |
| Matched: Bank A → Bank B (Equity vs KCB) | Matched: **Paymo record ↔ settlement account/rail statement** |
| SWIFT inbound / FX rate pending (USD 125,000) | Nothing — you're a domestic facilitator in KES; no SWIFT, no FX |
| Rules: "Payroll Auto-Match", "Supplier Invoice" | Rules: **per-business** matching (Land Buyers weekly installments, Company 2 daily orders) |
| Team permissions (Finance Team / Auditors / Ops Staff) | **Your** access (My Access roles) + facilitator scopes over customer data |

**The single biggest structural change:** the page must become a
**payment-facilitator reconciliation workspace** — matching the three money
streams the other two pages manage:

```
STREAM 1 — COLLECTIONS  (Settlement page: money recovered from customers)
   Paymo collection record  ↔  rail/settlement statement (M-Pesa / card / bank)

STREAM 2 — PAYOUTS  (Settlement page: money sent to businesses)
   payout instruction  ↔  business settlement account statement

STREAM 3 — FLOAT MOVEMENTS  (Liquidity page: money in the tanks)
   float top-up / rebalance / auto-refill  ↔  wallet & float ledger
```

Every pending/match/exception row must carry a **traceable chain**:
`customer txn (COL-…/ORD-…) → business → rail → settlement account → float movement
(RB-…)` — so you can prove each customer's money arrived, settled, and funded
the next payout.

---

## 2. The data hierarchy (who owns what)

```
ME (Paymo member — running my own business)
│
└── LINKED BUSINESSES  (their customers' money flows through me)
    ├── Land Buyers LTD — 30 customers · weekly high-value installments
    │     rails: bank transfer 60% · M-Pesa 40%
    │     recon per week: ~15 collections · ~4 payouts · 1 float refill
    └── Company 2 — 209 customers · daily low-value orders
          rails: M-Pesa 78% · card 22%
          recon per day: ~200 collections · ~40 payouts · 1 auto-refill

MY MONEY (verification layer between the two worlds)
    └── Business Wallet / Virtual Wallet ↔ business float movements
```

Business selector (`All | Land Buyers LTD | Company 2`) refilters **every**
stat, workbench table, matched table, rule and report on the page.

---

## 3. Data model — facilitator reconciliation rows

### 3.1 Pending / unmatched items (the workbench)
```ts
PendingReconItem {
  ref, date, businessId, customerRef,      // COL-5501 | ORD-8901 | PLT-091
  stream: "collection" | "payout" | "float-movement",
  rail,                                    // M-Pesa | Card | Bank transfer | Wallet
  expectedAmount, receivedAmount, variance,
  direction, status,                       // Unmatched | Exception
}
```
Replaces "Bank | Reference | Description" bank rows. Every pending item names the
**customer** and the **business** — the distinction you need.

### 3.2 Matched items
```ts
MatchedRecon {
  id, date, businessId,
  recordSide, statementSide,               // "Paymo record" vs "M-Pesa statement"
  amount, matchedBy, time, status,
  linkedFloatMovement,                     // RB-… tie-in to the Liquidity page
}
```

### 3.3 Exceptions
```ts
ReconException {
  id, ref, businessId, stream, issue,      // Amount mismatch | Duplicate | Missing ref
  amount, priority, assigned,              // You | System
  resolution: "refund" | "dispute" | "write-off" | "re-match",
}
```

### 3.4 Rules (keep structure, retarget content)
```ts
ReconRule {
  name, businessId, scope,                 // "Land Buyers weekly installments"
  conditions,                              // amount ± KES 500 + ref prefix PLT-
  rate, lastRun, status,
}
```

---

## 4. Permission angle — reconciling money that is not yours

Reconciliation is the page where **customer money** is examined, so it is gated
by the facilitator-scope permissions (from the Liquidity plan's Layer 2):

| Scope | Unlocks on this page |
|---|---|
| `viewCustomerTransactions` | See customer txn details in the workbench (names, orders, plots) |
| `initiateRefunds` | Resolve an exception by refunding a customer |
| `reverseChargebacks` | File / manage disputes on unmatched chargebacks |
| `holdSettlement` | Pause a business's payouts while an exception is open |
| `exportStatements` | Export reconciliation certificates & audit reports |

Render a compact **"My Recon Access" pill** near the page bar — `View txns ✓ ·
Refunds ≤ KES 5K · Disputes ✓ · Hold ✗` — drawn from the same permission model
as the other two pages, so all three stay consistent. "Team Permissions"
becomes this one panel (you run your business alone; no Finance Team/Auditors).

---

## 5. Proposed new page structure (section by section)

### 5.1 Page bar + business selector (KEEP layout, add selector)
Add the same **business pills** as the other pages
(`All | Land Buyers LTD | Company 2`). Keep Run Auto-Recon + Manual Match buttons.

### 5.2 Hero stats (KEEP pattern, reframe data)
| Stat | Data |
|---|---|
| Match rate | overall + per-business (98.2% vs 96.4%) |
| Matched today | collections + payouts + float movements matched |
| Pending / exceptions | count + KES value in unmatched items |
| Audit trail | recon runs + manual actions this month |

### 5.3 Overview dashboard (KEEP 4-panel grid, reframe 3 panels)
- **Bank Coverage → Business & Rail Coverage:** Land Buyers LTD 98.2% · Company 2
  96.4% · M-Pesa 99.1% · Card 97.8% · Bank transfer 98.8%
- **Today's Activity:** bars per business/rail instead of per bank
- **Exception Breakdown:** keep (amount mismatch, duplicate, missing reference,
  timing — all still apply)
- **Reconciliation Health:** keep tiles (auto-match rate, manual review needed,
  avg resolution time)

### 5.4 Pending Reconciliations Workbench (KEEP structure, retarget columns)
Columns become: Date · Business · Customer Ref · Stream · Rail · Expected ·
Received · Variance · Status · Actions (Match / Flag). Every row ties to a
customer txn ref and a settlement txn ref.

### 5.5 Matched Transactions (KEEP structure, retarget columns)
Columns become: Match ID · Date · Business · Paymo Record · Statement ·
Amount · Matched By · Float Link (RB-…) · View. The **Float Link** column is the
new cross-page connection to Liquidity.

### 5.6 Discrepancies & Exceptions (KEEP structure, retarget + resolutions)
Same table plus: business column, stream column, and resolution actions
(**Refund** if you hold the scope, **Dispute**, **Re-match**) instead of generic
Resolve/Dispute.

### 5.7 Auto-Reconciliation Rules Engine (KEEP structure, retarget content)
Rules become per-business: "Land Buyers weekly installments (ref PLT-)",
"Company 2 M-Pesa orders (ref ORD-)", "Float refill auto-match (ref RB-)".
New Rule / Performance modals stay.

### 5.8 Reports, Exports & Audit Trail (KEEP — already `qaBtn` styled)
Quick Reports stay (Daily Reconciliation, Monthly Summary, Exception Report,
Audit Certificate) — now **per business**, exportable as statements your
businesses can verify. Audit Activity rows gain a business/world tag.

### 5.9 Reconciliation Settings & Automation (KEEP, reframe team panel)
- **Matching Tolerances:** keep (amount ± KES 100, date window ± 3 days, ref
  similarity 85%) — editable, per-business in the settings modal
- **Notifications:** keep
- **Team Permissions → My Recon Access:** the scope checklist from §4

### 5.10 Attention / Suggestions / Quick Actions (KEEP, reframe content)
- Attention: "Company 2 M-Pesa batch variance KES 48,200", "Land Buyers bank
  installment unmatched (KES 2.25M)", "Float refill RB-9923 unmatched"
- Suggestions: "Auto-match 34 pending items (confidence > 92%)", "Create rule for
  Land Buyers Friday installments", "Export monthly reconciliation for Company 2"
- Quick Actions: Manual Match, Flag Exception, Run Auto-Recon, Auto-Rule,
  Disputes, Audit Log, Reports — keep the `qaGrid`/`qaBtn` pills

---

## 6. What to delete / keep — safe removal audit

**Delete or fully replace (bank-only concepts):**
- `bankCoverage` (Equity/KCB/Co-op/Stanbic rows) → business + rail coverage
- `activityBars` per bank → per business/rail
- Pending/matched rows keyed to bank refs (EQ-/KCB-/COOP-) → customer txn refs
- SWIFT / FX-rate items + `fxRateModal` → remove (domestic KES facilitator)
- "Payroll Auto-Match" / "Supplier Invoice" rules → per-business rules
- `team` (Finance Team/Auditors/Ops Staff) → My Recon Access scope panel
- Hero copy "8,412 of 8,882 transactions across 6 banks" → your two businesses

**Keep and reframe (do NOT distort what already works):**
- Hero + stat card layout → reframed stats
- Attention / Suggestions / Quick Actions (`qaGrid`/`qaBtn`) → reframed rows
- Overview 4-panel grid (coverage, activity, exceptions, health) → reframed data
- Pending workbench + Matched + Exceptions tables → retargeted columns + refs
- Rules Engine + Top Performing Rules → per-business rules
- Reports & Audit Trail (already slim `qaBtn` Quick Reports) → per-business
- Settings (tolerances, notifications) → kept, tolerances made editable
- All 18 remaining modals (manualMatch, bulkMatch, discrepancy, dispute,
  runAutoRecon, ruleEngine, rulePerformance, uploadStatement, exportReport,
  auditLog, reconSettings, reconcileNotif, filter, healthCheck, attentionFull,
  matchedFilter, profile) → kept, content retargeted
- Table/badge/pill primitives and every page pattern

**New sections to build:**
1. Business selector (mirrors Settlement/Liquidity)
2. Stream column (Collection / Payout / Float movement) across tables
3. Float Link column on Matched (RB-… tie to Liquidity page)
4. My Recon Access scope panel (replaces Team Permissions)
5. Exception resolution gated by permissions (Refund / Dispute / Re-match)

---

## 7. Mock data for your two real businesses (ready to implement)

### Land Buyers LTD — 30 customers (weekly high-value installments)
- Match rate: 98.2% · Last run: Fri 09:00 (before weekly payout batch)
- Pending: 1 high-value item — bank installment KES 2.25M (PLT-088) unmatched
  against settlement account statement
- Matched today: 12 collections (bank 60% / M-Pesa 40%) + 3 payouts + 1 float
  refill (RB-9921)
- Rule: "Land Buyers weekly installments — ref prefix PLT-, amount ± KES 500" (99.1%)
- Exception: 1 amount mismatch KES 50,000 — **High priority, needs your review
  before Friday payout**

### Company 2 — 209 customers (daily low-value orders)
- Match rate: 96.4% · Last run: Today 06:00 (before daily auto-settle)
- Pending: M-Pesa order variance KES 48,200 (ORD-8899) + 3 missing references
- Matched today: 187 collections (M-Pesa 78% / card 22%) + 38 payouts + 1
  auto-refill (RB-9922)
- Rule: "Company 2 M-Pesa orders — ref prefix ORD-, 3-day window" (99.4%)
- Exception: 1 duplicate — KES 12,400 charged twice on one order

The contrast is the point: one weekly batch with one critical high-value item,
one daily stream with many small pending items — different schedules, rails,
and exception patterns.

---

## 8. Implementation order (milestones)

1. **M0 — Structure:** business selector + page-bar scope pill; retitle/reframe
   hero + overview copy; remove SWIFT/FX and bank-coverage blocks.
2. **M1 — Workbench:** retarget Pending/Matched/Exceptions tables to customer
   refs + Stream column + Float Link; retarget rules to per-business.
3. **M2 — Access:** replace Team Permissions with My Recon Access scope panel;
   gate Refund/Dispute/Re-match actions by scope.
4. **M3 — Data:** add the two real businesses to mock config; filter every
   metric by selected business; align refs with Settlement (COL-/ORD-/PLT-) and
   Liquidity (RB-…) pages so the three pages tell one story.
5. **M4 — Polish:** per-business reports, exception resolutions with working
   receipts, activity world tags, editable tolerances per business.

**Files touched:** `pages/Reconciliation.tsx` (config + sections), `components/ReconciliationModals.tsx`
(retargeted modals + My Recon Access panel), `styles/reconciliation.module.css`
(business pills, scope panel, float-link styling — same visual language as the
Settlement/Liquidity rebuilds: `worldSwitch`, `bizPill`, `permItem`, `qaGrid`/`qaBtn`).
