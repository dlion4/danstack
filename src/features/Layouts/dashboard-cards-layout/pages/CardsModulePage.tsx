/* ============================================================================
 * CardsModulePage.tsx — generic /app/$section destination for cards layout.
 * ----------------------------------------------------------------------------
 * Every sidebar entry resolves here. It reads the section param, finds the
 * matching module def, and renders a hero + stats + features + actions. If the
 * section is unknown it renders a friendly empty state (never a broken page).
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

interface CardsModulePageProps {
	section: string;
}

export default function CardsModulePage({ section }: CardsModulePageProps) {
	const { showToast, openAside } = useCardsShell();

	const { data } = useQuery({
		queryKey: ["cards-layout-content"],
		queryFn: fetchCardsLayoutContent,
		staleTime: 5 * 60_000,
	});
	const content = data ?? initialMockData;
	const mod = findModule(content, section);

	const isSecurity = section === "security";
	const isCardProgram = section === "cardProgram";

	const handleAction = (label: string) =>
		showToast({ message: `"${label}" opened.`, type: "info", title: "Action" });

	return (
		<div className={c.pageWrap}>
			{/* ---------- hero ---------- */}
			<section
				className={c.hero}
				style={{ "--mod-c1": mod.c1, "--mod-c2": mod.c2 } as CSSProperties}
			>
				<div className={c.heroAccent} />
				<div className={c.heroInner}>
					<span className={c.pill}>
						<span className={c.pillDot} /> {mod.pill}
					</span>
					<h1 className={c.heroTitle}>
						{mod.titlePre}
						<span className={c.textGradient}>{mod.titleAccent}</span>
					</h1>
					<p className={c.heroCopy}>{mod.copy}</p>
					<div className={c.heroActions}>
						{mod.actions.map((action) => (
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
						{isSecurity && (
							<button
								type="button"
								className={c.btnGhost}
								onClick={() => openAside("security")}
							>
								<i className="bi bi-shield-check" /> Open security
							</button>
						)}
						{isCardProgram && (
							<button
								type="button"
								className={c.btnGhost}
								onClick={() => openAside("cardProgram")}
							>
								<i className="bi bi-gear" /> Open card program
							</button>
						)}
					</div>
				</div>
			</section>

			{/* ---------- stats ---------- */}
			<div className={c.statsGrid}>
				{mod.stats.map((stat) => (
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

			{/* ---------- features ---------- */}
			<section className={c.sectionCard}>
				<div className={c.sectionHead}>
					<div>
						<h2 className={c.sectionTitle}>
							<i className={`bi ${mod.icon}`} /> {mod.label} capabilities
						</h2>
						<p className={c.sectionSub}>What you can do from here.</p>
					</div>
				</div>
				<div className={c.featureList}>
					{mod.features.map((feat) => (
						<div className={c.featureItem} key={feat.text}>
							<span className={c.featureIcon}>
								<i className={`bi ${feat.icon}`} />
							</span>
							<span>{feat.text}</span>
						</div>
					))}
				</div>
			</section>

			{/* ---------- back link ---------- */}
			<div className={c.actionRow}>
				<Link
					to="/cards-shell"
					className={c.btnLink}
					style={{ textDecoration: "none" }}
				>
					<i className="bi bi-arrow-left" /> Back to overview
				</Link>
			</div>
		</div>
	);
}
