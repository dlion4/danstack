/* ============================================================================\n * routes.ts — TanStack URL map for the designed PayMo Business pages.
 * ----------------------------------------------------------------------------
 * Root.tsx used to switch modules with useState. Each designed App already
 * accepts `onNavigate(pageId, anchor?, action?)` — we keep that contract and
 * send it through the router so deep links, back/forward and the sidebar all
 * stay in sync without touching page designs.
 * ========================================================================== */

import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import type { QAction } from "../lib.ts";

export type BusinessPageId =
	| "dashboard"
	| "getpaid"
	| "paysuppliers"
	| "cash"
	| "books"
	| "crm"
	| "productstore"
	| "inventory"
	| "marketing"
	| "profile"
	| "team"
	| "disputes"
	| "notifications"
	| "data"
	| "integrations"
	| "portfolio"
	| "funding"
	| "insurance";

export const PAGE_PATH: Record<BusinessPageId, string> = {
	dashboard: "/business-dashboard",
	getpaid: "/business-dashboard/get-paid",
	paysuppliers: "/business-dashboard/pay-suppliers",
	cash: "/business-dashboard/cash",
	books: "/business-dashboard/books",
	crm: "/business-dashboard/crm",
	productstore: "/business-dashboard/products",
	inventory: "/business-dashboard/inventory",
	marketing: "/business-dashboard/marketing",
	profile: "/business-dashboard/profile",
	team: "/business-dashboard/team",
	disputes: "/business-dashboard/disputes",
	notifications: "/business-dashboard/notifications",
	data: "/business-dashboard/data",
	integrations: "/business-dashboard/integrations",
	portfolio: "/business-dashboard/portfolio",
	funding: "/business-dashboard/funding",
	insurance: "/business-dashboard/insurance",
};

/** Nav ids from lib/navigation.ts that don't match a PageId 1:1. */
const NAV_ALIAS: Record<string, { page: BusinessPageId; anchor?: string }> = {
	customers: { page: "crm" },
	payroll: { page: "paysuppliers", anchor: "sec-payroll" },
	expenses: { page: "paysuppliers", anchor: "sec-expenses" },
};

let pendingAction: QAction = null;

export function takePendingAction(): QAction {
	const next = pendingAction;
	pendingAction = null;
	return next;
}

export function useBusinessNavigate() {
	const navigate = useNavigate();

	return useCallback(
		(page: string, anchor?: string, action?: QAction) => {
			const alias = NAV_ALIAS[page];
			const id = (alias?.page ?? page) as BusinessPageId;
			const to = PAGE_PATH[id] ?? PAGE_PATH.dashboard;
			const hash = alias?.anchor ?? anchor;
			if (action) pendingAction = action;
			navigate({ to, hash: hash || undefined });
			window.scrollTo(0, 0);
			if (hash) {
				window.setTimeout(() => {
					document
						.getElementById(hash)
						?.scrollIntoView({ behavior: "smooth", block: "start" });
				}, 280);
			}
		},
		[navigate],
	);
}
