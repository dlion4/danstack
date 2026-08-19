/* ============================================================================
 * CardsToasts.tsx — toast stack for the Paymo BAAS Cards Layout.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-header toast system
 * LEGACY BRIDGE: the toast list is now React state in CardsShell; this file is
 *   purely presentational. The tone -> icon/color map is kept verbatim.
 * ========================================================================== */
import type { ToastTone } from "../data/cardsLayoutData";
import { cx } from "../data/cardsLayoutData";
import styles from "../styles/cardsLayout.module.css";

const s = styles as Record<string, string>;

export interface ToastRecord {
	id: number;
	message: string;
	title: string;
	type: ToastTone;
	leaving?: boolean;
}

const TONE: Record<
	ToastTone,
	{ bg: string; color: string; icon: string; title: string }
> = {
	success: {
		bg: "rgba(18,183,106,0.12)",
		color: "#067647",
		icon: "bi-check-lg",
		title: "Success",
	},
	danger: {
		bg: "rgba(240,68,56,0.1)",
		color: "#b42318",
		icon: "bi-x-lg",
		title: "Error",
	},
	warning: {
		bg: "rgba(247,144,9,0.12)",
		color: "#93370d",
		icon: "bi-exclamation-triangle",
		title: "Warning",
	},
	info: {
		bg: "rgba(46,144,250,0.12)",
		color: "#175cd3",
		icon: "bi-bell",
		title: "Info",
	},
};

interface CardsToastsProps {
	toasts: ToastRecord[];
	onDismiss: (id: number) => void;
}

export default function CardsToasts({ toasts, onDismiss }: CardsToastsProps) {
	return (
		<div className={s.toastContainer} aria-live="polite" aria-atomic="false">
			{toasts.map((t) => {
				const tone = TONE[t.type];
				return (
					<div
						className={cx(s.paymoToast, t.leaving && s.leaving)}
						key={t.id}
						role="status"
					>
						<div
							className={s.toastIc}
							style={{ background: tone.bg, color: tone.color }}
						>
							<i className={`bi ${tone.icon}`} />
						</div>
						<div className="flex-grow-1" style={{ minWidth: 0 }}>
							<div className={s.toastTitle}>{t.title || tone.title}</div>
							<div className={s.toastMsg}>{t.message}</div>
						</div>
						<button
							type="button"
							className={s.toastClose}
							aria-label="Dismiss notification"
							onClick={() => onDismiss(t.id)}
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
				);
			})}
		</div>
	);
}
