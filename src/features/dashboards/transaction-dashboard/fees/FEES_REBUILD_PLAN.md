# FEES_REBUILD_PLAN — Fees, Charges & Profit Channeling (Facilitator Edition)

> **Framing:** Settlement shows *what flowed*, Liquidity shows *what's in the tanks*, Reconciliation
> proves *what matched*, FX shows *how foreign money becomes KES*. **Fees & Charges shows what
> money is made (and spent) per transaction** — the PayMo fees you're charged, the charges you
> bill your own customers, and the **net profit that auto-delivers to your wallets**.
> Built for **you, a Paymo member with 2 linked businesses** (Land Buyers LTD · 30 customers ·
> weekly; Company 2 · 209 customers · daily) + **your own wallets** (Business Wallet, Virtual
> Wallet, external M-Pesa).

---

## 1. What the page is today (diagnosis)

A bank-operator commission console: 47 active fee rules, 12 **agent commission tiers**, agent
leaderboards, partner payouts, SME promotional fees, hardship waivers, regulatory reporting —
"this month across 142,890 transactions". It treats you as a **payment processor running an
agent network**, not as a business owner.

**It works and looks good** — hero, 4 stat cards, Attention/Suggestions/Quick Actions, 7
sections, 25 modals. Nothing broken; the *persona and the money direction are wrong*.

---

## 2. The reframe — two money directions, one workspace

The page becomes a **two-direction fee ledger**:

- **Direction 1 — What PayMo charges you (your costs):** per-service fee schedule —
  M-Pesa collection, bank transfer, **international transfer**, card settlement (USD), payout
  rails, FX conversion, refunds. These are deducted from your customer settlements. Shows what
  you paid (MTD), by business and by service.
- **Direction 2 — What you charge your customers (your revenue):** per business you bill your
  customers with your own fee model — **flat amount or percentage**, tiered, capped, with
  discounts and bonuses. **Your profit per transaction = your charge − PayMo fee.**
- **Profit channeling (the signature feature):** profits accumulate in a **Profit Pot**, then
  auto-channel to your **main wallet** (Business Wallet / Virtual Wallet) or an **external
  wallet (M-Pesa / bank)** on a rule — threshold, schedule, or **instant per transaction (even
  KES 2)** — so your money is delivered as soon as it's earned.

**Fee models the user can pick per business (the "pick what works" idea):**
| Model | How it works | Best for |
|---|---|---|
| Flat amount | e.g. KES 250 per plot installment | Land Buyers LTD (high value, few) |
| Percentage | e.g. 2.0% of each order | Company 2 (low value, many) |
| Tiered | 1.0% < KES 50K · 1.5% ≥ KES 50K | Growing businesses |
| Cap + floor | min KES 20 / max KES 5,000 | High-volume retail |
| Discount / bonus | promo period, bulk rebate | Customer acquisition |
| Zero-fee | absorb cost (no charge) | Onboarding play |

**Language stays the same** (Fee Rules, Tiers, Waivers, Calculator, Settlement, Compliance) —
only the content becomes: per-business models, customer charges, PayMo costs, profit pot.

---

## 3. Data model

```ts
interface FeesData {
  businesses: [
    { id: "land", name: "Land Buyers LTD", model: "Flat amount", charge: "KES 1,250 per installment",
      paymoFee: "1.25%", customers: 30, schedule: "Weekly • Fri" },
    { id: "co2", name: "Company 2", model: "Percentage", charge: "2.0% per order",
      paymoFee: "2.0%", customers: 209, schedule: "Daily" },
  ]
  paymoCosts: [ // Direction 1 — what you're charged
    { service: "M-Pesa collection", rate: "0.75%", min: "KES 5", paidMTD: "KES 412,300" },
    { service: "Bank transfer payout", rate: "KES 25 flat", min: "—", paidMTD: "KES 61,200" },
    { service: "International transfer", rate: "1.5% + KES 150", min: "—", paidMTD: "KES 98,400" },
    { service: "Card settlement (USD)", rate: "2.2% + FX 1.2%", min: "—", paidMTD: "KES 176,800" },
    { service: "FX conversion", rate: "0.9%", min: "—", paidMTD: "KES 86,400" },
    { service: "Refund (reverse)", rate: "KES 10", min: "—", paidMTD: "KES 3,400" },
  ]
  customerCharges: [ // Direction 2 — what you bill
    { ref: "CHG-4401", business: "land", customer: "Plot #PLT-091", service: "Installment",
      charged: "KES 1,250", paymoFee: "KES 56,250", profit: "KES 18,750", status: "Collected" },
    { ref: "CHG-4402", business: "co2", customer: "Order #ORD-8901", service: "Order",
      charged: "2.0% = KES 248", paymoFee: "KES 248", profit: "KES 0", status: "Break-even" },
    { ref: "CHG-4403", business: "co2", customer: "Order #ORD-8899", service: "Order",
      charged: "2.0% = KES 964", paymoFee: "KES 723", profit: "KES 241", status: "Collected" },
  ]
  profitPot: {
    balance: "KES 1,342,000", pending: "KES 84,500", deliveredMTD: "KES 968,000",
    channel: { type: "Auto → Business Wallet", threshold: "Instant (any amount)", paused: false },
  }
  channelRules: [
    { title: "Instant micro-profit delivery", sub: "Any profit ≥ KES 2 → Business Wallet instantly", badge: "Active" },
    { title: "Weekly bulk → Virtual Wallet", sub: "Friday 18:00 sweep of balances < KES 5K", badge: "Active" },
    { title: "External M-Pesa top-up", sub: "Auto-send KES 10K to 0712…890 when pot ≥ KES 25K", badge: "Paused" },
  ]
  models: [ // the pick-a-model catalog
    { name: "Flat amount", example: "KES 1,250 per installment", biz: "Land Buyers LTD", state: "In use" },
    { name: "Percentage", example: "2.0% of order value", biz: "Company 2", state: "In use" },
    { name: "Tiered", example: "1.0% < 50K · 1.5% ≥ 50K", biz: "—", state: "Available" },
    { name: "Cap + floor", example: "min KES 20 · max KES 5,000", biz: "—", state: "Available" },
    { name: "Discount / bonus", example: "0% fees in promo month", biz: "—", state: "Available" },
    { name: "Zero-fee", example: "absorb cost to win customers", biz: "—", state: "Available" },
  ]
  feeRules / waivers / reports / compliance / audit — existing arrays, retargeted (below)
  profitAccess: [ { scope: "Channel profits to Business Wallet", granted: true },
    { scope: "Auto-deliver micro-profits (≥ KES 2) instantly", granted: true },
    { scope: "Route profits to external M-Pesa wallet", granted: false, pending: true },
    { scope: "Withdraw profit pot to linked bank", granted: false, pending: true } ]
}
```

---

## 4. Section-by-section rebuild (same layout, retargeted content)

### Page bar & hero (keep, retarget)
- **Title:** `Fees, Charges & Profit Channeling` · sub: `What PayMo charges you, what you charge your customers, and where your profit lands.`
- **Buttons:** `Calculator` · `Profit Pot` · `New Fee Model` (primary).
- **Hero:** `KES 1.34M profit in your pot` — `this month: KES 18.4M collected · your charges KES 2.31M · PayMo fees KES 968K · net delivered KES 1.34M`.
- **World switch:** `Customer Charges` / `My Costs & Profit` + **business selector** (`All | Land Buyers LTD 30 | Company 2 209`) refiltering the charge tables.

### Stat row (retarget)
1. `PROFIT IN POT` — KES 1.34M · pill `auto-delivering · next KES 84,500`
2. `YOUR CHARGES (MTD)` — KES 2.31M · pill `avg 1.75% on customer money`
3. `PAYMO FEES (MTD)` — KES 968K · pill `1.42% blended cost`
4. `NET PROFIT (MTD)` — KES 1.34M · pill `delivered to Business Wallet`
5. `DELIVERY RULES` — 3 · pill `2 active · 1 paused`
6. `AVG FEE RATE` — 1.75% · pill `Land Buyers flat · Company 2 %`

### Attention / Suggestions / Quick Actions (retarget)
- **Attention:** (1) `Profit pot above auto-deliver threshold` · `KES 25K rule — M-Pesa channel paused` → `Review`; (2) `Company 2 break-even orders` · `12 orders covered by 2.0% charge, consider tiered` → `Adjust`; (3) `International transfer fee rose 8%` · `1.5% + KES 150 — 24 this month` → `View`.
- **Suggestions:** (1) `Move Company 2 to tiered model` · `1.0/1.5% recovers ≈ KES 46K/mo` → `Apply`; (2) `Turn on instant micro-profit delivery` · `even KES 2 lands in your wallet` → `Enable`; (3) `Offer 0% promo to 5 new Land Buyers buyers` · `typical 12% conversion lift` → `Create`.
- **Quick Actions (slim `qaGrid`/`qaBtn`):** `Fee Calculator` · `New Fee Model` · `Profit Pot` · `Channel Rules` · `Charge a Customer` · `Fee Report` · `Waivers & Promos` · `Compliance`.

### 1. Fee Models & Business Pricing (was Fee Structure Dashboard)
- **Model catalog cards** — 6 models (Flat/Percentage/Tiered/Cap+floor/Discount/Zero-fee) with example + `In use` badge + `Apply to Business` button.
- **Per-business pricing table** — Business · Model · Charge · PayMo fee · Your profit · Status · Action (`Edit` → editFeeRuleModal / `Compare` → feeCompareModal).

### 2. Customer Charges Ledger (was Commission Rules & Tiers)
- **Table:** Ref · Business · Customer · Service · **You charged** · **PayMo fee** · **Your profit** · Status · Action (`Receipt`, `Waive`).
- **Charge preview strip:** `Charge a customer KES 50,000 → you bill 2.0% = KES 1,000 → PayMo takes KES 723 → you keep KES 277 → delivered instantly.`
- Per-business charge limits (Manager · KES 5M/day on Land Buyers; Owner · unlimited on Company 2).

### 3. Fee Calculator & Preview (keep)
Same calculator, but output shows **three lines**: PayMo fee · Your charge · **Your profit**, with a model picker (flat/%) that flips the math.

### 4. Profit Pot & Channeling (NEW — replaces Settlement/Payouts section)
- **Profit Pot card:** balance KES 1.34M · pending 84,500 · delivered MTD 968K + a **channel flow strip**: `Customer pays → your charge → PayMo fee deducted → profit → [Auto → Business Wallet / M-Pesa / Virtual Wallet]`.
- **Channel Rules list:** micro-profit instant delivery (≥ KES 2), weekly bulk sweep, external M-Pesa top-up — each `Edit` + `Pause`.
- **Delivery history table:** Time · Source (CHG-… ref) · Profit · Channel · Status (`Delivered to Business Wallet`).

### 5. Fee Reports & Analytics (keep)
Cost bars (your fees paid per month) + key metrics: Avg Spread→`Blended cost 1.42%`, Best Execution→`Profit share 58%`, Hedging→`Profit delivered 72%`.

### 6. Waivers, Discounts & Promos (was Exemptions, Waivers & Promotions)
Keep all waiver/exemption/promo mechanics; rows now: `0% fee promo — 5 new Land Buyers buyers`, `Hardship waiver — Company 2 customer #ORD-8899`, `Bulk discount — top diaspora buyer`.

### 7. Compliance, Audit & Configuration (keep)
Retarget: `regulatoryReportModal` → fee disclosure reports; `policyConfigModal` → default display; audit log rows become your charge edits.

### Recent Fee Activity (keep, retarget)
Rows: `CHG-4401 KES 1,250 → profit KES 18,750 → Business Wallet (instant)` · `CHG-4403 profit KES 241 → delivered 14:02` · `PayMo fee KES 723 debited` — with **Profit** vs **Cost** world tags.

---

## 5. Modal inventory (25 kept/retargeted + 6 new = 31, all functional)

| # | Modal | Status | New job |
|---|-------|--------|---------|
| 1 | feeCalculatorModal | keep | Calculator with **Profit preview** (PayMo fee / your charge / your profit) |
| 2 | addFeeRuleModal | **rewrite** | → **New Fee Model wizard** (model picker: flat/%/tiered/cap/discount + per-business apply) |
| 3 | editFeeRuleModal | keep | Edit per-business model + charge |
| 4 | addCommissionTierModal | **rewrite** | → Add tier to a tiered model (band + rate) |
| 5 | editCommissionModal | keep | Edit tier |
| 6 | feeCompareModal | keep | Compare two models side-by-side (flat vs %) |
| 7 | waiverModal | keep | Waive a customer charge |
| 8 | editWaiverModal | keep | Edit waiver |
| 9 | hardshipWaiverModal | keep | Hardship waiver |
| 10 | exemptionModal | keep | Exemption |
| 11 | settlementModal | **rewrite** | → **Profit Pot** (balance, pending, channel flow) |
| 12 | partnerPayoutModal | **rewrite** | → **Channel profits** (to Business/Virtual wallet or external M-Pesa/bank) |
| 13 | feeReportModal | keep | Fee & profit report (types: Charges / PayMo costs / Profit delivery) |
| 14 | regulatoryReportModal | keep | Fee disclosure report |
| 15 | auditDetailModal | keep | Audit detail (your charge edits) |
| 16 | complianceCheckModal | keep | Compliance check |
| 17 | finalConfirmModal | keep | Confirm any fee action |
| 18 | bulkUploadModal | keep | Bulk customer charges |
| 19 | feeNotifModal | keep | Notifications (retarget: pot delivered, fee rose) |
| 20 | notifSettingsModal | keep | Alert channels |
| 21 | attentionFullModal | keep | Full attention list (retargeted) |
| 22 | policyConfigModal | keep | Display defaults |
| 23 | profileModal | keep | Profile (Jckonia K.) |
| 24 | tierPerformanceModal | keep | Model performance per business |
| 25 | agentLeaderboardModal | **rewrite** | → **Profit leaderboard** (which services make you most) |
| 26 | **new: chargeCustomerModal** | NEW | Charge a specific customer (ref, amount, model, preview profit) |
| 27 | **new: channelRuleModal** | NEW | Create/edit channel rule (target wallet, threshold, schedule, instant toggle) |
| 28 | **new: potDetailModal** | NEW | Profit pot detail: balance, pending, delivery history |
| 29 | **new: profitAccessModal** | NEW | Profit permission scopes (instant delivery, external M-Pesa, bank withdrawal) |
| 30 | **new: promoModal** | NEW | Create promo/discount campaign (0% month, bulk rebate) |
| 31 | **new: feeModelDetailModal** | NEW | Deep-dive on one model with example math |

---

## 6. Safe removals / keeps / improves (whole transaction-dashboard audit)

**Fees page:**
- **Safely remove:** agent leaderboards (you have no agents), partner payouts, SME-promo persona, "142,890 transactions" copy, "commission tiers for agents" language, "Treasury Manager"/James K. persona strings.
- **Keep:** all 25 modal shells & flows, hero/stat/attention patterns, calculator, waivers/promos mechanics, compliance/audit structure, full CSS primitive set.
- **Improve:** two-direction fee model (PayMo costs vs your charges), per-business model picker, **Profit Pot + auto-channeling** (the signature), permission scopes for profit delivery.

**Sibling pages (quick audit — consistent with the FX plan):**
- **Settlement / Liquidity / Reconciliation / FX** — rebuilt to your context. Keep. Next: wire Fees' Profit Pot refs (CHG-…) into Liquidity's wallet activity.
- **Mobile Money / Payment Rails / Transfer Mgmt / System Health / Transfer Overview / Analytics** — same template, still bank-operator persona. Retarget stats to your M-Pesa + Card rails; remove ATM/POS-fleet concepts.
- **Customers / Disputes / Compliance / KRA / Initiate Transfer / Account / Settings / Shared** — largely relevant as-is for a facilitator (customers = your 239, disputes = SET- refs). Small copy retargets only.
- **Global:** business selector + world switch should become the shared header across all pages; every `qaGrid`/`qaBtn` and `pills` pattern already consistent.

---

## 7. Cross-page links
- **Profit Pot** rows carry **CHG-** refs → clickable to Settlement collections for that business.
- **Business Wallet / Virtual Wallet** in channel rules → Liquidity "My Liquidity" world.
- Customer charge refs (**PLT-/ORD-**) → Reconciliation workbench.
- FX conversions that generate fees → FX page conversion history.

---

## 8. Implementation order
1. **CSS** — profit pot card, channel flow strip, model catalog cards, delivery tags, scope dots (reuse existing primitives + new classes).
2. **`Fees.tsx`** — new data model + hero/world switch/business selector + two-direction sections + Profit Pot section.
3. **`FeesModals.tsx`** — retarget 25 (rewrite addFeeRule→model wizard, settlement→Pot, partnerPayout→Channel, agentLeaderboard→profit), add 6 new modals.
4. **Validate** — biome lint both files; grep for agent/partner/SME leftovers.
5. **Reviewer pass + browser check** — no dead buttons, every modal reachable, responsive.
