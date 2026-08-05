/* ============================================================================
 * CardsHeader.tsx — fixed top header for the Paymo BAAS Cards Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-header.*
 * LEGACY BRIDGE: the dropdowns (notifications, user) and the aside-opener
 *   (cardProgram, security) are kept, with dropdown open state lifted into
 *   the shell and passed down. Click-outside + Escape are handled in CardsShell.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";
import type { AsideKind, CardsLayoutContent } from "../data/cardsLayoutData";
import { cx, linkedAccounts } from "../data/cardsLayoutData";
import styles from "../styles/cardsLayout.module.css";

const s = styles as Record<string, string>;

export type DropdownName = "accounts" | "notifications" | "user";

interface CardsHeaderProps {
	content: CardsLayoutContent;
	expanded: boolean;
	openDropdown: DropdownName | null;
	onToggleSidebar: () => void;
	onToggleDropdown: (name: DropdownName) => void;
	onOpenAside: (kind: AsideKind) => void;
	onLogout: () => void;
	onSearchSubmit: (query: string) => void;
	unreadCount: number;
}

export default function CardsHeader({
	content,
	expanded,
	openDropdown,
	onToggleSidebar,
	onToggleDropdown,
	onOpenAside,
	onLogout,
	onSearchSubmit,
	unreadCount,
}: CardsHeaderProps) {
	const isDropdownOpen = (name: DropdownName) => openDropdown === name;

	return (
		<header className={cx(s.topHeader, expanded && s.sidebarExpanded)}>
			{/* ---------- left: toggle + search ---------- */}
			<div className={s.headerLeft}>
				<button
					type="button"
					className={s.sidebarToggle}
					onClick={onToggleSidebar}
					aria-label="Toggle sidebar"
				>
					<i className="bi bi-list" />
				</button>
				<form
					className={cx(s.globalSearch, "d-none d-md-block")}
					role="search"
					onSubmit={(e) => {
						e.preventDefault();
						onSearchSubmit(new FormData(e.currentTarget).get("q") as string);
					}}
				>
					<i className={cx("bi bi-search", s.searchIcon)} />
					<input
						type="text"
						name="q"
						className={s.searchInput}
						placeholder="Search cards, holders, transactions…"
						aria-label="Search"
					/>
				</form>
			</div>

			{/* ---------- right: actions ---------- */}
			<div className={s.headerActions}>
									{/* ===== Accounts dropdown ===== */}
					<div className={cx(s.dropdownWrap, "position-relative")} data-dropdown="accounts">
						<button
							type="button"
							className={s.accountChip}
							aria-expanded={isDropdownOpen("accounts")}
							aria-haspopup="menu"
							aria-label="Linked accounts"
							onClick={() => onToggleDropdown("accounts")}
						>
							<i className="bi bi-layers" />
							<span>Accounts</span>
							<i className={cx("bi bi-chevron-down", s.chev)} style={{ fontSize: "0.7rem" }} />
						</button>
						{isDropdownOpen("accounts") && (
							<div className={cx(s.dropdownPanel, s.show)} role="menu">
								<div className={s.panelHeader}>
									<span className={s.panelTitle}>Linked Accounts</span>
									<span className={cx(s.badgeMini, s.badgeOk)}>
										{linkedAccounts.filter((a) => a.linked).length} / {linkedAccounts.length} linked
									</span>
								</div>
								<div className={s.panelBody}>
									{linkedAccounts.map((acc) => (
										<div className={s.accountRowLinked} key={acc.key}>
											<div className={s.accountRowLinkedLeft}>
												<span className={s.accountRowLinkedIcon}>
													<i className={`bi ${acc.icon}`} />
												</span>
												<div>
													<div className={s.accountRowLinkedLabel}>{acc.label}</div>
													{acc.linked && acc.id && (
														<div className={s.accountRowLinkedId}>{acc.id}</div>
													)}
												</div>
											</div>
											<span className={cx(s.badgeLinked, acc.linked ? s.linked : s.notLinked)}>
												<span className={s.badgeDot} />
												{acc.linked ? "Linked" : "Not linked"}
											</span>
										</div>
									))}
								</div>
								<div className={cx(s.panelFooter, "d-flex justify-content-between")}>
									<div className={s.accountActions}>
										<button type="button" className={s.btnLinkAccount} onClick={() => onToggleDropdown("accounts")}>
											<i className="bi bi-link-45deg" /> Link Account
										</button>
										<button type="button" className={s.btnUnlinkAccount} onClick={() => onToggleDropdown("accounts")}>
											<i className="bi bi-link-break" /> Unlink Account
										</button>
									</div>
								</div>
							</div>
						)}
					</div>

{/* Card Program */}
				<button
					type="button"
					className={s.headerAction}
					onClick={() => onOpenAside("cardProgram")}
					aria-label="Card program settings"
					title="Card Program"
				>
					<i className={cx("bi bi-gear", s.actionIcon)} />
				</button>

				{/* API Keys — opens left drawer */}
				<button
					type="button"
					className={s.headerAction}
					onClick={() => onOpenAside("apiKeysTab")}
					title="API Keys"
				>
					<i className={cx("bi bi-key", s.actionIcon)} />
				</button>

				{/* Security Center — opens left drawer */}
				<button
					type="button"
					className={s.headerAction}
					onClick={() => onOpenAside("securityTab")}
					title="Security Center"
				>
					<i className={cx("bi bi-shield-lock", s.actionIcon)} />
				</button>

				<div className={cx(s.vr, "d-none d-lg-block")} />

				{/* Notifications dropdown */}
				<div className={s.dropdownWrap}>
					<button
						type="button"
						className={s.headerAction}
						aria-expanded={isDropdownOpen("notifications")}
						aria-haspopup="menu"
						aria-label={`Notifications, ${unreadCount} unread`}
						onClick={() => onToggleDropdown("notifications")}
					>
						<i className={cx("bi bi-bell", s.actionIcon)} />
						{unreadCount > 0 && (
							<span className={s.headerBadge}>{unreadCount}</span>
						)}
					</button>
					{isDropdownOpen("notifications") && (
						<div className={cx(s.dropdownPanel, s.show)} role="menu">
							<div className={s.panelHeader}>
								<span className={s.panelTitle}>Card Alerts</span>
								<span className={cx(s.badgeMini, s.badgeSoft)}>
									{unreadCount} new
								</span>
							</div>
							<div className={s.panelBody}>
								{content.notifications.map((n) => (
									<div
										className={cx(s.notificationItem, n.unread && s.unread)}
										key={n.id}
									>
										<div className={cx(s.notificationIcon, s[n.tone])}>
											<i className={`bi ${n.icon}`} />
										</div>
										<div className={s.notificationBody}>
											<div className="d-flex align-items-start gap-2">
												<span className={s.notificationTitle}>{n.title}</span>
												{n.unread && <span className={s.notificationDot} />}
											</div>
											<div className={s.notificationDesc}>{n.desc}</div>
										</div>
										<span className={s.notificationTime}>{n.time}</span>
									</div>
								))}
							</div>
							<div className={cx(s.panelFooter, "text-center")}>
								<Link
									to="/pm/app/$section"
									params={{ section: "card-transactions" }}
									className={cx(s.btnLink, s.btnLinkPrimary)}
								>
									View all notifications
								</Link>
							</div>
						</div>
					)}
				</div>

				{/* User dropdown */}
				<div className={s.dropdownWrap}>
					<button
						type="button"
						className={s.userTrigger}
						aria-expanded={isDropdownOpen("user")}
						aria-haspopup="menu"
						aria-label="Account menu"
						onClick={() => onToggleDropdown("user")}
					>
						<div className={s.userAvatar}>{content.user.initials}</div>
						<div className={s.userMeta}>
							<div className={s.userName}>{content.user.name}</div>
							<div className={s.userRole}>{content.user.role}</div>
						</div>
						<i className={cx("bi bi-chevron-down", s.chev)} />
					</button>
					{isDropdownOpen("user") && (
						<div
							className={cx(s.dropdownPanel, s.show)}
							role="menu"
							style={{ width: 280 }}
						>
							<div
								className="d-flex align-items-center gap-3 p-3"
								style={{ borderBottom: "1px solid var(--cl-border)" }}
							>
								<div
									className={s.userAvatar}
									style={{ width: 46, height: 46, fontSize: "1rem" }}
								>
									{content.user.initials}
								</div>
								<div>
									<div className={s.userName}>{content.user.name}</div>
									<div
										style={{ fontSize: "0.75rem", color: "var(--cl-muted)" }}
									>
										{content.user.email}
									</div>
								</div>
							</div>
							<div className={s.panelBody}>
								<div className="d-flex flex-column">
									<button
										type="button"
										className={s.menuItem}
										onClick={() => onToggleDropdown("user")}
									>
										<i className="bi bi-person" /> Profile
									</button>
									<button
										type="button"
										className={s.menuItem}
										onClick={() => onToggleDropdown("user")}
									>
										<i className="bi bi-gear" /> Settings
									</button>
									<button
										type="button"
										className={s.menuItem}
										onClick={() => onOpenAside("security")}
									>
										<i className="bi bi-shield-check" /> Security
									</button>
								</div>
							</div>
							<div className={s.panelFooter}>
								<button
									type="button"
									className={cx(s.btnDanger, "w-100")}
									onClick={onLogout}
								>
									<i className="bi bi-box-arrow-right" /> Log out
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
