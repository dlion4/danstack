/* ============================================================================
 * businessLayoutContext.ts — bridge between the BusinessShell chrome and pages.
 * ----------------------------------------------------------------------------
 * The shell owns toast + right-aside state. Pages rendered inside <Outlet />
 * can call useBusinessShell() to push a toast or open a panel — same contract
 * as the cards layout useCardsShell() and the dev layout useDevShell().
 * ========================================================================== */
import { createContext, useContext, useEffect } from "react";
import type { AsideKind, ToastTone } from "./businessLayoutData";

export interface ToastInput {
	message: string;
	type?: ToastTone;
	title?: string;
}

/* ---------------------------------------------------------------------------
 * PAGE ACTIONS — the legacy `pm-page-bar` action buttons.
 * ---------------------------------------------------------------------------
 * Each legacy business HTML page rendered 3–4 primary action buttons inside its
 * page bar, e.g. 3.1 had
 *     <button class="pm-btn" onclick="openModal('consolidatedReportModal')">
 * When the shell took ownership of the page bar (breadcrumb + title) those
 * buttons were dropped, silently removing ~50 modal entry points.
 *
 * Pages now re-publish them through this context: the page owns the modal
 * state (`setActiveModal`) and registers the button list on mount; the shell's
 * <BusinessPageBar> renders them next to the title, exactly where the legacy
 * markup had them. `useBusinessPageActions()` handles register + cleanup.
 * ------------------------------------------------------------------------- */
export type PageActionTone =
	| "default"
	| "primary"
	| "dark"
	| "accent"
	| "danger";

export interface BusinessPageAction {
	/** Bootstrap icon class, e.g. "bi-plus-lg". */
	icon: string;
	label: string;
	tone?: PageActionTone;
	onClick: () => void;
}

export interface BusinessShellContextValue {
	showToast: (toast: ToastInput | string) => void;
	openAside: (kind: AsideKind) => void;
	/** Publish/replace the current page's page-bar actions. */
	setPageActions: (actions: BusinessPageAction[]) => void;
}

export const BusinessShellContext =
	createContext<BusinessShellContextValue | null>(null);

export function useBusinessShell(): BusinessShellContextValue {
	const ctx = useContext(BusinessShellContext);
	if (!ctx) {
		throw new Error(
			"useBusinessShell() must be used inside <BusinessShell> (BusinessShellContext provider).",
		);
	}
	return ctx;
}

/* ---------------------------------------------------------------------------
 * useBusinessPageActions(actions, deps)
 * ---------------------------------------------------------------------------
 * LEGACY BRIDGE for the `pm-page-bar` buttons. Call it from a page with the
 * button list; it publishes them to the shell for as long as the page is
 * mounted and clears them on unmount so the next route starts clean.
 *
 * `deps` should contain whatever the click handlers close over (normally just
 * the page's `setActiveModal` setter, which is stable) — the list itself is a
 * fresh array on every render, so we deliberately do not depend on it.
 * ------------------------------------------------------------------------- */
export function useBusinessPageActions(
	actions: BusinessPageAction[],
	deps: unknown[] = [],
): void {
	const ctx = useContext(BusinessShellContext);
	const setPageActions = ctx?.setPageActions;
	useEffect(() => {
		if (!setPageActions) return undefined;
		setPageActions(actions);
		return () => setPageActions([]);
		// biome-ignore lint/correctness/useExhaustiveDependencies: `actions` is
		// re-created each render by design; the caller passes the real deps.
	}, [setPageActions, ...deps]);
}
