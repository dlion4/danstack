/* ============================================================================
 * CardsHome.tsx — the /app/card-overview home rendered inside CardsShell outlet.
 * ----------------------------------------------------------------------------
 * Surfaces the card operating overview and a grid of every navigable module.
 * Uses the same initialMockData the shell loads (kept in sync via TanStack Query's cache).
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useCardsShell } from "../data/cardsLayoutContext";
import {
	cx,
	fetchCardsLayoutContent,
	findModule,
	initialMockData,
} from "../data/cardsLayoutData";
import cardsPage from "../styles/cardsLayout.module.css";

const c = cardsPage as Record<string, string>;

export default function CardsHome() {
	const { showToast } = useCardsShell();

	const { data } = useQuery({
		queryKey: ["cards-layout-content"],
		queryFn: fetchCardsLayoutContent,
		staleTime: 5 * 60_000,
	});
	const content = data ?? initialMockData;

	const home = findModule(content, "card-overview");
	const quickLinks = content.modules.filter((m) => m.key !== "card-overview");

	const handleAction = (label: string) =>
		showToast({
			message: `"${label}" opened.`,
			type: "info",
			title: "Quick action",
		});

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
						<button
							type="button"
							className={c.btnPrimary}
							onClick={() => handleAction("Issue card")}
						>
							<i className="bi bi-plus-lg" /> Issue card
						</button>
						<button
							type="button"
							className={c.btnGhost}
							onClick={() => handleAction("Export statement")}
						>
							<i className="bi bi-download" /> Export statement
						</button>
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
						<p className={c.sectionSub}>Jump straight into any card module.</p>
					</div>
				</div>
				<div className={c.moduleGrid}>
					{quickLinks.map((mod) => (
						<Link
							key={mod.key}
							to="/cards-shell/$section"
							params={{ section: mod.key }}
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
