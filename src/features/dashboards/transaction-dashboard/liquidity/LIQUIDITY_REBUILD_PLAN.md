# PayMo Liquidity & Float — Page Analysis & Rebuild Plan

> **Your situation:** You are a member of the Paymo platform running **your own
> business**. You have linked businesses (merchants) whose customers pay through
> you — **Land Buyers LTD (30 customers)** and **Company 2 (209 customers)**. To
> settle those customers you hold **float** (pre-funded money) at Paymo, and you
> move **your own money** between your business wallet, virtual wallet, and each
> business's settlement float. You also hold **permissions** — both on the linked
> business accounts you manage, and as a manager over your customers' data and
> money movements.
>
> This page is the *money-fuel side* of the Settlement page: Settlement shows
> *what flowed*; Liquidity & Float shows *what's sitting in the tanks* and how you
> move it so customers can always auto-settle.

---

## 1. The core problem with the current page

The page today (`Liquidity.tsx` + `LiquidityModals.tsx`) is built as a **bank
treasury command center**. It assumes you run a bank or a large PSP treasury desk
with partner banks, an agent network, and an executive approval chain.

| What it shows today | What you actually need |
|---|---|
| "Liquidity command center — KES 1.84B Total Float" across 12 banks | Your float across your 2 linked businesses + your own wallets |
| Bank float accounts (KCB, Equity, Co-op, Absa, Stanbic) | Per-business settlement floats (Land Buyers LTD, Company 2) |
| 847 agents + 31 partner organizations | Your payout rails (M-Pesa, bank transfer, card, Paymo wallet) — the *sinks* your float funds |
| Emergency KES 200M standby line + "activate now" | Nothing — you don't have bank credit lines; you have a Paymo float cap |
| Governance log (CFO / Treasurer / Risk Committee approvals) | Who-you-are permissions: your role limits on each business account + your manager authority over customer funds |
| 48h forecast "shortfall" in bank terms | Per-business float runway: how many days of customer payouts your float covers before top-up |
| "Bank Float / Agent Float / Partner Float" top-up categories | Top-ups from **your** wallet to each **business float** — one source, many sinks |

**The single biggest structural change:** the page must become a
**payment-facilitator float workspace** organized around **two distinct worlds**:

```
WORLD A — BUSINESS SETTLEMENT FLOATS  (money that funds customer auto-settlement)
   └─ per-business float balance, minimum threshold, auto-rebalance rule,
      payout rails that draw on it (M-Pesa / bank / card / wallet)

WORLD B — MY LIQUIDITY  (your own money on the platform)
   └─ business wallet, virtual wallet, transfers between them,
      top-up of business floats FROM your wallet
```

The action that connects them is the **rebalance**: move money from World B
(your wallet) → World A (a business's float) so that business's customers can
auto-settle. That single flow was buried inside "bank rebalancing" — it becomes
the hero of this page.

---

## 2. The data hierarchy (who owns what)

```
ME (Paymo member — running my own business)
│
├── WORLD B: MY LIQUIDITY
│   ├── Business Wallet       (funds I move to fund payouts & floats)
│   └── Virtual Wallet        (my own money, withdrawable)
│
└── WORLD A: LINKED BUSINESS FLOATS  (one float per business I collect for)
    ├── Land Buyers LTD — 30 customers · high-value weekly installments
    │     float KES 3.2M · min KES 3.0M · auto-rebalance from Business Wallet
    │     payout rails: bank transfer 60%, M-Pesa 40%
    └── Company 2 — 209 customers · low-value daily retail
          float KES 640K · min KES 500K · auto-rebalance from Business Wallet
          payout rails: M-Pesa 78%, card 22%
```

Every metric, bar and table must be **filterable per business** — and the two
example businesses must make the difference obvious immediately (one float is
5× the other; one drains daily, the other weekly).

---

## 3. World A data model — business settlement floats

### 3.1 Float account per business
```ts
BusinessFloat {
  businessId, businessName,           // Land Buyers LTD | Company 2
  customersCount,                     // 30 | 209
  balance,                            // current float, KES
  minimumFloat,                       // auto-settle floor, KES
  lastRebalancedAt,
  status,                             // Healthy | Low | Critical
  autoRule: {                         // editable, per earlier requirement
    enabled: boolean,
    trigger: "below-minimum" | "scheduled",
    schedule: "daily-06:00" | "weekly-fri-15:00",
    source: "business-wallet" | "virtual-wallet",
    targetTopUp: number,              // amount or "to-minimum+20%"
  },
  payoutRails: [{ rail: "M-Pesa" | "Bank transfer" | "Card" | "Paymo wallet",
                  sharePct: number, floatNeeded: number }],
  permissionStatus: { granted: number, total: number },  // from Settlement page
}
```

### 3.2 Float movement ledger (every row the user asked for)
```ts
FloatMovement {
  ref, time, businessId,
  direction: "top-up" | "rebalance-out" | "payout" | "refund" | "auto-refill",
  from, to,                          // e.g. Business Wallet → Land Buyers Float
  amount, reason,
  trigger: "manual" | "auto",
  initiator,                         // You | System | rule
  status,                            // Completed | Pending | Failed
}
```

### 3.3 Float runway / health (replaces bank "forecast shortfall")
```ts
FloatHealth {
  businessId, daysOfPayoutsCovered,  // balance ÷ avg daily payout
  projectedPayouts48h,               // from settlement pipeline
  runwayTone: "safe" | "watch" | "critical",
  recommendedTopUp,
}
```

---

## 4. World B data model — my liquidity

```ts
MyWallet {
  id, type,                          // "Business Wallet" | "Virtual Wallet"
  balance, available, pending,
  currency, purpose,                 // "funding customer payouts" / "my own money"
  linkedBankAccount,                 // withdrawal destination
}

InternalTransfer {                   // already exists as internalTransferModal
  id, from, to, amount, reference, status, date,
  // Business Wallet → Virtual Wallet | Wallet → Business Float
}
```

**Why this matters:** every customer payout draws on a business float; every
float is refilled from your Business Wallet; your Business Wallet is funded from
your Virtual Wallet / bank top-up. The chain is:
`Bank → Virtual Wallet → Business Wallet → Business Float → Customer payout`.
This page makes that chain visible and operable.

---

## 5. Permission model — the two layers you asked for

The Settlement page covers **what each business must grant** (8-item checklist).
This page covers the **other two permission layers**:

### Layer 1 — Permissions YOU hold on each linked business account (as their manager)
What you're allowed to do *to* the business's money, and your limits:
```ts
ManagerPermission {
  businessId,
  role: "Owner" | "Manager" | "Viewer",      // your role on that business account
  canInitiatePayouts,      // max amount per payout
  canRebalanceFloat,       // source wallets you may pull from
  canIssueRefunds,         // max refund without approval
  canEditRules,            // auto-rebalance / threshold changes
  canWithdrawToBank,       // withdrawal authority
  approvalLimit,           // KES x — above this needs a co-approver
  granted: boolean,        // granted by the business's account owner
}
```
Rendered as a **"My Access" pill on each float card** (e.g. "Manager · payouts ≤
KES 5M") with a drawer listing each right and its limit.

### Layer 2 — Permissions you hold as manager over your customers' funds/data
The authority Paymo gives **you** over the customer transactions flowing
through your floats:
```ts
FacilitatorScope {
  viewCustomerTransactions,   // read all 30 / 209 customers' txn data
  initiateRefunds,            // refund a customer txn
  reverseChargebacks,
  holdSettlement,             // pause/hold a business's payouts (e.g. KYC flag)
  readKycDocuments,           // view business KYC status
  exportStatements,
}
```
Rendered as a compact **"Facilitator Permissions" card** (World B side) with
Granted / Pending status per scope. This is the "clear distinction between the
data from my customers" — customer money is *theirs*, you hold it briefly, and
this card says exactly what you may do with it.

### Summary of the full permission picture across the three pages
| Layer | Where | Example |
|---|---|---|
| Business → Me (KYC, fee, schedule, float rule) | Settlement page | Land Buyers 7/8, Company 2 8/8 |
| Me → Business accounts (role limits) | **This page** | "Manager · payouts ≤ KES 5M · no withdraw" |
| Paymo → Me (facilitator scope over customers) | **This page** | "Refund ≤ KES 5K auto-approve · hold settlements" |

---

## 6. Proposed new page structure (section by section)

### 6.0 Paymo connection banner (NEW — same gate as Settlement)
"Paymo not connected yet — link your API key to start holding and moving float."
Dismisses when linked; then shows linked date, float cap, last sync.

### 6.1 Context switcher (NEW — mirrors Settlement)
- **📊 Business Floats** (World A) / **💼 My Liquidity** (World B)
- Inside World A: business pills `All Floats | Land Buyers LTD | Company 2` that
  refilter every card, bar, and ledger.

### 6.2 World A — Float health stats (reframes hero/stat cards)
| Stat | Data |
|---|---|
| Total float held | Σ business floats |
| Float vs minimum gap | Σ balance − Σ min |
| Days of payout runway | worst business runway (min of all) |
| Auto-settle ready | Σ float above min = ready to settle |
| Payouts this week | Σ payout float draw-downs |
| Float below minimum | count of businesses in red |

### 6.3 World A — Business float cards (NEW, replaces Bank Float Accounts table)
One card per business:
```
[Land Buyers LTD]  Active            [Company 2]  Active
30 customers · Weekly · Fri          209 customers · Daily
FLOAT  KES 3.20M  ·  MIN  KES 3.00M  FLOAT  KES 640K · MIN KES 500K
[====float meter 94%====]             [===meter 78%====]
🛡️ My Access: Manager · ≤KES 5M      🛡️ My Access: Owner · full
Rails: Bank 60% · M-Pesa 40%          Rails: M-Pesa 78% · Card 22%
[⚙️ Float Rules] [↗️ Top-up] [🔄 Rebalance]   (same buttons both cards)
```

### 6.4 World A — Float Rules modal (NEW, editable — not fixed values)
Editable per business: minimum float, auto-rebalance trigger (below-min /
scheduled), source wallet, top-up amount formula, alert at % of min. Persists to
the float card state.

### 6.5 World A — Float movements ledger (replaces Recent Rebalancing Activity)
Columns: Time · Business · Direction (Top-up / Rebalance / Payout / Refund /
Auto-refill) · From · To · Amount · Trigger (Manual/Auto) · Status · Ref.

### 6.6 World A — Payout rail liquidity (replaces Agent & Partner Float)
The **sinks** of your float: per-rail (M-Pesa, Bank transfer, Card, Paymo
wallet) → which business it serves, share %, and how much float it consumed
this week. No agents, no partner organizations.

### 6.7 World B — My Liquidity (replaces Internal Settlement Pools)
Cards for **Business Wallet** and **Virtual Wallet** (balance, available,
pending, linked bank) with **Top Up / Send / Withdraw** — the internal transfer
modal already exists and becomes the core action here.

### 6.8 World B — Facilitator Permissions card (NEW — Layer 2)
The checklist of your customer-data/money authority (see §5), with a Request /
Resend action for pending scopes.

### 6.9 Monitoring & Alerts (KEEP, reframe content)
- Active alerts: "Company 2 float below minimum", "Land Buyers weekly payout
  needs KES 2.8M", "Auto-refill failed for Land Buyers".
- Alert config switches stay — thresholds now per business, editable.

### 6.10 Forecast & Analytics (KEEP pattern, reframe to float runway)
- **Per-business runway bars** (48h payout projection vs float) instead of bank
  shortfall bars.
- Scenarios: "Land Buyers weekly batch due Fri", "Company 2 weekend surge",
  "M-Pesa payout rail delay".

### 6.11 Emergency & Governance (REMOVE — see §7)
No bank standby lines, no CFO approval log. The only "emergency" a facilitator
has is **freeze payouts for a business** (a Hold button on the float card,
gated by your Hold Settlement permission).

### 6.12 Attention / Suggestions / Quick Actions (KEEP pattern, reframe)
- Attention: "Company 2 float below minimum — auto-settle at risk",
  "Land Buyers payout batch due Friday, float short by KES 2.8M",
  "Auto-refill rule disabled for Land Buyers".
- Suggestions: "Set auto-rebalance at 20% above minimum", "Move KES 2M from
  Virtual to Business Wallet before Friday batch".
- Quick Actions: Rebalance Float, Top-up Float, My Wallets, Float Rules,
  Facilitator Permissions, Reports.

### 6.13 Recent Activity (KEEP, add World tags)
Every row tagged **Business Float** vs **My Liquidity**, color-coded — the same
world-tag treatment as the Settlement page.

---

## 7. What to delete / keep — safe removal audit

**Delete or fully replace (bank-treasury-only concepts):**
- `bankFloat` (KCB/Equity/Co-op/Absa/Stanbic rows) → business float cards
- `criticalAgents` (847 agents) + `agentTopup*` modals → payout rail liquidity
- `partnerFloat` (Safaricom/Airtel/Telkom as "partners") → payout rails grouped
  by business served
- `facilities` (KES 200M standby line, partner credit line) → nothing (you have
  no credit facilities; a float cap note in the connection banner)
- `governance` log (CFO/Treasurer/Risk Committee) → replaced by "My Access"
  permission limits + audit trail of float movements
- `forecastStat` "KES 87.5M shortfall / recommended KES 120M top-up" →
  per-business float runway
- Hero copy "Liquidity command center is live — KES 1.84B Total Float" → your
  real total float number
- "Emergency liquidity" buttons/modals → Hold/freeze per business (gated)

**Keep and reframe:**
- Hero + stat card layout → float health stats
- Attention / Suggestions / Quick Actions (already `qaGrid`/`qaBtn` styled)
- `rebalanceModal` / `internalTransferModal` / `topupBankModal` → become the
  float top-up / wallet transfer core (editable fields, receipts)
- `thresholdModal` → per-business float rules (editable)
- `floatAlertModal`, `forecastModal`, `scenarioModal`, `liquidityReportModal` →
  reframed content
- `reconciliationModal`, `settlementModal`, `settlementDetailModal` → keep, they
  already cross-link to the Settlement page
- Recent Activity, all table/badge/pill primitives, `qaGrid`/`qaBtn`

**New sections to build:**
1. Connection banner + linked float cap
2. World A/B switcher + business selector
3. Business float cards with meters + My Access pill + Hold button
4. Float Rules modal (editable: min, trigger, schedule, source, top-up amount)
5. Float movement ledger with Direction + Trigger columns
6. Payout rail liquidity (sinks of float)
7. My Wallets + facilitator permissions card
8. Runway forecast bars per business

---

## 8. Mock data for your two real businesses (ready to implement)

### Land Buyers LTD — 30 customers (real-estate installments, weekly payouts)
- Float: KES 3.20M · Min: KES 3.00M · Runway: 6 days (payouts KES ~18M/wk)
- Auto-rule: trigger below minimum → top-up to min + 20% from Business Wallet
- Rails: Bank transfer 60% (KES 1.92M float) · M-Pesa 40% (KES 1.28M)
- My Access: **Manager** · payouts ≤ KES 5M · no withdraw · can edit rules
- Alerts: weekly batch due Friday, projected draw KES 2.8M — **watch**

### Company 2 — 209 customers (retail orders, daily payouts)
- Float: KES 640K · Min: KES 500K · Runway: 2.5 days (payouts ~KES 4.6M/wk)
- Auto-rule: trigger below minimum → top-up to min + 25%, daily at 06:00
- Rails: M-Pesa 78% (KES 499K) · Card 22% (KES 141K)
- My Access: **Owner** · full rights · withdraw allowed
- Alerts: float below min right now — **critical**, auto-refill due 06:00

The contrast is the point: one big slow float, one small fast float; one
Manager role, one Owner role; one healthy, one critical.

---

## 9. Implementation order (milestones)

1. **M0 — Structure:** connection banner, World A/B switcher, business selector,
   retitle/reframe hero + section copy; delete bank/agent/partner/emergency
   blocks.
2. **M1 — World A:** business float cards (meters, KPIs, My Access pill, Hold),
   float movement ledger, payout rail liquidity.
3. **M2 — Rules & actions:** Float Rules modal (editable), top-up & rebalance
   flows re-targeted to business floats with working receipts.
4. **M3 — World B:** My Wallets cards, internal transfers, facilitator
   permissions card.
5. **M4 — Data:** add the two real businesses to mock config; filter every
   metric by selected business; align float numbers with the Settlement page
   (KES 3.2M/640K floats, KES 3M/500K mins).
6. **M5 — Polish:** runway forecast, alert re-scoping, activity world tags,
   reports (float statement per business).

**Files touched:** `pages/Liquidity.tsx` (config + sections), `components/LiquidityModals.tsx`
(new/reframed modals: Float Rules, Facilitator Permissions, Wallet Top-Up,
business-scoped Rebalance), `styles/liquidity.module.css` (float meters, world
switch, My Access pill, wallet cards — same visual language as the Settlement
rebuild: `connBanner`, `worldSwitch`, `bizCard`, `floatMeter`, `qaGrid`/`qaBtn`).
