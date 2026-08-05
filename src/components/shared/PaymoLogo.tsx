/* ============================================================================
 * PaymoLogo.tsx — Reusable Paymo BAAS logo component
 * ----------------------------------------------------------------------------
 * Displays the Paymo logo with responsive collapsed/expanded states.
 * - Collapsed: Shows only the "PM" logo icon
 * - Expanded: Shows full "Paymo BAAS" branding with text
 * ========================================================================== */

import styles from "./PaymoLogo.module.css";

interface PaymoLogoProps {
	expanded: boolean;
	className?: string;
}

export default function PaymoLogo({ expanded, className = "" }: PaymoLogoProps) {
	return (
		<div className={`${styles.paymoLogo} ${className}`}>
			<img
				src="/assets/pm-p-logo.png"
				alt="Paymo"
				className={styles.paymoLogoImg}
			/>
			{expanded && (
				<span className={styles.paymoLogoText}>
					<span className={styles.paymoLogoPrimary}>
						<span className={styles.pay}>Pay</span>
						<span className={styles.mo}>MO</span>
					</span>
					<span className={styles.paymoLogoSecondary}>BAAS</span>
				</span>
			)}
		</div>
	);
}
