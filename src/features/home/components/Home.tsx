/* ============================================================================
 * Home.jsx — Paymo Homepage (Emerald Glass Edition)
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

import { useCallback, useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// keeps modals/offcanvas/accordions alive — browser-only to avoid SSR `document` crash
if (typeof document !== "undefined") {
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
}

import dashboardImg from "@/features/home/public/assets/dashboard-3d.svg";
import fxCoinsImg from "@/features/home/public/assets/fx-coins.svg";
import heroPhoneImg from "@/features/home/public/assets/hero-phone.svg";
import networkImg from "@/features/home/public/assets/network-globe.svg";
import stockCoinsImg from "@/features/home/public/assets/stock-coins.svg";
import stockDataImg from "@/features/home/public/assets/stock-data.svg";
import styles from "@/features/home/styles/homepage.module.css";

/* --------------------------------------------------------------------------
 * 1. initialMockData — EVERY repeating/hardcoded content block extracted from
 *    the legacy template. Swap for the API payload; shape is backend-ready.
 * ------------------------------------------------------------------------ */
const initialMockData = {
        hero: {
                badgeStrong: "Your Money",
                badgeRest: "Made Simple",
                titleStart:
                        "Send, receive, and manage money across Africa and the world — with ",
                titleAccent: "PayMO",
                copy: "Paymo connects M-Pesa, banks, mobile money, and international payments in one simple platform. Perfect for businesses, freelancers, students, and anyone who needs to move money easily across Kenya and beyond.",
                trustPills: [
                        {
                                icon: "bi-people",
                                value: "400+",
                                label: "businesses and users trust us",
                        },
                        { icon: "bi-signpost", value: "25+", label: "countries and routes" },
                ],
                metrics: [
                        {
                                end: 30,
                                suffix: "+",
                                label: "ways to pay and get paid",
                        },
                        {
                                end: 10,
                                suffix: "+",
                                label: "countries you can send to",
                        },
                        {
                                end: 99,
                                suffix: ".97%",
                                label: "uptime - we are always working",
                        },
                        {
                                end: 90,
                                suffix: " days",
                                label: "to launch your business payments",
                        },
                ],
                visualBadges: [
                        {
                                key: "badge1",
                                label: "All connected",
                                text: "M-Pesa, banks, and cards all in one app.",
                        },
                        {
                                key: "badge2",
                                label: "Instant payments",
                                text: "KES 125,000 sent to M-Pesa · just now",
                        },
                        {
                                key: "badge3",
                                label: "Easy setup",
                                text: "Start sending and receiving in minutes.",
                        },
                ],
        },

        fxPairs: [
                {
                        pair: "USD / NGN",
                        value: 1536.42,
                        delta: 0.48,
                        points: [20, 28, 24, 31, 34, 29, 36, 40],
                },
                {
                        pair: "USD / KES",
                        value: 129.16,
                        delta: -0.21,
                        points: [34, 32, 31, 33, 29, 27, 30, 28],
                },
                {
                        pair: "USD / GHS",
                        value: 15.08,
                        delta: 0.18,
                        points: [16, 19, 17, 21, 23, 22, 25, 27],
                },
                {
                        pair: "EUR / XOF",
                        value: 655.96,
                        delta: 0.09,
                        points: [24, 26, 25, 26, 29, 30, 31, 32],
                },
        ],

        rails: [
                { icon: "bi-phone", label: "M-Pesa" },
                { icon: "bi-phone-vibrate", label: "MTN MoMo" },
                { icon: "bi-broadcast", label: "Airtel Money" },
                { icon: "bi-wallet2", label: "Orange Money" },
                { icon: "bi-lightning-charge", label: "PesaLink" },
                { icon: "bi-bank", label: "NIBSS" },
                { icon: "bi-bank2", label: "GhIPSS" },
                { icon: "bi-globe", label: "SWIFT" },
                { icon: "bi-globe2", label: "SEPA" },
                { icon: "bi-building", label: "ACH" },
                { icon: "bi-credit-card", label: "Visa Direct" },
                { icon: "bi-credit-card-2-back", label: "Mastercard Send" },
        ],

        navMenus: {
                product: [
                        {
                                icon: "bi-arrow-down-up",
                                tile: "tileGreen",
                                title: "Send & Receive",
                                sub: "All payment types in one place.",
                                href: "#modules",
                        },
                        {
                                icon: "bi-building",
                                tile: "tileBlue",
                                title: "Virtual Accounts",
                                sub: "Create accounts for customers.",
                                href: "#modules",
                        },
                        {
                                icon: "bi-credit-card-2-front",
                                tile: "tilePurple",
                                title: "Card Programs",
                                sub: "Issue virtual and physical cards.",
                                href: "#modules",
                        },
                        {
                                icon: "bi-currency-exchange",
                                tile: "tileGold",
                                title: "Currency Exchange",
                                sub: "Smart conversion and best rates.",
                                href: "#modules",
                        },
                ],
                solutions: [
                        {
                                icon: "bi-bank2",
                                tile: "tileGreen",
                                title: "Banks & Financial Institutions",
                                sub: "Payment rails and clearing systems.",
                                href: "#use-cases",
                        },
                        {
                                icon: "bi-globe",
                                tile: "tileBlue",
                                title: "Global Businesses",
                                sub: "Accept African payments worldwide.",
                                href: "#use-cases",
                        },
                        {
                                icon: "bi-send",
                                tile: "tilePurple",
                                title: "Traders & Importers",
                                sub: "Easy foreign exchange and payments.",
                                href: "#use-cases",
                        },
                        {
                                icon: "bi-grid-3x3-gap",
                                tile: "tilePink",
                                title: "Platforms & Marketplaces",
                                sub: "Bulk payments and split collections.",
                                href: "#use-cases",
                        },
                        {
                                icon: "bi-graph-up-arrow",
                                tile: "tileGold",
                                title: "Growing Businesses",
                                sub: "Complete money management tools.",
                                href: "#use-cases",
                        },
                ],
                developers: [
                        {
                                icon: "bi-terminal",
                                tile: "tileGreen",
                                title: "API Quickstart",
                                sub: "Start building with our APIs.",
                                href: "#developers",
                        },
                        {
                                icon: "bi-plug",
                                tile: "tileBlue",
                                title: "Webhooks & Events",
                                sub: "Real-time updates and signals.",
                                href: "#developers",
                        },
                        {
                                icon: "bi-shield-lock",
                                tile: "tileGold",
                                title: "Security",
                                sub: "Built-in safety and compliance.",
                                href: "#security",
                        },
                ],
        },

        problem: {
                tensionPoints: [
                        {
                                icon: "bi-diagram-3",
                                text: "Most businesses juggle multiple payment apps and systems before things work smoothly.",
                        },
                        {
                                icon: "bi-cash-coin",
                                text: "Hidden fees pile up when you use different services for different payments.",
                        },
                        {
                                icon: "bi-shield-lock",
                                text: "Keeping track of rules, safety checks, and reports becomes a nightmare across different tools.",
                        },
                ],
                before: {
                        title: "The Old Way",
                        points: [
                                {
                                        icon: "bi-columns-gap",
                                        text: "Multiple apps, different logins, and confusing screens for every payment type.",
                                },
                                {
                                        icon: "bi-file-earmark-spreadsheet",
                                        text: "Manual spreadsheets to track money coming in and going out.",
                                },
                                {
                                        icon: "bi-hourglass-split",
                                        text: "Payments take days to arrive, and you cannot see where money is stuck.",
                                },
                                {
                                        icon: "bi-eye-slash",
                                        text: "Hidden charges, repeated paperwork, and no alerts when payments fail.",
                                },
                        ],
                        stats: [
                                {
                                        value: "7.3",
                                        label: "different apps to manage payments",
                                },
                                {
                                        value: "5 days",
                                        label: "waiting for payments to clear",
                                },
                                {
                                        value: "4.2B",
                                        label: "shillings lost in hidden fees yearly",
                                },
                                {
                                        value: "0 clarity",
                                        label: "on where your money actually is",
                                },
                        ],
                },
                after: {
                        title: "The Paymo Way",
                        points: [
                                {
                                        icon: "bi-boxes",
                                        text: "One simple system for all payments, collections, accounts, and reports.",
                                },
                                {
                                        icon: "bi-lightning-charge",
                                        text: "Smart routing sends money the best way - M-Pesa, bank, or card automatically.",
                                },
                                {
                                        icon: "bi-journal-check",
                                        text: "See every transaction in real-time with clear records and automatic tracking.",
                                },
                                {
                                        icon: "bi-shield-check",
                                        text: "Built-in safety checks, compliance, and audit-ready reports without extra work.",
                                },
                        ],
                        stats: [
                                { value: "1 app", label: "for all your payment needs" },
                                { value: "Instant", label: "updates and tracking" },
                                { value: "Same-day", label: "payments when possible" },
                                {
                                        value: "Full view",
                                        label: "of every shilling you send or receive",
                                },
                        ],
                },
        },

        stackLayers: [
                {
                        id: "global",
                        order: "Layer 01",
                        title: "Global payments",
                        blurb: "Send money worldwide through banks and cards.",
                        text: "Connect to international payment networks without setting up complex systems for each country.",
                        chips: [
                                "SWIFT",
                                "SEPA",
                                "ACH",
                                "FedWire",
                                "CHAPS",
                                "Visa Direct",
                                "Mastercard Send",
                        ],
                },
                {
                        id: "africa",
                        order: "Layer 02",
                        title: "Local African payments",
                        blurb:
                                "M-Pesa, mobile money, banks, and instant transfers.",
                        text: "All your favorite African payment methods in one place - from M-Pesa to bank transfers across the continent.",
                        chips: [
                                "M-Pesa",
                                "MTN MoMo",
                                "Airtel Money",
                                "Orange Money",
                                "Wave",
                                "GhIPSS",
                                "NIBSS",
                                "PesaLink",
                        ],
                },
                {
                        id: "banking",
                        order: "Layer 03",
                        title: "Virtual accounts",
                        blurb: "Create accounts, wallets, and manage balances.",
                        text: "Generate virtual accounts and wallets for your customers without building complex banking systems from scratch.",
                        chips: [
                                "Virtual accounts",
                                "Sub-ledgers",
                                "Wallets",
                                "Interest-ready balances",
                                "Account naming",
                                "Balance segregation",
                        ],
                },
                {
                        id: "intelligence",
                        order: "Layer 04",
                        title: "Smart routing",
                        blurb:
                                "Best exchange rates, fraud protection, and route optimization.",
                        text: "Automatic smart choices for exchange rates, fraud detection, and the best payment routes so your money moves safely and efficiently.",
                        chips: [
                                "Dynamic FX",
                                "Smart routing",
                                "Cash forecasting",
                                "Fraud detection",
                                "Liquidity signals",
                                "Failure recovery",
                        ],
                },
                {
                        id: "compliance",
                        order: "Layer 05",
                        title: "Safety & compliance",
                        blurb: "Identity checks, monitoring, and regulatory control.",
                        text: "Built-in safety checks, identity verification, and compliance requirements so you can operate across Africa without the headache.",
                        chips: [
                                "KYC",
                                "KYB",
                                "AML",
                                "Sanctions",
                                "Monitoring",
                                "Regulatory reporting",
                        ],
                },
        ],

        useCases: [
                {
                        id: "neobank",
                        nodeLabel: "Digital bank",
                        title: "Start your own bank in 90 days.",
                        description:
                                "Launch accounts, cards, wallets, and payment systems without building everything from scratch.",
                        bullets: [
                                "Ready-made account opening flows.",
                                "Wallet and balance tracking for customers.",
                                "Cards, transfers, and payment controls.",
                        ],
                        metrics: [
                                "90-day launch",
                                "Accounts + cards",
                                "Built-in safety",
                        ],
                        position: {
                                top: "8px",
                                left: "50%",
                                "--orbit-transform": "translateX(-50%)",
                        },
                },
                {
                        id: "payroll",
                        nodeLabel: "Payroll",
                        title: "Pay your team anywhere, anytime.",
                        description:
                                "Send salaries and payments to workers across different countries using local methods like M-Pesa and bank transfers.",
                        bullets: [
                                "Pay in local currency to phones or banks.",
                                "Bulk payments and scheduled transfers.",
                                "Automatic records and tracking.",
                        ],
                        metrics: [
                                "Bulk payments",
                                "Local delivery",
                                "Built-in tracking",
                        ],
                        position: { top: "126px", right: "4px" },
                },
                {
                        id: "ecommerce",
                        nodeLabel: "Online shop",
                        title: "Accept payments, get paid easily.",
                        description:
                                "Let customers pay with M-Pesa or bank transfer, then receive your money through the best available method.",
                        bullets: [
                                "One system for all payment types.",
                                "Handle refunds and settlements automatically.",
                                "Smart routing if payments fail.",
                        ],
                        metrics: ["One checkout", "Smart settlement", "Backup routes"],
                        position: { bottom: "126px", right: "12px" },
                },
                {
                        id: "treasury",
                        nodeLabel: "Money management",
                        title: "Stop using spreadsheets for money.",
                        description:
                                "Track your balances, convert at the best rates, choose the best payment routes, and see everything in one place.",
                        bullets: [
                                "Best exchange rate timing.",
                                "Separate money by currency and purpose.",
                                "Alerts when something needs attention.",
                        ],
                        metrics: ["Smart FX", "Balance control", "Full visibility"],
                        position: {
                                bottom: "8px",
                                left: "50%",
                                "--orbit-transform": "translateX(-50%)",
                        },
                },
                {
                        id: "remittance",
                        nodeLabel: "Send money home",
                        title: "Build a money transfer app.",
                        description:
                                "Let people send money to bank accounts, mobile money, or wallets while keeping everything safe and trackable.",
                        bullets: [
                                "Multiple cash-out options.",
                                "Built-in safety checks.",
                                "Real-time status for support.",
                        ],
                        metrics: [
                                "Wallet + bank",
                                "Full tracking",
                                "Built-in compliance",
                        ],
                        position: { bottom: "126px", left: "12px" },
                },
                {
                        id: "supplier",
                        nodeLabel: "Supplier payments",
                        title: "Pay suppliers from one place.",
                        description:
                                "Send money to local suppliers, international vendors, and service providers using one simple system with full records.",
                        bullets: [
                                "Bulk payments with approval.",
                                "Local and international payment options.",
                                "Audit-ready records for your team.",
                        ],
                        metrics: [
                                "Ready workflows",
                                "Local + global",
                                "Full records",
                        ],
                        position: { top: "126px", left: "4px" },
                },
        ],

        flowCards: [
                {
                        tag: "Routing",
                        imageKey: "dashboard",
                        title: "Smart payment routing",
                        text: "Automatic retry, backup routes, and payment confirmation handling.",
                        chips: ["Backup routing", "Event webhooks", "Failure recovery"],
                        href: "#platform",
                        linkIcon: "bi-layers",
                        linkLabel: "See platform layers",
                },
                {
                        tag: "FX Engine",
                        imageKey: "fxCoins",
                        title: "Currency exchange engine",
                        text: "Smart suggestions for best routes, timing, and conversion rates across currencies.",
                        chips: ["Dynamic FX", "Cash positioning", "Anomaly scoring"],
                        href: "#coverage",
                        linkIcon: "bi-globe",
                        linkLabel: "See coverage map",
                },
                {
                        tag: "Telemetry",
                        imageKey: "stockData",
                        title: "Data and tracking",
                        text: "Complete view of safety signals, routing intelligence, payment status, and records.",
                        chips: ["Risk events", "Settlement signals", "Ledger audit trail"],
                        href: "#developers",
                        linkIcon: "bi-braces",
                        linkLabel: "Open API quickstart",
                },
        ],

        steps: [
                {
                        index: "01",
                        title: "Collect",
                        text: "Cards, bank transfers, mobile money, and account payments all flow into one system.",
                },
                {
                        index: "02",
                        title: "Screen",
                        text: "Identity checks, safety rules, and compliance automatically verify payments.",
                },
                {
                        index: "03",
                        title: "Route",
                        text: "Smart system selects the best payment method, timing, and backup options.",
                },
                {
                        index: "04",
                        title: "Settle",
                        text: "Money arrives in wallets, banks, and records with full tracking.",
                },
        ],

        coverage: {
                hubs: [
                        {
                                label: "Core mesh",
                                value: "Africa rails",
                                position: { left: "18%", top: "26%" },
                        },
                        {
                                label: "West",
                                value: "NG · GH · CI · SN",
                                position: { left: "7%", top: "51%" },
                        },
                        {
                                label: "East",
                                value: "KE · UG · TZ · RW",
                                position: { left: "38%", top: "55%" },
                        },
                        {
                                label: "Global",
                                value: "UK · US · EU · UAE",
                                position: { right: "14%", top: "24%" },
                        },
                        {
                                label: "Treasury",
                                value: "USD · EUR · GBP · local",
                                position: { right: "8%", bottom: "34%" },
                        },
                ],
                lines: [
                        {
                                left: "27%",
                                top: "34%",
                                width: "24%",
                                transform: "rotate(-10deg)",
                                animationDelay: "0.2s",
                        },
                        {
                                left: "23%",
                                top: "47%",
                                width: "18%",
                                transform: "rotate(28deg)",
                                animationDelay: "0.8s",
                        },
                        {
                                left: "52%",
                                top: "36%",
                                width: "22%",
                                transform: "rotate(-6deg)",
                                animationDelay: "1.4s",
                        },
                        {
                                left: "54%",
                                top: "56%",
                                width: "23%",
                                transform: "rotate(24deg)",
                                animationDelay: "2s",
                        },
                ],
                filters: [
                        { id: "all", label: "All routes" },
                        { id: "africa", label: "Africa core" },
                        { id: "west", label: "West" },
                        { id: "east", label: "East" },
                        { id: "global", label: "Global" },
                ],
                cards: [
                        {
                                region: "africa",
                                tile: "tileGreen",
                                icon: "bi-wallet2",
                                kicker: "Local payments",
                                title: "M-Pesa, MoMo, and bank transfers",
                                text: "Accept payments through M-Pesa, mobile money, and bank transfers all in one system.",
                        },
                        {
                                region: "global",
                                tile: "tileBlue",
                                icon: "bi-send-check",
                                kicker: "Send worldwide",
                                title: "Global bank and card payments",
                                text: "Send money through international banks and cards with full control and tracking.",
                        },
                        {
                                region: "west",
                                tile: "tilePurple",
                                icon: "bi-broadcast-pin",
                                kicker: "West Africa",
                                title: "Payments for business",
                                text: "Local payment methods for payroll, supplier payments, and business transactions.",
                        },
                        {
                                region: "east",
                                tile: "tileGold",
                                icon: "bi-phone-vibrate",
                                kicker: "East Africa",
                                title: "Mobile money focus",
                                text: "Fast mobile money and bank transfers for payroll, shopping, and sending money home.",
                        },
                ],
                stats: [
                        { value: "25+", label: "countries and payment routes" },
                        { value: "20+", label: "currencies and payment options" },
                        {
                                value: "Multi-rail",
                                label: "bank, wallet, mobile money, and cards",
                        },
                        {
                                value: "24/7",
                                label: "monitoring and support",
                        },
                ],
                markets: [
                        "Nigeria",
                        "Kenya",
                        "Ghana",
                        "Uganda",
                        "Tanzania",
                        "Rwanda",
                        "South Africa",
                        "Côte d’Ivoire",
                        "Senegal",
                        "United Kingdom",
                        "United States",
                        "European Union",
                        "United Arab Emirates",
                ],
        },

        modules: [
                {
                        icon: "bi-arrow-down-up",
                        tile: "tileGreen",
                        title: "Receive payments",
                        text: "Accept bank transfers, mobile money, cards, and account payments through one simple system.",
                        chips: ["Bank transfer", "Mobile money", "Webhooks"],
                },
                {
                        icon: "bi-send",
                        tile: "tileBlue",
                        title: "Send payments",
                        text: "Pay suppliers, salaries, remittances, and settle merchants - single or bulk payments.",
                        chips: ["Bulk pay", "Backup routes", "Status tracking"],
                },
                {
                        icon: "bi-building",
                        tile: "tilePurple",
                        title: "Virtual accounts",
                        text: "Create virtual accounts for customers to collect payments and organize their money.",
                        chips: ["USD / EUR / GBP", "Local currency", "Sub-accounts"],
                },
                {
                        icon: "bi-journal-richtext",
                        tile: "tilePink",
                        title: "Account records",
                        text: "Track all transactions, wallet balances, and maintain clear audit records automatically.",
                        chips: ["Real-time updates", "Audit trail", "Reconciliation"],
                },
                {
                        icon: "bi-credit-card-2-front",
                        tile: "tileGold",
                        title: "Card programs",
                        text: "Issue virtual or physical cards for customers with spending limits and controls.",
                        chips: ["Virtual cards", "Spend rules", "Program controls"],
                },
                {
                        icon: "bi-currency-exchange",
                        tile: "tileGreen",
                        title: "Currency exchange",
                        text: "Convert currencies at the best rates and manage multi-currency balances smartly.",
                        chips: ["Best rates", "Timing", "Balance alerts"],
                },
                {
                        icon: "bi-shield-check",
                        tile: "tileBlue",
                        title: "Safety & compliance",
                        text: "Identity verification, safety checks, monitoring, and required reporting built-in.",
                        chips: ["KYC / KYB", "Safety rules", "Regulatory reports"],
                },
                {
                        icon: "bi-phone",
                        tile: "tilePurple",
                        title: "Custom apps",
                        text: "Build your own branded payment apps for banking, shopping, payroll, and money management.",
                        chips: ["SDK-first", "Brand controls", "Easy setup"],
                },
        ],


        businessSuite: {
                highlights: [
                        {
                                icon: "bi-speedometer2",
                                label: "Health score",
                                value: "82/100",
                                text: "Overall business health based on cash, VAT, sales, growth, and stock.",
                        },
                        {
                                icon: "bi-wallet2",
                                label: "Cash on hand",
                                value: "KES 1.24M",
                                text: "Your money across M-Pesa, banks, wallets, cards, and savings.",
                        },
                        {
                                icon: "bi-bell",
                                label: "Attention hub",
                                value: "5 alerts",
                                text: "Important tasks sorted by urgency - from VAT to unpaid bills.",
                        },
                        {
                                icon: "bi-activity",
                                label: "Modules online",
                                value: "12 healthy",
                                text: "Payments, Cash, Books, Customers, Shop, Marketing, and more in one place.",
                        },
                ],
                modules: [
                        { name: "Get Paid", icon: "bi-receipt", status: "Collections strong", tone: "tileGreen" },
                        { name: "Pay Suppliers", icon: "bi-truck", status: "3 bills due", tone: "tileGold" },
                        { name: "Cash", icon: "bi-bank", status: "Runway 64 days", tone: "tileBlue" },
                        { name: "Books", icon: "bi-journal-check", status: "VAT ready", tone: "tilePurple" },
                        { name: "Customers", icon: "bi-people", status: "4,820 customers", tone: "tilePink" },
                        { name: "Online Shop", icon: "bi-shop", status: "23 live items", tone: "tileGreen" },
                        { name: "Marketing", icon: "bi-megaphone", status: "+18% repeat", tone: "tilePurple" },
                        { name: "Funding", icon: "bi-cash-stack", status: "KES 5M limit", tone: "tileGold" },
                ],
                timeline: [
                        { time: "08:02", title: "M-Pesa payment received", meta: "KES 186,400 added to records", icon: "bi-check2-circle" },
                        { time: "08:21", title: "VAT return done", meta: "eTIMS entries matched automatically", icon: "bi-receipt-cutoff" },
                        { time: "08:43", title: "Supplier payment scheduled", meta: "Kirinyaga Farmers Co-op · KES 48,000", icon: "bi-calendar-check" },
                        { time: "09:10", title: "Customer list updated", meta: "VIP buyers with 3+ purchases", icon: "bi-stars" },
                ],
        },

        operatingConsole: {
                tiles: [
                        {
                                icon: "bi-diagram-3",
                                title: "Smart priorities",
                                text: "Tasks are sorted by what matters most - cash impact, deadlines, and customer needs.",
                                points: ["Urgent/important/sorting", "Money-focused labels", "Handle tasks without switching apps"],
                        },
                        {
                                icon: "bi-graph-up-arrow",
                                title: "Business dashboard",
                                text: "See your revenue, expenses, cash flow, profits, and trends in one clear view.",
                                points: ["7/30/90 day views", "Cash breakdown", "Live system status"],
                        },
                        {
                                icon: "bi-kanban",
                                title: "Complete workflows",
                                text: "Handle everything from invoicing to tax filing, supplier payments, and cash forecasting.",
                                points: ["Quick invoices", "Bulk reminders", "Supplier schedules", "Export records"],
                        },
                ],
                tasks: [
                        { label: "Invoice sent", value: "INV-1104", done: true },
                        { label: "Payment received", value: "M-Pesa Till", done: true },
                        { label: "Records updated", value: "Auto matched", done: true },
                        { label: "VAT checked", value: "eTIMS ready", done: true },
                        { label: "Supplier paid", value: "Scheduled", done: false },
                        { label: "Cash forecast", value: "64 days", done: false },
                ],
        },

        implementationTracks: [
                {
                        week: "Week 1",
                        title: "Connect payments",
                        text: "Set up API keys, connect M-Pesa, banks, and cards, then link all transactions to your records.",
                        chips: ["API keys", "Bank/M-Pesa", "Webhooks", "Record mapping"],
                },
                {
                        week: "Week 2–3",
                        title: "Set up operations",
                        text: "Add customers, products, suppliers, approvals, tax rules, and team access.",
                        chips: ["Roles", "Tax rules", "Approvals", "Product lists"],
                },
                {
                        week: "Week 4–6",
                        title: "Go live",
                        text: "Launch dashboards, automation, reports, alerts, and payment monitoring.",
                        chips: ["Task hub", "Reports", "Alerts", "System health"],
                },
                {
                        week: "Scale",
                        title: "Grow and expand",
                        text: "Add funding, marketing, stock management, multiple branches, and international payments.",
                        chips: ["Funding", "Marketing", "Branches", "Currency exchange"],
                },
        ],

        automationRecipes: [
                {
                        trigger: "Invoice unpaid for 7 days",
                        action: "Send WhatsApp/SMS reminder",
                        outcome: "Get paid faster without chasing people",
                        icon: "bi-bell",
                },
                {
                        trigger: "Cash running low (45 days)",
                        action: "Show funding options and delayable bills",
                        outcome: "Protect salaries and supplier payments",
                        icon: "bi-fuel-pump",
                },
                {
                        trigger: "VAT deadline approaching",
                        action: "Prepare eTIMS tax filing package",
                        outcome: "Avoid late fees and paperwork stress",
                        icon: "bi-file-earmark-check",
                },
                {
                        trigger: "Stock running low",
                        action: "Create order from approved supplier",
                        outcome: "Never miss sales due to no stock",
                        icon: "bi-box-seam",
                },
                {
                        trigger: "Payment route has issues",
                        action: "Switch to backup route and alert team",
                        outcome: "Keep payments working reliably",
                        icon: "bi-signpost-split",
                },
                {
                        trigger: "VIP customer stops buying",
                        action: "Send special offer to bring them back",
                        outcome: "Keep valuable customers with less effort",
                        icon: "bi-stars",
                },
        ],

        platformProof: [
                { label: "Dashboard pages", value: "18+", text: "Complete business management system." },
                { label: "Workflow tools", value: "40+", text: "Actions for invoices, payroll, tax, stock, funding, marketing and data." },
                { label: "Realtime updates", value: "24/7", text: "Activity, alerts, payment quality and business health." },
                { label: "Kenya-first", value: "M-Pesa + eTIMS", text: "Built for Kenya with local payments and tax." },
        ],

        developerPoints: [
                {
                        icon: "bi-clock-history",
                        title: "Quick to start",
                        text: "Simple APIs for accounts, payments, webhooks, balances, cards, safety, and currency exchange.",
                },
                {
                        icon: "bi-box-arrow-in-down",
                        title: "Ready-to-use tools",
                        text: "Download sample code and copy-paste ready URLs directly from the homepage.",
                },
                {
                        icon: "bi-link-45deg",
                        title: "One simple connection",
                        text: "Connect once instead of managing multiple different payment systems.",
                },
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
                {
                        accent: "24/7",
                        rest: "",
                        text: "monitoring, alerts, and support around the clock",
                },
                {
                        accent: "KYC",
                        rest: "/KYB",
                        text: "identity and business verification built into the system",
                },
                {
                        accent: "AML",
                        rest: "",
                        text: "safety screening across all payments and collections",
                },
                {
                        accent: "Audit",
                        rest: "",
                        text: "complete records, tracking, and export-ready reports",
                },
        ],

        trustFaq: [
                {
                        id: "trustOne",
                        title: "African compliance built-in",
                        open: true,
                        body: "Identity checks, safety rules, and reporting requirements for each African country are already included - no need to build them separately for every market.",
                },
                {
                        id: "trustTwo",
                        title: "Real-time tracking and records",
                        body: "Every money movement is tracked instantly, making finance operations faster, controls easier, and partner reporting simpler across all payment programs.",
                },
                {
                        id: "trustThree",
                        title: "Backup payment routes",
                        body: "When one payment method has issues, Paymo automatically switches to backup options to keep your payments working reliably.",
                },
                {
                        id: "trustFour",
                        title: "Ready for businesses of all sizes",
                        body: "From small startups to large companies, the system works for both developers building apps and business teams managing money.",
                },
                {
                        id: "trustFive",
                        title: "Always know what is happening",
                        body: "See payment status, monitoring, transaction updates, and clear backup options whenever there are any issues.",
                },
        ],

        results: [
                {
                        kicker: "Digital banks",
                        end: 90,
                        suffix: " days",
                        text: "Typical time to launch accounts, cards, onboarding, and payments without building everything from scratch.",
                },
                {
                        kicker: "Business money management",
                        end: null,
                        suffix: "1 system",
                        text: "One place for balances, payment quality, safety rules, settlements, and all records.",
                },
                {
                        kicker: "Commerce and payroll",
                        end: null,
                        suffix: "Same-day",
                        text: "Fast local payments and smart currency exchange when routes support it.",
                },
        ],

        faqs: [
                {
                        id: "faqOne",
                        title: "What makes Paymo different from other payment systems?",
                        open: true,
                        body: "Paymo does more than just process payments - it includes accounts, tracking, virtual accounts, smart currency exchange, and built-in safety rules. It is a complete money system, not just a payment gateway.",
                },
                {
                        id: "faqTwo",
                        title: "Can Paymo handle both mobile money and bank payments?",
                        body: "Yes. You can combine M-Pesa, other mobile money, bank transfers, and international payments all in one system - no need for separate tools.",
                },
                {
                        id: "faqThree",
                        title: "Do the buttons and features on this page actually work?",
                        body: "Yes. The buttons open real demos, generate plans, switch code examples, copy code, download files, update exchange rates, filter coverage options, and navigate to different sections.",
                },
                {
                        id: "faqFour",
                        title: "Does this work on mobile phones?",
                        body: "Yes. It is built to work perfectly on mobile with responsive design for all the visuals, metrics, coverage maps, and code sections.",
                },
                {
                        id: "faqFive",
                        title: "Can this design be used on other pages?",
                        body: "Absolutely. The design system can be extended to platform, pricing, coverage, security, developer docs, and solutions pages while keeping the same look and feel.",
                },
        ],

        footerLinks: [
                { href: "#hero", label: "Home" },
                { href: "#platform", label: "Platform" },
                { href: "#use-cases", label: "Solutions" },
                { href: "#coverage", label: "Coverage" },
                { href: "#developers", label: "Developers" },
                { href: "#security", label: "Trust" },
                { href: "#faq", label: "FAQ" },
        ],

        images: {
                heroPhone: heroPhoneImg,
                dashboard: dashboardImg,
                fxCoins: fxCoinsImg,
                network: networkImg,
                stockData: stockDataImg,
                stockCoins: stockCoinsImg,
        },

        capabilityBrief: `PAYMO — HOMEPAGE CAPABILITY BRIEF

Positioning:
Your simple money system for Africa and beyond.

Core promise:
Send, receive, and manage money across Africa and the world with PayMO

Key platform layers:
1. Global payments
2. African local payments
3. Virtual accounts
4. Smart routing
5. Safety & compliance

Design language:
Deep-space emerald, glassmorphism, mint neon edges, 3D renders, animated telemetry.
`,

        postmanStarter: {
                info: {
                        name: "Paymo Starter Collection",
                        schema:
                                "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
                },
                item: [
                        {
                                name: "Create payout",
                                request: {
                                        method: "POST",
                                        header: [
                                                { key: "Authorization", value: "Bearer pk_sandbox_paymo" },
                                                { key: "Content-Type", value: "application/json" },
                                        ],
                                        url: {
                                                raw: "https://sandbox.paymo.africa/v1/payouts",
                                                protocol: "https",
                                                host: ["sandbox", "paymo", "africa"],
                                                path: ["v1", "payouts"],
                                        },
                                        body: {
                                                mode: "raw",
                                                raw: JSON.stringify(
                                                        {
                                                                reference: "sample_payout_001",
                                                                currency: "KES",
                                                                amount: 5000,
                                                                destination: {
                                                                        type: "mobile_money",
                                                                        provider: "mpesa",
                                                                        phone: "+254700000000",
                                                                },
                                                        },
                                                        null,
                                                        2,
                                                ),
                                        },
                                },
                        },
                        {
                                name: "Create virtual account",
                                request: {
                                        method: "POST",
                                        header: [
                                                { key: "Authorization", value: "Bearer pk_sandbox_paymo" },
                                                { key: "Content-Type", value: "application/json" },
                                        ],
                                        url: {
                                                raw: "https://sandbox.paymo.africa/v1/accounts/virtual",
                                                protocol: "https",
                                                host: ["sandbox", "paymo", "africa"],
                                                path: ["v1", "accounts", "virtual"],
                                        },
                                        body: {
                                                mode: "raw",
                                                raw: JSON.stringify(
                                                        {
                                                                customer_id: "cust_001",
                                                                currency: "USD",
                                                                label: "Marketplace collections",
                                                        },
                                                        null,
                                                        2,
                                                ),
                                        },
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
        const response = await fetch("/api/paymo-home", {
                headers: { Accept: "application/json" },
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
const cx = (...parts) => parts.filter(Boolean).join(" ");

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
                .join(" ");
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
                nextPoints.push(
                        Math.max(10, nextPoints[nextPoints.length - 1] + (Math.random() * 8 - 4)),
                );
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
        /* ---------- Static content (TanStack Query stripped for demo) ---------- */
        // In production, swap this for `useQuery({ queryKey: ['paymo-home-content'], ... })`
        // pointing at /api/paymo-home — shape must match `initialMockData`.
        
        const content = initialMockData;
        const { images } = content;

        /* ---------- React state (was vanilla globals / dataset toggles) ---------- */
        const [fxPairs, setFxPairs] = useState(() =>
                structuredClone(initialMockData.fxPairs),
        );
        const [liveCount, setLiveCount] = useState(1284320);
        const [problemMode, setProblemMode] = useState("before");
        const [activeStack, setActiveStack] = useState("global");
        const [activeCase, setActiveCase] = useState("neobank");
        const [activeRegion, setActiveRegion] = useState("all");
        const [activeCode, setActiveCode] = useState("curl");
        const [activeAutomation, setActiveAutomation] = useState(0);
        const [typedCode, setTypedCode] = useState("");
        const [isTyping, setIsTyping] = useState(false);
        const [toasts, setToasts] = useState([]);
        const [planOutput, setPlanOutput] = useState(null); // rendered rollout plan JSX
        const lastPlanTextRef = useRef("Your rollout summary will appear here.");

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

        const activeStackLayer =
                content.stackLayers.find((l) => l.id === activeStack) ??
                content.stackLayers[0];
        const activeUseCase =
                content.useCases.find((c) => c.id === activeCase) ?? content.useCases[0];

        /* ---------- toast helper (replaces DOM appendChild pattern) ---------- */
        const pushToast = useCallback((message, icon = "bi-check2-circle") => {
                const id = Math.random().toString(36).slice(2);
                setToasts((prev) => [...prev, { id, message, icon }]);
                setTimeout(() => {
                        setToasts((prev) => prev.filter((t) => t.id !== id));
                }, 2800);
        }, []);

        /* ---------- clipboard helper (navigator.clipboard + legacy fallback) ---------- */
        const copyText = useCallback(
                async (text, targetButton, successLabel = "Copied") => {
                        const done = () => {
                                if (targetButton && successLabel) {
                                        const original = targetButton.innerHTML;
                                        targetButton.innerHTML = successLabel;
                                        setTimeout(() => {
                                                targetButton.innerHTML = original;
                                        }, 1400);
                                }
                                pushToast("Copied to clipboard", "bi-clipboard2-check");
                        };
                        try {
                                if (navigator.clipboard && window.isSecureContext) {
                                        await navigator.clipboard.writeText(text);
                                        done();
                                        return;
                                }
                                // LEGACY BRIDGE: execCommand fallback textarea (from the vanilla page).
                                const helper = document.createElement("textarea");
                                helper.value = text;
                                helper.setAttribute("readonly", "");
                                helper.style.position = "absolute";
                                helper.style.left = "-9999px";
                                document.body.appendChild(helper);
                                helper.select();
                                document.execCommand("copy");
                                helper.remove();
                                done();
                        } catch {
                                pushToast(
                                        "Copy failed — select the text manually",
                                        "bi-exclamation-triangle",
                                );
                        }
                },
                [pushToast],
        );

        /* ---------- download helper (Blob + anchor click, unchanged from legacy) ---------- */
        const downloadFile = useCallback(
                (filename, fileContent, mime) => {
                        const blob = new Blob([fileContent], { type: mime });
                        const url = URL.createObjectURL(blob);
                        const anchor = document.createElement("a");
                        anchor.href = url;
                        anchor.download = filename;
                        document.body.appendChild(anchor);
                        anchor.click();
                        anchor.remove();
                        URL.revokeObjectURL(url);
                        pushToast(`Downloaded ${filename}`, "bi-download");
                },
                [pushToast],
        );

        /* ---------- treasury plan generator ---------- */
        const generatePlan = useCallback(() => {
                const useCase = planUseCaseRef.current?.value ?? "Neobank launch";
                const markets = planMarketsRef.current?.value ?? "2";
                const settlement = planSettlementRef.current?.value ?? "local payout speed";
                const delivery = planDeliveryRef.current?.value ?? "API-first integration";

                const phases = [
                        {
                                icon: "bi-1-circle",
                                text: "Phase 1: activate collections, payout routes, ledgering, and compliance policies in the first core markets.",
                        },
                        {
                                icon: "bi-2-circle",
                                text: "Phase 2: enable treasury balancing, FX routing, and route fallback logic as transaction volume grows.",
                        },
                        {
                                icon: "bi-3-circle",
                                text: "Phase 3: expand into branded account experiences, card issuance, or deeper white-label rollout where relevant.",
                        },
                ];

                setPlanOutput(
                        <>
                                <small
                                        className={cx(s.textMint, "d-block text-uppercase mb-2")}
                                        style={{ letterSpacing: "0.16em" }}
                                >
                                        Generated rollout summary
                                </small>
                                <h3 className={cx(s.heading, "fs-4 mb-3")}>
                                        {useCase} across {markets}
                                </h3>
                                <p className={cx(s.textMutedPaymo, "mb-3")}>
                                        Recommended model: <strong className="text-white">{delivery}</strong>.
                                        Prioritize <strong className="text-white">{settlement}</strong> as the
                                        lead success metric while launching Paymo through a staged regional
                                        rollout.
                                </p>
                                <ul className={cx(s.bulletList, "mb-0")}>
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

                pushToast("Treasury plan generated", "bi-diagram-2");
                lastPlanTextRef.current = `Paymo rollout summary\n\nUse case: ${useCase}\nMarkets: ${markets}\nPriority: ${settlement}\nDelivery: ${delivery}\n\nRecommended sequence:\n1. Launch core rails, compliance, and ledgering.\n2. Add treasury balancing and FX-aware routing.\n3. Expand into branded accounts, cards, or white-label products as needed.`;
        }, [pushToast]);

        /* ==========================================================================
         * LEGACY BRIDGE #1 — mount block. All ambient/window-level vanilla effects
         * from the original DOMContentLoaded handler live here with cleanups.
         * ======================================================================= */
        useEffect(() => {
                const timers = [];

                /* inject Google Fonts once (legacy <link> tags) */
                ["https://fonts.googleapis.com", "https://fonts.gstatic.com"].forEach(
                        (href, i) => {
                                if (!document.querySelector(`link[href="${href}"]`)) {
                                        const link = document.createElement("link");
                                        link.rel = i === 1 ? "preconnect" : "preconnect";
                                        link.href = href;
                                        if (i === 1) link.crossOrigin = "anonymous";
                                        document.head.appendChild(link);
                                }
                        },
                );
                if (!document.querySelector("link[data-paymo-fonts]")) {
                        const font = document.createElement("link");
                        font.rel = "stylesheet";
                        font.dataset.paymoFonts = "true";
                        font.href =
                                "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";
                        document.head.appendChild(font);
                }

                /* LEGACY BRIDGE: canvas particle network (initParticles). */
                const canvas = canvasRef.current;
                let rafId = 0;
                if (
                        canvas &&
                        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ) {
                        const ctx = canvas.getContext("2d");
                        let W = 0;
                        let H = 0;
                        const resize = () => {
                                W = canvas.width = window.innerWidth;
                                H = canvas.height = window.innerHeight;
                        };
                        resize();
                        window.addEventListener("resize", resize);
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
                                        ctx.fillStyle = "rgba(46, 230, 160, 0.5)";
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
                        intervalRefs.current.push({ type: "resize", el: window, fn: resize });
                }

                /* LEGACY BRIDGE: scroll progress bar. */
                const onScroll = () => {
                        const h = document.documentElement;
                        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
                        if (progressRef.current) progressRef.current.style.width = `${pct}%`;
                };
                window.addEventListener("scroll", onScroll, { passive: true });
                intervalRefs.current.push({ type: "scroll", el: window, fn: onScroll });

                /* LEGACY BRIDGE: hero 3D parallax on the visual stage. */
                const stage = visualStageRef.current;
                const visual = heroVisualRef.current;
                let heroMove;
                let heroLeave;
                if (stage && visual && window.matchMedia("(pointer: fine)").matches) {
                        heroMove = (e) => {
                                const r = visual.getBoundingClientRect();
                                const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
                                const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
                                stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
                        };
                        heroLeave = () => {
                                stage.style.transform = "";
                        };
                        visual.addEventListener("mousemove", heroMove);
                        visual.addEventListener("mouseleave", heroLeave);
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
                rootRef.current
                        ?.querySelectorAll(`.${s.reveal}`)
                        .forEach((el) => revealObserver.observe(el));

                /* LEGACY BRIDGE: count-up numbers via IntersectionObserver + RAF. */
                const counters = Array.from(
                        rootRef.current?.querySelectorAll("[data-count]") ?? [],
                );
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
                                                const eased = 1 - (1 - p) ** 3;
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
                if (window.matchMedia("(pointer: fine)").matches) {
                        rootRef.current?.querySelectorAll("[data-tilt]").forEach((card) => {
                                const move = (e) => {
                                        const r = card.getBoundingClientRect();
                                        const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
                                        const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
                                        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
                                };
                                const leave = () => {
                                        card.style.transform = "";
                                };
                                card.addEventListener("mousemove", move);
                                card.addEventListener("mouseleave", leave);
                                tiltCleanups.push(() => {
                                        card.removeEventListener("mousemove", move);
                                        card.removeEventListener("mouseleave", leave);
                                });
                        });
                }

                /* LEGACY BRIDGE: FX drift + live counters on intervals. */
                timers.push(
                        setInterval(() => setFxPairs((prev) => driftFxPairs(prev)), 3600),
                );
                timers.push(
                        setInterval(() => {
                                setLiveCount((c) => c + Math.floor(Math.random() * 9) + 3);
                        }, 1500),
                );

                /* cleanup — mirrors removing every listener the legacy page leaked */
                return () => {
                        cancelAnimationFrame(rafId);
                        timers.forEach(clearInterval);
                        intervalRefs.current.forEach(({ type, el, fn }) =>
                                el.removeEventListener(type, fn),
                        );
                        intervalRefs.current = [];
                        if (visual && heroMove) visual.removeEventListener("mousemove", heroMove);
                        if (visual && heroLeave)
                                visual.removeEventListener("mouseleave", heroLeave);
                        revealObserver.disconnect();
                        counterObserver.disconnect();
                        tiltCleanups.forEach((fn) => fn());
                };
        }, []);

        /* LEGACY BRIDGE: typewriter effect for code samples (was RAF + insertAdjacentHTML). */
        useEffect(() => {
                const target = content.codeSamples[activeCode] ?? "";
                let i = 0;
                let raf = 0;
                setIsTyping(true);
                setTypedCode("");
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

                        <main>
                                {/* ================= HERO ================= */}
                                <section id="hero" className={s.heroSection}>
                                        <div className="container">
                                                <div className={cx(s.heroBadge, s.reveal)}>
                                                        <span className={s.dot} />
                                                        <span>
                                                                <strong>{content.hero.badgeStrong}</strong>{" "}
                                                                {content.hero.badgeRest}
                                                        </span>
                                                </div>
                                                <div className="row align-items-center g-5">
                                                        <div className="col-lg-6">
                                                                <div className={s.reveal}>
                                                                        <h1
                                                                                className={cx(s.heroTitle, s.headlineGradient, s.heading)}
                                                                        >
                                                                                {content.hero.titleStart}
                                                                                <span className={s.mintStroke}>
                                                                                        {content.hero.titleAccent}
                                                                                </span>
                                                                        </h1>
                                                                        <p className={cx(s.heroCopy, "mb-0")}>{content.hero.copy}</p>
                                                                        <div className={s.heroCta}>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymo,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
                                                                                        data-bs-toggle="offcanvas"
                                                                                        data-bs-target="#sandboxPanel"
                                                                                        type="button"
                                                                                >
                                                                                        <i className="bi bi-code-slash" />
                                                                                        Start Free Trial
                                                                                </button>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
                                                                                        data-bs-toggle="modal"
                                                                                        data-bs-target="#treasuryModal"
                                                                                        type="button"
                                                                                >
                                                                                        <i className="bi bi-briefcase" />
                                                                                        Talk to Sales
                                                                                </button>
                                                                                <a
                                                                                        href="#coverage"
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
                                                                                >
                                                                                        <i className="bi bi-globe2" />
                                                                                        See Where We Work
                                                                                </a>
                                                                        </div>
                                                                        <div className={s.trustBand}>
                                                                                {content.hero.trustPills.map((pill) => (
                                                                                        <span className={s.trustPill} key={pill.label}>
                                                                                                <i className={`bi ${pill.icon}`} />
                                                                                                <span>
                                                                                                        <strong>{pill.value}</strong> {pill.label}
                                                                                                </span>
                                                                                        </span>
                                                                                ))}
                                                                                <span className={s.trustPill}>
                                                                                        <i className="bi bi-activity" />
                                                                                        <span>
                                                                                                <strong>{liveCount.toLocaleString()}</strong> routed
                                                                                                transactions
                                                                                        </span>
                                                                                </span>
                                                                        </div>
                                                                </div>

                                                                {/* FX ticker — legacy renderFx() innerHTML replaced with state map */}
                                                                <div className={cx(s.fxGrid, s.reveal)}>
                                                                        {fxPairs.map((item, index) => (
                                                                                <div className={cx(s.glassCard, s.fxCard)} key={item.pair}>
                                                                                        <div className={s.fxLabel}>{item.pair}</div>
                                                                                        <div className={s.fxValue}>{item.value.toFixed(2)}</div>
                                                                                        <div
                                                                                                className={cx(
                                                                                                        s.fxDelta,
                                                                                                        item.delta >= 0 ? s.up : s.down,
                                                                                                )}
                                                                                        >
                                                                                                {item.delta >= 0 ? "↗" : "↘"}{" "}
                                                                                                {Math.abs(item.delta).toFixed(2)}%
                                                                                        </div>
                                                                                        {/* Safe: markup built locally from numeric data (legacy innerHTML equivalent) */}
                                                                                        <span
                                                                                                dangerouslySetInnerHTML={{
                                                                                                        __html: buildSparklineSvg(item.points, index),
                                                                                                }}
                                                                                        />
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
                                                                                        <img
                                                                                                src={images.heroPhone}
                                                                                                alt="Paymo mobile app 3D render with glowing payment notification"
                                                                                                loading="eager"
                                                                                        />
                                                                                </div>
                                                                                <div className={cx(s.visualFrame, s.visualLeft)}>
                                                                                        <img
                                                                                                src={images.dashboard}
                                                                                                alt="3D glass financial dashboard render"
                                                                                                loading="lazy"
                                                                                        />
                                                                                </div>
                                                                                <div className={cx(s.visualFrame, s.visualRight)}>
                                                                                        <img
                                                                                                src={images.fxCoins}
                                                                                                alt="3D floating coin and FX render"
                                                                                                loading="lazy"
                                                                                        />
                                                                                </div>
                                                                                {content.hero.visualBadges.map((badge) => (
                                                                                        <div
                                                                                                className={cx(s.visualBadge, s[badge.key])}
                                                                                                key={badge.key}
                                                                                        >
                                                                                                <strong>
                                                                                                        <span className={s.led} />
                                                                                                        {badge.label}
                                                                                                </strong>
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
                                                                <div
                                                                        className={cx(s.glassCard, s.metricCard)}
                                                                        key={metric.label}
                                                                >
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
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <span className={s.sectionKicker}>The Problem</span>
                                                                <h2 className={cx(s.heading, "mb-3")}>
                                                                        Managing money shouldn't be this complicated.
                                                                </h2>
                                                                <p className={cx(s.textMutedPaymo, "mb-4")}>
                                                                        Most people use multiple apps, manual spreadsheets, and different services just to send and receive money. Paymo puts everything in one simple place.
                                                                </p>
                                                                <div className="d-flex flex-wrap gap-2 mb-4">
                                                                        <button
                                                                                className={cx(
                                                                                        s.btnChip,
                                                                                        "btn",
                                                                                        problemMode === "before" && s.active,
                                                                                )}
                                                                                type="button"
                                                                                onClick={() => setProblemMode("before")}
                                                                        >
                                                                                Without Paymo
                                                                        </button>
                                                                        <button
                                                                                className={cx(
                                                                                        s.btnChip,
                                                                                        "btn",
                                                                                        problemMode === "after" && s.active,
                                                                                )}
                                                                                type="button"
                                                                                onClick={() => setProblemMode("after")}
                                                                        >
                                                                                With Paymo
                                                                        </button>
                                                                </div>
                                                                <ul className={s.bulletList}>
                                                                        {content.problem.tensionPoints.map((point) => (
                                                                                <li key={point.icon}>
                                                                                        <span className={s.iconBadge}>
                                                                                                <i className={`bi ${point.icon}`} />
                                                                                        </span>
                                                                                        <span>{point.text}</span>
                                                                                </li>
                                                                        ))}
                                                                </ul>
                                                        </div>
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                <div className={cx(s.glassCard, s.compareBoard)}>
                                                                        {["before", "after"].map((mode) => {
                                                                                const modeData = content.problem[mode];
                                                                                return (
                                                                                        <div
                                                                                                className={cx(
                                                                                                        s.compareMode,
                                                                                                        problemMode === mode && s.active,
                                                                                                )}
                                                                                                key={mode}
                                                                                        >
                                                                                                <div className="row g-4 align-items-center">
                                                                                                        <div className="col-md-6">
                                                                                                                <h3 className={cx(s.heading, "mb-3")}>
                                                                                                                        {modeData.title}
                                                                                                                </h3>
                                                                                                                <ul className={s.compareList}>
                                                                                                                        {modeData.points.map((point) => (
                                                                                                                                <li key={point.icon}>
                                                                                                                                        <span className={s.iconBadge}>
                                                                                                                                                <i className={`bi ${point.icon}`} />
                                                                                                                                        </span>
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
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <span className={s.sectionKicker}>Unified Platform Stack</span>
                                                                <h2 className={cx(s.heading, "mb-3")}>
                                                                        Five layers. One simple money system.
                                                                </h2>
                                                                <p className={cx(s.textMutedPaymo, "mb-4")}>
                                                                        Global payments, local African methods, virtual accounts, smart routing, and safety. Click each layer to see how it works.
                                                                </p>
                                                                <div className={cx(s.glassCard, s.stackDetail)}>
                                                                        <small
                                                                                className={cx(s.textMint, "d-block text-uppercase mb-2")}
                                                                                style={{ letterSpacing: "0.18em" }}
                                                                        >
                                                                                Selected layer
                                                                        </small>
                                                                        <h3 className={cx(s.heading, "mb-2")}>
                                                                                {activeStackLayer.title}
                                                                        </h3>
                                                                        <p className={cx(s.textMutedPaymo, "mb-3")}>
                                                                                {activeStackLayer.text}
                                                                        </p>
                                                                        <div className={s.chipRow}>
                                                                                {activeStackLayer.chips.map((chip) => (
                                                                                        <span className={s.dataChip} key={chip}>
                                                                                                {chip}
                                                                                        </span>
                                                                                ))}
                                                                        </div>
                                                                        <div className="mt-4 d-flex flex-wrap gap-2">
                                                                                <a
                                                                                        href="#modules"
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
                                                                                >
                                                                                        <i className="bi bi-grid" />
                                                                                        Explore each layer
                                                                                </a>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymo,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                                downloadFile(
                                                                                                        "paymo-capability-brief.txt",
                                                                                                        content.capabilityBrief,
                                                                                                        "text/plain",
                                                                                                )
                                                                                        }
                                                                                >
                                                                                        <i className="bi bi-download" />
                                                                                        Capability brief
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                <div className="row g-4 h-100">
                                                                        <div className="col-lg-6">
                                                                                <div
                                                                                        className={cx(
                                                                                                s.glassCard,
                                                                                                s.stackShell,
                                                                                                "h-100 d-grid gap-3",
                                                                                        )}
                                                                                >
                                                                                        {content.stackLayers.map((layer) => (
                                                                                                <button
                                                                                                        type="button"
                                                                                                        className={cx(
                                                                                                                s.stackLayer,
                                                                                                                activeStack === layer.id && s.active,
                                                                                                        )}
                                                                                                        key={layer.id}
                                                                                                        onClick={() => setActiveStack(layer.id)}
                                                                                                >
                                                                                                        <small>{layer.order}</small>
                                                                                                        <div className={cx(s.heading, "fs-5")}>
                                                                                                                {layer.title}
                                                                                                        </div>
                                                                                                        <div className={cx(s.textMutedPaymo, "small mt-1")}>
                                                                                                                {layer.blurb}
                                                                                                        </div>
                                                                                                </button>
                                                                                        ))}
                                                                                </div>
                                                                        </div>
                                                                        <div className="col-lg-6">
                                                                                <div className={cx(s.glassCard, s.mediaFrame, "h-100")}>
                                                                                        <img
                                                                                                src={images.network}
                                                                                                alt="3D emerald network globe showing financial routing"
                                                                                                loading="lazy"
                                                                                        />
                                                                                        <span className={s.scanline} />
                                                                                        <div className={s.overlayMetrics}>
                                                                                                <div className={cx(s.glassCard, s.metricCard)}>
                                                                                                        <div className={s.metricNumber}>1.8s</div>
                                                                                                        <div className={s.metricLabel}>
                                                                                                                average orchestration decision window
                                                                                                        </div>
                                                                                                </div>
                                                                                                <div className={cx(s.glassCard, s.metricCard)}>
                                                                                                        <div className={s.metricNumber}>99.97%</div>
                                                                                                        <div className={s.metricLabel}>
                                                                                                                uptime target for mission-critical flows
                                                                                                        </div>
                                                                                                </div>
                                                                                                <div className={cx(s.glassCard, s.metricCard)}>
                                                                                                        <div className={s.metricNumber}>360°</div>
                                                                                                        <div className={s.metricLabel}>
                                                                                                                traceability across identity, money movement, ledger
                                                                                                                events
                                                                                                        </div>
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
                                                        <div className={cx("col-lg-6", s.reveal)}>
                                                                <span className={s.sectionKicker}>Use Case Constellation</span>
                                                                <div className={s.orbitShell}>
                                                                        <div className={s.orbitPath} />
                                                                        <div className={cx(s.orbitPath, s.inner)} />
                                                                        <div className={s.orbitCenter}>
                                                                                <span className={s.brandMark}>P</span>
                                                                                <h3 className={cx(s.heading, "mb-1 fs-5")}>PayMO </h3>
                                                                                
                                                                        </div>
                                                                        {content.useCases.map((item) => (
                                                                                <button
                                                                                        type="button"
                                                                                        className={cx(
                                                                                                s.orbitNode,
                                                                                                activeCase === item.id && s.active,
                                                                                        )}
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
                                                        <div className={cx("col-lg-6", s.reveal)}>
                                                                <div
                                                                        className={cx(s.glassCard, s.casePanel, "h-100")}
                                                                        key={activeCase}
                                                                >
                                                                        <span className={s.sectionKicker}>
                                                                                Interactive Case Detail
                                                                        </span>
                                                                        <h3 className={cx(s.heading, "mb-3")}>
                                                                                {activeUseCase.title}
                                                                        </h3>
                                                                        <p className={s.textMutedPaymo}>
                                                                                {activeUseCase.description}
                                                                        </p>
                                                                        <ul className={cx(s.bulletList, "mt-4 mb-0")}>
                                                                                {activeUseCase.bullets.map((bullet) => (
                                                                                        <li key={bullet}>
                                                                                                <span className={s.iconBadge}>
                                                                                                        <i className="bi bi-check2" />
                                                                                                </span>
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
                                                                                <a
                                                                                        href="#developers"
                                                                                        className={cx(
                                                                                                s.btnPaymo,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
                                                                                >
                                                                                        <i className="bi bi-terminal" />
                                                                                        See developer flow
                                                                                </a>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center gap-2",
                                                                                        )}
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
                                                <div className={cx("text-center mb-5", s.reveal)}>
                                                        <span className={s.sectionKicker}>Smart Payment System</span>
                                                        <h2 className={cx(s.heading, "mb-3")}>
                                                                See how payments move in real-time.
                                                        </h2>
                                                        <p
                                                                className={cx(s.textMutedPaymo, "mx-auto")}
                                                                style={{ maxWidth: "840px" }}
                                                        >
                                                                Watch the complete payment journey - from routing to settlement - with live visuals and clear tracking.
                                                        </p>
                                                </div>
                                                <div className="row g-4">
                                                        {content.flowCards.map((card, idx) => (
                                                                <div className={cx("col-lg-4", s.reveal)} key={card.title}>
                                                                        <div
                                                                                className={cx(s.glassCard, s.flowCard, s.tilt)}
                                                                                data-tilt
                                                                        >
                                                                                <div className={s.thumb}>
                                                                                        <span className={s.thumbTag}>{card.tag}</span>
                                                                                        <img
                                                                                                src={assetForImageKey(card.imageKey)}
                                                                                                alt={`${card.tag} 3D render`}
                                                                                                loading="lazy"
                                                                                        />
                                                                                </div>
                                                                                <div className={s.content}>
                                                                                        <h3 className={cx(s.heading, "fs-4")}>{card.title}</h3>
                                                                                        <p className={s.textMutedPaymo}>{card.text}</p>
                                                                                        <div className={cx(s.chipRow, "mb-4")}>
                                                                                                {card.chips.map((chip) => (
                                                                                                        <span className={s.dataChip} key={chip}>
                                                                                                                {chip}
                                                                                                        </span>
                                                                                                ))}
                                                                                        </div>
                                                                                        <a
                                                                                                href={card.href}
                                                                                                className={cx(
                                                                                                        s.btnPaymoOutline,
                                                                                                        "btn w-100 d-inline-flex align-items-center justify-content-center gap-2",
                                                                                                )}
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
                                                                        <h3 className={cx(s.heading, "fs-5")}>{step.title}</h3>
                                                                        <p className={cx(s.textMutedPaymo, "mb-0")}>{step.text}</p>
                                                                        {i < content.steps.length - 1 && (
                                                                                <i
                                                                                        className={cx(
                                                                                                "bi bi-arrow-right d-none d-xl-block",
                                                                                                s.connector,
                                                                                        )}
                                                                                />
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
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                <span className={s.sectionKicker}>Live Network Coverage</span>
                                                                <div className={cx(s.glassCard, s.networkShell)}>
                                                                        <img
                                                                                src={images.network}
                                                                                className={s.networkGlobalImg}
                                                                                alt=""
                                                                                aria-hidden="true"
                                                                        />
                                                                        {content.coverage.hubs.map((hub) => (
                                                                                <div
                                                                                        className={s.hubNode}
                                                                                        style={hub.position}
                                                                                        key={hub.label}
                                                                                >
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
                                                                        <div
                                                                                className="row g-3 position-relative"
                                                                                style={{ zIndex: 3, marginTop: "238px" }}
                                                                        >
                                                                                {content.coverage.cards.map((card) => (
                                                                                        <div className="col-md-6" key={card.region}>
                                                                                                <div
                                                                                                        className={cx(
                                                                                                                s.glassCard,
                                                                                                                s.coverageCard,
                                                                                                                activeRegion !== "all" &&
                                                                                                                        activeRegion !== card.region &&
                                                                                                                        s.hiddenRegion,
                                                                                                        )}
                                                                                                >
                                                                                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                                                                                                <div>
                                                                                                                        <small
                                                                                                                                className={cx(
                                                                                                                                        s.textMint,
                                                                                                                                        "text-uppercase d-block mb-2",
                                                                                                                                )}
                                                                                                                                style={{ letterSpacing: "0.16em" }}
                                                                                                                        >
                                                                                                                                {card.kicker}
                                                                                                                        </small>
                                                                                                                        <h3 className={cx(s.heading, "fs-4 mb-2")}>
                                                                                                                                {card.title}
                                                                                                                        </h3>
                                                                                                                </div>
                                                                                                                <span className={cx(s.tile, s[card.tile], "fs-4")}>
                                                                                                                        <i className={`bi ${card.icon}`} />
                                                                                                                </span>
                                                                                                        </div>
                                                                                                        <p className={cx(s.textMutedPaymo, "mb-0")}>
                                                                                                                {card.text}
                                                                                                        </p>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <div className={cx(s.glassCard, "p-4 h-100")}>
                                                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                                                                {content.coverage.filters.map((filter) => (
                                                                                        <button
                                                                                                type="button"
                                                                                                className={cx(
                                                                                                        s.btnChip,
                                                                                                        "btn",
                                                                                                        activeRegion === filter.id && s.active,
                                                                                                )}
                                                                                                key={filter.id}
                                                                                                onClick={() => setActiveRegion(filter.id)}
                                                                                        >
                                                                                                {filter.label}
                                                                                        </button>
                                                                                ))}
                                                                        </div>
                                                                        <h3 className={cx(s.heading, "mb-3")}>
                                                                                Coverage intelligence snapshot
                                                                        </h3>
                                                                        <p className={s.textMutedPaymo}>
                                                                                Explore the operating footprint through concise route
                                                                                clusters rather than a static map. The cards on the left
                                                                                respond to the route filter above.
                                                                        </p>
                                                                        <div className={cx(s.miniStatGrid, "mb-3")}>
                                                                                {content.coverage.stats.map((stat) => (
                                                                                        <div className={s.miniStat} key={stat.value}>
                                                                                                <strong>{stat.value}</strong>
                                                                                                <span>{stat.label}</span>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                        <div className={s.coverageChipGrid}>
                                                                                {content.coverage.markets.map((market) => (
                                                                                        <span className={s.dataChip} key={market}>
                                                                                                {market}
                                                                                        </span>
                                                                                ))}
                                                                        </div>
                                                                        <div className="mt-4 d-grid gap-2">
                                                                                <a
                                                                                        href="#modules"
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center justify-content-center gap-2",
                                                                                        )}
                                                                                >
                                                                                        <i className="bi bi-grid-1x2" />
                                                                                        View product modules
                                                                                </a>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymo,
                                                                                                "btn d-inline-flex align-items-center justify-content-center gap-2",
                                                                                        )}
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
                                                <div className={cx("text-center mb-5", s.reveal)}>
                                                        <span className={s.sectionKicker}>
                                                                Complete Payment Features
                                                        </span>
                                                        <h2 className={cx(s.heading, "mb-3")}>
                                                                Everything you need in one place.
                                                        </h2>
                                                        <p
                                                                className={cx(s.textMutedPaymo, "mx-auto")}
                                                                style={{ maxWidth: "820px" }}
                                                        >
                                                                Every payment feature clearly explained so you can see exactly what we offer.
                                                        </p>
                                                </div>
                                                <div className="row g-4">
                                                        {content.modules.map((mod) => (
                                                                <div
                                                                        className={cx("col-md-6 col-xl-3", s.reveal)}
                                                                        key={mod.title}
                                                                >
                                                                        <div
                                                                                className={cx(s.glassCard, s.moduleCard, s.tilt)}
                                                                                data-tilt
                                                                        >
                                                                                <span className={cx(s.moduleIcon, s.tile, s[mod.tile])}>
                                                                                        <i className={`bi ${mod.icon}`} />
                                                                                </span>
                                                                                <h3 className={cx(s.heading, "fs-4")}>{mod.title}</h3>
                                                                                <p className={s.textMutedPaymo}>{mod.text}</p>
                                                                                <div className={s.chipRow}>
                                                                                        {mod.chips.map((chip) => (
                                                                                                <span className={s.dataChip} key={chip}>
                                                                                                        {chip}
                                                                                                </span>
                                                                                        ))}
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </section>


                                {/* ================= BUSINESS DASHBOARD ================= */}
                                <section id="business-dashboard" className={s.sectionPad}>
                                        <div className="container">
                                                <div className="row g-4 align-items-stretch">
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <span className={s.sectionKicker}>PayMo Business Dashboard</span>
                                                                <h2 className={cx(s.heading, "mb-3")}>
                                                                        Your complete business command center.
                                                                </h2>
                                                                <p className={s.textMutedPaymo}>
                                                                        See your cash flow, priorities, performance, business health, activity, and system status - all in one powerful dashboard.
                                                                </p>
                                                                <div className={s.dashboardHeroStack}>
                                                                        {content.businessSuite.highlights.map((item) => (
                                                                                <div className={cx(s.glassCard, s.dashboardBrief)} key={item.label}>
                                                                                        <span className={s.iconBadge}>
                                                                                                <i className={`bi ${item.icon}`} />
                                                                                        </span>
                                                                                        <div>
                                                                                                <small>{item.label}</small>
                                                                                                <strong>{item.value}</strong>
                                                                                                <span>{item.text}</span>
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                <div className={cx(s.glassCard, s.commandBoard)} data-tilt>
                                                                        <div className={s.commandTopbar}>
                                                                                <div>
                                                                                        <span className={s.sectionKicker}>Live briefing</span>
                                                                                        <h3 className={cx(s.heading, "mb-1")}>Good morning, Wanjiku 👋</h3>
                                                                                        <p className={cx(s.textMutedPaymo, "mb-0")}>
                                                                                                5 things need you today — and the business is trending up.
                                                                                        </p>
                                                                                </div>
                                                                                <div className={s.healthDial}>
                                                                                        <svg viewBox="0 0 120 70" aria-hidden="true">
                                                                                                <defs>
                                                                                                        <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="0">
                                                                                                                <stop offset="0%" stopColor="#2ee6a0" />
                                                                                                                <stop offset="100%" stopColor="#7cf5c8" />
                                                                                                        </linearGradient>
                                                                                                </defs>
                                                                                                <path d="M 18 60 A 42 42 0 0 1 102 60" />
                                                                                                <path d="M 18 60 A 42 42 0 0 1 102 60" className={s.healthArc} />
                                                                                        </svg>
                                                                                        <strong>82</strong>
                                                                                        <span>health</span>
                                                                                </div>
                                                                        </div>
                                                                        <div className={s.commandKpis}>
                                                                                <div className={cx(s.commandKpi, s.primary)}>
                                                                                        <small>Cash on hand</small>
                                                                                        <strong>KES 1.245M</strong>
                                                                                        <span>+12% vs last month</span>
                                                                                </div>
                                                                                <div className={s.commandKpi}>
                                                                                        <small>Collected</small>
                                                                                        <strong>KES 385K</strong>
                                                                                        <span>Friday peak hour · 17:00</span>
                                                                                </div>
                                                                                <div className={s.commandKpi}>
                                                                                        <small>Net position</small>
                                                                                        <strong>KES 685K</strong>
                                                                                        <span>Receivables less payables</span>
                                                                                </div>
                                                                        </div>
                                                                        <div className="row g-3 mt-1">
                                                                                <div className="col-md-6">
                                                                                        <div className={s.moduleGridCompact}>
                                                                                                {content.businessSuite.modules.map((mod) => (
                                                                                                        <div className={s.modulePill} key={mod.name}>
                                                                                                                <span className={cx(s.tile, s[mod.tone])}>
                                                                                                                        <i className={`bi ${mod.icon}`} />
                                                                                                                </span>
                                                                                                                <div>
                                                                                                                        <strong>{mod.name}</strong>
                                                                                                                        <small>{mod.status}</small>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                ))}
                                                                                        </div>
                                                                                </div>
                                                                                <div className="col-md-6">
                                                                                        <div className={s.activityTimeline}>
                                                                                                {content.businessSuite.timeline.map((event) => (
                                                                                                        <div className={s.activityEvent} key={event.title}>
                                                                                                                <span>{event.time}</span>
                                                                                                                <i className={`bi ${event.icon}`} />
                                                                                                                <div>
                                                                                                                        <strong>{event.title}</strong>
                                                                                                                        <small>{event.meta}</small>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                ))}
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </section>

                                {/* ================= OPERATING CONSOLE ================= */}
                                <section id="operating-console" className={s.sectionPad}>
                                        <div className="container">
                                                <div className={cx("text-center mb-5", s.reveal)}>
                                                        <span className={s.sectionKicker}>Business Dashboard</span>
                                                        <h2 className={cx(s.heading, "mb-3")}>
                                                                See your complete business in action.
                                                        </h2>
                                                        <p className={cx(s.textMutedPaymo, "mx-auto")} style={{ maxWidth: "860px" }}>
                                                                After signing in, manage decisions, execute payments, reconcile accounts, and optimize your business - all from one clear dashboard.
                                                        </p>
                                                </div>
                                                <div className="row g-4">
                                                        {content.operatingConsole.tiles.map((tile) => (
                                                                <div className={cx("col-lg-4", s.reveal)} key={tile.title}>
                                                                        <div className={cx(s.glassCard, s.consoleCard, s.tilt)} data-tilt>
                                                                                <span className={s.consoleIcon}>
                                                                                        <i className={`bi ${tile.icon}`} />
                                                                                </span>
                                                                                <h3 className={cx(s.heading, "fs-4")}>{tile.title}</h3>
                                                                                <p className={s.textMutedPaymo}>{tile.text}</p>
                                                                                <ul className={s.consoleList}>
                                                                                        {tile.points.map((point) => (
                                                                                                <li key={point}>
                                                                                                        <i className="bi bi-check2-circle" />
                                                                                                        {point}
                                                                                                </li>
                                                                                        ))}
                                                                                </ul>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>
                                                <div className={cx(s.glassCard, s.workflowStrip, s.reveal)}>
                                                        {content.operatingConsole.tasks.map((task, index) => (
                                                                <div className={cx(s.workflowNode, task.done && s.done)} key={task.label}>
                                                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                                                        <strong>{task.label}</strong>
                                                                        <small>{task.value}</small>
                                                                        {index < content.operatingConsole.tasks.length - 1 && <i className={cx("bi bi-arrow-right", s.workflowArrow)} />}
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </section>

                                {/* ================= IMPLEMENTATION ================= */}
                                <section id="implementation" className={s.sectionPad}>
                                        <div className="container">
                                                <div className="row g-4 align-items-stretch">
                                                        <div className={cx("col-lg-4", s.reveal)}>
                                                                <span className={s.sectionKicker}>Setup Guide</span>
                                                                <h2 className={cx(s.heading, "mb-3")}>
                                                                        Get started quickly and scale as you grow.
                                                                </h2>
                                                                <p className={s.textMutedPaymo}>
                                                                        A clear step-by-step plan shows how to go from testing to live operations without any complexity.
                                                                </p>
                                                                <button
                                                                        className={cx(s.btnPaymo, "btn d-inline-flex align-items-center gap-2")}
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#treasuryModal"
                                                                        type="button"
                                                                >
                                                                        <i className="bi bi-diagram-2" />
                                                                        Create your plan
                                                                </button>
                                                        </div>
                                                        <div className={cx("col-lg-8", s.reveal)}>
                                                                <div className={s.implementationGrid}>
                                                                        {content.implementationTracks.map((track) => (
                                                                                <div className={cx(s.glassCard, s.implementationCard)} key={track.week}>
                                                                                        <small>{track.week}</small>
                                                                                        <h3 className={cx(s.heading, "fs-4")}>{track.title}</h3>
                                                                                        <p className={s.textMutedPaymo}>{track.text}</p>
                                                                                        <div className={s.chipRow}>
                                                                                                {track.chips.map((chip) => (
                                                                                                        <span className={s.dataChip} key={chip}>{chip}</span>
                                                                                                ))}
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </section>

                                {/* ================= AUTOMATIONS ================= */}
                                <section id="automations" className={s.sectionPad}>
                                        <div className="container">
                                                <div className={cx("text-center mb-5", s.reveal)}>
                                                        <span className={s.sectionKicker}>Smart Automations</span>
                                                        <h2 className={cx(s.heading, "mb-3")}>
                                                                Automate your business tasks.
                                                        </h2>
                                                        <p className={cx(s.textMutedPaymo, "mx-auto")} style={{ maxWidth: "820px" }}>
                                                                Click any automation to see how it works - what triggers it, what action it takes, and the business benefit.
                                                        </p>
                                                </div>
                                                <div className="row g-4 align-items-stretch">
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <div className={cx(s.glassCard, s.automationPreview)}>
                                                                        <span className={s.consoleIcon}>
                                                                                <i className={`bi ${content.automationRecipes[activeAutomation].icon}`} />
                                                                        </span>
                                                                        <small className={s.textMint}>SELECTED AUTOMATION</small>
                                                                        <h3 className={cx(s.heading, "mb-3")}>
                                                                                {content.automationRecipes[activeAutomation].trigger}
                                                                        </h3>
                                                                        <div className={s.automationStep}>
                                                                                <span>Action</span>
                                                                                <strong>{content.automationRecipes[activeAutomation].action}</strong>
                                                                        </div>
                                                                        <div className={s.automationStep}>
                                                                                <span>Outcome</span>
                                                                                <strong>{content.automationRecipes[activeAutomation].outcome}</strong>
                                                                        </div>
                                                                        <button
                                                                                className={cx(s.btnPaymoOutline, "btn w-100 mt-4")}
                                                                                type="button"
                                                                                onClick={() => pushToast("Automation recipe added to sandbox", "bi-magic")}
                                                                        >
                                                                                Add to sandbox workspace
                                                                        </button>
                                                                </div>
                                                        </div>
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                <div className={s.automationGrid}>
                                                                        {content.automationRecipes.map((recipe, index) => (
                                                                                <button
                                                                                        type="button"
                                                                                        className={cx(s.automationCard, activeAutomation === index && s.active)}
                                                                                        key={recipe.trigger}
                                                                                        onClick={() => setActiveAutomation(index)}
                                                                                >
                                                                                        <i className={`bi ${recipe.icon}`} />
                                                                                        <span>{recipe.trigger}</span>
                                                                                        <small>{recipe.action}</small>
                                                                                </button>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </section>

                                {/* ================= PROOF STRIP ================= */}
                                <section id="proof" className={cx(s.sectionPad, "pt-0")}>
                                        <div className="container">
                                                <div className={cx(s.proofShell, s.reveal)}>
                                                        {content.platformProof.map((proof) => (
                                                                <div className={s.proofCard} key={proof.label}>
                                                                        <small>{proof.label}</small>
                                                                        <strong>{proof.value}</strong>
                                                                        <span>{proof.text}</span>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </section>

                                {/* ================= DEVELOPERS ================= */}
                                <section id="developers" className={s.sectionPad}>
                                        <div className="container">
                                                <div className="row g-4 align-items-stretch">
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <span className={s.sectionKicker}>For Developers</span>
                                                                <h2 className={cx(s.heading, "mb-3")}>
                                                                        Start building immediately.
                                                                </h2>
                                                                <p className={s.textMutedPaymo}>
                                                                        Test with our sandbox, copy code samples, download API starters, and start integrating payments right away.
                                                                </p>
                                                                <div className={s.developerPoints}>
                                                                        {content.developerPoints.map((point) => (
                                                                                <div className={s.miniStat} key={point.title}>
                                                                                        <span className={s.iconBadge}>
                                                                                                <i className={`bi ${point.icon}`} />
                                                                                        </span>
                                                                                        <div>
                                                                                                <strong>{point.title}</strong>
                                                                                                <span className={s.textMutedPaymo}>{point.text}</span>
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                                <div className="mt-4 d-flex flex-wrap gap-2">
                                                                        <button
                                                                                className={cx(
                                                                                        s.btnPaymo,
                                                                                        "btn d-inline-flex align-items-center gap-2",
                                                                                )}
                                                                                data-bs-toggle="offcanvas"
                                                                                data-bs-target="#sandboxPanel"
                                                                                type="button"
                                                                        >
                                                                                <i className="bi bi-rocket-takeoff" />
                                                                                Open sandbox panel
                                                                        </button>
                                                                        <button
                                                                                className={cx(
                                                                                        s.btnPaymoOutline,
                                                                                        "btn d-inline-flex align-items-center gap-2",
                                                                                )}
                                                                                type="button"
                                                                                onClick={() =>
                                                                                        downloadFile(
                                                                                                "paymo-baas-starter.json",
                                                                                                JSON.stringify(content.postmanStarter, null, 2),
                                                                                                "application/json",
                                                                                        )
                                                                                }
                                                                        >
                                                                                <i className="bi bi-cloud-download" />
                                                                                Download API starter
                                                                        </button>
                                                                </div>
                                                        </div>
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                <div className={cx(s.glassCard, s.codePanel)}>
                                                                        <div className={s.codeSwitcher}>
                                                                                {Object.keys(content.codeSamples).map((key) => (
                                                                                        <button
                                                                                                type="button"
                                                                                                className={cx(
                                                                                                        s.btnChip,
                                                                                                        "btn",
                                                                                                        activeCode === key && s.active,
                                                                                                )}
                                                                                                key={key}
                                                                                                onClick={() => setActiveCode(key)}
                                                                                        >
                                                                                                {key === "js"
                                                                                                        ? "Browser JS"
                                                                                                        : key === "node"
                                                                                                                ? "Node"
                                                                                                                : "cURL"}
                                                                                        </button>
                                                                                ))}
                                                                        </div>
                                                                        <div className={s.codeScreen}>
                                                                                <div className={s.codeTopbar}>
                                                                                        <div className={s.codeDots}>
                                                                                                <span />
                                                                                                <span />
                                                                                                <span />
                                                                                        </div>
                                                                                        <div className="d-flex gap-2 flex-wrap">
                                                                                                <button
                                                                                                        className={cx(s.btnPaymoOutline, "btn btn-sm")}
                                                                                                        type="button"
                                                                                                        onClick={(e) =>
                                                                                                                copyText(
                                                                                                                        "https://sandbox.paymo.africa/v1",
                                                                                                                        e.currentTarget,
                                                                                                                )
                                                                                                        }
                                                                                                >
                                                                                                        Copy base URL
                                                                                                </button>
                                                                                                <button
                                                                                                        className={cx(s.btnPaymo, "btn btn-sm")}
                                                                                                        type="button"
                                                                                                        onClick={(e) =>
                                                                                                                copyText(
                                                                                                                        content.codeSamples[activeCode],
                                                                                                                        e.currentTarget,
                                                                                                                )
                                                                                                        }
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
                                                        <div className={cx("col-lg-5", s.reveal)}>
                                                                <span className={s.sectionKicker}>
                                                                        Security &amp; Trust Center
                                                                </span>
                                                                <h2 className={cx(s.heading, "mb-3")}>
                                                                        Built-in compliance without slowing you down.
                                                                </h2>
                                                                <p className={s.textMutedPaymo}>
                                                                        We make compliance part of every transaction automatically,
                                                                        not something added at the end.
                                                                </p>
                                                                <div className={cx(s.trustGrid, "mt-4")}>
                                                                        {content.trustStats.map((stat) => (
                                                                                <div
                                                                                        className={cx(s.glassCard, s.resultCard, s.tilt)}
                                                                                        data-tilt
                                                                                        key={stat.accent}
                                                                                >
                                                                                        <div className={s.resultNumber}>
                                                                                                <em>{stat.accent}</em>
                                                                                                {stat.rest}
                                                                                        </div>
                                                                                        <div className={s.textMutedPaymo}>{stat.text}</div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                        <div className={cx("col-lg-7", s.reveal)}>
                                                                {/* Bootstrap accordion — data API handled by the imported JS bundle */}
                                                                <div
                                                                        className={cx("accordion", s.accordionPaymo)}
                                                                        id="trustAccordion"
                                                                >
                                                                        {content.trustFaq.map((item) => (
                                                                                <div className="accordion-item" key={item.id}>
                                                                                        <h2 className="accordion-header">
                                                                                                <button
                                                                                                        className={cx(
                                                                                                                "accordion-button",
                                                                                                                !item.open && "collapsed",
                                                                                                        )}
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
                                                                                                className={cx(
                                                                                                        "accordion-collapse collapse",
                                                                                                        item.open && "show",
                                                                                                )}
                                                                                                data-bs-parent="#trustAccordion"
                                                                                        >
                                                                                                <div className={cx("accordion-body", s.textMutedPaymo)}>
                                                                                                        {item.body}
                                                                                                </div>
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
                                                <div className={cx("text-center mb-5", s.reveal)}>
                                                        <span className={s.sectionKicker}>Why Businesses Choose Us</span>
                                                        <h2 className={cx(s.heading, "mb-3")}>

                                                                Complete financial infrastructure for builders and teams.
                                                        </h2>
                                                        <p
                                                                className={cx(s.textMutedPaymo, "mx-auto")}
                                                                style={{ maxWidth: "780px" }}
                                                        >
                                                                We deliver treasury management, virtual banking, built-in compliance, fast development tools, and deep regional coverage — all in one platform.
                                                        </p>
                                                </div>
                                                <div className="row g-4">
                                                        {content.results.map((result) => (
                                                                <div className={cx("col-lg-4", s.reveal)} key={result.kicker}>
                                                                        <div
                                                                                className={cx(s.glassCard, s.resultCard, "h-100", s.tilt)}
                                                                                data-tilt
                                                                        >
                                                                                <small
                                                                                        className={cx(s.textMint, "text-uppercase d-block mb-2")}
                                                                                        style={{ letterSpacing: "0.16em" }}
                                                                                >
                                                                                        {result.kicker}
                                                                                </small>
                                                                                <div className={s.resultNumber}>
                                                                                        {result.end !== null ? (
                                                                                                <span data-count={result.end}>0</span>
                                                                                        ) : null}
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
                                <section id="faq" className={cx(s.sectionPad, "pt-0")}>
                                        <div className="container">
                                                <div className={cx("text-center mb-5", s.reveal)}>
                                                        <span className={s.sectionKicker}>FAQ</span>
                                                        <h2 className={cx(s.heading, "mb-3")}>
                                                                Common questions answered.
                                                        </h2>
                                                </div>
                                                <div
                                                        className={cx("accordion", s.accordionPaymo, s.reveal)}
                                                        id="faqAccordion"
                                                >
                                                        {content.faqs.map((item) => (
                                                                <div className="accordion-item" key={item.id}>
                                                                        <h2 className="accordion-header">
                                                                                <button
                                                                                        className={cx(
                                                                                                "accordion-button",
                                                                                                !item.open && "collapsed",
                                                                                        )}
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
                                                                                className={cx(
                                                                                        "accordion-collapse collapse",
                                                                                        item.open && "show",
                                                                                )}
                                                                                data-bs-parent="#faqAccordion"
                                                                        >
                                                                                <div className={cx("accordion-body", s.textMutedPaymo)}>
                                                                                        {item.body}
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </section>

                                {/* ================= CTA ================= */}
                                <section id="cta" className={cx(s.sectionPad, "pt-0")}>
                                        <div className={cx("container", s.reveal)}>
                                                <div className={cx(s.glassCard, s.ctaShell, "p-4 p-lg-5")}>
                                                        <img
                                                                src={images.stockCoins}
                                                                className={cx(s.ctaArt, "d-none d-lg-block")}
                                                                alt=""
                                                                aria-hidden="true"
                                                        />
                                                        <div className="row align-items-center g-4 position-relative">
                                                                <div className="col-lg-7">
                                                                        <span className={s.sectionKicker}>Final Call to Action</span>
                                                                        <h2 className={cx(s.heading, "mb-3")}>
                                                                                Build the future of money across Africa.
                                                                        </h2>
                                                                        <p className={cx(s.textMutedPaymo, "mb-0")}>
                                                                                Start with our sandbox, create your rollout plan, or download our platform overview to get started today.
                                                                        </p>
                                                                </div>
                                                                <div className="col-lg-5">
                                                                        <div className="d-grid gap-2">
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymo,
                                                                                                "btn d-inline-flex align-items-center justify-content-center gap-2",
                                                                                        )}
                                                                                        data-bs-toggle="offcanvas"
                                                                                        data-bs-target="#sandboxPanel"
                                                                                        type="button"
                                                                                >
                                                                                        <i className="bi bi-play-circle" />
                                                                                        Start sandbox workflow
                                                                                </button>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center justify-content-center gap-2",
                                                                                        )}
                                                                                        data-bs-toggle="modal"
                                                                                        data-bs-target="#treasuryModal"
                                                                                        type="button"
                                                                                >
                                                                                        <i className="bi bi-graph-up-arrow" />
                                                                                        Build my treasury plan
                                                                                </button>
                                                                                <button
                                                                                        className={cx(
                                                                                                s.btnPaymoOutline,
                                                                                                "btn d-inline-flex align-items-center justify-content-center gap-2",
                                                                                        )}
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                                downloadFile(
                                                                                                        "paymo-capability-brief.txt",
                                                                                                        content.capabilityBrief,
                                                                                                        "text/plain",
                                                                                                )
                                                                                        }
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

                        {/* ================= OFFCANVAS (Bootstrap) ================= */}
                        <div
                                className="offcanvas offcanvas-end"
                                tabIndex={-1}
                                id="sandboxPanel"
                                aria-labelledby="sandboxPanelLabel"
                        >
                                <div className="offcanvas-header">
                                        <div>
                                                <h5 id="sandboxPanelLabel" className={cx(s.heading, "mb-1")}>
                                                        Free sandbox quickstart
                                                </h5>
                                                <div className={cx(s.textMutedPaymo, "small")}>
                                                        Working actions inside the homepage.
                                                </div>
                                        </div>
                                        <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="offcanvas"
                                                aria-label="Close"
                                        />
                                </div>
                                <div className="offcanvas-body d-grid gap-3">
                                        <div className={cx(s.glassCard, "p-3")}>
                                                <small
                                                        className={cx(s.textMint, "text-uppercase d-block mb-2")}
                                                        style={{ letterSpacing: "0.16em" }}
                                                >
                                                        Step 1
                                                </small>
                                                <h3 className={cx(s.heading, "fs-5")}>Get your integration base</h3>
                                                <p className={cx(s.textMutedPaymo, "mb-3")}>
                                                        Use the sample base URL and switch to the developer section to
                                                        copy starter code for payouts, accounts, or collections.
                                                </p>
                                                <button
                                                        className={cx(s.btnPaymoOutline, "btn w-100")}
                                                        type="button"
                                                        onClick={(e) =>
                                                                copyText("https://sandbox.paymo.africa/v1", e.currentTarget)
                                                        }
                                                >
                                                        Copy sandbox base URL
                                                </button>
                                        </div>
                                        <div className={cx(s.glassCard, "p-3")}>
                                                <small
                                                        className={cx(s.textMint, "text-uppercase d-block mb-2")}
                                                        style={{ letterSpacing: "0.16em" }}
                                                >
                                                        Step 2
                                                </small>
                                                <h3 className={cx(s.heading, "fs-5")}>
                                                        Download starter collection
                                                </h3>
                                                <p className={cx(s.textMutedPaymo, "mb-3")}>
                                                        Grab a lightweight JSON starter that mirrors the homepage API
                                                        examples.
                                                </p>
                                                <button
                                                        className={cx(s.btnPaymoOutline, "btn w-100")}
                                                        type="button"
                                                        onClick={() =>
                                                                downloadFile(
                                                                        "paymo-baas-starter.json",
                                                                        JSON.stringify(content.postmanStarter, null, 2),
                                                                        "application/json",
                                                                )
                                                        }
                                                >
                                                        Download starter collection
                                                </button>
                                        </div>
                                        <div className={cx(s.glassCard, "p-3")}>
                                                <small
                                                        className={cx(s.textMint, "text-uppercase d-block mb-2")}
                                                        style={{ letterSpacing: "0.16em" }}
                                                >
                                                        Step 3
                                                </small>
                                                <h3 className={cx(s.heading, "fs-5")}>Jump to implementation</h3>
                                                <p className={cx(s.textMutedPaymo, "mb-3")}>
                                                        Go straight to the code panel to see runtime-specific examples and
                                                        copy them.
                                                </p>
                                                <a
                                                        href="#developers"
                                                        className={cx(s.btnPaymo, "btn w-100")}
                                                        data-bs-dismiss="offcanvas"
                                                >
                                                        Open developer section
                                                </a>
                                        </div>
                                </div>
                        </div>

                        {/* ================= MODAL (Bootstrap) ================= */}
                        <div
                                className="modal fade"
                                id="treasuryModal"
                                tabIndex={-1}
                                aria-labelledby="treasuryModalLabel"
                                aria-hidden="true"
                        >
                                <div className="modal-dialog modal-dialog-centered modal-lg">
                                        <div className="modal-content">
                                                <div className="modal-header">
                                                        <div>
                                                                <h5
                                                                        className={cx("modal-title", s.heading)}
                                                                        id="treasuryModalLabel"
                                                                >
                                                                        Generate a Paymo treasury rollout plan
                                                                </h5>
                                                                <div className={cx(s.textMutedPaymo, "small")}>
                                                                        This modal creates a tailored plan summary directly on the
                                                                        page.
                                                                </div>
                                                        </div>
                                                        <button
                                                                type="button"
                                                                className="btn-close"
                                                                data-bs-dismiss="modal"
                                                                aria-label="Close"
                                                        />
                                                </div>
                                                <div className="modal-body">
                                                        <div className="row g-3">
                                                                <div className="col-md-6">
                                                                        <label className="form-label" htmlFor="planUseCase">
                                                                                Primary use case
                                                                        </label>
                                                                        <select
                                                                                id="planUseCase"
                                                                                className="form-select"
                                                                                ref={planUseCaseRef}
                                                                                defaultValue="Neobank launch"
                                                                        >
                                                                                <option value="Neobank launch">Neobank launch</option>
                                                                                <option value="Cross-border payroll">
                                                                                        Cross-border payroll
                                                                                </option>
                                                                                <option value="Remittance superapp">
                                                                                        Remittance superapp
                                                                                </option>
                                                                                <option value="Supplier payments">Supplier payments</option>
                                                                                <option value="Marketplace collections">
                                                                                        Marketplace collections
                                                                                </option>
                                                                        </select>
                                                                </div>
                                                                <div className="col-md-6">
                                                                        <label className="form-label" htmlFor="planMarkets">
                                                                                Markets at launch
                                                                        </label>
                                                                        <select
                                                                                id="planMarkets"
                                                                                className="form-select"
                                                                                ref={planMarketsRef}
                                                                                defaultValue="2"
                                                                        >
                                                                                <option value="2">2 markets</option>
                                                                                <option value="4">4 markets</option>
                                                                                <option value="8">8 markets</option>
                                                                                <option value="12">12+ markets</option>
                                                                        </select>
                                                                </div>
                                                                <div className="col-md-6">
                                                                        <label className="form-label" htmlFor="planSettlement">
                                                                                Primary settlement focus
                                                                        </label>
                                                                        <select
                                                                                id="planSettlement"
                                                                                className="form-select"
                                                                                ref={planSettlementRef}
                                                                                defaultValue="local payout speed"
                                                                        >
                                                                                <option value="local payout speed">
                                                                                        Local payout speed
                                                                                </option>
                                                                                <option value="treasury optimization">
                                                                                        Treasury optimization
                                                                                </option>
                                                                                <option value="compliance automation">
                                                                                        Compliance automation
                                                                                </option>
                                                                                <option value="account issuance">Account issuance</option>
                                                                        </select>
                                                                </div>
                                                                <div className="col-md-6">
                                                                        <label className="form-label" htmlFor="planDelivery">
                                                                                Preferred delivery pattern
                                                                        </label>
                                                                        <select
                                                                                id="planDelivery"
                                                                                className="form-select"
                                                                                ref={planDeliveryRef}
                                                                                defaultValue="API-first integration"
                                                                        >
                                                                                <option value="API-first integration">
                                                                                        API-first integration
                                                                                </option>
                                                                                <option value="White-label launch">
                                                                                        White-label launch
                                                                                </option>
                                                                                <option value="Hybrid operator console">
                                                                                        Hybrid operator console
                                                                                </option>
                                                                        </select>
                                                                </div>
                                                        </div>
                                                        <div className={cx(s.glassCard, "p-4 mt-4")}>
                                                                {planOutput ?? (
                                                                        <>
                                                                                <h3 className={cx(s.heading, "fs-5 mb-2")}>
                                                                                        Your rollout summary will appear here.
                                                                                </h3>
                                                                                <p className={cx(s.textMutedPaymo, "mb-0")}>
                                                                                        Choose your parameters and click{" "}
                                                                                        <strong>Generate plan</strong> to produce a concise
                                                                                        deployment recommendation.
                                                                                </p>
                                                                        </>
                                                                )}
                                                        </div>
                                                </div>
                                                <div className="modal-footer d-flex flex-wrap gap-2 justify-content-between">
                                                        <button
                                                                type="button"
                                                                className={cx(s.btnPaymoOutline, "btn")}
                                                                onClick={(e) =>
                                                                        copyText(lastPlanTextRef.current, e.currentTarget)
                                                                }
                                                        >
                                                                Copy plan
                                                        </button>
                                                        <div className="d-flex flex-wrap gap-2">
                                                                <button
                                                                        type="button"
                                                                        className={cx(s.btnPaymo, "btn")}
                                                                        onClick={generatePlan}
                                                                >
                                                                        Generate plan
                                                                </button>
                                                                <a
                                                                        href="#coverage"
                                                                        className={cx(s.btnPaymoOutline, "btn")}
                                                                        data-bs-dismiss="modal"
                                                                >
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
