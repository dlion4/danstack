/* ============================================================================
 * modals.tsx — shared modal primitives used by every /app/* feature page.
 * ----------------------------------------------------------------------------
 * Extracted from the Transfer Overview page's modal engine so Pages 1.3–1.6
 * (Transfer Management, Payment Rails, Liquidity & Float, Reconciliation) share
 * one implementation instead of copy-pasting 800 LOC into every feature.
 *
 * Pure CSS/React overlays — NO Bootstrap JS dependency. Each modal:
 *   - mounts/unmounts cleanly via `show` (no leftover body scroll lock)
 *   - closes on backdrop click + ESC
 *   - reuses the emerald theme classes from appPage.module.css
 *
 * EXPORTED PRIMITIVES
 *   useReactModal(show, onClose) ........ body-scroll-lock + ESC handler
 *   ModalShell .......................... raw overlay+card skeleton
 *   SimpleModal ........................ form → loading → success (or static)
 *   FlowModal .........................  multi-step wizard w/ stepper + PIN
 *   TabbedModal ......................... segmented-tabs container
 *   PinRow / ReviewRow / SelectField ... small field helpers
 * ========================================================================== */
"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../../features/shell/data/shellData";
import s from "../styles/appPage.module.css";

const styles = s as Record<string, string>;

type Phase = "form" | "loading" | "success";

/* --------------------------------------------------------------------------
 * useReactModal — body-scroll-lock + ESC-to-close, cleaned up on unmount.
 * ------------------------------------------------------------------------ */
export function useReactModal(show: boolean, onClose: () => void) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!show) return;
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [show, onClose]);

	return mounted;
}

/* --------------------------------------------------------------------------
 * ModalShell — the raw overlay + card; consumers fill header/body/footer.
 * ------------------------------------------------------------------------ */
export function ModalShell({
	show,
	onClose,
	size = "md",
	iconCls,
	title,
	children,
	footer,
}: {
	show: boolean;
	onClose: () => void;
	size?: "sm" | "md" | "lg" | "xl";
	iconCls?: string;
	title: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
}) {
	const mounted = useReactModal(show, onClose);
	if (!mounted || !show) return null;

	const sizeCls =
		size === "lg"
			? "modal-lg"
			: size === "xl"
				? "modal-xl"
				: size === "sm"
					? "modal-sm"
					: "";

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div
				className={cx(styles.modalWrapper, sizeCls)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={cx(styles.modalContent, styles.modalAnimated)}>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>
							{iconCls && <i className={cx(iconCls)} />}
							{title}
						</h5>
						<button
							type="button"
							className={styles.modalClose}
							onClick={onClose}
							aria-label="Close"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
					<div className={styles.modalBody}>{children}</div>
					{footer && <div className={styles.modalFooter}>{footer}</div>}
				</div>
			</div>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * SimpleModal — form → loading → success (or static when no successMsg).
 * ------------------------------------------------------------------------ */
export function SimpleModal({
	show,
	onClose,
	iconCls,
	title,
	size = "md",
	successMsg,
	onSubmit,
	children,
	submitLabel,
	submitPrimary = true,
	hideFooter = false,
}: {
	show: boolean;
	onClose: () => void;
	iconCls: string;
	title: string;
	size?: "sm" | "md" | "lg" | "xl";
	successMsg?: string;
	onSubmit?: () => void;
	children?: ReactNode;
	submitLabel?: string;
	submitPrimary?: boolean;
	hideFooter?: boolean;
}) {
	const mounted = useReactModal(show, onClose);
	const [phase, setPhase] = useState<Phase>("form");
	useEffect(() => {
		if (show) setPhase("form");
	}, [show]);

	if (!mounted || !show) return null;

	const handleSubmit = () => {
		if (!onSubmit || !successMsg) {
			onClose();
			return;
		}
		setPhase("loading");
		onSubmit();
		setTimeout(() => setPhase("success"), 1500);
	};

	const sizeCls =
		size === "lg"
			? "modal-lg"
			: size === "xl"
				? "modal-xl"
				: size === "sm"
					? "modal-sm"
					: "";

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div
				className={cx(styles.modalWrapper, sizeCls)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={cx(styles.modalContent, styles.modalAnimated)}>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>
							<i className={cx(iconCls)} /> {title}
						</h5>
						<button
							type="button"
							className={styles.modalClose}
							onClick={onClose}
							aria-label="Close"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
					<div
						className={styles.modalBody}
						style={{ position: "relative", minHeight: 120 }}
					>
						{phase === "form" && children}
						{phase === "loading" && (
							<div className={styles.loadingOverlay}>
								<div
									className="spinner-border"
									role="status"
									style={{ width: "3rem", height: "3rem" }}
								/>
								<p
									style={{
										marginTop: 16,
										fontSize: 14,
										fontWeight: 600,
										color: "var(--pri)",
									}}
								>
									Processing…
								</p>
							</div>
						)}
						{phase === "success" && (
							<div className={styles.receipt}>
								<div className={styles.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={styles.receiptTitle}>{successMsg}</h5>
							</div>
						)}
					</div>
					{!hideFooter && (
						<div className={styles.modalFooter}>
							{phase === "success" ? (
								<button
									type="button"
									className={cx(styles.btn, styles.btnPrimary)}
									onClick={onClose}
								>
									Done
								</button>
							) : (
								<>
									<button
										type="button"
										className={cx(styles.btn, styles.btnSecondary)}
										onClick={onClose}
									>
										Cancel
									</button>
									{submitLabel && (
										<button
											type="button"
											className={cx(
												styles.btn,
												submitPrimary ? styles.btnPrimary : styles.btnSecondary,
											)}
											onClick={handleSubmit}
										>
											{submitLabel}
										</button>
									)}
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * FlowModal — multi-step wizard. `children(step)` renders per-step content;
 * the second-to-last step simulates processing then jumps to the success step.
 * ------------------------------------------------------------------------ */
export function FlowModal({
	show,
	onClose,
	iconCls,
	title,
	steps,
	confirmLabel = "Confirm",
	stepsLabels,
	children,
}: {
	show: boolean;
	onClose: () => void;
	iconCls: string;
	title: string;
	steps: number | string[];
	confirmLabel?: string;
	/** Optional explicit labels (defaults derived from `steps`). */
	stepsLabels?: string[];
	children: (step: number) => ReactNode;
}) {
	const mounted = useReactModal(show, onClose);
	const labels = Array.isArray(steps)
		? steps
		: stepsLabels ?? Array.from({ length: steps }, (_, i) => `Step ${i + 1}`);
	const total = labels.length;
	const [step, setStep] = useState(1);
	const [phase, setPhase] = useState<Phase>("form");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (show) {
			setStep(1);
			setPhase("form");
			setLoading(false);
		}
	}, [show]);

	if (!mounted || !show) return null;

	const isLastStep = step === total;
	const next = () => {
		if (step === total - 1) {
			setLoading(true);
			setTimeout(() => {
				setLoading(false);
				setPhase("success");
				setStep(total);
			}, 1500);
			return;
		}
		if (isLastStep) {
			onClose();
			return;
		}
		setStep((p) => Math.min(total, p + 1));
	};

	const nextLabel = isLastStep
		? "Done"
		: step === total - 1
			? confirmLabel
			: "Continue";

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div
				className={cx(styles.modalWrapper, "modal-lg")}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={cx(styles.modalContent, styles.modalAnimated)}>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>
							<i className={cx(iconCls)} /> {title}
						</h5>
						<button
							type="button"
							className={styles.modalClose}
							onClick={onClose}
							aria-label="Close"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
					<div
						className={styles.modalBody}
						style={{ position: "relative", minHeight: 200 }}
					>
						{phase === "form" && (
							<>
								<div className={styles.stepper}>
									{labels.map((label, i) => {
										const n = i + 1;
										const state =
											n < step ? "stepDone" : n === step ? "stepActive" : "";
										return (
											<div className={cx(styles.step, styles[state])} key={label}>
												<div className={styles.stepNum}>
													{n < step ? <i className="bi bi-check" /> : n}
												</div>
												<div className={styles.stepLabel}>{label}</div>
												{i < labels.length - 1 && <div className={styles.stepLine} />}
											</div>
										);
									})}
								</div>
								{children(step)}
							</>
						)}
						{phase === "success" && (
							<div className={styles.receipt}>
								<div className={styles.receiptIcon}>
									<i className="bi bi-check-lg" />
								</div>
								<h5 className={styles.receiptTitle}>{title} Successful</h5>
								<p
									style={{
										fontSize: 14,
										color: "var(--ink-500)",
										marginTop: 8,
									}}
								>
									Your request has been processed.
								</p>
							</div>
						)}
						{loading && (
							<div className={styles.loadingOverlay}>
								<div
									className="spinner-border"
									role="status"
									style={{ width: "3rem", height: "3rem" }}
								/>
								<p
									style={{
										marginTop: 16,
										fontSize: 14,
										fontWeight: 600,
										color: "var(--pri)",
									}}
								>
									Processing…
								</p>
							</div>
						)}
					</div>
					<div className={styles.modalFooter}>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="button"
							className={cx(styles.btn, styles.btnPrimary)}
							onClick={next}
						>
							{nextLabel}{" "}
							{!isLastStep && <i className="bi bi-arrow-right" />}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * TabbedModal — segmented-tabs body inside a SimpleModal-style shell.
 * ------------------------------------------------------------------------ */
export interface TabDef {
	key: string;
	label: string;
	render: () => ReactNode;
}

export function TabbedModal({
	show,
	onClose,
	iconCls,
	title,
	size = "lg",
	tabs,
}: {
	show: boolean;
	onClose: () => void;
	iconCls: string;
	title: string;
	size?: "sm" | "md" | "lg" | "xl";
	tabs: TabDef[];
}) {
	const mounted = useReactModal(show, onClose);
	const [active, setActive] = useState(tabs[0]?.key ?? "");

	useEffect(() => {
		if (show) setActive(tabs[0]?.key ?? "");
	}, [show, tabs]);

	if (!mounted || !show) return null;

	const sizeCls =
		size === "lg"
			? "modal-lg"
			: size === "xl"
				? "modal-xl"
				: size === "sm"
					? "modal-sm"
					: "";

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div
				className={cx(styles.modalWrapper, sizeCls)}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={cx(styles.modalContent, styles.modalAnimated)}>
					<div className={styles.modalHeader}>
						<h5 className={styles.modalTitle}>
							<i className={cx(iconCls)} /> {title}
						</h5>
						<button
							type="button"
							className={styles.modalClose}
							onClick={onClose}
							aria-label="Close"
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
					<div className={styles.modalBody}>
						<div className={styles.pills} style={{ marginBottom: 20 }}>
							{tabs.map((t) => (
								<button
									key={t.key}
									type="button"
									className={cx(
										styles.pill,
										active === t.key && styles.pillActive,
									)}
									onClick={() => setActive(t.key)}
								>
									{t.label}
								</button>
							))}
						</div>
						{tabs.find((t) => t.key === active)?.render()}
					</div>
					<div className={styles.modalFooter}>
						<button
							type="button"
							className={cx(styles.btn, styles.btnSecondary)}
							onClick={onClose}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * Small field helpers
 * ------------------------------------------------------------------------ */
export function PinRow({ length = 4 }: { length?: number }) {
	const refs = useRef<(HTMLInputElement | null)[]>([]);
	return (
		<div className={styles.pinRow}>
			{Array.from({ length }).map((_, i) => (
				<input
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					className={styles.pinInput}
					maxLength={1}
					inputMode="numeric"
					aria-label={`PIN digit ${i + 1}`}
					onChange={(e) => {
						const v = e.target.value;
						if (v && i < length - 1) refs.current[i + 1]?.focus();
					}}
				/>
			))}
		</div>
	);
}

export function ReviewRow({
	label,
	value,
	highlight,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<div className="d-flex justify-content-between mb-2">
			<span className="text-muted">{label}</span>
			<strong style={highlight ? { color: "var(--pri)" } : undefined}>
				{value}
			</strong>
		</div>
	);
}

export function SelectField({
	label,
	options,
	defaultValue,
}: {
	label: string;
	options: string[];
	defaultValue?: string;
}) {
	return (
		<div className="mb-3">
			<label className={styles.fieldLabel}>{label}</label>
			<select
				className={cx(styles.field, styles.select)}
				defaultValue={defaultValue}
			>
				{options.map((o) => (
					<option key={o}>{o}</option>
				))}
			</select>
		</div>
	);
}

export function Field({
	label,
	defaultValue,
	type = "text",
	placeholder,
}: {
	label: string;
	defaultValue?: string;
	type?: string;
	placeholder?: string;
}) {
	return (
		<div className="mb-3">
			<label className={styles.fieldLabel}>{label}</label>
			<input
				type={type}
				className={styles.field}
				defaultValue={defaultValue}
				placeholder={placeholder}
			/>
		</div>
	);
}
