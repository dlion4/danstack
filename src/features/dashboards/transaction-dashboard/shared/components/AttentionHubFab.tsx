import styles from "../styles/attentionHubFab.module.css";

/* ===========================================================================
 * AttentionHubFab — floating launcher for the Attention hub drawer
 * ----------------------------------------------------------------------------
 * Fixed to the right edge. Matches the bottom shortcuts bar (glass pill).
 * Hover/focus expands to show the hub name; click opens the existing drawer.
 * ========================================================================== */

interface AttentionHubFabProps {
	onClick: () => void;
	count?: number;
	hidden?: boolean;
	label?: string;
}

export default function AttentionHubFab({
	onClick,
	count = 0,
	hidden = false,
	label = "Attention hub",
}: AttentionHubFabProps) {
	if (hidden) return null;

	return (
		<button
			type="button"
			className={styles.fab}
			onClick={onClick}
			aria-label={`Open ${label} drawer`}
		>
			<span className={styles.icon} aria-hidden="true">
				<i className="bi bi-exclamation-octagon" />
				{count > 0 ? <span className={styles.badge}>{count}</span> : null}
			</span>
			<span className={styles.label}>{label}</span>
		</button>
	);
}
