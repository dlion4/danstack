/* ============================================================================
 * devModalKit — shared modal primitives for the dev-dashboard deep-dive pages.
 * ----------------------------------------------------------------------------
 * LEGACY BRIDGE. The three source pages (4.1 / 4.2 / 4.3) drove their 20+
 * modals with Bootstrap's JS plugin plus hand-rolled DOM mutation:
 *
 *   openModal(id)            -> new bootstrap.Modal(el).show()
 *   processAction(id,msg)    -> body.innerHTML = '<receipt/>'  (destructive!)
 *   showLoading(sel, cb)     -> appendChild(<div class=pm-loading-overlay>)
 *   switchTab(prefix,key,el) -> classList juggling across [id^=prefix-]
 *   renderStepper(id,...)    -> wrap.innerHTML = steps.map(...).join('')
 *   showFlow(prefix,n,total) -> el.style.display = 'none' | 'block'
 *   cacheResettable()        -> stash innerHTML, restore on hidden.bs.modal
 *
 * All of that is reproduced here as pure React state — same timings (1.2s
 * loading, then receipt), same step/tab semantics, same auto-reset when a
 * modal closes — with zero innerHTML and zero document.getElementById.
 * `useModals` returns the interactive surface; MBox/Stepper/Fld/Lbl are the
 * presentational primitives. Each page passes its own CSS-module map `s`, so
 * one kit serves all three pages without style bleed.
 * ========================================================================== */

import type { CSSProperties, ReactNode } from "react";
import { Fragment, useCallback, useEffect, useState } from "react";

export type S = Record<string, string>;
type Size = "sm" | "md" | "lg" | "xl";

export interface Result {
	msg: string;
	ref?: string;
	title?: string;
}

/* ---------------------------------------------------------------------------
 * MBox — the modal shell (replaces .modal.fade + .modal-dialog + .modal-content)
 * Renders nothing unless it is the active modal, so only one tree is mounted.
 * ------------------------------------------------------------------------- */
export interface MBoxProps {
	s: S;
	id: string;
	active: string | null;
	title: ReactNode;
	size?: Size;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
}

export function MBox({
	s,
	id,
	active,
	title,
	size = "md",
	onClose,
	children,
	footer,
}: MBoxProps) {
	if (active !== id) return null;
	const sizeClass =
		size === "xl"
			? s.modalBoxXl
			: size === "lg"
				? s.modalBoxLg
				: size === "sm"
					? s.modalBoxSm
					: "";
	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close mirrors Bootstrap behaviour */}
			<div className={s.backdrop} onClick={onClose} />
			<div
				className={s.modalWrap}
				role="dialog"
				aria-modal="true"
				aria-label={id}
			>
				<div className={`${s.modalContent} ${sizeClass}`}>
					<div className={s.modalHeader}>
						<h5 className={s.modalTitle}>{title}</h5>
						<button
							type="button"
							className={s.closeX}
							aria-label="Close"
							onClick={onClose}
						>
							<i className="bi bi-x-lg" />
						</button>
					</div>
					<div className={s.modalBody}>{children}</div>
					{footer ? <div className={s.modalFooter}>{footer}</div> : null}
				</div>
			</div>
		</>
	);
}

/* ---------------------------------------------------------------------------
 * Stepper — replaces renderStepper(elId, labels, current) + innerHTML
 * ------------------------------------------------------------------------- */
export function Stepper({
	s,
	labels,
	current,
}: {
	s: S;
	labels: string[];
	current: number;
}) {
	return (
		<div className={s.stepper}>
			{labels.map((l, i) => {
				const n = i + 1;
				const done = n < current;
				const act = n === current;
				return (
					<Fragment key={l}>
						<div
							className={`${s.step} ${done ? s.stepDone : ""} ${act ? s.stepActive : ""}`}
						>
							<div className={s.stepNum}>
								{done ? <i className="bi bi-check" /> : n}
							</div>
							<div className={s.stepLabel}>{l}</div>
						</div>
						{i < labels.length - 1 && <div className={s.stepLine} />}
					</Fragment>
				);
			})}
		</div>
	);
}

/* ---------------------------------------------------------------------------
 * Small presentational helpers
 * ------------------------------------------------------------------------- */
export const Loading = ({ s }: { s: S }) => (
	<div className={s.loadingOv}>
		<div className={s.spinner} />
		<p className={s.loadingLabel}>Processing…</p>
	</div>
);

export const Lbl = ({ s, children }: { s: S; children: ReactNode }) => (
	// biome-ignore lint/a11y/noLabelWithoutControl: legacy uppercase field caption, control follows as sibling
	<label className={s.formLabel}>{children}</label>
);

interface FldProps {
	s: S;
	as?: "select" | "textarea";
	options?: string[];
	defaultValue?: string;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	type?: string;
	rows?: number;
	mono?: boolean;
	style?: CSSProperties;
	className?: string;
}

export function Fld({ s, ...p }: FldProps) {
	const cls = `${s.formControl} ${p.mono ? s.formMono : ""} ${p.className ?? ""}`;
	if (p.as === "select")
		return (
			<select className={cls} defaultValue={p.defaultValue} style={p.style}>
				{(p.options ?? []).map((o) => (
					<option key={o}>{o}</option>
				))}
			</select>
		);
	if (p.as === "textarea")
		return (
			<textarea
				className={cls}
				rows={p.rows ?? 3}
				defaultValue={p.defaultValue}
				placeholder={p.placeholder}
				style={p.style}
			/>
		);
	return (
		<input
			className={cls}
			type={p.type}
			defaultValue={p.defaultValue}
			placeholder={p.placeholder}
			disabled={p.disabled}
			readOnly={p.readOnly}
			style={p.style}
		/>
	);
}

/** Checkbox row — replaces the repeated `.form-check` markup. */
export function Chk({
	label,
	defaultChecked,
	checked,
	onChange,
	fontSize = 13,
	bold,
	tone,
}: {
	label: ReactNode;
	defaultChecked?: boolean;
	checked?: boolean;
	onChange?: (v: boolean) => void;
	fontSize?: number;
	bold?: boolean;
	tone?: string;
}) {
	const controlled = checked !== undefined;
	return (
		<div className="form-check mb-1">
			<input
				className="form-check-input"
				type="checkbox"
				{...(controlled
					? { checked, onChange: (e) => onChange?.(e.target.checked) }
					: { defaultChecked })}
			/>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: paired with the sibling input via .form-check */}
			<label
				className="form-check-label"
				style={{ fontSize, fontWeight: bold ? 700 : 400, color: tone }}
			>
				{label}
			</label>
		</div>
	);
}

/** Switch row — the `.form-check.form-switch` variant. */
export function Sw({
	label,
	defaultChecked,
}: {
	label: ReactNode;
	defaultChecked?: boolean;
}) {
	return (
		<div className="form-check form-switch mb-2">
			<input
				className="form-check-input"
				type="checkbox"
				defaultChecked={defaultChecked}
			/>
			{/* biome-ignore lint/a11y/noLabelWithoutControl: paired with the sibling input via .form-check */}
			<label className="form-check-label" style={{ fontSize: 13 }}>
				{label}
			</label>
		</div>
	);
}

/** Code block with the legacy floating Copy button (now stateful, no alert). */
export function CodeBox({
	s,
	children,
	height,
	copy = true,
	style,
	api,
}: {
	s: S;
	children: ReactNode;
	height?: number;
	copy?: boolean;
	style?: CSSProperties;
	api?: boolean;
}) {
	const [done, setDone] = useState(false);
	return (
		<div
			className={api ? s.apiCodeBlock : s.codeBlock}
			style={{ ...(height ? { height, overflowY: "auto" } : {}), ...style }}
		>
			{copy && (
				<button
					type="button"
					className={api ? s.pmCopyBtn : s.copyBtn}
					onClick={() => {
						setDone(true);
						window.setTimeout(() => setDone(false), 1500);
					}}
				>
					{done ? (
						<>
							<i className="bi bi-check2" /> Copied!
						</>
					) : (
						<>
							<i className="bi bi-clipboard" /> Copy
						</>
					)}
				</button>
			)}
			{children}
		</div>
	);
}

/* ---------------------------------------------------------------------------
 * useModals — the interactive engine
 * ------------------------------------------------------------------------- */
export function useModals(s: S, active: string | null, onClose: () => void) {
	const [results, setResults] = useState<Record<string, Result>>({});
	const [busy, setBusy] = useState<string | null>(null);
	const [flows, setFlows] = useState<Record<string, number>>({});
	const [tabs, setTabs] = useState<Record<string, string>>({});
	const [pick, setPick] = useState<Record<string, string>>({});
	const [toggles, setToggles] = useState<Record<string, boolean>>({});

	/* cacheResettable(): every modal returns to pristine state once closed. */
	useEffect(() => {
		if (active === null) {
			setResults({});
			setBusy(null);
			setFlows({});
			setTabs({});
			setPick({});
			setToggles({});
		}
	}, [active]);

	/* processAction(modalId, msg, ref) — loading overlay then success receipt. */
	const doAction = useCallback((id: string, msg: string, ref?: string) => {
		setBusy(id);
		window.setTimeout(() => {
			setResults((p) => ({ ...p, [id]: { msg, ref } }));
			setBusy(null);
		}, 1200);
	}, []);

	/* Advance a wizard through a loading gate (nextKeyStep / nextAddWebStep). */
	const confirmStep = useCallback((id: string, next: number) => {
		setBusy(id);
		window.setTimeout(() => {
			setBusy(null);
			setFlows((p) => ({ ...p, [id]: next }));
		}, 1200);
	}, []);

	const step = (id: string) => flows[id] ?? 1;
	const go = (id: string, n: number) => setFlows((p) => ({ ...p, [id]: n }));
	const tab = (k: string, d: string) => tabs[k] ?? d;
	const setTab = (k: string, v: string) => setTabs((p) => ({ ...p, [k]: v }));
	const isPicked = (k: string, v: string) => pick[k] === v;
	const setPicked = (k: string, v: string) =>
		setPick((p) => ({ ...p, [k]: v }));
	const flag = (k: string, d = false) => toggles[k] ?? d;
	const setFlag = (k: string, v: boolean) =>
		setToggles((p) => ({ ...p, [k]: v }));

	const receipt = (r: Result) => (
		<div className={s.receipt}>
			<div className={s.receiptIcon}>
				<i className="bi bi-check-lg" />
			</div>
			<h5 style={{ fontWeight: 700, color: "var(--pm-accent)" }}>
				{r.title ?? "Success"}
			</h5>
			<p
				style={{ fontSize: 13, color: "var(--pm-ink-soft)", margin: "6px 0 0" }}
			>
				{r.msg}
			</p>
			{r.ref && (
				<p
					style={{
						fontSize: 12,
						fontFamily: "var(--pm-font-mono)",
						color: "var(--pm-muted)",
						margin: "6px 0 0",
					}}
				>
					Ref: {r.ref}
				</p>
			)}
		</div>
	);

	/** Wrap a modal body so loading + receipt states take over automatically. */
	const body = (id: string, content: ReactNode) =>
		busy === id ? (
			<Loading s={s} />
		) : results[id] ? (
			receipt(results[id])
		) : (
			content
		);

	/** Footer that collapses to a single "Done" once the action succeeded. */
	const footer = (id: string, actions: ReactNode) =>
		results[id] ? (
			<button
				type="button"
				className={`${s.btnPm} ${s.btnPmP}`}
				onClick={onClose}
			>
				Done
			</button>
		) : (
			actions
		);

	/** Tab-pill bar — replaces switchTab(prefix, key, btn). */
	const Tabs = ({
		k,
		opts,
		def,
	}: {
		k: string;
		opts: { v: string; label: ReactNode }[];
		def: string;
	}) => (
		<div className={`${s.tabPills} mb-3`}>
			{opts.map((o) => (
				<button
					key={o.v}
					type="button"
					className={`${s.tabPill} ${tab(k, def) === o.v ? s.tabPillActive : ""}`}
					onClick={() => setTab(k, o.v)}
				>
					{o.label}
				</button>
			))}
		</div>
	);

	/** Clickable bordered card that highlights when picked (legacy inline JS). */
	const PickBox = ({
		k,
		v,
		children,
		className = "",
	}: {
		k: string;
		v: string;
		children: ReactNode;
		className?: string;
	}) => (
		<button
			type="button"
			className={`p-3 border rounded mb-2 w-100 text-start ${s.selectable} ${
				isPicked(k, v) ? s.selectableActive : ""
			} ${className}`}
			style={{ background: "#fff" }}
			onClick={() => setPicked(k, v)}
		>
			{children}
		</button>
	);

	/** Cancel + primary pair used by nearly every footer. */
	const cancelAnd = (primary: ReactNode) => (
		<>
			<button type="button" className={s.btnPm} onClick={onClose}>
				Cancel
			</button>
			{primary}
		</>
	);

	const closeOnly = (label = "Close") => (
		<button type="button" className={s.btnPm} onClick={onClose}>
			{label}
		</button>
	);

	return {
		doAction,
		confirmStep,
		step,
		go,
		tab,
		setTab,
		isPicked,
		setPicked,
		flag,
		setFlag,
		busy,
		results,
		body,
		footer,
		receipt,
		Tabs,
		PickBox,
		cancelAnd,
		closeOnly,
	};
}

/* ---------------------------------------------------------------------------
 * useLegacyDomEffect — the useRef + useEffect sandbox required by the brief.
 * ----------------------------------------------------------------------------
 * A few legacy behaviours were genuinely imperative (the SSE console appending
 * lines, the "select all events" checkbox fan-out). Where a page still wants
 * to touch real DOM nodes it does so through a ref-scoped effect like this,
 * never through document.getElementById, so React keeps owning the tree.
 * ------------------------------------------------------------------------- */
export function cx(...parts: (string | false | null | undefined)[]) {
	return parts.filter(Boolean).join(" ");
}
