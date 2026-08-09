/* ============================================================================
 * Dashboard.tsx — the /app home overview rendered inside the AppShell outlet.
 * ----------------------------------------------------------------------------
 * Surfaces the operating overview (balances, volume, success) and a grid of
 * every navigable module so the home view is never empty. Renders directly
 * from the same bundled initialMockData the shell uses (no backend in demo).
 * ========================================================================== */

import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useShell } from "../data/shellContext";
import { cx, initialMockData, placeholderModule } from "../data/shellData";
import dash from "../styles/dashboard.module.css";
import shell from "../styles/shell.module.css";

const d = dash as Record<string, string>;
const s = shell as Record<string, string>;

export default function Dashboard() {
	const { showToast } = useShell();

	/* No backend exists — render straight from the bundled mock data. */
	const content = initialMockData;

	const modules = content.modules ?? [];
	const home = modules[0] ?? placeholderModule; // dashboard module def
	const quickLinks = modules.filter((m) => m.key !== "dashboard");

	const handleAction = (label: string) =>
		showToast({
			message: `"${label}" opened.`,
			type: "info",
			title: "Quick action",
		});

	return (
		<div className={d.pageWrap}>
			{/* ---------- hero ---------- */}
			<section
				className={d.hero}
				style={{ "--mod-c1": home.c1, "--mod-c2": home.c2 } as CSSProperties}
			>
				<div className={d.heroAccent} />
				<div className={d.heroInner}>
					<span className={d.pill}>
						<span className={d.pillDot} /> {home.pill}
					</span>
					<h1 className={d.heroTitle}>
						{home.titlePre}
						<span className={s.textGradient}>{home.titleAccent}</span>
					</h1>
					<p className={d.heroCopy}>{home.copy}</p>
					<div className={d.heroActions}>
						<button
							type="button"
							className={s.btnPrimary}
							onClick={() => handleAction("New transfer")}
						>
							<i className="bi bi-plus-lg" /> New transfer
						</button>
						<button
							type="button"
							className={s.btnGhost}
							onClick={() => handleAction("Export statement")}
						>
							<i className="bi bi-download" /> Export statement
						</button>
					</div>
				</div>
			</section>

			{/* ---------- stats ---------- */}
			<div className={d.statsGrid}>
				{home.stats.map((stat) => (
					<div className={d.statCard} key={stat.label}>
						<div className={d.statLabel}>{stat.label}</div>
						<div className={d.statValue}>{stat.value}</div>
						{stat.delta && (
							<div className={cx(d.statDelta, stat.up ? d.up : d.down)}>
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
			<section className={d.sectionCard}>
				<div className={d.sectionHead}>
					<div>
						<h2 className={d.sectionTitle}>
							<i className="bi bi-grid-1x2" /> Your workspaces
						</h2>
						<p className={d.sectionSub}>Jump straight into any module.</p>
					</div>
				</div>
				{quickLinks.length === 0 ? (
					<p className={d.sectionSub}>
						Workspace modules are being wired up — check back soon.
					</p>
				) : (
					<div className={d.moduleGrid}>
						{quickLinks.map((mod) => (
							<Link
								key={mod.key}
								to="/pm/app/$section"
								params={{ section: mod.key }}
								className={d.moduleCard}
							>
								<span
									className={d.moduleIcon}
									style={{
										background: `linear-gradient(135deg, ${mod.c1}, ${mod.c2})`,
									}}
								>
									<i className={`bi ${mod.icon}`} />
								</span>
								<h3 className={d.moduleTitle}>{mod.label}</h3>
								<p className={d.moduleDesc}>{mod.copy}</p>
								<div className={d.moduleFoot}>
									<span
										className={
											s.badgeSoft ? cx(s.badgeMini, s.badgeSoft) : s.badgeMini
										}
										style={{ fontSize: "0.68rem" }}
									>
										{mod.pill}
									</span>
									<i className={cx("bi bi-arrow-right", d.moduleArrow)} />
								</div>
							</Link>
						))}
					</div>
				)}
			</section>
		</div>
	);
