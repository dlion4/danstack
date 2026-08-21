/* ============================================================================
 * Card Dashboard — navigation model
 * ----------------------------------------------------------------------------
 * Section anchors for every module page (sidebar scroll-spy, keyboard
 * shortcuts 1–7 and deep anchors all depend on these ids) plus the page-level
 * breadcrumb labels used by the topbar. Moved out of Shell.tsx so the new
 * `lib/AppShell.tsx` and any future consumer share one source of truth.
 * ========================================================================== */

import type { CardsPageId } from "./routes";
import type { IconName } from "./icons";

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  anchor: string;
  badge?: string;
  badgeTone?: "danger" | "warn";
  filter?: string;
}

export const NAV_51: NavItem[] = [
  { id: "overview", label: "Command Center", icon: "gauge", anchor: "overview" },
  { id: "cards", label: "My Cards", icon: "card", anchor: "cards" },
  { id: "alerts", label: "Alerts & Notifications", icon: "bell", anchor: "alerts" },
  { id: "transactions", label: "Transactions", icon: "wallet", anchor: "transactions" },
  { id: "security", label: "Security & Fraud", icon: "shield", anchor: "security", badge: "1", badgeTone: "danger" },
  { id: "analytics", label: "Analytics", icon: "chart", anchor: "analytics" },
  { id: "program", label: "Programme & Health", icon: "building", anchor: "program" },
  { id: "settings", label: "Settings & Support", icon: "sliders", anchor: "settings" },
];

export const NAV_52: NavItem[] = [
  { id: "overview", label: "Tier Comparison", icon: "gauge", anchor: "overview" },
  { id: "orders", label: "Card Orders", icon: "inbox", anchor: "orders" },
  { id: "mycards", label: "My Physical Cards", icon: "card", anchor: "mycards" },
  { id: "fees", label: "Fee Schedule", icon: "wallet", anchor: "fees" },
  { id: "addresses", label: "Delivery Addresses", icon: "building", anchor: "addresses" },
  { id: "replacement", label: "Replacement", icon: "refresh", anchor: "replacement" },
];

export const NAV_53: NavItem[] = [
  { id: "overview", label: "Virtual Debit Center", icon: "gauge", anchor: "overview" },
  { id: "virtual-cards", label: "Virtual Cards", icon: "card", anchor: "virtual-cards" },
  { id: "guardrails", label: "Security Guardrails", icon: "shield", anchor: "guardrails" },
  { id: "funding", label: "Funding & Limits", icon: "wallet", anchor: "funding" },
  { id: "activity", label: "Virtual Activity", icon: "chart", anchor: "activity" },
  { id: "best-practice", label: "Best Practices", icon: "spark", anchor: "best-practice" },
];

export const NAV_54: NavItem[] = [
  { id: "overview", label: "Credit Center", icon: "gauge", anchor: "overview" },
  { id: "credit-line", label: "Credit Line & Statement", icon: "wallet", anchor: "credit-line" },
  { id: "credit-cards", label: "Virtual Credit Cards", icon: "card", anchor: "credit-cards" },
  { id: "repayment", label: "Repayment & Billing", icon: "refresh", anchor: "repayment" },
  { id: "credit-activity", label: "Credit Activity", icon: "chart", anchor: "credit-activity" },
  { id: "credit-insights", label: "Fees & Insights", icon: "spark", anchor: "credit-insights" },
];

export const NAV_55: NavItem[] = [
  { id: "overview", label: "Prepaid Center", icon: "gauge", anchor: "overview" },
  { id: "prepaid-cards", label: "Prepaid Cards", icon: "card", anchor: "prepaid-cards" },
  { id: "balances", label: "Balances & Reloads", icon: "wallet", anchor: "balances" },
  { id: "controls", label: "Limits & MCC Locks", icon: "shield", anchor: "controls" },
  { id: "prepaid-activity", label: "Load & Spend Activity", icon: "chart", anchor: "prepaid-activity" },
  { id: "prepaid-fees", label: "Fees & Guide", icon: "spark", anchor: "prepaid-fees" },
];

export const NAV_56: NavItem[] = [
  { id: "overview", label: "Programme Overview", icon: "gauge", anchor: "overview" },
  { id: "departments", label: "Departments & Budgets", icon: "building", anchor: "departments" },
  { id: "employees", label: "Employee Cards", icon: "users", anchor: "employees" },
  { id: "policies", label: "Spend Policies", icon: "shield", anchor: "policies" },
  { id: "approvals", label: "Approvals & Violations", icon: "flag", anchor: "approvals", badge: "3", badgeTone: "warn" },
  { id: "program-billing", label: "Billing & Settlement", icon: "wallet", anchor: "program-billing" },
];

export const NAV_57: NavItem[] = [
  { id: "overview", label: "Security Overview", icon: "gauge", anchor: "overview" },
  { id: "fraud-events", label: "Fraud Events", icon: "flag", anchor: "fraud-events", badge: "2", badgeTone: "danger" },
  { id: "safeguards", label: "Safeguards & Rules", icon: "shield", anchor: "safeguards" },
  { id: "report-card", label: "Report a Compromise", icon: "alertTri", anchor: "report-card" },
  { id: "suspicious", label: "Review Transactions", icon: "search", anchor: "suspicious" },
  { id: "audit-log", label: "Audit Log", icon: "clock", anchor: "audit-log" },
];

export const NAV_58: NavItem[] = [
  { id: "overview", label: "Analytics Overview", icon: "gauge", anchor: "overview" },
  { id: "issuance", label: "Issuance & Activation", icon: "card", anchor: "issuance" },
  { id: "revenue", label: "Usage & Revenue", icon: "chart", anchor: "revenue" },
  { id: "concentration", label: "Merchant Concentration", icon: "pie", anchor: "concentration" },
  { id: "corporate-spend", label: "Corporate & Risk", icon: "building", anchor: "corporate-spend" },
  { id: "insights", label: "Insights & Forecast", icon: "spark", anchor: "insights" },
];

export const NAV_59: NavItem[] = [
  { id: "overview", label: "System Health", icon: "gauge", anchor: "overview" },
  { id: "gateway-logs", label: "Gateway Logs", icon: "refresh", anchor: "gateway-logs" },
  { id: "integrations", label: "Webhooks & API Keys", icon: "key", anchor: "integrations" },
  { id: "admin-access", label: "Admin Access", icon: "users", anchor: "admin-access" },
  { id: "environment", label: "Environment & Maintenance", icon: "building", anchor: "environment" },
];

export const NAV_510: NavItem[] = [
  { id: "overview", label: "Settings & Support", icon: "gauge", anchor: "overview" },
  { id: "card-defaults", label: "Programme Defaults", icon: "sliders", anchor: "card-defaults" },
  { id: "support", label: "Get Support", icon: "headset", anchor: "support" },
  { id: "faq", label: "Help & FAQs", icon: "help", anchor: "faq" },
  { id: "resources", label: "Resources & Trust", icon: "shieldCheck", anchor: "resources" },
];

/** Section nav for a module page. */
export const NAV_BY_PAGE: Record<CardsPageId, NavItem[]> = {
  "5.1": NAV_51,
  "5.2": NAV_52,
  "5.3": NAV_53,
  "5.4": NAV_54,
  "5.5": NAV_55,
  "5.6": NAV_56,
  "5.7": NAV_57,
  "5.8": NAV_58,
  "5.9": NAV_59,
  "5.10": NAV_510,
};

export function navForPage(page: CardsPageId): NavItem[] {
  return NAV_BY_PAGE[page] ?? NAV_51;
}

/** Topbar breadcrumb labels (long form ≥sm, short form on mobile). */
export const PAGE_LABELS: Record<CardsPageId, { long: string; short: string }> = {
  "5.1": { long: "Command Center", short: "Card Center" },
  "5.2": { long: "Physical Debit Cards", short: "Physical Cards" },
  "5.3": { long: "Virtual Debit Center", short: "Virtual Debit" },
  "5.4": { long: "Virtual Credit Center", short: "Virtual Credit" },
  "5.5": { long: "Prepaid Cards", short: "Prepaid" },
  "5.6": { long: "Corporate Programs", short: "Corporate" },
  "5.7": { long: "Security & Fraud", short: "Security" },
  "5.8": { long: "Analytics & Reporting", short: "Analytics" },
  "5.9": { long: "Program Administration", short: "Administration" },
  "5.10": { long: "Settings & Support", short: "Settings" },
};
