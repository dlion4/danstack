/* ============================================================================
 * BusinessPageBar.tsx — shell-owned breadcrumb + page title + page actions.
 * ----------------------------------------------------------------------------
 * Replaces the per-page `pm-page-bar` blocks that the shell-child refactor
 * removed. Rendering it here (driven by businessPageMeta) keeps the 14 child
 * pages pure content while restoring the breadcrumb/title/subtitle the legacy
 * HTML had.
 *
 * ACTIONS: the legacy pages also rendered 3–4 primary buttons on the right of
 * this bar, e.g. 3.1's
 *     <button class="pm-btn" onclick="openModal('consolidatedReportModal')">
 * Those are published by the active page through useBusinessPageActions() and
 * rendered here, so every legacy entry point keeps working.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";

import type { BusinessPageAction } from "../data/businessLayoutContext";
import {
	BUSINESS_ROOT_CRUMB,
	type BusinessPageMeta,
} from "../data/businessPageMeta";
import styles from "../styles/businessLayout.module.css";

const s = styles as Record<string, string>;

const TONE_CLASS: Record<string, string> = {
	default: "",
	primary: "pageActionPrimary",
	dark: "pageActionDark",
	accent: "pageActionAccent",
	danger: "pageActionDanger",
};

interface BusinessPageBarProps {
	meta: BusinessPageMeta;
	actions?: BusinessPageAction[];
}

export default function BusinessPageBar({
	meta,
	actions = [],
}: BusinessPageBarProps) {
	return (
		<div className={s.pageBar}>
			<div className={s.pageBarMain}>
				<div className={s.pageBarText}>
					<nav className={s.pageBreadcrumb} aria-label="Breadcrumb">
						<Link to="/business-dashboard">{BUSINESS_ROOT_CRUMB}</Link>
						{meta.section && (
							<>
								<span aria-hidden="true"> / </span>
								<span>{meta.section}</span>
							</>
						)}
						<span aria-hidden="true"> / </span>
						<strong>{meta.title}</strong>
					</nav>
					<h1 className={s.pageHeading}>{meta.heading}</h1>
					<p className={s.pageSubtitle}>{meta.subtitle}</p>
				</div>

				{actions.length > 0 && (
					<div className={s.pageActions}>
						{actions.map((action) => (
							<button
								key={action.label}
								type="button"
								className={`${s.pageAction} ${
									s[TONE_CLASS[action.tone ?? "default"]] ?? ""
								}`}
								onClick={action.onClick}
							>
								<i className={`bi ${action.icon}`} aria-hidden="true" />
								<span>{action.label}</span>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
