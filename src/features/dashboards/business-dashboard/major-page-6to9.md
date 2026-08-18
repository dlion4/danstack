# PayMo Digital Platform — Comprehensive Page-by-Page Outline

## Consolidated Page Architecture Overview

This document provides an exhaustive, section-by-section blueprint for the five consolidated pages that form the backbone of the restructured PayMo superapp. Each page follows the established module pattern (`pages/<Module>.tsx` + `components/` + `styles/<module>.module.css`), renders inside the shared `BusinessShell` via `<Outlet/>`, and reads/writes from the **central ledger** as the single source of truth. Every section is designed around **jobs-to-be-done**, not finance jargon, with Kenya-first rails (M-Pesa, PesaLink, eTIMS, KRA) baked in at the structural level — not bolted on after.

The multi-business `currentBusinessKey` context flows through every page, so all data, totals, and actions are scoped to the active business entity unless a portfolio-consolidated view is explicitly invoked.

---

# PAGE 1: GET PAID (`get-paid.html`)

**Absorbs:** Collections & Merchant (3.2) + Invoicing & Billing (3.3)
**Zone:** 💰 Money In
**Mental model for the user:** *"Everything about how money comes into my business — from every channel, every customer, every invoice — lives here."*
**Core thesis:** This page eliminates the fragmentation that previously forced a user to think about "merchant services" separately from "invoicing." A shopkeeper doesn't distinguish between these — they just want to get paid. The page unifies all inbound money flows into one command center where the user can initiate, track, reconcile, and troubleshoot every shilling coming in.

---

## Section 1.1 — Payment Methods Hub (Collection Channels Command Center)

**What it contains:**
A visual grid/card layout displaying every active and available collection channel as a distinct card. Each card represents a payment rail the business can receive money through. Cards are grouped into three tiers: **Active** (live and receiving), **Pending Setup** (started but incomplete configuration), and **Available** (not yet enabled). Each card shows the channel name, its status badge, a mini sparkline of the last 7 days' volume, the total collected this month, and a primary action button.

The channels displayed include:
- **M-Pesa Paybill** — shows the Paybill number, account reference format, and whether it's shortcode (Lipa na M-Pesa) or direct Paybill
- **M-Pesa Till Number** — shows the Till number and buy-goods status
- **Bank Transfer / PesaLink** — shows linked bank account details, PesaLink routing code
- **Card Payments** — shows the card acceptance status (Visa/Mastercard), whether it's online (checkout link) or POS-attached
- **QR Code Payments** — shows the dynamic QR status (static vs dynamic), supported wallets (M-Pesa, Airtel Money, Equitel, bank apps)
- **Payment Links** — shows the payment link base URL, number of active links, total collected via links
- **USSD** — shows USSD short code if applicable for feature-phone customers

Each card has a contextual action: for active channels it's "View Transactions" or "Configure"; for pending it's "Complete Setup"; for available it's "Activate."

**Detailed information & data points:**
- Channel-level KPIs: volume (KES), transaction count, average ticket size, success rate %, failure rate % with top failure reason
- Configuration state: which fields are filled, which are missing (e.g., Paybill active but no callback URL configured — flagged as warning)
- Compliance status per channel: whether CBK/KRA requirements are met for that specific rail
- Fee structure preview: the exact fee per transaction for that channel, shown as "You keep KES X of every KES Y"

**Reason this section exists:**
A Kenya business owner doesn't think in terms of "merchant acquiring" or "payment gateway integration." They think: *"Which numbers can my customers pay to?"* This section answers that question in under 3 seconds. It also serves as the diagnostic tool — if M-Pesa collections dropped, the user can immediately see if the Paybill is active, if the callback is working, and if the success rate has changed. By showing pending and available channels, it becomes a **growth lever** — the user discovers they can enable card payments or QR and increase their collection surface area without leaving the page. The sparkline provides pattern recognition (weekend spikes, end-of-month drops) without requiring a separate analytics page.

---

## Section 1.2 — Invoice Center (Create, Manage, Track)

**What it contains:**
The primary workspace for all invoicing operations. This is not just a list — it's a full CRUD interface with powerful filtering, bulk actions, and status-based organization. The section opens with a **status tab bar**: All | Draft | Sent | Paid | Partially Paid | Overdue | Cancelled. Each tab shows a count badge.

Below the tabs is the **invoice table** with columns: Invoice #, Customer Name, Amount, Status (color-coded badge), Issue Date, Due Date, Amount Paid, Balance Due, and Actions (⋮ menu). The table supports:
- **Inline search** by invoice number, customer name, or amount
- **Advanced filters** panel (collapsible): date range, amount range, customer, status, payment method, tags
- **Bulk actions** toolbar (appears when rows are selected): Send selected, Mark as sent, Download PDFs, Export to CSV, Delete drafts
- **Sort** on every column (default: Due Date ascending, so overdue floats to top)

Above the table is a **summary strip** showing: Total Invoiced (this month), Total Collected, Total Outstanding, Total Overdue — each as a card with month-over-month trend arrow.

The **"New Invoice" button** is prominently placed in the top-right and opens the Invoice Wizard (Section 1.3). A secondary "Quick Invoice" button allows creating a simple one-line invoice inline without the wizard.

Each invoice row expands (or opens a slide-over panel) to show:
- Full invoice detail: line items, tax breakdown, discounts, notes, terms
- **Payment timeline**: every payment attempt against this invoice with timestamps and status
- **Activity log**: when it was created, sent, viewed by customer, reminded, paid
- **Linked transactions**: the actual bank/mobile money transactions that settled this invoice
- **Actions**: Send reminder (WhatsApp/SMS/email), duplicate, credit note, convert to recurring, download PDF, share link

**Detailed information & data points:**
- Invoice numbering follows configurable patterns: `INV-0001`, `TS-2025-001`, or custom prefix per business
- Customer auto-complete pulls from the CRM (Customers & CRM page) but also allows one-off customer entry
- Line items support: description, quantity, unit price, tax rate (per item or flat), discount (per item or flat)
- Tax auto-calculates based on item tax rates and the business's KRA VAT registration status
- Invoice templates: at least 3 pre-built (Professional, Simple, Retail) with the business logo, colors, and payment details auto-populated from the business profile in Settings
- "Viewed by customer" tracking via email/open pixel — shows a green eye icon when the customer has opened the invoice
- Partial payment handling: when a customer pays less than the full amount, the invoice status becomes "Partially Paid" and shows a progress bar of amount paid vs. total

**Reason this section exists:**
Invoicing is the single most common business action across all entity types — a freelancer invoices for services, a shopkeeper invoices for deliveries, a property manager invoices for rent, an NGO invoices for grants. By centralizing all invoice operations here with powerful filtering and bulk actions, the user never needs to go to a separate "invoice list" and a separate "create invoice" page. The status tabs immediately show the user where the money is stuck: if the Overdue tab has 15 invoices, that's the day's priority. The expandable detail with payment timeline and activity log eliminates the need to cross-reference with the Collections page — the user can see that the invoice was sent on the 1st, viewed on the 2nd, a partial M-Pesa payment came in on the 5th, and the balance is still outstanding. This section is the **operational core** of getting paid.

---

## Section 1.3 — Invoice Wizard (Step-by-Step Creation Flow)

**What it contains:**
A multi-step modal/wizard that guides the user through creating a complete, send-ready invoice. The wizard is designed to be fast for experienced users (with "Skip to review" option) and foolproof for first-timers. It replaces the old pattern of a dense single-form with validation errors hidden at the bottom.

**Step 1 — Customer:**
- Search/select existing customer (auto-complete from CRM with avatar, last invoice date, outstanding balance shown inline)
- OR "New Customer" inline creation (name, phone, email, KRA PIN — only fields required for invoicing, full profile created in CRM)
- If no customer (walk-in sale): toggle "No customer / Generic" which suppresses customer fields

**Step 2 — Line Items:**
- Dynamic row-based entry: each row = Description (text), Quantity (number), Unit (dropdown: pcs, hours, days, kg, km, or custom), Unit Price (KES), Tax Rate (dropdown: 16% VAT, Exempt, 0%, custom), Discount (KES or %)
- "Add Line" button below the rows
- Right sidebar (or bottom panel on mobile) shows **live running total**: Subtotal, Tax, Discount, Total
- Support for "free-form" single-line invoice: just a description and a total amount, no line items needed
- Product quick-pick: if Products & Store page has items, a "Pick from products" button lets the user select from their catalog and auto-fills description, price, and tax

**Step 3 — Details & Terms:**
- Invoice date (defaults to today, editable)
- Due date (defaults to invoice date + business's default payment terms, e.g., 30 days; also offers "On receipt", "15 days", "30 days", "60 days", "Custom")
- Purchase Order number (optional text field — links to supplier PO if applicable)
- Notes/Message to customer (pre-populated from business default template, editable — e.g., "Thank you for your business. Please pay via M-Pesa Paybill 123456 with account reference [invoice number]")
- Internal memo (only visible to the business, not on the sent invoice)
- Attachment upload (contracts, delivery notes — PDF/image, shown on invoice as downloadable)
- Recurring toggle: if enabled, opens sub-fields for frequency (weekly/monthly/custom), end date (or "until cancelled"), and auto-send settings

**Step 4 — Review & Send:**
- Full PDF-preview of the invoice as the customer will see it (rendered in-browser, not a separate tab)
- Summary sidebar: Customer, Amount, Due Date, Payment methods shown on invoice
- Send options (multi-select): Email, SMS (with preview of the message), WhatsApp (opens WhatsApp with pre-filled message + PDF), Copy Link (generates a shareable payment link), Download PDF
- Schedule send: "Send now" or "Schedule for [date/time]"
- "Save as Draft" and "Save & Send" as the two primary buttons

**Detailed information & data points:**
- The wizard auto-saves progress as a draft every 30 seconds and on field blur — if the user closes the modal accidentally, they find the draft in the Invoice Center's Draft tab
- Tax calculation engine: uses the business's KRA VAT registration status (from Settings) to determine if VAT should be applied. If the business is VAT-registered, line items default to 16% VAT unless marked exempt. If not registered, the VAT column is hidden entirely
- Currency: defaults to the business's base currency (KES for Kenya), but if multi-currency is enabled on the Cash & Accounts page, a currency selector appears with the FX rate locked at creation time
- Invoice number auto-generates on draft creation (not on send) to prevent number collisions if two users create invoices simultaneously in a team environment
- The wizard is fully keyboard-navigable: Tab moves between fields, Enter adds a line item, Ctrl+Enter submits

**Reason this section exists:**
A wizard reduces cognitive load and error rate compared to a single dense form. By separating customer selection, line items, and terms into discrete steps, the user focuses on one thing at a time. The live running total in Step 2 prevents the "surprise total" problem where users only see the final amount at the end. The review step with PDF preview is critical for trust — the user sees exactly what their customer will see before sending, preventing embarrassing errors (wrong logo, wrong Paybill, missing terms). The multi-channel send (email + SMS + WhatsApp + link) matches how Kenyan businesses actually communicate — many customers don't check email but will respond to a WhatsApp message with an invoice PDF. The recurring toggle here (rather than a separate "subscriptions" page) keeps the user in the flow: *"I'm invoicing this client every month"* is the thought, not *"I need to set up a subscription."*

---

## Section 1.4 — Recurring Invoices & Subscriptions

**What it contains:**
A dedicated management view for all recurring billing arrangements. This section is accessible both as a tab within the Invoice Center and as a standalone sub-view. It displays a table of all active, paused, and ended recurring schedules with columns: Customer, Amount, Frequency, Next Invoice Date, Total Invoiced (lifetime), Status, and Actions.

Each recurring entry expands to show:
- The full schedule: past invoices generated (with links to each), upcoming dates, and any that failed to generate (with error reason)
- The base invoice template (line items, terms, send method) — editable with "Edit future invoices" (changes apply from next cycle) vs "Edit this instance only"
- Customer's payment history against this recurring schedule: on-time rate, average days to pay, outstanding balance
- Pause/Resume controls with optional reason (internal memo)
- End schedule options: "End after X more invoices", "End on [date]", "End immediately"

A **"Create Recurring"** button opens a simplified version of the Invoice Wizard that focuses on the recurring-specific fields (frequency, start date, end condition) after the customer and line items are set.

**Subscription-specific features** (for businesses that sell subscriptions like SaaS, gym memberships, box deliveries):
- **Customer self-service portal link**: generates a URL the business can share with the customer where the customer can view their upcoming invoices, update their payment method, download receipts, and cancel (if allowed by the business's settings)
- **Dunning automation**: configurable sequence for failed/late payments — e.g., Day 1: SMS reminder, Day 3: WhatsApp reminder, Day 7: email with late fee notice, Day 14: pause service flag
- **Price change handling**: when the business updates the recurring amount, the system shows a preview of the impact ("This will change 23 active subscriptions. Customers will be notified on their next invoice.")

**Detailed information & data points:**
- Recurring revenue metrics shown at the top: Monthly Recurring Revenue (MRR), Annual Run Rate (ARR), Churn rate (subscriptions ended this month / total active), Net New MRR (new minus churned)
- Failure tracking: if an auto-generated invoice fails to send (email bounced, phone invalid), it's flagged in red with the error and a "Fix" button that opens the customer's contact details
- Tax implications: recurring invoices follow the same tax rules as manual invoices, but the section highlights if a VAT rate change is coming (e.g., KRA announces new rate) and shows how many recurring templates will be affected
- The recurring engine runs on a cron/scheduler that checks daily for "next invoice date = today" and generates invoices, sends them per the configured channel, and logs the generation in the audit trail

**Reason this section exists:**
Recurring revenue is the lifeblood of many businesses — landlords, SaaS companies, gyms, subscription box services, maintenance contracts. Without a dedicated recurring section, these businesses are forced to manually create the same invoice every month, which is the #1 reason they abandon a platform and go back to Excel. This section automates the entire cycle: generation, sending, tracking, dunning. The MRR/ARR metrics give the business owner a financial pulse — they can see at a glance whether their recurring income is growing or shrinking. The dunning automation prevents the awkward "please pay" phone call by handling reminders automatically through the customer's preferred channel. The customer self-service portal link is a competitive differentiator — it makes the business look professional and reduces support burden ("Where's my invoice?" → "Check your portal.").

---

## Section 1.5 — Receivables & Aging Dashboard

**What it contains:**
A financial health view focused exclusively on money that is **owed to the business but not yet collected**. This is the "who owes me, how much, and how late" section. It is the bridge between invoicing and actual cash collection.

**Aging Summary Table** (the centerpiece):
- Columns: Customer, 0–30 Days, 31–60 Days, 61–90 Days, 90+ Days, Total Outstanding
- Each cell shows the KES amount; cells in 61–90 and 90+ are highlighted in amber and red respectively
- Row totals on the right, column totals at the bottom
- Sortable by any column (default: 90+ Days descending — worst offenders first)
- Click on a customer row to open their **Customer Receivables Profile** (slide-over): all their unpaid invoices with individual aging, payment history pattern (average days to pay), communication log (reminders sent), and a "Contact" action button

**Visual Aging Chart:**
- A horizontal stacked bar chart showing the total receivables broken down by aging bucket — gives an instant visual sense of how "healthy" the receivables book is
- Trend line showing total outstanding over the last 6 months — is it growing or shrinking?

**Priority Actions Panel** (right sidebar or top cards):
- "Overdue invoices needing action: X" — click to filter the Invoice Center to Overdue
- "At-risk customers" — customers whose aging profile has worsened month-over-month
- "Largest outstanding" — top 5 customers by total owed
- "Suggested reminders" — AI-generated list of customers who should receive a reminder today based on their due date and historical payment behavior

**Bulk Reminder Tool:**
- Select multiple customers or aging buckets
- Choose channel: SMS, WhatsApp, Email, or all
- Template selector: "Friendly reminder", "Formal notice", "Final demand before action" — each pre-written but editable
- Preview and send in bulk
- Log of all reminders sent (appears in customer profile and audit trail)

**Write-off & Credit Note Workflow:**
- For truly uncollectible debts: "Write off" action on an invoice or customer total
- Requires a reason (dropdown: "Customer insolvent", "Disputed", "Error", "Other" + text field)
- Creates a credit note that offsets the receivable
- Flags in audit trail for accountant review
- Optionally creates a bad-debt expense entry in the ledger (feeds Bookkeeping & Taxes page)

**Detailed information & data points:**
- Days Sales Outstanding (DSO) calculated and displayed: "On average, you get paid in X days" — benchmarked against industry norms
- Collection rate: "Of KES X invoiced this month, you've collected KES Y (Z%)" — target is 100%
- Aging data is recalculated in real-time: if a payment comes in via M-Pesa at 2:00 PM and matches an invoice, the aging table updates immediately
- The aging buckets are configurable in Settings (default 0-30, 31-60, 61-90, 90+) but most businesses never change them
- For multi-business portfolio view: the aging table can toggle between "This business only" and "All businesses consolidated" — critical for a group with inter-company receivables

**Reason this section exists:**
Cash flow kills more businesses than profitability. A business can be profitable on paper but go under because customers aren't paying. This section makes the invisible visible — the owner sees exactly who owes them, how late they are, and what the trend looks like. The aging summary table is the standard tool every accountant uses, but presented here in a way a non-finance owner can understand: red means bad, sort by red to find your problem. The bulk reminder tool turns a tedious task (calling 15 customers) into a 2-minute action. The write-off workflow prevents the receivables book from being artificially inflated with dead debt. The DSO metric gives the owner a single number to track over time: *"Can I get my DSO from 45 days to 30 days?"* That one improvement can transform a business's cash position.

---

## Section 1.6 — QR Payments & Payment Links

**What it contains:**
Two related but distinct collection tools that don't fit neatly into "invoicing" or "merchant Paybill/Till" — they're for **informal, point-of-sale, and social-media-driven collections**.

**QR Code Payments:**
- **Dynamic QR Generator**: the user enters an amount and optional reference, and the system generates a QR code that, when scanned by any M-Pesa/bank app, initiates a payment of exactly that amount to the business's account
- **Static QR Display**: a permanent QR code (no amount encoded) that the business can print and display at a counter, on a poster, or on a table tent — the customer scans and enters the amount themselves
- **QR Management Table**: lists all generated QR codes with: type (static/dynamic), amount (if dynamic), reference, creation date, total times scanned, total amount collected, status (active/expired/disabled)
- **Bulk QR for inventory**: if the Products & Store page has items, the user can select multiple products and generate a QR code per product — each QR, when scanned, shows a mini checkout for that specific product at that specific price
- **QR Analytics**: scan count over time, conversion rate (scans vs. completed payments), average payment amount via QR, top-scanning times of day
- **Download/Print**: download QR as PNG, SVG, or PDF (with business branding — logo, name, "Scan to pay") for physical display

**Payment Links:**
- **Create Payment Link**: the user enters: amount (or leave blank for "customer enters amount"), description, optional product link (from Products & Store), expiry date, and the system generates a short URL (e.g., `paymo.biz/pay/tsretail/abc123`)
- **Payment Link Table**: lists all links with: short URL (clickable to copy), description, amount, created date, expiry date, times visited, times paid, total collected, status (active/expired/paused)
- **Link Customization**: the link landing page can be themed with the business's colors and logo — preview shown in the creation modal
- **Embed Code**: for businesses with websites, generate an HTML snippet to embed the payment button on their own site
- **Social Sharing**: one-click share to WhatsApp, Facebook, X (Twitter), Instagram DM — pre-fills a message like "Pay for [description] here: [link]"
- **Link Analytics**: visits over time, conversion funnel (visit → enter details → complete payment → success), drop-off point identification, referrer tracking (which social channel drove the most payments)

**Detailed information & data points:**
- QR codes comply with the Kenya QR Standard (KEQR) so they work across M-Pesa, Airtel Money, Equitel, and bank apps — not a proprietary format
- Payment links support all channels: M-Pesa STK push (phone number entered on the page), card payment (for online), and bank transfer (PesaLink details shown)
- Both QR and payment links auto-reconcile: when a payment comes through, it creates a ledger entry, updates the Cash & Accounts page, and if the link was associated with an invoice or product, it marks that as paid
- Expiry handling: when a payment link expires, it shows a "This payment link has expired" page with the business's contact info; the link still appears in the table marked as expired (not deleted, for record-keeping)
- Security: payment links include a tamper-proof hash — if the amount parameter is modified in the URL, the link is rejected

**Reason this section exists:**
Not every payment starts with an invoice. A shopkeeper has a customer walk in and wants to pay via phone — they point to a QR code on the counter. A business posts a product on WhatsApp and wants to say "Pay here" — they send a payment link. An event organizer prints QR codes on tickets for on-site payments. These are massive use cases in Kenya where informal, social-media-driven commerce is the norm. Without this section, the user would need a separate QR tool (like Lipa Later's QR or a bank's static QR) and a separate link tool (like Pesapal or Kopo Kopo) — defeating the superapp promise. By building QR and links into the Get Paid page, every payment through these channels automatically flows into the ledger, the cash accounts, and the customer's profile. The analytics (scan-to-pay conversion, link referrers) give the business owner intelligence they've never had: *"My WhatsApp posts drive 3x more payments than Facebook."*

---

## Section 1.7 — Refunds & Disputes Management

**What it contains:**
The operational center for handling money that needs to go back or is being contested. This is the "things go wrong" section — and how well it works determines whether a customer trusts the business or leaves.

**Refund Request Queue:**
- Table of all refund requests with columns: Refund ID, Original Transaction ID, Customer, Amount, Reason (category), Status (Requested → Approved → Processing → Completed → Rejected), Requested Date, Completed Date, Actions
- Filters: status, date range, amount range, customer, payment method (refund to same method or alternative)
- Each row expands to show: the original transaction details, the refund reason (customer's words + business's internal notes), any communication history with the customer about this refund, and the approval chain (who approved, when)

**Initiate Refund:**
- "New Refund" button opens a modal where the user: searches for the original transaction (by ID, customer, date, amount), the system pre-fills the amount (editable — partial refunds allowed), selects refund reason (Overpayment, Duplicate payment, Returned goods, Service not rendered, Error, Other), adds internal notes, and submits
- Refund routing: if the original payment was M-Pesa, the refund goes back to the same phone number via M-Pesa refund API. If card, via card refund API. If bank transfer, the user enters the customer's bank details
- **Approval workflow**: refunds above a configurable threshold (e.g., KES 10,000) require a second approver (from the Team & Roles page). Below the threshold, it's auto-approved. The queue shows "Awaiting approval" status for those
- **Refund from float**: the system checks if the business has sufficient balance in the relevant account before processing — if not, it shows a "Insufficient balance — fund your account first" error with a link to Cash & Accounts

**Disputes & Chargebacks:**
- Separate sub-tab for card chargebacks and customer disputes
- Shows: Dispute ID, Transaction, Customer, Amount, Reason code (from card network or internal), Status (Received → Under Review → Won → Lost → Settlement), Deadlines (card networks have strict response deadlines — shown as countdown timers)
- **Evidence builder**: guided workflow to upload evidence (delivery proof, communication logs, signed receipt, service agreement) — the system packages it in the format required by the card network or internal dispute process
- **Dispute analytics**: dispute rate (disputes / total transactions), win rate, average resolution time, top dispute reasons — shown as cards at the top

**Refund/Dispute Analytics Dashboard** (toggle view):
- Total refunded this month/period vs. last month/period (trend)
- Refund rate (refunds / total collections) — benchmarked
- Average refund processing time (request to completion)
- Refund reason breakdown (pie chart — "Returned goods" is 40% of refunds → product quality issue?)
- Dispute win/loss trend

**Detailed information & data points:**
- Every refund creates a negative ledger entry that offsets the original positive entry — the P&L and cash position are automatically updated
- Refunds are flagged in the Tax calculations: if the original transaction had VAT, the refund reduces the VAT liability accordingly (important for KRA VAT returns)
- The refund queue is shared across the team: if User A initiates and User B approves, both see it in their queue with their action highlighted
- For multi-business: refunds are scoped to the business that received the original payment — no cross-business refunds without an explicit inter-company transfer
- Audit trail: every status change, approval, rejection, and processing event is logged with timestamp, user, and IP/device

**Reason this section exists:**
Refunds are inevitable in any business. Without a dedicated refund workflow, businesses either (a) ignore refund requests and lose customers, (b) handle them manually via "send money back on M-Pesa" which breaks the ledger (money goes out but isn't tracked against the original transaction), or (c) have a chaotic WhatsApp thread of "you overcharged me" with no resolution tracking. This section brings rigor to the process: the refund is linked to the original transaction, the ledger stays clean, the approval workflow prevents unauthorized refunds, and the analytics surface patterns (if "returned goods" is the top reason, the business has a quality problem, not a payments problem). For card disputes specifically, the countdown timers and evidence builder are critical — missing a card network deadline means automatic loss, which costs the business real money.

---

## Section 1.8 — Fee Calculator & Pricing Transparency

**What it contains:**
A tool that shows the user exactly what they pay for every collection method, with the ability to model scenarios. This is both an **informational tool** and a **decision-making tool**.

**Fee Calculator Interface:**
- Input fields: Amount (KES), Payment Method (dropdown: M-Pesa Paybill, M-Pesa Till, Card (online), Card (POS), PesaLink, QR, Payment Link)
- Output display: Customer Pays (KES), Platform Fee (KES), You Receive (KES), Effective Rate (%)
- "Calculate" button or real-time calculation as the user types
- Side-by-side comparison mode: enter an amount once, see the fee and net for ALL methods in a comparison table

**Fee Schedule Reference:**
- A clean, searchable table showing the complete fee schedule: method, tier (if applicable), fee type (flat, percentage, or blended), minimum fee, maximum fee, settlement time (instant, T+1, T+2)
- Example: "M-Pesa Paybill: 0.5% of transaction value, min KES 10, max KES 200, settles T+1 to your bank account"
- Filter by method type: Mobile Money, Card, Bank, QR, Link
- "Why this fee?" expandable tooltips that explain the cost components (M-Pesa charges X, Safaricom takes Y, PayMo takes Z)

**Volume Discount Calculator:**
- If the business processes above certain thresholds, they may qualify for reduced fees
- Input: estimated monthly volume (KES)
- Output: current tier rate, next tier rate, volume needed to reach next tier, estimated monthly savings at next tier
- "Contact us to negotiate" button if above a certain volume

**Fee Impact Analytics** (requires historical data):
- "Last month, you paid KES X in fees across Y transactions. Your effective rate was Z%."
- Breakdown by method: "M-Pesa Paybill: KES A in fees (B% of your total fees). Card: KES C in fees (D%)."
- Trend: fee spend over last 6 months vs. volume — is the effective rate improving or worsening?
- Optimization suggestions: "10% of your collections last month were via Card (online) at 2.5%. If those customers paid via M-Pesa Paybill at 0.5%, you'd save KES X/month."

**Detailed information & data points:**
- Fees are fetched from the platform's pricing configuration (not hardcoded) so they update automatically when pricing changes
- The calculator accounts for pass-through costs: some businesses choose to add the fee to the customer's total ("customer bears the cost") — the calculator has a toggle: "Fee borne by: Business / Customer / Split" and adjusts the display accordingly
- For multi-currency: if the business collects in USD via card, the calculator shows the FX conversion fee separately
- Settlement time is displayed because it affects cash flow: "You receive KES 9,950, but not until tomorrow" vs. "You receive KES 9,900, but instantly" — the user can make an informed choice

**Reason this section exists:**
Fee transparency is a trust issue. If a business receives KES 10,000 from a customer but only sees KES 9,800 in their account with no explanation, they feel cheated and start looking for alternatives. This section eliminates the "where did my money go?" question. The comparison table is a practical tool: a business receiving a KES 500,000 payment can instantly see that M-Pesa Paybill costs KES 2,000 while PesaLink costs KES 300 — and choose accordingly. The volume discount calculator creates an incentive to grow: *"If I process KES 5M/month instead of KES 3M, my rate drops from 0.5% to 0.3% — that's KES 10,000/month saved."* The optimization suggestions turn historical data into actionable advice. This section is a retention tool as much as a functional one — a business that understands their fees is a business that stays.

---

## Section 1.9 — Collection Analytics & Performance

**What it contains:**
The intelligence layer of the Get Paid page. While other sections are operational (do things), this section is analytical (understand things). It answers: *"How well am I collecting money, and where can I improve?"*

**Key Performance Indicators (Top Cards):**
- Total Collected (this month / this week / today) with trend arrow vs. same period last month
- Collection Growth Rate (% change month-over-month)
- Average Transaction Value (ATV) — is it going up (premium customers) or down (more small transactions)?
- Transaction Count — volume health
- Collection by Channel (mini donut chart: M-Pesa 70%, Card 20%, Bank 10%)
- Failed Transaction Rate (%) — if spiking, something is broken

**Collection Trend Charts:**
- Daily collections line chart (last 30 days) with a target line (if the user has set a monthly collection goal in Settings)
- Monthly collections bar chart (last 12 months) — seasonal patterns visible
- Day-of-week heatmap: which days collect the most? (Many Kenya businesses see Friday/Monday spikes)
- Hour-of-day heatmap: when do customers pay? (Useful for timing SMS reminders)

**Channel Performance Deep-Dive:**
- Per-channel table: Channel, Volume (KES), Count, ATV, Fee Paid, Net Received, Success Rate, Avg. Settlement Time
- Highlight best-performing channel (green) and worst (amber) — "Your M-Pesa Paybill has a 98.5% success rate. Your Card channel has a 91% success rate — investigate decline reasons."
- Decline reason breakdown for card: "Insufficient funds 40%, Expired card 25%, Technical error 20%, Other 15%"

**Customer Payment Behavior:**
- "Fastest payers" — customers who consistently pay before due date (potential for early-payment discount program)
- "Slowest payers" — customers who consistently pay late (potential for stricter terms or upfront payment)
- Payment method preference per customer: "John Mwangi pays via M-Pesa 90% of the time" — useful for personalizing reminders
- New vs. returning customer collection split

**Goal Setting & Tracking:**
- Set a monthly collection target (KES)
- Progress bar: "KES 2.3M of KES 5M target (46%) with 12 days remaining"
- Projected end-of-month total based on current run rate
- Historical goal achievement: "You've hit your target in 8 of the last 12 months"

**Detailed information & data points:**
- All analytics are scoped to `currentBusinessKey` — switching businesses in the shell switches all numbers
- Date range selector on every chart: Today, This Week, This Month, This Quarter, This Year, Custom Range
- Export: every chart and table has an "Export" button (CSV, PDF, or image)
- The analytics data is powered by the same TanStack Query hooks that power the operational sections — no separate data pipeline needed
- Real-time: if a large payment comes in while the user is viewing the analytics, the "Total Collected" card updates within seconds (via query invalidation from the payment callback)

**Reason this section exists:**
Operational sections tell you what happened. Analytics tell you what's happening and what to do about it. Without this section, a business owner has no visibility into trends: *"Are my collections growing or shrinking? Is M-Pesa still my dominant channel? Are my card declines increasing?"* The day-of-week and hour-of-day heatmaps are specifically valuable for Kenyan SMEs — they can time their marketing or reminder SMS for peak payment hours (often 8–10 AM and 5–7 PM on paydays). The customer payment behavior analysis feeds directly into the CRM and Receivables sections: fast payers get rewarded, slow payers get stricter terms. The goal setting feature gives the business owner something to strive for beyond "survive this month" — it turns collections into a managed, measurable function.

---

## Section 1.10 — Quick Actions Bar (Persistent)

**What it contains:**
A horizontal sticky bar at the bottom of the Get Paid page (or top, below the page-bar) that provides one-click access to the most common actions without navigating to a specific section. This is the "I just want to..." escape hatch.

**Actions (left to right, prioritized by frequency):**
1. **"New Invoice"** — opens Invoice Wizard (Section 1.3)
2. **"Create Payment Link"** — opens Link creation modal (from Section 1.6)
3. **"Generate QR"** — opens QR creation modal (from Section 1.6)
4. **"Send Reminder"** — opens customer selector + bulk reminder tool (from Section 1.5)
5. **"Record Payment"** — for manual payment recording (cash, cheque, or offline M-Pesa that didn't auto-reconcile): opens a modal to search for an invoice and mark it as paid with the payment details
6. **"Check Status"** — enter a transaction ID or phone number to look up a payment's status (useful when a customer says "I paid but you haven't received")
7. **"Fee Check"** — opens a mini fee calculator (from Section 1.8) inline

**Design details:**
- On desktop: horizontal icon + text buttons in a subtle bar
- On mobile: bottom sheet with icon grid (like a speed dial)
- Each action opens a **modal** — the user never leaves the page
- The bar is context-aware: if the user is filtered to "Overdue" in the Invoice Center, the Quick Actions bar highlights "Send Reminder" with a badge showing the count of overdue invoices

**Reason this section exists:**
Return users don't need to see the full page every time. A landlord who logs in daily to send rent reminders shouldn't have to navigate to Receivables → filter Overdue → select customers → send. The Quick Actions bar puts the 7 most common actions one click away. It's the difference between a 30-second task and a 3-minute task — repeated daily, that's hours saved per month. The "Record Payment" action is specifically critical for cash-heavy businesses (retail shops, market vendors) where the payment happens in cash and needs to be manually linked to an invoice — without this, cash payments create a gap in the ledger. The "Check Status" action is a customer-service tool: when a customer calls saying "I sent money," the business owner can instantly look it up without leaving the page.

---
---

# PAGE 2: PAY SUPPLIERS (`pay-suppliers.html`)

**Absorbs:** Accounts Payable (3.6) + Bulk Disbursements (3.5) + Payroll (3.4)
**Zone:** 💸 Money Out
**Mental model for the user:** *"Every shilling leaving my business — to suppliers, to employees, to the government — I plan, approve, and track here."*
**Core thesis:** Money-out is where businesses feel the most pain and risk. A wrong payment, a missed approval, a late salary — these have immediate human consequences. This page consolidates all outbound payment workflows into one controlled environment where nothing leaves without a trace, an approval (if required), and a ledger entry. The 3-step wizards for bulk and payroll ensure that complex, high-stakes disbursements are foolproof.

---

## Section 2.1 — Approval Queue & Workflow Engine

**What it contains:**
The gatekeeper section — no payment above the threshold leaves the business without passing through here. This is a shared queue visible to all users with approval permissions (configured in Team & Roles), showing every payment request that needs human sign-off before execution.

**Queue Layout:**
- **Tab bar**: My Pending (assigned to me) | All Pending (team-wide) | Approved (ready to execute) | Rejected | Expired
- Each tab shows a count badge
- Default view: "My Pending" — the logged-in user sees only what they need to act on
- Table columns: Request ID, Type (Invoice/Bulk/Payroll/Expense/Ad-hoc), Payee, Amount, Requested By, Requested Date, Priority (Normal/High/Urgent — color-coded), Status, Actions
- Sort: by Priority (Urgent first), then by Requested Date (oldest first — don't let requests sit)
- **Expand row** to see full details without leaving the queue:

**Expanded Request Detail (slide-over panel):**
- **Summary card**: Payee name, amount, payment method proposed, due date (if applicable), priority
- **Supporting documents**: attached invoices, POs, contracts, receipts — rendered as thumbnails that open full-size
- **Approval chain visualization**: a horizontal stepper showing Requested → Level 1 Approval → Level 2 Approval → Execution. Current step is highlighted. Each completed step shows who approved, when, and any comments they added
- **Ledger impact preview**: "This payment will: debit Accounts Payable KES X, credit Cash (M-Pesa) KES X, update supplier balance to KES Y"
- **Budget impact** (if budgeting is enabled): "This KES 500,000 payment is 83% of your Q3 'Supplier Payments' budget. Remaining: KES 100,000."
- **Action buttons**: Approve (with optional comment), Reject (requires reason — dropdown + text field), Request Changes (sends back to requester with notes), Delegate (assign to another approver — useful when on leave)
- **Communication thread**: any comments, questions, or notes between the requester and approvers — like a mini chat thread specific to this request

**Approval Rules Engine (configured in Settings, visible here as info):**
- Threshold rules: "Payments below KES 10,000: auto-approve. KES 10,000–100,000: 1 approver. Above KES 100,000: 2 approvers including a director."
- Role-based rules: "Payroll requires HR Manager + Finance Manager approval."
- Method rules: "Bank transfers above KES 50,000 require CBK-compliant additional verification."
- Time-based rules: "Payments requested after 4 PM for same-day execution require Urgent priority and additional approval."
- These rules are displayed as a small info tooltip on each request: "This request requires 2 approvals because amount > KES 100,000"

**Notifications & Escalation:**
- Approvers receive in-app notifications (bell icon in shell header), email, and optional SMS/push for Urgent items
- Escalation timer: if a pending request isn't acted on within X hours (configurable), it escalates to the next-level approver with a "Escalated: no action in X hours" flag
- Expiry: if a request isn't approved before the proposed payment date, it's marked "Expired" and the requester is notified — they must resubmit

**Detailed information & data points:**
- The queue is powered by a state machine: each request has a strict set of valid state transitions (Draft → Pending → Approved/Rejected/ChangesRequested → Executing → Completed/Failed)
- Approval actions are immutable: once approved, it cannot be un-approved (only rejected at a higher level or cancelled before execution)
- The queue respects `currentBusinessKey`: in a multi-business setup, each business has its own queue and approval chains
- Performance metrics (shown as small cards above the queue): "Average approval time: 4.2 hours", "Requests pending > 24 hours: 3", "Approval rate: 94% (6% rejected)"
- Keyboard shortcuts for power users: `A` to approve, `R` to reject, `E` to expand — shown in a small "?" help tooltip

**Reason this section exists:**
Approval workflows are the single most important control in a business's money-out process. Without them, a junior clerk can pay KES 2M to a supplier without anyone checking. With them, the business owner sleeps well knowing nothing leaves without their eyes on it (or their delegate's). The queue design is deliberately simple — a table with expandable rows — because approvers don't want to navigate to sub-pages. They want to scan, expand, read, approve/reject, move on. The approval chain visualization shows the requester where their payment is in the process — no more "did you see my request?" WhatsApp messages. The escalation timer prevents the bottleneck problem where one busy approver holds up the entire pipeline. The ledger impact preview gives approvers financial context without making them open the Bookkeeping page — they can see "this payment will reduce my cash by KES 500K" right in the approval view.

---

## Section 2.2 — Supplier Directory & Management

**What it contains:**
The master list of every entity the business pays — suppliers, vendors, service providers, landlords, utilities, government bodies. This is the Accounts Payable address book, but richer: it's a living profile for each payee that accumulates history and intelligence over time.

**Directory Table:**
- Columns: Supplier Name, Category (dropdown filter: Goods, Services, Utilities, Rent, Government, Logistics, Other), Phone/Email, Outstanding Balance, Total Paid (lifetime), Last Payment Date, Payment Method (preferred), Status (Active/Inactive/On Hold), Actions
- Search: by name, phone, email, KRA PIN, or bank account number (last 4 digits)
- Filters: category, status, balance range (show only suppliers who owe me credit notes), payment method
- Sort: by Outstanding Balance (descending — who do I owe the most?), by Last Payment (ascending — who haven't I paid recently?), by Total Paid (descending — who are my biggest suppliers?)
- **Bulk actions**: Export directory (CSV), Send batch remittance, Update category, Mark inactive

**Supplier Profile (slide-over or full page):**
- **Header card**: Name, logo (if uploaded), category, status badge, primary contact name + phone + email, KRA PIN, physical address
- **Financial Summary**: Outstanding balance, total paid (this month / this year / lifetime), average payment amount, average days to pay (how quickly does this business pay its own suppliers? — useful for negotiating terms), credit limit (if set)
- **Bank Accounts**: list of the supplier's bank accounts on file (bank name, branch, account name, account number — with last-4 masking for security). "Add account" button. Each account can be marked "Primary" (used for bulk payments)
- **M-Pesa Details**: if the supplier accepts M-Pesa (many small suppliers do), store their phone number as a payment option with a "Pay via M-Pesa" quick action
- **Documents**: contracts, agreements, tax compliance certificates (KRA), vendor onboarding forms — uploaded and versioned
- **Payment History**: full table of every payment made to this supplier: date, amount, method, reference, linked invoice/PO, status
- **Invoice/PO History**: every invoice received from this supplier and every purchase order sent: dates, amounts, matching status (matched to payment or unmatched)
- **Notes & Communication**: internal notes (only visible to the business team) — e.g., "Always confirm order by phone before paying", "They offer 2% discount for payment within 7 days"
- **Actions**: New Payment, New Purchase Order, Send Message (SMS/email), Edit Profile, Put On Hold (with reason — stops all payments to this supplier until removed), Delete (only if no payment history)

**Supplier Onboarding (Quick Add):**
- "Add Supplier" button opens a modal with: Name (required), Category (required), Phone (required for M-Pesa payments), Email, KRA PIN (for tax compliance), Bank Account details (optional — can be added later)
- "Bulk Import" option: upload CSV with supplier details — mapped to fields, validated, and imported
- Duplicate detection: if a supplier with the same name or phone number exists, warn "Possible duplicate: [existing supplier name]. Continue anyway?"

**Supplier Intelligence (automated insights):**
- "Discount opportunity": "Supplier X offers 2% early-payment discount. You paid on Day 30 last time. If you pay on Day 7, you save KES Y/year."
- "Payment pattern": "You typically pay Supplier Z on the 15th of the month. Their invoices are due on the 10th. You're consistently 5 days late — consider adjusting your payment cycle."
- "Spend concentration": "45% of your supplier spend goes to Supplier A. Consider diversifying to reduce dependency risk."

**Detailed information & data points:**
- Supplier data is shared across the platform: the supplier's phone number is used by the Quick Actions bar to send payment reminders, their bank account is used by the Bulk Disbursement wizard, their outstanding balance is fed by the Invoice/PO matching engine
- The directory supports supplier groups/tags: e.g., "Farm suppliers", "Nairobi vendors", "Urgent priority" — useful for bulk payment selection
- Credit limit tracking: if the business has agreed to buy up to KES 500K/month from a supplier, the system tracks cumulative purchases and warns when approaching the limit
- For multi-business: suppliers can be shared across businesses in a portfolio ("Use this supplier for all my businesses") or kept business-specific
- Supplier status "On Hold" is a hard block: no payment can be initiated to an On Hold supplier without removing the hold (which requires a reason and is logged in the audit trail)

**Reason this section exists:**
Every business pays suppliers, but most manage them in a phone contacts list, an Excel sheet, or their own memory. When the accountant leaves, the supplier details leave with them. This section creates a **persistent, shared, intelligent supplier record** that the entire team can access. The financial summary (outstanding balance, total paid, payment patterns) gives the business owner negotiating leverage: *"I've paid you KES 12M over 3 years — can I get better terms?"* The discount opportunity alerts are direct money saved — many Kenyan suppliers offer 2–5% early-payment discounts that businesses leave on the table because they don't track due dates closely enough. The "On Hold" status is a risk control: if a supplier delivers bad goods, the business can immediately freeze all payments while the dispute is resolved. The bulk import ensures that businesses migrating from Excel can onboard their entire supplier list in minutes, not days.

---

## Section 2.3 — Single Payment Initiation

**What it contains:**
The fast lane for one-off payments — not bulk, not payroll, just "pay this one supplier now." This is the most frequently used action on the page and is designed for speed without sacrificing control.

**Payment Initiation Form:**
- **Payee** (required): search/select from Supplier Directory (auto-complete with name, phone, outstanding balance shown inline) OR enter manual payee details (name + phone or bank account — for one-off payments to non-suppliers like a one-time service provider)
- **Amount** (required): KES input with validation (must be > 0, must not exceed available balance — checked in real-time against Cash & Accounts)
- **Payment Method** (required): dropdown populated based on the payee's details and the business's enabled channels:
  - M-Pesa (B2C) — if payee has a phone number on file
  - Bank Transfer (EFT/RTGS/PesaLink) — if payee has bank details on file
  - Check — generates a check record (for businesses that still use checks)
  - Mobile Money (Airtel Money, Equitel) — if payee's network is detected
  - Internal Transfer — if paying another business in the same PayMo portfolio
- **Reference/Description** (required): free text or select from recent descriptions (auto-suggests based on history: "March rent", "Office supplies", "Invoice #1234")
- **Category** (required): dropdown matching the Chart of Accounts expense categories (feeds Bookkeeping): Rent, Utilities, Supplies, Services, Transport, Salaries (redirect to Payroll), Tax (redirect to Tax page), Other
- **Attach Documents** (optional): invoice, receipt, PO, contract — drag-and-drop or file picker
- **Link to Invoice/PO** (optional): if the payment is against a received invoice or PO, search and link it — this creates the AP matching record
- **Schedule** (optional): "Pay now" (default) or "Schedule for [date/time]" — scheduled payments appear in a "Scheduled" sub-tab and execute automatically

**Pre-Payment Review (before submit):**
- A review panel appears below the form (or as a step) showing:
  - "You're paying [Name] [Amount] via [Method]"
  - "Available balance: KES X. After this payment: KES Y"
  - "This payment [does/does not] require approval" (based on rules engine)
  - If approval required: "This will be sent to the approval queue. Estimated approval time: Z hours (based on your team's average)."
  - Fee: "Transaction fee: KES X. Total debit: KES Y."
  - Ledger impact: "Expense: [Category] +KES X. Cash: -KES X."

**Post-Submission States:**
- **Auto-approved** (below threshold): "Payment submitted. Processing... Status: [Sent to M-Pesa / Sent to bank]. Expected completion: [time]."
- **Pending Approval**: "Payment request #1234 submitted to approval queue. You'll be notified when approved."
- **Scheduled**: "Payment scheduled for [date]. You can view/cancel in Scheduled Payments."
- **Failed**: "Payment failed: [reason]. Options: Retry with same method, Try different method, Cancel."

**Recent Payments Strip:**
- Below the form, a horizontal scrollable strip of the last 10 payments (icon + name + amount + time) — for quick repeat payments: "Pay [same supplier] again" button on each

**Detailed information & data points:**
- The form auto-saves as draft every 15 seconds — if the user navigates away, they find it in a "Drafts" sub-tab
- M-Pesa B2C payments have a daily limit set by Safaricom (KES 300,000 for most accounts) — the system checks this limit in real-time and warns if the payment would exceed it
- Bank transfers have CBK-mandated cutoff times (e.g., RTGS before 11 AM for same-day) — if the user schedules a payment after cutoff, the system warns "This will settle next business day"
- For tax-deductible payments (suppliers with KRA PIN): the system auto-calculates withholding tax (WHT) if applicable — "Amount: KES 100,000. WHT (5%): KES 5,000. Net payment: KES 95,000. WHT remitted to KRA on your behalf." This is a massive value-add that saves the business from manual WHT calculations
- The payment method dropdown is smart: if the payee only has a phone number (no bank details), M-Pesa is pre-selected and bank options are hidden

**Reason this section exists:**
Most payments a business makes are one-off: pay the rent, pay the electricity bill, pay the delivery guy, pay the web designer. If every one of these requires going through a "bulk disbursement wizard," the user will hate the platform. This section is the **fast lane** — fill in 4–5 fields, review, submit, done. The auto-complete from the supplier directory means the user types "KPLC" and the phone number, category, and preferred payment method auto-fill. The withholding tax auto-calculation is a killer feature for Kenya: many businesses don't know they're supposed to withhold 5% or 20% on certain payments, and when they don't, KRA penalizes them. By calculating it automatically, PayMo becomes the compliance cop that saves the business from itself. The recent payments strip enables the most common repeat action: *"I paid KPLC last month — let me do it again."*

---

## Section 2.4 — Bulk Disbursement Wizard (3-Step)

**What it contains:**
A guided workflow for paying multiple recipients in a single batch — salaries, supplier runs, dividend distributions, customer refunds, agent commissions. This is the highest-stakes action on the page because a single error can affect dozens or hundreds of people.

**Step 1 — Build Batch (Upload or Manual):**

*Option A: Upload Spreadsheet*
- Download template (CSV/Excel) with columns: Name, Phone/Bank Account, Amount, Reference, Category
- Upload the filled template
- Validation engine runs immediately: "148 rows uploaded. 145 valid. 3 errors: Row 23 — invalid phone number. Row 67 — amount exceeds daily limit. Row 112 — duplicate with Row 45."
- Errors are shown inline with the row highlighted — user can fix in-table or remove the row
- "Preview valid payments" button proceeds to Step 2

*Option B: Manual Entry*
- Add recipients one by one: search supplier directory or enter manually
- Each row: Name, Payment Method, Account Details, Amount, Reference
- "Add Another" button
- Duplicate detection: if the same phone/account appears twice, warn

*Option C: Select from Existing*
- "Pay all overdue supplier invoices" — pre-fills from the supplier directory's outstanding balances
- "Pay selected invoices" — checkbox selection from a list of received invoices
- "Pay expense claims" — pre-fills from approved expense claims

**Batch Summary (bottom of Step 1):**
- Total recipients: X
- Total amount: KES Y
- Payment methods breakdown: M-Pesa: Z recipients (KES A), Bank: B recipients (KES C)
- Estimated fees: KES D
- Total debit: KES Y + D
- Available balance: KES E — green if sufficient, red if insufficient with "Fund account" link

**Step 2 — Review & Verify:**
- Full table of all payments with every column visible
- **Validation checks** (shown as a checklist, all must pass):
  - ☑ All recipients have valid payment details
  - ☑ No duplicate payments detected
  - ☑ Total amount within available balance
  - ☑ All amounts are positive
  - ☑ No recipient is on "On Hold" status
  - ☑ Daily M-Pesa B2C limit not exceeded (KES 300,000 — if exceeded, suggest splitting across days or using bank transfer)
  - ☑ [If applicable] Withholding tax calculated for applicable recipients
- **Holding amount**: if WHT applies, show "Gross: KES X. WHT withheld: KES Y. Net disbursed: KES Z. WHT to remit to KRA: KES Y."
- **Approval requirement**: "This batch of KES 2.5M requires 2 approvals before execution."
- **Scheduling**: "Execute now" or "Schedule for [date/time]"
- "Edit" button goes back to Step 1. "Submit for Approval" (or "Execute" if auto-approved) proceeds.

**Step 3 — Confirmation & Tracking:**
- **Confirmation screen**: "Your bulk payment of KES X to Y recipients has been [submitted for approval / executed]."
- **Batch tracking dashboard**: a real-time view of the batch's progress
  - Summary card: Batch ID, Total Amount, Recipients, Status (Processing / Partially Complete / Complete / Failed), Start Time, Elapsed Time
  - Progress bar: "142 of 148 payments complete"
  - Per-recipient status table: Name, Amount, Method, Status (Pending / Sent / Complete / Failed), Reference/Receipt Number, Error (if failed)
  - **Failed payment actions**: for each failed payment, options: "Retry (same method)", "Retry (different method)", "Skip", "Retry All Failed"
  - "Download Report" button: generates a CSV/PDF with every payment's status, receipt number, and timestamp — this is the **remittance advice** that the business can share with recipients or keep for records
- **Post-completion**: "Batch complete. 146 succeeded, 2 failed (retried and succeeded). Total disbursed: KES X. Fees: KES Y. WHT withheld: KES Z." Ledger entries auto-created for all successful payments.

**Detailed information & data points:**
- The batch is saved as an entity with a unique Batch ID — it appears in the Payment History and Audit Trail as a single record that can be expanded to see all individual payments
- M-Pesa B2C has a per-transaction limit (KES 50,000 for most) and a daily cumulative limit (KES 300,000) — the wizard automatically splits large amounts into multiple transactions if needed (e.g., a KES 80,000 payment to one person becomes two KES 40,000 transactions) and shows this to the user
- For bank transfers, the wizard batches by bank: all KCB payments in one batch, all Equity payments in another — this reduces the number of bank instructions
- The wizard supports "partial execution": if the user approves but only wants to execute 100 of 148 payments (e.g., the rest need more verification), they can deselect individual rows in Step 2
- In a multi-business setup, bulk payments are scoped to the current business — no cross-business bulk payments without explicit portfolio transfer
- The batch tracking dashboard uses real-time polling (every 5 seconds) to update payment statuses as callbacks come in from M-Pesa/banks

**Reason this section exists:**
Bulk payments are where businesses feel the most anxiety. Paying 50 suppliers or 100 employees — if one payment goes to the wrong person or the wrong amount, it's a disaster. The 3-step wizard is deliberately paced: Step 1 is about getting the data in (with validation), Step 2 is about verifying everything is correct (the "are you sure?" moment), Step 3 is about watching it happen and handling failures. The spreadsheet upload with inline error fixing is critical for Kenyan businesses that manage their payroll/supplier lists in Excel — they shouldn't have to re-type 100 names into a web form. The M-Pesa limit handling (auto-splitting, daily limit warnings) prevents the frustrating experience of a bulk payment failing halfway through because of a limit the user didn't know about. The remittance advice download is the document every business needs after a bulk payment — it's what they send to their suppliers saying "here's proof we paid you." Without this wizard, the user is either doing one-by-one payments (hours of work) or using a clunky bank bulk payment portal (and losing the ledger integration).

---

## Section 2.5 — Payroll Processing Wizard (3-Step)

**What it contains:**
A specialized wizard for the most important recurring money-out event: paying employees. Payroll is separated from general bulk disbursements because it has unique requirements — tax calculations (PAYE), statutory deductions (NSSF, SHIF), pension contributions, leave tracking, and legal compliance that general supplier payments don't have.

**Step 1 — Payroll Setup & Input:**

*Payroll Period Selector:*
- Month/Year picker (e.g., "March 2025")
- Pay date (default: last working day of the month, editable)
- "Copy from last month" button — pre-fills all employee data from the previous payroll run (most months, only a few things change)

*Employee List Table:*
- Columns: Employee Name, Department/Role, Gross Pay, NSSF (employee), SHIF (employee), PAYE (tax), Pension (if applicable), Other Deductions (loan repayment, advance, union dues), Net Pay, Payment Method (M-Pesa/Bank), Account Details, Status (Active/On Leave/Terminated)
- Each cell in the financial columns is **editable** — the user can adjust gross pay (for overtime, bonuses, deductions) and the tax/deductions recalculate in real-time
- Inline validation: "Gross pay cannot be below minimum wage (KES 15,120)", "PAYE calculation: using current KRA tax brackets"
- "Add employee" button for new hires not yet in the system
- "Remove" button for employees not being paid this period (with reason: on leave without pay, terminated, not yet onboarded)
- Summary bar at bottom: Total Gross, Total NSSF, Total SHIF, Total PAYE, Total Other Deductions, Total Net Pay, Number of Employees

*Statutory Calculations Panel (collapsible, but always visible as a summary):*
- **PAYE**: calculated using current KRA tax brackets (personal relief KES 2,400/month, insurance relief, affordable housing relief if applicable). Shows the calculation: "Taxable income: KES X. Tax: KES Y. Less: Personal relief KES 2,400. PAYE: KES Z."
- **NSSF**: employee contribution (6% of gross, capped at KES 1,080 for the new tier) and employer contribution (same amount — shown separately because it's a cost to the business)
- **SHIF**: 2.75% of gross (new rate as of 2024), capped if applicable
- **Pension**: if the business has a registered pension scheme, employee and employer contributions per the employee's enrollment
- **Housing Levy**: 1.5% of gross (if applicable)
- All statutory figures are marked with a ⓘ tooltip linking to the KRA/NSSF/SHIF regulation

*One-Off Adjustments:*
- Bonuses: add a bonus amount to an employee — system calculates the tax implication (bonuses are taxed differently — annualized method)
- Advances/Loans: deduct a loan repayment amount — system tracks the outstanding loan balance
- Overtime: add overtime hours × rate — adds to gross
- Leave without pay: reduce gross by the days absent — system recalculates all deductions proportionally

**Step 2 — Review, Approve & File:**

*Payroll Summary Dashboard:*
- Visual cards: Total Gross Pay, Total Statutory Deductions (NSSF + SHIF + PAYE + Housing Levy), Total Net Pay, Total Employer Cost (Gross + Employer NSSF + Employer Pension + other employer costs)
- Comparison to last month: "Net pay increased by KES X (Y%) due to: 2 new hires, 3 bonuses, 1 salary adjustment"
- Statutory compliance check: "All deductions calculated using current KRA/NSSF/SHIF rates as of [date]. Last rate update: [date]."
- **P9 preview**: for each employee, a mini P9 form showing year-to-date gross, tax, relief, net — the actual P9 is generated at year-end but the preview ensures monthly accuracy

*Approval:*
- If payroll requires approval (configured in Settings): "Submit for approval" sends to the approval queue
- If auto-approved (e.g., the business owner is the one running payroll): "Approve & Proceed"

*Statutory Filing Preview:*
- "This payroll will generate the following statutory remittances:"
  - PAYE to KRA: KES X (due by 9th of next month)
  - NSSF (employee): KES Y (due by 9th of next month)
  - NSSF (employer): KES Z (due by 9th of next month)
  - SHIF: KES A (due by 9th of next month)
  - Housing Levy: KES B (due by 9th of next month)
- "Auto-file" toggle: if enabled, PayMo will file these returns to KRA/NSSF/SHIF on the due date automatically — the user sees "PAYE will be auto-filed to KRA on April 9, 2025"
- "Manual file" option: the user downloads the filled returns (KRA PAYE return form, NSSF contribution schedule, SHIF schedule) and files manually

**Step 3 — Execute & Distribute:**

*Payment Execution:*
- "Execute Payroll" button — processes all net pay payments via the selected methods (M-Pesa B2C, bank transfer)
- Real-time progress: same batch tracking UI as Bulk Disbursement (Section 2.4) — per-employee payment status, retry failed, download payslips
- **Payslip Generation**: for each employee, a PDF payslip is auto-generated showing: name, employee ID, period, gross pay, all deductions line-by-line, net pay, employer contributions, year-to-date totals
- **Distribution**: payslips sent to employees via: email (if on file), SMS (link to download), WhatsApp (PDF attachment), or "Download all" for the business to distribute manually

*Post-Payroll Actions:*
- Ledger entries auto-created: Salaries Expense (gross), PAYE Payable, NSSF Payable, SHIF Payable, Cash (net pay disbursed)
- Statutory liabilities appear on the Bookkeeping & Taxes page as upcoming payments due
- Employee records updated: year-to-date totals incremented, loan balances reduced, leave balance updated (if leave without pay was deducted)
- "Next month" reminder set: notification 3 days before next payroll date

**Detailed information & data points:**
- Payroll data persists month-to-month: the employee list, salary base, tax calculations, and YTD figures are stored and carried forward — the user never starts from scratch
- KRA tax brackets are maintained as a configuration that updates when KRA changes rates (pushed via platform updates, not manual user input)
- The system supports multiple pay frequencies: monthly (most common), semi-monthly, bi-weekly, weekly — selected in Settings and enforced in the wizard
- For multi-business: each business has its own payroll. If a portfolio has 5 businesses with 10 employees each, payroll is run 5 times (once per business). A consolidated payroll view is on the Portfolio page
- Termination handling: when an employee is marked as terminated, the system calculates final pay (pro-rated salary, accrued leave payout, any severance) and generates a separate "Final Pay" wizard
- The payroll wizard has a "Lock" feature: once a payroll period is executed and locked, no changes can be made without an "Unlock" action (which requires approval and is logged in the audit trail). This prevents post-payment tampering

**Reason this section exists:**
Payroll is the single most stressful recurring task for a business owner. Get it wrong and employees don't get paid, or KRA penalizes you for incorrect tax. The 3-step wizard is designed to handle the complexity of Kenyan payroll (PAYE with multiple reliefs, NSSF new tiers, SHIF new rates, housing levy) without the user needing to know the tax code. The "Copy from last month" feature handles the 95% case where only minor things change. The real-time tax recalculation as the user adjusts gross pay gives immediate feedback: *"If I give John a KES 10,000 bonus, his PAYE goes up by KES 2,500 and his net goes up by KES 7,500."* The auto-file feature is the ultimate value-add: instead of the business owner logging into KRA iTax, downloading the PAYE return, filling it manually, uploading it, and paying via bank — PayMo does all of it. The payslip generation and distribution eliminates the "please send me my payslip" WhatsApp messages. This wizard, more than any other section, is why a business would never leave PayMo.

---

## Section 2.6 — Expense Claims Management

**What it contains:**
A workflow for employees/team members to submit out-of-pocket expenses for reimbursement, and for the business to approve, process, and track those reimbursements. This bridges the gap between "I bought something with my own money for the business" and "the business paid me back."

**Claim Submission (Employee View — or admin submitting on behalf):**
- "New Claim" button opens a form:
  - Employee: auto-filled from logged-in user (or selector if admin submitting)
  - Claim Title: e.g., "Client meeting lunch", "Office supplies from Nakumatt"
  - Date of Expense: date picker
  - Amount: KES
  - Category: dropdown matching expense categories (Meals & Entertainment, Transport, Supplies, Communication, Travel, Other)
  - Receipt: **photo upload** (camera or gallery) — the system uses OCR to pre-fill the amount, date, and vendor name from the receipt image
  - Additional Receipts: attach multiple receipts for a single claim
  - Project/Business: if multi-business, which business/entity does this expense belong to?
  - Notes: "Met with Client X at Java House to discuss contract renewal"
  - Submit → goes to approval queue

**Claims Queue (Approver View):**
- Tab bar: Pending My Approval | All Pending | Approved | Rejected | Paid
- Table: Claim ID, Employee, Title, Amount, Category, Date Submitted, Receipt (thumbnail — click to view full), Status, Actions
- Expand to see: full receipt image(s), notes, employee's expense history ("This employee has submitted KES X in claims this month"), budget impact
- Actions: Approve, Reject (reason required), Request Receipt (if image is unclear), Approve with Adjustment (change the amount — with reason)

**Payment of Approved Claims:**
- Approved claims accumulate in a "Ready for Payment" sub-view
- "Pay All" button sends them through the Bulk Disbursement wizard (Section 2.4) pre-populated with the claim details
- Or "Pay Selected" for individual claims
- Once paid, the claim status changes to "Paid" with the payment reference linked

**Expense Policy Engine (configured in Settings, enforced here):**
- Per-category limits: "Meals & Entertainment: max KES 2,000 per claim, KES 10,000 per month per employee"
- If a claim exceeds the limit: soft warning ("This exceeds your meal limit by KES 500. Submit anyway?") or hard block (configured per policy)
- Receipt requirement: "Claims above KES 1,000 require a receipt" — if no receipt attached, the submit button is disabled with a message
- Approval routing: "Claims below KES 5,000: manager approval. Above KES 5,000: manager + finance approval"

**Claims Analytics:**
- Monthly claims spend by category (bar chart)
- Claims by employee (table: name, # claims, total amount, average amount, approval rate)
- Policy compliance rate: "95% of claims were within policy. 5% exceeded limits (all approved with justification)."
- Trend: claims spend over last 6 months — is it growing?

**Detailed information & data points:**
- Receipt OCR uses a mobile-optimized image capture: guides the user to take a clear photo with edge detection, then extracts vendor name, date, total amount, and tax amount (VAT) if visible
- Claims auto-create ledger entries when paid: Expense (category) debit, Cash credit
- If the receipt shows VAT and the business is VAT-registered, the system extracts the VAT amount and creates an input VAT entry — this is critical for VAT recovery
- For multi-business portfolio: an employee can submit a claim against any business they have access to (configured in Team & Roles)
- Claims integrate with the employee's payroll: if the business chooses to reimburse via payroll deduction (negative deduction = addition to net pay) rather than a separate payment, the claim flows into the Payroll wizard as a line item

**Reason this section exists:**
Without an expense claims system, employees either (a) don't get reimbursed (they stop spending on behalf of the business, which slows operations), (b) get reimbursed via informal M-Pesa sends with no records (ledger gap, tax risk), or (c) submit crumpled paper receipts that get lost (audit risk). This section formalizes the entire flow: submit with photo receipt, enforce policy automatically, approve with context, pay through the same bulk payment system, and record in the ledger. The OCR receipt capture removes the biggest friction point — typing receipt details. The policy engine prevents the "we don't have a policy so people claim whatever they want" problem. The VAT extraction from receipts is a tax compliance feature that most businesses don't even know they need — every restaurant receipt with VAT is potentially a KRA input tax credit that reduces the business's VAT bill.

---

## Section 2.7 — Payment Scheduling & Recurring Payments

**What it contains:**
Tools for setting up payments that repeat automatically or are planned for the future — the "set it and forget it" layer of money-out.

**Recurring Payment Setup:**
- "New Recurring Payment" button opens a form:
  - Payee: select from supplier directory or enter manually
  - Amount: fixed amount OR "Use latest invoice amount" (for suppliers where the amount varies — the system pulls the latest outstanding invoice amount each cycle)
  - Frequency: Daily, Weekly, Bi-weekly, Monthly, Quarterly, Annually, Custom (e.g., "every 2 weeks on Friday")
  - Start Date: when the first payment should execute
  - End Condition: Never (until cancelled), After X payments, On [date], or "When total reaches KES X"
  - Payment Method: same as single payment (auto-fills from supplier's preferred method)
  - Category & Reference: for ledger categorization
  - Approval: "Requires approval each time" (goes to approval queue before each execution) or "Auto-approve up to KES X" (only requires approval if amount exceeds threshold)
- After creation: appears in the "Recurring Payments" table with columns: Payee, Amount (or "Variable"), Frequency, Next Payment Date, Total Paid (lifetime), Status (Active/Paused/Ended), Actions

**Scheduled Payments (One-Time, Future):**
- Accessible from the Single Payment form's "Schedule" option or a dedicated "Scheduled Payments" sub-tab
- Table: Payee, Amount, Method, Scheduled Date/Time, Status (Scheduled / Processing / Completed / Failed / Cancelled), Created By, Actions
- Actions: Execute Now (move up from schedule), Edit (change amount/date/method), Cancel
- "Today's Scheduled Payments" card at the top: "3 payments scheduled for today totaling KES X. All will execute automatically at their scheduled times."

**Recurring Payment Management:**
- **Pause/Resume**: temporary stop (e.g., supplier on strike, service temporarily suspended) — retains all settings
- **Edit**: change amount, frequency, method, or end condition — "Changes apply from next cycle" or "Apply to upcoming payment only"
- **Skip Next**: skip the upcoming payment without pausing the schedule (e.g., supplier already paid manually this month)
- **End**: terminate the recurring schedule with a reason (internal memo) — no more payments will execute

**Recurring Payment Analytics:**
- Total recurring commitments: "You have KES X in recurring monthly payments. This is Y% of your average monthly revenue."
- Upcoming payments calendar: visual calendar showing when each recurring payment will fire in the next 30 days
- Cash flow impact: "Based on your recurring payments and expected collections, your cash position on [date] is projected to be KES X" — links to Cash & Accounts forecasting

**Detailed information & data points:**
- Recurring payments execute via the same payment engine as manual payments — same validation, same approval workflow, same ledger entries
- If a recurring payment fails (insufficient balance, M-Pesa limit, wrong account details), the system: logs the failure, notifies the business owner, and retries based on a retry policy (e.g., retry next day, then every 3 days, up to 3 retries)
- For "Variable amount" recurring payments (linked to latest invoice): the system checks for a new/unpaid invoice 2 days before the scheduled date and pre-notifies the business owner: "Upcoming recurring payment to Supplier X: latest invoice is KES Y. Approve? Adjust? Skip?"
- The recurring payment engine runs on a daily scheduler (same as recurring invoices) that identifies payments due today and queues them for execution
- In a multi-business portfolio: recurring payments are per-business, but the Portfolio page shows a consolidated view of all recurring commitments across businesses

**Reason this section exists:**
Many business payments are predictable: rent is monthly, salaries are monthly, utility bills are monthly, insurance premiums are annual, supplier contracts are weekly. Without recurring payments, the business owner relies on memory or a calendar reminder — and every month, they're scrambling to pay rent on the 1st because they forgot. This section automates the predictable, freeing the owner to focus on the unexpected. The "variable amount" option is critical for suppliers whose invoices change each month — instead of a fixed KES 50,000, the system pulls the actual invoice amount and asks for confirmation. The cash flow impact analysis is the safety net: *"You have KES 800,000 in recurring monthly payments but your average collection is KES 600,000 — you're running a deficit."* That insight alone can save a business from insolvency. The pause/skip/end controls ensure the user never feels locked in — they have full control over every scheduled payment.

---

## Section 2.8 — Disbursement Float & Funding

**What it contains:**
The financial mechanics layer — how money gets into the "payment engine" before it goes out. In Kenya, many payment methods (M-Pesa B2C, bank transfers) require the business to have a pre-funded float or sufficient balance in a specific account. This section manages that funding process.

**Float Overview Dashboard:**
- Cards showing:
  - **M-Pesa B2C Float Balance**: KES X (with "Top Up" button)
  - **Bank Payment Balance**: KES Y (linked to specific bank accounts from Cash & Accounts)
  - **Total Available for Disbursement**: KES X + Y
  - **Pending Payments**: KES Z (approved but not yet executed — this amount is "reserved")
  - **Truly Available**: KES (X + Y) - Z — this is what the user can actually spend
- Color coding: green if sufficient for all scheduled payments in the next 7 days, amber if cutting it close, red if insufficient (with "You need KES X more to cover this week's payments" warning)

**Float Top-Up:**
- "Top Up M-Pesa Float" button opens a flow:
  - Amount: enter KES
  - Source: select from linked bank accounts (from Cash & Accounts / Open Banking)
  - The system initiates a bank-to-M-Pesa float transfer (via PayMo's internal rails)
  - Status tracking: "Transfer initiated... Processing... Float topped up. New balance: KES X."
- "Top Up Bank Payment Account" button: initiates a transfer from another linked bank account to the designated payment bank account

**Auto-Funding Rules:**
- "Auto-top-up M-Pesa float when balance falls below KES X, top up to KES Y from bank account Z"
- "Auto-top-up when a scheduled payment is X hours away and float is insufficient"
- These rules are configured here, executed automatically, and logged in the audit trail

**Disbursement Funding Forecast:**
- A 7-day and 30-day look-ahead showing:
  - Scheduled payments (recurring + one-time) by date
  - Expected float/balance before each payment
  - Shortfall alerts: "On March 15, you have KES 500,000 in payments but only KES 300,000 in float. Shortfall: KES 200,000."
  - Suggested funding actions: "Transfer KES 200,000 from KCB Current to M-Pesa float by March 14 to cover."

**Float Transaction History:**
- Table of all float movements: Date, Type (Top Up / Payment Out / Refund In / Adjustment), Amount, Running Balance, Reference, Source/Destination
- Filterable by type and date range
- Exportable for reconciliation

**Detailed information & data points:**
- The float balance is checked in real-time before every payment initiation — if insufficient, the payment is blocked with a "Fund your float first" message and a direct link to top-up
- M-Pesa B2C float has a maximum balance set by Safaricom/PayMo's arrangement — the system shows this limit and warns when approaching it
- For bank payments, the "float" is simply the actual bank account balance (fetched via Open Banking if connected, or manually entered if not)
- Float top-ups are themselves ledger entries: "M-Pesa Float (asset) +KES X, Bank Account -KES X"
- In a multi-business portfolio: each business can have its own float, or the parent business can fund child business floats via inter-company transfers

**Reason this section exists:**
In the Kenya payment ecosystem, you can't pay out what you haven't funded. M-Pesa B2C requires a pre-funded float — if the float is zero, no salaries go out, no suppliers get paid, and the business is paralyzed. Most businesses learn this the hard way: they try to run payroll and get "insufficient float" errors at 5 PM on payday. This section makes the float visible and manageable — the owner sees at a glance whether they have enough to cover this week's payments. The auto-funding rules prevent the "forgot to top up" problem entirely. The 7-day forecast is the early warning system: it tells the owner on Monday that they'll be short on Thursday, giving them 3 days to arrange funding. This section is not glamorous, but it's the difference between payroll that works and payroll that fails.

---

## Section 2.9 — Payment History & Audit Trail

**What it contains:**
The immutable record of every shilling that has left the business through this page. This is the "what happened" reference that the owner, accountant, and auditor all need.

**Payment History Table:**
- Columns: Date & Time, Payment ID / Batch ID, Type (Single / Bulk / Payroll / Expense / Recurring), Payee, Amount, Method, Category, Status (Completed / Failed / Reversed), Approved By, Reference/Receipt, Actions
- Filters: date range, type, method, category, status, payee, approver, amount range
- Search: by Payment ID, payee name, reference, or any free text in the description
- Sort: by date (default — newest first), by amount, by payee
- **Expand row**: shows full payment details, linked invoice/PO/claim, approval chain, ledger entries created, and any failure/reversal details
- **Bulk actions**: Export (CSV/PDF), Download receipts for selected

**Batch Expansion:**
- If a row is a bulk payment or payroll batch, clicking the Batch ID opens the batch detail view (same as Step 3 of the respective wizard) showing all individual payments within that batch
- From the batch view, the user can download the remittance advice, view per-recipient statuses, and see any retries that occurred

**Reversal & Cancellation Record:**
- A sub-tab showing all reversed/cancelled payments: original payment details, reversal reason, reversal date, current status of the reversal (processing / completed / failed)
- Reversal initiation is available here for eligible payments (within the reversal window, method supports reversal): "Request Reversal" button with reason input, sends to approval queue

**Audit Trail (Read-Only):**
- A chronological log of every action on this page: who did what, when, from which device/IP
- Filterable by: user, action type (created, approved, rejected, executed, reversed), date range
- This is the same audit trail that appears on the Bookkeeping & Taxes page, but filtered to money-out actions
- Cannot be edited or deleted — immutable by design

**Reconciliation Status:**
- Each payment shows a reconciliation status: "Matched to ledger" (green check) or "Unmatched" (amber warning)
- Unmatched payments (should be rare — the system auto-matches) are flagged for the accountant to investigate
- "Reconcile" action: manually link a payment to a ledger entry if the auto-match failed

**Detailed information & data points:**
- Payment history is retained for the full statutory period (KRA requires 7 years for tax records) — the system archives older records but keeps them searchable
- The table supports pagination with "Load more" and virtual scrolling for businesses with thousands of payments per month
- Every export includes a digital signature/timestamp for audit integrity: "This export was generated on [date] at [time] from PayMo platform. Records: X to Y."
- For multi-business: the history table has a business filter (default: current business, option: "All businesses in portfolio")
- The audit trail logs include: user ID, user name, role, action, entity affected (payment ID), before/after state (for edits), IP address, device type, and timestamp — this is CBK/AML compliance-grade logging

**Reason this section exists:**
Three audiences need this section: (1) The business owner who wants to check "did we pay Supplier X last month?" — simple search, instant answer. (2) The accountant who needs to reconcile payments to the ledger and prepare for audit — batch export, reconciliation status, audit trail. (3) The auditor/KRA who needs proof of payments — immutable records with digital signatures. Without this section, the business relies on M-Pesa messages (which get lost), bank statements (which don't show the business context), and memory (which fails). The batch expansion is critical because a single payroll batch might contain 50 payments — the owner needs to see both the batch level ("payroll March 2025, KES 2M") and the individual level ("John Mwangi, KES 45,000 net"). The reversal record ensures that when things go wrong (wrong amount, wrong person), the fix is documented and traceable. This section is the backbone of financial accountability.

---

## Section 2.10 — Quick Actions Bar (Persistent)

**What it contains:**
Same pattern as Get Paid — a sticky bar providing one-click access to the most common money-out actions.

**Actions:**
1. **"Pay Supplier"** — opens Single Payment form (Section 2.3) pre-set to supplier payee type
2. **"Run Payroll"** — opens Payroll Wizard (Section 2.5) with current month pre-selected
3. **"Bulk Payment"** — opens Bulk Disbursement Wizard (Section 2.4)
4. **"Submit Claim"** — opens Expense Claim form (Section 2.6)
5. **"Top Up Float"** — opens Float Top-Up modal (Section 2.8)
6. **"Approve Payments"** — jumps to the user's pending items in Approval Queue (Section 2.1) with a badge count
7. **"Check Float"** — shows a mini float summary tooltip without leaving the current view

**Context-aware behavior:**
- If the user has 5+ pending approvals, the "Approve Payments" button pulses or has a red badge
- If the float is low (below the auto-funding threshold), the "Top Up Float" button turns amber
- On payday (based on the business's configured pay date), "Run Payroll" is highlighted with a "Payroll is due today" banner

**Reason this section exists:**
Identical reasoning to Get Paid's Quick Actions — power users need speed. A finance manager who runs payroll on the 28th of every month and approves supplier payments daily should be able to do both from one bar without navigating through sections. The context-aware behavior (low float warning, payroll due today) turns the bar from a navigation tool into an **intelligence tool** — it tells the user what they probably need to do right now.

---
---

# PAGE 3: CASH & ACCOUNTS (`cash-accounts.html`)

**Absorbs:** Treasury (3.7) + Open Banking (3.10) + Virtual Accounts (3.9) + Multi-Currency (3.11)
**Zone:** 🏦 Your Money
**Mental model for the user:** *"All my money, across every account, every bank, every currency — where it is, where it's going, and what it's earning."*
**Core thesis:** A Kenya business typically has money in 3–5 places: M-Pesa, a bank account (or two), possibly a dollar account, and cash. Today, checking the balance means opening 4 different apps. This page is the single glass pane that shows everything. It goes further by adding intelligence: cash flow forecasting, auto-sweep rules to optimize idle money, virtual accounts for segregation, and multi-currency with FX for businesses that deal internationally.

---

## Section 3.1 — Unified Cash Position (The Single Pane of Glass)

**What it contains:**
The hero section of the page — a real-time, consolidated view of every shilling the business owns, across every account type, in one visual. This is what the user sees first, and it should answer the question "How much money do I have right now?" in under 2 seconds.

**Primary Balance Card (Top Center, Largest Element):**
- **Total Cash**: KES X,XXX,XXX — the sum of all connected accounts, floats, and wallets
- Trend indicator: "↑ KES X vs. yesterday" or "↓ KES X vs. yesterday" with percentage change
- Time of last sync: "Updated 2 minutes ago" — builds trust that this is live data
- Click/tap to see the breakdown (expands to show each account's contribution to the total)

**Account Balance Cards (Grid Below):**
- One card per connected account, each showing:
  - Account name (editable): e.g., "KCB Current Account", "M-Pesa Business", "Equity USD", "PayMo Virtual — Rent Collections"
  - Account type icon: 🏦 Bank, 📱 Mobile Money, 💳 Virtual, 💵 Cash
  - Available balance: KES X (or USD X for FX accounts — shown in local currency equivalent below)
  - Book balance vs. available balance (for bank accounts where cheques/debits are pending): "Book: KES 1,000,000 | Available: KES 950,000" — the difference is explained as "KES 50,000 in uncleared cheques"
  - Last transaction: "Last: KES -15,000 to KPLC, 2 hours ago"
  - Account health indicator: green (healthy), amber (low balance — below configured minimum), red (negative/overdrawn)
  - Click to expand: shows last 10 transactions for this account inline

**Cash Composition Donut Chart:**
- Visual breakdown: "Your KES 5M is distributed as: Bank Accounts 60%, M-Pesa 25%, Virtual Accounts 10%, Cash on Hand 5%"
- Clicking a segment filters the account cards to that type

**Multi-Currency Summary (if FX is enabled):**
- A secondary row of cards for foreign currency accounts: "USD Account: $12,500 (≈ KES 1,625,000 at 130.00)", "EUR Account: €3,000 (≈ KES 426,000 at 142.00)"
- Total when converted: "Total cash including FX: KES X" — with a note "FX rates as of [time], subject to change"

**Quick Insights Bar (Below the cards):**
- "Money in today: KES X (from Y transactions)"
- "Money out today: KES Y (from Z transactions)"
- "Net today: KES +/-Z"
- "Largest inflow today: KES A from [source]"
- "Largest outflow today: KES B to [payee]"

**Detailed information & data points:**
- Bank account balances are fetched via Open Banking (if connected) or via manual entry + bank statement upload (if not connected). The system clearly labels which accounts are "Live connected" (green dot) vs. "Manual" (amber dot — "Last updated: 3 days ago. Upload statement to refresh.")
- M-Pesa balance is fetched via PayMo's M-Pesa API integration (real-time)
- Virtual account balances are internal to PayMo (real-time, no sync needed)
- The "Total Cash" number uses available balance (not book balance) to prevent the user from thinking they have more than they can actually spend
- For multi-business portfolio: a toggle switches between "This business only" and "All businesses consolidated" — the consolidated view sums across all businesses in the portfolio
- Cash on hand is a manual entry: the user enters the amount of physical cash they have (e.g., shop till), and the system reminds them to update it daily

**Reason this section exists:**
This is the #1 reason a business owner opens a financial app: *"How much money do I have?"* Today, the answer requires checking M-Pesa (dial *334#), logging into KCB app, checking Equity app, and counting the till cash — a 5-minute process that yields a mental number that's already outdated. This section gives the answer in 2 seconds, with the confidence that it's live data. The account health indicators (amber for low, red for negative) are the early warning system: a red bank account card means "you're about to get an overdraft fee" or "your rent payment will bounce." The composition donut answers the implicit question: *"Am I too concentrated in one account?"* The multi-currency summary ensures a business importing goods in USD can see their dollar position without mental math.

---

## Section 3.2 — Linked Bank Accounts (Open Banking)

**What it contains:**
The management interface for connecting, monitoring, and interacting with the business's actual bank accounts. This is where Open Banking comes to life — the user connects their bank once, and PayMo pulls balances, transactions, and statements automatically.

**Connected Accounts List:**
- Cards for each connected bank account showing:
  - Bank logo + name: "KCB Bank Kenya"
  - Account name: "TechSolutions Ltd — Current Account"
  - Account number: "****7890" (last 4 digits, full number on click with verification)
  - Connection status: "Connected" (green) / "Disconnected" (red) / "Re-authentication needed" (amber — OAuth token expired)
  - Last sync: "2 minutes ago" / "3 days ago" / "Never"
  - Data available: "Balances ✓ | Transactions ✓ | Statements ✓" — shows what data PayMo can pull from this bank
  - Actions: Sync Now, View Transactions, View Statement, Disconnect, Edit Details

**Connect New Bank:**
- "Connect Bank Account" button opens a modal:
  - Bank selector: grid of bank logos (KCB, Equity, Co-op, NCBA, Absa, Standard Chartered, Stanbic, DTB, I&M, and all other CBK-licensed banks)
  - OAuth flow: user is redirected to their bank's login page, authenticates, and grants PayMo read access (balance, transactions, statements — no payment initiation unless explicitly granted)
  - Post-connection: "KCB Current Account connected. Syncing transactions... Found 847 transactions. Balances updated."
  - Multi-account support: if the user has 2 KCB accounts, both are discovered and the user selects which to connect

**Transaction Feed (Per Account):**
- Clicking "View Transactions" on a connected account opens a full transaction table:
  - Date, Description (as provided by bank, cleaned up by PayMo's categorization engine), Amount (color-coded: green for credits, red for debits), Running Balance, Category (auto-assigned or manual), Payee (extracted from description), Reference, Matched (to a PayMo invoice/payment or unmatched)
  - Filters: date range, amount range, credit/debit only, category, matched/unmatched
  - Search: by description, reference, or amount
  - **Auto-categorization**: PayMo's engine reads bank transaction descriptions ("M-PESA TILL 123456 — JAMES STORE") and auto-categorizes as "Supplies — James Store" and matches to the supplier directory if a match exists
  - **Manual categorization**: user can override the auto-category and assign a different one — the system learns from corrections
  - **Match to PayMo record**: if a bank transaction matches a PayMo-initiated payment (e.g., a bulk disbursement that settled in the bank), it's auto-matched with a green "Matched" badge. Unmatched transactions have an amber "Unmatched" badge with a "Match" action

**Statement Download & Import:**
- For connected accounts: "Download Statement" generates a PDF/CSV of the account's transactions for a selected period — formatted cleanly with PayMo's categories and matches
- For non-connected accounts (or as fallback): "Upload Statement" allows the user to upload a bank statement PDF/CSV. PayMo's parser extracts transactions, dates, amounts, and descriptions, and imports them into the transaction feed. The user reviews and confirms the import.
- Statement import supports all major Kenyan bank formats (KCB, Equity, Co-op, NCBA, etc.) with format auto-detection

**Open Banking Settings:**
- Data refresh frequency: "Sync balances every X minutes, transactions every Y hours" — configurable per account
- Notification rules: "Alert me when balance falls below KES X", "Alert me when a transaction above KES Y occurs", "Alert me when an unmatched transaction appears"
- Data retention: "Keep transaction history for: 1 year / 3 years / 7 years / Indefinite"
- Privacy: "Disconnecting a bank account removes all stored credentials but retains imported transaction history. Delete history to remove all data."

**Detailed information & data points:**
- Open Banking in Kenya is facilitated through the Kenya Open Banking framework (where available) or via direct bank API integrations where PayMo has partnerships
- OAuth tokens have a limited lifespan (typically 90 days) — the system tracks token expiry and proactively notifies the user to re-authenticate before the token expires ("Your KCB connection will expire in 7 days. Re-authenticate to avoid interruption.")
- Bank transaction descriptions in Kenya are notoriously messy: "M-PESA TILL 123456 JAMES MWAURA 25/03/25" needs parsing. PayMo's categorization engine uses regex patterns, merchant databases (Till number → business name lookups), and machine learning to clean these up
- For security: PayMo operates on a read-only basis by default. Payment initiation (sending money from the bank account) requires explicit user consent during OAuth and is a separate, enhanced permission
- The transaction feed is the primary data source for bank reconciliation (Section 3.8) — every imported transaction is a candidate for matching to a PayMo ledger entry

**Reason this section exists:**
Bank account visibility is the foundational problem this page solves. A business owner who can see their bank balance in real-time, alongside their M-Pesa balance, alongside their virtual account balances — in one place — has a superpower that their competitors don't. The auto-categorization engine turns raw bank data ("EQUITY BK TCP PAYBILL 123456") into business intelligence ("Rent payment — Equity Bank"). The statement upload fallback ensures that even if Open Banking isn't available for a specific bank, the user can still get their data into PayMo (uploading a PDF is better than nothing). The re-authentication notifications prevent the silent failure mode where the user thinks their data is live but the OAuth token expired 3 weeks ago. This section is the plumbing that makes the rest of the Cash & Accounts page intelligent — without connected bank data, the cash position is incomplete, the forecast is inaccurate, and the reconciliation is manual.

---

## Section 3.3 — Virtual Accounts Management

**What it contains:**
Virtual accounts are PayMo-issued account numbers that look and function like real bank accounts but live entirely within the PayMo platform. They allow a business to segregate funds for different purposes (rent collections, tax reserves, project funds) without opening actual bank accounts. Each virtual account has its own balance, transaction history, and can receive and send money.

**Virtual Accounts Dashboard:**
- Grid of virtual account cards, each showing:
  - Virtual account number: "PayMo VA — 1234567890" (formatted like a bank account number)
  - Account name/label: "Rent Collections — Kilimani Properties", "Tax Reserve — Q2 2025 VAT", "Project X — Client Y Funds"
  - Purpose tag: Collections, Tax Reserve, Project Fund, Escrow, Savings, Other
  - Balance: KES X
  - Currency: KES, USD, or other
  - Status: Active, Frozen, Closed
  - Created date
  - Actions: View Transactions, Transfer In, Transfer Out, Edit, Freeze, Close

**Create Virtual Account:**
- "New Virtual Account" button opens a modal:
  - Name/Label: what this account is for
  - Purpose: dropdown (Collections, Tax Reserve, Project Fund, Escrow, Savings, Other)
  - Currency: KES (default) or select from enabled currencies
  - Initial funding: transfer KES X from [source account] to open
  - Auto-sweep rules (optional — links to Section 3.6): "Sweep funds to [destination] when balance exceeds KES X"
  - Notification rules: "Alert me when balance exceeds / falls below KES X"
- Creation is instant — the virtual account number is generated immediately

**Virtual Account Transaction History:**
- Same transaction table format as bank accounts: Date, Description, Amount, Running Balance, Source/Destination, Reference
- Transactions are all internal to PayMo: transfers from M-Pesa float, from bank accounts, from other virtual accounts, from payment links, from collections
- Each transaction links to its source: "Received from M-Pesa Paybill collection — Invoice #INV-0234" or "Transferred from KCB Current Account — Manual transfer"

**Virtual Account Use Cases (Pre-built Templates):**
- **"Rent Collections"** template: creates a VA with auto-generated unique references per tenant (tenant pays via Paybill with their VA reference, money lands in their specific VA). Links to the Portfolio/Rentals use case.
- **"Tax Reserve"** template: creates a VA with auto-sweep rules that move a calculated percentage of incoming collections into this VA — ensuring tax money is always set aside
- **"Project Fund"** template: creates a VA for a specific client/project with income and expense tracking — useful for agencies, contractors, or event planners who need to segregate client funds
- **"Escrow"** template: creates a VA where funds are held until conditions are met (e.g., delivery confirmed) — useful for marketplaces or high-value transactions

**Virtual Account Analytics:**
- Total virtual account balances: "You have KES X across Y virtual accounts"
- Purpose breakdown: "Collections: 60%, Tax Reserve: 25%, Project Funds: 15%"
- Idle balance alert: "Virtual Account 'Project Z — Completed' has KES 500,000 that hasn't moved in 90 days. Consider transferring to your main account."

**Detailed information & data points:**
- Virtual account numbers are issued under PayMo's CBK-licensed entity or partner bank — they're real account numbers at the banking layer, just managed virtually within PayMo
- Virtual accounts can receive money via: M-Pesa Paybill (with account reference = VA number), bank transfer (VA number as the account number), internal transfer from another PayMo account
- Virtual accounts can send money via: internal transfer to another VA, transfer to a linked bank account, transfer to M-Pesa float (for B2C disbursements)
- Virtual accounts do NOT earn interest by default — the Investments section (future page) handles yield. But a "Savings VA" template could auto-sweep to an investment product
- For multi-business: each business can have its own set of virtual accounts, or the portfolio can have shared VAs (e.g., a group tax reserve VA)

**Reason this section exists:**
Kenyan businesses, especially property managers and agencies, desperately need account segregation without the pain of opening 10 bank accounts. A property manager with 20 units needs to track rent collections per unit — without virtual accounts, all rent lands in one big pool and they lose track of who paid and who didn't. A business that needs to set aside VAT every month currently uses a separate bank account (which takes 2 weeks to open) or a spreadsheet (which doesn't actually segregate the money). Virtual accounts solve this instantly: create an account in 10 seconds, fund it, and the money is segregated at the platform level. The pre-built templates (Rent Collections, Tax Reserve, Project Fund) turn a powerful but abstract feature into a concrete tool — the user doesn't need to understand virtual accounts, they just click "Create Tax Reserve" and it works. The idle balance alert prevents the "I forgot I had KES 500K in that virtual account" problem.

---

## Section 3.4 — Multi-Currency Wallets & FX

**What it contains:**
For businesses that deal in foreign currency — importers, exporters, NGOs receiving USD grants, SaaS companies earning in dollars. This section manages foreign currency holdings, currency conversion, and cross-border transfers.

**Currency Wallet Dashboard:**
- Cards for each enabled currency wallet:
  - Currency flag + code: 🇺🇸 USD, 🇪🇺 EUR, 🇬🇧 GBP, 🇹🇿 TZS, 🇺🇬 UGX, etc.
  - Balance: $12,500.00 (primary display in native currency)
  - KES equivalent: ≈ KES 1,625,000 (at rate 130.00)
  - Rate timestamp: "Rate as of 14:30 EAT, Mar 25 2025"
  - Last transaction: "Received $2,000 from [source], 3 days ago"
  - Trend: "↑ $1,500 vs. last month" or "↓ $500 vs. last month"
  - Actions: Convert, Send, Receive, View Transactions

**FX Rate Board:**
- A live (or near-live) rate table showing:
  - Currency pair: USD/KES, EUR/KES, GBP/KES, TZS/KES, UGX/KES
  - Buy rate (rate at which PayMo buys the foreign currency from the business)
  - Sell rate (rate at which PayMo sells foreign currency to the business)
  - Mid-market rate (for reference — shows the spread)
  - Spread: "PayMo spread: 0.50 KES per USD" — transparency
  - 24-hour high/low, 7-day trend (sparkline)
  - "Rate alert": set a target rate and get notified when it's reached — "Alert me when USD/KES sell rate drops below 128.00"

**Currency Conversion (FX Deal):**
- "Convert" button opens a modal:
  - From: [Currency wallet + balance] — "USD: $12,500 available"
  - To: [Currency wallet] — "KES"
  - Amount: enter in source currency — "Convert $5,000"
  - Rate: shows the applicable sell rate — "At 130.00 KES/USD"
  - You receive: "KES 650,000"
  - Fee: "FX fee: 0.5% (KES 3,250). Net received: KES 646,750"
  - "Rate lock" option: for amounts above a threshold, lock the rate for 30 seconds while the user confirms (protects against rate movement during the transaction)
  - Confirm → instant conversion → balances updated → ledger entry created

**Cross-Border Receive:**
- "Receive FX" button provides:
  - Virtual USD/EUR/etc. account details (account number, SWIFT code, routing number, bank name) — the business shares these with their international client/partner to receive a wire transfer
  - Payment tracking: when a wire is in transit, show "Incoming transfer: $X from [bank/country]. Expected: [date]. Status: In transit / Received / Credited."
  - Purpose code selection: CBK requires a purpose code for all inbound FX — dropdown with common codes (Goods, Services, Personal, NGO/Grant, Investment)

**Cross-Border Send:**
- "Send FX" button opens a form:
  - Beneficiary: name, bank name, country, account number/IBAN, SWIFT code
  - Amount in KES or foreign currency (with conversion preview)
  - Purpose code: required by CBK
  - Supporting documents: proforma invoice, customs declaration, contract — as required by CBK for outward FX
  - Fee breakdown: FX spread + wire fee + correspondent bank fee (if any) = total cost
  - Submit → approval (if above threshold) → execute → tracking

**FX Analytics:**
- FX exposure: "You hold $12,500 (KES 1.6M). If USD/KES moves from 130 to 125, you lose KES 62,500."
- FX transactions history: table of all conversions, receives, and sends with rates, amounts, fees, and P&L per trade
- Average rate: "Your average USD/KES rate this year: 132.50" — useful for cost calculations
- Currency diversification: "100% of your FX holdings are in USD. Consider diversifying to reduce single-currency risk."

**Detailed information & data points:**
- FX rates are sourced from PayMo's liquidity providers (banks, FX brokers) and updated every 60 seconds during market hours (8 AM–5 PM EAT) and every 5 minutes outside market hours
- The spread (difference between buy and sell) is how PayMo makes money on FX — it must be competitive with banks and forex bureaus or users will bypass the platform
- CBK compliance: all FX transactions above $10,000 require enhanced documentation (Form A for inflows, Form B for outflows). The system auto-generates these forms with the transaction data and prompts the user for any missing fields
- For NGOs receiving grants: the system can auto-allocate incoming USD to specific project virtual accounts based on the reference field ("Grant #123 — Health Program")
- FX gains/losses are automatically calculated and posted to the ledger as "FX Gain/Loss" — this feeds the P&L on the Bookkeeping page

**Reason this section exists:**
A Kenya importer paying $50,000 for goods currently: (1) goes to their bank, (2) fills out a Form B, (3) waits 1–3 days for the bank to process, (4) has no visibility on the rate until it's done, (5) can't compare rates. With this section, the importer sees the rate in real-time, locks it, converts, and sends — all in 2 minutes, with full documentation. An NGO receiving a $100,000 grant from USAID currently waits 5–7 days for the wire to clear, then manually records it in a spreadsheet. With this section, they see the incoming wire in transit, it credits automatically, and it's allocated to the right project VA. The FX exposure alert ("if the rate moves, you lose KES 62K") is a risk management tool that most SMEs have never had access to. The rate alert feature turns passive monitoring into active management: *"I want to convert at 128, notify me when it gets there."*

---

## Section 3.5 — Cash Flow Forecasting

**What it contains:**
A forward-looking view of the business's cash position based on historical patterns, scheduled transactions, and user inputs. This answers: *"Will I have enough money to pay rent next week? To make payroll? To buy that stock?"*

**Forecast Timeline (Visual):**
- A horizontal bar/line chart showing the projected cash balance over the next 30, 60, or 90 days
- The line starts at today's actual balance and extends forward
- Green zone: projected balance above the minimum threshold (configurable, e.g., KES 500,000)
- Amber zone: projected balance between minimum and zero
- Red zone: projected balance below zero (overdrawn)
- Vertical markers: scheduled large outflows (payroll on 28th, rent on 1st, tax payment on 20th) with labels
- Vertical markers: expected large inflows (recurring invoice due dates, expected client payments) with labels
- Confidence band: a shaded area around the forecast line showing the range of uncertainty — wider further out, narrower near-term

**Forecast Inputs (What drives the numbers):**
- **Actual balances**: today's real balance from Section 3.1
- **Scheduled outflows**: recurring payments (from Pay Suppliers), payroll (next run date), known bills (rent, utilities — if entered)
- **Scheduled inflows**: recurring invoices (from Get Paid), expected payments (from overdue receivables — using average payment behavior to estimate when they'll come in)
- **Historical patterns**: for unscheduled cash flows, the system uses the last 3–6 months' daily net cash flow to project a baseline
- **Manual adjustments**: the user can add: "Expected payment from Client X: KES 500,000 on April 5" or "Planned stock purchase: KES 200,000 on April 10" — these override the algorithmic projection
- **Scenarios**: the user can create multiple scenarios: "Best case" (all receivables collected on time, no unexpected expenses), "Base case" (average collection speed, normal expenses), "Worst case" (30% of receivables delayed, one unexpected expense)

**Shortfall Alerts:**
- If the forecast projects a balance below zero (or below the minimum threshold) at any point in the next 30 days, a red alert appears: "Projected shortfall of KES X on [date]. Cause: payroll of KES Y exceeds expected collections of KES Z."
- "Suggested actions": "Delay non-essential payment of KES A", "Accelerate collection of overdue invoices totaling KES B", "Arrange overdraft/credit line of KES C"
- These alerts also appear as push notifications and in the Overview page

**Forecast vs. Actual (Backtesting):**
- A secondary view showing how accurate past forecasts were: "30-day forecast from Feb 25 predicted a March 25 balance of KES 4.8M. Actual: KES 4.5M. Variance: -6.25%." — builds trust in the forecast
- The system automatically improves its forecasts based on variance analysis: if the business consistently collects 20% less than invoiced, the forecast adjusts its inflow assumptions

**Cash Flow Calendar:**
- A calendar view (month/week) showing each day's projected: opening balance, inflows, outflows, closing balance
- Click on a day to see the breakdown: which invoices are expected to be paid, which bills are due, which recurring payments fire
- "What if" mode: drag a payment to a different date and see the impact on the forecast

**Detailed information & data points:**
- The forecast engine runs on the server (not client-side) because it needs access to all historical transaction data across all accounts
- Forecast accuracy improves over time as more data accumulates — a business with 6 months of history gets a significantly better forecast than one with 2 weeks
- The confidence band calculation uses standard deviation of daily net cash flows — if the business has highly variable cash flows (e.g., a seasonal business), the band is wide, reflecting genuine uncertainty
- Manual adjustments are saved and persist across sessions — the user doesn't need to re-enter "expected client payment" every time they open the page
- For multi-business: the forecast can be per-business or consolidated portfolio — the consolidated forecast shows inter-company transfers and group-level cash needs

**Reason this section exists:**
Cash flow is the #1 cause of business failure worldwide, and it's entirely preventable with foresight. A business owner who knows "I'm going to be KES 200K short on the 28th when payroll hits" can take action today: call a slow-paying customer, delay a non-essential purchase, or arrange a temporary overdraft. Without this section, the owner discovers the shortfall on the 28th when the payroll fails — and by then, it's a crisis. The scenario modeling (best/base/worst case) is critical for decision-making: *"If our biggest client pays on time, we're fine. If they're 2 weeks late, we need KES 300K. Let me call them today."* The forecast vs. actual backtesting builds trust — if the user sees the forecast was within 5% last month, they'll believe it this month. The cash flow calendar turns an abstract projection into a concrete daily plan.

---

## Section 3.6 — Auto-Sweep & Liquidity Rules

**What it contains:**
The automation engine that moves money between the business's accounts based on rules — ensuring idle money earns interest, tax money is set aside, and the right account always has enough for payments.

**Rules Dashboard:**
- Table of all active, paused, and expired sweep rules:
  - Rule name: "Evening Sweep — M-Pesa to Bank", "Tax Reserve — 16% of Collections", "Payroll Fund — Weekly Top-Up"
  - Source account: where money is swept FROM
  - Destination account: where money is swept TO
  - Trigger condition: "When balance exceeds KES X", "At [time] every [day]", "When a credit of KES > Y hits the account", "Percentage of incoming funds"
  - Amount: "All excess above KES X", "Fixed KES Y", "Z% of incoming"
  - Status: Active (green), Paused (amber), Expired (grey)
  - Last executed: date, time, amount swept
  - Next execution: estimated date/time
  - Actions: Edit, Pause, Resume, Delete, View History

**Create Sweep Rule:**
- "New Rule" button opens a guided form:
  - **Step 1 — Trigger**: What causes the sweep?
    - Balance threshold: "When [source account] balance exceeds KES X, sweep the excess"
    - Scheduled: "Every day at [time]", "Every Friday at [time]", "Last day of month at [time]"
    - Event-based: "When any credit > KES X hits [source account]", "When a payment from [payee] is received"
    - Percentage-based: "Sweep Z% of every incoming credit to [source account]"
  - **Step 2 — Action**: What happens?
    - Destination account: select from all connected accounts (bank, M-Pesa, virtual accounts)
    - Amount calculation: depends on trigger — for threshold, "all above KES X" or "fixed KES Y". For percentage, "Z% of credit". For scheduled, "sweep KES Y" or "sweep all above minimum balance"
    - Minimum sweep amount: "Don't sweep if the amount is less than KES X" — prevents micro-transfers that aren't worth the fee
    - Maximum sweep amount: "Don't sweep more than KES X per execution" — safety cap
  - **Step 3 — Conditions & Safety**:
    - "Only sweep if destination account balance is below KES X" — prevents over-funding
    - "Don't sweep on [days]" — e.g., don't sweep on payroll day (keep money in M-Pesa for B2C)
    - "Require minimum source balance after sweep: KES X" — never sweep the account to zero
    - Approval: "Sweeps above KES X require approval" — for large auto-movements
  - **Step 4 — Name & Confirm**: give the rule a descriptive name, review all settings, activate

**Pre-Built Rule Templates:**
- **"End-of-Day Sweep"**: At 6 PM daily, sweep all M-Pesa balance above KES 10,000 to the bank account. Keeps M-Pesa lean for next-day collections, maximizes bank balance.
- **"Tax Reserve Auto-Save"**: 16% of every collection (M-Pesa Paybill, payment link, card) is automatically swept to the "Tax Reserve" virtual account. Ensures VAT money is always set aside.
- **"Payroll Buffer"**: Every Friday, sweep KES 500,000 from the main bank account to a "Payroll" virtual account. By the 28th, the payroll account has enough.
- **"Idle Money to Investment"**: When the main bank account balance exceeds KES 2M, sweep the excess to a money market fund (links to future Investments page). Earns yield on idle cash.

**Sweep Execution History:**
- Table of all sweep executions: Date/Time, Rule Name, Source, Destination, Amount, Trigger (what caused it), Status (Completed / Failed / Skipped), Failure Reason (if applicable)
- Summary: "This month, sweep rules moved KES X across Y executions. Largest sweep: KES Z on [date]."

**Detailed information & data points:**
- Sweep rules execute on the server's scheduler (cron) — they run independently of whether the user is logged in
- Execution is atomic: if a sweep fails mid-way (e.g., bank transfer fails after M-Pesa debit), the system reverses the debit — no money is lost
- Each execution creates a pair of ledger entries: debit source, credit destination — fully auditable
- Sweep rules respect account limits: if the destination is an M-Pesa float with a maximum balance, the rule stops sweeping when the limit is reached
- For multi-business: sweep rules can cross virtual accounts within the same business but cannot automatically sweep between different businesses without explicit portfolio-level configuration
- The "percentage of incoming" trigger is the most powerful for tax reserve: if the business is VAT-registered at 16%, setting a 16% sweep on all collections means VAT is saved before the owner can spend it — this single rule can prevent a VAT payment crisis

**Reason this section exists:**
Money management at the SME level is almost entirely reactive: money comes in, money goes out, and whatever's left sits in a current account earning 0% interest. The auto-sweep rules turn this into a proactive system: money comes in, 16% goes to tax reserve, excess goes to bank, idle money goes to investments — all automatically. The "Tax Reserve Auto-Save" template alone could save a business from a KRA penalty: instead of scrambling to find KES 300K for VAT at month-end, it's been accumulating all month. The "End-of-Day Sweep" solves a real Kenya problem: M-Pesa Paybill collections accumulate in the M-Pesa float, which doesn't earn interest and isn't in the bank where the business needs it for cheques/RTGS. The safety conditions (minimum balance after sweep, don't sweep on payroll day) ensure the automation never creates a new problem while solving an old one.

---

## Section 3.7 — Investments & Yield

**What it contains:**
A simple interface for the business to earn returns on idle cash — money market funds, fixed deposits, call accounts, and treasury bills. This is not a full trading platform; it's a "put your excess cash to work" tool for SMEs.

**Investment Dashboard:**
- Cards showing:
  - **Total Invested**: KES X (across all investment products)
  - **Current Value**: KES Y (including accrued interest/returns)
  - **Total Returns**: KES Z (Y - X) with annualized yield percentage
  - **Available to Invest**: KES W (cash not currently invested)
  - **Returns this month**: KES V
- Trend line: portfolio value over time (last 12 months)

**Available Products:**
- **Money Market Fund (MMF)**: "Earn 12–15% p.a. on your cash. Minimum: KES 1,000. Withdraw anytime. Risk: Low."
  - Shows: current yield, minimum investment, withdrawal notice period (none for MMF), fund manager name
  - "Invest" button: enter amount, select source account, confirm → instant investment
  - "Withdraw" button: enter amount, select destination account, confirm → instant withdrawal (for MMF) or T+1/T+2 for others
- **Fixed Deposit (FD)**: "Lock in 13–16% p.a. for 1–12 months. Minimum: KES 50,000. Penalty for early withdrawal."
  - Shows: rate by tenure (1 month: 13%, 3 months: 14%, 6 months: 15%, 12 months: 16%), minimum, early withdrawal penalty
  - "Invest" button: amount, tenure, source account → confirms maturity date and expected return
- **Treasury Bills (T-Bills)**: "Invest in government securities. 91-day: ~16%, 182-day: ~17%, 364-day: ~18%. Minimum: KES 100,000. Auction-based."
  - Shows: upcoming auction dates, indicative yields, how it works (bid process)
  - "Place Bid" button: amount, tenor, bid yield → submitted to CBK auction
- **Call Account**: "Earn 5–7% p.a. with same-day access. No minimum. Ideal for temporary parking."
  - Shows: current rate, access time
  - "Transfer" button: move money in/out

**My Investments Table:**
- Columns: Product, Amount Invested, Current Value, Returns (KES + %), Invested Date, Maturity Date (if applicable), Status (Active, Maturing Soon, Matured, Withdrawn), Actions
- "Maturing Soon" filter: shows investments maturing in the next 7 days with a "Reinvest" or "Withdraw" action
- Click to expand: full transaction history (investments, withdrawals, interest credits) for this specific investment

**Auto-Invest Rules:**
- Link to Section 3.6 sweep rules: "When main account balance exceeds KES 2M, sweep excess to Money Market Fund"
- "Reinvest returns": checkbox to automatically reinvest interest/returns instead of crediting to the main account — compounding
- "Ladder strategy" (for FDs): "Automatically create a new 3-month FD every month using KES 100,000 from excess cash" — builds a rolling ladder of maturing deposits

**Investment Analytics:**
- Yield comparison: "Your portfolio yield: 13.2% p.a. vs. bank savings account: 2% p.a. You're earning KES X more per year."
- Asset allocation donut: "MMF: 60%, FD: 30%, T-Bills: 10%"
- Returns by month (bar chart)
- Tax on returns: "Tax on interest: 15% withholding. Net yield after tax: 11.2%." — auto-calculated

**Detailed information & data points:**
- Investments are facilitated through PayMo's partnerships with licensed fund managers, banks, and CBK's treasury system — PayMo is the distribution channel, not the custodian
- MMF and call account values update daily (based on the fund's published NAV)
- FD interest is calculated on a pro-rata basis and credited at maturity
- T-Bill bids are submitted to CBK's auction system via PayMo's primary dealer partner — the user sees the auction results (allotted or not, at what rate) after the auction
- All investment transactions create ledger entries: "Investment (asset) +KES X, Cash -KES X" and "Interest Income +KES Y, Investment +KES Y"
- Withholding tax on interest (15% in Kenya) is automatically deducted and remitted to KRA — the user sees the net amount

**Reason this section exists:**
SMEs in Kenya leave billions of shillings in current accounts earning 0–2% interest because they don't have the time, knowledge, or access to invest. A business with KES 2M sitting idle for an average of 15 days per month is losing KES 16,500/month (at 13% MMF rate) — that's KES 198,000/year in free money they're not earning. This section makes investing as easy as a few clicks: move KES 1M from the bank to MMF, earn 13%, withdraw when you need it. The auto-invest rules (linked to sweep rules) make it completely passive: the business doesn't even need to think about it. The FD and T-Bill options serve businesses with larger, more predictable cash positions who want higher yields. The tax handling (automatic withholding) removes the compliance burden. This section transforms Cash & Accounts from a "see your money" page to a "grow your money" page.

---

## Section 3.8 — Account Statements & Reconciliation

**What it contains:**
The tools to generate, view, and reconcile account statements — ensuring that what PayMo thinks happened matches what the bank says happened. This is the accountant's favorite section.

**Statement Generation:**
- Select account: any connected bank account, M-Pesa account, or virtual account
- Select period: preset (This Month, Last Month, This Quarter, This Year, Custom Range)
- Select format: PDF (formatted like a bank statement, with business branding), CSV (for import into other systems), Excel (with formulas)
- "Generate" → downloadable file with: account details, period, opening balance, all transactions (date, description, reference, debit, credit, running balance), closing balance, and a digital signature/timestamp

**Bank Reconciliation Interface:**
- The core reconciliation tool: match PayMo's internal ledger entries against the bank's transaction records
- **Two-panel view**: Left panel = PayMo transactions (from the ledger), Right panel = Bank transactions (from Open Banking or uploaded statement)
- **Auto-matching engine**: the system automatically matches transactions where:
  - Same amount, same date (or ±1 day for settlement delays), same reference
  - A PayMo-initiated payment (e.g., bulk disbursement) matches a bank debit of the same amount
  - A received M-Pesa Paybill payment matches a bank credit
- Auto-matched items are shown in green with a "✓ Matched" badge and hidden from the active workspace (toggle to show)
- **Unmatched items** remain in the workspace for manual matching:
  - PayMo side: ledger entries with no corresponding bank transaction (could be outstanding cheques, pending transfers, or errors)
  - Bank side: bank transactions with no corresponding PayMo entry (could be bank fees, interest, direct debits the user forgot to record, or errors)
- **Manual matching**: the user selects one item from each panel and clicks "Match" — enters a reason if the match isn't obvious (e.g., "Bank fee of KES 500 matches to 'Bank Charges' expense category")
- **Create from unmatched**: if a bank transaction has no PayMo entry, the user can "Create ledger entry" directly from the reconciliation screen — pre-fills the amount, date, and description from the bank transaction, and the user selects the category
- **Reconciliation summary**: at the bottom, a balance comparison: "PayMo ledger balance: KES 1,000,000. Bank statement balance: KES 998,500. Difference: KES 1,500 (2 unmatched bank fees + 1 outstanding cheque)."

**Reconciliation Status Dashboard:**
- Per-account reconciliation status: "KCB Current: Reconciled as of Mar 25, 2025 ✓" or "Equity USD: Last reconciled Feb 28, 2025 — 25 days behind ⚠"
- Overdue reconciliation alert: "You haven't reconciled M-Pesa in 14 days. 234 unmatched transactions."
- Reconciliation streak: "You've reconciled every month for 6 months in a row" — gamification for good financial hygiene

**Discrepancy Resolution:**
- If reconciliation reveals a discrepancy that can't be resolved by matching (e.g., the bank shows a debit that the business didn't authorize):
  - "Flag as discrepancy" action: creates a dispute ticket (links to Support & Disputes page) with all the details
  - "Contact bank" button: generates a pre-written email/letter to the bank with the transaction details and the discrepancy — the business just needs to send it

**Detailed information & data points:**
- Reconciliation is typically done monthly (month-end close process) but can be done daily or weekly for businesses with high transaction volumes
- The auto-matching engine uses fuzzy matching: amounts within KES 10 (to account for bank fees that are separate line items), dates within ±3 business days, and reference number partial matches
- For M-Pesa: the reconciliation is usually simpler because PayMo initiates and receives the transactions directly — the "bank" is M-Pesa itself, and the data is real-time
- For bank accounts: reconciliation quality depends on whether Open Banking is connected (real-time, clean data) or statements are manually uploaded (requires parsing, more unmatched items)
- Reconciliation status is tracked per-account and per-period — once a period is marked "Reconciled", it's locked (same as payroll locking) and any changes require an "Unreconcile" action with approval
- The reconciliation summary feeds the Month-End Close wizard on the Bookkeeping & Taxes page

**Reason this section exists:**
Reconciliation is the bedrock of financial integrity. Without it, the business owner doesn't know if their books are right. A KES 50,000 discrepancy could be a bank error (recoverable), a missed entry (fixable), or fraud (critical). This section makes reconciliation accessible to non-accountants: the two-panel view is intuitive (match left to right), the auto-matching handles 80–90% of the work, and the manual matching handles the rest. The statement generation means the business can produce bank-quality statements for auditors, lenders, or partners without waiting for the actual bank. The discrepancy resolution path ensures that real problems (unauthorized debits) don't get lost in the "I'll deal with it later" pile. For the accountant, this section is the difference between a 3-hour monthly reconciliation (manual) and a 20-minute one (auto-matched).

---

## Section 3.9 — Fund Transfers (Internal & External)

**What it contains:**
The movement interface — transferring money between the business's own accounts (internal) and to external parties (external). This is distinct from Pay Suppliers (which is for paying suppliers) and focuses on the mechanics of moving money between accounts.

**Internal Transfers (Between Own Accounts):**
- Simple form: From Account (dropdown of all owned accounts — bank, M-Pesa, virtual), To Account (same dropdown, excluding the "From"), Amount, Reference/Notes
- Real-time balance display for both source and destination
- Validation: "Source available balance: KES X. After transfer: KES Y." — blocks if insufficient
- Execution: instant for virtual-to-virtual, near-instant for M-Pesa-to-virtual, T+0 to T+1 for bank-to-bank (depending on bank)
- "Schedule" option: schedule the transfer for a future date/time (links to recurring/scheduled payment logic)
- **Quick transfer buttons**: "Move all from M-Pesa to Bank" (sweeps entire M-Pesa balance), "Top up M-Pesa float with KES X from KCB"

**External Transfers (To Other People/Businesses):**
- Form: To (name + bank details or M-Pesa number), Amount, Method (Bank Transfer / M-Pesa B2C / PesaLink), Purpose/Reference
- This overlaps with "Pay Suppliers" Single Payment — the system detects if the payee is in the supplier directory and offers to route to Pay Suppliers instead (for proper approval workflow and ledger categorization)
- For non-supplier external transfers (e.g., loan to a friend, personal transfer from business account — not recommended but happens): warns "This is not a business expense. Categorize as: Owner Drawing / Inter-company Loan / Other"

**Transfer Templates (Frequent Transfers):**
- "Save as template" option after any transfer: "Top up M-Pesa float — KES 100K from KCB"
- Templates appear as one-click buttons: "Top Up Float KES 100K" → confirms and executes
- Scheduled templates: "Repeat this transfer every Monday at 9 AM"

**Transfer History:**
- Table of all transfers: Date, From, To, Amount, Method, Status, Reference, Linked To (if it was triggered by a sweep rule, recurring payment, or manual)
- Filterable by type (internal/external), method, date range

**Bulk Internal Transfer:**
- For complex scenarios (e.g., month-end: move money from 5 virtual accounts to 1 bank account): select multiple source accounts, enter amounts or "Move all", select destination, execute as a batch

**Detailed information & data points:**
- Internal transfers between PayMo-owned accounts (virtual-to-virtual, float-to-virtual) are instantaneous and fee-free
- Internal transfers involving bank accounts depend on the bank's processing time: most Kenyan banks process internal transfers (same bank) instantly and external transfers (EFT/RTGS) in T+0 to T+1
- M-Pesa float top-ups use PayMo's internal rails — the user doesn't see the underlying mechanics, just the result

- Internal transfers create paired ledger entries: "Bank Account A -KES X, Bank Account B +KES X" — no P&L impact, only balance sheet movement
- For multi-business: internal transfers between different businesses in the portfolio are treated as inter-company transactions — they appear on both businesses' ledgers and are eliminated in the consolidated portfolio financials
- Transfer limits: some channels have daily/monthly limits (CBK guidelines for bank transfers, Safaricom limits for M-Pesa) — the system enforces these and shows remaining limits

**Reason this section exists:**
Moving money between accounts is a constant activity. The business owner wakes up, checks M-Pesa, sees KES 200K from weekend collections, and wants to move it to the bank. Without a dedicated, fast transfer interface, they either (a) use the bank's own app (breaking the single-pane-of-glass experience), (b) use M-Pesa's "Send Money" which moves it to a personal account not the business bank, or (c) withdraw as cash and deposit (literally walking money across town). This section makes "Move KES 200K from M-Pesa to KCB" a 10-second action inside PayMo. The quick-transfer buttons ("Move all from M-Pesa to Bank") are the power-user shortcuts for a daily habit. The template system handles recurring transfers (e.g., weekly float top-up) without creating full "recurring payment" records in the Pay Suppliers page — it's a simpler mechanism for internal movements. The external transfer routing to Pay Suppliers ensures that business payments always go through the proper approval and categorization workflow, even if the user starts the action here.

---

## Section 3.10 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent bottom/top sticky bar for the Cash & Accounts page, providing instant access to the most frequent cash management actions.

**Actions:**
1. **"Transfer Money"** — opens Internal/External Transfer form (Section 3.9) with "Internal" pre-selected
2. **"Convert Currency"** — opens FX Conversion modal (Section 3.4)
3. **"View Forecast"** — smooth-scrolls to or opens a modal of the Cash Flow Forecast (Section 3.5) for the next 7 days
4. **"Create Virtual Account"** — opens the VA creation modal (Section 3.3) with the template picker
5. **"Invest Cash"** — opens the Investment products list (Section 3.7) showing MMF (the most common quick action)
6. **"Reconcile"** — jumps directly to the Bank Reconciliation interface (Section 3.8) for the account with the oldest unreconciled period
7. **"Download Statement"** — opens a quick-pick modal: select account + "This Month" → generates and downloads PDF instantly

**Context-aware behavior:**
- If the Total Cash balance dropped >10% today, the bar briefly flashes an amber indicator with a tooltip: "Cash down KES X today. Check forecast."
- If an account has a low-balance health indicator (from Section 3.1), the "Transfer Money" action defaults the "To" field to that specific low-balance account.
- If FX rate alert is triggered (from Section 3.4), the "Convert Currency" button shows a small green/red arrow indicating the rate movement direction.

**Reason this section exists:**
Consistency across the superapp is key to usability. If Get Paid and Pay Suppliers have quick action bars, Cash & Accounts must have one too — the user's muscle memory adapts to the bar's location, and its absence on one page feels like a broken pattern. The actions selected here reflect the distinct nature of this page: it's about *managing* money, not *earning* or *spending* it. "Transfer" and "Convert" are the highest-frequency actions. "View Forecast" provides instant access to forward-looking intelligence without scrolling. "Download Statement" is the accountant's daily request — making it a one-click action saves the finance manager from navigating through the Reconciliation section just to get a PDF.

---
---




# PAGE 4: BOOKKEEPING & TAXES (`bookkeeping-taxes.html`)

**Absorbs:** Financial Reporting (3.8) + expanded to include the General Ledger, AI Receipt Capture, and full KRA Statutory Compliance (from doc sections 5.4 & 5.5)
**Zone:** 📦 Your Business
**Mental model for the user:** *"My books write themselves, and my taxes file automatically. I never have to worry about KRA or my accountant again."*
**Core thesis:** This is the most critical page for long-term retention. Invoicing and payments are table stakes; automated bookkeeping and tax compliance are the moat. If a business's ledger updates itself from every M-Pesa payment, every bank transfer, every receipt photo — and if KRA VAT, PAYE, and NSSF returns are pre-filled and filed with one click — the business will never leave. This page turns the most hated, most procrastinated tasks in business (bookkeeping and tax filing) into a passive, invisible process.

---

## Section 4.1 — General Ledger & Chart of Accounts

**What it contains:**
The absolute foundation of the business's financial records. The General Ledger (GL) is the double-entry accounting engine that records every financial event. The Chart of Accounts (CoA) is the categorized list of accounts (Assets, Liabilities, Equity, Income, Expenses) that structure the GL. The user rarely interacts with this section directly — it's the "engine room" — but it must be accessible, viewable, and configurable for accountants and advanced users.

**Chart of Accounts Viewer/Editor:**
- Hierarchical tree view of all accounts, grouped by type:
  - **Assets** (Current: Bank, M-Pesa, Accounts Receivable, Inventory, Cash on Hand. Non-Current: Equipment, Vehicles, Deposits)
  - **Liabilities** (Current: Accounts Payable, PAYE Payable, VAT Payable, Loans. Non-Current: Long-term Loans, Mortgages)
  - **Equity** (Owner's Capital, Retained Earnings, Owner's Drawings, Shares Issued)
  - **Income** (Sales, Service Revenue, Interest Income, FX Gains, Other Income)
  - **Expenses** (Cost of Goods Sold, Salaries, Rent, Utilities, Transport, Marketing, Depreciation, Bank Charges, FX Losses, Tax & Licenses)
- Each account shows: Account Code (e.g., 1001, 4010), Account Name, Type, Current Balance, Sub-account count (if hierarchical)
- **Expand/Collapse** to see sub-accounts (e.g., "Bank" expands to "KCB Current", "Equity USD", "M-Pesa")
- **Actions per account**: View Ledger Entries, Edit Name/Code, Add Sub-account, Make Inactive (hides from selections but retains history), Delete (only if zero balance and no history)

**Add/Edit Account:**
- "New Account" modal: Code (auto-suggested based on pattern, editable), Name, Type (dropdown), Parent Account (for sub-accounts), Description, Tax Relevance (is this account tracked for VAT? e.g., "VAT Input", "VAT Output")
- Validation: prevents duplicate codes, prevents creating a sub-account under an incompatible parent (can't put an Expense under Assets)

**Pre-Built Chart of Accounts Templates:**
- On business creation (or in Settings), the user selects a template:
  - **Standard Trading**: for shops, retailers, distributors (heavy on COGS, Inventory, Sales)
  - **Service Business**: for consultants, agencies, SaaS (heavy on Service Revenue, Salaries, Professional Fees)
  - **Property/Rental**: for landlords (Rent Income, Property Maintenance, Mortgage Interest, Security Deposits)
  - **NGO/Non-Profit**: for charities, foundations (Grants Income, Program Expenses, Admin Costs, Restricted Funds)
  - **SACCO**: for savings and credit cooperatives (Member Deposits, Loans Issued, Interest Income, Dividends)
  - **Blank**: start from scratch (for accountants who want full control)
- Selecting a template pre-populates the CoA with ~30–50 standard accounts. The user can add/remove as needed.

**General Ledger Transaction Viewer:**
- Table of every double-entry transaction in the system: Date, Journal ID, Description, Account (Debit), Debit Amount, Account (Credit), Credit Amount, Reference (links to the source: Invoice #, Payment #, Sweep #), Created By (user or system/auto)
- Filters: date range, account, journal type (Sales, Payment, Payroll, Sweep, Manual, Adjustment), reference
- Search: by description, reference, amount
- **Journal Entry Detail**: click a Journal ID to see the full entry: "Journal #J-2025-0456: Payroll for March 2025. Debit: Salaries KES 2M, PAYE KES 300K, NSSF KES 100K. Credit: Cash KES 1.6M, PAYE Payable KES 300K, NSSF Payable KES 100K."
- **Manual Journal Entry**: for accountants who need to record adjustments (depreciation, accruals, corrections). Opens a multi-line form: Date, Description, multiple Debit lines (Account + Amount), multiple Credit lines (Account + Amount). Total debits MUST equal total credits (hard validation). Requires approval if above threshold. Reason/Supporting document required.

**Detailed information & data points:**
- The GL is the single source of truth. Every action on Get Paid, Pay Suppliers, and Cash & Accounts writes to the GL automatically. The user never has to manually enter a routine transaction.
- Double-entry is enforced at the database level: no transaction can be saved if debits ≠ credits
- Account balances are calculated in real-time from the GL (not stored separately) to prevent synchronization issues
- The CoA supports up to 4 levels of hierarchy (e.g., Assets → Current Assets → Bank → KCB Current)
- Account codes are alphanumeric and up to 20 characters, supporting various numbering schemes (1000-series for Assets, 2000 for Liabilities, etc.)
- For multi-business: each business has its own CoA and GL. The Portfolio page can generate a consolidated CoA and GL by mapping accounts across businesses
- Audit trail: every GL entry has an immutable "source" tag (auto-generated from PayMo action, manual entry by User X, API import, etc.)

**Reason this section exists:**
The ledger is the spine of the superapp. Without it, PayMo is just a payment gateway with a nice UI. With it, PayMo is an accounting system. The user doesn't need to know what "double-entry" means — the system handles it. But the accountant *does* need to see the GL, verify the entries, and make manual adjustments for things the system can't auto-detect (like depreciation or accruals). The pre-built CoA templates solve the "I don't know accounting" problem: a shopkeeper selects "Standard Trading" and gets a professional chart of accounts without knowing the difference between a balance sheet and a P&L. The hierarchical view makes a potentially overwhelming list of accounts navigable. The manual journal entry capability ensures that PayMo doesn't lock out professional accountants — they can still do their job, just with less drudgery because 95% of entries are already done.

---

## Section 4.2 — Automated Bookkeeping Engine & AI Receipt Capture

**What it contains:**
The "magic" layer — the rules and AI that translate raw transaction data (M-Pesa messages, bank feeds, receipt photos) into structured ledger entries without human intervention. This section is both a settings/configuration area and a visualization of the engine's work.

**Transaction Categorization Dashboard:**
- Shows the status of recent transactions: "Last 100 transactions: 95 auto-categorized, 3 pending review, 2 uncategorized"
- **Auto-categorized** (green): "M-Pesa from John Mwangi → Debit: M-Pesa KES 5,000 / Credit: Accounts Receivable KES 5,000 (Matched to Invoice #INV-0234)"
- **Pending Review** (amber): "Bank debit: KES 15,000 to 'EQUITY BK TCP PAYBILL 123456'. AI suggests: Rent Expense. Confidence: 78%. [Confirm] [Change Category] [Skip]"
- **Uncategorized** (red): "Bank debit: KES 3,500 to 'UNKNOWN REF'. No AI suggestion. [Categorize Manually]"
- The user can bulk-confirm pending reviews: "Confirm all high-confidence (>85%) suggestions" button

**AI Receipt Capture:**
- **Upload interface**: camera button (mobile) or file upload (desktop) for receipt photos/PDFs
- **Processing flow**: Image → OCR (extracts vendor, date, amount, tax) → AI categorization (suggests expense account) → Ledger entry draft
- **Review queue**: shows captured receipts with extracted data and AI suggestion. User confirms or corrects. On confirm: "Expense: KES 3,500. VAT Input: KES 483. Net Expense: KES 3,017. Ledger entry created."
- **Bulk capture**: upload 10 receipts at once. OCR processes all, queues them for review.
- **Email forwarding**: the business gets a unique email address (e.g., `receipts@techsol.paymo.biz`). Forward any email receipt (Java House, Amazon, flights) to this address, and the system extracts the receipt from the email body/attachment and queues it.
- **WhatsApp receipt forwarding**: send a receipt photo to a dedicated PayMo WhatsApp number, and it processes the same way.

**Categorization Rules Engine:**
- Beyond AI, the user can set explicit rules: "If bank description contains 'KPLC', categorize as 'Utilities → Electricity'" or "If M-Pesa reference starts with 'Rent-', categorize as 'Rent Expense' and tag with the tenant name"
- Rules run before AI: if a rule matches, the AI suggestion is bypassed
- Rule builder: Condition (field, operator, value) → Action (category, tag, split)
- **Split transactions**: "If amount > KES 100,000 and description contains 'Fuel', split 80% to 'Vehicle Fuel' and 20% to 'Staff Transport Allowance'"

**Learning & Improvement:**
- The AI model learns from user corrections: if the user changes "Meals" to "Client Entertainment" 3 times for similar receipts, the AI starts suggesting "Client Entertainment" for that pattern
- "Categorization accuracy" metric: "Over the last 30 days, you confirmed 94% of AI suggestions without changes. Accuracy is improving."

**Detailed information & data points:**
- OCR is optimized for Kenyan receipts: handles thermal paper fade, skewed angles, handwritten amounts, KRA VAT rounding (to the nearest whole shilling), and multiple currencies on the same receipt
- The categorization engine processes transactions in real-time as they arrive (M-Pesa callback, bank feed sync, receipt upload) — there is no batch processing delay
- AI confidence scores: >90% = auto-confirm (optional setting, off by default for safety), 70–90% = pending review, <70% = uncategorized
- For multi-business: receipt capture automatically assigns to the current business context. If the user switches businesses, receipts route to that business's ledger
- Receipt images and extracted data are retained for 7 years (KRA requirement) and are linked to the ledger entry for audit trail purposes

**Reason this section exists:**
Bookkeeping is the #1 task businesses outsource or abandon because it's tedious. A shopkeeper with 20 transactions a day spends 2 hours every evening recording them in a book or Excel. This section eliminates that 2 hours entirely. The M-Pesa payment comes in, the system matches it to the invoice, and the ledger updates — zero clicks. The receipt capture solves the "I have a drawer full of crumpled receipts" problem: take a photo, the AI reads it, the user taps "Confirm", done. The email/WhatsApp forwarding makes it even more frictionless — the business owner doesn't even need to open PayMo to capture a receipt, they just forward the email they already received. The rules engine handles the predictable (KPLC is always electricity, Safaricom is always airtime/data) so the AI only needs to handle the edge cases. Over time, the system gets smarter and the user's workload approaches zero. This is the "superapp" promise made real: the books write themselves.

---

## Section 4.3 — Profit & Loss (P&L) & Balance Sheet

**What it contains:**
The two core financial statements that tell the business owner the most important things: "Am I making money?" (P&L) and "What am I worth?" (Balance Sheet). These are auto-generated from the General Ledger — the user never manually constructs them.

**Profit & Loss Statement (Income Statement):**
- **Period selector**: This Month, This Quarter, This Year, Last Month (for comparison), Last Year (for comparison), Custom Range
- **Layout**: Standard P&L format
  - **Revenue**: Sales, Service Income, Other Income → **Total Revenue**
  - **Cost of Goods Sold (COGS)**: if applicable (for trading businesses using Inventory) → **Gross Profit** (Total Revenue - COGS)
  - **Operating Expenses**: grouped by category (Salaries, Rent, Utilities, Marketing, Transport, Professional Fees, Depreciation, etc.) → **Total Operating Expenses**
  - **Operating Profit** (Gross Profit - Total Operating Expenses)
  - **Other Income/Expenses**: Interest, FX Gains/Losses → **Net Profit Before Tax**
  - **Tax Expense**: estimated income tax → **Net Profit**
- **Comparison view**: show current period vs. previous period side-by-side with variance (KES and %)
- **Budget vs. Actual** (if budgets are set up in Settings): show budgeted amounts alongside actuals with favorable/unfavorable indicators
- **Drill-down**: click any line item (e.g., "Rent: KES 50,000") to see the underlying transactions that make up that number
- **Export**: PDF (formatted for sharing with partners/bankers), Excel (with formulas for further analysis), CSV

**Balance Sheet (Statement of Financial Position):**
- **As at date**: typically month-end (auto-calculated from the GL)
- **Layout**:
  - **Assets**: Current Assets (Cash, Accounts Receivable, Inventory, Prepayments) + Non-Current Assets (Equipment, Vehicles, Accumulated Depreciation) → **Total Assets**
  - **Liabilities**: Current Liabilities (Accounts Payable, Tax Payables [VAT, PAYE, NSSF], Short-term Loans) + Non-Current Liabilities (Long-term Loans, Mortgages) → **Total Liabilities**
  - **Equity**: Owner's Capital, Retained Earnings (cumulative profit/loss), Current Year Earnings (links to P&L Net Profit) → **Total Equity**
  - **Check**: Total Assets = Total Liabilities + Total Equity (must always balance — shown as a green "✓ Balanced" badge)
- **Drill-down**: same as P&L — click any line to see underlying transactions
- **Trend view**: show balance sheet for the last 6 months in a condensed format to see how assets/liabilities are trending
- **Export**: same formats as P&L

**Financial Health Ratios (Auto-calculated from P&L + Balance Sheet):**
- **Profitability**: Gross Margin (%), Net Margin (%), Return on Assets (%), Return on Equity (%)
- **Liquidity**: Current Ratio (Current Assets / Current Liabilities), Quick Ratio ((Current Assets - Inventory) / Current Liabilities)
- **Efficiency**: Accounts Receivable Days (DSO), Accounts Payable Days (DPO), Inventory Days
- **Leverage**: Debt-to-Equity Ratio
- Each ratio shows: current value, trend arrow (vs. last period), industry benchmark (if available), and a simple interpretation: "Current Ratio of 1.8 is healthy (above 1.5). You can comfortably pay your short-term obligations."

**Detailed information & data points:**
- P&L and Balance Sheet are generated on-the-fly from GL balances — no "close" process is required to view them (though a formal Month-End Close locks the numbers, Section 4.7)
- The P&L uses the "accrual basis" by default (revenue recognized when invoiced, expenses recognized when incurred) because this is KRA's preferred method for VAT-registered businesses. A "cash basis" toggle is available for small businesses (turnover tax bracket) where revenue is recognized only when cash is received
- COGS is automatically calculated if the Inventory & Stock page is used (Opening Stock + Purchases - Closing Stock). If inventory is not used, COGS is zero and the P&L shows a service-format (Revenue - Expenses = Profit)
- Depreciation is calculated based on asset entries in the system (if the business records fixed assets) using KRA-standard rates: 12.5% for computers, 25% for vehicles, etc. If not tracked, depreciation is zero and the user can add it via manual journal entry
- For multi-business: P&L and Balance Sheet are per-business by default. The Portfolio page shows consolidated statements with inter-company eliminations

**Reason this section exists:**
"Am I making money?" is the question every business owner asks, and most can't answer accurately. They look at their M-Pesa balance — if it's high, they think they're profitable. If it's low, they think they're losing money. Neither is necessarily true (high balance could be from a loan; low balance could be because they bought inventory). The P&L answers the question correctly by matching revenue to expenses regardless of when cash moved. The Balance Sheet answers "What is my business worth?" — most SME owners have no idea what their net assets are. The ratio analysis translates accounting numbers into business intelligence: a Current Ratio of 0.8 means "you can't pay your bills" even if the P&L shows a profit. The drill-down feature is critical for trust: when the P&L says "Rent: KES 50,000", the owner clicks and sees the actual KCB transfer to the landlord — no black box. The export to PDF means the owner can take these statements to a bank for a loan, to KRA for an audit, or to an investor — professional-grade output from a platform they already use daily.

---

## Section 4.4 — Tax Dashboard & KRA Liability Tracker

**What it contains:**
A real-time view of every tax obligation the business has — how much is owed, to whom, when it's due, and whether it's been filed and paid. This is the "never miss a tax deadline again" command center.

**Tax Liability Summary Cards (Top):**
- **VAT Payable**: KES X (due 20th of next month) — with status: "On track to pay" (green) / "At risk" (amber — not enough cash set aside) / "Overdue" (red)
- **PAYE Payable**: KES Y (due 9th of next month) — same status logic
- **NSSF Payable**: KES Z (due 9th of next month)
- **SHIF Payable**: KES A (due 9th of next month)
- **Withholding Tax (WHT) Payable**: KES B (varies by payment) — accumulated from supplier payments
- **Turnover Tax**: KES C (due 20th of next month) — only shown if the business is below the VAT registration threshold
- **Corporate Tax Installments**: KES D (due 20th of each quarter) — only for incorporated companies
- **Total Tax Liability**: KES (X+Y+Z+A+B+C+D) — the scary number, made manageable by seeing it broken down

**Tax Calendar:**
- A visual calendar showing all tax deadlines for the year:
  - 9th: PAYE, NSSF, SHIF
  - 20th: VAT, Turnover Tax, Corporate Tax Installments
  - Each deadline shows the estimated amount (based on current month's data) and a countdown: "VAT due in 12 days. Estimated: KES 240,000."
  - Past deadlines show status: "March 20 VAT: Filed ✓ Paid ✓" or "March 20 VAT: Filed ✓ Paid ✗ — Overdue by 5 days. Penalty accruing."
  - Integration with device calendar: "Add to Google Calendar / Apple Calendar" button for each deadline

**Tax Reserve Tracking:**
- If the business set up the "Tax Reserve Auto-Save" sweep rule (Cash & Accounts, Section 3.6), this section shows:
  - "Tax Reserve Virtual Account balance: KES X"
  - "Total tax liability: KES Y"
  - "Surplus / Deficit: KES (X - Y)" — green if surplus (enough to pay all taxes), red if deficit
  - "Top up tax reserve by KES Z to cover this month's liabilities" — with a one-click transfer action

**VAT Reconciliation:**
- A sub-section specifically for VAT because it's the most complex:
  - **VAT Output (Sales VAT)**: total VAT charged on invoices this month, broken down by tax rate (16% standard, 0% exempt)
  - **VAT Input (Purchase VAT)**: total VAT on business expenses and purchases (extracted from receipts, supplier invoices, and WHT certificates)
  - **Net VAT Payable**: Output - Input = KES X (if positive, pay to KRA. If negative, carry forward to next month or claim refund)
  - **VAT on bad debts**: if an invoice was written off as uncollectible, the VAT on that invoice can be reclaimed — shown here
  - **VAT on imports**: if the business imports goods, customs VAT is tracked here as input VAT

**WHT Tracking:**
- Table of all withholding tax deductions: Date, Payee, Gross Amount, WHT Rate, WHT Amount, Type (Withholding VAT, Withholding CIT, WHT on management fees, etc.)
- Each WHT amount is a credit against the payee's tax liability (they use it as a tax credit) and a remittance obligation for the business
- "Generate WHT Certificates" button: creates PDF certificates for each payee — required by KRA, usually a massive pain point for businesses

**Penalty & Interest Calculator:**
- If a tax payment is late, the system calculates: Penalty (5% of tax due, minimum KES 1,000) + Interest (1% per month on the outstanding tax + penalty)
- Shows: "March VAT was due April 20. Today is April 28. Penalty: KES 12,000. Interest: KES 540. Total now owed: KES 257,540."
- "Pay now to stop interest accruing" button

**Detailed information & data points:**
- Tax liability amounts are calculated in real-time from the GL: VAT from invoice line items, PAYE from payroll runs, NSSF/SHIF from payroll runs, WHT from payment processing
- The system uses KRA's actual tax calendar (including extensions when KRA announces them, e.g., during COVID or system downtime) — updated via platform notifications
- VAT calculation handles KRA's specific rules: tax-inclusive vs. tax-exclusive pricing, rounding to the nearest whole shilling, exempt vs. zero-rated vs. standard-rated items
- For turnover tax: the system checks if the business's gross revenue is below the KES 5M threshold (current threshold) and automatically suggests turnover tax instead of VAT + corporate tax — "Your revenue is KES 4.2M. You qualify for Turnover Tax at 3% (KES 126,000) instead of VAT + Corporate Tax. Switch?"
- Tax reserve tracking links directly to the Virtual Account created in Cash & Accounts — it's the same account, just viewed through a tax lens here

**Reason this section exists:**
Tax fear is the single biggest source of stress for Kenyan business owners. They don't know how much they owe, when it's due, or how to calculate it. So they ignore it until KRA sends a penalty notice — and by then, the penalty + interest is more than the original tax. This section makes the invisible visible: the owner sees *today* that their VAT liability for this month is KES 240,000 due on the 20th, and they have KES 250,000 in the tax reserve. No fear, no surprise. The tax calendar with countdowns replaces the "I think VAT is due on the 20th? Or the 9th?" confusion. The VAT reconciliation (Output vs. Input) is the most valuable sub-feature: many businesses don't know they can deduct VAT on their expenses, so they overpay KRA by thousands of shillings every month. The WHT certificate generation turns a 2-day task (for a business with 50 suppliers) into a 2-minute task. The penalty calculator is the stick: *"If you don't pay today, you'll owe an extra KES 12,540 by tomorrow."*

---

## Section 4.5 — eTIMS Integration & Electronic Invoicing

**What it contains:**
The Kenya Revenue Authority's Electronic Tax Invoice Management System (eTIMS) is mandatory for all VAT-registered businesses. Every invoice must be generated through eTIMS, assigned a unique serial number, and submitted to KRA in real-time. This section manages the integration between PayMo's invoicing system and KRA's eTIMS, making compliance invisible to the user.

**eTIMS Connection Status:**
- **Status Card**: "eTIMS Status: Connected ✓" or "Disconnected ✗" or "Error: Token expired"
- **Connection details**: KRA PIN used to connect, eTIMS branch ID, device serial number (PayMo acts as a virtual device)
- **Last sync**: "Last communication with KRA: 2 minutes ago. 14 invoices submitted today."
- **Actions**: Test Connection, Re-authenticate (if token expired), Disconnect

**Invoice eTIMS Flow (Automatic — shown for transparency):**
- When an invoice is created/sent in Get Paid (Section 1.2/1.3), the system automatically:
  1. Validates invoice data against eTIMS requirements (customer PIN if >KES 100K, correct tax codes, required fields)
  2. Submits the invoice to eTIMS via API
  3. Receives the eTIMS Invoice Serial Number (ISN) and QR code
  4. Embeds the ISN and QR code into the PDF invoice that the customer receives
  5. Stores the eTIMS confirmation in the invoice record
- If submission fails (KRA system down, network error): the invoice is saved as "Pending eTIMS" and the system retries automatically. The user sees: "Invoice #INV-0256 sent to customer but eTIMS submission pending. KRA system may be slow. Will retry in 15 minutes."

**eTIMS Invoice Register:**
- Table of all eTIMS-submitted invoices: PayMo Invoice #, eTIMS Serial Number, Customer, Amount, Tax, Submission Date/Time, KRA Status (Accepted, Rejected, Pending), KRA Response Code
- Filter: by KRA status (show only rejected invoices to fix them)
- **Rejection handling**: if KRA rejects an invoice, the rejection reason is shown (e.g., "Invalid customer PIN", "Tax amount mismatch"). "Fix & Resubmit" button opens the invoice editor with the error highlighted. On fix, resubmits to eTIMS.

**Credit Notes via eTIMS:**
- When a credit note is created (from Get Paid, Section 1.7), it's automatically submitted to eTIMS as a credit note referencing the original invoice's ISN
- Same register and rejection handling as invoices

**eTIMS Reporting:**
- "Export for KRA": generates the exact file format (XML/CSV) that KRA requires for periodic reconciliation — in case KRA's system doesn't match PayMo's records
- "eTIMS vs. PayMo variance check": compares the total VAT in PayMo's ledger vs. the total VAT submitted to eTIMS. Should be zero. If not, flags the mismatched invoices.

**Daily eTIMS Health Check:**
- Automated background check: every night, the system verifies that all invoices from the previous day were accepted by eTIMS
- If any are still pending or rejected: notification to the business owner: "2 invoices from yesterday were not accepted by KRA. Fix them to avoid penalties."

**Detailed information & data points:**
- eTIMS integration uses KRA's official API (if available) or the certified third-party integrator APIs that KRA has authorized
- The eTIMS token (used for API authentication) has a limited lifespan and must be refreshed — the system handles this automatically in the background
- Customer KRA PIN is required for invoices above KES 100,000 (KRA rule) — the Invoice Wizard (Section 1.3) enforces this when eTIMS is active
- The eTIMS QR code on the invoice contains the ISN, PIN, amount, and tax — customers can scan it to verify the invoice's authenticity on KRA's portal
- For businesses NOT registered for VAT (below KES 5M threshold): eTIMS is not required, and this section shows "eTIMS is not required for your business. You're below the VAT registration threshold." with an option to enable it proactively if the business anticipates crossing the threshold
- Offline mode: if KRA's API is down (which happens frequently), PayMo queues the invoices and submits them when the API is back — the user doesn't need to do anything

**Reason this section exists:**
eTIMS is the most disruptive tax compliance change in Kenya in a decade. Businesses that don't comply face penalties of KES 10,000–1,000,000 or suspension of their KRA PIN. But the eTIMS system itself is clunky, slow, and disconnected from business workflows — businesses have to create an invoice in their system, then manually re-enter it into eTIMS, then download the eTIMS version and send it to the customer. It doubles the work. This section eliminates that work entirely: the user creates the invoice in PayMo as usual, and PayMo silently handles the eTIMS submission in the background. The invoice the customer receives already has the eTIMS serial number and QR code. The rejection handling ensures that if something goes wrong (and it will — KRA's system is not 100% reliable), the user knows immediately and can fix it without digging through eTIMS logs. The daily health check is the safety net: even if the user misses a rejection notification during the day, the nightly check catches it.

---

## Section 4.6 — Statutory Filing & Remittance Center

**What it contains:**
The actual filing and payment of taxes to KRA, NSSF, and SHIF. This goes beyond tracking liabilities (Section 4.4) to executing the filing and remittance. The goal: the user clicks one button, and the return is filed and the tax is paid — all within PayMo.

**Filing Dashboard:**
- Table of all upcoming and past filings: Tax Type, Period (e.g., "March 2025"), Due Date, Status (Not Due / Ready to File / Filed / Filed & Paid / Overdue), Amount, Actions
- "Ready to File" means the system has all the data needed and the return is pre-filled
- Color coding: green (filed & paid), amber (ready but not filed), red (overdue)

**One-Click Filing Flow (per tax type):**

*VAT Return (Form VAT 3):*
- "File VAT Return" button opens a pre-filled return:
  - Taxable supplies (standard-rated): auto-filled from invoice data
  - Zero-rated supplies: auto-filled from zero-rated invoices
  - Exempt supplies: auto-filled
  - Tax on imported goods: auto-filled (if user entered customs documents)
  - VAT on local purchases (input VAT): auto-filled from receipts and supplier invoices
  - Net VAT payable/reclaimable: auto-calculated
- User reviews: "VAT Output: KES 480,000. VAT Input: KES 240,000. Net payable: KES 240,000. Matches your Tax Dashboard."
- "Submit to KRA" button: pushes the return to KRA iTax via API. Response: "Return submitted. Acknowledgment number: XXXXX."
- "Pay VAT" button: initiates payment via PayMo (from tax reserve VA or bank account) directly to KRA's collection account. Response: "Payment of KES 240,000 initiated. KRA receipt expected in 24 hours."
- "File & Pay" does both in one click

*PAYE Return (Form P9A/P10):*
- Pre-filled from payroll data: total gross pay, total tax deducted (PAYE), personal relief, net PAYE
- Per-employee P9 data included in the return
- "Submit to KRA" + "Pay PAYE" same flow as VAT

*NSSF Return:*
- Pre-filled from payroll data: total employee contributions, total employer contributions
- "Submit to NSSF" (via NSSF's online portal or API) + "Pay NSSF"

*SHIF Return:*
- Pre-filled from payroll data: total contributions
- "Submit to SHIF" + "Pay SHIF"

**Filing History & Receipts:**
- Table of all past filings: Date Filed, Tax Type, Period, Amount Filed, Amount Paid, KRA Acknowledgment #, KRA Payment Receipt #, Status
- Download: KRA acknowledgment (PDF), Payment receipt (PDF), Filled return form (PDF) — all for the business's records and for audit

**Auto-Filing Toggle:**
- Per tax type: "Auto-file and auto-pay when due"
- If enabled: on the due date, the system automatically files the pre-filled return and initiates the payment — no user action needed
- Notification: "VAT for March 2025 was auto-filed and KES 240,000 was auto-paid from your Tax Reserve. KRA acknowledgment: XXXXX."
- Safety: auto-filing is opt-in, and the user can set a maximum amount threshold: "Auto-file only if VAT is below KES 500,000. Above that, require manual approval."

**Detailed information & data points:**
- Filing uses KRA's iTax API (where available) or screen-scraping/RPA as a fallback for tax types that don't have a stable API
- Payment to KRA uses PayMo's integration with KRA's collection accounts (via bank transfer or Paybill) — the payment reference includes the business's KRA PIN and the tax type for easy reconciliation by KRA
- KRA receipts are fetched back from KRA (via API or manual upload by the user) and stored in PayMo — the system cross-references the payment with the filing to ensure they match
- For late filings: the system calculates the penalty and includes it in the payment if auto-filing is enabled. If manual, it shows: "Filing is 5 days late. Penalty of KES X will be included. File anyway?"
- For nil returns: if the business had no activity (no sales, no payroll), the system detects this and offers "File Nil Return" — one click, no payment needed
- Filing supports amended returns: if the user discovers an error after filing, "Amend Return" re-opens the pre-filled form, allows changes, and submits an amendment to KRA

**Reason this section exists:**
Filing tax returns in Kenya is a painful, multi-step process: log into iTax (which crashes frequently), navigate to the right form, fill in the numbers (which you have to calculate manually from your records), submit, then separately log into your bank to pay the tax, then go back to iTax to confirm the payment. For a business with VAT + PAYE + NSSF + SHIF, that's 4 logins, 4 forms, 4 payments — a full day's work every month. This section reduces that to 4 clicks: "File & Pay VAT", "File & Pay PAYE", "File & Pay NSSF", "File & Pay SHIF". The pre-filled forms eliminate calculation errors. The auto-filing toggle eliminates the work entirely — the business owner wakes up on the 21st and sees "Your VAT was filed and paid yesterday." This is the single strongest retention feature in the entire platform: once a business experiences painless tax filing, they will never go back to doing it manually. The risk of leaving PayMo is the risk of going back to iTax hell.

---

## Section 4.7 — Month-End Close Wizard

**What it contains:**
A structured, guided process to "close" a financial month — locking the numbers, ensuring everything is recorded, reconciled, and filed, so the financial statements for that period are final and unchangeable. This is the bridge between day-to-day bookkeeping and formal financial reporting.

**Month-End Close Checklist:**
- The wizard presents a checklist of tasks that must be completed before the month can be closed:
  1. ☐ All transactions recorded (no uncategorized transactions remaining)
  2. ☐ Bank reconciliation completed (for all connected accounts)
  3. ☐ M-Pesa reconciliation completed
  4. ☐ All receipts captured and categorized
  5. ☐ Inventory adjusted (if using Inventory & Stock page — physical count vs. system count variance recorded)
  6. ☐ Depreciation calculated (if tracking fixed assets — auto-calculated, just needs confirmation)
  7. ☐ Accruals recorded (prepaid expenses amortized, accrued revenue/expenses recognized — manual or rule-based)
  8. ☐ Inter-company transactions eliminated (for multi-business portfolio)
  9. ☐ VAT return filed (or acknowledged as not due)
  10. ☐ PAYE/NSSF/SHIF returns filed (or acknowledged as not due)
- Each item shows its status: ✅ Done (green), ⚠️ Action Needed (amber with link to the relevant section), ❌ Not Started (grey)
- "Auto-check" button: the system checks all items it can verify automatically and updates the status

**Task Completion Actions:**
- Clicking an amber item jumps to the relevant section/task:
  - "Uncategorized transactions" → opens the Categorization Dashboard (Section 4.2) filtered to uncategorized
  - "Bank reconciliation" → opens Reconciliation (Section 3.8) for the unreconciled account
  - "VAT return filed" → opens Filing Center (Section 4.6) with the VAT return pre-filled
- Some tasks can be completed inline without leaving the wizard: "Confirm depreciation" shows the calculated amounts and a "Confirm" button

**Close Summary & Review:**
- Once all checklist items are green, the "Review & Close" button becomes active
- Review screen shows:
  - Month being closed: "March 2025"
  - Key metrics: Total Revenue, Total Expenses, Net Profit, Closing Cash Balance
  - Comparison to previous month: "Revenue up 12%, Expenses up 5%, Net Profit up 25%"
  - Any anomalies flagged: "Rent expense was KES 100,000 vs. usual KES 50,000. Reason: double payment? Review before closing."
- "Close March 2025" button (requires confirmation: "This will lock all March 2025 transactions. No changes can be made without an 'Open Period' action.")

**Post-Close:**
- Status changes: March 2025 is marked "Closed" with a lock icon
- All March transactions become read-only (viewable but not editable)
- P&L and Balance Sheet for March are now "Final" (previously they were "Preliminary")
- April's books are now the active period
- "Closed months" log: shows all closed periods with who closed them and when

**Open Closed Period (Exception Handling):**
- If an error is discovered after closing: "Request to Open March 2025" button
- Requires: reason, approver (cannot self-approve), and creates an audit trail entry
- Once opened, the user makes the correction, re-runs reconciliation, and re-closes
- The system tracks: "March 2025 was closed on Apr 5, reopened on Apr 15 by [user], corrected, re-closed on Apr 16."

**Detailed information & data points:**
- The close checklist is configurable: the business can add custom items (e.g., "Board report reviewed", "Physical stock take completed") or remove items that don't apply (e.g., no inventory = remove inventory task)
- The wizard uses the same state machine pattern as other workflows: Open → In Progress → Pending Review → Closed
- For multi-business: month-end close can be run per-business or for the entire portfolio. Portfolio close requires all individual businesses to be closed first
- The anomaly detection (flagging unusual expenses) uses a simple statistical model: if a line item is >2 standard deviations from the 6-month average, it's flagged
- Closing a period does NOT delete or archive data — all transactions remain fully accessible and searchable. It only prevents modifications

**Reason this section exists:**
Without a formal close process, a business's financials are always "preliminary" — anyone can go back and change a transaction from 3 months ago, which changes the P&L and Balance Sheet retroactively. This makes the financial statements unreliable for decision-making, for banks, and for KRA. The month-end close creates a "point in time" snapshot that is final and trustworthy. The checklist ensures nothing is forgotten: no uncategorized transactions, no unreconciled banks, no unfiled taxes. The anomaly detection catches errors before they're locked in (the double rent payment example). The "open closed period" workflow acknowledges that mistakes happen, but makes it painful enough (requires approval, creates an audit trail) to discourage casual reopening. For the accountant, this wizard replaces the spreadsheet checklist they currently use to manage month-end.

---

## Section 4.8 — Custom Reports & Analytics Builder

**What it contains:**
Beyond the standard P&L and Balance Sheet, businesses need custom views of their financial data. This section provides a flexible report builder and a library of pre-built reports for common needs.

**Pre-Built Report Library:**
- **Sales by Customer**: table showing each customer's total purchases, outstanding balance, and payment behavior — links to Customers & CRM
- **Sales by Product/Service**: if Products & Store is used, shows each product's revenue, quantity sold, and margin
- **Expense by Category**: donut chart + table of expenses grouped by category with month-over-month trends
- **Expense by Supplier**: table showing total paid to each supplier — links to Supplier Directory
- **Cash Flow Statement** (indirect method): auto-generated from GL data — Operating, Investing, Financing activities
- **Aged Receivables Summary**: same data as Get Paid's aging section, but in a formal report format suitable for management
- **Aged Payables Summary**: same for payables
- **Tax Summary**: VAT, PAYE, NSSF, SHIF, WHT — all periods, all amounts, all statuses — in one report
- **Budget vs. Actual**: if budgets are set up, shows planned vs. actual for each category with variance analysis
- **Trail Balance**: the accountant's fundamental report — lists all accounts and their debit/credit balances at a point in time

**Custom Report Builder:**
- "Build Report" button opens a visual builder:
  - **Data source**: select from GL accounts, transaction fields, customer fields, supplier fields, product fields
  - **Dimensions**: group by (customer, supplier, category, date, product, etc.)
  - **Metrics**: sum, count, average, min, max of any numeric field
  - **Filters**: date range, account range, amount range, customer/supplier selection, status
  - **Sort**: by any metric ascending/descending
  - **Visualizations**: table (default), bar chart, line chart, pie chart, donut chart
- Example: "Show me total expenses by category for Q1 2025, as a bar chart, sorted by amount descending, excluding rent" — buildable in 30 seconds
- **Save**: save custom reports with a name (e.g., "Q1 Expense Analysis") for re-use. They appear in the report library
- **Schedule**: "Run this report on the 5th of every month and email it to [recipients]"

**Report Output & Sharing:**
- Every report (pre-built or custom) can be:
  - Viewed on-screen with interactive charts (hover for details, click to drill down)
  - Exported as PDF (formatted, branded, with headers/footers)
  - Exported as Excel (with data in a flat table, pivot-ready)
  - Exported as CSV (for import into other systems)
  - Shared via link: generates a read-only URL that can be shared with partners, investors, or auditors — with optional password protection and expiry date
  - Scheduled for automatic delivery via email

**Detailed information & data points:**
- The report builder queries the GL and associated data (customers, suppliers, products) in real-time — no pre-computation needed for standard reports. For complex custom reports on large datasets, the system may queue the report and notify the user when ready
- Pre-built reports are maintained by PayMo and updated when new features are added (e.g., when Inventory is launched, a "Inventory Valuation" report is added to the library)
- Scheduled reports are executed by the server's scheduler and emailed as PDF attachments
- Shared links use a secure token system — the data is not publicly accessible, only via the unique tokenized URL
- For multi-business: reports can be scoped to one business or consolidated across the portfolio. Custom reports have a "Business" filter that defaults to the current business but can be set to "All"

**Reason this section exists:**
Standard financial statements don't answer every question. "Which of my customers generates the most profit, not just the most revenue?" requires a custom report that factors in COGS and direct expenses per customer. "How have my marketing expenses trended vs. sales revenue over the last 12 months?" requires a custom chart. Without a report builder, the business exports data to Excel and builds pivot tables — which works but breaks the superapp experience. The pre-built library covers 80% of common needs (the accountant's standard reports). The builder covers the remaining 20% (the business owner's ad-hoc questions). The sharing feature (password-protected link) is critical for businesses that need to share financials with external parties but don't want to email PDFs that can be forwarded indefinitely. The scheduled reports mean the board gets their monthly financial pack automatically on the 5th, without anyone having to remember to send it.

---

## Section 4.9 — Audit Trail & Compliance Log

**What it contains:**
The immutable, chronological record of every action that has happened in the business's financial world. This is the "security camera" for the books — it doesn't prevent actions, but it records everything so that errors, fraud, or questions can be investigated.

**Audit Log Table:**
- Columns: Timestamp (to the second), User (name + role), Action (created, edited, deleted, approved, rejected, exported, filed, etc.), Entity (what was acted on: Invoice #INV-0234, Journal #J-456, Supplier "KPLC", Settings "Approval Rules"), Details (description of what changed: "Changed amount from KES 10,000 to KES 15,000. Reason: 'Correction for extra items'"), IP Address, Device (Chrome/Windows, Safari/iOS, API)
- Filters: date range, user, action type, entity type, entity ID
- Search: by user name, entity ID, or any text in the details
- **Expand row**: shows the full before/after state of the entity (for edits/deletes): "Before: {amount: 10000, status: 'draft'}. After: {amount: 15000, status: 'sent'}."
- Pagination with virtual scrolling for high-volume businesses

**Compliance Event Log:**
- A separate, filtered view focused on compliance-relevant events:
  - Tax filings (filed, amended, paid)
  - eTIMS submissions (accepted, rejected, retried)
  - Approval chain actions (who approved what payment)
  - Month-end close/open events
  - User access changes (user added, role changed, access revoked)
  - Security events (login, logout, failed login, MFA triggered, password changed)
  - Data exports (who exported what report, in what format)
  - Settings changes (approval thresholds, payment methods, business details)

**Investigation Tools:**
- **"Trace an entity"**: enter an Invoice #, Payment #, or Journal # and see its complete lifecycle: created by X at time A, edited by Y at time B, approved by Z at time C, paid at time D, reconciled at time E
- **"User activity"**: select a user and see everything they did in a time period — useful for investigating suspected fraud or errors
- **"Anomaly detection"**: the system flags unusual patterns: "User X deleted 5 invoices on March 15. This is 5x their daily average." or "A manual journal entry was created at 2:00 AM by User Y."

**Export & Archival:**
- Export audit log: CSV (for analysis in Excel) or PDF (for formal investigation reports)
- Date range selection for export
- Digital signature on exports: "This audit log export covers [date range]. Generated on [date] at [time]. Total entries: X."
- Archival: audit logs older than 2 years are moved to cold storage (cheaper, slower to access) but remain searchable and exportable. They are never deleted.

**Detailed information & data points:**
- The audit trail is written to at the database level using database triggers or application-level middleware — it cannot be bypassed, even by PayMo's own engineers (enforced by database permissions)
- Every API call that mutates data creates an audit entry — even if the action was initiated by an integration (e.g., a payment callback from M-Pesa) — the "user" is recorded as "System: M-Pesa Callback"
- The "before/after" state is stored as a JSON diff, not a full snapshot, to minimize storage
- KRA requires businesses to keep financial records for 7 years — the audit log is part of this requirement
- For multi-business: the audit log is per-business by default. A "Global Audit" view (available only to the portfolio owner) shows all businesses' audit logs in one timeline

**Reason this section exists:**
Three reasons. First, **fraud prevention and detection**: if an employee creates a fake supplier and approves payments to themselves, the audit trail is how the business owner catches it (user X created supplier Y, user X approved payment to supplier Y, user X is the only one with access to that supplier). The "anomaly detection" flags surface this automatically. Second, **error investigation**: "Who changed this invoice amount from 50K to 500K?" — one search, instant answer. Third, **regulatory compliance**: KRA auditors, CBK examiners, and external auditors all require an audit trail. Being able to export a complete, signed audit log on demand turns a 3-week audit exercise into a 3-hour one. The immutability is non-negotiable: if the business owner can delete audit entries, the trail is worthless. This section is the foundation of trust in the platform's financial data.

---

## Section 4.10 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent sticky bar for Bookkeeping & Taxes, optimized for the accountant or business owner's most frequent financial review actions.

**Actions:**
1. **"Capture Receipt"** — opens camera/upload modal (Section 4.2) for immediate receipt photo capture
2. **"Review Uncategorized"** — jumps to the Categorization Dashboard (Section 4.2) filtered to pending items, with a count badge
3. **"View P&L"** — opens the P&L statement (Section 4.3) for the current month in a side-panel or modal (quick peek without leaving the current view)
4. **"Check Taxes"** — opens the Tax Dashboard (Section 4.4) summary cards
5. **"File Return"** — jumps to the Filing Center (Section 4.6) filtered to the next upcoming due filing
6. **"Close Month"** — opens the Month-End Close Wizard (Section 4.7) for the current period
7. **"Run Report"** — opens a quick-pick menu of the 5 most recently viewed/saved reports (Section 4.8) for instant re-run

**Context-aware behavior:**
- If there are uncategorized transactions > 10, the "Review Uncategorized" button pulses with a red badge showing the count
- If a tax deadline is within 3 days, the "File Return" button turns amber with "VAT due in 2 days"
- If the current month is not yet closed and it's already the 5th, "Close Month" shows a subtle nudge: "March not yet closed"
- If the user is an accountant (role-based), the bar emphasizes "Review Uncategorized" and "Close Month". If the user is the business owner, it emphasizes "View P&L" and "Check Taxes"

**Reason this section exists:**
The Bookkeeping & Taxes page is dense and complex — it has 9 major sections spanning ledger entries, AI categorization, financial statements, tax compliance, eTIMS, month-end close, reports, and audit logs. Without the quick action bar, the user (especially the non-accountant business owner) would be overwhelmed. The bar provides a "shortcut layer" that lets them jump to the one thing they need right now without scanning the page. The receipt capture button is the most important for day-to-day: every time the owner buys coffee for a meeting, they tap "Capture Receipt", take a photo, and it's done. The role-based context-awareness ensures the bar adapts to who's using it — the accountant and the owner have different primary tasks on this page, and the bar reflects that.

---
---


# PAGE 5: SETTINGS & SECURITY (`settings-security.html`)

**Absorbs:** Onboarding (3.12) + Settings (3.14) + Support/Disputes (3.13)
**Zone:** ⚙️ Run
**Mental model for the user:** *"How my business is set up, who has access, how secure we are, and where to get help when something goes wrong."*
**Core thesis:** This is the control room. It's not the most exciting page, but it's the most critical for trust, compliance, and operational stability. A misconfigured setting here can break payments, create security vulnerabilities, or cause KRA non-compliance. The page must be organized so that routine settings (business profile, notifications) are easy to find, while dangerous settings (approval thresholds, team roles, security) require deliberate navigation and confirmation.

---

## Section 5.1 — Business Profile & KYB (Know Your Business)

**What it contains:**
The master identity and compliance record for the business. This is the data that PayMo, KRA, CBK, and banks use to identify and verify the business. It's also the data that appears on invoices, receipts, and customer-facing communications.

**Business Identity Card (Top):**
- Business Name (legal name as per registration certificate)
- Trading Name (if different — e.g., legal name "TechSolutions Limited", trading name "TechSol")
- Business Registration Number (e.g., "PPT/2024/123456")
- KRA PIN (with verification status: "Verified ✓" or "Unverified ✗ — click to verify via iTax")
- Entity Type: Sole Proprietorship / Limited Company / Partnership / NGO / SACCO / Trust
- Registration Date
- Physical Address
- County / Sub-County
- Business Email (primary contact for PayMo and KRA)
- Business Phone (primary contact for customers and PayMo)
- Business Logo (uploaded, appears on invoices and payment pages)
- Brand Colors (primary and secondary — used for payment link pages, customer portal, invoice templates)

**KYB (Know Your Business) Compliance Status:**
- A compliance checklist required by CBK and PayMo's internal risk policies:
  - ☐ Certificate of Incorporation uploaded (PDF/image)
  - ☐ KRA PIN Certificate uploaded
  - ☐ CR12 (Business Registration Summary) uploaded — must be < 6 months old
  - ☐ Memorandum & Articles of Association (for companies) or Partnership Deed
  - ☐ Director/Owner KRA PINs uploaded
  - ☐ Director/Owner ID copies uploaded
  - ☐ Beneficial Ownership Declaration (CBK requirement — who actually owns/controls the business)
  - ☐ Business premises proof (lease agreement, title deed, or utility bill in business name)
  - ☐ Bank account verification (a small deposit was made and confirmed — proves the business owns the bank account)
- Each item shows status: ✅ Verified, ⏳ Under Review, ❌ Missing/Expired
- Overall compliance level: "Level 1 (Basic)" — limited transaction limits. "Level 2 (Full)" — full limits. "Level 3 (Enhanced)" — for high-volume businesses
- "Submit for Review" button when all documents are uploaded — sends to PayMo's compliance team for verification

**Business Details (Editable):**
- **Contact Information**: primary contact person (name, phone, email), alternative contact, business website, social media links
- **Industry & Sector**: dropdown (Retail, Technology, Agriculture, Services, Manufacturing, Real Estate, NGO, etc.) + sub-sector — used for compliance rules and benchmarking
- **Financial Year End**: month (December for most, but some businesses use March, June, etc.) — critical for tax calculations and year-end reporting
- **Tax Registration Details**:
  - VAT registration: Yes/No, VAT Registration Certificate #, Effective Date
  - PAYE registration: Yes/No
  - NSSF employer #: Yes/No, NSSF number
  - SHIF employer #: Yes/No
  - Turnover tax: applicable if below threshold (auto-detected)
- **Invoice Defaults**: default payment terms (e.g., 30 days), default invoice notes, default payment instructions text, default invoice template (Professional/Simple/Retail)

**Sector Presets:**
- When the entity type or industry is selected, the system offers a preset: "Apply [Sector] preset?"
- Example: selecting "Real Estate / Rental" preset:
  - Changes default invoice terms to "Due on 1st of month"
  - Adds "Rent Income" and "Property Maintenance" to Chart of Accounts
  - Activates "Security Deposits" tracking
  - Suggests creating a "Rent Collections" Virtual Account
  - Adds property-specific fields to the business profile
- The preset is a starting point — the user can undo any individual change

**Detailed information & data points:**
- Business profile data is used across the platform: the logo appears on invoices (Get Paid), the KRA PIN appears on tax returns (Bookkeeping & Taxes), the trading name appears on payment links (Get Paid), the brand colors appear on the customer portal
- KYB documents are stored encrypted and are only accessible to PayMo's compliance team and the business's admin users
- Document expiry tracking: CR12 expires after 6 months, some permits expire annually. The system tracks expiry dates and proactively notifies the business to re-upload: "Your CR12 expires in 30 days. Please upload a new one to maintain Level 2 compliance."
- Compliance level directly affects platform limits: Level 1 (basic KYB) = KES 300K/day transaction limit. Level 2 (full KYB) = KES 5M/day. Level 3 (enhanced) = KES 20M/day. Upgrading compliance unlocks higher limits
- For multi-business: each business in the portfolio has its own profile and KYB. The portfolio owner can view all profiles but editing requires business-level admin access

**Reason this section exists:**
The business profile is the "single source of truth" for who this business is. Without it, every invoice has wrong details, every tax return has the wrong PIN, and every payment link looks generic. The KYB section is non-negotiable for a financial platform — CBK requires PayMo to verify its customers' businesses, and the level of verification determines the transaction limits. By making the KYB checklist visual and progress-tracked, the business owner understands *why* they're uploading a CR12 (to unlock higher limits) instead of seeing it as bureaucratic red tape. The sector presets are a massive time-saver: a property manager selecting "Real Estate" preset gets a platform tailored to rentals in 2 clicks, instead of configuring 20 different settings manually. The document expiry tracking prevents the embarrassing "your compliance level was downgraded because your CR12 expired" surprise.

---

## Section 5.2 — Multi-Business Portfolio Management

**What it contains:**
The command center for users who own or manage multiple businesses (or multiple rental properties) under one PayMo login. This section manages the business list, the switcher behavior, and cross-business settings. (Note: the detailed per-business views, consolidated P&L, and inter-company transfers live on the dedicated Portfolio page — this section is for *management and configuration* of the portfolio).

**Business List & Creation:**
- Cards for each business in the portfolio:
  - Business Name + Logo
  - Entity Type badge
  - Status: Active, Inactive, Suspended (compliance issue)
  - Key metrics snapshot: Total Cash, This Month's Revenue, This Month's Expenses
  - Last active: "Last transaction: 2 hours ago" or "Inactive for 30 days"
  - Actions: Switch to this business (sets it as `currentBusinessKey`), Edit Profile, View Full Dashboard (links to Overview page scoped to this business), Deactivate, Delete (only if no transaction history)
- "Add New Business" button: starts a mini onboarding wizard (name, type, KRA PIN, basic details) — the full KYB can be completed later
- "Add Rental Property" button: starts a specialized wizard for property entities (property name, address, unit count, monthly rent per unit, tenant details) — pre-configures the business for rental management

**Portfolio Grouping:**
- Businesses can be organized into groups/folders:
  - "My Businesses" (operating companies)
  - "Rental Properties" (each property is a separate business entity)
  - "Client Projects" (for agencies that run separate books per client)
  - Custom groups: user-created
- Drag-and-drop to move businesses between groups
- Group-level metrics: total cash across all businesses in the group, consolidated revenue, consolidated expenses

**Business Switcher Configuration:**
- The shell's sidebar business switcher (the dropdown that sets `currentBusinessKey`) is configured here:
  - Which businesses appear in the switcher (all, or only selected ones — useful if the user has 20 properties but only actively manages 5)
  - Default business: which one is selected on login
  - Switcher display format: "Name only", "Name + Type", "Name + Cash Balance"

**Cross-Business Settings:**
- **User Access Matrix**: which users have access to which businesses (links to Team & Roles, Section 5.3, but shown here at a portfolio level):
  - Table: User Name | Business A | Business B | Property 1 | Property 2 | Property 3
  - Cells show: "Admin", "Viewer", "No Access" — click to change
  - "Grant access to all businesses" checkbox for portfolio-level users (e.g., the owner's accountant)
- **Inter-company Transfer Rules**: can businesses transfer money between each other? "Yes, with approval" or "No" — prevents unauthorized fund movements
- **Consolidated Reporting**: enable/disable consolidated P&L, Balance Sheet, and Tax reports across the portfolio (links to Portfolio page)

**Portfolio Activity Feed:**
- A unified timeline showing key events across all businesses:
  - "TechSol: Invoice #INV-0234 paid — KES 50,000 received"
  - "Property 3 (Kilimani): Rent from John Mwangi overdue by 5 days"
  - "TS Retail: Payroll of KES 500,000 executed"
  - Filterable by business, event type, and date

**Detailed information & data points:**
- Adding a business to the portfolio creates a completely separate data partition: separate GL, separate CoA, separate transactions, separate tax profile. The only shared data is at the portfolio level (users, consolidated reports)
- The "Add Rental Property" wizard creates a business entity pre-configured with: a "Rent Income" CoA, recurring invoice templates per tenant, a "Rent Collections" virtual account, and tenant profiles in the CRM
- Business deletion is a hard block if any transactions exist — instead, the business is "Deactivated" (no new transactions allowed, but historical data is preserved)
- The portfolio activity feed is powered by the same audit trail (Section 4.9) but filtered and formatted for a business-owner audience (friendly language, not audit-speak)
- Maximum portfolio size: configurable by PayMo based on the user's plan (e.g., Basic: 1 business, Pro: 5 businesses, Enterprise: unlimited)

**Reason this section exists:**
The multi-business/portfolio use case is the unlock for property owners, holding companies, and serial entrepreneurs. Without it, a landlord with 5 houses needs 5 separate PayMo accounts (5 logins, 5 dashboards, no consolidated view — impossible to manage). With it, they have one login, a sidebar switcher to flip between properties, and a consolidated view of their entire portfolio's performance. The grouping feature (Businesses vs. Properties vs. Projects) acknowledges that these are fundamentally different use cases with different mental models. The user access matrix is critical for trust: the property owner wants to see all 5 properties, but the caretaker for Property 3 should ONLY see Property 3. The "Add Rental Property" wizard is the on-ramp for the most common multi-business use case in Kenya — it removes the friction of setting up a new business entity for each house.

---

## Section 5.3 — Team Management & Roles (RBAC)

**What it contains:**
The access control system — defining who can do what on the platform. This is Role-Based Access Control (RBAC) with PayMo-specific roles and customizable permissions. It's the difference between "everyone can approve payments" (dangerous) and "only the director can approve above KES 100K" (safe).

**User List:**
- Table: User Name, Email, Phone, Role(s), Businesses Access (which businesses in the portfolio this user can see), Status (Active, Invited, Suspended), Last Login, Actions
- Filters: role, status, business access
- Search: by name or email
- **Invite User**: "Invite" button sends an email/SMS with a signup link. The invited user creates their own password and is automatically assigned the selected role and business access
- **Bulk Invite**: upload CSV with names, emails, roles — sends all invites at once

**Pre-Built Roles:**
- **Owner**: full access to everything. Can manage team, settings, and compliance. Cannot be removed (there must always be at least one Owner). Only the Owner can delete the business.
- **Admin**: full access to business operations (invoices, payments, bookkeeping, reports) but cannot manage team members, change business profile, or modify compliance settings. Can approve payments within their limits.
- **Accountant**: full access to Bookkeeping & Taxes (GL, reports, reconciliation, month-end close) and read-only access to Get Paid and Pay Suppliers (to see the transactions that feed the ledger). Cannot initiate or approve payments. Cannot change settings.
- **Finance Manager**: full access to Pay Suppliers (initiate, approve within limits) and Cash & Accounts. Read-only access to Bookkeeping & Taxes. Cannot change settings or manage team.
- **Sales/Collections**: full access to Get Paid (create invoices, send reminders, view collections) and Customers & CRM. No access to Pay Suppliers, Cash & Accounts, Bookkeeping, or Settings.
- **HR/Payroll**: access to Pay Suppliers' Payroll section only. Can run payroll, manage employee records. No access to other payments, collections, or bookkeeping.
- **Viewer**: read-only access to everything they have business access to. Cannot create, edit, approve, or delete anything. Useful for external accountants, auditors, or partners.
- **Custom Role**: create a new role with granular permissions (see below)

**Granular Permissions (for Custom Roles):**
- Organized by page/section:
  - **Get Paid**: Create Invoices, Send Invoices, Delete Invoices, View Collections, Manage Payment Methods, Process Refunds, View Analytics
  - **Pay Suppliers**: Initiate Payments, Approve Payments (below threshold), Approve Payments (above threshold), Run Payroll, Manage Suppliers, View Payment History
  - **Cash & Accounts**: View Balances, Initiate Transfers, Manage Virtual Accounts, Manage Sweep Rules, View Investments, Reconcile
  - **Bookkeeping & Taxes**: View Ledger, Create Manual Journals, View Reports, Close Month, File Tax Returns, View Audit Trail
  - **Settings**: Edit Business Profile, Manage Team, Manage Integrations, Manage Compliance
- Each permission is a toggle: Allow / Deny
- "Copy from existing role" button to use a pre-built role as a starting point

**Approval Authority Matrix:**
- Configures WHO can approve WHAT:
  - Table: Payment Type | Amount Range | Required Approver Role(s) | Number of Approvals
  - Example rows:
    - "Supplier Payment" | "KES 0 – 10,000" | "Auto-approve" | 0
    - "Supplier Payment" | "KES 10,001 – 100,000" | "Finance Manager or Admin" | 1
    - "Supplier Payment" | "KES 100,001 – 500,000" | "Admin" | 1
    - "Supplier Payment" | "Above KES 500,000" | "Owner + Admin" | 2
    - "Payroll" | "Any amount" | "HR/Payroll + Finance Manager" | 2
    - "Refund" | "Any amount" | "Admin" | 1
    - "Sweep Rule" | "Above KES 1M" | "Owner" | 1
- This matrix directly powers the Approval Queue (Pay Suppliers, Section 2.1)

**User Activity & Session Management:**
- Per-user activity summary: "John Mwangi: Last login 2 hours ago from Chrome/Windows. Actions this month: 45 invoices created, 12 payments approved."
- **Active Sessions**: list of devices/sessions where the user is currently logged in — "Chrome on Windows (Nairobi), Safari on iPhone (Nairobi)"
- **Force Logout**: terminate a user's session immediately (e.g., if they left their computer unlocked or were terminated)
- **Suspend User**: temporarily disable access without deleting the account — "User suspended. Reason: Under investigation. Suspended by: [Admin name]."

**Detailed information & data points:**
- RBAC is enforced at the API level — even if a user bypasses the UI and calls the API directly, the permissions are checked and the request is denied if unauthorized
- A user can have different roles in different businesses within a portfolio: "John is Admin in TechSol but Viewer in Property 3"
- The approval authority matrix is evaluated in real-time when a payment is submitted: the system checks the amount, type, and matches it to the matrix to determine the required approval chain
- When a user is invited and hasn't accepted yet, they appear as "Invited" with a "Resend Invite" action and a "Revoke Invite" action
- Password policy for invited users: minimum 8 characters, must include uppercase, lowercase, and number. Enforced on first login
- For businesses using the Integrations page: API keys are scoped to the user's role — an API key created by a "Sales" role user can only access Get Paid endpoints

**Reason this section exists:**
Access control is how a business scales. With one user (the owner), RBAC doesn't matter. With 5 users (owner, accountant, sales clerk, HR, finance manager), RBAC is essential — the sales clerk shouldn't see payroll, the HR shouldn't approve supplier payments, and the accountant shouldn't change the business profile. Without RBAC, the owner either (a) shares their login (no accountability — who did what?) or (b) doesn't give anyone else access (bottleneck — the owner must do everything). The pre-built roles solve the "I don't know what permissions to set" problem — select "Accountant" and the permissions are configured correctly out of the box. The approval authority matrix translates the business's internal policies into platform enforcement: "In our company, the director must approve anything above KES 100K" becomes a matrix row that the system enforces. The session management (force logout, suspend) is the emergency response: if an employee leaves abruptly, the owner can lock them out in 2 seconds.

---

## Section 5.4 — Security, MFA & Device Management

**What it contains:**
The technical security settings that protect the business's financial data and money from unauthorized access. This is where passwords, two-factor authentication, and device management live.

**Password Policy (for the business — applies to all team members):**
- Minimum length: 8 characters (configurable: 8, 10, 12)
- Complexity requirements: uppercase, lowercase, number, special character (each toggleable)
- Password expiry: "Never" (default for modern security — NIST recommends against forced expiry) or "Every X days"
- Password history: "Cannot reuse last 5 passwords"
- "Enforce password change on next login" — forces all users to set a new password (useful after a security incident)

**Multi-Factor Authentication (MFA):**
- **MFA Policy**: Off (not recommended), Optional (users can enable it themselves), Required (all users must set it up before they can access the platform), Required for sensitive actions only (MFA prompted only when approving payments, filing taxes, changing settings — not for everyday viewing)
- **MFA Methods**:
  - **Authenticator App** (recommended): TOTP via Google Authenticator, Authy, etc. User scans a QR code during setup. 6-digit code entered on login.
  - **SMS**: code sent to the user's registered phone number. Less secure than authenticator app (SIM swap risk) but more accessible.
  - **Email**: code sent to the user's registered email. Least secure but fallback option.
- **Setup flow**: "Enable MFA" → choose method → scan QR / verify phone / verify email → enter code to confirm → "MFA enabled. Backup codes generated."
- **Backup Codes**: 10 single-use backup codes generated when MFA is set up. User stores these safely. If they lose their phone, a backup code gets them in.
- **MFA Status per User** (visible to Admins): "John Mwangi: MFA enabled (Authenticator App). Last used: 2 hours ago." or "Jane Wanjiku: MFA not enabled. ⚠" — Admin can send a nudge: "Require Jane to set up MFA on next login."

**Device Management:**
- **Trusted Devices List**: shows all devices that have logged into this business account:
  - Device name (e.g., "John's MacBook Pro"), OS/Browser, IP Address (approximate location), First Login Date, Last Active Date, Status (Active, Expired, Revoked)
  - "Revoke Device" action: immediately logs out the device and prevents future logins from it without re-authentication
- **New Device Detection**: when a user logs in from a new device (not in the trusted list), the system:
  - Sends an alert notification to the user's other devices: "New login from Windows PC in Nairobi. Was this you? [Yes, it's me] [No, secure my account]"
  - If "No" is clicked: the new device is revoked, the user is logged out, and the account is temporarily locked pending owner verification
  - If "Yes" is clicked: the device is added to the trusted list and the alert is dismissed
- **Session Timeout**: "Log out after inactivity of: 15 minutes / 30 minutes / 1 hour / 4 hours / Never" — configurable per business. Shorter is more secure, longer is more convenient.

**Login Security:**
- **Account Lockout**: "Lock account after X failed login attempts" (default: 5). Locked account requires owner/admin intervention or waiting period (e.g., 30 minutes) to unlock
- **Login Notifications**: "Send me an email/SMS every time someone logs into my account" — toggleable per user
- **IP Whitelisting** (for Enterprise): "Only allow logins from these IP addresses/ranges" — prevents access from unknown networks

**Security Audit Log:**
- A filtered view of the audit trail (Section 4.9) showing only security events:
  - Logins (successful, failed), logouts
  - MFA events (enabled, disabled, code entered, backup code used)
  - Device events (trusted, revoked, new device detected)
  - Password events (changed, reset requested, policy enforced)
  - Lockout events (account locked, unlocked)
  - Setting changes (timeout changed, IP whitelist modified)

**Detailed information & data points:**
- MFA is enforced at the authentication middleware level — before the user sees any business data, MFA must be passed
- SMS MFA uses a rate limiter to prevent abuse: max 3 SMS codes per phone number per hour
- Backup codes are hashed in the database — even if the database is compromised, the codes cannot be read. They are checked by hashing the user's input and comparing
- Device trust is stored as a long-lived cookie (with secure and http-only flags) on the user's device, plus a server-side record. Revoking the server-side record invalidates the cookie
- For API access: MFA is handled differently. API keys are used instead of passwords, and sensitive API operations require a separate API-specific secret or a one-time token obtained via MFA
- The security audit log is retained indefinitely (not subject to the 7-year financial record retention — security logs are kept forever)

**Reason this section exists:**
A PayMo account controls the business's money. If it's compromised, the business can lose everything in minutes. MFA is the single most effective protection against account takeover — without it, a compromised password is all an attacker needs. Making MFA "Required for sensitive actions" is the pragmatic middle ground: users don't have to enter a code every time they open the app (which causes fatigue and pushback), but they do when they're about to approve a KES 500K payment or file a KRA return. The device management gives the owner visibility into who is accessing the account and from where: "Why is there an active login from a Windows PC in Mombasa when all my staff are in Nairobi?" The new device detection is the early warning system for unauthorized access. The security audit log is for post-incident investigation: "The breach happened at 2:14 AM from IP address X. The attacker used a valid password (obtained via phishing) but was blocked by MFA." This section is the difference between "we got hacked and lost KES 2M" and "they tried to hack us but MFA stopped them."

---

## Section 5.5 — Payment & Invoicing Configuration

**What it contains:**
All the default settings that govern how the business gets paid and how its invoices look/behave. These are the "set it once, forget it" settings that affect the day-to-day experience on the Get Paid page.

**Payment Method Configuration:**
- Per-channel settings:
  - **M-Pesa Paybill**: Paybill number (assigned by PayMo), account reference format advice ("Use invoice number as account reference"), callback URL (technical — pre-configured by PayMo, shown for transparency)
  - **M-Pesa Till**: Till number (assigned by PayMo), Lipa na M-Pesa settings
  - **Bank Transfer**: default bank account for transfers (selected from Cash & Accounts linked banks), PesaLink code display
  - **Card Payments**: card acceptance terms (online only, or online + POS), card brands accepted (Visa, Mastercard)
  - **QR Payments**: QR code format (static vs. dynamic default), supported wallets
  - **Payment Links**: default link expiry (7 days, 14 days, 30 days, never), default link landing page theme

**Fee Bearer Settings:**
- For each payment method: who bears the transaction fee?
  - "Business absorbs the fee" (customer pays the invoiced amount, business receives amount minus fee)
  - "Customer bears the fee" (customer pays invoiced amount + fee — the fee is added at checkout/payment)
  - "Split" (business absorbs X%, customer pays Y%)
- Default: "Business absorbs" (most common, least friction for the customer)
- This setting can be overridden per-invoice if needed

**Invoice Template & Branding:**
- Template selector: Professional (clean, corporate), Simple (minimal, for small businesses), Retail (receipt-style, for POS/instant invoices)
- **Live preview**: shows the selected template with the business's actual data (logo, name, address, Paybill, bank details) as it will appear to the customer
- **Customization**:
  - Logo position and size
  - Primary and accent colors (matches brand colors from Business Profile)
  - Font selection (from a curated list of professional fonts)
  - Show/hide fields: "Show KRA PIN on invoice?", "Show payment terms?", "Show customer's KRA PIN?", "Show eTIMS QR code?" (eTIMS QR is mandatory if eTIMS is enabled)
  - Footer text: "Thank you for your business" or custom message
  - Attachments: auto-attach terms & conditions PDF to every invoice

**Default Payment Terms:**
- Default due date: "On Receipt", "15 Days", "30 Days", "60 Days", "End of Month following invoice date", "Custom"
- Late payment penalty: "Apply X% late fee after Y days overdue" — if enabled, the system automatically adds the penalty to overdue invoices and shows it on statements
- Early payment discount: "Offer X% discount if paid within Y days" — shown on the invoice as "2/10 Net 30" (2% discount if paid within 10 days, full amount due in 30 days)

**Receipt & Notification Settings:**
- **Auto-receipt**: "Automatically send a payment receipt to the customer when a payment is received" — toggle on/off
- **Receipt channels**: Email, SMS, WhatsApp — select which channels to use (and in what order of preference)
- **Receipt template**: customize the receipt message (similar to invoice template but shorter)
- **Invoice send tracking**: "Notify me when a customer opens my invoice email" — toggle on/off

**Numbering Formats:**
- Invoice number prefix and format: "INV-", "TS-2025-", custom
- Starting number: "Next invoice will be #INV-0234"
- Payment link reference format
- Receipt number format
- "Prevent duplicate numbers" toggle (always on — cannot be disabled)

**Detailed information & data points:**
- Invoice templates are rendered server-side as PDFs using a templating engine — the live preview uses the same engine, so what the user sees is exactly what the customer gets
- Fee bearer settings affect the payment checkout flow: if "Customer bears the fee", the checkout page shows "Amount: KES 10,000 + Fee: KES 50 = Total: KES 10,050"
- Late payment penalties are calculated automatically but are NOT added to the invoice without the business owner's review — they appear as "Suggested penalty" that the owner can apply or waive
- Early payment discounts affect the receivables tracking: if a customer takes the discount, the invoice is marked as "Paid (with discount)" and the discount amount is recorded as a separate expense line
- Numbering formats are per-business: if the user has 5 businesses in the portfolio, each can have its own invoice prefix ("TS-" for TechSol, "KR-" for Kilimani Rentals, etc.)

**Reason this section exists:**
These are the settings that the business owner sets up once during onboarding and then never thinks about again — but if they're wrong, every invoice and every payment is affected. The invoice template is the business's public face: a professional, branded invoice builds trust with customers; a generic, unbranded one looks amateur. The fee bearer setting is a business decision that has a direct financial impact: if the business absorbs KES 50 per transaction and does 1,000 transactions a month, that's KES 50,000/month in fees. If they pass it to the customer, it's zero. The late payment penalty and early payment discount are tools most SMEs never use because they're hard to calculate manually — automated, they become powerful levers for improving cash flow. The receipt auto-send ensures the customer gets proof of payment instantly, reducing "did you get my money?" calls.

---

## Section 5.6 — Integration & API Management

**What it contains:**
The configuration hub for connecting PayMo to external tools and services. This is distinct from the "Integrations Marketplace" page (which is the discovery/browsing interface) — this section is for managing active connections, API keys, and webhooks.

**Active Integrations List:**
- Cards for each connected integration:
  - Integration name + logo: "WhatsApp Business", "QuickBooks", "Google Analytics", "Glovo"
  - Status: Connected (green), Disconnected (red), Error (amber — e.g., "OAuth token expired")
  - Last sync: "5 minutes ago"
  - Data flow direction: "Receives data from WhatsApp", "Sends data to QuickBooks", "Bidirectional"
  - Actions: Configure, Sync Now, Disconnect, View Logs
- Each card links to the integration's specific configuration panel (varies by integration)

**API Key Management (for developers):**
- **API Keys Table**: Key Name, Key (masked: "pk_live_****7890"), Created Date, Last Used Date, Status (Active, Revoked), Permissions (Read, Write, Admin)
- **Create API Key**: 
  - Name: e.g., "Production Server", "Staging", "Zapier Integration"
  - Permissions: Read-only (can fetch data), Read+Write (can create/update), Admin (full access — dangerous)
  - IP Whitelist (optional): "Only allow this key from these IP addresses"
  - Rate Limit: "Default (100 req/min)" or "Custom (up to 1000 req/min for Enterprise)"
  - On create: the full key is shown ONCE. "Copy this key now. You will not be able to see it again." (Standard API key security practice)
- **Revoke Key**: immediately invalidates the key. Any application using it will receive "401 Unauthorized" on the next request

**Webhook Configuration:**
- **Webhook Endpoints Table**: URL, Events (which events trigger this webhook), Status (Active, Paused, Failed), Last Delivery, Success Rate
- **Add Webhook Endpoint**:
  - URL: "https://myapp.com/paymo-webhook"
  - Events to subscribe to (checkboxes): 
    - Payment Received, Payment Failed, Invoice Created, Invoice Paid, Invoice Overdue, Payroll Executed, Balance Changed, etc.
  - Secret: a signing secret used to verify that the webhook payload actually came from PayMo (HMAC signature)
- **Webhook Logs**: table of recent deliveries: Event, Payload (viewable), Response Code (200, 404, 500), Response Body, Duration. Failed deliveries are retried with exponential backoff (1 min, 5 min, 15 min, 1 hour, up to 5 retries)
- "Test Webhook" button: sends a sample payload to the endpoint to verify it's working

**Data Export & Sync Settings:**
- **Accounting Software Sync** (QuickBooks, Xero): 
  - Sync direction: "PayMo → QuickBooks" (push transactions), "QuickBooks → PayMo" (pull data), "Bidirectional"
  - Sync frequency: Real-time (via webhooks), Hourly, Daily
  - Field mapping: which PayMo fields map to which QuickBooks fields (pre-configured, but editable for custom setups)
  - Conflict resolution: "If a transaction exists in both systems, PayMo wins" or "QuickBooks wins" or "Ask me"
- **E-commerce Sync** (WooCommerce, Shopify): auto-import orders as PayMo invoices, auto-mark as paid when payment is received
- **CRM Sync** (Salesforce, HubSpot): sync customer data, invoice status, payment status

**Detailed information & data points:**
- API keys are hashed in the database (like passwords) — the full key is only shown once at creation time. The system stores the hash and verifies incoming requests by hashing the provided key and comparing
- Webhook payloads are signed using HMAC-SHA256 with the webhook secret — the receiving application can verify the signature to ensure the payload is authentic and untampered
- Webhook retries stop after 5 failed attempts (over ~24 hours). The user sees "Webhook to https://myapp.com failed 5 times. Paused. Click to retry." This prevents endless failed requests from consuming resources
- Rate limits are enforced per API key, not per business — if the business has 3 API keys, each gets its own rate limit quota
- For security: API keys inherit the permissions of the user who created them. If User A (Admin) creates a key, it has Admin permissions. If User B (Viewer) creates a key, it's automatically Read-only
- Integration OAuth tokens are refreshed automatically in the background. If a refresh fails (e.g., the user revoked access in the third-party app), the integration status changes to "Error" with instructions to re-authenticate

**Reason this section exists:**
The "Integrations Marketplace" page is where the user discovers what they can connect. This section is where they *manage* those connections. Without it, the user has no visibility into whether an integration is working, when it last synced, or how to fix it when it breaks. The API key management is essential for businesses that have developers or use automation tools (Zapier, Make/Integromat) — they need to create, rotate, and revoke keys. The webhook system is the technical backbone of real-time integrations: when a payment is received in PayMo, the business's custom app gets notified instantly via webhook, allowing them to trigger internal workflows (update their database, send a custom SMS, log to their own system). The data export settings for QuickBooks/Xero address the "my accountant uses QuickBooks" reality — instead of forcing the accountant to switch to PayMo's bookkeeping, PayMo pushes the data to QuickBooks, meeting the accountant where they are.

---

## Section 5.7 — Support Center & Dispute Management

**What it contains:**
The help and issue resolution hub. This combines self-service support (knowledge base, FAQs) with direct support channels (chat, email, phone) and a formal dispute tracking system for payment and compliance disputes.

**Self-Service Knowledge Base:**
- **Search bar**: "How do I...", "Why is my payment failing...", "How to file VAT..." — searches all help articles
- **Categorized articles**:
  - Getting Started (onboarding, first invoice, first payment)
  - Getting Paid (payment methods, invoicing, QR, links)
  - Paying Out (suppliers, payroll, approvals)
  - Cash & Accounts (bank connections, virtual accounts, FX)
  - Bookkeeping & Taxes (ledger, reports, KRA, eTIMS)
  - Settings & Security (team, MFA, integrations)
  - Troubleshooting (payment failures, eTIMS errors, bank sync issues)
- **Video tutorials**: embedded short videos (1–3 minutes) for common tasks
- **Interactive guides**: step-by-step walkthroughs that highlight the actual UI elements on the page (for first-time users)

**Contact Support:**
- **Live Chat**: in-app chat widget (bottom-right corner, persistent across all pages). Connects to a human agent during business hours, or to a chatbot after hours
- **Email Support**: "support@paymo.biz" with a form to categorize the issue (Payments, Taxes, Technical, Account, Feature Request) and attach screenshots
- **Phone Support**: "Call us" button shows the phone number and available hours (8 AM – 6 PM EAT, Mon–Fri). Option for callback: "Request a callback — we'll call you within 30 minutes"
- **Support ticket tracking**: "My Tickets" sub-tab showing all submitted tickets with status (Open, In Progress, Waiting for Info, Resolved, Closed), assigned agent, last update

**Dispute Management (Formal):**
- Separate from general support tickets — disputes are for:
  - Payment disputes (customer claims they didn't receive goods/service, card chargebacks)
  - Transaction disputes (amount is wrong, duplicate transaction, unauthorized transaction)
  - Compliance disputes (KRA penalty that the business believes is incorrect, eTIMS rejection that the business believes is a KRA system error)
- **Dispute Form**:
  - Dispute Type: dropdown
  - Related Transaction: search and select the payment/invoice/return involved
  - Amount in Dispute: KES
  - Your Position: detailed description of why you're disputing
  - Supporting Evidence: upload documents (delivery proof, communication logs, contracts, KRA notices)
  - Desired Resolution: "Reverse transaction", "Provide evidence to card network", "Waive penalty", "Other"
- **Dispute Tracker**: table of all disputes with columns: Dispute ID, Type, Amount, Status (Opened → Under Investigation → Evidence Submitted → Resolved → Closed), Created Date, Resolution Date, Outcome
- **Dispute Detail**: full timeline of the dispute — every communication, every evidence submission, every status change. The business can add additional evidence at any time during the investigation
- **SLA Display**: "Card chargeback disputes: response required within 7 days. Time remaining: 5 days." — shows the deadline clearly

**System Status Page:**
- Real-time status of PayMo's services:
  - M-Pesa Collections: "Operational ✓" or "Degraded Performance ⚠" or "Outage ✗"
  - Bank Connections: "Operational ✓"
  - eTIMS Integration: "Operational ✓" or "KRA eTIMS system down ⚠ (outside our control)"
  - Card Payments: "Operational ✓"
  - API: "Operational ✓"
- Incident history: "March 20: M-Pesa Collections intermittent for 45 minutes. Resolved."
- "Subscribe to updates": get email/SMS when there's an outage

**Detailed information & data points:**
- The knowledge base is powered by a headless CMS that allows PayMo's content team to update articles without a code deploy
- Chat bot uses a combination of keyword matching and LLM to answer common questions — if it can't answer, it routes to a human agent with the conversation history
- Support tickets and disputes are separate entities in the database: tickets are for general help, disputes have specific legal/compliance workflows and SLAs
- Disputes involving card networks (chargebacks) have hard deadlines set by Visa/Mastercard (typically 7–10 days to respond). The SLA display counts down in real-time and escalates to a manager if the deadline is approaching and no response has been submitted
- System status data comes from PayMo's internal monitoring (Datadog, or similar) — updated every 60 seconds
- For Enterprise customers: the support section shows a dedicated "Account Manager" contact and a priority support queue with faster response times

**Reason this section exists:**
When something goes wrong — a payment fails, KRA rejects an eTIMS invoice, the user can't connect their bank — the user needs help immediately. Without a robust support section, they call the owner's personal phone, post on Twitter, or just leave. The self-service knowledge base handles 70% of questions without human intervention ("How do I create an invoice?" → article). The live chat handles the remaining 30% that need a human. The dispute management system is critical because disputes have legal and financial deadlines — a missed chargeback deadline means automatic loss of the money. By providing a structured dispute form with evidence upload and SLA tracking, PayMo ensures the business doesn't lose money due to process failures. The system status page prevents "Is it just me or is the whole system down?" anxiety — the user checks the status page and sees "M-Pesa Collections: Degraded Performance — we're working on it."

---

## Section 5.8 — Notifications & Communication Preferences

**What it contains:**
The control panel for how and when PayMo communicates with the business owner and their team. This ensures the user gets the right notifications through the right channel without being spammed.

**Notification Channels:**
- **In-App**: bell icon in the shell header. Shows a dropdown of recent notifications. Badge shows unread count. All notifications appear here regardless of other channel settings.
- **Email**: sent to the user's registered email
- **SMS**: sent to the user's registered phone
- **Push Notification**: sent to the PayMo mobile app (if installed) or browser push (if using the web app)
- **WhatsApp**: sent to the user's WhatsApp number (for critical alerts only — payment failures, security alerts, tax deadlines)

**Notification Categories & Toggles:**
Each category can be individually toggled on/off for each channel:

- **Payments Received**: "A payment of KES X was received from [customer] via [method]"
  - In-App: On, Email: Daily Digest, SMS: Off, Push: On, WhatsApp: Off
- **Payments Failed**: "A payment of KES X from [customer] failed. Reason: [reason]"
  - In-App: On, Email: Immediate, SMS: On, Push: On, WhatsApp: On
- **Invoice Events**: "Invoice #INV-0234 was viewed by [customer]", "Invoice #INV-0234 is overdue"
  - In-App: On, Email: Daily Digest, SMS: Off, Push: On, WhatsApp: Off
- **Approval Required**: "Payment request #1234 requires your approval"
  - In-App: On, Email: Immediate, SMS: On (if > KES 50K), Push: On, WhatsApp: On (if > KES 100K)
- **Tax Deadlines**: "VAT return due in 5 days. Estimated: KES X"
  - In-App: On, Email: 7 days before, 3 days before, 1 day before, SMS: 1 day before, Push: On, WhatsApp: 1 day before
- **Security Alerts**: "New login from unknown device", "MFA disabled"
  - In-App: On, Email: Immediate, SMS: Immediate, Push: Immediate, WhatsApp: Immediate
- **System Updates**: "New feature: Inventory Management now available", "Scheduled maintenance: Saturday 2–4 AM"
  - In-App: On, Email: Weekly Digest, SMS: Off, Push: Off, WhatsApp: Off
- **Team Activity**: "John Mwangi created 5 invoices", "Jane Wanjiku approved a payment of KES X"
  - In-App: On (for Admins), Email: Off, SMS: Off, Push: Off, WhatsApp: Off

**Quiet Hours:**
- "Don't send SMS/Push/WhatsApp notifications between [10 PM] and [7 AM]" — ensures the owner isn't woken at 3 AM by a "payment received" notification
- Security alerts override quiet hours (always delivered immediately)

**Notification History:**
- Table of all notifications sent in the last 30 days: Date/Time, Category, Message, Channel(s) Delivered, Read Status (for in-app: read/unread)
- "Mark all as read" button
- Filter by category and channel

**Detailed information & data points:**
- Notifications are generated by event listeners across the platform — when a payment callback comes in, an event is published, and the notification service fans it out to the configured channels
- Email digest mode collects all notifications in a category over a period (e.g., 24 hours) and sends a single summary email: "You received 15 payments totaling KES 450,000 today. 2 invoices are overdue."
- SMS notifications are subject to cost — each SMS costs PayMo money. The default settings minimize SMS usage (only for critical alerts) to keep the platform's costs sustainable. Businesses that want SMS for everything can enable it, but a warning shows: "Enabling SMS for all payment received notifications will send ~50 SMS/month. Standard SMS rates apply."
- Push notifications use the Web Push API (for web) and Firebase Cloud Messaging (for mobile app) — they require the user to grant permission in their browser/device
- WhatsApp notifications use the WhatsApp Business API and are reserved for critical alerts due to per-message costs

**Reason this section exists:**
Notifications are a double-edged sword. Too few, and the user misses important events (overdue invoice, failed payment, security breach). Too many, and the user develops notification fatigue and ignores all of them — including the critical ones. This section gives the user fine-grained control: "I want to know instantly when a payment fails (SMS + Push + WhatsApp), but I don't need to know instantly when every payment comes in (just show me in the app and give me a daily email digest)." The quiet hours are essential for business owners' sanity — no one wants a 3 AM SMS because a customer paid their invoice early. The channel flexibility accommodates different working styles: some owners live in their email, some live on WhatsApp, some only check the app. The notification history is the "I know I got a notification about something yesterday but I can't remember what" safety net.

---

## Section 5.9 — Data, Privacy & Account Management

**What it contains:**
The nuclear options — data export, data deletion, account closure, and privacy settings. This section is used rarely but must exist for compliance (Kenya Data Protection Act — KDPA) and user trust.

**Data Export (Full):**
- "Export All My Data" button: generates a complete archive of all business data
  - All transactions (CSV)
  - All invoices, receipts, credit notes (PDF)
  - All supplier and customer records (CSV)
  - All ledger entries (CSV)
  - All reports (PDF)
  - All uploaded documents (KYB, receipts, contracts — original files)
  - All settings and configurations (JSON)
- The archive is packaged as a ZIP file, encrypted with a password the user sets, and made available for download for 7 days
- "This export may take up to 24 hours to prepare. We'll email you when it's ready."

**Data Retention Settings:**
- "How long should PayMo retain your financial data?" 
  - Minimum: 7 years (KRA requirement — cannot be set lower)
  - Maximum: Indefinite
  - Default: 7 years
- "When the retention period expires, what should we do?"
  - Anonymize: replace names, PINs, phone numbers with random strings, but keep the financial data for aggregated analytics
  - Delete: permanently remove all data (not recommended — may be required for tax audits even after 7 years in some cases)
- "Apply retention to closed businesses" toggle: if a business in the portfolio is deactivated, start the retention countdown from deactivation date

**Privacy Settings:**
- "Allow PayMo to use my anonymized data for product improvement" — toggle on/off. If on, aggregated, non-identifiable data (e.g., "average transaction size for retail businesses in Nairobi") may be used for analytics and benchmarking
- "Allow PayMo to contact me about new features and promotions" — toggle on/off
- "Display my business in PayMo's customer directory/testimonials" — toggle on/off

**Account Closure:**
- **Close Business Account**: 
  - "I want to close [Business Name]'s PayMo account permanently"
  - Prerequisites checklist (all must be met before closure is allowed):
    - ☐ All transactions reconciled
    - ☐ All taxes filed and paid (no outstanding KRA liabilities)
    - ☐ All payments completed (no pending approvals or in-flight transactions)
    - ☐ All funds withdrawn (zero balance across all accounts and floats)
    - ☐ All integrations disconnected
    - ☐ All team members removed or transferred to another business
  - If prerequisites are not met: "You cannot close this account until the above items are resolved. Click an item to see what's needed."
  - If prerequisites are met: "Close Account" button (requires password + MFA confirmation)
  - **After closure**: the business data is retained for 7 years (per retention settings) but the account is inactive and no transactions can occur. After the retention period, the data is anonymized or deleted per the retention settings.

**Delete Entire PayMo Account (Personal):**
- "I want to delete my personal PayMo account and all my businesses"
- Only available if the user has closed all businesses in their portfolio
- Requires password + MFA + email confirmation
- After deletion: the user's login is permanently removed, all their businesses' data follows the retention policy

**Detailed information & data points:**
- The full data export complies with the Kenya Data Protection Act (KDPA) right of data access — the data subject (the business owner) has the right to receive a copy of all their personal and business data held by the data controller (PayMo)
- Data deletion/retention is a background job that runs monthly — it doesn't happen instantly on account closure. The account is closed (no access) immediately, but the data is purged according to the schedule
- KRA's 7-year retention requirement is a hard floor — even if the user selects "Delete after 7 years", the system retains a minimal tax-audit trail (amounts, dates, tax calculations) for 7 years, even if personally identifiable information is deleted
- For multi-business: closing one business in a portfolio does NOT close the others. Each business is closed independently
- The account closure prerequisites exist to protect both PayMo and the business: closing an account with outstanding taxes or pending payments would create legal and financial messes

**Reason this section exists:**
Trust requires an exit. If a business owner feels locked in — "I can't leave because I can't get my data out" — they trust the platform less, not more. The full data export is the ultimate trust signal: "Your data is yours. You can take it all, anytime, in standard formats." The KDPA compliance is non-negotiable for a platform operating in Kenya — the Data Commissioner can fine PayMo for failing to provide data access or deletion. The account closure flow with prerequisites ensures a clean exit: no dangling payments, no unpaid taxes, no orphaned integrations. The retention settings give the business owner control over how long their data lives, while enforcing the KRA 7-year minimum. This section is rarely visited, but its existence is felt every day as a subconscious trust builder: *"If I ever need to leave, I can."*

---

## Section 5.10 — Quick Actions Bar (Persistent)

**What it contains:**
The final consistent sticky bar, tailored for the Settings & Security page — which is fundamentally about configuration and administration, not daily operations.

**Actions:**
1. **"Invite Team Member"** — opens the invite modal (Section 5.3) pre-populated with a "Viewer" role (safest default)
2. **"Edit Business Profile"** — jumps to the Business Identity section (Section 5.1) for quick edits (phone number, address)
3. **"Check Compliance"** — jumps to the KYB Compliance Status checklist (Section 5.1) showing current level and any missing documents
4. **"Security Checkup"** — opens a modal showing the business's security posture: "MFA: Enabled ✓ | All sessions: Trusted ✓ | No failed logins in 30 days ✓ | Overall: Strong" — with links to fix any weaknesses
5. **"Manage Integrations"** — jumps to the Active Integrations list (Section 5.6) showing connection status of all integrations
6. **"Contact Support"** — opens the live chat widget or support form (Section 5.7)
7. **"View System Status"** — opens the System Status panel (Section 5.7) in a modal/tooltip for a quick health check

**Context-aware behavior:**
- If KYB compliance is below Level 2 (documents missing), the "Check Compliance" button pulses amber with "Action needed"
- If any integration has an "Error" status, the "Manage Integrations" button shows a red badge with the count of errored integrations
- If a team member has been "Invited" but hasn't accepted in 7+ days, "Invite Team Member" badge shows the pending invite count
- If the system status page shows any degraded/outage, "View System Status" turns amber/red

**Reason this section exists:**
Settings pages are notoriously hard to navigate because they're flat lists of options with no clear hierarchy. The quick action bar provides a "top tasks" shortcut layer for the admin tasks that are most frequently needed: invite someone, check compliance, verify security, check integrations. The "Security Checkup" action is particularly valuable — instead of navigating through MFA settings, device management, and password policies to assess security, the admin gets a one-click summary: "You're good" or "You have 2 issues to fix." The context-aware badges ensure that problems (missing KYB documents, failed integrations, system outages) are surfaced proactively, even when the user isn't actively looking for them. This maintains the pattern established across all 5 pages: the quick action bar is the consistent, predictable, context-aware shortcut layer that makes the platform feel intelligent and responsive.

---

# END OF COMPREHENSIVE OUTLINE

**Summary of the 5 consolidated pages and their section counts:**

| Page | Sections | Core Promise |
|---|---|---|
| **1. Get Paid** | 10 | Every shilling coming in, from every channel, tracked and collected |
| **2. Pay Suppliers** | 10 | Every shilling going out, approved, executed, and recorded |
| **3. Cash & Accounts** | 10 | All your money, everywhere, growing and forecasted |
| **4. Bookkeeping & Taxes** | 10 | Books write themselves, taxes file themselves |
| **5. Settings & Security** | 10 | Your business is set up, secure, compliant, and supported |

**Total: 50 sections across 5 pages**, forming a complete, interconnected superapp where every section reads from and writes to the central General Ledger, every page respects the multi-business portfolio context, and every user journey flows naturally from money-in → money-out → cash management → reporting → compliance → administration.




# PayMo Digital Platform — Comprehensive Page-by-Page Outline (Part II: The New Pages)

## Expansion Architecture Overview

This document continues the exhaustive, section-by-section blueprint for the next phase of the PayMo superapp. While the first 5 pages consolidated and deepened the core finance operations, these next 5 pages **close the gap** that forces a user to seek external apps (Shopify for e-commerce, Excel for inventory, a separate CRM, a loan app, an insurance broker). 

Each page follows the established module pattern (`pages/<Module>.tsx` + `components/` + `styles/<module>.module.css`), renders inside the shared `BusinessShell`, and critically, **reads from and writes to the central General Ledger** established in the Bookkeeping page. A sale on the Online Store automatically creates a ledger entry, updates inventory, updates the customer's CRM profile, and triggers an eTIMS invoice. The superapp spine holds.

---

# PAGE 6: CUSTOMERS & CRM (`customers-crm.html`)

**Zone:** 💰 Money In
**Mental model for the user:** *"Who buys from me, what do they buy, how do I talk to them, and how do I keep them coming back?"*
**Core thesis:** Today, PayMo knows a payment came from "John Mwangi +254712345678" but has no idea who John is, what he bought last month, or that he hasn't bought anything in 45 days. This page turns transactional phone numbers into living customer profiles. It is not a enterprise-grade Salesforce clone; it is a lightweight, transaction-aware CRM built for SMEs who currently manage customers in their phone contacts or WhatsApp groups.

---

## Section 6.1 — Customer Directory & Master Profiles

**What it contains:**
The primary grid/list view of every entity the business has ever interacted with. Unlike the Supplier Directory (which is for money-out), this is for money-in and relationships. Customers are auto-created from the first interaction (invoice sent, payment received, payment link clicked) but can also be manually added.

**Directory Table:**
- Columns: Customer Name (or "Walk-in" if no name), Primary Phone, Email, Total Revenue (Lifetime), Outstanding Balance, Last Transaction Date, Status (Active, Inactive, Blocked), Tags (VIP, Wholesale, At-Risk — color-coded chips), Actions
- **Auto-creation logic**: When an M-Pesa payment comes in with an unrecognized phone number, a customer is auto-created as "Customer +254712..." with the payment linked. The user is prompted to "Add name & details" later.
- **Search & Filter**: Search by name, phone, email, or KRA PIN. Filter by tag, status, revenue range (e.g., "Show customers who've spent > KES 100K"), or those with outstanding balances.
- **Sort**: By Total Revenue (descending — who are my best customers?), by Last Transaction (ascending — who is going cold?), by Outstanding Balance (descending — who owes me the most?).
- **Bulk Actions**: Export to CSV, Send bulk SMS/WhatsApp, Assign tag to selected, Block selected (stops them from paying via Paybill/payment links — useful for fraudsters).

**Detailed Customer Profile (Slide-over Panel):**
Triggered by clicking a row. This is the "single pane of glass" for a customer.
- **Header**: Name, Phone, Email, Profile Picture (optional), Status badge, Quick Actions (Call, WhatsApp, Send Invoice, Record Payment).
- **Financial Snapshot**: Lifetime Revenue, YTD Revenue, Average Order Value (AOV), Outstanding Balance, Total Invoices, Total Payments.
- **Contact Details**: Phone(s), Email(s), Physical Address, KRA PIN (pulled from invoices where it was entered).
- **Assigned Tags**: Click to add/remove segmentation tags.
- **Linked Entities**: Direct links to "View all Invoices", "View all Payments", "View all Receipts" — these open the corresponding filtered views in the Get Paid page.

**Detailed information & data points:**
- Customer data is scoped to `currentBusinessKey`. In a multi-business portfolio, the same phone number might be a customer in Business A and a supplier in Business B — they are treated as separate entity records.
- The directory supports up to 100,000 customer records for a single business (with virtual scrolling for performance). Beyond that, an Enterprise search index is used.
- "Blocked" status writes to a platform-wide blacklist (if the business opts in) and prevents Paybill payments from that phone number from being credited without manual review.
- The table exports include all financial metadata, making it easy for the business to do mail-merge marketing or import into external analytics tools.

**Reason this section exists:**
A business that doesn't know its customers is flying blind. The shopkeeper knows "the guy in the blue car buys 5 bags of cement every month" but can't quantify it, track it, or scale it. This directory makes that knowledge explicit and searchable. The auto-creation from phone numbers is critical for adoption: the business owner doesn't have to manually type in 500 customers — they just start using PayMo, and the directory populates itself from payment data. The "Blocked" feature addresses a real Kenya SME pain point: fraudulent M-Pesa reversals or persistent defaulters. By blocking them at the Paybill level, the business prevents future losses.

---

## Section 6.2 — Communication History & Omnichannel Log

**What it contains:**
A chronological timeline of every interaction the business has had with this customer, across all channels. This eliminates the "I know I talked to him about this last week, but was it on WhatsApp or SMS?" problem.

**Communication Timeline (Within the Customer Profile):**
- Vertical timeline showing events in reverse chronological order:
  - **SMS Sent**: "Payment reminder for INV-0234 sent via SMS. Status: Delivered." (Preview of message text)
  - **WhatsApp Sent**: "Invoice #INV-0235 shared via WhatsApp. Status: Read (blue ticks)." (Preview of message)
  - **Email Sent**: "Monthly statement emailed. Status: Opened 3 times."
  - **Inbound Call/Note**: "Called customer to discuss delay. Agreed to pay Friday. — Note by John (Sales)." (Manual entry)
  - **System Events**: "Customer paid KES 50,000 via M-Pesa", "Invoice viewed by customer", "Credit note issued"
- **Filter by channel**: Show only SMS, only WhatsApp, only system events, only manual notes.
- **Add Manual Note**: A quick-input field at the top of the timeline: "Took order for 10 crates via phone. Delivering Tuesday." — tagged with the date/time and the logged-in user.

**Compose & Send (From Profile):**
- Quick-send bar: "Message this customer" → opens a modal with:
  - Channel selector: SMS, WhatsApp, Email (shows which channels are available based on customer's contact info)
  - Template selector: "Payment Reminder", "Thank You", "Promotion", "Custom"
  - Message editor: pre-filled from template with merge tags (`{CustomerName}`, `{OutstandingBalance}`, `{InvoiceLink}`)
  - Send or Schedule

**Detailed information & data points:**
- WhatsApp messages are sent via the PayMo WhatsApp Business API integration. "Read" status (blue ticks) is polled back from WhatsApp and displayed in the timeline.
- SMS delivery status is fetched from the SMS gateway (Delivered, Failed, Pending).
- Email open tracking uses a 1x1 pixel embedded in the HTML email — the timeline shows "Opened" if the pixel is loaded (note: this is less reliable due to email privacy features, but works for most corporate/personal Gmail/Yahoo in Kenya).
- Manual notes are searchable across the entire CRM: a global search for "delivering Tuesday" finds this customer's note.
- Communication history is retained for the same 7-year period as financial data for audit and dispute resolution purposes.

**Reason this section exists:**
Context is king in customer relationships. When a customer calls to complain, the business owner opens this timeline and immediately sees: "Ah, you're calling about INV-0234. I sent you a WhatsApp reminder on Tuesday, you read it, and you called me on Wednesday to say you'd pay Friday." That level of context turns a confrontational call into a collaborative one. Without this, the owner is guessing: *"I think I sent an SMS... maybe last week?"* The manual notes feature is the fallback for offline interactions (phone calls, walk-ins) that wouldn't otherwise be captured digitally.

---

## Section 6.3 — Segmentation & Smart Tags

**What it contains:**
The tool for grouping customers based on behavior, value, and attributes — without requiring a degree in data science. Segmentation powers targeted marketing, prioritized follow-ups, and differentiated service.

**Tag Management:**
- **Pre-built Tags**: VIP, Wholesale, Retail, At-Risk, Dormant, New, High-Frequency, Seasonal
- **Custom Tags**: User-created (e.g., "Nairobi CBD", "Referral from Kamau", "Prefers M-Pesa")
- **Tag Colors**: Each tag has a color for visual scanning in the directory table
- **Bulk Tagging**: Select 50 customers from the directory → "Add tag: Wholesale"

**Smart / Automated Segments (Dynamic):**
Unlike static tags, these are rules-based and update automatically as customer data changes:
- **VIP**: "Lifetime revenue > KES 1,000,000" OR "Purchased > 10 times"
- **At-Risk**: "Last purchase > 60 days ago AND lifetime revenue > KES 50,000" (they were valuable, now they're ghosting)
- **New**: "Created in the last 30 days"
- **Whales**: "Average Order Value > KES 100,000"
- **Late Payers**: "Average Days to Pay > 45 days"
- **Sleeping**: "No transactions in the last 90 days"
- **Custom Segment Builder**: "Create a segment where: [Field] [Operator] [Value] AND/OR..." (e.g., "Tag is NOT VIP AND Outstanding Balance > 0 AND Last Transaction Date < 2025-01-01")

**Segment Actions:**
Once a segment is selected (e.g., "At-Risk: 15 customers"), the user can:
- View the list of customers in that segment
- Send a targeted message: "We miss you! Here's a 10% discount on your next order." (via SMS/WhatsApp/Email)
- Export the list
- Assign a follow-up task to a team member

**Detailed information & data points:**
- Smart segments are recalculated nightly (or on-demand) by querying the ledger and transaction tables. A customer who crosses the KES 1M threshold today will appear in the VIP segment tomorrow morning.
- Segments are additive: a customer can be both "VIP" and "At-Risk" (high spender who hasn't bought in 60 days — critical to save).
- The segment builder supports nested logic (up to 3 levels deep) for complex business rules.
- Segment sizes are shown next to the name: "At-Risk (15)" so the user knows the scope before clicking.

**Reason this section exists:**
Mass marketing is dead for SMEs. A shopkeeper with 500 customers cannot afford to SMS all 500 every week (cost) and shouldn't (irrelevance). Segmentation lets them send a "thank you" SMS to their 20 VIPs, a "we miss you" SMS to their 30 at-risk customers, and a "welcome" SMS to their 50 new customers — three targeted, cheap, high-impact campaigns instead of one expensive blast. The "At-Risk" segment is the most valuable: it identifies customers who are about to churn *before* they churn, giving the business a window to win them back. Without automation, the owner only realizes a customer left when they haven't seen them in 6 months — too late.

---

## Section 6.4 — Sales Pipeline & Lead Tracking

**What it contains:**
A lightweight deal-tracking system for businesses that sell through proposals, quotes, or negotiations (B2B services, high-value retail, real estate, event planning) rather than instant point-of-sale transactions. This bridges the gap between "I have a lead" and "I created an invoice."

**Pipeline Board (Kanban View):**
- Columns representing deal stages (customizable, but defaults provided):
  - **New Lead** (Initial contact)
  - **Contacted** (First conversation happened)
  - **Proposal Sent** (Quote/proposal delivered)
  - **Negotiation** (Active back-and-forth)
  - **Won** (Converted to Invoice)
  - **Lost** (Did not convert)
- Cards in each column show: Company/Lead Name, Contact Person, Estimated Deal Value (KES), Probability (%), Last Activity Date, Days in Stage (if > 7 days, turns amber; > 14 days, turns red — "stale deal").
- Drag-and-drop to move cards between stages.

**Lead/Deal Profile:**
- Clicking a card opens a detail panel:
  - **Details**: Name, Company, Phone, Email, Source (Walk-in, Referral, Website, WhatsApp)
  - **Deal Info**: Estimated Value, Actual Closed Value (when Won), Probability %, Expected Close Date
  - **Line Items**: What they want to buy (product/service, quantity, proposed price) — can be pulled from the Products & Store page
  - **Activity Log**: Timeline of calls, emails, proposals sent (same UI as Communication History)
  - **Actions**: "Convert to Invoice" (moves to Won, creates a draft invoice in Get Paid pre-filled with the line items), "Mark Lost" (requires reason: "Price too high", "Went with competitor", "Project cancelled")

**Pipeline Analytics:**
- **Win Rate**: "Of 40 leads this month, you won 15 (37.5%)"
- **Average Deal Size**: "KES 250,000"
- **Sales Cycle**: "Average 21 days from New Lead to Won"
- **Pipeline Value**: "Total value of open deals: KES 5.2M" — forecasting future revenue
- **Stage Conversion**: Funnel chart showing drop-off between each stage ("80% of Contacted become Proposals, but only 40% of Proposals become Won — improve your proposal close rate")

**Detailed information & data points:**
- "Convert to Invoice" is the critical integration point: it creates a draft invoice in Get Paid (Page 1, Section 1.2) using the deal's line items, pricing, and customer details. The user just reviews and hits "Send."
- If a Lead doesn't exist in the Customer Directory, converting them to an invoice (or marking them "Won") auto-creates them in the Directory.
- Pipeline data is strictly for forecasting and process tracking — it does NOT hit the General Ledger. Only when the deal is "Won" and the invoice is sent does it become a financial reality in the ledger.
- The Kanban board is responsive: on mobile, it switches to a list view grouped by stage.

**Reason this section exists:**
Not every sale is a "customer walks in, pays, leaves" transaction. A web design agency pitches a KES 500K website, negotiates for 3 weeks, sends a proposal, and finally gets a "go ahead." Without a pipeline, that process lives in the owner's head, a WhatsApp chat, or a scattered Excel file. This section brings it into the platform. The drag-and-drop board is intuitive (Trello-style). The "Convert to Invoice" button eliminates duplicate data entry: the proposal line items become the invoice line items. The stale deal alerts (cards turning red after 14 days) prevent leads from dying of neglect — "You haven't followed up with Client X in 2 weeks, they're going cold."

---

## Section 6.5 — Loyalty, Repeat Rate & LTV Analytics

**What it contains:**
The intelligence layer of the CRM — understanding customer behavior patterns to maximize retention and lifetime value. This section answers: *"Who are my best customers, and how do I get more of them?"*

**Key Metrics Dashboard (Top Cards):**
- **Total Active Customers**: "320 customers with a transaction in the last 90 days" (out of 500 total)
- **Repeat Purchase Rate**: "45% of customers have bought more than once"
- **Average Order Value (AOV)**: "KES 5,500" (trend: up 10% vs. last month)
- **Customer Lifetime Value (LTV)**: "Average customer generates KES 25,000 over their lifetime with us"
- **Churn Rate**: "5% of active customers stopped buying this month"

**Customer Leaderboards:**
- **Top 10 by Revenue**: Table showing the absolute highest spenders, with their purchase count and AOV
- **Top 10 by Frequency**: The customers who buy most often, regardless of amount (e.g., the daily milk buyer vs. the annual furniture buyer)
- **Most Improved**: Customers whose spend this month is >50% higher than their historical average — potential VIPs in the making

**Cohort Analysis (Advanced):**
- "Customers acquired in January 2025": How many are still buying in March? How much have they spent in total? (Visualized as a fading bar chart — standard e-commerce cohort analysis, simplified for SMEs)
- Identifies whether the business is getting better at retaining customers over time

**Loyalty Integration (Points/Wallet):**
- **Simple Points System**: "Earn 1 point per KES 100 spent. 100 points = KES 100 discount." (Configured in Settings)
- **Customer Points Balance**: Shown in the Customer Profile header
- **Redeem Points**: During an invoice creation or at checkout, the customer's points can be applied as a discount
- **Points Ledger**: Per-customer log of points earned (from payments) and points burned (from discounts)

**Detailed information & data points:**
- LTV is calculated using a simple formula: `AOV × Purchase Frequency × Average Customer Lifespan`. The "Average Customer Lifespan" is inferred from historical churn data (if the business has 12+ months of data).
- Cohort analysis runs on a monthly granularity. For businesses with < 6 months of history, it shows a "Not enough data" message.
- The loyalty points system is an optional module (enabled in Settings). If enabled, every completed payment triggers a background calculation that adds points to the customer's profile. Points are treated as a liability on the Balance Sheet (because they represent a future discount).
- Leaderboards are scoped to the selected time period (This Month, This Year, All Time).

**Reason this section exists:**
Retention is cheaper than acquisition. A business that focuses only on getting new customers ignores the goldmine of existing customers. The "Repeat Purchase Rate" metric is a wake-up call for many SMEs: *"Only 20% of my customers come back? I need to fix that."* The LTV metric changes how the owner thinks about marketing spend: *"If a customer is worth KES 25,000 over their lifetime, I can afford to spend KES 2,500 to acquire them."* The cohort analysis shows whether the business's product/service is actually sticky. The simple points system brings loyalty — a concept usually reserved for massive corporations (Safaricom Bonga points, Java Platinum card) — to the kibanda and the local salon, implemented entirely within PayMo.

---

## Section 6.6 — Customer-Linked Receivables

**What it contains:**
A financial view embedded within the CRM that focuses purely on what this specific customer owes the business. This avoids forcing the user to switch back to the Get Paid page's Aging section (Section 1.5) just to see one customer's balance.

**Receivables Card (In Customer Profile):**
- **Total Outstanding**: KES X (large, bold)
- **Current (0-30 days)**: KES Y
- **Aging Buckets**: 31-60 days: KES A, 61-90: KES B, 90+: KES C (with color coding)
- **Overdue Invoices Count**: "3 invoices overdue"

**Linked Invoice Table:**
- A mini-table showing only this customer's unpaid invoices:
  - Invoice #, Issue Date, Due Date, Amount, Days Overdue, Status
  - Actions: "Send Reminder" (opens the SMS/WhatsApp composer pre-filled with a reminder template including the specific invoice details), "View Full Invoice" (opens PDF), "Record Payment"
- **Payment Plan**: If the customer has agreed to a payment plan (e.g., "Pay KES 50K on the 1st and 15th"), it can be noted here with milestones.

**Promise-to-Pay Tracking:**
- When a reminder is sent and the customer replies (via WhatsApp/SMS integration, or manual note), the owner can log: "Customer promised to pay KES 30,000 by Friday."
- This creates a "Promise" card on the customer's profile with a deadline.
- If the deadline passes and no payment is received, the promise turns red: "Broken promise. Follow up required."

**Detailed information & data points:**
- The receivables data is a real-time query of the Get Paid invoice table, filtered by `customer_id`. It is not duplicated data — it's a different view of the same source of truth.
- "Days Overdue" is calculated dynamically based on the current date and the invoice's due date.
- Promise-to-Pay is a CRM-specific feature that does not affect the ledger. It's an operational intelligence tool for the sales/finance team.

**Reason this section exists:**
Contextual collection. If the owner is looking at John Mwangi's profile, they need to see *right there* that he owes KES 150K, that KES 50K is over 90 days, and that he promised to pay KES 30K last Friday but didn't. Without this, the owner has to memorize the balance, switch to Get Paid, filter by John, and try to remember what he said on the phone. The Promise-to-Pay feature is a powerful psychological tool: when the owner calls John, they can say, *"You promised to pay KES 30K on Friday. It's now Wednesday."* It turns collections from a vague "you owe us money" into a specific, accountable conversation.

---

## Section 6.7 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent sticky bar optimized for CRM tasks.

**Actions:**
1. **"Add Customer"** — opens a quick-create modal (Name + Phone, that's it — everything else can be filled later)
2. **"Send Broadcast"** — opens the bulk messaging tool (select segment or manual list, compose, send)
3. **"Add Deal"** — opens the Lead/Deal creation form (Section 6.4)
4. **"Find Customer"** — opens a global search overlay (searches by name, phone, or last 4 digits of their Paybill reference)
5. **"View At-Risk"** — filters the directory to the "At-Risk" smart segment instantly
6. **"Import Contacts"** — opens a CSV upload modal to bulk-import customers from a phone export or Excel sheet
7. **"Run Statement"** — generates a PDF account statement for a selected customer (shows all invoices and payments for a period — ready to send via WhatsApp)

**Context-aware behavior:**
- If the "At-Risk" segment has grown by >20% this month, the "View At-Risk" button pulses amber with "Increasing"
- If a bulk message was sent recently, "Send Broadcast" shows a small "Last sent: 2 hours ago" tooltip to prevent spamming

**Reason this section exists:**
The CRM page can become a deep rabbit hole of customer profiles and timelines. The Quick Actions bar keeps the high-frequency tasks (add a customer, send a message, find someone) one click away, regardless of where the user is currently scrolled. The "Run Statement" action is a specific Kenya SME favorite: landlords and suppliers frequently need to send a "statement of account" to clients, and generating it from the CRM with one click (instead of exporting to Word and formatting) is a massive time-saver.

---
---

# PAGE 7: PRODUCTS & ONLINE STORE (`products-store.html`)

**Zone:** 📦 Your Business
**Mental model for the user:** *"What I sell, displayed beautifully online, with a checkout that works via M-Pesa — my own mini-shop without paying Shopify."*
**Core thesis:** Kenyan SMEs want to sell online but are blocked by Shopify's USD pricing, complex setup, and lack of M-Pesa-native checkout. This page turns the Products catalog (used for invoice line items) into a full e-commerce storefront. The store is a PayMo-hosted page (e.g., `store.paymo.biz/techsol`) with M-Pesa STK push, card, and bank payment options baked in. When an order is placed, inventory drops, the ledger updates, and a CRM profile is created/updated.

---

## Section 7.1 — Product Catalog & Variants Management

**What it contains:**
The master database of everything the business sells. This catalog serves two masters: the Online Store (Section 7.3) and the Invoice Wizard (Get Paid, Section 1.3 — the "Pick from products" feature).

**Product Grid/List:**
- Toggle between Grid view (product image thumbnails) and List view (data-focused table).
- **Grid View Cards**: Image, Product Name, Price (KES), Stock Status (In Stock / Low Stock / Out of Stock — color-coded), Category tag, "Quick Edit" button.
- **List View Columns**: SKU, Name, Category, Price, Cost (for margin calculation), Stock Quantity, Status (Active/Draft/Archived), Actions
- **Filters**: Category, Status, Stock Status, Price Range
- **Search**: By name, SKU, or description
- **Bulk Actions**: Change category, Change status (Archive/Activate), Export catalog, Delete drafts

**Product Creation / Edit Form:**
- **Basic Info**: Name, SKU (auto-generated or manual), Description (rich text editor — bold, lists, links), Short Description (for store listing previews)
- **Pricing**: Selling Price (KES), Cost Price (KES — hidden from customers, used for P&L margin calculation), Compare-at Price (KES — shows a strikethrough "was KES X, now KES Y" discount on the store)
- **Tax**: Taxable (Yes/No — defaults to the business's VAT status), Tax Rate (16% / 0% / Exempt)
- **Organization**: Category (dropdown, user-managed), Tags (for store filtering)
- **Media**: Image upload (drag-and-drop, multiple images, auto-resized). First image is the "featured" image. Support for video (for Enterprise).
- **Variants (If enabled)**: "This product has variations" toggle → opens a variant matrix:
  - Option 1: Size (Small, Medium, Large)
  - Option 2: Color (Red, Blue, Black)
  - Generates a 3×3 grid of variant combinations. Each combination can have its own SKU, Price (e.g., XL costs more), and Stock Quantity.
- **Shipping/Weight** (for logistics integration): Weight (kg), Dimensions (L×W×H). "This is a digital product" toggle (disables shipping, delivers via download link).
- **Status**: Draft (not visible on store), Active (live on store), Archived (hidden but not deleted — preserves history).

**Category Management:**
- Inline management: add, rename, reorder categories via drag-and-drop. Categories can be nested (e.g., Electronics > Phones > Android).

**Detailed information & data points:**
- Products are the bridge between the Store and the Ledger. When a product is sold, the ledger debits "Cost of Goods Sold" (if Cost Price is filled) and credits "Inventory" (if Inventory module is active).
- SKU uniqueness is enforced per business.
- Image storage uses a CDN for fast loading on the storefront. Images are automatically compressed and converted to WebP format.
- Variant management uses a matrix approach, not individual product creation. This means "T-Shirt (Red, Large)" is a variant of "T-Shirt", not a separate product — keeping the catalog clean.
- For service businesses: a "Product" can be a service (e.g., "Consultation — 1 Hour"). It has a price and a description but no inventory or shipping. It appears on the store as a bookable/buyable service.

**Reason this section exists:**
Without a product catalog, every invoice requires typing the same description, price, and tax manually — leading to inconsistencies ("Software Dev" vs. "Software Development" vs. "Dev Services" — which messes up sales-by-product reports). The catalog standardizes what the business sells. The variant management is essential for fashion, retail, and food businesses where a single item (a shoe) has 10 variations (size 6-10, black/brown). Without variants, they'd have to create 10 separate products, which is unmanageable. The dual-purpose design (feeds both invoices and the store) means the business maintains ONE product list, not two.

---

## Section 7.2 — Storefront Builder & Branding

**What it contains:**
A no-code, template-based builder for the business's online store. The goal is not to compete with Shopify's deep customization, but to provide a beautiful, functional, mobile-first storefront in under 30 minutes.

**Store Setup Wizard (First time):**
- **Store URL**: `paymo.biz/your-business` (auto-generated from business name, editable to a custom slug if available)
- **Template Selection**: 5-6 pre-built templates optimized for different industries:
  - "Minimal" (clean, white, for services/digital goods)
  - "Retail" (grid-heavy, categories sidebar, for shops)
  - "Restaurant/Food" (menu-style, appetizing imagery focus)
  - "Catalog/Wholesale" (price-focused, bulk order inquiry)
  - "Portfolio" (image-heavy, for creatives/agencies)
- **Branding Upload**: Business Logo, Brand Color (color picker), Font selection (from 5 professional fonts)

**Storefront Customization Panel:**
- **Header**: Logo alignment (left/center), navigation menu items (Home, Shop, About Us, Contact — links to sections on the page), announcement bar ("Free delivery in Nairobi!").
- **Homepage Layout**: Drag-and-drop sections:
  - Hero Banner (upload image + text + "Shop Now" button)
  - Featured Products (auto-pulls products tagged "Featured")
  - Categories Grid (visual category buttons)
  - Testimonials (text + customer name)
  - Custom HTML/Text block
- **Product Listing Page**: Grid layout (2, 3, or 4 columns), show/hide "Add to Cart" vs "Buy Now", sort options (Price low-high, newest, popular).
- **Footer**: Business address, phone, email, social media links, "Powered by PayMo" (can be removed on Enterprise plan).

**Preview & Publish:**
- **Desktop/Mobile Preview**: Toggle between desktop and mobile views to see exactly what the customer sees
- **Publish**: "Make store live" button. The store goes public at the selected URL.
- **Unpublish**: Take the store offline (shows a "We'll be back" page) without losing any configuration.

**Custom Domain (Advanced):**
- "Connect your own domain" (e.g., `shop.techsol.co.ke`)
- Instructions: Point DNS A record / CNAME to PayMo's IP. PayMo handles SSL certificate provisioning automatically (via Let's Encrypt).

**Detailed information & data points:**
- The storefront is a Server-Side Rendered (SSR) React application hosted on PayMo's edge infrastructure for fast loading in Kenya (even on 3G connections).
- The drag-and-drop builder saves the layout as a JSON configuration — no code is generated, making it safe and versionable.
- SEO basics are handled automatically: meta tags from the business description, Open Graph images for WhatsApp/Facebook link previews, structured data (JSON-LD) for products to help Google indexing.
- The store is responsive by default — the templates are mobile-first, as >80% of Kenyan e-commerce traffic is mobile.

**Reason this section exists:**
Setting up a Shopify store costs $39/month (KES 5,000+), requires a credit card, takes days to configure, and then requires a separate M-Pesa integration (like Pesapal or Kopokopo) that charges additional fees and breaks the native experience. This section gives the business a working, beautiful, M-Pesa-native store in 30 minutes, included in their PayMo subscription. The template approach prevents the "blank canvas paralysis" that kills most DIY website builders. The custom domain option ensures the business looks professional (`shop.mybusiness.co.ke`) rather than using a subdomain.

---

## Section 7.3 — Storefront Checkout & Payment Flow

**What it contains:**
The most critical part of any e-commerce store — the checkout. This section configures how customers actually pay on the PayMo storefront. It is optimized for the Kenyan customer: M-Pesa STK push is the default, not an afterthought.

**Checkout Configuration:**
- **Enabled Methods**: Toggle which payment methods appear on the checkout page:
  - M-Pesa (STK Push) — always first
  - Bank Payment (PesaLink / EFT details shown)
  - Card Payment (Visa/Mastercard — processed via PayMo's card acquiring)
  - Pay on Delivery (creates an order but requires manual payment recording later)
- **Checkout Flow**: Single-page checkout (not multi-step — reduces cart abandonment)
  - Customer enters: Name, Phone (required for M-Pesa), Email (optional), Physical Address (if shipping is enabled)
  - Order Summary: Items, quantities, subtotal, shipping cost, tax (if applicable), total
  - Payment: Select method → Enter M-Pesa phone number → Click "Pay KES X via M-Pesa" → STK push sent → "Enter PIN on your phone..." → "Payment Successful! Order #123 placed."

**Shipping & Delivery Configuration:**
- **Shipping Options**:
  - "No shipping" (digital goods, services, or pick-up only)
  - "Flat rate": KES X for all orders
  - "Price-based": Free shipping above KES Y, KES X below Y
  - "Integration": Connect to a logistics provider (Sendy, Glovo, Bolt Delivery) for live rate calculation based on the customer's address
- **Pick-up Option**: "Pick up from our store: [Address]. Free." — customer selects this at checkout instead of entering a delivery address.

**Order Confirmation & Notifications:**
- **Customer receives**: SMS/Email with order summary, payment receipt, and expected delivery date
- **Business receives**: In-app notification, email, and the order appears in the Order Management section (7.4)

**Abandoned Cart Recovery:**
- If a customer adds items to cart, enters phone number, but leaves before paying:
- After 1 hour: automated SMS: "You left items in your cart at [Store Name]. Complete your order here: [link]"
- After 24 hours: second SMS with a 5% discount code (if enabled)
- "Abandoned Carts" metric shown in Store Analytics (Section 7.6)

**Detailed information & data points:**
- M-Pesa STK push has a ~30-second timeout. If the STK times out (user didn't enter PIN, or network error), the checkout shows: "Payment timed out. Try again or use a different method." The cart is NOT cleared — the user can retry without losing their items.
- The checkout page is designed to load in < 2 seconds on a 3G connection. No heavy JavaScript frameworks on the storefront — it's vanilla JS or lightweight Preact for performance.
- Pay on Delivery orders create an "Unpaid" order in the system. The business must manually record the payment when cash is received, which then triggers the ledger entry and inventory deduction.
- Abandoned cart SMS is an opt-in feature (to comply with anti-spam regulations) but is enabled by default with a pre-written template.

**Reason this section exists:**
Checkout friction is the #1 cause of cart abandonment globally. In Kenya, the friction is usually worse: non-M-Pesa checkouts require the user to copy bank details, open another app, transfer, and upload a screenshot — a 5-minute process. PayMo's STK push checkout reduces this to 30 seconds: click pay, enter PIN on phone, done. The abandoned cart recovery directly recovers lost revenue: a 10% recovery rate on abandoned carts can mean the difference between a profitable and unprofitable month for a new store. The shipping integration (Sendy/Glovo) means the business doesn't have to call a rider manually for every order — it's requested from the checkout flow.

---

## Section 7.4 — Order Management & Fulfillment

**What it contains:**
The operational backend for the online store — receiving, processing, and shipping customer orders. This is where the digital sale becomes a physical (or digital) reality.

**Order Queue / Table:**
- **Tab bar**: New Orders, Processing, Shipped/Completed, Cancelled, All
- **Table Columns**: Order #, Customer Name, Items (expandable), Total (KES), Payment Status (Paid/Unpaid/Refunded), Fulfillment Status (Unfulfilled/Partial/Fulfilled), Date, Actions
- **Expand Order**: Shows full details:
  - Customer contact info (click to call/WhatsApp)
  - Item list with quantities and images
  - Shipping address and selected method
  - Payment details (method, transaction ID, receipt link)
  - Internal notes (only visible to the business)

**Fulfillment Workflow:**
- **Step 1 — Acknowledge**: New order comes in. "Accept Order" button. (If Pay on Delivery, a "Confirm Order" button).
- **Step 2 — Process/Pack**: "Mark as Processing" — triggers an SMS to customer: "Your order is being prepared!"
- **Step 3 — Ship/Deliver**:
  - If logistics integration is active: "Request Pickup" button sends the order details to Sendy/Glovo. A tracking link is generated and sent to the customer.
  - If manual delivery: "Mark as Shipped" — optionally enter a tracking number or delivery rider's phone number. Customer gets SMS: "Your order is on the way! Rider: 0712345678."
- **Step 4 — Complete**: "Mark as Delivered/Completed". Order moves to Completed tab. If it was a digital product, this happens automatically after payment.
- **Cancellation**: "Cancel Order" button at any stage. Reason required (Customer requested, Out of stock, Fraud suspected). If paid, triggers a refund workflow (links to Get Paid Refunds, Section 1.7).

**Packing Slips & Invoices:**
- "Print Packing Slip" button: generates a PDF with order details, shipping address, and item list (no prices — for the physical package).
- "Generate Invoice" button: if an invoice wasn't auto-generated at checkout, creates one and sends it to the customer.

**Detailed information & data points:**
- Orders are tightly linked to the ledger: a "Paid" order has already created a ledger entry (Debit: Cash/M-Pesa, Credit: Sales Revenue). A "Cancelled + Refunded" order creates the reverse entry.
- Inventory is reserved at checkout (stock quantity drops by X when the order is placed, not when it's shipped) to prevent overselling. If the order is cancelled, the inventory is restored.
- The order queue is shared across the team: if User A accepts the order, it disappears from User B's "New Orders" tab to prevent duplicate processing.
- For multi-business: each business has its own store, orders, and fulfillment queue.

**Reason this section exists:**
A store without order management is a liability. If a customer orders and no one processes it, the business looks terrible. This section gives the business a clear, step-by-step workflow for every order: accept → process → ship → complete. The logistics integration turns a chaotic manual process ("call boda guy, give him package, hope he delivers") into a trackable, professional delivery. The packing slip generation saves time for businesses shipping physical goods. The inventory reservation at checkout prevents the "sold out after you bought it" embarrassment.

---

## Section 7.5 — Discount Codes & Promotional Engine

**What it contains:**
Tools to create and manage discount codes, flash sales, and automatic promotions to drive store and invoice sales.

**Discount Code Creator:**
- **Code**: e.g., "EASTER2025" or auto-generate a random string
- **Type**: 
  - Percentage discount (e.g., 10% off)
  - Fixed amount off (e.g., KES 500 off)
  - Free shipping
- **Applicability**: 
  - Entire order
  - Specific products (select from catalog)
  - Specific categories
- **Conditions**:
  - Minimum order value (e.g., "Minimum KES 5,000 to use this code")
  - Maximum discount cap (e.g., "10% off, max discount KES 2,000")
  - Usage limit: "Total uses: 100", "Per-customer uses: 1"
  - Validity: Start date/time, End date/time
- **Status**: Active, Scheduled, Expired, Disabled

**Active Promotions Table:**
- Columns: Code, Type, Discount Value, Uses (Current / Limit), Valid Until, Status, Actions (Edit, Disable, Delete)
- "Performance" column: "Generated KES X in discounted revenue, KES Y in full-price revenue it influenced"

**Flash Sale / Site-Wide Sale Mode:**
- "Activate Flash Sale" button: applies a site-wide discount (e.g., "20% off everything for the next 4 hours") without requiring a code. The storefront displays a banner: "FLASH SALE: 20% OFF! Ends in 3:59:59."
- Auto-reverts to normal pricing when the timer expires.

**Integration Points:**
- Discount codes work on both the Online Store checkout AND in the Invoice Wizard (Get Paid, Section 1.3). A customer can reply to an invoice WhatsApp message with a code, and the business can apply it before sending the updated invoice.

**Detailed information & data points:**
- Discount calculations happen server-side to prevent tampering (a customer cannot modify the JavaScript to apply a 100% discount).
- When a discounted sale occurs, the ledger records the FULL price as Revenue and the discount as a "Sales Discount" contra-revenue account. This ensures the P&L accurately shows gross sales vs. discounts.
- Usage limits are enforced at the database level using atomic increments to prevent race conditions (two customers using the last code simultaneously).

**Reason this section exists:**
Promotions drive sales. Without this tool, the business's only way to offer a discount is to manually edit the invoice amount or create a separate "discounted" product — both are error-prone and don't scale. The code creator with usage limits allows the business to run targeted campaigns ("Give this code to your WhatsApp group: 10% off for the first 50 people"). The Flash Sale mode creates urgency ("20% off for 4 hours") which is a proven conversion driver. The ledger integration ensures that discounts don't silently eat into profits — they show up clearly on the P&L.

---

## Section 7.6 — Store Analytics & Conversion

**What it contains:**
The performance dashboard for the online store — answering: *"Is anyone visiting my store? Are they buying? What's working and what's not?"*

**Key Metrics (Top Cards):**
- **Total Visitors**: "1,250 visits this month" (unique visitors, not page views)
- **Conversion Rate**: "3.2% of visitors placed an order" (Industry average is 2-3%)
- **Total Revenue**: "KES 450,000 from online sales this month"
- **Average Order Value (AOV)**: "KES 1,125"
- **Cart Abandonment Rate**: "68% of people who added to cart didn't pay" (with target: <60%)

**Sales Trend Chart:**
- Daily or weekly revenue line chart for the store, with ability to overlay "Offline/Invoice revenue" for comparison
- Annotations: "March 15: Flash Sale ran. Revenue spiked to KES 45K."

**Product Performance:**
- Table: Product Name, Views (how many times it was viewed on the store), Add-to-Carts, Orders, Conversion Rate (Orders / Views), Revenue
- Highlights: "Top Seller: Product X (KES 100K revenue)" and "Worst Performer: Product Y (100 views, 0 orders — consider removing or repricing)"

**Traffic Sources:**
- Pie chart showing where visitors came from:
  - Direct (typed URL or bookmarked)
  - WhatsApp (clicked a paymo.biz link shared on WhatsApp)
  - Instagram/Facebook (clicked link in bio or post)
  - Google (organic search — basic SEO is working)
  - Other
- This tells the business where to focus their marketing efforts

**Abandoned Cart Analysis:**
- "Top 5 abandoned products" — what do people want but not buy? (Usually a pricing or shipping cost issue)
- "Abandonment by step" — where do they drop off? (Cart page? Checkout page? Payment page?)

**Detailed information & data points:**
- Visitor tracking uses privacy-respecting first-party cookies (no third-party cookies, which are blocked by most browsers and Apple Safari).
- "WhatsApp" as a traffic source is detected via UTM parameters (if the business uses a link like `paymo.biz/techsol?utm_source=whatsapp`) or via referrer headers when possible.
- Conversion rate is calculated as: `(Orders / Unique Visitors) * 100`.
- Analytics data is retained for 24 months. Older data is aggregated into monthly summaries to save storage.

**Reason this section exists:**
"You can't improve what you don't measure." A business that launches a store but doesn't know its conversion rate is wasting money on marketing. If the conversion rate is 1%, the business needs to fix the store (better images, faster loading, cheaper shipping) before spending more on ads. If the conversion rate is 5%, they should pour fuel on the fire (more ads, more WhatsApp shares). The product performance table answers "what should I stock more of?" The traffic sources answer "where should I post my links?" The abandoned cart analysis answers "why aren't people finishing their purchase?" Without this, the store is a black box.

---

## Section 7.7 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent sticky bar for the Products & Store page.

**Actions:**
1. **"Add Product"** — opens the product creation form (Section 7.1)
2. **"View Store"** — opens the live storefront in a new tab (so the owner can see what customers see)
3. **"Create Discount"** — opens the Discount Code creator (Section 7.5) with a "Percentage" default
4. **"Process Orders"** — jumps to the "New Orders" tab in Order Management (Section 7.4) with a badge count of pending orders
5. **"Check Inventory"** — jumps to the Inventory & Stock page (Page 8) filtered to products flagged as "Low Stock"
6. **"Share Store Link"** — copies the store URL to clipboard and offers one-click share to WhatsApp ("Check out our online store: [link]")
7. **"Toggle Store Status"** — a quick toggle to Publish/Unpublish the store (with confirmation if unpublishing)

**Context-aware behavior:**
- If there are >5 "New Orders", the "Process Orders" button pulses red with the count
- If the store is unpublished, the "View Store" button is greyed out and "Toggle Store Status" says "Go Live"
- If a product is out of stock and gets ordered (backorder), a small warning appears near "Check Inventory"

**Reason this section exists:**
Running an online store requires frequent micro-actions: add a new product, check if an order came in, share the link on WhatsApp. The quick actions bar keeps these accessible without navigating away from the current product edit or analytics view. The "Share Store Link" is the most common growth action for a Kenyan SME — they post the link to their WhatsApp status or business group daily. Making it a one-click action with WhatsApp pre-selected removes friction. The order count badge creates a sense of urgency: *"3 people bought something and are waiting for me to ship it."*

---
---

# PAGE 8: INVENTORY & STOCK (`inventory-stock.html`)

**Zone:** 📦 Your Business
**Mental model for the user:** *"What do I have in my store/warehouse, what's running out, and when do I need to order more?"*
**Core thesis:** For retail, F&B, and distribution businesses, inventory is cash sitting on a shelf. If you don't track it, you lose it to theft, spoilage, or stockouts (which lose sales). This page provides real-time stock visibility, automates reordering, and values the inventory for the balance sheet. It integrates tightly with Products & Store (stock drops when sold online) and Pay Suppliers (purchase orders trigger reordering).

---

## Section 8.1 — Stock Dashboard & Low-Stock Alerts

**What it contains:**
The panic board — the first thing a shopkeeper or warehouse manager looks at in the morning. It highlights what needs immediate attention.

**Summary Cards (Top):**
- **Total SKUs**: "245 products tracked"
- **Total Stock Value**: "KES 4,500,000" (calculated using Cost Price from the Products page × Quantity on hand — this is the Balance Sheet "Inventory" asset number)
- **Low Stock Items**: "12 items below minimum threshold" (Red badge)
- **Out of Stock Items**: "3 items at zero" (Dark red badge)
- **Overstock Items**: "5 items above maximum threshold — capital tied up" (Amber badge)

**Low-Stock & Out-of-Stock Table:**
- A filtered table showing ONLY items that are at or below their minimum stock level:
  - Product Name, SKU, Current Stock, Minimum Threshold, Deficit (how many short), Supplier (linked from Pay Suppliers), "Quick Reorder" button
- **Auto-Alerts**: These items trigger daily SMS/email summaries to the manager: "ALERT: Sugar (5kg) is out of stock. Cooking Oil (1L) is low (3 remaining, min is 10)."

**Stock Health Heatmap:**
- A visual grid showing categories vs. stock status. E.g., "Beverages: Green (Healthy). Dairy: Red (Multiple out-of-stocks). Snacks: Amber (Some low)." Allows the manager to spot category-wide issues at a glance.

**Detailed information & data points:**
- "Minimum Threshold" is set per product in the Product Catalog (Section 7.1) or here. A typical setting for a shop: "Coca-Cola 500ml: Min 24, Max 96." (Buys in crates of 24, max shelf space is 4 crates).
- The "Total Stock Value" is a real-time query. It updates instantly when a sale is made (stock drops, value drops) or a purchase order is received (stock increases, value increases).
- Alerts are sent at a configured time (e.g., 8:00 AM daily) so the manager has the list ready when they open the shop.
- For multi-branch: the dashboard can toggle between "Branch A Only", "Branch B Only", and "Consolidated (All Branches)".

**Reason this section exists:**
Stockouts cost sales. If a customer comes to a shop for milk and it's empty, they go to the competitor across the street — and might not come back. Overstock ties up cash that could be used for rent or salaries. This dashboard makes the invisible visible: the manager doesn't have to walk the aisles counting products; they look at the dashboard and know exactly what's missing. The daily alert SMS is critical for owners who aren't physically in the shop every day — they can call the shop assistant and say "Order more cooking oil today."

---

## Section 8.2 — Inventory Grid & Warehouse Locations

**What it contains:**
The detailed, searchable list of every product and exactly where it is located. This moves beyond "I have 50 widgets" to "I have 30 widgets on Shelf A and 20 in the back warehouse."

**Stock Table:**
- Columns: SKU, Product Name, Category, Location/Bin, Quantity on Hand, Reserved (in unpaid carts/orders), Available (On Hand - Reserved), Unit Cost, Total Value, Last Count Date, Actions
- **Search & Filter**: By SKU, name, location, category, stock status (In Stock, Low, Out)
- **Sort**: By Quantity (ascending to see lowest first), by Value (descending to see most expensive items)

**Location / Bin Management:**
- **Locations hierarchy**: Warehouse/Branch → Aisle → Shelf → Bin (e.g., "Nairobi Shop → Aisle 2 → Shelf B → Bin 3")
- "Manage Locations" button opens a tree view to create/edit the warehouse map
- Each variant of a product can have a different location (e.g., Red shirts on Shelf A, Blue shirts on Shelf B)

**Stock Adjustment Quick Actions (Inline):**
- **Add Stock**: "Found 5 extra units under the counter" → inline input: +5, Reason: "Found stock"
- **Remove Stock**: "Damaged 2 units" → inline input: -2, Reason: "Damaged"
- **Transfer**: "Move 10 units to Branch B" → opens transfer modal
- All adjustments require a reason and are logged in the Stock Movement Ledger (Section 8.3). They also update the ledger (Debit: Loss/Damage expense, Credit: Inventory).

**Detailed information & data points:**
- "Reserved" quantity is critical for e-commerce: if 10 people have items in their carts but haven't paid, those 10 items are reserved. The "Available" quantity is what new customers see. This prevents the "sorry, we oversold" problem.
- Location management is optional. A small kibanda might just use "Shop" as the only location. A large distributor might use a full warehouse grid.
- Stock adjustments immediately affect the Balance Sheet. If stock is removed for damage, the business's net worth decreases by the cost price of that item.

**Reason this section exists:**
Knowing *what* you have is step one. Knowing *where* it is saves hours of searching. A warehouse worker with a phone can look up "SKU 12345" and see "Aisle 4, Bin 2" instead of wandering aimlessly. The inline adjustment actions handle the reality of retail: stock gets damaged, misplaced, or found. Without a quick way to record these, the digital stock count slowly diverges from reality, the business loses trust in the system, and goes back to Excel.

---

## Section 8.3 — Stock Movement Ledger

**What it contains:**
The immutable audit trail of every single unit that enters, leaves, or moves within the business. This is the inventory equivalent of the General Ledger.

**Movement Table:**
- Columns: Date/Time, Product/SKU, Type (In, Out, Transfer, Adjustment), Quantity, From Location, To Location, Reference (Invoice #, PO #, Manual Adjustment), Performed By, Notes/Reason
- **Filters**: By product, by type (only show "Out"), by date range, by user
- **Expand**: Shows the exact state before and after the movement

**Movement Types:**
- **Stock In**: Received from supplier (linked to a Purchase Order from Pay Suppliers), Returned by customer, Manual addition (found stock)
- **Stock Out**: Sold (linked to an Invoice from Get Paid or an Order from the Store), Damaged/Expired, Stolen (requires special authorization), Manual removal
- **Transfer**: Moved from Location A to Location B (internal movement, no financial impact, just location change)
- **Adjustment**: Correcting a discrepancy after a physical stock count (e.g., "System says 50, physical count says 48. Adjust -2.")

**Detailed information & data points:**
- Every movement creates a double-entry in the General Ledger: Stock In debits Inventory and credits Accounts Payable (or Cash if paid). Stock Out credits Inventory and debits Cost of Goods Sold (if sold) or Expense/Loss (if damaged).
- Transfers do NOT hit the financial ledger (no money moved, just boxes), but they DO hit the inventory sub-ledger.
- The movement ledger is locked (immutable) once the month-end close is performed in Bookkeeping & Taxes. Adjustments to closed periods require the same "Open Period" approval workflow.

**Reason this section exists:**
Trust in the system. When the dashboard says "You have 100 bags of cement" but the warehouse manager knows there are only 90, the movement ledger is how they investigate. They filter by that product, see every "Out" movement, and find: "Ah, on March 10, 10 bags were moved to 'Site B' but it wasn't recorded properly." Without this ledger, stock discrepancies are unsolvable mysteries. It also serves as an audit tool for theft detection: if "Stock Out: -5 units, Reason: Damaged" happens suspiciously often for high-value items, it flags a potential issue.

---

## Section 8.4 — Purchase Orders & Supplier Reordering

**What it contains:**
The procurement trigger. When stock hits the minimum threshold, this section helps the business request new stock from their suppliers, seamlessly linking to the Pay Suppliers page for actual payment.

**Suggested Reorders (Auto-Generated):**
- The system analyzes current stock vs. minimum thresholds and generates a "Suggested Purchase Order" list:
  - Product, Current Stock, Minimum Threshold, Suggested Order Qty (to reach max threshold), Preferred Supplier (auto-selected from the product's settings or the most-used supplier for this item), Estimated Cost
- The user reviews the list: removes items they don't want to order now, adjusts quantities, changes suppliers.

**Create Purchase Order (PO):**
- From the suggested list or from scratch: "New PO" button
- **PO Form**: Supplier (select from Supplier Directory), Expected Delivery Date, Delivery Location, Items (add products from catalog, enter qty, unit cost auto-fills from last PO or manual), Notes
- **PO Status Workflow**: Draft → Sent to Supplier → Confirmed → Partially Received → Fully Received → Closed
- "Send to Supplier" button: emails or WhatsApps the PO to the supplier's contact on file. "Hi [Supplier], please supply the following: [Item list]. Deliver by [Date]."

**Receiving Against PO:**
- When the delivery truck arrives: "Receive Stock" button on the PO
- Input: Actual quantities received per item (might differ from ordered: "Ordered 100, received 98 — 2 short")
- System performs:
  1. Stock In movement (updates inventory)
  2. Creates a bill in Pay Suppliers (Accounts Payable) for the received quantities × agreed price
  3. PO status updates to "Partially Received" or "Fully Received"
  4. If quantities are short, flags the discrepancy for follow-up with the supplier

**Detailed information & data points:**
- A PO is a non-financial document (it's a promise to buy, not an actual liability). It does NOT hit the General Ledger.
- The liability is created ONLY when the goods are received ("Receive Stock" action), which creates an AP entry and an Inventory entry.
- If a PO is partially received multiple times (e.g., 50 units today, 50 units next week), each "Receive" creates a separate AP entry.
- Suggested reorders use a simple formula: `Order Qty = Max Threshold - Current Stock`. If Max is 100 and Current is 10, suggest 90.

**Reason this section exists:**
Reordering is currently a reactive, memory-based process: "I think I need to order sugar, let me call the supplier." This section makes it proactive and data-driven: the system tells you what to order, in what quantity, from whom, and creates the PO in 2 minutes. The "Receive against PO" workflow prevents the common mistake of paying for 100 units but only receiving 95 — the system catches the 5-unit shortfall and adjusts the payable amount automatically. Linking POs to the Supplier Directory ensures the business maintains its procurement history per supplier.

---

## Section 8.5 — Batch, Expiry & Serial Number Tracking

**What it contains:**
Specialized tracking for businesses that need it: pharmacies (expiry dates are life-or-death), electronics (serial numbers for warranties), and food/FMCG (first-expiry-first-out rotation).

**Batch/Expiry Management:**
- When receiving stock (in Section 8.4), the user can specify: "These 100 units are Batch #B123, Expiry Date: Dec 2025"
- **Expiry Dashboard**: Table of all batches sorted by nearest expiry date. Red if expired, Amber if expiring within 3 months, Green if safe.
- **FEFO Enforcement (First Expired, First Out)**: When a sale is made, the system automatically deducts from the batch with the nearest expiry date, not just the oldest batch.
- **Auto-write-off**: When a batch reaches its expiry date, the system generates a stock adjustment: "Batch B123 expired. Adjust -50 units. Reason: Expired." (Requires user confirmation to prevent accidental write-offs).

**Serial Number Tracking:**
- When receiving high-value items (phones, laptops, TVs), the user enters the serial numbers (or scans barcodes).
- **Serial Number Registry**: Database of every serial number, its current status (In Stock, Sold, Returned, In Repair), and which customer it was sold to.
- **Warranty Link**: When sold, the serial number is linked to the customer's profile and the invoice. If the customer returns it, the serial number validates the warranty.
- **Sale Deduction**: When selling a serialized product, the system asks "Scan/Enter Serial Number" to specify exactly which unit is being sold.

**Detailed information & data points:**
- Batch/Expiry tracking adds complexity. It is an optional module that the business enables in Settings if they need it. A shoe shop doesn't need it; a pharmacy does.
- FEFO deduction logic queries the inventory table ordered by `expiry_date ASC` and deducts from the first row.
- Serial number scanning supports standard 1D/2D barcodes via the device camera (mobile) or a connected USB barcode scanner (desktop).

**Reason this section exists:**
For a pharmacy, selling an expired drug is a criminal offense. For an electronics shop, a customer returning a stolen phone (with a different serial number than on the receipt) is fraud. These use cases require granular tracking that basic "I have 50 units" inventory cannot provide. The FEFO enforcement ensures stock rotation happens automatically — the shop assistant doesn't have to check dates manually. The serial number registry turns a product into a tracked asset from the moment it enters the shop to the moment it leaves.

---

## Section 8.6 — Stock Valuation & Asset Reports

**What it contains:**
Financial reporting specific to inventory — calculating exactly what the stock on hand is worth for the Balance Sheet and identifying dead stock.

**Valuation Methods:**
- The system supports three standard accounting valuation methods (selected in Settings, applied globally):
  - **FIFO (First In, First Out)**: Assumes the oldest stock is sold first. In an inflationary environment, this results in lower Cost of Goods Sold and higher inventory value.
  - **Weighted Average Cost**: Average cost of all units in stock. Simplifies calculation.
  - **Specific Identification**: Used only with Serial Number tracking — uses the exact cost of the specific serial number sold.
- The selected method directly affects the P&L (COGS calculation) and the Balance Sheet (Inventory asset value).

**Stock Valuation Report:**
- Table: Product, Quantity on Hand, Unit Cost (based on valuation method), Total Value
- **Total Inventory Value**: The number that goes on the Balance Sheet
- **Comparison**: "Last month: KES 4.2M. This month: KES 4.5M. Change: +KES 300K (purchased more than sold)."

**Dead Stock / Slow-Moving Analysis:**
- Identifies products that haven't sold in X days (configurable: 30, 60, 90 days)
- "Dead Stock Value": "You have KES 500,000 in stock that hasn't moved in 90 days. This is tied-up capital."
- Suggestions: "Consider discounting [Product X] to clear it."

**Stock Turnover Ratio:**
- "How many times per year do you sell your entire inventory?"
- Calculated as: `Cost of Goods Sold / Average Inventory Value`
- A higher ratio is better (efficient). A low ratio means overstocking or slow sales.

**Detailed information & data points:**
- Changing the valuation method (e.g., from FIFO to Weighted Average) is a significant accounting event. The system restricts this change to be made only at year-end or with accountant approval, as it retrospectively changes COGS and profit figures.
- Dead stock analysis runs as a nightly batch job, scanning all sales for the last 90 days.

**Reason this section exists:**
Inventory value is often a business's largest current asset. If the owner thinks they have KES 5M in stock but their valuation method is wrong, their Balance Sheet is a lie. The Dead Stock analysis is a massive eye-opener for retailers: *"I have KES 500K sitting on a shelf gathering dust?"* That KES 500K could be used to pay salaries or buy fast-moving stock. The Stock Turnover Ratio is a standard financial metric that investors and banks look at — providing it automatically elevates the business's financial reporting.

---

## Section 8.7 — Multi-Branch Stock Transfers

**What it contains:**
For businesses with multiple locations (2 shops, a shop + a warehouse, 5 branches). Managing stock across locations is a logistical nightmare without a central system.

**Branch/Locations Overview:**
- Cards for each branch/location showing: Name, Total Stock Value, Number of SKUs, "Low Stock" count, Manager name
- "Consolidated View": total stock across all branches for each SKU

**Transfer Workflow:**
- **Initiate Transfer**: "Transfer Stock" button → Select Source Branch, Select Destination Branch, Select Products (search catalog), Enter Quantities, Reason (e.g., "Branch A out of stock, Branch B has surplus"), Expected Arrival Date
- **Status**: Pending → In Transit → Received at Destination → Completed
- **In Transit Visibility**: While goods are on the road, they are "In Transit" — not counted in Branch A (deducted) and not yet counted in Branch B (pending receipt). This prevents the stock from "disappearing" during travel.
- **Receive at Destination**: Branch B manager confirms receipt. Quantities can be adjusted if goods were damaged in transit (creates a "Transit Loss" adjustment).
- **Transfer Ledger**: Full audit trail of all inter-branch movements.

**Detailed information & data points:**
- Transfers create journal entries only if there's a transfer pricing arrangement (Branch A "sells" to Branch B at cost + markup). If it's a simple stock movement within the same legal entity, no financial ledger entry is made, only inventory sub-ledger entries.
- "In Transit" requires a "Transit Location" to be created in the location hierarchy.

**Reason this section exists:**
A common scenario: Shop A runs out of Sugar. The owner knows Shop B has extra. Without this feature, they call Shop B: "Send 5 bags." Shop B sends them. A week later, Shop A's accounts are off because they didn't record receiving them, and Shop B's accounts are off because they didn't record sending them. This workflow makes inter-branch transfers formal, tracked, and accountable. The "In Transit" status is the key to accuracy — it accounts for the stock while it's in a matatu between branches.

---

## Section 8.8 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent sticky bar for Inventory.

**Actions:**
1. **"Receive Stock"** — opens a quick modal: scan barcode/type SKU → enter qty → select reason (PO, Return, Manual) → submit
2. **"Dispatch Stock"** — opens quick modal: scan barcode/type SKU → enter qty → select reason (Sold, Transfer, Damage) → submit
3. **"Check SKU"** — search overlay: type SKU or product name → shows current stock, location, and status instantly
4. **"Create PO"** — opens Purchase Order creator (Section 8.4)
5. **"Print Barcode"** — generates printable barcode labels for products that don't have them (integrates with standard thermal printers)
6. **"Run Stock Count"** — initiates a digital stock-taking workflow (freezes stock adjustments, provides a list to count against, calculates variances)
7. **"View Transfers"** — jumps to the Transfer table showing "In Transit" items

**Context-aware behavior:**
- If an item is completely out of stock and a customer tries to buy it on the store, a small "Out of stock alert" flashes near "Receive Stock"
- If a PO is overdue (expected delivery was yesterday), "Create PO" shows a "1 PO overdue" badge

**Reason this section exists:**
Warehouse workers and shop assistants don't have time to navigate through dashboards and menus. They need to do three things fast: receive stock, dispatch stock, and check where something is. The "Receive/Dispatch Stock" quick actions are designed for a mobile phone held in one hand while stacking shelves with the other. The "Print Barcode" action bridges the digital-physical gap — a business can tag their physical shelves with barcodes generated from PayMo, enabling the "Check SKU" scanner to work instantly.

---
---

# PAGE 9: FUNDING, CREDIT & LENDING (`funding-credit.html`)

**Zone:** 🚀 Grow
**Mental model for the user:** *"I need cash to grow, buy stock, or bridge a gap — and I want to use my PayMo data to get it faster and cheaper than a bank."*
**Core thesis:** Kenyan SMEs are chronically underbanked. Banks require 6 months of bank statements, collateral (title deeds), and take 3 weeks to approve a KES 500K loan. PayMo has real-time, verified data on the business's cash flow, revenue, and expenses. This page turns that data into a credit score that unlocks instant, affordable credit — working capital, invoice factoring, and asset finance — without ever leaving the platform.

---

## Section 9.1 — Credit Health Dashboard & Score

**What it contains:**
The business's financial fitness report. This is the equivalent of a CRB (Credit Reference Bureau) score, but based on *actual PayMo transaction data* rather than just loan repayment history.

**PayMo Credit Score:**
- A large, prominent score out of 1000 (e.g., "785 — Good").
- **Score Gauge**: Green (750+, Excellent), Light Green (650-749, Good), Amber (500-649, Fair), Red (<500, Poor).
- **Factors affecting your score** (transparency):
  - ✅ Revenue consistency: "Your monthly revenue has been stable or growing for 6 months (+50 pts)"
  - ✅ Low default rate: "You have no overdue taxes or unpaid supplier invoices (+40 pts)"
  - ⚠️ Cash reserve: "Your average cash balance is low relative to your expenses (-20 pts)"
  - ✅ Account age: "You've been on PayMo for over 1 year (+30 pts)"
  - ✅ Data completeness: "Your bookkeeping is up to date and reconciled (+20 pts)"

**Loan Readiness Indicator:**
- "Based on your score, you qualify for up to KES [X] in working capital at [Y]% per month."
- "To unlock higher limits: increase your cash reserves or maintain revenue for 3 more months."

**External CRB Status (Optional Link):**
- "Link your CRB report" — the business authorizes PayMo to pull their formal CRB report from Metropol/CreditRef.
- If linked, the PayMo score is blended with the CRB score for a more holistic view.
- Alerts: "A negative CRB entry was posted by [Bank] on [Date]. Reason: Late loan repayment. This may affect your score."

**Detailed information & data points:**
- The PayMo Credit Score is calculated by a proprietary model running on the platform's data warehouse. It uses: monthly revenue trend, expense ratio, cash buffer days, receivables aging, tax compliance status, and platform tenure.
- The score updates monthly (on the 1st) to give the business time to improve before the next evaluation.
- Loan products (Sections 9.2 - 9.6) use this score to determine eligibility, interest rate, and limit. A higher score = lower rate, higher limit.
- The score is NOT shared with third parties without explicit user consent.

**Reason this section exists:**
Most SMEs don't know their creditworthiness. They only find out they have a bad CRB score when a bank rejects their loan. The PayMo Credit Score gives them a proactive, real-time view of their financial health, along with *actionable advice* on how to improve it. It gamifies financial discipline: "If I reconcile my bank account and pay my VAT on time for 3 months, my score will go up and I'll qualify for a cheaper loan." This turns the entire Bookkeeping & Taxes page into a tool for accessing cheaper credit.

---

## Section 9.2 — Working Capital Loans (Instant)

**What it contains:**
The bread-and-butter SME credit product. Short-term, revenue-backed loans for buying stock, paying salaries during a slow month, or bridging a cash flow gap.

**Pre-Approved Offer:**
- Based on the Credit Score, the system shows: "You're pre-approved for up to KES 2,000,000."
- **Sliders for customization**:
  - Loan Amount: KES 50,000 to KES 2,000,000 (slider)
  - Repayment Period: 1 month, 3 months, 6 months (buttons)
- **Dynamic Calculation**: As the user moves the sliders, the display updates in real-time:
  - Loan Amount: KES 500,000
  - Interest Rate: 2.5% per month (based on score — lower score = higher rate, e.g., 4%)
  - Total Interest: KES 37,500 (for 3 months)
  - Total Repayment: KES 537,500
  - Monthly Installment: KES 179,167
  - Disbursement Fee: KES 1,000 (one-time)
  - "Net to your account: KES 499,000"

**Application Flow:**
- "Apply Now" button → Review terms → Confirm purpose (Stock, Salaries, Utilities, Other) → "Disburse to [Select Account: M-Pesa Float or Bank Account]"
- **Instant Decision**: "Approved! Money will be in your M-Pesa float in 5 minutes." (For pre-approved amounts. Larger amounts might take 24 hours for manual review).

**Repayment Mechanism:**
- **Auto-deduction**: PayMo automatically deducts the monthly installment from the business's incoming collections (takes a percentage of every M-Pesa Paybill/payment link collection until the installment is met) OR from the bank account via EFT/Rtgs on the due date.
- "Top up repayment" button: the business can make early or extra payments to reduce interest.

**Detailed information & data points:**
- Working capital loans are unsecured (no collateral required). They are backed by the cash flow data PayMo has — PayMo *knows* the business makes KES 2M/month, so a KES 500K loan is low risk.
- Interest is calculated on a reducing balance basis (standard in Kenya).
- Auto-deduction from collections is the "split-payment" model: when a customer pays KES 10,000 to the business, PayMo routes KES 9,000 to the business and KES 1,000 to the loan repayment. This drastically reduces default rates compared to relying on the business to remember to pay.
- If auto-deduction fails (low collections), the loan becomes overdue, the Credit Score drops, and the business's PayMo account may be restricted (cannot initiate supplier payments) until the arrears are cleared.

**Reason this section exists:**
A shopkeeper needs KES 200K to buy Christmas stock. A bank will ask for a title deed, logbook, or 6 months of stamped bank statements, and take 3 weeks. The stock opportunity is gone by then. With this section, the shopkeeper logs into PayMo, sees they're pre-approved for KES 500K, slides the amount to 200K, selects 1 month, and has the money in their M-Pesa float in 5 minutes. The auto-deduction from collections means they don't have to remember the repayment date — it just happens as they sell. This is the "killer feature" for SME growth.

---

## Section 9.3 — Invoice Factoring (Advance on Unpaid Invoices)

**What it contains:**
A lifeline for businesses with solid clients who pay slowly (e.g., a supplier to a big corporate like Safaricom or government, which pays on 60-90 day terms). Factoring allows the business to get 80-90% of the invoice value *today*, and PayMo collects the full amount from the client in 60 days.

**Eligible Invoices Table:**
- The system scans the Get Paid receivables (Section 1.5) and identifies invoices that qualify for factoring:
  - Must be from a creditworthy debtor (PayMo has a database of corporate payment behavior)
  - Must not be overdue yet (or only slightly overdue)
  - Must be above a minimum amount (e.g., KES 100,000)
- Table: Invoice #, Customer Name (Debtor), Amount, Due Date, "Advance Available" (e.g., 85% of KES 1M = KES 850K), "Factoring Fee" (e.g., 2% = KES 20K), "Net to you today" (KES 830K), Action: "Factor This Invoice"

**Factoring Flow:**
- "Factor This Invoice" → Review terms: "We will advance you KES 850K today. When Customer X pays the KES 1M invoice on April 30, we will remit the remaining KES 150K to you, minus our fee of KES 20K." → Confirm.
- **Notification**: The debtor (Customer X) is notified that the invoice has been factored and that payment should be made to a PayMo-designated account (not directly to the business). This is standard factoring practice.
- **Funds Disbursed**: KES 850K hits the business's account.
- **Collection**: PayMo's collections team (or automated system) follows up with the debtor on the due date. When paid, the remainder is remitted.

**Factoring Portfolio:**
- Table of all factored invoices: Invoice #, Debtor, Total Value, Advanced Amount, Fee, Status (Advanced, Collected, Overdue), Expected Remittance Date.

**Detailed information & data points:**
- This is "Non-Recourse" or "Recourse" factoring depending on the debtor's risk profile. For high-risk debtors, PayMo might require the business to buy back the invoice if the debtor defaults (Recourse). For blue-chip companies, PayMo takes the risk (Non-Recourse). The terms are clearly displayed.
- Factoring creates a complex ledger entry: Debit Cash (advance), Debit Factoring Fee (expense), Credit Accounts Receivable (removes the invoice from the business's books).

**Reason this section exists:**
Many profitable SMEs go bankrupt because their cash is tied up in unpaid invoices. They have KES 5M in receivables but KES 0 in the bank, so they can't pay salaries. Factoring unlocks that trapped cash. The traditional factoring process in Kenya involves banks, lawyers, and weeks of paperwork. PayMo's version is instant because PayMo already has the invoice data and the ledger — the business just clicks "Factor" on an unpaid invoice. The notification to the debtor is handled automatically, removing the awkward "please pay PayMo instead of me" conversation.

---

## Section 9.4 — Business Credit Line (Revolving)

**What it contains:**
A flexible, "always-on" credit facility. Unlike a term loan (which is a lump sum), a credit line allows the business to draw down and repay flexibly, paying interest only on the amount used.

**Credit Line Summary:**
- **Approved Limit**: KES 1,000,000
- **Available Balance**: KES 800,000 (KES 200,000 currently drawn)
- **Drawn Amount**: KES 200,000
- **Interest Rate**: 2% per month on the drawn amount (KES 4,000/month)
- **Minimum Monthly Payment**: 5% of drawn amount or KES 10,000 (whichever is higher)

**Draw Down:**
- "Draw Funds" button → Enter amount (up to available balance) → Select destination account → "Receive KES X". Instant disbursement.

**Repayment:**
- "Repay" button → Enter amount → Select source account → "Repay KES X"
- **Auto-Repay**: Optional setting: "Automatically repay 20% of incoming collections towards the credit line until it's cleared."
- As the principal is repaid, the "Available Balance" increases — the business can borrow again without re-applying.

**Credit Line Activity:**
- Table of all draws and repayments: Date, Type (Draw/Repayment/Interest Charged), Amount, Outstanding Balance after transaction.

**Detailed information & data points:**
- The credit line limit is reviewed quarterly based on the updated Credit Score. Good behavior (on-time repayments, growing revenue) leads to automatic limit increases ("Congratulations, your limit has been increased to KES 1.5M").
- Interest is calculated daily on the outstanding balance and charged monthly.

**Reason this section exists:**
A term loan is for a specific purpose (buy a machine). A credit line is for the unpredictable gaps: "I need to pay KES 50K for an emergency plumbing fix today, I'll repay it when 3 clients pay me next week." It's the financial safety net. The revolving nature means the business only pays for what it uses. The auto-repay feature makes it completely passive — the business doesn't have to think about repayment, it just happens as money comes in.

---

## Section 9.5 — Loan & Repayment Management

**What it contains:**
The central hub for managing ALL active credit facilities (working capital loans, factoring fees, credit line) across the business.

**Active Facilities Table:**
- Type (Working Capital, Credit Line, Asset Finance), Provider (PayMo, or external loans if manually added), Principal Amount, Outstanding Balance, Interest Rate, Monthly Installment, Next Payment Date, Status (Current, Overdue, Cleared)

**Repayment Schedule Calendar:**
- Visual calendar showing all upcoming loan repayments for the next 3 months
- Click a date to see: "KES 50K PayMo Working Capital + KES 20K Credit Line = KES 70K total due"
- "Pay All Due Today" button: initiates payment for all items due on the selected date

**Early Repayment Calculator:**
- For term loans: "If I repay my KES 500K loan today (instead of in 3 months), I will save KES X in interest. Early repayment fee: KES Y. Net savings: KES Z."
- "Settle Loan Early" button (if savings are positive).

**External Loan Tracking:**
- "Add External Loan" button: for bank loans, Sacco loans, or shylocks that aren't on PayMo. The user enters the terms, and PayMo tracks the repayment schedule and adds it to the total debt picture.
- This gives the business a TRUE view of their total debt burden, not just their PayMo debt.

**Detailed information & data points:**
- External loan tracking is manual (the user enters payments) but valuable for the Credit Score (PayMo can see the total debt burden and assess affordability more accurately).
- Overdue payments trigger the same cascading effects as Working Capital loans: Credit Score drops, account restrictions apply.

**Reason this section exists:**
A business might have a PayMo loan, a KCB loan, a Sacco loan, and a mobile loan. If they only see the PayMo loan in PayMo, they have a fragmented view of their debt. This section consolidates all debt into one view. The repayment calendar prevents the "I forgot the Sacco loan was due today" surprise. The early repayment calculator shows the business that paying off debt faster saves real money, turning debt reduction into a motivating financial goal.

---

## Section 9.6 — Asset & Equipment Financing

**What it contains:**
Term loans specifically for purchasing business assets (delivery motorbikes, fridges, computers, machinery). The asset itself serves as collateral, making it easier to qualify than unsecured working capital.

**Asset Finance Application:**
- "Finance an Asset" button opens a guided form:
  - **Asset Details**: What are you buying? (Category: Transport, Electronics, Machinery, Furniture). Description, Supplier (from Supplier Directory or manual), Invoice/Quote upload (to verify the price).
  - **Cost & Deposit**: Total Asset Cost, Deposit Amount (business pays e.g., 20% upfront), Finance Amount (the 80% loan).
  - **Terms**: 6, 12, 24, or 36 months. Interest rate (based on Credit Score and asset type — motorbikes have different risk than computers).
- **Application Review**: Because asset finance involves a physical asset, it's not instant. PayMo reviews the quote, may inspect the asset (or verify via supplier), and pays the supplier directly (PayMo never gives the cash to the business for asset finance — it pays the supplier to prevent misuse).

**Asset Register (Tied to Finance):**
- If the business uses PayMo's asset finance, the asset is automatically added to an Asset Register:
  - Asset Name, Serial Number, Location, Purchase Date, Cost, Financed By (PayMo), Outstanding Loan Balance, Depreciation Schedule
- This feeds the Bookkeeping page (depreciation calculations) and the Balance Sheet (Fixed Assets).

**Detailed information & data points:**
- PayMo pays the supplier directly via bank transfer. The supplier confirms delivery, and the loan repayment starts 30 days later.
- The asset is hypothecated to PayMo (legal collateral) until the loan is fully repaid. If the business defaults, PayMo has the right to seize the asset.
- The Asset Register solves a major bookkeeping gap: most SMEs don't track their fixed assets or calculate depreciation. By tying it to finance, it happens automatically.

**Reason this section exists:**
A boda boda rider needs a KES 150,000 motorbike but only has KES 30,000. A bank won't lend to them. A shylock will charge 20% per month. PayMo Asset Finance offers a 3% per month, 12-month loan, pays the bike dealer directly, and automatically deducts repayments from the rider's daily collections. The rider gets the asset, builds their credit score, and the asset is tracked on their balance sheet. This is financial inclusion in action.

---

## Section 9.7 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent sticky bar for Funding & Credit.

**Actions:**
1. **"Borrow Now"** — jumps to the Working Capital loan slider (Section 9.2) with the pre-approved amount pre-selected
2. **"Factor Invoice"** — jumps to Eligible Invoices table (Section 9.3) sorted by largest amount
3. **"Draw from Line"** — opens a quick modal: "Enter amount to draw from your KES 1M credit line" → one-click confirm
4. **"Make Repayment"** — opens a quick modal: "Pay KES X towards your outstanding balance" → select source account → confirm
5. **"Check Score"** — opens a tooltip/modal showing the current Credit Score and top 3 ways to improve it
6. **"Add External Loan"** — opens the External Loan Tracker form (Section 9.5)
7. **"Finance Asset"** — opens the Asset Finance wizard (Section 9.6)

**Context-aware behavior:**
- If the Credit Score has improved since last month, "Check Score" shows a green upward arrow: "Score up 15 pts!"
- If a loan repayment is due in <3 days, "Make Repayment" pulses amber with the due amount
- If an invoice qualifies for factoring that didn't yesterday (e.g., it just crossed the 30-day threshold), "Factor Invoice" shows a "New!" badge

**Reason this section exists:**
Credit needs are often urgent. The business owner doesn't want to navigate through dashboards when they need KES 100K in the next 10 minutes to secure a deal. The "Borrow Now" and "Draw from Line" quick actions turn a 5-minute process into a 30-second process. The "Check Score" action keeps financial discipline top-of-mind, tying everyday business behavior (paying taxes on time, keeping books reconciled) to the tangible reward of cheaper credit.

---
---



# PAGE 10: INSURANCE & PROTECTION (`insurance-protection.html`)

**Zone:** 🚀 Grow
**Mental model for the user:** *"If my shop burns down, my delivery bike is stolen, or my employee gets hurt, I don't lose my business."*
**Core thesis:** Insurance is sold, not bought. SMEs avoid it because it's perceived as complex, expensive, and dominated by jargon-heavy brokers who require physical paperwork. PayMo turns insurance into a seamless, contextual feature. Because PayMo already knows the business's assets (from Asset Finance/Inventory), their staff (from Payroll), and their stock value (from Inventory), it can generate instant, accurate quotes. The user clicks "Insure" and a policy is issued in minutes, with premiums deducted from their PayMo balance.

---

## Section 10.1 — Insurance Dashboard & Coverage Health

**What it contains:**
The executive overview of the business's risk profile. This section answers the question: *"Am I protected, or am I exposed?"* It highlights gaps in coverage before a disaster happens.

**Coverage Summary Cards:**
- **Total Annual Premium**: "KES 180,000/year" (with monthly breakdown: "KES 15,000/month deducted automatically")
- **Total Coverage Value**: "KES 12,500,000" (The maximum amount PayMo/underwriters will pay out across all active policies)
- **Active Policies**: "4 policies active" (with green checkmarks)
- **Exposures (Gaps)**: "2 unprotected areas" (Red warning badge — e.g., "KES 4M in stock is uninsured", "5 employees lack WIBA cover")

**Risk Exposure Map (Visual):**
- A simple matrix or list showing the business's assets/risks on one axis and their protection status on the other:
  - Physical Shop/Warehouse: 🟢 Covered (Fire & Burglary active)
  - Delivery Motorbikes (2): 🟢 Covered (Comprehensive)
  - Stock-in-Trade: 🔴 Uninsured (KES 4.5M at risk)
  - Employees (8): 🟡 Partially Covered (3 have WIBA, 5 do not)
  - Public Liability: 🔴 Uninsured (Customer injury risk)

**Premium-to-Revenue Ratio:**
- "Your insurance costs are 1.2% of your annual revenue. Industry average for your sector is 1.5%. You are optimally insured." (Provides peace of mind that they aren't over-insured).

**Recent Activity Feed:**
- "Mar 20: WIBA policy for 3 employees renewed. KES 15,000 deducted."
- "Mar 15: Claim #C-456 for damaged laptop approved. KES 45,000 payout processing."

**Detailed information & data points:**
- "Exposures" are dynamically calculated by comparing the business's data in PayMo (Asset Register, Inventory, Payroll) against active insurance policies. If the Asset Register shows a KES 200K fridge but there's no asset policy covering it, it flags as an exposure.
- Coverage values are pulled directly from the policy documents stored in the system.
- The premium-to-revenue ratio is a benchmarking metric that helps the business owner contextualize insurance as a cost of doing business, not a waste of money.

**Reason this section exists:**
Out of sight, out of mind. If insurance is buried in a file cabinet or a broker's office, the business owner forgets what they have and, more importantly, what they *don't* have. The "Exposures" map is the most valuable element here: it turns abstract risk into concrete numbers. *"You have KES 4.5 million in stock sitting in your warehouse, and if it burns down tonight, you get zero."* That red 🔴 is a powerful call to action. The premium-to-revenue ratio prevents the owner from feeling like they are overpaying.

---

## Section 10.2 — Business Liability & Property Cover

**What it contains:**
The foundational insurance every physical business needs. This covers the premises (fire, theft, water damage) and protects against third-party claims (e.g., a customer slips on a wet floor and sues).

**Available Policies:**
- **Fire & Perils / Burglary**: Covers physical loss or damage to the business premises, fixtures, fittings, and contents (furniture, computers) against fire, lightning, explosion, flood, and burglary.
- **Public Liability**: Covers legal liability to third parties for bodily injury or property damage occurring on the business premises (e.g., a ceiling tile falls on a customer's car).
- **Business Interruption**: If a fire forces the business to close for 3 months, this covers the lost revenue and ongoing fixed costs (rent, salaries). *Often bundled with Fire & Perils.*

**Quote & Purchase Flow:**
- **Auto-Fill Magic**: Because PayMo has the business's physical address (from KYB), industry (from Settings), and estimated value of contents (from the Asset Register), the "Get Quote" button pre-fills 80% of the form.
- **Adjustable Variables**: 
  - Sum Insured (Total value of contents/building — system suggests a value based on asset data)
  - Excess (The amount the business pays out of pocket per claim — higher excess = lower premium)
- **Instant Quote Display**: "Premium: KES 45,000/year (KES 3,750/month). Covers up to KES 5,000,000."
- **Purchase**: "Buy Now" → Premium is added to the business's monthly PayMo billing or deducted from their float. Policy document (PDF) is generated instantly and stored in the system.

**Policy Management:**
- Active policy details: Policy number, Insurer (PayMo partners with underwriters like Jubilee, UAP, APA), Period (Start/End date), Sum Insured, Premium.
- "Download Certificate" button (often required by landlords or licensing authorities).
- "Add Interest" note (e.g., "This policy is held in trust for KCB Bank" — required if the premises are mortgaged).

**Detailed information & data points:**
- PayMo acts as an MGAs (Managing General Agent) or corporate agent for established Kenyan insurers. The risk is underwritten by the insurer, but the customer experience is entirely within PayMo.
- Claims are subject to the insurer's standard policy wordings (provided as PDF links for full transparency).
- Monthly premium deductions reduce the barrier to entry. SMEs rarely have KES 45,000 lump sum for annual insurance, but they can afford KES 3,750/month.

**Reason this section exists:**
Getting a fire cover quote in Kenya traditionally involves calling a broker, waiting for them to visit the premises, filling out a 5-page form, and waiting days for a quote. PayMo reduces this to 60 seconds because the data already exists. The monthly payment option is the killer feature—it transforms insurance from a capital expense to an operational expense. The "Download Certificate" button handles the immediate pain point of landlords demanding proof of insurance before renewing a lease.

---

## Section 10.3 — Asset & Equipment Insurance

**What it contains:**
Specialized cover for specific, high-value movable assets (delivery bikes, laptops, generators, specialized machinery). This differs from Property Cover (which covers the building/contents generally) by tracking individual items.

**Insured Asset Register:**
- Table: Asset Name, Serial Number, Value (from Asset Register), Policy Covering It, Status (Covered, Uncovered, Claim Pending)
- **"Insure This Asset" button**: Appears next to any asset in the PayMo system (pulled from Page 9, Section 9.6 or manually added) that does not have an active policy.

**Asset Cover Options:**
- **Comprehensive**: Covers accidental damage, theft, fire, and third-party liability (if it's a vehicle).
- **Third-Party Only**: Usually for vehicles—covers damage to other people/property, but not damage to the asset itself. (Cheaper).
- **Inland Transit**: Covers the asset while it's being moved from one location to another.

**Quote Flow:**
- Click "Insure This Asset" → System pre-fills: Asset Name ("Honda CB125 Motorbike"), Value ("KES 150,000"), Serial Number.
- User selects: Cover type (Comprehensive), Use ("Business delivery"), Excess ("KES 5,000").
- Instant quote: "KES 18,000/year."
- Purchase → Asset is marked as "Covered" in the register.

**Detailed information & data points:**
- If an asset was financed through PayMo Asset Finance (Page 9, Section 9.6), comprehensive insurance is *mandatory* (it's the collateral). This section will block the loan disbursement if insurance isn't active, and will auto-remind the user if the policy is expiring.
- When an asset is disposed of (sold or scrapped), the user must terminate the policy here, and a pro-rata refund is calculated and credited to their PayMo balance.

**Reason this section exists:**
A delivery business's biggest risk is losing its bikes. A tech company's biggest risk is dropping laptops. By integrating insurance directly into the Asset Register, the user doesn't have to maintain a separate spreadsheet of assets to send to a broker. They just click "Insure" next to the asset they just bought or financed. The mandatory link to Asset Finance protects PayMo's loan portfolio while protecting the business.

---

## Section 10.4 — Stock & Goods-in-Transit Insurance

**What it contains:**
Protection for the business's inventory—both while sitting in the warehouse/shop and while on the move.

**Warehouse/Shop Stock Cover:**
- **"Insure My Stock" button**: Pulls the *Total Stock Value* directly from the Inventory & Stock page (Page 8, Section 8.6).
- Shows: "Your current stock is valued at KES 4,500,000."
- Coverage options: "Cover against Fire, Theft, and Flood."
- **Dynamic Adjustment**: Because stock levels fluctuate daily, this policy uses an "Average Clause" or a "Declaration" basis. PayMo automatically sends the monthly average stock value to the insurer so the business isn't over-insured in slow months or under-insured in peak months.

**Goods-in-Transit (GIT) Cover:**
- For businesses that distribute goods (suppliers, distributors, e-commerce deliveries).
- Covers loss or damage to goods while being transported by road (matatu, boda, truck, courier).
- **Integration with Orders/Transfers**: When a multi-branch transfer (Page 8, Section 8.7) or a delivery order (Page 7, Section 7.4) is initiated, the system can automatically apply a GIT cover for that specific shipment based on the invoice/transfer value.
- "Cover this shipment" checkbox at checkout/dispatch.

**Detailed information & data points:**
- GIT is typically priced per KES 1,000 of goods transported, with a minimum premium. It's usually very cheap but vastly underutilized because of the friction of calling a broker for every delivery.
- Automatic stock value declarations (sending monthly averages to the insurer) prevent the dreaded "Average Clause" penalty at claim time, where the insurer reduces the payout proportionally if the business was underinsured.

**Reason this section exists:**
Stock is cash. If a shop burns down, the building might be the landlord's problem, but the KES 5M in stock is the business owner's total loss. The "Insure My Stock" button pulls the exact value from the inventory system, eliminating under-insurance. GIT integration is a micro-insurance miracle: instead of buying an annual GIT policy for KES 10M (which is expensive), the business pays tiny micro-premiums per shipment, *only* when goods are actually moving.

---

## Section 10.5 — Staff Medical, WIBA & Group Life

**What it contains:**
Employee benefits and statutory covers. In Kenya, WIBA (Work Injury Benefits Act) is a statutory requirement for all employers, replacing the old Employer's Liability.

**WIBA (Work Injury Benefits Act) Cover:**
- **Statutory Compliance Tab**: "You have 8 employees. 3 are covered by WIBA. 5 are EXPOSED. Non-compliance can result in KES 100,000+ fines or imprisonment."
- **"Enroll Employees" button**: Pulls the active employee list directly from the Payroll module (Page 2, Section 2.5). The user simply checks the boxes next to the 5 unenrolled employees and clicks "Enroll."
- Premium is based on payroll (a small percentage of gross salary) and is deducted automatically.

**Group Medical (Corporate Health Insurance):**
- **Quote Builder**: Select the employees to cover (from Payroll), select the benefit level (Inpatient only, Outpatient + Inpatient, Maternity, Dental, Optical), select the hospital network (e.g., NHIF/SHIF tier upgrade, or private networks like AAR, Jubilee, Minet).
- **Employee Contributions**: "Contribution split: Employer pays 80%, Employee pays 20%." If enabled, this automatically creates a payroll deduction in the Payroll wizard (Page 2, Section 2.5) so the employee's share is deducted from their net pay.
- **Dependants**: Add spouses and children to the cover via a simple sub-form.

**Group Life Cover:**
- Often bundled with WIBA or Medical. Pays out a multiple of annual salary (e.g., 3x or 4x) to the employee's next of kin in case of death (whether work-related or not).
- Auto-calculates the sum assured based on the employee's current gross salary in the Payroll module.

**Detailed information & data points:**
- SHIF (Social Health Insurance Fund) is mandatory and handled via payroll deductions. This section handles *supplementary* private cover or corporate schemes that sit on top of SHIF.
- When a new employee is added in the Payroll module, they appear here as "Pending Enrollment." The HR user gets a notification: "New hire John Doe needs WIBA and Medical enrollment."
- If an employee is terminated or goes on unpaid leave, the system automatically flags their policies for adjustment to prevent paying premiums for inactive staff.

**Reason this section exists:**
HR administration is a massive burden for SMEs. Enrolling employees in medical insurance usually involves filling out endless forms, sending staff lists via email to an insurance broker, and waiting weeks for ID cards. By pulling staff data directly from Payroll, enrollment takes 2 minutes. The WIBA compliance alert is a lifesaver—most SME owners don't even know WIBA replaced Employer's Liability, and the fines for non-compliance are severe. Automatic payroll deduction for employee contributions eliminates the awkward "please send me your insurance premium via M-Pesa" monthly chase.

---

## Section 10.6 — Claims Intake & Tracking

**What it contains:**
The moment of truth for insurance. If filing a claim is hard, the insurance is worthless. This section provides a frictionless, digital-first claims process.

**"File a Claim" Wizard:**
- **Step 1 — Select Policy**: Dropdown of active policies. (If the user is filing from an Asset profile, it's pre-selected).
- **Step 2 — Incident Details**: Date of incident, Description of what happened (text box), Estimated loss amount.
- **Step 3 — Evidence Upload**: 
  - Photos of damage (camera upload, multiple files)
  - Police Abstract (required for theft, burglary, or road accidents — system provides a link to the NTSA/police abstract application portal if they don't have one)
  - Invoice/Receipt proving ownership and value (auto-attached if the asset was bought via PayMo)
- **Step 4 — Submit**: "Claim submitted. Reference #CLM-2025-089."

**Claims Tracker (Kanban/List View):**
- **Tabs**: Submitted, Under Review, Assessor Assigned, Approved, Paid, Rejected.
- **Claim Card**: Claim #, Policy Type, Incident Date, Amount Claimed, Status, Last Update.
- **Expand Claim**: Full timeline of the claim.
  - "Mar 20: Claim submitted."
  - "Mar 21: Acknowledged by insurer. Loss adjuster assigned: [Name, Phone]."
  - "Mar 25: Loss adjuster visited premises. Report submitted."
  - "Mar 28: Claim approved. Payout of KES 450,000 processing. Expected in 5 business days."
- **Communication Thread**: In-app messaging between the business owner and PayMo's claims support team (or the insurer's adjuster) specific to this claim.

**Payout Tracking:**
- Once approved, tracks the actual disbursement. "Payout of KES 450,000 received into your KCB Current Account on Apr 2. Ref: [Bank Ref]."
- The payout automatically creates a ledger entry: Debit Cash/Bank, Credit Insurance Recovery (Income).

**Detailed information & data points:**
- For low-value, high-frequency claims (e.g., a KES 5,000 phone screen repair under an asset policy), PayMo can offer "Instant Claims" — AI assesses the photo and auto-approves the claim in minutes, paying out immediately.
- For high-value claims (fire, major theft), the traditional loss adjuster process is followed, but the digital tracker keeps the business informed at every stage, eliminating the "my broker isn't answering my calls" anxiety.
- Rejected claims show the specific policy clause that led to the rejection and offer an appeals process.

**Reason this section exists:**
The biggest reason SMEs hate insurance is the claims process—it's opaque, slow, and feels like the insurer is looking for reasons not to pay. This section brings radical transparency. The business owner can see exactly who is handling their claim, what step it's on, and when to expect money. The in-app evidence upload (taking a photo of the broken delivery bike right from the phone) captures evidence immediately, which is crucial for successful claims. Linking the payout to the ledger ensures the recovery is properly accounted for.

---

## Section 10.7 — Policy Renewals & Expiry Management

**What it contains:**
Preventing coverage gaps caused by forgotten renewals. A lapsed policy means a total loss if an incident occurs the next day.

**Renewal Calendar:**
- Visual calendar showing all upcoming policy expiry dates for the next 90 days.
- Color coded: Green (>30 days), Amber (15-30 days), Red (<15 days or Expired).

**Auto-Renewal Engine:**
- **Toggle per policy**: "Auto-renew this policy and deduct premium from my PayMo balance."
- If enabled, 7 days before expiry, the system notifies the owner: "Your Fire & Burglary policy expires in 7 days. We will auto-renew it at KES 48,000/year using your KCB account. [Cancel Auto-Renew] [Change Payment Method]"
- If disabled, the notifications escalate: "URGENT: Your WIBA policy expires TOMORROW. Your employees are exposed. Renew Now."

**Renewal Quote Review:**
- Insurers sometimes increase premiums at renewal. PayMo shows the comparison:
  - "Last Year: KES 45,000. Renewal Quote: KES 48,000 (+6.6%)."
  - **Alternative Options**: "We found a cheaper quote from Insurer B for KES 44,000 for the exact same cover. [Switch & Save]"
- The business can accept the renewal, switch to a cheaper provider, or cancel the policy with one click.

**Certificate Updates:**
- When a policy renews, the new certificate is automatically generated and stored. If the business previously shared the certificate with a landlord or partner, the system offers to "Resend updated certificate to [Landlord Email]."

**Detailed information & data points:**
- Auto-renewal requires a pre-authorized payment method (bank mandate or M-Pesa float standing instruction) on file.
- If the auto-renewal fails (insufficient balance), the system tries the backup payment method, then notifies the owner immediately: "Auto-renewal failed due to insufficient funds. Please top up to maintain coverage."
- Policy expiry checks run daily at midnight. Any policy that expires without renewal is immediately flagged in the Insurance Dashboard (Section 10.1) as an "Exposure."

**Reason this section exists:**
Lapses in coverage are a silent killer. A business pays premiums for 3 years, misses the 4th-year renewal date because the owner was busy, the shop burns down on day 2 of the lapse, and the insurer pays nothing. Auto-renewal eliminates this human error. The renewal quote comparison empowers the business: instead of blindly accepting a broker's price hike, they see alternatives instantly. Resending the certificate to the landlord saves the owner from the last-minute panic when the landlord demands "current proof of insurance" before renewing the lease.

---

## Section 10.8 — Quick Actions Bar (Persistent)

**What it contains:**
The consistent sticky bar for the Insurance page, optimized for fast risk-mitigation actions.

**Actions:**
1. **"Get a Quote"** — opens a modal: "What do you want to insure?" (Property, Asset, Stock, Staff) → routes to the specific quote flow
2. **"File a Claim"** — opens the Claim Wizard (Section 10.6) directly
3. **"Insure My Stock"** — one-click action that jumps to Stock Cover (Section 10.4) showing the current inventory value
4. **"Enroll Staff"** — jumps to WIBA/Medical enrollment (Section 10.5) filtered to show only unenrolled active employees
5. **"Download Certificate"** — quick-pick menu of all active policies to instantly download the PDF certificate
6. **"Check Exposures"** — jumps to the Risk Exposure Map (Section 10.1) highlighting red (uninsured) items
7. **"Pay Premium"** — if there are any manual (non-auto-renewed) premiums due, this button jumps to a payment screen

**Context-aware behavior:**
- If an asset was just added to the Asset Register today, "Insure My Stock" or "Get a Quote" might subtly highlight, suggesting the user insure the new acquisition.
- If a claim was approved 24 hours ago, "File a Claim" changes to "Check Payout" and shows a green checkmark.
- If WIBA is non-compliant (employees unenrolled), "Enroll Staff" pulses red with a compliance warning badge.

**Reason this section exists:**
Insurance is a "background" concern—business owners don't wake up thinking about it daily. The Quick Actions bar ensures that when they *do* need to interact with insurance (a new bike bought, a minor accident occurred, the landlord asked for a certificate), it takes seconds, not minutes of navigating through insurance jargon. The context-aware "Enroll Staff" pulse is a compliance enforcer, making it harder for the owner to accidentally ignore their legal obligations.

---
---


# CONCLUSION OF THE 10-PAGE COMPREHENSIVE OUTLINE

This concludes the exhaustive architectural blueprint for the 10 core operational pages of the restructured PayMo Superapp. 

**Recap of the Architecture delivered across Parts I and II:**

| Page | Zone | Core Promise | Sections |
| :--- | :--- | :--- | :--- |
| **1. Get Paid** | 💰 Money In | Every shilling coming in, from every channel, tracked and collected. | 10 |
| **2. Pay Suppliers** | 💸 Money Out | Every shilling going out, approved, executed, and recorded. | 10 |
| **3. Cash & Accounts** | 🏦 Your Money | All your money, everywhere, growing and forecasted. | 10 |
| **4. Bookkeeping & Taxes** | 📦 Your Business | Books write themselves, taxes file automatically. | 10 |
| **5. Settings & Security** | ⚙️ Run | Set up, secure, compliant, and supported. | 10 |
| **6. Customers & CRM** | 💰 Money In | Turn transactional phone numbers into loyal, growing relationships. | 7 |
| **7. Products & Store** | 📦 Your Business | A Shopify alternative, natively built with M-Pesa checkout. | 7 |
| **8. Inventory & Stock** | 📦 Your Business | Real-time stock visibility, valuation, and automated reordering. | 8 |
| **9. Funding & Credit** | 🚀 Grow | Turn your PayMo data into instant, affordable working capital. | 7 |
| **10. Insurance & Protection**| 🚀 Grow | Instantly quote, buy, and claim insurance without a broker. | 8 |

**Total: 87 deeply expounded sections.**

Every section has been architected to:
1. **Read/Write to the Central Ledger:** The General Ledger (Page 4) remains the single source of truth. A sale on the Store (Page 7) drops stock (Page 8), updates the customer (Page 6), and records revenue (Page 4) simultaneously.
2. **Respect the Multi-Business Context:** The `currentBusinessKey` flows through every data query, allowing property owners and holding companies to switch contexts seamlessly.
3. **Follow the Module Pattern:** Designed to slot directly into the existing `business-dashboard/<module>/pages/` + `components/` + `styles/` TanStack Start architecture without requiring structural rewrites.
4. **Eliminate External Apps:** By covering CRM, e-commerce, inventory, lending, and insurance natively, PayMo transitions from a "payment portal" to a true "Business Operating System."



# PayMo Digital Platform — Comprehensive Page-by-Page Outline (Part III: Growth, Integrations & Portfolio)

## Expansion Architecture Overview (Part III)

This document concludes the exhaustive blueprint for the final four pages of the PayMo superapp. These pages represent the **"Grow"** and **"Run"** zones at their most advanced. They transform PayMo from a collection of business tools into a holistic ecosystem where the user can acquire customers (Marketing), connect their entire software stack (Integrations), protect their assets (Insurance), and manage a complex empire of businesses or rental properties (Portfolio). 

Every page continues the strict architectural pattern: rendering inside the `BusinessShell`, writing to the central General Ledger, and respecting the `currentBusinessKey`.

---

# PAGE 11: INSURANCE & PROTECTION (`insurance-protection.html`)

*(Note: While the core concepts of insurance were introduced in the previous section, this layout strictly follows the exact prompt requirements, explicitly detailing the "Rent/Default Protection", the "Instant Quote & Purchase from Balance" flow, and the specific policy mechanics requested.)*

**Zone:** 🚀 Grow
**Mental model for the user:** *"If my shop burns down, my bike is stolen, my tenant defaults, or my employee gets hurt, PayMo has me covered — and I bought the policy in 60 seconds using my PayMo balance."*
**Core thesis:** Traditional insurance fails SMEs due to friction, jargon, and lack of instant payouts. PayMo uses its own ledger data (asset values, payroll, rental income) to generate instant, accurate quotes. The user doesn't fill out 10-page forms; they click "Insure," and the premium is deducted from their PayMo float.

---

## Section 11.1 — Risk Dashboard & Coverage Health

**What it contains:**
The executive summary of the business's risk profile. It cross-references the business's actual assets and operations against their active policies to find gaps.

**Coverage Summary Cards:**
- **Total Annual Premium**: "KES 180,000/year (KES 15K/month auto-deducted)"
- **Total Sum Insured**: "KES 12.5M across 4 active policies"
- **Active Policies**: "4 Active" (Green) / **Exposures (Gaps)**: "2 Unprotected" (Red pulsing badge)

**Dynamic Risk Exposure Matrix:**
- A live list comparing PayMo data against insurance policies:
  - *Physical Shop*: 🟢 Covered (Fire/Burglary active)
  - *Delivery Bikes (Asset Register)*: 🔴 Uninsured (2 bikes, KES 300K value at risk)
  - *Stock-in-Trade (Inventory Value)*: 🔴 Uninsured (KES 4.5M at risk)
  - *Employees (Payroll Module)*: 🟡 Partial (3 of 8 lack WIBA)
  - *Rental Properties (Portfolio)*: 🟢 Covered (Rent Default active for 3 units)

**Premium-to-Revenue Ratio:**
- "Your insurance costs 1.2% of revenue. Industry average is 1.5%. You are optimally protected without overpaying."

**Detailed information & data points:**
- The "Exposures" are not static. They query the Asset Register, Inventory module, and Payroll in real-time. If the user adds a new KES 500K fridge to the Asset Register, it instantly appears here as an "Uninsured Exposure."
- The matrix acts as a persistent upsell engine for the insurance products, driven purely by the user's own operational data.

**Reason this section exists:**
Out of sight, out of mind. A business owner doesn't wake up thinking about insurance. This dashboard proactively shocks them into action: *"You have KES 4.5 million in stock and zero insurance?"* It shifts insurance from a burdensome purchase to an obvious, data-driven necessity.

---

## Section 11.2 — Business Liability & Property Cover

**What it contains:**
Foundational covers for physical premises against fire, perils, burglary, and third-party injury claims.

**Policy Options:**
- **Fire & Perils/Burglary**: Covers physical loss of premises, fixtures, fittings, and contents.
- **Public Liability**: Covers legal liability if a customer gets injured on the premises (e.g., slips on wet floor).
- **Business Interruption**: If a fire forces closure for 2 months, covers lost revenue and fixed rent costs.

**Instant Quote Flow (Auto-Fill):**
- Click "Get Quote" → System pre-fills 80% of the form using Business Profile (address, industry) and Asset Register (value of contents).
- User adjusts: Sum Insured, Excess level (higher excess = lower premium).
- Display: "Premium: KES 45,000/year. Cover: KES 5,000,000."

**Purchase from Balance:**
- "Buy Now" → Modal: "Pay KES 45,000 from: [M-Pesa Float] OR [KCB Account]. Pay Annual or Monthly?"
- Select "Monthly" → KES 3,750 is automatically added to the business's monthly PayMo billing cycle.
- Policy PDF is generated instantly and stored.

**Detailed information & data points:**
- PayMo acts as a corporate agent/MGA for established Kenyan underwriters (Jubilee, UAP, APA). Risk is borne by the insurer, but the UX is 100% PayMo.
- Monthly premium deduction is the killer feature—SMEs rarely have KES 45K lump sum but can afford KES 3.7K/month.
- "Download Certificate" button provides the PDF instantly, solving the immediate pain point of landlords demanding proof of insurance.

**Reason this section exists:**
Getting a fire cover quote traditionally takes days and involves physical broker visits. PayMo reduces it to 60 seconds because the data (asset values, address) already exists in the superapp. Buying directly from the PayMo balance removes the payment friction entirely.

---

## Section 11.3 — Asset, Equipment & Stock/Transit Cover

**What it contains:**
Granular insurance for specific movable assets (bikes, laptops) and inventory (both in the warehouse and on the road).

**Asset-Specific Cover:**
- Table of assets pulled from the Asset Register (Page 9, Section 9.6).
- Column: "Insure?" button next to uninsured assets.
- Click "Insure Honda CB125" → Pre-fills Value (KES 150K), Serial Number → Select Comprehensive/Third-Party → Instant Quote → Buy.

**Stock (Warehouse) Cover:**
- "Insure My Stock" button → Pulls *Total Stock Value* from Inventory page (e.g., KES 4.5M).
- Uses an "Average Clause" declaration: PayMo automatically sends the monthly average stock value to the insurer so the business isn't penalized for stock fluctuations at claim time.

**Goods-in-Transit (GIT) Micro-Insurance:**
- Integrates directly with Order Management (Page 7, Section 7.4) and Branch Transfers (Page 8, Section 8.7).
- Checkbox at dispatch: "Cover this KES 50,000 shipment for KES 200."
- Micro-premium is added to the order/delivery cost. If the matatu crashes and goods are ruined, the claim is instantly triggered.

**Detailed information & data points:**
- If an asset was financed via PayMo (Page 9), comprehensive insurance is *mandatory* (it's the collateral). The system will block loan disbursement if this insurance isn't active.
- GIT is usually heavily underutilized by SMEs due to friction. Adding a KES 200 checkbox at dispatch makes it frictionless.

**Reason this section exists:**
A delivery business's biggest risk is losing its bikes or its cargo. By tying insurance directly to the Asset Register and the Dispatch workflow, the user doesn't have to maintain separate spreadsheets or call brokers for every delivery. They just click a checkbox.

---

## Section 11.4 — Staff Medical, WIBA & Group Life

**What it contains:**
Employee benefits and statutory covers, deeply integrated with the Payroll module to eliminate HR administration.

**WIBA (Work Injury Benefits Act) Compliance:**
- "You have 8 employees. 5 are EXPOSED to WIBA. Non-compliance fine: KES 100,000+."
- "Enroll All" button → Pulls active employee list from Payroll → One-click bulk enrollment.
- Premium calculated as a percentage of gross payroll and auto-deducted monthly.

**Group Medical (Corporate Health):**
- Quote Builder: Select employees from Payroll, select benefit tier (Inpatient, Outpatient, Maternity, Dental), select hospital network (AAR, Minet, Jubilee).
- Contribution Split: "Employer 80% / Employee 20%." If enabled, this automatically creates a payroll deduction rule in the Payroll Wizard (Page 2, Section 2.5) so the employee's share is netted off their salary automatically.

**Group Life:**
- Pays out 3x or 4x annual salary to next of kin in case of death. Sum assured auto-calculated from Payroll gross salary data.

**Detailed information & data points:**
- When a new employee is added in Payroll, they appear here as "Pending Enrollment." HR gets a notification.
- If an employee is terminated, the system automatically flags their medical/WIBA policies for termination to stop premium leakage.

**Reason this section exists:**
Enrolling staff in medical insurance usually involves endless forms and email chains with brokers. By pulling staff data directly from Payroll, enrollment takes 2 minutes. Auto-deducting the employee's share from their net pay eliminates the monthly "please send your premium via M-Pesa" chase.

---

## Section 11.5 — Rent Default & Tenancy Protection

**What it contains:**
A specialized, highly requested product for the Kenyan market—protecting landlords against the single biggest risk in real estate: a tenant stops paying rent and refuses to leave.

**Policy Mechanics:**
- Covers up to X months of lost rental income (e.g., 6 months) if a tenant defaults.
- Often includes legal cover for the eviction process (lawyer fees, court costs).
- Covers malicious damage to the property by the defaulting tenant.

**Quote & Purchase Flow (Linked to Portfolio):**
- User navigates to the Portfolio page (Page 14), selects "House 3", and clicks "Protect Rent."
- System auto-fills: Monthly Rent (KES 40,000), Tenant Name (from CRM), Lease Start/End dates.
- Quote: "Premium: KES 8,000/year. Covers up to KES 240,000 (6 months rent) + KES 50,000 legal fees."
- Buy from Balance → Policy bound instantly.

**Claim Trigger (Integrated with Receivables):**
- If rent becomes 60 days overdue (tracked in Get Paid/Receivables), the system prompts: "Rent for House 3 is 60 days late. Do you want to file a Rent Default claim?"
- Initiates the claims wizard, pre-filling the tenant's details and the arrears amount.

**Detailed information & data points:**
- This requires specific underwriting. PayMo partners with insurers who specialize in landlord products (emerging heavily in Kenya).
- The premium is remarkably low compared to the risk (e.g., KES 8K to insure KES 240K of income).
- This product is *only* visible/available if the business has the "Property/Rental" entity preset activated in the Portfolio page.

**Reason this section exists:**
A tenant defaulting can bankrupt a small landlord. The eviction process in Kenya takes months and costs thousands in legal fees. This product is a game-changer for the "5-house portfolio" use case, turning a catastrophic risk into a manageable, insured expense.

---

## Section 11.6 — Claims Intake, Status & Payout

**What it contains:**
The moment of truth. If filing a claim is hard, the insurance is worthless. This section provides a frictionless, digital-first process.

**"File a Claim" Wizard:**
- **Step 1**: Select Policy (or auto-selected if initiated from an asset/property page).
- **Step 2**: Incident details (Date, Description, Estimated loss).
- **Step 3**: Evidence upload (Camera for photos of damage, document upload for Police Abstract).
- **Step 4**: Submit → Claim Reference #CLM-XXX generated.

**Claims Tracker (Kanban/Timeline):**
- Tabs: Submitted → Under Review → Assessor Assigned → Approved → Paid → Rejected.
- Digital timeline: "Mar 20: Submitted. Mar 21: Loss adjuster assigned. Mar 25: Assessment done. Mar 28: Approved. KES 450K processing."

**Instant Payouts (Micro-claims):**
- For low-value claims (e.g., KES 10,000 phone screen repair), AI assesses the photo and auto-approves. Funds hit the PayMo balance in minutes.
- For large claims, traditional adjuster process applies, but the tracker keeps the user informed.

**Ledger Integration:**
- When a payout is received: Debit Cash/Bank, Credit "Insurance Recovery" (Other Income). Automatically updates the P&L.

**Detailed information & data points:**
- In-app messaging thread between the business owner and PayMo's claims team is attached to each claim card.
- Rejected claims show the specific policy clause and offer an appeals button.

**Reason this section exists:**
The biggest reason SMEs hate insurance is opaque, slow claims. This tracker brings radical transparency. The user knows exactly who is handling their claim and what step it is on. The micro-claim instant payout is a magical UX moment that builds massive trust in the platform.

---

## Section 11.7 — Policy Renewal Calendar & Management

**What it contains:**
Preventing the silent killer: lapsed policies due to forgotten renewals.

**Renewal Calendar:**
- Visual 90-day view of policy expiry dates. Green (>30 days), Amber (<30 days), Red (Lapsed).

**Auto-Renewal Engine:**
- Toggle per policy: "Auto-renew and deduct from PayMo balance."
- 7 days before expiry: "We will auto-renew your Fire policy for KES 48K. [Cancel] [Change Payment Method]"
- If disabled, escalation notifications trigger: "URGENT: WIBA expires TOMORROW."

**Renewal Quote Comparison:**
- "Last Year: KES 45K. New Quote: KES 48K (+6.6%)."
- Alternative: "We found a cheaper quote from Insurer B for KES 44K. [Switch & Save]"

**Certificate Resend:**
- Upon renewal, "Resend updated certificate to Landlord/Bank" button pre-populated with previously used emails.

**Detailed information & data points:**
- Auto-renewal requires a pre-authorized mandate on the PayMo float/bank account.
- If auto-renewal fails (insufficient funds), it tries a backup method, then alerts the user immediately.

**Reason this section exists:**
A business pays premiums for 3 years, misses the 4th-year renewal, and the shop burns down the next day. Zero payout. Auto-renewal eliminates this human error. The comparison tool prevents blind price hikes from lazy brokers.

---

## Section 11.8 — Quick Actions Bar (Persistent)

**Actions:**
1. **"Get a Quote"** — Modal: What to insure? (Property, Asset, Stock, Rent) → routes to specific flow.
2. **"File a Claim"** — Direct to Claim Wizard.
3. **"Insure My Stock"** — Jumps to Stock Cover showing current inventory value.
4. **"Enroll Staff"** — Jumps to WIBA/Medical filtered to unenrolled active employees.
5. **"Download Certificate"** — Quick-pick menu of active policies for instant PDF.
6. **"Check Exposures"** — Jumps to Risk Matrix highlighting uninsured items.
7. **"Pay Premium"** — Settles any manual, non-auto-renewed premiums due.

**Context-aware behavior:**
- If WIBA is non-compliant, "Enroll Staff" pulses red.
- If an asset was added today, "Get a Quote" subtly highlights asset insurance.

**Reason this section exists:**
Insurance is a background concern. The Quick Actions bar ensures that when a bike is bought or a landlord asks for a certificate, the action takes 10 seconds, not 10 minutes of navigation.

---
---

# PAGE 12: MARKETING & GROWTH (`marketing-growth.html`)

**Zone:** 🚀 Grow
**Mental model for the user:** *"I have 500 customers in PayMo. Let me text them a discount, track who buys, and grow my revenue without paying Mailchimp or hiring a marketer."*
**Core thesis:** The CRM (Page 6) holds the customer data. The Products page holds the catalog. This page is the *engine* that uses that data to drive revenue. It brings SMS/WhatsApp blasting, referral tracking, and social commerce natively into PayMo, eliminating the need for external marketing tools.

---

## Section 12.1 — Marketing Command Center

**What it contains:**
The executive dashboard for all marketing efforts, showing what's working and what's wasting money.

**Key Metrics (Top Cards):**
- **Campaign ROI**: "Spent KES 5,000 on SMS last week. Generated KES 45,000 in revenue. ROI: 800%."
- **Customer Acquisition Cost (CAC)**: "KES 250 to acquire a new customer this month."
- **Referral Rate**: "15% of new customers came from referral links."
- **Active Subscribers**: "320 customers have opted in to marketing messages."

**Performance Trend Charts:**
- Revenue attributed to marketing campaigns over time (line chart).
- Campaign channel breakdown (Pie chart: WhatsApp 60%, SMS 30%, Email 10%).

**Recent Campaign Feed:**
- A quick list of the last 5 campaigns sent: Name, Channel, Reach (recipients), Conversions (clicks/purchases), Status.

**Detailed information & data points:**
- "Revenue attributed" is calculated by tracking UTM-like parameters in PayMo payment links. If a customer clicks a campaign link and pays within 7 days, the revenue is attributed to that campaign.
- The dashboard enforces accountability: the business owner sees exactly if their KES 5,000 SMS blast made money or just burned cash.

**Reason this section exists:**
SMEs often market blindly—posting on WhatsApp status and hoping for the best. This dashboard introduces basic marketing math (ROI, CAC) in a simple, non-intimidating way, proving whether their efforts are actually working.

---

## Section 12.2 — Campaign Manager (Omnichannel Blasts)

**What it contains:**
The core tool for creating and sending targeted messages to the customer base via SMS, WhatsApp, and Email.

**Campaign Builder (Step-by-Step):**
- **Step 1 — Audience**: Who are you messaging?
  - Select Segment (from CRM: "VIP", "At-Risk", "Dormant") OR manual filter (e.g., "Customers who bought Shoes in the last 6 months").
  - Shows estimated audience size: "150 customers match this criteria."
- **Step 2 — Channel & Content**:
  - Select: SMS (160 chars, KES per SMS), WhatsApp (rich text, images, PDFs, buttons), Email (HTML editor).
  - Template library: "Sale Announcement", "Payment Reminder", "New Product Launch", "Holiday Greeting."
  - Merge tags: `{FirstName}`, `{LastPurchaseDate}`, `{OutstandingBalance}`.
  - **Link Insertion**: "Add Payment Link" → generates a unique, trackable PayMo payment link for this specific campaign.
- **Step 3 — Schedule & Budget**:
  - Send Now or Schedule (Date/Time).
  - Cost estimate: "150 SMS @ KES 1.50 = KES 225. Deduct from M-Pesa Float?"
- **Step 4 — Review & Send**: Preview exactly how it looks on a phone. Approve and send.

**Campaign Analytics (Post-Send):**
- Delivery rate (Delivered vs. Failed).
- Open rate (Email/WhatsApp).
- Click rate (How many clicked the payment link?).
- Conversion rate (How many actually paid?).
- Revenue generated.

**Detailed information & data points:**
- WhatsApp messages are sent via the PayMo WhatsApp Business API. They support interactive buttons (e.g., "Buy Now", "Learn More").
- SMS costs are deducted from the PayMo float *before* sending. If insufficient balance, the send is blocked.
- Unsubscribe management: Every SMS/Email includes an opt-out keyword/link. Opted-out customers are automatically excluded from future campaigns (KDPA compliance).

**Reason this section exists:**
A shopkeeper wants to say "Easter sale! 20% off all shoes." Currently, they manually type this to 100 contacts on WhatsApp, which takes an hour and doesn't track results. This section turns it into a 2-minute, measurable campaign with a direct "Buy Now" checkout link.

---

## Section 12.3 — Referral & Affiliate Programs

**What it contains:**
Tools to turn existing customers into a sales force by rewarding them for bringing in new business.

**Program Setup:**
- **Reward Type**: "Give KES 500 cash to referrer AND KES 500 discount to the new customer" OR "Give 10% of the first purchase as points."
- **Referral Mechanism**: Generate a unique link (`paymo.biz/ref/john123`) or a unique code (`JOHN20`) for the customer to share.

**Customer Referral Portal:**
- Accessed via the customer's receipt or a dedicated URL.
- Shows: "Share your link. When your friend buys, you get KES 500."
- One-click share to WhatsApp, X, Facebook.
- Tracks: "You have 5 clicks, 1 successful purchase. KES 500 earned!"

**Referral Tracking Ledger:**
- Business-side table: Referrer Name, New Customer Name, Purchase Amount, Reward Issued, Date.
- "Issue Rewards" button: Manually review and approve rewards, or set to "Auto-issue" when the new customer's invoice is paid.

**Detailed information & data points:**
- Referral codes/links are tracked via cookies/localStorage on the storefront, or via the code being entered at checkout.
- Rewards issued as "Cash" are added to the customer's PayMo wallet (if they have an account) or sent via M-Pesa to their phone number.
- Rewards reduce the business's revenue and are recorded as a "Marketing/Referral Expense" in the General Ledger.

**Reason this section exists:**
Word-of-mouth is the #1 acquisition channel for Kenyan SMEs, but it's untracked and unrewarded. Formalizing it with a unique link and a KES 500 incentive turns happy customers into active promoters, lowering CAC significantly.

---

## Section 12.4 — Discount & Promo Code Hub

**What it contains:**
A centralized management system for all promotional codes, distinct from the Store's internal discounts (Page 7) by focusing on *marketing distribution* and *campaign tracking*.

**Promo Code Generator:**
- Code: "EASTER24"
- Type: Percentage, Fixed Amount, Free Shipping, Free Gift.
- Applicability: Entire order, specific categories, specific products.
- Limits: Total uses (e.g., 100), Per-customer uses (1), Min order value (KES 1,000).
- Validity: Start/End dates.

**Distribution Tracking:**
- Once a code is created, how is it distributed?
- "Generate QR Code" (for print flyers/posters).
- "Generate WhatsApp Message" (pre-formatted for sharing).
- Track which distribution channel drove the most redemptions.

**Performance Analytics:**
- Table: Code, Redemptions, Revenue Generated, Discount Given (KES), Net Revenue, ROI.
- "Best performing code: EASTER24 (KES 50K revenue, KES 5K discount)."

**Detailed information & data points:**
- This interfaces with both the Online Store checkout and the Invoice Wizard. If a customer quotes a code on an invoice, the salesperson can apply it.
- Codes are validated server-side at checkout to prevent tampering.

**Reason this section exists:**
While the Store page lets you *create* a discount, this page lets you *market* it. Generating a QR code for a poster, tracking which flyer drove the most sales, and measuring the ROI of a "20% off" promotion are pure marketing functions.

---

## Section 12.5 — Social Commerce & WhatsApp Ordering

**What it contains:**
Bridging the gap between social media (where Kenyans discover products) and PayMo (where they pay).

**WhatsApp Catalog Sync:**
- "Sync Products to WhatsApp" button → Pushes the PayMo product catalog (images, prices, descriptions) directly to the business's WhatsApp Business catalog via the Meta API.
- When the catalog is updated in PayMo, it auto-updates on WhatsApp.

**Social Link Ordering (Link-in-Bio):**
- Generates a single, trackable URL (e.g., `paymo.biz/shop/techsol`) to put in Instagram bio, Facebook profile, or TikTok bio.
- This link opens a beautiful, mobile-optimized storefront showing the business's products.
- Customers can add to cart and pay via M-Pesa STK push without ever leaving the social media app's in-app browser.

**Comment-to-Order Simulation:**
- For Instagram/Facebook: "Customer comments 'I want Item A' on your post."
- (Advanced/Phase 2) AI monitors social comments via API integration, parses the intent, and replies with the direct PayMo payment link for that specific item.

**Attribution Tracking:**
- The `paymo.biz/shop/` link appends a UTM parameter. When a sale is made, the Order Management page shows "Source: Instagram Bio Link."

**Detailed information & data points:**
- WhatsApp Catalog sync requires the business to have a WhatsApp Business API account linked to PayMo (handled in the Integrations page).
- The Link-in-Bio store is a headless, SSR React app optimized for lightning-fast loading on mobile networks.

**Reason this section exists:**
An SME spends hours posting products on Instagram, only for customers to comment "How much?" and then the owner has to manually follow up, send an M-Pesa Paybill, and track who paid. Social Commerce automates this: the bio link shows the price, the checkout is instant, and the order is recorded.

---

## Section 12.6 — Growth & Acquisition Analytics

**What it contains:**
Deep-dive analytics for understanding how the business acquires customers and how much they are worth over time.

**Acquisition Funnel:**
- "Store Visitors → Add to Cart → Checkout → Paid".
- Shows exact drop-off percentages. "70% abandon at checkout. Reason? Shipping cost too high?"

**Cohort Analysis:**
- "Customers acquired in Jan 2025": How many bought again in Feb? March?
- Visualizes customer retention over time.

**Customer Lifetime Value (LTV) vs. CAC:**
- LTV (calculated from CRM data) vs. CAC (calculated from marketing spend).
- The golden ratio: "Your LTV is KES 25,000. Your CAC is KES 2,500. Ratio: 10:1 (Healthy is >3:1)."

**Channel Performance:**
- Which channel brings the highest LTV customers? (e.g., "Referral customers spend 2x more than Instagram customers").

**Detailed information & data points:**
- LTV is calculated using a simple predictive model based on average purchase frequency and AOV.
- These analytics power the Marketing Command Center's top-line metrics.

**Reason this section exists:**
"You can't grow what you don't measure." Showing a business owner that "Instagram followers buy once and disappear, but referral customers buy 5 times" fundamentally changes their marketing strategy and budget allocation.

---

## Section 12.7 — Quick Actions Bar (Persistent)

**Actions:**
1. **"Send Blast"** — Opens Campaign Manager Step 1 (Select Audience).
2. **"Create Promo"** — Opens Promo Code Generator.
3. **"Share Store Link"** — Copies the social commerce link to clipboard, offers 1-tap WhatsApp share.
4. **"Check Referrals"** — Jumps to Referral Ledger showing pending payouts.
5. **"View Analytics"** — Opens Growth Analytics for the current month.
6. **"Sync WhatsApp"** — Triggers a manual push of the product catalog to WhatsApp Business.
7. **"Top Up SMS Balance"** — Jumps to float top-up specifically for SMS marketing credits.

**Context-aware behavior:**
- If a campaign is scheduled for later today, "Send Blast" shows a "1 scheduled" badge.
- If a promo code is expiring today, "Create Promo" highlights it.

**Reason this section exists:**
Marketing requires speed. A trending topic on X (Twitter) might require an instant SMS blast. The Quick Actions bar ensures the business can react to market conditions in seconds.

---
---

# PAGE 13: APPS & INTEGRATIONS (`apps-integrations.html`)

**Zone:** 🚀 Grow
**Mental model for the user:** *"I don't want to use three different apps. Connect my tools here so everything flows into PayMo."*
**Core thesis:** This is the "no external app needed" guarantee. Instead of the business leaving PayMo to check WhatsApp orders, send deliveries via Sendy, or export to QuickBooks, they connect those tools *here*. Data flows into PayMo, and actions are triggered from PayMo.

---

## Section 13.1 — Integration Marketplace Hub

**What it contains:**
The discovery center for all available integrations, presented as a clean, categorized app store.

**Category Navigation:**
- **Sell Everywhere**: WhatsApp, Instagram, Facebook, TikTok
- **Deliver & Fulfill**: Sendy, Glovo, Bolt Delivery, Fargo Courier
- **Accounting & Tax**: QuickBooks, Xero, Sage
- **Banking & Finance**: Equity, KCB, NCBA (Open Banking enhancements)
- **Analytics**: Google Analytics, Meta Pixel
- **Automation**: Zapier, Make (Integromat), Webhooks

**Integration Cards:**
- Logo, Name, Short Description, "Connect" button, User Rating, "Popular" or "New" badge.
- Clicking a card opens the detail view: Features, Pricing (if any), Setup Guide, FAQ.

**Search & Filtering:**
- "Search for 'delivery'" → Shows Glovo, Sendy, Bolt.
- "Recommended for you": Based on the business's industry and current setup (e.g., if they have a Store, recommend Social integrations).

**Detailed information & data points:**
- The marketplace is a React grid with server-side search.
- Integrations can be built by PayMo or by third-party developers using PayMo's public API (developer docs linked in the footer).

**Reason this section exists:**
Users don't know what's possible until they see it. A shopkeeper might not know PayMo can connect to Glovo. The marketplace visualizes the superapp's extensibility.

---

## Section 13.2 — Social & Commerce Connectors

**What it contains:**
The configuration and active status of integrations that bring orders, leads, and messages into PayMo.

**WhatsApp Business API:**
- **Status**: Connected/Disconnected.
- **Setup**: Link PayMo to the business's WhatsApp Business phone number (via Meta Business Manager OAuth).
- **Capabilities Enabled**: Catalog Sync (Marketing page), Automated Order Notifications, Customer Support Chat routing.
- **Metrics**: Messages sent/received this month.

**Instagram & Facebook Shop:**
- **Setup**: Connect via Meta Business Manager.
- **Flow**: When a customer messages the business on Instagram, the message appears in the PayMo Support/CRM inbox. If they ask to buy, the user can generate a PayMo payment link and send it back without leaving PayMo.
- **Shop Sync**: Sync PayMo products to Facebook/Instagram Shop.

**TikTok Shop:**
- (Future/Phase 2) Sync catalog and route TikTok orders into PayMo Order Management.

**Unified Social Inbox (Preview):**
- A mini-view of the latest messages across all connected social channels, aggregated into one feed. Click to reply (routes the reply back through the respective social API).

**Detailed information & data points:**
- Social APIs have rate limits. PayMo handles queueing and retry logic.
- Messages are also logged in the Customer's CRM profile (Page 6) for full context.

**Reason this section exists:**
Managing 5 different chat apps is exhausting. By bringing Instagram DMs and WhatsApp messages into the PayMo inbox, the business owner handles all customer conversations in one place, with the customer's financial history right next to the chat.

---

## Section 13.3 — Logistics & Delivery Integrations

**What it contains:**
Connecting the Order Management system (Page 7) to third-party delivery fleets.

**Supported Providers:**
- Sendy, Glovo Merchant, Bolt Business, Fargo Courier, Amitruck.

**Connection Flow:**
- "Connect Sendy" → OAuth via Sendy's partner portal → Authorized.
- **Configuration**: Set default delivery zones, package types, default pickup location (from Business Profile).

**Dispatch Integration (The Magic):**
- In the Order Management page (Page 7, Section 7.4), when an order is "Ready to Ship," the user clicks "Request Pickup."
- Instead of manual calling, a modal pops up: "Sendy is requesting a rider. Pickup: [Shop Address]. Drop-off: [Customer Address from Order]. Package: [Weight/Size from Product data]."
- PayMo sends the API request to Sendy. Sendy returns a Tracking URL.
- The Tracking URL is automatically SMS'd to the customer, and the Order Status updates to "In Transit."

**Delivery Cost Reconciliation:**
- Delivery fees charged by the provider are logged as an expense in the General Ledger ("Delivery Expense") and matched against the order.

**Detailed information & data points:**
- If a delivery fails (rider cancelled), PayMo receives a webhook from the delivery partner and updates the order status to "Delivery Failed," prompting the business to re-dispatch.

**Reason this section exists:**
A shop owner spends 30 minutes per order calling riders, negotiating prices, and following up. This integration reduces dispatch to 1 click. The automatic SMS to the customer with a live tracking link elevates the business to a "Jumia-level" fulfillment experience.

---

## Section 13.4 — Accounting & ERP Exports

**What it contains:**
The bridge for businesses whose external accountants insist on using traditional software, or who need to export data for statutory audits.

**Supported Platforms:**
- QuickBooks Online, Xero, Sage, Excel/CSV.

**Export Configuration:**
- **Data Mapping**: Map PayMo Chart of Accounts to QuickBooks/Xero accounts (e.g., PayMo "M-Pesa Float" → QuickBooks "Undeposited Funds").
- **Sync Direction**: PayMo → Accounting Software (One-way push).
- **Sync Frequency**: Real-time (via API), Daily Batch, or Manual Export.

**What Gets Synced:**
- Customers/Contacts (from CRM).
- Suppliers/Vendors (from Pay Suppliers).
- Invoices (Sales Receipts in accounting software).
- Bills/Expenses (from Pay Suppliers and Bookkeeping).
- Journal Entries (for manual adjustments).

**Manual Export Fallback:**
- If the accountant just wants a file: "Export to CSV" → Downloads a ZIP containing separate CSVs for Invoices, Payments, Expenses, and Accounts.
- "Export to Tax Format" → Generates the exact Excel layout KRA iTax expects for import.

**Detailed information & data points:**
- Syncing uses the accounting software's native APIs (e.g., Xero OAuth 2.0 API).
- Conflict resolution: "If an invoice already exists in Xero, overwrite? Skip? Create duplicate?" (Configured by the user).
- This is positioned as a *fallback*. PayMo's native Bookkeeping (Page 4) is superior because it's real-time. This is for compliance with external stakeholders.

**Reason this section exists:**
The #1 objection to new financial software is "my accountant uses QuickBooks." This section eliminates the objection. The business runs entirely on PayMo, but pushes a clean, mapped data dump to QuickBooks once a month to keep the accountant happy.

---

## Section 13.5 — Analytics & Tracking Pixels

**What it contains:**
Embedding third-party tracking scripts into the PayMo Online Store to measure marketing effectiveness.

**Google Analytics (GA4):**
- "Enter your GA4 Measurement ID (G-XXXXXXXXXX)."
- PayMo injects the GA4 script into the Storefront header.
- All store page views, add-to-carts, and checkout completions are sent to the business's Google Analytics property.

**Meta Pixel (Facebook/Instagram):**
- "Enter your Pixel ID."
- Tracks store visitors, allowing the business to run targeted Facebook/Instagram ads to people who visited their PayMo store but didn't buy (retargeting).

**Custom Conversions:**
- Map PayMo events to platform events:
  - "Purchase" (Payment successful) → Meta "Purchase" event with revenue value.
  - "Add to Cart" → Meta "AddToCart" event.

**Detailed information & data points:**
- Scripts are loaded asynchronously to avoid slowing down the store.
- PayMo does not track user data for its own advertising; it merely passes the business's own Pixel/GA tags through.

**Reason this section exists:**
If an SME is spending KES 10,000/day on Facebook ads, they *need* the Meta Pixel to track return on ad spend (ROAS). Without it, they are marketing blind. Adding the Pixel ID here means they don't need a developer to edit their store's source code.

---

## Section 13.6 — Integration Health & Sync Logs

**What it contains:**
The IT admin view—monitoring connections, debugging failures, and viewing API logs.

**Active Connections Dashboard:**
- Grid of connected apps: Logo, Name, Status (Green dot = Healthy, Red dot = Error), Last Successful Sync, Uptime (99.9%).

**Sync Error Log:**
- Table: Timestamp, Integration (e.g., QuickBooks), Error Type (Authentication failed, Data validation error, Rate limit exceeded), Error Message, Status (Resolved, Unresolved).
- "Retry" button for transient errors.

**Webhook Management (For Custom Integrations):**
- List of outgoing webhooks configured by the user or via Zapier.
- "Test Webhook" button (sends a sample payload).
- Delivery log (Success 200, Fail 500).

**Detailed information & data points:**
- If an OAuth token expires (e.g., Meta requires re-authentication every 60 days), the status turns Red and the business owner gets a notification: "Your Instagram connection has expired. Click here to re-authenticate."

**Reason this section exists:**
Integrations break. APIs change. Tokens expire. Without a health dashboard, the business owner doesn't know their Instagram orders aren't flowing into PayMo until a customer complains. This provides visibility and a "Retry" button for easy self-healing.

---

## Section 13.7 — Quick Actions Bar (Persistent)

**Actions:**
1. **"Connect App"** — Opens the Marketplace Hub.
2. **"Dispatch Order"** — If an order is selected, directly opens the Logistics dispatch modal.
3. **"Sync Now"** — Forces an immediate sync with all connected accounting/ERP software.
4. **"Check Health"** — Jumps to Integration Health, filtered to show only "Error" states.
5. **"View Social Inbox"** — Opens the unified social message feed.
6. **"Export Data"** — Quick export to CSV for the current month's transactions.
7. **"API Docs"** — Opens PayMo's developer documentation in a new tab (for technical users).

**Context-aware behavior:**
- If a sync has failed, "Sync Now" turns amber with an error count.
- If a social message is unread, "View Social Inbox" shows a red badge.

**Reason this section exists:**
Integrations are plumbing—they should work silently. The Quick Actions bar is for the rare moments the user needs to interact with the plumbing: connecting a new app, forcing a sync, or checking why something broke.

---
---

# PAGE 14: MULTI-BUSINESS / PORTFOLIO (`portfolio.html`)

**Zone:** ⚙️ Run
**Mental model for the user:** *"I have 3 companies and 5 rental houses. Show me the total picture, but keep the books strictly separate. And help me manage my tenants easily."*
**Core thesis:** The current flat business switcher fails users with multiple entities. This page introduces a **Portfolio** layer above the individual businesses. It provides consolidated financials, inter-company transfers, entity grouping, and—critically—a specialized Rental Property sub-system that turns each house into a mini-business with tenant management.

---

## Section 14.1 — Portfolio Overview & Consolidated Command Center

**What it contains:**
The "helicopter view" of the user's entire financial empire. This is the only place where data from different businesses is mixed.

**Consolidated KPIs (Top Cards):**
- **Total Group Cash**: Sum of cash across all businesses/properties.
- **Total Group Revenue**: Sum of revenue across all entities (month-to-date).
- **Total Group Expenses**: Sum of expenses.
- **Group Net Profit**: Revenue minus Expenses.
- **Group Tax Exposure**: Total VAT + PAYE + WIBA due across all entities.

**Entity Performance Grid:**
- Cards for each business/property in the portfolio.
- Each card shows: Entity Name, Type (Ltd, Rental, Sole Prop), This Month's Net Profit, Cash Balance, Status (Green/Amber/Red based on cash health).
- Click a card to "Jump into Entity" (switches `currentBusinessKey` and goes to the Overview page).

**Inter-Company Matrix (Mini):**
- "Money movement between your entities this month:"
  - "TechSol → Kilimani House 3: KES 50,000 (Maintenance fund)"
  - "TS Retail → TechSol: KES 100,000 (Management fee)"

**Detailed information & data points:**
- Consolidated KPIs query the ledger tables across all entities owned by the user. This is a read-only view; no ledger entries are created at the portfolio level.
- The grid is sortable by Cash Balance or Net Profit to instantly highlight the best/worst performing entities.

**Reason this section exists:**
A user with 5 entities currently has to log into each one, write down the cash balance, and add it up on a calculator to know their total net worth. This dashboard gives them the answer in 2 seconds. The Entity Performance Grid immediately highlights the problem child: *"Why is TS Retail losing money this month?"*

---

## Section 14.2 — Business List, Grouping & Folders

**What it contains:**
The organizational structure for the portfolio. A flat list of 10 entities is unmanageable; folders bring order.

**Folder/Group Structure:**
- Tree view on the left sidebar:
  - 📁 **Operating Companies**
    - 🏢 TechSolutions Ltd
    - 🏢 TS Retail
  - 📁 **Rental Properties**
    - 🏠 Kilimani House 1
    - 🏠 Kilimani House 2
    - 🏠 Westlands Apartment
  - 📁 **Side Projects**
    - 🚗 Personal Car Hire (Sole Prop)

**Group-Level Metrics:**
- Clicking a folder (e.g., "Rental Properties") shows aggregated metrics just for that group: "Total Rent Collected: KES 450K. Total Maintenance: KES 30K."
- "View Consolidated P&L for this Group" button.

**Drag-and-Drop Organization:**
- Drag a business from "Side Projects" into "Operating Companies" to reorganize.

**Detailed information & data points:**
- Folders are virtual groupings. They do not affect the underlying ledger or legal structure, but they power the consolidated reporting and the user's mental model.
- A business can only exist in one folder at a time.

**Reason this section exists:**
A property owner with 10 houses doesn't think of them as 10 separate businesses; they think of them as "My Rentals." Grouping allows the owner to say "Show me how my rentals are doing" vs "Show me how my tech companies are doing."

---

## Section 14.3 — Entity Creation & Type Presets

**What it contains:**
The onboarding wizard for adding a new entity to the portfolio, heavily optimized by industry presets.

**"Add Entity" Button:**
- Opens a modal: "What type of entity are you adding?"
  - Limited Company (Ltd)
  - Sole Proprietorship
  - SACCO / NGO
  - **🏠 Rental Property** (Highlighted as a distinct, rich preset)

**The "Rental Property" Preset (Deep Dive):**
- **Step 1 — Property Details**: Property Name (e.g., "Kilimani House 3"), Property Type (Apartment, Standalone House, Commercial Space), Address, Number of Units (if multi-unit).
- **Step 2 — Financial Setup**: Monthly Rent Amount (per unit), Security Deposit Amount, Payment Terms ("Due on 1st of month").
- **Step 3 — Auto-Configuration** (The magic): The system automatically creates:
  - A Chart of Accounts optimized for rentals (Rent Income, Property Maintenance, Mortgage Interest, Security Deposits Liability).
  - A Virtual Account named "Kilimani House 3 Collections" in Cash & Accounts.
  - Recurring Invoice Templates for each unit.
  - A default "Property Manager" role in Team & Roles.
- **Step 4 — Add Tenants** (Optional): Name, Phone, Email, Unit Number, Lease Start/End, Security Deposit Paid (Yes/No, Amount).

**Standard Business Preset:**
- Simpler: Name, KRA PIN, Industry, Default CoA template (Trading/Service/NGO).

**Detailed information & data points:**
- The Rental Preset turns a 2-hour setup process into a 5-minute wizard.
- When a Rental Property entity is created, it gets a special `entity_type = 'rental'` flag that unlocks the Property Sub-System UI (Section 14.4) and the Rent Default Insurance (Page 11, Section 11.5).

**Reason this section exists:**
Setting up a new Ltd company in accounting software is tedious. Setting up a rental house is even worse because standard software doesn't know what "Security Deposits" or "Vacancy Loss" are. The presets configure the platform perfectly for the specific use case in one click.

---

## Section 14.4 — The Property/Rental Sub-System (Tenants, Deposits, Maintenance)

**What it contains:**
A specialized UI layer that appears *only* when the `currentBusinessKey` is a Rental Property entity. It replaces the standard "Get Paid" and "Pay Suppliers" views with property-specific terminology and workflows.

**Tenant Directory (Replaces Customer Directory):**
- Table: Tenant Name, Unit (e.g., "Unit 2B"), Phone, Lease Start/End, Monthly Rent, Security Deposit Held, Status (Active, Overdue, Vacant).
- Expand Tenant Profile: Shows payment history, lease agreement PDF, communication log, maintenance requests.

**Rent Collection Dashboard (Replaces Invoice Center):**
- "This Month's Rent": KES 150,000 expected (5 units @ 30K).
- "Collected": KES 120,000 (4 units paid). "Outstanding": KES 30,000 (1 unit overdue).
- Visual grid of the property: Click on "Unit 2B" → Shows tenant, rent status, "Send Rent Reminder" button.

**Security Deposit Management:**
- Ledger View: "Security Deposits Held" is a Liability account.
- When a tenant moves in: Debit Cash (M-Pesa/Bank), Credit Security Deposits Liability.
- When a tenant moves out: Reverse the entry, deduct any damages (requires a "Deduction" workflow with photo evidence), refund the balance.
- "Deposit Statement": Generate a PDF for the tenant showing their deposit balance.

**Maintenance Request Tracker:**
- Tenants can submit requests (via a tenant portal link or business owner manually logs).
- Table: Unit, Issue (e.g., "Leaking tap"), Priority (Low/High/Emergency), Status (Open, Assigned, Resolved), Cost (if repaired).
- "Assign to Vendor": Links to the Pay Suppliers page to create a purchase order for a plumber.
- Cost is logged against the specific Property Entity's P&L.

**Vacancy Tracking:**
- Calendar view of units. If a lease ends and no new tenant is added, the unit turns grey (Vacant).
- "Vacancy Loss" is automatically calculated on the P&L: (Vacant Units × Monthly Rent) = Lost Revenue.

**Detailed information & data points:**
- Rent collection uses the Recurring Invoice engine (Page 1, Section 1.4) under the hood, but the UI just says "Mark Rent Paid" instead of "Match Invoice."
- The Property Sub-System is just a *skin* over the core superapp modules. A rent payment is still a standard M-Pesa collection that hits the General Ledger. This ensures the consolidated portfolio view works perfectly.

**Reason this section exists:**
This is the "holy grail" for the Kenyan landlord. Currently, they use Excel to track who paid rent, a notebook to track deposits, and WhatsApp to track leaks. This section unifies all of it. The automatic vacancy loss calculation on the P&L is an eye-opener: *"My house is empty 2 months a year? That's a KES 60,000 hidden loss."*

---

## Section 14.5 — Consolidated Financials & Eliminations

**What it contains:**
Standard group accounting reports, simplified for the SME owner who just wants to see the big picture.

**Consolidated P&L:**
- Summed revenues and expenses across all selected entities.
- **Inter-Company Eliminations**: "TechSol paid TS Retail KES 50,000 for goods. This is revenue for TechSol but an expense for TS Retail. To see the true group profit, we must eliminate this KES 50,000."
- The system auto-detects inter-company transactions (via the Inter-Company Transfer module, Section 14.7) and presents an "Unadjusted" and "Adjusted (Eliminated)" P&L.

**Consolidated Balance Sheet:**
- Sums all assets and liabilities.
- Eliminates inter-company receivables/payables (If TechSol owes TS Retail KES 50K, it cancels out in consolidation).

**Entity Selector:**
- Checkboxes next to all entities. "Include in consolidation: [x] TechSol [x] TS Retail [ ] Kilimani House 1".
- Allows the owner to view consolidated reports for just the "Operating Companies" group, excluding rentals.

**Detailed information & data points:**
- True group accounting is complex. PayMo automates the simple stuff (matching exact inter-company offsets). For complex scenarios (e.g., unrealized profit in inventory), a notification advises consulting an accountant, but provides the raw data export.
- Reports are generated on-the-fly via SQL aggregation.

**Reason this section exists:**
If the owner wants a bank loan for the group, the bank asks for consolidated financials. Without this, the owner spends days manually adding Excel sheets together and trying to cancel out inter-company transfers. This does it in 10 seconds.

---

## Section 14.6 — Per-Business Access Control Matrix

**What it contains:**
Granular control over who can see what within the portfolio. Critical for the "grandmother sees only House A" requirement.

**User-Entity Matrix:**
- Rows: Team Members / Users.
- Columns: Entities in the portfolio.
- Cells: Dropdown — **No Access**, **Viewer** (read-only), **Standard** (normal operational access), **Admin** (can manage settings/team for that entity).
- Example: "Caretaker James" → House 1: Standard | House 2: No Access | House 3: No Access | TechSol: No Access.

**Inheritance & Overrides:**
- "Portfolio Owner" has Admin access to everything by default (cannot be removed).
- "Group Manager": Assign a user as Manager of the "Rental Properties" folder, which automatically grants them Standard access to all entities *inside* that folder, unless overridden.

**Audit Logging:**
- "James viewed House 1 ledger." "Jane was denied access to TechSol P&L."

**Detailed information & data points:**
- Access control is enforced at the API middleware level. If Caretaker James tries to call the API for House 2, the request is rejected with a 403 Forbidden before any data is queried.
- The matrix scales to 100 users and 50 entities without performance issues.

**Reason this section exists:**
Trust and delegation. The property owner cannot manage 5 houses alone; they need caretakers. But they don't want Caretaker A seeing the rent rolls or bank balances of House B. This matrix provides strict, legally sound data isolation within a single login.

---

## Section 14.7 — Inter-Company Transfers & Consolidation Rules

**What it contains:**
The mechanics of moving money between the user's own entities, and the rules that govern how those movements are reported.

**Transfer Initiation:**
- "Transfer Funds" modal:
  - From: [TechSol Current Account]
  - To: [Kilimani House 3 Maintenance VA]
  - Amount: KES 20,000
  - Reason: "Monthly maintenance fund"
  - Type: "Capital Injection", "Loan", "Management Fee", "Expense Reimbursement"
- Executes instantly (internal PayMo ledger movement).

**Double-Entry Impact:**
- TechSol: Debit "Inter-Company Transfer Out", Credit Cash.
- House 3: Debit Cash, Credit "Inter-Company Transfer In".
- Because it hits distinct General Ledgers, the consolidated view can easily identify and eliminate it.

**Transfer Rules & Approvals:**
- "Transfers > KES 1,000,000 require Portfolio Owner approval."
- "Loans between entities must have a repayment schedule attached."

**Inter-Company Loan Tracker:**
- If Type = "Loan", it creates a liability on the receiving entity and an asset on the sending entity.
- Tracks: Principal, Interest Rate (if applicable), Repayment schedule, Outstanding Balance.

**Detailed information & data points:**
- Inter-company transfers are free and instant because the money never leaves PayMo's internal ledger system.
- The "Type" classification is crucial for the Consolidated Financials (Section 14.5) engine to know how to eliminate the transaction.

**Reason this section exists:**
Moving money between companies usually involves bank transfers, fees, and massive manual reconciliation. This makes it a free, instant, classified internal movement. The Loan Tracker turns informal "I'll lend my shop KES 100K from my rental income" arrangements into formal, tracked, interest-bearing (or interest-free) loans.

---

## Section 14.8 — Group Tax & Statutory Exposure

**What it contains:**
A consolidated view of the business group's total tax obligations across KRA, NSSF, and SHIF.

**Group Tax Dashboard:**
- **Total VAT**: Sum of VAT payable across all VAT-registered entities.
- **Total PAYE**: Sum across all entities running payroll.
- **Total NSSF/SHIF**: Sum across all entities.
- **Consolidated Tax Calendar**: Shows all upcoming deadlines for *all* entities on one calendar.

**Group Tax Optimization Insights:**
- "TechSol has a VAT surplus (Input > Output) of KES 50,000. TS Retail has a VAT deficit of KES 40,000. *Note: KRA does not allow inter-entity VAT offsetting, but this highlights cash flow opportunities.*"
- "Total Corporate Tax Installments due this month: KES 300,000."

**Consolidated eTIMS / iTax Readiness:**
- Shows the compliance status of all entities in one table. "TechSol: eTIMS Active. TS Retail: PIN expired."

**Detailed information & data points:**
- While KRA treats each legal entity as a separate taxpayer (you cannot file one combined VAT return for two different Ltd companies), the business owner needs to see the total cash impact of taxes across their empire to manage liquidity.
- The system enforces a warning if the user tries to file a consolidated return (which is illegal for separate Ltds), but provides the data export for their accountant to file separately.

**Reason this section exists:**
A user with 3 companies might have VAT due for Company A on the 20th, PAYE for Company B on the 9th, and SHIF for Company C on the 9th. Missing any one triggers penalties. This consolidated calendar is the ultimate defense against tax penalties in a multi-entity structure.

---

## Section 14.9 — Quick Actions Bar (Persistent)

**Actions:**
1. **"Add Entity"** — Opens the Entity Creation wizard (Section 14.3).
2. **"Transfer Funds"** — Opens Inter-Company Transfer modal.
3. **"Collect Rent"** — (If in a Rental context) Jumps to the Rent Collection Dashboard.
4. **"Group P&L"** — Generates the Consolidated P&L for all checked entities.
5. **"Add Tenant"** — Opens the Tenant creation form for the selected property.
6. **"View Matrix"** — Jumps to the Access Control Matrix.
7. **"Tax Calendar"** — Opens the Group Tax Calendar.

**Context-aware behavior:**
- If the current entity is a Rental Property, "Collect Rent" and "Add Tenant" are prominent.
- If an inter-company loan repayment is due today, "Transfer Funds" shows an amber alert.

**Reason this section exists:**
Portfolio management requires frequent micro-actions: "Move KES 20K to the house account," "Add a new tenant," "Check group cash." The Quick Actions bar ensures the user can manage their empire without getting lost in nested menus.

---
---

# END OF COMPREHENSIVE OUTLINE (FINAL)

This concludes the complete, 14-page architectural blueprint for the restructured PayMo Superapp.

**Final Master Tally:**

| Page | Zone | Sections |
| :--- | :--- | :--- |
| **1. Get Paid** | 💰 Money In | 10 |
| **2. Pay Suppliers** | 💸 Money Out | 10 |
| **3. Cash & Accounts** | 🏦 Your Money | 10 |
| **4. Bookkeeping & Taxes** | 📦 Your Business | 10 |
| **5. Settings & Security** | ⚙️ Run | 10 |
| **6. Customers & CRM** | 💰 Money In | 7 |
| **7. Products & Store** | 📦 Your Business | 7 |
| **8. Inventory & Stock** | 📦 Your Business | 8 |
| **9. Funding & Credit** | 🚀 Grow | 7 |
| **10. Insurance (Part II context)**| 🚀 Grow | 8 |
| **11. Insurance & Protection** | 🚀 Grow | 8 |
| **12. Marketing & Growth** | 🚀 Grow | 7 |
| **13. Apps & Integrations** | 🚀 Grow | 7 |
| **14. Multi-Business / Portfolio**| ⚙️ Run | 9 |

**Total: 118 deeply expounded sections.**

Every section has been meticulously designed to read from and write to the **central General Ledger**, respect the **multi-business `currentBusinessKey`**, utilize the **shared `BusinessShell`**, and solve actual **Kenyan SME pain points** using local rails (M-Pesa, eTIMS, KRA, Sendy, WIBA). The superapp spine is complete.