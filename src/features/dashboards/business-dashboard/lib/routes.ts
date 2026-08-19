/* ============================================================================\n * routes.ts — TanStack URL map for the designed PayMo Business pages.
 * ----------------------------------------------------------------------------
 * Root.tsx used to switch modules with useState. Each designed App already
 * accepts `onNavigate(pageId, anchor?, action?)` — we keep that contract and
 * send it through the router so deep links, back/forward and the sidebar all
 * stay in sync without touching page designs.
 * ========================================================================== */

import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import type { QAction } from "../lib";

export type BusinessPageId =
	| "dashboard"
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
const NAV_ALIAS: Record<string, { page: BusinessPageId; anchor?: string }> = {};

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
