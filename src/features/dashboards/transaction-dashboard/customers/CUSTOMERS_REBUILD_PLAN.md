# CUSTOMERS_REBUILD_PLAN — Customers, Billing & Reminders (Facilitator Edition)

> **Framing:** Settlement shows *what flowed*, Liquidity *what's in the tanks*, Reconciliation
> *what matched*, FX *how foreign money becomes KES*, Fees *what you earn per transaction*.
> **Customers shows WHO pays you** — every customer across your linked businesses, their
> KYC, payment methods, recurring bills, reminders, and refunds. Built for **you, a Paymo member
> with 2 linked businesses**: Land Buyers LTD (30 real-estate buyers on weekly installments) and
> Company 2 (209 retail customers on daily orders).

---

## 1. What the page is today (diagnosis)

A bank BaaS customer console: 4,872 customers, 3,241 active **savings/current accounts**, KYC
completion 98.4%, AML reviews, support tickets, linked external services, an account-opening
mentality ("open account", "close account"). It treats you as a **bank managing account
holders**, not as a business owner managing *the people who pay you*.

**It works** — 7 sections, 21 modals, a 4-step onboarding wizard (Type → Basic → Address/Docs →
Done). The wizard is the star but it's **too shallow**: one-size-fits-all, no billing model, no
payment method, no reminders.

---

## 2. The reframe — one directory, four working concepts

Your customers are **239 people** (30 + 209). Some pay once, many pay **recurring** (Land Buyers
installments are rent-like: weekly, monthly). The page becomes:

- **One Customer Directory across businesses** — every customer tagged with their business(es),
  billing model, payment health, and reminders state.
- **Adaptive Onboarding Wizard (7+ steps)** — the depth adapts to business type: a **PSP/merchant
  customer needs many submissions** (director docs, compliance questionnaire, settlement bank);
  a **retail shop customer submits almost nothing**. Steps:
  1. **Customer Type** (Individual / Business / PSP-merchant / Tenant-style recurring)
  2. **Identity** (name, ID no., DOB/reg, nationality)
  3. **KYC & Documents** *(deep for PSP: director list, ownership %, compliance questionnaire,
     bank reference; shallow for retail: just ID front/back)*
  4. **Location** (county, town, GPS pin, address)
  5. **Payment Method(s)** (M-Pesa number, card, bank account, virtual wallet — verified badges)
  6. **Billing Model** (one-off · **auto-bill** · **recurring plan** with duration: weekly /
     monthly / quarterly + end date)
  7. **Permissions & Preferences** (what the customer can self-serve, comm channels, language)
  8. **Review & Onboard** (summary + receipt)
- **Billing & Scheduled Payments** — auto-billed plans, next-due dates, payment history, payment
  method on file, failed-attempt counter.
- **Reminders & Communication** — subscriptions renewals, **failed payments (insufficient
  funds)**, and **manual SMS / email / WhatsApp** sends to a customer's number/address.
- **KYC Records + Location** — document status, expiry, verification level, and the customer's
  location data.
- **Refunds** — issue partial/full refunds against payments (linking the Fees profit math).
- **Permissions** — what *you* may do for this customer: generate reports, transaction receipts,
  statements, waive fees, edit billing — mirroring the scope-panel pattern from the other pages.

**Language stays** (Onboard, KYC, Permissions, Statements, Communication, Support) — content and
depth become yours.

---

## 3. Data model

```ts
interface Customer {
  id: "CUS-0001"; name: "John Ochieng"; type: "individual";             // individual | business | psp
  business: "Land Buyers LTD"; bizId: "land";                          // belongs to a linked business
  phone: "+254 712 345 678"; email: "john.o@gmail.com"; whatsapp: "+254 712 345 678";
  location: { county: "Kiambu"; town: "Ruiru"; address: "Plot 14, Kamiti Rd"; };
  kyc: { status: "Verified"; level: 2; docs: ["ID Front", "ID Back"]; expiry: "2027-03-01"; };
  payment: { primary: "M-Pesa •••678"; card: "Visa ••4412"; bank: "Equity ••4521"; verified: true; };
  billing: { model: "Recurring"; plan: "Weekly installment"; amount: "KES 1,250"; nextDue: "Fri 01 Aug";
             duration: "12 weeks"; ends: "Oct 2025"; failed: 0; status: "Active" };
  reminders: { lastSent: "27 Jun 09:00"; channel: "SMS"; count: 3 };
  permissions: [ "view receipts", "self-service portal", "scheduled payments" ];
}
```

---

## 4. Section-by-section rebuild (same layout, retargeted)

### Page bar & hero (keep, retarget)
- **Title:** `Customers, Billing & Reminders` · sub: `Every customer across your businesses — KYC, payment methods, recurring bills and reminders.`
- **Buttons:** `Onboard Customer` (primary) · `Bulk Import` · `Reminders` · `JK`.
- **Hero:** `239 customers across 2 businesses` — `Land Buyers LTD 30 · Company 2 209 · KYC 100% · recurring plans 44`.
- **Business selector pills** (`All | Land Buyers LTD 30 | Company 2 209`) refilter the directory, plans, refunds, and reminders.

### Stat row (retarget)
1. `TOTAL CUSTOMERS` — 239 · pill `2 businesses · 30 + 209`
2. `RECURRING PLANS` — 44 · pill `weekly 30 · monthly 14`
3. `KYC VERIFIED` — 100% · pill `4 pending review`
4. `NEXT 7-DAY BILLINGS` — KES 2.84M · pill `38 due this week`
5. `FAILED PAYMENTS (30D)` — 12 · pill `KES 96K · 4 reminders sent`
6. `REFUNDS THIS MONTH` — KES 41K · pill `8 issued`

### Attention / Suggestions / Quick Actions (retarget)
- **Attention:** (1) `PLT-088 payment failed — insufficient funds` · `Buyer • UK — 2nd attempt failed, reminder due` → `Send Reminder`; (2) `KYC expiry in 30 days — 4 buyers` · `ID documents expiring Aug` → `Review`; (3) `Order #ORD-8899 refund pending` · `Company 2 — KES 48,200, awaiting approval` → `Refund`.
- **Suggestions:** (1) `Convert 12 one-off Land Buyers to weekly plans` · `smoother cash flow, ≈ KES 1.4M/mo` → `Schedule`; (2) `Auto-remind failed payments at 9 AM` · `recover ≈ KES 64K/mo` → `Enable`; (3) `Offer WhatsApp statements to 209 Company 2 customers` · `cuts support tickets` → `Enable`.
- **Quick Actions:** `Onboard Customer` · `New Billing Plan` · `Send Reminder` · `Issue Refund` · `Bulk Import` · `KYC Queue` · `Statements` · `Support`.

### 1. Customer Directory (was 1.14.1)
Cards/table per customer: Name · Business · **Billing model** · Next due · **Payment method** ·
KYC badge · Payment health (failed count) · Actions (`View`, `Edit`, `Remind`, `Refund`).
Search + filters: by business, billing model, KYC status, payment health.

### 2. Billing & Scheduled Payments (NEW — replaces Account Management)
- **Recurring Plans board:** plan cards (Customer · Business · Amount · Frequency · Duration ·
  Next due · Status) with `Pause`, `Edit`, `End` actions.
- **Payment schedule strip:** next 7 days expected collections vs actual.
- **Payment methods table:** per customer — M-Pesa / Card / Bank / Wallet, verified badge, `Add`,
  `Make Primary`.

### 3. KYC Records & Location (was 1.14.3)
- **KYC queue** (pending reviews) + **verification levels**.
- **Per-customer KYC card:** documents with expiry, verification level, `Request re-upload`.
- **Location block:** county, town, GPS pin, address — with `Verify address` action.

### 4. Reminders & Communication (NEW — replaces Statements/Reports/Communication)
- **Reminder triggers:** subscription renewal, **failed payment (insufficient funds)**, manual
  message — each with channel picker (**SMS / Email / WhatsApp**).
- **Send Reminder composer modal:** pick customer(s), template (renewal / failed payment /
  custom), channel, preview, send.
- **Communication log:** every SMS/email/WhatsApp with delivery status.

### 5. Refunds (NEW)
Refund ledger: Ref · Customer · Original payment · Amount · Reason (duplicate, wrong amount,
cancellation, hardship) · Status — with `Issue Refund` wizard (partial/full, back to original
method, links the Fees profit math).

### 6. Permissions, Reports & Receipts (was 1.14.4 + reports)
- **Customer permissions scope panel** (mirrors Fees/FX panels): generate statements, transaction
  receipts, fee waivers, edit billing, view KYC — Granted/Pending dots.
- **Reports & receipts:** per-customer statements, transaction receipts (`Generate Receipt`),
  export options.

### 7. Support Tickets (keep, retarget)
Customer support tickets (reframe rows to your customers' issues — failed payment queries, KYC
re-upload requests, refund status).

### 8. Linked Services (was 1.14.7)
Retarget to **external wallet links** (M-Pesa, bank) for payouts/refunds — matching the Fees
channel permissions.

---

## 5. Modal inventory (21 kept/retargeted + 8 new = 29, all functional)

| # | Modal | Status | New job |
|---|-------|--------|---------|
| 1 | onboardCustomerModal | **rewrite → 8-step adaptive wizard** | Type → Identity → KYC (deep/shallow by type) → Location → Payment method → Billing model (auto-bill/recurring + duration) → Permissions → Review |
| 2 | openAccountModal | **rewrite** | → **New Billing Plan** (customer, frequency weekly/monthly/quarterly, duration, amount, end date) |
| 3 | closeAccountModal | **rewrite** | → **End Billing Plan** (pause/end, reason, final invoice) |
| 4 | kycReviewModal | keep | KYC document review per customer |
| 5 | kycHealthModal | keep | KYC health (levels, expiry) |
| 6 | bulkKycApproveModal | keep | Bulk KYC approve |
| 7 | amlReviewModal | keep | AML review (retarget rows) |
| 8 | permissionModal | keep | Customer permissions editor |
| 9 | statementModal | keep | Per-customer statement |
| 10 | reportModal | keep | Reports (retarget: billing/reminder reports) |
| 11 | caseExportModal | keep | Export case/file |
| 12 | commModal | keep | Comm preferences (SMS/Email/WhatsApp channels) |
| 13 | createTicketModal | keep | Create support ticket |
| 14 | supportTicketsModal | keep | Ticket list (retarget rows) |
| 15 | ticketDetailModal | keep | Ticket detail |
| 16 | bulkUploadModal | keep | Bulk customer import |
| 17 | apiKeyModal | keep | Link external API/wallet (retarget) |
| 18 | linkExternalModal | keep | Link external wallet (M-Pesa/bank) |
| 19 | feeCalcModal | keep | Fee preview on customer charges |
| 20 | attentionModal | keep | Full attention list (retargeted) |
| 21 | profileModal | keep | Profile (Jckonia K.) |
| 22 | **new: customerDetailModal** | NEW | Full customer profile: KYC, location, payment methods, billing, reminders, activity |
| 23 | **new: sendReminderModal** | NEW | Reminder composer: customer(s), template (renewal / failed payment / custom), SMS/Email/WhatsApp, preview, send |
| 24 | **new: newPaymentMethodModal** | NEW | Add/verify payment method (M-Pesa, card, bank, wallet) |
| 25 | **new: issueRefundModal** | NEW | Refund wizard: original payment, partial/full, reason, method, links Fees profit |
| 26 | **new: billingPlanDetailModal** | NEW | Plan detail: schedule, payments, failed attempts, pause/edit/end |
| 27 | **new: kycRecordModal** | NEW | Customer KYC record: documents, expiry, verification level, request re-upload |
| 28 | **new: locationVerifyModal** | NEW | Address/GPS verification for a customer |
| 29 | **new: customerReportModal** | NEW | Generate per-customer report or transaction receipt (PDF/WhatsApp) |

---

## 6. Safe removals / keeps / improves (whole transaction-dashboard audit)

**Customers page:**
- **Safely remove:** savings/current **account** mentality (3,241 active accounts, 1,284 savings),
  "4,872 customers" scale, bank onboarding language, "Joint Signatory"/Grace Kamau bank rows,
  James K./Treasury persona. Remove/merge the 7th "Linked Services" bank-services section into
  wallet links.
- **Keep:** all 21 modal shells, directory table patterns, KYC queue mechanics, support-ticket
  structure, bulk import, full CSS primitive set.
- **Improve:** adaptive 8-step onboarding, billing plans + auto-bill, payment methods, reminders
  (SMS/Email/WhatsApp), refunds, per-customer permissions + receipts.

**Sibling pages (consistent with prior audits):**
- **Settlement / Liquidity / Reconciliation / FX / Fees** — rebuilt. Keep. Next: wire customer
  refs (CUS-…/PLT-/ORD-) from this page into Settlement collections.
- **Mobile Money / Payment Rails / Transfer Mgmt / System Health / Transfer Overview / Analytics**
  — still bank-operator; retarget stats to M-Pesa + Card rails, drop ATM/POS-fleet concepts.
- **Disputes / Compliance / KRA / Initiate Transfer / Account / Settings / Shared** — largely
  relevant; small copy retargets only.
- **Global:** business selector + world switch should become the shared header across all pages.

---

## 7. Cross-page links
- Customer cards link **PLT-/ORD-** refs → Settlement collections and Reconciliation workbench.
- Refund rows link → Fees page profit math (refund reduces your profit).
- Payment methods link → FX sub-wallets / Liquidity wallet activity for wallet-funded customers.
- Reminder logs link → customers' payment history in Settlement.

---

## 8. Implementation order
1. **CSS** — customer cards, billing-plan board, reminder composer, refund ledger, KYC/location
   blocks, scope dots, payment-method chips (reuse primitives + new classes).
2. **`Customers.tsx`** — new data model + hero/business selector + directory + billing + KYC +
   reminders + refunds + permissions sections.
3. **`CustomersModals.tsx`** — rewrite onboarding to 8-step adaptive wizard; retarget 20; add 8 new.
4. **Validate** — biome lint both files; grep for bank/account/savings leftovers.
5. **Reviewer pass + browser check** — no dead buttons, every modal reachable, responsive.
