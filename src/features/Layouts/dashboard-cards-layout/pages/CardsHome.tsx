/* ============================================================================
 * CardsHome.tsx — the /app/card-overview home rendered inside CardsShell outlet.
 * ----------------------------------------------------------------------------
 * Surfaces the card operating overview and a grid of every navigable module.
 * Uses the same initialMockData the shell loads (kept in sync via TanStack Query's cache).
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import shellDash from "../../shell/styles/dashboard.module.css";
import { useCardsShell } from "../data/cardsLayoutContext";
import {
	cx,
	fetchCardsLayoutContent,
	findModule,
	initialMockData,
} from "../data/cardsLayoutData";
import cardsPage from "../styles/cardsLayout.module.css";

const c = cardsPage as Record<string, string>;
const d = shellDash as Record<string, string>;

/* Module key -> static route (the cards shell routes one static page per module,
   mirroring src/routes/cards/app/*). Unknown keys fall back to the overview. */
const MODULE_PATH = {
	"card-overview": "/cards/app",
	"card-command-center": "/cards/app/card-command-center",
	"virtual-debit-cards": "/cards/app/virtual-debit-cards",
	"virtual-credit-cards": "/cards/app/virtual-credit-cards",
	"physical-debit-cards": "/cards/app/physical-debit-cards",
	"prepaid-card-management": "/cards/app/prepaid-card-management",
	"corporate-business-cards": "/cards/app/corporate-business-cards",
	"card-security-fraud-prevention": "/cards/app/card-security-fraud-prevention",
	"card-analytics-reporting": "/cards/app/card-analytics-reporting",
	"card-program-administration": "/cards/app/card-program-administration",
	"card-settings-support": "/cards/app/card-settings-support",
} as const;

type ModulePath = (typeof MODULE_PATH)[keyof typeof MODULE_PATH];

function modulePath(key: string): ModulePath {
	return MODULE_PATH[key as keyof typeof MODULE_PATH] ?? "/cards/app";
}

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
						<span className={c.textGradient}>{home.titleAccent}</span>
					</h1>
					<p className={d.heroCopy}>{home.copy}</p>
					<div className={d.heroActions}>
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
						<p className={d.sectionSub}>Jump straight into any card module.</p>
					</div>
				</div>
				<div className={d.moduleGrid}>
					{quickLinks.map((mod) => (
						<Link
							key={mod.key}
							to={modulePath(mod.key)}
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
									className={cx(c.badgeMini, c.badgeSoft)}
									style={{ fontSize: "0.68rem" }}
								>
									{mod.pill}
								</span>
								<i className={cx("bi bi-arrow-right", d.moduleArrow)} />
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
