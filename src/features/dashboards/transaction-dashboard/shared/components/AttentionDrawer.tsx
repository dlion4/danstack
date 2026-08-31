import { useEffect, useRef, useState } from "react";
import {
	type AttentionItem,
	CROSS_PAGE_ATTENTION,
	type QuickActionItem,
} from "../data/attentionFeed";
import styles from "../styles/attentionDrawer.module.css";

/* ============================================================================
 * AttentionDrawer — monitor-style Action centre drawer
 * ----------------------------------------------------------------------------
 * Reused by every /pm/app transaction page. Tab 1 contains attention items
 * from all transaction pages, Tab 2 filters to the active page only.
 * `onAction` is called when an item/quick action is picked; pages close the
 * drawer and open the matching modal/wizard themselves.
 * ========================================================================== */

interface AttentionDrawerProps {
	open: boolean;
	onClose: () => void;
	onAction: (modal: string) => void;
	pageName: string;
	pageIcon: string;
	attention: AttentionItem[];
	suggestions: AttentionItem[];
	quickActions: QuickActionItem[];
	description?: string;
}

export default function AttentionDrawer({
	open,
	onClose,
	onAction,
	pageName,
	pageIcon,
	attention,
	suggestions,
	quickActions,
	description = "Resolve exceptions and then act on intelligent suggestions across the transaction dashboard.",
}: AttentionDrawerProps) {
	const [tab, setTab] = useState<"all" | "page">("all");
	const closeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!open) return;
		setTab("all");
		const previousOverflow = document.body.style.overflow;
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";
		const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = previousOverflow;
			window.cancelAnimationFrame(frame);
		};
	}, [open, onClose]);

	if (!open) return null;

	const crossPages = Array.from(
		new Set(
			CROSS_PAGE_ATTENTION.map((item) => item.page).filter(
				(page) => page !== pageName,
			),
		),
	);
	const crossGroups = crossPages.map((page) => ({
		page,
		pageIcon:
			CROSS_PAGE_ATTENTION.find((item) => item.page === page)?.pageIcon ??
			"bi-grid",
		items: CROSS_PAGE_ATTENTION.filter((item) => item.page === page),
	}));
	const allGroups = [
		{ page: pageName, pageIcon, items: attention },
		...crossGroups,
	];
	const totalOpen = allGroups.reduce(
		(total, group) => total + group.items.length,
		0,
	);

	const renderRow = (item: AttentionItem, key: string) => (
		<div key={key} className={styles.drawerItem}>
			<div className={styles.drawerItemMain}>
				<span
					className={styles.drawerItemIcon}
					style={{ background: item.iconBg, color: item.iconColor }}
				>
					<i className={`bi ${item.icon.replace(/^bi-/, "")}`} />
				</span>
				<div>
					<strong>{item.title}</strong>
					<span>{item.sub}</span>
				</div>
			</div>
			<button
				type="button"
				className={styles.drawerAction}
				onClick={() => onAction(item.modal)}
			>
				{item.actionLabel}
			</button>
		</div>
	);

	const renderEmpty = () => (
		<div className={styles.drawerEmpty}>
			<i className="bi bi-check2-circle" />
			<strong>All clear</strong>
			<span>No items need your attention right now.</span>
		</div>
	);

	return (
		<>
			<div
				className={styles.drawerBackdrop}
				onClick={onClose}
				aria-hidden="true"
			/>
			<div className={styles.drawerWrap}>
				<div
					className={styles.drawerPanel}
					role="dialog"
					aria-modal="true"
					aria-labelledby="action-centre-title"
				>
					<div className={styles.drawerHeader}>
						<div className={styles.drawerHeadMain}>
							<span className={styles.drawerIcon}>
								<i className="bi bi-exclamation-octagon" />
							</span>
							<div>
								<h2 id="action-centre-title" className={styles.drawerTitle}>
									Attention, suggestions &amp; quick actions
								</h2>
								<p className={styles.drawerSub}>{description}</p>
							</div>
						</div>
						<span className={`${styles.drawerBadge} ${styles.drawerBadgeWarn}`}>
							{totalOpen} open
						</span>
						<button
							ref={closeRef}
							type="button"
							className={styles.drawerClose}
							onClick={onClose}
							aria-label="Close action centre"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>

					<div className={styles.drawerTabs}>
						<div className={styles.drawerTabRow}>
							<button
								type="button"
								className={`${styles.drawerTab} ${
									tab === "all" ? styles.drawerTabActive : ""
								}`}
								onClick={() => setTab("all")}
							>
								All attention
								<span className={styles.drawerTabCount}>{totalOpen}</span>
							</button>
							<button
								type="button"
								className={`${styles.drawerTab} ${
									tab === "page" ? styles.drawerTabActive : ""
								}`}
								onClick={() => setTab("page")}
							>
								{pageName}
								<span className={styles.drawerTabCount}>
									{attention.length}
								</span>
							</button>
						</div>
					</div>

					{tab === "all" && (
						<div className={styles.drawerBody}>
							<div className={styles.drawerIntro}>
								<span className={styles.drawerIntroLabel}>
									Cross-page inbox
								</span>
								<p>
									Every item that needs attention across the transaction
									dashboard, grouped by source page.
								</p>
							</div>

							{allGroups.map((group) => (
								<section key={group.page} className={styles.drawerGroup}>
									<div className={styles.drawerGroupHead}>
										<span className={styles.drawerGroupBadge}>
											<i
												className={`bi ${group.pageIcon.replace(/^bi-/, "")}`}
											/>{" "}
											{group.page}
										</span>
										<span
											className={`${styles.drawerBadge} ${styles.drawerBadgeWarn}`}
										>
											{group.items.length} open
										</span>
									</div>
									<div className={styles.drawerList}>
										{group.items.map((item) =>
											renderRow(item, `${group.page}-${item.title}`),
										)}
										{group.items.length === 0 && renderEmpty()}
									</div>
								</section>
							))}
						</div>
					)}

					{tab === "page" && (
						<div className={styles.drawerBody}>
							<div className={styles.drawerIntro}>
								<span className={styles.drawerIntroLabel}>This page only</span>
								<p>
									{pageName} exceptions, smart suggestions and the workflows
									treasury uses most.
								</p>
							</div>

							<section className={styles.drawerGroup}>
								<div className={styles.drawerGroupHead}>
									<span className={styles.drawerGroupBadge}>
										<i className="bi bi-exclamation-circle" /> Attention
										required
									</span>
									<span
										className={`${styles.drawerBadge} ${styles.drawerBadgeWarn}`}
									>
										{attention.length} open
									</span>
								</div>
								<div className={styles.drawerList}>
									{attention.map((item) =>
										renderRow(item, `page-${item.title}`),
									)}
									{attention.length === 0 && renderEmpty()}
								</div>
							</section>

							<section className={styles.drawerGroup}>
								<div className={styles.drawerGroupHead}>
									<span className={styles.drawerGroupBadge}>
										<i className="bi bi-stars" /> Smart suggestions
									</span>
									<span
										className={`${styles.drawerBadge} ${styles.drawerBadgePurple}`}
									>
										{suggestions.length} suggestions
									</span>
								</div>
								<div className={styles.drawerList}>
									{suggestions.map((item) =>
										renderRow(item, `suggest-${item.title}`),
									)}
									{suggestions.length === 0 && renderEmpty()}
								</div>
							</section>

							<section className={styles.drawerGroup}>
								<div className={styles.drawerGroupHead}>
									<span className={styles.drawerGroupBadge}>
										<i className="bi bi-grid-3x3-gap" /> Quick actions
									</span>
									<span
										className={`${styles.drawerBadge} ${styles.drawerBadgeBlue}`}
									>
										{quickActions.length} shortcuts
									</span>
								</div>
								<div className={styles.drawerQuickGrid}>
									{quickActions.map((action) => (
										<button
											type="button"
											key={action.label}
											className={styles.drawerQuickBtn}
											onClick={() => onAction(action.modal)}
										>
											<span
												className={styles.drawerQuickBtnIcon}
												style={{ color: action.iconColor }}
											>
												<i
													className={`bi ${action.icon.replace(/^bi-/, "")}`}
												/>
											</span>
											{action.label}
										</button>
									))}
								</div>
							</section>
						</div>
					)}

					<div className={styles.drawerFooter}>
						<span className={styles.drawerFooterNote}>
							<i className="bi bi-activity" />
							{tab === "all"
								? `${allGroups.length} pages · ${totalOpen} items open`
								: `${attention.length} attention · ${suggestions.length} suggestions`}
						</span>
						<button
							type="button"
							className={styles.drawerAction}
							onClick={onClose}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
