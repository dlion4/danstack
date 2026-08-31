/* ============================================================================
 * attentionFeed.ts — cross-page attention inbox for every transaction page
 * ----------------------------------------------------------------------------
 * These items are reused by every /pm/app/* transaction drawer so Tab 1
 * ("All attention") groups operational exceptions from all transaction pages
 * while Tab 2 filters to the active page only.
 * ========================================================================== */

export interface AttentionItem {
	icon: string;
	iconBg: string;
	iconColor: string;
	title: string;
	sub: string;
	actionLabel: string;
	modal: string;
}

export interface CrossPageAttentionItem extends AttentionItem {
	page: string;
	pageIcon: string;
}

export interface QuickActionItem {
	icon: string;
	iconColor: string;
	label: string;
	modal: string;
}

export const CROSS_PAGE_ATTENTION: CrossPageAttentionItem[] = [
	{
		icon: "bi-person-exclamation",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "Bulk file has 4 invalid phone numbers",
		sub: "Initiate transfer · review before any KES are released",
		actionLabel: "Review",
		modal: "bulkTransferModal",
		page: "Initiate transfer",
		pageIcon: "bi-send",
	},
	{
		icon: "bi-calendar-x",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		title: "3 scheduled transfers are paused on funding source",
		sub: "Transfer management · M-Pesa number changed",
		actionLabel: "Update",
		modal: "editScheduleModal",
		page: "Transfer management",
		pageIcon: "bi-arrow-repeat",
	},
	{
		icon: "bi-graph-down-arrow",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		title: "M-Pesa volume dropped 22% versus the 7-day average",
		sub: "Analytics · review rail mix before acting",
		actionLabel: "Analyse",
		modal: "transferAnalyticsModal",
		page: "Analytics",
		pageIcon: "bi-bar-chart-line",
	},
	{
		icon: "bi-shield-exclamation",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "2 matching-name sanctions alerts awaiting review",
		sub: "Compliance · SAR window closes in 72 hours",
		actionLabel: "Review",
		modal: "transferAnalyticsModal",
		page: "Compliance",
		pageIcon: "bi-shield-check",
	},
	{
		icon: "bi-person-vcard",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		title: "4 customer profiles missing KYC documents",
		sub: "Customers · service restricted until verified",
		actionLabel: "Open",
		modal: "manageBeneficiariesModal",
		page: "Customers",
		pageIcon: "bi-people",
	},
	{
		icon: "bi-arrow-counterclockwise",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "5 chargebacks approach the 7-day response window",
		sub: "Disputes · evidence due before end of week",
		actionLabel: "Respond",
		modal: "disputeTransferModal",
		page: "Disputes",
		pageIcon: "bi-exclamation-diamond",
	},
	{
		icon: "bi-cash-stack",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		title: "New fee schedule takes effect in 48 hours",
		sub: "Fees · customers will see updated pricing",
		actionLabel: "Review",
		modal: "transferLimitsModal",
		page: "Fees",
		pageIcon: "bi-percent",
	},
	{
		icon: "bi-currency-exchange",
		iconBg: "var(--pm-purple-soft)",
		iconColor: "var(--pm-purple)",
		title: "GBP/KES rate moved 1.8% above the hedge trigger",
		sub: "FX · best-execution alert issued",
		actionLabel: "Review",
		modal: "transferLimitsModal",
		page: "FX",
		pageIcon: "bi-currency-exchange",
	},
	{
		icon: "bi-bank",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		title: "Bank settlement run is waiting for batch confirmation",
		sub: "Settlement · value at risk KES 486,000",
		actionLabel: "Confirm",
		modal: "transferHistoryModal",
		page: "Settlement",
		pageIcon: "bi-bank",
	},
	{
		icon: "bi-diagram-3",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		title: "12 rows in the holding account need manual matching",
		sub: "Reconciliation · match within 24 hours",
		actionLabel: "Match",
		modal: "transferHistoryModal",
		page: "Reconciliation",
		pageIcon: "bi-diagram-3",
	},
	{
		icon: "bi-hdd-network",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "M-Pesa adapter is in half-open circuit breaker state",
		sub: "Payment rails · failures recovered, re-check throughput",
		actionLabel: "Monitor",
		modal: "transferAnalyticsModal",
		page: "Payment rails",
		pageIcon: "bi-broadcast",
	},
	{
		icon: "bi-phone",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		title: "Agent float below threshold in 8 counties",
		sub: "Mobile money · top-up suggest available",
		actionLabel: "View",
		modal: "transferHistoryModal",
		page: "Mobile money",
		pageIcon: "bi-phone",
	},
	{
		icon: "bi-shop",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		title: "6 merchants awaiting setup approval",
		sub: "Onboarding · approval waits on beneficial owner",
		actionLabel: "Review",
		modal: "manageBeneficiariesModal",
		page: "Onboarding",
		pageIcon: "bi-shop",
	},
	{
		icon: "bi-activity",
		iconBg: "var(--pm-danger-soft)",
		iconColor: "var(--pm-danger)",
		title: "P95 latency breached the 300 ms alert threshold",
		sub: "System health · 4 services affected",
		actionLabel: "View",
		modal: "transferAnalyticsModal",
		page: "System health",
		pageIcon: "bi-activity",
	},
	{
		icon: "bi-file-earmark-text",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		title: "Withholding tax report is due in 3 days",
		sub: "KRA government · downloadable summary ready",
		actionLabel: "Export",
		modal: "transferHistoryModal",
		page: "KRA & government",
		pageIcon: "bi-building",
	},
	{
		icon: "bi-list-task",
		iconBg: "var(--pm-info-soft)",
		iconColor: "var(--pm-info)",
		title: "3 manual holds need a release or block decision",
		sub: "Transfer management · decision required on 3 rows",
		actionLabel: "Decide",
		modal: "transferDetailModal",
		page: "Transfer management",
		pageIcon: "bi-list-task",
	},
	{
		icon: "bi-bell",
		iconBg: "var(--pm-warning-soft)",
		iconColor: "var(--pm-warning)",
		title: "2 operating accounts need the 30-day statement review",
		sub: "Account · periodic review due before Friday",
		actionLabel: "Review",
		modal: "statementModal",
		page: "Account",
		pageIcon: "bi-person-badge",
	},
];
