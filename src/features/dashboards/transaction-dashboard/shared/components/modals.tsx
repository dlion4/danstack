/* ============================================================================
 * modals.tsx — shared modal primitives used by every /pm/app/* feature page.
 * ----------------------------------------------------------------------------
 * Pure CSS/React overlays with consistent focus management, keyboard handling,
 * labelled dialogs and the shared PayMo business visual language.
 * ========================================================================== */
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { cx } from "../../../../Layouts/shell/data/shellData";
import s from "../styles/appPage.module.css";

const styles = s as Record<string, string>;
type Phase = "form" | "loading" | "success";
type ModalSize = "sm" | "md" | "lg" | "xl";

/* --------------------------------------------------------------------------
 * useReactModal — mount guard, body-scroll lock and Escape handling.
 * ------------------------------------------------------------------------ */
export function useReactModal(show: boolean, onClose: () => void) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (!show) return;
		const previousOverflow = document.body.style.overflow;
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleEscape);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = previousOverflow;
		};
	}, [show, onClose]);

	return mounted;
}

const sizeClasses: Record<ModalSize, string> = {
	sm: styles.modalSm,
	md: styles.modalMd,
	lg: styles.modalLg,
	xl: styles.modalXl,
};

/* --------------------------------------------------------------------------
 * ModalShell — accessible overlay, labelled dialog and focus boundary.
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
	size?: ModalSize;
	iconCls?: string;
	title: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
}) {
	const mounted = useReactModal(show, onClose);
	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!show) return;
		previousFocusRef.current = document.activeElement as HTMLElement | null;
		const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
		return () => {
			window.cancelAnimationFrame(frame);
			const previous = previousFocusRef.current;
			if (previous?.isConnected) previous.focus();
		};
	}, [show]);

	const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Tab") return;
		const focusable = Array.from(
			dialogRef.current?.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
			) ?? [],
		).filter((element) => !element.hasAttribute("hidden"));
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	if (!mounted || !show) return null;

	return (
		<div className={styles.modalOverlay}>
			<button
				type="button"
				className={styles.modalBackdrop}
				tabIndex={-1}
				aria-label="Close dialog"
				onClick={onClose}
			/>
			<div className={cx(styles.modalWrapper, sizeClasses[size])}>
				<div
					ref={dialogRef}
					className={cx(styles.modalContent, styles.modalAnimated)}
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					onKeyDown={trapFocus}
				>
					<div className={styles.modalHeader}>
						<h2 id={titleId} className={styles.modalTitle}>
							{iconCls ? <i className={iconCls} aria-hidden="true" /> : null}
							{title}
						</h2>
						<button
							ref={closeRef}
							type="button"
							className={styles.modalClose}
							onClick={onClose}
							aria-label="Close dialog"
						>
							<i className="bi bi-x-lg" aria-hidden="true" />
						</button>
					</div>
					<div className={styles.modalBody}>{children}</div>
					{footer ? <div className={styles.modalFooter}>{footer}</div> : null}
				</div>
			</div>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * SimpleModal — form → loading → success, or a static informational dialog.
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
	size?: ModalSize;
	successMsg?: string;
	onSubmit?: () => void;
	children?: ReactNode;
	submitLabel?: string;
	submitPrimary?: boolean;
	hideFooter?: boolean;
}) {
	const [phase, setPhase] = useState<Phase>("form");
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		if (show) setPhase("form");
		return () => window.clearTimeout(timerRef.current);
	}, [show]);

	const handleSubmit = () => {
		onSubmit?.();
		if (!successMsg) {
			onClose();
			return;
		}
		setPhase("loading");
		timerRef.current = window.setTimeout(() => setPhase("success"), 900);
	};

	const footer = hideFooter ? undefined : phase === "success" ? (
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
			{submitLabel ? (
				<button
					type="button"
					className={cx(
						styles.btn,
						submitPrimary ? styles.btnPrimary : styles.btnSecondary,
					)}
					disabled={phase === "loading"}
					onClick={handleSubmit}
				>
					{submitLabel}
				</button>
			) : null}
		</>
	);

	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size={size}
			iconCls={iconCls}
			title={title}
			footer={footer}
		>
			<div className={styles.modalBodyFrame}>
				{phase === "form" ? children : null}
				{phase === "loading" ? (
					<div
						className={styles.loadingOverlay}
						aria-live="polite"
						aria-busy="true"
					>
						<div className={styles.spinner} aria-hidden="true" />
						<p>Processing…</p>
					</div>
				) : null}
				{phase === "success" ? (
					<output className={styles.receipt}>
						<div className={styles.receiptIcon}>
							<i className="bi bi-check-lg" aria-hidden="true" />
						</div>
						<h3 className={styles.receiptTitle}>{successMsg}</h3>
					</output>
				) : null}
			</div>
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * FlowModal — multi-step transfer wizard with semantic progress state.
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
	stepsLabels?: string[];
	children: (step: number) => ReactNode;
}) {
	const labels = Array.isArray(steps)
		? steps
		: (stepsLabels ??
			Array.from({ length: steps }, (_, index) => `Step ${index + 1}`));
	const total = labels.length;
	const [step, setStep] = useState(1);
	const [phase, setPhase] = useState<Phase>("form");
	const [loading, setLoading] = useState(false);
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		if (show) {
			setStep(1);
			setPhase("form");
			setLoading(false);
		}
		return () => window.clearTimeout(timerRef.current);
	}, [show]);

	const isLastStep = step === total;
	const next = () => {
		if (step === total - 1) {
			setLoading(true);
			timerRef.current = window.setTimeout(() => {
				setLoading(false);
				setPhase("success");
				setStep(total);
			}, 900);
			return;
		}
		if (isLastStep) {
			onClose();
			return;
		}
		setStep((current) => Math.min(total, current + 1));
	};
	const nextLabel = isLastStep
		? "Done"
		: step === total - 1
			? confirmLabel
			: "Continue";

	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size="lg"
			iconCls={iconCls}
			title={title}
			footer={
				<>
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						{isLastStep ? "Close" : "Cancel"}
					</button>
					<button
						type="button"
						className={cx(styles.btn, styles.btnPrimary)}
						disabled={loading}
						onClick={next}
					>
						{nextLabel}{" "}
						{!isLastStep ? (
							<i className="bi bi-arrow-right" aria-hidden="true" />
						) : null}
					</button>
				</>
			}
		>
			<div className={styles.modalFlowBody}>
				{phase === "form" ? (
					<>
						<ol className={styles.stepper} aria-label={`${title} progress`}>
							{labels.map((label, index) => {
								const number = index + 1;
								const state =
									number < step
										? "stepDone"
										: number === step
											? "stepActive"
											: "";
								return (
									<li
										className={cx(styles.step, styles[state])}
										key={label}
										aria-current={number === step ? "step" : undefined}
									>
										<span className={styles.stepNum}>
											{number < step ? (
												<i className="bi bi-check" aria-hidden="true" />
											) : (
												number
											)}
										</span>
										<span className={styles.stepLabel}>{label}</span>
										{index < labels.length - 1 ? (
											<span className={styles.stepLine} />
										) : null}
									</li>
								);
							})}
						</ol>
						{children(step)}
					</>
				) : (
					<output className={styles.receipt}>
						<div className={styles.receiptIcon}>
							<i className="bi bi-check-lg" aria-hidden="true" />
						</div>
						<h3 className={styles.receiptTitle}>{title} successful</h3>
						<p className={styles.receiptMsg}>
							Your request has been processed.
						</p>
					</output>
				)}
				{loading ? (
					<div
						className={styles.loadingOverlay}
						aria-live="polite"
						aria-busy="true"
					>
						<div className={styles.spinner} aria-hidden="true" />
						<p>Processing…</p>
					</div>
				) : null}
			</div>
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * TabbedModal — keyboard-friendly segmented tabs inside the shared shell.
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
	footer,
}: {
	show: boolean;
	onClose: () => void;
	iconCls: string;
	title: string;
	size?: ModalSize;
	tabs: TabDef[];
	footer?: ReactNode;
}) {
	const firstKey = tabs[0]?.key ?? "";
	const [active, setActive] = useState(firstKey);
	const tabsId = useId();

	useEffect(() => {
		if (show) setActive(firstKey);
	}, [show, firstKey]);

	const moveTabFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const currentIndex = Math.max(
			0,
			tabs.findIndex((tab) => tab.key === active),
		);
		const nextIndex =
			event.key === "Home"
				? 0
				: event.key === "End"
					? tabs.length - 1
					: event.key === "ArrowRight"
						? (currentIndex + 1) % tabs.length
						: (currentIndex - 1 + tabs.length) % tabs.length;
		const nextKey = tabs[nextIndex]?.key;
		if (!nextKey) return;
		setActive(nextKey);
		window.requestAnimationFrame(() =>
			document.getElementById(`${tabsId}-${nextKey}-tab`)?.focus(),
		);
	};

	return (
		<ModalShell
			show={show}
			onClose={onClose}
			size={size}
			iconCls={iconCls}
			title={title}
			footer={
				footer ?? (
					<button
						type="button"
						className={cx(styles.btn, styles.btnSecondary)}
						onClick={onClose}
					>
						Close
					</button>
				)
			}
		>
			<div
				className={styles.pills}
				role="tablist"
				aria-label={`${title} views`}
				onKeyDown={moveTabFocus}
			>
				{tabs.map((tab) => (
					<button
						key={tab.key}
						id={`${tabsId}-${tab.key}-tab`}
						type="button"
						role="tab"
						aria-selected={active === tab.key}
						aria-controls={`${tabsId}-${tab.key}-panel`}
						tabIndex={active === tab.key ? 0 : -1}
						className={cx(styles.pill, active === tab.key && styles.pillActive)}
						onClick={() => setActive(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>
			{tabs.map((tab) =>
				tab.key === active ? (
					<div
						key={tab.key}
						id={`${tabsId}-${tab.key}-panel`}
						className={styles.tabPanel}
						role="tabpanel"
						aria-labelledby={`${tabsId}-${tab.key}-tab`}
					>
						{tab.render()}
					</div>
				) : null,
			)}
		</ModalShell>
	);
}

/* --------------------------------------------------------------------------
 * Small field helpers
 * ------------------------------------------------------------------------ */
export function PinRow({ length = 4 }: { length?: number }) {
	const refs = useRef<(HTMLInputElement | null)[]>([]);
	const positions = Array.from({ length }, (_, index) => ({
		id: `pin-position-${index + 1}`,
		index,
	}));
	return (
		<fieldset className={styles.pinFieldset}>
			<legend className={styles.pinLegend}>Security PIN</legend>
			<div className={styles.pinRow}>
				{positions.map((position) => (
					<input
						key={position.id}
						ref={(element) => {
							refs.current[position.index] = element;
						}}
						className={styles.pinInput}
						maxLength={1}
						inputMode="numeric"
						autoComplete="one-time-code"
						aria-label={`PIN digit ${position.index + 1}`}
						onChange={(event) => {
							const value = event.target.value.replace(/\D/g, "").slice(0, 1);
							event.target.value = value;
							if (value && position.index < length - 1) {
								refs.current[position.index + 1]?.focus();
							}
						}}
					/>
				))}
			</div>
		</fieldset>
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
	onChange,
}: {
	label: string;
	options: string[];
	defaultValue?: string;
	onChange?: (value: string) => void;
}) {
	const fieldId = useId();
	return (
		<div className="mb-3">
			<label className={styles.fieldLabel} htmlFor={fieldId}>
				{label}
			</label>
			<select
				id={fieldId}
				className={cx(styles.field, styles.select)}
				defaultValue={defaultValue}
				onChange={(event) => onChange?.(event.target.value)}
			>
				{options.map((option) => (
					<option key={option}>{option}</option>
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
	const fieldId = useId();
	return (
		<div className="mb-3">
			<label className={styles.fieldLabel} htmlFor={fieldId}>
				{label}
			</label>
			<input
				id={fieldId}
				type={type}
				className={styles.field}
				defaultValue={defaultValue}
				placeholder={placeholder}
			/>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * Toggle — accessible switch
 * ------------------------------------------------------------------------ */

export interface ToggleProps {
	checked: boolean;
	onChange: (next: boolean) => void;
	disabled?: boolean;
	label?: string;
	description?: string;
	danger?: boolean;
}

export function Toggle({
	checked,
	onChange,
	disabled,
	label,
	description,
	danger,
}: ToggleProps) {
	return (
		<div className={styles.switchRow}>
			{(label || description) && (
				<div>
					{label && <div className={styles.switchLabel}>{label}</div>}
					{description && (
						<div className={styles.switchDescription}>{description}</div>
					)}
				</div>
			)}
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				className={`${styles.toggle} ${checked ? (danger ? styles.toggleOnDanger : styles.toggleOn) : ""}`}
				onClick={() => onChange(!checked)}
				style={{ opacity: disabled ? 0.5 : 1 }}
			>
				<span className={styles.toggleKnob} />
			</button>
		</div>
	);
}

/* --------------------------------------------------------------------------
 * InfoBox — contextual hint boxes
 * ------------------------------------------------------------------------ */

export function InfoBox({
	variant = "info",
	children,
}: {
	variant?: "info" | "success" | "warning" | "danger";
	children: ReactNode;
}) {
	const cls =
		variant === "success"
			? `${styles.hintBox} ${styles.hintBoxSuccess}`
			: variant === "warning"
				? `${styles.hintBox} ${styles.hintBoxWarn}`
				: variant === "danger"
					? `${styles.hintBox} ${styles.hintBoxDanger}`
					: styles.hintBox;
	return <div className={cls}>{children}</div>;
}
