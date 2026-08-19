/* ============================================================================
 * BusinessHome.tsx — the /business home rendered inside the BusinessShell outlet.
 * ----------------------------------------------------------------------------
 * Surfaces the business overview (hero + key stats) and a grid of every
 * navigable business module. Page visuals live in the local
 * businessLayout.module.css (PayMo Business theme) under the `c.*` classes.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useBusinessShell } from "../data/businessLayoutContext";
import {
	cx,
	fetchBusinessLayoutContent,
	initialMockData,
} from "../data/businessLayoutData";
import c from "../styles/businessLayout.module.css";

/* Home module cards -> the real routed BAAS workspaces. */
const HOME_PATH = {
	dashboard: "/business-dashboard",
	insights: "/business-dashboard/financial-reporting",
	cash: "/business-dashboard/treasury-cash",
	movements: "/business-dashboard/bulk-disbursements",
	billing: "/business-dashboard/invoicing-billing",
	vendors: "/business-dashboard/accounts-payable",
	payroll: "/business-dashboard/payroll-hr",
	forecast: "/business-dashboard/financial-reporting",
	tax: "/business-dashboard/financial-reporting",
	compliance: "/business-dashboard/business-onboarding",
	integrations: "/business-dashboard/apps-integrations",
	team: "/business-dashboard/settings-administration",
	settings: "/business-dashboard/settings-administration",
} as const;

type HomePath = (typeof HOME_PATH)[keyof typeof HOME_PATH];

function homePath(key: string): HomePath {
	return HOME_PATH[key as keyof typeof HOME_PATH] ?? "/business-dashboard";
}

export default function BusinessHome() {
	const { showToast } = useBusinessShell();

	const { data } = useQuery({
		queryKey: ["business-layout-content"],
		queryFn: fetchBusinessLayoutContent,
		staleTime: 5 * 60_000,
	});
	const content = data ?? initialMockData;

	const home = content.modules[0];
	const quickLinks = content.modules.filter((m) => m.key !== home?.key);

	const handleAction = (label: string) =>
		showToast({
			message: `"${label}" opened.`,
			type: "info",
			title: "Quick action",
		});

	if (!home) return null;

	return (
		<div className={c.pageWrap}>
			{/* ---------- hero ---------- */}
			<section
				className={c.hero}
				style={{ "--mod-c1": home.c1, "--mod-c2": home.c2 } as CSSProperties}
			>
				<div className={c.heroAccent} />
				<div className={c.heroInner}>
					<span className={c.pill}>
						<span className={c.pillDot} /> {home.pill}
					</span>
					<h1 className={c.heroTitle}>
						{home.titlePre}
						<span className={c.textGradient}>{home.titleAccent}</span>
					</h1>
					<p className={c.heroCopy}>{home.copy}</p>
					<div className={c.heroActions}>
						{home.actions.map((action) => (
							<button
								key={action.label}
								type="button"
								className={
									action.tone === "primary" ? c.btnPrimary : c.btnGhost
								}
								onClick={() => handleAction(action.label)}
							>
								<i className={`bi ${action.icon}`} /> {action.label}
							</button>
						))}
					</div>
				</div>
			</section>

			{/* ---------- stats ---------- */}
			<div className={c.statsGrid}>
				{home.stats.map((stat) => (
					<div className={c.statCard} key={stat.label}>
						<div className={c.statLabel}>{stat.label}</div>
						<div className={c.statValue}>{stat.value}</div>
						{stat.delta && (
							<div className={cx(c.statDelta, stat.up ? c.up : c.down)}>
								<i
									className={
										stat.up ? "bi bi-arrow-up-right" : "bi bi-arrow-down-right"
									}
								/>
								{stat.delta}
							</div>
						)}
					</div>
				))}
			</div>

			{/* ---------- module grid ---------- */}
			<section className={c.sectionCard}>
				<div className={c.sectionHead}>
					<div>
						<h2 className={c.sectionTitle}>
							<i className="bi bi-grid-1x2" /> Your workspaces
						</h2>
						<p className={c.sectionSub}>
							Jump straight into any business module.
						</p>
					</div>
				</div>
				<div className={c.moduleGrid}>
					{quickLinks.map((mod) => (
						<Link
							key={mod.key}
							to={homePath(mod.key)}
							className={c.moduleCard}
						>
							<span
								className={c.moduleIcon}
								style={{
									background: `linear-gradient(135deg, ${mod.c1}, ${mod.c2})`,
								}}
							>
								<i className={`bi ${mod.icon}`} />
							</span>
							<h3 className={c.moduleTitle}>{mod.label}</h3>
							<p className={c.moduleDesc}>{mod.copy}</p>
							<div className={c.moduleFoot}>
								<span
									className={cx(c.badgeMini, c.badgeSoft)}
									style={{ fontSize: "0.68rem" }}
								>
									{mod.pill}
								</span>
								<i className={cx("bi bi-arrow-right", c.moduleArrow)} />
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
