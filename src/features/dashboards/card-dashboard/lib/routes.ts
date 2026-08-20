/* ============================================================================
 * routes.ts — TanStack URL map for the PayMo BAAS Cards pages.
 * ----------------------------------------------------------------------------
 * Mirrors the business-dashboard pattern: each page has a canonical URL path,
 * and the `useCardsNavigate()` hook wraps TanStack's `useNavigate()` so the
 * existing onNavigate contract (`setPage`) works seamlessly with deep links,
 * browser back/forward, and sidebar state — all without touching page designs.
 *
 * NOTE: inside the danstack monorepo the card pages live under the
 * "/cards/app" layout route (routes/cards/app.tsx), so every path here is
 * prefixed accordingly. The internal page ids ("5.1" … "5.10") are unchanged.
 * ========================================================================== */

import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export type CardsPageId =
	| "5.1"
	| "5.2"
	| "5.3"
	| "5.4"
	| "5.5"
	| "5.6"
	| "5.7"
	| "5.8"
	| "5.9"
	| "5.10";

export const CARDS_PAGE_PATH: Record<CardsPageId, string> = {
	"5.1": "/cards/app",
	"5.2": "/cards/app/physical-debit-cards",
	"5.3": "/cards/app/virtual-debit-cards",
	"5.4": "/cards/app/virtual-credit-cards",
	"5.5": "/cards/app/prepaid-card-management",
	"5.6": "/cards/app/corporate-business-cards",
	"5.7": "/cards/app/card-security-fraud-prevention",
	"5.8": "/cards/app/card-analytics-reporting",
	"5.9": "/cards/app/card-program-administration",
	"5.10": "/cards/app/card-settings-support",
};

/** Map a URL path back to the internal page id. */
export function pathToCardsPage(path: string): CardsPageId {
	if (!path) return "5.1";
	if (path.startsWith("/cards/app/card-settings-support")) return "5.10";
	if (path.startsWith("/cards/app/card-program-administration")) return "5.9";
	if (path.startsWith("/cards/app/card-analytics-reporting")) return "5.8";
	if (path.startsWith("/cards/app/card-security-fraud-prevention")) return "5.7";
	if (path.startsWith("/cards/app/corporate-business-cards")) return "5.6";
	if (path.startsWith("/cards/app/prepaid-card-management")) return "5.5";
	if (path.startsWith("/cards/app/virtual-credit-cards")) return "5.4";
	if (path.startsWith("/cards/app/virtual-debit-cards")) return "5.3";
	if (path.startsWith("/cards/app/physical-debit-cards")) return "5.2";
	return "5.1";
}

/**
 * Hook that returns a `navigateTo(pageId, anchor?)` callback matching the
 * existing `setPage` + scroll contract used throughout the app.
 */
export function useCardsNavigate() {
	const navigate = useNavigate();

	return useCallback(
		(page: CardsPageId | string, anchor?: string) => {
			const id = page as CardsPageId;
			const to = CARDS_PAGE_PATH[id] ?? CARDS_PAGE_PATH["5.1"];
			navigate({ to, hash: anchor || undefined });
			window.scrollTo(0, 0);
			if (anchor) {
				window.setTimeout(() => {
					document
						.getElementById(anchor)
						?.scrollIntoView({ behavior: "smooth", block: "start" });
				}, 120);
			}
		},
		[navigate],
	);
}
