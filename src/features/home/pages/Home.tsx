/* ============================================================================
 * Home.jsx — Paymo BAAS Homepage (Emerald Glass Edition)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy single-file index.html (992 LOC) — vanilla JS + Bootstrap
 * STACK .........: Vite + React 18 + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE ..: ONE component file holds all layout + logic (per spec).
 *                  Styles live in ./home.module.css (CSS Module).
 *
 * QUICK START
 *   1. npm i @tanstack/react-query bootstrap bootstrap-icons
 *   2. <QueryClientProvider client={new QueryClient()}><Home /></QueryClientProvider>
 *   3. Point fetchHomeContent() at your real API (currently /api/paymo-home).
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   renderFx()/innerHTML ......... fxPairs state + JSX .map() + dangerouslySetInnerHTML(SVG)
 *   DOMContentLoaded init ........ useEffect mount bridge block
 *   options object listeners ..... inline React handlers (onClick state setters)
 *   canvas particle network ...... canvasRef + useEffect (direct context API)
 *   scroll listener .............. window scroll listener inside useEffect (+cleanup)
 *   mousemove parallax/glow ...... heroVisualRef / cursorGlowRef listeners in useEffect
 *   IntersectionObserver ......... reveal + count-up observers inside useEffect
 *   setInterval timers ........... fxTickerRef / liveCounterRef intervals in useEffect
 *   typewriter RAF ............... typedCode effect keyed by activeCode state
 *   Bootstrap data-API (modal,
 *   offcanvas, accordion) ........ bootstrap bundle imported once here; data-bs-* kept
 * ========================================================================== */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // keeps modals/offcanvas/accordions alive
import styles from '../styles/homepage.module.css';

import heroPhoneImg from '../../../../public/assets/hero-phone.jpg';
import dashboardImg from '../../../../public/assets/dashboard-3d.jpg';
import fxCoinsImg from '../../../../public/assets/fx-coins.jpg';
import networkImg from '../../../../public/assets/network-globe.jpg';
import stockDataImg from '../../../../public/assets/stock-data.jpg';
import stockCoinsImg from '../../../../public/assets/stock-coins.jpg';

/* --------------------------------------------------------------------------
 * 1. initialMockData — EVERY repeating/hardcoded content block extracted from
 *    the legacy template. Swap for the API payload; shape is backend-ready.
 * ------------------------------------------------------------------------ */
const initialMockData = {
  hero: {
    badgeStrong: 'The Financial Nervous System',
    badgeRest: 'for Borderless Africa',
    titleStart: 'Build, bank, and move money across Africa and the world — from a ',
    titleAccent: 'single API.',
    copy: 'Paymo BAAS unifies African local rails, SWIFT and regional transfer networks, embedded banking, ledger infrastructure, and FX intelligence into one emerald operating layer for fintechs, platforms, and enterprise treasury teams.',
    trustPills: [
      { icon: 'bi-people', value: '400+', label: 'fintechs, neobanks & treasury teams' },
      { icon: 'bi-signpost', value: '25+', label: 'active market routes' },
    ],
    metrics: [
      { end: 30, suffix: '+', label: 'African local rails orchestrated from one platform layer' },
      { end: 10, suffix: '+', label: 'Global payout corridors — SWIFT, SEPA, ACH and card push' },
      { end: 99, suffix: '.97%', label: 'Platform uptime target for mission-critical flows' },
      { end: 90, suffix: ' days', label: 'Launch path for embedded accounts, cards and compliant flows' },
    ],
    visualBadges: [
      { key: 'badge1', label: 'Unified rails', text: '30+ local and global movement paths behind one decision layer.' },
      { key: 'badge2', label: 'Live settlement', text: 'KES 125,000 payout to M-Pesa settled · just now' },
      { key: 'badge3', label: 'Developer speed', text: 'Sandbox-ready flows for collections, accounts, payouts, and FX.' },
    ],
  },

  fxPairs: [
    { pair: 'USD / NGN', value: 1536.42, delta: 0.48, points: [20, 28, 24, 31, 34, 29, 36, 40] },
    { pair: 'USD / KES', value: 129.16, delta: -0.21, points: [34, 32, 31, 33, 29, 27, 30, 28] },
    { pair: 'USD / GHS', value: 15.08, delta: 0.18, points: [16, 19, 17, 21, 23, 22, 25, 27] },
    { pair: 'EUR / XOF', value: 655.96, delta: 0.09, points: [24, 26, 25, 26, 29, 30, 31, 32] },
  ],

  rails: [
    { icon: 'bi-phone', label: 'M-Pesa' },
    { icon: 'bi-phone-vibrate', label: 'MTN MoMo' },
    { icon: 'bi-broadcast', label: 'Airtel Money' },
    { icon: 'bi-wallet2', label: 'Orange Money' },
    { icon: 'bi-lightning-charge', label: 'PesaLink' },
    { icon: 'bi-bank', label: 'NIBSS' },
    { icon: 'bi-bank2', label: 'GhIPSS' },
    { icon: 'bi-globe', label: 'SWIFT' },
    { icon: 'bi-globe2', label: 'SEPA' },
    { icon: 'bi-building', label: 'ACH' },
    { icon: 'bi-credit-card', label: 'Visa Direct' },
    { icon: 'bi-credit-card-2-back', label: 'Mastercard Send' },
  ],

  navMenus: {
    product: [
      { icon: 'bi-arrow-down-up', tile: 'tileGreen', title: 'Collections & Payouts', sub: 'Unified money movement APIs.', href: '#modules' },
      { icon: 'bi-building', tile: 'tileBlue', title: 'Virtual Accounts', sub: 'Named & pooled account issuance.', href: '#modules' },
      { icon: 'bi-credit-card-2-front', tile: 'tilePurple', title: 'Card Programs', sub: 'White-label corporate cards.', href: '#modules' },
      { icon: 'bi-currency-exchange', tile: 'tileGold', title: 'FX Treasury', sub: 'Smart conversion & float logic.', href: '#modules' },
    ],
    solutions: [
      { icon: 'bi-bank2', tile: 'tileGreen', title: 'Financial Institutions & Banks', sub: 'Core banking rails & clearing infrastructure.', href: '#use-cases' },
      { icon: 'bi-globe', tile: 'tileBlue', title: 'Global Merchants', sub: 'Accept African payment methods globally.', href: '#use-cases' },
      { icon: 'bi-send', tile: 'tilePurple', title: 'Cross-Border Traders & Importers', sub: 'Seamless foreign exchange and FX settlement.', href: '#use-cases' },
      { icon: 'bi-grid-3x3-gap', tile: 'tilePink', title: 'Platforms & Marketplaces', sub: 'Mass automated payouts and multi-split collections.', href: '#use-cases' },
      { icon: 'bi-graph-up-arrow', tile: 'tileGold', title: 'Growing SMEs & Startups', sub: 'All-in-one financial dashboard & corporate tools.', href: '#use-cases' },
    ],
    developers: [
      { icon: 'bi-terminal', tile: 'tileGreen', title: 'API Quickstart', sub: 'Sandbox-first payout & account APIs.', href: '#developers' },
      { icon: 'bi-plug', tile: 'tileBlue', title: 'Webhooks & Events', sub: 'Real-time ledger and rail signals.', href: '#developers' },
      { icon: 'bi-shield-lock', tile: 'tileGold', title: 'Security Practices', sub: 'Compliance built into the fabric.', href: '#security' },
    ],
  },

  problem: {
    tensionPoints: [
      { icon: 'bi-diagram-3', text: 'Average African fintech teams integrate multiple providers before reaching stability and settlement consistency.' },
      { icon: 'bi-cash-coin', text: 'Hidden FX spread leakage compounds when treasury decisions happen across disconnected providers and timelines.' },
      { icon: 'bi-shield-lock', text: 'Compliance complexity grows when KYC, KYB, sanctions, monitoring, and reporting live across separate tools.' },
    ],
    before: {
      title: 'Fragmented stack',
      points: [
        { icon: 'bi-columns-gap', text: 'Six dashboards, separate PSPs, and different settlement views across markets.' },
        { icon: 'bi-file-earmark-spreadsheet', text: 'Manual spreadsheet reconciliation across collections, payouts, cards, and float accounts.' },
        { icon: 'bi-hourglass-split', text: 'Multi-day settlement delays and poor visibility into failed or pending cross-border hops.' },
        { icon: 'bi-eye-slash', text: 'Hidden FX costs, duplicated KYC work, and weak alerting when routing fails.' },
      ],
      stats: [
        { value: '7.3', label: 'average provider touchpoints before reliable scale' },
        { value: '5 days', label: 'settlement drag across disconnected routes' },
        { value: '4.2B', label: 'annual hidden FX leakage pressure on African SMEs' },
        { value: '0 clarity', label: 'when teams cannot see ledger, rails, and risk in one place' },
      ],
    },
    after: {
      title: 'Unified operating layer',
      points: [
        { icon: 'bi-boxes', text: 'One API across payouts, collections, accounts, wallets, ledgers, compliance, and reporting.' },
        { icon: 'bi-lightning-charge', text: 'Smart routing for local rails, cards, bank transfers, and treasury conversion windows.' },
        { icon: 'bi-journal-check', text: 'Real-time ledgering with event traces, sub-accounts, reconciliation exports, and alerts.' },
        { icon: 'bi-shield-check', text: 'Embedded KYC, KYB, sanctions checks, AML workflows, and audit-ready reporting.' },
      ],
      stats: [
        { value: '1 API', label: 'integration point across the finance stack' },
        { value: 'Real time', label: 'ledger updates and routing telemetry' },
        { value: 'Same-day', label: 'optimized payout and treasury windows' },
        { value: 'Full trace', label: 'from identity to payout confirmation and reconciliation' },
      ],
    },
  },

  stackLayers: [
    {
      id: 'global', order: 'Layer 01', title: 'Global rails',
      blurb: 'SWIFT, SEPA, ACH, card push and enterprise payout connectivity.',
      text: 'Bank transfers and card push networks connect Paymo to global payout corridors without forcing teams to rebuild treasury and compliance per route.',
      chips: ['SWIFT', 'SEPA', 'ACH', 'FedWire', 'CHAPS', 'Visa Direct', 'Mastercard Send'],
    },
    {
      id: 'africa', order: 'Layer 02', title: 'African local rails',
      blurb: 'Mobile money, national ACH, instant transfers, and bank switching.',
      text: 'Deep local coverage spans mobile money, domestic bank transfers, ACH networks, and market-specific clearing systems across priority African corridors.',
      chips: ['M-Pesa', 'MTN MoMo', 'Airtel Money', 'Orange Money', 'Wave', 'GhIPSS', 'NIBSS', 'PesaLink'],
    },
    {
      id: 'banking', order: 'Layer 03', title: 'Embedded banking',
      blurb: 'Virtual accounts, ledgers, wallets, and programmable balances.',
      text: 'Virtual accounts, sub-accounts, wallets, and programmable balances let platforms launch branded finance products without building a ledger stack from scratch.',
      chips: ['Virtual accounts', 'Sub-ledgers', 'Wallets', 'Interest-ready balances', 'Account naming', 'Balance segregation'],
    },
    {
      id: 'intelligence', order: 'Layer 04', title: 'Intelligence layer',
      blurb: 'Dynamic FX, predictive treasury, fraud scoring, route optimization.',
      text: 'FX timing, treasury balancing, fraud signals, and route-quality decisions sit above the rails so capital and reliability both improve with scale.',
      chips: ['Dynamic FX', 'Smart routing', 'Cash forecasting', 'Fraud detection', 'Liquidity signals', 'Failure recovery'],
    },
    {
      id: 'compliance', order: 'Layer 05', title: 'Compliance shield',
      blurb: 'KYC, KYB, monitoring, sanctions, and regulatory control.',
      text: 'KYC, KYB, sanctions, AML monitoring, and reporting workflows are embedded into onboarding and transaction flows for pan-African expansion.',
      chips: ['KYC', 'KYB', 'AML', 'Sanctions', 'Monitoring', 'Regulatory reporting'],
    },
  ],

  useCases: [
    {
      id: 'neobank', nodeLabel: 'Neobank launch', title: 'Launch a digital bank in 90 days.',
      description: 'Combine virtual accounts, cards, compliance, customer wallets, and treasury routing in one rollout path without building core banking primitives from scratch.',
      bullets: ['White-label account journeys and onboarding flows.', 'Wallet and ledger infrastructure for retail or SME balances.', 'Programmatic cards, transfers, and payout controls.'],
      metrics: ['90-day launch path', 'Accounts + cards', 'Built-in compliance'],
      position: { top: '8px', left: '50%', '--orbit-transform': 'translateX(-50%)' },
    },
    {
      id: 'payroll', nodeLabel: 'Cross-border payroll', title: 'Pay teams across markets with one payroll rail.',
      description: 'Run payroll and contractor disbursements across multiple countries with local payout options, smart FX timing, and centralized reconciliation.',
      bullets: ['Local-currency payouts and account or wallet delivery.', 'Bulk payment APIs and scheduled disbursement windows.', 'Finance-grade ledger exports for payroll reconciliation.'],
      metrics: ['Bulk payout ready', 'Local-currency delivery', 'Reconciliation built in'],
      position: { top: '126px', right: '4px' },
    },
    {
      id: 'ecommerce', nodeLabel: 'E-commerce checkout', title: 'Accept locally, settle intelligently.',
      description: 'Collect with mobile money or bank transfers, then route settlement using the best treasury and payout options for each market.',
      bullets: ['Single integration for multi-market checkout.', 'Unified events for collections, refunds, and merchant settlement.', 'Better payout continuity through route fallback logic.'],
      metrics: ['One checkout layer', 'Unified settlement', 'Fallback routing'],
      position: { bottom: '126px', right: '12px' },
    },
    {
      id: 'treasury', nodeLabel: 'Treasury optimization', title: 'Turn treasury from a spreadsheet into a system.',
      description: 'Track positions, convert on stronger windows, route to the best rail, and view reconciliation outputs from one control plane.',
      bullets: ['FX window optimization and liquidity awareness.', 'Balance segmentation across currencies and entities.', 'Operational alerting around route health and float exposure.'],
      metrics: ['FX intelligence', 'Balance orchestration', 'Operator control'],
      position: { bottom: '8px', left: '50%', '--orbit-transform': 'translateX(-50%)' },
    },
    {
      id: 'remittance', nodeLabel: 'Remittance superapp', title: 'Build a remittance superapp with rail depth.',
      description: 'Support bank deposit, wallet, and mobile money delivery while maintaining compliance controls and payout visibility end to end.',
      bullets: ['Cash-out flexibility across rail types.', 'Identity and monitoring controls inside the flow.', 'Event-level status for customer support and operations teams.'],
      metrics: ['Wallet + bank delivery', 'Support traceability', 'Compliance embedded'],
      position: { bottom: '126px', left: '12px' },
    },
    {
      id: 'supplier', nodeLabel: 'Supplier payments', title: 'Run supplier payments from one dashboard layer.',
      description: 'Move funds to local suppliers, international vendors, and service partners using a single payout workflow and ledger-backed finance controls.',
      bullets: ['Bulk supplier payouts and approval logic.', 'Global and local route support from one stack.', 'Audit-ready records for AP teams and treasury operators.'],
      metrics: ['AP workflow ready', 'Local + global reach', 'Audit-grade records'],
      position: { top: '126px', left: '4px' },
    },
  ],

  flowCards: [
    {
      tag: 'Routing', imageKey: 'dashboard', title: 'Routing command surface',
      text: 'Trigger, action, response logic for rails, retries, fallback paths, and payout confirmation handling.',
      chips: ['Fallback routing', 'Event webhooks', 'Failure recovery'],
      href: '#platform', linkIcon: 'bi-layers', linkLabel: 'Inspect stack layers',
    },
    {
      tag: 'FX Engine', imageKey: 'fxCoins', title: 'FX & recommendation engine',
      text: 'Model-driven suggestions for route selection, treasury balancing, and conversion timing across local currencies and majors.',
      chips: ['Dynamic FX', 'Cash positioning', 'Anomaly scoring'],
      href: '#coverage', linkIcon: 'bi-globe', linkLabel: 'See coverage map',
    },
    {
      tag: 'Telemetry', imageKey: 'stockData', title: 'Telemetry & data movement',
      text: 'A high-density flow canvas for compliance signals, routing intelligence, payout states, and ledger reconciliation telemetry.',
      chips: ['Risk events', 'Settlement signals', 'Ledger audit trail'],
      href: '#developers', linkIcon: 'bi-braces', linkLabel: 'Open API quickstart',
    },
  ],

  steps: [
    { index: '01', title: 'Collect', text: 'Cards, bank transfers, mobile money, and virtual account inflows enter one ledger stream.' },
    { index: '02', title: 'Screen', text: 'KYC, KYB, sanctions, AML, and threshold rules evaluate identity and payment behavior.' },
    { index: '03', title: 'Route', text: 'The intelligence layer selects the best rail, FX timing window, and fallback path.' },
    { index: '04', title: 'Settle', text: 'Funds settle into wallets, bank accounts, ledgers, and reporting pipelines with full traceability.' },
  ],

  coverage: {
    hubs: [
      { label: 'Core mesh', value: 'Africa rails', position: { left: '18%', top: '26%' } },
      { label: 'West', value: 'NG · GH · CI · SN', position: { left: '7%', top: '51%' } },
      { label: 'East', value: 'KE · UG · TZ · RW', position: { left: '38%', top: '55%' } },
      { label: 'Global', value: 'UK · US · EU · UAE', position: { right: '14%', top: '24%' } },
      { label: 'Treasury', value: 'USD · EUR · GBP · local', position: { right: '8%', bottom: '34%' } },
    ],
    lines: [
      { left: '27%', top: '34%', width: '24%', transform: 'rotate(-10deg)', animationDelay: '0.2s' },
      { left: '23%', top: '47%', width: '18%', transform: 'rotate(28deg)', animationDelay: '0.8s' },
      { left: '52%', top: '36%', width: '22%', transform: 'rotate(-6deg)', animationDelay: '1.4s' },
      { left: '54%', top: '56%', width: '23%', transform: 'rotate(24deg)', animationDelay: '2s' },
    ],
    filters: [
      { id: 'all', label: 'All routes' },
      { id: 'africa', label: 'Africa core' },
      { id: 'west', label: 'West' },
      { id: 'east', label: 'East' },
      { id: 'global', label: 'Global' },
    ],
    cards: [
      { region: 'africa', tile: 'tileGreen', icon: 'bi-wallet2', kicker: 'Local collections', title: 'Mobile money + bank transfer intake', text: 'Accept M-Pesa, MoMo, bank transfer, and account-based inflows with unified event streams.' },
      { region: 'global', tile: 'tileBlue', icon: 'bi-send-check', kicker: 'Outbound reach', title: 'Global bank and card payouts', text: 'Send value through SWIFT, SEPA, ACH, and partner card push rails with treasury controls.' },
      { region: 'west', tile: 'tilePurple', icon: 'bi-broadcast-pin', kicker: 'West Africa', title: 'Collections, payouts, disbursements', text: 'Country-specific rails for payroll, supplier payouts, wallets, and business settlements.' },
      { region: 'east', tile: 'tileGold', icon: 'bi-phone-vibrate', kicker: 'East Africa', title: 'Wallet-native disbursement flows', text: 'High-speed mobile money and bank payout pathways for payroll, commerce, and remittance apps.' },
    ],
    stats: [
      { value: '25+', label: 'market routes with regional compliance logic' },
      { value: '20+', label: 'currency and wallet/account balance options' },
      { value: 'Multi-rail', label: 'bank transfer, wallet, mobile money, and card disbursement' },
      { value: '24/7', label: 'monitoring across routing, risk, and reconciliation' },
    ],
    markets: ['Nigeria', 'Kenya', 'Ghana', 'Uganda', 'Tanzania', 'Rwanda', 'South Africa', 'Côte d’Ivoire', 'Senegal', 'United Kingdom', 'United States', 'European Union', 'United Arab Emirates'],
  },

  modules: [
    { icon: 'bi-arrow-down-up', tile: 'tileGreen', title: 'Collections', text: 'Accept local transfers, wallet payments, cards, and account-based inflows through a unified API.', chips: ['Bank transfer', 'Mobile money', 'Webhooks'] },
    { icon: 'bi-send', tile: 'tileBlue', title: 'Payouts', text: 'Single and bulk disbursement flows for suppliers, payroll, remittance, and merchant settlement.', chips: ['Bulk pay', 'Fallback rails', 'Status tracing'] },
    { icon: 'bi-building', tile: 'tilePurple', title: 'Virtual accounts', text: 'Issue named and pooled account identifiers for customer onboarding, collections, and treasury segregation.', chips: ['USD / EUR / GBP', 'Local currency', 'Sub-accounts'] },
    { icon: 'bi-journal-richtext', tile: 'tilePink', title: 'Ledger core', text: 'Double-entry infrastructure, wallet states, balance snapshots, and audit-grade event history.', chips: ['Real-time posting', 'Audit trail', 'Reconciliation'] },
    { icon: 'bi-credit-card-2-front', tile: 'tileGold', title: 'Card programs', text: 'Launch white-label consumer or corporate cards tied to wallets, spend controls, and program rules.', chips: ['Virtual cards', 'Spend rules', 'Program controls'] },
    { icon: 'bi-currency-exchange', tile: 'tileGreen', title: 'FX treasury', text: 'Auto-balance float positions, optimize conversion timing, and route payouts using treasury-aware logic.', chips: ['Dynamic spreads', 'Rate windows', 'Treasury alerts'] },
    { icon: 'bi-shield-check', tile: 'tileBlue', title: 'Compliance', text: 'Identity checks, sanctions screening, transaction monitoring, and market-specific reporting controls.', chips: ['KYC / KYB', 'AML rules', 'Regulatory exports'] },
    { icon: 'bi-phone', tile: 'tilePurple', title: 'White-label apps', text: 'Launch branded finance experiences for neobanks, marketplaces, payroll apps, and treasury platforms.', chips: ['SDK-first', 'Brand controls', 'Embedded onboarding'] },
  ],

  developerPoints: [
    { icon: 'bi-clock-history', title: 'Faster first request', text: 'Organized APIs for accounts, payouts, webhooks, balances, cards, compliance, and FX.' },
    { icon: 'bi-box-arrow-in-down', title: 'Practical tooling', text: 'Downloadable sample collection and copy-ready base URL straight from the homepage.' },
    { icon: 'bi-link-45deg', title: 'One integration surface', text: 'Avoid fragmented vendor logic by building against one event-driven interface.' },
  ],

  codeSamples: {
    curl: `curl --request POST https://sandbox.paymo.africa/v1/payouts \\
  --header "Authorization: Bearer pk_sandbox_paymo" \\
  --header "Content-Type: application/json" \\
  --data '{
    "reference": "payroll_2026_08_001",
    "currency": "KES",
    "amount": 125000,
    "destination": {
      "type": "mobile_money",
      "provider": "mpesa",
      "phone": "+254700000000"
    },
    "compliance_profile": "standard_business",
    "narration": "Monthly payroll settlement"
  }'`,
    node: `import Paymo from 'paymo-baas';

const client = new Paymo({
  apiKey: 'pk_sandbox_paymo',
  environment: 'sandbox'
});

const payout = await client.payouts.create({
  reference: 'supplier_run_2026_08_001',
  currency: 'NGN',
  amount: 2500000,
  destination: {
    type: 'bank_account',
    bankCode: '999',
    accountNumber: '0123456789',
    accountName: 'Lagos Parts Ltd'
  },
  settlementPreference: 'best_available_route'
});

console.log(payout.status);`,
    js: `const payload = {
  reference: 'merchant_settlement_2026_08_001',
  currency: 'GHS',
  amount: 54000,
  destination: {
    type: 'wallet',
    network: 'momo',
    identifier: 'merchant_wallet_001'
  },
  metadata: {
    routeStrategy: 'smart_fx_window'
  }
};

fetch('https://sandbox.paymo.africa/v1/payouts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pk_sandbox_paymo',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
}).then(res => res.json()).then(console.log);`,
  },

  trustStats: [
    { accent: '24/7', rest: '', text: 'transaction monitoring, alerting, and operational review windows' },
    { accent: 'KYC', rest: '/KYB', text: 'identity and business onboarding controls built into the flow' },
    { accent: 'AML', rest: '', text: 'rule-based and risk-signaled screening across payouts and collections' },
    { accent: 'Audit', rest: '', text: 'event logs, ledger traces, and export-ready reconciliation records' },
  ],

  trustFaq: [
    { id: 'trustOne', title: 'Pan-African compliance engine', open: true, body: 'Market-specific identity, sanctions, AML, and reporting logic are mapped into the orchestration layer so expansion does not force a full rebuild of risk workflows per country.' },
    { id: 'trustTwo', title: 'Real-time ledger and reconciliation', body: 'Every balance movement is captured with event-level traceability, enabling faster finance operations, internal controls, and partner reporting across complex payout programs.' },
    { id: 'trustThree', title: 'Multi-rail resilience and fallback logic', body: 'When route quality changes, Paymo can re-direct through alternate rails or treasury-aware pathways to keep payout success and collection continuity high.' },
    { id: 'trustFour', title: 'Enterprise and embedded finance readiness', body: 'From white-label fintech launches to enterprise treasury control rooms, the product architecture supports both developer-first and operator-first deployment models.' },
    { id: 'trustFive', title: 'Status, observability, and incident context', body: 'Operational status is surfaced through route telemetry, event monitoring, transaction state visibility, and clear fallback posture during rail degradation.' },
  ],

  results: [
    { kicker: 'Fintech and neobanks', end: 90, suffix: ' days', text: 'Typical launch path for branded accounts, cards, onboarding, and payout infrastructure with fewer custom banking primitives to build.' },
    { kicker: 'Treasury and enterprise', end: null, suffix: '1 surface', text: 'One control room for treasury balances, route quality, compliance rules, settlements, and reconciliation outputs.' },
    { kicker: 'Commerce and payroll', end: null, suffix: 'Same-day', text: 'Designed for rapid local disbursement and optimized cross-border conversion windows where route quality supports it.' },
  ],

  faqs: [
    { id: 'faqOne', title: 'What makes Paymo different from a normal payment processor?', open: true, body: 'Paymo combines collections and payouts with embedded banking, ledgers, virtual accounts, treasury intelligence, and compliance automation. It is positioned as BAAS infrastructure, not just a payments gateway.' },
    { id: 'faqTwo', title: 'Can Paymo support mobile money and bank rails together?', body: 'Yes. The architecture is intentionally multi-rail, allowing products to combine local mobile money flows, account-based transfers, and global bank payout corridors through one orchestration layer.' },
    { id: 'faqThree', title: 'Is this homepage using real working interactions?', body: 'Yes. The buttons open a real sandbox offcanvas, generate a treasury plan modal, switch code samples with a typing effect, copy code, download files, update FX cards, toggle coverage filters, and navigate to anchored sections.' },
    { id: 'faqFour', title: 'Is the layout responsive on mobile?', body: 'Yes. It is built on Bootstrap 5 with responsive grids for the hero visual, orbit constellation, metric grids, coverage blocks, and code panels — including touch-friendly tap-to-open dropdown menus.' },
    { id: 'faqFive', title: 'Can this theme extend to other pages in the Paymo site map?', body: 'Absolutely. The emerald neon-glass design system here is modular and can extend to platform, pricing, coverage, security, developer docs, and solutions pages while keeping the same visual language.' },
  ],

  footerLinks: [
    { href: '#hero', label: 'Home' },
    { href: '#platform', label: 'Platform' },
    { href: '#use-cases', label: 'Solutions' },
    { href: '#coverage', label: 'Coverage' },
    { href: '#developers', label: 'Developers' },
    { href: '#security', label: 'Trust' },
    { href: '#faq', label: 'FAQ' },
  ],

  images: {
    heroPhone: heroPhoneImg,
    dashboard: dashboardImg,
    fxCoins: fxCoinsImg,
    network: networkImg,
    stockData: stockDataImg,
    stockCoins: stockCoinsImg,
  },

  capabilityBrief: `PAYMO BAAS — HOMEPAGE CAPABILITY BRIEF

Positioning:
The financial nervous system for borderless Africa.

Core promise:
Build, bank, and move money across Africa and the world from a single API.

Key platform layers:
1. Global rails
2. African local rails
3. Embedded banking
4. Intelligence layer
5. Compliance shield

Design language:
Deep-space emerald, glassmorphism, mint neon edges, 3D renders, animated telemetry.
`,

  postmanStarter: {
    info: { name: 'Paymo BAAS Starter Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    item: [
      {
        name: 'Create payout',
        request: {
          method: 'POST',
          header: [
            { key: 'Authorization', value: 'Bearer pk_sandbox_paymo' },
            { key: 'Content-Type', value: 'application/json' },
          ],
          url: { raw: 'https://sandbox.paymo.africa/v1/payouts', protocol: 'https', host: ['sandbox', 'paymo', 'africa'], path: ['v1', 'payouts'] },
          body: {
            mode: 'raw',
            raw: JSON.stringify({ reference: 'sample_payout_001', currency: 'KES', amount: 5000, destination: { type: 'mobile_money', provider: 'mpesa', phone: '+254700000000' } }, null, 2),
          },
        },
      },
      {
        name: 'Create virtual account',
        request: {
          method: 'POST',
          header: [
            { key: 'Authorization', value: 'Bearer pk_sandbox_paymo' },
            { key: 'Content-Type', value: 'application/json' },
          ],
          url: { raw: 'https://sandbox.paymo.africa/v1/accounts/virtual', protocol: 'https', host: ['sandbox', 'paymo', 'africa'], path: ['v1', 'accounts', 'virtual'] },
          body: { mode: 'raw', raw: JSON.stringify({ customer_id: 'cust_001', currency: 'USD', label: 'Marketplace collections' }, null, 2) },
        },
      },
    ],
  },
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — replace URL with your production endpoint when ready.
 *    GET /api/paymo-home should return the same shape as initialMockData.
 * ------------------------------------------------------------------------ */
async function fetchHomeContent() {
  const response = await fetch('/api/paymo-home', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Paymo content API responded HTTP ${response.status}`);
  }
  return response.json();
}

/* --------------------------------------------------------------------------
 * 3. HELPERS
 * ------------------------------------------------------------------------ */
const s = styles;
const cx = (...parts) => parts.filter(Boolean).join(' ');

// Builds the animated sparkline SVG markup for an FX card (was innerHTML in legacy code).
function buildSparklineSvg(points, idSuffix) {
  const w = 220;
  const h = 38;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return `
    <svg viewBox="0 0 ${w} ${h}" class="${s.sparkline}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sparkG-${idSuffix}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7cf5c8" />
          <stop offset="100%" stop-color="#0e7c53" />
        </linearGradient>
        <linearGradient id="sparkA-${idSuffix}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(46,230,160,.32)" />
          <stop offset="100%" stop-color="rgba(46,230,160,0)" />
        </linearGradient>
      </defs>
      <polygon fill="url(#sparkA-${idSuffix})" points="0,${h} ${coords} ${w},${h}">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
      </polygon>
      <polyline fill="none" stroke="url(#sparkG-${idSuffix})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${coords}">
        <animate attributeName="stroke-dasharray" values="0 800;800 0" dur="1.6s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" />
      </polyline>
    </svg>`;
}

// Simulated FX drift — legacy `updateFx` behaviour, expressed as a pure state transform.
function driftFxPairs(pairs) {
  return pairs.map((item) => {
    const shift = (Math.random() - 0.5) * item.value * 0.0016;
    const nextPoints = item.points.slice(1);
    nextPoints.push(Math.max(10, nextPoints[nextPoints.length - 1] + (Math.random() * 8 - 4)));
    return {
      ...item,
      value: item.value + shift,
      delta: (Math.random() - 0.45) * 0.9,
      points: nextPoints,
    };
  });
}

/* --------------------------------------------------------------------------
 * 4. COMPONENT
 * ------------------------------------------------------------------------ */
export default function Home() {
  /* ---------- TanStack Query ---------- */
  const {
    data: apiData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['paymo-home-content'],
    queryFn: fetchHomeContent,
    staleTime: 60_000,
    retry: 1,
  });

  // Content falls back to `initialMockData` while the API is unreachable, so the
  // page never breaks; the error banner (below) surfaces the failure state.
  const content = apiData ?? initialMockData;
  const { images } = content;

  /* ---------- React state (was vanilla globals / dataset toggles) ---------- */
  const [fxPairs, setFxPairs] = useState(() => structuredClone(initialMockData.fxPairs));
  const [liveCount, setLiveCount] = useState(1284320);
  const [problemMode, setProblemMode] = useState('before');
  const [activeStack, setActiveStack] = useState('global');
  const [activeCase, setActiveCase] = useState('neobank');
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeCode, setActiveCode] = useState('curl');
  const [typedCode, setTypedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [planOutput, setPlanOutput] = useState(null); // rendered rollout plan JSX
  const lastPlanTextRef = useRef('Your rollout summary will appear here.');

  /* ---------- refs for legacy DOM bridges ---------- */
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(null);
  const heroVisualRef = useRef(null);
  const visualStageRef = useRef(null);
  const intervalRefs = useRef([]);
  const planUseCaseRef = useRef(null);
  const planMarketsRef = useRef(null);
  const planSettlementRef = useRef(null);
  const planDeliveryRef = useRef(null);

  const activeStackLayer = content.stackLayers.find((l) => l.id === activeStack) ?? content.stackLayers[0];
  const activeUseCase = content.useCases.find((c) => c.id === activeCase) ?? content.useCases[0];

  /* ---------- toast helper (replaces DOM appendChild pattern) ---------- */
  const pushToast = useCallback((message, icon = 'bi-check2-circle') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  /* ---------- clipboard helper (navigator.clipboard + legacy fallback) ---------- */
  const copyText = useCallback(
    async (text, targetButton, successLabel = 'Copied') => {
      const done = () => {
        if (targetButton && successLabel) {
          const original = targetButton.innerHTML;
          targetButton.innerHTML = successLabel;
          setTimeout(() => { targetButton.innerHTML = original; }, 1400);
        }
        pushToast('Copied to clipboard', 'bi-clipboard2-check');
      };
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          done();
          return;
        }
        // LEGACY BRIDGE: execCommand fallback textarea (from the vanilla page).
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'absolute';
        helper.style.left = '-9999px';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
        done();
      } catch {
        pushToast('Copy failed — select the text manually', 'bi-exclamation-triangle');
      }
    },
    [pushToast],
  );

  /* ---------- download helper (Blob + anchor click, unchanged from legacy) ---------- */
  const downloadFile = useCallback(
    (filename, fileContent, mime) => {
      const blob = new Blob([fileContent], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      pushToast(`Downloaded ${filename}`, 'bi-download');
    },
    [pushToast],
  );

  /* ---------- treasury plan generator ---------- */
  const generatePlan = useCallback(() => {
    const useCase = planUseCaseRef.current?.value ?? 'Neobank launch';
    const markets = planMarketsRef.current?.value ?? '2';
    const settlement = planSettlementRef.current?.value ?? 'local payout speed';
    const delivery = planDeliveryRef.current?.value ?? 'API-first integration';

    const phases = [
      { icon: 'bi-1-circle', text: 'Phase 1: activate collections, payout routes, ledgering, and compliance policies in the first core markets.' },
      { icon: 'bi-2-circle', text: 'Phase 2: enable treasury balancing, FX routing, and route fallback logic as transaction volume grows.' },
      { icon: 'bi-3-circle', text: 'Phase 3: expand into branded account experiences, card issuance, or deeper white-label rollout where relevant.' },
    ];

    setPlanOutput(
      <>
        <small className={cx(s.textMint, 'd-block text-uppercase mb-2')} style={{ letterSpacing: '0.16em' }}>
          Generated rollout summary
        </small>
        <h3 className={cx(s.heading, 'fs-4 mb-3')}>
          {useCase} across {markets}
        </h3>
        <p className={cx(s.textMutedPaymo, 'mb-3')}>
          Recommended model: <strong className="text-white">{delivery}</strong>. Prioritize{' '}
          <strong className="text-white">{settlement}</strong> as the lead success metric while launching Paymo through a
          staged regional rollout.
        </p>
        <ul className={cx(s.bulletList, 'mb-0')}>
          {phases.map((phase) => (
            <li key={phase.icon}>
              <span className={s.iconBadge}>
                <i className={`bi ${phase.icon}`} />
              </span>
              <span>{phase.text}</span>
            </li>
          ))}
        </ul>
      </>,
    );

    pushToast('Treasury plan generated', 'bi-diagram-2');
    lastPlanTextRef.current = `Paymo rollout summary\n\nUse case: ${useCase}\nMarkets: ${markets}\nPriority: ${settlement}\nDelivery: ${delivery}\n\nRecommended sequence:\n1. Launch core rails, compliance, and ledgering.\n2. Add treasury balancing and FX-aware routing.\n3. Expand into branded accounts, cards, or white-label products as needed.`;
  }, [pushToast]);

  /* ==========================================================================
   * LEGACY BRIDGE #1 — mount block. All ambient/window-level vanilla effects
   * from the original DOMContentLoaded handler live here with cleanups.
   * ======================================================================= */
  useEffect(() => {
    const timers = [];

    /* inject Google Fonts once (legacy <link> tags) */
    [ 'https://fonts.googleapis.com',
      'https://fonts.gstatic.com' ].forEach((href, i) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = i === 1 ? 'preconnect' : 'preconnect';
        link.href = href;
        if (i === 1) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
    if (!document.querySelector('link[data-paymo-fonts]')) {
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.dataset.paymoFonts = 'true';
      font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap';
      document.head.appendChild(font);
    }

    /* LEGACY BRIDGE: canvas particle network (initParticles). */
    const canvas = canvasRef.current;
    let rafId = 0;
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = canvas.getContext('2d');
      let W = 0;
      let H = 0;
      const resize = () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);
      const COUNT = Math.min(70, Math.floor(window.innerWidth / 22));
      const points = Array.from({ length: COUNT }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
      }));
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of points) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(46, 230, 160, 0.5)';
          ctx.fill();
        }
        for (let i = 0; i < points.length; i += 1) {
          for (let j = i + 1; j < points.length; j += 1) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const d = Math.hypot(dx, dy);
            if (d < 130) {
              ctx.beginPath();
              ctx.moveTo(points[i].x, points[i].y);
              ctx.lineTo(points[j].x, points[j].y);
              ctx.strokeStyle = `rgba(46, 230, 160, ${0.12 * (1 - d / 130)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        rafId = requestAnimationFrame(draw);
      };
      draw();
      intervalRefs.current.push({ type: 'resize', el: window, fn: resize });
    }

    /* LEGACY BRIDGE: scroll progress bar. */
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (progressRef.current) progressRef.current.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    intervalRefs.current.push({ type: 'scroll', el: window, fn: onScroll });

    /* LEGACY BRIDGE: hero 3D parallax on the visual stage. */
    const stage = visualStageRef.current;
    const visual = heroVisualRef.current;
    let heroMove;
    let heroLeave;
    if (stage && visual && window.matchMedia('(pointer: fine)').matches) {
      heroMove = (e) => {
        const r = visual.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      heroLeave = () => { stage.style.transform = ''; };
      visual.addEventListener('mousemove', heroMove);
      visual.addEventListener('mouseleave', heroLeave);
    }

    /* LEGACY BRIDGE: scroll-reveal IntersectionObserver over .reveal nodes. */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(s.inView);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    rootRef.current?.querySelectorAll(`.${s.reveal}`).forEach((el) => revealObserver.observe(el));

    /* LEGACY BRIDGE: count-up numbers via IntersectionObserver + RAF. */
    const counters = Array.from(rootRef.current?.querySelectorAll('[data-count]') ?? []);
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          counterObserver.unobserve(el);
          const end = Number(el.dataset.count);
          const start = performance.now();
          const dur = 1400;
          const tick = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(end * eased).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((el) => counterObserver.observe(el));

    /* LEGACY BRIDGE: card 3D tilt listeners (initTilt). */
    const tiltCleanups = [];
    if (window.matchMedia('(pointer: fine)').matches) {
      rootRef.current?.querySelectorAll('[data-tilt]').forEach((card) => {
        const move = (e) => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        };
        const leave = () => { card.style.transform = ''; };
        card.addEventListener('mousemove', move);
        card.addEventListener('mouseleave', leave);
        tiltCleanups.push(() => {
          card.removeEventListener('mousemove', move);
          card.removeEventListener('mouseleave', leave);
        });
      });
    }

    /* LEGACY BRIDGE: FX drift + live counters on intervals. */
    timers.push(setInterval(() => setFxPairs((prev) => driftFxPairs(prev)), 3600));
    timers.push(
      setInterval(() => {
        setLiveCount((c) => c + Math.floor(Math.random() * 9) + 3);
      }, 1500),
    );

    /* cleanup — mirrors removing every listener the legacy page leaked */
    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearInterval);
      intervalRefs.current.forEach(({ type, el, fn }) => el.removeEventListener(type, fn));
      intervalRefs.current = [];
      if (visual && heroMove) visual.removeEventListener('mousemove', heroMove);
      if (visual && heroLeave) visual.removeEventListener('mouseleave', heroLeave);
      revealObserver.disconnect();
      counterObserver.disconnect();
      tiltCleanups.forEach((fn) => fn());
    };
  }, []);

  /* LEGACY BRIDGE: typewriter effect for code samples (was RAF + insertAdjacentHTML). */
  useEffect(() => {
    const target = content.codeSamples[activeCode] ?? '';
    let i = 0;
    let raf = 0;
    setIsTyping(true);
    setTypedCode('');
    const step = () => {
      i = Math.min(target.length, i + 6);
      setTypedCode(target.slice(0, i));
      if (i < target.length) {
        raf = requestAnimationFrame(step);
      } else {
        setIsTyping(false);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [activeCode, content.codeSamples]);

  const assetForImageKey = (key) => images[key] ?? dashboardImg;

  /* --------------------------------------------------------------------------
   * 5. TEMPLATE (JSX)
   * ------------------------------------------------------------------------ */
  return (
    <div ref={rootRef} className="position-relative">
      {/* ===== ambient layers ===== */}
      <div ref={progressRef} className={s.scrollProgress} />
      <div className={s.bgGrid} />
      <canvas ref={canvasRef} className={s.particleCanvas} />
      <div className={s.ambientOrb} />
      <div className={s.ambientOrb2} />
      <div className={s.ambientOrb3} />

      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading Paymo content…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner (page falls back to mock data) ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Content API unreachable
          </strong>
          <div className="small mt-1">
            <code>/api/paymo-home</code> — {error.message}. Showing bundled mock content until the backend is connected.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      <main>
        {/* ================= HERO ================= */}
        <section id="hero" className={s.heroSection}>
          <div className="container">
            <div className={cx(s.heroBadge, s.reveal)}>
              <span className={s.dot} />
              <span>
                <strong>{content.hero.badgeStrong}</strong> {content.hero.badgeRest}
              </span>
            </div>
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className={s.reveal}>
                  <h1 className={cx(s.heroTitle, s.headlineGradient, s.heading)}>
                    {content.hero.titleStart}
                    <span className={s.mintStroke}>{content.hero.titleAccent}</span>
                  </h1>
                  <p className={cx(s.heroCopy, 'mb-0')}>{content.hero.copy}</p>
                  <div className={s.heroCta}>
                    <button
                      className={cx(s.btnPaymo, 'btn d-inline-flex align-items-center gap-2')}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#sandboxPanel"
                      type="button"
                    >
                      <i className="bi bi-code-slash" />
                      Start Building — Free Sandbox
                    </button>
                    <button
                      className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center gap-2')}
                      data-bs-toggle="modal"
                      data-bs-target="#treasuryModal"
                      type="button"
                    >
                      <i className="bi bi-briefcase" />
                      Talk to Treasury
                    </button>
                    <a href="#coverage" className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center gap-2')}>
                      <i className="bi bi-globe2" />
                      Explore Network
                    </a>
                  </div>
                  <div className={s.trustBand}>
                    {content.hero.trustPills.map((pill) => (
                      <span className={s.trustPill} key={pill.label}>
                        <i className={`bi ${pill.icon}`} />
                        <span><strong>{pill.value}</strong> {pill.label}</span>
                      </span>
                    ))}
                    <span className={s.trustPill}>
                      <i className="bi bi-activity" />
                      <span><strong>{liveCount.toLocaleString()}</strong> routed transactions</span>
                    </span>
                  </div>
                </div>

                {/* FX ticker — legacy renderFx() innerHTML replaced with state map */}
                <div className={cx(s.fxGrid, s.reveal)}>
                  {fxPairs.map((item, index) => (
                    <div className={cx(s.glassCard, s.fxCard)} key={item.pair}>
                      <div className={s.fxLabel}>{item.pair}</div>
                      <div className={s.fxValue}>{item.value.toFixed(2)}</div>
                      <div className={cx(s.fxDelta, item.delta >= 0 ? s.up : s.down)}>
                        {item.delta >= 0 ? '↗' : '↘'} {Math.abs(item.delta).toFixed(2)}%
                      </div>
                      {/* Safe: markup built locally from numeric data (legacy innerHTML equivalent) */}
                      <span dangerouslySetInnerHTML={{ __html: buildSparklineSvg(item.points, index) }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <div ref={heroVisualRef} className={cx(s.heroVisual, s.reveal)}>
                  <div className={s.heroRing} />
                  <div className={s.heroRing2} />
                  <div ref={visualStageRef} className={s.visualStage}>
                    <div className={cx(s.visualFrame, s.visualMain)}>
                      <img src={images.heroPhone} alt="Paymo mobile app 3D render with glowing payment notification" loading="eager" />
                    </div>
                    <div className={cx(s.visualFrame, s.visualLeft)}>
                      <img src={images.dashboard} alt="3D glass financial dashboard render" loading="lazy" />
                    </div>
                    <div className={cx(s.visualFrame, s.visualRight)}>
                      <img src={images.fxCoins} alt="3D floating coin and FX render" loading="lazy" />
                    </div>
                    {content.hero.visualBadges.map((badge) => (
                      <div className={cx(s.visualBadge, s[badge.key])} key={badge.key}>
                        <strong><span className={s.led} />{badge.label}</strong>
                        {badge.text}
                      </div>
                    ))}
                    <span className={s.pulseRing} />
                  </div>
                </div>
              </div>
            </div>

            {/* hero metrics with count-up */}
            <div className={cx(s.heroMetrics, s.reveal)}>
              {content.hero.metrics.map((metric) => (
                <div className={cx(s.glassCard, s.metricCard)} key={metric.label}>
                  <div className={s.metricNumber}>
                    <span data-count={metric.end}>0</span>
                    <span className={s.suffix}>{metric.suffix}</span>
                  </div>
                  <div className={s.metricLabel}>{metric.label}</div>
                </div>
              ))}
            </div>

            {/* rail marquee (duplicated in JSX for a seamless loop) */}
            <div className={cx(s.railMarquee, s.reveal)} aria-hidden="true">
              <div className={s.marqueeTrack}>
                {[...content.rails, ...content.rails].map((rail, i) => (
                  <span className={s.railChip} key={`${rail.label}-${i}`}>
                    <i className={`bi ${rail.icon}`} />
                    {rail.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROBLEM ================= */}
        <section id="problem" className={s.sectionPad}>
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className={cx('col-lg-5', s.reveal)}>
                <span className={s.sectionKicker}>The Problem</span>
                <h2 className={cx(s.heading, 'mb-3')}>Running finance across Africa should not require a PhD in fragmentation.</h2>
                <p className={cx(s.textMutedPaymo, 'mb-4')}>
                  Most operators stitch together dashboards, manual reconciliation, region-specific payout vendors, and
                  multiple KYC tools. Paymo compresses that sprawl into a single operating system.
                </p>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <button
                    className={cx(s.btnChip, 'btn', problemMode === 'before' && s.active)}
                    type="button"
                    onClick={() => setProblemMode('before')}
                  >
                    Before Paymo
                  </button>
                  <button
                    className={cx(s.btnChip, 'btn', problemMode === 'after' && s.active)}
                    type="button"
                    onClick={() => setProblemMode('after')}
                  >
                    After Paymo
                  </button>
                </div>
                <ul className={s.bulletList}>
                  {content.problem.tensionPoints.map((point) => (
                    <li key={point.icon}>
                      <span className={s.iconBadge}><i className={`bi ${point.icon}`} /></span>
                      <span>{point.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cx('col-lg-7', s.reveal)}>
                <div className={cx(s.glassCard, s.compareBoard)}>
                  {['before', 'after'].map((mode) => {
                    const modeData = content.problem[mode];
                    return (
                      <div className={cx(s.compareMode, problemMode === mode && s.active)} key={mode}>
                        <div className="row g-4 align-items-center">
                          <div className="col-md-6">
                            <h3 className={cx(s.heading, 'mb-3')}>{modeData.title}</h3>
                            <ul className={s.compareList}>
                              {modeData.points.map((point) => (
                                <li key={point.icon}>
                                  <span className={s.iconBadge}><i className={`bi ${point.icon}`} /></span>
                                  <span>{point.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <div className={s.miniStatGrid}>
                              {modeData.stats.map((stat) => (
                                <div className={s.miniStat} key={stat.value}>
                                  <strong>{stat.value}</strong>
                                  <span>{stat.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PLATFORM ================= */}
        <section id="platform" className={s.sectionPad}>
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className={cx('col-lg-5', s.reveal)}>
                <span className={s.sectionKicker}>Unified Platform Stack</span>
                <h2 className={cx(s.heading, 'mb-3')}>Five layers. One financial control plane.</h2>
                <p className={cx(s.textMutedPaymo, 'mb-4')}>
                  Global rails, African local rails, embedded banking, intelligence, and compliance. Click each layer to
                  inspect the operating components.
                </p>
                <div className={cx(s.glassCard, s.stackDetail)}>
                  <small className={cx(s.textMint, 'd-block text-uppercase mb-2')} style={{ letterSpacing: '0.18em' }}>
                    Selected layer
                  </small>
                  <h3 className={cx(s.heading, 'mb-2')}>{activeStackLayer.title}</h3>
                  <p className={cx(s.textMutedPaymo, 'mb-3')}>{activeStackLayer.text}</p>
                  <div className={s.chipRow}>
                    {activeStackLayer.chips.map((chip) => (
                      <span className={s.dataChip} key={chip}>{chip}</span>
                    ))}
                  </div>
                  <div className="mt-4 d-flex flex-wrap gap-2">
                    <a href="#modules" className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center gap-2')}>
                      <i className="bi bi-grid" />
                      Explore each layer
                    </a>
                    <button
                      className={cx(s.btnPaymo, 'btn d-inline-flex align-items-center gap-2')}
                      type="button"
                      onClick={() => downloadFile('paymo-capability-brief.txt', content.capabilityBrief, 'text/plain')}
                    >
                      <i className="bi bi-download" />
                      Capability brief
                    </button>
                  </div>
                </div>
              </div>
              <div className={cx('col-lg-7', s.reveal)}>
                <div className="row g-4 h-100">
                  <div className="col-lg-6">
                    <div className={cx(s.glassCard, s.stackShell, 'h-100 d-grid gap-3')}>
                      {content.stackLayers.map((layer) => (
                        <button
                          type="button"
                          className={cx(s.stackLayer, activeStack === layer.id && s.active)}
                          key={layer.id}
                          onClick={() => setActiveStack(layer.id)}
                        >
                          <small>{layer.order}</small>
                          <div className={cx(s.heading, 'fs-5')}>{layer.title}</div>
                          <div className={cx(s.textMutedPaymo, 'small mt-1')}>{layer.blurb}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={cx(s.glassCard, s.mediaFrame, 'h-100')}>
                      <img src={images.network} alt="3D emerald network globe showing financial routing" loading="lazy" />
                      <span className={s.scanline} />
                      <div className={s.overlayMetrics}>
                        <div className={cx(s.glassCard, s.metricCard)}>
                          <div className={s.metricNumber}>1.8s</div>
                          <div className={s.metricLabel}>average orchestration decision window</div>
                        </div>
                        <div className={cx(s.glassCard, s.metricCard)}>
                          <div className={s.metricNumber}>99.97%</div>
                          <div className={s.metricLabel}>uptime target for mission-critical flows</div>
                        </div>
                        <div className={cx(s.glassCard, s.metricCard)}>
                          <div className={s.metricNumber}>360°</div>
                          <div className={s.metricLabel}>traceability across identity, money movement, ledger events</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= USE CASES ================= */}
        <section id="use-cases" className={s.sectionPad}>
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className={cx('col-lg-6', s.reveal)}>
                <span className={s.sectionKicker}>Use Case Constellation</span>
                <div className={s.orbitShell}>
                  <div className={s.orbitPath} />
                  <div className={cx(s.orbitPath, s.inner)} />
                  <div className={s.orbitCenter}>
                    <span className={s.brandMark}>P</span>
                    <h3 className={cx(s.heading, 'mb-1 fs-5')}>Paymo BAAS</h3>
                    <p className={cx(s.textMutedPaymo, 'mb-0 px-4 small')}>Every use case orbiting one financial core.</p>
                  </div>
                  {content.useCases.map((item) => (
                    <button
                      type="button"
                      className={cx(s.orbitNode, activeCase === item.id && s.active)}
                      key={item.id}
                      style={item.position}
                      onClick={() => setActiveCase(item.id)}
                    >
                      <small>Use case</small>
                      {item.nodeLabel}
                    </button>
                  ))}
                </div>
              </div>
              <div className={cx('col-lg-6', s.reveal)}>
                <div className={cx(s.glassCard, s.casePanel, 'h-100')} key={activeCase}>
                  <span className={s.sectionKicker}>Interactive Case Detail</span>
                  <h3 className={cx(s.heading, 'mb-3')}>{activeUseCase.title}</h3>
                  <p className={s.textMutedPaymo}>{activeUseCase.description}</p>
                  <ul className={cx(s.bulletList, 'mt-4 mb-0')}>
                    {activeUseCase.bullets.map((bullet) => (
                      <li key={bullet}>
                        <span className={s.iconBadge}><i className="bi bi-check2" /></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={s.caseMetrics}>
                    {activeUseCase.metrics.map((metric) => (
                      <div className={s.miniStat} key={metric}>
                        <strong>{metric}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 d-flex flex-wrap gap-2">
                    <a href="#developers" className={cx(s.btnPaymo, 'btn d-inline-flex align-items-center gap-2')}>
                      <i className="bi bi-terminal" />
                      See developer flow
                    </a>
                    <button
                      className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center gap-2')}
                      data-bs-toggle="modal"
                      data-bs-target="#treasuryModal"
                      type="button"
                    >
                      <i className="bi bi-calendar-event" />
                      Map my rollout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FLOW ENGINE ================= */}
        <section id="flow-engine" className={s.sectionPad}>
          <div className="container">
            <div className={cx('text-center mb-5', s.reveal)}>
              <span className={s.sectionKicker}>Operational Flow Engine</span>
              <h2 className={cx(s.heading, 'mb-3')}>Live orchestration visuals, engineered for Paymo BAAS.</h2>
              <p className={cx(s.textMutedPaymo, 'mx-auto')} style={{ maxWidth: '840px' }}>
                Deep-space emerald gradients, frosted glass surfaces, and animated 3D renders frame Paymo as a living
                financial command center — not a static landing page.
              </p>
            </div>
            <div className="row g-4">
              {content.flowCards.map((card, idx) => (
                <div className={cx('col-lg-4', s.reveal)} key={card.title}>
                  <div className={cx(s.glassCard, s.flowCard, s.tilt)} data-tilt>
                    <div className={s.thumb}>
                      <span className={s.thumbTag}>{card.tag}</span>
                      <img src={assetForImageKey(card.imageKey)} alt={`${card.tag} 3D render`} loading="lazy" />
                    </div>
                    <div className={s.content}>
                      <h3 className={cx(s.heading, 'fs-4')}>{card.title}</h3>
                      <p className={s.textMutedPaymo}>{card.text}</p>
                      <div className={cx(s.chipRow, 'mb-4')}>
                        {card.chips.map((chip) => (
                          <span className={s.dataChip} key={chip}>{chip}</span>
                        ))}
                      </div>
                      <a
                        href={card.href}
                        className={cx(s.btnPaymoOutline, 'btn w-100 d-inline-flex align-items-center justify-content-center gap-2')}
                      >
                        <i className={`bi ${card.linkIcon}`} />
                        {card.linkLabel}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={cx(s.stepRail, s.reveal)}>
              {content.steps.map((step, i) => (
                <div className={cx(s.glassCard, s.stepCard)} key={step.index}>
                  <div className={s.stepIndex}>{step.index}</div>
                  <h3 className={cx(s.heading, 'fs-5')}>{step.title}</h3>
                  <p className={cx(s.textMutedPaymo, 'mb-0')}>{step.text}</p>
                  {i < content.steps.length - 1 && (
                    <i className={cx('bi bi-arrow-right d-none d-xl-block', s.connector)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= COVERAGE ================= */}
        <section id="coverage" className={s.sectionPad}>
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className={cx('col-lg-7', s.reveal)}>
                <span className={s.sectionKicker}>Live Network Coverage</span>
                <div className={cx(s.glassCard, s.networkShell)}>
                  <img src={images.network} className={s.networkGlobalImg} alt="" aria-hidden="true" />
                  {content.coverage.hubs.map((hub) => (
                    <div className={s.hubNode} style={hub.position} key={hub.label}>
                      <strong>{hub.label}</strong>
                      <span>{hub.value}</span>
                    </div>
                  ))}
                  {content.coverage.lines.map((line) => (
                    <span
                      className={s.networkLine}
                      key={`${line.left}-${line.top}`}
                      style={{
                        left: line.left,
                        top: line.top,
                        width: line.width,
                        transform: line.transform,
                        animationDelay: line.animationDelay,
                      }}
                    />
                  ))}
                  <div className="row g-3 position-relative" style={{ zIndex: 3, marginTop: '238px' }}>
                    {content.coverage.cards.map((card) => (
                      <div className="col-md-6" key={card.region}>
                        <div
                          className={cx(
                            s.glassCard,
                            s.coverageCard,
                            activeRegion !== 'all' && activeRegion !== card.region && s.hiddenRegion,
                          )}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            <div>
                              <small className={cx(s.textMint, 'text-uppercase d-block mb-2')} style={{ letterSpacing: '0.16em' }}>
                                {card.kicker}
                              </small>
                              <h3 className={cx(s.heading, 'fs-4 mb-2')}>{card.title}</h3>
                            </div>
                            <span className={cx(s.tile, s[card.tile], 'fs-4')}><i className={`bi ${card.icon}`} /></span>
                          </div>
                          <p className={cx(s.textMutedPaymo, 'mb-0')}>{card.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={cx('col-lg-5', s.reveal)}>
                <div className={cx(s.glassCard, 'p-4 h-100')}>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {content.coverage.filters.map((filter) => (
                      <button
                        type="button"
                        className={cx(s.btnChip, 'btn', activeRegion === filter.id && s.active)}
                        key={filter.id}
                        onClick={() => setActiveRegion(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <h3 className={cx(s.heading, 'mb-3')}>Coverage intelligence snapshot</h3>
                  <p className={s.textMutedPaymo}>
                    Explore the operating footprint through concise route clusters rather than a static map. The cards on
                    the left respond to the route filter above.
                  </p>
                  <div className={cx(s.miniStatGrid, 'mb-3')}>
                    {content.coverage.stats.map((stat) => (
                      <div className={s.miniStat} key={stat.value}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className={s.coverageChipGrid}>
                    {content.coverage.markets.map((market) => (
                      <span className={s.dataChip} key={market}>{market}</span>
                    ))}
                  </div>
                  <div className="mt-4 d-grid gap-2">
                    <a
                      href="#modules"
                      className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center justify-content-center gap-2')}
                    >
                      <i className="bi bi-grid-1x2" />
                      View product modules
                    </a>
                    <button
                      className={cx(s.btnPaymo, 'btn d-inline-flex align-items-center justify-content-center gap-2')}
                      data-bs-toggle="modal"
                      data-bs-target="#treasuryModal"
                      type="button"
                    >
                      <i className="bi bi-diagram-2" />
                      Generate route plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MODULES ================= */}
        <section id="modules" className={s.sectionPad}>
          <div className="container">
            <div className={cx('text-center mb-5', s.reveal)}>
              <span className={s.sectionKicker}>Comprehensive Product Modules</span>
              <h2 className={cx(s.heading, 'mb-3')}>Detailed, card-first platform coverage.</h2>
              <p className={cx(s.textMutedPaymo, 'mx-auto')} style={{ maxWidth: '820px' }}>
                Every major BAAS component gets a focused module card so visitors understand the stack quickly.
              </p>
            </div>
            <div className="row g-4">
              {content.modules.map((mod) => (
                <div className={cx('col-md-6 col-xl-3', s.reveal)} key={mod.title}>
                  <div className={cx(s.glassCard, s.moduleCard, s.tilt)} data-tilt>
                    <span className={cx(s.moduleIcon, s.tile, s[mod.tile])}><i className={`bi ${mod.icon}`} /></span>
                    <h3 className={cx(s.heading, 'fs-4')}>{mod.title}</h3>
                    <p className={s.textMutedPaymo}>{mod.text}</p>
                    <div className={s.chipRow}>
                      {mod.chips.map((chip) => (
                        <span className={s.dataChip} key={chip}>{chip}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= DEVELOPERS ================= */}
        <section id="developers" className={s.sectionPad}>
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className={cx('col-lg-5', s.reveal)}>
                <span className={s.sectionKicker}>Developer Experience</span>
                <h2 className={cx(s.heading, 'mb-3')}>SDK-first. Sandbox-first. Operator-ready.</h2>
                <p className={s.textMutedPaymo}>
                  The developer section is designed as a working surface. Switch runtimes, copy the code sample, download
                  an API starter, or open the sandbox panel immediately.
                </p>
                <div className={s.developerPoints}>
                  {content.developerPoints.map((point) => (
                    <div className={s.miniStat} key={point.title}>
                      <span className={s.iconBadge}><i className={`bi ${point.icon}`} /></span>
                      <div>
                        <strong>{point.title}</strong>
                        <span className={s.textMutedPaymo}>{point.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 d-flex flex-wrap gap-2">
                  <button
                    className={cx(s.btnPaymo, 'btn d-inline-flex align-items-center gap-2')}
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sandboxPanel"
                    type="button"
                  >
                    <i className="bi bi-rocket-takeoff" />
                    Open sandbox panel
                  </button>
                  <button
                    className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center gap-2')}
                    type="button"
                    onClick={() => downloadFile('paymo-baas-starter.json', JSON.stringify(content.postmanStarter, null, 2), 'application/json')}
                  >
                    <i className="bi bi-cloud-download" />
                    Download API starter
                  </button>
                </div>
              </div>
              <div className={cx('col-lg-7', s.reveal)}>
                <div className={cx(s.glassCard, s.codePanel)}>
                  <div className={s.codeSwitcher}>
                    {Object.keys(content.codeSamples).map((key) => (
                      <button
                        type="button"
                        className={cx(s.btnChip, 'btn', activeCode === key && s.active)}
                        key={key}
                        onClick={() => setActiveCode(key)}
                      >
                        {key === 'js' ? 'Browser JS' : key === 'node' ? 'Node' : 'cURL'}
                      </button>
                    ))}
                  </div>
                  <div className={s.codeScreen}>
                    <div className={s.codeTopbar}>
                      <div className={s.codeDots}><span /><span /><span /></div>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className={cx(s.btnPaymoOutline, 'btn btn-sm')}
                          type="button"
                          onClick={(e) => copyText('https://sandbox.paymo.africa/v1', e.currentTarget)}
                        >
                          Copy base URL
                        </button>
                        <button
                          className={cx(s.btnPaymo, 'btn btn-sm')}
                          type="button"
                          onClick={(e) => copyText(content.codeSamples[activeCode], e.currentTarget)}
                        >
                          Copy code
                        </button>
                      </div>
                    </div>
                    <pre className={s.codePre} aria-live="polite">
                      {typedCode}
                      {isTyping && <span className={s.caret} />}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECURITY / TRUST ================= */}
        <section id="security" className={s.sectionPad}>
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className={cx('col-lg-5', s.reveal)}>
                <span className={s.sectionKicker}>Security &amp; Trust Center</span>
                <h2 className={cx(s.heading, 'mb-3')}>Compliance automation without losing operational speed.</h2>
                <p className={s.textMutedPaymo}>
                  Paymo positions compliance as part of the transaction fabric, not an afterthought added at the end of
                  routing.
                </p>
                <div className={cx(s.trustGrid, 'mt-4')}>
                  {content.trustStats.map((stat) => (
                    <div className={cx(s.glassCard, s.resultCard, s.tilt)} data-tilt key={stat.accent}>
                      <div className={s.resultNumber}>
                        <em>{stat.accent}</em>
                        {stat.rest}
                      </div>
                      <div className={s.textMutedPaymo}>{stat.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cx('col-lg-7', s.reveal)}>
                {/* Bootstrap accordion — data API handled by the imported JS bundle */}
                <div className={cx('accordion', s.accordionPaymo)} id="trustAccordion">
                  {content.trustFaq.map((item) => (
                    <div className="accordion-item" key={item.id}>
                      <h2 className="accordion-header">
                        <button
                          className={cx('accordion-button', !item.open && 'collapsed')}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${item.id}`}
                          aria-expanded={!!item.open}
                          aria-controls={item.id}
                        >
                          {item.title}
                        </button>
                      </h2>
                      <div
                        id={item.id}
                        className={cx('accordion-collapse collapse', item.open && 'show')}
                        data-bs-parent="#trustAccordion"
                      >
                        <div className={cx('accordion-body', s.textMutedPaymo)}>{item.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RESULTS ================= */}
        <section id="results" className={s.sectionPad}>
          <div className="container">
            <div className={cx('text-center mb-5', s.reveal)}>
              <span className={s.sectionKicker}>Why Operators Switch</span>
              <h2 className={cx(s.heading, 'mb-3')}>Built for fintech builders and finance teams at the same time.</h2>
              <p className={cx(s.textMutedPaymo, 'mx-auto')} style={{ maxWidth: '780px' }}>
                Paymo is not just another checkout layer — it is treasury, embedded banking, compliance automation,
                developer speed, and regional depth together.
              </p>
            </div>
            <div className="row g-4">
              {content.results.map((result) => (
                <div className={cx('col-lg-4', s.reveal)} key={result.kicker}>
                  <div className={cx(s.glassCard, s.resultCard, 'h-100', s.tilt)} data-tilt>
                    <small className={cx(s.textMint, 'text-uppercase d-block mb-2')} style={{ letterSpacing: '0.16em' }}>
                      {result.kicker}
                    </small>
                    <div className={s.resultNumber}>
                      {result.end !== null ? <span data-count={result.end}>0</span> : null}
                      <em>{result.suffix}</em>
                    </div>
                    <p className={s.textMutedPaymo}>{result.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="faq" className={cx(s.sectionPad, 'pt-0')}>
          <div className="container">
            <div className={cx('text-center mb-5', s.reveal)}>
              <span className={s.sectionKicker}>FAQ</span>
              <h2 className={cx(s.heading, 'mb-3')}>Answers for founders, operators, and engineers.</h2>
            </div>
            <div className={cx('accordion', s.accordionPaymo, s.reveal)} id="faqAccordion">
              {content.faqs.map((item) => (
                <div className="accordion-item" key={item.id}>
                  <h2 className="accordion-header">
                    <button
                      className={cx('accordion-button', !item.open && 'collapsed')}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#${item.id}`}
                      aria-expanded={!!item.open}
                      aria-controls={item.id}
                    >
                      {item.title}
                    </button>
                  </h2>
                  <div
                    id={item.id}
                    className={cx('accordion-collapse collapse', item.open && 'show')}
                    data-bs-parent="#faqAccordion"
                  >
                    <div className={cx('accordion-body', s.textMutedPaymo)}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section id="cta" className={cx(s.sectionPad, 'pt-0')}>
          <div className={cx('container', s.reveal)}>
            <div className={cx(s.glassCard, s.ctaShell, 'p-4 p-lg-5')}>
              <img src={images.stockCoins} className={cx(s.ctaArt, 'd-none d-lg-block')} alt="" aria-hidden="true" />
              <div className="row align-items-center g-4 position-relative">
                <div className="col-lg-7">
                  <span className={s.sectionKicker}>Final Call to Action</span>
                  <h2 className={cx(s.heading, 'mb-3')}>Launch the next financial layer for borderless Africa.</h2>
                  <p className={cx(s.textMutedPaymo, 'mb-0')}>
                    Start with the sandbox, generate a route plan for your rollout, or download the homepage capability
                    brief built from the Paymo BAAS structure.
                  </p>
                </div>
                <div className="col-lg-5">
                  <div className="d-grid gap-2">
                    <button
                      className={cx(s.btnPaymo, 'btn d-inline-flex align-items-center justify-content-center gap-2')}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#sandboxPanel"
                      type="button"
                    >
                      <i className="bi bi-play-circle" />
                      Start sandbox workflow
                    </button>
                    <button
                      className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center justify-content-center gap-2')}
                      data-bs-toggle="modal"
                      data-bs-target="#treasuryModal"
                      type="button"
                    >
                      <i className="bi bi-graph-up-arrow" />
                      Build my treasury plan
                    </button>
                    <button
                      className={cx(s.btnPaymoOutline, 'btn d-inline-flex align-items-center justify-content-center gap-2')}
                      type="button"
                      onClick={() => downloadFile('paymo-capability-brief.txt', content.capabilityBrief, 'text/plain')}
                    >
                      <i className="bi bi-file-earmark-arrow-down" />
                      Download capability brief
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className={s.footerShell}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <div className="d-flex align-items-center gap-3 mb-2">
                <span className={s.brandMark}>P</span>
                <div>
                  <div className={cx(s.heading, 'fs-5')}>Paymo</div>
                  <div className={cx(s.brandSub, 'small text-uppercase')}>BAAS Rails</div>
                </div>
              </div>
              <div className={cx(s.textMutedPaymo, 'small')}>
                © {new Date().getFullYear()} Paymo BAAS. Engineered with an emerald glass design system.
              </div>
            </div>
            <div className="col-lg-7">
              <div className={cx(s.footerLinks, 'justify-content-lg-end')}>
                {content.footerLinks.map((link) => (
                  <a href={link.href} key={link.href}>{link.label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= OFFCANVAS (Bootstrap) ================= */}
      <div className="offcanvas offcanvas-end" tabIndex={-1} id="sandboxPanel" aria-labelledby="sandboxPanelLabel">
        <div className="offcanvas-header">
          <div>
            <h5 id="sandboxPanelLabel" className={cx(s.heading, 'mb-1')}>Free sandbox quickstart</h5>
            <div className={cx(s.textMutedPaymo, 'small')}>Working actions inside the homepage.</div>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-grid gap-3">
          <div className={cx(s.glassCard, 'p-3')}>
            <small className={cx(s.textMint, 'text-uppercase d-block mb-2')} style={{ letterSpacing: '0.16em' }}>Step 1</small>
            <h3 className={cx(s.heading, 'fs-5')}>Get your integration base</h3>
            <p className={cx(s.textMutedPaymo, 'mb-3')}>
              Use the sample base URL and switch to the developer section to copy starter code for payouts, accounts, or
              collections.
            </p>
            <button
              className={cx(s.btnPaymoOutline, 'btn w-100')}
              type="button"
              onClick={(e) => copyText('https://sandbox.paymo.africa/v1', e.currentTarget)}
            >
              Copy sandbox base URL
            </button>
          </div>
          <div className={cx(s.glassCard, 'p-3')}>
            <small className={cx(s.textMint, 'text-uppercase d-block mb-2')} style={{ letterSpacing: '0.16em' }}>Step 2</small>
            <h3 className={cx(s.heading, 'fs-5')}>Download starter collection</h3>
            <p className={cx(s.textMutedPaymo, 'mb-3')}>Grab a lightweight JSON starter that mirrors the homepage API examples.</p>
            <button
              className={cx(s.btnPaymoOutline, 'btn w-100')}
              type="button"
              onClick={() => downloadFile('paymo-baas-starter.json', JSON.stringify(content.postmanStarter, null, 2), 'application/json')}
            >
              Download starter collection
            </button>
          </div>
          <div className={cx(s.glassCard, 'p-3')}>
            <small className={cx(s.textMint, 'text-uppercase d-block mb-2')} style={{ letterSpacing: '0.16em' }}>Step 3</small>
            <h3 className={cx(s.heading, 'fs-5')}>Jump to implementation</h3>
            <p className={cx(s.textMutedPaymo, 'mb-3')}>Go straight to the code panel to see runtime-specific examples and copy them.</p>
            <a href="#developers" className={cx(s.btnPaymo, 'btn w-100')} data-bs-dismiss="offcanvas">
              Open developer section
            </a>
          </div>
        </div>
      </div>

      {/* ================= MODAL (Bootstrap) ================= */}
      <div className="modal fade" id="treasuryModal" tabIndex={-1} aria-labelledby="treasuryModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 className={cx('modal-title', s.heading)} id="treasuryModalLabel">
                  Generate a Paymo treasury rollout plan
                </h5>
                <div className={cx(s.textMutedPaymo, 'small')}>This modal creates a tailored plan summary directly on the page.</div>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="planUseCase">Primary use case</label>
                  <select id="planUseCase" className="form-select" ref={planUseCaseRef} defaultValue="Neobank launch">
                    <option value="Neobank launch">Neobank launch</option>
                    <option value="Cross-border payroll">Cross-border payroll</option>
                    <option value="Remittance superapp">Remittance superapp</option>
                    <option value="Supplier payments">Supplier payments</option>
                    <option value="Marketplace collections">Marketplace collections</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="planMarkets">Markets at launch</label>
                  <select id="planMarkets" className="form-select" ref={planMarketsRef} defaultValue="2">
                    <option value="2">2 markets</option>
                    <option value="4">4 markets</option>
                    <option value="8">8 markets</option>
                    <option value="12">12+ markets</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="planSettlement">Primary settlement focus</label>
                  <select id="planSettlement" className="form-select" ref={planSettlementRef} defaultValue="local payout speed">
                    <option value="local payout speed">Local payout speed</option>
                    <option value="treasury optimization">Treasury optimization</option>
                    <option value="compliance automation">Compliance automation</option>
                    <option value="account issuance">Account issuance</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="planDelivery">Preferred delivery pattern</label>
                  <select id="planDelivery" className="form-select" ref={planDeliveryRef} defaultValue="API-first integration">
                    <option value="API-first integration">API-first integration</option>
                    <option value="White-label launch">White-label launch</option>
                    <option value="Hybrid operator console">Hybrid operator console</option>
                  </select>
                </div>
              </div>
              <div className={cx(s.glassCard, 'p-4 mt-4')}>
                {planOutput ?? (
                  <>
                    <h3 className={cx(s.heading, 'fs-5 mb-2')}>Your rollout summary will appear here.</h3>
                    <p className={cx(s.textMutedPaymo, 'mb-0')}>
                      Choose your parameters and click <strong>Generate plan</strong> to produce a concise deployment
                      recommendation.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer d-flex flex-wrap gap-2 justify-content-between">
              <button
                type="button"
                className={cx(s.btnPaymoOutline, 'btn')}
                onClick={(e) => copyText(lastPlanTextRef.current, e.currentTarget)}
              >
                Copy plan
              </button>
              <div className="d-flex flex-wrap gap-2">
                <button type="button" className={cx(s.btnPaymo, 'btn')} onClick={generatePlan}>
                  Generate plan
                </button>
                <a href="#coverage" className={cx(s.btnPaymoOutline, 'btn')} data-bs-dismiss="modal">
                  Go to coverage
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TOASTS ================= */}
      <div className={s.toastWrap}>
        {toasts.map((toast) => (
          <div className={s.paymoToast} key={toast.id}>
            <i className={`bi ${toast.icon}`} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
