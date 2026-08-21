/* ============================================================================
 * AuthKit.tsx — shared UI primitives for every /auth/* page
 * ----------------------------------------------------------------------------
 * A single, tiny design-system module so all authentication screens share the
 * exact look & feel of the PayMo Business workspace (business-dashboard +
 * dashboard-cards-layout): white cards on a #f2f4f8 canvas, emerald primary,
 * navy brand rail, Sora headings, soft layered shadows.
 *
 * Exports
 *   Layout ....... AuthPage, AuthSplit, AuthConsole, Section, Card
 *   Controls ..... Button, Field, Input, Select, Switch, Check, SegTabs,
 *                  OptionCard, OtpInput, PinPad
 *   Feedback ..... toast (global store), Toaster, Modal, Confirm, Notice,
 *                  Badge, Chip, Tile, Stepper, Progress, EmptyState
 *
 * Toasts use a module-level store (useSyncExternalStore) so any component can
 * call `toast.success(...)` without a provider wrapper.
 * ========================================================================== */

import type {
	ButtonHTMLAttributes,
	ComponentPropsWithRef,
	ReactNode,
	SelectHTMLAttributes,
} from "react";
import {
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../styles/authTheme.module.css";

export const s = styles as Record<string, string>;
export const cx = (...parts: Array<string | false | null | undefined>) =>
	parts.filter(Boolean).join(" ");

export type Tone =
	| "green"
	| "amber"
	| "red"
	| "blue"
	| "violet"
	| "slate"
	| "ink";

/* ==========================================================================
 * TOASTS — module level store
 * ======================================================================== */
export type ToastTone = "success" | "info" | "warning" | "danger";

export interface ToastItem {
	id: number;
	tone: ToastTone;
	title: string;
	msg?: string;
	duration: number;
	action?: { label: string; onClick: () => void };
}

let toastSeq = 0;
let toastList: ToastItem[] = [];
const toastSubs = new Set<() => void>();

function emitToasts() {
	toastList = [...toastList];
	toastSubs.forEach((fn) => {
		fn();
	});
}

function subscribeToasts(fn: () => void) {
	toastSubs.add(fn);
	return () => {
		toastSubs.delete(fn);
	};
}

const emptyToasts: ToastItem[] = [];

export function dismissToast(id: number) {
	toastList = toastList.filter((t) => t.id !== id);
	emitToasts();
}

function pushToast(
	tone: ToastTone,
	title: string,
	msg?: string,
	opts?: { duration?: number; action?: ToastItem["action"] },
) {
	const id = ++toastSeq;
	const duration = opts?.duration ?? 4200;
	toastList = [
		...toastList.slice(-3),
		{ id, tone, title, msg, duration, action: opts?.action },
	];
	emitToasts();
	if (typeof window !== "undefined" && duration > 0) {
		window.setTimeout(() => dismissToast(id), duration);
	}
	return id;
}

export const toast = {
	success: (
		title: string,
		msg?: string,
		opts?: { duration?: number; action?: ToastItem["action"] },
	) => pushToast("success", title, msg, opts),
	info: (
		title: string,
		msg?: string,
		opts?: { duration?: number; action?: ToastItem["action"] },
	) => pushToast("info", title, msg, opts),
	warning: (
		title: string,
		msg?: string,
		opts?: { duration?: number; action?: ToastItem["action"] },
	) => pushToast("warning", title, msg, opts),
	danger: (
		title: string,
		msg?: string,
		opts?: { duration?: number; action?: ToastItem["action"] },
	) => pushToast("danger", title, msg, opts),
	dismiss: dismissToast,
};

const TOAST_ICON: Record<ToastTone, string> = {
	success: "bi-check-circle-fill",
	info: "bi-info-circle-fill",
	warning: "bi-exclamation-triangle-fill",
	danger: "bi-x-circle-fill",
};

const TOAST_TILE: Record<ToastTone, string> = {
	success: "tileGreen",
	info: "tileBlue",
	warning: "tileAmber",
	danger: "tileRed",
};

export function Toaster() {
	const items = useSyncExternalStore(
		subscribeToasts,
		() => toastList,
		() => emptyToasts,
	);
	if (!items.length) return null;
	return (
		<div className={s.toastStack} aria-live="polite">
			{items.map((t) => (
				<output
					key={t.id}
					className={cx(
						s.toast,
						s[`toast${t.tone[0].toUpperCase()}${t.tone.slice(1)}`],
					)}
				>
					<span className={cx(s.tile, s.tileSm, s[TOAST_TILE[t.tone]])}>
						<i className={`bi ${TOAST_ICON[t.tone]}`} />
					</span>
					<div className={s.grow}>
						<div className={s.toastTitle}>{t.title}</div>
						{t.msg && <div className={s.toastMsg}>{t.msg}</div>}
						{t.action && (
							<button
								type="button"
								className={s.link}
								style={{ fontSize: "0.75rem", marginTop: 4 }}
								onClick={() => {
									t.action?.onClick();
									dismissToast(t.id);
								}}
							>
								{t.action.label}
							</button>
						)}
					</div>
					<button
						type="button"
						className={s.modalClose}
						aria-label="Dismiss notification"
						onClick={() => dismissToast(t.id)}
					>
						<i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }} />
					</button>
					<span
						className={s.toastBar}
						style={{ animationDuration: `${t.duration}ms`, width: "100%" }}
					/>
				</output>
			))}
		</div>
	);
}

/* ==========================================================================
 * LAYOUT
 * ======================================================================== */
export function AuthPage({ children }: { children: ReactNode }) {
	return (
		<div className={s.page}>
			{children}
			<Toaster />
		</div>
	);
}

export interface RailFeature {
	icon: string;
	title: string;
	sub: string;
}

export interface RailStat {
	value: string;
	label: string;
}

export function AuthSplit({
	pill,
	title,
	accent,
	copy,
	features = [],
	stats = [],
	trust = [],
	wide,
	children,
}: {
	pill: string;
	title: string;
	accent?: string;
	copy: string;
	features?: RailFeature[];
	stats?: RailStat[];
	trust?: string[];
	wide?: boolean;
	children: ReactNode;
}) {
	return (
		<div className={s.split}>
			<aside className={s.rail}>
				<div className={s.railGrid} />
				<div className={s.railGlow} />
				<a
					href="/"
					className={s.brand}
					style={{ position: "relative", zIndex: 1 }}
				>
					<span className={s.brandMark}>P</span>
					<span>
						<span className={cx(s.brandName, s.brandNameLight)}>
							Paymo BAAS
						</span>
						<span
							className={cx(s.brandSub, s.brandSubLight)}
							style={{ display: "block" }}
						>
							Unified financial infrastructure
						</span>
					</span>
				</a>

				<div className={s.railInner}>
					<span
						className={cx(s.badge, s.badgeOnDark)}
						style={{ alignSelf: "flex-start" }}
					>
						<span className={s.dotLive} /> {pill}
					</span>
					<h1 className={s.railTitle}>
						{title} {accent && <span className={s.railAccent}>{accent}</span>}
					</h1>
					<p className={s.railCopy}>{copy}</p>
					{features.length > 0 && (
						<div
							className={cx(s.stack, s.railHideSm)}
							style={{ maxWidth: 430 }}
						>
							{features.map((f) => (
								<div className={s.railFeature} key={f.title}>
									<span
										className={cx(s.tile, s.tileSm)}
										style={{
											background: "rgba(18,183,106,0.16)",
											color: "#7ee2b0",
										}}
									>
										<i className={`bi ${f.icon}`} />
									</span>
									<span>
										<b>{f.title}</b>
										<span>{f.sub}</span>
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				<div className={cx(s.stack, s.railHideSm)}>
					{stats.length > 0 && (
						<div className={s.railStats}>
							{stats.map((st) => (
								<div key={st.label}>
									<div className={s.railStatValue}>{st.value}</div>
									<div className={s.railStatLabel}>{st.label}</div>
								</div>
							))}
						</div>
					)}
					{trust.length > 0 && (
						<div className={s.railTrust}>
							{trust.map((t) => (
								<span className={cx(s.badge, s.badgeOnDark)} key={t}>
									<i className="bi bi-patch-check-fill" /> {t}
								</span>
							))}
						</div>
					)}
				</div>
			</aside>

			<main className={s.formCol}>
				<div className={cx(s.formInner, wide && s.formWide)}>{children}</div>
			</main>
		</div>
	);
}

export function AuthConsole({
	crumb,
	actions,
	children,
}: {
	crumb: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className={s.console}>
			<header className={s.topbar}>
				<a href="/" className={s.brand}>
					<span className={s.brandMark}>P</span>
					<span>
						<span className={s.brandName}>Paymo BAAS</span>
						<span className={s.brandSub} style={{ display: "block" }}>
							{crumb}
						</span>
					</span>
				</a>
				<span className={s.topbarSpace} />
				{actions}
			</header>
			<div className={s.consoleBody}>{children}</div>
		</div>
	);
}

export function Hero({
	zone,
	title,
	copy,
	chips,
	stats,
	actions,
}: {
	zone: string;
	title: ReactNode;
	copy?: ReactNode;
	chips?: ReactNode;
	stats?: Array<{ value: string; label: string; warn?: boolean }>;
	actions?: ReactNode;
}) {
	return (
		<section className={s.hero}>
			<div className={s.railGrid} />
			<div className={s.heroMain}>
				<div className={cx(s.row, s.rowTight)}>
					<span className={s.zone}>
						<i className="bi bi-shield-lock-fill" /> {zone}
					</span>
					{chips}
				</div>
				<h1 className={s.heroTitle}>{title}</h1>
				{copy && <p className={s.heroCopy}>{copy}</p>}
			</div>
			<div className={s.heroSide}>
				{stats && stats.length > 0 && (
					<div className={s.heroSide}>
						{stats.map((st, i) => (
							<div className={s.row} key={st.label} style={{ gap: "1rem" }}>
								{i > 0 && <span className={s.heroDivider} />}
								<div className={s.heroStat}>
									<div
										className={cx(s.heroStatValue, st.warn && s.heroStatWarn)}
									>
										{st.value}
									</div>
									<div className={s.heroStatLabel}>{st.label}</div>
								</div>
							</div>
						))}
					</div>
				)}
				{actions && <div className={cx(s.row, s.rowTight)}>{actions}</div>}
			</div>
		</section>
	);
}

export function Section({
	no,
	title,
	sub,
	actions,
}: {
	no?: string;
	title: string;
	sub?: string;
	actions?: ReactNode;
}) {
	return (
		<div className={s.stackTight}>
			<div className={s.sectionHead}>
				{no && <span className={s.sectionNo}>{no}</span>}
				<h2>{title}</h2>
				{actions && (
					<div style={{ marginLeft: "auto" }} className={cx(s.row, s.rowTight)}>
						{actions}
					</div>
				)}
			</div>
			{sub && <div className={s.sectionSub}>{sub}</div>}
		</div>
	);
}

export function Card({
	title,
	sub,
	icon,
	tone = "green",
	actions,
	children,
	className,
	flush,
	hover,
	onClick,
}: {
	title?: ReactNode;
	sub?: ReactNode;
	icon?: string;
	tone?: Tone;
	actions?: ReactNode;
	children?: ReactNode;
	className?: string;
	flush?: boolean;
	hover?: boolean;
	onClick?: () => void;
}) {
	const body = (
		<>
			{(title || icon) && (
				<div className={s.cardHead}>
					{icon && (
						<span
							className={cx(
								s.tile,
								s[`tile${tone[0].toUpperCase()}${tone.slice(1)}`],
							)}
						>
							<i className={`bi ${icon}`} />
						</span>
					)}
					<div className={s.grow}>
						{title && <div className={s.cardTitle}>{title}</div>}
						{sub && <p className={s.cardSub}>{sub}</p>}
					</div>
					{actions && <div className={cx(s.row, s.rowTight)}>{actions}</div>}
				</div>
			)}
			{children}
		</>
	);
	const cls = cx(s.card, flush && s.cardFlush, hover && s.cardHover, className);

	if (onClick) {
		return (
			// biome-ignore lint/a11y/useSemanticElements: a card can contain nested buttons, so a <button> wrapper would be invalid HTML
			<div
				className={cls}
				role="button"
				tabIndex={0}
				style={{ cursor: "pointer" }}
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick();
					}
				}}
			>
				{body}
			</div>
		);
	}
	return <div className={cls}>{body}</div>;
}

/* ==========================================================================
 * ATOMS
 * ======================================================================== */
export function Badge({
	tone = "slate",
	icon,
	children,
}: {
	tone?: Tone | "onDark";
	icon?: string;
	children: ReactNode;
}) {
	const key =
		tone === "onDark"
			? "badgeOnDark"
			: `badge${tone[0].toUpperCase()}${tone.slice(1)}`;
	return (
		<span className={cx(s.badge, s[key])}>
			{icon && <i className={`bi ${icon}`} />}
			{children}
		</span>
	);
}

export function Tile({
	icon,
	tone = "green",
	size,
}: {
	icon: string;
	tone?: Tone;
	size?: "sm" | "lg";
}) {
	return (
		<span
			className={cx(
				s.tile,
				size === "sm" && s.tileSm,
				size === "lg" && s.tileLg,
				s[`tile${tone[0].toUpperCase()}${tone.slice(1)}`],
			)}
		>
			<i className={`bi ${icon}`} />
		</span>
	);
}

export function Chip({
	on,
	onClick,
	children,
}: {
	on?: boolean;
	onClick?: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className={cx(s.chip, on && s.chipOn)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

type ButtonVariant =
	| "primary"
	| "dark"
	| "outline"
	| "ghost"
	| "subtle"
	| "danger"
	| "dangerGhost";

export function Button({
	variant = "primary",
	size,
	block,
	icon,
	loading,
	children,
	className,
	...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: "sm" | "lg";
	block?: boolean;
	icon?: string;
	loading?: boolean;
}) {
	return (
		<button
			type="button"
			className={cx(
				s.btn,
				s[`btn${variant[0].toUpperCase()}${variant.slice(1)}`],
				size === "sm" && s.btnSm,
				size === "lg" && s.btnLg,
				block && s.btnBlock,
				className,
			)}
			{...rest}
		>
			{loading ? (
				<span className={s.spin} />
			) : icon ? (
				<i className={`bi ${icon}`} />
			) : null}
			{children}
		</button>
	);
}

export function Field({
	label,
	hint,
	tone,
	children,
	htmlFor,
}: {
	label?: string;
	hint?: ReactNode;
	tone?: "ok" | "err";
	children: ReactNode;
	htmlFor?: string;
}) {
	return (
		<div>
			{label && (
				<label className={s.label} htmlFor={htmlFor}>
					{label}
				</label>
			)}
			{children}
			{hint && (
				<div
					className={cx(
						s.hint,
						tone === "ok" && s.hintOk,
						tone === "err" && s.hintErr,
					)}
				>
					{tone && (
						<i
							className={`bi ${tone === "ok" ? "bi-check-circle" : "bi-exclamation-circle"}`}
						/>
					)}
					{hint}
				</div>
			)}
		</div>
	);
}

export function Input({
	tone,
	className,
	...rest
}: ComponentPropsWithRef<"input"> & { tone?: "ok" | "err" }) {
	return (
		<input
			className={cx(
				s.input,
				tone === "ok" && s.inputOk,
				tone === "err" && s.inputErr,
				className,
			)}
			{...rest}
		/>
	);
}

export function PasswordInput({
	value,
	onChange,
	placeholder,
	id,
	autoComplete,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	id?: string;
	autoComplete?: string;
}) {
	const [show, setShow] = useState(false);
	return (
		<div className={s.inputWrap}>
			<input
				id={id}
				className={s.input}
				type={show ? "text" : "password"}
				value={value}
				placeholder={placeholder}
				autoComplete={autoComplete}
				onChange={(e) => onChange(e.target.value)}
			/>
			<button
				type="button"
				className={s.inputAffix}
				aria-label={show ? "Hide password" : "Show password"}
				onClick={() => setShow((v) => !v)}
			>
				<i className={show ? "bi bi-eye-slash" : "bi bi-eye"} />
			</button>
		</div>
	);
}

export function Select({
	className,
	children,
	...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select className={cx(s.select, className)} {...rest}>
			{children}
		</select>
	);
}

export function Switch({
	on,
	onToggle,
	label,
}: {
	on: boolean;
	onToggle: () => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label={label}
			className={cx(s.switch, on && s.switchOn)}
			onClick={onToggle}
		/>
	);
}

export function Check({
	checked,
	onChange,
	children,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	children: ReactNode;
}) {
	return (
		<label className={s.check}>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
			/>
			<span>{children}</span>
		</label>
	);
}

export interface SegItem<T extends string> {
	id: T;
	label: string;
	icon?: string;
	dot?: boolean;
}

export function SegTabs<T extends string>({
	items,
	value,
	onChange,
}: {
	items: Array<SegItem<T>>;
	value: T;
	onChange: (id: T) => void;
}) {
	return (
		<div className={s.segs} role="tablist">
			{items.map((it) => (
				<button
					key={it.id}
					type="button"
					role="tab"
					aria-selected={value === it.id}
					className={cx(s.seg, value === it.id && s.segOn)}
					onClick={() => onChange(it.id)}
				>
					{it.dot && <span className={s.segDot} />}
					{it.icon && <i className={`bi ${it.icon}`} />}
					{it.label}
				</button>
			))}
		</div>
	);
}

export function OptionCard({
	icon,
	tone = "green",
	title,
	sub,
	selected,
	badge,
	onClick,
}: {
	icon: string;
	tone?: Tone;
	title: ReactNode;
	sub?: ReactNode;
	selected?: boolean;
	badge?: ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			className={cx(s.option, selected && s.optionOn)}
			onClick={onClick}
		>
			<Tile icon={icon} tone={tone} />
			<span className={s.grow}>
				<span className={s.optionTitle}>{title}</span>
				{sub && (
					<span className={cx(s.optionSub)} style={{ display: "block" }}>
						{sub}
					</span>
				)}
				{badge && (
					<span style={{ display: "inline-flex", marginTop: 6 }}>{badge}</span>
				)}
			</span>
			{selected && (
				<i className={cx("bi bi-check-circle-fill", s.optionCheck)} />
			)}
		</button>
	);
}

export function Notice({
	tone = "slate",
	icon,
	children,
	action,
}: {
	tone?: "green" | "amber" | "red" | "blue" | "violet" | "slate";
	icon?: string;
	children: ReactNode;
	action?: ReactNode;
}) {
	return (
		<div
			className={cx(
				s.notice,
				s[`notice${tone[0].toUpperCase()}${tone.slice(1)}`],
			)}
		>
			{icon && <i className={`bi ${icon}`} style={{ marginTop: 2 }} />}
			<div className={s.grow}>{children}</div>
			{action}
		</div>
	);
}

export function Progress({ value, sm }: { value: number; sm?: boolean }) {
	return (
		<div className={cx(s.progress, sm && s.progressSm)}>
			<div
				className={s.progressBar}
				style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
			/>
		</div>
	);
}

export function Stepper({
	steps,
	current,
}: {
	steps: Array<{ label: string; icon?: string }>;
	current: number;
}) {
	return (
		<div className={s.steps}>
			{steps.map((st, i) => (
				<div
					key={st.label}
					className={cx(
						s.step,
						i === current && s.stepOn,
						i < current && s.stepDone,
					)}
				>
					{i < steps.length - 1 && <span className={s.stepLine} />}
					<span className={s.stepDot}>
						{i < current ? (
							<i className="bi bi-check-lg" />
						) : st.icon ? (
							<i className={`bi ${st.icon}`} />
						) : (
							i + 1
						)}
					</span>
					<span className={s.stepLabel}>{st.label}</span>
				</div>
			))}
		</div>
	);
}

export function EmptyState({
	icon,
	title,
	text,
	action,
}: {
	icon: string;
	title: string;
	text?: string;
	action?: ReactNode;
}) {
	return (
		<div className={s.empty}>
			<div className={s.emptyIcon}>
				<i className={`bi ${icon}`} />
			</div>
			<div className={s.cardTitle}>{title}</div>
			{text && (
				<p className={cx(s.tiny)} style={{ margin: "0.35rem 0 0.9rem" }}>
					{text}
				</p>
			)}
			{action}
		</div>
	);
}

/* ==========================================================================
 * MODAL
 * ======================================================================== */
export function Modal({
	open,
	onClose,
	title,
	sub,
	icon,
	tone = "green",
	size,
	footer,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: ReactNode;
	sub?: ReactNode;
	icon?: string;
	tone?: Tone;
	size?: "sm" | "lg";
	footer?: ReactNode;
	children: ReactNode;
}) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;
	return (
		<div className={s.modalLayer} role="dialog" aria-modal="true">
			<button
				type="button"
				aria-label="Close dialog"
				className={s.modalBackdrop}
				onClick={onClose}
			/>
			<div
				className={cx(
					s.modalCard,
					size === "sm" && s.modalSm,
					size === "lg" && s.modalLg,
				)}
			>
				<div className={s.modalHead}>
					{icon && <Tile icon={icon} tone={tone} size="sm" />}
					<div className={s.grow}>
						<div className={s.modalTitle}>{title}</div>
						{sub && <div className={s.tiny}>{sub}</div>}
					</div>
					<button
						type="button"
						className={s.modalClose}
						aria-label="Close"
						onClick={onClose}
					>
						<i className="bi bi-x-lg" />
					</button>
				</div>
				<div className={s.modalBody}>{children}</div>
				{footer && <div className={s.modalFoot}>{footer}</div>}
			</div>
		</div>
	);
}

/* ==========================================================================
 * OTP + PIN
 * ======================================================================== */
export function OtpInput({
	length = 6,
	value,
	onChange,
	onComplete,
	invalid,
}: {
	length?: number;
	value: string;
	onChange: (v: string) => void;
	onComplete?: (v: string) => void;
	invalid?: boolean;
}) {
	const refs = useRef<Array<HTMLInputElement | null>>([]);
	const id = useId();

	const setAt = (i: number, char: string) => {
		const next = (
			value.padEnd(length, " ").slice(0, i) +
			char +
			value.padEnd(length, " ").slice(i + 1)
		)
			.replace(/\s/g, " ")
			.trimEnd();
		const clean = next.replace(/\s/g, "");
		onChange(clean);
		if (char && i < length - 1) refs.current[i + 1]?.focus();
		if (clean.length === length) onComplete?.(clean);
	};

	return (
		<div className={cx(s.otp, invalid && s.shake)}>
			{Array.from({ length }).map((_, i) => (
				<input
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length OTP boxes
					key={`${id}-${i}`}
					ref={(el) => {
						refs.current[i] = el;
					}}
					className={cx(
						s.otpBox,
						value[i] && s.otpFilled,
						invalid && s.inputErr,
					)}
					inputMode="numeric"
					maxLength={1}
					value={value[i] ?? ""}
					aria-label={`Digit ${i + 1}`}
					onChange={(e) => {
						const char = e.target.value.replace(/\D/g, "").slice(-1);
						setAt(i, char);
					}}
					onKeyDown={(e) => {
						if (e.key === "Backspace" && !value[i] && i > 0)
							refs.current[i - 1]?.focus();
					}}
					onPaste={(e) => {
						e.preventDefault();
						const text = e.clipboardData
							.getData("text")
							.replace(/\D/g, "")
							.slice(0, length);
						if (!text) return;
						onChange(text);
						if (text.length === length) onComplete?.(text);
						refs.current[Math.min(text.length, length - 1)]?.focus();
					}}
				/>
			))}
		</div>
	);
}

export function PinPad({
	length = 6,
	value,
	onChange,
	onComplete,
	invalid,
	onBiometric,
}: {
	length?: number;
	value: string;
	onChange: (v: string) => void;
	onComplete?: (v: string) => void;
	invalid?: boolean;
	onBiometric?: () => void;
}) {
	const press = useCallback(
		(key: string) => {
			if (key === "del") {
				onChange(value.slice(0, -1));
				return;
			}
			if (key === "bio") {
				onBiometric?.();
				return;
			}
			if (value.length >= length) return;
			const next = value + key;
			onChange(next);
			if (next.length === length) onComplete?.(next);
		},
		[value, length, onChange, onComplete, onBiometric],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (/^\d$/.test(e.key)) press(e.key);
			else if (e.key === "Backspace") press("del");
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [press]);

	const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "del"];
	return (
		<div>
			<div className={cx(s.pinDots, invalid && s.shake)}>
				{Array.from({ length }).map((_, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length dots
						key={i}
						className={cx(s.pinDot, i < value.length && s.pinDotOn)}
					/>
				))}
			</div>
			<div className={s.pad}>
				{keys.map((k) => (
					<button
						key={k}
						type="button"
						className={cx(
							s.padKey,
							(k === "bio" || k === "del") && s.padAction,
						)}
						onClick={() => press(k)}
						aria-label={
							k === "bio" ? "Use biometrics" : k === "del" ? "Delete" : k
						}
					>
						{k === "bio" ? (
							<i className="bi bi-person-bounding-box" />
						) : k === "del" ? (
							<i className="bi bi-backspace" />
						) : (
							k
						)}
					</button>
				))}
			</div>
		</div>
	);
}

/* ==========================================================================
 * Small helpers used across pages
 * ======================================================================== */
export function useCountdown(initial = 0) {
	const [left, setLeft] = useState(initial);
	useEffect(() => {
		if (left <= 0) return;
		const id = window.setInterval(
			() => setLeft((v) => (v <= 1 ? 0 : v - 1)),
			1000,
		);
		return () => window.clearInterval(id);
	}, [left]);
	return [left, setLeft] as const;
}

export function mmss(total: number) {
	const m = Math.floor(total / 60);
	const sec = total % 60;
	return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Navigate while keeping every legacy route/link intact. */
export function go(path: string) {
	if (typeof window !== "undefined") window.location.assign(path);
}

export function useDeviceLabel() {
	const [label, setLabel] = useState("Detecting device…");
	useEffect(() => {
		const ua = navigator.userAgent;
		let browser = "Browser";
		let os = "device";
		if (/Edg/i.test(ua)) browser = "Edge";
		else if (/Chrome/i.test(ua)) browser = "Chrome";
		else if (/Firefox/i.test(ua)) browser = "Firefox";
		else if (/Safari/i.test(ua)) browser = "Safari";
		if (/Windows/i.test(ua)) os = "Windows";
		else if (/Android/i.test(ua)) os = "Android";
		else if (/iPhone|iPad/i.test(ua)) os = "iOS";
		else if (/Mac/i.test(ua)) os = "macOS";
		else if (/Linux/i.test(ua)) os = "Linux";
		setLabel(`${browser} on ${os} · Nairobi, KE`);
	}, []);
	return label;
}
