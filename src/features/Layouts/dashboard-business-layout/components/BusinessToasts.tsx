/* ============================================================================
 * BusinessToasts.tsx — toast stack for the Paymo BAAS Business Layout.
 * ----------------------------------------------------------------------------
 * Pure presentational: the shell owns the toast list + timers (mirrors the
 * Angular addToast/removeToast 4.5s auto-dismiss) and passes them down.
 * ========================================================================== */
import type { ToastTone } from "../data/businessLayoutData";
import { cx } from "../data/businessLayoutData";
import styles from "../styles/businessLayout.module.css";

const s = styles as Record<string, string>;

export interface BusinessToastRecord {
	id: number;
	message: string;
	title: string;
	type: ToastTone;
	leaving?: boolean;
}

const TONE: Record<ToastTone, { bg: string; color: string; icon: string }> = {
	success: {
		bg: "rgba(18,183,106,0.12)",
		color: "var(--pm-green-dark)",
		icon: "bi-check-lg",
	},
	danger: {
		bg: "rgba(240,68,56,0.1)",
		color: "var(--pm-danger)",
		icon: "bi-x-lg",
	},
	warning: {
		bg: "rgba(247,144,9,0.12)",
		color: "var(--pm-warn)",
		icon: "bi-exclamation-triangle",
	},
	info: {
		bg: "rgba(46,144,250,0.12)",
		color: "var(--pm-blue)",
		icon: "bi-bell",
	},
};

interface BusinessToastsProps {
	toasts: BusinessToastRecord[];
	onDismiss: (id: number) => void;
}

export default function BusinessToasts({
	toasts,
	onDismiss,
}: BusinessToastsProps) {
	if (toasts.length === 0) return null;
	return (
		<div className={s["toast-container-custom"]}>
			{toasts.map((t) => {
				const tone = TONE[t.type] ?? TONE.info;
				return (
					<div
						key={t.id}
						className={cx(s["paymo-toast"], t.leaving && s.leaving)}
					>
						<div
							className={s["toast-ic"]}
							style={{ background: tone.bg, color: tone.color }}
						>
							<i className={`bi ${tone.icon}`} />
						</div>
						<div className="flex-grow-1">
							<div className="fw-semibold" style={{ fontSize: "0.82rem" }}>
								{t.title}
							</div>
							<div className="text-muted" style={{ fontSize: "0.75rem" }}>
								{t.message}
							</div>
						</div>
						<button
							type="button"
							className="btn btn-link text-muted p-0 ms-2"
							style={{ fontSize: "0.8rem" }}
							onClick={() => onDismiss(t.id)}
							aria-label="Dismiss notification"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
				);
			})}
		</div>
	);
}
