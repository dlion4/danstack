import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ModalSize = "md" | "lg" | "xl" | "fullscreen";

interface ModalFrameProps {
	active: string | null;
	id: string;
	title: ReactNode;
	icon?: string;
	size?: ModalSize;
	onClose: () => void;
	styles: Record<string, string>;
	children: ReactNode;
	footer?: ReactNode;
}

/** React replacement for Bootstrap's imperative modal plugin. */
export function ModalFrame({
	active,
	id,
	title,
	icon,
	size = "md",
	onClose,
	styles: s,
	children,
	footer,
}: ModalFrameProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (active !== id) return undefined;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		window.setTimeout(() => dialogRef.current?.focus(), 0);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [active, id, onClose]);

	if (active !== id || typeof document === "undefined") return null;

	const widthClass =
		size === "lg"
			? s.modalBoxLg
			: size === "xl"
				? s.modalBoxXl
				: size === "fullscreen"
					? s.modalBoxFullscreen
					: "";

	return createPortal(
		<>
			<button
				type="button"
				className={s.backdrop}
				onClick={onClose}
				aria-label="Close dialog"
			/>
			<div className={s.modalWrap} role="presentation">
				<div
					ref={dialogRef}
					className={`${s.modalBox} ${widthClass}`}
					role="dialog"
					aria-modal="true"
					aria-labelledby={`${id}-title`}
					tabIndex={-1}
				>
					<div className={s.modalHeader}>
						<h2 id={`${id}-title`} className={s.modalTitle}>
							{icon ? <i className={`bi ${icon}`} aria-hidden="true" /> : null}
							{title}
						</h2>
						<button
							type="button"
							className={s.closeButton}
							onClick={onClose}
							aria-label="Close"
						>
							<i className="bi bi-x-lg" aria-hidden="true" />
						</button>
					</div>
					<div className={s.modalBody}>{children}</div>
					{footer ? <div className={s.modalFooter}>{footer}</div> : null}
				</div>
			</div>
		</>,
		document.body,
	);
}

export function BusyOverlay({
	styles: s,
	label = "Processing…",
}: {
	styles: Record<string, string>;
	label?: string;
}) {
	return (
		<output className={s.loadingOverlay} aria-live="polite">
			<span className={s.spinner} aria-hidden="true" />
			<strong>{label}</strong>
		</output>
	);
}

export function Receipt({
	styles: s,
	title = "Success",
	message,
	reference,
}: {
	styles: Record<string, string>;
	title?: string;
	message: string;
	reference?: string;
}) {
	return (
		<output className={s.receipt} aria-live="polite">
			<span className={s.receiptIcon}>
				<i className="bi bi-check-lg" aria-hidden="true" />
			</span>
			<h3>{title}</h3>
			<p>{message}</p>
			{reference ? <code>{reference}</code> : null}
		</output>
	);
}

export function Stepper({
	labels,
	current,
	styles: s,
}: {
	labels: string[];
	current: number;
	styles: Record<string, string>;
}) {
	return (
		<nav
			className={s.stepper}
			aria-label={`Step ${current} of ${labels.length}`}
		>
			{labels.map((label, index) => {
				const number = index + 1;
				const done = number < current;
				const active = number === current;
				return (
					<div className={s.stepSlot} key={label}>
						<div
							className={`${s.step} ${done ? s.stepDone : ""} ${active ? s.stepActive : ""}`}
						>
							<span className={s.stepNumber}>
								{done ? <i className="bi bi-check" /> : number}
							</span>
							<span className={s.stepLabel}>{label}</span>
						</div>
						{number < labels.length ? <span className={s.stepLine} /> : null}
					</div>
				);
			})}
		</nav>
	);
}

export function CopyButton({
	value,
	styles: s,
	label = "Copy",
}: {
	value: string;
	styles: Record<string, string>;
	label?: string;
}) {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(timerRef.current), []);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = value;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopied(true);
		timerRef.current = window.setTimeout(() => setCopied(false), 1600);
	};

	return (
		<button
			type="button"
			className={`${s.button} ${s.buttonSm}`}
			onClick={copy}
		>
			<i className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`} />
			{copied ? "Copied" : label}
		</button>
	);
}

export function CodeBlock({
	code,
	styles: s,
	copy = true,
}: {
	code: string;
	styles: Record<string, string>;
	copy?: boolean;
}) {
	return (
		<div className={s.codeBlock}>
			{copy ? (
				<span className={s.codeCopy}>
					<CopyButton value={code} styles={s} />
				</span>
			) : null}
			<pre>{code}</pre>
		</div>
	);
}

export function downloadText(
	filename: string,
	content: string,
	type = "text/plain;charset=utf-8",
) {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

export interface AsyncResult {
	message: string;
	reference?: string;
}

/**
 * Bridges legacy setTimeout + innerHTML success swaps with declarative React
 * state. Timer refs are cleaned when a component unmounts.
 */
export function useAsyncActions() {
	const [busyId, setBusyId] = useState<string | null>(null);
	const [results, setResults] = useState<Record<string, AsyncResult>>({});
	const timers = useRef<Set<number>>(new Set());

	useEffect(
		() => () => {
			timers.current.forEach((id) => {
				window.clearTimeout(id);
			});
			timers.current.clear();
		},
		[],
	);

	const run = (id: string, result: AsyncResult, delay = 650) => {
		setBusyId(id);
		const timer = window.setTimeout(() => {
			setBusyId(null);
			setResults((current) => ({ ...current, [id]: result }));
			timers.current.delete(timer);
		}, delay);
		timers.current.add(timer);
	};

	const clear = (id?: string) => {
		setBusyId(null);
		if (id) {
			setResults((current) => {
				const next = { ...current };
				delete next[id];
				return next;
			});
		} else {
			setResults({});
		}
	};

	return { busyId, results, run, clear };
}
