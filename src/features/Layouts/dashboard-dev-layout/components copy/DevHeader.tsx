/* ============================================================================
 * DevHeader.tsx — fixed top header for the Paymo BAAS Developer Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-dev-header.*
 * LEGACY BRIDGE: dropdowns (notifications, user) and the aside-openers
 *   (apiExplorer, systemStatus, apiKeys) are kept, with dropdown open state
 *   lifted into the shell and passed down. Click-outside + Escape live in
 *   DevShell. The SANDBOX pill + dev search placeholder come from the design.
 * ========================================================================== */
import { Link } from "@tanstack/react-router";
import type { AsideKind, DevLayoutContent } from "../data/devLayoutData";
import { cx, linkedAccounts } from "../data/devLayoutData";
import styles from "../styles/devLayout.module.css";

const s = styles as Record<string, string>;

export type DropdownName = "accounts" | "notifications" | "user";

interface DevHeaderProps {
        content: DevLayoutContent;
        expanded: boolean;
        openDropdown: DropdownName | null;
        onToggleSidebar: () => void;
        onToggleDropdown: (name: DropdownName) => void;
        onOpenAside: (kind: AsideKind) => void;
        onLogout: () => void;
        onSearchSubmit: (query: string) => void;
        unreadCount: number;
}

export default function DevHeader({
        content,
        expanded,
        openDropdown,
        onToggleSidebar,
        onToggleDropdown,
        onOpenAside,
        onLogout,
        onSearchSubmit,
        unreadCount,
}: DevHeaderProps) {
        const isDropdownOpen = (name: DropdownName) => openDropdown === name;

        return (
                <header className={cx(s["top-header"], expanded && s["sidebar-expanded"])}>
                        {/* ---------- left: toggle + sandbox pill + search ---------- */}
                        <div className="d-flex align-items-center gap-3">
                                <button
                                        type="button"
                                        className={s["sidebar-toggle"]}
                                        onClick={onToggleSidebar}
                                        aria-label="Toggle sidebar"
                                >
                                        <i className="bi bi-list" />
                                </button>

                                <span
                                        className="badge rounded-pill px-3 py-2"
                                        style={{
                                                background: "rgba(239,68,68,0.1)",
                                                color: "#ef4444",
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                border: "1px solid rgba(239,68,68,0.2)",
                                        }}
                                >
                                        <i
                                                className={cx("bi bi-circle-fill me-1", s.pulseDot)}
                                                style={{ fontSize: "0.5rem" }}
                                        />
                                        SANDBOX
                                </span>

                                <form
                                        className={cx(s["global-search"], "d-none d-md-block")}
                                        role="search"
                                        onSubmit={(e) => {
                                                e.preventDefault();
                                                onSearchSubmit(new FormData(e.currentTarget).get("q") as string);
                                        }}
                                >
                                        <i className={cx("bi bi-search", s["search-icon"])} />
                                        <input
                                                type="text"
                                                name="q"
                                                placeholder="Search endpoints, logs, API keys…"
                                                aria-label="Search"
                                        />
                                </form>
                        </div>

                        {/* ---------- right: actions ---------- */}
                        <div className={s["header-actions"]}>
                                {/* ===== Accounts dropdown ===== */}
                                <div className="position-relative" data-dropdown="accounts">
                                        <button
                                                type="button"
                                                className={s["account-id-chip"]}
                                                aria-expanded={isDropdownOpen("accounts")}
                                                aria-haspopup="menu"
                                                aria-label="Linked accounts"
                                                onClick={() => onToggleDropdown("accounts")}
                                        >
                                                <i className="bi bi-layers" />
                                                <span>Accounts</span>
                                                <i
                                                        className={cx("bi bi-chevron-down", s.chev)}
                                                        style={{ fontSize: "0.7rem" }}
                                                />
                                        </button>
                                        {isDropdownOpen("accounts") && (
                                                <div className={cx(s["dropdown-panel"], s.show)} role="menu">
                                                        <div className={s["panel-header"]}>
                                                                <span className={s["panel-title"]}>Linked Accounts</span>
                                                                <span
                                                                        className={cx(s.badgeMini, s.badgeOk)}
                                                                >
                                                                        {linkedAccounts.filter((a) => a.linked).length} / {linkedAccounts.length} linked
                                                                </span>
                                                        </div>
                                                        <div className={s["panel-body"]}>
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
                                                                                <span
                                                                                        className={cx(
                                                                                                s.badgeLinked,
                                                                                                acc.linked ? s.linked : s.notLinked,
                                                                                        )}
                                                                                >
                                                                                        <span className={s.badgeDot} />
                                                                                        {acc.linked ? "Linked" : "Not linked"}
                                                                                </span>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                        <div className={cx(s["panel-footer"], "d-flex justify-content-between")}>
                                                                <div className={s.accountActions}>
                                                                        <button
                                                                                type="button"
                                                                                className={s.btnLinkAccount}
                                                                                onClick={() => onToggleDropdown("accounts")}
                                                                        >
                                                                                <i className="bi bi-link-45deg" /> Link Account
                                                                        </button>
                                                                        <button
                                                                                type="button"
                                                                                className={s.btnUnlinkAccount}
                                                                                onClick={() => onToggleDropdown("accounts")}
                                                                        >
                                                                                <i className="bi bi-link-break" /> Unlink Account
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </div>
                                        )}
                                </div>

                                {/* Security Center — opens right drawer */}
                                <button
                                        type="button"
                                        className={s["header-action"]}
                                        onClick={() => onOpenAside("securityTab")}
                                        title="Security Center"
                                        aria-label="Security Center"
                                >
                                        <i className={cx("bi bi-shield-lock", s["action-icon"])} />
                                </button>
                                {/* Environments — opens right drawer */}
                                <button
                                        type="button"
                                        className={s["header-action"]}
                                        onClick={() => onOpenAside("envTab")}
                                        title="Environments"
                                        aria-label="Environments"
                                >
                                        <i className={cx("bi bi-globe2", s["action-icon"])} />
                                </button>
                                <div
                                        className={cx("vr d-none d-lg-block mx-1")}
                                        style={{ height: 28, opacity: 0.15 }}
                                />

                                {/* API Explorer aside */}
                                <button
                                        type="button"
                                        className={s["header-action"]}
                                        onClick={() => onOpenAside("apiExplorer")}
                                        aria-label="API Explorer"
                                        title="API Explorer"
                                >
                                        <i className={cx("bi bi-terminal", s["action-icon"])} />
                                </button>

                                {/* System Status aside */}
                                <button
                                        type="button"
                                        className={s["header-action"]}
                                        onClick={() => onOpenAside("systemStatus")}
                                        aria-label="System Status"
                                        title="System Status"
                                >
                                        <i className={cx("bi bi-activity", s["action-icon"])} />
                                </button>

                                {/* Notifications dropdown */}
                                <div className="position-relative" data-dropdown="notifications">
                                        <button
                                                type="button"
                                                className={s["header-action"]}
                                                aria-expanded={isDropdownOpen("notifications")}
                                                aria-haspopup="menu"
                                                aria-label={`Notifications, ${unreadCount} unread`}
                                                onClick={() => onToggleDropdown("notifications")}
                                        >
                                                <i className={cx("bi bi-bell", s["action-icon"])} />
                                                {unreadCount > 0 && (
                                                        <span className={s["header-badge"]}>{unreadCount}</span>
                                                )}
                                        </button>
                                        {isDropdownOpen("notifications") && (
                                                <div className={cx(s["dropdown-panel"], s.show)} role="menu">
                                                        <div className={s["panel-header"]}>
                                                                <span className={s["panel-title"]}>Dev Alerts</span>
                                                                <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-link text-decoration-none"
                                                                        style={{ fontSize: "0.75rem" }}
                                                                        onClick={() => onToggleDropdown("notifications")}
                                                                >
                                                                        Mark all read
                                                                </button>
                                                        </div>
                                                        <div className={s["panel-body"]}>
                                                                {content.notifications.map((n) => (
                                                                        <div
                                                                                className={cx(s["notification-item"], n.unread && s.unread)}
                                                                                key={n.id}
                                                                        >
                                                                                <div className={cx(s["notification-icon"], s[n.tone])}>
                                                                                        <i className={`bi ${n.icon}`} />
                                                                                </div>
                                                                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                                                                                <span
                                                                                                        className="fw-semibold"
                                                                                                        style={{ fontSize: "0.82rem", color: "var(--text)" }}
                                                                                                >
                                                                                                        {n.title}
                                                                                                </span>
                                                                                                {n.unread && <span className={s["notification-dot"]} />}
                                                                                        </div>
                                                                                        <div
                                                                                                className="text-muted text-truncate"
                                                                                                style={{ fontSize: "0.75rem" }}
                                                                                        >
                                                                                                {n.desc}
                                                                                        </div>
                                                                                </div>
                                                                                <span
                                                                                        className="text-muted flex-shrink-0"
                                                                                        style={{ fontSize: "0.7rem" }}
                                                                                >
                                                                                        {n.time}
                                                                                </span>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                        <div className={cx(s["panel-footer"], "text-center")}>
                                                                <Link
                                                                        to="/dev/$module"
                                                                        params={{ module: "logs" }}
                                                                        className={cx(s.btnLink, s.btnLinkPrimary)}
                                                                        onClick={() => onToggleDropdown("notifications")}
                                                                >
                                                                        View all activity
                                                                </Link>
                                                        </div>
                                                </div>
                                        )}
                                </div>

                                {/* User dropdown */}
                                <div className="position-relative" data-dropdown="user">
                                        <button
                                                type="button"
                                                className={s["user-trigger"]}
                                                aria-expanded={isDropdownOpen("user")}
                                                aria-haspopup="menu"
                                                aria-label="Account menu"
                                                onClick={() => onToggleDropdown("user")}
                                        >
                                                <div
                                                        className={s.avatar}
                                                        style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}
                                                >
                                                        {content.user.initials}
                                                </div>
                                                <div className={s["user-meta"]}>
                                                        <div className={s["user-name"]}>{content.user.name}</div>
                                                        <div className={s["user-role"]}>{content.user.role}</div>
                                                </div>
                                                <i
                                                        className={cx("bi bi-chevron-down", s.chev)}
                                                        style={{ fontSize: "0.8rem" }}
                                                />
                                        </button>
                                        {isDropdownOpen("user") && (
                                                <div
                                                        className={cx(s["dropdown-panel"], s.show)}
                                                        role="menu"
                                                        style={{ width: 280 }}
                                                >
                                                        <div className="p-3 d-flex align-items-center gap-3 border-bottom">
                                                                <div
                                                                        className={s.avatar}
                                                                        style={{
                                                                                width: 46,
                                                                                height: 46,
                                                                                fontSize: "1rem",
                                                                                borderRadius: "50%",
                                                                                background: "linear-gradient(135deg,#6366f1,#4338ca)",
                                                                                color: "#fff",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                fontWeight: 700,
                                                                        }}
                                                                >
                                                                        {content.user.initials}
                                                                </div>
                                                                <div>
                                                                        <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                                                                                {content.user.name}
                                                                        </div>
                                                                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                                {content.user.email}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className={s["panel-body"]}>
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
                                                                                onClick={() => onOpenAside("apiKeys")}
                                                                        >
                                                                                <i className="bi bi-key" /> API Keys
                                                                        </button>
                                                                        <button
                                                                                type="button"
                                                                                className={s.menuItem}
                                                                                onClick={() => onToggleDropdown("user")}
                                                                        >
                                                                                <i className="bi bi-question-circle" /> Documentation
                                                                        </button>
                                                                </div>
                                                        </div>
                                                        <div className={s["panel-footer"]}>
                                                                <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                                                                        style={{ fontSize: "0.82rem" }}
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
