# FX_REBUILD_PLAN — Multi-Currency, Wallets & FX (Facilitator Edition)

> **Framing:** Settlement shows *what flowed* (KES customer money). Liquidity & Float shows
> *what's sitting in the tanks* (floats + wallets). Reconciliation proves *what matched*.
> **FX & Multi-Currency shows what's held in foreign currency and how it becomes KES** — the
> conversion fuel that feeds your floats. Built for **you, a Paymo member running 2 linked
> businesses** (Land Buyers LTD · 30 customers · real estate · weekly; Company 2 · 209 customers
> · retail · daily), plus your **own wallets** (Business Wallet, Virtual Wallet).

---

## 1. What the page is today (diagnosis)

A bank-treasury FX console: 9 currency wallets (USD/EUR/GBP/ZAR/UGX/TZS/GHS/NGN/AED),
KES 124.8M equivalent, forward contracts, options/collars, hedging ratio, exposure bars,
SWIFT-ish cross-border transfers. It treats you as a **corporate treasury desk** — 20+ currencies,
3-line hedging products, portfolio exposure analytics.

**It works and looks good** — hero card, stat row, Attention/Suggestions/Quick Actions, six
sections, 18 modals + 3 wizards. Nothing is broken; it's the *wrong persona*.

---

## 2. The reframe — one narrative, three worlds

Your actual multi-currency reality:

- **Land Buyers LTD** sells plots. Some buyers are **diaspora** paying **USD/GBP/EUR installments**
  (PLT-… refs). Those land in **USD/GBP/EUR virtual wallets**, must be **converted to KES** at a
  good rate, then moved into the **Land Buyers float** (KES 3.2M / min 3.0M) so weekly Friday
  auto-settlement runs.
- **Company 2** runs daily retail. **Card rail** (Visa/Mastercard) often **settles in USD** via
  Paymo. Same job: convert → KES → Company 2 float (640K / min 500K).
- **Your own money:** Business Wallet + Virtual Wallet (KES, with USD/EUR/GBP sub-wallets you can
  open). You pay **overseas suppliers** (SA/ZAR, China/USD), and occasionally refund a diaspora
  buyer **in their own currency**.

So the page becomes:

- **World A — Customer FX & Collections:** how diaspora/card payments arrive in foreign currency
  and are converted into KES per business (with per-business conversion limits tied to your
  **Manager** role on Land Buyers — payouts ≤ KES 5M — and **Owner** role on Company 2 — full).
- **World B — My Multi-Currency Wallets:** the wallet **structure** (Paymo Master → Business
  Wallet → Virtual Wallets → per-currency sub-wallets → business floats), balances in KES
  equivalent, and your own conversions / cross-border payments / refunds.
- **World C — Rates, Locks & Rules:** live rates (keep), **rate-lock** for scheduled payouts
  (simplified replacement for forwards), auto-conversion rules, rate alerts, wallet preferences,
  FX permissions.

**Language stays the same** (Convert, Transfer, Rates, Alerts, Wallets, Analytics) — only the
content and limits become yours.

---

## 3. Data model

```ts
interface FxData {
  businesses: [
    { id: "land", name: "Land Buyers LTD", customers: 30, ccy: "KES", role: "Manager",
      convLimit: "KES 5,000,000/day", source: "Diaspora USD/GBP/EUR installments (PLT-…)",
      float: { current: 3_200_000, min: 3_000_000 } },
    { id: "co2", name: "Company 2", customers: 209, ccy: "KES", role: "Owner",
      convLimit: "Unlimited (Owner)", source: "Card rail USD settlement (ORD-…)",
      float: { current: 640_000, min: 500_000 } },
  ]
  walletTree: {
    master: { name: "Paymo Master Account", ccy: "KES", balance: 124_800_000 },
    businessWallet: { ccy: "KES", balance: 8_400_000, available: 7_950_000, linked: "Equity Bank • 01-2345678-0" },
    virtualWallet: { ccy: "KES", balance: 1_250_000, available: 1_250_000 },
    subWallets: [
      { ccy: "USD", balance: 48_200, kes: 6_240_900, rate: 129.45, change: "+0.42%", source: "Land Buyers diaspora" },
      { ccy: "EUR", balance: 18_400, kes: 2_572_320, rate: 139.80, change: "-0.18%", source: "Land Buyers diaspora" },
      { ccy: "GBP", balance: 9_100, kes: 1_512_420, rate: 166.20, change: "+0.65%", source: "Land Buyers diaspora" },
      { ccy: "ZAR", balance: 214_000, kes: 1_525_080, rate: 7.12,  change: "-1.12%", source: "Company 2 card rail" },
    ],
  }
  liveRates: USD/KES, EUR/KES, GBP/KES, ZAR/KES (buy/sell/spread/24h) — unchanged shape
  conversions: [ { ref: "FX-44121", business: "land", from: "USD 28,400", to: "KES 3,676,380",
    rate: 129.45, fee: "KES 2,900", status: "Completed", action: "Receipt" }, … ]
  pendingDiaspora: [ { ref: "PLT-091", business: "land", payer: "Buyer • UK", ccy: "GBP 14,200",
    kes: 2_360_040, rate: 166.20, status: "Awaiting convert → float" }, … ]
  rateLocks: [ { id: "LK-8821", pair: "USD/KES", rate: 129.20, amount: "USD 12,000",
    expiry: "30 Aug", status: "Active" }, … ]
  autoRules: [ { title: "USD → KES auto-convert", sub: "When USD wallet > $10,000 → Business Wallet",
    badge: "Active" }, { title: "Diaspora GBP → Land Buyers float", sub: "Every Friday 13:00 before auto-settle", badge: "Active" }, … ]
  alerts / prefs / activity — same shapes as today, reframed
  fxAccess: [ { scope: "Convert customer FX to KES", granted: true },
    { scope: "Lock rates for scheduled payouts", granted: true },
    { scope: "Open new currency wallets", granted: true },
    { scope: "Cross-border payouts > KES 1M", granted: false, pending: true },
    { scope: "Refund diaspora buyers in their currency", granted: false, pending: true } ]
}
```

---

## 4. Section-by-section rebuild (Settlement-style layout, same CSS primitives)

### Page bar & hero (keep, retarget)
- **Title:** `Multi-Currency, Wallets & FX` · sub: `Convert customer payments and your own funds across currencies to keep settlements flowing.`
- **Buttons:** `Convert` · `Rate Lock` · `New Currency Wallet` (primary).
- **Hero card:** `KES 11.9M in foreign currency` across 4 sub-wallets · `≈ $48.2K USD + €18.4K EUR + £9.1K GBP + R214K ZAR` — with a **Wallet Structure strip** (Master → Business Wallet → Virtual → Sub-wallets → Floats) drawn as connected pills.
- **World switch:** `Customer FX` / `My Wallets & FX` + **business selector** `All | Land Buyers LTD 30 | Company 2 209` that refilters conversions, pending diaspora, rate locks, and rules — **identical to Settlement/Liquidity/Reconciliation**.

### Stat row (retarget)
1. `FOREIGN CURRENCY HELD` — KES 11.9M · pill `4 sub-wallets · USD/EUR/GBP/ZAR`
2. `BEST RATE TODAY` — 1 USD = 129.45 KES · pill `Live • updated 14s ago` + USD/EUR & USD/GBP move lines
3. `Diaspora → Float converted (MTD)` — KES 8.42M · pill `Land Buyers 86% · Company 2 14%` · progress `USD 52% · GBP 30% · EUR 18%`
4. `FX FEES PAID (MTD)` — KES 86,400 · pill `0.9% avg cost · smart routing on`
5. `RATE LOCKS ACTIVE` — 2 · pill `lock saves ≈ KES 41,200/mo`
6. `AWAITING CONVERSION` — KES 2.36M · pill `1 diaspora batch · PLT-091`

### Attention / Suggestions / Quick Actions (retarget)
- **Attention:** (1) `PLT-091 diaspora batch awaiting conversion` · `£14,200 sits in GBP wallet — convert before Friday auto-settle` → `Convert`; (2) `USD wallet above auto-convert threshold` · `$48.2K > $10K rule — 3 auto-converts paused` → `Review`; (3) `ZAR rate moved 4.2%` · `1 ZAR = 7.12 KES` → `View`.
- **Suggestions:** (1) `Lock USD/KES at 129.20 for August payouts` · `Saves ≈ KES 21,000 vs spot` → `Lock`; (2) `Route Company 2 card settlements to USD wallet` · `Avoids 1.2% Paymo currency fee` → `Enable`; (3) `Open EUR sub-wallet for Land Buyers diaspora` · `£-only buyers convert 2× cheaper` → `Create`.
- **Quick Actions (slim `qaGrid`/`qaBtn` pills):** `Instant Convert` · `Rate Lock` · `Bulk FX` · `Rate Alerts` · `Cross-Border` · `FX Report` · `Currency Swap` · `Wallet Structure`.

### World A — Customer FX & Collections
- **Card: Diaspora & Card Settlements per business** — rows: `PLT-091` Land Buyers · `GBP 14,200` → `KES 2,360,040` @ 166.20 · `Awaiting convert` badge · `Convert to Float` (opens wizard preset to that business) ; `ORD-8901` Company 2 · `USD 1,840` → `KES 238,188` @ 129.45 · `Converted 08:12` · `Receipt`. Table with **Business**, **Payer/Order**, **From**, **KES value**, **Rate**, **Status**, **Action**.
- **Card: Conversion history** — same columns as today's Recent FX, but with a **Business** column and **→ float / → Business Wallet** destination chip (RB- refs when it fuels a float).
- **Card: Per-business conversion limits** — two rows: Land Buyers `Manager · KES 5M/day · source USD/GBP/EUR` · Company 2 `Owner · Unlimited · source Card rail USD`; buttons `Edit limits` (opens permissions modal, only if you hold the scope).

### World B — My Multi-Currency Wallets & Structure
- **Card: Wallet structure** — connected hierarchy: **Paymo Master** (KES 124.8M) → **Business Wallet** (KES 8.4M, available 7.95M, linked Equity Bank) → **Virtual Wallet** (KES 1.25M) → **4 sub-wallets** (USD/EUR/GBP/ZAR with balance + KES equivalent) → **2 business floats** (3.2M / 640K). Each node: **Manage** button → wallet detail modal.
- **Card: Sub-wallet balances table** — Currency · Balance · KES equivalent · 24h change · Source (diaspora/card rail) · Status · Actions (`Convert`, `Transfer`, `Top Up`, `Withdraw`).
- **Card: Cross-border payments** — `ZAR 214,000 → SA supplier` (pending) · `USD 12,000 → China vendor` (completed) — opens `fxTransferModal` retargeted to **Supplier payment / Diaspora refund / Salary** purposes.

### World C — Rates, Locks, Rules & Permissions
- **Live Rates & Market Center** — **keep as-is** (table + Rate Alerts panel), relabel sub `interbank and retail rates for your settlement currencies`.
- **Rate Locks (replaces Forwards & Hedging)** — rows: `LK-8821 USD/KES 129.20 · $12,000 · expires 30 Aug · Active`; `LK-8819 GBP/KES 165.90 · £8,000 · expires 22 Aug · Active`; `LK-8799 EUR/KES 139.10 · Settled`. Wide button `Lock a Rate` (3-step wizard). **Safely removed:** options/collars, hedging ratio, net-position exposure bars → replaced by a single **"Worth locking" AI strip** (3 pairs with savings estimate).
- **FX Analytics & Reporting** — keep chart (Monthly FX Cost) + key metrics retargeted: `Avg Spread 0.48%` · `Best Execution 99.2%` · `Rate-Lock Savings KES 41,200`.
- **Automation & Preferences** — keep 3-column card: Auto-Conversion Rules (USD→KES, diaspora GBP→float Friday), Rate Alert Settings, Wallet Preferences (default display currency KES, show equivalent USD, auto-hide small balances).
- **FX Permissions & Access** — new **scope panel** (mirror of Recon "My Recon Access" / Liquidity "My Access"): 5 scopes with Granted/Pending dots + `Request Access` for the 2 pending (cross-border > KES 1M, diaspora refunds in-currency).

### Recent FX Activity (keep, retarget)
Same table, rows now: `FX-44121 USD→KES 3,676,380 → Land Buyers float (RB-9923)` · `FX-44118 GBP→KES 2,360,040 diaspora PLT-091` · `FX-44112 KES→ZAR supplier 1,525,080`. Add a **World tag** (`Customer FX` / `My Wallets`) like the Settlement activity feed.

---

## 5. Modal inventory (18 kept/retargeted + 7 new = 25, all functional)

| # | Modal | Status | New job |
|---|-------|--------|---------|
| 1 | convertModal | keep (4-step wizard) | Currency conversion; step 1 gains **Business** selector (preset from table); final step shows **Destination** chip: `→ Land Buyers float` (RB-) or `→ Business Wallet` |
| 2 | fxTransferModal | keep (3-step wizard) | Cross-border payout: Supplier / Diaspora refund / Salary |
| 3 | hedgeModal | **rewrite** | → **Rate Lock wizard** (3 steps): pair, amount, lock rate + expiry + savings preview |
| 4 | swapModal | keep | Sub-wallet ↔ sub-wallet swap (USD↔GBP) |
| 5 | bulkFxModal | keep | Bulk convert multiple diaspora batches → float |
| 6 | rateAlertsModal | keep | USD/KES, EUR/KES, GBP/KES, ZAR/KES alerts + channel toggles |
| 7 | newWalletModal | keep | Open new **currency sub-wallet** (USD/EUR/GBP/ZAR…) from Business Wallet |
| 8 | fxStatementModal | keep | Statement types: Full FX activity / Conversions / Rate locks / Fees |
| 9 | fxAnalyticsModal | keep | Per-business FX cost + savings breakdown |
| 10 | fxAutomationModal | keep | Auto-convert rules + diaspora→float scheduling |
| 11 | fxPreferencesModal | keep | Display currency, equivalent, hide small balances |
| 12 | fxHealthModal | keep | Rail health: M-Pesa / Bank / **Card (USD settle)** / FX provider |
| 13 | fxMarketModal | keep | Market depth for settlement pairs |
| 14 | fxRiskModal | **rewrite** | → **FX exposure (simple)**: USD/EUR/GBP/ZAAR balances vs float needs, "worth locking" strip |
| 15 | fxReceiptModal | keep | Receipt viewer (all conversions) |
| 16 | attentionModal | keep | Full attention list (retargeted rows) |
| 17 | fxNotifModal | keep | Notifications (rate moves, conversion completes) |
| 18 | profileModal | keep | Profile (Jckonia K.) |
| 19 | **new: walletDetailModal** | **NEW** | Per-wallet detail: balance, source, history, Convert/Transfer/Top Up/Withdraw |
| 20 | **new: walletTopUpModal** | **NEW** | Top up sub-wallet from Business Wallet / Virtual Wallet (KES→USD) |
| 21 | **new: walletWithdrawModal** | **NEW** | Withdraw sub-wallet to linked bank or Business Wallet |
| 22 | **new: rateLockModal** | **NEW** | Manage rate locks (list, expire, extend) |
| 23 | **new: fxLimitsModal** | **NEW** | Per-business conversion/payout limits editor (role-gated) |
| 24 | **new: fxAccessModal** | **NEW** | FX scope checklist — `Request Access` for pending scopes |
| 25 | **new: diasporaConvertModal** | **NEW** | One-click diaspora batch → float convert (preset business + RB- ref) |

---

## 6. Safe removals / keeps / improves (whole transaction-dashboard audit)

**FX page:**
- **Safely remove:** options/collars hedging products, hedging-ratio metric, net-position exposure bars (USD long +$82.4K etc.), 9-currency breadth (keep the 4 you actually hold + KES), "Treasury Manager" persona strings, `James K.` → `Jckonia K.`, "20+ currencies / 14 wallets" copy.
- **Keep:** all 18 modals' shells & flows, hero/stat/attention/suggestions/quick-action patterns, live rates table, charts, automation, preferences, full CSS primitive set.
- **Improve:** add business selector, world tags, wallet-structure hierarchy, rate-lock concept, per-business conversion limits, FX permission scopes, destination chips (RB- refs).

**Sibling pages (quick audit):**
- **Settlement / Liquidity / Reconciliation** — already rebuilt to your context. Keep. (Suggest: wire Settlement business cards → Liquidity float view for cross-nav, same as RB- chips.)
- **Mobile Money / Payment Rails / Transfer Management / System Health / Transfer Overview / Analytics** — same template (Attention/Suggestions/Quick Actions + sections), still **bank-operator persona** ("agent pools", "POS networks", bank-health tiles). **Adjust, don't remove:** retarget stats to your rails (M-Pesa & Card are your real rails), keep the tables. **Safe to remove:** pure-bank concepts (ATM/POS fleet health, 847-agent networks) if present.
- **Customers / Disputes / Fees / Compliance / KRA / Initiate Transfer** — largely relevant as-is for a facilitator (customers = your 239, disputes = your SET- refs, fees = your 1.25%/2.0%, KRA = your PINs). Small copy retargets only; **nothing to remove** except stale "6 banks" hero copy.
- **Global:** every page's `qaGrid`/`qaBtn` Quick Actions + `pills`/`pill` selector are already consistent; the business-selector + world-switch pattern should become the shared header component across all rebuilt pages.

---

## 7. Cross-page links
- Conversion **→ float** rows carry **RB- refs** (clickable → Liquidity page, same pattern as Reconciliation chips).
- **Diaspora batch** rows carry **PLT-/ORD-** refs → clickable to Reconciliation workbench for that business.
- Wallet structure **Business Wallet** node links to Liquidity "My Liquidity" world; **float** nodes link to Liquidity World A.

---

## 8. Implementation order
1. **CSS** — add world-switch, business selector, wallet-structure strip, destination chips, scope panel classes to `fx.module.css` (reuse existing primitives).
2. **`FxManagement.tsx`** — new data model + hero/world switch/business selector + World A/B/C sections (retarget, don't delete patterns).
3. **`FxModals.tsx`** — retarget 18, rewrite hedge→Rate Lock + fxRisk→simple exposure, add 7 new modals.
4. **Validate** — biome lint both files; grep for leftover bank-treasury refs (options/collar, hedging ratio, "Treasury Manager", James K., 20+ currencies).
5. **Reviewer pass + browser check** — verify no dead buttons, every modal reachable, responsive.
