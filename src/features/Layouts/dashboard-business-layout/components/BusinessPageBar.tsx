/* ============================================================================
 * BusinessPageBar.tsx — shell-owned breadcrumb + page title strip.
 * ----------------------------------------------------------------------------
 * Replaces the per-page `pageBar` blocks that the shell-child refactor removed.
 * Rendering it here (driven by businessPageMeta) keeps the 14 child pages pure
 * content while restoring the breadcrumb/title/subtitle the legacy HTML had.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";

import {
	BUSINESS_ROOT_CRUMB,
	type BusinessPageMeta,
} from "../data/businessPageMeta";
import s from "../styles/businessLayout.module.css";

interface BusinessPageBarProps {
	meta: BusinessPageMeta;
}

export default function BusinessPageBar({ meta }: BusinessPageBarProps) {
	return (
		<div className={s.pageBar}>
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
	);
}
